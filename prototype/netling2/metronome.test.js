// Tests for metronome.js: the Metronome prop's pendulum. Deterministic: no clock, no Math.random.
import test from 'node:test';
import assert from 'node:assert/strict';
import { metronome, SLOT_MS, WINDOW_MS } from './metronome.js';
import { BEAT_MS } from './tell.js';

const trace = (level, seed, ms = 300_000, step = 25, reduced = false) => {
  const out = [];
  for (let t = 0; t < ms; t += step) out.push({ t, ...metronome({ level, time: t, seed, reduced }) });
  return out;
};
const changes = (rows) => rows.filter((r, i) => i && r.pos !== rows[i - 1].pos).map((r) => r.t);

test('the middle is upright and still, and the function is pure', () => {
  for (const t of [0, 4321, 999_999]) assert.deepEqual(metronome({ level: 0, time: t, seed: 4 }), { pos: 0 });
  for (const level of [-2, -1, 1, 2]) assert.deepEqual(metronome({ level, time: 12345, seed: 3 }), metronome({ level, time: 12345, seed: 3 }));
});

test('steady: it swings on exactly the tell beat, alternating sides, whatever the seed', () => {
  for (const level of [1, 2]) {
    const interval = BEAT_MS[level];
    for (const seed of [0, 5, 99]) {
      const c = changes(trace(level, seed, interval * 20, 25));
      assert.ok(c.length >= 18, `${level}: ${c.length} swings`);
      c.forEach((t) => assert.equal(t % interval, 0, `swing at ${t} is off the ${interval} ms beat`));
      for (let i = 1; i < c.length; i++) assert.equal(c[i] - c[i - 1], interval);
      const rows = trace(level, seed, interval * 4, 25);
      assert.deepEqual(rows.map((r) => r.pos), trace(level, 0, interval * 4, 25).map((r) => r.pos), 'steady ignores the seed');
    }
  }
});

test('strongly steady beats twice as fast as steady', () => {
  assert.equal(BEAT_MS[1], 2 * BEAT_MS[2]);
});

test('unsteady: swings at irregular moments, differently by seed, strongly more often', () => {
  const gaps = (seed, level) => { const c = changes(trace(level, seed)); return c.slice(1).map((t, i) => t - c[i]); };
  for (const level of [-1, -2]) {
    assert.ok(new Set(gaps(1, level)).size > 5, `${level}: gaps must vary`);
    assert.notDeepEqual(changes(trace(level, 1)), changes(trace(level, 2)), 'seed changes the pattern');
  }
  assert.ok(changes(trace(-2, 1)).length > 1.5 * changes(trace(-1, 1)).length);
});

test('flash budget: it never changes side within FLASH_TOGGLE_MS, in any level, so never over three a second', () => {
  for (const level of [-2, -1, 1, 2]) {
    for (const seed of [0, 3, 8, 21]) {
      const c = changes(trace(level, seed, 600_000, 10));
      for (let i = 1; i < c.length; i++) assert.ok(c[i] - c[i - 1] >= SLOT_MS, `${level}/${seed}: ${c[i] - c[i - 1]} ms`);
    }
    if (level < 0) {
      const c = changes(trace(level, 7, 600_000, 10));
      for (let i = 1; i < c.length; i++) assert.ok(c[i] - c[i - 1] >= WINDOW_MS[level] * 0.4 - 10, 'unsteady swings keep a 40% window gap');
    }
  }
});

test('reduced motion: the steady beat is kept; the unsteady pendulum parks on one side', () => {
  for (const level of [1, 2]) assert.deepEqual(trace(level, 3, 40_000, 25, true), trace(level, 3, 40_000, 25, false));
  for (const level of [-1, -2]) {
    const rows = trace(level, 3, 60_000, 25, true);
    assert.equal(new Set(rows.map((r) => r.pos)).size, 1);
  }
});
