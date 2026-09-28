import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// A stand-in for Web Audio that records every note that would have been played.
const notes = [];
let created = 0;
let resumed = 0;
class FakeAudioContext {
  constructor() {
    created++;
    this.currentTime = 10;
    this.sampleRate = 8000;
    this.state = 'suspended';
    this.destination = {};
  }
  resume() {
    resumed++;
    this.state = 'running';
    return Promise.resolve();
  }
  createGain() {
    const gain = { value: 1, setValueAtTime(v) { gain.first = v; }, exponentialRampToValueAtTime() {} };
    const node = { gain, connect: (n) => n };
    return node;
  }
  createOscillator() {
    const osc = {
      type: 'square',
      frequency: { setValueAtTime(f, t) { osc.freq = f; osc.at = t; } },
      connect: (n) => n,
      start: () => {},
      stop: () => notes.push({ freq: osc.freq, type: osc.type, at: osc.at }),
    };
    return osc;
  }
  createBiquadFilter() {
    return { frequency: {}, Q: {}, connect: (n) => n };
  }
  createBuffer(_c, length) {
    return { getChannelData: () => new Float32Array(length) };
  }
  createBufferSource() {
    return { connect: (n) => n, start: () => {}, stop: () => {}, buffer: null };
  }
}
globalThis.window = { AudioContext: FakeAudioContext };
const { sfx, unlockAudio, setMuted, setVolume, setSoundPack } = await import('../src/audio.js');

const play = (...args) => {
  notes.length = 0;
  sfx(...args);
  return notes.map((n) => ({ ...n }));
};

test('nothing plays, and nothing throws, before the first user gesture', () => {
  assert.deepEqual(play('win'), []);
  assert.equal(created, 0);
});

test('unlocking creates one context, resumes it, and is safe to repeat', () => {
  unlockAudio();
  unlockAudio();
  assert.equal(created, 1);
  assert.ok(resumed >= 1);
});

test('a sound plays its notes at the netling\'s pitch, in the pack\'s wave', () => {
  const win = play('win', 500);
  assert.equal(win.length, 5);
  assert.deepEqual(win.map((n) => n.freq), [500, 625, 750, 1000, 1000]);
  assert.ok(win.every((n) => n.type === 'square'));
  setSoundPack('sine', 2);
  const soft = play('select', 400);
  assert.deepEqual(soft.map((n) => n.freq), [800, 1600]);
  assert.ok(soft.every((n) => n.type === 'sine'));
  const region = play('select', 400, 'sawtooth'); // a netrun region names its own voice, which ignores the pack
  assert.deepEqual(region.map((n) => n.freq), [400, 800]);
  assert.ok(region.every((n) => n.type === 'sawtooth'));
  setSoundPack('square', 1);
});

test('failure sounds are moved up an octave rather than played where phone speakers drop out', () => {
  for (const name of ['error', 'hit', 'lose']) {
    const low = play(name, 110);
    assert.ok(low.length > 0);
    assert.ok(Math.min(...low.map((n) => n.freq)) >= 350, `${name} dropped below 350 Hz`);
  }
  assert.equal(play('select', 110)[0].freq, 110, 'other sounds are not shifted');
});

test('the flatline sound is two heartbeats and a long tone', () => {
  const beats = play('flatline', 300);
  assert.equal(beats.length, 5);
  assert.equal(beats.at(-1).type, 'sine');
});

test('unknown sounds are silent, mute silences everything, and volume can go to zero', () => {
  assert.deepEqual(play('no-such-sound'), []);
  setMuted(true);
  assert.deepEqual(play('win'), []);
  setMuted(false);
  assert.equal(play('win').length, 5);
  setVolume(-5);
  assert.equal(play('win').length, 5, 'zero volume still runs, just inaudibly');
  setVolume('loud');
  setVolume(0.8);
});

// Every sound name the game asks for must exist, or that moment in the game is silently mute.
test('every sound name used in the source is a real sound', () => {
  const src = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
  const files = [];
  (function walk(dir) {
    for (const f of readdirSync(dir)) {
      const p = join(dir, f);
      statSync(p).isDirectory() ? walk(p) : p.endsWith('.js') && files.push(p);
    }
  })(src);
  const names = new Set();
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/\b(?:sfx|sound|this\.sound)\(\s*'([a-z]+)'/g)) names.add(m[1]);
    for (const m of text.matchAll(/\bok\([^;\n]*,\s*'([a-z]+)'\)/g)) names.add(m[1]); // act() results carry a sound name
    for (const m of text.matchAll(/(?:ok\([^;\n]*?, |sound\()(?:this\.game\.)?won \? '([a-z]+)' : '([a-z]+)'/g)) names.add(m[1]).add(m[2]);
  }
  assert.ok(names.size > 10, 'the scan found too little to be meaningful');
  const missing = [...names].filter((name) => play(name, 660).length === 0);
  assert.deepEqual(missing, [], `sounds that play nothing: ${missing.join(', ')}`);
});
