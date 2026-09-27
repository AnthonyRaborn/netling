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
  maxMistakes: 10,
  flatlineIntegrityMin: 120,
  lifespanMin: 7 * 24 * 60,
  teenAtMin: 24 * 60,
  adultAtMin: 72 * 60,
  teenGoodCareMaxMistakes: 2,
  sleepStart: 22,
  sleepEnd: 7,
  ghostBand: 3,
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
];

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

export function rollQuirk(rng) {
  return {
    palette: Math.floor(rng() * PALETTES.length),
    pitch: 440 + Math.round(rng() * 440),
    idle: pick(IDLES, rng),
    favPacket: pick(PACKETS, rng),
    sleepOffset: Math.floor(rng() * 5) - 2,
  };
}

// A new generation: fresh quirk, with one quirk key copied from the fragment.
export function createScript({ now, generation = 1, fragment = null, rng = Math.random }) {
  const quirk = rollQuirk(rng);
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
    trait: fragment?.trait ?? null,
    inheritedQuirk,
    quirk,
    log: [{ t: now, msg: `> compiling netling.v${generation}.0 ...` }],
    deathCause: null,
    diedAt: null,
    fragment: null,
  };
}

function log(s, t, msg) {
  s.log.push({ t, msg });
  if (s.log.length > 50) s.log.splice(0, s.log.length - 50);
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
  st.sync = clamp(st.sync - (CFG.drainPerHour.sync / 60) * rate * mod(s, 'syncDrainMult'));
  st.heat = clamp(
    st.heat + (s.asleep ? -CFG.heatCoolWhileAsleepPerHour : CFG.heatDriftPerHour) / 60,
  );

  if (!s.asleep && s.sinceFed < CFG.digestMinutes && s.cache < CFG.maxCache && rng() < CFG.cacheChancePerMin) {
    s.cache++;
    log(s, t, '> corrupted cache file written.');
  }
  s.sinceFed++;

  if (!s.virus) {
    let perHour = CFG.virusBasePerHour + CFG.virusPerCachePerHour * s.cache;
    if (s.trait === 'hardened') perHour *= 0.5;
    perHour *= mod(s, 'virusMult');
    if (rng() < perHour / 60) {
      s.virus = true;
      s.virusMin = 0;
      log(s, t, '> !! virus signature detected.');
    }
  } else {
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

  checkMistake(s, t, 'charge', st.charge <= 0, 'charge depleted');
  checkMistake(s, t, 'sync', st.sync <= 0, 'sync lost');
  checkMistake(s, t, 'heat', st.heat >= 100, 'thermal overload');
  checkMistake(s, t, 'lights', s.asleep && s.lightsOn, 'no rest with the lights on');

  s.integrityZeroMin = st.integrity <= 0 ? s.integrityZeroMin + 1 : 0;

  if (s.integrityZeroMin >= CFG.flatlineIntegrityMin) flatline(s, t, 'integrity collapse');
  else if (s.careMistakes >= CFG.maxMistakes) flatline(s, t, 'neglect');
  else if (s.ageMin >= CFG.lifespanMin) flatline(s, t, 'end of life cycle');
}

function checkMistake(s, t, key, cond, label) {
  if (!cond) {
    s.zeroMin[key] = 0;
    s.flagged[key] = false;
    return;
  }
  s.zeroMin[key]++;
  if (s.zeroMin[key] >= CFG.mistakeGraceMin && !s.flagged[key]) {
    s.flagged[key] = true;
    s.careMistakes++;
    s.axes.stability -= 2;
    log(s, t, `> care mistake: ${label}. [${s.careMistakes}/${CFG.maxMistakes}]`);
  }
}

// Which adult form the current axes lean toward.
export function leaningForm(s) {
  const { allegiance: a, stability: b } = s.axes;
  if (Math.abs(a) < CFG.ghostBand && Math.abs(b) < CFG.ghostBand && s.careMistakes <= 1) return 'ghost';
  if (Math.abs(a) >= Math.abs(b)) return a >= 0 ? 'chrome' : 'firewall';
  return b >= 0 ? 'daemon' : 'glitch';
}

function evolve(s, t, stage, form) {
  s.stage = stage;
  s.form = form;
  s.evolvedAt = t;
  log(s, t, `> recompiling... netling is now ${SPECIES[form].name.toUpperCase()}.`);
}

// Older saves predate evolution fields.
export function migrate(s) {
  s.form ??= 'bitling';
  s.evolvedAt ??= null;
  return s;
}

function flatline(s, t, cause) {
  s.stage = 'dead';
  s.deathCause = cause;
  s.diedAt = t;
  const form = FORMS[s.form] ? s.form : leaningForm(s);
  s.fragment = { form, trait: FORMS[form].trait, quirk: { ...s.quirk } };
  log(s, t, `> FLATLINE: ${cause}. fragment recovered: ${TRAITS[s.fragment.trait].name}.`);
}

// Player actions. Returns { ok, msg, sfx }.
export function act(s, action, now, rng = Math.random) {
  if (s.stage === 'dead') return fail('no signal.');
  if (s.stage === 'script' && action !== 'lights') return fail('still compiling...');
  const st = s.stats;
  const awakeOnly = ['corp', 'scav', 'play', 'cool'];
  if (s.asleep && awakeOnly.includes(action)) return fail('in low-power mode.');

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
      if (action === 'scav' && !s.virus) {
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
      if (st.charge < 10) return fail('not enough charge to play.');
      let gain = s.form === 'glitch' ? 10 + Math.floor(rng() * 31) : 20;
      if (s.trait === 'volatile') gain *= 1.5;
      st.sync = clamp(st.sync + gain);
      st.charge = clamp(st.charge - 6);
      st.heat = clamp(st.heat + 12);
      if (st.heat > 70) s.axes.stability -= 0.5;
      res = ok('ping-pong over localhost. sync up.', 'play');
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
      res = ok(s.lightsOn ? 'lights on.' : 'lights off.', 'lights');
      break;
    }
    default:
      return fail('unknown command.');
  }
  log(s, now, `> ${res.msg}`);
  return res;
}

const ok = (msg, sfx) => ({ ok: true, msg, sfx });
const fail = (msg) => ({ ok: false, msg, sfx: 'error' });

// Needs that warrant the blinking attention icon.
export function needsAttention(s) {
  if (!isAlive(s)) return false;
  const st = s.stats;
  return (
    st.charge < 20 || st.sync < 20 || st.heat > 80 || s.cache >= 2 || s.virus || (s.asleep && s.lightsOn)
  );
}
