// Tests for the drafted chatter base lines (body-lines.js): one per baby, teen and adult of each egg, every voicing in its shape.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BODY_LINES } from './body-lines.js';
import { checkShape } from './voice.js';
import { FORM_NAMES } from './form-ids.js';

const words = (t) => t.split(/\s+/).filter(Boolean);
const bare = (w) => w.map((x) => x.replace(/[.,]+$/, '')); // a clipped word may drop its full stop

test('one base line for each of the 39 babies, teens and adults (13 an egg), none for elders, no repeats', () => {
  const bodies = Object.keys(FORM_NAMES).filter((id) => !id.includes('Elder'));
  assert.equal(bodies.length, 39);
  assert.deepEqual(BODY_LINES.map((l) => l.form).sort(), [...bodies].sort());
  for (const l of BODY_LINES) assert.ok(l.form.startsWith(l.egg), l.form);
  assert.equal(new Set(BODY_LINES.map((l) => l.base)).size, 39);
});

test('every voicing keeps its egg\'s shape (checkShape), at all four levels', () => {
  for (const l of BODY_LINES) {
    for (const level of [2, 1, -1, -2]) assert.deepEqual(checkShape({ egg: l.egg, level, text: l.voices[level] }), [], `${l.form} at ${level}: ${l.voices[level]}`);
  }
});

test('the steady voicings say the base line\'s words in order; the unsteady ones are drawn from it (Program and Wetware) or name a fault (Iron)', () => {
  for (const l of BODY_LINES) {
    const base = words(l.base);
    for (const level of [1, 2]) {
      const said = words(l.voices[level].replace(/ \/ | \.\.\. |\b\d: |\bok\b\.?/g, ' '));
      assert.deepEqual(said, base, `${l.form} at ${level}`);
    }
    if (l.egg === 'program') {
      const clip = words(l.voices[-1].replace(/ -$/, ''));
      assert.deepEqual(bare(clip), bare(base.slice(0, clip.length)), `${l.form}: clipped from the start`);
    }
    if (l.egg === 'wetware') {
      const tail = words(l.voices[-1].slice(3));
      assert.deepEqual(bare(tail), bare(base.slice(base.length - tail.length)), `${l.form}: starts mid thought and runs to the end`);
    }
  }
});

test('lowercase like 1.0 (Iron\'s fault bell aside), and short: no base line over 50 characters', () => {
  for (const l of BODY_LINES) {
    assert.equal(l.base, l.base.toLowerCase(), l.form);
    assert.ok(l.base.length <= 50, `${l.form}: ${l.base.length}`);
  }
});
