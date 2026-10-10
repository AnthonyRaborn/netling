// The Rogue lineage side (docs/NETLING_2_ROGUE_DRAFTS.md 6.1 items 1, 11 to 14 and 6.2; simulator stage 3): what follows a Rogue life. Pure; the
// driver is rogue-lineage.mjs.
//   The merge offer: one entry per NL-0 egg, in the order the player completed that egg's pages, each that egg's latest adult or elder fragment.
//   After the good end (M3): the next netling hatches in the chosen entry's egg as an ordinary netling. Every egg is open at every rebirth, so
//   the rest are bot rules: `pick` chooses the entry (first: the first egg completed; last: the last), `line` says what follows a Rogue life that
//   did not reach the good end (stay: Rogue again; back: after a capture, one life of the first egg completed, then Rogue again), and after any
//   NL-0 life the player picks Rogue again (the hunt applies again).

// Each egg's owner bar in SIDES (rogue: none, every state at x1; iron: null, Iron's Overclock with wear).
export const OWNER = { program: 'charge', iron: null, wetware: 'sync', rogue: 'none' };

// latest: { egg: fragment } (an egg not listed has no adult or elder fragment yet). order: the eggs in page-completion order.
export const mergeOffer = (order, latest) => order.filter((egg) => latest[egg]).map((egg) => ({ egg, fragment: latest[egg] }));

export function pickEntry(offer, pick = 'first') {
  if (!offer.length) return null;
  if (pick === 'first') return offer[0];
  if (pick === 'last') return offer.at(-1);
  throw new Error(`PICK must be first or last, not ${pick}`);
}

// The egg and the parent fragment of the next life. life: { egg, cause, goodEnd, fragment } as simulate() returns it (fragment: this life's).
// Under M3 the hybrid is an ordinary netling of the chosen egg, so its parent here is the chosen NL-0 fragment (an assumption: the drafts do not
// say which fragment an M3 hatchling inherits).
export function nextLife(life, { order, latest, pick = 'first', line = 'stay' }) {
  if (life.egg !== 'rogue') return { egg: 'rogue', fragment: life.fragment, why: 'rogue again' };
  if (life.goodEnd) {
    const entry = pickEntry(mergeOffer(order, latest), pick);
    if (entry) return { egg: entry.egg, fragment: entry.fragment, why: 'merged' };
  }
  if (line === 'back' && life.cause === 'captured') return { egg: order[0], fragment: life.fragment, why: 'back after a capture' };
  if (line !== 'stay' && line !== 'back') throw new Error(`LINEBOT must be stay or back, not ${line}`);
  return { egg: 'rogue', fragment: life.fragment, why: 'rogue again' };
}
