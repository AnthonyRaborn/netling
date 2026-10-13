// Five new netling palettes for 2.0 (docs/NETLING_2_ACCESSORY_IDEAS.md, "Palettes"). Nothing here is decided or shipped; src/ is not edited.
// A palette is { name, main, accent, mark?, ink? } as 1.0's (`ink` is new, below) (src/sim.js PALETTES); the body is `main`, the eyes and the flatline `accent`, and
// `mark` the small highlight marks (white unless white would vanish).
//
// How they were picked. 1.0's six leave two hue gaps, orange and a true blue, and the ten tints are all dark, so a palette is judged on:
//   - main against every tint's LCD colour: 4.5:1 or better, as 1.0's lowest (neon 4.5, ultra 5.0). Graphics are asked for 3:1.
//   - accent (or `ink`, where a palette has one) against every tint's LCD colour: 4.4:1 or better, as 1.0's lowest (toxic 4.4), since it is drawn on the screen: the flatline when dead.
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
  // Mint: between ice's cyan and toxic's lime, 52 from its nearest body (ice). Pink eyes, as ice's: 2.8:1 on the body. The marks (teeth, nose) are dark: white on this body is 1.17:1, as on acid and toxic.
  { name: 'mint', main: '#5dffb0', accent: '#ff2a6d', mark: '#2b1b5a' },
  // The two with `ink`: a palette's accent is the eyes on the body, but 1.0 also draws it straight on the screen (the flatline, the virus,
  // cache nodes, PAUSED, the glow), where it needs 4.4:1 on the dark LCD. A dark accent reads best as eyes on a pale body (8.6:1) and
  // cannot do that second job, so these carry `ink`, the colour for what is drawn on the screen, and the bar for the accent on the screen
  // applies to `ink ?? accent`. The marks are dark because white on either body is under 2:1 (1.60 and 1.95).
  // Peach: the pale gap between ember and neon, 43 from ember (the nearest).
  { name: 'peach', main: '#ffb38a', accent: '#2b1b5a', ink: '#ff5c7a', mark: '#2b1b5a' },
  // Rose: a pale pink, 41 from neon (the nearest).
  { name: 'rose', main: '#ff8fb8', accent: '#1a0a3a', ink: '#b967ff', mark: '#2b1b5a' },
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
