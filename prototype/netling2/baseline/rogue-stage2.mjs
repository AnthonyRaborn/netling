// Rogue, simulator stage 2 (runs): whole lives of all 37 archetypes under stage 1's settings plus the decided home rules (the 4 hour HIDE lockout,
// the 8 hour quiet, DEFEND into flow), with the hunt in runs on (NR2.rogue) at its starting values and under a few levers (ROGUE_RUN overrides).
// Writes results/followup/rogue-s2-<name>.json; skips files that exist (resumable). Usage: node prototype/netling2/baseline/rogue-stage2.mjs [lives=300] [--jobs=4] [filter]
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'results', 'followup');
mkdirSync(out, { recursive: true });
const balance = join(here, '..', 'sim', 'balance.mjs');
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const lives = Number(args[0] ?? 300);
const filter = args[1];
const jobsAtOnce = Number(process.argv.find((a) => a.startsWith('--jobs='))?.split('=')[1] ?? 4);

const FINAL_SIDES = {
  charge: { hi: 80, hold: 180, exit: 65, gate: 0, slow: 0, bleed: 8, overflow: 2, playGain: 0.45, drop: 0.75 },
  sync: { hi: 85, hold: 180, exit: 70, swing: 0, steadyDecay: 0, calm: 0, dull: 0.3, virus: 1.2, visit: 0.75, drop: 0.75, penStep: 0.1, penFree: 90, penCap: 0.9, burnN: 2, burnCool: 1440 },
};
const BASE = {
  NR2: 'all', PERKS: '1', STAGE: JSON.stringify({ on: true, rest: { on: true } }), STANDINGGAIN: '2',
  BUGS: JSON.stringify({ standingOnlyIfShort: true, clearStanding: 5 }), BRAKE: '{"on":true}', OVERUSE: '{"on":true}', CODEX: 'deep', JSON: '1',
  SIDES: JSON.stringify({ on: true, owner: 'none', ownerMult: 3, teenStates: true, ...FINAL_SIDES }), ROGUE: '1',
};
const th = (m) => ({ threshold: Object.fromEntries(Object.entries({ public: 10, bazaar: 10, corp: 9, ruins: 9, deep: 10, source: 12 }).map(([k, v]) => [k, Math.round(v * m)])) });
const HALF = { corp: 1 / 12, ruins: 1 / 12, deep: 0.125, source: 0.125 };
const DRAFT = { ...th(1), hunterTier: 2, ambushMark: true, kit: { breach: { 1: { dmg: 0.7 }, 2: { dmg: 0.65, hunterSaves: 1 } } }, map: { on: true, relayFactor: 0.5, toIce: { corp: 0.5 }, cordons: { deep: [0], source: [0, 0.667] }, guardShare: 0.5, narrow: ['deep', 'source'] } };
const JOBS = {
  // The draft's starting values, spelled out (the defaults are now the decided ones, 7.4); the other jobs vary these.
  start: DRAFT,
  // Decided (7.4): candidate A (thresholds x1.5, the hunter at tier 1, a lost ambush gives no mark) and only the cordons of the map rules.
  // rogue-s2-decided.json was measured before Breach's lost fights went to trail +1 (7.4); decided-breach1 is the same with it.
  decided: { kit: { breach: { 1: { dmg: 0.7 }, 2: { dmg: 0.65, hunterSaves: 1 } } } },
  'decided-breach1': {},
  nomap: { ...DRAFT, map: { on: false } },
  th15: { ...DRAFT, ...th(1.5) },
  th20: { ...DRAFT, ...th(2) },
  'th15-nomap': { ...DRAFT, ...th(1.5), map: { on: false } },
  'th15-tier1': { ...DRAFT, ...th(1.5), hunterTier: 1 },
  'th20-tier1-nomap': { ...DRAFT, ...th(2), hunterTier: 1, map: { on: false } },
  // Second round: the trail hunter nearly gone at 2x, so the ambushes are the lever.
  'th20-tier1-nomap-amb-half': { ...DRAFT, ...th(2), hunterTier: 1, map: { on: false }, ambush: HALF },
  'th20-tier1-nomap-amb-nomark': { ...DRAFT, ...th(2), hunterTier: 1, map: { on: false }, ambushMark: false },
  'th15-tier1-nomap-amb-nomark': { ...DRAFT, ...th(1.5), hunterTier: 1, map: { on: false }, ambushMark: false },
  'th20-tier1-nocordon-amb-half': { ...DRAFT, ...th(2), hunterTier: 1, map: { ...DRAFT.map, cordons: {} }, ambush: HALF },
};

const todo = Object.entries(JOBS).filter(([n]) => (!filter || n.includes(filter)) && !existsSync(join(out, `rogue-s2-${n}.json`)));
console.log(`${todo.length} jobs to run, ${lives} lives an archetype, ${jobsAtOnce} at once`);
const run = ([name, over]) => new Promise((resolve) => {
  const p = spawn(process.execPath, [balance, String(lives)], { env: { ...process.env, ...BASE, ROGUE_RUN: JSON.stringify(over) } });
  let buf = '';
  let err = '';
  p.stdout.on('data', (d) => (buf += d));
  p.stderr.on('data', (d) => (err += d));
  p.on('close', (code) => {
    if (code === 0) writeFileSync(join(out, `rogue-s2-${name}.json`), buf);
    console.log(`rogue-s2-${name}: ${code === 0 ? 'done' : `failed (${code}) ${err.slice(0, 400)}`}`);
    resolve();
  });
});
const queue = [...todo];
await Promise.all(Array.from({ length: jobsAtOnce }, async () => { while (queue.length) await run(queue.shift()); }));
