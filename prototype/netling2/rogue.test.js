// Tests for the hidden Rogue egg's ten forms (first drafts; docs/NETLING_2_ROGUE_DRAFTS.md, section 8): the frame and wearable rules every
// egg obeys, Rogue's shared marks, the shadow layer and the glance tell. Run with `npm run proto:test`. Deterministic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './ready.js'; // first: registers the forms before src/sim.js can load src/accessories.js (see ready.js)
import { rogueForms, ROGUE_FORMS, ROGUE_ADULTS_ALL, ROGUE_ELDER_OF, roguePose, rogueTag, rogueGlance } from './rogue-models.js';
import { decoyMotion, splitMotion, REACH, PAD, STEPS, STEP_MS, offsetAt, sideAt, HOLD_UNTIL } from './rogue-motion.js';
import { ROGUE_NAMES, nameOf } from './form-ids.js';
import { rogueKey } from './register.js';
import { forms as ironForms } from './models.js';
import { programForms } from './program-models.js';
import { wetwareForms } from './wetware-models.js';
import { temperTell, GLANCE_MS, GLANCE_SIDE, BEAT_MS, SLOT_MS } from './tell.js';
import { SPRITES } from '../../src/sprites.js';
import { silhouetteIou, poseDistance, markDistance, offScreen } from '../../tools/lib/sprite-checks.mjs';
import { scaledOverlap } from './metrics.js';
import { FLASH_TOGGLE_MS } from '../../src/games/common.js';

const set = rogueForms();
const forms = Object.values(set);
const WIDTH = { baby: 12, teen: 14, adult: 16, elder: 18 };
const key = (f, pose) => `${rogueKey(f.id)}${pose === 'a' ? 'A' : pose === 'b' ? 'B' : pose === 'sleep' ? 'Sleep' : 'Dead'}`;
const others = [...Object.values(ironForms('B')), ...Object.values(programForms()), ...Object.values(wetwareForms())];

test('ten forms: a baby, one teen (no lean), one adult per role and its elder, with the decided names and lean-free ids', () => {
  assert.deepEqual(Object.keys(ROGUE_FORMS), ['rogueBaby', 'rogueTeen', 'rogueAdultBreach', 'rogueAdultDodge', 'rogueAdultTune', 'rogueAdultFeast', 'rogueElderBreach', 'rogueElderDodge', 'rogueElderTune', 'rogueElderFeast']);
  assert.deepEqual(ROGUE_ADULTS_ALL.map((id) => ROGUE_FORMS[id].role), ['breach', 'dodge', 'tune', 'feast']);
  for (const id of ROGUE_ADULTS_ALL) assert.equal(ROGUE_ELDER_OF(id), id.replace('Adult', 'Elder'));
  assert.deepEqual(forms.map((f) => f.name), ['Foundling', 'Alias', 'Mole', 'Skip', 'Spook', 'Drop', 'Sleeper', 'Exile', 'Handler', 'Stash']);
  assert.deepEqual(Object.keys(ROGUE_NAMES).sort(), Object.keys(ROGUE_FORMS).sort());
  for (const f of forms) assert.equal(nameOf(f.id), f.name);
});

test('every sprite is rectangular, the stage\'s width, 11 rows for the baby and teen and 13 to 15 for the rest, with known marks', () => {
  for (const f of forms) {
    for (const pose of ['a', 'b', 'sleep', 'dead']) {
      const rows = f[pose];
      assert.ok(f.stage === 'adult' || f.stage === 'elder' ? rows.length >= 13 && rows.length <= 15 : rows.length === 11, `${f.id}/${pose}: ${rows.length} rows`);
      assert.equal(rows.length, f.a.length, `${f.id}/${pose}: same height as A`);
      assert.equal(new Set(rows.map((r) => r.length)).size, 1, `${f.id}/${pose}: ragged`);
      assert.equal(rows[0].length, WIDTH[f.stage], `${f.id}/${pose}: width`);
      assert.match(rows.join(''), /^[.#o+x]+$/, `${f.id}/${pose}: marks`);
    }
  }
});

test('anchors point at the head, the eyes and the body, in order, the same in both frames, and the head row covers the eyes', () => {
  for (const f of forms) {
    const { headTop, eyeRow, mouthRow, neckRow } = f.anchors.a;
    assert.ok(headTop < eyeRow && eyeRow < mouthRow && mouthRow < neckRow && neckRow < f.a.length, f.id);
    assert.deepEqual(f.anchors.a, f.anchors.b);
    const painted = [...f.a[headTop]].map((c, x) => (c !== '.' ? x : -1)).filter((x) => x >= 0);
    const eyes = [...f.a[eyeRow]].map((c, x) => (c === 'o' ? x : -1)).filter((x) => x >= 0);
    assert.ok(painted[0] <= eyes[0] && painted.at(-1) >= eyes.at(-1), `${f.id}: the head row covers the eyes`);
  }
});

test('the frames: the head to the neck identical in A and B, the body\'s bottom row the same, at least 4 outline cells apart', () => {
  const bottom = (s) => s.findLastIndex((r) => [...r].filter((c) => c !== '.').length >= s[0].length * 0.4);
  for (const f of forms) {
    for (let y = 0; y <= f.anchors.a.neckRow; y++) assert.equal(f.b[y], f.a[y], `${f.id}: row ${y}`);
    assert.equal(bottom(f.a), bottom(f.b), `${f.id}: bottom row`);
    assert.ok(poseDistance(f.a, f.b) >= 4, `${f.id}: A and B nearly identical`);
  }
});

test('the shared marks: two 2x2 eyes with a body cell on each side (room for the glance), the shut third eye (an arc) above them, no mouth, a dim tag on the chest', () => {
  for (const f of forms) {
    const { eyeRow, neckRow } = f.anchors.a;
    for (const y of [eyeRow, eyeRow + 1]) {
      const runs = f.a[y].match(/o+/g);
      assert.deepEqual(runs, ['oo', 'oo'], `${f.id}: eyes on row ${y}`);
      for (const x of [...f.a[y]].map((c, i) => (c === 'o' ? i : -1)).filter((i) => i >= 0)) assert.ok(f.a[y][x - 1] !== '.' && f.a[y][x + 1] !== '.', `${f.id}: eye cell ${x},${y} on the outline`);
    }
    // The shut third eye is the arc (decided): two dim cells between the inner eyes on the row above them, and one dim cell over each end
    // on the row above that ('x..x' over '.xx.'), a closed eye's downward curve.
    const eyeCols = [...f.a[eyeRow]].map((c, x) => (c === 'o' ? x : -1)).filter((x) => x >= 0);
    const dim = (y) => [...f.a[y]].map((c, x) => (c === 'x' ? x : -1)).filter((x) => x >= 0);
    const low = dim(eyeRow - 1).filter((x) => x > eyeCols[1] && x < eyeCols[2]);
    assert.equal(low.length, 2, `${f.id}: the arc's lower pair between the eyes`);
    assert.deepEqual(dim(eyeRow - 2), [low[0] - 1, low[1] + 1], `${f.id}: the arc's ends above it`);
    for (const y of [eyeRow - 2, eyeRow - 1]) assert.equal(f.b[y], f.a[y]);
    assert.ok(!f.a.join('').includes('+') && !f.b.join('').includes('+'), `${f.id}: no mouth (no highlight cell awake)`);
    const tag = rogueTag(f.id);
    assert.ok(tag.length >= 1 && tag.every(([x, y]) => y >= neckRow && f.a[y][x] === 'x' && f.b[y][x] === 'x'), `${f.id}: the tag`);
  }
  const size = (id) => rogueTag(id).length;
  assert.ok(size('rogueBaby') < size('rogueTeen') && size('rogueTeen') <= Math.min(...ROGUE_ADULTS_ALL.map(size)), 'the tag grows with the stage');
  for (const id of ROGUE_ADULTS_ALL) assert.ok(size(ROGUE_ELDER_OF(id)) > size(id), `${id}: the elder's tag is larger`);
});

test('asleep: the 1.0 slit eyes and nothing else; dead: the X eyes and the tag lit; both keep the awake outline', () => {
  for (const f of forms) {
    const a = f.anchors.a;
    assert.equal(poseDistance(f.a, f.sleep), 0, `${f.id}: asleep outline`);
    assert.equal(poseDistance(f.a, f.dead), 0, `${f.id}: dead outline`);
    for (const kind of ['sleep', 'dead']) assert.deepEqual(roguePose(f.a, a, kind, f.id), f[kind]);
    const changed = (pose) => f[pose].flatMap((row, y) => [...row].map((c, x) => (c !== f.a[y][x] ? [x, y] : null)).filter(Boolean));
    assert.ok(changed('sleep').length && changed('sleep').every(([, y]) => y === a.eyeRow || y === a.eyeRow + 1), `${f.id}: asleep changes only the eyes`);
    for (const [x, y] of rogueTag(f.id)) assert.equal(f.dead[y][x], '+', `${f.id}: the tag lights when dead`);
    assert.ok(markDistance(f.a, f.dead) > 0);
  }
});

test('the forms are distinct: the baby from the teen, the four adults and the four elders pairwise, every adult from the baby and teen (1.0\'s 0.82)', () => {
  const iou = (x, y) => silhouetteIou(set[x].a, set[y].a);
  assert.ok(iou('rogueBaby', 'rogueTeen') < 0.82);
  const pairs = [];
  for (const group of [ROGUE_ADULTS_ALL, ROGUE_ADULTS_ALL.map(ROGUE_ELDER_OF)]) {
    for (let i = 0; i < group.length; i++) for (let j = i + 1; j < group.length; j++) pairs.push([`${group[i]}/${group[j]}`, iou(group[i], group[j])]);
  }
  pairs.sort((p, q) => q[1] - p[1]);
  console.log(`  closest Rogue pairs: ${pairs.slice(0, 3).map(([p, v]) => `${p} ${v.toFixed(2)}`).join(', ')}`);
  for (const [p, v] of pairs) assert.ok(v < 0.82, `${p} ${v.toFixed(2)}`);
  for (const id of ROGUE_ADULTS_ALL) for (const o of ['rogueBaby', 'rogueTeen']) assert.ok(iou(id, o) < 0.82, `${id}/${o}`);
});

test('the fallback check (drafts, 6.1 item 22): no Rogue form reads as another egg\'s form of its stage (1.0\'s 0.82 against all 66)', () => {
  const rows = forms.map((f) => {
    const best = others.filter((o) => o.stage === f.stage).map((o) => ({ id: o.id, v: silhouetteIou(f.a, o.a) })).sort((p, q) => q.v - p.v)[0];
    return { form: f.id, ...best };
  });
  console.log(`  closest other-egg form: ${rows.map((r) => `${nameOf(r.form)} ${r.v.toFixed(2)} (${r.id})`).join(', ')}`);
  for (const r of rows) assert.ok(r.v < 0.82, `${r.form} reads as ${r.id} ${r.v.toFixed(2)}`);
});

test('each elder is closest, after scaling, to its own adult among the four and at least 0.75; 18 columns, no taller than 15, never shorter than its adult, the adult\'s marks kept', () => {
  const rows = ROGUE_ADULTS_ALL.map((adult) => {
    const elder = set[ROGUE_ELDER_OF(adult)].a;
    const other = ROGUE_ADULTS_ALL.filter((x) => x !== adult).map((x) => ({ x, v: scaledOverlap(elder, set[x].a) })).sort((p, q) => q.v - p.v)[0];
    return { adult, own: scaledOverlap(elder, set[adult].a), other };
  });
  console.log('  Rogue elder against its adult (scaled), best other: ' + rows.map((r) => `${nameOf(r.adult)} ${r.own.toFixed(2)} vs ${nameOf(r.other.x)} ${r.other.v.toFixed(2)}`).join(', '));
  for (const r of rows) assert.ok(r.own > r.other.v && r.own >= 0.75, r.adult);
  for (const adult of ROGUE_ADULTS_ALL) {
    const elder = set[ROGUE_ELDER_OF(adult)];
    assert.ok(elder.a.length <= 15 && elder.a.length >= set[adult].a.length, elder.id);
    for (const ch of new Set(set[adult].a.join('').replace(/[.]/g, ''))) assert.ok(elder.a.join('').includes(ch), `${elder.id}: lost the ${ch} mark`);
  }
});

test('the wearable code sees every Rogue form\'s authored anchors and the real head width', async () => {
  const { anchorsFor } = await import('../../src/accessories.js');
  for (const f of forms) {
    for (const [pose, k] of [['a', 'A'], ['b', 'B'], ['sleep', 'Sleep']]) {
      const used = anchorsFor(SPRITES[`${rogueKey(f.id)}${k}`]);
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

test('no wearable moves between the A and B frames on any Rogue form, and every wearable stays on screen (but the 1.0 clip on a 15 row form)', async () => {
  const { ACCESSORIES, placeWorn } = await import('../../src/accessories.js');
  const { SPECIES } = await import('../../src/sim.js');
  const pal = { name: 'ice', main: '#05d9e8', accent: '#ff2a6d' };
  const box = (pts) => ({ x0: Math.min(...pts.map((p) => p.x)), x1: Math.max(...pts.map((p) => p.x)), y0: Math.min(...pts.map((p) => p.y)), y1: Math.max(...pts.map((p) => p.y)) });
  const wearables = ACCESSORIES.filter((x) => x.slot !== 'prop');
  const clips = (sprite, w, pose) => {
    const ox = Math.floor((40 - sprite[0].length) / 2);
    const oy = 20 - sprite.length;
    const placed = placeWorn([{ id: w.id }], sprite, { frame: pose === 'b' ? 1 : 0, time: 0, pal, minRow: -oy });
    return offScreen(placed.flatMap((p) => p.pts.map((q) => ({ x: ox + q.x, y: oy + q.y })))).length > 0;
  };
  const known = new Set();
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
  console.log(`  ${wearables.length} wearables on ${forms.length} Rogue forms: ${moved.length} move between frames, ${clipped.length} leave the screen`);
  assert.deepEqual(moved, []);
  assert.deepEqual(clipped, []);
});

// --- the shadow (rogue-motion.js) -----------------------------------------------------------------------------------------------------
test('the shadow is registered on all ten forms, sized by stage (one cell on the baby and teen, two on adults, three on elders), one further on the Feast line', () => {
  assert.deepEqual(REACH, { baby: 1, teen: 1, adult: 2, elder: 3 });
  for (const f of forms) {
    assert.equal(typeof f.motion, 'function', f.id);
    let widest = 0;
    for (let s = 0; s < STEPS; s++) {
      const m = f.motion(f.a, f.anchors.a, { time: s * STEP_MS });
      const pad = (m[0].length - f.a[0].length) / 2;
      // How far the copy reaches past the figure's own painted edge (a narrow form does not fill its width).
      const cols = m.flatMap((r) => [...r].map((c, x) => (c !== '.' ? x : -1)).filter((x) => x >= 0));
      const own = f.a.flatMap((r) => [...r].map((c, x) => (c !== '.' ? x + pad : -1)).filter((x) => x >= 0));
      widest = Math.max(widest, Math.min(...own) - Math.min(...cols), Math.max(...cols) - Math.max(...own));
    }
    assert.equal(widest, REACH[f.stage] + (f.role === 'feast' || f.from === 'rogueAdultFeast' ? 1 : 0), `${f.id}: the copy reaches ${widest} cells out`);
  }
});

test('each line carries its decided effect: Breach fades, Dodge shimmers as Cipher, Tune and the baby the plain decoy, Feast the bigger one (Stash with its maw, a half grin in the eye colour), Sleeper vanishing, Alias the sweep hint', async () => {
  const M = await import('./rogue-motion.js');
  const same = (f, m) => [0, 2, 5, 9, 14].every((s) => f.motion(f.a, f.anchors.a, { time: s * STEP_MS }).join() === m(f.a, f.anchors.a, { time: s * STEP_MS }).join());
  assert.ok(same(set.rogueBaby, M.decoyMotion('baby')));
  assert.ok(same(set.rogueTeen, M.sweepHintMotion('teen')));
  assert.ok(same(set.rogueAdultBreach, M.fadeMotion('adult')));
  assert.ok(same(set.rogueElderBreach, M.fadeMotion('elder', { vanish: true })), 'Sleeper vanishes');
  for (const id of ['rogueAdultDodge', 'rogueElderDodge']) assert.ok(same(set[id], M.scanMotion(set[id].stage)), id);
  for (const id of ['rogueAdultTune', 'rogueElderTune']) assert.ok(same(set[id], M.decoyMotion(set[id].stage)), id);
  assert.ok(same(set.rogueAdultFeast, M.bigDecoyMotion('adult')));
  assert.ok(same(set.rogueElderFeast, M.bigDecoyMotion('elder', { withMaw: true, eyes: true, late: true, low: true })), 'Stash: the half grin, low, with the eye, late');
  // The maw (decided): a half grin in the eye colour in the shadow (three cells on a row, the outer end curled up a row), a row below the
  // copy's mouth row so it stays clear of the shadow's eye, with the shadow's own eye showing; both only for the last two steps of the hold
  // (the late reveal), on either side; never on the body, never on Drop.
  const extra = (f, s) => f.motion(f.a, f.anchors.a, { time: s * STEP_MS }).join('').split('o').length - f.a.join('').split('o').length;
  const stash = set.rogueElderFeast;
  const { eyeRow, mouthRow } = stash.anchors.a;
  assert.ok([6, 7, 18, 19].every((s) => extra(stash, s) > 4), 'the grin and the eye at the end of the hold, either side');
  assert.ok([0, 1, 2, 3, 4, 5, 8, 9, 11, 12, 15, 16, 17].every((s) => extra(stash, s) === 0), 'nothing before the end of the hold or after');
  for (const s of [6, 18]) {
    const g = stash.motion(stash.a, stash.anchors.a, { time: s * STEP_MS });
    const pad = (g[0].length - stash.a[0].length) / 2;
    const added = g.flatMap((r, y) => [...r].map((c, x) => (c === 'o' && stash.a[y]?.[x - pad] !== 'o' ? [x, y] : null)).filter(Boolean));
    const eye = added.filter(([, y]) => y === eyeRow || y === eyeRow + 1);
    const cells = added.filter(([, y]) => y > eyeRow + 1);
    assert.ok(eye.length >= 2, `step ${s}: the shadow's eye`);
    const rows = [...new Set(cells.map(([, y]) => y))].sort((p, q) => p - q);
    assert.deepEqual(rows, [mouthRow, mouthRow + 1], `step ${s}: the grin a row below the mouth row (its corner on the mouth row)`);
    assert.ok(rows[0] > eyeRow + 1, `step ${s}: the grin shares no row with the shadow's eye`);
    assert.ok(cells.every(([x, y]) => eye.every(([ex, ey]) => Math.max(Math.abs(x - ex), Math.abs(y - ey)) > 1)), `step ${s}: and no grin cell touches the eye, diagonals included`);
    const [corner] = cells.filter(([, y]) => y === rows[0]).map(([x]) => x);
    const low = cells.filter(([, y]) => y === rows[1]).map(([x]) => x).sort((p, q) => p - q);
    assert.deepEqual(low, [low[0], low[0] + 1, low[0] + 2], `step ${s}: three in a row`);
    assert.equal(corner, s < STEPS ? low[2] + 1 : low[0] - 1, `step ${s}: the outer end curled up`);
    for (const [x, y] of added) assert.equal(stash.a[y]?.[x - pad] ?? '.', '.', 'never on the body');
  }
  assert.ok(Array.from({ length: 2 * STEPS }, (_, s) => stash.motion(stash.a, stash.anchors.a, { time: s * STEP_MS }).join('').includes('+')).every((x) => !x), 'no highlight cells (no fangs)');
  // The other styles and options stay selectable for the review page.
  const opt = (o) => M.bigDecoyMotion('elder', { withMaw: true, ...o });
  const count = (m, s) => m(stash.a, stash.anchors.a, { time: s * STEP_MS }).join('').split('o').length - stash.a.join('').split('o').length;
  assert.equal(count(opt({}), 5), 4, 'the half grin alone, all through the hold');
  assert.equal(count(opt({ mawStyle: 'grin' }), 5), 4);
  assert.equal(count(opt({ mawStyle: 'line' }), 5), 3);
  assert.equal(opt({ mawStyle: 'fangs' })(stash.a, stash.anchors.a, { time: 5 * STEP_MS }).join('').split('+').length - 1, 2);
  assert.ok(Array.from({ length: 2 * STEPS }, (_, s) => extra(set.rogueAdultFeast, s)).every((n) => n === 0), 'Drop has no maw');
  // The earlier drafts, the straight line and the fangs, stay available for the review page.
  const fangs = M.bigDecoyMotion('elder', { withMaw: true, mawStyle: 'fangs' });
  assert.equal(fangs(stash.a, stash.anchors.a, { time: 5 * STEP_MS }).join('').split('+').length - 1, 2);
  const line = M.bigDecoyMotion('elder', { withMaw: true, mawStyle: 'line' });
  assert.equal(line(stash.a, stash.anchors.a, { time: 5 * STEP_MS }).join('').split('o').length - stash.a.join('').split('o').length, 3);
});

test('the camo is drawn in the frames: a band on Foundling, two on Alias (swapping with the frame), still camo on Spook and Handler over head and body', () => {
  const camoRow = (r) => /(#x){2}|(x#){2}/.test(r);
  const n = (f) => f.anchors.a.neckRow;
  assert.ok(camoRow(set.rogueBaby.a[n(set.rogueBaby) + 1]) && set.rogueBaby.a[n(set.rogueBaby) + 1] !== set.rogueBaby.b[n(set.rogueBaby) + 1]);
  for (const y of [n(set.rogueTeen) + 1, n(set.rogueTeen) + 2]) assert.notEqual(set.rogueTeen.a[y], set.rogueTeen.b[y], `Alias row ${y} swaps`);
  for (const id of ['rogueAdultTune', 'rogueElderTune']) {
    const f = set[id];
    const e = f.anchors.a.eyeRow;
    assert.ok(f.a.slice(0, e - 2).join('').includes('x'), `${id}: camo on the head, above the arc`);
    assert.ok(f.a.slice(n(f) + 1).filter(camoRow).length >= 3, `${id}: camo on the body`);
    for (let y = 0; y < f.a.length; y++) if (y <= n(f)) assert.equal(f.a[y], f.b[y], `${id}: still, row ${y}`);
  }
  for (const id of ['rogueAdultBreach', 'rogueAdultDodge', 'rogueAdultFeast']) assert.ok(!set[id].a.slice(n(set[id]) + 1).some((r, i) => camoRow(r) && !rogueTag(id).some(([, y]) => y === i + n(set[id]) + 1)), `${id}: no camo`);
});

test('the shadow follows the echo rules: a pure function of time in 12 steps of 400 ms, the figure untouched, dim cells only where it is empty', () => {
  assert.equal(STEPS, 12);
  assert.equal(STEP_MS, FLASH_TOGGLE_MS * 2);
  for (const f of forms) {
    for (const make of [decoyMotion, splitMotion]) {
      const motion = make(f.stage);
      const at = (t, reduced = false) => motion(f.a, f.anchors.a, { time: t, reduced });
      assert.deepEqual(at(0), at(STEP_MS - 1), `${f.id}: one picture within a step`);
      assert.deepEqual(at(3 * STEP_MS), motion(f.a, f.anchors.a, { time: 3 * STEP_MS }), `${f.id}: pure`);
      for (let s = 0; s < 2 * STEPS; s++) {
        const m = at(s * STEP_MS);
        assert.equal(m.length, f.a.length);
        assert.ok(m.every((r) => r.length === f.a[0].length + 2 * PAD));
        const inner = m.map((r) => r.slice(PAD, PAD + f.a[0].length));
        inner.forEach((r, y) => [...r].forEach((c, x) => assert.ok(f.a[y][x] === '.' ? c === '.' || c === 'x' : c === f.a[y][x], `${f.id} step ${s}: cell ${x},${y}`)));
        assert.ok(m.every((r, y) => [...r].every((c, x) => x >= PAD && x < PAD + f.a[0].length ? true : c === '.' || c === 'x')), `${f.id}: only dim cells outside the figure`);
      }
      const still = [0, 2, 5, 9, 14].map((s) => at(s * STEP_MS, true).join('\n'));
      assert.equal(new Set(still).size, 1, `${f.id}: parked under reduced motion`);
    }
  }
});

test('the decoy steps out a cell at a time, holds, and is dropped at once; it alternates sides by loop; the split shows on both sides', () => {
  assert.deepEqual(Array.from({ length: STEPS }, (_, s) => offsetAt(s, 3)), [0, 1, 2, 3, 3, 3, 3, 3, 0, 0, 0, 0]);
  assert.deepEqual(Array.from({ length: STEPS }, (_, s) => offsetAt(s, 1)), [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0]);
  assert.equal(offsetAt(HOLD_UNTIL + 1, 3), 0, 'dropped, not reaped back');
  assert.equal(sideAt(0), 1);
  assert.equal(sideAt(STEPS * STEP_MS), -1);
  const f = set.rogueElderDodge;
  const own = f.a.flatMap((r) => [...r].map((c, x) => (c !== '.' ? x + PAD : -1)).filter((x) => x >= 0));
  const extra = (m, side) => m.map((r) => (side < 0 ? r.slice(0, Math.min(...own)) : r.slice(Math.max(...own) + 1))).join('').replace(/\./g, '').length;
  const decoy = decoyMotion('elder')(f.a, f.anchors.a, { time: 4 * STEP_MS });
  assert.ok(extra(decoy, 1) > 0 && extra(decoy, -1) === 0, 'the first loop puts it on the right');
  const next = decoyMotion('elder')(f.a, f.anchors.a, { time: (STEPS + 4) * STEP_MS });
  assert.ok(extra(next, -1) > 0 && extra(next, 1) === 0, 'the next loop on the left');
  const split = splitMotion('elder')(f.a, f.anchors.a, { time: 4 * STEP_MS });
  assert.ok(extra(split, 1) > 0 && extra(split, -1) > 0, 'the split on both sides');
});

// --- the glance (tell.js, Rogue's skin) -------------------------------------------------------------------------------------------------
const sample = (level, seed, reduced, ms = 60_000, step = 50) => Array.from({ length: ms / step }, (_, i) => ({ t: i * step, ...temperTell({ egg: 'rogue', level, time: i * step, reduced, seed }) }));

test('the glance moves only the eyes, a cell to either side, and keeps them inside the face on every form', () => {
  for (const f of forms) {
    for (const dir of [-1, 1]) {
      const g = rogueGlance(f.a, f.anchors.a, dir);
      assert.equal(poseDistance(f.a, g), 0, `${f.id}: outline`);
      const eyes = (rows) => rows.flatMap((r, y) => [...r].map((c, x) => (c === 'o' ? `${x + (rows === g ? 0 : dir)},${y}` : null)).filter(Boolean));
      assert.deepEqual(eyes(g).sort(), eyes(f.a).sort(), `${f.id}: every eye cell moved by ${dir}`);
      g.forEach((r, y) => [...r].forEach((c, x) => c !== f.a[y][x] && assert.ok(y === f.anchors.a.eyeRow || y === f.anchors.a.eyeRow + 1)));
    }
    assert.deepEqual(rogueGlance(f.a, f.anchors.a, 0), f.a);
  }
});

test('the other eggs\' tell results carry no glance; the middle level glances never', () => {
  for (const egg of ['iron', 'program', 'wetware']) assert.equal(temperTell({ egg, level: 1, time: 0 }).glance, undefined);
  assert.ok(sample(0, 3, false).every((s) => s.glance === 0 && s.dx === 0 && s.dy === 0 && !s.blink && s.shade === 1));
});

test('steady: an exact glance on the beat, always to the same side, one frame (500 ms) long, the same whatever the seed; strongly steady twice as often', () => {
  for (const level of [1, 2]) {
    const a = sample(level, 0, false, 60_000, 10);
    assert.deepEqual(a, sample(level, 77, false, 60_000, 10), 'no seed');
    const starts = a.filter((s, i) => s.glance && (i === 0 || !a[i - 1].glance)).map((s) => s.t);
    starts.forEach((t, i) => assert.equal(t, i * BEAT_MS[level]));
    assert.equal(starts.length, 60_000 / BEAT_MS[level]);
    assert.ok(a.every((s) => s.glance === 0 || s.glance === GLANCE_SIDE));
    assert.equal(a.filter((s) => s.glance).length * 10, starts.length * GLANCE_MS);
    assert.deepEqual(sample(level, 0, true, 20_000, 50), sample(level, 0, false, 20_000, 50), 'the beat stays under reduced motion');
  }
});

test('unsteady: glances at random times to either side, more at -2; reduced motion holds the eyes to one side; never a change under 200 ms', () => {
  const count = (level) => [0, 1, 2].reduce((n, seed) => n + sample(level, seed, false).filter((s, i, all) => s.glance && (i === 0 || !all[i - 1].glance)).length, 0);
  assert.ok(count(-2) > count(-1) && count(-1) > 0, `${count(-1)} and ${count(-2)} glances`);
  const sides = new Set(sample(-2, 0, false).map((s) => s.glance));
  assert.ok(sides.has(-1) && sides.has(1));
  for (const seed of [0, 1]) for (const level of [-1, -2]) {
    const v = sample(level, seed, true, 20_000, 50);
    assert.ok(v.every((s) => s.glance !== 0 && s.glance === v[0].glance && s.dx === 0 && s.dy === 0), 'held');
  }
  for (const level of [-2, -1, 1, 2]) for (const seed of [0, 1, 2]) {
    const s = sample(level, seed, false, 60_000, 10);
    const look = (x) => `${x.frame}${x.glance}`;
    const changes = s.filter((x, i) => i && look(x) !== look(s[i - 1])).map((x) => x.t);
    for (let i = 1; i < changes.length; i++) assert.ok(changes[i] - changes[i - 1] >= SLOT_MS, `L${level} seed ${seed}: ${changes[i] - changes[i - 1]} ms`);
    for (const c of changes) assert.ok(changes.filter((d) => d >= c && d < c + 1000).length <= 6, `L${level}: over six changes a second`);
  }
});

// --- the review options (rogue-options.js; nothing registered) ---------------------------------------------------------------------
test('options: the thermocamo touches body cells only (never the eyes, the tag or the outline); body only keeps the head identical in both frames', async () => {
  const { CAMO_OPTIONS } = await import('./rogue-options.js');
  // On the Dodge forms, which have no camo in their frames (the decided camo is drawn in Foundling's, Alias's and the Tune line's).
  for (const f of [set.rogueAdultDodge, set.rogueElderDodge]) {
    for (const [kind, o] of Object.entries(CAMO_OPTIONS)) {
      const { a, b } = o.make(f, rogueTag(f.id));
      for (const [rows, src] of [[a, f.a], [b, f.b]]) {
        assert.equal(poseDistance(rows, src), 0, `${f.id} ${kind}: outline`);
        rows.forEach((r, y) => [...r].forEach((c, x) => c !== src[y][x] && assert.ok(src[y][x] === '#' && c === 'x', `${f.id} ${kind}: ${x},${y}`)));
      }
      assert.ok(a.join('') !== f.a.join(''), `${f.id} ${kind}: some camo`);
      const neck = f.anchors.a.neckRow;
      if (kind !== 'whole') for (let y = 0; y <= neck; y++) assert.equal(a[y], b[y], `${f.id} ${kind}: head row ${y}`);
    }
  }
});

test('options, second round: the Cipher shimmer keeps the marks and the face rows, holes only plain body cells, loops on the echo steps and stands still calm', async () => {
  const { cipherScan, bandAt } = await import('./rogue-options.js');
  for (const f of [set.rogueAdultDodge, set.rogueElderDodge]) {
    const m = cipherScan(f.stage);
    const w = f.a[0].length;
    const { eyeRow } = f.anchors.a;
    for (let s = 0; s < STEPS; s++) {
      const g = m(f.a, f.anchors.a, { time: s * STEP_MS }).map((r) => r.slice(PAD, PAD + w));
      g.forEach((r, y) => [...r].forEach((c, x) => {
        const was = f.a[y][x];
        if (was === 'o' || was === 'x' || (y >= eyeRow - 2 && y <= eyeRow + 1)) assert.ok(c === was || (was === '.' && c === 'x'), `${f.id} step ${s}: mark or face cell ${x},${y}`);
        else if (was === '#') assert.ok(c === '#' || c === 'x' || c === '.', `${f.id}: ${x},${y}`);
      }));
      const band = bandAt(s, f.a.length);
      if (band < eyeRow - 2 || band > eyeRow + 1) assert.ok(g[band].includes('x'), `${f.id} step ${s}: the band`); // it passes behind the face
    }
    assert.deepEqual(m(f.a, f.anchors.a, { time: 0 }), m(f.a, f.anchors.a, { time: STEPS * STEP_MS * 2 }), 'it loops');
    const calm = new Set([0, 4, 9].map((s) => m(f.a, f.anchors.a, { time: s * STEP_MS, reduced: true }).join('\n')));
    assert.equal(calm.size, 1, 'calm: no band, the decoy parked');
  }
  assert.equal(bandAt(0, 15), 1);
  assert.equal(bandAt(STEPS / 2, 15), 14);
});

test('options, Exile\'s second pass (8.4h): the wipe keeps the marks and the face rows, holes only plain body cells, clears down then returns left to right, and takes turns with the shimmer (joined: no jump at the hand-overs)', async () => {
  const { EXILE_OPTIONS } = await import('./rogue-options.js');
  const { wipeMotion, scanWipeMotion, scanMotion, wipeAt } = await import('./rogue-motion.js');
  const f = { ...set.rogueElderDodge, a: EXILE_OPTIONS.cape.a };
  const m = wipeMotion('elder');
  const w = f.a[0].length;
  const { eyeRow } = f.anchors.a;
  const at = (s) => m(f.a, f.anchors.a, { time: s * STEP_MS }).map((r) => r.slice(PAD, PAD + w));
  const at6full = () => m(f.a, f.anchors.a, { time: 6 * STEP_MS });
  const holes = (g, y) => [...g[y]].filter((c, x) => f.a[y][x] === '#' && c === '.').length;
  const body = (y) => [...f.a[y]].includes('#') && (y < eyeRow - 2 || y > eyeRow + 1);
  for (let s = 0; s < STEPS; s++) {
    const g = at(s);
    g.forEach((r, y) => [...r].forEach((c, x) => {
      const was = f.a[y][x];
      if (was === 'o' || was === 'x' || (y >= eyeRow - 2 && y <= eyeRow + 1)) assert.ok(c === was || (was === '.' && c === 'x'), `step ${s}: mark or face cell ${x},${y}`);
      else if (was === '#') assert.ok(c === '#' || c === 'x' || c === '.', `step ${s}: ${x},${y}`);
    }));
  }
  for (let y = 0; y < f.a.length; y++) assert.equal(holes(at(0), y), 0, 'step 0: plain');
  for (let y = 0; y < f.a.length; y++) if (body(y) && [...f.a[y]].filter((c) => c === '#').length > 1) assert.ok(holes(at(6), y) > 0, `step 6: full camo, row ${y}`);
  const row = wipeAt(3, f.a.length, 0, 0).row;
  assert.ok(holes(at(3), row - 1) > 0 && holes(at(3), row + 1) === 0, 'down: camo above the row, plain below');
  const { col } = wipeAt(9, f.a.length, 5, 17);
  const g9 = at(9);
  assert.ok(g9.every((r, y) => ![...r].some((c, x) => x < col && f.a[y][x] === '#' && c === '.')), 'across: plain left of the column');
  assert.ok(g9.some((r, y) => [...r].some((c, x) => x > col && f.a[y][x] === '#' && c === '.')), 'across: camo right of it');
  assert.deepEqual(m(f.a, f.anchors.a, { time: 0 }), m(f.a, f.anchors.a, { time: STEPS * STEP_MS * 2 }), 'it loops');
  const calm = new Set([0, 4, 9].map((s) => m(f.a, f.anchors.a, { time: s * STEP_MS, reduced: true }).join('\n')));
  assert.equal(calm.size, 1, 'calm: still');
  const both = scanWipeMotion('elder');
  const loop = STEPS * STEP_MS;
  for (const s of [2, 6, 9]) {
    assert.deepEqual(both(f.a, f.anchors.a, { time: s * STEP_MS }), scanMotion('elder')(f.a, f.anchors.a, { time: s * STEP_MS }), 'first loop: the shimmer');
    assert.deepEqual(both(f.a, f.anchors.a, { time: loop + s * STEP_MS }), m(f.a, f.anchors.a, { time: loop + s * STEP_MS }), 'second loop: the wipe');
  }
  // Joined: the shimmer runs half a loop late, so it starts and ends plain as the wipe does and neither hand-over jumps.
  const joined = scanWipeMotion('elder', { joined: true });
  const cells = (t) => joined(f.a, f.anchors.a, { time: t }).map((r) => r.slice(PAD, PAD + w));
  const changed = (t) => { const p = cells(t - STEP_MS); const q = cells(t); return f.a.reduce((n, r, y) => n + [...r].filter((c, x) => c === '#' && p[y][x] !== q[y][x]).length, 0); };
  const inside = Math.max(...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((s) => changed(loop + s * STEP_MS)));
  for (const t of [loop, 2 * loop]) assert.ok(changed(t) <= inside, `joined: the hand-over at ${t} ms changes ${changed(t)} cells, the wipe's own steps up to ${inside}`);
  const unjoined = (t) => { const g = (u) => both(f.a, f.anchors.a, { time: u }).map((r) => r.slice(PAD, PAD + w)); const p = g(t - STEP_MS); const q = g(t); return f.a.reduce((n, r, y) => n + [...r].filter((c, x) => c === '#' && p[y][x] !== q[y][x]).length, 0); };
  assert.ok(unjoined(loop) > inside, 'without joining, the hand-over jumps (why joined exists)');
  // Up: the first sweep runs from the feet to the hood, the camo below the row; the hand-overs stay as smooth joined.
  const up = wipeMotion('elder', { up: true });
  const rowUp = wipeAt(3, f.a.length, 0, 0, { up: true }).row;
  const g3 = up(f.a, f.anchors.a, { time: 3 * STEP_MS }).map((r) => r.slice(PAD, PAD + w));
  assert.ok(rowUp < row && holes(g3, rowUp + 1) > 0 && holes(g3, rowUp - 1) === 0, 'up: camo below the row, plain above');
  assert.ok(wipeAt(1, f.a.length, 0, 0, { up: true }).row > wipeAt(5, f.a.length, 0, 0, { up: true }).row, 'up: it rises');
  assert.deepEqual(up(f.a, f.anchors.a, { time: 6 * STEP_MS }), at6full(), 'up: the same full camo at step 6');
  const joinedUp = scanWipeMotion('elder', { joined: true, up: true });
  const cellsUp = (t) => joinedUp(f.a, f.anchors.a, { time: t }).map((r) => r.slice(PAD, PAD + w));
  const changedUp = (t) => { const p = cellsUp(t - STEP_MS); const q = cellsUp(t); return f.a.reduce((n, r, y) => n + [...r].filter((c, x) => c === '#' && p[y][x] !== q[y][x]).length, 0); };
  for (const t of [loop, 2 * loop]) assert.ok(changedUp(t) <= inside, `joined, up: the hand-over at ${t} ms changes ${changedUp(t)} cells`);
  for (let s = 0; s < STEPS; s++) {
    const t = s * STEP_MS;
    const off = (g) => g.map((r) => [...r].map((c, x) => (x < PAD || x >= PAD + w ? c : '.')).join(''));
    assert.deepEqual(off(joined(f.a, f.anchors.a, { time: t })), off(both(f.a, f.anchors.a, { time: t })), `joined: the decoy keeps the real time, step ${s}`);
  }
});

test('options, Exile\'s wipe back on (8.4h): starts and ends in camo, plain at step 6, keeps the marks, and meets the shimmer in its own timing without a jump', async () => {
  const { EXILE_OPTIONS } = await import('./rogue-options.js');
  const { wipeBackMotion, scanWipeBackMotion, scanMotion } = await import('./rogue-motion.js');
  const f = { ...set.rogueElderDodge, a: EXILE_OPTIONS.cape.a };
  const w = f.a[0].length;
  const { eyeRow } = f.anchors.a;
  const loop = STEPS * STEP_MS;
  const strip = (g) => g.map((r) => r.slice(PAD, PAD + w));
  const holes = (g) => f.a.reduce((n, r, y) => n + [...r].filter((c, x) => c === '#' && g[y][x] === '.').length, 0);
  const changed = (p, q) => f.a.reduce((n, r, y) => n + [...r].filter((c, x) => c === '#' && p[y][x] !== q[y][x]).length, 0);
  for (const back of ['row', 'col']) {
    const m = wipeBackMotion('elder', { back });
    const at = (s) => strip(m(f.a, f.anchors.a, { time: s * STEP_MS }));
    for (let s = 0; s < STEPS; s++) at(s).forEach((r, y) => [...r].forEach((c, x) => {
      const was = f.a[y][x];
      if (was === 'o' || was === 'x' || (y >= eyeRow - 2 && y <= eyeRow + 1)) assert.ok(c === was || (was === '.' && c === 'x'), `${back} step ${s}: mark or face cell ${x},${y}`);
      else if (was === '#') assert.ok(c === '#' || c === 'x' || c === '.', `${back} step ${s}: ${x},${y}`);
    }));
    assert.equal(holes(at(6)), 0, `${back}: plain at step 6`);
    assert.ok(holes(at(0)) > 20 && holes(at(11)) > 20, `${back}: camo at both ends`);
    assert.ok(holes(at(3)) < holes(at(1)) && holes(at(9)) > holes(at(7)), `${back}: wiped off, then back on`);
    const both = scanWipeBackMotion('elder', { back });
    const g = (t) => strip(both(f.a, f.anchors.a, { time: t }));
    const inside = Math.max(...Array.from({ length: 11 }, (_, i) => changed(g(i * STEP_MS), g((i + 1) * STEP_MS))));
    for (const t of [loop, 2 * loop]) assert.ok(changed(g(t - STEP_MS), g(t)) <= inside, `${back}: the hand-over at ${t} ms`);
    assert.deepEqual(both(f.a, f.anchors.a, { time: 3 * STEP_MS }), scanMotion('elder')(f.a, f.anchors.a, { time: 3 * STEP_MS }), `${back}: the shimmer in its own timing`);
    const calm = new Set([0, 4, 9].map((s) => m(f.a, f.anchors.a, { time: s * STEP_MS, reduced: true }).join('\n')));
    assert.equal(calm.size, 1, `${back}: calm`);
  }
});

test('options, second round: the still camo is the same in both frames, so even head and body keeps the head rows identical', async () => {
  const { STATIC_CAMO_OPTIONS } = await import('./rogue-options.js');
  for (const f of [set.rogueAdultTune, set.rogueElderTune]) {
    for (const [kind, o] of Object.entries(STATIC_CAMO_OPTIONS)) {
      const { a, b } = o.make(f, rogueTag(f.id));
      for (let y = 0; y <= f.anchors.a.neckRow; y++) assert.equal(a[y], b[y], `${f.id} ${kind}: row ${y}`);
      for (const [rows, src] of [[a, f.a], [b, f.b]]) rows.forEach((r, y) => [...r].forEach((c, x) => c !== src[y][x] && assert.ok(src[y][x] === '#' && c === 'x')));
      const e = f.anchors.a.eyeRow;
      for (const y of [e - 2, e - 1, e, e + 1]) assert.equal(a[y], f.a[y], `${f.id} ${kind}: the face rows`);
    }
  }
});

test('options, third round: the fades, the bigger decoy and Alias\'s sweep change only plain body cells inside the figure, loop, and stand still calm', async () => {
  const { fadeEdges, fadePulse, bigDecoy, BIG_PAD, aliasSweep, aliasHint } = await import('./rogue-options.js');
  const cases = [
    [set.rogueAdultBreach, fadeEdges('adult'), PAD], [set.rogueElderBreach, fadeEdges('elder'), PAD],
    [set.rogueAdultBreach, fadePulse('adult'), PAD], [set.rogueElderBreach, fadePulse('elder'), PAD],
    [set.rogueAdultFeast, bigDecoy('adult'), BIG_PAD], [set.rogueElderFeast, bigDecoy('elder', true), BIG_PAD],
    [set.rogueTeen, aliasSweep('teen'), PAD],
  ];
  for (const [f, m, pad] of cases) {
    const w = f.a[0].length;
    let dimmed = 0;
    for (let s = 0; s < STEPS; s++) {
      const g = m(f.a, f.anchors.a, { time: s * STEP_MS });
      assert.ok(g.every((r) => r.length === w + 2 * pad));
      g.forEach((r, y) => [...r].forEach((c, x) => {
        const was = f.a[y][x - pad] ?? '.';
        if (was === '#') { assert.ok(c === '#' || c === 'x', `${f.id}: ${x},${y}`); if (c === 'x') dimmed++; }
        else if (was === '.') assert.ok(c === '.' || c === 'x' || c === '#', `${f.id}: outside ${x},${y}`);
        else assert.equal(c, was, `${f.id} step ${s}: a mark at ${x - pad},${y}`);
      }));
    }
    assert.deepEqual(m(f.a, f.anchors.a, { time: 0 }), m(f.a, f.anchors.a, { time: STEPS * STEP_MS * 2 }), `${f.id}: loops`);
    assert.equal(new Set([0, 4, 9].map((s) => m(f.a, f.anchors.a, { time: s * STEP_MS, reduced: true }).join('\n'))).size, 1, `${f.id}: calm`);
    if (m !== cases[4][1] && m !== cases[5][1]) assert.ok(dimmed > 0, `${f.id}: the effect shows`);
  }
  // The bigger decoy reaches one cell further than the stage's own.
  const reach = (f, m, pad) => {
    const own = f.a.flatMap((r) => [...r].map((c, x) => (c !== '.' ? x + pad : -1)).filter((x) => x >= 0));
    let far = 0;
    for (let s = 0; s < 2 * STEPS; s++) {
      const cols = m(f.a, f.anchors.a, { time: s * STEP_MS }).flatMap((r) => [...r].map((c, x) => (c !== '.' ? x : -1)).filter((x) => x >= 0));
      far = Math.max(far, Math.min(...own) - Math.min(...cols), Math.max(...cols) - Math.max(...own));
    }
    return far;
  };
  assert.equal(reach(set.rogueAdultFeast, bigDecoy('adult'), BIG_PAD), REACH.adult + 1);
  assert.equal(reach(set.rogueElderFeast, bigDecoy('elder'), BIG_PAD), REACH.elder + 1);
  // Alias's bigger hint (drawn into its frames since; checked there): on a form without camo it adds two rows under the neck.
  const plainF = set.rogueAdultBreach;
  const { a, b } = aliasHint(plainF, rogueTag(plainF.id));
  for (let y = 0; y <= plainF.anchors.a.neckRow; y++) assert.equal(a[y], b[y]);
  const n = plainF.anchors.a.neckRow;
  assert.ok([n + 1, n + 2].every((y) => a[y] !== plainF.a[y]));
});

test('Sleeper vanishes completely for three steps (nothing of it but its whole shadow), then returns; Mole only dims', async () => {
  const { VANISH } = await import('./rogue-motion.js');
  const f = set.rogueElderBreach;
  const pad = PAD;
  const painted = f.a.join('').replace(/\./g, '').length;
  for (let s = 0; s < STEPS; s++) {
    const g = f.motion(f.a, f.anchors.a, { time: s * STEP_MS });
    const inner = g.map((r) => r.slice(pad, pad + f.a[0].length)).join('');
    if (VANISH[s] === 'gone') {
      assert.ok(!/[#o+]/.test(g.join('')), `step ${s}: nothing of it left`);
      assert.equal(g.join('').split('x').length - 1, painted, `step ${s}: its whole shadow`);
    } else assert.ok(inner.includes('o'), `step ${s}: its eyes are there`);
  }
  assert.deepEqual(VANISH.filter((v) => v === 'gone').length, 3);
  const mole = set.rogueAdultBreach;
  for (let s = 0; s < STEPS; s++) assert.ok(mole.motion(mole.a, mole.anchors.a, { time: s * STEP_MS }).join('').includes('o'), 'Mole never vanishes');
  assert.equal(new Set([0, 5, 9].map((s) => f.motion(f.a, f.anchors.a, { time: s * STEP_MS, reduced: true }).join())).size, 1, 'calm: still');
  // Its wearables hide while it is gone (decided), and only then; no other form hides them.
  assert.deepEqual(Array.from({ length: STEPS }, (_, s) => f.hideWorn({ time: s * STEP_MS })), VANISH.map((v) => v === 'gone'));
  assert.equal(f.hideWorn({ time: 6 * STEP_MS, reduced: true }), false, 'calm: it does not vanish, so nothing hides');
  for (const g of forms) if (g !== f) assert.equal(g.hideWorn, undefined, g.id);
});
