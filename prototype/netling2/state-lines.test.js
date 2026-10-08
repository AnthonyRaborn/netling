// Tests for state-lines.js: the draft chatter and hints for the bar states keep the house rules and every temper shape.
import test from 'node:test';
import assert from 'node:assert/strict';
import { STATE_GROUPS, STATE_CHATTER, stateLines } from './state-lines.js';
import { chatterTone, checkShape, EGGS } from './voice.js';
import { CHATTER, CHATTER_GROUPS } from '../../src/chatter.js';

test('every egg has two lines for every state, in the right group, with unique ids', () => {
  const ids = new Set(STATE_CHATTER.map((c) => c.id));
  assert.equal(ids.size, STATE_CHATTER.length);
  for (const egg of EGGS) for (const g of STATE_GROUPS) assert.equal(stateLines(egg, g.id).length, 2, `${egg}/${g.id}`);
  assert.equal(STATE_CHATTER.length, EGGS.length * STATE_GROUPS.length * 2);
  for (const c of STATE_CHATTER) assert.ok(STATE_GROUPS.some((g) => g.id === c.group));
});

test('no id or group collides with 1.0, and no line repeats a 1.0 line', () => {
  const oldIds = new Set(CHATTER.map((c) => c.id));
  const oldGroups = new Set(CHATTER_GROUPS.map((g) => g.id));
  const oldText = new Set(CHATTER.map((c) => c.text));
  for (const c of STATE_CHATTER) {
    assert.ok(!oldIds.has(c.id), c.id);
    assert.ok(!oldText.has(c.text), c.text);
  }
  for (const g of STATE_GROUPS) assert.ok(!oldGroups.has(g.id), g.id);
});

test('house rules: lowercase, no digits, no em dash, short, no state name and no number in a line', () => {
  for (const c of STATE_CHATTER) {
    assert.equal(c.text, c.text.toLowerCase(), c.id);
    assert.ok(!/\d/.test(c.text), c.id);
    assert.ok(!c.text.includes('—'), c.id);
    assert.ok(c.text.length <= 62, `${c.id}: ${c.text.length} characters`);
    assert.ok(!/overclock|overdrive|overlink/.test(c.text), c.id);
  }
});

test('hints keep 1.0 style: "listen to ..." in lowercase, ending with a period, no number', () => {
  for (const g of STATE_GROUPS) {
    assert.match(g.hint, /^listen to .+\.$/);
    assert.equal(g.hint, g.hint.toLowerCase());
    assert.ok(!/\d/.test(g.hint) && !g.hint.includes('—'));
  }
});

test('the temper shapes hold on every line: the machine voicing of each passes checkShape at every level', () => {
  for (const c of STATE_CHATTER) {
    for (const level of [-2, -1, 1, 2]) {
      for (const seed of [0, 3, 9]) {
        const out = chatterTone({ egg: c.egg, level, text: c.text, seed });
        assert.deepEqual(checkShape({ egg: c.egg, level, text: out }), [], `${c.id} L${level}: ${out}`);
      }
    }
  }
});
