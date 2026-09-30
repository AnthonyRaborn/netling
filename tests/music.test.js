// Background music: the pure arranger and settings (tracks.js), and the player (music.js)
// against a fake AudioContext. How it sounds is checked by ear (tools/render-music.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  LOW_MIDI, MUSIC_IDS, STEPS, WIND_DOWN, finalChord, windDownPlan, TRACKS, VARIANTS, applyVariant, createArranger, musicMode, musicSettings, phraseBars,
} from '../src/tracks.js';
import { REGIONS } from '../src/netrun/regions.js';

// --- a stand-in for Web Audio that counts started sources ---

const param = () => ({
  value: 1,
  setValueAtTime() {},
  linearRampToValueAtTime() {},
  exponentialRampToValueAtTime() {},
  setTargetAtTime() {},
  cancelScheduledValues() {},
});
let started = 0;
const starts = []; // [time, wave] of every oscillator started
class FakeAudioContext {
  constructor() {
    this.currentTime = 10;
    this.sampleRate = 8000;
    this.state = 'suspended';
    this.destination = { connect() {} };
  }
  resume() {
    this.state = 'running';
    return Promise.resolve();
  }
  node(extra = {}) {
    const n = { context: this, connect: (m) => m, disconnect() {}, ...extra };
    return n;
  }
  createGain() {
    return this.node({ gain: param() });
  }
  createBiquadFilter() {
    return this.node({ frequency: param(), Q: param(), type: 'lowpass' });
  }
  createDelay() {
    return this.node({ delayTime: param() });
  }
  createOscillator() {
    const osc = this.node({ type: 'square', frequency: param(), start: (t) => (started++, starts.push([t, osc.type])), stop() {} });
    return osc;
  }
  createBuffer(_c, length) {
    return { getChannelData: () => new Float32Array(length) };
  }
  createBufferSource() {
    return this.node({ buffer: null, start: () => started++, stop() {} });
  }
}
globalThis.window = { AudioContext: FakeAudioContext };
const { unlockAudio, audioContext } = await import('../src/audio.js');
const music = await import('../src/music.js');

// --- tracks ---

test('every phrase is a whole number of bars of valid steps, and each part keeps one length', () => {
  for (const track of Object.values(TRACKS)) {
    for (const [name, part] of Object.entries(track.parts)) {
      const bars = phraseBars(part.phrases[0]);
      for (const ph of part.phrases) {
        assert.ok([1, 2].includes(phraseBars(ph)), `${track.id}.${name}: ${ph}`);
        assert.equal(phraseBars(ph), bars, `${track.id}.${name}: one phrase length per part`);
        const ok = part.mode === 'drums' ? /^[.ksh]$/ : /^(\.|-|_?-?\d+)$/;
        for (const tok of ph.trim().split(/\s+/)) assert.match(tok, ok, `${track.id}.${name}: ${tok}`);
      }
    }
    for (const section of track.form) for (const p of section.parts) assert.ok(track.parts[p], `${track.id}: section plays ${p}`);
  }
  assert.ok(MUSIC_IDS.every((id) => TRACKS[id]) && !MUSIC_IDS.includes('netrun'), 'the netrun theme is not a wardrobe track');
});

test('the arranger is deterministic for a seed, stays in range, and never repeats a phrase back to back', () => {
  for (const id of Object.keys(TRACKS)) {
    const bars = (seed) => {
      const a = createArranger(id, seed);
      return Array.from({ length: 200 }, () => a.next());
    };
    const one = bars(3);
    assert.deepEqual(one, bars(3), `${id}: same seed, same music`);
    assert.notDeepEqual(one.map((b) => b.phrases), bars(4).map((b) => b.phrases), `${id}: another seed plays differently`);
    const last = {};
    let flourishes = 0;
    for (const bar of one) {
      for (const [part, idx] of Object.entries(bar.phrases)) {
        assert.notEqual(idx, last[part], `${id}.${part}: bar ${bar.bar} repeats its phrase`);
        last[part] = idx;
      }
      for (const e of bar.events) {
        assert.ok(e.step >= 0 && e.step < STEPS);
        if (e.part === 'fx') flourishes++;
        if (e.midi !== undefined) {
          assert.ok(e.len >= 1 && e.step + e.len <= STEPS, `${id}.${e.part}: a note runs past its bar`);
          assert.ok(e.midi >= 28 && e.midi <= 96, `${id}.${e.part}: midi ${e.midi}`);
        }
      }
    }
    // with every variant's transposition, notes stay where small speakers can play them
    for (const v of ['awake', 'sleep', 'alert', 'flow']) {
      for (const region of id === 'netrun' ? Object.keys(REGIONS) : [null]) {
        const settings = musicSettings(id, v, region, REGIONS[region]?.sound);
        for (const bar of one) for (const e of applyVariant(bar.events, settings)) if (e.midi !== undefined) assert.ok(e.midi >= LOW_MIDI && e.midi <= 108, `${id} ${v} ${region}: midi ${e.midi}`);
      }
    }
    const [lo, hi] = TRACKS[id].flourishEvery;
    assert.ok(flourishes >= Math.floor(200 / hi) && flourishes <= Math.ceil(200 / lo), `${id}: ${flourishes} flourishes`);
  }
});

test('asleep, the music slows down, drops a fourth, loses its drums and softens', () => {
  const awake = musicSettings('idle', 'awake');
  const sleep = musicSettings('idle', 'sleep');
  assert.ok(sleep.bpm < awake.bpm);
  assert.equal(sleep.transpose, -5);
  assert.ok(sleep.mute.has('drums') && !awake.mute.has('drums'));
  assert.ok(sleep.vol < awake.vol && sleep.cutoff < awake.cutoff);
  const bar = createArranger('idle', 1);
  for (let i = 0; i < 6; i++) bar.next(); // into a section with drums and lead
  const events = bar.next().events;
  const slept = applyVariant(events, sleep);
  assert.ok(!slept.some((e) => e.drum), 'no drums while it sleeps');
  const notes = events.filter((e) => e.midi !== undefined);
  assert.deepEqual(slept.filter((e) => e.midi !== undefined).map((e) => e.midi), notes.map((e) => (e.midi - 5 < LOW_MIDI ? e.midi + 7 : e.midi - 5)), 'a fourth down; the bass floor lifts the lowest notes');
});

test('the alert and flow drafts: faster and higher with doubled hats; a sparkle on top', () => {
  const alert = musicSettings('idle', 'alert');
  assert.ok(alert.bpm > TRACKS.idle.bpm && alert.transpose > 0);
  const events = [{ part: 'drums', step: 2, drum: 'h', vel: 1 }, { part: 'arp', step: 0, len: 1, midi: 69, vel: 1 }];
  assert.equal(applyVariant(events, alert).filter((e) => e.drum === 'h').length, 2);
  const flow = applyVariant(events, musicSettings('idle', 'flow'));
  assert.deepEqual(flow.find((e) => e.part === 'sparkle'), { part: 'sparkle', step: 0, len: 1, midi: 81, vel: 0.5 });
  assert.deepEqual(Object.keys(VARIANTS), ['awake', 'sleep', 'alert', 'flow']);
});

test('the netrun theme takes each region\'s sound; the Deep is slow, bass and pings', () => {
  const pub = musicSettings('netrun', 'awake', 'public', REGIONS.public.sound);
  assert.ok(pub.mute.has('ping') && pub.transpose === 0 && pub.wave === 'square');
  const corp = musicSettings('netrun', 'awake', 'corp', REGIONS.corp.sound);
  assert.equal(corp.wave, 'triangle');
  assert.equal(corp.transpose, 4);
  const deep = musicSettings('netrun', 'awake', 'deep', REGIONS.deep.sound);
  assert.ok(deep.bpm < pub.bpm);
  assert.ok(!deep.mute.has('ping') && deep.mute.has('lead') && deep.mute.has('drums') && !deep.mute.has('bass'));
  assert.equal(musicSettings('idle', 'awake', 'deep', REGIONS.deep.sound).mute.size, 0, 'regions only color the netrun theme');
});

test('what plays when: home, asleep, mini-game (ducked), netrun, flatline, and DEV overrides', () => {
  assert.equal(musicMode({ alive: false }), null);
  assert.deepEqual(musicMode({ alive: true, resting: false }), { track: 'idle', variant: 'awake', region: null, duck: 1 });
  assert.equal(musicMode({ alive: true, resting: true }).variant, 'sleep');
  assert.equal(musicMode({ alive: true, inGame: true }).duck, 0.7);
  assert.deepEqual(musicMode({ alive: true, runRegion: 'bazaar', inGame: true }), { track: 'netrun', variant: 'awake', region: 'bazaar', duck: 1 });
  assert.equal(musicMode({ alive: true, track: 'netrun' }).track, 'idle', 'the netrun theme cannot be equipped');
  assert.equal(musicMode({ alive: true, track: 'made-up' }).track, 'idle');
  const forced = musicMode({ alive: true, force: { track: 'netrun:deep', variant: 'flow' } });
  assert.deepEqual([forced.track, forced.region, forced.variant], ['netrun', 'deep', 'flow']);
});

test('asleep, it winds down: bars for a while, then one chord that dies away by 60 s, then quiet', () => {
  const barS = (STEPS * 60) / musicSettings('idle', 'sleep').bpm / 4;
  const plan = windDownPlan(barS);
  assert.ok(plan.finalAtS > WIND_DOWN.fadeFromS, 'the fade starts before the chord');
  assert.ok(WIND_DOWN.silentAtS - plan.finalAtS >= WIND_DOWN.finalMinS && WIND_DOWN.silentAtS - plan.finalAtS < WIND_DOWN.finalMinS + barS, 'the chord gets its ring, and no more than a bar extra');
  assert.deepEqual(finalChord({ root: -4, q: 'maj' }), [-16, -4, 0, 3], 'low root, root, third, fifth');

  starts.length = 0;
  const ctx = new FakeAudioContext();
  ctx.currentTime = 0;
  music.renderMusic(ctx, { variant: 'sleep', seconds: 90 });
  const t0 = 0.05;
  assert.ok(starts.length > 0);
  assert.ok(starts.every(([t]) => t < t0 + WIND_DOWN.silentAtS), 'nothing starts after 60 s');
  const chord = starts.filter(([t]) => Math.abs(t - (t0 + plan.finalAtS)) < 1e-6);
  assert.equal(chord.length, 4, 'the closing chord');
  assert.ok(chord.every(([, wave]) => wave === 'triangle'));
  assert.ok(starts.every(([t]) => t <= t0 + plan.finalAtS + 1e-6), 'the chord is the last thing it plays');

  starts.length = 0;
  music.renderMusic(ctx, { variant: 'awake', seconds: 90 });
  assert.ok(starts.some(([t]) => t > 70), 'awake, it keeps playing');
});

// --- the player ---

const idle = { track: 'idle', variant: 'awake', region: null, duck: 1 };

test('the player stays silent before the first gesture, then plays; hidden, muted, 0% or dead stops it', async () => {
  started = 0;
  music.setMusicVolume(0.4);
  music.setMusicMode(idle);
  assert.equal(audioContext(), null);
  assert.equal(music.musicStatus().playing, false, 'no autoplay');
  assert.equal(started, 0);

  unlockAudio();
  await Promise.resolve();
  music.syncMusic();
  assert.equal(music.musicStatus().playing, true);
  assert.ok(started > 0, 'the first bar is queued at once');
  assert.equal(music.musicStatus().key, 'idle:');

  for (const [off, on] of [
    [() => music.setMusicHidden(true), () => music.setMusicHidden(false)],
    [() => music.setMusicMuted(true), () => music.setMusicMuted(false)],
    [() => music.setMusicVolume(0), () => music.setMusicVolume(0.4)],
    [() => music.setMusicMode(null), () => music.setMusicMode(idle)],
  ]) {
    off();
    assert.equal(music.musicStatus().playing, false);
    on();
    assert.equal(music.musicStatus().playing, true);
  }

  music.setMusicMode({ track: 'netrun', variant: 'awake', region: 'corp', duck: 1 });
  assert.equal(music.musicStatus().key, 'netrun:corp', 'a netrun swaps the track');
  music.setMusicMode({ ...idle, variant: 'sleep' });
  assert.equal(music.musicStatus().key, 'idle:');
  assert.equal(music.musicStatus().variant, 'sleep', 'falling asleep keeps the track and changes its state');
  music.setMusicMode(null); // stop the timer so the test can end
});
