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
    assert.equal(high.ostrain ?? 0, owner === 'charge' ? OVERUSE.strain.charge.add ?? OVERUSE.strain.add : 0);
    restore();
  }
});

test('every egg: a game at the Sync line or the Heat line costs Integrity; Wetware alone builds strain from the Sync one', () => {
  for (const owner of [null, 'charge', 'sync']) {
    egg(owner);
    const s = make({ sync: OVERUSE.playLine, heat: 30 });
    act(s, 'play', T0, stub(0.99), { game: 'breach', won: true });
    assert.equal(s.stats.integrity, 100 - OVERUSE.int, `owner ${owner}: overplay`);
    assert.equal(s.ostrain ?? 0, owner === 'sync' ? OVERUSE.strain.sync.add ?? OVERUSE.strain.add : 0);
    const h = make({ sync: 50, heat: OVERUSE.heatLine });
    act(h, 'play', T0, stub(0.99), { game: 'breach', won: true });
    assert.ok(h.stats.integrity <= 100 - OVERUSE.int, `owner ${owner}: overheat`);
    assert.equal(h.ostrain ?? 0, 0, 'heat builds no Program or Wetware strain (Iron has wear)');
    restore();
  }
});

test('overfeeding: a full netling takes three more feeds, the third writes a cache file, the fourth is refused, and the count resets under 85', () => {
  egg('charge');
  const s = make({ charge: 96 });
  s.cache = 0;
  for (let i = 1; i <= OVERUSE.maxOverfeeds; i++) {
    assert.equal(act(s, 'corp', T0, stub(0.99)).ok, true, `overfeed ${i}`);
    assert.equal(s.cache, i === OVERUSE.maxOverfeeds ? 1 : 0, `cache after overfeed ${i}`);
  }
  assert.equal(s.stats.integrity, 100 - OVERUSE.maxOverfeeds * OVERUSE.int);
  assert.equal(act(s, 'corp', T0, stub(0.99)).ok, false, 'the fourth is refused');
  s.stats.charge = OVERUSE.resetLine - 1;
  tick(s, s.lastTick + MIN, stub(0.99));
  s.stats.charge = 96;
  assert.equal(act(s, 'corp', T0, stub(0.99)).ok, true, 'a new fill allows overfeeds again');
  restore();
  const off = make({ charge: 95 });
  assert.equal(act(off, 'corp', T0, stub(0.99)).ok, false, 'with OVERUSE off, 1.0 refuses at 95');
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

// The break on the owner's strain (BRAKE.strainBreak; maintainer, 2026-10-09, option 3: the same rule on every egg; line 80). null switches it off.
const { BRAKE, IRON } = await import('./sim/sim.js');
const withBreak = (line, fn) => {
  const keep = { on: BRAKE.on, strainBreak: BRAKE.strainBreak };
  BRAKE.on = true; BRAKE.strainBreak = line;
  try { fn(); } finally { Object.assign(BRAKE, keep); IRON.on = false; restore(); }
};
const oneMinute = (s) => tick(s, s.lastTick + MIN, stub(0.99));
const broke = (s, key) => (s.brakeUntil?.[key] ?? 0) > s.ageMin;

test('the strain trigger is at 80 by default, and null switches it off', () => {
  assert.equal(BRAKE.strainBreak, 80);
  withBreak(null, () => {
    IRON.on = true; Object.assign(SIDES, { on: true, owner: null, ownerMult: 3, teenStates: true });
    const s = make({ heat: 90 });
    s.wear = 95;
    oneMinute(s);
    assert.equal(broke(s, 'heat'), false, 'Integrity is full, so nothing breaks');
  });
});

test('Iron: Overclock breaks on wear at the line with full Integrity, not under it, and the break is the usual one', () => {
  withBreak(80, () => {
    IRON.on = true; Object.assign(SIDES, { on: true, owner: null, ownerMult: 3, teenStates: true }); OVERUSE.on = true;
    const under = make({ heat: 90 });
    under.wear = 70; // a minute at Heat 90 adds 1.2 and fades 0.6: still under 80
    oneMinute(under);
    assert.equal(broke(under, 'heat'), false);
    const over = make({ heat: 90 });
    over.wear = 85;
    const mistakes = over.careMistakes;
    oneMinute(over);
    assert.equal(broke(over, 'heat'), true);
    assert.ok(over.stats.heat <= BRAKE.drop.heat, 'Heat throttled');
    assert.equal(over.careMistakes, mistakes + 1, 'one fault');
    assert.ok(over.wear > 80, 'the break does not clear wear; it fades on its own');
  });
});

test('Program and Wetware: the owner state breaks on its strain; another egg state does not, and the owner strain does not break Overclock', () => {
  for (const [owner, bar, line] of [['charge', 'charge', 50], ['sync', 'sync', 55]]) {
    withBreak(80, () => {
      egg(owner);
      const s = make({ [bar]: 96, heat: 90 });
      s.sideHeld = { charge: false, sync: false, heat: false, [bar]: true };
      s.sideHold = { charge: 999, sync: 999, heat: 0 };
      s.ostrain = 85;
      oneMinute(s);
      assert.equal(broke(s, bar), true, `${owner}: the owner state breaks`);
      assert.ok(s.stats[bar] <= line, `${owner}: the bar is pushed down`);
      assert.equal(broke(s, 'heat'), false, `${owner}: Overclock has no strain of its own on this egg`);
      const other = owner === 'charge' ? 'sync' : 'charge';
      const t = make({ [other]: 96 });
      t.sideHeld = { charge: false, sync: false, heat: false, [other]: true };
      t.sideHold = { charge: 999, sync: 999, heat: 0 };
      t.ostrain = 85;
      oneMinute(t);
      assert.equal(broke(t, other), false, `${owner}: the non-owner state breaks on Integrity only`);
    });
  }
});

// The strain warning (maintainer, 2026-10-09, option 3): only while the owner's state is active, on crossing the line or on entering the
// state with strain already past it; once per stay in the state.
const WARN = { heat: '> tolerances are slipping.', charge: '> swap is filling up. it is thrashing.', sync: '> it is frayed. too much, too close.' };
const warnings = (s, key) => s.log.filter((e) => e.msg === WARN[key]).length;

test('Iron: the wear warning shows in Overclock only, once a stay, and again on the next entry', () => {
  withBreak(null, () => {
    IRON.on = true; Object.assign(SIDES, { on: true, owner: null, ownerMult: 3, teenStates: true });
    const s = make({ heat: 40 });
    s.wear = 60;
    oneMinute(s);
    assert.equal(warnings(s, 'heat'), 0, 'not overclocked: no warning, though wear is past 50');
    s.stats.heat = 90;
    oneMinute(s); oneMinute(s);
    assert.equal(warnings(s, 'heat'), 1, 'entering Overclock with wear past 50 warns, once');
    s.stats.heat = 40;
    oneMinute(s);
    s.stats.heat = 90;
    oneMinute(s);
    assert.equal(warnings(s, 'heat'), 2, 'a new stay warns again');
  });
});

test('Program and Wetware: the strain warning waits for the state, and precedes a strain break in the same minute', () => {
  for (const owner of ['charge', 'sync']) {
    withBreak(80, () => {
      egg(owner);
      const s = make({ [owner]: 96 });
      s.ostrain = 60;
      s.sideHeld = { charge: false, sync: false, heat: false };
      s.sideHold = { charge: 0, sync: 0, heat: 0 };
      oneMinute(s);
      assert.equal(warnings(s, owner), 0, `${owner}: no state, no warning`);
      const b = make({ [owner]: 96 });
      b.ostrain = 85;
      b.sideHeld = { charge: false, sync: false, heat: false, [owner]: true };
      b.sideHold = { charge: 999, sync: 999, heat: 0 };
      oneMinute(b);
      const w = b.log.findIndex((e) => e.msg === WARN[owner]);
      const k = b.log.findIndex((e) => e.msg.startsWith('> !!'));
      assert.ok(w >= 0 && k > w, `${owner}: the warning comes before the break`);
    });
  }
});
