// Network-first service worker: always fresh when online, fully playable offline.
// Bump CACHE on every release, together with VERSION in src/version.js (tests/shell.test.js checks
// they match): a changed sw.js is how an open page learns a release is out and offers a reload, and
// the old cache is dropped. Add every new module or asset to SHELL (the test checks the modules),
// or the app won't install for offline use.
const CACHE = 'netling-v67';
const SHELL = [
  './',
  'index.html',
  'style.css',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'fonts/VT323-latin.woff2',
  'src/main.js',
  'src/sim.js',
  'src/colors.js',
  'src/random.js',
  'src/version.js',
  'src/wearable-colors.js',
  'src/update.js',
  'src/wake.js',
  'src/migrations.js',
  'src/render.js',
  'src/sprites.js',
  'src/audio.js',
  'src/music.js',
  'src/tracks.js',
  'src/notify.js',
  'src/archive.js',
  'src/chatter.js',
  'src/cosmetics.js',
  'src/checkin.js',
  'src/accessories.js',
  'src/transfer.js',
  'src/visitcard.js',
  'src/ending.js',
  'src/netrun/challenges.js',
  'src/netrun/daily.js',
  'src/ui/daily.js',
  'src/ui/ending.js',
  'src/storage.js',
  'src/sanitize.js',
  'src/lease.js',
  'src/qr.js',
  'src/ui/app.js',
  'src/ui/hud.js',
  'src/ui/life.js',
  'src/ui/style.js',
  'src/ui/soundtrack.js',
  'src/ui/rewards.js',
  'src/ui/archive.js',
  'src/ui/corrupt.js',
  'src/ui/onboarding.js',
  'src/ui/play.js',
  'src/ui/system.js',
  'src/ui/tabs.js',
  'src/ui/gamepad.js',
  'src/ui/device.js',
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
self.addEventListener('install', (e) => {
  // 'reload' skips the browser's HTTP cache, so a new release never caches files from the old one.
  const fresh = SHELL.map((url) => new Request(url, { cache: 'reload' }));
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(fresh)).then(() => self.skipWaiting()));
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
  if (url.origin !== location.origin) return;
  // Files are checked with the server ('no-cache'; unchanged ones cost a 304), so a reload after a
  // release gets all of it rather than a mix with copies the browser still thinks are fresh.
  // Navigations keep their own request: the browser already revalidates the page on a reload.
  const request = e.request.mode === 'navigate' ? e.request : new Request(e.request, { cache: 'no-cache' });
  e.respondWith(
    fetch(request)
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

// An open page asks which release this worker caches, to know whether to offer a reload (update.js).
self.addEventListener('message', (e) => {
  if (e.data?.type === 'version?') e.source?.postMessage({ type: 'version', version: CACHE });
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
