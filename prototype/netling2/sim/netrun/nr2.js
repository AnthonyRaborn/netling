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
  // Foresight (Tune street, docs/NETLING_2_NETRUN_DRAFTS.md section 3.3): what the netling sees INSIDE the nodes it can see. `fate` pre-rolls what is in
  // a node (an ICE's game and tier, whether a cache is filled) from a per-run seed, so it can be known before arrival and does not depend on the route
  // (the daily trace already works this way). Off by default; `fate` alone changes only which random numbers decide those rolls. `foresight.on` lets a
  // Tune street netling read the nodes within `depth` steps (by level: adult 1 = the next step, elder 2), the `fields` it is allowed (game, tier, cache).
  // The bots need per-game skill to use it (netrun-bot.mjs, style.spread). Starting values are mine.
  fate: false,
  foresight: { on: false, depth: { 1: 1, 2: 2 }, fields: { 1: ['game'], 2: ['game'] } }, // measured (notes section 12): the ICE's game is the whole value; the tier and a filled cache add 0 to 5%
  // Blackout ("you only see one step ahead", no form sight) and the Tune forms, whose abilities are sight: how much of each survives the challenge.
  // 0 is dark (the first reading: nothing survives, so the Tune forms sit at the level of a netling with no ability). Tune corp: extra steps of node types
  // beyond the one Blackout shows (1 = two steps in all). Tune street: the Foresight depth cap (1 = it reads the next step's ICE game, at both levels).
  // Decided direction (maintainer: a limited variant to help the Tune forms): both at 1, measured in notes section 13. The hidden forms' sight stays dark.
  blackout: { tuneCorp: 1, tuneStreet: 1 },
  // The egg-flavored anomalies (decided as a go; options and numbers are mine): netrun/egg-anomalies.js. Not part of NR2=all yet.
  eggAnomalies: false,
  // Egg pages as real drops (decided rates and rules: sketch, Codex; codex2.js EGG_PAGES). One roll a run on the way out (decided: at the exit node
  // or a relay jack-out; a plain jack-out, a disconnect or an abort rolls nothing): `role` in a cleared non-Deep region (public, bazaar, corp, ruins),
  // `hidden` on a Deep run; the egg's Source page at a Source exit. Off by default (it draws a random number a run, which would
  // shift every table); lineage-sweep.mjs switches it on. Not part of NR2=all.
  eggPages: { on: false, role: 0.2, hidden: 0.5 },
  eggAnomaly: {
    run: { charge: 25, overflowAt: 95, tear: 10, loot: 0.5 }, // Program: surge and maybe an item, then a tear if the buffer ends over the line
    kill: { charge: 8, repair: 10 },
    flash: { charge: 12, cool: 20, wear: 30 }, // Iron
    pry: { heat: 10, loot: 0.6, charge: 8 }, // salvage: a little power as well as the part
    graft: { sync: 20, reject: 0.3, rejectDamage: 4 }, // Wetware
    sample: { sync: 6, loot: 0.5 },
  },
  // Inventory (decided, maintainer): items of a kind stack in a slot, and at the end of a run the player chooses what to keep. The stack size and the
  // ranking a bot uses are mine. NR2=all switches it on.
  inventory: false,
  inv: { stack: 3 },
  // Wider Deep and Source maps (decided, maintainer: those two regions only; Deep [3,4] at a second-link chance of 0.65, Source [3,5] at 0.75; measured
  // in baseline/README.md). `region` maps a region id to { width: [lo, hi] nodes a layer, link2: chance of a second link }; src/netrun/regions.js has
  // [2, 3] and 0.5. Fork only (netrun/map2.js). On in NR2=all; the tier share along the run (tier.layer) was tried and declined.
  map: { on: false, region: { deep: { width: [3, 4], link2: 0.65 }, source: { width: [3, 5], link2: 0.75 } } },
  // The forced filled cache (Feast corp, elder level): one a run, in the layer after the one before halfway (decided: set interval,
  // about one a run, may displace any node but, decided later, never the relay: `relaySafe` is true).
  forcedCache: { perRun: 1, relaySafe: true, every: 3 }, // every: with perRun above 1, a further cache this many layers on

  // ---- ICE tiers (decided: by region depth, speed as the lever, Breach 4-in-5, no extra pay, avoidance weaker against tier 2) ----
  tier: {
    // Share of ICE that is tier 2, by region. MINE, placeholders: the shares are a tuning output (netrun-sweep.mjs, CASES).
    share: { public: 0.05, bazaar: 0.1, corp: 0.2, ruins: 0.3, deep: 0.5, source: 0.6, daily: 0.2, tutorial: 0 },
    // Tier 2 rising along the run (proposal): with layer.on, the share at a node is the region's share times (1 - g + 2 g f), f being the node's
    // place from the entry (0) to the exit (1), so a run gets harder as it descends and the region's mean share stays (before the cap at 1).
    layer: { on: false, g: 0.8 }, // tried and declined by the maintainer (baseline/README.md); kept as a switch
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
    darkUpkeep: { tuneCorp: { 1: 0, 2: 0 } }, // under Unplugged only: Integrity per move for a form whose relay patch is dark (0 = off; sizes tried in notes section 13)
    upkeep: { tuneStreet: { 1: 0, 2: 3 } }, // Integrity restored per move (the street elder's second part; 6 until Foresight was measured, decided 3 with Foresight at depth 2: notes section 12)
    concession: { 1: { exchangePrice: 11, scrip: 3, exitItems: 1, winHeal: 11 }, 2: { exchangePrice: 11, scrip: 4, exitItems: 1, winHeal: 18 } }, // feastCorp: cheaper exchange, loose scrip on top, a company-store item at the exit (exitItems: tuned in, a proposal; scrip alone was too weak a part)
    scavenge: { 1: { cache: 0.55, iceWin: 0.35, winHeal: 11 }, 2: { cache: 0.7, iceWin: 0.5, winHeal: 22 } }, // feastStreet: tuned to the parity yardstick; winHeal is a small sustain (Integrity restored by a won ICE), decided as fitting the theme
    forcedCacheForms: ['feastCorp'], // level 2 only
  },
  // Rogue (sim.js ROGUE), simulator stage 1: each Rogue adult and elder runs on its role's base ability from docs/NETLING_2_ROGUE_DRAFTS.md, 9.2
  // (Mole Hardened, Skip Unseen, Spook Lookahead, Drop Scavenge) at the NL-0 numbers, plus the checkpoint part (run.js). A stand-in: the hunt twists,
  // Skip's trimmed slip, danger sense, the trail and the hunters come with stage 2.
  rogueBase: { rogueAdultBreach: 'breachStreet', rogueAdultDodge: 'dodgeStreet', rogueAdultTune: 'tuneCorp', rogueAdultFeast: 'feastStreet' },
  // Rogue, simulator stage 2 (docs/NETLING_2_ROGUE_DRAFTS.md 4.2, 6.2, 9.1, 9.2): the trail, the trail hunter, ambush nodes, danger sense and the
  // hunt twists, for a Rogue netling (sim.js isRogue) only. On by default (Rogue itself is off unless ROGUE is set); NR2='{"rogue":{"on":false}}'
  // gives stage 1's runs back. Every number is the draft's starting value. The count is `run.hunt` in code (1.0's daily already has `run.trail`).
  rogue: {
    on: true,
    threshold: { public: 10, bazaar: 10, corp: 9, ruins: 9, deep: 10, source: 12 }, // regions not listed (tutorial, daily) have no hunt
    trail: { move: 1, iceLost: 2, anomaly: 1, purchase: 1 }, // a won ICE adds nothing; the checkpoint HIDE never happens (checkpoints never notice Rogue)
    hunterTier: 2, // the tier its fight is played at (2: the tier-2 speed, so a lower win chance)
    hunterMult: 1.5, // the hunter (trail or ambush) is tier-2 ICE at this much of the region's ICE damage; no ICE slip works on it
    ambush: { corp: 1 / 6, ruins: 1 / 6, deep: 0.25, source: 0.25 }, // the share of a region's ICE nodes that are ambushes (none elsewhere)
    ambushMark: true, // a lost ambush gives a mark (and a disconnect); false: the disconnect only (a lever for stage 2's tuning)
    dangerSense: true, // every node shows as danger (ICE, ambush) or quiet from the start of a run; dark under Blackout
    // The kits by role and level (9.2). Mole fights hunters as plain tier-2 ICE at its damage share; Sleeper turns one lost hunter fight a run into an
    // ordinary lost fight. Skip's slip is trimmed, its moves add trail every second move; Exile slips ambushes (tier-2 avoidance). Spook tells an
    // ambush from ICE one step beyond its sight; Handler's agent sheds trail once a run. Drop leaves one item at a relay for less trail; Stash keeps it.
    kit: {
      breach: { 1: { dmg: 0.7 }, 2: { dmg: 0.65, hunterSaves: 1 } },
      dodge: { 1: { unseen: 0.3, moveEvery: 2 }, 2: { unseen: 0.5, moveEvery: 2, ambushSlip: true } },
      tune: { 1: { sight: 2, ambushSight: 3 }, 2: { sight: 3, ambushSight: 4, agent: 4 } },
      feast: { 1: { deadDrop: 3 }, 2: { deadDrop: 3, keepDropped: true } },
    },
    // Rogue's own map rules (9.7, netrun/rogue-map.js), the draft's starting values: no extra relays half the time, half the Corp Grid's checkpoints
    // are ICE, one cordon in the Deep and two in the Source, half of all caches and markets guarded, and 1.0's narrow maps in the Deep and the Source.
    map: { on: true, relayFactor: 0.5, toIce: { corp: 0.5 }, cordons: { deep: [0], source: [0, 0.667] }, guardShare: 0.5, narrow: ['deep', 'source'] },
  },

  // ---- Egg run problems as light extra costs (decided: light to start; the sizes are mine) ----
  cost: {
    ironMinutesPerMove: 2.5, // Iron: minutes of wear accrual a move is worth, at Heat over the wear line (the run itself takes no simulated time). Sized by notes/netrun-sim-notes.md, section 11 (was 1)
    programLostFightBleed: 4, // Program: a lost fight at Charge 80+ costs this much more Integrity
    wetwareLostFightInfect: 0.04, // Wetware: a lost fight rolls an infection at this chance
  },
};

if (process.env.NR2) {
  const v = process.env.NR2 === 'all' ? { abilities: true, tiers: true, eggCost: true, inventory: true, fate: true, foresight: { on: true }, map: { on: true } } : JSON.parse(process.env.NR2);
  for (const [k, val] of Object.entries(v)) {
    if (typeof val === 'object' && val && !Array.isArray(val) && typeof NR2[k] === 'object') Object.assign(NR2[k], val);
    else NR2[k] = val;
  }
}

// ROGUE_RUN='{"threshold":{"deep":15},"map":{"on":false}}' overrides NR2.rogue (objects merge one level down), for the stage 2 sweeps.
if (process.env.ROGUE_RUN) {
  for (const [k, v] of Object.entries(JSON.parse(process.env.ROGUE_RUN))) {
    if (v && typeof v === 'object' && !Array.isArray(v) && typeof NR2.rogue[k] === 'object') Object.assign(NR2.rogue[k], v);
    else NR2.rogue[k] = v;
  }
}

export const levelOf = (pet) => (pet.stage === 'mainframe' ? 2 : 1);

// Chance a tier-2 roll is made for a fight in this region.
export const tierShare = (region) => (NR2.tiers ? Math.min(1, (NR2.tier.share[region] ?? 0) * (NR2.tier.scale ?? 1)) : 0);

// The share at a node a fraction f of the way along the run (0 entry, 1 exit); the region's share when the gradient is off.
export const tierShareAt = (region, f) => {
  const base = tierShare(region);
  if (!base || !NR2.tier.layer?.on) return base;
  const g = NR2.tier.layer.g;
  return Math.min(1, Math.max(0, base * (1 - g + 2 * g * f)));
};

// The win chance a bot gives up against a tier-2 fight of this game. Assumed, see NR2.tier.
export function tierPenalty(pending) {
  if (!NR2.tiers || pending?.tier !== 2) return 0;
  if (pending.game === 'breach') return Math.max(0, NR2.tier.breachPenalty - NR2.tier.breachRefund);
  return Math.max(0, (NR2.tier.speed - 1) * 10 * NR2.tier.winPerSpeed);
}

// How often an avoidance ability works against this fight, as a share of its normal chance.
export const avoidMult = (tier, level) => (NR2.tiers && tier === 2 ? NR2.tier.avoid[level] ?? 1 : 1);
