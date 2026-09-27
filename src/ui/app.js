// Shared state for the UI modules: the live netling, player data loaded from storage,
// the storage gate, and small DOM helpers. Everything here is plain data or a function;
// nothing touches the page until main.js boots.
import { createScript, migrate } from '../sim.js';
import { createStore, KEYS } from '../storage.js';
import {
  cleanSave,
  cleanLineage,
  cleanDex,
  cleanCodex,
  cleanAccessories,
  cleanUnlocked,
  cleanWardrobe,
  cleanProgress,
  cleanPrefs,
  cleanOnboarding,
  cleanLock,
  num,
} from '../sanitize.js';
import { FRAGMENTS } from '../netrun/codex.js';

export const $ = (id) => document.getElementById(id);
export const DEV = new URLSearchParams(location.search).has('dev');

export const app = {
  state: null, // the live netling (sim.js)
  prefs: null,
  progress: null,
  wardrobe: null,
  unlocked: [],
  freshUnlocks: new Set(),
  codex: [],
  dex: [],
  ownedAccessories: [],
  onboarding: 'done',
  firstLaunch: false,
  corruptSave: null, // the raw text of a save that couldn't be used
  skew: 0,
  session: null, // the running mini-game or netrun view

  // Storage gate: see canWrite() below.
  claimed: false, // this tab won the caretaker role (tabs.js)
  inactive: false, // another tab is looking after the netling
  leaving: false, // about to reload after an import, restart or takeover: stale state must not be saved
  lock: null, // { code, at, generation } while the netling is on another device
  writeFailed: false,

  // Render bookkeeping.
  lastStage: null,
  lastLogLen: 0,
  lastAttention: false,
  flashUntil: 0,
  surgeUntil: 0,
  lastSurgeAt: null,
  plushCache: null,
};

// While the netling is on another device, only settings may change.
const WRITABLE_WHILE_LOCKED = new Set([KEYS.lock, KEYS.prefs, KEYS.iosHint]);

function canWrite(key) {
  if (!app.claimed || app.inactive || app.leaving) return false;
  return !app.lock || key === null || WRITABLE_WHILE_LOCKED.has(key);
}

const WRITE_WARN_EVERY_MS = 60_000;
let lastWriteWarn = -Infinity;
function onWriteError() {
  app.writeFailed = true;
  if (performance.now() - lastWriteWarn < WRITE_WARN_EVERY_MS) return;
  lastWriteWarn = performance.now();
  flashStatus('storage is full or blocked: progress is not being saved.', 5000);
}

export const store = createStore(() => localStorage, { canWrite, onError: onWriteError });

export const now = () => Date.now() + app.skew;
export const codexComplete = () => FRAGMENTS.every((f) => app.codex.includes(f.id));
export const loadLineage = () => cleanLineage(store.get(KEYS.lineage));

export function save() {
  if (store.set(KEYS.save, app.state)) app.writeFailed = false;
}

// Read and check everything in storage. Writes nothing: the tab may not be the caretaker yet.
export function loadAll() {
  app.skew = DEV ? num(store.get(KEYS.skew), 0) : 0;
  app.codex = cleanCodex(store.get(KEYS.codex));
  app.dex = cleanDex(store.get(KEYS.dex));
  app.ownedAccessories = cleanAccessories(store.get(KEYS.accessories));
  app.unlocked = cleanUnlocked(store.get(KEYS.unlocked));
  app.wardrobe = cleanWardrobe(store.get(KEYS.wardrobe));
  app.progress = cleanProgress(store.get(KEYS.progress));
  app.prefs = cleanPrefs(store.get(KEYS.prefs));
  app.lock = cleanLock(store.get(KEYS.lock));

  const rawSave = store.getRaw(KEYS.save);
  let state = cleanSave(store.get(KEYS.save), now());
  app.firstLaunch = rawSave === null;
  // An unusable save is set aside (boot stores it under KEYS.corruptSave) rather than lost.
  app.corruptSave = rawSave !== null && !state ? rawSave : null;
  if (!state) state = createScript({ now: now(), rootAccess: codexComplete() });
  migrate(state);
  app.state = state;
  app.onboarding = cleanOnboarding(store.get(KEYS.onboarding)) ?? (app.firstLaunch ? 'intro' : 'done');
  app.lastStage = state.stage;
  app.lastSurgeAt = state.lastSurgeAt;
}

let statusTimer;
export function flashStatus(msg, ms = 1800) {
  const el = $('status');
  el.textContent = `> ${msg}`;
  el.classList.add('show');
  clearTimeout(statusTimer);
  statusTimer = setTimeout(() => el.classList.remove('show'), ms);
}

// A button that needs a second press within a few seconds. Returns true on the second press.
export function armed(btn, confirmLabel, idleLabel, ms = 4000) {
  if (btn.dataset.armed === '1') {
    btn.dataset.armed = '';
    btn.textContent = idleLabel;
    return true;
  }
  btn.dataset.armed = '1';
  btn.textContent = confirmLabel;
  setTimeout(() => {
    btn.dataset.armed = '';
    btn.textContent = idleLabel;
  }, ms);
  return false;
}
