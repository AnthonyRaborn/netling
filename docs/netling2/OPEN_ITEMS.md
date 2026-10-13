# Netling 2.0: open items and next steps

Status as of 2026-10-13. The maintainer sets the order. Decided design is in [DESIGN.md](DESIGN.md); this file lists only what is not done or not decided. When an item is finished, move its outcome into DESIGN.md (or the owning handoff doc) and delete it here.

Verified state: `npm test` and `npm run proto:test` passed at the last recorded run (counts are in CLAUDE.md and drift; run them). Not run for any of this work: `npm run smoke`, any device or phone check, any playtest.

## A. Needs the app, a device or people

1. **Build the 2.0 app.** There is no 2.0 game code. It must implement the rules in the simulator fork (`prototype/netling2/sim/`, `NR2=all PERKS=1` plus the decided switches), node contents fixed before arrival (a per-run seed), the fog drawing, the share line, run HUDs with each egg's meter words, egg anomalies and run costs, the tutorial wording, and the sprite layers via `render.js`. Save format and storage keys are not designed.
2. **Deployment** ([DEPLOY.md](DEPLOY.md)). Decided. Build order: seeded RNG and forecast in the sim (with the forecast-equals-catch-up test), Android spike (Capacitor, notifications under Doze), storage backends behind `store`, Tauri desktop shell with pet window and portable mode, widget, release pipeline, device pass. Open: the new repository's visibility (leaning private; recommended: private source plus a public releases repo).
3. **Playtest-bound questions** (bots cannot answer): egg run costs; Foresight's value; Feast progression; stack size (3) and the keep-or-sell screen; the 5 minute window after a jack-out; the break's thresholds (Integrity warning 70, break 40, strain 80); how people read the Overlink brake, the strain words and the clinic; whether Standing's spread feels right; whether the steady lock-in for players who never netrun is acceptable; the tone of the tutorial and idle and chatter shapes; the Metronome's speed.
4. **Device and real-renderer check** of the sprite layers: flicker, legibility at small size, the layers on a phone. See [SPRITES_HANDOFF.md](SPRITES_HANDOFF.md), "What is left".
5. **Rogue tuning after a playtest:** the "thirtyfive" Source set (kept for tuning), the Deep's cordon ambushes and ambush share (back toward 0.25), and difficulty against the 4.4 targets. A two-parent hybrid (M1) is a later option, with balance set aside.

## B. Review by the maintainer

6. **Text review.** Drafted text awaiting review lives in [text/](text/): [CODEX_DRAFTS.md](text/CODEX_DRAFTS.md) (all page text, temper hints, state chatter, Rogue pages), [CARE_DRAFTS.md](text/CARE_DRAFTS.md) (per-egg meter, button, event, item and alert wording, the break, stage care and notifications) and [ROGUE_TEXT.md](text/ROGUE_TEXT.md). Much is decided; the chatter in `prototype/netling2/body-lines.js`, `state-voices.js`, `rogue-lines.js` and the Metronome still want player testing. Elders have no chatter (as 1.0's mainframes).
7. **UI first pass** ([UI.md](UI.md), mock `docs/netling2-prototypes/ui-mock.html`): open questions there include whether pips replace pre-state captions, the Rogue skin, the Dex and Codex hint structure, long event names on a 360 to 400 px phone, screen reader and keyboard order, and the netrun, mini-game, ending and tutorial screens.
8. **Community sketch** (document only) is queued after the sprite review, which is now finished.

## C. Design not yet done

9. Per-egg baby and teen rules beyond stage care; mini-game modifiers per egg.
10. Names and art for Decoy and Salvage cell per egg.
11. Shell, crest and Mini device prop unlock conditions (10 shells unlock by "discover form X" and need rewriting; Full house, Rack mount and Mini device need new definitions); unlocks for late pages.
12. Whether a revealed hidden Dex entry shows a hint line; how bugs and neglect show in the UI; the Metronome's unsteady-hold alert rule.
13. Whether wide elder bodies carry the same temper tell as their adult (sprite risk).
14. Purge order: recommended to leave "accident or deliberate" unsettled; NL-0 learns it was dead only when the player shows it.
15. Whether the lean assignment of any adult pair should swap (names are accepted; the corp lean got the tidier word).
16. Retest in 2.0 once it exists: egg page rates (0.20, 0.50), bug values, temper guard and edges, neglect lines, every starting number.
17. Style options (palettes, shells, tints, screen effects, labels, the Light ring) are drafted in the prototype, not wired anywhere real; sounds and music are not built; the list of further options is in the [archived ideas doc](../archive/netling2/ACCESSORY_IDEAS.md). A newly hatched netling does not roll the new palettes until the real sim's `BASE_PALETTES` changes.

## D. 1.0 items touching this work

18. *(Done.)* Branch `bugfix` was merged to `main` (PR #29, version `netling-v70`) and `main` is merged into this branch: the netrun fix for a Glitch, Ghost or Panic that slips past ICE (`77a12e7` here, `daddee8` there), the corrected drain notes, and the headphones/visor and highlight-mark fixes. Delete this item when convenient.
19. 1.0 art problems left under the freeze: the holologo clip (1 px, left as is; settled for 2.0 by the taller screen). Fixed in v70: headphones plus visor merging into one band, and low-contrast highlight marks on ice, acid, toxic and origin. 1.0 forms that move wearables between frames are documented as kept (`docs/SPRITES.md`), not a defect.

## E. Parked (do not start without the maintainer)

XP with per-stage caps, a flat third ICE tier, more home events (only under the notification budget), multiplayer. Length levers held back for the Rogue gate: shorter lives, a smaller Root list, a lighter first elder feat.

## Where the decision record is

The long sketch, drafts and measurement logs are in [../archive/netling2/](../archive/netling2/README.md). If a decision here is unclear, search the archive before reopening it; most open questions there were closed later in the same file.
