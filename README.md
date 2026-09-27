# Netling

A cyberpunk, Tamagotchi-style virtual pet. It lives in real time (even while closed), evolves based on how you raise it, and flatlines if neglected. Each death leaves a fragment that shapes the next generation.

No build step, no dependencies: vanilla JS modules + canvas.

## Run

```bash
npm run serve        # http://localhost:5174
npm test             # simulation + mini-game logic
```

Add `?dev` to the URL for time-skip, forced-evolution, and forced-trace buttons. `gallery.html` shows every sprite.

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
| `src/notify.js`, `sw.js`, `manifest.webmanifest` | PWA + notifications |
| `tools/make-icons.mjs` | Regenerates `icons/*.png` from the Bitling sprite |

## Rules at a glance

- **Stats:** Charge, Sync, Integrity, Heat, Cache. A need left unmet for 15 minutes is a care mistake; 10 mistakes, 2 hours at zero Integrity, or 7 days of age ends the run.
- **Evolution:** Bitling → teen at 24h (Kernel for good care, Stub otherwise) → adult at 72h, chosen by two hidden axes:
  - *Allegiance* (corp packets, complying with traces ↔ scavenged data, hiding) → **Chrome** / **Firewall**
  - *Stability* (prompt patches, purges ↔ overheating, mistakes) → **Daemon** / **Glitch**
  - **Ghost** is secret: balanced axes, ≤1 mistake, and 9+ mini-game wins including each game.
- **Lineage:** each generation inherits its predecessor's form trait and one of its quirks.
