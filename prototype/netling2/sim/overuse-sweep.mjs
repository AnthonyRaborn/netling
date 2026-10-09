// OVERUSE (sim.js): basic costs for feeding, playing and heating past a line on every egg, and the owner's hidden strain (Program: overfeeding,
// Wetware: overplaying; Iron keeps its wear). Runs one egg on the decided settings (baseline/run-all.mjs, decided-<egg>, copied here) with an
// OVERUSE variant and reports, per archetype and on average: full life, faults, infections, overfeeds, overplays and overheats a life, the
// owner's strain (peak and awake share at the warning line), breaks (all, the owner's state, and those the strain trigger fired: BRAKE.strainBreak,
// set it through the bot env json, e.g. '{"BRAKE":"{\\"on\\":true,\\"strainBreak\\":80}"}') and win drops.
// Usage: node prototype/netling2/sim/overuse-sweep.mjs <iron|program|wetware> [lives=200] [archetypes|all] [OVERUSE json|off] [bot env json]
// Example: ... overuse-sweep.mjs program 200 all '{"on":true}' '{"FEEDBOT":"greedy"}'
process.env.TZ = 'UTC';
const egg = process.argv[2];
if (!['iron', 'program', 'wetware'].includes(egg)) throw new Error('give the egg: iron, program or wetware');
const lives = Number(process.argv[3] ?? 200);
const variant = process.argv[5] ?? '{"on":true}';
const FINAL_SIDES = {
  charge: { hi: 80, hold: 180, exit: 65, gate: 0, slow: 0, bleed: 8, overflow: 2, playGain: 0.45, drop: 0.75 },
  sync: { hi: 85, hold: 180, exit: 70, swing: 0, steadyDecay: 0, calm: 0, dull: 0.3, virus: 1.2, visit: 0.75, drop: 0.75, penStep: 0.1, penFree: 90, penCap: 0.9, burnN: 2, burnCool: 1440 },
};
Object.assign(process.env, {
  NR2: 'all', PERKS: '1', BRAKE: '{"on":true}', STAGE: JSON.stringify({ on: true, rest: { on: true } }), STANDINGGAIN: '2',
  BUGS: JSON.stringify({ standingOnlyIfShort: true, clearStanding: 5 }),
  SIDES: JSON.stringify({ on: true, owner: { iron: null, program: 'charge', wetware: 'sync' }[egg], ownerMult: 3, teenStates: true, ...(egg === 'iron' ? { ironBenefit: 3 } : {}), ...FINAL_SIDES }),
  ...JSON.parse(process.argv[6] ?? '{}'),
});
if (egg === 'iron') process.env.IRON = '{"on":true}';
if (variant !== 'off') process.env.OVERUSE = variant;
const { ARCHETYPES, simulate, stats } = await import('./balance.mjs');
const { SIDE_METER } = await import('./sim.js');
const names = !process.argv[4] || process.argv[4] === 'all' ? Object.keys(ARCHETYPES) : process.argv[4].split(',');
const per = (n) => +(n / lives).toFixed(2);
const rows = [];
for (const n of names) {
  for (const k of Object.keys(SIDE_METER)) SIDE_METER[k] = 0;
  let awake = 0, high = 0, peak = 0;
  globalThis.__sample = (s) => {
    if (s.stage === 'dead' || s.asleep || s.nap) return;
    awake++;
    const v = egg === 'iron' ? s.wear ?? 0 : s.ostrain ?? 0;
    if (v >= 50) high++;
    if (v > peak) peak = v;
  };
  const st = stats(Array.from({ length: lives }, (_, i) => simulate({ ...ARCHETYPES[n] }, i + 1)));
  const r = { egg, archetype: n, fullLife: st.fullLife, faults: st.mistakes, infections: st.pressure?.viruses, overfeeds: per(SIDE_METER.overfeeds), overplays: per(SIDE_METER.overplays), overheats: per(SIDE_METER.overheats), strainHigh: +(high / Math.max(1, awake)).toFixed(3), breaks: per(SIDE_METER.brakes), strainBreaks: per(SIDE_METER.brakeByStrain), ownBreaks: per(SIDE_METER[{ iron: 'brakeHeat', program: 'brakeCharge', wetware: 'brakeSync' }[egg]]), drops: per(SIDE_METER.drops), overfeedCaches: per(SIDE_METER.overfeedCaches), teenCertain: st.atTeen?.leanCertain ?? null, teenTied: st.atTeen?.tied ?? null, teenGap: st.atTeen?.gap ?? null };
  rows.push(r);
  console.log(JSON.stringify(r));
}
const mean = (k) => +(rows.reduce((a, r) => a + (r[k] ?? 0), 0) / rows.length).toFixed(3);
console.log(JSON.stringify({ egg, variant, bot: process.argv[6] ?? null, archetypes: rows.length, mean: { fullLife: mean('fullLife'), faults: mean('faults'), infections: mean('infections'), breaks: mean('breaks'), ownBreaks: mean('ownBreaks'), strainBreaks: mean('strainBreaks'), overfeeds: mean('overfeeds'), overplays: mean('overplays'), overheats: mean('overheats'), strainHigh: mean('strainHigh'), drops: mean('drops'), teenTied: mean('teenTied'), teenCertain: mean('teenCertain'), teenGap: mean('teenGap'), overfeedCaches: mean('overfeedCaches') } }));
