import './helpers/utc.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createScript, tick, act, mulberry32, CFG, MIN, SCRIP, INVENTORY_SLOTS } from '../src/sim.js';
import { ACCESSORIES } from '../src/accessories.js';
import {
  checkinDue, claimCheckin, rollReward, takeFromBox, takeBlockReason, newCheckin, checkinTier, CHECKIN, CHECKIN_ACCESSORIES,
} from '../src/checkin.js';
import { cleanCheckin, cleanRewardBox, cleanSave } from '../src/sanitize.js';
import { TRANSFER_KEYS } from '../src/transfer.js';

const noRng = () => 0.999;

function booted(at = Date.UTC(2026, 8, 26, 12, 0)) {
  const s = createScript({ now: at, rng: mulberry32(1) });
  s.quirk.sleepOffset = 0;
  tick(s, at + CFG.bootMinutes * MIN, noRng);
  return s;
}

test('the netling records its morning wake, not a nap', () => {
  const s = booted(Date.UTC(2026, 8, 26, 21, 0));
  assert.equal(s.wokeAt, null);
  act(s, 'nap', s.lastTick);
  tick(s, s.lastTick + 30 * MIN, noRng);
  assert.equal(act(s, 'nap', s.lastTick).msg, 'woke it from its nap.');
  assert.equal(s.wokeAt, null, 'a nap is not a new day');
  tick(s, Date.UTC(2026, 8, 27, 7, 30), noRng);
  assert.equal(s.asleep, false);
  assert.ok(s.wokeAt >= Date.UTC(2026, 8, 27, 7, 0) && s.wokeAt <= Date.UTC(2026, 8, 27, 7, 1));
  assert.equal(cleanSave(JSON.parse(JSON.stringify(s)), s.lastTick).wokeAt, s.wokeAt);
});

test('the first check-in is due at once; after that, once per morning it wakes, however many mornings passed', () => {
  const s = booted(Date.UTC(2026, 8, 26, 12, 0));
  let c = newCheckin();
  let box = [];
  assert.equal(checkinDue(c, s, box), true);
  const first = claimCheckin(c, box, s, [], mulberry32(1), s.lastTick);
  ({ checkin: c, box } = first);
  assert.equal(first.day, 1);
  assert.equal(checkinDue(c, s, box), false, 'not again the same day');
  tick(s, Date.UTC(2026, 8, 26, 23, 0), noRng);
  assert.equal(checkinDue(c, s, box), false, 'asleep is not a new day');
  // Three mornings pass with the app closed: one check-in.
  tick(s, Date.UTC(2026, 8, 29, 9, 0), noRng);
  assert.equal(checkinDue(c, s, box), true);
  ({ checkin: c, box } = claimCheckin(c, box, s, [], mulberry32(2), s.lastTick));
  assert.equal(checkinDue(c, s, box), false);
  assert.equal(c.day, 2, 'the ladder paused over the missed days instead of resetting');
  assert.equal(c.claims, 2);
  // A new netling that has not woken yet: nothing due until its first morning.
  const next = booted(Date.UTC(2026, 8, 29, 10, 0));
  assert.equal(checkinDue(c, next, box), false);
});

test('the ladder: seven days, then it starts over', () => {
  const rng = mulberry32(4);
  const kinds = [];
  let c = newCheckin();
  let box = [];
  const s = booted();
  for (let i = 0; i < 9; i++) {
    s.wokeAt = (c.claimedAt ?? 0) + 1;
    const res = claimCheckin(c, box, s, [], rng, (c.claimedAt ?? 0) + 2);
    kinds.push(`${res.day}:${res.reward.kind}`);
    ({ checkin: c, box } = res);
  }
  assert.deepEqual(kinds, ['1:scrip', '2:item', '3:scrip', '4:item', '5:accessory', '6:item', '7:accessory', '1:scrip', '2:item']);
  assert.deepEqual(box.slice(0, 7).map((e) => e.n ?? e.id).filter((v) => typeof v === 'number'), [10, 25]);
});

test('item days give their price tier, and never a Segfault', () => {
  const rng = mulberry32(6);
  const cheapest = Math.min(...Object.values(SCRIP.price));
  for (let i = 0; i < 300; i++) {
    const two = rollReward(1, [], rng);
    const four = rollReward(3, [], rng);
    const six = rollReward(5, [], rng);
    assert.equal(SCRIP.price[two.id], cheapest);
    assert.ok(SCRIP.price[four.id] > cheapest && SCRIP.price[four.id] < SCRIP.price[six.id]);
    assert.equal(six.id, 'overclock');
    for (const r of [two, four, six]) assert.notEqual(r.id, 'segfault');
  }
  assert.ok(!checkinTier(1).includes('segfault'));
});

test('accessory days give an unowned one from the general pool, or scrip once there is none left', () => {
  const byId = new Map(ACCESSORIES.map((x) => [x.id, x]));
  for (const id of CHECKIN_ACCESSORIES) assert.ok(!byId.get(id).regions && byId.get(id).source !== 'earned', id);
  const rng = mulberry32(8);
  for (let i = 0; i < 200; i++) {
    const five = rollReward(4, ['cap'], rng);
    const seven = rollReward(6, ['halo'], rng);
    assert.equal(byId.get(five.id).rarity, 'common');
    assert.notEqual(five.id, 'cap', 'never one it owns');
    assert.ok(['rare', 'veryrare'].includes(byId.get(seven.id).rarity));
    assert.notEqual(seven.id, 'halo');
  }
  assert.deepEqual(rollReward(4, CHECKIN_ACCESSORIES, rng), { kind: 'scrip', n: 25 });
  assert.deepEqual(rollReward(6, CHECKIN_ACCESSORIES, rng), { kind: 'scrip', n: 40 });
  // One already waiting in the box counts as owned.
  const s = booted();
  const commons = CHECKIN_ACCESSORIES.filter((id) => byId.get(id).rarity === 'common');
  const box = commons.slice(1).map((id) => ({ kind: 'accessory', id, day: 5 }));
  const res = claimCheckin({ day: 4, claimedAt: null, claims: 4 }, box, s, [], rng, 1);
  assert.equal(res.reward.id, commons[0]);
});

test('a full box holds the check-in back instead of losing it', () => {
  const s = booted();
  const box = Array.from({ length: CHECKIN.boxMax }, () => ({ kind: 'scrip', n: 1, day: 1 }));
  assert.equal(checkinDue(newCheckin(), s, box), false);
  assert.equal(claimCheckin(newCheckin(), box, s, [], noRng, 1), null);
});

test('taking from the box: items need room, scrip over the cap stays, accessories always go', () => {
  const s = booted();
  s.scrip = SCRIP.max - 5;
  let box = [{ kind: 'scrip', n: 25, day: 3 }, { kind: 'item', id: 'coolant', day: 2 }, { kind: 'accessory', id: 'cap', day: 5 }];
  let res = takeFromBox(box, 0, s);
  assert.equal(s.scrip, SCRIP.max);
  assert.deepEqual(res.box[0], { kind: 'scrip', n: 20, day: 3 }, 'the rest stays');
  assert.equal(takeBlockReason(res.box[0], s), 'scrip is full.');
  box = res.box;
  s.inventory = Array(INVENTORY_SLOTS).fill('repair');
  assert.equal(takeFromBox(box, 1, s).msg, 'inventory is full.');
  s.inventory = [];
  res = takeFromBox(box, 1, s);
  assert.deepEqual(s.inventory, ['coolant']);
  box = res.box;
  res = takeFromBox(box, 1, s);
  assert.equal(res.accessory, 'cap');
  assert.deepEqual(res.box, [{ kind: 'scrip', n: 20, day: 3 }]);
  // No netling to give it to, or out on a run: only accessories can be taken.
  s.stage = 'dead';
  assert.ok(takeBlockReason({ kind: 'item', id: 'coolant', day: 2 }, s));
  assert.equal(takeBlockReason({ kind: 'accessory', id: 'cap', day: 5 }, s), null);
});

test('stored check-in data is cleaned, and both keys move with a transfer code', () => {
  assert.deepEqual(cleanCheckin(null), { day: 0, claimedAt: null, claims: 0 });
  assert.deepEqual(cleanCheckin({ day: 99, claimedAt: 'x', claims: -3 }), { day: CHECKIN.days - 1, claimedAt: null, claims: 0 });
  const box = cleanRewardBox([
    { kind: 'scrip', n: 10, day: 1 },
    { kind: 'item', id: 'nope', day: 2 },
    { kind: 'item', id: 'coolant', day: 9 },
    { kind: 'accessory', id: 'cap' },
    { kind: 'scrip', n: -5 },
    'junk',
  ]);
  assert.deepEqual(box, [{ kind: 'scrip', n: 10, day: 1 }, { kind: 'item', id: 'coolant', day: 7 }, { kind: 'accessory', id: 'cap', day: 1 }]);
  assert.deepEqual(cleanRewardBox('x'), []);
  assert.equal(cleanRewardBox(Array(99).fill({ kind: 'scrip', n: 1, day: 1 })).length, CHECKIN.boxMax);
  assert.ok(TRANSFER_KEYS.includes('checkin') && TRANSFER_KEYS.includes('rewardBox'));
});
