// Action-based pressure on a meter: a feed taken with Charge at or over `line`, or a game played with Sync at or over `line`, adds hidden strain
// that drives the base infection hazard. Who pays, and does a budgeting player (ACTBOT=budget skips such actions) escape it?
// Usage: node prototype/netling2/sim/act-sweep.mjs <charge|sync> [lives=400] [archetypes]
process.env.TZ = 'UTC';
const stat = process.argv[2] ?? 'charge';
const lives = Number(process.argv[3] ?? 400);
const bases = (process.argv[4] ?? 'attentive,sysadmin,casual,worker,human-regular,daredevil,overclocker').split(',');
const { ARCHETYPES, simulate, stats } = await import('./balance.mjs');
const { ACTS } = await import('./sim.js');
const lines = stat === 'charge' ? [40, 55, 70, 85] : [50, 65, 80, 90];
const cases = { 'off': { on: false } };
for (const l of lines) { cases[`line ${l}`] = { on: true, line: l }; }
for (const l of lines.slice(1, 3)) { cases[`line ${l}, budgeter`] = { on: true, line: l, bot: 'budget' }; }
const fresh = { ...ACTS[stat] };
for (const base of bases) {
  for (const [name, c] of Object.entries(cases)) {
    const { bot, ...rest } = c;
    Object.assign(ACTS[stat], fresh, rest);
    if (bot) process.env.ACTBOT = bot; else delete process.env.ACTBOT;
    const rs = []; let cnt = 0, mx = [];
    for (let i = 1; i <= lives; i++) {
      let last = null;
      globalThis.__sample = (s) => { last = s; };
      rs.push(simulate({ ...ARCHETYPES[base] }, i));
      cnt += last?.act?.count?.[stat] ?? 0; mx.push(last?.act?.max?.[stat] ?? 0);
    }
    const st = stats(rs);
    console.log(JSON.stringify({ base, case: name, fullLife: st.fullLife, infections: st.pressure.viruses, mistakes: st.mistakes, temper: st.temper, earlyActionsALife: +(cnt / lives).toFixed(1), strainMaxMedian: +mx.sort((a, b) => a - b)[Math.floor(mx.length / 2)].toFixed(1) }));
  }
}
