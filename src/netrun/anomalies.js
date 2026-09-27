// Anomaly events. Each option's apply(ctx) mutates the pet/run through helpers and returns a log line.
// ctx: { pet, run, rng, loot(n?), hurt(n), lean(allegiance, stability), reveal(depth) }

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
        hint: '+15 sync',
        apply: (c) => {
          c.pet.stats.sync += 15;
          return 'it hummed a tune your netling almost knows.';
        },
      },
      { id: 'move', label: 'MOVE ON', hint: 'nothing happens', apply: () => 'the echo faded.' },
    ],
  },
];
