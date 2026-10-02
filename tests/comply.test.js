import './helpers/utc.js';
// Corp choices cost about what the indie ones do, in a different stat: COMPLY no longer costs Integrity, and a checkpoint
// takes a scan fee in scrip instead of loot.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createScript, tick, mulberry32, CFG, MIN } from '../src/sim.js';
import { startRun, moveTo, choose, runOptions, RUN_CFG } from '../src/netrun/run.js';

const NOON = Date.UTC(2026, 8, 26, 12, 0);
const noRng = () => 0.999;

function booted() {
  const s = createScript({ now: NOON, rng: mulberry32(1) });
  s.quirk.sleepOffset = 0;
  s.trait = null;
  tick(s, NOON + (CFG.bootMinutes + 1) * MIN, noRng);
  Object.assign(s.stats, { charge: 80, sync: 60, integrity: 70, heat: 20 });
  return s;
}

test('COMPLY with a trace costs Sync only; HIDE costs Charge and Heat', () => {
  const c = booted();
  c.event = { type: 'trace', startedAge: c.ageMin };
  assert.equal(act(c, 'comply', c.lastTick, noRng).ok, true);
  assert.deepEqual([c.stats.integrity, c.stats.sync, c.stats.charge], [70, 60 - CFG.complySync, 80]);
  assert.equal(c.axes.allegiance, 1);

  const h = booted();
  h.event = { type: 'trace', startedAge: h.ageMin };
  assert.equal(act(h, 'hide', h.lastTick, noRng).ok, true);
  assert.equal(h.stats.integrity, 70);
  assert.ok(h.stats.charge < 80 && h.stats.heat > 20);
  assert.equal(h.axes.allegiance, -1);
});

// The next node, turned into a checkpoint, with some loot already carried.
function atCheckpoint(scrip) {
  const s = booted();
  s.stats.charge = 90;
  s.scrip = scrip;
  startRun(s, 'public', mulberry32(4));
  s.run.loot = ['coolant'];
  const next = runOptions(s.run)[0];
  next.type = 'checkpoint';
  moveTo(s, next.id, noRng);
  return s;
}

test('checkpoint COMPLY takes a scrip fee and leaves the loot; with no scrip it confiscates, as before', () => {
  const paying = atCheckpoint(20);
  assert.match(paying.run.pending.options.find((o) => o.id === 'comply').hint, /scrip/);
  choose(paying, 'comply', noRng);
  assert.equal(paying.scrip, 20 - RUN_CFG.complyScrip);
  assert.deepEqual(paying.run.loot, ['coolant']);
  assert.equal(paying.axes.allegiance, 1);

  const broke = atCheckpoint(RUN_CFG.complyScrip - 1);
  assert.match(broke.run.pending.options.find((o) => o.id === 'comply').hint, /confiscate/);
  choose(broke, 'comply', noRng);
  assert.equal(broke.scrip, RUN_CFG.complyScrip - 1);
  assert.deepEqual(broke.run.loot, [], 'the loot was confiscated');
});
