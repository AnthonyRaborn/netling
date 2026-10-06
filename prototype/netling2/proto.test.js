// Tests for the Netling 2.0 sprite prototype. Run with `npm run proto:test`. Not part of `npm test` (the prototype is not
// the shipped game). Deterministic: no clock, no randomness.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { forms, compose, FORMS, LINE, HIDDEN_BRANCH, TEENS_ALL, ADULTS_ALL, ELDER_OF, pose, ironMarks } from './models.js';
import { ADULT_BODY, TEEN_BODY, OVERLAYS, LEAN_OVERLAYS, TEEN_OVERLAYS, ANCHORS } from './art.js';
import { temperTell, levelOf, guardedLevel, THRESHOLDS, GUARD, EGGS, SLOT_MS, FRAME_MS } from './tell.js';
import { neglected, NEGLECT_LEVELS } from './neglect.js';
import { neglectLevel, guardedNeglect, LINES, GUARD as NEED_GUARD } from './needs.js';
import { glitched, tearRows, MAX_BUGS, TWITCH_EVERY_MS, TWITCH_MS } from './glitch.js';
import { register, protoKey, MODELS } from './register.js';
import { lineOverlaps, authoring, modelGap, elderTable, scaledOverlap } from './metrics.js';
import { silhouetteIou } from '../../tools/lib/sprite-checks.mjs';
import { spriteCells, poseDistance, markDistance, offScreen } from '../../tools/lib/sprite-checks.mjs';

const WIDTH = { baby: 12, teen: 14, adult: 16, elder: 18 };

// --- the line ---------------------------------------------------------------------------------------------------------------
test('the main line is four forms in life order; the other main teen and the hidden branch exist in the authored model only', () => {
  assert.deepEqual(LINE, ['baby', 'teenStreet', 'gronk', 'gronkElder']);
  assert.deepEqual(LINE.map((id) => FORMS[id].stage), ['baby', 'teen', 'adult', 'elder']);
  assert.deepEqual(Object.keys(forms('A')), LINE);
  assert.deepEqual(Object.keys(forms('B')), Object.keys(FORMS));
  assert.equal(Object.keys(FORMS).filter((id) => FORMS[id].stage === 'adult').length, 9);
  assert.equal(Object.keys(FORMS).filter((id) => FORMS[id].stage === 'elder').length, 9, 'one elder per adult');
  assert.deepEqual(HIDDEN_BRANCH, ['baby', 'teenHidden', 'guru']);
  assert.deepEqual(TEENS_ALL, ['teenCorp', 'teenStreet', 'teenHidden']);
});

// --- art ------------------------------------------------------------------------------------------------------------------
for (const model of MODELS) {
  const set = forms(model);
  test(`model ${model}: every sprite is rectangular, the right width, 9 to 15 rows, with known marks`, () => {
    for (const f of Object.values(set)) {
      for (const pose of ['a', 'b', 'sleep', 'dead']) {
        const rows = f[pose];
        assert.ok(rows.length >= 9 && rows.length <= 15, `${f.id}/${pose}: ${rows.length} rows`);
        assert.equal(new Set(rows.map((r) => r.length)).size, 1, `${f.id}/${pose}: ragged`);
        assert.equal(rows[0].length, WIDTH[f.stage], `${f.id}/${pose}: width`);
        assert.match(rows.join(''), /^[.#o+x]+$/, `${f.id}/${pose}: marks`);
        assert.equal(rows.length, f.a.length, `${f.id}/${pose}: same height as A`);
      }
    }
  });

  test(`model ${model}: anchors point at the head, the eyes and the body, and move at most one row between frames`, () => {
    for (const f of Object.values(set)) {
      for (const pose of ['a', 'b', 'sleep']) {
        const { headTop, eyeRow, mouthRow, neckRow } = f.anchors[pose];
        const sprite = f[pose];
        for (const r of [headTop, eyeRow, mouthRow, neckRow]) assert.ok(r >= 0 && r < sprite.length, `${f.id}/${pose}: anchor out of range`);
        assert.ok(headTop < eyeRow && eyeRow < mouthRow && mouthRow < neckRow, `${f.id}/${pose}: anchors out of order`);
        assert.ok(/[#o+x]/.test(sprite[headTop]), `${f.id}/${pose}: headTop row is empty`);
        assert.ok((pose === 'sleep' ? f.a : sprite)[eyeRow].includes('o'), `${f.id}/${pose}: no eye on eyeRow`);
      }
      for (const key of ['headTop', 'eyeRow', 'mouthRow', 'neckRow']) assert.ok(Math.abs(f.anchors.a[key] - f.anchors.b[key]) <= 1, `${f.id}: ${key} moves more than a row`);
    }
  });

  test(`model ${model}: the A and B frames differ, and the asleep and dead poses differ from A`, () => {
    for (const f of Object.values(set)) {
      assert.ok(poseDistance(f.a, f.b) >= 4, `${f.id}: A and B nearly identical`);
      assert.ok(poseDistance(f.a, f.sleep) + markDistance(f.a, f.sleep) > 0, `${f.id}: asleep pose`);
      assert.ok(poseDistance(f.a, f.dead) + markDistance(f.a, f.dead) > 0, `${f.id}: dead pose`);
      assert.equal(poseDistance(f.a, f.sleep), 0, `${f.id}: asleep keeps the body outline`);
    }
  });

}

test('the two models share baby and the elder, and build the teen and Gronk differently', () => {
  const A = forms('A');
  const B = forms('B');
  for (const id of ['baby', 'gronkElder']) assert.deepEqual(A[id].a, B[id].a);
  for (const id of ['teenStreet', 'gronk']) assert.notDeepEqual(A[id].a, B[id].a, `${id} should differ between models`);
});

test('compose merges, erases and rejects a mismatched overlay', () => {
  assert.deepEqual(compose(['###', '###'], ['.o.', '_..']), ['#o#', '.##']);
  assert.throws(() => compose(['###'], ['...', '...']));
});

test('every overlay is its body size in both frames, and changes the body', () => {
  const check = (body, o, label) => {
    for (const f of ['a', 'b']) {
      assert.equal(o[f].length, body[f].length, `${label}/${f}`);
      for (const row of o[f]) assert.equal(row.length, body[f][0].length, `${label}/${f}: ragged overlay`);
      const merged = compose(body[f], o[f]);
      assert.ok(poseDistance(body[f], merged) + markDistance(body[f], merged) >= 4, `${label}/${f}: overlay barely changes the body`);
    }
  };
  for (const [k, o] of Object.entries(OVERLAYS)) check(ADULT_BODY, o, `role ${k}`);
  for (const [k, o] of Object.entries(LEAN_OVERLAYS)) check(ADULT_BODY, o, `lean ${k}`);
  for (const [k, o] of Object.entries(TEEN_OVERLAYS)) check(TEEN_BODY, o, `teen ${k}`);
});

// --- one elder per adult --------------------------------------------------------------------------------------------------------
test('the elder is a variant of its adult: wider, no taller than 15 rows, closest in outline to the adult it grows from', () => {
  const set = forms('B');
  const elder = set.gronkElder;
  assert.equal(FORMS.gronkElder.from, 'gronk');
  assert.ok(elder.a[0].length > set.gronk.a[0].length && elder.a.length <= 15);
  const overlap = (id) => silhouetteIou(elder.a, set[id].a);
  console.log(`  elder against gronk ${overlap('gronk').toFixed(2)}, teen ${overlap('teenStreet').toFixed(2)}, baby ${overlap('baby').toFixed(2)}`);
  // 1.0's mainframes sit at 0.77 to 0.82 of their adult line, and closer to it than to any other form.
  assert.ok(overlap('gronk') > overlap('teenStreet') && overlap('gronk') > overlap('baby'));
  assert.ok(overlap('gronk') >= 0.7 && overlap('gronk') < 0.9, overlap('gronk').toFixed(2));
  // It keeps the adult's marks: the horn studs on the top row, the toothed jaw and the broad shoulders.
  assert.ok(elder.a[0].includes('#') && elder.a[8].includes('+#+') && elder.a[9].startsWith('##'));
  assert.ok(set.gronk.a[8].includes('+#+'));
});

// --- the hidden path: distinct, not marks over the others' outline (decided) --------------------------------------------------
test('the hidden-path teen is the most distinct of the three: further from each main teen than the main teens are from each other', () => {
  const set = forms('B');
  const iou = (x, y) => silhouetteIou(set[x].a, set[y].a);
  const mains = iou('teenCorp', 'teenStreet');
  const toCorp = iou('teenHidden', 'teenCorp');
  const toStreet = iou('teenHidden', 'teenStreet');
  console.log(`  teen overlaps: corp/street ${mains.toFixed(2)}, hidden/corp ${toCorp.toFixed(2)}, hidden/street ${toStreet.toFixed(2)}`);
  // The two main teens may differ only slightly (decided); the hidden one has to stand clear of both.
  assert.ok(mains >= 0.7, 'the main teens are meant to be close');
  assert.ok(toCorp < mains - 0.1 && toStreet < mains - 0.1, 'the hidden teen is not clearly more distinct than the main teens are from each other');
  assert.ok(toCorp < 0.7 && toStreet < 0.7);
  // And by a real outline difference, not marks: many cells that are painted in one and empty in the other.
  assert.ok(poseDistance(set.teenHidden.a, set.teenStreet.a) >= 20 && poseDistance(set.teenHidden.a, set.teenCorp.a) >= 20);
  assert.ok(poseDistance(set.teenCorp.a, set.teenStreet.a) < poseDistance(set.teenHidden.a, set.teenStreet.a));
});

test('the hidden-path teen foreshadows Guru: a crown and a third eye above the eyes, taller than the other teens', () => {
  const set = forms('B');
  const hidden = set.teenHidden;
  const eye = hidden.anchors.a.eyeRow;
  assert.ok(hidden.a[eye - 1].includes('oo'), 'third eye');
  assert.ok(hidden.a[0].includes('#.#'), 'crown');
  assert.ok(set.guru.a[0].includes('#.#') && set.guru.a[set.guru.anchors.a.eyeRow - 1].includes('oo'), 'Guru has the same marks');
  assert.ok(hidden.a.length > set.teenStreet.a.length && hidden.a.length > set.teenCorp.a.length);
  assert.equal(FORMS.teenHidden.lean, 'hidden');
});

// --- one elder per adult: all nine of Iron's ------------------------------------------------------------------------------------
test('every adult has exactly one elder, a variant of it: wider, no taller than 15 rows, and keeping its kinds of marks', () => {
  const set = forms('B');
  const elders = Object.keys(FORMS).filter((id) => FORMS[id].stage === 'elder');
  assert.deepEqual(elders.map((id) => FORMS[id].from).sort(), [...ADULTS_ALL].sort());
  for (const adult of ADULTS_ALL) {
    const id = ELDER_OF(adult);
    assert.equal(FORMS[id].from, adult);
    const elder = set[id];
    assert.equal(elder.a[0].length, 18, `${id}: width`);
    assert.ok(elder.a.length <= 15 && elder.a.length >= set[adult].a.length, `${id}: ${elder.a.length} rows against ${set[adult].a.length}`);
    for (const ch of new Set(set[adult].a.join('').replace(/[.]/g, ''))) assert.ok(elder.a.join('').includes(ch), `${id}: lost the ${ch} mark`);
  }
});

test('each elder is closest, after scaling, to the adult it grows from, among all nine adults (the sibling of its role included)', () => {
  const table = elderTable();
  console.log('  elder against its adult (scaled), best other: ' + table.map((r) => `${r.adult} ${r.own.toFixed(2)} vs ${r.other} ${r.otherValue.toFixed(2)}`).join(', '));
  for (const r of table) assert.ok(r.own > r.otherValue, `${r.adult}: its elder is closer to ${r.other} (${r.otherValue.toFixed(2)}) than to it (${r.own.toFixed(2)})`);
  // The margins are thin for a few; this records them so a redraw that loses one is caught.
  for (const r of table) assert.ok(r.own >= 0.75, `${r.adult}: only ${r.own.toFixed(2)}`);
});

test('the nine elders are distinct from one another (1.0 flags nothing above 0.82 within a stage, siblings of a role aside)', () => {
  const set = forms('B');
  const pairs = [];
  for (let i = 0; i < ADULTS_ALL.length; i++) for (let j = i + 1; j < ADULTS_ALL.length; j++) {
    const x = ADULTS_ALL[i];
    const y = ADULTS_ALL[j];
    const sibling = FORMS[x].role === FORMS[y].role;
    pairs.push({ pair: `${ELDER_OF(x)}/${ELDER_OF(y)}`, sibling, iou: silhouetteIou(set[ELDER_OF(x)].a, set[ELDER_OF(y)].a) });
  }
  const cross = pairs.filter((p) => !p.sibling).sort((p, q) => q.iou - p.iou);
  const sib = pairs.filter((p) => p.sibling);
  console.log(`  elders, different roles: worst ${cross[0].pair} ${cross[0].iou.toFixed(2)}; siblings ${sib.map((p) => `${p.pair} ${p.iou.toFixed(2)}`).join(', ')}`);
  for (const p of cross) assert.ok(p.iou < 0.82, `${p.pair} ${p.iou.toFixed(3)}`);
  for (const p of sib) assert.ok(p.iou < 0.95 && p.iou > 0.5, `${p.pair} ${p.iou.toFixed(2)}`);
});

// --- the line and the two models -----------------------------------------------------------------------------------------------
test('the four stages are distinct by silhouette yet read as one line (1.0 flags nothing above 0.82 within a stage)', () => {
  for (const model of MODELS) {
    const pairs = lineOverlaps(model);
    console.log(`  model ${model}: ${pairs.map((p) => `${p.pair} ${p.iou.toFixed(2)}`).join(', ')}`);
    for (const p of pairs) assert.ok(p.iou < 0.82 && p.iou > 0.3, `model ${model}: ${p.pair} ${p.iou.toFixed(2)}`);
  }
});

test('for one line the models cost about the same: composing only pays once bodies are reused across forms', () => {
  const a = authoring('A');
  const b = authoring('B');
  console.log(`  hand-placed cells for the teen and adult: A ${a.cells}, B ${b.cells}`);
  assert.ok(Math.abs(a.cells - b.cells) / b.cells < 0.2, `A ${a.cells}, B ${b.cells}`);
});

test('where the models differ: the teen is the same outline, Gronk differs by a visible number of cells', () => {
  const teen = modelGap('teenStreet');
  const gronk = modelGap('gronk');
  console.log(`  composed against authored: teen ${teen.outline} outline and ${teen.marks} mark cells, Gronk ${gronk.outline} outline and ${gronk.marks} mark cells, overlap ${gronk.iou.toFixed(2)}`);
  assert.equal(teen.outline, 0);
  assert.ok(gronk.outline >= 8 && gronk.iou < 1);
});

// --- wearables: the real 1.0 code on the prototype sprites -----------------------------------------------------------------
// A wearable that clips on a 15 row prototype sprite is only a prototype problem if it does not clip on 1.0's own 15 row
// forms too (the holologo puts one pixel above the screen on every 15 row form, Chrome and Firewall included).
test('every 1.0 wearable stays on screen on every prototype form and pose, except where 1.0 already clips', async () => {
  const { SPRITES, ANCHOR_ROWS } = await import('../../src/sprites.js');
  const { SPECIES } = await import('../../src/sim.js');
  const tall = Object.keys(SPECIES).filter((f) => SPRITES[`${f}A`].length === 15);
  register(SPRITES, ANCHOR_ROWS);
  const { ACCESSORIES, placeWorn } = await import('../../src/accessories.js');
  const pal = { name: 'ice', main: '#05d9e8', accent: '#ff2a6d' };
  const wearables = ACCESSORIES.filter((a) => a.slot !== 'prop');
  assert.ok(wearables.length >= 30);
  const clips = (sprite, w, pose) => {
    const ox = Math.floor((40 - sprite[0].length) / 2);
    const oy = 20 - sprite.length;
    const placed = placeWorn([{ id: w.id }], sprite, { frame: pose === 'b' ? 1 : 0, time: 0, pal, minRow: -oy });
    return offScreen(placed.flatMap((p) => p.pts.map((q) => ({ x: ox + q.x, y: oy + q.y })))).length > 0;
  };
  const known = new Set(); // wearables that clip on a 1.0 form of 15 rows
  for (const f of tall) for (const w of wearables) if (clips(SPRITES[`${f}A`], w, 'a')) known.add(w.id);
  const bad = [];
  let cases = 0;
  let clipped = 0;
  for (const model of MODELS) {
    for (const f of Object.values(forms(model))) {
      for (const pose of ['a', 'b', 'sleep']) {
        const sprite = SPRITES[`${protoKey(model, f.id)}${pose === 'a' ? 'A' : pose === 'b' ? 'B' : 'Sleep'}`];
        for (const w of wearables) {
          cases++;
          if (!clips(sprite, w, pose)) continue;
          clipped++;
          if (sprite.length < 15 || !known.has(w.id)) bad.push(`${model}/${f.id}/${pose}/${w.id}`);
        }
      }
    }
  }
  console.log(`  ${cases} wearable cases, ${clipped} clip, all on 15 row sprites and all matching 1.0: ${[...known].join(', ') || 'none'}`);
  assert.deepEqual(bad, []);
});

// --- neglect ---------------------------------------------------------------------------------------------------------------
test('neglect: level 0 is untouched; the outline, eyes and the rows above the mouth never change; only body cells rust', () => {
  for (const model of MODELS) {
    for (const f of Object.values(forms(model))) {
      for (const pose of ['a', 'b']) {
        const sprite = f[pose];
        const anchors = f.anchors[pose];
        assert.equal(neglected(sprite, anchors, 0, 3), sprite);
        for (const level of [1, 2]) {
          const n = neglected(sprite, anchors, level, 3);
          assert.equal(n.length, sprite.length);
          sprite.forEach((row, y) => {
            assert.equal(n[y].length, row.length);
            [...row].forEach((ch, x) => {
              assert.equal(n[y][x] === '.', ch === '.', `${f.id}: outline changed at ${x},${y}`);
              if (n[y][x] !== ch) {
                assert.ok(ch === '#' && n[y][x] === 'x' && y > anchors.mouthRow, `${f.id}: changed ${ch} at ${x},${y}`);
              }
            });
          });
        }
      }
    }
  }
});

test('neglect grows and clears without jumping: level 2 contains level 1, patches are deterministic, and the count rises', () => {
  for (const model of MODELS) {
    for (const f of Object.values(forms(model))) {
      const [l0, l1, l2] = NEGLECT_LEVELS.map((l) => neglected(f.a, f.anchors.a, l, 5));
      assert.deepEqual(neglected(f.a, f.anchors.a, 1, 5), l1);
      const patches = (s) => s.join('').split('x').length - 1;
      assert.ok(patches(l0) <= patches(l1) && patches(l1) < patches(l2), `${f.id}: ${patches(l0)} ${patches(l1)} ${patches(l2)}`);
      l1.forEach((row, y) => [...row].forEach((ch, x) => ch === 'x' && assert.equal(l2[y][x], 'x', `${f.id}: level 1 patch missing at level 2`)));
      assert.ok(patches(l2) - patches(l0) >= 3, `${f.id}: neglect barely visible`);
    }
  }
});


// --- Iron's asleep and dead poses -------------------------------------------------------------------------------------------------
test('Iron poses: asleep shows a queue of dots on the chest, dead a read-only record, on every form in both models', () => {
  for (const model of MODELS) {
    for (const f of Object.values(forms(model))) {
      const a = f.anchors.a;
      const changed = (pose) => f[pose].flatMap((row, y) => [...row].map((c, x) => (c === 'o' && f.a[y][x] === '#' ? [x, y] : null)).filter(Boolean));
      const queue = changed('sleep').filter(([, y]) => y > a.mouthRow);
      const record = changed('dead').filter(([, y]) => y >= a.neckRow);
      assert.ok(queue.length >= 3 && new Set(queue.map(([, y]) => y)).size === 1, `${f.id}: queue ${queue.length} dots`);
      assert.ok(record.length >= 4 && new Set(record.map(([, y]) => y)).size === 1, `${f.id}: record ${record.length} cells`);
      // Marks only: the outline is the awake outline, and below the eyes only '#' cells become marks.
      assert.equal(poseDistance(f.a, f.sleep), 0);
      assert.equal(poseDistance(f.a, f.dead), 0);
    }
  }
});

test('Iron poses add only the chest mark to the generic pose: the eyes are the 1.0 slit and X', () => {
  for (const f of Object.values(forms('B'))) {
    const a = f.anchors.a;
    for (const kind of ['sleep', 'dead']) {
      const generic = pose(f.a, a.eyeRow, kind);
      assert.deepEqual(ironMarks(generic, a, kind), f[kind]);
      generic.forEach((row, y) => y <= a.mouthRow && assert.equal(f[kind][y], row, `${f.id}/${kind}: row ${y} above the chest changed`));
    }
    assert.notDeepEqual(f.sleep, pose(f.a, a.eyeRow, 'sleep'));
    assert.notDeepEqual(f.dead, pose(f.a, a.eyeRow, 'dead'));
  }
});

// --- what drives neglect: unmet needs (transient) ----------------------------------------------------------------------------
const OK = { charge: 70, sync: 70, integrity: 100, heat: 20 };
test('neglect level follows the care needs: 1.0 alert lines (Charge and Sync under 20, Heat over 80) and earlier soft lines', () => {
  assert.equal(LINES.charge.alert, 20);
  assert.equal(LINES.sync.alert, 20);
  assert.equal(LINES.heat.alert, 80);
  assert.equal(neglectLevel(OK), 0);
  assert.equal(neglectLevel({ ...OK, charge: 39 }), 1);
  assert.equal(neglectLevel({ ...OK, heat: 66 }), 1);
  assert.equal(neglectLevel({ ...OK, charge: 19 }), 2);
  assert.equal(neglectLevel({ ...OK, heat: 81 }), 2);
  assert.equal(neglectLevel({ ...OK, charge: 39, sync: 39 }), 2, 'two needs past soft is neglected');
  assert.equal(neglectLevel({ ...OK, integrity: 29 }), 2);
});

test('neglect is transient: it is a function of the stats now, so meeting the needs clears it', () => {
  for (const bad of [{ charge: 5 }, { sync: 5 }, { heat: 95 }, { integrity: 10 }, { charge: 30, sync: 30 }]) {
    assert.equal(neglectLevel({ ...OK, ...bad }) > 0, true);
    assert.equal(neglectLevel(OK), 0);
    assert.equal(guardedNeglect(OK, neglectLevel({ ...OK, ...bad })), 0, 'it clears once every need is clear of its line');
  }
});

test('the neglect guard: a stat hovering on a line does not flip the look', () => {
  for (const [need, { alert, soft }] of Object.entries(LINES)) {
    for (const line of [soft, alert]) {
      let level = neglectLevel({ ...OK, [need]: line + (LINES[need].dir === 'under' ? 5 : -5) });
      let flips = 0;
      for (let i = 0; i < 40; i++) {
        const wobble = (i % 2 ? 1 : -1) * (NEED_GUARD - 1);
        const next = guardedNeglect({ ...OK, [need]: line + wobble }, level);
        if (next !== level) flips++;
        level = next;
      }
      assert.ok(flips <= 1, `${need} at ${line}: flipped ${flips} times`);
    }
  }
  // Well past a line it still moves, both ways.
  assert.equal(guardedNeglect({ ...OK, charge: 10 }, 0), 2);
  assert.equal(guardedNeglect(OK, 2), 0);
});

// --- what bugs look like: glitches (persistent until cleared) ---------------------------------------------------------------
test('bugs: none is untouched, and each bug tears one body row a column, never an eye row, never losing a cell', () => {
  for (const f of Object.values(forms('B'))) {
    const anchors = f.anchors.a;
    assert.equal(glitched(f.a, anchors, 0, { reduced: true, seed: 2 }), f.a);
    const rows = tearRows(f.a, anchors);
    assert.ok(rows.length >= MAX_BUGS, `${f.id}: only ${rows.length} rows can tear`);
    for (let n = 1; n <= MAX_BUGS; n++) {
      const g = glitched(f.a, anchors, n, { reduced: true, seed: 2 });
      const torn = g.map((row, y) => (row !== f.a[y] ? y : -1)).filter((y) => y >= 0);
      assert.equal(torn.length, n, `${f.id}: ${n} bugs tore ${torn.length} rows`);
      for (const y of torn) {
        assert.ok(rows.includes(y) && y !== anchors.eyeRow && y !== anchors.eyeRow + 1);
        assert.equal([...g[y]].filter((c) => c !== '.').length, [...f.a[y]].filter((c) => c !== '.').length, `${f.id}: a cell was lost`);
        const left = g[y] === '.' + f.a[y].slice(0, -1);
        const right = g[y] === f.a[y].slice(1) + '.';
        assert.ok(left || right, `${f.id}: row ${y} moved more than a column`);
      }
    }
  }
});

test('bugs are persistent: the same for any time under reduced motion, a new bug adds a tear and clearing removes the last', () => {
  for (const f of Object.values(forms('B'))) {
    for (let n = 0; n <= MAX_BUGS; n++) {
      const still = glitched(f.a, f.anchors.a, n, { reduced: true, seed: 7 });
      for (const time of [0, 1234, 99_999]) assert.deepEqual(glitched(f.a, f.anchors.a, n, { time, reduced: true, seed: 7 }), still);
      if (n) {
        const fewer = glitched(f.a, f.anchors.a, n - 1, { reduced: true, seed: 7 });
        const added = still.map((row, y) => (row !== fewer[y] ? y : -1)).filter((y) => y >= 0);
        assert.equal(added.length, 1, `${f.id}: bug ${n} should add exactly one tear`);
      }
    }
  }
});

test('bugs keep the form recognisable: the outline stays close to the original at the ceiling', () => {
  for (const f of Object.values(forms('B'))) {
    const g = glitched(f.a, f.anchors.a, MAX_BUGS, { reduced: true, seed: 1 });
    const iou = silhouetteIou(f.a, g);
    assert.ok(iou >= 0.8, `${f.id}: overlap ${iou.toFixed(2)}`);
    assert.ok(iou < 1, `${f.id}: five bugs should show`);
  }
});

test('the twitch: in motion one extra row tears for 400 ms every 3 s; under reduced motion there is none; no change closer than 200 ms', () => {
  const f = forms('B').gronk;
  const a = f.anchors.a;
  const still = glitched(f.a, a, 2, { reduced: true, seed: 3 });
  let changes = 0;
  let last = null;
  let lastAt = 0;
  for (let t = 0; t < 60_000; t += 10) {
    const g = glitched(f.a, a, 2, { time: t, seed: 3 });
    const key = g.join('|');
    const extra = g.filter((row, y) => row !== still[y]).length;
    assert.equal(extra, t % TWITCH_EVERY_MS < TWITCH_MS ? 1 : 0, `t=${t}`);
    if (last !== null && key !== last) {
      changes++;
      assert.ok(t - lastAt >= 200 || changes === 1, `changed after ${t - lastAt} ms`);
      lastAt = t;
    }
    if (last === null || key !== last) lastAt = t;
    last = key;
  }
  assert.ok(changes >= 2 * (60_000 / TWITCH_EVERY_MS) - 2, `${changes} changes`);
  assert.deepEqual(glitched(f.a, a, 2, { time: 100, reduced: true, seed: 3 }), still);
});

test('neglect marks and bug glitches are separate channels and combine: rust then tears', () => {
  const f = forms('B').gronk;
  const rust = neglected(f.a, f.anchors.a, 2, 4);
  const both = glitched(rust, f.anchors.a, 3, { reduced: true, seed: 4 });
  const tearsOnly = glitched(f.a, f.anchors.a, 3, { reduced: true, seed: 4 });
  // Same rows torn whether or not it is rusty, and rust only ever changes marks.
  both.forEach((row, y) => assert.equal(row.replace(/x/g, '#'), tearsOnly[y].replace(/x/g, '#'), `row ${y}: rust must not change which cells are painted or where they tear`));
  assert.ok(both.join('').includes('x') && both.join('') !== tearsOnly.join(''));
  assert.equal(poseDistance(rust, f.a), 0, 'rust does not change the outline');
  assert.ok(poseDistance(tearsOnly, f.a) > 0, 'tears do');
});

// --- temper tell -----------------------------------------------------------------------------------------------------------
const LEVELS = [-2, -1, 0, 1, 2];
const sample = (egg, level, seed, reduced, ms = 120_000, step = 10) => {
  const out = [];
  for (let t = 0; t < ms; t += step) out.push({ t, ...temperTell({ egg, level, time: t, reduced, seed }) });
  return out;
};

test('levels follow the sketch thresholds (-6, -2, +3, +6)', () => {
  assert.deepEqual(THRESHOLDS, [-6, -2, 3, 6]);
  assert.deepEqual([-20, -6.01, -6, -2.01, -2, 0, 2.99, 3, 5.99, 6, 17].map(levelOf), [-2, -2, -1, -1, 0, 0, 0, 1, 1, 2, 2]);
});

test('the flicker guard: temper hovering on a threshold does not flip the level', () => {
  for (const t of THRESHOLDS) {
    for (const start of [levelOf(t - 1), levelOf(t + 1)]) {
      let level = start;
      let flips = 0;
      for (let i = 0; i < 40; i++) {
        const next = guardedLevel(t + (i % 2 ? GUARD * 0.8 : -GUARD * 0.8), level);
        if (next !== level) flips++;
        level = next;
      }
      assert.equal(flips, 0, `threshold ${t}: flipped ${flips} times`);
    }
  }
  // It still moves once temper is clearly past a threshold, in both directions, and across several levels at once.
  assert.equal(guardedLevel(3 + GUARD, 0), 1);
  assert.equal(guardedLevel(3 - GUARD - 0.01, 1), 0);
  assert.equal(guardedLevel(-20, 2), -2);
  assert.equal(guardedLevel(20, -2), 2);
  for (const temper of [-9, -4, 0, 4.5, 9]) assert.equal(guardedLevel(temper, levelOf(temper)), levelOf(temper));
});

test('the tell is a pure function of its inputs', () => {
  for (const egg of EGGS) for (const level of LEVELS) assert.deepEqual(temperTell({ egg, level, time: 12345, seed: 3 }), temperTell({ egg, level, time: 12345, seed: 3 }));
});

test('the middle level has no tell: the 1.0 rhythm, no offset, full brightness', () => {
  for (const egg of EGGS) {
    for (const s of sample(egg, 0, 0, false, 10_000, 50)) {
      assert.equal(s.frame, Math.floor(s.t / FRAME_MS) % 2);
      assert.deepEqual([s.blink, s.dx, s.dy, s.shade], [false, 0, 0, 1]);
    }
  }
});

test('the steady beat is exact: the same move at the same interval every time, whatever the seed, and countable', () => {
  const interval = { 1: 6000, 2: 3000 };
  for (const egg of EGGS) {
    for (const level of [1, 2]) {
      const marks = (s) => (egg === 'iron' ? s.dy === 1 : egg === 'program' ? s.blink : s.shade < 1);
      const a = sample(egg, level, 0, false, 60_000, 10);
      const b = sample(egg, level, 99, false, 60_000, 10);
      assert.deepEqual(a, b, `${egg}/${level}: the steady tell must not depend on the seed`);
      const starts = a.filter((s, i) => marks(s) && (i === 0 || !marks(a[i - 1]))).map((s) => s.t);
      assert.ok(starts.length >= 60_000 / interval[level] - 1, `${egg}/${level}: ${starts.length} beats`);
      // Wetware's dip starts from full brightness, so its first sample below 1 is one step after the beat.
      const lag = egg === 'wetware' ? 10 : 0;
      starts.forEach((t, i) => assert.equal(t, i * interval[level] + lag, `${egg}/${level}: beat ${i} at ${t}`));
    }
  }
});

test('strongly steady beats twice as often as steady', () => {
  const beats = (egg, level) => {
    const s = sample(egg, level, 0, false, 60_000, 10);
    const on = (x) => (egg === 'iron' ? x.dy === 1 : egg === 'program' ? x.blink : x.shade < 1);
    return s.filter((x, i) => on(x) && (i === 0 || !on(s[i - 1]))).length;
  };
  for (const egg of EGGS) assert.equal(beats(egg, 2), beats(egg, 1) * 2);
});

test('flash budget: the picture never changes faster than every 200 ms, so nothing flashes more than three times a second', () => {
  for (const egg of EGGS) {
    for (const level of LEVELS) {
      for (const seed of [0, 1, 2, 3]) {
        for (const reduced of [false, true]) {
          const s = sample(egg, level, seed, reduced);
          // The pose a viewer sees: frame A, frame B, or the closed-eye blink.
          const look = (x) => (x.blink ? 'blink' : x.frame);
          const changes = [];
          for (let i = 1; i < s.length; i++) if (look(s[i]) !== look(s[i - 1])) changes.push(s[i].t);
          for (let i = 1; i < changes.length; i++) assert.ok(changes[i] - changes[i - 1] >= SLOT_MS, `${egg} L${level} seed ${seed}: changed after ${changes[i] - changes[i - 1]} ms`);
          // A flash is a pair of changes: at most six changes in any second.
          for (let i = 0; i < changes.length; i++) {
            const inWindow = changes.filter((c) => c >= changes[i] && c < changes[i] + 1000).length;
            assert.ok(inWindow <= 6, `${egg} L${level} seed ${seed}: ${inWindow} changes in a second`);
          }
        }
      }
    }
  }
});

test('unsteady Iron drifts at most two columns off its grid and snaps back; strongly unsteady drifts more than unsteady', () => {
  const drift = (level, seed) => sample('iron', level, seed, false);
  for (const seed of [0, 1, 2]) {
    for (const level of [-1, -2]) {
      const s = drift(level, seed);
      assert.ok(s.every((x) => Math.abs(x.dx) <= 2 && x.dy === 0 && x.shade === 1 && !x.blink));
      for (let i = 1; i < s.length; i++) assert.ok(Math.abs(s[i].dx - s[i - 1].dx) <= 2);
    }
    const moved = (level) => drift(level, seed).filter((x) => x.dx !== 0).length;
    assert.ok(moved(-2) > moved(-1) && moved(-1) > 0, `seed ${seed}`);
  }
});

test('unsteady Program stutters (more when strong) and hops one row only when strong; unsteady Wetware only pulses, gently and slowly', () => {
  const stutters = (level) => {
    const s = sample('program', level, 0, false);
    return s.filter((x, i) => i && x.frame !== s[i - 1].frame).length;
  };
  assert.ok(stutters(-2) > stutters(-1) && stutters(-1) > stutters(0));
  assert.ok(sample('program', -1, 0, false).every((x) => x.dy === 0));
  assert.ok(sample('program', -2, 0, false).some((x) => x.dy === -1));
  for (const level of [-1, -2]) {
    const w = sample('wetware', level, 0, false, 60_000, 10);
    assert.ok(w.every((x) => x.dx === 0 && x.dy === 0 && x.shade >= 0.75 - 1e-9 && x.shade <= 1 + 1e-9));
    assert.ok(Math.max(...w.map((x) => x.shade)) - Math.min(...w.map((x) => x.shade)) > 0.1, 'it should visibly pulse');
    for (let i = 1; i < w.length; i++) assert.ok(Math.abs(w[i].shade - w[i - 1].shade) < 0.01, 'no brightness jump');
  }
});

test('reduced motion: the unsteady levels keep a still tell; the steady beat is kept', () => {
  for (const egg of EGGS) {
    for (const seed of [0, 1]) {
      for (const level of [-1, -2]) {
        const v = sample(egg, level, seed, true, 20_000, 50);
        assert.ok(v.every((x) => x.dy === 0 && !x.blink));
        if (egg === 'iron') assert.ok(v.every((x) => Math.abs(x.dx) === 1 && x.dx === v[0].dx));
        if (egg === 'program') assert.ok(v.every((x) => x.frame === 1));
        if (egg === 'wetware') assert.ok(v.every((x) => x.shade === 0.8));
      }
    }
    assert.deepEqual(sample(egg, 1, 0, true, 20_000, 50), sample(egg, 1, 0, false, 20_000, 50));
  }
});

test('the three eggs read differently at the same level', () => {
  for (const level of [-2, 2]) {
    const key = (egg) => JSON.stringify(sample(egg, level, 0, false, 8000, 100));
    assert.equal(new Set(EGGS.map(key)).size, 3, `level ${level}`);
  }
});

test('the anchor table covers every form, and the shared bodies', () => {
  for (const id of [...Object.keys(FORMS), 'adultBody', 'teenBody']) assert.ok(ANCHORS[id], id);
  assert.ok(spriteCells(forms('B').gronkElder.a).length > spriteCells(forms('B').gronk.a).length);
});
