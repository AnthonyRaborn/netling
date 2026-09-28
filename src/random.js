// Shared random helpers. Pure: the caller supplies the rng.

// Picks a key from { key: weight } in proportion to its weight.
export function weighted(table, rng) {
  const entries = Object.entries(table);
  let r = rng() * entries.reduce((a, [, w]) => a + w, 0);
  for (const [k, w] of entries) if ((r -= w) < 0) return k;
  return entries[entries.length - 1][0];
}
