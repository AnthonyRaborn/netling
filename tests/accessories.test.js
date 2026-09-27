import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACCESSORIES, STYLE_ITEMS, anchorsFor, rollAccessory, accessoryById, RARITY } from '../src/accessories.js';
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
    const r = accessoryById(id).rarity;
    counts[r] = (counts[r] ?? 0) + 1;
  }
  assert.ok(counts.common > counts.rare && counts.rare > counts.veryrare);
  assert.equal(rollAccessory(STYLE_ITEMS.map((x) => x.id), rng), null);
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
  assert.equal(ACCESSORIES.length, 24);
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

import { PROPS, drawProp } from '../src/accessories.js';

test('earned items never appear in shops or drops', () => {
  const rng = mulberry32(11);
  const earned = STYLE_ITEMS.filter((x) => x.source === 'earned').map((x) => x.id);
  assert.deepEqual(earned.sort(), ['bandage', 'minidevice', 'partyhat', 'plush']);
  for (const region of [null, 'public', 'corp', 'bazaar', 'ruins', 'deep']) {
    for (let i = 0; i < 1500; i++) assert.ok(!earned.includes(rollAccessory([], rng, region)));
  }
});

test('props can drop in their region and stay inside their declared size', () => {
  const rng = mulberry32(12);
  const bazaar = new Set(Array.from({ length: 3000 }, () => rollAccessory([], rng, 'bazaar')));
  assert.ok(bazaar.has('boombox') && bazaar.has('deck'));
  const plushExtra = { sprite: SPRITES.daemonA, colors: { '#': '#ff2a6d', o: '#05d9e8', '+': '#fff' } };
  for (const p of PROPS) {
    const pts = [];
    p.draw((x, y) => pts.push([x, y]), 1, 0, plushExtra);
    assert.ok(pts.length > 0, `${p.id} drew nothing`);
    for (const [x, y] of pts) assert.ok(x >= 0 && x < p.size[0] && y >= 0 && y < p.size[1], `${p.id} at ${x},${y}`);
  }
});

test('drawProp places props on the LCD floor at the right edge', () => {
  const calls = [];
  const ctx = { set fillStyle(v) {}, fillRect: (x, y) => calls.push([x, y]) };
  drawProp(ctx, 'boombox', 40, 0);
  assert.ok(calls.every(([x, y]) => x >= 30 && x < 40 && y >= 16 && y <= 20));
});

import { accessoryColors } from '../src/accessories.js';

test('party hat colors: defaults, custom picks, and junk rejected', () => {
  assert.deepEqual(accessoryColors('partyhat'), ['#ff2a6d', '#f9f002']);
  assert.deepEqual(accessoryColors('partyhat', ['#00ff00', '#123abc']), ['#00ff00', '#123abc']);
  assert.deepEqual(accessoryColors('partyhat', ['red', 'url(x)']), ['#ff2a6d', '#f9f002']);
  assert.equal(accessoryColors('cap'), null, 'not recolorable');
  const seen = new Set();
  const hat = ACCESSORIES.find((x) => x.id === 'partyhat');
  hat.draw((x, y, c) => seen.add(c), anchorsFor(SPRITES.bitlingA), 0, 0, ['#00ff00', '#123abc']);
  assert.ok(seen.has('#00ff00') && seen.has('#123abc'));
});
