import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, alertReason, createScript, tick, leaningForm, isSleepHour, migrate, mulberry32, CFG, MIN } from '../src/sim.js';

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
  tick(s, Date.UTC(2026, 8, 26, 22, 0) + (CFG.lightsGraceMin + 5) * MIN, noRng);
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
  s.axes = { allegiance: 1, stability: 0.5 };
  s.careMistakes = 0;
  const n = Math.ceil(CFG.ghostMinGameWins / 3) + CFG.ghostMinWinsEach;
  s.games = { breach: { played: n, won: n }, dodge: { played: n, won: n }, tune: { played: n, won: n } };
  assert.equal(leaningForm(s), 'ghost');
  s.axes.stability = -3;
  assert.equal(leaningForm(s), 'glitch', 'an unstable netling never ghosts');
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

test('good care evolves into Kernel at the teen threshold', () => {
  const s = booted();
  s.ageMin = CFG.teenAtMin - 1;
  tick(s, s.lastTick + MIN, noRng);
  assert.equal(s.stage, 'teen');
  assert.equal(s.form, 'kernel');
});

test('poor care evolves into Stub', () => {
  const s = booted();
  s.careMistakes = CFG.teenGoodCareMaxMistakes + 1;
  s.ageMin = CFG.teenAtMin - 1;
  tick(s, s.lastTick + MIN, noRng);
  assert.equal(s.form, 'stub');
});

test('adult form comes from the hidden axes', () => {
  const s = booted();
  s.stage = 'teen';
  s.form = 'kernel';
  s.careMistakes = 2;
  s.axes = { allegiance: -12, stability: 4 };
  s.ageMin = CFG.adultAtMin - 1;
  tick(s, s.lastTick + MIN, noRng);
  assert.equal(s.stage, 'adult');
  assert.equal(s.form, 'firewall');
});

test('an adult leaves its own form as the fragment, not its current lean', () => {
  const s = booted();
  s.stage = 'adult';
  s.form = 'daemon';
  s.axes = { allegiance: 50, stability: 0 };
  s.careMistakes = CFG.maxMistakes;
  tick(s, s.lastTick + MIN, noRng);
  assert.equal(s.stage, 'dead');
  assert.equal(s.fragment.form, 'daemon');
  assert.equal(s.fragment.trait, 'persistent');
});

test('daemon drains charge slower', () => {
  const a = booted();
  const b = booted();
  b.stage = 'adult';
  b.form = 'daemon';
  tick(a, a.lastTick + 60 * MIN, noRng);
  tick(b, b.lastTick + 60 * MIN, noRng);
  assert.ok(b.stats.charge > a.stats.charge);
});

test('chrome sulks at scavenged data', () => {
  const s = booted();
  s.stage = 'adult';
  s.form = 'chrome';
  s.quirk.favPacket = 'corp';
  s.stats.charge = 20;
  const sync = s.stats.sync;
  act(s, 'scav', s.lastTick, noRng);
  assert.equal(s.stats.sync, sync - 5);
});

test('migrate backfills evolution fields on old saves', () => {
  const s = booted();
  delete s.form;
  delete s.evolvedAt;
  migrate(s);
  assert.equal(s.form, 'bitling');
  assert.equal(s.evolvedAt, null);
});

test('ghost needs enough mini-game wins across every game', () => {
  const s = booted();
  s.axes = { allegiance: 0, stability: 0 };
  assert.notEqual(leaningForm(s), 'ghost', 'no wins yet');
  const many = CFG.ghostMinGameWins;
  s.games = { breach: { played: many, won: many }, dodge: { played: 1, won: 0 }, tune: { played: 0, won: 0 } };
  assert.notEqual(leaningForm(s), 'ghost', 'wins not spread across games');
  s.games.dodge.won = CFG.ghostMinWinsEach;
  s.games.tune.won = CFG.ghostMinWinsEach;
  assert.equal(leaningForm(s), 'ghost');
});

test('play records the mini-game result and rewards wins more', () => {
  const a = booted();
  const b = booted();
  a.stats.sync = b.stats.sync = 30;
  act(a, 'play', a.lastTick, noRng, { game: 'breach', won: true });
  act(b, 'play', b.lastTick, noRng, { game: 'breach', won: false });
  assert.deepEqual(a.games.breach, { played: 1, won: 1 });
  assert.deepEqual(b.games.breach, { played: 1, won: 0 });
  assert.ok(a.stats.sync > b.stats.sync);
  assert.equal(act(a, 'play', a.lastTick, noRng, { game: 'pong' }).ok, false);
});

test('an ignored trace harvests integrity and pushes allegiance corp-ward', () => {
  const s = booted();
  s.event = { type: 'trace', startedAge: s.ageMin };
  const integrity = s.stats.integrity;
  tick(s, s.lastTick + CFG.traceWindowMin * MIN, noRng);
  assert.equal(s.event, null);
  assert.ok(s.stats.integrity < integrity - CFG.traceIgnoredIntegrity + 5);
  assert.equal(s.axes.allegiance, CFG.traceIgnoredAllegiance);
});

test('hiding from a trace resolves it and leans indie', () => {
  const s = booted();
  assert.equal(act(s, 'hide', s.lastTick).ok, false, 'nothing to hide from');
  s.event = { type: 'trace', startedAge: s.ageMin };
  assert.ok(act(s, 'hide', s.lastTick).ok);
  assert.equal(s.event, null);
  assert.equal(s.axes.allegiance, -1);
});

test('untraceable netlings never get traced', () => {
  const s = booted({ fragment: { trait: 'untraceable', quirk: null } });
  s.quirk.sleepOffset = 0;
  const alwaysRoll = () => 0; // every random check fires
  tick(s, s.lastTick + 60 * MIN, alwaysRoll);
  assert.notEqual(s.event?.type, 'trace');
});

test('alertReason picks the most urgent need', () => {
  const s = booted();
  assert.equal(alertReason(s), null);
  s.stats.charge = 10;
  assert.equal(alertReason(s).key, 'charge');
  s.virus = true;
  assert.equal(alertReason(s).key, 'virus');
  s.event = { type: 'trace', startedAge: s.ageMin };
  assert.equal(alertReason(s).key, 'trace');
  s.stage = 'dead';
  assert.equal(alertReason(s), null);
});
