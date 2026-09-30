# Music plan

Background music, synthesized in code. **Phases 1 and 2 are built** (release `netling-v43`): the engine, the controls, the sleep variant and its wind-down, the netrun theme, the DEV audition row, and all seven home tracks in the wardrobe's `music` slot. Phase 3 (alert and flow reactions) is still a plan. Once built, it becomes a reference doc (`MUSIC.md`) of facts and open questions, like [ATTENTION.md](ATTENTION.md). Spoiler-heavy, like the rest of `docs/`.

## Decisions (from the maintainer, 2026-09-30)

1. **Synthesized in code**, with a cyberpunk and old-computer feel. No audio files.
2. **No autoplay.** Music starts on the first user gesture, the same tap that already unlocks sound effects.
3. **On by default at 40%**, with its own volume slider.
4. **Pause while the page is hidden.** Keep playing behind menus and dialogs (Style, Archive, System).
5. **Mini-games keep the home music.** Netruns have their own theme, which the wardrobe does not change.
6. **The music reacts to state.** Sleep comes first (softer, lower). Alerts (faster, higher) and flow come later, after the maintainer has heard them.
7. **Unlockable tracks in the STYLE menu**, with milestones proposed below.
8. **Plan first**, then build.

Decided 2026-09-30, after the draft below:

9. **The unlock milestones are approved**, plus a sixth track for chatter: **Forum**.
10. **The track feels are approved**, the netrun theme's included.
11. **Mini-games duck the music by 30%.**
12. **Existing players get music at 40% too** after the update.

## Controls

| Control | Now | Proposed |
|---|---|---|
| Header `SND ON/OFF` | Mutes every sound | Still the master switch: music and effects |
| SOUND panel, `VOLUME` | Effects, default 80% | Renamed `EFFECTS`, unchanged |
| SOUND panel, `MUSIC` | none | New slider, default 40%. At 0 the scheduler stops completely, which saves battery |

- New pref `musicVolume` (0 to 1, default 0.4), cleaned in `cleanPrefs`. Existing players get 40% too, so the first update after this ships plays music. This follows decision 3; it can be set to 0 in one move.
- At 100%, music peaks at about the level of a quiet sound effect. At 40% it sits well under the effects, so alerts and game sounds still come through.

## How it plays

### Engine

- **`src/tracks.js`** (new, pure data and pure functions, no Web Audio): each track is a tempo, a key, instrument settings and a bank of short phrases (1 or 2 bars each, note lists). `createArranger(track, seed).next()` returns the notes for the next bar, and `musicMode(snapshot)` decides what should play. Tests and a Node script can run it without a browser.
- **`src/music.js`** (new, Web Audio only): a lookahead scheduler. A timer every 50 ms queues any bar that starts in the next 300 ms at exact `AudioContext` times. This is the standard way to keep time steady in a browser without drift.
- **Shared context.** `audio.js` exports its `AudioContext` (`audioContext()`); the music has its own master gain on it, and effects are unchanged. `SND OFF` mutes both and stops the scheduler.
- **Level** (`MUSIC_LEVEL = 0.08`): at the default 40% the Idle loop measures RMS 0.010 and peaks at 0.042, the netrun theme RMS 0.005 to 0.007; a square sound effect at the default 80% peaks at 0.048 (`tools/render-music.mjs` prints these).
- **Low-note floor**: no note plays under E2 (about 82 Hz); lower ones move up an octave, as failure sounds do in `audio.js`.
- **Instruments**: oscillators (square, triangle, sawtooth, sine), the existing band-passed noise for hats and snares, and one lowpass filter per track. There are 4 or 5 voices at most, and each note is a short-lived oscillator, as the effects already are. A `DelayNode` echo is used only by the tracks that need one.

### Keeping it listenable for hours

A pet game stays open for a long time, so a fixed loop would wear thin. Each track has a phrase bank of 4 to 8 phrases per part (bass, lead, drums), and the arranger:

- picks the next phrase with a seeded RNG, never the same lead phrase twice in a row,
- plays in sections of 8 or 16 bars (intro, main, breakdown with the lead dropped, back to main),
- adds a rare flourish every 16 to 32 bars: a modem handshake squeal, a disk-seek click run, a short arpeggio.

The seed comes from the netling's quirk, so two netlings on the same track do not play exactly the same.

### When it plays

| Screen or moment | Music |
|---|---|
| Before the first gesture | Silent (decision 2) |
| Home, awake | The equipped track |
| Home, asleep or napping | The same track, sleep variant, winding down to silence within 60 s (below) |
| Menus and dialogs | Keeps playing (decision 4) |
| Mini-game | The home track keeps playing, 30% quieter while the game runs so its sounds read clearly |
| Netrun, including ICE fights | The netrun theme (below) |
| Evolution strobe | Home track ducks to 30% under the evolve jingle for 2.4 s |
| Flatline | Fades out over 2 s; silent until the next netling boots |
| Page hidden | Fades out over 0.3 s and the scheduler stops; on return it fades back in where the track left off |
| Compiling (the first 3 minutes of a new netling) | Silent, like a flatline: the music starts when it comes online |
| A waiting tab, or a netling transferred away | Silent |

A change of state (falling asleep) takes effect at the next bar and settles over about 2 seconds. A change of track (a netrun) crossfades over 0.8 s.

### Sleep variant (decision 6, first pass)

- Tempo x0.8, transposed down a fourth (5 semitones); the bass floor lifts its lowest notes.
- Drums drop out; the lead plays at half level through a lowpass at about 1.2 kHz.
- Volume x0.6.
- **Winds down** (maintainer, after listening): full level for 30 s, then a fade to 45% while the bars finish, then one closing chord (low root, root, third and fifth of the last bar's chord, triangle) that fades to silence at 60 s. After that it stays quiet until it wakes. Coming back to the page while it still sleeps plays the wind-down once more. `WIND_DOWN` in `tracks.js`; tested in `music.test.js`.

### Later reactions (decision 6, to audition first)

| State | Proposed change |
|---|---|
| Open alert or event | Tempo x1.15, up a whole tone, hats double time |
| Flow | An extra high sparkle layer (sine arpeggio with echo); tempo and key unchanged |

Both are built as drafts but not reached in play. To judge them, the DEV panel (test mode, or `?dev`) has a `MUSIC` row that forces a track (Idle, or the netrun theme in any region) and a state (awake, sleep, alert, flow). Nothing is shown to players. `node tools/render-music.mjs <dir>` also renders every track and state to WAV files.

## Tracks

As built (keys and more detail in [CONTENT_CATALOG.md](CONTENT_CATALOG.md#music-7)). Each track has a `gain` that evens out loudness: at 40% every track measures RMS 0.007 to 0.010 with peaks of 0.042 to 0.062 (`tools/render-music.mjs`).

| Id | Name | Feel | Tempo | Sound |
|---|---|---|---|---|
| `idle` | Idle loop | Calm home chiptune (free, the default) | 84 | Triangle bass on root and fifth, soft square arpeggio, quiet noise hats, the odd modem flourish |
| `nightdrive` | Night drive | Synthwave | 100 | Sawtooth pad chords with a slow filter sweep, driving octave bass, gated noise snare |
| `dialup` | Dial-up | Old web, lonely | 72 | Sparse sine and triangle melody, tape hiss, handshake chirps between phrases |
| `lobby` | Corp lobby | Elevator music, a little ironic | 96 | Triangle "electric piano" seventh chords, walking bass, woodblock clicks |
| `tracker` | Tracker | Fast demoscene | 132 | Square lead, classic three-note chip arpeggios, pulse bass, noise kit |
| `undertow` | Undertow | Dark ambient | 60 | Low detuned sine drones, distant echoing pings, no drums |
| `forum` | Forum | Old message board, chattering | 90 | Short square "voices" answering each other, soft bass, keyboard-click hats |

**Netrun theme** (not a wardrobe item, decision 5): minor key, 110 BPM, a steady pulse bass and a tense two-note lead. Each region colors it with the wave and pitch it already has for its sounds (`REGIONS[*].sound`), so the Corp Grid rings in triangle and the Bazaar buzzes in sawtooth. The Deep drops to 70 BPM, bass and pings only.

## Unlock milestones (proposed)

A new wardrobe slot, `music`, uses the existing cosmetics system (hint while locked, `check(ctx)` to unlock). The aim is one early unlock to show the slot exists, then one milestone for each part of the game, avoiding the exact milestones other cosmetics already use.

| Track | Hint while locked | Unlocked by | Roughly when |
|---|---|---|---|
| Idle loop | none | free | from the start |
| Night drive | "pass it on." | generation 2 or later (the first netling has ended) | end of the first life |
| Dial-up | "read ten pages of the old net." | 10 codex fragments across lives (of 22; the Codex caps at 8 a life) | two or three lives of netruns |
| Corp lobby | "eat what the grid serves, twenty-five times." | 25 corp meals, all lives (`progress.acts.corp`) | a few days for a licensed feeder |
| Tracker | "a hundred and fifty games, win or lose." | 150 games played (Arcade needs 50) | several lives |
| Undertow | "come back from the bottom three times." | 3 exits from the Deep (Static needs 1) | late game |

| Forum | "hear twenty-five things it says to itself." | 25 chatter lines heard across lives (`progress.chatter`, of 50) | an attentive player's first few lives |

Forum (decision 9) is the attention-rewards track: a chattering old message board, overlapping short square "voices" that answer each other over a soft bass.

## Save and code notes

- The slot id `music` and the track ids are permanent (CLAUDE.md rule 1). `DEFAULT_WARDROBE.music = 'idle'`; the wardrobe cleaner already drops unknown ids and falls back to the default, and the new slot needs to be added there with a test. No `SAVE_VERSION` bump: these are additions.
- `musicVolume` is a pref, so it is not transferred with the netling (same as `volume`).
- The music is presentation only: nothing in `sim.js` or `netrun/run.js` changes, and the balance baselines do not move.
- New files `src/tracks.js` and `src/music.js` go in the `sw.js` `SHELL`; bump `CACHE` and `VERSION`.
- **iOS**: Web Audio follows the ringer switch on some iOS versions, so music can be silent when the phone is on silent. The existing effects already behave this way; the README should mention it.

## Tests

- **Unit** (`tests/music.test.js`): every track's phrases fit their bar lengths and note ranges; the arranger is deterministic for a seed and never repeats a lead phrase back to back; the sleep variant slows down and transposes down; `musicMode(state, screen)` (pure) picks the right track and variant for home, asleep, game, netrun and flatline; `cleanPrefs` defaults and clamps `musicVolume`; wardrobe and unlock checks for the new slot.
- **Smoke**: no `AudioContext` before the first gesture; music nodes are scheduled after it; the scheduler stops when `visibilitychange` reports hidden, and when the MUSIC slider is at 0; a netrun switches to the netrun theme.
- **By ear**: tests cannot judge whether it sounds good. Each phase ends with the maintainer listening through the DEV panel.

## Phases

1. **Built.** Engine, controls, the Idle loop, the sleep variant, the netrun theme and the DEV audition row, for the maintainer to listen to.
2. **Built.** The six unlockable tracks, the `music` wardrobe slot and the unlocks. The phrase language grew for them: several notes at once (`1+3+5`), passing notes in chord parts (2, 4, 6), chip arpeggios, detuned drones, a filter sweep, key clicks, woodblock and tape hiss, and two more flourishes (a disk seek for Forum, an elevator ding for Corp lobby).
3. Alert and flow reactions, after auditioning in the DEV panel.

## Questions for the maintainer

All answered (decisions 9 to 12). The alert and flow reactions wait for a listen (decision 6).
