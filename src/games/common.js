// Shared drawing helpers for mini-games. Games draw on the full-res 400x280 screen canvas.

export const W = 400;
export const H = 280;
export const BG = '#0b2226';
export const DIM = '#2f6b73';
export const FONT = "'VT323', monospace";

export function clear(ctx) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
}

export function text(ctx, str, x, y, { size = 24, color = '#c7f9ff', align = 'left', glow = null } = {}) {
  ctx.font = `${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  if (glow) {
    ctx.shadowColor = glow;
    ctx.shadowBlur = 8;
  }
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
  ctx.shadowBlur = 0;
}

// Countdown bar across the top of the screen.
export function timerBar(ctx, frac, pal) {
  ctx.fillStyle = DIM;
  ctx.fillRect(0, 0, W, 6);
  ctx.fillStyle = frac < 0.25 ? pal.accent : pal.main;
  ctx.fillRect(0, 0, Math.max(0, W * frac), 6);
}
