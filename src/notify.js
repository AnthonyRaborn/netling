// Local notifications. These fire while the app is open or backgrounded; a fully closed app
// would need a push server, which this static build doesn't have.

export const notifySupported = () => 'Notification' in window;
export const notifyGranted = () => notifySupported() && Notification.permission === 'granted';

export async function requestNotify() {
  if (!notifySupported()) return false;
  if (Notification.permission === 'default') await Notification.requestPermission();
  return Notification.permission === 'granted';
}

export async function notify(title, body) {
  if (!notifyGranted()) return;
  const opts = { body, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: 'netling', renotify: true };
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) return await reg.showNotification(title, opts); // awaited so a refusal lands in the catch
    new Notification(title, opts);
  } catch {
    // Some browsers only allow notifications from a service worker; nothing else to try.
  }
}

// The installed app's icon badge: a plain dot while the netling needs something. It only changes
// while the page runs, so a closed app keeps the last badge it had. Some platforms (iOS) show it
// only with notification permission; everywhere, a refusal is quiet.
export const badgeSupported = (nav = globalThis.navigator) => typeof nav?.setAppBadge === 'function';

export function setBadge(on, nav = globalThis.navigator) {
  if (!badgeSupported(nav)) return;
  try {
    Promise.resolve(on ? nav.setAppBadge() : nav.clearAppBadge?.()).catch(() => {});
  } catch {
    // Not installed, or not allowed here.
  }
}

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
