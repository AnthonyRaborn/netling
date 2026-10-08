// Tests for marks.js: the state marks stay on the flash grid, hold still in calm mode, stay out of each other's way, and add no
// change instants to the temper tell.
import test from 'node:test';
import assert from 'node:assert/strict';
import { stateMarks, KINDS, STATE_STEP_MS, SLOT } from './marks.js';
import { temperTell, EGGS } from './tell.js';

const sig = (v) => JSON.stringify(v);
const SIZES = [[16, 16], [18, 15], [14, 12]];

test('the marks step on the 400 ms grid, which is a whole number of flash slots', () => {
  assert.equal(STATE_STEP_MS % SLOT, 0);
  for (const kind of KINDS) {
    for (const [w, h] of SIZES) {
      let last = sig(stateMarks({ kind, time: 0, w, h }));
      for (let t = 25; t < 20_000; t += 25) {
        const now = sig(stateMarks({ kind, time: t, w, h }));
        if (now !== last) assert.equal(t % STATE_STEP_MS < 25, true, `${kind} changed off the grid at ${t}`);
        last = now;
      }
    }
  }
});

test('calm mode: every mark is still', () => {
  for (const kind of KINDS) {
    const a = sig(stateMarks({ kind, time: 0, w: 16, h: 16, calm: true }));
    for (let t = 0; t < 10_000; t += 250) assert.equal(sig(stateMarks({ kind, time: t, w: 16, h: 16, calm: true })), a);
  }
});

test('the three states occupy different places, so two at once never share a pixel', () => {
  for (const [w, h] of SIZES) {
    for (let t = 0; t < 8000; t += STATE_STEP_MS) {
      for (const calm of [false, true]) {
        const seen = new Map();
        for (const kind of KINDS) {
          for (const [x, y] of stateMarks({ kind, time: t, w, h, calm })) {
            const key = `${x},${y}`;
            assert.ok(!seen.has(key), `${kind} and ${seen.get(key)} share ${key} (${w}x${h}, t=${t}, calm=${calm})`);
            seen.set(key, kind);
          }
        }
      }
    }
  }
});

test('overclock is above the sprite, overdrive below it, overlink beside it', () => {
  for (const [w, h] of SIZES) {
    for (let t = 0; t < 4000; t += STATE_STEP_MS) {
      assert.ok(stateMarks({ kind: 'overclock', time: t, w, h }).every(([, y]) => y < 0));
      assert.ok(stateMarks({ kind: 'overdrive', time: t, w, h }).every(([, y]) => y >= h));
      assert.ok(stateMarks({ kind: 'overlink', time: t, w, h }).every(([x]) => x < 0 || x >= w));
    }
  }
});

test('strained overlink drops to one dot', () => {
  assert.equal(stateMarks({ kind: 'overlink', time: 0, w: 16, h: 16 }).length, 2);
  assert.equal(stateMarks({ kind: 'overlink', time: 0, w: 16, h: 16, strained: true }).length, 1);
});

test('flash budget by region: the marks change at most every 400 ms (three changes in any second), apart from the pose, which keeps its own budget', () => {
  for (const kinds of [['overclock'], ['overdrive'], ['overlink'], KINDS]) {
    for (const [w, h] of SIZES) {
      const changes = [];
      let last = null;
      for (let t = 0; t < 120_000; t += 25) {
        const picture = sig(kinds.map((k) => stateMarks({ kind: k, time: t, w, h })));
        if (last !== null && picture !== last) changes.push(t);
        last = picture;
      }
      for (let i = 1; i < changes.length; i++) assert.ok(changes[i] - changes[i - 1] >= STATE_STEP_MS - 25, `${kinds}: ${changes[i] - changes[i - 1]} ms between changes`);
      for (let i = 0; i < changes.length; i++) {
        const inWindow = changes.filter((c) => c >= changes[i] && c < changes[i] + 1000).length;
        assert.ok(inWindow <= 3, `${kinds}: ${inWindow} changes in a second`);
      }
    }
  }
});

test('the new marks never touch the body, whatever the temper tell does to it (drift, settle, hop)', () => {
  for (const [w, h] of SIZES) {
    for (const egg of EGGS) {
      for (const level of [-2, -1, 0, 1, 2]) {
        for (const reduced of [false, true]) {
          let minDx = 0, maxDx = 0, minDy = 0, maxDy = 0;
          for (let t = 0; t < 60_000; t += 50) {
            const tell = temperTell({ egg, level, time: t, reduced, seed: 5 });
            minDx = Math.min(minDx, tell.dx); maxDx = Math.max(maxDx, tell.dx);
            minDy = Math.min(minDy, tell.dy); maxDy = Math.max(maxDy, tell.dy);
          }
          for (const calm of [false, true]) {
            for (let t = 0; t < 4000; t += STATE_STEP_MS) {
              for (const kind of ['overdrive', 'overlink']) {
                for (const [x, y] of stateMarks({ kind, time: t, w, h, calm })) {
                  const inside = x >= minDx && x < w + maxDx && y >= minDy && y < h + maxDy;
                  assert.ok(!inside, `${kind} mark at ${x},${y} touches the ${egg}/${level} body (dx ${minDx}..${maxDx}, dy ${minDy}..${maxDy})`);
                }
              }
            }
          }
        }
      }
    }
  }
});
