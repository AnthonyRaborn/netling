import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACCESSORIES, anchorsFor, rollAccessory, RARITY } from '../src/accessories.js';
import { SPRITES } from '../src/sprites.js';
import { SPECIES, mulberry32 } from '../src/sim.js';

const FORM_SPRITES = Object.keys(SPECIES).flatMap((form) =>
  ['A', 'B', 'Sleep'].map((k) => [`${form}${k}`, SPRITES[`${form}${k}`]]).filter(([, s]) => s),
);

test('every form sprite yields sane anchors', () => {
  for (const [name, sprite] of FORM_SPRITES) {
    const a = anchorsFor(sprite);
    const w = sprite[0].length;
    assert.ok(a.headTop >= a.top, `${name} headTop`);
    assert.ok(a.eyeRow >= a.headTop && a.eyeRow < sprite.length, `${name} eyeRow`);
    assert.ok(a.headLeft < a.headRight && a.headRight < w, `${name} head span`);
    assert.ok(a.mid >= a.eyeRow && a.mid < sprite.length, `${name} mid`);
    assert.ok(a.eyeCols.length > 0, `${name} eyes`);
  }
});

test('every accessory draws on every form within a sane margin', () => {
  for (const acc of ACCESSORIES) {
    for (const [name, sprite] of FORM_SPRITES) {
      const pts = [];
      acc.draw((x, y) => pts.push([x, y]), anchorsFor(sprite), 1);
      assert.ok(pts.length > 0, `${acc.id} on ${name} drew nothing`);
      for (const [x, y] of pts) {
        assert.ok(x >= -3 && x <= sprite[0].length + 2, `${acc.id} on ${name}: x ${x} out of bounds`);
        assert.ok(y >= -6 && y <= sprite.length + 2, `${acc.id} on ${name}: y ${y} out of bounds`);
      }
    }
  }
});

test('rolls skip owned accessories and favor common ones', () => {
  const rng = mulberry32(5);
  const counts = {};
  for (let i = 0; i < 3000; i++) {
    const id = rollAccessory(['cap'], rng);
    assert.notEqual(id, 'cap');
    const r = ACCESSORIES.find((x) => x.id === id).rarity;
    counts[r] = (counts[r] ?? 0) + 1;
  }
  assert.ok(counts.common > counts.rare && counts.rare > counts.veryrare);
  assert.equal(rollAccessory(ACCESSORIES.map((x) => x.id), rng), null);
  assert.ok(Object.keys(RARITY).every((k) => RARITY[k].hint));
});

test('regional accessories only roll in their region; the originals roll anywhere', () => {
  const rng = mulberry32(9);
  const seen = {};
  for (const region of ['public', 'corp', 'bazaar', 'ruins', 'deep']) {
    seen[region] = new Set();
    for (let i = 0; i < 2000; i++) seen[region].add(rollAccessory([], rng, region));
  }
  for (const x of ACCESSORIES) {
    for (const [region, ids] of Object.entries(seen)) {
      const allowed = !x.regions || x.regions.includes(region);
      if (!allowed) assert.ok(!ids.has(x.id), `${x.id} leaked into ${region}`);
    }
  }
  assert.ok(seen.deep.has('drone'));
  assert.ok(seen.corp.has('barcode'));
  assert.ok(!seen.public.has('drone'));
  assert.equal(ACCESSORIES.length, 20);
});

test('the drone orbits: its position changes over time', () => {
  const drone = ACCESSORIES.find((x) => x.id === 'drone');
  const a = anchorsFor(SPRITES.chromeA);
  const at = (time) => {
    const pts = [];
    drone.draw((x, y) => pts.push(`${x},${y}`), a, 0, time);
    return pts.join(' ');
  };
  assert.notEqual(at(0), at(1100));
});
