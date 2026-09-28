// Headless balance harness: simulates full lifetimes under scripted player archetypes.
// Usage: node tools/balance.mjs [runsPerArchetype=300] [archetype filter]
process.env.TZ = 'UTC';
const { createScript, tick, act, blockReason, bedtimeHour, mulberry32, CFG, MIN, GAME_IDS } = await import('../src/sim.js');
const { runBlockReason } = await import('../src/netrun/run.js');
const { REGION_ORDER, regionLock } = await import('../src/netrun/regions.js');
const { playRun, finishRun, RUN_STYLES } = await import('./netrun-bot.mjs');

const DAY = 24 * 60;
const at = (h, m = 0) => h * 60 + m;

// Check-in times are minutes-of-day; each gets +/- jitter minutes of randomness.
// diet: probability of choosing corp over scav. trace: 'hide' | 'comply' | 'mix'.
// hot: keep playing even when warm (overclocker). winRate: mini-game skill.
export const ARCHETYPES = {
  attentive: {
    checks: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map((h) => at(h)),
    jitter: 15, diet: 0.5, trace: 'mix', winRate: 0.7, runs: 'careful',
  },
  casual: { checks: [at(7, 30), at(10), at(13), at(16), at(19), at(22, 30)], jitter: 30, diet: 0.5, trace: 'mix', winRate: 0.6, runs: 'greedy' },
  worker: { checks: [at(7), at(12, 30), at(18, 30), at(21), at(23)], jitter: 20, diet: 0.5, trace: 'mix', winRate: 0.6, runs: 'careful' },
  neglectful: { checks: [at(8), at(20)], jitter: 60, diet: 0.5, trace: 'mix', winRate: 0.5 },
  // Deliberate strategies: each should be able to reach its target form.
  corpo: { checks: [7, 9, 11, 13, 15, 17, 19, 21, 23].map((h) => at(h)), jitter: 20, diet: 1, trace: 'comply', winRate: 0.6 },
  runner: { checks: [7, 9, 11, 13, 15, 17, 19, 21, 23].map((h) => at(h)), jitter: 20, diet: 0, trace: 'hide', winRate: 0.6 },
  overclocker: { checks: [7, 9, 11, 13, 15, 17, 19, 21, 23].map((h) => at(h)), jitter: 20, diet: 0.5, trace: 'mix', winRate: 0.6, hot: true, sloppy: true },
  sysadmin: { checks: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map((h) => at(h)), jitter: 10, diet: 0.5, trace: 'mix', winRate: 0.7 },
  ghosthunter: {
    checks: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map((h) => at(h)),
    jitter: 10, diet: 'balance', trace: 'balance', winRate: 0.75, gamer: true,
  },
};

export function checkIn(s, p, now, rng, ctx) {
  const doAct = (a, opts) => act(s, a, now, rng, opts);
  const useItem = (id) => {
    const slot = s.inventory.indexOf(id);
    if (slot < 0 || p.noItems) return false;
    return doAct('use', { slot }).ok;
  };
  // Items first: they can resolve things more cheaply than actions.
  if (s.event?.type === 'trace' && p.trace !== 'hide') useItem('voucher');
  if (s.stats.heat > 70) useItem('coolant');
  if (ctx.gapToNext >= 240 && !(s.buffs?.shieldUntilAge > s.ageMin)) useItem('antivirus');
  if (s.virus) useItem('antivirus');
  if ((p.hot || s.stats.sync < 30) && !s.asleep) useItem('blackice');
  if (p.gamer && !s.buffs?.boost) useItem('booster');
  ctx.itemsHeld = Math.max(ctx.itemsHeld ?? 0, s.inventory.length);

  // Netrun when healthy, in any open region.
  // Careful runners only jack in healthy, and only when they'll be back soon to patch things up.
  const careful = p.runs === 'careful';
  const healthy = s.stats.integrity > (careful ? 80 : 60) && s.stats.charge > 60;
  const aroundAfter = !careful || ctx.gapToNext <= 120;
  if (p.runs && !p.noRuns && healthy && aroundAfter) {
    const open = REGION_ORDER.filter((r) => !regionLock(r, s.stage, ctx.codex));
    const region = open[Math.floor(rng() * open.length)];
    if (region && !runBlockReason(s, region, ctx.codex)) {
      const lean = { hide: 'indie', comply: 'corp' }[p.trace] ?? 'mix';
      const run = playRun(s, { ...RUN_STYLES[p.runs], winRate: p.winRate, lean }, region, rng, ctx.codex);
      ctx.runs = (ctx.runs ?? 0) + 1;
      if (run.result === 'disconnected') ctx.runDisconnects = (ctx.runDisconnects ?? 0) + 1;
      finishRun(s, now);
      ctx.codex.push(...(s.codexInbox ?? []).filter((id) => !ctx.codex.includes(id)));
      s.codexInbox = [];
    }
  }
  if (s.event?.type === 'trace') {
    let choice = p.trace;
    if (choice === 'mix') choice = rng() < 0.5 ? 'hide' : 'comply';
    if (choice === 'balance') choice = s.axes.allegiance > 0 ? 'hide' : 'comply';
    doAct(choice);
  }
  if (s.event?.type === 'attack') doAct('defend', { won: rng() < p.winRate });
  if (s.event?.type === 'overflow') doAct('purge');
  if (s.virus) doAct('patch');
  if (s.cache > 0 && !(p.sloppy && s.cache < 3)) doAct('purge');
  const coolAt = p.hot ? 80 : 50;
  if (s.stats.heat > coolAt) doAct('cool');
  const feed = () => {
    for (let i = 0; i < 4 && s.stats.charge < 85 && !blockReason(s, 'corp'); i++) {
      const corp = p.diet === 'balance' ? s.axes.allegiance <= 0 : rng() < p.diet;
      doAct(corp ? 'corp' : 'scav');
    }
  };
  if (s.stats.charge < 30) feed();
  const syncTarget = p.gamer ? 90 : 80;
  for (let i = 0; i < 4 && s.stats.sync < syncTarget && s.stats.charge >= 20 && !blockReason(s, 'play'); i++) {
    const game = GAME_IDS[ctx.games++ % GAME_IDS.length];
    doAct('play', { game, won: rng() < p.winRate });
    if (s.stats.heat > coolAt + 10) doAct('cool');
  }
  if (s.stats.heat > coolAt) doAct('cool');
  feed();
  // The UI shows bedtime, so players kill the lights if it's due before their next check.
  const nowMin = (now / MIN) % (24 * 60);
  const untilBed = (bedtimeHour(s) * 60 - nowMin + 24 * 60) % (24 * 60);
  const bedSoon = untilBed > 0 && untilBed <= ctx.gapToNext;
  // Lights off if it's asleep, bedtime lands before the next check, or this is the player's last check.
  const wantDark = s.asleep || bedSoon || ctx.lastOfDay;
  if (wantDark === s.lightsOn) doAct('lights');
}

export function simulate(p, seed, { rootAccess = Boolean(process.env.ROOT) } = {}) {
  const rng = mulberry32(seed);
  const t0 = Date.UTC(2026, 0, 5, 8, 0);
  const s = createScript({ now: t0, rng, rootAccess });
  const ctx = { games: 0, lastOfDay: false, codex: [] };
  const lastCheck = Math.max(...p.checks);
  let minute = 0;
  let schedule = [];
  let teenAt = null;
  let adultAt = null;
  let teenForm = null;
  const mistakeKinds = {};
  let prevFlags = { ...s.flagged };
  let traces = 0;
  let tracesIgnored = 0;
  let prevEvent = null;
  while (s.stage !== 'dead' && minute < CFG.lifespanMin + 60) {
    const dayMin = (at(8) + minute) % DAY;
    if (dayMin === 0 || minute === 0) {
      schedule = p.checks.map((c) => ({ c, t: c + Math.round((rng() * 2 - 1) * p.jitter) }));
    }
    minute++;
    const integrityBefore = s.stats.integrity;
    tick(s, t0 + minute * MIN, rng);
    for (const k of Object.keys(s.flagged)) {
      if (s.flagged[k] && !prevFlags[k]) {
        mistakeKinds[k] = (mistakeKinds[k] ?? 0) + 1;
      }
    }
    prevFlags = { ...s.flagged };
    if (s.event && !prevEvent) traces++;
    if (prevEvent && !s.event && s.stats.integrity < integrityBefore - 10) tracesIgnored++;
    prevEvent = s.event;
    if (s.stage === 'teen' && teenAt === null) {
      teenAt = minute;
      teenForm = s.form;
    }
    if (s.stage === 'adult' && adultAt === null) {
      adultAt = minute;
      ctx.atAdult = { axes: { ...s.axes }, wins: GAME_IDS.reduce((n, id) => n + s.games[id].won, 0), mistakes: s.careMistakes };
    }
    const due = schedule.find((x) => x.t === (at(8) + minute) % DAY);
    if (due && s.stage !== 'dead') {
      ctx.lastOfDay = due.c === lastCheck;
      const sorted = [...p.checks].sort((a, b) => a - b);
      const next = sorted.find((c) => c > due.c) ?? sorted[0] + 24 * 60;
      ctx.gapToNext = next - due.c;
      checkIn(s, p, t0 + minute * MIN, rng, ctx);
      prevFlags = { ...s.flagged };
      prevEvent = s.event;
    }
  }
  return {
    ageMin: s.ageMin,
    cause: s.deathCause,
    mistakes: s.careMistakes,
    teenForm,
    adultForm: adultAt ? s.form : null,
    axes: { ...s.axes },
    wins: GAME_IDS.reduce((n, id) => n + s.games[id].won, 0),
    atAdult: ctx.atAdult ?? null,
    rootUsed: s.rootUsed,
    itemsHeld: ctx.itemsHeld ?? 0,
    runs: ctx.runs ?? 0,
    runDisconnects: ctx.runDisconnects ?? 0,
    fragments: ctx.codex.length,
    mistakeKinds,
    traces,
    tracesIgnored,
  };
}

const mean = (xs) => (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1);

export function summarize(results) {
  const n = results.length;
  const pct = (k) => `${Math.round((100 * k) / n)}%`;
  const count = (f) => results.filter(f).length;
  const tally = (key) => {
    const m = {};
    for (const r of results) if (r[key]) m[r[key]] = (m[r[key]] ?? 0) + 1;
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} ${pct(v)}`)
      .join(', ');
  };
  const ages = results.map((r) => r.ageMin).sort((a, b) => a - b);
  return {
    teen: pct(count((r) => r.ageMin >= CFG.teenAtMin)),
    adult: pct(count((r) => r.adultForm)),
    fullLife: pct(count((r) => r.cause === 'end of life cycle')),
    medianDays: (ages[Math.floor(n / 2)] / DAY).toFixed(1),
    avgMistakes: (results.reduce((a, r) => a + r.mistakes, 0) / n).toFixed(1),
    deaths: tally('cause'),
    teens: tally('teenForm'),
    adults: tally('adultForm'),
    mistakeKinds: Object.entries(
      results.reduce((m, r) => {
        for (const [k, v] of Object.entries(r.mistakeKinds)) m[k] = (m[k] ?? 0) + v;
        return m;
      }, {}),
    )
      .map(([k, v]) => `${k} ${(v / n).toFixed(1)}`)
      .join(', '),
    axes: `allegiance ${mean(results.map((r) => r.axes.allegiance))}, stability ${mean(results.map((r) => r.axes.stability))}`,
    wins: mean(results.map((r) => r.wins)),
    atAdult: (() => {
      const a = results.filter((r) => r.atAdult).map((r) => r.atAdult);
      if (!a.length) return 'n/a';
      return `allegiance ${mean(a.map((x) => x.axes.allegiance))} (|${mean(a.map((x) => Math.abs(x.axes.allegiance)))}|), stability ${mean(a.map((x) => x.axes.stability))}, wins ${mean(a.map((x) => x.wins))}, mistakes ${mean(a.map((x) => x.mistakes))}`;
    })(),
    traces: `${mean(results.map((r) => r.traces))} (${mean(results.map((r) => r.tracesIgnored))} ignored)`,
    itemsHeld: mean(results.map((r) => r.itemsHeld)),
    runs: `${mean(results.map((r) => r.runs))} runs (${mean(results.map((r) => r.runDisconnects))} disconnects), ${mean(results.map((r) => r.fragments))} fragments`,
  };
}

// Try settings without editing sim.js: CFG='{"drainPerHour":{"charge":14},"teenAtMin":1200}' npm run balance
if (process.env.CFG) {
  const over = JSON.parse(process.env.CFG);
  Object.assign(CFG, over, { drainPerHour: { ...CFG.drainPerHour, ...over.drainPerHour } });
}
const runs = Number(process.argv[2] ?? 300);
if (process.env.NO_ITEMS) for (const p of Object.values(ARCHETYPES)) p.noItems = true;
if (process.env.NO_RUNS) for (const p of Object.values(ARCHETYPES)) p.noRuns = true;
const filter = process.argv[3];
if (import.meta.url === `file://${process.argv[1]}`) {
  for (const [name, p] of Object.entries(ARCHETYPES)) {
    if (filter && !name.includes(filter)) continue;
    const results = Array.from({ length: runs }, (_, i) => simulate(p, i + 1));
    const sum = summarize(results);
    console.log(`\n== ${name} (${runs} runs)`);
    console.log(`  reach teen ${sum.teen} · adult ${sum.adult} · full life ${sum.fullLife} · median ${sum.medianDays}d · mistakes ${sum.avgMistakes}`);
    console.log(`  deaths: ${sum.deaths}`);
    console.log(`  teens:  ${sum.teens}`);
    console.log(`  adults: ${sum.adults}`);
    if (process.env.DETAIL) {
      console.log(`  mistakes/run: ${sum.mistakeKinds}`);
      console.log(`  at adult: ${sum.atAdult} · traces ${sum.traces} · peak items held ${sum.itemsHeld}`);
      console.log(`  netrun: ${sum.runs}`);
    }
  }
}
