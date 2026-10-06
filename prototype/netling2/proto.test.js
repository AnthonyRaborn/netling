// Tests for the Netling 2.0 sprite prototype. Run with `npm run proto:test`. Not part of `npm test` (the prototype is not
// the shipped game). Deterministic: no clock, no randomness.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { forms, compose, ROLES, ROLE_FORM, SHARED } from './models.js';
import { ADULT_BODY, OVERLAYS, ANCHORS } from './art.js';
import { temperTell, band, EGGS, SLOT_MS, FRAME_MS } from './tell.js';
import { register, protoKey, MODELS } from './register.js';
import { spriteCells, silhouetteIou, poseDistance, markDistance, offScreen } from '../../tools/lib/sprite-checks.mjs';

const WIDTH = { baby: 12, teen: 14, adult: 16, elder: 18 };
const ADULTS = Object.values(ROLE_FORM);

// --- art ------------------------------------------------------------------------------------------------------------------
for (const model of MODELS) {
  const set = forms(model);
  test(`model ${model}: every sprite is rectangular, the right width, at most 15 rows, with known marks`, () => {
    for (const f of Object.values(set)) {
      for (const pose of ['a', 'b', 'sleep', 'dead']) {
        const rows = f[pose];
        assert.ok(rows.length >= 9 && rows.length <= 15, `${f.id}/${pose}: ${rows.length} rows`);
        assert.equal(new Set(rows.map((r) => r.length)).size, 1, `${f.id}/${pose}: ragged`);
        assert.equal(rows[0].length, WIDTH[f.stage], `${f.id}/${pose}: width`);
        assert.match(rows.join(''), /^[.#o+x]+$/, `${f.id}/${pose}: marks`);
        assert.equal(rows.length, f.a.length, `${f.id}/${pose}: same height as A`);
      }
    }
  });

  test(`model ${model}: anchors point at the head, the eyes and the body, and move at most one row between frames`, () => {
    for (const f of Object.values(set)) {
      for (const pose of ['a', 'b', 'sleep']) {
        const { headTop, eyeRow, mouthRow, neckRow } = f.anchors[pose];
        const sprite = f[pose];
        for (const r of [headTop, eyeRow, mouthRow, neckRow]) assert.ok(r >= 0 && r < sprite.length, `${f.id}/${pose}: anchor out of range`);
        assert.ok(headTop < eyeRow && eyeRow < mouthRow && mouthRow < neckRow, `${f.id}/${pose}: anchors out of order`);
        assert.ok(/[#o+x]/.test(sprite[headTop]), `${f.id}/${pose}: headTop row is empty`);
        const eyes = (pose === 'sleep' ? f.a : sprite)[eyeRow];
        assert.ok(eyes.includes('o'), `${f.id}/${pose}: no eye on eyeRow`);
      }
      for (const key of ['headTop', 'eyeRow', 'mouthRow', 'neckRow']) {
        assert.ok(Math.abs(f.anchors.a[key] - f.anchors.b[key]) <= 1, `${f.id}: ${key} moves more than a row`);
      }
    }
  });

  test(`model ${model}: the A and B frames differ, and the asleep and dead poses differ from A`, () => {
    for (const f of Object.values(set)) {
      assert.ok(poseDistance(f.a, f.b) >= 4, `${f.id}: A and B nearly identical`);
      assert.ok(poseDistance(f.a, f.sleep) + markDistance(f.a, f.sleep) > 0, `${f.id}: asleep pose`);
      assert.ok(poseDistance(f.a, f.dead) + markDistance(f.a, f.dead) > 0, `${f.id}: dead pose`);
      assert.equal(poseDistance(f.a, f.sleep), 0, `${f.id}: asleep keeps the body outline`);
    }
  });

  test(`model ${model}: the hidden third eye goes dark when asleep or dead`, () => {
    const g = set.guru;
    assert.ok(g.a[4].includes('oo'));
    assert.ok(!g.sleep[4].includes('o') && !g.dead[4].includes('o'));
  });
}

test('the two models share baby, teen and elder art and differ only in the five adults', () => {
  const A = forms('A');
  const B = forms('B');
  for (const stage of Object.keys(SHARED)) assert.deepEqual(A[stage].a, B[stage].a);
  for (const name of ADULTS) assert.notDeepEqual(A[name].a, B[name].a, `${name} should differ between models`);
});

test('compose merges, erases and rejects a mismatched overlay', () => {
  assert.deepEqual(compose(['###', '###'], ['.o.', '_..']), ['#o#', '.##']);
  assert.throws(() => compose(['###'], ['...', '...']));
  assert.equal(OVERLAYS.breach.a.length, ADULT_BODY.a.length);
});

test('every overlay is the body size, in both frames, and changes the body in each', () => {
  for (const role of ROLES) {
    for (const f of ['a', 'b']) {
      const ov = OVERLAYS[role][f];
      assert.equal(ov.length, ADULT_BODY[f].length);
      for (const row of ov) assert.equal(row.length, 16, `${role}/${f}: ragged overlay`);
      assert.ok(poseDistance(ADULT_BODY[f], compose(ADULT_BODY[f], ov)) >= 8, `${role}/${f}: overlay barely changes the body`);
    }
  }
});

// --- distinctness: the thing the two models trade off --------------------------------------------------------------------
function overlaps(model) {
  const set = forms(model);
  const out = [];
  for (let i = 0; i < ADULTS.length; i++) {
    for (let j = i + 1; j < ADULTS.length; j++) out.push({ pair: `${ADULTS[i]}/${ADULTS[j]}`, iou: silhouetteIou(set[ADULTS[i]].a, set[ADULTS[j]].a) });
  }
  return out.sort((x, y) => y.iou - x.iou);
}
test('the five adults are distinct by silhouette in both models (1.0 flags nothing above 0.82 within a stage)', () => {
  for (const model of MODELS) {
    const all = overlaps(model);
    const mean = all.reduce((n, x) => n + x.iou, 0) / all.length;
    const near = all.filter((x) => x.iou >= 0.8).length;
    console.log(`  model ${model}: closest adult pair ${all[0].pair} ${all[0].iou.toFixed(2)}, mean ${mean.toFixed(2)}, ${near} pair(s) at 0.80 or above`);
    assert.ok(all[0].iou < 0.82, `model ${model}: ${all[0].pair} overlap ${all[0].iou.toFixed(2)}`);
  }
});

// --- wearables: the real 1.0 code on the prototype sprites -----------------------------------------------------------------
// A wearable that clips on a 15 row prototype sprite is only a prototype problem if it does not clip on 1.0's own 15 row
// forms too (the holologo puts one pixel above the screen on every 15 row form, Chrome and Firewall included).
test('every 1.0 wearable stays on screen on every prototype form and pose, except where 1.0 already clips', async () => {
  const { SPRITES, ANCHOR_ROWS } = await import('../../src/sprites.js');
  const { SPECIES } = await import('../../src/sim.js');
  const tall = Object.keys(SPECIES).filter((f) => SPRITES[`${f}A`].length === 15);
  register(SPRITES, ANCHOR_ROWS);
  const { ACCESSORIES, placeWorn } = await import('../../src/accessories.js');
  const pal = { name: 'ice', main: '#05d9e8', accent: '#ff2a6d' };
  const wearables = ACCESSORIES.filter((a) => a.slot !== 'prop');
  assert.ok(wearables.length >= 30);
  const clips = (sprite, w, pose) => {
    const ox = Math.floor((40 - sprite[0].length) / 2);
    const oy = 20 - sprite.length;
    const placed = placeWorn([{ id: w.id }], sprite, { frame: pose === 'b' ? 1 : 0, time: 0, pal, minRow: -oy });
    return offScreen(placed.flatMap((p) => p.pts.map((q) => ({ x: ox + q.x, y: oy + q.y })))).length > 0;
  };
  const known = new Set(); // wearables that clip on a 1.0 form of 15 rows
  for (const f of tall) for (const w of wearables) if (clips(SPRITES[`${f}A`], w, 'a')) known.add(w.id);
  const bad = [];
  let cases = 0;
  let clipped = 0;
  for (const model of MODELS) {
    for (const f of Object.values(forms(model))) {
      for (const pose of ['a', 'b', 'sleep']) {
        const sprite = SPRITES[`${protoKey(model, f.id)}${pose === 'a' ? 'A' : pose === 'b' ? 'B' : 'Sleep'}`];
        for (const w of wearables) {
          cases++;
          if (!clips(sprite, w, pose)) continue;
          clipped++;
          if (sprite.length < 15 || !known.has(w.id)) bad.push(`${model}/${f.id}/${pose}/${w.id}`);
        }
      }
    }
  }
  console.log(`  ${cases} wearable cases, ${clipped} clip, all on 15 row sprites and all matching 1.0: ${[...known].join(', ') || 'none'}`);
  assert.deepEqual(bad, []);
});

// --- temper tell -----------------------------------------------------------------------------------------------------------
const TEMPERS = [0, 0.2, 0.5, 0.7, 1];
const sample = (egg, temper, seed, reduced, ms = 120_000, step = 10) => {
  const out = [];
  for (let t = 0; t < ms; t += step) out.push({ t, ...temperTell({ egg, temper, time: t, reduced, seed }) });
  return out;
};

test('the tell is a pure function of its inputs', () => {
  for (const egg of EGGS) assert.deepEqual(temperTell({ egg, temper: 0.8, time: 12345, seed: 3 }), temperTell({ egg, temper: 0.8, time: 12345, seed: 3 }));
});

test('temper bands: orderly below 0.35, volatile from 0.65', () => {
  assert.deepEqual([0, 0.34, 0.35, 0.64, 0.65, 1].map(band), ['orderly', 'orderly', 'mixed', 'mixed', 'volatile', 'volatile']);
});

test('an orderly netling keeps the 1.0 rhythm with no offset, in every egg', () => {
  for (const egg of ['iron', 'program']) {
    for (const s of sample(egg, 0.1, 0, false, 10_000, 50)) {
      assert.equal(s.frame, Math.floor(s.t / FRAME_MS) % 2);
      assert.deepEqual([s.dx, s.dy, s.shade], [0, 0, 1]);
    }
  }
});

test('flash budget: a frame never changes faster than every 200 ms, so nothing flashes more than three times a second', () => {
  for (const egg of EGGS) {
    for (const temper of TEMPERS) {
      for (const seed of [0, 1, 2, 3]) {
        const s = sample(egg, temper, seed, false);
        const changes = [];
        for (let i = 1; i < s.length; i++) if (s[i].frame !== s[i - 1].frame) changes.push(s[i].t);
        for (let i = 1; i < changes.length; i++) assert.ok(changes[i] - changes[i - 1] >= SLOT_MS, `${egg} t=${temper} seed ${seed}: frame changed after ${changes[i] - changes[i - 1]} ms`);
        // A flash is a pair of changes: at most six changes in any second.
        for (let i = 0; i < changes.length; i++) {
          const inWindow = changes.filter((c) => c >= changes[i] && c < changes[i] + 1000).length;
          assert.ok(inWindow <= 6, `${egg} t=${temper} seed ${seed}: ${inWindow} changes in a second`);
        }
      }
    }
  }
});

test('volatile Iron drifts at most two columns off its grid and snaps back; nothing moves a row', () => {
  for (const seed of [0, 1, 2]) {
    const s = sample('iron', 1, seed, false);
    assert.ok(s.every((x) => Math.abs(x.dx) <= 2 && x.dy === 0 && x.shade === 1));
    assert.ok(s.some((x) => x.dx !== 0), 'it should drift');
    for (let i = 1; i < s.length; i++) assert.ok(Math.abs(s[i].dx - s[i - 1].dx) <= 2);
    // Between snaps it moves one column at a time.
    const steps = s.filter((x, i) => i && Math.abs(x.dx) > Math.abs(s[i - 1].dx));
    assert.ok(steps.every((x) => x.t % 4000 > 0));
  }
});

test('volatile Program stutters and hops one row; volatile Wetware only pulses, gently and slowly', () => {
  const p = sample('program', 1, 0, false);
  assert.ok(p.some((x) => x.dy === -1) && p.every((x) => x.dx === 0 && x.dy >= -1 && x.shade === 1));
  const w = sample('wetware', 1, 0, false, 60_000, 10);
  assert.ok(w.every((x) => x.dx === 0 && x.dy === 0 && x.shade >= 0.75 - 1e-9 && x.shade <= 1 + 1e-9));
  assert.ok(Math.max(...w.map((x) => x.shade)) - Math.min(...w.map((x) => x.shade)) > 0.15, 'it should visibly pulse');
  for (let i = 1; i < w.length; i++) assert.ok(Math.abs(w[i].shade - w[i - 1].shade) < 0.01, 'no brightness jump');
});

test('reduced motion: no drift, hop or pulse, and a volatile netling keeps a still tell', () => {
  for (const egg of EGGS) {
    for (const seed of [0, 1]) {
      const v = sample(egg, 1, seed, true, 20_000, 50);
      const o = sample(egg, 0, seed, true, 20_000, 50);
      assert.ok(v.every((x) => x.dy === 0));
      if (egg === 'iron') assert.ok(v.every((x) => Math.abs(x.dx) === 1 && x.dx === v[0].dx) && o.every((x) => x.dx === 0));
      if (egg === 'program') assert.ok(v.every((x) => x.frame === 1) && o.some((x) => x.frame === 0));
      if (egg === 'wetware') assert.ok(v.every((x) => x.shade === 0.8) && o.every((x) => x.shade === 1));
    }
  }
});

test('the three eggs read differently at the same temper', () => {
  const key = (egg) => JSON.stringify(sample(egg, 1, 0, false, 8000, 100));
  assert.equal(new Set(EGGS.map(key)).size, 3);
});

test('anchor table covers every adult in both models', () => {
  for (const name of [...ADULTS, 'adultBody', 'baby', 'teen', 'elder']) assert.ok(ANCHORS[name], name);
  assert.ok(spriteCells(forms('B').guru.a).length > spriteCells(forms('B').munch.a).length);
});
