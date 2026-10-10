// Rogue, section 7.2: reads results/followup/rogue-72-*.json (written by rogue-hide-lock.mjs) and stage 1's files, and prints one row per
// setting for three groups of archetypes: attentive (hourly check-ins, the 26 that stage 1 left at 99% or more), two-hourly (corpo, runner,
// overclocker) and sparse (casual, worker, hunter-casual and the human archetypes). Usage: node prototype/netling2/baseline/rogue-hide-lock-summary.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = join(dirname(fileURLToPath(import.meta.url)), 'results', 'followup');
const load = (f) => JSON.parse(readFileSync(join(dir, f), 'utf8')).archetypes;
const TWO = ['corpo', 'runner', 'overclocker'];
const SPARSE = ['casual', 'worker', 'hunter-casual', 'human-casual', 'human-regular', 'human-keen', 'human-bursty'];
const OUT = new Set([...TWO, ...SPARSE, 'neglectful']);
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const nl0 = ['iron', 'program', 'wetware'].map((e) => load(`rogue-stage1-${e}.json`));
const names = Object.keys(nl0[0]);
const ATT = names.filter((n) => !OUT.has(n));
const nl0Full = (n) => mean(nl0.map((r) => r[n].fullLife));

const rows = [['stage 1, HIDE always (no lockout, no quiet)', 'rogue-stage1-rogue-hide.json'], ['stage 1, DEFEND always', 'rogue-stage1-rogue-defend.json']];
const grid = readdirSync(dir).filter((f) => /^rogue-72-.*\.json$/.test(f)).map((f) => {
  const [, lock, quiet, bot, flow] = f.match(/lock(\d+)-quiet(\d+)-([a-z]+)(-flow)?\.json/);
  return { f, lock: +lock, quiet: +quiet, bot, flow: Boolean(flow) };
}).sort((a, b) => a.bot.localeCompare(b.bot) || a.lock - b.lock || a.quiet - b.quiet || a.flow - b.flow);
for (const g of grid) rows.push([`lockout ${g.lock}h, quiet ${g.quiet}h, ${g.bot}${g.flow ? ', DEFEND into flow' : ''}`, g.f]);

const pct = (x) => (x * 100).toFixed(1);
console.log(`Archetypes: attentive group ${ATT.length} (${ATT.join(', ')}); two-hourly ${TWO.join(', ')}; sparse ${SPARSE.join(', ')}.`);
console.log(`NL-0 mean full life: attentive group ${pct(mean(ATT.map(nl0Full)))}, two-hourly ${pct(mean(TWO.map(nl0Full)))}, sparse ${pct(mean(SPARSE.map(nl0Full)))}.\n`);
console.log('| setting | att. full life | att. captured (mean / worst) | att. sweeps | att. DEFENDs (forced) | att. marks | att. timed events | att. hours in flow | att. temper | 2-hourly full / captured | sparse full / captured |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|');
for (const [label, f] of rows) {
  const R = load(f);
  const a = (get) => mean(ATT.map((n) => get(R[n])));
  const cap = ATT.map((n) => R[n].rogue.captured);
  const grp = (ns) => `${pct(mean(ns.map((n) => R[n].fullLife)))} / ${pct(mean(ns.map((n) => R[n].rogue.captured)))}`;
  const defends = R[ATT[0]].rogue.defends === undefined ? '-' : `${a((r) => r.rogue.defends).toFixed(2)} (${a((r) => r.rogue.forced).toFixed(2)})`;
  console.log(`| ${label} | ${pct(a((r) => r.fullLife))} | ${pct(mean(cap))} / ${pct(Math.max(...cap))} | ${a((r) => r.rogue.sweeps).toFixed(2)} | ${defends} | ${a((r) => r.rogue.marks).toFixed(2)} | ${a((r) => r.events).toFixed(2)} | ${a((r) => r.attention.flowHours).toFixed(1)} | ${a((r) => r.temper).toFixed(1)} | ${grp(TWO)} | ${grp(SPARSE)} |`);
}
