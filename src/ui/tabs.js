// One active tab. Two tabs simulating the same save would overwrite each other. A Web Lock makes
// one tab the caretaker; others wait (and take over when it closes) or can steal the role.
// Only the caretaker may write storage (see canWrite in app.js).
import { $, app } from './app.js';

const TAB_LOCK = 'netling-active-tab';

export function becomeInactive(message) {
  app.inactive = true;
  $('tab-guard').hidden = false;
  $('tab-guard-note').textContent = message;
}

// Queue behind whoever holds the role; reload (as the caretaker) once they let go.
function waitForTurn() {
  navigator.locks.request(TAB_LOCK, () => {
    app.leaving = true;
    location.reload();
    return new Promise(() => {});
  });
}

// Resolves true when this tab is the caretaker.
export function claimTab() {
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
        if (err?.name !== 'AbortError') return resolve(true); // Web Locks failed outright: assume a single tab
        becomeInactive('Your netling moved to another tab.');
        waitForTurn();
      });
  });
}

export function initTabs() {
  $('tab-guard-use').addEventListener('click', () => {
    app.leaving = true; // this tab's stale state must never be saved
    navigator.locks.request(TAB_LOCK, { steal: true }, () => {
      location.reload();
      return new Promise(() => {});
    });
  });
}
