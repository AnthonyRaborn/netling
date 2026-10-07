// Tests for the Wetware egg's sprites (so far the baby, the three teens and the four corp adults). Run with `npm run proto:test`. Deterministic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './ready.js'; // first: registers the forms before src/sim.js can load src/accessories.js (see ready.js)
import { wetwareForms, WETWARE_FORMS, WETWARE_TEENS_ALL, WETWARE_ADULTS_ALL, WETWARE_NINE, WETWARE_HIDDEN_BRANCH, wetwarePose } from './wetware-models.js';
import { wetwareKey } from './register.js';
import { forms as ironForms } from './models.js';
import { programForms } from './program-models.js';
import { SPRITES } from '../../src/sprites.js';
import { silhouetteIou, poseDistance, markDistance, offScreen } from '../../tools/lib/sprite-checks.mjs';

const set = wetwareForms();
const baby = set.baby;
const forms = Object.values(set);
const WIDTH = { baby: 12, teen: 14, adult: 16 };
const key = (f, pose) => `${wetwareKey(f.id)}${pose === 'a' ? 'A' : pose === 'b' ? 'B' : pose === 'sleep' ? 'Sleep' : 'Dead'}`;

test('Wetware has a baby and three teens (corp, street, hidden), in the egg\'s own table', () => {
  assert.deepEqual(Object.keys(WETWARE_FORMS), ['baby', 'teenCorp', 'teenStreet', 'teenHidden', ...WETWARE_NINE]);
  assert.deepEqual(WETWARE_TEENS_ALL.map((id) => WETWARE_FORMS[id].lean), ['corp', 'street', 'hidden']);
  assert.deepEqual(WETWARE_HIDDEN_BRANCH, ['baby', 'teenHidden', 'blank']);
});

test('every sprite is rectangular, the stage\'s width, 11 rows like Iron\'s and Program\'s babies and teens, with known marks', () => {
  for (const f of forms) {
    for (const pose of ['a', 'b', 'sleep', 'dead']) {
      const rows = f[pose];
      assert.ok(f.stage === 'adult' ? rows.length >= 9 && rows.length <= 15 : rows.length === 11, `${f.id}/${pose}: ${rows.length} rows`);
      assert.equal(rows.length, f.a.length, `${f.id}/${pose}: same height as A`);
      assert.equal(new Set(rows.map((r) => r.length)).size, 1, `${f.id}/${pose}: ragged`);
      assert.equal(rows[0].length, WIDTH[f.stage], `${f.id}/${pose}: width`);
      assert.match(rows.join(''), /^[.#o+x]+$/, `${f.id}/${pose}: marks`);
    }
  }
});

test('anchors point at the head, the eyes and the body, in order, and are the same in both frames', () => {
  for (const f of forms) {
    for (const pose of ['a', 'b', 'sleep']) {
      const { headTop, eyeRow, mouthRow, neckRow } = f.anchors[pose];
      const sprite = pose === 'sleep' ? f.a : f[pose];
      for (const r of [headTop, eyeRow, mouthRow, neckRow]) assert.ok(r >= 0 && r < sprite.length, `${f.id}/${pose}: out of range`);
      assert.ok(headTop < eyeRow && eyeRow < mouthRow && mouthRow < neckRow, `${f.id}/${pose}: out of order`);
      assert.ok(/[#o+x]/.test(sprite[headTop]), `${f.id}/${pose}: headTop row is empty`);
      assert.ok(sprite[eyeRow].includes('o'), `${f.id}/${pose}: no eye on eyeRow`);
    }
    assert.deepEqual(f.anchors.a, f.anchors.b, `${f.id}: the head must not move between frames`);
  }
});

test('the head, eyes, mouth and neck are identical in A and B; only the lower body animates, and the frames still differ', () => {
  for (const f of forms) {
    for (let y = 0; y <= f.anchors.a.neckRow; y++) assert.equal(f.b[y], f.a[y], `${f.id}: row ${y} differs between frames`);
    assert.ok(poseDistance(f.a, f.b) >= 4, `${f.id}: A and B nearly identical`);
    const bottom = (s) => s.findLastIndex((r) => [...r].filter((c) => c !== '.').length >= s[0].length * 0.4);
    assert.equal(bottom(f.a), bottom(f.b), `${f.id}: the body's bottom moves between frames`);
  }
});

test('the organoid has its folded cortex (dim cells across the top of the head) and no other form of the baby has them in the eyes', () => {
  assert.ok(baby.a.slice(1, 4).join('').split('x').length - 1 >= 8, 'folds');
  assert.ok(!baby.a[baby.anchors.a.eyeRow].includes('x') && !baby.a[baby.anchors.a.mouthRow].includes('x'));
});

test('the asleep and dead poses keep the awake outline; the eyes are the 1.0 slit and X, plus no mark when asleep and one on the chest when dead', () => {
  for (const f of forms) {
  const a = f.anchors.a;
  assert.equal(poseDistance(f.a, f.sleep), 0, `${f.id}: asleep outline`);
  assert.equal(poseDistance(f.a, f.dead), 0, `${f.id}: dead outline`);
  assert.ok(markDistance(f.a, f.sleep) > 0 && markDistance(f.a, f.dead) > 0);
  for (const kind of ['sleep', 'dead']) assert.deepEqual(wetwarePose(f.a, a, kind, f.id), f[kind]);
  // Asleep: the 1.0 slit eyes and nothing else (no cell added around the mouth or chest). Dead: a run of dim cells on one row at or below the neck.
  const added = (pose, ch) => f[pose].flatMap((row, y) => [...row].map((c, x) => (c === ch && f.a[y][x] !== ch && y > a.mouthRow ? [x, y] : null)).filter(Boolean));
  const slits = f.sleep.flatMap((row, y) => [...row].map((c, x) => (c !== f.a[y][x] ? y : null)).filter((y) => y !== null));
  const trace = added('dead', 'x').filter(([, y]) => y >= a.neckRow);
  assert.ok(slits.length > 0 && slits.every((y) => y >= a.eyeRow && y <= a.eyeRow + 1), `${f.id}: asleep changes only the eyes`);
  assert.ok(trace.length >= 4 && new Set(trace.map(([, y]) => y)).size === 1, `${f.id}: trace ${trace.length} cells`);
  assert.ok(!added('sleep', 'o').length, `${f.id}: no mark under the mouth when asleep`);
  }
});

test('the baby is clearly its own: silhouette under the 1.0 same-stage bar (0.82) against Iron\'s and Program\'s babies', () => {
  const iron = ironForms('B').baby.a;
  const program = programForms().baby.a;
  const ii = silhouetteIou(baby.a, iron);
  const ip = silhouetteIou(baby.a, program);
  console.log(`  Wetware baby against Iron's ${ii.toFixed(2)}, against Program's ${ip.toFixed(2)}`);
  assert.ok(ii < 0.82 && ip < 0.82);
});

test('the wearable code sees every Wetware form\'s authored anchors, and the real head width', async () => {
  const { anchorsFor } = await import('../../src/accessories.js');
  for (const f of forms) {
    for (const [pose, k] of [['a', 'A'], ['b', 'B'], ['sleep', 'Sleep']]) {
      const used = anchorsFor(SPRITES[`${wetwareKey(f.id)}${k}`]);
      const want = f.anchors[pose];
      assert.deepEqual([used.headTop, used.eyeRow, used.mouthRow, used.neckRow], [want.headTop, want.eyeRow, want.mouthRow, want.neckRow], `${f.id}/${pose}`);
    }
    const sprite = SPRITES[key(f, 'a')];
    const used = anchorsFor(sprite);
    const painted = [...sprite[f.anchors.a.headTop]].map((c, x) => (c !== '.' ? x : -1)).filter((x) => x >= 0);
    assert.deepEqual([used.headLeft, used.headRight], [painted[0], painted.at(-1)], f.id);
    assert.ok(used.eyeCols.every((x) => sprite[f.anchors.a.eyeRow][x] === 'o'), `${f.id}: eye columns`);
  }
});

test('no wearable moves between the A and B frames on any Wetware form, and every wearable stays on screen (but the 1.0 clip on a 15 row form)', async () => {
  const { ACCESSORIES, placeWorn } = await import('../../src/accessories.js');
  const pal = { name: 'ice', main: '#05d9e8', accent: '#ff2a6d' };
  const box = (pts) => ({ x0: Math.min(...pts.map((p) => p.x)), x1: Math.max(...pts.map((p) => p.x)), y0: Math.min(...pts.map((p) => p.y)), y1: Math.max(...pts.map((p) => p.y)) });
  const { SPECIES } = await import('../../src/sim.js');
  const wearables = ACCESSORIES.filter((x) => x.slot !== 'prop');
  const clips = (sprite, w, pose) => {
    const ox = Math.floor((40 - sprite[0].length) / 2);
    const oy = 20 - sprite.length;
    const placed = placeWorn([{ id: w.id }], sprite, { frame: pose === 'b' ? 1 : 0, time: 0, pal, minRow: -oy });
    return offScreen(placed.flatMap((p) => p.pts.map((q) => ({ x: ox + q.x, y: oy + q.y })))).length > 0;
  };
  const known = new Set(); // wearables that clip on a 1.0 form of 15 rows (the holologo, 1 px), which a 15 row form here may do too
  for (const id of Object.keys(SPECIES).filter((k) => SPRITES[`${k}A`]?.length === 15)) for (const w of wearables) if (clips(SPRITES[`${id}A`], w, 'a')) known.add(w.id);
  const moved = [];
  const clipped = [];
  for (const f of forms) {
    for (const w of wearables) {
      const at = (pose) => placeWorn([{ id: w.id }], SPRITES[key(f, pose)], { frame: 0, time: 0, pal, minRow: -99 })[0].pts;
      const a = at('a');
      const b = at('b');
      assert.equal(a.length, b.length, `${f.id}/${w.id}: a different number of pixels`);
      if (a.length && JSON.stringify(box(a)) !== JSON.stringify(box(b))) moved.push(`${f.id}/${w.id}`);
      for (const pose of ['a', 'b', 'sleep']) {
        const sprite = SPRITES[key(f, pose)];
        if (clips(sprite, w, pose) && (sprite.length < 15 || !known.has(w.id))) clipped.push(`${f.id}/${pose}/${w.id}`);
      }
    }
  }
  console.log(`  ${wearables.length} wearables on ${forms.length} Wetware forms: ${moved.length} move between frames, ${clipped.length} leave the screen`);
  assert.deepEqual(moved, []);
  assert.deepEqual(clipped, []);
});

// --- teens -----------------------------------------------------------------------------------------------------------------------
test('the two main teens differ only slightly; the hidden-path teen stands clear of both by outline', () => {
  const iou = (x, y) => silhouetteIou(set[x].a, set[y].a);
  const mains = iou('teenCorp', 'teenStreet');
  const toCorp = iou('teenHidden', 'teenCorp');
  const toStreet = iou('teenHidden', 'teenStreet');
  console.log(`  Wetware teen overlaps: corp/street ${mains.toFixed(2)}, hidden/corp ${toCorp.toFixed(2)}, hidden/street ${toStreet.toFixed(2)}`);
  assert.ok(mains >= 0.7 && mains <= 0.82, 'the main teens are close, and inside 1.0\'s 0.82 bar for a same-stage pair');
  assert.ok(toCorp < mains - 0.1 && toStreet < mains - 0.1 && toCorp < 0.72 && toStreet < 0.72, 'the hidden teen is more distinct than the main pair by 0.1');
  assert.ok(poseDistance(set.teenHidden.a, set.teenStreet.a) >= 20 && poseDistance(set.teenHidden.a, set.teenCorp.a) >= 20, 'by outline cells, not marks');
  assert.ok(poseDistance(set.teenCorp.a, set.teenStreet.a) >= 4 && poseDistance(set.teenCorp.a, set.teenStreet.a) < 25);
  assert.ok(markDistance(set.teenCorp.a, set.teenStreet.a) > 0, 'the street lean also shows in a mark');
});

test('the baby is distinct from every teen, and the teens are blobs: the baby\'s folds on a wider body with tendril feet', () => {
  for (const id of WETWARE_TEENS_ALL) assert.ok(silhouetteIou(baby.a, set[id].a) < 0.82, id);
  for (const id of ['teenCorp', 'teenStreet']) assert.ok(set[id].a.slice(0, 3).join('').split('x').length - 1 >= 6, `${id}: the cortex folds`);
});

test('the street lean adds to the corp body and does not cut it away: every corp cell is kept except the unibrow\'s and the hair\'s rows', () => {
  const corp = set.teenCorp.a;
  const street = set.teenStreet.a;
  for (let y = 4; y <= 8; y++) assert.ok([...corp[y]].every((c, x) => c === '.' || street[y][x] !== '.'), `row ${y}`);
});

test('the hidden-path teen is Blank\'s cloaked blob: a hood peak, slit eyes, a shimmering body and a scalloped hem, no mouth', () => {
  const h = set.teenHidden;
  assert.ok(h.a[0].replace(/\./g, '').length <= 2, 'a narrow peak');
  assert.ok(h.a[6].includes('x#') && h.a[7].includes('#x'), 'the body shimmers (dim and bright cells alternating)');
  assert.ok(!h.a.join('').includes('+'), 'no mouth');
  assert.ok(h.a.at(-1).includes('.##') || h.a.at(-1).includes('##.'), 'a scalloped hem');
  assert.ok(!h.dead.join('').includes('+'));
});

// --- corp adults -----------------------------------------------------------------------------------------------------------------
test('option C: each of the four roles has a corp and a street form (Blank, the hidden adult, comes later); Wired is 1.0\'s Chrome', () => {
  for (const role of ['breach', 'dodge', 'tune', 'feast']) assert.deepEqual(WETWARE_ADULTS_ALL.map((id) => WETWARE_FORMS[id]).filter((f) => f.role === role).map((f) => f.lean), ['corp', 'street'], role);
  assert.equal(WETWARE_ADULTS_ALL.length, 8);
  assert.deepEqual(set.wired.a, SPRITES.chromeA, 'the A frame is 1.0\'s, unchanged');
  assert.notDeepEqual(set.wired.b, SPRITES.chromeB, '1.0\'s B frame moves the visor lights, so only its arms are used');
  assert.deepEqual(set.wired.b.slice(0, 9), SPRITES.chromeA.slice(0, 9));
  assert.deepEqual(set.wired.b.slice(9), SPRITES.chromeB.slice(9));
});

test('the nine adults are distinct from one another (under 1.0\'s 0.82 for a same-stage pair) and from every teen and the baby', () => {
  const pairs = [];
  for (let i = 0; i < WETWARE_NINE.length; i++) {
    for (let j = i + 1; j < WETWARE_NINE.length; j++) pairs.push({ pair: `${WETWARE_NINE[i]}/${WETWARE_NINE[j]}`, iou: silhouetteIou(set[WETWARE_NINE[i]].a, set[WETWARE_NINE[j]].a) });
  }
  pairs.sort((p, q) => q.iou - p.iou);
  console.log(`  closest Wetware adults: ${pairs.slice(0, 3).map((p) => `${p.pair} ${p.iou.toFixed(2)}`).join(', ')}`);
  for (const p of pairs) assert.ok(p.iou <= 0.82, `${p.pair}: ${p.iou.toFixed(2)}`);
  for (const id of WETWARE_NINE) for (const other of ['baby', ...WETWARE_TEENS_ALL]) assert.ok(silhouetteIou(set[id].a, set[other].a) < 0.82, `${id}/${other}`);
});

test('each corp adult carries its motif: Razor blade forearms, Wired a visor, Mentat an oversized cortex, Nutri a wide mouth and a dark belly band', () => {
  const cells = (rows, re) => rows.join('').split('').filter((c) => re.test(c)).length;
  assert.ok(set.razor.a.slice(10).join('').split('+').length - 1 >= 4, 'Razor: blade strips by the body');
  assert.ok(set.wired.a[set.wired.anchors.a.eyeRow].replace(/[.#]/g, '').length >= 8, 'Wired: one wide visor band');
  assert.ok(cells(set.mentat.a.slice(0, 3), /x/) > cells(set.nutri.a.slice(0, 3), /x/) && cells(set.mentat.a.slice(0, 3), /x/) >= 8, 'Mentat: the biggest cortex');
  assert.ok(set.nutri.a[set.nutri.anchors.a.mouthRow].split('+').length - 1 >= 6, 'Nutri: a wide mouth');
  assert.ok(set.nutri.a.some((r) => r.includes('xxxxxxxx')), 'Nutri: a dark belly band');
});

// --- street adults -------------------------------------------------------------------------------------------------------------
test('the two forms of a role are not look-alikes', () => {
  for (const [corp, street] of [['razor', 'solo'], ['wired', 'chipped'], ['mentat', 'gibson'], ['nutri', 'leech']]) {
    const iou = silhouetteIou(set[corp].a, set[street].a);
    assert.ok(iou < 0.8, `${corp}/${street}: ${iou.toFixed(2)}`);
    assert.ok(poseDistance(set[corp].a, set[street].a) >= 20, `${corp}/${street}: outline`);
  }
});

test('each street adult carries its motif: Solo a Batou-style ocular band and square jaw, Chipped a cyber lens of another colour, Gibson broadcast arcs and no legs, Leech a feeding tube', () => {
  const eyes = (id) => set[id].a[set[id].anchors.a.eyeRow];
  assert.ok(eyes('solo').includes('xooxxxxoox'), 'Solo: a wide dark band with a lens at each end');
  assert.ok(set.solo.a[0].split('#').length - 1 >= 5, 'Solo: a bristle crop');
  assert.ok(set.solo.a[9] === '#'.repeat(16) && set.solo.a[8].replace(/\./g, '').length === 8, 'Solo: a thick neck and huge shoulders');
  assert.ok(set.chipped.a[0].endsWith('#..') || set.chipped.a[0].includes('#..#'), 'Chipped: an antenna');
  const e = set.chipped.a[set.chipped.anchors.a.eyeRow];
  assert.ok(e.includes('oo') && e.includes('++'), 'Chipped: one accent eye and one highlight lens');
  assert.equal([...e].filter((c) => c === 'o').length, [...e].filter((c) => c === '+').length, 'Chipped: both eyes the same size');
  assert.ok(set.gibson.a.slice(3, 7).every((r) => r[0] !== r[1] || r[0] === '.') && set.gibson.a[4].startsWith('#..#') && set.gibson.a[4].endsWith('#..#'), 'Gibson: broadcast arcs beside the head');
  assert.ok(set.gibson.a.at(-1).replace(/\./g, '').length <= 4 && set.gibson.a[13].replace(/\./g, '').length <= 4, 'Gibson: no legs, the body dissolves');
  const tube = set.leech.a.slice(set.leech.anchors.a.mouthRow + 1, set.leech.anchors.a.mouthRow + 5).map((r) => r.indexOf('+'));
  assert.ok(tube.every((x) => x === 8), 'Leech: a feeding tube, one bright column running down from the mouth');
  const apart = set.leech.a[4].indexOf('oo', 8) - set.leech.a[4].indexOf('oo') - 2;
  assert.ok(apart >= 4, 'Leech: eyes set wide apart');
  assert.ok(set.leech.a[12].includes('xx'), 'Leech: a dark pump at the end of the tube');
});

// --- Blank, the hidden adult ----------------------------------------------------------------------------------------------------
test('Blank is the hidden teen grown, in a hooded cloak: a pointed hood, a dark face opening with two lens eyes and no mouth, camouflage over the hood top and the whole cloak, a flat hem and feet', () => {
  const b = set.blank;
  const camo = /(#x){3}|(x#){3}/;
  assert.equal(WETWARE_FORMS.blank.role, 'hidden');
  assert.equal(b.a.length, 15);
  assert.equal(b.a[0].replace(/\./g, '').length, 2, 'a hood peak');
  assert.ok(b.a[0].replace(/\./g, '').length < b.a[3].replace(/\./g, '').length, 'the hood widens');
  assert.ok(!b.a.join('').includes('+'), 'no mouth: a blank face');
  assert.ok(b.a.slice(5, 8).every((r) => r.includes('xx')) && b.a[5].includes('oo'), 'a dark face opening with the eyes in it');
  assert.ok(b.a.slice(5, 8).every((r) => r.startsWith('..##') && r.endsWith('##..')), 'a solid hood rim around it');
  assert.ok([2, 3, 4, 8, 10, 11, 12, 13].every((y) => camo.test(b.a[y])), 'camouflage over the hood top, the chin and the whole cloak');
  assert.ok(b.a[13].replace(/\./g, '').length === 14 && b.a[12].replace(/\./g, '').length === 14, 'a flat hem, no scallops');
  assert.ok(b.a.at(-1).replace(/\./g, '').length === 4, 'feet below the hem');
  // The hood does not move between frames; the cloak's shimmer swaps phase and the feet step.
  for (let y = 0; y <= b.anchors.a.neckRow; y++) assert.equal(b.b[y], b.a[y], `row ${y}`);
  assert.notEqual(b.a[11], b.b[11]);
  assert.ok(poseDistance(b.a, b.b) >= 4);
});

test('Blank grows from the hidden teen (the hood peak and the shimmer carry the lineage, not the outline) and is clear of the eight role adults', () => {
  const iou = (x, y) => silhouetteIou(set[x].a, set[y].a);
  console.log(`  Blank against its teen ${iou('blank', 'teenHidden').toFixed(2)}, corp teen ${iou('blank', 'teenCorp').toFixed(2)}, street teen ${iou('blank', 'teenStreet').toFixed(2)}; closest role adult ${Math.max(...WETWARE_ADULTS_ALL.map((id) => iou('blank', id))).toFixed(2)}`);
  assert.ok(set.blank.a.join('').includes('x') && set.teenHidden.a.join('').includes('x#x'), 'both shimmer');
  assert.equal(set.blank.a[0].replace(/\./g, '').length, set.teenHidden.a[0].replace(/\./g, '').length, 'the same hood peak');
  for (const id of WETWARE_ADULTS_ALL) assert.ok(iou('blank', id) < 0.8, `blank/${id}`);
});
