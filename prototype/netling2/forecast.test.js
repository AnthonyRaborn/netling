// The seeded future (sim/forecast.js): the forecast must equal what catch-up produces, because a notification must never announce an
// event that does not happen. Everything is deterministic: states come from seeded lives, the clock is injected.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createScript, migrate, tick, act, isAlive, MIN, STAGE } from './sim/sim.js';
import { mulberry32 } from '../../src/sim.js';
import { HORIZON_MS, newSeed, cleanSeed, rngFromSeed, forecast, replay, catchUp, notifications, itemsBetween } from './sim/forecast.js';

STAGE.on = true; // the stage tables and the rest call are decided for 2.0; the fork has them off by default
STAGE.rest.on = true;

const T0 = Date.UTC(2026, 0, 5, 9, 0, 0);
const H = 60 * MIN;

// A seeded, cared-for life played for `hours`, so the state at the end is alive and mid-life. The player feeds and plays now and then.
function lifeAt(lifeSeed, hours) {
  const rng = mulberry32(lifeSeed);
  const s = createScript({ now: T0, rng });
  for (let m = 0; m < hours * 60; m += 15) {
    const t = T0 + (m + 15) * MIN;
    tick(s, t, rng);
    if (s.stage === 'dead') break;
    for (const a of ['feed', 'play', 'cool', 'patch']) act(s, a, t, rng);
  }
  return s;
}

// The first seeded life whose 36 hour future (seed 9) has at least `n` care items, so the thinning has something to thin.
function lifeWithCare(n) {
  for (let i = 0; i < 60; i++) {
    const s = lifeAt(500 + i, 2 + (i % 10) * 3);
    if (isAlive(s) && replay(s, 9, s.lastTick + HORIZON_MS).filter((it) => it.class === 'care').length >= n) return s;
  }
  throw new Error('no life with care items');
}

const strip = (items) => items.map(({ t, class: c, kind }) => `${t}:${c}:${kind}`);
const nonCare = (items) => items.filter((i) => i.class !== 'care');

test('newSeed is a 32-bit unsigned integer from the injected source; cleanSeed drops anything else', () => {
  assert.equal(newSeed((a) => { a[0] = 0xdeadbeef; }), 0xdeadbeef);
  for (const v of [0, 1, 0xffffffff]) assert.equal(cleanSeed(v), v);
  for (const v of [-1, 1.5, 2 ** 32, '7', null, undefined, NaN, {}]) assert.equal(cleanSeed(v), null);
});

test('the save carries the seed: null by default, and migrate drops anything that is not a 32-bit integer', () => {
  const s = createScript({ now: T0, rng: mulberry32(1) });
  assert.equal(s.seed, null);
  for (const [bad, want] of [[5, 5], ['x', null], [-3, null], [2 ** 40, null], [undefined, null]]) {
    const m = migrate({ ...structuredClone(s), seed: bad });
    assert.equal(m.seed, want);
  }
});

test('stepping a minute at a time equals one tick over the same gap, so the forecast equals catch-up', () => {
  for (let i = 0; i < 6; i++) {
    const s = lifeAt(100 + i, 6 + i * 4);
    if (!isAlive(s)) continue;
    const seed = 7000 + i;
    const gap = (3 + i * 5) * H;
    const whole = structuredClone(s);
    catchUp(whole, s.lastTick + gap, seed);
    const stepped = structuredClone(s);
    const rng = rngFromSeed(seed);
    for (let m = 1; m <= gap / MIN; m++) tick(stepped, s.lastTick + m * MIN, rng);
    assert.deepEqual(stepped, whole);
  }
});

test('forecast items equal what catch-up produces, item by item, over many states and gaps', () => {
  let compared = 0;
  const kinds = new Set();
  for (let i = 0; i < 40; i++) {
    const s = lifeAt(500 + i, 2 + (i % 10) * 3);
    if (!isAlive(s)) continue;
    const seed = 91000 + i * 17;
    const before = JSON.stringify(s);
    const f = forecast(s, seed, { care: 'none' });
    assert.equal(JSON.stringify(s), before, 'forecast must not change the state');
    for (const gap of [20 * MIN, 5 * H, 13 * H + 7 * MIN, HORIZON_MS]) {
      const real = replay(s, seed, s.lastTick + gap); // the same minutes the reopened game would run
      assert.deepEqual(strip(nonCare(f.items).filter((it) => it.t <= s.lastTick + gap)), strip(nonCare(real)));
      const reopened = structuredClone(s);
      catchUp(reopened, s.lastTick + gap, seed);
      if (real.end.stage === 'dead') reopened.lastTick = real.end.lastTick; // tick() moves the clock to the end of the gap on death; the stepping stops at the death
      assert.deepEqual(reopened, real.end, 'catch-up ends where the forecast run ends');
      compared += real.length;
      for (const it of real) kinds.add(`${it.class}:${it.kind}`);
    }
  }
  assert.ok(compared > 50, `expected the lives to produce items to compare (got ${compared})`);
  assert.ok(kinds.size >= 3, `expected a few kinds of item, got ${[...kinds]}`);
});

test('a gap past the horizon still reproduces the first 36 hours exactly', () => {
  const s = lifeWithCare(2);
  const f = forecast(s, 9, { care: 'none' });
  assert.ok(f.items.length > 0);
  const longer = replay(s, 9, s.lastTick + HORIZON_MS + 12 * H).filter((it) => it.t <= f.to);
  assert.deepEqual(strip(nonCare(longer)), strip(f.items));
});

test('the same seed gives the same future and a different seed a different one', () => {
  let differed = 0;
  for (let i = 0; i < 20; i++) {
    const s = lifeAt(500 + i, 2 + (i % 10) * 3);
    if (!isAlive(s)) continue;
    const a = JSON.stringify(forecast(s, 1).items);
    assert.equal(JSON.stringify(forecast(s, 1).items), a);
    if ([2, 3, 4].some((seed) => JSON.stringify(forecast(s, seed).items) !== a)) differed++;
  }
  assert.ok(differed > 3, `another seed should change the future of most lives (${differed})`);
});

test('detection: each kind of item appears when its signal does, and only then', () => {
  const base = lifeAt(33, 14);
  Object.assign(base.stats, { charge: 80, sync: 80, integrity: 80, heat: 10 }); // healthy and awake: no alert stands to begin with
  base.asleep = false;
  base.lightsOn = false;
  base.cache = 0;
  base.virus = null;
  base.event = null;
  base.request = null;
  base.visit = null;
  base.call = null;
  const t = base.lastTick + MIN;
  const next = (edit) => { const n = structuredClone(base); edit(n); return n; };
  const kinds = (b, a) => itemsBetween(b, a, t).map((i) => `${i.class}:${i.kind}`);
  assert.deepEqual(kinds(base, base), []);
  assert.deepEqual(kinds(base, next((n) => { n.event = { type: 'trace', startedAge: n.ageMin, window: 60 }; })), ['event:trace']);
  const withEvent = next((n) => { n.event = { type: 'trace', startedAge: 1, window: 60 }; });
  assert.deepEqual(kinds(withEvent, withEvent), [], 'a standing event is not a new one');
  assert.deepEqual(kinds(withEvent, next((n) => { n.event = { type: 'trace', startedAge: 2, window: 60 }; })), ['event:trace'], 'a second event of the same type is new');
  assert.deepEqual(kinds(base, next((n) => { n.request = { kind: 'cool', startedAge: n.ageMin }; })), ['event:request']);
  assert.deepEqual(kinds(base, next((n) => { n.visit = { startedAge: n.ageMin, form: 'x' }; })), ['visit:visit']);
  assert.deepEqual(kinds(base, next((n) => { n.call = { startedAge: n.ageMin }; })), ['care:rest-call']);
  assert.deepEqual(kinds(base, next((n) => { n.contract = { kind: 'x', postedAge: n.ageMin }; })), ['cooldown:contract']);
  assert.deepEqual(kinds(base, next((n) => { n.form = 'teen'; n.stage = 'teen'; })), ['care:evolution']);
  assert.deepEqual(kinds(base, next((n) => { n.stats.charge = 5; })), ['care:charge']);
  const cooling = next((n) => { n.lastRunEndAge = n.ageMin - 1; });
  assert.deepEqual(kinds(cooling, next((n) => { n.lastRunEndAge = n.ageMin - 100000; })), ['cooldown:run-ready']);
});

test('care notices: only one is carried (the soonest by default), and none or the last on request', () => {
  const s = lifeWithCare(2);
  const all = replay(s, 9, s.lastTick + HORIZON_MS).filter((i) => i.class === 'care');
  assert.ok(all.length > 1, 'this life should have several care items to thin');
  const first = forecast(s, 9);
  assert.deepEqual(strip(first.items.filter((i) => i.class === 'care')), strip([all[0]]));
  assert.deepEqual(strip(forecast(s, 9, { care: 'last' }).items.filter((i) => i.class === 'care')), strip([all[all.length - 1]]));
  assert.equal(forecast(s, 9, { care: 'none' }).items.filter((i) => i.class === 'care').length, 0);
  // everything else is untouched by the thinning
  assert.deepEqual(strip(nonCare(first.items)), strip(nonCare(forecast(s, 9, { care: 'none' }).items)));
});

test('a hibernating or dead netling has an empty forecast', () => {
  const s = lifeAt(33, 14);
  const h = structuredClone(s);
  h.hibernation = { startedAt: s.lastTick };
  assert.deepEqual(forecast(h, 5).items, []);
  const d = structuredClone(s);
  d.stage = 'dead';
  assert.deepEqual(forecast(d, 5).items, []);
});

test('notifications: visitors never notify, Cooldowns are off by default, Events are capped at 6 in any rolling day', () => {
  const at = (n, c, k = 'x') => ({ t: T0 + n * H, class: c, kind: k });
  const items = [at(0, 'visit'), at(0, 'cooldown'), at(1, 'care'), ...Array.from({ length: 9 }, (_, i) => at(i + 2, 'event')), at(30, 'event')];
  const sent = notifications(items);
  assert.equal(sent.filter((i) => i.class === 'visit' || i.class === 'cooldown').length, 0);
  assert.equal(sent.filter((i) => i.class === 'event').length, 7); // 6 within the first day, then one more once the day has rolled over
  assert.equal(sent.filter((i) => i.class === 'care').length, 1);
  const withCooldowns = notifications(items, { enabled: { event: true, care: true, cooldown: true } });
  assert.equal(withCooldowns.filter((i) => i.class === 'cooldown').length, 1);
});
