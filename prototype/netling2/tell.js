// The temper tell: how a netling's hidden temper (0 orderly .. 1 volatile) shows in its sprite motion. A pure function of
// (egg, temper, time, seed), like the 1.0 idle in render.js, so it needs no state and survives reloads. Nothing here
// touches the DOM or storage.
//
// Flash budget (CLAUDE.md rule 7): nothing flashes more than three times a second. A volatile frame is chosen per slot of
// FLASH_TOGGLE_MS and never changes inside one, so a frame toggles at most every 200 ms by construction; the tests also
// sample it. The orderly rhythm is the 1.0 one (a frame per 500 ms).
//
// Per egg skins (a proposal, see docs/NETLING_2_SPRITES.md):
//   iron      drift: the body slides off its grid a column at a time and snaps back, like a calibration correcting
//   program   jitter: frames stutter and it hops a row
//   wetware   pulse: a slow brightness pulse that goes irregular
// In reduced motion every egg gets a still variant that keeps a tell without movement: Iron sits permanently one column off
// its grid, Program holds its alternate frame, Wetware holds a slightly dimmer, steady shade.
import { FLASH_TOGGLE_MS } from '../../src/games/common.js';

export const SLOT_MS = FLASH_TOGGLE_MS;
export const EGGS = ['iron', 'program', 'wetware'];
export const FRAME_MS = 500; // the 1.0 frame period

// Temper bands. The edges are placeholders to tune with the balance tools.
export const BANDS = { orderlyBelow: 0.35, volatileFrom: 0.65 };
export const band = (t) => (t < BANDS.orderlyBelow ? 'orderly' : t >= BANDS.volatileFrom ? 'volatile' : 'mixed');

const hash = (n) => {
  const h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b) >>> 0;
  return (Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0) / 4294967296;
};

// Probability that a slot flips the steady rhythm.
const STUTTER = { orderly: 0, mixed: 0.1, volatile: 0.3 };

function frameOf(b, time, seed) {
  if (b === 'orderly') return Math.floor(time / FRAME_MS) % 2;
  const slot = Math.floor(time / SLOT_MS);
  const steady = Math.floor((slot * SLOT_MS) / FRAME_MS) % 2;
  return hash(slot * 31 + seed) < STUTTER[b] ? 1 - steady : steady;
}

// -> { frame: 0 | 1 (A or B), dx, dy (columns and rows off the idle position), shade (1 = full brightness) }
export function temperTell({ egg, temper, time, reduced = false, seed = 0 }) {
  const b = band(Math.min(1, Math.max(0, temper)));
  const out = { frame: Math.floor(time / FRAME_MS) % 2, dx: 0, dy: 0, shade: 1 };
  if (b === 'orderly') {
    if (egg === 'wetware' && !reduced) out.shade = 0.92 + 0.08 * Math.sin((time / 3000) * 2 * Math.PI);
    return out;
  }
  if (reduced) {
    if (b === 'volatile') {
      if (egg === 'iron') out.dx = hash(seed + 7) < 0.5 ? -1 : 1;
      else if (egg === 'program') out.frame = 1;
      else out.shade = 0.8;
    }
    return out;
  }
  if (egg === 'iron') {
    out.frame = frameOf(b, time, seed);
    const cycle = Math.floor(time / 4000);
    const amp = b === 'volatile' ? 2 : cycle % 2 ? 1 : 0;
    const dir = hash(cycle * 17 + seed) < 0.5 ? -1 : 1;
    out.dx = dir * Math.min(amp, Math.floor(((time % 4000) / 4000) * (amp + 1)));
  } else if (egg === 'program') {
    out.frame = frameOf(b, time, seed);
    if (b === 'volatile' && hash(Math.floor(time / SLOT_MS) * 13 + seed) < 0.08) out.dy = -1;
  } else {
    // Wetware: the frame stays steady; the pulse carries the tell. The phase wanders when volatile; the fastest it moves
    // is under 1 Hz and the swing is at most 0.25 of the brightness, so it is no flash.
    const wander = b === 'volatile' ? 0.35 * Math.sin(time / 1100 + seed) : 0.12 * Math.sin(time / 1100 + seed);
    const swing = b === 'volatile' ? 0.25 : 0.15;
    out.shade = 1 - swing * (0.5 + 0.5 * Math.sin((time / 1800 + wander) * 2 * Math.PI));
  }
  return out;
}
