// The Rogue egg in the simulator fork, stage 2 (runs): docs/NETLING_2_ROGUE_DRAFTS.md 4.2, 6.2, 9.1 and 9.2. The trail (`run.hunt`), the trail
// hunter, ambushes, marks from lost hunter fights, danger sense and the hunt twists of the four kits. Deterministic: maps are built by hand and every
// roll is a stub.
import test from 'node:test';
import assert from 'node:assert/strict';
process.env.TZ = 'UTC';
const { createScript, mulberry32 } = await import('./sim/sim.js');
const { startRun, moveTo, resolveIce, choose, jackOut, hunted, huntThreshold, sendAgent, dangerView, ambushSeen } = await import('./sim/netrun/run.js');
const { NR2 } = await import('./sim/netrun/nr2.js');

const stub = (v) => () => v;
// A straight map: the entry, the given nodes one a layer, then the exit.
function chain(types, region = 'deep') {
  const nodes = [{ id: 0, layer: 0, type: 'entry', edges: [1] }];
  types.forEach((t, i) => nodes.push({ id: i + 1, layer: i + 1, edges: [i + 2], ...(typeof t === 'string' ? { type: t } : t) }));
  nodes.push({ id: types.length + 1, layer: types.length + 1, type: 'exit', edges: [] });
  return { region, nodes, layerCount: types.length + 2 };
}
function setup(form, types, { region = 'deep', egg = 'rogue', stage = 'adult', ...extra } = {}) {
  const rng = mulberry32(5);
  const s = createScript({ now: 0, rng });
  s.egg = egg;
  s.stage = stage;
  s.form = form;
  Object.assign(s.stats, { charge: 90, integrity: 90, heat: 30 });
  startRun(s, region, rng, []);
  s.run.map = chain(types, region);
  s.run.pos = 0;
  s.run.visited = [0];
  Object.assign(s.run, extra);
  return s;
}
// Every test runs with the kits on (NR2.abilities) and the Rogue rules on, as NR2=all would.
function withKits(fn) {
  const saved = [NR2.abilities, NR2.rogue.on];
  NR2.abilities = true;
  NR2.rogue.on = true;
  try {
    return fn();
  } finally {
    [NR2.abilities, NR2.rogue.on] = saved;
  }
}

test('only a Rogue netling is hunted, and only with the rules on; the trail starts at 0 and a move adds 1 (Skip: every second move)', () => withKits(() => {
  assert.equal(hunted(setup('hidden', ['checkpoint'], { egg: 'program' })), false);
  const s = setup('rogueAdultBreach', ['checkpoint', 'checkpoint']);
  assert.equal(hunted(s), true);
  assert.equal(s.run.hunt, 0);
  moveTo(s, 1, stub(0.99));
  assert.equal(s.run.hunt, 1);
  const k = setup('rogueAdultDodge', ['checkpoint', 'checkpoint']);
  moveTo(k, 1, stub(0.99));
  assert.equal(k.run.hunt, 0);
  moveTo(k, 2, stub(0.99));
  assert.equal(k.run.hunt, 1);
  NR2.rogue.on = false;
  assert.equal(hunted(setup('rogueAdultBreach', ['checkpoint'])), false);
}));

test('at the threshold the hunter waits at the next node, at the hunter tier; won, the trail falls to 0 and the node follows', () => withKits(() => {
  const s = setup('rogueAdultFeast', ['relay'], { hunt: huntThreshold({ region: 'deep' }) });
  const r = moveTo(s, 1, stub(0.99));
  assert.equal(r.hunter, 'trail');
  assert.deepEqual([s.run.phase, s.run.pending.tier, s.run.pending.deferred], ['ice', NR2.rogue.hunterTier, 1]);
  assert.equal(s.run.hunt, huntThreshold({ region: 'deep' }), 'the move that meets the hunter adds no trail');
  resolveIce(s, true, stub(0.99));
  assert.equal(s.run.hunt, 0);
  assert.equal(s.run.pending?.kind, 'relay', "the relay's own choice follows the won fight");
}));

test("a lost hunter fight: the hunter's damage, then a mark and a disconnect; Mole takes its own share; Sleeper's save keeps it going once", () => withKits(() => {
  const s = setup('rogueAdultFeast', ['relay'], { hunt: huntThreshold({ region: 'deep' }) });
  moveTo(s, 1, stub(0.99));
  assert.equal(resolveIce(s, false, stub(0.99)).result, 'disconnected');
  assert.equal(s.marks, 1);
  assert.equal(s.markSources['trail hunter'], 1);
  assert.equal(s.run.tally.huntersLost, 1);
  assert.ok(s.run.messages.some((m) => m.includes('-75 integrity')), 'the Deep at 50, x1.5');
  const m = setup('rogueAdultBreach', ['relay'], { hunt: huntThreshold({ region: 'deep' }) });
  moveTo(m, 1, stub(0.99));
  resolveIce(m, false, stub(0.99));
  assert.ok(m.run.messages.some((x) => x.includes('-35 integrity')), 'Mole: 50 x 0.7, no 1.5x');
  assert.equal(m.marks, 1);
  const e = setup('rogueAdultBreach', ['relay', 'checkpoint'], { stage: 'mainframe', hunt: huntThreshold({ region: 'deep' }) });
  e.form = 'rogueElderBreach';
  moveTo(e, 1, stub(0.99));
  const r = resolveIce(e, false, stub(0.99));
  assert.notEqual(r.result, 'disconnected');
  assert.equal(e.marks ?? 0, 0);
  assert.equal(e.run.hunt, huntThreshold({ region: 'deep' }) + 2, 'an ordinary lost fight: trail +2');
  assert.equal(e.run.pending?.kind, 'relay');
}));

test('an ambush: a lost fight of trail on entering, won or lost; lost is a disconnect (a mark only with ambushMark); Exile can slip it', () => withKits(() => {
  const s = setup('rogueAdultFeast', [{ type: 'ice', ambush: true }]);
  const r = moveTo(s, 1, stub(0.99));
  assert.equal(r.hunter, 'ambush');
  assert.equal(s.run.hunt, 3, 'the move (+1) and the ambush (+2)');
  resolveIce(s, true, stub(0.99));
  assert.equal(s.run.hunt, 3, 'a won ambush leaves the trail');
  const l = setup('rogueAdultFeast', [{ type: 'ice', ambush: true }]);
  moveTo(l, 1, stub(0.99));
  assert.equal(resolveIce(l, false, stub(0.99)).result, 'disconnected');
  assert.equal(l.marks ?? 0, 0, 'decided (7.4): a lost ambush disconnects but gives no mark');
  const saved = NR2.rogue.ambushMark;
  NR2.rogue.ambushMark = true;
  try {
    const lm = setup('rogueAdultFeast', [{ type: 'ice', ambush: true }]);
    moveTo(lm, 1, stub(0.99));
    resolveIce(lm, false, stub(0.99));
    assert.equal(lm.markSources.ambush, 1, 'with ambushMark (the draft) it marks too');
  } finally {
    NR2.rogue.ambushMark = saved;
  }
  const x = setup('rogueAdultDodge', [{ type: 'ice', ambush: true }], { stage: 'mainframe' });
  x.form = 'rogueElderDodge';
  assert.equal(moveTo(x, 1, stub(0)).phased, true);
  assert.equal(x.run.tally.ambushesSlipped, 1);
  const k = setup('rogueAdultDodge', [{ type: 'ice', ambush: true }]);
  assert.equal(moveTo(k, 1, stub(0)).hunter, 'ambush', "Skip's slip never works on an ambush");
}));

test('the trail rises: a lost ICE fight +2, an anomaly choice +1, a market purchase +1; a won ICE fight adds nothing', () => withKits(() => {
  const s = setup('rogueAdultFeast', ['ice', 'ice']);
  moveTo(s, 1, stub(0.99));
  resolveIce(s, false, stub(0.99));
  assert.equal(s.run.hunt, 3);
  moveTo(s, 2, stub(0.99));
  resolveIce(s, true, stub(0.99));
  assert.equal(s.run.hunt, 4);
  const a = setup('rogueAdultFeast', ['anomaly']);
  moveTo(a, 1, stub(0.5));
  choose(a, a.run.pending.options[0].id, stub(0.5));
  assert.equal(a.run.hunt, 2);
  const b = setup('rogueAdultFeast', [{ type: 'market', flavor: 'black' }]);
  b.scrip = 200;
  moveTo(b, 1, stub(0.5));
  const buy = b.run.pending.options.find((o) => o.id === 'buy0');
  assert.ok(buy && !buy.disabled);
  choose(b, 'buy0', stub(0.5));
  assert.equal(b.run.hunt, 2);
}));

test('the dead drop: Drop leaves its cheapest item at a relay for trail -3; Stash gets it back at the end of the run', () => withKits(() => {
  for (const [form, stage, kept] of [['rogueAdultFeast', 'adult', false], ['rogueElderFeast', 'mainframe', true]]) {
    const s = setup('rogueAdultFeast', ['relay'], { stage, hunt: 5 });
    s.form = form;
    s.run.loot = ['repair', 'coolant'];
    moveTo(s, 1, stub(0.99));
    assert.ok(s.run.pending.options.some((o) => o.id === 'deaddrop'));
    choose(s, 'deaddrop', stub(0.99));
    assert.equal(s.run.hunt, 3);
    assert.equal(s.run.loot.length, 1);
    assert.equal(s.run.pending.kind, 'relay');
    assert.equal(s.run.pending.options.some((o) => o.id === 'deaddrop'), false, 'once a relay');
    const before = s.inventory.length;
    jackOut(s);
    assert.equal(s.inventory.length - before, kept ? 2 : 1, form);
  }
  const k = setup('rogueAdultTune', ['relay'], { hunt: 5 });
  k.run.loot = ['repair'];
  moveTo(k, 1, stub(0.99));
  assert.equal(k.run.pending.options.some((o) => o.id === 'deaddrop'), false, 'only the Feast forms');
}));

test("Handler's agent sheds trail 4 once a run; Spook has none", () => withKits(() => {
  const h = setup('rogueAdultTune', ['checkpoint'], { stage: 'mainframe', hunt: 9 });
  h.form = 'rogueElderTune';
  assert.equal(sendAgent(h).ok, true);
  assert.equal(h.run.hunt, 5);
  assert.equal(sendAgent(h).ok, false);
  const s = setup('rogueAdultTune', ['checkpoint'], { hunt: 9 });
  assert.equal(sendAgent(s).ok, false);
}));

test('danger sense: every unvisited node as danger or quiet, dark under Blackout; Spook tells an ambush from ICE beyond its sight', () => withKits(() => {
  const s = setup('rogueAdultBreach', ['ice', 'cache', { type: 'ice', ambush: true }]);
  assert.deepEqual(dangerView(s), { 1: 'danger', 2: 'quiet', 3: 'danger', 4: 'quiet' });
  s.run.challenge = 'blackout';
  assert.deepEqual(dangerView(s), {});
  const far = ['checkpoint', 'checkpoint', { type: 'ice', ambush: true }];
  assert.equal(ambushSeen(setup('rogueAdultBreach', far)).size, 0, 'Mole sees one step');
  assert.deepEqual([...ambushSeen(setup('rogueAdultTune', far))], [3], 'Spook: types two steps out, ambushes three');
  assert.deepEqual(dangerView(setup('hidden', ['ice'], { egg: 'program' })), {}, 'an NL-0 netling has no danger sense');
}));

test('ambushes are a share of a region ICE nodes (none in the Public Net), drawn after the map', () => withKits(() => {
  const count = (region) => {
    let ice = 0;
    let amb = 0;
    for (let i = 1; i <= 60; i++) {
      const rng = mulberry32(i);
      const s = createScript({ now: 0, rng });
      Object.assign(s, { egg: 'rogue', stage: 'adult', form: 'rogueAdultBreach' });
      startRun(s, region, rng, []);
      for (const n of s.run.map.nodes) if (n.type === 'ice') { ice++; if (n.ambush) amb++; }
      assert.ok(s.run.map.nodes.every((n) => !n.ambush || n.type === 'ice'));
    }
    return amb / ice;
  };
  assert.equal(count('public'), 0);
  const deep = count('deep');
  assert.ok(deep > 0.15 && deep < 0.35, `deep share ${deep}`);
}));

// Stage 2b: Rogue's own map rules (9.7, netrun/rogue-map.js).
const { rogueMapRules } = await import('./sim/netrun/rogue-map.js');
const { generateMap } = await import('../../src/netrun/map.js');
const { REGIONS } = await import('../../src/netrun/regions.js');
const OFF = { relayFactor: 1, toIce: {}, cordons: {}, guardShare: 0 };
const types = (m) => m.nodes.map((n) => n.type).join(',');

test('map rules: with every rule off the map is the ordinary one', () => {
  for (const region of ['public', 'corp', 'deep', 'source']) {
    for (let seed = 1; seed <= 20; seed++) {
      const a = generateMap(region, mulberry32(seed));
      const b = rogueMapRules(generateMap(region, mulberry32(seed)), mulberry32(99), OFF);
      assert.equal(types(b), types(a));
    }
  }
});

test('map rules: cordons (the layer after the relay; the Source a second about two thirds down), and the relay layer keeps its relay', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const d = rogueMapRules(generateMap('deep', mulberry32(seed)), mulberry32(seed), { ...OFF, relayFactor: 0, cordons: { deep: [0], source: [0, 0.667] } });
    const relayLayer = Math.ceil(REGIONS.deep.layers / 2);
    assert.deepEqual(d.rogueRules.cordon, [relayLayer + 1]);
    assert.ok(d.nodes.filter((n) => n.layer === relayLayer + 1).every((n) => n.type === 'ice'));
    assert.equal(d.nodes.filter((n) => n.type === 'relay').length, 1, 'extra relays thinned, the relay layer keeps one');
    assert.equal(d.nodes.find((n) => n.type === 'relay').layer, relayLayer);
    const s = rogueMapRules(generateMap('source', mulberry32(seed)), mulberry32(seed), { ...OFF, cordons: { source: [0, 0.667] } });
    assert.deepEqual(s.rogueRules.cordon, [8, 10]);
  }
});

test('map rules: Corp Grid checkpoints become ICE at the share; guards make every way into a guarded cache or market danger, moving ICE, not adding it', () => {
  const c = rogueMapRules(generateMap('corp', mulberry32(3)), mulberry32(3), { ...OFF, toIce: { corp: 1 } });
  assert.equal(c.nodes.filter((n) => n.type === 'checkpoint').length, 0);
  for (let seed = 1; seed <= 30; seed++) {
    const before = generateMap('ruins', mulberry32(seed));
    const ice = before.nodes.filter((n) => n.type === 'ice').length;
    const m = rogueMapRules(generateMap('ruins', mulberry32(seed)), mulberry32(seed), { ...OFF, guardShare: 1 });
    const after = m.nodes.filter((n) => n.type === 'ice').length;
    assert.ok(after >= ice && after - ice === m.rogueRules.guardIce - m.rogueRules.guardMoved, 'only the guards no spare ICE could pay for are added');
    assert.ok(m.rogueRules.guardMoved <= m.rogueRules.guardIce);
  }
});

test('map rules in a run: a Rogue Deep run has its cordon (and, with narrow, the narrow map); an NL-0 run is untouched', () => withKits(() => {
  const saved = [NR2.map.on, NR2.rogue.map.on];
  NR2.map.on = true;
  NR2.rogue.map.on = true;
  try {
    for (let seed = 1; seed <= 15; seed++) {
      const rng = mulberry32(seed);
      const s = createScript({ now: 0, rng });
      Object.assign(s, { egg: 'rogue', stage: 'adult', form: 'rogueAdultBreach' });
      startRun(s, 'deep', rng, []);
      const widths = Array.from({ length: REGIONS.deep.layers }, (_, i) => s.run.map.nodes.filter((n) => n.layer === i + 1).length);
      if (NR2.rogue.map.narrow.includes('deep')) assert.ok(Math.max(...widths) <= 3, 'narrow: 2 to 3 a layer');
      assert.deepEqual(s.run.map.rogueRules.cordon, [6]);
      const rng2 = mulberry32(seed);
      const p = createScript({ now: 0, rng: rng2 });
      Object.assign(p, { egg: 'program', stage: 'adult', form: 'hidden' });
      startRun(p, 'deep', rng2, []);
      assert.equal(p.run.map.rogueRules, undefined);
    }
  } finally {
    [NR2.map.on, NR2.rogue.map.on] = saved;
  }
}));
