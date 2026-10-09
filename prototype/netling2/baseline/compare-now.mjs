// Compares the "now" re-run (results/now-*) with the baseline it repeats (results/<same name>, and balance-decided-<egg> for
// now-balance-<egg>). JSON-lines sweeps: rows are matched on their text fields and every number that moved by more than the threshold
// is listed (full life and other shares: 2 points; other numbers: 15% and 0.1). Other text outputs: lines that differ are counted and
// the first few shown. Usage: node prototype/netling2/baseline/compare-now.mjs [name filter] [--all]  (--all lists every changed text line)
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = join(dirname(fileURLToPath(import.meta.url)), 'results');
const filter = process.argv.slice(2).find((a) => !a.startsWith('--'));
const all = process.argv.includes('--all');
const share = (k) => /fullLife|share|rate|^c?Hi$|^c?Lo$|^s(Hi|Lo)$|flow|oc$|tied|certain|reached|ceiling/i.test(k);
const moved = (k, a, b) => (share(k) && Math.abs(a) <= 1 && Math.abs(b) <= 1 ? Math.abs(b - a) > 0.02 : Math.abs(b - a) > 0.1 && Math.abs(b - a) > 0.15 * Math.max(Math.abs(a), Math.abs(b)));
const keyOf = (r) => Object.entries(r).filter(([, v]) => typeof v === 'string' || typeof v === 'boolean').map(([k, v]) => `${k}=${v}`).join(' ');
const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? flat(v, `${p}${k}.`) : typeof v === 'number' ? [[`${p}${k}`, v]] : []));
const jsonLines = (txt) => { const rows = []; for (const l of txt.split('\n')) { if (!l.startsWith('{')) continue; try { rows.push(JSON.parse(l)); } catch { /* not JSON */ } } return rows; };
for (const f of readdirSync(dir).filter((f) => f.startsWith('now-') && !f.endsWith('.err') && !f.endsWith('.failed')).sort()) {
  if (filter && !f.includes(filter)) continue;
  const base = f.replace(/^now-balance-(iron|program|wetware)\.json$/, 'balance-decided-$1.json').replace(/^now-/, '');
  if (!existsSync(join(dir, base))) { console.log(`\n## ${f}: no baseline (${base})`); continue; }
  const a = readFileSync(join(dir, base), 'utf8'); const b = readFileSync(join(dir, f), 'utf8');
  console.log(`\n## ${f} against ${base}`);
  if (f.endsWith('.json')) {
    const A = JSON.parse(a), B = JSON.parse(b);
    if (A.archetypes && B.archetypes) {
      const out = [];
      for (const [n, rb] of Object.entries(B.archetypes)) {
        const ra = A.archetypes[n]; if (!ra) continue;
        const fa = Object.fromEntries(flat(ra)), ch = flat(rb).filter(([k, v]) => k in fa && /^(fullLife|mistakes|bugs\.avg|pressure\.viruses|temper|medianDays)$/.test(k) && moved(k, fa[k], v)).map(([k, v]) => `${k} ${+fa[k].toFixed(3)} -> ${+v.toFixed(3)}`);
        if (ch.length) out.push(`  ${n}: ${ch.join(', ')}`);
      }
      console.log(out.length ? out.join('\n') : '  no archetype moved past the threshold (full life 2 points; faults, bugs, infections, temper 15%)');
    } else {
      const fa = Object.fromEntries(flat(A));
      const rows = flat(B).filter(([k, v]) => k in fa).map(([k, v]) => `  ${k}: ${+fa[k].toFixed(3)} -> ${+v.toFixed(3)}${v !== fa[k] ? '' : ' (same)'}`);
      console.log(rows.join('\n'));
    }
    continue;
  }
  const RA = jsonLines(a), RB = jsonLines(b);
  if (RA.length && RB.length) {
    const byKey = new Map(RA.map((r) => [keyOf(r), r]));
    let n = 0, unmatched = 0; const out = [];
    for (const rb of RB) {
      const ra = byKey.get(keyOf(rb)); if (!ra) { unmatched++; continue; }
      const fa = Object.fromEntries(flat(ra));
      const ch = flat(rb).filter(([k, v]) => k in fa && moved(k, fa[k], v)).map(([k, v]) => `${k} ${+fa[k].toFixed(3)} -> ${+v.toFixed(3)}`);
      if (ch.length) { n++; if (all || out.length < 12) out.push(`  ${keyOf(rb)}: ${ch.join(', ')}`); }
    }
    console.log(`  ${RB.length} rows, ${n} moved past the threshold${unmatched ? `, ${unmatched} unmatched` : ''}`);
    if (out.length) console.log(out.join('\n') + (n > out.length ? `\n  ... ${n - out.length} more (--all)` : ''));
    continue;
  }
  const la = a.split('\n'), lb = b.split('\n');
  const diff = lb.map((l, i) => [i, la[i], l]).filter(([, x, y]) => x !== y);
  console.log(`  ${lb.length} lines, ${diff.length} differ`);
  for (const [i, x, y] of diff.slice(0, all ? Infinity : 8)) console.log(`  ${i + 1}: ${x ?? ''}\n  ${' '.repeat(String(i + 1).length)}> ${y}`);
}
