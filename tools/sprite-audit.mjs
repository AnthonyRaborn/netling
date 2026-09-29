// Sprite audit: candidate problems in the art and in how it layers (docs/SPRITE_REVIEW_PLAN.md, step 2).
// It runs the real renderLCD under a fake canvas and reads back which pixels were drawn, so what it measures is what the
// game draws. It flags candidates only; a person decides whether each is a problem (see the plan's findings log).
//
//   node tools/sprite-audit.mjs                 all checks, readable summary
//   node tools/sprite-audit.mjs --check=clip,contrast
//   node tools/sprite-audit.mjs --json          everything, machine readable
//   node tools/sprite-audit.mjs --strict        exit 1 if any hard candidate (an off-screen pixel, an accessory nobody can see)
//
// Checks: clip, hud, contrast, occlusion, similar, forms, poses, props, crests, icons.
import { fakeCanvas } from '../tests/helpers/fake-canvas.js';
import {
  LCD, extents, hudHits, offScreen, lostPixels, blend, jaccard, silhouetteIou, poseDistance, markDistance,
  spriteCells, spriteColor, collectAccessory, sameColor,
} from './lib/sprite-checks.mjs';

const offscreen = [];
globalThis.document = { createElement: () => offscreen[offscreen.push(fakeCanvas(LCD.w, LCD.h)) - 1] };
const { renderLCD } = await import('../src/render.js');
const { createScript, SPECIES, PALETTES, IDLES } = await import('../src/sim.js');
const { SPRITES, ITEM_SPRITES, ITEM_COLORS, formSprite } = await import('../src/sprites.js');
const { ACCESSORIES, PROPS, anchorsFor, accessoryColors } = await import('../src/accessories.js');
const { COSMETICS } = await import('../src/cosmetics.js');

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const only = args.find((a) => a.startsWith('--check='))?.slice(8).split(',');
const wants = (name) => !only || only.includes(name);
const JSON_OUT = flag('json');

const FORMS = Object.keys(SPECIES);
const T0 = Date.UTC(2026, 8, 26, 12, 0);
const buffer = () => offscreen[0].ctx; // renderLCD's 40x28 working canvas

// --- reading pixels back from a real render --------------------------------------------------------------------------

function netling(form, { rest = false, lights = true, idle = 'bounce', palette = 0 } = {}) {
  const s = createScript({ now: T0, rng: () => 0.5 });
  Object.assign(s, { stage: SPECIES[form].stage, form, lightsOn: lights, asleep: rest });
  s.quirk.idle = idle;
  s.quirk.palette = palette;
  return s;
}

// Every 1x1 rect the render drew into the LCD buffer, in draw order, with the color and alpha in force.
function drawnPixels(s, time, opts = {}) {
  const calls = buffer().calls;
  calls.length = 0;
  renderLCD(fakeCanvas(400, 280), s, time, { calm: true, ...opts });
  const out = [];
  let color = '#000000';
  let alpha = 1;
  for (const [op, a] of calls) {
    if (op === '=fillStyle') color = a[0];
    else if (op === '=globalAlpha') alpha = a[0];
    else if (op === 'fillRect' && a[2] === 1 && a[3] === 1) out.push({ x: a[0], y: a[1], color, alpha });
  }
  return out;
}

const poseFor = (rest, time) => (rest ? 'sleep' : Math.floor(time / 500) % 2 ? 'b' : 'a');

// The pet's own pixels, and its sprite origin on the LCD. With no prop and no visitor the pet is drawn first.
function petAt(s, time) {
  const sprite = formSprite(s.form, poseFor(s.asleep, time));
  const cells = spriteCells(sprite);
  const px = drawnPixels(s, time);
  const pet = px.slice(0, cells.length);
  return { sprite, cells, pet, origin: { x: pet[0].x - cells[0].x, y: pet[0].y - cells[0].y }, all: px };
}

function withAccessory(s, time, id, extra = {}) {
  const { sprite, cells, pet } = petAt(s, time);
  const acc = accessoryById(id);
  const local = collectAccessory(acc, anchorsFor(sprite), { frame: Math.floor(time / 500) % 2, time, colors: accessoryColors(id, null) });
  const px = drawnPixels(s, time, { accessory: id, ...extra });
  return { sprite, pet, acc: px.slice(cells.length, cells.length + local.length), local };
}
const accessoryById = (id) => ACCESSORIES.find((a) => a.id === id);

// --- room colors -----------------------------------------------------------------------------------------------------

const TINTS = COSMETICS.tint.map((t) => ({ id: t.id, lcd: t.lcd, dark: t.dark }));
const DEFAULT_TINT = TINTS[0];
const DIM = '#1c3a3f'; // a resting pet in the dark, and every accessory it wears (render.js)

// --- the checks ------------------------------------------------------------------------------------------------------

const report = {};
const note = (name, value) => (report[name] = value);

// Where a form's sprite can be on screen, from the real idle motion: scan the clock and read the origin back.
function motionRange(form, idle) {
  const range = {};
  const step = 250;
  const end = idle === 'bounce' ? 200_000 : 60_000;
  for (let t = 0; t < end; t += step) {
    const s = netling(form, { idle });
    const { origin } = petAt(s, t);
    const frame = Math.floor(t / 500) % 2;
    const r = (range[frame] ??= { x0: 99, x1: -99, y0: 99, y1: -99, tx0: 0, tx1: 0, ty0: 0 });
    if (origin.x < r.x0) [r.x0, r.tx0] = [origin.x, t];
    if (origin.x > r.x1) [r.x1, r.tx1] = [origin.x, t];
    if (origin.y < r.y0) [r.y0, r.ty0] = [origin.y, t];
    r.y1 = Math.max(r.y1, origin.y);
  }
  return range;
}

if (wants('clip') || wants('hud') || wants('props')) {
  const clip = [];
  const hud = [];
  const ranges = {};
  for (const form of FORMS) {
    for (const idle of IDLES) {
      ranges[`${form}/${idle}`] = motionRange(form, idle);
      for (const [frame, r] of Object.entries(ranges[`${form}/${idle}`])) {
        const pose = frame === '1' ? 'b' : 'a';
        const anchors = anchorsFor(formSprite(form, pose));
        for (const acc of ACCESSORIES) {
          // The drone orbits, so sample the orbit; everything else is the same at any time.
          const times = acc.id === 'drone' ? [0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500].map((t) => t + Number(frame) * 500) : [Number(frame) * 500];
          for (const origin of [{ x: r.x0, y: r.y0, t: r.ty0 }, { x: r.x1, y: r.y0, t: r.ty0 }, { x: r.x0, y: r.y1, t: r.ty0 }]) {
            for (const t of times) {
              const pts = collectAccessory(acc, anchors, { frame: Number(frame), time: t, colors: accessoryColors(acc.id, null) }).map((p) => ({ x: p.x + origin.x, y: p.y + origin.y }));
              const off = offScreen(pts);
              if (off.length) clip.push({ acc: acc.id, form, idle, frame: Number(frame), rows: [...new Set(off.map((p) => p.y))].sort((a, b) => a - b), cols: [...new Set(off.map((p) => p.x))], pixels: off.length, atMs: origin.t });
              for (const box of hudHits(pts)) hud.push({ acc: acc.id, form, idle, box });
            }
          }
        }
      }
    }
  }
  const uniq = (rows, keyOf) => [...new Map(rows.map((r) => [keyOf(r), r])).values()];
  note('clip', uniq(clip, (r) => `${r.acc}/${r.form}/${r.idle}`).sort((a, b) => b.pixels - a.pixels));
  note('hud', uniq(hud, (r) => `${r.acc}/${r.form}/${r.box}`));
  note('ranges', ranges);
}

if (wants('contrast')) {
  // For each form, state and palette: how much of each accessory the eye can still pick out.
  const states = [
    { id: 'awake, lights on', rest: false, lights: true, time: 0, bg: (t) => t.lcd },
    { id: 'awake, lights off', rest: false, lights: false, time: 0, bg: (t) => t.dark },
    { id: 'asleep, lights on', rest: true, lights: true, time: 0, bg: (t) => t.lcd },
    { id: 'asleep, lights off', rest: true, lights: false, time: 0, bg: (t) => t.dark },
  ];
  const rows = [];
  for (const form of FORMS) {
    for (const st of states) {
      for (let palette = 0; palette < PALETTES.length; palette++) {
        // Ghost fades and pulses (alpha .55 +/- .25): also test it at its faintest.
        const times = form === 'ghost' ? [0, 4241] : [0];
        for (const time of times) {
          const s = netling(form, { rest: st.rest, lights: st.lights, palette });
          for (const acc of ACCESSORIES) {
            const { pet, acc: pts } = withAccessory(s, time, acc.id);
            for (const tint of TINTS) {
              const bg = st.bg(tint);
              const body = pet.map((p) => ({ x: p.x, y: p.y, color: blend(p.color, p.alpha, bg) }));
              const { ratio, lost } = lostPixels(pts, body, bg);
              rows.push({ acc: acc.id, form, state: st.id, palette: PALETTES[palette].name, tint: tint.id, ratio, lost: lost.length, total: pts.length, alpha: pts[0]?.alpha ?? 1, time });
            }
          }
        }
      }
    }
  }
  note('contrast', rows);
}

if (wants('occlusion')) {
  const rows = [];
  for (const form of FORMS) {
    const sprite = formSprite(form, 'a');
    const anchors = anchorsFor(sprite);
    const marks = new Map(spriteCells(sprite).map((c) => [`${c.x},${c.y}`, c.ch]));
    for (const acc of ACCESSORIES) {
      const raw = collectAccessory(acc, anchors, { frame: 0, time: 0, colors: accessoryColors(acc.id, null) });
      const pts = [...new Map(raw.map((p) => [`${p.x},${p.y}`, p])).values()]; // an accessory may paint a pixel twice
      const eyes = pts.filter((p) => marks.get(`${p.x},${p.y}`) === 'o').length;
      const mouth = pts.filter((p) => marks.get(`${p.x},${p.y}`) === '+').length;
      const eyeTotal = [...marks.values()].filter((c) => c === 'o').length;
      const mouthTotal = [...marks.values()].filter((c) => c === '+').length;
      if (eyes || mouth) rows.push({ acc: acc.id, form, eyes, eyeTotal, mouth, mouthTotal });
    }
  }
  note('occlusion', rows);
}

if (wants('similar')) {
  // Two wearables that put similar pixels in the same places on the same body are hard to tell apart.
  const rows = [];
  for (const form of ['bitling', 'chrome']) {
    const anchors = anchorsFor(formSprite(form, 'a'));
    const shapes = ACCESSORIES.map((a) => ({ id: a.id, pts: collectAccessory(a, anchors, { frame: 0, time: 0, colors: accessoryColors(a.id, null) }) }));
    for (let i = 0; i < shapes.length; i++) {
      for (let j = i + 1; j < shapes.length; j++) {
        const overlap = jaccard(shapes[i].pts, shapes[j].pts);
        if (overlap >= 0.25) {
          const colorSame = sameColor(shapes[i].pts[0].color, shapes[j].pts[0].color);
          rows.push({ a: shapes[i].id, b: shapes[j].id, form, overlap: Number(overlap.toFixed(2)), colorSame });
        }
      }
    }
  }
  note('similar', rows.sort((x, y) => y.overlap - x.overlap));
}

if (wants('forms') || wants('poses')) {
  const sil = [];
  for (let i = 0; i < FORMS.length; i++) {
    for (let j = i + 1; j < FORMS.length; j++) {
      const iou = silhouetteIou(formSprite(FORMS[i], 'a'), formSprite(FORMS[j], 'a'));
      sil.push({ a: FORMS[i], b: FORMS[j], sameStage: SPECIES[FORMS[i]].stage === SPECIES[FORMS[j]].stage, iou: Number(iou.toFixed(2)) });
    }
  }
  note('silhouettes', sil.sort((x, y) => y.iou - x.iou));
  const poses = FORMS.map((form) => {
    const a = formSprite(form, 'a');
    const hasSleep = Boolean(SPRITES[`${form}Sleep`]);
    const hasDead = Boolean(SPRITES[`${form}Dead`]);
    return {
      form,
      hasSleep,
      hasDead,
      abCells: poseDistance(a, formSprite(form, 'b')),
      sleepCells: hasSleep ? poseDistance(a, formSprite(form, 'sleep')) + markDistance(a, formSprite(form, 'sleep')) : 0,
      deadCells: hasDead ? poseDistance(a, formSprite(form, 'dead')) + markDistance(a, formSprite(form, 'dead')) : 0,
    };
  });
  note('poses', poses);
}

if (wants('props')) {
  // How much of each prop stays visible with the pet standing at the far right, and with a visitor beside it.
  const rows = [];
  const plush = { sprite: formSprite('bitling', 'a'), colors: { '#': '#05d9e8', o: '#ff2a6d', '+': '#f5f5f5' } };
  for (const prop of PROPS) {
    for (const form of FORMS) {
      const idles = report.ranges;
      let worst = 1;
      let where = '';
      for (const idle of IDLES) {
        const r = idles[`${form}/${idle}`];
        for (const frame of Object.values(r)) {
          const s = netling(form, { idle });
          const t = frame.tx1;
          const opts = { prop: prop.id, propExtra: prop.id === 'plush' ? plush : null };
          const without = drawnPixels(s, t).length;
          const withProp = drawnPixels(s, t, opts);
          const propPixels = withProp.length - without;
          const final = new Map();
          for (const p of withProp) final.set(`${p.x},${p.y}`, p);
          const shown = withProp.slice(0, propPixels).filter((p) => final.get(`${p.x},${p.y}`) === p).length;
          const ratio = propPixels ? shown / propPixels : 1;
          if (ratio < worst) [worst, where] = [ratio, `${idle} at ${t} ms`];
        }
      }
      // With a visitor the host moves to the right edge, where the prop is, and the visitor stands on the left.
      const v = netling(form);
      v.visit = { startedAge: 0, len: 8, form: 'chrome', palette: 2, accessory: null };
      const withProp = drawnPixels(v, 2000, { prop: prop.id, propExtra: prop.id === 'plush' ? plush : null });
      const noProp = drawnPixels(v, 2000);
      const n = withProp.length - noProp.length;
      const final = new Map();
      for (const p of withProp) final.set(`${p.x},${p.y}`, p);
      const visitorRatio = n ? withProp.slice(0, n).filter((p) => final.get(`${p.x},${p.y}`) === p).length / n : 1;
      rows.push({ prop: prop.id, form, worstVisible: Number(worst.toFixed(2)), where, visitorVisible: Number(visitorRatio.toFixed(2)) });
    }
  }
  note('props', rows);
}

if (wants('crests')) {
  const crests = (COSMETICS.crest ?? []).filter((c) => c.pixels);
  const cells = (c) => spriteCells(c.pixels);
  const sym = (c) => c.pixels.every((row) => row === [...row].reverse().join(''));
  const pairs = [];
  for (let i = 0; i < crests.length; i++) {
    for (let j = i + 1; j < crests.length; j++) pairs.push({ a: crests[i].id, b: crests[j].id, overlap: Number(jaccard(cells(crests[i]), cells(crests[j])).toFixed(2)) });
  }
  note('crests', { crests: crests.map((c) => ({ id: c.id, lit: cells(c).length, mirrored: sym(c) })), pairs: pairs.sort((x, y) => y.overlap - x.overlap) });
}

if (wants('icons')) {
  // Cell-for-cell match of two 7x7 icons (same mark in the same cell, empty counts), 0 to 1.
  const same = (a, b) => {
    let n = 0;
    for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) if (ITEM_SPRITES[a][y][x] === ITEM_SPRITES[b][y][x]) n++;
    return n / 49;
  };
  const ids = Object.keys(ITEM_SPRITES);
  const rows = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const match = same(ids[i], ids[j]);
      const colorSame = sameColor(ITEM_COLORS[ids[i]], ITEM_COLORS[ids[j]]);
      if (match >= 0.7 || (colorSame && match >= 0.55)) rows.push({ a: ids[i], b: ids[j], match: Number(match.toFixed(2)), colorSame });
    }
  }
  note('icons', rows.sort((x, y) => y.match - x.match));
}

// --- output ----------------------------------------------------------------------------------------------------------

const summary = {};
if (report.clip) summary.clip = report.clip;
if (report.contrast) {
  const by = (pred) => {
    const rows = report.contrast.filter(pred);
    const table = {};
    for (const r of rows) {
      const t = (table[r.acc] ??= { forms: new Set(), total: new Set(), invisible: new Set() });
      t.total.add(`${r.form}/${r.palette}`);
      if (r.ratio >= 0.5) t.forms.add(`${r.form}/${r.palette}`);
      if (r.ratio >= 1) t.invisible.add(`${r.form}/${r.palette}`);
    }
    return table;
  };
  summary.contrastLit = by((r) => r.state === 'awake, lights on' && r.tint === DEFAULT_TINT.id);
  summary.contrastDark = by((r) => r.state === 'asleep, lights off' && r.tint === DEFAULT_TINT.id);
}

if (JSON_OUT) {
  process.stdout.write(`${JSON.stringify(report, null, 1)}\n`);
} else {
  const line = (s = '') => console.log(s);
  const head = (s) => {
    line();
    line(`== ${s}`);
  };
  if (report.clip) {
    head(`clip: accessory pixels that leave the screen at some point of the idle motion (${report.clip.length} accessory/form/idle cases)`);
    const byAcc = {};
    for (const r of report.clip) (byAcc[r.acc] ??= new Set()).add(r.form);
    for (const [acc, forms] of Object.entries(byAcc)) {
      const worst = report.clip.filter((r) => r.acc === acc).sort((a, b) => a.rows[0] - b.rows[0])[0];
      line(`  ${acc.padEnd(11)} ${[...forms].join(', ')}   (worst: ${worst.form}/${worst.idle}, top row ${worst.rows[0]}, ${worst.pixels} px)`);
    }
  }
  if (report.hud) {
    head('hud: forms whose accessory can land on an icon slot at some point of the idle motion (the icon is drawn over it while that icon shows)');
    const byKey = {};
    for (const r of report.hud) (byKey[r.box] ??= {})[r.acc] = (byKey[r.box][r.acc] ?? 0) + 1;
    for (const [box, accs] of Object.entries(byKey)) {
      line(`  ${box}: ${Object.entries(accs).map(([a, n]) => `${a} ${n}/${FORMS.length}`).join(', ')}`);
    }
  }
  if (summary.contrastLit) {
    const total = FORMS.length * PALETTES.length;
    head(`contrast (awake, lights on, default tint): form/palette combinations, of ${total}, where at least half of an accessory's pixels blend in / all of them do`);
    for (const [acc, t] of Object.entries(summary.contrastLit)) if (t.forms.size) line(`  ${acc.padEnd(11)} half or more lost: ${String(t.forms.size).padStart(2)}   all lost: ${String(t.invisible.size).padStart(2)}`);
    head(`contrast (asleep, lights off): the dimmed pet paints every accessory ${DIM}`);
    for (const [acc, t] of Object.entries(summary.contrastDark)) line(`  ${acc.padEnd(11)} half or more lost: ${String(t.forms.size).padStart(2)} of ${t.total.size}   all lost: ${String(t.invisible.size).padStart(2)}`);
    const palettes = {};
    for (const r of report.contrast.filter((x) => x.state === 'awake, lights on' && x.tint === DEFAULT_TINT.id && x.ratio >= 0.5)) (palettes[r.palette] ??= new Set()).add(r.acc);
    head('contrast by palette (accessories with a form that loses half or more, awake and lit)');
    for (const [p, set] of Object.entries(palettes)) line(`  ${p.padEnd(7)} ${set.size}: ${[...set].join(', ')}`);
    const ghost = report.contrast.filter((r) => r.form === 'ghost' && r.time === 4241 && r.state === 'awake, lights on' && r.tint === DEFAULT_TINT.id);
    const ghostBase = report.contrast.filter((r) => r.form === 'ghost' && r.time === 0 && r.state === 'awake, lights on' && r.tint === DEFAULT_TINT.id);
    const worse = ghost.filter((r, i) => r.ratio > ghostBase[i].ratio + 0.001).length;
    line(`  ghost at its faintest (alpha ${ghost[0]?.alpha.toFixed(2)}): ${worse} accessory/palette cases lose more of the accessory than at rest`);
    const seen = new Map();
    for (const r of report.contrast.filter((x) => x.state === 'awake, lights on' && x.time === 0)) {
      const k = `${r.acc}/${r.form}/${r.palette}`;
      const e = seen.get(k) ?? { lo: 1, hi: 0, worst: '' };
      if (r.ratio > e.hi) [e.hi, e.worst] = [r.ratio, r.tint];
      e.lo = Math.min(e.lo, r.ratio);
      seen.set(k, e);
    }
    const flips = [...seen].filter(([, e]) => e.hi >= 0.5 && e.lo < 0.5);
    head(`contrast by tint: accessory/form/palette cases that lose half or more on some screen tint and not on others (${flips.length}; awake, lit)`);
    for (const [k, e] of flips.slice(0, 15)) line(`  ${k}: worst on ${e.worst} (${e.hi.toFixed(2)}), best ${e.lo.toFixed(2)}`);
  }
  if (report.occlusion) {
    head('occlusion: accessories that paint over the eye (o) or mouth (+) pixels of the awake sprite (expected for eyewear and mouthwear)');
    const byAcc = {};
    for (const r of report.occlusion) (byAcc[r.acc] ??= []).push(r);
    for (const [acc, rows] of Object.entries(byAcc)) {
      line(`  ${acc.padEnd(11)} ${rows.map((r) => `${r.form}${r.eyes ? ` eyes ${r.eyes}/${r.eyeTotal}` : ''}${r.mouth ? ` mouth ${r.mouth}/${r.mouthTotal}` : ''}`).join('; ')}`);
    }
  }
  if (report.similar) {
    head('similar: pairs of accessories whose pixels overlap (0 to 1) on the same body');
    for (const r of report.similar.slice(0, 14)) line(`  ${r.a} + ${r.b} on ${r.form}: ${r.overlap}${r.colorSame ? ' (same color too)' : ''}`);
  }
  if (report.silhouettes) {
    head('forms: silhouette overlap (IoU, centred), highest first; same-stage pairs are the ones that must differ most');
    for (const r of report.silhouettes.slice(0, 12)) line(`  ${r.a} / ${r.b}: ${r.iou}${r.sameStage ? '  (same stage)' : ''}`);
    head('poses: cells that differ from the A frame (a form with no Sleep or Dead sprite reuses A, recolored)');
    for (const r of report.poses) line(`  ${r.form.padEnd(9)} A/B ${String(r.abCells).padStart(2)}   sleep ${r.hasSleep ? String(r.sleepCells).padStart(2) : 'falls back to A'}   dead ${r.hasDead ? String(r.deadCells).padStart(2) : 'falls back to A'}`);
  }
  if (report.props) {
    head('props: share of the prop still visible (by last pixel drawn, ignoring the Ghost\'s transparency) with the pet at its far right, and with the host moved right for a visitor (1 = all, lower = hidden)');
    for (const prop of PROPS) {
      const rows = report.props.filter((r) => r.prop === prop.id);
      line(`  ${prop.id.padEnd(10)} pet at far right: ${rows.map((r) => `${r.form} ${r.worstVisible}`).join(', ')}`);
      line(`  ${''.padEnd(10)} host with a visitor: ${rows.map((r) => `${r.form} ${r.visitorVisible}`).join(', ')}`);
    }
  }
  if (report.crests) {
    head('crests: lit pixels, and overlap between each pair (0 to 1)');
    for (const c of report.crests.crests) line(`  ${c.id.padEnd(7)} ${c.lit} lit${c.mirrored ? ', mirror-symmetric' : ''}`);
    for (const p of report.crests.pairs) line(`  ${p.a} / ${p.b}: ${p.overlap}`);
  }
  if (report.icons) {
    head('icons: item icons that match cell for cell (0 to 1), or that share a color and match closely');
    for (const r of report.icons) line(`  ${r.a} / ${r.b}: ${r.match}${r.colorSame ? ' (same color)' : ''}`);
    if (!report.icons.length) line('  none');
  }
  line();
  line('Candidates only. Confirm each by eye in gallery.html before logging it. Not checked here: netrun node markers, mini-game art,');
  line('the compile screen and CSS effects (see the plan).');
}

if (flag('strict')) {
  const hard = (report.clip?.length ?? 0) + Object.values(summary.contrastLit ?? {}).filter((t) => t.invisible.size).length;
  if (hard) process.exitCode = 1;
}
