// Tests for the Wetware egg's sprites (so far the baby). Run with `npm run proto:test`. Deterministic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './ready.js'; // first: registers the forms before src/sim.js can load src/accessories.js (see ready.js)
import { wetwareForms, WETWARE_FORMS, wetwarePose } from './wetware-models.js';
import { wetwareKey } from './register.js';
import { forms as ironForms } from './models.js';
import { programForms } from './program-models.js';
import { SPRITES } from '../../src/sprites.js';
import { silhouetteIou, poseDistance, markDistance, offScreen } from '../../tools/lib/sprite-checks.mjs';

const set = wetwareForms();
const baby = set.baby;
const key = (pose) => `${wetwareKey('baby')}${pose === 'a' ? 'A' : pose === 'b' ? 'B' : pose === 'sleep' ? 'Sleep' : 'Dead'}`;

test('Wetware has its baby, in the egg\'s own table', () => {
  assert.deepEqual(Object.keys(WETWARE_FORMS), ['baby']);
  assert.equal(baby.stage, 'baby');
});

test('every baby sprite is rectangular, 12 wide, 9 to 15 rows, with known marks, and the rows of A', () => {
  for (const pose of ['a', 'b', 'sleep', 'dead']) {
    const rows = baby[pose];
    assert.ok(rows.length >= 9 && rows.length <= 15, `${pose}: ${rows.length} rows`);
    assert.equal(new Set(rows.map((r) => r.length)).size, 1, `${pose}: ragged`);
    assert.equal(rows[0].length, 12, `${pose}: width`);
    assert.match(rows.join(''), /^[.#o+x]+$/, `${pose}: marks`);
    assert.equal(rows.length, baby.a.length, `${pose}: same height as A`);
  }
});

test('anchors point at the head, the eyes and the body, in order, and are the same in both frames', () => {
  for (const pose of ['a', 'b', 'sleep']) {
    const { headTop, eyeRow, mouthRow, neckRow } = baby.anchors[pose];
    const sprite = pose === 'sleep' ? baby.a : baby[pose];
    for (const r of [headTop, eyeRow, mouthRow, neckRow]) assert.ok(r >= 0 && r < sprite.length, `${pose}: out of range`);
    assert.ok(headTop < eyeRow && eyeRow < mouthRow && mouthRow < neckRow, `${pose}: out of order`);
    assert.ok(/[#o+x]/.test(sprite[headTop]), `${pose}: headTop row is empty`);
    assert.ok(sprite[eyeRow].includes('o'), `${pose}: no eye on eyeRow`);
  }
  assert.deepEqual(baby.anchors.a, baby.anchors.b);
});

test('the head, eyes, mouth and neck are identical in A and B; only the tendrils animate, and the frames still differ', () => {
  for (let y = 0; y <= baby.anchors.a.neckRow; y++) assert.equal(baby.b[y], baby.a[y], `row ${y} differs between frames`);
  assert.ok(poseDistance(baby.a, baby.b) >= 4, 'A and B nearly identical');
  const bottom = (s) => s.findLastIndex((r) => [...r].filter((c) => c !== '.').length >= s[0].length * 0.4);
  assert.equal(bottom(baby.a), bottom(baby.b), 'the body\'s bottom moves between frames');
});

test('the organoid has its folded cortex (dim cells across the top of the head) and no other form of the baby has them in the eyes', () => {
  assert.ok(baby.a.slice(1, 4).join('').split('x').length - 1 >= 8, 'folds');
  assert.ok(!baby.a[baby.anchors.a.eyeRow].includes('x') && !baby.a[baby.anchors.a.mouthRow].includes('x'));
});

test('the asleep and dead poses keep the awake outline; the eyes are the 1.0 slit and X, plus one Wetware mark on the chest', () => {
  const a = baby.anchors.a;
  assert.equal(poseDistance(baby.a, baby.sleep), 0, 'asleep outline');
  assert.equal(poseDistance(baby.a, baby.dead), 0, 'dead outline');
  assert.ok(markDistance(baby.a, baby.sleep) > 0 && markDistance(baby.a, baby.dead) > 0);
  for (const kind of ['sleep', 'dead']) assert.deepEqual(wetwarePose(baby.a, a, kind), baby[kind]);
  // Asleep: two accent beats on one row under the mouth. Dead: a run of dim cells on one row at or below the neck, longer than the pulse.
  const added = (pose, ch) => baby[pose].flatMap((row, y) => [...row].map((c, x) => (c === ch && baby.a[y][x] !== ch && y > a.mouthRow ? [x, y] : null)).filter(Boolean));
  const pulse = added('sleep', 'o');
  const trace = added('dead', 'x').filter(([, y]) => y >= a.neckRow);
  assert.equal(pulse.length, 2);
  assert.equal(new Set(pulse.map(([, y]) => y)).size, 1, 'pulse on one row');
  assert.ok(trace.length >= 4 && new Set(trace.map(([, y]) => y)).size === 1, `trace ${trace.length} cells`);
  assert.ok(trace.length > pulse.length);
});

test('the baby is clearly its own: silhouette under the 1.0 same-stage bar (0.82) against Iron\'s and Program\'s babies', () => {
  const iron = ironForms('B').baby.a;
  const program = programForms().baby.a;
  const ii = silhouetteIou(baby.a, iron);
  const ip = silhouetteIou(baby.a, program);
  console.log(`  Wetware baby against Iron's ${ii.toFixed(2)}, against Program's ${ip.toFixed(2)}`);
  assert.ok(ii < 0.82 && ip < 0.82);
});

test('the wearable code sees the baby\'s authored anchors and the real head width', async () => {
  const { anchorsFor } = await import('../../src/accessories.js');
  for (const [pose, k] of [['a', 'A'], ['b', 'B'], ['sleep', 'Sleep']]) {
    const used = anchorsFor(SPRITES[`${wetwareKey('baby')}${k}`]);
    const want = baby.anchors[pose];
    assert.deepEqual([used.headTop, used.eyeRow, used.mouthRow, used.neckRow], [want.headTop, want.eyeRow, want.mouthRow, want.neckRow], pose);
  }
  const sprite = SPRITES[key('a')];
  const used = anchorsFor(sprite);
  const painted = [...sprite[baby.anchors.a.headTop]].map((c, x) => (c !== '.' ? x : -1)).filter((x) => x >= 0);
  assert.deepEqual([used.headLeft, used.headRight], [painted[0], painted.at(-1)]);
  assert.ok(used.eyeCols.every((x) => sprite[baby.anchors.a.eyeRow][x] === 'o'), 'eye columns');
});

test('no wearable moves between the A and B frames on the baby, and every wearable stays on screen', async () => {
  const { ACCESSORIES, placeWorn } = await import('../../src/accessories.js');
  const pal = { name: 'ice', main: '#05d9e8', accent: '#ff2a6d' };
  const box = (pts) => ({ x0: Math.min(...pts.map((p) => p.x)), x1: Math.max(...pts.map((p) => p.x)), y0: Math.min(...pts.map((p) => p.y)), y1: Math.max(...pts.map((p) => p.y)) });
  const wearables = ACCESSORIES.filter((x) => x.slot !== 'prop');
  const moved = [];
  const clipped = [];
  for (const w of wearables) {
    const at = (pose) => placeWorn([{ id: w.id }], SPRITES[key(pose)], { frame: 0, time: 0, pal, minRow: -99 })[0].pts;
    const a = at('a');
    const b = at('b');
    assert.equal(a.length, b.length, `${w.id}: a different number of pixels`);
    if (a.length && JSON.stringify(box(a)) !== JSON.stringify(box(b))) moved.push(w.id);
    for (const pose of ['a', 'b', 'sleep']) {
      const sprite = SPRITES[key(pose)];
      const ox = Math.floor((40 - sprite[0].length) / 2);
      const oy = 20 - sprite.length;
      const placed = placeWorn([{ id: w.id }], sprite, { frame: pose === 'b' ? 1 : 0, time: 0, pal, minRow: -oy });
      if (offScreen(placed.flatMap((p) => p.pts.map((q) => ({ x: ox + q.x, y: oy + q.y })))).length) clipped.push(`${pose}/${w.id}`);
    }
  }
  console.log(`  ${wearables.length} wearables on the Wetware baby: ${moved.length} move between frames, ${clipped.length} leave the screen`);
  assert.deepEqual(moved, []);
  assert.deepEqual(clipped, []);
});
