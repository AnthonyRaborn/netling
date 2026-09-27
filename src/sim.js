// Netling simulation core. Pure-ish: every function takes the state, a time
// (ms epoch) and an rng, so tests can drive it deterministically.

export const MIN = 60_000;
export const SAVE_VERSION = 1;

export const CFG = {
  bootMinutes: 3,
  drainPerHour: { charge: 12, sync: 10 },
  sleepDrainMult: 0.5,
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
  sleepStart: 22,
  sleepEnd: 7,
  ghostBand: 2, // |allegiance| must stay under this, and stability can't be negative
  ghostMinGameWins: 22,
  ghostMinWinsEach: 4,
  playWinSync: 25,
  playLoseSync: 8,
  traceChancePerHour: 0.08,
  traceWindowMin: 120,
  traceIgnoredIntegrity: 15,
  traceIgnoredAllegiance: 1,
  surgeChancePerHour: 0.03,
};

export const GAME_IDS = ['breach', 'dodge', 'tune'];

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
};

// Weighted drop tables per source.
const DROPS = {
  win: { coolant: 3, antivirus: 2, booster: 2, blackice: 2, memory: 1 },
  hide: { blackice: 2, memory: 1, coolant: 1 },
  comply: { voucher: 3, antivirus: 1 },
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

const IDLES = ['bounce', 'sway', 'hover'];
const PACKETS = ['corp', 'scav'];
const QUIRK_KEYS = ['palette', 'pitch', 'idle', 'favPacket', 'sleepOffset'];

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
// rootAccess: the codex is complete, so NL-0 watches over this generation.
export function createScript({ now, generation = 1, fragment = null, rng = Math.random, rootAccess = false }) {
  const quirk = rollQuirk(rng, { origin: rootAccess });
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
    lastRunEndAge: null,
    runStats: { runs: 0, jacked: 0, disconnected: 0, aborted: 0 },
    trait: fragment?.trait ?? null,
    inheritedQuirk,
    quirk,
    log: [{ t: now, msg: `> compiling netling.v${generation}.0 ...` }],
    deathCause: null,
    diedAt: null,
    fragment: null,
  };
}

const freshGames = () => Object.fromEntries(GAME_IDS.map((id) => [id, { played: 0, won: 0 }]));

function log(s, t, msg) {
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

// Advance the simulation to `now`, one minute at a time.
export function tick(s, now, rng = Math.random) {
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
  if (shouldSleep && !s.asleep) {
    s.asleep = true;
    log(s, t, '> entering low-power mode. kill the lights.');
  } else if (!shouldSleep && s.asleep) {
    s.asleep = false;
    s.lightsOn = true;
    log(s, t, '> resuming from low-power mode.');
  }

  const st = s.stats;
  let rate = s.asleep ? CFG.sleepDrainMult : 1;
  if (s.asleep && s.trait === 'persistent') rate *= 0.7;
  st.charge = clamp(st.charge - (CFG.drainPerHour.charge / 60) * rate * mod(s, 'chargeDrainMult'));
  const dark = !s.asleep && !s.lightsOn ? CFG.darkAwakeSyncMult : 1;
  st.sync = clamp(st.sync - (CFG.drainPerHour.sync / 60) * rate * dark * mod(s, 'syncDrainMult'));
  st.heat = clamp(
    st.heat + (s.asleep ? -CFG.heatCoolWhileAsleepPerHour : CFG.heatDriftPerHour) / 60,
  );

  if (!s.asleep && s.sinceFed < CFG.digestMinutes && s.cache < CFG.maxCache && rng() < CFG.cacheChancePerMin) {
    s.cache++;
    log(s, t, '> corrupted cache file written.');
  }
  s.sinceFed++;

  if (!s.virus && !shielded(s)) {
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
  if (dInt === 0) dInt = 3;
  if (s.trait === 'volatile') dInt -= 1;
  st.integrity = clamp(st.integrity + dInt / 60);

  if (st.heat >= 85) s.axes.stability -= 1 / 60;
  else if (!s.asleep && !alertReason(s)) s.axes.stability += CFG.uptimeStabilityPerHour / 60;

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
  if (s.event?.type === 'trace') {
    if (s.ageMin - s.event.startedAge >= CFG.traceWindowMin) {
      s.event = null;
      st.integrity = clamp(st.integrity - CFG.traceIgnoredIntegrity);
      s.axes.allegiance += CFG.traceIgnoredAllegiance;
      log(s, t, '> !! trace completed. corp harvested its data.');
    }
    return;
  }
  if (s.asleep) return;
  if (s.trait !== 'untraceable' && rng() < CFG.traceChancePerHour / 60) {
    if (s.buffs?.traceSkip) {
      s.buffs.traceSkip = false;
      log(s, t, '> corp trace waved off by voucher.');
      return;
    }
    s.event = { type: 'trace', startedAge: s.ageMin };
    log(s, t, `> !! corp trace incoming. ${CFG.traceWindowMin}m to respond.`);
  } else if (rng() < CFG.surgeChancePerHour / 60) {
    st.heat = clamp(st.heat + 25);
    st.charge = clamp(st.charge + 10);
    s.lastSurgeAt = t;
    log(s, t, '> !! power surge. running hot.');
  }
}

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

export function traceMinutesLeft(s) {
  return s.event?.type === 'trace' ? CFG.traceWindowMin - (s.ageMin - s.event.startedAge) : 0;
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
  s.event ??= null;
  s.lastSurgeAt ??= null;
  s.teenForm ??= s.stage === 'teen' ? s.form : null;
  s.inventory ??= [];
  s.buffs ??= { shieldUntilAge: 0, traceSkip: false, boost: false };
  s.run ??= null;
  s.rootAccess ??= false;
  s.rootUsed ??= false;
  s.lastRunEndAge ??= null;
  s.runStats ??= { runs: 0, jacked: 0, disconnected: 0, aborted: 0 };
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
  const form = FORMS[s.form] ? s.form : leaningForm(s);
  s.fragment = { form, trait: FORMS[form].trait, quirk: { ...s.quirk }, keepsake: KEEPSAKES[form] };
  log(s, t, `> FLATLINE: ${cause}. fragment recovered: ${TRAITS[s.fragment.trait].name}.`);
}

// Why an action can't happen right now, or null. The UI checks 'play' before launching a game.
export function blockReason(s, action) {
  if (s.stage === 'dead') return 'no signal.';
  if (s.stage === 'script' && action !== 'lights') return 'still compiling...';
  if (s.asleep && ['corp', 'scav', 'play', 'cool'].includes(action)) return 'in low-power mode.';
  if (action === 'play' && s.stats.charge < 10) return 'not enough charge to play.';
  if ((action === 'hide' || action === 'comply') && s.event?.type !== 'trace') return 'no active trace.';
  return null;
}

// Why an item in a slot can't be used right now, or null.
export function itemBlockReason(s, slot) {
  const base = blockReason(s, 'use');
  if (base) return base;
  const id = s.inventory?.[slot];
  if (!id) return 'empty slot.';
  if (ITEMS[id].awake && s.asleep) return 'in low-power mode.';
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
      st.charge = clamp(st.charge - 6);
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
      res = ok('coolant flushed.', 'cool');
      break;
    }
    case 'purge': {
      if (s.cache === 0) return fail('cache is clean.');
      s.cache = 0;
      s.axes.stability += 0.5;
      res = ok('cache purged.', 'purge');
      break;
    }
    case 'lights': {
      s.lightsOn = !s.lightsOn;
      const msg = s.lightsOn ? 'lights on.' : s.asleep ? 'lights off.' : "lights off. it's awake and bored in the dark.";
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
    s.event?.type === 'trace' ||
    (s.asleep && s.lightsOn)
  );
}
