// Daily check-in and the reward box (docs/ATTENTION.md). Pure: the UI stores both per device.
// A check-in is due once the netling has woken for a new day since the last one was claimed (several mornings away
// count as one); the very first is due at once. Each claim steps a seven-day ladder that never resets: a missed day
// only pauses it, and after day seven it starts over. Rewards wait in the box until taken, so a full inventory, the
// scrip cap or a netling that is not there never loses one.
import { addScrip, grantItem, isAlive, INVENTORY_SLOTS, ITEMS, SCRIP } from './sim.js';
import { ACCESSORIES, RARITY } from './accessories.js';

export const CHECKIN = {
  days: 7,
  boxMax: 30, // entries kept in the box; a check-in waits (stays due) while it is full
  never: ['segfault'], // an item nobody wants as a present
  // One entry per day: scrip, an item of a price tier (0 cheapest), or an unowned accessory of some rarities
  // (with scrip instead once there is none left to give).
  ladder: [
    { scrip: 10 },
    { itemTier: 0 },
    { scrip: 25 },
    { itemTier: 1 },
    { accessory: ['common'], orScrip: 25 },
    { itemTier: 2 },
    { accessory: ['rare', 'veryrare'], orScrip: 40 },
  ],
};

// Items by price tier, cheapest first (from SCRIP.price), minus CHECKIN.never.
const TIERS = [...new Set(Object.values(SCRIP.price))].sort((a, b) => a - b).map((p) => Object.keys(SCRIP.price).filter((id) => SCRIP.price[id] === p && !CHECKIN.never.includes(id)));
export const checkinTier = (i) => TIERS[Math.min(i, TIERS.length - 1)];

// Accessories a check-in can give: found anywhere (no region), never earned ones, so exploring and events keep theirs.
export const CHECKIN_ACCESSORIES = ACCESSORIES.filter((x) => !x.regions && x.source !== 'earned').map((x) => x.id);

export const newCheckin = () => ({ day: 0, claimedAt: null, claims: 0 });

// Is a check-in due? checkin: { day, claimedAt }; state: the netling (its wokeAt: the last morning it woke).
export function checkinDue(checkin, state, box = []) {
  if (box.length >= CHECKIN.boxMax) return false;
  if (checkin.claimedAt == null) return true;
  return state?.wokeAt != null && state.wokeAt > checkin.claimedAt;
}

// What a ladder day gives. owned: accessory ids owned or already waiting in the box.
export function rollReward(day, owned, rng) {
  const step = CHECKIN.ladder[day % CHECKIN.days];
  if (step.scrip) return { kind: 'scrip', n: step.scrip };
  if (step.itemTier != null) {
    const pool = checkinTier(step.itemTier);
    return { kind: 'item', id: pool[Math.floor(rng() * pool.length)] };
  }
  const pool = CHECKIN_ACCESSORIES.filter((id) => !owned.includes(id) && step.accessory.includes(ACCESSORIES.find((x) => x.id === id).rarity));
  if (!pool.length) return { kind: 'scrip', n: step.orScrip };
  const total = pool.reduce((n, id) => n + RARITY[ACCESSORIES.find((x) => x.id === id).rarity].weight, 0);
  let r = rng() * total;
  for (const id of pool) if ((r -= RARITY[ACCESSORIES.find((x) => x.id === id).rarity].weight) < 0) return { kind: 'accessory', id };
  return { kind: 'accessory', id: pool[pool.length - 1] };
}

// Claims today's reward into the box. Returns { checkin, box, reward, day } (day is 1 to 7), or null if none is due.
export function claimCheckin(checkin, box, state, owned, rng, now) {
  if (!checkinDue(checkin, state, box)) return null;
  const waiting = box.filter((e) => e.kind === 'accessory').map((e) => e.id);
  const reward = { ...rollReward(checkin.day, [...owned, ...waiting], rng), day: (checkin.day % CHECKIN.days) + 1 };
  return {
    checkin: { day: (checkin.day + 1) % CHECKIN.days, claimedAt: now, claims: (checkin.claims ?? 0) + 1 },
    box: [...box, reward],
    reward,
    day: reward.day,
  };
}

// Why a box entry can't be taken now, or null. Accessories go to the shared collection, so they always can.
export function takeBlockReason(entry, state) {
  if (entry.kind === 'accessory') return null;
  if (!isAlive(state)) return 'no netling to give it to.';
  if (state.run) return 'finish the netrun first.';
  if (entry.kind === 'scrip' && (state.scrip ?? 0) >= SCRIP.max) return 'scrip is full.';
  if (entry.kind === 'item' && state.inventory.length >= INVENTORY_SLOTS) return 'inventory is full.';
  return null;
}

// Takes one box entry. Scrip over the cap stays in the box. Returns { box, msg, accessory? } or { msg } if refused.
export function takeFromBox(box, index, state) {
  const entry = box[index];
  if (!entry) return { msg: 'nothing there.' };
  const blocked = takeBlockReason(entry, state);
  if (blocked) return { msg: blocked };
  const rest = box.filter((_, i) => i !== index);
  if (entry.kind === 'accessory') return { box: rest, msg: 'added to your style.', accessory: entry.id };
  if (entry.kind === 'item') {
    grantItem(state, entry.id);
    return { box: rest, msg: `${ITEMS[entry.id].name.toLowerCase()} taken.` };
  }
  const room = SCRIP.max - (state.scrip ?? 0);
  const n = Math.min(room, entry.n);
  addScrip(state, n);
  const left = entry.n - n;
  return { box: left ? [...rest.slice(0, index), { ...entry, n: left }, ...rest.slice(index)] : rest, msg: `+${n} scrip.${left ? ` ${left} stays in the box.` : ''}` };
}

export function rewardLabel(entry) {
  if (entry.kind === 'scrip') return `${entry.n} scrip`;
  if (entry.kind === 'item') return ITEMS[entry.id].name;
  return ACCESSORIES.find((x) => x.id === entry.id).name;
}
