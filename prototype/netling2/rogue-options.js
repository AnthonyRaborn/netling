// Options for the Rogue drafts' review (docs/NETLING_2_ROGUE_DRAFTS.md, 8.4b to 8.4f): the camo helpers that drew the decided camo into
// rogue-art.js, and the alternatives not chosen, for the record and the options page. Pure functions of the rows; nothing here is registered.
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

// The layers chosen from these options now live in rogue-motion.js and are registered on the forms (scanMotion, fadeMotion,
// bigDecoyMotion, sweepHintMotion). The options page (rogue-options.html) still draws the alternatives that were not chosen, kept here for
// the record: the whole-body fade pulse (Breach; edges was chosen) and the bright decoy (Feast; dim was chosen).
import { STEPS, STEP_MS, PAD, BIG_PAD, REACH, offsetAt, sideAt, scanMotion, fadeMotion, bigDecoyMotion, sweepHintMotion, bandAt } from './rogue-motion.js';
export { bandAt, BIG_PAD };
export const cipherScan = scanMotion;
export const fadeEdges = fadeMotion;
export const aliasSweep = sweepHintMotion;
const stepOfTime = (time) => Math.floor(Math.max(0, time) / STEP_MS) % STEPS;
const padded = (sprite, pad) => sprite.map((r) => [...('.'.repeat(pad) + r + '.'.repeat(pad))]);
function decoyInto(g, sprite, stage, time, reduced, pad, { reach = REACH[stage], cell = 'x', checker = false } = {}) {
  const src = padded(sprite, pad);
  const n = reduced ? 1 : offsetAt(stepOfTime(time), reach);
  const side = reduced ? 1 : sideAt(time);
  if (!n) return;
  for (let y = 0; y < src.length; y++) for (let x = 0; x < src[0].length; x++) {
    const from = src[y][x - side * n];
    if (src[y][x] === '.' && from && from !== '.' && (!checker || (x + y) % 2 === 0)) g[y][x] = cell;
  }
}
const PULSE = [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0]; // whole-body pulse: dim or not at each step
export function fadePulse(stage) {
  return (sprite, anchors, { time = 0, reduced = false } = {}) => {
    const g = padded(sprite, PAD);
    if (!reduced && PULSE[stepOfTime(time)]) sprite.forEach((r, y) => [...r].forEach((c, x) => { if (c === '#') g[y][x + PAD] = 'x'; }));
    decoyInto(g, sprite, stage, time, reduced, PAD);
    return g.map((r) => r.join(''));
  };
}
// The Feast decoy, dim (chosen: rogue-motion.js) or bright (the body colour on a checker; not chosen).
export const bigDecoy = (stage, bright = false) => (bright
  ? (sprite, anchors, { time = 0, reduced = false } = {}) => {
    const g = padded(sprite, BIG_PAD);
    decoyInto(g, sprite, stage, time, reduced, BIG_PAD, { reach: REACH[stage] + 1, cell: '#', checker: true });
    return g.map((r) => r.join(''));
  }
  : bigDecoyMotion(stage));
// Alias, the bigger hint (chosen, drawn into its frames): two camo bands on the cloak, swapping phase with the frame.
export const aliasHint = (f, tag) => {
  const y = f.anchors.a.neckRow + 1;
  return { a: camo(f.a, { from: y, to: y + 1, phase: 0, keep: tag }), b: camo(f.b, { from: y, to: y + 1, phase: 1, keep: tag }) };
};

// Exile, the redraw (drafts 8.4g; maintainer: Skip stays, Exile is too close to Skip and needs its own idea). Three options, each 18 by 15
// with Skip's head, lean and legs so it still reads as Skip's elder, the registered anchors and a three-cell tag (ROGUE_ELDER_ANCHORS and
// ROGUE_TAGS skipElder, unchanged). Chosen (maintainer): the cape, now registered as Exile in rogue-art.js; pack and bindle kept for the
// record.
//   pack:   the brief's bundle, a pack high on its back with a strap, the swept hood laid over it.
//   cape:   the hood tail grown into a long torn cape trailing behind, its tatters swapping with the frame.
//   bindle: a stick over the shoulder with a bundle on the end, where the hood tail was: everything it owns, carried.
const LEGS = {
  a: ['.....#.##.##.##...', '......#......#....', '......#......#....', '.....##......##...'],
  b: ['....#.##.##.##....', '.....#.......#....', '....#.........#...', '...##.........##..'],
};
const exile = (name, head, bodyA, bodyB = bodyA) => ({ name, a: [...head, ...bodyA, ...LEGS.a], b: [...head, ...bodyB, ...LEGS.b] });
export const EXILE_OPTIONS = {
  pack: exile('pack', [
    '.......#..#.......',
    '.......#####......',
    '......#x##x##.....',
    '.....###xx#####...',
    '.....#oo##oo######',
    '.....#oo##oo##x###',
    '.....#########x###',
    '......########x##.',
  ], [
    '.....#########.##.',
    '.....#xxx#####....',
    '.....#########....',
  ]),
  cape: exile('cape', [
    '.......#..#.......',
    '.......#####......',
    '......#x##x###....',
    '.....###xx#####...',
    '.....#oo##oo######',
    '.....#oo##oo##.###',
    '.....#########.###',
    '......########.###',
  ], [
    '.....#########.##.',
    '.....#xxx#####.#.#',
    '.....#########..#.',
  ], [
    '.....#########.##.',
    '.....#xxx#####..##',
    '.....#########.#..',
  ]),
  bindle: exile('bindle', [
    '.......#..#.......',
    '.......#####......',
    '......#x##x##.....',
    '.....###xx####..x.',
    '.....#oo##oo##.###',
    '.....#oo##oo######',
    '.....#########.###',
    '......########.##.',
  ], [
    '.....#########....',
    '.....#xxx#####....',
    '.....#########....',
  ]),
};
