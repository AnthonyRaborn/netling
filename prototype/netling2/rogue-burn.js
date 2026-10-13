// The self-destruct: how a Rogue dies at the third mark (docs/archive/netling2/ROGUE_DRAFTS.md, 10.6 and 11.1). The hunters do not get it: it
// burns itself into nothingness an instant before capture. Decided (maintainer, 2026-10-12): all three burns are used, one picked at random
// when it hits (`pickBurn`, seeded so a reload during the burn keeps the same one), and what is left is the ash heap (registered on every
// form as `captured`, rogue-models.js). The rule is unchanged (the cause stays `captured`); this is art only.
//
// A burn is a one-shot sequence, not a loop: a pure function of (sprite, tag, time since the third mark) in steps of 400 ms (the motion
// layers' step, twice FLASH_TOGGLE_MS). Every painted cell goes the same way exactly once: body -> FRONT (the burning edge, the highlight
// colour) -> ASH (dim) -> what is left there (the capture pose's cell, usually empty). Each state holds at least one whole step and no cell
// ever goes back, so nothing toggles, let alone faster than three times a second (project rule 7; tested). The front is one ring of
// cells, never a filled area.
//   A. FROM THE TAG: it lights where the asset tag was scraped off, the last trace of whose it was, and burns outward from
//      there through the body (4-neighbour distance from the tag). The burn bag's last item is itself.
//   B. FROM THE FEET UP: a burning line rises row by row from the hem to the hood, ash beneath it, like a page held to a flame.
//   C. EMBERS: cells catch in a scattered order (seeded per form, fixed), so it crumbles from everywhere at once.
// Each takes the same time on every form (BURN_RINGS steps of front, then the last front's ash and clear): 10 steps, 4 s.
// Calm (reduced motion): no burn; the capture pose is shown at once, as 1.0 shows its dead pose.
//
// What is left (the capture dead pose, drawn in the dead colours like every dead pose):
//   ASH (decided): a low heap of ash on the floor where it stood, its footprint's width. "it left them nothing" but a heap.
// Not used, kept for the record and the review page:
//   SCORCH: its outline only, dim, a burn mark where it stood. The form still reads, so the death screen shows who it was.
//   NOTHING: no cell at all. The most literal; the death screen shows an empty spot.
import { FLASH_TOGGLE_MS } from '../../src/games/common.js';

export const BURN_STEP_MS = FLASH_TOGGLE_MS * 2; // 400 ms, as every motion layer
export const BURN_RINGS = 8; // steps over which the front crosses the whole figure
export const BURN_STEPS = BURN_RINGS + 2; // the last front still turns to ash and then clears
export const BURN = { front: '+', ash: 'x' }; // the knob: the front could take another colour key (1.0's overclock orange is taken)

const painted = (c) => c !== '.' && c !== undefined;
const cellsOf = (rows) => rows.flatMap((r, y) => [...r].map((c, x) => [x, y, c])).filter(([, , c]) => painted(c));

// 4-neighbour distance through painted cells from the seed cells; cells not reached (a part cut off from the seed) take the nearest reached
// cell's distance plus one, by straight-line distance.
function distanceFrom(rows, seeds) {
  const d = rows.map((r) => [...r].map(() => Infinity));
  const queue = [];
  for (const [x, y] of seeds) if (painted(rows[y]?.[x])) { d[y][x] = 0; queue.push([x, y]); }
  for (let i = 0; i < queue.length; i++) {
    const [x, y] = queue[i];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (painted(rows[ny]?.[nx]) && d[ny][nx] === Infinity) { d[ny][nx] = d[y][x] + 1; queue.push([nx, ny]); }
    }
  }
  const reached = queue.map(([x, y]) => [x, y, d[y][x]]);
  for (const [x, y] of cellsOf(rows)) {
    if (d[y][x] !== Infinity) continue;
    let best = Infinity;
    for (const [rx, ry, rd] of reached) best = Math.min(best, rd + Math.hypot(rx - x, ry - y));
    d[y][x] = Math.ceil(best);
  }
  return d;
}

// A small fixed generator (mulberry32), so the embers fall the same way every time for a form.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const seedOf = (rows) => rows.join('').split('').reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7);

// The step (0 to BURN_RINGS - 1) at which each painted cell catches, by option. -> rows of numbers (Infinity on empty cells).
export function catchSteps(sprite, tag, option) {
  const h = sprite.length;
  let order;
  if (option === 'tag') order = distanceFrom(sprite, tag);
  else if (option === 'feet') order = sprite.map((r, y) => [...r].map((c) => (painted(c) ? h - 1 - y : Infinity)));
  else if (option === 'embers') {
    const next = rng(seedOf(sprite));
    order = sprite.map((r) => [...r].map((c) => (painted(c) ? next() : Infinity)));
  } else throw new Error(`unknown burn: ${option}`);
  const top = Math.max(...order.flat().filter(Number.isFinite));
  // Spread the figure's own range over BURN_RINGS steps, so every form burns in the same time.
  return order.map((r) => r.map((v) => (Number.isFinite(v) ? Math.min(BURN_RINGS - 1, Math.floor((v / (top || 1)) * BURN_RINGS * 0.9999)) : Infinity)));
}

// What is left: the capture dead pose for `sprite` (the form's A frame), by option. Same size as the sprite, as every pose.
export function leftOf(sprite, option) {
  const h = sprite.length, w = sprite[0].length;
  const g = sprite.map(() => Array(w).fill('.'));
  if (option === 'nothing') return g.map((r) => r.join(''));
  if (option === 'scorch') {
    for (const [x, y] of cellsOf(sprite)) {
      const edge = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !painted(sprite[y + dy]?.[x + dx]));
      if (edge) g[y][x] = 'x';
    }
    return g.map((r) => r.join(''));
  }
  if (option === 'ash') {
    // A mound on the floor: its bottom row spans the figure's footprint (the widest of its last two rows), each row above two cells in on
    // each side, up to three rows, and a dim crust on top so it reads as a heap and not a step.
    const xs = cellsOf(sprite).filter(([, y]) => y >= h - 2).map(([x]) => x);
    let lo = Math.min(...xs), hi = Math.max(...xs);
    for (let y = h - 1; y >= h - 3 && hi - lo >= 1; y--, lo += 2, hi -= 2) for (let x = lo; x <= hi; x++) g[y][x] = '#';
    const heap = g.map((r) => [...r]);
    for (let y = h - 3; y < h; y++) for (let x = 0; x < w; x++) if (heap[y][x] === '#' && heap[y - 1]?.[x] !== '#') g[y][x] = 'x';
    return g.map((r) => r.join(''));
  }
  throw new Error(`unknown pose: ${option}`);
}

export const BURN_OPTIONS = {
  tag: 'A. from the tag',
  feet: 'B. from the feet up',
  embers: 'C. embers',
};
export const LEFT_OPTIONS = {
  ash: 'ash heap (decided)',
  scorch: 'scorch outline',
  nothing: 'nothing',
};

export const BURNS = Object.keys(BURN_OPTIONS);
// Which burn plays (decided: one of the three at random when it hits). `seed` is any whole number fixed for that death (the renderer uses
// the death's time, `diedAt`), so the same death always burns the same way, across reloads and redraws.
export const pickBurn = (seed) => BURNS[Math.floor(rng(Math.abs(Math.trunc(seed)) ^ 0x5eed)() * BURNS.length)];

// One frame of the burn at `time` ms since the third mark. `sprite` is the form's A frame (the glance and wearables are dropped: wearables
// burn with it, so the renderer stops drawing them at step 0). -> rows, or null once the burn is over (draw the capture pose from then on).
export function burnFrame(sprite, tag, { time = 0, reduced = false, burn = 'tag', left = 'ash' } = {}) {
  const step = Math.floor(Math.max(0, time) / BURN_STEP_MS);
  if (reduced || step >= BURN_STEPS) return null;
  const at = catchSteps(sprite, tag, burn);
  // What is left settles as ash while it burns (drawn in the palette); the dead colours take over when the burn ends.
  const rest = leftOf(sprite, left).map((r) => r.replace(/[^.]/g, BURN.ash));
  return sprite.map((r, y) => [...r].map((c, x) => {
    const s = at[y][x];
    if (!Number.isFinite(s)) {
      // An empty cell the pose fills (the ash heap between the legs): it settles with the first cell of its row that does.
      if (rest[y][x] === '.') return c;
      // A heap row over the figure's empty cells only (between the legs of a sparse hem) takes the nearest row below that has some.
      let from = Infinity;
      for (let yy = y; yy < at.length && from === Infinity; yy++) from = Math.min(...at[yy].filter((v, i) => Number.isFinite(v) && rest[yy][i] !== '.'));
      return step >= Math.min(from, BURN_RINGS - 1) + 2 ? rest[y][x] : c;
    }
    if (step < s) return c;
    if (step === s) return BURN.front;
    if (step === s + 1) return BURN.ash;
    return rest[y][x];
  }).join(''));
}
