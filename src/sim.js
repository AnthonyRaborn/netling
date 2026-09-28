// Netling simulation core. Pure-ish: every function takes the state, a time
// (ms epoch) and an rng, so tests can drive it deterministically.
import { accessoryById, rollWornAccessory } from './accessories.js';

export const MIN = 60_000;
export const SAVE_VERSION = 1;

export const CFG = {
  bootMinutes: 3,
  drainPerHour: { charge: 14, sync: 12 },
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
  lifespanMin: 7 * 24 * 60,
  teenAtMin: 24 * 60,
  adultAtMin: 72 * 60,
  teenGoodCareMaxMistakes: 2,
  // Hibernation: a long pause that freezes the clock. Minimum stay and cooldown keep it for
  // vacations, not for skipping a work day.
  hibernateMinMin: 24 * 60,
  hibernateCooldownMin: 3 * 24 * 60,
  sleepStart: 22,
  sleepEnd: 7,
  ghostBand: 2, // |allegiance| must stay under this, and stability can't be negative
  ghostMinGameWins: 22,
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
  // A stray netling drops by to play: awake only, no response needed.
  visitChancePerHour: 0.03,
  visitMinMin: 5,
  visitMaxMin: 10,
  visitSync: 15,
  visitHeat: 10,
  visitItemChance: 0.1,
  visitAccessoryChance: 0.01,
  visitWearsAccessoryChance: 0.75, // most visitors show off something from the wider net
  // Netrun uplink cooldown by stage, cut by clean jack-outs and overclock chips, never below the floor:
  // any sooner and corp sweeps pick up the trail.
  runCooldownMin: { baby: 240, teen: 210, adult: 180 },
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
};

// Weighted drop tables per source.
const DROPS = {
  win: { coolant: 3, antivirus: 2, booster: 2, blackice: 2, repair: 2, memory: 1, overclock: 1 },
  hide: { blackice: 2, memory: 1, coolant: 1, overclock: 1 },
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
  chrome: { name: 'Chrome', stage: 'adult' },
  firewall: { name: 'Firewall', stage: 'adult' },
  daemon: { name: 'Daemon', stage: 'adult' },
  glitch: { name: 'Glitch', stage: 'adult' },
  ghost: { name: 'Ghost', stage: 'adult' },
};

// In-life perks of each adult form (separate from inherited traits).
export const FORM_MODS = {
  chrome: { desc: 'Loves corp packets, sulks at scavenged data' },
  firewall: { desc: '-30% virus chance', virusMult: 0.7 },
  daemon: { desc: 'Charge drains 20% slower', chargeDrainMult: 0.8 },
  glitch: { desc: 'Play is a gamble: +10 to +40 Sync' },
  ghost: { desc: 'All drains 15% slower', chargeDrainMult: 0.85, syncDrainMult: 0.85 },
};

const mod = (s, key, fallback = 1) => FORM_MODS[s.form]?.[key] ?? fallback;

export const isAlive = (s) => s.stage !== 'script' && s.stage !== 'dead';
// Asleep for the night, or napping: either way it rests and can't eat, play or run.
export const resting = (s) => s.asleep || Boolean(s.nap);

export const TRAITS = {
  licensed: { name: 'Licensed', desc: 'Corp packets restore +25% Charge' },
  hardened: { name: 'Hardened', desc: '-50% virus chance' },
  persistent: { name: 'Persistent', desc: 'Drains 30% slower while asleep' },
  volatile: { name: 'Volatile', desc: 'Play rewards x1.5, Integrity drains faster' },
  untraceable: { name: 'Untraceable', desc: 'Immune to corp traces' },
};

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

// A new generation: fresh quirk, with one quirk key copied from the fragment.
// rootAccess: the codex is complete, so NL-0 watches over this generation,
// unless NL-0 spent itself rescuing the previous one: then it rests for a generation.
export function createScript({ now, generation = 1, fragment = null, rng = Math.random, rootAccess = false }) {
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
    runStats: { runs: 0, jacked: 0, disconnected: 0, aborted: 0 },
    trait: fragment?.trait ?? null,
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

export function bedtimeHour(s) {
  return (CFG.sleepStart + (s.quirk?.sleepOffset ?? 0) + 24) % 24;
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

  if (s.stage === 'baby' && s.ageMin >= CFG.teenAtMin) {
    evolve(s, t, 'teen', s.careMistakes <= CFG.teenGoodCareMaxMistakes ? 'kernel' : 'stub');
  } else if (s.stage === 'teen' && s.ageMin >= CFG.adultAtMin) {
    evolve(s, t, 'adult', leaningForm(s));
  }

  const shouldSleep = isSleepHour(new Date(t).getHours(), s.quirk.sleepOffset);
  if (s.nap && (shouldSleep || s.ageMin - s.nap.startedAge >= CFG.napMaxMin)) {
    endNap(s, t, shouldSleep ? null : '> nap over. back online.');
  }
  if (shouldSleep && !s.asleep) {
    s.asleep = true;
    log(s, t, '> entering low-power mode. kill the lights.');
  } else if (!shouldSleep && s.asleep) {
    s.asleep = false;
    s.lightsOn = true;
    log(s, t, '> resuming from low-power mode.');
  }

  const st = s.stats;
  const rest = resting(s);
  let rate = s.asleep ? (s.lightsOn ? CFG.sleepDrainMult : CFG.sleepDarkDrainMult) : s.nap ? CFG.napDrainMult : 1;
  if (rest && s.trait === 'persistent') rate *= 0.7;
  st.charge = clamp(st.charge - (CFG.drainPerHour.charge / 60) * rate * mod(s, 'chargeDrainMult'));
  const dark = !rest && !s.lightsOn ? CFG.darkAwakeSyncMult : 1;
  st.sync = clamp(st.sync - (CFG.drainPerHour.sync / 60) * rate * dark * mod(s, 'syncDrainMult'));
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
    if (s.trait === 'hardened') perHour *= 0.5;
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
  if (s.trait === 'volatile') dInt -= 1;
  st.integrity = clamp(st.integrity + dInt / 60);

  if (st.heat >= 85) s.axes.stability -= 1 / 60;
  else if (!rest && !alertReason(s)) s.axes.stability += CFG.uptimeStabilityPerHour / 60;

  stepVisit(s, t, rng);
  stepEvents(s, t, rng);

  checkMistake(s, t, 'charge', st.charge <= 0, 'charge depleted');
  checkMistake(s, t, 'sync', st.sync <= 0, 'sync lost');
  checkMistake(s, t, 'heat', st.heat >= 100, 'thermal overload');
  checkMistake(s, t, 'lights', s.asleep && s.lightsOn, 'no rest with the lights on', CFG.lightsGraceMin);

  s.integrityZeroMin = st.integrity <= 0 ? s.integrityZeroMin + 1 : 0;

  if (s.integrityZeroMin >= CFG.flatlineIntegrityMin) flatline(s, t, 'integrity collapse');
  else if (s.careMistakes >= CFG.maxMistakes) flatline(s, t, 'neglect');
  else if (s.ageMin >= CFG.lifespanMin) flatline(s, t, 'end of life cycle');
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
  if (s.trait !== 'untraceable' && rng() < CFG.traceChancePerHour / 60) {
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
    log(s, t, '> !! power surge. running hot.');
  } else if (!s.visit && !s.run && rebootMinutesLeft(s) === 0 && rng() < CFG.visitChancePerHour / 60) {
    startVisit(s, t, rng);
  }
}

// --- visitors ------------------------------------------------------------------------------

function startVisit(s, t, rng) {
  const len = CFG.visitMinMin + Math.floor(rng() * (CFG.visitMaxMin - CFG.visitMinMin + 1));
  const form = pick(Object.keys(SPECIES), rng);
  // Never the host's own colors, so the two stay easy to tell apart.
  const own = s.quirk.palette < BASE_PALETTES ? s.quirk.palette : -1;
  let palette = Math.floor(rng() * (own < 0 ? BASE_PALETTES : BASE_PALETTES - 1));
  if (own >= 0 && palette >= own) palette++;
  const accessory = rng() < CFG.visitWearsAccessoryChance ? rollWornAccessory(rng) : null;
  s.visit = { startedAge: s.ageMin, len, form, palette, accessory };
  const wearing = accessory ? ` in a ${accessoryById(accessory).name.toLowerCase()}` : '';
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
  if (rng() < CFG.visitAccessoryChance) {
    // The UI picks which accessory (it knows what's already owned): see drainAccessoryInbox.
    s.visitAccGifts = (s.visitAccGifts ?? 0) + 1;
    gift = ' it left something stylish behind.';
  } else if (rng() < CFG.visitItemChance) {
    const id = rollTable(DROPS.visit, rng);
    const name = ITEMS[id].name;
    gift = grantItem(s, id).includes('full') ? ` it left a ${name}, but inventory is full.` : ` it left a gift: ${name}.`;
  }
  log(s, t, `> the visitor logged off.${gift}`);
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

function rollTable(table, rng) {
  const entries = Object.entries(table);
  let r = rng() * entries.reduce((a, [, w]) => a + w, 0);
  for (const [id, w] of entries) {
    if ((r -= w) < 0) return id;
  }
  return entries[entries.length - 1][0];
}

// Adds an item if there's room. Returns a log suffix.
export function grantItem(s, id) {
  if (s.inventory.length >= INVENTORY_SLOTS) return ` found ${ITEMS[id].name}, but inventory is full.`;
  s.inventory.push(id);
  return ` found: ${ITEMS[id].name}.`;
}

function maybeDrop(s, source, chance, rng) {
  return rng() < chance ? grantItem(s, rollTable(DROPS[source], rng)) : '';
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

// Which adult form the current axes lean toward.
export function leaningForm(s) {
  const { allegiance: a, stability: b } = s.axes;
  if (Math.abs(a) < CFG.ghostBand && b >= 0 && s.careMistakes <= 1 && ghostWinsMet(s)) {
    return 'ghost';
  }
  if (Math.abs(a) >= Math.abs(b)) return a >= 0 ? 'chrome' : 'firewall';
  return b >= 0 ? 'daemon' : 'glitch';
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
  return s;
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

function flatline(s, t, cause) {
  if (rootRescue(s, t, cause)) return;
  s.stage = 'dead';
  s.deathCause = cause;
  s.diedAt = t;
  // An open netrun dies with it: nothing is banked, and nothing should keep driving a dead netling.
  if (s.run) log(s, t, '> the netrun link went dead. loot lost.');
  s.run = null;
  const form = FORMS[s.form] ? s.form : leaningForm(s);
  s.fragment = { form, trait: FORMS[form].trait, quirk: { ...s.quirk }, keepsake: KEEPSAKES[form], rootUsed: s.rootUsed };
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
      if (action === 'corp' && s.trait === 'licensed') gain *= 1.25;
      st.charge = clamp(st.charge + gain);
      st.heat = clamp(st.heat + 2);
      s.axes.allegiance += action === 'corp' ? 1 : -1;
      s.sinceFed = 0;
      let msg = action === 'corp' ? 'licensed packet consumed.' : 'scavenged data consumed.';
      if (s.quirk.favPacket === action) {
        st.sync = clamp(st.sync + 8);
        msg += ' it loves these.';
      }
      if (s.form === 'chrome') {
        st.sync = clamp(st.sync + (action === 'corp' ? 5 : -5));
        if (action === 'scav') msg += ' it looks disgusted.';
      }
      if (action === 'scav' && !s.virus && !shielded(s)) {
        const chance = (s.trait === 'hardened' ? 0.06 : 0.12) * mod(s, 'virusMult');
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
      if (s.form === 'glitch') gain = 10 + Math.floor(rng() * 31);
      if (s.trait === 'volatile') gain *= 1.5;
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
      res = ok(msg, won ? 'win' : 'lose');
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
      const id = s.inventory?.[opts.slot];
      if (!id) return fail('empty slot.');
      s.inventory.splice(opts.slot, 1);
      res = ok(`${ITEMS[id].name.toLowerCase()} discarded.`, 'purge');
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
    case 'cool': {
      if (st.heat < 30) return fail('already running cool.');
      st.heat = clamp(st.heat - 35);
      st.integrity = clamp(st.integrity + CFG.careIntegrity);
      res = ok('coolant flushed.', 'cool');
      break;
    }
    case 'purge': {
      if (s.event?.type === 'overflow') {
        s.event = null;
        s.cache = 0;
        s.axes.stability += 0.5;
        st.integrity = clamp(st.integrity + CFG.careIntegrity);
        res = ok('buffers flushed. overflow contained.', 'purge');
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
        res = ok('intrusion repelled.', 'win');
      } else {
        infect(s, CFG.attackLandedIntegrity);
        res = ok(`defense breached. virus installed. -${CFG.attackLandedIntegrity} integrity.`, 'lose');
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
