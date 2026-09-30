// Background music player: schedules the arranger's bars (tracks.js) on the shared Web Audio
// context a little ahead of time, so the beat stays steady. It only ever starts after a user
// gesture has created the context (audio.js), and stops while the page is hidden, when muted, or
// with the music volume at 0. See docs/MUSIC_PLAN.md.
import { audioContext } from './audio.js';
import { REGIONS } from './netrun/regions.js';
import { SPARKLE, STEPS, TRACKS, applyVariant, createArranger, musicSettings } from './tracks.js';

// Music at 100% peaks around a quiet sound effect, so effects always read over it.
export const MUSIC_LEVEL = 0.08;
const LOOKAHEAD_S = 0.3; // bars are queued once they start within this window
const TICK_MS = 50;
const HIDE_FADE_S = 0.3;
const SWAP_FADE_S = 0.8;
const END_FADE_S = 2; // flatline
const VARIANT_TAU_S = 0.7; // about 2 s to settle into a state change

const midiHz = (m) => 440 * 2 ** ((m - 69) / 12);

// --- sound making: works on any BaseAudioContext, so a tool can render offline ---

const noiseBufs = new WeakMap();
function noiseBuffer(ctx) {
  let buf = noiseBufs.get(ctx);
  if (!buf) {
    buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
    const data = buf.getChannelData(0);
    let x = 12345; // fixed noise, so offline renders are repeatable
    for (let i = 0; i < data.length; i++) {
      x = (Math.imul(x, 1103515245) + 12345) >>> 0;
      data[i] = (x / 2 ** 31) - 1;
    }
    noiseBufs.set(ctx, buf);
  }
  return buf;
}

// A graph for one track: parts feed their own lowpass (and echo), then level (the state's
// volume) -> out (fades in and out) -> dest.
function createGraph(ctx, dest) {
  const out = ctx.createGain();
  out.gain.setValueAtTime(1, ctx.currentTime);
  out.connect(dest);
  const level = ctx.createGain();
  level.connect(out);
  return { ctx, out, level, chains: {}, sources: new Set() };
}

function chain(graph, name, def) {
  if (graph.chains[name]) return graph.chains[name];
  const { ctx } = graph;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(Math.min(def.cutoff ?? 20000, 20000), ctx.currentTime);
  filter.connect(graph.level);
  if (def.echo) {
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.33;
    const fb = ctx.createGain();
    fb.gain.value = 0.35;
    filter.connect(delay).connect(fb).connect(delay);
    fb.connect(graph.level);
  }
  return (graph.chains[name] = { filter, def });
}

function track(graph, node, stopAt) {
  graph.sources.add(node);
  node.onended = () => graph.sources.delete(node);
  node.stop(stopAt);
}

function tone(graph, dest, wave, freq, t, dur, vol, env) {
  const { ctx } = graph;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.005);
  let end;
  if (env === 'pluck') {
    end = t + Math.min(Math.max(dur, 0.12), 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, end);
  } else {
    end = t + dur;
    g.gain.linearRampToValueAtTime(vol * 0.75, Math.max(t + 0.01, end - 0.04));
    g.gain.linearRampToValueAtTime(0, end + 0.04);
    end += 0.04;
  }
  osc.connect(g).connect(dest);
  osc.start(t);
  track(graph, osc, end + 0.01);
}

function noiseHit(graph, t, dur, vol, type, freq) {
  const { ctx } = graph;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = 0.8;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(g).connect(graph.level);
  src.start(t);
  track(graph, src, t + dur + 0.01);
}

function drum(graph, kind, t, vol) {
  if (kind === 'k') {
    const { ctx } = graph;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    osc.connect(g).connect(graph.level);
    osc.start(t);
    track(graph, osc, t + 0.17);
  } else if (kind === 's') noiseHit(graph, t, 0.12, vol * 0.6, 'bandpass', 1800);
  else if (kind === 'h') noiseHit(graph, t, 0.03, vol * 0.35, 'highpass', 7000);
}

// A dial-up handshake squeal: a few quick random tones over a burst of static.
function modem(graph, t, seed) {
  let x = seed >>> 0 || 1;
  const r = () => ((x = (Math.imul(x, 1664525) + 1013904223) >>> 0) / 2 ** 32);
  for (let i = 0; i < 7; i++) tone(graph, graph.level, 'square', 1100 + r() * 1500, t + i * 0.05, 0.045, 0.05, 'hold');
  noiseHit(graph, t + 0.36, 0.25, 0.05, 'bandpass', 2400);
}

// Queues one arranged bar at time t0 and returns its length in seconds.
export function scheduleBar(graph, bar, settings, t0) {
  const def = TRACKS[settings.track];
  const stepS = 60 / settings.bpm / 4;
  graph.level.gain.setTargetAtTime(settings.vol, t0, VARIANT_TAU_S);
  for (const e of applyVariant(bar.events, settings)) {
    const t = t0 + e.step * stepS;
    if (e.part === 'fx') {
      modem(graph, t, e.seed);
      continue;
    }
    const part = e.part === 'sparkle' ? SPARKLE : def.parts[e.part];
    if (e.drum) {
      drum(graph, e.drum, t, part.vol * e.vel);
      continue;
    }
    const c = chain(graph, e.part, part);
    c.filter.frequency.setTargetAtTime(Math.min(part.cutoff ?? 20000, settings.cutoff, 20000), t0, VARIANT_TAU_S);
    const wave = part.region && settings.wave ? settings.wave : part.wave;
    // softer waves need more level to sit at the same loudness (as in audio.js)
    const lift = wave === 'sine' ? 1.6 : wave === 'triangle' || wave === 'sawtooth' ? 1.4 : 1;
    tone(graph, c.filter, wave, midiHz(e.midi), t, e.len * stepS, part.vol * e.vel * lift, part.env);
  }
  return STEPS * stepS;
}

// Renders bars of a track into any context (an OfflineAudioContext in tools/render-music.mjs).
export function renderMusic(ctx, { track = 'idle', variant = 'awake', region = null, bars = 16, seed = 1, level = MUSIC_LEVEL } = {}) {
  const master = ctx.createGain();
  master.gain.value = level;
  master.connect(ctx.destination);
  const graph = createGraph(ctx, master);
  const arranger = createArranger(track, seed);
  const settings = musicSettings(track, variant, region, REGIONS[region]?.sound);
  let t = 0.05;
  for (let i = 0; i < bars; i++) t += scheduleBar(graph, arranger.next(), settings, t);
  return t;
}

// --- the live player ---

let want = null; // musicMode() result, or null for silence
let volume = 0.4;
let muted = false;
let hidden = false;
let seed = 1;
let master = null; // gain -> destination, one per context
let masterKey = '';
let duckUntil = 0;
let session = null; // { key, graph, arranger, nextAt, timer }
const arrangers = new Map(); // key -> arranger, so a return picks up where it left off

const modeKey = (m) => `${m.track}:${m.region ?? ''}`;

export function setMusicVolume(v) {
  volume = Math.min(1, Math.max(0, Number(v) || 0));
  syncMusic();
}
export function setMusicMuted(value) {
  muted = Boolean(value);
  syncMusic();
}
export function setMusicHidden(value) {
  hidden = Boolean(value);
  syncMusic();
}
export function setMusicSeed(value) {
  if (value !== seed) arrangers.clear();
  seed = value >>> 0 || 1;
}
export function setMusicMode(mode) {
  want = mode;
  syncMusic();
}

// Drops the music under a long jingle (the evolve strobe), then brings it back.
export function duckMusic(seconds) {
  const ctx = audioContext();
  if (!ctx) return;
  duckUntil = ctx.currentTime + seconds;
  masterKey = '';
  syncMusic();
}

function applyMaster(ctx) {
  if (!master || master.context !== ctx) {
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    masterKey = '';
  }
  const base = volume * MUSIC_LEVEL * (want?.duck ?? 1);
  const key = `${base}:${duckUntil}`;
  if (key === masterKey) return;
  masterKey = key;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setTargetAtTime(duckUntil > now ? base * 0.3 : base, now, 0.1);
  if (duckUntil > now) master.gain.setTargetAtTime(base, duckUntil, 0.3);
}

function stop(fade) {
  if (!session) return;
  const { graph, timer } = session;
  clearInterval(timer);
  session = null;
  const now = graph.ctx.currentTime;
  const g = graph.out.gain;
  g.cancelScheduledValues(now);
  g.setValueAtTime(g.value, now);
  g.linearRampToValueAtTime(0, now + fade);
  setTimeout(() => {
    for (const s of graph.sources) {
      try {
        s.stop();
      } catch {
        // already stopped
      }
    }
    graph.out.disconnect();
  }, fade * 1000 + 50);
}

function pump() {
  if (!session || !want) return;
  const ctx = session.graph.ctx;
  if (ctx.state !== 'running') return;
  // Fell behind (a suspended context, a throttled timer): start again from now, not in a rush.
  if (session.nextAt < ctx.currentTime) session.nextAt = ctx.currentTime + 0.05;
  while (session.nextAt < ctx.currentTime + LOOKAHEAD_S) {
    const settings = musicSettings(want.track, want.variant, want.region, REGIONS[want.region]?.sound);
    session.nextAt += scheduleBar(session.graph, session.arranger.next(), settings, session.nextAt);
  }
}

// Brings the player in line with what should be playing. Cheap: call it as often as you like.
export function syncMusic() {
  const ctx = audioContext();
  const play = ctx && ctx.state !== 'closed' && want && volume > 0 && !muted && !hidden;
  if (!play) {
    stop(!want ? END_FADE_S : HIDE_FADE_S);
    if (ctx && master) applyMaster(ctx);
    return;
  }
  applyMaster(ctx);
  const key = modeKey(want);
  if (session && session.key !== key) stop(SWAP_FADE_S);
  if (session) return;
  if (!arrangers.has(key)) arrangers.set(key, createArranger(want.track, seed));
  const graph = createGraph(ctx, master);
  const startAt = ctx.currentTime + 0.1;
  graph.out.gain.setValueAtTime(0, ctx.currentTime);
  graph.out.gain.linearRampToValueAtTime(1, startAt + 0.4);
  session = { key, graph, arranger: arrangers.get(key), nextAt: startAt, timer: setInterval(pump, TICK_MS) };
  pump();
}

// For the smoke test and the DEV panel: what is playing now.
export function musicStatus() {
  return { playing: Boolean(session), key: session?.key ?? null, variant: want?.variant ?? null, duck: want?.duck ?? null, voices: session?.graph.sources.size ?? 0, volume, muted, hidden };
}
