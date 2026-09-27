# Netling

A cyberpunk, Tamagotchi-style virtual pet. It lives in real time (even while closed), evolves based on how you raise it, and flatlines if neglected. Each death leaves a fragment that shapes the next generation.

No build step, no dependencies: vanilla JS modules + canvas.

> **AI disclosure:** this game was made with AI. Most of its code, tests, pixel art and text were written by an AI model (Anthropic's Claude, through Claude Code) under human direction and review. It's a hobby project: review anything you reuse from it.

## Run

```bash
npm run serve        # http://localhost:5174
npm test             # simulation + mini-game logic
npm run smoke        # drives the real app in headless Chromium (needs Playwright, see below)
npm run balance      # simulate hundreds of lifetimes per player archetype (DETAIL=1 for more)
```

`npm run smoke` needs Playwright, which the app itself doesn't depend on: `npm install --no-save playwright && npx playwright install chromium`. CI (`.github/workflows/test.yml`) runs both test suites on every pull request and push to `main`.

New saves open with a short onboarding: an accidental script run, the field manual as its README, a nudge to explore, and a scripted tutorial netrun that ends with a party hat. Add `?dev` to the URL for time-skip, forced-evolution, and forced-trace buttons. RESET replays the onboarding. `gallery.html` shows every sprite.

## System: transfer, hibernate, restart

ARCHIVE → **SYSTEM**:

- **Transfer out** makes a code (`NL1.…`) and a **QR code** holding everything (netling, lineage, dex, codex, style, progress), then **locks this device**. The lock screen only offers re-export (show the code/QR again), reload (load a code, e.g. to bring it back) or restart. The lock is for moving a netling, not copy protection: it only stops *this* device from playing. Codes work offline, so nothing marks one as used: the same code can be loaded on more than one device, and reloading it here brings the netling back even if the other device already loaded it. Scanning the QR opens the game with `#import=<code>`, straight to the import preview. The code rides in the URL fragment, so it's never sent to a server.
- **Bring one here** loads a code, a QR link or a file. Codes are compressed and checksummed; a damaged paste is rejected, and everything inside is checked and repaired before it's stored. Loading previews what's inside first, and either all of it is written or none of it is (a full disk changes nothing).
- **Hibernate** freezes the clock for a long break: nothing drains or ages. It lasts at least 24 hours and needs 3 days to recover after waking, so it's for vacations, not skipping a work day. Hibernating and transferring out both wait until a running mini-game or netrun is finished.
- **Restart** erases everything and replays the onboarding.
- **Storage** shows whether the browser has agreed to keep the data (the game asks for persistent storage), and warns if a save has failed (a full or blocked disk). If a saved netling ever can't be read, it's set aside instead of overwritten, a new one compiles, and SYSTEM offers the old save as a download. iPhone/iPad Safari players get a one-time prompt to Add to Home Screen, since Safari clears site data after about a week without a visit.
- **Volume** slider (the header's SND toggle still mutes).

Only one tab looks after the netling at a time (Web Locks, or a lease in `localStorage` on browsers without them): other tabs show a guard screen, take over automatically when the caretaker tab closes, or can take over on request. The home screen redraws at ~10 fps to save battery; mini-games and netruns run at full rate. The Archive's LINEAGE tab opens with a lifetime RECORD (lives, care, games, netruns), and inventory items can be discarded.

## Install / offline

It's a PWA: use the browser's "Install app" (desktop Chrome or Edge), "Add to Dock" (Safari, macOS 14+) or "Add to Home Screen" (iOS/Android). A network-first service worker caches the app shell, so it plays offline. On a Steam Deck, install it from Chrome in Desktop Mode, then add it to Steam as a non-Steam game to play in Game Mode.

On wide, short screens (Steam Deck, laptops) the screen sits beside the controls so everything fits without scrolling; phones and tall windows keep the one-column layout.

**Controllers** work with no setup: in mini-games and netruns the d-pad or left stick moves, A confirms and B quits; elsewhere the d-pad moves between buttons, A presses and B backs out or closes a dialog. Browsers only see a controller after one of its buttons is pressed on the page.

**Deploying:** `.github/workflows/pages.yml` publishes the game to GitHub Pages whenever the test workflow passes on `main` (Settings > Pages > Source: GitHub Actions, once). Only the files the game loads are published. [`docs/PLATFORMS.md`](docs/PLATFORMS.md) covers native apps.

Notifications (toggle **ALERTS** in the header) fire while the app is open or backgrounded. A fully closed app can't be woken without a push server; that's out of scope for this static build.

## Layout

| Path | What |
|---|---|
| `src/sim.js` | All game rules. Pure functions of `(state, time, rng)`; minute-by-minute `tick()` |
| `src/render.js`, `src/sprites.js` | 40×28 LCD renderer and code-drawn pixel sprites |
| `src/games/` | Breach Protocol, Firewall Dodge, Signal Tune + intro/result session wrapper |
| `src/main.js` | Boot: load saved data, claim the caretaker tab, wire the UI, run the clock and render loop |
| `src/ui/` | The UI, one module per area: `hud` (vitals, log, inventory), `life` (tick, evolution, flatline, care buttons), `play` (mini-games, netruns), `style` (unlocks, wardrobe), `archive`, `onboarding` (intro, field manual), `system` (transfer, import, hibernate, restart), `tabs` (one active tab). `ui/app.js` holds the shared state |
| `src/storage.js` | Every `localStorage` read and write. One gate refuses writes from a tab that isn't the caretaker or a page about to reload; failed writes are reported; imports are written all-or-nothing |
| `src/sanitize.js` | Checks and repairs stored data and imported codes before the game uses them, so a damaged save or hostile code can't break loading. Imported codes keep only fields the game knows |
| `src/lease.js` | The one-active-tab rule for browsers without Web Locks |
| `src/ui/gamepad.js` | Controller input (Gamepad API): game controls in sessions, focus navigation in menus |
| `tools/smoke.mjs` | Browser smoke test (`npm run smoke`): onboarding, care, games, netruns, transfer, hostile imports, two tabs, full or blocked storage, offline, crash recovery, controllers, screen sizes |
| `src/netrun/` | Netrun regions, map generation, rules, anomalies, codex lore, and the run view |
| `src/accessories.js` | Accessory art, sprite anchor detection, rarity rolls |
| `src/transfer.js` | Transfer codes: compress, checksum, validate, summarize |
| `src/qr.js` | Dependency-free QR encoder (byte mode, level L, versions 1–40) |
| `src/cosmetics.js` | Wardrobe items, hinted unlock conditions, mini-game streaks |
| `src/archive.js` | Lineage records and the form dex (ARCHIVE button) |
| `src/notify.js`, `sw.js`, `manifest.webmanifest` | PWA + notifications |
| `tools/make-icons.mjs` | Regenerates `icons/*.png` from the Bitling sprite |

## Rules at a glance

- **Stats:** Charge, Sync, Integrity, Heat, Cache. A need left unmet for 15 minutes (60 for sleeping with the lights on) is a care mistake; 10 mistakes, 2 hours at zero Integrity, or 7 days of age ends the run.
- **Rest:** it sleeps at night on its own; stats drain at 25% of the awake rate with the lights off, 50% with them on. **NAP** rests it on demand for up to 2 hours at 35% drain (time still passes; it can't eat, play or jack in), with 4 hours awake before the next nap. Lights off while it's awake darkens the screen and makes it bored (Sync drains faster).
- **Evolution:** Bitling → teen at 24h (Kernel for good care, Stub otherwise) → adult at 72h, chosen by two hidden axes:
  - *Allegiance* (corp packets, complying with traces ↔ scavenged data, hiding) → **Chrome** / **Firewall**
  - *Stability* (prompt patches, purges ↔ overheating, mistakes) → **Daemon** / **Glitch**
  - **Ghost** is secret: neutral allegiance, non-negative stability, ≤1 mistake, and 22+ mini-game wins (4+ in each game).
- **Items:** 6-slot inventory. Mini-game wins (25%), hiding (30%) and complying (30%) can drop items; each adult form leaves a keepsake item for the next generation. Coolant cell, Antivirus patch (6h shield), Corp voucher (full Charge + waves off a trace), Black ICE shard (big Sync, risky), Signal booster (next win x2), Memory shard (rewrites a quirk). Tap a slot, then USE.
- **Netrun:** jack in (awake, 30+ Charge, 4h cooldown) and pick a path across a fogged node map. Moves cost Charge and add Heat (90+ Heat also burns Integrity). Caches may hold items, ICE is a mini-game that bites on a loss, Relays recharge and let you bank loot, the Exit banks everything plus a bonus. Hitting 0 Integrity or Charge disconnects: loot lost, a care mistake (never the fatal one), emergency reboot. Choice nodes: Checkpoints (hide/comply/voucher, lean the allegiance axis), Markets (spend Charge on items), Anomalies (risky events that lean the axes). Adult forms get run abilities, listed in the Dex. Regions: Public Net (any stage), Corp Grid and Darknet Bazaar (teen+), Old Web Ruins (adult), and a hidden fifth region. Runs also recover **codex fragments** (22, 4–5 per region) in story order, shared across generations and readable in the Archive's CODEX tab; like loot, they're lost on a disconnect. A clean jack-out re-syncs half the Integrity the run cost; each region has its own sound. `npm run balance` includes netruns in the lifetime simulation (`NO_RUNS=1` to compare). Completing the codex earns **Root Access** from NL-0: a netling's first premature flatline is reversed (old age is not); after a rescue NL-0 rests for one generation, and new scripts can roll NL-0's origin palette. `ROOT=1 npm run balance` measures it. `node tools/netrun-balance.mjs` checks risk/reward.
- **Style:** the Archive's STYLE tab holds cosmetic shells, screen tints, screen effects, sound packs (home sounds; netruns keep region voices) and a device label (earned when the first netling dies), unlocked by raising forms, finishing codex regions, full-life streaks, mini-game win streaks, care habits and netrun feats. Locked items show only a hint. **Accessories** (20, common to very rare) fit every form via anchors computed from each sprite; they're mostly bought at netrun markets for Charge, and rarely found in caches, exits and ICE wins (lost on disconnect like loot). Half are regional: corp mods in the Corp Grid, street mods in the Darknet Bazaar, relics in the Old Web Ruins, and one companion only in The Deep. **Props** (cyberdeck, boom box, mini device, plush) sit on the ground beside the pet in their own slot. Some items are **earned**, never sold: a party hat when your first netling hatches, a bandage for surviving a disconnect or an NL-0 rescue, a plush of your previous netling after the first goodbye, and a secret for collecting every shell. Purely visual; shared across generations.
- **Lineage:** each generation inherits its predecessor's form trait and one of its quirks. The **ARCHIVE** lists every generation and a dex of the 8 forms; undiscovered forms show only a silhouette and a hint.

## Balance targets

`tools/balance.mjs` plays full lifetimes with scripted players (they never nap). Current results (300 runs each):

| Player | Check-ins | Reaches adult | Full 7-day life |
|---|---|---|---|
| attentive | hourly, 7:00–23:00 | 98% | 95% |
| casual | 6 a day | 88% | 67% |
| worker | before work, lunch, evenings | 78% | 54% |
| neglectful | twice a day | 7% | 0% (dies ~day 1) |

Deliberate strategies each reach their form: all-corp + comply → Chrome 100%, all-scavenged + hide → Firewall 99%, running hot and sloppy → Glitch 55%, tidy and neutral → Daemon 83%, balanced + 22 wins → Ghost 98%. Ghost by accident: ≤1%.
