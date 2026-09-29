import './helpers/utc.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createScript, fragmentOf, levelStrength, migrate, mulberry32, tick, traitStrength, CFG, MIN, TRAIT_CFG } from '../src/sim.js';
import { cleanSave } from '../src/sanitize.js';

// Balance pass 3: trait strength, half-strength echoes of the grandparent, and levels for a streak.
const T0 = Date.UTC(2026, 8, 26, 12, 0);
const noRng = () => 0.999;

function child(fragment) {
  const s = createScript({ now: T0, rng: mulberry32(1), fragment: { quirk: null, ...fragment }, generation: 2 });
  s.quirk.sleepOffset = 0;
  tick(s, T0 + CFG.bootMinutes * MIN, noRng);
  return s;
}

test('levels: 1, 1.25, 1.5, and no further', () => {
  assert.equal(levelStrength(1), 1);
  assert.equal(levelStrength(2), 1 + TRAIT_CFG.levelStep);
  assert.equal(levelStrength(3), 1 + 2 * TRAIT_CFG.levelStep);
  assert.equal(levelStrength(9), levelStrength(TRAIT_CFG.maxLevel));
  assert.equal(levelStrength(undefined), 1);
});

test('strength: the parent in full, the grandparent as a half-strength echo, capped when they match', () => {
  const s = child({ form: 'daemon', trait: 'persistent', echo: 'hardened' });
  assert.equal(traitStrength(s, 'persistent'), 1);
  assert.equal(traitStrength(s, 'hardened'), TRAIT_CFG.echo);
  assert.equal(traitStrength(s, 'volatile'), 0);
  const same = child({ form: 'daemon', trait: 'persistent', echo: 'persistent' });
  assert.equal(traitStrength(same, 'persistent'), Math.min(1 + TRAIT_CFG.echo, TRAIT_CFG.cap.persistent));
  const max = child({ form: 'daemon', trait: 'persistent', level: 3, echo: 'persistent' });
  assert.equal(traitStrength(max, 'persistent'), TRAIT_CFG.cap.persistent, 'never over the cap');
});

test('a first-generation netling has no trait and no echo', () => {
  const s = createScript({ now: T0, rng: mulberry32(1) });
  assert.equal(s.trait, null);
  assert.equal(s.echo, null);
  assert.equal(s.traitLevel, 1);
  assert.equal(createScript({ now: T0, rng: mulberry32(1), fragment: { echo: 'hardened', quirk: null } }).echo, null, 'no echo without a trait');
});

test('the fragment: its own trait becomes the echo, and a streak of one form levels the trait', () => {
  const s = child({ form: 'daemon', trait: 'persistent' });
  let f = fragmentOf(s, 'daemon');
  assert.equal(f.trait, 'persistent');
  assert.equal(f.level, 2, 'second Daemon in a row');
  assert.equal(f.echo, 'persistent');
  const c = child(f);
  f = fragmentOf(c, 'daemon');
  assert.equal(f.level, 3);
  f = fragmentOf(child(f), 'daemon');
  assert.equal(f.level, TRAIT_CFG.maxLevel, 'capped');
  const broke = fragmentOf(child(f), 'chrome');
  assert.equal(broke.trait, 'licensed');
  assert.equal(broke.level, 1, 'a different form starts over');
  assert.equal(broke.echo, 'persistent');
});

test('the streak and echo carry through a real flatline', () => {
  const s = child({ form: 'daemon', trait: 'persistent', level: 2, echo: 'licensed' });
  s.stage = 'adult';
  s.form = 'daemon';
  s.ageMin = s.life.lifespan - 1;
  tick(s, s.lastTick + 2 * MIN, noRng);
  assert.equal(s.stage, 'dead');
  assert.deepEqual([s.fragment.trait, s.fragment.level, s.fragment.echo], ['persistent', 3, 'persistent']);
});

test('Persistent scales: stronger means slower drain while resting', () => {
  const drain = (fragment) => {
    const s = child(fragment);
    s.nap = { startedAge: s.ageMin }; // resting
    const before = s.stats.charge;
    tick(s, s.lastTick + 20 * MIN, noRng);
    return before - s.stats.charge;
  };
  const none = drain({});
  const echo = drain({ form: 'chrome', trait: 'licensed', echo: 'persistent' });
  const full = drain({ form: 'daemon', trait: 'persistent' });
  const max = drain({ form: 'daemon', trait: 'persistent', level: 3, echo: 'persistent' });
  assert.ok(none > echo && echo > full && full > max, `${none} ${echo} ${full} ${max}`);
  assert.ok(Math.abs(full / none - (1 - TRAIT_CFG.full.persistent)) < 0.01);
});

test('Licensed and Volatile scale their rewards', () => {
  const corp = (fragment) => {
    const s = child(fragment);
    s.stats.charge = 10;
    act(s, 'corp', s.lastTick, noRng);
    return s.stats.charge - 10;
  };
  assert.equal(corp({}), 30);
  assert.equal(corp({ form: 'chrome', trait: 'licensed' }), 30 * (1 + TRAIT_CFG.full.licensed));
  assert.equal(corp({ form: 'daemon', trait: 'persistent', echo: 'licensed' }), 30 * (1 + TRAIT_CFG.full.licensed * TRAIT_CFG.echo));
  const play = (fragment) => {
    const s = child(fragment);
    s.stats.sync = 10;
    act(s, 'play', s.lastTick, noRng, { game: 'breach', won: true });
    return s.stats.sync - 10;
  };
  assert.equal(play({ form: 'glitch', trait: 'volatile' }), play({}) * (1 + TRAIT_CFG.full.volatile));
  assert.equal(play({ form: 'daemon', trait: 'persistent', echo: 'volatile' }), play({}) * (1 + TRAIT_CFG.full.volatile * TRAIT_CFG.echo));
});

test('Hardened scales the infection chance of scavenged data', () => {
  const infected = (fragment, roll) => {
    const s = child(fragment);
    s.stats.charge = 10;
    act(s, 'scav', s.lastTick, () => roll);
    return s.virus;
  };
  // 0.12 without the trait, 0.06 at full strength, 0.09 as an echo.
  assert.equal(infected({}, 0.1), true);
  assert.equal(infected({ form: 'firewall', trait: 'hardened' }, 0.1), false);
  assert.equal(infected({ form: 'daemon', trait: 'persistent', echo: 'hardened' }, 0.08), true);
  assert.equal(infected({ form: 'daemon', trait: 'persistent', echo: 'hardened' }, 0.1), false);
});

test('saves from before trait levels get level 1 and no echo; stored values are cleaned', () => {
  const s = child({ form: 'daemon', trait: 'persistent' });
  delete s.traitLevel;
  delete s.echo;
  migrate(s);
  assert.equal(s.traitLevel, 1);
  assert.equal(s.echo, null);
  const base = JSON.parse(JSON.stringify(s));
  const clean = (o) => cleanSave({ ...base, ...o }, T0 + 60 * MIN);
  assert.equal(clean({ traitLevel: 2 }).traitLevel, 2);
  assert.equal(clean({ traitLevel: 99 }).traitLevel, TRAIT_CFG.maxLevel);
  assert.equal(clean({ traitLevel: 'x' }).traitLevel, 1);
  assert.equal(clean({ echo: 'hardened' }).echo, 'hardened');
  assert.equal(clean({ echo: 'nope' }).echo, null);
  const dead = clean({ stage: 'dead', fragment: { form: 'daemon', trait: 'persistent', level: 50, echo: 'bogus' } });
  assert.equal(dead.fragment.level, TRAIT_CFG.maxLevel);
  assert.equal(dead.fragment.echo, null);
  const old = clean({ stage: 'dead', fragment: { form: 'daemon', trait: 'persistent' } });
  assert.equal(old.fragment.level, 1, 'fragments from before levels are level 1');
});
