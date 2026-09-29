import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COSMETICS, SLOTS, unlockedIds, resolveWardrobe, recordGame, DEFAULT_WARDROBE } from '../src/cosmetics.js';
import { FRAGMENTS } from '../src/netrun/codex.js';
import { CHATTER } from '../src/chatter.js';

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

import { sanitizeLabel, LABEL } from '../src/cosmetics.js';

test('sound packs unlock from action counts and games played', () => {
  const ctx = { ...empty, progress: { acts: { corp: 60, scav: 40, patch: 5, hide: 10 }, gamesPlayed: 49 } };
  const ids = unlockedIds(ctx);
  assert.ok(ids.includes('sound:bass'));
  assert.ok(ids.includes('sound:buzz'));
  assert.ok(!ids.includes('sound:glass'));
  assert.ok(!ids.includes('sound:arcade'));
  assert.ok(ids.includes('sound:beep') && ids.includes('sound:soft'), 'free packs');
});

test('device label is earned by the first lost netling and sanitized', () => {
  assert.equal(LABEL.check(empty), false);
  assert.equal(LABEL.check({ ...empty, lineage: [{ cause: 'neglect' }] }), true);
  assert.equal(sanitizeLabel('  kernel  line!!  '), 'KERNEL LIN');
  assert.equal(sanitizeLabel('<script>'), 'SCRIPT');
  assert.equal(sanitizeLabel('!!!'), 'NETLING');
  assert.equal(sanitizeLabel('nl-0.v2'), 'NL-0.V2');
});

import { LEGACY } from '../src/cosmetics.js';
import { cleanWardrobe } from '../src/sanitize.js';

// Legacy goals (lineage Step 3): crests earned by the line, read from the lineage records.
const has = (lineage, id) => unlockedIds({ ...empty, lineage }).includes(id);

test('Helix: every trait inherited at least once, counted across the line', () => {
  const line = ['licensed', 'hardened', 'persistent', 'volatile'].map((trait) => ({ trait }));
  assert.ok(!has(line, 'crest:helix'));
  assert.ok(has([...line, { trait: 'untraceable' }], 'crest:helix'));
  assert.ok(!has([...line, { trait: 'nonsense' }, { trait: null }], 'crest:helix'), 'unknown traits do not count');
});

test('Triad: a level III trait, held or passed on', () => {
  assert.ok(!has([{ traitLevel: 2, fragmentLevel: 2 }], 'crest:triad'));
  assert.ok(has([{ traitLevel: 2, fragmentLevel: 3 }], 'crest:triad'), 'passing on level III counts');
  assert.ok(has([{ traitLevel: 3, fragmentLevel: 1 }], 'crest:triad'), 'holding level III counts');
  assert.ok(!has([{ trait: 'persistent' }], 'crest:triad'), 'records from before levels are level 1');
});

test('Closed loop: five full lives in a row with no NL-0 rescue', () => {
  const full = { cause: 'end of life cycle' };
  const rescued = { cause: 'end of life cycle', rescued: true };
  const died = { cause: 'neglect' };
  assert.equal(LEGACY.unbroken, 5);
  assert.ok(has([died, full, full, full, full, full], 'crest:loop'));
  assert.ok(!has([full, full, rescued, full, full, full], 'crest:loop'), 'a rescue breaks the loop');
  assert.ok(!has([full, full, full, died, full, full], 'crest:loop'));
  assert.ok(has([full, full, rescued, full], 'tint:amber'), 'amber still counts rescued lives');
});

test('Full house: every adult form raised to adulthood in the line', () => {
  const adult = (form) => ({ form, realized: true });
  const four = ['chrome', 'firewall', 'daemon', 'glitch'].map(adult);
  assert.ok(!has(four, 'crest:star'));
  assert.ok(!has([...four, { form: 'ghost', realized: false }], 'crest:star'), 'an unrealized echo is not raised');
  assert.ok(!has([...four, { form: 'ghost' }], 'crest:star'), 'old records without realized do not count');
  assert.ok(has([...four, adult('ghost')], 'crest:star'));
  assert.ok(!unlockedIds({ ...empty, dex: ['chrome', 'firewall', 'daemon', 'glitch', 'ghost'] }).includes('crest:star'), 'the dex alone is not enough');
});

test('the crest slot defaults to none, has pixels for every crest, and survives cleaning', () => {
  assert.equal(DEFAULT_WARDROBE.crest, 'none');
  assert.equal(resolveWardrobe({ crest: 'helix' }, unlockedIds(empty)).crest, 'none', 'locked crest falls back');
  for (const c of COSMETICS.crest.filter((x) => !x.free)) {
    assert.equal(c.pixels.length, 9, c.id);
    assert.ok(c.pixels.every((r) => /^[#.]{9}$/.test(r)), c.id);
  }
  assert.equal(cleanWardrobe({ crest: 'triad' }).crest, 'triad');
  assert.equal(cleanWardrobe({ crest: 'bogus' }).crest, undefined);
});

// --- attention rewards ---

const earns = (ctx, id) => unlockedIds({ ...empty, ...ctx }).includes(id);

test('Purr: twenty-five requests answered', () => {
  assert.equal(earns({ progress: { requestsMet: 24 } }, 'sound:purr'), false);
  assert.equal(earns({ progress: { requestsMet: 25 } }, 'sound:purr'), true);
});

test('Guest pink: ten visitors greeted', () => {
  assert.equal(earns({ progress: { visitorsGreeted: 9 } }, 'tint:guest'), false);
  assert.equal(earns({ progress: { visitorsGreeted: 10 } }, 'tint:guest'), true);
});

test('Aurora: a day in flow, counted across lives', () => {
  assert.equal(earns({ progress: {}, flowMin: 24 * 60 - 1 }, 'effect:aurora'), false);
  assert.equal(earns({ progress: {}, flowMin: 24 * 60 }, 'effect:aurora'), true);
});

test('Speech mark: every line of one group heard', () => {
  const bitling = CHATTER.filter((c) => c.group === 'bitling').map((c) => c.id);
  assert.equal(earns({ progress: { chatter: bitling.slice(1) } }, 'crest:speech'), false);
  assert.equal(earns({ progress: { chatter: bitling } }, 'crest:speech'), true);
});
