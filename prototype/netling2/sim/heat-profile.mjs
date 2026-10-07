// Where does Heat sit? Share of awake minutes (not resting) at each Heat band, and Heat on waking, per archetype. For deciding whether a
// "too cold" pressure on Iron would fall on ordinary play. Usage: node prototype/netling2/sim/heat-profile.mjs [lives=200] [archetypes]
process.env.TZ = 'UTC';
const { ARCHETYPES, simulate } = await import('./balance.mjs');
const { resting } = await import('./sim.js');
const lives = Number(process.argv[2] ?? 200);
const bases = (process.argv[3] ?? 'attentive,casual,worker,human-regular,sysadmin,daredevil,overclocker').split(',');
const BANDS = [10, 20, 30, 40, 50, 65, 80, 101];
for (const base of bases) {
  const awake = Array(BANDS.length).fill(0), rest = Array(BANDS.length).fill(0); let nAwake = 0, nRest = 0, wake = [], was = false, minHeat = [];
  for (let seed = 1; seed <= lives; seed++) {
    let low = 100;
    globalThis.__sample = (s) => {
      if (s.stage === 'dead') return;
      const h = s.stats.heat, i = BANDS.findIndex((b) => h < b), r = resting(s);
      if (r) { rest[i]++; nRest++; } else { awake[i]++; nAwake++; }
      if (was && !r) wake.push(h);
      was = r; low = Math.min(low, h);
    };
    simulate({ ...ARCHETYPES[base] }, seed); minHeat.push(low);
  }
  const pc = (a, n) => a.map((x) => Math.round((100 * x) / n));
  const med = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
  console.log(JSON.stringify({ base, bands: '<10 <20 <30 <40 <50 <65 <80 80+', awakePct: pc(awake, nAwake), restPct: pc(rest, nRest), heatOnWaking: wake.length ? med(wake) : null, lifeMinHeatMedian: med(minHeat) }));
}
