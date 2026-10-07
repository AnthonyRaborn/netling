// What does the clinic do? Compares ways to handle bugs and the healing items for a base archetype: no way to clear them, the earlier
// home clearing (15 scrip or 2 Standing at a check-in), and clinics at several shares of market nodes. The healing items (Coolant cell, Repair
// kit, Antivirus patch) are sold only at clinics unless a row says otherwise.
// Usage: node prototype/netling2/sim/clinic-sweep.mjs [lives=300] [bases=casual,worker,attentive,overclocker]
process.env.TZ = 'UTC';
const { ARCHETYPES, simulate, stats } = await import('./balance.mjs');
const { RUN_CFG } = await import('./netrun/run.js');
const { BUG_CFG } = await import('./sim.js');
const lives = Number(process.argv[2] ?? 300);
const bases = (process.argv[3] ?? 'casual,worker,attentive,overclocker').split(',');
const cases = {
  'no way to clear': { clinic: { clinicShare: 0, healingOnlyAtClinic: false }, home: false },
  'home clearing (earlier rules)': { clinic: { clinicShare: 0, healingOnlyAtClinic: false }, home: true },
  'clinic 10%': { clinic: { clinicShare: 0.1, healingOnlyAtClinic: true }, home: false },
  'clinic 25%': { clinic: { clinicShare: 0.25, healingOnlyAtClinic: true }, home: false },
  'clinic 50%': { clinic: { clinicShare: 0.5, healingOnlyAtClinic: true }, home: false },
  'clinic 25%, healing also in markets': { clinic: { clinicShare: 0.25, healingOnlyAtClinic: false }, home: false },
};
for (const base of bases) {
  for (const [name, c] of Object.entries(cases)) {
    Object.assign(RUN_CFG, c.clinic);
    BUG_CFG.homeClear = c.home;
    const st = stats(Array.from({ length: lives }, (_, i) => simulate(ARCHETYPES[base], i + 1)));
    console.log(JSON.stringify({ base, case: name, fullLife: st.fullLife, faults: st.mistakes, bugsAvg: st.bugs.avg, bugsEnd: st.bugs.end, ceilingLives: st.bugs.atCeiling, clinicVisits: st.bugs.clinicVisits, cleared: st.bugs.fixed, scripSpent: st.bugs.scripSpent, standingSpent: st.bugs.standingSpent, scripEnd: st.scrip.end, bought: st.scrip.bought, runs: st.netruns.runs }));
  }
}
