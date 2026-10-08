// A player who watches Program's Overdrive cost (baseline/README.md, New findings, 1.): what do they pay, and what do they give up?
// Same configuration as program-perk-sweep.mjs (Program's final design, NR2=all, PERKS=1). For each archetype, with the Charge-drain perks on
// and off, and for three players: greedy (the default bot, feeds to 85 every time), watch (PROGBOT=watch) and avoid (PROGBOT=avoid).
// Reports full life, deaths by Integrity collapse, the share of awake time spent in Overdrive, win drops and play gain a life (the benefits),
// and feeds. Usage: node prototype/netling2/sim/program-bot-sweep.mjs [lives=1000] [archetypes] [bots=greedy,watch,avoid]
process.env.TZ = 'UTC';
process.env.NR2 = process.env.NR2 ?? 'all';
process.env.PERKS = process.env.PERKS ?? '1';
const lives = Number(process.argv[2] ?? 1000);
const names = (process.argv[3] ?? 'steer-tune-corp,ghosthunter,attentive,sysadmin').split(',');
const bots = (process.argv[4] ?? 'greedy,watch,avoid').split(',');
const { ARCHETYPES, simulate, stats } = await import('./balance.mjs');
const { SIDES, SIDE_METER, PERK_MODS } = await import('./sim.js');
Object.assign(SIDES.charge, { hi: 80, hold: 180, exit: 65, gate: 0, slow: 0, bleed: 8, overflow: 2, playGain: 0.45, drop: 0.75 });
Object.assign(SIDES, { on: true, owner: 'charge', ownerMult: 3, teenStates: true });
const keep = { tune: PERK_MODS.tuneCorp.chargeDrainMult, hid: PERK_MODS.hidden.chargeDrainMult };
for (const perk of [true, false]) {
  PERK_MODS.tuneCorp.chargeDrainMult = perk ? keep.tune : 1;
  PERK_MODS.hidden.chargeDrainMult = perk ? keep.hid : 1;
  for (const bot of bots) {
    if (bot === 'greedy') delete process.env.PROGBOT; else process.env.PROGBOT = bot;
    for (const n of names) {
      for (const k of Object.keys(SIDE_METER)) SIDE_METER[k] = 0;
      let awake = 0;
      let held = 0;
      globalThis.__sample = (s) => {
        if (s.stage === 'dead' || s.asleep || s.nap) return;
        awake++;
        if (s.sideHeld?.charge) held++;
      };
      const st = stats(Array.from({ length: lives }, (_, i) => simulate({ ...ARCHETYPES[n] }, i + 1)));
      console.log(JSON.stringify({ chargePerks: perk, bot, archetype: n, fullLife: st.fullLife, collapse: st.deaths?.['integrity collapse'] ?? 0, inOverdrive: +(held / awake).toFixed(3), drops: +(SIDE_METER.drops / lives).toFixed(1), playGain: +(SIDE_METER.playGain / lives).toFixed(0), feeds: st.pressure?.feeds, faults: st.mistakes }));
    }
  }
}
