// The temper tell: how a netling's hidden temper shows in its sprite motion. A pure function of (egg, level, time, seed), like
// the 1.0 idle in render.js, so it needs no state and survives reloads. Nothing here touches the DOM or storage.
//
// Levels follow docs/NETLING_2_SKETCH.md (Temper, The temper tell): temper is one hidden number, and the
// tell reads its level:
//     -2 strongly unsteady (temper <= -6)    -1 unsteady (-6 to -2)    0 middle (-2 to +3), no tell
//     +1 steady (+3 to +6)                   +2 strongly steady (+6 or more)
//   steady: a COUNTABLE BEAT, a small signature move on an exact interval (every 6 s at +1, every 3 s at +2), the same every
//           time, so the player can predict it. No stray motion.
//   unsteady: growing chaos. A stuttering frame rhythm and a drift, more of both at -2.
//
// Flash budget (CLAUDE.md rule 7): nothing flashes more than three times a second. A frame (and a blink) only ever changes on a
// boundary of FLASH_TOGGLE_MS, so the picture changes at most every 200 ms by construction; the tests also sample it. The
// orderly rhythm is the 1.0 one (a frame per 500 ms).
//
// Per egg skins (a proposal):
//   iron      steady: it SETTLES, dropping a row for 400 ms on the beat.  unsteady: it drifts off its grid a column at a time.
//   program   steady: it BLINKS (the sleep pose for 200 ms).               unsteady: frames stutter and it hops a row.
//   wetware   steady: a clean BEAT (one smooth dip in brightness).         unsteady: the pulse goes irregular.
// Reduced motion: unsteady levels get a still variant (Iron sits one column off its grid, Program holds its alternate frame,
// Wetware holds a dimmer steady shade); the steady beat stays, because it is calm, tiny and predictable.
import { FLASH_TOGGLE_MS } from '../../src/games/common.js';

export const SLOT_MS = FLASH_TOGGLE_MS;
export const EGGS = ['iron', 'program', 'wetware'];
export const FRAME_MS = 500; // the 1.0 frame period

// Temper values where the level changes, lowest first. Decided in the sketch (-6, -2, +3, +6).
export const THRESHOLDS = [-6, -2, 3, 6];
// A level only changes once temper is this far past a threshold (the flicker guard), so a value hovering on one does not flip
// the tell back and forth. 1.0 was measured on 1.0's simulator (docs/netling2-prototypes/guard.mjs): temper moves in steps of about 1 (a fault,
// an item), and at 0.5 a life still shows 0.2 to 1.3 level reversals within three hours, at 1.0 at most 0.3.
export const GUARD = 1;

const LEVELS = [-2, -1, 0, 1, 2];
export const levelOf = (temper) => LEVELS[THRESHOLDS.filter((t) => temper >= t).length];

// The level to show now, given the one shown last: it moves only when temper is GUARD beyond the threshold it crosses.
export function guardedLevel(temper, current) {
  const up = LEVELS[THRESHOLDS.filter((t) => temper >= t + GUARD).length];
  const down = LEVELS[THRESHOLDS.filter((t) => temper >= t - GUARD).length];
  return current < up ? up : current > down ? down : current;
}

const hash = (n) => {
  const h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b) >>> 0;
  return (Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0) / 4294967296;
};

// Per level: the beat interval (steady), the stutter probability per slot and the drift amplitude (unsteady).
export const BEAT_MS = { 1: 6000, 2: 3000 };
const SETTLE_MS = 400;
const BLINK_MS = SLOT_MS;
const BEAT_FADE_MS = 600;
const STUTTER = { '-1': 0.1, '-2': 0.3 };

function frameOf(level, time, seed) {
  if (level >= 0) return Math.floor(time / FRAME_MS) % 2;
  const slot = Math.floor(time / SLOT_MS);
  const steady = Math.floor((slot * SLOT_MS) / FRAME_MS) % 2;
  return hash(slot * 31 + seed) < STUTTER[level] ? 1 - steady : steady;
}

// -> { frame: 0 | 1 (A or B), blink (show the sleep pose), dx, dy (columns and rows off the idle position), shade (1 = full) }
export function temperTell({ egg, level, time, reduced = false, seed = 0 }) {
  const out = { frame: Math.floor(time / FRAME_MS) % 2, blink: false, dx: 0, dy: 0, shade: 1 };
  if (level === 0) return out;

  if (level > 0) {
    // The steady beat: exact, the same each time. Seed is ignored on purpose: steady is predictable.
    const interval = BEAT_MS[level];
    const into = time % interval;
    if (egg === 'iron' && into < SETTLE_MS) out.dy = 1;
    else if (egg === 'program' && into < BLINK_MS) out.blink = true;
    else if (egg === 'wetware' && into < BEAT_FADE_MS) out.shade = 1 - 0.25 * Math.sin((into / BEAT_FADE_MS) * Math.PI);
    return out;
  }

  if (reduced) {
    if (egg === 'iron') out.dx = hash(seed + 7) < 0.5 ? -1 : 1;
    else if (egg === 'program') out.frame = 1;
    else out.shade = 0.8;
    return out;
  }
  out.frame = frameOf(level, time, seed);
  const strong = level === -2;
  if (egg === 'iron') {
    // Drift: it slides off its grid a column at a time and snaps back, like a calibration correcting.
    const cycle = Math.floor(time / 4000);
    const amp = strong ? 2 : cycle % 2 ? 1 : 0;
    const dir = hash(cycle * 17 + seed) < 0.5 ? -1 : 1;
    out.dx = dir * Math.min(amp, Math.floor(((time % 4000) / 4000) * (amp + 1)));
  } else if (egg === 'program') {
    if (strong && hash(Math.floor(time / SLOT_MS) * 13 + seed) < 0.08) out.dy = -1;
  } else {
    // Wetware: the frame stays steady and the pulse carries the tell. The phase wanders; the fastest it moves is under 1 Hz and
    // the swing is at most 0.25 of the brightness, so it is no flash.
    out.frame = Math.floor(time / FRAME_MS) % 2;
    const wander = (strong ? 0.35 : 0.12) * Math.sin(time / 1100 + seed);
    out.shade = 1 - (strong ? 0.25 : 0.15) * (0.5 + 0.5 * Math.sin((time / 1800 + wander) * 2 * Math.PI));
  }
  return out;
}
