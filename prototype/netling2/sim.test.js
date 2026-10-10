// Tests for the 2.0 simulator fork (prototype/netling2/sim/): the core life rules of docs/NETLING_2_SKETCH.md. Deterministic: every
// test injects the clock and the rng. 1.0's own rules are tested by tests/*.test.js against src/sim.js, which this fork leaves alone.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createScript, tick, act, mulberry32, CFG, BUG_CFG, SPECIES, FORMS, MAINFRAME_OF, ROLES, LEANS, GAME_IDS, MIN,
  clearBug, pushGame, standingInt, gapIndex, teenCandidates, teenForm, adultCandidates, adultForm, hiddenTeenMet, hiddenAdultMet,
  temperDecayFactor, temperLevel, roleForm, leanSeen, clearBugAt,
} from './sim/sim.js';
import { guardedLevel } from './tell.js';

const T0 = Date.UTC(2026, 0, 5, 8, 0); // 08:00 UTC, awake (the tests run with TZ=UTC)
const NIGHT = Date.UTC(2026, 0, 5, 23, 30); // asleep (tests turn the lights off: asleep with them on is a fault after an hour)
const calm = () => 0.99; // no random event, drop or roll ever fires
const fresh = ({ now = T0, stage = 'adult', form = 'breachCorp' } = {}) => {
  const s = createScript({ now, rng: mulberry32(1) });
  s.stage = stage;
  s.form = form;
  s.quirk.sleepOffset = 0;
  s.lightsOn = now !== NIGHT;
  s.stats = { charge: 70, sync: 70, integrity: 100, heat: 20 };
  return s;
};
const advance = (s, minutes, rng = calm) => tick(s, s.lastTick + minutes * MIN, rng);

test('the fork has the 22 forms of one egg, 9 more for Rogue (it shares the baby), and an elder for every adult', () => {
  const by = (stage, rogue = false) => Object.entries(SPECIES).filter(([k, x]) => x.stage === stage && k.startsWith('rogue') === rogue).length;
  assert.deepEqual([by('baby'), by('teen'), by('adult'), by('mainframe')], [1, 3, 9, 9]);
  assert.deepEqual([by('baby', true), by('teen', true), by('adult', true), by('mainframe', true)], [0, 1, 4, 4]);
  assert.equal(Object.keys(FORMS).length, 13);
  for (const f of Object.keys(FORMS)) assert.equal(SPECIES[MAINFRAME_OF[f]].line, f);
  assert.equal(CFG.maxMistakes, Infinity);
});

test('Standing starts at zero on both tracks, and the netrun adapter turns a signed lean into the right track', () => {
  const s = createScript({ now: T0, rng: mulberry32(1) });
  assert.deepEqual(s.standing, { corp: 0, street: 0 });
  assert.equal(s.temper, 0);
  s.axes.allegiance += 1;
  s.axes.allegiance -= 0.5;
  s.axes.allegiance -= 1;
  assert.deepEqual(s.standing, { corp: 1, street: 1.5 }, 'a rise adds to corp, a fall to street; neither track goes down');
  s.axes.stability += 2;
  assert.equal(s.temper, 2);
});

test('Standing sources: packets 0.25, HIDE and COMPLY 1, a voucher 1 corp, Black ICE 1 street, ignored trace 1 corp', () => {
  const s = fresh();
  s.stats.charge = 10;
  act(s, 'corp', T0, calm);
  assert.deepEqual(s.standing, { corp: 0.25, street: 0 });
  s.stats.charge = 10;
  act(s, 'scav', T0, calm);
  assert.deepEqual(s.standing, { corp: 0.25, street: 0.25 });
  s.event = { type: 'trace', startedAge: s.ageMin };
  act(s, 'comply', T0, calm);
  assert.equal(s.standing.corp, 1.25);
  s.event = { type: 'trace', startedAge: s.ageMin };
  act(s, 'hide', T0, calm);
  assert.equal(s.standing.street, 1.25);
  s.inventory = ['voucher', 'blackice'];
  act(s, 'use', T0, calm, { slot: 0 });
  assert.equal(s.standing.corp, 2.25);
  const temper = s.temper;
  act(s, 'use', T0, calm, { slot: 0 });
  assert.equal(s.standing.street, 2.25);
  assert.equal(s.temper, temper - 1, 'a Black ICE shard costs 1 temper');
  // plain care and mini-games add nothing
  const before = { ...s.standing };
  act(s, 'play', T0, calm, { game: 'dodge', won: true });
  act(s, 'cool', T0, calm);
  assert.deepEqual(s.standing, before);
  // an ignored trace
  const t = fresh();
  t.event = { type: 'trace', startedAge: t.ageMin - CFG.traceWindowMin - 1 };
  advance(t, 1);
  assert.equal(t.standing.corp, 1);
});

test('temper decays with a 24 hour half-life and the shown level follows it through the guard', () => {
  assert.ok(Math.abs(temperDecayFactor() ** (24 * 60) - 0.5) < 1e-9);
  const s = fresh({ now: NIGHT });
  s.temper = 10;
  advance(s, 60);
  assert.ok(s.asleep, 'asleep, so no source moves temper');
  assert.ok(Math.abs(s.temper - 10 * 0.5 ** (60 / 1440)) < 1e-6, `temper ${s.temper}`);
  assert.equal(temperLevel(s), 2, 'strongly steady once past +7 (the +6 edge and a guard of 1)');
  const u = fresh({ now: NIGHT });
  u.temper = -5.5;
  advance(u, 5);
  assert.equal(temperLevel(u), -1, '-5.5 is not past -7, so only unsteady');
  assert.equal(guardedLevel(3.5, 0), 0, 'a level is entered 1 past its edge');
  assert.equal(guardedLevel(3.5, 1), 1, 'and left 1 inside it');
});

test('flow pays +0.5 temper an hour, overclocked costs 0.2, and heat 85 costs 1', () => {
  assert.equal(CFG.flowTemperPerHour, 0.5);
  assert.equal(CFG.overclockTemperPerHour, -0.2);
  const hot = fresh();
  hot.stats.heat = 70;
  hot.stats.sync = 100;
  advance(hot, 60);
  assert.ok(hot.temper < 0 && hot.temper > -0.3, `overclocked hour: ${hot.temper}`);
  const cooked = fresh();
  cooked.stats.heat = 90;
  advance(cooked, 60);
  assert.ok(cooked.temper < -0.9 && cooked.temper > -1.2, `heat 85+ hour: ${cooked.temper}`);
});

test('a fault costs 1 temper and may roll a bug; faults are uncapped and never end the life', () => {
  const miss = fresh();
  miss.stats.charge = 0;
  advance(miss, CFG.mistakeGraceMin + 1, calm);
  assert.equal(miss.careMistakes, 1);
  assert.ok(miss.temper <= -0.9);
  assert.equal(miss.bugs, 0, 'a roll of 0.99 is no bug');
  const bug = fresh();
  bug.stats.charge = 0;
  advance(bug, CFG.mistakeGraceMin + 1, () => 0.2); // 0.2 < 0.3 rolls a bug, and nothing else fires at this rate
  assert.equal(bug.careMistakes, 1);
  assert.equal(bug.bugs, 1);
  const many = fresh();
  many.careMistakes = 40;
  many.stats.charge = 0;
  advance(many, CFG.mistakeGraceMin + 1, calm);
  assert.equal(many.careMistakes, 41);
  assert.notEqual(many.stage, 'dead');
});

test('bugs raise the drains and Heat gain and stop at the ceiling of 5', () => {
  const a = fresh();
  const b = fresh();
  b.bugs = 5;
  advance(a, 1);
  advance(b, 1);
  const drop = (s) => 70 - s.stats.charge;
  assert.ok(Math.abs(drop(b) / drop(a) - (1 + BUG_CFG.charge * 5)) < 1e-6);
  const heat = (s) => s.stats.heat - 20;
  assert.ok(Math.abs(heat(b) / heat(a) - (1 + BUG_CFG.heat * 5)) < 1e-6);
  const full = fresh();
  full.bugs = BUG_CFG.max;
  full.stats.charge = 0;
  advance(full, CFG.mistakeGraceMin + 1, () => 0.01);
  assert.equal(full.bugs, BUG_CFG.max);
});

test('clearing a bug costs 15 scrip, or 2 Standing in any split, and neither goes below zero (where clearing is allowed)', (t) => {
  BUG_CFG.homeClear = true;
  t.after(() => { BUG_CFG.homeClear = false; });
  const s = fresh();
  s.bugs = 3;
  s.scrip = 14;
  assert.equal(clearBug(s), false);
  s.scrip = 30;
  assert.equal(clearBug(s), true);
  assert.deepEqual([s.scrip, s.bugs], [15, 2]);
  s.standing = { corp: 1.5, street: 1.2 };
  assert.equal(clearBug(s, { pay: 'standing', corp: 2 }), false, 'corp has only 1.5');
  assert.equal(clearBug(s, { pay: 'standing', corp: 1 }), true);
  assert.ok(Math.abs(s.standing.corp - 0.5) < 1e-9 && Math.abs(s.standing.street - 0.2) < 1e-9, 'one point left each track');
  assert.ok(s.standing.street >= 0 && s.standing.corp >= 0);
  assert.equal(s.bugs, 1);
});

test('Segfault: two faults, temper -4, and 25% none, 60% one, 15% two bugs', () => {
  const run = (u) => {
    const s = fresh();
    s.inventory = ['segfault'];
    act(s, 'use', T0, () => u, { slot: 0 });
    return s;
  };
  for (const [u, bugs] of [[0.1, 0], [0.5, 1], [0.95, 2]]) {
    const s = run(u);
    assert.equal(s.careMistakes, 2);
    assert.equal(s.temper, -4);
    assert.equal(s.bugs, bugs, `roll ${u}`);
  }
});

test('Coolant cell and Antivirus patch add 1 temper', () => {
  const s = fresh();
  s.inventory = ['coolant', 'antivirus'];
  act(s, 'use', T0, calm, { slot: 0 });
  act(s, 'use', T0, calm, { slot: 0 });
  assert.equal(s.temper, 2);
});

test('PATCH is +1 within 30 minutes and -1 later; PURGE is +0.5', () => {
  const fast = fresh();
  fast.virus = true;
  fast.virusMin = 10;
  act(fast, 'patch', T0, calm);
  assert.equal(fast.temper, 1);
  const slow = fresh();
  slow.virus = true;
  slow.virusMin = 31;
  act(slow, 'patch', T0, calm);
  assert.equal(slow.temper, -1);
  const p = fresh();
  p.cache = 2;
  act(p, 'purge', T0, calm);
  assert.equal(p.temper, 0.5);
});

test('teen lean: Standing is fractional, the cutpoints are whole numbers: a gap under 2 is a tie, then 4:3, 4:2, 4:1, and 5 or more is certain', () => {
  const w = (corp, street) => {
    const s = fresh({ stage: 'baby', form: 'baby' });
    s.standing = { corp, street };
    return teenCandidates(s);
  };
  assert.deepEqual(w(3, 3), { teenCorp: 4, teenStreet: 4 });
  assert.deepEqual(w(4.9, 3), { teenCorp: 4, teenStreet: 4 }, 'a true gap of 1.9 is still a tie');
  assert.deepEqual(w(5, 3), { teenCorp: 4, teenStreet: 3 });
  assert.deepEqual(w(6, 3), { teenCorp: 4, teenStreet: 2 });
  assert.deepEqual(w(7, 3), { teenCorp: 4, teenStreet: 1 });
  assert.deepEqual(w(7.99, 3), { teenCorp: 4, teenStreet: 1 }, 'a true gap of 4.99 is not yet certain');
  assert.deepEqual(w(8, 3), { teenCorp: 4, teenStreet: 0 });
  assert.deepEqual(w(2, 30), { teenCorp: 0, teenStreet: 4 });
  // The maintainer's example: shown 10 and 6 (a shown gap of 4), true 10.25 and 6.5 (a gap of 3.75): it weighs as a gap of 3.
  const ex = fresh({ stage: 'baby', form: 'baby' });
  ex.standing = { corp: 10.25, street: 6.5 };
  assert.deepEqual([standingInt(ex, 'corp'), standingInt(ex, 'street')], [10, 6]);
  assert.deepEqual(teenCandidates(ex), { teenCorp: 4, teenStreet: 2 });
  assert.equal(gapIndex(3.75), 3);
  assert.equal(gapIndex(99), CFG.tieWeights.length - 1);
  assert.equal(standingInt({ standing: { corp: 2.9999999999, street: 0 } }, 'corp'), 3, 'a float sum just under a whole point shows as it should');
});

test('a form never raised weighs 20% more, after the gap weights', () => {
  const s = fresh({ stage: 'baby', form: 'baby' });
  s.standing = { corp: 3, street: 3 };
  s.newForms = ['teenStreet'];
  assert.deepEqual(teenCandidates(s), { teenCorp: 4, teenStreet: 4 * CFG.newFormWeight });
});

test('the hidden teen needs 3 wins in every game and the tracks within a point', () => {
  const s = fresh({ stage: 'baby', form: 'baby' });
  for (const g of GAME_IDS) s.games[g].won = 3;
  s.standing = { corp: 5.9, street: 5 };
  assert.equal(hiddenTeenMet(s), true);
  s.standing = { corp: 6, street: 5 };
  assert.equal(hiddenTeenMet(s), true, 'a true gap of exactly 1 is within the cutpoint');
  s.standing = { corp: 6.1, street: 5 };
  assert.equal(hiddenTeenMet(s), false, 'a true gap of 1.1 is not, though both show as 6 and 5');
  s.standing = { corp: 5.9, street: 5 };
  assert.equal(teenForm(s, mulberry32(1)), 'teenHidden');
  s.standing = { corp: 7, street: 5 };
  assert.equal(hiddenTeenMet(s), false, 'a gap of 2 breaks it');
  s.standing = { corp: 5, street: 5 };
  s.games.tune.won = 2;
  assert.equal(hiddenTeenMet(s), false, 'so does one game short');
});

test('the hidden adult needs 4 wins in every game, 29 in all, and the tracks within a point', () => {
  const s = fresh({ stage: 'teen', form: 'teenCorp' });
  for (const g of GAME_IDS) s.games[g].won = 4;
  assert.equal(hiddenAdultMet(s), false, '16 is not 29');
  s.games.breach.won = 17;
  assert.equal(hiddenAdultMet(s), true);
  assert.equal(adultForm(s, mulberry32(2)), 'hidden');
  s.standing = { corp: 9, street: 5 };
  assert.equal(hiddenAdultMet(s), false);
});

test('the adult is role x lean: the most-won game and the leading track, rolled together', () => {
  const s = fresh({ stage: 'teen', form: 'teenCorp' });
  s.games.dodge.won = 10;
  s.standing = { corp: 10, street: 0 };
  assert.deepEqual(adultCandidates(s), { dodgeCorp: 16 });
  assert.equal(adultForm(s, mulberry32(3)), 'dodgeCorp');
  // a tie in role and in lean leaves every combination possible
  const t = fresh({ stage: 'teen', form: 'teenCorp' });
  assert.equal(Object.keys(adultCandidates(t)).length, ROLES.length * LEANS.length);
  // frequencies follow the weights: lean gap 2 is 4:3 (57%), role certain
  const u = fresh({ stage: 'teen', form: 'teenCorp' });
  u.games.feast.won = 20;
  u.standing = { corp: 5, street: 3 };
  const rng = mulberry32(7);
  let corp = 0;
  const n = 6000;
  for (let i = 0; i < n; i++) if (adultForm(u, rng) === 'feastCorp') corp++;
  assert.ok(Math.abs(corp / n - 4 / 7) < 0.03, `corp share ${corp / n}`);
});

test('stages evolve through the 2.0 rules: baby to teen to adult by Standing and wins', () => {
  const s = createScript({ now: T0, rng: mulberry32(5) });
  s.standing = { corp: 12, street: 1 };
  s.games.tune.won = 9;
  const rng = mulberry32(9);
  advance(s, CFG.bootMinutes + 1, rng);
  assert.equal(s.stage, 'baby');
  s.ageMin = s.life.teenAt - 1;
  advance(s, 2, rng);
  assert.equal(s.form, 'teenCorp');
  s.ageMin = s.life.adultAt - 1;
  advance(s, 2, rng);
  assert.equal(s.form, 'tuneCorp');
});

test('care preferences: routine for steady, novelty for unsteady, +2 mild and +4 strong, no penalty for a miss', () => {
  const feed = (level, last, packet) => {
    const s = fresh();
    s.tLevel = level;
    s.lastPacket = last;
    s.stats.charge = 10;
    s.stats.sync = 50;
    s.quirk.favPacket = null;
    act(s, packet, T0, calm);
    return s.stats.sync - 50;
  };
  assert.equal(feed(1, 'corp', 'corp'), CFG.prefMild);
  assert.equal(feed(2, 'corp', 'corp'), CFG.prefStrong);
  assert.equal(feed(1, 'scav', 'corp'), 0, 'a miss costs nothing');
  assert.equal(feed(-1, 'corp', 'scav'), CFG.prefMild);
  assert.equal(feed(-2, 'corp', 'scav'), CFG.prefStrong);
  assert.equal(feed(-1, 'corp', 'corp'), 0);
  assert.equal(feed(0, 'corp', 'corp'), 0, 'the middle likes nothing');
  assert.equal(feed(1, null, 'corp'), 0, 'no history, no match');
  const play = (level, last, game) => {
    const s = fresh();
    s.tLevel = level;
    s.lastGames = last;
    const before = s.stats.sync;
    act(s, 'play', T0, calm, { game, won: true });
    return s.stats.sync - before - CFG.playWinSync;
  };
  assert.equal(play(1, ['dodge', 'tune'], 'tune'), CFG.prefMild);
  assert.equal(play(1, ['dodge', 'tune'], 'breach'), 0);
  assert.equal(play(-2, ['dodge', 'tune'], 'breach'), CFG.prefStrong);
  assert.equal(play(-1, ['dodge', 'tune'], 'dodge'), 0);
});

test('the play history keeps the last two distinct games, and netrun ICE games enter it', () => {
  const s = fresh();
  for (const g of ['breach', 'dodge', 'dodge', 'tune']) pushGame(s, g);
  assert.deepEqual(s.lastGames, ['tune', 'dodge']);
  pushGame(s, 'dodge');
  assert.deepEqual(s.lastGames, ['dodge', 'tune']);
});

test('the Metronome hold counts awake minutes at a strong level and pauses at neglect level 2', () => {
  const steady = fresh();
  steady.temper = 9;
  advance(steady, 60);
  assert.ok(steady.hold.best[2] >= 55, `hold ${steady.hold.best[2]}`);
  assert.ok(steady.levelMin[2] >= 55);
  const starving = fresh();
  starving.temper = 9;
  starving.stats.charge = 5; // past the alert line: neglect level 2
  advance(starving, 10);
  assert.ok(starving.neglect2Min >= 9);
  assert.ok(starving.hold.best[2] <= 1, `paused: ${starving.hold.best[2]}`);
  const asleep = fresh({ now: NIGHT });
  asleep.temper = 9;
  advance(asleep, 60);
  assert.equal(asleep.hold?.best[2] ?? 0, 0, 'sleep does not count');
});

test('a netrun disconnect fault owes a bug roll that the next step settles', async () => {
  const { disconnect } = await import('./sim/netrun/run.js');
  const s = fresh();
  s.run = { daily: false, messages: [], region: 'public', loot: [], fragments: [], accessories: [], tally: {} };
  s.careMistakes = 3;
  disconnect(s, 'test.');
  assert.equal(s.careMistakes, 4);
  assert.equal(s.faultRolls, 1);
  advance(s, 1, () => 0.1);
  assert.equal(s.faultRolls, 0);
  assert.equal(s.bugs, 1);
});

test('a role steerer reaches its role and lean: the focus game leads by 5 or more and the adult is that role', async () => {
  const { ARCHETYPES, simulate } = await import('./sim/balance.mjs');
  for (const name of ['steer-tune-corp', 'steer-feast-street']) {
    const [, role, lean] = name.split('-');
    for (const seed of [1, 2]) {
      const r = simulate(ARCHETYPES[name], seed);
      assert.equal(r.adultForm, roleForm(role, lean), `${name} seed ${seed}: ${r.adultForm}`);
      assert.ok(r.atAdult.roleGap >= 5 && r.atAdult.gap >= 5);
    }
  }
});

test('a bot that sees the HUD sees floors; one that sees the truth sees the fractions', () => {
  const s = fresh();
  s.standing = { corp: 10.25, street: 6.5 };
  assert.equal(leanSeen(s), 3.75);
  assert.equal(leanSeen(s, true), 4);
  s.standing = { corp: 5.9, street: 5.1 };
  assert.ok(Math.abs(leanSeen(s) - 0.8) < 1e-9);
  assert.equal(leanSeen(s, true), 0, 'floors hide a true lead of 0.8');
});

test('a hidden-path hunter that plays its least-won game reaches the hidden teen and adult', async () => {
  const { ARCHETYPES, simulate } = await import('./sim/balance.mjs');
  let teens = 0;
  let adults = 0;
  const n = 12;
  for (let seed = 1; seed <= n; seed++) {
    const r = simulate(ARCHETYPES['hunter-shown'], seed);
    if (r.teenForm === 'teenHidden') teens++;
    if (r.adultForm === 'hidden') adults++;
    assert.ok(r.atAdult.gap <= 1 + 1e-9 || r.adultForm !== 'hidden');
  }
  assert.ok(adults >= 9, `hidden adults ${adults} of ${n}`);
  assert.ok(teens >= 6, `hidden teens ${teens} of ${n}`);
  // The plain rotation of ghosthunter mostly misses the teen's 3 wins in every game.
  let rot = 0;
  for (let seed = 1; seed <= n; seed++) if (simulate(ARCHETYPES.ghosthunter, seed).teenForm === 'teenHidden') rot++;
  assert.ok(rot < teens, `rotation ${rot} against targeted ${teens}`);
});

test('temper seekers reach their strong level and hold it for 12 hours; the first hold is recorded', async () => {
  const { ARCHETYPES, simulate } = await import('./sim/balance.mjs');
  const n = 8;
  let steady = 0;
  let unsteady = 0;
  for (let seed = 1; seed <= n; seed++) {
    const a = simulate(ARCHETYPES['seek-steady'], seed);
    if (a.hold['2'] >= 720) {
      steady++;
      assert.ok(a.holdFirst['2'] > 0 && a.holdFirst['2'] <= a.ageMin, 'the age of the first hold is kept');
    }
    if (simulate(ARCHETYPES['seek-unsteady-segfault'], seed).hold['-2'] >= 720) unsteady++;
  }
  assert.ok(steady >= 5, `steady holds ${steady} of ${n}`);
  assert.ok(unsteady >= 5, `unsteady holds ${unsteady} of ${n}`);
});

test('bug policies: when a bot clears and what it pays with', async (t) => {
  const { fixBugs } = await import('./sim/balance.mjs');
  BUG_CFG.homeClear = true;
  t.after(() => { BUG_CFG.homeClear = false; });
  const bot = (fix, { bugs = 3, scrip = 30, standing = { corp: 4, street: 1.5 } } = {}) => {
    const s = fresh();
    Object.assign(s, { bugs, scrip, standing: { ...standing } });
    const ctx = {};
    fixBugs(s, { fix }, ctx);
    return { s, ctx };
  };
  assert.equal(bot({ mode: 'none' }).s.bugs, 3, 'ignoring leaves them');
  assert.equal(bot({ mode: 'scrip', at: 4 }).s.bugs, 3, 'waits for 4 bugs');
  const once = bot({ mode: 'scrip', at: 1 });
  assert.deepEqual([once.s.bugs, once.s.scrip, once.ctx.scripSpent], [1, 0, 30], '30 scrip clears two of three');
  const even = bot({ mode: 'standing', split: 'even' });
  assert.equal(even.s.bugs, 1, 'even split: 1 each, then the street track is empty so 2 come from the leader');
  assert.equal(even.s.scrip, 30, 'Standing is paid even with scrip in hand');
  assert.ok(even.s.standing.corp >= 0 && even.s.standing.street >= 0);
  assert.equal(even.ctx.standingSpent, 4);
  const leader = bot({ mode: 'standing', split: 'leader' });
  assert.equal(leader.s.standing.street, 1.5, 'the leader pays');
  assert.equal(leader.s.standing.corp, 0);
  const trailer = bot({ mode: 'standing', split: 'trailer' });
  assert.equal(trailer.s.bugs, 3, 'the trailer has under 2, so it cannot pay and waits');
  const both = bot({ mode: 'both' }, { scrip: 15 });
  assert.deepEqual([both.s.scrip, both.ctx.scripSpent, both.ctx.standingSpent], [0, 15, 4], 'scrip first, then Standing for the other two');
  assert.equal(both.s.bugs, 0);
});

test('a human day is random but bounded: times in waking hours, 15 minutes apart, counts as asked', async () => {
  const { humanDay } = await import('./sim/balance.mjs');
  const rng = mulberry32(11);
  const counts = [];
  for (let d = 0; d < 400; d++) {
    const day = humanDay({ perDay: 8, busyDay: 0.25, offDay: 0.1 }, rng, d % 5);
    counts.push(day.length);
    for (let i = 0; i < day.length; i++) {
      assert.ok(day[i].c >= 7 * 60 && day[i].c <= 23.5 * 60, `time ${day[i].c}`);
      assert.equal(day[i].c, day[i].t, 'no jitter on a human day');
      if (i) assert.ok(day[i].c - day[i - 1].c >= 15);
    }
  }
  const share = (f) => counts.filter(f).length / counts.length;
  assert.ok(Math.abs(share((n) => n <= 1) - (0.1 + 0.25 * 0.5)) < 0.05, 'every off day and half the busy days have at most one check-in');
  assert.ok(Math.max(...counts) <= 11 && Math.max(...counts) >= 8);
  // dayCounts sets the count day by day (bursty play), within the 1.5 noise
  const bursty = { dayCounts: [14, 1, 10, 0, 12] };
  assert.ok(humanDay(bursty, mulberry32(2), 1).length <= 3);
  assert.ok(humanDay(bursty, mulberry32(2), 0).length >= 10);
  // the same seed gives the same day
  assert.deepEqual(humanDay({ perDay: 6 }, mulberry32(5), 0), humanDay({ perDay: 6 }, mulberry32(5), 0));
});

test('a keen human-like player lives longer than a casual one, and both are deterministic', async () => {
  const { ARCHETYPES, simulate } = await import('./sim/balance.mjs');
  const a = simulate(ARCHETYPES['human-keen'], 4);
  assert.deepEqual(simulate(ARCHETYPES['human-keen'], 4).ageMin, a.ageMin);
  let keen = 0;
  let casual = 0;
  for (let seed = 1; seed <= 6; seed++) {
    keen += simulate(ARCHETYPES['human-keen'], seed).ageMin;
    casual += simulate(ARCHETYPES['human-casual'], seed).ageMin;
  }
  assert.ok(keen > casual, `keen ${keen} against casual ${casual} minutes lived`);
});

test('a bug cannot be cleared away from a clinic by default', () => {
  const s = fresh();
  Object.assign(s, { bugs: 2, scrip: 50, standing: { corp: 5, street: 5 } });
  assert.equal(clearBug(s), false);
  assert.equal(clearBug(s, { pay: 'standing', corp: 1 }), false);
  assert.deepEqual([s.bugs, s.scrip], [2, 50]);
  assert.equal(clearBugAt(s), true);
  assert.deepEqual([s.bugs, s.scrip], [1, 35]);
  assert.equal(clearBugAt(s, { pay: 'standing', corp: 2 }), true);
  assert.deepEqual([s.bugs, s.standing.corp], [0, 3]);
  assert.equal(clearBugAt(s), false, 'no bugs left');
});

test('a quarter of market nodes become clinics, each rolled once', async () => {
  const { clinicKinds, RUN_CFG } = await import('./sim/netrun/run.js');
  const map = { nodes: Array.from({ length: 4000 }, (_, i) => ({ id: i, type: i % 5 === 0 ? 'ice' : 'market', flavor: i % 2 ? 'corp' : 'black' })) };
  clinicKinds(map, mulberry32(8));
  const markets = map.nodes.filter((n) => n.type === 'market');
  const share = markets.filter((n) => n.flavor === 'clinic').length / markets.length;
  assert.ok(Math.abs(share - RUN_CFG.clinicShare) < 0.03, `clinic share ${share}`);
  assert.ok(map.nodes.filter((n) => n.type === 'ice').every((n) => n.flavor !== 'clinic'));
  const before = map.nodes.map((n) => n.flavor);
  clinicKinds(map, () => 0); // everything already rolled: nothing changes
  assert.deepEqual(map.nodes.map((n) => n.flavor), before);
  map.nodes.push({ id: 9999, type: 'market', flavor: 'black' });
  clinicKinds(map, () => 0);
  assert.equal(map.nodes.at(-1).flavor, 'clinic', 'a node added later is rolled when it appears');
});

test('the healing items are sold only at clinics, and a clinic sells nothing else', async (t) => {
  const { marketStock, HEALING, RUN_CFG } = await import('./sim/netrun/run.js');
  const { REGIONS } = await import('../../src/netrun/regions.js');
  assert.deepEqual(HEALING, ['coolant', 'repair', 'antivirus']);
  for (const region of Object.values(REGIONS)) {
    for (const flavor of ['black', 'corp']) assert.ok(Object.keys(marketStock(flavor, region)).every((id) => !HEALING.includes(id)), `${flavor} in ${region.name ?? ''}`);
    assert.deepEqual(Object.keys(marketStock('clinic', region)).sort(), [...HEALING].sort());
  }
  assert.ok(Object.keys(marketStock('black', REGIONS.bazaar)).length >= 4, 'the bazaar keeps its other stock');
  RUN_CFG.healingOnlyAtClinic = false;
  t.after(() => { RUN_CFG.healingOnlyAtClinic = true; });
  assert.ok('coolant' in marketStock('corp', REGIONS.public), 'switched off: the 1.0 stock');
  RUN_CFG.healingOnlyAtClinic = true;
});

test('a clinic fixes bugs for scrip or Standing plus Charge, stays open for more, and has no lean', async () => {
  const { startRun, moveTo, choose, runOptions } = await import('./sim/netrun/run.js');
  const rng = mulberry32(21);
  const s = fresh();
  s.stats.charge = 90;
  Object.assign(s, { bugs: 2, scrip: 40, standing: { corp: 3, street: 0.5 } });
  startRun(s, 'bazaar', rng, []);
  const node = runOptions(s.run)[0];
  Object.assign(node, { type: 'market', flavor: 'clinic', clinicRolled: true });
  const standing0 = { ...s.standing };
  assert.equal(moveTo(s, node.id, rng).kind, 'market');
  const p = s.run.pending;
  assert.equal(p.flavor, 'clinic');
  assert.equal(p.title, 'CLINIC');
  assert.deepEqual(p.options.filter((o) => o.id.startsWith('fix')).map((o) => o.id), ['fixscrip', 'fix2corp', 'fix1each', 'fix2street']);
  const dis = Object.fromEntries(p.options.filter((o) => o.id.startsWith('fix')).map((o) => [o.id, o.disabled]));
  assert.deepEqual(dis, { fixscrip: false, fix2corp: false, fix1each: true, fix2street: true }, '0.5 street cannot pay 1 or 2');
  const charge = s.stats.charge;
  assert.equal(choose(s, 'fixscrip', rng).ok, true);
  assert.deepEqual([s.bugs, s.scrip, s.run.phase], [1, 25, 'choice'], 'one bug fixed and the clinic is still open');
  assert.ok(Math.abs(charge - s.stats.charge - 12) < 1e-9, 'a fix costs the clinic charge fee');
  assert.equal(choose(s, 'fix2street', rng).ok, false, 'cannot pay what it does not have');
  assert.equal(choose(s, 'fix2corp', rng).ok, true);
  assert.deepEqual([s.bugs, s.standing.corp], [0, 1]);
  assert.ok(!s.run.pending.options.some((o) => o.id.startsWith('fix')), 'no bugs left, no fix offered');
  assert.equal(s.run.tally.fixed, 2);
  assert.deepEqual([s.run.tally.fixScrip, s.run.tally.fixStanding], [1, 1]);
  // an item ends the visit; neither a fix nor a purchase leans Standing beyond what the fix spent
  const buy = s.run.pending.options.find((o) => o.id.startsWith('buy'));
  s.scrip = 40;
  assert.equal(choose(s, buy.id, rng).ok, true);
  assert.equal(s.run.phase, 'map');
  assert.equal(s.standing.street, standing0.street);
  assert.equal(s.standing.corp, standing0.corp - 2);
});

test('a bot fixes bugs at a clinic with scrip first, then Standing by its split, and seeks one when bugged', async () => {
  const { pickFix } = await import('./sim/netrun-bot.mjs');
  const pet = { standing: { corp: 4, street: 1 } };
  const all = () => true;
  const only = (...ids) => (id) => ids.includes(id);
  assert.equal(pickFix(pet, undefined, all), 'fixscrip');
  assert.equal(pickFix(pet, { mode: 'both' }, only('fix1each', 'fix2corp')), 'fix1each');
  assert.equal(pickFix(pet, { mode: 'both', split: 'leader' }, only('fix2corp', 'fix2street', 'fix1each')), 'fix2corp');
  assert.equal(pickFix(pet, { mode: 'both', split: 'trailer' }, only('fix2corp', 'fix2street', 'fix1each')), 'fix2street');
  assert.equal(pickFix(pet, { mode: 'scrip' }, only('fix1each')), null, 'a scrip-only bot waits for scrip');
  assert.equal(pickFix(pet, { mode: 'standing' }, only('fixscrip')), null);
  // end to end: casual players with bugs pass clinics and fix some
  const { ARCHETYPES, simulate } = await import('./sim/balance.mjs');
  let visits = 0;
  let fixed = 0;
  for (let seed = 1; seed <= 12; seed++) {
    const r = simulate(ARCHETYPES.casual, seed);
    visits += r.clinicVisits;
    fixed += r.bugsFixed;
  }
  assert.ok(visits >= 10, `clinic visits ${visits}`);
  assert.ok(fixed >= 3, `bugs fixed ${fixed}`);
});

test('a bugged netling is offered a clinic job, an unbugged one is not', async () => {
  const { updateContract, contractText, contractProgress, contractShort, RUN_CFG } = await import('./sim/netrun/run.js');
  const bugged = (bugs) => {
    const s = fresh();
    s.ageMin = 1000;
    s.contractCheckAge = 940;
    s.bugs = bugs;
    return s;
  };
  const a = bugged(1);
  assert.equal(updateContract(a, () => 0, [], T0), 'posted');
  assert.equal(a.contract.kind, 'clinic');
  assert.equal(a.contract.scrip, RUN_CFG.contractScrip.clinic);
  assert.match(contractText(a.contract), /get a bug fixed at a .* clinic/);
  const b = bugged(0);
  assert.equal(updateContract(b, () => 0, [], T0), 'posted');
  assert.notEqual(b.contract.kind, 'clinic', 'no bugs, no clinic job');
  // the chance of any job doubles while bugged (a roll that misses at the usual rate lands)
  const miss = () => (RUN_CFG.contractChancePerHour * 1.5) / 60;
  const c = bugged(2);
  c.contractCheckAge = 999;
  assert.equal(updateContract(c, miss, [], T0), 'posted');
  const d = bugged(0);
  d.contractCheckAge = 999;
  assert.equal(updateContract(d, miss, [], T0), null);
  // progress counts bugs fixed at a clinic
  const run = { contract: { kind: 'clinic' }, tally: { fixed: 0 }, map: { nodes: [{ id: 0, type: 'entry' }] }, pos: 0 };
  assert.deepEqual(contractProgress(run), { have: 0, need: 1 });
  run.tally.fixed = 1;
  assert.deepEqual(contractProgress(run), { have: 1, need: 1 });
  assert.equal(contractShort(run), 'JOB FIX A BUG 1/1');
});

test('a clinic job puts a clinic on every route through the map', async () => {
  const { startRun } = await import('./sim/netrun/run.js');
  for (const seed of [1, 2, 3, 4, 5]) {
    const s = fresh();
    s.contract = { kind: 'clinic', region: 'public', scrip: 15, item: null, postedAge: s.ageMin };
    startRun(s, 'public', mulberry32(seed), []);
    const { nodes } = s.run.map;
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const exit = nodes.find((n) => n.type === 'exit');
    // every path from the entry to the exit passes a clinic
    const bad = (id, seen) => {
      const n = byId.get(id);
      const here = seen || (n.type === 'market' && n.flavor === 'clinic');
      return n.id === exit.id ? !here : n.edges.some((e) => bad(e, here));
    };
    assert.equal(bad(nodes[0].id, false), false, `seed ${seed}`);
  }
});

test('the netling says so when a bug settles in, and now and then while it has one', () => {
  const s = fresh();
  s.faultRolls = 1;
  advance(s, 1, () => 0.1); // 0.1 rolls a bug (and is under no other chance)
  assert.equal(s.bugs, 1);
  assert.ok(s.log.some((l) => l.msg.includes('a glitch has settled in')), 'first bug');
  s.bugs = 3;
  s.faultRolls = 1;
  advance(s, 1, () => 0.1);
  assert.ok(s.log.some((l) => l.msg.includes('badly glitched')), 'many bugs');
  const n = fresh();
  n.bugs = 1;
  advance(n, 1, () => 0); // 0 is under the reminder chance
  assert.ok(n.log.some((l) => l.msg.includes('still glitching')), 'a reminder while it has bugs');
  const q = fresh();
  advance(q, 1, () => 0);
  assert.ok(!q.log.some((l) => l.msg.includes('still glitching')), 'no reminder without bugs');
});

test('a bugged player who can be nudged runs more, and reaches clinics', async () => {
  const { ARCHETYPES, simulate } = await import('./sim/balance.mjs');
  let calm = 0;
  let pushed = 0;
  let visits = 0;
  for (let seed = 1; seed <= 10; seed++) {
    calm += simulate(ARCHETYPES.worker, seed).runs;
    const r = simulate({ ...ARCHETYPES.worker, pushRuns: 1, contracts: true }, seed);
    pushed += r.runs;
    visits += r.clinicVisits;
  }
  assert.ok(pushed > calm, `pushed ${pushed} runs against ${calm}`);
  assert.ok(visits >= 5, `clinic visits ${visits}`);
});

test('each bug also costs Integrity an hour, whatever else is going on (the chosen lethality)', () => {
  assert.equal(BUG_CFG.integrityFlat, 0.5);
  assert.equal(BUG_CFG.charge, 0.16);
  const calmHour = (bugs) => {
    const s = fresh({ now: NIGHT });
    s.stats.integrity = 50;
    s.bugs = bugs;
    advance(s, 60);
    return s.stats.integrity;
  };
  const gap = calmHour(0) - calmHour(2);
  assert.ok(Math.abs(gap - 1) < 0.05, `two bugs cost ${gap} Integrity an hour`);
  // damage is multiplied too: a virus hurts more with bugs
  const virus = (bugs) => {
    const s = fresh();
    s.virus = true;
    s.virusMin = 1;
    s.bugs = bugs;
    advance(s, 60);
    return 100 - s.stats.integrity;
  };
  assert.ok(virus(5) > virus(0) * 1.3, 'five bugs add 40% damage and 2.5 an hour');
});

// --- Program's rattle timer (egg pressure, off by default) --------------------------------------

test('rattle: off by default, and then events keep their 1.0 windows', async () => {
  const { RATTLE } = await import('./sim/sim.js');
  assert.equal(RATTLE.on, false);
  const s = fresh();
  s.event = { type: 'trace', startedAge: s.ageMin - 100 };
  const before = act(s, 'comply', T0, calm);
  assert.ok(before.ok);
  assert.equal(s.rattleUntil, undefined);
});

test('rattle: a late answer sets the timer, an early one does not, and the next event opens shorter', async () => {
  const sim = await import('./sim/sim.js');
  sim.RATTLE.on = true;
  sim.RATTLE.mode = 'late';
  try {
    const late = fresh();
    late.event = { type: 'trace', startedAge: late.ageMin - Math.ceil(CFG.traceWindowMin * 0.7) };
    act(late, 'comply', T0, calm);
    assert.equal(late.rattleCount, 1);
    assert.equal(late.rattleUntil, late.ageMin + sim.RATTLE.minutes);
    assert.equal(sim.rattled(late), true);

    const early = fresh();
    early.event = { type: 'trace', startedAge: early.ageMin - Math.floor(CFG.traceWindowMin * 0.5) };
    act(early, 'comply', T0, calm);
    assert.equal(early.rattleCount, undefined);
    assert.equal(sim.rattled(early), false);

    // A new trace while rattled opens 25% shorter; a certain roll starts it.
    const rng = () => 0;
    late.event = null;
    late.stats = { charge: 70, sync: 70, integrity: 100, heat: 20 };
    advance(late, 1, rng);
    assert.equal(late.event?.type, 'trace');
    assert.equal(late.event.window, Math.round(CFG.traceWindowMin * 0.75));
    assert.equal(late.rattledEvents, 1);

    // The timer runs out: the same trace opens at the full window.
    const calmDown = fresh();
    calmDown.rattleUntil = calmDown.ageMin + 5;
    advance(calmDown, 10, calm);
    calmDown.event = null;
    advance(calmDown, 1, rng);
    assert.equal(calmDown.event?.type, 'trace');
    assert.equal(calmDown.event.window, CFG.traceWindowMin);
  } finally {
    sim.RATTLE.on = false;
    sim.RATTLE.mode = 'pileup';
  }
});

test('rattle: the shortened window is what times the event out', async () => {
  const sim = await import('./sim/sim.js');
  sim.RATTLE.on = true;
  try {
    const s = fresh();
    s.event = { type: 'trace', startedAge: s.ageMin, window: 90 };
    assert.equal(sim.eventMinutesLeft(s), 90);
    advance(s, 91, calm);
    assert.equal(s.event, null);
    assert.ok(s.standing.corp >= CFG.traceIgnoredStanding);
  } finally {
    sim.RATTLE.on = false;
  }
});

test('rattle: infections are counted in every route, with or without the timer', async () => {
  const s = fresh();
  s.event = { type: 'attack', startedAge: s.ageMin - 1 };
  act(s, 'defend', T0, calm, { won: false });
  assert.equal(s.virusCount, 1);
});

test('rattle (pileup): an event opening soon after another ended opens shorter, answered or not; later it does not', async () => {
  const sim = await import('./sim/sim.js');
  sim.RATTLE.on = true;
  try {
    const rng = () => 0; // a certain trace
    // Previous event answered 30 minutes ago.
    const a = fresh();
    a.event = { type: 'trace', startedAge: a.ageMin };
    act(a, 'comply', T0, calm);
    assert.equal(a.lastEventEnd, a.ageMin);
    advance(a, 30, calm);
    advance(a, 1, rng);
    assert.equal(a.event?.type, 'trace');
    assert.equal(a.event.window, Math.round(CFG.traceWindowMin * 0.75));
    assert.equal(a.rattledEvents, 1);

    // Previous event timed out 30 minutes ago: counts unless answeredOnly.
    const b = fresh();
    b.event = { type: 'trace', startedAge: b.ageMin - CFG.traceWindowMin - 1 };
    advance(b, 1, calm);
    assert.equal(b.event, null);
    assert.equal(b.lastEventAnswered, false);
    advance(b, 30, calm);
    advance(b, 1, rng);
    assert.equal(b.event.window, Math.round(CFG.traceWindowMin * 0.75));
    sim.RATTLE.answeredOnly = true;
    const c = fresh();
    c.event = { type: 'trace', startedAge: c.ageMin - CFG.traceWindowMin - 1 };
    advance(c, 1, calm);
    advance(c, 30, calm);
    advance(c, 1, rng);
    assert.equal(c.event.window, CFG.traceWindowMin);
    sim.RATTLE.answeredOnly = false;

    // Previous event ended 90 minutes ago: back to the full window.
    const d = fresh();
    d.event = { type: 'trace', startedAge: d.ageMin };
    act(d, 'comply', T0, calm);
    advance(d, 90, calm);
    advance(d, 1, rng);
    assert.equal(d.event.window, CFG.traceWindowMin);

    // The very first event of a life is never rattled.
    const e = fresh();
    advance(e, 1, rng);
    assert.equal(e.event.window, CFG.traceWindowMin);
  } finally {
    sim.RATTLE.on = false;
    sim.RATTLE.answeredOnly = false;
  }
});

test('rattle (cost): answering an event that opened rattled costs extra Heat and Charge; an unrattled answer does not', async () => {
  const sim = await import('./sim/sim.js');
  Object.assign(sim.RATTLE, { on: true, cut: 0, heat: 5, charge: 3 });
  try {
    const rng = () => 0;
    const s = fresh();
    s.event = { type: 'trace', startedAge: s.ageMin };
    act(s, 'comply', T0, calm); // ends an event; the next one soon after is rattled
    advance(s, 20, calm);
    advance(s, 1, rng);
    assert.equal(s.event?.type, 'trace');
    assert.equal(s.event.rattled, true);
    assert.equal(s.event.window, CFG.traceWindowMin, 'cut 0 leaves the window alone');
    const heat = s.stats.heat;
    const charge = s.stats.charge;
    act(s, 'hide', T0 + 30 * MIN, calm); // hide itself costs 10 Charge and 10 Heat
    assert.equal(s.stats.heat, heat + 5 + 10);
    assert.equal(s.stats.charge, charge - 3 - 10);
    assert.equal(s.rattlePaid, 1);

    const c = fresh();
    c.event = { type: 'trace', startedAge: c.ageMin };
    act(c, 'hide', T0, calm);
    assert.equal(c.rattlePaid, undefined);
  } finally {
    Object.assign(sim.RATTLE, { on: false, cut: 0.25, heat: 0, charge: 0 });
  }
});

// --- Iron's wear (egg pressure, off by default) --------------------------------------------------

test('wear: off by default; on, it builds only above the Heat threshold, decays faster at rest, and sets the base infection hazard', async () => {
  const sim = await import('./sim/sim.js');
  assert.equal(sim.IRON.on, false);
  const idle = fresh();
  advance(idle, 30, calm);
  assert.equal(idle.wear, undefined, 'nothing is tracked while off');

  Object.assign(sim.IRON, { on: true, heat: 80, rate: 0.12, decay: 1 / 180, restMult: 3, floor: 0.01, slope: 0.3 });
  try {
    const cool = fresh();
    cool.stats.heat = 60;
    advance(cool, 60, calm);
    assert.equal(cool.wear, 0, 'Heat under the threshold builds nothing');

    const hot = fresh();
    for (let i = 0; i < 20; i++) {
      hot.stats.heat = 90;
      advance(hot, 1, calm);
    }
    assert.ok(hot.wear > 15 && hot.wear < 30, `20 minutes at Heat 90 builds some wear (${hot.wear})`);
    assert.equal(hot.wearMax, hot.wear);

    const spike = fresh();
    spike.stats.heat = 90;
    advance(spike, 1, calm);
    for (let i = 0; i < 60; i++) {
      spike.stats.heat = 60;
      advance(spike, 1, calm);
    }
    assert.ok(spike.wearMax < 2, 'a one-minute spike adds almost nothing against the warning line');
    assert.ok(spike.wear < spike.wearMax, 'and it only shrinks afterwards');

    const awake = fresh();
    awake.wear = 50;
    const resting = fresh();
    resting.wear = 50;
    resting.nap = { startedAge: resting.ageMin };
    awake.stats.heat = resting.stats.heat = 20;
    advance(awake, 30, calm);
    advance(resting, 30, calm);
    assert.ok(resting.wear < awake.wear, 'rest sheds wear faster');

    // The base hazard follows wear: at wear 100 with no cache the hourly hazard is floor + slope = 0.31.
    const worn = fresh();
    worn.wear = 100;
    worn.stats.heat = 20;
    worn.cache = 0;
    advance(worn, 1, () => 0.005); // 0.005 < 0.31/60 = 0.0052
    assert.equal(worn.virus, true);
    const fresh0 = fresh();
    fresh0.stats.heat = 20;
    fresh0.cache = 0;
    advance(fresh0, 1, () => 0.005); // 0.005 < 0.01/60 = 0.00017 is false
    assert.equal(fresh0.virus, false);
  } finally {
    Object.assign(sim.IRON, { on: false, heat: 80, floor: 0.014, slope: 0.3 });
  }
});

// --- Wetware's shock (egg pressure, off by default) ----------------------------------------------

test('shock: off by default; on, only a switch of packet type adds it, it fades by its half-life, and it sets the base infection hazard', async () => {
  const sim = await import('./sim/sim.js');
  assert.equal(sim.WET.on, false);
  const plain = fresh();
  act(plain, 'corp', T0, calm);
  plain.stats.charge = 30;
  act(plain, 'scav', T0 + MIN, calm);
  assert.equal(plain.shock, undefined, 'nothing is tracked while off');

  Object.assign(sim.WET, { on: true, shock: 10, halfLifeMin: 1440, floor: 0.01, slope: 0.3 });
  try {
    const s = fresh();
    s.stats.charge = 30;
    act(s, 'corp', T0, calm); // the first feed has no last feed to differ from
    assert.equal(s.shock, undefined);
    s.stats.charge = 30;
    act(s, 'corp', T0, calm); // same type again
    assert.equal(s.shock, undefined);
    s.stats.charge = 30;
    act(s, 'scav', T0, calm); // a switch
    assert.equal(s.shock, 10);
    assert.equal(s.switches, 1);
    s.stats.charge = 30;
    act(s, 'scav', T0, calm); // a block of one type costs nothing more
    assert.equal(s.shock, 10);
    s.stats.charge = 30;
    act(s, 'corp', T0, calm);
    assert.equal(s.shock, 20);

    advance(s, 1440, calm);
    assert.ok(Math.abs(s.shock - 10) < 0.5, `halves in a day (${s.shock})`);

    // Flip-flopping caps at 100.
    const f = fresh();
    for (let i = 0; i < 30; i++) {
      f.stats.charge = 30;
      act(f, i % 2 ? 'corp' : 'scav', T0, calm);
    }
    assert.equal(f.shock, 100);
    assert.equal(f.shockMax, 100);

    // The base hazard follows shock: at 100 with no cache it is floor + slope = 0.31 an hour.
    const worn = fresh();
    worn.shock = 100;
    worn.stats.heat = 20;
    worn.cache = 0;
    advance(worn, 1, () => 0.005);
    assert.equal(worn.virus, true);
    const calmOne = fresh();
    calmOne.stats.heat = 20;
    calmOne.cache = 0;
    advance(calmOne, 1, () => 0.005);
    assert.equal(calmOne.virus, false);
  } finally {
    Object.assign(sim.WET, { on: false, shock: 3, floor: 0.0075, slope: 0.03 });
  }
});
