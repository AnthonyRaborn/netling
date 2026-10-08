// The one-time pre-state caption (docs/NETLING_2_CARE_DRAFTS.md, Pre-state caption): how often it would show, and when, against the
// state it is meant to teach. The caption fires once a netling per bar after SIDES.<bar>.hintMin (120) minutes of building toward the
// state. Final egg-pressure design, owner multiplier 3, default bots. Usage: node prototype/netling2/sim/hint-sweep.mjs [lives=200] [bases]
process.env.TZ = 'UTC';
const lives = Number(process.argv[2] ?? 200);
const bases = (process.argv[3] ?? 'attentive,sysadmin,casual,worker,human-regular,daredevil,overclocker').split(',');
const { ARCHETYPES, simulate } = await import('./balance.mjs');
const { SIDES, IRON } = await import('./sim.js');
Object.assign(SIDES.charge, { hi: 80, hold: 180, exit: 65, gate: 0, slow: 0, bleed: 8, overflow: 2, playGain: 0.45, drop: 0.75 });
Object.assign(SIDES.sync, { hi: 85, hold: 180, exit: 70, swing: 0, steadyDecay: 0, calm: 0, dull: 0.3, virus: 1.2, visit: 0.75, drop: 0.75, penStep: 0.1, penFree: 90, penCap: 0.9, burnN: 2, burnCool: 1440 });
SIDES.charge.hintMin = SIDES.sync.hintMin = Number(process.env.HINT_MIN ?? 120);
SIDES.on = true; SIDES.owner = null; SIDES.ownerMult = 3; IRON.on = false;
const med = (a) => (a.length ? a.sort((x, y) => x - y)[Math.floor(a.length / 2)] : null);
for (const base of bases) {
  let last = null;
  globalThis.__sample = (s) => { last = s; };
  const out = { fired: { charge: 0, sync: 0 }, entered: { charge: 0, sync: 0 }, firedThenEntered: { charge: 0, sync: 0 }, enteredNoHint: { charge: 0, sync: 0 }, both: 0, asBaby: { charge: 0, sync: 0 }, day: { charge: [], sync: [] }, lead: { charge: [], sync: [] } };
  for (let i = 1; i <= lives; i++) {
    last = null;
    simulate({ ...ARCHETYPES[base] }, i);
    const s = last;
    const h = s?.hintAt ?? { charge: null, sync: null };
    const e = s?.heldAt ?? { charge: null, sync: null };
    for (const k of ['charge', 'sync']) {
      if (h[k] !== null) { out.fired[k]++; out.day[k].push(h[k] / 1440); }
      if (e[k] !== null) out.entered[k]++;
      if (e[k] !== null && s?.life && e[k] < s.life.teenAt) out.asBaby[k]++;
      if (h[k] !== null && e[k] !== null) { out.firedThenEntered[k]++; out.lead[k].push((e[k] - h[k]) / 60); }
      if (h[k] === null && e[k] !== null) out.enteredNoHint[k]++;
    }
    if (h.charge !== null && h.sync !== null) out.both++;
  }
  const pct = (n) => `${Math.round((100 * n) / lives)}%`;
  console.log(base.padEnd(14), ['charge', 'sync'].map((k) => `${k}: caption ${pct(out.fired[k])} (median day ${med(out.day[k])?.toFixed(1) ?? '-'}), state reached ${pct(out.entered[k])} (first reached as a baby ${pct(out.asBaby[k])}), state without a caption ${pct(out.enteredNoHint[k])}, hours from caption to state ${med(out.lead[k])?.toFixed(1) ?? '-'}`).join(' | '), `| both bars ${pct(out.both)}`);
}
