// Boot: load and check saved data, claim the caretaker tab, wire the UI, then run the clock
// and the render loop. The UI itself lives in src/ui/.
import { createScript, isAlive, CFG, MIN, PALETTES } from './sim.js';
import { renderLCD, ANIM_MS, SURGE_MS } from './render.js';
import { discover, formsSeenIn } from './archive.js';
import { sfx, unlockAudio, setMuted, setVolume } from './audio.js';
import { notifyGranted, notifySupported, requestNotify, registerServiceWorker } from './notify.js';
import { KEYS } from './storage.js';
import { $, app, DEV, TEST, newForms, rootUnlocked, flashStatus, loadAll, now, save, store } from './ui/app.js';
import { initInventory, updateHUD } from './ui/hud.js';
import { applyWardrobe, backfillEarned, checkUnlocks, drainAccessoryInbox, plushExtra } from './ui/style.js';
import { drainCodexInbox, initArchive } from './ui/archive.js';
import { initOnboarding, openHelp, setOnboarding, startIntro } from './ui/onboarding.js';
import { dropSession, initPlay, openRun } from './ui/play.js';
import { importFromUrl, initSystem, protectStorage, renderTestBadge, sessionBlockReason, showLock, storageProtected } from './ui/system.js';
import { becomeInactive, claimTab, initTabs } from './ui/tabs.js';
import { initGamepad } from './ui/gamepad.js';
import { advance, flushSave, initLife, showFlatline } from './ui/life.js';
import { watchForUpdates } from './update.js';
import { initDevice, syncDevice } from './ui/device.js';

loadAll();
setVolume(app.prefs.volume);
setMuted(!app.prefs.sound);

initLife();
initInventory();
initPlay();
initArchive();
initOnboarding();
initSystem();
initTabs();
initGamepad();
initDevice();

// --- settings ---

function renderPrefs() {
  const alertsOn = app.prefs.alerts && notifyGranted();
  $('pref-sound').textContent = app.prefs.sound ? 'SND ON' : 'SND OFF';
  $('pref-sound').setAttribute('aria-pressed', app.prefs.sound);
  $('pref-alerts').textContent = alertsOn ? 'ALERTS ON' : 'ALERTS OFF';
  $('pref-alerts').setAttribute('aria-pressed', alertsOn);
  $('pref-alerts').hidden = !notifySupported();
}

$('pref-sound').addEventListener('click', () => {
  app.prefs.sound = !app.prefs.sound;
  setMuted(!app.prefs.sound);
  store.set(KEYS.prefs, app.prefs);
  unlockAudio();
  sfx('select', app.state.quirk.pitch);
  renderPrefs();
});

$('pref-alerts').addEventListener('click', async () => {
  if (app.prefs.alerts && notifyGranted()) {
    app.prefs.alerts = false;
  } else {
    app.prefs.alerts = await requestNotify();
    if (!app.prefs.alerts) flashStatus('notifications blocked by the browser.');
  }
  store.set(KEYS.prefs, app.prefs);
  renderPrefs();
  syncDevice();
});

renderPrefs();
registerServiceWorker();

// --- updates ---

// A newer release took over while the page was open: offer a reload instead of forcing one. Like a
// transfer, it waits for a running mini-game or netrun to finish.
const UPDATE_CHECK_MS = 60 * 60 * 1000;
const checkForUpdate = watchForUpdates(() => ($('update-bar').hidden = false));
setInterval(checkForUpdate, UPDATE_CHECK_MS);

$('update-reload').addEventListener('click', () => {
  const busy = sessionBlockReason();
  if (busy) {
    sfx('error', app.state.quirk.pitch);
    flashStatus(busy);
    return;
  }
  flushSave();
  location.reload();
});
$('update-later').addEventListener('click', () => ($('update-bar').hidden = true));

if (DEV) {
  const dev = $('dev');
  const setSkew = (ms) => {
    app.skew = ms;
    store.set(KEYS.skew, ms);
  };
  dev.hidden = false;
  dev.querySelectorAll('[data-skip]').forEach((btn) =>
    btn.addEventListener('click', () => {
      setSkew(app.skew + Number(btn.dataset.skip) * MIN);
      advance();
    }),
  );
  $('dev-evolve').addEventListener('click', () => {
    const state = app.state;
    const target = state.stage === 'baby' ? state.life.teenAt : state.stage === 'teen' ? state.life.adultAt : null;
    if (target === null) return;
    const skip = target - state.ageMin;
    setSkew(app.skew + skip * MIN);
    // Jump the clock without simulating the gap, so the pet survives the test.
    state.ageMin += skip - 1;
    state.lastTick += (skip - 1) * MIN;
    advance();
  });
  $('dev-trace').addEventListener('click', () => {
    if (!isAlive(app.state)) return;
    app.state.event = { type: 'trace', startedAge: app.state.ageMin };
    save();
    updateHUD();
  });
  for (const type of ['attack', 'overflow']) {
    $(`dev-${type}`).addEventListener('click', () => {
      if (!isAlive(app.state)) return;
      app.state.event = { type, startedAge: app.state.ageMin };
      save();
      updateHUD();
    });
  }
  $('dev-reset').addEventListener('click', () => {
    setSkew(0);
    app.state = createScript({ now: now(), rootAccess: rootUnlocked(), newForms: newForms() });
    app.lastStage = app.state.stage;
    $('flatline').hidden = true;
    save();
    updateHUD();
    setOnboarding('intro');
    startIntro();
  });
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) flushSave();
  else {
    advance();
    checkForUpdate();
  }
  syncDevice();
});
addEventListener('pagehide', flushSave);

// --- boot ---

// Decide which tab is the caretaker before anything simulates or saves: until then, storage is read-only.
app.claimed = await claimTab();
if (!app.claimed) becomeInactive('Your netling is open in another tab.');
if (TEST) store.set(KEYS.testClock, app.testClock); // keep the anchor across reloads
renderTestBadge();

if (app.corruptSave && store.set(KEYS.corruptSave, { at: Date.now(), raw: app.corruptSave })) {
  const why = app.newerSave ? 'was saved by a newer version of the game (reload to update)' : 'could not be read';
  setTimeout(() => flashStatus(`the saved netling ${why}, so a new one was compiled. the old save is in ARCHIVE > SYSTEM.`, 6000), 1000);
}
// A save that was just upgraded keeps a copy of how it looked before, in case a step went wrong.
if (app.preUpgrade) store.set(KEYS.preUpgrade, { at: Date.now(), from: app.preUpgrade.from, raw: app.preUpgrade.raw });

// Root Access remembered from the codex or the save (see loadAll): write it back if storage doesn't have it yet.
if (app.progress.rootEarned && store.get(KEYS.progress)?.rootEarned !== true) store.set(KEYS.progress, app.progress);

// Older saves: backfill the dex with forms this save proves were seen.
if (formsSeenIn(app.state, app.lineage).map((form) => discover(app.dex, form)).some(Boolean)) store.set(KEYS.dex, app.dex);

protectStorage();
document.addEventListener('pointerdown', () => !storageProtected() && protectStorage(), { once: true });

checkUnlocks({ silent: !Array.isArray(store.get(KEYS.unlocked)) });
applyWardrobe();
if (app.lock) showLock();
if (!app.inactive) importFromUrl(); // a waiting tab keeps the link for when it takes over
store.set(KEYS.onboarding, app.onboarding);
if (app.onboarding === 'intro') startIntro();
else if (app.onboarding === 'readme') setTimeout(() => openHelp({ readme: true }), 700);
app.plushCache = plushExtra();
advance();
drainCodexInbox();
drainAccessoryInbox();
backfillEarned();
if (app.state.stage === 'dead') showFlatline();
else if (app.state.run) openRun(); // resume a run after a reload
syncDevice();
setInterval(() => {
  advance();
  syncDevice();
}, 1000);

// The home LCD animates in half-second steps, so ~10 fps is plenty and saves battery.
// Mini-games and netruns get every frame.
const IDLE_FRAME_MS = 100;
const canvas = $('lcd');
let lastFrame = performance.now();
let lastIdleDraw = 0;
const loggedErrors = new Set();

// The next frame is booked before drawing, so one bad frame can't freeze the screen.
(function loop(time) {
  requestAnimationFrame(loop);
  try {
    drawFrame(time);
  } catch (err) {
    if (app.session) return dropSession(err);
    // The home screen retries every frame; log each distinct error once.
    if (!loggedErrors.has(String(err))) {
      loggedErrors.add(String(err));
      console.error('netling: frame failed', err);
    }
  }
})(performance.now());

function drawFrame(time) {
  const dt = Math.min(0.1, (time - lastFrame) / 1000);
  lastFrame = time;
  const { session, state, wardrobe, ownedAccessories } = app;
  const anim = app.anim && time - app.anim.start < ANIM_MS ? { kind: app.anim.kind, t: Math.max(0, time - app.anim.start) / ANIM_MS } : null;
  if (!session && !anim && time - lastIdleDraw < IDLE_FRAME_MS && !(time < app.flashUntil) && !(time < app.surgeUntil)) return;
  if (!session) lastIdleDraw = time;
  if (session) {
    session.update(dt);
    app.session?.draw(canvas.getContext('2d'), PALETTES[state.quirk.palette] ?? PALETTES[0], time);
  } else {
    renderLCD(canvas, state, time, {
      accessory: ownedAccessories.includes(wardrobe.accessory) ? wardrobe.accessory : null,
      accessoryColors: wardrobe.colors?.[wardrobe.accessory] ?? null,
      prop: ownedAccessories.includes(wardrobe.prop) ? wardrobe.prop : null,
      propExtra: wardrobe.prop === 'plush' ? app.plushCache : null,
      flash: time < app.flashUntil,
      surge: time < app.surgeUntil ? (app.surgeUntil - time) / SURGE_MS : 0,
      calm: app.calm,
      anim,
    });
  }
}
