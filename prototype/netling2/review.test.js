// The focus review page's pure half (review.js): the registry, the link round trip, the presets and the change track.
import './ready.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACCESSORIES } from '../../src/accessories.js';
import { allForms, parseState, stateHash, preset, changeTrack, stageOf, DEFAULTS } from './review.js';

test('the registry holds every form of the four eggs once, with its egg and stage', () => {
  const all = allForms();
  const count = (egg) => [...all.values()].filter((x) => x.egg === egg).length;
  assert.deepEqual([count('iron'), count('program'), count('wetware'), count('rogue')], [22, 22, 22, 10]);
  for (const [id, { form }] of all) {
    assert.equal(form.id, id);
    assert.ok(['baby', 'teen', 'adult', 'elder'].includes(stageOf(form)), id);
  }
});

const WEAR = ACCESSORIES.filter((a) => a.slot !== 'prop').slice(0, 2).map((a) => a.id);

test('the link round-trips the state and stays short at the defaults', () => {
  assert.equal(stateHash(DEFAULTS), '#');
  const s = { ...structuredClone(DEFAULTS), ids: ['ironBaby', 'rogueElderTune'], view: 'motion', level: -2, wear: WEAR, play: 0, t: 1234, marks: 'all', speed: 0.25 };
  assert.deepEqual(parseState(stateHash(s)), s);
  assert.match(stateHash(s), /ids=ironBaby,rogueElderTune/);
});

test('a hostile or stale link falls back to defaults: unknown ids, keys, views and numbers are dropped', () => {
  const s = parseState('#ids=ironBaby,nope,<b>&wear=nope,' + WEAR[0] + '&view=evil&damage=x&level=abc&bogus=1&scale=4');
  assert.deepEqual(s.ids, ['ironBaby']);
  assert.deepEqual(s.wear, [WEAR[0]]);
  assert.equal(s.view, DEFAULTS.view);
  assert.equal(s.damage, DEFAULTS.damage);
  assert.equal(s.level, DEFAULTS.level);
  assert.equal(s.scale, 4);
  assert.equal('bogus' in s, false);
});

test('presets pick the expected forms', () => {
  assert.deepEqual(preset('line', { id: 'ironAdultBreachStreet' }), ['ironBaby', 'ironTeenStreet', 'ironAdultBreachStreet', 'ironElderBreachStreet']);
  assert.deepEqual(preset('line', { id: 'wetwareElderHidden' }), ['wetwareBaby', 'wetwareTeenHidden', 'wetwareAdultHidden', 'wetwareElderHidden']);
  assert.deepEqual(preset('line', { id: 'rogueAdultTune' }), ['rogueBaby', 'rogueTeen', 'rogueAdultTune', 'rogueElderTune']);
  assert.deepEqual(preset('line', { id: 'programBaby' }), ['programBaby', 'programTeenCorp', 'programTeenStreet', 'programTeenHidden']);
  assert.deepEqual(preset('pair', { id: 'programElderFeastCorp' }), ['programAdultFeastCorp', 'programElderFeastCorp']);
  assert.deepEqual(preset('across', { stage: 'baby' }), ['ironBaby', 'programBaby', 'wetwareBaby', 'rogueBaby']);
  assert.equal(preset('stage', { egg: 'iron', stage: 'elder' }).length, 9);
  assert.equal(preset('egg', { egg: 'rogue' }).length, 10);
});

test('the change track finds the 500 ms frame changes, the Iron settle, and nothing on a dead pet', () => {
  const { form, egg } = allForms().get('ironAdultBreachStreet');
  const still = changeTrack({ form, egg, idle: 'none' }, { idleActions: false }, { from: 0, to: 3000 });
  assert.deepEqual(still.map((c) => c.t), [500, 1000, 1500, 2000, 2500]);
  assert.ok(still.every((c) => c.what.includes('picture')));
  // A strongly steady Iron settles a row every 3 s: a place change at the beat.
  const settle = changeTrack({ form, egg, idle: 'none', level: 2 }, { idleActions: false }, { from: 2900, to: 3500 });
  assert.ok(settle.some((c) => c.t === 3000 && c.what.includes('place')));
  // Nothing at all changes on a dead pet.
  assert.deepEqual(changeTrack({ form, egg, pose: 'dead' }, {}, { from: 0, to: 2000 }), []);
  // A worn item moves with the frame only if its placement changes; the track never reports a wearable change on a still, unworn pet.
  assert.ok(still.every((c) => !c.what.includes('worn')));
});
