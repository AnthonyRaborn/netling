// Tests for the 2.0 netrun rules in the simulator fork (sim/netrun/nr2.js): one ability per role and lean at two levels, the harder ICE
// tier, the forced filled cache, the grace window after a jack-out and the light egg costs. Deterministic: stub or seeded rng.
import test from 'node:test';
import assert from 'node:assert/strict';
process.env.TZ = 'UTC';
const { createScript, tick, mulberry32, SIDES, IRON } = await import('./sim/sim.js');
const { startRun, moveTo, resolveIce, runOptions, jackOut, abortRun, disconnect, visibleNodeIds, choose } = await import('./sim/netrun/run.js');
const { NR2, tierPenalty, avoidMult } = await import('./sim/netrun/nr2.js');
const { REGIONS } = await import('../../src/netrun/regions.js');

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
