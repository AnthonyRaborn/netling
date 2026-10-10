// The motion layers of the hidden Rogue egg's ten forms (docs/NETLING_2_ROGUE_DRAFTS.md, 6.1 and 8.4a to 8.4f). All follow the hidden
// elders' echo rules (blank-motion.js, echo-motion.js): a pure function of (sprite, anchors, time) returning padded rows, a layer over the
// sprite and not a different sprite (the registered A and B frames still obey the frame rules, and wearables sit on them), 12 steps of
// 400 ms, a still version under reduced motion. None touches the eyes, the arc or the tag: only plain body cells ('#') and empty cells.
//
// THE SHADOW (decided), on every form: the decoy, the fork lag's shape used as a decoy left for the hunters. A dim copy steps out to one
//   side a cell at a time, holds, and is dropped at once; it alternates sides by loop; it is drawn only where the figure is empty. It
//   reaches one cell on the baby and teen, two on adults, three on elders. Calm: parked one cell out to the right.
// Each older line has its own effect on top of it (decided, maintainer, 2026-10-10):
//   Breach (Mole, Sleeper): the FADE, from the edges: the body dims from the outline inward, a ring a step, holds, and comes back. Sleeper's
//     goes all the way: it vanishes completely for three steps, leaving only its shadow.
//   Dodge (Skip, Exile): CIPHER'S SHIMMER: a scan band sweeps from the hood to the feet and back; above it the body is solid, on it a dim
//     row, below it plain body cells open into checker holes (the outline changes, as on Cipher). The face rows stay whole.
//     Exile takes turns by loop with THE WIPE BACK ON (decided, 8.4h): from full camo a dim column sweeps left to right wiping it off,
//     one plain step, then the column returns right to left wiping it back on, so it meets the shimmer in camo at both hand-overs.
//   Tune (Spook, Handler): still camo on head and body, drawn in the frames (rogue-art.js); Spook's layer is the plain decoy. Handler's
//     (decided, 8.4i) is THE SIGNAL AND THE SPLIT: the shadow sent out to both sides at once (the agents it runs), and arcs in the body
//     colour pulsing out from its headset cups, two pulses a loop.
//   Feast (Drop, Stash): a BIGGER DECOY, one cell further than the stage's (3 and 4). Stash's carries a maw (a draft for review): at the
//     copy's mouth height and a row lower, a half grin in the eye colour inside the shadow (a line with its outer end curled up), with the
//     shadow's own eye showing beside it; both appear only for the last two steps of the hold, a reveal just before the shadow is dropped.
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
// Sleeper's fade goes all the way (maintainer): it dims from the edges in to the core over four steps, VANISHES completely for three
// (every cell of it empty, eyes and marks too; only its shadow is left, drawn whole while the figure is gone), then comes back dim and
// fills in from the core out.
// `VANISH[step]`: the share of its depth dimmed (1 = all of it), or 'gone'.
export const VANISH = [0, 0.25, 0.5, 0.75, 1, 'gone', 'gone', 'gone', 1, 0.66, 0.33, 0];
export const fadeMotion = (stage, { vanish = false } = {}) => (sprite, anchors, { time = 0, reduced = false } = {}) => {
  const g = padded(sprite, PAD);
  if (!reduced) {
    const d = depth(sprite);
    const step = stepOf(time);
    if (vanish && VANISH[step] === 'gone') {
      // Gone: nothing of it is left but its shadow, drawn whole (the figure no longer hides any of it).
      sprite.forEach((r, y) => [...r].forEach((c, x) => { g[y][x + PAD] = '.'; }));
      const n = offsetAt(step, REACH[stage]);
      const side = sideAt(time);
      sprite.forEach((r, y) => [...r].forEach((c, x) => { if (c !== '.') g[y][x + PAD + side * n] = ECHO.cell; }));
      return out(g);
    } else {
      const deepest = Math.max(...d.flat().filter(Number.isFinite));
      const rings = vanish ? Math.ceil(VANISH[step] * deepest) : FADE_RINGS[step];
      sprite.forEach((r, y) => [...r].forEach((c, x) => { if (c === '#' && d[y][x] <= rings) g[y][x + PAD] = 'x'; }));
    }
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

// The wipe (an option for Exile, drafts 8.4h; not registered): a second pass of the same camo. A dim row sweeps down from the hood to the
// feet and the body above it opens into the checker holes (the camo goes on behind it), holds in full camo for a step, then a dim column
// sweeps left to right and the body behind it comes back solid. The same cells as the shimmer: plain body cells only, the face rows whole.
// Steps: 0 plain; 1 to 5 the row down; 6 full camo; 7 to 11 the column across.
// The column runs over the body's own columns (`left` to `right`, its first and last plain body cell), so no step is spent beside it.
// `up` (drafts 8.4h, twentieth round): the row runs from the feet to the hood instead, the camo going on below it, so the wipe's first
// sweep no longer moves the way the shimmer's band does when it turns the camo off.
export const wipeAt = (step, height, left, right, { up = false } = {}) => {
  if (step >= 1 && step <= 5) {
    const down = Math.round(1 + ((step - 1) / 4) * (height - 2));
    return { row: up ? height - 1 - down : down };
  }
  if (step === 6) return { full: true };
  if (step >= 7) return { col: Math.round(left + ((step - 7) / 4) * (right - left)) };
  return {};
};
const bodyCols = (sprite) => {
  const xs = sprite.flatMap((r) => [...r].map((c, x) => (c === '#' ? x : -1)).filter((x) => x >= 0));
  return [Math.min(...xs), Math.max(...xs)];
};
export const wipeMotion = (stage, { up = false } = {}) => (sprite, anchors, { time = 0, reduced = false } = {}) => {
  const g = padded(sprite, PAD);
  if (!reduced) {
    const { row, col, full } = wipeAt(stepOf(time), sprite.length, ...bodyCols(sprite), { up });
    for (let y = 0; y < sprite.length; y++) {
      if (faceRow(anchors, y)) continue;
      for (let x = 0; x < sprite[0].length; x++) {
        if (sprite[y][x] !== '#') continue;
        const at = x + PAD;
        if (y === row || x === col) g[y][at] = 'x';
        else if ((full || (row !== undefined && (up ? y > row : y < row)) || (col !== undefined && x > col)) && (at + y) % 2) g[y][at] = '.'; // the shimmer's checker (padded columns), so the camo matches it
      }
    }
  }
  decoyInto(g, sprite, time, reduced, PAD, REACH[stage]);
  return out(g);
};
// The wipe back on (drafts 8.4h, twenty-first round): the wipe loop starts and ends in camo, as the shimmer in its own timing does, so the
// two take turns with no offset. Step 0 full camo; 1 to 5 a dim column sweeps left to right and the body behind it comes back solid; 6
// plain; 7 to 11 it is wiped back on: `back: 'row'` a dim row rising from the feet with the camo below it, `back: 'col'` the column
// returning right to left with the camo behind it.
export const wipeBackAt = (step, height, left, right, back = 'row') => {
  if (step === 0) return { full: true };
  if (step <= 5) return { col: Math.round(left + ((step - 1) / 4) * (right - left)), solidLeft: true };
  if (step === 6) return {};
  const k = (step - 7) / 4;
  return back === 'col' ? { col: Math.round(right - k * (right - left)), camoRight: true } : { row: Math.round(height - 2 - k * (height - 2)), camoBelow: true };
};
export const wipeBackMotion = (stage, { back = 'row' } = {}) => (sprite, anchors, { time = 0, reduced = false } = {}) => {
  const g = padded(sprite, PAD);
  if (!reduced) {
    const { row, col, full, solidLeft, camoRight, camoBelow } = wipeBackAt(stepOf(time), sprite.length, ...bodyCols(sprite), back);
    for (let y = 0; y < sprite.length; y++) {
      if (faceRow(anchors, y)) continue;
      for (let x = 0; x < sprite[0].length; x++) {
        if (sprite[y][x] !== '#') continue;
        const at = x + PAD;
        if (y === row || x === col) g[y][at] = 'x';
        else if ((full || (solidLeft && x > col) || (camoRight && x > col) || (camoBelow && y > row)) && (at + y) % 2) g[y][at] = '.'; // the shimmer's checker (padded columns), so the camo matches it
      }
    }
  }
  decoyInto(g, sprite, time, reduced, PAD, REACH[stage]);
  return out(g);
};
// The shimmer (its own timing) and the wipe back on, taking turns by loop.
export const scanWipeBackMotion = (stage, { back = 'row' } = {}) => {
  const scan = scanMotion(stage);
  const wipe = wipeBackMotion(stage, { back });
  return (sprite, anchors, opts = {}) => (!opts.reduced && Math.floor(Math.max(0, opts.time ?? 0) / (STEPS * STEP_MS)) % 2 ? wipe : scan)(sprite, anchors, opts);
};

// The shimmer and the wipe taking turns by loop (the shimmer first), as the decoy takes turns by side. `joined` starts the shimmer half a
// loop late (its band at the feet, the body plain), so it rises into the camo and comes back down to plain: it then starts and ends where
// the wipe does, and neither hand-over jumps (without it the shimmer ends in camo and the wipe starts plain).
export const scanWipeMotion = (stage, { joined = false, up = false } = {}) => {
  const scan = scanMotion(stage);
  const wipe = wipeMotion(stage, { up });
  const late = joined ? (STEPS / 2) * STEP_MS : 0;
  return (sprite, anchors, opts = {}) => {
    const time = Math.max(0, opts.time ?? 0);
    if (!opts.reduced && Math.floor(time / (STEPS * STEP_MS)) % 2) return wipe(sprite, anchors, opts);
    if (!late || opts.reduced) return scan(sprite, anchors, opts);
    // The shimmer's band runs late on the figure's cells; everywhere else the decoy keeps the real time, so it still changes sides by loop.
    const banded = scan(sprite, anchors, { ...opts, time: time + late });
    const timed = scan(sprite, anchors, opts);
    const onFigure = (x, y) => (sprite[y][x - PAD] ?? '.') !== '.';
    return banded.map((r, y) => [...r].map((c, x) => (onFigure(x, y) ? c : timed[y][x])).join(''));
  };
};

// ---- Tune: Handler's signal and split (drafts 8.4i; registered: both) -----------------------------------------------------------------------------
// Handler runs others now. Two ideas, alone or together, over its still camo:
//   split: the shadow sent out to both sides at once (the alternate kept from the first round, splitMotion): two agents in the field.
//   signal: the headset transmits. From each cup (the outermost dim cell on the eye row) an arc in the body colour travels outward a
//     cell a step, a second one two cells behind it, the arc curving back toward the head at its ends: '(' on the left, ')' on the right.
//     Two pulses a loop (steps 0 to 3 and 6 to 9; 4, 5, 10 and 11 quiet). Drawn on empty cells and over the shadow, never on the figure.
//     Calm: one arc parked a cell out.
export const SIGNAL_REACH = 4;
export const ringsAt = (step) => {
  const k = step % 6;
  return k < SIGNAL_REACH ? [k + 1, k - 1].filter((d) => d >= 1) : [];
};
export const cupsOf = (sprite, anchors) => {
  const row = sprite[anchors.eyeRow];
  return [row.indexOf('x'), row.lastIndexOf('x')];
};
export const signalMotion = (stage, { split = false } = {}) => {
  const base = split ? splitMotion(stage) : decoyMotion(stage);
  return (sprite, anchors, { time = 0, reduced = false } = {}) => {
    const g = base(sprite, anchors, { time, reduced }).map((r) => [...r]);
    const [left, right] = cupsOf(sprite, anchors);
    const e = anchors.eyeRow;
    const onFigure = (x, y) => (sprite[y]?.[x - PAD] ?? '.') !== '.';
    const put = (x, y) => { if (g[y]?.[x] !== undefined && !onFigure(x, y)) g[y][x] = '#'; };
    for (const d of reduced ? [1] : ringsAt(stepOf(time))) {
      for (const [cup, dir] of [[left, -1], [right, 1]]) {
        const x = cup + PAD + dir * d;
        put(x, e); put(x, e + 1);
        if (d >= 2) { put(x - dir, e - 1); put(x - dir, e + 2); }
      }
    }
    return g.map((r) => r.join(''));
  };
};

// ---- Feast: the bigger decoy, and Stash's maw (a draft)------------------------------------------------------------------------------
// The maw: at the copy's own mouth height (the first row from the mouth row down where at least four shadow cells in a row show past the
// body on the decoy's side), a mouth in the shadow. Two styles:
//   half (the current draft, maintainer's ask): a half grin, a smirk: three cells on the row with the outer end curled up a row.
//   grin (the third draft): a line in the eye colour ('o') curving up at both ends, for a menacing look: two cells on
//     the row and a corner one row up at each end ('o..o' over '.oo.'), set one cell in from the shadow's outer edge so the shadow frames
//     it (from the outer edge when the strip is only four wide, as it mostly is on Stash). It takes the first row from the mouth row down
//     where the run and the corners above it show; where none does, the straight line below.
//   line (the second draft): three cells in the eye colour on one row, set one cell in from the outer edge.
//   fangs (the first draft, kept for comparison): the outermost four become a dark opening two cells wide and two rows tall with a bright
//     fang at each top corner ('+..+' over 'x..x'); it needs the row under it to show the same four cells.
// There only while the decoy is out.
function runFrom(drawnRow, side) {
  const sorted = [...drawnRow].sort((p, q) => (side < 0 ? p - q : q - p)); // outermost first
  const run = sorted.length ? [sorted[0]] : [];
  for (let i = 1; i < sorted.length && Math.abs(sorted[i] - run.at(-1)) === 1; i++) run.push(sorted[i]);
  return run;
}
function maw(g, drawn, side, mouthRow, style) {
  const byRow = new Map();
  for (const [x, y] of drawn) byRow.set(y, [...(byRow.get(y) ?? []), x]);
  if (style === 'half') {
    // A half grin (a smirk): three cells on the row and the outer end curled up a row.
    for (let y = mouthRow; y < g.length; y++) {
      const run = runFrom(byRow.get(y) ?? [], side);
      for (const at of [1, 0]) {
        const [b, c, d, e] = run.slice(at, at + 4);
        if (e === undefined || !(new Set(byRow.get(y - 1) ?? []).has(b) || g[y - 1]?.[b] === '.')) continue;
        g[y - 1][b] = 'o';
        g[y][c] = 'o'; g[y][d] = 'o'; g[y][e] = 'o';
        return;
      }
    }
    style = 'line';
  }
  if (style === 'grin') {
    for (let y = mouthRow; y < g.length; y++) {
      const run = runFrom(byRow.get(y) ?? [], side);
      const above = new Set(byRow.get(y - 1) ?? []);
      // Set in by one when the strip is wide enough (five cells), else from the outer edge (four).
      for (const at of [1, 0]) {
        const [b, c, d, e] = run.slice(at, at + 4);
        // A corner sits on a shadow cell or, where the shadow steps (a lopsided body), on the empty cell beside it; never on the body.
        const ok = (x) => above.has(x) || g[y - 1]?.[x] === '.';
        if (e === undefined || !ok(b) || !ok(e)) continue;
        g[y - 1][b] = 'o'; g[y - 1][e] = 'o';
        g[y][c] = 'o'; g[y][d] = 'o';
        return;
      }
    }
    style = 'line';
  }
  for (let y = mouthRow; y < g.length - 1; y++) {
    const run = runFrom(byRow.get(y) ?? [], side);
    if (run.length < 4) continue;
    const [a, b, c, d] = run.slice(0, 4);
    if (style === 'line') {
      for (const x of [b, c, d]) g[y][x] = 'o';
      return;
    }
    const below = new Set(byRow.get(y + 1) ?? []);
    if (![a, b, c, d].every((x) => below.has(x))) continue;
    g[y][a] = '+'; g[y][b] = '.'; g[y][c] = '.'; g[y][d] = '+';
    g[y + 1][b] = '.'; g[y + 1][c] = '.';
    return;
  }
}
export const MAW_STYLES = ['half', 'grin', 'line', 'fangs'];
// The shadow's eyes (an option to make the maw more menacing): where the copy's own eyes fall on cells the shadow shows, they are drawn
// in the eye colour, so the shadow looks back.
function shadowEyes(g, sprite, drawn, side, n, pad) {
  const shown = new Set(drawn.map(([x, y]) => `${x},${y}`));
  sprite.forEach((r, y) => [...r].forEach((c, x) => {
    const tx = x + pad + side * n;
    if (c === 'o' && shown.has(`${tx},${y}`)) g[y][tx] = 'o';
  }));
}
// Options on the maw: `eyes` draws the shadow's eyes too; `late` shows the maw (and eyes) only for the last two steps of the hold, a reveal
// just before the shadow is dropped; `low` starts the maw one row lower, so a curled corner never sits beside the shadow's eye (decided for
// Stash: the half grin, low, with the eyes and the late reveal).
export const bigDecoyMotion = (stage, { withMaw = false, mawStyle = 'half', eyes = false, late = false, low = false } = {}) => (sprite, anchors, { time = 0, reduced = false } = {}) => {
  const g = padded(sprite, BIG_PAD);
  const drawn = decoyInto(g, sprite, time, reduced, BIG_PAD, REACH[stage] + 1);
  const step = stepOf(time);
  const showing = !late || (!reduced && step >= HOLD_UNTIL - 1 && step <= HOLD_UNTIL);
  const side = reduced ? 1 : sideAt(time);
  if (withMaw && showing) maw(g, drawn, side, anchors.mouthRow + (low ? 1 : 0), mawStyle);
  if (withMaw && eyes && showing) shadowEyes(g, sprite, drawn, side, reduced ? 1 : offsetAt(step, REACH[stage] + 1), BIG_PAD);
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

// While Sleeper is gone, its wearables hide too (decided): the renderer asks the form's `hideWorn` before drawing what it wears.
export const vanishedAt = ({ time = 0, reduced = false } = {}) => !reduced && VANISH[stepOf(time)] === 'gone';
export const HIDE_WORN_OF = { moleElder: vanishedAt };

// Which layer each form carries, by its old authoring key (rogue-models.js registers it as `motion`).
export const MOTION_OF = {
  baby: decoyMotion('baby'),
  teen: sweepHintMotion('teen'),
  mole: fadeMotion('adult'), moleElder: fadeMotion('elder', { vanish: true }),
  skip: scanMotion('adult'), skipElder: scanWipeBackMotion('elder', { back: 'col' }),
  spook: decoyMotion('adult'), spookElder: signalMotion('elder', { split: true }),
  drop: bigDecoyMotion('adult'), dropElder: bigDecoyMotion('elder', { withMaw: true, eyes: true, late: true, low: true }),
};
