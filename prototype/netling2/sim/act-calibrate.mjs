// Calibrate the action-based pressure so the mean infections of the five ordinary archetypes match "off" (equal on average, different in who pays).
// Usage: node prototype/netling2/sim/act-calibrate.mjs <charge|sync> <line> [lives=400] [floors=0.004,0.006,0.008,0.010]
process.env.TZ = 'UTC';
const stat = process.argv[2], line = Number(process.argv[3]), lives = Number(process.argv[4] ?? 400);
const floors = (process.argv[5] ?? '0.004,0.006,0.008,0.010').split(',').map(Number);
const { ARCHETYPES, simulate, stats } = await import('./balance.mjs');
const { ACTS } = await import('./sim.js');
const five = ['attentive', 'casual', 'worker', 'sysadmin', 'human-regular'];
const extra = ['daredevil', 'overclocker'];
const run = (base, bot) => { if (bot) process.env.ACTBOT = bot; else delete process.env.ACTBOT; const st = stats(Array.from({ length: lives }, (_, i) => simulate({ ...ARCHETYPES[base] }, i + 1))); return { inf: st.pressure.viruses, full: st.fullLife, mist: st.mistakes }; };
Object.assign(ACTS[stat], { on: false });
const off = Object.fromEntries([...five, ...extra].map((b) => [b, run(b)]));
const mean = (o) => +(five.reduce((a, b) => a + o[b].inf, 0) / five.length).toFixed(2);
console.log(JSON.stringify({ stat, line, case: 'off', meanFive: mean(off), ...Object.fromEntries(Object.entries(off).map(([b, v]) => [b, v.inf])) }));
for (const floor of floors) {
  Object.assign(ACTS[stat], { on: true, line, floor });
  const on = Object.fromEntries([...five, ...extra].map((b) => [b, run(b)]));
  const bud = Object.fromEntries(['attentive', 'worker', 'casual'].map((b) => [b, run(b, 'budget')]));
  console.log(JSON.stringify({ stat, line, floor, meanFive: mean(on), infections: Object.fromEntries(Object.entries(on).map(([b, v]) => [b, v.inf])), full: Object.fromEntries(Object.entries(on).map(([b, v]) => [b, v.full])), budgeterInf: Object.fromEntries(Object.entries(bud).map(([b, v]) => [b, v.inf])), budgeterFull: Object.fromEntries(Object.entries(bud).map(([b, v]) => [b, v.full])) }));
}
