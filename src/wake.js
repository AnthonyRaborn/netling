// Keeps the screen on while it is wanted (Screen Wake Lock API). Browsers drop the lock whenever
// the page is hidden, so sync() is meant to be called often: it asks again once the page is back.
// A refusal (battery saver, an unsupported device) waits RETRY_MS before asking again.
export const RETRY_MS = 30_000;

export const wakeLockSupported = (nav = globalThis.navigator) => typeof nav?.wakeLock?.request === 'function';

export function createWakeLock({ nav = globalThis.navigator, visible = () => !document.hidden, clock = () => performance.now() } = {}) {
  let sentinel = null;
  let pending = false;
  let failedAt = -Infinity;
  const failed = () => {
    pending = false;
    failedAt = clock();
  };
  return {
    get held() {
      return sentinel !== null;
    },
    sync(wanted) {
      if (!wakeLockSupported(nav)) return;
      if (wanted && visible()) {
        if (sentinel || pending || clock() - failedAt < RETRY_MS) return;
        pending = true;
        try {
          nav.wakeLock.request('screen').then((s) => {
            pending = false;
            sentinel = s;
            // The browser lets go by itself when the page is hidden.
            s.addEventListener?.('release', () => sentinel === s && (sentinel = null));
          }, failed);
        } catch {
          failed();
        }
      } else if (sentinel && !wanted) {
        const s = sentinel;
        sentinel = null;
        Promise.resolve()
          .then(() => s.release())
          .catch(() => {});
      }
    },
  };
}
