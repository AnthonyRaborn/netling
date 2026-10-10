// Rogue, the relay question (docs/NETLING_2_ROGUE_DRAFTS.md 9.7, decided: continuing past the relay before a cordon pays about a third more, at a
// matching risk). The careful bot plays a Rogue run in a region with a cordon right after the relay layer (the Deep, the Source) until it stands at
// that layer's relay; the run is then copied and played both ways: QUIET jacks out there, PUSH goes on (the dead drop first for Drop and Stash while
// there is trail; always on, even when hurt; later relays by the bot's own rule). Runs that never stand at that relay are counted, not split.
// Reported per form and region: the share of runs that reach the relay, banked value quiet and push (and push / quiet, the 1.33 target), and what
// pushing on met after the relay: exit and disconnect rates, marks, hunters and ambushes met and lost; then the same split by Integrity at the relay
// (under 55, where the careful bot would bank, and 55 or more).
// Usage: node prototype/netling2/sim/rogue-relay.mjs [runs=3000] [regions=deep,source]. JSON=1 prints JSON. ROGUE_RUN='{...}' overrides NR2.rogue.
process.env.TZ = 'UTC';
process.env.NR2 = process.env.NR2 ?? 'all';
process.env.PERKS = process.env.PERKS ?? '1';
process.env.ROGUE = process.env.ROGUE ?? '1';
const { createScript, mulberry32, SCRIP } = await import('./sim.js');
const { playRun, continueRun, RUN_STYLES } = await import('./netrun-bot.mjs');
const { choose, hunted } = await import('./netrun/run.js');
const { REGIONS } = await import('../../../src/netrun/regions.js');
const { nodeById } = await import('../../../src/netrun/map.js');

const n = Number(process.argv[2] ?? 3000);
const regions = (process.argv[3] ?? 'deep,source').split(',');
const ROLES = ['Breach', 'Dodge', 'Tune', 'Feast'];
const VALUE_PER_ITEM = 12; // as rogue-netrun.mjs
const BANK_AT = RUN_STYLES.careful.bankAt;

const cases = [];
for (const level of [1, 2]) for (const r of ROLES) cases.push({ label: `${level === 1 ? 'rogueAdult' : 'rogueElder'}${r}`, form: level === 1 ? `rogueAdult${r}` : `rogueElder${r}`, level });

const worth = (pet, scrip0) => pet.inventory.reduce((a, id) => a + (SCRIP.price[id] ?? 0), 0) / VALUE_PER_ITEM + ((pet.scrip ?? 0) - scrip0) / VALUE_PER_ITEM;
const TALLY = ['hunters', 'huntersLost', 'ambushes', 'ambushesLost'];

function play(c, seed, region) {
  const rng = mulberry32(seed);
  const pet = createScript({ now: 0, rng });
  pet.egg = 'rogue';
  pet.stage = c.level === 2 ? 'mainframe' : 'adult';
  pet.form = c.form;
  pet.marks = 0;
  pet.rootAccess = true;
  Object.assign(pet.stats, { charge: 60 + rng() * 40, integrity: 60 + rng() * 40, heat: 20 + rng() * 30 });
  const scrip0 = pet.scrip ?? 0;
  const relayLayer = Math.ceil(REGIONS[region].layers / 2);
  const style = { ...RUN_STYLES.careful, winRate: 0.7, lean: 'mix' };
  const atRelay = (p) => p.run.phase === 'choice' && p.run.pending?.kind === 'relay' && nodeById(p.run.map, p.run.pos)?.layer === relayLayer;
  const run = playRun(pet, { ...style, stopAt: atRelay }, region, rng);
  if (!atRelay(pet) || !hunted(pet)) return { reached: false };
  // The cordon is the layer after the relay (rogue-map.js); a run without one is not the question.
  if (!run.map.rogueRules?.cordon?.includes(relayLayer + 1)) return { reached: false, noCordon: true };
  const integrity = pet.stats.integrity;
  const before = Object.fromEntries(TALLY.map((k) => [k, run.tally[k] ?? 0]));
  // QUIET: a copy jacks out here (its own rng: the egg page roll on the way out).
  const quiet = structuredClone(pet);
  choose(quiet, 'out', mulberry32(seed ^ 0x5bd1e995));
  // PUSH: the dead drop first while there is trail, then on.
  if (pet.run.pending.options.some((o) => o.id === 'deaddrop') && pet.run.hunt > 0) choose(pet, 'deaddrop', rng);
  choose(pet, 'continue', rng);
  continueRun(pet, style, rng);
  const t = pet.run.tally;
  const at = nodeById(pet.run.map, pet.run.pos);
  return {
    reached: true,
    integrity,
    quiet: worth(quiet, scrip0),
    push: worth(pet, scrip0),
    exit: pet.run.result === 'jacked' && at?.type === 'exit',
    laterRelay: pet.run.result === 'jacked' && at?.type === 'relay',
    disc: pet.run.result === 'disconnected',
    marks: pet.marks ?? 0,
    ...Object.fromEntries(TALLY.map((k) => [k, (t[k] ?? 0) - before[k]])),
  };
}

const mean = (xs, f) => (xs.length ? xs.reduce((a, x) => a + f(x), 0) / xs.length : NaN);
const sum = (rs) => ({
  n: rs.length,
  quiet: mean(rs, (r) => r.quiet), push: mean(rs, (r) => r.push), ratio: mean(rs, (r) => r.push) / mean(rs, (r) => r.quiet),
  exit: mean(rs, (r) => r.exit), laterRelay: mean(rs, (r) => r.laterRelay), disc: mean(rs, (r) => r.disc), marks: mean(rs, (r) => r.marks),
  ...Object.fromEntries(TALLY.map((k) => [k, mean(rs, (r) => r[k])])),
});
const out = [];
for (const region of regions) for (const c of cases) {
  const all = Array.from({ length: n }, (_, i) => play(c, 1000 + i, region));
  const rs = all.filter((r) => r.reached);
  out.push({
    region, form: c.label, runs: n, reached: rs.length / n, noCordon: all.filter((r) => r.noCordon).length / n,
    all: sum(rs), hurt: sum(rs.filter((r) => r.integrity < BANK_AT)), fine: sum(rs.filter((r) => r.integrity >= BANK_AT)),
  });
}
if (process.env.JSON) console.log(JSON.stringify(out, null, 1));
else {
  const f = (x, d = 2) => (Number.isFinite(x) ? x.toFixed(d) : '-');
  const p = (x) => (Number.isFinite(x) ? (x * 100).toFixed(1) : '-');
  for (const region of regions) {
    console.log(`\n## ${region} (careful bot, ${n} runs a form; split at the relay before the cordon)\n`);
    console.log('| form | reached % | value quiet | value push | push / quiet | push: exit % | later relay % | disconnect % | marks | hunters (lost) | ambushes (lost) | hurt at relay %: push / quiet | fine at relay: push / quiet |');
    console.log('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
    for (const r of out.filter((x) => x.region === region)) {
      const a = r.all;
      console.log(`| ${r.form} | ${p(r.reached)} | ${f(a.quiet)} | ${f(a.push)} | ${f(a.ratio)} | ${p(a.exit)} | ${p(a.laterRelay)} | ${p(a.disc)} | ${f(a.marks, 3)} | ${f(a.hunters)} (${f(a.huntersLost)}) | ${f(a.ambushes)} (${f(a.ambushesLost)}) | ${p(r.hurt.n / a.n)}: ${f(r.hurt.ratio)} | ${f(r.fine.ratio)} |`);
    }
  }
}
