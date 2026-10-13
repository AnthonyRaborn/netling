// The non-audio style ideas beyond the wearables, props and crests (docs/NETLING_2_ACCESSORY_IDEAS.md): the shells, tints, screen effects and
// device labels, as data in 1.0's shapes (src/cosmetics.js). Their looks are in style-ideas.css (shells, effects, labels) and ghosting.js
// (the Ghosting pixel effect); this file holds what the game would list: id, name, hint and the colours the tests measure.
// Nothing is decided or shipped. Unlocks are the doc's placeholders in words (`unlock`): they name 2.0 mechanics (the clinic, bugs,
// the Rogue sweeps) that 1.0's `check(ctx)` cannot read, so no check function is written here.
//
// Left out on purpose (the doc's two duplicates, dropped by the maintainer's choice of 2026-10-13): the Three of a kind shell (the Three
// eggs crest stays) and the Hazard orange tint (1.0's Heatwave effect stays).
// --- shells -----------------------------------------------------------------------------------------------------------------------
// `base`: the shell's colours under the HUD text (a split shell has two); `light` shells carry a dark dim colour and logo like Brushed chrome.
export const IDEA_SHELLS = [
  { id: 'beige', name: 'Terminal beige', swatch: '#d3c89f', hint: 'see a program through to the last version.', unlock: 'raise a Program line to its elder', base: ['#d3c89f'], light: true, dim: '#2a2414', logo: '#2a2414' },
  { id: 'rivet', name: 'Rivet plate', swatch: '#3f444e', hint: 'wear one down to the last bolt.', unlock: 'raise an Iron line to its elder', base: ['#2c3037'], light: false },
  { id: 'membrane', name: 'Membrane', swatch: '#e4a9b8', hint: 'keep something soft alive to the end.', unlock: 'raise a Wetware line to its elder', base: ['#e4a9b8'], light: true, dim: '#3a1420', logo: '#3a1420' },
  { id: 'scorched', name: 'Scorched', swatch: '#0d0908', hint: 'it chose how it ended.', unlock: 'see a Rogue self-destruct once', base: ['#0d0908'], light: false },
  { id: 'clinicwhite', name: 'Clinic white', swatch: '#e6e9ee', hint: 'get it fixed, twenty-five times.', unlock: 'clear 25 bugs at the clinic, across lives', base: ['#e6e9ee'], light: true, dim: '#1c2129', logo: '#1a1d24' },
  { id: 'bugeaten', name: 'Bug-eaten', swatch: '#14121f', hint: 'let it break, and keep going.', unlock: 'carry 5 bugs at once and live', base: ['#14121f'], light: false },
  { id: 'evenkeel', name: 'Even keel', swatch: 'linear-gradient(90deg,#2b3039 50%,#3b1f5c 50%)', hint: 'never lean either way.', unlock: 'hold both Standing tracks within 1 for a whole adulthood', base: ['#2b3039', '#3b1f5c'], light: false },
];

// What 1.0's shells put under the HUD text, for the label check (style.css; the middle colour of each gradient).
export const SHELLS_1_0 = {
  standard: '#14121f', matte: '#0b0b0e', chrome: '#6d7482', brick: '#4a1820', crimson: '#2a060d', shifted: '#10202b', clear: '#0b0b14',
  gold: '#9c7a22', holo: '#10304a', platinum: '#8a909c', airgap: '#4a1820', unplugged: '#131519', pidone: '#1a0306', torn: '#10202b', faint: '#07070c',
};
export const LIGHT_SHELLS_1_0 = ['chrome', 'gold', 'platinum']; // dim #1c2129, logo #1a1d24 or #2a1e04

// --- tints ------------------------------------------------------------------------------------------------------------------------
// `lcd` is the screen colour and `dark` the lights-off colour, as 1.0's. `remap` (Infrared only) recolours what is drawn on the screen.
const lumOf = (c) => {
  const v = [0, 1, 2].map((i) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
export const luminance = lumOf;
const hexMix = (a, b, t) => `#${[0, 1, 2].map((i) => Math.round(parseInt(a.slice(1 + i * 2, 3 + i * 2), 16) * (1 - t) + parseInt(b.slice(1 + i * 2, 3 + i * 2), 16) * t).toString(16).padStart(2, '0')).join('')}`;

// Infrared: a thermal camera's scale. The brightest cells go a pale orange and the dim ones deep red, by luminance; the same screen colour
// is the dark red of the room. Applied to each colour drawn on the LCD (the review page and the tests call it per colour).
export const INFRARED = { low: '#8a1414', high: '#ffe08a' };
export const infraredMap = (color) => hexMix(INFRARED.low, INFRARED.high, Math.min(1, Math.sqrt(lumOf(color))));

export const IDEA_TINTS = [
  { id: 'scrubs', name: 'Scrub green', swatch: '#0a241d', lcd: '#0a241d', dark: '#030b09', hint: 'everyone ends up at the clinic.', unlock: 'first clinic visit' },
  { id: 'infrared', name: 'Infrared', swatch: '#2a0606', lcd: '#2a0606', dark: '#0c0202', hint: 'stay cold while they look for you.', unlock: 'survive 10 Rogue sweeps', remap: infraredMap },
  { id: 'sepia', name: 'Sepia', swatch: '#231b14', lcd: '#231b14', dark: '#0a0705', hint: 'learn where the first one came from.', unlock: 'read every NL-0 page' },
  { id: 'nightshift', name: 'Night shift', swatch: '#0a1230', lcd: '#0a1230', dark: '#030510', hint: 'turn the lights off when it sleeps.', unlock: '30 nights slept with the lights off (always available)' },
];

// --- screen effects ---------------------------------------------------------------------------------------------------------------
// `css`: whether style-ideas.css has an `.screen.fx-<id>` rule; `moves`: its CSS animation, as { name, seconds } (null when still).
export const IDEA_EFFECTS = [
  { id: 'dotmatrix', name: 'Dot matrix', hint: '', unlock: 'free', css: true, moves: null },
  { id: 'ghosting', name: 'Ghosting', hint: 'watch it for a long time.', unlock: '100 hours awake, across lives', css: false, moves: null, pixel: true },
  { id: 'condensation', name: 'Condensation', hint: 'keep it warm and wet.', unlock: 'a Wetware line to its elder', css: true, moves: { name: 'condensation-run', seconds: 30 }, paid: 'split' },
  { id: 'thermal', name: 'Thermal', hint: 'it hides from heat, not light.', unlock: 'see a Rogue form', css: true, moves: null },
  { id: 'vignette', name: 'Vignette', hint: '', unlock: 'free', css: true, moves: null },
  { id: 'interference', name: 'Interference', hint: 'leave by the back door, ten times.', unlock: '10 relay jack-outs', css: true, moves: { name: 'interference', seconds: 10 }, paid: 'split' },
  { id: 'burnin', name: 'Burn-in', hint: 'leave a mark.', unlock: 'see a Rogue self-destruct once (with the Scorched shell)', css: true, moves: null },
  { id: 'sterile', name: 'Sterile', hint: 'keep it spotless.', unlock: 'clear 10 bugs at the clinic, across lives', css: true, moves: null },
];

// The Sterile wash's strongest colour and alpha, which style-ideas.css must not exceed (the test composites it over every tint and palette).
export const STERILE = { rgb: [225, 240, 255], alpha: 0.12 };

// --- device labels ----------------------------------------------------------------------------------------------------------------
// `ink` and `field`: the lettering and what it sits on, where the label brings its own (the tape, the sticker). The Etched label has none:
// its lettering is `--shell-edge` mixed 35% toward white over whatever the shell is.
export const IDEA_LABELS = [
  { id: 'tape', name: 'Label tape', unlock: 'with the label', paid: 'paid', ink: '#f4f4f8', field: '#0a0a0e' },
  { id: 'etched', name: 'Etched', unlock: 'a line ten generations long', paid: 'free (earn)', edgeMix: 0.35 },
  { id: 'sticker', name: 'Sticker', unlock: '5 visitors greeted', paid: 'paid', ink: '#0b0b0e', field: 'skin' },
];
