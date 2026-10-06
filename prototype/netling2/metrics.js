// What each model costs to author for the line, and how the line's forms relate. Shared by the page and the tests.
import { ADULT_BODY, TEEN_BODY, OVERLAYS, LEAN_OVERLAYS, TEEN_OVERLAYS, ADULTS, TEENS, BABY, ELDER } from './art.js';
import { forms, LINE, TEENS_ALL, HIDDEN_BRANCH } from './models.js';
import { silhouetteIou, poseDistance, markDistance, spriteCells } from '../../tools/lib/sprite-checks.mjs';

const cells = (rows) => rows.reduce((n, r) => n + [...r].filter((c) => c !== '.').length, 0);
const sum = (list) => list.reduce((n, x) => n + x, 0);
const frames = (o) => [o.a, o.b];

// Hand-placed cells and sprites for the two stages where the models differ (the teen and the adult).
export function authoring(model) {
  if (model === 'A') {
    const all = [TEEN_BODY, TEEN_OVERLAYS.street, ADULT_BODY, OVERLAYS.breach, LEAN_OVERLAYS.street].flatMap(frames);
    return { sprites: all.length, cells: sum(all.map(cells)), note: 'teen body + overlay, adult body + role overlay + lean overlay, 2 frames each' };
  }
  const all = [TEENS.teenStreet, ADULTS.gronk].flatMap(frames);
  return { sprites: all.length, cells: sum(all.map(cells)), note: 'teen and adult, 2 frames each' };
}
export const sharedCells = () => sum([BABY, ELDER].flatMap((s) => [cells(s.a), cells(s.b)]));

// Silhouette overlap (the 1.0 audit's screen, 0 to 1) between every pair of stages in the line. A line is meant to look
// related: 1.0's mainframes sit at 0.77 to 0.82 of their adult line.
export function lineOverlaps(model) {
  const set = forms(model);
  const pairs = [];
  for (let i = 0; i < LINE.length; i++) for (let j = i + 1; j < LINE.length; j++) pairs.push({ pair: `${LINE[i]}/${LINE[j]}`, iou: silhouetteIou(set[LINE[i]].a, set[LINE[j]].a) });
  return pairs;
}

// How far a composed form is from its authored counterpart (the same form built the two ways): cells that differ in outline,
// cells that differ in mark, and the overlap of the outlines.
export function modelGap(id) {
  const a = forms('A')[id].a;
  const b = forms('B')[id].a;
  return { id, outline: poseDistance(a, b), marks: markDistance(a, b), iou: silhouetteIou(a, b) };
}
export const paintedCells = (model, id) => spriteCells(forms(model)[id].a).length;

// The three teens (authored model) and the hidden branch: how far apart the teens are, and how the hidden-path teen relates to the
// adult it grows into (Guru) against the street teen's relation to it.
export function teenOverlaps() {
  const set = forms('B');
  const out = [];
  for (let i = 0; i < TEENS_ALL.length; i++) for (let j = i + 1; j < TEENS_ALL.length; j++) out.push({ pair: `${TEENS_ALL[i]}/${TEENS_ALL[j]}`, iou: silhouetteIou(set[TEENS_ALL[i]].a, set[TEENS_ALL[j]].a), outline: poseDistance(set[TEENS_ALL[i]].a, set[TEENS_ALL[j]].a) });
  return out;
}
export const hiddenBranch = () => HIDDEN_BRANCH;
export const iouB = (x, y) => silhouetteIou(forms('B')[x].a, forms('B')[y].a);
