import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deathRecord, dexEntries, discover, formsSeenIn, lineageRows, DEX_ORDER } from '../src/archive.js';
import { createScript, tick, CFG, MIN } from '../src/sim.js';

const T0 = Date.UTC(2026, 8, 26, 12, 0);

function adultDeath(form) {
  const s = createScript({ now: T0, rng: () => 0.5 });
  s.stage = 'adult';
  s.form = form;
  s.teenForm = 'kernel';
  s.careMistakes = CFG.maxMistakes;
  s.quirk.sleepOffset = 0;
  tick(s, T0 + MIN, () => 0.999);
  return s;
}

test('discover adds each form once and ignores junk', () => {
  const dex = [];
  assert.equal(discover(dex, 'chrome'), true);
  assert.equal(discover(dex, 'chrome'), false);
  assert.equal(discover(dex, 'toaster'), false);
  assert.deepEqual(dex, ['chrome']);
});

test('death record captures the realized adult form and teen form', () => {
  const s = adultDeath('daemon');
  const rec = deathRecord(s);
  assert.equal(rec.form, 'daemon');
  assert.equal(rec.realized, true);
  assert.equal(rec.teenForm, 'kernel');
  assert.equal(rec.fragmentTrait, 'persistent');
});

test('lineage rows put the running generation first and mark echoes', () => {
  const lineage = [{ generation: 1, form: 'glitch', realized: false, cause: 'neglect', ageMin: 900 }];
  const current = createScript({ now: T0, generation: 2 });
  const rows = lineageRows(lineage, current);
  assert.equal(rows[0].status, 'running');
  assert.equal(rows[0].version, 'v2.0');
  assert.equal(rows[1].formLabel, 'Glitch (echo)');
});

test('old lineage entries without new fields still render', () => {
  const rows = lineageRows([{ generation: 1, ageMin: 50, cause: 'neglect', form: 'chrome', diedAt: 1 }], null);
  assert.equal(rows[0].formLabel, 'Chrome');
  assert.equal(rows[0].fragment, null);
});

test('formsSeenIn backfills only forms that were actually reached', () => {
  const state = createScript({ now: T0 });
  const lineage = [
    { generation: 1, ageMin: 3000, form: 'chrome', realized: false, teenForm: 'stub' },
    { generation: 2, ageMin: 6000, form: 'daemon', realized: true },
  ];
  assert.deepEqual(formsSeenIn(state, lineage).sort(), ['bitling', 'daemon', 'stub']);
});

test('dex hides undiscovered forms behind hints', () => {
  const entries = dexEntries(['bitling', 'ghost']);
  assert.equal(entries.length, DEX_ORDER.length);
  const ghost = entries.find((e) => e.id === 'ghost');
  assert.equal(ghost.name, 'Ghost');
  assert.equal(ghost.trait, 'Untraceable');
  const chrome = entries.find((e) => e.id === 'chrome');
  assert.equal(chrome.name, '???');
  assert.match(chrome.text, /^hint:/);
});
