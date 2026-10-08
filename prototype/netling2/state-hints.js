// The one-time pre-state caption (docs/NETLING_2_CARE_DRAFTS.md, Pre-state caption). Once a netling, per bar, when Charge or Sync has been
// building toward its state for an hour (see SIDES.<bar>.hintMin in sim/sim.js and sim/hint-sweep.mjs), the home screen shows a short
// caption in the style of 1.0's first-run tips (src/netrun/view.js TUTORIAL_TIPS: two lines, lowercase, about 46 characters at most). It
// names no state, no number and no threshold. Drafts for the maintainer to edit; not wired into any game.
export const STATE_HINTS = {
  program: {
    charge: ['charge is holding steady.', 'keep it up and something may change.'],
    sync: ['sync is holding steady.', 'keep it up and something may change.'],
  },
  iron: {
    charge: ['power is holding steady.', 'keep it up and something may change.'],
    sync: ['the lock is holding steady.', 'keep it up and something may change.'],
  },
  wetware: {
    charge: ['it is well fed and doing well.', 'keep it up and something may change.'],
    sync: ['the bond is holding strong.', 'keep it up and something may change.'],
  },
};

// Whether to show the caption now: the bar has built for hintMin minutes, this netling has not seen it for this bar, and nothing more
// urgent is on screen (an alert, an event, a request, a visit, a run, a nap or sleep).
export function hintDue({ buildMin, shown, busy, hintMin = 60 }) {
  return !shown && !busy && buildMin >= hintMin;
}
