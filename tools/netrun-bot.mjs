// Scripted netrun player, shared by tools/netrun-balance.mjs and tools/balance.mjs.
import { startRun, moveTo, resolveIce, choose, runOptions, closeRun } from '../src/netrun/run.js';

export const RUN_STYLES = {
  // Banks loot at the relay when hurt; avoids ICE when low.
  careful: { winRate: 0.6, bankAt: 55, avoidIceBelow: 45 },
  // Always pushes to the exit.
  greedy: { winRate: 0.6, bankAt: 0, avoidIceBelow: 0 },
  // Skilled player, pushes on.
  skilled: { winRate: 0.8, bankAt: 35, avoidIceBelow: 30 },
};

function decide(pet, style, rng) {
  const p = pet.run.pending;
  const has = (id) => p.options.some((o) => o.id === id && !o.disabled);
  if (p.kind === 'relay') return pet.stats.integrity < style.bankAt ? 'out' : 'continue';
  if (p.kind === 'checkpoint') {
    if (has('voucher')) return 'voucher';
    if (style.lean === 'corp') return 'comply';
    if (style.lean === 'mix') return rng() < 0.5 ? 'hide' : 'comply';
    return pet.stats.integrity > 40 || style.lean === 'indie' ? 'hide' : 'comply';
  }
  if (p.kind === 'market') return has('buy0') && pet.stats.charge > 50 ? 'buy0' : 'leave';
  // anomalies: pick either option at random
  return p.options[Math.floor(rng() * p.options.length)].id;
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
      const pick =
        opts.find((n) => hurt && n.type === 'relay') ??
        opts.find((n) => !(hurt && n.type === 'ice') && n.type === 'cache') ??
        opts.find((n) => !(hurt && n.type === 'ice')) ??
        opts[0];
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
