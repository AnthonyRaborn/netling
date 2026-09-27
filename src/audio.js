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

const PATTERNS = {
  feed: [[1, 0], [1.25, 0.08], [1.5, 0.16]],
  play: [[1, 0], [1.5, 0.06], [1, 0.12], [2, 0.18]],
  patch: [[0.75, 0], [1, 0.1], [1.5, 0.2]],
  cool: [[1.5, 0], [1.25, 0.08], [1, 0.16]],
  purge: [[2, 0], [1, 0.05], [0.5, 0.1]],
  lights: [[1, 0]],
  error: [[0.5, 0], [0.45, 0.1]],
  alert: [[2, 0], [2, 0.15], [2, 0.3]],
  boot: [[0.5, 0], [0.75, 0.1], [1, 0.2], [1.5, 0.3], [2, 0.4]],
  evolve: [[1, 0], [1.25, 0.1], [1.5, 0.2], [2, 0.3], [1.5, 0.45], [2, 0.55], [3, 0.7]],
  move: [[1.5, 0]],
  select: [[1, 0], [2, 0.05]],
  win: [[1, 0], [1.25, 0.08], [1.5, 0.16], [2, 0.24], [2, 0.36]],
  lose: [[1, 0], [0.8, 0.12], [0.6, 0.24], [0.4, 0.36]],
  flatline: [[1, 0]],
};

export function sfx(name, pitch = 660, wave) {
  const pat = PATTERNS[name];
  if (!pat || muted) return;
  if (wave === undefined) {
    wave = pack.wave;
    pitch *= pack.mult;
  }
  if (name === 'flatline') return blip(pitch, 0, 2.5, 'sine', 0.08);
  // softer waves need a little more volume to sit at the same loudness
  const vol = wave === 'sine' ? 0.1 : wave === 'triangle' ? 0.09 : 0.06;
  for (const [mult, start] of pat) blip(pitch * mult, start, 0.09, wave, vol);
}
