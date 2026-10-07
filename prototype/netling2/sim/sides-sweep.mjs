// Two-sided Charge and Sync (SIDES in sim.js): per egg (owner none = Iron, charge = Program, sync = Wetware) and archetype, the
// life stats off and on, and the share of awake time spent on each side. Usage:
//   node prototype/netling2/sim/sides-sweep.mjs [lives=300] [archetypes] [overrides-json]
process.env.TZ = 'UTC';
const lives = Number(process.argv[2] ?? 300);
const bases = (process.argv[3] ?? 'attentive,sysadmin,casual,worker,human-regular,daredevil,overclocker').split(',');
const over = process.argv[4] ? JSON.parse(process.argv[4]) : {};
const { ARCHETYPES, simulate, stats } = await import('./balance.mjs');
const { SIDES } = await import('./sim.js');
const fresh = JSON.parse(JSON.stringify(SIDES));
const eggs = { iron: null, program: 'charge', wetware: 'sync' };
const apply = (on, owner) => {
  for (const k of ['charge', 'sync']) Object.assign(SIDES[k], fresh[k]);
  Object.assign(SIDES.charge, over.charge ?? {});
  Object.assign(SIDES.sync, over.sync ?? {});
  SIDES.on = on; SIDES.owner = owner; SIDES.ownerMult = over.ownerMult ?? fresh.ownerMult; SIDES.lowOwnerOnly = over.lowOwnerOnly ?? fresh.lowOwnerOnly;
};
for (const base of bases) {
  for (const [egg, owner] of [['off', null], ...Object.entries(eggs)]) {
    apply(egg !== 'off', owner);
    const share = { cHi: 0, cLo: 0, sHi: 0, sLo: 0 };
    let awake = 0;
    const rs = [];
    for (let i = 1; i <= lives; i++) {
      globalThis.__sample = (s) => {
        if (s.stage === 'dead' || s.asleep || s.nap) return;
        awake++;
        if (s.stats.charge >= SIDES.charge.hi) share.cHi++;
        if (s.stats.charge <= SIDES.charge.lo) share.cLo++;
        if (s.stats.sync >= SIDES.sync.hi) share.sHi++;
        if (s.stats.sync <= SIDES.sync.lo) share.sLo++;
      };
      rs.push(simulate({ ...ARCHETYPES[base] }, i));
    }
    const st = stats(rs);
    const f = (x) => +(x / awake).toFixed(3);
    console.log(JSON.stringify({ base, egg, fullLife: st.fullLife, infections: st.pressure.viruses, mistakes: st.mistakes, temper: st.temper, cHi: f(share.cHi), cLo: f(share.cLo), sHi: f(share.sHi), sLo: f(share.sLo) }));
  }
}
