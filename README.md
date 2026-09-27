# Netling

A cyberpunk, Tamagotchi-style virtual pet. It lives in real time (even while closed), evolves based on how you raise it, and flatlines if neglected. Each death leaves a fragment that shapes the next generation.

No build step, no dependencies: vanilla JS modules + canvas.

## Run

```bash
npm run serve        # http://localhost:5174
npm test             # simulation + mini-game logic
npm run balance      # simulate hundreds of lifetimes per player archetype (DETAIL=1 for more)
```

New saves open with a short onboarding: an accidental script run, the field manual as its README, a nudge to explore, and a scripted tutorial netrun that ends with a party hat. Add `?dev` to the URL for time-skip, forced-evolution, and forced-trace buttons. RESET replays the onboarding. `gallery.html` shows every sprite.

## System: transfer, hibernate, restart

ARCHIVE → **SYSTEM**:

- **Transfer out** makes a code (`NL1.…`) and a **QR code** holding everything (netling, lineage, dex, codex, style, progress), then **locks this device**. The lock screen only offers re-export (show the code/QR again), reload (load a code, e.g. to bring it back) or restart. Scanning the QR opens the game with `#import=<code>`, straight to the import preview. The code rides in the URL fragment, so it's never sent to a server.
- **Bring one here** loads a code, a QR link or a file. Codes are compressed and checksummed; a damaged paste is rejected. Loading previews what's inside first.
- **Hibernate** freezes the clock for a long break: nothing drains or ages. It lasts at least 24 hours and needs 3 days to recover after waking, so it's for vacations, not skipping a work day.
- **Restart** erases everything and replays the onboarding.

## Install / offline

It's a PWA: use the browser's "Install app" (desktop Chrome) or "Add to Home Screen" (iOS/Android). A network-first service worker caches the app shell, so it plays offline.

Notifications (toggle **ALERTS** in the header) fire while the app is open or backgrounded. A fully closed app can't be woken without a push server; that's out of scope for this static build.

## Layout

| Path | What |
|---|---|
| `src/sim.js` | All game rules. Pure functions of `(state, time, rng)`; minute-by-minute `tick()` |
| `src/render.js`, `src/sprites.js` | 40×28 LCD renderer and code-drawn pixel sprites |
| `src/games/` | Breach Protocol, Firewall Dodge, Signal Tune + intro/result session wrapper |
| `src/main.js` | UI wiring, save/load (`localStorage`), prefs, notifications |
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
- **Evolution:** Bitling → teen at 24h (Kernel for good care, Stub otherwise) → adult at 72h, chosen by two hidden axes:
  - *Allegiance* (corp packets, complying with traces ↔ scavenged data, hiding) → **Chrome** / **Firewall**
  - *Stability* (prompt patches, purges ↔ overheating, mistakes) → **Daemon** / **Glitch**
  - **Ghost** is secret: neutral allegiance, non-negative stability, ≤1 mistake, and 22+ mini-game wins (4+ in each game).
- **Items:** 6-slot inventory. Mini-game wins (25%), hiding (30%) and complying (30%) can drop items; each adult form leaves a keepsake item for the next generation. Coolant cell, Antivirus patch (6h shield), Corp voucher (full Charge + waves off a trace), Black ICE shard (big Sync, risky), Signal booster (next win x2), Memory shard (rewrites a quirk). Tap a slot, then USE.
- **Netrun:** jack in (awake, 30+ Charge, 4h cooldown) and pick a path across a fogged node map. Moves cost Charge and add Heat (90+ Heat also burns Integrity). Caches may hold items, ICE is a mini-game that bites on a loss, Relays recharge and let you bank loot, the Exit banks everything plus a bonus. Hitting 0 Integrity or Charge disconnects: loot lost, a care mistake (never the fatal one), emergency reboot. Choice nodes: Checkpoints (hide/comply/voucher, lean the allegiance axis), Markets (spend Charge on items), Anomalies (risky events that lean the axes). Adult forms get run abilities, listed in the Dex. Regions: Public Net (any stage), Corp Grid and Darknet Bazaar (teen+), Old Web Ruins (adult), and a hidden fifth region. Runs also recover **codex fragments** (22, 4–5 per region) in story order, shared across generations and readable in the Archive's CODEX tab; like loot, they're lost on a disconnect. A clean jack-out re-syncs half the Integrity the run cost; each region has its own sound. `npm run balance` includes netruns in the lifetime simulation (`NO_RUNS=1` to compare). Completing the codex earns **Root Access** from NL-0: a netling's first premature flatline is reversed (old age is not); after a rescue NL-0 rests for one generation, and new scripts can roll NL-0's origin palette. `ROOT=1 npm run balance` measures it. `node tools/netrun-balance.mjs` checks risk/reward.
- **Style:** the Archive's STYLE tab holds cosmetic shells, screen tints, screen effects, sound packs (home sounds; netruns keep region voices) and a device label (earned when the first netling dies), unlocked by raising forms, finishing codex regions, full-life streaks, mini-game win streaks, care habits and netrun feats. Locked items show only a hint. **Accessories** (20, common to very rare) fit every form via anchors computed from each sprite; they're mostly bought at netrun markets for Charge, and rarely found in caches, exits and ICE wins (lost on disconnect like loot). Half are regional: corp mods in the Corp Grid, street mods in the Darknet Bazaar, relics in the Old Web Ruins, and one companion only in The Deep. **Props** (cyberdeck, boom box, mini device, plush) sit on the ground beside the pet in their own slot. Some items are **earned**, never sold: a party hat when your first netling hatches, a bandage for surviving a disconnect or an NL-0 rescue, a plush of your previous netling after the first goodbye, and a secret for collecting every shell. Purely visual; shared across generations.
- **Lineage:** each generation inherits its predecessor's form trait and one of its quirks. The **ARCHIVE** lists every generation and a dex of the 8 forms; undiscovered forms show only a silhouette and a hint.

## Balance targets

`tools/balance.mjs` plays full lifetimes with scripted players. Current results (500 runs each):

| Player | Check-ins | Reaches adult | Full 7-day life |
|---|---|---|---|
| attentive | hourly, 7:00–23:00 | 100% | 99% |
| casual | 6 a day | 87% | 66% |
| worker | before work, lunch, evenings | 72% | 29% |
| neglectful | twice a day | 2% | 0% (dies ~day 1) |

Deliberate strategies each reach their form: all-corp + comply → Chrome 100%, all-scavenged + hide → Firewall 96%, running hot and sloppy → Glitch 69%, tidy and neutral → Daemon 77%, balanced + 22 wins → Ghost 98%. Ghost by accident: ≤1%.
