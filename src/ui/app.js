// Shared state for the UI modules: the live netling, player data loaded from storage,
// the storage gate, and small DOM helpers. Everything here is plain data or a function;
// nothing touches the page until main.js boots.
import { createScript, migrate, CFG, FORMS } from '../sim.js';
import { createStore, KEYS, TEST_PREFIX } from '../storage.js';
import {
  cleanSave,
  cleanLineage,
  cleanDex,
  cleanCodex,
  cleanAccessories,
  cleanCheckin,
  cleanRewardBox,
  cleanUnlocked,
  cleanWardrobe,
  cleanProgress,
  cleanPrefs,
  cleanOnboarding,
  cleanLock,
  cleanTestClock,
  cleanTestMode,
  num,
  TEST_SPEEDS,
} from '../sanitize.js';
import { allFragmentsFound, rootUnlocked as rootUnlockedFor, ROOT_FRAGMENTS } from '../netrun/codex.js';
import { isNewerSave, upgradeSave } from '../migrations.js';

export const $ = (id) => document.getElementById(id);
export const DEV_URL = new URLSearchParams(location.search).has('dev');
// Playtesting the Mainframe stage before it ships (docs/SOURCE_PLAN.md): ?dev&mainframe switches it on for this page only.
if (DEV_URL && new URLSearchParams(location.search).has('mainframe')) CFG.mainframe = true;

export const app = {
  state: null, // the live netling (sim.js)
  prefs: null,
  progress: null,
  wardrobe: null,
  checkin: null, // the daily check-in ladder (checkin.js)
  rewardBox: [], // check-in rewards waiting to be taken
  unlocked: [],
  freshUnlocks: new Set(),
  codex: [],
  dex: [],
  ownedAccessories: [],
  lineage: [], // every generation that died on this device; only onFlatline (life.js) adds to it
  onboarding: 'done',
  firstLaunch: false,
  corruptSave: null, // the raw text of a save that couldn't be used
  newerSave: false, // that save was written by a newer build of the game
  preUpgrade: null, // { from, raw }: the stored save before an upgrade step changed it (boot stores a backup)
  skew: 0,
  testClock: null, // test mode: { simAt, realAt, speed }
  session: null, // the running mini-game or netrun view
  quitArmed: false, // the touch quit confirm is showing: the session is paused (ui/play.js)

  // Storage gate: see canWrite() below.
  claimed: false, // this tab won the caretaker role (tabs.js)
  inactive: false, // another tab is looking after the netling
  leaving: false, // about to reload after an import, restart or takeover: stale state must not be saved
  lock: null, // { code, at, generation } while the netling is on another device
  writeFailed: false,

  // Render bookkeeping.
  lastStage: null,
  lastLogKey: '',
  lastAttention: false,
  flashUntil: 0,
  calm: false, // reduced motion, from the MOTION setting or the system (ui/device.js)
  surgeUntil: 0,
  anim: null, // { kind, start }: see playAnim
  lastSurgeAt: null,
  lastVisit: false,
  plushCache: null,
};

// While the netling is on another device, only settings may change.
const WRITABLE_WHILE_LOCKED = new Set([KEYS.lock, KEYS.prefs, KEYS.iosHint, KEYS.corruptSave, KEYS.testMode]);

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

// The real data. Test mode's switch lives here, read before anything else.
export const realStore = createStore(() => localStorage, { canWrite, onError: onWriteError });
export const testMode = cleanTestMode(realStore.get(KEYS.testMode));

// Test mode: a separate netling (and lineage, codex, style...) in its own storage namespace,
// on a clock that can run up to a full life per hour. The real netling keeps living in real
// time meanwhile, untouched. Turned on and off in ARCHIVE > SYSTEM (revealed by tapping the logo).
export const TEST = testMode.on;
export const DEV = DEV_URL || TEST; // time-skip buttons
export const store = TEST ? createStore(() => localStorage, { canWrite, onError: onWriteError, namespace: TEST_PREFIX }) : realStore;

// Game time. In test mode it runs `speed` times as fast from its anchor, including while closed.
function clock() {
  const c = app.testClock;
  return c ? c.simAt + (Date.now() - c.realAt) * c.speed : Date.now();
}
export const now = () => clock() + app.skew;

// Re-anchors the test clock, so changing speed doesn't jump the time already reached.
export function setTestSpeed(speed) {
  if (!TEST || !TEST_SPEEDS.includes(speed)) return;
  app.testClock = { simAt: clock(), realAt: Date.now(), speed };
  store.set(KEYS.testClock, app.testClock);
  if (realStore.set(KEYS.testMode, { ...testMode, speed })) testMode.speed = speed;
}

// Switches test mode on or off (or reveals its controls) and reloads into it.
// Leaving pauses the test clock, so the test netling picks up where it was.
export function setTestMode(next) {
  if (TEST && next.on === false) store.set(KEYS.testClock, { ...app.testClock, simAt: clock(), realAt: null });
  if (!realStore.set(KEYS.testMode, { ...testMode, ...next })) return false;
  if (next.on === undefined) return Boolean(Object.assign(testMode, next));
  app.leaving = true; // this mode's state must not be saved into the other one
  location.replace(location.pathname + location.search);
  return true;
}
// Whether new netlings compile with Root Access: the codex was completed at some point (kept even if fragments are added later).
export const rootUnlocked = () => rootUnlockedFor(app.progress, app.codex);
// Adult forms this player has never raised: a new netling carries the list (it tips tied evolutions).
export const newForms = () => Object.keys(FORMS).filter((f) => !app.dex.includes(f));

export function save() {
  if (store.set(KEYS.save, app.state)) app.writeFailed = false;
}

// Read and check everything in storage. Writes nothing: the tab may not be the caretaker yet.
export function loadAll() {
  app.skew = DEV ? num(store.get(KEYS.skew), 0) : 0;
  if (TEST) {
    // First run starts at real time; a paused clock resumes; a new speed re-anchors.
    const t = Date.now();
    const c = cleanTestClock(store.get(KEYS.testClock));
    const reached = !c ? t : c.realAt === null ? c.simAt : c.simAt + (t - c.realAt) * c.speed;
    app.testClock = !c || c.realAt === null || c.speed !== testMode.speed ? { simAt: reached, realAt: t, speed: testMode.speed } : c;
  }
  app.codex = cleanCodex(store.get(KEYS.codex));
  app.lineage = cleanLineage(store.get(KEYS.lineage));
  app.dex = cleanDex(store.get(KEYS.dex));
  app.ownedAccessories = cleanAccessories(store.get(KEYS.accessories));
  app.checkin = cleanCheckin(store.get(KEYS.checkin));
  app.rewardBox = cleanRewardBox(store.get(KEYS.rewardBox));
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
  const stored = store.get(KEYS.save);
  app.newerSave = app.corruptSave !== null && isNewerSave(stored);
  const up = state ? upgradeSave(stored) : null;
  app.preUpgrade = up?.upgraded ? { from: up.from, raw: rawSave } : null;
  if (!state) state = createScript({ now: now(), rootAccess: rootUnlocked(), newForms: newForms() });
  migrate(state);
  // Root Access is earned once and kept. Remember it for players who finished the codex, or whom NL-0 had
  // already covered, before it was recorded (boot writes it back to storage).
  if (allFragmentsFound(app.codex, ROOT_FRAGMENTS) || state.rootAccess || state.rootUsed || state.rootCooling || app.lineage.some((e) => e.rescued)) app.progress.rootEarned = true;
  app.state = state;
  app.onboarding = cleanOnboarding(store.get(KEYS.onboarding)) ?? (app.firstLaunch ? 'intro' : 'done');
  app.lastStage = state.stage;
  app.lastSurgeAt = state.lastSurgeAt;
}

// A short reaction on the LCD to the last action (drawn by render.js).
export function playAnim(kind) {
  app.anim = { kind, start: performance.now() };
  document.getElementById('lcd').dataset.anim = kind; // lets tests see what played
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
// Each button keeps one timer, so a stale one can't disarm a newer first press early.
const armTimers = new WeakMap();
export function armed(btn, confirmLabel, idleLabel, ms = 4000) {
  if (btn.dataset.armed === '1') {
    disarm(btn, idleLabel);
    return true;
  }
  clearTimeout(armTimers.get(btn));
  btn.dataset.armed = '1';
  btn.textContent = confirmLabel;
  armTimers.set(btn, setTimeout(() => disarm(btn, idleLabel), ms));
  return false;
}

// Cancels a pending first press, e.g. when what the button acts on has changed.
export function disarm(btn, idleLabel) {
  clearTimeout(armTimers.get(btn));
  btn.dataset.armed = '';
  btn.textContent = idleLabel;
}
