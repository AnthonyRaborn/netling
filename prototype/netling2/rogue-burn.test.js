// Tests for the self-destruct drafts (rogue-burn.js; docs/archive/netling2/ROGUE_DRAFTS.md, 11.1): every burn on every Rogue form keeps to the
// flash rule (project rule 7), ends on its capture pose, and the poses keep the form's size. Deterministic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './ready.js'; // first: registers the forms before src/sim.js can load src/accessories.js (see ready.js)
import { rogueForms, rogueTag } from './rogue-models.js';
import { burnFrame, leftOf, catchSteps, pickBurn, BURNS, BURN_OPTIONS, LEFT_OPTIONS, BURN_STEPS, BURN_STEP_MS, BURN_RINGS, BURN } from './rogue-burn.js';
import { FLASH_TOGGLE_MS } from '../../src/games/common.js';

const forms = Object.values(rogueForms());

const LEFTS = Object.keys(LEFT_OPTIONS);
const painted = (c) => c !== '.';
// Every frame of a burn, then the capture pose it hands over to.
const sequence = (f, burn, left) => {
  const frames = [];
  for (let s = 0; s < BURN_STEPS; s++) frames.push(burnFrame(f.a, rogueTag(f.id), { time: s * BURN_STEP_MS, burn, left }));
  return [...frames, leftOf(f.a, left)];
};

test('the burn changes the picture only on whole 400 ms steps, at least two flash toggles apart', () => {
  assert.equal(BURN_STEP_MS, 2 * FLASH_TOGGLE_MS);
  const f = forms[2];
  for (const burn of BURNS) {
    for (let s = 0; s < BURN_STEPS; s++) {
      const at = (t) => burnFrame(f.a, rogueTag(f.id), { time: t, burn });
      assert.deepEqual(at(s * BURN_STEP_MS), at(s * BURN_STEP_MS + BURN_STEP_MS - 1), `${burn}: step ${s} changes inside its step`);
    }
  }
});

test('no cell flickers: each burns once (one run of the front), never comes back, and changes at most three times', () => {
  for (const f of forms) for (const burn of BURNS) for (const left of LEFTS) {
    const seq = sequence(f, burn, left);
    for (let y = 0; y < f.a.length; y++) for (let x = 0; x < f.a[0].length; x++) {
      const cells = [f.a[y][x], ...seq.map((rows) => rows[y][x])];
      const runs = cells.filter((c, i) => i === 0 || c !== cells[i - 1]);
      const where = `${f.name} ${burn}/${left} (${x},${y}): ${cells.join('')}`;
      assert.ok(runs.length <= 4, `${where}: changes ${runs.length - 1} times`);
      assert.ok(runs.filter((c) => c === BURN.front).length <= 1, `${where}: the front comes back`);
      // Never back to the body once it has caught.
      const caught = cells.findIndex((c) => c === BURN.front);
      if (caught >= 0) assert.ok(cells.slice(caught).every((c) => c === BURN.front || c === BURN.ash || c === '.' || c === leftOf(f.a, left)[y][x]), where);
    }
  }
});

test('the front is a thin edge, never a filled area: under 30% of the figure at any step', () => {
  for (const f of forms) for (const burn of BURNS) {
    const n = f.a.join('').split('').filter(painted).length;
    for (const rows of sequence(f, burn, 'nothing').slice(0, -1)) {
      const lit = rows.join('').split(BURN.front).length - 1;
      assert.ok(lit / n < 0.3, `${f.name} ${burn}: ${lit} of ${n} cells lit at once`);
    }
  }
});

test('every painted cell catches within BURN_RINGS steps, and the burn ends on the capture pose in 4 s', () => {
  assert.equal(BURN_STEPS * BURN_STEP_MS, 4000);
  for (const f of forms) for (const burn of BURNS) {
    const at = catchSteps(f.a, rogueTag(f.id), burn);
    f.a.forEach((r, y) => [...r].forEach((c, x) => {
      if (painted(c)) assert.ok(at[y][x] >= 0 && at[y][x] < BURN_RINGS, `${f.name} ${burn} (${x},${y})`);
      else assert.equal(at[y][x], Infinity);
    }));
    for (const left of LEFTS) {
      const seq = sequence(f, burn, left);
      const settled = seq[BURN_STEPS].map((r) => r.replace(/[^.]/g, BURN.ash)); // the pose as ash, before the dead colours
      assert.deepEqual(seq[BURN_STEPS - 1], settled, `${f.name} ${burn}/${left}: the last step is not the pose`);
      assert.equal(burnFrame(f.a, rogueTag(f.id), { time: BURN_STEPS * BURN_STEP_MS, burn, left }), null);
    }
  }
});

test('the tag burn lights the tag first; the feet burn starts at the bottom row; the embers fall the same way every time', () => {
  for (const f of forms) {
    const first = burnFrame(f.a, rogueTag(f.id), { time: 0, burn: 'tag' });
    for (const [x, y] of rogueTag(f.id)) assert.equal(first[y][x], BURN.front, `${f.name}: tag cell (${x},${y})`);
    const feet = burnFrame(f.a, rogueTag(f.id), { time: 0, burn: 'feet' });
    const last = f.a.length - 1;
    assert.equal(feet[last], f.a[last].replace(/[^.]/g, BURN.front), `${f.name}: feet`);
    assert.deepEqual(catchSteps(f.a, null, 'embers'), catchSteps(f.a, null, 'embers'));
  }
});

test('calm (reduced motion): no burn, the capture pose at once', () => {
  for (const f of forms) for (const burn of BURNS) assert.equal(burnFrame(f.a, rogueTag(f.id), { time: 0, reduced: true, burn }), null);
});

test('the capture poses keep the form\'s size: the heap on the floor, the scorch inside the outline, nothing empty', () => {
  for (const f of forms) {
    const h = f.a.length, w = f.a[0].length;
    for (const left of LEFTS) {
      const rows = leftOf(f.a, left);
      assert.equal(rows.length, h);
      assert.ok(rows.every((r) => r.length === w && /^[.#x]*$/.test(r)), `${f.name} ${left}`);
    }
    const ash = leftOf(f.a, 'ash');
    assert.ok(ash.slice(0, h - 3).every((r) => !/[^.]/.test(r)), `${f.name}: ash above the floor`);
    assert.ok(/[^.]/.test(ash[h - 1]), `${f.name}: no heap`);
    const scorch = leftOf(f.a, 'scorch');
    scorch.forEach((r, y) => [...r].forEach((c, x) => { if (painted(c)) assert.ok(painted(f.a[y][x]), `${f.name}: scorch outside (${x},${y})`); }));
    assert.ok(leftOf(f.a, 'nothing').every((r) => !/[^.]/.test(r)));
  }
});

test('the burn is picked at random from all three, the same one for the same death', () => {
  assert.deepEqual(BURNS, ['tag', 'feet', 'embers']);
  const counts = { tag: 0, feet: 0, embers: 0 };
  const t0 = Date.UTC(2026, 9, 12);
  for (let i = 0; i < 3000; i++) {
    const seed = t0 + i * 60_017; // deaths a minute or so apart
    assert.equal(pickBurn(seed), pickBurn(seed));
    counts[pickBurn(seed)]++;
  }
  for (const [burn, n] of Object.entries(counts)) assert.ok(n > 850 && n < 1150, `${burn}: ${n} of 3000`);
});

test('every form carries the decided capture pose, the ash heap', () => {
  for (const f of forms) assert.deepEqual(f.captured, leftOf(f.a, 'ash'), f.name);
});

