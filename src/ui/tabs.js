// One active tab. Two tabs simulating the same save would overwrite each other. A Web Lock makes
// one tab the caretaker; others wait (and take over when it closes) or can steal the role.
// Browsers without Web Locks get the same behavior from a localStorage lease (lease.js).
// Only the caretaker may write storage (see canWrite in app.js).
import { createLease } from '../lease.js';
import { $, app } from './app.js';

const TAB_LOCK = 'netling-active-tab';
const HEARTBEAT_MS = 2000;
const POLL_MS = 1000;
const SETTLE_MS = 150;

export function becomeInactive(message) {
  app.inactive = true;
  $('tab-guard').hidden = false;
  $('tab-guard-note').textContent = message;
}

function takeOver() {
  app.leaving = true; // this tab's stale state must never be saved
  location.reload();
}

// --- Web Locks ---

// Queue behind whoever holds the role; reload (as the caretaker) once they let go.
function waitForTurn() {
  navigator.locks.request(TAB_LOCK, () => {
    takeOver();
    return new Promise(() => {});
  });
}

function claimWithLock(resolve) {
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
}

// --- lease fallback ---

const lease = createLease(() => localStorage, globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);

function waitForLease() {
  const poll = setInterval(() => {
    if (!lease.free()) return;
    clearInterval(poll);
    takeOver();
  }, POLL_MS);
}

function holdLease() {
  const beat = setInterval(() => {
    if (lease.mine()) return void lease.take();
    clearInterval(beat);
    if (app.leaving) return; // restarting or importing: the reload sorts it out
    becomeInactive('Your netling moved to another tab.');
    waitForLease();
  }, HEARTBEAT_MS);
  addEventListener('pagehide', () => lease.release());
}

function claimWithLease(resolve) {
  if (!lease.free()) {
    resolve(false);
    return waitForLease();
  }
  if (!lease.take()) return resolve(true); // storage refuses writes: there's nothing to overwrite
  // Two tabs opening together can both see the lease free. The last write wins; the other waits.
  setTimeout(() => {
    if (!lease.mine()) {
      resolve(false);
      return waitForLease();
    }
    resolve(true);
    holdLease();
  }, SETTLE_MS);
}

// Resolves true when this tab is the caretaker.
export function claimTab() {
  return new Promise((resolve) => (navigator.locks ? claimWithLock(resolve) : claimWithLease(resolve)));
}

export function initTabs() {
  $('tab-guard-use').addEventListener('click', () => {
    app.leaving = true;
    if (!navigator.locks) {
      lease.clear(); // the old caretaker sees it's gone at its next heartbeat and steps down
      return takeOver();
    }
    navigator.locks.request(TAB_LOCK, { steal: true }, () => {
      location.reload();
      return new Promise(() => {});
    });
  });
}
