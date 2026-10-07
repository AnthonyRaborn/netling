// How should a player handle bugs, and what does each way cost? Runs a base archetype under different bug policies (when to clear and what to
// pay with) and reports survival, faults, how many bugs it carried and for how long, what the clearing cost in scrip and Standing, and what
// that did to its Standing lean (a Standing payment erodes the lean a steerer is building).
// Usage: node prototype/netling2/sim/bug-sweep.mjs [lives=300] [bases=casual,worker] [policies=all]
// Use BUGS='{"chance":0.5,"max":8}' for a harsher bug rule.
process.env.TZ = 'UTC';
const { ARCHETYPES, simulate, stats } = await import('./balance.mjs');
const lives = Number(process.argv[2] ?? 300);
const bases = (process.argv[3] ?? 'casual,worker').split(',');
export const POLICIES = {
  ignore: { mode: 'none' },
  'scrip, at once': { mode: 'scrip', at: 1 },
  'scrip, from 2 bugs': { mode: 'scrip', at: 2 },
  'scrip, at the ceiling': { mode: 'scrip', at: 5 },
  'Standing, even split': { mode: 'standing', split: 'even' },
  'Standing, from the leader': { mode: 'standing', split: 'leader' },
  'Standing, from the trailer': { mode: 'standing', split: 'trailer' },
  'scrip, then Standing': { mode: 'both', split: 'even' },
};
const wanted = process.argv[4] && process.argv[4] !== 'all' ? process.argv[4].split(',') : Object.keys(POLICIES);
for (const base of bases) {
  for (const name of wanted) {
    const p = { ...ARCHETYPES[base], fix: POLICIES[name] };
    const st = stats(Array.from({ length: lives }, (_, i) => simulate(p, i + 1)));
    console.log(JSON.stringify({
      base, policy: name, fullLife: st.fullLife, faults: st.mistakes, bugsAvg: st.bugs.avg, bugsEnd: st.bugs.end, ceilingLives: st.bugs.atCeiling, ceilingTime: st.bugs.ceilingTime,
      cleared: st.bugs.fixed, scripSpent: st.bugs.scripSpent, standingSpent: st.bugs.standingSpent, scripEnd: st.scrip.end, adultGap: st.atAdult?.gap, temper: st.temper,
    }));
  }
}
