// The dead X eyes are mirror images of each other on every form whose awake eyes are (the half-cell rounding of a two-cell eye goes toward the
// middle of the sprite on all four eggs), and two columns or more apart on every form (X apart, decided 2026-10-12; models.js xCentres).
import './ready.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { forms } from './models.js';
import { programForms } from './program-models.js';
import { wetwareForms } from './wetware-models.js';
import { rogueForms } from './rogue-models.js';

const eggs = { iron: forms('B'), program: programForms(), wetware: wetwareForms(), rogue: rogueForms() };
const cellsOf = (rows, y0, y1) => rows.flatMap((r, y) => (y >= y0 && y <= y1 ? [...r].flatMap((c, x) => (c === 'o' ? [`${x},${y}`] : [])) : []));
const mirror = (cells, w) => new Set(cells.map((k) => { const [x, y] = k.split(','); return `${w - 1 - Number(x)},${y}`; }));

test('a symmetric pair of eyes dies as a symmetric pair of X marks, on every form of every egg', () => {
  let checked = 0;
  for (const [egg, set] of Object.entries(eggs)) {
    for (const f of Object.values(set)) {
      const y0 = f.anchors.a.eyeRow - 1;
      const y1 = f.anchors.a.eyeRow + 2;
      const w = f.a[0].length;
      const awake = cellsOf(f.a, f.anchors.a.eyeRow, f.anchors.a.eyeRow + 1);
      if (awake.length === 0 || ![...mirror(awake, w)].every((k) => awake.includes(k))) continue; // eyes not mirror images: not this test's business
      // An X arm whose mirror cell is empty in the sprite is dropped there (1.0 draws no X cell on an empty cell), so leave those out:
      // Skip's right X loses its lower-right arm to the gap between its torso and its raised arm.
      const painted = (k) => { const [x, y] = k.split(',').map(Number); return f.a[y][w - 1 - x] !== '.'; };
      const dead = cellsOf(f.dead, y0, y1).filter(painted);
      const flipped = mirror(dead, w);
      assert.deepEqual([...flipped].sort(), [...dead].sort(), `${egg}/${f.id}: the dead X marks are not mirror images`);
      checked++;
    }
  }
  assert.ok(checked > 40, `only ${checked} forms checked`);
});

test('X apart: two columns or more between the two dead X\'s on every form of every egg (they touched on 22 forms before)', () => {
  for (const [egg, set] of Object.entries(eggs)) {
    for (const f of Object.values(set)) {
      const e = f.anchors.a.eyeRow;
      const cols = [...new Set([e - 1, e, e + 1, e + 2].flatMap((y) => [...f.dead[y]].map((c, x) => (c === 'o' ? x : -1)).filter((x) => x >= 0)))].sort((a, b) => a - b);
      let gap = 0; // the widest run of columns with no X cell, inside the span of the two X's
      for (let i = 1; i < cols.length; i++) gap = Math.max(gap, cols[i] - cols[i - 1] - 1);
      assert.ok(gap >= 2, `${egg}/${f.id}: ${gap} columns between the X's`);
    }
  }
});
