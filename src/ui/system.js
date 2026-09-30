// Archive > SYSTEM: transfer out (and the lock screen), bring one here, hibernate, restart,
// volume, and storage safety.
import { hibernate, hibernateBlockReason, wake, wakeAvailableAt, CFG, MIN } from '../sim.js';
import { encodeSave, decodeSave, describeSave, TRANSFER_KEYS } from '../transfer.js';
import { encodeQR, drawQR } from '../qr.js';
import { sfx, unlockAudio, setVolume } from '../audio.js';
import { setMusicVolume } from '../music.js';
import { syncMusicMode } from './soundtrack.js';
import { KEYS } from '../storage.js';
import { $, app, armed, flashStatus, now, save, setTestMode, setTestSpeed, store, TEST, testMode } from './app.js';
import { fmtAge, updateHUD } from './hud.js';
import { advance } from './life.js';
import { renderScreenPrefs } from './device.js';

let pendingImport = null;

// Only the recent log travels: it's most of the payload, and a smaller code means a sparser QR.
const EXPORT_LOG_LINES = 10;
const MAX_IMPORT_FILE_CHARS = 200_000;

// Everything that travels, from memory: storage may be missing the latest if a write failed.
function collectData() {
  save();
  const data = {
    save: { ...app.state, log: app.state.log.slice(-EXPORT_LOG_LINES) },
    lineage: app.lineage,
    dex: app.dex,
    codex: app.codex,
    wardrobe: app.wardrobe,
    progress: app.progress,
    unlocked: app.unlocked,
    accessories: app.ownedAccessories,
    prefs: app.prefs,
    onboarding: app.onboarding,
    helpSeen: store.get(KEYS.helpSeen) ?? undefined,
  };
  return Object.fromEntries(TRANSFER_KEYS.filter((k) => data[k] !== undefined).map((k) => [k, data[k]]));
}

function downloadText(name, text, type = 'text/plain') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// A save that couldn't be read at load time, kept as { at, raw } (older builds stored the bare text).
function oldSave() {
  const v = store.get(KEYS.corruptSave);
  if (typeof v === 'string') return { at: null, raw: v };
  return v && typeof v.raw === 'string' ? { at: Number.isFinite(v.at) ? v.at : null, raw: v.raw } : null;
}

function renderOldSave() {
  const old = oldSave();
  $('old-save').hidden = !old;
  const base = TEST
    ? 'Erases the test data (test netling, lineage, codex, style) and starts the test over. Your real netling is untouched.'
    : 'Erases everything on this device (netling, lineage, codex, style) and starts over from the beginning.';
  $('restart-note').textContent = old ? `${base} That includes the set-aside save above, so download it first if you want it.` : base;
  if (!old) return;
  const when = old.at ? ` on ${new Date(old.at).toLocaleString()}` : '';
  $('old-save-note').textContent =
    `A saved netling on this device couldn't be read${when}, so it was set aside and a new one compiled. ` +
    `Download it to keep a copy (${Math.ceil(old.raw.length / 1024)} KB of raw save data).`;
}

const importUrl = (code) => `${location.origin}${location.pathname}#import=${code}`;

// The code in a pasted QR link (or a bare code). Malformed escapes are left for decodeSave to reject.
function codeFrom(text) {
  const raw = text.trim();
  if (!raw.includes('#import=')) return raw;
  const part = raw.slice(raw.indexOf('#import=') + '#import='.length);
  try {
    return decodeURIComponent(part);
  } catch {
    return part;
  }
}

export function openSystem() {
  $('archive').close();
  renderStorageNote();
  renderOldSave();
  $('volume').value = Math.round(app.prefs.volume * 100);
  $('volume-value').textContent = `${Math.round(app.prefs.volume * 100)}%`;
  $('music-volume').value = Math.round(app.prefs.musicVolume * 100);
  $('music-volume-value').textContent = `${Math.round(app.prefs.musicVolume * 100)}%`;
  renderScreenPrefs();
  $('import-preview').hidden = true;
  renderHibernateNote();
  renderTestMode();
  $('transfer').showModal();
}

// --- test mode ---

function renderTestMode() {
  $('test-mode').hidden = !(TEST || testMode.revealed);
  $('test-speed').value = String(testMode.speed);
  $('test-toggle').textContent = TEST ? 'LEAVE TEST MODE' : 'ENTER TEST MODE';
  $('test-note').textContent = TEST
    ? 'You are in test mode: a separate netling on a faster clock. It keeps running at this speed while the app is closed, and pauses while you are back on your real netling. RESTART below erases only the test data. Your real netling is untouched.'
    : 'A separate netling (with its own lineage, codex and style) on a faster clock, for testing. Your real netling keeps living in real time meanwhile and is untouched.';
}

export function renderTestBadge() {
  $('test-badge').hidden = !TEST;
  if (TEST) $('test-badge').textContent = `TEST ${app.testClock.speed}x`;
}

// Seven quick taps on the logo reveal (or hide) the test mode controls.
function watchLogoTaps() {
  let taps = [];
  document.querySelector('.logo').addEventListener('click', () => {
    const t = performance.now();
    taps = [...taps.filter((x) => t - x < 4000), t];
    if (taps.length < 7 || TEST) return;
    taps = [];
    const revealed = !testMode.revealed;
    if (!setTestMode({ revealed })) return;
    flashStatus(revealed ? 'test mode unlocked: ARCHIVE > SYSTEM.' : 'test mode hidden.');
  });
}

// A mini-game or netrun on screen must finish first: hibernating would freeze the pad under the
// overlay, and a transfer would leave it running on a locked device.
export function sessionBlockReason() {
  if (!app.session) return null;
  return app.state.run ? 'finish the netrun first.' : 'finish the game first.';
}

// --- transfer out: export and lock ---

async function transferOut() {
  const btn = $('transfer-out');
  const busy = TEST ? 'not in test mode: a test netling stays on this device.' : sessionBlockReason();
  if (busy) {
    sfx('error', app.state.quirk.pitch);
    return flashStatus(busy);
  }
  if (!armed(btn, 'CONFIRM: LOCK THIS DEVICE', 'TRANSFER OUT')) return;
  const code = await encodeSave(collectData());
  const lock = { code, at: Date.now(), generation: app.state.generation };
  // The lock must stick, or the netling would live on here too.
  if (!store.set(KEYS.lock, lock)) {
    sfx('error', app.state.quirk.pitch);
    flashStatus("couldn't lock this device (storage is full or blocked). nothing was transferred.", 5000);
    return;
  }
  app.lock = lock;
  $('transfer').close();
  sfx('patch', app.state.quirk.pitch);
  showLock();
}

export function showLock() {
  const { lock } = app;
  document.body.classList.add('locked');
  $('lock').hidden = false;
  $('lock-note').textContent = `netling.v${lock.generation}.0 left this device on ${new Date(lock.at).toLocaleString()}. Load it on the other device; its clock keeps running until you do.`;
  $('lock-code').value = lock.code;
  try {
    drawQR($('lock-qr'), encodeQR(importUrl(lock.code)), 3);
    $('lock-qr').hidden = false;
  } catch {
    $('lock-qr').hidden = true; // too big for a QR; the code still works
  }
}

// Two presses, a few seconds apart at most, then everything is wiped.
function restartEverything(btn) {
  if (!armed(btn, 'PRESS AGAIN TO ERASE ALL', btn.dataset.label ?? (btn.dataset.label = btn.textContent))) return;
  if (!store.clearAll()) {
    flashStatus("couldn't erase: this browser is blocking storage.", 5000);
    return;
  }
  app.leaving = true;
  location.replace(location.pathname + location.search);
}

// --- bring one here ---

async function checkImport() {
  const box = $('import-preview');
  box.hidden = false;
  box.className = 'tx-preview';
  box.replaceChildren();
  const code = codeFrom($('import-code').value);
  try {
    pendingImport = await decodeSave(code, now());
  } catch (err) {
    pendingImport = null;
    box.className = 'tx-preview error';
    box.textContent = err?.message || 'could not read that code.';
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
  warn.textContent = app.lock
    ? 'Loading unlocks this device with the netling in this code.'
    : TEST
      ? 'Loading replaces the test data. Your real netling is untouched.'
      : 'Loading replaces everything on this device. Transfer this one out first if you want to keep it.';
  const go = document.createElement('button');
  go.type = 'button';
  go.className = 'danger-btn';
  go.textContent = app.lock ? 'LOAD AND UNLOCK' : TEST ? 'REPLACE TEST DATA' : 'REPLACE THIS DEVICE';
  go.addEventListener('click', applyImport);
  box.replaceChildren(dl, warn, go);
}

// All of it lands or none of it does; then reload into the imported data.
function applyImport() {
  if (!pendingImport) return;
  const entries = Object.fromEntries(TRANSFER_KEYS.map((k) => [`netling.${k}`, pendingImport.data[k]]));
  entries[KEYS.lock] = undefined;
  entries[KEYS.skew] = 0;
  if (!store.setAll(entries)) {
    const box = $('import-preview');
    box.className = 'tx-preview error';
    box.textContent = 'not enough storage space to load this, or the browser is blocking storage. nothing on this device was changed.';
    sfx('error', 660);
    return;
  }
  app.leaving = true;
  location.replace(location.pathname + location.search);
}

// A scanned QR opens the game with #import=<code>: go straight to the import preview.
export function importFromUrl() {
  if (!location.hash.startsWith('#import=')) return;
  const code = codeFrom(location.hash);
  history.replaceState(null, '', location.pathname + location.search);
  $('import-code').value = code;
  openSystem();
  checkImport();
}

// --- hibernate ---

function renderHibernateNote() {
  const blocked = sessionBlockReason() ?? hibernateBlockReason(app.state, now());
  $('hibernate-note').textContent = blocked
    ? `Freezes its clock for a long break. Not now: ${blocked}`
    : `Freezes its clock for a long break: nothing drains, nothing ages. It has to stay under for at least ${CFG.hibernateMinMin / 60} hours, and needs ${CFG.hibernateCooldownMin / 1440} days to recover after waking.`;
  $('hibernate-btn').disabled = Boolean(blocked);
}

export function renderHibernation() {
  const h = app.state.hibernation;
  document.body.classList.toggle('frozen', Boolean(h));
  $('hibernating').hidden = !h;
  if (!h) return;
  const readyAt = wakeAvailableAt(app.state);
  const waitMin = Math.max(0, Math.ceil((readyAt - now()) / MIN));
  $('hibernate-status').textContent =
    `hibernating since ${new Date(h.since).toLocaleString()}.` +
    (waitMin > 0 ? ` it can wake in ${fmtAge(waitMin)}.` : ' it can wake whenever you are ready.');
  $('wake-btn').disabled = waitMin > 0;
}

// --- storage safety ---

let storageState = 'checking';
export async function protectStorage() {
  try {
    if (!navigator.storage?.persist) storageState = 'unknown';
    else if (await navigator.storage.persisted()) storageState = 'protected';
    else storageState = (await navigator.storage.persist()) ? 'protected' : 'at-risk';
  } catch {
    storageState = 'unknown';
  }
  renderStorageNote();
}
export const storageProtected = () => storageState === 'protected';

function renderStorageNote() {
  const notes = {
    checking: 'Checking...',
    protected: "Protected: this browser has agreed to keep your netling's data.",
    'at-risk': 'Not protected yet: the browser may clear it to save space. Installing the app (or adding it to your Home Screen) usually fixes this.',
    unknown: 'This browser does not report whether it will keep your data. Installing the app is the safest option.',
  };
  const failed = app.writeFailed ? 'The last save FAILED: storage is full or blocked, so recent progress may be lost. ' : '';
  $('storage-note').textContent = failed + notes[storageState];
}

export function initSystem() {
  const transfer = $('transfer');
  $('open-transfer').addEventListener('click', openSystem);
  $('close-transfer').addEventListener('click', () => transfer.close());

  $('volume').addEventListener('input', () => {
    app.prefs.volume = Number($('volume').value) / 100;
    setVolume(app.prefs.volume);
    $('volume-value').textContent = `${$('volume').value}%`;
    store.set(KEYS.prefs, app.prefs);
  });
  $('volume').addEventListener('change', () => {
    unlockAudio();
    sfx('select', app.state.quirk.pitch); // preview at the new level
  });

  $('music-volume').addEventListener('input', () => {
    app.prefs.musicVolume = Number($('music-volume').value) / 100;
    unlockAudio();
    setMusicVolume(app.prefs.musicVolume);
    syncMusicMode();
    $('music-volume-value').textContent = `${$('music-volume').value}%`;
    store.set(KEYS.prefs, app.prefs);
  });

  $('transfer-out').addEventListener('click', transferOut);

  $('lock-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(app.lock.code);
      $('lock-copy').textContent = 'COPIED';
    } catch {
      $('lock-code').select();
      $('lock-copy').textContent = 'SELECTED: COPY IT';
    }
    setTimeout(() => ($('lock-copy').textContent = 'COPY CODE'), 2000);
  });

  $('lock-download').addEventListener('click', () => {
    downloadText(`netling-v${app.lock.generation}-${new Date(app.lock.at).toISOString().slice(0, 10)}.txt`, app.lock.code);
  });

  $('old-save-download').addEventListener('click', () => {
    const old = oldSave();
    if (!old) return renderOldSave();
    const day = new Date(old.at ?? Date.now()).toISOString().slice(0, 10);
    downloadText(`netling-set-aside-save-${day}.json`, old.raw, 'application/json');
  });
  $('old-save-delete').addEventListener('click', () => {
    if (!armed($('old-save-delete'), 'SURE? DELETE IT', 'DELETE')) return;
    if (!store.remove(KEYS.corruptSave)) flashStatus("couldn't delete it: storage is blocked.");
    renderOldSave();
  });

  // Re-export: the same code again (nothing changed while locked), redrawn fresh.
  $('lock-reexport').addEventListener('click', () => {
    showLock();
    sfx('select', 660);
  });

  // Reload: bring a code here (this device's own, or another).
  $('lock-reload').addEventListener('click', () => {
    $('import-code').value = app.lock.code;
    openSystem();
    checkImport();
  });

  $('lock-restart').addEventListener('click', () => restartEverything($('lock-restart')));
  $('restart-btn').addEventListener('click', () => restartEverything($('restart-btn')));

  $('import-file').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    $('import-code').value = (await file.slice(0, MAX_IMPORT_FILE_CHARS * 4).text()).slice(0, MAX_IMPORT_FILE_CHARS);
    e.target.value = '';
    checkImport();
  });
  $('check-code').addEventListener('click', checkImport);

  $('hibernate-btn').addEventListener('click', () => {
    const busy = sessionBlockReason();
    if (busy) return flashStatus(busy);
    if (!armed($('hibernate-btn'), `CONFIRM: AT LEAST ${CFG.hibernateMinMin / 60}H`, 'HIBERNATE')) return;
    const res = hibernate(app.state, now());
    if (!res.ok) return flashStatus(res.msg);
    save();
    transfer.close();
    sfx('lights', app.state.quirk.pitch);
    updateHUD();
  });

  $('wake-btn').addEventListener('click', () => {
    const res = wake(app.state, now());
    if (!res.ok) return flashStatus(res.msg);
    sfx('boot', app.state.quirk.pitch);
    save();
    advance();
  });

  $('test-speed').addEventListener('change', () => {
    if (!TEST) return; // picked before entering: applied on the way in
    setTestSpeed(Number($('test-speed').value));
    renderTestBadge();
    flashStatus(`test clock: ${app.testClock.speed}x.`);
  });
  $('test-toggle').addEventListener('click', () => {
    if (TEST) return void setTestMode({ on: false });
    if (!setTestMode({ on: true, speed: Number($('test-speed').value) })) flashStatus("couldn't switch: storage is blocked.");
  });
  watchLogoTaps();

  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isStandalone = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  if (isIOS && !isStandalone && !store.get(KEYS.iosHint)) $('ios-hint').hidden = false;
  $('ios-hint-ok').addEventListener('click', () => {
    store.set(KEYS.iosHint, true);
    $('ios-hint').hidden = true;
  });
}
