// Rogue, simulator stage 3 (the lineage side): sim/rogue-lineage.mjs for each archetype of the attentive group (the 26 hourly archetypes) under
// the decided settings and a few bot rules. One file an archetype and job in results/followup/rogue-lineage/<job>/ (resumable: a file that exists
// is skipped), then results/followup/rogue-lineage-<job>.json with every archetype. Summary: rogue-lineage-summary.mjs.
// Usage: node prototype/netling2/baseline/rogue-lineage.mjs [lineages=200] [rogueLives=10] [--jobs=4] [jobFilter]
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'results', 'followup');
const driver = join(here, '..', 'sim', 'rogue-lineage.mjs');
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const [lineages, rogueLives, filter] = [Number(args[0] ?? 200), Number(args[1] ?? 10), args[2]];
const jobsAtOnce = Number(process.argv.find((a) => a.startsWith('--jobs='))?.split('=')[1] ?? 4);
// The attentive group: every archetype but these (as rogue-stage2-summary.mjs).
const OUT = new Set(['corpo', 'runner', 'overclocker', 'casual', 'worker', 'hunter-casual', 'human-casual', 'human-regular', 'human-keen', 'human-bursty', 'neglectful']);
const { ARCHETYPES } = await import('../sim/balance.mjs');
const ATT = Object.keys(ARCHETYPES).filter((n) => !OUT.has(n));
// Stage 3's first jobs (2026-10-10) pin its rules so their saved outputs reproduce: any Source exit arms the good end, and the hatchling after it
// takes the chosen egg's latest fragment as its parent.
const STAGE3 = { ROGUE: '{"armClean":false,"goodEndFullLife":false}', PARENT: 'fragment', CROSS: 'open', INHERIT: '{"fullLife":false}', ROGUE_TRAIT: '0' };
const NO_TRAIT = { ROGUE_TRAIT: '0' }; // the clean jobs were measured before the Rogue trait
const JOBS = {
  decided: { ...STAGE3 }, // MERGEBOT=accept, PICK=first, LINEBOT=stay
  refuse: { ...STAGE3, MERGEBOT: 'refuse' }, // every offer declined: the good end only at death
  back: { ...STAGE3, LINEBOT: 'back' }, // one NL-0 life after a capture
  tier1: { ...STAGE3, FEAT: '1' }, // a lever: every Rogue elder at 1.0's feat (three Deep exits or two clean)
  // The decisions of 2026-10-11 (docs/NETLING_2_ROGUE_DRAFTS.md 6.1, items 41 to 47), now the defaults: only a clean Source exit arms the good end,
  // any egg can follow it, the mixed egg's parent is the Rogue, only a full life passes the trait line (and only an old-age death of an armed
  // elder is the good end), and the crossings between Rogue and the NL-0 eggs are gated.
  clean: { ...NO_TRAIT }, // MERGEBOT=accept, PICK=first (the mixed egg in the first NL-0 egg completed), LINEBOT=stay
  'clean-refuse': { ...NO_TRAIT, MERGEBOT: 'refuse' }, // the clean exit's offer declined: the good end at death if still armed
  'clean-rogue': { ...NO_TRAIT, PICK: 'rogue' }, // Rogue again after every good end: no mixed egg, every life a Rogue life
  // The Rogue trait (decided 2026-10-11, 9.4a C1 and E1; sim.js ROGUE_TRAIT), on the fork's defaults: every rule decided so far.
  trait: {},
};
const todo = [];
for (const [job, env] of Object.entries(JOBS)) {
  if (filter && !job.includes(filter)) continue;
  mkdirSync(join(out, 'rogue-lineage', job), { recursive: true });
  for (const a of ATT) if (!existsSync(join(out, 'rogue-lineage', job, `${a}.json`))) todo.push([job, env, a]);
}
console.log(`${todo.length} runs to do, ${lineages} lines of ${rogueLives} Rogue lives, ${jobsAtOnce} at once`);
const run = ([job, env, a]) => new Promise((resolve) => {
  const p = spawn(process.execPath, [driver, a, String(lineages), String(rogueLives)], { env: { ...process.env, ...env, JSON: '1' } });
  let buf = '';
  let err = '';
  p.stdout.on('data', (d) => (buf += d));
  p.stderr.on('data', (d) => (err += d));
  p.on('close', (code) => {
    if (code === 0) writeFileSync(join(out, 'rogue-lineage', job, `${a}.json`), buf);
    console.log(`${job}/${a}: ${code === 0 ? 'done' : `failed (${code}) ${err.slice(0, 400)}`}`);
    resolve();
  });
});
const queue = [...todo];
await Promise.all(Array.from({ length: jobsAtOnce }, async () => { while (queue.length) await run(queue.shift()); }));
// The combined file of each job asked for, once every archetype is done (the counts are read from the files, which may predate this call's).
for (const job of Object.keys(JOBS).filter((j) => !filter || j.includes(filter))) {
  const files = ATT.map((a) => join(out, 'rogue-lineage', job, `${a}.json`));
  if (!files.every(existsSync)) continue;
  const archetypes = Object.fromEntries(ATT.map((a, i) => [a, JSON.parse(readFileSync(files[i], 'utf8'))]));
  const first = Object.values(archetypes)[0];
  writeFileSync(join(out, `rogue-lineage-${job}.json`), JSON.stringify({ job, lineages: first.lineages, rogueLives: first.rogueLives, archetypes }, null, 1));
}
