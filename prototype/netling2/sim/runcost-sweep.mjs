// The egg run costs (NR2.eggCost, netrun/nr2.js `cost`) at the life level: per archetype, a lifetime with the costs off and on, for one egg's
// pressure. The pass bar (docs/NETLING_2_EGG_PRESSURES.md): the ordinary archetypes (attentive, sysadmin, casual, worker, human-regular) stay
// within noise on full-life rate, infections and temper; the players who live on the egg's bar (daredevil, overclocker) may move a little.
// Usage: EGG=iron|program|wetware node prototype/netling2/sim/runcost-sweep.mjs [lives=300] [archetypes] [cost-overrides-json]
//   cost-overrides-json: e.g. '{"programLostFightBleed":6}' (NR2.cost); 'off' only compares the cases listed in CASES.
//   JSON=1 prints JSON. Sampling noise at 300 lives: about 2 points on a full-life rate near 90%; infections about 0.2.
process.env.TZ = 'UTC';
const egg = process.env.EGG;
if (!['iron', 'program', 'wetware'].includes(egg)) throw new Error('set EGG=iron, program or wetware');
if (egg === 'iron') process.env.IRON = process.env.IRON ?? '{"on":true}';
if (egg === 'program') process.env.SIDES = process.env.SIDES ?? '{"on":true,"owner":"charge","ownerMult":3,"charge":{"hold":180}}';
if (egg === 'wetware') process.env.SIDES = process.env.SIDES ?? '{"on":true,"owner":"sync","ownerMult":3,"sync":{"hold":180}}';
const lives = Number(process.argv[2] ?? 300);
const bases = (process.argv[3] ?? 'attentive,sysadmin,casual,worker,human-regular,daredevil,overclocker').split(',');
const over = process.argv[4] ? JSON.parse(process.argv[4]) : {};
const { ARCHETYPES, simulate, stats } = await import('./balance.mjs');
const { NR2 } = await import('./netrun/nr2.js');
const { COST_METER } = await import('./netrun/run.js');
const baseCost = { ...NR2.cost };
const cases = [{ label: 'off', eggCost: false }, { label: 'on', eggCost: true, cost: { ...baseCost, ...over } }];
const out = [];
for (const base of bases) {
  const row = { egg, base };
  for (const c of cases) {
    NR2.eggCost = c.eggCost;
    Object.assign(NR2.cost, baseCost, c.cost ?? {});
    for (const k of Object.keys(COST_METER)) COST_METER[k] = 0;
    const rs = [];
    for (let i = 1; i <= lives; i++) rs.push(simulate({ ...ARCHETYPES[base] }, i));
    const st = stats(rs);
    const wear = rs.reduce((a, r) => a + (r.wearMax ?? 0), 0) / rs.length;
    row[c.label] = { fullLife: st.fullLife, infections: st.pressure.viruses, mistakes: st.mistakes, temper: st.temper, runs: st.netruns.runs, disconnects: st.netruns.disconnects };
    if (egg === 'iron') row[c.label].wearMax = +wear.toFixed(1);
    // What the costs did, a life: only counted when they are on.
    if (c.eggCost) row.fired = Object.fromEntries(Object.entries(COST_METER).map(([k, v]) => [k, +(v / lives).toFixed(2)]));
  }
  out.push(row);
  if (!process.env.JSON) {
    const a = row.off;
    const b = row.on;
    const d = (k) => (b[k] - a[k]).toFixed(2);
    const f = row.fired;
    console.log(`  fired a life: lost fights ${f.lostFights}${egg === 'iron' ? `, wear added ${f.ironWear} over ${f.ironMoves} hot moves` : egg === 'program' ? `, bleeds ${f.programBleeds} (${f.programBled} Integrity)` : `, rolls ${f.wetwareRolls}, infections ${f.wetwareInfections}`}`);
    console.log(`${egg} ${base.padEnd(14)} full-life ${a.fullLife} -> ${b.fullLife} (${d('fullLife')})  infections ${a.infections} -> ${b.infections} (${d('infections')})  temper ${a.temper} -> ${b.temper} (${d('temper')})  mistakes ${a.mistakes} -> ${b.mistakes}  runs ${a.runs} disconnects ${a.disconnects} -> ${b.disconnects}${egg === 'iron' ? `  wearMax ${a.wearMax} -> ${b.wearMax}` : ''}`);
  }
}
if (process.env.JSON) console.log(JSON.stringify(out, null, 1));
