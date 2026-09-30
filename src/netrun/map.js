// Layered node-map generation: entry -> N middle layers -> exit, every node reachable and every node with a way forward.
import { REGIONS } from './regions.js';
import { weighted } from '../random.js';

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

// The route from entry to exit that passes the fewest nodes of `type` (counting only layers up to maxLayer):
// { count, path } with path the nodes in order. Maps are layered, so one pass by layer finds it.
export function thinnestRoute(map, type, maxLayer = Infinity) {
  const byId = new Map(map.nodes.map((n) => [n.id, n]));
  const nodes = [...map.nodes].sort((a, b) => a.layer - b.layer);
  const counts = (n) => (n.type === type && n.layer <= maxLayer ? 1 : 0);
  const best = new Map([[nodes[0].id, counts(nodes[0])]]);
  const prev = new Map();
  for (const n of nodes) {
    if (!best.has(n.id)) continue;
    for (const e of n.edges) {
      const c = best.get(n.id) + counts(byId.get(e));
      if (!best.has(e) || c < best.get(e)) {
        best.set(e, c);
        prev.set(e, n.id);
      }
    }
  }
  const exit = nodes.find((n) => n.type === 'exit');
  const path = [exit];
  while (prev.has(path[0].id)) path.unshift(byId.get(prev.get(path[0].id)));
  return { count: best.get(exit.id), path };
}

// Makes every route from entry to exit pass at least `need` nodes of `type` in layers 1 to maxLayer, turning other
// middle nodes on the thinnest route into it (never the entry or the exit; an `avoid` type only when nothing else is
// left on that route). False if it can't.
export function ensureOnEveryRoute(map, type, need, rng, { maxLayer = Infinity, avoid = [] } = {}) {
  for (let guard = 0; guard < 100; guard++) {
    const { count, path } = thinnestRoute(map, type, maxLayer);
    if (count >= need) return true;
    const open = path.filter((n) => n.layer >= 1 && n.layer <= maxLayer && n.type !== type && n.type !== 'entry' && n.type !== 'exit');
    const spots = open.filter((n) => !avoid.includes(n.type));
    const pickFrom = spots.length ? spots : open;
    if (!pickFrom.length) return false;
    pickFrom[Math.floor(rng() * pickFrom.length)].type = type;
  }
  return false;
}
