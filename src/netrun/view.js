// Draws a netrun on the full-res screen and routes pad input. Same interface as GameSession:
// input(key), update(dt), draw(ctx, pal, time), forfeit().
import { GameSession } from '../games/session.js';
import { clear, text, DIM, W, H } from '../games/common.js';
import { nodeById } from './map.js';
import { REGIONS } from './regions.js';
import { moveTo, resolveIce, relayChoice, abortRun, closeRun, runOptions, RUN_CFG } from './run.js';
import { ITEMS } from '../sim.js';

const MAP_TOP = 24;
const MAP_BOTTOM = 212;
const TYPE_LABEL = { entry: 'ENTRY', cache: 'DATA CACHE', ice: 'ICE', relay: 'RELAY', exit: 'EXIT NODE' };
const TYPE_HINT = {
  cache: 'might hold an item.',
  ice: 'a mini-game. lose and it bites.',
  relay: 'recharge, vent heat, safe jack-out.',
  exit: 'bank everything + a bonus.',
};

export class RunView {
  constructor(pet, { rng = Math.random, sound = () => {}, onChange = () => {}, onClose = () => {} }) {
    this.pet = pet;
    this.rng = rng;
    this.sound = sound;
    this.onChange = onChange;
    this.onClose = onClose;
    this.cursor = 0;
    this.relayCursor = 0;
    this.toast = null;
    this.abortArmed = 0;
    this.game = null;
    this.lastMsgCount = pet.run.messages.length;
    if (pet.run.phase === 'ice') this.startIce(); // resumed mid-encounter
  }

  get run() {
    return this.pet.run;
  }

  options() {
    return runOptions(this.run).sort((a, b) => this.nodePos(a).y - this.nodePos(b).y);
  }

  nodePos(node) {
    const map = this.run.map;
    const layer = map.nodes.filter((n) => n.layer === node.layer);
    const i = layer.indexOf(node);
    const x = 28 + (node.layer * (W - 56)) / (map.layerCount - 1);
    const y = MAP_TOP + ((i + 1) * (MAP_BOTTOM - MAP_TOP)) / (layer.length + 1);
    return { x, y };
  }

  startIce() {
    const { game } = this.run.pending;
    this.game = new GameSession(game, {
      rng: this.rng,
      sound: this.sound,
      onFinish: (won) => {
        this.game = null;
        const res = resolveIce(this.pet, won, this.rng);
        if (res.result === 'disconnected') this.sound('lose');
        this.afterAction();
      },
    });
  }

  afterAction() {
    const msgs = this.run.messages;
    if (msgs.length > this.lastMsgCount) {
      this.toast = { msg: msgs[msgs.length - 1], until: performance.now() + 2600 };
      this.lastMsgCount = msgs.length;
    }
    this.cursor = 0;
    this.onChange();
  }

  input(key) {
    if (this.game) return this.game.input(key);
    const run = this.run;
    if (!run) return;
    if (run.phase === 'done') {
      if (key === 'a') this.close();
      return;
    }
    if (run.phase === 'relay') {
      if (key === 'left' || key === 'right') {
        this.relayCursor = 1 - this.relayCursor;
        this.sound('move');
      } else if (key === 'a') {
        relayChoice(this.pet, this.relayCursor === 0 ? 'continue' : 'out');
        this.sound(this.relayCursor === 0 ? 'select' : 'win');
        this.afterAction();
      }
      return;
    }
    const opts = this.options();
    if (key === 'left' || key === 'right') {
      this.cursor = (this.cursor + (key === 'left' ? opts.length - 1 : 1)) % opts.length;
      this.sound('move');
    } else if (key === 'a') {
      const res = moveTo(this.pet, opts[this.cursor].id, this.rng);
      if (!res.ok) return;
      if (res.kind === 'ice') {
        this.sound('alert');
        this.startIce();
      } else if (res.result === 'disconnected') {
        this.sound('lose');
      } else if (res.kind === 'exit') {
        this.sound('win');
      } else {
        this.sound(res.item ? 'feed' : 'select');
      }
      this.afterAction();
    }
  }

  // The pad's quit button: press twice to abort (loot is forfeited).
  forfeit() {
    if (this.game) return this.game.forfeit();
    if (!this.run || this.run.phase === 'done') return this.close();
    if (performance.now() < this.abortArmed) {
      abortRun(this.pet);
      this.sound('lose');
      this.afterAction();
    } else {
      this.abortArmed = performance.now() + 2500;
      this.toast = { msg: 'press ABORT again to bail out. loot will be lost.', until: this.abortArmed };
    }
  }

  close() {
    closeRun(this.pet, Date.now());
    this.onChange();
    this.onClose();
  }

  update(dt) {
    this.game?.update(dt);
  }

  draw(ctx, pal, time) {
    if (this.game) return this.game.draw(ctx, pal, time);
    const run = this.run;
    if (!run) return;
    clear(ctx);
    if (run.phase === 'done') return this.drawSummary(ctx, pal);

    const map = run.map;
    const opts = run.phase === 'map' ? this.options() : [];
    const nodePal = REGIONS[run.region].palette; // node colors stay fixed so types read at a glance
    const visible = new Set([...run.visited, ...opts.map((n) => n.id)]);

    // edges
    for (const n of map.nodes) {
      const a = this.nodePos(n);
      for (const e of n.edges) {
        const b = this.nodePos(nodeById(map, e));
        const walked = run.visited.includes(n.id) && run.visited.includes(e);
        const live = n.id === run.pos && opts.some((o) => o.id === e);
        ctx.strokeStyle = walked ? pal.main : live ? '#c7f9ff' : '#173338';
        ctx.lineWidth = walked || live ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
    // nodes
    for (const n of map.nodes) {
      const { x, y } = this.nodePos(n);
      if (!visible.has(n.id) && n.type !== 'exit') {
        ctx.fillStyle = DIM;
        ctx.fillRect(x - 2, y - 2, 4, 4);
        continue;
      }
      drawNode(ctx, n.type, x, y, nodePal, run.visited.includes(n.id) && n.id !== run.pos);
    }
    // current position + cursor
    const cur = this.nodePos(nodeById(map, run.pos));
    if (Math.floor(time / 300) % 2) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(cur.x - 12, cur.y - 12, 24, 24);
    }
    const sel = opts[this.cursor];
    if (sel) {
      const p = this.nodePos(sel);
      ctx.strokeStyle = '#f9f002';
      ctx.lineWidth = 2;
      bracket(ctx, p.x, p.y, 13);
    }

    // bottom panel
    ctx.fillStyle = 'rgba(3, 9, 10, 0.85)';
    ctx.fillRect(0, MAP_BOTTOM + 8, W, H - MAP_BOTTOM - 8);
    const toast = this.toast && performance.now() < this.toast.until ? this.toast.msg : null;
    if (run.phase === 'relay') {
      text(ctx, 'RELAY: recharged and vented.', 12, 234, { size: 20, color: '#39ff14' });
      const labels = ['CONTINUE', `JACK OUT (${run.loot.length})`];
      labels.forEach((l, i) => {
        const on = i === this.relayCursor;
        text(ctx, on ? `[${l}]` : ` ${l} `, 12 + i * 150, 258, { size: 22, color: on ? '#f9f002' : DIM });
      });
    } else if (toast) {
      text(ctx, toast.length > 46 ? `${toast.slice(0, 45)}…` : toast, 12, 234, { size: 20, color: '#f9f002' });
    } else if (sel) {
      text(ctx, `> ${TYPE_LABEL[sel.type]}`, 12, 234, { size: 22, color: '#c7f9ff' });
      text(ctx, TYPE_HINT[sel.type] ?? '', 150, 234, { size: 18, color: DIM });
    }
    if (run.phase !== 'relay') this.drawHud(ctx, pal);
    text(ctx, REGIONS[run.region].name.toUpperCase(), 12, 12, { size: 18, color: DIM });
  }

  drawHud(ctx, pal) {
    const st = this.pet.stats;
    const hot = st.heat >= RUN_CFG.throttleHeat;
    const parts = [
      [`CHG ${Math.round(st.charge)}`, st.charge < 15 ? pal.accent : '#c7f9ff'],
      [`INT ${Math.round(st.integrity)}`, st.integrity < 35 ? pal.accent : '#c7f9ff'],
      [`HEAT ${Math.round(st.heat)}`, hot ? pal.accent : '#c7f9ff'],
      [`LOOT ${this.run.loot.length}`, '#f9f002'],
    ];
    parts.forEach(([t, c], i) => text(ctx, t, 12 + i * 96, 260, { size: 20, color: c }));
  }

  drawSummary(ctx, pal) {
    const run = this.run;
    const good = run.result === 'jacked';
    const title = { jacked: 'JACKED OUT', disconnected: 'DISCONNECTED', aborted: 'RUN ABORTED' }[run.result];
    text(ctx, title, W / 2, 60, { size: 40, align: 'center', color: good ? pal.main : pal.accent, glow: good ? pal.main : pal.accent });
    const last = run.messages[run.messages.length - 1] ?? '';
    text(ctx, last.length > 50 ? `${last.slice(0, 49)}…` : last, W / 2, 110, { size: 20, align: 'center', color: DIM });
    if (good && run.loot.length) {
      run.loot.slice(0, 6).forEach((id, i) => {
        text(ctx, `+ ${ITEMS[id].name}`, W / 2, 146 + i * 22, { size: 20, align: 'center', color: '#c7f9ff' });
      });
    }
    text(ctx, '[ PRESS A ]', W / 2, 256, { size: 24, align: 'center', color: pal.main });
  }
}

function bracket(ctx, x, y, r) {
  const k = 5;
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    ctx.beginPath();
    ctx.moveTo(x + sx * r, y + sy * (r - k));
    ctx.lineTo(x + sx * r, y + sy * r);
    ctx.lineTo(x + sx * (r - k), y + sy * r);
    ctx.stroke();
  }
}

function drawNode(ctx, type, x, y, pal, spent) {
  ctx.globalAlpha = spent ? 0.45 : 1;
  switch (type) {
    case 'entry':
      ctx.fillStyle = pal.main;
      ctx.fillRect(x - 4, y - 4, 8, 8);
      break;
    case 'cache':
      ctx.strokeStyle = pal.main;
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 7, y - 7, 14, 14);
      ctx.fillStyle = pal.main;
      ctx.fillRect(x - 2, y - 2, 4, 4);
      break;
    case 'ice':
      ctx.fillStyle = pal.accent;
      ctx.beginPath();
      ctx.moveTo(x, y - 9);
      ctx.lineTo(x + 9, y);
      ctx.lineTo(x, y + 9);
      ctx.lineTo(x - 9, y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#0b2226';
      ctx.fillRect(x - 1, y - 5, 2, 10);
      ctx.fillRect(x - 5, y - 1, 10, 2);
      break;
    case 'relay':
      ctx.strokeStyle = '#39ff14';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#39ff14';
      ctx.fillRect(x - 1, y - 5, 2, 10);
      break;
    case 'exit':
      ctx.strokeStyle = '#f9f002';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 9, y - 9, 18, 18);
      ctx.strokeRect(x - 4, y - 4, 8, 8);
      break;
  }
  ctx.globalAlpha = 1;
}

