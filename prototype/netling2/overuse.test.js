// Tests for OVERUSE in the 2.0 simulator fork (sim/sim.js): basic Integrity costs for feeding, playing and heating past a line on every egg, the
// owner's hidden strain (Program: overfeeding, Wetware: overplaying; Iron keeps its wear), and the states' costs at x1. Off by default.
// Deterministic: stub or seeded rng, fixed clock.
import test from 'node:test';
import assert from 'node:assert/strict';
process.env.TZ = 'UTC';
const { createScript, tick, act, mulberry32, MIN, SIDES, OVERUSE } = await import('./sim/sim.js');
const { ARCHETYPES, simulate } = await import('./sim/balance.mjs');

const DEFAULT = JSON.parse(JSON.stringify(OVERUSE));
const restore = () => {
  Object.assign(OVERUSE, JSON.parse(JSON.stringify(DEFAULT)));
  Object.assign(SIDES, { on: false, owner: null });
};
const T0 = Date.UTC(2026, 0, 5, 9, 0);
const stub = (v) => () => v;
const make = (stats) => {
  const s = createScript({ now: T0, rng: mulberry32(3) });
  s.stage = 'adult';
  s.ageMin = 3000;
  Object.assign(s.stats, { charge: 50, sync: 50, integrity: 100, heat: 30 }, stats);
  s.lastTick = T0;
  return s;
};
const egg = (owner) => { Object.assign(SIDES, { on: true, owner, ownerMult: 3, teenStates: true }); OVERUSE.on = true; };

test('off by default, and switching it on and off again leaves a life untouched', () => {
  assert.equal(OVERUSE.on, false);
  const before = simulate({ ...ARCHETYPES.attentive }, 3);
  OVERUSE.on = true;
  simulate({ ...ARCHETYPES.attentive }, 3);
  restore();
  assert.deepEqual(simulate({ ...ARCHETYPES.attentive }, 3), before);
});

test('every egg: a feed at the line costs Integrity and one under it does not; Program alone builds strain', () => {
  for (const owner of [null, 'charge', 'sync']) {
    egg(owner);
    const low = make({ charge: OVERUSE.feedLine - 1 });
    act(low, 'corp', T0, stub(0.99));
    assert.equal(low.stats.integrity, 100, `owner ${owner}: under the line is free`);
    const high = make({ charge: OVERUSE.feedLine });
    act(high, 'corp', T0, stub(0.99));
    assert.equal(high.stats.integrity, 100 - OVERUSE.int, `owner ${owner}: an overfeed costs int`);
    assert.equal(high.ostrain ?? 0, owner === 'charge' ? OVERUSE.strain.add : 0);
    restore();
  }
});

test('every egg: a game at the Sync line or the Heat line costs Integrity; Wetware alone builds strain from the Sync one', () => {
  for (const owner of [null, 'charge', 'sync']) {
    egg(owner);
    const s = make({ sync: OVERUSE.playLine, heat: 30 });
    act(s, 'play', T0, stub(0.99), { game: 'breach', won: true });
    assert.equal(s.stats.integrity, 100 - OVERUSE.int, `owner ${owner}: overplay`);
    assert.equal(s.ostrain ?? 0, owner === 'sync' ? OVERUSE.strain.add : 0);
    const h = make({ sync: 50, heat: OVERUSE.heatLine });
    act(h, 'play', T0, stub(0.99), { game: 'breach', won: true });
    assert.ok(h.stats.integrity <= 100 - OVERUSE.int, `owner ${owner}: overheat`);
    assert.equal(h.ostrain ?? 0, 0, 'heat builds no Program or Wetware strain (Iron has wear)');
    restore();
  }
});

test('feeding is still refused at 95: the overfeed limit', () => {
  egg('charge');
  const s = make({ charge: 95 });
  assert.equal(act(s, 'corp', T0, stub(0.99)).ok, false);
  assert.equal(s.stats.integrity, 100);
  restore();
});

test('strain fades over time, and faster at rest', () => {
  egg('charge');
  const awake = make({});
  awake.ostrain = 60;
  for (let i = 0; i < 60; i++) tick(awake, awake.lastTick + MIN, stub(0.99));
  const asleep = make({});
  asleep.ostrain = 60;
  asleep.nap = { until: asleep.ageMin + 120, callRest: false };
  for (let i = 0; i < 60; i++) tick(asleep, asleep.lastTick + MIN, stub(0.99));
  restore();
  assert.ok(awake.ostrain < 60 && awake.ostrain > 50, `awake ${awake.ostrain}`);
  assert.ok(asleep.ostrain < awake.ostrain, `asleep ${asleep.ostrain}`);
});

test('costsX1: a held Overdrive bleeds Integrity at x1 for its owner, not x3', () => {
  const bleedFor = (on) => {
    Object.assign(SIDES, { on: true, owner: 'charge', ownerMult: 3, teenStates: true });
    Object.assign(SIDES.charge, { hi: 80, hold: 180, exit: 65, bleed: 8 });
    OVERUSE.on = on;
    const s = make({ charge: 90, integrity: 60 });
    s.sideHeld = { charge: true, sync: false, heat: false };
    s.sideHold = { charge: 200, sync: 0, heat: 0 };
    for (let i = 0; i < 60; i++) tick(s, s.lastTick + MIN, stub(0.99));
    const v = 60 - s.stats.integrity;
    restore();
    return v;
  };
  const x3 = bleedFor(false);
  const x1 = bleedFor(true);
  assert.ok(x1 < x3, `x1 ${x1} against x3 ${x3}`);
});
