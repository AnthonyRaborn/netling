import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createScript, tick, leaningForm, isSleepHour, mulberry32, CFG, MIN } from '../src/sim.js';

// Noon UTC so the pet starts awake (tests run with TZ=UTC).
const T0 = Date.UTC(2026, 8, 26, 12, 0);
const noRng = () => 0.999; // never triggers random events

function booted(opts = {}) {
  const s = createScript({ now: T0, rng: mulberry32(1), ...opts });
  s.quirk.sleepOffset = 0;
  tick(s, T0 + CFG.bootMinutes * MIN, noRng);
  return s;
}

test('script compiles into a baby after boot', () => {
  const s = createScript({ now: T0, rng: mulberry32(1) });
  assert.equal(s.stage, 'script');
  tick(s, T0 + CFG.bootMinutes * MIN, noRng);
  assert.equal(s.stage, 'baby');
});

test('charge and sync drain over time', () => {
  const s = booted();
  const before = { ...s.stats };
  tick(s, s.lastTick + 60 * MIN, noRng);
  assert.ok(Math.abs(before.charge - s.stats.charge - CFG.drainPerHour.charge) < 0.01);
  assert.ok(Math.abs(before.sync - s.stats.sync - CFG.drainPerHour.sync) < 0.01);
});

test('a stat stuck at zero past the grace period is one care mistake', () => {
  const s = booted();
  s.stats.charge = 0;
  tick(s, s.lastTick + (CFG.mistakeGraceMin - 1) * MIN, noRng);
  assert.equal(s.careMistakes, 0);
  tick(s, s.lastTick + 60 * MIN, noRng);
  assert.equal(s.careMistakes, 1, 'counted once, not per minute');
});

test('sleeping with the lights on is a care mistake', () => {
  const s = booted();
  tick(s, Date.UTC(2026, 8, 26, 22, 30), noRng);
  assert.equal(s.asleep, true);
  assert.ok(s.careMistakes >= 1);
});

test('turning lights off prevents the sleep mistake', () => {
  const s = booted();
  tick(s, Date.UTC(2026, 8, 26, 22, 1), noRng);
  act(s, 'lights', s.lastTick);
  const m = s.careMistakes;
  tick(s, Date.UTC(2026, 8, 27, 2, 0), noRng);
  assert.equal(s.careMistakes, m);
});

test('total neglect flatlines and leaves a fragment', () => {
  const s = booted();
  tick(s, s.lastTick + 7 * 24 * 60 * MIN, mulberry32(7));
  assert.equal(s.stage, 'dead');
  assert.ok(s.fragment.trait);
  assert.ok(s.deathCause);
});

test('feeding shifts allegiance and respects a full buffer', () => {
  const s = booted();
  s.stats.charge = 20;
  assert.ok(act(s, 'corp', s.lastTick, noRng).ok);
  assert.equal(s.axes.allegiance, 1);
  s.stats.charge = 99;
  assert.equal(act(s, 'scav', s.lastTick, noRng).ok, false);
});

test('patching a fresh virus raises stability', () => {
  const s = booted();
  s.virus = true;
  s.virusMin = 5;
  assert.ok(act(s, 'patch', s.lastTick).ok);
  assert.equal(s.virus, false);
  assert.equal(s.axes.stability, 1);
});

test('leaning form follows the dominant axis', () => {
  const s = booted();
  s.careMistakes = 3;
  s.axes = { allegiance: 10, stability: 2 };
  assert.equal(leaningForm(s), 'chrome');
  s.axes = { allegiance: -10, stability: 2 };
  assert.equal(leaningForm(s), 'firewall');
  s.axes = { allegiance: 1, stability: 8 };
  assert.equal(leaningForm(s), 'daemon');
  s.axes = { allegiance: 1, stability: -8 };
  assert.equal(leaningForm(s), 'glitch');
  s.axes = { allegiance: 1, stability: -1 };
  s.careMistakes = 0;
  assert.equal(leaningForm(s), 'ghost');
});

test('next generation inherits the trait and exactly one quirk key', () => {
  const fragment = { form: 'firewall', trait: 'hardened', quirk: { palette: 4, pitch: 123, idle: 'sway', favPacket: 'scav', sleepOffset: 2 } };
  const s = createScript({ now: T0, generation: 2, fragment, rng: mulberry32(3) });
  assert.equal(s.trait, 'hardened');
  assert.equal(s.quirk[s.inheritedQuirk], fragment.quirk[s.inheritedQuirk]);
});

test('sleep window wraps midnight and honors offset', () => {
  assert.equal(isSleepHour(23), true);
  assert.equal(isSleepHour(3), true);
  assert.equal(isSleepHour(12), false);
  assert.equal(isSleepHour(22, 2), false);
  assert.equal(isSleepHour(0, 2), true);
});
