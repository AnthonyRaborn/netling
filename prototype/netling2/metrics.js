// What each model costs to author and how distinct its forms are. Shared by the page and the tests.
import { ADULT_BODY, TEEN_BODY, OVERLAYS, LEAN_OVERLAYS, TEEN_OVERLAYS, ADULTS, TEENS, BABY, ELDER } from './art.js';
import { forms, ADULT_IDS, TEEN_IDS, roleForms } from './models.js';
import { silhouetteIou, spriteCells } from '../../tools/lib/sprite-checks.mjs';

const cells = (rows) => rows.reduce((n, r) => n + [...r].filter((c) => c !== '.').length, 0);
const sum = (list) => list.reduce((n, x) => n + x, 0);
const frames = (o) => [o.a, o.b];

// Hand-placed cells and sprites for the three teens and nine adults (baby and elder are the same in both models and left out).
export function authoring(model) {
  if (model === 'A') {
    const all = [TEEN_BODY, ADULT_BODY, ...Object.values(OVERLAYS), ...Object.values(LEAN_OVERLAYS), ...Object.values(TEEN_OVERLAYS)].flatMap(frames);
    return { sprites: all.length, cells: sum(all.map(cells)), note: '2 bodies, 5 role, 2 lean and 3 teen overlays, 2 frames each' };
  }
  const all = [...Object.values(TEENS), ...Object.values(ADULTS)].flatMap(frames);
  return { sprites: all.length, cells: sum(all.map(cells)), note: '3 teens and 9 adults, 2 frames each' };
}
export const sharedCells = () => sum([BABY, ELDER].flatMap((s) => [cells(s.a), cells(s.b)]));

// Silhouette overlap (the 1.0 audit's screen, 0 to 1) between every pair in a set of form ids.
export function overlaps(model, idList) {
  const set = forms(model);
  const pairs = [];
  for (let i = 0; i < idList.length; i++) for (let j = i + 1; j < idList.length; j++) pairs.push({ pair: `${idList[i]}/${idList[j]}`, iou: silhouetteIou(set[idList[i]].a, set[idList[j]].a) });
  pairs.sort((a, b) => b.iou - a.iou);
  return { pairs, worst: pairs[0], mean: sum(pairs.map((p) => p.iou)) / pairs.length, near: pairs.filter((p) => p.iou >= 0.8).length };
}
// Pairs of different roles (the five roles are what the player tells apart first), and the two forms of one role.
export const crossRole = (model) => {
  const picks = ['breach', 'dodge', 'tune', 'feast', 'hidden'].flatMap((r) => roleForms(r));
  const all = overlaps(model, picks);
  const sibling = new Set(['breach', 'dodge', 'tune', 'feast'].map((r) => roleForms(r).join('/')));
  const pairs = all.pairs.filter((p) => !sibling.has(p.pair));
  return { pairs, worst: pairs[0], mean: sum(pairs.map((p) => p.iou)) / pairs.length, near: pairs.filter((p) => p.iou >= 0.8).length };
};
export const siblings = (model) => ['breach', 'dodge', 'tune', 'feast'].map((r) => {
  const [x, y] = roleForms(r);
  return { pair: `${x}/${y}`, iou: silhouetteIou(forms(model)[x].a, forms(model)[y].a) };
});
export const matrix = (model, idList) => idList.map((x) => idList.map((y) => (x === y ? 1 : silhouetteIou(forms(model)[x].a, forms(model)[y].a))));
export const paintedCells = (model, id) => spriteCells(forms(model)[id].a).length;
export { ADULT_IDS, TEEN_IDS };
