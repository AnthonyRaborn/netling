// The clinic against the final egg-pressure design: share of market nodes and scrip fee, per egg, per archetype. Each egg runs with its
// own pressure (Iron: wear and Overclock x3; Program: Overdrive; Wetware: Overlink with its brake), owner multiplier 3, tripled benefits
// and doubled costs as in docs/NETLING_2_EGG_PRESSURES.md. Usage: node prototype/netling2/sim/clinic-final.mjs [lives=150] [bases]
process.env.TZ = 'UTC';
const lives = Number(process.argv[2] ?? 150);
const bases = (process.argv[3] ?? 'casual,worker,attentive,human-regular,overclocker').split(',');
const { ARCHETYPES, simulate, stats } = await import('./balance.mjs');
const { RUN_CFG } = await import('./netrun/run.js');
const { BUG_CFG, SIDES, IRON } = await import('./sim.js');
const finalSides = {
  charge: { hi: 80, hold: 180, exit: 65, gate: 0, slow: 0, bleed: 8, overflow: 2, playGain: 0.45, drop: 0.75 },
  sync: { hi: 85, hold: 180, exit: 70, swing: 0, steadyDecay: 0, calm: 0, dull: 0.3, virus: 1.2, visit: 0.75, drop: 0.75, penStep: 0.1, penFree: 90, penCap: 0.9, burnN: 2, burnCool: 1440 },
};
const eggs = { iron: null, program: 'charge', wetware: 'sync' };
const cases = {
  'share 10%': { clinicShare: 0.1, clearScrip: 15 },
  'share 25% (now)': { clinicShare: 0.25, clearScrip: 15 },
  'share 40%': { clinicShare: 0.4, clearScrip: 15 },
  'fee 10 scrip': { clinicShare: 0.25, clearScrip: 10 },
  'fee 25 scrip': { clinicShare: 0.25, clearScrip: 25 },
};
for (const base of bases) {
  for (const [egg, owner] of Object.entries(eggs)) {
    Object.assign(SIDES.charge, finalSides.charge);
    Object.assign(SIDES.sync, finalSides.sync);
    SIDES.on = true; SIDES.owner = owner; SIDES.ownerMult = 3; IRON.on = egg === 'iron';
    for (const [name, c] of Object.entries(cases)) {
      RUN_CFG.clinicShare = c.clinicShare; RUN_CFG.healingOnlyAtClinic = true;
      BUG_CFG.clearScrip = c.clearScrip; BUG_CFG.homeClear = false;
      const st = stats(Array.from({ length: lives }, (_, i) => simulate({ ...ARCHETYPES[base] }, i + 1)));
      console.log(JSON.stringify({ base, egg, case: name, fullLife: st.fullLife, faults: st.mistakes, bugsAvg: st.bugs.avg, bugsEnd: st.bugs.end, ceilingLives: st.bugs.atCeiling, visits: st.bugs.clinicVisits, cleared: st.bugs.fixed, scripSpent: st.bugs.scripSpent, standingSpent: st.bugs.standingSpent, runs: st.netruns?.runs }));
    }
  }
}
