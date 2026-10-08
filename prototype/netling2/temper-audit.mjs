// The temper pass audit (docs/NETLING_2_SPRITES.md, Next phase 3). `node prototype/netling2/temper-audit.mjs` (or npm run proto:temper).
// Measurements, not rules; the rules are tested in temper-pass.test.js and proto.test.js.
//   1. Which wearables the tell pushes off the 40x28 screen that 1.0's idle alone does not (idle extremes: 8 columns, rows from
//      the render.js headroom rule), on every form of its own egg.
//   2. How often 1.0's idle wander hides a positional tell: the Iron settle (one row down for 400 ms on the beat) and the drift.
// The idle model below is a copy of src/render.js (wanderPos, sway, hover); keep them in step.
import './ready.js';
import { forms } from './models.js';
import { programForms } from './program-models.js';
import { wetwareForms } from './wetware-models.js';
import { temperTell, BEAT_MS } from './tell.js';
import { placeWorn, ACCESSORIES } from '../../src/accessories.js';

const LCD = { w: 40, h: 28 };
const sets = { iron: forms('B'), program: programForms(), wetware: wetwareForms() };
const wear = ACCESSORIES.filter((a) => a.slot !== 'prop').map((a) => a.id);

// --- 1. clipping caused by the tell -----------------------------------------------------------------------------------------------
const extremes = (egg) => {
  const r = { dx: new Set([0]), dy: new Set([0]) };
  for (const level of [-2, -1, 1, 2]) for (let t = 0; t < 24_000; t += 50) { const x = temperTell({ egg, level, time: t, seed: 4 }); r.dx.add(x.dx); r.dy.add(x.dy); }
  return { dx: [...r.dx], dy: [...r.dy] };
};
const offScreen = (f, id, idleY, tdy, idleX, tdx) => {
  const w = f.a[0].length;
  const oy = 20 - f.a.length + idleY + tdy;
  const ox = Math.floor((LCD.w - w) / 2) + idleX + tdx;
  const pts = placeWorn([{ id }], f.a, { minRow: -oy })[0].pts;
  return Math.min(...pts.map((p) => p.y)) + oy < 0 || Math.max(...pts.map((p) => p.y)) + oy >= LCD.h || Math.min(...pts.map((p) => p.x)) + ox < 0 || Math.max(...pts.map((p) => p.x)) + ox >= LCD.w;
};
console.log('1. Wearables the tell clips that 1.0\'s idle alone does not (idle at its extremes, tell at its extremes):');
let caused = 0;
for (const [egg, set] of Object.entries(sets)) {
  const e = extremes(egg);
  for (const f of Object.values(set)) {
    const up = Math.max(0, Math.min(3, 20 - f.a.length - 5));
    const ids = new Set();
    for (const id of wear) for (const iy of [-up, 1]) for (const ix of [-8, 8]) for (const tdy of e.dy) for (const tdx of e.dx) {
      if ((tdy || tdx) && !offScreen(f, id, iy, 0, ix, 0) && offScreen(f, id, iy, tdy, ix, tdx)) ids.add(id);
    }
    if (ids.size) { caused += ids.size; console.log(`   ${egg}/${f.id}: ${[...ids].join(', ')}`); }
  }
}
console.log(`   ${caused} form and wearable pairs\n`);

// --- 2. the idle hides a positional tell ------------------------------------------------------------------------------------------
const spot = (k) => { const h = Math.imul(k ^ 0x9e3779b9, 0x85ebca6b) >>> 0; return { x: (h % 17) - 8, y: ((h >>> 8) % 101) / 100 }; };
const wander = (time) => { const k = Math.floor(time / 5000); const t = Math.min(1, (time - k * 5000) / 2200); const a = spot(k - 1); const b = spot(k); return { x: Math.round(a.x + (b.x - a.x) * t), y: a.y + (b.y - a.y) * t, moving: t < 1 && a.x !== b.x }; };
const idle = (quirk, h, time) => {
  const y0 = 20 - h;
  const up = Math.max(0, Math.min(3, y0 - 5));
  const frame = Math.floor(time / 500) % 2;
  const depth = (p) => Math.round(((Math.sin(time / p) + 1) / 2) * (up + 1)) - up;
  if (quirk === 'sway') return { x: Math.round(Math.sin(time / 1500) * 8), y: depth(2300) };
  if (quirk === 'hover') return { x: Math.round(Math.sin(time / 2600) * 7), y: Math.max(-up, Math.round(Math.sin(time / 600) * 2) - 1) };
  const w = wander(time);
  return { x: w.x, y: Math.max(-up, Math.round(w.y * (up + 1)) - up + (w.moving && !frame ? -1 : 0)) };
};
console.log('2. Iron\'s settle (1 row down, 400 ms) against 1.0\'s idle: share of beats with no idle row change from 300 ms before to 700 ms after,');
console.log('   and idle row changes per 6 s (the settle is one more row change among them):');
for (const h of [11, 14, 15]) {
  for (const quirk of ['sway', 'hover', 'walk']) {
    const cells = [];
    for (const level of [1, 2]) {
      let clean = 0;
      let n = 0;
      for (let t = BEAT_MS[level]; t < 20 * 60_000; t += BEAT_MS[level]) {
        n++;
        const ys = new Set();
        for (let u = t - 300; u <= t + 700; u += 50) ys.add(idle(quirk, h, u).y);
        if (ys.size === 1) clean++;
      }
      cells.push(`${BEAT_MS[level] / 1000} s beat ${(100 * clean / n).toFixed(0)}%`);
    }
    let changes = 0;
    let last = idle(quirk, h, 0).y;
    for (let u = 50; u < 600_000; u += 50) { const y = idle(quirk, h, u).y; if (y !== last) changes++; last = y; }
    let moving = 0;
    let lastX = idle(quirk, h, 0).x;
    for (let u = 50; u < 600_000; u += 50) { const x = idle(quirk, h, u).x; if (x !== lastX) moving++; lastX = x; }
    console.log(`   ${String(h).padStart(2)} rows, ${quirk.padEnd(5)}: ${cells.join(', ')}; ${(changes / 100).toFixed(1)} row changes per 6 s; sideways during ${(100 * moving / 12000).toFixed(0)}% of 50 ms steps`);
  }
}
