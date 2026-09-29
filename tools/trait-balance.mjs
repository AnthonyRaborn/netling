// Measures each trait at several strengths against the same parent with the trait switched off.
// Usage: node tools/trait-balance.mjs [lives=400] [archetypes=casual,attentive] [forms=all] [strengths=0,0.5,1,cap]
// A strength scales the trait's TRAIT_CFG.full effect (and Volatile's Integrity cost) for a child of
// that form at level 1, so 0.5 is a history alone and "cap" is the trait's cap. Prints, per strength,
// the full-life rate and its change, the largest change in any adult form's share, corp traces and
// faults a life. Targets are in docs/TESTING.md.
process.env.TZ = 'UTC';
const { TRAIT_CFG, FORMS } = await import('../src/sim.js');
const { simulate, stats, ARCHETYPES, parentOf } = await import('./balance.mjs');

const n = Number(process.argv[2] ?? 400);
const archetypes = (process.argv[3] ?? 'casual,attentive').split(',');
const forms = process.argv[4] && process.argv[4] !== 'all' ? process.argv[4].split(',') : Object.keys(FORMS);
const strengths = (process.argv[5] ?? '0,0.5,1,cap').split(',');
const base = structuredClone(TRAIT_CFG);

for (const form of forms) {
  const trait = FORMS[form].trait;
  const rows = {};
  for (const k of strengths.map((x) => (x === 'cap' ? base.cap[trait] : Number(x)))) {
    TRAIT_CFG.full[trait] = base.full[trait] * k;
    TRAIT_CFG.volatileIntegrity = trait === 'volatile' ? base.volatileIntegrity * k : base.volatileIntegrity;
    for (const a of archetypes) {
      const st = stats(Array.from({ length: n }, (_, i) => simulate(ARCHETYPES[a], i + 1, { fragment: parentOf(form), generation: 2 })));
      (rows[a] ??= []).push({ k, st });
    }
  }
  TRAIT_CFG.full[trait] = base.full[trait];
  TRAIT_CFG.volatileIntegrity = base.volatileIntegrity;
  for (const a of archetypes) {
    const off = rows[a].find((r) => r.k === 0)?.st ?? rows[a][0].st;
    const cells = rows[a].map(({ k, st }) => {
      const shift = Math.max(...Object.keys({ ...st.adults, ...off.adults }).map((f) => Math.abs((st.adults[f] ?? 0) - (off.adults[f] ?? 0))));
      return `${k}: full ${(st.fullLife * 100).toFixed(0)}% (${((st.fullLife - off.fullLife) * 100).toFixed(1)}), form shift ${(shift * 100).toFixed(1)}, traces ${st.traces.toFixed(1)}, faults ${st.mistakes.toFixed(1)}`;
    });
    console.log(`${trait.padEnd(11)} ${a.padEnd(9)} ${cells.join(' | ')}`);
  }
}
