import './helpers/utc.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createScript, tick, mulberry32, CFG, MIN, SCRIP } from '../src/sim.js';
import { generateMap, nodeById, thinnestRoute, ensureOnEveryRoute } from '../src/netrun/map.js';
import { REGIONS } from '../src/netrun/regions.js';
import { FRAGMENTS } from '../src/netrun/codex.js';
import {
  startRun, moveTo, resolveIce, choose, jackOut, abortRun, disconnect, updateContract, contractMinutesLeft, contractProgress, contractShort, CONTRACT_KINDS, RUN_CFG,
} from '../src/netrun/run.js';
import { cleanSave } from '../src/sanitize.js';

const T0 = Date.UTC(2026, 8, 26, 12, 0);
const noRng = () => 0.999;
const always = () => 0; // every roll hits

function pet(stage = 'adult') {
  const s = createScript({ now: T0, rng: mulberry32(1) });
  s.quirk.sleepOffset = 0;
  tick(s, T0 + CFG.bootMinutes * MIN, noRng);
  s.stage = stage;
  s.form = stage === 'adult' ? 'chrome' : s.form;
  s.stats.charge = 90;
  s.cleared = ['public', 'bazaar', 'corp', 'ruins'];
  s.scrip = 40;
  return s;
}

// Every route from entry to exit, as node lists (maps are small: a few thousand routes at most).
function routes(map) {
  const out = [];
  const walk = (node, path) => {
    if (node.type === 'exit') return out.push(path);
    for (const e of node.edges) walk(nodeById(map, e), [...path, nodeById(map, e)]);
  };
  walk(map.nodes[0], [map.nodes[0]]);
  return out;
}
const countOn = (route, type, maxLayer = Infinity) => route.filter((n) => n.type === type && n.layer <= maxLayer).length;

test('the thinnest route is the true minimum, checked against every route', () => {
  const rng = mulberry32(21);
  for (const region of ['public', 'corp', 'bazaar', 'ruins']) {
    for (let i = 0; i < 40; i++) {
      const map = generateMap(region, rng);
      for (const type of ['ice', 'cache', 'market']) {
        const all = routes(map).map((r) => countOn(r, type));
        assert.equal(thinnestRoute(map, type).count, Math.min(...all), `${region} ${type}`);
      }
    }
  }
});

test('a patched map meets the need on every route, and only touches middle nodes', () => {
  const rng = mulberry32(8);
  for (const region of ['public', 'corp', 'bazaar', 'ruins', 'deep']) {
    for (let i = 0; i < 60; i++) {
      const map = generateMap(region, rng);
      const half = Math.ceil((map.layerCount - 2) * RUN_CFG.contractMarketBy);
      for (const [type, need, maxLayer] of [['ice', 4, Infinity], ['cache', 3, Infinity], ['market', 1, half]]) {
        const m = structuredClone(map);
        assert.ok(ensureOnEveryRoute(m, type, need, rng, { maxLayer, avoid: ['relay'] }), `${region} ${type}`);
        if (region !== 'deep') for (const r of routes(m)) assert.ok(countOn(r, type, maxLayer) >= need, `${region} ${type}: a route falls short`);
        else assert.ok(thinnestRoute(m, type, maxLayer).count >= need); // the Deep has too many routes to list
        assert.equal(m.nodes[0].type, 'entry');
        assert.equal(m.nodes.filter((n) => n.type === 'exit').length, 1);
        assert.deepEqual(m.nodes.map((n) => n.edges), map.nodes.map((n) => n.edges), 'the shape never changes');
      }
    }
  }
});

test('a contract is posted only while the uplink is ready and it is awake, and lapses after 6 hours', () => {
  const s = pet();
  s.contractCheckAge = s.ageMin - 60;
  s.lastRunEndAge = s.ageMin; // cooling down
  assert.equal(updateContract(s, always, [], T0), null);
  s.lastRunEndAge = null;
  s.asleep = true;
  s.contractCheckAge = s.ageMin - 60;
  assert.equal(updateContract(s, always, [], T0), null);
  s.asleep = false;
  // No time has passed since the last look: nothing is rolled.
  assert.equal(updateContract(s, always, [], T0), null);
  s.contractCheckAge = s.ageMin - 1;
  assert.equal(updateContract(s, always, [], T0), 'posted');
  assert.ok(CONTRACT_KINDS.includes(s.contract.kind));
  assert.match(s.log.at(-1).msg, /contract posted: .*pays \d+ scrip/);
  assert.equal(contractMinutesLeft(s), RUN_CFG.contractOpenMin);
  s.ageMin += RUN_CFG.contractOpenMin;
  assert.equal(updateContract(s, noRng, [], T0), 'expired');
  assert.equal(s.contract, null);
});

test('the chance counts the minutes since the last look, at most an hour of them', () => {
  const posted = (gap) => {
    let n = 0;
    const rng = mulberry32(3);
    for (let i = 0; i < 4000; i++) {
      const s = pet();
      s.contractCheckAge = s.ageMin - gap;
      if (updateContract(s, rng, [], T0) === 'posted') n++;
    }
    return n / 4000;
  };
  const hour = 1 - (1 - RUN_CFG.contractChancePerHour / 60) ** 60;
  assert.ok(Math.abs(posted(60) - hour) < 0.03, `an hour: ${posted(60)} vs ${hour}`);
  assert.ok(Math.abs(posted(600) - hour) < 0.03, 'ten hours away count as one');
});

test('only kinds that can be met are posted: markets need a market region and scrip, fragments need one left and room', () => {
  const kinds = (setup, codex = []) => {
    const seen = new Set();
    const rng = mulberry32(5);
    for (let i = 0; i < 600; i++) {
      const s = pet();
      setup(s);
      s.contractCheckAge = s.ageMin - 60;
      if (updateContract(s, rng, codex, T0) === 'posted') seen.add(`${s.contract.kind}:${s.contract.region}`);
    }
    return [...seen];
  };
  const all = kinds(() => {});
  assert.ok(all.some((k) => k.startsWith('market:')));
  for (const k of all.filter((x) => x.startsWith('market:'))) assert.ok(REGIONS[k.split(':')[1]].nodes.market > 0, k);
  assert.ok(!kinds((s) => (s.scrip = 0)).some((k) => k.startsWith('market:')), 'no scrip, no market job');
  assert.ok(!kinds((s) => (s.codexFound = RUN_CFG.codexPerLife)).some((k) => k.startsWith('fragment:')), 'memory full');
  const everything = FRAGMENTS.map((f) => f.id);
  assert.ok(!kinds(() => {}, everything).some((k) => k.startsWith('fragment:')), 'nothing left to find');
  // Only regions this netling can enter.
  assert.ok(kinds((s) => ((s.stage = 'baby'), (s.cleared = []))).every((k) => k.endsWith(':public')));
});

test('a jack-in into its region takes the contract along; another region leaves it posted', () => {
  const s = pet();
  s.contract = { kind: 'exit', region: 'bazaar', scrip: 15, item: null, postedAge: s.ageMin };
  startRun(s, 'public', mulberry32(2));
  assert.ok(s.contract, 'still posted');
  assert.equal(s.run.contract, undefined);
  s.run = null;
  startRun(s, 'bazaar', mulberry32(2));
  assert.equal(s.contract, null);
  assert.equal(s.run.contract.kind, 'exit');
});

// Walks a run to the exit along the first edge each time, winning (or losing) every ICE and leaving every choice.
function walk(s, rng, { winIce = true } = {}) {
  let res;
  while (s.run.phase !== 'done') {
    if (s.run.phase === 'ice') res = resolveIce(s, winIce, rng);
    else if (s.run.phase === 'choice') {
      const p = s.run.pending;
      const id = p.kind === 'relay' ? 'continue' : p.kind === 'market' ? 'leave' : p.options.find((o) => !o.disabled).id;
      res = choose(s, id, rng);
    } else res = moveTo(s, nodeById(s.run.map, s.run.pos).edges[0], rng);
    s.stats.integrity = 100;
    s.stats.charge = 90;
  }
  return res;
}

test('an ICE job always meets enough ICE on the way, with one to spare, and pays into the loot', () => {
  for (let seed = 1; seed <= 60; seed++) {
    const s = pet();
    s.form = 'firewall';
    s.contract = { kind: 'ice', region: 'ruins', n: 3, scrip: 20, item: 'coolant', postedAge: s.ageMin };
    startRun(s, 'ruins', mulberry32(seed));
    for (const r of routes(s.run.map)) assert.ok(countOn(r, 'ice') >= 3 + RUN_CFG.contractIceSpare, `seed ${seed}`);
    const before = s.scrip;
    const res = walk(s, mulberry32(seed + 100));
    assert.equal(res.contract, 'met');
    assert.equal(s.run.contract.settled, 'met');
    assert.ok(s.scrip >= Math.min(SCRIP.max, before + 20));
    assert.ok(s.inventory.includes('coolant'));
  }
});

test('ICE a Glitch or Ghost slips past counts toward the job', () => {
  const s = pet();
  s.form = 'glitch';
  s.contract = { kind: 'ice', region: 'public', n: 2, scrip: 20, item: null, postedAge: s.ageMin };
  startRun(s, 'public', mulberry32(4));
  walk(s, mulberry32(5));
  assert.ok(s.run.tally.icePhased >= 1);
  assert.equal(s.run.contract.settled, 'met');
});

test('a clean job fails on a lost fight; a missed job pays nothing; a disconnect or abort voids it', () => {
  const s = pet();
  s.form = 'firewall';
  s.contract = { kind: 'clean', region: 'public', scrip: 20, item: null, postedAge: s.ageMin };
  startRun(s, 'public', mulberry32(6));
  // Force an ICE fight to be lost, whatever the map.
  s.run.phase = 'ice';
  s.run.pending = { game: 'breach' };
  resolveIce(s, false, noRng);
  assert.equal(contractShort(s.run), 'JOB LOST: ICE');
  const before = s.scrip;
  walk(s, mulberry32(7));
  assert.equal(s.run.contract.settled, 'missed');
  assert.ok(s.run.messages.some((m) => m.startsWith('contract not met')));
  assert.ok(s.scrip - before < 20, 'no pay');

  for (const end of [(p) => abortRun(p), (p) => disconnect(p, 'test.')]) {
    const t = pet();
    t.contract = { kind: 'exit', region: 'public', scrip: 15, item: null, postedAge: t.ageMin };
    startRun(t, 'public', mulberry32(1));
    end(t);
    assert.equal(t.run.contract.settled, 'void');
  }
});

test('an exit job is met at the exit, not by jacking out at a relay', () => {
  const s = pet();
  s.contract = { kind: 'exit', region: 'public', scrip: 15, item: null, postedAge: s.ageMin };
  startRun(s, 'public', mulberry32(9));
  assert.deepEqual(contractProgress(s.run), { have: 0, need: 1 });
  jackOut(s);
  assert.equal(s.run.contract.settled, 'missed');
});

test('a fragment job makes the exit fragment certain; a market job puts a cheap offer on every market', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const s = pet();
    s.contract = { kind: 'fragment', region: 'corp', scrip: 25, item: null, postedAge: s.ageMin };
    startRun(s, 'corp', mulberry32(seed), [], []);
    s.form = 'firewall';
    walk(s, mulberry32(seed));
    assert.equal(s.run.contract.settled, 'met', `seed ${seed}`);
  }
  const cheapest = Math.min(...Object.values(SCRIP.price));
  for (let seed = 1; seed <= 30; seed++) {
    const s = pet();
    s.contract = { kind: 'market', region: 'bazaar', scrip: 15, item: null, postedAge: s.ageMin };
    startRun(s, 'bazaar', mulberry32(seed));
    const half = Math.ceil((s.run.map.layerCount - 2) * RUN_CFG.contractMarketBy);
    for (const r of routes(s.run.map)) assert.ok(countOn(r, 'market', half) >= 1, `seed ${seed}: a route with no early market`);
    // Walk to the first market and buy its first offer.
    const rng = mulberry32(seed);
    while (!(s.run.phase === 'choice' && s.run.pending.kind === 'market')) {
      if (s.run.phase === 'ice') resolveIce(s, true, rng);
      else if (s.run.phase === 'choice') choose(s, s.run.pending.kind === 'relay' ? 'continue' : s.run.pending.options.find((o) => !o.disabled).id, rng);
      else moveTo(s, nodeById(s.run.map, s.run.pos).edges[0], rng);
      s.stats.integrity = 100;
      s.stats.charge = 90;
    }
    assert.equal(SCRIP.price[s.run.pending.offers[0]], cheapest);
    assert.equal(choose(s, 'buy0', rng).ok, true);
    assert.deepEqual(contractProgress(s.run), { have: 1, need: 1 });
  }
});

test('an open contract and a run carrying one survive a save round trip; junk is dropped', () => {
  const s = pet();
  s.contract = { kind: 'ice', region: 'corp', n: 3, scrip: 20, item: 'repair', postedAge: s.ageMin };
  s.contractCheckAge = s.ageMin;
  const back = (x) => cleanSave(JSON.parse(JSON.stringify(x)), s.lastTick);
  assert.deepEqual(back(s).contract, s.contract);
  assert.equal(back(s).contractCheckAge, s.ageMin);
  for (const junk of [{ kind: 'nope', region: 'corp', postedAge: 1 }, { kind: 'exit', region: 'tutorial', postedAge: 1 }, { kind: 'exit', region: 'corp' }, 'x']) {
    assert.equal(back({ ...s, contract: junk }).contract, null, JSON.stringify(junk));
  }
  assert.deepEqual(back({ ...s, contract: { ...s.contract, n: 99, scrip: -4, item: 'nope' } }).contract, { ...s.contract, n: 5, scrip: 0, item: null });
  startRun(s, 'corp', mulberry32(1));
  s.run.contract.settled = 'met';
  assert.deepEqual(back(s).run.contract, s.run.contract);
  assert.equal(back({ ...s, run: { ...s.run, contract: { ...s.run.contract, settled: 'bogus' } } }).run.contract.settled, undefined);
});
