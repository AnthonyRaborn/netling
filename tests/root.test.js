import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createScript, tick, rollQuirk, mulberry32, CFG, MIN, PALETTES } from '../src/sim.js';

const T0 = Date.UTC(2026, 8, 26, 12, 0);
const noRng = () => 0.999;

function booted(rootAccess) {
  const s = createScript({ now: T0, rng: mulberry32(1), rootAccess });
  s.quirk.sleepOffset = 0;
  tick(s, T0 + CFG.bootMinutes * MIN, noRng);
  return s;
}

test('root access reverses the first premature flatline only', () => {
  const s = booted(true);
  s.careMistakes = CFG.maxMistakes;
  tick(s, s.lastTick + MIN, noRng);
  assert.notEqual(s.stage, 'dead');
  assert.equal(s.rootUsed, true);
  assert.equal(s.careMistakes, CFG.maxMistakes - 1);
  s.careMistakes = CFG.maxMistakes;
  tick(s, s.lastTick + MIN, noRng);
  assert.equal(s.stage, 'dead', 'second time is final');
});

test('root access does not stop old age', () => {
  const s = booted(true);
  s.ageMin = CFG.lifespanMin - 1;
  tick(s, s.lastTick + MIN, noRng);
  assert.equal(s.stage, 'dead');
  assert.equal(s.deathCause, 'end of life cycle');
});

test('without root access a flatline is final', () => {
  const s = booted(false);
  s.careMistakes = CFG.maxMistakes;
  tick(s, s.lastTick + MIN, noRng);
  assert.equal(s.stage, 'dead');
});

test('the origin palette only rolls with root access', () => {
  const origin = PALETTES.length - 1;
  const rolls = (o) => Array.from({ length: 400 }, (_, i) => rollQuirk(mulberry32(i + 1), { origin: o }).palette);
  assert.ok(!rolls(false).includes(origin));
  assert.ok(rolls(true).includes(origin));
});
