// How irregular can a player be? Runs the human-casual archetype with a usual number of check-ins a day (perDay), with and without busy
// and off days (a quarter of days with 1 or 2 check-ins and a tenth with 0 or 1) and with and without lapses (a chore skipped one time in
// five), and reports the full-life rate and median days lived. Compare with gap-sweep.mjs: regular spacing survives on far fewer check-ins.
// Usage: node prototype/netling2/sim/human-sweep.mjs [lives=200] [perDay=4,6,8,10,12,16]
process.env.TZ = 'UTC';
const { ARCHETYPES, simulate, stats } = await import('./balance.mjs');
const lives = Number(process.argv[2] ?? 200);
const counts = (process.argv[3] ?? '4,6,8,10,12,16').split(',').map(Number);
const cases = { 'random times': { busyDay: 0, offDay: 0, lapse: 0 }, '+ lapses': { busyDay: 0, offDay: 0, lapse: 0.2 }, '+ busy and off days': { busyDay: 0.25, offDay: 0.1, lapse: 0 }, '+ both': { busyDay: 0.25, offDay: 0.1, lapse: 0.2 } };
for (const [name, c] of Object.entries(cases)) {
  for (const perDay of counts) {
    const st = stats(Array.from({ length: lives }, (_, i) => simulate({ ...ARCHETYPES['human-casual'], perDay, ...c }, i + 1)));
    console.log(JSON.stringify({ case: name, perDay, fullLife: st.fullLife, medianDays: st.medianDays, faults: st.mistakes, adult: st.adult }));
  }
}
