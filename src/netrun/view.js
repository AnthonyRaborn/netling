// Draws a netrun on the full-res screen and routes pad input. Same interface as GameSession:
// input(key), update(dt), draw(ctx, pal, time), forfeit().
import { GameSession } from '../games/session.js';
import { text, DIM, W, H } from '../games/common.js';
import { nodeById } from './map.js';
import { REGIONS } from './regions.js';
import { iceSpeed, moveTo, resolveIce, choose, abortRun, closeRun, runOptions, visibleNodeIds, contractShort, contractPay, RUN_CFG } from './run.js';
import { ITEMS } from '../sim.js';
import { fragmentById } from './codex.js';
import { accessoryById } from '../accessories.js';
import { challengeById } from './challenges.js';
import { dayNumber } from './daily.js';

const CONFIRM_MS = 3000; // an option with `confirm` needs a second press within this

const MAP_TOP = 24;
const MAP_BOTTOM = 212;
const TYPE_LABEL = {
  entry: 'ENTRY',
  cache: 'DATA CACHE',
  ice: 'ICE',
  relay: 'RELAY',
  exit: 'EXIT NODE',
  checkpoint: 'CHECKPOINT',
  market: 'BLACK MARKET',
  exchange: 'CORP EXCHANGE',
  anomaly: 'ANOMALY',
};
// First-run captions, keyed by the node the cursor is on (or the open choice).
const TUTORIAL_TIPS = {
  cache: ['moves cost charge. ◀ ▶ picks a node, A moves.', 'caches can hold items. this one does.'],
  ice: ['ICE guards the net. beat the mini-game,', 'or it bites into integrity.'],
  relay: ['relays recharge and cool you down.', 'you can bank your loot here, or push on.'],
  exit: ['the exit banks everything you found,', 'plus a bonus. take it home.'],
  relayChoice: ['CONTINUE to reach the exit.', 'JACK OUT would end the run safely here.'],
};

const TYPE_HINT = {
  cache: 'might hold an item.',
  ice: 'a mini-game. lose and it bites.',
  relay: 'recharge, vent heat, safe jack-out.',
  exit: 'bank everything + a bonus.',
  checkpoint: 'corp scan. hide, comply, or pay.',
  market: 'cheap, risky. leans indie.',
  exchange: 'safe, pricier. leans corp.',
  anomaly: 'something strange. choose wisely.',
};

export class RunView {
  constructor(pet, { rng = Math.random, now = Date.now, sound = () => {}, onChange = () => {}, onClose = () => {}, onGame = () => {} }) {
    this.pet = pet;
    this.now = now; // game time (test mode runs it fast)
    this.rng = rng;
    this.sound = sound;
    this.onChange = onChange;
    this.onClose = onClose;
    this.onGame = onGame; // every ICE fight is a mini-game play
    this.cursor = 0;
    this.choiceCursor = 0;
    this.toast = null;
    this.abortArmed = 0;
    this.game = null;
    this.lastMsgCount = pet.run.messages.length;
    if (pet.run.hot && pet.run.visited.length === 1) this.toast = { msg: 'overclocked: ICE runs slow, bites hard.', until: performance.now() + 3200 };
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
      speed: iceSpeed(this.pet),
      onFinish: (won) => {
        this.game = null;
        this.onGame(game, won);
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
    if (run.phase === 'choice') {
      const opts = run.pending.options;
      if (key === 'left' || key === 'right') {
        this.choiceCursor = (this.choiceCursor + (key === 'left' ? opts.length - 1 : 1)) % opts.length;
        this.confirming = null;
        this.sound('move');
      } else if (key === 'a') {
        const opt = opts[this.choiceCursor];
        if (opt.disabled) return this.sound('error');
        // Bare metal: buying an item ends the challenge, so it takes a second press.
        if (opt.confirm && !(this.confirming?.id === opt.id && performance.now() < this.confirming.until)) {
          this.confirming = { id: opt.id, until: performance.now() + CONFIRM_MS };
          return this.sound('error');
        }
        this.confirming = null;
        const res = choose(this.pet, opt.id, this.rng);
        if (!res.ok) return this.sound('error');
        this.sound(res.result === 'disconnected' ? 'lose' : res.result === 'jacked' ? 'win' : 'select');
        this.choiceCursor = 0;
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
      if (res.kind === 'ice' && res.phased) {
        // Glitch, Ghost and Panic slipped past: there is no fight to start (run.pending is empty).
        this.sound('select');
      } else if (res.kind === 'ice') {
        this.sound('alert');
        this.startIce();
      } else if (res.result === 'disconnected') {
        this.sound('lose');
      } else if (res.kind === 'exit') {
        this.sound('win');
      } else if (res.kind === 'relay' || this.run.phase === 'choice') {
        this.sound('alert');
      } else {
        this.sound(res.item ? 'feed' : 'select');
      }
      this.afterAction();
    }
  }

  // Esc or the controller's B: press twice to abort (loot is forfeited).
  forfeit() {
    if (this.game) return this.game.forfeit();
    if (!this.run || this.run.phase === 'done') return this.close();
    if (performance.now() < this.abortArmed) {
      this.abortNow();
    } else {
      this.abortArmed = performance.now() + 2500;
      this.toast = { msg: this.run.daily ? "press ABORT again to end today's trace." : 'press ABORT again to bail out. loot will be lost.', until: this.abortArmed };
    }
  }

  // A confirmed abort (the touch confirm already asked): an ICE fight is lost, a run ends now.
  abortNow() {
    if (this.game) return this.game.forfeit();
    if (!this.run || this.run.phase === 'done') return this.close();
    abortRun(this.pet);
    this.sound('lose');
    this.afterAction();
  }

  close() {
    const run = this.run;
    closeRun(this.pet, this.now());
    this.onChange();
    this.onClose(run);
  }

  update(dt) {
    this.game?.update(dt);
  }

  draw(ctx, pal, time) {
    if (this.game) return this.game.draw(ctx, pal, time);
    const run = this.run;
    if (!run) return;
    ctx.fillStyle = REGIONS[run.region].palette.bg;
    ctx.fillRect(0, 0, W, H);
    if (run.phase === 'done') return this.drawSummary(ctx, pal);

    const map = run.map;
    const opts = run.phase === 'map' ? this.options() : [];
    const nodePal = REGIONS[run.region].palette; // node colors stay fixed so types read at a glance
    const visible = visibleNodeIds(this.pet);

    // Blackout: nothing past one step ahead is drawn, not even the shape of the map.
    const dark = run.challenge === 'blackout';
    const ahead = nodeById(map, run.pos).layer + 1;
    const shown = (n) => !dark || n.layer <= ahead || run.visited.includes(n.id);
    // edges
    for (const n of map.nodes) {
      if (!shown(n)) continue;
      const a = this.nodePos(n);
      for (const e of n.edges) {
        if (!shown(nodeById(map, e))) continue;
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
      if (!shown(n)) continue;
      const { x, y } = this.nodePos(n);
      if (!visible.has(n.id) && n.type !== 'exit') {
        ctx.fillStyle = DIM;
        ctx.fillRect(x - 2, y - 2, 4, 4);
        continue;
      }
      drawNode(ctx, nodeKind(n), x, y, nodePal, run.visited.includes(n.id) && n.id !== run.pos);
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
    const tutorial = REGIONS[run.region].tutorial;
    if (run.phase === 'choice') this.drawChoice(ctx, pal);
    else if (toast) {
      text(ctx, toast.length > 46 ? `${toast.slice(0, 45)}…` : toast, 12, 234, { size: 20, color: '#f9f002' });
    } else if (sel) {
      const label = `> ${TYPE_LABEL[nodeKind(sel)]}`;
      text(ctx, label, 12, 234, { size: 22, color: '#c7f9ff' });
      // The hint follows the label (the market labels are long), but never starts left of where it always did.
      text(ctx, TYPE_HINT[nodeKind(sel)] ?? '', Math.max(150, 26 + ctx.measureText(label).width), 234, { size: 18, color: DIM });
    }
    this.drawHud(ctx, pal);
    const region = REGIONS[run.region].name.toUpperCase();
    text(ctx, region, 12, 12, { size: 18, color: DIM });
    // Jacked in overclocked: ICE runs slower and bites harder all run.
    if (run.hot) text(ctx, 'OC', 22 + ctx.measureText(region).width, 12, { size: 18, color: '#ff9f1c' });
    // The challenge, dimmed once broken.
    if (run.challenge) {
      const label = `${challengeById(run.challenge).name.toUpperCase()}${run.challengeVoid ? ' OFF' : ''}`;
      text(ctx, label, W / 2, 12, { size: 18, align: 'center', color: run.challengeVoid ? DIM : '#05d9e8' });
    }
    const job = contractShort(run);
    if (job) text(ctx, job, W - 12, 12, { size: 18, align: 'right', color: job.startsWith('JOB LOST') ? DIM : '#f9f002' });
    if (tutorial) this.drawTutorialTip(ctx, sel, toast);
  }

  drawTutorialTip(ctx, sel, toast) {
    const run = this.run;
    const tip = run.phase === 'choice' && run.pending.kind === 'relay' ? TUTORIAL_TIPS.relayChoice : sel && !toast ? TUTORIAL_TIPS[sel.type] : null;
    if (!tip) return;
    const top = run.phase === 'choice' ? 170 : 150;
    ctx.fillStyle = 'rgba(3, 9, 10, 0.88)';
    ctx.fillRect(16, top, W - 32, 50);
    ctx.strokeStyle = '#f9f002';
    ctx.lineWidth = 1;
    ctx.strokeRect(16.5, top + 0.5, W - 33, 49);
    tip.forEach((line, i) => text(ctx, line, 26, top + 15 + i * 20, { size: 18, color: '#f9f002' }));
  }

  drawChoice(ctx, pal) {
    const p = this.run.pending;
    ctx.fillStyle = 'rgba(3, 9, 10, 0.92)';
    ctx.fillRect(28, 30, W - 56, 176);
    ctx.strokeStyle = '#f9f002';
    ctx.lineWidth = 1;
    ctx.strokeRect(28.5, 30.5, W - 57, 175);
    text(ctx, p.title, 44, 52, { size: 26, color: '#f9f002', glow: '#f9f002' });
    text(ctx, p.text.length > 44 ? `${p.text.slice(0, 43)}…` : p.text, 44, 78, { size: 18, color: DIM });
    p.options.forEach((o, i) => {
      const on = i === this.choiceCursor;
      const color = o.disabled ? '#2f4f54' : on ? '#f9f002' : '#c7f9ff';
      text(ctx, `${on ? '>' : ' '} ${o.label}`, 44, 108 + i * 26, { size: 22, color });
    });
    const sel = p.options[this.choiceCursor];
    const asking = sel?.confirm && this.confirming?.id === sel.id && performance.now() < this.confirming.until;
    text(ctx, asking ? sel.confirm.toLowerCase() : sel?.hint ?? '', 12, 234, { size: 18, color: asking ? '#f9f002' : sel?.disabled ? '#2f4f54' : '#c7f9ff' });
  }

  drawHud(ctx, pal) {
    const st = this.pet.stats;
    const hot = st.heat >= RUN_CFG.throttleHeat;
    const parts = [
      [`CHG ${Math.round(st.charge)}`, st.charge < 15 ? pal.accent : '#c7f9ff'],
      [`INT ${Math.round(st.integrity)}`, st.integrity < 35 ? pal.accent : '#c7f9ff'],
      [`HEAT ${Math.round(st.heat)}`, hot ? pal.accent : '#c7f9ff'],
      this.run.daily ? [`#${dayNumber(this.run.day)}`, '#f9f002'] : [`LOOT ${this.run.loot.length}`, '#f9f002'],
    ];
    parts.forEach(([t, c], i) => text(ctx, t, 12 + i * 96, 260, { size: 20, color: c }));
  }

  drawSummary(ctx, pal) {
    const run = this.run;
    const region = REGIONS[run.region];
    const good = run.result === 'jacked';
    const exit = run.result === 'jacked' && nodeById(run.map, run.pos)?.type === 'exit';
    const title = run.daily && exit ? 'TRACE COMPLETE' : { jacked: 'JACKED OUT', disconnected: 'DISCONNECTED', aborted: 'RUN ABORTED' }[run.result];
    const tone = good ? region.palette.main : '#ff2a6d'; // failure always reads red
    text(ctx, run.daily ? `${region.name.toUpperCase()} #${dayNumber(run.day)}` : region.name.toUpperCase(), W / 2, 22, { size: 18, align: 'center', color: DIM });
    if (run.daily) return this.drawDailySummary(ctx, pal, exit);
    text(ctx, title, W / 2, 52, { size: 40, align: 'center', color: tone, glow: tone });

    // Run record: how far, how the ICE went, what it cost.
    const t = run.tally ?? { nodes: 0, iceWon: 0, iceLost: 0 };
    const total = run.map.layerCount - 1;
    const d = (k) => Math.round(this.pet.stats[k] - (run.startStats?.[k] ?? this.pet.stats[k]));
    const sign = (v) => (v > 0 ? `+${v}` : `${v}`);
    text(ctx, `nodes ${t.nodes}/${total}   ICE ${t.iceWon}W ${t.iceLost}L`, W / 2, 86, { size: 20, align: 'center', color: '#c7f9ff' });
    text(ctx, `CHG ${sign(d('charge'))}   INT ${sign(d('integrity'))}   HEAT ${sign(d('heat'))}`, W / 2, 108, {
      size: 20,
      align: 'center',
      color: DIM,
    });

    const lines = good
      ? [
          ...run.loot.map((id) => [`+ ${ITEMS[id].name}`, '#c7f9ff']),
          ...run.fragments.map((id) => [`+ codex: ${fragmentById(id).title}`, '#f9f002']),
          ...(run.accessories ?? []).map((id) => [`+ style: ${accessoryById(id).name}`, '#b967ff']),
        ]
      : [[run.result === 'disconnected' ? 'loot and fragments lost.' : 'loot abandoned.', '#ff2a6d']];
    if (good && !lines.length) lines.push(['came back empty-handed.', DIM]);
    if (run.challenge) {
      const name = challengeById(run.challenge).name.toLowerCase();
      lines.unshift(run.challengeWon ? [`challenge complete: ${name}`, '#05d9e8'] : [`challenge not met: ${name}`, DIM]);
    }
    const job = run.contract?.settled;
    if (job === 'met') lines.unshift([`contract complete: +${contractPay(run.contract)}`, '#f9f002']);
    if (job === 'missed') lines.unshift(['contract not met. no harm done.', DIM]);
    lines.slice(0, 5).forEach(([s, c], i) => text(ctx, s, W / 2, 140 + i * 20, { size: 19, align: 'center', color: c }));
    text(ctx, '[ PRESS A ]', W / 2, 256, { size: 24, align: 'center', color: pal.main });
  }

  // The daily trace keeps nothing, so its card shows the route as it will be shared (daily.js) instead of loot.
  drawDailySummary(ctx, pal, exit) {
    const run = this.run;
    const t = run.tally ?? {};
    const reached = nodeById(run.map, run.pos)?.layer ?? 0;
    text(ctx, `layers ${reached}/${run.map.layerCount - 1}   ICE ${t.iceWon ?? 0}W ${t.iceLost ?? 0}L ${t.icePhased ?? 0}~`, W / 2, 86, { size: 20, align: 'center', color: '#c7f9ff' });
    const tail = exit ? [] : run.result === 'disconnected' ? ['!'] : run.result === 'aborted' ? ['.'] : [];
    text(ctx, [...(run.trail ?? []), ...tail].join(' '), W / 2, 124, { size: 22, align: 'center', color: exit ? pal.main : '#ff2a6d' });
    text(ctx, 'nothing kept, nothing lost.', W / 2, 160, { size: 19, align: 'center', color: DIM });
    text(ctx, 'the result is ready to share.', W / 2, 182, { size: 19, align: 'center', color: DIM });
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

// The marker a node draws as: a market shows which kind it is.
export const nodeKind = (n) => (n.type === 'market' && n.flavor === 'corp' ? 'exchange' : n.type);

export function drawNode(ctx, type, x, y, pal, spent) {
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
    case 'checkpoint':
      ctx.fillStyle = '#f9f002';
      ctx.fillRect(x - 8, y - 8, 16, 3);
      ctx.fillRect(x - 8, y + 5, 16, 3);
      ctx.fillRect(x - 2, y - 3, 4, 6);
      break;
    case 'exchange':
      // A corp storefront: the market's box in corp yellow, with a counter across it instead of a tab on top.
      ctx.strokeStyle = '#f9f002';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 8, y - 6, 16, 12);
      ctx.fillStyle = '#f9f002';
      ctx.fillRect(x - 8, y - 1, 16, 2);
      ctx.fillRect(x - 1, y - 10, 2, 4);
      break;
    case 'market':
      ctx.strokeStyle = '#b967ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 8, y - 6, 16, 12);
      ctx.fillStyle = '#b967ff';
      ctx.fillRect(x - 3, y - 10, 6, 4);
      break;
    case 'anomaly':
      ctx.font = "22px 'VT323', monospace";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('?', x, y);
      break;
    case 'exit':
      // A door: a frame, two panels and a knob.
      ctx.strokeStyle = '#f9f002';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 7, y - 10, 14, 20);
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 4, y - 7, 8, 6);
      ctx.strokeRect(x - 4, y + 1, 8, 6);
      ctx.fillStyle = '#f9f002';
      ctx.fillRect(x + 2, y - 1, 2, 2);
      break;
  }
  ctx.globalAlpha = 1;
}

