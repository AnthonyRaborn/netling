// Renders the background music to WAV files, to listen without running the game, and prints
// each render's loudness. Uses headless Chromium's OfflineAudioContext, so it runs the real player code.
// Usage: node tools/render-music.mjs <out dir> [seconds=45] [track[:variant[:region]] ...]
//   node tools/render-music.mjs /tmp/music                  every track and state
//   node tools/render-music.mjs /tmp/music 90 idle:sleep netrun::deep
// The files are at the game's own level (the music slider at VOLUME, default 0.4), not normalized,
// so they sound as loud as the game does at the same device volume. reference-effects.wav holds a
// few sound effects at the default 80% to compare with. Sleep renders run at least 64 s, to hear
// the whole wind-down.
// Needs Playwright, like the smoke test.
import { execSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const [outDir, secondsArg, ...specs] = process.argv.slice(2);
if (!outDir) {
  console.error('usage: node tools/render-music.mjs <out dir> [seconds] [track[:variant[:region]] ...]');
  process.exit(1);
}
const seconds = Number(secondsArg) || 45;
const volume = process.env.VOLUME === undefined ? 0.4 : Number(process.env.VOLUME);
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
// Renders in the page and returns the WAV bytes as base64 (moving raw floats out is slow).
async function render(job) {
  return page.evaluate(
    async ({ job, seconds, volume, RATE }) => {
      const len = job.effects ? seconds : seconds + 1.5;
      const ctx = new OfflineAudioContext(1, Math.ceil(len * RATE), RATE);
      if (job.effects) {
        // Copies of audio.js effects (win, feed, alert) at the default effects volume: square, 0.06 x 80%.
        const pats = [
          [[1, 0], [1.25, 0.08], [1.5, 0.16], [2, 0.24], [2, 0.36]],
          [[1, 0], [1.25, 0.08], [1.5, 0.16]],
          [[2, 0], [2, 0.15], [2, 0.3]],
        ];
        for (let at = 0.5, i = 0; at < seconds - 1; at += 2, i++) {
          for (const [mult, start] of pats[i % 3]) {
            const t = at + start;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(660 * mult, t);
            g.gain.setValueAtTime(0.06 * 0.8, t);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
            osc.connect(g).connect(ctx.destination);
            osc.start(t);
            osc.stop(t + 0.09);
          }
        }
      } else {
        const { renderMusic, MUSIC_LEVEL } = await import('/src/music.js');
        renderMusic(ctx, { ...job, seconds, seed: 7, level: MUSIC_LEVEL * volume });
      }
      const data = (await ctx.startRendering()).getChannelData(0);
      let sum = 0;
      let peak = 0;
      const pcm = new Int16Array(data.length);
      for (let j = 0; j < data.length; j++) {
        sum += data[j] * data[j];
        peak = Math.max(peak, Math.abs(data[j]));
        pcm[j] = Math.max(-32768, Math.min(32767, Math.round(data[j] * 32767)));
      }
      const bytes = new Uint8Array(pcm.buffer);
      let bin = '';
      for (let j = 0; j < bytes.length; j += 0x8000) bin += String.fromCharCode(...bytes.subarray(j, j + 0x8000));
      return { b64: btoa(bin), rms: Math.sqrt(sum / data.length), peak, len };
    },
    { job, seconds: job.variant === 'sleep' ? Math.max(seconds, 64) : seconds, volume, RATE },
  );
}

for (const job of [...jobs, { effects: true }]) {
  const res = await render(job);
  const name = job.effects ? 'reference-effects.wav' : `${job.track}-${job.variant}${job.region ? `-${job.region}` : ''}.wav`;
  await writeFile(join(outDir, name), wav(Buffer.from(res.b64, 'base64'), RATE));
  console.log(`${name.padEnd(28)} ${res.len.toFixed(1)}s  rms ${res.rms.toFixed(4)}  peak ${res.peak.toFixed(4)}`);
}
console.log(`(music at ${Math.round(volume * 100)}%; effects at the default 80%)`);
await browser.close();
server.close();
