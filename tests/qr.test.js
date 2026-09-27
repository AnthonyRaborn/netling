import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeQR } from '../src/qr.js';

// Full decoding is checked in the browser with BarcodeDetector; these check structure.
const finderAt = (m, x0, y0) => {
  for (let dy = 0; dy < 7; dy++) {
    for (let dx = 0; dx < 7; dx++) {
      const ring = Math.max(Math.abs(dx - 3), Math.abs(dy - 3));
      if (m[y0 + dy][x0 + dx] !== (ring !== 2)) return false;
    }
  }
  return true;
};

test('small inputs pick small versions; size matches version', () => {
  const qr = encodeQR('hello');
  assert.equal(qr.version, 1);
  assert.equal(qr.size, 21);
  assert.equal(qr.modules.length, 21);
});

test('finder patterns sit in three corners', () => {
  for (const text of ['hi', 'x'.repeat(300), 'y'.repeat(1700)]) {
    const { size, modules } = encodeQR(text);
    assert.ok(finderAt(modules, 0, 0), 'top-left');
    assert.ok(finderAt(modules, size - 7, 0), 'top-right');
    assert.ok(finderAt(modules, 0, size - 7), 'bottom-left');
  }
});

test('a transfer-sized payload fits, and oversized input is refused', () => {
  const qr = encodeQR('https://example.com/#import=' + 'A'.repeat(1800));
  assert.ok(qr.version >= 25 && qr.version <= 40);
  assert.throws(() => encodeQR('z'.repeat(3000)), /too much data/);
});

test('timing patterns alternate', () => {
  const { size, modules } = encodeQR('timing');
  for (let i = 8; i < size - 8; i++) {
    assert.equal(modules[6][i], i % 2 === 0);
    assert.equal(modules[i][6], i % 2 === 0);
  }
});
