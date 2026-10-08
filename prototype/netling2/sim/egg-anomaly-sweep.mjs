// The egg-flavored anomalies on the fork (netrun/egg-anomalies.js): what each one does to a run of its own egg, next to the same runs
// without it. Usage: EGG=iron|program|wetware node prototype/netling2/sim/egg-anomaly-sweep.mjs [runs=3000] [regions=bazaar,corp,ruins,deep] [styles=careful,skilled]
//   FORMS=none,breachCorp   which forms (default none = no ability, one at the adult level)
//   JSON=1 prints JSON.
// Variants: `off` (the pool as in 1.0), `random` (the egg anomaly joins the pool, the bot picks an option at random), and `only:<id>` for each
// of its two options (the bot always takes that one when it is offered). `enc` is egg anomalies met a run. Value is the parity yardstick's:
// items banked plus scrip over one common item's price (15). Sampling noise at 3000 runs: about 1 point on a rate near 30%, about 0.03 on value.
process.env.TZ = 'UTC';
const egg = process.env.EGG;
if (!['iron', 'program', 'wetware'].includes(egg)) throw new Error('set EGG=iron, program or wetware');
if (egg === 'iron') process.env.IRON = process.env.IRON ?? '{"on":true}';
if (egg === 'program') process.env.SIDES = process.env.SIDES ?? '{"on":true,"owner":"charge","ownerMult":3,"charge":{"hold":180}}';
if (egg === 'wetware') process.env.SIDES = process.env.SIDES ?? '{"on":true,"owner":"sync","ownerMult":3,"sync":{"hold":180}}';
const { createScript, mulberry32 } = await import('./sim.js');
const { playRun, RUN_STYLES } = await import('./netrun-bot.mjs');
const { NR2 } = await import('./netrun/nr2.js');
const { EGG_ANOMALIES } = await import('./netrun/egg-anomalies.js');

const n = Number(process.argv[2] ?? 3000);
const regions = (process.argv[3] ?? 'bazaar,corp,ruins,deep').split(',');
const styles = (process.argv[4] ?? 'careful,skilled').split(',');
const forms = (process.env.FORMS ?? 'none').split(',');
const VALUE_PER_ITEM = 15;
const own = EGG_ANOMALIES[egg];
const variants = [
  { label: 'off', eggAnomalies: false, anomaly: undefined },
  { label: 'random', eggAnomalies: true, anomaly: undefined },
  ...own.options.map((o) => ({ label: `only:${o.id}`, eggAnomalies: true, anomaly: `only:${o.id}` })),
];
Object.assign(NR2, { abilities: forms.some((f) => f !== 'none'), tiers: true, eggCost: true, inventory: true });

function play(style, form, anomaly, seed, region) {
  const rng = mulberry32(seed);
  const pet = createScript({ now: 0, rng });
  pet.stage = 'adult';
  pet.form = form;
  Object.assign(pet.stats, { charge: 60 + rng() * 40, integrity: 60 + rng() * 40, heat: 20 + rng() * 30 });
  const start = { ...pet.stats };
  playRun(pet, { ...RUN_STYLES[style], anomaly, lean: form.endsWith('Corp') ? 'corp' : form.endsWith('Street') ? 'indie' : 'mix' }, region, rng);
  const run = pet.run;
  return { disc: run.result === 'disconnected', exit: run.result === 'jacked' && run.map.nodes.find((x) => x.id === run.pos)?.type === 'exit', value: pet.inventory.length + pet.scrip / VALUE_PER_ITEM, enc: run.tally.eggAnomaly ?? 0, int: start.integrity - pet.stats.integrity, wear: pet.wear ?? 0 };
}
const mean = (rs, f) => rs.reduce((a, r) => a + f(r), 0) / rs.length;
const rows = [];
for (const region of regions) for (const style of styles) for (const form of forms) {
  const base = {};
  for (const v of variants) {
    NR2.eggAnomalies = v.eggAnomalies;
    const rs = Array.from({ length: n }, (_, i) => play(style, form, v.anomaly, 1000 + i, region));
    const row = { region, style, form: form === 'none' ? 'no ability' : form, variant: v.label, disc: +(100 * mean(rs, (r) => r.disc)).toFixed(1), exit: +(100 * mean(rs, (r) => r.exit)).toFixed(1), value: +mean(rs, (r) => r.value).toFixed(2), int: +mean(rs, (r) => r.int).toFixed(1), wear: +mean(rs, (r) => r.wear).toFixed(1), enc: +mean(rs, (r) => r.enc).toFixed(2) };
    if (v.label === 'off') Object.assign(base, row);
    rows.push({ ...row, dDisc: +(row.disc - base.disc).toFixed(1), dExit: +(row.exit - base.exit).toFixed(1), dValuePct: +((100 * (row.value - base.value)) / base.value).toFixed(1) });
  }
}
if (process.env.JSON) console.log(JSON.stringify(rows, null, 1));
else {
  let last = '';
  for (const r of rows) {
    const head = `${egg} | ${r.region} | ${r.style} | ${r.form}`;
    if (head !== last) console.log(`\n== ${head} ==\nvariant          enc   disc%  dDisc  exit%  dExit  value  dVal%   int   wear`);
    last = head;
    console.log(`${r.variant.padEnd(16)} ${String(r.enc).padStart(4)}  ${String(r.disc).padStart(5)}  ${String(r.dDisc).padStart(5)}  ${String(r.exit).padStart(5)}  ${String(r.dExit).padStart(5)}  ${String(r.value).padStart(5)}  ${String(r.dValuePct).padStart(5)}  ${String(r.int).padStart(5)}  ${String(r.wear).padStart(5)}`);
  }
}
