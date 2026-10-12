// The holologo clip (1.0's open decision; docs/NETLING_2_SPRITES_HISTORY.md, "The holologo clip") on every 2.0 form through the 2.0
// renderer (render.js), against three options drawn here only: now (1.0, a.top - 4), lower (a.top - 3), clamp (1.0's position pushed
// down only on the frames where it would leave the screen). 1.0's idles sway, hover and walk, sampled every 100 ms. src/ is untouched.
// Since the headroom (render.js TOP, 2026-10-12) nothing leaves the 2.0 screen: `clipped` counts rows above 1.0's top edge (row TOP),
// where it would have been cut on 1.0's 28 row screen, and `off` the 2.0 screen's own top.
// SECS=60 node prototype/netling2/holologo-audit.mjs
import './ready.js';
import { ACCESSORIES, placeWorn, anchorsFor } from '../../src/accessories.js';
import { composeLCD, TOP } from './render.js';
import { forms } from './models.js';
import { programForms } from './program-models.js';
import { wetwareForms } from './wetware-models.js';
import { rogueForms } from './rogue-models.js';
const holo = ACCESSORIES.find((a) => a.id === 'holologo');
const orig = holo.draw;
const eggs = { iron: forms('B'), program: programForms(), wetware: wetwareForms(), rogue: rogueForms() };
const T = Number(process.env.SECS ?? 120) * 1000;
const opts = ['now', 'lower', 'clamp'];
for (const [egg, fs] of Object.entries(eggs)) {
  for (const level of egg === 'program' ? [0, -2] : egg === 'iron' ? [0, -2] : [0]) {
    const agg = Object.fromEntries(opts.map((o) => [o, { clip: 0, touch: 0, n: 0, forms: new Set(), runs: 0 }]));
    for (const f of Object.values(fs)) for (const idle of ['sway', 'hover', 'walk']) {
      for (let t = 0; t < T; t += 100) {
        const sc = composeLCD({ form: f, egg, level, idle, worn: [{ id: 'holologo' }], seed: 7 }, t);
        const w = sc.ops.find((o) => o.op === 'worn'); if (!w) continue;
        for (const o of opts) {
          holo.draw = o === 'lower' ? (px, a, fr) => orig((x, y, c) => px(x, y + 1, c), a, fr) : orig;
          let pts = placeWorn(w.list, w.sprite, { frame: w.frame, time: t, minRow: -w.y })[0].pts;
          if (o === 'clamp') { const m = Math.min(...pts.map((p) => p.y + w.y)); if (m < TOP) pts = pts.map((p) => ({ ...p, y: p.y - m + TOP })); }
          const clip = pts.some((p) => p.y + w.y < TOP);
          if (pts.some((p) => p.y + w.y < 0)) agg[o].off = (agg[o].off ?? 0) + 1;
          const s = w.sprite;
          const over = pts.some((p) => (s[p.y]?.[p.x] ?? '.') !== '.'); if (over) (agg[o].over = (agg[o].over ?? 0) + 1);
          const touch = pts.some((p) => [[0, 1], [1, 0], [-1, 0]].some(([dx, dy]) => (s[p.y + dy]?.[p.x + dx] ?? '.') !== '.'));
          const g = agg[o]; g.n++; if (clip) { g.clip++; g.forms.add(f.id); } if (touch) g.touch++;
        }
      }
    }
    holo.draw = orig;
    console.log(`${egg} level ${level}: forms ${Object.keys(fs).length}`);
    for (const o of opts) { const g = agg[o]; console.log(`  ${o.padEnd(6)} clipped ${(100 * g.clip / g.n).toFixed(1)}% of samples on ${g.forms.size} forms; touching ${(100 * g.touch / g.n).toFixed(1)}%, on the sprite ${(100 * (g.over ?? 0) / g.n).toFixed(1)}%; off the 2.0 screen ${(100 * (g.off ?? 0) / g.n).toFixed(1)}%`); }
  }
}
