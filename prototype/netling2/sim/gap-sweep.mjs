// How long can a player be away? Runs the casual archetype with check-ins spaced evenly every `gap` hours from 07:00 to 23:00 and reports
// the full-life rate: survival depends on the longest awake gap, not on the number of check-ins.
// Usage: node prototype/netling2/sim/gap-sweep.mjs [lives=200] [gaps=2,3,4,5,6,8]   (SIM=1.0 runs 1.0's simulator, tools/balance.mjs, for comparison)
process.env.TZ = 'UTC';
const { ARCHETYPES, simulate, stats } = await import(process.env.SIM === '1.0' ? '../../../tools/balance.mjs' : './balance.mjs');
const lives = Number(process.argv[2] ?? 200);
const gaps = (process.argv[3] ?? '2,3,4,5,6,8').split(',').map(Number);
for (const gap of gaps) {
  const checks = [];
  for (let h = 7; h <= 23; h += gap) checks.push(h * 60);
  const st = stats(Array.from({ length: lives }, (_, i) => simulate({ ...ARCHETYPES.casual, checks, jitter: 20 }, i + 1)));
  console.log(JSON.stringify({ sim: process.env.SIM ?? '2.0', gapHours: gap, checkInsADay: checks.length, fullLife: st.fullLife, faults: st.mistakes, deaths: st.deaths }));
}
