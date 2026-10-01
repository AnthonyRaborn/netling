// Browser smoke test: drives the real app in headless Chromium through Playwright.
// Usage: npm run smoke  (needs Playwright: `npm install --no-save playwright && npx playwright install chromium`)
// Each scenario gets a fresh browser profile. Unexpected page errors and console errors fail it.
import { execSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { encodeSave } from '../src/transfer.js';
import { createScript, isSleepHour, tick } from '../src/sim.js';
import { FRAGMENTS } from '../src/netrun/codex.js';
import { moveTo, runOptions, startRun } from '../src/netrun/run.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    const globalRoot = execSync('npm root -g').toString().trim(); // a global install works too
    return import(pathToFileURL(join(globalRoot, 'playwright', 'index.mjs')));
  }
}
const { chromium } = await loadPlaywright();

// --- a static server for the app ---

// A scenario can serve a changed sw.js, as a new release would.
let swPatch = null;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^[/\\]+/, '') || 'index.html';
  if (path.startsWith('..')) return res.writeHead(403).end();
  try {
    let body = await readFile(join(root, path));
    if (path === 'sw.js' && swPatch) body = swPatch(body.toString());
    res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const PORT = server.address().port;
const BASE = `http://localhost:${PORT}/index.html`;
// Playwright's offline mode doesn't reach service worker fetches, so offline means stopping the server.
const serverDown = () => new Promise((resolve) => (server.closeAllConnections(), server.close(resolve)));
const serverUp = () => new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
const browser = await chromium.launch();

// --- harness ---

const results = [];
async function scenario(name, fn, { allow = [], contextInit } = {}) {
  const ctx = await browser.newContext({ acceptDownloads: true });
    if (contextInit) await ctx.addInitScript(contextInit);
  const errors = [];
  const expected = (text) => allow.some((re) => re.test(text));
  const open = async (url = BASE, init) => {
    const page = await ctx.newPage();
    if (init) await page.addInitScript(init);
    page.on('pageerror', (e) => expected(e.message) || errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
      const text = m.text();
      if (m.type() === 'error' && !/favicon|net::ERR_FAILED|ERR_INTERNET_DISCONNECTED/.test(text) && !expected(text)) errors.push(`console: ${text}`);
    });
    await page.goto(url);
    await page.waitForTimeout(600);
    return page;
  };
  let failure = null;
  try {
    await fn({ open, ctx, errors });
  } catch (e) {
    failure = e.message.split('\n')[0];
  }
  if (!failure && errors.length) failure = errors.join(' | ');
  results.push([name, failure]);
  console.log(`${failure ? 'FAIL' : 'ok  '} ${name}${failure ? `\n       ${failure}` : ''}`);
  await ctx.close();
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};
const visible = (page, sel) => page.locator(sel).isVisible();
const saved = (page, key = 'netling.save') => page.evaluate((k) => JSON.parse(localStorage.getItem(k)), key);
// The clock loop saves every few seconds (SAVE_EVERY_MS in ui/life.js); wait for one of this tab's saves.
async function loopRunning(page) {
  return page.evaluate(async () => {
    let saves = 0;
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k === 'netling.save') saves++;
      return set.call(this, k, v);
    };
    for (let i = 0; i < 70 && !saves; i++) await new Promise((r) => setTimeout(r, 100));
    Storage.prototype.setItem = set;
    return saves > 0;
  });
}
// The idle LCD alternates frames about once a second; sample a few.
async function animating(page) {
  const frames = new Set();
  for (let i = 0; i < 6; i++) {
    frames.add(await page.evaluate(() => document.getElementById('lcd').toDataURL()));
    await page.waitForTimeout(300);
  }
  return frames.size > 1;
}

// A settled netling (past onboarding), awake at this hour wherever the test runs. It is simulated up
// to now here, with no random events, so the page has no minutes to catch up on: a random corp trace
// on load would otherwise block hibernation and similar actions now and then.
function awakeNetling(overrides = {}) {
  const now = Date.now();
  const save = createScript({ now: now - 10 * 60_000 });
  const hour = new Date().getHours();
  for (let offset = -2; offset <= 12; offset++) {
    if (!isSleepHour(hour, offset) && !isSleepHour((hour + 1) % 24, offset)) {
      save.quirk.sleepOffset = offset;
      break;
    }
  }
  tick(save, now, () => 0.999);
  return Object.assign(save, overrides);
}

// Storage writes, once per tab (sessionStorage survives the reloads a scenario triggers).
function seed(extra = {}) {
  // Today's check-in is already claimed, so it stays out of scenarios about something else (the check-in one clears it).
  const data = { 'netling.save': awakeNetling(), 'netling.onboarding': 'done', 'netling.helpSeen': true, 'netling.checkin': { day: 1, claimedAt: Date.now(), claims: 1 }, ...extra };
  const raw = Object.fromEntries(Object.entries(data).map(([k, v]) => [k, JSON.stringify(v)]));
  return seedRaw(raw);
}
function seedRaw(raw) {
  return `(() => { if (sessionStorage.getItem('seeded')) return; sessionStorage.setItem('seeded', '1');
    const d = ${JSON.stringify(raw)}; for (const [k, v] of Object.entries(d)) localStorage.setItem(k, v); })()`;
}
// Records this tab's storage writes in window.__writes.
const SPY_WRITES = `(() => { window.__writes = []; const set = Storage.prototype.setItem, rm = Storage.prototype.removeItem;
  Storage.prototype.setItem = function (k, v) { window.__writes.push(k); return set.call(this, k, v); };
  Storage.prototype.removeItem = function (k) { window.__writes.push('-' + k); return rm.call(this, k); }; })()`;
// Makes the next canvas text draw throw, as a bug in a game or netrun would.
const BREAK_NEXT_FRAME = () => {
  const fillText = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    CanvasRenderingContext2D.prototype.fillText = fillText;
    throw new Error('injected frame error');
  };
};

// --- scenarios ---

await scenario('fresh launch: intro -> manual -> nudge -> tutorial run', async ({ open }) => {
  const page = await open();
  assert(await visible(page, '#intro'), 'intro not shown');
  await page.click('#intro');
  await page.click('#intro');
  await page.waitForTimeout(1200);
  assert(await page.locator('#help').evaluate((d) => d.open), 'field manual not opened');
  await page.click('#close-help');
  await page.waitForTimeout(300);
  assert(await visible(page, '#speech'), 'nudge not shown');
  await page.click('#btn-netrun');
  await page.waitForTimeout(300);
  assert(await visible(page, '#pad'), 'tutorial run pad not shown');
  assert((await saved(page))?.run?.region === 'tutorial', 'tutorial run not saved');
});

await scenario('intro on a small phone: the newest line and the prompt stay on the screen', async ({ open }) => {
  const page = await open();
  // Narrowing after the text is in also checks that a resize (a phone turning) keeps the end in view.
  for (const width of [390, 360, 320]) {
    await page.setViewportSize({ width, height: 640 });
    if (width === 390) await page.click('#intro'); // skip the typing
    await page.waitForTimeout(100);
    const fits = await page.evaluate(() => {
      const screen = document.querySelector('.screen').getBoundingClientRect();
      const inside = (el) => {
        const r = el.getBoundingClientRect();
        return r.top >= screen.top && r.bottom <= screen.bottom;
      };
      const prompt = document.getElementById('intro-next');
      return !prompt.hidden && inside(prompt) && inside(document.getElementById('intro-text').lastElementChild);
    });
    assert(fits, `intro cut off at ${width}px`);
  }
});

await scenario('home: care actions, games, archive, system dialog', async ({ open }) => {
  const page = await open(BASE, seed());
  assert(!(await visible(page, '#intro')), 'intro shown for settled save');
  for (const a of ['corp', 'cool', 'purge']) await page.click(`#controls [data-act="${a}"]`);
  await page.click('#btn-play');
  assert(await visible(page, '#picker'), 'game picker not shown');
  await page.click('[data-game="breach"]');
  await page.waitForTimeout(300);
  await page.click('#pad-quit');
  await page.click('#pad-confirm');
  await page.waitForTimeout(2500);
  const progress = await saved(page, 'netling.progress');
  assert(progress?.acts?.corp === 1, `care action not counted: ${JSON.stringify(progress)}`);
  assert(progress?.gamesPlayed === 1, 'game not counted');
  await page.click('#open-archive');
  for (const t of ['dex', 'codex', 'wardrobe', 'lineage']) await page.click(`#tab-btn-${t}`);
  await page.click('#close-archive');
  await page.click('#open-archive');
  await page.click('#open-transfer');
  assert(await page.locator('#transfer').evaluate((d) => d.open), 'system dialog not open');
  assert(!(await visible(page, '#old-save')), 'set-aside save section shown with nothing set aside');
  await page.fill('#volume', '40');
  await page.click('#close-transfer');
  assert((await saved(page, 'netling.prefs')).volume === 0.4, 'volume not saved');
});

await scenario('transfer out locks; reload keeps lock; load code unlocks', async ({ open }) => {
  const page = await open(BASE, seed());
  await page.click('#open-archive');
  await page.click('#open-transfer');
  await page.click('#transfer-out');
  await page.click('#transfer-out');
  await page.waitForTimeout(500);
  assert(await visible(page, '#lock'), 'lock screen not shown');
  assert((await page.inputValue('#lock-code')).startsWith('NL1.'), 'no code');
  await page.reload();
  await page.waitForTimeout(600);
  assert(await visible(page, '#lock'), 'lock lost on reload');
  await page.click('#lock-reload');
  await page.waitForTimeout(500);
  await page.click('#import-preview button.danger-btn');
  await page.waitForLoadState('load');
  await page.waitForTimeout(800);
  assert(!(await visible(page, '#lock')), 'still locked after load');
  assert((await page.evaluate(() => localStorage.getItem('netling.lock'))) === null, 'lock key remains');
});

await scenario('malformed #import= link does not break startup', async ({ open }) => {
  const page = await open(`${BASE}#import=%E0%A4%A`, seed());
  await page.waitForTimeout(1500);
  assert(await loopRunning(page), 'game loop is not running');
});

await scenario('hostile import code (wrong types everywhere) is repaired', async ({ open }) => {
  const save = createScript({ now: Date.now() - 10 * 60_000 });
  Object.assign(save, { stage: 'baby', quirk: 'x', trait: 'nope', inventory: ['bogus', 42], stats: null, log: 'x', junk: { a: 1 } });
  const code = await encodeSave({
    save,
    lineage: [{ form: 'nope', trait: 'nope', keepsake: 'nope' }, 7],
    dex: { length: 3 },
    codex: {},
    wardrobe: { shell: 42, colors: 'x', label: { a: 1 } },
    progress: 'lots',
    unlocked: 'all',
    accessories: { 0: 'partyhat' },
    prefs: { volume: 'loud', sound: 'yes' },
    onboarding: 42,
  });
  const page = await open(`${BASE}#import=${code}`, seed());
  await page.waitForTimeout(500);
  const btn = page.locator('#import-preview button.danger-btn');
  assert(await btn.count(), 'hostile code was rejected outright instead of repaired');
  await btn.click();
  await page.waitForLoadState('load');
  await page.waitForTimeout(1500);
  const s = await saved(page);
  assert(await loopRunning(page), 'game loop is not running after import');
  assert(typeof s.quirk === 'object' && Array.isArray(s.log) && s.stats.charge >= 0, 'save not repaired');
  assert(!('junk' in s), 'unknown fields from a code were kept');
  assert((await page.evaluate(() => localStorage.getItem('netling.codex'))) === '[]', 'codex not cleaned');
  await page.click('#open-archive');
  for (const t of ['dex', 'codex', 'wardrobe', 'lineage']) await page.click(`#tab-btn-${t}`);
});

await scenario('corrupted local storage does not break startup', async ({ open }) => {
  const page = await open(
    BASE,
    seedRaw({
      'netling.save': JSON.stringify({ saveVersion: 1, stage: 'teen', form: 'kernel', quirk: null, stats: 5 }),
      'netling.lineage': '{"a":1}',
      'netling.dex': '"kernel"',
      'netling.codex': '{}',
      'netling.wardrobe': '[1,2]',
      'netling.progress': '"x"',
      'netling.unlocked': '{}',
      'netling.accessories': 'null',
      'netling.prefs': '[]',
      'netling.onboarding': '"done"',
      'netling.lock': '{"code":5}',
    }),
  );
  await page.waitForTimeout(1500);
  assert(await loopRunning(page), 'game loop is not running');
  await page.click('#open-archive');
  for (const t of ['dex', 'codex', 'wardrobe', 'lineage']) await page.click(`#tab-btn-${t}`);
});

// The one-tab rule, with Web Locks and with the localStorage lease used where they're missing.
for (const [label, contextInit] of [
  ['Web Locks', undefined],
  ['lease fallback', `Object.defineProperty(Navigator.prototype, 'locks', { get: () => undefined, configurable: true });`],
]) {
  await scenario(
    `waiting tab never writes storage; steal hands over (${label})`,
    async ({ open }) => {
      const a = await open(BASE, seed());
      if (contextInit) assert(await a.evaluate(() => navigator.locks === undefined), 'Web Locks still present');
      const b = await open(BASE, SPY_WRITES);
      await b.waitForTimeout(2000);
      assert(await visible(b, '#tab-guard'), 'second tab not guarded');
      const writes = await b.evaluate(() => window.__writes);
      assert(writes.length === 0, `waiting tab wrote: ${[...new Set(writes)].join(',')}`);
      await b.click('#tab-guard-use');
      await b.waitForLoadState('load');
      await b.waitForTimeout(3000); // the lease holder notices at its next 2s heartbeat
      assert(!(await visible(b, '#tab-guard')), 'new tab did not take over');
      assert(await visible(a, '#tab-guard'), 'first tab did not step down');
      await a.evaluate(() => {
        window.__w = 0;
        const set = Storage.prototype.setItem;
        Storage.prototype.setItem = function (k, v) {
          window.__w++;
          return set.call(this, k, v);
        };
      });
      await a.waitForTimeout(2500);
      assert((await a.evaluate(() => window.__w)) === 0, 'stepped-down tab keeps writing');
      assert(await loopRunning(b), 'new caretaker is not saving');
    },
    { contextInit },
  );
}

await scenario('full storage: warns, and a failed import changes nothing', async ({ open }) => {
  const page = await open(BASE, seed());
  const other = createScript({ now: Date.now() });
  other.generation = 9;
  const code = await encodeSave({ save: other, dex: ['bitling'], codex: [] });
  await page.evaluate(() => {
    const set = Storage.prototype.setItem;
    // The save itself fits; everything after it fails: a half-finished import.
    Storage.prototype.setItem = function (k, v) {
      if (k !== 'netling.save') throw new DOMException('full', 'QuotaExceededError');
      return set.call(this, k, v);
    };
  });
  await page.click('#open-archive');
  await page.click('#open-transfer');
  await page.fill('#import-code', code);
  await page.click('#check-code');
  await page.waitForTimeout(400);
  await page.click('#import-preview button.danger-btn');
  await page.waitForTimeout(800);
  assert((await saved(page)).generation !== 9, 'a failed import left a half-written save');
  const shown = await page.evaluate(() => document.getElementById('import-preview').textContent + document.getElementById('status').textContent);
  assert(/storage|space|save/i.test(shown), `no warning shown: ${shown}`);
});

await scenario('offline: service worker serves every module', async ({ open }) => {
  const page = await open(BASE, seed());
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(1500);
  await serverDown();
  try {
    const probe = await page.evaluate(() => fetch(`/not-cached-${Math.random()}`, { cache: 'no-store' }).then(() => 'online', () => 'offline'));
    assert(probe === 'offline', 'the server is still reachable, so this proves nothing');
    await page.reload();
    await page.waitForTimeout(1500);
    assert(await loopRunning(page), 'app did not boot offline');
    assert(await animating(page), 'app did not draw offline');
  } finally {
    await serverUp();
  }
}, { allow: [/Failed to load resource/] });

await scenario('a new release while open offers a reload, which waits for a running game', async ({ open }) => {
  const page = await open(BASE, seed());
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => navigator.serviceWorker.controller);
  await page.waitForTimeout(500);
  assert(!(await visible(page, '#update-bar')), 'the first install offered an update');
  swPatch = (src) => src.replace(/const CACHE = '[^']+'/, "const CACHE = 'netling-v999'");
  try {
    await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()));
    await page.waitForSelector('#update-bar', { state: 'visible', timeout: 10000 });
    assert(/NEW VERSION/.test(await page.textContent('#update-bar')), 'bar has no message');

    await page.click('#btn-play');
    await page.click('[data-game="breach"]');
    assert(!(await visible(page, '#update-bar')), 'the bar covers the game pad');
    await page.evaluate(() => {
      window.__stillHere = true;
      document.getElementById('update-reload').click();
    });
    await page.waitForTimeout(500);
    assert(await page.evaluate(() => window.__stillHere), 'reloaded in the middle of a game');
    assert(/finish the game/.test(await page.textContent('#status')), 'refusal not explained');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(2500);
    assert(await visible(page, '#update-bar'), 'the bar did not come back after the game');

    const before = (await saved(page)).ageMin;
    await Promise.all([page.waitForEvent('load'), page.click('#update-reload')]);
    await page.waitForTimeout(800);
    assert(!(await page.evaluate(() => window.__stillHere)), 'RELOAD did not reload');
    assert(!(await visible(page, '#update-bar')), 'the reloaded page still offers the update');
    assert((await saved(page)).ageMin >= before, 'the netling was not kept across the reload');
    assert(await loopRunning(page), 'app did not boot after the update');

    swPatch = (src) => src.replace(/const CACHE = '[^']+'/, "const CACHE = 'netling-v1000'");
    await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()));
    await page.waitForSelector('#update-bar', { state: 'visible', timeout: 10000 });
    await page.click('#update-later');
    assert(!(await visible(page, '#update-bar')), 'LATER did not dismiss the bar');
  } finally {
    swPatch = null;
  }
});

// Records wake lock and badge calls in window.__device; headless Chromium has neither for real, and
// refuses notifications even when granted, so permission is faked too.
const FAKE_DEVICE = `(() => {
  window.__device = [];
  const log = (e) => window.__device.push(e);
  Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request: async () => {
    log('lock');
    const s = new EventTarget();
    s.release = async () => { log('unlock'); s.dispatchEvent(new Event('release')); };
    return s;
  } } });
  navigator.setAppBadge = async () => log('badge');
  navigator.clearAppBadge = async () => log('clear');
  Object.defineProperty(Notification, 'permission', { configurable: true, get: () => 'granted' });
})()`;

await scenario('the screen stays on for games and when asked; the badge follows its needs with ALERTS on', async ({ open }) => {
  const needy = awakeNetling({ stats: { charge: 70, sync: 10, integrity: 100, heat: 20 } });
  const page = await open(BASE, seed({ 'netling.save': needy, 'netling.prefs': { sound: false, alerts: true, volume: 0.8 } }) + ';' + FAKE_DEVICE);
  const events = () => page.evaluate(() => window.__device.slice());
  const waitFor = async (name, count = 1) => {
    for (let i = 0; i < 30; i++) {
      if ((await events()).filter((e) => e === name).length >= count) return;
      await page.waitForTimeout(100);
    }
    throw new Error(`no ${name} (x${count}): ${(await events()).join(',')}`);
  };
  await waitFor('badge');
  await page.waitForTimeout(1200);
  assert(!(await events()).includes('lock'), 'the screen was kept on at home without being asked');

  await page.click('#btn-play');
  await page.click('[data-game="dodge"]');
  await waitFor('lock');
  await page.keyboard.press('Escape');
  await waitFor('unlock');

  await page.waitForTimeout(2500); // the result card
  await page.click('#open-archive');
  await page.click('#open-transfer');
  assert(await visible(page, '#screen-prefs'), 'no screen setting');
  await page.click('#pref-awake');
  await waitFor('lock', 2);
  assert((await saved(page, 'netling.prefs')).awake === true, 'setting not saved');
  assert(/YES/.test(await page.textContent('#pref-awake')), 'button does not show the setting');
  await page.click('#pref-awake');
  await waitFor('unlock', 2);
  await page.click('#close-transfer');

  await page.click('#pref-alerts'); // ALERTS off: the badge goes
  await waitFor('clear');
  assert((await events()).filter((e) => e === 'badge').length === 1, `badge set more than once: ${(await events()).join(',')}`);
});

await scenario('screen readers get values, a summary, new needs and only new log lines; MOTION overrides the system', async ({ open }) => {
  const low = awakeNetling({ stats: { charge: 70, sync: 10, integrity: 100, heat: 20 } });
  const page = await open(BASE, seed({ 'netling.save': low }));
  const attr = (sel, name) => page.getAttribute(sel, name);
  assert((await attr('#bar-charge', 'aria-valuenow')) === '70', `charge meter says ${await attr('#bar-charge', 'aria-valuenow')}`);
  assert(/^\d+, low$/.test(await attr('#bar-sync', 'aria-valuetext')), `sync meter says ${await attr('#bar-sync', 'aria-valuetext')}`);
  assert(await page.locator('#bar-sync').evaluate((el) => el.closest('.stat').classList.contains('danger')), 'low sync has no danger mark');
  assert(!(await page.locator('#bar-charge').evaluate((el) => el.closest('.stat').classList.contains('danger'))), 'charge marked in danger');
  const mark = await page.locator('#bar-sync').evaluate((el) => getComputedStyle(el.closest('.stat').querySelector('label'), '::after').content);
  assert(/!/.test(mark), `no ! beside the label: ${mark}`);
  assert(/Bitling, awake.*Sync is fading/.test(await attr('#lcd', 'aria-label')), `summary: ${await attr('#lcd', 'aria-label')}`);
  assert(/Sync is fading/.test(await page.textContent('#sr-announce')), 'the need was not announced');

  // A new log line is added to the list; the lines already there stay put.
  const count = await page.locator('#log li').count();
  await page.evaluate(() => (window.__firstLine = document.querySelector('#log li')));
  await page.click('[data-act="scav"]');
  await page.waitForTimeout(300);
  assert((await page.locator('#log li').count()) > count, 'no new log line');
  assert(await page.evaluate(() => window.__firstLine.isConnected), 'the log was rebuilt instead of added to');

  // MOTION: AUTO follows the system; REDUCED and FULL override it.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(100);
  const calm = () => page.evaluate(() => document.body.classList.contains('calm'));
  assert(await calm(), 'AUTO ignored the system asking for reduced motion');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForTimeout(100);
  assert(!(await calm()), 'AUTO stayed calm');
  await page.click('#open-archive');
  await page.click('#open-transfer');
  assert(/AUTO/.test(await page.textContent('#pref-motion')), 'motion does not start on AUTO');
  await page.click('#pref-motion');
  assert(/REDUCED/.test(await page.textContent('#pref-motion')) && (await calm()), 'REDUCED did not calm the screen');
  assert((await saved(page, 'netling.prefs')).motion === 'reduce', 'motion setting not saved');
  const still = await page.evaluate(() => getComputedStyle(document.querySelector('.crt-glare')).animationName);
  assert(still === 'none', `animations still run: ${still}`);
  await page.click('#pref-motion');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(100);
  assert(/FULL/.test(await page.textContent('#pref-motion')) && !(await calm()), 'FULL did not override the system');
  const moving = await page.evaluate(() => getComputedStyle(document.querySelector('.crt-glare')).animationName);
  assert(moving !== 'none', 'FULL still stops animations when the system asks for less');
  await page.click('#pref-motion');
  assert(/AUTO/.test(await page.textContent('#pref-motion')), 'motion does not cycle back to AUTO');
});

await scenario('the font is served from this site: no third-party requests', async ({ open, ctx }) => {
  const foreign = [];
  ctx.on('request', (r) => {
    if (!r.url().startsWith(`http://localhost:${PORT}/`) && !r.url().startsWith('data:')) foreign.push(r.url());
  });
  const page = await open();
  await page.waitForTimeout(500);
  const loaded = await page.evaluate(async () => {
    await document.fonts.load("16px 'VT323'");
    return document.fonts.check("16px 'VT323'") && [...document.fonts].some((f) => f.family.includes('VT323') && f.status === 'loaded');
  });
  assert(loaded, 'VT323 did not load from the local file');
  assert(foreign.length === 0, `third-party requests: ${foreign.join(', ')}`);
});

await scenario('unreadable save is set aside, then downloadable and deletable', async ({ open }) => {
  const page = await open(BASE, seedRaw({ 'netling.save': '{"saveVersion":1,"stage":"zombie"}', 'netling.onboarding': '"done"' }));
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => ({ kept: localStorage.getItem('netling.corruptSave'), stage: JSON.parse(localStorage.getItem('netling.save')).stage, status: document.getElementById('status').textContent }));
  assert(r.kept?.includes('zombie'), 'old save not kept');
  assert(r.stage === 'script' || r.stage === 'baby', `unexpected stage ${r.stage}`);
  assert(/could not be read/.test(r.status), `no notice: ${r.status}`);
  await page.click('#open-archive');
  await page.click('#open-transfer');
  assert(await visible(page, '#old-save'), 'set-aside save not shown in SYSTEM');
  assert(/set-aside save/.test(await page.textContent('#restart-note')), 'restart note does not mention it');
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#old-save-download')]);
  assert(/^netling-set-aside-save-\d{4}-\d\d-\d\d\.json$/.test(download.suggestedFilename()), download.suggestedFilename());
  const body = await readFile(await download.path(), 'utf8');
  assert(body === '{"saveVersion":1,"stage":"zombie"}', `downloaded ${body.slice(0, 80)}`);
  await page.click('#old-save-delete');
  await page.click('#old-save-delete');
  assert(!(await visible(page, '#old-save')), 'still shown after delete');
  assert((await page.evaluate(() => localStorage.getItem('netling.corruptSave'))) === null, 'not deleted');
});

await scenario('a save from a newer version is set aside with its own notice', async ({ open }) => {
  const newer = '{"saveVersion":99,"stage":"adult","form":"chrome"}';
  const page = await open(BASE, seedRaw({ 'netling.save': newer, 'netling.onboarding': '"done"' }));
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => ({ kept: localStorage.getItem('netling.corruptSave'), status: document.getElementById('status').textContent }));
  assert(JSON.parse(r.kept ?? 'null')?.raw === newer, 'the newer save was not kept');
  assert(/newer version/.test(r.status), `no newer-version notice: ${r.status}`);
});

await scenario('storage blocked entirely: game still runs and warns', async ({ open }) => {
  const page = await open(BASE, `Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('blocked', 'SecurityError'); } });`);
  await page.waitForTimeout(1500);
  assert(await visible(page, '#intro'), 'intro not shown');
  const status = await page.textContent('#status');
  assert(/not being saved/.test(status), `no warning: ${status}`);
});

await scenario(
  'a crashing mini-game is closed and the screen keeps drawing',
  async ({ open }) => {
    const page = await open(BASE, seed());
    await page.click('#btn-play');
    await page.click('[data-game="dodge"]');
    await page.waitForTimeout(300);
    await page.evaluate(BREAK_NEXT_FRAME);
    await page.waitForTimeout(500);
    assert(await visible(page, '#controls'), 'controls not restored');
    assert(/game crashed/.test(await page.textContent('#status')), 'no notice');
    assert(await animating(page), 'the home screen stopped animating');
  },
  { allow: [/netling: closing a session/, /injected frame error/] },
);

await scenario(
  'a crashing netrun is aborted instead of crashing again on resume',
  async ({ open }) => {
    const page = await open(BASE, seed());
    await page.click('#btn-netrun');
    await page.locator('#region-list button:not([disabled])').first().click();
    await page.waitForTimeout(300);
    assert((await saved(page)).run, 'run did not start');
    await page.evaluate(BREAK_NEXT_FRAME);
    await page.waitForTimeout(500);
    assert(await visible(page, '#controls'), 'controls not restored');
    assert((await saved(page)).run === null, 'broken run kept');
    assert(/run crashed/.test(await page.textContent('#status')), 'no notice');
    assert((await saved(page, 'netling.progress')).runs?.aborted === 1, 'crashed run not recorded as aborted');
  },
  { allow: [/netling: closing a session/, /injected frame error/] },
);

await scenario(
  'a crash during the tutorial run still finishes onboarding',
  async ({ open }) => {
    const page = await open();
    await page.click('#intro');
    await page.click('#intro');
    await page.waitForTimeout(1200);
    await page.click('#close-help');
    await page.waitForTimeout(300);
    await page.click('#btn-netrun');
    await page.waitForTimeout(300);
    await page.evaluate(BREAK_NEXT_FRAME);
    await page.waitForTimeout(500);
    assert((await saved(page, 'netling.onboarding')) === 'done', 'onboarding stuck');
    assert((await saved(page, 'netling.accessories'))?.includes('partyhat'), 'party hat not granted');
  },
  { allow: [/netling: closing a session/, /injected frame error/] },
);

await scenario('a stale confirm timer cannot cancel a newer confirm', async ({ open }) => {
  const page = await open(BASE, seed({ 'netling.save': awakeNetling({ inventory: ['coolant', 'coolant', 'coolant'] }) }));
  const slot = page.locator('#inv-slots .inv-slot.filled').first();
  await slot.click();
  await page.click('#inv-discard'); // arm at t=0; its timer would fire at 3s
  await page.waitForTimeout(400);
  await page.click('#inv-discard'); // discard
  await slot.click();
  await page.waitForTimeout(400);
  await page.click('#inv-discard'); // arm again at ~1s
  await page.waitForTimeout(2600); // past the first timer (3s), inside the second (~4s)
  await page.click('#inv-discard');
  const inv = (await saved(page)).inventory;
  assert(inv.length === 1, `expected 2 discards, inventory is ${JSON.stringify(inv)}`);
});

await scenario('a DISCARD confirm does not carry over to another item', async ({ open }) => {
  const page = await open(BASE, seed({ 'netling.save': awakeNetling({ inventory: ['coolant', 'antivirus'] }) }));
  const slots = page.locator('#inv-slots .inv-slot.filled');
  await slots.nth(0).click();
  await page.click('#inv-discard'); // armed for the coolant
  await slots.nth(1).click();
  await page.click('#inv-discard'); // only arms for the antivirus
  await page.waitForTimeout(200);
  assert((await saved(page)).inventory.length === 2, 'discarded without confirming the new selection');
  await page.click('#inv-discard');
  await page.waitForTimeout(200);
  const inv = (await saved(page)).inventory;
  assert(JSON.stringify(inv) === '["coolant"]', `wrong item discarded: ${JSON.stringify(inv)}`);
});

await scenario('a Segfault takes a second press, then adds two faults', async ({ open }) => {
  const page = await open(BASE, seed({ 'netling.save': awakeNetling({ inventory: ['segfault'] }) }));
  await page.locator('#inv-slots .inv-slot.filled').nth(0).click();
  await page.click('#inv-use');
  await page.waitForTimeout(200);
  assert(/FAULTS/.test(await page.textContent('#inv-use')), 'no confirm on the button');
  assert((await saved(page)).careMistakes === 0, 'used on the first press');
  await page.click('#inv-use');
  await page.waitForTimeout(200);
  const s = await saved(page);
  assert(s.careMistakes === 2 && s.inventory.length === 0, `after confirming: ${s.careMistakes} faults, ${JSON.stringify(s.inventory)}`);
});

await scenario('quitting on touch needs a confirm somewhere else; Esc still quits at once', async ({ open }) => {
  const page = await open(BASE, seed());
  const played = async () => (await saved(page, 'netling.progress'))?.gamesPlayed ?? 0;
  await page.click('#btn-play');
  await page.click('[data-game="dodge"]');
  await page.click('#pad-quit');
  await page.click('#pad-quit'); // the same spot again only cancels
  await page.waitForTimeout(300);
  assert(await visible(page, '#pad'), 'a second tap in the same place quit the game');
  assert(!(await visible(page, '#pad-confirm')), 'the confirm stayed up after KEEP PLAYING');
  await page.click('#pad-quit');
  assert((await page.textContent('#pad-quit')) === 'KEEP PLAYING', 'the quit button did not change');
  const confirm = await page.locator('#pad-confirm').boundingBox();
  const quit = await page.locator('#pad-quit').boundingBox();
  assert(confirm.y + confirm.height < quit.y, 'the confirm is not away from the pad');
  await page.waitForTimeout(3300);
  assert(!(await visible(page, '#pad-confirm')), 'the confirm never timed out');
  await page.click('#pad-quit');
  await page.click('#pad-confirm');
  await page.waitForTimeout(2600);
  assert(!(await visible(page, '#pad')), 'CONFIRM QUIT did not end the game');
  assert((await played()) === 1, 'the forfeited game was not counted');

  await page.click('#btn-play');
  await page.click('[data-game="tune"]');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(2600);
  assert(!(await visible(page, '#pad')), 'Esc no longer quits in one press');
  assert(!(await visible(page, '#pad-confirm')), 'Esc left a confirm on screen');
});

await scenario('the touch quit confirm pauses the game; a game button resumes it without playing', async ({ open }) => {
  const page = await open(BASE, seed());
  const frame = () => page.evaluate(() => document.getElementById('lcd').toDataURL());
  await page.click('#btn-play');
  await page.click('[data-game="dodge"]');
  await page.click('#pad [data-key="a"]'); // past the intro card
  await page.waitForTimeout(300);
  const running = await frame();
  await page.waitForTimeout(300);
  assert((await frame()) !== running, 'the game is not moving before the pause');
  await page.click('#pad-quit');
  await page.waitForTimeout(100);
  const held = await frame();
  await page.waitForTimeout(600);
  assert((await frame()) === held, 'the game kept running under the confirm');
  await page.click('#pad [data-key="left"]');
  assert(!(await visible(page, '#pad-confirm')), 'a game button did not answer the confirm');
  assert(await visible(page, '#pad'), 'the game ended');
  await page.waitForTimeout(300);
  assert((await frame()) !== held, 'the game did not resume');
});

await scenario('ABORT RUN on touch confirms at the top of the screen', async ({ open }) => {
  const s = awakeNetling();
  startRun(s, 'public', Math.random);
  const page = await open(BASE, seed({ 'netling.save': s }));
  assert(await visible(page, '#pad'), 'run screen not open');
  await page.click('#pad-quit');
  assert((await page.textContent('#pad-confirm')) === 'CONFIRM ABORT', 'wrong confirm label');
  assert((await page.textContent('#pad-quit')) === 'KEEP RUNNING', 'wrong cancel label');
  assert((await saved(page)).run.phase !== 'done', 'aborted on the first tap');
  await page.click('#pad-confirm');
  await page.waitForTimeout(300);
  assert((await saved(page)).run?.result === 'aborted', `not aborted: ${JSON.stringify((await saved(page)).run?.result)}`);
  assert((await page.textContent('#pad-quit')) === 'ABORT RUN', 'the pad label was not restored');
  await page.click('#pad-quit'); // the summary card closes on one tap
  await page.waitForTimeout(300);
  assert(!(await visible(page, '#pad')), 'the summary card did not close');
});

await scenario('the readout shows the trait level and its history', async ({ open }) => {
  const page = await open(BASE, seed({ 'netling.save': awakeNetling({ generation: 3, trait: 'persistent', traitLevel: 2, history: 'hardened' }) }));
  const text = await page.textContent('#readout');
  assert(/trait Persistent II · history Hardened/.test(text), `readout: ${text}`);
});

await scenario('SCRAP sells for a quarter, and the scrip line shows it', async ({ open }) => {
  const page = await open(BASE, seed({ 'netling.save': awakeNetling({ inventory: ['overclock'], scrip: 30 }) }));
  assert((await page.textContent('#inv-scrip')) === 'SCRIP 30/100', `scrip line: ${await page.textContent('#inv-scrip')}`);
  await page.locator('#inv-slots .inv-slot.filled').nth(0).click();
  assert((await page.textContent('#inv-discard')) === 'SCRAP +12', `button: ${await page.textContent('#inv-discard')}`);
  await page.click('#inv-discard');
  await page.click('#inv-discard');
  await page.waitForTimeout(200);
  const s = await saved(page);
  assert(s.scrip === 42 && s.inventory.length === 0, `after scrapping: ${s.scrip} scrip, ${JSON.stringify(s.inventory)}`);
  assert((await page.textContent('#inv-scrip')) === 'SCRIP 42/100', 'scrip line not updated');
});

await scenario('regions open in order: only the Public Net until its exit is reached', async ({ open }) => {
  const page = await open(BASE, seed({ 'netling.save': awakeNetling({ stage: 'teen', form: 'kernel', teenForm: 'kernel', cleared: [] }) }));
  await page.click('#btn-netrun');
  const buttons = page.locator('#region-list button');
  assert(!(await buttons.nth(0).isDisabled()), 'the Public Net is closed');
  assert(await buttons.nth(1).isDisabled(), 'the Bazaar is open without a clear');
  assert(/exit of the Public Net/.test(await buttons.nth(1).textContent()), `no reason shown: ${await buttons.nth(1).textContent()}`);
  assert(/CODEX MEMORY 0\/8/.test(await page.textContent('#region-memory')), 'no codex memory line');
  await page.close();

  const page2 = await open(BASE, seed({ 'netling.save': awakeNetling({ stage: 'teen', form: 'kernel', teenForm: 'kernel', cleared: ['public'], codexFound: 8 }) }));
  await page2.click('#btn-netrun');
  const b2 = page2.locator('#region-list button');
  assert(!(await b2.nth(1).isDisabled()), 'the Bazaar stayed closed after a Public Net clear');
  assert(/DARKNET BAZAAR/.test(await b2.nth(1).textContent()), 'the Bazaar is not second');
  assert(await b2.nth(2).isDisabled(), 'the Corp Grid opened early');
  assert(/FULL/.test(await page2.textContent('#region-memory')), 'a full memory is not shown');
});

await scenario('at a netrun market the inventory sells for half, and a purchase opens up', async ({ open }) => {
  const s = awakeNetling({ stage: 'teen', form: 'kernel', teenForm: 'kernel', inventory: ['overclock'], scrip: 0 });
  s.stats.charge = 90;
  let seedN = 1;
  const rng = () => ((seedN = (seedN * 16807) % 2147483647) / 2147483647);
  startRun(s, 'public', rng);
  const next = runOptions(s.run)[0];
  next.type = 'market';
  moveTo(s, next.id, rng);
  const cheapest = Math.min(...s.run.pending.offers.map((id) => ({ coolant: 15, antivirus: 15, repair: 15, booster: 15, memory: 15 })[id] ?? 25));
  const page = await open(BASE, seed({ 'netling.save': s }));
  assert(await visible(page, '#pad'), 'run screen not open');
  await page.locator('#inv-slots .inv-slot.filled').nth(0).click();
  assert((await page.textContent('#inv-discard')) === 'SELL +25', `button: ${await page.textContent('#inv-discard')}`);
  await page.click('#inv-discard');
  await page.click('#inv-discard');
  await page.waitForTimeout(300);
  const after = await saved(page);
  assert(after.scrip === 25 && after.inventory.length === 0, `after selling: ${after.scrip} scrip`);
  const buys = after.run.pending.options.filter((o) => o.id.startsWith('buy') && o.id !== 'buyacc');
  assert(buys.some((o) => !o.disabled) === cheapest <= 25, `purchases: ${JSON.stringify(buys)}`);
});

await scenario('system actions wait for a running mini-game; a refused result explains why', async ({ open }) => {
  const page = await open(BASE, seed({ 'netling.save': awakeNetling({ stats: { charge: 25, sync: 70, integrity: 100, heat: 20 } }) }));
  await page.click('#btn-play');
  await page.click('[data-game="breach"]');
  await page.click('#open-archive');
  await page.click('#open-transfer');
  assert(await page.locator('#hibernate-btn').isDisabled(), 'hibernate allowed mid-game');
  assert(/finish the game/.test(await page.textContent('#hibernate-note')), 'no reason given');
  await page.click('#transfer-out');
  await page.waitForTimeout(200);
  assert(!(await saved(page, 'netling.lock')), 'transferred out mid-game');
  await page.click('#close-transfer');
  await page.keyboard.press('Escape'); // forfeit; system actions are open again
  await page.waitForTimeout(2500);
  await page.click('#open-archive');
  await page.click('#open-transfer');
  assert(!(await page.locator('#hibernate-btn').isDisabled()), `hibernate still blocked: ${await page.textContent('#hibernate-note')}`);
  await page.click('#close-transfer');
  await page.close(); // hand the netling (about 19 charge now) to the next tab

  // Charge runs out while it plays (an hour passes in dev mode): the result is refused, and the status says why.
  const dev = await open(`${BASE}?dev`);
  await dev.click('#btn-play');
  await dev.click('[data-game="tune"]');
  await dev.click('[data-skip="60"]');
  await dev.keyboard.press('Escape');
  // Usually it ran out of charge. A random memory overflow in the skipped hour can crash it instead,
  // and then the refusal names the reboot: either way the player is told why.
  let status = '';
  for (let i = 0; i < 30 && !/charge|rebooting/.test(status); i++) {
    await dev.waitForTimeout(100);
    status = await dev.textContent('#status');
  }
  assert(/not enough charge|rebooting/.test(status), `refusal not explained: ${JSON.stringify(status)}`);
});

// Plugs in a fake controller: window.__pad is what navigator.getGamepads() reports.
const FAKE_PAD = `(() => {
  window.__pad = { buttons: Array.from({ length: 17 }, () => ({ pressed: false })), axes: [0, 0] };
  navigator.getGamepads = () => [window.__pad];
  dispatchEvent(new Event('gamepadconnected'));
})()`;
const PAD_BUTTONS = { a: 0, b: 1, up: 12, down: 13, left: 14, right: 15 };
async function padPress(page, name) {
  await page.evaluate((i) => (window.__pad.buttons[i].pressed = true), PAD_BUTTONS[name]);
  await page.waitForTimeout(80);
  await page.evaluate((i) => (window.__pad.buttons[i].pressed = false), PAD_BUTTONS[name]);
  await page.waitForTimeout(80);
}
const focused = (page) => page.evaluate(() => document.activeElement?.id || document.activeElement?.dataset.act || document.activeElement?.dataset.game || document.activeElement?.tagName);

await scenario('a controller moves through menus and plays a mini-game', async ({ open }) => {
  const page = await open(BASE, seed());
  await page.addScriptTag({ content: FAKE_PAD });
  await padPress(page, 'down'); // nothing focused yet: focus lands on the first control
  assert((await focused(page)) === 'pref-sound', `first focus: ${await focused(page)}`);
  await page.focus('[data-act="corp"]');
  await padPress(page, 'right');
  assert((await focused(page)) === 'scav', `right from CORP: ${await focused(page)}`);
  await padPress(page, 'down');
  assert((await focused(page)) === 'cool', `down from SCAV: ${await focused(page)}`);

  // B backs out of the game picker; A starts a game; B quits it.
  await page.focus('#btn-play');
  await padPress(page, 'a');
  assert(await visible(page, '#picker'), 'A did not open the picker');
  await padPress(page, 'b');
  assert(await visible(page, '#controls'), 'B did not leave the picker');
  await page.focus('#btn-play');
  await padPress(page, 'a');
  await page.focus('[data-game="tune"]');
  await padPress(page, 'a');
  assert(await visible(page, '#pad'), 'A did not start the game');
  await padPress(page, 'a'); // past the intro card
  await padPress(page, 'left');
  await padPress(page, 'b'); // quit: counts as a loss
  await page.waitForTimeout(2500);
  assert(await visible(page, '#controls'), 'game did not end');
  assert((await saved(page)).games.tune.played === 1, 'game not recorded');

  // B closes a dialog.
  await page.focus('#open-archive');
  await padPress(page, 'a');
  assert(await page.locator('#archive').evaluate((d) => d.open), 'A did not open the archive');
  await padPress(page, 'b');
  assert(!(await page.locator('#archive').evaluate((d) => d.open)), 'B did not close the archive');
});

await scenario('fits a Steam Deck screen without scrolling; phones keep one column', async ({ open }) => {
  const page = await open(BASE, seed());
  const fits = () => page.evaluate(() => document.documentElement.scrollHeight <= innerHeight);
  const layout = () => page.evaluate(() => getComputedStyle(document.querySelector('.device')).display);
  for (const [w, h] of [[1280, 800], [1366, 768]]) {
    await page.setViewportSize({ width: w, height: h });
    assert((await layout()) === 'grid', `${w}x${h}: not the two-column layout`);
    assert(await fits(), `${w}x${h}: home screen scrolls`);
    await page.click('#btn-netrun');
    assert(await fits(), `${w}x${h}: region list scrolls`);
    await page.click('#regions-back');
  }
  await page.setViewportSize({ width: 390, height: 844 });
  assert((await layout()) !== 'grid', 'phone got the two-column layout');
  await page.click('#btn-play');
  assert(await visible(page, '#picker'), 'phone layout: PLAY does nothing');
});

await scenario('nap: starts, blocks play, wakes early', async ({ open }) => {
  const page = await open(BASE, seed());
  await page.click('#btn-nap');
  await page.waitForTimeout(300);
  assert((await saved(page)).nap, 'nap not saved');
  assert((await page.textContent('#btn-nap')) === 'WAKE UP', 'button did not change');
  assert(/napping/.test(await page.textContent('#readout')), 'readout does not say it is napping');
  await page.click('#btn-play');
  assert(/napping/.test(await page.textContent('#status')), 'play not refused while napping');
  await page.click('#btn-nap');
  await page.waitForTimeout(300);
  const s = await saved(page);
  assert(s.nap === null && s.lastNapEndAge !== null, 'wake did not end the nap');
  await page.click('#btn-nap');
  assert(/nap again/.test(await page.textContent('#status')), 'no cooldown after a nap');
});

await scenario('lights off darkens the screen while it is awake', async ({ open }) => {
  const page = await open(BASE, seed());
  const corner = () => page.evaluate(() => [...document.getElementById('lcd').getContext('2d').getImageData(4, 4, 1, 1).data].slice(0, 3).join());
  const lit = await corner();
  await page.click('#btn-lights');
  await page.waitForTimeout(300);
  const dark = await corner();
  assert(lit !== dark, `screen unchanged with the lights off (${lit})`);
});

await scenario('the log keeps every stored line, wraps long ones, and scrolls', async ({ open }) => {
  const s = awakeNetling();
  for (let i = 0; i < 60; i++) s.log.push({ t: Date.now(), msg: `> netrun (Darknet Bazaar): jacked out with ${i} items and 1 fragment. re-synced +12 integrity.` });
  s.log = s.log.slice(-50); // full: new lines replace old ones, so the length stays the same
  const page = await open(BASE, seed({ 'netling.save': s }));
  const log = await page.evaluate(() => {
    const l = document.getElementById('log');
    const li = l.lastElementChild;
    return { lines: l.children.length, scrolls: l.scrollHeight > l.clientHeight, atBottom: l.scrollHeight - l.scrollTop - l.clientHeight < 8, wrapped: li.getBoundingClientRect().height > 30, clipped: li.scrollWidth > li.clientWidth };
  });
  assert(log.lines === s.log.length, `showing ${log.lines} of ${s.log.length} lines`);
  assert(log.scrolls && log.atBottom, `not scrolled to the newest line: ${JSON.stringify(log)}`);
  assert(log.wrapped && !log.clipped, `long line not wrapped: ${JSON.stringify(log)}`);
  await page.click('#btn-lights');
  await page.waitForTimeout(300);
  const last = await page.evaluate(() => document.getElementById('log').lastElementChild.textContent);
  assert(/lights off/.test(last), `a full log stopped updating: ${last}`);
});

await scenario('field manual hides root until the codex is complete', async ({ open }) => {
  const terms = async (page) => {
    await page.click('#open-help');
    return page.evaluate(() => [...document.querySelectorAll('#help-body dt')].map((d) => d.textContent));
  };
  const before = await terms(await open(BASE, seed()));
  assert(!before.includes('root') && before.some((t) => /^r.+t$/.test(t)), `root not hidden: ${before}`);
  assert(before.includes('file icons'), `cache files not explained: ${before}`);
  assert(before.includes('quirks'), `quirks not explained: ${before}`);
});

await scenario('field manual shows root once the codex is complete', async ({ open }) => {
  const page = await open(BASE, seed({ 'netling.codex': FRAGMENTS.map((f) => f.id) }));
  await page.evaluate(() => document.getElementById('transmission').open && document.getElementById('transmission').close());
  await page.click('#open-help');
  const terms = await page.evaluate(() => [...document.querySelectorAll('#help-body dt')].map((d) => d.textContent));
  assert(terms.includes('root'), `root still hidden: ${terms}`);
});

// As if a fragment had been added to the game since the codex was finished.
const codexMissingOne = FRAGMENTS.slice(0, -1).map((f) => f.id);
const helpTerms = async (page) => {
  await page.click('#open-help');
  return page.evaluate(() => [...document.querySelectorAll('#help-body dt')].map((d) => d.textContent));
};

await scenario('Root Access is kept when the codex grows: the earned flag', async ({ open }) => {
  const page = await open(BASE, seed({ 'netling.codex': codexMissingOne, 'netling.progress': { streaks: {}, acts: {}, rootEarned: true } }));
  const terms = await helpTerms(page);
  assert(terms.includes('root'), `root hidden despite rootEarned: ${terms}`);
});

await scenario('Root Access is kept when the codex grows: a netling NL-0 already covers', async ({ open }) => {
  const page = await open(BASE, seed({ 'netling.codex': codexMissingOne, 'netling.save': awakeNetling({ rootAccess: true }) }));
  const terms = await helpTerms(page);
  assert(terms.includes('root'), `root hidden for a covered netling: ${terms}`);
  await page.waitForTimeout(300);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('netling.progress')));
  assert(stored?.rootEarned === true, `rootEarned not written back: ${JSON.stringify(stored)}`);
});

await scenario('Root Access stays hidden until it is earned', async ({ open }) => {
  const page = await open(BASE, seed({ 'netling.codex': codexMissingOne }));
  const terms = await helpTerms(page);
  assert(!terms.includes('root'), 'root shown without being earned');
});

await scenario('test mode: hidden until 7 logo taps, separate fast netling, real one untouched', async ({ open }) => {
  const real = awakeNetling();
  const test = awakeNetling({ generation: 5 });
  const page = await open(BASE, seed({ 'netling.save': real, 'netling-test.save': test, 'netling-test.onboarding': 'done', 'netling-test.helpSeen': true }));
  const realBefore = await page.evaluate(() => localStorage.getItem('netling.save'));

  await page.click('#open-archive');
  await page.click('#open-transfer');
  assert(!(await visible(page, '#test-mode')), 'test mode visible before the gesture');
  await page.click('#close-transfer');
  for (let i = 0; i < 7; i++) await page.click('.logo');
  assert(/test mode unlocked/.test(await page.textContent('#status')), 'gesture did nothing');
  await page.click('#open-archive');
  await page.click('#open-transfer');
  assert(await visible(page, '#test-mode'), 'test mode still hidden after the gesture');
  await page.selectOption('#test-speed', '168');
  await page.click('#test-toggle');
  await page.waitForLoadState('load');
  await page.waitForTimeout(1500);

  assert((await page.textContent('#test-badge')) === 'TEST 168x', 'no test badge');
  assert(await visible(page, '#dev'), 'time-skip buttons missing in test mode');
  const age0 = (await saved(page, 'netling-test.save')).ageMin;
  await page.waitForTimeout(4000); // ~11 game minutes at 168x
  const age1 = (await saved(page, 'netling-test.save')).ageMin;
  assert(age1 - age0 >= 8, `test clock not fast: ${age0} -> ${age1}`);
  assert((await saved(page, 'netling-test.save')).generation === 5, 'not the test netling');
  // Nothing the test netling does reaches the real save.
  await page.click('[data-act="lights"]');
  await page.waitForTimeout(1200);
  assert((await page.evaluate(() => localStorage.getItem('netling.save'))) === realBefore, 'test mode wrote the real save');

  await page.click('#open-archive');
  await page.click('#open-transfer');
  await page.click('#transfer-out');
  assert(/not in test mode/.test(await page.textContent('#status')), 'transfer out allowed in test mode');
  await page.click('#test-toggle'); // leave
  await page.waitForLoadState('load');
  await page.waitForTimeout(1500);
  assert(!(await visible(page, '#test-badge')), 'still badged after leaving');
  assert((await saved(page)).generation === real.generation, 'real netling not back');
  const clock = await saved(page, 'netling-test.testClock');
  assert(clock?.realAt === null && clock.speed === 168, `test clock not paused: ${JSON.stringify(clock)}`);

  // Away for a while, then back: it resumes where it paused (at 168x, 4s away would be ~11 minutes).
  const ageAtLeave = (await saved(page, 'netling-test.save')).ageMin;
  await page.waitForTimeout(4000);
  await page.click('#open-archive');
  await page.click('#open-transfer');
  await page.selectOption('#test-speed', '24');
  await page.click('#test-toggle');
  await page.waitForLoadState('load');
  await page.waitForTimeout(1200);
  assert((await page.textContent('#test-badge')) === 'TEST 24x', 'speed choice not applied');
  const ageBack = (await saved(page, 'netling-test.save')).ageMin;
  // Up to one save interval (~3 game minutes at 168x) passes between the last save and the pause.
  assert(ageBack - ageAtLeave <= 4, `test clock ran while paused: ${ageAtLeave} -> ${ageBack}`);
});

await scenario('actions play a reaction on the screen; refusals shake it off', async ({ open }) => {
  const page = await open(BASE, seed({ 'netling.save': awakeNetling({ cache: 2, stats: { charge: 40, sync: 70, integrity: 90, heat: 20 }, inventory: ['booster'] }) }));
  const played = () => page.evaluate(() => document.getElementById('lcd').dataset.anim);
  await page.click('[data-act="corp"]');
  assert((await played()) === 'eat', `feeding played ${await played()}`);
  await page.click('#controls [data-act="purge"]');
  assert((await played()) === 'purge', `purge played ${await played()}`);
  await page.click('[data-act="cool"]'); // heat 20: already cool
  assert((await played()) === 'refuse', `a refused cool played ${await played()}`);
  assert(/already running cool/.test(await page.textContent('#status')), 'refusal text gone');
  await page.click('#inv-slots .inv-slot.filled');
  await page.click('#inv-use');
  assert((await played()) === 'item', `item use played ${await played()}`);
});

await scenario('Packet Feast is in the PLAY menu and pays Charge', async ({ open }) => {
  const page = await open(BASE, seed({ 'netling.save': awakeNetling({ stats: { charge: 50, sync: 70, integrity: 90, heat: 20 } }) }));
  await page.click('#btn-play');
  await page.click('[data-game="feast"]');
  assert(await visible(page, '#pad'), 'FEAST did not start');
  await page.keyboard.press('Enter'); // past the intro card
  await page.keyboard.press('Escape'); // quit: a loss
  await page.waitForTimeout(2500);
  const s = await saved(page);
  assert(s.games.feast.played === 1, 'feast not recorded');
  assert(Math.round(s.stats.charge) === 50 - 6 + 3, `charge after a lost feast: ${s.stats.charge}`);
  assert((await page.evaluate(() => document.getElementById('lcd').dataset.anim)) === 'play', 'no reaction after the game');
});

await scenario('intrusion: DEFEND launches a mini-game; losing it installs a virus', async ({ open }) => {
  const s = awakeNetling();
  s.event = { type: 'attack', startedAge: s.ageMin };
  const page = await open(BASE, seed({ 'netling.save': s }));
  assert(await visible(page, '#event-bar'), 'no alert bar');
  assert((await page.textContent('#event-name')) === 'INTRUSION', `label: ${await page.textContent('#event-name')}`);
  assert(await visible(page, '#event-defend'), 'no DEFEND button');
  assert(!(await visible(page, '#event-bar [data-act="hide"]')), 'trace buttons shown for an intrusion');
  await page.click('#event-defend');
  assert(await visible(page, '#pad'), 'DEFEND did not start a game');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Escape'); // quit: the defense fails
  await page.waitForTimeout(2500);
  const after = await saved(page);
  assert(after.event === null && after.virus === true, `defense loss not applied: ${JSON.stringify({ event: after.event, virus: after.virus })}`);
  assert(!(await visible(page, '#event-bar')), 'alert bar still up');
});

await scenario('overflow: PURGE from the alert bar contains it', async ({ open }) => {
  const s = awakeNetling({ cache: 0 });
  s.event = { type: 'overflow', startedAge: s.ageMin };
  const page = await open(BASE, seed({ 'netling.save': s }));
  assert((await page.textContent('#event-name')) === 'MEMORY OVERFLOW', 'wrong label');
  await page.click('#event-bar [data-act="purge"]');
  await page.waitForTimeout(300);
  assert((await saved(page)).event === null, 'overflow not contained');
  assert(/overflow contained/.test(await page.textContent('#log')), 'not logged');
});

await scenario('after a crash it reboots: care is blocked and the readout says so', async ({ open }) => {
  const s = awakeNetling();
  s.rebootUntilAge = s.ageMin + 15;
  const page = await open(BASE, seed({ 'netling.save': s }));
  assert(/rebooting/.test(await page.textContent('#readout')), 'readout does not show the reboot');
  await page.click('[data-act="corp"]');
  assert(/rebooting/.test(await page.textContent('#status')), 'feeding allowed while rebooting');
  assert((await page.evaluate(() => document.getElementById('lcd').dataset.anim)) === 'refuse', 'no refusal reaction');
});

await scenario('changing shell keeps the equipped accessory and label; an old single accessory moves to its slot', async ({ open }) => {
  const page = await open(
    BASE,
    seed({
      'netling.accessories': ['partyhat'],
      'netling.wardrobe': { accessory: 'partyhat', label: 'ZED', shell: 'standard' },
      'netling.unlocked': ['shell:standard', 'shell:matte', 'label'],
    }),
  );
  await page.click('#open-archive');
  await page.click('#tab-btn-wardrobe');
  await page.locator('#wardrobe-list .cosmetic', { hasText: 'Matte black' }).click();
  const w = await saved(page, 'netling.wardrobe');
  assert(w.shell === 'matte', `shell not set: ${JSON.stringify(w)}`);
  assert(w.head === 'partyhat' && w.accessory === undefined && w.label === 'ZED', `lost wardrobe fields: ${JSON.stringify(w)}`);
});

await scenario('one accessory per slot: a hat and shades together, and a second hat replaces the first', async ({ open }) => {
  const page = await open(
    BASE,
    seed({
      'netling.accessories': ['partyhat', 'cap', 'shades'],
      'netling.wardrobe': { head: 'partyhat' },
    }),
  );
  await page.click('#open-archive');
  await page.click('#tab-btn-wardrobe');
  const heads = await page.locator('#wardrobe-list h3').allTextContents();
  for (const h of ['ACCESSORY: HEAD', 'ACCESSORY: FACE', 'ACCESSORY: BODY', 'ACCESSORY: FLOAT', 'PROP']) assert(heads.includes(h), `no ${h} section: ${heads}`);
  await page.locator('#wardrobe-list .cosmetic', { hasText: 'Shades' }).click();
  let w = await saved(page, 'netling.wardrobe');
  assert(w.head === 'partyhat' && w.face === 'shades', `not both worn: ${JSON.stringify(w)}`);
  await page.locator('#wardrobe-list .cosmetic', { hasText: 'Cap' }).click();
  w = await saved(page, 'netling.wardrobe');
  assert(w.head === 'cap' && w.face === 'shades', `the hat did not swap: ${JSON.stringify(w)}`);
  // The party hat's color row belongs to the head slot and goes with it; the shades have their own.
  assert((await page.locator('.color-row', { hasText: 'shades colors' }).count()) === 1, 'no shades colors');
  assert((await page.locator('.color-row', { hasText: 'party hat colors' }).count()) === 0, 'a stale party hat color row');
});

await scenario('legacy: the family tree links generations, and an earned crest shows on the device', async ({ open }) => {
  const life = (generation, trait) => ({ generation, form: 'daemon', realized: true, cause: 'end of life cycle', ageMin: 7200, trait, fragmentTrait: 'persistent', fragmentLevel: 1, keepsake: 'coolant', palette: 0 });
  const lineage = [1, 2, 3, 4, 5].map((g) => life(g, g > 1 ? 'persistent' : null));
  const page = await open(BASE, seed({ 'netling.save': awakeNetling({ generation: 6, trait: 'persistent' }), 'netling.lineage': lineage }));
  assert(!(await visible(page, '#crest')), 'a crest is shown before one is equipped');
  await page.click('#open-archive');
  assert((await page.locator('#lineage-list li.link').count()) === 5, 'expected a link between each of the six generations');
  const first = await page.locator('#lineage-list li').first().textContent();
  assert(/v1\.0/.test(first), `the tree does not start with the oldest generation: ${first}`);
  assert(/Persistent \+ Coolant cell/.test(await page.locator('#lineage-list li.link').first().textContent()), 'the link does not say what passed down');
  assert(/full lives/.test(await page.textContent('#record')), 'record label not updated');
  await page.click('#tab-btn-wardrobe');
  await page.locator('#wardrobe-list .cosmetic', { hasText: 'Closed loop' }).click();
  assert((await saved(page, 'netling.wardrobe')).crest === 'loop', 'crest not saved');
  assert(await visible(page, '#crest'), 'equipped crest not shown on the device');
  const lit = await page.evaluate(() => [...document.getElementById('crest').getContext('2d').getImageData(0, 0, 9, 9).data].filter((v, i) => i % 4 === 3 && v > 0).length);
  assert(lit > 10, `crest canvas is blank (${lit} pixels)`);
});

await scenario('a 100-generation line: the tree opens scrolled to the running netling, with its stats', async ({ open }) => {
  const lineage = Array.from({ length: 100 }, (_, i) => ({ generation: i + 1, form: 'daemon', realized: true, cause: 'end of life cycle', ageMin: 7200, trait: i ? 'persistent' : null, fragmentTrait: 'persistent', keepsake: 'coolant', palette: i % 4 }));
  const page = await open(BASE, seed({ 'netling.save': awakeNetling({ generation: 101, trait: 'persistent' }), 'netling.lineage': lineage }));
  const inView = () =>
    page.evaluate(() => {
      const box = document.getElementById('tab-lineage').getBoundingClientRect();
      const run = document.querySelector('#lineage-list li.running').getBoundingClientRect();
      return run.top >= box.top - 1 && run.bottom <= box.bottom + 1;
    });
  await page.click('#open-archive');
  assert((await page.locator('#lineage-list li.link').count()) === 100, 'expected 100 links');
  assert(await inView(), 'the running netling is not in view when the archive opens');
  assert(/CHG \d+ · SYNC \d+ · INT \d+ · HEAT \d+/.test(await page.textContent('#lineage-list li.running')), 'no stats on the running netling');
  await page.evaluate(() => (document.getElementById('tab-lineage').scrollTop = 0));
  await page.click('#tab-btn-dex');
  await page.click('#tab-btn-lineage');
  assert(await inView(), 'returning to the tab does not scroll back to the running netling');
});

await scenario('flatline screen and next generation', async ({ open }) => {
  const dead = awakeNetling({ stage: 'dead', form: 'daemon', deathCause: 'neglect', diedAt: Date.now() });
  dead.fragment = { form: 'daemon', trait: 'persistent', quirk: { ...dead.quirk }, keepsake: 'coolant', rootUsed: false };
  const page = await open(BASE, seed({ 'netling.save': dead }));
  assert(await visible(page, '#flatline'), 'flatline not shown');
  await page.click('#fl-next');
  await page.waitForTimeout(300);
  const s = await saved(page);
  assert(s.generation === 2 && s.stage === 'script', `next gen not compiled: ${s.generation} ${s.stage}`);
});

await scenario('a netling that dies during a netrun closes the run screen', async ({ open }) => {
  const s = awakeNetling({ stage: 'adult', form: 'daemon', teenForm: 'kernel' });
  startRun(s, 'public', Math.random);
  s.ageMin = 7 * 24 * 60 - 1; // its last minute
  s.lastTick = Date.now() - 58_000; // the minute completes a couple of seconds after load
  const page = await open(BASE, seed({ 'netling.save': s }));
  assert(await visible(page, '#pad'), 'run screen not open');
  await page.waitForSelector('#flatline:not([hidden])', { timeout: 8000 });
  assert(!(await visible(page, '#pad')), 'the run pad stayed open after death');
  assert(await visible(page, '#controls'), 'home controls not restored');
  await page.click('#fl-next');
  await page.waitForTimeout(300);
  assert(!(await visible(page, '#pad')), 'the old run came back after compiling');
});

await scenario('hibernate from the system dialog', async ({ open }) => {
  const page = await open(BASE, seed());
  await page.click('#open-archive');
  await page.click('#open-transfer');
  assert(!(await page.locator('#hibernate-btn').isDisabled()), `hibernate unavailable: ${await page.textContent('#hibernate-note')}`);
  await page.click('#hibernate-btn');
  await page.click('#hibernate-btn');
  await page.waitForTimeout(300);
  assert(await page.evaluate(() => document.body.classList.contains('frozen')), 'not frozen');
  assert(await visible(page, '#hibernating'), 'hibernation panel not shown');
});

await scenario('attention: a request bar with a direct PLAY into the game it asked for', async ({ open }) => {
  const game = awakeNetling();
  game.request = { kind: 'game', game: 'tune', startedAge: game.ageMin };
  const page = await open(BASE, seed({ 'netling.save': game }));
  assert(await visible(page, '#wish-bar'), 'request bar not shown');
  assert((await page.textContent('#wish-text')).includes('TUNE'), 'request does not name the game');
  assert((await page.textContent('#wish-play')) === 'PLAY TUNE', 'no direct PLAY button');
  assert(!(await visible(page, '#event-bar')), 'a request must not look like an alert');
  await page.click('#wish-play');
  await page.waitForTimeout(300);
  assert(await visible(page, '#pad'), 'PLAY TUNE did not start the game');
  assert(!(await visible(page, '#wish-bar')), 'the request bar stays up during the game');
});

await scenario('attention: COOL answers a COOL request, and it counts', async ({ open }) => {
  const warm = awakeNetling();
  warm.stats.heat = 50;
  warm.request = { kind: 'cool', startedAge: warm.ageMin };
  const page2 = await open(BASE, seed({ 'netling.save': warm }));
  assert(await visible(page2, '#wish-cool'), 'no COOL button for a COOL request');
  await page2.click('#wish-cool');
  await page2.waitForTimeout(300);
  assert(!(await visible(page2, '#wish-bar')), 'request bar still up after COOL');
  const progress = await page2.evaluate(() => JSON.parse(localStorage.getItem('netling.progress')));
  assert(progress.requestsMet === 1, `requests met: ${progress.requestsMet}`);
});

await scenario('attention: a posted contract shows in the bar and the region picker, and a jack-in takes it along', async ({ open }) => {
  const save = awakeNetling();
  save.stats.charge = 90;
  save.contract = { kind: 'caches', region: 'public', n: 2, scrip: 15, item: 'coolant', postedAge: save.ageMin };
  const page = await open(BASE, seed({ 'netling.save': save }));
  assert(await visible(page, '#wish-bar'), 'no bar for an open contract');
  const bar = await page.textContent('#wish-text');
  assert(/contract: crack 2 caches in the Public Net · 6h/.test(bar), `bar: ${bar}`);
  assert(!(await visible(page, '#event-bar')), 'a contract must not look like an alert');
  await page.click('#wish-run');
  assert(await visible(page, '#regions'), 'NETRUN in the bar did not open the region picker');
  const line = await page.textContent('#region-contract');
  assert(/CONTRACT: CRACK 2 CACHES IN THE PUBLIC NET\. PAYS 15 SCRIP AND A COOLANT CELL\./.test(line), `picker: ${line}`);
  assert((await page.locator('#region-list .rmeta.contract').count()) === 1, 'the contract region is not marked');
  await page.locator('#region-list button:not([disabled])').first().click();
  await page.waitForTimeout(300);
  const s = await saved(page);
  assert(s.contract === null && s.run?.contract?.kind === 'caches', `not taken along: ${JSON.stringify({ c: s.contract, r: s.run?.contract })}`);
});

await scenario('attention: the daily check-in fills the reward box once; TAKE moves it to the netling', async ({ open }) => {
  const save = awakeNetling();
  save.scrip = 0;
  const page = await open(BASE, seed({ 'netling.save': save, 'netling.checkin': null }));
  await page.waitForTimeout(1500);
  assert(await visible(page, '#open-box'), 'no BOX after the first check-in');
  assert((await page.textContent('#open-box')) === 'BOX 1', `box: ${await page.textContent('#open-box')}`);
  const c = await saved(page, 'netling.checkin');
  assert(c.day === 1 && c.claims === 1 && c.claimedAt > 0, `check-in: ${JSON.stringify(c)}`);
  await page.click('#open-box');
  assert(await visible(page, '#box'), 'the box did not open');
  assert((await page.locator('#box-ladder .box-day.done').count()) === 1, 'day 1 not marked done');
  await page.locator('#box-list button', { hasText: '10 SCRIP' }).click();
  assert((await saved(page)).scrip === 10, 'the scrip did not reach the netling');
  assert((await saved(page, 'netling.rewardBox')).length === 0, 'the box still holds it');
  // Same morning: a reload claims nothing more.
  await page.reload();
  await page.waitForTimeout(1500);
  assert((await saved(page, 'netling.checkin')).claims === 1, 'claimed twice in one day');
  assert((await page.textContent('#open-box')) === 'BOX', 'an empty box still shows its button');
});

await scenario('attention: GREET a visitor, hear its line, find it in the CHATTER tab', async ({ open }) => {
  const save = awakeNetling();
  save.visit = { startedAge: save.ageMin, len: 20, form: 'daemon', palette: 1, accessory: null };
  const page = await open(BASE, seed({ 'netling.save': save }));
  assert(await visible(page, '#wish-greet'), 'no GREET while a visitor is here');
  await page.click('#wish-greet');
  await page.waitForTimeout(1300);
  assert(!(await visible(page, '#wish-greet')), 'GREET still offered after saying hello');
  assert(await visible(page, '#speech'), 'the visitor said nothing');
  assert((await page.textContent('#speech')).startsWith('visitor:'), 'not a visitor line');
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem('netling.progress')));
  assert(progress.visitorsGreeted === 1, `greeted: ${progress.visitorsGreeted}`);
  assert(progress.chatter.length === 1, `heard: ${progress.chatter}`);
  await page.click('#open-archive');
  await page.click('#tab-btn-chatter');
  assert((await page.textContent('#chatter-count')).startsWith('1/'), 'chatter count');
  assert((await page.textContent('#chatter-list')).includes('VISITORS'), 'visitor group not shown');
});

await scenario('attention: flow shows in the readout and glows on screen', async ({ open }) => {
  const save = awakeNetling({ flowMin: 400 });
  Object.assign(save.stats, { charge: 90, sync: 90, integrity: 100, heat: 20 });
  const page = await open(BASE, seed({ 'netling.save': save }));
  assert((await page.textContent('#readout')).includes('in flow'), 'flow not in the readout');
  assert(await animating(page), 'screen not drawing');
});

await scenario('dev mode: time skip and evolve', async ({ open }) => {
  const page = await open(`${BASE}?dev`, seed());
  await page.waitForTimeout(500);
  await page.click('#dev-evolve');
  await page.waitForTimeout(300);
  assert((await saved(page)).stage === 'teen', 'did not evolve');
});

// --- music ---

const musicStatus = (page) => page.evaluate(async () => (await import('./src/music.js')).musicStatus());
const setHidden = (page, hidden) =>
  page.evaluate((h) => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => h });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);

await scenario('music: silent until the first tap, then plays; pauses while hidden', async ({ open }) => {
  const page = await open(BASE, seed());
  await page.waitForTimeout(1200);
  assert(await page.evaluate(async () => (await import('./src/audio.js')).audioContext() === null), 'audio started without a gesture');
  assert(!(await musicStatus(page)).playing, 'music autoplayed');
  await page.click('#open-archive');
  await page.click('#close-archive');
  await page.waitForTimeout(800);
  let m = await musicStatus(page);
  assert(m.playing && m.key === 'idle:' && m.variant === 'awake', `not playing after a tap: ${JSON.stringify(m)}`);
  assert(m.voices > 0, `no notes queued (context not running?): ${JSON.stringify(m)}`);
  await setHidden(page, true);
  assert(!(await musicStatus(page)).playing, 'still playing while hidden');
  await setHidden(page, false);
  await page.waitForTimeout(300);
  assert((await musicStatus(page)).playing, 'did not come back when shown');
  await page.click('#open-archive'); // menus keep the music going
  m = await musicStatus(page);
  assert(m.playing, 'stopped behind a menu');
});

await scenario('music: its own slider (40% by default, 0 stops it), SND OFF, mini-game duck', async ({ open }) => {
  const page = await open(BASE, seed());
  await page.click('#open-archive');
  await page.click('#open-transfer');
  assert((await page.inputValue('#music-volume')) === '40', 'music does not default to 40%');
  assert((await page.textContent('.volume-row')).startsWith('EFFECTS'), 'the effects slider is not labelled');
  await page.fill('#music-volume', '0');
  assert((await saved(page, 'netling.prefs')).musicVolume === 0, 'music volume not saved');
  assert(!(await musicStatus(page)).playing, 'music plays at 0%');
  await page.fill('#music-volume', '60');
  assert((await musicStatus(page)).playing, 'music did not start from the slider');
  await page.click('#close-transfer');
  await page.click('#pref-sound');
  assert(!(await musicStatus(page)).playing, 'SND OFF did not stop the music');
  await page.click('#pref-sound');
  await page.waitForTimeout(300);
  assert((await musicStatus(page)).playing, 'SND ON did not bring the music back');
  await page.click('#btn-play');
  await page.click('[data-game="breach"]');
  await page.waitForTimeout(1300);
  const m = await musicStatus(page);
  assert(m.playing && m.key === 'idle:' && m.duck === 0.7, `mini-game should keep the home track, ducked: ${JSON.stringify(m)}`);
  await page.click('#pad-quit');
  await page.click('#pad-confirm');
});

await scenario('music: a netrun plays its own theme', async ({ open }) => {
  const s = awakeNetling();
  startRun(s, 'public', Math.random);
  const page = await open(BASE, seed({ 'netling.save': s }));
  await page.click('#pad-quit'); // a tap starts the audio
  await page.click('#pad-quit'); // KEEP RUNNING
  await page.waitForTimeout(1300);
  const m = await musicStatus(page);
  assert(m.playing && m.key === 'netrun:public', `netrun theme not playing: ${JSON.stringify(m)}`);
});

// Its own scenario: a second tab in the same profile would be the waiting tab, which stays quiet.
await scenario('music: resting plays the sleep variant', async ({ open }) => {
  const napping = awakeNetling();
  napping.nap = { startedAge: napping.ageMin }; // resting, like sleep, and the page won't wake it on load
  const page = await open(BASE, seed({ 'netling.save': napping }));
  await page.keyboard.press('Shift');
  await page.waitForTimeout(1300);
  const m = await musicStatus(page);
  assert(m.playing && m.key === 'idle:' && m.variant === 'sleep', `sleep variant not playing: ${JSON.stringify(m)}`);
});

await scenario('music: an earned track can be equipped in STYLE and plays at once', async ({ open }) => {
  const page = await open(BASE, seed({ 'netling.progress': { gamesPlayed: 150 } }));
  await page.click('#open-archive'); // also the tap that starts the audio
  await page.click('#tab-btn-wardrobe');
  const tracker = page.locator('#wardrobe-list button.cosmetic', { hasText: 'Tracker' });
  assert(await tracker.isEnabled(), 'Tracker not unlocked by 150 games');
  // Locked items show only their hint.
  assert(await page.locator('#wardrobe-list button.cosmetic', { hasText: 'pass it on.' }).isDisabled(), 'a locked track can be equipped');
  await tracker.click();
  await page.waitForTimeout(1200);
  const m = await musicStatus(page);
  assert(m.playing && m.key === 'tracker:', `equipped track not playing: ${JSON.stringify(m)}`);
  assert((await saved(page, 'netling.wardrobe')).music === 'tracker', 'music choice not saved');
});

await scenario('music: an open alert plays the alert variant, and ends with the alert', async ({ open }) => {
  const alarmed = awakeNetling();
  Object.assign(alarmed.stats, { charge: 10, sync: 90, integrity: 100, heat: 20 }); // low Charge is the only alert
  const page = await open(BASE, seed({ 'netling.save': alarmed }));
  await page.keyboard.press('Shift');
  await page.waitForTimeout(1300);
  let m = await musicStatus(page);
  assert(m.playing && m.variant === 'alert', `alert variant not playing: ${JSON.stringify(m)}`);
  await page.click('#controls [data-act="corp"]'); // feed it past the alert
  await page.click('#controls [data-act="corp"]');
  await page.waitForTimeout(1300);
  m = await musicStatus(page);
  assert(m.variant === 'awake', `still alarmed after feeding: ${JSON.stringify(m)}`);
});

// Its own scenario: a second tab in the same profile would be the waiting tab, which stays quiet.
await scenario('music: flow plays the flow variant', async ({ open }) => {
  const save = awakeNetling({ flowMin: 400 });
  Object.assign(save.stats, { charge: 90, sync: 90, integrity: 100, heat: 20 });
  const page = await open(BASE, seed({ 'netling.save': save }));
  await page.keyboard.press('Shift');
  await page.waitForTimeout(1300);
  const m = await musicStatus(page);
  assert(m.playing && m.variant === 'flow', `flow variant not playing: ${JSON.stringify(m)}`);
});

await scenario('music: the DEV row forces a track and a state', async ({ open }) => {
  const page = await open(`${BASE}?dev`, seed());
  await page.click('#dev-music-track'); // the tap that starts the audio
  await page.selectOption('#dev-music-track', 'netrun:deep');
  await page.selectOption('#dev-music-state', 'flow');
  await page.waitForTimeout(300);
  const m = await musicStatus(page);
  assert(m.playing && m.key === 'netrun:deep' && m.variant === 'flow', `DEV override not applied: ${JSON.stringify(m)}`);
});

await browser.close();
server.close();
const failed = results.filter(([, f]) => f).length;
console.log(`\n${results.length - failed}/${results.length} scenarios passed`);
process.exit(failed ? 1 : 0);
