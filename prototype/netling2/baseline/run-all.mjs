// Runs the Netling 2.0 simulator suite under the current decided rules and saves every output in results/.
// Usage: node prototype/netling2/baseline/run-all.mjs [jobFilter] [--jobs=4] [--lives=1000]
//   jobFilter: substring of a job name (for example "balance" or "clinic"); default runs everything.
// Configurations ("config" below):
//   core     no switches: the 2.0 core rules only (Standing, temper, bugs, clinic, soft push), egg pressures and netrun rules off
//   full-<egg>  NR2=all PERKS=1 and that egg's final pressure design (docs/NETLING_2_EGG_PRESSURES.md): Iron = wear plus Overclock x3,
//            Program = Overdrive, Wetware = Overlink with its brake; owner multiplier 3, hold 3 awake hours
//   rules    NR2=all PERKS=1 and no egg pressure (sweeps that do not model a pressure, or set their own)
// Sweeps that set a pressure themselves (clinic-final, grace, hint, heat-hint) run under "rules".
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..', '..');
const sim = join(root, 'prototype', 'netling2', 'sim');
const out = join(here, process.argv.includes('--smoke') ? '_smoke' : 'results');
mkdirSync(out, { recursive: true });

const arg = (name, fallback) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? fallback;
const filter = process.argv.slice(2).find((a) => !a.startsWith('--'));
const jobsAtOnce = Number(arg('jobs', 4));
const SMOKE = process.argv.includes('--smoke'); // tiny counts: only checks that every job starts and finishes
const LIVES = SMOKE ? 3 : Number(arg('lives', 1000));
const RUNS = (n) => (SMOKE ? 10 : n);

const FINAL_SIDES = {
  charge: { hi: 80, hold: 180, exit: 65, gate: 0, slow: 0, bleed: 8, overflow: 2, playGain: 0.45, drop: 0.75 },
  sync: { hi: 85, hold: 180, exit: 70, swing: 0, steadyDecay: 0, calm: 0, dull: 0.3, virus: 1.2, visit: 0.75, drop: 0.75, penStep: 0.1, penFree: 90, penCap: 0.9, burnN: 2, burnCool: 1440 },
};
const sides = (owner) => JSON.stringify({ on: true, owner, ownerMult: 3, teenStates: true, ...FINAL_SIDES });
const CONFIG = {
  core: {},
  rules: { NR2: 'all', PERKS: '1' },
  'full-iron': { NR2: 'all', PERKS: '1', IRON: '{"on":true}', SIDES: JSON.stringify({ on: true, owner: null, ownerMult: 3, teenStates: true, ironBenefit: 3 }) },
  'full-program': { NR2: 'all', PERKS: '1', SIDES: sides('charge') },
  'full-wetware': { NR2: 'all', PERKS: '1', SIDES: sides('sync') },
};

const jobs = [];
const add = (name, script, args, config, env = {}, est = 1) => jobs.push({ name, script, args: args.map(String), config, env, est });

// Whole-life balance (36 archetypes). The long ones go first.
for (const c of ['core', 'full-iron', 'full-program', 'full-wetware']) add(`balance-${c}`, 'balance.mjs', [LIVES], c, { JSON: '1' }, 900);

// Lineage pacing and the Rogue gate (egg pages, ending).
for (const [a, n] of [['attentive', 15], ['daredevil', 20], ['casual', 40]]) add(`lineage-${a}`, 'lineage-sweep.mjs', [a, SMOKE ? 3 : 200, SMOKE ? 3 : n], 'rules', { JSON: '1' }, 600);

// Sweeps whose first argument is a number of lives (sampled at LIVES).
const lifeSweeps = [
  ['bug-sweep', 300], ['clinic-sweep', 300], ['push-sweep', 300], ['gap-sweep', 200], ['human-sweep', 200], ['hunter-sweep', 200],
  ['temper-sweep', 200], ['item-sweep', 200], ['exchange-stock', 150], ['clinic-final', 150], ['grace-sweep', 200], ['heat-hint-sweep', 200],
  ['hint-sweep', 200], ['role-sweep', 300], ['sides-sweep', 300], ['iron-sweep', 600], ['iron-cold-sweep', 400], ['stat-profile', 200],
];
for (const [n] of lifeSweeps) add(n, `${n}.mjs`, [LIVES], 'rules', {}, 600);
for (const k of ['charge', 'sync']) {
  add(`act-sweep-${k}`, 'act-sweep.mjs', [k, LIVES], 'rules', {}, 300);
  add(`band-sweep-${k}`, 'band-sweep.mjs', [k, LIVES], 'rules', {}, 300);
}

// Per-egg life-level sweeps with the egg's own pressure.
for (const egg of ['iron', 'program', 'wetware']) add(`runcost-${egg}`, 'runcost-sweep.mjs', [LIVES], `full-${egg}`, { EGG: egg }, 400);

// Netrun sweeps (counts of runs; kept at the script's own default when that is higher than 1000).
add('netrun-sweep', 'netrun-sweep.mjs', [LIVES], 'rules', {}, 300);
add('challenge-sweep', 'challenge-sweep.mjs', [RUNS(2000)], 'rules', {}, 300);
add('foresight-sweep', 'foresight-sweep.mjs', [RUNS(3000)], 'rules', {}, 300);
for (const egg of ['iron', 'program', 'wetware']) add(`egg-anomaly-${egg}`, 'egg-anomaly-sweep.mjs', [RUNS(3000)], `full-${egg}`, { EGG: egg }, 200);

const outFile = (j) => join(out, `${j.name}.${j.env.JSON ? 'json' : 'txt'}`);
// Resumable: a job whose output exists is skipped (outputs are written only after a clean exit). --force reruns everything.
const todo = jobs.filter((j) => (!filter || j.name.includes(filter)) && (process.argv.includes('--force') || !existsSync(outFile(j)))).sort((a, b) => b.est - a.est);
const log = join(out, '_run.log');
const say = (m) => { const l = `${new Date().toISOString()} ${m}`; console.log(l); writeFileSync(log, `${existsSync(log) ? readFileSync(log, 'utf8') : ''}${l}\n`); };

let next = 0;
const run = (j) => new Promise((resolve) => {
  const t0 = Date.now();
  const env = { ...process.env, TZ: 'UTC', ...CONFIG[j.config], ...j.env };
  const p = spawn('node', [join(sim, j.script), ...j.args], { env, cwd: root });
  const chunks = []; const errs = [];
  p.stdout.on('data', (d) => chunks.push(d)); p.stderr.on('data', (d) => errs.push(d));
  p.on('close', (code) => {
    writeFileSync(code === 0 ? outFile(j) : `${outFile(j)}.failed`, Buffer.concat(chunks));
    if (errs.length) writeFileSync(join(out, `${j.name}.err`), Buffer.concat(errs));
    say(`${code === 0 ? 'done' : `FAILED(${code})`} ${j.name} [${j.config}] ${Math.round((Date.now() - t0) / 1000)}s`);
    resolve();
  });
});
const worker = async () => { while (next < todo.length) { const j = todo[next++]; say(`start ${j.name}`); await run(j); } };
await Promise.all(Array.from({ length: jobsAtOnce }, worker));
say(`all ${todo.length} jobs finished`);
