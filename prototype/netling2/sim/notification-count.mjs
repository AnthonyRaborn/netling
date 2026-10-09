// How many things would reach the player a day? A counting script for docs/NETLING_2_STAGE_CARE_DRAFTS.md (section 2.6): over seeded lives, per stage and per
// 15 awake hours, how often an event opens, a visit starts and an attention request is posted (all as they are in the fork today), plus a SHADOW of the
// draft's rest call (hidden sleep demand, observed only; it changes nothing). Stages here are by age as the draft proposes: baby under 7 hours, teen
// 7 to 46 hours, adult after that (the shipped 17 and 51 hour stages are not used). The shadow assumes every call is answered.
// Usage: node prototype/netling2/sim/notification-count.mjs [lives=200] [archetypes]
// Shadow model (starting values from the draft): demand rises while awake by 20 (baby), 12 (teen) or 6 (adult) an hour; +10 a netrun, +2 a game (taken as
// 1 / 0.75 games a win), -1 a feed, -40 a nap, reset to 0 on waking from sleep; a call at 60 when awake, not in a run and with no event open; a rest leaves 10.
process.env.TZ = 'UTC';
process.env.NR2 = process.env.NR2 ?? 'all';
process.env.PERKS = process.env.PERKS ?? '1';
const lives = Number(process.argv[2] ?? 200);
const names = (process.argv[3] ?? 'attentive,casual,daredevil,sysadmin,human-regular').split(',');
const { ARCHETYPES, simulate } = await import('./balance.mjs');
const { STAGE } = await import('./sim.js');
// With STAGE='{"on":true,"rest":{"on":true}}' the real rest call in the fork is counted (calls opened, answered or not); otherwise the shadow model below.
const REAL = STAGE.rest.on;
const RATE = { baby: 20, teen: 12, adult: 6 };
const stageOf = (age) => (age < 7 * 60 ? 'baby' : age < 46 * 60 ? 'teen' : 'adult');
const sumWins = (s) => Object.values(s.wins ?? {}).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
console.log('archetype        | stage | awake h/life | events | visits | requests | rest calls | events + calls | + visits | + requests   (each per 15 awake hours)');
for (const n of names) {
  const A = { baby: {}, teen: {}, adult: {} };
  for (const st of Object.keys(A)) A[st] = { min: 0, event: 0, visit: 0, request: 0, call: 0 };
  for (let i = 1; i <= lives; i++) {
    let D = 0; let prev = { event: false, visit: false, request: false, run: false, asleep: false, nap: false, feeds: 0, wins: 0 }; let restLeft = 0;
    globalThis.__sample = (s) => {
      if (s.stage === 'dead' || s.stage === 'script') return;
      const st = stageOf(s.ageMin);
      const awake = !s.asleep && !s.nap;
      if (awake) A[st].min++;
      const cur = { event: Boolean(s.event), visit: Boolean(s.visit), request: Boolean(s.request), run: Boolean(s.run), asleep: Boolean(s.asleep), nap: Boolean(s.nap), feeds: s.feeds ?? 0, wins: sumWins(s) };
      if (cur.event && !prev.event) A[st].event++;
      if (cur.visit && !prev.visit) A[st].visit++;
      if (cur.request && !prev.request) A[st].request++;
      if (cur.run && !prev.run) D += 10;
      if (cur.feeds > prev.feeds) D = Math.max(0, D - (cur.feeds - prev.feeds));
      if (cur.wins > prev.wins) D += (cur.wins - prev.wins) * (2 / 0.75);
      if (cur.nap && !prev.nap) D = Math.max(0, D - 40);
      if (prev.asleep && !cur.asleep) D = 0;
      if (REAL) { if (Boolean(s.call) && !prev.call) A[st].call++; cur.call = Boolean(s.call); }
      else if (restLeft > 0) restLeft--;
      else if (awake) {
        D += RATE[st] / 60;
        if (D >= 60 && !cur.run && !cur.event) { A[st].call++; D = 10; restLeft = 25; }
      }
      prev = { ...cur, call: cur.call ?? false };
    };
    simulate({ ...ARCHETYPES[n] }, i);
  }
  globalThis.__sample = undefined;
  for (const st of ['baby', 'teen', 'adult']) {
    const a = A[st]; const per = (x) => (a.min ? (x / (a.min / (15 * 60))) : 0);
    const ev = per(a.event); const vi = per(a.visit); const rq = per(a.request); const rc = per(a.call);
    console.log(`${n.padEnd(16)} | ${st.padEnd(5)} | ${(a.min / 60 / lives).toFixed(1).padStart(12)} | ${ev.toFixed(1).padStart(6)} | ${vi.toFixed(1).padStart(6)} | ${rq.toFixed(1).padStart(8)} | ${rc.toFixed(1).padStart(10)} | ${(ev + rc).toFixed(1).padStart(14)} | ${(ev + rc + vi).toFixed(1).padStart(8)} | ${(ev + rc + vi + rq).toFixed(1).padStart(12)}`);
  }
}
