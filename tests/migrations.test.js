import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { upgradeSave, isNewerSave, STEPS } from '../src/migrations.js';
import { cleanSave } from '../src/sanitize.js';
import { migrate, tick, SAVE_VERSION, MIN } from '../src/sim.js';
import { encodeSave, decodeSave, TransferError } from '../src/transfer.js';

// tests/fixtures/save-v1.json is a real version 1 save, frozen. NEVER regenerate it: it stands for every
// save players already have. When SAVE_VERSION moves past 1, this file must keep loading through the steps.
const v1 = JSON.parse(readFileSync(new URL('./fixtures/save-v1.json', import.meta.url), 'utf8'));
const clone = (x) => JSON.parse(JSON.stringify(x));

test('the frozen version 1 fixture still loads and keeps what a player would care about', () => {
  assert.equal(v1.saveVersion, 1);
  const s = migrate(cleanSave(clone(v1), Date.now()));
  assert.ok(s, 'the fixture must always load');
  assert.equal(s.saveVersion, SAVE_VERSION);
  assert.equal(s.stage, 'adult');
  assert.equal(s.form, 'chrome');
  assert.equal(s.generation, v1.generation);
  assert.equal(s.ageMin, v1.ageMin);
  assert.deepEqual(s.inventory, ['coolant', 'repair']);
  assert.equal(s.run?.phase, 'ice', 'an open netrun survives');
  assert.deepEqual(s.games, v1.games);
  assert.doesNotThrow(() => tick(s, s.lastTick + 30 * MIN, () => 0.999), 'and it still runs');
});

test('a save already at the current version is passed through untouched', () => {
  const res = upgradeSave(v1, { target: 1 });
  assert.equal(res.upgraded, false);
  assert.equal(res.save, v1);
});

test('steps run in order, each from the previous version, on a copy', () => {
  const steps = {
    1: (s) => ({ ...s, note: 'one', order: [1] }),
    2: (s) => {
      s.order.push(2);
      s.renamed = s.note; // steps may edit their private copy
      delete s.note;
    },
  };
  const input = clone(v1);
  const res = upgradeSave(input, { steps, target: 3 });
  assert.equal(res.upgraded, true);
  assert.equal(res.from, 1);
  assert.equal(res.save.saveVersion, 3);
  assert.deepEqual(res.save.order, [1, 2]);
  assert.equal(res.save.renamed, 'one');
  assert.equal(res.save.note, undefined);
  assert.deepEqual(input, v1, 'the input is not modified');
});

test('versions that cannot be upgraded are reported, not guessed at', () => {
  const at = (saveVersion) => ({ ...clone(v1), saveVersion });
  assert.equal(upgradeSave(at(2), { target: 1 }).error, 'newer');
  for (const bad of [0, -1, 1.5, '1', null, undefined, NaN]) assert.equal(upgradeSave(at(bad), { target: 2 }).error, 'invalid', String(bad));
  for (const bad of [null, [], 'save', 3]) assert.equal(upgradeSave(bad).error, 'invalid');
  assert.equal(upgradeSave(at(1), { steps: {}, target: 2 }).error, 'failed', 'a missing step');
  assert.equal(upgradeSave(at(1), { steps: { 1: () => { throw new Error('x'); } }, target: 2 }).error, 'failed', 'a throwing step');
  assert.equal(upgradeSave(at(1), { steps: { 1: () => 'not a save' }, target: 2 }).error, 'failed', 'a step that returns junk');
});

test('the registered steps cover every version below the current one', () => {
  for (let v = 1; v < SAVE_VERSION; v++) assert.equal(typeof STEPS[v], 'function', `no step for version ${v}`);
});

test('cleanSave sets aside saves it cannot upgrade', () => {
  assert.equal(cleanSave({ ...clone(v1), saveVersion: SAVE_VERSION + 1 }), null);
  assert.equal(cleanSave({ ...clone(v1), saveVersion: 0 }), null);
  assert.equal(isNewerSave({ saveVersion: SAVE_VERSION + 1 }), true);
  assert.equal(isNewerSave({ saveVersion: SAVE_VERSION }), false);
  assert.equal(isNewerSave(null), false);
});

test('transfer codes from an older build load, and codes from a newer build say so', async () => {
  const code = await encodeSave({ save: clone(v1) });
  const back = await decodeSave(code);
  assert.equal(back.data.save.form, 'chrome');

  const newer = await encodeSave({ save: { ...clone(v1), saveVersion: SAVE_VERSION + 1 } });
  await assert.rejects(decodeSave(newer), (err) => err instanceof TransferError && /newer version/.test(err.message));
});
