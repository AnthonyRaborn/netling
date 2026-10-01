// The gate for the planned Mainframe stage (docs/SOURCE_PLAN.md), measured before it is built. Pure.
// An adult would recompile at the first minute it is home from any run, has lived into its last ordinary day, and
// has proved itself in The Deep this life: three exits, or two clean ones (no ICE fight lost). When the stage is
// built, this rule moves into sim.js with the exit counter (s.deepExits, kept by run.js at jack-out), and the
// balance tool imports it from there, so the measured gate and the real one stay the same rule.

export const MAINFRAME_GATE = {
  beforeEndMin: 24 * 60, // the age half: this long before the end of an ordinary life
  bonusMin: 24 * 60, // the day of life it would gain
  exits: 3, // Deep exits this life...
  cleanExits: 2, // ...or this many clean ones
};

export const mainframeAt = (s) => s.life.lifespan - MAINFRAME_GATE.beforeEndMin;
export const mainframeEnd = (s) => s.life.lifespan + MAINFRAME_GATE.bonusMin;

// s.deepExits: { all, clean }, this life's exits from The Deep.
export const mainframeFeat = (s) => (s.deepExits?.all ?? 0) >= MAINFRAME_GATE.exits || (s.deepExits?.clean ?? 0) >= MAINFRAME_GATE.cleanExits;

export const mainframeDue = (s) => s.stage === 'adult' && !s.run && s.ageMin >= mainframeAt(s) && mainframeFeat(s);
