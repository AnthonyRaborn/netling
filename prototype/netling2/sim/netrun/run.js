// Netling 2.0 fork of src/netrun/run.js (prototype/netling2/sim): the same netrun rules on the 2.0 simulator. Changes: ICE games enter the
// care-preference history, and a disconnect fault owes a bug roll (settled by sim.js on the next step). Standing arrives through the
// `axes` adapter in sim.js. Not modeled: the debug station anomaly and any bug-clearing node.
// Netrun rules. The run lives on the pet (pet.run) so it survives reloads, and it spends the pet's real stats.
import { addScrip, grantItem, isAlive, lineOf, log, mulberry32, overclocked, rebootMinutesLeft, resting, runCooldownAtFloor, runCooldownLeft, sellValue, GAME_IDS, INVENTORY_SLOTS, ITEMS, CFG, SCRIP, PREF, pushGame, BUG_CFG, clearBugAt, IRON, SIDES, SIDE_METER, infect } from '../sim.js';
import { NR2, levelOf, tierShare, avoidMult } from './nr2.js';
import { generateMap, nodeById, ensureOnEveryRoute, marketKinds } from '../../../../src/netrun/map.js';
import { REGIONS, REGION_ORDER, STAGE_ORDER, regionLock, regionOpen } from '../../../../src/netrun/regions.js';
import { nextFragment as nextFragmentRaw, fragmentById } from '../codex2.js';
import { rollAccessory, accessoryById, RARITY } from '../../../../src/accessories.js';
import { ANOMALIES, anomaliesFor } from '../../../../src/netrun/anomalies.js';
import { weighted } from '../../../../src/random.js';
import { CHALLENGE_IDS, CHALLENGE_REGIONS, challengeById, challengeOn, voidChallenge } from '../../../../src/netrun/challenges.js';
import { DAILY, LANE, TRAIL, dailySeed, laneRng, newStake, seededRoll, stakeRecord, stakeRefund, stakeSnap } from '../../../../src/netrun/daily.js';

// The uplink cooldown lives in sim.js (CFG.runCooldownMin and friends), where items can shorten it.
export { runCooldownLeft };

export const RUN_CFG = {
  minCharge: 30,
  moveCharge: 4,
  moveHeat: 5,
  throttleHeat: 90, // above this, each move also costs Integrity
  throttleDamage: 6,
  cacheFindChance: 0.4,
  iceWinLootChance: 0.2,
  iceLossHeat: 12,
  relayCharge: 15,
  relayCool: 20,
  // Disconnection hurts but can't kill: it reboots to this Integrity and never deals the final care mistake.
  rebootIntegrity: 30,
  jackOutRestore: 0.5, // a clean jack-out re-syncs half the Integrity the run cost
  disconnectSync: 20,
  hideCharge: 8,
  hideHeat: 8,
  hideCaughtChance: 0.25,
  caughtDamage: 15,
  complyDamage: 5,
  // Checkpoint COMPLY: a small scan fee in scrip. Only a netling that can't pay has loot confiscated (or, carrying
  // nothing, an invasive probe), so complying no longer costs loot whenever the netling has scrip.
  complyScrip: 5,
  marketPrice: 12, // Charge per purchase, on top of the item's scrip price (SCRIP.price)
  // Two kinds of market: black markets (indie, cheaper, risky stock) and corp exchanges (corp, pricier, safe stock).
  exchangePrice: 16,
  exchangeChromePrice: 11, // corp credentials
  blackLean: -0.5,
  exchangeLean: 0.5,
  blackStock: { blackice: 3, booster: 2, overclock: 2, memory: 2, segfault: 1, coolant: 1 },
  exchangeStock: { voucher: 3, booster: 2, overclock: 1, coolant: 2, repair: 2, antivirus: 2, memory: 1 }, // 2.0: booster and bypass added so a clinic-only healing stock leaves it four kinds (was a fixed voucher and memory pair)
  // 2.0 clinic (a third kind of market, unaligned: no Standing lean). It fixes bugs (the only place that can), and it is the only market
  // that sells the healing items, which the black market and the corp exchange no longer stock (HEALING). A quarter of market nodes.
  // A fix costs the market's Charge fee plus 15 scrip, or 2 Standing in a split the player picks; fixes keep the visit open, a purchase
  // or leaving ends it.
  clinicShare: 0.25,
  healingOnlyAtClinic: true, // false: the black market and corp exchange keep selling the healing items (the 1.0 stock)
  clinicPrice: 12, // Charge per purchase and per fix
  clinicStock: { coolant: 3, repair: 3, antivirus: 2 },
  cacheFragmentChance: 0.15,
  // A netling's memory holds this many new codex fragments; the rest wait for the next generation.
  codexPerLife: 12, // 2.0 (decided): 12 a life (1.0: 8)
  // Loose scrip, banked on jack-out like loot.
  exitScrip: 3,
  cacheScripChance: 0.3, // an empty cache
  cacheScrip: 3,
  // Accessories: mostly bought at markets, rarely found.
  accPrice: 20,
  accScrip: { common: 25, rare: 50 },
  marketAccChance: 0.5,
  cacheAccChance: 0.03,
  iceWinAccChance: 0.05,
  exitAccChance: 0.08,
  exitFragmentChance: 0.6,
  echoFragmentChance: 0.5,
  firewallIceMult: 0.5,
  // Second abilities (balance pass 2), so no form is far ahead in The Deep. 0 turns one off.
  chromeInsurance: 12, // once a run, a blow that would disconnect leaves it at this Integrity
  chromeRelayRepair: 20, // corp relays: every relay also repairs Chrome this much Integrity
  daemonMoveRepair: 6, // Integrity restored per move
  ghostSlipChance: 0.45, // chance an ICE never notices it
  glitchPhaseChance: 0.35, // after the first, the chance each later ICE is phased through too
  // Mainframe upgrades (docs/SOURCE_PLAN.md): each mainframe form keeps its line's ability and adds one. Tuned in
  // build step 5 so careful mainframes lose 22 to 30% of Source runs and at least 8% of Deep runs.
  platInsurance: 2, // Plat: corp insurance pays out this many times a run
  platRelayRepair: 40, // Plat: Integrity each relay repairs (Chrome: chromeRelayRepair)
  airgapSoftLosses: 1, // Airgap: this many lost ICE fights a run barely scratch it...
  airgapSoftMult: 0.3, // ...taking this share of its (already halved) damage
  initLookahead: 3, // Init: sees node types this many steps ahead (Daemon: 2)
  initMoveRepair: 8, // Init: Integrity restored per move (Daemon: daemonMoveRepair)
  panicFreePhases: 2, // Panic: slips through this many ICE a run for certain (Glitch: 1)
  whisperSlipChance: 0.5, // Whisper: chance an ICE never notices it (Ghost: ghostSlipChance)
  // Contracts (docs/ATTENTION.md): a job posted while the uplink is ready and the app is open.
  contractChancePerHour: 0.5,
  // 2.0: a bugged netling is offered a clinic job (fix a bug at a clinic in a region with markets) more often: the contract chance is multiplied by
  // contractBuggedMult and the job is a clinic job with probability clinicContractChance. It pays the scrip of a fix and nothing else.
  contractBuggedMult: 2,
  clinicContractChance: 0.7,
  contractOpenMin: 360, // open until the next jack-in into its region, or 6 hours
  contractCatchUpMin: 60, // after a long gap, only the last hour counts toward posting one
  contractScrip: { exit: 15, clean: 20, ice: 20, caches: 15, market: 15, fragment: 25, clinic: 15 },
  contractItemChance: 0.25, // and sometimes one of the cheapest items too
  contractIce: [2, 3], // get past this many ICE...
  contractIceSpare: 1, // ...with every route holding this many more, so one lost fight doesn't sink it
  contractCaches: [2, 3],
  contractMarketBy: 0.5, // every route passes a market in the first half of the map
};

// Adult form abilities, applied automatically.
export const FORM_ABILITIES = {
  chrome: 'Corp credentials: checkpoints wave it through, relays patch it up, and corp insurance saves it from one disconnect a run.',
  firewall: 'Hardened: ICE deals half damage.',
  daemon: 'Lookahead and upkeep: sees node types two steps ahead, and repairs a little Integrity with every move.',
  glitch: 'Phase: slips through the first ICE of each run, and often the ones after.',
  ghost: 'Unseen: sees every node; checkpoints never notice it, and ICE often misses it.',
};
// A mainframe keeps its line's ability, and adds its upgrade (upgraded).
// What each mainframe form adds to its line's ability (shown in the dex).
export const MAINFRAME_ABILITIES = {
  plat: 'Relays patch it twice as much, and corp insurance pays out twice a run.',
  airgap: 'The first ICE fight it loses each run barely scratches it.',
  init: 'Sees node types three steps ahead, and repairs more with every move.',
  panic: 'Slips through the first two ICE of each run for certain.',
  whisper: 'ICE misses it more often still.',
};
const ability = (pet) => (pet.stage === 'adult' || pet.stage === 'mainframe' ? lineOf(pet.form) : null);
const upgraded = (pet) => pet.stage === 'mainframe';
// 2.0 abilities (nr2.js): the ability key is the adult form's id (breachCorp ... feastStreet, hidden); level 1 adult, 2 elder.
const ab2 = (pet) => (NR2.abilities ? ability(pet) : null);
const lvl = (pet) => levelOf(pet);
// Which egg this netling is, for the light run costs: Iron (wear on), Program (Charge-owner), Wetware (Sync-owner).
const eggOf = (pet) => (IRON.on ? 'iron' : SIDES.on && SIDES.owner === 'charge' ? 'program' : SIDES.on && SIDES.owner === 'sync' ? 'wetware' : null);

const clamp = (v) => Math.min(100, Math.max(0, v));

// Minutes as "2h 5m", "2h" or "45m".
export const fmtLeft = (m) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ''}` : `${m}m`);

// Why a run can't start, or null.
export function runBlockReason(pet, region = 'public', codex = []) {
  if (!isAlive(pet)) return pet.stage === 'script' ? 'still compiling...' : 'no signal.';
  if (pet.run) return null; // resuming
  if (pet.hibernation) return 'hibernating.';
  if (REGIONS[region].tutorial) return null; // the first run is always allowed
  if (resting(pet)) return pet.nap ? 'napping. wake it first.' : 'in low-power mode.';
  if ((pet.rebootUntilAge ?? 0) > pet.ageMin) return 'still rebooting.';
  const lock = regionLock(region, pet.stage, codex, pet.cleared ?? []);
  if (lock) return `${REGIONS[region].name}: ${lock}`;
  const cd = REGIONS[region].noCooldown ? 0 : runCooldownLeft(pet);
  if (cd > 0) {
    return `uplink cooling down${runCooldownAtFloor(pet) ? ', laying low from corp sweeps' : ''}. ${fmtLeft(cd)} left.`;
  }
  if (pet.stats.charge < RUN_CFG.minCharge) return `needs ${RUN_CFG.minCharge}+ charge to jack in.`;
  return null;
}

// How fast ICE fights run: slower for a netling that jacked in overclocked.
export const iceSpeed = (pet) => (pet.run?.hot ? CFG.overclockGameSpeed : 1);

// opts.challenge: a challenge id (challenges.js), kept only for a region that has challenges. opts.day: the daily
// trace's date (daily.js), which seeds its map and every roll in it; rng is then unused.
export function startRun(pet, region, rng, codex = [], ownedAccessories = [], opts = {}) {
  const daily = Boolean(REGIONS[region].daily);
  const day = daily ? opts.day ?? DAILY.epoch : null;
  const map = generateMap(region, daily ? mulberry32(dailySeed(day)) : rng);
  if (!daily) clinicKinds(map, rng);
  pet.run = {
    region,
    map,
    pos: map.nodes[0].id,
    visited: [map.nodes[0].id],
    loot: [],
    phase: 'map', // map | ice | choice | done
    pending: null, // ice: { game } | choice: { kind, title, text, options, ... }
    revealed: [],
    phased: false,
    // Overclocked at jack-in: ICE runs slower all run but bites harder. Fixed here, so the Heat every move adds
    // never switches it on partway: jacking in hot is the player's choice.
    hot: overclocked(pet),
    insured: false, // Chrome's corp insurance used this run
    insuredTimes: 0, // how many times it paid out (a Plat's pays out twice)
    freePhases: 0, // ICE a Glitch line has slipped through for certain (a Panic gets two)
    softLosses: 0, // lost ICE fights that barely scratched an Airgap
    known: [...codex], // codex at jack-in, so fragments never repeat
    startStats: { ...pet.stats },
    tally: { nodes: 0, iceWon: 0, iceLost: 0, icePhased: 0, caches: 0, bought: 0, clinics: 0, fixed: 0, fixScrip: 0, fixStanding: 0 },
    fragments: [], // found this run; banked on jack-out like loot
    knownAcc: [...ownedAccessories],
    accessories: [], // found or bought this run; banked on jack-out like loot
    scrip: 0, // loose scrip found this run; banked on jack-out like loot
    result: null, // jacked | disconnected | aborted
    messages: [],
    startedAge: pet.ageMin,
    challenge: CHALLENGE_REGIONS.includes(region) && CHALLENGE_IDS.includes(opts.challenge) ? opts.challenge : null,
    challengeVoid: false, // the rule was broken: the run goes on without it
    challengeWon: false, // reached the exit with the rule kept
    ...(daily ? { daily: true, day, seed: dailySeed(day), rollKey: null, rolls: 0, stake: newStake(pet.inventory), trail: [TRAIL.entry] } : {}),
  };
  if (pet.run.challenge) note(pet.run, `challenge: ${challengeById(pet.run.challenge).name.toUpperCase()}. ${challengeById(pet.run.challenge).rule}`);
  // An open contract for this region comes along, and the map is fixed so every route can meet it.
  const c = pet.contract;
  if (c && c.region === region && !REGIONS[region].tutorial) {
    pet.contract = null;
    pet.run.contract = { ...c };
    const need = CONTRACT_ROUTES[c.kind]?.(c, map);
    if (need) ensureOnEveryRoute(map, need.type, need.count, rng, { maxLayer: need.maxLayer, avoid: ['relay'] });
    marketKinds(map, rng);
    if (!daily) clinicKinds(map, rng);
    // A clinic job: every market early enough on the map is a clinic, so every route passes one.
    if (need?.clinic) for (const n of map.nodes) if (n.type === 'market' && n.layer <= need.maxLayer) Object.assign(n, { flavor: 'clinic', clinicRolled: true });
  }
  // NL-0 will not go down to the Source. It says so, if it is watching.
  if (region === 'source' && pet.rootAccess) note(pet.run, pet.nl0Rests ? "NL-0 (asleep): zzz. i'll wait up here." : "NL-0: i'll wait up here.");
  return pet.run;
}

// The healing items: sold only at clinics (they are still found as loot and dropped).
export const HEALING = ['coolant', 'repair', 'antivirus'];
const withoutHealing = (t) => Object.fromEntries(Object.entries(t).filter(([id]) => !HEALING.includes(id)));
// What a market of this flavor ('black' | 'corp' | 'clinic') stocks in this region.
export function marketStock(flavor, region) {
  if (flavor === 'clinic') return RUN_CFG.clinicStock;
  const table = flavor === 'corp' ? RUN_CFG.exchangeStock : region.market ?? RUN_CFG.blackStock;
  return RUN_CFG.healingOnlyAtClinic ? withoutHealing(table) : table;
}
// Turns a share of the map's market nodes into clinics, once each (a node a contract adds later is rolled when it appears).
export function clinicKinds(map, rng) {
  for (const n of map.nodes) {
    if (n.type !== 'market' || n.clinicRolled) continue;
    n.clinicRolled = true;
    if (rng() < RUN_CFG.clinicShare) n.flavor = 'clinic';
  }
}
// The ways to pay for a fix, offered only while the netling has bugs.
const fixOptions = (pet) => (pet.bugs > 0 ? [
  { id: 'fixscrip', label: `FIX A BUG ${BUG_CFG.clearScrip}$` },
  { id: 'fix2corp', label: 'FIX A BUG 2 CORP' },
  { id: 'fix1each', label: 'FIX A BUG 1+1 STANDING' },
  { id: 'fix2street', label: 'FIX A BUG 2 STREET' },
] : []);

export const runOptions = (run) => nodeById(run.map, run.pos).edges.map((id) => nodeById(run.map, id));

function note(run, msg) {
  run.messages.push(msg);
}

// Rolls an accessory this run doesn't have yet, if any (never in the tutorial). Returns a log suffix.
function takeAccessory(run, rng) {
  if (REGIONS[run.region].noStyleDrops) return '';
  const id = rollAccessory([...run.knownAcc, ...run.accessories], rng, run.region);
  if (!id) return '';
  run.accessories.push(id);
  return ` accessory: ${accessoryById(id).name}!`;
}

export const codexRoom = (pet) => Math.max(0, RUN_CFG.codexPerLife - (pet.codexFound ?? 0) - (pet.run?.fragments.length ?? 0));

// Picks up the region's next unread fragment, if any. Returns a log suffix.
// Whether this region's codex still has a fragment the line has not found (this run's finds included).
const nextFragment = (region, known, rootAccess = false) => nextFragmentRaw(region, known, rootAccess);
const fragmentsLeft = (run, pet) => nextFragment(REGIONS[run.region].codexRegion ?? run.region, [...run.known, ...run.fragments], pet?.rootAccess) !== null;

function takeFragment(pet) {
  const run = pet.run;
  if (REGIONS[run.region].noFragments) return '';
  const id = nextFragment(REGIONS[run.region].codexRegion ?? run.region, [...run.known, ...run.fragments], pet.rootAccess);
  if (!id) return '';
  if (!codexRoom(pet)) return ' a codex fragment, but its memory is full: it will keep for the next generation.';
  run.fragments.push(id);
  return ` codex fragment: "${fragmentById(id).title}".`;
}

// A daily run (daily.js) writes what each rules call changed on the netling to its ledger, and gives it all back
// once the run ends. Other runs just make the call.
function staked(pet, fn) {
  const run = pet.run;
  if (!run?.daily) return fn();
  const before = stakeSnap(pet);
  const res = fn();
  stakeRecord(run, before, pet);
  if (run.phase === 'done' && !run.refunded) {
    stakeRefund(pet, run.stake, { scrip: SCRIP.max, inventory: INVENTORY_SLOTS });
    run.refunded = true;
  }
  return res;
}

// Move to an adjacent node and trigger it. Returns the node's encounter.
export const moveTo = (pet, nodeId, rng) => staked(pet, () => moveToNode(pet, nodeId, rng));

function moveToNode(pet, nodeId, rng) {
  const run = pet.run;
  if (run.phase !== 'map') return { ok: false, msg: 'finish this node first.' };
  if (!runOptions(run).some((n) => n.id === nodeId)) return { ok: false, msg: 'no route to that node.' };
  if (run.daily) rng = laneRng(run, nodeId, LANE.arrive);
  const st = pet.stats;
  st.charge = clamp(st.charge - RUN_CFG.moveCharge);
  st.heat = clamp(st.heat + RUN_CFG.moveHeat);
  run.pos = nodeId;
  run.visited.push(nodeId);
  if (run.tally) run.tally.nodes++;
  if (run.trail) run.trail.push(TRAIL[nodeById(run.map, nodeId).type] ?? '.');
  if (st.charge <= 0) return disconnect(pet, 'power drained mid-run.');
  const repair = upgraded(pet) ? RUN_CFG.initMoveRepair : RUN_CFG.daemonMoveRepair;
  if (ability(pet) === 'daemon' && repair) st.integrity = clamp(st.integrity + repair);
  if (ab2(pet)) {
    const up = NR2.ab.upkeep[ab2(pet)]?.[lvl(pet)] ?? 0; // Tune street, elder: repairs a little every move
    if (up) st.integrity = clamp(st.integrity + up);
  }
  // Iron's own problem in a run: the redline builds wear for the minutes a node takes (the run itself takes no simulated time).
  if (NR2.eggCost && eggOf(pet) === 'iron' && st.heat > IRON.heat) pet.wear = (pet.wear ?? 0) + IRON.rate * (st.heat - IRON.heat) * NR2.cost.ironMinutesPerMove;
  if (st.heat >= RUN_CFG.throttleHeat) {
    st.integrity = clamp(st.integrity - RUN_CFG.throttleDamage);
    note(run, `thermal throttling. -${RUN_CFG.throttleDamage} integrity.`);
    if (st.integrity <= 0 && !insured(pet)) return disconnect(pet, 'burned out from the heat.');
  }

  const node = nodeById(run.map, nodeId);
  const region = REGIONS[run.region];
  forceCache(pet, run, node, rng);
  switch (node.type) {
    case 'cache': {
      run.tally.caches++;
      const frag = (rng() < RUN_CFG.cacheFragmentChance ? takeFragment(pet) : '') + (rng() < RUN_CFG.cacheAccChance ? takeAccessory(run, rng) : '');
      const sc = ab2(pet) === 'feastStreet' ? NR2.ab.scavenge[lvl(pet)] : null;
      if (node.filled || rng() < (sc ? sc.cache : region.cacheFind ?? RUN_CFG.cacheFindChance)) {
        const item = weighted(region.loot, rng);
        run.loot.push(item);
        note(run, `cache cracked: ${ITEMS[item].name}.${frag}`);
        return { ok: true, kind: 'cache', item, fragment: Boolean(frag) };
      }
      if (rng() < RUN_CFG.cacheScripChance) {
        const cs = RUN_CFG.cacheScrip + (ab2(pet) === 'feastCorp' ? NR2.ab.concession[lvl(pet)].scrip : 0);
        run.scrip = (run.scrip ?? 0) + cs;
        note(run, `cache held ${cs} loose scrip.${frag}`);
        return { ok: true, kind: 'cache', item: null, fragment: Boolean(frag) };
      }
      note(run, frag ? `cache held no items.${frag}` : 'cache was empty.');
      return { ok: true, kind: 'cache', item: null, fragment: Boolean(frag) };
    }
    case 'ice': {
      // 2.0: a harder tier of ICE, mixed in by region depth. The daily trace rolls it by node alone (lane 4, beside the four in daily.js).
      const tier = rollTier(run, nodeId, rng);
      const am = avoidMult(tier, lvl(pet));
      const key2 = ab2(pet);
      if (key2) {
        // Phase (Dodge corp): the first ICE (two at the elder level) for certain, then often; against tier 2 each works less often.
        const ph = key2 === 'dodgeCorp' ? NR2.ab.phase[lvl(pet)] : null;
        const chance = ph ? (run.freePhases < ph.free ? 1 : ph.later) : key2 === 'dodgeStreet' || key2 === 'hidden' ? NR2.ab.unseen[lvl(pet)] : 0;
        if (chance > 0 && rng() < chance * am) {
          if (ph && run.freePhases < ph.free) run.freePhases++;
          run.tally.icePhased++;
          markTrail(run, TRAIL.icePhased);
          note(run, 'the ICE never noticed it.');
          return { ok: true, kind: 'ice', phased: true };
        }
      }
      if (ability(pet) === 'ghost' && rng() < (upgraded(pet) ? RUN_CFG.whisperSlipChance : RUN_CFG.ghostSlipChance)) {
        run.tally.icePhased++;
        markTrail(run, TRAIL.icePhased);
        note(run, 'the ICE looked straight through it.');
        return { ok: true, kind: 'ice', phased: true };
      }
      const free = upgraded(pet) ? RUN_CFG.panicFreePhases : 1;
      const freeUsed = Math.max(run.freePhases ?? 0, run.phased ? 1 : 0);
      if (ability(pet) === 'glitch' && freeUsed >= free && rng() < RUN_CFG.glitchPhaseChance) {
        run.tally.icePhased++;
        markTrail(run, TRAIL.icePhased);
        note(run, 'glitched through the ICE again.');
        return { ok: true, kind: 'ice', phased: true };
      }
      if (ability(pet) === 'glitch' && freeUsed < free) {
        run.phased = true;
        run.freePhases = freeUsed + 1;
        run.tally.icePhased++;
        markTrail(run, TRAIL.icePhased);
        note(run, 'glitched straight through the ICE.');
        return { ok: true, kind: 'ice', phased: true };
      }
      // The daily trace picks the fight by node alone, so every form meets the same one there.
      const game = GAME_IDS[Math.floor((run.daily ? seededRoll(run.seed, nodeId * 8 + LANE.game, 0) : rng()) * GAME_IDS.length)];
      run.phase = 'ice';
      run.pending = { game, tier };
      if (tier === 2) {
        run.tally.iceHard = (run.tally.iceHard ?? 0) + 1;
        note(run, `tier 2 ICE: ${game}.`); // the tier can be logged (decided)
      }
      return { ok: true, kind: 'ice', game, tier };
    }
    case 'relay': {
      // Unplugged: the relay is dark. It still lets the runner out, but only the exit counts for the challenge.
      if (run.challenge === 'unplugged') {
        note(run, 'relay found. dark: unplugged.');
        openChoice(run, {
          kind: 'relay',
          title: 'DARK RELAY',
          text: 'no power, no venting. it can still get you out.',
          options: [
            { id: 'continue', label: 'CONTINUE', hint: 'keep going' },
            { id: 'out', label: `JACK OUT (${run.loot.length})`, hint: 'bank loot, end run. the challenge only counts at the exit' },
          ],
        });
        return { ok: true, kind: 'relay', dark: true };
      }
      st.charge = clamp(st.charge + RUN_CFG.relayCharge);
      st.heat = clamp(st.heat - RUN_CFG.relayCool);
      // Corp relays: the grid services its own.
      const patch = (ability(pet) === 'chrome' ? (upgraded(pet) ? RUN_CFG.platRelayRepair : RUN_CFG.chromeRelayRepair) : 0) + (ab2(pet) ? NR2.ab.relayPatch[ab2(pet)]?.[lvl(pet)] ?? 0 : 0);
      const patched = patch > 0;
      if (patched) st.integrity = clamp(st.integrity + patch);
      note(run, patched ? `relay found. recharged, vented, and patched: +${patch} integrity (corp credentials).` : 'relay found. recharged and vented.');
      openChoice(run, {
        kind: 'relay',
        title: 'RELAY',
        text: `recharged${patched ? ', vented and patched' : ' and vented'}. safe place to bank your loot.`,
        options: [
          { id: 'continue', label: 'CONTINUE', hint: 'keep going' },
          { id: 'out', label: run.daily ? 'JACK OUT' : `JACK OUT (${run.loot.length})`, hint: run.daily ? 'end the trace here' : 'bank loot, end run' },
        ],
      });
      return { ok: true, kind: 'relay' };
    }
    case 'checkpoint': {
      const form = ability(pet);
      if (form === 'chrome' || form === 'ghost' || (ab2(pet) && NR2.ab.checkpoint[form]?.[lvl(pet)])) {
        note(run, form === 'chrome' ? 'checkpoint: credentials accepted.' : 'checkpoint: it never saw you.');
        return { ok: true, kind: 'checkpoint', auto: true };
      }
      const hasVoucher = pet.inventory.includes('voucher');
      openChoice(run, {
        kind: 'checkpoint',
        title: 'CORP CHECKPOINT',
        text: 'a scanner sweeps the node. identify yourself.',
        options: [
          { id: 'hide', label: 'HIDE', hint: `-${RUN_CFG.hideCharge} chg, may get scorched` },
          { id: 'comply', label: 'COMPLY', hint: (pet.scrip ?? 0) >= RUN_CFG.complyScrip ? `-${RUN_CFG.complyScrip} scrip scan fee` : 'no scrip: they may confiscate loot' },
          { id: 'voucher', label: 'VOUCHER', hint: hasVoucher ? 'spend one, pass clean' : 'none in inventory', disabled: !hasVoucher },
        ],
      });
      return { ok: true, kind: 'checkpoint' };
    }
    case 'market': {
      const corp = node.flavor === 'corp';
      const clinic = node.flavor === 'clinic';
      const table = marketStock(node.flavor, region);
      // Under a market contract, the first offer is always one of the cheapest items.
      const cheap = run.contract?.kind === 'market' ? cheapestOf(table) : null;
      const offers = [weighted(cheap ?? table, rng)];
      for (let i = 0; i < 10 && offers.length < 2; i++) {
        const next = weighted(table, rng);
        if (next !== offers[0]) offers.push(next);
      }
      const price = clinic ? RUN_CFG.clinicPrice : corp ? (ability(pet) === 'chrome' ? RUN_CFG.exchangeChromePrice : ab2(pet) === 'feastCorp' ? NR2.ab.concession[lvl(pet)].exchangePrice : RUN_CFG.exchangePrice) : region.marketPrice ?? RUN_CFG.marketPrice;
      if (clinic) run.tally.clinics++;
      const accOffer = !clinic && !region.noStyleDrops && rng() < RUN_CFG.marketAccChance ? rollAccessory([...run.knownAcc, ...run.accessories], rng, run.region, corp ? 'exchange' : 'black') : null;
      openChoice(run, {
        kind: 'market',
        flavor: clinic ? 'clinic' : corp ? 'corp' : 'black',
        title: clinic ? 'CLINIC' : corp ? 'CORP EXCHANGE' : 'BLACK MARKET',
        text: clinic ? `bugs fixed and repairs sold, no questions. ${price} charge a go.` : `a vendor process. scrip, plus ${price} charge.`,
        offers,
        price,
        accOffer,
        options: [
          ...(clinic ? fixOptions(pet) : []),
          ...offers.map((id, i) => ({ id: `buy${i}`, label: `${ITEMS[id].name.toUpperCase()} ${SCRIP.price[id]}$` })),
          ...(accOffer ? [{ id: 'buyacc', label: `${accessoryById(accOffer).name.toUpperCase()} ${accScrip(accOffer)}$` }] : []),
          { id: 'leave', label: 'LEAVE', hint: 'buy nothing. sell from the inventory first.' },
        ],
      });
      refreshMarket(pet);
      return { ok: true, kind: 'market' };
    }
    case 'anomaly': {
      const pool = anomaliesFor(run.region);
      const ev = pool[Math.floor(rng() * pool.length)];
      openChoice(run, {
        kind: 'anomaly',
        event: ev.id,
        title: ev.title,
        text: ev.text,
        // An option may say something else once the region's codex is complete (codexDoneHint).
        options: ev.options.map(({ id, label, hint, codexDoneHint }) => ({ id, label, hint: codexDoneHint && !fragmentsLeft(run, pet) ? codexDoneHint : hint })),
      });
      return { ok: true, kind: 'anomaly', event: ev.id };
    }
    case 'exit': {
      if (run.daily) {
        note(run, 'exit node. trace complete.');
        return { ok: true, kind: 'exit', ...jackOut(pet) };
      }
      const bonus = Array.from({ length: region.exitBonus ?? 1 }, () => weighted(region.loot, rng));
      run.loot.push(...bonus);
      run.scrip = (run.scrip ?? 0) + RUN_CFG.exitScrip + (ab2(pet) === 'feastCorp' ? NR2.ab.concession[lvl(pet)].scrip : 0);
      const exitFragment = region.exitFragment ?? (run.contract?.kind === 'fragment' ? 1 : RUN_CFG.exitFragmentChance);
      const frag = (rng() < exitFragment ? takeFragment(pet) : '') + (rng() < RUN_CFG.exitAccChance ? takeAccessory(run, rng) : '');
      // Reaching an exit opens the next region down, for this netling. The tutorial doesn't count.
      const opened = !region.tutorial && !region.daily && !(pet.cleared ??= []).includes(run.region);
      if (opened) pet.cleared.push(run.region);
      // The Mainframe gate counts this life's exits from The Deep, and the clean ones (no ICE fight lost on the way).
      if (run.region === 'deep') {
        const d = pet.deepExits ?? { all: 0, clean: 0 };
        pet.deepExits = { all: d.all + 1, clean: d.clean + ((run.tally?.iceLost ?? 0) === 0 ? 1 : 0) };
      }
      const next = opened && REGION_ORDER[REGION_ORDER.indexOf(run.region) + 1];
      const young = next && STAGE_ORDER.indexOf(pet.stage) < STAGE_ORDER.indexOf(REGIONS[next].minStage);
      // The Deep stays unnamed: its way in is a secret.
      const opens = next && !REGIONS[next].requires ? `: the ${REGIONS[next].name} ${young ? 'opens once it grows up' : 'is open to it'}.` : '.';
      note(run, `exit node. bonus: ${bonus.map((b) => ITEMS[b].name).join(', ')}, ${RUN_CFG.exitScrip} scrip.${frag}${opened ? ` region cleared${opens}` : ''}`);
      if (run.challenge && !run.challengeVoid) {
        run.challengeWon = true;
        note(run, `challenge complete: ${challengeById(run.challenge).name.toUpperCase()}.`);
      }
      return { ok: true, kind: 'exit', ...jackOut(pet) };
    }
  }
  return { ok: true, kind: node.type };
}

export const resolveIce = (pet, won, rng) => staked(pet, () => resolveIceFight(pet, won, rng));

function resolveIceFight(pet, won, rng) {
  const run = pet.run;
  if (run.phase !== 'ice') return { ok: false };
  if (run.daily) rng = laneRng(run, run.pos, LANE.ice);
  if (PREF.on && PREF.ice && run.pending?.game) pushGame(pet, run.pending.game);
  run.lastTier = run.pending?.tier ?? 1;
  run.phase = 'map';
  run.pending = null;
  const st = pet.stats;
  const tier2 = run.lastTier === 2;
  if (run.tally) run.tally[won ? 'iceWon' : 'iceLost']++;
  if (won) {
    const acc = rng() < RUN_CFG.iceWinAccChance ? takeAccessory(run, rng) : '';
    if (rng() < (ab2(pet) === 'feastStreet' ? NR2.ab.scavenge[lvl(pet)].iceWin : RUN_CFG.iceWinLootChance)) {
      const item = weighted(REGIONS[run.region].loot, rng);
      run.loot.push(item);
      note(run, `ICE shattered. salvaged ${ITEMS[item].name}.${acc}`);
    } else {
      note(run, `ICE shattered.${acc}`);
    }
    return { ok: true, won };
  }
  const hd = ab2(pet) === 'breachStreet' ? NR2.ab.hardened[lvl(pet)] : null;
  const soft = (ability(pet) === 'firewall' && upgraded(pet) && (run.softLosses ?? 0) < RUN_CFG.airgapSoftLosses) || Boolean(hd?.soft && (run.softLosses ?? 0) < hd.soft);
  if (soft) run.softLosses = (run.softLosses ?? 0) + 1;
  markTrail(run, TRAIL.iceLost);
  const hot = Boolean(run.hot); // lost ICE bites harder for a netling that jacked in overclocked
  const dmg = Math.round(
    REGIONS[run.region].iceDamage * (ability(pet) === 'firewall' ? RUN_CFG.firewallIceMult : 1) * (soft ? (hd ? NR2.ab.softMult : RUN_CFG.airgapSoftMult) : 1) * (hd ? hd.dmg : 1) * (NR2.tiers && tier2 ? NR2.tier.damageMult : 1) * (hot ? CFG.overclockIceDamageMult : 1),
  );
  st.integrity = clamp(st.integrity - dmg);
  st.heat = clamp(st.heat + RUN_CFG.iceLossHeat);
  if (NR2.eggCost) lostFightCost(pet, run, rng);
  note(run, `ICE bit back${hot ? ' hard: overclocked' : ''}. -${dmg} integrity.`);
  if (challengeOn(run, 'glass')) voidChallenge(run, 'an ICE fight was lost.');
  if (st.integrity <= 0 && !insured(pet)) return disconnect(pet, 'integrity breached by ICE.');
  return { ok: true, won };
}

// Chrome's corp insurance: once a run (a Plat's twice), a blow that would disconnect it is paid off instead.
function insured(pet) {
  const run = pet.run;
  const used = Math.max(run.insuredTimes ?? 0, run.insured ? 1 : 0);
  if (ab2(pet) === 'breachCorp') {
    const ins = NR2.ab.insurance[lvl(pet)];
    if (used >= ins.times) return false;
    run.insured = true;
    run.insuredTimes = used + 1;
    pet.stats.integrity = ins.to;
    note(run, `insurance paid out. integrity restored to ${ins.to}.`);
    return true;
  }
  if (ability(pet) !== 'chrome' || !RUN_CFG.chromeInsurance || used >= (upgraded(pet) ? RUN_CFG.platInsurance : 1)) return false;
  run.insured = true;
  run.insuredTimes = used + 1;
  pet.stats.integrity = RUN_CFG.chromeInsurance;
  note(run, `corp insurance paid out. integrity restored to ${RUN_CFG.chromeInsurance}.`);
  return true;
}

// Changes the daily trail's mark for the node just reached (an ICE fight slipped or lost).
function markTrail(run, mark) {
  if (run.trail?.length) run.trail[run.trail.length - 1] = mark;
}

function openChoice(run, pending) {
  run.phase = 'choice';
  run.pending = pending;
}

const accScrip = (id) => RUN_CFG.accScrip[accessoryById(id)?.rarity === 'common' ? 'common' : 'rare'];

// Market buttons follow what the netling can afford right now (it can sell mid-choice).
export function refreshMarket(pet) {
  const p = pet.run?.pending;
  if (p?.kind !== 'market') return;
  const scrip = pet.scrip ?? 0;
  const charge = pet.stats.charge;
  for (const o of p.options) {
    if (o.id === 'leave') continue;
    if (o.id.startsWith('fix')) {
      const { corp, street } = pet.standing;
      const short = charge <= p.price + 5 ? `needs ${p.price + 5}+ charge`
        : o.id === 'fixscrip' ? (scrip < BUG_CFG.clearScrip ? `needs ${BUG_CFG.clearScrip} scrip, has ${scrip}` : null)
        : o.id === 'fix2corp' ? (corp < 2 ? 'needs 2 corp standing' : null)
        : o.id === 'fix2street' ? (street < 2 ? 'needs 2 street standing' : null)
        : corp < 1 || street < 1 ? 'needs 1 of each standing' : null;
      o.disabled = Boolean(short);
      o.hint = short ?? `-${p.price} chg`;
      continue;
    }
    const acc = o.id === 'buyacc';
    const cost = acc ? accScrip(p.accOffer) : SCRIP.price[p.offers[Number(o.id.slice(3))]];
    const chg = acc ? RUN_CFG.accPrice : p.price;
    const short = scrip < cost ? `needs ${cost} scrip, has ${scrip}` : charge <= chg + 5 ? `needs ${chg + 5}+ charge` : null;
    o.disabled = Boolean(short);
    o.hint = short ?? `-${cost} scrip, -${chg} chg${acc ? ` · ${accessoryById(p.accOffer).rarity === 'common' ? 'accessory' : 'rare accessory'}` : ''}`;
    // Bare metal: an item (not an accessory) ends the challenge, so the view asks twice (confirm).
    if (!acc && challengeOn(pet.run, 'baremetal')) {
      o.confirm = 'ENDS BARE METAL. AGAIN TO BUY';
      if (!short) o.hint += ' · ends bare metal';
    } else delete o.confirm;
  }
}

// Whether the open choice is a market, where the inventory sells for more.
export const atMarket = (pet) => pet.run?.phase === 'choice' && pet.run.pending?.kind === 'market';

// Sells an inventory slot: half the price at an open market, a quarter anywhere else (SCRAP).
export const sellItem = (pet, slot) => staked(pet, () => sellSlot(pet, slot));

function sellSlot(pet, slot) {
  const id = pet.inventory?.[slot];
  if (!id) return { ok: false, msg: 'empty slot.' };
  const market = atMarket(pet);
  pet.inventory.splice(slot, 1);
  const value = sellValue(id, market);
  const over = addScrip(pet, value);
  const msg = `${ITEMS[id].name.toLowerCase()} ${market ? 'sold' : 'scrapped'} for ${value} scrip.${over ? ' scrip full: the rest is lost.' : ''}`;
  if (market) {
    note(pet.run, msg);
    refreshMarket(pet);
  }
  return { ok: true, msg, value, market };
}

// Resolve the open choice node. Returns { ok, msg, result? }.
export const choose = (pet, optionId, rng) => staked(pet, () => chooseOption(pet, optionId, rng));

function chooseOption(pet, optionId, rng) {
  const run = pet.run;
  if (run.phase !== 'choice') return { ok: false, msg: 'nothing to choose.' };
  if (run.daily) rng = laneRng(run, run.pos, LANE.choice);
  const p = run.pending;
  if (p.kind === 'market') refreshMarket(pet); // selling since it opened may have changed what it can afford
  const opt = p.options.find((o) => o.id === optionId);
  if (!opt || opt.disabled) return { ok: false, msg: 'not available.' };
  // The inventory stays usable mid-choice, so the voucher offered on arrival may be gone.
  if (p.kind === 'checkpoint' && optionId === 'voucher' && !pet.inventory.includes('voucher')) {
    Object.assign(opt, { disabled: true, hint: 'none in inventory' });
    return { ok: false, msg: 'no voucher left.' };
  }
  const st = pet.stats;
  run.phase = 'map';
  run.pending = null;
  const region = REGIONS[run.region];
  const lean = (a, b) => {
    pet.axes.allegiance += a;
    pet.axes.stability += b;
  };
  const loot = (fixed) => {
    const item = fixed ?? weighted(region.loot, rng);
    run.loot.push(item);
    return `+${ITEMS[item].name}.`;
  };
  const hurt = (n, why) => {
    st.integrity = clamp(st.integrity - n);
    return `${why} -${n} integrity.`;
  };
  let msg = '';
  let boughtItem = false;

  if (p.kind === 'relay') {
    if (optionId === 'out') return jackOut(pet);
    return { ok: true };
  }
  if (p.kind === 'checkpoint') {
    if (optionId === 'hide') {
      st.charge = clamp(st.charge - RUN_CFG.hideCharge);
      st.heat = clamp(st.heat + RUN_CFG.hideHeat);
      lean(-1, 0);
      msg = rng() < RUN_CFG.hideCaughtChance ? hurt(RUN_CFG.caughtDamage, 'slipped past, but got scorched.') : 'slipped past the scanner.';
    } else if (optionId === 'comply') {
      lean(1, 0);
      if ((pet.scrip ?? 0) >= RUN_CFG.complyScrip) {
        pet.scrip -= RUN_CFG.complyScrip;
        msg = `scanned. paid the ${RUN_CFG.complyScrip} scrip fee.`;
      } else if (run.loot.length) {
        const taken = run.loot.splice(Math.floor(rng() * run.loot.length), 1)[0];
        msg = `scanned. confiscated: ${ITEMS[taken].name}.`;
      } else {
        msg = `scanned. ${hurt(RUN_CFG.complyDamage, 'invasive probe.')}`;
      }
    } else {
      pet.inventory.splice(pet.inventory.indexOf('voucher'), 1);
      lean(1, 0);
      msg = 'voucher accepted. waved through.';
    }
  } else if (p.kind === 'market') {
    if (optionId.startsWith('fix')) {
      st.charge = clamp(st.charge - p.price);
      const corp = optionId === 'fix2corp' ? 2 : optionId === 'fix1each' ? 1 : 0;
      const how = optionId === 'fixscrip' ? { pay: 'scrip' } : { pay: 'standing', corp };
      if (!clearBugAt(pet, how)) return { ok: false, msg: 'could not pay.' };
      run.tally.fixed++;
      if (how.pay === 'scrip') run.tally.fixScrip++;
      else run.tally.fixStanding++;
      msg = `a bug fixed (${pet.bugs} left).`;
      // The clinic stays open for more fixes or one purchase.
      p.options = [...fixOptions(pet), ...p.options.filter((o) => !o.id.startsWith('fix'))].filter((o, i, all) => all.findIndex((x) => x.id === o.id) === i);
      openChoice(run, p);
      refreshMarket(pet);
    } else if (optionId === 'leave') {
      msg = 'left the market.';
    } else if (optionId === 'buyacc') {
      st.charge = clamp(st.charge - RUN_CFG.accPrice);
      pet.scrip -= accScrip(p.accOffer);
      run.accessories.push(p.accOffer);
      run.tally.bought++;
      msg = `bought ${accessoryById(p.accOffer).name} for your style.`;
    } else {
      const item = p.offers[Number(optionId.slice(3))];
      st.charge = clamp(st.charge - p.price);
      pet.scrip -= SCRIP.price[item];
      run.loot.push(item);
      run.tally.bought++;
      if (p.flavor !== 'clinic') lean(p.flavor === 'corp' ? RUN_CFG.exchangeLean : RUN_CFG.blackLean, 0);
      msg = `bought ${ITEMS[item].name}.`;
      boughtItem = true;
    }
  } else if (p.kind === 'anomaly') {
    const ev = ANOMALIES.find((e) => e.id === p.event);
    const reveal = (depth) => {
      for (const id of nodesWithin(run, run.pos, depth)) if (!run.revealed.includes(id)) run.revealed.push(id);
    };
    const fragment = (chance) => (rng() < chance ? takeFragment(pet) : '');
    msg = ev.options.find((o) => o.id === optionId).apply({ pet, run, rng, loot, hurt, lean, reveal, fragment, codexDone: !fragmentsLeft(run, pet) });
    st.charge = clamp(st.charge);
    st.heat = clamp(st.heat);
    st.sync = clamp(st.sync);
  }
  note(run, msg);
  if (boughtItem && challengeOn(run, 'baremetal')) voidChallenge(run, 'an item was bought.');
  if (st.integrity <= 0 && !insured(pet)) return disconnect(pet, 'integrity collapsed mid-run.');
  if (st.charge <= 0) return disconnect(pet, 'power drained mid-run.');
  return { ok: true, msg };
}

// Kept for older callers: relay decisions go through choose().
export const relayChoice = (pet, choice) => choose(pet, choice === 'out' ? 'out' : 'continue');

function nodesWithin(run, fromId, depth) {
  let frontier = [fromId];
  const out = new Set();
  for (let d = 0; d < depth; d++) {
    frontier = frontier.flatMap((id) => nodeById(run.map, id).edges);
    frontier.forEach((id) => out.add(id));
  }
  return [...out];
}

// Which node types the player can see: visited, adjacent, revealed, plus form sight.
export function visibleNodeIds(pet) {
  const run = pet.run;
  // Blackout: only where it has been and one step ahead; no reveals, no form sight.
  if (run.challenge === 'blackout') return new Set([...run.visited, ...nodeById(run.map, run.pos).edges]);
  const ids = new Set([...run.visited, ...run.revealed, ...nodeById(run.map, run.pos).edges]);
  const form = ability(pet);
  if (form === 'ghost') run.map.nodes.forEach((n) => ids.add(n.id));
  if (form === 'daemon') nodesWithin(run, run.pos, upgraded(pet) ? RUN_CFG.initLookahead : 2).forEach((id) => ids.add(id));
  if (ab2(pet) === 'hidden') run.map.nodes.forEach((n) => ids.add(n.id));
  if (ab2(pet) === 'tuneCorp') nodesWithin(run, run.pos, NR2.ab.sight.tuneCorp[lvl(pet)]).forEach((id) => ids.add(id));
  return ids;
}

function endRun(pet, result) {
  const run = pet.run;
  run.phase = 'done';
  run.result = result;
  // A held pressure state resumes after a jack-out; for a few minutes the bars cannot end it (decided). A failure or an abort gets no window.
  if (result === 'jacked' && NR2.graceMin > 0) pet.graceUntil = pet.ageMin + NR2.graceMin;
  if (result === 'jacked') pet.lastJackOutAge = pet.ageMin;
  if (!run.daily) for (const k of ['charge', 'sync']) if (pet.sideHeld?.[k] && pet.stats[k] < SIDES[k].exit) SIDE_METER.runEndsBelowExit++; // a held state the bars would end the moment the run is over
  if (!run.daily) SIDE_METER.runsInState += Object.values(pet.sideHeld ?? {}).filter(Boolean).length; // pressure states held at the end of a run (the sim runs take no time, so these were held going in)
  if (run.daily) return; // nothing at stake: no cooldown, and not counted among the netling's runs
  if (!REGIONS[run.region].noCooldown) {
    pet.lastRunEndAge = pet.ageMin;
    // A clean clear (out through the front door, no ICE lost) shortens the next cooldown.
    const clean = result === 'jacked' && (run.tally?.iceLost ?? 0) === 0;
    pet.runCooldownCut = clean ? CFG.runCleanCutMin : 0;
  }
  pet.runStats ??= { runs: 0, jacked: 0, disconnected: 0, aborted: 0 };
  pet.runStats.runs++;
  pet.runStats[result]++;
}

export function jackOut(pet) {
  const run = pet.run;
  if (run.daily) {
    note(run, 'jacked out. nothing kept, nothing lost: what the trace cost is given back.');
    endRun(pet, 'jacked');
    return { ok: true, result: 'jacked', kept: [], lost: [], fragments: [], contract: null };
  }
  settleContract(pet, 'jacked');
  const lostInt = (run.startStats?.integrity ?? pet.stats.integrity) - pet.stats.integrity;
  const restored = lostInt > 0 ? Math.round(lostInt * RUN_CFG.jackOutRestore) : 0;
  pet.stats.integrity = clamp(pet.stats.integrity + restored);
  const kept = [];
  const lost = []; // scrapped for scrip: the inventory was full
  for (const item of run.loot) {
    if (grantItem(pet, item).includes('full')) lost.push(item);
    else kept.push(item);
  }
  const scrapped = lost.reduce((n, id) => n + sellValue(id), 0);
  const loose = run.scrip ?? 0;
  const over = addScrip(pet, loose);
  pet.codexFound = (pet.codexFound ?? 0) + run.fragments.length;
  const frags = run.fragments.length;
  const clean = !REGIONS[run.region].noCooldown && (run.tally?.iceLost ?? 0) === 0;
  note(
    run,
    `jacked out with ${kept.length} item${kept.length === 1 ? '' : 's'}` +
      `${frags ? ` and ${frags} fragment${frags === 1 ? '' : 's'}` : ''}.` +
      `${restored ? ` re-synced +${restored} integrity.` : ''}` +
      `${loose ? ` +${loose} scrip.` : ''}` +
      `${lost.length ? ` ${lost.length} scrapped for ${scrapped} scrip: inventory full.` : ''}` +
      `${over || (lost.length && pet.scrip >= SCRIP.max) ? ' scrip full.' : ''}` +
      `${clean ? ` clean clear: uplink cools ${CFG.runCleanCutMin / 60}h faster.` : ''}`,
  );
  // The codex lives outside the pet (shared across generations); main.js drains this inbox into it.
  pet.codexInbox = [...(pet.codexInbox ?? []), ...run.fragments];
  pet.accessoryInbox = [...(pet.accessoryInbox ?? []), ...(run.accessories ?? [])];
  endRun(pet, 'jacked');
  return { ok: true, result: 'jacked', kept, lost, fragments: [...run.fragments], contract: run.contract?.settled ?? null };
}

export function disconnect(pet, why) {
  const run = pet.run;
  const st = pet.stats;
  st.integrity = Math.max(st.integrity, RUN_CFG.rebootIntegrity);
  st.charge = Math.max(st.charge, 5);
  st.sync = clamp(st.sync - RUN_CFG.disconnectSync);
  pet.axes.stability -= 1;
  // A care mistake, but never the fatal one.
  const mistake = !run.daily && pet.careMistakes < CFG.maxMistakes - 1;
  if (mistake) {
    pet.careMistakes++;
    pet.faultRolls = (pet.faultRolls ?? 0) + 1; // 2.0: a bug roll, settled by sim.js on the next step
  }
  settleContract(pet, 'disconnected');
  note(run, run.daily ? `DISCONNECTED: ${why} trace over. nothing lost: what it cost is given back.` : `DISCONNECTED: ${why} loot lost. emergency reboot.${mistake ? ' care mistake logged.' : ''}`);
  run.loot = [];
  run.scrip = 0;
  run.fragments = [];
  run.accessories = [];
  endRun(pet, 'disconnected');
  return { ok: true, result: 'disconnected' };
}

// Bail out: forfeit the loot, no other penalty.
export const abortRun = (pet) => staked(pet, () => abortNow(pet));

function abortNow(pet) {
  settleContract(pet, 'aborted');
  pet.run.loot = [];
  pet.run.scrip = 0;
  pet.run.fragments = [];
  pet.run.accessories = [];
  note(pet.run, 'run aborted. loot abandoned.');
  endRun(pet, 'aborted');
  return { ok: true, result: 'aborted' };
}

// Called after the summary screen: clears the run and writes it to the pet's log.
export function closeRun(pet, t) {
  const run = pet.run;
  if (!run) return;
  const last = run.messages[run.messages.length - 1] ?? '';
  log(pet, t, `> netrun (${REGIONS[run.region].name}): ${last}`);
  pet.run = null;
}

// --- contracts -------------------------------------------------------------------------------------
// A job for one region, posted while the uplink is ready (never during a run, asleep or rebooting). It stays open until
// a jack-in into its region takes it along, or for contractOpenMin. Each kind is met on every route through the map
// (startRun fixes the map): a lost ICE fight or a missed cache on the way never makes one impossible. Missing one costs
// nothing. Posting needs the codex (for fragment jobs), so the UI calls updateContract; the sim never posts one.

export const CONTRACT_KINDS = ['exit', 'clean', 'ice', 'caches', 'market', 'fragment', 'clinic'];

// What each kind needs on every route: { type, count, maxLayer } for the map fix, or null.
const middleLayers = (map) => map.layerCount - 2;
const CONTRACT_ROUTES = {
  ice: (c) => ({ type: 'ice', count: c.n + RUN_CFG.contractIceSpare }),
  caches: (c) => ({ type: 'cache', count: c.n }),
  market: (c, map) => ({ type: 'market', count: 1, maxLayer: Math.ceil(middleLayers(map) * RUN_CFG.contractMarketBy) }),
  clinic: (c, map) => ({ type: 'market', count: 1, maxLayer: Math.ceil(middleLayers(map) * RUN_CFG.contractMarketBy), clinic: true }),
};

// The cheapest items in a weights table (a table of just them), or null.
function cheapestOf(table) {
  const ids = Object.keys(table).filter((id) => SCRIP.price[id] != null);
  if (!ids.length) return null;
  const low = Math.min(...ids.map((id) => SCRIP.price[id]));
  return Object.fromEntries(ids.filter((id) => SCRIP.price[id] === low).map((id) => [id, table[id]]));
}
const CHEAPEST = Object.keys(cheapestOf(Object.fromEntries(Object.keys(SCRIP.price).map((id) => [id, 1]))));

export const contractMinutesLeft = (pet) => (pet.contract ? Math.max(0, RUN_CFG.contractOpenMin - (pet.ageMin - pet.contract.postedAge)) : 0);

// Whether a job could be posted now: alive, awake, not on a run or rebooting, and the uplink ready.
export const contractReady = (pet) =>
  isAlive(pet) && !pet.run && !pet.hibernation && !resting(pet) && rebootMinutesLeft(pet) === 0 && runCooldownLeft(pet) === 0;

// Kinds that can be met in a region right now.
function contractKinds(pet, region, codex) {
  return CONTRACT_KINDS.filter((kind) => {
    if (kind === 'market') return (REGIONS[region].nodes.market ?? 0) > 0 && (pet.scrip ?? 0) >= Math.min(...CHEAPEST.map((id) => SCRIP.price[id]));
    if (kind === 'fragment') return codexRoom(pet) > 0 && nextFragment(region, codex, pet.rootAccess) !== null;
    if (kind === 'clinic') return pet.bugs > 0 && (REGIONS[region].nodes.market ?? 0) > 0;
    return true;
  });
}

// Called by the UI while the app is open: expires an old job, and may post a new one (contractChancePerHour, counting
// the netling minutes since the last call, at most contractCatchUpMin). Returns 'posted', 'expired' or null.
export function updateContract(pet, rng, codex = [], t = Date.now()) {
  const since = Math.min(RUN_CFG.contractCatchUpMin, Math.max(0, pet.ageMin - (pet.contractCheckAge ?? pet.ageMin)));
  pet.contractCheckAge = pet.ageMin;
  if (pet.contract && contractMinutesLeft(pet) === 0) {
    pet.contract = null;
    log(pet, t, '> the contract lapsed. no harm done.');
    return 'expired';
  }
  if (pet.contract || !contractReady(pet)) return null;
  let roll = false;
  const perHour = RUN_CFG.contractChancePerHour * (pet.bugs > 0 ? RUN_CFG.contractBuggedMult : 1);
  for (let i = 0; i < since && !roll; i++) roll = rng() < perHour / 60;
  if (!roll) return null;
  const regions = REGION_ORDER.filter((r) => regionOpen(r, pet.stage, codex, pet.cleared ?? []));
  if (!regions.length) return null;
  const region = regions[Math.floor(rng() * regions.length)];
  const kinds = contractKinds(pet, region, codex);
  // A bugged netling is mostly offered the clinic job; otherwise (or when no clinic job fits) any other kind.
  const others = kinds.filter((k) => k !== 'clinic');
  const kind = kinds.includes('clinic') && rng() < RUN_CFG.clinicContractChance ? 'clinic' : others[Math.floor(rng() * others.length)];
  const range = kind === 'ice' ? RUN_CFG.contractIce : kind === 'caches' ? RUN_CFG.contractCaches : null;
  const n = range ? range[0] + Math.floor(rng() * (range[1] - range[0] + 1)) : undefined;
  const item = rng() < RUN_CFG.contractItemChance ? CHEAPEST[Math.floor(rng() * CHEAPEST.length)] : null;
  pet.contract = { kind, region, ...(n ? { n } : {}), scrip: RUN_CFG.contractScrip[kind], item, postedAge: pet.ageMin };
  log(pet, t, `> contract posted: ${contractText(pet.contract)}. pays ${contractPay(pet.contract)}.`);
  return 'posted';
}

export function contractText(c) {
  const where = REGIONS[c.region].name;
  switch (c.kind) {
    case 'exit':
      return `reach the exit of the ${where}`;
    case 'clean':
      return `reach the exit of the ${where} without losing to ICE`;
    case 'ice':
      return `get past ${c.n} ICE in the ${where}`;
    case 'caches':
      return `crack ${c.n} caches in the ${where}`;
    case 'market':
      return `buy something at a ${where} market`;
    case 'clinic':
      return `get a bug fixed at a ${where} clinic`;
    default:
      return `bring back a codex fragment from the ${where}`;
  }
}
export const contractPay = (c) => `${c.scrip} scrip${c.item ? ` and a ${ITEMS[c.item].name.toLowerCase()}` : ''}`;

// Progress on the run's contract: { have, need } (ICE passed counts wins and slips).
export function contractProgress(run) {
  const c = run?.contract;
  if (!c) return null;
  const t = run.tally ?? {};
  const atExit = nodeById(run.map, run.pos)?.type === 'exit';
  switch (c.kind) {
    case 'ice':
      return { have: (t.iceWon ?? 0) + (t.icePhased ?? 0), need: c.n };
    case 'caches':
      return { have: t.caches ?? 0, need: c.n };
    case 'market':
      return { have: t.bought ?? 0, need: 1 };
    case 'clinic':
      return { have: t.fixed ?? 0, need: 1 };
    case 'fragment':
      return { have: run.fragments.length, need: 1 };
    case 'clean':
      return { have: atExit && !t.iceLost ? 1 : 0, need: 1, broken: (t.iceLost ?? 0) > 0 };
    default:
      return { have: atExit ? 1 : 0, need: 1 };
  }
}

// A short line for the run screen: the job and how far along it is.
export function contractShort(run) {
  const p = contractProgress(run);
  if (!p) return null;
  const c = run.contract;
  const label = { ice: 'PAST ICE', caches: 'CACHES', market: 'BUY', fragment: 'FRAGMENT', clinic: 'FIX A BUG' }[c.kind];
  if (label) return `JOB ${label} ${Math.min(p.have, p.need)}/${p.need}`;
  if (p.broken) return 'JOB LOST: ICE';
  return c.kind === 'clean' ? 'JOB EXIT, NO ICE LOST' : 'JOB REACH EXIT';
}

// At the end of a run: a met contract adds its pay to the run's scrip and loot (banked with them), before banking.
function settleContract(pet, result) {
  const run = pet.run;
  const c = run.contract;
  if (!c || c.settled) return;
  const p = contractProgress(run);
  if (result !== 'jacked') {
    c.settled = 'void';
    return;
  }
  if (p.have < p.need) {
    c.settled = 'missed';
    note(run, 'contract not met. no harm done.');
    return;
  }
  c.settled = 'met';
  run.scrip = (run.scrip ?? 0) + c.scrip;
  if (c.item) run.loot.push(c.item);
  note(run, `contract complete: +${contractPay(c)}.`);
}


// 2.0 (nr2.js): the tier of an ICE fight. 1 or 2. The daily trace rolls it from the node alone, so everyone meets the same fight.
function rollTier(run, nodeId, rng) {
  const share = tierShare(run.region);
  if (!share) return 1;
  const r = run.daily ? seededRoll(run.seed, nodeId * 8 + 4, 0) : rng();
  return r < share ? 2 : 1;
}

// Light extra costs of each egg's own problem in a run (nr2.js, decided as light; sizes are mine).
function lostFightCost(pet, run, rng) {
  const egg = eggOf(pet);
  const st = pet.stats;
  if (egg === 'program' && st.charge >= SIDES.charge.hi) st.integrity = clamp(st.integrity - NR2.cost.programLostFightBleed);
  if (egg === 'wetware' && !pet.virus && rng() < NR2.cost.wetwareLostFightInfect) infect(pet, 4);
}

// The forced filled cache (Feast corp, elder level): when the run reaches the layer before the halfway layer, one node in the next layer
// becomes a filled cache. May displace any node but the exit (and, with relaySafe, the relay).
function forceCache(pet, run, node, rng) {
  if (!NR2.abilities || !NR2.ab.forcedCacheForms.includes(ab2(pet)) || lvl(pet) < 2) return;
  if ((run.forced ?? 0) >= NR2.forcedCache.perRun) return;
  const region = REGIONS[run.region];
  if (node.layer !== Math.ceil(region.layers / 2) - 1 || node.layer < 1) return;
  const next = nodeById(run.map, run.pos).edges.map((id) => nodeById(run.map, id)).filter((n) => n.type !== 'exit' && n.type !== 'cache' && !(NR2.forcedCache.relaySafe && n.type === 'relay'));
  if (!next.length) return;
  const pick = next[Math.floor(rng() * next.length)];
  pick.type = 'cache';
  pick.filled = true;
  run.forced = (run.forced ?? 0) + 1;
  run.tally.forced = (run.tally.forced ?? 0) + 1;
  note(run, 'a cache lights up ahead.');
}
