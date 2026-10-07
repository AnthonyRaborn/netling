// Widening Iron's wear: does adding an effect on Sync (LOCK) drain make the pressure felt, and who pays? Compares wear off, the calibrated
// base-infection-only wear, and wear that also raises Sync drain, with and without a bot that cools early once wear builds.
// Usage: node prototype/netling2/sim/iron-sweep.mjs [lives=600] [archetypes=attentive,casual,worker,human-regular,human-bursty,daredevil,overclocker,seek-unsteady]
process.env.TZ = 'UTC';
const { ARCHETYPES, simulate, stats } = await import('./balance.mjs');
const { IRON } = await import('./sim.js');
const lives = Number(process.argv[2] ?? 600);
const bases = (process.argv[3] ?? 'attentive,casual,worker,human-regular,human-bursty,daredevil,overclocker,seek-unsteady').split(',');
// bot: 'avoid' is IRONBOT=avoid, a player who cools earlier once wear builds.
const cases = {
  'off': { on: false },
  'wear 80, infections only': { on: true, lock: 0 },
  'wear 80, + LOCK x1': { on: true, lock: 1 },
  'wear 80, + LOCK x1, avoider': { on: true, lock: 1, bot: 'avoid' },
  'wear 75, + LOCK x1': { on: true, lock: 1, heat: 75 },
  'wear 75, + LOCK x1, avoider': { on: true, lock: 1, heat: 75, bot: 'avoid' },
  'wear 70, + LOCK x1': { on: true, lock: 1, heat: 70 },
  'wear 70, + LOCK x1, avoider': { on: true, lock: 1, heat: 70, bot: 'avoid' },
};
const fresh = { ...IRON };
for (const base of bases) {
  for (const [name, c] of Object.entries(cases)) {
    const { bot, ...rest } = c;
    Object.assign(IRON, fresh, rest);
    if (bot) process.env.IRONBOT = bot; else delete process.env.IRONBOT;
    const st = stats(Array.from({ length: lives }, (_, i) => simulate({ ...ARCHETYPES[base] }, i + 1)));
    console.log(JSON.stringify({ base, case: name, fullLife: st.fullLife, infections: st.pressure.viruses, syncMistakes: st.mistakeKinds.sync ?? 0, mistakes: st.mistakes, temper: st.temper, hold12h: st.hold12h, wearHighShare: st.pressure.wearHighShare, wearMax: st.pressure.wearMax }));
  }
}
