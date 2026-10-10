// The motion layers of the hidden Rogue egg's ten forms (docs/NETLING_2_ROGUE_DRAFTS.md, 6.1 and 8.4a to 8.4f). All follow the hidden
// elders' echo rules (blank-motion.js, echo-motion.js): a pure function of (sprite, anchors, time) returning padded rows, a layer over the
// sprite and not a different sprite (the registered A and B frames still obey the frame rules, and wearables sit on them), 12 steps of
// 400 ms, a still version under reduced motion. None touches the eyes, the arc or the tag: only plain body cells ('#') and empty cells.
//
// THE SHADOW (decided), on every form: the decoy, the fork lag's shape used as a decoy left for the hunters. A dim copy steps out to one
//   side a cell at a time, holds, and is dropped at once; it alternates sides by loop; it is drawn only where the figure is empty. It
//   reaches one cell on the baby and teen, two on adults, three on elders. Calm: parked one cell out to the right.
// Each older line has its own effect on top of it (decided, maintainer, 2026-10-10):
//   Breach (Mole, Sleeper): the FADE, from the edges: the body dims from the outline inward, a ring a step, holds, and comes back.
//   Dodge (Skip, Exile): CIPHER'S SHIMMER: a scan band sweeps from the hood to the feet and back; above it the body is solid, on it a dim
//     row, below it plain body cells open into checker holes (the outline changes, as on Cipher). The face rows stay whole.
//   Tune (Spook, Handler): still camo on head and body, drawn in the frames (rogue-art.js); the layer is the plain decoy.
//   Feast (Drop, Stash): a BIGGER DECOY, one cell further than the stage's (3 and 4). Stash's carries a maw (a draft for review): where the
//     shadow shows past the body on its widest row, an opening with a bright tooth at each end, an extra mouth in the shadow.
//   Alias: a hint of the sweep: a dim band runs down the body below the neck and back, with no holes (its two camo bands are in its frames).
//   Foundling: the plain decoy (its camo hint is in its frames).
import { STEPS, STEP_MS, ECHO, stepOf, dub } from './echo-motion.js';

export { STEPS, STEP_MS, ECHO };
export const PAD = 3; // the widest ordinary copy (an elder's) is three cells out
export const BIG_PAD = 4; // the Feast line's bigger decoy reaches one further
export const REACH = { baby: 1, teen: 1, adult: 2, elder: 3 };
// Steps of the loop: out a cell at a time to the reach, hold, then gone for the last four steps.
export const HOLD_UNTIL = 7;
export const offsetAt = (step, reach) => (step === 0 || step > HOLD_UNTIL ? 0 : Math.min(step, reach));
export const sideAt = (time) => (Math.floor(Math.max(0, time) / (STEPS * STEP_MS)) % 2 ? -1 : 1);

const padded = (sprite, pad) => sprite.map((r) => [...('.'.repeat(pad) + r + '.'.repeat(pad))]);
const out = (g) => g.map((r) => r.join(''));

// The decoy into padded rows `g` (padding `pad`), only where the original figure is empty. -> the cells it drew, as [x, y].
function decoyInto(g, sprite, time, reduced, pad, reach) {
  const src = padded(sprite, pad);
  const n = reduced ? 1 : offsetAt(stepOf(time), reach);
  const side = reduced ? 1 : sideAt(time);
  const drawn = [];
  if (!n) return drawn;
  for (let y = 0; y < src.length; y++) for (let x = 0; x < src[0].length; x++) {
    const from = src[y][x - side * n];
    if (src[y][x] === '.' && from && from !== '.') {
      g[y][x] = ECHO.cell;
      drawn.push([x, y]);
    }
  }
  return drawn;
}

// The decoy (and the split, the alternate kept for the review page).
function layer(sprite, stage, time, reduced, both) {
  const g = padded(sprite, PAD);
  const src = padded(sprite, PAD);
  const n = reduced ? 1 : offsetAt(stepOf(time), REACH[stage]);
  const side = reduced ? 1 : sideAt(time);
  if (n) {
    dub(g, src, side * n, 0);
    if (both) dub(g, src, -side * n, 0);
  }
  return out(g);
}
export const decoyMotion = (stage) => (sprite, anchors, { time = 0, reduced = false } = {}) => layer(sprite, stage, time, reduced, false);
export const splitMotion = (stage) => (sprite, anchors, { time = 0, reduced = false } = {}) => layer(sprite, stage, time, reduced, true);
export const SHADOW_OPTIONS = {
  decoy: { name: 'A. decoy (one side, alternating; decided)', make: decoyMotion },
  split: { name: 'B. split (both sides at once)', make: splitMotion },
};

// ---- Breach: the fade from the edges -------------------------------------------------------------------------------------------------
export const FADE_RINGS = [0, 1, 2, 3, 3, 3, 3, 3, 2, 1, 0, 0]; // rings dimmed at each step (in, hold, back)
// Distance of each painted cell from the outside (1 = an outline cell), in 4-neighbour steps.
export function depth(rows) {
  const d = rows.map((r) => [...r].map((c) => (c === '.' ? 0 : Infinity)));
  for (let changed = true; changed;) {
    changed = false;
    for (let y = 0; y < rows.length; y++) for (let x = 0; x < rows[0].length; x++) {
      if (!d[y][x]) continue;
      const n = Math.min(d[y - 1]?.[x] ?? 0, d[y + 1]?.[x] ?? 0, d[y][x - 1] ?? 0, d[y][x + 1] ?? 0) + 1;
      if (n < d[y][x]) { d[y][x] = n; changed = true; }
    }
  }
  return d;
}
export const fadeMotion = (stage) => (sprite, anchors, { time = 0, reduced = false } = {}) => {
  const g = padded(sprite, PAD);
  if (!reduced) {
    const rings = FADE_RINGS[stepOf(time)];
    const d = depth(sprite);
    sprite.forEach((r, y) => [...r].forEach((c, x) => { if (c === '#' && d[y][x] <= rings) g[y][x + PAD] = 'x'; }));
  }
  decoyInto(g, sprite, time, reduced, PAD, REACH[stage]);
  return out(g);
};

// ---- Dodge: Cipher's shimmer ---------------------------------------------------------------------------------------------------------
// The band's row at each step: from row 1 down to the last row and back, scaled to the form's height (Cipher's own runs 1 to 13).
export const bandAt = (step, height) => {
  const t = step <= STEPS / 2 ? step / (STEPS / 2) : (STEPS - step) / (STEPS / 2);
  return Math.round(1 + t * (height - 2));
};
// The face rows, kept whole as Cipher keeps its face opening: the arc's two rows to the row under the eyes.
const faceRow = (anchors, y) => y >= anchors.eyeRow - 2 && y <= anchors.eyeRow + 1;
export const scanMotion = (stage) => (sprite, anchors, { time = 0, reduced = false } = {}) => {
  const g = padded(sprite, PAD);
  if (!reduced) {
    const band = bandAt(stepOf(time), sprite.length);
    for (let y = 0; y < g.length; y++) {
      if (faceRow(anchors, y)) continue;
      for (let x = 0; x < g[0].length; x++) {
        if (g[y][x] !== '#') continue;
        if (y === band) g[y][x] = 'x';
        else if (y > band && (x + y) % 2) g[y][x] = '.';
      }
    }
  }
  decoyInto(g, sprite, time, reduced, PAD, REACH[stage]);
  return out(g);
};

// ---- Feast: the bigger decoy, and Stash's maw (a draft) ------------------------------------------------------------------------------
// The maw: at the copy's own mouth height (the first row from the mouth row down where at least four shadow cells in a row show past the
// body on the decoy's side, and the row under it shows them too), the outermost four cells of that run become a mouth: a dark opening two
// cells wide and two rows tall, with a bright fang at each top corner ('+..+' over 'x..x'). There only while the decoy is out.
function runFrom(drawnRow, side) {
  const sorted = [...drawnRow].sort((p, q) => (side < 0 ? p - q : q - p)); // outermost first
  const run = sorted.length ? [sorted[0]] : [];
  for (let i = 1; i < sorted.length && Math.abs(sorted[i] - run.at(-1)) === 1; i++) run.push(sorted[i]);
  return run;
}
function maw(g, drawn, side, mouthRow) {
  const byRow = new Map();
  for (const [x, y] of drawn) byRow.set(y, [...(byRow.get(y) ?? []), x]);
  for (let y = mouthRow; y < g.length - 1; y++) {
    const run = runFrom(byRow.get(y) ?? [], side);
    const below = new Set(byRow.get(y + 1) ?? []);
    if (run.length < 4 || !run.slice(0, 4).every((x) => below.has(x))) continue;
    const [a, b, c, d] = run.slice(0, 4);
    g[y][a] = '+'; g[y][b] = '.'; g[y][c] = '.'; g[y][d] = '+';
    g[y + 1][b] = '.'; g[y + 1][c] = '.';
    return;
  }
}
export const bigDecoyMotion = (stage, { withMaw = false } = {}) => (sprite, anchors, { time = 0, reduced = false } = {}) => {
  const g = padded(sprite, BIG_PAD);
  const drawn = decoyInto(g, sprite, time, reduced, BIG_PAD, REACH[stage] + 1);
  if (withMaw) maw(g, drawn, reduced ? 1 : sideAt(time), anchors.mouthRow);
  return out(g);
};

// ---- Alias: a hint of the sweep -------------------------------------------------------------------------------------------------------
export const sweepHintMotion = (stage) => (sprite, anchors, { time = 0, reduced = false } = {}) => {
  const g = padded(sprite, PAD);
  if (!reduced) {
    const top = anchors.neckRow + 1;
    const span = sprite.length - top;
    const s = stepOf(time);
    const t = s <= STEPS / 2 ? s / (STEPS / 2) : (STEPS - s) / (STEPS / 2);
    const band = top + Math.round(t * (span - 1));
    [...sprite[band]].forEach((c, x) => { if (c === '#') g[band][x + PAD] = 'x'; });
  }
  decoyInto(g, sprite, time, reduced, PAD, REACH[stage]);
  return out(g);
};

// Which layer each form carries, by its old authoring key (rogue-models.js registers it as `motion`).
export const MOTION_OF = {
  baby: decoyMotion('baby'),
  teen: sweepHintMotion('teen'),
  mole: fadeMotion('adult'), moleElder: fadeMotion('elder'),
  skip: scanMotion('adult'), skipElder: scanMotion('elder'),
  spook: decoyMotion('adult'), spookElder: decoyMotion('elder'),
  drop: bigDecoyMotion('adult'), dropElder: bigDecoyMotion('elder', { withMaw: true }),
};
