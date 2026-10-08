// 1.0's idle wander as a pure function, a copy of the rules in src/render.js (wanderPos, sway, hover), so the prototype can draw
// and test the temper tell on top of it without the DOM. Keep it in step with src/render.js; temper-pass.test.js checks it
// against the constants there. -> { x, y } offsets from the resting spot (columns, rows) for a form `h` rows tall.
const WALK_SEGMENT_MS = 5000;
const WALK_MOVE_MS = 2200;
export const QUIRKS = ['sway', 'hover', 'walk'];

const spot = (k) => {
  const h = Math.imul(k ^ 0x9e3779b9, 0x85ebca6b) >>> 0;
  return { x: (h % 17) - 8, y: ((h >>> 8) % 101) / 100 };
};
function wanderPos(time) {
  const k = Math.floor(time / WALK_SEGMENT_MS);
  const t = Math.min(1, (time - k * WALK_SEGMENT_MS) / WALK_MOVE_MS);
  const a = spot(k - 1);
  const b = spot(k);
  return { x: Math.round(a.x + (b.x - a.x) * t), y: a.y + (b.y - a.y) * t, moving: t < 1 && a.x !== b.x };
}

export function idleOffset(quirk, h, time) {
  const y0 = 20 - h;
  const up = Math.max(0, Math.min(3, y0 - 5));
  const down = 1;
  const frame = Math.floor(time / 500) % 2;
  const depth = (period) => Math.round(((Math.sin(time / period) + 1) / 2) * (up + down)) - up;
  if (quirk === 'sway') return { x: Math.round(Math.sin(time / 1500) * 8), y: depth(2300) };
  if (quirk === 'hover') return { x: Math.round(Math.sin(time / 2600) * 7), y: Math.max(-up, Math.round(Math.sin(time / 600) * 2) - 1) };
  const walk = wanderPos(time);
  return { x: walk.x, y: Math.max(-up, Math.round(walk.y * (up + down)) - up + (walk.moving && !frame ? -1 : 0)) };
}
