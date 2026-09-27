import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createScript, tick, grantItem, itemBlockReason, mulberry32, CFG, MIN, INVENTORY_SLOTS, ITEM_CFG } from '../src/sim.js';

const T0 = Date.UTC(2026, 8, 26, 12, 0);
const noRng = () => 0.999;
const always = () => 0;

function booted(items = []) {
  const s = createScript({ now: T0, rng: mulberry32(1) });
  s.quirk.sleepOffset = 0;
  tick(s, T0 + CFG.bootMinutes * MIN, noRng);
  s.inventory.push(...items);
  return s;
}
const use = (s, slot = 0, rng = noRng) => act(s, 'use', s.lastTick, rng, { slot });

test('inventory caps at six slots', () => {
  const s = booted();
  for (let i = 0; i < INVENTORY_SLOTS; i++) grantItem(s, 'coolant');
  assert.match(grantItem(s, 'coolant'), /full/);
  assert.equal(s.inventory.length, INVENTORY_SLOTS);
});

test('using an item consumes it; empty slots fail', () => {
  const s = booted(['coolant']);
  s.stats.heat = 90;
  assert.ok(use(s).ok);
  assert.equal(s.stats.heat, 40);
  assert.equal(s.inventory.length, 0);
  assert.equal(use(s).ok, false);
});

test('coolant works asleep, awake-only items do not', () => {
  const s = booted(['coolant', 'blackice']);
  s.asleep = true;
  assert.equal(itemBlockReason(s, 0), null);
  assert.match(itemBlockReason(s, 1), /low-power/);
});

test('antivirus cures and shields against new infections', () => {
  const s = booted(['antivirus']);
  s.virus = true;
  use(s);
  assert.equal(s.virus, false);
  tick(s, s.lastTick + 60 * MIN, always); // every random roll fires, but the shield holds
  assert.equal(s.virus, false);
  tick(s, s.lastTick + ITEM_CFG.shieldMinutes * MIN, always);
  assert.equal(s.virus, true, 'shield expires');
});

test('voucher waves off an active trace, or pre-clears the next one', () => {
  const s = booted(['voucher', 'voucher']);
  s.event = { type: 'trace', startedAge: s.ageMin };
  use(s);
  assert.equal(s.event, null);
  assert.equal(s.stats.charge, 100);
  use(s);
  assert.equal(s.buffs.traceSkip, true);
  tick(s, s.lastTick + MIN, always); // a trace would fire this minute
  assert.equal(s.event, null);
  assert.equal(s.buffs.traceSkip, false);
});

test('booster doubles the next win only', () => {
  const s = booted(['booster']);
  use(s);
  act(s, 'play', s.lastTick, noRng, { game: 'tune', won: true });
  act(s, 'play', s.lastTick, noRng, { game: 'tune', won: true });
  assert.equal(s.games.tune.won, 3);
});

test('memory shard always changes one quirk', () => {
  const s = booted(['memory']);
  const before = JSON.stringify(s.quirk);
  use(s, 0, mulberry32(9));
  assert.notEqual(JSON.stringify(s.quirk), before);
});

test('wins can drop items', () => {
  const s = booted();
  const res = act(s, 'play', s.lastTick, always, { game: 'breach', won: true });
  assert.equal(s.inventory.length, 1);
  assert.match(res.msg, /found/);
});

test('an adult leaves a keepsake that the next script starts with', () => {
  const s = booted();
  s.stage = 'adult';
  s.form = 'firewall';
  s.careMistakes = CFG.maxMistakes;
  tick(s, s.lastTick + MIN, noRng);
  assert.equal(s.fragment.keepsake, 'antivirus');
  const next = createScript({ now: T0, generation: 2, fragment: s.fragment });
  assert.deepEqual(next.inventory, ['antivirus']);
});

test('discard frees a slot, works asleep, and ignores empty slots', () => {
  const s = booted(['coolant', 'booster']);
  s.asleep = true;
  assert.ok(act(s, 'discard', s.lastTick, noRng, { slot: 1 }).ok);
  assert.deepEqual(s.inventory, ['coolant']);
  assert.equal(act(s, 'discard', s.lastTick, noRng, { slot: 3 }).ok, false);
});
