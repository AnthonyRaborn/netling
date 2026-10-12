// Rogue's asleep and dead marks: the options reviewed (drafts 11.1), kept for the record and the review page.
// Decided (maintainer, 2026-10-12): the dead tag DARK ('o') and the dead X's APART on every egg, both now in the forms themselves
// (rogue-models.js roguePose, models.js xCentres); asleep as drafted (no mark).
//
// Why the tag changed: a dead netling is drawn in 1.0's DEAD_COLORS (src/sprites.js), where '+' and '#' are the same grey, so the tag as
// first drafted (lit, '+') could not be seen on the dead screen, and the dim tag of the awake frames went with it. 'o' is the darkest
// dead colour, as Iron's barcode and Program's flatline use.
//
// Dead (the tag): lit ('+', as first drafted; not used), dark ('o', decided), hole ('.', not used).
// Asleep: none (as drafted, kept); oneEye (the left eye stays awake; not used); lookout (the decoy parked one cell out; not used).
import { rogueTag } from './rogue-models.js';
import { decoyMotion } from './rogue-motion.js';

export const DEAD_MARKS = { lit: 'lit (first draft)', dark: 'dark (decided)', hole: 'hole' };
export const SLEEP_MARKS = { none: 'none (decided)', oneEye: 'one eye open', lookout: 'shadow on lookout' };

// The dead pose with the tag drawn by `mark` (the X's as the forms have them).
export function rogueDead(f, mark = 'dark') {
  const ink = { lit: '+', dark: 'o', hole: '.' }[mark];
  if (!ink) throw new Error(`unknown dead mark: ${mark}`);
  const g = f.dead.map((r) => [...r]);
  for (const [x, y] of rogueTag(f.id)) g[y][x] = ink;
  return g.map((r) => r.join(''));
}

// -> rows; `lookout` returns padded rows (the decoy's layer), as every motion layer does.
export function rogueSleep(f, mark = 'none') {
  if (mark === 'none') return f.sleep;
  if (mark === 'lookout') return decoyMotion(f.stage)(f.sleep, f.anchors.sleep, { reduced: true });
  if (mark !== 'oneEye') throw new Error(`unknown sleep mark: ${mark}`);
  const { eyeRow } = f.anchors.a;
  const middle = (f.a[0].length - 1) / 2;
  const g = f.sleep.map((r) => [...r]);
  for (const y of [eyeRow, eyeRow + 1]) [...f.a[y]].forEach((c, x) => { if (c === 'o' && x < middle) g[y][x] = 'o'; });
  return g.map((r) => r.join(''));
}
