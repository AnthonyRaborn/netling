// Rogue, the levers for the gap between the lines (docs/NETLING_2_ROGUE_DRAFTS.md 7.8): reads results/followup/rogue-lineage/<job>/<archetype>.json
// (baseline/rogue-lineage.mjs) and prints, per job, each line's two steerers (corp and street) per Rogue life: good end, clean Source exit, Source
// exit, the good end in the first Rogue life, captured; then, for the jobs run on the whole attentive group, the group means as 7.7 gives them.
// Usage: node prototype/netling2/baseline/rogue-levers-summary.mjs
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = join(dirname(fileURLToPath(import.meta.url)), 'results', 'followup', 'rogue-lineage');
const JOBS = ['trait', 'breach1', 'tune', 'feast2', 'feast3', 'dodge75', 'dodge50', 'help', 'help-dodge75', 'help3-dodge50', 'trait-spread', 'tune-spread', 'fclean80', 'fclean90', 'fclean100', 'fclean80-h2', 'fclean90-h2', 'fclean100-h2', 'reroll1', 'reroll2', 'null1', 'null2', 'even', 'softer', 'bchance50', 'bchance60', 'fifty', 'bchance20', 'bchance25', 'dodge25', 'dodge10', 'dodge0', 'thirtyfive'];
const LINES = ['breach', 'dodge', 'tune', 'feast'];
const OUT = new Set(['corpo', 'runner', 'overclocker', 'casual', 'worker', 'hunter-casual', 'human-casual', 'human-regular', 'human-keen', 'human-bursty', 'neglectful']);
const { ARCHETYPES } = await import('../sim/balance.mjs');
const ATT = Object.keys(ARCHETYPES).filter((n) => !OUT.has(n));
const read = (job, a) => (existsSync(join(dir, job, `${a}.json`)) ? JSON.parse(readFileSync(join(dir, job, `${a}.json`), 'utf8')) : null);
const pct = (x) => (x * 100).toFixed(0);
const range = (xs) => (Math.round(xs[0] * 100) === Math.round(xs[1] * 100) ? pct(xs[0]) : `${pct(Math.min(...xs))} to ${pct(Math.max(...xs))}`);

console.log('Per Rogue life, by line (its corp and street steerers): good end / clean Source exit / Source exit / good end in the first Rogue life / captured\n');
console.log(`| job | ${LINES.join(' | ')} |`);
console.log(`|---|${LINES.map(() => '---').join('|')}|`);
for (const job of JOBS) {
  const cells = LINES.map((l) => {
    const o = ['corp', 'street'].map((side) => read(job, `steer-${l}-${side}`));
    if (o.some((x) => !x)) return 'n/a';
    const p = (f) => range(o.map(f));
    return `${p((x) => x.perRogueLife.goodEnd)} / ${p((x) => x.perRogueLife.cleanExit)} / ${p((x) => x.perRogueLife.sourceExit)} / ${p((x) => x.reachedBy[1])} / ${p((x) => x.perRogueLife.captured)}`;
  });
  console.log(`| ${job} | ${cells.join(' | ')} |`);
}

console.log('\nThe attentive group (the archetypes that run; means, worst archetype in brackets), for the jobs run on all of it:\n');
console.log('| job | good end within 10 Rogue lives | by Rogue life 1 / 3 / 5 | first good end: Rogue lives / days | per Rogue life: elder / Source exit / clean exit / good end | captured | good ends in 10 Rogue lives |');
console.log('|---|---|---|---|---|---|---|');
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
for (const job of JOBS) {
  const all = ATT.map((a) => read(job, a));
  if (all.some((x) => !x)) continue;
  const A = all.filter((o) => o.perRogueLife.sourceRun > 0);
  const m = (f) => mean(A.map(f));
  console.log(`| ${job} | ${pct(m((o) => o.reached))} (${pct(Math.min(...A.map((o) => o.reached)))}) | ${pct(m((o) => o.reachedBy[1]))} / ${pct(m((o) => o.reachedBy[3]))} / ${pct(m((o) => o.reachedBy[5]))} | ${m((o) => o.firstGoodEnd.rogueLives.median).toFixed(1)} / ${m((o) => o.firstGoodEnd.days.median).toFixed(1)} | ${pct(m((o) => o.perRogueLife.elder))} / ${pct(m((o) => o.perRogueLife.sourceExit))} / ${pct(m((o) => o.perRogueLife.cleanExit))} / ${pct(m((o) => o.perRogueLife.goodEnd))} | ${(m((o) => o.perRogueLife.captured) * 100).toFixed(1)}% | ${m((o) => o.goodEndsPerLine).toFixed(1)} |`);
}
