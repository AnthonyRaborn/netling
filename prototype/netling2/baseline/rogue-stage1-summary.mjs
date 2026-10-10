// Rogue, simulator stage 1 (home life): reads results/followup/rogue-stage1-*.json (written by the runs described in
// docs/netling2-prototypes/README.md, Rogue) and prints one table per measure: each archetype's value on the three NL-0 eggs, their mean, and
// Rogue under each sweep answer (HIDE always, DEFEND always, half and half). Usage: node prototype/netling2/baseline/rogue-stage1-summary.mjs
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = join(dirname(fileURLToPath(import.meta.url)), 'results', 'followup');
const NL0 = ['iron', 'program', 'wetware'];
const ROGUE = ['rogue-hide', 'rogue-defend', 'rogue-mix'];
const load = (n) => {
  const f = join(dir, `rogue-stage1-${n}.json`);
  return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null;
};
const R = Object.fromEntries([...NL0, ...ROGUE].map((n) => [n, load(n)]));
const missing = Object.entries(R).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) throw new Error(`missing results: ${missing.join(', ')}`);
const names = Object.keys(R.iron.archetypes);
const pct = (x) => (x * 100).toFixed(1);
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
console.log(`Lives per archetype: ${R.iron.runs}. Every life starts with Root and the 22 Root pages (CODEX=deep).\n`);

function table(title, get, fmt = pct) {
  console.log(`## ${title}\n`);
  console.log(`| archetype | Iron | Program | Wetware | NL-0 mean | Rogue HIDE | Rogue DEFEND | Rogue mix | HIDE minus NL-0 |`);
  console.log(`|---|---|---|---|---|---|---|---|---|`);
  const cols = { nl0: [], r: { 'rogue-hide': [], 'rogue-defend': [], 'rogue-mix': [] } };
  for (const n of names) {
    const v = NL0.map((e) => get(R[e].archetypes[n]));
    const m = mean(v);
    const r = ROGUE.map((e) => get(R[e].archetypes[n]));
    cols.nl0.push(m);
    ROGUE.forEach((e, i) => cols.r[e].push(r[i]));
    console.log(`| ${n} | ${v.map(fmt).join(' | ')} | ${fmt(m)} | ${r.map(fmt).join(' | ')} | ${fmt(r[0] - m)} |`);
  }
  const m = mean(cols.nl0);
  const r = ROGUE.map((e) => mean(cols.r[e]));
  console.log(`| **mean** | ${NL0.map((e) => fmt(mean(names.map((n) => get(R[e].archetypes[n]))))).join(' | ')} | ${fmt(m)} | ${r.map(fmt).join(' | ')} | ${fmt(r[0] - m)} |\n`);
}

table('Full life (share of lives that reach the end of the life cycle), %', (a) => a.fullLife);
table('Infections a life', (a) => a.pressure.viruses, (x) => x.toFixed(2));
table('Timed events a life (traces, intrusions, overflows; sweeps for Rogue)', (a) => a.pressure.events, (x) => x.toFixed(2));

console.log('## Rogue: sweeps, marks and capture\n');
console.log('| archetype | answer | sweeps a life | marks a life | from ignored sweeps | from lost DEFENDs | lives with a mark | captured |');
console.log('|---|---|---|---|---|---|---|---|');
for (const n of names) {
  for (const e of ROGUE) {
    const g = R[e].archetypes[n].rogue;
    console.log(`| ${n} | ${e.slice(6)} | ${g.sweeps.toFixed(2)} | ${g.marks.toFixed(2)} | ${g.markSources['sweep ignored'].toFixed(2)} | ${g.markSources['defend lost'].toFixed(2)} | ${pct(g.marked)} | ${pct(g.captured)} |`);
  }
}
console.log('');
for (const e of ROGUE) {
  const g = names.map((n) => R[e].archetypes[n].rogue);
  console.log(`- ${e}: mean sweeps ${mean(g.map((x) => x.sweeps)).toFixed(2)}, marks ${mean(g.map((x) => x.marks)).toFixed(2)}, marked ${pct(mean(g.map((x) => x.marked)))}%, captured ${pct(mean(g.map((x) => x.captured)))}% (highest: ${names.reduce((b, n) => (R[e].archetypes[n].rogue.captured > R[e].archetypes[b].rogue.captured ? n : b))} ${pct(Math.max(...g.map((x) => x.captured)))}%)`);
}
console.log('\n## Rogue adults by role (HIDE)\n');
const roles = {};
for (const n of names) for (const [f, sh] of Object.entries(R['rogue-hide'].archetypes[n].adults ?? {})) roles[f] = (roles[f] ?? 0) + sh / names.length;
console.log(Object.entries(roles).sort((a, b) => b[1] - a[1]).map(([f, v]) => `${f} ${pct(v)}%`).join(', '));
