// Wraps a mini-game with an intro card and a result card.
import { Breach } from './breach.js';
import { Dodge } from './dodge.js';
import { Tune } from './tune.js';
import { Feast } from './feast.js';
import { clear, text, DIM, W, H } from './common.js';

export const GAMES = { breach: Breach, dodge: Dodge, tune: Tune, feast: Feast };

const RESULT_SECONDS = 1.8;

export class GameSession {
  constructor(id, { rng = Math.random, sound = () => {}, onFinish }) {
    this.Game = GAMES[id];
    this.id = id;
    this.sound = sound;
    this.game = new this.Game(rng, sound);
    this.phase = 'intro';
    this.resultTime = 0;
    this.onFinish = onFinish;
  }

  input(key) {
    if (this.phase === 'intro') {
      if (key === 'a') {
        this.phase = 'play';
        this.sound('select');
      }
    } else if (this.phase === 'play') {
      this.game.input(key);
    }
  }

  // Quitting mid-game counts as a loss.
  forfeit() {
    if (this.phase === 'result') return;
    this.game.done = true;
    this.game.won = false;
    this.phase = 'play';
  }

  update(dt) {
    if (this.phase === 'play') {
      this.game.update(dt);
      if (this.game.done) {
        this.phase = 'result';
        this.sound(this.game.won ? 'win' : 'lose');
      }
    } else if (this.phase === 'result') {
      this.resultTime += dt;
      if (this.resultTime >= RESULT_SECONDS && this.onFinish) {
        const done = this.onFinish;
        this.onFinish = null;
        done(this.game.won);
      }
    }
  }

  draw(ctx, pal, time) {
    if (this.phase === 'intro') {
      clear(ctx);
      text(ctx, this.Game.title, W / 2, 90, { size: 40, align: 'center', color: pal.accent, glow: pal.accent });
      wrap(ctx, this.Game.hint, W / 2, 140, W - 60, DIM);
      if (Math.floor(time / 500) % 2) text(ctx, '[ PRESS A ]', W / 2, 220, { size: 28, align: 'center', color: pal.main });
      return;
    }
    this.game.draw(ctx, pal, time);
    if (this.phase === 'result') {
      ctx.fillStyle = 'rgba(3, 9, 10, 0.75)';
      ctx.fillRect(0, H / 2 - 36, W, 72);
      const won = this.game.won;
      text(ctx, won ? this.Game.winText : this.Game.loseText, W / 2, H / 2, {
        size: 40,
        align: 'center',
        color: won ? pal.main : pal.accent,
        glow: won ? pal.main : pal.accent,
      });
    }
  }
}

function wrap(ctx, str, x, y, maxW, color) {
  ctx.font = "22px 'VT323', monospace";
  const words = str.split(' ');
  let line = '';
  let yy = y;
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > maxW && line) {
      text(ctx, line, x, yy, { size: 22, align: 'center', color });
      line = w;
      yy += 24;
    } else {
      line = next;
    }
  }
  if (line) text(ctx, line, x, yy, { size: 22, align: 'center', color });
}
