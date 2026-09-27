// Wardrobe cosmetics: shell, screen tint, screen effect. Purely visual, shared across generations.
// Each locked item shows only its hint; unlock checks read a progress context:
// { dex, codex, lineage, generation, progress: { streaks: { breach: { best } ... }, cleanJackouts, deepExits } }
import { FRAGMENTS } from './netrun/codex.js';

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

export const SLOTS = ['shell', 'tint', 'effect'];

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
    { id: 'amber', name: 'Amber', swatch: '#261a08', lcd: '#261a08', dark: '#0c0803', hint: 'three in a row, start to finish.', check: (c) => fullLifeStreak(c) >= 3 },
  ],
  effect: [
    { id: 'scanlines', name: 'Scanlines', free: true },
    { id: 'clean', name: 'Clean glass', free: true },
    { id: 'interlace', name: 'Interlace', hint: 'come home clean, again and again.', check: (c) => (c.progress.cleanJackouts ?? 0) >= 10 },
    { id: 'rain', name: 'Code rain', hint: 'an unbroken chain of breaches.', check: (c) => streak(c, 'breach') >= 10 },
    { id: 'bloom', name: 'Bloom', hint: 'slip every wall, ten times over.', check: (c) => streak(c, 'dodge') >= 10 },
    { id: 'curved', name: 'Deep curve', hint: 'hold the signal and never lose it.', check: (c) => streak(c, 'tune') >= 10 },
    { id: 'static', name: 'Static', hint: 'find the way back up from the bottom.', check: (c) => (c.progress.deepExits ?? 0) >= 1 },
  ],
};

export const DEFAULT_WARDROBE = { shell: 'standard', tint: 'teal', effect: 'scanlines' };

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
