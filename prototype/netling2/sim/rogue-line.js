// The Rogue lineage side (docs/NETLING_2_ROGUE_DRAFTS.md 6.1 items 1, 11 to 14, 41 to 43 and 6.2; simulator stage 3): what follows a Rogue life.
// Pure; the driver is rogue-lineage.mjs.
//   After the good end the player may choose any egg (6.1, item 43). Choosing an NL-0 egg hatches the mixed egg: a netling of that egg whose
//   parent is the Rogue that just died, so its traits continue as on any rebirth (decided, item 42), and which will carry the Rogue trait (not
//   designed yet, 9.4; nothing in the simulator acts on `mixed`). Choosing Rogue again is an ordinary Rogue life (the hunt applies again).
//   `pick` is a bot rule: first (the first NL-0 egg completed), last (the last) or rogue (Rogue again). `parent: 'fragment'` gives stage 3's first
//   assumption back (the parent is the chosen egg's latest adult or elder fragment). The rest are bot rules too: `line` says what follows a Rogue
//   life that did not reach the good end (stay: Rogue again; back: after a capture, one life of the first egg completed, then Rogue again), and
//   after any NL-0 life the player picks Rogue again.
//   Crossing between Rogue and the NL-0 eggs (6.1, item 47; decided 2026-10-11): Rogue to Rogue inherits as any rebirth does; Rogue to an NL-0 egg
//   only through that life's good end (the mixed egg); an NL-0 egg to Rogue only once the account has had a good end, so the first Rogue egg has
//   no trait line. A crossing that is not open passes the fragment without its trait line (sim.js withoutTraitLine), as a death short of a full
//   life does. `cross: 'open'` gives stage 3 back (every crossing inherits). `goodEnds`: the account's good ends so far.

import { withoutTraitLine } from './sim.js';

// Each egg's owner bar in SIDES (rogue: none, every state at x1; iron: null, Iron's Overclock with wear).
export const OWNER = { program: 'charge', iron: null, wetware: 'sync', rogue: 'none' };

// latest: { egg: fragment } (an egg not listed has no adult or elder fragment yet). order: the eggs in page-completion order.
export const mergeOffer = (order, latest) => order.filter((egg) => latest[egg]).map((egg) => ({ egg, fragment: latest[egg] }));

export function pickEntry(offer, pick = 'first') {
  if (!offer.length) return null;
  if (pick === 'first') return offer[0];
  if (pick === 'last') return offer.at(-1);
  throw new Error(`PICK must be first, last or rogue, not ${pick}`);
}

// The fragment a netling of egg `to` inherits from a parent of egg `from` (goodEnd: the parent's own good end; goodEnds: the account's so far).
export function crossFragment(from, to, fragment, { goodEnd = null, goodEnds = 0, cross = 'gated' } = {}) {
  if (cross !== 'gated' && cross !== 'open') throw new Error(`CROSS must be gated or open, not ${cross}`);
  if (cross === 'open' || (from === 'rogue') === (to === 'rogue')) return fragment; // Rogue to Rogue, or between NL-0 eggs
  if (from === 'rogue') return goodEnd ? fragment : withoutTraitLine(fragment);
  return goodEnds > 0 ? fragment : withoutTraitLine(fragment);
}

// The egg and the parent fragment of the next life. life: { egg, cause, goodEnd, fragment } as simulate() returns it (fragment: this life's).
export function nextLife(life, { order, latest, pick = 'first', line = 'stay', parent = 'rogue', goodEnds = 0, cross = 'gated' }) {
  const via = (egg, fragment) => crossFragment(life.egg, egg, fragment, { goodEnd: life.goodEnd, goodEnds, cross });
  if (life.egg !== 'rogue') return { egg: 'rogue', fragment: via('rogue', life.fragment), why: 'rogue again' };
  if (parent !== 'rogue' && parent !== 'fragment') throw new Error(`PARENT must be rogue or fragment, not ${parent}`);
  if (life.goodEnd && pick !== 'rogue') {
    const entry = pickEntry(mergeOffer(order, latest), pick);
    if (entry) return { egg: entry.egg, fragment: parent === 'rogue' ? life.fragment : entry.fragment, why: 'merged', mixed: true };
  }
  if (line === 'back' && life.cause === 'captured') return { egg: order[0], fragment: via(order[0], life.fragment), why: 'back after a capture' };
  if (line !== 'stay' && line !== 'back') throw new Error(`LINEBOT must be stay or back, not ${line}`);
  return { egg: 'rogue', fragment: life.fragment, why: 'rogue again' };
}
