// Netling 2.0: the seeded future (docs/netling2/DEPLOY.md, "The forecast and the seed"). Pure: no DOM, no storage, no clock, no Math.random.
//
// On going to the background the shell draws a seed (newSeed), stores it in the save and calls forecast() to learn what will happen while
// the app is closed. On reopening, catchUp() runs the elapsed time with the same seed, so it reproduces the forecast exactly; then the
// seed is discarded and every pending notification cancelled. The player cannot act while the app is closed, which is what makes the
// forecast exact. Known limit: the device's time zone (the wake rule reads it), so a zone change while closed can differ; reopening
// cancels and reschedules regardless.
import { MIN, alertReason, cleanSeed, runCooldownLeft, tick } from './sim.js';

export { cleanSeed };
import { mulberry32 } from '../../../src/sim.js';

export const HORIZON_MS = 36 * 60 * MIN;

// A 32-bit seed from an injected source of random bytes (the shell passes crypto.getRandomValues).
export function newSeed(getRandomValues) {
  const a = new Uint32Array(1);
  getRandomValues(a);
  return a[0] >>> 0;
}

export const rngFromSeed = (seed) => mulberry32(seed >>> 0);

// Care alerts (stat alerts, the cache, the virus) come from alertReason; its event keys are covered by the event item instead.
const CARE_ALERTS = new Set(['virus', 'charge', 'sync', 'heat', 'lights', 'cache']);

// What a state shows at one moment, as keys: a change from nothing (or to a new key) is an item.
function signals(s) {
  const alert = alertReason(s)?.key;
  return {
    event: s.event ? `${s.event.type}@${s.event.startedAge}` : null,
    request: s.request ? `${s.request.kind}@${s.request.startedAge}` : null,
    visit: s.visit ? `visit@${s.visit.startedAge ?? s.visit.form ?? s.ageMin}` : null,
    call: s.call ? `rest@${s.call.startedAge}` : null,
    contract: s.contract ? `${s.contract.kind}@${s.contract.postedAge}` : null,
    alert: CARE_ALERTS.has(alert) ? alert : null,
    form: `${s.stage}:${s.form}`,
    runReady: s.lastRunEndAge != null && runCooldownLeft(s) === 0,
  };
}

// The items between two signal sets at time t. Classes follow STAGE_CARE_DRAFTS 2.6: `event` (timed events and attention requests; the
// class the budget of 6 a day counts), `care` (rest calls, stat alerts, evolution), `cooldown` (a netrun ready, a contract posted) and
// `visit` (visitors never notify; listed so the whole future is there).
function diff(a, b, t) {
  const out = [];
  if (b.event && b.event !== a.event) out.push({ t, class: 'event', kind: b.event.split('@')[0] });
  if (b.request && b.request !== a.request) out.push({ t, class: 'event', kind: 'request' });
  if (b.visit && b.visit !== a.visit) out.push({ t, class: 'visit', kind: 'visit' });
  if (b.contract && b.contract !== a.contract) out.push({ t, class: 'cooldown', kind: 'contract' });
  if (b.runReady && !a.runReady) out.push({ t, class: 'cooldown', kind: 'run-ready' });
  if (b.call && b.call !== a.call) out.push({ t, class: 'care', kind: 'rest-call' });
  if (b.alert && b.alert !== a.alert) out.push({ t, class: 'care', kind: b.alert });
  if (b.form !== a.form) out.push({ t, class: 'care', kind: 'evolution' });
  return out;
}

// The items that appear between two states one step apart, at time t (the detection rules, exported so they can be tested on built states).
export const itemsBetween = (before, after, t) => diff(signals(before), signals(after), t);

// Run the same minutes the real game would, on a copy, one step at a time. Yields each minute's items; the copy is `run.state`.
function minutes(state, to, rng) {
  const run = { state: structuredClone(state) };
  run.steps = (function* () {
    const c = run.state;
    let prev = signals(c);
    while (c.lastTick + MIN <= to && c.stage !== 'dead' && !c.hibernation) {
      tick(c, c.lastTick + MIN, rng);
      const cur = signals(c);
      yield diff(prev, cur, c.lastTick);
      prev = cur;
    }
  })();
  return run;
}

// The future from `state` for `horizonMs`, as `{ seed, from, to, items }`. Every item is kept except care notices: of those only one is
// carried (`care`: 'first', the soonest, is the default; 'last' keeps the final one; 'none' drops them). Never changes `state`.
export function forecast(state, seed, { horizonMs = HORIZON_MS, care = 'first' } = {}) {
  const from = state.lastTick;
  const to = from + horizonMs;
  const items = [];
  const careItems = [];
  for (const batch of minutes(state, to, rngFromSeed(seed)).steps) {
    for (const it of batch) (it.class === 'care' ? careItems : items).push(it);
  }
  if (care !== 'none' && careItems.length) items.push(care === 'last' ? careItems[careItems.length - 1] : careItems[0]);
  items.sort((x, y) => x.t - y.t);
  return { seed, from, to, items };
}

// Every item up to `now` that the real game produces from `state` with this seed, without thinning (what the forecast is checked
// against). The state it is given is not changed.
export function replay(state, seed, now) {
  const items = [];
  const run = minutes(state, now, rngFromSeed(seed));
  for (const batch of run.steps) items.push(...batch);
  items.end = run.state; // the state the stepping ended in, to compare with catchUp's
  return items;
}

// Reopening: run the elapsed time with the stored seed, in place. Past the horizon the same stream keeps going (no notifications for
// that time). Returns the state.
export function catchUp(state, now, seed) {
  return tick(state, now, rngFromSeed(seed));
}

// Which forecast items notify, and when: the Events class (budget `perDay`, default 6, counted per rolling 24 hours) and Care are
// on by default, Cooldowns are off, visitors never notify. `enabled` overrides the class switches.
export function notifications(items, { perDay = 6, enabled = { event: true, care: true, cooldown: false } } = {}) {
  const sent = [];
  const events = [];
  for (const it of items) {
    if (it.class === 'visit' || !enabled[it.class]) continue;
    if (it.class === 'event') {
      while (events.length && events[0] <= it.t - 24 * 60 * MIN) events.shift();
      if (events.length >= perDay) continue;
      events.push(it.t);
    }
    sent.push(it);
  }
  return sent;
}
