import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createScript, tick, mulberry32, CFG, MIN } from '../src/sim.js';
import { generateMap, nodeById } from '../src/netrun/map.js';
import { REGIONS } from '../src/netrun/regions.js';
import {
  startRun, moveTo, resolveIce, relayChoice, jackOut, abortRun, closeRun, runOptions, runBlockReason, RUN_CFG,
} from '../src/netrun/run.js';

const T0 = Date.UTC(2026, 8, 26, 12, 0);
const noRng = () => 0.999;

function pet(stage = 'baby') {
  const s = createScript({ now: T0, rng: mulberry32(1) });
  s.quirk.sleepOffset = 0;
  tick(s, T0 + CFG.bootMinutes * MIN, noRng);
  s.stage = stage;
  s.stats.charge = 90;
  return s;
}

test('every generated map is connected entry-to-exit with no dead ends', () => {
  for (let seed = 1; seed <= 300; seed++) {
    const map = generateMap('public', mulberry32(seed));
    const exit = map.nodes.find((n) => n.type === 'exit');
    const reach = new Set([map.nodes[0].id]);
    for (const n of map.nodes) if (reach.has(n.id)) n.edges.forEach((e) => reach.add(e));
    assert.equal(reach.size, map.nodes.length, `seed ${seed}: unreachable node`);
    for (const n of map.nodes) if (n !== exit) assert.ok(n.edges.length > 0, `seed ${seed}: dead end`);
    const relayLayer = Math.ceil(REGIONS.public.layers / 2);
    assert.ok(map.nodes.some((n) => n.layer === relayLayer && n.type === 'relay'), `seed ${seed}: no relay`);
  }
});

test('runs need charge, a cooldown, and an awake netling', () => {
  const s = pet();
  assert.equal(runBlockReason(s), null);
  s.stats.charge = 10;
  assert.match(runBlockReason(s), /charge/);
  s.stats.charge = 90;
  s.asleep = true;
  assert.match(runBlockReason(s), /low-power/);
  s.asleep = false;
  s.lastRunEndAge = s.ageMin;
  assert.match(runBlockReason(s), /cooling/);
});

test('moving costs charge and only follows edges', () => {
  const s = pet();
  const run = startRun(s, 'public', mulberry32(4));
  const far = run.map.nodes[run.map.nodes.length - 1];
  assert.equal(moveTo(s, far.id, noRng).ok, false);
  const charge = s.stats.charge;
  const next = runOptions(run)[0];
  moveTo(s, next.id, noRng);
  assert.ok(s.stats.charge <= charge - RUN_CFG.moveCharge + RUN_CFG.relayCharge);
  assert.equal(run.pos, next.id);
});

test('jacking out banks loot into the inventory', () => {
  const s = pet();
  startRun(s, 'public', mulberry32(4));
  s.run.loot = ['coolant', 'booster'];
  jackOut(s);
  assert.deepEqual(s.inventory, ['coolant', 'booster']);
  assert.equal(s.run.result, 'jacked');
  assert.equal(s.lastRunEndAge, s.ageMin);
  closeRun(s, T0);
  assert.equal(s.run, null);
});

test('losing ICE at low integrity disconnects without killing', () => {
  const s = pet();
  startRun(s, 'public', mulberry32(4));
  s.run.loot = ['coolant'];
  s.run.phase = 'ice';
  s.stats.integrity = 5;
  s.careMistakes = CFG.maxMistakes - 1;
  const res = resolveIce(s, false, noRng);
  assert.equal(res.result, 'disconnected');
  assert.equal(s.stats.integrity, RUN_CFG.rebootIntegrity);
  assert.equal(s.careMistakes, CFG.maxMistakes - 1, 'never the fatal mistake');
  assert.deepEqual(s.inventory, [], 'loot lost');
  tick(s, s.lastTick + MIN, noRng);
  assert.notEqual(s.stage, 'dead');
});

test('a disconnect normally costs one care mistake', () => {
  const s = pet();
  startRun(s, 'public', mulberry32(4));
  s.run.phase = 'ice';
  s.stats.integrity = 5;
  resolveIce(s, false, noRng);
  assert.equal(s.careMistakes, 1);
});

test('relay offers a safe exit; aborting forfeits loot only', () => {
  const s = pet();
  startRun(s, 'public', mulberry32(4));
  s.run.phase = 'relay';
  s.run.loot = ['voucher'];
  relayChoice(s, 'out');
  assert.deepEqual(s.inventory, ['voucher']);

  const t = pet();
  startRun(t, 'public', mulberry32(4));
  t.run.loot = ['voucher'];
  const mistakes = t.careMistakes;
  abortRun(t);
  assert.deepEqual(t.inventory, []);
  assert.equal(t.careMistakes, mistakes);
});

test('walking a whole run always ends at the exit with a result', () => {
  for (let seed = 1; seed <= 100; seed++) {
    const s = pet('adult');
    const rng = mulberry32(seed);
    startRun(s, 'public', rng);
    for (let steps = 0; steps < 20 && s.run.phase !== 'done'; steps++) {
      if (s.run.phase === 'ice') resolveIce(s, true, rng);
      else if (s.run.phase === 'relay') relayChoice(s, 'continue');
      else moveTo(s, runOptions(s.run)[0].id, rng);
    }
    assert.equal(s.run.phase, 'done', `seed ${seed}`);
    assert.equal(nodeById(s.run.map, s.run.pos).type, 'exit');
  }
});
