// What each model costs to author and how distinct its adults are. Shared by the page and the tests.
import { ADULT_BODY, OVERLAYS, ADULTS, BABY, TEEN, ELDER } from './art.js';
import { forms, ROLE_FORM } from './models.js';
import { silhouetteIou, spriteCells } from '../../tools/lib/sprite-checks.mjs';

const cells = (rows) => rows.reduce((n, r) => n + [...r].filter((c) => c !== '.').length, 0);
const sum = (list) => list.reduce((n, x) => n + x, 0);

// Hand-placed cells and sprites for the five adults (baby, teen and elder are the same in both models and left out).
export function authoring(model) {
  if (model === 'A') {
    const overlays = Object.values(OVERLAYS).flatMap((o) => [o.a, o.b]);
    return { sprites: 2 + overlays.length, cells: cells(ADULT_BODY.a) + cells(ADULT_BODY.b) + sum(overlays.map(cells)), note: '1 body + 5 overlays, 2 frames each' };
  }
  const all = Object.values(ADULTS).flatMap((a) => [a.a, a.b]);
  return { sprites: all.length, cells: sum(all.map(cells)), note: '5 adults, 2 frames each' };
}
export const sharedCells = () => sum([BABY, TEEN, ELDER].flatMap((s) => [cells(s.a), cells(s.b)]));

export function overlapMatrix(model) {
  const set = forms(model);
  const names = Object.values(ROLE_FORM);
  const m = names.map((x) => names.map((y) => (x === y ? 1 : silhouetteIou(set[x].a, set[y].a))));
  const pairs = [];
  for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) pairs.push({ pair: `${names[i]}/${names[j]}`, iou: m[i][j] });
  pairs.sort((a, b) => b.iou - a.iou);
  return { names, m, worst: pairs[0], mean: sum(pairs.map((p) => p.iou)) / pairs.length, near: pairs.filter((p) => p.iou >= 0.8).length };
}
export const paintedCells = (model, name) => spriteCells(forms(model)[name].a).length;
