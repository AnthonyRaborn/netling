// Options for the Rogue drafts' review (docs/NETLING_2_ROGUE_DRAFTS.md, 8.4b), drawn over the registered forms, which stay unchanged until
// the maintainer picks: the shut third eye in four ways, and the thermocamo (Blank's shimmer) as hints on the baby and teen and in full on
// the Dodge line, body only or head and body. Pure functions of the rows; nothing here is registered.
//
// Third eye (the first draft's dim pair read as a slit in the head):
//   pair   the first draft: two dim cells above and between the eyes.
//   four   four dim cells where the head has room (two where it does not).
//   slit   a closed eye drawn as the game draws a sleeping one: a row of accent cells (the 1.0 asleep slit), two wide.
//   arc    a closed eye as a downward arc in dim cells, four wide and two tall ('x..x' over '.xx.', the usual pixel shorthand for a
//          shut eye), where the head has two body rows above the eyes; else the four-cell line.
// Thermocamo: on body cells only, alternate dim and bright on a checker whose phase swaps between frames (A phase 0, B phase 1), as Blank's
// does. Eyes, the tag, the third eye and the outline are never touched.
const eyeCols = (rows, eyeRow) => [...rows[eyeRow]].map((c, x) => (c === 'o' ? x : -1)).filter((x) => x >= 0);

// The first draft's third eye cells: dim cells on the row above the eyes, between the inner eye columns.
function clearThirdEye(rows, anchors) {
  const g = rows.map((r) => [...r]);
  const e = eyeCols(rows, anchors.eyeRow);
  const y = anchors.eyeRow - 1;
  for (let x = e[1] + 1; x < e[2]; x++) if (g[y][x] === 'x') g[y][x] = '#';
  return g;
}
const isBody = (g, x, y) => g[y]?.[x] === '#';
function stamp(g, cells, ch) {
  if (!cells.every(([x, y]) => isBody(g, x, y))) return false;
  for (const [x, y] of cells) g[y][x] = ch;
  return true;
}

export const THIRD_EYES = ['pair', 'four', 'slit', 'arc'];
export function thirdEye(rows, anchors, kind) {
  if (kind === 'pair') return rows;
  const g = clearThirdEye(rows, anchors);
  const e = eyeCols(rows, anchors.eyeRow);
  const mid = (e[1] + e[2]) / 2; // between the inner eye cells; a half when the gap is even
  const y = anchors.eyeRow - 1;
  const line = (w, row) => Array.from({ length: w }, (_, i) => [Math.round(mid - (w - 1) / 2 + i), row]);
  const pair = line(2, y);
  if (kind === 'four') stamp(g, line(4, y), 'x') || stamp(g, pair, 'x');
  if (kind === 'slit') stamp(g, pair, 'o');
  if (kind === 'arc') {
    const [l, r] = [Math.round(mid - 1.5), Math.round(mid + 1.5)];
    const arc = [[l, y - 1], [r, y - 1], [l + 1, y], [r - 1, y]];
    stamp(g, arc, 'x') || stamp(g, line(4, y), 'x') || stamp(g, pair, 'x');
  }
  return g.map((r) => r.join(''));
}

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
