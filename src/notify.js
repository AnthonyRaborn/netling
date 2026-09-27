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
    if (reg) return reg.showNotification(title, opts);
    new Notification(title, opts);
  } catch {
    // Some browsers only allow notifications from a service worker; nothing else to try.
  }
}

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
