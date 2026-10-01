// Netling simulation core. Pure-ish: every function takes the state, a time
// (ms epoch) and an rng, so tests can drive it deterministically.
import { accessoryById, rollWornAccessory } from './accessories.js';
import { weighted } from './random.js';
import { clearedForStage } from './netrun/regions.js';
import { chatterPool, visitorLines } from './chatter.js';

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
  uptimeStabilityPerHour: 0.1, // awake hours with nothing wrong build stability
  maxMistakes: 10,
  flatlineIntegrityMin: 120,
  // A five-day life. Each netling keeps the lengths it compiled with (s.life), so a change here
  // never shortens one that is already alive.
  lifespanMin: 5 * 24 * 60,
  teenAtMin: 17 * 60,
  adultAtMin: 51 * 60,
  // The Mainframe stage (docs/SOURCE_PLAN.md), off until its art and UI land. An adult recompiles into its line's
  // mainframe form once it is home, has lived into its last ordinary day, and has proved itself in The Deep this life
  // (three exits, or two clean ones); it gains a day of life and passes its trait on at level II or higher.
  mainframe: false,
  mainframeBeforeEndMin: 24 * 60,
  mainframeBonusMin: 24 * 60,
  mainframeExits: 3,
  mainframeCleanExits: 2,
  mainframeTraitLevel: 2,
  teenGoodCareMaxMistakes: 2,
  // The Shell: a teen on Ghost's path (Ghost's allegiance band, no chaos, few faults, and every
  // game won at least this often).
  shellMaxMistakes: 1,
  shellMinWinsEach: 3,
  // Adult evolution: axes within this of each other (or of zero) are a tie, broken at random,
  // with forms the player has never raised weighted up.
  tieBand: 0.5,
  newFormWeight: 1.2,
  // Hibernation: a long pause that freezes the clock. Minimum stay and cooldown keep it for
  // vacations, not for skipping a work day.
  hibernateMinMin: 24 * 60,
  hibernateCooldownMin: 3 * 24 * 60,
  sleepStart: 22,
  sleepEnd: 7,
  ghostBand: 2, // |allegiance| must stay under this, and stability can't be negative
  ghostMinGameWins: 29,
  ghostMinWinsEach: 4,
  playWinSync: 25,
  playLoseSync: 8,
  // Packet Feast: it ate, so it gets some Charge too (digestion isn't reset: no cache files).
  feastWinCharge: 10,
  feastLoseCharge: 3,
  traceChancePerHour: 0.08,
  traceWindowMin: 120,
  traceIgnoredIntegrity: 15,
  traceIgnoredAllegiance: 1,
  surgeChancePerHour: 0.03,
  // Virus attack: an intrusion to DEFEND against (a mini-game) before it lands.
  attackChancePerHour: 0.04,
  attackWindowMin: 60,
  attackLandedIntegrity: 10,
  attackRepelledStability: 1,
  // Memory overflow: PURGE before the buffers burst, or it crashes and reboots.
  overflowChancePerHour: 0.02,
  overflowPerCachePerHour: 0.02, // each cache file makes it likelier
  overflowWindowMin: 45,
  overflowCrashIntegrity: 15,
  rebootMin: 20,
  // Integrity recovers whenever nothing is wrong, faster while it rests in the dark or naps.
  // Tuned so an attentive player can bring it from 0 to 100 in about 16 hours with care actions.
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
  // Attention rewards (see docs/ATTENTION.md): nothing here costs a fault when missed.
  // Requests: now and then it asks for one game, or for COOL when warm.
  requestChancePerHour: 0.25,
  requestWindowMin: 45,
  requestMinCharge: 20, // it only asks for a game it has the Charge to play
  requestCoolHeat: 30, // and for COOL only when COOL would work
  // Flow: kept in good shape this long, awake, it glows (a look only).
  flowAfterMin: 180,
  flowMinStat: 50, // Charge and Sync
  flowMinIntegrity: 80,
  flowMaxHeat: 60,
  // Chatter: a line it mutters, shown this long.
  chatterChancePerHour: 0.15,
  chatterShowMin: 20,
  // Netrun uplink cooldown by stage, cut by clean jack-outs and overclock chips, never below the floor:
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

export const INVENTORY_SLOTS = 6;
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
  overclock: { name: 'Overclock chip', desc: 'Cuts 1h off the netrun uplink cooldown (never below 2h).' },
  segfault: { name: 'Segfault', desc: 'Crashes it on purpose: +2 faults. Faults shape how it grows up, and ten end its life.', awake: true },
};

// Corpo scrip: a netling's money, spent with Charge at netrun markets. Prices follow rarity.
export const SCRIP = {
  max: 100, // anything over the cap is lost, so spending stays a choice
  inherit: 0.5, // the next generation starts with half, rounded down
  sellMarket: 0.5, // selling at a netrun market pays half the price
  sellElsewhere: 0.25, // scrapping at home, or a pickup that meets a full inventory, a quarter
  price: { coolant: 15, antivirus: 15, repair: 15, booster: 15, memory: 15, blackice: 25, voucher: 25, segfault: 25, overclock: 50 },
};

export const sellValue = (id, atMarket = false) => Math.floor((SCRIP.price[id] ?? 0) * (atMarket ? SCRIP.sellMarket : SCRIP.sellElsewhere));

// Adds scrip up to the cap. Returns how much went over it and was lost.
export function addScrip(s, n) {
  const before = s.scrip ?? 0;
  s.scrip = Math.min(SCRIP.max, before + n);
  return before + n - s.scrip;
}

// Weighted drop tables per source.
const DROPS = {
  win: { coolant: 3, antivirus: 2, booster: 2, blackice: 2, repair: 2, memory: 1, overclock: 1, segfault: 1 },
  hide: { blackice: 2, memory: 1, coolant: 1, overclock: 1, segfault: 1 },
  comply: { voucher: 3, antivirus: 1, repair: 1 },
  visit: { coolant: 2, booster: 2, repair: 2, memory: 1, overclock: 1 },
};

// What each adult form leaves behind for the next generation.
export const KEEPSAKES = {
  chrome: 'voucher',
  firewall: 'antivirus',
  daemon: 'coolant',
  glitch: 'blackice',
  ghost: 'memory',
};

export const FORMS = {
  chrome: { name: 'Chrome', trait: 'licensed' },
  firewall: { name: 'Firewall', trait: 'hardened' },
  daemon: { name: 'Daemon', trait: 'persistent' },
  glitch: { name: 'Glitch', trait: 'volatile' },
  ghost: { name: 'Ghost', trait: 'untraceable' },
};

// Every body a netling can have. Adult forms also appear in FORMS.
export const SPECIES = {
  bitling: { name: 'Bitling', stage: 'baby' },
  kernel: { name: 'Kernel', stage: 'teen' },
  stub: { name: 'Stub', stage: 'teen' },
  shell: { name: 'Shell', stage: 'teen' },
  chrome: { name: 'Chrome', stage: 'adult' },
  firewall: { name: 'Firewall', stage: 'adult' },
  daemon: { name: 'Daemon', stage: 'adult' },
  glitch: { name: 'Glitch', stage: 'adult' },
  ghost: { name: 'Ghost', stage: 'adult' },
  // Mainframe forms: each grows from one adult form (its line) and keeps that line's trait, keepsake, perk and ability.
  plat: { name: 'Plat', stage: 'mainframe', line: 'chrome' },
  airgap: { name: 'Airgap', stage: 'mainframe', line: 'firewall' },
  init: { name: 'Init', stage: 'mainframe', line: 'daemon' },
  panic: { name: 'Panic', stage: 'mainframe', line: 'glitch' },
  whisper: { name: 'Whisper', stage: 'mainframe', line: 'ghost' },
};

// The adult form a body belongs to: itself for an adult, its line for a mainframe (and itself for anything else).
export const lineOf = (form) => SPECIES[form]?.line ?? form;
// Each adult form's mainframe form.
export const MAINFRAME_OF = Object.fromEntries(Object.entries(SPECIES).filter(([, x]) => x.line).map(([id, x]) => [x.line, id]));
export const isMainframeForm = (form) => SPECIES[form]?.stage === 'mainframe';

// In-life perks of each adult form (separate from inherited traits).
export const FORM_MODS = {
  chrome: { desc: 'Loves corp packets, sulks at scavenged data' },
  firewall: { desc: '-30% virus chance', virusMult: 0.7 },
  daemon: { desc: 'Charge drains 20% slower', chargeDrainMult: 0.8 },
  glitch: { desc: 'Play is a gamble: +10 to +40 Sync' },
  ghost: { desc: 'All drains 15% slower', chargeDrainMult: 0.85, syncDrainMult: 0.85 },
};

const mod = (s, key, fallback = 1) => FORM_MODS[lineOf(s.form)]?.[key] ?? fallback;

export const isAlive = (s) => s.stage !== 'script' && s.stage !== 'dead';
// Asleep for the night, or napping: either way it rests and can't eat, play or run.
export const resting = (s) => s.asleep || Boolean(s.nap);

export const TRAITS = {
  licensed: { name: 'Licensed', desc: 'Corp packets restore more Charge' },
  hardened: { name: 'Hardened', desc: 'Catches viruses less often' },
  persistent: { name: 'Persistent', desc: 'Drains slower while it rests' },
  volatile: { name: 'Volatile', desc: 'Bigger play rewards, but Integrity drains faster' },
  untraceable: { name: 'Untraceable', desc: 'Corp traces find it less often' },
};

// Trait strength. The parent's trait applies at level strength (1, then +levelStep for each
// generation in a row that ended as the same form, up to maxLevel); the grandparent's trait comes
// back as its history at half strength, and adds to the trait when they match. Each trait is capped.
// `full` is each effect at strength 1.
export const TRAIT_CFG = {
  history: 0.5,
  levelStep: 0.25,
  maxLevel: 3,
  full: {
    licensed: 0.25, // corp packets restore +25% Charge
    hardened: 0.5, // -50% virus chance
    persistent: 0.3, // drains 30% slower while resting
    volatile: 0.5, // play rewards x1.5; costs volatileIntegrity per hour
    untraceable: 0.6, // corp traces 60% less often
  },
  volatileIntegrity: 0.75, // Integrity per hour at strength 1
  // Caps, from measurement (balance pass 3): Persistent's fewer faults shift adult forms, Volatile's
  // Integrity cost hurts casual players, and Untraceable would be an immunity again above 1.25.
  cap: { licensed: 1.5, hardened: 1.5, persistent: 1.25, volatile: 1.25, untraceable: 1.25 },
};

export const levelStrength = (level) => 1 + TRAIT_CFG.levelStep * (Math.min(Math.max(level ?? 1, 1), TRAIT_CFG.maxLevel) - 1);

// How strongly trait `id` applies to this netling: 0 if it has neither the trait nor its history.
export function traitStrength(s, id) {
  let st = 0;
  if (s.trait === id) st += levelStrength(s.traitLevel);
  if (s.history === id) st += TRAIT_CFG.history;
  return Math.min(st, TRAIT_CFG.cap[id] ?? st);
}

// "Persistent", or "Persistent II" for a trait held two generations in a row.
export const traitLabel = (id, level = 1) => (id ? `${TRAITS[id].name}${level > 1 ? ` ${['', 'I', 'II', 'III', 'IV', 'V'][level] ?? level}` : ''}` : null);

// The effect size of trait `id` for this netling (TRAIT_CFG.full times its strength).
const traitEffect = (s, id) => TRAIT_CFG.full[id] * traitStrength(s, id);

export const PALETTES = [
  { name: 'ice', main: '#05d9e8', accent: '#ff2a6d' },
  { name: 'neon', main: '#ff2a6d', accent: '#05d9e8' },
  { name: 'acid', main: '#f9f002', accent: '#ff2a6d' },
  { name: 'toxic', main: '#39ff14', accent: '#05d9e8' },
  { name: 'ultra', main: '#b967ff', accent: '#f9f002' },
  // NL-0's colors: only rolls for netlings compiled with root access.
  { name: 'origin', main: '#e8e8ff', accent: '#b967ff' },
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
export const mainframeFeat = (s) => (s.deepExits?.all ?? 0) >= CFG.mainframeExits || (s.deepExits?.clean ?? 0) >= CFG.mainframeCleanExits;
// Whether it would recompile now (whether or not the stage is switched on): an adult, home, old enough, feat met.
export const mainframeDue = (s) => s.stage === 'adult' && !s.run && s.ageMin >= mainframeAt(s) && mainframeFeat(s);

// A new generation: fresh quirk, with one quirk key copied from the fragment.
// newForms: adult forms the player has never raised; they win ties a little more often.
// rootAccess: the codex is complete, so NL-0 watches over this generation,
// unless NL-0 spent itself rescuing the previous one: then it rests for a generation.
export function createScript({ now, generation = 1, fragment = null, rng = Math.random, rootAccess = false, newForms = [] }) {
  const rootCooling = rootAccess && Boolean(fragment?.rootUsed);
  if (rootCooling) rootAccess = false;
  const quirk = rollQuirk(rng, { origin: rootAccess || rootCooling });
  let inheritedQuirk = null;
  if (fragment?.quirk) {
    inheritedQuirk = pick(QUIRK_KEYS, rng);
    quirk[inheritedQuirk] = fragment.quirk[inheritedQuirk];
  }
  return {
    saveVersion: SAVE_VERSION,
    generation,
    life: lifeFromCfg(),
    newForms: newForms.filter((f) => FORMS[f]),
    stage: 'script',
    form: 'bitling',
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
    zeroMin: { charge: 0, sync: 0, heat: 0, lights: 0 },
    flagged: { charge: false, sync: false, heat: false, lights: false },
    integrityZeroMin: 0,
    axes: { allegiance: 0, stability: 0 },
    games: freshGames(),
    event: null,
    lastSurgeAt: null,
    inventory: fragment?.keepsake ? [fragment.keepsake] : [],
    buffs: { shieldUntilAge: 0, traceSkip: false, boost: false },
    run: null,
    rootAccess,
    rootUsed: false,
    rootCooling,
    lastRunEndAge: null,
    runCooldownCut: 0,
    visit: null,
    visitAccGifts: 0,
    request: null, // { kind: 'game' | 'cool', game?, startedAge }
    contract: null, // an open netrun job: { kind, region, n?, scrip, item, postedAge } (netrun/run.js)
    contractCheckAge: null, // the netling minute the UI last looked at posting one
    wokeAt: null, // when it last woke from the night's sleep (not a nap or hibernation)
    deepExits: { all: 0, clean: 0 }, // exits from The Deep this life, and the clean ones (the Mainframe gate)
    lifeBonus: 0, // minutes of life gained (a mainframe's extra day)
    flowMin: 0, // minutes in a row in good shape, awake
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
      ...(rootCooling ? [{ t: now, msg: '> NL-0: i reached for the last one. i need to rest. be careful with this one.' }] : []),
    ],
    deathCause: null,
    diedAt: null,
    fragment: null,
  };
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
    evolve(s, t, 'teen', teenForm(s));
  } else if (s.stage === 'teen' && s.ageMin >= s.life.adultAt) {
    evolve(s, t, 'adult', leaningForm(s, rng));
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
  st.charge = clamp(st.charge - (CFG.drainPerHour.charge / 60) * rate * drainCurve(st.charge) * mod(s, 'chargeDrainMult'));
  const dark = !rest && !s.lightsOn ? CFG.darkAwakeSyncMult : 1;
  st.sync = clamp(st.sync - (CFG.drainPerHour.sync / 60) * rate * dark * drainCurve(st.sync) * mod(s, 'syncDrainMult'));
  st.heat = clamp(
    st.heat + (rest ? -CFG.heatCoolWhileAsleepPerHour : CFG.heatDriftPerHour) / 60,
  );

  if (!rest && s.sinceFed < CFG.digestMinutes && s.cache < CFG.maxCache && rng() < CFG.cacheChancePerMin) {
    s.cache++;
    log(s, t, '> corrupted cache file written.');
  }
  s.sinceFed++;

  // No fresh infections while it rests: it's offline, not browsing.
  if (!s.virus && !shielded(s) && !rest) {
    let perHour = CFG.virusBasePerHour + CFG.virusPerCachePerHour * s.cache;
    perHour *= 1 - traitEffect(s, 'hardened');
    perHour *= mod(s, 'virusMult');
    if (rng() < perHour / 60) {
      s.virus = true;
      s.virusMin = 0;
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
  // Real rest (asleep in the dark, or a nap) repairs faster; a restless sleep with the lights on doesn't.
  const deepRest = s.nap || (s.asleep && !s.lightsOn);
  if (dInt === 0) dInt = deepRest ? CFG.integrityRestRegenPerHour : CFG.integrityRegenPerHour;
  dInt -= TRAIT_CFG.volatileIntegrity * traitStrength(s, 'volatile');
  st.integrity = clamp(st.integrity + dInt / 60);

  if (st.heat >= 85) s.axes.stability -= 1 / 60;
  else if (!rest && !alertReason(s)) s.axes.stability += CFG.uptimeStabilityPerHour / 60;

  stepVisit(s, t, rng);
  stepEvents(s, t, rng);
  stepRequest(s, t, rng);
  stepFlow(s);
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
    if (type === 'trace') {
      st.integrity = clamp(st.integrity - CFG.traceIgnoredIntegrity);
      s.axes.allegiance += CFG.traceIgnoredAllegiance;
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
  if (rng() < (CFG.traceChancePerHour * (1 - traitEffect(s, 'untraceable'))) / 60) {
    if (s.buffs?.traceSkip) {
      s.buffs.traceSkip = false;
      log(s, t, '> corp trace waved off by voucher.');
      return;
    }
    s.event = { type: 'trace', startedAge: s.ageMin };
    log(s, t, `> !! corp trace incoming. ${CFG.traceWindowMin}m to respond.`);
  } else if (!s.virus && rng() < CFG.attackChancePerHour / 60) {
    if (shielded(s)) {
      log(s, t, '> intrusion attempt bounced off the antivirus shield.');
      return;
    }
    s.event = { type: 'attack', startedAge: s.ageMin };
    log(s, t, `> !! intrusion attempt. DEFEND within ${CFG.attackWindowMin}m.`);
  } else if (rng() < (CFG.overflowChancePerHour + CFG.overflowPerCachePerHour * s.cache) / 60) {
    s.event = { type: 'overflow', startedAge: s.ageMin };
    log(s, t, `> !! memory overflow. PURGE within ${CFG.overflowWindowMin}m.`);
  } else if (rng() < CFG.surgeChancePerHour / 60) {
    st.heat = clamp(st.heat + 25);
    st.charge = clamp(st.charge + 10);
    s.lastSurgeAt = t;
    log(s, t, `> !! power surge. running hot.${segfaultDrop(s, rng)}`);
  } else if (!s.visit && !s.run && rebootMinutesLeft(s) === 0 && rng() < CFG.visitChancePerHour / 60) {
    startVisit(s, t, rng);
  }
}

// --- visitors ------------------------------------------------------------------------------

function startVisit(s, t, rng) {
  const len = CFG.visitMinMin + Math.floor(rng() * (CFG.visitMaxMin - CFG.visitMinMin + 1));
  // Mainframe forms visit only once the stage is switched on.
  const form = pick(Object.keys(SPECIES).filter((f) => CFG.mainframe || !isMainframeForm(f)), rng);
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

// While a visitor is here, Sync and Heat rise a little each minute. It leaves when time's up,
// or early if the netling rests, crashes or jacks in. Now and then it leaves a gift.
function stepVisit(s, t, rng) {
  const v = s.visit;
  if (!v) return;
  if (resting(s) || s.run || rebootMinutesLeft(s) > 0) {
    s.visit = null;
    log(s, t, '> the visitor logged off.');
    return;
  }
  s.stats.sync = clamp(s.stats.sync + CFG.visitSync / v.len);
  s.stats.heat = clamp(s.stats.heat + CFG.visitHeat / v.len);
  if (s.ageMin - v.startedAge < v.len) return;
  s.visit = null;
  let gift = '';
  if (rng() < (v.greeted ? CFG.visitGreetedAccessoryChance : CFG.visitAccessoryChance)) {
    // The UI picks which accessory (it knows what's already owned): see drainAccessoryInbox.
    s.visitAccGifts = (s.visitAccGifts ?? 0) + 1;
    gift = ' it left something stylish behind.';
  } else if (rng() < CFG.visitItemChance) {
    const id = weighted(DROPS.visit, rng);
    const name = ITEMS[id].name;
    gift = grantItem(s, id).includes('full') ? ` it left a ${name}, but inventory is full.` : ` it left a gift: ${name}.`;
  }
  log(s, t, `> the visitor logged off.${gift}`);
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
    const game = pick(GAME_IDS, rng);
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

function stepFlow(s) {
  const st = s.stats;
  const good = !s.asleep && !s.nap && !s.run && !s.event && !s.virus && s.cache < 3 && rebootMinutesLeft(s) === 0 &&
    st.charge >= CFG.flowMinStat && st.sync >= CFG.flowMinStat && st.integrity >= CFG.flowMinIntegrity && st.heat < CFG.flowMaxHeat;
  s.flowMin = good ? s.flowMin + 1 : 0;
  if (inFlow(s)) s.flowTotalMin++;
}

function stepChatter(s, rng) {
  if (s.chatter && (resting(s) || s.ageMin - s.chatter.startedAge >= CFG.chatterShowMin)) s.chatter = null;
  if (s.chatter || !idle(s) || rng() >= CFG.chatterChancePerHour / 60) return;
  const pool = chatterPool(s, lineOf(s.form));
  if (pool.length) s.chatter = { id: pick(pool, rng).id, startedAge: s.ageMin };
}

function infect(s, damage) {
  s.virus = true;
  s.virusMin = 0;
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
export function grantItem(s, id) {
  if (s.inventory.length >= INVENTORY_SLOTS) {
    const value = sellValue(id);
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
  return rng() < chance ? grantItem(s, weighted(DROPS[source], rng)) : '';
}

// Minutes left to respond to the current timed event (0 when there is none).
export function eventMinutesLeft(s) {
  const e = s.event && EVENTS[s.event.type];
  return e ? CFG[e.window] - (s.ageMin - s.event.startedAge) : 0;
}

export function traceMinutesLeft(s) {
  return s.event?.type === 'trace' ? eventMinutesLeft(s) : 0;
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
    s.axes.stability -= 2;
    log(s, t, `> care mistake: ${label}. [${s.careMistakes}/${CFG.maxMistakes}]`);
  }
}

// The teen form: Stub after a rough first stretch, the Shell on Ghost's path, else Kernel.
export function teenForm(s) {
  if (s.careMistakes > CFG.teenGoodCareMaxMistakes) return 'stub';
  const { allegiance: a, stability: b } = s.axes;
  const played = GAME_IDS.every((id) => (s.games?.[id]?.won ?? 0) >= CFG.shellMinWinsEach);
  if (Math.abs(a) < CFG.ghostBand && b >= 0 && s.careMistakes <= CFG.shellMaxMistakes && played) return 'shell';
  return 'kernel';
}

// The adult forms the axes point to, with their weights. Usually one; within CFG.tieBand it is a
// tie: allegiance and stability about as strong as each other, or an axis about zero (both of its
// forms). Forms the player has never raised (s.newForms) weigh a little more.
export function leaningCandidates(s) {
  const { allegiance: a, stability: b } = s.axes;
  const band = CFG.tieBand;
  const side = (v, pos, neg) => (Math.abs(v) < band ? [pos, neg] : [v >= 0 ? pos : neg]);
  const byAllegiance = side(a, 'chrome', 'firewall');
  const byStability = side(b, 'daemon', 'glitch');
  const gap = Math.abs(a) - Math.abs(b);
  const forms = Math.abs(gap) < band ? [...byAllegiance, ...byStability] : gap > 0 ? byAllegiance : byStability;
  const fresh = new Set(s.newForms ?? []);
  return Object.fromEntries(forms.map((f) => [f, fresh.has(f) ? CFG.newFormWeight : 1]));
}

// Which adult form the current axes lean toward. Ties are broken with rng; without one (a save
// being repaired), the heaviest candidate wins, then the first.
export function leaningForm(s, rng = null) {
  const { allegiance: a, stability: b } = s.axes;
  if (Math.abs(a) < CFG.ghostBand && b >= 0 && s.careMistakes <= 1 && ghostWinsMet(s)) {
    return 'ghost';
  }
  const pool = leaningCandidates(s);
  const forms = Object.keys(pool);
  if (forms.length === 1) return forms[0];
  if (rng) return weighted(pool, rng);
  return forms.reduce((best, f) => (pool[f] > pool[best] ? f : best));
}

export function ghostWinsMet(s) {
  const wins = GAME_IDS.map((id) => s.games?.[id]?.won ?? 0);
  return wins.every((w) => w >= CFG.ghostMinWinsEach) && wins.reduce((a, b) => a + b, 0) >= CFG.ghostMinGameWins;
}

function evolve(s, t, stage, form) {
  s.stage = stage;
  s.form = form;
  if (stage === 'teen') s.teenForm = form;
  s.evolvedAt = t;
  log(s, t, `> recompiling... netling is now ${SPECIES[form].name.toUpperCase()}.`);
}

// Older saves predate evolution fields.
export function migrate(s) {
  s.form ??= 'bitling';
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
  s.flowTotalMin ??= 0;
  s.chatter ??= null;
  return s;
}

export const inheritedScrip = (s) => Math.floor((s.scrip ?? 0) * SCRIP.inherit);

// What a netling that ends as `form` leaves the next generation. Its own inherited trait becomes the
// child's history; if it ended as the same form as its parent, the trait's level goes up (a streak).
// A mainframe passes its trait on at level II or higher (CFG.mainframeTraitLevel).
export function fragmentOf(s, form) {
  const trait = FORMS[form].trait;
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
  log(s, t, `> NL-0: not yet. (${cause} reversed. root access spent for this generation.)`);
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
  const form = FORMS[lineOf(s.form)] ? lineOf(s.form) : leaningForm(s, rng);
  s.fragment = fragmentOf(s, form);
  log(s, t, `> FLATLINE: ${cause}. fragment recovered: ${TRAITS[s.fragment.trait].name}.`);
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
  if (action === 'play' && s.stats.charge < 10) return 'not enough charge to play.';
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
      let gain = action === 'corp' ? 30 : 25;
      if (action === 'corp') gain *= 1 + traitEffect(s, 'licensed');
      st.charge = clamp(st.charge + gain);
      st.heat = clamp(st.heat + 2);
      s.axes.allegiance += action === 'corp' ? 1 : -1;
      s.sinceFed = 0;
      let msg = action === 'corp' ? 'licensed packet consumed.' : 'scavenged data consumed.';
      if (s.quirk.favPacket === action) {
        st.sync = clamp(st.sync + 8);
        msg += ' it loves these.';
      }
      if (lineOf(s.form) === 'chrome') {
        st.sync = clamp(st.sync + (action === 'corp' ? 5 : -5));
        if (action === 'scav') msg += ' it looks disgusted.';
      }
      if (action === 'scav' && !s.virus && !shielded(s)) {
        const chance = 0.12 * (1 - traitEffect(s, 'hardened')) * mod(s, 'virusMult');
        if (rng() < chance) {
          s.virus = true;
          s.virusMin = 0;
          msg += ' !! payload was infected.';
        }
      }
      res = ok(msg, 'feed');
      break;
    }
    case 'play': {
      const { game, won = false } = opts;
      if (!GAME_IDS.includes(game)) return fail('unknown game.');
      let gain = won ? CFG.playWinSync : CFG.playLoseSync;
      if (lineOf(s.form) === 'glitch') gain = 10 + Math.floor(rng() * 31);
      gain *= 1 + traitEffect(s, 'volatile');
      const boosted = won && s.buffs.boost;
      if (boosted) {
        gain *= 2;
        s.buffs.boost = false;
      }
      st.sync = clamp(st.sync + gain);
      st.charge = clamp(st.charge - 6 + (game === 'feast' ? (won ? CFG.feastWinCharge : CFG.feastLoseCharge) : 0));
      st.heat = clamp(st.heat + 12);
      if (st.heat > 70) s.axes.stability -= 0.5;
      s.games[game].played++;
      if (won) s.games[game].won += boosted ? 2 : 1;
      let msg = won ? `${game}: won${boosted ? ' (boosted x2)' : ''}. sync up.` : `${game}: lost. it had fun anyway.`;
      if (won) msg += maybeDrop(s, 'win', ITEM_CFG.winDropChance, rng);
      const asked = answerRequest(s, 'play', game);
      if (asked) msg += ' just what it asked for.';
      res = { ...ok(msg, won ? 'win' : 'lose'), requestMet: asked };
      break;
    }
    case 'hide': {
      s.event = null;
      st.charge = clamp(st.charge - 10);
      st.heat = clamp(st.heat + 10);
      s.axes.allegiance -= 1;
      res = ok(`rerouted through proxies. trace lost.${maybeDrop(s, 'hide', ITEM_CFG.hideDropChance, rng)}`, 'patch');
      break;
    }
    case 'comply': {
      s.event = null;
      st.integrity = clamp(st.integrity - 5);
      st.sync = clamp(st.sync - 10);
      s.axes.allegiance += 1;
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
      res = ok(msg, 'patch');
      break;
    }
    case 'patch': {
      if (!s.virus) return fail('scan complete. no threats.');
      s.virus = false;
      st.integrity = clamp(st.integrity + 10);
      s.axes.stability += s.virusMin <= 30 ? 1 : -1;
      res = ok('virus quarantined.', 'patch');
      break;
    }
    case 'greet': {
      // Said hello to a visitor: it may pass on a line from the wider net, and leaves a gift more often.
      s.visit.greeted = true;
      const line = pick(visitorLines(), rng);
      s.chatter = { id: line.id, startedAge: s.ageMin };
      res = { ...ok(`said hello to the ${SPECIES[s.visit.form].name.toLowerCase()}.`, 'visit'), greeted: true };
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
        s.event = null;
        s.cache = 0;
        s.axes.stability += 0.5;
        st.integrity = clamp(st.integrity + CFG.careIntegrity);
        res = ok(`buffers flushed. overflow contained.${segfaultDrop(s, rng)}`, 'purge');
        break;
      }
      if (s.cache === 0) return fail('cache is clean.');
      s.cache = 0;
      s.axes.stability += 0.5;
      st.integrity = clamp(st.integrity + CFG.careIntegrity);
      res = ok('cache purged.', 'purge');
      break;
    }
    case 'defend': {
      // The DEFEND mini-game's result, like 'play' but for an intrusion.
      s.event = null;
      if (opts.won) {
        s.axes.stability += CFG.attackRepelledStability;
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
      return `${name} vented. heat down.`;
    case 'antivirus': {
      const cured = s.virus;
      s.virus = false;
      s.buffs.shieldUntilAge = s.ageMin + ITEM_CFG.shieldMinutes;
      return `${name} applied.${cured ? ' virus purged.' : ''} shielded for 6h.`;
    }
    case 'voucher':
      st.charge = 100;
      s.axes.allegiance += 1;
      if (s.event?.type === 'trace') {
        s.event = null;
        return `${name} redeemed. charge full. trace waved off.`;
      }
      s.buffs.traceSkip = true;
      return `${name} redeemed. charge full. next trace pre-cleared.`;
    case 'blackice': {
      st.sync = clamp(st.sync + 40);
      st.heat = clamp(st.heat + 20);
      s.axes.allegiance -= 1;
      s.axes.stability -= 1;
      if (!s.virus && !shielded(s) && rng() < ITEM_CFG.blackIceVirusChance) {
        s.virus = true;
        s.virusMin = 0;
        return `${name} jacked in. sync surging. !! it carried a virus.`;
      }
      return `${name} jacked in. sync surging.`;
    }
    case 'booster':
      s.buffs.boost = true;
      return `${name} armed. next win counts double.`;
    case 'repair':
      st.integrity = clamp(st.integrity + 40);
      return `${name} applied. integrity restored.`;
    case 'segfault': {
      // Deliberate faults count like any other: the same stability cost, the same limit.
      s.careMistakes += ITEM_CFG.segfaultFaults;
      s.axes.stability -= 2 * ITEM_CFG.segfaultFaults;
      return `${name} triggered. care mistakes on purpose. [${s.careMistakes}/${CFG.maxMistakes}]`;
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
