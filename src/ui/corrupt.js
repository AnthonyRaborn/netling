// Corrupted records and sectors (the Source while it is locked, the mainframe forms until Root Access). Every BLINK_MS,
// each `.corrupt` element slips sideways for GLITCH_MS with some of its letters swapped for block glyphs, and each static
// thumbnail (`canvas.static`) re-rolls its noise, a band of it shifted sideways and a step brighter for the same moment.
// That is two changes 0.4 s apart every 3.2 s, well under the three-flashes-a-second limit (CLAUDE.md rule 7). With
// motion calmed, nothing moves. Nothing here touches the DOM until startCorruptBlink() is called, so tests can import the
// pure parts.
import { drawSprite, LOCKED_COLORS } from '../sprites.js';

export const BLINK_MS = 3200;
export const GLITCH_MS = 400;
export const STATIC_SIZE = [14, 12]; // columns, rows: inside the 18x16 thumbnail

const BLOCKS = '░▒▓█';
const LOOKALIKE = { O: '0', E: '3', A: '4', I: '1', S: '5', T: '7', B: '8' };
const isLetter = (c) => /[A-Za-z0-9]/.test(c);

// `text` with about `share` of its letters and digits swapped for block glyphs or look-alike digits; brackets, spaces and
// punctuation stay, so the shape of the line holds. At least two change, so a blink always reads as damage.
export function garble(text, rng = Math.random, share = 0.3) {
  const chars = [...text];
  const block = () => BLOCKS[Math.floor(rng() * BLOCKS.length)];
  const swap = (c) => (LOOKALIKE[c.toUpperCase()] && rng() < 0.5 ? LOOKALIKE[c.toUpperCase()] : block());
  const out = chars.map((c) => (isLetter(c) && rng() < share ? swap(c) : c));
  const letters = chars.map((c, i) => (isLetter(c) ? i : -1)).filter((i) => i >= 0);
  const changed = () => letters.filter((i) => out[i] !== chars[i]).length;
  while (changed() < Math.min(2, letters.length)) out[letters[Math.floor(rng() * letters.length)]] = block();
  return out.join('');
}

// A fresh field of static ('#' lit, '.' dark), about two cells in five lit. With `band`, three of its rows slide sideways.
export function staticRows(rng = Math.random, { band = false } = {}) {
  const [w, h] = STATIC_SIZE;
  const rows = Array.from({ length: h }, () => Array.from({ length: w }, () => (rng() < 0.4 ? '#' : '.')).join(''));
  return band ? shiftBand(rows, Math.floor(rng() * (h - 3)), 2 + Math.floor(rng() * 3)) : rows;
}

// Rows y0..y0+2 rotated `by` columns to the right.
export function shiftBand(rows, y0, by) {
  return rows.map((r, y) => (y >= y0 && y < y0 + 3 ? r.slice(-by) + r.slice(0, -by) : r));
}

// The static is drawn in the dim locked-form color; during a blink, one step brighter, so the re-roll shows.
const BLINK_COLORS = { '#': '#2f6b73' };
export function drawStatic(canvas, rows, { lit = false } = {}) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawSprite(ctx, rows, Math.floor((canvas.width - rows[0].length) / 2), canvas.height - rows.length, lit ? BLINK_COLORS : LOCKED_COLORS);
}

const calm = () =>
  document.body.classList.contains('calm') ||
  (matchMedia('(prefers-reduced-motion: reduce)').matches && !document.body.classList.contains('motion-full'));

function blink() {
  if (document.hidden || calm()) return;
  const words = [...document.querySelectorAll('.corrupt')];
  const screens = [...document.querySelectorAll('canvas.static')];
  for (const el of words) {
    el.dataset.text ??= el.textContent;
    el.textContent = garble(el.dataset.text);
    el.classList.add('glitching');
  }
  const fresh = screens.map((c) => {
    const rows = staticRows();
    drawStatic(c, shiftBand(rows, Math.floor(Math.random() * (STATIC_SIZE[1] - 3)), 3), { lit: true });
    return rows;
  });
  setTimeout(() => {
    for (const el of words) {
      // An entry that repaired itself meanwhile (the Source opening) keeps its new name.
      if (el.classList.contains('corrupt')) el.textContent = el.dataset.text;
      el.classList.remove('glitching');
    }
    screens.forEach((c, i) => drawStatic(c, fresh[i]));
  }, GLITCH_MS);
}

export function startCorruptBlink() {
  setInterval(blink, BLINK_MS);
}
