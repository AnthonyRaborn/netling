// The Metronome prop's pendulum (docs/NETLING_2_SKETCH.md, Temper cosmetics). A pure function of (level, time, seed, reduced) like
// tell.js, so the prop needs no state. The pendulum sits on one side or the other: -1 left, 0 upright, +1 right.
//   steady (+1, +2)   it swings on its own even beat, every 1 s (every 0.5 s strongly), alternating sides: tick, tock. The tell's beat
//                     (6 s, 3 s strongly) is a whole number of ticks, so the tell lands on a tick. (It swung on the tell's beat until the
//                     maintainer's review: painfully slow to watch.)
//   middle            upright and still: nothing to show.
//   unsteady (-1, -2) it swings at irregular moments and often sticks on the same side; strongly, more often. Sped up with the steady
//                     beat (windows of 0.5 s and 0.3 s, were 3 s and 1.5 s), still off any beat.
// No sound: no accessory or prop has one, so the Metronome has none either (maintainer).
// Flash budget (CLAUDE.md rule 7): the pendulum changes side at most once per window, at a moment that leaves at least FLASH_TOGGLE_MS
// to the window's end, so two changes are never closer than FLASH_TOGGLE_MS: a full flash (there and back) takes 400 ms or more, under
// three a second. Reduced motion keeps the calm steady beat and parks the unsteady pendulum on one side.
import { FLASH_TOGGLE_MS } from '../../src/games/common.js';
export const SLOT_MS = FLASH_TOGGLE_MS;
export const STEADY_MS = { 1: 1000, 2: 500 };
export const WINDOW_MS = { '-1': 500, '-2': 300 };
// The share of a window in which its swing may fall: the first 60%, but never closer than FLASH_TOGGLE_MS to the window's end.
export const swingRange = (window) => Math.min(window * 0.6, window - FLASH_TOGGLE_MS);
const hash = (n) => {
  const h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b) >>> 0;
  return (Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0) / 4294967296;
};
const side = (w, seed) => (hash(w * 29 + seed) < 0.5 ? -1 : 1);

// -> { pos: -1 | 0 | 1 }
export function metronome({ level, time, reduced = false, seed = 0 }) {
  if (level === 0) return { pos: 0 };
  if (level > 0) {
    const interval = STEADY_MS[level];
    return { pos: Math.floor(time / interval) % 2 === 0 ? -1 : 1 };
  }
  if (reduced) return { pos: side(0, seed) };
  const window = WINDOW_MS[level];
  const w = Math.floor(time / window);
  const into = time - w * window;
  const at = Math.floor(hash(w * 31 + seed) * swingRange(window));
  return { pos: into < at ? side(w - 1, seed) : side(w, seed) };
}
