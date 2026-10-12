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
// The dead X's (maintainer, 2026-10-12: "the X eyes are pretty close in a few of the forms"): 1.0's 3x3 X sits on each eye's centre, and a
// two-cell eye's half-cell centre rounds toward the middle of the sprite. Rogue's eyes are two cells apart, so on six forms the two X's
// touch (their inner arms side by side, `o#oo#o`) and on Drop and Stash they are one column apart (`o#o#o#o`, a row of dots).
//   inward: as drafted (the shared rule, models.js `pose`).
//   apart:  each half-cell centre rounds AWAY from the other eye instead, so there are two columns between the X's on every form whose
//           eyes are two apart (`o#o##o#o`), still mirror images. An arm that lands on an empty cell is dropped, as 1.0 does. Only where
//           the drafted X's are under two columns apart. The cost: on the narrow heads (Foundling, Alias, Skip, Exile) the outer arms land
//           on the head's outline, since a 12-wide head with eyes two apart has no room for two X's with a gap inside it.
// Asleep:
//   none:    as drafted: only 1.0's slit eyes (the third eye is shut already).
//   oneEye:  it sleeps with one eye open: the left eye stays as awake, the right one a slit. Ties to the glance (always watching).
//   lookout: its shadow stays up: the decoy parked one cell out, as under reduced motion, keeping watch while it sleeps. A still layer.
import { rogueTag } from './rogue-models.js';
import { eyeGroups } from './models.js';
import { decoyMotion } from './rogue-motion.js';

export const DEAD_MARKS = { lit: 'lit (as drafted)', dark: 'dark', hole: 'hole' };
export const SLEEP_MARKS = { none: 'none (as drafted)', oneEye: 'one eye open', lookout: 'shadow on lookout' };

export const X_MODES = { inward: 'X as drafted', apart: 'X apart' };

// The dead pose with the X's placed by `x` (above) and the tag drawn by `mark`.
export function rogueDead(f, mark = 'lit', x = 'inward') {
  const ink = { lit: '+', dark: 'o', hole: '.' }[mark];
  if (!ink) throw new Error(`unknown dead mark: ${mark}`);
  let rows = f.dead;
  if (x === 'apart') rows = xApart(f);
  else if (x !== 'inward') throw new Error(`unknown X mode: ${x}`);
  const g = rows.map((r) => [...r]);
  for (const [x, y] of rogueTag(f.id)) g[y][x] = ink;
  return g.map((r) => r.join(''));
}

function xApart(f) {
  const { eyeRow } = f.anchors.a;
  const groups = eyeGroups(f.a, eyeRow);
  const g = f.a.map((r) => [...r]);
  for (const cells of groups) for (const [x, y] of cells) g[y][x] = '#';
  const centre = (cells) => cells.reduce((n, [x]) => n + x, 0) / cells.length;
  const middle = groups.reduce((n, cells) => n + centre(cells), 0) / groups.length; // between the two eyes
  const sprite = (f.a[0].length - 1) / 2;
  const round = (cx, away) => (cx % 1 !== 0.5 ? Math.round(cx) : (cx < middle) === away ? Math.floor(cx) : Math.ceil(cx));
  // Only where the drafted X's are under two columns apart (Spook and Handler already have two and keep their X's).
  const inward = groups.map((cells) => { const cx = centre(cells); return cx % 1 === 0.5 ? (cx < sprite ? Math.ceil(cx) : Math.floor(cx)) : Math.round(cx); });
  if (groups.length !== 2 || Math.abs(inward[1] - inward[0]) - 3 >= 2) return f.dead;
  for (const cells of groups) {
    const mx = round(centre(cells), true);
    const my = Math.round(cells.reduce((n, [, y]) => n + y, 0) / cells.length);
    for (const [dx, dy] of [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]]) if (g[my + dy]?.[mx + dx] !== undefined && g[my + dy][mx + dx] !== '.') g[my + dy][mx + dx] = 'o';
  }
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
