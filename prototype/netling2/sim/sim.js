// Netling 2.0 simulation core: a fork of src/sim.js carrying the 2.0 core life rules from docs/NETLING_2_SKETCH.md. It is a
// prototype (not shipped, not in sw.js); src/sim.js is untouched. Differences from 1.0, each marked `2.0` below:
//   Standing   two non-negative tracks (s.standing) replace the signed allegiance.
//   Temper     s.temper replaces stability: 24 hour half-life decay, five levels with the flicker guard (s.tLevel),
//              flow +0.5 an hour, items +1, Segfault -4.
//   Bugs       a fault rolls a bug (ceiling 5) that raises the drains; cleared with scrip or Standing (clearBug).
//   Faults     no cap and no neglect death; integrity collapse and the end of the cycle remain.
//   Evolution  teen and adult forms follow Standing (fractions against whole-number cutpoints) and the games, with the sketch's tie-break weights.
//   Care preferences  a steady temper likes routine, an unsteady one novelty (a small Sync bonus).
// Netrun code (netrun/run.js here) still writes the signed `axes` pair; `axes` is an adapter onto standing and temper.
// Pure-ish: every function takes the state, a time (ms epoch) and an rng, so tests can drive it deterministically.
import { NR2 } from './netrun/nr2.js';
import { accessoryById, rollWornAccessory } from '../../../src/accessories.js';
import { weighted } from '../../../src/random.js';
import { clearedForStage } from '../../../src/netrun/regions.js';
import { challengeOn, voidChallenge } from '../../../src/netrun/challenges.js';
import { chatterPool, visitorLines } from '../../../src/chatter.js';
import { guardedLevel } from '../tell.js';
import { neglectLevel } from '../needs.js';

export const MIN = 60_000;
export const SAVE_VERSION = 2;

export const CFG = {
  bootMinutes: 3,
  drainPerHour: { charge: 15.4, sync: 13.2 },
  // Charge and Sync drain faster the fuller they are: the rate above is scaled from `empty` at 0 to
  // `full` at 100. Topping up often means more to do; a stat left low eases off, so long gaps
  // (a work day, the night) still cost faults without being fatal.
  drainCurve: { empty: 0.39, full: 2 },
  sleepDrainMult: 0.5, // asleep with the lights on: restless
  sleepDarkDrainMult: 0.33, // asleep in the dark: real rest
  // Naps: a short rest on demand. Drains slow down but time still passes; a cooldown stops
  // back-to-back naps from covering the whole day.
  napDrainMult: 0.35,
  napMaxMin: 120,
  napCooldownMin: 240,
  heatDriftPerHour: 3,
  heatCoolWhileAsleepPerHour: 10,
  cacheChancePerMin: 1 / 150, // only while digesting (recently fed) and awake
  digestMinutes: 240,
  maxCache: 4,
  virusBasePerHour: 0.02,
  virusPerCachePerHour: 0.03,
  mistakeGraceMin: 15,
  lightsGraceMin: 60, // it's asleep with the lights on for this long before it counts
  darkAwakeSyncMult: 2, // lights off while it's awake: bored in the dark
  // Stability moves on choices, not the clock: plain awake time adds nothing (it once added 0.1/hr, which handed
  // careful players Daemon by default). Flow, overclocking, quick fixes and faults move it.
  uptimeTemperPerHour: 0,
  faultTemper: 1, // each care mistake leans it unstable this much (was 2: Glitch came mostly from neglect)
  feedStanding: 0.25, // 2.0: CORP PKT adds this to corp Standing and SCAV DATA to street (1.0: 0.75 of allegiance)
  // Overclocked: Heat at or above this. Mini-games and ICE run slower, wins drop items more often, but a lost
  // game costs Sync and Integrity, lost ICE bites harder and events come more often. Awake time overclocked
  // leans it unstable (Glitch); time in flow leans it stable (Daemon). 85+ keeps its own harms on top.
  overclockHeat: 65,
  overclockGameSpeed: 0.85,
  overclockDropMult: 1.5,
  overclockLoseSync: -6, // replaces the usual +8 for a lost game
  overclockLoseIntegrity: 4,
  overclockIceDamageMult: 1.5,
  overclockEventMult: 1.25,
  overclockTemperPerHour: -0.2,
  flowTemperPerHour: 0.5, // 2.0: 1.0 had 0.2; overclocking is far easier to reach than flow, so flow pays more
  flowEventMult: 0.75, // calm: in flow, trouble comes less often (the mirror of overclockEventMult)
  // Either state draws visitors: a hot netling is fun to play with, a calm one is good company. This also
  // makes up for the visit rolls an open event blocks.
  overclockVisitMult: 1.25,
  flowVisitMult: 1.25,
  maxMistakes: Infinity, // 2.0: no fault cap and no neglect death (1.0: 10)
  flatlineIntegrityMin: 120,
  // A five-day life. Each netling keeps the lengths it compiled with (s.life), so a change here
  // never shortens one that is already alive.
  lifespanMin: 5 * 24 * 60,
  teenAtMin: 17 * 60,
  adultAtMin: 51 * 60,
  // The Mainframe stage (docs/SIMULATION.md). An adult recompiles into its line's mainframe form once it is home, has
  // lived into its last ordinary day, has proved itself in The Deep this life (three exits, or two clean ones), and its
  // line has Root Access; it gains a day of life and passes its trait on at level II or higher. false hides the stage,
  // the Source and everything that belongs to them (tests and the balance tools use it).
  mainframe: true,
  mainframeBeforeEndMin: 24 * 60,
  mainframeBonusMin: 24 * 60,
  mainframeExits: 3,
  mainframeCleanExits: 2,
  mainframeTraitLevel: 2,
  rootMid: true, // 2.0 (decided): Root Access arrives the moment the codex is complete, mid-life, as in the game (the 1.0 balance tool granted it to the next netling)
  featFor: null, // see mainframeFeat
  // 2.0 evolution. The hidden-path teen needs this many wins in every game and the two Standing tracks within
  // hiddenBand (the true gap between the fractional tracks). Choices (Standing lean, role) are weighted by the gap to the leader:
  // tieWeights[whole part of the gap],
  // the last entry for any larger gap. A form never raised weighs newFormWeight more.
  shellMinWinsEach: 3,
  hiddenBand: 1,
  tieWeights: [4, 4, 3, 2, 1, 0],
  newFormWeight: 1.2,
  // 2.0 temper: one hidden number with a 24 hour half-life, shown as five levels (../tell.js).
  temperHalfLifeMin: 24 * 60,
  // 2.0 care preferences (hidden): a match on feed or play gives Sync.
  prefMild: 2,
  prefStrong: 4,
  // Hibernation: a long pause that freezes the clock. Minimum stay and cooldown keep it for
  // vacations, not for skipping a work day.
  hibernateMinMin: 24 * 60,
  hibernateCooldownMin: 3 * 24 * 60,
  sleepStart: 22,
  sleepEnd: 7,
  ghostMinGameWins: 29, // the hidden adult: this many wins in all (a boosted win counts 2) and ghostMinWinsEach in every game
  ghostMinWinsEach: 4,
  playWinSync: 25,
  playLoseSync: 8,
  // Packet Feast: it ate, so it gets some Charge too (digestion isn't reset: no cache files).
  feastWinCharge: 10,
  feastLoseCharge: 3,
  traceChancePerHour: 0.08,
  traceWindowMin: 120,
  traceIgnoredIntegrity: 15,
  traceIgnoredStanding: 1, // corp
  // COMPLY costs Sync only: it used to cost Integrity too, so a player protecting Integrity always hid and leaned indie.
  // HIDE costs Charge and Heat, so each answer costs about as much, in a different stat.
  complySync: 10,
  surgeChancePerHour: 0.03,
  // Virus attack: an intrusion to DEFEND against (a mini-game) before it lands.
  attackChancePerHour: 0.04,
  attackWindowMin: 60,
  attackLandedIntegrity: 10,
  attackRepelledTemper: 1,
  // Memory overflow: PURGE before the buffers burst, or it crashes and reboots.
  overflowChancePerHour: 0.02,
  overflowPerCachePerHour: 0.02, // each cache file makes it likelier
  overflowWindowMin: 45,
  overflowCrashIntegrity: 15,
  rebootMin: 20,
  // Integrity recovers whenever nothing is wrong, faster while it rests in the dark or naps.
  // From 0 to 100 with nothing wrong: 20 hours awake, 12.5 in dark sleep or naps. Across a day with the lights off at
  // night that measured 14.6 to 17.8 hours before any care action (COOL, PURGE and PATCH add more).
  integrityRegenPerHour: 5,
  integrityRestRegenPerHour: 8,
  careIntegrity: 4, // COOL, and PURGE with something to purge (PATCH already restores 10)
  // A stray netling drops by to play: awake only, no response needed. GREET is optional.
  visitChancePerHour: 0.06,
  visitMinMin: 10,
  visitMaxMin: 20,
  visitSync: 15,
  visitHeat: 10,
  visitItemChance: 0.1,
  visitAccessoryChance: 0.01,
  visitGreetedAccessoryChance: 0.05, // GREET makes a stylish gift likelier
  visitWearsAccessoryChance: 0.75, // most visitors show off something from the wider net
  visitSecondAccessoryChance: 0.5, // and half of those a second, from another slot
  // Friends' visitor cards (docs/ATTENTION.md): queued, then one drops by within about the hour, as soon as it is free.
  friendQueueMax: 3,
  friendChancePerMin: 1 / 30,
  friendWaitMaxMin: 60,
  // Attention rewards (see docs/ATTENTION.md): nothing here costs a fault when missed.
  // Requests: now and then it asks for one game, or for COOL when warm.
  bugNagPerHour: 0.15, // 2.0: while it has bugs and is idle, now and then it says so (the chatter rate)
  requestChancePerHour: 0.25,
  requestWindowMin: 45,
  requestMinCharge: 20, // it only asks for a game it has the Charge to play
  requestCoolHeat: 30, // and for COOL only when COOL would work
  // Flow: kept in good shape this long, awake, it glows, leans stable faster (flowStabilityPerHour) and draws
  // fewer events (flowEventMult).
  flowAfterMin: 180,
  flowMinStat: 50, // Charge and Sync
  flowMinIntegrity: 80,
  flowMaxHeat: 60,
  // Chatter: a line it mutters, shown this long.
  chatterChancePerHour: 0.15,
  chatterShowMin: 20,
  // Netrun uplink cooldown by stage, cut by clean jack-outs and Bypass chips (id `overclock`), never below the floor:
  // any sooner and corp sweeps pick up the trail.
  runCooldownMin: { baby: 240, teen: 210, adult: 180, mainframe: 180 },
  runCooldownFloorMin: 120,
  runCleanCutMin: 60,
  overclockCutMin: 60,
};

// Timed events: what the alert bar calls them and how long there is to respond.
export const EVENTS = {
  trace: { label: 'CORP TRACE', window: 'traceWindowMin' },
  attack: { label: 'INTRUSION', window: 'attackWindowMin' },
  overflow: { label: 'MEMORY OVERFLOW', window: 'overflowWindowMin' },
};

export const GAME_IDS = ['breach', 'dodge', 'tune', 'feast'];

// 2.0 inventory experiments (INV='{"slots":8,"stack":2,"scrap":0.5}'): slots, how many of one kind share a slot, and the share of price a full-inventory scrap pays.
export const INV = { slots: 6, stack: NR2.inventory ? NR2.inv.stack : 1, ...(process.env.INV ? JSON.parse(process.env.INV) : {}) };
export const INVENTORY_SLOTS = INV.slots;
// Slots a list of items takes: one per `stack` of a kind.
export const slotsUsed = (inv) => {
  const counts = {};
  for (const id of inv) counts[id] = (counts[id] ?? 0) + 1;
  return Object.values(counts).reduce((n, c) => n + Math.ceil(c / INV.stack), 0);
};
export const hasRoom = (inv, id) => slotsUsed([...inv, id]) <= INVENTORY_SLOTS;
export const ITEM_CFG = {
  winDropChance: 0.25,
  hideDropChance: 0.3,
  complyDropChance: 0.3,
  shieldMinutes: 360,
  blackIceVirusChance: 0.25,
  // Segfault: faults on purpose (they count like any other, so ten still end its life).
  segfaultFaults: 2,
  // A Segfault can shake loose after a DEFEND, a contained overflow, or a power surge.
  eventSegfaultChance: 0.1,
};

// awake: can only be used while it's awake.
export const ITEMS = {
  coolant: { name: 'Coolant cell', desc: 'Instantly vents 50 Heat. Works while asleep.' },
  antivirus: { name: 'Antivirus patch', desc: 'Cures any virus and shields against new ones for 6h.' },
  voucher: { name: 'Corp voucher', desc: 'Full Charge, and waves off the current or next corp trace. Leans corp.' },
  blackice: { name: 'Black ICE shard', desc: '+40 Sync, +20 Heat, may carry a virus. Leans indie and unstable.', awake: true },
  booster: { name: 'Signal booster', desc: 'Your next mini-game win counts double.', awake: true },
  memory: { name: 'Memory shard', desc: 'Rewrites one of its quirks at random.' },
  repair: { name: 'Repair kit', desc: 'Restores 40 Integrity. Works while asleep.' },
  overclock: { name: 'Bypass chip', desc: 'Cuts 1h off the netrun uplink cooldown (never below 2h).' },
  segfault: { name: 'Segfault', desc: 'Crashes it on purpose: +2 faults. Faults shape how it grows up, and ten end its life.', awake: true },
  // 2.0 (docs/NETLING_2_PERKS_TRAITS_DRAFTS.md): drop tables and stock list them only with PERKS.on.
  decoy: { name: 'Decoy', desc: 'Waves off the current or next intrusion. Leans indie.' },
  salvage: { name: 'Salvage cell', desc: '+50 Charge, may carry a virus. Leans indie.' },
};

// Corpo scrip: a netling's money, spent with Charge at netrun markets. Prices follow rarity.
export const SCRIP = {
  max: 100, // anything over the cap is lost, so spending stays a choice
  inherit: 0.5, // the next generation starts with half, rounded down
  sellMarket: 0.5, // selling at a netrun market pays half the price
  sellElsewhere: process.env.INV && JSON.parse(process.env.INV).scrap !== undefined ? JSON.parse(process.env.INV).scrap : 0.25, // scrapping at home, or a pickup that meets a full inventory, a quarter
  price: { coolant: 15, antivirus: 15, repair: 15, booster: 15, memory: 15, blackice: 25, voucher: 25, segfault: 25, overclock: 50, decoy: 25, salvage: 15 },
};

export const sellValue = (id, atMarket = false) => Math.floor((SCRIP.price[id] ?? 0) * (atMarket ? SCRIP.sellMarket : SCRIP.sellElsewhere));

// Adds scrip up to the cap. Returns how much went over it and was lost.
export function addScrip(s, n) {
  const before = s.scrip ?? 0;
  s.scrip = Math.min(SCRIP.max, before + n);
  return before + n - s.scrip;
}

// 2.0 extra drops (PERKS.on): Decoy mostly from HIDE, Salvage cell mostly from wins.
const PERK_DROPS = { win: { decoy: 1, salvage: 2 }, hide: { decoy: 2, salvage: 1 }, comply: {}, visit: {} };
// Weighted drop tables per source.
const DROPS = {
  win: { coolant: 3, antivirus: 2, booster: 2, blackice: 2, repair: 2, memory: 1, overclock: 1, segfault: 1 },
  hide: { blackice: 2, memory: 1, coolant: 1, overclock: 1, segfault: 1 },
  comply: { voucher: 3, antivirus: 1, repair: 1 },
  visit: { coolant: 2, booster: 2, repair: 2, memory: 1, overclock: 1 },
};

// 2.0: the adult forms are role x lean plus the hidden form (ids are placeholders: names depend on the egg, and the
// dynamics here are the same for all three). Traits, keepsakes, perks and run abilities of 2.0 forms are undesigned,
// so they are empty: the forms differ only in how they are reached.
export const ROLES = ['breach', 'dodge', 'tune', 'feast'];
export const LEANS = ['corp', 'street'];
const cap1 = (x) => x[0].toUpperCase() + x.slice(1);
export const roleForm = (role, lean) => `${role}${cap1(lean)}`;
const ADULTS = ROLES.flatMap((r) => LEANS.map((l) => roleForm(r, l)));
// 2.0 perks, traits and keepsakes (docs/NETLING_2_PERKS_TRAITS_DRAFTS.md): off unless PERKS=1 (or PERKS.on is set), so every earlier table
// stays reproducible. Perks are by role and lean, traits by role (hidden has its own), keepsakes one per form.
export const PERKS = { on: process.env.PERKS === '1' };
const TRAIT_OF = { breach: 'hardened', dodge: 'evasive', tune: 'persistent', feast: 'foraging' };
const traitFor = (f) => (f === 'hidden' ? 'untraceable' : TRAIT_OF[ROLES.find((r) => f.startsWith(r))]);
const KEEP = { breachStreet: 'antivirus', breachCorp: 'repair', dodgeCorp: 'overclock', dodgeStreet: 'decoy', tuneCorp: 'coolant', tuneStreet: 'booster', feastCorp: 'voucher', feastStreet: 'salvage', hidden: 'memory' };
export const KEEPSAKES = new Proxy({}, { get: (_, f) => (PERKS.on ? KEEP[f] : undefined) });
export const FORMS = Object.fromEntries([...ADULTS, 'hidden'].map((f) => [f, { name: cap1(f), get trait() { return PERKS.on ? traitFor(f) : null; } }]));

// Every body a netling can have. Adult forms also appear in FORMS.
export const SPECIES = {
  baby: { name: 'Baby', stage: 'baby' },
  teenCorp: { name: 'TeenCorp', stage: 'teen' },
  teenStreet: { name: 'TeenStreet', stage: 'teen' },
  teenHidden: { name: 'TeenHidden', stage: 'teen' },
  ...Object.fromEntries([...ADULTS, 'hidden'].map((f) => [f, { name: cap1(f), stage: 'adult' }])),
  // Elders (the Mainframe stage of 1.0): one per adult, same gate as 1.0.
  ...Object.fromEntries([...ADULTS, 'hidden'].map((f) => [`${f}Elder`, { name: `${cap1(f)}Elder`, stage: 'mainframe', line: f }])),
};

// The adult form a body belongs to: itself for an adult, its line for an elder (and itself for anything else).
export const lineOf = (form) => SPECIES[form]?.line ?? form;
// Each adult form's elder.
export const MAINFRAME_OF = Object.fromEntries(Object.entries(SPECIES).filter(([, x]) => x.line).map(([id, x]) => [x.line, id]));
export const isMainframeForm = (form) => SPECIES[form]?.stage === 'mainframe';

// In-life perks of each adult form (separate from inherited traits). The 2.0 set (PERKS.on) is PERK_MODS.
export const FORM_MODS = {};
export const PERK_MODS = {
  breachStreet: { virusMult: 0.7 }, // infection chance -30% (per hour and from scavenged data)
  breachCorp: { cureBonus: 10 }, // the cure restores 10 more Integrity
  dodgeCorp: { traceMult: 0.7 }, // corp traces 30% less often
  dodgeStreet: { attackMult: 0.7 }, // intrusions 30% less often
  tuneCorp: { chargeDrainMult: 0.8 },
  tuneStreet: { syncDrainMult: 0.8 },
  feastCorp: { corpSync: 5, scavSync: -5 }, // Chrome's: loves corp packets, sulks at scavenged data
  feastStreet: { scavVirusMult: 0.5 }, // the infection roll on scavenged data halved
  hidden: { chargeDrainMult: 0.85, syncDrainMult: 0.85 },
};

const mod = (s, key, fallback = 1) => (PERKS.on ? PERK_MODS[lineOf(s.form)]?.[key] : undefined) ?? FORM_MODS[lineOf(s.form)]?.[key] ?? fallback;

export const isAlive = (s) => s.stage !== 'script' && s.stage !== 'dead';
// Asleep for the night, or napping: either way it rests and can't eat, play or run.
export const resting = (s) => s.asleep || Boolean(s.nap);

export const TRAITS = {
  licensed: { name: 'Licensed', desc: 'Corp packets restore more Charge' },
  hardened: { name: 'Hardened', desc: 'Catches viruses less often' },
  persistent: { name: 'Persistent', desc: 'Drains slower while it rests' },
  volatile: { name: 'Volatile', desc: 'Bigger play rewards, but Integrity drains faster' },
  untraceable: { name: 'Untraceable', desc: 'Corp traces find it less often' },
  // 2.0 (PERKS.on): Dodge's trait and Feast's, which generalises Licensed so it does not steer Standing.
  evasive: { name: 'Evasive', desc: 'Alarms give it more time to answer' },
  foraging: { name: 'Foraging', desc: 'Packets restore more Charge' },
};

// Trait strength (unchanged from 1.0; no 2.0 form carries a trait yet, so these are all zero unless a test sets one).
export const TRAIT_CFG = {
  history: 0.5,
  levelStep: 0.25,
  maxLevel: 3,
  full: { licensed: 0.25, hardened: 0.5, persistent: 0.3, volatile: 0.5, untraceable: 0.6, evasive: 0.25, foraging: 0.25 },
  volatileIntegrity: 0.75,
  cap: { licensed: 1.5, hardened: PERKS.on ? 1.25 : 1.5, persistent: 1.25, volatile: 1.25, untraceable: 1.25, evasive: 1.25, foraging: 1.5 }, // 2.0 (decided, maintainer): Hardened capped at 1.25 like the others
};

export const levelStrength = (level) => 1 + TRAIT_CFG.levelStep * (Math.min(Math.max(level ?? 1, 1), TRAIT_CFG.maxLevel) - 1);

export function traitStrength(s, id) {
  let st = 0;
  if (s.trait === id) st += levelStrength(s.traitLevel);
  if (s.history === id) st += TRAIT_CFG.history;
  return Math.min(st, TRAIT_CFG.cap[id] ?? st);
}

export const traitLabel = (id, level = 1) => (id ? `${TRAITS[id].name}${level > 1 ? ` ${['', 'I', 'II', 'III', 'IV', 'V'][level] ?? level}` : ''}` : null);

const traitEffect = (s, id) => TRAIT_CFG.full[id] * traitStrength(s, id);

export const PALETTES = [
  { name: 'ice', main: '#05d9e8', accent: '#ff2a6d' },
  { name: 'neon', main: '#ff2a6d', accent: '#05d9e8' },
  // `mark` is the color of the sprite's small highlight marks (nose, cheeks, teeth; '+' in the art), white unless the body is so
  // light that white disappears: by luminance, white on acid is 1.1:1, on origin 1.1:1 and on toxic 1.2:1 (2 to 3.3 elsewhere).
  // Toxic's accent (its eyes) was cyan on bright green, 1.3:1; the deeper teal is 2.7:1 and still reads on the dark screen (4.5:1).
  { name: 'acid', main: '#f9f002', accent: '#ff2a6d', mark: '#2b1b5a' },
  { name: 'toxic', main: '#39ff14', accent: '#0891b2', mark: '#2b1b5a' },
  { name: 'ultra', main: '#b967ff', accent: '#f9f002' },
  // NL-0's colors: only rolls for netlings compiled with root access.
  { name: 'origin', main: '#e8e8ff', accent: '#b967ff', mark: '#2b1b5a' },
];
const BASE_PALETTES = PALETTES.length - 1;

export const IDLES = ['bounce', 'sway', 'hover'];
export const PACKETS = ['corp', 'scav'];
export const QUIRK_KEYS = ['palette', 'pitch', 'idle', 'favPacket', 'sleepOffset'];

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];
const clamp = (v, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v));

export function rollQuirk(rng, { origin = false } = {}) {
  return {
    palette: Math.floor(rng() * (origin ? PALETTES.length : BASE_PALETTES)),
    pitch: 440 + Math.round(rng() * 440),
    idle: pick(IDLES, rng),
    favPacket: pick(PACKETS, rng),
    sleepOffset: Math.floor(rng() * 5) - 2,
  };
}

// The seven-day life every netling had before lives were shortened; saves without s.life get it.
export const LEGACY_LIFE = { teenAt: 24 * 60, adultAt: 72 * 60, lifespan: 7 * 24 * 60 };
const lifeFromCfg = () => ({ teenAt: CFG.teenAtMin, adultAt: CFG.adultAtMin, lifespan: CFG.lifespanMin });

// When a life ends: its own lifespan, plus the day a mainframe gains (s.lifeBonus).
export const lifeEnd = (s) => s.life.lifespan + (s.lifeBonus ?? 0);
// The Mainframe gate. The age half: the start of the last ordinary day. The feat: this life's exits from The Deep
// (s.deepExits, counted by run.js at jack-out), three of them or two clean ones.
export const mainframeAt = (s) => s.life.lifespan - CFG.mainframeBeforeEndMin;
// 2.0: the feat gets easier with every elder the account has (decided in principle; the tiers are in lineage-sweep.mjs). CFG.featFor(s), when set,
// returns [exits, clean] for this netling; otherwise the first-elder feat of CFG.mainframeExits and CFG.mainframeCleanExits.
export const mainframeFeat = (s) => {
  const [exits, clean] = CFG.featFor ? CFG.featFor(s) : [CFG.mainframeExits, CFG.mainframeCleanExits];
  return (s.deepExits?.all ?? 0) >= exits || (s.deepExits?.clean ?? 0) >= clean;
};
// Whether it would recompile now (whether or not the stage is switched on): an adult, home, old enough, feat met,
// with Root Access earned.
// Root Access must have been earned in this line (NL-0 watches it, or rests after a rescue): the stage is NL-0's to open.
export const rootEarnedIn = (s) => Boolean(s.rootAccess || s.rootCooling);
export const mainframeDue = (s) => s.stage === 'adult' && !s.run && s.ageMin >= mainframeAt(s) && mainframeFeat(s) && rootEarnedIn(s);

// A new generation: fresh quirk, with one quirk key copied from the fragment.
// newForms: adult forms the player has never raised; they win ties a little more often.
// rootAccess: the codex is complete, so NL-0 watches over this generation,
// unless NL-0 spent itself rescuing the previous one: then it rests for a generation.
// nl0Rests: the ending has played (ending.js), so NL-0 speaks in its sleep. Wording only.
export function createScript({ now, generation = 1, fragment = null, rng = Math.random, rootAccess = false, newForms = [], friends = [], nl0Rests = false }) {
  const rootCooling = rootAccess && Boolean(fragment?.rootUsed);
  if (rootCooling) rootAccess = false;
  const quirk = rollQuirk(rng, { origin: rootAccess || rootCooling });
  let inheritedQuirk = null;
  if (fragment?.quirk) {
    inheritedQuirk = pick(QUIRK_KEYS, rng);
    quirk[inheritedQuirk] = fragment.quirk[inheritedQuirk];
  }
  const s = {
    saveVersion: SAVE_VERSION,
    generation,
    life: lifeFromCfg(),
    newForms: newForms.filter((f) => FORMS[f]),
    stage: 'script',
    form: 'baby',
    teenForm: null,
    evolvedAt: null,
    bornAt: now,
    lastTick: now,
    ageMin: 0,
    stats: { charge: 70, sync: 70, integrity: 100, heat: 20 },
    cache: 0,
    virus: false,
    virusMin: 0,
    sinceFed: CFG.digestMinutes,
    asleep: false,
    nap: null,
    lastNapEndAge: null,
    rebootUntilAge: null,
    lightsOn: true,
    careMistakes: 0,
    bugs: BUG_CFG.startBugs ?? 0, // 2.0: persistent glitches, raised by faults, cleared at a clinic (startBugs: an experiment knob)
    faultRolls: 0, // 2.0: bug rolls owed for faults outside tick (netrun disconnects); settled on the next step
    standing: { corp: 0, street: 0 }, // 2.0
    temper: 0, // 2.0
    tLevel: 0, // 2.0: the shown temper level (-2..2) after the flicker guard
    lastGames: [], // 2.0 care preferences: the last two distinct games
    lastPacket: null,
    zeroMin: { charge: 0, sync: 0, heat: 0, lights: 0 },
    flagged: { charge: false, sync: false, heat: false, lights: false },
    integrityZeroMin: 0,
    games: freshGames(),
    event: null,
    lastSurgeAt: null,
    inventory: fragment?.keepsake ? [fragment.keepsake] : [],
    buffs: { shieldUntilAge: 0, traceSkip: false, attackSkip: false, boost: false },
    run: null,
    rootAccess,
    rootUsed: false,
    rootCooling,
    lastRunEndAge: null,
    runCooldownCut: 0,
    visit: null,
    visitAccGifts: 0,
    nl0Rests,
    friends, // friends' visitor cards on their way: [{ id, form, palette, accessories, gen, deep, root, below, at }]
    request: null, // { kind: 'game' | 'cool', game?, startedAge }
    contract: null, // an open netrun job: { kind, region, n?, scrip, item, postedAge } (netrun/run.js)
    contractCheckAge: null, // the netling minute the UI last looked at posting one
    wokeAt: null, // when it last woke from the night's sleep (not a nap or hibernation)
    deepExits: { all: 0, clean: 0 }, // exits from The Deep this life, and the clean ones (the Mainframe gate)
    lifeBonus: 0, // minutes of life gained (a mainframe's extra day)
    flowMin: 0, // minutes in a row in good shape, awake
    hot: false, // overclocked as of the last step, so crossing the line is logged once
    hotTotalMin: 0, // awake minutes overclocked this life (the Heatwave effect counts these across lives)
    flowTotalMin: 0, // minutes spent in flow this life
    chatter: null, // { id, startedAge }: the line on screen
    runStats: { runs: 0, jacked: 0, disconnected: 0, aborted: 0 },
    cleared: [], // regions whose exit it has reached, which opens the next one down
    codexFound: 0, // new codex fragments recovered this life (capped by RUN_CFG.codexPerLife)
    scrip: Math.min(SCRIP.max, fragment?.scrip ?? 0),
    zone: deviceZone(now), // the time zone its sleep follows; refreshed each time it wakes
    trait: fragment?.trait ?? null,
    traitLevel: fragment?.trait ? Math.min(Math.max(fragment.level ?? 1, 1), TRAIT_CFG.maxLevel) : 1, // generations in a row as that form
    history: fragment?.trait ? (fragment.history ?? null) : null, // the grandparent's trait, at half strength
    inheritedQuirk,
    quirk,
    log: [
      { t: now, msg: `> compiling netling.v${generation}.0 ...` },
      ...(rootCooling ? [{ t: now, msg: nl0Rests ? '> NL-0 (asleep): i reached for the last one in my sleep. be careful with this one.' : '> NL-0: i reached for the last one. i need to rest. be careful with this one.' }] : []),
    ],
    deathCause: null,
    diedAt: null,
    fragment: null,
  };
  attachAxes(s);
  return s;
}

// 2.0: netrun code (netrun/run.js) still writes the signed pair `axes.allegiance` and `axes.stability`. This adapter turns a
// signed lean into Standing (a rise adds to corp, a fall to street) and stability into temper. Nothing in this file uses it.
function attachAxes(s) {
  const axes = {};
  Object.defineProperty(axes, 'allegiance', {
    enumerable: true,
    get: () => s.standing.corp - s.standing.street,
    set(v) {
      const d = v - (s.standing.corp - s.standing.street);
      if (d > 0) s.standing.corp += d;
      else s.standing.street -= d;
    },
  });
  Object.defineProperty(axes, 'stability', { enumerable: true, get: () => s.temper, set: (v) => { s.temper = v; } });
  Object.defineProperty(s, 'axes', { value: axes, enumerable: false, configurable: true, writable: true });
}

// --- 2.0 bugs, Standing and temper helpers ---------------------------------------------------------

// homeClear: whether a bug can be cleared away from a netrun (maintainer: it cannot; bugs are cleared at a clinic node, see netrun/run.js).
// BUGS='{"homeClear":true}' brings back the earlier home-clearing rules for comparison.
// Effects per bug (maintainer, after measuring that the first values barely killed): Charge and Sync drain +16%, Heat gain +20%, damage to Integrity +8%,
// and 0.5 Integrity an hour lost whatever else is going on. The first values were 8%, 8%, 10%, 4% and 0.
export const BUG_CFG = { homeClear: false, regenCut: 0, integrityFlat: 0.5, chance: 0.3, max: 5, charge: 0.16, sync: 0.16, heat: 0.2, integrity: 0.08, segfault: [0.25, 0.6, 0.15], clearScrip: 15, clearStanding: 2 };
if (process.env.BUGS) Object.assign(BUG_CFG, JSON.parse(process.env.BUGS));

export function rollBug(s, rng, chance = BUG_CFG.chance) {
  if ((s.bugs ?? 0) < BUG_CFG.max && rng() < chance) {
    s.bugs = (s.bugs ?? 0) + 1;
    return true;
  }
  return false;
}

// Clear one bug. `pay` is 'scrip' (15) or 'standing' (2 points taken from the tracks, `corp` of them from corp and the rest from
// street; both stay at zero or above). Returns whether a bug was cleared.
export function clearBug(s, { pay = 'scrip', corp = 1, where = 'home' } = {}) {
  if (!(s.bugs > 0)) return false;
  if (where === 'home' && !BUG_CFG.homeClear) return false;
  if (pay === 'scrip') {
    if ((s.scrip ?? 0) < BUG_CFG.clearScrip) return false;
    s.scrip -= BUG_CFG.clearScrip;
  } else {
    const street = BUG_CFG.clearStanding - corp;
    if (corp < 0 || street < 0 || s.standing.corp < corp || s.standing.street < street) return false;
    s.standing.corp -= corp;
    s.standing.street -= street;
  }
  s.bugs--;
  return true;
}

// Clearing a bug at a clinic node: the same prices (15 scrip, or 2 Standing in the split `corp` picks), allowed on a netrun.
export const clearBugAt = (s, o = {}) => clearBug(s, { ...o, where: 'clinic' });

// Standing as the player sees it: the floor of each track. Decisions read the fractions (maintainer: a little extra randomness in
// evolution), against whole-number cutpoints: see gapIndex.
export const standingInt = (s, track) => Math.floor(s.standing[track] + 1e-9);
// The corp lead (negative: street leads) a bot acts on: the true fractions, or with `shown` only what the HUD shows, the floors.
export const leanSeen = (s, shown = false) => (shown ? standingInt(s, 'corp') - standingInt(s, 'street') : s.standing.corp - s.standing.street);
// The gap between two scores as a tie-weight index: its whole part, so a true gap of 3.75 (shown as 4) weighs as a gap of 3.
export const gapIndex = (gap) => Math.min(Math.floor(gap + 1e-9), CFG.tieWeights.length - 1);

// The temper level the sprite shows (-2 strongly unsteady .. +2 strongly steady), with the flicker guard.
export const temperLevel = (s) => s.tLevel ?? 0;
const SEGFAULT_TEMPER = 4;
export const temperDecayFactor = () => 0.5 ** (1 / CFG.temperHalfLifeMin);
const TEMPER_DECAY = temperDecayFactor;

// 2.0 care preferences. Hidden: a steady netling likes routine (the same packet, a game among its last two), an unsteady one
// novelty (the other packet, a game not among them). A match is a small Sync bonus, once per action, no penalty for a miss.
export const PREF = { on: true, distinct: true, reqbias: true, ice: true };
if (process.env.PREF) Object.assign(PREF, JSON.parse(process.env.PREF));
// 2.0 egg pressure, Program (triage): a rattled netling opens its next event with a shorter window. Off by default;
// RATTLE='{"on":true}' switches it on (see docs/netling2-prototypes). Two triggers (`mode`):
//   'pileup' (default): an event opens within `gap` minutes of the previous event ending (answered or timed out; with
//     answeredOnly, only answered). It depends on how events arrive, not on when the player checks in.
//   'late': answering an event after `late` of its window set a timer of `minutes` (the first version; it falls hardest
//     on players who check in rarely, see the scratchpad notes).
// cut: the share of the window taken off. heat, charge: what answering a rattled event costs extra (Heat added, Charge taken);
// the window cut and the answer cost are separate, so either can be set to 0.
export const RATTLE = { on: false, mode: 'pileup', gap: 60, answeredOnly: false, late: 2 / 3, cut: 0.25, minutes: 120, heat: 0, charge: 0 };
if (process.env.RATTLE) Object.assign(RATTLE, JSON.parse(process.env.RATTLE));
export const rattled = (s) => {
  if (!RATTLE.on) return false;
  if (RATTLE.mode === 'late') return (s.rattleUntil ?? -1) > s.ageMin;
  if (s.lastEventEnd === undefined || s.ageMin - s.lastEventEnd >= RATTLE.gap) return false;
  return !RATTLE.answeredOnly || Boolean(s.lastEventAnswered);
};
const eventWindow = (s, type) => {
  const w = CFG[EVENTS[type].window] * (1 + traitEffect(s, 'evasive'));
  return rattled(s) ? Math.max(1, Math.round(w * (1 - RATTLE.cut))) : Math.round(w);
};
function rattleNote(s, t) {
  s.event.rattled = true;
  s.rattledEvents = (s.rattledEvents ?? 0) + 1;
  if (RATTLE.mode === 'pileup') s.rattleCount = (s.rattleCount ?? 0) + 1;
  log(s, t, '> it flinches. another alarm so soon.');
}
// Called where the player answers an event in time (not where it times out).
function eventAnswered(s, t) {
  if (!s.event) return;
  const used = (s.ageMin - s.event.startedAge) / (s.event.window ?? CFG[EVENTS[s.event.type].window]);
  s.eventsAnswered = (s.eventsAnswered ?? 0) + 1;
  s.lastEventEnd = s.ageMin;
  s.lastEventAnswered = true;
  if (RATTLE.on && s.event.rattled && (RATTLE.heat || RATTLE.charge)) {
    s.stats.heat = clamp(s.stats.heat + RATTLE.heat);
    s.stats.charge = clamp(s.stats.charge - RATTLE.charge);
    s.rattlePaid = (s.rattlePaid ?? 0) + 1;
    if (t !== undefined) log(s, t, '> rattled. that took more out of it.');
  }
  if (RATTLE.on && RATTLE.mode === 'late' && used >= RATTLE.late) {
    s.rattleUntil = s.ageMin + RATTLE.minutes;
    s.rattleCount = (s.rattleCount ?? 0) + 1;
    if (t !== undefined) log(s, t, '> it flinches at the next alarm.');
  }
}
// 2.0 egg pressure, Iron (restraint): hidden wear builds while Heat stays above `heat` and drains away when it does not (faster at
// rest), and the base infection hazard (Iron's "drift") follows wear instead of staying flat. A spike is nearly free; a long redline
// is not. Off by default; IRON='{"on":true}' switches it on. rate: wear per minute per Heat point over the threshold; decay: the
// share of wear lost a minute (times restMult while resting); floor and slope: the base hourly hazard at no wear and the extra at
// wear 100; lock: the extra Sync (LOCK) drain at wear 100, as a share (0 = none, the notes' first version); line: the wear at which it
// logs a warning.
// cold: Heat under this while awake also builds wear (0 = off), at coldRate per minute per Heat point under it; restFloor: nap and sleep cool
// no lower than this (0 = no floor, 1.0's behaviour: rest cools to about 0).
// Adopted (maintainer): the hot line 75, the Sync effect at x1, the cold line 20 and the nap and sleep cooling floor 20 (a band of about 20 to 75).
export const IRON = { on: false, heat: 75, rate: 0.08, decay: 1 / 120, restMult: 4, floor: 0.014, slope: 0.3, lock: 1, cold: 20, coldRate: 0.08, restFloor: 20, line: 50 }; // eased from rate 0.12, decay 1/180, restMult 3, coldRate 0.12 (Result 22)
if (process.env.IRON) Object.assign(IRON, JSON.parse(process.env.IRON));
function stepWear(s, t, rest) {
  const before = s.wear ?? 0;
  const excess = Math.max(0, s.stats.heat - IRON.heat);
  const chill = IRON.cold ? Math.max(0, IRON.cold - s.stats.heat) : 0;
  let w = before * (1 - IRON.decay * (rest ? IRON.restMult : 1)) + (rest ? 0 : IRON.rate * excess + IRON.coldRate * chill);
  w = Math.min(100, Math.max(0, w));
  s.wear = w;
  s.wearMax = Math.max(s.wearMax ?? 0, w);
  if (w >= IRON.line) s.wearHighMin = (s.wearHighMin ?? 0) + 1;
  if (w >= IRON.line && s.stage !== 'baby') s.wearAt ??= s.ageMin; // first minute wear passes the warning line (for the one-time Iron caption)
  if (before < IRON.line && w >= IRON.line) log(s, t, '> tolerances are slipping.');
}
// 2.0 egg pressure as a band on one meter (maintainer: Iron manages Heat, Wetware Charge, Program Sync). Hidden strain builds while the stat is
// above `hi` (rate per minute per point over) or under `lo` (loRate) while awake, decays (faster at rest) and replaces the flat base infection
// hazard with floor + slope * strain / 100. Off by default; BANDS='{"charge":{"on":true,"hi":90}}' switches one on. One band at a time with
// IRON or WET. line: the strain counted as high in the reports.
export const BANDS = {
  charge: { on: false, lo: 0, hi: 90, rate: 0.12, loRate: 0.12, decay: 1 / 180, restMult: 3, floor: 0.014, slope: 0.3, line: 50 },
  sync: { on: false, lo: 0, hi: 90, rate: 0.12, loRate: 0.12, decay: 1 / 180, restMult: 3, floor: 0.014, slope: 0.3, line: 50 },
};
if (process.env.BANDS) for (const [k, v] of Object.entries(JSON.parse(process.env.BANDS))) Object.assign(BANDS[k], v);
function stepBand(s, key, rest) {
  const c = BANDS[key];
  s.strain ??= {};
  const before = s.strain[key] ?? 0;
  const v = s.stats[key];
  const w = Math.min(100, Math.max(0, before * (1 - c.decay * (rest ? c.restMult : 1)) + (rest ? 0 : c.rate * Math.max(0, v - c.hi) + c.loRate * Math.max(0, c.lo - v))));
  s.strain[key] = w;
  s.strainMax ??= {};
  s.strainMax[key] = Math.max(s.strainMax[key] ?? 0, w);
  if (w >= c.line) s.strainHighMin = (s.strainHighMin ?? 0) + 1;
}
// 2.0 egg pressure as a choice (maintainer: each egg manages one meter; action-based because a level band taxes check-in cadence). A feed taken
// with Charge already at or over `line` (charge) or a game played with Sync already at or over `line` (sync) adds `add` hidden strain, which
// halves every `halfLifeMin` and drives the base infection hazard (floor + slope * strain / 100). Off by default;
// ACTS='{"charge":{"on":true,"line":60}}' switches one on. count: how many such actions a life, for the reports.
export const ACTS = {
  charge: { on: false, line: 60, add: 3, halfLifeMin: 1440, floor: 0.014, slope: 0.3, line_hi: 50 },
  sync: { on: false, line: 75, add: 3, halfLifeMin: 1440, floor: 0.014, slope: 0.3, line_hi: 50 },
};
if (process.env.ACTS) for (const [k, v] of Object.entries(JSON.parse(process.env.ACTS))) Object.assign(ACTS[k], v);
function actEarly(s, key) {
  const c = ACTS[key];
  if (!c.on || s.stats[key] < c.line) return;
  s.act ??= { charge: 0, sync: 0, count: { charge: 0, sync: 0 }, max: { charge: 0, sync: 0 } };
  s.act[key] = Math.min(100, s.act[key] + c.add);
  s.act.count[key]++;
  s.act.max[key] = Math.max(s.act.max[key], s.act[key]);
}
function stepActs(s) {
  if (!s.act) return;
  for (const k of Object.keys(ACTS)) if (ACTS[k].on) s.act[k] *= 0.5 ** (1 / ACTS[k].halfLifeMin);
}
const actOn = () => (ACTS.charge.on ? 'charge' : ACTS.sync.on ? 'sync' : null);
const bandOn = () => (BANDS.charge.on ? 'charge' : BANDS.sync.on ? 'sync' : null);
// 2.0 egg pressure, two-sided meters: Charge and Sync each get a high side (hi or over) and a low side (lo or under) with a benefit
// and a cost, for every egg. The owner's meter (Program: charge, Wetware: sync; owner = that key, null for Iron) has every effect
// scaled by ownerMult. m = 1 for a non-owner, ownerMult for the owner. Off by default; SIDES='{"on":true,"owner":"charge"}' switches it on.
//   charge hi: play pays more sync (playGain), wins drop more (drop); cost: overflow likelier (overflow), integrity bleeds (bleed per hour).
//   charge lo: drains and heat drift slower (slow); cost: play needs more charge (gate, over the usual 10).
//   sync hi:  visits likelier (visit), wins drop more (drop); cost: infection hazard up (virus), temper swings (swing, per minute).
//   sync lo:  trouble comes less often (calm); cost: wins drop less (dull).
export const SIDE_METER = { drops: 0, plays: 0, playGain: 0, visits: 0, penHits: 0, burns: 0, brakes: 0, brakeWarns: 0, runsInState: 0, runEndsBelowExit: 0, endsSoonAfterRun: 0, endsOther: 0 }; // sums over lives, for sides-sweep.mjs
export const SIDES = {
  on: false, owner: null, ownerMult: 2, lowOwnerOnly: false, flowShared: false, ironBenefit: 3, teenStates: true, // teenStates: a baby is too young and unstable to hold Overclock, Overdrive or Overlink (decided, maintainer)
 
  charge: { hi: 85, lo: 30, hold: 0, exit: 75, playGain: 0.15, drop: 0.25, overflow: 0.5, bleed: 1.5, slow: 0.25, gate: 5 },
  heat: { hi: 65, hold: 0, exit: 55 }, // Overclock as a held state (Iron's bar), hold 0 is the plain threshold
  sync: { hi: 85, lo: 30, hold: 0, exit: 75, penLine: 0, penP: 0.05, penDmg: 4, penStep: 0, penFree: 90, penCap: 0.6, burnN: 0, burnCool: 240, hintMin: 120, visit: 0.25, drop: 0.25, virus: 0.3, swing: 0.002, steadyDecay: 0, calm: 0.2, dull: 0.3 },
};
if (process.env.SIDES) for (const [k, v] of Object.entries(JSON.parse(process.env.SIDES))) {
  if (typeof v === 'object' && v) Object.assign(SIDES[k], v); else SIDES[k] = v;
}
// 2.0 break (maintainer, off by default; BRAKE='{"on":true}' switches it on): a cost trigger for the three states (Iron's Overclock, Program's
// Overdrive, Wetware's Overlink). While a state is active and Integrity is under warnInt the netling warns once (visibility only); under breakInt
// the state is forced to end, the bar is pushed well below its exit line (drop: Charge, Sync or Heat is set to at most that), and the state cannot
// be entered again for lockMin minutes (24 hours, the same as Overlink's burnout). Iron's Overclock is a plain Heat band, so its lockout turns the
// Overclock rules (benefits and costs) off while it lasts. The trigger is Integrity for all three; the design doc may choose another for Iron.
export const BRAKE = { on: false, warnInt: 70, breakInt: 55, lockMin: 1440, drop: { charge: 50, sync: 55, heat: 35 } };
if (process.env.BRAKE) {
  const v = JSON.parse(process.env.BRAKE);
  Object.assign(BRAKE, v, { drop: { ...BRAKE.drop, ...(v.drop ?? {}) } });
}
const brakeLocked = (s, key) => BRAKE.on && SIDES.on && (s.brakeUntil?.[key] ?? 0) > s.ageMin;
// Held state: with hold > 0 the high side is entered only after the stat has been at hi or over for `hold` awake minutes (dips down to
// `exit` do not break it), and left when it falls under `exit` or the netling rests. hold 0 is the plain threshold.
const heldNow = (s, key) => Boolean(s.sideHeld?.[key]);
const sideOf = (s, key) => (!SIDES.on ? null : (SIDES.teenStates && s.stage === 'baby' ? false : SIDES[key].hold > 0 ? heldNow(s, key) : s.stats[key] >= SIDES[key].hi) ? 'hi' : s.stats[key] <= SIDES[key].lo ? 'lo' : null);
function stepHeld(s, rest) {
  if (!SIDES.on) return;
  s.sideHold ??= { charge: 0, sync: 0, heat: 0 };
  s.sideHeld ??= { charge: false, sync: false, heat: false };
  // 2.0: after a jack-out the held states resume and the bars cannot end them for a few minutes (NR2.graceMin, nr2.js); the counters wait too.
  const grace = (s.graceUntil ?? 0) > s.ageMin; // inside it the bars cannot end a state or reset a count (rest still does); a bar at the high line still counts
  for (const key of ['charge', 'sync', 'heat']) {
    const c = SIDES[key];
    if (!(c.hold > 0) || (key === 'heat' && SIDES.owner !== null)) continue;
    if (rest || (!grace && s.stats[key] < c.exit) || (SIDES.teenStates && s.stage === 'baby')) {
      s.sideHold[key] = 0;
      if (s.sideHeld[key] && !rest) SIDE_METER[s.ageMin - (s.lastJackOutAge ?? -1e9) <= 30 ? 'endsSoonAfterRun' : 'endsOther']++; // a state the bars ended: soon after a run, or otherwise
      s.sideHeld[key] = false;
      if (key === 'sync') { s.wiredOver = 0; s.burnCount = 0; }
    } else if (brakeLocked(s, key) || (key === 'sync' && (s.burnUntil ?? 0) > s.ageMin)) {
      s.sideHold[key] = 0;
    } else if (s.stats[key] >= c.hi) {
      s.sideHold[key]++;
      if (s.sideHold[key] >= c.hold) {
        s.sideHeld[key] = true;
        s.heldAt ??= { charge: null, sync: null };
        s.heldAt[key] ??= s.ageMin;
      }
      // The one-time pre-state caption: once a netling, for this bar, after hintMin minutes of building toward the state.
      s.hintAt ??= { charge: null, sync: null };
      if (!s.sideHeld[key] && s.heldAt?.[key] == null && s.stage !== 'baby' && s.sideHold[key] >= (SIDES[key].hintMin ?? 120) && s.hintAt[key] === null) s.hintAt[key] = s.ageMin; // never as a baby
    }
  }
}
function stepBrake(s, rest, t) {
  if (!BRAKE.on || !SIDES.on) return;
  s.brakeUntil ??= { charge: 0, sync: 0, heat: 0 };
  s.brakeWarn ??= { charge: false, sync: false, heat: false };
  const st = s.stats;
  for (const key of ['charge', 'sync', 'heat']) {
    if (key === 'heat' && SIDES.owner !== null) continue; // Overclock's break is Iron's
    const active = !rest && (key === 'heat' ? overclocked(s) : Boolean(s.sideHeld?.[key]));
    if (!active) { s.brakeWarn[key] = false; continue; }
    if (st.integrity < BRAKE.breakInt) {
      if (key !== 'heat') {
        s.sideHeld[key] = false;
        s.sideHold[key] = 0;
        if (key === 'sync') { s.wiredOver = 0; s.burnCount = 0; }
      }
      st[key] = Math.min(st[key], BRAKE.drop[key]);
      s.brakeUntil[key] = s.ageMin + BRAKE.lockMin;
      s.brakeWarn[key] = false;
      s.brakes = (s.brakes ?? 0) + 1;
      SIDE_METER.brakes++;
      log(s, t, `> !! ${{ charge: 'overdrive discharged', sync: 'overlink crashed', heat: 'overclock throttled' }[key]}. locked out for ${Math.round(BRAKE.lockMin / 60)}h.`);
    } else if (st.integrity < BRAKE.warnInt && !s.brakeWarn[key]) {
      s.brakeWarn[key] = true;
      SIDE_METER.brakeWarns++;
      log(s, t, `> ${{ charge: 'overdrive', sync: 'overlink', heat: 'overclock' }[key]} is costing integrity. ease off.`);
    }
  }
}
const dropSides = (s) =>
  (sideOf(s, 'charge') === 'hi' ? 1 + SIDES.charge.drop * sideM('charge') : 1) *
  (sideOf(s, 'sync') === 'hi' ? 1 + SIDES.sync.drop * sideM('sync') : 1) /
  (sideOf(s, 'sync') === 'lo' ? 1 + SIDES.sync.dull * sideM('sync') : 1);
const sideM = (key) => (SIDES.owner === key ? SIDES.ownerMult : 1);
// Low-side benefits: with lowOwnerOnly only the owner gets them (0 for everyone else), the costs stay for all.
const lowM = (key) => (SIDES.lowOwnerOnly && SIDES.owner !== key ? 0 : sideM(key));
const baseVirusPerHour = (s) => {
  const b = bandOn();
  const a = actOn();
  if (a && !IRON.on && !WET.on && !b) return ACTS[a].floor + (ACTS[a].slope * (s.act?.[a] ?? 0)) / 100;
  if (b && !IRON.on && !WET.on) return BANDS[b].floor + (BANDS[b].slope * (s.strain?.[b] ?? 0)) / 100;
  return IRON.on ? IRON.floor + (IRON.slope * (s.wear ?? 0)) / 100 : WET.on ? WET.floor + (WET.slope * (s.shock ?? 0)) / 100 : CFG.virusBasePerHour;
};
// 2.0 egg pressure, Wetware (consistency): hidden shock is added whenever a feed is the other packet type from the last feed (a
// block of one type costs one switch, flip-flopping costs one a feed) and fades with `halfLifeMin`. The base infection hazard (its
// "rejection") follows shock instead of staying flat. Off by default; WET='{"on":true}' switches it on. Not used together with IRON.
// shock: added a switch; floor, slope: the base hourly hazard at no shock and the extra at shock 100; line: the shock at which it
// logs a warning.
export const WET = { on: false, shock: 3, halfLifeMin: 1440, floor: 0.0075, slope: 0.03, line: 50 };
if (process.env.WET) Object.assign(WET, JSON.parse(process.env.WET));
function wetSwitch(s, t) {
  const before = s.shock ?? 0;
  s.switches = (s.switches ?? 0) + 1;
  s.shock = Math.min(100, before + WET.shock);
  s.shockMax = Math.max(s.shockMax ?? 0, s.shock);
  if (before < WET.line && s.shock >= WET.line) log(s, t, '> it is rejecting the change.');
}
function stepShock(s) {
  s.shock = (s.shock ?? 0) * 0.5 ** (1 / WET.halfLifeMin);
  if (s.shock >= WET.line) s.shockHighMin = (s.shockHighMin ?? 0) + 1;
}
export const pushGame = (s, game) => {
  const last = s.lastGames ?? [];
  s.lastGames = PREF.distinct ? [game, ...last.filter((g) => g !== game)].slice(0, 2) : [game, ...last].slice(0, 2);
};
function prefApply(s, match) {
  const lv = temperLevel(s);
  s.prefActions = (s.prefActions ?? 0) + (lv ? 1 : 0);
  if (!PREF.on || !lv || !match) return '';
  const b = Math.abs(lv) === 2 ? CFG.prefStrong : CFG.prefMild;
  s.stats.sync = clamp(s.stats.sync + b);
  s.prefBonus = (s.prefBonus ?? 0) + b;
  s.prefMatches = (s.prefMatches ?? 0) + 1;
  return lv > 0 ? ' it settles into the routine.' : ' something new. it perks up.';
}

const freshGames = () => Object.fromEntries(GAME_IDS.map((id) => [id, { played: 0, won: 0 }]));

export function log(s, t, msg) {
  s.log.push({ t, msg });
  if (s.log.length > 50) s.log.splice(0, s.log.length - 50);
}

// How much faster (or slower) than the base rate a stat at `value` drains.
export function drainCurve(value) {
  const { empty, full } = CFG.drainCurve;
  return empty + ((full - empty) * value) / 100;
}

export function bedtimeHour(s) {
  return (CFG.sleepStart + (s.quirk?.sleepOffset ?? 0) + 24) % 24;
}

// The sleep window's time zone (KI-12): the device's offset from UTC in minutes, as
// getTimezoneOffset gives it. Stored on the netling at compile and read again only when it wakes,
// so a day keeps the zone it started in and travel or a clock change takes effect the next morning.
export const deviceZone = (t) => new Date(t).getTimezoneOffset();
export const localHour = (t, zone) => new Date(t - zone * 60_000).getUTCHours();

// Bedtime as minutes past midnight on the device's clock at `t`: bedtimeHour, unless the device has
// changed zone since the netling last woke (it keeps the old zone until the next morning).
export function bedtimeOnDevice(s, t) {
  const m = bedtimeHour(s) * 60 + (s.zone ?? deviceZone(t)) - deviceZone(t);
  return ((m % 1440) + 1440) % 1440;
}

export function isSleepHour(hour, offset = 0) {
  const start = (CFG.sleepStart + offset + 24) % 24;
  const end = (CFG.sleepEnd + offset + 24) % 24;
  return start > end ? hour >= start || hour < end : hour >= start && hour < end;
}

// Advance the simulation to `now`, one minute at a time. Hibernation freezes the clock.
// A clock that went backwards (device time changed) resumes from `now` instead of pausing
// until it catches up.
export function tick(s, now, rng = Math.random) {
  if (s.hibernation) return s;
  if (now < s.lastTick) s.lastTick = now;
  const minutes = Math.floor((now - s.lastTick) / MIN);
  for (let i = 0; i < minutes && s.stage !== 'dead'; i++) {
    step(s, s.lastTick + (i + 1) * MIN, rng);
  }
  if (minutes > 0) s.lastTick += minutes * MIN;
  return s;
}

function step(s, t, rng) {
  s.ageMin++;
  if (s.stage === 'script') {
    if (s.ageMin >= CFG.bootMinutes) {
      s.stage = 'baby';
      log(s, t, `> netling.v${s.generation}.0 online. hello, runner.`);
    }
    return;
  }

  if (s.stage === 'baby' && s.ageMin >= s.life.teenAt) {
    evolve(s, t, 'teen', teenForm(s, rng));
  } else if (s.stage === 'teen' && s.ageMin >= s.life.adultAt) {
    evolve(s, t, 'adult', adultForm(s, rng));
  } else if (CFG.mainframe && mainframeDue(s)) {
    evolve(s, t, 'mainframe', MAINFRAME_OF[s.form]);
    s.lifeBonus = CFG.mainframeBonusMin;
    log(s, t, '> it has another day in it now.');
  }

  let shouldSleep = isSleepHour(localHour(t, s.zone), s.quirk.sleepOffset);
  if (s.asleep && !shouldSleep) {
    // Waking: the new day takes the device's zone now. Still night there? Keep sleeping.
    s.zone = deviceZone(t);
    shouldSleep = isSleepHour(localHour(t, s.zone), s.quirk.sleepOffset);
  }
  if (s.nap && (shouldSleep || s.ageMin - s.nap.startedAge >= CFG.napMaxMin)) {
    endNap(s, t, shouldSleep ? null : '> nap over. back online.');
  }
  if (shouldSleep && !s.asleep) {
    s.asleep = true;
    log(s, t, '> entering low-power mode. kill the lights.');
  } else if (!shouldSleep && s.asleep) {
    s.asleep = false;
    s.lightsOn = true;
    s.wokeAt = t; // a new day: the daily check-in keys off this (checkin.js)
    log(s, t, '> resuming from low-power mode.');
  }

  const st = s.stats;
  const rest = resting(s);
  let rate = s.asleep ? (s.lightsOn ? CFG.sleepDrainMult : CFG.sleepDarkDrainMult) : s.nap ? CFG.napDrainMult : 1;
  if (rest) rate *= 1 - traitEffect(s, 'persistent');
  const chargeLo = sideOf(s, 'charge') === 'lo' ? 1 / (1 + SIDES.charge.slow * lowM('charge')) : 1;
  st.charge = clamp(st.charge - (CFG.drainPerHour.charge / 60) * chargeLo * rate * drainCurve(st.charge) * mod(s, 'chargeDrainMult') * (1 + BUG_CFG.charge * s.bugs));
  const dark = !rest && !s.lightsOn ? CFG.darkAwakeSyncMult : 1;
  st.sync = clamp(st.sync - (CFG.drainPerHour.sync / 60) * rate * dark * drainCurve(st.sync) * mod(s, 'syncDrainMult') * (1 + BUG_CFG.sync * s.bugs) * (IRON.on ? 1 + IRON.lock * ((s.wear ?? 0) / 100) : 1));
  const heatBefore = st.heat;
  if (st.heat >= CFG.overclockHeat && !rest && s.stage !== 'baby') s.ocAt ??= s.ageMin; // first minute overclocked (for the one-time Overclock caption)
  st.heat = clamp(
    st.heat + (rest ? -CFG.heatCoolWhileAsleepPerHour : CFG.heatDriftPerHour * chargeLo * (1 + BUG_CFG.heat * s.bugs)) / 60,
  );
  // Iron's cooling floor: nap and sleep cool it no further than `restFloor` (a stat already below the floor stays where it is).
  if (IRON.on && rest && IRON.restFloor > 0 && st.heat < IRON.restFloor) st.heat = Math.min(heatBefore, IRON.restFloor);

  if (IRON.on) stepWear(s, t, rest);
  for (const k of Object.keys(BANDS)) if (BANDS[k].on) stepBand(s, k, rest);
  stepHeld(s, rest);
  stepBrake(s, rest, t);
  if (WET.on) stepShock(s);
  stepActs(s);

  if (!rest && s.sinceFed < CFG.digestMinutes && s.cache < CFG.maxCache && rng() < CFG.cacheChancePerMin) {
    s.cache++;
    log(s, t, '> corrupted cache file written.');
  }
  s.sinceFed++;

  // No fresh infections while it rests: it's offline, not browsing.
  if (!s.virus && !shielded(s) && !rest) {
    let perHour = baseVirusPerHour(s) + CFG.virusPerCachePerHour * s.cache;
    if (sideOf(s, 'sync') === 'hi') perHour *= 1 + SIDES.sync.virus * sideM('sync');
    perHour *= 1 - traitEffect(s, 'hardened');
    perHour *= mod(s, 'virusMult');
    if (rng() < perHour / 60) {
      s.virus = true;
      s.virusMin = 0;
      s.virusCount = (s.virusCount ?? 0) + 1;
      log(s, t, '> !! virus signature detected.');
    }
  } else if (s.virus) {
    s.virusMin++;
  }

  let dInt = 0;
  if (s.virus) dInt -= 12;
  if (s.cache >= 3) dInt -= 5;
  if (st.heat >= 85) dInt -= 8;
  if (st.charge <= 0) dInt -= 6;
  if (sideOf(s, 'charge') === 'hi' && !rest) dInt -= SIDES.charge.bleed * sideM('charge');
  // Real rest (asleep in the dark, or a nap) repairs faster; a restless sleep with the lights on doesn't.
  const deepRest = s.nap || (s.asleep && !s.lightsOn);
  // 2.0 bugs: regeneration is cut by regenCut a bug (0 until chosen), damage is multiplied by (1 + integrity a bug), and integrityFlat an
  // hour is lost for each bug whatever else is going on (0 until chosen).
  if (dInt === 0) dInt = (deepRest ? CFG.integrityRestRegenPerHour : CFG.integrityRegenPerHour) * (1 - Math.min(0.95, BUG_CFG.regenCut * s.bugs));
  if (dInt < 0) dInt *= 1 + BUG_CFG.integrity * s.bugs;
  dInt -= BUG_CFG.integrityFlat * s.bugs;
  dInt -= TRAIT_CFG.volatileIntegrity * traitStrength(s, 'volatile');
  st.integrity = clamp(st.integrity + dInt / 60);

  if (st.heat >= 85) s.temper -= 1 / 60;
  else if (!rest && overclocked(s)) s.temper += CFG.overclockTemperPerHour / 60;
  else if (!rest && !alertReason(s)) s.temper += (inFlow(s) ? CFG.flowTemperPerHour : CFG.uptimeTemperPerHour) / 60;
  s.temper *= TEMPER_DECAY();
  if (!rest && sideOf(s, 'sync') === 'hi') {
    s.temper *= 1 + SIDES.sync.swing * sideM('sync');
    if (s.temper > 0) s.temper *= 1 - SIDES.sync.steadyDecay * sideM('sync');
  }
  s.tLevel = guardedLevel(s.temper, s.tLevel ?? 0);
  while (s.faultRolls > 0) {
    s.faultRolls--;
    // The netling says so, and points to the way out (a clinic on a netrun).
    if (rollBug(s, rng)) log(s, t, s.bugs >= 3 ? '> it is badly glitched. a clinic out on the net could fix it.' : '> a glitch has settled in. a clinic out on the net could fix it.');
  }
  if (s.bugs > 0 && !rest && !s.run && rng() < CFG.bugNagPerHour / 60) log(s, t, '> still glitching. there are clinics out on the net.');
  stepHold(s, rest);

  stepVisit(s, t, rng);
  stepFriends(s, t, rng);
  stepEvents(s, t, rng);
  stepRequest(s, t, rng);
  stepFlow(s);
  stepOverclock(s, t);
  stepChatter(s, rng);

  checkMistake(s, t, 'charge', st.charge <= 0, 'charge depleted');
  checkMistake(s, t, 'sync', st.sync <= 0, 'sync lost');
  checkMistake(s, t, 'heat', st.heat >= 100, 'thermal overload');
  checkMistake(s, t, 'lights', s.asleep && s.lightsOn, 'no rest with the lights on', CFG.lightsGraceMin);

  s.integrityZeroMin = st.integrity <= 0 ? s.integrityZeroMin + 1 : 0;

  if (s.integrityZeroMin >= CFG.flatlineIntegrityMin) flatline(s, t, 'integrity collapse', rng);
  else if (s.careMistakes >= CFG.maxMistakes) flatline(s, t, 'neglect', rng);
  else if (s.ageMin >= lifeEnd(s)) flatline(s, t, 'end of life cycle', rng);
}

function stepEvents(s, t, rng) {
  const st = s.stats;
  if (s.event) {
    // Its timer holds overnight: nothing lands while it sleeps. It picks up again at wake-up.
    // It also holds while the player is fighting an intrusion off (`defending`, set by the UI and
    // never trusted from storage), so a win can't arrive after the virus already landed.
    if (s.asleep || s.event.defending) {
      s.event.startedAge++;
      return;
    }
    if (eventMinutesLeft(s) > 0) return;
    const type = s.event.type;
    s.event = null;
    s.lastEventEnd = s.ageMin;
    s.lastEventAnswered = false;
    if (type === 'trace') {
      st.integrity = clamp(st.integrity - CFG.traceIgnoredIntegrity);
      s.standing.corp += CFG.traceIgnoredStanding;
      log(s, t, '> !! trace completed. corp harvested its data.');
    } else if (type === 'attack') {
      infect(s, CFG.attackLandedIntegrity);
      log(s, t, `> !! intrusion landed. virus installed. -${CFG.attackLandedIntegrity} integrity.`);
    } else if (type === 'overflow') {
      crash(s);
      log(s, t, `> !! buffers burst. crashed: -${CFG.overflowCrashIntegrity} integrity, cache full. rebooting...`);
    }
    return;
  }
  if (resting(s)) return;
  // Overclocked draws trouble; flow keeps it away (the two never overlap: flow needs Heat under 60).
  let hot = overclocked(s) ? CFG.overclockEventMult : inFlow(s) ? CFG.flowEventMult : 1;
  if (sideOf(s, 'sync') === 'lo') hot /= 1 + SIDES.sync.calm * lowM('sync');
  const overflowMult = sideOf(s, 'charge') === 'hi' ? 1 + SIDES.charge.overflow * sideM('charge') : 1;
  if (rng() < (hot * CFG.traceChancePerHour * (1 - traitEffect(s, 'untraceable')) * mod(s, 'traceMult')) / 60) {
    if (s.buffs?.traceSkip) {
      s.buffs.traceSkip = false;
      log(s, t, '> corp trace waved off by voucher.');
      return;
    }
    s.event = { type: 'trace', startedAge: s.ageMin, window: eventWindow(s, 'trace') };
    if (rattled(s)) rattleNote(s, t);
    log(s, t, `> !! corp trace incoming. ${s.event.window}m to respond.`);
  } else if (!s.virus && rng() < (hot * CFG.attackChancePerHour * mod(s, 'attackMult')) / 60) {
    if (shielded(s)) {
      log(s, t, '> intrusion attempt bounced off the antivirus shield.');
      return;
    }
    if (s.buffs?.attackSkip) {
      s.buffs.attackSkip = false;
      log(s, t, '> intrusion waved off by decoy.');
      return;
    }
    s.event = { type: 'attack', startedAge: s.ageMin, window: eventWindow(s, 'attack') };
    if (rattled(s)) rattleNote(s, t);
    log(s, t, `> !! intrusion attempt. DEFEND within ${s.event.window}m.`);
  } else if (rng() < (hot * overflowMult * (CFG.overflowChancePerHour + CFG.overflowPerCachePerHour * s.cache)) / 60) {
    s.event = { type: 'overflow', startedAge: s.ageMin, window: eventWindow(s, 'overflow') };
    if (rattled(s)) rattleNote(s, t);
    log(s, t, `> !! memory overflow. PURGE within ${s.event.window}m.`);
  } else if (rng() < (hot * CFG.surgeChancePerHour) / 60) {
    st.heat = clamp(st.heat + 25);
    st.charge = clamp(st.charge + 10);
    s.lastSurgeAt = t;
    log(s, t, `> !! power surge. running hot.${segfaultDrop(s, rng)}`);
  } else if (!s.visit && !s.run && rebootMinutesLeft(s) === 0 && rng() < (visitMult(s) * CFG.visitChancePerHour) / 60) {
    SIDE_METER.visits++;
    startVisit(s, t, rng);
  }
}

// --- visitors ------------------------------------------------------------------------------

function startVisit(s, t, rng) {
  const len = CFG.visitMinMin + Math.floor(rng() * (CFG.visitMaxMin - CFG.visitMinMin + 1));
  // Mainframe forms visit only once the stage is switched on, and only a line NL-0 has given root: before that they are
  // corrupted records, and a visitor would give one away.
  const form = pick(Object.keys(SPECIES).filter((f) => !isMainframeForm(f) || (CFG.mainframe && rootEarnedIn(s))), rng);
  // Never the host's own colors, so the two stay easy to tell apart.
  const own = s.quirk.palette < BASE_PALETTES ? s.quirk.palette : -1;
  let palette = Math.floor(rng() * (own < 0 ? BASE_PALETTES : BASE_PALETTES - 1));
  if (own >= 0 && palette >= own) palette++;
  const accessories = [];
  if (rng() < CFG.visitWearsAccessoryChance) {
    accessories.push(rollWornAccessory(rng));
    if (rng() < CFG.visitSecondAccessoryChance) accessories.push(rollWornAccessory(rng, accessories));
  }
  s.visit = { startedAge: s.ageMin, len, form, palette, accessories };
  const wearing = accessories.length ? ` in a ${accessories.map((id) => accessoryById(id).name.toLowerCase()).join(' and ')}` : '';
  log(s, t, `> a stray ${SPECIES[form].name.toLowerCase()}${wearing} pinged in. they're playing.`);
}

// --- friends' visitor cards -----------------------------------------------------------------
// A card carries a friend's look and a few facts, nothing that plays (docs/ATTENTION.md). Before Root Access, a
// Mainframe friend arrives as a corrupted record and its Mainframe items stay behind, as with the dex.

export const visitHidden = (s, visit) => Boolean(visit) && isMainframeForm(visit.form) && !(CFG.mainframe && rootEarnedIn(s));

// What the visitor is called in the log: a friend's form, or a corrupted record.
export const visitorName = (s, visit) => (visitHidden(s, visit) ? 'corrupted record' : SPECIES[visit.form].name.toLowerCase());

// A friend's handle, the way an IRC nick reads: its form and generation (daemon_g3), or ???_g5 for a corrupted record.
// Built from the card, so no player types it.
export const friendHandle = (form, gen, hidden) => `${hidden ? '???' : SPECIES[form].name.toLowerCase().replace(/[^a-z0-9]+/g, '')}_g${gen}`;
const visitHandle = (s, v) => friendHandle(v.form, v.friend.gen, visitHidden(s, v));

// The rarest thing a friend's line has done, after its generation. What only Root Access would explain stays corrupted.
export function friendFeat(f, rootKnown) {
  const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
  const best =
    f.below > 0 ? (rootKnown ? plural(f.below, 'trip below the bottom', 'trips below the bottom') : '<<corrupted>>')
    : f.root ? (rootKnown ? 'root access' : '<<corrupted>>')
    : f.deep > 0 ? plural(f.deep, 'deep exit')
    : '';
  return best ? `gen ${f.gen}, ${best}` : `gen ${f.gen}`;
}

// The first card in line arrives once the netling is awake and free: by chance within the hour, or as soon as it can
// after waiting that long. An empty queue rolls nothing, so the balance runs are unchanged.
function stepFriends(s, t, rng) {
  if (!s.friends?.length || s.visit || s.run || s.event || resting(s) || rebootMinutesLeft(s) > 0) return;
  const due = t - s.friends[0].at >= CFG.friendWaitMaxMin * MIN;
  if (!due && rng() >= CFG.friendChancePerMin) return;
  const card = s.friends.shift();
  const len = CFG.visitMinMin + Math.floor(rng() * (CFG.visitMaxMin - CFG.visitMinMin + 1));
  const visit = { startedAge: s.ageMin, len, form: card.form, palette: card.palette, accessories: [], friend: { gen: card.gen, deep: card.deep, root: card.root, below: card.below } };
  const hidden = visitHidden(s, visit);
  visit.accessories = hidden ? [] : card.accessories.filter((id) => !accessoryById(id)?.mainframe || rootEarnedIn(s));
  s.visit = visit;
  // A friend's visit reads like a chat channel: it joins, says something, and quits (stepVisit).
  const nick = visitHandle(s, visit);
  log(s, t, `--> ${nick} has joined #netling (${friendFeat(visit.friend, rootEarnedIn(s))})`);
  if (hidden) log(s, t, `<${nick}> r3c0rd c0rrupt3d. pl4y1ng anyw4y.`);
  else if (visit.accessories.length) log(s, t, `<${nick}> wearing a ${visit.accessories.map((id) => accessoryById(id).name.toLowerCase()).join(' and ')} today`);
  else log(s, t, `<${nick}> hi! want to play?`);
}

// While a visitor is here, Sync and Heat (not in flow) rise a little each minute. It leaves when time's up,
// or early if the netling rests, crashes or jacks in. Now and then it leaves a gift.
function stepVisit(s, t, rng) {
  const v = s.visit;
  if (!v) return;
  if (resting(s) || s.run || rebootMinutesLeft(s) > 0) {
    s.visit = null;
    log(s, t, v.friend ? `<-- ${visitHandle(s, v)} has quit (connection reset)` : '> the visitor logged off.');
    return;
  }
  s.stats.sync = clamp(s.stats.sync + CFG.visitSync / v.len);
  // In flow they play quietly: no Heat, so a visit never knocks it out of flow (which needs Heat under 60).
  if (!inFlow(s)) s.stats.heat = clamp(s.stats.heat + CFG.visitHeat / v.len);
  if (s.ageMin - v.startedAge < v.len) return;
  s.visit = null;
  let gift = ''; // what it left behind, as the end of a sentence: 'something stylish behind'
  if (rng() < (v.greeted ? CFG.visitGreetedAccessoryChance : CFG.visitAccessoryChance)) {
    // The UI picks which accessory (it knows what's already owned): see drainAccessoryInbox.
    s.visitAccGifts = (s.visitAccGifts ?? 0) + 1;
    gift = 'something stylish behind';
  } else if (rng() < CFG.visitItemChance) {
    const id = weighted(PERKS.on ? { ...DROPS.visit, ...PERK_DROPS.visit } : DROPS.visit, rng);
    const name = ITEMS[id].name;
    gift = grantItem(s, id).includes('full') ? `a ${name}, but inventory is full` : `a gift: ${name}`;
  }
  if (v.friend) log(s, t, `<-- ${visitHandle(s, v)} has quit (${gift ? `left ${gift}` : 'see you around'})`);
  else log(s, t, `> the visitor logged off.${gift ? ` it left ${gift}.` : ''}`);
}

// --- attention rewards ---------------------------------------------------------------------
// Opt-in: each is a bonus for a player who is around, and missing one costs nothing.

// Can it ask for something, or mutter to itself? Awake, idle, and nothing else going on.
const idle = (s) => !resting(s) && !s.run && rebootMinutesLeft(s) === 0 && !s.event;

export const requestMinutesLeft = (s) => (s.request ? Math.max(0, CFG.requestWindowMin - (s.ageMin - s.request.startedAge)) : 0);

function stepRequest(s, t, rng) {
  if (s.request) {
    // Sleep, a nap, a netrun or a crash ends it quietly; so does waiting too long.
    if (resting(s) || s.run || rebootMinutesLeft(s) > 0) s.request = null;
    else if (requestMinutesLeft(s) === 0) {
      s.request = null;
      log(s, t, '> it stopped asking.');
    }
    return;
  }
  if (!idle(s) || s.stats.charge < CFG.requestMinCharge) return;
  if (rng() >= CFG.requestChancePerHour / 60) return;
  // COOL only when it would work; otherwise one named game.
  const warm = s.stats.heat >= CFG.requestCoolHeat;
  if (warm && rng() < 0.25) {
    s.request = { kind: 'cool', startedAge: s.ageMin };
    log(s, t, '> it is fanning itself. it wants a COOL.');
  } else {
    let game = pick(GAME_IDS, rng);
    if (PREF.on && PREF.reqbias) {
      // 2.0: a steady netling asks for one of its last two distinct plays, an unsteady one for a game not among them.
      const lv = temperLevel(s);
      const last = s.lastGames ?? [];
      if (lv > 0 && last.length) game = pick(last, rng);
      else if (lv < 0 && last.length) game = pick(GAME_IDS.filter((g) => !last.includes(g)), rng);
    }
    s.request = { kind: 'game', game, startedAge: s.ageMin };
    log(s, t, `> it wants to play ${game.toUpperCase()}.`);
  }
}

// Does this action answer the open request? Clears it if so.
function answerRequest(s, action, game) {
  const r = s.request;
  if (!r) return false;
  const met = (r.kind === 'cool' && action === 'cool') || (r.kind === 'game' && action === 'play' && game === r.game);
  if (met) s.request = null;
  return met;
}

export const inFlow = (s) => s.flowMin >= CFG.flowAfterMin;
export const overclocked = (s) => (brakeLocked(s, 'heat') ? false : SIDES.on && SIDES.teenStates && s.stage === 'baby' ? false : SIDES.on && SIDES.owner === null && SIDES.heat.hold > 0 ? Boolean(s.sideHeld?.heat) : s.stats.heat >= CFG.overclockHeat);
// Iron is the owner of Heat: with ironBenefit above 1 its Overclock benefits (win drops, visits) grow by that factor (1 = the 1.0 rule).
const ocBoost = (m) => (SIDES.on && SIDES.owner === null ? 1 + (m - 1) * SIDES.ironBenefit : m);
const visitMult = (s) => (overclocked(s) ? ocBoost(CFG.overclockVisitMult) : inFlow(s) ? CFG.flowVisitMult : 1) * (sideOf(s, 'sync') === 'hi' ? 1 + SIDES.sync.visit * sideM('sync') : 1);
// How fast mini-games and ICE run: slower while overclocked.
export const gameSpeed = (s) => (overclocked(s) ? CFG.overclockGameSpeed : 1);

function stepFlow(s) {
  const st = s.stats;
  const good = !s.asleep && !s.nap && !s.run && !s.event && !s.virus && s.cache < 3 && rebootMinutesLeft(s) === 0 &&
    st.charge >= CFG.flowMinStat && st.sync >= CFG.flowMinStat && st.integrity >= CFG.flowMinIntegrity && st.heat < CFG.flowMaxHeat &&
    !(SIDES.on && SIDES.flowShared && (sideOf(s, 'charge') === 'hi' || sideOf(s, 'sync') === 'hi'));
  s.flowMin = good ? s.flowMin + 1 : 0;
  if (inFlow(s)) s.flowTotalMin++;
}

function stepOverclock(s, t) {
  if (overclocked(s) && !resting(s)) s.hotTotalMin++;
  if (overclocked(s) === s.hot) return;
  s.hot = !s.hot;
  log(s, t, s.hot ? '> !! overclocked. everything feels slower. mistakes cost more.' : '> clock speed back to spec.');
}

function stepChatter(s, rng) {
  if (s.chatter && (resting(s) || s.ageMin - s.chatter.startedAge >= CFG.chatterShowMin)) s.chatter = null;
  if (s.chatter || !idle(s) || rng() >= CFG.chatterChancePerHour / 60) return;
  const pool = chatterPool(s, lineOf(s.form));
  if (pool.length) s.chatter = { id: pick(pool, rng).id, startedAge: s.ageMin };
}

export function infect(s, damage) {
  s.virus = true;
  s.virusMin = 0;
  s.virusCount = (s.virusCount ?? 0) + 1;
  s.stats.integrity = clamp(s.stats.integrity - damage);
}

function crash(s) {
  s.stats.integrity = clamp(s.stats.integrity - CFG.overflowCrashIntegrity);
  s.cache = CFG.maxCache;
  s.rebootUntilAge = s.ageMin + CFG.rebootMin;
}

export const rebootMinutesLeft = (s) => Math.max(0, (s.rebootUntilAge ?? 0) - s.ageMin);

// --- netrun uplink cooldown ----------------------------------------------------------------
// run.js starts and ends runs; the clock lives here so items can shorten it.

export function runCooldownTotal(s) {
  const base = CFG.runCooldownMin[s.stage] ?? CFG.runCooldownMin.baby;
  return Math.max(CFG.runCooldownFloorMin, base - (s.runCooldownCut ?? 0));
}

export function runCooldownLeft(s) {
  if (s.lastRunEndAge == null) return 0;
  return Math.max(0, s.lastRunEndAge + runCooldownTotal(s) - s.ageMin);
}

// At the floor, nothing makes it shorter: any sooner and corp sweeps pick up the trail.
export const runCooldownAtFloor = (s) => runCooldownTotal(s) <= CFG.runCooldownFloorMin;

export const shielded = (s) => (s.buffs?.shieldUntilAge ?? 0) > s.ageMin;

// Adds an item if there's room. Returns a log suffix.
export const ITEM_METER = { granted: 0, scrapped: 0, scrapScrip: 0, byId: {} }; // sums over lives, for item-sweep.mjs (what the inventory could not hold)
export function grantItem(s, id) {
  ITEM_METER.granted++;
  ITEM_METER.byId[id] = (ITEM_METER.byId[id] ?? 0) + 1;
  if (!hasRoom(s.inventory, id)) {
    const value = sellValue(id);
    ITEM_METER.scrapped++;
    ITEM_METER.scrapScrip += value;
    const over = addScrip(s, value);
    return ` found ${ITEMS[id].name}, but inventory is full: scrapped for ${value} scrip${over ? ' (scrip full)' : ''}.`;
  }
  s.inventory.push(id);
  return ` found: ${ITEMS[id].name}.`;
}

// After a timed event is answered (or a surge), a Segfault now and then.
function segfaultDrop(s, rng) {
  return rng() < ITEM_CFG.eventSegfaultChance ? grantItem(s, 'segfault') : '';
}

function maybeDrop(s, source, chance, rng) {
  const hit = rng() < chance;
  if (hit && source === 'win') SIDE_METER.drops++;
  return hit ? grantItem(s, weighted(PERKS.on ? { ...DROPS[source], ...PERK_DROPS[source] } : DROPS[source], rng)) : '';
}

// Minutes left to respond to the current timed event (0 when there is none).
export function eventMinutesLeft(s) {
  const e = s.event && EVENTS[s.event.type];
  return e ? (s.event.window ?? CFG[e.window]) - (s.ageMin - s.event.startedAge) : 0;
}

export function traceMinutesLeft(s) {
  return s.event?.type === 'trace' ? eventMinutesLeft(s) : 0;
}

// 2.0 measurements kept on the state: awake minutes at each shown temper level, and the longest unbroken awake hold at each
// strong level (the Metronome's unlock test, docs/NETLING_2_SKETCH.md). Sleep pauses a hold, a change of shown level ends it, and
// an awake minute at neglect level 2 is not counted (the clock pauses, it does not reset).
function stepHold(s, rest) {
  if (rest) return;
  s.levelMin ??= { '-2': 0, '-1': 0, 0: 0, 1: 0, 2: 0 };
  s.levelMin[s.tLevel]++;
  const h = (s.hold ??= { level: 0, min: 0, best: { '-2': 0, 2: 0 } });
  if (h.level !== s.tLevel) {
    h.level = s.tLevel;
    h.min = 0;
  }
  s.neglect2Min ??= 0;
  if (neglectLevel(s.stats) >= 2) {
    s.neglect2Min++;
    return;
  }
  if (Math.abs(h.level) === 2) {
    h.min++;
    h.best[h.level] = Math.max(h.best[h.level], h.min);
    // The age (netling minutes) at which a 12 hour hold was first reached at each strong level.
    s.holdFirst ??= {};
    if (h.min === 720 && s.holdFirst[h.level] === undefined) s.holdFirst[h.level] = s.ageMin;
  }
}

function checkMistake(s, t, key, cond, label, grace = CFG.mistakeGraceMin) {
  if (!cond) {
    s.zeroMin[key] = 0;
    s.flagged[key] = false;
    return;
  }
  s.zeroMin[key]++;
  if (s.zeroMin[key] >= grace && !s.flagged[key]) {
    s.flagged[key] = true;
    s.careMistakes++;
    s.temper -= CFG.faultTemper;
    s.faultRolls++; // a bug roll, settled in step() with its rng
    log(s, t, `> care mistake: ${label}. [${s.careMistakes}]`);
  }
}

// --- 2.0 evolution (docs/NETLING_2_SKETCH.md, Evolution) ---------------------------------------------------

// A choice among options: each option's weight falls with its gap to the leader (CFG.tieWeights, indexed by the gap's whole part).
// Standing is fractional underneath (the HUD shows floors), wins are whole numbers.
const gapWeights = (scores) => {
  const top = Math.max(...Object.values(scores));
  return Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, CFG.tieWeights[gapIndex(top - v)]]));
};
// The hidden paths: the true gap between the tracks is within the band (whole-number cutpoint, fractional Standing).
const tracksWithin = (s, band) => Math.abs(s.standing.corp - s.standing.street) <= band + 1e-9;
const winsOf = (s) => GAME_IDS.map((id) => s.games?.[id]?.won ?? 0);

// The hidden-path teen: every game won shellMinWinsEach times and the two tracks within a point.
export const hiddenTeenMet = (s) => winsOf(s).every((w) => w >= CFG.shellMinWinsEach) && tracksWithin(s, CFG.hiddenBand);
// The hidden adult: ghostMinWinsEach in every game, ghostMinGameWins in all, and the tracks within a point.
export const hiddenAdultMet = (s) => {
  const w = winsOf(s);
  return w.every((x) => x >= CFG.ghostMinWinsEach) && w.reduce((a, b) => a + b, 0) >= CFG.ghostMinGameWins && tracksWithin(s, CFG.hiddenBand);
};
export const ghostWinsMet = hiddenAdultMet;

// Forms the player has never raised (s.newForms) weigh newFormWeight more, after the gap weights.
const withFresh = (s, pool) => {
  const fresh = new Set(s.newForms ?? []);
  return Object.fromEntries(Object.entries(pool).map(([f, w]) => [f, fresh.has(f) ? w * CFG.newFormWeight : w]));
};

// The teen's candidates and weights: the leading Standing track, or both when the gap is a tie. Never empty when a track is
// ahead by 5 or more: the other weighs 0.
export function teenCandidates(s) {
  const lean = gapWeights({ corp: s.standing.corp, street: s.standing.street });
  return withFresh(s, { teenCorp: lean.corp, teenStreet: lean.street });
}
export function teenForm(s, rng = null) {
  if (hiddenTeenMet(s)) return 'teenHidden';
  const pool = teenCandidates(s);
  if (rng) return weighted(pool, rng);
  return pool.teenCorp >= pool.teenStreet ? 'teenCorp' : 'teenStreet';
}

// The adult's candidates: role (the game with the most wins) and Standing lean are weighted by their gaps and rolled together.
export function adultCandidates(s) {
  const lean = gapWeights({ corp: s.standing.corp, street: s.standing.street });
  const role = gapWeights(Object.fromEntries(ROLES.map((r) => [r, s.games?.[r]?.won ?? 0])));
  const pool = {};
  for (const r of ROLES) for (const l of LEANS) pool[roleForm(r, l)] = role[r] * lean[l];
  return withFresh(s, Object.fromEntries(Object.entries(pool).filter(([, w]) => w > 0)));
}
export function adultForm(s, rng = null) {
  if (process.env.FORCE_ADULT && FORMS[process.env.FORCE_ADULT]) return process.env.FORCE_ADULT; // measurement aid: every netling grows into this form
  if (hiddenAdultMet(s)) return 'hidden';
  const pool = adultCandidates(s);
  if (rng) return weighted(pool, rng);
  return Object.keys(pool).reduce((best, f) => (pool[f] > pool[best] ? f : best));
}
export const leaningForm = adultForm;

function evolve(s, t, stage, form) {
  s.stage = stage;
  s.form = form;
  if (stage === 'teen') s.teenForm = form;
  s.evolvedAt = t;
  log(s, t, `> recompiling... netling is now ${SPECIES[form].name.toUpperCase()}.`);
}

// Older saves predate evolution fields.
export function migrate(s) {
  s.form ??= 'baby';
  s.evolvedAt ??= null;
  s.games ??= freshGames();
  for (const id of GAME_IDS) s.games[id] ??= { played: 0, won: 0 }; // games added since it was saved
  s.event ??= null;
  s.lastSurgeAt ??= null;
  s.teenForm ??= s.stage === 'teen' ? s.form : null;
  s.inventory ??= [];
  s.buffs ??= { shieldUntilAge: 0, traceSkip: false, boost: false };
  s.run ??= null;
  s.rootAccess ??= false;
  s.rootUsed ??= false;
  s.rootCooling ??= false;
  s.hibernation ??= null;
  s.lastWakeAt ??= null;
  s.lastRunEndAge ??= null;
  s.runStats ??= { runs: 0, jacked: 0, disconnected: 0, aborted: 0 };
  s.nap ??= null;
  s.lastNapEndAge ??= null;
  s.rebootUntilAge ??= null;
  s.runCooldownCut ??= 0;
  s.visit ??= null;
  s.visitAccGifts ??= 0;
  s.friends ??= [];
  s.nl0Rests ??= false;
  s.life ??= { ...LEGACY_LIFE }; // compiled before lives were shortened: it keeps its seven days
  s.newForms ??= [];
  s.cleared ??= clearedForStage(s.stage); // from before the unlock order: nothing it could reach closes
  s.codexFound ??= 0;
  s.traitLevel ??= 1; // from before trait levels: every inherited trait was level 1
  s.history ??= null;
  s.scrip ??= 0;
  s.zone ??= deviceZone(s.lastTick ?? 0); // from before KI-12: the device's zone, as it always used
  s.request ??= null;
  s.contract ??= null;
  s.contractCheckAge ??= null;
  s.wokeAt ??= null;
  s.deepExits ??= { all: 0, clean: 0 };
  s.lifeBonus ??= 0;
  s.flowMin ??= 0;
  s.hot ??= false;
  s.hotTotalMin ??= 0;
  s.flowTotalMin ??= 0;
  s.chatter ??= null;
  return s;
}

export const inheritedScrip = (s) => Math.floor((s.scrip ?? 0) * SCRIP.inherit);

// What a netling that ends as `form` leaves the next generation. Its own inherited trait becomes the
// child's history; if it ended as the same form as its parent, the trait's level goes up (a streak).
// A mainframe passes its trait on at level II or higher (CFG.mainframeTraitLevel).
export function fragmentOf(s, form) {
  const trait = FORMS[form]?.trait ?? null;
  const streak = s.trait === trait ? Math.min((s.traitLevel ?? 1) + 1, TRAIT_CFG.maxLevel) : 1;
  const level = isMainframeForm(s.form) ? Math.max(streak, Math.min(CFG.mainframeTraitLevel, TRAIT_CFG.maxLevel)) : streak;
  return { form, trait, quirk: { ...s.quirk }, keepsake: KEEPSAKES[form], rootUsed: s.rootUsed, scrip: inheritedScrip(s), level, history: s.trait ?? null };
}

// NL-0 pulls a netling back from its first premature flatline. Old age still wins.
function rootRescue(s, t, cause) {
  if (!s.rootAccess || s.rootUsed || cause === 'end of life cycle') return false;
  s.rootUsed = true;
  const st = s.stats;
  st.integrity = Math.max(st.integrity, 25);
  st.charge = Math.max(st.charge, 25);
  st.sync = Math.max(st.sync, 25);
  s.virus = false;
  s.integrityZeroMin = 0;
  s.careMistakes = Math.min(s.careMistakes, CFG.maxMistakes - 1);
  log(s, t, `> ${s.nl0Rests ? 'NL-0 (asleep)' : 'NL-0'}: not yet. (${cause} reversed. root access spent for this generation.)`);
  return true;
}

function flatline(s, t, cause, rng = null) {
  if (rootRescue(s, t, cause)) return;
  s.stage = 'dead';
  s.deathCause = cause;
  s.diedAt = t;
  // An open netrun dies with it: nothing is banked, and nothing should keep driving a dead netling.
  if (s.run) log(s, t, '> the netrun link went dead. loot lost.');
  s.run = null;
  const form = FORMS[lineOf(s.form)] ? lineOf(s.form) : adultForm(s, rng);
  s.fragment = fragmentOf(s, form);
  log(s, t, `> FLATLINE: ${cause}. fragment recovered: ${s.fragment.trait ? TRAITS[s.fragment.trait].name : 'none'}.`);
}

// --- naps ---------------------------------------------------------------------------------

function endNap(s, t, msg) {
  s.nap = null;
  s.lastNapEndAge = s.ageMin;
  if (msg) log(s, t, msg);
}

export const napMinutesLeft = (s) => (s.nap ? Math.max(0, CFG.napMaxMin - (s.ageMin - s.nap.startedAge)) : 0);

export function napCooldownLeft(s) {
  if (s.lastNapEndAge == null) return 0;
  return Math.max(0, s.lastNapEndAge + CFG.napCooldownMin - s.ageMin);
}

// Why a nap can't start right now, or null (waking from one is always allowed).
export function napBlockReason(s) {
  if (s.nap) return null;
  if (s.asleep) return 'already asleep.';
  if (s.run) return 'finish the netrun first.';
  const cd = napCooldownLeft(s);
  if (cd > 0) return `not tired yet. ${cd >= 60 ? `${Math.ceil(cd / 60)}h` : `${cd}m`} until it can nap again.`;
  return null;
}

// Why an action can't happen right now, or null. The UI checks 'play' before launching a game.
export function blockReason(s, action) {
  if (s.stage === 'dead') return 'no signal.';
  if (s.hibernation) return 'hibernating.';
  if (s.stage === 'script' && action !== 'lights') return 'still compiling...';
  if (rebootMinutesLeft(s) > 0 && action !== 'lights') return `rebooting. ${rebootMinutesLeft(s)}m left.`;
  if (resting(s) && ['corp', 'scav', 'play', 'cool'].includes(action)) return s.nap ? 'napping. wake it first.' : 'in low-power mode.';
  if (action === 'play' && s.stats.charge < 10 + (SIDES.on && s.stats.charge <= SIDES[ 'charge' ].lo ? SIDES.charge.gate * sideM('charge') : 0)) return 'not enough charge to play.';
  if ((action === 'hide' || action === 'comply') && s.event?.type !== 'trace') return 'no active trace.';
  if (action === 'defend' && s.event?.type !== 'attack') return 'no intrusion to defend against.';
  if (action === 'greet' && !s.visit) return 'nobody is here.';
  if (action === 'greet' && s.visit.greeted) return 'already said hello.';
  return null;
}

// --- hibernation ---------------------------------------------------------------------------

export function hibernateBlockReason(s, now) {
  if (!isAlive(s)) return s.stage === 'script' ? 'still compiling...' : 'no signal.';
  if (s.hibernation) return 'already hibernating.';
  if (s.run) return 'finish the netrun first.';
  if (s.event) return `deal with the ${EVENTS[s.event.type].label.toLowerCase()} first.`;
  if (rebootMinutesLeft(s) > 0) return 'still rebooting.';
  if (s.lastWakeAt !== null && now - s.lastWakeAt < CFG.hibernateCooldownMin * MIN) {
    const h = Math.ceil((CFG.hibernateCooldownMin * MIN - (now - s.lastWakeAt)) / (60 * MIN));
    return `still groggy from the last one. ${h}h until it can hibernate again.`;
  }
  return null;
}

export function hibernate(s, now, rng = Math.random) {
  tick(s, now, rng); // settle everything up to this moment
  const blocked = hibernateBlockReason(s, now);
  if (blocked) return fail(blocked);
  s.hibernation = { since: now };
  log(s, now, '> entering hibernation. clock frozen.');
  return ok('hibernating.', 'lights');
}

export const wakeAvailableAt = (s) => (s.hibernation ? s.hibernation.since + CFG.hibernateMinMin * MIN : null);

export function wake(s, now) {
  if (!s.hibernation) return fail('not hibernating.');
  if (now < wakeAvailableAt(s)) return fail('too soon to wake it.');
  const days = Math.round((now - s.hibernation.since) / (24 * 60 * MIN));
  s.hibernation = null;
  s.lastTick = now; // the frozen stretch never happened
  s.lastWakeAt = now;
  log(s, now, `> resumed from hibernation after ${days} day${days === 1 ? '' : 's'}.`);
  return ok('awake again.', 'boot');
}

// Why an item in a slot can't be used right now, or null.
export function itemBlockReason(s, slot) {
  const base = blockReason(s, 'use');
  if (base) return base;
  const id = s.inventory?.[slot];
  if (!id) return 'empty slot.';
  // The daily trace keeps nothing at stake (netrun/daily.js), and an item's effects reach past the run.
  if (s.run?.daily) return 'no items on the daily trace.';
  if (ITEMS[id].awake && resting(s)) return s.nap ? 'napping. wake it first.' : 'in low-power mode.';
  if (id === 'repair' && s.stats.integrity >= 100) return 'integrity already at 100.';
  if (id === 'overclock') {
    if (runCooldownLeft(s) === 0) return 'the uplink is already open.';
    if (runCooldownAtFloor(s)) return 'laying low from corp sweeps. it can\'t go any faster.';
  }
  return null;
}

// Player actions. Returns { ok, msg, sfx }. 'play' takes { game, won } from the finished mini-game.
export function act(s, action, now, rng = Math.random, opts = {}) {
  const blocked = blockReason(s, action);
  if (blocked) return fail(blocked);
  const st = s.stats;

  let res;
  switch (action) {
    case 'corp':
    case 'scav': {
      if (st.charge >= 95) return fail('buffer full. refused.');
      actEarly(s, 'charge');
      let gain = action === 'corp' ? 30 : 25;
      if (action === 'corp') gain *= 1 + traitEffect(s, 'licensed');
      gain *= 1 + traitEffect(s, 'foraging');
      st.charge = clamp(st.charge + gain);
      st.heat = clamp(st.heat + 2);
      st.sync = clamp(st.sync + mod(s, action === 'corp' ? 'corpSync' : 'scavSync', 0));
      s.standing[action === 'corp' ? 'corp' : 'street'] += CFG.feedStanding;
      s.sinceFed = 0;
      let msg = action === 'corp' ? 'licensed packet consumed.' : 'scavenged data consumed.';
      {
        const lv = temperLevel(s);
        const match = lv > 0 ? s.lastPacket === action : lv < 0 ? Boolean(s.lastPacket) && s.lastPacket !== action : false;
        msg += prefApply(s, match);
        if (WET.on && s.lastPacket && s.lastPacket !== action) wetSwitch(s, now);
        s.feeds = (s.feeds ?? 0) + 1;
        s.lastPacket = action;
      }
      if (s.quirk.favPacket === action) {
        st.sync = clamp(st.sync + 8);
        msg += ' it loves these.';
      }
      if (action === 'scav' && !s.virus && !shielded(s)) {
        const chance = 0.12 * (1 - traitEffect(s, 'hardened')) * mod(s, 'virusMult') * mod(s, 'scavVirusMult');
        if (rng() < chance) {
          s.virus = true;
          s.virusMin = 0;
          s.virusCount = (s.virusCount ?? 0) + 1;
          msg += ' !! payload was infected.';
        }
      }
      res = ok(msg, 'feed');
      break;
    }
    case 'play': {
      const { game, won = false } = opts;
      if (!GAME_IDS.includes(game)) return fail('unknown game.');
      const hot = overclocked(s); // it played at this Heat, before this game's own
      actEarly(s, 'sync');
      let gain = won ? CFG.playWinSync : CFG.playLoseSync;
      gain *= 1 + traitEffect(s, 'volatile');
      if (sideOf(s, 'charge') === 'hi') gain *= 1 + SIDES.charge.playGain * sideM('charge');
      SIDE_METER.plays++;
      // Graduated penalty (penStep > 0): inside Wired, plays below penFree are free; each play at penFree or over adds penStep to the
      // infection chance (x owner multiplier, capped at penCap) until the state ends.
      if (SIDES.on && SIDES.sync.penStep > 0 && heldNow(s, 'sync') && st.sync >= SIDES.sync.penFree) {
        s.wiredOver = (s.wiredOver ?? 0) + 1;
        if (!s.virus && !shielded(s) && rng() < Math.min(SIDES.sync.penCap, SIDES.sync.penStep * s.wiredOver * sideM('sync'))) {
          SIDE_METER.penHits++;
          infect(s, SIDES.sync.penDmg);
          log(s, now, '> too wired to play. !! virus signature detected.');
        }
      }
      // Burnout (burnN > 0): inside Wired, burnN plays at penFree or over end the state, and it cannot be re-entered for burnCool minutes.
      if (SIDES.on && SIDES.sync.burnN > 0 && heldNow(s, 'sync') && st.sync >= SIDES.sync.penFree) {
        s.burnCount = (s.burnCount ?? 0) + 1;
        if (s.burnCount >= SIDES.sync.burnN) {
          s.sideHeld.sync = false;
          s.sideHold.sync = 0;
          s.burnCount = 0;
          s.burnUntil = s.ageMin + SIDES.sync.burnCool;
          SIDE_METER.burns++;
          log(s, now, '> burned out. too wired for too long.');
        }
      }
      // Playing while Sync is at penLine or over risks an infection (penP x owner multiplier): too wired to play safely.
      if (SIDES.on && SIDES.sync.penLine > 0 && st.sync >= SIDES.sync.penLine && !s.virus && !shielded(s) && rng() < SIDES.sync.penP * sideM('sync')) {
        SIDE_METER.penHits++;
        infect(s, SIDES.sync.penDmg);
        log(s, now, '> too wired to play. !! virus signature detected.');
      }
      if (gain > 0) SIDE_METER.playGain += gain;
      // A lost game while overclocked costs instead of consoling.
      if (hot && !won) {
        gain = CFG.overclockLoseSync;
        st.integrity = clamp(st.integrity - CFG.overclockLoseIntegrity);
      }
      const boosted = won && s.buffs.boost;
      if (boosted) {
        gain *= 2;
        s.buffs.boost = false;
      }
      st.sync = clamp(st.sync + gain);
      st.charge = clamp(st.charge - 6 + (game === 'feast' ? (won ? CFG.feastWinCharge : CFG.feastLoseCharge) : 0));
      st.heat = clamp(st.heat + 12);
      if (st.heat > 70) s.temper -= 0.5;
      {
        const lv = temperLevel(s);
        const last = s.lastGames ?? [];
        const match = lv > 0 ? last.includes(game) : lv < 0 ? last.length > 0 && !last.includes(game) : false;
        prefApply(s, match);
        pushGame(s, game);
      }
      s.games[game].played++;
      if (won) s.games[game].won += boosted ? 2 : 1;
      let msg = won
        ? `${game}: won${boosted ? ' (boosted x2)' : ''}. sync up.`
        : hot
          ? `${game}: lost, overclocked. it took that hard.`
          : `${game}: lost. it had fun anyway.`;
      if (won) msg += maybeDrop(s, 'win', ITEM_CFG.winDropChance * (hot ? ocBoost(CFG.overclockDropMult) : 1) * dropSides(s), rng);
      const asked = answerRequest(s, 'play', game);
      if (asked) msg += ' just what it asked for.';
      res = { ...ok(msg, won ? 'win' : 'lose'), requestMet: asked };
      break;
    }
    case 'hide': {
      eventAnswered(s, now);
      s.event = null;
      st.charge = clamp(st.charge - 10);
      st.heat = clamp(st.heat + 10);
      s.standing.street += 1;
      res = ok(`rerouted through proxies. trace lost.${maybeDrop(s, 'hide', ITEM_CFG.hideDropChance, rng)}`, 'patch');
      break;
    }
    case 'comply': {
      eventAnswered(s, now);
      s.event = null;
      st.sync = clamp(st.sync - CFG.complySync);
      s.standing.corp += 1;
      res = ok(`handshake accepted. corp scan complete.${maybeDrop(s, 'comply', ITEM_CFG.complyDropChance, rng)}`, 'feed');
      break;
    }
    case 'discard': {
      // SCRAP: sold for a quarter of its price, so a market is always the better place to sell.
      const id = s.inventory?.[opts.slot];
      if (!id) return fail('empty slot.');
      s.inventory.splice(opts.slot, 1);
      const value = sellValue(id);
      const over = addScrip(s, value);
      res = ok(`${ITEMS[id].name.toLowerCase()} scrapped for ${value} scrip.${over ? ' scrip full: the rest is lost.' : ''}`, 'purge');
      break;
    }
    case 'use': {
      const slot = opts.slot;
      const blockedItem = itemBlockReason(s, slot);
      if (blockedItem) return fail(blockedItem);
      const id = s.inventory[slot];
      const msg = useItem(s, id, rng);
      s.inventory.splice(slot, 1);
      // Bare metal (netrun/challenges.js): using an item mid-run ends the challenge (the UI asks first).
      const broke = challengeOn(s.run, 'baremetal') && voidChallenge(s.run, 'an item was used.');
      res = ok(`${msg}${broke ? ' bare metal broken.' : ''}`, 'patch');
      break;
    }
    case 'patch': {
      if (!s.virus) return fail('scan complete. no threats.');
      s.virus = false;
      st.integrity = clamp(st.integrity + 10 + mod(s, 'cureBonus', 0));
      s.temper += s.virusMin <= 30 ? 1 : -1;
      res = ok('virus quarantined.', 'patch');
      break;
    }
    case 'greet': {
      // Said hello to a visitor: it may pass on a line from the wider net, and leaves a gift more often.
      s.visit.greeted = true;
      const line = pick(visitorLines(), rng);
      s.chatter = { id: line.id, startedAge: s.ageMin };
      const v = s.visit;
      res = { ...ok(v.friend ? `said hello to ${visitHandle(s, v)}.` : `said hello to the ${visitorName(s, v)}.`, 'visit'), greeted: true };
      if (v.friend) res.friend = { form: v.form, ...v.friend };
      break;
    }
    case 'cool': {
      if (st.heat < 30) return fail('already running cool.');
      st.heat = clamp(st.heat - 35);
      st.integrity = clamp(st.integrity + CFG.careIntegrity);
      const asked = answerRequest(s, 'cool');
      res = { ...ok(`coolant flushed.${asked ? ' just what it asked for.' : ''}`, 'cool'), requestMet: asked };
      break;
    }
    case 'purge': {
      if (s.event?.type === 'overflow') {
        eventAnswered(s, now);
        s.event = null;
        s.cache = 0;
        s.temper += 0.5;
        st.integrity = clamp(st.integrity + CFG.careIntegrity);
        res = ok(`buffers flushed. overflow contained.${segfaultDrop(s, rng)}`, 'purge');
        break;
      }
      if (s.cache === 0) return fail('cache is clean.');
      s.cache = 0;
      s.temper += 0.5;
      st.integrity = clamp(st.integrity + CFG.careIntegrity);
      res = ok('cache purged.', 'purge');
      break;
    }
    case 'defend': {
      // The DEFEND mini-game's result, like 'play' but for an intrusion.
      if (opts.won) eventAnswered(s, now);
      s.event = null;
      if (opts.won) {
        s.temper += CFG.attackRepelledTemper;
        res = ok(`intrusion repelled.${segfaultDrop(s, rng)}`, 'win');
      } else {
        infect(s, CFG.attackLandedIntegrity);
        res = ok(`defense breached. virus installed. -${CFG.attackLandedIntegrity} integrity.${segfaultDrop(s, rng)}`, 'lose');
      }
      break;
    }
    case 'nap': {
      if (s.nap) {
        endNap(s, now, null);
        res = ok('woke it from its nap.', 'boot');
        break;
      }
      const blockedNap = napBlockReason(s);
      if (blockedNap) return fail(blockedNap);
      s.nap = { startedAge: s.ageMin };
      res = ok(`napping. up to ${CFG.napMaxMin / 60}h of low drain.`, 'lights');
      break;
    }
    case 'lights': {
      s.lightsOn = !s.lightsOn;
      const msg = s.lightsOn ? 'lights on.' : resting(s) ? 'lights off.' : "lights off. it's awake and bored in the dark.";
      res = ok(msg, 'lights');
      break;
    }
    default:
      return fail('unknown command.');
  }
  log(s, now, `> ${res.msg}`);
  return res;
}

function useItem(s, id, rng) {
  const st = s.stats;
  const name = ITEMS[id].name.toLowerCase();
  switch (id) {
    case 'coolant':
      st.heat = clamp(st.heat - 50);
      s.temper += 1; // 2.0
      return `${name} vented. heat down.`;
    case 'antivirus': {
      const cured = s.virus;
      s.temper += 1; // 2.0
      s.virus = false;
      s.buffs.shieldUntilAge = s.ageMin + ITEM_CFG.shieldMinutes;
      return `${name} applied.${cured ? ' virus purged.' : ''} shielded for 6h.`;
    }
    case 'voucher':
      st.charge = 100;
      s.standing.corp += 1;
      if (s.event?.type === 'trace') {
        s.event = null;
        return `${name} redeemed. charge full. trace waved off.`;
      }
      s.buffs.traceSkip = true;
      return `${name} redeemed. charge full. next trace pre-cleared.`;
    case 'blackice': {
      st.sync = clamp(st.sync + 40);
      st.heat = clamp(st.heat + 20);
      s.standing.street += 1;
      s.temper -= 1;
      if (!s.virus && !shielded(s) && rng() < ITEM_CFG.blackIceVirusChance) {
        s.virus = true;
        s.virusMin = 0;
        return `${name} jacked in. sync surging. !! it carried a virus.`;
      }
      return `${name} jacked in. sync surging.`;
    }
    case 'decoy':
      s.standing.street += 1;
      if (s.event?.type === 'attack') {
        s.event = null;
        return `${name} deployed. intrusion waved off.`;
      }
      s.buffs.attackSkip = true;
      return `${name} deployed. next intrusion pre-cleared.`;
    case 'salvage': {
      st.charge = clamp(st.charge + 50);
      s.standing.street += 1;
      if (!s.virus && !shielded(s) && rng() < 0.12) {
        s.virus = true;
        s.virusMin = 0;
        s.virusCount = (s.virusCount ?? 0) + 1;
        return `${name} consumed. charge up. !! payload was infected.`;
      }
      return `${name} consumed. charge up.`;
    }
    case 'booster':
      s.buffs.boost = true;
      return `${name} armed. next win counts double.`;
    case 'repair':
      st.integrity = clamp(st.integrity + 40);
      return `${name} applied. integrity restored.`;
    case 'segfault': {
      // 2.0: two faults on purpose, temper -4 (two faults at -1 and -2 more; a proposal), and bugs: 25% none, 60% one, 15% two.
      s.careMistakes += ITEM_CFG.segfaultFaults;
      s.temper -= SEGFAULT_TEMPER;
      const u = rng();
      const n = u < BUG_CFG.segfault[0] ? 0 : u < BUG_CFG.segfault[0] + BUG_CFG.segfault[1] ? 1 : 2;
      for (let i = 0; i < n; i++) rollBug(s, rng, 1);
      return `${name} triggered. care mistakes on purpose. [${s.careMistakes}]`;
    }
    case 'overclock': {
      const before = runCooldownLeft(s);
      s.runCooldownCut = (s.runCooldownCut ?? 0) + CFG.overclockCutMin;
      return `${name} slotted. uplink cooldown cut by ${before - runCooldownLeft(s)}m.`;
    }
    case 'memory': {
      const keys = ['palette', 'pitch', 'idle', 'favPacket'];
      const key = keys[Math.floor(rng() * keys.length)];
      const before = s.quirk[key];
      for (let i = 0; i < 8 && s.quirk[key] === before; i++) s.quirk[key] = rollQuirk(rng, { origin: s.rootAccess })[key];
      return `${name} decoded. its ${key === 'favPacket' ? 'favorite packet' : key} changed.`;
    }
  }
  return 'nothing happened.';
}

const ok = (msg, sfx) => ({ ok: true, msg, sfx });
const fail = (msg) => ({ ok: false, msg, sfx: 'error' });

// The most urgent reason to call the player back, or null. Drives sounds and notifications.
export function alertReason(s) {
  if (!isAlive(s)) return null;
  const st = s.stats;
  if (s.event?.type === 'trace') return { key: 'trace', msg: `Corp trace incoming. ${traceMinutesLeft(s)}m to respond.` };
  if (s.event?.type === 'attack') return { key: 'attack', msg: `Intrusion attempt. DEFEND within ${eventMinutesLeft(s)}m.` };
  if (s.event?.type === 'overflow') return { key: 'overflow', msg: `Memory overflow. PURGE within ${eventMinutesLeft(s)}m.` };
  if (s.virus) return { key: 'virus', msg: 'Virus detected. Patch it before Integrity collapses.' };
  if (st.charge < 20) return { key: 'charge', msg: 'Charge is running low.' };
  if (st.sync < 20) return { key: 'sync', msg: 'Sync is fading. It wants to play.' };
  if (st.heat > 80) return { key: 'heat', msg: 'Running hot. Flush the coolant.' };
  if (s.asleep && s.lightsOn) return { key: 'lights', msg: "It's trying to sleep. Kill the lights." };
  if (s.cache >= 3) return { key: 'cache', msg: 'Corrupted cache is piling up.' };
  return null;
}

// Needs that warrant the blinking attention icon.
export function needsAttention(s) {
  if (!isAlive(s)) return false;
  const st = s.stats;
  return (
    st.charge < 20 ||
    st.sync < 20 ||
    st.heat > 80 ||
    s.cache >= 2 ||
    s.virus ||
    Boolean(s.event) ||
    (s.asleep && s.lightsOn)
  );
}
