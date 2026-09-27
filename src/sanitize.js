// Checks and repairs everything read from storage or a transfer code before the game uses it.
// Stored data can be damaged, edited by hand, or arrive in a hostile code, so nothing is trusted:
// each value is rebuilt from known fields, and anything unusable falls back to a safe default.
// Pure functions; no DOM.
import {
  SAVE_VERSION,
  SPECIES,
  FORMS,
  TRAITS,
  ITEMS,
  KEEPSAKES,
  PALETTES,
  INVENTORY_SLOTS,
  GAME_IDS,
  IDLES,
  PACKETS,
  QUIRK_KEYS,
  CFG,
  leaningForm,
} from './sim.js';
import { COSMETICS, SLOTS, LABEL } from './cosmetics.js';
import { STYLE_ITEMS, HEX, accessoryById } from './accessories.js';
import { FRAGMENTS } from './netrun/codex.js';
import { REGIONS } from './netrun/regions.js';
import { ANOMALIES } from './netrun/anomalies.js';

export const STAGES = ['script', 'baby', 'teen', 'adult', 'dead'];
export const ONBOARDING_STEPS = ['intro', 'readme', 'nudge', 'tutorial', 'done'];
const RUN_PHASES = ['map', 'ice', 'choice', 'done'];
const RUN_RESULTS = ['jacked', 'disconnected', 'aborted'];
const LOG_LINES = 50;

// --- primitives ---

export const isObj = (v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const has = (table, key) => typeof key === 'string' && Object.hasOwn(table, key);

// A finite number clamped to [min, max], else the fallback.
export function num(v, fallback, min = -Infinity, max = Infinity) {
  return typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
}
const int = (v, fallback, min, max) => {
  const n = num(v, fallback, min, max);
  return n === fallback ? n : Math.round(n);
};
const numOrNull = (v) => num(v, null);
const bool = (v, fallback = false) => (typeof v === 'boolean' ? v : fallback);
const str = (v, fallback, max = 500) => (typeof v === 'string' ? v.slice(0, max) : fallback);
const oneOf = (v, list, fallback) => (list.includes(v) ? v : fallback);
const keyOf = (v, table, fallback = null) => (has(table, v) ? v : fallback);

// Unique entries that pass `ok`, in their original order.
export function idList(raw, ok, max = 1000) {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((id) => typeof id === 'string' && ok(id)))].slice(0, max);
}

// A plain { key: count } map of non-negative integers.
function counts(raw, keys = null) {
  const out = {};
  if (!isObj(raw)) return out;
  for (const [k, v] of Object.entries(raw)) {
    if (k === '__proto__' || (keys && !keys.includes(k))) continue;
    const n = int(v, null, 0);
    if (n !== null) out[k] = n;
  }
  return out;
}

// --- id lists ---

const FRAGMENT_IDS = new Set(FRAGMENTS.map((f) => f.id));
const STYLE_IDS = new Set(STYLE_ITEMS.map((x) => x.id));
const UNLOCK_IDS = new Set(['label', ...SLOTS.flatMap((slot) => COSMETICS[slot].map((c) => `${slot}:${c.id}`))]);

export const cleanDex = (raw) => idList(raw, (id) => has(SPECIES, id));
export const cleanCodex = (raw) => idList(raw, (id) => FRAGMENT_IDS.has(id));
export const cleanAccessories = (raw) => idList(raw, (id) => STYLE_IDS.has(id));
export const cleanUnlocked = (raw) => idList(raw, (id) => UNLOCK_IDS.has(id));

// --- the netling ---

function cleanQuirk(raw) {
  const q = isObj(raw) ? raw : {};
  return {
    palette: int(q.palette, 0, 0, PALETTES.length - 1),
    pitch: num(q.pitch, 660, 110, 1760),
    idle: oneOf(q.idle, IDLES, IDLES[0]),
    favPacket: oneOf(q.favPacket, PACKETS, PACKETS[0]),
    sleepOffset: int(q.sleepOffset, 0, -12, 12),
  };
}

// What the run view needs to draw and resolve an open ICE fight or choice node.
// Option ids each kind of choice can offer; run.js resolves nothing else.
function choiceIds(p) {
  if (p.kind === 'relay') return ['continue', 'out'];
  if (p.kind === 'checkpoint') return ['hide', 'comply', 'voucher'];
  if (p.kind === 'anomaly') return ANOMALIES.find((e) => e.id === p.event)?.options.map((o) => o.id) ?? [];
  if (p.kind === 'market') return [...p.offers.map((_, i) => `buy${i}`), ...(p.accOffer ? ['buyacc'] : []), 'leave'];
  return [];
}

function cleanPending(phase, p, strict) {
  if (!isObj(p)) return null;
  if (phase === 'ice') return GAME_IDS.includes(p.game) ? (strict ? { game: p.game } : p) : null;
  if (phase !== 'choice' || typeof p.title !== 'string' || typeof p.text !== 'string' || !Array.isArray(p.options)) return null;
  const extra = {};
  if (p.kind === 'market') {
    // Market prices and wares come from the stored choice, so they're checked like any other input.
    if (!Array.isArray(p.offers) || !p.offers.length || p.offers.length > 2 || !p.offers.every((id) => has(ITEMS, id))) return null;
    const accOffer = p.accOffer == null ? null : STYLE_IDS.has(p.accOffer) ? p.accOffer : undefined;
    if (accOffer === undefined) return null;
    if (!(Number.isFinite(p.price) && p.price >= 0 && p.price <= 100)) return null; // rejected, not clamped: 0 would mean free
    Object.assign(extra, { offers: [...p.offers], price: p.price, accOffer });
  }
  if (p.kind === 'anomaly') extra.event = p.event;
  const allowed = choiceIds({ ...p, ...extra });
  const optionOk = (o) =>
    isObj(o) && allowed.includes(o.id) && typeof o.label === 'string' && (o.hint === undefined || typeof o.hint === 'string') && (o.disabled === undefined || typeof o.disabled === 'boolean');
  if (!p.options.length || !p.options.every(optionOk)) return null;
  const options = strict ? p.options.map(({ id, label, hint, disabled }) => ({ id, label, ...(hint === undefined ? {} : { hint }), ...(disabled === undefined ? {} : { disabled }) })) : p.options;
  return { ...(strict ? {} : p), kind: p.kind, title: p.title.slice(0, 200), text: p.text.slice(0, 500), ...extra, options };
}

function cleanRun(raw, s, strict) {
  if (!isObj(raw) || !has(REGIONS, raw.region) || !isObj(raw.map) || !Array.isArray(raw.map.nodes)) return null;
  if (!Number.isInteger(raw.map.layerCount) || raw.map.layerCount < 2) return null;
  const nodes = raw.map.nodes;
  const ids = new Set();
  for (const n of nodes) {
    if (!isObj(n) || !Number.isInteger(n.id) || !Number.isInteger(n.layer) || typeof n.type !== 'string' || !Array.isArray(n.edges)) return null;
    ids.add(n.id);
  }
  if (!nodes.length || !ids.has(raw.pos)) return null;
  if (nodes.some((n) => n.edges.some((e) => !ids.has(e)))) return null;
  const at = nodes.find((n) => n.id === raw.pos);
  const nodeIds = (v) => (Array.isArray(v) ? v.filter((id) => ids.has(id)) : []);
  const tally = isObj(raw.tally) ? raw.tally : {};
  // A broken ICE fight or choice is dropped; the runner is back on the map.
  let phase = oneOf(raw.phase, RUN_PHASES, 'map');
  const pending = cleanPending(phase, raw.pending, strict);
  if ((phase === 'ice' || phase === 'choice') && !pending) phase = 'map';
  if (phase === 'map' && !at.edges.length) return null; // a dead end the runner could never leave
  const map = strict
    ? { region: str(raw.map.region, raw.region), nodes: nodes.map(({ id, layer, type, edges }) => ({ id, layer, type, edges: [...edges] })), layerCount: raw.map.layerCount }
    : raw.map;
  return {
    ...(strict ? {} : raw),
    region: raw.region,
    map,
    pos: raw.pos,
    visited: nodeIds(raw.visited),
    revealed: nodeIds(raw.revealed),
    loot: Array.isArray(raw.loot) ? raw.loot.filter((id) => has(ITEMS, id)).slice(0, 100) : [], // duplicates are real loot
    phase,
    pending,
    phased: bool(raw.phased),
    known: cleanCodex(raw.known),
    fragments: cleanCodex(raw.fragments),
    knownAcc: cleanAccessories(raw.knownAcc),
    accessories: cleanAccessories(raw.accessories),
    startStats: cleanStats(raw.startStats),
    tally: { nodes: int(tally.nodes, 0, 0), iceWon: int(tally.iceWon, 0, 0), iceLost: int(tally.iceLost, 0, 0) },
    result: oneOf(raw.result, RUN_RESULTS, phase === 'done' ? 'aborted' : null),
    messages: Array.isArray(raw.messages) ? raw.messages.filter((m) => typeof m === 'string').slice(-20) : [],
    startedAge: num(raw.startedAge, s.ageMin, 0),
  };
}

function cleanStats(raw) {
  const st = isObj(raw) ? raw : {};
  return {
    charge: num(st.charge, 70, 0, 100),
    sync: num(st.sync, 70, 0, 100),
    integrity: num(st.integrity, 100, 0, 100),
    heat: num(st.heat, 20, 0, 100),
  };
}

// A flatlined netling's fragment, rebuilt the way sim.js makes it if the stored one is unusable.
function cleanFragment(raw, s) {
  if (isObj(raw) && has(FORMS, raw.form)) {
    return {
      form: raw.form,
      trait: keyOf(raw.trait, TRAITS, FORMS[raw.form].trait),
      quirk: cleanQuirk(raw.quirk),
      keepsake: keyOf(raw.keepsake, ITEMS),
      rootUsed: bool(raw.rootUsed),
    };
  }
  if (s.stage !== 'dead') return null;
  const form = FORMS[s.form] ? s.form : leaningForm(s);
  return { form, trait: FORMS[form].trait, quirk: { ...s.quirk }, keepsake: KEEPSAKES[form] ?? null, rootUsed: s.rootUsed };
}

// Returns a repaired copy of a stored netling, or null if it can't be used at all
// (not an object, another save version, or an unknown stage or form).
// Fields this file doesn't know about are kept, so a newer version's data survives a downgrade,
// unless strict is set: codes from outside keep only known fields.
export function cleanSave(raw, now = Date.now(), { strict = false } = {}) {
  if (!isObj(raw) || raw.saveVersion !== SAVE_VERSION) return null;
  const stage = raw.stage;
  const form = raw.form ?? 'bitling';
  if (!STAGES.includes(stage) || !has(SPECIES, form)) return null;

  const lastTick = num(raw.lastTick, now, 0, now); // a future time (clock set back) would freeze it
  const zero = isObj(raw.zeroMin) ? raw.zeroMin : {};
  const flagged = isObj(raw.flagged) ? raw.flagged : {};
  const axes = isObj(raw.axes) ? raw.axes : {};
  const buffs = isObj(raw.buffs) ? raw.buffs : {};
  const games = isObj(raw.games) ? raw.games : {};
  const runStats = isObj(raw.runStats) ? raw.runStats : {};
  const event = isObj(raw.event) && raw.event.type === 'trace' ? { type: 'trace', startedAge: num(raw.event.startedAge, 0, 0) } : null;
  const hibernation = isObj(raw.hibernation) && Number.isFinite(raw.hibernation.since) ? { ...(strict ? {} : raw.hibernation), since: raw.hibernation.since } : null;

  const s = {
    ...(strict ? {} : raw),
    saveVersion: SAVE_VERSION,
    generation: int(raw.generation, 1, 1, 1e6),
    stage,
    form,
    teenForm: keyOf(raw.teenForm, SPECIES),
    evolvedAt: numOrNull(raw.evolvedAt),
    bornAt: num(raw.bornAt, lastTick),
    lastTick,
    ageMin: int(raw.ageMin, 0, 0),
    stats: cleanStats(raw.stats),
    cache: int(raw.cache, 0, 0, CFG.maxCache),
    virus: bool(raw.virus),
    virusMin: num(raw.virusMin, 0, 0),
    sinceFed: num(raw.sinceFed, CFG.digestMinutes, 0),
    asleep: bool(raw.asleep),
    lightsOn: bool(raw.lightsOn, true),
    careMistakes: int(raw.careMistakes, 0, 0, 1000),
    zeroMin: { charge: num(zero.charge, 0, 0), sync: num(zero.sync, 0, 0), heat: num(zero.heat, 0, 0), lights: num(zero.lights, 0, 0) },
    flagged: { charge: bool(flagged.charge), sync: bool(flagged.sync), heat: bool(flagged.heat), lights: bool(flagged.lights) },
    integrityZeroMin: num(raw.integrityZeroMin, 0, 0),
    axes: { allegiance: num(axes.allegiance, 0), stability: num(axes.stability, 0) },
    games: Object.fromEntries(
      GAME_IDS.map((id) => {
        const g = isObj(games[id]) ? games[id] : {};
        return [id, { played: int(g.played, 0, 0), won: int(g.won, 0, 0) }];
      }),
    ),
    event,
    lastSurgeAt: numOrNull(raw.lastSurgeAt),
    inventory: Array.isArray(raw.inventory) ? raw.inventory.filter((id) => has(ITEMS, id)).slice(0, INVENTORY_SLOTS) : [],
    buffs: { shieldUntilAge: num(buffs.shieldUntilAge, 0, 0), traceSkip: bool(buffs.traceSkip), boost: bool(buffs.boost) },
    rootAccess: bool(raw.rootAccess),
    rootUsed: bool(raw.rootUsed),
    rootCooling: bool(raw.rootCooling),
    hibernation,
    lastWakeAt: numOrNull(raw.lastWakeAt),
    lastRunEndAge: numOrNull(raw.lastRunEndAge),
    runStats: {
      runs: int(runStats.runs, 0, 0),
      jacked: int(runStats.jacked, 0, 0),
      disconnected: int(runStats.disconnected, 0, 0),
      aborted: int(runStats.aborted, 0, 0),
    },
    trait: keyOf(raw.trait, TRAITS),
    inheritedQuirk: oneOf(raw.inheritedQuirk, QUIRK_KEYS, null),
    quirk: cleanQuirk(raw.quirk),
    log: Array.isArray(raw.log)
      ? raw.log
          .filter((e) => isObj(e) && Number.isFinite(e.t) && typeof e.msg === 'string')
          .slice(-LOG_LINES)
          .map((e) => ({ t: e.t, msg: e.msg.slice(0, 500) }))
      : [],
    deathCause: stage === 'dead' ? str(raw.deathCause, 'unknown') : null,
    diedAt: numOrNull(raw.diedAt),
    codexInbox: cleanCodex(raw.codexInbox),
    accessoryInbox: cleanAccessories(raw.accessoryInbox),
  };
  s.run = stage === 'dead' ? null : cleanRun(raw.run, s, strict);
  s.fragment = cleanFragment(raw.fragment, s);
  return s;
}

// --- everything else ---

export function cleanLineage(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isObj).map((e) => ({
    generation: int(e.generation, 1, 1, 1e6),
    form: keyOf(e.form, SPECIES),
    realized: typeof e.realized === 'boolean' ? e.realized && has(SPECIES, e.form) : undefined, // older records lack it
    teenForm: keyOf(e.teenForm, SPECIES),
    cause: str(e.cause, 'flatlined'),
    ageMin: int(e.ageMin, 0, 0),
    mistakes: int(e.mistakes, undefined, 0),
    trait: keyOf(e.trait, TRAITS),
    fragmentTrait: keyOf(e.fragmentTrait, TRAITS),
    keepsake: keyOf(e.keepsake, ITEMS),
    rescued: bool(e.rescued),
    palette: int(e.palette, 0, 0, PALETTES.length - 1),
    bornAt: numOrNull(e.bornAt),
    diedAt: numOrNull(e.diedAt),
  }));
}

export function cleanProgress(raw) {
  const p = isObj(raw) ? raw : {};
  const streaks = {};
  if (isObj(p.streaks)) {
    for (const id of GAME_IDS) {
      const s = p.streaks[id];
      if (isObj(s)) streaks[id] = { cur: int(s.cur, 0, 0), best: int(s.best, 0, 0) };
    }
  }
  return {
    ...(Object.hasOwn(p, 'runs') ? { runs: counts(p.runs, RUN_RESULTS) } : {}),
    streaks,
    acts: counts(p.acts),
    gamesPlayed: int(p.gamesPlayed, 0, 0),
    cleanJackouts: int(p.cleanJackouts, 0, 0),
    deepExits: int(p.deepExits, 0, 0),
  };
}

export function cleanWardrobe(raw) {
  const w = isObj(raw) ? raw : {};
  const out = {};
  for (const slot of SLOTS) {
    if (COSMETICS[slot].some((c) => c.id === w[slot])) out[slot] = w[slot];
  }
  for (const key of ['accessory', 'prop']) {
    if (w[key] === 'none' || STYLE_IDS.has(w[key])) out[key] = w[key];
  }
  if (typeof w.label === 'string') out.label = w.label.slice(0, LABEL.max * 4);
  if (isObj(w.colors)) {
    const colors = {};
    for (const [id, list] of Object.entries(w.colors)) {
      const acc = STYLE_IDS.has(id) ? accessoryById(id) : null;
      if (!acc?.colors || !Array.isArray(list)) continue;
      colors[id] = acc.colors.map(([, def], i) => (typeof list[i] === 'string' && HEX.test(list[i]) ? list[i] : def));
    }
    out.colors = colors;
  }
  return out;
}

export function cleanPrefs(raw) {
  const p = isObj(raw) ? raw : {};
  return { sound: bool(p.sound, true), alerts: bool(p.alerts), volume: num(p.volume, 0.8, 0, 1) };
}

export const cleanOnboarding = (raw) => oneOf(raw, ONBOARDING_STEPS, null);

// The transfer lock: { code, at, generation } while the netling is on another device.
export function cleanLock(raw) {
  if (!isObj(raw) || typeof raw.code !== 'string' || !raw.code) return null;
  return { code: raw.code, at: num(raw.at, 0, 0), generation: int(raw.generation, 1, 1, 1e6) };
}

// Every transferable key, by its short name (see TRANSFER_KEYS in transfer.js).
// The save is left out: it needs cleanSave() and a clock.
export const CLEANERS = {
  lineage: cleanLineage,
  dex: cleanDex,
  codex: cleanCodex,
  wardrobe: cleanWardrobe,
  progress: cleanProgress,
  unlocked: cleanUnlocked,
  accessories: cleanAccessories,
  prefs: cleanPrefs,
  onboarding: cleanOnboarding,
  helpSeen: (v) => v === true,
};
