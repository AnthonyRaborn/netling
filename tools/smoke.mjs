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

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^[/\\]+/, '') || 'index.html';
  if (path.startsWith('..')) return res.writeHead(403).end();
  try {
    const body = await readFile(join(root, path));
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
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  if (contextInit) await ctx.addInitScript(contextInit);
  const errors = [];
  const expected = (text) => allow.some((re) => re.test(text));
  const open = async (url = BASE, init) => {
    const page = await ctx.newPage();
    if (init) await page.addInitScript(init);
    page.on('pageerror', (e) => expected(e.message) || errors.push(`pageerror: ${e.message}`));
    page.on('console', (m) => {
      const text = m.text();
      if (m.type() === 'error' && !/favicon|net::ERR_FAILED|fonts|ERR_INTERNET_DISCONNECTED/.test(text) && !expected(text)) errors.push(`console: ${text}`);
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
// The clock loop saves every second; count this tab's saves for a moment.
async function loopRunning(page) {
  return page.evaluate(async () => {
    let saves = 0;
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k === 'netling.save') saves++;
      return set.call(this, k, v);
    };
    await new Promise((r) => setTimeout(r, 2200));
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
  const data = { 'netling.save': awakeNetling(), 'netling.onboarding': 'done', 'netling.helpSeen': true, ...extra };
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

await scenario('home: care actions, games, archive, system dialog', async ({ open }) => {
  const page = await open(BASE, seed());
  assert(!(await visible(page, '#intro')), 'intro shown for settled save');
  for (const a of ['corp', 'cool', 'purge']) await page.click(`[data-act="${a}"]`);
  await page.click('#btn-play');
  assert(await visible(page, '#picker'), 'game picker not shown');
  await page.click('[data-game="breach"]');
  await page.waitForTimeout(300);
  await page.click('#pad-quit');
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
  let status = '';
  for (let i = 0; i < 30 && !/charge/.test(status); i++) {
    await dev.waitForTimeout(100);
    status = await dev.textContent('#status');
  }
  assert(/not enough charge/.test(status), `refusal not explained: ${JSON.stringify(status)}`);
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
});

await scenario('field manual shows root once the codex is complete', async ({ open }) => {
  const page = await open(BASE, seed({ 'netling.codex': FRAGMENTS.map((f) => f.id) }));
  await page.evaluate(() => document.getElementById('transmission').open && document.getElementById('transmission').close());
  await page.click('#open-help');
  const terms = await page.evaluate(() => [...document.querySelectorAll('#help-body dt')].map((d) => d.textContent));
  assert(terms.includes('root'), `root still hidden: ${terms}`);
});

await scenario('changing shell keeps the equipped accessory and label', async ({ open }) => {
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
  assert(w.accessory === 'partyhat' && w.label === 'ZED', `lost wardrobe fields: ${JSON.stringify(w)}`);
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

await scenario('dev mode: time skip and evolve', async ({ open }) => {
  const page = await open(`${BASE}?dev`, seed());
  await page.waitForTimeout(500);
  await page.click('#dev-evolve');
  await page.waitForTimeout(300);
  assert((await saved(page)).stage === 'teen', 'did not evolve');
});

await browser.close();
server.close();
const failed = results.filter(([, f]) => f).length;
console.log(`\n${results.length - failed}/${results.length} scenarios passed`);
process.exit(failed ? 1 : 0);
