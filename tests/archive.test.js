import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deathRecord, dexEntries, discover, formsSeenIn, lineageChain, lineageRows, DEX_ORDER } from '../src/archive.js';
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

test('dex lists run abilities for discovered adult forms only', () => {
  const entries = dexEntries(['firewall']);
  assert.match(entries.find((e) => e.id === 'firewall').runAbility, /ICE/);
  assert.equal(entries.find((e) => e.id === 'daemon').runAbility, null);
  assert.equal(dexEntries(['kernel']).find((e) => e.id === 'kernel').runAbility, null);
});

test('the family tree runs oldest first, with what passed down between parent and child', () => {
  const lineage = [
    { generation: 1, form: 'daemon', realized: true, cause: 'end of life cycle', ageMin: 7200, fragmentTrait: 'persistent', fragmentLevel: 1, keepsake: 'coolant' },
    { generation: 2, form: 'daemon', realized: true, cause: 'end of life cycle', ageMin: 7200, trait: 'persistent', traitLevel: 1, fragmentTrait: 'persistent', fragmentLevel: 2 },
  ];
  const current = createScript({ now: T0, generation: 3, fragment: { form: 'daemon', trait: 'persistent', level: 2, history: 'persistent', quirk: null } });
  tick(current, T0 + CFG.bootMinutes * MIN, () => 0.999); // booted: a compiling script has no stats yet
  const chain = lineageChain(lineage, current);
  assert.deepEqual(chain.map((c) => c.kind), ['node', 'link', 'node', 'link', 'node']);
  assert.deepEqual(chain.filter((c) => c.kind === 'node').map((c) => c.version), ['v1.0', 'v2.0', 'v3.0']);
  assert.equal(chain[1].text, 'Persistent + Coolant cell');
  assert.equal(chain[3].text, 'Persistent II · history Persistent');
  assert.equal(chain[4].status, 'running');
  assert.match(chain[4].stats, /^CHG \d+ · SYNC \d+ · INT \d+ · HEAT \d+ · scrip \d+$/, 'the running netling shows its stats');
  assert.equal(chain[2].stats, undefined, 'dead generations have none');
  assert.equal(lineageChain([], createScript({ now: T0 }))[0].stats, null, 'nor does a compiling script');
  assert.equal(chain[2].inherited, null, 'shown on the link instead');
  assert.equal(chain[2].left, null, 'its child is in the chain');
});

test('the family tree marks missing records and shows what the last netling left', () => {
  const chain = lineageChain(
    [
      { generation: 2, form: 'chrome', realized: true, cause: 'neglect', trait: 'volatile', fragmentTrait: 'licensed' },
      { generation: 4, form: 'glitch', realized: false, cause: 'neglect', trait: 'hardened', fragmentTrait: 'volatile' },
    ],
    null,
  );
  assert.equal(chain[0].inherited, 'Volatile', 'nothing above the oldest record');
  assert.deepEqual([chain[1].kind, chain[1].gap, chain[1].text], ['link', true, 'records missing']);
  assert.equal(chain[2].inherited, 'Hardened', 'after a gap the node shows its own inheritance');
  assert.equal(chain[2].left, 'Volatile');
  assert.deepEqual(lineageChain([], null), []);
});
