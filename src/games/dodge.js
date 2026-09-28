// Firewall Dodge: slide the packet between lanes to avoid falling firewall blocks until time runs out.
import { clear, timerBar, DIM, W, H } from './common.js';

const LANES = 5;
const LANE_W = W / LANES;
const TIME = 15;
const BLOCK_H = 22;
const PLAYER_Y = H - 44;
const HIT_FLASH_MS = 450;

export class Dodge {
  static id = 'dodge';
  static title = 'FIREWALL DODGE';
  static hint = 'slip between the firewalls until the timer runs out.';
  static winText = 'PACKET DELIVERED';
  static loseText = 'PACKET DROPPED';

  constructor(rng, sound) {
    this.rng = rng;
    this.sound = sound;
    this.lane = 2;
    this.blocks = [];
    this.spawnIn = 0.6;
    this.elapsed = 0;
    this.hit = false;
    this.done = false;
    this.won = false;
  }

  input(key) {
    if (this.done) return;
    if (key === 'left' && this.lane > 0) this.lane--;
    else if (key === 'right' && this.lane < LANES - 1) this.lane++;
    else return;
    this.sound('move');
  }

  update(dt) {
    if (this.done) return;
    this.elapsed += dt;
    const p = Math.min(1, this.elapsed / TIME);
    const speed = 140 + 140 * p;

    this.spawnIn -= dt;
    if (this.spawnIn <= 0 && this.elapsed < TIME - 1) {
      this.spawnIn = 0.75 - 0.4 * p;
      const count = this.rng() < 0.3 + 0.4 * p ? 2 : 1;
      const lanes = new Set();
      while (lanes.size < count) lanes.add(Math.floor(this.rng() * LANES));
      for (const lane of lanes) this.blocks.push({ lane, y: -BLOCK_H });
    }

    for (const b of this.blocks) b.y += speed * dt;
    this.blocks = this.blocks.filter((b) => b.y < H);

    const hit = this.blocks.some((b) => b.lane === this.lane && b.y + BLOCK_H > PLAYER_Y && b.y < PLAYER_Y + 18);
    if (hit) {
      this.done = true;
      this.won = false;
      this.hit = true;
      this.sound('hit');
    } else if (this.elapsed >= TIME) {
      this.done = true;
      this.won = true;
    }
  }

  draw(ctx, pal, time) {
    clear(ctx);
    timerBar(ctx, 1 - this.elapsed / TIME, pal);

    ctx.fillStyle = DIM;
    for (let i = 1; i < LANES; i++) {
      for (let y = 12; y < H; y += 16) ctx.fillRect(i * LANE_W, y, 1, 8);
    }

    for (const b of this.blocks) {
      const x = b.lane * LANE_W + 6;
      const w = LANE_W - 12;
      ctx.fillStyle = pal.accent;
      ctx.fillRect(x, b.y, w, BLOCK_H);
      // brick seams
      ctx.fillStyle = '#0b2226';
      ctx.fillRect(x, b.y + BLOCK_H / 2 - 1, w, 2);
      ctx.fillRect(x + w / 2 - 1, b.y, 2, BLOCK_H / 2);
      ctx.fillRect(x + w / 4, b.y + BLOCK_H / 2, 2, BLOCK_H / 2);
      ctx.fillRect(x + (3 * w) / 4, b.y + BLOCK_H / 2, 2, BLOCK_H / 2);
    }

    // player packet: a diamond with a trailing tail
    const cx = this.lane * LANE_W + LANE_W / 2;
    const cy = PLAYER_Y + 9;
    const blink = this.done && !this.won && Math.floor(time / 100) % 2;
    ctx.fillStyle = blink ? '#ffffff' : pal.main;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 12);
    ctx.lineTo(cx + 12, cy);
    ctx.lineTo(cx, cy + 12);
    ctx.lineTo(cx - 12, cy);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(cx - 2, cy + 14, 4, 4);
    ctx.fillRect(cx - 2, cy + 22, 4, 3);

    // The moment of impact: an accent flash over the whole screen that fades out.
    if (this.hit) {
      this.hitDrawnAt ??= time;
      const fade = 1 - (time - this.hitDrawnAt) / HIT_FLASH_MS;
      if (fade > 0) {
        ctx.globalAlpha = 0.4 * fade;
        ctx.fillStyle = pal.accent;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
    }
  }
}
