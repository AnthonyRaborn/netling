// A parameterized copy of src/netrun/map.js generateMap for the 2.0 fork (NR2.map): the width of a layer and the chance of a node's second link are
// arguments instead of constants. With the region's own width and a link2 of 0.5 it draws the same random numbers in the same order, so it returns the
// same map as the real generator (netrun/map2 test in nr2.test.js). src/ is not touched. Pure.
import { REGIONS } from '../../../../src/netrun/regions.js';
import { weighted } from '../../../../src/random.js';
import { marketKinds } from '../../../../src/netrun/map.js';

export function generateMap2(regionId, rng, { width, link2 = 0.5 } = {}) {
  const region = REGIONS[regionId];
  const [lo, hi] = width ?? region.width;
  const layers = [];
  let id = 0;
  const node = (layer, type) => ({ id: id++, layer, type, edges: [] });

  layers.push([node(0, 'entry')]);
  const relayLayer = Math.ceil(region.layers / 2);
  for (let L = 1; L <= region.layers; L++) {
    const count = lo + Math.floor(rng() * (hi - lo + 1));
    const row = [];
    for (let i = 0; i < count; i++) {
      let type = weighted(region.nodes, rng);
      while (L === 1 && type === 'relay') type = weighted(region.nodes, rng);
      row.push(node(L, type));
    }
    if (L === relayLayer && !row.some((n) => n.type === 'relay')) row[Math.floor(rng() * row.length)].type = 'relay';
    layers.push(row);
  }
  layers.push([node(region.layers + 1, 'exit')]);

  for (let L = 0; L < layers.length - 1; L++) {
    const cur = layers[L];
    const next = layers[L + 1];
    const pos = (i, n) => (n === 1 ? 0.5 : i / (n - 1));
    cur.forEach((n, i) => {
      const ranked = next
        .map((m, j) => ({ m, d: Math.abs(pos(i, cur.length) - pos(j, next.length)) }))
        .sort((a, b) => a.d - b.d);
      n.edges.push(ranked[0].m.id);
      if (ranked[1] && rng() < link2) n.edges.push(ranked[1].m.id);
    });
    next.forEach((m, j) => {
      if (cur.some((n) => n.edges.includes(m.id))) return;
      const nearest = cur
        .map((n, i) => ({ n, d: Math.abs(pos(i, cur.length) - pos(j, next.length)) }))
        .sort((a, b) => a.d - b.d)[0].n;
      nearest.edges.push(m.id);
    });
  }

  const map = { region: regionId, nodes: layers.flat(), layerCount: layers.length };
  marketKinds(map, rng);
  return map;
}
