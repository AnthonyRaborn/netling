// The daily trace (docs/NETRUN.md#the-daily-trace): one map a day, the same for everyone on the same local date, run by
// the player's own netling with nothing at stake, once a day. Every roll in it is seeded too (by node, so a cache holds
// the same for everyone who reaches it), and the result is a short plain-text line to paste anywhere. Pure, and it
// imports nothing, so the sim, the run rules and the sanitizer can all use it.

export const DAILY = {
  epoch: '2026-10-01', // day #1
  // The map and roll rules' version, shown in the share line. Bump it whenever generateMap, REGIONS.daily or the
  // order of rolls in run.js changes, so two players on different versions don't compare different maps
  // (tests/daily.test.js pins one day's map to catch a change).
  rules: 1,
  winsForReward: 10, // exits for the Uptime crest (cosmetics.js)
};

const pad = (n) => String(n).padStart(2, '0');

// The local calendar date, as YYYY-MM-DD.
export function dayKey(t) {
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export const isDayKey = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));

// The day's number, counting from DAILY.epoch as #1.
export const dayNumber = (key) => Math.round((Date.parse(`${key}T00:00:00Z`) - Date.parse(`${DAILY.epoch}T00:00:00Z`)) / 86400000) + 1;

// FNV-1a over the date and the rules version: the day's seed.
export function dailySeed(key, rules = DAILY.rules) {
  let h = 0x811c9dc5;
  for (const ch of `netling-daily:${key}:r${rules}`) h = Math.imul(h ^ ch.charCodeAt(0), 0x01000193);
  return h >>> 0;
}

// A roll in [0, 1) that depends only on the seed, a key and a counter, so a run resumed after a reload rolls the same.
export function seededRoll(seed, key, n) {
  let h = (seed ^ Math.imul(key + 1, 0x9e3779b1) ^ Math.imul(n + 1, 0x85ebca6b)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// Rolls are kept apart by node and by lane, so what happens at a node never depends on the route taken to it, and a
// form ability that rolls on arrival never shifts the rolls of the fight after it.
export const LANE = { arrive: 0, ice: 1, choice: 2, game: 3 };
export function laneRng(run, nodeId, lane) {
  const key = nodeId * 8 + lane;
  if (run.rollKey !== key) {
    run.rollKey = key;
    run.rolls = 0;
  }
  return () => seededRoll(run.seed, key, run.rolls++);
}

// --- nothing at stake ----------------------------------------------------------------------------------------------
// What a daily run changes on the netling is written to run.stake as it happens (each run.js rules call measures before
// and after), and given back when the run ends. Time keeps passing as usual: only what the run itself did is undone.
// An item used from the inventory mid-run is not a rules call: it is spent, and does what it does, as at home.
const STATS = ['charge', 'sync', 'integrity', 'heat'];
const AXES = ['allegiance', 'stability'];

export function stakeSnap(pet) {
  return { stats: { ...pet.stats }, axes: { ...pet.axes }, scrip: pet.scrip ?? 0, careMistakes: pet.careMistakes ?? 0, inventory: [...(pet.inventory ?? [])] };
}

// Adds what changed between the snapshot and now to the run's ledger.
export function stakeRecord(run, before, pet) {
  if (!run?.daily) return;
  const s = (run.stake ??= newStake());
  for (const k of STATS) s.stats[k] += (pet.stats[k] ?? 0) - (before.stats[k] ?? 0);
  for (const k of AXES) s.axes[k] += (pet.axes?.[k] ?? 0) - (before.axes[k] ?? 0);
  s.scrip += (pet.scrip ?? 0) - before.scrip;
  s.careMistakes += (pet.careMistakes ?? 0) - before.careMistakes;
  const after = [...(pet.inventory ?? [])];
  for (const id of before.inventory) {
    const i = after.indexOf(id);
    if (i >= 0) after.splice(i, 1);
    else s.taken.push(id);
  }
  s.given.push(...after);
}
// order: the inventory at jack-in, so slots given back land where they were.
export const newStake = (order = []) => ({ stats: { charge: 0, sync: 0, integrity: 0, heat: 0 }, axes: { allegiance: 0, stability: 0 }, scrip: 0, careMistakes: 0, taken: [], given: [], order: [...order] });

// Undoes the ledger on the netling. caps: { scrip, inventory }.
export function stakeRefund(pet, stake, caps) {
  if (!stake) return;
  const clamp = (v) => Math.min(100, Math.max(0, v));
  for (const k of STATS) pet.stats[k] = clamp(pet.stats[k] - stake.stats[k]);
  for (const k of AXES) pet.axes[k] -= stake.axes[k];
  pet.scrip = Math.min(caps.scrip, Math.max(0, (pet.scrip ?? 0) - stake.scrip));
  pet.careMistakes = Math.max(0, (pet.careMistakes ?? 0) - stake.careMistakes);
  for (const id of stake.given) {
    const i = pet.inventory.indexOf(id);
    if (i >= 0) pet.inventory.splice(i, 1);
  }
  for (const id of stake.taken) if (pet.inventory.length < caps.inventory) pet.inventory.push(id);
  const sorted = (list) => JSON.stringify([...list].sort());
  if (stake.order && sorted(stake.order) === sorted(pet.inventory)) pet.inventory = [...stake.order];
}

// --- the share line ------------------------------------------------------------------------------------------------
// One symbol per node passed, in order: '>' entry and exit, '#' ICE beaten, 'x' ICE lost, '~' ICE slipped, '$' cache,
// '+' relay, '=' checkpoint, '%' market, '?' anomaly. A run that ends early ends in '!' (disconnected) or '.' (aborted).
export const TRAIL = { entry: '>', exit: '>', ice: '#', iceLost: 'x', icePhased: '~', cache: '$', relay: '+', checkpoint: '=', market: '%', anomaly: '?' };
export const TRAIL_CHARS = '>#x~$+=%?!.';

// result: jacked | disconnected | aborted; exit: whether it reached the exit; who: a form or stage name.
export function shareText({ key, trail = [], exit, result, layers, reached, who, tally = {} }) {
  const end = exit ? 'EXIT' : result === 'disconnected' ? 'DISCONNECTED' : result === 'aborted' ? 'ABORTED' : 'JACKED OUT';
  const ice = (tally.iceWon ?? 0) + (tally.iceLost ?? 0) + (tally.icePhased ?? 0);
  const tail = exit ? '' : result === 'disconnected' ? '!' : result === 'aborted' ? '.' : '';
  return [
    `NETLING daily #${dayNumber(key)} (${key}) r${DAILY.rules}`,
    `${end} ${reached}/${layers}  ICE ${ice - (tally.iceLost ?? 0)}/${ice}  ${who}`,
    `${trail.join('')}${tail}`,
  ].join('\n');
}
