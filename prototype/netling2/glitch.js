// What bugs look like (docs/NETLING_2_SKETCH.md, Bugs): glitches on the sprite. A bug is a count from 0 to 5 that stays until it
// is cleared (scrip, Standing or a netrun debug station), so the look is PERSISTENT: a pure function of the bug count, with
// nothing about time in the part you can always read. Each bug tears one row of the body a column sideways, in a fixed order,
// so a new bug adds a tear and clearing one removes the last, and a count can be read at a glance. Neglect (needs.js) is a
// different channel: marks, and transient.
//
// In motion, a bugged netling also twitches: every 3 seconds one more row tears two columns for 400 ms (two flash slots). Under
// reduced motion only the still tears remain, so the state is fully readable without any movement. Nothing here changes faster
// than the 200 ms flash slot, so nothing flashes.
import { FLASH_TOGGLE_MS } from '../../src/games/common.js';

export const MAX_BUGS = 5; // the sketch's ceiling
export const TWITCH_EVERY_MS = 3000;
export const TWITCH_MS = FLASH_TOGGLE_MS * 2;

const hash = (n, seed) => {
  let h = Math.imul((n * 2654435761) ^ (seed * 40503), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

// Rows that can tear: not the eyes, and with a free column at both ends so a shift loses no cell.
export function tearRows(sprite, anchors) {
  const w = sprite[0].length;
  return sprite.map((row, y) => y).filter((y) => {
    const row = sprite[y];
    return y !== anchors.eyeRow && y !== anchors.eyeRow + 1 && /[^.]/.test(row) && row[0] === '.' && row[w - 1] === '.';
  });
}
// The order bugs take rows in: a fixed shuffle per sprite and seed, so bug n is always the same row.
const order = (rows, seed) => [...rows].sort((a, b) => hash(a, seed) - hash(b, seed) || a - b);

const shift = (row, d) => (d > 0 ? '.'.repeat(d) + row.slice(0, row.length - d) : row.slice(-d) + '.'.repeat(-d));

// -> a new sprite with `bugs` rows torn (the sprite itself when there are none and no twitch).
export function glitched(sprite, anchors, bugs, { time = 0, reduced = false, seed = 0 } = {}) {
  const n = Math.min(MAX_BUGS, Math.max(0, Math.floor(bugs)));
  if (!n) return sprite;
  const rows = order(tearRows(sprite, anchors), seed);
  const out = [...sprite];
  rows.slice(0, n).forEach((y, i) => (out[y] = shift(sprite[y], hash(y + 17 * i, seed) < 0.5 ? -1 : 1)));
  if (!reduced && rows.length > n && time % TWITCH_EVERY_MS < TWITCH_MS) {
    // The twitching row is the next in line, so it is never one of the still tears.
    const y = rows[n + (Math.floor(time / TWITCH_EVERY_MS) % Math.max(1, rows.length - n))];
    out[y] = shift(sprite[y], hash(y, seed + 5) < 0.5 ? -2 : 2);
  }
  return out;
}
