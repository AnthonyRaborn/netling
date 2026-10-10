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
const JOBS = {
  decided: {}, // MERGEBOT=accept, PICK=first, LINEBOT=stay
  refuse: { MERGEBOT: 'refuse' }, // every offer declined: the good end only at death
  back: { LINEBOT: 'back' }, // one NL-0 life after a capture
  tier1: { FEAT: '1' }, // a lever: every Rogue elder at 1.0's feat (three Deep exits or two clean)
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
for (const job of Object.keys(JOBS)) {
  const files = ATT.map((a) => join(out, 'rogue-lineage', job, `${a}.json`));
  if (!files.every(existsSync)) continue;
  writeFileSync(join(out, `rogue-lineage-${job}.json`), JSON.stringify({ job, lineages, rogueLives, archetypes: Object.fromEntries(ATT.map((a, i) => [a, JSON.parse(readFileSync(files[i], 'utf8'))])) }, null, 1));
}
