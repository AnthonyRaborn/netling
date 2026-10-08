// What does the inventory lose? Items granted (found in runs, dropped by wins and events, bought) against items the full inventory scrapped, per life,
// with the peak number held. Usage: node prototype/netling2/sim/item-sweep.mjs [lives=200] [archetypes=attentive,casual,worker,steer-feast-corp,steer-feast-street,sysadmin]
// The bots manage the inventory perfectly (sell surplus at markets, scrap at home, buy only what they keep), so this understates a hoarder.
process.env.TZ = 'UTC';
const lives = Number(process.argv[2] ?? 200);
const bases = (process.argv[3] ?? 'attentive,casual,worker,steer-feast-corp,steer-feast-street,sysadmin').split(',');
const { ARCHETYPES, simulate } = await import('./balance.mjs');
const { ITEM_METER } = await import('./sim.js');
for (const base of bases) {
  for (const k of ['granted', 'scrapped', 'scrapScrip']) ITEM_METER[k] = 0;
  ITEM_METER.byId = {};
  let peak = 0, held = 0, atCheck = 0;
  for (let i = 1; i <= lives; i++) { const r = simulate({ ...ARCHETYPES[base] }, i); peak += r.itemsHeld ?? 0; atCheck += r.fullShare ?? 0; }
  const per = (x) => +(x / lives).toFixed(2);
  const top = Object.entries(ITEM_METER.byId).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => `${k} ${per(v)}`).join(', ');
  console.log(JSON.stringify({ base, granted: per(ITEM_METER.granted), scrapped: per(ITEM_METER.scrapped), scrapShare: +(ITEM_METER.scrapped / Math.max(1, ITEM_METER.granted)).toFixed(3), scrapScrip: per(ITEM_METER.scrapScrip), peakHeld: per(peak), inventoryFullAtCheckIn: per(atCheck), mostGranted: top }));
}
