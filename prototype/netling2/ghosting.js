// Ghosting, the screen effect (docs/archive/netling2/ACCESSORY_IDEAS.md, "Screen effects"): old LCD lag. A cell that turns off, or changes colour,
// does not snap to its new colour: it fades from the old one over GHOST_MS. Pure: it works on a grid of cell colours (the screen's
// 40x30 '#rrggbb' strings, as render.test.js's grid keeps them) and the clock, so the tests drive it without a canvas; the review page
// feeds it the canvas's cells.
//
// A fade, not a blink: each cell moves in one direction from its old colour to its new one and then stops, so it adds no flashes. A cell
// that changes again before the fade ends starts from the colour it shows at that moment. The fade is 200 ms (FLASH_TOGGLE_MS): the
// slowest change a flickering cell can make is therefore never faster than the flash rule's floor.
import { FLASH_TOGGLE_MS } from '../../src/games/common.js';

export const GHOST_MS = 200;
const hex = (c, i) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16);
export const mixHex = (from, to, t) => `#${[0, 1, 2].map((i) => Math.round(hex(from, i) + (hex(to, i) - hex(from, i)) * t).toString(16).padStart(2, '0')).join('')}`;

// createGhosting(): { step(cells, now, { reduced }) -> cells }. Colours must be '#rrggbb'; null (nothing drawn) is read as `bg`.
export function createGhosting(bg = '#0b2226') {
  let prev = null; // what each cell was last asked to be
  let shown = null; // what each cell showed at the last step
  let fade = null; // { from, at } per cell: the colour it is fading from and when the fade began
  return {
    step(cells, now, { reduced = false } = {}) {
      const want = cells.map((row) => row.map((c) => c ?? bg));
      if (!prev || reduced) {
        prev = want;
        shown = want.map((row) => row.slice());
        fade = want.map((row) => row.map(() => null));
        return shown.map((row) => row.slice());
      }
      for (let y = 0; y < want.length; y++) {
        for (let x = 0; x < want[y].length; x++) {
          if (want[y][x] !== prev[y][x]) fade[y][x] = { from: shown[y][x], at: now };
          const f = fade[y][x];
          if (f) {
            const t = Math.min(1, (now - f.at) / GHOST_MS);
            shown[y][x] = mixHex(f.from, want[y][x], t);
            if (t >= 1) fade[y][x] = null;
          } else shown[y][x] = want[y][x];
        }
      }
      prev = want;
      return shown.map((row) => row.slice());
    },
  };
}

if (GHOST_MS < FLASH_TOGGLE_MS) throw new Error('a ghost fade faster than the flash rule');
