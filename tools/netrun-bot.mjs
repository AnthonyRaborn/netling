// Scripted netrun player, shared by tools/netrun-balance.mjs and tools/balance.mjs.
import { startRun, moveTo, resolveIce, choose, runOptions, closeRun, visibleNodeIds, sellItem } from '../src/netrun/run.js';
import { INVENTORY_SLOTS, SCRIP } from '../src/sim.js';
import { nodeById } from '../src/netrun/map.js';

// An assumption, not a measurement: how much likelier a player is to win a mini-game or ICE fight that runs
// slower because the netling is overclocked (CFG.overclockGameSpeed). Shared with tools/balance.mjs.
export const OVERCLOCK_WIN_BONUS = 0.08;
// hot: whether this game runs slower (overclocked at home; for ICE, jacked in overclocked: run.hot).
export const winChance = (hot, rate) => Math.min(0.95, rate + (hot ? OVERCLOCK_WIN_BONUS : 0));

// plan: look a few steps ahead, using only the nodes the player can see (so a form's sight helps).
// Without it the bot judges only the next step, as it always did.
export const RUN_STYLES = {
  // Banks loot at the relay when hurt; avoids ICE when low.
  careful: { winRate: 0.6, bankAt: 55, avoidIceBelow: 45, plan: true },
  // Always pushes to the exit.
  greedy: { winRate: 0.6, bankAt: 0, avoidIceBelow: 0 },
  // Skilled player, pushes on.
  skilled: { winRate: 0.8, bankAt: 35, avoidIceBelow: 30, plan: true },
};

// Anomaly options a player picks when steering; anything not listed is picked at random.
export const ANOMALY_PREFS = {
  random: [],
  risky: ['salvage', 'raid', 'use', 'follow', 'listen'], // chaos and loot
  orderly: ['repair', 'leave', 'follow', 'listen'],
  corp: ['repair', 'report', 'leave', 'follow', 'listen'],
  indie: ['raid', 'repair', 'leave', 'follow', 'listen'],
};

function decide(pet, style, rng) {
  const p = pet.run.pending;
  const has = (id) => p.options.some((o) => o.id === id && !o.disabled);
  if (p.kind === 'relay') return pet.stats.integrity < style.bankAt ? 'out' : 'continue';
  if (p.kind === 'checkpoint') {
    if (has('voucher') && style.lean !== 'indie') return 'voucher';
    if (style.lean === 'corp') return 'comply';
    if (style.lean === 'mix') return rng() < 0.5 ? 'hide' : 'comply';
    if (style.lean === 'balance') return pet.axes.allegiance > 0 ? 'hide' : 'comply';
    return pet.stats.integrity > 40 || style.lean === 'indie' ? 'hide' : 'comply';
  }
  // Buying leans indie, so a player steering corp may walk past. It only buys what it has room to keep.
  if (p.kind === 'market') {
    const room = pet.inventory.length + pet.run.loot.length < INVENTORY_SLOTS;
    const wanted = p.options.find((o) => o.id.startsWith('buy') && o.id !== 'buyacc' && !o.disabled && (!style.keep || style.keep.includes(p.offers[Number(o.id.slice(3))])));
    // Each kind of market leans its own way: a player steering one way only shops on that side.
    const side = p.flavor === 'corp' ? 'corp' : 'indie';
    const fits = style.lean === 'corp' || style.lean === 'indie' ? style.lean === side : style.lean === 'balance' ? (pet.axes.allegiance > 0) === (side === 'indie') : true;
    return style.shop !== false && fits && room && wanted && pet.stats.charge > 50 ? wanted.id : 'leave';
  }
  const prefs = ANOMALY_PREFS[style.anomaly ?? 'random'];
  const preferred = prefs.find((id) => has(id));
  if (preferred) return preferred;
  return p.options[Math.floor(rng() * p.options.length)].id;
}

// How much a node is worth to the bot. Unseen nodes are worth nothing either way, so seeing
// further (a form's sight, revealed layers) is the only thing planning gains.
function nodeValue(type, hurt) {
  if (type === 'ice') return hurt ? -6 : -0.5;
  if (type === 'relay') return hurt ? 4 : 0.5;
  return { cache: 2, exit: 1, market: 0.5, anomaly: 0.5, checkpoint: -0.5 }[type] ?? 0;
}

function pathValue(map, id, visible, depth, hurt) {
  const node = nodeById(map, id);
  const here = visible.has(id) ? nodeValue(node.type, hurt) : 0;
  if (depth === 0 || !node.edges.length) return here;
  return here + 0.8 * Math.max(...node.edges.map((next) => pathValue(map, next, visible, depth - 1, hurt)));
}

// Picks the next node by the best path up to `depth` steps, judged only on `visible` node ids.
// Ties go to the first option, as the one-step bot does.
export function planMove(map, options, visible, hurt, depth = 3) {
  let best = options[0];
  let bestValue = -Infinity;
  for (const node of options) {
    const value = pathValue(map, node.id, visible, depth, hurt);
    if (value > bestValue) {
      bestValue = value;
      best = node;
    }
  }
  return best;
}

// The slot to sell or scrap first: something it has no use for (not in `keep`), else the commonest
// duplicate, cheapest first. null if everything is worth keeping.
export function surplusSlot(inventory, keep = null) {
  const counts = {};
  for (const id of inventory) counts[id] = (counts[id] ?? 0) + 1;
  const useless = (id) => (keep && !keep.includes(id) ? 1 : 0);
  const pick = inventory
    .map((id, slot) => ({ id, slot }))
    .filter(({ id }) => useless(id) || counts[id] > 1)
    .sort((a, b) => useless(b.id) - useless(a.id) || counts[b.id] - counts[a.id] || SCRIP.price[a.id] - SCRIP.price[b.id])[0];
  return pick ? pick.slot : null;
}

// At a market, sells surplus down to one free slot. Returns how many it sold.
export function sellAtMarket(pet, keep = null) {
  let sold = 0;
  while (pet.inventory.length >= INVENTORY_SLOTS - 1) {
    const slot = surplusSlot(pet.inventory, keep);
    if (slot === null) break;
    sellItem(pet, slot);
    sold++;
  }
  return sold;
}

// Plays one full run on the pet. Returns the finished run (before it's cleared).
export function playRun(pet, style, region, rng, codex = []) {
  startRun(pet, region, rng, codex);
  let steps = 0;
  while (pet.run.phase !== 'done' && steps++ < 40) {
    const run = pet.run;
    if (run.phase === 'ice') resolveIce(pet, rng() < winChance(pet.run.hot, style.winRate), rng);
    else if (run.phase === 'choice') {
      if (run.pending.kind === 'market') {
        if (style.sell !== false) run.sold = (run.sold ?? 0) + sellAtMarket(pet, style.keep);
        // Whether it could afford any item here, after selling (the "a purchase every second run" target).
        run.markets = (run.markets ?? 0) + 1;
        if (run.pending.options.some((o) => o.id.startsWith('buy') && o.id !== 'buyacc' && !o.disabled)) run.affordable = (run.affordable ?? 0) + 1;
      }
      choose(pet, decide(pet, style, rng), rng);
    }
    else {
      const opts = runOptions(run);
      const hurt = pet.stats.integrity < style.avoidIceBelow;
      const pick = style.plan
        ? planMove(run.map, opts, visibleNodeIds(pet), hurt)
        : (opts.find((n) => hurt && n.type === 'relay') ??
          opts.find((n) => !(hurt && n.type === 'ice') && n.type === 'cache') ??
          opts.find((n) => !(hurt && n.type === 'ice')) ??
          opts[0]);
      moveTo(pet, pick.id, rng);
    }
  }
  return pet.run;
}

export function finishRun(pet, t) {
  const run = pet.run;
  closeRun(pet, t);
  return run;
}
