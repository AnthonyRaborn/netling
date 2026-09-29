import { test } from 'node:test';
import assert from 'node:assert/strict';
import './helpers/utc.js';

// The balance tools are how rule changes get judged, so their own logic is tested here.
const { planMove } = await import('../tools/netrun-bot.mjs');
const { simulate, simulateLine, stats, parentOf, ARCHETYPES } = await import('../tools/balance.mjs');
const { diff, flatten } = await import('../tools/balance-diff.mjs');
const { FORMS } = await import('../src/sim.js');

// Start at 0; two ways on (1 and 2) that look alike; behind 1 is ICE, behind 2 a cache.
const MAP = {
  nodes: [
    { id: 0, type: 'start', edges: [1, 2] },
    { id: 1, type: 'cache', edges: [3] },
    { id: 2, type: 'cache', edges: [4] },
    { id: 3, type: 'ice', edges: [] },
    { id: 4, type: 'cache', edges: [] },
  ],
};
const options = [MAP.nodes[1], MAP.nodes[2]];

test('the netrun bot plans only with the nodes the player can see', () => {
  assert.equal(planMove(MAP, options, new Set([1, 2]), false).id, 1, 'unseen nodes must not steer it: a tie keeps the first');
  assert.equal(planMove(MAP, options, new Set([1, 2, 3, 4]), false).id, 2, 'with sight it avoids the ICE behind 1');
  assert.equal(planMove(MAP, options, new Set([1, 2, 3]), true).id, 2, 'seeing only the ICE is enough to avoid it when hurt');
});

test('a simulated life is repeatable and reports its stages', () => {
  const a = simulate(ARCHETYPES.attentive, 7);
  const b = simulate(ARCHETYPES.attentive, 7);
  assert.deepEqual(a.stageDays, b.stageDays);
  assert.equal(a.adultForm, b.adultForm);
  assert.equal(a.codex.length, b.codex.length);
  assert.ok(Math.abs(a.stageDays.baby - 1) < 0.01, `baby for ${a.stageDays.baby} days`);
  assert.ok(a.fragment?.trait, 'a finished life leaves a fragment with a trait');
});

test('a child starts from its parent: trait, keepsake and generation', () => {
  const r = simulate(ARCHETYPES.attentive, 3, { fragment: parentOf('ghost'), generation: 2 });
  assert.equal(r.trait, FORMS.ghost.trait);
  assert.equal(r.traces, 0, 'Untraceable: no corp traces at all');
  assert.throws(() => parentOf('kernel'), /adult form/);
});

test('a lineage carries the codex and each parent into the next life', () => {
  const line = simulateLine(ARCHETYPES.attentive, 5, 2);
  const [first, second] = line.lives;
  assert.equal(second.trait, first.fragment.trait);
  assert.ok(second.codex.length >= first.codex.length, 'the codex never shrinks');
  assert.ok(first.codex.every((id) => second.codex.includes(id)));
  assert.equal(second.newFragments, second.codex.length - first.codex.length);
});

test('stats turn results into rates and averages', () => {
  const st = stats([simulate(ARCHETYPES.attentive, 1), simulate(ARCHETYPES.attentive, 2)]);
  assert.equal(st.runs, 2);
  assert.equal(st.teen, 1);
  assert.ok(Object.values(st.adults).every((x) => x > 0 && x <= 1));
  assert.ok(st.stageDays.adult > 3);
  assert.deepEqual(Object.keys(st.atTeen.balancedWithin), ['w1', 'w1.5', 'w2', 'w3'], 'bands keep their order');
  const bands = Object.values(st.atTeen.balancedWithin);
  assert.ok(bands.every((x, i) => i === 0 || x >= bands[i - 1]), 'a wider band never holds fewer');
  assert.ok(st.atTeen.ghostPathPlay <= st.atTeen.ghostPath);
});

test('the report diff finds what moved, by path', () => {
  const before = { runs: 10, archetypes: { a: { adult: 0.5, adults: { daemon: 0.6 } } } };
  const after = { runs: 20, archetypes: { a: { adult: 0.5, adults: { daemon: 0.4, glitch: 0.2 } } } };
  assert.deepEqual(flatten(before), { runs: 10, 'archetypes.a.adult': 0.5, 'archetypes.a.adults.daemon': 0.6 });
  const rows = diff(before, after);
  assert.deepEqual(rows.map((r) => r.path), ['archetypes.a.adults.daemon', 'archetypes.a.adults.glitch']);
  assert.ok(Math.abs(rows[0].delta + 0.2) < 1e-9);
  assert.equal(rows[1].before, 0, 'a form that appears counts as 0 before');
});
