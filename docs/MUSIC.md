# Music

Background music, synthesized in code (`src/tracks.js`, `src/music.js`, `src/ui/soundtrack.js`). This file holds the principles, how it plays, the tracks and their unlocks, and what is open. Spoiler-heavy, like the rest of `docs/`.

## Principles

1. **Synthesized in code**, with a cyberpunk and old-computer feel. No audio files.
2. **No autoplay.** Nothing plays before the first tap or key press anywhere on the page.
3. **On by default at 40%**, existing players included, with its own MUSIC slider. At 0 the scheduler stops completely.
4. **Pauses while the page is hidden; keeps playing behind menus.**
5. **Mini-games keep the home track, 30% quieter.** Netruns play their own theme, whatever is equipped.
6. **It follows the netling's state**: softer and winding down to silence asleep, faster and higher during an alert, sparkling in flow.
7. **Effects stay on top.** At 40% the music peaks at about one sound effect's level and averages about 14 dB under it.

## Controls

| Control | Effect |
|---|---|
| Header `SND ON/OFF` | Mutes music and effects |
| SYSTEM, `EFFECTS` | Sound effects volume (`prefs.volume`, default 0.8) |
| SYSTEM, `MUSIC` | Music volume (`prefs.musicVolume`, default 0.4; 0 is off) |
| STYLE, `MUSIC` | The home track (wardrobe slot `music`); picking one crossfades to it at once |
| DEV row (test mode or `?dev`) | Forces any track (the netrun theme in any region too) and any state, for listening; not saved |

## When it plays

| Moment | Music |
|---|---|
| Before the first tap or key press | Silent |
| Home, awake | The equipped track |
| Home, an open alert | The alert variant |
| Home, in flow | The flow variant |
| Home, asleep or napping | The sleep variant, winding down to silence within 60 s |
| Menus and dialogs | Keeps playing |
| Mini-game (PLAY or DEFEND) | The home track, 30% quieter |
| Netrun, ICE fights included | The netrun theme, colored by the region |
| Evolution strobe | Drops to 30% for 2.4 s under the evolve jingle |
| Flatline | Fades out over 2 s; silent until the next netling comes online |
| Compiling (a new netling's first 3 minutes) | Silent |
| Page hidden | Fades out over 0.3 s and stops; on return it fades back in |
| A waiting tab, or a netling transferred away | Silent |

At home the state picks the variant in this order: **resting, then an open alert, then flow, then awake.** An open alert is anything `alertReason` reports (an event, a virus, Charge or Sync under 20, Heat over 80, cache piling up, lights on at bedtime). Sleep beats an alert, so the lights-on alert at bedtime does not undo the wind-down. A state change takes effect at the next bar and settles over about 2 s; a track change crossfades over 0.8 s.

## Variants

| Variant | Change |
|---|---|
| `sleep` | Tempo x0.8, a fourth lower, no drums, the lead at half level, a lowpass at 1.2 kHz, volume x0.6. **Winds down**: full level for 30 s, a fade to 45% while the bars finish, then one closing chord (the last bar's chord, triangle) that fades to silence at 60 s. Quiet after that until it wakes; coming back to the page while it sleeps plays the wind-down once more (`WIND_DOWN`) |
| `alert` | Tempo x1.15, a whole tone higher, hats doubled |
| `flow` | A high sine sparkle with echo doubles every other note of the parts marked `sparkle` |

## How it plays

- **`tracks.js`** is pure (no Web Audio): tracks as phrase banks, a seeded arranger (`createArranger(id, seed).next()` returns one bar of notes), the variants (`musicSettings`), what should play (`musicMode`) and the wind-down plan. The phrase language is described at the top of the file.
- **`music.js`** plays it on the shared `AudioContext` from `audio.js`: a 50 ms timer queues any bar that starts within 300 ms at exact audio-clock times. `renderMusic` renders into any context, which `tools/render-music.mjs` uses to write WAV files.
- **`ui/soundtrack.js`** builds the snapshot for `musicMode` from the app once a second and on the first tap.
- **Variety over hours**: each part has several phrases; the arranger never plays a part's phrase twice running, moves through sections (intro, main, breakdown), picks a chord progression per section, and some tracks add a flourish every few bars. The seed comes from the netling, so no two netlings play a track exactly alike.
- **Level**: `MUSIC_LEVEL = 0.08`, and a per-track `gain` evens tracks out. At 40% every home track measures RMS 0.007 to 0.010 with peaks of 0.042 to 0.062; a square sound effect at the default 80% peaks at 0.048.
- **Low-note floor**: no note under E2 (about 82 Hz), since small speakers drop lower notes; lower ones move up an octave.

## Tracks

Keys, tempos and unlocks are also in [CONTENT_CATALOG.md](CONTENT_CATALOG.md#music-7). Track ids are permanent.

| Id | Name | Sound | Flourish | Unlocked by | Hint |
|---|---|---|---|---|---|
| `idle` | Idle loop | Calm chiptune: triangle bass, soft square arpeggio, a lead, quiet drums | A short modem squeal every 16 to 32 bars | free | |
| `nightdrive` | Night drive | Synthwave: sawtooth pads with a slow filter sweep, octave bass, arpeggio, echoing lead | none | Generation 2 | "pass it on." |
| `dialup` | Dial-up | Old web: sparse sine melody with echo, soft chords, tape hiss | A full modem handshake (dialing, answer tone, data warbles, screech, hiss) every 4 to 6 bars | 10 codex fragments | "read ten pages of the old net." |
| `lobby` | Corp lobby | Elevator music: seventh chords, walking bass, woodblock | An elevator ding every 4 to 8 bars | 25 corp meals | "eat what the grid serves, twenty-five times." |
| `tracker` | Tracker | Demoscene: fluttering chip arpeggios, pulse bass, busy lead | none | 150 games | "a hundred and fifty games, win or lose." |
| `undertow` | Undertow | Dark ambient: detuned sine drones, echoing pings, no drums | none | 3 exits from the Deep | "come back from the bottom three times." |
| `forum` | Forum | A message board: two square voices post and reply, key clicks | A disk seek every 12 to 20 bars | 25 chatter lines heard | "hear twenty-five things it says to itself." |

**Netrun theme** (`netrun`, not a wardrobe item): E minor, 110 BPM, pulse bass, a tense two-note lead, drums. Each region colors the upper parts with the wave and pitch of its sound effects (`REGIONS[*].sound`): Corp Grid rings in triangle, the Bazaar buzzes in sawtooth. The Deep slows to 70 BPM with only bass and far-off pings.

## Saves

- Wardrobe slot `music` (default `idle`); unknown ids fall back to the default. No `SAVE_VERSION` bump.
- `prefs.musicVolume`; prefs are not transferred with the netling.
- Presentation only: nothing in `sim.js` or `netrun/run.js` changed, and the balance baselines did not move.

## Tests

- `tests/music.test.js`: phrase and form checks, the arranger (seeded, no phrase twice running, flourish spacing, the low-note floor in every variant and region), each variant, the wind-down, the netrun theme per region, `musicMode`'s priorities, and the player against a fake `AudioContext`.
- `tests/cosmetics.test.js`: each track's unlock threshold and the wardrobe slot.
- Smoke: no audio before a gesture, hidden and menus, the sliders and SND, the mini-game duck, the netrun theme, sleep, alert, flow, equipping a track in STYLE, and the DEV row.
- The trailer (`tools/make-trailer.mjs`) mutes the music in its scenes, since each is a fresh page and the music would restart at every cut, and lays one continuous take from `renderMusic` under the whole trailer instead, following the table above. After the next generation hatches it plays Night drive, the track that generation unlocks.
- By ear: `node tools/render-music.mjs <dir>` renders every track and variant at the game's own level, with `reference-effects.wav` to compare.

## Open

- **iOS**: Web Audio follows the ringer switch on some iOS versions, so music (like the effects) can be silent on a silenced phone. Not checked on a device; the README mentions it.
- **Battery**: music keeps the audio clock running while the page is open. Not measured on a phone; MUSIC at 0 stops it.
- **A lasting alert keeps the music fast.** Low Charge or Sync can last a long time for a player who leaves the app open; the alert variant plays until it is dealt with. Not heard in a long session yet.
