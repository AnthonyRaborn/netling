// Netrun regions, shallowest first. Access needs a stage and, for The Deep, a codex fragment.

export const REGIONS = {
  public: {
    name: 'Public Net',
    blurb: 'safe-ish. the tutorial depth.',
    minStage: 'baby',
    layers: 6, // middle layers between entry and exit
    width: [2, 3], // nodes per middle layer
    nodes: { cache: 3, ice: 6, relay: 1, checkpoint: 1, market: 1, anomaly: 2 },
    loot: { coolant: 3, antivirus: 2, booster: 2, voucher: 1, memory: 1, blackice: 1 },
    market: { coolant: 2, antivirus: 2, booster: 2, blackice: 2, memory: 1 },
    iceDamage: 35,
    exitBonus: 1,
    palette: { main: '#05d9e8', accent: '#ff2a6d', bg: '#0b2226' },
  },
  corp: {
    name: 'Corp Grid',
    blurb: 'checkpoints everywhere. vouchers and patches.',
    minStage: 'teen',
    layers: 7,
    width: [2, 3],
    nodes: { cache: 3, ice: 6, relay: 1, checkpoint: 4, anomaly: 1 },
    loot: { voucher: 4, antivirus: 3, coolant: 2, booster: 1 },
    iceDamage: 40,
    exitBonus: 1,
    palette: { main: '#f9f002', accent: '#ff2a6d', bg: '#1a1a0b' },
  },
  bazaar: {
    name: 'Darknet Bazaar',
    blurb: 'markets and black ICE. bring charge.',
    minStage: 'teen',
    layers: 7,
    width: [2, 3],
    nodes: { cache: 2, ice: 5, relay: 1, market: 4, anomaly: 2 },
    loot: { blackice: 4, memory: 2, booster: 2, coolant: 1 },
    market: { blackice: 3, memory: 2, booster: 2, antivirus: 1, coolant: 1 },
    marketPrice: 10,
    iceDamage: 38,
    exitBonus: 1,
    palette: { main: '#b967ff', accent: '#ff2a6d', bg: '#160b22' },
  },
  ruins: {
    name: 'Old Web Ruins',
    blurb: 'abandoned and strange. echoes live here.',
    minStage: 'adult',
    layers: 7,
    width: [2, 3],
    nodes: { cache: 3, ice: 5, relay: 1, anomaly: 4 },
    loot: { memory: 4, coolant: 2, antivirus: 2, booster: 1 },
    iceDamage: 45,
    exitBonus: 2,
    palette: { main: '#39ff14', accent: '#ff2a6d', bg: '#0b1a0b' },
  },
  deep: {
    name: 'The Deep',
    blurb: 'below the logs. nothing here is recorded.',
    minStage: 'adult',
    requires: 'ruins-4',
    layers: 8,
    width: [2, 3],
    nodes: { cache: 2, ice: 8, relay: 1, anomaly: 2 },
    loot: { memory: 3, booster: 2, antivirus: 2, coolant: 2, voucher: 1, blackice: 1 },
    iceDamage: 50,
    exitBonus: 2,
    palette: { main: '#e8e8ff', accent: '#ff2a6d', bg: '#08081a' },
  },
};

export const REGION_ORDER = ['public', 'corp', 'bazaar', 'ruins', 'deep'];
export const STAGE_ORDER = ['baby', 'teen', 'adult'];

// Why a region is closed, or null.
export function regionLock(region, stage, codex = []) {
  const r = REGIONS[region];
  if (STAGE_ORDER.indexOf(stage) < STAGE_ORDER.indexOf(r.minStage)) {
    return `needs ${r.minStage === 'adult' ? 'an' : 'a'} ${r.minStage} netling.`;
  }
  if (r.requires && !codex.includes(r.requires)) return 'the way down is still hidden.';
  return null;
}

export const regionOpen = (region, stage, codex) => regionLock(region, stage, codex) === null;
