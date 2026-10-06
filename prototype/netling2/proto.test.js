// Tests for the Netling 2.0 sprite prototype. Run with `npm run proto:test`. Not part of `npm test` (the prototype is not
// the shipped game). Deterministic: no clock, no randomness.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { forms, compose, FORMS, ADULT_IDS, TEEN_IDS, ROLES, roleForms, ids } from './models.js';
import { ADULT_BODY, TEEN_BODY, OVERLAYS, LEAN_OVERLAYS, TEEN_OVERLAYS, ANCHORS } from './art.js';
import { temperTell, levelOf, guardedLevel, THRESHOLDS, GUARD, EGGS, SLOT_MS, FRAME_MS } from './tell.js';
import { neglected, NEGLECT_LEVELS } from './neglect.js';
import { register, protoKey, MODELS } from './register.js';
import { overlaps, crossRole, siblings, authoring } from './metrics.js';
import { spriteCells, poseDistance, markDistance, offScreen } from '../../tools/lib/sprite-checks.mjs';

const WIDTH = { baby: 12, teen: 14, adult: 16, elder: 18 };

// --- the form table --------------------------------------------------------------------------------------------------------
test('the form table matches the sketch: baby, 3 teens, 9 adults (4 roles x 2 leans + hidden), elder', () => {
  assert.equal(ids('baby').length, 1);
  assert.equal(ids('elder').length, 1);
  assert.deepEqual(TEEN_IDS, ['teenCorp', 'teenStreet', 'teenHidden']);
  assert.equal(ADULT_IDS.length, 9);
  for (const role of ['breach', 'dodge', 'tune', 'feast']) assert.deepEqual(roleForms(role).map((id) => FORMS[id].lean), ['corp', 'street']);
  assert.deepEqual(roleForms('hidden'), ['guru']);
  assert.deepEqual(ROLES, ['breach', 'dodge', 'tune', 'feast', 'hidden']);
});

// --- art ------------------------------------------------------------------------------------------------------------------
for (const model of MODELS) {
  const set = forms(model);
  test(`model ${model}: every sprite is rectangular, the right width, 9 to 15 rows, with known marks`, () => {
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
        assert.ok((pose === 'sleep' ? f.a : sprite)[eyeRow].includes('o'), `${f.id}/${pose}: no eye on eyeRow`);
      }
      for (const key of ['headTop', 'eyeRow', 'mouthRow', 'neckRow']) assert.ok(Math.abs(f.anchors.a[key] - f.anchors.b[key]) <= 1, `${f.id}: ${key} moves more than a row`);
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

  test(`model ${model}: the hidden forms' third eye goes dark when asleep or dead`, () => {
    for (const id of ['guru', 'teenHidden']) {
      const f = set[id];
      const row = f.anchors.a.eyeRow - (id === 'guru' ? 1 : 1);
      assert.ok(f.a[row].includes('oo'), `${id}: third eye`);
      assert.ok(!f.sleep[row].includes('o') && !f.dead[row].includes('o'), `${id}: still lit`);
    }
  });

  test(`model ${model}: the two forms of a role and the three teens are visibly different, not copies`, () => {
    for (const role of ['breach', 'dodge', 'tune', 'feast']) {
      const [x, y] = roleForms(role);
      assert.ok(poseDistance(set[x].a, set[y].a) + markDistance(set[x].a, set[y].a) >= 6, `${x}/${y}`);
    }
    for (let i = 0; i < TEEN_IDS.length; i++) for (let j = i + 1; j < TEEN_IDS.length; j++) assert.ok(poseDistance(set[TEEN_IDS[i]].a, set[TEEN_IDS[j]].a) + markDistance(set[TEEN_IDS[i]].a, set[TEEN_IDS[j]].a) >= 6, `${TEEN_IDS[i]}/${TEEN_IDS[j]}`);
  });
}

test('the two models share baby and elder and differ in every teen and adult', () => {
  const A = forms('A');
  const B = forms('B');
  for (const id of ['baby', 'elder']) assert.deepEqual(A[id].a, B[id].a);
  for (const id of [...TEEN_IDS, ...ADULT_IDS]) assert.notDeepEqual(A[id].a, B[id].a, `${id} should differ between models`);
});

test('compose merges, erases and rejects a mismatched overlay', () => {
  assert.deepEqual(compose(['###', '###'], ['.o.', '_..']), ['#o#', '.##']);
  assert.throws(() => compose(['###'], ['...', '...']));
});

test('every overlay is its body size in both frames, and changes the body', () => {
  const check = (body, o, label) => {
    for (const f of ['a', 'b']) {
      assert.equal(o[f].length, body[f].length, `${label}/${f}`);
      for (const row of o[f]) assert.equal(row.length, body[f][0].length, `${label}/${f}: ragged overlay`);
      const merged = compose(body[f], o[f]);
      assert.ok(poseDistance(body[f], merged) + markDistance(body[f], merged) >= 4, `${label}/${f}: overlay barely changes the body`);
    }
  };
  for (const [k, o] of Object.entries(OVERLAYS)) check(ADULT_BODY, o, `role ${k}`);
  for (const [k, o] of Object.entries(LEAN_OVERLAYS)) check(ADULT_BODY, o, `lean ${k}`);
  for (const [k, o] of Object.entries(TEEN_OVERLAYS)) check(TEEN_BODY, o, `teen ${k}`);
});

// --- distinctness: what the two models trade off -------------------------------------------------------------------------
test('model B: every pair of adults of different roles stays under the 1.0 bar (0.82), and a role\'s two forms stay a family', () => {
  const cross = crossRole('B');
  const sib = siblings('B');
  console.log(`  model B cross-role: worst ${cross.worst.pair} ${cross.worst.iou.toFixed(2)}, mean ${cross.mean.toFixed(2)}, ${cross.near} at 0.80+; siblings ${sib.map((s) => `${s.pair} ${s.iou.toFixed(2)}`).join(', ')}`);
  assert.ok(cross.worst.iou < 0.82, `${cross.worst.pair} ${cross.worst.iou.toFixed(2)}`);
  for (const s of sib) assert.ok(s.iou < 0.9 && s.iou > 0.5, `${s.pair} ${s.iou.toFixed(2)}`);
});

test('model A: reports the same measures (no pass mark asserted: see docs/NETLING_2_SPRITES.md)', () => {
  const cross = crossRole('A');
  const sib = siblings('A');
  console.log(`  model A cross-role: worst ${cross.worst.pair} ${cross.worst.iou.toFixed(2)}, mean ${cross.mean.toFixed(2)}, ${cross.near} at 0.80+; siblings ${sib.map((s) => `${s.pair} ${s.iou.toFixed(2)}`).join(', ')}`);
  // The facts the write-up states.
  assert.ok(cross.worst.iou >= 0.82, 'model A now clears the bar: update the write-up');
  assert.ok(sib.every((s) => s.iou < 0.99), 'siblings must not be identical outlines');
  assert.ok(overlaps('A', ADULT_IDS).pairs.length === 36);
});

test('authoring cost: composed is a fraction of authored for the teens and adults', () => {
  const a = authoring('A');
  const b = authoring('B');
  console.log(`  hand-placed cells: A ${a.cells}, B ${b.cells}`);
  assert.ok(a.cells < b.cells / 3);
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

// --- neglect ---------------------------------------------------------------------------------------------------------------
test('neglect: level 0 is untouched; the outline, eyes and the rows above the mouth never change; only body cells rust', () => {
  for (const model of MODELS) {
    for (const f of Object.values(forms(model))) {
      for (const pose of ['a', 'b']) {
        const sprite = f[pose];
        const anchors = f.anchors[pose];
        assert.equal(neglected(sprite, anchors, 0, 3), sprite);
        for (const level of [1, 2]) {
          const n = neglected(sprite, anchors, level, 3);
          assert.equal(n.length, sprite.length);
          sprite.forEach((row, y) => {
            assert.equal(n[y].length, row.length);
            [...row].forEach((ch, x) => {
              assert.equal(n[y][x] === '.', ch === '.', `${f.id}: outline changed at ${x},${y}`);
              if (n[y][x] !== ch) {
                assert.ok(ch === '#' && n[y][x] === 'x' && y > anchors.mouthRow, `${f.id}: changed ${ch} at ${x},${y}`);
              }
            });
          });
        }
      }
    }
  }
});

test('neglect grows and clears without jumping: level 2 contains level 1, patches are deterministic, and the count rises', () => {
  for (const model of MODELS) {
    for (const f of Object.values(forms(model))) {
      const [l0, l1, l2] = NEGLECT_LEVELS.map((l) => neglected(f.a, f.anchors.a, l, 5));
      assert.deepEqual(neglected(f.a, f.anchors.a, 1, 5), l1);
      const patches = (s) => s.join('').split('x').length - 1;
      assert.ok(patches(l0) <= patches(l1) && patches(l1) < patches(l2), `${f.id}: ${patches(l0)} ${patches(l1)} ${patches(l2)}`);
      l1.forEach((row, y) => [...row].forEach((ch, x) => ch === 'x' && assert.equal(l2[y][x], 'x', `${f.id}: level 1 patch missing at level 2`)));
      assert.ok(patches(l2) - patches(l0) >= 3, `${f.id}: neglect barely visible`);
    }
  }
});

// --- temper tell -----------------------------------------------------------------------------------------------------------
const LEVELS = [-2, -1, 0, 1, 2];
const sample = (egg, level, seed, reduced, ms = 120_000, step = 10) => {
  const out = [];
  for (let t = 0; t < ms; t += step) out.push({ t, ...temperTell({ egg, level, time: t, reduced, seed }) });
  return out;
};

test('levels follow the sketch thresholds (-6, -2, +3, +6)', () => {
  assert.deepEqual(THRESHOLDS, [-6, -2, 3, 6]);
  assert.deepEqual([-20, -6.01, -6, -2.01, -2, 0, 2.99, 3, 5.99, 6, 17].map(levelOf), [-2, -2, -1, -1, 0, 0, 0, 1, 1, 2, 2]);
});

test('the flicker guard: temper hovering on a threshold does not flip the level', () => {
  for (const t of THRESHOLDS) {
    for (const start of [levelOf(t - 1), levelOf(t + 1)]) {
      let level = start;
      let flips = 0;
      for (let i = 0; i < 40; i++) {
        const next = guardedLevel(t + (i % 2 ? GUARD * 0.8 : -GUARD * 0.8), level);
        if (next !== level) flips++;
        level = next;
      }
      assert.equal(flips, 0, `threshold ${t}: flipped ${flips} times`);
    }
  }
  // It still moves once temper is clearly past a threshold, in both directions, and across several levels at once.
  assert.equal(guardedLevel(3 + GUARD, 0), 1);
  assert.equal(guardedLevel(3 - GUARD - 0.01, 1), 0);
  assert.equal(guardedLevel(-20, 2), -2);
  assert.equal(guardedLevel(20, -2), 2);
  for (const temper of [-9, -4, 0, 4.5, 9]) assert.equal(guardedLevel(temper, levelOf(temper)), levelOf(temper));
});

test('the tell is a pure function of its inputs', () => {
  for (const egg of EGGS) for (const level of LEVELS) assert.deepEqual(temperTell({ egg, level, time: 12345, seed: 3 }), temperTell({ egg, level, time: 12345, seed: 3 }));
});

test('the middle level has no tell: the 1.0 rhythm, no offset, full brightness', () => {
  for (const egg of EGGS) {
    for (const s of sample(egg, 0, 0, false, 10_000, 50)) {
      assert.equal(s.frame, Math.floor(s.t / FRAME_MS) % 2);
      assert.deepEqual([s.blink, s.dx, s.dy, s.shade], [false, 0, 0, 1]);
    }
  }
});

test('the steady beat is exact: the same move at the same interval every time, whatever the seed, and countable', () => {
  const interval = { 1: 6000, 2: 3000 };
  for (const egg of EGGS) {
    for (const level of [1, 2]) {
      const marks = (s) => (egg === 'iron' ? s.dy === 1 : egg === 'program' ? s.blink : s.shade < 1);
      const a = sample(egg, level, 0, false, 60_000, 10);
      const b = sample(egg, level, 99, false, 60_000, 10);
      assert.deepEqual(a, b, `${egg}/${level}: the steady tell must not depend on the seed`);
      const starts = a.filter((s, i) => marks(s) && (i === 0 || !marks(a[i - 1]))).map((s) => s.t);
      assert.ok(starts.length >= 60_000 / interval[level] - 1, `${egg}/${level}: ${starts.length} beats`);
      // Wetware's dip starts from full brightness, so its first sample below 1 is one step after the beat.
      const lag = egg === 'wetware' ? 10 : 0;
      starts.forEach((t, i) => assert.equal(t, i * interval[level] + lag, `${egg}/${level}: beat ${i} at ${t}`));
    }
  }
});

test('strongly steady beats twice as often as steady', () => {
  const beats = (egg, level) => {
    const s = sample(egg, level, 0, false, 60_000, 10);
    const on = (x) => (egg === 'iron' ? x.dy === 1 : egg === 'program' ? x.blink : x.shade < 1);
    return s.filter((x, i) => on(x) && (i === 0 || !on(s[i - 1]))).length;
  };
  for (const egg of EGGS) assert.equal(beats(egg, 2), beats(egg, 1) * 2);
});

test('flash budget: the picture never changes faster than every 200 ms, so nothing flashes more than three times a second', () => {
  for (const egg of EGGS) {
    for (const level of LEVELS) {
      for (const seed of [0, 1, 2, 3]) {
        for (const reduced of [false, true]) {
          const s = sample(egg, level, seed, reduced);
          // The pose a viewer sees: frame A, frame B, or the closed-eye blink.
          const look = (x) => (x.blink ? 'blink' : x.frame);
          const changes = [];
          for (let i = 1; i < s.length; i++) if (look(s[i]) !== look(s[i - 1])) changes.push(s[i].t);
          for (let i = 1; i < changes.length; i++) assert.ok(changes[i] - changes[i - 1] >= SLOT_MS, `${egg} L${level} seed ${seed}: changed after ${changes[i] - changes[i - 1]} ms`);
          // A flash is a pair of changes: at most six changes in any second.
          for (let i = 0; i < changes.length; i++) {
            const inWindow = changes.filter((c) => c >= changes[i] && c < changes[i] + 1000).length;
            assert.ok(inWindow <= 6, `${egg} L${level} seed ${seed}: ${inWindow} changes in a second`);
          }
        }
      }
    }
  }
});

test('unsteady Iron drifts at most two columns off its grid and snaps back; strongly unsteady drifts more than unsteady', () => {
  const drift = (level, seed) => sample('iron', level, seed, false);
  for (const seed of [0, 1, 2]) {
    for (const level of [-1, -2]) {
      const s = drift(level, seed);
      assert.ok(s.every((x) => Math.abs(x.dx) <= 2 && x.dy === 0 && x.shade === 1 && !x.blink));
      for (let i = 1; i < s.length; i++) assert.ok(Math.abs(s[i].dx - s[i - 1].dx) <= 2);
    }
    const moved = (level) => drift(level, seed).filter((x) => x.dx !== 0).length;
    assert.ok(moved(-2) > moved(-1) && moved(-1) > 0, `seed ${seed}`);
  }
});

test('unsteady Program stutters (more when strong) and hops one row only when strong; unsteady Wetware only pulses, gently and slowly', () => {
  const stutters = (level) => {
    const s = sample('program', level, 0, false);
    return s.filter((x, i) => i && x.frame !== s[i - 1].frame).length;
  };
  assert.ok(stutters(-2) > stutters(-1) && stutters(-1) > stutters(0));
  assert.ok(sample('program', -1, 0, false).every((x) => x.dy === 0));
  assert.ok(sample('program', -2, 0, false).some((x) => x.dy === -1));
  for (const level of [-1, -2]) {
    const w = sample('wetware', level, 0, false, 60_000, 10);
    assert.ok(w.every((x) => x.dx === 0 && x.dy === 0 && x.shade >= 0.75 - 1e-9 && x.shade <= 1 + 1e-9));
    assert.ok(Math.max(...w.map((x) => x.shade)) - Math.min(...w.map((x) => x.shade)) > 0.1, 'it should visibly pulse');
    for (let i = 1; i < w.length; i++) assert.ok(Math.abs(w[i].shade - w[i - 1].shade) < 0.01, 'no brightness jump');
  }
});

test('reduced motion: the unsteady levels keep a still tell; the steady beat is kept', () => {
  for (const egg of EGGS) {
    for (const seed of [0, 1]) {
      for (const level of [-1, -2]) {
        const v = sample(egg, level, seed, true, 20_000, 50);
        assert.ok(v.every((x) => x.dy === 0 && !x.blink));
        if (egg === 'iron') assert.ok(v.every((x) => Math.abs(x.dx) === 1 && x.dx === v[0].dx));
        if (egg === 'program') assert.ok(v.every((x) => x.frame === 1));
        if (egg === 'wetware') assert.ok(v.every((x) => x.shade === 0.8));
      }
    }
    assert.deepEqual(sample(egg, 1, 0, true, 20_000, 50), sample(egg, 1, 0, false, 20_000, 50));
  }
});

test('the three eggs read differently at the same level', () => {
  for (const level of [-2, 2]) {
    const key = (egg) => JSON.stringify(sample(egg, level, 0, false, 8000, 100));
    assert.equal(new Set(EGGS.map(key)).size, 3, `level ${level}`);
  }
});

test('the anchor table covers every form, and the shared bodies', () => {
  for (const id of [...Object.keys(FORMS), 'adultBody', 'teenBody']) assert.ok(ANCHORS[id], id);
  assert.ok(spriteCells(forms('B').guru.a).length > spriteCells(forms('B').munch.a).length);
});
