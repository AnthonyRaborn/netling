// Rogue's asleep and dead marks: the drafted ones (rogue-models.js, drafts 8.4a) beside alternates, for the maintainer's review (drafts 11.1).
// Not registered on the forms; rogue-burn-preview.html draws them.
//
// Why they are up again: the drafted dead mark lights the tag ('+', the highlight), but a dead netling is drawn in 1.0's DEAD_COLORS
// (src/sprites.js), where '+' and '#' are the same grey. So on the dead screen the lit tag cannot be seen at all, and the dim tag of the
// awake frames goes with it. The other eggs' dead marks use 'o' (Iron's barcode, Program's flatline: the darkest cell in DEAD_COLORS) or
// 'x' (Wetware's trace, a dimmer grey), which do read.
//
// Dead (the tag):
//   lit:  as drafted, '+'. Reads in the palette colours only; invisible in DEAD_COLORS.
//   dark: 'o', the tag goes dark like the other eggs' marks: the plate's outline as a dark patch, as Iron's barcode reads.
//   hole: '.', the tag is a hole right through: where the plate was torn off, nothing is left.
// Asleep:
//   none:    as drafted: only 1.0's slit eyes (the third eye is shut already).
//   oneEye:  it sleeps with one eye open: the left eye stays as awake, the right one a slit. Ties to the glance (always watching).
//   lookout: its shadow stays up: the decoy parked one cell out, as under reduced motion, keeping watch while it sleeps. A still layer.
import { rogueTag } from './rogue-models.js';
import { decoyMotion } from './rogue-motion.js';

export const DEAD_MARKS = { lit: 'lit (as drafted)', dark: 'dark', hole: 'hole' };
export const SLEEP_MARKS = { none: 'none (as drafted)', oneEye: 'one eye open', lookout: 'shadow on lookout' };

export function rogueDead(f, mark = 'lit') {
  if (mark === 'lit') return f.dead;
  const ink = { dark: 'o', hole: '.' }[mark];
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
