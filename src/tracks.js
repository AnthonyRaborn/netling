// Background music as data: tracks, their phrase banks, and a pure arranger that turns a track
// into one bar of notes at a time. No Web Audio here (that is music.js), so tests and tools can
// run it in Node. Track ids are permanent: the wardrobe stores them. See docs/MUSIC_PLAN.md.
//
// A phrase is a string of steps, 16 to a bar (sixteenth notes), separated by spaces:
//   '.'  rest            '-'  hold the previous note one more step
//   chord parts: 1 to 7 = the chord's root, 2nd, 3rd, 4th, 5th, 6th, 7th (the 3rd and 7th follow
//                the chord's quality); 8 to 14 the same an octave up; a leading '_' drops the note
//                an octave ('_5' is the fifth below the root)
//   scale parts: a scale degree from 0 (the key's root, an octave up per scale length; may be negative)
//   either:      '+' joins notes played together ('1+3+5' is a triad)
//   drum parts:  k kick, s snare, h hat, c key click, w woodblock, x a bar of tape hiss
// A phrase may be one or two bars long. Every part of a track must use one phrase length.
// Part options: wave, vol, octave, env ('pluck' decays, 'hold' sustains), cutoff (lowpass, Hz),
// echo, detune (cents, a second voice), sweep (bars per filter sweep), chipArp (each note
// flutters through its chord, tracker style), sparkle (the flow variant doubles it), region
// (the netrun region's wave replaces the part's).

export const STEPS = 16;

// Chords by semitones from the key root and quality.
const CHORD_TONES = { min: [0, 3, 7, 10], maj: [0, 4, 7, 11], dom: [0, 4, 7, 10] };
const DEGREES = { 2: 2, 4: 5, 6: 9 }; // the chord parts' passing notes, above the root
const PENTA_MINOR = [0, 3, 5, 7, 10];
const NATURAL_MINOR = [0, 2, 3, 5, 7, 8, 10];
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const PENTA_MAJOR = [0, 2, 4, 7, 9];

const am = { root: 0, q: 'min' };
const c = { root: 3, q: 'maj' };
const d = { root: 5, q: 'min' };
const em = { root: 7, q: 'min' };
const f = { root: -4, q: 'maj' };
const g = { root: -2, q: 'maj' };

export const TRACKS = {
  // Calm home chiptune, the free default.
  idle: {
    id: 'idle',
    name: 'Idle loop',
    bpm: 84,
    key: 57, // A3
    scale: PENTA_MINOR,
    progressions: [
      [am, f, c, g],
      [am, em, f, g],
      [f, g, am, am],
      [am, d, f, em],
    ],
    parts: {
      bass: {
        mode: 'chord', wave: 'triangle', vol: 0.4, octave: -12, env: 'hold', cutoff: 2000,
        phrases: [
          '1 - - - - - 5 - 8 - - - 5 - - -',
          '1 - - 1 . . 5 - . . 1 - 5 - 3 -',
          '1 - - - - - - - 5 - - - - - - -',
          '1 - 8 - 5 - 8 - 1 - 8 - 5 - 3 -',
        ],
      },
      arp: {
        mode: 'chord', wave: 'square', vol: 0.22, octave: 12, env: 'pluck', cutoff: 1600, sparkle: true,
        phrases: [
          '1 . 5 . 8 . 5 . 3 . 5 . 8 . 5 .',
          '8 . 5 . 3 . 5 . 8 . 5 . 3 . 1 .',
          '1 . 3 . 5 . 8 . 10 . 8 . 5 . 3 .',
          '1 5 8 . 1 5 8 . 1 5 8 . 1 5 8 .',
        ],
      },
      lead: {
        mode: 'scale', wave: 'square', vol: 0.3, octave: 12, env: 'hold', cutoff: 2400,
        phrases: [
          '2 - 3 - 4 - 3 - 2 - - - 0 - - - . . . . 1 - 2 - 0 - - - - - - -',
          '5 - - - 4 - 3 - 4 - - - 2 - - - 3 - - - 2 - 1 - 0 - - - - - - -',
          '0 - 1 - 2 - - - . . 2 - 3 - 4 - 3 - - - - - - - . . . . . . . .',
          '4 - 5 - 6 - 5 - 4 - - - 3 - - - 2 - 3 - 2 - 1 - 0 - - - . . . .',
          '. . . . 3 - 4 - 3 - 2 - 0 - - - . . . . . . . . 1 - - - 0 - - -',
          '1 - - - 0 - - - _1 - - - 0 - - - 2 - 1 - 0 - - - - - - - . . . .',
        ],
      },
      drums: {
        mode: 'drums', vol: 0.5,
        phrases: [
          'k . h . . . h . k . h . . . h .',
          'k . h . . . h . k . h . k . h h',
          'k . . . h . . . k . . . h . . .',
        ],
      },
    },
    // Sections repeat in this order; each picks a progression and plays these parts.
    form: [
      { bars: 4, parts: ['bass', 'arp'] },
      { bars: 8, parts: ['bass', 'arp', 'lead', 'drums'] },
      { bars: 4, parts: ['bass', 'arp', 'drums'] },
      { bars: 8, parts: ['bass', 'arp', 'lead', 'drums'] },
      { bars: 4, parts: ['arp'] },
    ],
    flourishEvery: [16, 32], // a modem squeal every 16 to 32 bars
  },

  // Netruns: not a wardrobe item. Each region colors it (see musicSettings).
  netrun: {
    id: 'netrun',
    name: 'Netrun',
    bpm: 110,
    key: 52, // E3
    scale: NATURAL_MINOR,
    progressions: [
      [am, f, am, g],
      [am, am, f, g],
      [am, d, am, em],
    ],
    parts: {
      bass: {
        mode: 'chord', wave: 'square', vol: 0.6, octave: -12, env: 'pluck', cutoff: 900,
        phrases: [
          '1 . 1 . 8 . 1 . 1 . 1 . 8 . 1 .',
          '1 . 1 . 1 . 8 . 1 . 1 . 5 . 8 .',
          '1 1 . 1 8 . 1 . 1 1 . 1 5 . 8 .',
        ],
      },
      pulse: {
        mode: 'chord', wave: 'square', vol: 0.16, octave: 12, env: 'pluck', cutoff: 2200, region: true, sparkle: true,
        phrases: [
          '1 . . 5 . . 8 . 1 . . 5 . . 8 .',
          '8 . . 5 . . 1 . 8 . . 5 . . 3 .',
        ],
      },
      lead: {
        mode: 'scale', wave: 'square', vol: 0.28, octave: 12, env: 'hold', cutoff: 2600, region: true,
        phrases: [
          '4 - - - - - - - 5 - - - - - - - 4 - - - - - - - . . . . . . . .',
          '4 - - - 5 - - - 4 - - - 3 - - - 4 - - - - - - - - - - - . . . .',
          '7 - - - - - - - 6 - - - 5 - - - 4 - - - - - - - - - - - - - - -',
          '. . . . 4 - 5 - 4 - - - . . . . . . . . 5 - 4 - 3 - - - 4 - - -',
        ],
      },
      drums: {
        mode: 'drums', vol: 0.5,
        phrases: [
          'k . h . s . h . k . h k s . h .',
          'k . h . s . h . k k h . s . h h',
        ],
      },
      // The Deep only: far-off pings through the echo.
      ping: {
        mode: 'scale', wave: 'sine', vol: 0.4, octave: 24, env: 'pluck', cutoff: 6000, echo: true,
        phrases: [
          '0 - - - . . . . . . . . . . . . . . . . . . . . . . . . . . . .',
          '. . . . . . . . 4 - - - . . . . . . . . . . . . . . . . . . . .',
          '. . . . . . . . . . . . . . . . 2 - - - . . . . . . 0 - - - . .',
        ],
      },
    },
    form: [
      { bars: 4, parts: ['bass', 'drums', 'ping'] },
      { bars: 8, parts: ['bass', 'pulse', 'lead', 'drums', 'ping'] },
      { bars: 4, parts: ['bass', 'pulse', 'ping'] },
      { bars: 8, parts: ['bass', 'pulse', 'lead', 'drums', 'ping'] },
    ],
    flourishEvery: [24, 40],
    mute: ['ping'], // unmuted in the Deep
  },

  // --- unlockable tracks (the wardrobe's music slot; see cosmetics.js) ---

  // Synthwave: pads with a slow filter sweep, driving octave bass, gated snare. B minor.
  nightdrive: {
    id: 'nightdrive',
    gain: 1.8,
    name: 'Night drive',
    bpm: 100,
    key: 59, // B3
    scale: NATURAL_MINOR,
    progressions: [
      [am, f, c, g],
      [am, f, g, g],
      [f, g, am, am],
      [am, d, f, g],
    ],
    parts: {
      pad: {
        mode: 'chord', wave: 'sawtooth', vol: 0.1, octave: 0, env: 'hold', cutoff: 1400, sweep: 8,
        phrases: [
          '1+3+5 - - - - - - - - - - - - - - -',
          '1+3+5 - - - - - - - 3+5+8 - - - - - - -',
          '3+5+8 - - - - - - - - - - - - - - -',
        ],
      },
      bass: {
        mode: 'chord', wave: 'square', vol: 0.3, octave: -12, env: 'pluck', cutoff: 700,
        phrases: [
          '1 8 1 8 1 8 1 8 1 8 1 8 1 8 1 8',
          '1 . 8 . 1 . 8 . 1 . 8 . 1 . 8 .',
          '1 1 8 1 1 1 8 1 1 1 8 1 5 5 8 5',
        ],
      },
      arp: {
        mode: 'chord', wave: 'square', vol: 0.12, octave: 12, env: 'pluck', cutoff: 2000, sparkle: true,
        phrases: [
          '1 3 5 8 1 3 5 8 1 3 5 8 1 3 5 8',
          '8 5 3 1 8 5 3 1 8 5 3 1 8 5 3 1',
          '1 5 8 10 1 5 8 10 1 5 8 10 1 5 8 10',
        ],
      },
      lead: {
        mode: 'scale', wave: 'sawtooth', vol: 0.18, octave: 12, env: 'hold', cutoff: 2200, echo: true,
        phrases: [
          '4 - - - - - 3 - 2 - - - 0 - - - 1 - - - - - - - . . . . . . . .',
          '0 - 2 - 4 - 7 - - - - - 6 - 4 - 5 - - - 4 - - - 2 - - - - - - -',
          '7 - - - 6 - - - 4 - - - - - - - 2 - 4 - 3 - 2 - 0 - - - - - - -',
          '. . . . 4 - 4 - 5 - 4 - 2 - - - 4 - - - - - - - - - - - . . . .',
        ],
      },
      drums: {
        mode: 'drums', vol: 0.4,
        phrases: [
          'k . h . s . h . k . h . s . h .',
          'k . h . s . h . k . h k s . h h',
        ],
      },
    },
    form: [
      { bars: 4, parts: ['pad', 'bass'] },
      { bars: 8, parts: ['pad', 'bass', 'arp', 'drums'] },
      { bars: 8, parts: ['pad', 'bass', 'lead', 'drums'] },
      { bars: 4, parts: ['pad', 'arp'] },
      { bars: 8, parts: ['pad', 'bass', 'arp', 'lead', 'drums'] },
    ],
  },

  // Old web, lonely: sparse sine melody, tape hiss, handshake chirps between phrases. G minor.
  dialup: {
    id: 'dialup',
    gain: 0.95,
    name: 'Dial-up',
    bpm: 72,
    key: 55, // G3
    scale: PENTA_MINOR,
    progressions: [
      [am, f, d, am],
      [am, em, f, d],
      [f, d, am, am],
    ],
    parts: {
      bass: {
        mode: 'chord', wave: 'triangle', vol: 0.3, octave: -12, env: 'hold', cutoff: 1500,
        phrases: [
          '1 - - - - - - - - - - - - - - -',
          '1 - - - - - - - 5 - - - - - - -',
        ],
      },
      keys: {
        mode: 'chord', wave: 'triangle', vol: 0.16, octave: 0, env: 'pluck', cutoff: 2000, sparkle: true,
        phrases: [
          '1+5 . . . . . . . 3+8 . . . . . . .',
          '1+3+5 . . . . . . . . . . . . . . .',
          '. . . . 1+5 . . . . . . . 3+5 . . .',
        ],
      },
      melody: {
        mode: 'scale', wave: 'sine', vol: 0.4, octave: 12, env: 'hold', cutoff: 3000, echo: true,
        phrases: [
          '2 - - - - - - - 1 - - - 0 - - - . . . . . . . . . . . . . . . .',
          '. . . . 4 - - - 3 - - - - - - - 2 - - - - - - - . . . . . . . .',
          '0 - - - 2 - - - 3 - - - 4 - - - 5 - - - - - - - - - - - - - - -',
          '. . . . . . . . . . . . . . . . 3 - - - 2 - - - 0 - - - - - - -',
        ],
      },
      hiss: {
        mode: 'drums', vol: 0.35,
        phrases: ['x . . . . . . . . . . . . . . .'],
      },
    },
    form: [
      { bars: 4, parts: ['keys', 'hiss'] },
      { bars: 8, parts: ['bass', 'keys', 'melody', 'hiss'] },
      { bars: 4, parts: ['bass', 'hiss'] },
      { bars: 8, parts: ['bass', 'keys', 'melody', 'hiss'] },
    ],
    flourishEvery: [4, 6], // the handshake, often
    flourish: 'handshake',
  },

  // Elevator music, a little ironic: seventh chords, walking bass, woodblock. G major.
  lobby: {
    id: 'lobby',
    name: 'Corp lobby',
    bpm: 96,
    key: 55, // G3
    scale: MAJOR,
    progressions: [
      [{ root: 0, q: 'maj' }, { root: -3, q: 'min' }, { root: 2, q: 'min' }, { root: 7, q: 'dom' }],
      [{ root: 5, q: 'maj' }, { root: 4, q: 'min' }, { root: 2, q: 'min' }, { root: 7, q: 'dom' }],
      [{ root: 0, q: 'maj' }, { root: 5, q: 'maj' }, { root: 2, q: 'min' }, { root: 7, q: 'dom' }],
    ],
    parts: {
      bass: {
        mode: 'chord', wave: 'triangle', vol: 0.35, octave: -12, env: 'hold', cutoff: 1500,
        phrases: [
          '1 - - - 3 - - - 5 - - - 6 - - -',
          '1 - - - 5 - - - 8 - - - 5 - - -',
          '1 - - - 2 - - - 3 - - - 5 - - -',
        ],
      },
      epiano: {
        mode: 'chord', wave: 'triangle', vol: 0.09, octave: 0, env: 'pluck', cutoff: 2400, sparkle: true,
        phrases: [
          '1+3+5+7 - - - . . 1+3+5+7 - . . . . . . . .',
          '. . . . 3+5+7+8 - . . . . 3+5+7+8 - . . . .',
          '1+3+5+7 - . . . . . . 3+5+7+8 - . . . . . .',
        ],
      },
      melody: {
        mode: 'scale', wave: 'sine', vol: 0.35, octave: 12, env: 'hold', cutoff: 3000,
        phrases: [
          '4 - - - 2 - 4 - 5 - - - 4 - - - 2 - - - - - - - . . . . . . . .',
          '7 - - - 6 - - - 5 - 4 - 2 - - - 4 - - - - - - - . . . . . . . .',
          '. . 2 - 4 - 6 - 7 - - - - - - - 6 - 5 - 4 - - - 2 - - - - - - -',
          '9 - - - 7 - - - . . 6 - 7 - - - 4 - - - - - - - . . . . . . . .',
        ],
      },
      drums: {
        mode: 'drums', vol: 0.4,
        phrases: [
          'k . . w . . w . k . . w . . w .',
          'k . w . . w . . k . w . . w . .',
        ],
      },
    },
    form: [
      { bars: 4, parts: ['bass', 'epiano'] },
      { bars: 8, parts: ['bass', 'epiano', 'melody', 'drums'] },
      { bars: 8, parts: ['bass', 'epiano', 'drums'] },
      { bars: 8, parts: ['bass', 'epiano', 'melody', 'drums'] },
    ],
    flourishEvery: [4, 8],
    flourish: 'chime', // the elevator's ding
  },

  // Fast demoscene: tracker-style chip arpeggios, pulse bass, a busy lead. A minor.
  tracker: {
    id: 'tracker',
    gain: 1.6,
    name: 'Tracker',
    bpm: 132,
    key: 57, // A3
    scale: NATURAL_MINOR,
    progressions: [
      [am, f, g, em],
      [am, am, f, g],
      [f, g, am, am],
    ],
    parts: {
      chip: {
        mode: 'chord', wave: 'square', vol: 0.12, octave: 12, env: 'hold', cutoff: 3000, chipArp: true, sparkle: true,
        phrases: [
          '1 - - - - - - - 1 - - - - - - -',
          '1 - - - 1 - - - 1 - - - 1 - 1 -',
          '1 - - - - - 1 - - - 1 - - - - -',
        ],
      },
      bass: {
        mode: 'chord', wave: 'square', vol: 0.35, octave: -12, env: 'pluck', cutoff: 1200,
        phrases: [
          '1 . 1 8 . 1 8 . 1 . 1 8 . 1 8 .',
          '1 1 8 . 1 1 8 . 5 5 8 . 5 5 8 .',
          '1 . 8 . 1 . 8 . 1 . 8 . 5 . 8 .',
        ],
      },
      lead: {
        mode: 'scale', wave: 'square', vol: 0.2, octave: 12, env: 'hold', cutoff: 3200,
        phrases: [
          '0 2 4 - 7 - 4 2 0 - 2 - 4 - - - 3 4 3 1 0 - - - . . 7 - 6 - 4 -',
          '7 - 6 - 7 - 9 - 7 - 6 - 4 - - - 2 3 4 - 2 - 0 - 1 - 0 - - - . .',
          '4 - 4 5 4 - 2 - 0 - . . 0 2 4 - 5 - 4 - 2 - 4 - 7 - - - - - . .',
          '. . 0 - 2 - 3 - 4 - 3 - 2 - 0 - 4 - - - 6 - - - 7 - - - - - - -',
        ],
      },
      drums: {
        mode: 'drums', vol: 0.35,
        phrases: [
          'k . h h s . h . k k h . s . h h',
          'k . h . s . h k . k h . s h s s',
        ],
      },
    },
    form: [
      { bars: 4, parts: ['bass', 'drums'] },
      { bars: 8, parts: ['bass', 'chip', 'drums'] },
      { bars: 8, parts: ['bass', 'chip', 'lead', 'drums'] },
      { bars: 4, parts: ['chip'] },
      { bars: 8, parts: ['bass', 'chip', 'lead', 'drums'] },
    ],
  },

  // Dark ambient: low detuned drones, distant pings through the echo, no drums. E minor.
  undertow: {
    id: 'undertow',
    gain: 0.65,
    name: 'Undertow',
    bpm: 60,
    key: 52, // E3
    scale: NATURAL_MINOR,
    progressions: [
      [am, am, f, f],
      [am, d, am, f],
      [f, g, am, am],
    ],
    parts: {
      drone: {
        mode: 'chord', wave: 'sine', vol: 0.3, octave: 0, env: 'hold', cutoff: 1200, detune: 7,
        phrases: [
          '1+5 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -',
          '1+5+8 - - - - - - - - - - - - - - - 1+5 - - - - - - - - - - - - - - -',
        ],
      },
      low: {
        mode: 'chord', wave: 'triangle', vol: 0.3, octave: -12, env: 'hold', cutoff: 600, detune: 5,
        phrases: [
          '1 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -',
          '1 - - - - - - - - - - - - - - - 5 - - - - - - - - - - - - - - -',
        ],
      },
      pings: {
        mode: 'scale', wave: 'sine', vol: 0.35, octave: 24, env: 'pluck', cutoff: 5000, echo: true, sparkle: true,
        phrases: [
          '0 - - - . . . . . . . . . . . . . . . . . . . . . . . . . . . .',
          '. . . . . . . . 4 - - - . . . . . . . . . . . . 2 - - - . . . .',
          '. . . . . . . . . . . . . . . . 7 - - - . . . . . . 6 - - - . .',
          '. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .',
        ],
      },
    },
    form: [
      { bars: 8, parts: ['drone', 'low'] },
      { bars: 8, parts: ['drone', 'low', 'pings'] },
      { bars: 8, parts: ['drone', 'pings'] },
      { bars: 8, parts: ['drone', 'low', 'pings'] },
    ],
  },

  // An old message board: short square voices call and answer over a soft bass and key clicks. G major.
  forum: {
    id: 'forum',
    gain: 1.7,
    name: 'Forum',
    bpm: 90,
    key: 55, // G3
    scale: PENTA_MAJOR,
    progressions: [
      [{ root: 0, q: 'maj' }, { root: -3, q: 'min' }, { root: 5, q: 'maj' }, { root: 7, q: 'maj' }],
      [{ root: 0, q: 'maj' }, { root: 5, q: 'maj' }, { root: 0, q: 'maj' }, { root: 7, q: 'maj' }],
      [{ root: -3, q: 'min' }, { root: 5, q: 'maj' }, { root: 0, q: 'maj' }, { root: 7, q: 'maj' }],
    ],
    parts: {
      bass: {
        mode: 'chord', wave: 'triangle', vol: 0.3, octave: -12, env: 'hold', cutoff: 1400,
        phrases: [
          '1 - - - . . . . 5 - - - . . . .',
          '1 - - - . . 1 - 5 - - - . . . .',
          '1 - - - 3 - - - 5 - - - 3 - - -',
        ],
      },
      // The first voice posts in the first bar; the second replies in the next.
      voiceA: {
        mode: 'scale', wave: 'square', vol: 0.2, octave: 12, env: 'pluck', cutoff: 2000, sparkle: true,
        phrases: [
          '0 2 4 . 2 . . . . . . . . . . . . . . . . . . . . . . . . . . .',
          '4 . 4 3 2 . 3 . . . . . . . . . . . . . . . . . . . . . . . . .',
          '2 3 4 5 . . 4 . 2 . . . . . . . . . . . . . . . . . . . . . . .',
          '5 . 3 . 5 . 4 3 2 . . . . . . . . . . . . . . . . . . . . . . .',
        ],
      },
      voiceB: {
        mode: 'scale', wave: 'square', vol: 0.13, octave: 24, env: 'pluck', cutoff: 3000,
        phrases: [
          '. . . . . . . . . . . . . . . . 4 2 . 0 . . . . . . . . . . . .',
          '. . . . . . . . . . . . . . . . . . 2 . 2 3 4 . . . . . . . . .',
          '. . . . . . . . . . . . . . . . 0 . 0 . 1 2 . 0 . . . . . . . .',
          '. . . . . . . . . . . . . . . . 3 . . 2 . . 1 . 0 . . . . . . .',
        ],
      },
      drums: {
        mode: 'drums', vol: 0.45,
        phrases: [
          'k . c c . . c . k . . c c . c .',
          'k c . c c . . c . . c . c c . .',
          'k . c . c c c . k . . . c . c c',
        ],
      },
    },
    form: [
      { bars: 4, parts: ['bass', 'drums'] },
      { bars: 8, parts: ['bass', 'voiceA', 'voiceB', 'drums'] },
      { bars: 4, parts: ['voiceA', 'voiceB'] },
      { bars: 8, parts: ['bass', 'voiceA', 'voiceB', 'drums'] },
    ],
    flourishEvery: [12, 20],
    flourish: 'seek', // a disk seeking
  },
};

// Tracks the wardrobe can equip (the netrun theme is not one).
export const MUSIC_IDS = ['idle', 'nightdrive', 'dialup', 'lobby', 'tracker', 'undertow', 'forum'];

// How a state changes the sound. tempo and vol multiply; transpose is in semitones; cutoff caps
// every part's filter; mute drops parts; partVol scales single parts.
export const VARIANTS = {
  awake: {},
  sleep: { tempo: 0.8, transpose: -5, mute: ['drums'], partVol: { lead: 0.5 }, cutoff: 1200, vol: 0.6 },
  // Drafts to audition in the DEV panel (decision 6); not reached in play yet.
  alert: { tempo: 1.15, transpose: 2, doubleHats: true },
  flow: { sparkle: true },
};

// The netrun theme per region: the region's sound wave and pitch (REGIONS[*].sound) color the
// upper parts; the Deep slows down to bass and pings.
export function regionVariant(region, sound = { mult: 1, wave: 'square' }) {
  const transpose = Math.round(12 * Math.log2(sound.mult || 1));
  if (region === 'deep') return { wave: sound.wave, transpose: -5, tempo: 70 / 110, mute: ['pulse', 'lead', 'drums'], unmute: ['ping'], cutoff: 900 };
  return { wave: sound.wave, transpose };
}

// Everything the player needs to play one bar: bpm, transpose, volumes, filters, muted parts.
// A track's gain (default 1) evens out loudness between tracks, measured with tools/render-music.mjs.
export function musicSettings(trackId, variantId = 'awake', region = null, regionSound) {
  const track = TRACKS[trackId] ?? TRACKS.idle;
  const v = { ...(VARIANTS[variantId] ?? VARIANTS.awake), ...(track.id === 'netrun' ? regionVariant(region, regionSound) : {}) };
  const mute = new Set([...(track.mute ?? []), ...(v.mute ?? [])]);
  for (const p of v.unmute ?? []) mute.delete(p);
  return {
    track: track.id,
    bpm: track.bpm * (v.tempo ?? 1),
    transpose: v.transpose ?? 0,
    vol: (v.vol ?? 1) * (track.gain ?? 1), // gain: evens out loudness between tracks
    cutoff: v.cutoff ?? Infinity,
    mute,
    partVol: v.partVol ?? {},
    wave: v.wave ?? null, // replaces the wave of parts marked region: true
    doubleHats: Boolean(v.doubleHats),
    sparkle: Boolean(v.sparkle),
    sparkleParts: new Set(Object.keys(track.parts).filter((p) => track.parts[p].sparkle)),
  };
}

// What should be playing, from a snapshot of the app. null: silence.
// { alive, resting, runRegion, inGame, track, force: { variant, track, region } }
export function musicMode({ alive, resting, runRegion = null, inGame = false, track = 'idle', force = {} }) {
  if (!alive) return null;
  let mode;
  if (runRegion) mode = { track: 'netrun', variant: 'awake', region: runRegion, duck: 1 };
  else mode = { track: TRACKS[track] && track !== 'netrun' ? track : 'idle', variant: resting ? 'sleep' : 'awake', region: null, duck: inGame ? 0.7 : 1 };
  if (force.track) {
    const [t, region = 'public'] = force.track.split(':');
    mode = { ...mode, track: t, region: t === 'netrun' ? region : null };
  }
  if (force.variant) mode.variant = force.variant;
  return mode;
}

// --- the arranger ---

// A small seeded generator (mulberry32), kept here so this file has no imports.
function rng32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const tokens = (phrase) => phrase.trim().split(/\s+/);
export const phraseBars = (phrase) => tokens(phrase).length / STEPS;

// Semitones above the key root for one token, or null for a rest or hold.
export function tokenPitch(tok, part, chord, scale) {
  if (tok === '.' || tok === '-') return null;
  const low = tok.startsWith('_');
  const n = Number(low ? tok.slice(1) : tok);
  let semi;
  if (part.mode === 'chord') {
    const tones = CHORD_TONES[chord.q];
    const deg = ((n - 1) % 7) + 1;
    const idx = { 1: 0, 3: 1, 5: 2, 7: 3 }[deg];
    semi = chord.root + (idx === undefined ? DEGREES[deg] : tones[idx]) + 12 * Math.floor((n - 1) / 7);
  } else {
    const oct = Math.floor(n / scale.length);
    semi = scale[((n % scale.length) + scale.length) % scale.length] + 12 * oct;
  }
  return semi - (low ? 12 : 0);
}

// Notes of one bar of one phrase: [{ step, len, semi }] or, for drums, [{ step, drum }].
export function phraseNotes(phrase, barInPhrase, part, chord, scale) {
  const all = tokens(phrase);
  const out = [];
  for (let i = 0; i < all.length; i++) {
    const tok = all[i];
    if (tok === '.' || tok === '-') continue;
    const bar = Math.floor(i / STEPS);
    if (bar !== barInPhrase) continue;
    if (part.mode === 'drums') {
      out.push({ step: i % STEPS, drum: tok });
      continue;
    }
    let len = 1;
    while (all[i + len] === '-' && Math.floor((i + len) / STEPS) === bar) len++;
    // A chip arpeggio flutters through the chord's root, third and fifth.
    const arp = part.chipArp ? [0, CHORD_TONES[chord.q][1], 7] : undefined;
    for (const one of tok.split('+')) out.push({ step: i % STEPS, len, semi: tokenPitch(one, part, chord, scale) + (part.octave ?? 0), ...(arp ? { arp } : {}) });
  }
  return out;
}

// A stateful, deterministic arranger: next() returns the following bar.
// { bar, section, chord, phrases, events: [{ part, step, len, midi, vel } | { part, step, drum, vel } | { part: 'fx', kind, step, seed }] }
export function createArranger(trackId, seed = 1) {
  const track = TRACKS[trackId] ?? TRACKS.idle;
  const rand = rng32(seed);
  const pick = (n) => Math.floor(rand() * n);
  let bar = 0;
  let sectionIdx = -1;
  let sectionLeft = 0;
  let progression = track.progressions[0];
  const current = {}; // part -> { idx, bar }
  const last = {}; // part -> the phrase index it played last
  let nextFlourish = track.flourishEvery ? track.flourishEvery[0] + pick(track.flourishEvery[1] - track.flourishEvery[0] + 1) : Infinity;

  return {
    track,
    next() {
      if (sectionLeft === 0) {
        sectionIdx = (sectionIdx + 1) % track.form.length;
        sectionLeft = track.form[sectionIdx].bars;
        progression = track.progressions[pick(track.progressions.length)];
      }
      const section = track.form[sectionIdx];
      const barInSection = section.bars - sectionLeft;
      const chord = progression[barInSection % progression.length];
      const events = [];
      const phrases = {}; // part -> phrase index, for parts that started a new phrase this bar
      for (const name of section.parts) {
        const part = track.parts[name];
        const bars = phraseBars(part.phrases[0]);
        let cur = current[name];
        if (!cur || cur.bar >= bars) {
          // A new phrase, never the one just played.
          let idx = pick(part.phrases.length);
          if (part.phrases.length > 1 && idx === last[name]) idx = (idx + 1 + pick(part.phrases.length - 1)) % part.phrases.length;
          cur = current[name] = { idx, bar: 0 };
          last[name] = idx;
          phrases[name] = idx;
        }
        for (const n of phraseNotes(part.phrases[cur.idx], cur.bar, part, chord, track.scale)) {
          events.push(n.drum ? { part: name, step: n.step, drum: n.drum, vel: 1 } : { part: name, step: n.step, len: n.len, midi: track.key + n.semi, vel: 1, ...(n.arp ? { arp: n.arp } : {}) });
        }
        cur.bar++;
      }
      // Parts that sat out this section start a fresh phrase when they come back.
      for (const name of Object.keys(current)) if (!section.parts.includes(name)) delete current[name];
      if (--nextFlourish <= 0) {
        events.push({ part: 'fx', kind: track.flourish ?? 'modem', step: 8, seed: pick(1e9) });
        nextFlourish = track.flourishEvery[0] + pick(track.flourishEvery[1] - track.flourishEvery[0] + 1);
      }
      sectionLeft--;
      return { bar: bar++, section: sectionIdx, chord, phrases, events };
    },
  };
}

// No note goes under E2 (about 82 Hz): lower ones move up an octave, since small speakers drop them.
export const LOW_MIDI = 40;
export const floorMidi = (m) => (m < LOW_MIDI ? m + 12 * Math.ceil((LOW_MIDI - m) / 12) : m);

// Applies a state variant to one bar's events (pure): mutes, transposition, extra hats and the
// flow sparkle. Tempo, volume and filters are the player's job.
export function applyVariant(events, settings) {
  let out = events.filter((e) => !settings.mute.has(e.part)).map((e) => (e.midi === undefined ? { ...e } : { ...e, midi: floorMidi(e.midi + settings.transpose) }));
  for (const e of out) if (settings.partVol[e.part] !== undefined) e.vel *= settings.partVol[e.part];
  if (settings.doubleHats) {
    const taken = new Set(out.filter((e) => e.drum).map((e) => e.step));
    const extra = out.filter((e) => e.drum === 'h' && e.step + 1 < STEPS && !taken.has(e.step + 1)).map((e) => ({ ...e, step: e.step + 1, vel: 0.6 }));
    out = out.concat(extra);
  }
  if (settings.sparkle) {
    const arps = out.filter((e) => settings.sparkleParts.has(e.part) && e.midi !== undefined);
    out = out.concat(arps.filter((_, i) => i % 2 === 0).map((e) => ({ part: 'sparkle', step: e.step, len: 1, midi: e.midi + 12, vel: 0.5 })));
  }
  return out;
}

// The sparkle's sound (flow): not in any track's parts, so it is defined once here.
export const SPARKLE = { wave: 'sine', vol: 0.3, env: 'pluck', cutoff: 8000, echo: true };

// --- winding down to sleep ---

// Asleep (or napping), the music plays on for a while, fades, and ends on a chord that dies away,
// then stays quiet until it wakes (or the page is opened again). Seconds from the first sleep bar.
export const WIND_DOWN = { fadeFromS: 30, silentAtS: 60, finalMinS: 6, fadeTo: 0.45 };

// How a wind-down plays out for a bar length: whole bars while the final chord still has at least
// finalMinS to ring, then the chord. { bars, finalAtS }
export function windDownPlan(barS) {
  const bars = Math.max(0, Math.floor((WIND_DOWN.silentAtS - WIND_DOWN.finalMinS) / barS));
  return { bars, finalAtS: bars * barS };
}

// The closing chord: the last bar's chord as a low root, root, third and fifth (semitones above the key).
export function finalChord(chord) {
  const tones = CHORD_TONES[chord?.q] ?? CHORD_TONES.min;
  const root = chord?.root ?? 0;
  return [root - 12, root, root + tones[1], root + tones[2]];
}
