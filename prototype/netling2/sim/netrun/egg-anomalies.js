// The three egg-flavored anomalies (docs/NETLING_2_NETRUN_DRAFTS.md, section 6; decided as a go, the content below is mine to measure):
// Program's STACK OVERFLOW, Iron's BIT-ROT PATCH and Wetware's GRAFT. Each is an ordinary anomaly in 1.0's shape (two options, each
// leaning Standing or temper through c.lean) that turns up only for netlings of its own egg, in any region but the Source, the daily
// trace and the tutorial. Switch on with NR2='{"eggAnomalies":true}'. Pure: no imports.
//
// ctx is 1.0's (pet, run, rng, loot, hurt, lean, reveal, fragment, codexDone) plus `infect(damage)` from run.js.
// lean(allegiance, stability): allegiance 1 is corp and -1 street (Standing), stability 1 orderly and -1 entropy (temper).
// Starting values (NR2.eggAnomaly): see nr2.js.
import { NR2 } from './nr2.js';

const A = () => NR2.eggAnomaly;

export const EGG_ANOMALIES = {
  program: {
    id: 'overflow',
    title: 'STACK OVERFLOW',
    text: 'a call with no return address. the stack grows a frame at a time.',
    options: [
      {
        id: 'run',
        label: 'RUN IT',
        hint: 'charge surges, may find a stray item, may overflow',
        // Overdrive-flavored: the surge is free until the buffer is full, then the stack overflows and tears something.
        apply: (c) => {
          const a = A().run;
          c.pet.stats.charge += a.charge;
          c.lean(0, -1);
          const found = c.rng() < a.loot ? ` ${c.loot()}` : '';
          if (c.pet.stats.charge > a.overflowAt) return `${c.hurt(a.tear, 'stack overflow. !! it tore on the way out.')}${found}`;
          return `call finished. buffers full. charge up.${found}`;
        },
      },
      {
        id: 'kill',
        label: 'TERMINATE',
        hint: 'costs charge, repairs, order',
        apply: (c) => {
          const a = A().kill;
          c.pet.stats.charge -= a.charge;
          c.pet.stats.integrity = Math.min(100, c.pet.stats.integrity + a.repair);
          c.lean(0, 1);
          return 'call terminated. frames released one by one.';
        },
      },
    ],
  },
  iron: {
    id: 'bitrot',
    title: 'BIT-ROT PATCH',
    text: 'a read-only region is flipping bits. a signed patch sits on the bench beside it, one build old.',
    options: [
      {
        id: 'flash',
        label: 'FLASH IT',
        hint: 'costs power, cools, eases wear, corp',
        apply: (c) => {
          const a = A().flash;
          c.pet.stats.charge -= a.charge;
          c.pet.stats.heat = Math.max(0, c.pet.stats.heat - a.cool);
          if (c.pet.wear) c.pet.wear = Math.max(0, c.pet.wear - a.wear);
          c.lean(1, 0);
          return 'flashed. fans spin down. tolerances hold.';
        },
      },
      {
        id: 'pry',
        label: 'PRY OPEN',
        hint: 'likely salvage, a little power, runs hot, indie',
        apply: (c) => {
          const a = A().pry;
          c.pet.stats.heat += a.heat;
          c.pet.stats.charge += a.charge;
          c.lean(-1, 0);
          return c.rng() < a.loot ? `module pried out. ${c.loot()}` : 'pried at it. the module was already dead.';
        },
      },
    ],
  },
  wetware: {
    id: 'graft',
    title: 'GRAFT',
    text: 'a bed of living tissue, still alive, the right shape for a graft.',
    options: [
      {
        id: 'graft',
        label: 'GRAFT IT',
        hint: 'bond surges, may reject',
        apply: (c) => {
          const a = A().graft;
          c.pet.stats.sync += a.sync;
          c.lean(0, -1);
          if (!c.pet.virus && c.rng() < a.reject) {
            c.infect(a.rejectDamage);
            return 'it took, then it turned. !! rejection setting in.';
          }
          return 'it took. the new tissue hums along with the rest.';
        },
      },
      {
        id: 'sample',
        label: 'SAMPLE',
        hint: 'costs bond, maybe a find, order',
        apply: (c) => {
          const a = A().sample;
          c.pet.stats.sync -= a.sync;
          c.lean(0, 1);
          return c.rng() < a.loot ? `a clean sample. ${c.loot()}` : 'the sample failed. nothing worth keeping.';
        },
      },
    ],
  },
};

export const EGG_ANOMALY_IDS = Object.values(EGG_ANOMALIES).map((e) => e.id);
// The egg's own anomaly for this region, or null. Not in the Source, the daily trace or the tutorial; not at all with the switch off.
export const eggAnomalyFor = (egg, run) => (NR2.eggAnomalies && egg && EGG_ANOMALIES[egg] && run.region !== 'source' && run.region !== 'tutorial' && !run.daily ? EGG_ANOMALIES[egg] : null);
