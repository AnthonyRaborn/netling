// Rogue, simulator stage 3 (the lineage side): sim/rogue-lineage.mjs for each archetype of the attentive group (the 26 hourly archetypes) under
// the decided settings and a few bot rules. One file an archetype and job in results/followup/rogue-lineage/<job>/ (resumable: a file that exists
// is skipped), then results/followup/rogue-lineage-<job>.json with every archetype. Summary: rogue-lineage-summary.mjs.
// Usage: node prototype/netling2/baseline/rogue-lineage.mjs [lineages=200] [rogueLives=10] [--jobs=4] [jobFilter: a substring, or a comma list of jobs]
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
// ARCH=a,b runs only those archetypes now (the combined file still waits for the whole group).
const RUN_NOW = process.env.ARCH ? new Set(process.env.ARCH.split(',')) : null;
// Stage 3's first jobs (2026-10-10) pin its rules so their saved outputs reproduce: any Source exit arms the good end, and the hatchling after it
// takes the chosen egg's latest fragment as its parent.
const STAGE3 = { ROGUE: '{"armClean":false,"goodEndFullLife":false}', PARENT: 'fragment', CROSS: 'open', INHERIT: '{"fullLife":false}', ROGUE_TRAIT: '0' };
const NO_TRAIT = { ROGUE_TRAIT: '0' }; // the clean jobs were measured before the Rogue trait
const JOBS = {
  decided: { ...STAGE3 }, // MERGEBOT=accept, PICK=first, LINEBOT=stay
  refuse: { ...STAGE3, MERGEBOT: 'refuse' }, // every offer declined: the good end only at death
  back: { ...STAGE3, LINEBOT: 'back' }, // one NL-0 life after a capture
  tier1: { ...STAGE3, FEAT: '1' }, // a lever: every Rogue elder at 1.0's feat (three Deep exits or two clean)
  // The decisions of 2026-10-11 (docs/archive/netling2/ROGUE_DRAFTS.md 6.1, items 41 to 47), now the defaults: only a clean Source exit arms the good end,
  // any egg can follow it, the mixed egg's parent is the Rogue, only a full life passes the trait line (and only an old-age death of an armed
  // elder is the good end), and the crossings between Rogue and the NL-0 eggs are gated.
  clean: { ...NO_TRAIT }, // MERGEBOT=accept, PICK=first (the mixed egg in the first NL-0 egg completed), LINEBOT=stay
  'clean-refuse': { ...NO_TRAIT, MERGEBOT: 'refuse' }, // the clean exit's offer declined: the good end at death if still armed
  'clean-rogue': { ...NO_TRAIT, PICK: 'rogue' }, // Rogue again after every good end: no mixed egg, every life a Rogue life
  // The Rogue trait (decided 2026-10-11, 9.4a C1 and E1; sim.js ROGUE_TRAIT), on the fork's defaults: every rule decided so far.
  trait: {},
  // Levers for the gap between the lines (docs/archive/netling2/ROGUE_DRAFTS.md 7.8; nr2.js rogue.source, all off by default), on top of the trait job.
  ...Object.fromEntries(Object.entries({
    breach1: { breachFree: 1 }, // Mole and Sleeper: one lost ordinary fight in the Source still exits clean
    tune: { tuneTypes: true }, // Spook and Handler: every Source ICE's game and tier from the start
    feast2: { feastHeal: 2 }, feast3: { feastHeal: 3 }, // Drop and Stash: the won-fight heal in the Source x2, x3
    dodge75: { dodgeSlip: 0.75 }, dodge50: { dodgeSlip: 0.5 }, // Skip and Exile: the slip in the Source cut by a quarter, by half
    help: { breachFree: 1, tuneTypes: true, feastHeal: 2 }, // the three helps together
    'help-dodge75': { breachFree: 1, tuneTypes: true, feastHeal: 2, dodgeSlip: 0.75 },
    'help3-dodge50': { breachFree: 1, tuneTypes: true, feastHeal: 3, dodgeSlip: 0.5 },
    // Second round (7.9): Feast clean at an Integrity threshold, with the heal x1 or x2; Tune's reroll and nullify at 1 a run for the adult and
    // 1 or 2 for the elder.
    'fclean80': { feastClean: 80 }, 'fclean90': { feastClean: 90 }, 'fclean100': { feastClean: 100 },
    'fclean80-h2': { feastClean: 80, feastHeal: 2 }, 'fclean90-h2': { feastClean: 90, feastHeal: 2 }, 'fclean100-h2': { feastClean: 100, feastHeal: 2 },
    'reroll1': { tuneReroll: { 1: 1, 2: 1 } }, 'reroll2': { tuneReroll: { 1: 1, 2: 2 } },
    'null1': { tuneNullify: { 1: 1, 2: 1 } }, 'null2': { tuneNullify: { 1: 1, 2: 2 } },
    // The packages (7.9): each line at about Dodge's 65% ('even'), and a softer one with nullify in place of the reroll.
    even: { breachFree: 1, feastClean: 80, feastHeal: 2, tuneReroll: { 1: 1, 2: 2 } },
    softer: { breachFree: 1, feastClean: 90, feastHeal: 2, tuneNullify: { 1: 1, 2: 2 } },
    // Third round (7.10), the lines toward about 50%: Breach's free loss as a chance, then the package (Dodge's Source slip x0.5, Feast clean at 80
    // (heal x1), Tune's reroll 1 for the adult and the elder, Breach at the chance chosen from the steerer jobs).
    'bchance50': { breachFree: 1, breachChance: 0.5 }, 'bchance60': { breachFree: 1, breachChance: 0.6 },
    fifty: { breachFree: 1, breachChance: 0.5, dodgeSlip: 0.5, feastClean: 80, tuneReroll: { 1: 1, 2: 1 } },
    // The lines at about 35% (7.11; kept for tuning after a playtest): Breach's chance and Dodge's slip searched here; Feast clean at 100 and Tune's
    // nullify 1 come from fclean100 and null1.
    'bchance20': { breachFree: 1, breachChance: 0.2 }, 'bchance25': { breachFree: 1, breachChance: 0.25 },
    'dodge25': { dodgeSlip: 0.25 }, 'dodge10': { dodgeSlip: 0.1 }, 'dodge0': { dodgeSlip: 0 },
    thirtyfive: { breachFree: 1, breachChance: 0.2, dodgeSlip: 0, feastClean: 100, tuneNullify: { 1: 1, 2: 1 } },
  }).map(([job, source]) => [job, { ROGUE_RUN: JSON.stringify({ source }) }])),
  // Uneven per-game skill (SPREAD 0.2, as the Foresight sweep's middle value), for the tuneTypes lever's game half: the trait job and the lever.
  'trait-spread': { SPREAD: '0.2' },
  'tune-spread': { SPREAD: '0.2', ROGUE_RUN: JSON.stringify({ source: { tuneTypes: true } }) },
};
// jobFilter: a comma list of job names (exact), or one substring as before.
const wanted = (job) => !filter || (filter.includes(',') ? filter.split(',').includes(job) : job.includes(filter));
// Every job above was measured with the Source levers off (nr2.js rogue.source neutral), so each runs with ROGUE_SOURCE=0 and its own levers
// on top; the decided defaults since 2026-10-11 (7.11, the fifty set) are the 'fifty' job's levers, and 'decided-fifty' runs them as the defaults.
JOBS['decided-fifty'] = { ROGUE_SOURCE: '' };
// decided-deep (7.12): the fork's defaults since then, the Deep's ambushes lowered (share 0.15, none in the cordon); compare with fifty.
JOBS['decided-deep'] = { ROGUE_SOURCE: '', ROGUE_DEEP: '' };
const todo = [];
for (const [job, env] of Object.entries(JOBS)) {
  if (!wanted(job)) continue;
  mkdirSync(join(out, 'rogue-lineage', job), { recursive: true });
  for (const a of ATT) if ((!RUN_NOW || RUN_NOW.has(a)) && !existsSync(join(out, 'rogue-lineage', job, `${a}.json`))) todo.push([job, env, a]);
}
console.log(`${todo.length} runs to do, ${lineages} lines of ${rogueLives} Rogue lives, ${jobsAtOnce} at once`);
const run = ([job, env, a]) => new Promise((resolve) => {
  const p = spawn(process.execPath, [driver, a, String(lineages), String(rogueLives)], { env: { ...process.env, ARCH: '', ROGUE_SOURCE: '0', ROGUE_DEEP: '0', ROGUE_FEED: '0', ...env, JSON: '1' } });
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
for (const job of Object.keys(JOBS).filter(wanted)) {
  const files = ATT.map((a) => join(out, 'rogue-lineage', job, `${a}.json`));
  if (!files.every(existsSync)) continue;
  const archetypes = Object.fromEntries(ATT.map((a, i) => [a, JSON.parse(readFileSync(files[i], 'utf8'))]));
  const first = Object.values(archetypes)[0];
  writeFileSync(join(out, `rogue-lineage-${job}.json`), JSON.stringify({ job, lineages: first.lineages, rogueLives: first.rogueLives, archetypes }, null, 1));
}
