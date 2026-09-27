// Monte Carlo netrun outcomes for a few play styles. Usage: node tools/netrun-balance.mjs [runs=2000]
process.env.TZ = 'UTC';
const { createScript, mulberry32 } = await import('../src/sim.js');
const { playRun, RUN_STYLES } = await import('./netrun-bot.mjs');

const STYLES = {
  ...RUN_STYLES,
  // Weak baby with mediocre stats.
  baby: { winRate: 0.5, bankAt: 50, avoidIceBelow: 45, start: { integrity: 70, charge: 45 } },
  // Adult forms with their abilities, careful play.
  chrome: { winRate: 0.6, bankAt: 55, avoidIceBelow: 45, form: 'chrome', lean: 'corp' },
  firewall: { winRate: 0.6, bankAt: 55, avoidIceBelow: 45, form: 'firewall', lean: 'indie' },
  daemon: { winRate: 0.6, bankAt: 55, avoidIceBelow: 45, form: 'daemon' },
  glitch: { winRate: 0.6, bankAt: 55, avoidIceBelow: 45, form: 'glitch' },
  ghost: { winRate: 0.6, bankAt: 55, avoidIceBelow: 45, form: 'ghost' },
};

function play(style, seed, region = 'public') {
  const rng = mulberry32(seed);
  const pet = createScript({ now: 0, rng });
  pet.stage = style.form || style.stage === 'adult' ? 'adult' : style.stage ?? 'baby';
  if (style.form) pet.form = style.form;
  Object.assign(pet.stats, { charge: 60 + rng() * 40, integrity: 60 + rng() * 40, heat: 20 + rng() * 30 }, style.start);
  const start = { ...pet.stats };
  playRun(pet, style, region, rng);
  return {
    result: pet.run.result,
    banked: pet.inventory.length,
    intSpent: start.integrity - pet.stats.integrity,
    chargeSpent: start.charge - pet.stats.charge,
    mistakes: pet.careMistakes,
    fragments: pet.run.result === 'jacked' ? pet.run.fragments.length : 0,
    allegiance: pet.axes.allegiance,
    stability: pet.axes.stability,
  };
}

const n = Number(process.argv[2] ?? 2000);
const region = process.argv[3] ?? 'public';
if (region === 'all') {
  // Careful and skilled adults (teens for the teen regions) across every region.
  const { REGION_ORDER, REGIONS } = await import('../src/netrun/regions.js');
  for (const r of REGION_ORDER) {
    for (const [name, style] of [['careful', STYLES.careful], ['skilled', STYLES.skilled], ['firewall', STYLES.firewall]]) {
      const st = { ...style, stage: REGIONS[r].minStage === 'teen' && !style.form ? 'teen' : 'adult' };
      const rs = Array.from({ length: n }, (_, i) => play(st, i + 1, r));
      const pct = (f) => `${Math.round((100 * rs.filter(f).length) / n)}%`;
      const avg = (k) => (rs.reduce((a, x) => a + x[k], 0) / n).toFixed(2);
      console.log(`${r.padEnd(7)} ${name.padEnd(8)} disconnected ${pct((x) => x.result === 'disconnected').padStart(4)} · items ${avg('banked')} · fragments/run ${avg('fragments')} · int spent ${avg('intSpent')}`);
    }
  }
  process.exit(0);
}
for (const [name, style] of Object.entries(STYLES)) {
  const rs = Array.from({ length: n }, (_, i) => play(style, i + 1, region));
  const pct = (f) => `${Math.round((100 * rs.filter(f).length) / n)}%`;
  const avg = (k) => (rs.reduce((a, r) => a + r[k], 0) / n).toFixed(1);
  console.log(
    `${name.padEnd(8)} jacked ${pct((r) => r.result === 'jacked')} · disconnected ${pct((r) => r.result === 'disconnected')}` +
      ` · items ${avg('banked')} · int spent ${avg('intSpent')} · chg spent ${avg('chargeSpent')}` +
      ` · lean a${avg('allegiance')} s${avg('stability')}`,
  );
}
