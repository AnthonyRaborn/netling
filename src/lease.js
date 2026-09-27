// The one-active-tab rule for browsers without Web Locks: a lease in localStorage that the caretaker
// tab refreshes. Other tabs may take it once it's released or has gone stale. No DOM.
import { KEYS } from './storage.js';

// Long enough to outlast background-tab timer throttling (as slow as once a minute), short enough
// that a crashed tab doesn't block the next one for long. A normal close releases it at once.
export const LEASE_MS = 120_000;

export function createLease(getStorage, id, { now = Date.now, leaseMs = LEASE_MS } = {}) {
  function read() {
    try {
      const v = JSON.parse(getStorage().getItem(KEYS.tabLease));
      return v && typeof v.id === 'string' && Number.isFinite(v.at) ? v : null;
    } catch {
      return null;
    }
  }
  const remove = () => {
    try {
      getStorage().removeItem(KEYS.tabLease);
    } catch {}
  };

  return {
    // Nobody holds it, it's ours, or its holder stopped refreshing (or wrote a clock far ahead).
    free() {
      const v = read();
      const t = now();
      return !v || v.id === id || t - v.at > leaseMs || v.at - t > leaseMs;
    },
    mine: () => read()?.id === id,
    // Writes (or refreshes) the lease. false when storage refuses.
    take() {
      try {
        getStorage().setItem(KEYS.tabLease, JSON.stringify({ id, at: now() }));
        return true;
      } catch {
        return false;
      }
    },
    release() {
      if (read()?.id === id) remove();
    },
    // Taking over on request: clear whoever holds it.
    clear: remove,
  };
}
