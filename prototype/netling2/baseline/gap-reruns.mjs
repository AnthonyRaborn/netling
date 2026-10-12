// The simulator gaps left after the "now" set (docs/NETLING_2_SKETCH.md, Next steps item 3; 2026-10-12): the two experiments no sweep
// covers, re-run as balance.mjs calls. Resumable like run-all.mjs: an output that exists is skipped (pass --force to re-run).
//   node prototype/netling2/baseline/gap-reruns.mjs [filter] [--jobs=4] [--force]
// Outputs: results/gaps/<job>.json (balance.mjs JSON=1) and results/gaps/<job>.txt (sides-sweep.mjs).
//
// 1. bugs-*: "Do bugs kill?" (docs/netling2-prototypes/README.md) under the now rules at 1000 lives. bugs on against bugs off (max 0) for
//    casual, worker, human-regular and human-keen; and bugs held from birth (startBugs 0, 2, 3, 5 with no new ones, chance 0) for casual,
//    worker and attentive. The now rules' BUGS keys are repeated, since BUGS replaces keys one by one (sim.js).
// 2. hardened-*: the Breach rows of the perks first pass (notes/perks-traits-notes.md) with Hardened's cap at 1.25, in that pass's own
//    settings (NR2=all, 500 lives, FORCE_ADULT, the same seeds), so they compare with its tables: A no perks, B the perk, D perk + trait I +
//    keepsake, E perk + trait III.
// 3. pressure-*: the egg pressures' final design under the now rules, the figures in docs/NETLING_2_EGG_PRESSURES.md (Numbers; notes
//    Results 21 to 24). The now-sides-sweep and now-iron-sweep jobs ran on the fork's defaults (owner x2, no hold, burnout or brake), not
//    on this design, so these are the first now-rule figures for it: sides-sweep.mjs at 1000 lives with the decided SIDES (run-all.mjs
//    FINAL_SIDES, x3 owner, teen states, ironBenefit 3), Iron's eased wear on the Iron rows, and the default, greedy and sip Sync bots.
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
const FINAL_SIDES = {
  charge: { hi: 80, hold: 180, exit: 65, gate: 0, slow: 0, bleed: 8, overflow: 2, playGain: 0.45, drop: 0.75 },
  sync: { hi: 85, hold: 180, exit: 70, swing: 0, steadyDecay: 0, calm: 0, dull: 0.3, virus: 1.2, visit: 0.75, drop: 0.75, penStep: 0.1, penFree: 90, penCap: 0.9, burnN: 2, burnCool: 1440 },
};
const SIDES_SWEEP = join(HERE, '..', 'sim', 'sides-sweep.mjs');
const jobs = [];
for (const bot of ['default', 'greedy', 'sip']) {
  const env = { ...NOW, BUGS: JSON.stringify(NOW_BUGS), SIDES: JSON.stringify({ ownerMult: 3, teenStates: true, ironBenefit: 3, ...FINAL_SIDES }), ...(bot === 'default' ? {} : { SYNCBOT: bot }) };
  jobs.push({ name: `pressure-${bot}`, script: SIDES_SWEEP, args: ['1000', 'attentive,sysadmin,casual,worker,human-regular,daredevil,overclocker', JSON.stringify({ ironWear: true })], env, ext: 'txt' });
}
// 4. fix-*: candidate fixes for greedy Overlink's cost (2026-10-12): the greedy row of pressure-* with OVERUSE off, Wetware's strain add at 0 (the
//    strain alone isolated), no strain from plays inside Overlink (strain.sync.inState false), and Wetware's add at 10 (the shared value).
const FIXES = { 'overuse-off': { on: false }, 'strain0': { on: true, strain: { sync: { add: 0 } } }, 'no-strain-in-state': { on: true, strain: { sync: { inState: false } } }, 'strain10': { on: true, strain: { sync: { add: 10 } } } };
for (const [fix, overuse] of Object.entries(FIXES)) {
  const env = { ...NOW, OVERUSE: JSON.stringify(overuse), BUGS: JSON.stringify(NOW_BUGS), SIDES: JSON.stringify({ ownerMult: 3, teenStates: true, ironBenefit: 3, ...FINAL_SIDES }), SYNCBOT: 'greedy' };
  jobs.push({ name: `fix-${fix}`, script: SIDES_SWEEP, args: ['1000', 'attentive,sysadmin,casual,worker,human-regular,daredevil,overclocker', JSON.stringify({ ironWear: true })], env, ext: 'txt' });
}
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
const outOf = (j) => join(OUT, `${j.name}.${j.ext ?? 'json'}`);
const todo = jobs.filter((j) => j.name.includes(filter) && (force || !existsSync(outOf(j))));
console.log(`${todo.length} of ${jobs.length} jobs to run, ${par} at a time`);
const run = (j) => new Promise((resolve) => {
  const t0 = Date.now();
  let out = '';
  const argv = j.script ? [j.script, ...j.args] : [BALANCE, String(j.lives), j.arch];
  const p = spawn(process.execPath, argv, { env: { ...process.env, TZ: 'UTC', JSON: '1', ...j.env } });
  p.stdout.on('data', (d) => (out += d));
  p.stderr.on('data', (d) => process.stderr.write(d));
  p.on('close', (code) => {
    if (code === 0) writeFileSync(outOf(j), out);
    console.log(`${j.name}: ${code === 0 ? 'ok' : `exit ${code}`} in ${Math.round((Date.now() - t0) / 1000)} s`);
    resolve();
  });
});
const queue = [...todo];
await Promise.all(Array.from({ length: par }, async () => { while (queue.length) await run(queue.shift()); }));
