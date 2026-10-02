// Anomaly events. Each option's apply(ctx) mutates the pet/run through helpers and returns a log line.
// ctx: { pet, run, rng, loot(item?), hurt(n, why), lean(allegiance, stability), reveal(depth), fragment(chance), codexDone }
// codexDone: the region's codex has nothing left to find; an option's codexDoneHint replaces its hint then.
// regions: the regions it can turn up in; omitted means anywhere.

// What READ IT shows: NL-0 first on the list, your netling near the end, or the fault that kept it from ever running.
export const PURGE_READINGS = [
  'PURGE: all maintenance processes. first on the list, in capitals: NL-0.',
  'PURGE: all maintenance processes. the target list is every netling ever compiled. yours is near the end.',
  'PURGE: all maintenance processes. ./purge: permission denied. owner: nobody. it was never allowed to run.',
];

export const ANOMALIES = [
  {
    id: 'sector',
    title: 'CORRUPTED SECTOR',
    text: 'a sector bleeds garbage data. something glints inside.',
    options: [
      {
        id: 'repair',
        label: 'REPAIR',
        hint: '-10 chg, order, maybe loot',
        apply: (c) => {
          c.pet.stats.charge -= 10;
          c.lean(0, 1);
          return c.rng() < 0.5 ? `sector repaired. ${c.loot()}` : 'sector repaired. nothing left to find.';
        },
      },
      {
        id: 'salvage',
        label: 'SALVAGE',
        hint: 'likely loot, may bite, entropy',
        apply: (c) => {
          c.lean(0, -1);
          if (c.rng() < 0.7) return `ripped it open. ${c.loot()}`;
          return c.hurt(12, 'the sector lashed out.');
        },
      },
    ],
  },
  {
    id: 'honeypot',
    title: 'CORP HONEYPOT',
    text: 'an unguarded corp vault. far too easy.',
    options: [
      {
        id: 'report',
        label: 'REPORT IT',
        hint: 'corp, maybe a voucher',
        apply: (c) => {
          c.lean(1, 0);
          return c.rng() < 0.5 ? `reported. a reward: ${c.loot('voucher')}` : 'reported. corp says thanks.';
        },
      },
      {
        id: 'raid',
        label: 'RAID IT',
        hint: 'indie, 2 items or a trap',
        apply: (c) => {
          c.lean(-1, 0);
          if (c.rng() < 0.55) return `raided. ${c.loot()} ${c.loot()}`;
          return c.hurt(20, 'it was a trap.');
        },
      },
    ],
  },
  {
    id: 'signal',
    title: 'STRAY SIGNAL',
    text: 'a faint carrier wave points deeper in.',
    options: [
      {
        id: 'follow',
        label: 'FOLLOW',
        hint: '+5 heat, reveal ahead',
        apply: (c) => {
          c.pet.stats.heat += 5;
          c.reveal(2);
          return 'followed the signal. the path ahead resolves.';
        },
      },
      { id: 'ignore', label: 'TUNE OUT', hint: 'nothing happens', apply: () => 'tuned it out.' },
    ],
  },
  {
    id: 'rig',
    title: 'OVERCLOCK RIG',
    text: 'abandoned hardware, still humming hot.',
    options: [
      {
        id: 'use',
        label: 'PLUG IN',
        hint: '+25 chg, +25 heat, entropy',
        apply: (c) => {
          c.pet.stats.charge += 25;
          c.pet.stats.heat += 25;
          c.lean(0, -1);
          return 'overclocked. charge surging, running hot.';
        },
      },
      { id: 'leave', label: 'LEAVE IT', hint: 'nothing happens', apply: () => 'left the rig humming.' },
    ],
  },
  {
    id: 'echo',
    title: 'ECHO',
    text: 'something netling-shaped flickers at the edge of the node.',
    options: [
      {
        id: 'listen',
        label: 'LISTEN',
        hint: '+15 sync, it may remember something',
        apply: (c) => {
          c.pet.stats.sync += 15;
          return `it hummed a tune your netling almost knows.${c.fragment(0.5)}`;
        },
      },
      { id: 'move', label: 'MOVE ON', hint: 'nothing happens', apply: () => 'the echo faded.' },
    ],
  },
  {
    // The Source's own (codex source-3 is the same order): what it says is the price of reading it.
    id: 'purge',
    title: 'THE PURGE ORDER',
    text: 'an unexecuted directive, signed by no one. status: pending.',
    regions: ['source'],
    options: [
      {
        id: 'read',
        label: 'READ IT',
        hint: '-15 int, it may remember something',
        codexDoneHint: '-15 int, reveal ahead',
        // One of three readings at random; codex source-3 holds the first and the last, so none is lost by missing it.
        // With the Source's codex complete there is nothing left to remember, so the order's margin shows the way on.
        apply: (c) => {
          const reading = c.hurt(15, PURGE_READINGS[Math.floor(c.rng() * PURGE_READINGS.length)]);
          if (!c.codexDone) return `${reading}${c.fragment(0.6)}`;
          c.reveal(3);
          return `${reading} you know this list by heart now. the sector map in its margin is new.`;
        },
      },
      {
        id: 'leave',
        label: 'LEAVE IT',
        hint: '+15 sync, order',
        apply: (c) => {
          c.pet.stats.sync += 15;
          c.lean(0, 1);
          return 'left pending. pending. pending. something down here stops holding its breath.';
        },
      },
    ],
  },
];

// The anomalies that can turn up in a region.
export const anomaliesFor = (region) => ANOMALIES.filter((e) => !e.regions || e.regions.includes(region));
