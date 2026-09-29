// Offers a reload when a newer release takes over while the page is open. The service worker is
// network-first, so a reload is all an update needs; this only decides when to offer one.
// A new worker takes control at once (skipWaiting), so each change of controller asks the new one
// which release it caches. The first install reports this page's own release and stays quiet.
import { VERSION } from './version.js';

export const RECHECK_MS = 15 * 60 * 1000; // coming back to the page looks for a release at most this often

// Calls onReady(version) when the controlling worker belongs to another release. Returns check(),
// which asks the browser to look for a new sw.js now (throttled to one look per RECHECK_MS).
export function watchForUpdates(onReady, { sw = globalThis.navigator?.serviceWorker, clock = () => performance.now() } = {}) {
  if (!sw) return () => {};
  sw.addEventListener('message', (e) => {
    const data = e.data;
    if (data?.type !== 'version' || typeof data.version !== 'string') return;
    if (data.version !== VERSION) onReady(data.version);
  });
  sw.addEventListener('controllerchange', () => sw.controller?.postMessage({ type: 'version?' }));
  let lastCheck = -Infinity;
  return function check() {
    const t = clock();
    if (t - lastCheck < RECHECK_MS) return;
    lastCheck = t;
    sw.getRegistration()
      .then((reg) => reg?.update())
      .catch(() => {}); // offline, or the worker is being replaced: the next check tries again
  };
}
