// Time spent at each displayed temper level (guard 1.0) and the longest unbroken run at the strong levels, per archetype.
import { ARCHETYPES, simulate } from './tools/balance.mjs';
import { CFG } from './src/sim.js';
const [name, n] = [process.argv[2], Number(process.argv[3] ?? 200)];
CFG.feedAllegiance = 0.25; CFG.maxMistakes = 1e9; CFG.flowStabilityPerHour = 0.5;
const D = 0.999519, TH = [-6, -2, 3, 6], LV = [-2, -1, 0, 1, 2], G = 1;
const guarded = (t, cur) => { const up = LV[TH.filter((x) => t >= x + G).length], down = LV[TH.filter((x) => t >= x - G).length]; return cur < up ? up : cur > down ? down : cur; };
// NEG: the neglect level (needs.js: 2 = a need past its alert line, or two past their soft lines; 1 = one past a soft line) at or above
// which an awake minute does not count toward a hold. Default off. NEGMODE=pause (the clock stops) or reset (the run starts over).
const NEG = Number(process.env.NEG ?? 99), NEGMODE = process.env.NEGMODE ?? 'pause';
const LINES = { charge: [40, 20, 'under'], sync: [40, 20, 'under'], integrity: [60, 30, 'under'], heat: [CFG.overclockHeat, 80, 'over'] };
const neglectLevel = (st) => { let soft = 0, alert = false; for (const [k, [sl, al, dir]] of Object.entries(LINES)) { const v = st[k]; if (dir === 'under' ? v < al : v > al) alert = true; if (dir === 'under' ? v < sl : v > sl) soft++; } return alert || soft >= 2 ? 2 : soft ? 1 : 0; };
const res = { mins: { '-2': 0, '-1': 0, '0': 0, '1': 0, '2': 0 }, first2: [], firstm2: [], run12: 0, run24: 0, runm12: 0, runm24: 0, lives: 0, awake: 0 };
for (let seed = 1; seed <= n; seed++) {
  let cur = 0, run = 0, best = 0, runm = 0, bestm = 0, f2 = null, fm2 = null;
  globalThis.__sample = (s, minute) => {
    s.axes.stability *= D;
    if (s.asleep || s.stage === 'dead') return;
    cur = guarded(s.axes.stability, cur);
    res.mins[cur]++; res.awake++;
    if (neglectLevel(s.stats) >= NEG) { if (NEGMODE === 'reset') { run = 0; runm = 0; } return; }
    if (cur === 2) { run++; best = Math.max(best, run); if (f2 === null) f2 = s.ageMin / 1440; } else run = 0;
    if (cur === -2) { runm++; bestm = Math.max(bestm, runm); if (fm2 === null) fm2 = s.ageMin / 1440; } else runm = 0;
  };
  simulate({ ...ARCHETYPES[name] }, seed);
  res.lives++; if (f2 !== null) res.first2.push(f2); if (fm2 !== null) res.firstm2.push(fm2);
  if (best >= 720) res.run12++; if (best >= 1440) res.run24++; if (bestm >= 720) res.runm12++; if (bestm >= 1440) res.runm24++;
}
const med = (a) => { if (!a.length) return null; a = [...a].sort((x, y) => x - y); return +a[Math.floor(a.length / 2)].toFixed(1); };
const L = res.lives, p = (x) => Math.round((100 * x) / L);
console.log(JSON.stringify({ name, awakeShare: Object.fromEntries(Object.entries(res.mins).map(([k, v]) => [k, Math.round((100 * v) / res.awake)])), reachedStrongSteady: p(res.first2.length), medianDay: med(res.first2), held12h: p(res.run12), held24h: p(res.run24), reachedStrongUnsteady: p(res.firstm2.length), medianDayU: med(res.firstm2), heldU12h: p(res.runm12), heldU24h: p(res.runm24) }));
