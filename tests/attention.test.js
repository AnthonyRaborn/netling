import './helpers/utc.js';
// Attention rewards: requests, visitor greetings, flow and chatter. None of them costs a fault.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createScript, inFlow, migrate, requestMinutesLeft, tick, mulberry32, CFG, GAME_IDS, MIN } from '../src/sim.js';
import { CHATTER, CHATTER_GROUPS, chatterById, chatterPool, chatterProgress, visitorLines } from '../src/chatter.js';
import { cleanSave } from '../src/sanitize.js';

// Tests run with TZ=UTC: noon is awake.
const NOON = Date.UTC(2026, 8, 26, 12, 0);
const noRng = () => 0.999;

function booted() {
  const s = createScript({ now: NOON, rng: mulberry32(1) });
  s.quirk.sleepOffset = 0;
  s.trait = null;
  tick(s, NOON + (CFG.bootMinutes + 1) * MIN, noRng);
  return s;
}
const minutes = (s, m, rng = noRng) => tick(s, s.lastTick + m * MIN, rng);

// Runs fn with some CFG values swapped, then puts them back.
function withCfg(over, fn) {
  const old = Object.fromEntries(Object.keys(over).map((k) => [k, CFG[k]]));
  Object.assign(CFG, over);
  try {
    return fn();
  } finally {
    Object.assign(CFG, old);
  }
}
// Keeps it fed and cool, so only the rule under test matters.
const healthy = (s) => Object.assign(s.stats, { charge: 90, sync: 90, integrity: 100, heat: 20 });

// --- requests ---

test('a request names one game, and playing it answers the request', () => {
  const s = booted();
  healthy(s);
  withCfg({ requestChancePerHour: 60, chatterChancePerHour: 0 }, () => minutes(s, 1));
  assert.deepEqual(s.request, { kind: 'game', game: GAME_IDS.at(-1), startedAge: s.ageMin });
  assert.match(s.log.at(-1).msg, /wants to play/);
  const other = act(s, 'play', s.lastTick, noRng, { game: GAME_IDS[0], won: true });
  assert.equal(other.requestMet, false, 'a different game is not what it asked for');
  assert.ok(s.request);
  const res = act(s, 'play', s.lastTick, noRng, { game: s.request.game, won: false });
  assert.equal(res.requestMet, true, 'win or lose');
  assert.equal(s.request, null);
});

test('when warm it can ask for COOL instead, and COOL answers it', () => {
  const s = booted();
  healthy(s);
  s.stats.heat = 50;
  withCfg({ requestChancePerHour: 60, chatterChancePerHour: 0 }, () => minutes(s, 1, () => 0.1));
  assert.equal(s.request?.kind, 'cool');
  assert.equal(act(s, 'cool', s.lastTick).requestMet, true);
  assert.equal(s.request, null);
});

test('an unanswered request gives up quietly: no fault, no stat change', () => {
  const s = booted();
  healthy(s);
  withCfg({ requestChancePerHour: 60, chatterChancePerHour: 0 }, () => minutes(s, 1));
  assert.equal(requestMinutesLeft(s), CFG.requestWindowMin);
  const before = { mistakes: s.careMistakes, flagged: { ...s.flagged } };
  withCfg({ requestChancePerHour: 0 }, () => minutes(s, CFG.requestWindowMin));
  assert.equal(s.request, null);
  assert.ok(s.log.some((e) => /stopped asking/.test(e.msg)));
  assert.equal(s.careMistakes, before.mistakes);
  assert.deepEqual(s.flagged, before.flagged);
});

test('no requests while it rests, is low on Charge or has an event open; a nap clears one', () => {
  const [low, busy, napping] = [booted(), booted(), booted()];
  for (const s of [low, busy, napping]) healthy(s);
  low.stats.charge = CFG.requestMinCharge - 5;
  busy.event = { type: 'trace', startedAge: busy.ageMin };
  napping.request = { kind: 'game', game: 'tune', startedAge: napping.ageMin };
  act(napping, 'nap', napping.lastTick);
  withCfg({ requestChancePerHour: 60, chatterChancePerHour: 0 }, () => {
    for (const s of [low, busy, napping]) minutes(s, 1);
  });
  assert.equal(low.request, null, 'not enough Charge for a game');
  assert.equal(busy.request, null, 'an event comes first');
  assert.equal(napping.request, null, 'a nap ends it');
});

// --- visitors ---

test('visits last longer now, and GREET works once per visit', () => {
  assert.ok(CFG.visitMinMin >= 10 && CFG.visitMaxMin <= 20);
  const s = booted();
  assert.equal(act(s, 'greet', s.lastTick).ok, false, 'nobody is here');
  s.visit = { startedAge: s.ageMin, len: 15, form: 'daemon', palette: 1, accessory: null };
  const res = act(s, 'greet', s.lastTick, noRng);
  assert.equal(res.ok, true);
  assert.equal(res.greeted, true);
  assert.equal(s.visit.greeted, true);
  assert.equal(chatterById(s.chatter.id).group, 'visitor', 'the visitor passes on a line');
  assert.equal(act(s, 'greet', s.lastTick).ok, false, 'already said hello');
});

test('a greeted visitor leaves a stylish gift more often', () => {
  const leave = (greeted, roll) => {
    const s = booted();
    s.visit = { startedAge: s.ageMin, len: 1, form: 'daemon', palette: 1, accessory: null, greeted };
    let calls = 0;
    // The first roll is the infection check; the second is the accessory gift.
    minutes(s, 1, () => (++calls === 2 ? roll : 0.999));
    return s.visitAccGifts;
  };
  const between = (CFG.visitAccessoryChance + CFG.visitGreetedAccessoryChance) / 2;
  assert.equal(leave(false, between), 0);
  assert.equal(leave(true, between), 1);
});

// --- flow ---

test('flow comes after three good hours awake, and any lapse starts the count again', () => {
  const s = booted();
  s.flowMin = 0;
  for (let m = 0; m < CFG.flowAfterMin; m++) {
    healthy(s);
    minutes(s, 1);
  }
  assert.equal(inFlow(s), true);
  healthy(s);
  minutes(s, 10);
  assert.equal(s.flowTotalMin, 11, 'minutes in flow are counted for the life');
  s.stats.heat = CFG.flowMaxHeat + 5;
  minutes(s, 1);
  assert.equal(inFlow(s), false);
  assert.equal(s.flowMin, 0);
});

test('flow changes no stat, but leans it stable faster than plain uptime', () => {
  const a = booted();
  const b = booted();
  healthy(a);
  healthy(b);
  a.flowMin = CFG.flowAfterMin;
  minutes(a, 60);
  minutes(b, 60);
  assert.equal(inFlow(a), true);
  assert.deepEqual(a.stats, b.stats);
  assert.equal(a.axes.allegiance, b.axes.allegiance);
  const extra = CFG.flowStabilityPerHour - CFG.uptimeStabilityPerHour;
  assert.ok(Math.abs(a.axes.stability - b.axes.stability - extra) < 1e-9, `${a.axes.stability} vs ${b.axes.stability}`);
});

// --- chatter ---

test('chatter: a line from its own group shows for a while, then fades', () => {
  const s = booted();
  healthy(s);
  withCfg({ chatterChancePerHour: 60, requestChancePerHour: 0 }, () => minutes(s, 1));
  assert.ok(s.chatter);
  assert.equal(chatterById(s.chatter.id).group, 'bitling');
  withCfg({ chatterChancePerHour: 0 }, () => minutes(s, CFG.chatterShowMin));
  assert.equal(s.chatter, null);
});

test('the chatter pool follows the form and the inheritance', () => {
  const s = booted();
  assert.ok(chatterPool(s).every((c) => c.group === 'bitling'));
  s.form = 'glitch';
  s.trait = 'hardened';
  s.history = 'licensed';
  const ids = chatterPool(s).map((c) => c.id);
  assert.ok(ids.includes('gl-edge'));
  assert.ok(ids.includes('lin-hardened') && ids.includes('lin-history'));
  assert.ok(!ids.includes('lin-licensed'), 'only its own trait');
  assert.ok(!ids.some((id) => chatterById(id).group === 'visitor'), 'visitor lines come from visitors');
});

test('chatter content: unique ids, known groups, short lines, every group has lines', () => {
  const ids = CHATTER.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
  const groups = new Set(CHATTER_GROUPS.map((g) => g.id));
  for (const c of CHATTER) {
    assert.ok(groups.has(c.group), c.id);
    assert.ok(c.text.length <= 60, `${c.id} is ${c.text.length} characters`);
    assert.equal(c.group === 'lineage', typeof c.when === 'function', `${c.id}: lineage lines, and only they, have a condition`);
  }
  const prog = chatterProgress(['bit-hello', 'nope']);
  for (const g of CHATTER_GROUPS) assert.ok(prog[g.id].total > 0, g.id);
  assert.deepEqual(prog.bitling, { heard: 1, total: 5 });
  assert.ok(visitorLines().length >= 4);
});

// --- saves ---

test('the new fields default on old saves and are cleaned on load', () => {
  const s = booted();
  for (const k of ['request', 'flowMin', 'flowTotalMin', 'chatter']) delete s[k];
  migrate(s);
  assert.deepEqual([s.request, s.flowMin, s.flowTotalMin, s.chatter], [null, 0, 0, null]);

  const base = JSON.parse(JSON.stringify(s));
  const clean = (over) => cleanSave({ ...base, ...over }, s.lastTick + MIN);
  assert.deepEqual(clean({ request: { kind: 'game', game: 'tune', startedAge: 5 } }).request, { kind: 'game', game: 'tune', startedAge: 5 });
  assert.equal(clean({ request: { kind: 'game', game: 'chess', startedAge: 5 } }).request, null);
  assert.deepEqual(clean({ request: { kind: 'cool', game: 'x', startedAge: 5 } }).request, { kind: 'cool', startedAge: 5 });
  assert.equal(clean({ request: { kind: 'feed', startedAge: 5 } }).request, null);
  assert.deepEqual(clean({ chatter: { id: 'gh-seen', startedAge: 3 } }).chatter, { id: 'gh-seen', startedAge: 3 });
  assert.equal(clean({ chatter: { id: 'made-up', startedAge: 3 } }).chatter, null);
  assert.equal(clean({ flowMin: -4 }).flowMin, 0);
  assert.equal(clean({ flowTotalMin: 'lots' }).flowTotalMin, 0);
  const visit = { startedAge: s.ageMin, len: 12, form: 'ghost', palette: 2, accessory: null };
  assert.equal(clean({ visit: { ...visit, greeted: true } }).visit.greeted, true);
  assert.equal(clean({ visit: { ...visit, greeted: 'yes' } }).visit.greeted, undefined);
});
