// The 2.0 perks, traits, keepsakes and the two new items (docs/NETLING_2_PERKS_TRAITS_DRAFTS.md), behind PERKS.on in the simulator fork.
// Deterministic: every test injects the clock and the rng.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createScript, tick, act, mulberry32, FORMS, KEEPSAKES, PERKS, PERK_MODS, TRAITS, TRAIT_CFG, ITEMS, SCRIP, CFG, MIN, fragmentOf } from './sim/sim.js';

const T0 = Date.UTC(2026, 0, 5, 8, 0); // 08:00 UTC, awake (the tests run with TZ=UTC)
const fresh = (form, extra = {}) => {
  const s = createScript({ now: T0, rng: mulberry32(1) });
  s.stage = 'adult';
  s.form = form;
  s.quirk.sleepOffset = 0;
  s.quirk.favPacket = 'none';
  s.lightsOn = true;
  s.stats = { charge: 20, sync: 50, integrity: 80, heat: 20 };
  Object.assign(s, extra);
  return s;
};
const on = (fn) => {
  PERKS.on = true;
  try {
    fn();
  } finally {
    PERKS.on = false;
  }
};
const high = () => 0.99;

test('off by default: no form carries a trait or keepsake, and no perk applies', () => {
  assert.equal(PERKS.on, false);
  assert.ok(Object.values(FORMS).every((f) => f.trait === null));
  assert.equal(KEEPSAKES.breachStreet, undefined);
  const s = fresh('feastCorp');
  act(s, 'corp', T0, high);
  assert.equal(s.stats.sync, 50, 'no Sync from the feed');
});

test('traits by role (hidden has its own) and one distinct keepsake per form', () => {
  on(() => {
    const want = { breachCorp: 'hardened', breachStreet: 'hardened', dodgeCorp: 'evasive', dodgeStreet: 'evasive', tuneCorp: 'persistent', tuneStreet: 'persistent', feastCorp: 'foraging', feastStreet: 'foraging', hidden: 'untraceable' };
    for (const [f, t] of Object.entries(want)) assert.equal(FORMS[f].trait, t, f);
    const kept = Object.keys(FORMS).map((f) => KEEPSAKES[f]);
    assert.equal(new Set(kept).size, 9, 'no two forms share a keepsake');
    for (const id of kept) assert.ok(ITEMS[id], `${id} is an item`);
    for (const t of new Set(Object.values(want))) assert.ok(TRAITS[t] && TRAIT_CFG.full[t] > 0 && TRAIT_CFG.cap[t] > 0, t);
    const f = fragmentOf(fresh('dodgeStreet'), 'dodgeStreet');
    assert.deepEqual([f.trait, f.keepsake], ['evasive', 'decoy']);
  });
});

test('the drain perks: Tune corp Charge, Tune street Sync, hidden both', () => {
  on(() => {
    const drained = (form) => {
      const s = fresh(form);
      s.stats = { charge: 80, sync: 80, integrity: 100, heat: 20 };
      tick(s, T0 + 10 * MIN, high);
      return [80 - s.stats.charge, 80 - s.stats.sync];
    };
    const base = drained('breachCorp');
    const near = (a, b) => assert.ok(Math.abs(a - b) < 0.02 * b + 0.005, `${a} vs ${b}`);
    near(drained('tuneCorp')[0], base[0] * 0.8);
    near(drained('tuneCorp')[1], base[1]);
    near(drained('tuneStreet')[1], base[1] * 0.8);
    near(drained('tuneStreet')[0], base[0]);
    near(drained('hidden')[0], base[0] * 0.85);
    near(drained('hidden')[1], base[1] * 0.85);
  });
});

test('infection perks: Breach street -30% on scavenged data, Feast street halves that roll, and the cure gives Breach corp 10 more', () => {
  on(() => {
    const scav = (form, u) => {
      const s = fresh(form);
      act(s, 'scav', T0, () => u);
      return s.virus;
    };
    assert.equal(scav('tuneCorp', 0.1), true, 'plain: 12%');
    assert.equal(scav('breachStreet', 0.1), false, '8.4%');
    assert.equal(scav('breachStreet', 0.08), true);
    assert.equal(scav('feastStreet', 0.07), false, '6%');
    assert.equal(scav('feastStreet', 0.05), true);
    const cure = (form) => {
      const s = fresh(form, { virus: true, virusMin: 5 });
      act(s, 'patch', T0, high);
      return s.stats.integrity;
    };
    assert.equal(cure('tuneCorp'), 90);
    assert.equal(cure('breachCorp'), 100);
  });
});

test('Feast corp: corp packets +5 Sync, scavenged data -5 Sync', () => {
  on(() => {
    const sync = (form, action) => {
      const s = fresh(form);
      act(s, action, T0, high);
      return s.stats.sync;
    };
    assert.equal(sync('feastCorp', 'corp') - sync('tuneCorp', 'corp'), 5);
    assert.equal(sync('feastCorp', 'scav') - sync('tuneCorp', 'scav'), -5);
  });
});

test('Dodge corp: corp traces 30% less often; Dodge street: intrusions 30% less often', () => {
  on(() => {
    // The per-minute chance of a trace is 0.08/60 and of an intrusion 0.04/60; Untraceable at strength 1 (0.6) pulls traces out of the way.
    const eventAfter = (form, u, extra = {}) => {
      const s = fresh(form, extra);
      s.stats = { charge: 80, sync: 80, integrity: 100, heat: 20 };
      tick(s, T0 + MIN, () => u);
      return s.event?.type ?? null;
    };
    assert.equal(eventAfter('tuneCorp', 0.001), 'trace', 'plain: 0.133% a minute');
    assert.equal(eventAfter('dodgeCorp', 0.001), null, '0.093%');
    const untrace = { trait: 'untraceable', traitLevel: 1 };
    assert.equal(eventAfter('tuneCorp', 0.0006, untrace), 'attack', 'plain: 0.067% a minute');
    assert.equal(eventAfter('dodgeStreet', 0.0006, untrace), null, '0.047%');
  });
});

test('Evasive gives timed events 25% more minutes; Foraging adds 25% to both packets', () => {
  on(() => {
    const window = (extra) => {
      const s = fresh('tuneCorp', extra);
      s.stats = { charge: 80, sync: 80, integrity: 100, heat: 20 };
      tick(s, T0 + MIN, () => 0.0001);
      return s.event.window;
    };
    const base = window({});
    assert.equal(window({ trait: 'evasive', traitLevel: 1 }), Math.round(base * 1.25));
    const gain = (extra, action) => {
      const s = fresh('tuneCorp', extra);
      act(s, action, T0, high);
      return s.stats.charge - 20;
    };
    assert.equal(gain({}, 'corp'), 30);
    assert.equal(gain({ trait: 'foraging', traitLevel: 1 }, 'corp'), 37.5);
    assert.equal(gain({ trait: 'foraging', traitLevel: 1 }, 'scav'), 31.25);
  });
});

test('Decoy waves off an intrusion (now or the next) and leans street; Salvage cell gives 50 Charge and leans street', () => {
  assert.ok(ITEMS.decoy && ITEMS.salvage);
  assert.equal(SCRIP.price.decoy, 25);
  assert.equal(SCRIP.price.salvage, 15);
  const now = fresh('tuneCorp', { inventory: ['decoy'], event: { type: 'attack', startedAge: 0, window: 10 } });
  const r = act(now, 'use', T0, high, { slot: 0 });
  assert.ok(r.ok);
  assert.deepEqual([now.event, now.standing.street, now.inventory.length], [null, 1, 0]);
  const later = fresh('tuneCorp', { inventory: ['decoy'] });
  act(later, 'use', T0, high, { slot: 0 });
  assert.equal(later.buffs.attackSkip, true);
  on(() => {});
  const salvage = fresh('tuneCorp', { inventory: ['salvage'] });
  act(salvage, 'use', T0, high, { slot: 0 });
  assert.deepEqual([salvage.stats.charge, salvage.standing.street, salvage.virus], [70, 1, false]);
  const bad = fresh('tuneCorp', { inventory: ['salvage'] });
  act(bad, 'use', T0, () => 0.05, { slot: 0 });
  assert.equal(bad.virus, true, 'a 12% infection chance like scavenged data');
  void CFG;
});
