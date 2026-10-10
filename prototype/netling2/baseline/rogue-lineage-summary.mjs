// Rogue, simulator stage 3: reads results/followup/rogue-lineage-<job>.json (rogue-lineage.mjs) and prints, for the attentive group, one row per
// job (means over the archetypes, the worst archetype where it says so) and one row per archetype for the decided job. The group means leave out
// the archetypes that never jack in (no Source run in any Rogue life): such a player could not have passed the Rogue gate, which needs a Source exit.
// Usage: node prototype/netling2/baseline/rogue-lineage-summary.mjs
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = join(dirname(fileURLToPath(import.meta.url)), 'results', 'followup');
const JOBS = [['decided (accept the offer, Rogue again)', 'decided'], ['refuse every offer', 'refuse'], ['one NL-0 life after a capture', 'back'], ["lever: every Rogue elder at 1.0's feat", 'tier1']];
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const pct = (x) => (x * 100).toFixed(0);
const row = (o) => [pct(o.reached), pct(o.reachedBy[1]), pct(o.reachedBy[3]), pct(o.reachedBy[5]), o.firstGoodEnd.rogueLives.median, o.firstGoodEnd.lives.median, o.firstGoodEnd.days.median, pct(o.firstGoodEnd.atExit),
  pct(o.perRogueLife.elder), pct(o.perRogueLife.sourceExit), pct(o.perRogueLife.cleanExit), pct(o.perRogueLife.goodEnd), (o.perRogueLife.captured * 100).toFixed(1), pct(o.afterExit.lostIt), o.goodEndsPerLine];
const HEAD = '| reached in 10 Rogue lives | by 1 / 3 / 5 | first good end: Rogue life / life / day (medians) | at the exit | per Rogue life: elder / Source exit / clean exit / good end | captured | exited, no good end | good ends a line |';
const SEP = '|---|---|---|---|---|---|---|---|---|';
let first = null;
for (const [label, job] of JOBS) {
  const f = join(dir, `rogue-lineage-${job}.json`);
  if (!existsSync(f)) continue;
  const D = JSON.parse(readFileSync(f, 'utf8'));
  const A = Object.values(D.archetypes).filter((o) => o.perRogueLife.sourceRun > 0);
  if (!first) {
    first = D;
    const none = Object.keys(D.archetypes).filter((a) => !(D.archetypes[a].perRogueLife.sourceRun > 0));
    console.log(`Attentive group: ${A.length} archetypes that run (left out, they never jack in: ${none.join(', ')}), ${D.lineages} lines of ${D.rogueLives} Rogue lives each.\n`);
    console.log(`| bot rules ${HEAD}`);
    console.log(`|---${SEP}`);
  }
  const m = (get) => mean(A.map(get));
  const worst = Math.min(...A.map((o) => o.reached));
  console.log(`| ${label} | ${pct(m((o) => o.reached))} (worst ${pct(worst)}) | ${pct(m((o) => o.reachedBy[1]))} / ${pct(m((o) => o.reachedBy[3]))} / ${pct(m((o) => o.reachedBy[5]))} | ${m((o) => o.firstGoodEnd.rogueLives.median).toFixed(1)} / ${m((o) => o.firstGoodEnd.lives.median).toFixed(1)} / ${m((o) => o.firstGoodEnd.days.median).toFixed(1)} | ${pct(m((o) => o.firstGoodEnd.atExit))} | ${pct(m((o) => o.perRogueLife.elder))} / ${pct(m((o) => o.perRogueLife.sourceExit))} / ${pct(m((o) => o.perRogueLife.cleanExit))} / ${pct(m((o) => o.perRogueLife.goodEnd))} | ${(m((o) => o.perRogueLife.captured) * 100).toFixed(1)} | ${pct(m((o) => o.afterExit.lostIt))} | ${m((o) => o.goodEndsPerLine).toFixed(2)} |`);
}
if (first) {
  console.log('\nBy archetype (decided bot rules):\n');
  console.log('| archetype | reached | by 1 | by 3 | by 5 | Rogue life | life | day | at exit | elder | Source exit | clean | good end | captured | exited, no good end | good ends a line |');
  console.log('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const [a, o] of Object.entries(first.archetypes)) console.log(`| ${a} | ${row(o).join(' | ')} |`);
}
