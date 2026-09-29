import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deltaE, blend, hexToRgb, rgbToHex, contrastColor, SWAP_COLORS } from '../src/colors.js';

test('color distance: identical is zero, black to white is 100, neons are far apart', () => {
  assert.equal(deltaE('#05d9e8', '#05d9e8'), 0);
  assert.ok(Math.abs(deltaE('#000000', '#ffffff') - 100) < 0.01);
  assert.ok(deltaE('#f9f002', '#39ff14') > 60);
  assert.deepEqual(hexToRgb('#ff2a6d'), [255, 42, 109]);
  assert.equal(rgbToHex([255, 42, 109]), '#ff2a6d');
  assert.equal(blend('#ff0000', 0.5, '#000000'), '#800000');
});

test('contrastColor keeps a color that stands clear and swaps one that blends in', () => {
  assert.equal(contrastColor('#f9f002', '#05d9e8'), '#f9f002');
  const swapped = contrastColor('#05d9e8', '#05d9e8');
  assert.notEqual(swapped, '#05d9e8');
  assert.ok(SWAP_COLORS.includes(swapped));
  assert.ok(deltaE(swapped, '#05d9e8') >= 45);
  // Yellow on a yellow body goes to the nearest clear color, orange.
  assert.equal(contrastColor('#f9f002', '#f9f002'), '#ff9f1c');
});
