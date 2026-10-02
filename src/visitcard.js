// Visitor cards: a friend's netling, as a short code or link, that drops by on another device (docs/ATTENTION.md).
// A card carries a look (form, colors, what it wears) and a few facts about its line, never stats, items or text a
// player typed, so there is nothing to cheat and nothing to moderate.
// Format: NV1.<base64url(json)>.<crc32 hex>; the crc is also the card's id. Pure: no DOM, no storage.
import { SPECIES } from './sim.js';
import { WEAR_SLOTS, accessoryById } from './accessories.js';
import { cleanCard } from './sanitize.js';
import { crc32, toBase64Url, fromBase64Url } from './transfer.js';

const PREFIX = 'NV1';
export const MAX_CARD_CHARS = 2000; // a real card is about 150 characters
export const CARD_HASH = '#visit=';

export class CardError extends Error {}

// The card for a hatched, living netling, from what it wears and what its line has done; null before it hatches.
export function cardFor(state, wardrobe = {}, progress = {}) {
  if (!state || !SPECIES[state.form] || state.stage === 'script' || state.stage === 'dead') return null;
  const accessories = WEAR_SLOTS.map((slot) => wardrobe[slot]).filter((id) => id && id !== 'none' && accessoryById(id));
  return {
    f: state.form,
    p: state.quirk?.palette ?? 0,
    a: accessories,
    g: state.generation,
    d: progress.deepExits ?? 0,
    r: progress.rootEarned === true,
    x: progress.sourceExits ?? 0,
  };
}

export function encodeCard(card) {
  const json = new TextEncoder().encode(JSON.stringify(card));
  return `${PREFIX}.${toBase64Url(json)}.${crc32(json)}`;
}

// The cleaned card ({ id, form, palette, accessories, gen, deep, root, below }) or a CardError with a player-facing message.
export function decodeCard(code) {
  const clean = String(code ?? '').replace(/\s+/g, '');
  if (clean.length > MAX_CARD_CHARS) throw new CardError('that is far too long to be a visitor card.');
  const parts = clean.split('.');
  if (parts.length !== 3 || parts[0] !== PREFIX) throw new CardError("that doesn't look like a visitor card.");
  let raw;
  try {
    const json = fromBase64Url(parts[1]);
    if (crc32(json) !== parts[2]) throw new Error('crc');
    raw = JSON.parse(new TextDecoder().decode(json));
  } catch {
    throw new CardError('the card is damaged. copy all of it and try again.');
  }
  const card = raw && typeof raw === 'object' ? cleanCard({ id: parts[2], form: raw.f, palette: raw.p, accessories: raw.a, gen: raw.g, deep: raw.d, root: raw.r, below: raw.x }) : null;
  if (!card) throw new CardError('this card has no netling in it, or comes from a newer version.');
  return card;
}

export const isCardText = (text) => {
  const t = String(text ?? '').trim();
  return t.includes(CARD_HASH) || t.startsWith(`${PREFIX}.`);
};

// The card in a pasted link (or a bare card).
export function cardCodeFrom(text) {
  const raw = String(text ?? '').trim();
  if (!raw.includes(CARD_HASH)) return raw;
  const part = raw.slice(raw.indexOf(CARD_HASH) + CARD_HASH.length);
  try {
    return decodeURIComponent(part);
  } catch {
    return part;
  }
}

// Adds a card to the save's queue. Returns 'queued', 'already' (the same card is on its way) or 'full'.
export function queueCard(state, card, now, max) {
  state.friends ??= [];
  if (state.friends.some((c) => c.id === card.id)) return 'already';
  if (state.friends.length >= max) return 'full';
  state.friends.push({ ...card, at: now });
  return 'queued';
}
