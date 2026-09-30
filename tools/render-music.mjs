// Renders the background music to WAV files, to listen without running the game, and prints
// each render's loudness. Uses headless Chromium's OfflineAudioContext, so it runs the real player code.
// Usage: node tools/render-music.mjs <out dir> [bars=24] [track[:variant[:region]] ...]
//   node tools/render-music.mjs /tmp/music                  every track and state
//   node tools/render-music.mjs /tmp/music 32 idle:sleep netrun::deep
// Needs Playwright, like the smoke test.
import { execSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [outDir, barsArg, ...specs] = process.argv.slice(2);
if (!outDir) {
  console.error('usage: node tools/render-music.mjs <out dir> [bars] [track[:variant[:region]] ...]');
  process.exit(1);
}
const bars = Number(barsArg) || 24;
const all = ['idle:awake', 'idle:sleep', 'idle:alert', 'idle:flow', 'netrun::public', 'netrun::corp', 'netrun::bazaar', 'netrun::ruins', 'netrun::deep'];
const jobs = (specs.length ? specs : all).map((s) => {
  const [track, variant = 'awake', region = null] = s.split(':');
  return { track, variant: variant || 'awake', region: region || null };
});

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    const globalRoot = execSync('npm root -g').toString().trim();
    return import(pathToFileURL(join(globalRoot, 'playwright', 'index.mjs')));
  }
}
const { chromium } = await loadPlaywright();

const TYPES = { '.html': 'text/html', '.js': 'text/javascript' };
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^[/\\]+/, '');
  if (!path || path.startsWith('..')) return res.writeHead(200, { 'content-type': 'text/html' }).end('<!doctype html><title>render</title>');
  try {
    res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' }).end(await readFile(join(root, path)));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(`http://localhost:${server.address().port}/`);

// A mono 16-bit WAV around raw little-endian PCM bytes.
function wav(pcm, rate) {
  const samples = { length: pcm.length / 2 };
  const buf = Buffer.alloc(44 + pcm.length);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + samples.length * 2, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(samples.length * 2, 40);
  pcm.copy(buf, 44);
  return buf;
}

await mkdir(outDir, { recursive: true });
const RATE = 44100;
// The printed numbers are at the game's own level (MUSIC_LEVEL x the default 40%). The WAVs share
// one gain, set so the loudest peaks near full scale: sleep stays quieter than awake, as in the game.
const renders = [];
for (const job of jobs) {
  const res = await page.evaluate(
    async ({ job, bars, RATE }) => {
      const { renderMusic, MUSIC_LEVEL } = await import('/src/music.js');
      const { musicSettings, STEPS } = await import('/src/tracks.js');
      const { bpm } = musicSettings(job.track, job.variant, job.region);
      const len = (bars * STEPS * 60) / bpm / 4 + 1.5;
      const ctx = new OfflineAudioContext(1, Math.ceil(len * RATE), RATE);
      renderMusic(ctx, { ...job, bars, seed: 7, level: MUSIC_LEVEL * 0.4 });
      const data = (await ctx.startRendering()).getChannelData(0);
      let sum = 0;
      let peak = 0;
      for (const v of data) {
        sum += v * v;
        peak = Math.max(peak, Math.abs(v));
      }
      (window.renders ??= []).push(data); // kept in the page: moving raw floats out is slow
      return { rms: Math.sqrt(sum / data.length), peak, len };
    },
    { job, bars, RATE },
  );
  const name = `${job.track}-${job.variant}${job.region ? `-${job.region}` : ''}.wav`;
  renders.push({ name, ...res });
  console.log(`${name.padEnd(28)} ${res.len.toFixed(1)}s  rms ${res.rms.toFixed(4)}  peak ${res.peak.toFixed(4)}`);
}
console.log('(at the default 40%; a square sound effect at the default 80% peaks at 0.048)');
const gain = 0.9 / Math.max(...renders.map((r) => r.peak), 1e-6);
for (let i = 0; i < renders.length; i++) {
  const b64 = await page.evaluate(
    ({ i, gain }) => {
      const data = window.renders[i];
      const pcm = new Int16Array(data.length);
      for (let j = 0; j < data.length; j++) pcm[j] = Math.max(-32768, Math.min(32767, Math.round(data[j] * gain * 32767)));
      const bytes = new Uint8Array(pcm.buffer);
      let bin = '';
      for (let j = 0; j < bytes.length; j += 0x8000) bin += String.fromCharCode(...bytes.subarray(j, j + 0x8000));
      return btoa(bin);
    },
    { i, gain },
  );
  await writeFile(join(outDir, renders[i].name), wav(Buffer.from(b64, 'base64'), RATE));
}
await browser.close();
server.close();
