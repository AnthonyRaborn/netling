// Wearables over the motion layers of Blank's elder (blank-motion.js) and Handler (rogue-motion.js signalMotion), through the real
// placeWorn, on both frames and all 12 steps. A measurement for review (docs/netling2/SPRITES_HANDOFF.md, Next phase item 3), not a rule.
// node prototype/netling2/wear-motion-audit.mjs
import './ready.js';
import { ACCESSORIES, placeWorn } from '../../src/accessories.js';
import { PALETTES } from '../../src/sim.js';
import { wetwareForms } from './wetware-models.js';
import { rogueForms } from './rogue-models.js';
const worn = ACCESSORIES.filter((a) => a.slot !== 'prop').map((a) => a.id);
const pal = PALETTES[0];
function check(form, label) {
  const out = [];
  for (const id of worn) {
    let floatMax = 0, coverMax = 0, holeMax = 0, n = 0;
    for (const fk of ['a', 'b']) {
      const sprite = form[fk];
      const anchors = form.anchors[fk] ?? form.anchors.a;
      for (let s = 0; s < 12; s++) {
        const time = s * 400 + 1;
        const m = form.motion(sprite, anchors, { time });
        const pad = (m[0].length - sprite[0].length) / 2;
        const pts = placeWorn([{ id }], sprite, { frame: fk === 'a' ? 0 : 1, time, pal }).flatMap((w) => w.pts);
        n = pts.length;
        // pixels that sat on or beside the registered body but now have only empty cells around them in the motion frame
        const at = (g, x, y, p) => g[y]?.[x + p] ?? '.';
        const near = (g, x, y, p) => [[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy]) => at(g, x+dx, y+dy, p) !== '.');
        const float = pts.filter((q) => near(sprite, q.x, q.y, 0) && !near(m, q.x, q.y, pad)).length;
        // motion-added cells (dub, arcs) that a wearable pixel covers
        const cover = pts.filter((q) => at(sprite, q.x, q.y, 0) === '.' && at(m, q.x, q.y, pad) !== '.').length;
        // wearable pixels sitting on a body cell turned into a hole
        const hole = pts.filter((q) => at(sprite, q.x, q.y, 0) !== '.' && at(m, q.x, q.y, pad) === '.').length;
        floatMax = Math.max(floatMax, float); coverMax = Math.max(coverMax, cover); holeMax = Math.max(holeMax, hole);
      }
    }
    out.push({ id, n, floatMax, coverMax, holeMax });
  }
  console.log(`\n${label}: wearable  pixels  floating(max)  covers-motion-cells(max)  on-holes(max)`);
  for (const r of out) if (r.floatMax || r.coverMax || r.holeMax) console.log(r.id.padEnd(14), r.n, r.floatMax, r.coverMax, r.holeMax);
  console.log('clean:', out.filter((r) => !r.floatMax && !r.coverMax && !r.holeMax).map((r) => r.id).join(' '));
}
const W = wetwareForms(); const R = rogueForms();
const blank = Object.values(W).find((f) => f.motion);
check(blank, `Blank elder (${blank.id})`);
const handler = R.rogueElderTune;
check(handler, `Handler (${handler.id})`);

// ---- Handler's arcs: the cells the arcs add (the signal layer minus its split shadow), and the wearables over them ----
import { splitMotion, ringsAt } from './rogue-motion.js';
const stepOf = (t) => Math.floor(t / 400) % 12;
const hh = rogueForms().rogueElderTune;
const worn2 = ACCESSORIES.filter((a) => a.slot !== 'prop').map((a) => a.id);
const base = splitMotion('elder');
const res = {};
for (const fk of ['a', 'b']) {
  const s = hh[fk]; const an = hh.anchors[fk] ?? hh.anchors.a;
  for (let st = 0; st < 12; st++) {
    const time = st * 400 + 1;
    const m = hh.motion(s, an, { time }); const b0 = base(s, an, { time });
    const pad = (m[0].length - s[0].length) / 2;
    const arc = []; m.forEach((r, y) => [...r].forEach((c, x) => { if (c !== b0[y][x]) arc.push([x - pad, y]); }));
    if (fk === 'a' && st < 6) console.log('step', st, 'rings', ringsAt(stepOf(time)), 'arc cells', JSON.stringify(arc));
    for (const id of worn2) {
      const pts = placeWorn([{ id }], s, { frame: fk === 'a' ? 0 : 1, time, pal: PALETTES[0] }).flatMap((w) => w.pts);
      const set = new Set(pts.map((p) => `${p.x},${p.y}`));
      const hit = arc.filter(([x, y]) => set.has(`${x},${y}`)).length;
      const touch = arc.filter(([x, y]) => [[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy]) => set.has(`${x+dx},${y+dy}`))).length;
      const r = (res[id] ??= { hit: 0, hitOf: 0, touch: 0 });
      r.hit = Math.max(r.hit, hit); r.touch = Math.max(r.touch, touch); r.hitOf = Math.max(r.hitOf, arc.length);
    }
  }
}
console.log('eye row', hh.anchors.a.eyeRow, 'anchors', JSON.stringify(hh.anchors.a));
for (const [id, r] of Object.entries(res)) if (r.hit || r.touch) console.log(id.padEnd(13), 'arc cells covered max', r.hit, 'of', r.hitOf, ' arc cells touching it max', r.touch);
const hp = placeWorn([{ id: 'headphones' }], hh.a, { pal: PALETTES[0] }).flatMap((w) => w.pts);
console.log('headphones pts', JSON.stringify(hp.map((p) => [p.x, p.y])));
