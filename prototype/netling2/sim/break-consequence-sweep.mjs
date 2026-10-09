// What should the break cost, on each egg? Runs one egg's final pressure design (as clinic-final.mjs and the baseline runner set it) with
// NR2=all and PERKS=1 and compares, per archetype and bot: no break; the break (line 40, 12 hour lockout); and the break with a consequence:
// one fault, 10 Integrity, or both. Reports full life, breaks and warnings a life, faults, bugs, viruses and temper.
// Usage: node prototype/netling2/sim/break-consequence-sweep.mjs <iron|program|wetware> [lives=1000] [archetypes] [variants]
// Bots: wetware also runs SYNCBOT=greedy (plays until Sync is full, so it meets Overlink's brake); program also runs PROGBOT=watch.
// The break rarely fires for ordinary play on Iron and Wetware, so the hot and greedy players are where a consequence shows.
process.env.TZ = 'UTC';
process.env.NR2 = process.env.NR2 ?? 'all';
process.env.PERKS = process.env.PERKS ?? '1';
const egg = process.argv[2];
if (!['iron', 'program', 'wetware'].includes(egg)) throw new Error('give the egg: iron, program or wetware');
const lives = Number(process.argv[3] ?? 1000);
const names = (process.argv[4] ?? 'attentive,sysadmin,daredevil,overclocker,human-keen,steer-tune-corp').split(',');
const want = process.argv[5]?.split(',');
const { ARCHETYPES, simulate, stats } = await import('./balance.mjs');
const { SIDES, IRON, BRAKE, SIDE_METER } = await import('./sim.js');
Object.assign(SIDES.charge, { hi: 80, hold: 180, exit: 65, gate: 0, slow: 0, bleed: 8, overflow: 2, playGain: 0.45, drop: 0.75 });
Object.assign(SIDES.sync, { hi: 85, hold: 180, exit: 70, swing: 0, steadyDecay: 0, calm: 0, dull: 0.3, virus: 1.2, visit: 0.75, drop: 0.75, penStep: 0.1, penFree: 90, penCap: 0.9, burnN: 2, burnCool: 1440 });
Object.assign(SIDES, { on: true, owner: { iron: null, program: 'charge', wetware: 'sync' }[egg], ownerMult: 3, teenStates: true });
IRON.on = egg === 'iron';
const variants = {
  'no break': { on: false },
  break: { on: true },
  'break + 1 fault': { on: true, faults: 1 },
  'break + 10 integrity': { on: true, integrityHit: 10 },
  'break + both': { on: true, faults: 1, integrityHit: 10 },
};
const bots = { iron: [{ label: 'default' }], program: [{ label: 'default' }, { label: 'watch', PROGBOT: 'watch' }], wetware: [{ label: 'default' }, { label: 'greedy', SYNCBOT: 'greedy' }] }[egg];
for (const [label, v] of Object.entries(variants)) {
  if (want && !want.includes(label)) continue;
  for (const bot of bots) {
    for (const k of ['PROGBOT', 'SYNCBOT']) delete process.env[k];
    for (const k of ['PROGBOT', 'SYNCBOT']) if (bot[k]) process.env[k] = bot[k];
    for (const n of names) {
      Object.assign(BRAKE, { on: false, faults: 0, integrityHit: 0 }, v);
      for (const k of Object.keys(SIDE_METER)) SIDE_METER[k] = 0;
      const st = stats(Array.from({ length: lives }, (_, i) => simulate({ ...ARCHETYPES[n] }, i + 1)));
      console.log(JSON.stringify({ egg, variant: label, bot: bot.label, archetype: n, fullLife: st.fullLife, breaks: +(SIDE_METER.brakes / lives).toFixed(2), warns: +(SIDE_METER.brakeWarns / lives).toFixed(2), faults: st.mistakes, bugs: st.bugs?.avg, viruses: st.pressure?.viruses, temper: st.temper }));
    }
  }
}
