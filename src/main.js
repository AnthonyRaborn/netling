import {
  act,
  blockReason,
  createScript,
  tick,
  migrate,
  isAlive,
  traceMinutesLeft,
  alertReason,
  bedtimeHour,
  itemBlockReason,
  ITEMS,
  INVENTORY_SLOTS,
  CFG,
  TRAITS,
  FORMS,
  SPECIES,
  FORM_MODS,
  PALETTES,
  SAVE_VERSION,
  MIN,
} from './sim.js';
import { renderLCD, setLcdTint } from './render.js';
import { setGameBg } from './games/common.js';
import { COSMETICS, SLOTS, cosmeticById, unlockedIds, resolveWardrobe, recordGame } from './cosmetics.js';
import { GameSession } from './games/session.js';
import { deathRecord, dexEntries, discover, formsSeenIn, lineageRows } from './archive.js';
import { RunView } from './netrun/view.js';
import { runBlockReason, startRun } from './netrun/run.js';
import { REGIONS, REGION_ORDER, regionLock } from './netrun/regions.js';
import { codexByRegion, fragmentById, FRAGMENTS } from './netrun/codex.js';
import { drawSprite, formSprite, ITEM_SPRITES, ITEM_COLORS } from './sprites.js';
import { sfx, unlockAudio, setMuted } from './audio.js';
import { notify, notifyGranted, notifySupported, requestNotify, registerServiceWorker } from './notify.js';

const SAVE_KEY = 'netling.save';
const LINEAGE_KEY = 'netling.lineage';
const SKEW_KEY = 'netling.devSkew';
const PREFS_KEY = 'netling.prefs';
const DEX_KEY = 'netling.dex';
const CODEX_KEY = 'netling.codex';
const WARDROBE_KEY = 'netling.wardrobe';
const PROGRESS_KEY = 'netling.progress';
const UNLOCKED_KEY = 'netling.unlocked';
const DEV = new URLSearchParams(location.search).has('dev');

const store = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  },
};

let skew = DEV ? store.get(SKEW_KEY) ?? 0 : 0;
const now = () => Date.now() + skew;

let state = store.get(SAVE_KEY);
const codex = store.get(CODEX_KEY) ?? [];
const codexComplete = () => FRAGMENTS.every((f) => codex.includes(f.id));

if (!state || state.saveVersion !== SAVE_VERSION) state = createScript({ now: now(), rootAccess: codexComplete() });
migrate(state);

const $ = (id) => document.getElementById(id);
const canvas = $('lcd');
const logEl = $('log');
const overlay = $('flatline');

let lastLogLen = 0;
let lastStage = state.stage;
let lastAttention = false;
let flashUntil = 0;
let session = null;
let lastSurgeAt = state.lastSurgeAt;
let surgeUntil = 0;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const prefs = { sound: true, alerts: false, ...store.get(PREFS_KEY) };

const dex = store.get(DEX_KEY) ?? [];
for (const form of formsSeenIn(state, store.get(LINEAGE_KEY) ?? [])) discover(dex, form);
store.set(DEX_KEY, dex);

// Bank fragments a finished run left on the pet into the shared codex.
function drainCodexInbox() {
  const inbox = state.codexInbox ?? [];
  if (!inbox.length) return;
  const wasComplete = codexComplete();
  const fresh = inbox.filter((id) => !codex.includes(id));
  codex.push(...fresh);
  state.codexInbox = [];
  store.set(CODEX_KEY, codex);
  if (fresh.length) flashStatus(`codex updated: ${fresh.map((id) => `"${fragmentById(id).title}"`).join(', ')}.`);
  checkUnlocks();
  if (!wasComplete && codexComplete()) {
    state.rootAccess = true; // the current netling is covered from this moment
    save();
    showTransmission();
  }
}

function recordForm() {
  if (state.stage === 'script' || state.stage === 'dead') return;
  if (discover(dex, state.form)) {
    store.set(DEX_KEY, dex);
    if (state.form !== 'bitling') flashStatus(`dex updated: ${SPECIES[state.form].name}.`);
  }
}
setMuted(!prefs.sound);

function save() {
  store.set(SAVE_KEY, state);
}

function advance() {
  tick(state, now());
  if (state.stage !== lastStage) {
    if (state.stage === 'baby') sfx('boot', state.quirk.pitch);
    if (state.stage === 'teen' || state.stage === 'adult') {
      flashUntil = performance.now() + 2400;
      sfx('evolve', state.quirk.pitch);
      pushAlert('Netling is evolving', `It recompiled into ${SPECIES[state.form].name.toUpperCase()}.`);
    }
    if (state.stage === 'dead') onFlatline();
    recordForm();
    checkUnlocks();
    lastStage = state.stage;
  }
  if (state.lastSurgeAt !== lastSurgeAt) {
    lastSurgeAt = state.lastSurgeAt;
    surgeUntil = performance.now() + 900;
  }
  save();
  updateHUD();
}

function fmtAge(min) {
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

function updateHUD() {
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
  $('btn-lights').textContent = state.lightsOn ? 'LIGHTS OFF' : 'LIGHTS ON';
  renderInventory();
  const traceLeft = traceMinutesLeft(state);
  $('event-bar').hidden = !(traceLeft > 0 && isAlive(state));
  $('event-timer').textContent = `${traceLeft}m`;
  document.body.classList.toggle('asleep', state.asleep);

  if (state.log.length !== lastLogLen || logEl.childElementCount === 0) {
    lastLogLen = state.log.length;
    logEl.replaceChildren(
      ...state.log.slice(-8).map((e) => {
        const li = document.createElement('li');
        const t = new Date(e.t);
        li.textContent = `${t.toTimeString().slice(0, 5)} ${e.msg}`;
        if (e.msg.includes('!!') || e.msg.includes('mistake') || e.msg.includes('FLATLINE')) li.className = 'warn';
        return li;
      }),
    );
  }

  // Chirp (or notify, when backgrounded) each time a new need appears.
  const reason = alertReason(state);
  if (reason && reason.key !== lastAttention) {
    if (document.hidden) pushAlert('Netling needs you', reason.msg);
    else sfx('alert', state.quirk.pitch);
  }
  lastAttention = reason?.key ?? false;
}

function pushAlert(title, body) {
  if (prefs.alerts && document.hidden) notify(title, body);
}

function onFlatline() {
  sfx('flatline', state.quirk.pitch);
  pushAlert('FLATLINE', `netling.v${state.generation}.0 is gone: ${state.deathCause}.`);
  const lineage = store.get(LINEAGE_KEY) ?? [];
  lineage.push(deathRecord(state));
  store.set(LINEAGE_KEY, lineage);
  showFlatline();
  checkUnlocks();
}

function showFlatline() {
  const f = state.fragment;
  $('fl-title').textContent = `netling.v${state.generation}.0`;
  $('fl-cause').textContent = state.deathCause;
  $('fl-age').textContent = fmtAge(state.ageMin);
  $('fl-faults').textContent = `${state.careMistakes}/${CFG.maxMistakes}`;
  $('fl-trait').textContent = `${TRAITS[f.trait].name} — ${TRAITS[f.trait].desc}${f.keepsake ? ` · keepsake: ${ITEMS[f.keepsake].name}` : ''}`;
  $('fl-echo').textContent = `${FORMS[f.form].name} signature${FORMS[state.form] ? '' : ' (unrealized)'}`;
  $('fl-next').textContent = `COMPILE v${state.generation + 1}.0`;
  overlay.hidden = false;
}

$('fl-next').addEventListener('click', () => {
  state = createScript({ now: now(), generation: state.generation + 1, fragment: state.fragment, rootAccess: codexComplete() });
  lastStage = state.stage;
  lastLogLen = 0;
  overlay.hidden = true;
  sfx('boot', state.quirk.pitch);
  save();
  updateHUD();
});

document.querySelectorAll('[data-act]').forEach((btn) => {
  btn.addEventListener('click', () => {
    unlockAudio();
    tick(state, now());
    const res = act(state, btn.dataset.act, now());
    sfx(res.sfx, state.quirk.pitch);
    if (!res.ok) flashStatus(res.msg);
    else if (res.msg.includes('found')) flashStatus(res.msg.slice(res.msg.indexOf('found')));
    save();
    updateHUD();
  });
});

// --- mini-games ---------------------------------------------------------------

function showPanel(name) {
  $('controls').hidden = name !== 'controls';
  $('picker').hidden = name !== 'picker';
  $('pad').hidden = name !== 'pad';
  $('regions').hidden = name !== 'regions';
}

$('btn-play').addEventListener('click', () => {
  unlockAudio();
  tick(state, now());
  const blocked = blockReason(state, 'play');
  if (blocked) {
    sfx('error', state.quirk.pitch);
    return flashStatus(blocked);
  }
  sfx('select', state.quirk.pitch);
  showPanel('picker');
});

$('picker-back').addEventListener('click', () => showPanel('controls'));

document.querySelectorAll('[data-game]').forEach((btn) =>
  btn.addEventListener('click', () => startGame(btn.dataset.game)),
);

// --- netrun ---------------------------------------------------------------------

function openRun() {
  session = new RunView(state, {
    sound: (name) => {
      const tone = REGIONS[state.run?.region]?.sound ?? { mult: 1, wave: 'square' };
      sfx(name, state.quirk.pitch * tone.mult, tone.wave);
    },
    onChange: () => {
      drainCodexInbox();
      save();
      updateHUD();
    },
    onClose: (run) => {
      session = null;
      if (run?.result === 'jacked') {
        if ((run.tally?.iceLost ?? 0) === 0) progress.cleanJackouts = (progress.cleanJackouts ?? 0) + 1;
        const at = run.map.nodes.find((n) => n.id === run.pos);
        if (run.region === 'deep' && at?.type === 'exit') progress.deepExits = (progress.deepExits ?? 0) + 1;
        store.set(PROGRESS_KEY, progress);
      }
      checkUnlocks();
      $('pad-quit').textContent = 'QUIT (ESC)';
      showPanel('controls');
      save();
      updateHUD();
    },
  });
  $('pad-quit').textContent = 'ABORT RUN';
  showPanel('pad');
}

function jackIn(region) {
  tick(state, now());
  const blocked = runBlockReason(state, region, codex);
  if (blocked) {
    sfx('error', state.quirk.pitch);
    return flashStatus(blocked);
  }
  startRun(state, region, Math.random, codex);
  sfx('boot', state.quirk.pitch * REGIONS[region].sound.mult, REGIONS[region].sound.wave);
  save();
  openRun();
}

function renderRegions() {
  $('region-list').replaceChildren(
    ...REGION_ORDER.map((id) => {
      const r = REGIONS[id];
      const lock = regionLock(id, state.stage, codex);
      const secret = lock && r.requires;
      const regionFrags = FRAGMENTS.filter((f) => f.region === id);
      const found = regionFrags.filter((f) => codex.includes(f.id)).length;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'region';
      b.disabled = Boolean(lock);
      b.style.borderLeftColor = r.palette.main;
      const name = document.createElement('span');
      name.className = 'rname';
      name.textContent = secret ? '???' : r.name.toUpperCase();
      name.style.color = lock ? '' : r.palette.main;
      const frag = document.createElement('span');
      frag.className = 'rfrag';
      frag.textContent = secret ? '' : `codex ${found}/${regionFrags.length}`;
      const meta = document.createElement('span');
      meta.className = 'rmeta';
      meta.textContent = lock ?? r.blurb;
      b.append(name, frag, meta);
      b.addEventListener('click', () => jackIn(id));
      return b;
    }),
  );
}

$('btn-netrun').addEventListener('click', () => {
  unlockAudio();
  tick(state, now());
  if (state.run) return openRun(); // resume
  const blocked = runBlockReason(state, 'public', codex);
  if (blocked) {
    sfx('error', state.quirk.pitch);
    return flashStatus(blocked);
  }
  sfx('select', state.quirk.pitch);
  renderRegions();
  showPanel('regions');
});
$('regions-back').addEventListener('click', () => showPanel('controls'));

function startGame(id) {
  session = new GameSession(id, {
    sound: (name) => sfx(name, state.quirk.pitch),
    onFinish: (won) => {
      session = null;
      progress.streaks = recordGame(progress.streaks, id, won);
      store.set(PROGRESS_KEY, progress);
      checkUnlocks();
      showPanel('controls');
      tick(state, now());
      const res = act(state, 'play', now(), Math.random, { game: id, won });
      if (!res.ok || res.msg.includes('found')) flashStatus(res.msg.slice(res.msg.indexOf('found')));
      save();
      updateHUD();
    },
  });
  showPanel('pad');
}

document.querySelectorAll('[data-key]').forEach((btn) =>
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    session?.input(btn.dataset.key);
  }),
);
$('pad-quit').addEventListener('click', () => session?.forfeit());

const KEYMAP = { ArrowLeft: 'left', ArrowRight: 'right', ' ': 'a', Enter: 'a', z: 'a', x: 'a' };
document.addEventListener('keydown', (e) => {
  if (!session) return;
  if (e.key === 'Escape') return session.forfeit();
  const key = KEYMAP[e.key];
  if (!key || e.repeat) return;
  e.preventDefault();
  session.input(key);
});

// --- inventory ------------------------------------------------------------------

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
  const inv = state.inventory ?? [];
  if (selectedSlot !== null && !inv[selectedSlot]) selectedSlot = null;
  const key = `${inv.join(',')}|${selectedSlot}`;
  if (key !== lastInvKey) {
    lastInvKey = key;
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
          sfx('move', state.quirk.pitch);
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
    const blocked = itemBlockReason(state, selectedSlot);
    $('inv-use').disabled = Boolean(blocked);
    $('inv-use').title = blocked ?? '';
  }
}

$('inv-use').addEventListener('click', () => {
  if (selectedSlot === null) return;
  unlockAudio();
  tick(state, now());
  const res = act(state, 'use', now(), Math.random, { slot: selectedSlot });
  sfx(res.sfx, state.quirk.pitch);
  if (!res.ok) flashStatus(res.msg);
  selectedSlot = null;
  save();
  updateHUD();
});
$('inv-cancel').addEventListener('click', () => {
  selectedSlot = null;
  renderInventory();
});

// --- wardrobe ------------------------------------------------------------------

const progress = { streaks: {}, cleanJackouts: 0, deepExits: 0, ...store.get(PROGRESS_KEY) };
let unlocked = store.get(UNLOCKED_KEY) ?? [];
let freshUnlocks = new Set();
let wardrobe = store.get(WARDROBE_KEY) ?? {};

function unlockContext() {
  return { dex, codex, lineage: store.get(LINEAGE_KEY) ?? [], generation: state.generation, progress };
}

// Announce anything newly earned. First run of a save just records what's already earned.
function checkUnlocks({ silent = false } = {}) {
  const now = unlockedIds(unlockContext());
  const fresh = now.filter((id) => !unlocked.includes(id));
  if (!fresh.length) return;
  unlocked = [...new Set([...unlocked, ...now])];
  store.set(UNLOCKED_KEY, unlocked);
  if (silent) return;
  fresh.forEach((id) => freshUnlocks.add(id));
  const names = fresh.map((id) => {
    const [slot, cid] = id.split(':');
    return cosmeticById(slot, cid).name.toLowerCase();
  });
  flashStatus(`style unlocked: ${names.join(', ')}.`);
  sfx('win', state.quirk.pitch);
}

function applyWardrobe() {
  const w = resolveWardrobe(wardrobe, unlocked);
  const device = document.querySelector('.device');
  device.className = `device shell-${w.shell}`;
  const tint = cosmeticById('tint', w.tint);
  setLcdTint(tint.lcd, tint.dark);
  setGameBg(tint.lcd);
  document.querySelector('.screen').className = `screen fx-${w.effect}`;
}

function renderWardrobe() {
  const w = resolveWardrobe(wardrobe, unlocked);
  const total = SLOTS.reduce((n, s) => n + COSMETICS[s].length, 0);
  $('wardrobe-count').textContent = `${unlocked.length}/${total}`;
  const labels = { shell: 'SHELL', tint: 'SCREEN TINT', effect: 'SCREEN EFFECT' };
  $('wardrobe-list').replaceChildren(
    ...SLOTS.flatMap((slot) => {
      const h = document.createElement('h3');
      h.textContent = labels[slot];
      const grid = document.createElement('div');
      grid.className = 'wardrobe-grid';
      for (const c of COSMETICS[slot]) {
        const key = `${slot}:${c.id}`;
        const open = unlocked.includes(key);
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `cosmetic${open ? '' : ' locked'}${freshUnlocks.has(key) ? ' new' : ''}`;
        b.setAttribute('aria-pressed', open && w[slot] === c.id);
        const sw = document.createElement('span');
        sw.className = 'sw';
        sw.style.background = open ? c.swatch ?? 'transparent' : 'transparent';
        if (slot === 'effect') sw.textContent = open ? '~' : '';
        const name = document.createElement('span');
        name.textContent = open ? c.name : '???';
        const hint = document.createElement('span');
        hint.className = 'ch';
        hint.textContent = open ? (w[slot] === c.id ? 'equipped' : 'tap to equip') : c.hint;
        b.append(sw, name, hint);
        if (open) {
          b.addEventListener('click', () => {
            wardrobe = { ...w, [slot]: c.id };
            store.set(WARDROBE_KEY, wardrobe);
            freshUnlocks.delete(key);
            applyWardrobe();
            sfx('select', state.quirk.pitch);
            renderWardrobe();
          });
        } else {
          b.disabled = true;
        }
        grid.append(b);
      }
      return [h, grid];
    }),
  );
}

// --- NL-0 ------------------------------------------------------------------------

function showTransmission() {
  sfx('evolve', 220, 'sine');
  if (archive.open) archive.close();
  $('transmission').showModal();
}
$('close-transmission').addEventListener('click', () => $('transmission').close());
$('replay-transmission').addEventListener('click', showTransmission);

// --- archive --------------------------------------------------------------------

const archive = $('archive');

function thumb(form, paletteIdx, { dead = false, locked = false } = {}) {
  const wrap = document.createElement('div');
  wrap.className = 'thumb';
  if (!form) return wrap;
  const sprite = formSprite(form, 'a');
  const c = document.createElement('canvas');
  c.width = 16;
  c.height = 16;
  const pal = PALETTES[paletteIdx] ?? PALETTES[0];
  const colors = locked
    ? { '#': '#1c3a3f', o: '#1c3a3f', '+': '#1c3a3f' }
    : dead
      ? { '#': '#3a4a4d', o: '#1c2a2d', '+': '#3a4a4d' }
      : { '#': pal.main, o: pal.accent, '+': '#f5f5f5' };
  drawSprite(c.getContext('2d'), sprite, Math.floor((16 - sprite[0].length) / 2), 16 - sprite.length, colors);
  wrap.append(c);
  return wrap;
}

function row(thumbEl, title, lines, className = '') {
  const li = document.createElement('li');
  li.className = className;
  const body = document.createElement('div');
  const t = document.createElement('div');
  t.className = 'row-title';
  t.append(...title);
  body.append(t);
  for (const line of lines.filter(Boolean)) {
    const m = document.createElement('div');
    m.className = typeof line === 'string' ? 'row-meta' : `row-meta ${line.cls}`;
    m.textContent = typeof line === 'string' ? line : line.text;
    body.append(m);
  }
  li.append(thumbEl, body);
  return li;
}

function bold(text) {
  const b = document.createElement('b');
  b.textContent = text;
  return b;
}

function renderArchive() {
  const rows = lineageRows(store.get(LINEAGE_KEY) ?? [], state);
  $('lineage-list').replaceChildren(
    ...rows.map((r) =>
      row(
        thumb(r.form, r.palette, { dead: r.dead }),
        [bold(r.version), ` ${r.formLabel}`],
        [
          `${fmtAge(r.ageMin)} · ${r.status}${r.mistakes !== undefined ? ` · faults ${r.mistakes}` : ''}`,
          r.trait || r.fragment ? `inherited ${r.trait ?? '—'}${r.fragment ? ` · left ${r.fragment}` : ''}` : null,
          r.keepsake ? `keepsake: ${r.keepsake}` : null,
          r.rescued ? { cls: 'perk', text: 'pulled back once by NL-0' } : null,
        ],
        r.dead ? '' : 'running',
      ),
    ),
  );
  if (!rows.length) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'no generations yet.';
    $('lineage-list').replaceChildren(li);
  }

  renderWardrobe();
  $('codex-gift').hidden = !codexComplete();
  const groups = codexByRegion(codex, REGION_ORDER);
  $('codex-count').textContent = `${codex.length}/${FRAGMENTS.length}`;
  $('codex-list').replaceChildren(
    ...groups.flatMap((g) => {
      const r = REGIONS[g.region];
      const secret = r.requires && !codex.includes(r.requires) && g.found === 0;
      const h = document.createElement('h3');
      h.textContent = secret ? '??? ' : `${r.name.toUpperCase()} `;
      const count = document.createElement('span');
      count.textContent = `${g.found}/${g.total}`;
      h.append(count);
      const items = g.entries.map((e) => {
        const d = document.createElement('div');
        if (e.missing) {
          d.className = 'frag missing';
          d.textContent = '[ fragment missing ]';
        } else {
          d.className = 'frag';
          const b = document.createElement('b');
          b.textContent = e.title;
          d.append(b, e.text);
        }
        return d;
      });
      return [h, ...items];
    }),
  );

  const entries = dexEntries(dex);
  $('dex-count').textContent = `${entries.filter((e) => e.found).length}/${entries.length}`;
  $('dex-grid').replaceChildren(
    ...entries.map((e) =>
      row(
        thumb(e.id, 0, { locked: !e.found }),
        [bold(e.name), ` · ${e.stage}`],
        [
          e.text,
          e.perk ? { cls: 'perk', text: `perk: ${e.perk}` } : null,
          e.runAbility ? { cls: 'perk', text: `netrun: ${e.runAbility}` } : null,
          e.trait ? `fragment: ${e.trait}${e.keepsake ? ` + ${e.keepsake}` : ''}` : null,
        ],
        e.found ? '' : 'locked',
      ),
    ),
  );
}

function selectTab(name) {
  for (const t of ['lineage', 'dex', 'codex', 'wardrobe']) {
    $(`tab-btn-${t}`).setAttribute('aria-selected', t === name);
    $(`tab-${t}`).hidden = t !== name;
  }
}

$('open-archive').addEventListener('click', () => {
  renderArchive();
  archive.showModal();
});
$('close-archive').addEventListener('click', () => archive.close());
archive.addEventListener('click', (e) => {
  if (e.target === archive) archive.close(); // backdrop click
});
$('tab-btn-lineage').addEventListener('click', () => selectTab('lineage'));
$('tab-btn-dex').addEventListener('click', () => selectTab('dex'));
$('tab-btn-codex').addEventListener('click', () => selectTab('codex'));
$('tab-btn-wardrobe').addEventListener('click', () => selectTab('wardrobe'));

// --- settings -------------------------------------------------------------------

function renderPrefs() {
  $('pref-sound').textContent = prefs.sound ? 'SND ON' : 'SND OFF';
  $('pref-sound').setAttribute('aria-pressed', prefs.sound);
  $('pref-alerts').textContent = prefs.alerts && notifyGranted() ? 'ALERTS ON' : 'ALERTS OFF';
  $('pref-alerts').setAttribute('aria-pressed', prefs.alerts && notifyGranted());
  $('pref-alerts').hidden = !notifySupported();
}

$('pref-sound').addEventListener('click', () => {
  prefs.sound = !prefs.sound;
  setMuted(!prefs.sound);
  store.set(PREFS_KEY, prefs);
  unlockAudio();
  sfx('select', state.quirk.pitch);
  renderPrefs();
});

$('pref-alerts').addEventListener('click', async () => {
  if (prefs.alerts && notifyGranted()) {
    prefs.alerts = false;
  } else {
    prefs.alerts = await requestNotify();
    if (!prefs.alerts) flashStatus('notifications blocked by the browser.');
  }
  store.set(PREFS_KEY, prefs);
  renderPrefs();
});

renderPrefs();
registerServiceWorker();

let statusTimer;
function flashStatus(msg) {
  const el = $('status');
  el.textContent = `> ${msg}`;
  el.classList.add('show');
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

if (DEV) {
  const dev = $('dev');
  dev.hidden = false;
  dev.querySelectorAll('[data-skip]').forEach((btn) =>
    btn.addEventListener('click', () => {
      skew += Number(btn.dataset.skip) * MIN;
      store.set(SKEW_KEY, skew);
      advance();
    }),
  );
  $('dev-evolve').addEventListener('click', () => {
    const target = state.stage === 'baby' ? CFG.teenAtMin : state.stage === 'teen' ? CFG.adultAtMin : null;
    if (target === null) return;
    const skip = target - state.ageMin;
    skew += skip * MIN;
    store.set(SKEW_KEY, skew);
    // Jump the clock without simulating the gap, so the pet survives the test.
    state.ageMin += skip - 1;
    state.lastTick += (skip - 1) * MIN;
    advance();
  });
  $('dev-trace').addEventListener('click', () => {
    if (!isAlive(state)) return;
    state.event = { type: 'trace', startedAge: state.ageMin };
    save();
    updateHUD();
  });
  $('dev-reset').addEventListener('click', () => {
    skew = 0;
    store.set(SKEW_KEY, 0);
    state = createScript({ now: now(), rootAccess: codexComplete() });
    lastStage = state.stage;
    overlay.hidden = true;
    save();
    updateHUD();
  });
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) advance();
});

checkUnlocks({ silent: !store.get(UNLOCKED_KEY) });
applyWardrobe();
advance();
drainCodexInbox();
if (state.stage === 'dead') showFlatline();
else if (state.run) openRun(); // resume a run after a reload
setInterval(advance, 1000);

let lastFrame = performance.now();
(function loop(time) {
  const dt = Math.min(0.1, (time - lastFrame) / 1000);
  lastFrame = time;
  if (session) {
    session.update(dt);
    session?.draw(canvas.getContext('2d'), PALETTES[state.quirk.palette] ?? PALETTES[0], time);
  } else {
    renderLCD(canvas, state, time, {
      flash: time < flashUntil,
      surge: time < surgeUntil,
      calm: reducedMotion.matches,
    });
  }
  requestAnimationFrame(loop);
})(performance.now());
