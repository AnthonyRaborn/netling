// Netrun regions. Phase 1 ships the Public Net; the rest are defined as they come online.

export const REGIONS = {
  public: {
    name: 'Public Net',
    minStage: 'baby',
    layers: 6, // middle layers between entry and exit
    width: [2, 3], // nodes per middle layer
    nodes: { cache: 3, ice: 5, relay: 1 },
    loot: { coolant: 3, antivirus: 2, booster: 2, voucher: 1, memory: 1, blackice: 1 },
    iceDamage: 35,
    palette: { main: '#05d9e8', accent: '#ff2a6d' },
  },
};

export const STAGE_ORDER = ['baby', 'teen', 'adult'];

export function regionOpen(region, stage) {
  return STAGE_ORDER.indexOf(stage) >= STAGE_ORDER.indexOf(REGIONS[region].minStage);
}
