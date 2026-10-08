// The corp exchange's stock now that the healing items are clinic-only. Part 1: what a visit offers under each stock (the market shows
// two distinct items, drawn by weight: see offers in netrun/run.js). Part 2: the bots under each stock (full-life, infections, Standing,
// scrip spent) on a few archetypes. Usage: node prototype/netling2/sim/exchange-stock.mjs [lives=150] [archetypes]
process.env.TZ = 'UTC';
const lives = Number(process.argv[2] ?? 150);
const bases = (process.argv[3] ?? 'attentive,casual,worker,sysadmin').split(',');
const { ARCHETYPES, simulate, stats } = await import('./balance.mjs');
const { RUN_CFG, marketStock } = await import('./netrun/run.js');
const { REGIONS } = await import('../../../src/netrun/regions.js');
const options = {
  'S0 voucher 3, memory 1 (now)': { voucher: 3, memory: 1 },
  'S1 + booster 2': { voucher: 3, booster: 2, memory: 1 },
  'S2 + booster 2, bypass 1': { voucher: 3, booster: 2, overclock: 1, memory: 1 },
  'S3 + booster 2, bypass 2, memory 2': { voucher: 3, booster: 2, overclock: 2, memory: 2 },
};
// Part 1: two distinct offers, the second redrawn up to ten times if it repeats the first (as in run.js).
const draw = (table, rng) => {
  const entries = Object.entries(table);
  const total = entries.reduce((a, [, w]) => a + w, 0);
  let r = rng() * total;
  for (const [id, w] of entries) if ((r -= w) < 0) return id;
  return entries[entries.length - 1][0];
};
let seed = 7;
const rng = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
console.log('Part 1: share of visits that offer each item (2 distinct offers), 20000 visits');
for (const [name, table] of Object.entries(options)) {
  const count = {};
  let pairs = new Set();
  for (let i = 0; i < 20000; i++) {
    const a = draw(table, rng);
    let b = a;
    for (let k = 0; k < 10 && b === a; k++) b = draw(table, rng);
    for (const id of new Set([a, b])) count[id] = (count[id] ?? 0) + 1;
    pairs.add([a, b].sort().join('+'));
  }
  console.log(name.padEnd(36), Object.entries(count).map(([id, n]) => `${id} ${(n / 200).toFixed(0)}%`).join('  '), `| ${pairs.size} distinct pairs`);
}
const black = marketStock('black', REGIONS.public);
console.log('black market (public net) stock, healing removed:', JSON.stringify(black));

console.log('\nPart 2: bots (full life / infections / standing corp, street / scrip spent / runs)');
for (const base of bases) {
  for (const [name, table] of Object.entries(options)) {
    RUN_CFG.exchangeStock = { ...table, coolant: 0, repair: 0, antivirus: 0 };
    const rs = [];
    for (let i = 1; i <= lives; i++) rs.push(simulate({ ...ARCHETYPES[base] }, i));
    const st = stats(rs);
    console.log(base.padEnd(10), name.slice(0, 2), `full ${st.fullLife}`, `inf ${st.pressure.viruses}`, `corp ${st.standing.corp.toFixed(1)} street ${st.standing.street.toFixed(1)}`, `scripSpent ${st.bugs.scripSpent}`, `runs ${st.runs ?? '-'}`);
  }
}
