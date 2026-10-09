// The elder stage under the decided rules (docs/NETLING_2_STAGE_CARE_DRAFTS.md: the elder cache x0.25 and the rest call's lower demand). In
// single-life runs no netling reaches the elder, because the gate needs Root earned in the life and three Deep exits; CODEX=deep starts every
// life knowing the way down and holding Root (as the game would grant it), so archetypes that run the Deep can reach it.
// Compares variants of the elder's stage rules and reports, per archetype: lives reaching the elder, elder days, and per elder awake day the
// cache files written, rest calls, tired hours, faults and bugs (with the adult stage's rates beside them), plus full life and the share of
// elders that die before the extended end.
// Configuration: the decided settings with OVERUSE (baseline/run-all.mjs, now-<egg>; copied here); every life starts with CODEX=deep's
// fragments and Root (passed to simulate, as balance.mjs does for CODEX=deep).
// Usage: node prototype/netling2/sim/elder-sweep.mjs <iron|program|wetware> [lives=300] [archetypes] [variants]
// Variants: decided (cache x0.25, rest demand 4 an hour), cache1 (elder cache as an adult's, x1), rest6 (rest demand as an adult's, 6 an hour).
process.env.TZ = 'UTC';
const egg = process.argv[2];
if (!['iron', 'program', 'wetware'].includes(egg)) throw new Error('give the egg: iron, program or wetware');
const lives = Number(process.argv[3] ?? 300);
const names = (process.argv[4] ?? 'attentive,daredevil,sysadmin,steer-mainframe,casual,worker').split(',');
const FINAL_SIDES = {
  charge: { hi: 80, hold: 180, exit: 65, gate: 0, slow: 0, bleed: 8, overflow: 2, playGain: 0.45, drop: 0.75 },
  sync: { hi: 85, hold: 180, exit: 70, swing: 0, steadyDecay: 0, calm: 0, dull: 0.3, virus: 1.2, visit: 0.75, drop: 0.75, penStep: 0.1, penFree: 90, penCap: 0.9, burnN: 2, burnCool: 1440 },
};
Object.assign(process.env, {
  NR2: 'all', PERKS: '1', BRAKE: '{"on":true}', STAGE: JSON.stringify({ on: true, rest: { on: true } }), STANDINGGAIN: '2',
  BUGS: JSON.stringify({ standingOnlyIfShort: true, clearStanding: 5 }), OVERUSE: '{"on":true}',
  SIDES: JSON.stringify({ on: true, owner: { iron: null, program: 'charge', wetware: 'sync' }[egg], ownerMult: 3, teenStates: true, ...(egg === 'iron' ? { ironBenefit: 3 } : {}), ...FINAL_SIDES }),
});
if (egg === 'iron') process.env.IRON = '{"on":true}';
const { ARCHETYPES, simulate, stats, CODEX_PRESETS } = await import('./balance.mjs');
const { STAGE } = await import('./sim.js');
const VARIANTS = {
  decided: () => {},
  cache1: () => { STAGE.cache.mainframe = 1; },
  rest6: () => { STAGE.rest.demandPerHour.mainframe = 6; },
};
const keep = { cache: STAGE.cache.mainframe, demand: STAGE.rest.demandPerHour.mainframe };
const want = (process.argv[5] ?? Object.keys(VARIANTS).join(',')).split(',');
const r2 = (n) => +n.toFixed(2);
for (const v of want) {
  for (const n of names) {
    STAGE.cache.mainframe = keep.cache; STAGE.rest.demandPerHour.mainframe = keep.demand;
    VARIANTS[v]();
    const blank = () => ({ awakeMin: 0, caches: 0, calls: 0, tiredMin: 0, faults: 0, bugsAdded: 0 });
    const m = { reached: 0, elderMin: 0, diedEarly: 0, adult: blank(), mainframe: blank() };
    let cur = null;
    globalThis.__sample = (s) => {
      if (cur?.s !== s) cur = { s, inElder: false, cache: s.cache, call: null, faults: s.careMistakes, bugs: s.bugs };
      const elder = s.stage === 'mainframe';
      if (elder && !cur.inElder) { cur.inElder = true; m.reached++; }
      if (cur.inElder && s.stage === 'dead' && !cur.closed) {
        cur.closed = true;
        if (s.ageMin < s.life.lifespan + (s.lifeBonus ?? 0) - 60) m.diedEarly++;
      }
      if (elder) m.elderMin++;
      const g = m[s.stage];
      if (g) {
        if (!s.asleep) g.awakeMin++;
        if (s.cache > cur.cache) g.caches += s.cache - cur.cache;
        if (s.call && s.call !== cur.call) g.calls++;
        if (s.tired) g.tiredMin++;
        if (s.careMistakes > cur.faults) g.faults += s.careMistakes - cur.faults;
        if (s.bugs > cur.bugs) g.bugsAdded += s.bugs - cur.bugs;
      }
      cur.cache = s.cache; cur.call = s.call; cur.faults = s.careMistakes; cur.bugs = s.bugs;
    };
    const st = stats(Array.from({ length: lives }, (_, i) => simulate({ ...ARCHETYPES[n] }, i + 1, { codex: CODEX_PRESETS.deep, rootAccess: true })));
    const rates = (g) => {
      const d = g.awakeMin / 1440;
      if (!(d > 0)) return null;
      return { caches: r2(g.caches / d), calls: r2(g.calls / d), tiredHours: r2(g.tiredMin / 60 / d), faults: r2(g.faults / d), bugsAdded: r2(g.bugsAdded / d) };
    };
    console.log(JSON.stringify({ egg, variant: v, archetype: n, fullLife: st.fullLife, reached: r2(m.reached / lives), elderDays: m.reached ? r2(m.elderMin / 1440 / m.reached) : 0, perAwakeDay: { elder: rates(m.mainframe), adult: rates(m.adult) }, elderDiedEarly: m.reached ? r2(m.diedEarly / m.reached) : null }));
  }
}
globalThis.__sample = undefined;
