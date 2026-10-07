// Does the soft push to run get a bugged player to a clinic? Compares a base archetype with no push, with the netling's own statements only
// (a bugged player goes for a netrun with chance `pushRuns` despite their usual reluctance), with the clinic job on the job board as well, and
// with a player who always goes. Compare with clinic-sweep.mjs: the clinic is the only way to clear a bug.
// Usage: node prototype/netling2/sim/push-sweep.mjs [lives=300] [bases=worker,human-regular,human-casual,overclocker]
process.env.TZ = 'UTC';
const { ARCHETYPES, simulate, stats } = await import('./balance.mjs');
const lives = Number(process.argv[2] ?? 300);
const bases = (process.argv[3] ?? 'worker,human-regular,human-casual,overclocker').split(',');
const cases = {
  'no push': {},
  'statements, goes 50% of the time': { pushRuns: 0.5 },
  'statements + job board, goes 50%': { pushRuns: 0.5, contracts: true },
  'job board only (no push)': { contracts: true },
  'statements + job board, always goes': { pushRuns: 1, contracts: true },
};
for (const base of bases) {
  for (const [name, c] of Object.entries(cases)) {
    const st = stats(Array.from({ length: lives }, (_, i) => simulate({ ...ARCHETYPES[base], ...c }, i + 1)));
    console.log(JSON.stringify({ base, case: name, fullLife: st.fullLife, faults: st.mistakes, bugsAvg: st.bugs.avg, bugsEnd: st.bugs.end, ceilingLives: st.bugs.atCeiling, clinicVisits: st.bugs.clinicVisits, cleared: st.bugs.fixed, runs: st.netruns.runs, scripEnd: st.scrip.end, disconnects: st.netruns.disconnects }));
  }
}
