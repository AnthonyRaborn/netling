// Tests for the players who mind the break (sim/balance.mjs): IRONBOT=watch (Iron's Overclock), SYNCBOT=watch|avoid (Overlink) and
// STATEBOT=watch (every bar), the counterparts of PROGBOT=watch|avoid; and the per-state break counts in SIDE_METER. Deterministic: seeded lives.
import test from 'node:test';
import assert from 'node:assert/strict';
process.env.TZ = 'UTC';
const { ARCHETYPES, simulate } = await import('./sim/balance.mjs');
const { SIDES, IRON, BRAKE, SIDE_METER, overclocked } = await import('./sim/sim.js');

const configure = (owner) => {
  Object.assign(SIDES.charge, { hi: 80, hold: 180, exit: 65, gate: 0, slow: 0, bleed: 8, overflow: 2, playGain: 0.45, drop: 0.75 });
  Object.assign(SIDES.sync, { hi: 85, hold: 180, exit: 70, swing: 0, steadyDecay: 0, calm: 0, dull: 0.3, virus: 1.2, visit: 0.75, drop: 0.75, penStep: 0.1, penFree: 90, penCap: 0.9, burnN: 2, burnCool: 1440 });
  Object.assign(SIDES, { on: true, owner, ownerMult: 3, teenStates: true });
  IRON.on = owner === null;
  BRAKE.on = true;
};
const reset = () => {
  SIDES.on = false; SIDES.owner = null; IRON.on = false; BRAKE.on = false;
  for (const k of ['IRONBOT', 'PROGBOT', 'SYNCBOT', 'STATEBOT']) delete process.env[k];
  delete globalThis.__sample;
};
// Runs `lives` seeded lives of an archetype under a bot setting; returns the break counts and the awake minutes in a state.
const run = (name, lives, env, inState = () => false) => {
  for (const k of ['IRONBOT', 'PROGBOT', 'SYNCBOT', 'STATEBOT']) delete process.env[k];
  Object.assign(process.env, env);
  for (const k of Object.keys(SIDE_METER)) SIDE_METER[k] = 0;
  let held = 0;
  globalThis.__sample = (s) => { if (s.stage !== 'dead' && !s.asleep && !s.nap && inState(s)) held++; };
  const out = Array.from({ length: lives }, (_, i) => simulate({ ...ARCHETYPES[name] }, i + 1));
  return { out, held, m: { ...SIDE_METER } };
};

test('the break counts each state it ends: Overdrive, Overlink and Overclock add up to every break', () => {
  configure('charge');
  const { m } = run('steer-tune-corp', 30, {});
  reset();
  assert.ok(m.brakes > 0, 'a greedy Tune corp netling on Program hits the break in some of 30 lives');
  assert.equal(m.brakeCharge + m.brakeSync + m.brakeHeat, m.brakes);
  assert.ok(m.brakeCharge > 0);
});

test('with no bot setting, or an unknown one, a seeded life is unchanged', () => {
  configure('sync');
  const plain = JSON.stringify(run('attentive', 3, {}).out);
  const other = JSON.stringify(run('attentive', 3, { STATEBOT: 'nothing', SYNCBOT: 'nothing', IRONBOT: 'nothing' }).out);
  reset();
  assert.equal(other, plain);
});

test('STATEBOT=watch on Program: fewer breaks than the default player, and less time in Overdrive', () => {
  configure('charge');
  const held = (s) => Boolean(s.sideHeld?.charge);
  const plain = run('steer-tune-corp', 30, {}, held);
  const watch = run('steer-tune-corp', 30, { STATEBOT: 'watch' }, held);
  reset();
  assert.ok(watch.m.brakes < plain.m.brakes, `breaks ${watch.m.brakes} against ${plain.m.brakes}`);
  assert.ok(watch.held < plain.held);
});

test('IRONBOT=watch on Iron: the overclocker breaks Overclock less often than without it', () => {
  configure(null);
  const plain = run('overclocker', 30, {});
  const watch = run('overclocker', 30, { IRONBOT: 'watch' });
  reset();
  assert.ok(plain.m.brakeHeat > 0, 'the overclocker hits Overclock\'s break in some of 30 lives');
  assert.ok(watch.m.brakeHeat < plain.m.brakeHeat, `Overclock breaks ${watch.m.brakeHeat} against ${plain.m.brakeHeat}`);
});

test('SYNCBOT=avoid on Wetware holds Overlink far less than the default player, and watch sits between them', () => {
  configure('sync');
  const held = (s) => Boolean(s.sideHeld?.sync);
  const plain = run('attentive', 20, {}, held);
  const watch = run('attentive', 20, { SYNCBOT: 'watch' }, held);
  const avoid = run('attentive', 20, { SYNCBOT: 'avoid' }, held);
  reset();
  assert.ok(plain.held > 0);
  assert.ok(avoid.held < plain.held * 0.2, `avoid ${avoid.held} against ${plain.held} awake minutes in Overlink`);
  assert.ok(watch.held <= plain.held && watch.held >= avoid.held, `watch ${watch.held}`);
});
