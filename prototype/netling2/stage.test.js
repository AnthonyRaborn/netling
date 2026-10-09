// Tests for the 2.0 stage care in the simulator fork (STAGE in sim/sim.js; docs/NETLING_2_STAGE_CARE_DRAFTS.md): the stage tables (a 7 hour baby, the adult
// age at 46 hours, baby drain, cache by stage) and the rest call with tired. Everything is off by default. Deterministic: stub or seeded rng, fixed clock.
import test from 'node:test';
import assert from 'node:assert/strict';
process.env.TZ = 'UTC';
const { createScript, tick, act, mulberry32, MIN, STAGE, SIDES, CFG, napCooldownLeft } = await import('./sim/sim.js');
const { ARCHETYPES, simulate } = await import('./sim/balance.mjs');

const DEFAULT = JSON.parse(JSON.stringify(STAGE));
const restore = () => { Object.assign(STAGE, JSON.parse(JSON.stringify(DEFAULT))); };
const T0 = Date.UTC(2026, 0, 5, 9, 0); // 09:00 UTC; sleep is 22:00 to 07:00
const stub = (v) => () => v;

// A netling of this stage, awake in the morning, with healthy stats and nothing open.
function make(stage, ageMin = 100) {
  const s = createScript({ now: T0, rng: mulberry32(3) });
  s.stage = stage;
  s.ageMin = ageMin;
  Object.assign(s.stats, { charge: 80, sync: 80, integrity: 100, heat: 20 });
  s.lastTick = T0;
  return s;
}
const advance = (s, minutes, rng = stub(0.9)) => { for (let i = 0; i < minutes; i++) tick(s, s.lastTick + MIN, rng); };

test('everything is off by default and switching it on and off again leaves a life untouched', () => {
  assert.equal(STAGE.on, false);
  assert.equal(STAGE.rest.on, false);
  const before = simulate({ ...ARCHETYPES.attentive }, 3);
  STAGE.on = true; STAGE.rest.on = true;
  const on = simulate({ ...ARCHETYPES.attentive }, 3);
  restore();
  const after = simulate({ ...ARCHETYPES.attentive }, 3);
  assert.deepEqual(after, before);
  assert.notDeepEqual(on, before, 'on is a different life');
});

test('the stage tables give a 7 hour baby and the adult age at 46 hours; off, the shipped 17 and 51', () => {
  assert.deepEqual([createScript({ now: T0, rng: mulberry32(1) }).life.teenAt, createScript({ now: T0, rng: mulberry32(1) }).life.adultAt], [17 * 60, 51 * 60]);
  STAGE.on = true;
  const s = createScript({ now: T0, rng: mulberry32(1) });
  restore();
  assert.deepEqual([s.life.teenAt, s.life.adultAt, s.life.lifespan], [7 * 60, 46 * 60, CFG.lifespanMin]);
});

test('a baby drains Charge and Sync 2.4 times as fast as a teen, only with the tables on', () => {
  const drain = (stage) => { const s = make(stage); advance(s, 1); return [80 - s.stats.charge, 80 - s.stats.sync]; };
  const [tc, ts] = drain('teen');
  const [bc, bs] = drain('baby');
  assert.ok(Math.abs(bc - tc) < 1e-9 && Math.abs(bs - ts) < 1e-9, 'off: the same');
  STAGE.on = true;
  const [bc2, bs2] = drain('baby');
  const [tc2, ts2] = drain('teen');
  restore();
  assert.ok(Math.abs(bc2 / tc2 - 2.4) < 1e-6 && Math.abs(bs2 / ts2 - 2.4) < 1e-6, `ratios ${bc2 / tc2}, ${bs2 / ts2}`);
});

test('cache is written more often by a baby and less often by an elder (x2, x0.25 of 1/150 a minute)', () => {
  // A stub roll of 0.01 passes 2/150 (0.0133), fails 1/150 (0.0067) and fails 0.25/150.
  const wrote = (stage) => { const s = make(stage); s.sinceFed = 0; advance(s, 1, stub(0.01)); return s.cache > 0; };
  STAGE.on = true;
  const r = { baby: wrote('baby'), teen: wrote('teen'), adult: wrote('adult'), elder: wrote('mainframe') };
  restore();
  assert.deepEqual(r, { baby: true, teen: false, adult: false, elder: false });
  assert.equal(wrote('baby'), false, 'off: a baby is like a teen');
});

test('the rest call: opens when the demand passes the line, on time earns steady, the nap button answers it with a 20 to 30 minute rest and no nap cooldown', () => {
  STAGE.rest.on = true;
  const s = make('teen');
  s.demand = 59.9;
  advance(s, 1);
  assert.ok(s.call, 'a call is open');
  assert.equal(s.restStats.calls, 1);
  advance(s, 10);
  const temper = s.temper;
  const r = act(s, 'nap', s.lastTick, mulberry32(9));
  assert.ok(r.ok, r.msg);
  assert.equal(s.call, null);
  assert.ok(s.nap?.callRest, 'a call-rest');
  const len = s.nap.endsAge - s.nap.startedAge;
  assert.ok(len >= 20 && len <= 30, `a rest of ${len} minutes`);
  assert.ok(Math.abs(s.temper - (temper + 1)) < 0.01, 'on time: steady (temper also decays slowly)');
  assert.equal(s.restStats.onTime, 1);
  advance(s, len + 1);
  assert.equal(s.nap, null, 'the rest ends');
  assert.equal(napCooldownLeft(s), 0, 'a call-rest does not start the nap cooldown');
  assert.ok(s.demand > 10 && s.demand < 11, `the demand was reset to 10 and builds again (${s.demand})`);
  restore();
});

test('the rest call: a late answer is neutral, a lapse sets tired and leans unsteady, and tired drains more and ends with a rest', () => {
  STAGE.rest.on = true;
  const late = make('teen');
  late.demand = 59.9;
  advance(late, 1);
  advance(late, 45);
  const t0 = late.temper;
  act(late, 'nap', late.lastTick, mulberry32(9));
  assert.ok(Math.abs(late.temper - t0) < 0.01, 'late, inside the window: neutral');
  assert.equal(late.restStats.late, 1);

  const lapsed = make('teen');
  lapsed.demand = 59.9;
  advance(lapsed, 1);
  const t1 = lapsed.temper;
  advance(lapsed, 61);
  assert.equal(lapsed.call, null);
  assert.equal(lapsed.tired, true);
  assert.ok(Math.abs(lapsed.temper - (t1 - 1)) < 0.05, `a lapse leans unsteady (${lapsed.temper} from ${t1})`);
  assert.equal(lapsed.restStats.lapsed, 1);
  assert.ok(lapsed.demand >= 40, 'the demand was set back to 40 and builds on');
  // tired drains x1.16
  const calm = make('teen'); const tired = make('teen'); tired.tired = true;
  advance(calm, 1); advance(tired, 1);
  assert.ok(Math.abs((80 - tired.stats.charge) / (80 - calm.stats.charge) - 1.16) < 1e-6);
  // a rest of 20 minutes or more settles it
  act(lapsed, 'nap', lapsed.lastTick, mulberry32(9));
  advance(lapsed, 35 * 0 + 1);
  assert.equal(lapsed.tired, true, 'the plain nap is not yet over');
  advance(lapsed, 125);
  assert.equal(lapsed.tired, false, 'a nap of 20 minutes or more settles tired');
  restore();
});

test('a call-rest pauses a held state and an ordinary nap breaks it', () => {
  const keep = JSON.parse(JSON.stringify(SIDES));
  Object.assign(SIDES, { on: true, owner: 'charge', ownerMult: 3, teenStates: true });
  Object.assign(SIDES.charge, { hi: 80, hold: 180, exit: 65, bleed: 0 });
  STAGE.rest.on = true;
  const held = () => { const s = make('teen'); s.stats.charge = 90; s.sideHeld = { charge: true, sync: false, heat: false }; s.sideHold = { charge: 200, sync: 0, heat: 0 }; return s; };
  const a = held();
  a.demand = 59.9; advance(a, 1);
  act(a, 'nap', a.lastTick, mulberry32(9));
  const count = a.sideHold.charge;
  advance(a, 5);
  assert.equal(a.sideHeld.charge, true, 'answering the call keeps the state');
  assert.equal(a.sideHold.charge, count, 'and neither counts nor resets the hold');
  const b = held();
  act(b, 'nap', b.lastTick, mulberry32(9));
  advance(b, 2);
  assert.equal(b.sideHeld.charge, false, 'a voluntary nap breaks it');
  restore();
  for (const k of Object.keys(SIDES)) delete SIDES[k];
  Object.assign(SIDES, keep);
});
