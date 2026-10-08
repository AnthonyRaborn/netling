// The sprite marks for the three bar states (docs/NETLING_2_CARE_DRAFTS.md, State clues), as pure functions of time, so a test can
// check them against the temper tell. Nothing here draws or touches the DOM.
//
// Overclock (1.0): three heat wisps climb above the top edge. Overdrive: two sparks hop along the base, under the feet. Overlink:
// two dots slide up and down at the sprite's sides in opposite phase (one when strained). The three sit in different places
// (above, below, beside) and move differently, so two states at once stay readable.
//
// Flash budget (CLAUDE.md rule 7): a mark steps once per STATE_STEP_MS (1.0's HEAT_RISE_MS) and only on a multiple of it, which is
// also a multiple of the tell's FLASH_TOGGLE_MS slot, so the marks never add a change instant the tell does not already have.
// Calm mode: every mark is still.
import { SLOT_MS } from './tell.js';

export const STATE_STEP_MS = 400; // 1.0's HEAT_RISE_MS in src/render.js
export const KINDS = ['overclock', 'overdrive', 'overlink'];

export const stepOf = (time) => Math.floor(time / STATE_STEP_MS);

// -> [[dx, dy]]: pixel offsets from the sprite's top-left corner, for a sprite w columns by h rows.
export function stateMarks({ kind, time, w, h, calm = false, strained = false }) {
  const s = calm ? 0 : stepOf(time);
  if (kind === 'overclock') {
    return [0, 1, 2].map((i) => [Math.round(((i + 0.5) * w) / 3), -1 - (calm ? i + 1 : (s + i * 2) % 4)]);
  }
  if (kind === 'overdrive') {
    const xs = [Math.round(w * 0.25), Math.round(w * 0.75)];
    // Rows h+1 and h+2: Iron's settle drops the body one row, so row h is not free.
    return xs.map((x, i) => [x + (calm ? 0 : ((s + i * 2) % 4 < 2 ? 0 : 1)), h + 1 + (calm ? 0 : (s + i) % 2)]);
  }
  if (kind === 'overlink') {
    const ys = [Math.round(h * 0.25), Math.round(h * 0.4), Math.round(h * 0.55), Math.round(h * 0.7)];
    // 3 columns out on each side: Iron's strongest drift moves the body two columns, so the dots never touch it.
    const dots = [[-3, ys[calm ? 1 : s % 4]], [w + 2, ys[calm ? 2 : (s + 2) % 4]]];
    return strained ? dots.slice(0, 1) : dots;
  }
  throw new Error(`unknown state mark ${kind}`);
}

export const SLOT = SLOT_MS;
