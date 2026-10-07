// How much play does the Metronome's 12 hour hold take? Runs a temper seeker with check-ins every `gap` hours from 07:00 to 23:00 and reports the
// share of lives that held a strong temper level for 12 awake hours (neglect level 2 paused), the median day of the first hold, and the full-life rate.
// Run it with PREF='{"on":false}' for the same sweep without care preferences.
// Usage: node prototype/netling2/sim/temper-sweep.mjs [lives=200] [gaps=1,2,3,4,6] [archetypes=seek-steady,seek-unsteady,seek-unsteady-segfault]
process.env.TZ = 'UTC';
const { ARCHETYPES, simulate, stats } = await import('./balance.mjs');
const lives = Number(process.argv[2] ?? 200);
const gaps = (process.argv[3] ?? '1,2,3,4,6').split(',').map(Number);
const names = (process.argv[4] ?? 'seek-steady,seek-unsteady,seek-unsteady-segfault').split(',');
for (const name of names) {
  for (const gap of gaps) {
    const checks = [];
    for (let h = 7; h <= 23; h += gap) checks.push(h * 60);
    const st = stats(Array.from({ length: lives }, (_, i) => simulate({ ...ARCHETYPES[name], checks }, i + 1)));
    const steady = name === 'seek-steady';
    console.log(JSON.stringify({ name, checkInsADay: checks.length, hold12h: steady ? st.hold12h.strongSteady : st.hold12h.strongUnsteady, medianDay: steady ? st.holdDay.strongSteady : st.holdDay.strongUnsteady, hold24h: steady ? st.hold24h.strongSteady : st.hold24h.strongUnsteady, fullLife: st.fullLife, faults: st.mistakes, bugsAtCeiling: st.bugs.atCeiling }));
  }
}
