// The Wetware egg's forms, built like Program's (program-models.js): A and B share the head, eyes, mouth and neck; sleep and dead are
// the 1.0 generic poses plus Wetware's own chest mark. So far only the baby is drawn.
//
// Wetware's marks come from the sketch's Wetware register (polling, and a death that is a dream ending and the next one beginning).
// This is a proposal, easy to change:
//   asleep: no mark, only 1.0's slit eyes. (A first draft put a slow pulse, two accent cells, on the chest row under the mouth; under the
//           mouth it read as stray pixels, and the maintainer dropped it.)
//   dead:   a PALE trace, a run of dim cells across the chest: the pulse that stops and the colour going out of the tissue (the
//           opposite of Program's bright flatline; the dream ends, and the next one starts as a new culture).
// Marks only: they replace body cells (never the eyes or the outline).
import { pose, eyeGroups } from './models.js';
import { blankMotion } from './blank-motion.js';
import { WETWARE_BABY, WETWARE_BABY_ANCHORS, WETWARE_TEENS, WETWARE_TEEN_ANCHORS, WETWARE_ADULTS, WETWARE_ADULT_ANCHORS, WETWARE_ELDERS, WETWARE_ELDER_ANCHORS } from './wetware-art.js';

export const WETWARE_FORMS = {
  baby: { stage: 'baby' },
  teenCorp: { stage: 'teen', lean: 'corp' },
  teenStreet: { stage: 'teen', lean: 'street' },
  teenHidden: { stage: 'teen', lean: 'hidden' }, // Blank's line
  // Option C, corp then street within a role. Blank, the hidden adult, comes later.
  razor: { stage: 'adult', role: 'breach', lean: 'corp' },
  solo: { stage: 'adult', role: 'breach', lean: 'street' },
  wired: { stage: 'adult', role: 'dodge', lean: 'corp', from: 'chrome' }, // 1.0's Chrome
  chipped: { stage: 'adult', role: 'dodge', lean: 'street' },
  mentat: { stage: 'adult', role: 'tune', lean: 'corp' },
  gibson: { stage: 'adult', role: 'tune', lean: 'street' },
  nutri: { stage: 'adult', role: 'feast', lean: 'corp' },
  leech: { stage: 'adult', role: 'feast', lean: 'street' },
  blank: { stage: 'adult', role: 'hidden' }, // the hidden adult, Blank's line
};
// One elder per adult, each a variant of the adult it grows from (Wired's is 1.0's Plat).
for (const id of ['razor', 'solo', 'wired', 'chipped', 'mentat', 'gibson', 'nutri', 'leech', 'blank']) WETWARE_FORMS[`${id}Elder`] = { stage: 'elder', from: id };
export const WETWARE_TEENS_ALL = ['teenCorp', 'teenStreet', 'teenHidden'];
export const WETWARE_HIDDEN_BRANCH = ['baby', 'teenHidden', 'blank'];
export const WETWARE_ADULTS_ALL = ['razor', 'solo', 'wired', 'chipped', 'mentat', 'gibson', 'nutri', 'leech'];
// The eight role forms plus the hidden adult (option C: nine adults an egg).
export const WETWARE_NINE = [...WETWARE_ADULTS_ALL, 'blank'];
export const WETWARE_ELDER_OF = (adult) => `${adult}Elder`;

const FRAMES = { baby: WETWARE_BABY, ...WETWARE_TEENS, ...WETWARE_ADULTS, ...WETWARE_ELDERS };
const ANCHORS = { baby: WETWARE_BABY_ANCHORS, ...WETWARE_TEEN_ANCHORS, ...WETWARE_ADULT_ANCHORS, ...WETWARE_ELDER_ANCHORS };

const TRACES = ['xxxxxx', 'xxxx']; // the longest that fits the chest
// Stamp `mark` (centred, `ch` where it paints) onto the first row from `from` down where every painted cell lands on a body cell ('#', or a
// bright '+' when `bright` is set: Leech's elder has its feeding tube down every row, and the tube goes dark with the rest, the colour
// leaving the tissue. Other forms keep '+' marks (a mouth) and the trace goes to the next row that is all body.
function stamp(rows, from, mark, ch, bright = false) {
  const start = (rows[0].length - mark.length) / 2;
  const fits = (y) => [...mark].every((c, i) => c === '.' || rows[y][start + i] === '#' || (bright && rows[y][start + i] === '+'));
  const y = rows.findIndex((_, i) => i >= from && fits(i));
  if (y < 0) throw new Error('no chest row fits the mark');
  return rows.map((row, i) => (i === y ? [...row].map((c, x) => (mark[x - start] !== undefined && mark[x - start] !== '.' ? ch : c)).join('') : row));
}
export function wetwareMarks(rows, anchors, kind, bright = false) {
  if (kind === 'sleep') return rows;
  for (const trace of TRACES) {
    try {
      return stamp(rows, anchors.neckRow, trace, 'x', bright);
    } catch {
      // try a shorter trace
    }
  }
  throw new Error('no chest row fits the trace');
}
// Wired is 1.0's Chrome, whose eyes are one wide visor band: the generic pose would put a single X in the middle of it. As in 1.0, the
// visor goes dark when dead and an X sits at each end of the band (columns and rows from 1.0's VISORS table for Chrome).
const VISORS = { wired: { rows: [4, 5], xs: [5, 10] }, wiredElder: { rows: [4, 5], xs: [5, 12] } }; // Plat's band is wider (1.0's table)
function wiredDead(a, id) {
  const VISOR = VISORS[id];
  const g = a.map((row, y) => (VISOR.rows.includes(y) ? row.replace(/[o+]/g, '#') : row)).map((row) => [...row]);
  for (const x of VISOR.xs) for (const [dx, dy] of [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]]) g[5 + dy][x + dx] = 'o';
  return g.map((row) => row.join(''));
}
// 1.0's dead X is 3x3 centred on the eye's rounded centre. On an eye two cells wide that rounds to the right for both eyes, so the
// pair of X's sit off the face's centre line (2.5 columns in from the left, 3.5 from the right). Here a half-cell centre rounds toward the
// middle of the sprite, so the pair is symmetric. The eyes clear to the body colour as in 1.0.
const X3 = [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]];
function wetwareDead(a, eyeRow, fill = '#') {
  const g = a.map((row) => [...row]);
  const groups = eyeGroups(a, eyeRow);
  for (const cells of groups) for (const [x, y] of cells) g[y][x] = fill;
  const middle = (a[0].length - 1) / 2;
  for (const cells of groups) {
    const cx = cells.reduce((n, [x]) => n + x, 0) / cells.length;
    const cy = cells.reduce((n, [, y]) => n + y, 0) / cells.length;
    const mx = Number.isInteger(cx) ? cx : cx < middle ? Math.ceil(cx) : Math.floor(cx);
    const my = Math.round(cy);
    for (const [dx, dy] of X3) if (g[my + dy]?.[mx + dx] !== undefined && g[my + dy][mx + dx] !== '.') g[my + dy][mx + dx] = 'o';
  }
  return g.map((row) => row.join(''));
}
// Chipped's right eye is a cyber lens in the highlight colour ('+'), not the accent. The generic pose only knows accent eyes, so it is
// posed as two accent eyes and, asleep, the right lens's slit is given back its highlight colour. (Dead, both X's are accent, as in 1.0.)
const LENS = { chipped: [10, 11], chippedElder: [12, 13] };
function chippedPose(a, anchors, kind, cols) {
  const pair = a.map((row, y) => (y === anchors.eyeRow || y === anchors.eyeRow + 1 ? row.replace(/\+/g, 'o') : row));
  const posed = kind === 'dead' ? wetwareDead(pair, anchors.eyeRow) : pose(pair, anchors.eyeRow, kind);
  if (kind !== 'sleep') return posed;
  return posed.map((row, y) => ((y === anchors.eyeRow || y === anchors.eyeRow + 1) ? [...row].map((c, x) => (c === 'o' && cols.includes(x) ? '+' : c)).join('') : row));
}
// Blank's eyes sit in a dark face opening, so when they close or cross they go back into the dark ('x'), as the Shell's do in Program.
const FILLS = { blank: 'x', blankElder: 'x' };
export const wetwarePose = (a, anchors, kind, id) => wetwareMarks(LENS[id] ? chippedPose(a, anchors, kind, LENS[id]) : VISORS[id] && kind === 'dead' ? wiredDead(a, id) : kind === 'dead' ? wetwareDead(a, anchors.eyeRow, FILLS[id] ?? '#') : pose(a, anchors.eyeRow, kind, FILLS[id] ?? '#'), anchors, kind, id === 'leechElder');

function build(id) {
  const frames = FRAMES[id];
  const a = { ...ANCHORS[id] };
  return {
    id,
    ...WETWARE_FORMS[id],
    a: frames.a,
    b: frames.b,
    sleep: wetwarePose(frames.a, a, 'sleep', id),
    dead: wetwarePose(frames.a, a, 'dead', id),
    anchors: { a, b: a, sleep: a },
    // Blank's elder carries a motion layer that changes its outline on purpose (see blank-motion.js); the frames above obey the frame rules.
    ...(id === 'blankElder' ? { motion: blankMotion } : {}),
  };
}
let cache;
// Memoized: src/accessories.js keys its anchor table on array identity (register.js).
export const wetwareForms = () => (cache ??= Object.fromEntries(Object.keys(WETWARE_FORMS).map((id) => [id, build(id)])));
