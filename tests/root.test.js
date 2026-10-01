import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createScript, tick, rollQuirk, mulberry32, CFG, MIN, PALETTES } from '../src/sim.js';

const T0 = Date.UTC(2026, 8, 26, 12, 0);
const noRng = () => 0.999;

function booted(rootAccess) {
  const s = createScript({ now: T0, rng: mulberry32(1), rootAccess });
  s.quirk.sleepOffset = 0;
  tick(s, T0 + CFG.bootMinutes * MIN, noRng);
  return s;
}

test('root access reverses the first premature flatline only', () => {
  const s = booted(true);
  s.careMistakes = CFG.maxMistakes;
  tick(s, s.lastTick + MIN, noRng);
  assert.notEqual(s.stage, 'dead');
  assert.equal(s.rootUsed, true);
  assert.equal(s.careMistakes, CFG.maxMistakes - 1);
  s.careMistakes = CFG.maxMistakes;
  tick(s, s.lastTick + MIN, noRng);
  assert.equal(s.stage, 'dead', 'second time is final');
});

test('root access does not stop old age', () => {
  const s = booted(true);
  s.ageMin = CFG.lifespanMin - 1;
  tick(s, s.lastTick + MIN, noRng);
  assert.equal(s.stage, 'dead');
  assert.equal(s.deathCause, 'end of life cycle');
});

test('without root access a flatline is final', () => {
  const s = booted(false);
  s.careMistakes = CFG.maxMistakes;
  tick(s, s.lastTick + MIN, noRng);
  assert.equal(s.stage, 'dead');
});

test('the origin palette only rolls with root access', () => {
  const origin = PALETTES.length - 1;
  const rolls = (o) => Array.from({ length: 400 }, (_, i) => rollQuirk(mulberry32(i + 1), { origin: o }).palette);
  assert.ok(!rolls(false).includes(origin));
  assert.ok(rolls(true).includes(origin));
});

function rescuedThenDied() {
  const s = booted(true);
  s.careMistakes = CFG.maxMistakes;
  tick(s, s.lastTick + MIN, noRng); // rescued
  s.careMistakes = CFG.maxMistakes;
  tick(s, s.lastTick + MIN, noRng); // dies for real
  return s;
}

test('after a rescue, NL-0 rests for the next generation, then returns', () => {
  const parent = rescuedThenDied();
  assert.equal(parent.fragment.rootUsed, true);

  const child = createScript({ now: T0, generation: 2, fragment: parent.fragment, rootAccess: true });
  assert.equal(child.rootAccess, false);
  assert.equal(child.rootCooling, true);
  assert.match(child.log.at(-1).msg, /NL-0/);

  // The cooling generation dies without needing (or getting) a rescue.
  child.stage = 'baby';
  child.careMistakes = CFG.maxMistakes;
  tick(child, child.lastTick + MIN, noRng);
  assert.equal(child.stage, 'dead');
  assert.equal(child.fragment.rootUsed, false);

  const grandchild = createScript({ now: T0, generation: 3, fragment: child.fragment, rootAccess: true });
  assert.equal(grandchild.rootAccess, true);
  assert.equal(grandchild.rootCooling, false);
});

test('an unused rescue carries straight into the next generation', () => {
  const s = booted(true);
  s.ageMin = CFG.lifespanMin - 1;
  tick(s, s.lastTick + MIN, noRng);
  const next = createScript({ now: T0, generation: 2, fragment: s.fragment, rootAccess: true });
  assert.equal(next.rootAccess, true);
});

// --- Root Access is earned once and kept ---

import { FRAGMENTS, ROOT_FRAGMENTS, ROOT_FRAGMENT_IDS, allFragmentsFound, rootUnlocked } from '../src/netrun/codex.js';
import { cleanProgress } from '../src/sanitize.js';

const allIds = [...ROOT_FRAGMENT_IDS]; // the original 22, all Root Access needs

test('finishing the codex unlocks Root Access, and a missing fragment does not', () => {
  assert.equal(allFragmentsFound(allIds, ROOT_FRAGMENTS), true);
  assert.equal(allFragmentsFound(allIds.slice(1), ROOT_FRAGMENTS), false);
  assert.equal(allFragmentsFound(allIds), false, 'the whole codex is bigger now: the Source and deep-5');
  assert.equal(allFragmentsFound(FRAGMENTS.map((f) => f.id)), true);
  assert.equal(rootUnlocked({}, allIds), true);
  assert.equal(rootUnlocked({}, allIds.slice(1)), false);
  assert.equal(rootUnlocked(null, []), false);
});

test('a fragment added later does not take Root Access back from someone who earned it', () => {
  const grown = [...ROOT_FRAGMENTS, { id: 'deep-9', region: 'deep', title: 'new', text: 'new' }];
  assert.equal(rootUnlocked({}, allIds, grown), false, 'without the record, the bigger codex is incomplete');
  assert.equal(rootUnlocked({ rootEarned: true }, allIds, grown), true, 'with the record it is kept');
  assert.equal(rootUnlocked({ rootEarned: 'yes' }, allIds, grown), false, 'only a real true counts');
});

test('the Root Access record survives cleaning, is boolean only, and is absent by default', () => {
  assert.equal(cleanProgress({ rootEarned: true }).rootEarned, true);
  assert.equal(cleanProgress({ rootEarned: 'true' }).rootEarned, undefined);
  assert.equal(cleanProgress({ rootEarned: 1 }).rootEarned, undefined);
  assert.equal('rootEarned' in cleanProgress({}), false);
});

test('new netlings compile with Root Access when it is unlocked, even after the codex grew', () => {
  const grown = [...ROOT_FRAGMENTS, { id: 'deep-9', region: 'deep', title: 'new', text: 'new' }];
  const s = createScript({ now: T0, rng: mulberry32(1), rootAccess: rootUnlocked({ rootEarned: true }, allIds, grown) });
  assert.equal(s.rootAccess, true);
});

test('Root Access needs the original 22 only: the Mainframe stage\'s fragments never count toward it', () => {
  assert.equal(ROOT_FRAGMENTS.length, 22);
  assert.ok(ROOT_FRAGMENTS.every((f) => !f.mainframe));
  const later = FRAGMENTS.filter((f) => f.mainframe).map((f) => f.id);
  assert.deepEqual(later, ['deep-5', 'source-1', 'source-2', 'source-3', 'source-4']);
  assert.equal(rootUnlocked({}, allIds), true, 'the 22 are enough, without the newer ones');
  assert.equal(rootUnlocked({}, [...allIds.slice(1), ...later]), false, 'and the newer ones cannot stand in for one of them');
});
