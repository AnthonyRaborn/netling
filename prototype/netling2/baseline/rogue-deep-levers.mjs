// Rogue, the Deep's map levers against the relay question (docs/NETLING_2_ROGUE_DRAFTS.md 7.4, 9.7): each setting runs sim/rogue-relay.mjs (the
// relay read-out) and sim/rogue-netrun.mjs (whole Deep runs, Rogue forms and the hidden form) in the Deep only, at the decided settings plus the
// lever. guardShare and relayFactor act in every region in the fork; only the Deep is measured here. Writes results/followup/rogue-deep-levers.json.
// Resumable: settings already in the output file are kept. Usage: node prototype/netling2/baseline/rogue-deep-levers.mjs [runs=3000]
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const n = process.argv[2] ?? '3000';
const SETTINGS = {
  decided: {},
  'guard 0.25': { guardShare: 0.25 },
  'guard 0.5': { guardShare: 0.5 },
  narrow: { narrow: ['deep'] },
  'relays 0.5': { relayFactor: 0.5 },
  'guard 0.5 + narrow': { guardShare: 0.5, narrow: ['deep'] },
  'guard 0.5 + relays 0.5': { guardShare: 0.5, relayFactor: 0.5 },
  'narrow + relays 0.5': { narrow: ['deep'], relayFactor: 0.5 },
  all: { guardShare: 0.5, narrow: ['deep'], relayFactor: 0.5 },
};
// Second round: levers on the far half (the first round's map rules did not move the ratio). Each is a whole ROGUE_RUN override.
const FAR = {
  'second cordon 0.8': { map: { cordons: { deep: [0, 0.8], source: [0, 0.667] } } },
  'second cordon 0.9': { map: { cordons: { deep: [0, 0.9], source: [0, 0.667] } } },
  'ambush 0.4': { ambush: { deep: 0.4 } },
  'threshold 12': { threshold: { deep: 12 } },
  'second cordon 0.8 + ambush 0.4': { map: { cordons: { deep: [0, 0.8], source: [0, 0.667] } }, ambush: { deep: 0.4 } },
  // Third round: the relay moved down (map rule relayAt; the cordon stays right after it).
  'relay at 0.6': { map: { relayAt: { deep: 0.6 } } },
  'relay at 0.667': { map: { relayAt: { deep: 0.667 } } },
  'relay at 0.8': { map: { relayAt: { deep: 0.8 } } },
  'relay at 0.9': { map: { relayAt: { deep: 0.9 } } },
  'relay at 0.667 + narrow': { map: { relayAt: { deep: 0.667 }, narrow: ['deep'] } },
  'relay at 0.8 + narrow': { map: { relayAt: { deep: 0.8 }, narrow: ['deep'] } },
};
// Fourth round, at the new default (the relay at 0.667, 7.4): the Rogue exit bonus in the Deep (rogue.exitBonus; the region's is 2).
const EXIT = {
  'relay 0.667 (decided)': {},
  'relay 0.667 + exit 1': { exitBonus: { deep: 1 } },
  'relay 0.667 + exit 0': { exitBonus: { deep: 0 } },
  'relay 0.667 + narrow + exit 1': { exitBonus: { deep: 1 }, map: { narrow: ['deep'] } },
  'relay 0.8 + exit 1': { exitBonus: { deep: 1 }, map: { relayAt: { deep: 0.8 } } },
};
// The first three rounds were measured with the relay in the middle layer (then the default), so they spell it out unless they move it.
const PRE = (over) => ({ ...over, map: { relayAt: {}, ...(over.map ?? {}) } });
const sim = (file, env) => JSON.parse(execFileSync(process.execPath, [join(here, '..', 'sim', file), n, 'deep'], { env: { ...process.env, JSON: '1', ...env }, maxBuffer: 1 << 26 }));
const file = join(here, 'results', 'followup', 'rogue-deep-levers.json');
const out = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {};
for (const [name, over] of [...Object.entries(SETTINGS).map(([k, map]) => [k, PRE({ map })]), ...Object.entries(FAR).map(([k, o]) => [k, PRE(o)]), ...Object.entries(EXIT)]) {
  if (out[name]) continue;
  const ROGUE_RUN = JSON.stringify(over);
  out[name] = { relay: sim('rogue-relay.mjs', { ROGUE_RUN }), runs: sim('rogue-netrun.mjs', { ROGUE_RUN, FORMS: 'rogue,hidden' }) };
  console.log(name, 'done');
}
writeFileSync(file, JSON.stringify(out, null, 1));
