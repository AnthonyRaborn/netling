// The Program egg's forms (baby and teens so far), built like Iron's authored forms in models.js: A and B share the head, eyes, mouth
// and neck (only the legs move), sleep and dead are the 1.0 generic poses plus Program's own chest mark.
//
// Program's marks come from the sketch's Program register (interrupt-driven, a process that ends):
//   asleep: WAITING, a lone block cursor centred on the chest, a process idle until an interrupt calls it. (A pair of marks read as
//           a second pair of eyes under the first, so it is one block.)
//   dead:   FLATLINE, a solid run across the chest, the line a monitor draws when the process has ended.
// Marks only: they replace body cells (never the eyes or the outline), on the first chest row they fit.
import { ANCHOR_ROWS } from '../../src/sprites.js';
import { pose } from './models.js';
import { PROGRAM_BABY, PROGRAM_TEENS } from './program-art.js';

export const PROGRAM_FORMS = {
  baby: { stage: 'baby', from: 'bitling' },
  teenCorp: { stage: 'teen', lean: 'corp', from: 'kernel' },
  teenStreet: { stage: 'teen', lean: 'street' },
  teenHidden: { stage: 'teen', lean: 'hidden', from: 'shell' }, // 1.0's hidden teen; grows into the Ghost
};
export const PROGRAM_TEENS_ALL = ['teenCorp', 'teenStreet', 'teenHidden'];
export const PROGRAM_HIDDEN_BRANCH = ['baby', 'teenHidden'];

const FRAMES = { baby: PROGRAM_BABY, ...PROGRAM_TEENS };
// 1.0's anchors for the forms reused as they are. Their B anchors equal A's (the head does not move), and sleep takes A's.
// The street teen is Kernel's body, so it takes Kernel's rows.
const ANCHORS_1_0 = { baby: 'bitling', teenCorp: 'kernel', teenStreet: 'kernel', teenHidden: 'shell' };
const anchorsOf = (id) => ({ ...ANCHOR_ROWS[ANCHORS_1_0[id]].a });

const CURSOR = 'oo';
const FLATLINES = ['oooooooo', 'oooooo', 'oooo']; // the longest that fits the chest
// Stamp `pattern` (centred) onto the first row from `from` down where every mark lands on a `fill` cell.
function stamp(rows, from, pattern, fill) {
  const start = (rows[0].length - pattern.length) / 2;
  const paintable = (c) => c === fill || (fill === '#' && c === 'x'); // a taped patch ('x') takes a mark too
  const fits = (y) => [...pattern].every((c, i) => c !== 'o' || paintable(rows[y][start + i]));
  const y = rows.findIndex((_, i) => i >= from && fits(i));
  if (y < 0) throw new Error('no chest row fits the mark');
  return rows.map((row, i) => (i === y ? [...row].map((c, x) => (pattern[x - start] === 'o' && paintable(c) ? 'o' : c)).join('') : row));
}
export function programMarks(rows, anchors, kind, fill) {
  if (kind === 'sleep') return stamp(rows, anchors.mouthRow + 1, CURSOR, fill);
  for (const line of FLATLINES) {
    try {
      return stamp(rows, anchors.neckRow, line, fill);
    } catch {
      // try a shorter line
    }
  }
  throw new Error('no chest row fits the flatline');
}
// The Shell is a void ('x') casing: its eyes go back into the void, and when dead its highlight does too (1.0).
export function programPose(id, a, anchors, kind) {
  const fill = id === 'teenHidden' ? 'x' : '#';
  let g = pose(a, anchors.eyeRow, kind, fill);
  if (id === 'teenHidden' && kind === 'dead') g = g.map((r) => r.replace(/\+/g, 'x'));
  return programMarks(g, anchors, kind, fill);
}

function build(id) {
  const frames = FRAMES[id];
  const a = anchorsOf(id);
  return {
    id,
    ...PROGRAM_FORMS[id],
    a: frames.a,
    b: frames.b,
    sleep: programPose(id, frames.a, a, 'sleep'),
    dead: programPose(id, frames.a, a, 'dead'),
    anchors: { a, b: a, sleep: a },
  };
}
let cache;
// Memoized: src/accessories.js keys its anchor table on array identity (register.js).
export const programForms = () => (cache ??= Object.fromEntries(Object.keys(PROGRAM_FORMS).map((id) => [id, build(id)])));
