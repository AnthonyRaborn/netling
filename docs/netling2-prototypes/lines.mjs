// Per-life data for long lineages on 1.0's unpatched simulator: runs by region, elder (mainframe) reached, Source exit.
import fs from 'fs';
import { ARCHETYPES, simulateLine } from './tools/balance.mjs';
const [name, n, lives] = [process.argv[2], Number(process.argv[3] ?? 150), Number(process.argv[4] ?? 14)];
const out = [];
for (let seed = 1; seed <= n; seed++) {
  const line = simulateLine({ ...ARCHETYPES[name] }, seed, lives);
  out.push({ rootLife: line.codexLife, lives: line.lives.map((r) => ({
    nd: ['public', 'bazaar', 'corp', 'ruins'].reduce((a, k) => a + (r.regionRuns[k] ?? 0), 0),
    deep: r.regionRuns.deep ?? 0, source: r.regionRuns.source ?? 0,
    exit: r.cleared.includes('source'), elder: (r.stageDays?.mainframe ?? 0) > 0,
  })) });
}
fs.writeFileSync(`lines-${name}.json`, JSON.stringify(out));
const rl = out.map((l) => l.rootLife).filter((x) => x !== null);
console.log(name, 'lineages', n, 'rootLife median', rl.sort((a, b) => a - b)[Math.floor(rl.length / 2)], 'reached root', rl.length, 'elder lives share', (out.flatMap((l) => l.lives).filter((x) => x.elder).length / out.flatMap((l) => l.lives).length).toFixed(2));
