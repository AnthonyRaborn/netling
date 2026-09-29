import './helpers/utc.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createScript, tick, teenForm, leaningForm, leaningCandidates, migrate, mulberry32, CFG, GAME_IDS, ITEM_CFG, LEGACY_LIFE, MIN } from '../src/sim.js';
import { cleanSave } from '../src/sanitize.js';

// Balance pass 1: per-netling life lengths, the Shell, tie-breaks, Segfault.
const T0 = Date.UTC(2026, 8, 26, 12, 0);
const noRng = () => 0.999;
const always = () => 0;

function booted(opts = {}) {
  const s = createScript({ now: T0, rng: mulberry32(1), ...opts });
  s.quirk.sleepOffset = 0;
  tick(s, T0 + CFG.bootMinutes * MIN, noRng);
  return s;
}
// Jumps to one minute before `age`, then ticks past it.
function reach(s, age) {
  s.ageMin = age - 1;
  tick(s, s.lastTick + 2 * MIN, noRng);
}
const wins = (s, n) => GAME_IDS.forEach((id) => (s.games[id] = { played: n, won: n }));

// --- life lengths ---

test('a new netling lives five days: teen at 17 hours, adult at 51', () => {
  const s = booted();
  assert.deepEqual(s.life, { teenAt: 17 * 60, adultAt: 51 * 60, lifespan: 5 * 24 * 60 });
  reach(s, 17 * 60);
  assert.equal(s.stage, 'teen');
  reach(s, 51 * 60);
  assert.equal(s.stage, 'adult');
  reach(s, 5 * 24 * 60);
  assert.equal(s.stage, 'dead');
  assert.equal(s.deathCause, 'end of life cycle');
});

test('a netling from before the change keeps its seven days', () => {
  const s = booted();
  delete s.life;
  migrate(s);
  assert.deepEqual(s.life, LEGACY_LIFE);
  reach(s, 17 * 60);
  assert.equal(s.stage, 'baby', 'no early jump to teen');
  reach(s, 24 * 60);
  assert.equal(s.stage, 'teen');
  reach(s, 5 * 24 * 60);
  assert.notEqual(s.stage, 'dead', 'not cut off at five days');
  reach(s, 7 * 24 * 60);
  assert.equal(s.stage, 'dead');
});

test('stored life lengths are cleaned: missing, disordered or longer than seven days means seven days', () => {
  const base = JSON.parse(JSON.stringify(booted()));
  const clean = (life) => cleanSave({ ...base, life }, T0 + 60 * MIN).life;
  assert.deepEqual(clean(undefined), LEGACY_LIFE);
  assert.deepEqual(clean({ teenAt: 1020, adultAt: 3060, lifespan: 7200 }), { teenAt: 1020, adultAt: 3060, lifespan: 7200 });
  assert.deepEqual(clean({ teenAt: 3060, adultAt: 1020, lifespan: 7200 }), LEGACY_LIFE);
  assert.deepEqual(clean({ teenAt: 1020, adultAt: 3060, lifespan: 1e9 }), LEGACY_LIFE, 'no immortal netlings');
  assert.deepEqual(clean({ teenAt: '1020', adultAt: 3060, lifespan: 7200 }), LEGACY_LIFE);
  assert.deepEqual(cleanSave({ ...base, newForms: ['ghost', 'kernel', 'nope', 'ghost', 5] }, T0 + 60 * MIN).newForms, ['ghost']);
});

// --- ghost's scaled requirement ---

test('ghost needs 29 wins with at least 4 in each game', () => {
  assert.equal(CFG.ghostMinGameWins, 29);
  assert.equal(CFG.ghostMinWinsEach, 4);
  const s = booted();
  s.axes = { allegiance: 0, stability: 0 };
  wins(s, 7); // 28 in total
  assert.notEqual(leaningForm(s), 'ghost');
  s.games.breach.won = 8; // 29
  assert.equal(leaningForm(s), 'ghost');
  s.games.feast.won = 3;
  s.games.breach.won = 12; // still 29, but one game under 4
  assert.notEqual(leaningForm(s), 'ghost');
});

// --- the Shell ---

test('the Shell: a teen on Ghost path with every game won three times', () => {
  assert.equal(CFG.shellMinWinsEach, 3);
  const s = booted();
  s.axes = { allegiance: 1, stability: 2 };
  wins(s, 3);
  assert.equal(teenForm(s), 'shell');
  s.games.tune.won = 2;
  assert.equal(teenForm(s), 'kernel', 'every game must be won three times');
  wins(s, 3);
  s.axes.allegiance = -2.5;
  assert.equal(teenForm(s), 'kernel', 'allegiance outside the band');
  s.axes = { allegiance: 0, stability: -0.1 };
  assert.equal(teenForm(s), 'kernel', 'any chaos rules it out');
  s.axes.stability = 0;
  s.careMistakes = 2;
  assert.equal(teenForm(s), 'kernel', 'two faults is still a Kernel');
  s.careMistakes = 3;
  assert.equal(teenForm(s), 'stub', 'a rough start is a Stub, whatever else');
});

test('the Shell is what the netling becomes at the teen stage', () => {
  const s = booted();
  s.axes = { allegiance: 0, stability: 1 };
  wins(s, 3);
  reach(s, s.life.teenAt);
  assert.equal(s.form, 'shell');
  assert.equal(s.teenForm, 'shell');
});

// --- ties ---

test('clear leans are not ties', () => {
  const s = booted();
  s.axes = { allegiance: 3, stability: 1 };
  assert.deepEqual(leaningCandidates(s), { chrome: 1 });
  s.axes = { allegiance: -1, stability: -3 };
  assert.deepEqual(leaningCandidates(s), { glitch: 1 });
});

test('axes within 0.5 of each other, or of zero, tie', () => {
  const s = booted();
  s.axes = { allegiance: 3, stability: 3.4 };
  assert.deepEqual(Object.keys(leaningCandidates(s)).sort(), ['chrome', 'daemon']);
  s.axes = { allegiance: 0.3, stability: 2 };
  assert.deepEqual(Object.keys(leaningCandidates(s)).sort(), ['daemon'], 'a small allegiance next to a strong stability is no tie');
  s.axes = { allegiance: 3, stability: 0.2 };
  assert.deepEqual(Object.keys(leaningCandidates(s)).sort(), ['chrome']);
  s.axes = { allegiance: 0.1, stability: -0.2 };
  assert.deepEqual(Object.keys(leaningCandidates(s)).sort(), ['chrome', 'daemon', 'firewall', 'glitch'], 'a neutral netling can become any of the four');
});

test('forms the player has never raised weigh 1.2 in a tie', () => {
  const s = booted({ newForms: ['firewall', 'ghost', 'kernel'] });
  assert.deepEqual(s.newForms, ['firewall', 'ghost'], 'only adult forms are kept');
  s.axes = { allegiance: 0.2, stability: 0.1 };
  const pool = leaningCandidates(s);
  assert.equal(pool.firewall, CFG.newFormWeight);
  assert.equal(pool.chrome, 1);
});

test('a tie is broken at random, and without rng by weight then order', () => {
  const s = booted({ newForms: ['glitch'] });
  s.axes = { allegiance: 0, stability: 0 };
  s.careMistakes = 2; // not a Ghost
  const seen = new Set();
  const rng = mulberry32(9);
  for (let i = 0; i < 200; i++) seen.add(leaningForm(s, rng));
  assert.deepEqual([...seen].sort(), ['chrome', 'daemon', 'firewall', 'glitch']);
  assert.equal(leaningForm(s), 'glitch', 'repairs (no rng) take the heaviest');
  s.newForms = [];
  assert.equal(leaningForm(s), 'chrome', 'then the first, as before');
});

test('the boost shows up in the odds', () => {
  const s = booted({ newForms: ['daemon'] });
  s.axes = { allegiance: 4, stability: 4.2 }; // chrome or daemon
  const rng = mulberry32(3);
  let daemon = 0;
  for (let i = 0; i < 4000; i++) if (leaningForm(s, rng) === 'daemon') daemon++;
  const share = daemon / 4000; // 1.2 / 2.2 = 0.545
  assert.ok(share > 0.51 && share < 0.58, `daemon ${share}`);
});

// --- Segfault ---

test('a Segfault adds two faults and their stability cost', () => {
  const s = booted();
  s.inventory.push('segfault');
  const res = act(s, 'use', s.lastTick, noRng, { slot: 0 });
  assert.ok(res.ok, res.msg);
  assert.equal(s.careMistakes, ITEM_CFG.segfaultFaults);
  assert.equal(s.axes.stability, -2 * ITEM_CFG.segfaultFaults);
  assert.equal(s.inventory.length, 0);
});

test('Segfaults can end a life at the fault limit', () => {
  const s = booted();
  s.careMistakes = CFG.maxMistakes - 2;
  s.inventory.push('segfault');
  act(s, 'use', s.lastTick, noRng, { slot: 0 });
  tick(s, s.lastTick + MIN, noRng);
  assert.equal(s.stage, 'dead');
});

test('a Segfault needs it awake', () => {
  const s = booted();
  s.inventory.push('segfault');
  s.asleep = true;
  assert.equal(act(s, 'use', s.lastTick, noRng, { slot: 0 }).ok, false);
});

test('answering an intrusion or an overflow can shake a Segfault loose', () => {
  const s = booted();
  s.event = { type: 'attack', startedAge: s.ageMin };
  act(s, 'defend', s.lastTick, always, { won: true });
  assert.deepEqual(s.inventory, ['segfault']);
  s.event = { type: 'overflow', startedAge: s.ageMin };
  act(s, 'purge', s.lastTick, always);
  assert.deepEqual(s.inventory, ['segfault', 'segfault']);
  s.event = { type: 'attack', startedAge: s.ageMin };
  act(s, 'defend', s.lastTick, noRng, { won: true });
  assert.equal(s.inventory.length, 2, 'not every time');
});
