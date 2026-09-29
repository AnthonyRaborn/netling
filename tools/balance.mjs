// Headless balance harness: simulates full lifetimes under scripted player archetypes.
// Usage: node tools/balance.mjs [runsPerArchetype=300] [archetype filter]
// Settings (environment): DETAIL=1 more lines; JSON=1 machine-readable output (compare two with
// tools/balance-diff.mjs); CFG='{...}' override CFG; NO_ITEMS=1, NO_RUNS=1; ROOT=1 Root Access;
// TRAIT=<adult form> start as the child of that form (TRAIT_LEVEL=<1-3> its level, HISTORY=<adult form>
// the grandparent, whose trait is its history at half strength); LIVES=<n> simulate lineages of n lives,
// carrying the fragment, codex and Root Access from each life to the next.
process.env.TZ = 'UTC';
const { createScript, tick, act, blockReason, bedtimeHour, mulberry32, CFG, FORMS, KEEPSAKES, MIN, GAME_IDS, INVENTORY_SLOTS } = await import('../src/sim.js');
const { RUN_CFG, runCooldownLeft } = await import('../src/netrun/run.js');
const { runBlockReason } = await import('../src/netrun/run.js');
const { REGION_ORDER, regionLock } = await import('../src/netrun/regions.js');
const { FRAGMENTS } = await import('../src/netrun/codex.js');
const { playRun, finishRun, surplusSlot, RUN_STYLES } = await import('./netrun-bot.mjs');

const DAY = 24 * 60;
const at = (h, m = 0) => h * 60 + m;

// Check-in times are minutes-of-day; each gets +/- jitter minutes of randomness.
// diet: probability of choosing corp over scav. trace: 'hide' | 'comply' | 'mix'.
// hot: keep playing even when warm (overclocker); coolAt overrides the Heat it cools at.
// winRate: mini-game skill. runs: a RUN_STYLES name. anomaly: an ANOMALY_PREFS name (netrun-bot).
// shop: false to walk past markets. babyFaults: let this many faults happen as a baby, on purpose.
const ATTENTIVE = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map((h) => at(h));

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
  // Attentive care, but takes every risk that doesn't cost a fault: plays hot, uses Overclock rigs,
  // SALVAGE and RAID. Shows whether a caring player can lean chaotic.
  daredevil: { checks: ATTENTIVE, jitter: 15, diet: 0.5, trace: 'mix', winRate: 0.7, runs: 'careful', hot: true, anomaly: 'risky' },
  // Attentive players steering for one form with every choice they have (Ghost's is ghosthunter).
  'steer-chrome': { checks: ATTENTIVE, jitter: 15, diet: 1, trace: 'comply', winRate: 0.7, runs: 'careful', anomaly: 'corp', shop: false },
  'steer-firewall': { checks: ATTENTIVE, jitter: 15, diet: 0, trace: 'hide', winRate: 0.7, runs: 'careful', anomaly: 'indie' },
  'steer-daemon': { checks: ATTENTIVE, jitter: 15, diet: 'balance', trace: 'balance', winRate: 0.7, runs: 'careful', anomaly: 'orderly' },
  'steer-glitch': { checks: ATTENTIVE, jitter: 15, diet: 'balance', trace: 'balance', winRate: 0.7, runs: 'careful', coolAt: 88, anomaly: 'risky' },
  // Attentive, but takes three faults as a baby for a Stub teen: a Segfault (2) if it finds one,
// then lets Charge or Sync run out for the rest.
  'steer-stub': { checks: ATTENTIVE, jitter: 15, diet: 0.5, trace: 'mix', winRate: 0.7, runs: 'careful', babyFaults: 3 },
};

export function checkIn(s, p, now, rng, ctx) {
  const doAct = (a, opts) => act(s, a, now, rng, opts);
  const useItem = (id) => {
    const slot = s.inventory.indexOf(id);
    if (slot < 0 || p.noItems) return false;
    return doAct('use', { slot }).ok;
  };
  ctx.checkIns = (ctx.checkIns ?? 0) + 1;
  if (s.inventory.length >= INVENTORY_SLOTS) ctx.fullChecks = (ctx.fullChecks ?? 0) + 1;
  // Only a player steering for a Stub keeps a Segfault (as a baby); everyone else scraps it.
  const wantsFaults = p.babyFaults && s.stage === 'baby' && s.careMistakes < p.babyFaults;
  for (let i = s.inventory.length - 1; i >= 0 && !wantsFaults; i--) if (s.inventory[i] === 'segfault') doAct('discard', { slot: i });
  if (wantsFaults) useItem('segfault');
  // What this player has a use for; the rest is surplus, sold at markets or scrapped when full.
  const keep = ['coolant', 'antivirus', 'repair', 'overclock', 'blackice'];
  if (p.trace !== 'hide') keep.push('voucher');
  if (p.gamer) keep.push('booster');
  if (wantsFaults) keep.push('segfault');
  if (s.inventory.length >= INVENTORY_SLOTS && !p.noItems) {
    const slot = surplusSlot(s.inventory, keep);
    if (slot !== null) doAct('discard', { slot });
  }
  if (s.stats.integrity < 60) useItem('repair');
  if (p.runs && runCooldownLeft(s) > 0) useItem('overclock');
  // Items first: they can resolve things more cheaply than actions.
  if (s.event?.type === 'trace' && p.trace !== 'hide') useItem('voucher');
  if (s.stats.heat > 70) useItem('coolant');
  if (ctx.gapToNext >= 240 && !(s.buffs?.shieldUntilAge > s.ageMin)) useItem('antivirus');
  if (s.virus) useItem('antivirus');
  if ((p.hot || s.stats.sync < 30) && !s.asleep) useItem('blackice');
  if (p.gamer && !s.buffs?.boost) useItem('booster');
  ctx.itemsHeld = Math.max(ctx.itemsHeld ?? 0, s.inventory.length);

  // Taking faults on purpose as a baby: let Charge and Sync run out until enough faults have
  // landed. A fault only counts once until the stat recovers, so a flagged one is topped up again.
  const holdBack = p.babyFaults && s.stage === 'baby' && s.careMistakes < p.babyFaults;
  const mayFeed = !holdBack || s.flagged.charge;
  const mayPlay = !holdBack || s.flagged.sync;
  const feed = () => {
    for (let i = 0; i < 4 && s.stats.charge < 85 && !blockReason(s, 'corp'); i++) {
      const corp = p.diet === 'balance' ? s.axes.allegiance <= 0 : rng() < p.diet;
      doAct(corp ? 'corp' : 'scav');
    }
  };
  // A runner feeds before deciding to jack in, as a player would.
  if (p.runs && !p.noRuns && mayFeed && s.stats.charge <= 60) feed();
  // Netrun when healthy. Until the deepest open region is cleared it heads there (the way down);
  // after that, any open region.
  // Careful runners only jack in healthy, and only when they'll be back soon to patch things up.
  const careful = p.runs === 'careful';
  const healthy = s.stats.integrity > (careful ? 80 : 60) && s.stats.charge > 60;
  const aroundAfter = !careful || ctx.gapToNext <= 120;
  if (p.runs && !p.noRuns && healthy && aroundAfter) {
    const open = REGION_ORDER.filter((r) => !regionLock(r, s.stage, ctx.codex, s.cleared));
    const frontier = open.at(-1);
    const region = frontier && !s.cleared.includes(frontier) ? frontier : open[Math.floor(rng() * open.length)];
    if (region && !runBlockReason(s, region, ctx.codex)) {
      const lean = { hide: 'indie', comply: 'corp', balance: 'balance' }[p.trace] ?? 'mix';
      const run = playRun(s, { ...RUN_STYLES[p.runs], winRate: p.winRate, lean, anomaly: p.anomaly, shop: p.shop, keep }, region, rng, ctx.codex);
      ctx.runs = (ctx.runs ?? 0) + 1;
      ctx.regionRuns[region] = (ctx.regionRuns[region] ?? 0) + 1;
      ctx.bought = (ctx.bought ?? 0) + run.messages.filter((m) => m.startsWith('bought')).length;
      ctx.sold = (ctx.sold ?? 0) + (run.sold ?? 0);
      ctx.markets = (ctx.markets ?? 0) + (run.markets ?? 0);
      ctx.affordable = (ctx.affordable ?? 0) + (run.affordable ?? 0);
      if (run.result === 'jacked' && run.messages.some((m) => m.startsWith('bought'))) ctx.runsWithBuy = (ctx.runsWithBuy ?? 0) + 1;
      ctx.scripPeak = Math.max(ctx.scripPeak ?? 0, s.scrip);
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
  const coolAt = p.coolAt ?? (p.hot ? 80 : 50);
  if (s.stats.heat > coolAt) doAct('cool');
  if (mayFeed && s.stats.charge < 30) feed();
  const syncTarget = p.gamer ? 90 : 80;
  for (let i = 0; mayPlay && i < 4 && s.stats.sync < syncTarget && s.stats.charge >= 20 && !blockReason(s, 'play'); i++) {
    const game = GAME_IDS[ctx.games++ % GAME_IDS.length];
    doAct('play', { game, won: rng() < p.winRate });
    if (s.stats.heat > coolAt + 10) doAct('cool');
  }
  if (s.stats.heat > coolAt) doAct('cool');
  if (mayFeed) feed();
  // The UI shows bedtime, so players kill the lights if it's due before their next check.
  const nowMin = (now / MIN) % (24 * 60);
  const untilBed = (bedtimeHour(s) * 60 - nowMin + 24 * 60) % (24 * 60);
  const bedSoon = untilBed > 0 && untilBed <= ctx.gapToNext;
  // Lights off if it's asleep, bedtime lands before the next check, or this is the player's last check.
  const wantDark = s.asleep || bedSoon || ctx.lastOfDay;
  if (wantDark === s.lightsOn) doAct('lights');
}

// One life. fragment: the parent's (as flatline() leaves it), for a later generation. codex: the
// fragments already found, carried along a lineage.
export function simulate(p, seed, { rootAccess = Boolean(process.env.ROOT), fragment = null, generation = 1, codex = [] } = {}) {
  const rng = mulberry32(seed);
  const t0 = Date.UTC(2026, 0, 5, 8, 0);
  const s = createScript({ now: t0, rng, rootAccess, fragment, generation });
  const ctx = { games: 0, lastOfDay: false, codex: [...codex], regionRuns: {} };
  const codexAtStart = ctx.codex.length;
  const lastCheck = Math.max(...p.checks);
  let minute = 0;
  let schedule = [];
  let teenAt = null;
  let adultAt = null;
  let teenForm = null;
  const mistakeKinds = {};
  let prevFlags = { ...s.flagged };
  let segfaultAt = null; // the minute a Segfault first turned up
  let events = 0; // every timed event: traces, intrusions, overflows
  let traces = 0;
  let tracesIgnored = 0;
  let prevEvent = null;
  while (s.stage !== 'dead' && minute < s.life.lifespan + 60) {
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
    if (s.event && !prevEvent) {
      events++;
      if (s.event.type === 'trace') traces++;
    }
    // A trace left to run out costs Integrity at once.
    if (prevEvent?.type === 'trace' && !s.event && s.stats.integrity < integrityBefore - 10) tracesIgnored++;
    prevEvent = s.event;
    if (segfaultAt === null && s.inventory.includes('segfault')) segfaultAt = minute;
    if (s.stage === 'teen' && teenAt === null) {
      teenAt = minute;
      teenForm = s.form;
      ctx.atTeen = { axes: { ...s.axes }, mistakes: s.careMistakes, wins: GAME_IDS.reduce((n, id) => n + s.games[id].won, 0), minWins: Math.min(...GAME_IDS.map((id) => s.games[id].won)) };
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
    atTeen: ctx.atTeen ?? null,
    rootUsed: s.rootUsed,
    trait: s.trait ?? null,
    life: { ...s.life },
    segfaultAt,
    fragment: s.fragment ?? null,
    codex: ctx.codex,
    newFragments: ctx.codex.length - codexAtStart,
    // Days spent in each stage (a stage not reached counts as 0).
    stageDays: {
      baby: (teenAt ?? s.ageMin) / DAY,
      teen: teenAt === null ? 0 : ((adultAt ?? s.ageMin) - teenAt) / DAY,
      adult: adultAt === null ? 0 : (s.ageMin - adultAt) / DAY,
    },
    itemsHeld: ctx.itemsHeld ?? 0,
    runs: ctx.runs ?? 0,
    runDisconnects: ctx.runDisconnects ?? 0,
    fragments: ctx.codex.length - codexAtStart,
    codexCapped: (s.codexFound ?? 0) >= RUN_CFG.codexPerLife,
    cleared: [...(s.cleared ?? [])],
    regionRuns: ctx.regionRuns,
    fullShare: ctx.checkIns ? (ctx.fullChecks ?? 0) / ctx.checkIns : 0,
    scrip: { end: s.scrip ?? 0, peak: ctx.scripPeak ?? 0, bought: ctx.bought ?? 0, sold: ctx.sold ?? 0, markets: ctx.markets ?? 0, affordable: ctx.affordable ?? 0 },
    mistakeKinds,
    events,
    traces,
    tracesIgnored,
  };
}

const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const round = (x, places = 3) => Math.round(x * 10 ** places) / 10 ** places;

// The share of results for each value of key, as fractions, largest first.
function shares(results, key) {
  const m = {};
  for (const r of results) if (r[key]) m[r[key]] = (m[r[key]] ?? 0) + 1;
  return Object.fromEntries(Object.entries(m).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, round(v / results.length)]));
}

const BALANCE_BANDS = [1, 1.5, 2, 3];

// Everything the report says, as numbers (rates are fractions). JSON=1 prints this.
export function stats(results) {
  const n = results.length;
  const rate = (f) => round(results.filter(f).length / n);
  const ages = results.map((r) => r.ageMin).sort((a, b) => a - b);
  const adults = results.filter((r) => r.atAdult).map((r) => r.atAdult);
  const teens = results.filter((r) => r.atTeen).map((r) => r.atTeen);
  const kinds = {};
  for (const r of results) for (const [k, v] of Object.entries(r.mistakeKinds)) kinds[k] = (kinds[k] ?? 0) + v;
  return {
    runs: n,
    teen: rate((r) => r.ageMin >= r.life.teenAt),
    // A Segfault turned up before the teen stage (what a player steering for a Stub needs).
    segfaultBeforeTeen: rate((r) => r.segfaultAt !== null && r.segfaultAt < r.life.teenAt),
    adult: rate((r) => r.adultForm),
    fullLife: rate((r) => r.cause === 'end of life cycle'),
    medianDays: round(ages[Math.floor(n / 2)] / DAY, 2),
    mistakes: round(avg(results.map((r) => r.mistakes)), 2),
    deaths: shares(results, 'cause'),
    teens: shares(results, 'teenForm'),
    adults: shares(results, 'adultForm'),
    mistakeKinds: Object.fromEntries(Object.entries(kinds).map(([k, v]) => [k, round(v / n, 2)])),
    stageDays: Object.fromEntries(['baby', 'teen', 'adult'].map((k) => [k, round(avg(results.map((r) => r.stageDays[k])), 2)])),
    axes: { allegiance: round(avg(results.map((r) => r.axes.allegiance)), 2), stability: round(avg(results.map((r) => r.axes.stability)), 2) },
    atAdult: adults.length
      ? {
          allegiance: round(avg(adults.map((x) => x.axes.allegiance)), 2),
          absAllegiance: round(avg(adults.map((x) => Math.abs(x.axes.allegiance))), 2),
          stability: round(avg(adults.map((x) => x.axes.stability)), 2),
          wins: round(avg(adults.map((x) => x.wins)), 2),
          mistakes: round(avg(adults.map((x) => x.mistakes)), 2),
        }
      : null,
    // The axes when it became a teen, and how often both were within k of zero (a balanced netling).
    atTeen: teens.length
      ? {
          allegiance: round(avg(teens.map((x) => x.axes.allegiance)), 2),
          absAllegiance: round(avg(teens.map((x) => Math.abs(x.axes.allegiance))), 2),
          stability: round(avg(teens.map((x) => x.axes.stability)), 2),
          absStability: round(avg(teens.map((x) => Math.abs(x.axes.stability))), 2),
          mistakes: round(avg(teens.map((x) => x.mistakes)), 2),
          // Keys are strings so they keep this order (1.5 would otherwise sort after 3).
          balancedWithin: Object.fromEntries(
            BALANCE_BANDS.map((k) => [`w${k}`, round(teens.filter((x) => Math.abs(x.axes.allegiance) <= k && Math.abs(x.axes.stability) <= k && x.mistakes <= 2).length / n)]),
          ),
          // On Ghost's own path at 24 hours: its allegiance and stability rules, and at most 1 fault.
          wins: round(avg(teens.map((x) => x.wins)), 2),
          minWins: round(avg(teens.map((x) => x.minWins)), 2),
          // Ghost's path plus every game won at least twice (or once): narrower hints.
          ghostPathPlay: round(teens.filter((x) => Math.abs(x.axes.allegiance) < 2 && x.axes.stability >= 0 && x.mistakes <= 1 && x.minWins >= 2).length / n),
          ghostPathPlayOnce: round(teens.filter((x) => Math.abs(x.axes.allegiance) < 2 && x.axes.stability >= 0 && x.mistakes <= 1 && x.minWins >= 1).length / n),
          ghostPath: round(teens.filter((x) => Math.abs(x.axes.allegiance) < 2 && x.axes.stability >= 0 && x.mistakes <= 1).length / n),
        }
      : null,
    wins: round(avg(results.map((r) => r.wins)), 2),
    events: round(avg(results.map((r) => r.events)), 2),
    traces: round(avg(results.map((r) => r.traces)), 2),
    tracesIgnored: round(avg(results.map((r) => r.tracesIgnored)), 2),
    itemsHeld: round(avg(results.map((r) => r.itemsHeld)), 2),
    // How often a check-in found the inventory full (the target is under half).
    fullAtCheckIn: round(avg(results.map((r) => r.fullShare))),
    netruns: {
      runs: round(avg(results.map((r) => r.runs)), 2),
      disconnects: round(avg(results.map((r) => r.runDisconnects)), 2),
      fragments: round(avg(results.map((r) => r.fragments)), 2),
      codexCapped: rate((r) => r.codexCapped),
      // The share of lives that reached each region's exit, and the average runs in each.
      cleared: Object.fromEntries(REGION_ORDER.map((id) => [id, rate((r) => r.cleared.includes(id))])),
      byRegion: Object.fromEntries(REGION_ORDER.map((id) => [id, round(avg(results.map((r) => r.regionRuns[id] ?? 0)), 2)])),
    },
    scrip: {
      end: round(avg(results.map((r) => r.scrip.end)), 1),
      peak: round(avg(results.map((r) => r.scrip.peak)), 1),
      bought: round(avg(results.map((r) => r.scrip.bought)), 2),
      sold: round(avg(results.map((r) => r.scrip.sold)), 2),
      // Of the markets it met, the share where it could afford at least one item (after selling).
      affordable: round(results.reduce((a, r) => a + r.scrip.affordable, 0) / Math.max(1, results.reduce((a, r) => a + r.scrip.markets, 0))),
      marketsPerRun: round(results.reduce((a, r) => a + r.scrip.markets, 0) / Math.max(1, results.reduce((a, r) => a + r.runs, 0)), 2),
    },
  };
}

// Lineages: lives[i] is every line's (i + 1)th life. codexLife is the life that finished the codex.
export function lineStats(lines) {
  const n = lines.length;
  const lives = lines[0].lives.length;
  const done = lines.map((l) => l.codexLife).filter((x) => x !== null).sort((a, b) => a - b);
  return {
    lines: n,
    codex: {
      byLife: Object.fromEntries(Array.from({ length: lives }, (_, i) => [i + 1, round(done.filter((x) => x <= i + 1).length / n)])),
      fastest: done[0] ?? null,
      median: done.length * 2 > n ? done[Math.floor(n / 2)] : null, // null: fewer than half finished
    },
    lives: Array.from({ length: lives }, (_, i) => stats(lines.map((l) => l.lives[i]).filter(Boolean))),
  };
}

// A parent fragment for TRAIT=<adult form>.
// level: the trait's level (a streak of that form); history: the grandparent's adult form, whose trait
// comes back at half strength.
export function parentOf(form, { level = 1, history = null } = {}) {
  const forms = Object.keys(FORMS).join(', ');
  if (!FORMS[form]) throw new Error(`TRAIT must be an adult form: ${forms}`);
  if (history && !FORMS[history]) throw new Error(`HISTORY must be an adult form: ${forms}`);
  return { form, trait: FORMS[form].trait, quirk: null, keepsake: KEEPSAKES[form], rootUsed: false, level, history: history ? FORMS[history].trait : null };
}

// n lives in a row: each child inherits its parent's fragment, the codex found so far, and Root
// Access once the codex is complete (the game also grants it mid-life; this gives it from the next).
export function simulateLine(p, seed, lives, { fragment = null } = {}) {
  const out = [];
  let codex = [];
  let codexLife = null;
  for (let gen = 1; gen <= lives; gen++) {
    const r = simulate(p, seed * 1000 + gen, { fragment, generation: gen, codex, rootAccess: codexLife !== null || Boolean(process.env.ROOT) });
    out.push(r);
    codex = r.codex;
    if (codexLife === null && codex.length >= FRAGMENTS.length) codexLife = gen;
    fragment = r.fragment;
  }
  return { lives: out, codexLife };
}

const pct = (x) => `${Math.round(x * 100)}%`;
const list = (m) => Object.entries(m).map(([k, v]) => `${k} ${pct(v)}`).join(', ');

function printLife(st, detail) {
  console.log(`  reach teen ${pct(st.teen)} · adult ${pct(st.adult)} · full life ${pct(st.fullLife)} · median ${st.medianDays.toFixed(1)}d · mistakes ${st.mistakes.toFixed(1)}`);
  console.log(`  deaths: ${list(st.deaths)}`);
  console.log(`  teens:  ${list(st.teens)}`);
  console.log(`  adults: ${list(st.adults)}`);
  if (!detail) return;
  const a = st.atAdult;
  console.log(`  mistakes/run: ${Object.entries(st.mistakeKinds).map(([k, v]) => `${k} ${v.toFixed(1)}`).join(', ')}`);
  console.log(`  days as: baby ${st.stageDays.baby.toFixed(1)}, teen ${st.stageDays.teen.toFixed(1)}, adult ${st.stageDays.adult.toFixed(1)}`);
  const t = st.atTeen;
  if (t) console.log(`  at teen: allegiance ${t.allegiance.toFixed(1)} (|${t.absAllegiance.toFixed(1)}|), stability ${t.stability.toFixed(1)} (|${t.absStability.toFixed(1)}|), mistakes ${t.mistakes.toFixed(1)} · both axes within 1/1.5/2/3: ${Object.values(t.balancedWithin).map(pct).join(' / ')} · on Ghost's path ${pct(t.ghostPath)} (${pct(t.ghostPathPlay)} with every game won twice, ${pct(t.ghostPathPlayOnce)} once) · wins ${t.wins.toFixed(1)}, fewest in one game ${t.minWins.toFixed(1)}`);
  if (a) console.log(`  at adult: allegiance ${a.allegiance.toFixed(1)} (|${a.absAllegiance.toFixed(1)}|), stability ${a.stability.toFixed(1)}, wins ${a.wins.toFixed(1)}, mistakes ${a.mistakes.toFixed(1)} · events ${st.events.toFixed(1)}, traces ${st.traces.toFixed(1)} (${st.tracesIgnored.toFixed(1)} ignored) · peak items held ${st.itemsHeld.toFixed(1)}`);
  console.log(`  segfault found before the teen stage: ${pct(st.segfaultBeforeTeen)}`);
  console.log(`  netrun: ${st.netruns.runs.toFixed(1)} runs (${st.netruns.disconnects.toFixed(1)} disconnects), ${st.netruns.fragments.toFixed(1)} fragments, codex cap reached ${pct(st.netruns.codexCapped)}`);
  console.log(`  cleared: ${list(st.netruns.cleared)} · runs by region: ${Object.entries(st.netruns.byRegion).map(([k, v]) => `${k} ${v.toFixed(1)}`).join(', ')}`);
  console.log(`  scrip: ${st.scrip.end.toFixed(0)} at the end (peak ${st.scrip.peak.toFixed(0)}), ${st.scrip.bought.toFixed(1)} bought, ${st.scrip.sold.toFixed(1)} sold, could afford an item at ${pct(st.scrip.affordable)} of markets (${st.scrip.marketsPerRun.toFixed(2)} a run) · inventory full at ${pct(st.fullAtCheckIn)} of check-ins`);
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
  const parent = process.env.TRAIT ? parentOf(process.env.TRAIT, { level: Number(process.env.TRAIT_LEVEL ?? 1), history: process.env.HISTORY ?? null }) : null;
  const lives = Number(process.env.LIVES ?? 0);
  const report = { runs, trait: process.env.TRAIT ?? null, lives: lives || null, cfg: process.env.CFG ? JSON.parse(process.env.CFG) : null, archetypes: {} };
  for (const [name, p] of Object.entries(ARCHETYPES)) {
    if (filter && !name.includes(filter)) continue;
    if (lives) {
      const st = lineStats(Array.from({ length: runs }, (_, i) => simulateLine(p, i + 1, lives, { fragment: parent })));
      report.archetypes[name] = st;
      if (process.env.JSON) continue;
      console.log(`\n== ${name} (${runs} lineages of ${lives} lives${parent ? `, first parent ${process.env.TRAIT}` : ''})`);
      console.log(`  codex complete by life: ${Object.entries(st.codex.byLife).map(([k, v]) => `${k}: ${pct(v)}`).join(', ')} · fastest ${st.codex.fastest ?? 'never'} · median ${st.codex.median ?? `over ${lives}`}`);
      console.log(`  new fragments per life: ${st.lives.map((l) => l.netruns.fragments.toFixed(1)).join(', ')}`);
      st.lives.forEach((l, i) => {
        console.log(` life ${i + 1}:`);
        printLife(l, process.env.DETAIL);
      });
      continue;
    }
    const st = stats(Array.from({ length: runs }, (_, i) => simulate(p, i + 1, { fragment: parent, generation: parent ? 2 : 1 })));
    report.archetypes[name] = st;
    if (process.env.JSON) continue;
    console.log(`\n== ${name} (${runs} runs${parent ? `, child of a ${process.env.TRAIT}` : ''})`);
    printLife(st, process.env.DETAIL);
  }
  if (process.env.JSON) console.log(JSON.stringify(report, null, 2));
}
