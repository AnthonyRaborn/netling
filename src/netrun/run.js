// Netrun rules. The run lives on the pet (pet.run) so it survives reloads, and it spends the pet's real stats.
import { grantItem, isAlive, GAME_IDS, ITEMS, CFG } from '../sim.js';
import { generateMap, nodeById } from './map.js';
import { REGIONS, regionOpen } from './regions.js';

export const RUN_CFG = {
  cooldownMin: 240,
  minCharge: 30,
  moveCharge: 4,
  moveHeat: 5,
  throttleHeat: 90, // above this, each move also costs Integrity
  throttleDamage: 6,
  cacheFindChance: 0.4,
  iceWinLootChance: 0.2,
  iceLossHeat: 12,
  relayCharge: 15,
  relayCool: 20,
  // Disconnection hurts but can't kill: it reboots to this Integrity and never deals the final care mistake.
  rebootIntegrity: 15,
  disconnectSync: 20,
};

const clamp = (v) => Math.min(100, Math.max(0, v));

function weighted(table, rng) {
  const entries = Object.entries(table);
  let r = rng() * entries.reduce((a, [, w]) => a + w, 0);
  for (const [k, w] of entries) if ((r -= w) < 0) return k;
  return entries[entries.length - 1][0];
}

export function runCooldownLeft(pet) {
  if (pet.lastRunEndAge == null) return 0;
  return Math.max(0, pet.lastRunEndAge + RUN_CFG.cooldownMin - pet.ageMin);
}

// Why a run can't start, or null.
export function runBlockReason(pet, region = 'public') {
  if (!isAlive(pet)) return pet.stage === 'script' ? 'still compiling...' : 'no signal.';
  if (pet.run) return null; // resuming
  if (pet.asleep) return 'in low-power mode.';
  if (!regionOpen(region, pet.stage)) return `${REGIONS[region].name} needs a more evolved netling.`;
  const cd = runCooldownLeft(pet);
  if (cd > 0) return `uplink cooling down. ${Math.ceil(cd / 60)}h left.`;
  if (pet.stats.charge < RUN_CFG.minCharge) return `needs ${RUN_CFG.minCharge}+ charge to jack in.`;
  return null;
}

export function startRun(pet, region, rng) {
  const map = generateMap(region, rng);
  pet.run = {
    region,
    map,
    pos: map.nodes[0].id,
    visited: [map.nodes[0].id],
    loot: [],
    phase: 'map', // map | ice | relay | done
    pending: null, // ice: { game }
    result: null, // jacked | disconnected | aborted
    messages: [],
    startedAge: pet.ageMin,
  };
  return pet.run;
}

export const runOptions = (run) => nodeById(run.map, run.pos).edges.map((id) => nodeById(run.map, id));

function note(run, msg) {
  run.messages.push(msg);
}

// Move to an adjacent node and trigger it. Returns the node's encounter.
export function moveTo(pet, nodeId, rng) {
  const run = pet.run;
  if (run.phase !== 'map') return { ok: false, msg: 'finish this node first.' };
  if (!runOptions(run).some((n) => n.id === nodeId)) return { ok: false, msg: 'no route to that node.' };
  const st = pet.stats;
  st.charge = clamp(st.charge - RUN_CFG.moveCharge);
  st.heat = clamp(st.heat + RUN_CFG.moveHeat);
  run.pos = nodeId;
  run.visited.push(nodeId);
  if (st.charge <= 0) return disconnect(pet, 'power drained mid-run.');
  if (st.heat >= RUN_CFG.throttleHeat) {
    st.integrity = clamp(st.integrity - RUN_CFG.throttleDamage);
    note(run, `thermal throttling. -${RUN_CFG.throttleDamage} integrity.`);
    if (st.integrity <= 0) return disconnect(pet, 'burned out from the heat.');
  }

  const node = nodeById(run.map, nodeId);
  const region = REGIONS[run.region];
  switch (node.type) {
    case 'cache': {
      if (rng() < RUN_CFG.cacheFindChance) {
        const item = weighted(region.loot, rng);
        run.loot.push(item);
        note(run, `cache cracked: ${ITEMS[item].name}.`);
        return { ok: true, kind: 'cache', item };
      }
      note(run, 'cache was empty.');
      return { ok: true, kind: 'cache', item: null };
    }
    case 'ice': {
      const game = GAME_IDS[Math.floor(rng() * GAME_IDS.length)];
      run.phase = 'ice';
      run.pending = { game };
      return { ok: true, kind: 'ice', game };
    }
    case 'relay': {
      st.charge = clamp(st.charge + RUN_CFG.relayCharge);
      st.heat = clamp(st.heat - RUN_CFG.relayCool);
      run.phase = 'relay';
      note(run, 'relay found. recharged and vented.');
      return { ok: true, kind: 'relay' };
    }
    case 'exit': {
      const bonus = weighted(region.loot, rng);
      run.loot.push(bonus);
      note(run, `exit node. bonus: ${ITEMS[bonus].name}.`);
      return { ok: true, kind: 'exit', ...jackOut(pet) };
    }
  }
  return { ok: true, kind: node.type };
}

export function resolveIce(pet, won, rng) {
  const run = pet.run;
  if (run.phase !== 'ice') return { ok: false };
  run.phase = 'map';
  run.pending = null;
  const st = pet.stats;
  if (won) {
    if (rng() < RUN_CFG.iceWinLootChance) {
      const item = weighted(REGIONS[run.region].loot, rng);
      run.loot.push(item);
      note(run, `ICE shattered. salvaged ${ITEMS[item].name}.`);
    } else {
      note(run, 'ICE shattered.');
    }
    return { ok: true, won };
  }
  st.integrity = clamp(st.integrity - REGIONS[run.region].iceDamage);
  st.heat = clamp(st.heat + RUN_CFG.iceLossHeat);
  note(run, `ICE bit back. -${REGIONS[run.region].iceDamage} integrity.`);
  if (st.integrity <= 0) return disconnect(pet, 'integrity breached by ICE.');
  return { ok: true, won };
}

// Relay choice: 'continue' back to the map, or jack out.
export function relayChoice(pet, choice) {
  const run = pet.run;
  if (run.phase !== 'relay') return { ok: false };
  if (choice === 'out') return jackOut(pet);
  run.phase = 'map';
  return { ok: true };
}

function endRun(pet, result) {
  const run = pet.run;
  run.phase = 'done';
  run.result = result;
  pet.lastRunEndAge = pet.ageMin;
  pet.runStats ??= { runs: 0, jacked: 0, disconnected: 0, aborted: 0 };
  pet.runStats.runs++;
  pet.runStats[result]++;
}

export function jackOut(pet) {
  const run = pet.run;
  const kept = [];
  const lost = [];
  for (const item of run.loot) {
    if (grantItem(pet, item).includes('full')) lost.push(item);
    else kept.push(item);
  }
  note(run, `jacked out with ${kept.length} item${kept.length === 1 ? '' : 's'}.${lost.length ? ` ${lost.length} lost: inventory full.` : ''}`);
  endRun(pet, 'jacked');
  return { ok: true, result: 'jacked', kept, lost };
}

export function disconnect(pet, why) {
  const run = pet.run;
  const st = pet.stats;
  st.integrity = Math.max(st.integrity, RUN_CFG.rebootIntegrity);
  st.charge = Math.max(st.charge, 5);
  st.sync = clamp(st.sync - RUN_CFG.disconnectSync);
  pet.axes.stability -= 1;
  // A care mistake, but never the fatal one.
  const mistake = pet.careMistakes < CFG.maxMistakes - 1;
  if (mistake) pet.careMistakes++;
  note(run, `DISCONNECTED: ${why} loot lost. emergency reboot.${mistake ? ' care mistake logged.' : ''}`);
  run.loot = [];
  endRun(pet, 'disconnected');
  return { ok: true, result: 'disconnected' };
}

// Bail out: forfeit the loot, no other penalty.
export function abortRun(pet) {
  pet.run.loot = [];
  note(pet.run, 'run aborted. loot abandoned.');
  endRun(pet, 'aborted');
  return { ok: true, result: 'aborted' };
}

// Called after the summary screen: clears the run and writes it to the pet's log.
export function closeRun(pet, t) {
  const run = pet.run;
  if (!run) return;
  const last = run.messages[run.messages.length - 1] ?? '';
  pet.log.push({ t, msg: `> netrun (${REGIONS[run.region].name}): ${last}` });
  pet.run = null;
}
