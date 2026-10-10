// Options for the Rogue drafts' review (docs/NETLING_2_ROGUE_DRAFTS.md, 8.4b and 8.4c), drawn over the registered forms, which stay unchanged
// until the maintainer picks. Pure functions of the rows; nothing here is registered.
//
// Third eye: decided, the arc (8.4b), now drawn in rogue-art.js; the other three options (pair, four, slit) are in the git history of this
// file and on docs/netling2-prototypes/shots/rogue-options.png.
// Thermocamo (Blank's shimmer): on body cells only, alternate dim and bright on a checker whose phase swaps between frames (A phase 0,
// B phase 1), as Blank's does. Eyes, the tag, the third eye and the outline are never touched. First guess (maintainer): hints on the
// baby and teen, the Dodge line in it entirely; Spook (and so Handler) to be seen with it too, for a Ghost and Blank look.
// The thermocamo over body cells from row `from` to row `to` (inclusive), checker phase `phase`. `keep` lists cells never touched (the tag).
export function camo(rows, { from, to, phase = 0, keep = [] }) {
  const skip = new Set(keep.map(([x, y]) => `${x},${y}`));
  return rows.map((r, y) => (y < from || y > to ? r : [...r].map((c, x) => (c === '#' && !skip.has(`${x},${y}`) && (x + y + phase) % 2 === 0 ? 'x' : c)).join('')));
}
// The placements to compare. Each returns { a, b } for a form (its registered rows, anchors and tag).
export const CAMO_OPTIONS = {
  hint: { name: 'hint: one band on the cloak', make: (f, tag) => {
    const y = f.anchors.a.neckRow + 1;
    return { a: camo(f.a, { from: y, to: y, phase: 0, keep: tag }), b: camo(f.b, { from: y, to: y, phase: 1, keep: tag }) };
  } },
  body: { name: 'full, body only (below the neck)', make: (f, tag) => ({
    a: camo(f.a, { from: f.anchors.a.neckRow + 1, to: f.a.length - 1, phase: 0, keep: tag }),
    b: camo(f.b, { from: f.anchors.a.neckRow + 1, to: f.b.length - 1, phase: 1, keep: tag }),
  }) },
  whole: { name: 'full, head and body (as Blank: the head rows then differ between frames)', make: (f, tag) => {
    // The head is camouflaged below the hood's top two rows and around the face (the eye rows and the third eye are left alone).
    const e = f.anchors.a.eyeRow;
    const head = (rows, phase) => camo(rows, { from: 2, to: f.anchors.a.neckRow, phase, keep: [...tag, ...rowCells(rows, e - 1), ...rowCells(rows, e), ...rowCells(rows, e + 1)] });
    return {
      a: camo(head(f.a, 0), { from: f.anchors.a.neckRow + 1, to: f.a.length - 1, phase: 0, keep: tag }),
      b: camo(head(f.b, 1), { from: f.anchors.a.neckRow + 1, to: f.b.length - 1, phase: 1, keep: tag }),
    };
  } },
};
const rowCells = (rows, y) => [...rows[y]].map((_, x) => [x, y]);

// Static camo (the Tune line, second round): the same checker in both frames, so nothing shimmers and the head rows stay identical
// between frames even when the hood is covered (no frame-rule exception needed).
export const STATIC_CAMO_OPTIONS = {
  body: { name: 'static, body only', make: (f, tag) => ({
    a: camo(f.a, { from: f.anchors.a.neckRow + 1, to: f.a.length - 1, phase: 0, keep: tag }),
    b: camo(f.b, { from: f.anchors.a.neckRow + 1, to: f.b.length - 1, phase: 0, keep: tag }),
  }) },
  whole: { name: 'static, head and body', make: (f, tag) => {
    const e = f.anchors.a.eyeRow;
    const keep = [...tag, ...rowCells(f.a, e - 2), ...rowCells(f.a, e - 1), ...rowCells(f.a, e), ...rowCells(f.a, e + 1)];
    return { a: camo(f.a, { from: 2, to: f.a.length - 1, phase: 0, keep }), b: camo(f.b, { from: 2, to: f.b.length - 1, phase: 0, keep }) };
  } },
};

// Cipher's shimmer for the Dodge line (second round): Cipher's camouflage activation (blank-motion.js) on Rogue's body. A scan band sweeps
// from the hood's top to the feet and back in 12 steps of 400 ms; above it the body is solid, on it a dim row, below it plain body cells
// are see-through checker holes (the outline changes, as on Cipher). Unlike Cipher's layer it never touches Rogue's marks (the arc, the
// tag, the eyes: only '#' cells change) and keeps the face rows whole (the arc's rows to the row under the eyes). The decoy is drawn as
// on every form, only where the original figure is empty, so it does not fill the holes. Reduced motion: no band (the body as drawn), the
// decoy parked. A motion layer: it returns padded rows like rogue-motion.js.
import { STEPS, STEP_MS, PAD, REACH, offsetAt, sideAt } from './rogue-motion.js';
import { dub } from './echo-motion.js';
export const bandAt = (step, height) => {
  const t = step <= STEPS / 2 ? step / (STEPS / 2) : (STEPS - step) / (STEPS / 2);
  return Math.round(1 + t * (height - 2));
};
export function cipherScan(stage) {
  return (sprite, anchors, { time = 0, reduced = false } = {}) => {
    const src = sprite.map((r) => [...('.'.repeat(PAD) + r + '.'.repeat(PAD))]);
    const g = src.map((r) => r.slice());
    const step = Math.floor(Math.max(0, time) / STEP_MS) % STEPS;
    if (!reduced) {
      const band = bandAt(step, sprite.length);
      const face = (y) => y >= anchors.eyeRow - 2 && y <= anchors.eyeRow + 1;
      for (let y = 0; y < g.length; y++) {
        if (face(y)) continue;
        for (let x = 0; x < g[0].length; x++) {
          if (g[y][x] !== '#') continue;
          if (y === band) g[y][x] = 'x';
          else if (y > band && (x + y) % 2) g[y][x] = '.';
        }
      }
    }
    const n = reduced ? 1 : offsetAt(step, REACH[stage]);
    const side = reduced ? 1 : sideAt(time);
    if (n) {
      const shadow = src.map((r) => r.map(() => '.'));
      dub(shadow, src, side * n, 0);
      for (let y = 0; y < g.length; y++) for (let x = 0; x < g[0].length; x++) if (src[y][x] === '.' && shadow[y][x] === 'x') g[y][x] = 'x';
    }
    return g.map((r) => r.join(''));
  };
}

// ---- third round (maintainer, 2026-10-10): each older line its own effect --------------------------------------------------------------
// Breach (Mole, Sleeper): a FADE, two looks to compare. Feast (Drop, Stash): a BIGGER, more obvious decoy. Alias: a bigger hint and a hint
// of the Dodge line's sweep. All motion layers in the echo frame (12 steps of 400 ms, padded rows, calm = still); none touches the eyes,
// the arc or the tag, only plain body cells.
const FADE_RINGS = [0, 1, 2, 3, 3, 3, 3, 3, 2, 1, 0, 0]; // edge fade: rings dimmed at each step (in, hold, back)
const PULSE = [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0]; // whole-body pulse: dim or not at each step
// Distance of each painted cell from the outside (1 = an outline cell), by 4-neighbour steps.
function depth(rows) {
  const h = rows.length;
  const w = rows[0].length;
  const d = rows.map((r) => [...r].map((c) => (c === '.' ? 0 : Infinity)));
  for (let pass = 0; pass < w + h; pass++) {
    let changed = false;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!d[y][x]) continue;
      const n = Math.min(d[y - 1]?.[x] ?? 0, d[y + 1]?.[x] ?? 0, d[y][x - 1] ?? 0, d[y][x + 1] ?? 0) + 1;
      if (n < d[y][x]) { d[y][x] = n; changed = true; }
    }
    if (!changed) break;
  }
  return d;
}
const stepOfTime = (time) => Math.floor(Math.max(0, time) / STEP_MS) % STEPS;
// The decoy as on every form, drawn only where the original figure is empty, into padded rows `g` (padding `pad`).
function decoyInto(g, sprite, stage, time, reduced, pad, { reach = REACH[stage], cell = 'x', checker = false } = {}) {
  const src = sprite.map((r) => [...('.'.repeat(pad) + r + '.'.repeat(pad))]);
  const n = reduced ? 1 : offsetAt(stepOfTime(time), reach);
  const side = reduced ? 1 : sideAt(time);
  if (!n) return;
  for (let y = 0; y < src.length; y++) for (let x = 0; x < src[0].length; x++) {
    const from = src[y][x - side * n];
    if (src[y][x] === '.' && from && from !== '.' && (!checker || (x + y) % 2 === 0)) g[y][x] = cell;
  }
}
const padded = (sprite, pad) => sprite.map((r) => [...('.'.repeat(pad) + r + '.'.repeat(pad))]);

export function fadeEdges(stage) {
  return (sprite, anchors, { time = 0, reduced = false } = {}) => {
    const g = padded(sprite, PAD);
    if (!reduced) {
      const rings = FADE_RINGS[stepOfTime(time)];
      const d = depth(sprite);
      sprite.forEach((r, y) => [...r].forEach((c, x) => { if (c === '#' && d[y][x] <= rings) g[y][x + PAD] = 'x'; }));
    }
    decoyInto(g, sprite, stage, time, reduced, PAD);
    return g.map((r) => r.join(''));
  };
}
export function fadePulse(stage) {
  return (sprite, anchors, { time = 0, reduced = false } = {}) => {
    const g = padded(sprite, PAD);
    if (!reduced && PULSE[stepOfTime(time)]) sprite.forEach((r, y) => [...r].forEach((c, x) => { if (c === '#') g[y][x + PAD] = 'x'; }));
    decoyInto(g, sprite, stage, time, reduced, PAD);
    return g.map((r) => r.join(''));
  };
}
// The Feast line's bigger decoy: one cell further than the stage's reach (Drop 3, Stash 4), dim and solid, or bright and sparse.
export const BIG_PAD = 4;
export const bigDecoy = (stage, bright = false) => (sprite, anchors, { time = 0, reduced = false } = {}) => {
  const g = padded(sprite, BIG_PAD);
  decoyInto(g, sprite, stage, time, reduced, BIG_PAD, { reach: REACH[stage] + 1, cell: bright ? '#' : 'x', checker: bright });
  return g.map((r) => r.join(''));
};
// Alias, a bigger hint: two camo bands on the cloak (swapping phase with the frame, as the first hint), and a hint of the sweep: a dim band
// that runs down the body below the neck and back, with no holes. The frames are camoed by `aliasHint`; the sweep is a motion layer.
export const aliasHint = (f, tag) => {
  const y = f.anchors.a.neckRow + 1;
  return { a: camo(f.a, { from: y, to: y + 1, phase: 0, keep: tag }), b: camo(f.b, { from: y, to: y + 1, phase: 1, keep: tag }) };
};
export function aliasSweep(stage) {
  return (sprite, anchors, { time = 0, reduced = false } = {}) => {
    const g = padded(sprite, PAD);
    if (!reduced) {
      const top = anchors.neckRow + 1;
      const span = sprite.length - top;
      const s = stepOfTime(time);
      const t = s <= STEPS / 2 ? s / (STEPS / 2) : (STEPS - s) / (STEPS / 2);
      const band = top + Math.round(t * (span - 1));
      [...sprite[band]].forEach((c, x) => { if (c === '#') g[band][x + PAD] = 'x'; });
    }
    decoyInto(g, sprite, stage, time, reduced, PAD);
    return g.map((r) => r.join(''));
  };
}
