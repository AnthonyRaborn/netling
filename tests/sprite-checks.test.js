import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  deltaE, sameColor, blend, hexToRgb, rgbToHex, spriteCells, extents, offScreen, hudHits, lostPixels, jaccard,
  silhouetteIou, poseDistance, markDistance, collectAccessory,
} from '../tools/lib/sprite-checks.mjs';
import { ACCESSORIES, anchorsFor } from '../src/accessories.js';
import { SPRITES } from '../src/sprites.js';

// The sprite review tools (docs/SPRITES.md): their arithmetic is tested here; whether the art is good is not.

test('colors: identical is zero, black to white is 100, and the game palette neons are far apart', () => {
  assert.equal(deltaE('#05d9e8', '#05d9e8'), 0);
  assert.ok(Math.abs(deltaE('#000000', '#ffffff') - 100) < 0.01);
  assert.ok(!sameColor('#f9f002', '#39ff14'));
  assert.ok(sameColor('#05d9e8', '#3ae0ee'));
  assert.deepEqual(hexToRgb('#ff2a6d'), [255, 42, 109]);
  assert.equal(rgbToHex([255, 42, 109]), '#ff2a6d');
});

test('blend: alpha 1 keeps the color, alpha 0 shows the background, half is the midpoint', () => {
  assert.equal(blend('#ff0000', 1, '#000000'), '#ff0000');
  assert.equal(blend('#ff0000', 0, '#0000ff'), '#0000ff');
  assert.equal(blend('#ff0000', 0.5, '#000000'), '#800000');
});

test('sprite cells, extents, off-screen and HUD hits', () => {
  const cells = spriteCells(['.#.', '#o#']);
  assert.equal(cells.length, 4);
  assert.deepEqual(extents(cells), { x0: 0, x1: 2, y0: 0, y1: 1 });
  assert.equal(extents([]), null);
  assert.equal(offScreen([{ x: 0, y: 0 }, { x: -1, y: 5 }, { x: 5, y: -1 }, { x: 40, y: 3 }, { x: 39, y: 27 }, { x: 3, y: 28 }]).length, 4);
  assert.deepEqual(hudHits([{ x: 3, y: 3 }, { x: 20, y: 20 }]), ['virus/event icons']);
  assert.deepEqual(hudHits([{ x: 31, y: 4 }]), ['sleep Z']);
  assert.deepEqual(hudHits([{ x: 20, y: 20 }]), []);
});

test('lostPixels: a pixel the same color as the body under it, or as the room, or the body beside it, is lost', () => {
  const body = [{ x: 5, y: 5, color: '#05d9e8' }, { x: 6, y: 5, color: '#ff2a6d' }];
  const bg = '#0b2226';
  const under = lostPixels([{ x: 5, y: 5, color: '#05d9e8' }, { x: 6, y: 5, color: '#05d9e8' }], body, bg);
  assert.equal(under.lost.length, 1, 'only the one over the same color is lost');
  assert.equal(under.lost[0].x, 5);
  const room = lostPixels([{ x: 20, y: 20, color: '#0b2226' }, { x: 20, y: 21, color: '#f9f002' }], body, bg);
  assert.equal(room.lost.length, 1);
  assert.equal(room.lost[0].y, 20);
  const beside = lostPixels([{ x: 4, y: 5, color: '#05d9e8' }], body, bg);
  assert.equal(beside.lost[0].reason, 'merges into the body beside it');
  assert.equal(lostPixels([{ x: 30, y: 3, color: '#f9f002' }], body, bg).ratio, 0, 'a bright color on the room is visible');
  assert.equal(lostPixels([], body, bg).ratio, 0);
});

test('lostPixels blends a faded accessory over what is under it', () => {
  const body = [{ x: 1, y: 1, color: '#000000' }];
  // Yellow at alpha 0.05 over black is nearly black: lost. At alpha 1 it is not.
  assert.equal(lostPixels([{ x: 1, y: 1, color: '#f9f002', alpha: 0.05 }], body, '#000000').lost.length, 1);
  assert.equal(lostPixels([{ x: 1, y: 1, color: '#f9f002', alpha: 1 }], body, '#000000').lost.length, 0);
});

test('jaccard, silhouette overlap and pose distance', () => {
  assert.equal(jaccard([{ x: 0, y: 0 }], [{ x: 0, y: 0 }]), 1);
  assert.equal(jaccard([{ x: 0, y: 0 }], [{ x: 1, y: 0 }]), 0);
  assert.equal(jaccard([{ x: 0, y: 0 }, { x: 1, y: 0 }], [{ x: 1, y: 0 }, { x: 2, y: 0 }]), 1 / 3);
  const a = ['##', '##'];
  assert.equal(silhouetteIou(a, a), 1);
  assert.equal(silhouetteIou(a, ['..#.', '....']) < 1, true);
  assert.equal(silhouetteIou(['#'], ['..#..']), 1, 'each is centred on its own box, so position does not matter');
  assert.equal(poseDistance(['#.'], ['.#']), 2);
  assert.equal(poseDistance(a, a), 0);
  assert.equal(markDistance(['#o'], ['##']), 1);
});

test('every accessory draws something on every form through collectAccessory', () => {
  for (const acc of ACCESSORIES) {
    const pts = collectAccessory(acc, anchorsFor(SPRITES.chromeA), { frame: 1, time: 1234 });
    assert.ok(pts.length > 0, acc.id);
    assert.ok(pts.every((p) => Number.isInteger(p.x) && Number.isInteger(p.y) && /^#/.test(p.color)), acc.id);
  }
});
