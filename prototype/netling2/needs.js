// What drives the neglect look (docs/NETLING_2_SKETCH.md, Evolution: neglect and bugs on the sprite; docs/NETLING_2_SPRITES.md, Layers): the care needs left unmet, read from the four
// care stats (0 to 100). It is TRANSIENT by design: a pure function of the stats now, so it clears as soon as the needs are met.
// Bugs are the persistent layer and have their own look (glitch.js).
//
// Two lines per need. The alert line is 1.0's own (src/sim.js needsAttention: Charge or Sync under 20, Heat over 80); the soft
// line is earlier. Integrity has no alert line in 1.0 (a virus is the alert), so its lines here are mine, to tune.
//     level 0 none    1 worn: a need is past its soft line    2 neglected: a need is past its alert line, or two are past soft
import { CFG } from '../../src/sim.js';

// [soft, alert] per need; low needs are 'under', Heat is 'over'.
export const LINES = {
  charge: { soft: 40, alert: 20, dir: 'under' },
  sync: { soft: 40, alert: 20, dir: 'under' },
  integrity: { soft: 60, alert: 30, dir: 'under' },
  heat: { soft: CFG.overclockHeat, alert: 80, dir: 'over' },
};
// A need must clear a line by this much before the look changes back, so a stat hovering on a line does not flicker it.
export const GUARD = 3;

const past = (value, line, dir, margin) => (dir === 'under' ? value < line + margin : value > line - margin);

// The level for these stats. margin > 0 loosens the lines (a need counts as unmet a little sooner), margin < 0 tightens them.
function levelAt(stats, margin) {
  let soft = 0;
  let alert = false;
  for (const [need, { soft: s, alert: a, dir }] of Object.entries(LINES)) {
    const v = stats[need];
    if (past(v, a, dir, margin)) alert = true;
    if (past(v, s, dir, margin)) soft++;
  }
  return alert || soft >= 2 ? 2 : soft ? 1 : 0;
}
export const neglectLevel = (stats) => levelAt(stats, 0);

// The level to show now, given the one shown last: it rises once a need is GUARD past a line and falls once every line is
// cleared by GUARD, and holds in between.
export function guardedNeglect(stats, current) {
  const up = levelAt(stats, -GUARD);
  const down = levelAt(stats, GUARD);
  return current < up ? up : current > down ? down : current;
}
