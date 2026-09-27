// Packet Feast: packets rain down the lanes; move under the clean ones to eat them and keep
// clear of the corrupted ones. Eat enough before time runs out; two bad bites and it's sick.
import { clear, text, timerBar, DIM, W, H } from './common.js';

export const LANES = 5;
const LANE_W = W / LANES;
export const TIME = 20;
export const NEEDED = 15;
export const MAX_BAD = 2;
const SIZE = 16;
export const PLAYER_Y = H - 50;
const CLEAN_CHANCE = 0.7;
const HOLE = '#05050a'; // the dark center of a clean packet

export class Feast {
  static id = 'feast';
  static title = 'PACKET FEAST';
  static hint = `eat ${NEEDED} clean packets. dodge the corrupted ones.`;
  static winText = 'BUFFER FULL';
  static loseText = 'BAD PACKET';

  constructor(rng, sound) {
    this.rng = rng;
    this.sound = sound;
    this.lane = 2;
    this.packets = [];
    this.spawnIn = 0.4;
    this.elapsed = 0;
    this.eaten = 0;
    this.bad = 0;
    this.chomp = 0;
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
    this.chomp = Math.max(0, this.chomp - dt);
    const p = Math.min(1, this.elapsed / TIME);

    this.spawnIn -= dt;
    if (this.spawnIn <= 0 && this.elapsed < TIME - 1) {
      this.spawnIn = 0.55 - 0.15 * p;
      const lane = Math.floor(this.rng() * LANES);
      const clean = this.rng() < CLEAN_CHANCE;
      this.packets.push({ lane, y: -SIZE, clean, speed: 110 + 60 * p + 30 * this.rng() });
    }

    for (const k of this.packets) k.y += k.speed * dt;
    for (const k of this.packets) {
      if (k.gone || k.lane !== this.lane || k.y + SIZE < PLAYER_Y || k.y > PLAYER_Y + 18) continue;
      k.gone = true;
      this.chomp = 0.18;
      if (k.clean) {
        this.eaten++;
        this.sound('select');
      } else {
        this.bad++;
        this.sound('error');
      }
    }
    this.packets = this.packets.filter((k) => !k.gone && k.y < H);

    if (this.bad >= MAX_BAD) {
      this.done = true;
      this.won = false;
    } else if (this.eaten >= NEEDED) {
      this.done = true;
      this.won = true;
    } else if (this.elapsed >= TIME) {
      this.done = true;
      this.won = false;
    }
  }

  draw(ctx, pal) {
    clear(ctx);
    timerBar(ctx, 1 - this.elapsed / TIME, pal);

    ctx.strokeStyle = '#123236';
    ctx.lineWidth = 1;
    for (let i = 1; i < LANES; i++) {
      ctx.beginPath();
      ctx.moveTo(i * LANE_W + 0.5, 12);
      ctx.lineTo(i * LANE_W + 0.5, H);
      ctx.stroke();
    }

    for (const k of this.packets) {
      const x = k.lane * LANE_W + (LANE_W - SIZE) / 2;
      if (k.clean) {
        ctx.fillStyle = pal.main;
        ctx.fillRect(x, k.y, SIZE, SIZE);
        ctx.fillStyle = HOLE;
        ctx.fillRect(x + 5, k.y + 5, SIZE - 10, SIZE - 10);
      } else {
        // Corrupted: an X in the accent color.
        ctx.strokeStyle = pal.accent;
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 1.5, k.y + 1.5, SIZE - 3, SIZE - 3);
        ctx.beginPath();
        ctx.moveTo(x + 4, k.y + 4);
        ctx.lineTo(x + SIZE - 4, k.y + SIZE - 4);
        ctx.moveTo(x + SIZE - 4, k.y + 4);
        ctx.lineTo(x + 4, k.y + SIZE - 4);
        ctx.stroke();
      }
    }

    // The eater: a blocky head whose jaw drops for a moment on each bite.
    const px = this.lane * LANE_W + LANE_W / 2;
    const open = this.chomp > 0 ? 8 : 3;
    ctx.fillStyle = pal.main;
    ctx.fillRect(px - 18, PLAYER_Y, 36, 10);
    ctx.fillRect(px - 18, PLAYER_Y + 10 + open, 36, 10);
    ctx.fillStyle = pal.accent;
    ctx.fillRect(px - 10, PLAYER_Y + 2, 5, 5);
    ctx.fillRect(px + 5, PLAYER_Y + 2, 5, 5);

    text(ctx, `${this.eaten}/${NEEDED}`, 16, 24, { size: 24, color: pal.main });
    for (let i = 0; i < MAX_BAD; i++) {
      ctx.fillStyle = i < this.bad ? pal.accent : DIM;
      ctx.fillRect(W - 28 - i * 18, 18, 12, 12);
    }
  }
}
