// The Rogue egg in the simulator fork, stage 2 (runs): docs/NETLING_2_ROGUE_DRAFTS.md 4.2, 6.2, 9.1 and 9.2. The trail (`run.hunt`), the trail
// hunter, ambushes, marks from lost hunter fights, danger sense and the hunt twists of the four kits. Deterministic: maps are built by hand and every
// roll is a stub.
import test from 'node:test';
import assert from 'node:assert/strict';
process.env.TZ = 'UTC';
const { createScript, mulberry32, ROGUE_TRAIT } = await import('./sim/sim.js');
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
// The hunt's own rules at the region thresholds: the Rogue trait (its +2, tested in rogue-goodend.test.js) is off here.
function withKits(fn) {
  const saved = [NR2.abilities, NR2.rogue.on, ROGUE_TRAIT.on];
  NR2.abilities = true;
  NR2.rogue.on = true;
  ROGUE_TRAIT.on = false;
  try {
    return fn();
  } finally {
    [NR2.abilities, NR2.rogue.on, ROGUE_TRAIT.on] = saved;
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
  assert.equal(e.run.hunt, huntThreshold({ region: 'deep' }) + 1, 'an ordinary lost fight: trail +1 (Breach, 7.4)');
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

test('cordonAmbush (off): 0 keeps ambushes out of the cordon layers only, on the same random draws', () => withKits(() => {
  const maps = (setting) => {
    const saved = NR2.rogue.cordonAmbush;
    NR2.rogue.cordonAmbush = setting;
    try {
      return Array.from({ length: 60 }, (_, i) => {
        const rng = mulberry32(i + 1);
        const s = createScript({ now: 0, rng });
        Object.assign(s, { egg: 'rogue', stage: 'adult', form: 'rogueAdultBreach' });
        startRun(s, 'deep', rng, []);
        return s.run.map;
      });
    } finally {
      NR2.rogue.cordonAmbush = saved;
    }
  };
  const on = maps({});
  const off = maps({ deep: 0 });
  let inCordon = 0;
  on.forEach((m, i) => {
    const cordon = m.rogueRules.cordon;
    assert.equal(cordon.length, 1, 'the Deep has one cordon');
    m.nodes.forEach((n, j) => {
      const o = off[i].nodes[j];
      if (cordon.includes(n.layer)) {
        if (n.ambush) inCordon++;
        assert.ok(!o.ambush, 'no ambush in a cordon layer');
      } else assert.equal(!!o.ambush, !!n.ambush, 'every other node as before');
    });
  });
  assert.ok(inCordon > 0, 'the decided map has cordon ambushes to take out');
}));

// Stage 2b: Rogue's own map rules (9.7, netrun/rogue-map.js).
const { rogueMapRules, rogueRelayLayer } = await import('./sim/netrun/rogue-map.js');
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

test('map rules: relayAt moves the guaranteed relay down (the middle one becomes quiet) and the cordon follows it; off, the middle layer', () => {
  assert.equal(rogueRelayLayer('deep', OFF), Math.ceil(REGIONS.deep.layers / 2));
  assert.equal(rogueRelayLayer('deep', { relayAt: { deep: 0.667 } }), 7);
  assert.equal(rogueRelayLayer('deep', { relayAt: { deep: 1 } }), REGIONS.deep.layers - 1, 'never the last layer');
  const middle = Math.ceil(REGIONS.deep.layers / 2);
  for (let seed = 1; seed <= 20; seed++) {
    const d = rogueMapRules(generateMap('deep', mulberry32(seed)), mulberry32(seed), { ...OFF, relayFactor: 0, relayAt: { deep: 0.667 }, cordons: { deep: [0] } });
    assert.equal(d.nodes.filter((n) => n.type === 'relay').length, 1, 'one relay: the moved one');
    assert.equal(d.nodes.find((n) => n.type === 'relay').layer, 7);
    assert.ok(d.nodes.filter((n) => n.layer === middle).every((n) => n.type !== 'relay'), 'the middle layer has none');
    assert.deepEqual(d.rogueRules.cordon, [8]);
    assert.equal(d.rogueRules.relayMoved, true);
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

test('map rules in a run: a Rogue Deep run has its relay two thirds down and the cordon after it (and, with narrow, the narrow map); an NL-0 run is untouched', () => withKits(() => {
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
      assert.deepEqual(s.run.map.rogueRules.cordon, [8], 'decided (7.4): the relay at layer 7, the cordon at 8');
      assert.ok(s.run.map.nodes.some((n) => n.layer === 7 && n.type === 'relay'));
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

test('Breach levers: lostTrail (decided at 1) sets the trail a lost fight adds; ambushShrug (off) makes a lost ambush an ordinary lost fight', () => withKits(() => {
  const saved = JSON.parse(JSON.stringify(NR2.rogue.kit.breach));
  try {
    assert.equal(NR2.rogue.kit.breach[1].lostTrail, 1, 'decided (7.4)');
    const s = setup('rogueAdultBreach', ['ice']);
    moveTo(s, 1, stub(0.99));
    resolveIce(s, false, stub(0.99));
    assert.equal(s.run.hunt, 2, 'the move (+1) and the lost fight (+1, not +2)');
    NR2.rogue.kit.breach[1].ambushShrug = 1;
    const a = setup('rogueAdultBreach', [{ type: 'ice', ambush: true }, 'checkpoint']);
    moveTo(a, 1, stub(0.5));
    assert.notEqual(resolveIce(a, false, stub(0.5)).result, 'disconnected');
    assert.equal(a.run.tally.ambushesShrugged, 1);
  } finally {
    NR2.rogue.kit.breach = saved;
  }
}));

test('Dodge levers: thresholdDelta (decided at -4) moves the hunter; headStart (off) frees the first n moves and charges every later one; slipTrail (off) marks a slip', () => withKits(() => {
  const saved = JSON.parse(JSON.stringify(NR2.rogue.kit.dodge));
  try {
    for (const l of [1, 2]) {
      assert.equal(NR2.rogue.kit.dodge[l].thresholdDelta, -4, 'decided (7.4)');
      assert.deepEqual(['headStart', 'slipTrail'].filter((k) => k in NR2.rogue.kit.dodge[l]), [], 'the others off');
    }
    NR2.rogue.kit.dodge[1].headStart = 2;
    const s = setup('rogueAdultDodge', ['checkpoint', 'checkpoint', 'checkpoint', 'checkpoint']);
    for (const [to, hunt] of [[1, 0], [2, 0], [3, 1], [4, 2]]) {
      moveTo(s, to, stub(0.99));
      assert.equal(s.run.hunt, hunt, `move ${to}`);
    }
    NR2.rogue.kit.dodge[1].thresholdDelta = -4;
    assert.equal(huntThreshold({ region: 'deep' }, s), huntThreshold({ region: 'deep' }) - 4);
    assert.equal(huntThreshold({ region: 'deep' }, setup('rogueAdultTune', ['checkpoint'])), huntThreshold({ region: 'deep' }), 'the other lines keep theirs');
    const h = setup('rogueAdultDodge', ['checkpoint', 'checkpoint'], { hunt: huntThreshold({ region: 'deep' }) - 4 });
    assert.equal(moveTo(h, 1, stub(0.99)).hunter, 'trail', 'the hunter comes at the lower threshold');
    NR2.rogue.kit.dodge[1].slipTrail = 1;
    const k = setup('rogueAdultDodge', ['ice'], { huntMoves: 2 });
    assert.equal(moveTo(k, 1, stub(0)).phased, true);
    assert.equal(k.run.hunt, 2, 'the move (+1, past the head start) and the slip (+1)');
  } finally {
    NR2.rogue.kit.dodge = saved;
  }
}));

test("the Rogue exit bonus (rogue.exitBonus, decided 1 in the Deep): in place of the region's exit items, for a Rogue netling only", () => withKits(() => {
  const saved = { ...NR2.rogue.exitBonus };
  const exitLoot = (form, egg) => {
    const s = setup(form, ['checkpoint'], { egg });
    moveTo(s, 1, stub(0.99));
    const before = s.run.loot.length;
    moveTo(s, 2, stub(0.99));
    return s.run.loot.length - before;
  };
  try {
    assert.deepEqual(NR2.rogue.exitBonus, { deep: 1 }, 'decided (7.4)');
    assert.equal(exitLoot('rogueAdultBreach', 'rogue'), 1);
    assert.equal(exitLoot('hidden', 'program'), REGIONS.deep.exitBonus, 'an NL-0 netling keeps the region bonus');
    delete NR2.rogue.exitBonus.deep;
    assert.equal(exitLoot('rogueAdultBreach', 'rogue'), REGIONS.deep.exitBonus, "not listed: the region's");
  } finally {
    NR2.rogue.exitBonus = saved;
  }
}));

// The Source-only levers for the gap between the lines (nr2.js rogue.source; docs/NETLING_2_ROGUE_DRAFTS.md 7.8). All off by default.
const { foresightView, nullifyIce, nullifiesLeft } = await import('./sim/netrun/run.js');
const { planMove, RUN_STYLES } = await import('./sim/netrun-bot.mjs');
const { sourceSet } = await import('./sim/netrun/nr2.js');
// Each lever test starts from the off set, its own levers on top.
function withSource(levers, fn) {
  const saved = NR2.rogue.source;
  NR2.rogue.source = Object.assign(sourceSet('off'), levers);
  try {
    return withKits(fn);
  } finally {
    NR2.rogue.source = saved;
  }
}
// Plays a straight map to its exit, losing every ICE fight; returns the netling.
function runLosing(form, types, region) {
  const s = setup(form, types, { region, stage: 'mainframe' });
  for (let to = 1; to <= types.length + 1; to++) {
    moveTo(s, to, stub(0.99));
    if (s.run.phase === 'ice') resolveIce(s, false, stub(0.99));
  }
  return s;
}

test('Source levers: the fifty set is the default (decided, 7.11); off is all neutral; thirtyfive kept for tuning', () => {
  assert.deepEqual(NR2.rogue.source, { breachFree: 1, breachChance: 0.5, tuneTypes: false, feastHeal: 1, dodgeSlip: 0.5, feastClean: 80, tuneReroll: { 1: 1, 2: 1 }, tuneNullify: { 1: 0, 2: 0 } });
  assert.deepEqual(sourceSet('off'), { breachFree: 0, breachChance: 1, tuneTypes: false, feastHeal: 1, dodgeSlip: 1, feastClean: 0, tuneReroll: { 1: 0, 2: 0 }, tuneNullify: { 1: 0, 2: 0 } });
  assert.deepEqual(sourceSet('thirtyfive'), { breachFree: 1, breachChance: 0.2, tuneTypes: false, feastHeal: 1, dodgeSlip: 0, feastClean: 100, tuneReroll: { 1: 0, 2: 0 }, tuneNullify: { 1: 1, 2: 1 } });
});

test('Source lever breachFree: a Sleeper with one lost ordinary fight in the Source still exits clean; two, or another line, or a lost hunter fight, do not', () => withSource({ breachFree: 1 }, () => {
  assert.equal(runLosing('rogueElderBreach', ['ice', 'checkpoint'], 'source').merge.clean, 1);
  assert.equal(runLosing('rogueElderBreach', ['ice', 'ice'], 'source').merge.clean, 0);
  assert.equal(runLosing('rogueElderFeast', ['ice', 'checkpoint'], 'source').merge.clean, 0);
  // Sleeper's save turns its first lost hunter fight into an ordinary one, but that loss still spoils "clean".
  const h = setup('rogueElderBreach', ['relay', 'checkpoint'], { region: 'source', stage: 'mainframe', hunt: huntThreshold({ region: 'source' }) });
  moveTo(h, 1, stub(0.99));
  resolveIce(h, false, stub(0.99));
  assert.equal(h.run.tally.hunterFightsLost, 1);
  choose(h, 'continue', stub(0.99));
  h.run.hunt = 0; // the save leaves the trail; clear it so the hunter does not wait again
  moveTo(h, 2, stub(0.99));
  moveTo(h, 3, stub(0.99));
  assert.equal(h.merge.clean, 0);
  NR2.rogue.source.breachFree = 0;
  assert.equal(runLosing('rogueElderBreach', ['ice', 'checkpoint'], 'source').merge.clean, 0, 'off: as before');
}));

test('Source lever feastHeal: Stash heals that many times its won-fight heal in the Source only', () => withSource({ feastHeal: 2 }, () => {
  const heal = (region) => {
    const s = setup('rogueElderFeast', ['ice', 'checkpoint'], { region, stage: 'mainframe' });
    s.stats.integrity = 40;
    moveTo(s, 1, stub(0.99));
    resolveIce(s, true, stub(0.99));
    return s.stats.integrity - 40;
  };
  assert.equal(heal('source'), 2 * NR2.ab.scavenge[2].winHeal);
  assert.equal(heal('deep'), NR2.ab.scavenge[2].winHeal);
}));

test("Source lever dodgeSlip: Exile's slip chance in the Source is multiplied by it, elsewhere unchanged", () => withSource({ dodgeSlip: 0.5 }, () => {
  const slips = (region, roll) => {
    const s = setup('rogueElderDodge', ['ice'], { region, stage: 'mainframe' });
    return moveTo(s, 1, stub(roll)).phased === true;
  };
  const u = NR2.rogue.kit.dodge[2].unseen; // 0.5
  assert.equal(slips('deep', u * 0.75), true);
  assert.equal(slips('source', u * 0.75), false, 'above the halved chance');
  assert.equal(slips('source', u * 0.25), true);
  const a = setup('rogueElderDodge', [{ type: 'ice', ambush: true }], { region: 'source', stage: 'mainframe' });
  assert.notEqual(moveTo(a, 1, stub(u * 0.75)).phased, true, "Exile's ambush slip is trimmed too");
}));

test('Source lever tuneTypes: Handler reads every Source ICE game and tier (an ambush a decoy), matching what the fight rolls; the planner uses it on danger-sensed nodes', () => withSource({ tuneTypes: true }, () => {
  const s = setup('rogueElderTune', ['checkpoint', 'ice', { type: 'ice', ambush: true }, 'ice'], { region: 'source', stage: 'mainframe', fate: 12345 });
  const view = foresightView(s);
  assert.deepEqual(Object.keys(view).map(Number), [2, 3, 4]);
  for (const v of Object.values(view)) assert.ok(['breach', 'dodge', 'tune', 'feast'].includes(v.game) && [1, 2].includes(v.tier));
  moveTo(s, 1, stub(0.99));
  const r = moveTo(s, 2, stub(0.99));
  assert.equal(r.game, view[2].game, 'the fight is the game it read');
  assert.equal(foresightView(setup('rogueElderTune', ['ice'], { region: 'deep', stage: 'mainframe', fate: 1 }))[1], undefined, 'Source only');
  assert.deepEqual(foresightView(setup('rogueElderFeast', ['ice'], { region: 'source', stage: 'mainframe', fate: 1 })), {}, 'Handler and Spook only');
  // Two unseen danger nodes: the planner avoids the one it reads as tier 2.
  const map = { nodes: [{ id: 0, layer: 0, type: 'entry', edges: [1, 2] }, { id: 1, layer: 1, type: 'ice', edges: [3] }, { id: 2, layer: 1, type: 'ice', edges: [3] }, { id: 3, layer: 2, type: 'exit', edges: [] }] };
  const ctx = { style: RUN_STYLES.skilled, hot: false, danger: { 1: 'danger', 2: 'danger', 3: 'quiet' }, ambush: new Set() };
  const pick = (v) => planMove(map, [map.nodes[1], map.nodes[2]], new Set(), false, 3, false, v, ctx).id;
  const tiers = NR2.tiers;
  NR2.tiers = true;
  try {
    assert.equal(pick({ 1: { game: 'tune', tier: 2 }, 2: { game: 'tune', tier: 1 } }), 2);
    assert.equal(pick({ 1: { game: 'tune', tier: 1 }, 2: { game: 'tune', tier: 2 } }), 1);
  } finally {
    NR2.tiers = tiers;
  }
}));

test('Source lever feastClean: a Stash Source exit at that Integrity or more counts as clean despite a loss; below it, or another line, does not', () => withSource({ feastClean: 90 }, () => {
  const exitAt = (form, integrity) => {
    const s = setup(form, ['ice', 'checkpoint'], { region: 'source', stage: 'mainframe' });
    moveTo(s, 1, stub(0.99));
    resolveIce(s, false, stub(0.99));
    s.stats.integrity = integrity;
    moveTo(s, 2, stub(0.99));
    moveTo(s, 3, stub(0.99));
    return s.merge.clean;
  };
  assert.equal(exitAt('rogueElderFeast', 90), 1);
  assert.equal(exitAt('rogueElderFeast', 89), 0);
  assert.equal(exitAt('rogueElderBreach', 100), 0);
}));

test('Source lever tuneReroll: Handler replays a lost ordinary fight (no damage, no loss counted) as many times as its level allows', () => withSource({ tuneReroll: { 1: 1, 2: 2 } }, () => {
  const s = setup('rogueElderTune', ['ice', 'checkpoint'], { region: 'source', stage: 'mainframe' });
  moveTo(s, 1, stub(0.99));
  const game = s.run.pending.game;
  for (let i = 0; i < 2; i++) {
    assert.equal(resolveIce(s, false, stub(0.99)).rerolled, true);
    assert.deepEqual([s.run.phase, s.run.pending.game, s.stats.integrity, s.run.tally.iceLost], ['ice', game, 90, 0]);
  }
  assert.notEqual(resolveIce(s, false, stub(0.99)).rerolled, true, 'the third loss stands');
  assert.equal(s.run.tally.iceLost, 1);
  const a = setup('rogueAdultTune', ['ice'], { region: 'source', stage: 'adult' });
  moveTo(a, 1, stub(0.99));
  assert.equal(resolveIce(a, false, stub(0.99)).rerolled, true);
  assert.notEqual(resolveIce(a, false, stub(0.99)).rerolled, true, 'the adult has one');
  const d = setup('rogueElderTune', ['ice'], { region: 'deep', stage: 'mainframe' });
  moveTo(d, 1, stub(0.99));
  assert.notEqual(resolveIce(d, false, stub(0.99)).rerolled, true, 'Source only');
}));

test('Source lever tuneNullify: Handler passes a shown ordinary fight without a win or a loss, as many as its level allows; never a hunter fight', () => withSource({ tuneNullify: { 1: 1, 2: 2 } }, () => {
  const s = setup('rogueElderTune', ['ice', 'ice', 'ice'], { region: 'source', stage: 'mainframe' });
  assert.equal(nullifiesLeft(s), 2);
  for (const to of [1, 2]) {
    moveTo(s, to, stub(0.99));
    assert.equal(nullifyIce(s).ok, true);
    assert.equal(s.run.phase, 'map');
  }
  moveTo(s, 3, stub(0.99));
  assert.equal(nullifyIce(s).ok, false, 'none left');
  assert.deepEqual([s.run.tally.iceWon, s.run.tally.iceLost, s.run.tally.nullified], [0, 0, 2]);
  const h = setup('rogueElderTune', ['relay'], { region: 'source', stage: 'mainframe', hunt: huntThreshold({ region: 'source' }) });
  moveTo(h, 1, stub(0.99));
  assert.equal(h.run.pending.hunter, 'trail');
  assert.equal(nullifyIce(h).ok, false, 'not the hunter');
  assert.equal(nullifiesLeft(setup('rogueElderFeast', ['ice'], { region: 'source', stage: 'mainframe' })), 0, 'Spook and Handler only');
}));

test('Source lever breachChance: the free loss is forgiven only when the roll at the loss succeeds', () => withSource({ breachFree: 1, breachChance: 0.5 }, () => {
  const exit = (roll) => {
    const s = setup('rogueElderBreach', ['ice', 'checkpoint'], { region: 'source', stage: 'mainframe' });
    moveTo(s, 1, stub(0.99));
    resolveIce(s, false, stub(roll));
    moveTo(s, 2, stub(0.99));
    moveTo(s, 3, stub(0.99));
    return s.merge.clean;
  };
  assert.equal(exit(0.4), 1);
  assert.equal(exit(0.6), 0);
}));
