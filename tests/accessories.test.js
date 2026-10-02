import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACCESSORIES, STYLE_ITEMS, WEAR_SLOTS, anchorsFor, anchorRowsFor, rollAccessory, rollWornAccessory, accessoryById, drawAccessory, placeWorn, wearOrder, wornFrom, RARITY } from '../src/accessories.js';
import { SPRITES } from '../src/sprites.js';
import { SPECIES, PALETTES, mulberry32, lineOf } from '../src/sim.js';
import { readFileSync } from 'node:fs';
import { computeAutoColors, renderModule, slotClearance, CLEAR } from '../tools/wearable-colors.mjs';
import { deltaE } from '../src/colors.js';
import { jaccard } from '../tools/lib/sprite-checks.mjs';

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
  for (const region of ['public', 'corp', 'bazaar', 'ruins', 'deep', 'source']) {
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
  assert.ok(seen.source.has('checksum'));
  // The Checksum (the Mainframe stage's) never comes from a home reward or on a visitor, unlike the other regional finds.
  const home = new Set();
  const worn = new Set();
  for (let i = 0; i < 4000; i++) {
    home.add(rollAccessory([], rng));
    worn.add(rollWornAccessory(rng));
  }
  assert.ok(home.has('drone') && !home.has('checksum'));
  assert.ok(!worn.has('checksum'));
  assert.equal(ACCESSORIES.length, 41);
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
      // Eyes are accent cells; a form with bright eyes (shine: Chrome's visor, Panic's '!' marks) may use '+' instead.
      assert.ok(sprite[rows.eyeRow].includes('o') || (anchorRowsFor(form, 'a').shine && sprite[rows.eyeRow].includes('+')), `${name}: eyeRow ${rows.eyeRow} has no eye pixels`);
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

test('a wearable with fixed colors is swapped where it sits on the body, and left alone where it floats clear', () => {
  const acid = PALETTES.find((p) => p.name === 'acid');
  const sprite = SPRITES.chromeA;
  const painted = (pal) => {
    const out = [];
    const ctx = { set fillStyle(v) { this._c = v; }, fillRect(x, y) { out.push([x, y, this._c]); } };
    drawAccessory(ctx, 'crown', sprite, 0, 0, 0, false, 0, null, pal);
    return out;
  };
  const touches = (x, y) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => (sprite[y + dy]?.[x + dx] ?? '.') !== '.');
  const crown = ACCESSORIES.find((a) => a.id === 'crown');
  const own = new Map();
  crown.draw((x, y, c) => own.set(`${x},${y}`, c), anchorsFor(sprite), 0, 0);
  let swapped = 0;
  let kept = 0;
  for (const [x, y, c] of painted(acid)) {
    if (touches(x, y)) {
      if (deltaE(own.get(`${x},${y}`), acid.main) < 30) {
        swapped++;
        assert.ok(deltaE(c, acid.main) >= 30, `${c} at ${x},${y} blends into ${acid.main}`);
      }
    } else {
      kept++;
      assert.equal(c, own.get(`${x},${y}`), `a pixel floating clear of the body at ${x},${y} is left as drawn`);
    }
  }
  assert.ok(swapped > 0, 'the crown band on a yellow body is swapped');
  assert.ok(kept > 0, 'the crown points above the head are left alone');
  assert.ok(painted(PALETTES.find((p) => p.name === 'ice')).some(([, , c]) => c === '#f9f002'), 'where yellow stands clear, the crown stays yellow');
});

test('wearables that used to look alike now differ in silhouette', () => {
  const pts = (id, sprite) => {
    const out = [];
    accessoryById(id).draw((x, y) => out.push({ x, y }), anchorsFor(sprite), 0, 0, accessoryColors(id, null));
    return out;
  };
  const overlap = (a, b, sprite) => jaccard(pts(a, sprite), pts(b, sprite));
  for (const sprite of [SPRITES.chromeA, SPRITES.bitlingA]) {
    assert.ok(overlap('chromejaw', 'rebreather', sprite) < 0.7, 'jaw and rebreather');
    assert.ok(overlap('mohawk', 'partyhat', sprite) < 0.5, 'mohawk and party hat');
    assert.ok(overlap('cap', 'crown', sprite) < 0.5, 'cap and crown');
    // Three unbroken lines is the visor's whole shape, so on Chrome's wide face it overlaps the Shades more (0.67); the
    // colors still differ (black lenses against a colored band).
    assert.ok(overlap('shades', 'visor', sprite) < 0.7, 'shades and visor');
  }
});

test('a wearable\'s body and neck are the solid run through the middle, so side arms do not stretch a scarf', () => {
  // Kernel's B frame has arms on the neck row; they are not the neck.
  const a = anchorsFor(SPRITES.kernelA);
  const b = anchorsFor(SPRITES.kernelB);
  assert.equal(b.neckLeft, a.neckLeft);
  assert.equal(b.neckRight, a.neckRight);
  for (const form of Object.keys(SPECIES)) {
    if (lineOf(form) === 'glitch') continue; // its body is torn differently in each frame on purpose (Panic borrows it for now)
    const A = anchorsFor(SPRITES[`${form}A`]);
    const B = anchorsFor(SPRITES[`${form}B`]);
    assert.ok(Math.abs(A.neckLeft - B.neckLeft) <= 1 && Math.abs(A.neckRight - B.neckRight) <= 1, `${form}: the neck changes width between frames`);
    assert.ok(Math.abs(A.bodyLeft - B.bodyLeft) <= 1 && Math.abs(A.bodyRight - B.bodyRight) <= 1, `${form}: the body changes width between frames`);
  }
});

// --- wear slots ------------------------------------------------------------------------------------

test('every accessory has one wear slot, and every slot has a few to choose from', () => {
  for (const acc of ACCESSORIES) assert.ok(WEAR_SLOTS.includes(acc.slot), `${acc.id}: slot ${acc.slot}`);
  for (const slot of WEAR_SLOTS) assert.ok(ACCESSORIES.filter((x) => x.slot === slot).length >= 3, `${slot} has too few`);
});

test('worn accessories draw body, face, head, float; props and unknown ids are skipped', () => {
  const ids = wearOrder([{ id: 'halo' }, { id: 'cap' }, { id: 'deck' }, { id: 'scarf' }, { id: 'nope' }, { id: 'shades' }]).map((w) => w.id);
  assert.deepEqual(ids, ['scarf', 'shades', 'cap', 'halo']);
  const wardrobe = { head: 'cap', face: 'shades', body: 'scarf', float: 'halo', colors: { cap: ['#123456'] } };
  assert.deepEqual(wornFrom(wardrobe, ['cap', 'scarf', 'halo']), [{ id: 'scarf', colors: null }, { id: 'cap', colors: ['#123456'] }, { id: 'halo', colors: null }], 'only owned ones');
  assert.deepEqual(wornFrom({}, ['cap']), []);
});

test('worn together, body items slide down and halos rise, never off the sprite or above the screen', () => {
  const sprites = FORM_SPRITES.map(([, s]) => s);
  const cells = (w) => new Set(w.pts.map((p) => `${p.x},${p.y}`));
  let moved = 0;
  for (const sprite of sprites) {
    for (const body of ['scarf', 'barcode', 'kernelpin']) {
      for (const face of ['chromejaw', 'rebreather', 'tattoo']) {
        const [b, f] = placeWorn([{ id: body }, { id: face }], sprite);
        assert.ok(b.dy >= 0 && b.dy <= 4, `${body} moved ${b.dy}`);
        assert.ok(b.pts.every((p) => p.y < sprite.length), `${body} slid off the sprite`);
        if (b.dy) moved++;
        // The shift never makes things worse than where it started.
        const [b0] = placeWorn([{ id: body }], sprite);
        const fc = cells(f);
        assert.ok([...cells(b)].filter((k) => fc.has(k)).length <= [...cells(b0)].filter((k) => fc.has(k)).length);
      }
    }
    for (const hat of ['partyhat', 'mohawk', 'satdish']) {
      for (const float of ['halo', 'spark']) {
        const [, up] = placeWorn([{ id: hat }, { id: float }], sprite, { minRow: -4 });
        assert.ok(up.dy <= 0 && up.pts.every((p) => p.y >= -4), `${float} over ${hat} left the screen`);
      }
    }
  }
  assert.ok(moved > 0, 'something made room');
  // Alone, nothing moves.
  for (const acc of ACCESSORIES) assert.equal(placeWorn([{ id: acc.id }], sprites[0])[0].dy, 0);
});

test('a second accessory on a visitor comes from another slot', () => {
  const rng = mulberry32(11);
  for (let i = 0; i < 500; i++) {
    const first = rollWornAccessory(rng);
    const second = rollWornAccessory(rng, [first]);
    assert.notEqual(accessoryById(first).slot, accessoryById(second).slot);
  }
});

test('orbiting floaters draw last and nothing else moves to make room for them', () => {
  const orbiters = ACCESSORIES.filter((a) => a.orbits).map((a) => a.id);
  assert.deepEqual(orbiters.sort(), ['dataaura', 'drone', 'glitchmoth']);
  for (const [name, sprite] of [['whisperA', SPRITES.whisperA], ['whisperB', SPRITES.whisperB], ['ghostA', SPRITES.ghostA], ['bitlingA', SPRITES.bitlingA]]) {
    for (const orbiter of orbiters) {
      for (const body of ['scarf', 'lanyard', 'barcode', 'kernelpin']) {
        for (let t = 0; t < 4000; t += 250) {
          const worn = placeWorn([{ id: orbiter }, { id: body }], sprite, { time: t });
          assert.equal(worn[worn.length - 1].id, orbiter, `${orbiter} is drawn last`);
          const alone = placeWorn([{ id: body }], sprite, { time: t })[0];
          assert.equal(worn.find((w) => w.id === body).dy, alone.dy, `${body} on ${name} stays put at ${t} ms with ${orbiter}`);
        }
      }
    }
  }
});

test('the visor is three unbroken lines with a scan light running in and out on the middle one', () => {
  for (const [name, sprite] of FORM_SPRITES) {
    const a = anchorsFor(sprite);
    const cells = [];
    const run = (time) => {
      const out = [];
      accessoryById('visor').draw((x, y, color) => out.push({ x, y, color }), a, 0, time, accessoryColors('visor', null));
      return out;
    };
    const base = run(0);
    const rows = [...new Set(base.map((p) => p.y))].sort((m, n) => m - n);
    assert.deepEqual(rows, [a.eyeRow - 1, a.eyeRow, a.eyeRow + 1], `${name}: only the three lines`);
    const xs = [...new Set(base.map((p) => p.x))].sort((m, n) => m - n);
    for (const y of rows) {
      const row = new Set(base.filter((p) => p.y === y).map((p) => p.x));
      assert.deepEqual([...row].sort((m, n) => m - n), xs.filter((x) => x >= xs[0] && x <= xs[xs.length - 1]), `${name}: row ${y} has no gap`);
    }
    // The lights are on the middle line only, in matching pairs, and sweep outer, middle, inner, middle.
    const lights = (time) => run(time).filter((p) => p.color === '#ffffff');
    const offs = [0, 280, 560, 840].map((t) => lights(t).map((p) => p.x).sort((m, n) => m - n));
    for (const l of offs) assert.ok(l.length === 2 || l.length === 1, `${name}: a pair of lights`);
    assert.ok(lights(0).every((p) => p.y === a.eyeRow), `${name}: lights on the middle line`);
    cells.push(offs);
    assert.deepEqual(offs[1], offs[3], `${name}: the middle position comes round twice`);
    assert.ok(offs[1][0] >= offs[0][0] && offs[2][0] >= offs[1][0], `${name}: moving inward`);
  }
});

// --- the ten found anywhere, for the slots that had the fewest -----------------------------------

import { CHECKIN_ACCESSORIES } from '../src/checkin.js';
import { FLASH_TOGGLE_MS } from '../src/games/common.js';

const NEW_TEN = ['raincloud', 'cursor', 'progressbar', 'extralife', 'bowtie', 'goldchain', 'powercell', 'blush', 'mustache', 'monocle'];

test('the ten newer wearables are found anywhere, sold by both markets, and feed the daily check-in', () => {
  const slots = {};
  for (const id of NEW_TEN) {
    const x = accessoryById(id);
    assert.ok(x, id);
    assert.ok(!x.regions && !x.shop && !x.source && !x.mainframe, `${id} is found anywhere`);
    assert.ok(CHECKIN_ACCESSORIES.includes(id), `${id} can come from a check-in`);
    slots[x.slot] = (slots[x.slot] ?? 0) + 1;
  }
  assert.deepEqual(slots, { float: 4, body: 3, face: 3 });
  // Every slot now has at least ten, and the check-in has a common and a rare-or-better pool each over ten deep.
  for (const slot of ['float', 'body', 'face']) assert.ok(ACCESSORIES.filter((x) => x.slot === slot).length >= 10, slot);
  const rarity = (id) => accessoryById(id).rarity;
  assert.ok(CHECKIN_ACCESSORIES.filter((id) => rarity(id) === 'common').length >= 12);
  assert.ok(CHECKIN_ACCESSORIES.filter((id) => rarity(id) !== 'common').length >= 12);
});

test('the progress bar and the power cell change no faster than the flash limit', () => {
  for (const id of ['progressbar', 'powercell']) {
    for (const sprite of [SPRITES.bitlingA, SPRITES.platA]) {
      const at = (t) => {
        const pts = [];
        accessoryById(id).draw((x, y, c) => pts.push(`${x},${y},${c}`), anchorsFor(sprite), 0, t);
        return pts.join(' ');
      };
      let last = at(0);
      let lastChange = 0;
      let changes = 0;
      for (let t = 10; t <= 10000; t += 10) {
        const now = at(t);
        if (now !== last) {
          assert.ok(t - lastChange >= FLASH_TOGGLE_MS, `${id} changed ${t - lastChange} ms after the last change`);
          lastChange = t;
          last = now;
          changes++;
        }
      }
      assert.ok(changes > 3, `${id} animates`);
    }
  }
});
