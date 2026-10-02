// The home screen around the LCD: vitals, readout, log, alerts and the inventory.
import { act, alertReason, bedtimeOnDevice, eventMinutesLeft, inFlow, isAlive, overclocked, requestMinutesLeft, itemBlockReason, napBlockReason, napMinutesLeft, rebootMinutesLeft, resting, tick, CFG, EVENTS, FORM_MODS, INVENTORY_SLOTS, ITEMS, SCRIP, SPECIES, TRAITS, sellValue, traitLabel, lineOf, visitorName, friendHandle, visitHidden } from '../sim.js';
import { atMarket, contractMinutesLeft, contractText, fmtLeft, sellItem } from '../netrun/run.js';
import { drawSprite, ITEM_SPRITES, ITEM_COLORS } from '../sprites.js';
import { sfx, unlockAudio } from '../audio.js';
import { notify } from '../notify.js';
import { $, app, armed, disarm, flashStatus, now, playAnim, save } from './app.js';
import { chatterById } from '../chatter.js';
import { hearChatter } from './style.js';
import { renderNudge } from './onboarding.js';
import { renderHibernation } from './system.js';

export function fmtAge(min) {
  const d = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`;
}

// A stat bar: its fill, a danger look that doesn't rely on color alone, and its value for screen
// readers (the bar is a meter).
function setBar(id, value, danger, dangerWord) {
  const el = $(id);
  const v = Math.round(value);
  el.style.setProperty('--v', `${value}%`);
  el.classList.toggle('danger', danger);
  el.closest('.stat').classList.toggle('danger', danger);
  el.setAttribute('aria-valuenow', v);
  el.setAttribute('aria-valuetext', danger ? `${v}, ${dangerWord}` : String(v));
}

// What the LCD shows, in words, for screen readers (the canvas is an image with this label).
function screenSummary(state) {
  if (app.session) return state.run ? 'Netrun map on screen.' : 'Mini-game on screen.';
  if (state.stage === 'dead') return 'Flatlined.';
  if (state.stage === 'script') return 'Compiling a new netling.';
  const parts = [SPECIES[state.form].name];
  if (state.hibernation) parts.push('hibernating');
  else if (rebootMinutesLeft(state) > 0) parts.push('rebooting');
  else if (state.nap) parts.push('napping');
  else parts.push(resting(state) ? 'asleep' : 'awake');
  parts.push(state.lightsOn ? 'lights on' : 'lights off');
  if (state.virus) parts.push('infected');
  const reason = alertReason(state);
  return `${parts.join(', ')}.${reason ? ` ${reason.msg}` : ''}`;
}

// Log lines: added one by one, so a screen reader (the log is a polite live region) hears only
// the new ones rather than the whole log again.
const logKeyOf = (e) => `${e.t}|${e.msg}`;
function logItem(e) {
  const li = document.createElement('li');
  li.dataset.key = logKeyOf(e);
  li.textContent = `${new Date(e.t).toTimeString().slice(0, 5)} ${e.msg}`;
  if (e.msg.includes('!!') || e.msg.includes('mistake') || e.msg.includes('FLATLINE')) li.className = 'warn';
  return li;
}
function renderLog(logEl, lines) {
  const lastShown = logEl.lastElementChild?.dataset.key;
  const from = lastShown ? lines.findLastIndex((e) => logKeyOf(e) === lastShown) : -1;
  if (lastShown && from === -1) return logEl.replaceChildren(...lines.map(logItem)); // a new netling
  logEl.append(...lines.slice(from + 1).map(logItem));
  while (logEl.childElementCount > lines.length) logEl.firstElementChild.remove(); // the log is capped
}

export function updateHUD() {
  const state = app.state;
  const st = state.stats;
  setBar('bar-charge', st.charge, st.charge < 20, 'low');
  setBar('bar-sync', st.sync, st.sync < 20, 'low');
  setBar('bar-integrity', st.integrity, st.integrity < 30, 'low');
  setBar('bar-heat', st.heat, st.heat > 80, 'too hot');
  const oc = overclocked(state) && isAlive(state);
  const heatStat = $('bar-heat').closest('.stat');
  heatStat.classList.toggle('oc', oc);
  heatStat.querySelector('label').textContent = oc ? 'OC' : 'HEAT';
  heatStat.title = oc
    ? 'Overclocked: games and ICE run slower and wins find more, but losses cost Sync and Integrity, ICE bites harder and trouble comes more often.'
    : 'Heat: running hot hurts it. Cool it down.';
  if (oc) $('bar-heat').setAttribute('aria-valuetext', `${$('bar-heat').getAttribute('aria-valuetext')}, overclocked`);
  document.querySelectorAll('#cache-pips i').forEach((pip, i) => pip.classList.toggle('on', i < state.cache));
  $('cache-pips').setAttribute('aria-valuenow', state.cache);
  $('cache-pips').setAttribute('aria-valuetext', state.cache >= 3 ? `${state.cache} files, piling up` : `${state.cache} files`);
  $('stat-cache').classList.toggle('danger', state.cache >= 3);
  const summary = screenSummary(state);
  if ($('lcd').getAttribute('aria-label') !== summary) $('lcd').setAttribute('aria-label', summary);

  const trait = `${traitLabel(state.trait, state.traitLevel) ?? '—'}${state.history ? ` · history ${TRAITS[state.history].name}` : ''}`;
  const species = state.stage === 'script' ? 'compiling' : SPECIES[state.form].name;
  const bed = bedtimeOnDevice(state, now());
  const clock = (n) => String(n).padStart(2, '0');
  $('readout').textContent =
    `v${state.generation}.0 ${species} · age ${fmtAge(state.ageMin)} · bed ${clock(Math.floor(bed / 60))}:${clock(bed % 60)} · faults ${state.careMistakes}/${CFG.maxMistakes} · trait ${trait}`;
  if (state.stage !== 'script' && (state.rootAccess || state.rootCooling)) {
    $('readout').textContent += ` · root ${state.rootCooling ? 'cooling' : state.rootUsed ? 'spent' : 'ready'}`;
  }
  const perk = FORM_MODS[lineOf(state.form)];
  $('readout').title = perk ? `${SPECIES[state.form].name}: ${perk.desc}` : '';
  if (state.nap) $('readout').textContent += ` · napping, ${fmtAge(napMinutesLeft(state))} left`;
  if (rebootMinutesLeft(state) > 0) $('readout').textContent += ` · rebooting, ${rebootMinutesLeft(state)}m left`;
  if (inFlow(state)) $('readout').textContent += ' · in flow';
  if (oc) $('readout').textContent += ' · overclocked';
  $('btn-lights').textContent = state.lightsOn ? 'LIGHTS OFF' : 'LIGHTS ON';
  $('btn-nap').textContent = state.nap ? 'WAKE UP' : 'NAP';
  $('btn-nap').title = state.nap ? 'End the nap early' : napBlockReason(state) ?? `Rest for up to ${CFG.napMaxMin / 60}h: stats drain far slower`;
  renderInventory();
  renderSpeech(renderNudge());
  renderWish(state);
  renderHibernation();
  // The timed event, if any, with the buttons that answer it.
  const eventLeft = eventMinutesLeft(state);
  const type = state.event?.type;
  $('event-bar').hidden = !(eventLeft > 0 && isAlive(state));
  if (type) {
    $('event-name').textContent = EVENTS[type].label;
    $('event-timer').textContent = `${eventLeft}m`;
    document.querySelectorAll('#event-bar [data-event]').forEach((b) => (b.hidden = b.dataset.event !== type));
  }
  document.body.classList.toggle('asleep', resting(state));

  // Redrawn when a line is added (the log is capped, so its length alone stops changing).
  const logEl = $('log');
  const last = state.log[state.log.length - 1];
  const logKey = `${state.log.length}|${last?.t}|${last?.msg}`;
  if (logKey !== app.lastLogKey || logEl.childElementCount === 0) {
    app.lastLogKey = logKey;
    // Follow new lines unless the player has scrolled up to read older ones.
    const atBottom = logEl.scrollHeight - logEl.scrollTop - logEl.clientHeight < 8;
    renderLog(logEl, state.log);
    if (atBottom) logEl.scrollTop = logEl.scrollHeight;
  }

  // Chirp (or notify, when backgrounded) each time a new need appears. Screen readers hear it too;
  // timed events are already announced by the event bar (an alert).
  const reason = alertReason(state);
  if (reason && reason.key !== app.lastAttention) {
    if (document.hidden) pushAlert('Netling needs you', reason.msg);
    else sfx('alert', state.quirk.pitch);
    if (!EVENTS[reason.key]) $('sr-announce').textContent = reason.msg;
  }
  app.lastAttention = reason?.key ?? false;
}

// What an open request asks for, in words.
export function requestText(r) {
  return r.kind === 'cool' ? 'It is running warm and wants a COOL.' : `It wants to play ${r.game.toUpperCase()}.`;
}

// The request bar: what it wants and how long it will wait, and GREET while a visitor is here.
// Calm on purpose (not an alert): missing any of it costs nothing.
function renderWish(state) {
  const on = isAlive(state) && !resting(state) && !app.session && !state.run;
  const r = on ? state.request : null;
  const v = on && state.visit && !state.visit.greeted ? state.visit : null;
  const c = on ? state.contract : null;
  $('wish-bar').hidden = !r && !v && !c;
  $('wish-run').hidden = !c || Boolean(r || v); // the bar has room for one button at a time
  if (!r && !v && !c) return;
  const parts = [];
  if (r) parts.push(`${r.kind === 'cool' ? 'it is fanning itself' : `it wants ${r.game.toUpperCase()}`} · ${requestMinutesLeft(state)}m`);
  if (v) parts.push(v.friend ? `${friendHandle(v.form, v.friend.gen, visitHidden(state, v))} is in #netling` : `a ${visitorName(state, v)} dropped by`);
  if (c) parts.push(`contract: ${contractText(c)} · ${fmtLeft(contractMinutesLeft(state))}`);
  $('wish-text').textContent = parts.join(' · ');
  $('wish-play').hidden = r?.kind !== 'game';
  if (r?.kind === 'game') $('wish-play').textContent = `PLAY ${r.game.toUpperCase()}`;
  $('wish-cool').hidden = r?.kind !== 'cool';
  $('wish-greet').hidden = !v;
}

// Chatter in the speech bubble (the onboarding nudge has it first). A line counts as heard once it
// has been on screen with the page visible.
function renderSpeech(nudging) {
  if (nudging) return;
  const state = app.state;
  const line = isAlive(state) && !resting(state) && !app.session && !state.run && state.chatter ? chatterById(state.chatter.id) : null;
  $('speech').hidden = !line;
  if (!line) return;
  if ($('speech').textContent !== line.text) $('speech').textContent = line.text;
  $('speech').classList.toggle('visitor', line.group === 'visitor');
  if (!document.hidden && $('flatline').hidden && hearChatter(line.id)) $('sr-announce').textContent = line.text;
}

export function pushAlert(title, body) {
  if (app.prefs.alerts && document.hidden) notify(title, body);
}

// --- inventory ---

// Items that do what a care action does look the same on screen.
const ITEM_ANIMS = { coolant: 'cool', antivirus: 'patch', voucher: 'eat', repair: 'patch' };

let selectedSlot = null;
let lastInvKey = '';

function itemIcon(id) {
  const c = document.createElement('canvas');
  c.width = 7;
  c.height = 7;
  drawSprite(c.getContext('2d'), ITEM_SPRITES[id], 0, 0, {
    '#': ITEM_COLORS[id],
    o: '#1c3a3f',
    '+': '#f5f5f5',
  });
  return c;
}

// At an open netrun market an item sells for half its price; anywhere else it scraps for a quarter.
const sellLabel = (id) => (atMarket(app.state) ? `SELL +${sellValue(id, true)}` : `SCRAP +${sellValue(id)}`);

function renderInventory() {
  const inv = app.state.inventory ?? [];
  if (selectedSlot !== null && !inv[selectedSlot]) selectedSlot = null;
  const scrip = app.state.scrip ?? 0;
  // The reward box: shown once the first check-in is in, with a count of what waits in it.
  $('open-box').hidden = !app.checkin?.claims && !app.rewardBox?.length;
  $('open-box').textContent = app.rewardBox?.length ? `BOX ${app.rewardBox.length}` : 'BOX';
  $('open-box').classList.toggle('full', Boolean(app.rewardBox?.length));
  $('inv-scrip').textContent = `SCRIP ${scrip}/${SCRIP.max}${scrip >= SCRIP.max ? ' FULL' : ''}`;
  $('inv-scrip').classList.toggle('full', scrip >= SCRIP.max);
  const key = `${inv.join(',')}|${selectedSlot}|${atMarket(app.state)}`;
  if (key !== lastInvKey) {
    lastInvKey = key;
    // A SCRAP confirm belongs to the item it was pressed for: a new selection starts over.
    disarm($('inv-discard'), selectedSlot === null ? 'SCRAP' : sellLabel(inv[selectedSlot]));
    disarm($('inv-use'), 'USE');
    const slots = [];
    for (let i = 0; i < INVENTORY_SLOTS; i++) {
      const id = inv[i];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = id ? 'inv-slot filled' : 'inv-slot';
      b.disabled = !id;
      b.setAttribute('aria-label', id ? ITEMS[id].name : 'empty slot');
      b.setAttribute('aria-pressed', i === selectedSlot);
      if (id) {
        b.title = ITEMS[id].name;
        b.append(itemIcon(id));
        b.addEventListener('click', () => {
          selectedSlot = selectedSlot === i ? null : i;
          sfx('move', app.state.quirk.pitch);
          renderInventory();
        });
      }
      slots.push(b);
    }
    $('inv-slots').replaceChildren(...slots);
  }
  const detail = $('inv-detail');
  detail.hidden = selectedSlot === null;
  if (selectedSlot !== null) {
    const id = inv[selectedSlot];
    $('inv-name').textContent = ITEMS[id].name;
    $('inv-desc').textContent = ITEMS[id].desc;
    const blocked = itemBlockReason(app.state, selectedSlot);
    $('inv-use').disabled = Boolean(blocked);
    $('inv-use').title = blocked ?? '';
  }
}

export function initInventory() {
  $('inv-use').addEventListener('click', () => {
    if (selectedSlot === null) return;
    unlockAudio();
    tick(app.state, now());
    const id = app.state.inventory[selectedSlot];
    // A Segfault adds faults, and faults can end a life: it takes a second press.
    if (id === 'segfault' && !armed($('inv-use'), '+2 FAULTS?', 'USE', 3000)) return;
    const res = act(app.state, 'use', now(), Math.random, { slot: selectedSlot });
    sfx(res.sfx, app.state.quirk.pitch);
    playAnim(res.ok ? ITEM_ANIMS[id] ?? 'item' : 'refuse');
    if (!res.ok) flashStatus(res.msg);
    selectedSlot = null;
    save();
    updateHUD();
  });
  $('inv-discard').addEventListener('click', () => {
    if (selectedSlot === null) return;
    if (!armed($('inv-discard'), 'SURE?', sellLabel(app.state.inventory[selectedSlot]), 3000)) return;
    if (atMarket(app.state)) {
      sellItem(app.state, selectedSlot);
      sfx('feed', app.state.quirk.pitch);
    } else {
      const res = act(app.state, 'discard', now(), Math.random, { slot: selectedSlot });
      sfx(res.sfx, app.state.quirk.pitch);
    }
    selectedSlot = null;
    save();
    updateHUD();
  });
  $('inv-cancel').addEventListener('click', () => {
    selectedSlot = null;
    renderInventory();
  });
}
