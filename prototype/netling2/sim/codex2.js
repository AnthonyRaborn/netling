// The 2.0 story pages for the simulator fork (docs/NETLING_2_CODEX_DRAFTS.md): 24 Root pages and 15 late pages, by region, in drop order.
// Only ids, regions and tiers matter to the rules (titles are for the run log). Egg pages (15 form pages and 3 Source pages) are not here:
// they drop on other rules and are modelled as rates in lineage-sweep.mjs. Replaces 1.0's 22-page list in the fork.
//   Root pages count toward Root Access. Late pages (decided) never do, and drop only once the line holds Root Access.
//   The Deep opens on ruins-4 (a Root page, as in 1.0). The Source opens on deep-6 (1.0's deep-5, the Deep's last word; a late page).
import { REGIONS } from '../../../src/netrun/regions.js';

const root = (region, titles) => titles.map((title, i) => ({ id: `${region}-${i + 1}`, region, tier: 'root', title }));
const late = (region, from, titles) => titles.map((title, i) => ({ id: `${region}-${from + i}`, region, tier: 'late', title }));

export const FRAGMENTS = [
  ...root('public', ['maintenance log', 'forum post, deleted', 'corrupted ad banner', 'classified ad', "runner's note"]),
  ...late('public', 6, ['field guide, errata slip', 'runner\'s note, scratched in a node wall']),
  ...root('corp', ['memo', 'release schedule', 'memo', 'directive', 'asset register', 'asset register, cont.']),
  ...late('corp', 7, ['deletion log']),
  ...root('bazaar', ['vendor chatter', 'price list', 'a fence, off the record', "runner's journal", 'graffiti in a dead market']),
  ...late('bazaar', 6, ['price list, back table', 'clinic intake log', 'graffiti, clinic wall']),
  ...root('ruins', ['old web index page', 'daemon heartbeat', 'fragment catalog', 'echo, transcribed']),
  ...late('ruins', 5, ['inventory audit', 'firmware dump, rack 41', 'work order, annex 2']),
  ...root('deep', ['no header', 'NL-0', 'NL-0', 'NL-0']),
  ...late('deep', 5, ['NL-0', 'NL-0']),
  ...late('source', 1, ['header', 'commit message', 'unexecuted directive', 'a comment in the code, unsigned']),
];

export const ROOT_FRAGMENT_IDS = FRAGMENTS.filter((f) => f.tier === 'root').map((f) => f.id);
export const LATE_FRAGMENT_IDS = FRAGMENTS.filter((f) => f.tier === 'late').map((f) => f.id);
export const fragmentById = (id) => FRAGMENTS.find((f) => f.id === id);
export const rootHeld = (known, rootAccess = false) => rootAccess || ROOT_FRAGMENT_IDS.every((id) => known.includes(id));

// The next page a region drops: in order, never a repeat, and a late page only once Root is held.
export function nextFragment(region, known, rootAccess = false) {
  const held = rootHeld(known, rootAccess);
  return FRAGMENTS.find((f) => f.region === region && !known.includes(f.id) && (f.tier === 'root' || held))?.id ?? null;
}

// The Source opens on the Deep's last word, deep-6 (1.0's deep-5). The fork shares the 1.0 region table, so this edits it in place.
REGIONS.source.requires = 'deep-6';
