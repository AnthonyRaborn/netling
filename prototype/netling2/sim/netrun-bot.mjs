// Scripted netrun player, shared by tools/netrun-balance.mjs and tools/balance.mjs.
import { startRun, moveTo, resolveIce, choose, runOptions, closeRun, visibleNodeIds, sellItem } from './netrun/run.js';
import { INVENTORY_SLOTS, SCRIP, leanSeen, slotsUsed } from './sim.js';
import { nodeById } from '../../../src/netrun/map.js';
import { tierPenalty } from './netrun/nr2.js';

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
  risky: ['salvage', 'raid', 'use', 'follow', 'listen', 'read'], // chaos and loot (and reading the purge order)
  orderly: ['repair', 'leave', 'follow', 'listen'],
  corp: ['repair', 'report', 'leave', 'follow', 'listen'],
  indie: ['raid', 'repair', 'leave', 'follow', 'listen'],
};

// The clinic fix a bot picks: scrip if the policy allows it and it has the scrip, else a Standing payment by the policy's split.
export function pickFix(pet, fix = {}, has) {
  const mode = fix.mode ?? 'both';
  if ((mode === 'scrip' || mode === 'both') && has('fixscrip')) return 'fixscrip';
  if (mode === 'scrip') return null;
  const { corp, street } = pet.standing;
  const order = fix.split === 'leader' ? [corp >= street ? 'fix2corp' : 'fix2street']
    : fix.split === 'trailer' ? [corp >= street ? 'fix2street' : 'fix2corp']
    : ['fix1each', corp >= street ? 'fix2corp' : 'fix2street'];
  return order.find(has) ?? null;
}

function decide(pet, style, rng) {
  const p = pet.run.pending;
  const has = (id) => p.options.some((o) => o.id === id && !o.disabled);
  // Under a challenge it still holds, it pushes for the exit: a relay jack-out would not count.
  if (p.kind === 'relay') return pet.run.challenge && !pet.run.challengeVoid ? 'continue' : pet.stats.integrity < style.bankAt ? 'out' : 'continue';
  if (p.kind === 'checkpoint') {
    if (has('voucher') && style.lean !== 'indie') return 'voucher';
    if (style.lean === 'corp') return 'comply';
    if (style.lean === 'mix') return rng() < 0.5 ? 'hide' : 'comply';
    if (style.lean === 'balance') return leanSeen(pet, style.shown) > 0 ? 'hide' : 'comply';
    return pet.stats.integrity > 40 || style.lean === 'indie' ? 'hide' : 'comply';
  }
  // Buying leans indie, so a player steering corp may walk past. It only buys what it has room to keep.
  if (p.kind === 'market') {
    // At a clinic it fixes bugs first, paying as `style.fix` says (default: scrip, then Standing).
    if (p.flavor === 'clinic' && pet.bugs > 0 && style.fix?.mode !== 'none') {
      const fix = pickFix(pet, style.fix, has);
      if (fix) return fix;
    }
    const room = slotsUsed([...pet.inventory, ...pet.run.loot]) < INVENTORY_SLOTS;
    const wanted = p.options.find((o) => o.id.startsWith('buy') && o.id !== 'buyacc' && !o.disabled && (!style.keep || style.keep.includes(p.offers[Number(o.id.slice(3))])));
    // Each kind of market leans its own way: a player steering one way only shops on that side.
    const side = p.flavor === 'corp' ? 'corp' : 'indie';
    const fits = p.flavor === 'clinic' || (style.lean === 'corp' || style.lean === 'indie' ? style.lean === side : style.lean === 'balance' ? (leanSeen(pet, style.shown) > 0) === (side === 'indie') : true);
    const bare = pet.run.challenge === 'baremetal' && !pet.run.challengeVoid; // keeps Bare metal: no items bought
    return style.shop !== false && !bare && fits && room && wanted && pet.stats.charge > 50 ? wanted.id : 'leave';
  }
  const prefs = ANOMALY_PREFS[style.anomaly ?? 'random'];
  const preferred = prefs.find((id) => has(id));
  if (preferred) return preferred;
  return p.options[Math.floor(rng() * p.options.length)].id;
}

// How much a node is worth to the bot. Unseen nodes are worth nothing either way, so seeing
// further (a form's sight, revealed layers) is the only thing planning gains.
function nodeValue(type, hurt, node, seek) {
  if (type === 'market' && seek && node.flavor === 'clinic') return 6; // bugged: a clinic is worth a detour
  if (type === 'ice') return hurt ? -6 : -0.5;
  if (type === 'relay') return hurt ? 4 : 0.5;
  return { cache: 2, exit: 1, market: 0.5, anomaly: 0.5, checkpoint: -0.5 }[type] ?? 0;
}

function pathValue(map, id, visible, depth, hurt, seek) {
  const node = nodeById(map, id);
  const here = visible.has(id) ? nodeValue(node.type, hurt, node, seek) : 0;
  if (depth === 0 || !node.edges.length) return here;
  return here + 0.8 * Math.max(...node.edges.map((next) => pathValue(map, next, visible, depth - 1, hurt, seek)));
}

// Picks the next node by the best path up to `depth` steps, judged only on `visible` node ids.
// Ties go to the first option, as the one-step bot does.
export function planMove(map, options, visible, hurt, depth = 3, seek = false) {
  let best = options[0];
  let bestValue = -Infinity;
  for (const node of options) {
    const value = pathValue(map, node.id, visible, depth, hurt, seek);
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
  while (slotsUsed(pet.inventory) >= INVENTORY_SLOTS - 1) {
    const slot = surplusSlot(pet.inventory, keep);
    if (slot === null) break;
    sellItem(pet, slot);
    sold++;
  }
  return sold;
}

// Plays one full run on the pet. Returns the finished run (before it's cleared).
// style.challenge: a challenge id (netrun/challenges.js) for the run, in the Deep or the Source.
export function playRun(pet, style, region, rng, codex = []) {
  pet.keepList = style.keep ?? null; // what this player has a use for, for the end-of-run choice (2.0 inventory)
  startRun(pet, region, rng, codex, [], { challenge: style.challenge ?? null, day: style.day });
  let steps = 0;
  while (pet.run.phase !== 'done' && steps++ < 60) {
    const run = pet.run;
    if (run.phase === 'ice') resolveIce(pet, rng() < winChance(pet.run.hot, style.winRate - tierPenalty(run.pending)), rng);
    else if (run.phase === 'choice') {
      if (run.pending.kind === 'market' && !run.pending.counted) {
        run.pending.counted = true; // a clinic stays open after a fix: count and sell once
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
      const seek = pet.bugs > 0 && style.seekClinic !== false && style.fix?.mode !== 'none'; // bugged, and willing to pay for a fix
      const pick = style.plan
        ? planMove(run.map, opts, visibleNodeIds(pet), hurt, 3, seek)
        : ((seek ? opts.find((n) => n.type === 'market' && n.flavor === 'clinic') : undefined) ??
          opts.find((n) => hurt && n.type === 'relay') ??
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
