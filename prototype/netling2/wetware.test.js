// Tests for the Wetware egg's sprites (so far the baby and the three teens). Run with `npm run proto:test`. Deterministic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './ready.js'; // first: registers the forms before src/sim.js can load src/accessories.js (see ready.js)
import { wetwareForms, WETWARE_FORMS, WETWARE_TEENS_ALL, WETWARE_HIDDEN_BRANCH, wetwarePose } from './wetware-models.js';
import { wetwareKey } from './register.js';
import { forms as ironForms } from './models.js';
import { programForms } from './program-models.js';
import { SPRITES } from '../../src/sprites.js';
import { silhouetteIou, poseDistance, markDistance, offScreen } from '../../tools/lib/sprite-checks.mjs';

const set = wetwareForms();
const baby = set.baby;
const forms = Object.values(set);
const WIDTH = { baby: 12, teen: 14 };
const key = (f, pose) => `${wetwareKey(f.id)}${pose === 'a' ? 'A' : pose === 'b' ? 'B' : pose === 'sleep' ? 'Sleep' : 'Dead'}`;

test('Wetware has a baby and three teens (corp, street, hidden), in the egg\'s own table', () => {
  assert.deepEqual(Object.keys(WETWARE_FORMS), ['baby', 'teenCorp', 'teenStreet', 'teenHidden']);
  assert.deepEqual(WETWARE_TEENS_ALL.map((id) => WETWARE_FORMS[id].lean), ['corp', 'street', 'hidden']);
  assert.deepEqual(WETWARE_HIDDEN_BRANCH, ['baby', 'teenHidden']);
});

test('every sprite is rectangular, the stage\'s width, 11 rows like Iron\'s and Program\'s babies and teens, with known marks', () => {
  for (const f of forms) {
    for (const pose of ['a', 'b', 'sleep', 'dead']) {
      const rows = f[pose];
      assert.equal(rows.length, 11, `${f.id}/${pose}: ${rows.length} rows`);
      assert.equal(new Set(rows.map((r) => r.length)).size, 1, `${f.id}/${pose}: ragged`);
      assert.equal(rows[0].length, WIDTH[f.stage], `${f.id}/${pose}: width`);
      assert.match(rows.join(''), /^[.#o+x]+$/, `${f.id}/${pose}: marks`);
    }
  }
});

test('anchors point at the head, the eyes and the body, in order, and are the same in both frames', () => {
  for (const f of forms) {
    for (const pose of ['a', 'b', 'sleep']) {
      const { headTop, eyeRow, mouthRow, neckRow } = f.anchors[pose];
      const sprite = pose === 'sleep' ? f.a : f[pose];
      for (const r of [headTop, eyeRow, mouthRow, neckRow]) assert.ok(r >= 0 && r < sprite.length, `${f.id}/${pose}: out of range`);
      assert.ok(headTop < eyeRow && eyeRow < mouthRow && mouthRow < neckRow, `${f.id}/${pose}: out of order`);
      assert.ok(/[#o+x]/.test(sprite[headTop]), `${f.id}/${pose}: headTop row is empty`);
      assert.ok(sprite[eyeRow].includes('o'), `${f.id}/${pose}: no eye on eyeRow`);
    }
    assert.deepEqual(f.anchors.a, f.anchors.b, `${f.id}: the head must not move between frames`);
  }
});

test('the head, eyes, mouth and neck are identical in A and B; only the lower body animates, and the frames still differ', () => {
  for (const f of forms) {
    for (let y = 0; y <= f.anchors.a.neckRow; y++) assert.equal(f.b[y], f.a[y], `${f.id}: row ${y} differs between frames`);
    assert.ok(poseDistance(f.a, f.b) >= 4, `${f.id}: A and B nearly identical`);
    const bottom = (s) => s.findLastIndex((r) => [...r].filter((c) => c !== '.').length >= s[0].length * 0.4);
    assert.equal(bottom(f.a), bottom(f.b), `${f.id}: the body's bottom moves between frames`);
  }
});

test('the organoid has its folded cortex (dim cells across the top of the head) and no other form of the baby has them in the eyes', () => {
  assert.ok(baby.a.slice(1, 4).join('').split('x').length - 1 >= 8, 'folds');
  assert.ok(!baby.a[baby.anchors.a.eyeRow].includes('x') && !baby.a[baby.anchors.a.mouthRow].includes('x'));
});

test('the asleep and dead poses keep the awake outline; the eyes are the 1.0 slit and X, plus one Wetware mark on the chest', () => {
  for (const f of forms) {
  const a = f.anchors.a;
  assert.equal(poseDistance(f.a, f.sleep), 0, `${f.id}: asleep outline`);
  assert.equal(poseDistance(f.a, f.dead), 0, `${f.id}: dead outline`);
  assert.ok(markDistance(f.a, f.sleep) > 0 && markDistance(f.a, f.dead) > 0);
  for (const kind of ['sleep', 'dead']) assert.deepEqual(wetwarePose(f.a, a, kind), f[kind]);
  // Asleep: two accent beats on one row under the mouth. Dead: a run of dim cells on one row at or below the neck, longer than the pulse.
  const added = (pose, ch) => f[pose].flatMap((row, y) => [...row].map((c, x) => (c === ch && f.a[y][x] !== ch && y > a.mouthRow ? [x, y] : null)).filter(Boolean));
  const pulse = added('sleep', 'o');
  const trace = added('dead', 'x').filter(([, y]) => y >= a.neckRow);
  assert.equal(pulse.length, 2, `${f.id}: pulse`);
  assert.equal(new Set(pulse.map(([, y]) => y)).size, 1, `${f.id}: pulse on one row`);
  assert.ok(trace.length >= 4 && new Set(trace.map(([, y]) => y)).size === 1, `${f.id}: trace ${trace.length} cells`);
  assert.ok(trace.length > pulse.length);
  }
});

test('the baby is clearly its own: silhouette under the 1.0 same-stage bar (0.82) against Iron\'s and Program\'s babies', () => {
  const iron = ironForms('B').baby.a;
  const program = programForms().baby.a;
  const ii = silhouetteIou(baby.a, iron);
  const ip = silhouetteIou(baby.a, program);
  console.log(`  Wetware baby against Iron's ${ii.toFixed(2)}, against Program's ${ip.toFixed(2)}`);
  assert.ok(ii < 0.82 && ip < 0.82);
});

test('the wearable code sees every Wetware form\'s authored anchors, and the real head width', async () => {
  const { anchorsFor } = await import('../../src/accessories.js');
  for (const f of forms) {
    for (const [pose, k] of [['a', 'A'], ['b', 'B'], ['sleep', 'Sleep']]) {
      const used = anchorsFor(SPRITES[`${wetwareKey(f.id)}${k}`]);
      const want = f.anchors[pose];
      assert.deepEqual([used.headTop, used.eyeRow, used.mouthRow, used.neckRow], [want.headTop, want.eyeRow, want.mouthRow, want.neckRow], `${f.id}/${pose}`);
    }
    const sprite = SPRITES[key(f, 'a')];
    const used = anchorsFor(sprite);
    const painted = [...sprite[f.anchors.a.headTop]].map((c, x) => (c !== '.' ? x : -1)).filter((x) => x >= 0);
    assert.deepEqual([used.headLeft, used.headRight], [painted[0], painted.at(-1)], f.id);
    assert.ok(used.eyeCols.every((x) => sprite[f.anchors.a.eyeRow][x] === 'o'), `${f.id}: eye columns`);
  }
});

test('no wearable moves between the A and B frames on any Wetware form, and every wearable stays on screen', async () => {
  const { ACCESSORIES, placeWorn } = await import('../../src/accessories.js');
  const pal = { name: 'ice', main: '#05d9e8', accent: '#ff2a6d' };
  const box = (pts) => ({ x0: Math.min(...pts.map((p) => p.x)), x1: Math.max(...pts.map((p) => p.x)), y0: Math.min(...pts.map((p) => p.y)), y1: Math.max(...pts.map((p) => p.y)) });
  const wearables = ACCESSORIES.filter((x) => x.slot !== 'prop');
  const moved = [];
  const clipped = [];
  for (const f of forms) {
    for (const w of wearables) {
      const at = (pose) => placeWorn([{ id: w.id }], SPRITES[key(f, pose)], { frame: 0, time: 0, pal, minRow: -99 })[0].pts;
      const a = at('a');
      const b = at('b');
      assert.equal(a.length, b.length, `${f.id}/${w.id}: a different number of pixels`);
      if (a.length && JSON.stringify(box(a)) !== JSON.stringify(box(b))) moved.push(`${f.id}/${w.id}`);
      for (const pose of ['a', 'b', 'sleep']) {
        const sprite = SPRITES[key(f, pose)];
        const ox = Math.floor((40 - sprite[0].length) / 2);
        const oy = 20 - sprite.length;
        const placed = placeWorn([{ id: w.id }], sprite, { frame: pose === 'b' ? 1 : 0, time: 0, pal, minRow: -oy });
        if (offScreen(placed.flatMap((p) => p.pts.map((q) => ({ x: ox + q.x, y: oy + q.y })))).length) clipped.push(`${f.id}/${pose}/${w.id}`);
      }
    }
  }
  console.log(`  ${wearables.length} wearables on ${forms.length} Wetware forms: ${moved.length} move between frames, ${clipped.length} leave the screen`);
  assert.deepEqual(moved, []);
  assert.deepEqual(clipped, []);
});

// --- teens -----------------------------------------------------------------------------------------------------------------------
test('the two main teens differ only slightly; the hidden-path teen stands clear of both by outline', () => {
  const iou = (x, y) => silhouetteIou(set[x].a, set[y].a);
  const mains = iou('teenCorp', 'teenStreet');
  const toCorp = iou('teenHidden', 'teenCorp');
  const toStreet = iou('teenHidden', 'teenStreet');
  console.log(`  Wetware teen overlaps: corp/street ${mains.toFixed(2)}, hidden/corp ${toCorp.toFixed(2)}, hidden/street ${toStreet.toFixed(2)}`);
  assert.ok(mains >= 0.7 && mains <= 0.82, 'the main teens are close, and inside 1.0\'s 0.82 bar for a same-stage pair');
  assert.ok(toCorp < mains - 0.1 && toStreet < mains - 0.1 && toCorp < 0.72 && toStreet < 0.72, 'the hidden teen is more distinct than the main pair by 0.1');
  assert.ok(poseDistance(set.teenHidden.a, set.teenStreet.a) >= 20 && poseDistance(set.teenHidden.a, set.teenCorp.a) >= 20, 'by outline cells, not marks');
  assert.ok(poseDistance(set.teenCorp.a, set.teenStreet.a) >= 4 && poseDistance(set.teenCorp.a, set.teenStreet.a) < 25);
  assert.ok(markDistance(set.teenCorp.a, set.teenStreet.a) > 0, 'the street lean also shows in a mark');
});

test('the baby is distinct from every teen, and the teens are blobs: the baby\'s folds on a wider body with tendril feet', () => {
  for (const id of WETWARE_TEENS_ALL) assert.ok(silhouetteIou(baby.a, set[id].a) < 0.82, id);
  for (const id of ['teenCorp', 'teenStreet']) assert.ok(set[id].a.slice(0, 3).join('').split('x').length - 1 >= 6, `${id}: the cortex folds`);
});

test('the street lean adds to the corp body and does not cut it away: every corp cell is kept except the unibrow\'s and the hair\'s rows', () => {
  const corp = set.teenCorp.a;
  const street = set.teenStreet.a;
  for (let y = 4; y <= 8; y++) assert.ok([...corp[y]].every((c, x) => c === '.' || street[y][x] !== '.'), `row ${y}`);
});

test('the hidden-path teen is Blank\'s cloaked blob: a hood peak, slit eyes, a shimmering body and a scalloped hem, no mouth', () => {
  const h = set.teenHidden;
  assert.ok(h.a[0].replace(/\./g, '').length <= 2, 'a narrow peak');
  assert.ok(h.a[6].includes('x#') && h.a[7].includes('#x'), 'the body shimmers (dim and bright cells alternating)');
  assert.ok(!h.a.join('').includes('+'), 'no mouth');
  assert.ok(h.a.at(-1).includes('.##') || h.a.at(-1).includes('##.'), 'a scalloped hem');
  assert.ok(!h.dead.join('').includes('+'));
});
