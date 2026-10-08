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
