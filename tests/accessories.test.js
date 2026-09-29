import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACCESSORIES, STYLE_ITEMS, anchorsFor, anchorRowsFor, rollAccessory, accessoryById, drawAccessory, RARITY } from '../src/accessories.js';
import { SPRITES } from '../src/sprites.js';
import { SPECIES, PALETTES, mulberry32 } from '../src/sim.js';
import { readFileSync } from 'node:fs';
import { computeAutoColors, renderModule, slotClearance, CLEAR } from '../tools/wearable-colors.mjs';
import { deltaE } from '../src/colors.js';

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
  assert.equal(accessoryColors('crown'), null, 'not recolorable');
  const seen = new Set();
  const hat = ACCESSORIES.find((x) => x.id === 'partyhat');
  hat.draw((x, y, c) => seen.add(c), anchorsFor(SPRITES.bitlingA), 0, 0, ['#00ff00', '#123abc']);
  assert.ok(seen.has('#00ff00') && seen.has('#123abc'));
});

test('scarf, mohawk, visor, cap, shades, rebreather and tattoo are recolorable', () => {
  assert.deepEqual(accessoryColors('scarf', ['#123456']), ['#123456']);
  assert.deepEqual(accessoryColors('mohawk'), ['#ff2a6d']);
  assert.deepEqual(accessoryColors('visor', ['#00ff00']), ['#00ff00', '#ffffff'], 'unset picks keep their default');
  for (const id of ['scarf', 'mohawk', 'visor', 'cap', 'shades', 'rebreather', 'tattoo']) {
    const seen = new Set();
    ACCESSORIES.find((x) => x.id === id).draw((x, y, c) => seen.add(c), anchorsFor(SPRITES.chromeA), 0, 0, ['#0000ff', '#0000fe']);
    assert.ok(seen.has('#0000ff'), id);
  }
});

test('every form has authored anchor rows, and they point at the right pixels in every frame', () => {
  for (const form of Object.keys(SPECIES)) {
    for (const [key, pose] of [['A', 'a'], ['B', 'b'], ['Sleep', 'sleep']]) {
      const sprite = SPRITES[`${form}${key}`];
      if (!sprite) continue;
      const rows = anchorRowsFor(form, pose);
      assert.ok(rows, `${form} has no authored anchor rows`);
      const name = `${form}${key}`;
      assert.ok(sprite[rows.eyeRow].includes('o'), `${name}: eyeRow ${rows.eyeRow} has no eye pixels`);
      assert.ok(rows.headTop < rows.eyeRow && rows.eyeRow < rows.mouthRow && rows.mouthRow < rows.neckRow, `${name}: rows out of order`);
      assert.ok(sprite[rows.headTop].replace(/\./g, '').length >= 3, `${name}: headTop row is nearly empty`);
      assert.ok(sprite[rows.neckRow].replace(/\./g, '').length >= 3, `${name}: neckRow row is nearly empty`);
      const a = anchorsFor(sprite);
      assert.equal(a.eyeRow, rows.eyeRow);
      assert.equal(a.neckRow, rows.neckRow);
    }
  }
});

test('a wearable stays on the same part of the body between the A and B frames (within one row)', () => {
  for (const form of Object.keys(SPECIES)) {
    const A = SPRITES[`${form}A`];
    const B = SPRITES[`${form}B`];
    for (const acc of ACCESSORIES) {
      if (acc.id === 'drone' || acc.id === 'dataaura') continue; // they orbit
      const rowsOf = (sprite) => {
        const ys = [];
        acc.draw((x, y) => ys.push(y), anchorsFor(sprite), 0, 0);
        return [Math.min(...ys), Math.max(...ys)];
      };
      const [a0, a1] = rowsOf(A);
      const [b0, b1] = rowsOf(B);
      assert.ok(Math.abs(b0 - a0) <= 1 && Math.abs(b1 - a1) <= 1, `${acc.id} on ${form} jumps between frames: ${a0}-${a1} vs ${b0}-${b1}`);
    }
  }
});

test('the scarf sits on the neck row, below the mouth', () => {
  const scarf = ACCESSORIES.find((x) => x.id === 'scarf');
  for (const form of Object.keys(SPECIES)) {
    const a = anchorsFor(SPRITES[`${form}A`]);
    const ys = [];
    scarf.draw((x, y) => ys.push(y), a, 0, 0);
    assert.equal(Math.min(...ys), a.neckRow, form);
    assert.ok(a.neckRow > a.mouthRow, form);
  }
});

test('recolorable wearables default to a color that stands clear of the palette, and a pick or null overrides it', () => {
  const ice = PALETTES.find((p) => p.name === 'ice');
  // The cap's signature cyan is the ice body color: on ice it must not be cyan, on a palette where cyan stands clear it stays.
  assert.notEqual(accessoryColors('cap', null, ice)[0], '#05d9e8');
  assert.equal(accessoryColors('cap', null, PALETTES.find((p) => p.name === 'acid'))[0], '#05d9e8');
  assert.equal(accessoryColors('cap', ['#123456'], ice)[0], '#123456', 'a player pick wins');
  assert.equal(accessoryColors('cap', [null], ice)[0], accessoryColors('cap', null, ice)[0], 'null is automatic');
  assert.equal(accessoryColors('cap', ['red'], ice)[0], accessoryColors('cap', null, ice)[0], 'junk is automatic');
  assert.equal(accessoryColors('cap', null)[0], '#05d9e8', 'with no palette, the signature color');
  assert.equal(accessoryColors('crown', null, ice), null, 'a wearable with fixed colors has no color list');
});

test('src/wearable-colors.js is up to date, and every default stands clear of every palette on every form', () => {
  const { out } = computeAutoColors();
  assert.equal(readFileSync(new URL('../src/wearable-colors.js', import.meta.url), 'utf8'), renderModule(out), 'run: node tools/wearable-colors.mjs --write');
  for (const acc of ACCESSORIES.filter((a) => a.colors)) {
    for (const pal of PALETTES) {
      const picks = accessoryColors(acc.id, null, pal);
      picks.forEach((c, slot) => {
        const others = picks.slice(0, slot).map((oc, i) => [i, oc]);
        const score = slotClearance(acc, slot, c, pal, others);
        assert.ok(score >= CLEAR, `${acc.id} ${acc.colors[slot][0]} on ${pal.name}: ${c} only stands ${score.toFixed(1)} clear`);
      });
    }
  }
});

test('a wearable with fixed colors is painted in a color that stands clear of the body it is worn on', () => {
  const acid = PALETTES.find((p) => p.name === 'acid');
  const drawn = [];
  const ctx = { set fillStyle(v) { this._c = v; }, fillRect() { drawn.push(this._c); } };
  drawAccessory(ctx, 'crown', SPRITES.chromeA, 0, 0, 0, false, 0, null, acid); // a yellow crown on a yellow body
  assert.ok(drawn.length > 0);
  for (const c of drawn) assert.ok(deltaE(c, acid.main) >= 30, `${c} blends into ${acid.main}`);
  drawn.length = 0;
  drawAccessory(ctx, 'crown', SPRITES.chromeA, 0, 0, 0, false, 0, null, PALETTES.find((p) => p.name === 'ice'));
  assert.ok(drawn.includes('#f9f002'), 'where yellow stands clear, the crown stays yellow');
});
