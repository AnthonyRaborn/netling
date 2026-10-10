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
