// How many lives the 18 egg pages (3 eggs x (4 role + 1 hidden + 1 Source)) take, under different Source page rules.
// Reads lines-<archetype>.json (lines.mjs). Role pages 0.10 a non-Deep run, hidden page 0.25 a Deep run, Source page per rule.
import fs from 'fs';
let seed = 7; const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const binom = (n, p) => { let k = 0; for (let i = 0; i < n; i++) if (rnd() < p) k++; return k; };
const name = process.argv[2];
const lines = JSON.parse(fs.readFileSync(`lines-${name}.json`, 'utf8'));
const pool = lines.flatMap((l) => l.lives.slice(l.rootLife ?? 99));
const RULES = { 'roll 0.25 a Source run': { g: false, p: 0.25 }, 'guaranteed first Source exit': { g: true, p: 0 }, 'roll 0.5 a Source run': { g: false, p: 0.5 }, 'roll 0.75 a Source run': { g: false, p: 0.75 }, 'guaranteed + 0.5 a run': { g: true, p: 0.5 }, 'guaranteed + 0.75 a run': { g: true, p: 0.75 } };
function egg(seq, rule) {
  let role = 4, hidden = 1, src = 1, life = 0, done = { role: null, hidden: null, src: null };
  while ((role || hidden || src) && life < 400) {
    const row = life < seq.length ? seq[life] : pool[Math.floor(rnd() * pool.length)];
    life++;
    if (role) role = Math.max(0, role - binom(row.nd, 0.10)); if (!role && done.role === null) done.role = life;
    if (hidden && binom(row.deep, 0.25)) hidden = 0; if (!hidden && done.hidden === null) done.hidden = life;
    if (src) { if ((rule.g && row.exit) || binom(row.source, rule.p)) src = 0; if (!src) done.src = life; }
  }
  return { life, last: Object.entries(done).sort((a, b) => b[1] - a[1])[0][0], done };
}
const q = (a, p) => [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(p * a.length))];
const T = 4000;
console.log(`## ${name} (lineages ${lines.length}, mature-life pool ${pool.length}, elder share of pool ${(pool.filter((r) => r.elder).length / pool.length).toFixed(2)})`);
console.log('rule'.padEnd(30), 'one egg: median / p90 lives'.padEnd(28), 'three eggs: median / p10 / p90 / by 15, 20, 30 lives (%)', ' last page (egg 2/3: src/role/hidden %)');
for (const [label, rule] of Object.entries(RULES)) {
  const first = [], total = [], lastc = { src: 0, role: 0, hidden: 0 }; let later = 0;
  for (let t = 0; t < T; t++) {
    const l = lines[Math.floor(rnd() * lines.length)];
    const e1 = egg(l.lives, rule); const e2 = egg([], rule); const e3 = egg([], rule);
    first.push(e1.life); total.push(e1.life + e2.life + e3.life);
    for (const e of [e2, e3]) { lastc[e.last]++; later++; }
  }
  const by = (n) => Math.round(100 * total.filter((x) => x <= n).length / T);
  console.log(label.padEnd(30), `${q(first, 0.5)} / ${q(first, 0.9)}`.padEnd(28), `${q(total, 0.5)} / ${q(total, 0.1)} / ${q(total, 0.9)} / ${by(15)}, ${by(20)}, ${by(30)}`.padEnd(46), `${Math.round(100 * lastc.src / later)}/${Math.round(100 * lastc.role / later)}/${Math.round(100 * lastc.hidden / later)}`);
}
