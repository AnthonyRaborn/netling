// Netrun rules. The run lives on the pet (pet.run) so it survives reloads, and it spends the pet's real stats.
import { addScrip, grantItem, isAlive, log, resting, runCooldownAtFloor, runCooldownLeft, sellValue, GAME_IDS, ITEMS, CFG, SCRIP } from '../sim.js';
import { generateMap, nodeById } from './map.js';
import { REGIONS, REGION_ORDER, STAGE_ORDER, regionLock } from './regions.js';
import { nextFragment, fragmentById } from './codex.js';
import { rollAccessory, accessoryById, RARITY } from '../accessories.js';
import { ANOMALIES } from './anomalies.js';
import { weighted } from '../random.js';

// The uplink cooldown lives in sim.js (CFG.runCooldownMin and friends), where items can shorten it.
export { runCooldownLeft };

export const RUN_CFG = {
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
  rebootIntegrity: 30,
  jackOutRestore: 0.5, // a clean jack-out re-syncs half the Integrity the run cost
  disconnectSync: 20,
  hideCharge: 8,
  hideHeat: 8,
  hideCaughtChance: 0.25,
  caughtDamage: 15,
  complyDamage: 5,
  marketPrice: 12, // Charge per purchase, on top of the item's scrip price (SCRIP.price)
  cacheFragmentChance: 0.15,
  // A netling's memory holds this many new codex fragments; the rest wait for the next generation.
  codexPerLife: 8,
  // Loose scrip, banked on jack-out like loot.
  exitScrip: 3,
  cacheScripChance: 0.3, // an empty cache
  cacheScrip: 3,
  // Accessories: mostly bought at markets, rarely found.
  accPrice: 20,
  accScrip: { common: 25, rare: 50 },
  marketAccChance: 0.5,
  cacheAccChance: 0.03,
  iceWinAccChance: 0.05,
  exitAccChance: 0.08,
  exitFragmentChance: 0.6,
  echoFragmentChance: 0.5,
  firewallIceMult: 0.5,
};

// Adult form abilities, applied automatically.
export const FORM_ABILITIES = {
  chrome: 'Corp credentials: checkpoints wave it through.',
  firewall: 'Hardened: ICE deals half damage.',
  daemon: 'Lookahead: sees node types two steps ahead.',
  glitch: 'Phase: slips through the first ICE of each run.',
  ghost: 'Unseen: sees every node; checkpoints never notice it.',
};
const ability = (pet) => (pet.stage === 'adult' ? pet.form : null);

const clamp = (v) => Math.min(100, Math.max(0, v));

// Why a run can't start, or null.
export function runBlockReason(pet, region = 'public', codex = []) {
  if (!isAlive(pet)) return pet.stage === 'script' ? 'still compiling...' : 'no signal.';
  if (pet.run) return null; // resuming
  if (pet.hibernation) return 'hibernating.';
  if (REGIONS[region].tutorial) return null; // the first run is always allowed
  if (resting(pet)) return pet.nap ? 'napping. wake it first.' : 'in low-power mode.';
  if ((pet.rebootUntilAge ?? 0) > pet.ageMin) return 'still rebooting.';
  const lock = regionLock(region, pet.stage, codex, pet.cleared ?? []);
  if (lock) return `${REGIONS[region].name}: ${lock}`;
  const cd = runCooldownLeft(pet);
  if (cd > 0) {
    const left = cd >= 60 ? `${Math.floor(cd / 60)}h${cd % 60 ? ` ${cd % 60}m` : ''}` : `${cd}m`;
    return `uplink cooling down${runCooldownAtFloor(pet) ? ', laying low from corp sweeps' : ''}. ${left} left.`;
  }
  if (pet.stats.charge < RUN_CFG.minCharge) return `needs ${RUN_CFG.minCharge}+ charge to jack in.`;
  return null;
}

export function startRun(pet, region, rng, codex = [], ownedAccessories = []) {
  const map = generateMap(region, rng);
  pet.run = {
    region,
    map,
    pos: map.nodes[0].id,
    visited: [map.nodes[0].id],
    loot: [],
    phase: 'map', // map | ice | choice | done
    pending: null, // ice: { game } | choice: { kind, title, text, options, ... }
    revealed: [],
    phased: false,
    known: [...codex], // codex at jack-in, so fragments never repeat
    startStats: { ...pet.stats },
    tally: { nodes: 0, iceWon: 0, iceLost: 0 },
    fragments: [], // found this run; banked on jack-out like loot
    knownAcc: [...ownedAccessories],
    accessories: [], // found or bought this run; banked on jack-out like loot
    scrip: 0, // loose scrip found this run; banked on jack-out like loot
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

// Rolls an accessory this run doesn't have yet, if any (never in the tutorial). Returns a log suffix.
function takeAccessory(run, rng) {
  if (REGIONS[run.region].noStyleDrops) return '';
  const id = rollAccessory([...run.knownAcc, ...run.accessories], rng, run.region);
  if (!id) return '';
  run.accessories.push(id);
  return ` accessory: ${accessoryById(id).name}!`;
}

export const codexRoom = (pet) => Math.max(0, RUN_CFG.codexPerLife - (pet.codexFound ?? 0) - (pet.run?.fragments.length ?? 0));

// Picks up the region's next unread fragment, if any. Returns a log suffix.
function takeFragment(pet) {
  const run = pet.run;
  const id = nextFragment(REGIONS[run.region].codexRegion ?? run.region, [...run.known, ...run.fragments]);
  if (!id) return '';
  if (!codexRoom(pet)) return ' a codex fragment, but its memory is full: it will keep for the next generation.';
  run.fragments.push(id);
  return ` codex fragment: "${fragmentById(id).title}".`;
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
  if (run.tally) run.tally.nodes++;
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
      const frag = (rng() < RUN_CFG.cacheFragmentChance ? takeFragment(pet) : '') + (rng() < RUN_CFG.cacheAccChance ? takeAccessory(run, rng) : '');
      if (rng() < (region.cacheFind ?? RUN_CFG.cacheFindChance)) {
        const item = weighted(region.loot, rng);
        run.loot.push(item);
        note(run, `cache cracked: ${ITEMS[item].name}.${frag}`);
        return { ok: true, kind: 'cache', item, fragment: Boolean(frag) };
      }
      if (rng() < RUN_CFG.cacheScripChance) {
        run.scrip = (run.scrip ?? 0) + RUN_CFG.cacheScrip;
        note(run, `cache held ${RUN_CFG.cacheScrip} loose scrip.${frag}`);
        return { ok: true, kind: 'cache', item: null, fragment: Boolean(frag) };
      }
      note(run, frag ? `cache held no items.${frag}` : 'cache was empty.');
      return { ok: true, kind: 'cache', item: null, fragment: Boolean(frag) };
    }
    case 'ice': {
      if (ability(pet) === 'glitch' && !run.phased) {
        run.phased = true;
        note(run, 'glitched straight through the ICE.');
        return { ok: true, kind: 'ice', phased: true };
      }
      const game = GAME_IDS[Math.floor(rng() * GAME_IDS.length)];
      run.phase = 'ice';
      run.pending = { game };
      return { ok: true, kind: 'ice', game };
    }
    case 'relay': {
      st.charge = clamp(st.charge + RUN_CFG.relayCharge);
      st.heat = clamp(st.heat - RUN_CFG.relayCool);
      note(run, 'relay found. recharged and vented.');
      openChoice(run, {
        kind: 'relay',
        title: 'RELAY',
        text: 'recharged and vented. safe place to bank your loot.',
        options: [
          { id: 'continue', label: 'CONTINUE', hint: 'keep going' },
          { id: 'out', label: `JACK OUT (${run.loot.length})`, hint: 'bank loot, end run' },
        ],
      });
      return { ok: true, kind: 'relay' };
    }
    case 'checkpoint': {
      const form = ability(pet);
      if (form === 'chrome' || form === 'ghost') {
        note(run, form === 'chrome' ? 'checkpoint: credentials accepted.' : 'checkpoint: it never saw you.');
        return { ok: true, kind: 'checkpoint', auto: true };
      }
      const hasVoucher = pet.inventory.includes('voucher');
      openChoice(run, {
        kind: 'checkpoint',
        title: 'CORP CHECKPOINT',
        text: 'a scanner sweeps the node. identify yourself.',
        options: [
          { id: 'hide', label: 'HIDE', hint: `-${RUN_CFG.hideCharge} chg, may get scorched` },
          { id: 'comply', label: 'COMPLY', hint: 'they may confiscate loot' },
          { id: 'voucher', label: 'VOUCHER', hint: hasVoucher ? 'spend one, pass clean' : 'none in inventory', disabled: !hasVoucher },
        ],
      });
      return { ok: true, kind: 'checkpoint' };
    }
    case 'market': {
      const table = region.market ?? region.loot;
      const offers = [weighted(table, rng)];
      for (let i = 0; i < 10 && offers.length < 2; i++) {
        const next = weighted(table, rng);
        if (next !== offers[0]) offers.push(next);
      }
      const price = region.marketPrice ?? RUN_CFG.marketPrice;
      const accOffer = rng() < RUN_CFG.marketAccChance ? rollAccessory([...run.knownAcc, ...run.accessories], rng, run.region) : null;
      openChoice(run, {
        kind: 'market',
        title: 'BLACK MARKET',
        text: `a vendor process. scrip, plus ${price} charge.`,
        offers,
        price,
        accOffer,
        options: [
          ...offers.map((id, i) => ({ id: `buy${i}`, label: `${ITEMS[id].name.toUpperCase()} ${SCRIP.price[id]}$` })),
          ...(accOffer ? [{ id: 'buyacc', label: `${accessoryById(accOffer).name.toUpperCase()} ${accScrip(accOffer)}$` }] : []),
          { id: 'leave', label: 'LEAVE', hint: 'buy nothing. sell from the inventory first.' },
        ],
      });
      refreshMarket(pet);
      return { ok: true, kind: 'market' };
    }
    case 'anomaly': {
      const ev = ANOMALIES[Math.floor(rng() * ANOMALIES.length)];
      openChoice(run, {
        kind: 'anomaly',
        event: ev.id,
        title: ev.title,
        text: ev.text,
        options: ev.options.map(({ id, label, hint }) => ({ id, label, hint })),
      });
      return { ok: true, kind: 'anomaly', event: ev.id };
    }
    case 'exit': {
      const bonus = Array.from({ length: region.exitBonus ?? 1 }, () => weighted(region.loot, rng));
      run.loot.push(...bonus);
      run.scrip = (run.scrip ?? 0) + RUN_CFG.exitScrip;
      const frag = (rng() < (region.exitFragment ?? RUN_CFG.exitFragmentChance) ? takeFragment(pet) : '') + (rng() < RUN_CFG.exitAccChance ? takeAccessory(run, rng) : '');
      // Reaching an exit opens the next region down, for this netling. The tutorial doesn't count.
      const opened = !region.tutorial && !(pet.cleared ??= []).includes(run.region);
      if (opened) pet.cleared.push(run.region);
      const next = opened && REGION_ORDER[REGION_ORDER.indexOf(run.region) + 1];
      const young = next && STAGE_ORDER.indexOf(pet.stage) < STAGE_ORDER.indexOf(REGIONS[next].minStage);
      // The Deep stays unnamed: its way in is a secret.
      const opens = next && !REGIONS[next].requires ? `: the ${REGIONS[next].name} ${young ? 'opens once it grows up' : 'is open to it'}.` : '.';
      note(run, `exit node. bonus: ${bonus.map((b) => ITEMS[b].name).join(', ')}, ${RUN_CFG.exitScrip} scrip.${frag}${opened ? ` region cleared${opens}` : ''}`);
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
  if (run.tally) run.tally[won ? 'iceWon' : 'iceLost']++;
  if (won) {
    const acc = rng() < RUN_CFG.iceWinAccChance ? takeAccessory(run, rng) : '';
    if (rng() < RUN_CFG.iceWinLootChance) {
      const item = weighted(REGIONS[run.region].loot, rng);
      run.loot.push(item);
      note(run, `ICE shattered. salvaged ${ITEMS[item].name}.${acc}`);
    } else {
      note(run, `ICE shattered.${acc}`);
    }
    return { ok: true, won };
  }
  const dmg = Math.round(REGIONS[run.region].iceDamage * (ability(pet) === 'firewall' ? RUN_CFG.firewallIceMult : 1));
  st.integrity = clamp(st.integrity - dmg);
  st.heat = clamp(st.heat + RUN_CFG.iceLossHeat);
  note(run, `ICE bit back. -${dmg} integrity.`);
  if (st.integrity <= 0) return disconnect(pet, 'integrity breached by ICE.');
  return { ok: true, won };
}

function openChoice(run, pending) {
  run.phase = 'choice';
  run.pending = pending;
}

const accScrip = (id) => RUN_CFG.accScrip[accessoryById(id)?.rarity === 'common' ? 'common' : 'rare'];

// Market buttons follow what the netling can afford right now (it can sell mid-choice).
export function refreshMarket(pet) {
  const p = pet.run?.pending;
  if (p?.kind !== 'market') return;
  const scrip = pet.scrip ?? 0;
  const charge = pet.stats.charge;
  for (const o of p.options) {
    if (o.id === 'leave') continue;
    const acc = o.id === 'buyacc';
    const cost = acc ? accScrip(p.accOffer) : SCRIP.price[p.offers[Number(o.id.slice(3))]];
    const chg = acc ? RUN_CFG.accPrice : p.price;
    const short = scrip < cost ? `needs ${cost} scrip, has ${scrip}` : charge <= chg + 5 ? `needs ${chg + 5}+ charge` : null;
    o.disabled = Boolean(short);
    o.hint = short ?? `-${cost} scrip, -${chg} chg${acc ? ` · ${accessoryById(p.accOffer).rarity === 'common' ? 'accessory' : 'rare accessory'}` : ''}`;
  }
}

// Whether the open choice is a market, where the inventory sells for more.
export const atMarket = (pet) => pet.run?.phase === 'choice' && pet.run.pending?.kind === 'market';

// Sells an inventory slot: half the price at an open market, a quarter anywhere else (SCRAP).
export function sellItem(pet, slot) {
  const id = pet.inventory?.[slot];
  if (!id) return { ok: false, msg: 'empty slot.' };
  const market = atMarket(pet);
  pet.inventory.splice(slot, 1);
  const value = sellValue(id, market);
  const over = addScrip(pet, value);
  const msg = `${ITEMS[id].name.toLowerCase()} ${market ? 'sold' : 'scrapped'} for ${value} scrip.${over ? ' scrip full: the rest is lost.' : ''}`;
  if (market) {
    note(pet.run, msg);
    refreshMarket(pet);
  }
  return { ok: true, msg, value, market };
}

// Resolve the open choice node. Returns { ok, msg, result? }.
export function choose(pet, optionId, rng) {
  const run = pet.run;
  if (run.phase !== 'choice') return { ok: false, msg: 'nothing to choose.' };
  const p = run.pending;
  if (p.kind === 'market') refreshMarket(pet); // selling since it opened may have changed what it can afford
  const opt = p.options.find((o) => o.id === optionId);
  if (!opt || opt.disabled) return { ok: false, msg: 'not available.' };
  // The inventory stays usable mid-choice, so the voucher offered on arrival may be gone.
  if (p.kind === 'checkpoint' && optionId === 'voucher' && !pet.inventory.includes('voucher')) {
    Object.assign(opt, { disabled: true, hint: 'none in inventory' });
    return { ok: false, msg: 'no voucher left.' };
  }
  const st = pet.stats;
  run.phase = 'map';
  run.pending = null;
  const region = REGIONS[run.region];
  const lean = (a, b) => {
    pet.axes.allegiance += a;
    pet.axes.stability += b;
  };
  const loot = (fixed) => {
    const item = fixed ?? weighted(region.loot, rng);
    run.loot.push(item);
    return `+${ITEMS[item].name}.`;
  };
  const hurt = (n, why) => {
    st.integrity = clamp(st.integrity - n);
    return `${why} -${n} integrity.`;
  };
  let msg = '';

  if (p.kind === 'relay') {
    if (optionId === 'out') return jackOut(pet);
    return { ok: true };
  }
  if (p.kind === 'checkpoint') {
    if (optionId === 'hide') {
      st.charge = clamp(st.charge - RUN_CFG.hideCharge);
      st.heat = clamp(st.heat + RUN_CFG.hideHeat);
      lean(-1, 0);
      msg = rng() < RUN_CFG.hideCaughtChance ? hurt(RUN_CFG.caughtDamage, 'slipped past, but got scorched.') : 'slipped past the scanner.';
    } else if (optionId === 'comply') {
      lean(1, 0);
      if (run.loot.length) {
        const taken = run.loot.splice(Math.floor(rng() * run.loot.length), 1)[0];
        msg = `scanned. confiscated: ${ITEMS[taken].name}.`;
      } else {
        msg = `scanned. ${hurt(RUN_CFG.complyDamage, 'invasive probe.')}`;
      }
    } else {
      pet.inventory.splice(pet.inventory.indexOf('voucher'), 1);
      lean(1, 0);
      msg = 'voucher accepted. waved through.';
    }
  } else if (p.kind === 'market') {
    if (optionId === 'leave') {
      msg = 'left the market.';
    } else if (optionId === 'buyacc') {
      st.charge = clamp(st.charge - RUN_CFG.accPrice);
      pet.scrip -= accScrip(p.accOffer);
      run.accessories.push(p.accOffer);
      msg = `bought ${accessoryById(p.accOffer).name} for your style.`;
    } else {
      const item = p.offers[Number(optionId.slice(3))];
      st.charge = clamp(st.charge - p.price);
      pet.scrip -= SCRIP.price[item];
      run.loot.push(item);
      lean(-0.5, 0);
      msg = `bought ${ITEMS[item].name}.`;
    }
  } else if (p.kind === 'anomaly') {
    const ev = ANOMALIES.find((e) => e.id === p.event);
    const reveal = (depth) => {
      for (const id of nodesWithin(run, run.pos, depth)) if (!run.revealed.includes(id)) run.revealed.push(id);
    };
    const fragment = (chance) => (rng() < chance ? takeFragment(pet) : '');
    msg = ev.options.find((o) => o.id === optionId).apply({ pet, run, rng, loot, hurt, lean, reveal, fragment });
    st.charge = clamp(st.charge);
    st.heat = clamp(st.heat);
    st.sync = clamp(st.sync);
  }
  note(run, msg);
  if (st.integrity <= 0) return disconnect(pet, 'integrity collapsed mid-run.');
  if (st.charge <= 0) return disconnect(pet, 'power drained mid-run.');
  return { ok: true, msg };
}

// Kept for older callers: relay decisions go through choose().
export const relayChoice = (pet, choice) => choose(pet, choice === 'out' ? 'out' : 'continue');

function nodesWithin(run, fromId, depth) {
  let frontier = [fromId];
  const out = new Set();
  for (let d = 0; d < depth; d++) {
    frontier = frontier.flatMap((id) => nodeById(run.map, id).edges);
    frontier.forEach((id) => out.add(id));
  }
  return [...out];
}

// Which node types the player can see: visited, adjacent, revealed, plus form sight.
export function visibleNodeIds(pet) {
  const run = pet.run;
  const ids = new Set([...run.visited, ...run.revealed, ...nodeById(run.map, run.pos).edges]);
  const form = ability(pet);
  if (form === 'ghost') run.map.nodes.forEach((n) => ids.add(n.id));
  if (form === 'daemon') nodesWithin(run, run.pos, 2).forEach((id) => ids.add(id));
  return ids;
}

function endRun(pet, result) {
  const run = pet.run;
  run.phase = 'done';
  run.result = result;
  if (!REGIONS[run.region].noCooldown) {
    pet.lastRunEndAge = pet.ageMin;
    // A clean clear (out through the front door, no ICE lost) shortens the next cooldown.
    const clean = result === 'jacked' && (run.tally?.iceLost ?? 0) === 0;
    pet.runCooldownCut = clean ? CFG.runCleanCutMin : 0;
  }
  pet.runStats ??= { runs: 0, jacked: 0, disconnected: 0, aborted: 0 };
  pet.runStats.runs++;
  pet.runStats[result]++;
}

export function jackOut(pet) {
  const run = pet.run;
  const lostInt = (run.startStats?.integrity ?? pet.stats.integrity) - pet.stats.integrity;
  const restored = lostInt > 0 ? Math.round(lostInt * RUN_CFG.jackOutRestore) : 0;
  pet.stats.integrity = clamp(pet.stats.integrity + restored);
  const kept = [];
  const lost = []; // scrapped for scrip: the inventory was full
  for (const item of run.loot) {
    if (grantItem(pet, item).includes('full')) lost.push(item);
    else kept.push(item);
  }
  const scrapped = lost.reduce((n, id) => n + sellValue(id), 0);
  const loose = run.scrip ?? 0;
  const over = addScrip(pet, loose);
  pet.codexFound = (pet.codexFound ?? 0) + run.fragments.length;
  const frags = run.fragments.length;
  const clean = !REGIONS[run.region].noCooldown && (run.tally?.iceLost ?? 0) === 0;
  note(
    run,
    `jacked out with ${kept.length} item${kept.length === 1 ? '' : 's'}` +
      `${frags ? ` and ${frags} fragment${frags === 1 ? '' : 's'}` : ''}.` +
      `${restored ? ` re-synced +${restored} integrity.` : ''}` +
      `${loose ? ` +${loose} scrip.` : ''}` +
      `${lost.length ? ` ${lost.length} scrapped for ${scrapped} scrip: inventory full.` : ''}` +
      `${over || (lost.length && pet.scrip >= SCRIP.max) ? ' scrip full.' : ''}` +
      `${clean ? ` clean clear: uplink cools ${CFG.runCleanCutMin / 60}h faster.` : ''}`,
  );
  // The codex lives outside the pet (shared across generations); main.js drains this inbox into it.
  pet.codexInbox = [...(pet.codexInbox ?? []), ...run.fragments];
  pet.accessoryInbox = [...(pet.accessoryInbox ?? []), ...(run.accessories ?? [])];
  endRun(pet, 'jacked');
  return { ok: true, result: 'jacked', kept, lost, fragments: [...run.fragments] };
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
  run.scrip = 0;
  run.fragments = [];
  run.accessories = [];
  endRun(pet, 'disconnected');
  return { ok: true, result: 'disconnected' };
}

// Bail out: forfeit the loot, no other penalty.
export function abortRun(pet) {
  pet.run.loot = [];
  pet.run.scrip = 0;
  pet.run.fragments = [];
  pet.run.accessories = [];
  note(pet.run, 'run aborted. loot abandoned.');
  endRun(pet, 'aborted');
  return { ok: true, result: 'aborted' };
}

// Called after the summary screen: clears the run and writes it to the pet's log.
export function closeRun(pet, t) {
  const run = pet.run;
  if (!run) return;
  const last = run.messages[run.messages.length - 1] ?? '';
  log(pet, t, `> netrun (${REGIONS[run.region].name}): ${last}`);
  pet.run = null;
}
