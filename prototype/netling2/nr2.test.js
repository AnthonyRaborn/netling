// Tests for the 2.0 netrun rules in the simulator fork (sim/netrun/nr2.js): one ability per role and lean at two levels, the harder ICE
// tier, the forced filled cache, the grace window after a jack-out and the light egg costs. Deterministic: stub or seeded rng.
import test from 'node:test';
import assert from 'node:assert/strict';
process.env.TZ = 'UTC';
const { createScript, tick, mulberry32, SIDES, IRON } = await import('./sim/sim.js');
const { startRun, moveTo, resolveIce, runOptions, jackOut, abortRun, disconnect, visibleNodeIds, choose } = await import('./sim/netrun/run.js');
const { NR2, tierPenalty, avoidMult, tierShareAt } = await import('./sim/netrun/nr2.js');
const { generateMap2 } = await import('./sim/netrun/map2.js');
const { generateMap } = await import('../../src/netrun/map.js');
const { EGG_PAGES, EGG_PAGE_IDS, nextEggPage, FRAGMENTS } = await import('./sim/codex2.js');
const { REGIONS } = await import('../../src/netrun/regions.js');
import { execFileSync } from 'node:child_process';

const DEFAULT = JSON.parse(JSON.stringify(NR2));
const set = (patch) => {
  const fresh = JSON.parse(JSON.stringify(DEFAULT));
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && typeof fresh[k] === 'object') Object.assign(fresh[k], v);
    else fresh[k] = v;
  }
  for (const k of Object.keys(NR2)) delete NR2[k];
  Object.assign(NR2, fresh);
};
const reset = () => set({});

// A netling of this form and level in a fresh run in the Public Net, with the first option made into `type`.
function setup(form, level, type, region = 'public') {
  const rng = mulberry32(5);
  const s = createScript({ now: 0, rng });
  s.stage = level === 2 ? 'mainframe' : 'adult';
  s.form = level === 2 ? `${form}Elder` : form;
  Object.assign(s.stats, { charge: 90, integrity: 90, heat: 30 });
  startRun(s, region, rng, []);
  const node = runOptions(s.run)[0];
  node.type = type;
  return { s, node };
}
const stub = (v) => () => v;

test('everything is off by default, so the earlier tables stay reproducible', () => {
  reset();
  assert.deepEqual([NR2.abilities, NR2.tiers, NR2.eggCost], [false, false, false]);
  const { s, node } = setup('breachStreet', 1, 'ice');
  const r = moveTo(s, node.id, mulberry32(1));
  assert.equal(r.tier, 1, 'one kind of ICE');
  assert.equal(s.run.pending.tier, 1);
  assert.equal(s.run.tally.iceHard ?? 0, 0);
});

test('tier 2 ICE: rolled by the region share, logged, counted, and not paid more', () => {
  set({ tiers: true, tier: { share: { public: 1 } } });
  const { s, node } = setup('breachStreet', 1, 'ice');
  const r = moveTo(s, node.id, stub(0.5));
  assert.equal(r.tier, 2);
  assert.equal(s.run.tally.iceHard, 1);
  assert.ok(s.run.messages.some((m) => m.startsWith('tier 2 ICE')), 'the tier is logged');
  set({ tiers: true, tier: { share: { public: 0.3 } } });
  const b = setup('breachStreet', 1, 'ice');
  assert.equal(moveTo(b.s, b.node.id, stub(0.5)).tier, 1, 'a roll over the share is tier 1');
  set({ tiers: true, tier: { share: { public: 0 } } });
  const c = setup('breachStreet', 1, 'ice');
  assert.equal(moveTo(c.s, c.node.id, stub(0)).tier, 1, 'no share, no tier 2');
  reset();
});

test('the share grows with depth by default', () => {
  const order = ['public', 'bazaar', 'corp', 'ruins', 'deep', 'source'].map((r) => NR2.tier.share[r]);
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
  assert.equal(NR2.tier.share.tutorial, 0);
});

test('the bot gives up win chance against tier 2: speed for three games, its own lever for Breach, with a possible timer refund', () => {
  set({ tiers: true });
  assert.ok(Math.abs(tierPenalty({ game: 'dodge', tier: 2 }) - 0.1) < 1e-9, '1.25x speed at 0.04 a tenth');
  assert.equal(tierPenalty({ game: 'breach', tier: 2 }), 0.1);
  assert.equal(tierPenalty({ game: 'dodge', tier: 1 }), 0);
  set({ tiers: true, tier: { breachRefund: 0.04 } });
  assert.ok(Math.abs(tierPenalty({ game: 'breach', tier: 2 }) - 0.06) < 1e-9);
  assert.equal(tierPenalty({ game: 'dodge', tier: 2 }), tierPenalty({ game: 'tune', tier: 2 }), 'speed affects the other three alike');
  set({ tiers: false });
  assert.equal(tierPenalty({ game: 'breach', tier: 2 }), 0, 'off, no penalty');
  reset();
});

test('avoidance works less often against tier 2, and less at the adult level than the elder level', () => {
  set({ tiers: true });
  assert.equal(avoidMult(1, 1), 1);
  assert.ok(avoidMult(2, 1) < avoidMult(2, 2) && avoidMult(2, 2) < 1);
  reset();
});

test('Dodge street: ICE sometimes never notices it, half as often against tier 2 at the adult level', () => {
  set({ abilities: true, tiers: true, tier: { share: { public: 0 } } });
  let a = setup('dodgeStreet', 1, 'ice');
  assert.equal(moveTo(a.s, a.node.id, stub(0.3)).phased, true, '0.3 < 0.45 at tier 1');
  set({ abilities: true, tiers: true, tier: { share: { public: 1 } } });
  a = setup('dodgeStreet', 1, 'ice');
  assert.equal(moveTo(a.s, a.node.id, stub(0.3)).phased, undefined, '0.3 > 0.45 * 0.5 at tier 2');
  a = setup('dodgeStreet', 2, 'ice');
  assert.equal(moveTo(a.s, a.node.id, stub(0.3)).phased, true, '0.3 < 0.5 * 0.75 at tier 2, elder');
  reset();
});

test('Dodge corp: the first ICE for certain (two for the elder), then often; tier 2 turns the certainty into a chance', () => {
  set({ abilities: true });
  let a = setup('dodgeCorp', 1, 'ice');
  assert.equal(moveTo(a.s, a.node.id, stub(0.99)).phased, true, 'the first, whatever the roll');
  assert.equal(a.s.run.freePhases, 1);
  set({ abilities: true, tiers: true, tier: { share: { public: 1 } } });
  a = setup('dodgeCorp', 1, 'ice');
  assert.equal(moveTo(a.s, a.node.id, stub(0.99)).phased, undefined, 'tier 2: not certain');
  assert.equal(a.s.run.freePhases, 0);
  set({ abilities: true });
  a = setup('dodgeCorp', 2, 'ice');
  assert.equal(moveTo(a.s, a.node.id, stub(0.99)).phased, true);
  a.s.run.phase = 'map';
  a.s.run.pos = runOptions(a.s.run).length ? a.s.run.pos : a.s.run.pos;
  assert.equal(a.s.run.freePhases, 1);
  reset();
});

test('Breach street: ICE deals reduced damage, and the elder\'s first loss barely scratches it', () => {
  set({ abilities: true });
  const dmg = REGIONS.public.iceDamage;
  let a = setup('breachStreet', 1, 'ice');
  moveTo(a.s, a.node.id, stub(0.99));
  const hp = a.s.stats.integrity;
  resolveIce(a.s, false, stub(0.99));
  assert.equal(hp - a.s.stats.integrity, Math.round(dmg * NR2.ab.hardened[1].dmg));
  a = setup('breachStreet', 2, 'ice');
  moveTo(a.s, a.node.id, stub(0.99));
  const hp2 = a.s.stats.integrity;
  resolveIce(a.s, false, stub(0.99));
  assert.equal(hp2 - a.s.stats.integrity, Math.round(dmg * NR2.ab.hardened[2].dmg * NR2.ab.softMult), 'the first loss is soft');
  assert.equal(a.s.run.softLosses, 1);
  reset();
});

test('Breach corp: insurance saves it once from a disconnect (twice for the elder) and the elder\'s relay patches it', () => {
  set({ abilities: true });
  let a = setup('breachCorp', 1, 'ice');
  moveTo(a.s, a.node.id, stub(0.99));
  a.s.stats.integrity = 5;
  assert.equal(resolveIce(a.s, false, stub(0.99)).result, undefined, 'saved');
  assert.equal(a.s.stats.integrity, NR2.ab.insurance[1].to);
  assert.equal(a.s.run.insuredTimes, 1);
  a.s.run.phase = 'ice';
  a.s.run.pending = { game: 'breach', tier: 1 };
  a.s.stats.integrity = 5;
  assert.equal(resolveIce(a.s, false, stub(0.99)).result, 'disconnected', 'a second blow disconnects the adult');
  a = setup('breachCorp', 2, 'ice');
  moveTo(a.s, a.node.id, stub(0.99));
  a.s.stats.integrity = 5;
  resolveIce(a.s, false, stub(0.99));
  a.s.run.phase = 'ice';
  a.s.run.pending = { game: 'breach', tier: 1 };
  a.s.stats.integrity = 5;
  resolveIce(a.s, false, stub(0.99));
  assert.equal(a.s.run.insuredTimes, 2, 'the elder is paid out twice');
  a = setup('breachCorp', 2, 'relay');
  a.s.stats.integrity = 50;
  moveTo(a.s, a.node.id, stub(0.99));
  assert.equal(a.s.stats.integrity, 70, 'the elder patch is +20');
  a = setup('breachCorp', 1, 'relay');
  a.s.stats.integrity = 50;
  moveTo(a.s, a.node.id, stub(0.99));
  assert.equal(a.s.stats.integrity, 50, 'the adult has no patch');
  reset();
});

test('checkpoints: the hidden form is never noticed, the Dodge elders are, an adult Dodge form is not', () => {
  set({ abilities: true });
  const pass = (form, level) => {
    const { s, node } = setup(form, level, 'checkpoint', 'corp');
    return moveTo(s, node.id, stub(0.99)).auto === true;
  };
  assert.equal(pass('hidden', 1), true);
  assert.equal(pass('dodgeStreet', 1), false);
  assert.equal(pass('dodgeStreet', 2), true);
  assert.equal(pass('dodgeCorp', 2), true);
  assert.equal(pass('breachStreet', 2), false);
  reset();
});

test('sight: Tune corp sees two steps (three as an elder), the hidden form sees everything, Tune street only gains repair at the elder level', () => {
  set({ abilities: true });
  const count = (form, level) => {
    const { s } = setup(form, level, 'cache');
    return visibleNodeIds(s).size;
  };
  const none = count('breachCorp', 1);
  assert.ok(count('tuneCorp', 1) > none);
  assert.ok(count('tuneCorp', 2) > count('tuneCorp', 1));
  const { s } = setup('hidden', 1, 'cache');
  assert.equal(visibleNodeIds(s).size, s.run.map.nodes.length);
  const t1 = setup('tuneStreet', 1, 'cache');
  t1.s.stats.integrity = 50;
  moveTo(t1.s, t1.node.id, stub(0.99));
  const t2 = setup('tuneStreet', 2, 'cache');
  t2.s.stats.integrity = 50;
  moveTo(t2.s, t2.node.id, stub(0.99));
  assert.ok(t2.s.stats.integrity > t1.s.stats.integrity, 'the elder repairs a little every move');
  reset();
});

test('Feast: the corp form gets more loose scrip and a cheaper exchange; the street form finds more in caches and ICE', () => {
  set({ abilities: true });
  const plain = setup('breachStreet', 1, 'market', 'corp');
  plain.node.flavor = 'corp';
  moveTo(plain.s, plain.node.id, stub(0.99));
  const fc = setup('feastCorp', 1, 'market', 'corp');
  fc.node.flavor = 'corp';
  moveTo(fc.s, fc.node.id, stub(0.99));
  assert.ok(fc.s.run.pending.price < plain.s.run.pending.price);
  const wins = (form, level) => {
    let loot = 0;
    for (let i = 0; i < 400; i++) {
      const a = setup(form, level, 'ice');
      moveTo(a.s, a.node.id, mulberry32(i));
      resolveIce(a.s, true, mulberry32(i + 1000));
      loot += a.s.run.loot.length;
    }
    return loot;
  };
  assert.ok(wins('feastStreet', 1) > wins('breachStreet', 1), 'ICE-win loot odds are up');
  assert.ok(wins('feastStreet', 2) > wins('feastStreet', 1), 'and up again for the elder');
  reset();
});

test('the forced filled cache: the Feast corp elder gets one before halfway, displacing any node; the relay lever keeps the relay', () => {
  const walk = (form, level, relaySafe) => {
    set({ abilities: true, forcedCache: { relaySafe } });
    const rng = mulberry32(11);
    const s = createScript({ now: 0, rng });
    s.stage = level === 2 ? 'mainframe' : 'adult';
    s.form = level === 2 ? `${form}Elder` : form;
    Object.assign(s.stats, { charge: 100, integrity: 100, heat: 0 });
    startRun(s, 'public', rng, []);
    const target = Math.ceil(REGIONS.public.layers / 2) - 1;
    // Make every node in the layer after the target a relay, so the lever is visible, then walk (as filled, safe nodes) up to the target layer.
    const next = s.run.map.nodes.filter((n) => n.layer === target + 1);
    next.forEach((n) => { n.type = 'relay'; });
    let guard = 0;
    while (nodeLayer(s) < target && guard++ < 20) {
      const o = runOptions(s.run)[0];
      o.type = 'cache';
      o.filled = false;
      moveTo(s, o.id, rng);
      if (s.run.phase !== 'map') break;
    }
    return { s, next };
  };
  const nodeLayer = (s) => s.run.map.nodes.find((n) => n.id === s.run.pos).layer;
  let { s, next } = walk('feastCorp', 2, false);
  assert.equal(s.run.tally.forced, 1, 'one a run');
  assert.ok(next.some((n) => n.type === 'cache' && n.filled), 'it displaced a node, the relay included');
  ({ s, next } = walk('feastCorp', 2, true));
  assert.equal(s.run.tally.forced ?? 0, 0, 'with the relay lever on and only relays ahead, nothing is displaced');
  assert.ok(next.every((n) => n.type === 'relay'));
  ({ s, next } = walk('feastCorp', 1, false));
  assert.equal(s.run.tally.forced ?? 0, 0, 'the adult does not get it');
  ({ s, next } = walk('breachCorp', 2, false));
  assert.equal(s.run.tally.forced ?? 0, 0, 'nor does any other form');
  reset();
});

test('a filled cache always holds an item', () => {
  set({ abilities: true });
  const a = setup('breachCorp', 1, 'cache');
  a.node.filled = true;
  assert.equal(moveTo(a.s, a.node.id, stub(0.99)).kind, 'cache');
  assert.equal(a.s.run.loot.length, 1, 'even a roll that would miss');
  reset();
});

test('the grace window: only a jack-out starts it, and it holds a state that the bars would end', () => {
  reset();
  for (const how of ['jack', 'abort', 'fail']) {
    const rng = mulberry32(3);
    const s = createScript({ now: 0, rng });
    s.stage = 'adult';
    s.form = 'breachCorp';
    startRun(s, 'public', rng, []);
    if (how === 'jack') jackOut(s);
    else if (how === 'abort') abortRun(s);
    else disconnect(s, 'power drained mid-run.');
    assert.equal(s.graceUntil !== undefined, how === 'jack', how);
    if (how === 'jack') assert.equal(s.graceUntil, s.ageMin + NR2.graceMin);
  }
  const saved = JSON.parse(JSON.stringify({ SIDES }));
  Object.assign(SIDES, { on: true, owner: 'charge', ownerMult: 3, teenStates: true });
  Object.assign(SIDES.charge, { hi: 80, hold: 180, exit: 65 });
  IRON.on = false;
  const held = (grace) => {
    const rng = mulberry32(9);
    const noon = 12 * 3600000; // awake, not at rest
    const s = createScript({ now: noon, rng });
    s.stage = 'adult';
    s.sideHeld = { charge: true, sync: false, heat: false };
    s.sideHold = { charge: 180, sync: 0, heat: 0 };
    s.stats.charge = 40; // a run left it low
    if (grace) s.graceUntil = s.ageMin + 5;
    tick(s, noon + 60000, rng);
    return s.sideHeld.charge;
  };
  assert.equal(held(false), false, 'without the window a low Charge ends the state');
  assert.equal(held(true), true, 'inside the window it holds');
  Object.assign(SIDES, saved.SIDES);
  SIDES.on = false;
});

test('Iron\'s wear keeps building in a run when the egg cost is on; the other eggs and the default do not', () => {
  const wear = (on, iron) => {
    set({ eggCost: on });
    IRON.on = iron;
    const rng = mulberry32(2);
    const s = createScript({ now: 0, rng });
    s.stage = 'adult';
    s.form = 'breachCorp';
    s.stats.heat = 85;
    s.stats.charge = 100;
    startRun(s, 'public', rng, []);
    const o = runOptions(s.run)[0];
    o.type = 'cache';
    moveTo(s, o.id, rng);
    IRON.on = false;
    return s.wear ?? 0;
  };
  assert.ok(wear(true, true) > 0);
  assert.equal(wear(false, true), 0, 'off by default');
  assert.equal(wear(true, false), 0, 'only Iron');
  reset();
});

test('Wetware and Program: a lost fight can infect or bleed, lightly, only with the egg cost on', () => {
  const lose = (egg, on) => {
    set({ eggCost: on, cost: { wetwareLostFightInfect: 1 } });
    Object.assign(SIDES, { on: true, owner: egg === 'program' ? 'charge' : 'sync', ownerMult: 3, teenStates: true });
    IRON.on = false;
    const rng = mulberry32(4);
    const s = createScript({ now: 0, rng });
    s.stage = 'adult';
    s.form = 'breachCorp';
    s.stats.charge = 95;
    startRun(s, 'public', rng, []);
    const o = runOptions(s.run)[0];
    o.type = 'ice';
    moveTo(s, o.id, rng);
    const before = s.stats.integrity;
    resolveIce(s, false, () => 0);
    SIDES.on = false;
    return { hp: before - s.stats.integrity, virus: Boolean(s.virus) };
  };
  const base = lose('program', false).hp;
  assert.equal(lose('program', true).hp - base, NR2.cost.programLostFightBleed);
  assert.equal(lose('wetware', true).virus, true);
  assert.equal(lose('wetware', false).virus, false);
  reset();
});

test('the elder feat can follow the account: the first-elder feat by default, a lighter one through CFG.featFor', async () => {
  const { mainframeFeat, CFG } = await import('./sim/sim.js');
  const s = { deepExits: { all: 2, clean: 0 } };
  assert.equal(mainframeFeat(s), false, '2 exits do not meet 3 or 2 clean');
  CFG.featFor = () => [2, 99];
  assert.equal(mainframeFeat(s), true, 'tier 2: two exits');
  CFG.featFor = () => [1, 99];
  assert.equal(mainframeFeat({ deepExits: { all: 1, clean: 0 } }), true, 'tier 4: one exit');
  CFG.featFor = null;
});

test('Root Access arrives mid-life by default (the game\'s rule), and the codex cap is 12', async () => {
  const { CFG } = await import('./sim/sim.js');
  const { RUN_CFG } = await import('./sim/netrun/run.js');
  assert.equal(CFG.rootMid, true);
  assert.equal(RUN_CFG.codexPerLife, 12);
});

test('the daily trace rolls the ICE tier from the node alone, so every player meets the same tiers', () => {
  set({ tiers: true, tier: { share: { daily: 0.5 } } });
  const walk = (seed, form, day = '2026-10-05') => {
    const rng = mulberry32(seed);
    const s = createScript({ now: 0, rng });
    s.stage = 'adult';
    s.form = form;
    Object.assign(s.stats, { charge: 100, integrity: 100, heat: 0 });
    startRun(s, 'daily', rng, [], [], { day });
    const seen = [];
    let guard = 0;
    while (s.run.phase !== 'done' && guard++ < 80) {
      if (s.run.phase === 'ice') { seen.push([s.run.pos, s.run.pending.tier]); resolveIce(s, true, rng); }
      else if (s.run.phase === 'choice') { choose(s, 'continue', rng); }
      else moveTo(s, runOptions(s.run)[0].id, rng);
      s.stats.charge = 100;
      s.stats.integrity = 100;
    }
    return seen;
  };
  const days = Array.from({ length: 12 }, (_, i) => `2026-10-${String(i + 1).padStart(2, '0')}`);
  const a = days.flatMap((d) => walk(1, 'breachCorp', d));
  const b = days.flatMap((d) => walk(2, 'feastStreet', d));
  assert.ok(a.length > 0);
  assert.deepEqual(a, b, 'different rng, different form, same tiers at the same nodes');
  assert.ok(a.some(([, t]) => t === 2) && a.some(([, t]) => t === 1), 'a mix of both tiers');
  reset();
});

test('the 2.0 pages: 24 Root and 15 late, in drop order, late only once Root is held, and the Source opens on deep-6', async () => {
  const { FRAGMENTS, ROOT_FRAGMENT_IDS, LATE_FRAGMENT_IDS, nextFragment } = await import('./sim/codex2.js');
  const { regionLock } = await import('../../src/netrun/regions.js');
  assert.equal(ROOT_FRAGMENT_IDS.length, 24);
  assert.equal(LATE_FRAGMENT_IDS.length, 15);
  assert.equal(new Set(FRAGMENTS.map((f) => f.id)).size, 39, 'ids are unique');
  const byRegion = (r) => FRAGMENTS.filter((f) => f.region === r && f.tier === 'root').length;
  assert.deepEqual(['public', 'corp', 'bazaar', 'ruins', 'deep', 'source'].map(byRegion), [5, 6, 5, 4, 4, 0]);
  // A late page never drops before Root; the order inside a region is the array order.
  const publicRoot = ROOT_FRAGMENT_IDS.filter((id) => id.startsWith('public'));
  assert.equal(nextFragment('public', publicRoot, false), null, 'Root not held: the late pages wait');
  assert.equal(nextFragment('public', publicRoot, true), 'public-6');
  assert.equal(nextFragment('public', [...publicRoot, 'public-6'], true), 'public-7');
  assert.equal(nextFragment('deep', ROOT_FRAGMENT_IDS, false), 'deep-5');
  assert.equal(nextFragment('source', ROOT_FRAGMENT_IDS, false), 'source-1', 'all Root pages known counts as Root held');
  // The Deep opens on ruins-4 (Root); the Source on deep-6 (late).
  assert.equal(regionLock('source', 'mainframe', ['ruins-4'], ['public', 'bazaar', 'corp', 'ruins', 'deep']), 'the way down is still hidden.');
  assert.equal(regionLock('source', 'mainframe', ['deep-6'], ['public', 'bazaar', 'corp', 'ruins', 'deep']), null);
});

test('the forced cache never displaces a relay by default', () => {
  assert.equal(NR2.forcedCache.relaySafe, true);
});

test('Feast corp is paid a company-store item at the exit, on top of the region\'s bonus', () => {
  set({ abilities: true });
  const bonus = (form) => {
    const a = setup(form, 1, 'exit');
    moveTo(a.s, a.node.id, mulberry32(3));
    return a.s.run.loot.length;
  };
  assert.equal(bonus('breachCorp'), REGIONS.public.exitBonus ?? 1);
  assert.equal(bonus('feastCorp'), (REGIONS.public.exitBonus ?? 1) + NR2.ab.concession[1].exitItems);
  reset();
});

test('the forced cache repeats every few layers up to perRun, and never past the last middle layer', () => {
  set({ abilities: true, forcedCache: { perRun: 3, every: 3 } });
  const rng = mulberry32(7);
  const s = createScript({ now: 0, rng });
  s.stage = 'mainframe';
  s.form = 'feastCorpElder';
  Object.assign(s.stats, { charge: 100, integrity: 100, heat: 0 });
  startRun(s, 'source', rng, []); // 13 middle layers: the first at layer 6, then 9, then 12
  let guard = 0;
  while (s.run.phase !== 'done' && guard++ < 60) {
    if (s.run.phase === 'ice') resolveIce(s, true, rng);
    else if (s.run.phase === 'choice') choose(s, s.run.pending.options.find((o) => !o.disabled && (o.id === 'continue' || o.id === 'leave' || o.id === 'ignore' || o.id === 'move' || o.id === 'comply'))?.id ?? s.run.pending.options[0].id, rng);
    else {
      const opts = runOptions(s.run);
      const pick = opts.find((n) => n.type !== 'ice') ?? opts[0];
      moveTo(s, pick.id, rng);
    }
    s.stats.charge = 100;
    s.stats.integrity = 100;
  }
  assert.ok(s.run.tally.forced >= 2 && s.run.tally.forced <= 3, `forced ${s.run.tally.forced}`);
  reset();
});

test('stacking: items of a kind share a slot up to the stack size, and a further copy opens another slot of the same kind', async () => {
  const { INV, slotsUsed, hasRoom, INVENTORY_SLOTS } = await import('./sim/sim.js');
  const saved = INV.stack;
  INV.stack = 3;
  assert.equal(slotsUsed(['coolant', 'coolant', 'coolant']), 1);
  assert.equal(slotsUsed(['coolant', 'coolant', 'coolant', 'coolant']), 2, 'a fourth copy takes a second slot');
  assert.equal(slotsUsed(['coolant', 'repair', 'coolant', 'repair']), 2);
  const full = Array.from({ length: INVENTORY_SLOTS * 3 }, () => 'coolant');
  assert.equal(slotsUsed(full), INVENTORY_SLOTS, 'six slots hold eighteen of one kind');
  assert.equal(hasRoom(full, 'coolant'), false);
  assert.equal(hasRoom(full, 'repair'), false);
  assert.equal(hasRoom(full.slice(0, 15), 'repair'), true);
  INV.stack = 1;
  assert.equal(slotsUsed(['coolant', 'coolant']), 2, 'one to a slot is the 1.0 rule');
  INV.stack = saved;
});

test('end-of-run choice: the loot and what is carried compete for the slots, the best are kept and the rest scrapped; off, loot is scrapped in the order found', async () => {
  const { INV } = await import('./sim/sim.js');
  const saved = INV.stack;
  INV.stack = 1;
  const run = (inventory) => {
    const a = setup('breachCorp', 1, 'relay');
    a.s.inventory = [...inventory];
    a.s.scrip = 0;
    a.s.run.loot = ['overclock'];
    a.s.run.phase = 'map';
    jackOut(a.s);
    return a.s;
  };
  const six = ['coolant', 'coolant', 'coolant', 'coolant', 'coolant', 'coolant'];
  set({ inventory: false });
  let s = run(six);
  assert.equal(s.inventory.includes('overclock'), false, 'off: the chip found last is the one scrapped');
  assert.equal(s.scrip, 12, 'a quarter of 50');
  set({ inventory: true });
  s = run(six);
  assert.equal(s.inventory.includes('overclock'), true, 'on: the player keeps the chip');
  assert.equal(s.inventory.length, 6);
  assert.equal(s.scrip, 3, 'and a coolant cell is scrapped instead (a quarter of 15)');
  INV.stack = saved;
  reset();
});

test('Feast: a won ICE restores a little Integrity, for both Feast forms and more for the elder', () => {
  set({ abilities: true });
  const heal = (form, level) => {
    const a = setup(form, level, 'ice');
    moveTo(a.s, a.node.id, stub(0.99));
    a.s.stats.integrity = 50;
    resolveIce(a.s, true, stub(0.99));
    return a.s.stats.integrity - 50;
  };
  assert.equal(heal('feastStreet', 1), NR2.ab.scavenge[1].winHeal);
  assert.equal(heal('feastStreet', 2), NR2.ab.scavenge[2].winHeal);
  assert.equal(heal('feastCorp', 1), NR2.ab.concession[1].winHeal);
  assert.equal(heal('breachCorp', 1), 0, 'no one else');
  assert.ok(heal('feastStreet', 2) > heal('feastStreet', 1));
  reset();
});

// --- the egg-flavored anomalies (sim/netrun/egg-anomalies.js) ---------------------------------------------------------------------
const { EGG_ANOMALIES, EGG_ANOMALY_IDS } = await import('./sim/netrun/egg-anomalies.js');
// Runs `fn` with the pressure that makes a netling this egg (the fork tells the egg from the pressure switches), then puts them back.
function asEgg(egg, fn) {
  const before = { iron: IRON.on, on: SIDES.on, owner: SIDES.owner };
  IRON.on = egg === 'iron';
  SIDES.on = egg !== 'iron';
  SIDES.owner = egg === 'program' ? 'charge' : egg === 'wetware' ? 'sync' : SIDES.owner;
  try { return fn(); } finally { IRON.on = before.iron; SIDES.on = before.on; SIDES.owner = before.owner; }
}
// Opens an anomaly node with a stub rng that picks the LAST entry of the pool (the egg's own, when it is there).
function anomalyNode(egg, { region = 'public', daily = false } = {}) {
  const { s, node } = setup('breachStreet', 1, 'anomaly', region);
  s.run.region = region;
  s.run.daily = daily;
  moveTo(s, node.id, stub(0.999));
  return s;
}

test('egg anomalies: off by default, and then no netling meets one', () => {
  reset();
  assert.equal(NR2.eggAnomalies, false);
  for (const egg of ['iron', 'program', 'wetware']) asEgg(egg, () => assert.ok(!EGG_ANOMALY_IDS.includes(anomalyNode(egg).run.pending.event)));
});

test('egg anomalies: each egg meets its own, one entry in the pool, and never another egg\'s', () => {
  set({ eggAnomalies: true });
  for (const [egg, id] of [['program', 'overflow'], ['iron', 'bitrot'], ['wetware', 'graft']]) {
    asEgg(egg, () => {
      const s = anomalyNode(egg);
      assert.equal(s.run.pending.event, id, `${egg}: its own anomaly`);
      assert.equal(s.run.tally.eggAnomaly, 1);
      assert.equal(s.run.pending.options.length, 2, 'two options, like 1.0\'s');
    });
    // The first entry of the pool is 1.0's (stub 0 picks it): the pool only gained one entry.
    asEgg(egg, () => {
      const { s, node } = setup('breachStreet', 1, 'anomaly');
      moveTo(s, node.id, stub(0));
      assert.ok(!EGG_ANOMALY_IDS.includes(s.run.pending.event));
    });
  }
  reset();
});

test('egg anomalies: not in the Source, the daily trace or the tutorial', () => {
  set({ eggAnomalies: true });
  asEgg('iron', () => {
    for (const opts of [{ region: 'source' }, { region: 'tutorial' }, { daily: true }]) assert.ok(!EGG_ANOMALY_IDS.includes(anomalyNode('iron', opts).run.pending.event), JSON.stringify(opts));
  });
  reset();
});

// The option made on a fresh anomaly node, with the stats set first.
function pick(egg, optionId, stats = {}, rngValue = 0.5) {
  const s = anomalyNode(egg);
  Object.assign(s.stats, stats);
  const before = { ...s.stats };
  const r = choose(s, optionId, stub(rngValue));
  return { s, before, r };
}

test('stack overflow: RUN IT surges Charge and may find an item; if Charge ends over the line the stack tears; there is no free pass', () => {
  set({ eggAnomalies: true });
  asEgg('program', () => {
    const clean = pick('program', 'run', { charge: 50, integrity: 80 }, 0.1);
    assert.equal(clean.s.stats.charge, 75);
    assert.equal(clean.s.stats.integrity, 80, 'no tear under the line');
    assert.equal(clean.s.run.loot.length, 1, 'a roll under 0.5 finds an item');
    assert.equal(clean.s.run.skipIce, undefined, 'no ICE skip');
    const tear = pick('program', 'run', { charge: 80, integrity: 80 }, 0.9);
    assert.equal(tear.s.stats.charge, 100);
    assert.equal(tear.s.stats.integrity, 70, 'over 95 the stack overflows: -10');
    assert.equal(tear.s.run.loot.length, 0);
    // The next ICE is an ordinary fight, whatever happened here.
    set({ eggAnomalies: true, tiers: true, tier: { share: { public: 1 } } });
    const ice = runOptions(clean.s.run)[0];
    ice.type = 'ice';
    assert.equal(moveTo(clean.s, ice.id, stub(0.5)).phased, undefined);
    assert.equal(clean.s.run.phase, 'ice');
  });
  reset();
});

test('stack overflow: TERMINATE costs Charge and repairs Integrity (capped at 100)', () => {
  set({ eggAnomalies: true });
  asEgg('program', () => {
    const a = pick('program', 'kill', { charge: 60, integrity: 70 });
    assert.deepEqual([a.s.stats.charge, a.s.stats.integrity], [52, 80]);
    assert.equal(pick('program', 'kill', { integrity: 95 }).s.stats.integrity, 100);
  });
  reset();
});

test('bit-rot patch: FLASH IT cools and clears wear at a cost in Charge; PRY OPEN runs hot for likely loot and a little power', () => {
  set({ eggAnomalies: true });
  asEgg('iron', () => {
    const s = anomalyNode('iron');
    Object.assign(s.stats, { charge: 70, heat: 50 });
    s.wear = 45;
    choose(s, 'flash', stub(0.5));
    assert.deepEqual([s.stats.charge, s.stats.heat, s.wear], [58, 30, 15]);
    const low = anomalyNode('iron');
    Object.assign(low.stats, { charge: 70, heat: 10 });
    low.wear = 10;
    choose(low, 'flash', stub(0.5));
    assert.deepEqual([low.stats.heat, low.wear], [0, 0], 'heat and wear floor at 0');
    const got = pick('iron', 'pry', { heat: 30, charge: 50 }, 0.1);
    assert.equal(got.s.stats.heat, 40);
    assert.equal(got.s.stats.charge, 58, 'salvage: a little power as well');
    assert.equal(got.s.run.loot.length, 1, 'a roll under 0.6 finds a part');
    const none = pick('iron', 'pry', { heat: 30 }, 0.9);
    assert.equal(none.s.run.loot.length, 0);
  });
  reset();
});

test('graft: GRAFT IT surges Sync and may be rejected (an infection); SAMPLE costs Sync for maybe loot', () => {
  set({ eggAnomalies: true });
  asEgg('wetware', () => {
    const took = pick('wetware', 'graft', { sync: 40, integrity: 80 }, 0.9);
    assert.deepEqual([took.s.stats.sync, took.s.stats.integrity, Boolean(took.s.virus)], [60, 80, false]);
    const rejected = pick('wetware', 'graft', { sync: 40, integrity: 80 }, 0.1);
    assert.deepEqual([rejected.s.stats.sync, rejected.s.stats.integrity, rejected.s.virus], [60, 76, true]);
    const already = anomalyNode('wetware');
    already.virus = true;
    already.stats.integrity = 80;
    choose(already, 'graft', stub(0.1));
    assert.equal(already.stats.integrity, 80, 'no second infection while infected');
    const sample = pick('wetware', 'sample', { sync: 40 }, 0.1);
    assert.equal(sample.s.stats.sync, 34);
    assert.equal(sample.s.run.loot.length, 1);
  });
  reset();
});

test('egg anomalies: every option is deterministic for a seed', () => {
  set({ eggAnomalies: true });
  for (const [egg, def] of Object.entries(EGG_ANOMALIES)) {
    for (const o of def.options) {
      asEgg(egg, () => {
        const a = pick(egg, o.id, {}, 0.5);
        const b = pick(egg, o.id, {}, 0.5);
        assert.deepEqual(a.s.stats, b.s.stats, `${egg}/${o.id}`);
        assert.equal(a.s.run.messages.at(-1), b.s.run.messages.at(-1));
      });
    }
  }
  reset();
});

test('egg anomalies: each option leans, through the same adapter as 1.0\'s (allegiance becomes Standing, stability is temper)', () => {
  set({ eggAnomalies: true });
  const leans = { run: [0, -1], kill: [0, 1], flash: [1, 0], pry: [-1, 0], graft: [0, -1], sample: [0, 1] };
  for (const [egg, def] of Object.entries(EGG_ANOMALIES)) {
    for (const o of def.options) {
      asEgg(egg, () => {
        const s = anomalyNode(egg);
        const before = JSON.stringify({ axes: s.axes, standing: s.standing });
        choose(s, o.id, stub(0.5));
        const moved = JSON.stringify({ axes: s.axes, standing: s.standing }) !== before;
        assert.equal(moved, leans[o.id].some((x) => x !== 0), `${egg}/${o.id}: lean ${leans[o.id]}`);
      });
    }
  }
  reset();
});

// --- egg run cost sizes (notes/netrun-sim-notes.md, section 11) ----------------------------------------------------------------------
const { COST_METER } = await import('./sim/netrun/run.js');

test('egg run costs: the sizes in force, and Iron\'s wear a move is proportional to the minutes a move is worth', () => {
  reset();
  assert.deepEqual(NR2.cost, { ironMinutesPerMove: 2.5, programLostFightBleed: 4, wetwareLostFightInfect: 0.04 });
  const added = (minutes) => {
    set({ eggCost: true, cost: { ironMinutesPerMove: minutes } });
    IRON.on = true;
    const rng = mulberry32(2);
    const s = createScript({ now: 0, rng });
    s.stage = 'adult';
    s.form = 'breachCorp';
    s.stats.heat = 85;
    s.stats.charge = 100;
    startRun(s, 'public', rng, []);
    const o = runOptions(s.run)[0];
    o.type = 'cache';
    moveTo(s, o.id, rng);
    IRON.on = false;
    return s.wear ?? 0;
  };
  const one = added(1);
  assert.ok(one > 0);
  assert.ok(Math.abs(added(2.5) - 2.5 * one) < 1e-9, 'wear a move scales with the minutes');
  reset();
});

test('egg run costs: the meter counts lost fights, hot moves, bleeds and rolls, and only for the egg that pays', () => {
  const before = { ...COST_METER };
  set({ eggCost: true });
  Object.assign(SIDES, { on: true, owner: 'charge', ownerMult: 3, teenStates: true });
  IRON.on = false;
  const rng = mulberry32(4);
  const s = createScript({ now: 0, rng });
  s.stage = 'adult';
  s.form = 'breachCorp';
  s.stats.charge = 95;
  startRun(s, 'public', rng, []);
  const o = runOptions(s.run)[0];
  o.type = 'ice';
  moveTo(s, o.id, rng);
  resolveIce(s, false, () => 0);
  SIDES.on = false;
  assert.equal(COST_METER.lostFights - before.lostFights, 1);
  assert.equal(COST_METER.programBleeds - before.programBleeds, 1);
  assert.equal(COST_METER.programBled - before.programBled, NR2.cost.programLostFightBleed);
  assert.equal(COST_METER.wetwareRolls - before.wetwareRolls, 0, 'not a Wetware netling');
  reset();
});

// --- Foresight (Tune street) and the pre-rolled contents it reads (nr2.js `fate`, `foresight`) --------------------------------------
const { foresightView } = await import('./sim/netrun/run.js');
const { nodeById } = await import('../../src/netrun/map.js');

function foresightRun(level, patch = {}, region = 'deep', form = 'tuneStreet', seed = 5, fate = true) {
  set({ abilities: true, tiers: true, tier: { share: { deep: 0.5 } }, fate, foresight: { on: true, depth: { 1: 1, 2: 2 }, fields: { 1: ['game', 'tier', 'cache'], 2: ['game', 'tier', 'cache'] }, ...patch } });
  const rng = mulberry32(seed);
  const s = createScript({ now: 0, rng });
  s.stage = level === 2 ? 'mainframe' : 'adult';
  s.form = level === 2 ? `${form}Elder` : form;
  Object.assign(s.stats, { charge: 100, integrity: 100, heat: 30 });
  startRun(s, region, rng, []);
  return { s, rng };
}
const within = (run, from, depth) => {
  let frontier = [from];
  const out = new Set();
  for (let d = 0; d < depth; d++) {
    frontier = frontier.flatMap((id) => nodeById(run.map, id).edges);
    frontier.forEach((id) => out.add(id));
  }
  return [...out];
};

test('fate: off by default (nothing pre-rolled); on, a run carries a seed and the same node holds the same thing whatever the route or the rolls', () => {
  reset();
  const rng = mulberry32(5);
  const plain = createScript({ now: 0, rng });
  Object.assign(plain.stats, { charge: 100, integrity: 100 });
  startRun(plain, 'deep', rng, []);
  assert.equal(plain.run.fate, undefined);
  set({ fate: true, tiers: true, tier: { share: { deep: 0.5 } } });
  const games = [];
  for (const rollValue of [0.1, 0.9]) {
    const r2 = mulberry32(5);
    const s = createScript({ now: 0, rng: r2 });
    Object.assign(s.stats, { charge: 100, integrity: 100 });
    startRun(s, 'deep', r2, []);
    assert.equal(typeof s.run.fate, 'number');
    const node = runOptions(s.run)[0];
    node.type = 'ice';
    const moved = moveTo(s, node.id, stub(rollValue));
    games.push([moved.game, moved.tier]);
  }
  assert.deepEqual(games[0], games[1], 'the fight at a node does not depend on the rolls on arrival');
  reset();
});

test('foresight: only Tune street, only with the switch and fate on; the adult reads the next step, the elder two steps; fields as allowed', () => {
  const { s } = foresightRun(1);
  const next = within(s.run, s.run.pos, 1);
  const view = foresightView(s);
  for (const id of Object.keys(view).map(Number)) assert.ok(next.includes(id), 'the adult reads only the next step');
  const kinds = next.map((id) => nodeById(s.run.map, id).type);
  assert.equal(Object.keys(view).length, kinds.filter((t) => t === 'ice' || t === 'cache').length, 'an entry for each ICE and cache it can see');
  for (const [id, v] of Object.entries(view)) {
    const t = nodeById(s.run.map, Number(id)).type;
    if (t === 'ice') assert.deepEqual(Object.keys(v).sort(), ['game', 'tier']);
    else assert.deepEqual(Object.keys(v), ['filled']);
  }
  // Fields can be limited: the adult's default is the game only.
  const g = foresightRun(1, { fields: { 1: ['game'], 2: ['game'] } });
  for (const v of Object.values(foresightView(g.s))) assert.deepEqual(Object.keys(v), ['game']);
  // The elder reads two steps ahead (visited and the current node excluded).
  const e = foresightRun(2);
  const two = within(e.s.run, e.s.run.pos, 2).filter((id) => ['ice', 'cache'].includes(nodeById(e.s.run.map, id).type));
  assert.deepEqual(Object.keys(foresightView(e.s)).map(Number).sort((a, b) => a - b), two.sort((a, b) => a - b));
  // Not another form, not with the switch off, not without fate.
  const other = foresightRun(1, {}, 'deep', 'tuneCorp');
  assert.deepEqual(foresightView(other.s), {});
  NR2.foresight.on = false;
  assert.deepEqual(foresightView(s), {});
  NR2.foresight.on = true;
  const nofate = foresightRun(1, {}, 'deep', 'tuneStreet', 5, false);
  assert.deepEqual(foresightView(nofate.s), {}, 'without fate there is nothing to read');
  reset();
});

test('foresight tells the truth: what it shows of an ICE or a cache is what the player meets on arrival', () => {
  for (const level of [1, 2]) {
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const { s, rng } = foresightRun(level, {}, 'deep', 'tuneStreet', seed);
      const view = foresightView(s);
      for (const node of runOptions(s.run)) {
        const seen = view[node.id];
        if (!seen) continue;
        // Arrive with a different rng each time: the contents must match what was shown.
        const clone = JSON.parse(JSON.stringify(s));
        const res = moveTo(clone, node.id, stub(0.5));
        if (node.type === 'ice' && res.kind === 'ice' && !res.phased) {
          assert.equal(res.game, seen.game, `seed ${seed}: the game`);
          assert.equal(res.tier, seen.tier, `seed ${seed}: the tier`);
        }
        if (node.type === 'cache') assert.equal(Boolean(res.item), seen.filled, `seed ${seed}: a cache shown filled cracks an item and one shown empty does not`);
      }
      assert.ok(rng);
    }
  }
  reset();
});

test('foresight makes the nodes it reads visible: the elder sees two steps ahead, the adult only the next step', () => {
  const e = foresightRun(2);
  const vis = visibleNodeIds(e.s);
  for (const id of within(e.s.run, e.s.run.pos, 2)) assert.ok(vis.has(id), `elder: node ${id}`);
  NR2.foresight.on = false;
  const two = within(e.s.run, e.s.run.pos, 2).filter((id) => !within(e.s.run, e.s.run.pos, 1).includes(id));
  assert.ok(two.some((id) => !visibleNodeIds(e.s).has(id)), 'without Foresight the second step is not visible');
  reset();
});

test('Tune street, decided: the elder repairs 3 a move, reads the ICE\'s game two steps ahead (the adult one step), and NR2=all switches Foresight on', async () => {
  reset();
  assert.deepEqual(NR2.ab.upkeep.tuneStreet, { 1: 0, 2: 3 });
  assert.deepEqual(NR2.foresight.depth, { 1: 1, 2: 2 });
  assert.deepEqual(NR2.foresight.fields, { 1: ['game'], 2: ['game'] });
  const { execFileSync } = await import('node:child_process');
  const out = execFileSync('node', ['--input-type=module', '-e', "const { NR2 } = await import('./prototype/netling2/sim/netrun/nr2.js'); console.log(JSON.stringify([NR2.fate, NR2.foresight.on, NR2.foresight.depth, NR2.foresight.fields]))"], { env: { ...process.env, NR2: 'all' }, cwd: new URL('../..', import.meta.url).pathname }).toString().trim();
  assert.equal(out, JSON.stringify([true, true, { 1: 1, 2: 2 }, { 1: ['game'], 2: ['game'] }]));
  // A Tune street elder gets 3 Integrity a move.
  const s = (() => {
    const rng = mulberry32(5);
    const x = createScript({ now: 0, rng });
    x.stage = 'mainframe';
    x.form = 'tuneStreetElder';
    set({ abilities: true });
    Object.assign(x.stats, { charge: 100, integrity: 50, heat: 30 });
    startRun(x, 'public', rng, []);
    const node = runOptions(x.run)[0];
    node.type = 'cache';
    moveTo(x, node.id, rng);
    return x;
  })();
  assert.equal(s.stats.integrity, 53);
  reset();
});

// --- challenges under the 2.0 abilities (drafts, ground rule 5; sim/challenge-sweep.mjs) ---------------------------------------------
function challengeRun(form, level, challenge, patch = {}, seed = 5) {
  set({ abilities: true, ...patch });
  const rng = mulberry32(seed);
  const s = createScript({ now: 0, rng });
  s.stage = level === 2 ? 'mainframe' : 'adult';
  s.form = level === 2 ? `${form}Elder` : form;
  Object.assign(s.stats, { charge: 90, integrity: 50, heat: 30 });
  startRun(s, 'deep', rng, [], [], { challenge });
  return { s, rng };
}
const goTo = (s, type, rng, extra = {}) => {
  const node = runOptions(s.run)[0];
  Object.assign(node, { type }, extra);
  return moveTo(s, node.id, rng);
};

test('Unplugged: the elder relay patches (Breach corp, Tune corp) are dark; Tune street\'s repair per move is not a relay and keeps working', () => {
  for (const form of ['breachCorp', 'tuneCorp']) {
    const lit = challengeRun(form, 2, null);
    goTo(lit.s, 'relay', lit.rng);
    assert.ok(lit.s.stats.integrity > 50, `${form}: the patch works on a lit relay`);
    const dark = challengeRun(form, 2, 'unplugged');
    goTo(dark.s, 'relay', dark.rng);
    assert.equal(dark.s.stats.integrity, 50, `${form}: no patch on a dark relay`);
    assert.ok(lit.s.stats.charge > dark.s.stats.charge, `${form}: and no recharge on a dark relay`);
  }
  const street = challengeRun('tuneStreet', 2, 'unplugged');
  goTo(street.s, 'cache', street.rng);
  assert.equal(street.s.stats.integrity, 53, 'the per-move repair (3) is not a relay');
  reset();
});

test('Unplugged: a dark-relay repair per move for the Tune corp elder is off by default, and applies only under Unplugged when set', () => {
  const off = challengeRun('tuneCorp', 2, 'unplugged');
  goTo(off.s, 'cache', off.rng);
  assert.equal(off.s.stats.integrity, 50, 'off by default');
  const patch = { ab: { darkUpkeep: { tuneCorp: { 1: 0, 2: 2 } } } };
  const on = challengeRun('tuneCorp', 2, 'unplugged', patch);
  goTo(on.s, 'cache', on.rng);
  assert.equal(on.s.stats.integrity, 52);
  const lit = challengeRun('tuneCorp', 2, null, patch);
  goTo(lit.s, 'cache', lit.rng);
  assert.equal(lit.s.stats.integrity, 50, 'not outside Unplugged');
  const adult = challengeRun('tuneCorp', 1, 'unplugged', patch);
  goTo(adult.s, 'cache', adult.rng);
  assert.equal(adult.s.stats.integrity, 50, 'not for the adult');
  reset();
});

test('Glass: an elder Breach street\'s soft first loss counts as lost, and so does a loss that Breach corp\'s insurance survives', () => {
  const soft = challengeRun('breachStreet', 2, 'glass');
  goTo(soft.s, 'ice', soft.rng);
  resolveIce(soft.s, false, () => 0);
  assert.equal(soft.s.run.challengeVoid, true, 'the soft loss voids Glass');
  const ins = challengeRun('breachCorp', 1, 'glass');
  ins.s.stats.integrity = 5;
  goTo(ins.s, 'ice', ins.rng);
  resolveIce(ins.s, false, () => 0);
  assert.equal(ins.s.run.challengeVoid, true, 'a blow the insurance pays off is still a lost fight');
  assert.equal(ins.s.run.phase === 'done' && ins.s.run.result === 'disconnected', false, 'and it survives');
  const slip = challengeRun('dodgeCorp', 1, 'glass');
  goTo(slip.s, 'ice', slip.rng);
  assert.equal(slip.s.run.challengeVoid, false, 'slipping past an ICE is not losing a fight');
  reset();
});

test('Blackout: the hidden forms see only the next step; the Tune forms keep a limited sight (Tune corp two steps of types, Tune street the next step\'s ICE game); dark if the variant is off', () => {
  const extra = { fate: true, foresight: { on: true } };
  const next = (s) => new Set([...s.run.visited, ...nodeById(s.run.map, s.run.pos).edges]);
  const hidden = challengeRun('hidden', 1, 'blackout', extra);
  assert.deepEqual([...visibleNodeIds(hidden.s)].sort(), [...next(hidden.s)].sort(), 'the hidden forms: only where it has been and one step ahead');
  // Tune corp, at both levels: two steps of types, no more.
  for (const level of [1, 2]) {
    const c = challengeRun('tuneCorp', level, 'blackout', extra);
    const two = new Set([...next(c.s), ...[...nodeById(c.s.run.map, c.s.run.pos).edges].flatMap((id) => nodeById(c.s.run.map, id).edges)]);
    assert.deepEqual([...visibleNodeIds(c.s)].sort(), [...two].sort(), `Tune corp level ${level}`);
  }
  // Tune street: no sight beyond the next step, and Foresight reads only the next step's contents (the elder's second step is dark).
  const e = challengeRun('tuneStreet', 2, 'blackout', extra);
  assert.deepEqual([...visibleNodeIds(e.s)].sort(), [...next(e.s)].sort());
  const view = foresightView(e.s);
  assert.ok(Object.keys(view).length > 0);
  for (const id of Object.keys(view).map(Number)) assert.ok(nodeById(e.s.run.map, e.s.run.pos).edges.includes(id), 'only the next step');
  // With the variant off, all of it is dark.
  set({ abilities: true, ...extra, blackout: { tuneCorp: 0, tuneStreet: 0 } });
  const off = challengeRun('tuneStreet', 2, 'blackout', { ...extra, blackout: { tuneCorp: 0, tuneStreet: 0 } });
  assert.deepEqual(foresightView(off.s), {});
  const offCorp = challengeRun('tuneCorp', 2, 'blackout', { ...extra, blackout: { tuneCorp: 0, tuneStreet: 0 } });
  assert.deepEqual([...visibleNodeIds(offCorp.s)].sort(), [...next(offCorp.s)].sort());
  // Outside Blackout nothing changed.
  const free = challengeRun('tuneStreet', 2, null, extra);
  assert.ok(Object.keys(foresightView(free.s)).length > 0);
  reset();
});

test('Bare metal: buying an item breaks it, and a clinic fix, a cache, an ICE win and a found item do not', () => {
  const buy = challengeRun('feastCorp', 2, 'baremetal');
  buy.s.scrip = 100;
  goTo(buy.s, 'market', buy.rng, { flavor: 'corp' });
  choose(buy.s, 'buy0', buy.rng);
  assert.equal(buy.s.run.challengeVoid, true, 'an item bought at the exchange');
  const fix = challengeRun('breachCorp', 1, 'baremetal');
  fix.s.scrip = 100;
  fix.s.bugs = 1;
  goTo(fix.s, 'market', fix.rng, { flavor: 'clinic' });
  choose(fix.s, 'fixscrip', fix.rng);
  assert.equal(fix.s.bugs, 0, 'the bug is fixed');
  assert.equal(fix.s.run.challengeVoid, false, 'a fix is a service, not an item');
  const found = challengeRun('feastStreet', 2, 'baremetal');
  goTo(found.s, 'cache', found.rng, { filled: true });
  assert.equal(found.s.run.challengeVoid, false, 'a found item is fine');
  assert.ok(found.s.run.loot.length > 0);
  reset();
});

// Egg pages as real drops (NR2.eggPages; codex2.js EGG_PAGES). One roll a run on the way out: the exit node or a relay jack-out.
const eggStart = (region, { egg = 'iron', known = [], cleared = [region], stage = 'adult' } = {}) => {
  const s = createScript({ now: 0, rng: mulberry32(5) });
  Object.assign(s, { stage, form: 'breachCorp', egg, eggPages: [...known], cleared: [...cleared] });
  Object.assign(s.stats, { charge: 90, integrity: 90, heat: 30 });
  startRun(s, region, mulberry32(9), []);
  return s;
};
// Leave the run: 'exit' (the exit node), 'relay' (a relay, then out), 'jack' (a plain jack-out), 'disconnect' or 'abort'. -> the line's egg pages.
const leave = (s, how, rng = stub(0)) => {
  if (how === 'exit' || how === 'relay') {
    const node = runOptions(s.run)[0];
    node.type = how;
    moveTo(s, node.id, rng);
    if (how === 'relay') choose(s, 'out', rng);
  } else if (how === 'jack') jackOut(s);
  else if (how === 'disconnect') disconnect(s, 'power drained mid-run.');
  else abortRun(s);
  return s.eggPages;
};

test('egg pages: 18 ids, six per egg (four role pages in order, the hidden page, the Source page), none a story page id', () => {
  assert.equal(EGG_PAGE_IDS.length, 18);
  assert.equal(new Set(EGG_PAGE_IDS).size, 18);
  assert.ok(EGG_PAGE_IDS.every((id) => !FRAGMENTS.some((f) => f.id === id)));
  assert.deepEqual(EGG_PAGES.iron.role, ['iron-breach', 'iron-dodge', 'iron-tune', 'iron-feast']);
  assert.deepEqual([EGG_PAGES.program.hidden[0], EGG_PAGES.iron.hidden[0], EGG_PAGES.wetware.hidden[0]], ['program-ghost', 'iron-guru', 'wetware-blank']);
  assert.equal(nextEggPage('wetware', 'role', ['wetware-breach']), 'wetware-dodge');
  assert.equal(nextEggPage('wetware', 'hidden', ['wetware-blank']), null);
});

test('egg pages are off by default and then draw no random number, so the earlier tables reproduce; on, one roll a run', () => {
  reset();
  assert.equal(NR2.eggPages.on, false);
  const draws = (on) => {
    set({ eggPages: { on } });
    let n = 0;
    leave(eggStart('public'), 'exit', () => { n++; return 0.99; });
    return n;
  };
  const off = draws(false);
  assert.equal(draws(true), off + 1);
  reset();
});

test('egg pages roll only on the way out: at the exit node or a relay jack-out, never on a plain jack-out, a disconnect or an abort', () => {
  set({ eggPages: { on: true } });
  assert.deepEqual(leave(eggStart('public'), 'exit'), ['iron-breach']);
  assert.deepEqual(leave(eggStart('public'), 'relay'), ['iron-breach']);
  for (const how of ['jack', 'disconnect', 'abort']) assert.deepEqual(leave(eggStart('public'), how), [], how);
  reset();
});

test('egg pages: a role page in a cleared non-Deep region, in order and never a repeat; not in an uncleared region; the roll can miss', () => {
  set({ eggPages: { on: true } });
  assert.deepEqual(leave(eggStart('bazaar', { known: ['iron-breach'] }), 'exit'), ['iron-breach', 'iron-dodge']);
  assert.deepEqual(leave(eggStart('corp', { cleared: [] }), 'relay'), [], 'the region must be cleared before this run');
  assert.deepEqual(leave(eggStart('public'), 'exit', stub(0.99)), [], 'the roll can miss');
  assert.deepEqual(leave(eggStart('ruins', { known: EGG_PAGES.iron.role }), 'exit'), EGG_PAGES.iron.role, 'nothing left: no repeat');
  reset();
});

test('egg pages: the hidden page only on a Deep run, at its own rate; the per-life codex cap does not apply', () => {
  set({ eggPages: { on: true } });
  assert.deepEqual(leave(eggStart('deep'), 'relay', stub(0.4)), ['iron-guru'], 'under 0.5');
  assert.deepEqual(leave(eggStart('public'), 'relay', stub(0.4)), [], 'over 0.2');
  assert.deepEqual(leave(eggStart('deep', { known: ['iron-guru'] }), 'relay'), ['iron-guru']);
  const c = eggStart('public');
  c.codexFound = 99; // far over the cap of 12
  assert.deepEqual(leave(c, 'exit'), ['iron-breach']);
  reset();
});

test('egg pages: a Source exit guarantees the egg\'s Source page once; another egg\'s pages are its own', () => {
  set({ eggPages: { on: true } });
  const exit = (opts) => leave(eggStart('source', { stage: 'mainframe', ...opts }), 'exit', stub(0.99));
  assert.deepEqual(exit({}), ['iron-source']);
  assert.deepEqual(exit({ known: ['iron-source'] }), ['iron-source'], 'not twice');
  assert.deepEqual(exit({ egg: 'wetware', known: ['iron-source'] }), ['iron-source', 'wetware-source']);
  reset();
});

// Wider Deep and Source maps and the tier share rising along the run (NR2.map, NR2.tier.layer; both off by default).
test('the parameterized map generator draws the same map as the real one at the region\'s own width and a link chance of 0.5', () => {
  for (const region of ['public', 'bazaar', 'corp', 'ruins', 'deep', 'source']) {
    for (let seed = 1; seed <= 25; seed++) {
      const real = generateMap(region, mulberry32(seed));
      const copy = generateMap2(region, mulberry32(seed), { width: REGIONS[region].width, link2: 0.5 });
      assert.deepEqual(copy, real, `${region} seed ${seed}`);
    }
  }
});

test('a width override changes the layers, every node has a way forward and is reachable, and the entry and exit stay single', () => {
  for (const [region, width] of [['deep', [3, 4]], ['source', [4, 5]]]) {
    let widest = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const map = generateMap2(region, mulberry32(seed), { width, link2: 0.75 });
      const byLayer = new Map();
      for (const n of map.nodes) byLayer.set(n.layer, [...(byLayer.get(n.layer) ?? []), n]);
      assert.equal(byLayer.get(0).length, 1);
      assert.equal(byLayer.get(map.layerCount - 1).length, 1);
      for (let L = 1; L < map.layerCount - 1; L++) {
        const c = byLayer.get(L).length;
        assert.ok(c >= width[0] && c <= width[1], `${region} layer ${L} has ${c}`);
        widest = Math.max(widest, c);
      }
      const reached = new Set([map.nodes[0].id]);
      for (const n of map.nodes) for (const e of n.edges) reached.add(e);
      for (const n of map.nodes) {
        assert.ok(reached.has(n.id), `${region} seed ${seed}: node ${n.id} unreachable`);
        if (n.layer < map.layerCount - 1) assert.ok(n.edges.length >= 1, `${region} seed ${seed}: node ${n.id} is a dead end`);
      }
    }
    assert.equal(widest, width[1], `${region} reaches its widest layer`);
  }
});

test('with NR2.map on, a Deep run uses the wider map; off, it is the real one', () => {
  const countWidths = (seed) => {
    const pet = createScript(Date.UTC(2026, 0, 1), seed);
    const run = startRun(pet, 'deep', mulberry32(seed));
    return Math.max(...[...new Set(run.map.nodes.map((n) => n.layer))].map((l) => run.map.nodes.filter((n) => n.layer === l).length));
  };
  reset();
  const off = Math.max(...[1, 2, 3, 4, 5, 6].map(countWidths));
  assert.ok(off <= REGIONS.deep.width[1], 'off: no layer wider than the real maximum');
  set({ map: { on: true, region: { deep: { width: [4, 5], link2: 0.5 } } } });
  const on = Math.min(...[1, 2, 3, 4, 5, 6].map(countWidths));
  reset();
  assert.ok(on >= 4, 'on: every Deep map has a layer of at least the new minimum width');
});

test('the tier share rises along the run when the gradient is on, keeps the region\'s mean, and is the region share when off', () => {
  set({ tiers: true });
  assert.equal(tierShareAt('deep', 0), NR2.tier.share.deep);
  assert.equal(tierShareAt('deep', 1), NR2.tier.share.deep);
  set({ tiers: true, tier: { layer: { on: true, g: 0.8 } } });
  const lo = tierShareAt('deep', 0);
  const hi = tierShareAt('deep', 1);
  const mean = Array.from({ length: 101 }, (_, i) => tierShareAt('deep', i / 100)).reduce((a, b) => a + b, 0) / 101;
  assert.ok(lo < NR2.tier.share.deep && hi > NR2.tier.share.deep && lo < hi);
  assert.ok(Math.abs(mean - NR2.tier.share.deep) < 1e-9, 'Deep (0.5) is mean-preserving at g 0.8 (no cap reached)');
  assert.ok(tierShareAt('source', 1) <= 1, 'capped at 1');
  set({ tiers: false, tier: { layer: { on: true, g: 0.8 } } });
  assert.equal(tierShareAt('deep', 1), 0, 'no tiers, no share');
  reset();
});

test('the chosen map settings are the defaults and NR2=all switches the wider maps on; the tier gradient stays off', () => {
  assert.deepEqual(DEFAULT.map.region.deep, { width: [3, 4], link2: 0.65 });
  assert.deepEqual(DEFAULT.map.region.source, { width: [3, 5], link2: 0.75 });
  assert.equal(DEFAULT.map.on, false, 'off unless NR2 switches it on');
  assert.equal(DEFAULT.tier.layer.on, false);
  const out = (env) => JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', "const { NR2 } = await import('./prototype/netling2/sim/netrun/nr2.js'); console.log(JSON.stringify({ map: NR2.map.on, layer: NR2.tier.layer.on, tiers: NR2.tiers }));"], { cwd: new URL('../../', import.meta.url), env: { ...process.env, ...env }, encoding: 'utf8' }));
  assert.deepEqual(out({ NR2: 'all' }), { map: true, layer: false, tiers: true });
  assert.deepEqual(out({ NR2: '' }), { map: false, layer: false, tiers: false });
});
