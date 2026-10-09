// Tests for the drafted state chatter voicings (state-voices.js): one set for each state line, every voicing in its egg's shape.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STATE_CHATTER, STATE_GROUPS } from './state-lines.js';
import { STATE_VOICES } from './state-voices.js';
import { checkShape } from './voice.js';

test('every state line has a voicing at each of the four temper levels, and no voicing lacks a line', () => {
  assert.deepEqual(Object.keys(STATE_VOICES).sort(), STATE_CHATTER.map((c) => c.id).sort());
  for (const c of STATE_CHATTER) for (const level of [2, 1, -1, -2]) assert.ok(STATE_VOICES[c.id][level], `${c.id} at ${level}`);
});

test('every voicing keeps its egg\'s shape (checkShape)', () => {
  for (const c of STATE_CHATTER) {
    for (const level of [2, 1, -1, -2]) assert.deepEqual(checkShape({ egg: c.egg, level, text: STATE_VOICES[c.id][level] }), [], `${c.id} at ${level}`);
  }
});

test('the state lines\' rules hold for the voicings too: no state name, no em dash, and no number but Iron\'s item numbers', () => {
  const names = STATE_GROUPS.map((g) => g.name.toLowerCase());
  for (const c of STATE_CHATTER) {
    for (const level of [2, 1, -1, -2]) {
      const t = STATE_VOICES[c.id][level];
      assert.ok(!names.some((n) => t.toLowerCase().includes(n)), `${c.id}: names a state`);
      assert.ok(!t.includes('—'), `${c.id}: em dash`);
      const digits = t.replace(/\b[123]: /g, '');
      assert.ok(!/\d/.test(digits), `${c.id} at ${level}: a number`);
    }
  }
});

test('Program and Wetware steady voicings say the base line\'s words in order', () => {
  for (const c of STATE_CHATTER.filter((x) => x.egg !== 'iron')) {
    for (const level of [1, 2]) assert.equal(STATE_VOICES[c.id][level].replace(/ \/ | \.\.\. /g, ' '), c.text, `${c.id} at ${level}`);
  }
});
