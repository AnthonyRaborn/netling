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
test('the shadow is registered on all ten forms, sized by stage: one cell out on the baby and teen, two on the adults, three on the elders', () => {
  assert.deepEqual(REACH, { baby: 1, teen: 1, adult: 2, elder: 3 });
  for (const f of forms) {
    assert.equal(typeof f.motion, 'function', f.id);
    let widest = 0;
    for (let s = 0; s < STEPS; s++) {
      const m = f.motion(f.a, f.anchors.a, { time: s * STEP_MS });
      // How far the copy reaches past the figure's own painted edge (a narrow form does not fill its width).
      const cols = m.flatMap((r) => [...r].map((c, x) => (c !== '.' ? x : -1)).filter((x) => x >= 0));
      const own = f.a.flatMap((r) => [...r].map((c, x) => (c !== '.' ? x + PAD : -1)).filter((x) => x >= 0));
      const left = Math.min(...own) - Math.min(...cols);
      const right = Math.max(...cols) - Math.max(...own);
      widest = Math.max(widest, left, right);
    }
    assert.equal(widest, REACH[f.stage], `${f.id}: the copy reaches ${widest} cells out`);
  }
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
  for (const f of [set.rogueBaby, set.rogueTeen, set.rogueAdultDodge, set.rogueElderDodge, set.rogueAdultTune, set.rogueElderTune]) {
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
  // Alias's bigger hint: two camo rows under the neck, the head identical in both frames.
  const { a, b } = aliasHint(set.rogueTeen, rogueTag('rogueTeen'));
  for (let y = 0; y <= set.rogueTeen.anchors.a.neckRow; y++) assert.equal(a[y], b[y]);
  const n = set.rogueTeen.anchors.a.neckRow;
  assert.ok([n + 1, n + 2].every((y) => a[y] !== set.rogueTeen.a[y]));
});
