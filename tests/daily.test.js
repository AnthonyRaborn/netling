import './helpers/utc.js';
// The daily trace: one seeded map a day, every roll seeded by node, nothing at stake, and a share line.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createScript, itemBlockReason, tick, mulberry32, runCooldownLeft, CFG, MIN } from '../src/sim.js';
import { DAILY, dailySeed, dayKey, dayNumber, isDayKey, shareText } from '../src/netrun/daily.js';
import { abortRun, choose, closeRun, moveTo, resolveIce, runBlockReason, runOptions, startRun } from '../src/netrun/run.js';
import { generateMap, nodeById } from '../src/netrun/map.js';
import { REGIONS } from '../src/netrun/regions.js';
import { unlockedIds } from '../src/cosmetics.js';
import { cleanProgress, cleanSave } from '../src/sanitize.js';
import { playRun, RUN_STYLES } from '../tools/netrun-bot.mjs';

const T0 = Date.UTC(2026, 9, 2, 12, 0);
const DAY = '2026-10-02';
const noRng = () => 0.999;

function adult(form = 'chrome') {
  const s = createScript({ now: T0, rng: mulberry32(1) });
  s.quirk.sleepOffset = 0;
  tick(s, T0 + CFG.bootMinutes * MIN, noRng);
  Object.assign(s, { stage: 'adult', form, teenForm: 'kernel' });
  Object.assign(s.stats, { charge: 90, sync: 80, integrity: 90, heat: 10 });
  s.scrip = 60;
  s.inventory = ['voucher', 'repair'];
  return s;
}
// What a daily run must leave as it found it.
const stakes = (s) => JSON.stringify({ stats: s.stats, axes: s.axes, scrip: s.scrip, inventory: s.inventory, careMistakes: s.careMistakes, cleared: s.cleared ?? [], runStats: s.runStats ?? null, lastRunEndAge: s.lastRunEndAge ?? null, codexFound: s.codexFound ?? 0, deepExits: s.deepExits ?? null });

test('the day: local date, numbered from the epoch, and a seed per date and rules version', () => {
  assert.equal(dayKey(T0), DAY);
  assert.equal(dayNumber(DAILY.epoch), 1);
  assert.equal(dayNumber(DAY), 2);
  assert.equal(dayNumber('2027-10-01'), 366);
  assert.equal(dailySeed(DAY), dailySeed(DAY));
  assert.notEqual(dailySeed(DAY), dailySeed('2026-10-03'));
  assert.notEqual(dailySeed(DAY, 1), dailySeed(DAY, 2), 'a new rules version is a new map');
  assert.ok(isDayKey(DAY) && !isDayKey('2026-13-45') && !isDayKey('today') && !isDayKey(20261002));
});

test('everyone gets the same map on the same date, whatever the rng or form', () => {
  const maps = ['chrome', 'ghost', 'daemon'].map((form, i) => {
    const s = adult(form);
    startRun(s, 'daily', mulberry32(i + 1), [], [], { day: DAY });
    return JSON.stringify(s.run.map);
  });
  assert.equal(new Set(maps).size, 1);
  const other = adult();
  startRun(other, 'daily', mulberry32(1), [], [], { day: '2026-10-03' });
  assert.notEqual(JSON.stringify(other.run.map), maps[0]);
  // Pinned: a change to generateMap, REGIONS.daily or the seed shows up here. Bump DAILY.rules when it does.
  const types = JSON.parse(maps[0]).nodes.map((n) => n.type[0] + (n.flavor ? n.flavor[0] : '')).join(' ');
  assert.equal(types, 'e c i i i i i i c r c i a i c mb a a c i c c e', `the ${DAY} map changed: bump DAILY.rules`);
  assert.equal(DAILY.rules, 1);
  assert.equal(JSON.parse(maps[0]).layerCount, REGIONS.daily.layers + 2);
});

test('every roll is seeded by node: the same route meets the same things, for any rng, and after a reload', () => {
  const walk = (s, rng, reloadAt = -1) => {
    for (let i = 0; i < 40 && s.run.phase !== 'done'; i++) {
      if (i === reloadAt) s = cleanSave(JSON.parse(JSON.stringify(s)), s.lastTick);
      if (s.run.phase === 'ice') resolveIce(s, i % 3 !== 0, rng);
      else if (s.run.phase === 'choice') choose(s, s.run.pending.options.find((o) => !o.disabled && o.id !== 'out').id, rng);
      else moveTo(s, runOptions(s.run).at(-1).id, rng);
    }
    return s.run.messages.join('\n');
  };
  const a = adult();
  startRun(a, 'daily', mulberry32(1), [], [], { day: DAY });
  const b = adult();
  startRun(b, 'daily', mulberry32(99), [], [], { day: DAY });
  const c = adult();
  startRun(c, 'daily', Math.random, [], [], { day: DAY });
  const la = walk(a, mulberry32(5));
  assert.equal(walk(b, mulberry32(77)), la);
  assert.equal(walk(c, Math.random, 6), la, 'a reload mid-run rolls the same');
});

test('every form meets the same ICE fight at a node', () => {
  const games = ['chrome', 'firewall', 'daemon', 'glitch'].map((form) => {
    const s = adult(form);
    startRun(s, 'daily', mulberry32(1), [], [], { day: DAY });
    s.run.freePhases = 9; // a Glitch past its free slips, so it meets the fight
    const ice = runOptions(s.run).find((n) => n.type === 'ice');
    const res = moveTo(s, ice.id, () => 0.999);
    return res.game;
  });
  assert.ok(games[0]);
  assert.equal(new Set(games).size, 1, games.join(' '));
});

test('nothing at stake: a disconnect, a checkpoint, a market and an abort leave the netling as it was', () => {
  for (let seed = 1; seed <= 30; seed++) {
    const s = adult(['chrome', 'firewall', 'ghost', 'daemon', 'glitch'][seed % 5]);
    s.lastRunEndAge = s.ageMin - 30; // the uplink is still cooling down from a real run
    const cooldown = runCooldownLeft(s);
    const before = stakes(s);
    playRun(s, { ...RUN_STYLES.careful, winRate: seed % 2 ? 0.2 : 0.8, day: DAY }, 'daily', mulberry32(seed));
    assert.equal(s.run.phase, 'done');
    assert.equal(stakes(s), before, `seed ${seed}: ${s.run.result}`);
    assert.equal(runCooldownLeft(s), cooldown, 'the cooldown is untouched');
    assert.equal((s.codexInbox ?? []).length + (s.accessoryInbox ?? []).length, 0, 'nothing found');
  }
  // A checkpoint paid with the voucher, and an abort.
  const s = adult('kernel');
  s.stage = 'teen';
  startRun(s, 'daily', noRng, [], [], { day: DAY });
  const before = stakes(s);
  const next = runOptions(s.run)[0];
  next.type = 'checkpoint';
  moveTo(s, next.id, noRng);
  choose(s, 'voucher', noRng);
  assert.ok(!s.inventory.includes('voucher'), 'spent during the run');
  abortRun(s);
  assert.equal(stakes(s), before, 'given back at the end');
});

test('a disconnect logs no care mistake, and the exit opens nothing', () => {
  const s = adult('firewall');
  s.stats.integrity = 1;
  startRun(s, 'daily', noRng, [], [], { day: DAY });
  const ice = runOptions(s.run).find((n) => n.type === 'ice');
  moveTo(s, ice.id, noRng);
  resolveIce(s, false, noRng);
  assert.equal(s.run.result, 'disconnected');
  assert.ok(!/care mistake/.test(s.run.messages.at(-1)));
  assert.equal(s.careMistakes, 0);
  assert.deepEqual(s.run.trail, ['>', 'x']);

  const w = adult();
  w.cleared = ['public'];
  playRun(w, { ...RUN_STYLES.skilled, winRate: 1, day: DAY }, 'daily', mulberry32(3));
  assert.equal(nodeById(w.run.map, w.run.pos).type, 'exit');
  assert.deepEqual(w.cleared, ['public'], 'the daily trace is no region to clear');
  assert.equal(w.run.trail.at(-1), '>');
  assert.equal(w.run.trail.length, w.run.visited.length);
});

test('items cannot be used from the inventory during a daily trace', () => {
  const s = adult();
  s.stats.integrity = 50;
  startRun(s, 'daily', noRng, [], [], { day: DAY });
  assert.equal(itemBlockReason(s, 1), 'no items on the daily trace.');
  const res = act(s, 'use', s.lastTick, noRng, { slot: 1 });
  assert.ok(!res.ok);
  assert.equal(res.msg, 'no items on the daily trace.');
  assert.deepEqual(s.inventory, ['voucher', 'repair']);
  assert.equal(s.stats.integrity, 50);
  abortRun(s);
  assert.equal(itemBlockReason(s, 1), 'no items on the daily trace.', 'still open until the summary closes');
  closeRun(s, s.lastTick);
  assert.equal(itemBlockReason(s, 1), null, 'usable again afterwards');
  // Other runs keep them.
  const o = adult();
  o.stats.integrity = 50;
  startRun(o, 'public', mulberry32(1));
  assert.ok(act(o, 'use', o.lastTick, noRng, { slot: 1 }).ok);
});

test('it opens during the cooldown, but not asleep, and has no challenges or contracts', () => {
  const s = adult();
  s.lastRunEndAge = s.ageMin;
  assert.match(runBlockReason(s, 'public'), /cooling down/);
  assert.equal(runBlockReason(s, 'daily'), null);
  const baby = adult();
  baby.stage = 'baby';
  assert.equal(runBlockReason(baby, 'daily'), null, 'any stage');
  s.nap = true;
  assert.match(runBlockReason(s, 'daily'), /napping/);
  const c = adult();
  c.contract = { kind: 'exit', region: 'public', scrip: 15, item: null, postedAge: c.ageMin };
  startRun(c, 'daily', noRng, [], [], { day: DAY, challenge: 'glass' });
  assert.equal(c.run.challenge, null);
  assert.ok(!c.run.contract && c.contract, 'the contract waits');
});

test('the share line', () => {
  const text = shareText({ key: DAY, trail: ['>', '#', '$', 'x', '+', '~', '>'], exit: true, result: 'jacked', layers: 9, reached: 9, who: 'Ghost', tally: { iceWon: 1, iceLost: 1, icePhased: 1 } });
  assert.equal(text, 'NETLING daily #2 (2026-10-02) r1\nEXIT 9/9  ICE 2/3  Ghost\n>#$x+~>');
  assert.match(shareText({ key: DAY, trail: ['>', 'x'], result: 'disconnected', layers: 9, reached: 1, who: 'Daemon' }), /\nDISCONNECTED 1\/9 .*\n>x!$/);
  assert.match(shareText({ key: DAY, trail: ['>'], result: 'aborted', layers: 9, reached: 0, who: 'Daemon' }), /\nABORTED 0\/9 .*\n>\.$/);
  assert.ok(!text.includes('—'));
});

test('stored daily fields are cleaned, and the seed always comes from the date', () => {
  const s = adult();
  startRun(s, 'daily', noRng, [], [], { day: DAY });
  moveTo(s, runOptions(s.run)[0].id, noRng);
  const raw = JSON.parse(JSON.stringify(s));
  raw.run.seed = 12345;
  raw.run.trail = ['>', 'Z', '#', 7, 'xx'];
  raw.run.stake.stats.charge = 'lots';
  raw.run.stake.taken = ['voucher', 'nope'];
  const kept = cleanSave(raw, s.lastTick).run;
  assert.equal(kept.daily, true);
  assert.equal(kept.seed, dailySeed(DAY));
  assert.deepEqual(kept.trail, ['>', '#']);
  assert.equal(kept.stake.stats.charge, 0);
  assert.deepEqual(kept.stake.taken, ['voucher']);
  raw.run.day = 'yesterday';
  assert.equal(cleanSave(raw, s.lastTick).run.day, DAILY.epoch);
  // An ordinary run gains none of it.
  const o = adult();
  startRun(o, 'public', mulberry32(1));
  assert.equal(cleanSave(JSON.parse(JSON.stringify(o)), o.lastTick).run.daily, undefined);

  assert.deepEqual(cleanProgress({ daily: { day: DAY, share: 'x'.repeat(400), exit: 'yes' }, dailyWins: -3 }).daily, { day: DAY, share: 'x'.repeat(300), exit: false });
  assert.equal(cleanProgress({ dailyWins: -3 }).dailyWins, 0);
  assert.equal(cleanProgress({ daily: { day: 'soon' } }).daily, undefined);
  assert.equal(cleanProgress({}).dailyWins, undefined);
});

test('ten exits earn the Uptime crest', () => {
  const ctx = (dailyWins) => ({ dex: [], codex: [], lineage: [], generation: 1, progress: { streaks: {}, acts: {}, dailyWins } });
  assert.ok(!unlockedIds(ctx(DAILY.winsForReward - 1)).includes('crest:uptime'));
  assert.ok(unlockedIds(ctx(DAILY.winsForReward)).includes('crest:uptime'));
  assert.equal(DAILY.winsForReward, 10);
});

test('the daily map draws from its own region only', () => {
  const map = generateMap('daily', mulberry32(dailySeed(DAY)));
  const kinds = new Set(map.nodes.map((n) => n.type));
  for (const k of kinds) assert.ok(k === 'entry' || k === 'exit' || REGIONS.daily.nodes[k], k);
});
