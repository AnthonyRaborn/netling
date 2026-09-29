// Netrun regions, shallowest first. Access needs a stage, a clear of the region before it (by this
// netling), and, for The Deep, a codex fragment.

export const REGIONS = {
  public: {
    name: 'Public Net',
    blurb: 'safe-ish. the tutorial depth.',
    minStage: 'baby',
    layers: 6, // middle layers between entry and exit
    width: [2, 3], // nodes per middle layer
    nodes: { cache: 3, ice: 6, relay: 1, checkpoint: 1, market: 1, anomaly: 2 },
    loot: { coolant: 2, antivirus: 2, booster: 2, repair: 2, voucher: 1, memory: 1, blackice: 1, segfault: 2 },
    market: { coolant: 2, antivirus: 2, booster: 2, blackice: 2, repair: 2, memory: 1, overclock: 1, segfault: 1 },
    iceDamage: 35,
    exitBonus: 1,
    palette: { main: '#05d9e8', accent: '#ff2a6d', bg: '#0b2226' },
    sound: { mult: 1, wave: 'square' },
  },
  corp: {
    name: 'Corp Grid',
    blurb: 'checkpoints everywhere. vouchers and patches.',
    minStage: 'teen',
    layers: 7,
    width: [2, 3],
    nodes: { cache: 3, ice: 6, relay: 1, checkpoint: 4, anomaly: 1 },
    loot: { voucher: 4, antivirus: 3, coolant: 2, repair: 2, booster: 1, segfault: 1 },
    iceDamage: 35,
    exitBonus: 1,
    palette: { main: '#f9f002', accent: '#ff2a6d', bg: '#1a1a0b' },
    sound: { mult: 1.25, wave: 'triangle' }, // clean, corporate chimes
  },
  bazaar: {
    name: 'Darknet Bazaar',
    blurb: 'markets and black ICE. bring charge.',
    minStage: 'teen',
    layers: 7,
    width: [2, 3],
    nodes: { cache: 2, ice: 5, relay: 1, market: 4, anomaly: 2 },
    loot: { blackice: 4, memory: 2, booster: 2, coolant: 1, segfault: 1 },
    market: { blackice: 3, memory: 2, booster: 2, overclock: 2, antivirus: 1, coolant: 1, repair: 1, segfault: 1 },
    marketPrice: 10,
    iceDamage: 40,
    exitBonus: 1,
    palette: { main: '#b967ff', accent: '#ff2a6d', bg: '#160b22' },
    sound: { mult: 0.9, wave: 'sawtooth' }, // buzzy, cheap speakers
  },
  ruins: {
    name: 'Old Web Ruins',
    blurb: 'abandoned and strange. echoes live here.',
    minStage: 'adult',
    layers: 7,
    width: [2, 3],
    nodes: { cache: 3, ice: 5, relay: 1, anomaly: 4 },
    loot: { memory: 4, repair: 3, coolant: 2, antivirus: 2, booster: 1, segfault: 1 },
    iceDamage: 48,
    exitBonus: 2,
    palette: { main: '#39ff14', accent: '#ff2a6d', bg: '#0b1a0b' },
    sound: { mult: 0.75, wave: 'sine' }, // old, soft
  },
  deep: {
    name: 'The Deep',
    blurb: 'below the logs. nothing here is recorded.',
    minStage: 'adult',
    requires: 'ruins-4',
    layers: 8,
    width: [2, 3],
    nodes: { cache: 2, ice: 8, relay: 1, anomaly: 2 },
    loot: { memory: 3, booster: 2, antivirus: 2, coolant: 2, repair: 2, voucher: 1, blackice: 1, overclock: 1, segfault: 1 },
    iceDamage: 50,
    exitBonus: 2,
    palette: { main: '#e8e8ff', accent: '#ff2a6d', bg: '#08081a' },
    sound: { mult: 0.5, wave: 'sine' }, // low and far away
  },
};

// The first-run tutorial: a fixed, gentle map inside the Public Net. Not in the region picker.
REGIONS.tutorial = {
  ...REGIONS.public,
  name: 'Public Net',
  tutorial: true,
  codexRegion: 'public', // its exit hands over the first Public Net fragment
  iceDamage: 10,
  loot: { coolant: 1 },
  cacheFind: 1,
  exitFragment: 1,
  noStyleDrops: true, // the party hat should be the first accessory
  noCooldown: true,
};

// The way down: each region opens once this netling has reached the exit of the one before it.
export const REGION_ORDER = ['public', 'bazaar', 'corp', 'ruins', 'deep'];
export const STAGE_ORDER = ['baby', 'teen', 'adult'];

export const previousRegion = (region) => REGION_ORDER[REGION_ORDER.indexOf(region) - 1] ?? null;

// Why a region is closed, or null. `cleared` is the regions this netling has reached the exit of.
export function regionLock(region, stage, codex = [], cleared = []) {
  const r = REGIONS[region];
  if (STAGE_ORDER.indexOf(stage) < STAGE_ORDER.indexOf(r.minStage)) {
    return `needs ${r.minStage === 'adult' ? 'an' : 'a'} ${r.minStage} netling.`;
  }
  const before = previousRegion(region);
  if (before && !cleared.includes(before)) return `reach the exit of the ${REGIONS[before].name} first.`;
  if (r.requires && !codex.includes(r.requires)) return 'the way down is still hidden.';
  return null;
}

export const regionOpen = (region, stage, codex, cleared) => regionLock(region, stage, codex, cleared) === null;

// Netlings from before the unlock order count as having cleared every region their stage can enter,
// so nothing they could reach closes on them.
export const clearedForStage = (stage) =>
  STAGE_ORDER.includes(stage) ? REGION_ORDER.filter((id) => STAGE_ORDER.indexOf(REGIONS[id].minStage) <= STAGE_ORDER.indexOf(stage)) : [];
