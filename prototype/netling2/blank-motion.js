// Blank's elder in motion (the GitS motif; maintainer's pick of five options, with a frame-rule exception). Like the neglect and bug
// looks, this is a layer over the sprite, not a different sprite: the registered A and B frames of `blankElder` still obey the frame
// rules (head, eyes and neck identical, camouflage as marks), so wearables are placed on them as on any form. This layer then changes the
// outline on purpose, which is the exception:
//   camouflage activation: a dim scan band sweeps from the hood peak to the feet and back. Above it the body is solid, below it the body is
//     see-through checker holes (the thermoptic suit taking hold). The face opening and the eyes never change.
//   ghost dub: a dim copy of the whole upper body slides three cells either way behind the figure, passing behind it in the middle (a
//     "ghost dub", the Puppet Master's copied mind). It needs room, so the result is 24 columns wide against the sprite's 18 (a hidden
//     form may ignore the width rule).
// A pure function of (sprite, anchors, time). 12 steps of 400 ms, so a 4.8 s loop and no picture change faster than 400 ms (the flash
// floor is 200 ms; this is well inside it). Reduced motion keeps no motion: the camouflage as drawn, with the dub parked two cells out.
import { FLASH_TOGGLE_MS } from '../../src/games/common.js';

export const STEPS = 12;
export const STEP_MS = FLASH_TOGGLE_MS * 2;
export const PAD = 3;
export const BANDS = [1, 3, 5, 7, 9, 11, 13, 11, 9, 7, 5, 3];
export const SHIFTS = [-3, -2, -1, 0, 1, 2, 3, 2, 1, 0, -1, -2];
export const PARKED_SHIFT = 2;

// The face opening: the eye rows (and the row under them) between the first and last dim or accent cell, which never change.
function faceBox(sprite, anchors) {
  const rows = [anchors.eyeRow, anchors.eyeRow + 1, anchors.eyeRow + 2];
  const cols = sprite[anchors.eyeRow].split('').map((c, x) => (c === 'x' || c === 'o' ? x : -1)).filter((x) => x >= 0);
  return { rows, left: Math.min(...cols), right: Math.max(...cols) };
}

export const motionStep = (time) => Math.floor(Math.max(0, time) / STEP_MS) % STEPS;

export function blankMotion(sprite, anchors, { time = 0, reduced = false } = {}) {
  const g = sprite.map((r) => [...('.'.repeat(PAD) + r + '.'.repeat(PAD))]);
  const width = g[0].length;
  const shift = reduced ? PARKED_SHIFT : SHIFTS[motionStep(time)];
  // the dub is a copy of the upper body (down to the neck row and a little below), drawn only where the figure is empty
  const upper = g.slice(0, anchors.neckRow + 1).map((r) => r.slice());
  if (!reduced) {
    const band = BANDS[motionStep(time)];
    const box = faceBox(sprite, anchors);
    for (let y = 0; y < g.length; y++) {
      for (let x = 0; x < width; x++) {
        const c = g[y][x];
        if (c !== '#' && c !== 'x') continue;
        if (box.rows.includes(y) && x >= box.left + PAD && x <= box.right + PAD) continue;
        if (y < band) g[y][x] = '#';
        else if (y === band) g[y][x] = 'x';
        else g[y][x] = (x + y) % 2 === 0 ? '#' : '.';
      }
    }
  }
  for (let y = 0; y < upper.length; y++) {
    for (let x = 0; x < width; x++) {
      const src = upper[y][x - shift];
      if (g[y][x] === '.' && src && src !== '.') g[y][x] = 'x';
    }
  }
  return g.map((r) => r.join(''));
}
