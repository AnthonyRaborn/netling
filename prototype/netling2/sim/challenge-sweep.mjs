// Challenge runs under the 2.0 rules (docs/NETLING_2_NETRUN_DRAFTS.md, ground rule 5; challenges in src/netrun/challenges.js): the share of runs
// that complete each challenge (reach the exit with the rule kept) for every form at both levels, in the Deep and the Source, with the abilities,
// the ICE tiers and Foresight on. The 1.0 table (docs/NETRUN.md, Challenges) used one flat bot and no abilities of this kind.
// Usage: node prototype/netling2/sim/challenge-sweep.mjs [runs=2000] [regions=deep,source] [styles=careful,skilled] [challenges=glass,unplugged,blackout,baremetal]
//   SPREAD=0.2  per-game skill spread for the bots (default 0.2, so Foresight has something to read; 0 is the flat bot)
//   NR2 overrides as everywhere else (NR2='{"tiers":false}' compares with the tiers off). JSON=1 prints JSON.
// Under a challenge the bot never banks at a relay (it pushes for the exit) and, for Bare metal, never buys an item (netrun-bot.mjs).
process.env.TZ = 'UTC';
const { createScript, mulberry32 } = await import('./sim.js');
const { playRun, RUN_STYLES } = await import('./netrun-bot.mjs');
const { NR2 } = await import('./netrun/nr2.js');

const n = Number(process.argv[2] ?? 2000);
const regions = (process.argv[3] ?? 'deep,source').split(',');
const styles = (process.argv[4] ?? 'careful,skilled').split(',');
const challenges = (process.argv[5] ?? 'glass,unplugged,blackout,baremetal').split(',');
const spread = Number(process.env.SPREAD ?? 0.2);
const ALL = ['breachCorp', 'breachStreet', 'dodgeCorp', 'dodgeStreet', 'tuneCorp', 'tuneStreet', 'feastCorp', 'feastStreet', 'hidden'];
if (!process.env.NR2) Object.assign(NR2, { abilities: true, tiers: true, fate: true, foresight: { ...NR2.foresight, on: true } });

function play(style, challenge, form, level, seed, region) {
  const rng = mulberry32(seed);
  const pet = createScript({ now: 0, rng });
  pet.stage = level === 2 ? 'mainframe' : 'adult';
  pet.form = form === 'none' ? 'none' : level === 2 ? `${form}Elder` : form;
  Object.assign(pet.stats, { charge: 60 + rng() * 40, integrity: 60 + rng() * 40, heat: 20 + rng() * 30 });
  playRun(pet, { ...RUN_STYLES[style], spread, challenge, lean: form.endsWith('Corp') ? 'corp' : form.endsWith('Street') ? 'indie' : 'mix' }, region, rng);
  const run = pet.run;
  return { won: Boolean(run.challengeWon) && run.result === 'jacked', void: Boolean(run.challengeVoid), exit: run.result === 'jacked' && run.map.nodes.find((x) => x.id === run.pos)?.type === 'exit', disc: run.result === 'disconnected' };
}
const pct = (rs, f) => +(100 * rs.filter(f).length / rs.length).toFixed(1);
const rows = [];
for (const challenge of challenges) for (const region of regions) for (const style of styles) {
  for (const level of [1, 2]) {
    for (const form of ['none', ...ALL]) {
      if (form === 'none' && level === 2) continue;
      const rs = Array.from({ length: n }, (_, i) => play(style, challenge, form, level, 1000 + i, region));
      // 'none' is a form with no ability: the base netling on the 2.0 rules.
      rows.push({ challenge, region, style, level, form, won: pct(rs, (r) => r.won), exit: pct(rs, (r) => r.exit), disc: pct(rs, (r) => r.disc), voided: pct(rs, (r) => r.void) });
    }
  }
}
if (process.env.JSON) console.log(JSON.stringify(rows, null, 1));
else {
  let last = '';
  for (const r of rows) {
    const head = `${r.challenge} | ${r.region} | ${r.style} | level ${r.level}`;
    if (head !== last) {
      const group = rows.filter((x) => `${x.challenge} | ${x.region} | ${x.style} | level ${x.level}` === head && x.form !== 'none');
      const mean = group.reduce((a, x) => a + x.won, 0) / group.length;
      console.log(`\n== ${head} (mean completion of the nine forms: ${mean.toFixed(1)}%) ==\nform            complete%  exit%  disc%  rule broken%  vs mean`);
      last = head;
    }
    const group = rows.filter((x) => `${x.challenge} | ${x.region} | ${x.style} | level ${x.level}` === head && x.form !== 'none');
    const mean = group.reduce((a, x) => a + x.won, 0) / group.length;
    console.log(`${r.form.padEnd(15)} ${String(r.won).padStart(8)} ${String(r.exit).padStart(6)} ${String(r.disc).padStart(6)} ${String(r.voided).padStart(12)}  ${mean ? (r.won / mean).toFixed(2) : '-'}`);
  }
}
