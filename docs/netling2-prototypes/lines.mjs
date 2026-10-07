// Per-life data for long lineages on 1.0's unpatched simulator: runs by region, elder (mainframe) reached, Source exit.
import fs from 'fs';
import { ARCHETYPES, simulateLine } from './tools/balance.mjs';
import { RUN_CFG } from './src/netrun/run.js';
import { CFG } from './src/sim.js';
import { ROOT_FRAGMENT_IDS } from './src/netrun/codex.js';
// ROOT=nodeep (the 18 Root pages outside The Deep) or ROOT=sixteen (the first four of each of the four regions before The Deep).
if (process.env.ROOT === 'nodeep') ROOT_FRAGMENT_IDS.splice(0, ROOT_FRAGMENT_IDS.length, ...ROOT_FRAGMENT_IDS.filter((id) => !id.startsWith('deep')));
if (process.env.ROOT === 'sixteen') { const keep = ['public-1', 'public-2', 'public-3', 'public-4', 'corp-1', 'corp-2', 'corp-3', 'corp-4', 'bazaar-1', 'bazaar-2', 'bazaar-3', 'bazaar-5', 'ruins-1', 'ruins-2', 'ruins-3', 'ruins-4']; ROOT_FRAGMENT_IDS.splice(0, ROOT_FRAGMENT_IDS.length, ...keep); }
// Overrides: CAP (codexPerLife), EXITS and CLEAN (the elder feat), BEFORE (hours before the end of life that the elder gate opens), TAG (file suffix).
if (process.env.CAP) RUN_CFG.codexPerLife = Number(process.env.CAP);
if (process.env.EXITS) CFG.mainframeExits = Number(process.env.EXITS);
if (process.env.CLEAN) CFG.mainframeCleanExits = Number(process.env.CLEAN);
if (process.env.BEFORE) CFG.mainframeBeforeEndMin = Number(process.env.BEFORE) * 60;
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
fs.writeFileSync(`lines-${name}${process.env.TAG ?? ''}.json`, JSON.stringify(out));
const rl = out.map((l) => l.rootLife).filter((x) => x !== null);
console.log(name, 'lineages', n, 'rootLife median', rl.sort((a, b) => a - b)[Math.floor(rl.length / 2)], 'reached root', rl.length, 'elder lives share', (out.flatMap((l) => l.lives).filter((x) => x.elder).length / out.flatMap((l) => l.lives).length).toFixed(2));
