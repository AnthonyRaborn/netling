import { SPRITES, drawSprite } from './sprites.js';
import { PALETTES, CFG, needsAttention } from './sim.js';

export const LCD_W = 40;
export const LCD_H = 28;
const LCD_BG = '#0b2226';
const LCD_BG_DARK = '#03090a';

const buf = document.createElement('canvas');
buf.width = LCD_W;
buf.height = LCD_H;
const bctx = buf.getContext('2d');

export function renderLCD(canvas, s, time) {
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
    drawSprite(bctx, SPRITES.bitlingDead, 14, 4, { '#': '#3a4a4d', o: pal.accent, '+': '#3a4a4d' });
    // flatline trace
    bctx.fillStyle = pal.accent;
    bctx.fillRect(0, 22, LCD_W, 1);
  } else {
    let x = 14;
    let y = 8;
    let sprite = frame ? SPRITES.bitlingB : SPRITES.bitlingA;
    if (s.asleep) {
      sprite = SPRITES.bitlingSleep;
    } else if (s.quirk.idle === 'sway') {
      x += Math.round(Math.sin(time / 1500) * 8);
    } else if (s.quirk.idle === 'hover') {
      y += Math.round(Math.sin(time / 600) * 2) - 1;
    } else {
      y += frame ? 0 : -1;
    }

    const sleepColors = dark ? { '#': '#1c3a3f', o: '#0f2528', '+': '#1c3a3f' } : colors;
    drawSprite(bctx, sprite, x, y, s.asleep ? sleepColors : colors);

    if (s.asleep) {
      const zc = { '#': dark ? '#2f6b73' : pal.main };
      drawSprite(bctx, SPRITES.z, 28, 3 + frame, zc);
    }
    if (!dark) {
      for (let i = 0; i < s.cache; i++) {
        drawSprite(bctx, SPRITES.cache, 2 + i * 5, 21, { '#': pal.main, o: pal.accent });
      }
      if (s.virus) drawSprite(bctx, SPRITES.virus, 2, 2, { '#': pal.accent, o: LCD_BG });
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

  // Glitch intensity grows as Integrity falls or when infected.
  const g = s.stage === 'baby' ? Math.max(0, (60 - s.stats.integrity) / 60) + (s.virus ? 0.35 : 0) : 0;
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
}
