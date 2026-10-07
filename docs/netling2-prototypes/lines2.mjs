// Lineages with a lighter elder feat after the lineage's first elder. MODE=e1 (fresh, empty codex), MODE=later (Root held, codex full, as eggs 2
// and 3), MODE=laterEasy (the same but the feat is light from the first life: the account has already had an elder). CAP codex fragments a life.
import fs from 'fs';
import { ARCHETYPES, simulate } from './tools/balance.mjs';
import { RUN_CFG } from './src/netrun/run.js';
import { CFG } from './src/sim.js';
import { ROOT_FRAGMENT_IDS } from './src/netrun/codex.js';
const [name, n, lives] = [process.argv[2], Number(process.argv[3] ?? 300), Number(process.argv[4] ?? 10)];
const MODE = process.env.MODE ?? 'e1', TAG = process.env.TAG ?? '';
RUN_CFG.codexPerLife = Number(process.env.CAP ?? 12);
const HARD = [3, 2], EASY = [Number(process.env.EXITS ?? 2), Number(process.env.CLEAN ?? 1)];
const out = [];
for (let seed = 1; seed <= n; seed++) {
  let codex = MODE === 'e1' ? [] : [...ROOT_FRAGMENT_IDS], fragment = null, codexLife = MODE === 'e1' ? null : 0, eldered = MODE === 'laterEasy' || process.env.EASYALL === '1';
  const rows = [];
  for (let gen = 1; gen <= lives; gen++) {
    const [ex, cl] = eldered ? EASY : HARD; CFG.mainframeExits = ex; CFG.mainframeCleanExits = cl;
    const r = simulate({ ...ARCHETYPES[name] }, seed * 1000 + gen, { fragment, generation: gen, codex, rootAccess: codexLife !== null });
    codex = r.codex; fragment = r.fragment;
    if (codexLife === null && ROOT_FRAGMENT_IDS.every((id) => codex.includes(id))) codexLife = gen;
    const elder = (r.stageDays?.mainframe ?? 0) > 0;
    if (elder) eldered = true;
    rows.push({ nd: ['public', 'bazaar', 'corp', 'ruins'].reduce((a, k) => a + (r.regionRuns[k] ?? 0), 0), deep: r.regionRuns.deep ?? 0, source: r.regionRuns.source ?? 0, exit: r.cleared.includes('source'), elder, easy: ex !== 3 });
  }
  out.push({ rootLife: codexLife, lives: rows });
}
fs.writeFileSync(`l2-${name}-${MODE}${TAG}.json`, JSON.stringify(out));
const pool = out.flatMap((l) => l.lives.slice(l.rootLife ?? 99));
console.log(name, MODE, TAG, 'root median', out.map((l) => l.rootLife).filter((x) => x !== null).sort((a, b) => a - b)[Math.floor(n / 2)], 'elder share of post-Root lives', (pool.filter((r) => r.elder).length / pool.length).toFixed(2));
