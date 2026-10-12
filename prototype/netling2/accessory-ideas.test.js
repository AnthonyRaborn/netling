// The style ideas' art drafts (accessory-ideas.js; docs/NETLING_2_ACCESSORY_IDEAS.md): every undrawn idea has art, the free and paid
// versions relate as the doc's Paid options say, nothing leaves the top of the 2.0 screen on any form, nothing toggles faster than the
// flash rule (CLAUDE.md rule 7), still items stay still, props stay inside their size, and the crests are 9x9.
import './ready.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ringCells, faceFeatures, faceMask, ringInside, FACE_MS, registerIdeas, IDEA_WEARABLES, IDEA_PROPS, IDEA_CRESTS, WEARABLE_ENTRIES, PROP_ENTRIES, HEATSINK_HOT, FREE } from './accessory-ideas.js';
import { ACCESSORIES, PROPS, placeWorn, anchorsFor } from '../../src/accessories.js';
import { FLASH_TOGGLE_MS } from '../../src/games/common.js';
import { composeLCD, exclusiveWorn, calmWorn } from './render.js';
import { forms } from './models.js';
import { programForms } from './program-models.js';
import { wetwareForms } from './wetware-models.js';
import { rogueForms } from './rogue-models.js';

registerIdeas();
const SETS = { iron: forms('B'), program: programForms(), wetware: wetwareForms(), rogue: rogueForms() };
const ALL = Object.entries(SETS).flatMap(([egg, set]) => Object.values(set).map((form) => ({ egg, form })));
const WEAR = [...WEARABLE_ENTRIES, HEATSINK_HOT];
const doc = readFileSync(new URL('../../docs/NETLING_2_ACCESSORY_IDEAS.md', import.meta.url), 'utf8');
// [id, paid] from the doc's tables, per section.
const rowsOf = (heading) => {
  const part = doc.split(`## ${heading}`)[1].split('\n## ')[0];
  return [...part.matchAll(/^\|[^|]*\(`(\w+)`\)[^\n]*\| ([a-z ()]+) \|$/gm)].map((m) => [m[1], m[2]]);
};
const pixels = (draw, ...args) => {
  const out = [];
  draw((x, y, c) => out.push(`${x},${y},${c}`), ...args);
  return out.sort().join(' ');
};
const wearPic = (e, sprite, time) => pixels((px, a, f, t) => e.draw(px, a, f, t, e.colors?.map(([, d]) => d)), anchorsFor(sprite), Math.floor(time / 500) % 2, time);
const propPic = (e, time) => pixels((px, f, t) => e.draw(px, f, t, null), Math.floor(time / 500) % 2, time);

test('every wearable, prop and crest idea in the doc has art, with the doc\'s Paid? value (the Laughing Man ring as the Light ring)', () => {
  const wear = ['Head', 'Face', 'Body', 'Float'].flatMap((h) => rowsOf(`${h} (`));
  const want = [...wear, ...rowsOf('Props (')];
  const have = new Map([...IDEA_WEARABLES, ...IDEA_PROPS].map((x) => [x.id, x.paid]));
  assert.equal(want.length, 36);
  for (const [id, paid] of want) assert.equal(have.get(id), paid, id);
  assert.equal(have.size, 36);
  const crests = doc.split('## Crests')[1].split('\n## ')[0];
  const crestIds = [...crests.matchAll(/\(`(\w+)`\)/g)].map((m) => m[1]);
  assert.deepEqual(IDEA_CRESTS.map((c) => c.id), crestIds);
});

test('split and paid ideas have a free and a paid version; a split\'s free one is exactly a frame of its animation', () => {
  for (const [entries, pic] of [[WEARABLE_ENTRIES, (e, t) => wearPic(e, SETS.iron.ironAdultBreachStreet.a, t)], [PROP_ENTRIES, propPic]]) {
    for (const e of entries.filter((x) => x.version === 'paid')) {
      const free = entries.find((x) => x.id === e.base + FREE);
      assert.ok(free, `${e.base} has a free version`);
      const still = new Set([0, 123, 777, 5000, 33_333].map((t) => pic(free, t)));
      assert.equal(still.size, 1, `${free.id} is still`);
      const frames = new Set();
      for (let t = 0; t < 30_000; t += 50) frames.add(pic(e, t));
      assert.ok(frames.size > 1 || e.paid === 'paid', `${e.id} moves`);
      if (e.paid === 'split') assert.ok(frames.has([...still][0]), `${free.id} is one of ${e.id}'s frames (the reduced-motion picture)`);
      else assert.ok(!frames.has([...still][0]), `${free.id} is a plainer drawing than ${e.id}`);
    }
    for (const e of entries.filter((x) => x.paid === 'split' || x.paid === 'paid')) assert.ok(['free', 'paid'].includes(e.version), e.id);
  }
});

test('the ideas are registered in 1.0\'s tables without clashing, and stay out of drops and visitor gifts', () => {
  for (const e of WEAR) assert.equal(ACCESSORIES.filter((x) => x.id === e.id).length, 1, e.id);
  for (const e of PROP_ENTRIES) assert.equal(PROPS.filter((x) => x.id === e.id).length, 1, e.id);
  for (const x of [...WEAR, ...PROP_ENTRIES]) assert.equal(ACCESSORIES.concat(PROPS).find((y) => y.id === x.id).source, 'earned', x.id);
});

test('no idea leaves the top of the 2.0 screen on any form, at the highest each frame stands in 1.0\'s idles at every temper level', () => {
  for (const { egg, form: f } of ALL) {
    const top = new Map();
    for (const level of [-2, 0, 2]) for (const idle of ['sway', 'hover', 'walk']) for (let t = 0; t < 30000; t += 100) {
      const w = composeLCD({ form: f, egg, level, idle, worn: [{ id: 'cap' }], seed: 7 }, t).ops.find((o) => o.op === 'worn');
      if (!w) continue;
      const k = `${w.sprite === f.a ? 'a' : 'b'}${w.frame}`;
      if (!(top.get(k) <= w.y)) top.set(k, w.y);
    }
    for (const [k, oy] of top) for (const e of WEAR) for (let t = 0; t < 30000; t += 400) {
      const ys = placeWorn([{ id: e.id }], k[0] === 'a' ? f.a : f.b, { frame: Number(k[1]), time: t })[0].pts.map((p) => p.y + oy);
      assert.ok(Math.min(...ys) >= 0, `${f.id} with ${e.id} (frame ${k}, ${t} ms): row ${Math.min(...ys)}`);
    }
  }
});

test('nothing toggles faster than the flash rule: every cell holds each colour at least FLASH_TOGGLE_MS', () => {
  const cellsAt = (draw) => {
    const m = new Map();
    draw((x, y, c) => m.set(`${x},${y}`, c));
    return m;
  };
  const check = (id, at) => {
    const STEP = 25;
    const seen = [];
    for (let t = 0; t < 40_000; t += STEP) seen.push(at(t));
    const keys = new Set(seen.flatMap((m) => [...m.keys()]));
    for (const k of keys) {
      let since = 0;
      let changes = 0;
      for (let i = 1; i < seen.length; i++) {
        if ((seen[i].get(k) ?? null) === (seen[i - 1].get(k) ?? null)) continue;
        if (changes++ > 0) assert.ok((i - since) * STEP >= FLASH_TOGGLE_MS, `${id} cell ${k} changes after ${(i - since) * STEP} ms`);
        since = i;
      }
    }
  };
  // 1.0's A/B frame is a 500 ms toggle; the ideas pass the renderer's frame with the time, as drawWorn does.
  for (const { form } of [ALL[0], ALL.find(({ form }) => form.id === 'wetwareElderFeastStreet')]) {
    const a = anchorsFor(form.a);
    for (const e of WEAR) check(e.id, (t) => cellsAt((px) => e.draw(px, a, Math.floor(t / 500) % 2, t, e.colors?.map(([, d]) => d))));
  }
  for (const e of PROP_ENTRIES) check(e.id, (t) => cellsAt((px) => e.draw(px, Math.floor(t / 500) % 2, t, null)));
});

test('the still ideas do not move between the A and B frames or over time', () => {
  const moving = new Set(['laughingring', 'catears', 'beanie', 'censorbar', 'padlock', 'jammer', 'petridish']);
  const sprite = SETS.program.programAdultTuneCorp.a;
  for (const e of WEAR.filter((x) => x.version !== 'paid' && !moving.has(x.base ?? x.id))) {
    const pics = new Set([0, 500, 1300, 9000].map((t) => wearPic(e, sprite, t)));
    assert.equal(pics.size, 1, `${e.id} is still`);
  }
  for (const e of PROP_ENTRIES.filter((x) => x.version !== 'paid' && !moving.has(x.base))) {
    assert.equal(new Set([0, 500, 1300, 9000].map((t) => propPic(e, t))).size, 1, `${e.id} is still`);
  }
});

test('props paint inside their size, and the Petri dish grows with its culture', () => {
  for (const e of PROP_ENTRIES) {
    const [w, h] = e.size;
    for (let t = 0; t < 20_000; t += 100) {
      e.draw((x, y) => assert.ok(x >= 0 && x < w && y >= 0 && y < h, `${e.id} paints ${x},${y} outside ${w}x${h}`), Math.floor(t / 500) % 2, t, null);
    }
  }
  const dish = PROP_ENTRIES.find((e) => e.id === 'petridish');
  const count = (growth) => pixels((px) => dish.draw(px, 0, 0, { growth })).split(' ').length;
  assert.ok(count(0) < count(0.5) && count(0.5) < count(1));
});

test('the crests are 9x9 of lit and dark cells', () => {
  for (const c of IDEA_CRESTS) {
    assert.equal(c.pixels.length, 9, c.id);
    for (const r of c.pixels) assert.match(r, /^[#.]{9}$/, c.id);
  }
});

test('the Light ring is one unbroken oval on every form: each cell touches the next, corners included, and it closes', () => {
  for (const { form } of ALL) {
    for (const sprite of [form.a, form.b]) {
      const cells = ringCells(anchorsFor(sprite));
      assert.ok(cells.length >= 12, `${form.id}: ${cells.length} cells`);
      assert.equal(new Set(cells.map(([x, y]) => `${x},${y}`)).size, cells.length, `${form.id}: no cell twice`);
      cells.forEach(([x, y], i) => {
        const [u, v] = cells[(i + 1) % cells.length];
        assert.ok(Math.abs(x - u) <= 1 && Math.abs(y - v) <= 1, `${form.id}: a gap after ${x},${y}`);
      });
    }
  }
});

test('the Light ring is worn alone on the face and over its area: other face items and anything on or inside it are not drawn', () => {
  const OUTFIT = [{ id: 'shades' }, { id: 'visor' }, { id: 'cap' }, { id: 'crown' }, { id: 'scarf' }, { id: 'halo' }, { id: 'dataaura' }];
  // Without the ring nothing is dropped (1.0's lists pass through).
  assert.deepEqual(exclusiveWorn(OUTFIT, SETS.iron.ironAdultBreachStreet.a), OUTFIT);
  let keptSomething = false;
  for (const { form } of ALL) {
    for (const time of [0, 1250, 4000]) {
      const list = [...OUTFIT, { id: 'laughingring' }];
      const kept = exclusiveWorn(list, form.a, { time });
      assert.ok(kept.some((w) => w.id === 'laughingring'), form.id);
      assert.ok(!kept.some((w) => w.id === 'shades' || w.id === 'visor'), `${form.id}: a face item is drawn with the ring`);
      // What is kept never touches the ring's area (its cells and what they enclose, row by row).
      const placed = placeWorn(list, form.a, { time });
      const ring = placed.find((p) => p.id === 'laughingring').pts;
      const rows = new Map();
      for (const { x, y } of ring) rows.set(y, [Math.min(x, rows.get(y)?.[0] ?? x), Math.max(x, rows.get(y)?.[1] ?? x)]);
      const inside = (x, y) => rows.has(y) && x >= rows.get(y)[0] && x <= rows.get(y)[1];
      for (const w of kept.filter((k) => k.id !== 'laughingring')) {
        keptSomething = true;
        assert.ok(!placed.find((p) => p.id === w.id).pts.some(({ x, y }) => inside(x, y)), `${form.id} at ${time}: ${w.id} overlaps the ring`);
      }
      // The composed screen draws the filtered list.
      const op = composeLCD({ form, egg: 'iron', idle: 'none', worn: list }, time).ops.find((o) => o.op === 'worn');
      assert.deepEqual(op.list, exclusiveWorn(list, op.sprite, { frame: op.frame, time, pal: op.pal }));
    }
  }
  assert.ok(keptSomething, 'something clear of the ring (the halo over the head) is still drawn on some form');
});

test('the Light ring\'s faces: on every form the eyes keep a clear row from the mouth and the cap, and every part shows', () => {
  for (const { form } of ALL) {
    for (const sprite of [form.a, form.b]) {
      for (const style of ['plain', 'cap']) {
        const f = faceFeatures(anchorsFor(sprite), style);
        assert.equal(f.eyes.length >= 2, true, `${form.id} ${style}: eyes`);
        assert.ok(f.mouth.length >= 3, `${form.id} ${style}: mouth`);
        if (style === 'cap') assert.ok(f.cap.length >= 3 && f.teeth.length >= 1, `${form.id}: cap and teeth`);
        const other = new Set([...f.mouth, ...f.cap, ...f.teeth].map(([x, y]) => `${x},${y}`));
        for (const [x, y] of f.eyes) for (const dx of [-1, 0, 1]) for (const dy of [-1, 0, 1]) assert.ok(!other.has(`${x + dx},${y + dy}`), `${form.id} ${style}: an eye at ${x},${y} touches the mouth or cap`);
      }
    }
  }
});

test('the face wipes in and out from right to left, every other lap (or third, on a small ring), and never cuts off', () => {
  for (const { form } of [ALL[0], ...ALL.filter(({ form }) => ['ironAdultBreachStreet', 'rogueAdultDodge', 'wetwareElderHidden'].includes(form.id))]) {
    const a = anchorsFor(form.a);
    const { x0, x1 } = ringInside(a);
    const lap = ringCells(a).length * 100;
    const total = FACE_MS.fill + FACE_MS.hold + FACE_MS.clear;
    const laps = Math.max(2, 1 + Math.ceil(total / lap));
    assert.ok(lap + total <= laps * lap, `${form.id}: the face fits its cycle`);
    const cols = (t) => {
      const m = faceMask(a, t);
      const out = [];
      if (m) for (let x = x0; x <= x1; x++) if (m(x)) out.push(x);
      return out;
    };
    assert.equal(faceMask(a, 0), null, 'no face in the first lap');
    assert.equal(faceMask(a, lap - 100), null);
    let prev = [];
    for (let t = lap; t < lap + FACE_MS.fill; t += 100) {
      const c = cols(t);
      assert.ok(c.length && c.at(-1) === x1 && c.length >= prev.length, `${form.id} at ${t}: fills from the right`);
      prev = c;
    }
    assert.equal(cols(lap + FACE_MS.fill).length, x1 - x0 + 1, 'full when the hold starts');
    prev = cols(lap + FACE_MS.fill);
    for (let t = lap + FACE_MS.fill + FACE_MS.hold; t < lap + total; t += 100) {
      const c = cols(t);
      assert.ok(c.length < prev.length && (!c.length || c[0] === x0), `${form.id} at ${t}: clears from the right`);
      prev = c;
    }
    assert.equal(faceMask(a, lap + total), null, 'gone after the clear');
    assert.ok(faceMask(a, laps * lap + lap + FACE_MS.fill), 'and back the next cycle');
  }
});

test('both versions of the Light ring draw a face; asleep, in a visit and with reduced motion the renderer draws the faceless ring', () => {
  const form = SETS.iron.ironAdultBreachStreet;
  const a = anchorsFor(form.a);
  const lap = ringCells(a).length * 100;
  const pic = (id, t) => pixels((px) => ACCESSORIES.find((x) => x.id === id).draw(px, a, 0, t));
  for (const id of ['laughingring', 'laughingring.cap']) assert.ok(pic(id, lap + 1000).split(' ').length > pic(id, 0).split(' ').length + 20, `${id} fills in`);
  assert.notEqual(pic('laughingring', lap + 1000), pic('laughingring.cap', lap + 1000), 'two different faces');
  for (const id of ['laughingring', 'laughingring.cap']) {
    assert.deepEqual(calmWorn([{ id }, { id: 'halo' }], { calm: true }), [{ id: 'laughingring.quiet' }, { id: 'halo' }]);
    assert.deepEqual(calmWorn([{ id }], { reduced: true }), [{ id: 'laughingring.still' }]);
    assert.deepEqual(calmWorn([{ id }]), [{ id }]);
  }
  const ringOnly = ringCells(a).length;
  for (let t = 0; t < 20_000; t += 100) assert.equal(pic('laughingring.quiet', t).split(' ').length, ringOnly, 'no face while quiet');
  assert.equal(new Set([0, 3000, 9999].map((t) => pic('laughingring.still', t))).size, 1, 'still with reduced motion');
  // Through the renderer: asleep, visiting and reduced all swap the ring.
  const op = (pet, opts) => composeLCD({ form, egg: 'iron', idle: 'none', worn: [{ id: 'laughingring.cap' }], ...pet }, lap + 1000, opts).ops.find((o) => o.op === 'worn').list[0].id;
  assert.equal(op({}), 'laughingring.cap');
  assert.equal(op({ pose: 'sleep' }), 'laughingring.quiet');
  assert.equal(op({ visit: true }), 'laughingring.quiet');
  assert.equal(op({}, { reduced: true }), 'laughingring.still');
});
