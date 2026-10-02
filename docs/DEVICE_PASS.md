# Device pass

The maintainer's checks on real devices before the full freeze (v1.0). Everything here has only run in headless Chromium so far. Spoiler-heavy, like the rest of `docs/`. Note what you find next to each line (or in [KNOWN_ISSUES.md](KNOWN_ISSUES.md)); anything broken is fixed as an ordinary bug fix.

Devices: iPhone, Android phone, Windows PC, Mac, Steam Deck. Not every line needs every device: the phone lines matter most.

## Install and updates

- [ ] Install as an app (Add to Home Screen on iPhone, Install on Android and desktop). It opens full screen, offline too (airplane mode).
- [ ] A new release offers the update in an open app, and reloads into it.
- [ ] iPhone: the save survives a week of not opening the app (iOS can evict site data from an uninstalled web app; an installed one should keep it).

## Looks (phone size)

- [ ] Every screen fits at phone width with no sideways scroll: home, the region list, a run, the Archive tabs, the wardrobe, the share dialogs, the ending.
- [ ] Text is readable at arm's length, in particular the run's bottom panel and the challenge and daily rows.
- [ ] Nothing flashes harshly, with motion on and with motion calmed (the corrupted text, the overclock glow, Bare metal's glint, the Source).
- [ ] Idle animations of Daemon, Chrome and Bitling: they barely change between frames. Is that fine to look at?
- [ ] Crests on the real shells (not the picker swatches), and the pink logo on the Firewall brick and Holographic shells.
- [ ] The Cut cable shell, the Blackout tint and the Bare metal effect look right on the phone.
- [ ] A daily trace with an item selected: the "no items on the daily trace." message fits.

## Touch and controls

- [ ] The pad (left, A, right) works with thumbs; ABORT RUN asks for a confirm away from the pad.
- [ ] Double-press confirms (Segfault, Bare metal buys and USE) are clear and not easy to trigger by accident.
- [ ] Steam Deck: the controller plays mini-games and runs, B backs out, and nothing needs a touch screen.

## Sound

- [ ] Music and effects play after the first tap. iPhone: with the silent switch on, are they muted? (The README says they may be.)
- [ ] Music volume sits about level with the effects, home tracks and run tracks alike. Exit code 0 sounds right (it was only measured, never heard).
- [ ] An alert that lasts a long time (low Charge left alone) keeps the music fast: is that tiring?
- [ ] Battery: an hour with the app open and MUSIC on, compared with MUSIC at 0.

## Sharing and moving

- [ ] Visitor card: SHARE opens the share sheet; the link opens the game on another phone and queues the visitor; the QR code scans with a phone camera.
- [ ] Daily trace: COPY and SHARE both work, and the pasted line looks right in a chat app (plain text, three lines).
- [ ] Transfer code and QR: move a netling from one device to another and back.

## Notifications

- [ ] With ALERTS on, an alert in a background tab notifies; a closed app does not (expected, see [ATTENTION.md](ATTENTION.md)). Is that enough, or does it argue for the APK in [PLATFORMS.md](PLATFORMS.md)?

## Play (real time, over days)

- [ ] A full life on a phone: does the pacing feel right, and do the alerts come at sensible times?
- [ ] Mainframe pacing: does a real player reach the stage at all, and how long does it take ([BALANCE.md](BALANCE.md))?
- [ ] One full daily trace and one challenge run by hand.
