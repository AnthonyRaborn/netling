// Iron pushed from both ends: too hot (wear over `heat`) and too cold (Heat under `cold` while awake), with an optional cooling floor for nap and sleep
// (`restFloor`). Usage: node prototype/netling2/sim/iron-cold-sweep.mjs [lives=400] [archetypes]
process.env.TZ = 'UTC';
const { ARCHETYPES, simulate, stats } = await import('./balance.mjs');
const { IRON } = await import('./sim.js');
const lives = Number(process.argv[2] ?? 400);
const bases = (process.argv[3] ?? 'attentive,sysadmin,casual,worker,human-regular,daredevil,overclocker').split(',');
const hot = { on: true, lock: 1, heat: 75 };
const cases = {
  'off': { on: false },
  'hot only (75, lock 1)': hot,
  'hot + cold 20, no floor': { ...hot, cold: 20 },
  'hot + cold 20, floor 20': { ...hot, cold: 20, restFloor: 20 },
  'hot + cold 15, floor 15': { ...hot, cold: 15, restFloor: 15 },
  'hot + cold 25, floor 25': { ...hot, cold: 25, restFloor: 25 },
  'hot only, floor 20': { ...hot, restFloor: 20 },
  'hot + cold 20, floor 20, chiller': { ...hot, cold: 20, restFloor: 20, bot: 'chill' },
  'hot only, chiller': { ...hot, bot: 'chill' },
};
const fresh = { ...IRON };
for (const base of bases) {
  for (const [name, c] of Object.entries(cases)) {
    const { bot, ...rest } = c;
    Object.assign(IRON, fresh, rest);
    if (bot) process.env.IRONBOT = bot; else delete process.env.IRONBOT;
    const st = stats(Array.from({ length: lives }, (_, i) => simulate({ ...ARCHETYPES[base] }, i + 1)));
    console.log(JSON.stringify({ base, case: name, fullLife: st.fullLife, infections: st.pressure.viruses, mistakes: st.mistakes, temper: st.temper, unsteady12h: st.hold12h.strongUnsteady, steady12h: st.hold12h.strongSteady, wearHigh: st.pressure.wearHighShare, wearMax: st.pressure.wearMax }));
  }
}
