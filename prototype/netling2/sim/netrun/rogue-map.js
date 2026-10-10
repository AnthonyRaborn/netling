// Rogue's own map build rules (docs/NETLING_2_ROGUE_DRAFTS.md 9.7), simulator stage 2b: applied to an ordinary map after it is built, so every
// random number here is drawn after the ordinary map's, and a map with every rule off is the ordinary map. Pure: (map, rng, rules).
//   relayFactor  relays beyond one in the relay layer stay with this chance (the others re-roll as another node type): the escape is a place.
//   toIce        { region: share } of checkpoints that become ICE (the Corp Grid's corp patrols that do notice Rogue).
//   cordons      { region: [spec] }: layers where every node is danger. 0 is the layer right after the relay layer; a fraction f is that share of
//                the way down (at least two layers after the one before). Never layer 1, the relay layer or the exit.
//   guardShare   the chance a cache or market is guarded: every node of the layer before that links into it becomes ICE, and as many ICE nodes
//                elsewhere become quiet nodes (so the count of danger nodes does not change).
import { REGIONS } from '../../../../src/netrun/regions.js';
import { weighted } from '../../../../src/random.js';

export function rogueMapRules(map, rng, rules) {
  const region = REGIONS[map.region];
  const layers = region.layers;
  const relayLayer = Math.ceil(layers / 2);
  const byLayer = (L) => map.nodes.filter((n) => n.layer === L);
  const quiet = Object.fromEntries(Object.entries(region.nodes).filter(([t]) => t !== 'ice' && t !== 'relay'));
  const reroll = () => weighted(quiet, rng);
  const tally = { relaysThinned: 0, toIce: 0, cordon: [], guarded: 0, guardIce: 0, guardMoved: 0 };

  if (rules.relayFactor < 1) {
    for (const n of map.nodes) {
      if (n.type !== 'relay') continue;
      const keep = n.layer === relayLayer && byLayer(relayLayer).find((m) => m.type === 'relay') === n;
      if (!keep && rng() >= rules.relayFactor) {
        n.type = reroll();
        tally.relaysThinned++;
      }
    }
  }
  const share = rules.toIce?.[map.region] ?? 0;
  if (share > 0) for (const n of map.nodes) if (n.type === 'checkpoint' && rng() < share) {
    n.type = 'ice';
    tally.toIce++;
  }
  const cordonLayers = [];
  for (const spec of rules.cordons?.[map.region] ?? []) {
    let L = spec === 0 ? relayLayer + 1 : Math.round(spec * layers);
    if (cordonLayers.length) L = Math.max(L, cordonLayers.at(-1) + 2);
    if (L <= 1 || L === relayLayer || L > layers) continue;
    cordonLayers.push(L);
    for (const n of byLayer(L)) n.type = 'ice';
  }
  tally.cordon = cordonLayers;
  if (rules.guardShare > 0) {
    const guards = new Set();
    for (const n of map.nodes) {
      if ((n.type !== 'cache' && n.type !== 'market') || n.layer < 2 || rng() >= rules.guardShare) continue;
      tally.guarded++;
      for (const p of byLayer(n.layer - 1)) if (p.edges.includes(n.id)) guards.add(p.id);
    }
    let moved = 0;
    for (const id of guards) {
      const p = map.nodes.find((x) => x.id === id);
      if (p.type === 'ice' || p.type === 'relay') continue;
      p.type = 'ice';
      tally.guardIce++;
      moved++;
    }
    // As many ICE nodes elsewhere become quiet: not a guard, not in a cordon, not layer 1's only way on.
    const spare = map.nodes.filter((x) => x.type === 'ice' && !guards.has(x.id) && !cordonLayers.includes(x.layer) && x.layer >= 1 && x.layer <= layers);
    while (moved > 0 && spare.length) {
      const [x] = spare.splice(Math.floor(rng() * spare.length), 1);
      x.type = reroll();
      tally.guardMoved++;
      moved--;
    }
  }
  map.rogueRules = tally;
  return map;
}
