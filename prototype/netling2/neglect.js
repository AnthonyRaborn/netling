// The neglected look (docs/NETLING_2_SKETCH.md, Evolution: neglect and bugs on the sprite; docs/NETLING_2_SPRITES.md, Layers): a reversible state tied to needs left unmet (the level
// comes from needs.js; bugs have their own persistent look in glitch.js), readable at a glance, on a different channel from temper (temper is motion; neglect is marks and color, and it does not move).
// Iron's skin is rust: dim 'x' patches spread over the body from the bottom up, never over the eyes and never changing the
// outline, so the anchors, the poses and the wearables are unaffected. Level 0 is untouched, 1 is worn, 2 is neglected.
// One skin for all three eggs (maintainer: keep the rules consistent across eggs); the rules differ by stage, not by egg.
// Small forms (baby 12 wide, teens 14) have too few cells below the mouth for a readable effect, so they rust from the first
// row under the eyes and take a larger share; adults and elders are as before. A form whose body is already about half 'x'
// (Program's Shell, Wetware's Blank and Cipher) would hide a dim patch, so there the patches go the other way: dim cells
// brighten to '#'. Either way the same cells flip at level 1 and 2 on every form, and the outline never changes.
//
// A pure function of (sprite, anchors, level, seed): the same patches every time, and level 2's patches include level 1's, so
// the look grows and clears without jumping around. There is no motion, so reduced motion needs no variant.

export const NEGLECT_LEVELS = [0, 1, 2];
// Share of the eligible cells (an exact count), by stage (told by the sprite's width: baby 12, teen 14, adult 16, elder 18).
const SHARE = { 0: 0, 1: 0.12, 2: 0.3 };
const SMALL_SHARE = { 0: 0, 1: 0.2, 2: 0.4 };
export const SMALL_WIDTH = 14;
export const MOSTLY_DIM = 0.4; // 'x' share of the body marks at which patches flip dim to bright instead

const hash = (x, y, seed) => {
  let h = Math.imul((x * 73856093) ^ (y * 19349663) ^ (seed * 83492791), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// Eligible cells: body marks from the mouth row down (small forms: from the row under the eyes). Rust gathers low, as it does
// on a machine left standing.
export function neglected(sprite, anchors, level, seed = 0) {
  const small = sprite[0].length <= SMALL_WIDTH;
  const share = (small ? SMALL_SHARE : SHARE)[level] ?? 0;
  if (!share) return sprite;
  const start = small ? anchors.eyeRow + 2 : anchors.mouthRow + 1;
  const marks = sprite.join('');
  const dim = marks.split('x').length - 1;
  const bright = marks.split('#').length - 1;
  const flip = dim / Math.max(1, dim + bright) >= MOSTLY_DIM;
  const [from, to] = flip ? ['x', '#'] : ['#', 'x'];
  // Rank the eligible cells (lower rows first, then by the hash) and flip the first share of them, so the count is exact and
  // level 1's cells are the first of level 2's.
  const cells = [];
  sprite.forEach((row, y) => {
    if (y < start) return;
    const depth = (y - start) / Math.max(1, sprite.length - 1 - start);
    [...row].forEach((ch, x) => ch === from && cells.push({ x, y, rank: hash(x, y, seed) / (0.5 + depth) }));
  });
  cells.sort((p, q) => p.rank - q.rank || p.y - q.y || p.x - q.x);
  const flipped = new Set(cells.slice(0, Math.max(1, Math.round(cells.length * share))).map((c) => `${c.x},${c.y}`));
  return sprite.map((row, y) => [...row].map((ch, x) => (flipped.has(`${x},${y}`) ? to : ch)).join(''));
}
