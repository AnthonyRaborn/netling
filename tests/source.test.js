import './helpers/utc.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createScript, mainframeAt, mulberry32, tick, CFG, MIN } from '../src/sim.js';
import { FRAGMENTS, ROOT_FRAGMENT_IDS, codexByRegion, liveFragments, nextFragment } from '../src/netrun/codex.js';
import { REGIONS, REGION_ORDER, regionLock, shownRegions } from '../src/netrun/regions.js';
import { MAINFRAME_ABILITIES, choose, moveTo, resolveIce, runOptions, startRun, visibleNodeIds, RUN_CFG } from '../src/netrun/run.js';
import { ANOMALIES, anomaliesFor } from '../src/netrun/anomalies.js';
import { dexEntries, mainframeManual, CORRUPTED } from '../src/archive.js';
import { COSMETICS, LEGACY, ORIGINAL_SHELLS, SLOTS, shownCosmetics, unlockedIds } from '../src/cosmetics.js';
import { PROPS } from '../src/accessories.js';
import { cleanProgress } from '../src/sanitize.js';
import { SPRITES } from '../src/sprites.js';
import { musicSettings, MUSIC_IDS } from '../src/tracks.js';

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
function withSwitch(on, fn) {
  const was = CFG.mainframe;
  CFG.mainframe = on;
  try {
    return fn();
  } finally {
    CFG.mainframe = was;
  }
}
const switchedOn = (fn) => withSwitch(true, fn);
const switchedOff = (fn) => withSwitch(false, fn);
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
  assert.equal(REGIONS.source.lockedName, '<<SECTOR CORRUPTED>>', 'never shown as ???');
  assert.ok(REGIONS.source.lockedBlurb);
  assert.ok(REGIONS.source.layers > REGIONS.deep.layers && REGIONS.source.iceDamage >= REGIONS.deep.iceDamage);
});

test('switched off, the Source and the new fragments are out of play', () => {
  assert.deepEqual(shownRegions(false), ['public', 'bazaar', 'corp', 'ruins', 'deep']);
  assert.deepEqual(shownRegions(true), REGION_ORDER);
  const deep = ['deep-1', 'deep-2', 'deep-3', 'deep-4'];
  switchedOff(() => {
    assert.equal(liveFragments().length, 22);
    assert.equal(nextFragment('deep', deep), null, 'The Deep holds nothing more while off');
    assert.deepEqual(codexByRegion([], ['deep']).map((g) => g.total), [4]);
  });
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

test('Airgap: the first ICE fight it loses each run barely scratches it; the next ones deal half damage', () => {
  const half = Math.round(REGIONS.source.iceDamage * RUN_CFG.firewallIceMult);
  const s = netling('mainframe', 'airgap');
  into(s, 'source', 'cache');
  loseIce(s);
  assert.equal(s.stats.integrity, 100 - Math.round(half * RUN_CFG.airgapSoftMult), 'softened');
  loseIce(s);
  assert.equal(s.stats.integrity, 100 - Math.round(half * RUN_CFG.airgapSoftMult) - half, 'then half damage, as a Firewall');
  assert.equal(s.stats.heat, 2 * RUN_CFG.iceLossHeat, 'Heat as anyone');
  const f = netling('adult', 'firewall');
  into(f, 'source', 'cache');
  loseIce(f);
  assert.equal(f.stats.integrity, 100 - half, 'an adult Firewall is not softened');
});

test('Plat: relays patch it more than an adult Chrome', () => {
  for (const [stage, form, repair] of [['mainframe', 'plat', RUN_CFG.platRelayRepair], ['adult', 'chrome', RUN_CFG.chromeRelayRepair]]) {
    const s = netling(stage, form);
    s.stats.integrity = 40;
    moveTo(s, into(s, 'deep', 'relay').id, noRng);
    assert.equal(s.stats.integrity, 40 + repair, form);
  }
  assert.ok(RUN_CFG.platRelayRepair > RUN_CFG.chromeRelayRepair);
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

// --- build step 6: what the player sees ---

const MAINFRAME_UNLOCKS = ['crest:rack', 'tint:readonly', 'music:firstcommit', 'effect:sourcelight'];
const progressCtx = (over = {}) => ({ dex: [], codex: [], lineage: [], generation: 1, progress: {}, flowMin: 0, ...over });

test('the Mainframe unlocks: hidden while switched off, each earned by its own goal once on', () => {
  const all = progressCtx({ dex: ['plat'], codex: FRAGMENTS.map((f) => f.id), progress: { sourceExits: 3 } });
  for (const key of MAINFRAME_UNLOCKS) {
    const [slot, id] = key.split(':');
    assert.ok(COSMETICS[slot].find((c) => c.id === id).mainframe, `${key} is marked`);
    assert.ok(!shownCosmetics(slot, false).some((c) => c.id === id), `${key} is out of the wardrobe while off`);
  }
  assert.ok(!MAINFRAME_UNLOCKS.some((k) => switchedOff(() => unlockedIds(all)).includes(k)), 'and never unlocks while off');
  switchedOn(() => {
    const ids = (over) => unlockedIds(progressCtx(over)).filter((k) => MAINFRAME_UNLOCKS.includes(k));
    assert.deepEqual(ids({}), []);
    assert.deepEqual(ids({ dex: ['init'] }), ['crest:rack'], 'any mainframe form in the dex');
    assert.deepEqual(ids({ codex: ['source-1', 'source-2', 'source-3', 'source-4'] }), ['tint:readonly'], 'the Source codex');
    assert.deepEqual(ids({ progress: { sourceExits: 1 } }), ['music:firstcommit'], 'back from the Source once');
    assert.deepEqual(ids({ progress: { sourceExits: 3 } }).sort(), ['effect:sourcelight', 'music:firstcommit'], 'three times');
    for (const slot of SLOTS) assert.equal(shownCosmetics(slot).length, COSMETICS[slot].length);
  });
});

test('a shell for each mainframe form: raised once, hidden while off, and not needed for the Mini device', () => {
  const SHELLS = { plat: 'platinum', airgap: 'airgap', init: 'pidone', panic: 'torn', whisper: 'faint' };
  for (const [form, id] of Object.entries(SHELLS)) {
    const shell = COSMETICS.shell.find((c) => c.id === id);
    assert.ok(shell?.mainframe, `${id} is marked`);
    assert.ok(!shownCosmetics('shell', false).some((c) => c.id === id), `${id} is out of the wardrobe while off`);
    assert.ok(!switchedOff(() => unlockedIds(progressCtx({ dex: [form] }))).includes(`shell:${id}`));
    const got = switchedOn(() => unlockedIds(progressCtx({ dex: [form] })).filter((k) => k.startsWith('shell:') && k !== 'shell:standard'));
    assert.deepEqual(got, [`shell:${id}`], `${form} unlocks only its own shell`);
  }
  // The Mini device asks for the nine shells from before the stage, so that goal did not move.
  assert.deepEqual(ORIGINAL_SHELLS, COSMETICS.shell.filter((c) => !c.mainframe).map((c) => c.id));
  assert.equal(ORIGINAL_SHELLS.length, 9);
});

test('progress keeps the Source exits and the one-time repair of its name, cleaned', () => {
  assert.equal(cleanProgress({ sourceExits: 4, sourceSeen: true }).sourceExits, 4);
  assert.equal(cleanProgress({ sourceSeen: true }).sourceSeen, true);
  assert.equal(cleanProgress({ sourceExits: -3, sourceSeen: 'yes' }).sourceExits, 0);
  assert.ok(!('sourceSeen' in cleanProgress({ sourceSeen: 'yes' })));
});

test('a mainframe in the lineage counts as its adult form for Full house', () => {
  const life = (form) => ({ cause: 'end of life cycle', form, realized: true });
  assert.equal(LEGACY.adultsRaised(progressCtx({ lineage: [life('chrome'), life('plat'), life('panic')] })), 2, 'Plat is a Chrome; Panic a Glitch');
});

test('the field manual\'s row: nothing while off, corrupted until Root Access, a hint, then the rule', () => {
  assert.equal(mainframeManual([], { on: false }), null);
  assert.match(mainframeManual([], { on: true }).join(' '), /record corrupted/);
  assert.doesNotMatch(mainframeManual([], { on: true }).join(' '), /mainframe|deep/i, 'says nothing it should not');
  const hint = mainframeManual(['chrome'], { on: true, rootEarned: true });
  assert.equal(hint[0], '???');
  assert.doesNotMatch(hint.join(' '), /mainframe|deep/i);
  const rule = mainframeManual(['airgap'], { on: true, rootEarned: true }).join(' ');
  assert.match(rule, new RegExp(`The Deep ${CFG.mainframeExits} times`));
  assert.match(rule, new RegExp(`${CFG.mainframeCleanExits} times without losing to ICE`));
  assert.match(rule, /level II or higher/);
});

test('the Source\'s netrun theme is the Deep\'s opposite: slow, high, pings and a pad; First commit is a wardrobe track', () => {
  const deep = musicSettings('netrun', 'awake', 'deep', REGIONS.deep.sound);
  const source = musicSettings('netrun', 'awake', 'source', REGIONS.source.sound);
  const pub = musicSettings('netrun', 'awake', 'public', REGIONS.public.sound);
  assert.ok(source.transpose > 0 && deep.transpose < 0, 'up where the Deep goes down');
  assert.ok(source.bpm < pub.bpm);
  for (const part of ['bass', 'pulse', 'lead', 'drums']) assert.ok(source.mute.has(part), `${part} is silent`);
  assert.ok(!source.mute.has('ping') && !source.mute.has('pad'));
  assert.ok(deep.mute.has('pad') && pub.mute.has('pad') && pub.mute.has('ping'), 'the pad is the Source\'s alone');
  assert.ok(MUSIC_IDS.includes('firstcommit'));
});

test('a mainframe\'s plush still fits in the plush\'s box', () => {
  const plush = PROPS.find((p) => p.id === 'plush');
  for (const form of ['plat', 'airgap', 'init', 'panic', 'whisper', 'chrome']) {
    const pts = [];
    plush.draw((x, y) => pts.push([x, y]), 0, 0, { sprite: SPRITES[`${form}A`], colors: { '#': '#ffffff', o: '#ff0000', '+': '#00ff00', x: '#333333' } });
    assert.ok(pts.length > 20, form);
    for (const [x, y] of pts) assert.ok(x >= 0 && y >= 0 && x < plush.size[0] && y < plush.size[1], `${form}: ${x},${y} outside the box`);
  }
});

// --- The purge order: the Source's own anomaly ---

test('the purge order turns up only in the Source, as one anomaly among the others', () =>
  switchedOn(() => {
    assert.deepEqual(anomaliesFor('source').map((e) => e.id), ANOMALIES.map((e) => e.id));
    for (const region of REGION_ORDER.filter((r) => r !== 'source')) assert.ok(!anomaliesFor(region).some((e) => e.id === 'purge'), region);
    const seen = { source: new Set(), public: new Set() };
    for (let seed = 1; seed <= 120; seed++) {
      for (const region of ['source', 'public']) {
        const s = netling('mainframe', 'plat');
        moveTo(s, into(s, region, 'anomaly', seed).id, mulberry32(seed));
        seen[region].add(s.run.pending.event);
      }
    }
    assert.ok(seen.source.has('purge') && seen.source.size === 6, [...seen.source].join());
    assert.ok(!seen.public.has('purge'));
  }));

// A Source run standing on the purge order.
function atPurge(seed = 1) {
  for (let n = seed; n < seed + 500; n++) {
    const s = netling('mainframe', 'plat');
    moveTo(s, into(s, 'source', 'anomaly', n).id, mulberry32(n));
    if (s.run.pending?.event === 'purge') return s;
  }
  throw new Error('no purge order found');
}

test('READ IT costs 15 Integrity and may give the next Source fragment; LEAVE IT calms and leans to order', () =>
  switchedOn(() => {
    const read = atPurge();
    const before = read.stats.integrity;
    const res = choose(read, 'read', () => 0.1);
    assert.ok(res.ok);
    assert.equal(read.stats.integrity, before - 15);
    assert.deepEqual(read.run.fragments, ['source-1']);
    assert.match(res.msg, /every netling ever compiled/);

    const unlucky = atPurge(50);
    choose(unlucky, 'read', () => 0.9);
    assert.deepEqual(unlucky.run.fragments, [], 'a 60% chance, not a sure thing');

    const left = atPurge();
    left.stats.sync = 50;
    const integrity = left.stats.integrity;
    const r = choose(left, 'leave', noRng);
    assert.ok(r.ok);
    assert.equal(left.stats.sync, 65);
    assert.equal(left.stats.integrity, integrity);
    assert.match(r.msg, /pending/);
  }));
