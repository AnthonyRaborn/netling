// Tests for the temper pass (docs/NETLING_2_SPRITES.md, Next phase 3): the tell composed with 1.0's idle wander and with
// wearables, on every form of every egg. Deterministic. The findings that are measurements, not rules (how often Iron's settle
// is masked by the idle, which wearables the tell clips) come from `node prototype/netling2/temper-audit.mjs`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './ready.js'; // first: registers the forms before src/sim.js can load src/accessories.js (see ready.js)
import { forms } from './models.js';
import { programForms } from './program-models.js';
import { wetwareForms } from './wetware-models.js';
import { temperTell, tellPose, EGGS } from './tell.js';
import { placeWorn, ACCESSORIES } from '../../src/accessories.js';

const LCD = { w: 40, h: 28 };
const EGG_FORMS = { iron: forms('B'), program: programForms(), wetware: wetwareForms() };
const every = () => Object.entries(EGG_FORMS).flatMap(([egg, set]) => Object.values(set).map((f) => ({ egg, f })));
const IDLE_X = 8; // 1.0's idle wander and sway reach 8 columns either way (src/render.js)

test('the tell never pushes a form off the LCD, at the far end of 1.0\'s idle wander, on any form of its own egg', () => {
  for (const { egg, f } of every()) {
    const w = Math.max(f.a[0].length, f.motion ? f.motion(f.a, f.anchors.a, { time: 0 })[0].length : 0);
    let dxMin = 0;
    let dxMax = 0;
    let dyMin = 0;
    let dyMax = 0;
    for (const level of [-2, -1, 0, 1, 2]) {
      for (let time = 0; time < 24_000; time += 50) {
        for (const reduced of [false, true]) {
          const t = temperTell({ egg, level, time, reduced, seed: 4 });
          dxMin = Math.min(dxMin, t.dx);
          dxMax = Math.max(dxMax, t.dx);
          dyMin = Math.min(dyMin, t.dy);
          dyMax = Math.max(dyMax, t.dy);
        }
      }
    }
    const base = Math.floor((LCD.w - w) / 2);
    assert.ok(base - IDLE_X + dxMin >= 0, `${egg}/${f.id}: ${base - IDLE_X + dxMin} off the left edge`);
    assert.ok(base + IDLE_X + dxMax + w <= LCD.w, `${egg}/${f.id}: off the right edge`);
    const y0 = 20 - f.a.length;
    assert.ok(y0 - Math.min(3, Math.max(0, y0 - 5)) + dyMin >= 0, `${egg}/${f.id}: off the top`);
    assert.ok(y0 + 1 + dyMax + f.a.length <= LCD.h, `${egg}/${f.id}: off the bottom`);
  }
});

test('a blink draws the sleep pose but places wearables on the awake frame, so no wearable changes shape on a beat', () => {
  assert.deepEqual(tellPose({ frame: 0, blink: true }), { draw: 'sleep', wear: 'a' });
  assert.deepEqual(tellPose({ frame: 1, blink: true }), { draw: 'sleep', wear: 'b' });
  assert.deepEqual(tellPose({ frame: 1, blink: false }), { draw: 'b', wear: 'b' });
  assert.deepEqual(tellPose({ frame: 0, blink: true }, 'sleep'), { draw: 'sleep', wear: 'sleep' }, 'a resting netling has no tell');
  assert.deepEqual(tellPose({ frame: 0, blink: false }, 'dead'), { draw: 'dead', wear: 'dead' });
  // Why: placed on the sleep pose, eyewear differs from the awake placement (66 Program form and wearable pairs at the last audit).
  const eyewear = ACCESSORIES.filter((a) => a.slot === 'face').map((a) => a.id);
  let differs = 0;
  for (const f of Object.values(EGG_FORMS.program)) {
    for (const id of eyewear) {
      const cells = (s) => placeWorn([{ id }], s, {})[0].pts.map((p) => `${p.x},${p.y}`).sort().join('|');
      if (cells(f.a) !== cells(f.sleep)) differs++;
    }
  }
  assert.ok(differs > 0, 'if this ever reaches 0 the rule above is no longer needed');
});

test('only Program blinks, and only on the beat: the other skins never ask for the sleep pose', () => {
  for (const egg of EGGS) {
    let blinks = 0;
    for (const level of [-2, -1, 0, 1, 2]) for (let time = 0; time < 24_000; time += 50) blinks += temperTell({ egg, level, time, seed: 2 }).blink ? 1 : 0;
    assert.equal(blinks > 0, egg === 'program', `${egg}: ${blinks} blink samples`);
  }
});

// --- Iron's steady hold (maintainer: the idle pauses around the settle) ----------------------------------------------------------
import { readFileSync } from 'node:fs';
import { idleClock, idleHeld, BEAT_MS, HOLD_BEFORE_MS, HOLD_AFTER_MS } from './tell.js';
import { idleOffset, QUIRKS } from './idle.js';

test('idle.js uses the same walk constants as src/render.js', () => {
  const src = readFileSync(new URL('../../src/render.js', import.meta.url), 'utf8');
  assert.match(src, /const WALK_SEGMENT_MS = 5000;/);
  assert.match(src, /const WALK_MOVE_MS = 2200;/);
  assert.match(src, /Math\.sin\(time \/ 1500\) \* 8/);
  assert.match(src, /Math\.sin\(time \/ 2600\) \* 7/);
  assert.match(src, /Math\.sin\(time \/ 600\) \* 2\) - 1/);
});

test('the hold only applies to a steady Iron: every other egg and level keeps the real clock', () => {
  for (const egg of EGGS) {
    for (const level of [-2, -1, 0, 1, 2]) {
      const holds = egg === 'iron' && level > 0;
      for (let time = 0; time < 30_000; time += 130) {
        assert.equal(idleClock({ egg, level, time }), holds ? idleClock({ egg, level, time }) : time);
        if (!holds) assert.equal(idleHeld({ egg, level, time }), false);
      }
    }
  }
});

test('the idle clock is continuous and never runs backwards: the pause resumes where it stopped, with no jump', () => {
  for (const level of [1, 2]) {
    let last = idleClock({ egg: 'iron', level, time: 0 });
    for (let time = 1; time < 60_000; time++) {
      const now = idleClock({ egg: 'iron', level, time });
      assert.ok(now >= last, `level ${level} at ${time}: ran backwards`);
      assert.ok(now - last <= 1, `level ${level} at ${time}: jumped ${now - last} ms`);
      last = now;
    }
  }
});

test('the idle is still for the whole hold window of every beat, and the settle falls inside it', () => {
  for (const level of [1, 2]) {
    const interval = BEAT_MS[level];
    for (let k = 1; k <= 20; k++) {
      const beat = k * interval;
      const start = beat - HOLD_BEFORE_MS;
      const end = beat + HOLD_AFTER_MS;
      for (const quirk of QUIRKS) {
        for (const h of [11, 14, 15]) {
          const first = idleOffset(quirk, h, idleClock({ egg: 'iron', level, time: start }));
          for (let time = start; time < end; time += 10) {
            assert.deepEqual(idleOffset(quirk, h, idleClock({ egg: 'iron', level, time })), first, `${quirk}/${h} level ${level}: idle moved at ${time}`);
            assert.equal(idleHeld({ egg: 'iron', level, time }), true);
          }
        }
      }
      // The settle (dy = 1) is inside the window.
      for (let time = beat; time < beat + 400; time += 10) assert.equal(temperTell({ egg: 'iron', level, time }).dy, 1);
      assert.equal(idleHeld({ egg: 'iron', level, time: end }), false);
      assert.equal(idleHeld({ egg: 'iron', level, time: start - 1 }), false);
    }
  }
});

test('the idle runs at its own pace between beats, and is paused for 13% (steady) and 27% (strongly steady) of the time', () => {
  for (const [level, share] of [[1, 800 / 6000], [2, 800 / 3000]]) {
    const span = BEAT_MS[level] * 100;
    const run = idleClock({ egg: 'iron', level, time: span + 5000 }) - idleClock({ egg: 'iron', level, time: 5000 });
    assert.ok(Math.abs(run - span * (1 - share)) <= 1, `level ${level}: ${run} ms of idle in ${span} ms`);
  }
});

// --- visits: the layers pause, the sprite plays 1.0's bounce ---------------------------------------------------------------
import { readFileSync as readSrc } from 'node:fs';
import { visitLayers, visitMotion } from './visit.js';

test('during a visit every layer is off: no tell, neglect, bugs, idle or marks; outside one the state is untouched', () => {
  const state = { level: -2, neglect: 2, bugs: 5, idle: 'hover', marks: true, seed: 3 };
  assert.deepEqual(visitLayers(state, false), state);
  assert.deepEqual(visitLayers(state, true), { level: 0, neglect: 0, bugs: 0, idle: 'none', marks: false, seed: 3 });
  // Level 0 is the 1.0 rhythm for every egg: no offset, no blink, full brightness.
  for (const egg of EGGS) assert.deepEqual(temperTell({ egg, level: 0, time: 1234, seed: 3 }), { frame: Math.floor(1234 / 500) % 2, blink: false, dx: 0, dy: 0, shade: 1 });
});

test('the visit bounce matches src/render.js and keeps every form clear of the visitor and on screen', () => {
  const src = readSrc(new URL('../../src/render.js', import.meta.url), 'utf8');
  assert.match(src, /Math\.sin\(time \/ 700 \+ phase\) \+ 1\) \* 2/);
  assert.match(src, /x = LCD_W - 1 - sprite\[0\]\.length - swing\(Math\.PI\)/);
  assert.match(src, /y = 20 - sprite\.length - hop\(!frame\)/);
  for (const { f } of every()) {
    const w = f.a[0].length;
    for (const visitorWidth of [12, 16, 18]) {
      for (const calm of [false, true]) {
        for (let time = 0; time < 10_000; time += 50) {
          const m = visitMotion({ w, h: f.a.length, visitorWidth, time, calm });
          assert.ok(m.x + w <= LCD.w && m.x >= 0, `${f.id}: off screen at ${time}`);
          assert.ok(m.y >= 0, `${f.id}: off the top`);
          // The visitor stands at the left (1 + its own swing, at most swingCap): the gap never closes below 2 columns.
          const cap = Math.max(0, Math.floor((LCD.w - 4 - w - visitorWidth) / 2));
          assert.ok(m.x - (1 + cap + visitorWidth) >= 2, `${f.id} vs ${visitorWidth}: closer than the 1.0 rule allows`);
        }
      }
    }
  }
});
