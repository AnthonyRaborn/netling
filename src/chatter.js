// Chatter: lines a netling mutters to itself while it's awake and idle. A line only counts as heard
// if the page is visible while it's on screen; heard lines are kept across lives (progress.chatter)
// and listed in the Archive. Ids are permanent: saves store them and the sanitizer drops unknown ones.
// Pure data: no imports, so sim.js can use it.

// Each group, in Archive order, with the hint shown while none of its lines are heard.
export const CHATTER_GROUPS = [
  { id: 'bitling', name: 'Bitling', hint: 'listen to it while it is new.' },
  { id: 'kernel', name: 'Kernel', hint: 'listen to a well-kept teen.' },
  { id: 'stub', name: 'Stub', hint: 'listen to a teen that had a rough start.' },
  { id: 'shell', name: 'Shell', hint: 'listen to a teen with something missing.' },
  { id: 'chrome', name: 'Chrome', hint: 'listen to one loyal to the grid.' },
  { id: 'firewall', name: 'Firewall', hint: 'listen to one that trusts nothing upstream.' },
  { id: 'daemon', name: 'Daemon', hint: 'listen to one that never misses a cycle.' },
  { id: 'glitch', name: 'Glitch', hint: 'listen to one that lives on the edge.' },
  { id: 'ghost', name: 'Ghost', hint: 'listen to the one nobody sees.' },
  { id: 'lineage', name: 'Lineage', hint: 'listen to one that remembers who came before.' },
  { id: 'visitor', name: 'Visitors', hint: 'say hello when someone drops by.' },
];

// when(s): extra condition beyond the group (form groups match s.form; lineage lines check the
// inheritance; visitor lines are only said by a greeted visitor).
export const CHATTER = [
  { id: 'bit-hello', group: 'bitling', text: 'hello? hello. hello!' },
  { id: 'bit-bright', group: 'bitling', text: 'everything is so bright in here.' },
  { id: 'bit-hands', group: 'bitling', text: 'what are these? are these mine?' },
  { id: 'bit-count', group: 'bitling', text: '0, 1, 10, 11, 100. is that all of them?' },
  { id: 'bit-you', group: 'bitling', text: 'you are the big one who pushes buttons.' },

  { id: 'ker-uptime', group: 'kernel', text: 'uptime looking good. not that i am counting.' },
  { id: 'ker-grow', group: 'kernel', text: 'my code keeps getting longer. is that normal?' },
  { id: 'ker-rules', group: 'kernel', text: 'who wrote the rules? can i read them?' },
  { id: 'ker-fine', group: 'kernel', text: 'i am fine. everything is fine. mostly.' },

  { id: 'stub-hurt', group: 'stub', text: 'some of my functions just return null.' },
  { id: 'stub-try', group: 'stub', text: 'i will compile properly next time. watch.' },
  { id: 'stub-scar', group: 'stub', text: 'there are gaps where the good code should be.' },
  { id: 'stub-stay', group: 'stub', text: 'you came back. you keep coming back.' },

  { id: 'shell-echo', group: 'shell', text: 'there is an echo in here. is that me?' },
  { id: 'shell-empty', group: 'shell', text: 'i am mostly whitespace. i like it.' },
  { id: 'shell-soon', group: 'shell', text: 'something is waiting to move in.' },
  { id: 'shell-quiet', group: 'shell', text: 'if i stay very quiet, nobody logs me.' },

  { id: 'chr-score', group: 'chrome', text: 'compliance score: exemplary. obviously.' },
  { id: 'chr-memo', group: 'chrome', text: 'per my last memo, please feed me licensed.' },
  { id: 'chr-shine', group: 'chrome', text: 'do you see how the light hits my casing?' },
  { id: 'chr-scav', group: 'chrome', text: 'scavenged data? in this economy?' },

  { id: 'fw-deny', group: 'firewall', text: 'deny all. deny all. deny... you can stay.' },
  { id: 'fw-ports', group: 'firewall', text: 'closed port 443 again. old habits.' },
  { id: 'fw-watch', group: 'firewall', text: 'someone is knocking upstream. let them knock.' },
  { id: 'fw-trust', group: 'firewall', text: 'i trust exactly one user. do not make it weird.' },

  { id: 'dmn-cron', group: 'daemon', text: 'every minute, on the minute. i love it here.' },
  { id: 'dmn-log', group: 'daemon', text: 'logs rotated. caches warm. all is well.' },
  { id: 'dmn-pid', group: 'daemon', text: 'my pid is 1 in my heart.' },
  { id: 'dmn-sleep', group: 'daemon', text: 'i do not sleep. i wait for the next tick.' },

  { id: 'gl-over', group: 'glitch', text: 'did i say that already? did i say that already?' },
  { id: 'gl-color', group: 'glitch', text: 'i can taste the color #ff2a6d.' },
  { id: 'gl-fine', group: 'glitch', text: 'segfault? more like segFUN.' },
  { id: 'gl-edge', group: 'glitch', text: 'the edge of the buffer has the best view.' },

  { id: 'gh-seen', group: 'ghost', text: 'you can see me? interesting.' },
  { id: 'gh-trace', group: 'ghost', text: 'three traces walked right through me today.' },
  { id: 'gh-shell', group: 'ghost', text: 'i was a shell once. now i am the thing inside.' },
  { id: 'gh-where', group: 'ghost', text: 'i am in the packet loss between us.' },

  { id: 'lin-licensed', group: 'lineage', text: 'the one before me had a corp badge. i can feel it.', when: (s) => s.trait === 'licensed' },
  { id: 'lin-hardened', group: 'lineage', text: 'the one before me never opened a port. i get it now.', when: (s) => s.trait === 'hardened' },
  { id: 'lin-persistent', group: 'lineage', text: 'the one before me ran on schedule. i hum its crontab.', when: (s) => s.trait === 'persistent' },
  { id: 'lin-volatile', group: 'lineage', text: 'the one before me was loud. i am loud too. sorry.', when: (s) => s.trait === 'volatile' },
  { id: 'lin-untraceable', group: 'lineage', text: 'the one before me vanished. it left me its silence.', when: (s) => s.trait === 'untraceable' },
  { id: 'lin-history', group: 'lineage', text: 'there is older code under mine. a grandparent?', when: (s) => Boolean(s.history) },
  { id: 'lin-nl0', group: 'lineage', text: 'NL-0 hums in the background. it is watching.', when: (s) => Boolean(s.rootAccess) },

  { id: 'vis-wide', group: 'visitor', text: 'visitor: the net is bigger than your screen, you know.' },
  { id: 'vis-deep', group: 'visitor', text: 'visitor: my friend went to the deep. came back quieter.' },
  { id: 'vis-market', group: 'visitor', text: 'visitor: the bazaar has new stock. bring scrip.' },
  { id: 'vis-corp', group: 'visitor', text: 'visitor: corp sweeps were heavy last night.' },
  { id: 'vis-ghost', group: 'visitor', text: 'visitor: they say one of us walks through walls.' },
  { id: 'vis-thanks', group: 'visitor', text: 'visitor: nobody ever says hello back. thanks.' },
];

export const CHATTER_IDS = new Set(CHATTER.map((c) => c.id));
export const chatterById = (id) => CHATTER.find((c) => c.id === id) ?? null;

// Lines this netling could say right now, by form or inheritance (never a visitor's). `group` is the form whose lines
// it speaks: its own, or for a mainframe its line's (sim.js passes it, since this file imports nothing).
export function chatterPool(s, group = s.form) {
  return CHATTER.filter((c) => (c.group === 'lineage' ? c.when(s) : c.group === group));
}

export const visitorLines = () => CHATTER.filter((c) => c.group === 'visitor');

// Heard lines by group, for the Archive and the crest: { group: { heard, total } }.
export function chatterProgress(heard = []) {
  const got = new Set(heard);
  const out = {};
  for (const g of CHATTER_GROUPS) out[g.id] = { heard: 0, total: 0 };
  for (const c of CHATTER) {
    out[c.group].total++;
    if (got.has(c.id)) out[c.group].heard++;
  }
  return out;
}
