// Temper level flips, state shares and decay variants, per archetype. Scratch driver (needs the patched copy plus the __sample hook).
//   VARIANT=minute|hour|sixh  (when decay is applied; BUGS tdecay must be 1)  GUARDS=0,0.25,0.5,1,1.5
import { ARCHETYPES, simulate } from './tools/balance.mjs';
import { CFG, inFlow, overclocked } from './src/sim.js';
const [name, n] = [process.argv[2], Number(process.argv[3] ?? 200)];
CFG.feedAllegiance = 0.25; CFG.maxMistakes = 1e9; CFG.flowStabilityPerHour = Number(process.env.FLOW ?? 0.5);
const VARIANT = process.env.VARIANT ?? 'minute';
const D = 0.999519; // 24 h half-life per minute
const GUARDS = (process.env.GUARDS ?? '0,0.25,0.5,1,1.5').split(',').map(Number);
const TH = [-6, -2, 3, 6], LEVELS = [-2, -1, 0, 1, 2];
const raw = (t) => LEVELS[TH.filter((x) => t >= x).length];
const guarded = (t, cur, g) => { const up = LEVELS[TH.filter((x) => t >= x + g).length], down = LEVELS[TH.filter((x) => t >= x - g).length]; return cur < up ? up : cur > down ? down : cur; };
const shown = Object.fromEntries(GUARDS.map((g) => [g, { adult: {}, end: {} }]));
const out = { share: { flow: 0, oc: 0, hot: 0, alert: 0, calm: 0, awake: 0 }, flips: Object.fromEntries(GUARDS.map((g) => [g, { flips: 0, rev: 0, hours: 0 }])), lv: { teen: {}, adult: {}, end: {} } };
const add = (o, k) => { o[k] = (o[k] ?? 0) + 1; };
let lives = 0;
for (let seed = 1; seed <= n; seed++) {
  const cur = Object.fromEntries(GUARDS.map((g) => [g, 0]));
  const hist = Object.fromEntries(GUARDS.map((g) => [g, []]));
  let sawTeen = false, sawAdult = false, last = 0, adultAt = false;
  globalThis.__sample = (s, minute) => {
    if (VARIANT === 'minute') s.axes.stability *= D;
    else if (VARIANT === 'hour') { if (minute % 60 === 0) s.axes.stability *= D ** 60; }
    else if (VARIANT === 'sixh') { if (minute % 360 === 0) s.axes.stability *= D ** 360; }
    else if (VARIANT === 'none') {}
    const t = s.axes.stability; last = t;
    if (!sawTeen && s.stage === 'teen') { sawTeen = true; add(out.lv.teen, raw(t)); }
    if (!sawAdult && s.stage === 'adult') { sawAdult = true; add(out.lv.adult, raw(t)); adultAt = true; for (const g of GUARDS) add(shown[g].adult, cur[g]); }
    if (s.asleep || s.stage === 'dead') return;
    out.share.awake++;
    if (s.stats.heat >= 85) out.share.hot++;
    else if (overclocked(s)) out.share.oc++;
    else if (inFlow(s)) out.share.flow++;
    else out.share.calm++;
    for (const g of GUARDS) {
      const next = guarded(t, cur[g], g);
      if (next !== cur[g]) {
        out.flips[g].flips++;
        const h = hist[g]; h.push({ m: minute, from: cur[g], to: next });
        if (h.length >= 2 && h[h.length - 2].from === next && minute - h[h.length - 2].m <= 180) out.flips[g].rev++;
        cur[g] = next;
      }
    }
  };
  const r = simulate({ ...ARCHETYPES[name] }, seed);
  add(out.lv.end, raw(last));
  for (const g of GUARDS) add(shown[g].end, cur[g]);
  lives++;
  out.share.awakeHours = (out.share.awakeHours ?? 0);
}
const pct = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, +(100 * v / lives).toFixed(0)]));
const A = out.share.awake;
console.log(JSON.stringify({ name, variant: VARIANT, lives,
  awakeShare: Object.fromEntries(['flow', 'oc', 'hot', 'calm'].map((k) => [k, +(100 * out.share[k] / A).toFixed(0)])),
  flipsPerLife: Object.fromEntries(GUARDS.map((g) => [g, { flips: +(out.flips[g].flips / lives).toFixed(1), reversalsWithin3h: +(out.flips[g].rev / lives).toFixed(1) }])),
  shownAdult: Object.fromEntries(GUARDS.map((g) => [g, pct(shown[g].adult)])), shownEnd: Object.fromEntries(GUARDS.map((g) => [g, pct(shown[g].end)])), lvTeen: pct(out.lv.teen), lvAdult: pct(out.lv.adult), lvEnd: pct(out.lv.end) }));
