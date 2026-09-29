# Architecture

How Netling is put together: what each file owns, how data flows, how the page boots, and the rules that keep it safe. Written against commit `ea87757`.

Netling is a static web app: vanilla ES modules, HTML and CSS, canvas rendering. There is no build step, no bundler and no runtime dependency (the VT323 font is served from `fonts/`). It is served as plain files and installs as a PWA.

## Contents

1. [Design principles](#design-principles)
2. [Repository map](#repository-map)
3. [Layers and dependencies](#layers-and-dependencies)
4. [Boot sequence](#boot-sequence)
5. [The frame loop and the clock](#the-frame-loop-and-the-clock)
6. [Shared UI state](#shared-ui-state)
7. [Rendering](#rendering)
8. [Accessibility](#accessibility)
9. [Mini-games and netruns as sessions](#mini-games-and-netruns-as-sessions)
10. [One active tab](#one-active-tab)
11. [Offline, the service worker, and deploys](#offline-the-service-worker-and-deploys)
12. [Input](#input)
13. [Audio and notifications](#audio-and-notifications)
14. [Crash containment](#crash-containment)
15. [Tools and CI](#tools-and-ci)

## Design principles

These explain most decisions in the code.

1. **The simulation is pure.** `sim.js` and `netrun/run.js` take `(state, time, rng)` and return results. They never touch the DOM or storage. Tests and the balance tools drive them directly.
2. **The netling lives in real time.** State stores timestamps and ages; loading catches the simulation up minute by minute (`tick`).
3. **Never trust stored data.** Every read goes through a sanitizer. A damaged save is set aside, not overwritten.
4. **Only one writer.** A single gate decides whether this tab may write storage.
5. **A crash must not freeze the game.** Frame and input errors are caught; a broken mini-game or run is closed, not left on screen.
6. **No build.** A contributor can edit a file and reload. Consequently the service worker keeps a hand-written file list (checked by a test).

## Repository map

| Path | Owns |
|---|---|
| `index.html` | All markup: the device, dialogs (archive, system, field manual, NL-0 transmission), lock screens |
| `style.css` | All styling (about 1550 lines), theme variables in `:root`, one landscape media query, calm mode (`body.calm` and the reduced-motion query) |
| `sw.js`, `manifest.webmanifest`, `icons/`, `screenshots/` | PWA shell (the screenshots are for the install dialog) |
| `gallery.html` | Sprite and accessory gallery for development (contains spoilers; not deployed) |
| `src/sim.js` | All game rules, `CFG`, items, forms, traits, `tick`, `act` |
| `src/random.js` | The shared weighted-pick helper |
| `src/migrations.js` | Save upgrade steps (`STEPS`) and `upgradeSave` |
| `src/render.js`, `src/sprites.js` | The 40x28 LCD renderer and the code-drawn pixel art |
| `src/accessories.js` | Accessory and prop art, anchor detection, rarity rolls |
| `src/cosmetics.js` | Wardrobe items, hinted unlock conditions, mini-game streaks |
| `src/archive.js` | Lineage records and the form dex (pure data helpers) |
| `src/games/` | Four mini-games plus `session.js` (intro, result card) and `common.js` (drawing helpers) |
| `src/netrun/` | `run.js` rules, `map.js`, `regions.js`, `anomalies.js`, `codex.js`, `view.js` (drawing and input) |
| `src/storage.js` | The `localStorage` wrapper, key list and the write gate hook |
| `src/sanitize.js` | Cleaners for every stored or imported value |
| `src/transfer.js`, `src/qr.js` | Transfer codes and the QR encoder |
| `src/lease.js` | Fallback one-tab lease for browsers without Web Locks |
| `src/audio.js`, `src/notify.js` | WebAudio blips and local notifications |
| `src/wake.js` | Keeping the screen on (Screen Wake Lock), re-asked after the page was hidden |
| `src/version.js`, `src/update.js` | The page's release name, and noticing a newer release while the page is open |
| `src/main.js` | Boot, settings buttons, dev bar, the render loop |
| `src/ui/` | DOM behaviour, one module per area (below) |
| `tests/` | 26 unit test files (plus `tests/fixtures/` and `tests/helpers/`), run with `node --test` |
| `tools/` | Browser smoke test, balance simulators, icon and screenshot generators |
| `.github/workflows/` | `test.yml` (unit and smoke tests) and `pages.yml` (deploy) |
| `docs/` | This documentation |

### `src/ui/` modules

| Module | Responsibility |
|---|---|
| `app.js` | Shared state object `app`, the storage gate, `loadAll`, clock (`now`), test mode switches, small DOM helpers (`$`, `flashStatus`, `armed`, `playAnim`) |
| `life.js` | `advance()` (tick and react to changes), evolution and flatline handling, next generation, care buttons |
| `hud.js` | Stat bars, readout line, event bar, log, inventory panel, alerts |
| `play.js` | Mini-game picker and launch, DEFEND, region picker and jack-in, keyboard and pad input, `dropSession` |
| `archive.js` | The Archive dialog (lineage, record, dex, codex), codex inbox draining, NL-0 transmission |
| `style.js` | Wardrobe UI, unlock checks, earned items, accessory inbox draining |
| `onboarding.js` | The field manual, intro terminal, nudge, tutorial run |
| `system.js` | SYSTEM dialog: transfer out, lock screen, import, hibernate, restart, storage note, volume, test mode |
| `tabs.js` | The one-active-tab rule |
| `gamepad.js` | Controller input |
| `device.js` | The app icon badge and the screen wake lock, synced once a second; the SCREEN settings (MOTION, KEEP SCREEN ON) and calm mode |

## Layers and dependencies

```
                      main.js
                         |
   ui/*  (DOM, storage, session wiring; may import anything below)
     |
     +--> render.js, sprites.js, audio.js, notify.js   (drawing and output)
     +--> games/*, netrun/view.js                       (sessions)
     +--> transfer.js, qr.js, storage.js, lease.js      (data movement)
     |
   sanitize.js, archive.js, cosmetics.js                (data rules, pure)
     |
   netrun/run.js, map.js, regions.js, anomalies.js, codex.js
     |
   sim.js  ---> accessories.js
```

Rules of thumb:

- Nothing below `ui/` imports from `ui/`.
- `sim.js` imports only `accessories.js` (visitors wear accessories).
- `sanitize.js` imports the tables it validates against (`sim`, `cosmetics`, `accessories`, `codex`, `regions`, `anomalies`), which is why adding an id to a table automatically makes it valid.
- `archive.js` imports `FORM_ABILITIES` from `netrun/run.js` for the dex.
- The `ui/` modules import each other in cycles (`play` and `onboarding`, `life` and `system`, ...). This works because they only call each other's functions at runtime, never at module load. Keep it that way: do not use an import at the top level of a `ui/` module.

## Boot sequence

`main.js` is an ES module using top-level `await`. In order:

1. `loadAll()`: read and repair all stored data. Writes nothing.
2. Apply saved volume and mute.
3. `initLife`, `initInventory`, `initPlay`, `initArchive`, `initOnboarding`, `initSystem`, `initTabs`, `initGamepad`: attach event listeners.
4. Settings buttons (sound, alerts), service worker registration, and the dev bar if `DEV`.
5. `await claimTab()`: wait until this tab knows whether it is the caretaker. Until then the gate refuses all writes. If it lost, `becomeInactive()` shows the guard screen.
6. In test mode, persist the clock anchor. Show the test badge.
7. If the save was unreadable, store the raw text under `netling.corruptSave` and show a message.
8. Backfill the dex from older saves, then `protectStorage()` (ask for persistent storage, retried on the first tap).
9. `checkUnlocks` (silent on the very first run of a save), `applyWardrobe`, show the lock screen if `app.lock`, handle an `#import=` link.
10. Persist onboarding state and start the intro or the field manual if due.
11. `advance()`, drain the codex and accessory inboxes, `backfillEarned()`.
12. Show the flatline screen if dead, or resume an open netrun.
13. `setInterval(advance, 1000)` and start the `requestAnimationFrame` loop.

## The frame loop and the clock

Two independent loops:

- **Simulation**: `advance()` every 1000 ms, on `visibilitychange`, and before every player action. It calls `tick`, reacts to stage changes (boot chime, evolution flash, flatline handling), fires the surge and visitor effects, refreshes the HUD, and saves at most every 5 seconds (`SAVE_EVERY_MS` in `ui/life.js`; actions save immediately and `flushSave` runs when the page is hidden or closing). It also closes any session that belongs to a dead or replaced netling (`closeStaleSession`).
- **Drawing**: `requestAnimationFrame`. The next frame is booked before drawing so one failed frame cannot stop the loop. The home screen redraws at about 10 fps (`IDLE_FRAME_MS = 100`) unless an animation, flash or surge is running; sessions run at full rate. Calm mode (`app.calm`) stills the LCD; see Accessibility below.

`now()` in `ui/app.js` is the game clock: real time plus dev skew, or the scaled test clock. Always use `now()`, never `Date.now()`, for anything the simulation sees.

## Shared UI state

`app` in `ui/app.js` is a plain object, deliberately not reactive. It holds:

- Loaded data: `state` (the live netling), `prefs`, `progress`, `wardrobe`, `unlocked`, `codex`, `dex`, `ownedAccessories`, `lineage`, `onboarding`.
- Mode flags: `claimed`, `inactive`, `leaving`, `lock`, `writeFailed`, `skew`, `testClock`.
- The running `session` (mini-game or netrun view), or `null`.
- Render bookkeeping: last stage, last log key, flash timers, `anim`.

Modules read and mutate it directly. After changing the netling, call `save()` and `updateHUD()`. The HUD skips work when nothing it shows has changed (log key, inventory key).

Data that outlives a generation is kept outside the netling and updated by the UI, not by `sim.js`: lineage (only `onFlatline` in `life.js` appends), dex (`recordForm`), codex and accessories (via the inbox arrays on the netling that run.js fills), unlocks, progress.

## Rendering

- **Home LCD**: `renderLCD()` draws a 40x28 buffer (`LCD_W`, `LCD_H`) from code-drawn sprites, then the visible canvas scales it up with nearest-neighbour. Layers: background (tint, darker with lights off), the pet or compile bar, accessory and prop, cache icons, event icons, reboot bar, visitors, action reaction animations, evolution strobe, then screen effects (scanlines, glitch when Integrity is low or infected, overheat wash, surge flash).
- **Sprites** (`sprites.js`) are arrays of strings using `#` main color, `o` accent, `+` highlight, `.` empty. Poses are looked up by `formSprite(form, pose)`: `A`, `B`, `Sleep`, `Dead`, with fallback to `A`. Colors come from the netling's palette quirk.
- **Accessories** are drawn by `accessories.js` through anchors computed from each sprite's own pixels (`anchorsFor`: head top, eye row, mouth, body span), so every accessory fits every form. Props draw on the ground at the right edge.
- **Mini-games and netruns** draw straight onto the 400x280 canvas via `common.js` helpers (`clear`, `text`, `timerBar`). The wardrobe tint feeds `setGameBg`.
- **Idle motion** is a pure function of time (`wanderPos`), so it needs no stored state.

## Accessibility

- **Flash safety**, in every motion setting: an on/off strobe toggles no faster than `FLASH_TOGGLE_MS` (200 ms, in `games/common.js`; 2.5 flashes a second, under the usual limit of three). The evolution strobe, Firewall Dodge's loss blink and Packet Feast's strike blink use it. The glitch picks a new look every `GLITCH_STEP_MS` (350 ms) from a seeded sequence instead of every frame, and a power surge is one white flash that fades over `SURGE_MS` (`opts.surge` runs 1 to 0). `tests/draw.test.js` checks the home screen.
- **Calm mode** (`ui/device.js` `applyMotion`): the MOTION setting in SYSTEM (`prefs.motion`: `auto`, `reduce`, `full`). AUTO follows `prefers-reduced-motion` and updates when it changes. Calm sets `app.calm` (the LCD drops the glitch, wobble, reaction bounces and heat pulse, and the surge becomes a steady faint wash) and `body.calm` (no CSS animation or transition). FULL sets `body.motion-full`, which the reduced-motion media query respects, so the page is calm before the script runs. Mini-games keep their motion.
- **Screen readers**: the stat bars and cache are `role="meter"` with `aria-valuenow` and an `aria-valuetext` that adds "low", "too hot" or "piling up". The LCD canvas is `role="img"` with a summary label (form, awake or asleep, lights, infection, the current need; a session says what is on screen). A new need is written to a polite live region (`#sr-announce`) as the chirp plays; timed events are left to the event bar (`role="alert"`). The log is a polite live region, so new lines are appended (`renderLog`) instead of rebuilding it, and only rebuilt for a new netling.
- **Danger is not color-only**: a stat in danger also gets diagonal stripes and a `!` beside its label (`.stat.danger`).
- **Contrast**: `--dim` text is `#809fa6`, at least 4.5:1 on the standard shell and the dark shells' main tones (the light shells set their own dark `--dim`).

## Mini-games and netruns as sessions

`app.session` holds either a `GameSession` (wraps a game with an intro card and a result card) or a `RunView`. Both expose `input(key)`, `update(dt)`, `draw(ctx, pal, time)` and `forfeit()`, so `ui/play.js`, the keyboard handler, the on-screen pad and the gamepad treat them the same. Keys are normalized to `left`, `right`, `a` (and `b` from a controller, which means quit).

Mini-game contract (`src/games/*.js`): a class with static `id`, `title`, `hint`, `winText`, `loseText`; a constructor `(rng, sound)`; `input(key)`, `update(dt)`, `draw(ctx, pal, time)`; and `done` and `won` flags. To add one, see [CONTRIBUTING.md](CONTRIBUTING.md).

The result of a PLAY game goes through `act('play', ...)` after the session ends, so the simulation can still refuse it (for example, the netling fell asleep meanwhile).

## One active tab

Two tabs simulating the same save would overwrite each other. `ui/tabs.js` makes one tab the **caretaker**:

- **Web Locks** (`navigator.locks`): the tab holds the `netling-active-tab` lock for its lifetime. Others queue behind it, show the guard screen, and reload as caretaker when the lock frees. "USE IT HERE" steals the lock.
- **Lease fallback** (`lease.js`) for browsers without Web Locks: a `{ id, at }` record in `localStorage`, refreshed every 2 seconds. It counts as free when absent, when it is ours, when it is older than 120 seconds, or when it claims a time more than 120 seconds in the future. Two tabs opening together can both see it free; the last write wins after a 150 ms settle.
- Only the caretaker writes (`canWrite`). A tab that takes over sets `leaving` and reloads so its stale state is never saved.

## Offline, the service worker, and deploys

- `sw.js` is **network-first**: it fetches every same-origin GET and stores a copy; if the network fails it answers from cache. So an installed app always gets the newest files when online and still boots offline. Files other than the page itself are fetched with `cache: 'no-cache'` (the browser revalidates, usually a 304), and install pre-caches with `cache: 'reload'`, so the browser's HTTP cache (GitHub Pages allows 10 minutes) can't mix old and new files after a release.
- Install pre-caches the `SHELL` list. `addAll` fails as a whole if any listed file 404s, so a missing or misspelled entry breaks installation. `tests/shell.test.js` follows the static `import`/`export ... from` graph from `src/main.js` and checks that every module it reaches is listed (icons and other non-module assets are not checked). **When you add a file, add it to `SHELL`.**
- `CACHE` (`netling-v35`) is a manual release name, and `VERSION` in `src/version.js` must equal it (`tests/shell.test.js` checks). **Bump both on every release.** Bumping drops old caches on activate, and the changed `sw.js` is how an open page learns about the release.
- **Update prompt** (`update.js`): the new worker takes control at once (`skipWaiting`, `clients.claim`). On each `controllerchange` the page asks the new controller for its `CACHE` name (a `version?` message); a name that differs from the page's `VERSION` shows the NEW VERSION READY bar. The first install and a reload that already runs the new code report the page's own name, so they stay quiet. The page asks the browser to look for a new `sw.js` every hour and when it becomes visible again (at most every 15 minutes); browsers also look on each navigation. RELOAD saves first and is refused while a mini-game or netrun is on screen (the same rule as transfers); LATER hides the bar until the next release. A release that doesn't change `sw.js` is still picked up on the next launch, just not offered to an open page.
- Notification clicks focus an open window or open the app.
- `pages.yml` deploys to GitHub Pages after `test.yml` succeeds on `main`. It copies only `index.html`, `style.css`, `sw.js`, `manifest.webmanifest`, `icons`, `fonts`, `screenshots` and `src`, so tests, tools, docs and the spoiler gallery stay out. All paths in the app are relative so it works under a `/netling/` subpath.
- Native wrappers (Capacitor, TWA, Tauri) are planned but not built. See [PLATFORMS.md](PLATFORMS.md).

## Input

- **Keyboard**: arrows move, Space, Enter, Z, X are A, Escape quits the session.
- **On-screen pad**: `data-key` buttons on `pointerdown`.
- **Controller** (`ui/gamepad.js`): standard mapping (buttons 0 A, 1 B, 12 to 15 d-pad, left stick with a 0.5 threshold). In a session: left/right and A go to the game, B quits. In menus: the d-pad moves focus between usable buttons in the topmost dialog or overlay, A presses, B closes or backs out, left/right adjust the volume slider. Polling starts on `gamepadconnected`; browsers only report a pad after a button press.
- **Layout**: the one-column phone layout is the default; landscape screens at least 860 px wide and at most 1000 px tall put the screen beside the controls (Steam Deck, laptops).

## Audio and notifications

- `audio.js` synthesizes everything with WebAudio (`blip`, `noise`); sound effects are note patterns keyed by name (`PATTERNS`). The netling's `pitch` quirk transposes them and the sound pack (wave and multiplier) shapes them. Failure sounds (`error`, `hit`, `lose`) are moved up an octave if they would drop under 350 Hz, because phone speakers lose low notes. Audio is unlocked on the first user gesture.
- **Badge** (`notify.js` `setBadge`, driven by `ui/device.js` once a second): with ALERTS on and permission granted, the installed app's icon shows a plain badge whenever `needsAttention` is true (the same test as the blinking icon), and it is cleared otherwise, when ALERTS goes off, or while the netling is on another device. It is only set on a change, and the first sync clears a badge left from the last session. It cannot change while the app is fully closed, so it shows the state at closing. A waiting tab leaves it to the caretaker.
- **Wake lock** (`wake.js`, driven by `ui/device.js`): held while a mini-game or netrun is on screen, or always while the page is visible if the player turned on KEEP SCREEN ON in SYSTEM (`prefs.awake`). The browser drops it when the page is hidden; the next sync asks again once visible. A refusal waits 30 seconds before asking again.
- Notifications are local only (`notify.js`): they fire while the app is open or backgrounded, through the service worker's `showNotification` when available. A fully closed app cannot be woken without a push server, which this static build does not have.

## Crash containment

- The frame loop catches errors: during a session it calls `dropSession(err)`; on the home screen it logs each distinct error once.
- `sendInput` wraps pad and key input in the same net.
- `dropSession` closes the session. If a netrun was open it is aborted (loot lost) so it cannot crash again on resume, and onboarding is finished if it was the tutorial.
- Storage, decode and import failures are reported and never thrown into the UI (see [DATA_AND_SAVES.md](DATA_AND_SAVES.md)).

## Tools and CI

- `npm test` runs `node --test` over `tests/*.test.js` with `TZ=UTC`.
- `npm run smoke` drives the real app in headless Chromium with Playwright (43 scenarios).
- `npm run balance` and `node tools/netrun-balance.mjs` are Monte Carlo balance simulators.
- `npm run serve` serves the folder on port 5174 with Python's `http.server`.
- CI (`test.yml`) runs on pull requests and pushes to `main`: Node 22, unit tests, then Playwright 1.56.1 and the smoke test.

Details are in [TESTING.md](TESTING.md).
