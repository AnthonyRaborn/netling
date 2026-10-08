// The hidden elders' echo layers (echo-motion.js): Whisper's fork lag and Init's ratchet trail, registered as `motion` like Cipher's dub. Layers
// over the sprite: the registered frames are untouched, and the layer is pure, 12 steps of 400 ms, whole-figure, and still under reduced motion.
import './ready.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { forms } from './models.js';
import { programForms } from './program-models.js';
import { wetwareForms } from './wetware-models.js';
import { ECHO, PAD, STEPS, STEP_MS, PROGRAM_OPTIONS, IRON_OPTIONS, whisperEcho, initEcho } from './echo-motion.js';

const whisper = programForms().programElderHidden;
const init = forms('B').ironElderHidden;
const at = (f, step, o = {}) => f.motion(f.a, f.anchors.a, { time: step * STEP_MS, ...o });
const countEcho = (rows) => rows.join('').split('').filter((c) => c === ECHO.cell).length;
const original = (f) => f.a.join('').split('').filter((c) => c === ECHO.cell).length;

test('the picks are registered on the two hidden elders only, and the other options stay available', () => {
  assert.equal(whisper.motion, whisperEcho);
  assert.equal(init.motion, initEcho);
  assert.equal(whisperEcho, PROGRAM_OPTIONS.fork.fn);
  assert.equal(initEcho, IRON_OPTIONS.ratchet.fn);
  for (const set of [forms('B'), programForms(), wetwareForms()]) {
    for (const f of Object.values(set)) if (!['ironElderHidden', 'programElderHidden', 'wetwareElderHidden'].includes(f.id)) assert.equal(f.motion, undefined, f.id);
  }
});

test('the registered frames are untouched: the layer is applied on top of them', () => {
  assert.equal(whisper.a[0].length, 14);
  assert.equal(init.a[0].length, 18);
  for (const f of [whisper, init]) {
    const before = JSON.stringify([f.a, f.b, f.sleep, f.dead]);
    at(f, 5);
    assert.equal(JSON.stringify([f.a, f.b, f.sleep, f.dead]), before);
  }
});

test('12 steps of 400 ms that loop, a pure function, with no picture change faster than a step', () => {
  assert.equal(STEPS, 12);
  assert.equal(STEP_MS, 400);
  for (const f of [whisper, init]) {
    for (let s = 0; s < STEPS; s++) {
      assert.deepEqual(at(f, s), at(f, s + STEPS), `${f.id} loops at step ${s}`);
      assert.deepEqual(at(f, s), f.motion(f.a, f.anchors.a, { time: s * STEP_MS + STEP_MS - 1 }), `${f.id} holds for the whole step ${s}`);
    }
    assert.ok(new Set(Array.from({ length: STEPS }, (_, s) => at(f, s).join('\n'))).size >= 4, `${f.id}: the loop moves`);
    assert.deepEqual(at(f, 3), at(f, 3), 'pure');
  }
});

test('the figure stays whole and in place; the echo is dim cells on empty cells only, within the width and height budget', () => {
  for (const f of [whisper, init]) {
    for (let s = 0; s < STEPS; s++) {
      const m = at(f, s);
      assert.equal(m.length, f.a.length, 'height unchanged');
      assert.equal(m[0].length, f.a[0].length + 2 * PAD);
      assert.ok(m[0].length <= 40, 'fits the 40 column screen');
      f.a.forEach((row, y) => [...row].forEach((c, x) => c !== '.' && assert.equal(m[y][x + PAD], c, `${f.id} step ${s}: figure cell ${x},${y}`)));
      m.forEach((row, y) => [...row].forEach((c, x) => {
        const inFigure = x >= PAD && x < PAD + f.a[0].length && f.a[y][x - PAD] !== '.';
        if (!inFigure) assert.ok(c === '.' || c === ECHO.cell, `${f.id}: stray ${c}`);
      }));
    }
  }
});

test("Whisper's fork lags out to the right only, holds, and is reaped back into the figure", () => {
  const plain = (s) => countEcho(at(whisper, s)) - original(whisper);
  assert.equal(plain(0), 0, 'step 0: no echo');
  assert.ok(plain(3) > plain(1) && plain(1) > 0, 'it trails out');
  assert.equal(plain(4), plain(6), 'and holds');
  assert.equal(plain(9), 0, 'and is reaped');
  for (let s = 0; s < STEPS; s++) {
    const m = at(whisper, s);
    const left = Math.min(...whisper.a.map((r) => (r.search(/[^.]/) < 0 ? 99 : r.search(/[^.]/)))) + PAD;
    m.forEach((row) => [...row].forEach((c, x) => c === ECHO.cell && assert.ok(x >= left, 'one side only: nothing left of the figure')));
  }
});

test("Init's ratchet stacks copies out in whole steps (rigid, no slide), holds, and clears together", () => {
  const extra = (s) => countEcho(at(init, s)) - original(init);
  assert.equal(extra(0), 0);
  assert.ok(extra(1) > 0 && extra(2) > extra(1) && extra(3) > extra(2), 'one more copy a step');
  assert.equal(extra(3), extra(7), 'held');
  assert.equal(extra(8), 0, 'cleared together, not one by one');
  // rigid: every step's picture is one of a few discrete ones (0 to 3 copies), never an in-between
  const pictures = new Set(Array.from({ length: STEPS }, (_, s) => at(init, s).join('\n')));
  assert.equal(pictures.size, 4);
});

test('reduced motion: a still echo, the same at every time', () => {
  for (const f of [whisper, init]) {
    const still = [0, 3, 7, 11].map((s) => at(f, s, { reduced: true }).join('\n'));
    assert.equal(new Set(still).size, 1, f.id);
    assert.ok(countEcho(f.motion(f.a, f.anchors.a, { time: 0, reduced: true })) > original(f), `${f.id}: the calm version keeps the echo, parked`);
  }
});

test('the faintness knob: the default is the shared dim cell, and the checker pattern halves the cells', () => {
  assert.deepEqual({ ...ECHO }, { cell: 'x', pattern: 'solid' });
  const solid = countEcho(at(init, 3));
  ECHO.pattern = 'checker';
  try {
    assert.ok(countEcho(at(init, 3)) < solid);
    ECHO.cell = '#';
    assert.ok(at(init, 3).join('').includes('#'));
  } finally {
    ECHO.cell = 'x';
    ECHO.pattern = 'solid';
  }
});
