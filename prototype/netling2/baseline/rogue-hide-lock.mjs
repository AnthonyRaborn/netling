// Rogue, section 7.2 (proposal under test): the HIDE lockout (a HIDE burns the route for ROGUE.hideLockMin) and the quiet a won DEFEND buys
// (no sweep for ROGUE.defendQuietMin). Runs balance.mjs for all 37 archetypes under stage 1's settings (the "now" rules, SIDES owner "none",
// every life starting with Root and the 22 Root pages) over a grid of lockouts and quiets, with the bot answering by SWEEPBOT=hide (HIDE when it
// can, DEFEND when locked out) and, for some cells, SWEEPBOT=reserve (DEFEND while unmarked). Writes results/followup/rogue-72-*.json and skips
// files that already exist (resumable). Usage: node prototype/netling2/baseline/rogue-hide-lock.mjs [lives=300] [--jobs=4]
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'results', 'followup');
mkdirSync(out, { recursive: true });
const balance = join(here, '..', 'sim', 'balance.mjs');
const lives = Number(process.argv.slice(2).find((a) => !a.startsWith('--')) ?? 300);
const jobsAtOnce = Number(process.argv.find((a) => a.startsWith('--jobs='))?.split('=')[1] ?? 4);

const FINAL_SIDES = {
  charge: { hi: 80, hold: 180, exit: 65, gate: 0, slow: 0, bleed: 8, overflow: 2, playGain: 0.45, drop: 0.75 },
  sync: { hi: 85, hold: 180, exit: 70, swing: 0, steadyDecay: 0, calm: 0, dull: 0.3, virus: 1.2, visit: 0.75, drop: 0.75, penStep: 0.1, penFree: 90, penCap: 0.9, burnN: 2, burnCool: 1440 },
};
const BASE = {
  NR2: 'all', PERKS: '1', STAGE: JSON.stringify({ on: true, rest: { on: true } }), STANDINGGAIN: '2',
  BUGS: JSON.stringify({ standingOnlyIfShort: true, clearStanding: 5 }), BRAKE: '{"on":true}', OVERUSE: '{"on":true}', CODEX: 'deep', JSON: '1',
  SIDES: JSON.stringify({ on: true, owner: 'none', ownerMult: 3, teenStates: true, ...FINAL_SIDES }),
};

const jobs = [];
for (const lock of [3, 4, 6]) for (const quiet of [6, 8, 12]) jobs.push({ lock, quiet, bot: 'hide' });
for (const [lock, quiet] of [[3, 8], [4, 8], [6, 8], [4, 12]]) jobs.push({ lock, quiet, bot: 'reserve' });
// The lockout alone (no quiet) and the quiet alone (no lockout), to see what each part does.
jobs.push({ lock: 4, quiet: 0, bot: 'hide' }, { lock: 0, quiet: 8, bot: 'reserve' });

const name = (j) => `rogue-72-lock${j.lock}-quiet${j.quiet}-${j.bot}.json`;
const todo = jobs.filter((j) => !existsSync(join(out, name(j))));
console.log(`${todo.length} of ${jobs.length} jobs to run, ${lives} lives an archetype, ${jobsAtOnce} at once`);

const run = (j) => new Promise((resolve) => {
  const env = { ...process.env, ...BASE, ROGUE: JSON.stringify({ hideLockMin: j.lock * 60, defendQuietMin: j.quiet * 60 }), SWEEPBOT: j.bot };
  const p = spawn(process.execPath, [balance, String(lives)], { env });
  let buf = '';
  let err = '';
  p.stdout.on('data', (d) => (buf += d));
  p.stderr.on('data', (d) => (err += d));
  p.on('close', (code) => {
    if (code === 0) writeFileSync(join(out, name(j)), buf);
    console.log(`${name(j)}: ${code === 0 ? 'done' : `failed (${code}) ${err.slice(0, 400)}`}`);
    resolve();
  });
});
const queue = [...todo];
await Promise.all(Array.from({ length: jobsAtOnce }, async () => { while (queue.length) await run(queue.shift()); }));
