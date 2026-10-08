// Tests for the egg-pressure states in the 2.0 simulator: a baby never holds Overclock, Overdrive or Overlink (decided: too young and
// unstable), and the states work from the teen stage on. Deterministic: seeded lives.
import test from 'node:test';
import assert from 'node:assert/strict';
process.env.TZ = 'UTC';
const { ARCHETYPES, simulate } = await import('./sim/balance.mjs');
const { SIDES, IRON, overclocked } = await import('./sim/sim.js');

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
