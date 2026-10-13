# Netling 2.0 deployment plan

How Netling 2.0 reaches players, decided with the maintainer on 2026-10-13 before the app is built. Nothing here is built or tested yet. Where a claim about a tool or platform is from general knowledge rather than a test, it says so; check those against current docs when the work starts. For 1.0 (a PWA on GitHub Pages) see [PLATFORMS.md](../PLATFORMS.md).

## Decided

1. **Targets:** Android, Windows, macOS, Linux (the Steam Deck). iOS is out for now.
2. **Native apps are the only way to play 2.0.** No 2.0 PWA or hosted web build. The game stays a plain web core (vanilla ES modules, canvas, no build step). Native shells wrap it. `npm run serve` stays as the development and smoke-test route, not a player route. 1.0's PWA is unaffected.
3. **Android: Capacitor, sideloaded** (APK on GitHub Releases). No Play Store for now.
4. **Desktop: Tauri,** with the **desktop pet window in the first release** and a **true portable mode** (below).
5. **Closed-app notifications by forecast, with the seed re-randomized at every open** (below). This is an engine rule in the 2.0 sim, not a wrapper feature.
6. **Android widget: a static snapshot first**, with a short frame loop as a stretch goal.
7. **A new repository** for the 2.0 app (not yet created). The prototype in `prototype/netling2/` and 1.0's `src/` here are its starting points.
8. **1.0 saves do not carry over** to 2.0. No import path, no migration from 1.0's save format.

Why Capacitor on Android and not Tauri everywhere: Capacitor's local-notification plugin is mature (scheduling, channels, inexact alarms). Tauri 2's mobile plugins are younger. The widget is native Kotlin in either case. Tauri wins on desktop: small builds and built-in transparent, borderless, always-on-top windows.

## The forecast and the seed

Stage care relies on notifications while the app is closed (the rest call; the Events, Care and Cooldowns classes; [STAGE_CARE_DRAFTS.md](../archive/netling2/STAGE_CARE_DRAFTS.md), 2.6). No shell runs the game's JS reliably in the background, and 1.0 rolls events with `Math.random` during catch-up, so nothing knows ahead of time when an event will happen. The design:

1. **On going to the background,** draw a fresh seed (`crypto.getRandomValues`) and store it in the save. Simulate forward from the current state with an RNG built from that seed over a fixed **horizon of 36 hours** (decided; an unattended netling is not expected to last much past 24 hours unless hibernated, and 36 leaves a margin). The player cannot act while the app is closed, so the forecast is exact. Schedule a notification for each notifying item in it, within the per-class rules and the budget of 6 a day for Events.
2. **On reopening,** catch-up runs the elapsed time with the same seeded RNG, so it reproduces the forecast exactly. Then the seed is discarded, every pending notification is cancelled, and play continues on a fresh seed.
3. **Past the horizon,** catch-up keeps rolling with the stored seed's RNG, and that time gets no notifications. A player gone that long already has worse problems than a missed alert. A hibernating netling's clock is frozen, so its forecast is empty and it schedules nothing.

Properties:
- The future is fixed only for the time the app is closed, and the seed changes at every open. A player who reads their own save can predict up to the horizon, not further. A per-day seed chain would be weaker, since every later seed would follow from one value.
- Only the seed (and the horizon's end) is stored, not the forecast's outcomes, so there is no outcome list to tamper with. A tampered seed only picks a different random future. That is acceptable for a single-player game, but the seed still needs a `clean*` function like any stored value.
- The sim stays pure, `(state, now, rng)`, so tests and the balance tools drive it as before.
- **Test to add first:** for random states and gaps, the forecast's events equal what catch-up produces, notification by notification. If those ever disagree, a notification announces an event that never happens.
- Clock changes: notifications carry absolute times. A clock that jumps is handled like 1.0's catch-up handles it (see [KNOWN_ISSUES.md](../KNOWN_ISSUES.md)); reopening cancels and reschedules regardless.

Android limits (general knowledge, to confirm in the spike): Android 14 and later deny exact alarms by default to apps that are not clocks or calendars, and Doze batches inexact alarms. Expect notifications up to several minutes late. That is fine against event windows of 60 or 30 minutes, but a notification must never claim a precise time.

Desktop: OS notifications fire only while the app is running. The pet window and a tray icon keep it running, so the desktop schedules from the same forecast while the app is open and the window is hidden. A fully closed desktop app sends nothing.

## Android widget

Home-screen widgets cannot host a webview.
- **Snapshot (first release):** on going to the background (and after each catch-up), the app renders the LCD frame to a PNG and writes a small status file: the bars, the form, and the next forecast item if any. A Kotlin widget shows them and opens the app on tap. The system refreshes widgets at most about every 30 minutes, so the forecast also lets the widget show the right frame for "now" between opens.
- **Motion (stretch):** widgets cannot play a GIF. A `ViewFlipper` in the widget's `RemoteViews` can step through 2 to 4 rendered frames (a blink, a bob) on a timer, animating only while the home screen is visible. Keep the frame interval slow, well under `FLASH_TOGGLE_MS`'s limit (rule 7: nothing flashes more than three times a second). Untested. Some launchers may treat it differently, so check it on the maintainer's phone before promising it.

## Desktop: the pet window and portable mode

**Pet window.** A second window with only the LCD: transparent, borderless, always on top and draggable, with a tray icon that opens the full window. It is driven by the same game state as the main window. One instance owns the save and the other view follows it. 1.0's lease logic is the model. Caveat (general knowledge): transparency and always-on-top vary on Linux, especially under Wayland. On the Deck the pet may only work in Desktop Mode, and Game Mode gets the normal window.

**Running without installing.**

| Platform | Form | Catch |
|---|---|---|
| Windows | A folder or zip with the `.exe` (Tauri embeds the game files) | Needs the WebView2 runtime. Windows 10 and 11 normally have it. Where it is missing or disabled, a separate build with a fixed-version runtime in the folder would be needed (Tauri sets this at build time; it adds well over 100 MB); only make that variant if a real machine needs it. An unsigned exe shows a SmartScreen warning. |
| macOS | A `.app` in a zip, run from any folder | Unsigned: first launch needs right-click > Open. macOS runs a quarantined app from a hidden read-only copy (App Translocation), so portable saves beside the app only work once the app is moved by the user or the quarantine flag is cleared; fall back to the normal location otherwise. |
| Linux / Deck | AppImage: mark executable and run; add to Steam as a non-Steam game | General knowledge: Tauri's AppImage bundles WebKitGTK, so it is large. Not verified in Game Mode. |

**Portable mode (decided).** The marker is a folder named `netling-data` next to the program, the way VS Code's portable mode uses its `data` folder. If it exists, everything goes into it instead of the OS's app data folder: the save, and the webview's own data folder (Tauri lets a window's webview data directory be set). To make this clean, saves on desktop go through a file backend behind the existing `store` abstraction (rule 4 already routes every write through it), not the webview's `localStorage`. Android can use the same backend shape (Capacitor Filesystem or Preferences), which also guards against a webview data clear.

Portable is not a separate build: the portable download is the same program zipped with an empty `netling-data` folder beside it, and the normal download leaves the folder out. Creating the folder makes an install portable; moving or deleting it stops that, and deleting it deletes those saves (say so in the release notes or readme).

**Locked-down work computers (the maintainer's Windows work machine).** Best effort; failing there is acceptable. Likely blockers: AppLocker or WDAC policies that refuse unsigned executables from user folders; WebView2 missing or disabled by policy (the bundled fixed runtime helps with that one only); SmartScreen set to block rather than warn. Native-only means there is no browser fallback. Signing would help with the first and third and costs money (see Signing).

## Distribution and signing

- **Android APK:** every APK must be signed, even when sideloaded. **The release keystore must be kept safe and backed up outside the repo.** If it is lost, installed copies cannot be updated, and players would have to uninstall (losing local saves unless they used a transfer code first). Keep the keystore and its passwords out of git; CI gets them as encrypted secrets.
- **Android developer verification** (general knowledge, check the current rules): Google is rolling out a requirement that apps installed on certified Android devices, sideloaded ones included, come from a verified developer, starting with some regions in 2026 and widening in 2027. This may require registering even for GitHub Releases distribution.
- **Desktop:** unsigned builds for now (SmartScreen and Gatekeeper warnings; `PLATFORMS.md`, Signing, has the costs). Linux needs no signing.
- **Builds:** GitHub Actions can build all desktop targets (macOS runners included) and the APK, attaching them to a GitHub Release per version. Version and update flow: a release replaces 1.0's `VERSION`/`sw.js` cache bump. The apps can check GitHub Releases for a newer version and show a notice (no auto-update in the first release).

## Open questions

- The new repository's visibility. Leaning private (maintainer). Recommendation: private source plus a separate public repository (or an itch.io page) that only holds releases, since a private repository's release files cannot be downloaded by players. Private repositories also have limited free Actions minutes, with macOS runners billed at a multiple (general knowledge, check current GitHub pricing); building the Mac app on the maintainer's Mac is the fallback.

## Build order

1. **Engine:** seeded RNG and the forecast in the 2.0 sim (`prototype/netling2/sim/` first), with the forecast-equals-catch-up test.
2. **Android spike:** a Capacitor shell loading the web core; schedule notifications from a forecast; check on the maintainer's phone with exact alarms denied and the phone in Doze. This is the riskiest piece, so it comes early.
3. **Storage backends** behind `store`: file on desktop (with portable mode), Filesystem or Preferences on Android.
4. **Desktop shell:** Tauri main window, pet window, tray, portable mode; builds in Actions.
5. **Widget:** snapshot, then the frame loop.
6. **Release pipeline:** signed APK, desktop artifacts, GitHub Releases, update notice.
7. **Device pass** on the Android phone, Windows PC, Mac and Steam Deck (Desktop and Game Mode), plus a best-effort try on the locked-down work machine.
