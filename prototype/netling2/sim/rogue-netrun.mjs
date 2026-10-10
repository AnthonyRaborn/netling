// Rogue, simulator stage 2: netrun outcomes per region for the four Rogue forms (adult and elder) against the NL-0 hidden form and the NL-0 forms
// of the same role base, on the fork's rules (NR2=all). docs/NETLING_2_ROGUE_DRAFTS.md 4.2, 4.4, 9 and 7.4.
// Usage: node prototype/netling2/sim/rogue-netrun.mjs [runs=1000] [regions=public,bazaar,corp,ruins,deep,source] [styles=careful]
//   FORMS=rogue,hidden,base   which groups (default all three). JSON=1 prints JSON. RUNBOT=quiet makes every Rogue run a quiet runner.
//   MARKS=n                   the marks a Rogue netling carries into each run (default 0; the careful bot bails at a relay with 2).
// Each run starts from the same spread of stats as netrun-sweep.mjs. Reported per form and region: exit rate (reached the exit), careful
// disconnects, banked value (items worth, plus loose scrip, in items), fights met (ICE and ambushes reached, slipped or not), hunters met and lost,
// ambushes met and lost, marks a run, the trail at the end of a run, and how many runs left at a relay.
process.env.TZ = 'UTC';
process.env.NR2 = process.env.NR2 ?? 'all';
process.env.PERKS = process.env.PERKS ?? '1';
process.env.ROGUE = process.env.ROGUE ?? '1';
const { createScript, mulberry32, SCRIP } = await import('./sim.js');
const { playRun, RUN_STYLES } = await import('./netrun-bot.mjs');
const { REGION_ORDER } = await import('../../../src/netrun/regions.js');
const { nodeById } = await import('../../../src/netrun/map.js');

const n = Number(process.argv[2] ?? 1000);
const regions = (process.argv[3] ?? REGION_ORDER.filter((r) => r !== 'tutorial').join(',')).split(',');
const styles = (process.argv[4] ?? 'careful').split(',');
const groups = (process.env.FORMS ?? 'rogue,hidden,base').split(',');
const ROGUE_FORMS = ['Breach', 'Dodge', 'Tune', 'Feast'];
const BASE = { Breach: 'breachStreet', Dodge: 'dodgeStreet', Tune: 'tuneCorp', Feast: 'feastStreet' };
const VALUE_PER_ITEM = 12; // scrip an item is worth, for banked value (the same scale as netrun-sweep.mjs)

const cases = [];
for (const level of [1, 2]) {
  if (groups.includes('rogue')) for (const r of ROGUE_FORMS) cases.push({ label: `${level === 1 ? 'rogueAdult' : 'rogueElder'}${r}`, egg: 'rogue', form: `rogueAdult${r}`, level });
  if (groups.includes('hidden')) cases.push({ label: level === 1 ? 'hidden' : 'hiddenElder', egg: 'program', form: 'hidden', level });
  if (groups.includes('base')) for (const r of ROGUE_FORMS) cases.push({ label: level === 1 ? BASE[r] : `${BASE[r]}Elder`, egg: 'program', form: BASE[r], level });
}

function play(c, styleName, seed, region) {
  const rng = mulberry32(seed);
  const pet = createScript({ now: 0, rng });
  pet.egg = c.egg;
  pet.stage = c.level === 2 ? 'mainframe' : 'adult';
  pet.form = c.level === 2 ? (c.egg === 'rogue' ? c.form.replace('Adult', 'Elder') : `${c.form}Elder`) : c.form;
  pet.marks = Number(process.env.MARKS ?? 0);
  pet.rootAccess = true;
  Object.assign(pet.stats, { charge: 60 + rng() * 40, integrity: 60 + rng() * 40, heat: 20 + rng() * 30 });
  const worth = (inv) => inv.reduce((a, id) => a + (SCRIP.price[id] ?? 0), 0) / VALUE_PER_ITEM;
  const scrip0 = pet.scrip ?? 0;
  const marks0 = pet.marks;
  const run = playRun(pet, { ...RUN_STYLES[styleName], winRate: 0.7, lean: 'mix' }, region, rng);
  const t = run.tally;
  const at = nodeById(run.map, run.pos);
  return {
    exit: run.result === 'jacked' && at?.type === 'exit',
    relay: run.result === 'jacked' && at?.type === 'relay',
    disc: run.result === 'disconnected',
    value: worth(pet.inventory) + ((pet.scrip ?? 0) - scrip0) / VALUE_PER_ITEM,
    fights: (t.iceWon ?? 0) + (t.iceLost ?? 0) + (t.icePhased ?? 0) - (t.hunters ?? 0),
    hunters: t.hunters ?? 0,
    huntersLost: t.huntersLost ?? 0,
    ambushes: t.ambushes ?? 0,
    ambushesLost: t.ambushesLost ?? 0,
    marks: (pet.marks ?? 0) - marks0,
    hunt: run.hunt ?? 0,
  };
}

const mean = (xs, f) => xs.reduce((a, x) => a + f(x), 0) / xs.length;
const out = [];
for (const styleName of styles) {
  for (const region of regions) {
    for (const c of cases) {
      const rs = Array.from({ length: n }, (_, i) => play(c, styleName, 1000 + i, region));
      const row = {
        style: styleName, region, form: c.label,
        exit: mean(rs, (r) => r.exit), relay: mean(rs, (r) => r.relay), disc: mean(rs, (r) => r.disc), value: mean(rs, (r) => r.value),
        fights: mean(rs, (r) => r.fights), hunters: mean(rs, (r) => r.hunters), huntersLost: mean(rs, (r) => r.huntersLost),
        ambushes: mean(rs, (r) => r.ambushes), ambushesLost: mean(rs, (r) => r.ambushesLost), marks: mean(rs, (r) => r.marks), hunt: mean(rs, (r) => r.hunt),
      };
      out.push(row);
    }
  }
}
if (process.env.JSON) console.log(JSON.stringify(out, null, 1));
else {
  const f = (x, d = 2) => x.toFixed(d);
  const p = (x) => `${(x * 100).toFixed(1)}`;
  for (const styleName of styles) for (const region of regions) {
    console.log(`\n## ${region} (${styleName}, ${n} runs a form)\n`);
    console.log('| form | exit % | relay % | disconnect % | value | fights | hunters (lost) | ambushes (lost) | marks | trail at end |');
    console.log('|---|---|---|---|---|---|---|---|---|---|');
    for (const r of out.filter((x) => x.style === styleName && x.region === region)) console.log(`| ${r.form} | ${p(r.exit)} | ${p(r.relay)} | ${p(r.disc)} | ${f(r.value)} | ${f(r.fights)} | ${f(r.hunters)} (${f(r.huntersLost)}) | ${f(r.ambushes)} (${f(r.ambushesLost)}) | ${f(r.marks, 3)} | ${f(r.hunt, 1)} |`);
  }
}
