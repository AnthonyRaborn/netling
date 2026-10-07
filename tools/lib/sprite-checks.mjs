// Pure checks for the sprite review (docs/SPRITES.md). No DOM, no storage, no clock: the audit tool
// (tools/sprite-audit.mjs) and gallery.html both import this file, so a flag means the same in both.
// Everything here reports candidates. Whether a candidate is a real problem is a human call.

export const LCD = { w: 40, h: 28 };

// Where the always-on and event icons sit on the LCD (render.js): [x0, y0, x1, y1] inclusive.
// Virus at (2,2) 5x5; trace, attack and overflow icons at (2,2) or (9,2), up to 7 wide; the bang at (37,2); Z at (30,3+frame).
export const HUD_BOXES = {
  'virus/event icons': [2, 2, 15, 6],
  'attention bang': [37, 2, 37, 6],
  'sleep Z': [30, 3, 33, 7],
};

// Below this CIE76 distance two colors are treated as the same to the eye. Reference points (measured): the game's
// bright neons are far apart (#f9f002 vs #39ff14 is 66, #ff2a6d vs #b967ff is 83), a slightly lighter pink
// (#ff2a6d vs #ff5a8d) is 17, and the dimmed pet #1c3a3f against the room #0b2226 is 11 (lost) but against the dark
// room #03090a is 23 (just visible). The cutoff is a judgement call: tune it if the tool flags too much or too little.
export const SAME_COLOR = 18;

import { hexToRgb, rgbToHex, blend, deltaE } from '../../src/colors.js';
export { hexToRgb, rgbToHex, blend, deltaE };

export const sameColor = (a, b) => deltaE(a, b) < SAME_COLOR;

// A sprite (array of strings) as [{x, y, ch}] for each painted cell.
export function spriteCells(sprite) {
  const out = [];
  sprite.forEach((row, y) => [...row].forEach((ch, x) => ch !== '.' && out.push({ x, y, ch })));
  return out;
}

// Palette color for a sprite character, the way renderLCD maps them.
export const spriteColor = (ch, pal) => ({ '#': pal.main, o: pal.accent, '+': pal.mark ?? '#f5f5f5', x: blend(pal.main, 0.3, '#000000') })[ch];

// Run an accessory's draw function and collect its pixels in sprite-local coordinates.
// `anchors` is anchorsFor(sprite); `colors` is accessoryColors(id, custom) or null.
export function collectAccessory(acc, anchors, { frame = 0, time = 0, colors = null } = {}) {
  const pts = [];
  acc.draw((x, y, color) => pts.push({ x, y, color }), anchors, frame, time, colors);
  return pts;
}

export function extents(points) {
  if (!points.length) return null;
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}

// Which HUD boxes a set of LCD-space points touches.
export function hudHits(points) {
  const hits = new Set();
  for (const p of points) {
    for (const [name, [x0, y0, x1, y1]] of Object.entries(HUD_BOXES)) if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1) hits.add(name);
  }
  return [...hits];
}

export const offScreen = (points) => points.filter((p) => p.x < 0 || p.y < 0 || p.x >= LCD.w || p.y >= LCD.h);

// How much of a worn accessory the eye can still pick out.
// points: accessory pixels [{x, y, color, alpha?}] in any one coordinate space.
// body: pet pixels [{x, y, color}] in the same space. bg: the room color behind everything.
// A pixel is lost when it is the same color as what is under it (a covered pixel) or, when nothing is under it,
// the same color as the room or as a body pixel it touches (it merges into the silhouette).
export function lostPixels(points, body, bg) {
  const under = new Map(body.map((p) => [`${p.x},${p.y}`, p.color]));
  const lost = [];
  for (const p of points) {
    const shown = blend(p.color, p.alpha ?? 1, under.get(`${p.x},${p.y}`) ?? bg);
    const below = under.get(`${p.x},${p.y}`);
    let reason = null;
    if (below) {
      if (sameColor(shown, below)) reason = 'same color as the body under it';
    } else if (sameColor(shown, bg)) {
      reason = 'same color as the room';
    } else {
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const near = under.get(`${p.x + dx},${p.y + dy}`);
        if (near && sameColor(shown, near)) reason = 'merges into the body beside it';
      }
    }
    if (reason) lost.push({ ...p, reason });
  }
  return { lost, total: points.length, ratio: points.length ? lost.length / points.length : 0 };
}

const keySet = (pts) => new Set(pts.map((p) => `${p.x},${p.y}`));

// Overlap of two point sets over their union (0..1).
export function jaccard(a, b) {
  const A = keySet(a);
  const B = keySet(b);
  let both = 0;
  for (const k of A) if (B.has(k)) both++;
  const union = A.size + B.size - both;
  return union ? both / union : 1;
}

// Silhouette overlap of two sprites, each centred on its own bounding box (0..1). Ignores color and the eye, mouth
// and accent marks: only "is this cell painted".
export function silhouetteIou(spriteA, spriteB) {
  const place = (sprite) => {
    const cells = spriteCells(sprite);
    const e = extents(cells);
    const cx = (e.x0 + e.x1) / 2;
    const cy = (e.y0 + e.y1) / 2;
    return cells.map((c) => ({ x: Math.round(c.x - cx), y: Math.round(c.y - cy) }));
  };
  return jaccard(place(spriteA), place(spriteB));
}

// Number of cells that are painted in one sprite and not the other, after aligning both to the same top left (for
// two poses of one form, which share an origin in the game).
export function poseDistance(spriteA, spriteB) {
  const paint = (sprite) => new Set(spriteCells(sprite).map((c) => `${c.x},${c.y}`));
  const A = paint(spriteA);
  const B = paint(spriteB);
  let diff = 0;
  for (const k of A) if (!B.has(k)) diff++;
  for (const k of B) if (!A.has(k)) diff++;
  return diff;
}

// Cells that differ in which mark they carry ('#', 'o', '+') where both are painted: how much a recolor changes.
export function markDistance(spriteA, spriteB) {
  const map = (sprite) => new Map(spriteCells(sprite).map((c) => [`${c.x},${c.y}`, c.ch]));
  const A = map(spriteA);
  const B = map(spriteB);
  let diff = 0;
  for (const [k, ch] of A) if (B.has(k) && B.get(k) !== ch) diff++;
  return diff;
}
