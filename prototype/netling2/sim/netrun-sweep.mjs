// Netrun outcomes per 2.0 form, on the fork's rules (netrun/nr2.js): the 2.0 counterpart of tools/netrun-balance.mjs.
// Usage: node prototype/netling2/sim/netrun-sweep.mjs [runs=1000] [regions=public,bazaar,corp,ruins,deep,source] [styles=careful,skilled]
//   CASES='[{"abilities":true},{"abilities":true,"tiers":true}]'   NR2 overrides to compare, one report block each (default: abilities off,
//                                                                    abilities on, abilities and tiers on). A case may set "label".
//   FORMS=breachCorp,hidden   which forms (default all nine; each is run at adult level 1 and elder level 2). FORMS=none is no ability.
//   EGG=iron|program|wetware  switches on that egg's pressure (for the light run costs); default none.
//   JSON=1 prints JSON.
// The parity bar from 1.0 (docs/NETRUN.md): no adult more than about 4 points better than another at avoiding disconnects in The Deep,
// and the elders close to each other in the Source. Numbers here are starting values, not tuned. The bot has one skill number, so the
// cost of a tier-2 fight is the assumption in nr2.js.
process.env.TZ = 'UTC';
if (process.env.EGG === 'iron') process.env.IRON = process.env.IRON ?? '{"on":true}';
if (process.env.EGG === 'program') process.env.SIDES = process.env.SIDES ?? '{"on":true,"owner":"charge","ownerMult":3,"charge":{"hold":180}}';
if (process.env.EGG === 'wetware') process.env.SIDES = process.env.SIDES ?? '{"on":true,"owner":"sync","ownerMult":3,"sync":{"hold":180}}';
const { createScript, mulberry32 } = await import('./sim.js');
const { playRun, RUN_STYLES } = await import('./netrun-bot.mjs');
const { NR2 } = await import('./netrun/nr2.js');
const { REGION_ORDER } = await import('../../../src/netrun/regions.js');

const n = Number(process.argv[2] ?? 1000);
const regions = (process.argv[3] ?? REGION_ORDER.join(',')).split(',');
const styles = (process.argv[4] ?? 'careful,skilled').split(',');
const ALL = ['breachCorp', 'breachStreet', 'dodgeCorp', 'dodgeStreet', 'tuneCorp', 'tuneStreet', 'feastCorp', 'feastStreet', 'hidden'];
const forms = (process.env.FORMS ?? ALL.join(',')).split(',');
const cases = process.env.CASES
  ? JSON.parse(process.env.CASES)
  : [{ label: 'no abilities', abilities: false }, { label: 'abilities', abilities: true }, { label: 'abilities + tiers', abilities: true, tiers: true }];

const base = JSON.parse(JSON.stringify(NR2));
const apply = (c) => {
  const fresh = JSON.parse(JSON.stringify(base));
  for (const [k, v] of Object.entries(c)) {
    if (k === 'label') continue;
    if (v && typeof v === 'object' && !Array.isArray(v) && typeof fresh[k] === 'object') Object.assign(fresh[k], v);
    else fresh[k] = v;
  }
  for (const k of Object.keys(NR2)) delete NR2[k];
  Object.assign(NR2, fresh);
};

function play(styleName, form, level, seed, region) {
  const rng = mulberry32(seed);
  const pet = createScript({ now: 0, rng });
  pet.stage = form === 'none' ? 'adult' : level === 2 ? 'mainframe' : 'adult';
  pet.form = form === 'none' ? 'breachCorp' : level === 2 ? `${form}Elder` : form;
  if (form === 'none') pet.form = 'none';
  Object.assign(pet.stats, { charge: 60 + rng() * 40, integrity: 60 + rng() * 40, heat: 20 + rng() * 30 });
  const start = { ...pet.stats };
  playRun(pet, { ...RUN_STYLES[styleName], lean: form.endsWith('Corp') ? 'corp' : form.endsWith('Street') ? 'indie' : 'mix' }, region, rng);
  const run = pet.run;
  return {
    result: run.result,
    exit: run.result === 'jacked' && run.map.nodes.find((x) => x.id === run.pos)?.type === 'exit',
    items: pet.inventory.length + (run.result === 'jacked' ? 0 : 0),
    scrip: pet.scrip,
    intSpent: start.integrity - pet.stats.integrity,
    hard: run.tally.iceHard ?? 0,
    ice: run.tally.iceWon + run.tally.iceLost + run.tally.icePhased,
    slipped: run.tally.icePhased,
    forced: run.tally.forced ?? 0,
    wear: pet.wear ?? 0,
  };
}

const sum = (rs) => {
  const share = (f) => Math.round((1000 * rs.filter(f).length) / rs.length) / 10;
  const avg = (k) => Math.round((100 * rs.reduce((a, x) => a + x[k], 0)) / rs.length) / 100;
  return { disc: share((r) => r.result === 'disconnected'), exit: share((r) => r.exit), items: avg('items'), scrip: avg('scrip'), hard: avg('hard'), ice: avg('ice'), slipped: avg('slipped'), forced: avg('forced') };
};

const report = [];
for (const c of cases) {
  apply(c);
  for (const region of regions) {
    for (const styleName of styles) {
      for (const form of forms) {
        for (const level of form === 'none' ? [1] : [1, 2]) {
          const rs = Array.from({ length: n }, (_, i) => play(styleName, form, level, 1000 + i, region));
          report.push({ case: c.label ?? JSON.stringify(c), region, style: styleName, form, level, ...sum(rs) });
        }
      }
    }
  }
}
if (process.env.JSON) console.log(JSON.stringify(report, null, 1));
else {
  let last = '';
  for (const r of report) {
    const head = `${r.case} | ${r.region} | ${r.style}`;
    if (head !== last) console.log(`\n== ${head} ==\nform            lvl  disc%  exit%  items  scrip  ice  hard  slip  forced`);
    last = head;
    console.log(`${r.form.padEnd(15)} ${r.level}   ${String(r.disc).padStart(5)}  ${String(r.exit).padStart(5)}  ${String(r.items).padStart(5)}  ${String(r.scrip).padStart(5)}  ${String(r.ice).padStart(4)}  ${String(r.hard).padStart(4)}  ${String(r.slipped).padStart(4)}  ${String(r.forced).padStart(5)}`);
  }
}
