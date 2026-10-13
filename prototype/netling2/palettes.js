// Two new netling palettes for 2.0 (docs/NETLING_2_ACCESSORY_IDEAS.md, "Palettes"). Nothing here is decided or shipped; src/ is not edited.
// A palette is { name, main, accent, mark? } as 1.0's (src/sim.js PALETTES); the body is `main`, the eyes and the flatline `accent`, and
// `mark` the small highlight marks (white unless white would vanish).
//
// How they were picked. 1.0's six leave two hue gaps, orange and a true blue, and the ten tints are all dark, so a palette is judged on:
//   - main against every tint's LCD colour: 4.5:1 or better, as 1.0's lowest (neon 4.5, ultra 5.0). Graphics are asked for 3:1.
//   - accent against every tint's LCD colour: 4.4:1 or better, as 1.0's lowest (toxic 4.4), since the accent is the flatline when dead.
//   - accent against main: 2.1:1 or better, as 1.0's lowest (ice and neon 2.1), so the eyes read on the body.
//   - main at least 35 apart (CIE76) from every other palette's main, so no two netlings look alike at a glance.
// The tests check all four (palettes.test.js), and the wearables' blend check runs on them like any other palette.
import { PALETTES } from '../../src/sim.js';
import { AUTO_COLORS } from '../../src/wearable-colors.js';
import { NEW_AUTO_COLORS } from './palette-colors.js';

export const NEW_PALETTES = [
  // Orange: the gap between neon's pink and acid's yellow. The accent is a warm white, the only way to keep the eyes readable on a
  // body this bright (a mid accent cannot be both 2.1:1 against orange and 4.4:1 against the dark LCD).
  { name: 'ember', main: '#ff8a1a', accent: '#fff3d6' },
  // Blue: ice is cyan and ultra is violet, with nothing between. A yellow accent, as ultra's, keeps it in the family.
  { name: 'cobalt', main: '#4d8dff', accent: '#f9f002' },
];

// Adds the palettes before `origin` (the last, root-only one), so rolling the base palettes would reach them and `origin` stays last.
// Prototype only: 1.0's rollQuirk reads BASE_PALETTES, fixed when sim.js loads, so a rolled netling does not get them until the real sim
// changes. Idempotent. palette-colors.mjs uses this alone, to compute the automatic colours.
let added = false;
export function addPalettes() {
  if (added) return;
  added = true;
  const at = PALETTES.findIndex((p) => p.name === 'origin');
  PALETTES.splice(at < 0 ? PALETTES.length : at, 0, ...NEW_PALETTES);
}

// addPalettes() and the recolorable wearables' automatic colours for them (palette-colors.js, generated as tools/wearable-colors.mjs does for
// the six; the ideas' ids are in it, so call registerIdeas() before or after as you like: an id with no wearable is just unused).
export function registerPalettes() {
  addPalettes();
  for (const [id, slots] of Object.entries(NEW_AUTO_COLORS)) {
    AUTO_COLORS[id] ??= slots.map(() => ({}));
    slots.forEach((byPalette, i) => Object.assign((AUTO_COLORS[id][i] ??= {}), byPalette));
  }
}
