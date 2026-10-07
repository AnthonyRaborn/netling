// The Wetware egg's forms, built like Program's (program-models.js): A and B share the head, eyes, mouth and neck; sleep and dead are
// the 1.0 generic poses plus Wetware's own chest mark. So far only the baby is drawn.
//
// Wetware's marks come from the sketch's Wetware register (polling, and a death that is a dream ending and the next one beginning).
// This is a proposal, easy to change:
//   asleep: a slow PULSE, two accent cells with a gap on the first chest row under the mouth: the beat a resting body keeps between visits.
//   dead:   a PALE trace, a run of dim cells across the chest: the pulse that stops and the colour going out of the tissue (the
//           opposite of Program's bright flatline; the dream ends, and the next one starts as a new culture).
// Marks only: they replace body cells (never the eyes or the outline).
import { pose } from './models.js';
import { WETWARE_BABY, WETWARE_BABY_ANCHORS, WETWARE_TEENS, WETWARE_TEEN_ANCHORS, WETWARE_ADULTS, WETWARE_ADULT_ANCHORS } from './wetware-art.js';

export const WETWARE_FORMS = {
  baby: { stage: 'baby' },
  teenCorp: { stage: 'teen', lean: 'corp' },
  teenStreet: { stage: 'teen', lean: 'street' },
  teenHidden: { stage: 'teen', lean: 'hidden' }, // Blank's line
  // Option C, corp then street within a role; so far the corp forms. The street forms and Blank come later.
  razor: { stage: 'adult', role: 'breach', lean: 'corp' },
  wired: { stage: 'adult', role: 'dodge', lean: 'corp', from: 'chrome' }, // 1.0's Chrome
  mentat: { stage: 'adult', role: 'tune', lean: 'corp' },
  nutri: { stage: 'adult', role: 'feast', lean: 'corp' },
};
export const WETWARE_TEENS_ALL = ['teenCorp', 'teenStreet', 'teenHidden'];
export const WETWARE_HIDDEN_BRANCH = ['baby', 'teenHidden'];
export const WETWARE_ADULTS_ALL = ['razor', 'wired', 'mentat', 'nutri'];

const FRAMES = { baby: WETWARE_BABY, ...WETWARE_TEENS, ...WETWARE_ADULTS };
const ANCHORS = { baby: WETWARE_BABY_ANCHORS, ...WETWARE_TEEN_ANCHORS, ...WETWARE_ADULT_ANCHORS };

const PULSE = 'o..o';
const TRACES = ['xxxxxx', 'xxxx']; // the longest that fits the chest
// Stamp `mark` (centred, `ch` where it paints) onto the first row from `from` down where every painted cell lands on a '#' cell.
function stamp(rows, from, mark, ch) {
  const start = (rows[0].length - mark.length) / 2;
  const fits = (y) => [...mark].every((c, i) => c === '.' || rows[y][start + i] === '#');
  const y = rows.findIndex((_, i) => i >= from && fits(i));
  if (y < 0) throw new Error('no chest row fits the mark');
  return rows.map((row, i) => (i === y ? [...row].map((c, x) => (mark[x - start] !== undefined && mark[x - start] !== '.' ? ch : c)).join('') : row));
}
export function wetwareMarks(rows, anchors, kind) {
  if (kind === 'sleep') return stamp(rows, anchors.mouthRow + 1, PULSE, 'o');
  for (const trace of TRACES) {
    try {
      return stamp(rows, anchors.neckRow, trace, 'x');
    } catch {
      // try a shorter trace
    }
  }
  throw new Error('no chest row fits the trace');
}
export const wetwarePose = (a, anchors, kind) => wetwareMarks(pose(a, anchors.eyeRow, kind), anchors, kind);

function build(id) {
  const frames = FRAMES[id];
  const a = { ...ANCHORS[id] };
  return {
    id,
    ...WETWARE_FORMS[id],
    a: frames.a,
    b: frames.b,
    sleep: wetwarePose(frames.a, a, 'sleep'),
    dead: wetwarePose(frames.a, a, 'dead'),
    anchors: { a, b: a, sleep: a },
  };
}
let cache;
// Memoized: src/accessories.js keys its anchor table on array identity (register.js).
export const wetwareForms = () => (cache ??= Object.fromEntries(Object.keys(WETWARE_FORMS).map((id) => [id, build(id)])));
