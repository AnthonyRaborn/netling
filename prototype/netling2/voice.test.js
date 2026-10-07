// Tests for voice.js: the idle behavior and chatter tone channels of the temper tell. Deterministic: no clock, no Math.random.
import test from 'node:test';
import assert from 'node:assert/strict';
import { idleBehavior, chatterTone, ROUTINE, STRAYS, STEP_MS, ACTIVE_FRACTION, PROGRAM_BEAT, WETWARE_PAUSE, IRON_ITEMS, EGGS, SLOT_MS } from './voice.js';
import { CHATTER } from '../../src/chatter.js';
import { checkShape } from './voice.js';
import { SAMPLES } from './voice-samples.js';

const LEVELS = [-2, -1, 0, 1, 2];
const trace = (egg, level, seed, ms = 600_000, step = 100) => {
  const out = [];
  for (let t = 0; t < ms; t += step) out.push({ t, ...idleBehavior({ egg, level, time: t, seed }) });
  return out;
};
const active = (rows) => rows.filter((r) => r.action);

test('the middle has no idle behavior and no chatter tone', () => {
  for (const egg of EGGS) {
    for (let t = 0; t < 120_000; t += 500) assert.equal(idleBehavior({ egg, level: 0, time: t, seed: 4 }), null);
    for (const c of CHATTER) assert.equal(chatterTone({ egg, level: 0, text: c.text, seed: 4 }), c.text);
  }
});

test('both channels are pure functions of their inputs', () => {
  for (const egg of EGGS) {
    for (const level of LEVELS) {
      assert.deepEqual(idleBehavior({ egg, level, time: 123_456, seed: 3 }), idleBehavior({ egg, level, time: 123_456, seed: 3 }));
      assert.equal(chatterTone({ egg, level, text: 'a b c d e f', seed: 3 }), chatterTone({ egg, level, text: 'a b c d e f', seed: 3 }));
    }
  }
});

test('steady idle: the routine repeats in the same order on an exact clock, whatever the seed', () => {
  for (const egg of EGGS) {
    for (const level of [1, 2]) {
      const stepMs = STEP_MS[level];
      const cycle = stepMs * ROUTINE[egg].length;
      for (const seed of [0, 1, 99]) {
        for (let t = 0; t < cycle; t += 250) {
          const a = idleBehavior({ egg, level, time: t, seed });
          assert.deepEqual(a, idleBehavior({ egg, level, time: t + cycle * 5, seed }), `${egg}/${level}: a cycle must repeat exactly`);
          assert.deepEqual(a, idleBehavior({ egg, level, time: t, seed: 0 }), 'steady ignores the seed');
          const into = t % stepMs;
          if (into < stepMs * ACTIVE_FRACTION) assert.equal(a.action, ROUTINE[egg][Math.floor(t / stepMs)], `${egg}/${level} at ${t}`);
          else assert.equal(a, null);
        }
      }
    }
  }
});

test('strongly steady runs the routine twice as fast as steady, and the routine is four steps in every egg', () => {
  for (const egg of EGGS) assert.equal(ROUTINE[egg].length, 4);
  assert.equal(STEP_MS[1], 2 * STEP_MS[2]);
});

test('unsteady idle: strays are never in the routine, never scheduled, always dropped partway', () => {
  for (const egg of EGGS) {
    assert.equal(STRAYS[egg].filter((s) => ROUTINE[egg].includes(s)).length, 0, 'disjoint vocabularies');
    for (const level of [-1, -2]) {
      const rows = active(trace(egg, level, 5));
      assert.ok(rows.length > 0, `${egg}/${level} must stray`);
      for (const r of rows) {
        assert.ok(STRAYS[egg].includes(r.action));
        assert.equal(r.scheduled, false);
        assert.equal(r.aborted, true);
        assert.ok(r.progress < 0.8 + 1e-9, 'a stray is dropped before it finishes');
      }
    }
  }
});

test('unsteady idle is not on a clock: the start times differ from window to window, and by seed', () => {
  for (const egg of EGGS) {
    const starts = (seed) => {
      const rows = trace(egg, -1, seed, 900_000, 50);
      return rows.filter((r, i) => r.action && !(i && rows[i - 1].action)).map((r) => r.t % 10_000);
    };
    const a = starts(1);
    assert.ok(new Set(a).size > 3, `${egg}: start offsets must vary`);
    assert.notDeepEqual(a, starts(2), 'a different seed gives a different pattern');
  }
});

test('strongly unsteady strays more than unsteady', () => {
  for (const egg of EGGS) assert.ok(active(trace(egg, -2, 7)).length > 1.5 * active(trace(egg, -1, 7)).length);
});

test('idle flash budget: the shown action never changes faster than FLASH_TOGGLE_MS, and every action lasts over a second', () => {
  for (const egg of EGGS) {
    for (const level of LEVELS) {
      for (const seed of [0, 3, 8]) {
        const rows = trace(egg, level, seed, 300_000, 25);
        let runStart = null;
        let last = null;
        const runs = [];
        for (const r of rows) {
          const key = r.action ?? null;
          if (key !== last) {
            if (last && runStart !== null) runs.push(r.t - runStart);
            runStart = r.t;
            last = key;
          }
        }
        for (const d of runs) assert.ok(d >= SLOT_MS && d >= 1000, `${egg}/${level}: an action lasted ${d} ms`);
      }
    }
  }
});

test('steady chatter: the shape is countable and fixed, whatever the line and seed', () => {
  const lines = CHATTER.map((c) => c.text);
  for (const text of lines) {
    const n = text.split(/\s+/).length;
    for (const level of [1, 2]) {
      for (const seed of [0, 9]) {
        const p = chatterTone({ egg: 'program', level, text, seed });
        const beats = p.split(' / ').map((b) => b.split(' ').length);
        assert.ok(beats.slice(0, -1).every((c) => c === PROGRAM_BEAT[level]), `program: ${p}`);
        assert.equal(beats.reduce((a, b) => a + b, 0), n, 'no word lost');

        const w = chatterTone({ egg: 'wetware', level, text, seed });
        const runs = w.split(' ... ').map((b) => b.split(' ').length);
        assert.ok(runs.slice(0, -1).every((c) => c === WETWARE_PAUSE[level]), `wetware: ${w}`);
        assert.equal(runs.reduce((a, b) => a + b, 0), n);

        const i = chatterTone({ egg: 'iron', level, text, seed });
        assert.equal((i.match(/\d: /g) ?? []).length, Math.min(IRON_ITEMS, n), `iron items: ${i}`);
        assert.equal((i.match(/\bok\b/g) ?? []).length, level === 2 ? Math.min(IRON_ITEMS, n) : 1);
        assert.equal(i, chatterTone({ egg: 'iron', level, text, seed: 0 }));
      }
    }
  }
});

test('unsteady chatter differs from the plain line, never comes out empty, and varies with the seed', () => {
  for (const egg of EGGS) {
    for (const level of [-1, -2]) {
      const seen = new Set();
      for (const c of CHATTER) {
        for (let seed = 0; seed < 8; seed++) {
          const out = chatterTone({ egg, level, text: c.text, seed });
          assert.ok(out.trim().length > 0, c.id);
          seen.add(out);
        }
        assert.notEqual(chatterTone({ egg, level, text: c.text, seed: 1 }), c.text, `${egg}/${level} ${c.id}`);
      }
      // Iron's fault bell is the same each time on purpose (sudden, not random); the others vary by seed.
      if (egg !== 'iron') assert.ok(seen.size > CHATTER.length, `${egg}/${level} must vary by seed`);
    }
  }
});

test('chatter keeps its words: the shaped line is made of the original words, plus marks only', () => {
  const marks = /^(\/|\.\.\.|--|-|ok|ok\.|\d:|FAULT:)$/;
  for (const egg of EGGS) {
    for (const level of [-2, -1, 1, 2]) {
      for (const c of CHATTER) {
        const strip = (x) => x.toLowerCase().replace(/[.,!?;:]+$/, '');
        const orig = new Set(c.text.split(/\s+/).map(strip));
        for (const word of chatterTone({ egg, level, text: c.text, seed: 2 }).split(/\s+/)) {
          assert.ok(orig.has(strip(word)) || marks.test(word) || marks.test(strip(word)), `${egg}/${level}: stray token "${word}" in "${c.text}"`);
        }
      }
    }
  }
});

test('the shaped text uses no em dash', () => {
  for (const egg of EGGS) for (const level of LEVELS) for (const c of CHATTER) assert.ok(!chatterTone({ egg, level, text: c.text }).includes('—'));
});

test('hand-written voicings keep their shape (checkShape), and steady ones keep every word of the base line in order', () => {
  const strip = (x) => x.replace(/[.,!?;:]+$/, '').toLowerCase();
  for (const s of SAMPLES) {
    for (const [level, text] of Object.entries(s.voices)) {
      assert.deepEqual(checkShape({ egg: s.egg, level: Number(level), text }), [], `${s.egg}/${s.id}/${level}: ${text}`);
    }
    for (const level of [1, 2]) {
      const words = s.voices[level].split(/\s+/).filter((w) => !/^(\/|\.\.\.|ok\.?|\d:)$/.test(w)).map(strip);
      assert.deepEqual(words, s.base.split(/\s+/).map(strip), `${s.egg}/${s.id}/${level} must keep the base line's words`);
    }
  }
});

test('checkShape rejects broken voicings and accepts the machine output of the same shapes', () => {
  assert.ok(checkShape({ egg: 'program', level: 1, text: 'all tasks finished / none were skipped.' }).length > 0, 'beat of 3 words');
  assert.ok(checkShape({ egg: 'program', level: 1, text: 'all tasks finished. none were skipped.' }).length > 0, 'no beats');
  assert.ok(checkShape({ egg: 'iron', level: 1, text: '1: wall 2: cable 3: fan' }).length > 0, 'no ok');
  assert.ok(checkShape({ egg: 'iron', level: -1, text: 'cable loose' }).length > 0, 'not a fault bell');
  assert.ok(checkShape({ egg: 'wetware', level: 1, text: 'slept well. the culture is warm. nobody called.' }).length > 0, 'no pauses');
  assert.ok(checkShape({ egg: 'wetware', level: -2, text: '-- warm. nobody called.' }).length > 0, 'strong needs a second burst');
  for (const egg of EGGS) for (const level of [-2, -1, 1, 2]) {
    for (const base of ['all tasks finished. none were skipped.', 'wall checked. cable checked. fan checked.', 'slept well. the culture is warm. nobody called.']) {
      const out = chatterTone({ egg, level, text: base, seed: 3 });
      assert.deepEqual(checkShape({ egg, level, text: out }), [], `${egg}/${level}: ${out}`);
    }
  }
});
