// The Rogue lineage (docs/NETLING_2_ROGUE_DRAFTS.md 6.1 items 11 to 14, section 7; simulator stage 3): how often a Rogue line reaches the good end,
// and how long it takes. Usage: node prototype/netling2/sim/rogue-lineage.mjs <archetype> [lineages=200] [rogueLives=10]
//   A lineage starts at the first Rogue life, past the gate: Root held, the whole codex, all 18 egg pages, an elder in the Dex. Before it, one
//   lead-in life of each NL-0 egg in page-completion order (program, iron, wetware) stands for the player's earlier lines: their fragments are the
//   merge offer's first entries and the last is the first Rogue's parent. Lead-in lives are not counted.
//   Then lives follow rogue-line.js: a good end (armed by a clean Source exit, sim.js sourceExit) hatches the mixed egg, a netling of the chosen NL-0
//   egg whose parent is the Rogue that died (PICK=rogue: Rogue again instead, no mixed egg), every NL-0 life is followed by Rogue again, and a
//   Rogue life that did not reach the good end by Rogue again (LINEBOT=back: one NL-0 life after a capture). The lineage runs until it has had `rogueLives` Rogue lives, so a line can reach the good end more than once.
//   Each life runs under its egg's rules: SIDES.owner per egg (Rogue none, Program Charge, Wetware Sync, Iron Heat with wear). The elder feat
//   follows lineage-sweep.mjs's tiers: tier 2 (an elder in the Dex) until the account holds an elder of this egg (tier 3) or of this very line
//   (tier 4); Rogue starts at tier 2.
// Env (bot rules): MERGEBOT=accept|refuse (the offer at a clean Source exit; balance.mjs), PICK=first|last|rogue (the egg after a good end),
//   LINEBOT=stay|back, JSON=1. PARENT=fragment gives stage 3's first assumption back (the mixed egg's parent is the chosen egg's latest fragment),
//   ROGUE='{"armClean":false,"goodEndFullLife":false}' its arming and its good end at death, CROSS=open its crossings between Rogue and the
//   NL-0 eggs, and INHERIT='{"fullLife":false}' its inheritance (every death passes the trait line). A lever, not a bot rule: FEAT=1 holds every Rogue elder to the first tier (1.0's
//   feat: three Deep exits or two clean), whatever the account holds. The decided settings below are the defaults (the stage 2 measure's,
//   rogue-stage2.mjs BASE); any of them can be set in the environment.
process.env.TZ = 'UTC';
const FINAL_SIDES = {
  charge: { hi: 80, hold: 180, exit: 65, gate: 0, slow: 0, bleed: 8, overflow: 2, playGain: 0.45, drop: 0.75 },
  sync: { hi: 85, hold: 180, exit: 70, swing: 0, steadyDecay: 0, calm: 0, dull: 0.3, virus: 1.2, visit: 0.75, drop: 0.75, penStep: 0.1, penFree: 90, penCap: 0.9, burnN: 2, burnCool: 1440 },
};
const BASE = {
  NR2: 'all', PERKS: '1', STAGE: JSON.stringify({ on: true, rest: { on: true } }), STANDINGGAIN: '2',
  BUGS: JSON.stringify({ standingOnlyIfShort: true, clearStanding: 5 }), BRAKE: '{"on":true}', OVERUSE: '{"on":true}',
  SIDES: JSON.stringify({ on: true, owner: 'none', ownerMult: 3, teenStates: true, ...FINAL_SIDES }), ROGUE: '1',
};
for (const [k, v] of Object.entries(BASE)) process.env[k] ??= v;
const { ARCHETYPES, simulate } = await import('./balance.mjs');
const { CFG, SIDES, IRON, lineOf, ROGUE, INHERIT } = await import('./sim.js');
const { FRAGMENTS } = await import('./codex2.js');
const { OWNER, nextLife, crossFragment } = await import('./rogue-line.js');

const [name, n, rogueLives] = [process.argv[2], Number(process.argv[3] ?? 200), Number(process.argv[4] ?? 10)];
if (!ARCHETYPES[name]) throw new Error(`unknown archetype ${name}`);
const PICK = process.env.PICK ?? 'first';
const LINE = process.env.LINEBOT ?? 'stay';
const PARENT = process.env.PARENT ?? 'rogue';
const CROSS = process.env.CROSS ?? 'gated';
const ORDER = ['program', 'iron', 'wetware'];
const CODEX = FRAGMENTS.map((f) => f.id); // the whole codex (a Rogue player has the ending)
const LADDER = { 1: [3, 2], 2: [2, 99], 3: [2, 1], 4: [1, 99] }; // lineage-sweep.mjs: [Deep exits, or clean ones] the elder feat asks
const DAY = 24 * 60;

function life(egg, seed, fragment, generation, owned, mixed = false) {
  SIDES.owner = OWNER[egg];
  IRON.on = egg === 'iron';
  let tier = 2;
  CFG.featFor = (s) => {
    const mine = owned[egg] ?? new Set();
    tier = egg === 'rogue' && process.env.FEAT ? Number(process.env.FEAT) : mine.has(lineOf(s.form)) ? 4 : mine.size ? 3 : 2;
    return LADDER[tier];
  };
  const r = simulate({ ...ARCHETYPES[name] }, seed, { fragment, generation, codex: CODEX, rootAccess: true, egg });
  CFG.featFor = null;
  const elder = (r.stageDays?.mainframe ?? 0) > 0;
  if (elder) (owned[egg] ??= new Set()).add(lineOf(r.form));
  return { egg, mixed, inherited: Boolean(fragment?.trait), cause: r.cause, goodEnd: r.goodEnd, merge: r.merge, marks: r.marks, fragment: r.fragment, adult: r.adultForm !== null, elder, tier, days: r.ageMin / DAY, sourceRuns: r.regionRuns.source ?? 0 };
}

function lineage(i) {
  const owned = {};
  const latest = {};
  let fragment = null;
  let gen = 0;
  for (const egg of ORDER) { // the lead-in: the earlier lines
    const r = life(egg, (900000 + i) * 100 + gen, fragment, ++gen, owned);
    latest[egg] = r.fragment;
    fragment = r.fragment;
  }
  const lives = [];
  let goodEnds = 0; // the account's good ends so far (a Rogue player's first good end opens NL-0 to Rogue inheritance)
  let next = { egg: 'rogue', fragment: crossFragment(ORDER.at(-1), 'rogue', fragment, { goodEnds, cross: CROSS }) };
  let rogue = 0;
  while (rogue < rogueLives) {
    const r = life(next.egg, (i + 1) * 1000 + lives.length + 1, next.fragment, ++gen, owned, Boolean(next.mixed));
    lives.push(r);
    if (r.egg === 'rogue') rogue++;
    if (r.goodEnd) goodEnds++;
    else if (r.adult) latest[r.egg] = r.fragment; // the offer holds each egg's latest adult or elder fragment
    next = nextLife(r, { order: ORDER, latest, pick: PICK, line: LINE, parent: PARENT, goodEnds, cross: CROSS });
  }
  return lives;
}

const q = (a, p) => (a.length ? [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(p * a.length))] : null);
const round = (x, d = 3) => +x.toFixed(d);
const L = Array.from({ length: n }, (_, i) => lineage(i));
// The first good end: Rogue lives, all lives and real days from the first Rogue life (that life included). A line with none is censored.
const first = L.map((lives) => {
  const k = lives.findIndex((r) => r.goodEnd);
  if (k < 0) return null;
  const upTo = lives.slice(0, k + 1);
  return { rogue: upTo.filter((r) => r.egg === 'rogue').length, lives: k + 1, days: upTo.reduce((a, r) => a + r.days, 0), how: lives[k].goodEnd };
}).filter(Boolean);
const R = L.flat().filter((r) => r.egg === 'rogue');
const share = (xs, f) => (xs.length ? round(xs.filter(f).length / xs.length) : null);
const elders = R.filter((r) => r.elder);
const exited = R.filter((r) => (r.merge?.exits ?? 0) > 0);
const goods = R.filter((r) => r.goodEnd);
const out = {
  archetype: name, lineages: n, rogueLives, merge: process.env.MERGEBOT ?? 'accept', pick: PICK, line: LINE, parent: PARENT, armClean: ROGUE.armClean, goodEndFullLife: ROGUE.goodEndFullLife, cross: CROSS, fullLife: INHERIT.fullLife, feat: process.env.FEAT ? Number(process.env.FEAT) : null,
  // How often: lines with a good end within rogueLives Rogue lives, and good ends a line.
  reached: round(first.length / n),
  reachedBy: Object.fromEntries([1, 2, 3, 5, rogueLives].map((k) => [k, round(first.filter((f) => f.rogue <= k).length / n)])),
  goodEndsPerLine: round(goods.length / n, 2),
  // How long, among the lines that reached it (censored lines are left out, so read it with `reached`).
  firstGoodEnd: {
    rogueLives: { median: q(first.map((f) => f.rogue), 0.5), p90: q(first.map((f) => f.rogue), 0.9) },
    lives: { median: q(first.map((f) => f.lives), 0.5), p90: q(first.map((f) => f.lives), 0.9) },
    days: { median: round(q(first.map((f) => f.days), 0.5) ?? 0, 1), p90: round(q(first.map((f) => f.days), 0.9) ?? 0, 1) },
    atExit: share(first, (f) => f.how === 'exit'),
  },
  // Per Rogue life.
  perRogueLife: {
    lives: R.length,
    elder: share(R, (r) => r.elder),
    sourceRun: share(R, (r) => r.sourceRuns > 0),
    sourceExit: share(R, (r) => (r.merge?.exits ?? 0) > 0),
    cleanExit: share(R, (r) => (r.merge?.clean ?? 0) > 0),
    goodEnd: share(R, (r) => r.goodEnd),
    atExit: share(R, (r) => r.goodEnd === 'exit'),
    atDeath: share(R, (r) => r.goodEnd === 'death'),
    captured: share(R, (r) => r.cause === 'captured'),
    marks: round(R.reduce((a, r) => a + r.marks, 0) / R.length, 2),
    days: round(R.reduce((a, r) => a + r.days, 0) / R.length, 2),
    tier: Object.fromEntries([1, 2, 3, 4].map((t) => [t, share(elders, (r) => r.tier === t)])), // the feat tier the elders met
  },
  // Of the Rogue lives with a Source exit: disarmed by a later mark at least once, armed when it died, the good end.
  afterExit: {
    lives: exited.length,
    disarmedOnce: share(exited, (r) => r.merge.disarmed > 0),
    lostIt: share(exited, (r) => !r.goodEnd), // exited, yet no good end (disarmed at death, or captured)
    capturedAfter: share(exited, (r) => r.cause === 'captured'),
    declined: share(exited, (r) => r.merge.declined > 0),
    exitsPerLife: round(exited.reduce((a, r) => a + r.merge.exits, 0) / Math.max(1, exited.length), 2),
  },
  deaths: Object.fromEntries([...new Set(R.map((r) => r.cause))].sort().map((c) => [c, share(R, (r) => r.cause === c)])),
  nl0Lives: L.flat().length - R.length,
  mixedLives: L.flat().filter((r) => r.mixed).length, // NL-0 lives hatched from a good end (the mixed egg)
  rogueInherited: share(R, (r) => r.inherited), // Rogue lives that hatched with a trait line
};
if (process.env.JSON) console.log(JSON.stringify(out));
else {
  const f = out.firstGoodEnd, p = out.perRogueLife, a = out.afterExit;
  console.log(`${name} (${n} lines of ${rogueLives} Rogue lives; merge ${out.merge}, pick ${PICK}, line ${LINE})`);
  console.log(`  good end reached ${(out.reached * 100).toFixed(0)}% (by Rogue life 1: ${(out.reachedBy[1] * 100).toFixed(0)}%, 2: ${(out.reachedBy[2] * 100).toFixed(0)}%, 3: ${(out.reachedBy[3] * 100).toFixed(0)}%, 5: ${(out.reachedBy[5] * 100).toFixed(0)}%) · ${out.goodEndsPerLine} good ends a line`);
  console.log(`  first good end: Rogue life ${f.rogueLives.median} (p90 ${f.rogueLives.p90}), life ${f.lives.median} (p90 ${f.lives.p90}), day ${f.days.median} (p90 ${f.days.p90}); at the exit ${(f.atExit * 100).toFixed(0)}%`);
  console.log(`  per Rogue life: elder ${(p.elder * 100).toFixed(0)}%, Source run ${(p.sourceRun * 100).toFixed(0)}%, Source exit ${(p.sourceExit * 100).toFixed(0)}% (clean ${(p.cleanExit * 100).toFixed(0)}%), good end ${(p.goodEnd * 100).toFixed(0)}% (exit ${(p.atExit * 100).toFixed(0)}, death ${(p.atDeath * 100).toFixed(0)}), captured ${(p.captured * 100).toFixed(1)}%, marks ${p.marks}, ${p.days} days`);
  console.log(`  after a Source exit (${a.lives} lives): disarmed once ${(a.disarmedOnce * 100).toFixed(0)}%, no good end ${(a.lostIt * 100).toFixed(0)}% (captured ${(a.capturedAfter * 100).toFixed(0)}%), declined ${(a.declined * 100).toFixed(0)}%, ${a.exitsPerLife} exits a life · deaths ${JSON.stringify(out.deaths)} · NL-0 lives ${out.nl0Lives} (mixed ${out.mixedLives})`);
}
