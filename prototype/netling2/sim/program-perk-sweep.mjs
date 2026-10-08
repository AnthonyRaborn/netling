// Why do Tune corp and the hidden form lose full life under Program's Overdrive? (baseline/README.md, New findings, 1.)
// Reruns archetypes under Program's final pressure design (as clinic-final.mjs and the baseline runner set it) and changes one factor at a time:
//   base            NR2=all, PERKS=1, Overdrive on (the baseline configuration)
//   no perks        PERKS off (the perk and trait tables are not applied)
//   no charge perk  perks on, but Tune corp's and the hidden form's Charge drain multipliers set to 1
//   no bleed        Overdrive's Integrity bleed (SIDES.charge.bleed) set to 0
//   no overflow     Overdrive's overflow multiplier (SIDES.charge.overflow) set to 1
//   no pressure     SIDES off (core rules, with perks and NR2)
// Usage: node prototype/netling2/sim/program-perk-sweep.mjs [lives=1000] [archetypes] [variants]
//   archetypes default steer-tune-corp,ghosthunter,hunter-shown,attentive,sysadmin,steer-tune-street; variants is a comma list of the names above.
// Reports full life, deaths by Integrity collapse, faults, viruses and feeds. Noise at 1000 lives: about 1 point near 90%.
process.env.TZ = 'UTC';
process.env.NR2 = process.env.NR2 ?? 'all';
process.env.PERKS = process.env.PERKS ?? '1';
const lives = Number(process.argv[2] ?? 1000);
const names = (process.argv[3] ?? 'steer-tune-corp,ghosthunter,hunter-shown,attentive,sysadmin,steer-tune-street').split(',');
const want = process.argv[4]?.split(',');
const { ARCHETYPES, simulate, stats } = await import('./balance.mjs');
const { SIDES, PERKS, PERK_MODS } = await import('./sim.js');
Object.assign(SIDES.charge, { hi: 80, hold: 180, exit: 65, gate: 0, slow: 0, bleed: 8, overflow: 2, playGain: 0.45, drop: 0.75 });
Object.assign(SIDES, { on: true, owner: 'charge', ownerMult: 3, teenStates: true });
const keep = { bleed: SIDES.charge.bleed, overflow: SIDES.charge.overflow, tune: PERK_MODS.tuneCorp.chargeDrainMult, hid: PERK_MODS.hidden.chargeDrainMult };
const set = ({ on = true, perks = true, chargePerk = true, bleed = keep.bleed, overflow = keep.overflow }) => {
  SIDES.on = on;
  PERKS.on = perks;
  SIDES.charge.bleed = bleed;
  SIDES.charge.overflow = overflow;
  PERK_MODS.tuneCorp.chargeDrainMult = chargePerk ? keep.tune : 1;
  PERK_MODS.hidden.chargeDrainMult = chargePerk ? keep.hid : 1;
};
const variants = {
  base: {},
  'no perks': { perks: false },
  'no charge perk': { chargePerk: false },
  'no bleed': { bleed: 0 },
  'no overflow': { overflow: 1 },
  'no pressure': { on: false },
};
for (const [label, v] of Object.entries(variants)) {
  if (want && !want.includes(label)) continue;
  for (const n of names) {
    set(v);
    const st = stats(Array.from({ length: lives }, (_, i) => simulate({ ...ARCHETYPES[n] }, i + 1)));
    console.log(JSON.stringify({ variant: label, archetype: n, fullLife: st.fullLife, collapse: st.deaths?.['integrity collapse'] ?? 0, faults: st.mistakes, viruses: st.pressure?.viruses, feeds: st.pressure?.feeds, events: st.events }));
  }
}
