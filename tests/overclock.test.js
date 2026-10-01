import './helpers/utc.js';
// Overclocked (Heat at or above CFG.overclockHeat): easier, luckier games and ICE, costlier losses, more trouble,
// and it leans unstable. Flow leans the other way.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createScript, gameSpeed, overclocked, tick, mulberry32, CFG, MIN } from '../src/sim.js';
import { iceSpeed, startRun, resolveIce } from '../src/netrun/run.js';
import { REGIONS } from '../src/netrun/regions.js';
import { GameSession } from '../src/games/session.js';
import { cleanSave } from '../src/sanitize.js';

// Tests run with TZ=UTC: noon is awake.
const NOON = Date.UTC(2026, 8, 26, 12, 0);
const noRng = () => 0.999;
const rolls = (...seq) => () => (seq.length ? seq.shift() : 0.999);

function booted() {
  const s = createScript({ now: NOON, rng: mulberry32(1) });
  s.quirk.sleepOffset = 0;
  s.quirk.favPacket = null;
  s.trait = null;
  tick(s, NOON + (CFG.bootMinutes + 1) * MIN, noRng);
  Object.assign(s.stats, { charge: 90, sync: 50, integrity: 80, heat: 20 });
  return s;
}
const hot = (s) => (s.stats.heat = CFG.overclockHeat + 5);
const minutes = (s, m, rng = noRng) => tick(s, s.lastTick + m * MIN, rng);
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

test('overclocked from the threshold up, including the 85+ danger zone; games slow down', () => {
  const s = booted();
  s.stats.heat = CFG.overclockHeat - 1;
  assert.equal(overclocked(s), false);
  assert.equal(gameSpeed(s), 1);
  for (const heat of [CFG.overclockHeat, 85, 100]) {
    s.stats.heat = heat;
    assert.equal(overclocked(s), true, `heat ${heat}`);
    assert.equal(gameSpeed(s), CFG.overclockGameSpeed);
  }
});

test('a game session runs at its speed: the clock and everything in it slow down', () => {
  const normal = new GameSession('breach', { rng: mulberry32(2) });
  const slow = new GameSession('breach', { rng: mulberry32(2), speed: CFG.overclockGameSpeed });
  for (const g of [normal, slow]) {
    g.input('a');
    g.update(1);
  }
  close(25 - normal.game.timeLeft, 1);
  close(25 - slow.game.timeLeft, CFG.overclockGameSpeed);
});

test('a lost game costs Sync and Integrity while overclocked; cool, it still consoles', () => {
  const cool = booted();
  assert.equal(act(cool, 'play', cool.lastTick, noRng, { game: 'dodge', won: false }).ok, true);
  assert.equal(cool.stats.sync, 50 + CFG.playLoseSync);
  assert.equal(cool.stats.integrity, 80);

  const s = booted();
  hot(s);
  const res = act(s, 'play', s.lastTick, noRng, { game: 'dodge', won: false });
  assert.equal(res.ok, true);
  assert.equal(s.stats.sync, 50 + CFG.overclockLoseSync);
  assert.equal(s.stats.integrity, 80 - CFG.overclockLoseIntegrity);
  assert.match(res.msg, /overclocked/);
});

test('a won game drops items more often while overclocked', () => {
  // A roll between the usual chance and the overclocked one.
  const roll = 0.3;
  const cool = booted();
  act(cool, 'play', cool.lastTick, rolls(roll), { game: 'dodge', won: true });
  assert.equal(cool.inventory.length, 0);
  const s = booted();
  hot(s);
  act(s, 'play', s.lastTick, rolls(roll, 0), { game: 'dodge', won: true });
  assert.equal(s.inventory.length, 1);
});

test('lost ICE bites harder while overclocked', () => {
  const lose = (heat) => {
    const s = booted();
    s.form = 'kernel';
    s.stats.integrity = 100;
    s.stats.heat = heat; // the Heat it jacks in with decides it
    startRun(s, 'public', mulberry32(6));
    s.run.phase = 'ice';
    s.run.pending = { game: 'breach' };
    resolveIce(s, false, noRng);
    return 100 - s.stats.integrity;
  };
  const base = REGIONS.public.iceDamage;
  assert.equal(lose(20), base);
  assert.equal(lose(CFG.overclockHeat), Math.round(base * CFG.overclockIceDamageMult));
});

test('a run is overclocked only if it jacked in that way: Heat gained on the way never switches it on', () => {
  const s = booted();
  s.form = 'kernel';
  s.stats.integrity = 100;
  startRun(s, 'public', mulberry32(6));
  assert.equal(s.run.hot, false);
  assert.equal(iceSpeed(s), 1);
  s.stats.heat = 90;
  s.run.phase = 'ice';
  s.run.pending = { game: 'breach' };
  resolveIce(s, false, noRng);
  assert.equal(100 - s.stats.integrity, REGIONS.public.iceDamage);

  const h = booted();
  hot(h);
  startRun(h, 'public', mulberry32(6));
  assert.equal(h.run.hot, true);
  assert.equal(iceSpeed(h), CFG.overclockGameSpeed);
  assert.equal(cleanSave(JSON.parse(JSON.stringify(h)), h.lastTick).run.hot, true);
});

test('events are likelier while overclocked', () => {
  // A trace roll that misses at the usual chance but lands at the overclocked one.
  const roll = (CFG.traceChancePerHour * (1 + CFG.overclockEventMult)) / 2 / 60;
  const cool = booted();
  minutes(cool, 1, rolls(0.999, roll));
  assert.equal(cool.event, null);
  const s = booted();
  hot(s);
  minutes(s, 1, rolls(0.999, roll));
  assert.equal(s.event?.type, 'trace');
});

test('awake time overclocked leans it unstable', () => {
  const s = booted();
  hot(s);
  const before = s.axes.stability;
  minutes(s, 60);
  close(s.axes.stability - before, CFG.overclockStabilityPerHour);
});

test('crossing the line is logged once each way, and the flag survives a save', () => {
  const s = booted();
  hot(s);
  minutes(s, 1);
  assert.match(s.log.at(-1).msg, /overclocked/);
  minutes(s, 5);
  assert.equal(s.log.filter((e) => /overclocked/.test(e.msg)).length, 1);
  assert.equal(cleanSave(JSON.parse(JSON.stringify(s)), s.lastTick).hot, true);
  s.stats.heat = 20;
  minutes(s, 1);
  assert.match(s.log.at(-1).msg, /back to spec/);
  assert.equal(s.hot, false);
});
