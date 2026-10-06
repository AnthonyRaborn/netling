// The neglected look (docs/NETLING_2_SKETCH.md, Neglect and the sprites): a reversible state tied to needs left unmet (the level
// comes from needs.js; bugs have their own persistent look in glitch.js), readable at a glance, on a different channel from temper (temper is motion; neglect is marks and color, and it does not move).
// Iron's skin is rust: dim 'x' patches spread over the body from the bottom up, never over the eyes and never changing the
// outline, so the anchors, the poses and the wearables are unaffected. Level 0 is untouched, 1 is worn, 2 is neglected.
// Program and Wetware would get their own skin (corruption, pallor); only Iron is drawn here.
//
// A pure function of (sprite, anchors, level, seed): the same patches every time, and level 2's patches include level 1's, so
// the look grows and clears without jumping around. There is no motion, so reduced motion needs no variant.

export const NEGLECT_LEVELS = [0, 1, 2];
const SHARE = { 0: 0, 1: 0.12, 2: 0.3 }; // of the eligible body cells

const hash = (x, y, seed) => {
  let h = Math.imul((x * 73856093) ^ (y * 19349663) ^ (seed * 83492791), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// Eligible cells: body marks ('#') from the mouth row down. Rust gathers low, as it does on a machine left standing.
export function neglected(sprite, anchors, level, seed = 0) {
  const share = SHARE[level] ?? 0;
  if (!share) return sprite;
  return sprite.map((row, y) =>
    y <= anchors.mouthRow
      ? row
      : [...row].map((ch, x) => {
          if (ch !== '#') return ch;
          // Lower rows rust first: the threshold falls as y grows.
          const depth = (y - anchors.mouthRow) / Math.max(1, sprite.length - 1 - anchors.mouthRow);
          return hash(x, y, seed) < share * (0.5 + depth) ? 'x' : ch;
        }).join(''),
  );
}
