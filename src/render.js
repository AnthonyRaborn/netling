import { SPRITES, drawSprite, formSprite } from './sprites.js';
import { PALETTES, CFG, needsAttention, isAlive } from './sim.js';

export const LCD_W = 40;
export const LCD_H = 28;
const LCD_BG = '#0b2226';
const LCD_BG_DARK = '#03090a';

const buf = document.createElement('canvas');
buf.width = LCD_W;
buf.height = LCD_H;
const bctx = buf.getContext('2d');

export function renderLCD(canvas, s, time, opts = {}) {
  const pal = PALETTES[s.quirk.palette] ?? PALETTES[0];
  const colors = { '#': pal.main, o: pal.accent, '+': '#f5f5f5' };
  const dark = s.asleep && !s.lightsOn;

  bctx.fillStyle = dark ? LCD_BG_DARK : LCD_BG;
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
    const sprite = formSprite(s.form, s.asleep ? 'sleep' : frame ? 'b' : 'a');
    let x = Math.floor((LCD_W - sprite[0].length) / 2);
    let y = 20 - sprite.length;
    if (s.asleep) {
      y = 21 - sprite.length;
    } else if (s.quirk.idle === 'sway') {
      x += Math.round(Math.sin(time / 1500) * 8);
    } else if (s.quirk.idle === 'hover') {
      y += Math.round(Math.sin(time / 600) * 2) - 1;
    } else {
      y += frame ? 0 : -1;
    }

    let spriteColors = colors;
    if (s.asleep) {
      // Forms without a dedicated sleep pose close their eyes by painting them body-colored.
      spriteColors = dark
        ? { '#': '#1c3a3f', o: hasSleepPose ? '#0f2528' : '#1c3a3f', '+': '#1c3a3f' }
        : { ...colors, o: hasSleepPose ? pal.accent : pal.main };
    }
    // Evolution: strobe a white silhouette.
    if (opts.flash && Math.floor(time / 120) % 2) {
      spriteColors = { '#': '#ffffff', o: '#ffffff', '+': '#ffffff' };
    }

    bctx.globalAlpha = s.form === 'ghost' ? 0.55 + 0.25 * Math.sin(time / 900) : 1;
    drawSprite(bctx, sprite, x, y, spriteColors);
    bctx.globalAlpha = 1;

    if (s.asleep) {
      const zc = { '#': dark ? '#2f6b73' : pal.main };
      drawSprite(bctx, SPRITES.z, 30, 3 + frame, zc);
    }
    if (!dark) {
      for (let i = 0; i < s.cache; i++) {
        drawSprite(bctx, SPRITES.cache, 2 + i * 5, 22, { '#': pal.main, o: pal.accent });
      }
      if (s.virus) drawSprite(bctx, SPRITES.virus, 2, 2, { '#': pal.accent, o: LCD_BG });
      if (s.event?.type === 'trace' && frame) {
        drawSprite(bctx, SPRITES.eye, s.virus ? 9 : 2, 2, { '#': '#f9f002', o: LCD_BG });
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
