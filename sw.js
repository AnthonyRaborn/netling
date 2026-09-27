// Network-first service worker: always fresh when online, fully playable offline.
const CACHE = 'netling-v30';
const SHELL = [
  './',
  'index.html',
  'style.css',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'src/main.js',
  'src/sim.js',
  'src/render.js',
  'src/sprites.js',
  'src/audio.js',
  'src/notify.js',
  'src/archive.js',
  'src/cosmetics.js',
  'src/accessories.js',
  'src/transfer.js',
  'src/storage.js',
  'src/sanitize.js',
  'src/lease.js',
  'src/qr.js',
  'src/ui/app.js',
  'src/ui/hud.js',
  'src/ui/life.js',
  'src/ui/style.js',
  'src/ui/archive.js',
  'src/ui/onboarding.js',
  'src/ui/play.js',
  'src/ui/system.js',
  'src/ui/tabs.js',
  'src/ui/gamepad.js',
  'src/netrun/regions.js',
  'src/netrun/map.js',
  'src/netrun/run.js',
  'src/netrun/view.js',
  'src/netrun/anomalies.js',
  'src/netrun/codex.js',
  'src/games/common.js',
  'src/games/session.js',
  'src/games/breach.js',
  'src/games/dodge.js',
  'src/games/tune.js',
  'src/games/feast.js',
];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.origin !== location.origin && !FONT_HOSTS.includes(url.hostname)) return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        if (res.ok || res.type === 'opaque') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })),
  );
});

// Tapping a notification brings the pet back to the front.
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const open = clients.find((c) => 'focus' in c);
      return open ? open.focus() : self.clients.openWindow('./');
    }),
  );
});
