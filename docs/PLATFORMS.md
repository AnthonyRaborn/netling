# Platform plan

How Netling gets from "a folder of static files" to apps on Android, Windows, macOS and Linux (Steam Deck), in order of effort. Estimates are from reading the code; none of the wrappers in tier 2 have been built or tested yet.

**Status (confirmed by the maintainer):** Tier 1 is live. The game is published at https://anthonyraborn.github.io/netling, pushes to `main` update it, and the installed PWA picks up the updates. A manual install on macOS worked. Installing and playing on Android, Windows and the Steam Deck has **not** been tested, and everything in tier 2 is a stretch goal, not planned work.

Test devices available: Android phone, Windows PC, Mac, Steam Deck (the only Linux device).

## Tier 1: GitHub Pages + installable web app

**Effort:** a day or two. **Cost:** none.

Netling is already an installable web app (PWA): `manifest.webmanifest` has relative `start_url` and `scope`, `sw.js` caches every module for offline play, and all paths are relative, so it works under a `username.github.io/netling/` subpath.

| Platform | How to install | Notes |
|---|---|---|
| Android | Chrome: "Install app" | Home-screen icon, full screen, offline |
| Windows | Chrome or Edge: "Install" | Own window, Start menu entry |
| macOS | Chrome, or Safari "Add to Dock" (macOS 14+) | Firefox can't install web apps |
| Steam Deck | Chrome (Flatpak) in Desktop Mode, install, then add to Steam as a non-Steam game | Plays in Game Mode |

### Steps

- [x] **Deploy workflow.** `.github/workflows/pages.yml`: after the test workflow passes on a push to `main`, copies only the files the game loads (no `tests/`, `tools/`, `docs/`, or the spoiler-heavy `gallery.html`) and deploys to GitHub Pages. Can also be run by hand (Actions > pages > Run workflow). Checked locally: the game works from a `/netling/` subpath, with the service worker and manifest scoped to it. The workflow has run: the site is live and follows `main`.
- [x] **Enable Pages** (repo owner, one time): Settings > Pages > Source: **GitHub Actions**. Done.
- [x] **Landscape and large-screen layout.** On landscape screens at least 860px wide and at most 1000px tall, the screen sits on the left and everything else on the right. Fits without scrolling at 1280x800 (Deck), 1366x768 and 1024x768, including the region list, game pad, dialogs and intro. Phones and 1080p windows keep the one-column layout. The manifest keeps `"orientation": "portrait"`: it only affects installed apps on phones and tablets, where portrait is the right layout for phones.
- [x] **Gamepad support.** `src/ui/gamepad.js`: in mini-games and netruns, d-pad/left stick left/right, A, B to quit; elsewhere the d-pad moves focus between buttons (dimmed or covered controls are skipped), A presses, B closes a dialog or backs out of a submenu, left/right adjust the volume slider. Focused controls now show a yellow outline (keyboard users get it too).
- [x] **Smoke test**: a fake controller drives menus and a mini-game; the Deck and laptop sizes are checked for no scrolling, and a phone size for the one-column layout. All scenarios pass (41 at last count).
- [x] **Install and update on macOS**: installing works, and the installed PWA receives updates.
- [ ] **Install and play on the other devices** (manual, stretch goal): Android, Windows, Steam Deck Desktop Mode and Game Mode. On the Deck, check that Steam Input passes the controller through as a gamepad (the default "Gamepad" layout for non-Steam games should).

## Tier 2: native apps

Stretch goals. Only worth it for store listings, proper installers, or notifications while the app is closed.

### Android

| Option | Effort | Gains | Catches |
|---|---|---|---|
| Trusted Web Activity (Bubblewrap) | 1 to 2 days | Play Store listing, wraps the hosted site | Needs `/.well-known/assetlinks.json` at the **domain root**, so a custom domain or a `username.github.io` user site, not a project page |
| Capacitor | 3 to 5 days | Play Store, plus **scheduled local notifications** (e.g. predict when Charge runs low and alert even when closed) | More native tooling to maintain |

Play Store: $25 one time. New personal accounts had to run a closed test (12 testers, 14 days) before publishing when last checked; confirm the current rule.

### Windows, macOS, Linux

| Option | Installer size | Engine | Risk |
|---|---|---|---|
| Electron | ~100 MB | Bundled Chromium, same everywhere | Low: matches what the smoke test already covers |
| Tauri | a few MB | System webview: WebView2 / WebKit / WebKitGTK | Transfer codes need `CompressionStream`; not certain every WebKitGTK version has it. Linux is the platform with the least testing |

Recommendation: Electron, for consistency on a Linux target that can only be tested on a Steam Deck. Either way, GitHub Actions can build all three (macOS runners included). Estimate: 3 to 5 days including CI.

### Code changes either wrapper needs

- ~~Bundle the VT323 font locally.~~ Done: it is served from `fonts/` (KI-06), so wrappers need nothing extra.
- Notifications through the wrapper's API. `registerServiceWorker()` already fails quietly where service workers don't run.
- Save data is per app; transfer codes and the QR already move a netling between devices.

### Signing

- **macOS:** unsigned apps are blocked by Gatekeeper. Apple Developer Program ($99/year) for signing and notarization.
- **Windows:** unsigned installers show SmartScreen warnings. Signing certificate, or the Microsoft Store.
- **Linux:** AppImage or Flatpak, no signing.

## Order of work

1. Tier 1: done and live. Testing on Android, Windows and the Steam Deck remains (stretch).
2. Android via Capacitor, if closed-app notifications matter (stretch).
3. Desktop wrappers, if store listings or installers matter (stretch).
