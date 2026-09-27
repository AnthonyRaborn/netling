// Breach Protocol: pick codes alternating row/column so the target sequence lands in the buffer.
import { clear, text, timerBar, DIM, W } from './common.js';

const CODES = ['1C', '55', 'BD', 'E9', '7A'];
const N = 5;
const BUFFER = 4;
const TIME = 25;

export class Breach {
  static id = 'breach';
  static title = 'BREACH PROTOCOL';
  static hint = 'match the target sequence. rows and columns alternate.';
  static winText = 'ACCESS GRANTED';
  static loseText = 'BREACH FAILED';

  constructor(rng, sound) {
    this.sound = sound;
    this.grid = Array.from({ length: N }, () => Array.from({ length: N }, () => CODES[Math.floor(rng() * CODES.length)]));
    // Walk a legal path through the grid; the target is a slice of it, so it is always solvable.
    const path = [];
    const taken = new Set();
    let axis = 'row';
    let index = 0;
    for (let i = 0; i < BUFFER; i++) {
      const options = [];
      for (let k = 0; k < N; k++) {
        const [r, c] = axis === 'row' ? [index, k] : [k, index];
        if (!taken.has(`${r},${c}`)) options.push([r, c]);
      }
      const [r, c] = options[Math.floor(rng() * options.length)];
      taken.add(`${r},${c}`);
      path.push(this.grid[r][c]);
      [axis, index] = axis === 'row' ? ['col', c] : ['row', r];
    }
    const start = Math.floor(rng() * (BUFFER - 2));
    this.target = path.slice(start, start + 3);

    this.axis = 'row';
    this.index = 0;
    this.cursor = 0;
    this.buffer = [];
    this.used = new Set();
    this.timeLeft = TIME;
    this.done = false;
    this.won = false;
  }

  cell() {
    return this.axis === 'row' ? [this.index, this.cursor] : [this.cursor, this.index];
  }

  input(key) {
    if (this.done) return;
    if (key === 'left' || key === 'right') {
      this.cursor = (this.cursor + (key === 'left' ? N - 1 : 1)) % N;
      this.sound('move');
      return;
    }
    if (key !== 'a') return;
    const [r, c] = this.cell();
    if (this.used.has(`${r},${c}`)) return this.sound('error');
    this.used.add(`${r},${c}`);
    this.buffer.push(this.grid[r][c]);
    this.sound('select');
    [this.axis, this.index, this.cursor] = this.axis === 'row' ? ['col', c, r] : ['row', r, c];
    if (this.buffer.join(' ').includes(this.target.join(' '))) this.finish(true);
    else if (this.buffer.length >= BUFFER) this.finish(false);
  }

  finish(won) {
    this.done = true;
    this.won = won;
  }

  update(dt) {
    if (this.done) return;
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) this.finish(false);
  }

  draw(ctx, pal, time) {
    clear(ctx);
    timerBar(ctx, this.timeLeft / TIME, pal);
    const x0 = 16;
    const y0 = 34;
    const cw = 44;
    const ch = 44;

    // highlight the active line
    ctx.fillStyle = 'rgba(5, 217, 232, 0.10)';
    if (this.axis === 'row') ctx.fillRect(x0, y0 + this.index * ch, cw * N, ch);
    else ctx.fillRect(x0 + this.index * cw, y0, cw, ch * N);

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const cx = x0 + c * cw + cw / 2;
        const cy = y0 + r * ch + ch / 2;
        const used = this.used.has(`${r},${c}`);
        const onLine = this.axis === 'row' ? r === this.index : c === this.index;
        text(ctx, used ? '[]' : this.grid[r][c], cx, cy, {
          size: 26,
          align: 'center',
          color: used ? DIM : onLine ? '#c7f9ff' : '#5d9aa2',
        });
      }
    }
    const [r, c] = this.cell();
    if (Math.floor(time / 250) % 2 || this.done) {
      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 2;
      ctx.strokeRect(x0 + c * cw + 3, y0 + r * ch + 3, cw - 6, ch - 6);
    }

    const px = 252;
    text(ctx, 'TARGET', px, 44, { size: 20, color: DIM });
    this.target.forEach((code, i) => text(ctx, code, px + i * 44, 72, { size: 28, color: pal.main }));
    text(ctx, 'BUFFER', px, 118, { size: 20, color: DIM });
    for (let i = 0; i < BUFFER; i++) {
      ctx.strokeStyle = DIM;
      ctx.lineWidth = 1;
      ctx.strokeRect(px + i * 34, 134, 30, 30);
      if (this.buffer[i]) text(ctx, this.buffer[i], px + i * 34 + 15, 150, { size: 22, align: 'center', color: pal.accent });
    }
    text(ctx, `${Math.max(0, this.timeLeft).toFixed(1)}s`, W - 16, 256, { size: 22, align: 'right', color: DIM });
  }
}
