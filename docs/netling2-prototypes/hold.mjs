// Time spent at each displayed temper level (guard 1.0) and the longest unbroken run at the strong levels, per archetype.
import { ARCHETYPES, simulate } from './tools/balance.mjs';
import { CFG } from './src/sim.js';
const [name, n] = [process.argv[2], Number(process.argv[3] ?? 200)];
CFG.feedAllegiance = 0.25; CFG.maxMistakes = 1e9; CFG.flowStabilityPerHour = 0.5;
const D = 0.999519, TH = [-6, -2, 3, 6], LV = [-2, -1, 0, 1, 2], G = 1;
const guarded = (t, cur) => { const up = LV[TH.filter((x) => t >= x + G).length], down = LV[TH.filter((x) => t >= x - G).length]; return cur < up ? up : cur > down ? down : cur; };
const res = { mins: { '-2': 0, '-1': 0, '0': 0, '1': 0, '2': 0 }, first2: [], firstm2: [], run12: 0, run24: 0, runm12: 0, runm24: 0, lives: 0, awake: 0 };
for (let seed = 1; seed <= n; seed++) {
  let cur = 0, run = 0, best = 0, runm = 0, bestm = 0, f2 = null, fm2 = null;
  globalThis.__sample = (s, minute) => {
    s.axes.stability *= D;
    if (s.asleep || s.stage === 'dead') return;
    cur = guarded(s.axes.stability, cur);
    res.mins[cur]++; res.awake++;
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
