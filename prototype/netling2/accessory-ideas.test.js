// The style ideas' art drafts (accessory-ideas.js; docs/archive/netling2/ACCESSORY_IDEAS.md): every undrawn idea has art, the free and paid
// versions relate as the doc's Paid options say, nothing leaves the top of the 2.0 screen on any form, nothing toggles faster than the
// flash rule (CLAUDE.md rule 7), still items stay still, props stay inside their size, and the crests are 9x9.
import './ready.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ringCells, faceFeatures, faceMask, ringInside, FACE_MS, registerIdeas, IDEA_WEARABLES, IDEA_PROPS, IDEA_CRESTS, WEARABLE_ENTRIES, PROP_ENTRIES, HEATSINK_HOT, FREE, IDEA_ROOM, GLOW_1_0, LAMP_DIM, LAMP_BLOB_DARK } from './accessory-ideas.js';
import { ACCESSORIES, PROPS, PROP_FLOOR, ROOM, placeWorn, anchorsFor, accessoryColors } from '../../src/accessories.js';
import { PALETTES } from '../../src/sim.js';
import { COSMETICS } from '../../src/cosmetics.js';
import { registerPalettes } from './palettes.js';
import { deltaE } from '../../src/colors.js';
import { FLASH_TOGGLE_MS } from '../../src/games/common.js';
import { composeLCD, paintLCD, exclusiveWorn, calmWorn, LCD_W, LCD_H, TOP } from './render.js';
import { forms } from './models.js';
import { programForms } from './program-models.js';
import { wetwareForms } from './wetware-models.js';
import { rogueForms } from './rogue-models.js';

registerIdeas();
registerPalettes(); // the ideas' automatic colours for every palette, and the new palettes themselves
const SETS = { iron: forms('B'), program: programForms(), wetware: wetwareForms(), rogue: rogueForms() };
const ALL = Object.entries(SETS).flatMap(([egg, set]) => Object.values(set).map((form) => ({ egg, form })));
const WEAR = [...WEARABLE_ENTRIES, HEATSINK_HOT];
const doc = readFileSync(new URL('../../docs/archive/netling2/ACCESSORY_IDEAS.md', import.meta.url), 'utf8');
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

test('no idea blends into any palette: where a cell touches the body its colour is 30 apart from the body (the 1.0 blend swap, and the ring\'s own automatic colours)', () => {
  const times = [0, 800, 1600];
  for (const { form } of ALL) {
    for (const sprite of [form.a, form.b]) {
      const touches = (x, y) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => (sprite[y + dy]?.[x + dx] ?? '.') !== '.');
      for (const pal of PALETTES) {
        for (const e of WEAR) {
          for (const time of times) {
            for (const p of placeWorn([{ id: e.id }], sprite, { time, pal })[0].pts) {
              if (touches(p.x, p.y)) assert.ok(deltaE(p.color, pal.main) >= 30, `${form.id} ${pal.name} ${e.id} at ${p.x},${p.y}: ${p.color} blends into ${pal.main}`);
            }
          }
        }
      }
    }
  }
});

test('the body and float ideas make room: every version is in 1.0\'s ROOM table, and the room clears the hats and face items it is meant to', () => {
  const room = (e) => IDEA_ROOM[(e.base ?? e.id).replace(/\.hot$/, '')];
  for (const e of WEAR.filter((x) => room(x))) assert.equal(ROOM[e.id], room(e), e.id);
  // Every body and float idea that is not an orbiter has a rule, and a rule only where it is that slot's.
  for (const e of WEAR.filter((x) => (x.slot === 'body' || x.slot === 'float') && !x.orbits)) assert.ok(room(e), `${e.id} makes room`);
  for (const e of WEAR.filter((x) => x.orbits)) assert.equal(ROOM[e.id], undefined, `${e.id} orbits, so nothing makes room for it`);
  const sample = ALL.filter((_, i) => i % 3 === 0);
  const others = ACCESSORIES.filter((x) => !x.id.includes('.') && (x.slot === 'head' || x.slot === 'face') && !x.exclusive && !x.orbits && x.source !== 'earned');
  assert.ok(others.length > 15);
  const covered = (id, o, f) => {
    const w = placeWorn([{ id }, { id: o.id }], f.a, { time: 800, minRow: -99 });
    const set = new Set(w.find((x) => x.id === o.id).pts.map((p) => `${p.x},${p.y}`));
    return w.find((x) => x.id === id).pts.some((p) => set.has(`${p.x},${p.y}`));
  };
  const rate = (id) => {
    let hits = 0;
    let n = 0;
    for (const { form } of sample) for (const o of others) if (o.slot !== ACCESSORIES.find((x) => x.id === id).slot) { n++; if (covered(id, o, form)) hits++; }
    return hits / n;
  };
  // 1.0's own body items are the yardstick (the Scarf is covered 1.7% of the time on this sample, the Necktie 1.5%): none of the ideas more than 6%
  // (worst: the Notification badge, then the Visitor pass, which meet a wide hat or a low jaw item after the four rows ROOM allows).
  for (const e of WEAR.filter((x) => x.version !== 'paid' && room(x))) {
    const withRoom = rate(e.id);
    const saved = ROOM[e.id];
    delete ROOM[e.id];
    const without = rate(e.id);
    ROOM[e.id] = saved;
    assert.ok(withRoom < without, `${e.id}: room helps (${withRoom} against ${without})`);
    assert.ok(withRoom <= 0.06, `${e.id}: ${(withRoom * 100).toFixed(1)}% still covered`);
  }
});

test('the Lava lamp glows on the floor with the lights off when its switch is on, and is 1.0\'s dim prop when it is off', () => {
  const form = SETS.iron.ironAdultBreachStreet;
  const cellsOf = (pet, t = 1000) => {
    const cells = Array.from({ length: LCD_H }, () => Array(LCD_W).fill(null));
    const off = { y: 0 };
    const ctx = { fillStyle: null, globalAlpha: 1, save() {}, restore() { off.y = 0; }, translate(x, y) { off.y += y; }, fillRect(x, y) { const j = y + off.y; if (j >= 0 && j < LCD_H && x >= 0 && x < LCD_W) cells[j][x] = this.fillStyle; } };
    paintLCD(ctx, composeLCD({ form, egg: 'iron', idle: 'none', prop: 'lavalamp', lightsOn: false, ...pet }, t));
    return cells;
  };
  const prop = PROP_ENTRIES.find((e) => e.id === 'lavalamp');
  const [w, h] = prop.size;
  const ox = LCD_W - w - 2;
  const floor = PROP_FLOOR + TOP; // the row under the lamp's feet
  const on = cellsOf({});
  const off = cellsOf({ propGlow: false });
  // The pool: orange, faint, on the two floor rows, wider than the lamp, still there at every time.
  const pool = (cells) => cells.flatMap((row, y) => row.map((c, x) => [x, y, c])).filter(([, , c]) => typeof c === 'string' && c.startsWith('rgba(255,107,42,'));
  assert.ok(pool(on).length >= 12 && pool(off).length === 0);
  for (const [x, y, c] of pool(on)) {
    assert.ok(y === floor || y === floor + 1, `pool row ${y}`);
    assert.ok(x >= ox - 2 && x <= ox + w + 1, `pool column ${x}`);
    assert.ok(Number(c.slice(16, -1)) <= 0.22, `${c} stays faint`);
  }
  for (const t of [0, 800, 1600, 4000]) assert.equal(pool(cellsOf({}, t)).length, pool(on).length, 'the pool does not flicker');
  // The blobs stay lit in the dark with the glow on; with it off the whole lamp is the one dim colour.
  const lamp = (cells) => cells.slice(floor - h, floor).flatMap((row) => row.slice(ox, ox + w)).filter((c) => c);
  assert.ok(lamp(on).includes(LAMP_BLOB_DARK) && lamp(on).every((c) => c === LAMP_DIM || c === LAMP_BLOB_DARK));
  assert.ok(lamp(off).length > 0 && lamp(off).every((c) => c === '#1c3a3f'), 'switched off: 1.0\'s dim prop');
  // Lights on: the same as without the option, glow or not.
  assert.deepEqual(cellsOf({ lightsOn: true }), cellsOf({ lightsOn: true, propGlow: false }));
  // A prop with no glow (the Coffee mug) is untouched by the switch.
  assert.deepEqual(cellsOf({ prop: 'mug' }), cellsOf({ prop: 'mug', propGlow: false }));
  // The free (plain) lamp glows too, with its one resting blob.
  const plain = cellsOf({ prop: 'lavalamp.free' });
  assert.ok(pool(plain).length >= 12);
});

test('the Goggles, Hard hat, Hood and Dog tags are recolorable: every slot is drawn, defaults match the plain draw, and each palette has automatic colours', () => {
  const a = anchorsFor(SETS.iron.ironAdultBreachStreet.a);
  const paint = (e, colors) => pixels((px) => e.draw(px, a, 0, 0, colors));
  for (const id of ['goggles', 'hardhat', 'hood', 'dogtags']) {
    const e = ACCESSORIES.find((x) => x.id === id);
    assert.ok(e.colors?.length >= 2, `${id} is recolorable`);
    assert.equal(paint(e, e.colors.map(([, d]) => d)), paint(e, undefined), `${id}: defaults are the plain picture`);
    // Each slot shows: painting every slot a different sentinel puts each sentinel on screen.
    const sentinels = e.colors.map((_, i) => `#0${i + 1}0${i + 1}0${i + 1}`);
    const seen = paint(e, sentinels);
    sentinels.forEach((s, i) => assert.ok(seen.includes(s), `${id}: slot ${e.colors[i][0]} is drawn`));
    // Automatic colours exist for every palette, and a player's own pick overrides them.
    for (const pal of PALETTES) {
      const auto = accessoryColors(id, null, pal);
      assert.equal(auto.length, e.colors.length);
      for (const c of auto) assert.match(c, /^#[0-9a-f]{6}$/i, `${id} on ${pal.name}`);
    }
    assert.deepEqual(accessoryColors(id, e.colors.map(() => '#123456'), PALETTES[0]), e.colors.map(() => '#123456'));
  }
});

test('every prop with a glow (the lamp, cabinet, tower, terminal, dish, bowl, and the deck and boom box of 1.0) lights its own parts in the dark, throws a faint pool on the floor, and is 1.0\'s dim prop with the switch off', () => {
  const form = SETS.iron.ironAdultBreachStreet;
  const glowing = [...PROP_ENTRIES, ...PROPS.filter((p) => GLOW_1_0[p.id])].filter((e) => e.glowDraw);
  assert.deepEqual([...new Set(glowing.map((e) => e.base ?? e.id))].sort(), ['boombox', 'deck', 'fishbowl', 'lavalamp', 'minicab', 'petridish', 'servertower', 'terminal']);
  const paintDark = (id, pet, t) => {
    const cells = Array.from({ length: LCD_H }, () => Array(LCD_W).fill(null));
    const off = { y: 0 };
    const ctx = { fillStyle: null, globalAlpha: 1, save() {}, restore() { off.y = 0; }, translate(x, y) { off.y += y; }, fillRect(x, y) { const j = y + off.y; if (j >= 0 && j < LCD_H && x >= 0 && x < LCD_W) cells[j][x] = this.fillStyle; } };
    paintLCD(ctx, composeLCD({ form, egg: 'iron', idle: 'none', prop: id, lightsOn: false, ...pet }, t));
    return cells;
  };
  for (const e of glowing) {
    const [w, h] = e.size;
    const ox = LCD_W - w - 2;
    const floor = PROP_FLOOR + TOP;
    const isPool = (c) => typeof c === 'string' && c.startsWith('rgba(');
    for (const t of [0, 800, 1600, 3100, 6200]) {
      const on = paintDark(e.id, {}, t);
      const poolCells = on.flatMap((row, y) => row.map((c, x) => [x, y, c])).filter(([, , c]) => isPool(c));
      assert.ok(poolCells.length >= 12, `${e.id} at ${t}: a pool`);
      for (const [x, y, c] of poolCells) {
        assert.ok(y === floor || y === floor + 1, `${e.id}: pool row ${y}`);
        assert.ok(x >= ox - 2 && x <= ox + w + 1, `${e.id}: pool column ${x}`);
        assert.ok(Number(c.slice(c.lastIndexOf(',') + 1, -1)) <= 0.22, `${e.id}: ${c} stays faint`);
      }
      // Above the floor only the dim body and its lit parts: at least one colour that is not the dim one, and the body never goes blank.
      const body = on.slice(floor - h, floor).flatMap((row) => row.slice(ox, ox + w)).filter((c) => c);
      assert.ok(body.some((c) => c !== LAMP_DIM) && body.some((c) => c === LAMP_DIM), `${e.id} at ${t}: lit parts over a dim body`);
      // The switch off, or the lights on: 1.0's dim prop, no pool, and the same lights-on picture either way.
      const offCells = paintDark(e.id, { propGlow: false }, t);
      assert.ok(!offCells.flat().some(isPool));
      assert.ok(offCells.slice(floor - h, floor).flatMap((row) => row.slice(ox, ox + w)).filter((c) => c).every((c) => c === '#1c3a3f'), `${e.id}: switched off is dim`);
      assert.deepEqual(paintDark(e.id, { lightsOn: true }, t), paintDark(e.id, { lightsOn: true, propGlow: false }, t));
    }
  }
  // A paid prop's free picture has a glow only if it has a plainer one: the plain cabinet's screen is dark, so it has none.
  assert.ok(PROP_ENTRIES.find((e) => e.id === 'minicab.free') && !PROP_ENTRIES.find((e) => e.id === 'minicab.free').glowDraw);
  assert.ok(PROP_ENTRIES.find((e) => e.id === 'terminal.free').glowDraw && PROP_ENTRIES.find((e) => e.id === 'lavalamp.free').glowDraw);
  // A split prop's free glow is its animated glow at its still frame.
  const tower = PROP_ENTRIES.find((e) => e.id === 'servertower');
  const freeTower = PROP_ENTRIES.find((e) => e.id === 'servertower.free');
  assert.equal(pixels((px) => freeTower.glowDraw(px, 0, 9999, null)), pixels((px) => tower.glowDraw(px, 0, tower.stillAt, null)));
});

test('nothing in a glow toggles faster than the flash rule: every cell holds each colour at least FLASH_TOGGLE_MS', () => {
  for (const e of [...PROP_ENTRIES, ...PROPS.filter((p) => GLOW_1_0[p.id])].filter((x) => x.glowDraw)) {
    const seen = [];
    for (let t = 0; t < 40_000; t += 25) {
      const m = new Map();
      e.glowDraw((x, y, c) => m.set(`${x},${y}`, c), Math.floor(t / 500) % 2, t, null);
      seen.push(m);
    }
    for (const k of new Set(seen.flatMap((m) => [...m.keys()]))) {
      let since = 0;
      let changes = 0;
      for (let i = 1; i < seen.length; i++) {
        if ((seen[i].get(k) ?? null) === (seen[i - 1].get(k) ?? null)) continue;
        if (changes++ > 0) assert.ok((i - since) * 25 >= FLASH_TOGGLE_MS, `${e.id} glow cell ${k} changes after ${(i - since) * 25} ms`);
        since = i;
      }
    }
  }
});

test('the crests read as ten different shapes: none within 10 cells of another or of 1.0\'s, each 14 to 45 cells lit', () => {
  const ones = (rows) => rows.flatMap((r, y) => [...r].map((ch, x) => (ch === '#' ? y * 9 + x : -1))).filter((i) => i >= 0);
  const all = [...IDEA_CRESTS.map((c) => [c.id, c.pixels]), ...COSMETICS.crest.filter((c) => c.pixels).map((c) => [c.id, c.pixels])];
  assert.equal(IDEA_CRESTS.length, 10);
  for (const [id, rows] of all) assert.ok(ones(rows).length >= 14 && ones(rows).length <= 45, `${id}: ${ones(rows).length} cells lit`);
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const a = new Set(ones(all[i][1]));
      const b = new Set(ones(all[j][1]));
      const diff = [...a].filter((x) => !b.has(x)).length + [...b].filter((x) => !a.has(x)).length;
      assert.ok(diff >= 10, `${all[i][0]} and ${all[j][0]} differ by only ${diff} cells`);
    }
  }
});
