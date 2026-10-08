// Echo layers for the hidden elders (maintainer's request after the sprite review): Wetware's Cipher has a ghost dub (blank-motion.js); Program's
// Whisper gets a similar echo, and Iron's Init a different one, because Iron is solid and rigid. These are OPTIONS to choose from, drawn side
// by side in echo-preview.html; none is registered on a form yet. Like blank-motion.js each is a pure function of (sprite, anchors, time) that
// returns padded rows (a layer over the sprite, not a different sprite: the registered frames still obey the frame rules and wearables sit on
// them), 12 steps of 400 ms, and under reduced motion a still version (the echo parked).
//   Echo cells are dim ('x') and drawn only where the figure is empty, so the figure stays whole on top.
import { FLASH_TOGGLE_MS } from '../../src/games/common.js';

export const STEPS = 12;
export const STEP_MS = FLASH_TOGGLE_MS * 2;
export const PAD = 5;
export const stepOf = (time) => Math.floor(Math.max(0, time) / STEP_MS) % STEPS;

const pad = (sprite) => sprite.map((r) => [...('.'.repeat(PAD) + r + '.'.repeat(PAD))]);
const isBody = (c) => c !== '.' && c !== undefined;
// Draw a dim copy of `src` (padded rows) shifted by (dx, dy) into `g`, on empty cells only. `mode`: 'solid' (every body cell), 'outline'
// (only cells with an empty neighbour), 'checker' (every other cell).
function dub(g, src, dx, dy, mode = 'solid') {
  for (let y = 0; y < src.length; y++) {
    for (let x = 0; x < src[0].length; x++) {
      if (!isBody(src[y][x])) continue;
      if (mode === 'outline') {
        const edge = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([ax, ay]) => !isBody(src[y + ay]?.[x + ax]));
        if (!edge) continue;
      }
      if (mode === 'checker' && (x + y) % 2) continue;
      const tx = x + dx;
      const ty = y + dy;
      if (g[ty]?.[tx] === '.') g[ty][tx] = 'x';
    }
  }
}
const out = (g) => g.map((r) => r.join(''));

// ---- Program (Whisper): software echoes -------------------------------------------------------------------------------------------------------
// A. dub: Cipher's ghost dub carried over: a dim copy slides three cells either way behind the figure and passes behind it in the middle.
const DUB = [-3, -2, -1, 0, 1, 2, 3, 2, 1, 0, -1, -2];
// B. fork: a process forked and lagging: the copy trails out to the right, holds, and is reaped back into the figure (one side only).
const FORK = [0, 1, 2, 3, 3, 3, 3, 2, 1, 0, 0, 0];
// C. stale frame: a late frame, one row down and two columns right, that steps in, holds, and steps out in whole cells.
const STALE = [[0, 0], [1, 0], [2, 1], [2, 1], [2, 1], [2, 1], [2, 1], [1, 0], [0, 0], [0, 0], [0, 0], [0, 0]];

export const PROGRAM_OPTIONS = {
  dub: { name: 'A. ghost dub (as Cipher)', fn: (sprite, anchors, { time = 0, reduced = false } = {}) => {
    const g = pad(sprite);
    const src = pad(sprite);
    dub(g, src, reduced ? 2 : DUB[stepOf(time)], 0);
    return out(g);
  } },
  fork: { name: 'B. fork lag (one side)', fn: (sprite, anchors, { time = 0, reduced = false } = {}) => {
    const g = pad(sprite);
    const src = pad(sprite);
    dub(g, src, reduced ? 2 : FORK[stepOf(time)], 0);
    return out(g);
  } },
  stale: { name: 'C. stale frame (down-right)', fn: (sprite, anchors, { time = 0, reduced = false } = {}) => {
    const g = pad(sprite);
    const src = pad(sprite);
    const [dx, dy] = reduced ? [2, 1] : STALE[stepOf(time)];
    dub(g, src, dx, dy);
    return out(g);
  } },
};

// ---- Iron (Init): rigid, mechanical echoes: whole-cell jumps, no slides, hard edges ----------------------------------------------------------------
// A. lockstep twin: a dim twin pops out three cells to the right, latches, snaps back, then does the same on the left.
const TWIN = [0, 0, 3, 3, 3, 3, 0, 0, -3, -3, -3, -3];
// B. shadow register: a hollow outline copy (a wireframe image of the figure) swaps sides in blocks: two cells right, then two left.
const SHADOW = [2, 2, 2, 2, 2, 2, -2, -2, -2, -2, -2, -2];
// C. ratchet: copies stack out to the right one at a time, 2 cells apart, hold, and clear together (a stepper counting out).
const RATCHET = [0, 1, 2, 3, 3, 3, 3, 3, 0, 0, 0, 0];

export const IRON_OPTIONS = {
  twin: { name: 'A. lockstep twin', fn: (sprite, anchors, { time = 0, reduced = false } = {}) => {
    const g = pad(sprite);
    const src = pad(sprite);
    const dx = reduced ? 3 : TWIN[stepOf(time)];
    if (dx) dub(g, src, dx, 0);
    return out(g);
  } },
  shadow: { name: 'B. shadow register (hollow)', fn: (sprite, anchors, { time = 0, reduced = false } = {}) => {
    const g = pad(sprite);
    const src = pad(sprite);
    dub(g, src, reduced ? 2 : SHADOW[stepOf(time)], 0, 'outline');
    return out(g);
  } },
  ratchet: { name: 'C. ratchet trail', fn: (sprite, anchors, { time = 0, reduced = false } = {}) => {
    const g = pad(sprite);
    const src = pad(sprite);
    const n = reduced ? 2 : RATCHET[stepOf(time)];
    for (let k = n; k >= 1; k--) dub(g, src, 2 * k, 0, k === 1 ? 'solid' : 'outline');
    return out(g);
  } },
};
