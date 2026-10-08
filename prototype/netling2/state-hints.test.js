// Tests for state-hints.js: the one-time captions keep the house rules and the trigger fires once, only when idle.
import test from 'node:test';
import assert from 'node:assert/strict';
import { STATE_HINTS, hintDue } from './state-hints.js';
import { EGGS } from './voice.js';

test('every egg has a two-line caption for each bar, lowercase, short, no em dash, no digit, no state name', () => {
  for (const egg of EGGS) {
    for (const bar of ['charge', 'sync']) {
      const lines = STATE_HINTS[egg][bar];
      assert.equal(lines.length, 2, `${egg}/${bar}`);
      for (const line of lines) {
        assert.ok(line.length <= 46, `${egg}/${bar}: ${line.length} characters`);
        assert.equal(line, line.toLowerCase());
        assert.ok(!/\d/.test(line) && !line.includes('—'));
        assert.ok(!/overclock|overdrive|overlink/.test(line));
      }
    }
  }
});

test('the captions do not give away the hold: no time, no number, no threshold word', () => {
  for (const egg of EGGS) for (const bar of ['charge', 'sync']) for (const line of STATE_HINTS[egg][bar]) assert.ok(!/hour|minute|percent|full|maximum|90|80|85/.test(line), line);
});

test('the caption is due once, after the build time, and only when nothing urgent is on screen', () => {
  assert.equal(hintDue({ buildMin: 119, shown: false, busy: false }), false);
  assert.equal(hintDue({ buildMin: 120, shown: false, busy: false }), true);
  assert.equal(hintDue({ buildMin: 200, shown: true, busy: false }), false);
  assert.equal(hintDue({ buildMin: 200, shown: false, busy: true }), false);
});
