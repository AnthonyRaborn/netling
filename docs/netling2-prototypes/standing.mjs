import { ARCHETYPES, simulate } from './tools/balance.mjs';
import { CFG } from './src/sim.js';
const [name, n] = [process.argv[2], Number(process.argv[3] ?? 200)];
CFG.feedAllegiance = 0.25; CFG.maxMistakes = 1e9;
const rs = [];
for (let seed = 1; seed <= n; seed++) rs.push(simulate(ARCHETYPES[name], seed));
const mean = (a) => +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(2);
const share = (a, t) => +(a.filter((x) => x >= t).length / a.length).toFixed(2);
const T = rs.filter((r) => r.atTeen).map((r) => r.atTeen.standing), A = rs.filter((r) => r.atAdult).map((r) => r.atAdult.standing), E = rs.map((r) => r.standingEnd);
const hi = (arr) => arr.map((s) => Math.max(s.corp, s.street)), lo = (arr) => arr.map((s) => Math.min(s.corp, s.street));
const o = { name, n, runs: mean(rs.map((r) => r.runs)), anomalies: mean(rs.map((r) => r.anomalies)),
  teen: { hi: mean(hi(T)), lo: mean(lo(T)), hi2: share(hi(T), 2), hi3: share(hi(T), 3) },
  adult: { hi: mean(hi(A)), lo: mean(lo(A)), hi2: share(hi(A), 2), hi3: share(hi(A), 3), lo2: share(lo(A), 2) },
  end: { hi: mean(hi(E)), lo: mean(lo(E)), hi2: share(hi(E), 2), hi3: share(hi(E), 3), lo2: share(lo(E), 2), lo3: share(lo(E), 3) } };
console.log(JSON.stringify(o));
