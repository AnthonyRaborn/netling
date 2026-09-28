// Tiny Web Audio chiptune blips. The context starts on the first user gesture.

let ctx = null;
let muted = false;
let volume = 1; // 0..1, scales every blip
export function setVolume(v) {
  volume = Math.min(1, Math.max(0, Number(v) || 0));
}
// The wardrobe's sound pack; calls that name their own wave (netrun regions, NL-0) ignore it.
let pack = { wave: 'square', mult: 1 };
export function setSoundPack(wave, mult) {
  pack = { wave, mult };
}

export function setMuted(value) {
  muted = value;
}

// Safe to call from any click handler: without Web Audio the game just stays silent.
export function unlockAudio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  } catch {
    ctx = null;
  }
}

function blip(freq, start, dur, type = 'square', vol = 0.06) {
  if (!ctx) return;
  const t = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(Math.max(0.0001, vol * volume), t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur);
}

// A burst of band-passed static: the "crunch" under a hit. Sits around 1-3 kHz, where
// phone speakers are loudest, so it reads even at low volume.
let noiseBuf = null;
function noise(start, dur, vol = 0.12, freq = 1800) {
  if (!ctx) return;
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  const t = ctx.currentTime + start;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = 0.8;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(Math.max(0.0001, vol * volume), t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start(t);
  src.stop(t + dur);
}

// [pitch multiple, start seconds, note length (default 0.09)].
const PATTERNS = {
  feed: [[1, 0], [1.25, 0.08], [1.5, 0.16]],
  play: [[1, 0], [1.5, 0.06], [1, 0.12], [2, 0.18]],
  patch: [[0.75, 0], [1, 0.1], [1.5, 0.2]],
  cool: [[1.5, 0], [1.25, 0.08], [1, 0.16]],
  purge: [[2, 0], [1, 0.05], [0.5, 0.1]],
  lights: [[1, 0]],
  error: [[1, 0, 0.12], [0.84, 0.13, 0.16]],
  hit: [[1.5, 0, 0.07], [0.75, 0.06, 0.14]],
  alert: [[2, 0], [2, 0.15], [2, 0.3]],
  boot: [[0.5, 0], [0.75, 0.1], [1, 0.2], [1.5, 0.3], [2, 0.4]],
  // Spans the 2.4 s evolution strobe: a climbing run, a held chord, a final high note.
  evolve: [
    [1, 0], [1.25, 0.1], [1.5, 0.2], [2, 0.3],
    [1.25, 0.5], [1.5, 0.6], [2, 0.7], [2.5, 0.8],
    [1.5, 1.05, 0.2], [2, 1.05, 0.2], [2.5, 1.05, 0.2],
    [2, 1.45], [2.5, 1.55], [3, 1.65, 0.6],
  ],
  move: [[1.5, 0]],
  select: [[1, 0], [2, 0.05]],
  win: [[1, 0], [1.25, 0.08], [1.5, 0.16], [2, 0.24], [2, 0.36]],
  lose: [[1, 0, 0.12], [0.84, 0.14, 0.12], [0.7, 0.28, 0.12], [0.56, 0.42, 0.3]],
  surge: [[2, 0, 0.05], [3, 0.04, 0.05], [2, 0.08, 0.05]],
  visit: [[1.25, 0], [1.5, 0.08], [1.25, 0.3], [2, 0.38]],
};

// Failure sounds sit low, where phone speakers drop out. If a pattern's lowest note would
// fall under this, the whole pattern moves up an octave (keeping its shape).
const FLOOR_HZ = 350;
const FLOORED = new Set(['error', 'hit', 'lose']);
// Louder, and with a crunch, so a failure can't pass unnoticed.
const NOISY = { error: [0, 0.08], hit: [0, 0.12], lose: [0, 0.1] };

export function sfx(name, pitch = 660, wave) {
  if (muted) return;
  if (wave === undefined) {
    wave = pack.wave;
    pitch *= pack.mult;
  }
  if (name === 'flatline') {
    // Two heartbeats, then the long tone.
    for (const at of [0, 0.18, 0.9, 1.08]) blip(pitch, at, 0.1, 'square', 0.07);
    return blip(pitch, 1.8, 2.5, 'sine', 0.1);
  }
  const pat = PATTERNS[name];
  if (!pat) return;
  if (FLOORED.has(name)) {
    const low = Math.min(...pat.map(([m]) => m));
    while (pitch * low < FLOOR_HZ) pitch *= 2;
  }
  // softer waves need a little more volume to sit at the same loudness
  let vol = wave === 'sine' ? 0.1 : wave === 'triangle' ? 0.09 : 0.06;
  if (NOISY[name]) {
    vol *= 1.5;
    noise(NOISY[name][0], NOISY[name][1]);
  }
  for (const [mult, start, dur = 0.09] of pat) blip(pitch * mult, start, dur, wave, vol);
}
