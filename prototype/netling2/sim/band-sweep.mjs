// A band on Charge (Wetware) or Sync (Program): who pays? Hidden strain builds above `hi` and under `lo` while awake and drives the base infection
// hazard. Usage: node prototype/netling2/sim/band-sweep.mjs <charge|sync> [lives=400] [archetypes]
process.env.TZ = 'UTC';
const stat = process.argv[2] ?? 'charge';
const lives = Number(process.argv[3] ?? 400);
const bases = (process.argv[4] ?? 'attentive,sysadmin,casual,worker,human-regular,daredevil,overclocker').split(',');
const { ARCHETYPES, simulate, stats } = await import('./balance.mjs');
const { BANDS } = await import('./sim.js');
const cases = {
  'off': { on: false },
  'hi 85': { on: true, hi: 85 },
  'hi 90': { on: true, hi: 90 },
  'hi 95': { on: true, hi: 95 },
  'lo 25': { on: true, lo: 25, hi: 101 },
  'lo 15': { on: true, lo: 15, hi: 101 },
  'band 25 to 95': { on: true, lo: 25, hi: 95 },
};
const fresh = { ...BANDS[stat] };
for (const base of bases) {
  for (const [name, c] of Object.entries(cases)) {
    Object.assign(BANDS[stat], fresh, c);
    let high = 0, awake = 0, smax = [];
    const rs = [];
    for (let i = 1; i <= lives; i++) {
      let mx = 0;
      globalThis.__sample = (s) => { if (s.stage !== 'dead') { awake++; if ((s.strain?.[stat] ?? 0) >= BANDS[stat].line) high++; mx = Math.max(mx, s.strain?.[stat] ?? 0); } };
      rs.push(simulate({ ...ARCHETYPES[base] }, i)); smax.push(mx);
    }
    const st = stats(rs);
    console.log(JSON.stringify({ base, case: name, fullLife: st.fullLife, infections: st.pressure.viruses, mistakes: st.mistakes, temper: st.temper, strainHighShare: +(high / awake).toFixed(3), strainMaxMedian: +smax.sort((a, b) => a - b)[Math.floor(smax.length / 2)].toFixed(1) }));
  }
}
