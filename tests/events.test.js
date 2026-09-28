import './helpers/utc.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, alertReason, blockReason, createScript, eventMinutesLeft, hibernateBlockReason, tick, mulberry32, CFG, MIN } from '../src/sim.js';
import { cleanSave } from '../src/sanitize.js';

// Noon UTC so the pet starts awake (tests run with TZ=UTC).
const T0 = Date.UTC(2026, 8, 26, 12, 0);
const noRng = () => 0.999;

function booted() {
  const s = createScript({ now: T0, rng: mulberry32(1) });
  s.quirk.sleepOffset = 0;
  s.trait = null;
  tick(s, T0 + CFG.bootMinutes * MIN, noRng);
  return s;
}
// Replays the given rolls, then never fires again.
const rolls = (...seq) => () => (seq.length ? seq.shift() : 0.999);

test('an intrusion can start while it is awake and not infected', () => {
  const s = booted();
  tick(s, s.lastTick + MIN, rolls(0.999, 0.999, 0)); // no random infection, no trace, then the attack roll fires
  assert.equal(s.event?.type, 'attack');
  assert.match(s.log.at(-1).msg, /intrusion attempt/);
  assert.equal(eventMinutesLeft(s), CFG.attackWindowMin);
  assert.equal(alertReason(s).key, 'attack');
});

test('an active antivirus shield bounces an intrusion', () => {
  const s = booted();
  s.buffs.shieldUntilAge = s.ageMin + 60;
  tick(s, s.lastTick + MIN, rolls(0.999, 0)); // shielded: no infection roll; no trace, then the attack roll fires
  assert.equal(s.event, null);
  assert.match(s.log.at(-1).msg, /bounced off the antivirus shield/);
});

test('DEFEND: a win repels it; a loss installs a virus', () => {
  const won = booted();
  const lost = booted();
  for (const s of [won, lost]) s.event = { type: 'attack', startedAge: s.ageMin };
  const stab = won.axes.stability;
  assert.equal(act(won, 'defend', won.lastTick, noRng, { won: true }).ok, true);
  assert.equal(won.event, null);
  assert.equal(won.virus, false);
  assert.equal(won.axes.stability, stab + CFG.attackRepelledStability);
  const integrity = lost.stats.integrity;
  act(lost, 'defend', lost.lastTick, noRng, { won: false });
  assert.equal(lost.event, null);
  assert.equal(lost.virus, true);
  assert.equal(lost.stats.integrity, integrity - CFG.attackLandedIntegrity);
  assert.match(blockReason(booted(), 'defend'), /no intrusion/);
});

test('an ignored intrusion lands when its window runs out', () => {
  const s = booted();
  s.event = { type: 'attack', startedAge: s.ageMin };
  tick(s, s.lastTick + (CFG.attackWindowMin - 1) * MIN, noRng);
  assert.equal(s.event?.type, 'attack');
  tick(s, s.lastTick + MIN, noRng);
  assert.equal(s.event, null);
  assert.equal(s.virus, true);
  assert.match(s.log.at(-1).msg, /intrusion landed/);
});

test('PURGE contains a memory overflow, even with no cache files', () => {
  const s = booted();
  s.cache = 0;
  s.event = { type: 'overflow', startedAge: s.ageMin };
  const res = act(s, 'purge', s.lastTick);
  assert.equal(res.ok, true);
  assert.match(res.msg, /overflow contained/);
  assert.equal(s.event, null);
});

test('an ignored overflow crashes it: Integrity hit, cache full, reboot blocks actions', () => {
  const s = booted();
  s.cache = 1;
  s.stats.charge = 50;
  s.event = { type: 'overflow', startedAge: s.ageMin };
  tick(s, s.lastTick + CFG.overflowWindowMin * MIN, noRng);
  assert.equal(s.event, null);
  assert.equal(s.cache, CFG.maxCache);
  assert.match(s.log.at(-1).msg, /crashed/);
  assert.match(blockReason(s, 'corp'), /rebooting/);
  assert.equal(blockReason(s, 'lights'), null);
  assert.match(hibernateBlockReason(s, s.lastTick), /rebooting/);
  tick(s, s.lastTick + CFG.rebootMin * MIN, noRng);
  assert.equal(blockReason(s, 'corp'), null);
});

test('overflows get likelier with cache files', () => {
  const chance = (cache) => {
    let hits = 0;
    for (let i = 0; i < 400; i++) {
      const s = booted();
      s.cache = cache;
      s.sinceFed = CFG.digestMinutes; // no new cache files during the test
      tick(s, s.lastTick + 12 * 60 * MIN, mulberry32(i + 7));
      if (s.log.some((e) => /memory overflow/.test(e.msg))) hits++;
    }
    return hits;
  };
  assert.ok(chance(4) > chance(0) * 2, 'cache files barely matter');
});

test('any timed event blocks hibernation', () => {
  const s = booted();
  s.event = { type: 'overflow', startedAge: s.ageMin };
  assert.match(hibernateBlockReason(s, s.lastTick), /memory overflow/);
});

test('stored intrusions, overflows and reboots survive loading; unknown events do not', () => {
  const s = booted();
  s.event = { type: 'attack', startedAge: s.ageMin };
  s.rebootUntilAge = s.ageMin + 5;
  const loaded = cleanSave(JSON.parse(JSON.stringify(s)), s.lastTick);
  assert.deepEqual(loaded.event, s.event);
  assert.equal(loaded.rebootUntilAge, s.rebootUntilAge);
  assert.equal(cleanSave({ ...JSON.parse(JSON.stringify(s)), event: { type: 'meteor', startedAge: 1 } }, s.lastTick).event, null);
});

test('an intrusion holds its timer while it is being defended, then lands or clears normally', () => {
  const s = booted();
  s.event = { type: 'attack', startedAge: s.ageMin };
  s.event.defending = true;
  tick(s, s.lastTick + (CFG.attackWindowMin + 30) * MIN, noRng);
  assert.equal(s.event.type, 'attack', 'still open after the window: the defense is running');
  assert.equal(eventMinutesLeft(s), CFG.attackWindowMin);
  assert.equal(s.virus, false);
  const res = act(s, 'defend', s.lastTick, noRng, { won: true });
  assert.ok(res.ok);
  assert.equal(s.event, null);
});

test('the defending flag is never trusted from storage', () => {
  const s = booted();
  s.event = { type: 'attack', startedAge: s.ageMin, defending: true };
  const clean = cleanSave(JSON.parse(JSON.stringify(s)), s.lastTick);
  assert.equal(clean.event.defending, undefined);
});
