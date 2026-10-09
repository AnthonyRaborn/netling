// Wear and strain seams (docs/NETLING_2_CARE_DRAFTS.md, Iron wear; and Overuse and owner strain: the same mark on every egg): a small static seam on one edge of the sprite once wear passes the line,
// a second at heavy wear, and they go one at a time as wear fades. DRAFT for review, not decided art. Not shipped.
//
// A seam is a split in the casing: the outline cell is cut out ('.') and the body cell diagonally inward goes dim ('x'). Rust (neglect.js)
// only dims cells and never removes one, so the two do not read alike. Seams do not move: they carry no flash risk and need no calm version.
//
// Placement: seam 1 on the right edge of the torso (the first row below the neck, else below the mouth), seam 2 on the left edge of the
// head (the rows between the head top and the eyes, else the torso); the outer edge beside the eyes is the last resort. A row qualifies only if A and B agree on it (the seam must not
// jump between frames), the edge cell and its inward diagonal are plain body ('#', never an eye, mouth, highlight or mark), and the edge
// cell has body beside it (not a lone arm or horn pixel) and above and below it (a notch in a wall, not a rounded corner). OVERRIDES pins a placement by hand where the rule picks badly.
//
// seams(rows, cells) -> rows with those cells applied; SEAMS[id] = [seam1, seam2], each { cut: [x, y], dim: [x, y] }.

// Strain marks use the seam on every egg (maintainer, 2026-10-09: Iron's wear, Program's and Wetware's strain alike). Wired and its elder Plat have
// no straight wall the rule accepts (a rounded head and torso, arms held apart), so they are pinned here: seam 1 on the right shoulder, seam 2
// on the left of the head. The hidden forms the rule misses (Program's Shell, Wetware's Blank and Cipher) are left without seams (maintainer:
// hidden forms may break the rules).
export const OVERRIDES = {
  wetwareAdultDodgeCorp: [{ cut: [13, 9], dim: [12, 10] }, { cut: [2, 3], dim: [3, 2] }],
  wetwareElderDodgeCorp: [{ cut: [16, 9], dim: [15, 10] }, { cut: [2, 3], dim: [3, 2] }],
};

const plain = (rows, x, y) => rows[y]?.[x] === '#';

function edgeSeam(a, b, rowsToTry, side) {
  for (const y of rowsToTry) {
    if (a[y] !== b[y]) continue;
    const row = a[y];
    const x = side === 'right' ? row.lastIndexOf('#') : row.indexOf('#');
    if (x < 0) continue;
    const painted = [...row].map((c, i) => (c !== '.' ? i : -1)).filter((i) => i >= 0);
    if (x !== (side === 'right' ? painted.at(-1) : painted[0])) continue; // the true edge, not an inner body cell behind an accent
    const step = side === 'right' ? -1 : 1;
    if (!plain(a, x + step, y)) continue; // body beside it: not a lone arm or horn pixel
    if (a[y - 1]?.[x] === '.' || a[y + 1]?.[x] === '.' || a[y - 1]?.[x] === undefined) continue; // a notch in a straight wall, not a corner
    // The inward diagonal goes dim: the one below, else the one above (when the one below is an eye or a mark).
    const dy = plain(a, x + step, y + 1) && a[y + 1] === b[y + 1] ? 1 : plain(a, x + step, y - 1) && a[y - 1] === b[y - 1] ? -1 : 0;
    if (!dy) continue;
    return { cut: [x, y], dim: [x + step, y + dy] };
  }
  return null;
}

const range = (from, to) => Array.from({ length: Math.max(0, to - from) }, (_, i) => from + i);

export function placeSeams(form) {
  if (OVERRIDES[form.id]) return OVERRIDES[form.id];
  const { a, b } = form;
  const an = form.anchors.a;
  const bottom = a.length - 2;
  const torso = [...range(an.neckRow + 1, bottom), ...range(an.mouthRow + 1, an.neckRow + 1)];
  const head = range(an.headTop + 1, an.eyeRow);
  const face = range(an.eyeRow, an.mouthRow + 1); // last resort: the outer edge beside the eyes (Thrash's spikes and hem leave no wall)
  const first = edgeSeam(a, b, torso, 'right') ?? edgeSeam(a, b, head, 'right') ?? edgeSeam(a, b, face, 'right');
  const second = edgeSeam(a, b, head, 'left') ?? edgeSeam(a, b, torso, 'left') ?? edgeSeam(a, b, face, 'left');
  return [first, second];
}

// Cells for a wear level: 0 none, 1 the first seam, 2 both.
export const seamCells = (placed, level) => placed.slice(0, Math.max(0, Math.min(2, level))).filter(Boolean);

export function seams(rows, cells) {
  const g = rows.map((r) => [...r]);
  for (const { cut, dim } of cells) {
    if (g[cut[1]]?.[cut[0]] === '#') g[cut[1]][cut[0]] = '.';
    if (g[dim[1]]?.[dim[0]] === '#') g[dim[1]][dim[0]] = 'x';
  }
  return g.map((r) => r.join(''));
}
