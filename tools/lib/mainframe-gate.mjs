// The gate for the planned Mainframe stage (docs/SOURCE_PLAN.md), measured before it is built. Pure.
// An adult would recompile at the first minute it is home from any run, has reached The Deep's exit this life,
// and has lived into its last ordinary day. When the stage is built, this rule moves into sim.js and the
// balance tool imports it from there, so the measured gate and the real one stay the same rule.

export const MAINFRAME_GATE = {
  beforeEndMin: 24 * 60, // the age half: this long before the end of an ordinary life
  bonusMin: 24 * 60, // the day of life it would gain
  feat: 'deep', // the region whose exit it must reach in this life
};

export const mainframeAt = (s) => s.life.lifespan - MAINFRAME_GATE.beforeEndMin;
export const mainframeEnd = (s) => s.life.lifespan + MAINFRAME_GATE.bonusMin;

export const mainframeDue = (s) =>
  s.stage === 'adult' && !s.run && s.ageMin >= mainframeAt(s) && (s.cleared ?? []).includes(MAINFRAME_GATE.feat);
