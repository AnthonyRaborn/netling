// The 2.0 renderer pass (docs/NETLING_2_ROGUE_DRAFTS.md 11.1, "The renderer", accepted; docs/NETLING_2_SPRITES.md, Next phase item 2):
// one pass that draws every egg's layers on the LCD (1.0's 40x28 plus TOP rows), in the order the plan fixes. Not 1.0's src/render.js (under the freeze), and
// not a game: it draws a pet from a plain description of what it looks like now, so the future 2.0 app, the review page and the tests
// all draw the same picture.
//
// composeLCD(pet, time, opts) is pure: it returns the scene as a list of draw operations (no DOM, no canvas), so tests can check it.
// paintLCD(ctx, scene) runs those on any 2D context of LCD_W x LCD_H cells; drawLCD(ctx, pet, time, opts) does both.
//
// Order (the accepted plan):
//   0. the room: the LCD background, darker with the lights off.
//   1. the frame: A or B on 1.0's 500 ms rhythm, or asleep, or dead (the capture pose when the cause is `captured`, after the burn).
//   2. the tell: temperTell (tell.js) picks the frame, Program's blink, Iron's settle and drift, Wetware's shade; Rogue's glance moves
//      the eyes (rogueGlance), on the awake frames only.
//   3. neglect (neglect.js), the seams (seams.js: Iron's wear, Program's and Wetware's strain; a draft, see there) and bugs (glitch.js).
//   4. the motion layer (form.motion), awake only, paused during a visit. It returns padded rows, drawn at the figure's x minus the pad,
//      so the figure does not move; the figure's position and wander use the unpadded width.
//   5. wearables (1.0's drawWorn), placed on the registered, unglanced, unpadded frame; skipped while form.hideWorn({ time, reduced }) is
//      true (Sleeper), and when dead (as 1.0).
//   6. state marks (marks.js), awake only, as 1.0 draws its heat wisps.
//   7. the prop: the Metronome (metronome.js, its art a draft) or any 1.0 prop, at the right of the floor.
//   8. the screen: the Z while resting, the flatline when dead (as 1.0).
//
// Clocks: `time` is the renderer's clock (as 1.0's frame rhythm), not the game clock; `opts.reduced` is the reduced-motion setting.
//
// The idle hold (decided, docs/NETLING_2_SPRITES.md Next phase item 1): 1.0's idle masks a positional tell, so the idle's clock pauses
// around it (tell.js idleClock): a steady Iron's settle, and since 2026-10-12 an unsteady Iron's drift steps and a strongly unsteady
// Program's hops. opts.idleHold picks the clock: 'held' (the decided rule), 'steady' (the earlier rule, a steady Iron only) or 'none'
// (the plain 1.0 idle), the last two for comparison on the review page.
//
// The self-destruct (Rogue drafts 11.1, decided): when a netling with a capture pose dies with cause `captured`, and opts.burnStart is
// set (the UI sets it when it sees a fresh capture, as the evolution strobe is set), the screen plays burnFrame for BURN_MS in the
// palette colours with no wearables, the burn picked by pickBurn(diedAt); then the capture pose in the dead colours. No save field: a
// capture caught up on load passes no burnStart and shows the pose only.
//
// Not drawn here (the app's job, as in 1.0's renderLCD): the visitor itself (a visit only moves this netling, as visit.js), the HUD icons
// (cache, virus, events, the attention mark), action reactions, the flow glow, the evolution strobe, the heat wash and the glitch shake.
import './ready.js'; // first: the wearable code must see the authored anchors (see ready.js)
import { SPRITES, drawSprite, paletteColors, DEAD_COLORS, DIM_COLORS } from '../../src/sprites.js';
import { drawWorn, drawProp, placeWorn, accessoryById, PROPS, PROP_FLOOR as PROP_FLOOR_1 } from '../../src/accessories.js';
import { PALETTES } from '../../src/sim.js';
import { temperTell, tellPose, idleClock, driftWithin } from './tell.js';
import { idleOffset } from './idle.js';
import { visitLayers, visitMotion } from './visit.js';
import { neglected } from './neglect.js';
import { glitched } from './glitch.js';
import { placeSeams, seamCells, seams } from './seams.js';
import { stateMarks, MARK_COLORS } from './marks.js';
import { metronome } from './metronome.js';
import { metronomeFrame, METRONOME_SIZE } from './metronome-art.js';
import { rogueGlance, rogueTag } from './rogue-models.js';
import { burnFrame, pickBurn, BURN_STEPS, BURN_STEP_MS } from './rogue-burn.js';

// The screen is 1.0's 40x28 with TOP rows added above (maintainer, 2026-10-12): 1.0's idle reserves 5 rows over a pet, which the
// holologo (6 rows up) and, on 2.0's 15 row forms, the halo, cursor, extra life and glitch moth overran by a row, and the holologo by 2
// on Program's strong hop. Everything 1.0 lays out keeps its place relative to the floor, TOP rows lower; only the headroom grows.
export const TOP = 2;
export const LCD_W = 40;
export const LCD_H = 28 + TOP;
export const LCD_BG = '#0b2226'; // 1.0's defaults (src/render.js); the wardrobe's tint passes its own in opts.tint
export const LCD_BG_DARK = '#03090a';
export const BURN_MS = BURN_STEPS * BURN_STEP_MS;
export const FLOOR = 20 + TOP; // an awake netling stands with its last row on the row above, as on 1.0's row 19; resting and dead one lower
// The Metronome's colours: the review render's (a brown case, a dark dial window, a light rod, a yellow weight). A draft, not decided.
export const METRONOME_COLORS = { '#': '#8a5a2b', x: '#2a1a10', '+': '#d8d8d8', o: '#f9f002' };
const Z_DIM = '#2f6b73';
const PROP_FLOOR = 21 + TOP; // src/accessories.js: props stand on its row 21 at the right edge (paintLCD shifts 1.0's props by TOP)

export const IDLE_HOLDS = {
  held: idleClock,
  steady: ({ egg, level, time }) => (level > 0 ? idleClock({ egg, level, time }) : time),
  none: ({ time }) => time,
};

const frameOf = (time) => Math.floor(time / 500) % 2;

// -> { bg, ops, box } where ops are { op: 'rows' | 'worn' | 'prop' | 'rect', ... } in drawing order, and box is the figure's registered
// frame on screen ({ x, y, w, h }, null when nothing stands there), for the app's overlays (reactions, the attention mark).
//
// pet: {
//   form,                 a prototype form (models.js forms('B'), programForms(), wetwareForms(), rogueForms())
//   egg,                  'iron' | 'program' | 'wetware' | 'rogue': the tell's skin
//   palette = 0,          an index into 1.0's PALETTES
//   pose = 'awake',       'awake' | 'sleep' (asleep or napping) | 'dead'
//   lightsOn = true,
//   level = 0,            the temper tell's level, -2 to 2 (tell.js guardedLevel)
//   seed = 0,             the netling's own seed for the tell, neglect and bugs
//   idle = 'walk',        1.0's idle quirk ('sway', 'hover', 'walk') or 'none'
//   neglect = 0, bugs = 0, seams = 0 (0 to 2: Iron's wear seams, Program's and Wetware's strain),
//   states = [],          [{ kind: 'overclock' | 'overdrive' | 'overlink', strained }]
//   worn = [],            [{ id, colors? }] as 1.0's drawWorn
//   prop = null,          'metronome' or a 1.0 prop id; propExtra as 1.0's drawProp
//   propGlow = true,      the prop's own switch for its light in the dark (the Lava lamp's floor glow); off draws 1.0's dim prop
//   visit = false,        a visit is on: the motion layers pause and the netling plays 1.0's bounce
//   visitorWidth = 16,
//   death = null,         { cause, diedAt } when pose is 'dead'
// }
// opts: { reduced = false, idleHold = 'held', burnStart = null, tint = null ({ lcd, dark }) }
export function composeLCD(pet, time, opts = {}) {
  const { form, egg, palette = 0, pose = 'awake', lightsOn = true, seed = 0, worn = [], prop = null, propExtra = null, death = null } = pet;
  const { reduced = false, idleHold = 'held', burnStart = null, tint = null } = opts;
  const pal = PALETTES[palette] ?? PALETTES[0];
  const colors = paletteColors(pal);
  const dead = pose === 'dead';
  const rest = pose === 'sleep';
  const dark = !lightsOn && !dead;
  const dimPet = dark && rest;
  const bg = dark ? tint?.dark ?? LCD_BG_DARK : tint?.lcd ?? LCD_BG;
  const ops = [];
  const frame = frameOf(time);
  let box = null;

  if (dead) {
    // 1. The capture pose after the burn, or the ordinary dead pose. Neither moves; wearables are not drawn (as 1.0).
    const captured = death?.cause === 'captured' && form.captured;
    const since = burnStart == null ? Infinity : time - burnStart;
    const burning = captured && !reduced && since >= 0 && since < BURN_MS;
    if (burning) {
      const rows = burnFrame(form.a, rogueTag(form.id), { time: since, burn: pickBurn(death.diedAt ?? 0) });
      if (rows) ops.push({ op: 'rows', rows, x: Math.floor((LCD_W - rows[0].length) / 2), y: FLOOR + 1 - rows.length, colors });
    }
    if (!ops.length) {
      const rows = captured ? form.captured : form.dead;
      ops.push({ op: 'rows', rows, x: Math.floor((LCD_W - rows[0].length) / 2), y: FLOOR + 1 - rows.length, colors: DEAD_COLORS });
    }
    box = { x: ops[0].x, y: ops[0].y, w: ops[0].rows[0].length, h: ops[0].rows.length };
    ops.push({ op: 'rect', x: 0, y: 23 + TOP, w: LCD_W, h: 1, color: pal.accent }); // 8. the flatline
    return { bg, ops, box };
  }

  const awake = pose === 'awake';
  const visiting = awake && Boolean(pet.visit);
  // A visit pauses the motion layers: no tell, idle or bug twitch (visit.js). Neglect, the bug tears, seams and marks stay.
  const v = visitLayers({ level: pet.level ?? 0, idle: pet.idle ?? 'walk', neglect: pet.neglect ?? 0, bugs: pet.bugs ?? 0 }, visiting);

  // 1 and 2. The frame and the tell.
  const tell = awake ? temperTell({ egg, level: v.level, time, reduced, seed }) : { frame, blink: false, dx: 0, dy: 0, shade: 1 };
  const { draw: key, wear: wearKey } = tellPose(tell, pose);
  const registered = form[key];
  const anchors = form.anchors[key] ?? form.anchors.a;
  const w = registered[0].length;
  const h = registered.length;
  let rows = tell.glance ? rogueGlance(registered, anchors, tell.glance) : registered;

  // 3. Neglect, the seams, bugs. The twitch moves only when awake, motion is allowed and no visit is on.
  if (v.neglect) rows = neglected(rows, anchors, v.neglect, seed);
  const seamLevel = pet.seams ?? 0;
  if (seamLevel) rows = seams(rows, seamCells(placeSeams(form), seamLevel));
  if (v.bugs) rows = glitched(rows, anchors, v.bugs, { time, reduced: reduced || !awake || Boolean(v.still), seed });

  // 4. The motion layer: awake, not visiting.
  if (form.motion && awake && !visiting) rows = form.motion(rows, anchors, { time, reduced });

  // Where it stands: 1.0's idle on the tell's clock (held around each settle, drift step and hop), the tell's offsets kept inside the
  // idle's reach (driftWithin), or 1.0's visit bounce, or the resting spot.
  let x;
  let y;
  if (rest) {
    x = Math.floor((LCD_W - w) / 2);
    y = FLOOR + 1 - h;
  } else if (visiting) {
    const b = visitMotion({ w, h, visitorWidth: pet.visitorWidth ?? 16, time, calm: reduced });
    x = b.x;
    y = b.y + TOP; // visit.js keeps 1.0's floor
  } else {
    const clock = (IDLE_HOLDS[idleHold] ?? IDLE_HOLDS.held)({ egg, level: v.level, time, seed, reduced });
    const wander = v.idle !== 'none' ? idleOffset(v.idle, h, clock) : { x: 0, y: 0 };
    x = Math.floor((LCD_W - w) / 2) + wander.x + driftWithin(tell.dx, wander.x);
    y = FLOOR - h + wander.y + tell.dy;
  }
  box = { x, y, w, h };
  const pad = Math.floor((rows[0].length - w) / 2);

  let spriteColors = colors;
  if (rest) spriteColors = dimPet ? DIM_COLORS : colors; // every 2.0 form has its own sleep pose (1.0's rule for those)
  ops.push({ op: 'rows', rows, x: x - pad, y, colors: spriteColors, alpha: tell.shade });

  // 5. Wearables, on the registered frame the tell wears (Program's blink keeps them on the open-eyed frame).
  if (worn.length && !form.hideWorn?.({ time, reduced })) {
    const list = exclusiveWorn(calmWorn(worn, { calm: rest || visiting, reduced }), form[wearKey], { frame: tell.frame, time, pal });
    ops.push({ op: 'worn', list, sprite: form[wearKey], x, y, frame: tell.frame, dim: dimPet, time, pal });
  }

  // 6. State marks, awake only.
  if (awake) {
    for (const { kind, strained = false } of pet.states ?? []) {
      for (const [dx, dy] of stateMarks({ kind, time, w, h, calm: reduced, strained })) ops.push({ op: 'rect', x: x + dx, y: y + dy, w: 1, h: 1, color: MARK_COLORS[kind] });
    }
  }

  // 7. The prop, in front of the pet (as 1.0), dimmed in the dark.
  if (prop === 'metronome') {
    const art = metronomeFrame(metronome({ level: v.level, time, reduced, seed }).pos);
    const c = dark ? Object.fromEntries(Object.keys(METRONOME_COLORS).map((k) => [k, DIM_COLORS['#']])) : METRONOME_COLORS;
    ops.push({ op: 'rows', rows: art, x: LCD_W - METRONOME_SIZE.w - 2, y: PROP_FLOOR - METRONOME_SIZE.h, colors: c });
  } else if (prop) {
    ops.push({ op: 'prop', id: prop, frame, time, extra: propExtra, dim: dark, glow: pet.propGlow !== false });
  }

  // 8. The Z while resting.
  if (rest) ops.push({ op: 'rows', rows: SPRITES.z, x: 30, y: 3 + TOP + frame, colors: { '#': dimPet ? Z_DIM : pal.main } });
  return { bg, ops, box };
}

// A wearable can name a calmer stand-in: `quietId` drawn while resting or in a visit, `stillId` with reduced motion (so far only the style
// ideas' Light ring, whose face phase stops). 1.0's wearables name none and pass through unchanged.
export function calmWorn(list, { calm = false, reduced = false } = {}) {
  return list.map((w) => {
    const acc = accessoryById(w.id);
    const id = (reduced && acc?.stillId) || (calm && acc?.quietId) || w.id;
    return id === w.id ? w : { ...w, id };
  });
}

// An exclusive wearable (`exclusive: true` on its entry; so far only the style ideas' Light ring, accessory-ideas.js) is worn alone in its
// slot and over its area: every other item of its slot is dropped, and so is any worn item with a pixel on the exclusive item's area (its
// pixels and the cells they enclose, row by row), placed as placeWorn places the whole list. 1.0 has no exclusive item, so 1.0's lists
// pass through unchanged. A 2.0 wardrobe would grey out what is hidden; the renderer only refuses to draw it.
export function exclusiveWorn(list, sprite, { frame = 0, time = 0, pal = null } = {}) {
  const ex = list.filter((w) => accessoryById(w.id)?.exclusive);
  if (!ex.length) return list;
  const placed = placeWorn(list, sprite, { frame, time, pal });
  const area = new Set();
  for (const w of placed.filter((p) => ex.some((e) => e.id === p.id))) {
    const rows = new Map();
    for (const { x, y } of w.pts) rows.set(y, [Math.min(x, rows.get(y)?.[0] ?? x), Math.max(x, rows.get(y)?.[1] ?? x)]);
    for (const [y, [x0, x1]] of rows) for (let x = x0; x <= x1; x++) area.add(`${x},${y}`);
  }
  const slots = new Set(ex.map((e) => accessoryById(e.id).slot));
  return list.filter((w) => {
    if (ex.some((e) => e.id === w.id)) return true;
    if (slots.has(accessoryById(w.id)?.slot)) return false;
    const pts = placed.find((p) => p.id === w.id)?.pts ?? [];
    return !pts.some(({ x, y }) => area.has(`${x},${y}`));
  });
}

// Runs a scene on a 2D context whose cells are the LCD's (LCD_W x LCD_H; scale with the canvas size or a transform).
export function paintLCD(ctx, { bg, ops }) {
  ctx.globalAlpha = 1;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, LCD_W, LCD_H);
  for (const o of ops) {
    if (o.op === 'rows') {
      ctx.globalAlpha = o.alpha ?? 1;
      drawSprite(ctx, o.rows, o.x, o.y, o.colors);
      ctx.globalAlpha = 1;
    } else if (o.op === 'worn') drawWorn(ctx, o.list, o.sprite, o.x, o.y, o.frame, o.dim, o.time, o.pal);
    else if (o.op === 'prop') {
      // 1.0's props stand on 1.0's floor; move them down with it.
      ctx.save();
      ctx.translate(0, TOP);
      const lit = o.dim && o.glow ? PROPS.find((x) => x.id === o.id)?.glowDraw : null;
      if (lit) {
        // A prop with its own light in the dark (the Lava lamp, with its glow switched on): its own dark picture and floor glow
        // instead of 1.0's one dim colour. Placed as drawProp places it.
        const [w, h] = PROPS.find((x) => x.id === o.id).size;
        const ox = LCD_W - w - 2;
        const oy = PROP_FLOOR_1 - h;
        lit((x, y, color) => {
          ctx.fillStyle = color;
          ctx.fillRect(ox + x, oy + y, 1, 1);
        }, o.frame, o.time);
      } else drawProp(ctx, o.id, LCD_W, o.frame, o.time, o.extra, o.dim);
      ctx.restore();
    }
    else if (o.op === 'rect') {
      ctx.fillStyle = o.color;
      ctx.fillRect(o.x, o.y, o.w, o.h);
    }
  }
}

export function drawLCD(ctx, pet, time, opts = {}) {
  const scene = composeLCD(pet, time, opts);
  paintLCD(ctx, scene);
  return scene;
}
