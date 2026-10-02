// Monte Carlo netrun outcomes for a few play styles.
// Usage: node tools/netrun-balance.mjs [runs=2000] [region=public|all]
// JSON=1 prints a report that tools/balance-diff.mjs can compare.
// CHALLENGE=glass|unplugged|blackout|baremetal plays every run under that challenge (the Deep and the Source only) and
// adds `won`, the share of runs that kept it to the exit (docs/NETRUN.md#challenges).
process.env.TZ = 'UTC';
const { createScript, mulberry32 } = await import('../src/sim.js');
const { playRun, RUN_STYLES } = await import('./netrun-bot.mjs');

const STYLES = {
  ...RUN_STYLES,
  // Weak baby with mediocre stats.
  baby: { winRate: 0.5, bankAt: 50, avoidIceBelow: 45, plan: true, start: { integrity: 70, charge: 45 } },
  // Adult forms with their abilities, careful play (planning, so sight counts).
  chrome: { ...RUN_STYLES.careful, form: 'chrome', lean: 'corp' },
  firewall: { ...RUN_STYLES.careful, form: 'firewall', lean: 'indie' },
  daemon: { ...RUN_STYLES.careful, form: 'daemon' },
  glitch: { ...RUN_STYLES.careful, form: 'glitch' },
  ghost: { ...RUN_STYLES.careful, form: 'ghost' },
  // Mainframe forms: their line's ability plus their upgrade (docs/SOURCE_PLAN.md). Measured in The Deep and the Source.
  plat: { ...RUN_STYLES.careful, form: 'plat', stage: 'mainframe', lean: 'corp' },
  airgap: { ...RUN_STYLES.careful, form: 'airgap', stage: 'mainframe', lean: 'indie' },
  init: { ...RUN_STYLES.careful, form: 'init', stage: 'mainframe' },
  panic: { ...RUN_STYLES.careful, form: 'panic', stage: 'mainframe' },
  whisper: { ...RUN_STYLES.careful, form: 'whisper', stage: 'mainframe' },
};
const MAINFRAMES = ['plat', 'airgap', 'init', 'panic', 'whisper'];

function play(style, seed, region = 'public') {
  const rng = mulberry32(seed);
  const pet = createScript({ now: 0, rng });
  pet.stage = style.stage === 'mainframe' ? 'mainframe' : style.form || style.stage === 'adult' ? 'adult' : style.stage ?? 'baby';
  if (style.form) pet.form = style.form;
  Object.assign(pet.stats, { charge: 60 + rng() * 40, integrity: 60 + rng() * 40, heat: 20 + rng() * 30 }, style.start);
  const start = { ...pet.stats };
  playRun(pet, process.env.CHALLENGE ? { ...style, challenge: process.env.CHALLENGE } : style, region, rng);
  return {
    result: pet.run.result,
    // Reached the exit node (not a relay jack-out): disconnect rates alone once hid that Chrome banked early.
    exit: pet.run.result === 'jacked' && pet.run.map.nodes.find((n) => n.id === pet.run.pos)?.type === 'exit',
    banked: pet.inventory.length,
    intSpent: start.integrity - pet.stats.integrity,
    chargeSpent: start.charge - pet.stats.charge,
    mistakes: pet.careMistakes,
    fragments: pet.run.result === 'jacked' ? pet.run.fragments.length : 0,
    won: Boolean(pet.run.challengeWon),
    allegiance: pet.axes.allegiance,
    stability: pet.axes.stability,
  };
}

const n = Number(process.argv[2] ?? 2000);
const region = process.argv[3] ?? 'public';
// Averages over runs, as numbers (rates are fractions).
function summary(rs) {
  const share = (f) => Math.round((1000 * rs.filter(f).length) / rs.length) / 1000;
  const avg = (k) => Math.round((100 * rs.reduce((a, x) => a + x[k], 0)) / rs.length) / 100;
  return {
    jacked: share((r) => r.result === 'jacked'),
    disconnected: share((r) => r.result === 'disconnected'),
    exit: share((r) => r.exit),
    items: avg('banked'),
    fragments: avg('fragments'),
    intSpent: avg('intSpent'),
    chargeSpent: avg('chargeSpent'),
    allegiance: avg('allegiance'),
    stability: avg('stability'),
    ...(process.env.CHALLENGE ? { won: share((r) => r.won) } : {}),
  };
}
const pct = (x) => `${Math.round(x * 100)}%`;
const report = { runs: n, region, archetypes: {} };
if (region === 'all') {
  // Careful and skilled adults (teens for the teen regions), and the adult forms, across every region.
  const { REGION_ORDER, REGIONS } = await import('../src/netrun/regions.js');
  const who = [['careful', STYLES.careful], ['skilled', STYLES.skilled], ...['chrome', 'firewall', 'daemon', 'glitch', 'ghost'].map((f) => [f, STYLES[f]])];
  for (const r of REGION_ORDER) {
    // Mainframe forms run where they matter: The Deep (they must not make it trivial) and the Source.
    const here = r === 'deep' || r === 'source' ? [...who, ...MAINFRAMES.map((f) => [f, STYLES[f]])] : who;
    for (const [name, style] of here) {
      const st = { ...style, stage: style.stage === 'mainframe' ? 'mainframe' : REGIONS[r].minStage === 'teen' && !style.form ? 'teen' : 'adult' };
      const sum = summary(Array.from({ length: n }, (_, i) => play(st, i + 1, r)));
      report.archetypes[`${r}.${name}`] = sum;
      if (!process.env.JSON) {
        console.log(`${r.padEnd(7)} ${name.padEnd(8)} disconnected ${pct(sum.disconnected).padStart(4)} · exit ${pct(sum.exit).padStart(4)}${sum.won !== undefined ? ` · won ${pct(sum.won).padStart(4)}` : ''} · items ${sum.items.toFixed(2)} · fragments/run ${sum.fragments.toFixed(2)} · int spent ${sum.intSpent.toFixed(2)}`);
      }
    }
  }
} else {
  for (const [name, style] of Object.entries(STYLES)) {
    const sum = summary(Array.from({ length: n }, (_, i) => play(style, i + 1, region)));
    report.archetypes[name] = sum;
    if (!process.env.JSON) {
      console.log(
        `${name.padEnd(8)} jacked ${pct(sum.jacked)} · disconnected ${pct(sum.disconnected)} · exit ${pct(sum.exit)}` +
          ` · items ${sum.items.toFixed(1)} · int spent ${sum.intSpent.toFixed(1)} · chg spent ${sum.chargeSpent.toFixed(1)}` +
          ` · lean a${sum.allegiance.toFixed(1)} s${sum.stability.toFixed(1)}`,
      );
    }
  }
}
if (process.env.JSON) console.log(JSON.stringify(report, null, 2));
