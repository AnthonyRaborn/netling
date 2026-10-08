// The one-time Overclock caption (first minute a netling is overclocked) and the Iron wear caption (first minute wear passes its warning
// line): how many netlings would ever see each, and how early. Final design, Iron's wear on, owner multiplier 3, default bots.
// Usage: node prototype/netling2/sim/heat-hint-sweep.mjs [lives=200] [bases]
process.env.TZ = 'UTC';
const lives = Number(process.argv[2] ?? 200);
const bases = (process.argv[3] ?? 'attentive,sysadmin,casual,worker,human-regular,daredevil,overclocker').split(',');
const { ARCHETYPES, simulate } = await import('./balance.mjs');
const { SIDES, IRON } = await import('./sim.js');
SIDES.on = true; SIDES.owner = null; SIDES.ownerMult = 3; IRON.on = true;
const med = (a) => (a.length ? a.sort((x, y) => x - y)[Math.floor(a.length / 2)] : null);
for (const base of bases) {
  let last = null;
  globalThis.__sample = (s) => { last = s; };
  const oc = [], wear = [];
  for (let i = 1; i <= lives; i++) {
    last = null;
    simulate({ ...ARCHETYPES[base] }, i);
    if (last?.ocAt != null) oc.push(last.ocAt / 1440);
    if (last?.wearAt != null) wear.push(last.wearAt / 1440);
  }
  const pct = (a) => `${Math.round((100 * a.length) / lives)}%`;
  console.log(base.padEnd(14), `overclock caption ${pct(oc)} (median day ${med(oc)?.toFixed(1) ?? '-'}) | Iron wear caption ${pct(wear)} (median day ${med(wear)?.toFixed(1) ?? '-'})`);
}
