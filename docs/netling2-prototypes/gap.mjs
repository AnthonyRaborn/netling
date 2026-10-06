import { ARCHETYPES, simulate } from './tools/balance.mjs';
import { CFG } from './src/sim.js';
const [name, feed, n] = [process.argv[2], Number(process.argv[3]), Number(process.argv[4] ?? 300)];
CFG.feedAllegiance = feed;
const p = ARCHETYPES[name];
const wOther = (g) => Math.min(4, Math.max(0, 5 - g));
const lead = (g) => 4 / (4 + wOther(g));
const acc = { teen: [], adult: [] };
for (let seed = 1; seed <= n; seed++) {
  const r = simulate(p, seed);
  if (r.atTeen) acc.teen.push(Math.abs(r.atTeen.axes.allegiance));
  if (r.atAdult) acc.adult.push(Math.abs(r.atAdult.axes.allegiance));
}
const sum = (a) => {
  const m = a.reduce((x, y) => x + y, 0) / a.length;
  return { n: a.length, meanGap: +m.toFixed(2), certain: +(a.filter((g) => g >= 5).length / a.length).toFixed(2), coin: +(a.filter((g) => g <= 1).length / a.length).toFixed(2), meanLeaderP: +(a.reduce((x, g) => x + lead(g), 0) / a.length).toFixed(2) };
};
console.log(JSON.stringify({ name, feed, teen: sum(acc.teen), adult: sum(acc.adult) }));
