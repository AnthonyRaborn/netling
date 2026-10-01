import './helpers/utc.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createScript, mainframeAt, mulberry32, tick, CFG, MIN } from '../src/sim.js';
import { FRAGMENTS, ROOT_FRAGMENT_IDS, codexByRegion, liveFragments, nextFragment } from '../src/netrun/codex.js';
import { REGIONS, REGION_ORDER, regionLock, shownRegions } from '../src/netrun/regions.js';
import { MAINFRAME_ABILITIES, moveTo, resolveIce, runOptions, startRun, visibleNodeIds, RUN_CFG } from '../src/netrun/run.js';
import { dexEntries, CORRUPTED } from '../src/archive.js';
import { unlockedIds } from '../src/cosmetics.js';

// Build step 4 (docs/SOURCE_PLAN.md): Root Access opens the stage, the Source and its fragments, and the mainframe
// upgrades. All of it stays out of play while CFG.mainframe is off.
const T0 = Date.UTC(2026, 8, 26, 12, 0);
const noRng = () => 0.999;

function netling(stage, form) {
  const s = createScript({ now: T0, rng: mulberry32(1) });
  s.quirk.sleepOffset = 0;
  tick(s, T0 + CFG.bootMinutes * MIN, noRng);
  Object.assign(s, { stage, form, teenForm: 'kernel', rootAccess: true });
  Object.assign(s.stats, { charge: 100, sync: 90, integrity: 100, heat: 0 });
  return s;
}
function switchedOn(fn) {
  CFG.mainframe = true;
  try {
    return fn();
  } finally {
    CFG.mainframe = false;
  }
}
// Starts a run in `region` and turns the first step into a node of `type`.
function into(s, region, type, seed = 4) {
  startRun(s, region, mulberry32(seed));
  const next = runOptions(s.run)[0];
  next.type = type;
  return next;
}
const loseIce = (s) => {
  s.run.phase = 'ice';
  s.run.pending = { game: 'breach' };
  return resolveIce(s, false, noRng);
};

// --- Root Access opens the stage ---

test('no Root Access in the line, no Mainframe: the gate needs NL-0', () =>
  switchedOn(() => {
    const s = netling('adult', 'chrome');
    Object.assign(s, { rootAccess: false, rootCooling: false, deepExits: { all: 3, clean: 3 } });
    s.ageMin = mainframeAt(s);
    tick(s, s.lastTick + 3 * MIN, noRng);
    assert.equal(s.stage, 'adult', 'without Root Access it stays an adult');
    // The generation after a rescue rests from NL-0's protection, but Root Access was still earned.
    Object.assign(s, { rootCooling: true });
    tick(s, s.lastTick + 2 * MIN, noRng);
    assert.equal(s.form, 'plat');
  }));

test('until Root Access, mainframe forms read as corrupted data; after it, the usual ??? and hint', () =>
  switchedOn(() => {
    const before = dexEntries([]).find((e) => e.id === 'plat');
    assert.equal(before.corrupted, true);
    assert.equal(before.name, CORRUPTED.name);
    assert.doesNotMatch(before.text, /hint/);
    const after = dexEntries([], { rootEarned: true }).find((e) => e.id === 'plat');
    assert.equal(after.corrupted, undefined);
    assert.equal(after.name, '???');
    assert.match(after.text, /^hint:/);
    const found = dexEntries(['plat'], { rootEarned: true }).find((e) => e.id === 'plat');
    assert.equal(found.name, 'Plat');
    assert.match(found.runAbility, /twice/, 'its line\'s ability and its upgrade');
    assert.equal(dexEntries([]).find((e) => e.id === 'chrome').name, '???', 'adult forms are not affected');
  }));

// --- the Source and its fragments ---

test('the Source: last on the way down, for a mainframe, behind The Deep and deep-5', () => {
  assert.equal(REGION_ORDER.at(-1), 'source');
  assert.equal(REGIONS.source.minStage, 'mainframe');
  assert.equal(REGIONS.source.requires, 'deep-5');
  assert.ok(!REGIONS.source.nodes.market && !REGIONS.source.nodes.checkpoint, 'no markets or checkpoints');
  assert.match(regionLock('source', 'adult', ['deep-5'], REGION_ORDER.slice(0, 5)), /mainframe/);
  assert.match(regionLock('source', 'mainframe', ['deep-5'], REGION_ORDER.slice(0, 4)), /The Deep/);
  assert.equal(regionLock('source', 'mainframe', [], REGION_ORDER.slice(0, 5)), 'the way down is still hidden.');
  assert.equal(regionLock('source', 'mainframe', ['deep-5'], REGION_ORDER.slice(0, 5)), null);
  assert.equal(REGIONS.source.lockedName, '<<SECTOR CORRUpTED>>', 'never shown as ???');
  assert.ok(REGIONS.source.lockedBlurb);
  assert.ok(REGIONS.source.layers > REGIONS.deep.layers && REGIONS.source.iceDamage >= REGIONS.deep.iceDamage);
});

test('switched off, the Source and the new fragments are out of play', () => {
  assert.deepEqual(shownRegions(false), ['public', 'bazaar', 'corp', 'ruins', 'deep']);
  assert.deepEqual(shownRegions(true), REGION_ORDER);
  assert.equal(liveFragments().length, 22);
  const deep = ['deep-1', 'deep-2', 'deep-3', 'deep-4'];
  assert.equal(nextFragment('deep', deep), null, 'The Deep holds nothing more while off');
  assert.deepEqual(codexByRegion([], ['deep']).map((g) => g.total), [4]);
  switchedOn(() => {
    assert.equal(liveFragments().length, FRAGMENTS.length);
    assert.equal(nextFragment('deep', deep), 'deep-5', 'the hint at the Source is The Deep\'s last word');
    assert.equal(nextFragment('source', []), 'source-1');
    assert.deepEqual(codexByRegion([], ['deep', 'source']).map((g) => g.total), [5, 4]);
  });
});

test('every Source map can be crossed from entry to exit', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const s = netling('mainframe', 'init');
    startRun(s, 'source', mulberry32(seed));
    const nodes = s.run.map.nodes;
    const exit = nodes.find((n) => n.type === 'exit');
    const reach = new Set([nodes[0].id]);
    for (const n of nodes) if (reach.has(n.id)) n.edges.forEach((e) => reach.add(e)); // layers are in order
    assert.equal(reach.size, nodes.length, `seed ${seed}: unreachable node`);
    for (const n of nodes) if (n !== exit) assert.ok(n.edges.length > 0, `seed ${seed}: dead end`);
    assert.equal(nodes.filter((n) => n.type === 'market' || n.type === 'checkpoint').length, 0);
  }
});

test('NL-0 says it will wait, if it is watching, when a run goes down to the Source', () => {
  const s = netling('mainframe', 'whisper');
  startRun(s, 'source', mulberry32(3));
  assert.ok(s.run.messages.some((m) => m.includes("i'll wait up here")));
  const t = netling('mainframe', 'whisper');
  t.rootAccess = false;
  startRun(t, 'source', mulberry32(3));
  assert.ok(!t.run.messages.some((m) => m.includes('NL-0')));
  const u = netling('mainframe', 'whisper');
  startRun(u, 'deep', mulberry32(3));
  assert.ok(!u.run.messages.some((m) => m.includes('NL-0')), 'only the Source');
});

test('cosmetic goals count only the original fragments', () => {
  const ctx = (codex) => ({ dex: [], codex, lineage: [], generation: 1, progress: {}, flowMin: 0 });
  const ids = unlockedIds(ctx([...ROOT_FRAGMENT_IDS]));
  assert.ok(ids.includes('shell:gold'), 'Corp gold with the 22');
  assert.ok(ids.includes('tint:abyss'), 'Abyss with deep-1 to deep-4');
});

// --- the mainframe upgrades ---

test('Plat: corp insurance pays out twice a run (Chrome once)', () => {
  const s = netling('mainframe', 'plat');
  into(s, 'deep', 'cache');
  for (let i = 0; i < RUN_CFG.platInsurance; i++) {
    s.stats.integrity = 1;
    loseIce(s);
    assert.equal(s.stats.integrity, RUN_CFG.chromeInsurance, `payout ${i + 1}`);
  }
  s.stats.integrity = 1;
  assert.equal(loseIce(s).result, 'disconnected');
  const c = netling('adult', 'chrome');
  into(c, 'deep', 'cache');
  c.stats.integrity = 1;
  loseIce(c);
  c.stats.integrity = 1;
  assert.equal(loseIce(c).result, 'disconnected', 'an adult Chrome: once');
});

test('Airgap: a lost ICE fight adds no Heat, and still deals half damage', () => {
  const s = netling('mainframe', 'airgap');
  into(s, 'deep', 'cache');
  loseIce(s);
  assert.equal(s.stats.heat, RUN_CFG.airgapIceHeat);
  assert.equal(s.stats.integrity, 100 - Math.round(REGIONS.deep.iceDamage * RUN_CFG.firewallIceMult));
  const f = netling('adult', 'firewall');
  into(f, 'deep', 'cache');
  loseIce(f);
  assert.equal(f.stats.heat, RUN_CFG.iceLossHeat);
});

test('Init: sees three steps ahead and repairs more with every move', () => {
  const s = netling('mainframe', 'init');
  const d = netling('adult', 'daemon');
  for (const x of [s, d]) {
    x.stats.integrity = 50;
    moveTo(x, into(x, 'source', 'cache', 9).id, noRng);
  }
  assert.equal(s.stats.integrity, 50 + RUN_CFG.initMoveRepair);
  assert.equal(d.stats.integrity, 50 + RUN_CFG.daemonMoveRepair);
  assert.ok(visibleNodeIds(s).size > visibleNodeIds(d).size, 'farther sight');
});

test('Panic: slips through the first two ICE for certain (Glitch: one)', () => {
  const s = netling('mainframe', 'panic');
  into(s, 'deep', 'cache');
  const ice = (x) => {
    const next = runOptions(x.run)[0];
    next.type = 'ice';
    return moveTo(x, next.id, noRng);
  };
  assert.equal(ice(s).phased, true);
  assert.equal(ice(s).phased, true);
  assert.ok(ice(s).game, 'the third is a fight (noRng never rolls the later chance)');
  const g = netling('adult', 'glitch');
  into(g, 'deep', 'cache');
  assert.equal(ice(g).phased, true);
  assert.ok(ice(g).game);
});

test('Whisper: ICE misses it more often than it misses a Ghost', () => {
  const between = () => (RUN_CFG.ghostSlipChance + RUN_CFG.whisperSlipChance) / 2;
  const w = netling('mainframe', 'whisper');
  assert.equal(moveTo(w, into(w, 'deep', 'ice').id, between).phased, true);
  const g = netling('adult', 'ghost');
  assert.ok(moveTo(g, into(g, 'deep', 'ice').id, between).game, 'the same roll catches a Ghost');
});

test('every mainframe form names its upgrade', () => {
  assert.deepEqual(Object.keys(MAINFRAME_ABILITIES).sort(), ['airgap', 'init', 'panic', 'plat', 'whisper']);
});
