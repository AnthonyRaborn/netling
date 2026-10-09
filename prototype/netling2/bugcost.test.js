// Tests for the bug fix cost rules in the simulator fork (BUG_CFG.standingOnlyIfShort and a clearStanding other than 2; docs/NETLING_2_STAGE_CARE_DRAFTS.md,
// section 9). Both are off or unchanged by default. Deterministic: no rng.
import test from 'node:test';
import assert from 'node:assert/strict';
process.env.TZ = 'UTC';
const { createScript, mulberry32, BUG_CFG, clearBug } = await import('./sim/sim.js');

const DEFAULT = { ...BUG_CFG };
const restore = () => Object.assign(BUG_CFG, DEFAULT);
const fresh = () => { const s = createScript({ now: Date.UTC(2026, 0, 5, 9, 0), rng: mulberry32(1) }); s.bugs = 3; s.standing = { corp: 6, street: 6 }; return s; };

test('by default a Standing payment is allowed while the netling has scrip', () => {
  const s = fresh(); s.scrip = 100;
  assert.equal(clearBug(s, { pay: 'standing', corp: 1, where: 'clinic' }), true);
});

test('standingOnlyIfShort refuses a Standing payment while scrip covers a fix, and allows it when short', () => {
  try {
    BUG_CFG.standingOnlyIfShort = true;
    const s = fresh(); s.scrip = 15;
    assert.equal(clearBug(s, { pay: 'standing', corp: 1, where: 'clinic' }), false);
    assert.deepEqual([s.standing.corp, s.standing.street, s.bugs], [6, 6, 3]);
    s.scrip = 14;
    assert.equal(clearBug(s, { pay: 'standing', corp: 1, where: 'clinic' }), true);
    assert.equal(clearBug(s, { pay: 'scrip', where: 'clinic' }), false, 'a scrip fix still needs the scrip');
  } finally { restore(); }
});

test('a Standing cost of 5 takes 5 points split as asked, and fails when a track is short', () => {
  try {
    BUG_CFG.clearStanding = 5;
    const s = fresh(); s.scrip = 0;
    assert.equal(clearBug(s, { pay: 'standing', corp: 2, where: 'clinic' }), true);
    assert.deepEqual([s.standing.corp, s.standing.street], [4, 3]);
    assert.equal(clearBug(s, { pay: 'standing', corp: 5, where: 'clinic' }), false, 'corp has 4');
    assert.equal(clearBug(s, { pay: 'standing', corp: 0, where: 'clinic' }), false, 'street has 3');
    assert.equal(s.bugs, 2);
  } finally { restore(); }
});
