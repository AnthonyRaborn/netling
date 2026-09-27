// Layered node-map generation: entry -> N middle layers -> exit, every node reachable and every node with a way forward.
import { REGIONS } from './regions.js';

function weighted(table, rng) {
  const entries = Object.entries(table);
  let r = rng() * entries.reduce((a, [, w]) => a + w, 0);
  for (const [k, w] of entries) if ((r -= w) < 0) return k;
  return entries[entries.length - 1][0];
}

// Fixed tutorial path: entry -> cache -> ICE -> relay -> exit.
function tutorialMap() {
  const types = ['entry', 'cache', 'ice', 'relay', 'exit'];
  const nodes = types.map((type, i) => ({ id: i, layer: i, type, edges: i < types.length - 1 ? [i + 1] : [] }));
  return { region: 'tutorial', nodes, layerCount: nodes.length };
}

export function generateMap(regionId, rng) {
  if (regionId === 'tutorial') return tutorialMap();
  const region = REGIONS[regionId];
  const layers = [];
  let id = 0;
  const node = (layer, type) => ({ id: id++, layer, type, edges: [] });

  layers.push([node(0, 'entry')]);
  const relayLayer = Math.ceil(region.layers / 2);
  for (let L = 1; L <= region.layers; L++) {
    const [lo, hi] = region.width;
    const count = lo + Math.floor(rng() * (hi - lo + 1));
    const row = [];
    for (let i = 0; i < count; i++) {
      // no relays right at the start; one guaranteed mid-run
      let type = weighted(region.nodes, rng);
      while (L === 1 && type === 'relay') type = weighted(region.nodes, rng);
      row.push(node(L, type));
    }
    if (L === relayLayer && !row.some((n) => n.type === 'relay')) row[Math.floor(rng() * row.length)].type = 'relay';
    layers.push(row);
  }
  layers.push([node(region.layers + 1, 'exit')]);

  // Connect each node to the 1-2 nearest nodes (by relative position) in the next layer.
  for (let L = 0; L < layers.length - 1; L++) {
    const cur = layers[L];
    const next = layers[L + 1];
    const pos = (i, n) => (n === 1 ? 0.5 : i / (n - 1));
    cur.forEach((n, i) => {
      const ranked = next
        .map((m, j) => ({ m, d: Math.abs(pos(i, cur.length) - pos(j, next.length)) }))
        .sort((a, b) => a.d - b.d);
      n.edges.push(ranked[0].m.id);
      if (ranked[1] && rng() < 0.5) n.edges.push(ranked[1].m.id);
    });
    // Anything unreached gets an edge from its nearest predecessor.
    next.forEach((m, j) => {
      if (cur.some((n) => n.edges.includes(m.id))) return;
      const nearest = cur
        .map((n, i) => ({ n, d: Math.abs(pos(i, cur.length) - pos(j, next.length)) }))
        .sort((a, b) => a.d - b.d)[0].n;
      nearest.edges.push(m.id);
    });
  }

  return { region: regionId, nodes: layers.flat(), layerCount: layers.length };
}

export const nodeById = (map, id) => map.nodes.find((n) => n.id === id);
