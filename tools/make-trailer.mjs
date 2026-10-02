// Renders the trailer (about 64 s, 1080x1920 portrait, 30 fps, with the game's own sound) from the
// real app. It shows no more than a first life does: the baby and a teen, a first life's codex, and the
// endgame only as the corruption a first life sees (the corrupted sector, records and manual line).
// The evolution to an adult strobes and cuts away before the form settles, and the flatline card's
// fragment rows and the next generation's trait are hidden.
//
// Every scene is a fresh page on a fake clock (Playwright's page.clock) with a seeded Math.random,
// so the same build always renders the same trailer. Each frame is a screenshot taken after the
// clock steps 1/30 s. Sound: the page's AudioContext is swapped for an OfflineAudioContext on the
// same fake clock, so src/audio.js schedules its blips as usual and they are rendered afterwards.
//
// Usage: node tools/make-trailer.mjs
//   Needs Playwright (like npm run smoke) and an ffmpeg with libx264 and aac, found through the
//   FFMPEG environment variable or on PATH (pip install imageio-ffmpeg ships one).
//   OUT=path.mp4       where to write it (default trailer/netling-trailer.mp4, which git ignores)
//   SCENES=care,netrun only render these scenes (for previews; without the intro, whose netling
//                      later scenes copy, the colors differ from the full render)
//   STILLS=dir         also save every 15th frame as a PNG in dir, for checking shots
import { execSync, spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createScript, tick, CFG, MIN } from '../src/sim.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = process.env.OUT ?? join(root, 'trailer', 'netling-trailer.mp4');
const STILLS = process.env.STILLS ?? null;
const ONLY = process.env.SCENES ? new Set(process.env.SCENES.split(',')) : null;
const FFMPEG = process.env.FFMPEG ?? 'ffmpeg';

const FPS = 30;
const VIEW = { width: 360, height: 640 }; // CSS pixels; at 3x this is 1080x1920
const SCALE = 3;
const RATE = 48000;
const T0 = Date.UTC(2026, 3, 1, 15, 0); // mid-afternoon: every netling here is awake (bedtime 21:00)
const URL_TEXT = 'anthonyraborn.github.io/netling';

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    const globalRoot = execSync('npm root -g').toString().trim();
    return import(pathToFileURL(join(globalRoot, 'playwright', 'index.mjs')));
  }
}

// --- seeds ---

// The same seeded rng on every run, so quirks (and the netling's colors) never change between renders.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The netling the intro compiles; later scenes reuse its quirk so it keeps its colors throughout.
let quirk = null;

// A Bitling `ageMin` minutes old, awake, with no events rolled on the way, then given `patch`.
function bitling({ ageMin = 150, stats = {}, ...patch } = {}) {
  const save = createScript({ now: T0 - ageMin * MIN, rng: mulberry32(7) });
  if (quirk) save.quirk = { ...quirk };
  save.quirk.sleepOffset = 0;
  tick(save, T0, () => 0.999);
  Object.assign(save.stats, { charge: 80, sync: 76, integrity: 100, heat: 18 }, stats);
  return Object.assign(save, patch);
}

// Everything after the intro: onboarding finished, wearing the party hat the first run gives.
const settled = (save) => ({
  'netling.save': save,
  'netling.onboarding': 'done',
  'netling.helpSeen': true,
  'netling.accessories': ['partyhat'],
  'netling.wardrobe': { head: 'partyhat' },
});

// The same netling as a Kernel teen deep into its first life: its eight codex fragments found (a life's
// memory), the Public Net cleared, and raised loyal to the grid, so it grows into a Chrome.
const CODEX_FIRST_LIFE = ['public-1', 'public-2', 'public-3', 'public-4', 'corp-1', 'corp-2', 'corp-3', 'corp-4'];
const firstLife = () => ({
  ...settled(
    Object.assign(bitling(), {
      ageMin: 1500,
      stage: 'teen',
      form: 'kernel',
      teenForm: 'kernel',
      axes: { allegiance: 30, stability: 4 },
      codexFound: 8,
      cleared: ['public'],
    }),
  ),
  'netling.dex': ['bitling', 'kernel'],
  'netling.codex': CODEX_FIRST_LIFE,
});

// --- scenes ---
// at: [[seconds into the scene, action(page)]]. warmup: seconds that run before recording starts.
// captions and cards use trailer time (see TIMELINE below), so a caption can span a cut.

const click = (sel) => (page) => page.evaluate((s) => document.querySelector(s).click(), sel);
const key = (k) => (page) => page.keyboard.press(k);
// Runs fn(modules) in the page with the app's own modules (the same instances main.js uses).
const inPage = (fn) => (page) =>
  page.evaluate(`(async () => {
    const m = {
      app: await import('/src/ui/app.js'),
      life: await import('/src/ui/life.js'),
      sim: await import('/src/sim.js'),
    };
    (${fn})(m);
  })()`);

// Scrolls `sel` (or the page) so that `target` (a selector, or text it contains) sits mid-view, eased from
// `from` to `to` seconds into the scene. For a scene's per-frame hook.
const scrollTo = ({ sel = null, target, from = 0, to = 0 }) => (page, t) =>
  page.evaluate(
    ({ sel, target, k }) => {
      const box = sel ? document.querySelector(sel) : document.scrollingElement;
      const el = [...(sel ? box : document).querySelectorAll('*')].find((e) => (target.startsWith('text:') ? e.children.length === 0 && e.textContent.includes(target.slice(5)) : e.matches(target)));
      if (!box || !el) return;
      box.__start ??= box.scrollTop;
      const r = el.getBoundingClientRect();
      const view = sel ? box.getBoundingClientRect() : { top: 0, height: innerHeight };
      box.__end ??= box.scrollTop + r.top - view.top - (view.height - r.height) / 2;
      box.scrollTop = box.__start + (box.__end - box.__start) * k;
    },
    { sel, target, k: to > from ? (1 - Math.cos(Math.PI * Math.min(1, Math.max(0, (t - from) / (to - from))))) / 2 : 1 },
  );

// The card the game just made carries this page's address (localhost); show the public one, and redraw the QR code to
// match, so a viewer who scans it gets a working card.
const publicCard = (page) =>
  page.evaluate(async (base) => {
    const link = document.getElementById('card-link');
    const url = base + link.value.slice(link.value.indexOf('#'));
    link.value = url;
    const { encodeQR, drawQR } = await import('/src/qr.js');
    drawQR(document.getElementById('card-qr'), encodeQR(url), 4);
  }, `https://${URL_TEXT}/`);

// Skips the clock forward without simulating the gap (the dev EVO button's trick), then ticks.
const skipMinutes = (mins) =>
  inPage(`(m) => {
    const s = m.app.app.state;
    m.app.app.skew += ${mins} * m.sim.MIN;
    s.ageMin += ${mins} - 1;
    s.lastTick += (${mins} - 1) * m.sim.MIN;
    m.life.advance();
  }`);

// Netrun: point the cursor at the most plain next node (a data cache if there is one; never ICE, whose
// mini-game would take over the shot), or at the last option when a node offers a choice; `go` takes it.
const NODE_PREF = ['cache', 'relay', 'checkpoint', 'exit', 'anomaly', 'market'];
const aim = async (page) => {
  const rights = await page.evaluate(async (NODE_PREF) => {
    const { app } = await import('/src/ui/app.js');
    const view = app.session;
    if (!view?.run) return 0;
    if (view.run.phase === 'choice') return -1;
    const opts = view.options();
    const rank = (n) => (NODE_PREF.includes(n.type) ? NODE_PREF.indexOf(n.type) : 99);
    const target = opts.reduce((best, n, i) => (rank(n) < rank(opts[best]) ? i : best), 0);
    return (target - view.cursor + opts.length) % opts.length;
  }, NODE_PREF);
  if (rights < 0) return page.keyboard.press('ArrowLeft'); // the last option: LEAVE, or the safer one
  for (let i = 0; i < rights; i++) await page.keyboard.press('ArrowRight');
};
const go = key(' ');

// A mini-game played by a bot that reads the game each frame (see botStep), from its start through the
// lead-in, so the clip opens mid-game. `lead` is how long it plays before the clip starts.
function game(id, { duration = 1.5, lead = 0.4 } = {}) {
  return {
    name: id,
    duration,
    seed: () => settled(bitling()),
    warmup: [
      [0.1, click('#btn-play')],
      [0.2, click(`[data-game="${id}"]`)],
      [0.5, key(' ')], // past the title card
    ],
    warmupSeconds: 0.5 + lead,
    bot: playBot,
  };
}

const BOT_KEYS = { left: 'ArrowLeft', right: 'ArrowRight', a: ' ' };
const playBot = async (page) => {
  for (const k of await page.evaluate(botStep)) await page.keyboard.press(BOT_KEYS[k]);
};

// One frame of play, in the page: the keys to press now. Paced like a quick player (a press at most every
// BOT_GAP_MS, two at once only to get out of the way in Dodge), and it never presses at random.
async function botStep() {
  const session = (await import('/src/ui/app.js')).app.session;
  const BOT_GAP_MS = session?.id === 'breach' ? 200 : 120; // a puzzle reads better at a thinking pace
  const g = session?.game;
  if (!g || session.phase !== 'play' || g.done) return [];
  const now = performance.now();
  const bot = (window.__bot ??= { last: -Infinity });
  if (now - bot.last < BOT_GAP_MS) return [];
  const press = (...keys) => {
    if (keys.length) bot.last = now;
    return keys;
  };
  const toward = (from, to) => (to > from ? 'right' : 'left');

  if (session.id === 'breach') {
    // Plan once: the fewest picks, alternating row and column, that put the target in the buffer.
    if (!bot.plan) {
      const N = g.grid.length;
      const goal = g.target.join(' ');
      let limit;
      const search = (axis, index, used, buffer) => {
        if (buffer.join(' ').includes(goal)) return [];
        if (buffer.length >= limit) return null;
        for (let k = 0; k < N; k++) {
          const [r, c] = axis === 'row' ? [index, k] : [k, index];
          if (used.has(`${r},${c}`)) continue;
          const next = axis === 'row' ? ['col', c] : ['row', r];
          const rest = search(...next, new Set([...used, `${r},${c}`]), [...buffer, g.grid[r][c]]);
          if (rest) return [k, ...rest];
        }
        return null;
      };
      for (limit = g.target.length; limit <= 4 && !bot.plan; limit++) bot.plan = search(g.axis, g.index, g.used, g.buffer);
      bot.plan ??= [];
    }
    const want = bot.plan[0];
    if (want === undefined) return [];
    if (g.cursor !== want) {
      const n = g.grid.length;
      return press((want - g.cursor + n) % n <= n / 2 ? 'right' : 'left');
    }
    bot.plan.shift();
    return press('a');
  }

  if (session.id === 'dodge') {
    // A lane is safe if no firewall will be level with the packet in the next 0.45 s.
    const LANES = 5;
    const playerY = 280 - 44;
    const speed = 140 + 140 * Math.min(1, g.elapsed / 15);
    const safe = (lane, ahead) => !g.blocks.some((b) => b.lane === lane && b.y + 22 > playerY - speed * ahead && b.y < playerY + 18);
    if (safe(g.lane, 0.45)) return [];
    const options = [...Array(LANES).keys()].filter((l) => safe(l, 0.45)).sort((x, y) => Math.abs(x - g.lane) - Math.abs(y - g.lane));
    // Slide through lanes that are clear right now; the moves land in the same frame.
    const target = options.find((l) => {
      for (let x = g.lane; x !== l; x += Math.sign(l - g.lane)) if (!safe(x + Math.sign(l - g.lane), 0.05)) return false;
      return true;
    });
    if (target === undefined) return [];
    return press(...Array(Math.min(2, Math.abs(target - g.lane))).fill(toward(g.lane, target)));
  }

  if (session.id === 'tune') {
    // Lock when the waves all but match (the game allows 0.15).
    if (g.pause > 0) return [];
    return Math.abs(g.freq() - g.target) < 0.05 ? press('a') : [];
  }

  if (session.id === 'feast') {
    const LANES = 5;
    const playerY = 280 - 50;
    // A corrupted packet about to land rules its lane out; the clean packet that lands soonest, among
    // those it can reach in time with no corrupted one landing first in its lane, is the one to eat.
    const landsIn = (k) => (playerY - k.y) / k.speed;
    const bad = g.packets.filter((k) => !k.clean && landsIn(k) > -0.15);
    const danger = new Set(bad.filter((k) => landsIn(k) < 0.45).map((k) => k.lane));
    const food = g.packets
      .filter((k) => k.clean && landsIn(k) > Math.abs(k.lane - g.lane) * 0.14 && !danger.has(k.lane))
      .filter((k) => !bad.some((b) => b.lane === k.lane && landsIn(b) < landsIn(k) + 0.2))
      .sort((x, y) => landsIn(x) - landsIn(y))[0];
    let target = food?.lane ?? g.lane;
    if (danger.has(target) || (danger.has(g.lane) && target === g.lane)) {
      target = [...Array(LANES).keys()].filter((l) => !danger.has(l)).sort((x, y) => Math.abs(x - g.lane) - Math.abs(y - g.lane))[0] ?? g.lane;
    }
    if (target === g.lane) return [];
    const step = g.lane + Math.sign(target - g.lane);
    return danger.has(step) && step !== target ? [] : press(toward(g.lane, target));
  }
  return [];
}

const SCENES = [
  {
    name: 'intro',
    duration: 8.5,
    seed: () => ({ 'netling.onboarding': 'intro' }),
    noManual: true, // the field manual opens after the compile; the trailer stays on the netling
    at: [[5.0, click('#intro')]],
    after: async (page) => {
      quirk = await page.evaluate(async () => (await import('/src/ui/app.js')).app.state.quirk);
    },
  },
  {
    name: 'care',
    duration: 8,
    seed: () => settled(bitling({ stats: { charge: 22, sync: 58, integrity: 64, heat: 78 }, cache: 3, virus: true })),
    at: [
      [0.5, click('[data-act="corp"]')],
      [2.1, click('[data-act="patch"]')],
      [3.7, click('[data-act="cool"]')],
      [5.3, click('[data-act="purge"]')],
      [6.9, click('[data-act="scav"]')],
    ],
  },
  game('breach', { duration: 2, lead: 0 }), // the whole solve on camera
  game('dodge', { lead: 5 }), // later, when the firewalls come thick and fast
  game('tune', { duration: 2, lead: 0.6 }),
  game('feast', { lead: 4 }), // the screen full of packets
  {
    name: 'netrun',
    duration: 6,
    seed: () => settled(bitling({ stats: { charge: 90, sync: 80 } })),
    warmup: [[0.1, click('#btn-netrun')]],
    warmupSeconds: 0.3,
    at: [
      [0.7, click('#region-list button')],
      [1.6, aim],
      [2.0, go],
      [2.9, aim],
      [3.3, go],
      [4.2, aim],
      [4.6, go],
      [5.4, aim],
    ],
  },
  // Sharing: a visitor card, then a friend's netling dropping by. The friend is a Bitling in colors the trailer has not
  // shown, wearing common things, so it teases nothing a first life would not meet.
  {
    name: 'card',
    duration: 1.8,
    seed: () => settled(bitling()),
    warmup: [
      [0.1, click('#open-archive')],
      [0.2, click('#open-transfer')],
      [0.3, click('#card-make')],
      [0.35, publicCard],
    ],
    warmupSeconds: 0.5,
    frame: scrollTo({ sel: '#transfer .transfer-body', target: '#card-qr' }),
  },
  {
    name: 'visit',
    duration: 2.8,
    // A friend's card queued two hours ago is due: it drops by on the next minute.
    seed: () => settled(bitling({ friends: [{ id: '0badcafe', form: 'bitling', palette: 4, accessories: ['headphones', 'cursor'], gen: 3, deep: 0, root: false, below: 0, at: T0 - 120 * MIN }] })),
    warmupSeconds: 0.7, // past the screen's power-on
    at: [
      [0.3, skipMinutes(1)],
      [1.5, click('#wish-greet')],
    ],
  },
  // Depth: a first life's codex, the way down, and what stays corrupted. The corrupted names glitch every
  // BLINK_MS (3.2 s, ui/corrupt.js) from page load, so each warmup puts one glitch on camera.
  {
    name: 'codex',
    duration: 3.5,
    seed: firstLife,
    warmup: [
      [0.1, click('#open-archive')],
      [0.2, click('#tab-btn-codex')],
    ],
    warmupSeconds: 0.3,
    // From the Public Net's lore down to a corp memo, whose <<REDACTED>> glitches at 2.9 s.
    frame: scrollTo({ sel: '#tab-codex', target: '#tab-codex .corrupt', from: 0.3, to: 2.6 }),
  },
  {
    name: 'sector',
    duration: 3.5,
    seed: firstLife,
    warmup: [[0.1, click('#btn-netrun')]],
    warmupSeconds: 0.5, // a glitch at 2.7 s
    frame: scrollTo({ target: 'text:SECTOR CORRUPTED', from: 0.2, to: 2.2 }),
  },
  {
    name: 'dex',
    duration: 1.5,
    seed: firstLife,
    warmup: [
      [0.1, click('#open-archive')],
      [0.2, click('#tab-btn-dex')],
    ],
    warmupSeconds: 2.2, // a glitch at 1.0 s
    frame: scrollTo({ sel: '#tab-dex', target: '#tab-dex .corrupt' }),
  },
  {
    name: 'manual',
    duration: 1.5,
    seed: firstLife,
    warmup: [[0.1, click('#open-help')]],
    warmupSeconds: 2.2,
    frame: scrollTo({ sel: '#help-body', target: 'text:unrecoverable. for now.' }),
  },
  {
    name: 'evolve',
    duration: 3.7,
    seed: firstLife,
    hideReadout: true, // the readout and the status line would name the new form
    // Straight to the eve of adulthood. The strobe plays, and the shot cuts away before the new form settles.
    warmup: [[0.1, inPage(`(m) => { m.app.app.state.life.adultAt = m.app.app.state.ageMin + 2; }`)]],
    warmupSeconds: 0.2,
    at: [[1.0, skipMinutes(3)]], // the strobe starts; the card covers it 0.7 s in
  },
  {
    name: 'flatline',
    duration: 16.5,
    seed: () =>
      settled(bitling({ ageMin: 900, stats: { charge: 0, sync: 4, integrity: 0, heat: 40 }, integrityZeroMin: CFG.flatlineIntegrityMin - 1, careMistakes: 6 })),
    redactFragment: true,
    at: [
      [0.8, skipMinutes(2)],
      [4.6, click('#fl-next')],
      // The next generation, in other colors (never NL-0's) and the other common hat, as a teaser.
      [
        4.7,
        (page) =>
          inPage(`(m) => {
            const a = m.app.app;
            a.state.quirk.palette = ${(quirk?.palette ?? 3) === 1 ? 0 : 1};
            if (!a.ownedAccessories.includes('cap')) a.ownedAccessories.push('cap');
            a.wardrobe = { ...a.wardrobe, head: 'cap' }; // the party hat's slot
          }`)(page),
      ],
      [7.2, skipMinutes(CFG.bootMinutes + 1)], // the compile finishes on camera
    ],
  },
].filter((s) => !ONLY || ONLY.has(s.name));

// Trailer time at which each scene starts.
let clock = 0;
for (const s of SCENES) {
  s.start = clock;
  clock += s.duration;
}
const TOTAL = clock;
const sceneStart = (name) => SCENES.find((s) => s.name === name)?.start ?? NaN; // NaN: not rendered, so its cues never match

// Captions type out in the band at the top. [from, to, text], trailer seconds.
const TIMELINE = {
  captions: [
    [sceneStart('intro') + 0.6, sceneStart('intro') + 4.9, 'YOU RAN A SCRIPT\nBY ACCIDENT.'],
    [sceneStart('intro') + 5.4, sceneStart('care'), "IT'S ALIVE."],
    [sceneStart('care') + 0.3, sceneStart('care') + 2.0, 'KEEP IT CHARGED.'],
    [sceneStart('care') + 2.0, sceneStart('care') + 3.6, 'KEEP IT PATCHED.'],
    [sceneStart('care') + 3.6, sceneStart('care') + 5.2, 'KEEP IT COOL.'],
    [sceneStart('care') + 5.2, sceneStart('breach'), 'KEEP IT CLEAN.'],
    [sceneStart('breach'), sceneStart('netrun'), 'PLAY WITH IT.'],
    [sceneStart('netrun') + 0.2, sceneStart('card'), 'JACK IN.'],
    [sceneStart('card') + 0.1, sceneStart('visit'), 'SEND IT TO A FRIEND.'],
    [sceneStart('visit') + 0.2, sceneStart('codex'), 'THEIRS CAN VISIT YOURS.'],
    [sceneStart('codex') + 0.2, sceneStart('sector'), 'THERE IS A STORY HERE.'],
    [sceneStart('sector') + 0.1, sceneStart('dex'), 'SOMETHING IS DOWN THERE.'],
    [sceneStart('dex') + 0.1, sceneStart('evolve'), 'UNRECOVERABLE.\nFOR NOW.'],
    [sceneStart('evolve') + 0.1, sceneStart('evolve') + 1.7, 'IT GROWS UP.'],
    [sceneStart('flatline') + 0.3, sceneStart('flatline') + 2.6, 'IT WILL FLATLINE.'],
    [sceneStart('flatline') + 2.6, sceneStart('flatline') + 5.2, 'SOMETHING SURVIVES.'],
    [sceneStart('flatline') + 5.2, sceneStart('flatline') + 7.6, 'THE NEXT ONE COMPILES.'],
    [sceneStart('flatline') + 7.8, sceneStart('flatline') + 11.4, 'NO TWO ARE ALIKE.'],
  ],
  // Full-screen cards over the game. [from, to, kind]
  cards: [
    [sceneStart('evolve') + 1.7, sceneStart('evolve') + 3.7, 'evolve'],
    [sceneStart('flatline') + 11.6, TOTAL + 1, 'end'],
  ],
};

// --- the page side ---

// Runs before the app: seeds storage and Math.random, swaps in the recording AudioContext, and
// adds the trailer's layout and overlay.
function initScript(scene, seed) {
  const len = (scene.warmupSeconds ?? 0) + scene.duration + 6;
  return `(() => {
    const seed = ${JSON.stringify(seed)};
    for (const [k, v] of Object.entries(seed)) localStorage.setItem(k, JSON.stringify(v));
    let a = ${scene.start * 1000 + 17} >>> 0;
    Math.random = () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    // Sound before recording starts (t0) goes nowhere; after it, into the offline render. Every
    // context the page makes is recorded and mixed (sound effects, and any other player such as music).
    window.__t0 = Infinity;
    window.__audio = [];
    class TrailerAudio extends OfflineAudioContext {
      constructor() {
        super(1, Math.ceil(${RATE} * ${len}), ${RATE});
        this.muted = this.createGain();
        window.__audio.push(this);
      }
      get currentTime() { return Math.max(0, (performance.now() - window.__t0) / 1000); }
      get destination() { return performance.now() < window.__t0 ? this.muted : super.destination; }
      get state() { return 'running'; }
      resume() { return Promise.resolve(); }
    }
    window.AudioContext = TrailerAudio;
    ${scene.noManual ? 'HTMLDialogElement.prototype.showModal = function () {};' : ''}
    import('/src/audio.js').then((m) => m.unlockAudio());
    addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.textContent = ${JSON.stringify(TRAILER_CSS)};
      document.head.append(style);
      document.body.insertAdjacentHTML('beforeend', ${JSON.stringify(OVERLAY_HTML)});
    });
  })()`;
}

const TRAILER_CSS = `
  body { overflow: hidden; }
  .brand, .inventory, #log, #dev, #ios-hint, #update-bar, #status:empty { display: none !important; }
  .device { margin-top: 120px !important; }
  #tr-band { position: fixed; inset: 0 0 auto 0; height: 118px; background: linear-gradient(#07070c 80%, #07070c00); display: flex; align-items: center; justify-content: center;
    padding: 0 18px; text-align: center; font: 38px/1.05 'VT323', monospace; letter-spacing: 2px; color: #c7f9ff;
    text-shadow: 0 0 6px #05d9e8, 0 0 14px #05d9e8aa; z-index: 50; pointer-events: none; }
  #tr-band > span { white-space: pre-line; } /* a \n in a caption is a forced break */
  #tr-band .cur { color: #ff2a6d; text-shadow: 0 0 8px #ff2a6d; margin-left: 2px; }
  #tr-card { position: fixed; inset: 0; background: #07070c; z-index: 60; display: none; flex-direction: column;
    align-items: center; justify-content: center; gap: 18px; text-align: center; font-family: 'VT323', monospace; color: #c7f9ff; padding: 0 24px; }
  #tr-card .big { font-size: 40px; line-height: 1.1; letter-spacing: 2px; text-shadow: 0 0 6px #05d9e8, 0 0 14px #05d9e8aa; }
  #tr-card .logo { font-size: 72px; letter-spacing: 12px; color: #ff2a6d; text-shadow: 3px 0 #05d9e8, 0 0 18px #ff2a6daa; margin-right: -12px; }
  #tr-card .tag { font-size: 26px; color: #c7f9ff; }
  #tr-card .url { font-size: 24px; color: #05d9e8; text-shadow: 0 0 8px #05d9e8aa; margin-top: 18px; }
  #tr-card .small { font-size: 18px; color: #809fa6; position: absolute; bottom: 28px; left: 0; right: 0; }
  #tr-fade { position: fixed; inset: 0; background: #000; opacity: 0; z-index: 70; pointer-events: none; }
  #tr-band, #tr-card, #tr-fade { margin: 0; border: 0; width: 100%; overflow: hidden; }
  #tr-card, #tr-fade { height: 100%; }
  dialog.archive { margin-top: 122px; max-height: calc(100vh - 132px); } /* below the caption band */
`;
// Popovers, so the overlay can be raised above an open dialog (which sits in the browser's top layer).
const OVERLAY_HTML = '<div id="tr-band" popover="manual"></div><div id="tr-card" popover="manual"></div><div id="tr-fade" popover="manual"></div>';

const CARDS = {
  evolve: '<div class="big">WHAT IT BECOMES<br>IS UP TO YOU.</div>',
  end:
    '<div class="logo">NETLING</div><div class="tag">a virtual pet that lives in real time.<br>plays in your browser.</div>' +
    `<div class="url">${URL_TEXT}</div><div class="small">made with AI · details in the README</div>`,
};

// Draws the overlay for trailer time `t` and pins CSS animations to the fake clock. Runs in the page.
function drawOverlay({ first, t, sceneT, sceneLen, caption, card, cards, redact, fadeIn, fadeOut }) {
  const band = document.getElementById('tr-band');
  if (!band) return;
  // A dialog that opened since the last frame went into the top layer above the overlay: raise the overlay again.
  const dialogs = document.querySelectorAll('dialog[open]').length;
  if (dialogs !== window.__dialogs) {
    window.__dialogs = dialogs;
    for (const id of ['tr-band', 'tr-card', 'tr-fade']) {
      const el = document.getElementById(id);
      if (el.matches(':popover-open')) el.hidePopover();
      el.showPopover();
    }
  }
  if (caption) {
    const [from, , str] = caption;
    const shown = Math.min(str.length, Math.floor((t - from) * 32));
    const blinkOn = Math.floor(t * 2) % 2 === 0; // 1 Hz: far under the three-flashes-a-second limit
    const cursor = shown < str.length || blinkOn ? '<span class="cur">_</span>' : '<span class="cur" style="opacity:0">_</span>';
    // Text and cursor in one element, so the cursor follows the last letter when the caption wraps.
    const line = document.createElement('span');
    line.append(str.slice(0, shown));
    line.insertAdjacentHTML('beforeend', cursor);
    band.replaceChildren(line);
  } else band.textContent = '';

  const el = document.getElementById('tr-card');
  if (card) {
    if (el.dataset.kind !== card[2]) {
      el.dataset.kind = card[2];
      el.innerHTML = cards[card[2]];
    }
    el.style.display = 'flex';
    el.style.opacity = card[2] === 'end' ? String(Math.min(1, (t - card[0]) / 0.6)) : '1';
  } else el.style.display = 'none';

  // The fragment names forms and traits, which the player README keeps secret: corrupt it, in the
  // words the field manual uses for its own secret.
  if (redact) {
    for (const id of ['fl-echo', 'fl-trait']) {
      const dd = document.getElementById(id);
      if (dd) dd.textContent = '[sector corrupted]';
    }
    document.getElementById('readout').style.visibility = 'hidden'; // the next generation's trait
    document.getElementById('status').style.visibility = 'hidden'; // its keepsake notice shows through the card
  }

  // Fades at scene edges (seconds).
  let o = 0;
  if (fadeIn) o = Math.max(o, 1 - sceneT / fadeIn);
  if (fadeOut) o = Math.max(o, 1 - (sceneLen - sceneT) / fadeOut);
  document.getElementById('tr-fade').style.opacity = String(Math.min(1, Math.max(0, o)));

  // CSS animations run on the real clock; pin each to the fake one from when it first appeared.
  const now = performance.now();
  window.__animSeen ??= new WeakMap();
  for (const a of document.getAnimations()) {
    // Ones already running when recording starts (the CRT power-on, say) began at page load.
    if (!window.__animSeen.has(a)) window.__animSeen.set(a, first ? 0 : now);
    a.pause();
    a.currentTime = now - window.__animSeen.get(a);
  }
}

// Soft transitions between the big beats; the mini-game montage hard-cuts.
const FADES = { intro: [0.4, 0.25], care: [0.25, 0.2], breach: [0.2, 0], netrun: [0.2, 0.2], card: [0.2, 0], visit: [0, 0.2], codex: [0.2, 0.15], sector: [0.15, 0], evolve: [0.2, 0], flatline: [0.2, 0.6] };

// --- recording ---

function startServer() {
  const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
  const server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^[/\\]+/, '') || 'index.html';
    if (path.startsWith('..')) return res.writeHead(403).end();
    try {
      const body = await readFile(join(root, path));
      res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' }).end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

function ffmpeg(args) {
  const proc = spawn(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((resolve, reject) => {
    proc.on('error', (err) => reject(new Error(`could not run ffmpeg (${FFMPEG}): ${err.message}. Set FFMPEG to its path.`)));
    proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`))));
  });
  return { stdin: proc.stdin, done };
}

// Steps the fake clock to `ms` (since the page loaded), running any actions due on the way.
async function runTo(page, state, ms, actions) {
  while (actions.length && actions[0][0] * 1000 <= ms) {
    const [at, action] = actions.shift();
    if (at * 1000 > state.ms) {
      await page.clock.runFor(Math.round(at * 1000 - state.ms));
      state.ms = Math.round(at * 1000);
    }
    await action(page);
  }
  if (ms > state.ms) {
    await page.clock.runFor(ms - state.ms);
    state.ms = ms;
  }
}

async function recordScene(browser, scene, video, frameIndex) {
  const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: SCALE, serviceWorkers: 'block', timezoneId: 'UTC', reducedMotion: 'no-preference' });
  // The page's own music is off: it would restart at every cut. The bed below replaces it.
  await ctx.addInitScript(initScript(scene, { 'netling.prefs': { musicVolume: 0 }, ...scene.seed() }));
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  // Paused, so the page's time only moves when runTo steps it.
  await page.clock.install({ time: T0 });
  await page.clock.pauseAt(T0);
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);

  // Warmup: open the game or menu off camera, then start recording (and the sound) from here.
  const clockState = { ms: 0 };
  const warm = (scene.warmupSeconds ?? 0) * 1000;
  const warmActions = [...(scene.warmup ?? [])];
  if (scene.bot) {
    // A bot plays through the warmup too, a frame at a time.
    for (let ms = 0; ms < warm; ms += 1000 / FPS) {
      await runTo(page, clockState, Math.round(ms), warmActions);
      await scene.bot(page);
    }
  }
  await runTo(page, clockState, Math.round(warm), warmActions);
  await page.evaluate(() => (window.__t0 = performance.now()));

  const actions = (scene.at ?? []).map(([t, fn]) => [t + warm / 1000, fn]).sort((x, y) => x[0] - y[0]);
  const frames = Math.round(scene.duration * FPS);
  const [fadeIn, fadeOut] = FADES[scene.name] ?? [0, 0];
  for (let f = 0; f < frames; f++) {
    const sceneT = f / FPS;
    if (scene.hideReadout) await page.evaluate(() => ['readout', 'status'].forEach((id) => (document.getElementById(id).style.visibility = 'hidden')));
    await runTo(page, clockState, Math.round(warm + (f * 1000) / FPS), actions);
    await scene.frame?.(page, sceneT);
    await scene.bot?.(page);
    const t = scene.start + sceneT;
    await page.evaluate(drawOverlay, {
      first: f === 0,
      t,
      sceneT,
      sceneLen: scene.duration,
      caption: TIMELINE.captions.find(([a, b]) => t >= a && t < b) ?? null,
      card: TIMELINE.cards.find(([a, b]) => t >= a && t < b) ?? null,
      cards: CARDS,
      redact: Boolean(scene.redactFragment),
      fadeIn,
      fadeOut,
    });
    const png = await page.screenshot({ type: 'png' });
    video.stdin.write(png);
    if (STILLS && (frameIndex + f) % 15 === 0) writeFileSync(join(STILLS, `${String(frameIndex + f).padStart(4, '0')}-${scene.name}.png`), png);
  }
  await runTo(page, clockState, Math.round(warm + (frames * 1000) / FPS), actions);
  await scene.after?.(page);

  // The scene's sound, exactly as long as its frames, as 16-bit samples.
  const samples = Math.round((frames / FPS) * RATE);
  const b64 = await page.evaluate(async (n) => {
    const mix = new Float32Array(n);
    for (const ctx of window.__audio) {
      const data = (await ctx.startRendering()).getChannelData(0);
      for (let i = 0; i < n && i < data.length; i++) mix[i] += data[i];
    }
    const out = new Int16Array(n);
    for (let i = 0; i < n; i++) out[i] = Math.max(-1, Math.min(1, mix[i])) * 32767;
    let s = '';
    const bytes = new Uint8Array(out.buffer);
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(s);
  }, samples);
  await ctx.close();
  if (errors.length) console.warn(`  page errors in ${scene.name}: ${errors.join('; ')}`);
  return { frames, pcm: Buffer.from(b64, 'base64') };
}

function wav(pcm) {
  const head = Buffer.alloc(44);
  head.write('RIFF', 0);
  head.writeUInt32LE(36 + pcm.length, 4);
  head.write('WAVEfmt ', 8);
  head.writeUInt32LE(16, 16);
  head.writeUInt16LE(1, 20); // PCM
  head.writeUInt16LE(1, 22); // mono
  head.writeUInt32LE(RATE, 24);
  head.writeUInt32LE(RATE * 2, 28);
  head.writeUInt16LE(2, 32);
  head.writeUInt16LE(16, 34);
  head.write('data', 36);
  head.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([head, pcm]);
}

// --- the music bed ---
// One continuous take of the game's music (src/music.js renderMusic), following the game's rules
// (docs/MUSIC.md) on the trailer's timeline: silent until the first tap, the home track (30% quieter
// in mini-games), the netrun theme on the run, the home track picking up where it left off, a dip
// under the evolve jingle, a 2 s fade at the flatline, silence while compiling, and the home track
// again once the next netling is online: Night drive, which its generation unlocks. Only for a full
// render: previews stay effects-only.

const MUSIC_VOLUME = 0.4; // the game's default MUSIC slider
const MUSIC_DB = Number(process.env.MUSIC_DB ?? 4); // over the game's own level, which sits well under effects

function musicPlan() {
  if (ONLY) return null;
  const on = sceneStart('intro') + 5.0; // the tap that compiles the first netling
  const run = sceneStart('netrun');
  const back = sceneStart('card'); // home again after the run
  const depth = sceneStart('sector'); // the corrupted shots, until the evolution
  const evolve = sceneStart('evolve');
  const flat = sceneStart('flatline');
  const flatlineAt = flat + 0.8;
  const hatch = flat + 7.2;
  const first = run - on; // the home track's first stretch
  // The run is six seconds: skip the netrun theme's sparse first four bars (110 BPM) to its full
  // section, and lift it to the home track's loudness (it is mixed quieter in the game).
  const runFrom = (4 * 4 * 60) / 110;
  return {
    // render, where in it to start, trailer time, length, and a level change in dB
    takes: [
      { render: 'home', from: 0, at: on, len: first },
      { render: 'run', from: runFrom, at: run, len: back - run, db: 4 },
      { render: 'home', from: first, at: back, len: flatlineAt + 2 - back },
      { render: 'next', from: 0, at: hatch, len: TOTAL - hatch, db: 2 }, // Night drive sits about 2 dB under idle
    ],
    renders: {
      home: { track: 'idle', seed: 7, seconds: first + (flatlineAt + 2 - back) + 1 },
      run: { track: 'netrun', region: 'public', seed: 7, seconds: runFrom + back - run + 1 },
      next: { track: 'nightdrive', seed: 8, seconds: TOTAL - hatch + 1 }, // the track generation 2 unlocks
    },
    // Gain over trailer time: [from, to, level], eased over 0.3 s at each change.
    levels: [
      [sceneStart('breach'), run, 0.7],
      [depth, evolve, 0.55], // quieter under the corruption
      [evolve + 1.0, evolve + 3.4, 0.3], // under the evolve jingle
    ],
    fadeOut: [flatlineAt, flatlineAt + 2],
    end: TOTAL - 1.5,
  };
}

async function renderMusicBed(browser) {
  const plan = musicPlan();
  if (!plan) return null;
  const page = await browser.newPage();
  await page.goto(url.replace('index.html', 'blank')); // a 404 on this server is enough to import its modules
  const renders = {};
  for (const [name, job] of Object.entries(plan.renders)) {
    const b64 = await page.evaluate(
      async ({ job, RATE, volume }) => {
        const { renderMusic, MUSIC_LEVEL } = await import('/src/music.js');
        const ctx = new OfflineAudioContext(1, Math.ceil((job.seconds + 1.5) * RATE), RATE);
        renderMusic(ctx, { ...job, level: MUSIC_LEVEL * volume });
        const data = (await ctx.startRendering()).getChannelData(0);
        const bytes = new Uint8Array(data.buffer);
        let s = '';
        for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
        return btoa(s);
      },
      { job, RATE, volume: MUSIC_VOLUME },
    );
    const buf = Buffer.from(b64, 'base64');
    renders[name] = new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length));
  }
  await page.close();

  const n = Math.round(TOTAL * RATE);
  const bed = new Float32Array(n);
  const XFADE = 0.4; // like the game's crossfade between tracks
  for (const take of plan.takes) {
    const src = renders[take.render];
    const start = Math.round(take.at * RATE);
    const len = Math.round(take.len * RATE);
    const fade = Math.round((XFADE / 2) * RATE);
    const g = 10 ** ((take.db ?? 0) / 20);
    for (let i = 0; i < len && start + i < n; i++) {
      const edge = Math.min(1, i / fade, (len - i) / fade);
      bed[start + i] += (src[Math.round(take.from * RATE) + i] ?? 0) * edge * g;
    }
  }
  const gain = 10 ** (MUSIC_DB / 20);
  const ease = (x) => Math.min(1, Math.max(0, x / 0.3));
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    let g = gain;
    for (const [from, to, level] of plan.levels) g *= 1 - (1 - level) * Math.min(ease(t - from), ease(to - t));
    const [f0, f1] = plan.fadeOut;
    if (t > f0 && t < f1) g *= 1 - (t - f0) / (f1 - f0);
    if (t > plan.end) g *= Math.max(0, 1 - (t - plan.end) / 1.5);
    bed[i] *= g;
  }
  return bed;
}

// Effects (16-bit, from the scenes) plus the bed, as 16-bit PCM.
function mixdown(effects, bed) {
  if (!bed) return effects;
  const fx = new Int16Array(effects.buffer.slice(effects.byteOffset, effects.byteOffset + effects.length));
  const out = new Int16Array(fx.length);
  for (let i = 0; i < fx.length; i++) out[i] = Math.max(-32768, Math.min(32767, Math.round(fx[i] + (bed[i] ?? 0) * 32767)));
  return Buffer.from(out.buffer);
}

const { chromium } = await loadPlaywright();
const server = await startServer();
const url = `http://localhost:${server.address().port}/index.html`;
mkdirSync(dirname(OUT), { recursive: true });
if (STILLS) mkdirSync(STILLS, { recursive: true });

const silent = `${OUT}.video.mp4`;
const video = ffmpeg(['-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-tune', 'animation', '-pix_fmt', 'yuv420p', silent]);
const browser = await chromium.launch();
const pcm = [];
let frameIndex = 0;
let bed = null;
try {
  bed = await renderMusicBed(browser);
  for (const scene of SCENES) {
    const started = Date.now();
    const res = await recordScene(browser, scene, video, frameIndex);
    frameIndex += res.frames;
    pcm.push(res.pcm);
    console.log(`${scene.name.padEnd(9)} ${scene.duration}s ${res.frames} frames (${((Date.now() - started) / 1000).toFixed(0)}s)`);
  }
} finally {
  video.stdin.end();
  await browser.close();
  server.close();
}
await video.done;

const audio = `${OUT}.wav`;
writeFileSync(audio, wav(mixdown(Buffer.concat(pcm), bed)));
await ffmpeg(['-i', silent, '-i', audio, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-af', 'loudnorm=I=-16:TP=-1.5', '-ar', String(RATE), '-movflags', '+faststart', '-shortest', OUT]).done;
rmSync(silent);
rmSync(audio);
console.log(`${OUT}: ${TOTAL.toFixed(1)}s, ${VIEW.width * SCALE}x${VIEW.height * SCALE}, ${FPS} fps`);
