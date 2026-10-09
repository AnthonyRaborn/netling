// What does a wider map change in its shape? For a region and a map setting (width a layer and the chance of a second link), over many maps:
// nodes, links, routes from entry to exit, how often a link changes lane (upper, middle, lower by place in the layer), and how different the best and
// worst route are. Uses the fork's generator (netrun/map2.js), which draws the real maps at the real settings.
// Usage: node prototype/netling2/sim/map-metrics.mjs [maps=2000] [regions=deep,source]
//   A route's weight is a rough value, not a rule: cache +1, market +0.5, relay +0.5, checkpoint 0, anomaly 0, ice -1. The spread is best route minus worst route in one map.
process.env.TZ = 'UTC';
const maps = Number(process.argv[2] ?? 2000);
const regions = (process.argv[3] ?? 'deep,source').split(',');
const { generateMap2 } = await import('./netrun/map2.js');
const { mulberry32 } = await import('./sim.js');
const { REGIONS } = await import('../../../src/netrun/regions.js');
const VALUE = { cache: 1, market: 0.5, relay: 0.5, ice: -1 };
const w = (t) => VALUE[t] ?? 0;
const settings = {
  deep: [['now [2,3] link .5', [2, 3], 0.5], ['[3,4] link .25', [3, 4], 0.25], ['[3,4] link .5', [3, 4], 0.5], ['[3,4] link .75', [3, 4], 0.75], ['[4,5] link .5', [4, 5], 0.5]],
  source: [['now [2,3] link .5', [2, 3], 0.5], ['[3,5] link .25', [3, 5], 0.25], ['[3,5] link .5', [3, 5], 0.5], ['[3,5] link .75', [3, 5], 0.75], ['[4,5] link .5', [4, 5], 0.5], ['[4,5] link .75', [4, 5], 0.75]],
};
const bucket = (i, n) => Math.min(2, Math.floor((n === 1 ? 0.5 : i / (n - 1)) * 3));
for (const region of regions) {
  console.log(`\n== ${REGIONS[region].name} (${REGIONS[region].layers} middle layers) ==`);
  console.log('setting             | nodes | links/node | routes (median) | lane change % | 2-lane jumps % | best-worst route spread | worst-route ICE | best-route ICE');
  for (const [label, width, link2] of settings[region]) {
    const acc = { nodes: 0, outdeg: 0, lane: 0, jump: 0, edges: 0, spread: 0, bestIce: 0, worstIce: 0 };
    const routeCounts = [];
    for (let seed = 1; seed <= maps; seed++) {
      const map = generateMap2(region, mulberry32(seed), { width, link2 });
      const byId = new Map(map.nodes.map((n) => [n.id, n]));
      const layerNodes = new Map();
      for (const n of map.nodes) layerNodes.set(n.layer, [...(layerNodes.get(n.layer) ?? []), n]);
      acc.nodes += map.nodes.length;
      // edges, lane changes
      for (const n of map.nodes) {
        const row = layerNodes.get(n.layer);
        for (const e of n.edges) {
          const t = byId.get(e);
          const nextRow = layerNodes.get(t.layer);
          const d = Math.abs(bucket(row.indexOf(n), row.length) - bucket(nextRow.indexOf(t), nextRow.length));
          acc.edges++;
          if (d > 0) acc.lane++;
          if (d > 1) acc.jump++;
        }
      }
      // routes: count, best and worst weight, and ICE counts on those routes, by DP from the exit backwards
      const order = [...map.nodes].sort((a, b) => b.layer - a.layer);
      const dp = new Map();
      for (const n of order) {
        if (!n.edges.length) { dp.set(n.id, { count: 1, best: w(n.type), worst: w(n.type), bestIce: n.type === 'ice' ? 1 : 0, worstIce: n.type === 'ice' ? 1 : 0 }); continue; }
        let count = 0; let best = -Infinity; let worst = Infinity; let bestIce = 0; let worstIce = 0;
        for (const e of n.edges) {
          const c = dp.get(e);
          count += c.count;
          if (c.best > best) { best = c.best; bestIce = c.bestIce; }
          if (c.worst < worst) { worst = c.worst; worstIce = c.worstIce; }
        }
        dp.set(n.id, { count, best: best + w(n.type), worst: worst + w(n.type), bestIce: bestIce + (n.type === 'ice' ? 1 : 0), worstIce: worstIce + (n.type === 'ice' ? 1 : 0) });
      }
      const root = dp.get(map.nodes[0].id);
      routeCounts.push(root.count);
      acc.spread += root.best - root.worst;
      acc.bestIce += root.bestIce;
      acc.worstIce += root.worstIce;
    }
    routeCounts.sort((a, b) => a - b);
    const n = maps;
    console.log(`${label.padEnd(19)} | ${(acc.nodes / n).toFixed(1).padStart(5)} | ${(acc.edges / acc.nodes).toFixed(2).padStart(10)} | ${String(routeCounts[Math.floor(n / 2)]).padStart(15)} | ${(100 * acc.lane / acc.edges).toFixed(1).padStart(13)} | ${(100 * acc.jump / acc.edges).toFixed(1).padStart(14)} | ${(acc.spread / n).toFixed(2).padStart(23)} | ${(acc.worstIce / n).toFixed(1).padStart(15)} | ${(acc.bestIce / n).toFixed(1).padStart(14)}`);
  }
}
