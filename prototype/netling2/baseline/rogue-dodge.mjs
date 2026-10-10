// Rogue, the Dodge line's levers (docs/NETLING_2_ROGUE_DRAFTS.md 7.4): whole lives of the two Dodge steerers (steer-dodge-corp, steer-dodge-street)
// at the decided stage 2 settings (rogue-stage2.mjs BASE), under the off-by-default levers in nr2.js kit.dodge: headStart (H), thresholdDelta (T)
// and slipTrail (+S). The other lines' steerers at the decided settings are the "others" job. Writes results/followup/rogue-dodge-<name>.json;
// skips files that exist (resumable). The per-region run figures came from sim/rogue-netrun.mjs (FORMS=rogue, 3000 runs) with the same ROGUE_RUN.
// Usage: node prototype/netling2/baseline/rogue-dodge.mjs [lives=1000] [--jobs=3] [filter]
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'results', 'followup');
mkdirSync(out, { recursive: true });
const balance = join(here, '..', 'sim', 'balance.mjs');
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const lives = Number(args[0] ?? 1000);
const filter = args[1];
const jobsAtOnce = Number(process.argv.find((a) => a.startsWith('--jobs='))?.split('=')[1] ?? 3);

const FINAL_SIDES = {
  charge: { hi: 80, hold: 180, exit: 65, gate: 0, slow: 0, bleed: 8, overflow: 2, playGain: 0.45, drop: 0.75 },
  sync: { hi: 85, hold: 180, exit: 70, swing: 0, steadyDecay: 0, calm: 0, dull: 0.3, virus: 1.2, visit: 0.75, drop: 0.75, penStep: 0.1, penFree: 90, penCap: 0.9, burnN: 2, burnCool: 1440 },
};
const BASE = {
  NR2: 'all', PERKS: '1', STAGE: JSON.stringify({ on: true, rest: { on: true } }), STANDINGGAIN: '2',
  BUGS: JSON.stringify({ standingOnlyIfShort: true, clearStanding: 5 }), BRAKE: '{"on":true}', OVERUSE: '{"on":true}', CODEX: 'deep', JSON: '1',
  SIDES: JSON.stringify({ on: true, owner: 'none', ownerMult: 3, teenStates: true, ...FINAL_SIDES }), ROGUE: '1',
};
// ROGUE_RUN merges one level down, so the whole Dodge kit is spelled out with the lever added.
const D = (...parts) => ({ kit: { dodge: { 1: { unseen: 0.3, moveEvery: 2, ...Object.assign({}, ...parts) }, 2: { unseen: 0.5, moveEvery: 2, ambushSlip: true, ...Object.assign({}, ...parts) } } } });
const S = { slipTrail: 1 };
const JOBS = {
  current: ['steer-dodge', {}],
  others: [['steer-breach', 'steer-tune', 'steer-feast'], {}], // the other lines' steerers at the decided settings (one process each, merged)
  H2: ['steer-dodge', D({ headStart: 2 })], H3: ['steer-dodge', D({ headStart: 3 })], H4: ['steer-dodge', D({ headStart: 4 })],
  'H3+S': ['steer-dodge', D({ headStart: 3 }, S)], 'H4+S': ['steer-dodge', D({ headStart: 4 }, S)],
  T3: ['steer-dodge', D({ thresholdDelta: -3 })], T4: ['steer-dodge', D({ thresholdDelta: -4 })], T5: ['steer-dodge', D({ thresholdDelta: -5 })],
  'T3+S': ['steer-dodge', D({ thresholdDelta: -3 }, S)], 'T4+S': ['steer-dodge', D({ thresholdDelta: -4 }, S)],
};

const todo = Object.entries(JOBS).filter(([n]) => (!filter || n.includes(filter)) && !existsSync(join(out, `rogue-dodge-${n}.json`)));
console.log(`${todo.length} jobs to run, ${lives} lives an archetype, ${jobsAtOnce} at once`);
const one = (arch, over) => new Promise((resolve) => {
  const p = spawn(process.execPath, [balance, String(lives), arch], { env: { ...process.env, ...BASE, ROGUE_RUN: JSON.stringify(over) } });
  let buf = '';
  let err = '';
  p.stdout.on('data', (d) => (buf += d));
  p.stderr.on('data', (d) => (err += d));
  p.on('close', (code) => resolve(code === 0 ? JSON.parse(buf) : { error: `failed (${code}) ${err.slice(0, 400)}` }));
});
const run = async ([name, [arch, over]]) => {
  const parts = await Promise.all([arch].flat().map((a) => one(a, over)));
  const bad = parts.find((r) => r.error);
  if (!bad) writeFileSync(join(out, `rogue-dodge-${name}.json`), JSON.stringify({ ...parts[0], archetypes: Object.assign({}, ...parts.map((r) => r.archetypes)) }, null, 1));
  console.log(`rogue-dodge-${name}: ${bad ? bad.error : 'done'}`);
};
const queue = [...todo];
await Promise.all(Array.from({ length: jobsAtOnce }, async () => { while (queue.length) await run(queue.shift()); }));
