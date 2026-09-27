import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, blockReason, createScript, tick, mulberry32, napBlockReason, napMinutesLeft, CFG, MIN } from '../src/sim.js';
import { runBlockReason } from '../src/netrun/run.js';
import { cleanSave } from '../src/sanitize.js';

// Noon UTC, bedtime at 22:00 (tests run with TZ=UTC).
const T0 = Date.UTC(2026, 8, 26, 12, 0);
const noRng = () => 0.999;

function booted() {
  const s = createScript({ now: T0, rng: mulberry32(1) });
  s.quirk.sleepOffset = 0;
  s.trait = null;
  tick(s, T0 + CFG.bootMinutes * MIN, noRng);
  return s;
}
const drainOver = (s, minutes) => {
  const before = s.stats.charge;
  tick(s, s.lastTick + minutes * MIN, noRng);
  return before - s.stats.charge;
};

test('a nap slows drain but time still passes', () => {
  const awake = booted();
  const napping = booted();
  assert.equal(act(napping, 'nap', napping.lastTick).ok, true);
  const age = napping.ageMin;
  const ratio = drainOver(napping, 60) / drainOver(awake, 60);
  assert.ok(Math.abs(ratio - CFG.napDrainMult) < 0.01, `ratio ${ratio}`);
  assert.equal(napping.ageMin, age + 60);
});

test('a nap ends on its own after two hours, then needs a cooldown', () => {
  const s = booted();
  act(s, 'nap', s.lastTick);
  tick(s, s.lastTick + (CFG.napMaxMin - 1) * MIN, noRng);
  assert.ok(s.nap);
  assert.equal(napMinutesLeft(s), 1);
  tick(s, s.lastTick + MIN, noRng);
  assert.equal(s.nap, null);
  assert.match(s.log.at(-1).msg, /nap over/);
  assert.match(act(s, 'nap', s.lastTick).msg, /until it can nap again/);
  tick(s, s.lastTick + CFG.napCooldownMin * MIN, noRng);
  assert.equal(napBlockReason(s), null);
});

test('waking early ends the nap and starts the cooldown', () => {
  const s = booted();
  act(s, 'nap', s.lastTick);
  tick(s, s.lastTick + 20 * MIN, noRng);
  const res = act(s, 'nap', s.lastTick);
  assert.equal(res.ok, true);
  assert.equal(s.nap, null);
  assert.ok(napBlockReason(s));
});

test('while napping it cannot eat, play, cool or jack in, like sleep', () => {
  const s = booted();
  act(s, 'nap', s.lastTick);
  for (const action of ['corp', 'scav', 'play', 'cool']) assert.match(blockReason(s, action), /napping/);
  assert.match(runBlockReason(s), /napping/);
  assert.equal(blockReason(s, 'lights'), null);
  assert.equal(blockReason(s, 'patch'), null);
});

test('bedtime takes over from a nap', () => {
  const s = booted();
  tick(s, Date.UTC(2026, 8, 26, 21, 30), noRng);
  act(s, 'nap', s.lastTick);
  tick(s, Date.UTC(2026, 8, 26, 22, 5), noRng);
  assert.equal(s.nap, null);
  assert.equal(s.asleep, true);
});

test('sleeping in the dark drains far less than sleeping with the lights on', () => {
  const lit = booted();
  const dark = booted();
  const bed = Date.UTC(2026, 8, 26, 22, 0);
  tick(lit, bed, noRng);
  tick(dark, bed, noRng);
  act(dark, 'lights', dark.lastTick);
  lit.stats.charge = dark.stats.charge = 80; // it ran flat on the way to bedtime
  const awakeRate = CFG.drainPerHour.charge;
  assert.ok(Math.abs(drainOver(lit, 60) - awakeRate * CFG.sleepDrainMult) < 0.01);
  assert.ok(Math.abs(drainOver(dark, 60) - awakeRate * CFG.sleepDarkDrainMult) < 0.01);
});

test('a stored nap survives loading', () => {
  const s = booted();
  act(s, 'nap', s.lastTick);
  const loaded = cleanSave(JSON.parse(JSON.stringify(s)), s.lastTick);
  assert.deepEqual(loaded.nap, s.nap);
  assert.equal(cleanSave({ ...JSON.parse(JSON.stringify(s)), nap: 'x' }, s.lastTick).nap, null);
});
