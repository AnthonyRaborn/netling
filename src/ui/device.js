// Small device integrations: the app icon badge and keeping the screen on (see wake.js), kept in
// step with the netling once a second, and the MOTION setting (calm mode).
import { needsAttention } from '../sim.js';
import { badgeSupported, notifyGranted, setBadge } from '../notify.js';
import { wakeLockSupported, createWakeLock } from '../wake.js';
import { KEYS } from '../storage.js';
import { MOTION_MODES } from '../sanitize.js';
import { $, app, store } from './app.js';

const wake = createWakeLock();
let badged = null; // what the badge was last set to; null until the first sync clears any stale one

export function syncDevice() {
  // A waiting tab leaves both to the caretaker tab.
  if (app.inactive) return wake.sync(false);
  // The screen stays on for mini-games and netruns, and always if the player asked for it.
  wake.sync(Boolean(app.session) || app.prefs.awake);
  // The badge follows the blinking attention icon, and only with ALERTS on.
  const on = Boolean(app.prefs.alerts && notifyGranted() && !app.lock && needsAttention(app.state));
  if (on !== badged && badgeSupported()) {
    badged = on;
    setBadge(on);
  }
}

// --- motion ---

const MOTION_LABELS = { auto: 'MOTION: AUTO', reduce: 'MOTION: REDUCED', full: 'MOTION: FULL' };
const systemCalm = matchMedia('(prefers-reduced-motion: reduce)');

// Calm mode stills the screen: no glitch jitter, wobble or reaction bounces on the LCD, and no CSS
// animation (flicker, scanline roll, screen effects). Mini-games keep their motion.
export function applyMotion() {
  const mode = app.prefs.motion;
  app.calm = mode === 'reduce' || (mode === 'auto' && systemCalm.matches);
  document.body.classList.toggle('calm', app.calm);
  document.body.classList.toggle('motion-full', mode === 'full');
}

// --- SYSTEM > SCREEN ---

export function renderScreenPrefs() {
  const mode = app.prefs.motion;
  $('pref-motion').textContent = MOTION_LABELS[mode];
  $('motion-note').textContent =
    mode === 'auto'
      ? `Reduced motion follows your device's setting (now ${systemCalm.matches ? 'on' : 'off'}). Flashes stay slow either way.`
      : mode === 'reduce'
        ? 'Reduced motion is on: the screen keeps still. Mini-games keep their motion.'
        : "Full motion, even if your device asks for less. Flashes stay slow either way.";
  $('screen-prefs').hidden = !wakeLockSupported();
  $('pref-awake').textContent = app.prefs.awake ? 'KEEP SCREEN ON: YES' : 'KEEP SCREEN ON: NO';
  $('pref-awake').setAttribute('aria-pressed', app.prefs.awake);
}

export function initDevice() {
  applyMotion();
  systemCalm.addEventListener('change', () => {
    applyMotion();
    if ($('transfer').open) renderScreenPrefs();
  });
  $('pref-motion').addEventListener('click', () => {
    app.prefs.motion = MOTION_MODES[(MOTION_MODES.indexOf(app.prefs.motion) + 1) % MOTION_MODES.length];
    store.set(KEYS.prefs, app.prefs);
    applyMotion();
    renderScreenPrefs();
  });
  $('pref-awake').addEventListener('click', () => {
    app.prefs.awake = !app.prefs.awake;
    store.set(KEYS.prefs, app.prefs);
    renderScreenPrefs();
    syncDevice();
  });
}
