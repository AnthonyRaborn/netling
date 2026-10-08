// Tests for clinic-node.js: the clinic marker stays inside the 1.0 node footprint, is symmetric, honours the spent fade and keeps its
// label, hint and tips in the same size range as the 1.0 ones.
import test from 'node:test';
import assert from 'node:assert/strict';
import { drawClinicNode, CLINIC_COLOR, CLINIC_LABELS, CLINIC_HINTS, CLINIC_TIPS } from './clinic-node.js';
import { EGGS } from './voice.js';

const fake = () => {
  const calls = [];
  const ctx = { globalAlpha: 1, fillStyle: '', fillRect: (...a) => calls.push({ rect: a, color: ctx.fillStyle, alpha: ctx.globalAlpha }) };
  return { ctx, calls };
};

test('the clinic is a plus of integer rects inside the 1.0 node footprint (a 20 px box), one color, symmetric', () => {
  const { ctx, calls } = fake();
  drawClinicNode(ctx, 100, 60, false);
  assert.equal(calls.length, 2);
  const pixels = new Set();
  for (const c of calls) {
    assert.equal(c.color, CLINIC_COLOR);
    assert.ok(c.rect.every(Number.isInteger));
    const [x, y, w, h] = c.rect;
    assert.ok(x >= 90 && x + w <= 110 && y >= 50 && y + h <= 70);
    for (let i = x; i < x + w; i++) for (let j = y; j < y + h; j++) pixels.add(`${i - 100},${j - 60}`);
  }
  for (const key of pixels) {
    const [i, j] = key.split(',').map(Number);
    assert.ok(pixels.has(`${-i - 1},${j}`) && pixels.has(`${i},${-j - 1}`), `${key} has no mirror`);
  }
  assert.equal(ctx.globalAlpha, 1);
});

test('a spent clinic fades like the other nodes (45%) and restores the alpha', () => {
  const { ctx, calls } = fake();
  drawClinicNode(ctx, 0, 0, true);
  assert.ok(calls.every((c) => c.alpha === 0.45));
  assert.equal(ctx.globalAlpha, 1);
});

test('every egg has a label, a hint and a tip within the 1.0 sizes, lowercase hints, no em dash', () => {
  for (const egg of EGGS) {
    assert.ok(CLINIC_LABELS[egg].length <= 'CORP EXCHANGE'.length && CLINIC_LABELS[egg] === CLINIC_LABELS[egg].toUpperCase());
    assert.ok(CLINIC_HINTS[egg].length <= 'safe, pricier. leans corp.'.length && CLINIC_HINTS[egg] === CLINIC_HINTS[egg].toLowerCase());
    assert.equal(CLINIC_TIPS[egg].length, 2);
    for (const line of CLINIC_TIPS[egg]) assert.ok(line.length <= 46 && line === line.toLowerCase());
    for (const s of [CLINIC_LABELS[egg], CLINIC_HINTS[egg], ...CLINIC_TIPS[egg]]) assert.ok(!s.includes('—'));
  }
});

test('the clinic color is not one of the fixed 1.0 node colors or the region accent', () => {
  for (const c of ['#39ff14', '#f9f002', '#b967ff', '#ffffff', '#ff2a6d', '#05d9e8', '#c7f9ff', '#ff9f1c']) assert.notEqual(CLINIC_COLOR, c);
});
