// Compares two JSON reports from the balance tools and prints what moved.
// Usage: JSON=1 node tools/balance.mjs 1000 > before.json   (change something)
//        JSON=1 node tools/balance.mjs 1000 > after.json
//        node tools/balance-diff.mjs before.json after.json [threshold=0.01]
// Works for tools/netrun-balance.mjs reports too. Rates are fractions, shown as percentage points.
import { readFileSync } from 'node:fs';

// Every number in a report, keyed by its path (archetypes.attentive.adults.daemon).
export function flatten(value, path = '', out = {}) {
  if (typeof value === 'number') out[path] = value;
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) flatten(v, path ? `${path}.${k}` : k, out);
  }
  return out;
}

// Rows for every path whose value changed by at least threshold. A path only on one side counts
// as 0 on the other (a form that stopped appearing, say).
export function diff(before, after, threshold = 0.01) {
  const a = flatten(before);
  const b = flatten(after);
  const rows = [];
  for (const path of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (/^(runs|lives|archetypes\.[^.]+\.(runs|lines))$/.test(path)) continue;
    const x = a[path] ?? 0;
    const y = b[path] ?? 0;
    if (Math.abs(y - x) >= threshold) rows.push({ path, before: x, after: y, delta: y - x });
  }
  return rows.sort((p, q) => p.path.localeCompare(q.path));
}

// Rates (the shares, and teen, adult, fullLife and the like) read better as percentages.
const RATE = /(?<!stageDays)\.(teen|adult|fullLife)$|\.(deaths|teens|adults|byLife)\.[^.]+$|\.(jacked|disconnected)$/;
const show = (path, v) => (RATE.test(path) ? `${(v * 100).toFixed(1)}%` : String(Math.round(v * 100) / 100));

if (import.meta.url === `file://${process.argv[1]}`) {
  const [fa, fb, t] = process.argv.slice(2);
  if (!fa || !fb) {
    console.error('usage: node tools/balance-diff.mjs before.json after.json [threshold=0.01]');
    process.exit(2);
  }
  const rows = diff(JSON.parse(readFileSync(fa, 'utf8')), JSON.parse(readFileSync(fb, 'utf8')), Number(t ?? 0.01));
  if (!rows.length) console.log('no changes above the threshold');
  for (const r of rows) {
    const d = RATE.test(r.path) ? `${r.delta > 0 ? '+' : ''}${(r.delta * 100).toFixed(1)} pts` : `${r.delta > 0 ? '+' : ''}${Math.round(r.delta * 100) / 100}`;
    console.log(`${r.path.replace(/^archetypes\./, '').padEnd(48)} ${show(r.path, r.before).padStart(8)} -> ${show(r.path, r.after).padStart(8)}  (${d})`);
  }
}
