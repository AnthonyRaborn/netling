// The home screen around the LCD: vitals, readout, log, alerts and the inventory.
import { act, alertReason, bedtimeHour, isAlive, itemBlockReason, napBlockReason, napMinutesLeft, resting, tick, traceMinutesLeft, CFG, FORM_MODS, INVENTORY_SLOTS, ITEMS, SPECIES, TRAITS } from '../sim.js';
import { drawSprite, ITEM_SPRITES, ITEM_COLORS } from '../sprites.js';
import { sfx, unlockAudio } from '../audio.js';
import { notify } from '../notify.js';
import { $, app, armed, disarm, flashStatus, now, save } from './app.js';
import { renderNudge } from './onboarding.js';
import { renderHibernation } from './system.js';

export function fmtAge(min) {
  const d = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`;
}

function setBar(id, value, danger) {
  const el = $(id);
  el.style.setProperty('--v', `${value}%`);
  el.classList.toggle('danger', danger);
}

export function updateHUD() {
  const state = app.state;
  const st = state.stats;
  setBar('bar-charge', st.charge, st.charge < 20);
  setBar('bar-sync', st.sync, st.sync < 20);
  setBar('bar-integrity', st.integrity, st.integrity < 30);
  setBar('bar-heat', st.heat, st.heat > 80);
  document.querySelectorAll('#cache-pips i').forEach((pip, i) => pip.classList.toggle('on', i < state.cache));

  const trait = state.trait ? TRAITS[state.trait].name : '—';
  const species = state.stage === 'script' ? 'compiling' : SPECIES[state.form].name;
  $('readout').textContent =
    `v${state.generation}.0 ${species} · age ${fmtAge(state.ageMin)} · bed ${String(bedtimeHour(state)).padStart(2, '0')}:00 · faults ${state.careMistakes}/${CFG.maxMistakes} · trait ${trait}`;
  if (state.stage !== 'script' && (state.rootAccess || state.rootCooling)) {
    $('readout').textContent += ` · root ${state.rootCooling ? 'cooling' : state.rootUsed ? 'spent' : 'ready'}`;
  }
  const perk = FORM_MODS[state.form];
  $('readout').title = perk ? `${SPECIES[state.form].name}: ${perk.desc}` : '';
  if (state.nap) $('readout').textContent += ` · napping, ${fmtAge(napMinutesLeft(state))} left`;
  $('btn-lights').textContent = state.lightsOn ? 'LIGHTS OFF' : 'LIGHTS ON';
  $('btn-nap').textContent = state.nap ? 'WAKE UP' : 'NAP';
  $('btn-nap').title = state.nap ? 'End the nap early' : napBlockReason(state) ?? `Rest for up to ${CFG.napMaxMin / 60}h: stats drain far slower`;
  renderInventory();
  renderNudge();
  renderHibernation();
  const traceLeft = traceMinutesLeft(state);
  $('event-bar').hidden = !(traceLeft > 0 && isAlive(state));
  $('event-timer').textContent = `${traceLeft}m`;
  document.body.classList.toggle('asleep', resting(state));

  // Redrawn when a line is added (the log is capped, so its length alone stops changing).
  const logEl = $('log');
  const last = state.log[state.log.length - 1];
  const logKey = `${state.log.length}|${last?.t}|${last?.msg}`;
  if (logKey !== app.lastLogKey || logEl.childElementCount === 0) {
    app.lastLogKey = logKey;
    // Follow new lines unless the player has scrolled up to read older ones.
    const atBottom = logEl.scrollHeight - logEl.scrollTop - logEl.clientHeight < 8;
    logEl.replaceChildren(
      ...state.log.map((e) => {
        const li = document.createElement('li');
        const t = new Date(e.t);
        li.textContent = `${t.toTimeString().slice(0, 5)} ${e.msg}`;
        if (e.msg.includes('!!') || e.msg.includes('mistake') || e.msg.includes('FLATLINE')) li.className = 'warn';
        return li;
      }),
    );
    if (atBottom) logEl.scrollTop = logEl.scrollHeight;
  }

  // Chirp (or notify, when backgrounded) each time a new need appears.
  const reason = alertReason(state);
  if (reason && reason.key !== app.lastAttention) {
    if (document.hidden) pushAlert('Netling needs you', reason.msg);
    else sfx('alert', state.quirk.pitch);
  }
  app.lastAttention = reason?.key ?? false;
}

export function pushAlert(title, body) {
  if (app.prefs.alerts && document.hidden) notify(title, body);
}

// --- inventory ---

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

function renderInventory() {
  const inv = app.state.inventory ?? [];
  if (selectedSlot !== null && !inv[selectedSlot]) selectedSlot = null;
  const key = `${inv.join(',')}|${selectedSlot}`;
  if (key !== lastInvKey) {
    lastInvKey = key;
    // A DISCARD confirm belongs to the item it was pressed for: a new selection starts over.
    disarm($('inv-discard'), 'DISCARD');
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
    const res = act(app.state, 'use', now(), Math.random, { slot: selectedSlot });
    sfx(res.sfx, app.state.quirk.pitch);
    if (!res.ok) flashStatus(res.msg);
    selectedSlot = null;
    save();
    updateHUD();
  });
  $('inv-discard').addEventListener('click', () => {
    if (selectedSlot === null) return;
    if (!armed($('inv-discard'), 'SURE?', 'DISCARD', 3000)) return;
    const res = act(app.state, 'discard', now(), Math.random, { slot: selectedSlot });
    sfx(res.sfx, app.state.quirk.pitch);
    selectedSlot = null;
    save();
    updateHUD();
  });
  $('inv-cancel').addEventListener('click', () => {
    selectedSlot = null;
    renderInventory();
  });
}
