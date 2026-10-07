// Tests for the 2.0 simulator fork (prototype/netling2/sim/): the core life rules of docs/NETLING_2_SKETCH.md. Deterministic: every
// test injects the clock and the rng. 1.0's own rules are tested by tests/*.test.js against src/sim.js, which this fork leaves alone.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createScript, tick, act, mulberry32, CFG, BUG_CFG, SPECIES, FORMS, MAINFRAME_OF, ROLES, LEANS, GAME_IDS, MIN,
  clearBug, pushGame, standingInt, gapIndex, teenCandidates, teenForm, adultCandidates, adultForm, hiddenTeenMet, hiddenAdultMet,
  temperDecayFactor, temperLevel, roleForm, leanSeen,
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

test('the fork has the 22 forms of one egg and an elder for every adult', () => {
  const by = (stage) => Object.values(SPECIES).filter((x) => x.stage === stage).length;
  assert.deepEqual([by('baby'), by('teen'), by('adult'), by('mainframe')], [1, 3, 9, 9]);
  assert.equal(Object.keys(FORMS).length, 9);
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

test('clearing a bug costs 15 scrip, or 2 Standing in any split, and neither goes below zero', () => {
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
