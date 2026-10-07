// Lives to finish the 18 egg pages (guaranteed first-Source-exit rule), three eggs one after another. Egg 1 is a real lineage from an empty codex;
// eggs 2 and 3 are fresh lineages that start with Root held and the codex full. See lines2.mjs for the feat variants.
import fs from 'fs';
let seed = 11; const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
const binom = (n, p) => { let k = 0; for (let i = 0; i < n; i++) if (rnd() < p) k++; return k; };
const [name, e1file, lfile] = process.argv.slice(2);
const ROLE = Number(process.env.ROLE ?? 0.10), HID = Number(process.env.HID ?? 0.25);
const e1 = JSON.parse(fs.readFileSync(e1file, 'utf8')), later = JSON.parse(fs.readFileSync(lfile, 'utf8'));
const poolOf = (L) => L.flatMap((l) => l.lives.slice(l.rootLife ?? 99));
const p1 = poolOf(e1), p2 = poolOf(later);
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
const T = 4000, first = [], total = [], q = (a, p) => [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(p * a.length))];
for (let t = 0; t < T; t++) {
  const l1 = e1[Math.floor(rnd() * e1.length)], l2 = later[Math.floor(rnd() * later.length)], l3 = later[Math.floor(rnd() * later.length)];
  const a = egg(l1.lives, p1), b = egg(l2.lives, p2), c = egg(l3.lives, p2);
  first.push(a); total.push(a + b + c);
}
const by = (n) => Math.round(100 * total.filter((x) => x <= n).length / T);
console.log(`${name.padEnd(34)} role ${ROLE} hid ${HID}  egg1 ${q(first, 0.5)}/${q(first, 0.9)}  three eggs ${q(total, 0.5)} (p10 ${q(total, 0.1)}, p90 ${q(total, 0.9)})  by 6: ${by(6)}%  by 8: ${by(8)}%  by 10: ${by(10)}%`);
