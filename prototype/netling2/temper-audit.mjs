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
import { temperTell, idleClock, driftWithin, BEAT_MS, HOLD_BEFORE_MS, HOLD_AFTER_MS } from './tell.js';
import { idleOffset, QUIRKS } from './idle.js';
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
      if ((tdy || tdx) && !offScreen(f, id, iy, 0, ix, 0) && offScreen(f, id, iy, tdy, ix, driftWithin(tdx, ix))) ids.add(id);
    }
    if (ids.size) { caused += ids.size; console.log(`   ${egg}/${f.id}: ${[...ids].join(', ')}`); }
  }
}
console.log(`   ${caused} form and wearable pairs\n`);

// --- 2. the idle hides a positional tell ------------------------------------------------------------------------------------------
// The idle model is idle.js (a copy of src/render.js). A beat is "clean" when the idle makes no row change from 200 ms before the
// settle to 600 ms after it (the hold window), so the settle is the only thing that moves.
console.log('2. Iron\'s settle (1 row down, 400 ms): share of beats with no idle row change from 200 ms before to 600 ms after,');
console.log('   with the idle running as in 1.0, and with the idle held on the beat (idleClock):');
for (const h of [11, 14, 15]) {
  for (const quirk of QUIRKS) {
    const cells = [];
    for (const level of [1, 2]) {
      const tally = { free: 0, held: 0, n: 0 };
      for (let t = BEAT_MS[level]; t < 20 * 60_000; t += BEAT_MS[level]) {
        tally.n++;
        for (const [key, clock] of [['free', (u) => u], ['held', (u) => idleClock({ egg: 'iron', level, time: u })]]) {
          const ys = new Set();
          for (let u = t - HOLD_BEFORE_MS; u <= t + HOLD_AFTER_MS; u += 50) ys.add(idleOffset(quirk, h, clock(u)).y).add(idleOffset(quirk, h, clock(u)).x * 100);
          if (ys.size <= 2) tally[key]++; // one y and one x
        }
      }
      cells.push(`${BEAT_MS[level] / 1000} s beat ${(100 * tally.free / tally.n).toFixed(0)}% -> ${(100 * tally.held / tally.n).toFixed(0)}%`);
    }
    console.log(`   ${String(h).padStart(2)} rows, ${quirk.padEnd(5)}: ${cells.join(', ')}`);
  }
}
// How much of the time the idle is paused.
for (const level of [1, 2]) console.log(`   idle paused ${(100 * (HOLD_BEFORE_MS + HOLD_AFTER_MS) / BEAT_MS[level]).toFixed(0)}% of the time at level +${level}`);
