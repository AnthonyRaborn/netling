// The shadow: the feature all ten Rogue forms share (decided, maintainer; docs/NETLING_2_ROGUE_DRAFTS.md, sections 6.1 and 8.4). Every
// hidden line has an echo behind its elder (Cipher's ghost dub, Whisper's fork lag, Init's ratchet trail; blank-motion.js and
// echo-motion.js), and Rogue's draws on that ruleset: a pure function of (sprite, anchors, time) returning padded rows, a layer over the
// sprite and not a different sprite (the registered A and B frames still obey the frame rules, and wearables sit on them), 12 steps of
// 400 ms, echo cells only where the figure is empty and in the shared dim cell, a still version under reduced motion.
//
// Unlike the hidden lines, Rogue has it on every form, not only the elder, and it grows with the stage: one cell out on the baby and the
// teen, two on the adults, three on the elders.
//   DECOY (the proposal): the fork lag's shape used as a decoy left for the hunters. A dim copy steps out to one side a cell at a time,
//     holds, and is dropped at once (not reaped back, as Whisper's is). It alternates sides from one loop to the next.
//   SPLIT (the alternate to see beside it): the same, to both sides at once, so for a moment there are three of it.
// Reduced motion: the copy parked one cell out to the right (the split: one cell out on both sides).
import { STEPS, STEP_MS, ECHO, stepOf, dub } from './echo-motion.js';

export { STEPS, STEP_MS, ECHO };
export const PAD = 3; // the widest copy (an elder's) is three cells out
export const REACH = { baby: 1, teen: 1, adult: 2, elder: 3 };
// Steps of the loop: out a cell at a time to the stage's reach, hold, then gone for the last four steps.
export const HOLD_UNTIL = 7;
export const offsetAt = (step, reach) => (step === 0 || step > HOLD_UNTIL ? 0 : Math.min(step, reach));
export const sideAt = (time) => (Math.floor(Math.max(0, time) / (STEPS * STEP_MS)) % 2 ? -1 : 1);

const pad = (sprite) => sprite.map((r) => [...('.'.repeat(PAD) + r + '.'.repeat(PAD))]);
const out = (g) => g.map((r) => r.join(''));

function layer(sprite, stage, time, reduced, both) {
  const g = pad(sprite);
  const src = pad(sprite);
  const reach = REACH[stage];
  const n = reduced ? 1 : offsetAt(stepOf(time), reach);
  const side = reduced ? 1 : sideAt(time);
  if (n) {
    dub(g, src, side * n, 0);
    if (both) dub(g, src, -side * n, 0);
  }
  return out(g);
}

// The motion functions the models register on each form (the stage is bound there, as the layer's size depends on it).
export const decoyMotion = (stage) => (sprite, anchors, { time = 0, reduced = false } = {}) => layer(sprite, stage, time, reduced, false);
export const splitMotion = (stage) => (sprite, anchors, { time = 0, reduced = false } = {}) => layer(sprite, stage, time, reduced, true);
export const SHADOW_OPTIONS = {
  decoy: { name: 'A. decoy (one side, alternating; proposed)', make: decoyMotion },
  split: { name: 'B. split (both sides at once)', make: splitMotion },
};
