import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createScript, tick, act, hibernate, wake, hibernateBlockReason, wakeAvailableAt, mulberry32, CFG, MIN } from '../src/sim.js';

const T0 = Date.UTC(2026, 8, 26, 12, 0);
const noRng = () => 0.999;
const DAY = 24 * 60 * MIN;

function booted() {
  const s = createScript({ now: T0, rng: mulberry32(1) });
  s.quirk.sleepOffset = 0;
  tick(s, T0 + CFG.bootMinutes * MIN, noRng);
  return s;
}

test('hibernation freezes the clock completely', () => {
  const s = booted();
  const t = s.lastTick;
  assert.ok(hibernate(s, t, noRng).ok);
  const snapshot = JSON.stringify({ stats: s.stats, age: s.ageMin, mistakes: s.careMistakes });
  tick(s, t + 10 * DAY, noRng);
  assert.equal(JSON.stringify({ stats: s.stats, age: s.ageMin, mistakes: s.careMistakes }), snapshot);
  assert.notEqual(s.stage, 'dead');
});

test('waking needs the minimum stay, then time resumes from the wake moment', () => {
  const s = booted();
  const t = s.lastTick;
  hibernate(s, t, noRng);
  assert.equal(wake(s, t + DAY - MIN).ok, false, 'too soon');
  const wakeAt = wakeAvailableAt(s) + 3 * DAY;
  assert.ok(wake(s, wakeAt).ok);
  const age = s.ageMin;
  tick(s, wakeAt + 60 * MIN, noRng);
  assert.equal(s.ageMin, age + 60, 'only time after waking counts');
});

test('cooldown after waking, and no hibernating mid-run or mid-trace', () => {
  const s = booted();
  const t = s.lastTick;
  hibernate(s, t, noRng);
  wake(s, t + DAY);
  assert.match(hibernateBlockReason(s, t + DAY + MIN), /groggy/);
  assert.equal(hibernateBlockReason(s, t + DAY + CFG.hibernateCooldownMin * MIN), null);
  s.event = { type: 'trace', startedAge: s.ageMin };
  assert.match(hibernateBlockReason(s, t + 10 * DAY), /trace/);
  s.event = null;
  s.run = { phase: 'map' };
  assert.match(hibernateBlockReason(s, t + 10 * DAY), /netrun/);
});

test('actions still respond sensibly while hibernating', () => {
  const s = booted();
  hibernate(s, s.lastTick, noRng);
  const res = act(s, 'corp', s.lastTick);
  assert.ok(res); // no throw; the UI hides controls anyway
});
