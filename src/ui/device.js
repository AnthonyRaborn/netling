// Small device integrations kept in step with the netling once a second: the app icon badge and
// keeping the screen on (see wake.js).
import { needsAttention } from '../sim.js';
import { badgeSupported, notifyGranted, setBadge } from '../notify.js';
import { wakeLockSupported, createWakeLock } from '../wake.js';
import { KEYS } from '../storage.js';
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

export function renderScreenPref() {
  $('screen-prefs').hidden = !wakeLockSupported();
  $('pref-awake').textContent = app.prefs.awake ? 'KEEP SCREEN ON: YES' : 'KEEP SCREEN ON: NO';
  $('pref-awake').setAttribute('aria-pressed', app.prefs.awake);
}

export function initDevice() {
  $('pref-awake').addEventListener('click', () => {
    app.prefs.awake = !app.prefs.awake;
    store.set(KEYS.prefs, app.prefs);
    renderScreenPref();
    syncDevice();
  });
}
