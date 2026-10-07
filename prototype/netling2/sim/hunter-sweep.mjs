// How much play do the hidden forms take? A hidden-path hunter (hunter-shown: sees only the HUD's floors, plays the game it has won least)
// is run with check-ins every `gap` hours from 07:00 to 23:00, and at several mini-game win rates. Reports the share of lives that end as the
// hidden teen and the hidden adult, and the average wins.
// Usage: node prototype/netling2/sim/hunter-sweep.mjs [lives=200] [gaps=1,2,3,4,6] [winRates=0.75]
process.env.TZ = 'UTC';
const { ARCHETYPES, simulate } = await import('./balance.mjs');
const lives = Number(process.argv[2] ?? 200);
const gaps = (process.argv[3] ?? '1,2,3,4,6').split(',').map(Number);
const rates = (process.argv[4] ?? '0.75').split(',').map(Number);
for (const winRate of rates) {
  for (const gap of gaps) {
    const checks = [];
    for (let h = 7; h <= 23; h += gap) checks.push(h * 60);
    const p = { ...ARCHETYPES['hunter-shown'], checks, winRate };
    const rs = Array.from({ length: lives }, (_, i) => simulate(p, i + 1));
    const share = (f) => +(rs.filter(f).length / lives).toFixed(2);
    console.log(JSON.stringify({ winRate, checkInsADay: checks.length, hiddenTeen: share((r) => r.teenForm === 'teenHidden'), hiddenAdult: share((r) => r.adultForm === 'hidden'), fullLife: share((r) => r.cause === 'end of life cycle'), wins: +(rs.reduce((a, r) => a + r.wins, 0) / lives).toFixed(1) }));
  }
}
