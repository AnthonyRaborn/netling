// Signal Tune: the carrier wave sweeps through frequencies; lock it when it matches the target.
import { clear, text, timerBar, DIM, W, H } from './common.js';

const ROUNDS = 3;
const NEEDED = 2;
const ROUND_TIME = 6;
const TOLERANCE = 0.15;
const SWEEP_SPEEDS = [1.6, 2.2, 2.9];

export class Tune {
  static id = 'tune';
  static title = 'SIGNAL TUNE';
  static hint = 'press A when your wave matches the ghost signal. 2 of 3 to win.';
  static winText = 'SIGNAL LOCKED';
  static loseText = 'SIGNAL LOST';

  constructor(rng, sound) {
    this.rng = rng;
    this.sound = sound;
    this.round = 0;
    this.results = [];
    this.done = false;
    this.won = false;
    this.startRound();
  }

  startRound() {
    this.target = 1.5 + this.rng();
    this.phase = this.rng() * Math.PI * 2;
    this.t = 0;
    this.pause = 0;
  }

  freq() {
    return 2 + 1.2 * Math.sin(this.phase + this.t * SWEEP_SPEEDS[this.round]);
  }

  input(key) {
    if (this.done || this.pause > 0 || key !== 'a') return;
    this.lock(Math.abs(this.freq() - this.target) < TOLERANCE);
  }

  lock(hit) {
    this.results.push(hit);
    this.lastFreq = this.freq();
    this.sound(hit ? 'select' : 'error');
    this.pause = 0.8;
  }

  update(dt) {
    if (this.done) return;
    if (this.pause > 0) {
      this.pause -= dt;
      if (this.pause <= 0) this.nextRound();
      return;
    }
    this.t += dt;
    if (this.t >= ROUND_TIME) this.lock(false);
  }

  nextRound() {
    const hits = this.results.filter(Boolean).length;
    const misses = this.results.length - hits;
    if (hits >= NEEDED || misses > ROUNDS - NEEDED) {
      this.done = true;
      this.won = hits >= NEEDED;
      return;
    }
    this.round++;
    this.startRound();
  }

  draw(ctx, pal, time) {
    clear(ctx);
    timerBar(ctx, 1 - this.t / ROUND_TIME, pal);
    const mid = H / 2 - 10;
    const f = this.pause > 0 ? this.lastFreq : this.freq();
    const scroll = time / 400;

    const wave = (freq, color, width, dashed) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash(dashed ? [6, 6] : []);
      ctx.beginPath();
      for (let x = 16; x <= W - 16; x += 2) {
        const y = mid + 60 * Math.sin(((x - 16) / (W - 32)) * Math.PI * 2 * freq + scroll);
        if (x === 16) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };
    wave(this.target, DIM, 3, true);
    wave(f, pal.main, 2, false);

    // closeness meter
    const close = Math.max(0, 1 - Math.abs(f - this.target) / 1.2);
    ctx.fillStyle = DIM;
    ctx.fillRect(16, H - 40, W - 32, 8);
    ctx.fillStyle = close > 1 - TOLERANCE / 1.2 ? pal.accent : pal.main;
    ctx.fillRect(16, H - 40, (W - 32) * close, 8);

    for (let i = 0; i < ROUNDS; i++) {
      const r = this.results[i];
      ctx.fillStyle = r === undefined ? DIM : r ? pal.main : pal.accent;
      ctx.fillRect(16 + i * 20, H - 22, 12, 12);
    }
    if (this.pause > 0) {
      const hit = this.results[this.results.length - 1];
      text(ctx, hit ? 'LOCKED' : 'MISS', W - 16, H - 16, { size: 24, align: 'right', color: hit ? pal.main : pal.accent });
    }
  }
}
