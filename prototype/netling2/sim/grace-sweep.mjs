// The grace window after a netrun (NR2.graceMin, netrun/nr2.js): how often a run ends a held Overdrive or Overlink, with the window at 0, 5,
// 15 and 30 minutes. Usage: node prototype/netling2/sim/grace-sweep.mjs [lives=200] [archetypes=attentive,sysadmin,daredevil,casual] [graces=0,5,15,30]
// Programs and Wetware both, the final pressure design (hold 3 awake hours, owner x3). Reported per life: runs made while a state was held, states
// the bars ended within 30 minutes of a jack-out and states that ended otherwise, and the share of awake time held.
process.env.TZ = 'UTC';
const lives = Number(process.argv[2] ?? 200);
const bases = (process.argv[3] ?? 'attentive,sysadmin,daredevil,casual').split(',');
const graces = (process.argv[4] ?? '0,5,15,30').split(',').map(Number);
const { ARCHETYPES, simulate } = await import('./balance.mjs');
const { SIDES, SIDE_METER } = await import('./sim.js');
const { NR2 } = await import('./netrun/nr2.js');
Object.assign(SIDES.charge, { hi: 80, hold: 180, exit: 65, gate: 0, slow: 0, bleed: 8, overflow: 2, playGain: 0.45, drop: 0.75 });
Object.assign(SIDES.sync, { hi: 85, hold: 180, exit: 70, swing: 0, steadyDecay: 0, calm: 0, dull: 0.3, virus: 1.2, visit: 0.75, drop: 0.75, penStep: 0.1, penFree: 90, penCap: 0.9, burnN: 2, burnCool: 1440 });
SIDES.on = true; SIDES.ownerMult = 3; SIDES.teenStates = true;
for (const base of bases) for (const owner of ['charge', 'sync']) for (const g of graces) {
  SIDES.owner = owner; NR2.graceMin = g;
  for (const k of Object.keys(SIDE_METER)) SIDE_METER[k] = 0;
  let held = 0, awake = 0;
  for (let i = 1; i <= lives; i++) {
    globalThis.__sample = (s) => { if (s.stage === 'dead' || s.asleep || s.nap) return; awake++; if (s.sideHeld?.[owner]) held++; };
    simulate({ ...ARCHETYPES[base] }, i);
  }
  const per = (x) => +(x / lives).toFixed(2);
  console.log(JSON.stringify({ base, egg: owner === 'charge' ? 'program' : 'wetware', grace: g, held: +(held / awake).toFixed(3), runsInState: per(SIDE_METER.runsInState), runEndsBelowExit: per(SIDE_METER.runEndsBelowExit), endsSoonAfterRun: per(SIDE_METER.endsSoonAfterRun), endsOther: per(SIDE_METER.endsOther) }));
}
