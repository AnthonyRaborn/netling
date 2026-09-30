// Takes the install-dialog screenshots listed in manifest.webmanifest from the real app, with a
// freshly compiled Bitling (no spoilers: players see these before they install).
// Usage: node tools/make-screenshots.mjs  (needs Playwright, like npm run smoke)
import { execSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdirSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createScript, isSleepHour, tick } from '../src/sim.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    const globalRoot = execSync('npm root -g').toString().trim();
    return import(pathToFileURL(join(globalRoot, 'playwright', 'index.mjs')));
  }
}
const { chromium } = await loadPlaywright();

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2' };
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
const url = `http://localhost:${server.address().port}/index.html`;

// A netling a couple of hours old, awake at this hour, with no events rolled on the way.
function netling() {
  const now = Date.now();
  const save = createScript({ now: now - 150 * 60_000 });
  const hour = new Date().getHours();
  save.quirk.sleepOffset = [...Array(15).keys()].map((i) => i - 2).find((o) => !isSleepHour(hour, o) && !isSleepHour((hour + 1) % 24, o)) ?? 0;
  tick(save, now, () => 0.999);
  Object.assign(save.stats, { charge: 82, sync: 76, integrity: 100, heat: 18 }); // well looked after
  return save;
}
// The party hat is the tutorial's gift, so owning it also keeps its notice off the screen.
const seed = {
  'netling.save': netling(),
  'netling.onboarding': 'done',
  'netling.helpSeen': true,
  'netling.accessories': ['partyhat'],
  'netling.wardrobe': { accessory: 'partyhat' },
};
const init = `(() => { const d = ${JSON.stringify(seed)}; for (const [k, v] of Object.entries(d)) localStorage.setItem(k, JSON.stringify(v)); })()`;

// Sizes must match the manifest entries.
const manifest = JSON.parse(readFileSync(join(root, 'manifest.webmanifest'), 'utf8'));
const SHOTS = [
  { form: 'narrow', viewport: { width: 390, height: 844 }, scale: 2 },
  { form: 'wide', viewport: { width: 1280, height: 800 }, scale: 1 },
];

const browser = await chromium.launch();
mkdirSync(join(root, 'screenshots'), { recursive: true });
for (const { form, viewport, scale } of SHOTS) {
  const entry = manifest.screenshots.find((s) => s.form_factor === form);
  const size = `${viewport.width * scale}x${viewport.height * scale}`;
  if (entry?.sizes !== size) throw new Error(`manifest ${form} screenshot should say sizes "${size}"`);
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: scale, serviceWorkers: 'block' });
  await ctx.addInitScript(init);
  const page = await ctx.newPage();
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500); // a few idle frames, so the sprite is mid-animation rather than blank
  await page.screenshot({ path: join(root, entry.src) });
  console.log(`${entry.src} ${size}`);
  await ctx.close();
}
await browser.close();
server.close();
