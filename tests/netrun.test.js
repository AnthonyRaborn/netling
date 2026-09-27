import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createScript, tick, mulberry32, CFG, MIN } from '../src/sim.js';
import { generateMap, nodeById } from '../src/netrun/map.js';
import { REGIONS } from '../src/netrun/regions.js';
import {
  startRun, moveTo, resolveIce, relayChoice, choose, jackOut, abortRun, closeRun, runOptions, runBlockReason, visibleNodeIds, RUN_CFG,
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
  s.run.phase = 'choice';
  s.run.pending = { kind: 'relay', options: [{ id: 'continue' }, { id: 'out' }] };
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
      else if (s.run.phase === 'choice') choose(s, s.run.pending.options.find((o) => !o.disabled && o.id !== 'out').id, rng);
      else moveTo(s, runOptions(s.run)[0].id, rng);
      s.stats.integrity = Math.max(s.stats.integrity, 50); // this test is about pathing, not survival
    }
    assert.equal(s.run.phase, 'done', `seed ${seed}`);
    assert.equal(nodeById(s.run.map, s.run.pos).type, 'exit');
  }
});

// Build a run whose next node is a given type.
function runInto(stage, type, seed = 4) {
  const s = pet(stage);
  startRun(s, 'public', mulberry32(seed));
  const next = runOptions(s.run)[0];
  next.type = type;
  return { s, next };
}

test('checkpoint: hide leans indie, comply confiscates loot, voucher passes clean', () => {
  let { s, next } = runInto('baby', 'checkpoint');
  moveTo(s, next.id, noRng);
  assert.equal(s.run.phase, 'choice');
  assert.equal(s.run.pending.options.find((o) => o.id === 'voucher').disabled, true);
  choose(s, 'hide', noRng);
  assert.equal(s.axes.allegiance, -1);

  ({ s, next } = runInto('baby', 'checkpoint'));
  s.run.loot = ['coolant'];
  moveTo(s, next.id, noRng);
  choose(s, 'comply', noRng);
  assert.deepEqual(s.run.loot, []);
  assert.equal(s.axes.allegiance, 1);

  ({ s, next } = runInto('baby', 'checkpoint'));
  s.inventory.push('voucher');
  moveTo(s, next.id, noRng);
  choose(s, 'voucher', noRng);
  assert.deepEqual(s.inventory, []);
});

test('a voucher used up mid-checkpoint is not charged against another item', () => {
  const { s, next } = runInto('baby', 'checkpoint');
  s.inventory.push('voucher', 'coolant', 'antivirus');
  moveTo(s, next.id, noRng);
  s.inventory.splice(0, 1); // the inventory stays usable while the choice is open
  const res = choose(s, 'voucher', noRng);
  assert.equal(res.ok, false);
  assert.deepEqual(s.inventory, ['coolant', 'antivirus']);
  assert.equal(s.run.phase, 'choice', 'the checkpoint is still waiting');
  assert.equal(s.run.pending.options.find((o) => o.id === 'voucher').disabled, true);
});

test('chrome and ghost pass checkpoints automatically', () => {
  for (const form of ['chrome', 'ghost']) {
    const { s, next } = runInto('adult', 'checkpoint');
    s.form = form;
    const res = moveTo(s, next.id, noRng);
    assert.equal(res.auto, true);
    assert.equal(s.run.phase, 'map');
  }
});

test('market trades charge for an item', () => {
  const { s, next } = runInto('baby', 'market');
  moveTo(s, next.id, noRng);
  const charge = s.stats.charge;
  const offer = s.run.pending.offers[0];
  choose(s, 'buy0', noRng);
  assert.deepEqual(s.run.loot, [offer]);
  assert.equal(s.stats.charge, charge - RUN_CFG.marketPrice);
});

test('anomalies resolve and stats stay in range', () => {
  for (let seed = 1; seed <= 60; seed++) {
    const { s, next } = runInto('baby', 'anomaly', seed);
    moveTo(s, next.id, mulberry32(seed));
    const opt = s.run.pending.options[seed % 2];
    const res = choose(s, opt.id, mulberry32(seed));
    assert.ok(res.ok, `seed ${seed}`);
    for (const v of Object.values(s.stats)) assert.ok(v >= 0 && v <= 100, `seed ${seed}: stat out of range`);
  }
});

test('firewall halves ICE damage; glitch phases through the first ICE', () => {
  const { s: fw } = runInto('adult', 'ice');
  fw.form = 'firewall';
  fw.run.phase = 'ice';
  const before = fw.stats.integrity;
  resolveIce(fw, false, noRng);
  assert.equal(before - fw.stats.integrity, Math.round(REGIONS.public.iceDamage * RUN_CFG.firewallIceMult));

  const { s: gl, next } = runInto('adult', 'ice');
  gl.form = 'glitch';
  const res = moveTo(gl, next.id, noRng);
  assert.equal(res.phased, true);
  assert.equal(gl.run.phase, 'map');
});

test('daemon sees two steps ahead, ghost sees everything, a baby only adjacent nodes', () => {
  const base = pet('baby');
  startRun(base, 'public', mulberry32(4));
  const adjacent = visibleNodeIds(base).size;
  base.stage = 'adult';
  base.form = 'daemon';
  assert.ok(visibleNodeIds(base).size > adjacent);
  base.form = 'ghost';
  assert.equal(visibleNodeIds(base).size, base.run.map.nodes.length);
});

test('market offers are always two different items', () => {
  for (let seed = 1; seed <= 100; seed++) {
    const { s, next } = runInto('baby', 'market', seed);
    moveTo(s, next.id, mulberry32(seed));
    const [a, b] = s.run.pending.offers;
    assert.notEqual(a, b, `seed ${seed}`);
  }
});

import { regionLock, REGION_ORDER } from '../src/netrun/regions.js';
import { FRAGMENTS, nextFragment, codexByRegion } from '../src/netrun/codex.js';

test('region access follows stage, and The Deep needs the last Ruins fragment', () => {
  assert.equal(regionLock('public', 'baby'), null);
  assert.match(regionLock('corp', 'baby'), /teen/);
  assert.equal(regionLock('bazaar', 'teen'), null);
  assert.match(regionLock('ruins', 'teen'), /adult/);
  assert.match(regionLock('deep', 'adult', []), /hidden/);
  assert.equal(regionLock('deep', 'adult', ['ruins-4']), null);
  const s = pet('baby');
  assert.match(runBlockReason(s, 'corp'), /Corp Grid/);
});

test('every region generates valid maps', () => {
  for (const region of REGION_ORDER) {
    for (let seed = 1; seed <= 50; seed++) {
      const map = generateMap(region, mulberry32(seed));
      const reach = new Set([map.nodes[0].id]);
      for (const n of map.nodes) if (reach.has(n.id)) n.edges.forEach((e) => reach.add(e));
      assert.equal(reach.size, map.nodes.length, `${region} seed ${seed}`);
    }
  }
});

test('fragments drop in order, never repeat, and bank on jack-out', () => {
  assert.equal(nextFragment('public', []), 'public-1');
  assert.equal(nextFragment('public', ['public-1']), 'public-2');
  assert.equal(nextFragment('public', ['public-1', 'public-2', 'public-3', 'public-4']), null);

  const s = pet('adult');
  startRun(s, 'public', mulberry32(3), ['public-1']);
  const exit = s.run.map.nodes.find((n) => n.type === 'exit');
  const before = s.run.map.nodes.find((n) => n.edges.includes(exit.id));
  s.run.pos = before.id;
  const res = moveTo(s, exit.id, () => 0); // every roll succeeds
  assert.deepEqual(res.fragments, ['public-2']);
});

test('disconnecting loses fragments found this run', () => {
  const s = pet();
  startRun(s, 'public', mulberry32(4));
  s.run.fragments = ['public-1'];
  s.run.phase = 'ice';
  s.stats.integrity = 1;
  resolveIce(s, false, noRng);
  assert.deepEqual(s.run.fragments, []);
});

test('codex groups fragments by region with missing placeholders', () => {
  const rows = codexByRegion(['public-1', 'corp-2'], REGION_ORDER);
  assert.equal(rows.length, REGION_ORDER.length);
  assert.equal(rows[0].found, 1);
  assert.equal(rows[0].entries[1].missing, true);
  assert.equal(new Set(FRAGMENTS.map((f) => f.id)).size, FRAGMENTS.length, 'ids are unique');
  for (const f of FRAGMENTS) assert.ok(REGION_ORDER.includes(f.region), `${f.id} has a real region`);
});

test('Daemon and Firewall each have a fragment; the Bazaar still ends on the graffiti', () => {
  assert.match(FRAGMENTS.find((f) => f.id === 'corp-5').text, /Daemon-class/);
  assert.match(FRAGMENTS.find((f) => f.id === 'bazaar-5').text, /Firewall/);
  assert.equal(nextFragment('bazaar', ['bazaar-1', 'bazaar-2', 'bazaar-3']), 'bazaar-5');
  assert.equal(nextFragment('bazaar', ['bazaar-1', 'bazaar-2', 'bazaar-3', 'bazaar-5']), 'bazaar-4');
});

import { ACCESSORIES } from '../src/accessories.js';

test('markets can offer an unowned accessory, bought for charge and banked on jack-out', () => {
  let found = false;
  for (let seed = 1; seed <= 40 && !found; seed++) {
    const { s, next } = runInto('baby', 'market', seed);
    s.run.knownAcc = ['cap'];
    moveTo(s, next.id, mulberry32(seed));
    const acc = s.run.pending.accOffer;
    if (!acc) continue;
    found = true;
    assert.notEqual(acc, 'cap', 'never offers an owned accessory');
    const charge = s.stats.charge;
    choose(s, 'buyacc', noRng);
    assert.equal(s.stats.charge, charge - RUN_CFG.accPrice);
    jackOut(s);
    assert.deepEqual(s.accessoryInbox, [acc]);
  }
  assert.ok(found, 'some market offered an accessory');
});

test('accessories are lost on disconnect, and nothing is offered once all are owned', () => {
  const s = pet();
  startRun(s, 'public', mulberry32(4));
  s.run.accessories = ['halo'];
  s.run.phase = 'ice';
  s.stats.integrity = 1;
  resolveIce(s, false, noRng);
  assert.deepEqual(s.run.accessories, []);
  assert.equal(s.accessoryInbox, undefined);

  const { s: t, next } = runInto('baby', 'market', 7);
  t.run.knownAcc = ACCESSORIES.map((x) => x.id);
  moveTo(t, next.id, () => 0); // every chance fires
  assert.equal(t.run.pending.accOffer, null);
});

test('the tutorial run is fixed, gentle, gives an item and the first fragment, and leaves no cooldown', () => {
  const s = pet('baby');
  s.asleep = true;
  s.stats.charge = 10;
  assert.equal(runBlockReason(s, 'tutorial'), null, 'allowed even asleep and low');
  s.stats.charge = 70;
  startRun(s, 'tutorial', mulberry32(1));
  assert.deepEqual(s.run.map.nodes.map((n) => n.type), ['entry', 'cache', 'ice', 'relay', 'exit']);
  moveTo(s, 1, noRng); // cache: guaranteed item
  assert.deepEqual(s.run.loot, ['coolant']);
  moveTo(s, 2, noRng);
  const before = s.stats.integrity;
  resolveIce(s, false, noRng);
  assert.equal(before - s.stats.integrity, REGIONS.tutorial.iceDamage);
  moveTo(s, 3, noRng);
  choose(s, 'continue', noRng);
  const res = moveTo(s, 4, noRng);
  assert.equal(res.result, 'jacked');
  assert.deepEqual(s.codexInbox, ['public-1']);
  assert.equal(s.lastRunEndAge, null, 'no cooldown after the tutorial');
  assert.equal(s.accessoryInbox.length, 0, 'no style drops before the party hat');
});

test('closing a run keeps the log at its usual length', () => {
  const s = createScript({ now: T0, rng: mulberry32(3) });
  tick(s, T0 + CFG.bootMinutes * MIN, noRng);
  for (let i = 0; i < 60; i++) s.log.push({ t: T0, msg: `> line ${i}` });
  s.log.splice(0, s.log.length - 50);
  startRun(s, 'tutorial', noRng);
  abortRun(s);
  closeRun(s, T0);
  assert.equal(s.log.length, 50);
  assert.match(s.log.at(-1).msg, /^> netrun/);
});
