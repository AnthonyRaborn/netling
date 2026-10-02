import { SPRITES, drawSprite, formSprite, paletteColors, DEAD_COLORS, DIM_COLORS, POWERED_DOWN_COLORS, WHITE_COLORS } from './sprites.js';
import { drawWorn, drawProp, visitAccessories } from './accessories.js';
import { PALETTES, CFG, needsAttention, isAlive, overclocked, rebootMinutesLeft, resting, lineOf, visitHidden } from './sim.js';
import { FLASH_TOGGLE_MS } from './games/common.js';

export const LCD_W = 40;
export const LCD_H = 28;
// The wardrobe's screen tint swaps these.
let LCD_BG = '#0b2226';
let LCD_BG_DARK = '#03090a';
export function setLcdTint(bg, dark) {
  LCD_BG = bg;
  LCD_BG_DARK = dark;
}

// Flash safety: nothing flashes more than three times a second, whatever the motion setting (see
// FLASH_TOGGLE_MS). The glitch and the surge follow the same limit.
export const GLITCH_STEP_MS = 350; // the glitch picks a new look at most this often
export const SURGE_MS = 900;
// The flow glow's slow breath (radians per ms divisor): about a ten-second cycle, far from a flash.
export const FLOW_BREATH_MS = 1600;
// Overclocked: heat wisps rise off it, one pixel per this many ms (a still shimmer in calm mode).
export const HEAT_RISE_MS = 400;
const HEAT_COLOR = '#ff9f1c';
// A friend's visitor card from a Mainframe form, before Root Access: static in the dim locked-record color, re-rolled
// about once a second (well under the three-flashes-a-second limit), the same field for the same step.
export const STATIC_STEP_MS = 900;
const VISITOR_STATIC = [10, 11]; // columns, rows
const STATIC_COLORS = { '#': '#2f6b73' };
export function visitorStatic(step) {
  let h = Math.imul(step + 1, 2654435761) >>> 0 || 1;
  const next = () => {
    h = (h ^ (h << 13)) >>> 0;
    h = (h ^ (h >>> 17)) >>> 0;
    h = (h ^ (h << 5)) >>> 0;
    return h / 2 ** 32;
  };
  const [w, rows] = VISITOR_STATIC;
  return Array.from({ length: rows }, () => Array.from({ length: w }, () => (next() < 0.4 ? '#' : '.')).join(''));
}

// A repeatable 0..1 sequence for one glitch step, so the look holds for the whole step.
function stepRandom(step) {
  let a = (step * 2654435761) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const buf = document.createElement('canvas');
buf.width = LCD_W;
buf.height = LCD_H;
const bctx = buf.getContext('2d');

// Timed-event icons, top left beside the virus icon: an intrusion's crosshair and an
// overflowing memory chip. '#' = accent, 'o' = highlight.
const EVENT_ICONS = {
  attack: { rows: ['.#.#.', '#...#', '..o..', '#...#', '.#.#.'], color: '#ff2a6d' },
  overflow: { rows: ['..o..', '.ooo.', '#####', '#.#.#', '#####'], color: '#ff9f1c' },
};

// Action feedback: how long a reaction plays, and the kinds (see drawAnimation).
export const ANIM_MS = 1100;

// Walking idle: every few seconds it picks a new spot and walks there, then waits.
// A pure function of time, so it needs no state and survives reloads.
const WALK_SEGMENT_MS = 5000;
const WALK_MOVE_MS = 2200;
const spot = (k) => {
  const h = Math.imul(k ^ 0x9e3779b9, 0x85ebca6b) >>> 0;
  return { x: ((h % 17) - 8), y: ((h >>> 8) % 101) / 100 };
};
function wanderPos(time) {
  const k = Math.floor(time / WALK_SEGMENT_MS);
  const t = Math.min(1, (time - k * WALK_SEGMENT_MS) / WALK_MOVE_MS);
  const a = spot(k - 1);
  const b = spot(k);
  return { x: Math.round(a.x + (b.x - a.x) * t), y: a.y + (b.y - a.y) * t, moving: t < 1 && a.x !== b.x };
}

export function renderLCD(canvas, s, time, opts = {}) {
  const pal = PALETTES[s.quirk.palette] ?? PALETTES[0];
  const colors = paletteColors(pal);
  const rest = resting(s); // asleep or napping
  // Lights off darkens the room; the pet itself only dims when it's resting in the dark.
  const dark = !s.lightsOn && s.stage !== 'dead';
  const dimPet = dark && rest;

  const bg = dark ? LCD_BG_DARK : LCD_BG;
  bctx.fillStyle = bg;
  bctx.fillRect(0, 0, LCD_W, LCD_H);

  const frame = Math.floor(time / 500) % 2;

  if (s.stage === 'script') {
    drawSprite(bctx, SPRITES.script, 15, 5, colors);
    const pct = Math.min(1, s.ageMin / CFG.bootMinutes);
    bctx.fillStyle = pal.main;
    bctx.fillRect(10, 20, 20, 1);
    bctx.fillRect(10, 23, 20, 1);
    bctx.fillStyle = pal.accent;
    bctx.fillRect(10, 21, Math.max(1, Math.round(20 * pct)), 2);
  } else if (s.stage === 'dead') {
    const sprite = formSprite(s.form, 'dead');
    const x = Math.floor((LCD_W - sprite[0].length) / 2);
    drawSprite(bctx, sprite, x, 21 - sprite.length, DEAD_COLORS);
    // flatline trace
    bctx.fillStyle = pal.accent;
    bctx.fillRect(0, 23, LCD_W, 1);
  } else {
    const hasSleepPose = Boolean(SPRITES[`${s.form}Sleep`]);
    const rebooting = rebootMinutesLeft(s) > 0; // crashed: still, eyes shut, powered down
    const sprite = formSprite(s.form, rest || rebooting ? 'sleep' : frame ? 'b' : 'a');
    let x = Math.floor((LCD_W - sprite[0].length) / 2);
    let y = 20 - sprite.length;
    if (rest || rebooting) {
      y = 21 - sprite.length;
    } else {
      // Every idle wanders the screen: side to side, and up and down as far as a hat still fits
      // above it (tall adults have little room) and the cache icons below. The tallest wearable (the halo) needs
      // five rows above the sprite, so no idle may lift the sprite higher than that leaves.
      const up = Math.max(0, Math.min(3, y - 5));
      const down = 1;
      const depth = (period) => Math.round(((Math.sin(time / period) + 1) / 2) * (up + down)) - up;
      if (s.quirk.idle === 'sway') {
        x += Math.round(Math.sin(time / 1500) * 8);
        y += depth(2300);
      } else if (s.quirk.idle === 'hover') {
        // Drifts slowly while it floats.
        x += Math.round(Math.sin(time / 2600) * 7);
        y += Math.max(-up, Math.round(Math.sin(time / 600) * 2) - 1);
      } else {
        // Walks from spot to spot in hops, pausing between.
        const walk = wanderPos(time);
        x += walk.x;
        y += Math.max(-up, Math.round(walk.y * (up + down)) - up + (walk.moving && !frame ? -1 : 0));
      }
    }

    // A visiting netling: the two bounce around each other, one on each side of the screen.
    const visit = s.visit && !rest && !rebooting ? s.visit : null;
    // They bounce toward each other by up to four columns each, but never closer than two columns apart: two adults
    // (16 wide) have room for only two columns of swing each.
    const hiddenVisitor = visitHidden(s, visit);
    const visitorWidth = !visit ? 0 : hiddenVisitor ? VISITOR_STATIC[0] : formSprite(visit.form, 'a')[0].length;
    const swingCap = visit ? Math.max(0, Math.floor((LCD_W - 4 - sprite[0].length - visitorWidth) / 2)) : 4;
    const swing = (phase) => Math.min(swingCap, opts.calm ? 2 : Math.round((Math.sin(time / 700 + phase) + 1) * 2));
    const hop = (up) => (opts.calm ? 0 : up ? 1 : 0);
    if (visit) {
      x = LCD_W - 1 - sprite[0].length - swing(Math.PI);
      y = 20 - sprite.length - hop(!frame);
    }

    // A reaction to the last action moves the body (a hop, a chomp, a head shake).
    const anim = opts.anim;
    if (anim && !opts.calm) {
      if (anim.kind === 'refuse' && anim.t < 0.7) x += Math.floor(anim.t * 16) % 2 ? 1 : -1;
      if (anim.kind === 'play') y -= Math.round(Math.abs(Math.sin(anim.t * Math.PI * 2)) * 3);
      if (anim.kind === 'eat' && anim.t >= 0.45) y += Math.floor(anim.t * 14) % 2;
    }

    let spriteColors = colors;
    if (rebooting) spriteColors = POWERED_DOWN_COLORS;
    if (rest) {
      // Forms without a dedicated sleep pose close their eyes by painting them body-colored.
      spriteColors = dimPet
        ? { ...DIM_COLORS, o: hasSleepPose ? DIM_COLORS.o : DIM_COLORS['#'] }
        : { ...colors, o: hasSleepPose ? pal.accent : pal.main };
    }
    // Evolution: strobe a white silhouette.
    const strobe = opts.flash && Math.floor(time / FLASH_TOGGLE_MS) % 2;
    if (strobe) {
      spriteColors = WHITE_COLORS;
    }

    // Flow: kept in good shape for hours, it glows. A soft outline that breathes slowly (a still
    // glow in calm mode); it never flashes.
    if (opts.flow && !rest && !rebooting && !strobe) {
      const glow = Object.fromEntries([...new Set(sprite.join(''))].filter((c) => spriteColors[c]).map((c) => [c, pal.accent]));
      bctx.globalAlpha = opts.calm ? 0.5 : 0.45 + 0.15 * Math.sin(time / FLOW_BREATH_MS);
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) drawSprite(bctx, sprite, x + dx, y + dy, glow);
      bctx.globalAlpha *= 0.5; // a fainter second ring
      for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-1, -1], [1, -1], [-1, 1], [1, 1]]) drawSprite(bctx, sprite, x + dx, y + dy, glow);
      bctx.globalAlpha = 1;
    }

    // Overclocked: three wisps of heat rise off its top edge, each a pixel that climbs and starts over.
    if (overclocked(s) && !rest && !rebooting && !strobe && !dimPet) {
      const w = sprite[0].length;
      for (let i = 0; i < 3; i++) {
        const rise = opts.calm ? i + 1 : (Math.floor(time / HEAT_RISE_MS) + i * 2) % 4;
        bctx.fillStyle = HEAT_COLOR;
        bctx.fillRect(x + Math.round(((i + 0.5) * w) / 3), y - 1 - rise, 1, 1);
      }
    }

    bctx.globalAlpha = lineOf(s.form) === 'ghost' ? 0.55 + 0.25 * Math.sin(time / 900) : 1;
    drawSprite(bctx, sprite, x, y, spriteColors);
    bctx.globalAlpha = 1; // a Ghost fades, what it wears does not
    // opts.accessories: [{ id, colors }], one per wear slot; opts.accessory (one id) is the short form.
    const worn = opts.accessories ?? (opts.accessory ? [{ id: opts.accessory, colors: opts.accessoryColors }] : []);
    if (!strobe) drawWorn(bctx, worn, sprite, x, y, frame, dimPet, time, pal);
    // The prop stands in front of the pet, so a pet at the right edge does not hide it.
    if (opts.prop) drawProp(bctx, opts.prop, LCD_W, frame, time, opts.propExtra, dark);

    if (visit && hiddenVisitor) {
      // A corrupted record: a field of static where the friend's netling would be, re-rolled every STATIC_STEP_MS.
      const vs = visitorStatic(opts.calm ? 0 : Math.floor(time / STATIC_STEP_MS));
      const vx = 1 + swing(0);
      drawSprite(bctx, vs, vx, 20 - vs.length - hop(frame), STATIC_COLORS);
      if (frame) plus(bctx, '#f9f002', Math.round((vx + vs[0].length + x) / 2), 6);
    } else if (visit) {
      const vs = formSprite(visit.form, frame ? 'a' : 'b');
      const vp = PALETTES[visit.palette] ?? PALETTES[0];
      const vx = 1 + swing(0);
      const vy = 20 - vs.length - hop(frame);
      drawSprite(bctx, vs, vx, vy, paletteColors(vp));
      drawWorn(bctx, visitAccessories(visit).map((id) => ({ id })), vs, vx, vy, frame, false, time, vp);
      // A spark passes between them.
      if (frame) plus(bctx, '#f9f002', Math.round((vx + vs[0].length + x) / 2), 6);
    }

    if (anim) drawAnimation(bctx, anim, { x, y, w: sprite[0].length, h: sprite.length }, pal);

    if (rest) {
      const zc = { '#': dimPet ? '#2f6b73' : pal.main };
      drawSprite(bctx, SPRITES.z, 30, 3 + frame, zc);
    }
    if (!dimPet) {
      for (let i = 0; i < s.cache; i++) {
        drawSprite(bctx, SPRITES.cache, 2 + i * 5, 22, { '#': pal.main, o: pal.accent });
      }
      if (s.virus) drawSprite(bctx, SPRITES.virus, 2, 2, { '#': pal.accent, o: bg });
      if (s.event?.type === 'trace' && frame) {
        drawSprite(bctx, SPRITES.eye, s.virus ? 9 : 2, 2, { '#': '#f9f002', o: bg });
      }
      const icon = EVENT_ICONS[s.event?.type];
      if (icon && frame) drawSprite(bctx, icon.rows, s.virus ? 9 : 2, 2, { '#': icon.color, o: '#f5f5f5' });
      if (rebooting) {
        // Reboot progress, like the compile bar, bottom right (a crash leaves the cache icons full on the left).
        const pct = 1 - rebootMinutesLeft(s) / CFG.rebootMin;
        bctx.fillStyle = pal.main;
        bctx.fillRect(23, 24, 15, 1);
        bctx.fillStyle = pal.accent;
        bctx.fillRect(23, 25, Math.max(1, Math.round(15 * pct)), 1);
      }
    }
    if (needsAttention(s) && frame) {
      drawSprite(bctx, SPRITES.bang, 37, 2, { '#': '#f9f002' });
    }
  }

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const sx = canvas.width / LCD_W;
  const sy = canvas.height / LCD_H;

  // Glitch intensity grows as Integrity falls or when infected; the Glitch form always flickers a little.
  const g = isAlive(s) && !opts.calm
    ? Math.max(0, (60 - s.stats.integrity) / 60) + (s.virus ? 0.35 : 0) + (lineOf(s.form) === 'glitch' ? 0.2 : 0)
    : 0;
  const rnd = stepRandom(Math.floor(time / GLITCH_STEP_MS));
  if (g > 0 && rnd() < g * 0.5) {
    ctx.globalAlpha = 0.5;
    ctx.drawImage(buf, sx * (rnd() < 0.5 ? -1 : 1), 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
  }
  ctx.drawImage(buf, 0, 0, canvas.width, canvas.height);
  if (g > 0 && rnd() < g * 0.4) {
    const row = Math.floor(rnd() * LCD_H);
    const h = 1 + Math.floor(rnd() * 3);
    const shift = Math.round((rnd() - 0.5) * 6 * g) * sx;
    ctx.drawImage(buf, 0, row, LCD_W, h, shift, row * sy, canvas.width, h * sy);
  }

  // Overheating: a pulsing red wash.
  if (isAlive(s) && s.stats.heat > 80) {
    const pulse = opts.calm ? 0.5 : 0.5 + 0.5 * Math.sin(time / 300);
    ctx.fillStyle = `rgba(255, 42, 109, ${(0.06 + 0.1 * pulse) * ((s.stats.heat - 80) / 20)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  // Power surge: one white flash that fades (opts.surge runs 1..0; true means its start). Calm mode
  // holds a fainter, steady wash instead.
  const surge = opts.surge === true ? 1 : Math.max(0, Math.min(1, Number(opts.surge) || 0));
  if (surge > 0) {
    ctx.fillStyle = `rgba(255, 255, 255, ${opts.calm ? 0.2 : (0.35 * surge).toFixed(3)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

// Pixel overlays for an action's reaction, over the pet at box { x, y, w, h }. t runs 0..1.
const px = (ctx, color, x, y) => {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
};
const plus = (ctx, color, x, y) => {
  px(ctx, color, x, y - 1);
  px(ctx, color, x - 1, y);
  px(ctx, color, x, y);
  px(ctx, color, x + 1, y);
  px(ctx, color, x, y + 1);
};

function drawAnimation(ctx, { kind, t }, box, pal) {
  const cx = box.x + box.w / 2;
  const mouthY = box.y + box.h * 0.6;
  switch (kind) {
    case 'eat': {
      // A data packet flies in from the far side and gets eaten; crumbs after.
      const from = cx > 20 ? 2 : 37;
      if (t < 0.45) {
        const k = t / 0.45;
        const x = from + (cx - from) * k;
        const y = 6 + (mouthY - 6) * k;
        ctx.fillStyle = '#f9f002';
        ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 3, 3);
      } else {
        for (let i = 0; i < 3; i++) px(ctx, '#f9f002', cx + (i - 1) * 3, mouthY + 2 + (t - 0.45) * 8 + i);
      }
      break;
    }
    case 'patch': {
      // Green crosses rise around it.
      for (let i = 0; i < 3; i++) {
        const x = box.x - 2 + i * (box.w / 2 + 2);
        const y = box.y + box.h - t * (box.h + 2) - (i % 2) * 3;
        if (y > 1) plus(ctx, '#39ff14', x, y);
      }
      break;
    }
    case 'purge': {
      // Corrupted files break up and float away from the corner where they sat.
      for (let i = 0; i < 8; i++) {
        const x = 3 + ((i * 7) % 18) + Math.sin(t * 6 + i) * 1.5;
        const y = 24 - t * 16 - (i % 3) * 2;
        if (y > 0 && (i + Math.floor(t * 10)) % 3) px(ctx, pal.accent, x, y);
      }
      break;
    }
    case 'cool': {
      // Frost falls over it.
      for (let i = 0; i < 7; i++) {
        const x = box.x - 3 + ((i * 5) % (box.w + 6));
        const y = -2 + ((t * 26 + i * 4) % 24);
        px(ctx, '#bfefff', x, y);
      }
      break;
    }
    case 'item':
    case 'play': {
      // Sparkles blink out around it.
      const r = 2 + t * 5;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.6;
        if ((i + Math.floor(t * 8)) % 2) plus(ctx, i % 2 ? '#f9f002' : '#f5f5f5', cx + Math.cos(a) * (box.w / 2 + r), box.y + box.h / 2 + Math.sin(a) * (box.h / 2 + r * 0.6));
      }
      break;
    }
    case 'refuse': {
      // A red X over its head.
      const x = Math.round(cx);
      const y = Math.max(2, box.y - 4);
      for (let i = -1; i <= 1; i++) {
        px(ctx, '#ff2a6d', x + i, y + i);
        px(ctx, '#ff2a6d', x + i, y - i);
      }
      break;
    }
  }
}
