// Tests for the draft Iron wear seams (seams.js) and the draft Metronome art (metronome-art.js). Run with `npm run proto:test`. Deterministic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './ready.js'; // first: registers the forms before src/sim.js can load src/accessories.js (see ready.js)
import { forms } from './models.js';
import { placeSeams, seams, seamCells } from './seams.js';
import { METRONOME_ART, METRONOME_SIZE, metronomeFrame } from './metronome-art.js';
import { metronome } from './metronome.js';

const iron = Object.values(forms('B'));
const changed = (x, y) => x.flatMap((row, j) => [...row].map((c, i) => (c !== y[j][i] ? [i, j] : null)).filter(Boolean));

test('every one of the 22 Iron forms gets two seams, on opposite edges, each a cut outline cell and a dim cell inward', () => {
  assert.equal(iron.length, 22);
  for (const f of iron) {
    const [s1, s2] = placeSeams(f);
    assert.ok(s1 && s2, `${f.id}: two seams`);
    for (const s of [s1, s2]) {
      const [x, y] = s.cut;
      const painted = [...f.a[y]].map((c, i) => (c !== '.' ? i : -1)).filter((i) => i >= 0);
      assert.ok(x === painted[0] || x === painted.at(-1), `${f.id}: the cut is on the outline`);
      assert.equal(Math.abs(s.dim[0] - x), 1, `${f.id}: the dim cell is one column in`);
      assert.equal(Math.abs(s.dim[1] - y), 1, `${f.id}: and one row up or down`);
    }
    assert.ok(s1.cut[0] > s2.cut[0], `${f.id}: seam 1 on the right, seam 2 on the left`);
  }
});

test('seams touch only plain body cells: never an eye, mouth, highlight or mark; wear 0 changes nothing, 1 two cells, 2 four', () => {
  for (const f of iron) {
    const placed = placeSeams(f);
    assert.deepEqual(seams(f.a, seamCells(placed, 0)), f.a);
    const one = changed(seams(f.a, seamCells(placed, 1)), f.a);
    const two = changed(seams(f.a, seamCells(placed, 2)), f.a);
    assert.equal(one.length, 2, `${f.id}: level 1`);
    assert.equal(two.length, 4, `${f.id}: level 2`);
    for (const [x, y] of one) assert.ok(two.some(([i, j]) => i === x && j === y), `${f.id}: the second level keeps the first seam`);
    for (const [x, y] of two) assert.equal(f.a[y][x], '#', `${f.id}: (${x}, ${y}) was plain body`);
  }
});

test('seams do not move: the same cells on the A and B frames, so they carry no flash risk', () => {
  for (const f of iron) {
    const cells = seamCells(placeSeams(f), 2);
    for (const { cut, dim } of cells) {
      assert.equal(f.a[cut[1]], f.b[cut[1]], `${f.id}: the cut row is the same on A and B`);
      assert.equal(f.a[dim[1]], f.b[dim[1]], `${f.id}: the dim row is the same on A and B`);
    }
    assert.deepEqual(changed(seams(f.b, cells), f.b), changed(seams(f.a, cells), f.a), `${f.id}`);
  }
});

test('the Metronome art: three 5x8 frames, the case fixed, only the rod and weight move, one frame per pendulum position', () => {
  for (const pos of [-1, 0, 1]) {
    const fr = metronomeFrame(pos);
    assert.equal(fr.length, METRONOME_SIZE.h);
    assert.ok(fr.every((r) => r.length === METRONOME_SIZE.w));
    assert.equal(fr.join('').split('o').length - 1, 1, 'one weight');
    assert.deepEqual(fr.slice(3), METRONOME_ART[0].slice(3), 'the case never moves');
  }
  assert.ok(METRONOME_ART[-1][0].startsWith('o') && METRONOME_ART[1][0].endsWith('o'), 'left is left, right is right');
  for (const level of [-2, -1, 0, 1, 2]) for (const time of [0, 1234, 7000, 99999]) assert.ok(metronomeFrame(metronome({ level, time }).pos), `level ${level}`);
});
