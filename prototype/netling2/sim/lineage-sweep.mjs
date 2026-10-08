// Lives to finish the 18 egg pages, three eggs one after another, on the 2.0 fork: the fork's version of docs/netling2-prototypes/lines2.mjs plus
// rogue2.mjs, with the decided rules. Usage: node prototype/netling2/sim/lineage-sweep.mjs <archetype> [lineages=200] [lives=10]
//   Decided rules in play (maintainer): codex cap 12 a life, Root Access mid-life (CFG.rootMid), role pages 0.20 on any run in any cleared
//   non-Deep region, the hidden page 0.50 on each Deep run, the first Source exit of an egg guarantees its Source page, and the elder
//   feat gets easier with every elder the account has (the four tiers below; the first is 1.0's).
//   Not modelled: the 22 Root pages are 1.0's (the 2.0 list has 24 Root and 15 late pages, whose regions are not in the fork), 2.0 abilities
//   unless NR2 is set (NR2=all switches on the abilities, tiers and light costs), and the harder-ICE shares unless NR2 sets them.
// Env: FEATS=1.0 keeps 1.0's feat for every elder (the old tables; not the ICE tiers, which are NR2 tiers); ROLE, HID set the page rates; CAP the codex cap; JSON=1.
process.env.TZ = 'UTC';
const { ARCHETYPES, simulate } = await import('./balance.mjs');
const { CFG, lineOf } = await import('./sim.js');
const { RUN_CFG } = await import('./netrun/run.js');
const { ROOT_FRAGMENT_IDS } = await import('./codex2.js');

const [name, n = 200, lives = 10] = [process.argv[2], Number(process.argv[3] ?? 200), Number(process.argv[4] ?? 10)];
if (!ARCHETYPES[name]) throw new Error(`unknown archetype ${name}`);
const ROLE = Number(process.env.ROLE ?? 0.2), HID = Number(process.env.HID ?? 0.5);
if (process.env.CAP) RUN_CFG.codexPerLife = Number(process.env.CAP);
const LADDER = { 1: [3, 2], 2: [2, 99], 3: [2, 1], 4: [1, 99] }; // tier 1 first elder of the account, 2 any elder in the Dex, 3 an elder of this egg, 4 this very elder

// One egg's lineage. fresh: empty codex and no Root (egg 1); otherwise Root held and the codex full, with an elder already in the account.
function lineage(seed, fresh) {
  let codex = fresh ? [] : [...ROOT_FRAGMENT_IDS];
  let fragment = null;
  let rootLife = fresh ? null : 0;
  const owned = new Set(); // this egg's elders
  let tierUsed = 1;
  CFG.featFor = process.env.FEATS === '1.0' ? null : (s) => {
    const tier = owned.has(lineOf(s.form)) ? 4 : owned.size ? 3 : fresh ? 1 : 2;
    tierUsed = tier;
    return LADDER[tier];
  };
  const rows = [];
  for (let gen = 1; gen <= lives; gen++) {
    tierUsed = fresh && !owned.size ? 1 : 2;
    const r = simulate({ ...ARCHETYPES[name] }, seed * 1000 + gen, { fragment, generation: gen, codex, rootAccess: rootLife !== null });
    codex = r.codex;
    fragment = r.fragment;
    if (rootLife === null && ROOT_FRAGMENT_IDS.every((id) => codex.includes(id))) rootLife = gen;
    const elder = (r.stageDays?.mainframe ?? 0) > 0;
    if (elder) owned.add(lineOf(r.form));
    rows.push({
      nd: ['public', 'bazaar', 'corp', 'ruins'].reduce((a, k) => a + (r.regionRuns[k] ?? 0), 0),
      deep: r.regionRuns.deep ?? 0,
      source: r.regionRuns.source ?? 0,
      exit: r.cleared.includes('source'),
      elder,
      tier: tierUsed,
    });
  }
  CFG.featFor = null;
  return { rootLife, lives: rows };
}

// A tiny seeded generator for the page rolls (the lives above are seeded already).
let st = 11;
const rnd = () => { st = (Math.imul(st, 1664525) + 1013904223) >>> 0; return st / 4294967296; };
const binom = (k, p) => { let c = 0; for (let i = 0; i < k; i++) if (rnd() < p) c++; return c; };
const q = (a, p) => [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(p * a.length))];

const e1 = Array.from({ length: n }, (_, i) => lineage(i + 1, true));
const later = Array.from({ length: n }, (_, i) => lineage(100000 + i + 1, false));
const poolOf = (L) => L.flatMap((l) => l.lives.slice(l.rootLife ?? 99));
const p1 = poolOf(e1);
const p2 = poolOf(later);
function egg(seq, pool) {
  let role = 4, hidden = 1, src = 1, life = 0;
  while ((role || hidden || src) && life < 400) {
    const row = life < seq.length ? seq[life] : pool[Math.floor(rnd() * pool.length)];
    life++;
    if (role) role = Math.max(0, role - binom(row.nd, ROLE));
    if (hidden && binom(row.deep, HID)) hidden = 0;
    if (src && row.exit) src = 0;
  }
  return life;
}
const T = 4000, first = [], total = [];
for (let t = 0; t < T; t++) {
  const a = egg(e1[Math.floor(rnd() * e1.length)].lives, p1);
  const b = egg(later[Math.floor(rnd() * later.length)].lives, p2);
  const c = egg(later[Math.floor(rnd() * later.length)].lives, p2);
  first.push(a);
  total.push(a + b + c);
}
const by = (k) => Math.round((100 * total.filter((x) => x <= k).length) / T);
const rootLives = e1.map((l) => l.rootLife).filter((x) => x !== null);
const elderShare = (pool) => pool.filter((r) => r.elder).length / pool.length;
const firstElder = e1.map((l) => l.lives.findIndex((r) => r.elder) + 1).filter((x) => x > 0);
const out = {
  archetype: name, lineages: n, lives, role: ROLE, hidden: HID, cap: RUN_CFG.codexPerLife, tiers: process.env.FEATS !== '1.0',
  rootLifeMedian: rootLives.length ? q(rootLives, 0.5) : null, rootReached: rootLives.length / n,
  firstElderLifeMedian: firstElder.length ? q(firstElder, 0.5) : null, firstElderReached: firstElder.length / n,
  elderShareAfterRoot: { egg1: +elderShare(p1).toFixed(2), later: +elderShare(p2).toFixed(2) },
  egg1: { median: q(first, 0.5), p90: q(first, 0.9) },
  threeEggs: { median: q(total, 0.5), p10: q(total, 0.1), p90: q(total, 0.9), by6: by(6), by8: by(8), by10: by(10) },
};
if (process.env.JSON) console.log(JSON.stringify(out));
else console.log(`${name.padEnd(10)} cap ${out.cap} role ${ROLE} hid ${HID} tiers ${out.tiers ? 'on' : 'off'} | root life ${out.rootLifeMedian} (${Math.round(out.rootReached * 100)}% reach) | first elder life ${out.firstElderLifeMedian} (${Math.round(out.firstElderReached * 100)}%) | elder share after Root ${out.elderShareAfterRoot.egg1}/${out.elderShareAfterRoot.later} | egg 1 ${out.egg1.median}/${out.egg1.p90} | three eggs ${out.threeEggs.median} (p10 ${out.threeEggs.p10}, p90 ${out.threeEggs.p90}) by 6: ${out.threeEggs.by6}%, 8: ${out.threeEggs.by8}%, 10: ${out.threeEggs.by10}%`);
