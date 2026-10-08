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

// How far each row may tear: the free columns on each side of its paint, inside the sprite's frame (so a tear never loses a cell
// or leaves the picture; one free side is enough, the row goes that way). The eye rows never tear. A row with paint on both
// frame edges (spikes) has no room; it can still WRAP (rotate a column, the cell that leaves one side comes in at the other,
// the classic scanline glitch), used only after every row with room is taken.
// -> { y: { '-1': columns free on the left, '1': columns free on the right } } for every row that can glitch.
export function tearOptions(sprite, anchors) {
  const out = {};
  sprite.forEach((row, y) => {
    if (y === anchors.eyeRow || y === anchors.eyeRow + 1) return;
    let first = row.length;
    let last = -1;
    for (let x = 0; x < row.length; x++) if (row[x] !== '.') { first = Math.min(first, x); last = x; }
    if (last < 0) return;
    out[y] = { '-1': first, 1: row.length - 1 - last };
  });
  return out;
}
const hasRoom = (room) => room[-1] > 0 || room[1] > 0;
export const tearRows = (sprite, anchors) => Object.keys(tearOptions(sprite, anchors)).map(Number);
// The order bugs take rows in: a fixed shuffle per sprite and seed, so bug n is always the same row. Rows with room come first.
const order = (options, seed) => Object.keys(options).map(Number).sort((a, b) => hasRoom(options[b]) - hasRoom(options[a]) || hash(a, seed) - hash(b, seed) || a - b);

const shift = (row, d) => (d > 0 ? '.'.repeat(d) + row.slice(0, row.length - d) : row.slice(-d) + '.'.repeat(-d));
const wrap = (row, d) => (d > 0 ? row.slice(-d) + row.slice(0, row.length - d) : row.slice(-d) + row.slice(0, -d));
// Which way a row goes: toward a side with room, by the hash when both (or neither) have it.
const direction = (room, y, seed) => (room[-1] > 0 && room[1] > 0) || !hasRoom(room) ? (hash(y, seed) < 0.5 ? -1 : 1) : room[-1] > 0 ? -1 : 1;
const tear = (row, room, d, reach = 1) => (hasRoom(room) ? shift(row, d * Math.min(reach, room[d])) : wrap(row, d));
// The twitch moves up to two columns on adults and elders and one on the small forms (baby 12 wide, teens 14), where two is a sixth of the body.
export const SMALL_WIDTH = 14;

// -> a new sprite with `bugs` rows torn (the sprite itself when there are none and no twitch).
export function glitched(sprite, anchors, bugs, { time = 0, reduced = false, seed = 0 } = {}) {
  const n = Math.min(MAX_BUGS, Math.max(0, Math.floor(bugs)));
  if (!n) return sprite;
  const options = tearOptions(sprite, anchors);
  const rows = order(options, seed);
  const out = [...sprite];
  rows.slice(0, n).forEach((y, i) => { const d = direction(options[y], y + 17 * i, seed); out[y] = tear(sprite[y], options[y], d); });
  if (!reduced && rows.length > n && time % TWITCH_EVERY_MS < TWITCH_MS) {
    // The twitching row is the next in line, so it is never one of the still tears.
    const y = rows[n + (Math.floor(time / TWITCH_EVERY_MS) % Math.max(1, rows.length - n))];
    const d = direction(options[y], y, seed + 5);
    out[y] = tear(sprite[y], options[y], d, sprite[0].length <= SMALL_WIDTH ? 1 : 2);
  }
  return out;
}
