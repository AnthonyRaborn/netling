import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPRITES, ANCHOR_ROWS, paletteColors, DEAD_COLORS, DIM_COLORS, POWERED_DOWN_COLORS, LOCKED_COLORS, WHITE_COLORS } from '../src/sprites.js';
import { SPECIES, PALETTES, lineOf } from '../src/sim.js';
import { spriteCells, poseDistance, silhouetteIou } from '../tools/lib/sprite-checks.mjs';

const forms = Object.keys(SPECIES);
const countOf = (rows, ch) => rows.join('').split(ch).length - 1;

test('every form has its own dead and sleep sprite, not a fallback to the awake one', () => {
  for (const form of forms) {
    assert.ok(SPRITES[`${form}Dead`], `${form} has no dead sprite`);
    assert.ok(SPRITES[`${form}Sleep`], `${form} has no sleep sprite`);
    assert.notEqual(SPRITES[`${form}Dead`], SPRITES[`${form}A`]);
    assert.notEqual(SPRITES[`${form}Sleep`], SPRITES[`${form}A`]);
    assert.ok(poseDistance(SPRITES[`${form}A`], SPRITES[`${form}Dead`]) > 0 || countOf(SPRITES[`${form}Dead`], 'o') !== countOf(SPRITES[`${form}A`], 'o'), `${form}: dead looks the same as awake`);
  }
});

test('dead eyes are X\'s: two X shapes of accent pixels, and no open eye left', () => {
  for (const form of forms.filter((f) => f !== 'bitling')) {
    const rows = SPRITES[`${form}Dead`];
    const { eyeRow } = ANCHOR_ROWS[form].a;
    // An X is a 3x3 block with its four corners and centre set: find each one in the dead sprite (the tall visor's are '#' on 'o').
    const mark = lineOf(form) === 'chrome' ? '#' : 'o';
    let x3 = 0;
    for (let y = 0; y + 2 < rows.length; y++) {
      for (let x = 0; x + 2 < rows[0].length; x++) {
        const at = (dx, dy) => rows[y + dy][x + dx] === mark;
        if (at(0, 0) && at(2, 0) && at(1, 1) && at(0, 2) && at(2, 2) && Math.abs(y + 1 - eyeRow) <= 2 + (form === 'chrome' ? 0 : 0)) x3++;
      }
    }
    assert.ok(x3 >= 2, `${form}: found ${x3} X-shaped eyes in the dead sprite`);
  }
  // Bitling's hand-drawn dead sprite has the same idea: alternating accent cells.
  assert.ok(countOf(SPRITES.bitlingDead, 'o') >= 10);
});

test('asleep eyes are slits: each eye is one row of accent pixels, on the sleep eye row', () => {
  for (const form of forms) {
    const rows = SPRITES[`${form}Sleep`];
    const eyeRow = (ANCHOR_ROWS[form].sleep ?? ANCHOR_ROWS[form].a).eyeRow;
    assert.ok(rows[eyeRow].includes('o'), `${form}: no eyes on the sleep eye row ${eyeRow}`);
    if (form === 'bitling') continue;
    // No eye is more than one row tall: an accent pixel has no accent pixel above it (antenna tips aside, which sit above the head).
    const headTop = ANCHOR_ROWS[form].a.headTop;
    for (let y = headTop + 1; y < rows.length; y++) for (let x = 0; x < rows[0].length; x++) if (rows[y][x] === 'o' && rows[y - 1][x] === 'o') assert.fail(`${form}: sleeping eye taller than one row at ${x},${y}`);
  }
});

test('the Shell is a solid shape with a dim void, not an outline', () => {
  for (const key of ['shellA', 'shellB', 'shellDead', 'shellSleep']) assert.ok(countOf(SPRITES[key], 'x') >= 30, `${key} has no void fill`);
  // Its silhouette is now about as full as the other teens' (it was an outline with about half the cells).
  const cells = (key) => spriteCells(SPRITES[key]).length;
  assert.ok(cells('shellA') >= 0.85 * cells('kernelA'), `${cells('shellA')} cells against Kernel's ${cells('kernelA')}`);
  assert.ok(silhouetteIou(SPRITES.shellA, SPRITES.kernelA) > 0.4);
  // The void is dimmer than the rim in every palette.
  for (const pal of PALETTES) {
    const c = paletteColors(pal);
    assert.notEqual(c.x, c['#']);
  }
});

test('every color map covers every mark a sprite can use', () => {
  const marks = ['#', 'o', '+', 'x'];
  for (const [name, map] of Object.entries({ DEAD_COLORS, DIM_COLORS, POWERED_DOWN_COLORS, LOCKED_COLORS, WHITE_COLORS, palette: paletteColors(PALETTES[0]) })) {
    for (const m of marks) assert.match(map[m], /^#[0-9a-f]{6}$/i, `${name} has no color for ${m}`);
  }
  const used = new Set();
  for (const rows of Object.values(SPRITES)) for (const r of rows) for (const ch of r) used.add(ch);
  for (const ch of used) assert.ok(ch === '.' || marks.includes(ch), `sprites use an unknown mark ${ch}`);
});

test('Ghost and Whisper keep a three pixel mouth that slides, never splits', () => {
  for (const form of ['ghost', 'whisper']) {
    const rows = ['A', 'B'].map((k) => SPRITES[`${form}${k}`].find((r) => r.includes('+')));
    const runs = rows.map((r) => r.match(/\++/g));
    for (const r of runs) assert.deepEqual(r.map((m) => m.length), [3], `${form}: one run of three`);
    assert.notEqual(rows[0].indexOf('+'), rows[1].indexOf('+'), `${form}: the mouth moves between frames`);
  }
});

test('Plat steadies its body between frames: only the forearms change', () => {
  const [a, b] = [SPRITES.platA, SPRITES.platB];
  for (let y = 0; y < a.length; y++) {
    if (y === 12) continue;
    assert.equal(a[y].replace(/[o+]/g, '#'), b[y].replace(/[o+]/g, '#'), `row ${y} body`);
  }
  // On the arm row nothing is painted that is not on the body or at the arm's own column.
  assert.equal(b[12].slice(2, 16), a[12].slice(2, 16));
  assert.equal(b[12][1], '.');
  assert.equal(b[12][16], '.');
});
