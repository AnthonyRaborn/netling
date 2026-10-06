import { ARCHETYPES, simulate } from './tools/balance.mjs';
import { CFG } from './src/sim.js';
CFG.feedAllegiance = 0.25; CFG.maxMistakes = 1e9;
const name = process.argv[2];
const rs = [];
for (let seed = 1; seed <= 100; seed++) rs.push(simulate({ ...ARCHETYPES[name] }, seed));
const m = (k) => +(rs.reduce((a, r) => a + (r.actCount[k] ?? 0), 0) / rs.length).toFixed(1);
console.log(JSON.stringify({ name, corp: m('corp'), scav: m('scav'), play: m('play'), cool: m('cool'), patch: m('patch'), purge: m('purge') }));
