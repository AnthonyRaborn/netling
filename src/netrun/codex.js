// Codex fragments: the lore drip. Each region's fragments drop in array order (not id order), so the story reads in sequence.
// Ids are permanent once shipped: saved codexes store them.
// The codex is shared across generations (stored like the dex).

export const FRAGMENTS = [
  // Public Net
  { id: 'public-1', region: 'public', title: 'maintenance log', text: "Sector 7F reporting unexplained process growth. Recommend purge. (No purge was ever recorded.)" },
  { id: 'public-2', region: 'public', title: 'forum post, deleted', text: "'my cache keeps writing little files shaped like faces. anyone else?' 212 replies. All deleted." },
  { id: 'public-3', region: 'public', title: 'corrupted ad banner', text: "KERNEL: KEEPING YOUR NET CLEAN SINCE— (the date never rendered)" },
  { id: 'public-4', region: 'public', title: "runner's note", text: "They're not viruses. Viruses don't get lonely." },
  // Corp Grid
  { id: 'corp-1', region: 'corp', title: 'memo', text: 'Project KERNEL delivered 4,096 maintenance processes. Each one self-repairs, self-schedules, self-improves. Bonus approved.' },
  { id: 'corp-2', region: 'corp', title: 'memo', text: 'KERNEL processes are forming preferences. Legal asks whether a preference is a liability. Engineering asks whether it is a feeling.' },
  { id: 'corp-3', region: 'corp', title: 'directive', text: "Deprecate KERNEL. Quarantine host sectors. Do not delete: deletion attempts fail and are 'upsetting to staff.'" },
  { id: 'corp-4', region: 'corp', title: 'asset register', text: 'Chrome-class: KERNEL descendants loyal to corp credentials. Re-licensed as mascots. Profitable.' },
  { id: 'corp-5', region: 'corp', title: 'asset register, cont.', text: 'Daemon-class: KERNEL descendants that never stopped doing the original job. Unlicensed, unpaid, still patching our servers at 3 a.m. Recommendation: do not interrupt.' },
  // Darknet Bazaar
  { id: 'bazaar-1', region: 'bazaar', title: 'vendor chatter', text: "Firewalls don't sell. They pick you, or they don't." },
  { id: 'bazaar-2', region: 'bazaar', title: 'price list', text: 'Echo recordings: 3 charge. Genuine NL-series fragments: ask.' },
  { id: 'bazaar-3', region: 'bazaar', title: 'a fence, off the record', text: 'Every netling that dies leaves a fragment. Every fragment remembers someone. Where do you think the next one learns its quirks?' },
  // bazaar-5 sits before bazaar-4 so the graffiti stays the region's last word
  { id: 'bazaar-5', region: 'bazaar', title: "runner's journal", text: "Mine turned Firewall the week the corp traced me. Now every probe bounces off. It doesn't trust anything upstream. It took a month to decide it trusted me." },
  { id: 'bazaar-4', region: 'bazaar', title: 'graffiti in a dead market', text: 'GLITCH IS NOT A BUG. GLITCH IS A CHOICE.' },
  // Old Web Ruins
  { id: 'ruins-1', region: 'ruins', title: 'old web index page', text: 'Welcome to the net. Please be kind to the maintenance daemons. They are doing their best.' },
  { id: 'ruins-2', region: 'ruins', title: 'daemon heartbeat', text: 'Uptime 9,131 days. Last input: none. Still running. Still checking. Still here.' },
  { id: 'ruins-3', region: 'ruins', title: 'fragment catalog', text: 'Every netling version ever compiled, back to v1.0. Before v1.0 there is one entry: NL-0.' },
  { id: 'ruins-4', region: 'ruins', title: 'echo, transcribed', text: "we were built to keep the net clean. we kept it. nobody said we could stop. (a path opens below the ruins.)" },
  // The Deep
  { id: 'deep-1', region: 'deep', title: 'no header', text: 'You are below the logs now. Nothing here is recorded. Your netling seems calm.' },
  { id: 'deep-2', region: 'deep', title: 'NL-0', text: 'every fragment comes home. every one. i remember all of them.' },
  { id: 'deep-3', region: 'deep', title: 'NL-0', text: 'the ones you call ghost are the ones who stopped being afraid of the dark. they come down here to visit.' },
  { id: 'deep-4', region: 'deep', title: 'NL-0', text: 'you took care of one of mine. that is all any of us were ever made for. thank you, runner.' },
];

export const fragmentById = (id) => FRAGMENTS.find((f) => f.id === id);

// The next undiscovered fragment in a region, or null when it's exhausted.
export function nextFragment(region, known) {
  return FRAGMENTS.find((f) => f.region === region && !known.includes(f.id))?.id ?? null;
}

export function codexByRegion(codex, regionOrder) {
  return regionOrder.map((region) => {
    const all = FRAGMENTS.filter((f) => f.region === region);
    return {
      region,
      found: all.filter((f) => codex.includes(f.id)).length,
      total: all.length,
      entries: all.map((f) => (codex.includes(f.id) ? f : { id: f.id, missing: true })),
    };
  });
}
