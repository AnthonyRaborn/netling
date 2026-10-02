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
  PALETTES,
  INVENTORY_SLOTS,
  GAME_IDS,
  IDLES,
  PACKETS,
  QUIRK_KEYS,
  CFG,
  EVENTS,
  LEGACY_LIFE,
  SCRIP,
  TRAIT_CFG,
  deviceZone,
  fragmentOf,
  leaningForm,
  lineOf,
  isMainframeForm,
  MAINFRAME_OF,
} from './sim.js';
import { COSMETICS, SLOTS, LABEL } from './cosmetics.js';
import { CHATTER_IDS } from './chatter.js';
import { ACCESSORIES, PROPS, STYLE_ITEMS, WEAR_SLOTS, HEX, accessoryById } from './accessories.js';
import { FRAGMENTS } from './netrun/codex.js';
import { REGIONS, REGION_ORDER, clearedForStage } from './netrun/regions.js';
import { ANOMALIES } from './netrun/anomalies.js';
import { CONTRACT_KINDS, RUN_CFG } from './netrun/run.js';
import { CHECKIN } from './checkin.js';
import { upgradeSave } from './migrations.js';

export const STAGES = ['script', 'baby', 'teen', 'adult', 'mainframe', 'dead'];
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
const WORN_IDS = new Set(ACCESSORIES.map((x) => x.id)); // accessories, not props
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
    // Which kind of market (black or corp exchange): older saves have none, and every market was a black one.
    Object.assign(extra, { offers: [...p.offers], price: p.price, accOffer, flavor: p.flavor === 'corp' ? 'corp' : 'black' });
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
    ? { region: str(raw.map.region, raw.region), nodes: nodes.map(({ id, layer, type, edges, flavor }) => ({ id, layer, type, edges: [...edges], ...(type === 'market' ? { flavor: flavor === 'corp' ? 'corp' : 'black' } : {}) })), layerCount: raw.map.layerCount }
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
    hot: bool(raw.hot), // jacked in overclocked
    insured: bool(raw.insured), // Chrome's corp insurance, spent for this run
    insuredTimes: int(raw.insuredTimes, raw.insured === true ? 1 : 0, 0, 9), // how many times it paid out
    freePhases: int(raw.freePhases, raw.phased === true ? 1 : 0, 0, 9), // ICE a Glitch line slipped for certain
    softLosses: int(raw.softLosses, 0, 0, 9), // lost ICE fights that barely scratched an Airgap
    known: cleanCodex(raw.known),
    fragments: cleanCodex(raw.fragments),
    knownAcc: cleanAccessories(raw.knownAcc),
    accessories: cleanAccessories(raw.accessories),
    scrip: int(raw.scrip, 0, 0, 1000),
    startStats: cleanStats(raw.startStats),
    tally: {
      nodes: int(tally.nodes, 0, 0),
      iceWon: int(tally.iceWon, 0, 0),
      iceLost: int(tally.iceLost, 0, 0),
      icePhased: int(tally.icePhased, 0, 0),
      caches: int(tally.caches, 0, 0),
      bought: int(tally.bought, 0, 0),
    },
    ...(cleanContract(raw.contract, true) ? { contract: cleanContract(raw.contract, true) } : {}), // only a run that took one along
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

// What a visitor wears: known accessories, one per wear slot.
function cleanVisitWear(raw) {
  const out = [];
  for (const id of Array.isArray(raw) ? raw : []) {
    const slot = WORN_IDS.has(id) ? accessoryById(id).slot : null;
    if (slot && !out.some((x) => accessoryById(x).slot === slot)) out.push(id);
  }
  return out.slice(0, WEAR_SLOTS.length);
}

// What a friend's visitor card says about its line: a generation and three feats (sim.js friendFeat).
function cleanFeats(raw) {
  return { gen: int(raw.gen, 1, 1, 1e6), deep: int(raw.deep, 0, 0, 1e6), root: bool(raw.root), below: int(raw.below, 0, 0, 1e6) };
}

// A friend's visitor card (visitcard.js): its id, look and feats, or null. Imported cards are hostile like any code.
export function cleanCard(raw) {
  if (!isObj(raw) || !has(SPECIES, raw.form) || typeof raw.id !== 'string' || !/^[0-9a-f]{8}$/.test(raw.id)) return null;
  return {
    id: raw.id,
    form: raw.form,
    palette: int(raw.palette, 0, 0, PALETTES.length - 1),
    accessories: cleanVisitWear(raw.accessories),
    ...cleanFeats(raw),
  };
}

// Cards on their way, oldest first: at most friendQueueMax, each id once, each with the time it was queued.
function cleanFriends(raw, now) {
  const out = [];
  for (const c of Array.isArray(raw) ? raw : []) {
    const card = cleanCard(c);
    if (card && !out.some((x) => x.id === card.id)) out.push({ ...card, at: num(c.at, now, 0) });
  }
  return out.slice(0, CFG.friendQueueMax);
}

// The friends greeted, newest last: { at, form, gen, deep, root, below }.
export const GUESTBOOK_MAX = 20;
function cleanGuestbook(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((e) => isObj(e) && has(SPECIES, e.form) && Number.isFinite(e.at))
    .slice(-GUESTBOOK_MAX)
    .map((e) => ({ at: e.at, form: e.form, ...cleanFeats(e) }));
}

// A stray netling playing with it: { startedAge, len, form, palette, accessories }, and `friend` (its feats) when it came
// from a visitor card.
function cleanVisit(raw) {
  if (!isObj(raw) || !has(SPECIES, raw.form) || !Number.isFinite(raw.startedAge)) return null;
  return {
    startedAge: Math.max(0, raw.startedAge),
    len: int(raw.len, CFG.visitMinMin, 1, 60),
    form: raw.form,
    palette: int(raw.palette, 0, 0, PALETTES.length - 1),
    accessories: cleanVisitWear(raw.accessories ?? (raw.accessory ? [raw.accessory] : [])), // older visits wore one: `accessory`
    ...(raw.greeted === true ? { greeted: true } : {}),
    ...(isObj(raw.friend) ? { friend: cleanFeats(raw.friend) } : {}),
  };
}

// What it's asking for: { kind: 'game', game, startedAge } or { kind: 'cool', startedAge }.
function cleanRequest(raw) {
  if (!isObj(raw) || !Number.isFinite(raw.startedAge)) return null;
  const startedAge = Math.max(0, raw.startedAge);
  if (raw.kind === 'cool') return { kind: 'cool', startedAge };
  if (raw.kind === 'game' && GAME_IDS.includes(raw.game)) return { kind: 'game', game: raw.game, startedAge };
  return null;
}

// An open netrun job, or the one a run carries (onRun: it may be settled).
const CONTRACT_SETTLED = ['met', 'missed', 'void'];
function cleanContract(raw, onRun = false) {
  if (!isObj(raw) || !CONTRACT_KINDS.includes(raw.kind) || !REGION_ORDER.includes(raw.region) || !Number.isFinite(raw.postedAge)) return null;
  const counted = raw.kind === 'ice' || raw.kind === 'caches';
  return {
    kind: raw.kind,
    region: raw.region,
    ...(counted ? { n: int(raw.n, 2, 1, 5) } : {}),
    scrip: int(raw.scrip, RUN_CFG.contractScrip[raw.kind], 0, SCRIP.max),
    item: has(ITEMS, raw.item) ? raw.item : null,
    postedAge: Math.max(0, raw.postedAge),
    ...(onRun && CONTRACT_SETTLED.includes(raw.settled) ? { settled: raw.settled } : {}),
  };
}

// The chatter line on screen: { id, startedAge }.
function cleanChatter(raw) {
  if (!isObj(raw) || !CHATTER_IDS.has(raw.id) || !Number.isFinite(raw.startedAge)) return null;
  return { id: raw.id, startedAge: Math.max(0, raw.startedAge) };
}

// The life lengths a netling compiled with. Anything missing or out of order means a save from
// before lives were shortened (or a damaged one): it gets the old seven days, and never longer.
function cleanLife(raw) {
  if (!isObj(raw)) return { ...LEGACY_LIFE };
  const { teenAt, adultAt, lifespan } = raw;
  const ok = [teenAt, adultAt, lifespan].every(Number.isInteger) && teenAt >= 60 && teenAt < adultAt && adultAt < lifespan && lifespan <= LEGACY_LIFE.lifespan;
  return ok ? { teenAt, adultAt, lifespan } : { ...LEGACY_LIFE };
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
      scrip: int(raw.scrip, 0, 0, Math.floor(SCRIP.max * SCRIP.inherit)),
      level: int(raw.level, 1, 1, TRAIT_CFG.maxLevel),
      history: keyOf(raw.history, TRAITS),
    };
  }
  if (s.stage !== 'dead') return null;
  return fragmentOf(s, FORMS[lineOf(s.form)] ? lineOf(s.form) : leaningForm(s));
}

// This life's exits from The Deep, and how many were clean (never more than all of them).
function cleanDeepExits(raw) {
  const all = int(raw?.all, 0, 0, 999);
  return { all, clean: int(raw?.clean, 0, 0, all) };
}

// Makes the parts of a cleaned save agree with each other, which the field-by-field cleaning can't:
// a form that fits the stage, and timers that start in the netling's own past. A start in the future
// would stretch a window or a cooldown for as long as the number says.
function settle(s, now) {
  const bodyStage = SPECIES[s.form].stage;
  if (s.stage === 'script' || s.stage === 'baby') s.form = 'bitling';
  else if (s.stage === 'teen' && bodyStage !== 'teen') s.form = SPECIES[s.teenForm]?.stage === 'teen' ? s.teenForm : 'kernel';
  else if (s.stage === 'adult' && bodyStage !== 'adult') s.form = bodyStage === 'mainframe' ? lineOf(s.form) : leaningForm(s);
  else if (s.stage === 'mainframe' && bodyStage !== 'mainframe') s.form = MAINFRAME_OF[bodyStage === 'adult' ? s.form : leaningForm(s)];
  // Only a mainframe (living, or flatlined in that body) has the extra day.
  if (!isMainframeForm(s.form)) s.lifeBonus = 0;
  const past = (v) => (v === null ? null : Math.min(v, s.ageMin));
  s.lastNapEndAge = past(s.lastNapEndAge);
  s.lastRunEndAge = past(s.lastRunEndAge);
  if (s.nap) s.nap.startedAge = past(s.nap.startedAge);
  if (s.event) s.event.startedAge = past(s.event.startedAge);
  if (s.hibernation) s.hibernation.since = Math.min(s.hibernation.since, now);
}

// Returns a repaired copy of a stored netling, or null if it can't be used at all
// (not an object, a version it can't upgrade, or an unknown stage or form).
// Fields this file doesn't know about are kept, so a newer version's data survives a downgrade,
// unless strict is set: codes from outside keep only known fields.
export function cleanSave(raw, now = Date.now(), { strict = false } = {}) {
  const upgraded = upgradeSave(raw); // older versions are brought up to date first (see migrations.js)
  if (!upgraded.save) return null;
  raw = upgraded.save;
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
  const event = isObj(raw.event) && has(EVENTS, raw.event.type) ? { type: raw.event.type, startedAge: num(raw.event.startedAge, 0, 0) } : null;
  const hibernation = isObj(raw.hibernation) && Number.isFinite(raw.hibernation.since) ? { ...(strict ? {} : raw.hibernation), since: raw.hibernation.since } : null;

  const s = {
    ...(strict ? {} : raw),
    saveVersion: SAVE_VERSION,
    generation: int(raw.generation, 1, 1, 1e6),
    life: cleanLife(raw.life),
    newForms: Array.isArray(raw.newForms) ? [...new Set(raw.newForms.filter((f) => has(FORMS, f)))] : [],
    // Regions whose exit it reached. Saves from before the unlock order open what the stage allows.
    cleared: Array.isArray(raw.cleared) ? REGION_ORDER.filter((r) => raw.cleared.includes(r)) : clearedForStage(stage),
    codexFound: int(raw.codexFound, 0, 0, FRAGMENTS.length),
    scrip: int(raw.scrip, 0, 0, SCRIP.max),
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
    hot: bool(raw.hot),
    virusMin: num(raw.virusMin, 0, 0),
    sinceFed: num(raw.sinceFed, CFG.digestMinutes, 0),
    asleep: bool(raw.asleep),
    nap: isObj(raw.nap) && Number.isFinite(raw.nap.startedAge) ? { startedAge: Math.max(0, raw.nap.startedAge) } : null,
    lastNapEndAge: numOrNull(raw.lastNapEndAge),
    rebootUntilAge: numOrNull(raw.rebootUntilAge),
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
    runCooldownCut: num(raw.runCooldownCut, 0, 0, 24 * 60),
    visit: cleanVisit(raw.visit),
    visitAccGifts: int(raw.visitAccGifts, 0, 0, 10),
    friends: cleanFriends(raw.friends, now),
    request: cleanRequest(raw.request),
    contract: cleanContract(raw.contract),
    contractCheckAge: numOrNull(raw.contractCheckAge),
    wokeAt: numOrNull(raw.wokeAt),
    deepExits: cleanDeepExits(raw.deepExits),
    lifeBonus: raw.lifeBonus === CFG.mainframeBonusMin ? CFG.mainframeBonusMin : 0,
    flowMin: int(raw.flowMin, 0, 0, 30 * 24 * 60),
    flowTotalMin: int(raw.flowTotalMin, 0, 0, 30 * 24 * 60),
    hotTotalMin: int(raw.hotTotalMin, 0, 0, 30 * 24 * 60),
    chatter: cleanChatter(raw.chatter),
    runStats: {
      runs: int(runStats.runs, 0, 0),
      jacked: int(runStats.jacked, 0, 0),
      disconnected: int(runStats.disconnected, 0, 0),
      aborted: int(runStats.aborted, 0, 0),
    },
    trait: keyOf(raw.trait, TRAITS),
    traitLevel: int(raw.traitLevel, 1, 1, TRAIT_CFG.maxLevel),
    history: keyOf(raw.history, TRAITS),
    zone: int(raw.zone, deviceZone(now), -14 * 60, 14 * 60), // UTC offsets run from -12:00 to +14:00
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
  settle(s, now);
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
    mainframe: isMainframeForm(e.mainframe) ? e.mainframe : null, // the mainframe body it ended in, if any
    teenForm: keyOf(e.teenForm, SPECIES),
    cause: str(e.cause, 'flatlined'),
    ageMin: int(e.ageMin, 0, 0),
    mistakes: int(e.mistakes, undefined, 0),
    trait: keyOf(e.trait, TRAITS),
    traitLevel: int(e.traitLevel, 1, 1, TRAIT_CFG.maxLevel), // older records: 1
    history: keyOf(e.history, TRAITS),
    fragmentTrait: keyOf(e.fragmentTrait, TRAITS),
    fragmentLevel: int(e.fragmentLevel, 1, 1, TRAIT_CFG.maxLevel),
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
    sourceExits: int(p.sourceExits, 0, 0),
    requestsMet: int(p.requestsMet, 0, 0),
    contractsDone: int(p.contractsDone, 0, 0),
    visitorsGreeted: int(p.visitorsGreeted, 0, 0),
    ...(Array.isArray(p.guestbook) ? { guestbook: cleanGuestbook(p.guestbook) } : {}),
    flowMin: int(p.flowMin, 0, 0), // minutes in flow over past lives (the current one adds its own)
    hotMin: int(p.hotMin, 0, 0), // awake minutes overclocked over past lives (the same way)
    chatter: idList(p.chatter, (id) => CHATTER_IDS.has(id)),
    ...(p.rootEarned === true ? { rootEarned: true } : {}), // Root Access was earned (see rootUnlocked in codex.js)
    ...(p.sourceSeen === true ? { sourceSeen: true } : {}), // the Source's name has repaired itself once (ui/play.js)
  };
}

export function cleanWardrobe(raw) {
  const w = isObj(raw) ? raw : {};
  const out = {};
  for (const slot of SLOTS) {
    if (COSMETICS[slot].some((c) => c.id === w[slot])) out[slot] = w[slot];
  }
  // One accessory per wear slot, and a prop. Older wardrobes held a single `accessory`: it moves to its own slot.
  const legacy = ACCESSORIES.find((x) => x.id === w.accessory);
  for (const slot of WEAR_SLOTS) {
    const id = w[slot] ?? (legacy?.slot === slot ? legacy.id : undefined);
    if (id === 'none' || ACCESSORIES.some((x) => x.id === id && x.slot === slot)) out[slot] = id;
  }
  if (w.prop === 'none' || PROPS.some((x) => x.id === w.prop)) out.prop = w.prop;
  if (typeof w.label === 'string') out.label = w.label.slice(0, LABEL.max * 4);
  if (isObj(w.colors)) {
    const colors = {};
    for (const [id, list] of Object.entries(w.colors)) {
      const acc = STYLE_IDS.has(id) ? accessoryById(id) : null;
      if (!acc?.colors || !Array.isArray(list)) continue;
      // null keeps a slot automatic (see accessoryColors); anything that is not a #rrggbb is dropped to it.
      colors[id] = acc.colors.map((_, i) => (typeof list[i] === 'string' && HEX.test(list[i]) ? list[i] : null));
    }
    out.colors = colors;
  }
  return out;
}

// The daily check-in: the next ladder day (0 to 6), when the last one was claimed, and how many in all.
export function cleanCheckin(raw) {
  const c = isObj(raw) ? raw : {};
  return { day: int(c.day, 0, 0, CHECKIN.days - 1), claimedAt: numOrNull(c.claimedAt), claims: int(c.claims, 0, 0) };
}

// The reward box: [{ kind: 'scrip', n, day } | { kind: 'item', id, day } | { kind: 'accessory', id, day }].
export function cleanRewardBox(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const e of raw) {
    if (!isObj(e)) continue;
    const day = int(e.day, 1, 1, CHECKIN.days);
    if (e.kind === 'scrip' && Number.isFinite(e.n) && e.n >= 1) out.push({ kind: 'scrip', n: int(e.n, 1, 1, 1000), day });
    else if (e.kind === 'item' && has(ITEMS, e.id)) out.push({ kind: 'item', id: e.id, day });
    else if (e.kind === 'accessory' && STYLE_IDS.has(e.id)) out.push({ kind: 'accessory', id: e.id, day });
  }
  return out.slice(0, CHECKIN.boxMax);
}

// MOTION: 'auto' follows the system's reduced-motion setting; 'reduce' and 'full' override it.
export const MOTION_MODES = ['auto', 'reduce', 'full'];
export function cleanPrefs(raw) {
  const p = isObj(raw) ? raw : {};
  return { sound: bool(p.sound, true), alerts: bool(p.alerts), volume: num(p.volume, 0.8, 0, 1), musicVolume: num(p.musicVolume, 0.4, 0, 1), awake: bool(p.awake), motion: oneOf(p.motion, MOTION_MODES, 'auto') };
}

export const cleanOnboarding = (raw) => oneOf(raw, ONBOARDING_STEPS, null);

// The transfer lock: { code, at, generation } while the netling is on another device.
export function cleanLock(raw) {
  if (!isObj(raw) || typeof raw.code !== 'string' || !raw.code) return null;
  return { code: raw.code, at: num(raw.at, 0, 0), generation: int(raw.generation, 1, 1, 1e6) };
}

// Test mode (see ui/app.js). speed is a clock multiplier: 1x, a day per hour, or a life per hour.
export const TEST_SPEEDS = [1, 24, 168];
export function cleanTestMode(raw) {
  const t = isObj(raw) ? raw : {};
  return { on: bool(t.on), revealed: bool(t.revealed), speed: oneOf(t.speed, TEST_SPEEDS, TEST_SPEEDS.at(-1)) };
}
// realAt null: paused (test mode is off).
export function cleanTestClock(raw) {
  if (!isObj(raw) || !Number.isFinite(raw.simAt) || !(raw.realAt === null || Number.isFinite(raw.realAt))) return null;
  return { simAt: raw.simAt, realAt: raw.realAt, speed: oneOf(raw.speed, TEST_SPEEDS, TEST_SPEEDS.at(-1)) };
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
  checkin: cleanCheckin,
  rewardBox: cleanRewardBox,
  prefs: cleanPrefs,
  onboarding: cleanOnboarding,
  helpSeen: (v) => v === true,
};
