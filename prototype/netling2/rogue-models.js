// The hidden Rogue egg's forms (docs/NETLING_2_ROGUE_DRAFTS.md, section 8), built like Wetware's (wetware-models.js): A and B share the
// head, eyes and neck; sleep and dead are the 1.0 generic poses plus Rogue's own mark. Ten forms: one baby, one teen (no lean: Rogue has
// no Standing), one adult per role and each adult's elder. First drafts for review.
//
// Rogue's marks (a proposal, easy to change):
//   asleep: no mark, only 1.0's slit eyes. The shut third eye is shut already.
//   dead:   the scraped-off asset tag lights up (its dim cells turn highlight): the plate that was removed shows through at the end.
// Every form carries the shadow, a motion layer (rogue-motion.js): the decoy, registered as `motion`; the split is kept beside it for the
// review page.
import { pose } from './models.js';
import { idMaps, nameOf } from './form-ids.js';
import { decoyMotion } from './rogue-motion.js';
import { ROGUE_BABY, ROGUE_BABY_ANCHORS, ROGUE_TEENS, ROGUE_TEEN_ANCHORS, ROGUE_ADULTS, ROGUE_ADULT_ANCHORS, ROGUE_ELDERS, ROGUE_ELDER_ANCHORS, ROGUE_TAGS } from './rogue-art.js';

const OLD_FORMS = {
  baby: { stage: 'baby' },
  teen: { stage: 'teen' },
  mole: { stage: 'adult', role: 'breach' },
  skip: { stage: 'adult', role: 'dodge' },
  spook: { stage: 'adult', role: 'tune' },
  drop: { stage: 'adult', role: 'feast' },
};
for (const id of ['mole', 'skip', 'spook', 'drop']) OLD_FORMS[`${id}Elder`] = { stage: 'elder', from: id };
const OLD_ADULTS = ['mole', 'skip', 'spook', 'drop'];

const IDS = idMaps('rogue', OLD_FORMS);
const N = IDS.toNew;
const newEntry = (old, f) => ({ ...f, ...(f.stage === 'elder' ? { from: N[f.from] } : {}), id: N[old], art: old, name: nameOf(N[old]) });
export const ROGUE_FORMS = Object.fromEntries(Object.entries(OLD_FORMS).map(([old, f]) => [N[old], newEntry(old, f)]));
export const ROGUE_ADULTS_ALL = OLD_ADULTS.map((x) => N[x]);
export const ROGUE_ELDER_OF = (adult) => N[`${IDS.toOld[adult]}Elder`];
export const rogueArtKey = (id) => IDS.toOld[id] ?? id;

const FRAMES = { baby: ROGUE_BABY, ...ROGUE_TEENS, ...ROGUE_ADULTS, ...ROGUE_ELDERS };
const ANCHORS = { baby: ROGUE_BABY_ANCHORS, ...ROGUE_TEEN_ANCHORS, ...ROGUE_ADULT_ANCHORS, ...ROGUE_ELDER_ANCHORS };
export const rogueTag = (id) => ROGUE_TAGS[rogueArtKey(id)];

// The 1.0 generic poses (the half-cell X centre rounds toward the middle, as on the other eggs), plus the lit tag when dead.
export function roguePose(a, anchors, kind, newOrOldId) {
  const posed = pose(a, anchors.eyeRow, kind);
  if (kind !== 'dead') return posed;
  const g = posed.map((r) => [...r]);
  for (const [x, y] of rogueTag(newOrOldId)) g[y][x] = '+';
  return g.map((r) => r.join(''));
}

function build(old) {
  const frames = FRAMES[old];
  const a = { ...ANCHORS[old] };
  return {
    ...OLD_FORMS[old],
    a: frames.a,
    b: frames.b,
    sleep: roguePose(frames.a, a, 'sleep', old),
    dead: roguePose(frames.a, a, 'dead', old),
    anchors: { a, b: a, sleep: a },
    motion: decoyMotion(OLD_FORMS[old].stage),
  };
}
let cache;
// Memoized: src/accessories.js keys its anchor table on array identity (register.js).
export const rogueForms = () => (cache ??= Object.fromEntries(Object.keys(OLD_FORMS).map((old) => [N[old], { ...build(old), ...newEntry(old, OLD_FORMS[old]) }])));

// The glance (the temper tell's Rogue skin, tell.js): the eyes shift one cell to the side `dir` (-1 left, 1 right), the cell they leave
// filled with the body colour. Every Rogue eye has a body cell on each side (rogue-art.js), so the eyes stay inside the face; wearables
// stay placed on the unglanced frame (as on Program's blink, tellPose), so nothing worn moves with the eyes.
export function rogueGlance(rows, anchors, dir) {
  if (!dir) return rows;
  const g = rows.map((r) => [...r]);
  for (const y of [anchors.eyeRow, anchors.eyeRow + 1]) {
    const eyes = [...rows[y]].map((c, x) => (c === 'o' ? x : -1)).filter((x) => x >= 0);
    for (const x of eyes) g[y][x] = '#';
    for (const x of eyes) g[y][x + dir] = 'o';
  }
  return g.map((r) => r.join(''));
}
