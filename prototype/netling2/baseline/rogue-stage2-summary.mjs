// Rogue, simulator stage 2: reads results/followup/rogue-s2-*.json (rogue-stage2.mjs) and, as the "no hunt" row, rogue-72-lock4-quiet8-hide-flow.json
// (the decided home rules with no hunt in runs), and prints one row per setting for the attentive group (the 26 hourly archetypes): full life,
// captured (mean and worst), marks by source, hunter fights and ambushes met and lost, runs and disconnects a life, the Deep cleared and the elder
// gate met. Usage: node prototype/netling2/baseline/rogue-stage2-summary.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = join(dirname(fileURLToPath(import.meta.url)), 'results', 'followup');
const load = (f) => JSON.parse(readFileSync(join(dir, f), 'utf8')).archetypes;
const OUT = new Set(['corpo', 'runner', 'overclocker', 'casual', 'worker', 'hunter-casual', 'human-casual', 'human-regular', 'human-keen', 'human-bursty', 'neglectful']);
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const rows = [['no hunt in runs (stage 1 runs, decided home rules)', 'rogue-72-lock4-quiet8-hide-flow.json'], ...readdirSync(dir).filter((f) => /^rogue-s2-.*\.json$/.test(f)).sort().map((f) => [f.slice(9, -5), f])];
const ATT = Object.keys(load(rows[0][1])).filter((n) => !OUT.has(n));
const pct = (x) => (x * 100).toFixed(1);
console.log(`Attentive group: ${ATT.length} archetypes.\n`);
console.log('| setting | full life | captured (mean / worst) | marks: home / hunter / ambush | hunters met (lost) | ambushes met (lost) | runs (disconnects) | Deep cleared | elder.mainframe.met |');
console.log('|---|---|---|---|---|---|---|---|---|');
for (const [label, f] of rows) {
  const R = load(f);
  const a = (get) => mean(ATT.map((n) => get(R[n]) ?? 0));
  const cap = ATT.map((n) => R[n].rogue.captured);
  const ms = (k) => a((r) => r.rogue.markSources[k] ?? 0);
  const h = (k) => a((r) => r.rogue.hunt?.[k] ?? 0);
  console.log(`| ${label} | ${pct(a((r) => r.fullLife))} | ${pct(mean(cap))} / ${pct(Math.max(...cap))} | ${(ms('sweep ignored') + ms('defend lost')).toFixed(2)} / ${ms('trail hunter').toFixed(2)} / ${ms('ambush').toFixed(2)} | ${h('hunters').toFixed(2)} (${h('huntersLost').toFixed(2)}) | ${h('ambushes').toFixed(2)} (${h('ambushesLost').toFixed(2)}) | ${a((r) => r.netruns.runs).toFixed(1)} (${a((r) => r.netruns.disconnects).toFixed(2)}) | ${pct(a((r) => r.netruns.cleared.deep))} | ${pct(a((r) => r.mainframe.met))} |`);
}
