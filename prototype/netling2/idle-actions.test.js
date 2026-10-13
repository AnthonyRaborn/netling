// Tests for the idle actions (idle-actions.js, a draft) and their place in the renderer pass: every routine step and stray of every egg
// drawn by rule on every form, on the 500 ms grid, still under reduced motion, with 1.0's idle held while one plays. Deterministic.
import './ready.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACTIONS, ACTION_PAD, UNIT_MS, actionAt, actionWindows, applyAction, heldClock, keyframe } from './idle-actions.js';
import { ROUTINE, STRAYS } from './voice.js';
import { idleClock, tellHoldWindows } from './tell.js';
import { composeLCD, LCD_W, LCD_H } from './render.js';
import { forms } from './models.js';
import { programForms } from './program-models.js';
import { wetwareForms } from './wetware-models.js';
import { rogueForms } from './rogue-models.js';

const SETS = { iron: forms('B'), program: programForms(), wetware: wetwareForms(), rogue: rogueForms() };
const ALL = Object.entries(SETS).flatMap(([egg, set]) => Object.values(set).map((form) => ({ egg, form })));
const LEVELS = [-2, -1, 1, 2];
const eyes = (rows) => rows.join('').split('o').length - 1;

// Every keyframe of an action, for a step `units` long.
function poses(egg, name, form, units = 12) {
  const out = [];
  for (let k = 0; k < units; k++) out.push(keyframe(egg, name, k * UNIT_MS, units * UNIT_MS, form));
  return out;
}

test('every routine step and every stray of every egg has a drawing, and nothing else does', () => {
  for (const egg of Object.keys(SETS)) {
    assert.deepEqual(Object.keys(ACTIONS[egg]).sort(), [...new Set([...ROUTINE[egg], ...STRAYS[egg]])].sort(), egg);
  }
});

test('on every form, every action changes the picture, keeps the frame rectangular and only grows or shrinks by a row', () => {
  for (const { egg, form } of ALL) {
    const w = form.a[0].length;
    for (const name of Object.keys(ACTIONS[egg])) {
      let seen = false;
      for (const pose of poses(egg, name, form)) {
        const { rows, lift } = applyAction(form.a, form, 'a', pose, 0);
        assert.equal(rows.length, form.a.length + lift, `${form.id} ${name}`);
        assert.ok(rows.every((r) => r.length === w + 2 * ACTION_PAD), `${form.id} ${name}: rectangular`);
        const padded = form.a.map((r) => '.'.repeat(ACTION_PAD) + r + '.'.repeat(ACTION_PAD));
        if (rows.join('\n') !== padded.join('\n') || pose.marks?.(form).length || pose.move || pose.hold) seen = true;
        if (pose.look && !pose.lit) assert.equal(eyes(rows), eyes(form.a), `${form.id} ${name}: the eyes move whole`);
      }
      assert.ok(seen, `${form.id} ${name}: nothing shows`);
    }
  }
});

test('the check lights of Iron\'s routine sit on four different rows, top to bottom, on every Iron form', () => {
  for (const form of Object.values(SETS.iron)) {
    const rowOf = (name) => {
      const { rows } = applyAction(form.a, form, 'a', ACTIONS.iron[name].frames[1] ?? ACTIONS.iron[name].frames[0], 0);
      const plain = form.a.map((r) => '.'.repeat(ACTION_PAD) + r + '.'.repeat(ACTION_PAD));
      return rows.findIndex((r, y) => [...r].some((c, x) => c === '+' && plain[y]?.[x] !== '+'));
    };
    const ys = ['neck', 'arm', 'hip', 'base'].map(rowOf);
    assert.ok(ys.every((y) => y >= 0), `${form.id}: every joint lit (${ys})`);
    // A baby has no row between its body and its feet, so its hip and base share the feet row (the bend and the rise tell them apart).
    assert.ok(ys[0] < ys[2] && ys[2] <= ys[3], `${form.id}: neck above hip, hip not below base (${ys})`);
    assert.ok(ys[0] < ys[1], `${form.id}: neck above the shoulder (${ys})`);
  }
});

test('an action only changes on the 500 ms grid, and under reduced motion it holds one pose for its whole span', () => {
  for (const egg of Object.keys(SETS)) {
    const form = Object.values(SETS[egg])[2];
    for (const level of LEVELS) for (const seed of [0, 3]) {
      let prev = null;
      let prevReduced = null;
      for (let t = 0; t < 60_000; t += 100) {
        const a = actionAt({ egg, level, time: t, seed, form });
        const key = a ? `${a.name}|${JSON.stringify(a.pose)}|${a.pose.marks ? JSON.stringify(a.pose.marks(form)) : ''}|${a.pose.scan ?? ''}` : null;
        if (key !== prev) assert.equal(t % UNIT_MS, 0, `${egg} ${level} seed ${seed}: changed at ${t}`);
        prev = key;
        const r = actionAt({ egg, level, time: t, seed, form, reduced: true });
        const rk = r ? `${r.name}|${r.span}|${JSON.stringify(r.pose)}` : null;
        if (r && prevReduced && rk.split('|')[0] === prevReduced.split('|')[0] && r.elapsed > 0) assert.equal(rk, prevReduced, `${egg} ${level}: the reduced pose moved at ${t}`);
        prevReduced = rk;
      }
    }
  }
});

test('the middle level has no idle action; steady plays the routine in order on the clock, unsteady only strays', () => {
  for (const egg of Object.keys(SETS)) {
    const form = Object.values(SETS[egg])[0];
    for (let t = 0; t < 60_000; t += 250) assert.equal(actionAt({ egg, level: 0, time: t, form }), null);
    const steps = [0, 12_000, 24_000, 36_000].map((time) => actionAt({ egg, level: 1, time, form }).name);
    assert.deepEqual(steps, ROUTINE[egg]);
    for (let t = 0; t < 120_000; t += 250) {
      const a = actionAt({ egg, level: -2, time: t, seed: 9, form });
      if (a) assert.ok(STRAYS[egg].includes(a.name) && !a.scheduled, `${egg}: ${a.name}`);
    }
  }
});

test('composed with every layer on, every action on every form stays on the screen', () => {
  for (const { egg, form } of ALL) {
    for (const level of LEVELS) for (const idle of ['sway', 'walk']) for (let t = 0; t < 40_000; t += 250) {
      // Without the form's motion layer: a hidden elder's echo can clip at the far end of the wander on its own (docs/NETLING_2_SPRITES.md,
      // 2a), and render.test.js covers the layers; this checks what the action adds.
      const pet = { form: { ...form, motion: undefined }, egg, level, seed: 4, idle, neglect: 1, bugs: 2, seams: 1, worn: [{ id: 'crown' }, { id: 'shades' }] };
      if (!actionAt({ egg, level, time: t, seed: 4, form })) continue; // only what an action draws (the rest is render.test.js's)
      const scene = composeLCD(pet, t);
      for (const o of scene.ops) {
        if (o.op === 'rect') assert.ok(o.x >= 0 && o.x < LCD_W && o.y >= 0 && o.y < LCD_H, `${form.id} ${level} ${t}: a mark at ${o.x},${o.y}`);
        if (o.op === 'rows') {
          o.rows.forEach((r, j) => [...r].forEach((c, i) => {
            if (c !== '.') assert.ok(o.x + i >= 0 && o.x + i < LCD_W && o.y + j >= 0 && o.y + j < LCD_H, `${form.id} ${level} ${idle} ${t}: a cell at ${o.x + i},${o.y + j}`);
          }));
        }
      }
    }
  }
});

test('1.0\'s idle holds still while an action plays (decided), and the clock never runs backwards or counts a pause twice', () => {
  const form = SETS.wetware.wetwareAdultFeastCorp;
  const pet = { form, egg: 'wetware', level: 1, idle: 'sway', seed: 2 };
  // A steady Wetware: the routine step plays from 12 s to 18 s; the box stays where the idle stopped (a stretch keeps its position).
  const x0 = composeLCD(pet, 12_000).box.x;
  for (let t = 12_000; t < 18_000; t += 100) assert.equal(composeLCD(pet, t).box.x, x0, `moved at ${t}`);
  assert.notEqual(composeLCD(pet, 15_000, { idleHold: 'tell' }).box.x, composeLCD(pet, 12_000, { idleHold: 'tell' }).box.x, 'without the action hold it sways');
  for (const egg of Object.keys(SETS)) for (const level of LEVELS) for (const seed of [0, 5]) {
    let prev = -1;
    for (let t = 0; t < 90_000; t += 50) {
      const c = heldClock({ egg, level, time: t, seed });
      assert.ok(c >= prev - 1e-9 && c <= t, `${egg} ${level}: ${c} at ${t}`);
      prev = c;
    }
    // The pause is exactly the union of the tell's and the actions' windows.
    const T = 90_000;
    const ws = [...tellHoldWindows({ egg, level, seed, from: 0, to: T }), ...actionWindows({ egg, level, seed, from: 0, to: T })].sort((a, b) => a[0] - b[0]);
    let paused = 0;
    let reach = 0;
    for (const [a, b] of ws) {
      const s = Math.max(a, reach);
      if (b > s) paused += b - s;
      reach = Math.max(reach, b);
    }
    assert.ok(Math.abs(T - heldClock({ egg, level, time: T, seed }) - paused) < 1e-6, `${egg} ${level} ${seed}`);
  }
  // The tell's windows are the pauses idleClock already counts.
  for (const [egg, level] of [['iron', 1], ['iron', 2], ['iron', -2], ['program', -2]]) {
    const T = 77_777;
    const sum = tellHoldWindows({ egg, level, seed: 3, from: 0, to: T }).reduce((s, [a, b]) => s + b - a, 0);
    assert.ok(Math.abs(T - idleClock({ egg, level, time: T, seed: 3 }) - sum) < 1e-6, `${egg} ${level}`);
  }
});

test('wearables follow the head and the lift; turned away, the face items are not drawn', () => {
  const form = SETS.rogue.rogueAdultBreach;
  const pet = { form, egg: 'rogue', level: 1, idle: 'none', worn: [{ id: 'crown' }, { id: 'shades' }] };
  // The watch: left at 0 s, right at 12 s, behind at 24 s, still at 36 s.
  const worn = (t) => composeLCD(pet, t).ops.find((o) => o.op === 'worn');
  assert.ok(worn(600).warp, 'turning the head warps the wearables');
  assert.deepEqual(worn(600).warp(5, 0), [4, 0], 'the crown goes left with the head');
  assert.deepEqual(worn(600).warp(5, form.a.length - 1), [5, form.a.length - 1], 'the body stays');
  assert.deepEqual(worn(24_600).list.map((w) => w.id), ['crown'], 'behind: no shades');
  const wet = { form: SETS.wetware.wetwareAdultFeastCorp, egg: 'wetware', level: 1, idle: 'none', worn: [{ id: 'crown' }] };
  assert.deepEqual(composeLCD(wet, 600).ops.find((o) => o.op === 'worn').warp(5, 0), [5, -1], 'a stretch lifts the crown a row');
});

test('Rogue\'s still holds the frame on A and parks the motion layer; its glance does not stack on a look', () => {
  const form = SETS.rogue.rogueAdultDodge;
  const pet = { form, egg: 'rogue', level: 1, idle: 'none' };
  const fig = (t) => composeLCD(pet, t).ops[0].rows.join('\n');
  const still = new Set();
  for (let t = 36_500; t < 42_000; t += 100) still.add(fig(t)); // after the steady glance on the beat (the tell keeps its beat)
  assert.equal(still.size, 1, 'still: one picture for the whole step');
  const free = new Set();
  for (let t = 42_000; t < 48_000; t += 100) free.add(fig(t));
  assert.ok(free.size > 1, 'after it, the frames and the layer run again');
  // Left at 0 s, and the steady glance (also left) on the same beat: the eyes move one cell, not two.
  const rows = composeLCD(pet, 100).ops[0].rows;
  const an = form.anchors.a;
  const pad = (rows[0].length - form.a[0].length) / 2;
  const xs = (r) => [...r].map((c, i) => (c === 'o' ? i : -1)).filter((i) => i >= 0);
  const plain = xs(form.a[an.eyeRow + 1]).map((x) => x + pad - 1); // the head turns a column left, the eyes a further column
  assert.deepEqual(xs(rows[an.eyeRow + 1]), plain.map((x) => x - 1));
});
