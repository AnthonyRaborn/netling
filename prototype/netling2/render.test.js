// The 2.0 renderer pass (render.js): every egg's forms through every layer, the accepted drawing order, the motion pad, hideWorn, the visit
// pause, the self-destruct, the idle hold switch and the flash rule (CLAUDE.md rule 7) on the composed screen.
import './ready.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { composeLCD, paintLCD, drawLCD, LCD_W, LCD_H, BURN_MS, IDLE_HOLDS } from './render.js';
import { forms } from './models.js';
import { programForms } from './program-models.js';
import { wetwareForms } from './wetware-models.js';
import { rogueForms } from './rogue-models.js';
import { DEAD_COLORS, DIM_COLORS, paletteColors } from '../../src/sprites.js';
import { PALETTES } from '../../src/sim.js';
import { IDLE_MAX_X, BEAT_MS } from './tell.js';
import { pickBurn } from './rogue-burn.js';

const SETS = { iron: forms('B'), program: programForms(), wetware: wetwareForms(), rogue: rogueForms() };
const ALL = Object.entries(SETS).flatMap(([egg, set]) => Object.values(set).map((form) => ({ egg, form })));
const STATES = [{ kind: 'overclock' }, { kind: 'overdrive' }, { kind: 'overlink', strained: true }];
const WORN = [{ id: 'crown' }, { id: 'shades' }];

// A 40x28 grid that keeps each cell's colour (alpha kept apart: Wetware's shade is a slow dip, not a colour change).
function gridCtx() {
  const cells = Array.from({ length: LCD_H }, () => Array(LCD_W).fill(null));
  let alphaSeen = 1;
  return {
    cells,
    fillStyle: null,
    get globalAlpha() { return alphaSeen; },
    set globalAlpha(v) { alphaSeen = v; },
    fillRect(x, y, w, h) {
      for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (j >= 0 && j < LCD_H && i >= 0 && i < LCD_W) cells[j][i] = this.fillStyle;
    },
  };
}
const screen = (pet, time, opts) => {
  const g = gridCtx();
  drawLCD(g, pet, time, opts);
  return g.cells;
};

test('every form of every egg composes awake, asleep and dead, with every layer on, inside the screen', () => {
  for (const { egg, form } of ALL) {
    for (const pose of ['awake', 'sleep', 'dead']) {
      for (const time of [0, 499, 500, 1750, 6000, 12_345, 99_999]) {
        const pet = { form, egg, pose, level: -2, idle: 'sway', neglect: 2, bugs: 5, seams: 2, states: STATES, worn: WORN, prop: 'metronome', death: { cause: 'old age', diedAt: 1 } };
        const { ops, box } = composeLCD(pet, time);
        for (const o of ops) for (const k of ['x', 'y']) assert.ok(Number.isFinite(o[k]), `${form.id} ${pose} ${time}: ${o.op}.${k}`);
        assert.ok(box.x >= 0 && box.x + box.w <= LCD_W, `${form.id} ${pose} at ${time}: the figure leaves the screen (${box.x})`);
        assert.ok(box.y >= 0 && box.y + box.h <= LCD_H, `${form.id} ${pose} at ${time}: rows ${box.y}`);
        paintLCD(gridCtx(), composeLCD(pet, time));
      }
    }
  }
});

test('the layers are drawn in the accepted order: figure, wearables, marks, prop, screen', () => {
  const form = SETS.iron.ironAdultBreachStreet;
  const { ops } = composeLCD({ form, egg: 'iron', worn: WORN, states: STATES, prop: 'metronome' }, 1000);
  const kinds = ops.map((o) => o.op);
  assert.equal(kinds[0], 'rows', 'the figure first');
  assert.equal(kinds[1], 'worn', 'wearables over it');
  assert.ok(kinds.slice(2, -1).every((k) => k === 'rect'), 'then the state marks');
  assert.equal(kinds.at(-1), 'rows', 'the prop last');
  // Asleep: no marks, and the Z last.
  const sleep = composeLCD({ form, egg: 'iron', pose: 'sleep', states: STATES, prop: 'metronome' }, 1000).ops;
  assert.equal(sleep.filter((o) => o.op === 'rect').length, 0, 'no marks asleep');
  assert.equal(sleep.length, 3, 'figure, prop, Z');
});

test('a motion layer is drawn at the figure x minus its pad, so the figure does not move', () => {
  for (const { egg, form } of ALL.filter(({ form }) => form.motion)) {
    for (const time of [0, 400, 2000, 4800]) {
      const pet = { form, egg, idle: 'walk', level: 1 };
      const withLayer = composeLCD(pet, time);
      const without = composeLCD({ ...pet, form: { ...form, motion: null } }, time);
      assert.deepEqual(withLayer.box, without.box, `${form.id}: the figure moved`);
      const pad = (withLayer.ops[0].rows[0].length - form.a[0].length) / 2;
      assert.equal(withLayer.ops[0].x, withLayer.box.x - Math.floor(pad), `${form.id}: drawn off its pad`);
    }
  }
});

test('the motion layers pause during a visit, asleep and dead', () => {
  for (const { egg, form } of ALL.filter(({ form }) => form.motion)) {
    for (const pet of [{ visit: true }, { pose: 'sleep' }, { pose: 'dead' }]) {
      const { ops } = composeLCD({ form, egg, ...pet }, 2000);
      assert.equal(ops[0].rows[0].length, form.a[0].length, `${form.id} ${JSON.stringify(pet)}: a padded layer`);
    }
  }
});

test('a vanished Sleeper hides what it wears; the other forms always draw it', () => {
  const sleepers = ALL.filter(({ form }) => form.hideWorn);
  assert.ok(sleepers.length >= 1, 'no form hides its wearables');
  for (const { egg, form } of sleepers) {
    let hidden = 0;
    let shown = 0;
    for (let t = 0; t < 12 * 400; t += 400) {
      const worn = composeLCD({ form, egg, worn: WORN, idle: 'none' }, t + 1).ops.some((o) => o.op === 'worn');
      assert.equal(worn, !form.hideWorn({ time: t + 1 }), `${form.id} at ${t}`);
      worn ? shown++ : hidden++;
    }
    assert.ok(hidden > 0 && shown > 0, `${form.id}: hidden ${hidden}, shown ${shown}`);
    assert.ok(composeLCD({ form, egg, worn: WORN }, 1600, { reduced: true }).ops.some((o) => o.op === 'worn'), 'reduced motion never vanishes');
  }
});

test('wearables are placed on the registered, unglanced, unpadded frame', () => {
  const form = Object.values(SETS.rogue).find((f) => f.stage === 'elder' && !f.hideWorn);
  for (let t = 0; t < 12_000; t += 250) {
    const { ops, box } = composeLCD({ form, egg: 'rogue', level: -2, seed: 3, worn: WORN }, t);
    const worn = ops.find((o) => o.op === 'worn');
    assert.ok(worn.sprite === form.a || worn.sprite === form.b, `at ${t}: wearables on a drawn-over frame`);
    assert.equal(worn.x, box.x);
  }
});

test('the self-destruct: the picked burn in the palette, no wearables, then the ash heap in the dead colours', () => {
  const form = Object.values(SETS.rogue)[3];
  const death = { cause: 'captured', diedAt: 1_234_567 };
  const pet = { form, egg: 'rogue', pose: 'dead', death, worn: WORN };
  const colors = paletteColors(PALETTES[0]);
  let changed = 0;
  let prev;
  for (let t = 0; t < BURN_MS; t += 100) {
    const { ops } = composeLCD(pet, 50_000 + t, { burnStart: 50_000 });
    assert.ok(!ops.some((o) => o.op === 'worn'), 'wearables while burning');
    assert.deepEqual(ops[0].colors, colors, `at ${t}: not in the palette`);
    const key = ops[0].rows.join('/');
    if (prev !== undefined && key !== prev) changed++;
    prev = key;
  }
  assert.ok(changed >= 5, `the burn barely moved (${changed} changes)`);
  const after = composeLCD(pet, 50_000 + BURN_MS, { burnStart: 50_000 }).ops[0];
  assert.deepEqual(after.rows, form.captured);
  assert.equal(after.colors, DEAD_COLORS);
  // No burn start (a capture caught up on load), reduced motion, or another cause: the pose at once.
  assert.deepEqual(composeLCD(pet, 50_000).ops[0].rows, form.captured);
  assert.deepEqual(composeLCD(pet, 50_100, { burnStart: 50_000, reduced: true }).ops[0].rows, form.captured);
  assert.deepEqual(composeLCD({ ...pet, death: { cause: 'old age', diedAt: 1 } }, 50_100, { burnStart: 50_000 }).ops[0].rows, form.dead);
  // An NL-0 form has no capture pose: its dead pose.
  assert.deepEqual(composeLCD({ form: SETS.iron.ironAdultBreachStreet, egg: 'iron', pose: 'dead', death }, 50_100, { burnStart: 50_000 }).ops[0].rows, SETS.iron.ironAdultBreachStreet.dead);
  // The same death burns the same way on every draw; another death may not.
  const at = (diedAt) => composeLCD({ ...pet, death: { cause: 'captured', diedAt } }, 51_200, { burnStart: 50_000 }).ops[0].rows.join('/');
  assert.equal(at(1_234_567), at(1_234_567));
  const differs = [1, 2, 3, 4, 5, 6, 7, 8].filter((d) => pickBurn(d) !== pickBurn(1_234_567));
  assert.ok(differs.length > 0 && at(differs[0]) !== at(1_234_567), 'every burn looks alike');
});

test('the room: lights off darkens it, a netling asleep in the dark is dimmed, the Z shows while it rests', () => {
  const form = SETS.program[Object.keys(SETS.program)[0]];
  const lit = composeLCD({ form, egg: 'program', pose: 'sleep' }, 0);
  const dark = composeLCD({ form, egg: 'program', pose: 'sleep', lightsOn: false, worn: WORN }, 0);
  assert.notEqual(lit.bg, dark.bg);
  assert.equal(dark.ops[0].colors, DIM_COLORS);
  assert.equal(dark.ops.find((o) => o.op === 'worn').dim, true);
  assert.equal(dark.ops.at(-1).rows.length, 4, 'the Z');
  assert.equal(composeLCD({ form, egg: 'program', pose: 'dead', lightsOn: false }, 0).bg, lit.bg, 'the dead screen is not darkened (as 1.0)');
  assert.equal(composeLCD({ form, egg: 'program', pose: 'dead' }, 0).ops.at(-1).w, LCD_W, 'the flatline');
});

test('the idle hold switch: steady holds a steady Iron around its beat, none is the plain 1.0 idle', () => {
  assert.deepEqual(Object.keys(IDLE_HOLDS), ['steady', 'none']);
  const form = SETS.iron.ironAdultBreachStreet;
  let moved = 0;
  for (let t = 6000 - 200; t < 6000 + 600; t += 50) {
    const pet = { form, egg: 'iron', level: 1, idle: 'sway' };
    const held = composeLCD(pet, t, { idleHold: 'steady' }).box.x;
    assert.equal(held, composeLCD(pet, 6000 - 200, { idleHold: 'steady' }).box.x, `steady: moved at ${t}`);
    if (composeLCD(pet, t, { idleHold: 'none' }).box.x !== composeLCD(pet, 6000 - 200, { idleHold: 'none' }).box.x) moved++;
  }
  assert.ok(moved > 0, 'none held the idle too');
  // The other eggs never hold.
  for (const t of [5900, 6100, 6400]) {
    const pet = { form: SETS.program[Object.keys(SETS.program)[0]], egg: 'program', level: 1, idle: 'sway' };
    assert.deepEqual(composeLCD(pet, t, { idleHold: 'steady' }).box, composeLCD(pet, t, { idleHold: 'none' }).box);
  }
  assert.equal(BEAT_MS[1], 6000);
});

test("Iron's drift never takes it past the edge of 1.0's idle wander", () => {
  const form = SETS.iron.ironAdultBreachStreet;
  const centre = Math.floor((LCD_W - form.a[0].length) / 2);
  for (const idle of ['sway', 'hover', 'walk']) for (let t = 0; t < 60_000; t += 100) {
    const { box } = composeLCD({ form, egg: 'iron', level: -2, seed: 5, idle }, t);
    assert.ok(Math.abs(box.x - centre) <= IDLE_MAX_X, `${idle} at ${t}: ${box.x - centre}`);
  }
});

// The flash rule on the composed screen (CLAUDE.md rule 7: nothing flashes more than three times a second). A flash is a pair of opposite
// changes, so no cell of the screen may change colour more than six times in any one second. The layers run on their own clocks (1.0's
// 500 ms frames, the motion layers' and marks' 400 ms steps, the tell's 200 ms slots), so two changes of one cell can land 100 ms apart
// where two clocks meet; each layer keeps the stricter FLASH_TOGGLE_MS rule on its own (its own tests), and this checks what they add up
// to. The idle is still (its wander moves the whole figure, which is motion, not a flash, as in 1.0); every other layer is on, on every egg,
// at every tell level, in both motion settings.
// -> the most times any one cell changed colour within one second, sampled at 60 fps from 1 s to 13 s.
function worstPerSecond(pet, opts) {
  const STEP = 1000 / 60;
  const changes = Array.from({ length: LCD_H }, () => Array.from({ length: LCD_W }, () => []));
  let prev = null;
  let worst = 0;
  for (let t = 1000; t < 13_000; t += STEP) {
    const cells = screen(pet, t, opts);
    if (prev) for (let y = 0; y < LCD_H; y++) for (let x = 0; x < LCD_W; x++) {
      if (cells[y][x] === prev[y][x]) continue;
      const list = changes[y][x];
      list.push(t);
      while (t - list[0] >= 1000) list.shift();
      worst = Math.max(worst, list.length);
    }
    prev = cells;
  }
  return worst;
}

test('no cell of the screen changes more than six times in any second (every layer on, the idle still)', () => {
  const pick = (set) => { const v = Object.values(set); return [v[0], v[Math.floor(v.length / 2)], v.at(-1)]; };
  const over = [];
  let worst = 0;
  for (const [egg, set] of Object.entries(SETS)) for (const form of pick(set)) for (const level of [-2, -1, 0, 1, 2]) for (const reduced of [false, true]) {
    const pet = { form, egg, level, seed: 11, idle: 'none', neglect: 1, bugs: 3, seams: 1, states: STATES, worn: WORN, prop: 'metronome' };
    const n = worstPerSecond(pet, { reduced });
    worst = Math.max(worst, n);
    if (n > 6) over.push(`${form.id} level ${level}${reduced ? ' reduced' : ''}: ${n}`);
  }
  assert.deepEqual(over, [], `worst ${worst} changes in a second`);
  // The self-destruct's screen, every Rogue form, the burn starting at 1.5 s.
  for (const form of Object.values(SETS.rogue)) {
    const n = worstPerSecond({ form, egg: 'rogue', pose: 'dead', death: { cause: 'captured', diedAt: 99 } }, { burnStart: 1500 });
    assert.ok(n <= 6, `${form.id}'s burn: ${n} changes in a second`);
  }
  // The check can fail: a layer that strobes every 100 ms is caught.
  const form = SETS.iron.ironAdultBreachStreet;
  const strobe = { ...form, motion: (rows, a, { time }) => (Math.floor(time / 100) % 2 ? rows.map((r) => r.replaceAll('#', 'x')) : rows) };
  assert.ok(worstPerSecond({ form: strobe, egg: 'iron', idle: 'none' }, {}) > 6, 'a strobe passed');
});

test('the same pet at the same time draws the same screen (no hidden state)', () => {
  for (const { egg, form } of ALL.slice(0, 20)) {
    const pet = { form, egg, level: -1, idle: 'walk', bugs: 2, neglect: 1, worn: WORN, states: STATES };
    assert.deepEqual(screen(pet, 7777), screen(pet, 7777));
  }
});
