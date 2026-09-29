// Scripted netrun player, shared by tools/netrun-balance.mjs and tools/balance.mjs.
import { startRun, moveTo, resolveIce, choose, runOptions, closeRun, visibleNodeIds } from '../src/netrun/run.js';
import { nodeById } from '../src/netrun/map.js';

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
  // Buying leans indie, so a player steering corp may walk past.
  if (p.kind === 'market') return style.shop !== false && has('buy0') && pet.stats.charge > 50 ? 'buy0' : 'leave';
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

// Plays one full run on the pet. Returns the finished run (before it's cleared).
export function playRun(pet, style, region, rng, codex = []) {
  startRun(pet, region, rng, codex);
  let steps = 0;
  while (pet.run.phase !== 'done' && steps++ < 40) {
    const run = pet.run;
    if (run.phase === 'ice') resolveIce(pet, rng() < style.winRate, rng);
    else if (run.phase === 'choice') choose(pet, decide(pet, style, rng), rng);
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
