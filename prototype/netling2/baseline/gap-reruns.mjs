// The simulator gaps left after the "now" set (docs/NETLING_2_SKETCH.md, Next steps item 3; 2026-10-12): the two experiments no sweep
// covers, re-run as balance.mjs calls. Resumable like run-all.mjs: an output that exists is skipped (pass --force to re-run).
//   node prototype/netling2/baseline/gap-reruns.mjs [filter] [--jobs=4] [--force]
// Outputs: results/gaps/<job>.json (balance.mjs JSON=1).
//
// 1. bugs-*: "Do bugs kill?" (docs/netling2-prototypes/README.md) under the now rules at 1000 lives. bugs on against bugs off (max 0) for
//    casual, worker, human-regular and human-keen; and bugs held from birth (startBugs 0, 2, 3, 5 with no new ones, chance 0) for casual,
//    worker and attentive. The now rules' BUGS keys are repeated, since BUGS replaces keys one by one (sim.js).
// 2. hardened-*: the Breach rows of the perks first pass (notes/perks-traits-notes.md) with Hardened's cap at 1.25, in that pass's own
//    settings (NR2=all, 500 lives, FORCE_ADULT, the same seeds), so they compare with its tables: A no perks, B the perk, D perk + trait I +
//    keepsake, E perk + trait III.
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'results', 'gaps');
const BALANCE = join(HERE, '..', 'sim', 'balance.mjs');
const args = process.argv.slice(2);
const force = args.includes('--force');
const par = Number(args.find((a) => a.startsWith('--jobs='))?.split('=')[1] ?? 4);
const filter = args.find((a) => !a.startsWith('--')) ?? '';

const NOW_BUGS = { standingOnlyIfShort: true, clearStanding: 5 };
const NOW = { NR2: 'all', PERKS: '1', STAGE: JSON.stringify({ on: true, rest: { on: true } }), STANDINGGAIN: '2', BRAKE: '{"on":true}', OVERUSE: '{"on":true}', INHERIT: '{"fullLife":false}' };
const jobs = [];
for (const arch of ['casual', 'worker', 'human-regular', 'human-keen']) {
  jobs.push({ name: `bugs-on-${arch}`, lives: 1000, arch, env: { ...NOW, BUGS: JSON.stringify(NOW_BUGS) } });
  jobs.push({ name: `bugs-off-${arch}`, lives: 1000, arch, env: { ...NOW, BUGS: JSON.stringify({ ...NOW_BUGS, max: 0 }) } });
}
for (const arch of ['casual', 'worker', 'attentive']) for (const n of [0, 2, 3, 5]) {
  jobs.push({ name: `bugs-start${n}-${arch}`, lives: 1000, arch, env: { ...NOW, BUGS: JSON.stringify({ ...NOW_BUGS, startBugs: n, chance: 0 }) } });
}
for (const form of ['breachCorp', 'breachStreet']) for (const arch of ['worker', 'casual', 'overclocker', 'human-casual']) {
  const base = { NR2: 'all', FORCE_ADULT: form };
  jobs.push({ name: `hardened-A-${form}-${arch}`, lives: 500, arch, env: base });
  jobs.push({ name: `hardened-B-${form}-${arch}`, lives: 500, arch, env: { ...base, PERKS: '1' } });
  jobs.push({ name: `hardened-D-${form}-${arch}`, lives: 500, arch, env: { ...base, PERKS: '1', TRAIT: form, TRAIT_LEVEL: '1' } });
  jobs.push({ name: `hardened-E-${form}-${arch}`, lives: 500, arch, env: { ...base, PERKS: '1', TRAIT: form, TRAIT_LEVEL: '3' } });
}

mkdirSync(OUT, { recursive: true });
const todo = jobs.filter((j) => j.name.includes(filter) && (force || !existsSync(join(OUT, `${j.name}.json`))));
console.log(`${todo.length} of ${jobs.length} jobs to run, ${par} at a time`);
const run = (j) => new Promise((resolve) => {
  const t0 = Date.now();
  let out = '';
  const p = spawn(process.execPath, [BALANCE, String(j.lives), j.arch], { env: { ...process.env, TZ: 'UTC', JSON: '1', ...j.env } });
  p.stdout.on('data', (d) => (out += d));
  p.stderr.on('data', (d) => process.stderr.write(d));
  p.on('close', (code) => {
    if (code === 0) writeFileSync(join(OUT, `${j.name}.json`), out);
    console.log(`${j.name}: ${code === 0 ? 'ok' : `exit ${code}`} in ${Math.round((Date.now() - t0) / 1000)} s`);
    resolve();
  });
});
const queue = [...todo];
await Promise.all(Array.from({ length: par }, async () => { while (queue.length) await run(queue.shift()); }));
