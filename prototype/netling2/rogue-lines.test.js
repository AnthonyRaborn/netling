// Tests for rogue-lines.js and Rogue's chatter shape in voice.js: the drafted lines keep the house rules and every temper shape.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROGUE_BODY_LINES, ROGUE_STATE_CHATTER, LINEAGE_ROGUE_LINE } from './rogue-lines.js';
import { chatterTone, checkShape, idleBehavior, ROUTINE, STRAYS, ROGUE_CLEAR, ROGUE_LOOK, ROGUE_CHECK } from './voice.js';
import { STATE_GROUPS, STATE_CHATTER } from './state-lines.js';
import { BODY_LINES } from './body-lines.js';
import { ROGUE_NAMES } from './form-ids.js';
import { CHATTER } from '../../src/chatter.js';

const LEVELS = [2, 1, -1, -2];
const words = (t) => t.split(/\s+/).filter(Boolean);
const ALL = [...ROGUE_BODY_LINES.map((l) => ({ key: l.form, text: l.base, voices: l.voices })), ...ROGUE_STATE_CHATTER.map((c) => ({ key: c.id, text: c.text, voices: c.voices }))];

test('one base line for Rogue\'s baby, teen and four adults, none for its elders, no repeats with any egg', () => {
  const bodies = Object.keys(ROGUE_NAMES).filter((id) => !id.includes('Elder'));
  assert.deepEqual(ROGUE_BODY_LINES.map((l) => l.form).sort(), bodies.sort());
  const others = new Set([...BODY_LINES.map((l) => l.base), ...STATE_CHATTER.map((c) => c.text), ...CHATTER.map((c) => c.text)]);
  for (const l of ALL) assert.ok(!others.has(l.text), l.key);
  assert.equal(new Set(ALL.map((l) => l.text)).size, ALL.length);
});

test('two state lines for each state, in state-lines.js\'s groups, ids in its pattern and new', () => {
  for (const g of STATE_GROUPS) assert.equal(ROGUE_STATE_CHATTER.filter((c) => c.group === g.id).length, 2, g.id);
  const taken = new Set([...STATE_CHATTER.map((c) => c.id), ...CHATTER.map((c) => c.id)]);
  for (const c of ROGUE_STATE_CHATTER) {
    assert.match(c.id, new RegExp(`^${{ overclock: 'oc', overdrive: 'od', overlink: 'ol' }[c.group]}-rogue-[a-z]+$`));
    assert.ok(!taken.has(c.id), c.id);
  }
  assert.equal(new Set(ROGUE_STATE_CHATTER.map((c) => c.id)).size, ROGUE_STATE_CHATTER.length);
});

test('house rules: lowercase, no digits, no em dash, short, no state name, no form name as a word, never "drop"', () => {
  const forms = Object.values(ROGUE_NAMES).map((n) => n.toLowerCase());
  for (const l of ALL) {
    assert.equal(l.text, l.text.toLowerCase(), l.key);
    assert.ok(!/\d/.test(l.text) && !l.text.includes('—'), l.key);
    assert.ok(l.text.length <= (l.key.startsWith('rogue') ? 50 : 62), `${l.key}: ${l.text.length}`);
    assert.ok(!/overclock|overdrive|overlink/.test(l.text), l.key);
    for (const w of words(l.text).map((x) => x.replace(/[.,?]+$/, ''))) assert.ok(!forms.includes(w) && w !== 'drop', `${l.key}: ${w}`);
  }
});

test('every hand-written voicing keeps Rogue\'s shape (checkShape), at all four levels', () => {
  for (const l of ALL) for (const level of LEVELS) assert.deepEqual(checkShape({ egg: 'rogue', level, text: l.voices[level] }), [], `${l.key} at ${level}: ${l.voices[level]}`);
});

test('steady voicings say the base line in order; the mild unsteady one says it all around one look; the strong one never finishes it', () => {
  for (const l of ALL) {
    const base = words(l.text);
    const strip = (t, m) => words(t.split(m).join(' '));
    for (const level of [1, 2]) {
      assert.deepEqual(strip(l.voices[level], ROGUE_CLEAR), base, `${l.key} at ${level}`);
      assert.equal(l.voices[level], chatterTone({ egg: 'rogue', level, text: l.text }), `${l.key} at ${level}: the steady voicing only adds the checks`);
    }
    assert.deepEqual(strip(l.voices[-1], ROGUE_LOOK), base, `${l.key} at -1`);
    const said = strip(l.voices[-2], ROGUE_LOOK);
    assert.ok(said.length < base.length, `${l.key} at -2: unfinished`);
    assert.deepEqual(said, base.slice(0, said.length), `${l.key} at -2: from the start`);
  }
});

test('the machine voicing keeps Rogue\'s shape on any line, at every level and seed', () => {
  for (const l of [...ALL.map((x) => x.text), 'out now.', 'out of here now.', 'one two three four five six seven eight nine ten eleven twelve']) {
    for (const level of LEVELS) for (let seed = 0; seed < 20; seed++) {
      const out = chatterTone({ egg: 'rogue', level, text: l, seed });
      if (words(l).length < 3 && level === -2) continue; // a line this short cannot break off twice and still say a word between
      if (level > 0 && words(l).length <= ROGUE_CHECK[level]) continue; // too short for a check, as a two-word line has no Program beat
      assert.deepEqual(checkShape({ egg: 'rogue', level, text: out }), [], `${l} L${level} s${seed}: ${out}`);
    }
  }
});

test('checkShape catches the wrong shapes', () => {
  assert.notDeepEqual(checkShape({ egg: 'rogue', level: 1, text: 'i sat at their desk all day. nobody looked up.' }), []);
  assert.notDeepEqual(checkShape({ egg: 'rogue', level: 1, text: 'i sat at (clear) their desk all day.' }), []);
  assert.notDeepEqual(checkShape({ egg: 'rogue', level: -1, text: 'i sat at their desk all day. (behind?)' }), []);
  assert.notDeepEqual(checkShape({ egg: 'rogue', level: -1, text: '(behind?) i sat at their desk.' }), []);
  assert.notDeepEqual(checkShape({ egg: 'rogue', level: -2, text: 'i sat (behind?) at their (behind?) desk.' }), []);
  assert.notDeepEqual(checkShape({ egg: 'rogue', level: -2, text: 'i sat at (behind?)' }), []);
});

test('the NL-0 Lineage line keeps each launch egg\'s shape at every level', () => {
  for (const egg of ['program', 'iron', 'wetware']) {
    for (const level of LEVELS) assert.deepEqual(checkShape({ egg, level, text: LINEAGE_ROGUE_LINE.voices[egg][level] }), [], `${egg} at ${level}`);
  }
  assert.ok(!CHATTER.some((c) => c.id === LINEAGE_ROGUE_LINE.id));
});

test('Rogue\'s idle: a four-step watch when steady, strays that are never in it when unsteady', () => {
  assert.equal(ROUTINE.rogue.length, 4);
  assert.ok(STRAYS.rogue.every((a) => !ROUTINE.rogue.includes(a)));
  const steps = [0, 12_000, 24_000, 36_000].map((time) => idleBehavior({ egg: 'rogue', level: 1, time }).action);
  assert.deepEqual(steps, ROUTINE.rogue);
  let strays = 0;
  for (let time = 0; time < 600_000; time += 250) {
    const b = idleBehavior({ egg: 'rogue', level: -2, time, seed: 5 });
    if (b) { assert.ok(STRAYS.rogue.includes(b.action) && !b.scheduled); strays++; }
  }
  assert.ok(strays > 0);
});
