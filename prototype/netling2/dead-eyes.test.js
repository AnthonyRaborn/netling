// The dead X eyes are mirror images of each other on every form whose awake eyes are (the half-cell rounding of a two-cell eye goes toward the
// middle of the sprite on all three eggs).
import './ready.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { forms } from './models.js';
import { programForms } from './program-models.js';
import { wetwareForms } from './wetware-models.js';

const eggs = { iron: forms('B'), program: programForms(), wetware: wetwareForms() };
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
      const dead = cellsOf(f.dead, y0, y1);
      const flipped = mirror(dead, w);
      assert.deepEqual([...flipped].sort(), [...dead].sort(), `${egg}/${f.id}: the dead X marks are not mirror images`);
      checked++;
    }
  }
  assert.ok(checked > 40, `only ${checked} forms checked`);
});
