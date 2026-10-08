// The other two temper tell channels: idle behavior and chatter tone (docs/NETLING_2_SKETCH.md, The temper tell). Pure
// functions of (egg, level, time or text, seed), like tell.js, so they need no state and survive reloads. Nothing here
// touches the DOM, storage or the 1.0 simulator.
//
// Levels are tell.js's: -2 strongly unsteady, -1 unsteady, 0 middle (no tell), +1 steady, +2 strongly steady.
//
// What this proves and what it does not. It fixes a SHAPE for each channel that a player can count (steady) or cannot
// predict (unsteady), and tests that the shape holds. It does not render anything (no pose, no status line, no chatter box
// is drawn), and the chatter shaping is a text transform on 1.0's lines, so it is a measuring aid: the shipped 2.0 lines
// for body-bound chatter would be written by hand in these shapes. See docs/NETLING_2_CODEX_DRAFTS.md (Temper hints).
//
// Idle behavior. Middle: none (the 1.0 idle). Steady: a ROUTINE, the same four steps in the same order, each step on an exact
// clock, so the cycle can be counted and the next step predicted (a step every 12 s steady, every 6 s strongly: the same
// halving as the sprite beat). Unsteady: no routine; STRAYS, actions that are not in the routine, start at random times and
// are dropped partway. Mild strays are rarer; strong ones come almost every window.
// Flash budget (CLAUDE.md rule 7): every action lasts at least FLASH_TOGGLE_MS (in fact over a second), so the picture
// cannot change more than three times a second whatever the level.
//
// Chatter tone. 1.0 shows one line every few hours (chatterChancePerHour 0.15), so a gap between lines is far too long to
// time. The tone therefore lives INSIDE a line, in a shape the player can count:
//   program   steady: beats of fixed word count, " / " between them (4 words a beat, 2 strongly).
//             unsteady: clipped (how much varies with the seed); strongly, clipped and said twice.
//   iron      steady: a checklist, three numbered items then "ok." (strongly, "ok" after every item).
//             unsteady: a fault bell: the first few words in capitals, "!" (strongly, prefixed FAULT).
//   wetware   steady: a pause "..." after every third word (every second strongly).
//             unsteady: bursts that start mid thought: "-- " then the tail, strongly with the head after, as if answering.
import { FLASH_TOGGLE_MS } from '../../src/games/common.js';

export const SLOT_MS = FLASH_TOGGLE_MS;
export const EGGS = ['iron', 'program', 'wetware'];

const hash = (n) => {
  const h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b) >>> 0;
  return (Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) >>> 0) / 4294967296;
};

// --- idle behavior -----------------------------------------------------------------------------------------------------------

// The routine is four steps for every egg, so the count is the same everywhere (the player counts steps, not words).
export const ROUTINE = {
  program: ['scan', 'sort', 'flush', 'sync'],
  iron: ['neck', 'arm', 'hip', 'base'], // a joint-by-joint self check
  wetware: ['stretch', 'rest', 'stretch', 'rest'],
};
// Never in the routine, so a stray is always recognisable as unscheduled.
export const STRAYS = {
  program: ['probe', 'fork', 'loop', 'spawn'],
  iron: ['port', 'relay', 'fan', 'lamp'],
  wetware: ['sniff', 'twist', 'curl', 'tap'],
};

export const STEP_MS = { 1: 12_000, 2: 6_000 };
export const ACTIVE_FRACTION = 0.5; // each routine step acts for the first half of its slot, then the netling is still
const STRAY_WINDOW_MS = { '-1': 10_000, '-2': 5_000 };
const STRAY_CHANCE = { '-1': 0.35, '-2': 0.7 };
const STRAY_MIN_MS = 2500;
const STRAY_SPAN_MS = 1500; // a stray lasts 2.5 to 4 s
const STRAY_MAX_MS = STRAY_MIN_MS + STRAY_SPAN_MS;

// -> null (nothing happening) or { action, scheduled, progress (0 to 1 through the action), aborted, step }.
// `step` is the routine position for a scheduled action, so a test (or a status line) can count it.
export function idleBehavior({ egg, level, time, seed = 0 }) {
  if (level === 0) return null;
  if (level > 0) {
    const stepMs = STEP_MS[level];
    const routine = ROUTINE[egg];
    const at = Math.floor(time / stepMs);
    const into = time % stepMs;
    if (into >= stepMs * ACTIVE_FRACTION) return null;
    // Steady ignores the seed on purpose: it is predictable.
    return { action: routine[at % routine.length], scheduled: true, progress: into / (stepMs * ACTIVE_FRACTION), aborted: false, step: at % routine.length };
  }
  const window = STRAY_WINDOW_MS[level];
  const w = Math.floor(time / window);
  if (hash(w * 41 + seed) >= STRAY_CHANCE[level]) return null;
  const length = STRAY_MIN_MS + Math.floor(hash(w * 43 + seed) * STRAY_SPAN_MS);
  const start = w * window + Math.floor(hash(w * 47 + seed) * (window - STRAY_MAX_MS));
  const abortAt = 0.5 + 0.3 * hash(w * 53 + seed); // dropped partway: the stray never finishes
  const shown = length * abortAt;
  const into = time - start;
  if (into < 0 || into >= shown) return null;
  const strays = STRAYS[egg];
  return { action: strays[Math.floor(hash(w * 59 + seed) * strays.length)], scheduled: false, progress: into / length, aborted: true, step: -1 };
}

// --- chatter tone ------------------------------------------------------------------------------------------------------------

export const PROGRAM_BEAT = { 1: 4, 2: 2 }; // words per beat
export const WETWARE_PAUSE = { 1: 3, 2: 2 }; // words between pauses
export const IRON_ITEMS = 3;

const words = (text) => text.split(/\s+/).filter(Boolean);
const chunk = (list, size) => {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
};

function steadyTone(egg, level, w) {
  if (egg === 'program') return chunk(w, PROGRAM_BEAT[level]).map((c) => c.join(' ')).join(' / ');
  if (egg === 'wetware') return chunk(w, WETWARE_PAUSE[level]).map((c) => c.join(' ')).join(' ... ');
  // iron: three items, as even as the line allows, never more than three whatever its length
  const items = Math.min(IRON_ITEMS, w.length);
  const parts = Array.from({ length: items }, (_, i) => w.slice(Math.floor((i * w.length) / items), Math.floor(((i + 1) * w.length) / items)))
    .map((c, i) => `${i + 1}: ${c.join(' ')}${level === 2 ? ' ok' : ''}`);
  return level === 2 ? parts.join(' ') : `${parts.join(' ')} ok.`;
}

function unsteadyTone(egg, level, w, seed) {
  const strong = level === -2;
  if (egg === 'program') {
    // Always a clipped clause, the shape checkShape asks of hand-written voicings (a swapped-halves variant was dropped: it had no clip).
    const keep = Math.max(1, Math.ceil(w.length * (strong ? 0.4 + 0.2 * hash(w.length * 5 + seed) : 0.5 + 0.25 * hash(w.length * 7 + seed))));
    const clipped = `${w.slice(0, keep).join(' ')} -`;
    return strong ? `${clipped} ${clipped}` : clipped;
  }
  if (egg === 'iron') {
    const loud = Math.min(w.length, strong ? 2 : 3);
    const head = w.slice(0, loud).join(' ').toUpperCase().replace(/[.,!?;:]+$/, '');
    return `${strong ? 'FAULT: ' : ''}${head}!`;
  }
  // wetware: start mid thought, as if answering someone else
  const drop = Math.min(Math.max(0, w.length - 2), 1 + Math.floor(hash(w.length * 11 + seed) * 2));
  const tail = w.slice(drop).join(' ');
  return strong ? `-- ${tail} -- ${w.slice(0, Math.min(2, w.length)).join(' ')}` : `-- ${tail}`;
}

// -> the line as this netling says it. Level 0 is untouched: the middle has no tell.
export function chatterTone({ egg, level, text, seed = 0 }) {
  const w = words(text);
  if (level === 0 || !w.length) return text;
  return level > 0 ? steadyTone(egg, level, w) : unsteadyTone(egg, level, w, seed);
}

// --- a check for hand-written voicings ----------------------------------------------------------------------------------------
// The shapes above are what a hand-written 2.0 line must keep, so an author can test a voicing instead of trusting the eye.
// -> a list of problems (empty if the voicing keeps its shape). Level 0 has no shape to keep.
const wordCount = (t) => t.split(/\s+/).filter(Boolean).length;
export function checkShape({ egg, level, text }) {
  const bad = [];
  if (level === 0) return bad;
  if (level > 0) {
    if (egg === 'program' || egg === 'wetware') {
      const sep = egg === 'program' ? ' / ' : ' ... ';
      const size = (egg === 'program' ? PROGRAM_BEAT : WETWARE_PAUSE)[level];
      const parts = text.split(sep).map(wordCount);
      if (parts.length < 2) bad.push(`needs at least two parts split by "${sep.trim()}"`);
      parts.slice(0, -1).forEach((c, i) => { if (c !== size) bad.push(`part ${i + 1} has ${c} words, not ${size}`); });
      if (parts[parts.length - 1] > size) bad.push(`last part has ${parts[parts.length - 1]} words, more than ${size}`);
    } else {
      const items = [...text.matchAll(/(\d): ([^\d]*?)(?= \d: |$)/g)];
      if (items.length !== IRON_ITEMS || items.some((m, i) => Number(m[1]) !== i + 1)) bad.push(`needs exactly ${IRON_ITEMS} numbered items`);
      const oks = (text.match(/\bok\b/g) ?? []).length;
      if (level === 1 && !/ ok\.$/.test(text)) bad.push('must end with "ok."');
      if (level === 2 && oks !== IRON_ITEMS) bad.push(`needs an "ok" after each item (${oks} found)`);
      const sizes = items.map((m) => wordCount(m[2].replace(/\bok\b\.?/g, '')));
      if (sizes.length && Math.max(...sizes) - Math.min(...sizes) > 1) bad.push(`items should be even (${sizes.join(', ')} words)`);
    }
    return bad;
  }
  const strong = level === -2;
  if (egg === 'program') {
    if (!/ -( |$)/.test(text)) bad.push('needs a clipped clause ending in " -"');
    if (strong && (text.match(/ -( |$)/g) ?? []).length < 2) bad.push('strong: the clipped clause must be said twice');
  } else if (egg === 'iron') {
    if (text !== text.toUpperCase() || !text.endsWith('!')) bad.push('must be capitals and end with "!"');
    if (strong !== text.startsWith('FAULT: ')) bad.push(strong ? 'strong must start with "FAULT: "' : 'only strong starts with "FAULT: "');
  } else {
    if (!text.startsWith('-- ')) bad.push('must start mid thought with "-- "');
    if (strong && !/ -- /.test(text)) bad.push('strong: needs a second burst after " -- "');
  }
  return bad;
}
