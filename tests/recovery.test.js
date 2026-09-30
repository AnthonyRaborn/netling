import './helpers/utc.js';
// Day-1 playtest balance: Integrity recovery, quiet nights, visitors and the netrun cooldown.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createScript, eventMinutesLeft, itemBlockReason, runCooldownLeft, tick, mulberry32, CFG, MIN } from '../src/sim.js';
import { startRun, jackOut, disconnect, runBlockReason } from '../src/netrun/run.js';
import { cleanSave } from '../src/sanitize.js';

// Tests run with TZ=UTC: noon is awake, 23:00 is asleep.
const NOON = Date.UTC(2026, 8, 26, 12, 0);
const NIGHT = Date.UTC(2026, 8, 26, 23, 0);
const noRng = () => 0.999;
const always = () => 0;
// Replays the given rolls, then never fires again.
const rolls = (...seq) => () => (seq.length ? seq.shift() : 0.999);

function booted(at = NOON) {
  const s = createScript({ now: at, rng: mulberry32(1) });
  s.quirk.sleepOffset = 0;
  s.trait = null;
  tick(s, at + (CFG.bootMinutes + 1) * MIN, noRng); // one step past boot, so it has settled into sleep at night
  return s;
}
const hours = (s, h, rng = noRng) => tick(s, s.lastTick + h * 60 * MIN, rng);
const close = (a, b) => assert.ok(Math.abs(a - b) < 0.01, `${a} != ${b}`);

test('integrity regenerates faster in real rest than awake or asleep with the lights on', () => {
  const awake = booted();
  awake.stats.integrity = 50;
  hours(awake, 1);
  close(awake.stats.integrity, 50 + CFG.integrityRegenPerHour);

  const dark = booted(NIGHT);
  assert.equal(dark.asleep, true);
  dark.lightsOn = false;
  dark.stats.integrity = 50;
  hours(dark, 1);
  close(dark.stats.integrity, 50 + CFG.integrityRestRegenPerHour);

  const lit = booted(NIGHT);
  lit.stats.integrity = 50;
  hours(lit, 1);
  close(lit.stats.integrity, 50 + CFG.integrityRegenPerHour);

  const napping = booted();
  assert.equal(act(napping, 'nap', napping.lastTick).ok, true);
  napping.stats.integrity = 50;
  hours(napping, 1);
  close(napping.stats.integrity, 50 + CFG.integrityRestRegenPerHour);
});

test('COOL and a PURGE that clears something restore integrity; a refused action does not', () => {
  const s = booted();
  s.stats.integrity = 50;
  s.stats.heat = 20;
  assert.equal(act(s, 'cool', s.lastTick).ok, false);
  assert.equal(act(s, 'purge', s.lastTick).ok, false);
  assert.equal(s.stats.integrity, 50);
  s.stats.heat = 60;
  assert.equal(act(s, 'cool', s.lastTick).ok, true);
  assert.equal(s.stats.integrity, 50 + CFG.careIntegrity);
  s.cache = 2;
  assert.equal(act(s, 'purge', s.lastTick).ok, true);
  assert.equal(s.stats.integrity, 50 + 2 * CFG.careIntegrity);
  s.event = { type: 'overflow', startedAge: s.ageMin };
  assert.equal(act(s, 'purge', s.lastTick).ok, true);
  assert.equal(s.stats.integrity, 50 + 3 * CFG.careIntegrity);
});

test('no virus or event starts while it sleeps, even when every roll would fire', () => {
  const s = booted(NIGHT);
  assert.equal(s.asleep, true);
  hours(s, 3, always);
  assert.equal(s.virus, false);
  assert.equal(s.event, null);
  assert.equal(s.visit, null);
});

test("an open event's timer holds overnight and resumes at wake-up", () => {
  const s = booted(Date.UTC(2026, 8, 26, 21, 30));
  s.event = { type: 'trace', startedAge: s.ageMin };
  tick(s, Date.UTC(2026, 8, 26, 22, 0), noRng);
  const left = eventMinutesLeft(s);
  assert.ok(left > 0);
  tick(s, Date.UTC(2026, 8, 27, 6, 59), noRng);
  assert.equal(s.asleep, true);
  assert.equal(eventMinutesLeft(s), left, 'frozen while asleep');
  assert.equal(s.event?.type, 'trace');
  tick(s, Date.UTC(2026, 8, 27, 7, 10), noRng);
  assert.equal(eventMinutesLeft(s), left - 11); // 07:00 through 07:10 count
});

test('a visitor plays for a few minutes: sync and heat rise, then it logs off', () => {
  const s = booted();
  // No infection, trace, intrusion, overflow or surge; then the visit fires with the shortest stay.
  tick(s, s.lastTick + MIN, rolls(0.999, 0.999, 0.999, 0.999, 0.999, 0, 0, 0, 0));
  assert.ok(s.visit, 'visitor arrived');
  assert.equal(s.visit.len, CFG.visitMinMin);
  assert.match(s.log.at(-1).msg, /pinged in/);
  const { sync, heat } = s.stats;
  tick(s, s.lastTick + CFG.visitMinMin * MIN, noRng);
  assert.equal(s.visit, null);
  assert.match(s.log.at(-1).msg, /logged off/);
  // Drains keep running meanwhile, so the gain is under the full amount by at most a full stat's drain.
  const maxDrain = (CFG.drainPerHour.sync * CFG.drainCurve.full * CFG.visitMinMin) / 60;
  assert.ok(s.stats.sync > sync + CFG.visitSync - maxDrain, `sync ${s.stats.sync}`);
  assert.ok(s.stats.heat > heat + CFG.visitHeat - 1, `heat ${s.stats.heat}`);
});

test('a visitor can leave an item, or rarely an accessory for the UI to pick', () => {
  const item = booted();
  item.visit = { startedAge: item.ageMin, len: 1, form: 'daemon', palette: 1 };
  // Rolls: infection, accessory, item, which item.
  tick(item, item.lastTick + MIN, rolls(0.999, 0.999, 0, 0));
  assert.equal(item.visit, null);
  assert.equal(item.inventory.length, 1);
  assert.match(item.log.at(-1).msg, /left a gift/);

  const acc = booted();
  acc.visit = { startedAge: acc.ageMin, len: 1, form: 'daemon', palette: 1 };
  tick(acc, acc.lastTick + MIN, rolls(0.999, 0));
  assert.equal(acc.visitAccGifts, 1);
  assert.match(acc.log.at(-1).msg, /stylish/);
});

test('a visitor leaves early when it naps, and survives a save round trip', () => {
  const s = booted();
  s.visit = { startedAge: s.ageMin, len: 10, form: 'glitch', palette: 2, accessories: [] };
  const back = cleanSave(JSON.parse(JSON.stringify(s)), s.lastTick);
  assert.deepEqual(back.visit, s.visit);
  assert.equal(cleanSave({ ...JSON.parse(JSON.stringify(s)), visit: { form: 'nope', startedAge: 1 } }, s.lastTick).visit, null);
  act(s, 'nap', s.lastTick);
  tick(s, s.lastTick + MIN, noRng);
  assert.equal(s.visit, null);
});

test('the uplink cooldown shortens with age and clean clears, never below the floor', () => {
  for (const [stage, base] of Object.entries(CFG.runCooldownMin)) {
    const s = booted();
    s.stage = stage;
    s.stats.charge = 90;
    startRun(s, 'public', mulberry32(4));
    s.run.tally.iceLost = 1;
    jackOut(s);
    assert.equal(runCooldownLeft(s), base, `${stage}: messy clear`);

    s.run = null;
    s.lastRunEndAge = null;
    startRun(s, 'public', mulberry32(4));
    jackOut(s);
    assert.equal(runCooldownLeft(s), Math.max(CFG.runCooldownFloorMin, base - CFG.runCleanCutMin), `${stage}: clean clear`);
    assert.match(s.run.messages.at(-1), /clean clear/);
  }
  const adult = booted();
  adult.stage = 'adult';
  adult.lastRunEndAge = adult.ageMin;
  adult.runCooldownCut = CFG.runCleanCutMin;
  assert.match(runBlockReason(adult), /cooling down, laying low from corp sweeps\. 2h left/);
});

test('a disconnect resets the clean-clear bonus', () => {
  const s = booted();
  s.runCooldownCut = CFG.runCleanCutMin;
  startRun(s, 'public', mulberry32(4));
  disconnect(s, 'test.');
  assert.equal(s.runCooldownCut, 0);
  assert.equal(runCooldownLeft(s), CFG.runCooldownMin.baby);
});

test('overclock chips cut the cooldown down to the floor, then refuse', () => {
  const s = booted();
  s.inventory = ['overclock', 'overclock', 'overclock'];
  assert.match(itemBlockReason(s, 0), /already open/);
  s.lastRunEndAge = s.ageMin;
  assert.equal(runCooldownLeft(s), 240);
  assert.equal(act(s, 'use', s.lastTick, noRng, { slot: 0 }).ok, true);
  assert.equal(runCooldownLeft(s), 180);
  assert.equal(act(s, 'use', s.lastTick, noRng, { slot: 0 }).ok, true);
  assert.equal(runCooldownLeft(s), 120);
  assert.match(itemBlockReason(s, 0), /laying low/);
  assert.equal(act(s, 'use', s.lastTick, noRng, { slot: 0 }).ok, false);
  assert.equal(s.inventory.length, 1, 'a refused chip is kept');
});

test('a repair kit restores 40 integrity and refuses at full', () => {
  const s = booted();
  s.inventory = ['repair', 'repair'];
  assert.match(itemBlockReason(s, 0), /already at 100/);
  s.stats.integrity = 30;
  assert.equal(act(s, 'use', s.lastTick, noRng, { slot: 0 }).ok, true);
  assert.equal(s.stats.integrity, 70);
});

test('most visitors wear a random accessory, half of them a second from another slot; props and earned items never show up', async () => {
  const { ACCESSORIES } = await import('../src/accessories.js');
  const worn = new Map(ACCESSORIES.map((x) => [x.id, x]));
  const rng = mulberry32(7);
  let dressed = 0;
  let two = 0;
  const seen = new Set();
  for (let i = 0; i < 400; i++) {
    const s = booted();
    // Force the visit roll; everything else comes from the seeded rng.
    tick(s, s.lastTick + MIN, rolls(0.999, 0.999, 0.999, 0.999, 0.999, 0, rng(), rng(), rng(), rng(), rng(), rng(), rng()));
    const list = s.visit.accessories;
    if (!list.length) continue;
    dressed++;
    if (list.length === 2) two++;
    assert.ok(list.length <= 2);
    for (const acc of list) {
      seen.add(acc);
      assert.ok(worn.has(acc), `${acc} is not a worn accessory`);
      assert.notEqual(worn.get(acc).source, 'earned');
    }
    if (list.length === 2) assert.notEqual(worn.get(list[0]).slot, worn.get(list[1]).slot, 'two from one slot');
    assert.match(s.log.find((e) => e.msg.includes("pinged in")).msg, new RegExp(`in a ${list.map((id) => worn.get(id).name.toLowerCase()).join(' and ')} pinged`));
  }
  assert.ok(dressed > 250 && dressed < 350, `dressed ${dressed}/400`);
  assert.ok(two > dressed * 0.35 && two < dressed * 0.65, `two items on ${two}/${dressed}`);
  assert.ok(seen.size > 5, 'a variety of accessories');
});

test("a visitor's accessories survive a save round trip; junk and a second item in one slot are dropped", () => {
  const s = booted();
  const back = (visit) => cleanSave(JSON.parse(JSON.stringify({ ...s, visit: { startedAge: s.ageMin, len: 10, form: 'glitch', palette: 2, ...visit } })), s.lastTick).visit;
  assert.deepEqual(back({ accessories: ['cap', 'shades'] }).accessories, ['cap', 'shades']);
  assert.deepEqual(back({ accessories: ['cap', 'crown', 'deck', 'nope', 7] }).accessories, ['cap'], 'one per slot, no props, no junk');
  assert.deepEqual(back({ accessories: 'cap' }).accessories, []);
  // A visit saved before visitors wore two kept one id as `accessory`.
  assert.deepEqual(back({ accessory: 'cap' }).accessories, ['cap']);
  assert.deepEqual(back({ accessory: 'deck' }).accessories, []);
});

test("a visitor never shares the host's palette", () => {
  const rng = mulberry32(3);
  for (let i = 0; i < 200; i++) {
    const s = booted();
    s.quirk.palette = i % 5;
    tick(s, s.lastTick + MIN, rolls(0.999, 0.999, 0.999, 0.999, 0.999, 0, rng(), rng(), rng(), rng(), rng()));
    assert.notEqual(s.visit.palette, s.quirk.palette);
    assert.ok(s.visit.palette >= 0 && s.visit.palette < 5);
  }
});
