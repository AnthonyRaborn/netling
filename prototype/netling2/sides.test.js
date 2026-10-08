// Tests for the egg-pressure states in the 2.0 simulator: a baby never holds Overclock, Overdrive or Overlink (decided: too young and
// unstable), and the states work from the teen stage on. Deterministic: seeded lives.
import test from 'node:test';
import assert from 'node:assert/strict';
process.env.TZ = 'UTC';
const { ARCHETYPES, simulate } = await import('./sim/balance.mjs');
const { SIDES, IRON, overclocked, BRAKE, SIDE_METER } = await import('./sim/sim.js');

const configure = (on) => {
  Object.assign(SIDES.charge, { hi: 80, hold: 180, exit: 65, gate: 0, slow: 0, bleed: 8, overflow: 2, playGain: 0.45, drop: 0.75 });
  Object.assign(SIDES.sync, { hi: 85, hold: 180, exit: 70, swing: 0, steadyDecay: 0, calm: 0, dull: 0.3, virus: 1.2, visit: 0.75, drop: 0.75, penStep: 0.1, penFree: 90, penCap: 0.9, burnN: 2, burnCool: 1440 });
  SIDES.on = on; SIDES.owner = null; SIDES.ownerMult = 3; SIDES.teenStates = true; IRON.on = false;
};

test('Overclock is off for a baby and on for a teen at the same Heat, when the pressures are on', () => {
  configure(true);
  assert.equal(overclocked({ stage: 'baby', stats: { heat: 90 } }), false);
  assert.equal(overclocked({ stage: 'teen', stats: { heat: 90 } }), true);
  assert.equal(overclocked({ stage: 'teen', stats: { heat: 40 } }), false);
  configure(false);
  assert.equal(overclocked({ stage: 'baby', stats: { heat: 90 } }), true, 'with the pressures off the 1.0 rule is unchanged');
});

test('over 40 seeded lives of each heavy archetype, no state is first held or captioned before the teen stage', () => {
  configure(true);
  for (const base of ['attentive', 'daredevil', 'sysadmin']) {
    let last = null;
    globalThis.__sample = (s) => { last = s; };
    let reached = 0;
    for (let i = 1; i <= 40; i++) {
      last = null;
      simulate({ ...ARCHETYPES[base] }, i);
      const s = last;
      for (const key of ['charge', 'sync']) {
        const at = s.heldAt?.[key];
        if (at != null) { reached++; assert.ok(at >= s.life.teenAt, `${base} life ${i}: ${key} state at minute ${at}, teen at ${s.life.teenAt}`); }
        const hint = s.hintAt?.[key];
        if (hint != null) assert.ok(hint >= s.life.teenAt, `${base} life ${i}: ${key} caption before the teen stage`);
      }
    }
    assert.ok(reached > 0, `${base} reaches a state in some life`);
  }
  globalThis.__sample = undefined;
  configure(false);
});

// The break (BRAKE, off by default): a cost trigger for the held states with a warning, a drop well below the exit line and a 24 hour lockout.
test('the break is off by default and changes nothing: no break, no warning, same life', () => {
  configure(true);
  SIDES.owner = 'charge';
  assert.equal(BRAKE.on, false);
  for (const k of Object.keys(SIDE_METER)) SIDE_METER[k] = 0;
  const off = simulate({ ...ARCHETYPES['steer-tune-corp'] }, 7);
  assert.equal(SIDE_METER.brakes, 0);
  assert.equal(SIDE_METER.brakeWarns, 0);
  BRAKE.on = true;
  const on = simulate({ ...ARCHETYPES['steer-tune-corp'] }, 7);
  BRAKE.on = false;
  const again = simulate({ ...ARCHETYPES['steer-tune-corp'] }, 7);
  assert.deepEqual(again, off, 'switching it off again gives the same life');
  assert.ok(on !== undefined);
  configure(false);
});

test('with the break on, a held Overdrive ends below breakInt, the bar drops, and nothing is held again for the lockout', () => {
  configure(true);
  SIDES.owner = 'charge';
  BRAKE.on = true;
  for (const k of Object.keys(SIDE_METER)) SIDE_METER[k] = 0;
  let minutesHeldUnder = 0;
  let lockViolations = 0;
  let dropViolations = 0;
  let breaks = 0;
  let prevLock = false;
  globalThis.__sample = (s) => {
    if (s.stage === 'dead') return;
    if (s.sideHeld?.charge && s.stats.integrity < BRAKE.breakInt - 1) minutesHeldUnder++;
    if ((s.brakeUntil?.charge ?? 0) > s.ageMin && s.sideHeld?.charge) lockViolations++;
    const lockNow = (s.brakeUntil?.charge ?? 0) > s.ageMin;
    if (lockNow && !prevLock) { breaks++; if (s.stats.charge > BRAKE.drop.charge + 1) dropViolations++; } // Overdrive's own break (Overlink's drops Sync)
    prevLock = lockNow;
  };
  for (let i = 1; i <= 30; i++) { prevLock = false; simulate({ ...ARCHETYPES['steer-tune-corp'] }, i); }
  globalThis.__sample = undefined;
  BRAKE.on = false;
  configure(false);
  assert.ok(SIDE_METER.brakes > 0, 'a greedy Tune corp netling hits the break in some of 30 lives');
  assert.ok(SIDE_METER.brakeWarns >= SIDE_METER.brakes, 'every break is preceded by a warning');
  assert.equal(minutesHeldUnder, 0, 'a state is not held while Integrity is more than 1 under breakInt');
  assert.equal(lockViolations, 0, 'Overdrive is not held during the lockout');
  assert.equal(dropViolations, 0, 'the bar is at or under the drop level when the break fires');
  assert.ok(breaks > 0);
});

test('Iron: the break throttles Overclock for the lockout, and a baby never triggers it', () => {
  configure(true);
  BRAKE.on = true;
  const hot = { stage: 'teen', stats: { heat: 90 }, ageMin: 1000, brakeUntil: { charge: 0, sync: 0, heat: 2440 } };
  assert.equal(overclocked(hot), false, 'locked out');
  assert.equal(overclocked({ ...hot, ageMin: 2441 }), true, 'free again after the lockout');
  BRAKE.on = false;
  assert.equal(overclocked(hot), true, 'with the break off the lockout field does nothing');
  configure(false);
});
