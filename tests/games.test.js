import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Breach } from '../src/games/breach.js';
import { Dodge } from '../src/games/dodge.js';
import { Tune } from '../src/games/tune.js';
import { GameSession } from '../src/games/session.js';
import { mulberry32 } from '../src/sim.js';

const mute = () => {};

// Depth-first search over legal picks; true if some pick sequence wins.
function solvable(game) {
  if (game.done) return game.won;
  for (let k = 0; k < 5; k++) {
    const g = Object.assign(Object.create(Breach.prototype), structuredClone({ ...game, sound: null }), {
      used: new Set(game.used),
      sound: mute,
    });
    g.cursor = k;
    const [r, c] = g.cell();
    if (g.used.has(`${r},${c}`)) continue;
    g.input('a');
    if (solvable(g)) return true;
  }
  return false;
}

test('every generated breach puzzle is solvable', () => {
  for (let seed = 1; seed <= 200; seed++) {
    assert.ok(solvable(new Breach(mulberry32(seed), mute)), `seed ${seed}`);
  }
});

test('breach rejects reusing a cell and loses when the buffer fills', () => {
  const g = new Breach(mulberry32(5), mute);
  g.target = ['XX', 'XX', 'XX']; // unreachable
  g.input('a');
  g.input('a'); // cursor now points back at the used cell in the new column
  assert.equal(g.buffer.length, 1);
  for (let i = 0; i < 10 && !g.done; i++) {
    g.input('right');
    g.input('a');
  }
  assert.equal(g.done, true);
  assert.equal(g.won, false);
});

test('breach times out', () => {
  const g = new Breach(mulberry32(1), mute);
  g.update(30);
  assert.equal(g.done, true);
  assert.equal(g.won, false);
});

// rng that alternates: "one block" for the count roll, then lane 0 for placement.
function laneZeroRng() {
  let i = 0;
  return () => (i++ % 2 === 0 ? 0.99 : 0);
}

test('dodge is won by surviving and lost on a hit', () => {
  const safe = new Dodge(laneZeroRng(), mute); // all blocks spawn in lane 0
  safe.input('right');
  safe.input('right');
  for (let t = 0; t < 16; t += 0.05) safe.update(0.05);
  assert.equal(safe.won, true);

  const hit = new Dodge(laneZeroRng(), mute);
  hit.lane = 0;
  for (let t = 0; t < 16 && !hit.done; t += 0.05) hit.update(0.05);
  assert.equal(hit.done, true);
  assert.equal(hit.won, false);
});

test('tune: locking on the target wins, mashing early loses', () => {
  const g = new Tune(mulberry32(2), mute);
  for (let round = 0; round < 3 && !g.done; round++) {
    // advance until the sweep crosses the target, then lock
    while (!g.done && g.pause <= 0 && Math.abs(g.freq() - g.target) >= 0.05) g.update(0.005);
    g.input('a');
    g.update(1);
  }
  assert.equal(g.won, true);

  const bad = new Tune(mulberry32(2), mute);
  while (!bad.done) bad.update(0.5);
  assert.equal(bad.won, false);
});

test('session reports the result once, and forfeiting is a loss', () => {
  const results = [];
  const s = new GameSession('breach', { rng: mulberry32(1), onFinish: (won) => results.push(won) });
  s.input('a'); // leave intro
  assert.equal(s.phase, 'play');
  s.forfeit();
  for (let i = 0; i < 50; i++) s.update(0.1);
  assert.deepEqual(results, [false]);
});
