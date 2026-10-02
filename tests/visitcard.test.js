import './helpers/utc.js';
// Visitor cards: a friend's netling as a code or link, queued on this device, dropping by within the hour.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createScript, friendFeat, friendHandle, migrate, tick, visitHidden, visitorName, mulberry32, CFG, MIN, SPECIES } from '../src/sim.js';
import { cardCodeFrom, cardFor, decodeCard, encodeCard, isCardText, queueCard, CardError, CARD_HASH, MAX_CARD_CHARS } from '../src/visitcard.js';
import { cleanCard, cleanProgress, cleanSave, GUESTBOOK_MAX } from '../src/sanitize.js';

const NOON = Date.UTC(2026, 8, 26, 12, 0);
const noRng = () => 0.999;

function booted({ rootAccess = false } = {}) {
  const s = createScript({ now: NOON, rng: mulberry32(1), rootAccess });
  s.quirk.sleepOffset = 0;
  s.trait = null;
  tick(s, NOON + (CFG.bootMinutes + 1) * MIN, noRng);
  Object.assign(s.stats, { charge: 100, sync: 90, integrity: 100, heat: 0 });
  return s;
}
const minutes = (s, m, rng = noRng) => tick(s, s.lastTick + m * MIN, rng);
// Every eligible minute rolls a hit: the friend comes at the first chance.
function lucky(fn) {
  const was = CFG.friendChancePerMin;
  CFG.friendChancePerMin = 1;
  try {
    return fn();
  } finally {
    CFG.friendChancePerMin = was;
  }
}
const card = (over = {}) => ({ id: '0badcafe', form: 'daemon', palette: 2, accessories: ['bowtie'], gen: 3, deep: 2, root: false, below: 0, ...over });

// --- the card ---

test('a card round-trips through its code, and its crc is its id', () => {
  const raw = { f: 'daemon', p: 3, a: ['bowtie', 'mustache'], g: 4, d: 5, r: true, x: 1 };
  const code = encodeCard(raw);
  assert.match(code, /^NV1\.[A-Za-z0-9_-]+\.[0-9a-f]{8}$/);
  assert.ok(code.length < 200, `short enough for a sparse QR: ${code.length}`);
  const c = decodeCard(code);
  assert.deepEqual(c, { id: code.split('.')[2], form: 'daemon', palette: 3, accessories: ['bowtie', 'mustache'], gen: 4, deep: 5, root: true, below: 1 });
  assert.equal(decodeCard(` ${code.slice(0, 20)}\n${code.slice(20)} `).id, c.id, 'whitespace from a pasted line break is ignored');
});

test('damaged, foreign and hostile cards are refused with a message', () => {
  const code = encodeCard({ f: 'daemon', p: 0, a: [], g: 1, d: 0, r: false, x: 0 });
  const [, body, crc] = code.split('.');
  for (const bad of ['', 'hello', `NL1.${body}.${crc}`, `NV1.${body}.00000000`, `NV1.${body.slice(0, -2)}.${crc}`, `NV1.${body}`, 'x'.repeat(MAX_CARD_CHARS + 1)]) {
    assert.throws(() => decodeCard(bad), CardError, JSON.stringify(bad.slice(0, 40)));
  }
  assert.throws(() => decodeCard(encodeCard({ f: 'dragon', p: 0, a: [], g: 1 })), /no netling/);
  assert.throws(() => decodeCard(encodeCard([1, 2])), CardError);
  // Unknown accessories, a second item for a filled slot, and silly numbers are repaired, not trusted.
  const c = decodeCard(encodeCard({ f: 'ghost', p: 999, a: ['bowtie', 'goldchain', 'nope', 'mustache'], g: -5, d: 'many', r: 'yes', x: 1e9 }));
  assert.deepEqual(c.accessories, ['bowtie', 'mustache']);
  assert.equal(c.gen, 1);
  assert.equal(c.deep, 0);
  assert.equal(c.root, false);
  assert.equal(c.below, 1e6);
  assert.ok(c.palette >= 0 && c.palette < 999);
});

test('a card comes from a hatched, living netling and what it wears', () => {
  const s = booted();
  s.stage = 'adult';
  s.form = 'daemon';
  const wardrobe = { body: 'bowtie', face: 'none', head: undefined, float: 'cursor', prop: 'nope' };
  const c = cardFor(s, wardrobe, { deepExits: 2, rootEarned: true, sourceExits: 1 });
  assert.deepEqual(c, { f: 'daemon', p: s.quirk.palette, a: ['bowtie', 'cursor'], g: s.generation, d: 2, r: true, x: 1 });
  assert.equal(cardFor({ ...s, stage: 'script' }), null);
  assert.equal(cardFor({ ...s, stage: 'dead' }), null);
  assert.equal(cardFor(null), null);
});

test('links and bare cards are both read from the paste box', () => {
  const code = encodeCard({ f: 'daemon', p: 0, a: [], g: 1, d: 0, r: false, x: 0 });
  const link = `https://example.org/netling/${CARD_HASH}${code}`;
  assert.equal(cardCodeFrom(link), code);
  assert.equal(cardCodeFrom(` ${code} `), code);
  assert.ok(isCardText(link) && isCardText(code));
  assert.ok(!isCardText('NL1.abc.def'), 'a save code goes to the transfer import');
});

test('the queue holds three cards, each once', () => {
  const s = { friends: [] };
  assert.equal(queueCard(s, card({ id: '00000001' }), 5, 3), 'queued');
  assert.equal(queueCard(s, card({ id: '00000001' }), 6, 3), 'already');
  assert.equal(queueCard(s, card({ id: '00000002' }), 7, 3), 'queued');
  assert.equal(queueCard(s, card({ id: '00000003' }), 8, 3), 'queued');
  assert.equal(queueCard(s, card({ id: '00000004' }), 9, 3), 'full');
  assert.deepEqual(s.friends.map((c) => [c.id, c.at]), [['00000001', 5], ['00000002', 7], ['00000003', 8]]);
  assert.equal(CFG.friendQueueMax, 3);
});

// --- the visit ---

test('a queued friend drops by within the hour, then plays like any visitor', () => {
  const s = booted();
  s.friends = [{ ...card(), at: s.lastTick }];
  minutes(s, CFG.friendWaitMaxMin - 1);
  assert.equal(s.visit, null, 'an unlucky roll every minute still waits');
  minutes(s, 1);
  assert.equal(s.visit?.form, 'daemon', 'and the hour is up');
  assert.deepEqual(s.visit.friend, { gen: 3, deep: 2, root: false, below: 0 });
  assert.deepEqual(s.visit.accessories, ['bowtie']);
  assert.deepEqual(s.friends, []);
  // It reads like a chat channel: a join with its feat, a line from it, and a quit.
  assert.deepEqual(s.log.slice(-2).map((e) => e.msg), ['--> daemon_g3 has joined #netling (gen 3, 2 deep exits)', '<daemon_g3> wearing a bow tie today']);
  const res = act(s, 'greet', s.lastTick, noRng);
  assert.equal(res.ok, true);
  assert.equal(res.msg, 'said hello to daemon_g3.');
  assert.deepEqual(res.friend, { form: 'daemon', gen: 3, deep: 2, root: false, below: 0 });
  minutes(s, CFG.visitMaxMin);
  assert.equal(s.visit, null, 'and logs off like any visitor');
  assert.match(s.log.at(-1).msg, /^<-- daemon_g3 has quit \((see you around|left .+)\)$/);

  // Sent away early (here by a nap), it drops its connection.
  const early = booted();
  early.friends = [{ ...card({ accessories: [] }), at: early.lastTick - 2 * 60 * MIN }];
  minutes(early, 1);
  assert.equal(early.log.at(-1).msg, '<daemon_g3> hi! want to play?');
  early.nap = { startedAge: early.ageMin, len: 30 };
  minutes(early, 1);
  assert.equal(early.visit, null);
  assert.equal(early.log.at(-1).msg, '<-- daemon_g3 has quit (connection reset)');
});

test("a friend's handle comes from its card, never typed", () => {
  assert.equal(friendHandle('daemon', 3, false), 'daemon_g3');
  assert.equal(friendHandle('plat', 12, false), 'plat_g12');
  assert.equal(friendHandle('plat', 5, true), '???_g5');
  for (const form of Object.keys(SPECIES)) assert.match(friendHandle(form, 1, false), /^[a-z0-9]+_g1$/, form);
});

test('a lucky roll brings a friend sooner; it never arrives while the netling is busy', () => {
  const s = booted();
  s.friends = [{ ...card(), at: s.lastTick }];
  lucky(() => minutes(s, 1));
  assert.equal(s.visit?.friend?.gen, 3);

  const busy = {
    rebooting: (x) => (x.rebootUntilAge = x.ageMin + 30),
    event: (x) => (x.event = { type: 'trace', startedAge: x.ageMin }),
    visitor: (x) => (x.visit = { startedAge: x.ageMin, len: 60, form: 'ghost', palette: 0, accessories: [] }),
  };
  for (const [why, set] of Object.entries(busy)) {
    const b = booted();
    b.friends = [{ ...card(), at: b.lastTick - 5 * 60 * MIN }];
    set(b);
    const before = b.visit;
    lucky(() => minutes(b, 1));
    assert.equal(b.friends.length, 1, `still waiting: ${why}`);
    assert.equal(b.visit, before);
  }
});

test('an empty queue rolls nothing, so play without cards is unchanged', () => {
  const s = booted();
  let calls = 0;
  const counting = () => (calls++, 0.999);
  const t = booted();
  let other = 0;
  t.friends = undefined;
  migrate(t);
  minutes(s, 30, counting);
  minutes(t, 30, () => (other++, 0.999));
  assert.equal(calls, other);
  assert.deepEqual(t.friends, []);
});

test('before Root Access a Mainframe friend is a corrupted record, and its Mainframe items stay behind', () => {
  const s = booted();
  s.friends = [{ ...card({ form: 'plat', accessories: ['checksum', 'mustache'], root: true, below: 2 }), at: s.lastTick }];
  lucky(() => minutes(s, 1));
  assert.equal(s.visit.form, 'plat');
  assert.ok(visitHidden(s, s.visit));
  assert.deepEqual(s.visit.accessories, [], 'nothing drawn on static');
  assert.equal(visitorName(s, s.visit), 'corrupted record');
  const lines = s.log.slice(-2).map((e) => e.msg);
  assert.equal(lines[0], '--> ???_g3 has joined #netling (gen 3, <<corrupted>>)');
  assert.match(lines[1], /^<\?\?\?_g3> r3c0rd c0rrupt3d/);
  for (const msg of lines) assert.ok(!/plat|checksum|root|below/i.test(msg.replace(/corrupted/g, '')), msg);
  assert.equal(act(s, 'greet', s.lastTick, noRng).msg, 'said hello to ???_g3.');

  const r = booted({ rootAccess: true });
  r.friends = [{ ...card({ form: 'plat', accessories: ['checksum', 'mustache'], root: true, below: 2 }), at: r.lastTick }];
  lucky(() => minutes(r, 1));
  assert.ok(!visitHidden(r, r.visit));
  assert.deepEqual(r.visit.accessories, ['checksum', 'mustache']);
  assert.deepEqual(r.log.slice(-2).map((e) => e.msg), ['--> plat_g3 has joined #netling (gen 3, 2 trips below the bottom)', '<plat_g3> wearing a checksum and mustache today']);

  // A base-form friend in a Mainframe item shows up, without the item.
  const b = booted();
  b.friends = [{ ...card({ accessories: ['checksum', 'mustache'] }), at: b.lastTick }];
  lucky(() => minutes(b, 1));
  assert.ok(!visitHidden(b, b.visit));
  assert.deepEqual(b.visit.accessories, ['mustache']);
});

test('the feat is the rarest thing the line has done, after its generation', () => {
  const f = (o) => ({ gen: 2, deep: 0, root: false, below: 0, ...o });
  assert.equal(friendFeat(f({}), false), 'gen 2');
  assert.equal(friendFeat(f({ deep: 1 }), false), 'gen 2, 1 deep exit');
  assert.equal(friendFeat(f({ deep: 4 }), false), 'gen 2, 4 deep exits');
  assert.equal(friendFeat(f({ deep: 4, root: true }), true), 'gen 2, root access');
  assert.equal(friendFeat(f({ deep: 4, root: true }), false), 'gen 2, <<corrupted>>');
  assert.equal(friendFeat(f({ root: true, below: 1 }), true), 'gen 2, 1 trip below the bottom');
  assert.equal(friendFeat(f({ root: true, below: 3 }), false), 'gen 2, <<corrupted>>');
});

test('invited friends still come after a new compile', () => {
  const friends = [{ ...card(), at: NOON }];
  assert.deepEqual(createScript({ now: NOON, generation: 2, rng: mulberry32(2), friends }).friends, friends);
  assert.deepEqual(createScript({ now: NOON, rng: mulberry32(2) }).friends, []);
});

// --- storage ---

test('stored queues, friend visits and guestbooks are cleaned', () => {
  const s = booted();
  const base = JSON.parse(JSON.stringify(s));
  const clean = (over) => cleanSave({ ...base, ...over }, s.lastTick + MIN);
  const ok = { ...card(), at: 123 };
  const friends = clean({ friends: [ok, ok, { ...card({ id: 'nothex!!' }), at: 1 }, { ...card({ form: 'dragon', id: '00000009' }), at: 1 }, { ...card({ id: '0000000a' }) }, { ...card({ id: '0000000b' }), at: 4 }, { ...card({ id: '0000000c' }), at: 5 }] }).friends;
  assert.deepEqual(friends.map((c) => c.id), ['0badcafe', '0000000a', '0000000b'], 'unique, valid, at most three');
  assert.equal(friends[0].at, 123);
  assert.equal(friends[1].at, s.lastTick + MIN, 'a missing time counts from now');
  assert.deepEqual(clean({ friends: 'lots' }).friends, []);

  const visit = { startedAge: s.ageMin, len: 12, form: 'ghost', palette: 2, accessories: [] };
  assert.deepEqual(clean({ visit: { ...visit, friend: { gen: 2, deep: -1, root: 1, below: 'x' } } }).visit.friend, { gen: 2, deep: 0, root: false, below: 0 });
  assert.equal(clean({ visit }).visit.friend, undefined);

  assert.equal(cleanCard({ ...card(), id: 7 }), null);
  const book = Array.from({ length: GUESTBOOK_MAX + 5 }, (_, i) => ({ at: i, form: 'daemon', gen: 1, deep: 0, root: false, below: 0 }));
  const p = cleanProgress({ guestbook: [...book, { at: 99, form: 'dragon' }, { form: 'daemon' }, 'x'] });
  assert.equal(p.guestbook.length, GUESTBOOK_MAX);
  assert.equal(p.guestbook.at(-1).at, GUESTBOOK_MAX + 4, 'the newest are kept');
  assert.equal(cleanProgress({}).guestbook, undefined);
});
