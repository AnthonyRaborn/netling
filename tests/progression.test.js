import './helpers/utc.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createScript, grantItem, migrate, mulberry32, tick, CFG, INVENTORY_SLOTS, ITEMS, MIN, SCRIP, sellValue } from '../src/sim.js';
import { cleanSave } from '../src/sanitize.js';
import { encodeSave, decodeSave } from '../src/transfer.js';
import { REGIONS, REGION_ORDER, clearedForStage, regionLock } from '../src/netrun/regions.js';
import { FRAGMENTS } from '../src/netrun/codex.js';
import {
  abortRun, atMarket, choose, codexRoom, disconnect, jackOut, moveTo, refreshMarket, resolveIce, runBlockReason, runOptions, sellItem, startRun, RUN_CFG,
} from '../src/netrun/run.js';

// Balance pass 2: regions open in order, the per-life codex cap, and corpo scrip.
const T0 = Date.UTC(2026, 8, 26, 12, 0);
const noRng = () => 0.999;
const always = () => 0;

function pet(stage = 'baby') {
  const s = createScript({ now: T0, rng: mulberry32(1) });
  s.quirk.sleepOffset = 0;
  tick(s, T0 + CFG.bootMinutes * MIN, noRng);
  s.stage = stage;
  s.stats.charge = 90;
  return s;
}

// Starts a run in `region` and turns the first step into a node of `type`.
function into(s, region, type, seed = 4) {
  startRun(s, region, mulberry32(seed));
  const next = runOptions(s.run)[0];
  next.type = type;
  return next;
}

// --- regions open in order ---

test('the way down: Public Net, Darknet Bazaar, Corp Grid, Old Web Ruins, The Deep', () => {
  assert.deepEqual(REGION_ORDER, ['public', 'bazaar', 'corp', 'ruins', 'deep']);
});

test('a new netling can only enter the Public Net', () => {
  const s = pet('adult');
  assert.deepEqual(s.cleared, []);
  assert.equal(runBlockReason(s, 'public'), null);
  assert.match(runBlockReason(s, 'bazaar'), /exit of the Public Net/);
  assert.match(runBlockReason(s, 'corp'), /exit of the Darknet Bazaar/);
  assert.match(runBlockReason(s, 'ruins'), /exit of the Corp Grid/);
});

test('reaching an exit opens the next region; stage gates still apply', () => {
  const s = pet('baby');
  moveTo(s, into(s, 'public', 'exit').id, noRng);
  assert.deepEqual(s.cleared, ['public']);
  assert.match(regionLock('bazaar', 'baby', [], s.cleared), /teen/, 'a baby still waits for the teen stage');
  assert.equal(regionLock('bazaar', 'teen', [], s.cleared), null);
  assert.match(regionLock('corp', 'teen', [], s.cleared), /Darknet Bazaar/);
  assert.match(s.run.messages.at(-2), /opens once it grows up/, 'a baby is told the Bazaar waits');
  const teen = pet('teen');
  teen.cleared = ['public'];
  moveTo(teen, into(teen, 'bazaar', 'exit').id, noRng);
  assert.match(teen.run.messages.at(-2), /Corp Grid is open to it/);
  teen.run = null;
  moveTo(teen, into(teen, 'corp', 'exit').id, noRng);
  assert.match(teen.run.messages.at(-2), /Old Web Ruins opens once it grows up/);
});

test('a second clear adds nothing, and the Deep still needs its fragment', () => {
  const s = pet('adult');
  s.cleared = ['public', 'bazaar', 'corp'];
  moveTo(s, into(s, 'ruins', 'exit').id, noRng);
  assert.deepEqual(s.cleared, ['public', 'bazaar', 'corp', 'ruins']);
  assert.doesNotMatch(s.run.messages.at(-2), /Deep/, 'never names the secret region');
  assert.match(regionLock('deep', 'adult', [], s.cleared), /hidden/);
  assert.equal(regionLock('deep', 'adult', ['ruins-4'], s.cleared), null);
  s.run = null;
  moveTo(s, into(s, 'ruins', 'exit').id, noRng);
  assert.deepEqual(s.cleared, ['public', 'bazaar', 'corp', 'ruins']);
});

test('only the exit clears a region: not a relay, a disconnect, or the tutorial', () => {
  const s = pet('teen');
  moveTo(s, into(s, 'public', 'relay').id, noRng);
  choose(s, 'out', noRng);
  assert.deepEqual(s.cleared, []);
  s.run = null;
  into(s, 'public', 'cache');
  disconnect(s, 'test.');
  assert.deepEqual(s.cleared, []);
  s.run = null;
  moveTo(s, into(s, 'tutorial', 'exit').id, noRng);
  assert.deepEqual(s.cleared, []);
});

test('netlings from before the unlock order keep every region their stage allows', () => {
  assert.deepEqual(clearedForStage('baby'), ['public']);
  assert.deepEqual(clearedForStage('teen'), ['public', 'bazaar', 'corp']);
  assert.deepEqual(clearedForStage('adult'), REGION_ORDER);
  assert.deepEqual(clearedForStage('script'), []);
  const s = pet('teen');
  delete s.cleared;
  migrate(s);
  assert.equal(runBlockReason(s, 'corp'), null, 'a teen that could run the Corp Grid still can');
  s.stage = 'adult';
  assert.equal(runBlockReason(s, 'ruins'), null, 'and the Ruins open when it grows up, as before');
});

test('stored clears are cleaned', () => {
  const base = JSON.parse(JSON.stringify(pet('teen')));
  const clean = (cleared) => cleanSave({ ...base, cleared }, T0 + 60 * MIN).cleared;
  assert.deepEqual(clean(undefined), ['public', 'bazaar', 'corp']);
  assert.deepEqual(clean(['corp', 'nowhere', 'public', 'corp', 7]), ['public', 'corp'], 'known ids, once, in order');
  assert.deepEqual(clean([]), []);
});

// --- the codex cap ---

test('a netling recovers at most eight new fragments in its life', () => {
  const s = pet('baby');
  s.codexFound = RUN_CFG.codexPerLife - 1;
  assert.equal(codexRoom(s), 1);
  moveTo(s, into(s, 'public', 'exit').id, always);
  assert.equal(s.codexFound, RUN_CFG.codexPerLife, 'banked on jack-out');
  assert.equal(s.codexInbox.length, 1);
  assert.equal(codexRoom(s), 0);
  s.run = null;
  s.codexInbox = [];
  const known = [...FRAGMENTS.filter((f) => f.region === 'public').slice(0, 1).map((f) => f.id)];
  startRun(s, 'public', mulberry32(4), known);
  const next = runOptions(s.run)[0];
  next.type = 'exit';
  moveTo(s, next.id, always);
  assert.deepEqual(s.codexInbox, []);
  assert.match(s.run.messages.at(-2), /memory is full/);
});

test('fragments found on a lost run do not count against the cap', () => {
  const s = pet('baby');
  s.codexFound = 3;
  into(s, 'public', 'cache');
  s.run.fragments = ['public-2'];
  assert.equal(codexRoom(s), RUN_CFG.codexPerLife - 4, 'this run holds a place while it lasts');
  abortRun(s);
  assert.equal(s.codexFound, 3);
});

test('the cap belongs to the netling: a new one starts at zero, and stored counts are cleaned', () => {
  assert.equal(createScript({ now: T0, rng: mulberry32(2) }).codexFound, 0);
  const base = JSON.parse(JSON.stringify(pet()));
  assert.equal(cleanSave({ ...base, codexFound: 5 }, T0 + 60 * MIN).codexFound, 5);
  assert.equal(cleanSave({ ...base, codexFound: -3 }, T0 + 60 * MIN).codexFound, 0);
  assert.equal(cleanSave({ ...base, codexFound: 'x' }, T0 + 60 * MIN).codexFound, 0);
  const old = pet();
  delete old.codexFound;
  assert.equal(migrate(old).codexFound, 0);
});

// --- scrip ---

test('prices follow rarity, and selling pays half at a market and a quarter elsewhere', () => {
  assert.equal(SCRIP.price.coolant, 15);
  assert.equal(SCRIP.price.segfault, 25);
  assert.equal(SCRIP.price.overclock, 50);
  assert.equal(sellValue('coolant', true), 7);
  assert.equal(sellValue('coolant'), 3);
  assert.equal(sellValue('overclock', true), 25);
  assert.equal(sellValue('overclock'), 12);
});

test('every item has a price, and every price sells for something', () => {
  for (const id of Object.keys(ITEMS)) {
    assert.ok(Number.isInteger(SCRIP.price[id]) && SCRIP.price[id] > 0, `${id} has no price`);
    assert.ok(sellValue(id) > 0, `${id} scraps for nothing`);
  }
  assert.ok(Math.max(...Object.values(SCRIP.price)) <= SCRIP.max, 'everything can be afforded');
});

test('SCRAP at home sells for a quarter', () => {
  const s = pet();
  s.inventory = ['blackice', 'coolant'];
  const res = act(s, 'discard', s.lastTick, noRng, { slot: 0 });
  assert.ok(res.ok);
  assert.deepEqual(s.inventory, ['coolant']);
  assert.equal(s.scrip, sellValue('blackice'));
  assert.match(res.msg, /scrapped for 6 scrip/);
});

test('a pickup that meets a full inventory is scrapped for scrip instead of lost', () => {
  const s = pet();
  s.inventory = Array(INVENTORY_SLOTS).fill('coolant');
  assert.match(grantItem(s, 'overclock'), /full: scrapped for 12 scrip/);
  assert.equal(s.scrip, 12);
  assert.equal(s.inventory.length, INVENTORY_SLOTS);
});

test('scrip stops at 100; the rest is lost', () => {
  const s = pet();
  s.scrip = 98;
  s.inventory = ['overclock'];
  const res = act(s, 'discard', s.lastTick, noRng, { slot: 0 });
  assert.equal(s.scrip, SCRIP.max);
  assert.match(res.msg, /scrip full/);
});

test('at a market an item sells for half, and what it can buy follows its scrip', () => {
  const s = pet();
  s.scrip = 0;
  s.inventory = ['overclock'];
  moveTo(s, into(s, 'public', 'market').id, noRng);
  assert.ok(atMarket(s));
  const buy = s.run.pending.options.find((o) => o.id === 'buy0');
  assert.equal(buy.disabled, true);
  assert.match(buy.hint, /needs \d+ scrip, has 0/);
  assert.equal(choose(s, 'buy0', noRng).ok, false);
  const res = sellItem(s, 0);
  assert.equal(res.value, 25);
  assert.equal(s.scrip, 25);
  assert.equal(buy.disabled, false, 'selling opens the purchase up');
  assert.ok(choose(s, 'buy0', noRng).ok);
  assert.ok(!atMarket(s));
});

test('a purchase also needs the charge', () => {
  const s = pet();
  s.scrip = SCRIP.max;
  moveTo(s, into(s, 'public', 'market').id, noRng);
  s.stats.charge = RUN_CFG.marketPrice + 5;
  refreshMarket(s);
  const buy = s.run.pending.options.find((o) => o.id === 'buy0');
  assert.equal(buy.disabled, true);
  assert.match(buy.hint, /charge/);
});

test('loose scrip is banked on jack-out and lost with the loot', () => {
  const s = pet();
  moveTo(s, into(s, 'public', 'exit').id, noRng);
  assert.equal(s.scrip, RUN_CFG.exitScrip);
  s.run = null;
  s.scrip = 0;
  moveTo(s, into(s, 'public', 'cache').id, (() => {
    const rolls = [0.99, 0.99, 0.99, 0]; // no fragment, no accessory, no item, loose scrip
    return () => rolls.shift() ?? 0.99;
  })());
  assert.equal(s.run.scrip, RUN_CFG.cacheScrip);
  disconnect(s, 'test.');
  assert.equal(s.scrip, 0);
});

test('the next generation inherits half, rounded down', () => {
  const s = pet('adult');
  s.form = 'daemon';
  s.scrip = 37;
  s.ageMin = s.life.lifespan - 1;
  tick(s, s.lastTick + 2 * MIN, noRng);
  assert.equal(s.stage, 'dead');
  assert.equal(s.fragment.scrip, 18);
  const child = createScript({ now: T0, rng: mulberry32(3), fragment: s.fragment, generation: 2 });
  assert.equal(child.scrip, 18);
  assert.equal(createScript({ now: T0, rng: mulberry32(3) }).scrip, 0);
});

test('stored scrip is cleaned: whole numbers from 0 to 100', () => {
  const base = JSON.parse(JSON.stringify(pet()));
  const clean = (scrip) => cleanSave({ ...base, scrip }, T0 + 60 * MIN).scrip;
  assert.equal(clean(40), 40);
  assert.equal(clean(1e9), SCRIP.max, 'never over the cap');
  assert.equal(clean(-5), 0);
  assert.equal(clean('50'), 0);
  assert.equal(clean(undefined), 0);
  const dead = { ...base, stage: 'dead', fragment: { form: 'chrome', trait: 'licensed', scrip: 500 } };
  assert.equal(cleanSave(dead, T0 + 60 * MIN).fragment.scrip, 50, 'an inheritance is never more than half the cap');
});

test('scrip, clears and the codex count survive a transfer code', async () => {
  const s = pet('teen');
  s.scrip = 42;
  s.cleared = ['public', 'bazaar'];
  s.codexFound = 6;
  const back = await decodeSave(await encodeSave({ save: s }));
  const clean = cleanSave(back.data.save, T0 + 60 * MIN);
  assert.equal(clean.scrip, 42);
  assert.deepEqual(clean.cleared, ['public', 'bazaar']);
  assert.equal(clean.codexFound, 6);
});

test('every region still names a real next region, and none opens itself', () => {
  for (const [i, id] of REGION_ORDER.entries()) {
    assert.ok(REGIONS[id]);
    if (i) assert.match(regionLock(id, 'adult', ['ruins-4'], REGION_ORDER.slice(0, i - 1)) ?? '', /first/);
  }
});

// --- second abilities ---

function adult(form) {
  const s = pet('adult');
  s.form = form;
  s.stats.charge = 100;
  s.stats.heat = 0;
  return s;
}

test('Chrome: corp insurance saves it from one disconnect a run', () => {
  const s = adult('chrome');
  into(s, 'deep', 'cache');
  s.run.phase = 'ice';
  s.run.pending = { game: 'breach' };
  s.stats.integrity = 1;
  resolveIce(s, false, noRng);
  assert.equal(s.run.phase, 'map', 'still running');
  assert.equal(s.stats.integrity, RUN_CFG.chromeInsurance);
  assert.match(s.run.messages.at(-1), /insurance/);
  s.run.phase = 'ice';
  s.run.pending = { game: 'breach' };
  s.stats.integrity = 1;
  assert.equal(resolveIce(s, false, noRng).result, 'disconnected', 'only once');
  const k = adult('kernel');
  into(k, 'public', 'cache');
  k.run.phase = 'ice';
  k.run.pending = { game: 'breach' };
  k.stats.integrity = 1;
  assert.equal(resolveIce(k, false, noRng).result, 'disconnected', 'nobody else is insured');
});

test('Chrome: corp relays patch it up; nobody else is patched', () => {
  const s = adult('chrome');
  s.stats.integrity = 40;
  moveTo(s, into(s, 'deep', 'relay').id, noRng);
  assert.ok(RUN_CFG.chromeRelayRepair > 0);
  assert.equal(s.stats.integrity, 40 + RUN_CFG.chromeRelayRepair);
  assert.equal(s.run.pending.kind, 'relay', 'still offers the jack-out');
  assert.match(s.run.messages.at(-1), /patched/);
  const f = adult('firewall');
  f.stats.integrity = 40;
  moveTo(f, into(f, 'deep', 'relay').id, noRng);
  assert.equal(f.stats.integrity, 40);
  const c = adult('chrome');
  c.stats.integrity = 95;
  moveTo(c, into(c, 'deep', 'relay').id, noRng);
  assert.equal(c.stats.integrity, 100, 'never above full');
  const t = pet('teen');
  t.form = 'kernel';
  t.stats.integrity = 40;
  t.stats.charge = 100;
  moveTo(t, into(t, 'corp', 'relay').id, noRng);
  assert.equal(t.stats.integrity, 40, 'only an adult Chrome');
});

test('Daemon: repairs a little Integrity with every move', () => {
  const s = adult('daemon');
  s.stats.integrity = 50;
  moveTo(s, into(s, 'deep', 'cache').id, noRng);
  assert.ok(RUN_CFG.daemonMoveRepair > 0);
  assert.equal(s.stats.integrity, 50 + RUN_CFG.daemonMoveRepair);
  const g = adult('glitch');
  g.stats.integrity = 50;
  moveTo(g, into(g, 'deep', 'cache').id, noRng);
  assert.equal(g.stats.integrity, 50);
});

test('Ghost: an ICE sometimes never notices it', () => {
  const s = adult('ghost');
  const res = moveTo(s, into(s, 'deep', 'ice').id, always);
  assert.equal(res.phased, true);
  assert.equal(s.run.phase, 'map');
  const t = adult('ghost');
  assert.equal(moveTo(t, into(t, 'deep', 'ice').id, noRng).game !== undefined, true, 'not every time');
});

test('Glitch: after the first ICE, the next ones are sometimes phased too', () => {
  const s = adult('glitch');
  into(s, 'deep', 'ice');
  s.run.phased = true; // the free one is spent
  const next = runOptions(s.run)[0];
  next.type = 'ice';
  assert.equal(moveTo(s, next.id, always).phased, true);
  const t = adult('glitch');
  into(t, 'deep', 'ice');
  t.run.phased = true;
  assert.ok(moveTo(t, runOptions(t.run)[0].id, noRng).game, 'not every time');
});

test('the insurance flag survives a reload', () => {
  const s = adult('chrome');
  into(s, 'deep', 'cache');
  s.run.insured = true;
  const back = cleanSave(JSON.parse(JSON.stringify(s)), T0 + 60 * MIN, { strict: true });
  assert.equal(back.run.insured, true);
});
