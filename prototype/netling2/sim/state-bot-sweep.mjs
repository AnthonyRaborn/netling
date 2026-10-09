// Players who mind the break, on each egg, under the decided settings (2026-10-09): what does watching the bar cost and save?
// Program has PROGBOT=watch|avoid; this adds Iron's IRONBOT=watch (and its existing chill, which keeps Heat cold always) and Wetware's
// SYNCBOT=watch|avoid (and greedy, which plays until Sync is full). STATEBOT=watch (watch-all) watches every bar the netling holds a state
// on: Overdrive and Overlink are held on every egg (only the owner's x3), so on Iron and Wetware most breaks of ordinary play are Overdrive's. watch is the same rule on every egg: play or feed as usual until
// Integrity falls under the break's warning line (70), then stay a play or feed under the egg's state line until Integrity recovers.
// Configuration as baseline/run-all.mjs's decided-<egg> (copied here, since importing run-all.mjs runs it): NR2=all, PERKS=1, the egg's final
// pressure design, the break, stage care with the rest call, Standing gain 2, the fix rule and a Standing cost of 5.
// Reports full life, breaks a life (by state: Overdrive, Overlink, Overclock), warnings, faults, bugs, time in the egg's own state and its
// benefits (win drops and extra play Sync a life).
// Usage: node prototype/netling2/sim/state-bot-sweep.mjs <iron|program|wetware> [lives=1000] [archetypes] [bots]
process.env.TZ = 'UTC';
const egg = process.argv[2];
if (!['iron', 'program', 'wetware'].includes(egg)) throw new Error('give the egg: iron, program or wetware');
const lives = Number(process.argv[3] ?? 1000);
const names = (process.argv[4] ?? 'attentive,casual,sysadmin,daredevil,overclocker,human-keen,human-regular,steer-tune-corp,hunter-exact').split(',');
const FINAL_SIDES = {
  charge: { hi: 80, hold: 180, exit: 65, gate: 0, slow: 0, bleed: 8, overflow: 2, playGain: 0.45, drop: 0.75 },
  sync: { hi: 85, hold: 180, exit: 70, swing: 0, steadyDecay: 0, calm: 0, dull: 0.3, virus: 1.2, visit: 0.75, drop: 0.75, penStep: 0.1, penFree: 90, penCap: 0.9, burnN: 2, burnCool: 1440 },
};
Object.assign(process.env, {
  NR2: 'all',
  PERKS: '1',
  SIDES: JSON.stringify({ on: true, owner: { iron: null, program: 'charge', wetware: 'sync' }[egg], ownerMult: 3, teenStates: true, ...(egg === 'iron' ? { ironBenefit: 3 } : {}), ...FINAL_SIDES }),
  BRAKE: '{"on":true}',
  STAGE: JSON.stringify({ on: true, rest: { on: true } }),
  STANDINGGAIN: '2',
  BUGS: JSON.stringify({ standingOnlyIfShort: true, clearStanding: 5 }),
});
if (egg === 'iron') process.env.IRON = '{"on":true}';
const BOTS = {
  iron: [{ label: 'default' }, { label: 'watch', IRONBOT: 'watch' }, { label: 'watch-all', STATEBOT: 'watch' }, { label: 'chill', IRONBOT: 'chill' }],
  program: [{ label: 'default' }, { label: 'watch', PROGBOT: 'watch' }, { label: 'watch-all', STATEBOT: 'watch' }, { label: 'avoid', PROGBOT: 'avoid' }],
  wetware: [{ label: 'default' }, { label: 'watch', SYNCBOT: 'watch' }, { label: 'watch-all', STATEBOT: 'watch' }, { label: 'avoid', SYNCBOT: 'avoid' }, { label: 'greedy', SYNCBOT: 'greedy' }],
}[egg];
const wantBots = process.argv[5]?.split(',');
const { ARCHETYPES, simulate, stats } = await import('./balance.mjs');
const { SIDE_METER, BRAKE, overclocked, inFlow } = await import('./sim.js');
// ALLOC=0 reproduces the first build (only Iron's Overclock breaks); the rule now is every egg's (BRAKE.allOverclock).
if (process.env.ALLOC === '0') BRAKE.allOverclock = false;
const inState = { iron: (s) => overclocked(s), program: (s) => Boolean(s.sideHeld?.charge), wetware: (s) => Boolean(s.sideHeld?.sync) }[egg];
const per = (n) => +(n / lives).toFixed(2);
for (const bot of BOTS) {
  if (wantBots && !wantBots.includes(bot.label)) continue;
  for (const k of ['IRONBOT', 'PROGBOT', 'SYNCBOT', 'STATEBOT']) delete process.env[k];
  for (const k of ['IRONBOT', 'PROGBOT', 'SYNCBOT', 'STATEBOT']) if (bot[k]) process.env[k] = bot[k];
  for (const n of names) {
    for (const k of Object.keys(SIDE_METER)) SIDE_METER[k] = 0;
    let awake = 0;
    let held = 0;
    // Lives that reach each state at least once (teen or later, awake), so every egg can be checked to reach all four.
    const reached = { overclock: new Set(), overdrive: new Set(), overlink: new Set(), flow: new Set() };
    globalThis.__sample = (s) => {
      if (s.stage === 'dead' || s.asleep || s.nap) return;
      awake++;
      if (inState(s)) held++;
      if (s.stage === 'baby') return;
      if (overclocked(s)) reached.overclock.add(s);
      if (s.sideHeld?.charge) reached.overdrive.add(s);
      if (s.sideHeld?.sync) reached.overlink.add(s);
      if (inFlow(s)) reached.flow.add(s);
    };
    const st = stats(Array.from({ length: lives }, (_, i) => simulate({ ...ARCHETYPES[n] }, i + 1)));
    console.log(JSON.stringify({ egg, bot: bot.label, archetype: n, fullLife: st.fullLife, breaks: per(SIDE_METER.brakes), byState: { overdrive: per(SIDE_METER.brakeCharge), overlink: per(SIDE_METER.brakeSync), overclock: per(SIDE_METER.brakeHeat) }, warns: per(SIDE_METER.brakeWarns), inState: +(held / Math.max(1, awake)).toFixed(3), drops: per(SIDE_METER.drops), playGain: Math.round(SIDE_METER.playGain / lives), faults: st.mistakes, bugs: st.bugs?.avg, burns: per(SIDE_METER.burns), temper: st.temper, reached: Object.fromEntries(Object.entries(reached).map(([k, v]) => [k, per(v.size)])) }));
  }
}
