import { SPRITES, drawSprite, formSprite } from './sprites.js';
import { drawAccessory, drawProp } from './accessories.js';
import { PALETTES, CFG, needsAttention, isAlive, resting } from './sim.js';

export const LCD_W = 40;
export const LCD_H = 28;
// The wardrobe's screen tint swaps these.
let LCD_BG = '#0b2226';
let LCD_BG_DARK = '#03090a';
export function setLcdTint(bg, dark) {
  LCD_BG = bg;
  LCD_BG_DARK = dark;
}

const buf = document.createElement('canvas');
buf.width = LCD_W;
buf.height = LCD_H;
const bctx = buf.getContext('2d');

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
  const colors = { '#': pal.main, o: pal.accent, '+': '#f5f5f5' };
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
    drawSprite(bctx, sprite, x, 21 - sprite.length, { '#': '#3a4a4d', o: '#1c2a2d', '+': '#3a4a4d' });
    // flatline trace
    bctx.fillStyle = pal.accent;
    bctx.fillRect(0, 23, LCD_W, 1);
  } else {
    const hasSleepPose = Boolean(SPRITES[`${s.form}Sleep`]);
    const sprite = formSprite(s.form, rest ? 'sleep' : frame ? 'b' : 'a');
    let x = Math.floor((LCD_W - sprite[0].length) / 2);
    let y = 20 - sprite.length;
    if (rest) {
      y = 21 - sprite.length;
    } else {
      // Every idle wanders the screen: side to side, and up and down as far as a hat still fits
      // above it (tall adults have little room) and the cache icons below.
      const up = Math.max(0, Math.min(3, y - 4));
      const down = 1;
      const depth = (period) => Math.round(((Math.sin(time / period) + 1) / 2) * (up + down)) - up;
      if (s.quirk.idle === 'sway') {
        x += Math.round(Math.sin(time / 1500) * 8);
        y += depth(2300);
      } else if (s.quirk.idle === 'hover') {
        // Drifts slowly while it floats.
        x += Math.round(Math.sin(time / 2600) * 7);
        y += Math.round(Math.sin(time / 600) * 2) - 1;
      } else {
        // Walks from spot to spot in hops, pausing between.
        const walk = wanderPos(time);
        x += walk.x;
        y += Math.round(walk.y * (up + down)) - up + (walk.moving && !frame ? -1 : 0);
      }
    }

    // A reaction to the last action moves the body (a hop, a chomp, a head shake).
    const anim = opts.anim;
    if (anim && !opts.calm) {
      if (anim.kind === 'refuse' && anim.t < 0.7) x += Math.floor(anim.t * 16) % 2 ? 1 : -1;
      if (anim.kind === 'play') y -= Math.round(Math.abs(Math.sin(anim.t * Math.PI * 2)) * 3);
      if (anim.kind === 'eat' && anim.t >= 0.45) y += Math.floor(anim.t * 14) % 2;
    }

    let spriteColors = colors;
    if (rest) {
      // Forms without a dedicated sleep pose close their eyes by painting them body-colored.
      spriteColors = dimPet
        ? { '#': '#1c3a3f', o: hasSleepPose ? '#0f2528' : '#1c3a3f', '+': '#1c3a3f' }
        : { ...colors, o: hasSleepPose ? pal.accent : pal.main };
    }
    // Evolution: strobe a white silhouette.
    if (opts.flash && Math.floor(time / 120) % 2) {
      spriteColors = { '#': '#ffffff', o: '#ffffff', '+': '#ffffff' };
    }

    if (opts.prop) drawProp(bctx, opts.prop, LCD_W, frame, time, opts.propExtra, dark);
    bctx.globalAlpha = s.form === 'ghost' ? 0.55 + 0.25 * Math.sin(time / 900) : 1;
    drawSprite(bctx, sprite, x, y, spriteColors);
    if (opts.accessory && !(opts.flash && Math.floor(time / 120) % 2)) {
      drawAccessory(bctx, opts.accessory, sprite, x, y, frame, dimPet, time, opts.accessoryColors);
    }
    bctx.globalAlpha = 1;

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
    ? Math.max(0, (60 - s.stats.integrity) / 60) + (s.virus ? 0.35 : 0) + (s.form === 'glitch' ? 0.2 : 0)
    : 0;
  if (g > 0 && Math.random() < g * 0.5) {
    ctx.globalAlpha = 0.5;
    ctx.drawImage(buf, sx * (Math.random() < 0.5 ? -1 : 1), 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
  }
  ctx.drawImage(buf, 0, 0, canvas.width, canvas.height);
  if (g > 0 && Math.random() < g * 0.4) {
    const row = Math.floor(Math.random() * LCD_H);
    const h = 1 + Math.floor(Math.random() * 3);
    const shift = Math.round((Math.random() - 0.5) * 6 * g) * sx;
    ctx.drawImage(buf, 0, row, LCD_W, h, shift, row * sy, canvas.width, h * sy);
  }

  // Overheating: a pulsing red wash.
  if (isAlive(s) && s.stats.heat > 80) {
    const pulse = opts.calm ? 0.5 : 0.5 + 0.5 * Math.sin(time / 300);
    ctx.fillStyle = `rgba(255, 42, 109, ${(0.06 + 0.1 * pulse) * ((s.stats.heat - 80) / 20)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  // Power surge: a hard white flicker.
  if (opts.surge && (opts.calm || Math.floor(time / 70) % 2)) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
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
