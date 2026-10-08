// What Foresight (Tune street) is worth, with a bot that has uneven per-game skill (netrun-bot.mjs, style.spread) and a pre-rolled map (nr2.js `fate`).
// Usage: node prototype/netling2/sim/foresight-sweep.mjs [runs=3000] [regions=ruins,deep,source] [styles=careful,skilled] [spreads=0,0.2,0.4]
//   UPKEEP=0,3,6  the elder's repair per move to try (level 2 only; each value repeats the variants; default 6, the value in nr2.js).
//   JSON=1 prints JSON.
// For each region, style and skill spread: the nine forms with no Foresight (the yardstick mean of banked value, nr2 abilities and tiers on), Tune
// street blind, and Tune street with each Foresight variant: depth (1 = the next step, 2 = two steps) and fields (game; game and tier; game, tier
// and whether a cache is filled). All arms use the same seeds and the same pre-rolled contents, so a difference is what the information bought.
// Value is the parity yardstick's (items plus scrip over 15). Noise at 3000 runs: about 1 point on a rate near 30%, 0.04 on value.
process.env.TZ = 'UTC';
const { createScript, mulberry32 } = await import('./sim.js');
const { playRun, RUN_STYLES } = await import('./netrun-bot.mjs');
const { NR2 } = await import('./netrun/nr2.js');

const n = Number(process.argv[2] ?? 3000);
const regions = (process.argv[3] ?? 'ruins,deep,source').split(',');
const styles = (process.argv[4] ?? 'careful,skilled').split(',');
const spreads = (process.argv[5] ?? '0,0.2,0.4').split(',').map(Number);
const ALL = ['breachCorp', 'breachStreet', 'dodgeCorp', 'dodgeStreet', 'tuneCorp', 'tuneStreet', 'feastCorp', 'feastStreet', 'hidden'];
const VALUE_PER_ITEM = 15;
const upkeeps = (process.env.UPKEEP ?? '').split(',').filter(Boolean).map(Number);
Object.assign(NR2, { abilities: true, tiers: true, fate: true });
const VARIANTS = [
  { label: 'depth 1: game', depth: 1, fields: ['game'] },
  { label: 'depth 1: game, tier', depth: 1, fields: ['game', 'tier'] },
  { label: 'depth 1: game, tier, cache', depth: 1, fields: ['game', 'tier', 'cache'] },
  { label: 'depth 2: game', depth: 2, fields: ['game'] },
  { label: 'depth 2: game, tier', depth: 2, fields: ['game', 'tier'] },
  { label: 'depth 2: game, tier, cache', depth: 2, fields: ['game', 'tier', 'cache'] },
];

function play(style, spread, form, level, seed, region) {
  const rng = mulberry32(seed);
  const pet = createScript({ now: 0, rng });
  pet.stage = level === 2 ? 'mainframe' : 'adult';
  pet.form = level === 2 ? `${form}Elder` : form;
  Object.assign(pet.stats, { charge: 60 + rng() * 40, integrity: 60 + rng() * 40, heat: 20 + rng() * 30 });
  playRun(pet, { ...RUN_STYLES[style], spread, lean: form.endsWith('Corp') ? 'corp' : form.endsWith('Street') ? 'indie' : 'mix' }, region, rng);
  const run = pet.run;
  return { disc: run.result === 'disconnected', exit: run.result === 'jacked' && run.map.nodes.find((x) => x.id === run.pos)?.type === 'exit', value: pet.inventory.length + pet.scrip / VALUE_PER_ITEM };
}
const sum = (rs) => ({ disc: +(100 * rs.filter((r) => r.disc).length / rs.length).toFixed(1), exit: +(100 * rs.filter((r) => r.exit).length / rs.length).toFixed(1), value: +(rs.reduce((a, r) => a + r.value, 0) / rs.length).toFixed(3) });
const run = (style, spread, form, level, region) => sum(Array.from({ length: n }, (_, i) => play(style, spread, form, level, 1000 + i, region)));

const rows = [];
for (const region of regions) for (const style of styles) for (const spread of spreads) for (const level of [1, 2]) for (const upkeep of level === 2 && upkeeps.length ? upkeeps : [null]) {
  if (upkeep !== null) NR2.ab.upkeep.tuneStreet[2] = upkeep;
  NR2.foresight.on = false;
  const blind = Object.fromEntries(ALL.map((f) => [f, run(style, spread, f, level, region)]));
  const mean = ALL.reduce((a, f) => a + blind[f].value, 0) / ALL.length;
  const meanExit = ALL.reduce((a, f) => a + blind[f].exit, 0) / ALL.length;
  const base = blind.tuneStreet;
  const rec = (label, r) => rows.push({ region, style, spread, level: upkeep === null ? level : `${level} (upkeep ${upkeep})`, label, ...r, vsBlind: +((100 * (r.value - base.value)) / base.value).toFixed(1), pctOfMean: +((100 * r.value) / mean).toFixed(0), exitVsMean: +(r.exit - meanExit).toFixed(1), mean: +mean.toFixed(3) });
  rec('tune street, blind', base);
  rec('tune corp, blind', blind.tuneCorp);
  for (const v of VARIANTS) {
    NR2.foresight.on = true;
    NR2.foresight.depth = { 1: v.depth, 2: v.depth };
    NR2.foresight.fields = { 1: v.fields, 2: v.fields };
    rec(v.label, run(style, spread, 'tuneStreet', level, region));
  }
}
if (process.env.JSON) console.log(JSON.stringify(rows, null, 1));
else {
  let last = '';
  for (const r of rows) {
    const head = `${r.region} | ${r.style} | spread ${r.spread} | level ${r.level} (mean value of the nine forms, blind: ${r.mean})`;
    if (head !== last) console.log(`\n== ${head} ==\nvariant                       disc%  exit%  value  vs blind%  % of mean  exit vs mean`);
    last = head;
    console.log(`${r.label.padEnd(28)} ${String(r.disc).padStart(6)} ${String(r.exit).padStart(6)} ${String(r.value).padStart(6)} ${String(r.vsBlind).padStart(9)} ${String(r.pctOfMean).padStart(10)} ${String(r.exitVsMean).padStart(12)}`);
  }
}
