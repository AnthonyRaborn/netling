import { test } from 'node:test';
import assert from 'node:assert/strict';
import { weighted } from '../src/random.js';
import { mulberry32 } from '../src/sim.js';

test('weighted picks in proportion to weight and never picks a zero weight', () => {
  const rng = mulberry32(7);
  const counts = { a: 0, b: 0, c: 0 };
  for (let i = 0; i < 6000; i++) counts[weighted({ a: 1, b: 3, c: 0 }, rng)]++;
  assert.equal(counts.c, 0);
  assert.ok(counts.b > counts.a * 2.5 && counts.b < counts.a * 3.5, JSON.stringify(counts));
});

test('weighted falls back to the last key at the top of the range', () => {
  assert.equal(weighted({ a: 1, b: 1 }, () => 0.9999999), 'b');
  assert.equal(weighted({ a: 1, b: 1 }, () => 0), 'a');
});
