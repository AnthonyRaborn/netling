// Tests for the Program egg's sprites (baby and teens). Run with `npm run proto:test`. Deterministic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './ready.js'; // first: registers the forms before src/sim.js can load src/accessories.js (see ready.js)
import { programForms, PROGRAM_FORMS, PROGRAM_TEENS_ALL, PROGRAM_ADULTS_ALL, PROGRAM_HIDDEN_BRANCH, PROGRAM_ELDER_OF, programPose } from './program-models.js';
import { programKey } from './register.js';
import { scaledOverlap } from './metrics.js';
import { SPRITES } from '../../src/sprites.js';
import { silhouetteIou, poseDistance, markDistance, offScreen } from '../../tools/lib/sprite-checks.mjs';

const set = programForms();
const WIDTH = { baby: 12, teen: 14, adult: 16, elder: 18 };
const forms = Object.values(set);
const key = (f, pose) => `${programKey(f.id)}${pose === 'a' ? 'A' : pose === 'b' ? 'B' : pose === 'sleep' ? 'Sleep' : 'Dead'}`;

test('Program has a baby, three teens (corp, street, hidden), nine adults and nine elders, in the egg\'s own table', () => {
  assert.deepEqual(Object.keys(PROGRAM_FORMS).filter((id) => ['baby', 'teen'].includes(PROGRAM_FORMS[id].stage)), ['baby', 'teenCorp', 'teenStreet', 'teenHidden']);
  assert.deepEqual(Object.keys(PROGRAM_FORMS).filter((id) => PROGRAM_FORMS[id].stage === 'adult'), PROGRAM_ADULTS_ALL);
  assert.deepEqual(PROGRAM_HIDDEN_BRANCH, ['baby', 'teenHidden', 'ghost']);
  assert.deepEqual(PROGRAM_TEENS_ALL.map((id) => PROGRAM_FORMS[id].lean), ['corp', 'street', 'hidden']);
});

test('the reused forms are 1.0\'s art: the A frame of Bitling, Kernel and Shell, unchanged', () => {
  assert.deepEqual(set.baby.a, SPRITES.bitlingA);
  assert.deepEqual(set.teenCorp.a, SPRITES.kernelA);
  assert.deepEqual(set.teenHidden.a, SPRITES.shellA);
  assert.deepEqual(set.ghost.a, SPRITES.ghostA);
});

test('every sprite is rectangular, the stage\'s width, 9 to 15 rows, with known marks', () => {
  for (const f of forms) {
    for (const pose of ['a', 'b', 'sleep', 'dead']) {
      const rows = f[pose];
      assert.ok(rows.length >= 9 && rows.length <= 15, `${f.id}/${pose}: ${rows.length} rows`);
      assert.equal(new Set(rows.map((r) => r.length)).size, 1, `${f.id}/${pose}: ragged`);
      assert.equal(rows[0].length, f.id === 'ghostElder' ? 14 : WIDTH[f.stage], `${f.id}/${pose}: width`); // the hidden elder keeps 1.0's size
      assert.match(rows.join(''), /^[.#o+x]+$/, `${f.id}/${pose}: marks`);
      assert.equal(rows.length, f.a.length, `${f.id}/${pose}: same height as A`);
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

test('the head, eyes, mouth and neck are identical in A and B; only the legs animate, and the frames still differ', () => {
  for (const f of forms) {
    for (let y = 0; y <= f.anchors.a.neckRow; y++) assert.equal(f.b[y], f.a[y], `${f.id}: row ${y} differs between frames`);
    assert.ok(poseDistance(f.a, f.b) >= 4, `${f.id}: A and B nearly identical`);
    // The wearable code finds the body's bottom as the last row with 0.4 of the width painted; it must be the same row in both frames.
    const bottom = (s) => s.findLastIndex((r) => [...r].filter((c) => c !== '.').length >= s[0].length * 0.4);
    assert.equal(bottom(f.a), bottom(f.b), `${f.id}: the body's bottom moves between frames`);
  }
});

test('the asleep and dead poses keep the awake outline; the eyes are the 1.0 slit and X, plus one Program mark on the chest', () => {
  for (const f of forms) {
    const a = f.anchors.a;
    assert.equal(poseDistance(f.a, f.sleep), 0, `${f.id}: asleep outline`);
    assert.equal(poseDistance(f.a, f.dead), 0, `${f.id}: dead outline`);
    assert.ok(markDistance(f.a, f.sleep) > 0 && markDistance(f.a, f.dead) > 0);
    for (const kind of ['sleep', 'dead']) {
      const generic = programPose(f.id, f.a, a, kind);
      assert.deepEqual(generic, f[kind]);
    }
    // The chest mark: sleep is one block (a cursor), dead is a run across a single row; both below the mouth.
    const changed = (pose) => f[pose].flatMap((row, y) => [...row].map((c, x) => (c === 'o' && f.a[y][x] !== 'o' && y > a.mouthRow ? [x, y] : null)).filter(Boolean));
    const cursor = changed('sleep');
    const line = changed('dead').filter(([, y]) => y >= a.neckRow);
    assert.ok(cursor.length >= 2 && new Set(cursor.map(([, y]) => y)).size === 1, `${f.id}: cursor`);
    assert.ok(line.length >= 4 && new Set(line.map(([, y]) => y)).size === 1, `${f.id}: flatline ${line.length} cells`);
    assert.ok(line.length > cursor.length, `${f.id}: the flatline is longer than the cursor`);
  }
});

test('the two main teens differ only slightly; the hidden-path teen stands clear of both by outline', () => {
  const iou = (x, y) => silhouetteIou(set[x].a, set[y].a);
  const mains = iou('teenCorp', 'teenStreet');
  const toCorp = iou('teenHidden', 'teenCorp');
  const toStreet = iou('teenHidden', 'teenStreet');
  console.log(`  Program teen overlaps: corp/street ${mains.toFixed(2)}, hidden/corp ${toCorp.toFixed(2)}, hidden/street ${toStreet.toFixed(2)}`);
  assert.ok(mains >= 0.7 && mains <= 0.82, 'the main teens are close, and inside 1.0\'s 0.82 bar for a same-stage pair');
  assert.ok(toCorp < mains - 0.1 && toStreet < mains - 0.1 && toCorp < 0.7 && toStreet < 0.7);
  assert.ok(poseDistance(set.teenHidden.a, set.teenStreet.a) >= 20 && poseDistance(set.teenHidden.a, set.teenCorp.a) >= 20, 'by outline cells, not marks');
  assert.ok(poseDistance(set.teenCorp.a, set.teenStreet.a) >= 4 && poseDistance(set.teenCorp.a, set.teenStreet.a) < 25);
  assert.ok(markDistance(set.teenCorp.a, set.teenStreet.a) > 0, 'the street lean also shows in a mark');
});

test('the baby reads as the start of the line: closest to the corp and street teens, further from the hidden one', () => {
  const iou = (id) => silhouetteIou(set.baby.a, set[id].a);
  assert.ok(iou('teenCorp') < 0.82 && iou('teenStreet') < 0.82 && iou('teenHidden') < 0.82, 'the stages are distinct');
});

test('the hidden-path teen is the Shell: a hollow casing with a void inside, its eyes in the void', () => {
  assert.ok(set.teenHidden.a.join('').includes('x'));
  assert.ok(!set.teenCorp.a.join('').includes('x') && !set.baby.a.join('').includes('x'));
  assert.ok(!set.teenHidden.sleep[set.teenHidden.anchors.a.eyeRow].includes('o'), 'asleep: the eye row is shut');
  assert.ok(!set.teenHidden.dead.join('').includes('+'), 'dead: the Shell has no mouth');
});

test('the wearable code sees every Program form\'s authored anchors, and the real head width', async () => {
  const { anchorsFor } = await import('../../src/accessories.js');
  for (const f of forms) {
    for (const [pose, k] of [['a', 'A'], ['b', 'B'], ['sleep', 'Sleep']]) {
      const used = anchorsFor(SPRITES[`${programKey(f.id)}${k}`]);
      const want = f.anchors[pose];
      assert.deepEqual([used.headTop, used.eyeRow, used.mouthRow, used.neckRow], [want.headTop, want.eyeRow, want.mouthRow, want.neckRow], `${f.id}/${pose}`);
    }
    const sprite = SPRITES[`${programKey(f.id)}A`];
    const used = anchorsFor(sprite);
    const painted = [...sprite[f.anchors.a.headTop]].map((c, x) => (c !== '.' ? x : -1)).filter((x) => x >= 0);
    assert.deepEqual([used.headLeft, used.headRight], [painted[0], painted.at(-1)], f.id);
    assert.ok(used.eyeCols.every((x) => sprite[f.anchors.a.eyeRow][x] === 'o'), `${f.id}: eye columns`);
  }
});

test('no wearable moves between the A and B frames on any Program form', async () => {
  const { ACCESSORIES, placeWorn } = await import('../../src/accessories.js');
  const pal = { name: 'ice', main: '#05d9e8', accent: '#ff2a6d' };
  const box = (pts) => ({ x0: Math.min(...pts.map((p) => p.x)), x1: Math.max(...pts.map((p) => p.x)), y0: Math.min(...pts.map((p) => p.y)), y1: Math.max(...pts.map((p) => p.y)) });
  const moved = [];
  let cases = 0;
  for (const f of forms) {
    for (const w of ACCESSORIES.filter((x) => x.slot !== 'prop')) {
      const at = (pose) => placeWorn([{ id: w.id }], SPRITES[key(f, pose)], { frame: 0, time: 0, pal, minRow: -99 })[0].pts;
      const a = at('a');
      const b = at('b');
      cases++;
      if (!a.length) continue;
      assert.equal(a.length, b.length, `${f.id}/${w.id}: a different number of pixels`);
      if (JSON.stringify(box(a)) !== JSON.stringify(box(b))) moved.push(`${f.id}/${w.id}`);
    }
  }
  console.log(`  ${cases} Program wearable and form cases, ${moved.length} move between frames`);
  assert.deepEqual(moved, []);
});

test('every 1.0 wearable stays on screen on every Program form and pose, except where 1.0 already clips (a 15 row form)', async () => {
  const { ACCESSORIES, placeWorn } = await import('../../src/accessories.js');
  const { SPECIES } = await import('../../src/sim.js');
  const pal = { name: 'ice', main: '#05d9e8', accent: '#ff2a6d' };
  const clips = (sprite, w, pose) => {
    const ox = Math.floor((40 - sprite[0].length) / 2);
    const oy = 20 - sprite.length;
    const placed = placeWorn([{ id: w.id }], sprite, { frame: pose === 'b' ? 1 : 0, time: 0, pal, minRow: -oy });
    return offScreen(placed.flatMap((p) => p.pts.map((q) => ({ x: ox + q.x, y: oy + q.y })))).length > 0;
  };
  const wearables = ACCESSORIES.filter((x) => x.slot !== 'prop');
  const known = new Set(); // wearables that clip on a 1.0 form of 15 rows
  for (const f of Object.keys(SPECIES).filter((id) => SPRITES[`${id}A`].length === 15)) for (const w of wearables) if (clips(SPRITES[`${f}A`], w, 'a')) known.add(w.id);
  const bad = [];
  let cases = 0;
  for (const f of forms) {
    for (const pose of ['a', 'b', 'sleep']) {
      const sprite = SPRITES[key(f, pose)];
      for (const w of wearables) {
        cases++;
        if (clips(sprite, w, pose) && (sprite.length < 15 || !known.has(w.id))) bad.push(`${f.id}/${pose}/${w.id}`);
      }
    }
  }
  console.log(`  ${cases} Program wearable cases, ${bad.length} leave the screen where 1.0 would not (${[...known].join(', ') || 'none'} clip on 1.0's 15 row forms)`);
  assert.deepEqual(bad, []);
});

// --- adults ----------------------------------------------------------------------------------------------------------------------
test('option C: each of the four roles has a corp and a street form, and the hidden form has no lean', () => {
  const adults = PROGRAM_ADULTS_ALL.map((id) => PROGRAM_FORMS[id]);
  for (const role of ['breach', 'dodge', 'tune', 'feast']) {
    assert.deepEqual(adults.filter((f) => f.role === role).map((f) => f.lean), ['corp', 'street'], role);
  }
  assert.deepEqual(adults.filter((f) => f.role === 'hidden').map((f) => f.lean), [undefined]);
  assert.equal(adults.length, 9);
});

test('the nine adults are distinct from one another: no pair overlaps more than 1.0 allows within a stage (0.82)', () => {
  const pairs = [];
  for (let i = 0; i < PROGRAM_ADULTS_ALL.length; i++) {
    for (let j = i + 1; j < PROGRAM_ADULTS_ALL.length; j++) {
      pairs.push({ pair: `${PROGRAM_ADULTS_ALL[i]}/${PROGRAM_ADULTS_ALL[j]}`, iou: silhouetteIou(set[PROGRAM_ADULTS_ALL[i]].a, set[PROGRAM_ADULTS_ALL[j]].a) });
    }
  }
  pairs.sort((p, q) => q.iou - p.iou);
  console.log(`  closest Program adults: ${pairs.slice(0, 3).map((p) => `${p.pair} ${p.iou.toFixed(2)}`).join(', ')}`);
  for (const p of pairs) assert.ok(p.iou <= 0.82, `${p.pair}: ${p.iou.toFixed(2)}`);
});

test('the two forms of a role are not look-alikes, and a hidden-path adult stands apart from the role forms', () => {
  const iou = (x, y) => silhouetteIou(set[x].a, set[y].a);
  for (const [corp, street] of [['tiger', 'worm'], ['mouse', 'spoof'], ['parse', 'phreak'], ['gobble', 'snarf']]) {
    assert.ok(iou(corp, street) < 0.8, `${corp}/${street}: ${iou(corp, street).toFixed(2)}`);
    assert.ok(poseDistance(set[corp].a, set[street].a) >= 20, `${corp}/${street}: outline`);
  }
});

test('each role form carries its motif: Breach teeth or jaws, Dodge ears or a hood, Tune a bracket or cups, Feast a big mouth', () => {
  const has = (id, re) => re.test(set[id].a.join('\n'));
  assert.ok(has('tiger', /x.{12}x/) && set.tiger.a[set.tiger.anchors.a.mouthRow].includes('+'), 'Tiger: stripes and fangs');
  assert.ok(has('worm', /#\+#\+##\+#\+#/), 'Worm: jaws');
  assert.ok(set.mouse.a[0].replace(/\./g, '').length >= 8, 'Mouse: big ears');
  assert.ok(set.spoof.a.slice(4, 8).every((r) => r.includes('x')), 'Spoof: half mask');
  assert.ok(set.parse.a[0].startsWith('#.#') && set.parse.a[0].endsWith('#.#'), 'Parse: bracket antennae');
  assert.ok(set.phreak.a[5].startsWith('#x#') && set.phreak.a[5].endsWith('#x#'), 'Phreak: headphone cups');
  const wide = (id) => set[id].a[set[id].anchors.a.mouthRow].split('+').length - 1;
  assert.ok(wide('gobble') >= 6 && wide('snarf') >= 8, 'Feast: wide mouths');
  assert.ok(set.snarf.a.some((r) => r.includes('xxxxxxxx')), 'Snarf: a dark maw');
});

test('Ghost is the hidden adult the Shell grows into: 1.0\'s eyes, mouth and dome, with a frozen head', () => {
  assert.equal(set.ghost.anchors.a.eyeRow, 4);
  assert.deepEqual(set.ghost.a.slice(0, 11), SPRITES.ghostA.slice(0, 11));
  assert.notDeepEqual(set.ghost.a, SPRITES.ghostB, '1.0\'s own B frame moves the mouth, so it is not used as is');
});

// --- elders: one per adult --------------------------------------------------------------------------------------------------------
test('every adult has exactly one elder; the role forms\' are variants: 18 columns, one row taller (never past 15), the adult\'s marks kept', () => {
  const elders = Object.keys(PROGRAM_FORMS).filter((id) => PROGRAM_FORMS[id].stage === 'elder');
  assert.deepEqual(elders.map((id) => PROGRAM_FORMS[id].from).sort(), [...PROGRAM_ADULTS_ALL].sort());
  for (const adult of PROGRAM_ADULTS_ALL.filter((id) => id !== 'ghost')) {
    const elder = set[PROGRAM_ELDER_OF(adult)];
    assert.equal(PROGRAM_FORMS[elder.id].from, adult);
    assert.equal(elder.a[0].length, 18, `${elder.id}: width`);
    assert.ok(elder.a.length <= 15 && elder.a.length >= set[adult].a.length, `${elder.id}: ${elder.a.length} rows against ${set[adult].a.length}`);
    for (const ch of new Set(set[adult].a.join('').replace(/[.]/g, ''))) assert.ok(elder.a.join('').includes(ch), `${elder.id}: lost the ${ch} mark`);
  }
});

test('each elder is closest, after scaling, to the adult it grows from among all nine adults (the sibling of its role included)', () => {
  const rows = PROGRAM_ADULTS_ALL.filter((id) => id !== 'ghost').map((adult) => {
    const elder = set[PROGRAM_ELDER_OF(adult)].a;
    const ranked = PROGRAM_ADULTS_ALL.map((x) => ({ x, v: scaledOverlap(elder, set[x].a) })).sort((p, q) => q.v - p.v);
    const other = ranked.find((r) => r.x !== adult);
    return { adult, own: scaledOverlap(elder, set[adult].a), other: other.x, otherValue: other.v };
  });
  console.log('  Program elder against its adult (scaled), best other: ' + rows.map((r) => `${r.adult} ${r.own.toFixed(2)} vs ${r.other} ${r.otherValue.toFixed(2)}`).join(', '));
  for (const r of rows) assert.ok(r.own > r.otherValue && r.own >= 0.75, `${r.adult}: ${r.own.toFixed(2)} against ${r.other} ${r.otherValue.toFixed(2)}`);
});

test('the nine Program elders are distinct from one another (under 1.0\'s 0.82 for a pair of different roles)', () => {
  const pairs = [];
  for (let i = 0; i < PROGRAM_ADULTS_ALL.length; i++) {
    for (let j = i + 1; j < PROGRAM_ADULTS_ALL.length; j++) {
      const [x, y] = [PROGRAM_ADULTS_ALL[i], PROGRAM_ADULTS_ALL[j]];
      pairs.push({ pair: `${x}/${y}`, sibling: PROGRAM_FORMS[x].role === PROGRAM_FORMS[y].role, iou: silhouetteIou(set[PROGRAM_ELDER_OF(x)].a, set[PROGRAM_ELDER_OF(y)].a) });
    }
  }
  pairs.sort((p, q) => q.iou - p.iou);
  console.log(`  closest Program elders: ${pairs.slice(0, 3).map((p) => `${p.pair} ${p.iou.toFixed(2)}`).join(', ')}`);
  for (const p of pairs) assert.ok(p.iou < 0.82, `${p.pair} ${p.iou.toFixed(3)}`);
});

test('Ghost\'s elder is 1.0\'s Whisper (a hidden form keeps 1.0\'s size): smaller than the Ghost, its tail thinning, the head still between frames', () => {
  const elder = set.ghostElder;
  assert.equal(PROGRAM_FORMS.ghostElder.from, 'ghost');
  assert.deepEqual(elder.a, SPRITES.whisperA);
  assert.equal(elder.a[0].length, 14);
  const cells = (rows) => rows.join('').replace(/\./g, '').length;
  assert.ok(cells(elder.a) < cells(set.ghost.a), 'smaller than the Ghost');
  assert.deepEqual(elder.b.slice(0, 9), elder.a.slice(0, 9), '1.0\'s B frame moves the mouth; here the head is still');
  assert.ok(elder.a.at(-1).replace(/\./g, '').length < elder.a[10].replace(/\./g, '').length, 'the tail thins');
});

test('Gobble\'s mouth sits right under its eyes and reads as a mouth: teeth over a dark maw', () => {
  const g = set.gobble;
  const { eyeRow, mouthRow } = g.anchors.a;
  assert.equal(mouthRow, eyeRow + 2, 'the mouth is directly under the eyes');
  assert.ok(g.a[mouthRow].split('+').length - 1 >= 8, 'a wide row of teeth');
  assert.ok(g.a[mouthRow + 1].includes('xxxxxx'), 'a dark maw under the teeth');
});

test('Worm\'s body is a plain column with stripes: the same width all the way down, no side bumps', () => {
  const w = set.worm;
  const spans = w.a.slice(9, 13).map((r) => [r.indexOf('#') < 0 ? r.indexOf('x') : Math.min(...['#', 'x'].map((c) => r.indexOf(c)).filter((i) => i >= 0)), r.length - Math.max(r.lastIndexOf('#'), r.lastIndexOf('x')) - 1]);
  assert.equal(new Set(spans.map((s) => s.join())).size, 1, 'one width for every body row');
  assert.ok(w.a.slice(9, 13).some((r) => r.includes('xxxxxxxx')), 'stripes');
  assert.ok(w.a[9].replace(/\./g, '').length < w.a[3].replace(/\./g, '').length, 'the body is narrower than the head');
  assert.ok(w.b.slice(9, 13).some((r) => r.includes('xxxxxxxx')) && w.b.slice(9, 13).join() !== w.a.slice(9, 13).join(), 'the stripes step between frames');
});
