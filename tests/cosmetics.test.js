import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COSMETICS, SLOTS, unlockedIds, resolveWardrobe, recordGame, DEFAULT_WARDROBE } from '../src/cosmetics.js';
import { FRAGMENTS } from '../src/netrun/codex.js';

const empty = { dex: [], codex: [], lineage: [], generation: 1, progress: {} };

test('fresh players only have the free items', () => {
  const ids = unlockedIds(empty);
  const free = SLOTS.flatMap((s) => COSMETICS[s].filter((c) => c.free).map((c) => `${s}:${c.id}`));
  assert.deepEqual(ids.sort(), free.sort());
});

test('every locked item has a hint and a check', () => {
  for (const slot of SLOTS) {
    for (const c of COSMETICS[slot]) {
      if (c.free) continue;
      assert.ok(c.hint, `${slot}:${c.id} hint`);
      assert.equal(typeof c.check, 'function', `${slot}:${c.id} check`);
    }
  }
});

test('dex, codex, lineage and feats unlock the right items', () => {
  const ctx = {
    dex: ['bitling', 'ghost'],
    codex: FRAGMENTS.filter((f) => f.region === 'ruins').map((f) => f.id),
    lineage: Array.from({ length: 3 }, () => ({ cause: 'end of life cycle' })),
    generation: 4,
    progress: { streaks: { breach: { cur: 0, best: 10 } }, cleanJackouts: 10, deepExits: 0 },
  };
  const ids = unlockedIds(ctx);
  for (const want of ['shell:clear', 'shell:matte', 'tint:phosphor', 'tint:amber', 'effect:rain', 'effect:interlace']) {
    assert.ok(ids.includes(want), want);
  }
  for (const not of ['shell:chrome', 'shell:gold', 'shell:holo', 'tint:abyss', 'effect:static', 'effect:bloom']) {
    assert.ok(!ids.includes(not), not);
  }
});

test('amber needs three full lives in a row, not three total', () => {
  const full = { cause: 'end of life cycle' };
  const died = { cause: 'neglect' };
  const ctx = (lineage) => ({ ...empty, lineage });
  assert.ok(!unlockedIds(ctx([full, full, died, full])).includes('tint:amber'));
  assert.ok(unlockedIds(ctx([died, full, full, full])).includes('tint:amber'));
});

test('locked or unknown equips fall back to defaults', () => {
  const unlocked = unlockedIds(empty);
  assert.deepEqual(resolveWardrobe({ shell: 'holo', tint: 'nope' }, unlocked), DEFAULT_WARDROBE);
  assert.equal(resolveWardrobe({ effect: 'clean' }, unlocked).effect, 'clean');
});

test('streaks count consecutive wins and keep the best', () => {
  let s = {};
  for (const won of [true, true, true, false, true]) s = recordGame(s, 'dodge', won);
  assert.deepEqual(s.dodge, { cur: 1, best: 3 });
});
