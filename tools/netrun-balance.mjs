// Monte Carlo netrun outcomes for a few play styles. Usage: node tools/netrun-balance.mjs [runs=2000]
process.env.TZ = 'UTC';
const { createScript, mulberry32 } = await import('../src/sim.js');
const { startRun, moveTo, resolveIce, relayChoice, runOptions } = await import('../src/netrun/run.js');

const STYLES = {
  // Banks loot at the relay when hurt; avoids ICE when low.
  careful: { winRate: 0.6, bankAt: 55, avoidIceBelow: 45 },
  // Always pushes to the exit.
  greedy: { winRate: 0.6, bankAt: 0, avoidIceBelow: 0 },
  // Skilled player, pushes on.
  skilled: { winRate: 0.8, bankAt: 35, avoidIceBelow: 30 },
  // Weak baby with mediocre stats.
  baby: { winRate: 0.5, bankAt: 50, avoidIceBelow: 45, start: { integrity: 70, charge: 45 } },
};

function play(style, seed) {
  const rng = mulberry32(seed);
  const pet = createScript({ now: 0, rng });
  pet.stage = 'baby';
  Object.assign(pet.stats, { charge: 60 + rng() * 40, integrity: 60 + rng() * 40, heat: 20 + rng() * 30 }, style.start);
  const start = { ...pet.stats };
  startRun(pet, 'public', rng);
  let steps = 0;
  while (pet.run.phase !== 'done' && steps++ < 30) {
    const run = pet.run;
    if (run.phase === 'ice') resolveIce(pet, rng() < style.winRate, rng);
    else if (run.phase === 'relay') relayChoice(pet, pet.stats.integrity < style.bankAt ? 'out' : 'continue');
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
  return {
    result: pet.run.result,
    banked: pet.inventory.length,
    intSpent: start.integrity - pet.stats.integrity,
    chargeSpent: start.charge - pet.stats.charge,
    mistakes: pet.careMistakes,
  };
}

const n = Number(process.argv[2] ?? 2000);
for (const [name, style] of Object.entries(STYLES)) {
  const rs = Array.from({ length: n }, (_, i) => play(style, i + 1));
  const pct = (f) => `${Math.round((100 * rs.filter(f).length) / n)}%`;
  const avg = (k) => (rs.reduce((a, r) => a + r[k], 0) / n).toFixed(1);
  console.log(
    `${name.padEnd(8)} jacked ${pct((r) => r.result === 'jacked')} · disconnected ${pct((r) => r.result === 'disconnected')}` +
      ` · items banked ${avg('banked')} · integrity spent ${avg('intSpent')} · charge spent ${avg('chargeSpent')}`,
  );
}
