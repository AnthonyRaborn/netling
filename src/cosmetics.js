// Wardrobe cosmetics: shell, screen tint, screen effect, sound pack and crest. Purely visual, shared across generations.
// Each locked item shows only its hint; unlock checks read a progress context:
// { dex, codex, lineage, generation, progress: { streaks: { breach: { best } ... }, cleanJackouts, deepExits } }
import { FRAGMENTS } from './netrun/codex.js';
import { FORMS, TRAITS, TRAIT_CFG } from './sim.js';
import { CHATTER_GROUPS, chatterProgress } from './chatter.js';

const regionDone = (ctx, region) => FRAGMENTS.filter((f) => f.region === region).every((f) => ctx.codex.includes(f.id));
const fullLives = (ctx) => ctx.lineage.filter((e) => e.cause === 'end of life cycle').length;
function fullLifeStreak(ctx) {
  let best = 0;
  let cur = 0;
  for (const e of ctx.lineage) {
    cur = e.cause === 'end of life cycle' ? cur + 1 : 0;
    best = Math.max(best, cur);
  }
  return best;
}
const streak = (ctx, game) => ctx.progress.streaks?.[game]?.best ?? 0;
const acts = (ctx, ...names) => names.reduce((n, a) => n + (ctx.progress.acts?.[a] ?? 0), 0);

// Attention rewards (docs/ATTENTION_PLAN.md). ctx.flowMin is every life's time in flow, the living one's included.
export const ATTENTION = {
  requests: 25,
  greetings: 10,
  flowHours: 24,
  groupHeard: (ctx) => {
    const prog = chatterProgress(ctx.progress.chatter ?? []);
    return CHATTER_GROUPS.some((g) => prog[g.id].total > 0 && prog[g.id].heard === prog[g.id].total);
  },
};

// Legacy goals: read from the lineage records, in the order the generations ended.
// A full life NL-0 never had to pull back.
function unbrokenStreak(ctx) {
  let best = 0;
  let cur = 0;
  for (const e of ctx.lineage) {
    cur = e.cause === 'end of life cycle' && !e.rescued ? cur + 1 : 0;
    best = Math.max(best, cur);
  }
  return best;
}
export const LEGACY = {
  unbroken: 5,
  traitsHeld: (ctx) => new Set(ctx.lineage.map((e) => e.trait).filter((t) => TRAITS[t])).size,
  // A level III trait was held, or passed on: the same form three generations running.
  levelThree: (ctx) => ctx.lineage.some((e) => (e.traitLevel ?? 1) >= TRAIT_CFG.maxLevel || (e.fragmentLevel ?? 1) >= TRAIT_CFG.maxLevel),
  // Adult forms raised to adulthood in this line (not the dex, which counts any line on this device).
  adultsRaised: (ctx) => new Set(ctx.lineage.filter((e) => e.realized && FORMS[e.form]).map((e) => e.form)).size,
  unbrokenStreak,
};

export const SLOTS = ['shell', 'tint', 'effect', 'sound', 'crest'];

export const COSMETICS = {
  shell: [
    { id: 'standard', name: 'Standard issue', swatch: '#14121f', free: true },
    { id: 'matte', name: 'Matte black', swatch: '#0b0b0e', hint: 'keep the line going.', check: (c) => c.generation >= 3 },
    { id: 'chrome', name: 'Brushed chrome', swatch: '#8a93a3', hint: 'raise one loyal to the grid.', check: (c) => c.dex.includes('chrome') },
    { id: 'brick', name: 'Firewall brick', swatch: '#5a1f2a', hint: 'raise one that trusts nothing upstream.', check: (c) => c.dex.includes('firewall') },
    { id: 'crimson', name: 'Daemon red', swatch: '#3a0a12', hint: 'raise one that never misses a cycle.', check: (c) => c.dex.includes('daemon') },
    { id: 'shifted', name: 'Glitch shift', swatch: '#1a3a4a', hint: 'raise one that lives on the edge.', check: (c) => c.dex.includes('glitch') },
    { id: 'clear', name: 'Ghost clear', swatch: 'rgba(200,200,255,0.25)', hint: 'raise the one nobody sees.', check: (c) => c.dex.includes('ghost') },
    { id: 'gold', name: 'Corp gold', swatch: '#b8912a', hint: 'earn something from below.', check: (c) => FRAGMENTS.every((f) => c.codex.includes(f.id)) },
    { id: 'holo', name: 'Holographic', swatch: 'linear-gradient(135deg,#ff2a6d,#05d9e8,#f9f002)', hint: 'see five lives through to the end.', check: (c) => fullLives(c) >= 5 },
  ],
  tint: [
    { id: 'teal', name: 'Classic teal', swatch: '#0b2226', lcd: '#0b2226', dark: '#03090a', free: true },
    { id: 'ice', name: 'Ice', swatch: '#0d2233', lcd: '#0d2233', dark: '#040a10', hint: 'hear everything the public net has to say.', check: (c) => regionDone(c, 'public') },
    { id: 'grid', name: 'Grid yellow', swatch: '#1f1d0a', lcd: '#1f1d0a', dark: '#0a0903', hint: 'read the whole employee file.', check: (c) => regionDone(c, 'corp') },
    { id: 'violet', name: 'Bazaar violet', swatch: '#1a0d26', lcd: '#1a0d26', dark: '#08040c', hint: 'hear every rumor in the market.', check: (c) => regionDone(c, 'bazaar') },
    { id: 'phosphor', name: 'Green phosphor', swatch: '#0a1f0d', lcd: '#0a1f0d', dark: '#030a04', hint: 'learn what the ruins remember.', check: (c) => regionDone(c, 'ruins') },
    { id: 'abyss', name: 'Abyss', swatch: '#08081a', lcd: '#08081a', dark: '#020206', hint: 'listen to the bottom of the net.', check: (c) => regionDone(c, 'deep') },
    { id: 'guest', name: 'Guest pink', swatch: '#260d1c', lcd: '#260d1c', dark: '#0c0409', hint: 'say hello to whoever drops by, ten times.', check: (c) => (c.progress.visitorsGreeted ?? 0) >= ATTENTION.greetings },
    { id: 'amber', name: 'Amber', swatch: '#261a08', lcd: '#261a08', dark: '#0c0803', hint: 'three in a row, start to finish.', check: (c) => fullLifeStreak(c) >= 3 },
  ],
  effect: [
    { id: 'scanlines', name: 'Scanlines', free: true },
    { id: 'clean', name: 'Clean glass', free: true },
    { id: 'interlace', name: 'Interlace', hint: 'come home clean, again and again.', check: (c) => (c.progress.cleanJackouts ?? 0) >= 10 },
    { id: 'rain', name: 'Code rain', hint: 'an unbroken chain of breaches.', check: (c) => streak(c, 'breach') >= 10 },
    { id: 'bloom', name: 'Bloom', hint: 'slip every wall, ten times over.', check: (c) => streak(c, 'dodge') >= 10 },
    { id: 'curved', name: 'Deep curve', hint: 'hold the signal and never lose it.', check: (c) => streak(c, 'tune') >= 10 },
    { id: 'packets', name: 'Packet rain', hint: 'ten clean feasts without a bad bite.', check: (c) => streak(c, 'feast') >= 10 },
    { id: 'aurora', name: 'Aurora', hint: 'keep it well for a whole day, a few hours at a time.', check: (c) => (c.flowMin ?? 0) >= ATTENTION.flowHours * 60 },
    { id: 'static', name: 'Static', hint: 'find the way back up from the bottom.', check: (c) => (c.progress.deepExits ?? 0) >= 1 },
  ],
  // Home sounds only; netruns keep each region's own voice.
  sound: [
    { id: 'beep', name: 'Beep', wave: 'square', mult: 1, free: true },
    { id: 'soft', name: 'Soft', wave: 'sine', mult: 1, free: true },
    { id: 'bass', name: '8-bit bass', wave: 'square', mult: 0.5, hint: 'a hundred meals.', check: (c) => acts(c, 'corp', 'scav') >= 100 },
    { id: 'glass', name: 'Glass', wave: 'sine', mult: 2, hint: 'catch it before it spreads, twenty times.', check: (c) => acts(c, 'patch') >= 20 },
    { id: 'chime', name: 'Chime', wave: 'triangle', mult: 1.25, hint: 'answer when they call, ten times.', check: (c) => acts(c, 'comply') >= 10 },
    { id: 'buzz', name: 'Buzz', wave: 'sawtooth', mult: 0.9, hint: 'vanish when they call, ten times.', check: (c) => acts(c, 'hide') >= 10 },
    // gamesPlayed counts PLAY games and netrun ICE fights; streaks (above) count PLAY games only.
    { id: 'purr', name: 'Purr', wave: 'sine', mult: 0.6, hint: 'give it what it asks for, twenty-five times.', check: (c) => (c.progress.requestsMet ?? 0) >= ATTENTION.requests },
    { id: 'arcade', name: 'Arcade', wave: 'triangle', mult: 0.75, hint: 'fifty games, win or lose.', check: (c) => (c.progress.gamesPlayed ?? 0) >= 50 },
  ],
  // A pixel emblem beside the device label, earned by the line itself. `pixels`: '#' lit, '.' dark.
  crest: [
    { id: 'none', name: 'No crest', free: true },
    {
      id: 'helix',
      name: 'Helix',
      hint: 'inherit every trait there is, once.',
      check: (c) => LEGACY.traitsHeld(c) >= Object.keys(TRAITS).length,
      pixels: ['.#.....#.', '..#.#.#..', '...#.#...', '....#....', '...#.#...', '..#.#.#..', '.#.....#.', '..#.#.#..', '...#.#...'],
    },
    {
      id: 'triad',
      name: 'Triad',
      hint: 'the same shape, three times running.',
      check: (c) => LEGACY.levelThree(c),
      pixels: ['....#....', '...#.#...', '..#...#..', '....#....', '...#.#...', '..#...#..', '....#....', '...#.#...', '..#...#..'],
    },
    {
      id: 'loop',
      name: 'Closed loop',
      hint: 'five whole lives in a row, nobody pulled back.',
      check: (c) => LEGACY.unbrokenStreak(c) >= LEGACY.unbroken,
      pixels: ['...###...', '..#...#..', '.#.....#.', '#.......#', '#...#...#', '#.......#', '.#.....#.', '..#...#..', '...###...'],
    },
    {
      id: 'star',
      name: 'Full house',
      hint: 'raise every grown shape in one line.',
      check: (c) => LEGACY.adultsRaised(c) >= Object.keys(FORMS).length,
      pixels: ['....#....', '....#....', '...###...', '#########', '.#######.', '..#####..', '..##.##..', '.##...##.', '.#.....#.'],
    },
    {
      id: 'speech',
      name: 'Speech mark',
      hint: 'hear everything one kind of netling has to say.',
      check: (c) => ATTENTION.groupHeard(c),
      pixels: ['.........', '.#######.', '#.......#', '#.#.#.#.#', '#.......#', '.#######.', '..#......', '.#.......', '.........'],
    },
  ],
};

// The device label: naming the line is earned by losing the first netling.
export const LABEL = {
  max: 10,
  fallback: 'NETLING',
  hint: 'lose one before you name the line.',
  check: (c) => c.lineage.length >= 1,
};

export function sanitizeLabel(raw) {
  const clean = String(raw ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9 .\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, LABEL.max);
  return clean || LABEL.fallback;
}

export const DEFAULT_WARDROBE = { shell: 'standard', tint: 'teal', effect: 'scanlines', sound: 'beep', crest: 'none' };

export const cosmeticById = (slot, id) => COSMETICS[slot].find((c) => c.id === id);

export function unlockedIds(ctx) {
  const out = [];
  for (const slot of SLOTS) {
    for (const c of COSMETICS[slot]) if (c.free || c.check(ctx)) out.push(`${slot}:${c.id}`);
  }
  return out;
}

// Equipped ids fall back to defaults if something is locked or unknown.
export function resolveWardrobe(equipped, unlocked) {
  const out = {};
  for (const slot of SLOTS) {
    const id = equipped?.[slot];
    out[slot] = id && cosmeticById(slot, id) && unlocked.includes(`${slot}:${id}`) ? id : DEFAULT_WARDROBE[slot];
  }
  return out;
}

// Mini-game streaks, per game. Returns the updated streaks object.
export function recordGame(streaks = {}, game, won) {
  const s = streaks[game] ?? { cur: 0, best: 0 };
  const cur = won ? s.cur + 1 : 0;
  return { ...streaks, [game]: { cur, best: Math.max(s.best, cur) } };
}
