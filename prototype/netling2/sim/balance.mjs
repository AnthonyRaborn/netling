// Netling 2.0 headless balance harness: a fork of tools/balance.mjs that drives the 2.0 core rules (./sim.js).
// Usage: node prototype/netling2/sim/balance.mjs [runsPerArchetype=300] [archetype filter]
// New settings: CLEAR=scrip|both|none how bots clear bugs unless an archetype sets its own `fix` policy (scrip at check-ins; 'both' falls back to
// 2 Standing, 1 from each track);
// PREF='{"on":false}' switches care preferences off; PREFBOT=follow makes the bots follow their netling's preference;
// BUGS='{"chance":0.5,"max":8}' overrides the bug rules. The archetypes keep their 1.0 names; the steer-* ones now aim at a
// Standing lean or a temper level (the form names they were written for no longer exist). TRAIT is not supported (no 2.0 form
// carries a trait). The remaining text below is 1.0's.
// Settings (environment): DETAIL=1 more lines; JSON=1 machine-readable output (compare two with
// tools/balance-diff.mjs); CFG='{...}' override CFG; NO_ITEMS=1, NO_RUNS=1; ROOT=1 Root Access;
// TRAIT=<adult form> start as the child of that form (TRAIT_LEVEL=<1-3> its level, HISTORY=<adult form>
// the grandparent, whose trait is its history at half strength); LIVES=<n> simulate lineages of n lives,
// carrying the fragment, codex and Root Access from each life to the next; CODEX=deep (every fragment, so the
// way down is open to The Deep, and Root Access as the game would grant it) or CODEX=ruins (through ruins-4,
// the earliest a lineage can reach The Deep) starts every single life knowing that much.
process.env.TZ = 'UTC';
const { createScript, tick, act, blockReason, bedtimeHour, mulberry32, inFlow, overclocked, lifeEnd, mainframeAt, mainframeDue, mainframeFeat, CFG, FORMS, KEEPSAKES, MIN, GAME_IDS, INVENTORY_SLOTS, BUG_CFG, PREF, temperLevel, clearBug, leanSeen } = await import('./sim.js');
const { RUN_CFG, runCooldownLeft } = await import('./netrun/run.js');
const { runBlockReason } = await import('./netrun/run.js');
const { REGION_ORDER, regionLock } = await import('../../../src/netrun/regions.js');
const { FRAGMENTS, ROOT_FRAGMENT_IDS } = await import('../../../src/netrun/codex.js');
// When a mainframe's extended life would end (docs/SIMULATION.md#mainframe).
const mainframeEnd = (s) => s.life.lifespan + CFG.mainframeBonusMin;
const { playRun, finishRun, surplusSlot, winChance, RUN_STYLES } = await import('./netrun-bot.mjs');

const DAY = 24 * 60;
const at = (h, m = 0) => h * 60 + m;

// Check-in times are minutes-of-day; each gets +/- jitter minutes of randomness.
// diet: probability of choosing corp over scav. trace: 'hide' | 'comply' | 'mix'.
// hot: keep playing even when warm (overclocker); coolAt overrides the Heat it cools at.
// winRate: mini-game skill. runs: a RUN_STYLES name. anomaly: an ANOMALY_PREFS name (netrun-bot).
// shop: false to walk past markets. babyFaults: let this many faults happen as a baby, on purpose.
const ATTENTIVE = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map((h) => at(h));

const ROLES = GAME_IDS; // the four games are the four roles
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
    jitter: 10, diet: 'balance', trace: 'balance', winRate: 0.75, gamer: true, coolAt: 45, // keeps it cool: Ghost needs stability at 0 or above, and only choices move it
  },
  // Attentive care, but takes every risk that doesn't cost a fault: plays hot, uses Overclock rigs,
  // SALVAGE and RAID. Shows whether a caring player can lean chaotic.
  daredevil: { checks: ATTENTIVE, jitter: 15, diet: 0.5, trace: 'mix', winRate: 0.7, runs: 'careful', hot: true, anomaly: 'risky' },
  // Attentive players steering for one form with every choice they have (Ghost's is ghosthunter).
  'steer-chrome': { checks: ATTENTIVE, jitter: 15, diet: 1, trace: 'comply', winRate: 0.7, runs: 'careful', anomaly: 'corp' },
  'steer-firewall': { checks: ATTENTIVE, jitter: 15, diet: 0, trace: 'hide', winRate: 0.7, runs: 'careful', anomaly: 'indie' },
  'steer-daemon': { checks: ATTENTIVE, jitter: 15, diet: 'balance', trace: 'balance', winRate: 0.7, runs: 'careful', anomaly: 'orderly' },
  // Glitch: keeps it overclocked (Heat 65 to 72) without letting it reach the 85+ danger zone.
  'steer-glitch': { checks: ATTENTIVE, jitter: 15, diet: 'balance', trace: 'balance', winRate: 0.7, runs: 'careful', coolAt: 72, anomaly: 'risky' },
  // Attentive, but takes three faults as a baby for a Stub teen: a Segfault (2) if it finds one,
// then lets Charge or Sync run out for the rest.
  // 2.0 role steerers: attentive players who play one game far more than the others (`focus`, chosen for `focusShare` of their
  // plays, the rest rotate) and steer a Standing lean as steer-chrome and steer-firewall do. They show whether a role and a lean
  // can be made certain, and how fast. Requests for another game are mostly declined (a steerer does not detour).
  ...Object.fromEntries(ROLES.flatMap((role) => [
    [`steer-${role}-corp`, { checks: ATTENTIVE, jitter: 15, diet: 1, trace: 'comply', winRate: 0.7, runs: 'careful', anomaly: 'corp', focus: role, focusShare: 0.8 }],
    [`steer-${role}-street`, { checks: ATTENTIVE, jitter: 15, diet: 0, trace: 'hide', winRate: 0.7, runs: 'careful', anomaly: 'indie', focus: role, focusShare: 0.8 }],
  ])),
  // 2.0 noisy players: schedules that vary by day (perDay check-ins, scaled each day, with busy and off days; or dayCounts for bursty
  // play), chores skipped now and then (`lapse`), a mood that moves the win rate, a favorite game (`favorite`: the share of plays) and
  // netruns only some of the time (`runChance`). Packets and traces are random; there is no steering. Nothing here aims at a form.
  'human-casual': { checks: [], prepare: true, perDay: 6, busyDay: 0.25, offDay: 0.1, lapse: 0.2, mood: 0.12, favorite: 0.5, diet: 0.5, trace: 'mix', winRate: 0.6, runs: 'greedy', runChance: 0.5 },
  'human-regular': { checks: [], prepare: true, perDay: 9, busyDay: 0.15, offDay: 0.05, lapse: 0.1, mood: 0.1, favorite: 0.35, diet: 0.5, trace: 'mix', winRate: 0.65, runs: 'careful', runChance: 0.6 },
  'human-keen': { checks: [], prepare: true, perDay: 14, busyDay: 0.1, offDay: 0, lapse: 0.05, mood: 0.08, favorite: 0.3, diet: 0.5, trace: 'mix', winRate: 0.7, runs: 'careful', runChance: 0.7 },
  'human-bursty': { checks: [], prepare: true, dayCounts: [14, 1, 10, 0, 12], lapse: 0.1, mood: 0.1, favorite: 0.35, diet: 0.5, trace: 'mix', winRate: 0.65, runs: 'careful', runChance: 0.6 },
  // 2.0 temper seekers: players who aim at a strong temper level for the Metronome's 12 hour hold. The steady seeker cools early and plays
  // for calm (flow); the unsteady ones play warm (they keep playing up to Heat 80, `hot`), and the last also uses every Segfault it finds
  // (`useSegfault`: temper -4, two faults, and bugs).
  'seek-steady': { checks: ATTENTIVE, jitter: 10, diet: 'balance', trace: 'balance', winRate: 0.75, runs: 'careful', coolAt: 45, anomaly: 'orderly' },
  'seek-unsteady': { checks: ATTENTIVE, jitter: 10, diet: 0.5, trace: 'mix', winRate: 0.7, runs: 'careful', hot: true, coolAt: 80, anomaly: 'risky' },
  'seek-unsteady-segfault': { checks: ATTENTIVE, jitter: 10, diet: 0.5, trace: 'mix', winRate: 0.7, runs: 'careful', hot: true, coolAt: 80, anomaly: 'risky', useSegfault: true },
  // 2.0 hidden-path hunters (the hidden teen needs 3 wins in every game and the tracks within 1 at the teen check, 17 hours in; the hidden
  // adult 4 each, 29 in all and the tracks within 1 at 51 hours). Like ghosthunter they balance packets and trace answers and play for
  // Sync; unlike it they also play whichever game they have won least (`balanceGames`) and answer requests only for games that are not
  // ahead. `shown`: they see only the HUD's floors of Standing (and alternate packets on a tie) instead of the true fractions.
  'hunter-exact': { checks: ATTENTIVE, jitter: 10, diet: 'balance', trace: 'balance', winRate: 0.75, gamer: true, coolAt: 45, balanceGames: true },
  'hunter-shown': { checks: ATTENTIVE, jitter: 10, diet: 'balance', trace: 'balance', winRate: 0.75, gamer: true, coolAt: 45, balanceGames: true, shown: true },
  // The same aim on a casual schedule and skill: how little play still reaches the hidden forms.
  'hunter-casual': { checks: [at(7, 30), at(10), at(13), at(16), at(19), at(22, 30)], jitter: 30, diet: 'balance', trace: 'balance', winRate: 0.6, gamer: true, coolAt: 45, balanceGames: true, shown: true },
  'hunter-shown-rotation': { checks: ATTENTIVE, jitter: 10, diet: 'balance', trace: 'balance', winRate: 0.75, gamer: true, coolAt: 45, shown: true },
  // The middle the sketch did not measure: a player who commits a little (half their plays in one game, packets and traces leaning corp).
  'nudge-breach': { checks: ATTENTIVE, jitter: 15, diet: 0.7, trace: 'comply', winRate: 0.7, runs: 'careful', focus: 'breach', focusShare: 0.5 },
  'steer-stub': { checks: ATTENTIVE, jitter: 15, diet: 0.5, trace: 'mix', winRate: 0.7, runs: 'careful', babyFaults: 3 },
  // Attentive, playing careful runs, but jacking in at every chance (eager: any time it is fairly healthy, not
  // only when it will be back soon) to reach The Deep's exit as an adult: the Mainframe gate's best case.
  'steer-mainframe': { checks: ATTENTIVE, jitter: 15, diet: 0.5, trace: 'mix', winRate: 0.7, runs: 'careful', eager: true },
};

// A human day: how many check-ins and when. perDay is the usual count (scaled 0.7 to 1.3 a day); a busyDay share of days has 1 or 2, an
// offDay share 0 or 1; dayCounts replaces all of it with a count per day of the life (bursty play). Times cluster in the morning, around
// midday and in the evening, at least 15 minutes apart.
export function humanDay(p, rng, day) {
  let n;
  if (p.dayCounts) n = Math.max(0, p.dayCounts[day % p.dayCounts.length] + Math.round((rng() * 2 - 1) * 1.5));
  else {
    const roll = rng();
    if (roll < (p.offDay ?? 0)) n = rng() < 0.5 ? 0 : 1;
    else if (roll < (p.offDay ?? 0) + (p.busyDay ?? 0)) n = 1 + Math.floor(rng() * 2);
    else n = Math.max(1, Math.round(p.perDay * (0.7 + rng() * 0.6)));
  }
  const times = [];
  for (let i = 0; i < n; i++) {
    const u = rng();
    const [lo, hi] = u < 0.25 ? [7 * 60, 9.5 * 60] : u < 0.5 ? [11.5 * 60, 14 * 60] : [16.5 * 60, 23.5 * 60];
    times.push(Math.round(lo + rng() * (hi - lo)));
  }
  times.sort((a, b) => a - b);
  const out = [];
  for (const t of times) if (!out.length || t - out.at(-1).c >= 15) out.push({ c: t, t });
  return out;
}

// Codex presets for CODEX=<name>: what every single life starts knowing.
export const CODEX_PRESETS = {
  deep: [...ROOT_FRAGMENT_IDS], // the original 22: everything Root Access needs, through The Deep
  ruins: FRAGMENTS.slice(0, FRAGMENTS.findIndex((f) => f.id === 'ruins-4') + 1).map((f) => f.id),
};

// Bots clear bugs at check-ins. An archetype's `fix` sets its policy, otherwise CLEAR does (default 'scrip'):
//   { mode: 'scrip' | 'standing' | 'both' | 'none',  at: bugs it tolerates before clearing (clears once it has this many; default 1),
//     split: how a Standing payment is taken, 'even' (1 from each track when both have one), 'leader' (2 from the larger track) or
//            'trailer' (2 from the smaller) }
// 'both' pays scrip first and Standing when it has none; 'standing' pays Standing even when it has scrip. A bot that cannot pay waits.
const clearMode = process.env.CLEAR ?? 'scrip';
function standingCorp(s, split) {
  const { corp, street } = s.standing;
  if (split === 'leader') return corp >= street ? 2 : 0;
  if (split === 'trailer') return corp >= street ? 0 : 2;
  return corp >= 1 && street >= 1 ? 1 : corp >= street ? 2 : 0;
}
export function fixBugs(s, p, ctx) {
  const f = p.fix ?? { mode: clearMode };
  if (f.mode === 'none' || p.noFix || s.bugs < (f.at ?? 1)) return;
  while (s.bugs > 0) {
    let paid = false;
    if (f.mode === 'scrip' || f.mode === 'both') {
      paid = clearBug(s, { pay: 'scrip' });
      if (paid) ctx.scripSpent = (ctx.scripSpent ?? 0) + BUG_CFG.clearScrip;
    }
    if (!paid && (f.mode === 'standing' || f.mode === 'both')) {
      paid = clearBug(s, { pay: 'standing', corp: standingCorp(s, f.split) });
      if (paid) ctx.standingSpent = (ctx.standingSpent ?? 0) + BUG_CFG.clearStanding;
    }
    if (!paid) break;
    ctx.bugsFixed = (ctx.bugsFixed ?? 0) + 1;
  }
}

const minWins = (s) => Math.min(...GAME_IDS.map((id) => s.games[id].won));
const leastWon = (s) => GAME_IDS.reduce((best, id) => (s.games[id].won < s.games[best].won ? id : best), GAME_IDS[0]);

export function checkIn(s, p, now, rng, ctx) {
  const doAct = (a, opts) => act(s, a, now, rng, opts);
  // Human-like noise (only for archetypes that set these; the others consume no extra rng): a lapse is a chore skipped this time, the
  // mood moves the mini-game win rate a little each check-in, and a favorite game is played more than the others.
  const lapse = () => Boolean(p.lapse) && rng() < p.lapse;
  const skill = () => (p.mood ? Math.min(0.95, Math.max(0.2, p.winRate + (rng() * 2 - 1) * p.mood)) : p.winRate);
  const useItem = (id) => {
    const slot = s.inventory.indexOf(id);
    if (slot < 0 || p.noItems) return false;
    return doAct('use', { slot }).ok;
  };
  ctx.checkIns = (ctx.checkIns ?? 0) + 1;
  ctx.bugPeak = Math.max(ctx.bugPeak ?? 0, s.bugs);
  fixBugs(s, p, ctx);
  if (s.inventory.length >= INVENTORY_SLOTS) ctx.fullChecks = (ctx.fullChecks ?? 0) + 1;
  // Only a player steering for a Stub keeps a Segfault (as a baby); everyone else scraps it.
  const wantsFaults = p.babyFaults && s.stage === 'baby' && s.careMistakes < p.babyFaults;
  for (let i = s.inventory.length - 1; i >= 0 && !wantsFaults && !p.useSegfault; i--) if (s.inventory[i] === 'segfault') doAct('discard', { slot: i });
  if (wantsFaults || (p.useSegfault && !s.asleep)) useItem('segfault');
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
  // A player who knows a long absence is coming (`prepare`, 4 hours or more to the next check) tops up Charge and Sync first.
  const topUp = Boolean(p.prepare) && ctx.gapToNext >= 240;
  const feed = () => {
    for (let i = 0; i < 4 && s.stats.charge < (topUp ? 94 : 85) && !blockReason(s, 'corp'); i++) {
      // `shown` bots see only the HUD's floors; on a shown tie they alternate packets (a lone tie rule would drift one way).
      const lean = leanSeen(s, p.shown);
      let corp = p.diet === 'balance' ? (p.shown && lean === 0 ? s.lastPacket !== 'corp' : lean <= 0) : rng() < p.diet;
      if (process.env.PREFBOT === 'follow' && PREF.on && s.lastPacket) {
        const lv = temperLevel(s);
        if (lv > 0) corp = s.lastPacket === 'corp';
        else if (lv < 0) corp = s.lastPacket !== 'corp';
      }
      doAct(corp ? 'corp' : 'scav');
    }
  };
  // A runner feeds before deciding to jack in, as a player would.
  if (p.runs && !p.noRuns && mayFeed && s.stats.charge <= 60) feed();
  // Netrun when healthy. Until the deepest open region is cleared it heads there (the way down);
  // after that, any open region.
  // Careful runners only jack in healthy, and only when they'll be back soon to patch things up.
  const careful = p.runs === 'careful' && !p.eager;
  const healthy = s.stats.integrity > (careful ? 80 : 60) && s.stats.charge > 60;
  const aroundAfter = !careful || ctx.gapToNext <= 120;
  if (p.runs && !p.noRuns && healthy && aroundAfter && (!p.runChance || rng() < p.runChance)) {
    const open = REGION_ORDER.filter((r) => !regionLock(r, s.stage, ctx.codex, s.cleared));
    const frontier = open.at(-1);
    const region = frontier && !s.cleared.includes(frontier) ? frontier : open[Math.floor(rng() * open.length)];
    if (region && !runBlockReason(s, region, ctx.codex)) {
      const lean = { hide: 'indie', comply: 'corp', balance: 'balance' }[p.trace] ?? 'mix';
      const flowAtJackIn = inFlow(s);
      const run = playRun(s, { ...RUN_STYLES[p.runs], winRate: p.winRate, lean, anomaly: p.anomaly, shop: p.shop, keep, shown: p.shown }, region, rng, ctx.codex);
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
      // Deep runs up to and including the first that reaches its exit.
      if (region === 'deep' && ctx.deepClearAt === null) {
        ctx.deepRuns++;
        if (run.result === 'disconnected') ctx.deepDisconnects++;
        if (s.cleared.includes('deep')) ctx.deepClearAt = s.ageMin;
      }
      // Harder feats the gate could ask for instead (FEATS), by the age each was first met.
      if (region === 'deep' && run.result === 'jacked' && run.map.nodes.find((n) => n.id === run.pos)?.type === 'exit') {
        ctx.deepExits.push({ age: s.ageMin, clean: (run.tally?.iceLost ?? 0) === 0, faults: s.careMistakes, flow: flowAtJackIn });
      }
      ctx.codex.push(...(s.codexInbox ?? []).filter((id) => !ctx.codex.includes(id)));
      s.codexInbox = [];
    }
  }
  if (s.event?.type === 'trace') {
    let choice = p.trace;
    if (choice === 'mix') choice = rng() < 0.5 ? 'hide' : 'comply';
    if (choice === 'balance') choice = leanSeen(s, p.shown) > 0 ? 'hide' : 'comply';
    if (!lapse()) doAct(choice);
  }
  if (s.event?.type === 'attack' && !lapse()) doAct('defend', { won: rng() < winChance(overclocked(s), skill()) });
  if (s.event?.type === 'overflow' && !lapse()) doAct('purge');
  if (s.virus && !lapse()) doAct('patch');
  if (s.cache > 0 && !(p.sloppy && s.cache < 3) && !lapse()) doAct('purge');
  const coolAt = p.coolAt ?? (p.hot ? 80 : 50);
  if (s.stats.heat > coolAt && !lapse()) doAct('cool');
  if (mayFeed && s.stats.charge < 30) feed();
  // Attention rewards: whoever is around answers a request, greets a visitor and reads the chatter.
  if (s.chatter) ctx.chatterSeen.add(s.chatter.id);
  if (s.visit && !s.visit.greeted && doAct('greet').ok) {
    ctx.greeted = (ctx.greeted ?? 0) + 1;
    ctx.chatterSeen.add(s.chatter.id);
  }
  if (s.request?.kind === 'cool' && doAct('cool').requestMet) ctx.requestsMet = (ctx.requestsMet ?? 0) + 1;
  if (s.request?.kind === 'game' && mayPlay && !blockReason(s, 'play') && (!p.balanceGames || s.games[s.request.game].won <= minWins(s) + 1) && (!p.focus || s.request.game === p.focus || rng() >= (p.focusShare ?? 1))) {
    if (doAct('play', { game: s.request.game, won: rng() < winChance(overclocked(s), skill()) }).requestMet) ctx.requestsMet = (ctx.requestsMet ?? 0) + 1;
  }
  const syncTarget = topUp ? 98 : p.gamer ? 90 : 80;
  for (let i = 0; mayPlay && i < 4 && s.stats.sync < syncTarget && s.stats.charge >= 20 && !blockReason(s, 'play'); i++) {
    let game = GAME_IDS[ctx.games++ % GAME_IDS.length];
    if (p.focus && rng() < (p.focusShare ?? 1)) game = p.focus;
    if (p.balanceGames) game = leastWon(s); // plays whichever game it has won least (ties: the first)
    if (p.favorite) {
      ctx.favorite ??= GAME_IDS[Math.floor(rng() * GAME_IDS.length)]; // a favorite per life, played `favorite` of the time, else any game
      game = rng() < p.favorite ? ctx.favorite : GAME_IDS[Math.floor(rng() * GAME_IDS.length)];
    }
    if (process.env.PREFBOT === 'follow' && PREF.on) {
      const lv = temperLevel(s);
      const last = s.lastGames ?? [];
      if (lv > 0 && last.length) game = last[0];
      else if (lv < 0 && last.length) game = GAME_IDS.filter((g) => !last.includes(g)).sort((x, y) => s.games[x].played - s.games[y].played)[0] ?? game;
    }
    doAct('play', { game, won: rng() < winChance(overclocked(s), skill()) });
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
  if (wantDark === s.lightsOn && !lapse()) doAct('lights');
}

// One life. fragment: the parent's (as flatline() leaves it), for a later generation. codex: the
// fragments already found, carried along a lineage.
// Standing, temper and the shown level at a stage change.
const snap = (s) => ({
  standing: { ...s.standing },
  gap: Math.abs(s.standing.corp - s.standing.street), // the true gap; the evolution rules use its whole part
  roleGap: (() => { const w = GAME_IDS.map((id) => s.games[id].won).sort((a, b) => b - a); return w[0] - w[1]; })(),
  temper: s.temper,
  level: s.tLevel,
  bugs: s.bugs,
  minWins: Math.min(...GAME_IDS.map((id) => s.games[id].won)),
  total: GAME_IDS.reduce((n, id) => n + s.games[id].won, 0),
});

export function simulate(p, seed, { rootAccess = Boolean(process.env.ROOT), fragment = null, generation = 1, codex = [] } = {}) {
  const rng = mulberry32(seed);
  const t0 = Date.UTC(2026, 0, 5, 8, 0);
  const s = createScript({ now: t0, rng, rootAccess, fragment, generation });
  const ctx = { bugMin: 0, ceilMin: 0, games: 0, lastOfDay: false, codex: [...codex], regionRuns: {}, chatterSeen: new Set(), deepClearAt: null, deepRuns: 0, deepDisconnects: 0, deepExits: [], firstFlowAt: null };
  const codexAtStart = ctx.codex.length;
  let minute = 0;
  let schedule = [];
  let teenAt = null;
  let adultAt = null;
  let mainframeStart = null; // only with the stage switched on (the default)
  let teenForm = null;
  const mistakeKinds = {};
  let prevFlags = { ...s.flagged };
  let segfaultAt = null; // the minute a Segfault first turned up
  let events = 0; // every timed event: traces, intrusions, overflows
  let traces = 0;
  let tracesIgnored = 0;
  let prevEvent = null;
  let gateAt = null; // the age at which it would have become a Mainframe (docs/SOURCE_PLAN.md)
  let featAt = null; // the age it met the gate's feat
  while (s.stage !== 'dead' && minute < lifeEnd(s) + 60) {
    const dayMin = (at(8) + minute) % DAY;
    if (dayMin === 0 || minute === 0) {
      schedule = p.perDay || p.dayCounts ? humanDay(p, rng, Math.floor((at(8) + minute) / DAY)) : p.checks.map((c) => ({ c, t: c + Math.round((rng() * 2 - 1) * p.jitter) }));
    }
    minute++;
    const integrityBefore = s.stats.integrity;
    tick(s, t0 + minute * MIN, rng);
    ctx.bugMin += s.bugs;
    if (s.bugs >= BUG_CFG.max) ctx.ceilMin++;
    for (const k of Object.keys(s.flagged)) {
      if (s.flagged[k] && !prevFlags[k]) {
        mistakeKinds[k] = (mistakeKinds[k] ?? 0) + 1;
      }
    }
    prevFlags = { ...s.flagged };
    if (featAt === null && mainframeFeat(s)) featAt = s.ageMin;
    // With the stage switched on (the default; CFG='{"mainframe":false}' turns it off), the netling recompiles the minute
    // the gate is met.
    if (gateAt === null && (mainframeDue(s) || s.stage === 'mainframe')) gateAt = s.ageMin;
    if (ctx.firstFlowAt === null && inFlow(s)) ctx.firstFlowAt = s.ageMin;
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
      ctx.atTeen = { ...snap(s), mistakes: s.careMistakes, wins: GAME_IDS.reduce((n, id) => n + s.games[id].won, 0), minWins: Math.min(...GAME_IDS.map((id) => s.games[id].won)) };
    }
    if (s.stage === 'mainframe' && mainframeStart === null) mainframeStart = minute;
    if (s.stage === 'adult' && adultAt === null) {
      adultAt = minute;
      ctx.atAdult = { ...snap(s), wins: GAME_IDS.reduce((n, id) => n + s.games[id].won, 0), mistakes: s.careMistakes };
    }
    const due = schedule.find((x) => x.t === (at(8) + minute) % DAY);
    if (due && s.stage !== 'dead') {
      const today = [...new Set(schedule.map((x) => x.c))].sort((a, b) => a - b);
      ctx.lastOfDay = due.c === today.at(-1);
      // Fixed schedules repeat daily; a human day does not, so the next day's first check is a guess (07:30).
      const sorted = p.perDay || p.dayCounts ? today : [...p.checks].sort((a, b) => a - b);
      const next = sorted.find((c) => c > due.c) ?? (p.perDay || p.dayCounts ? 24 * 60 + 7 * 60 + 30 : sorted[0] + 24 * 60);
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
    standing: { ...s.standing },
    temper: s.temper,
    level: s.tLevel,
    bugsEnd: s.bugs,
    bugPeak: Math.max(ctx.bugPeak ?? 0, s.bugs),
    bugsFixed: ctx.bugsFixed ?? 0,
    bugAvg: ctx.bugMin / Math.max(1, s.ageMin),
    bugCeilingShare: ctx.ceilMin / Math.max(1, s.ageMin),
    scripSpent: ctx.scripSpent ?? 0,
    standingSpent: ctx.standingSpent ?? 0,
    prefActions: s.prefActions ?? 0,
    prefMatches: s.prefMatches ?? 0,
    prefBonus: s.prefBonus ?? 0,
    levelMin: { ...(s.levelMin ?? {}) },
    hold: s.hold?.best ?? { '-2': 0, 2: 0 },
    neglect2Min: s.neglect2Min ?? 0,
    holdFirst: { ...(s.holdFirst ?? {}) },
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
      adult: adultAt === null ? 0 : ((mainframeStart ?? s.ageMin) - adultAt) / DAY,
      mainframe: mainframeStart === null ? 0 : (s.ageMin - mainframeStart) / DAY,
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
    requestsMet: ctx.requestsMet ?? 0,
    greeted: ctx.greeted ?? 0,
    flowHours: (s.flowTotalMin ?? 0) / 60,
    hotHours: (s.hotTotalMin ?? 0) / 60,
    chatterSeen: ctx.chatterSeen.size,
    // The planned Mainframe gate: when it would have been met (null: never), and the feat's history.
    gate: {
      at: gateAt, featAt, from: mainframeAt(s), end: mainframeEnd(s), deepClearAt: ctx.deepClearAt, deepRuns: ctx.deepRuns, deepDisconnects: ctx.deepDisconnects,
      // The age each alternative feat would have opened the gate (null: never, or it died first).
      feats: Object.fromEntries(Object.entries(FEATS).map(([k, feat]) => {
        const age = feat(ctx.deepExits, ctx);
        const opens = age === null ? null : Math.max(age, mainframeAt(s));
        return [k, opens !== null && opens <= s.ageMin ? opens : null];
      })),
    },
  };
}

// Alternative feats for the Mainframe gate, measured beside the chosen one (three Deep exits, or two clean). Each takes this
// life's Deep exits ({ age, clean, faults, flow: in flow at jack-in }) and the life ({ firstFlowAt }), and
// returns the age the feat was met, or null.
const nthExit = (n, ok = () => true) => (exits) => exits.filter(ok)[n - 1]?.age ?? null;
export const FEATS = {
  'one Deep exit': nthExit(1), // the first plan, found far too easy
  'two Deep exits': nthExit(2),
  'three Deep exits': nthExit(3),
  'a clean Deep exit': nthExit(1, (e) => e.clean),
  'a Deep exit with at most 2 faults': nthExit(1, (e) => e.faults <= 2),
  'two clean Deep exits': nthExit(2, (e) => e.clean),
  // Whichever comes first: three exits, or two clean ones.
  'three Deep exits or two clean': (exits) => {
    const ages = [nthExit(3)(exits), nthExit(2, (e) => e.clean)(exits)].filter((x) => x !== null);
    return ages.length ? Math.min(...ages) : null;
  },
  // Two exits, and it was in flow at some point this life (by then).
  'two Deep exits and flow once': (exits, life) => {
    const second = nthExit(2)(exits);
    return second === null || life.firstFlowAt === null ? null : Math.max(second, life.firstFlowAt);
  },
  // Two exits, at least one of them from a run it jacked into while in flow.
  'two Deep exits, one jacked into in flow': (exits) => {
    const k = exits.findIndex((e, i) => i >= 1 && exits.slice(0, i + 1).some((x) => x.flow));
    return k < 0 ? null : exits[k].age;
  },
};

// The Mainframe gate across lives. Ages and time left are in hours; null where no life met it.
function gateStats(results) {
  const n = results.length;
  const met = results.filter((r) => r.gate.at !== null);
  const cleared = results.filter((r) => r.gate.deepClearAt !== null);
  const feat = results.filter((r) => r.gate.featAt !== null);
  const at = met.map((r) => r.gate.at).sort((a, b) => a - b);
  const left = met.map((r) => r.gate.end - r.gate.at).sort((a, b) => a - b);
  const pick = (xs, q) => (xs.length ? round(xs[Math.min(xs.length - 1, Math.floor(xs.length * q))] / 60, 1) : null);
  return {
    deepCleared: round(cleared.length / n),
    met: round(met.length / n),
    // Met the feat (three Deep exits, or two clean), and died before the age half came.
    feat: round(feat.length / n),
    featThenDied: round((feat.length - met.length) / n),
    medianHours: pick(at, 0.5),
    p10Hours: pick(at, 0.1),
    // Hours it would have as a Mainframe (to the end of its extended life): the median, and the shortest tenth.
    leftMedianHours: pick(left, 0.5),
    leftP10Hours: pick(left, 0.1),
    // Of the lives that met it, the share that waited on the feat (cleared The Deep after the age half).
    lateFeat: met.length ? round(met.filter((r) => r.gate.featAt > r.gate.from).length / met.length) : null,
    // Deep runs up to the first clear, and the disconnects among them, for the lives that cleared it.
    deepRunsToClear: cleared.length ? round(avg(cleared.map((r) => r.gate.deepRuns)), 2) : null,
    deepDisconnectsToClear: cleared.length ? round(avg(cleared.map((r) => r.gate.deepDisconnects)), 2) : null,
    // The alternatives: the share of lives that would meet each, and the median hours it would leave.
    feats: Object.fromEntries(Object.keys(FEATS).map((k) => {
      const ok = results.filter((r) => r.gate.feats[k] !== null);
      return [k, { met: round(ok.length / n), leftMedianHours: pick(ok.map((r) => r.gate.end - r.gate.feats[k]).sort((a, b) => a - b), 0.5) }];
    })),
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

const LEVELS = [-2, -1, 0, 1, 2];
const levelShares = (xs) => Object.fromEntries(LEVELS.map((l) => [l, round(xs.filter((x) => x === l).length / Math.max(1, xs.length))]));

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
    stageDays: Object.fromEntries(['baby', 'teen', 'adult', 'mainframe'].map((k) => [k, round(avg(results.map((r) => r.stageDays[k])), 2)])),
    // 2.0: Standing tracks, temper and the shown level at the end of the life (or death).
    standing: { corp: round(avg(results.map((r) => r.standing.corp)), 2), street: round(avg(results.map((r) => r.standing.street)), 2) },
    temper: round(avg(results.map((r) => r.temper)), 2),
    levelAtEnd: levelShares(results.map((r) => r.level)),
    // Awake time at each shown level, as a share of awake time (averaged over lives).
    levelTime: Object.fromEntries(LEVELS.map((l) => [l, round(avg(results.map((r) => { const t = Object.values(r.levelMin).reduce((a, b) => a + b, 0); return t ? (r.levelMin[l] ?? 0) / t : 0; })))])),
    // The Metronome unlock test: an unbroken awake hold of 12 hours at a strong level, neglect level 2 not counted (paused).
    hold12h: { strongSteady: rate((r) => r.hold['2'] >= 720), strongUnsteady: rate((r) => r.hold['-2'] >= 720) },
    // The same, in a day count: the median age (in days) at which the first 12 hour hold was reached, among the lives that reached one,
    // and the share that held 24 hours.
    holdDay: Object.fromEntries([['strongSteady', 2], ['strongUnsteady', -2]].map(([k, l]) => {
      const ds = results.filter((r) => r.holdFirst[l] !== undefined).map((r) => r.holdFirst[l] / DAY).sort((a, b) => a - b);
      return [k, ds.length ? round(ds[Math.floor(ds.length / 2)], 1) : null];
    })),
    hold24h: { strongSteady: rate((r) => r.hold['2'] >= 1440), strongUnsteady: rate((r) => r.hold['-2'] >= 1440) },
    neglect2Hours: round(avg(results.map((r) => r.neglect2Min / 60)), 2),
    bugs: { end: round(avg(results.map((r) => r.bugsEnd)), 2), peak: round(avg(results.map((r) => r.bugPeak)), 2), fixed: round(avg(results.map((r) => r.bugsFixed)), 2), atCeiling: rate((r) => r.bugPeak >= BUG_CFG.max), avg: round(avg(results.map((r) => r.bugAvg)), 2), ceilingTime: round(avg(results.map((r) => r.bugCeilingShare))), scripSpent: round(avg(results.map((r) => r.scripSpent)), 1), standingSpent: round(avg(results.map((r) => r.standingSpent)), 1) },
    pref: { actions: round(avg(results.map((r) => r.prefActions)), 1), matches: round(avg(results.map((r) => r.prefMatches)), 1), bonus: round(avg(results.map((r) => r.prefBonus)), 1) },
    atAdult: adults.length
      ? {
          corp: round(avg(adults.map((x) => x.standing.corp)), 2),
          street: round(avg(adults.map((x) => x.standing.street)), 2),
          gap: round(avg(adults.map((x) => x.gap)), 2),
          leanCertain: round(adults.filter((x) => x.gap >= 5).length / adults.length),
          roleCertain: round(adults.filter((x) => x.roleGap >= 5).length / adults.length),
          temper: round(avg(adults.map((x) => x.temper)), 2),
          level: levelShares(adults.map((x) => x.level)),
          bugs: round(avg(adults.map((x) => x.bugs)), 2),
          wins: round(avg(adults.map((x) => x.wins)), 2),
          mistakes: round(avg(adults.map((x) => x.mistakes)), 2),
        }
      : null,
    atTeen: teens.length
      ? {
          corp: round(avg(teens.map((x) => x.standing.corp)), 2),
          street: round(avg(teens.map((x) => x.standing.street)), 2),
          gap: round(avg(teens.map((x) => x.gap)), 2),
          leanCertain: round(teens.filter((x) => x.gap >= 5).length / teens.length),
          tied: round(teens.filter((x) => x.gap < 2).length / teens.length),
          temper: round(avg(teens.map((x) => x.temper)), 2),
          level: levelShares(teens.map((x) => x.level)),
          mistakes: round(avg(teens.map((x) => x.mistakes)), 2),
          wins: round(avg(teens.map((x) => x.wins)), 2),
          minWins: round(avg(teens.map((x) => x.minWins)), 2),
        }
      : null,
    wins: round(avg(results.map((r) => r.wins)), 2),
    events: round(avg(results.map((r) => r.events)), 2),
    traces: round(avg(results.map((r) => r.traces)), 2),
    tracesIgnored: round(avg(results.map((r) => r.tracesIgnored)), 2),
    // Attention rewards, a life: requests answered, visitors greeted, hours in flow, chatter lines seen.
    attention: {
      requestsMet: round(avg(results.map((r) => r.requestsMet)), 2),
      greeted: round(avg(results.map((r) => r.greeted)), 2),
      flowHours: round(avg(results.map((r) => r.flowHours)), 2),
      hotHours: round(avg(results.map((r) => r.hotHours)), 2),
      chatterSeen: round(avg(results.map((r) => r.chatterSeen)), 2),
    },
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
    mainframe: gateStats(results),
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
    if (codexLife === null && ROOT_FRAGMENT_IDS.every((id) => codex.includes(id))) codexLife = gen;
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
  printGate(st.mainframe);
  if (!detail) return;
  const a = st.atAdult;
  console.log(`  mistakes/run: ${Object.entries(st.mistakeKinds).map(([k, v]) => `${k} ${v.toFixed(1)}`).join(', ')}`);
  console.log(`  days as: baby ${st.stageDays.baby.toFixed(1)}, teen ${st.stageDays.teen.toFixed(1)}, adult ${st.stageDays.adult.toFixed(1)}${st.stageDays.mainframe ? `, mainframe ${st.stageDays.mainframe.toFixed(1)}` : ''}`);
  const t = st.atTeen;
  const lv = (m) => LEVELS.map((l) => Math.round(m[l] * 100)).join('/');
  console.log(`  standing at the end: corp ${st.standing.corp.toFixed(1)}, street ${st.standing.street.toFixed(1)} · temper ${st.temper.toFixed(1)} · level at the end (strongly unsteady/unsteady/middle/steady/strongly steady, %): ${lv(st.levelAtEnd)} · awake time at each: ${lv(st.levelTime)}`);
  if (t) console.log(`  at teen: corp ${t.corp.toFixed(1)}, street ${t.street.toFixed(1)}, gap ${t.gap.toFixed(1)} (certain ${pct(t.leanCertain)}, tied ${pct(t.tied)}), temper ${t.temper.toFixed(1)}, levels ${lv(t.level)}, mistakes ${t.mistakes.toFixed(1)}, wins ${t.wins.toFixed(1)} (fewest in a game ${t.minWins.toFixed(1)})`);
  if (a) console.log(`  at adult: corp ${a.corp.toFixed(1)}, street ${a.street.toFixed(1)}, gap ${a.gap.toFixed(1)} (lean certain ${pct(a.leanCertain)}, role certain ${pct(a.roleCertain)}), temper ${a.temper.toFixed(1)}, levels ${lv(a.level)}, bugs ${a.bugs.toFixed(1)}, wins ${a.wins.toFixed(1)}, mistakes ${a.mistakes.toFixed(1)} · events ${st.events.toFixed(1)}, traces ${st.traces.toFixed(1)} (${st.tracesIgnored.toFixed(1)} ignored)`);
  console.log(`  bugs: ${st.bugs.end.toFixed(2)} at the end (${st.bugs.avg.toFixed(2)} on average), peak ${st.bugs.peak.toFixed(2)}, ${st.bugs.fixed.toFixed(1)} cleared (${st.bugs.scripSpent.toFixed(0)} scrip, ${st.bugs.standingSpent.toFixed(0)} Standing), reached the ceiling ${pct(st.bugs.atCeiling)} (${pct(st.bugs.ceilingTime)} of the time) · care preference: ${st.pref.actions.toFixed(0)} actions, ${st.pref.matches.toFixed(0)} matched, +${st.pref.bonus.toFixed(0)} Sync · held 12h (neglect 2 paused): strongly steady ${pct(st.hold12h.strongSteady)}, strongly unsteady ${pct(st.hold12h.strongUnsteady)} (median day ${st.holdDay.strongSteady ?? "-"} / ${st.holdDay.strongUnsteady ?? "-"}), 24h: ${pct(st.hold24h.strongSteady)} / ${pct(st.hold24h.strongUnsteady)} · awake at neglect 2: ${st.neglect2Hours.toFixed(1)}h`);
  const at = st.attention;
  console.log(`  attention: ${at.requestsMet.toFixed(1)} requests answered, ${at.greeted.toFixed(1)} visitors greeted, ${at.flowHours.toFixed(1)}h in flow, ${at.hotHours.toFixed(1)}h overclocked, ${at.chatterSeen.toFixed(1)} chatter lines seen`);
  console.log(`  segfault found before the teen stage: ${pct(st.segfaultBeforeTeen)}`);
  console.log(`  netrun: ${st.netruns.runs.toFixed(1)} runs (${st.netruns.disconnects.toFixed(1)} disconnects), ${st.netruns.fragments.toFixed(1)} fragments, codex cap reached ${pct(st.netruns.codexCapped)}`);
  console.log(`  cleared: ${list(st.netruns.cleared)} · runs by region: ${Object.entries(st.netruns.byRegion).map(([k, v]) => `${k} ${v.toFixed(1)}`).join(', ')}`);
  console.log(`  scrip: ${st.scrip.end.toFixed(0)} at the end (peak ${st.scrip.peak.toFixed(0)}), ${st.scrip.bought.toFixed(1)} bought, ${st.scrip.sold.toFixed(1)} sold, could afford an item at ${pct(st.scrip.affordable)} of markets (${st.scrip.marketsPerRun.toFixed(2)} a run) · inventory full at ${pct(st.fullAtCheckIn)} of check-ins`);
}

const hours = (h) => (h === null ? '-' : `${h}h`);
function printGate(g) {
  if (!g.deepCleared) return;
  console.log(`  mainframe gate: met ${pct(g.met)} (cleared The Deep ${pct(g.deepCleared)}, met the feat ${pct(g.feat)}, ${pct(g.featThenDied)} of them died before the age half) · met at ${hours(g.medianHours)} (earliest tenth ${hours(g.p10Hours)}) · time as a mainframe ${hours(g.leftMedianHours)} (shortest tenth ${hours(g.leftP10Hours)}) · waited on the feat ${g.lateFeat === null ? '-' : pct(g.lateFeat)} · Deep runs to the first clear ${g.deepRunsToClear} (${g.deepDisconnectsToClear} disconnects)`);
  console.log(`  harder feats: ${Object.entries(g.feats).map(([k, f]) => `${k} ${pct(f.met)} (${hours(f.leftMedianHours)} left)`).join(', ')}`);
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
  const preset = process.env.CODEX ? CODEX_PRESETS[process.env.CODEX] : null;
  if (process.env.CODEX && !preset) throw new Error(`CODEX must be one of: ${Object.keys(CODEX_PRESETS).join(', ')}`);
  if (preset && process.env.LIVES) throw new Error('CODEX is for single lives; LIVES carries the codex itself');
  // A complete codex means Root Access in the game, so the preset brings it along.
  const presetRoot = preset ? ROOT_FRAGMENT_IDS.every((id) => preset.includes(id)) || Boolean(process.env.ROOT) : undefined;
  const parent = process.env.TRAIT ? parentOf(process.env.TRAIT, { level: Number(process.env.TRAIT_LEVEL ?? 1), history: process.env.HISTORY ?? null }) : null;
  const lives = Number(process.env.LIVES ?? 0);
  const report = { runs, trait: process.env.TRAIT ?? null, lives: lives || null, codex: process.env.CODEX ?? null, cfg: process.env.CFG ? JSON.parse(process.env.CFG) : null, archetypes: {} };
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
    const st = stats(Array.from({ length: runs }, (_, i) => simulate(p, i + 1, { fragment: parent, generation: parent ? 2 : 1, ...(preset && { codex: preset, rootAccess: presetRoot }) })));
    report.archetypes[name] = st;
    if (process.env.JSON) continue;
    console.log(`\n== ${name} (${runs} runs${parent ? `, child of a ${process.env.TRAIT}` : ''}${preset ? `, codex ${process.env.CODEX}` : ''})`);
    printLife(st, process.env.DETAIL);
  }
  if (process.env.JSON) console.log(JSON.stringify(report, null, 2));
}
