// The Metronome prop's pendulum (docs/NETLING_2_SKETCH.md, Temper cosmetics). A pure function of (level, time, seed, reduced) like
// tell.js, so the prop needs no state. The pendulum sits on one side or the other: -1 left, 0 upright, +1 right.
//   steady (+1, +2)   it swings on the same beat as the sprite's tell, every 6 s (every 3 s strongly), alternating sides: tick, tock.
//   middle            upright and still: nothing to show.
//   unsteady (-1, -2) it swings at irregular moments and often sticks on the same side; strongly, twice as often.
// No sound: no accessory or prop has one, so the Metronome has none either (maintainer).
// Flash budget (CLAUDE.md rule 7): the pendulum changes side at most once per window of 3 s (1.5 s strongly) and never within
// FLASH_TOGGLE_MS of its last change, so it cannot change more than three times a second. Reduced motion keeps the calm steady beat
// and parks the unsteady pendulum on one side.
import { FLASH_TOGGLE_MS } from '../../src/games/common.js';
import { BEAT_MS } from './tell.js';

export const SLOT_MS = FLASH_TOGGLE_MS;
export const WINDOW_MS = { '-1': 3000, '-2': 1500 };
const hash = (n) => {
  const h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b) >>> 0;
  return (Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0) / 4294967296;
};
const side = (w, seed) => (hash(w * 29 + seed) < 0.5 ? -1 : 1);

// -> { pos: -1 | 0 | 1 }
export function metronome({ level, time, reduced = false, seed = 0 }) {
  if (level === 0) return { pos: 0 };
  if (level > 0) {
    const interval = BEAT_MS[level];
    return { pos: Math.floor(time / interval) % 2 === 0 ? -1 : 1 };
  }
  if (reduced) return { pos: side(0, seed) };
  const window = WINDOW_MS[level];
  const w = Math.floor(time / window);
  const into = time - w * window;
  const at = Math.floor(hash(w * 31 + seed) * window * 0.6); // the swing falls in the first 60% of its window
  return { pos: into < at ? side(w - 1, seed) : side(w, seed) };
}
