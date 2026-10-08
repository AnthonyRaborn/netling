// Netling 2.0 netrun rules that are decided in docs/NETLING_2_NETRUN_DRAFTS.md, as switchable settings for the simulator fork.
// Everything is OFF by default so the tables in docs/netling2-prototypes/README.md stay reproducible (no 2.0 form had a run
// ability in them). Switch on with NR2='{"abilities":true,"tiers":true,...}' or NR2=all. Pure: imports nothing.
//
// What is DECIDED (maintainer) and what is MINE (starting values to measure) is marked on each block. Nothing here is tuned.

export const NR2 = {
  // One ability per role and lean at two levels: the adult is level 1, the elder level 2 (a mainframe-stage body in this fork).
  abilities: false,
  // A second, harder tier of ICE mixed in by region depth (speed for Dodge, Tune and Feast; a 4-in-5 variant for Breach).
  tiers: false,
  // Light extra costs of each egg's own problem during a run (decided as a direction; the sizes below are mine).
  eggCost: false,
  // A held pressure state resumes after a jack-out (decided), with a window before the bars can end it (decided: 5 minutes).
  // An error-out also gets the window in the design; the fork has no error-out, so only a jack-out does.
  graceMin: 5,
  // The egg-flavored anomalies (decided as a go; options and numbers are mine): netrun/egg-anomalies.js. Not part of NR2=all yet.
  eggAnomalies: false,
  eggAnomaly: {
    unwind: { charge: 25, overflowAt: 95, tear: 10 }, // Program: surge, then a tear if the buffer is over this
    catch: { charge: 8, repair: 10 },
    flash: { charge: 12, cool: 20, wear: 30 }, // Iron
    pry: { heat: 10, loot: 0.6 },
    graft: { sync: 20, reject: 0.3, rejectDamage: 4 }, // Wetware
    sample: { sync: 6, loot: 0.5 },
  },
  // Inventory (decided, maintainer): items of a kind stack in a slot, and at the end of a run the player chooses what to keep. The stack size and the
  // ranking a bot uses are mine. NR2=all switches it on.
  inventory: false,
  inv: { stack: 3 },
  // The forced filled cache (Feast corp, elder level): one a run, in the layer after the one before halfway (decided: set interval,
  // about one a run, may displace any node but, decided later, never the relay: `relaySafe` is true).
  forcedCache: { perRun: 1, relaySafe: true, every: 3 }, // every: with perRun above 1, a further cache this many layers on

  // ---- ICE tiers (decided: by region depth, speed as the lever, Breach 4-in-5, no extra pay, avoidance weaker against tier 2) ----
  tier: {
    // Share of ICE that is tier 2, by region. MINE, placeholders: the shares are a tuning output (netrun-sweep.mjs, CASES).
    share: { public: 0.05, bazaar: 0.1, corp: 0.2, ruins: 0.3, deep: 0.5, source: 0.6, daily: 0.2, tutorial: 0 },
    speed: 1.25, // MINE: the game speed multiplier for tier 2 (Dodge, Tune, Feast; also applies to Breach's timer unless refunded)
    // ASSUMPTION, not a measurement: how much a player's win chance falls against tier 2. The bots have one skill number, not per-game
    // skill, so the cost of speed is a flat drop per 0.1 of extra speed, and Breach's longer target a flat drop of its own.
    winPerSpeed: 0.04,
    breachPenalty: 0.1, // Breach 4-in-5: the win chance drops this much
    breachRefund: 0, // the maintainer's possible timer refund for the longer target: win chance given back (to test)
    avoid: { 1: 0.5, 2: 0.75 }, // avoidance works this share as often against tier 2, adult (level 1) and elder (level 2)
    scale: 1, // multiplies every share (a sweep knob)
    damageMult: 1, // harder ICE does not pay more and (not decided) bites the same
  },

  // ---- Abilities: starting values taken from 1.0's constants (docs/NETRUN.md), by level (1 adult, 2 elder). MINE. ----
  ab: {
    insurance: { 1: { times: 1, to: 12 }, 2: { times: 2, to: 12 } }, // breachCorp (last stand)
    relayPatch: { breachCorp: { 1: 0, 2: 20 }, tuneCorp: { 1: 0, 2: 20 } }, // relays also repair this much
    hardened: { 1: { dmg: 0.7, soft: 0 }, 2: { dmg: 0.65, soft: 1 } }, // breachStreet: ICE damage share; soft: first loss deals softMult of it (tuned down from 0.5 to the parity yardstick)
    softMult: 0.3,
    phase: { 1: { free: 1, later: 0.15 }, 2: { free: 1, later: 0.3 } }, // dodgeCorp: ICE slipped for certain, then the chance (tuned down from 0.35 and two free to the parity yardstick)
    unseen: { 1: 0.45, 2: 0.5 }, // dodgeStreet: chance an ICE never notices it (Ghost's 45% and Whisper's 50%)
    hiddenUnseen: { 1: 0.3, 2: 0.55 }, // the hidden forms: trimmed from Ghost's and Whisper's numbers to the parity yardstick (the elder above Whisper's 50% to keep it ahead)
    checkpoint: { dodgeCorp: { 1: false, 2: true }, dodgeStreet: { 1: false, 2: true }, hidden: { 1: true, 2: true } },
    sight: { tuneCorp: { 1: 2, 2: 3 } }, // steps of node types ahead; hidden sees the whole map
    upkeep: { tuneStreet: { 1: 0, 2: 6 } }, // Integrity restored per move
    concession: { 1: { exchangePrice: 11, scrip: 3, exitItems: 1, winHeal: 11 }, 2: { exchangePrice: 11, scrip: 4, exitItems: 1, winHeal: 18 } }, // feastCorp: cheaper exchange, loose scrip on top, a company-store item at the exit (exitItems: tuned in, a proposal; scrip alone was too weak a part)
    scavenge: { 1: { cache: 0.55, iceWin: 0.35, winHeal: 11 }, 2: { cache: 0.7, iceWin: 0.5, winHeal: 22 } }, // feastStreet: tuned to the parity yardstick; winHeal is a small sustain (Integrity restored by a won ICE), decided as fitting the theme
    forcedCacheForms: ['feastCorp'], // level 2 only
  },

  // ---- Egg run problems as light extra costs (decided: light to start; the sizes are mine) ----
  cost: {
    ironMinutesPerMove: 1, // Iron: minutes of wear accrual a move is worth, at Heat over the wear line (the run itself takes no simulated time)
    programLostFightBleed: 4, // Program: a lost fight at Charge 80+ costs this much more Integrity
    wetwareLostFightInfect: 0.04, // Wetware: a lost fight rolls an infection at this chance
  },
};

if (process.env.NR2) {
  const v = process.env.NR2 === 'all' ? { abilities: true, tiers: true, eggCost: true, inventory: true } : JSON.parse(process.env.NR2);
  for (const [k, val] of Object.entries(v)) {
    if (typeof val === 'object' && val && !Array.isArray(val) && typeof NR2[k] === 'object') Object.assign(NR2[k], val);
    else NR2[k] = val;
  }
}

export const levelOf = (pet) => (pet.stage === 'mainframe' ? 2 : 1);

// Chance a tier-2 roll is made for a fight in this region.
export const tierShare = (region) => (NR2.tiers ? Math.min(1, (NR2.tier.share[region] ?? 0) * (NR2.tier.scale ?? 1)) : 0);

// The win chance a bot gives up against a tier-2 fight of this game. Assumed, see NR2.tier.
export function tierPenalty(pending) {
  if (!NR2.tiers || pending?.tier !== 2) return 0;
  if (pending.game === 'breach') return Math.max(0, NR2.tier.breachPenalty - NR2.tier.breachRefund);
  return Math.max(0, (NR2.tier.speed - 1) * 10 * NR2.tier.winPerSpeed);
}

// How often an avoidance ability works against this fight, as a share of its normal chance.
export const avoidMult = (tier, level) => (NR2.tiers && tier === 2 ? NR2.tier.avoid[level] ?? 1 : 1);
