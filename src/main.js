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
  hibernate,
  wake,
  hibernateBlockReason,
  wakeAvailableAt,
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
import { COSMETICS, SLOTS, LABEL, cosmeticById, unlockedIds, resolveWardrobe, recordGame, sanitizeLabel } from './cosmetics.js';
import { GameSession } from './games/session.js';
import { deathRecord, dexEntries, discover, formsSeenIn, lineageRows } from './archive.js';
import { RunView } from './netrun/view.js';
import { encodeSave, decodeSave, describeSave, TRANSFER_KEYS } from './transfer.js';
import { encodeQR, drawQR } from './qr.js';
import { ACCESSORIES, PROPS, STYLE_ITEMS, accessoryById, accessoryHint, accessoryColors } from './accessories.js';
import { runBlockReason, startRun } from './netrun/run.js';
import { REGIONS, REGION_ORDER, regionLock } from './netrun/regions.js';
import { codexByRegion, fragmentById, FRAGMENTS } from './netrun/codex.js';
import { drawSprite, formSprite, ITEM_SPRITES, ITEM_COLORS } from './sprites.js';
import { sfx, unlockAudio, setMuted, setSoundPack, setVolume } from './audio.js';
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
const ACCESSORY_KEY = 'netling.accessories';
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
const firstLaunch = !state;
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

const prefs = { sound: true, alerts: false, volume: 0.8, ...store.get(PREFS_KEY) };
setVolume(prefs.volume);

const dex = store.get(DEX_KEY) ?? [];
for (const form of formsSeenIn(state, store.get(LINEAGE_KEY) ?? [])) discover(dex, form);
store.set(DEX_KEY, dex);

const ownedAccessories = store.get(ACCESSORY_KEY) ?? [];

// Bank accessories a finished run left on the pet into the shared collection.
function drainAccessoryInbox() {
  const inbox = state.accessoryInbox ?? [];
  if (!inbox.length) return;
  const fresh = inbox.filter((id) => !ownedAccessories.includes(id));
  ownedAccessories.push(...fresh);
  state.accessoryInbox = [];
  store.set(ACCESSORY_KEY, ownedAccessories);
  if (fresh.length) {
    setTimeout(() => flashStatus(`style: ${fresh.map((id) => accessoryById(id).name.toLowerCase()).join(', ')} added. equip it in the archive.`), 1900);
  }
}

// Earned style items: granted by moments, never sold. Announced once.
function grantStyle(id, message) {
  if (ownedAccessories.includes(id)) return;
  ownedAccessories.push(id);
  store.set(ACCESSORY_KEY, ownedAccessories);
  if (message) queueNotice(message);
}

// Grant messages play one after another instead of overwriting each other.
const notices = [];
let noticeBusy = false;
function queueNotice(message) {
  notices.push(message);
  if (!noticeBusy) nextNotice();
}
function nextNotice() {
  const msg = notices.shift();
  if (!msg) {
    noticeBusy = false;
    return;
  }
  noticeBusy = true;
  setTimeout(() => {
    flashStatus(msg);
    sfx('win', state.quirk.pitch);
    setTimeout(nextNotice, 2000);
  }, 400);
}

// Saves from before these items existed get what they've already earned.
function backfillEarned() {
  const lineage = store.get(LINEAGE_KEY) ?? [];
  if (onboarding === 'done' && (state.stage !== 'script' || lineage.length)) grantStyle('partyhat', 'a gift: party hat. happy first birthday.');
  if (lineage.length) grantStyle('plush', 'a keepsake: a plush of your last netling.');
  if (state.rootUsed) grantStyle('bandage', 'earned: bandage. it came back once.');
}

// The plush looks like the previous netling, in its colors.
function plushExtra() {
  const lineage = store.get(LINEAGE_KEY) ?? [];
  const e = lineage[lineage.length - 1];
  if (!e) return null;
  const form = e.realized ? e.form : e.teenForm ?? 'bitling';
  const pal = PALETTES[e.palette ?? 0] ?? PALETTES[0];
  return { sprite: formSprite(form, 'a'), colors: { '#': pal.main, o: pal.accent, '+': '#f5f5f5' } };
}

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

let importing = false; // stops autosave from overwriting an import before the reload
const LOCK_KEY = 'netling.lock';
let inactive = false; // another tab is looking after the netling
let lock = store.get(LOCK_KEY); // { code, at, generation } while the netling is on another device

function save() {
  if (importing || lock || inactive) return;
  store.set(SAVE_KEY, state);
}

function advance() {
  if (lock || inactive) return; // on another device, or in another tab
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
  if (state.rootUsed) grantStyle('bandage', 'earned: bandage. it came back once.');
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
  renderNudge();
  renderHibernation();
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
  grantStyle('plush', 'a keepsake: a plush of your last netling.');
  plushCache = plushExtra();
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
    if (res.ok) countAct(btn.dataset.act);
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
      drainAccessoryInbox();
      save();
      updateHUD();
    },
    onGame: () => countGame(),
    onClose: (run) => {
      session = null;
      if (run?.region === 'tutorial') finishOnboarding();
      if (run?.result === 'disconnected') grantStyle('bandage', 'earned: bandage. you made it back.');
      if (run?.result) {
        progress.runs = { ...progress.runs, [run.result]: (progress.runs?.[run.result] ?? 0) + 1 };
        store.set(PROGRESS_KEY, progress);
      }
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
  startRun(state, region, Math.random, codex, ownedAccessories);
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
  if (onboarding === 'nudge') return startTutorial();
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
      progress.streaks = recordGame(progress.streaks, id, won); // streak unlocks: PLAY games only
      countGame();
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
  if (onboarding === 'intro' && !$('intro').hidden && [' ', 'Enter', 'z', 'x'].includes(e.key)) {
    e.preventDefault();
    return advanceIntro();
  }
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
$('inv-discard').addEventListener('click', () => {
  if (selectedSlot === null) return;
  const btn = $('inv-discard');
  if (btn.dataset.armed !== '1') {
    btn.dataset.armed = '1';
    btn.textContent = 'SURE?';
    setTimeout(() => {
      btn.dataset.armed = '';
      btn.textContent = 'DISCARD';
    }, 3000);
    return;
  }
  btn.dataset.armed = '';
  btn.textContent = 'DISCARD';
  const res = act(state, 'discard', now(), Math.random, { slot: selectedSlot });
  sfx(res.sfx, state.quirk.pitch);
  selectedSlot = null;
  save();
  updateHUD();
});
$('inv-cancel').addEventListener('click', () => {
  selectedSlot = null;
  renderInventory();
});

// --- wardrobe ------------------------------------------------------------------

const progress = { streaks: {}, acts: {}, gamesPlayed: 0, cleanJackouts: 0, deepExits: 0, ...store.get(PROGRESS_KEY) };

// Counts toward every non-streak game unlock, from PLAY and from netrun ICE alike.
function countGame() {
  progress.gamesPlayed = (progress.gamesPlayed ?? 0) + 1;
  store.set(PROGRESS_KEY, progress);
  checkUnlocks();
}

function countAct(action) {
  progress.acts = { ...progress.acts, [action]: (progress.acts?.[action] ?? 0) + 1 };
  store.set(PROGRESS_KEY, progress);
  checkUnlocks();
}
let unlocked = store.get(UNLOCKED_KEY) ?? [];
let freshUnlocks = new Set();
let wardrobe = store.get(WARDROBE_KEY) ?? {};

function unlockContext() {
  return { dex, codex, lineage: store.get(LINEAGE_KEY) ?? [], generation: state.generation, progress };
}

// Announce anything newly earned. First run of a save just records what's already earned.
function checkUnlocks({ silent = false } = {}) {
  const ctx = unlockContext();
  const now = [...unlockedIds(ctx), ...(LABEL.check(ctx) ? ['label'] : [])];
  const fresh = now.filter((id) => !unlocked.includes(id));
  if (!fresh.length) return;
  unlocked = [...new Set([...unlocked, ...now])];
  store.set(UNLOCKED_KEY, unlocked);
  if (COSMETICS.shell.every((c) => unlocked.includes(`shell:${c.id}`))) {
    grantStyle('minidevice', 'secret: a mini device. it has a pet of its own.');
  }
  // Free items (e.g. defaults added in an update) join quietly.
  const earned = fresh.filter((id) => {
    if (id === 'label') return true;
    const [slot, cid] = id.split(':');
    return !cosmeticById(slot, cid).free;
  });
  if (silent || !earned.length) return;
  earned.forEach((id) => freshUnlocks.add(id));
  const names = earned.map((id) => {
    if (id === 'label') return 'device label';
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
  const pack = cosmeticById('sound', w.sound);
  setSoundPack(pack.wave, pack.mult);
  const label = unlocked.includes('label') ? sanitizeLabel(wardrobe.label) : LABEL.fallback;
  document.querySelector('.logo').textContent = label;
}

function renderWardrobe() {
  const w = resolveWardrobe(wardrobe, unlocked);
  const total = SLOTS.reduce((n, s) => n + COSMETICS[s].length, 0) + 1 + STYLE_ITEMS.length; // + label + accessories/props
  $('wardrobe-count').textContent = `${unlocked.length + ownedAccessories.length}/${total}`;
  const labels = { shell: 'SHELL', tint: 'SCREEN TINT', effect: 'SCREEN EFFECT', sound: 'SOUND PACK' };
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
        if (slot === 'sound') sw.textContent = open ? '♪' : '';
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
            sfx(slot === 'sound' ? 'feed' : 'select', state.quirk.pitch); // sound packs preview themselves
            renderWardrobe();
          });
        } else {
          b.disabled = true;
        }
        grid.append(b);
      }
      return [h, grid];
    }),
    ...accessorySection(),
    ...labelSection(),
  );
}

function accessorySection() {
  return [
    ...styleItemSection('accessory', 'ACCESSORY', ACCESSORIES),
    ...colorSection(),
    ...styleItemSection('prop', 'PROP', PROPS),
  ];
}

// Color pickers for the equipped accessory, if it's recolorable.
function colorSection() {
  const id = wardrobe.accessory;
  const acc = ownedAccessories.includes(id) ? accessoryById(id) : null;
  if (!acc?.colors) return [];
  const current = accessoryColors(id, wardrobe.colors?.[id]);
  const row = document.createElement('div');
  row.className = 'color-row';
  const label = document.createElement('span');
  label.textContent = `${acc.name.toLowerCase()} colors`;
  row.append(label);
  acc.colors.forEach(([name], i) => {
    const input = document.createElement('input');
    input.type = 'color';
    input.value = current[i];
    input.setAttribute('aria-label', `${acc.name} ${name} ${i + 1}`);
    input.addEventListener('input', () => {
      const next = [...current];
      next[i] = input.value;
      current[i] = input.value;
      wardrobe = { ...wardrobe, colors: { ...wardrobe.colors, [id]: next } };
      store.set(WARDROBE_KEY, wardrobe);
    });
    row.append(input);
  });
  const reset = document.createElement('button');
  reset.type = 'button';
  reset.className = 'pref';
  reset.textContent = 'RESET';
  reset.addEventListener('click', () => {
    const { [id]: _, ...rest } = wardrobe.colors ?? {};
    wardrobe = { ...wardrobe, colors: rest };
    store.set(WARDROBE_KEY, wardrobe);
    renderWardrobe();
  });
  row.append(reset);
  return [row];
}

// One wardrobe section for owned style items (worn accessories or ground props).
function styleItemSection(key, title, items) {
  const h = document.createElement('h3');
  h.textContent = title;
  const grid = document.createElement('div');
  grid.className = 'wardrobe-grid';
  const current = ownedAccessories.includes(wardrobe[key]) ? wardrobe[key] : 'none';
  for (const x of [{ id: 'none', name: 'None' }, ...items]) {
    const owned = x.id === 'none' || ownedAccessories.includes(x.id);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `cosmetic${owned ? '' : ' locked'}`;
    b.setAttribute('aria-pressed', owned && current === x.id);
    const sw = document.createElement('span');
    sw.className = 'sw';
    sw.textContent = owned && x.id !== 'none' ? (key === 'prop' ? '▣' : '✦') : '';
    const name = document.createElement('span');
    name.textContent = owned ? x.name : '???';
    const hint = document.createElement('span');
    hint.className = 'ch';
    hint.textContent = owned ? (current === x.id ? 'equipped' : 'tap to equip') : accessoryHint(x);
    b.append(sw, name, hint);
    if (owned) {
      b.addEventListener('click', () => {
        wardrobe = { ...wardrobe, [key]: x.id };
        store.set(WARDROBE_KEY, wardrobe);
        sfx('select', state.quirk.pitch);
        renderWardrobe();
      });
    } else {
      b.disabled = true;
    }
    grid.append(b);
  }
  return [h, grid];
}

function labelSection() {
  const h = document.createElement('h3');
  h.textContent = 'DEVICE LABEL';
  const row = document.createElement('div');
  row.className = 'label-row';
  if (!unlocked.includes('label')) {
    const hint = document.createElement('div');
    hint.className = 'cosmetic locked';
    hint.textContent = `??? ${LABEL.hint}`;
    row.append(hint);
    return [h, row];
  }
  const input = document.createElement('input');
  input.type = 'text';
  input.maxLength = LABEL.max;
  input.value = sanitizeLabel(wardrobe.label);
  input.setAttribute('aria-label', 'Device label');
  input.spellcheck = false;
  const set = document.createElement('button');
  set.type = 'button';
  set.textContent = 'SET';
  const commit = () => {
    wardrobe = { ...wardrobe, label: sanitizeLabel(input.value) };
    store.set(WARDROBE_KEY, wardrobe);
    input.value = wardrobe.label;
    applyWardrobe();
    sfx('select', state.quirk.pitch);
  };
  set.addEventListener('click', commit);
  input.addEventListener('keydown', (e) => {
    e.stopPropagation(); // keep game keys out of the text box
    if (e.key === 'Enter') commit();
  });
  row.append(input, set);
  return [h, row];
}

// --- field manual -----------------------------------------------------------------

const HELP_KEY = 'netling.helpSeen';

// Built from the live config so the numbers never drift from the rules.
function renderHelp() {
  const d = CFG.drainPerHour;
  const sections = [
    [
      'STATS',
      [
        ['CHG · Charge', `Power. Drains about ${d.charge}/hr awake, half that asleep. Feed it with CORP PKT or SCAV DATA.`, 'At zero it becomes a fault and Integrity starts slipping.'],
        ['SYN · Sync', `Its bond with you. Drains about ${d.sync}/hr. PLAY a mini-game to raise it; wins count for more.`, 'At zero it becomes a fault.'],
        ['INT · Integrity', 'Its health. Viruses, a full cache, overheating and an empty Charge all wear it down. It slowly recovers when nothing is wrong.', `At zero for ${CFG.flatlineIntegrityMin / 60} hours, it flatlines.`],
        ['HEAT', 'Rises while it is awake, when it plays, on netruns and in power surges. COOL vents it; it cools on its own while asleep.', 'At 85+ it damages Integrity; at 100 it is a fault.'],
        ['CACHE', 'Corrupted files it writes after eating, up to four. PURGE clears them.', '3+ files damage Integrity and make viruses more likely.'],
      ],
    ],
    [
      'THE READOUT',
      [
        ['v1.0 Kernel', 'Generation number and its current form.'],
        ['age · bed', 'How long it has been running, and the hour it goes to sleep.'],
        ['faults', `Care mistakes. A need left unmet for ${CFG.mistakeGraceMin} minutes counts as one (${CFG.lightsGraceMin} for sleeping with the lights on). ${CFG.maxMistakes} ends its life.`],
        ['trait', 'What it inherited from the netling before it.'],
        ['root', "NL-0's protection, once you have earned it: ready, spent, or cooling."],
      ],
    ],
    [
      'ON THE SCREEN',
      [
        ['!', 'It needs something. Check the bars.'],
        ['virus icon', 'Infected. PATCH it before Integrity collapses.'],
        ['eye', 'A corp trace. HIDE or COMPLY before the timer runs out.'],
        ['Z', 'Asleep. Turn the LIGHTS OFF.'],
      ],
    ],
  ];
  const body = sections.flatMap(([title, rows]) => {
    const h = document.createElement('h3');
    h.textContent = title;
    const dl = document.createElement('dl');
    for (const [term, desc, note] of rows) {
      const dt = document.createElement('dt');
      dt.textContent = term;
      const dd = document.createElement('dd');
      dd.textContent = desc;
      if (note) {
        const small = document.createElement('small');
        small.textContent = note;
        dd.append(small);
      }
      dl.append(dt, dd);
    }
    return [h, dl];
  });
  const tip = document.createElement('p');
  tip.textContent = 'It lives in real time, even while this page is closed. Hover a stat for a reminder.';
  $('help-body').replaceChildren(tip, ...body);
}

function openHelp({ readme = false } = {}) {
  renderHelp();
  $('help-title').textContent = readme ? 'FIELD_MANUAL.txt' : 'FIELD MANUAL';
  if (readme) {
    const p = document.createElement('p');
    p.textContent = '// unpacked from netling.v1.0.sh. you just compiled something alive. keep it that way.';
    $('help-body').prepend(p);
  }
  $('help').showModal();
  store.set(HELP_KEY, true);
}
$('open-help').addEventListener('click', () => openHelp());
$('close-help').addEventListener('click', () => $('help').close());
$('help').addEventListener('click', (e) => {
  if (e.target === $('help')) $('help').close();
});

// --- onboarding -------------------------------------------------------------------
// intro (terminal) -> readme (field manual) -> nudge (go explore) -> tutorial (first run) -> done

const ONBOARD_KEY = 'netling.onboarding';
let onboarding = store.get(ONBOARD_KEY) ?? (firstLaunch ? 'intro' : 'done');

function setOnboarding(step) {
  onboarding = step;
  store.set(ONBOARD_KEY, step);
  renderNudge();
}

const INTRO_LINES = [
  ['runner@sprawl:~$ ls /mnt/sector7f', ''],
  ['cleanup.sh   netling.v1.0.sh   notes.txt', ''],
  ['runner@sprawl:~$ ./', ''],
  ['  [tab]', ''],
  ['runner@sprawl:~$ ./netling.v1.0.sh', 'hl'],
  ['', ''],
  ["...that wasn't cleanup.sh.", 'warn'],
  ['', ''],
  ['> compiling netling.v1.0 ...', 'hl'],
  ['> unpacking FIELD_MANUAL.txt', ''],
];
let introTimer = null;
let introShown = 0;

function startIntro() {
  introShown = 0;
  document.body.classList.add('intro-active');
  $('intro').hidden = false;
  $('intro-next').hidden = true;
  $('intro-text').replaceChildren();
  typeNextLine();
}

function typeNextLine() {
  if (introShown >= INTRO_LINES.length) {
    $('intro-next').hidden = false;
    return;
  }
  const [line, cls] = INTRO_LINES[introShown++];
  const span = document.createElement('span');
  if (cls) span.className = cls;
  span.textContent = `${line}\n`;
  $('intro-text').append(span);
  sfx('move', 520);
  introTimer = setTimeout(typeNextLine, line ? 520 : 260);
}

function advanceIntro() {
  if (onboarding !== 'intro') return;
  unlockAudio();
  if (introShown < INTRO_LINES.length) {
    // tap skips the typing
    clearTimeout(introTimer);
    while (introShown < INTRO_LINES.length) typeNextLine();
    clearTimeout(introTimer);
    return;
  }
  $('intro').hidden = true;
  document.body.classList.remove('intro-active');
  // The script compiles for real: a fresh netling that boots on the next tick.
  state = createScript({ now: now() - CFG.bootMinutes * MIN, rootAccess: codexComplete() });
  lastStage = state.stage;
  lastLogLen = 0;
  save();
  advance();
  setOnboarding('readme');
  setTimeout(() => openHelp({ readme: true }), 700);
}
$('intro').addEventListener('click', advanceIntro);

$('help').addEventListener('close', () => {
  if (onboarding === 'readme') {
    setOnboarding('nudge');
    sfx('alert', state.quirk.pitch);
  }
});

// The netling asks to go exploring; NETRUN glows until the first run.
function renderNudge() {
  const nudging = onboarding === 'nudge' && isAlive(state) && !session;
  $('speech').hidden = !nudging;
  if (nudging) $('speech').textContent = 'the net is out there... take me?';
  $('btn-netrun').classList.toggle('nudge', nudging);
}

function startTutorial() {
  startRun(state, 'tutorial', Math.random, codex, ownedAccessories);
  setOnboarding('tutorial');
  sfx('boot', state.quirk.pitch);
  save();
  openRun();
}

function finishOnboarding() {
  setOnboarding('done');
  if (!ownedAccessories.includes('partyhat')) {
    grantStyle('partyhat', 'a gift: party hat. accessories live in ARCHIVE > STYLE.');
    wardrobe = { ...wardrobe, accessory: 'partyhat' };
    store.set(WARDROBE_KEY, wardrobe);
  }
  $('open-archive').classList.add('nudge');
  setTimeout(() => $('open-archive').classList.remove('nudge'), 9000);
}

// --- system: transfer, import, hibernate, restart ------------------------------------------

const transfer = $('transfer');
let pendingImport = null;

// Only the recent log travels: it's most of the payload, and a smaller code means a sparser QR.
const EXPORT_LOG_LINES = 10;

function collectData() {
  save();
  const data = Object.fromEntries(TRANSFER_KEYS.map((k) => [k, store.get(`netling.${k}`)]).filter(([, v]) => v !== null && v !== undefined));
  if (data.save?.log) data.save = { ...data.save, log: data.save.log.slice(-EXPORT_LOG_LINES) };
  return data;
}

const importUrl = (code) => `${location.origin}${location.pathname}#import=${code}`;

function openSystem() {
  archive.close();
  renderStorageNote();
  $('volume').value = Math.round(prefs.volume * 100);
  $('volume-value').textContent = `${Math.round(prefs.volume * 100)}%`;
  $('import-preview').hidden = true;
  renderHibernateNote();
  transfer.showModal();
}
$('open-transfer').addEventListener('click', openSystem);
$('close-transfer').addEventListener('click', () => transfer.close());

$('volume').addEventListener('input', () => {
  prefs.volume = Number($('volume').value) / 100;
  setVolume(prefs.volume);
  $('volume-value').textContent = `${$('volume').value}%`;
  store.set(PREFS_KEY, prefs);
});
$('volume').addEventListener('change', () => {
  unlockAudio();
  sfx('select', state.quirk.pitch); // preview at the new level
});

// --- transfer out: export and lock ---
$('transfer-out').addEventListener('click', async () => {
  const btn = $('transfer-out');
  if (btn.dataset.armed !== '1') {
    btn.dataset.armed = '1';
    btn.textContent = 'CONFIRM: LOCK THIS DEVICE';
    setTimeout(() => {
      btn.dataset.armed = '';
      btn.textContent = 'TRANSFER OUT';
    }, 4000);
    return;
  }
  const code = await encodeSave(collectData());
  lock = { code, at: Date.now(), generation: state.generation };
  store.set(LOCK_KEY, lock);
  transfer.close();
  sfx('patch', state.quirk.pitch);
  showLock();
});

function showLock() {
  document.body.classList.add('locked');
  $('lock').hidden = false;
  $('lock-note').textContent = `netling.v${lock.generation}.0 left this device on ${new Date(lock.at).toLocaleString()}. Load it on the other device.`;
  $('lock-code').value = lock.code;
  try {
    drawQR($('lock-qr'), encodeQR(importUrl(lock.code)), 3);
    $('lock-qr').hidden = false;
  } catch {
    $('lock-qr').hidden = true; // too big for a QR; the code still works
  }
}

$('lock-copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(lock.code);
    $('lock-copy').textContent = 'COPIED';
  } catch {
    $('lock-code').select();
    $('lock-copy').textContent = 'SELECTED: COPY IT';
  }
  setTimeout(() => ($('lock-copy').textContent = 'COPY CODE'), 2000);
});

$('lock-download').addEventListener('click', () => {
  const blob = new Blob([lock.code], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `netling-v${lock.generation}-${new Date(lock.at).toISOString().slice(0, 10)}.txt`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

// Re-export: the same code again (nothing changed while locked), redrawn fresh.
$('lock-reexport').addEventListener('click', () => {
  showLock();
  sfx('select', 660);
});

// Reload: bring a code here (this device's own, or another).
$('lock-reload').addEventListener('click', () => {
  $('import-code').value = lock.code;
  openSystem();
  checkImport();
});

$('lock-restart').addEventListener('click', () => restartEverything($('lock-restart')));
$('restart-btn').addEventListener('click', () => restartEverything($('restart-btn')));

// Two presses, a few seconds apart at most, then everything is wiped.
function restartEverything(btn) {
  if (btn.dataset.armed !== '1') {
    btn.dataset.armed = '1';
    const label = btn.textContent;
    btn.textContent = 'PRESS AGAIN TO ERASE ALL';
    setTimeout(() => {
      btn.dataset.armed = '';
      btn.textContent = label;
    }, 4000);
    return;
  }
  importing = true;
  for (const k of Object.keys(localStorage)) if (k.startsWith('netling.')) localStorage.removeItem(k);
  location.replace(location.pathname + location.search);
}

// --- bring one here ---
$('import-file').addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  $('import-code').value = (await file.text()).slice(0, 200_000);
  e.target.value = '';
  checkImport();
});

$('check-code').addEventListener('click', checkImport);

async function checkImport() {
  const box = $('import-preview');
  box.hidden = false;
  box.className = 'tx-preview';
  const raw = $('import-code').value.trim();
  // Accept a pasted QR link as well as a bare code.
  const code = raw.includes('#import=') ? decodeURIComponent(raw.split('#import=')[1]) : raw;
  try {
    pendingImport = await decodeSave(code);
  } catch (err) {
    pendingImport = null;
    box.className = 'tx-preview error';
    box.textContent = err.message ?? 'could not read that code.';
    sfx('error', 660);
    return;
  }
  const info = describeSave(pendingImport);
  const dl = document.createElement('dl');
  for (const [k, v] of [
    ['netling', info.netling],
    ['generations', info.generations],
    ['dex', `${info.dex}/8`],
    ['codex', info.codex],
    ['style items', info.style],
    ['saved', info.exportedAt ? new Date(info.exportedAt).toLocaleString() : 'unknown'],
  ]) {
    const dt = document.createElement('dt');
    dt.textContent = k;
    const dd = document.createElement('dd');
    dd.textContent = v;
    dl.append(dt, dd);
  }
  const warn = document.createElement('p');
  warn.className = 'tx-note';
  warn.textContent = lock
    ? 'Loading unlocks this device with the netling in this code.'
    : 'Loading replaces everything on this device. Transfer this one out first if you want to keep it.';
  const go = document.createElement('button');
  go.type = 'button';
  go.className = 'danger-btn';
  go.textContent = lock ? 'LOAD AND UNLOCK' : 'REPLACE THIS DEVICE';
  go.addEventListener('click', applyImport);
  box.replaceChildren(dl, warn, go);
}

function applyImport() {
  if (!pendingImport) return;
  importing = true;
  for (const k of TRANSFER_KEYS) {
    const v = pendingImport.data[k];
    if (v === undefined) localStorage.removeItem(`netling.${k}`);
    else store.set(`netling.${k}`, v);
  }
  localStorage.removeItem(LOCK_KEY);
  store.set(SKEW_KEY, 0);
  location.replace(location.pathname + location.search);
}

// A scanned QR opens the game with #import=<code>: go straight to the import preview.
function importFromUrl() {
  if (!location.hash.startsWith('#import=')) return;
  const code = decodeURIComponent(location.hash.slice('#import='.length));
  history.replaceState(null, '', location.pathname + location.search);
  $('import-code').value = code;
  openSystem();
  checkImport();
}

// --- hibernate ---
function renderHibernateNote() {
  const blocked = hibernateBlockReason(state, now());
  $('hibernate-note').textContent = blocked
    ? `Freezes its clock for a long break. Not now: ${blocked}`
    : `Freezes its clock for a long break: nothing drains, nothing ages. It has to stay under for at least ${CFG.hibernateMinMin / 60} hours, and needs ${CFG.hibernateCooldownMin / 1440} days to recover after waking.`;
  $('hibernate-btn').disabled = Boolean(blocked);
}

$('hibernate-btn').addEventListener('click', () => {
  const btn = $('hibernate-btn');
  if (btn.dataset.armed !== '1') {
    btn.dataset.armed = '1';
    btn.textContent = `CONFIRM: AT LEAST ${CFG.hibernateMinMin / 60}H`;
    setTimeout(() => {
      btn.dataset.armed = '';
      btn.textContent = 'HIBERNATE';
    }, 4000);
    return;
  }
  const res = hibernate(state, now());
  if (!res.ok) return flashStatus(res.msg);
  save();
  transfer.close();
  sfx('lights', state.quirk.pitch);
  updateHUD();
});

$('wake-btn').addEventListener('click', () => {
  const res = wake(state, now());
  if (!res.ok) return flashStatus(res.msg);
  sfx('boot', state.quirk.pitch);
  save();
  advance();
});

function renderHibernation() {
  const h = state.hibernation;
  document.body.classList.toggle('frozen', Boolean(h));
  $('hibernating').hidden = !h;
  if (!h) return;
  const readyAt = wakeAvailableAt(state);
  const waitMin = Math.max(0, Math.ceil((readyAt - now()) / MIN));
  $('hibernate-status').textContent =
    `hibernating since ${new Date(h.since).toLocaleString()}.` +
    (waitMin > 0 ? ` it can wake in ${fmtAge(waitMin)}.` : ' it can wake whenever you are ready.');
  $('wake-btn').disabled = waitMin > 0;
}

// --- one active tab ------------------------------------------------------------------
// Two tabs simulating the same save would overwrite each other. A Web Lock makes one tab
// the caretaker; others wait (and take over when it closes) or can steal the role.

const TAB_LOCK = 'netling-active-tab';

function becomeInactive(message) {
  inactive = true;
  $('tab-guard').hidden = false;
  $('tab-guard-note').textContent = message;
}

// Queue behind whoever holds the role; reload (as the caretaker) once they let go.
function waitForTurn() {
  navigator.locks.request(TAB_LOCK, () => {
    location.reload();
    return new Promise(() => {});
  });
}

function claimTab() {
  return new Promise((resolve) => {
    if (!navigator.locks) return resolve(true); // no Web Locks: assume a single tab
    navigator.locks
      .request(TAB_LOCK, { ifAvailable: true }, (held) => {
        if (!held) {
          resolve(false);
          waitForTurn();
          return undefined;
        }
        resolve(true);
        return new Promise(() => {}); // held for this tab's lifetime
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') return;
        becomeInactive('Your netling moved to another tab.');
        waitForTurn();
      });
  });
}

$('tab-guard-use').addEventListener('click', () => {
  importing = true; // this tab's stale state must never be saved
  navigator.locks.request(TAB_LOCK, { steal: true }, () => {
    location.reload();
    return new Promise(() => {});
  });
});

// --- storage safety ---------------------------------------------------------------------

let storageState = 'checking';
async function protectStorage() {
  try {
    if (!navigator.storage?.persist) storageState = 'unknown';
    else if (await navigator.storage.persisted()) storageState = 'protected';
    else storageState = (await navigator.storage.persist()) ? 'protected' : 'at-risk';
  } catch {
    storageState = 'unknown';
  }
  renderStorageNote();
}

function renderStorageNote() {
  const notes = {
    checking: 'Checking...',
    protected: 'Protected: this browser has agreed to keep your netling\'s data.',
    'at-risk': 'Not protected yet: the browser may clear it to save space. Installing the app (or adding it to your Home Screen) usually fixes this.',
    unknown: 'This browser does not report whether it will keep your data. Installing the app is the safest option.',
  };
  $('storage-note').textContent = notes[storageState];
}

const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isStandalone = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
const IOS_HINT_KEY = 'netling.iosHintSeen';
if (isIOS && !isStandalone && !store.get(IOS_HINT_KEY)) $('ios-hint').hidden = false;
$('ios-hint-ok').addEventListener('click', () => {
  store.set(IOS_HINT_KEY, true);
  $('ios-hint').hidden = true;
});

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

// Lifetime record across every generation on this device.
function renderRecord() {
  const lineage = store.get(LINEAGE_KEY) ?? [];
  const full = lineage.filter((e) => e.cause === 'end of life cycle').length;
  let streak = 0;
  let bestStreak = 0;
  for (const e of lineage) {
    streak = e.cause === 'end of life cycle' ? streak + 1 : 0;
    bestStreak = Math.max(bestStreak, streak);
  }
  const acts = progress.acts ?? {};
  const runs = progress.runs ?? {};
  const best = (g) => progress.streaks?.[g]?.best ?? 0;
  const rows = [
    ['LIFE'],
    ['generations', lineage.length + (state.stage === 'dead' ? 0 : 1)],
    ['full 7-day lives', full],
    ['longest full-life streak', bestStreak],
    ['CARE'],
    ['meals served', (acts.corp ?? 0) + (acts.scav ?? 0)],
    ['viruses patched', acts.patch ?? 0],
    ['caches purged', acts.purge ?? 0],
    ['traces: hid / complied', `${acts.hide ?? 0} / ${acts.comply ?? 0}`],
    ['GAMES'],
    ['games played', progress.gamesPlayed ?? 0],
    ['best streak: breach / dodge / tune', `${best('breach')} / ${best('dodge')} / ${best('tune')}`],
    ['NETRUN'],
    ['runs: jacked out / disconnected', `${runs.jacked ?? 0} / ${runs.disconnected ?? 0}`],
    ['clean jack-outs', progress.cleanJackouts ?? 0],
    ['exits from the deep', progress.deepExits ?? 0],
  ];
  $('record').replaceChildren(
    ...rows.flatMap(([k, v]) => {
      if (v === undefined) {
        const h = document.createElement('div');
        h.className = 'rh';
        h.textContent = k;
        return [h];
      }
      const dt = document.createElement('dt');
      dt.textContent = k;
      const dd = document.createElement('dd');
      dd.textContent = v;
      return [dt, dd];
    }),
  );
}

function renderArchive() {
  renderRecord();
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
    setOnboarding('intro');
    startIntro();
  });
}

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) advance();
});

// Decide which tab is the caretaker before anything simulates or saves.
if (!(await claimTab())) becomeInactive('Your netling is open in another tab.');
protectStorage();
document.addEventListener('pointerdown', () => storageState !== 'protected' && protectStorage(), { once: true });

checkUnlocks({ silent: !store.get(UNLOCKED_KEY) });
applyWardrobe();
if (lock) showLock();
importFromUrl();
store.set(ONBOARD_KEY, onboarding);
if (onboarding === 'intro') startIntro();
else if (onboarding === 'readme') setTimeout(() => openHelp({ readme: true }), 700);
let plushCache = plushExtra();
advance();
drainCodexInbox();
drainAccessoryInbox();
backfillEarned();
if (state.stage === 'dead') showFlatline();
else if (state.run) openRun(); // resume a run after a reload
setInterval(advance, 1000);

// The home LCD animates in half-second steps, so ~10 fps is plenty and saves battery.
// Mini-games and netruns get every frame.
const IDLE_FRAME_MS = 100;
let lastFrame = performance.now();
let lastIdleDraw = 0;
(function loop(time) {
  const dt = Math.min(0.1, (time - lastFrame) / 1000);
  lastFrame = time;
  if (!session && time - lastIdleDraw < IDLE_FRAME_MS && !(time < flashUntil) && !(time < surgeUntil)) {
    requestAnimationFrame(loop);
    return;
  }
  if (!session) lastIdleDraw = time;
  if (session) {
    session.update(dt);
    session?.draw(canvas.getContext('2d'), PALETTES[state.quirk.palette] ?? PALETTES[0], time);
  } else {
    renderLCD(canvas, state, time, {
      accessory: ownedAccessories.includes(wardrobe.accessory) ? wardrobe.accessory : null,
      accessoryColors: wardrobe.colors?.[wardrobe.accessory] ?? null,
      prop: ownedAccessories.includes(wardrobe.prop) ? wardrobe.prop : null,
      propExtra: wardrobe.prop === 'plush' ? plushCache : null,
      flash: time < flashUntil,
      surge: time < surgeUntil,
      calm: reducedMotion.matches,
    });
  }
  requestAnimationFrame(loop);
})(performance.now());
