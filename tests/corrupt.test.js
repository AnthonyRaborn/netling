import { test } from 'node:test';
import assert from 'node:assert/strict';
import { garble, staticRows, shiftBand, BLINK_MS, GLITCH_MS, STATIC_SIZE } from '../src/ui/corrupt.js';
import { FLASH_TOGGLE_MS } from '../src/games/common.js';
import { mulberry32 } from '../src/sim.js';
import { CORRUPTED } from '../src/archive.js';
import { REGIONS } from '../src/netrun/regions.js';

// The blink of corrupted records and sectors (ui/corrupt.js).

test('a blink garbles some letters into block glyphs or look-alikes, and keeps the shape of the line', () => {
  for (const text of [CORRUPTED.name, REGIONS.source.lockedName]) {
    for (let seed = 1; seed <= 200; seed++) {
      const out = garble(text, mulberry32(seed));
      const a = [...text];
      const b = [...out];
      assert.equal(b.length, a.length, 'one character for one');
      const changed = a.filter((c, i) => c !== b[i]);
      assert.ok(changed.length >= 2, `${out}: at least two letters change`);
      a.forEach((c, i) => {
        if (!/[A-Za-z0-9]/.test(c)) assert.equal(b[i], c, 'brackets and spaces stay');
        else if (b[i] !== c) assert.match(b[i], /[░▒▓█0-9]/, `${b[i]} is a block glyph or a digit`);
      });
    }
  }
  assert.notEqual(garble(CORRUPTED.name, mulberry32(1)), garble(CORRUPTED.name, mulberry32(2)), 'different each blink');
  assert.equal(garble('<< >>', mulberry32(1)), '<< >>', 'nothing to garble, nothing changes');
});

test('the static re-rolls each time, and a band of it slides sideways', () => {
  const a = staticRows(mulberry32(1));
  const b = staticRows(mulberry32(2));
  assert.equal(a.length, STATIC_SIZE[1]);
  assert.ok(a.every((r) => r.length === STATIC_SIZE[0] && /^[#.]+$/.test(r)));
  assert.notDeepEqual(a, b);
  const lit = a.join('').split('#').length - 1;
  assert.ok(lit > 0.2 * STATIC_SIZE[0] * STATIC_SIZE[1] && lit < 0.6 * STATIC_SIZE[0] * STATIC_SIZE[1], 'about two cells in five');
  const shifted = shiftBand(a, 4, 3);
  assert.deepEqual(shifted.slice(0, 4), a.slice(0, 4));
  assert.deepEqual(shifted.slice(7), a.slice(7));
  for (let y = 4; y < 7; y++) assert.equal(shifted[y], a[y].slice(-3) + a[y].slice(0, -3));
});

test('a blink is two changes well apart: no faster than the flash limit', () => {
  assert.ok(GLITCH_MS >= FLASH_TOGGLE_MS, 'the glitch holds at least as long as the fastest allowed toggle');
  assert.ok(BLINK_MS - GLITCH_MS >= FLASH_TOGGLE_MS);
  assert.ok((2 * 1000) / BLINK_MS <= 3, 'well under three changes a second');
});
