# Netling 2.0 UI design (first pass)

Status: a design discussion with the maintainer, phone portrait first. Nothing here is implemented or playtested. A clickable mock exists (see The mock); it is a static page with fake state and was never part of the repo or `src/`. Companions: [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md) (decisions; open item 8 is the UI item this starts to answer), [NETLING_2_CARE_DRAFTS.md](NETLING_2_CARE_DRAFTS.md) (the per-egg meter, button and event names this UI uses) and [NETLING_2_EGG_PRESSURES.md](NETLING_2_EGG_PRESSURES.md) (the states the vitals show).

Every item below is marked **Decided** (the maintainer said so in the design conversation) or **Proposal** (mine, not yet confirmed). This is a redesign test, so decided items can still change.

## Why redo it

1.0's UI works but has quirks:
- **Home:** nine action buttons sit at one level, so everyday care (feed, cool) and rare or committing actions (NETRUN, LIGHTS OFF) look the same.
- **Top bar:** SND, ALERTS, ARCHIVE and `?` share one strip, so settings and content are mixed.
- **Archive:** five tabs (Lineage, Dex, Codex, Chatter, Style) plus a SYSTEM overlay. SYSTEM holds transfer, storage, sound, screen, hibernate, test mode and restart, so it works as a junk drawer. The Style tab is the overloaded one: a catalog, an equip screen and an unlock tracker in one panel.

## Principles

1. **Decided: phone portrait is the target.** Desktop and the three-button device mode come after.
2. **Decided: no numbers for vitals.** Pips and named states only. Numbers are fine for event deadlines and for Standing and game wins.
3. **The pet is the screen.** The top strip is read only. Everything you tap is in the bottom third, in thumb reach.
4. **Hidden stays hidden.** Temper shows through the sprite, idle behavior and chatter tone (as the care drafts already say), never a number or a gauge.
5. **Show what needs attention, not everything.** A healthy netling gives a calm strip and an empty lane.
6. **Separate read, do and configure.** Records (LIBRARY) are read only. Dressing the pet (STYLE) is something you do from the dock. Configuration (SYSTEM) is a menu entry.
7. **Decided: the eggs share one layout.** Palette, meter words and button names differ. Positions and behavior do not, so the tests, the field manual and the accessibility work are done once.
8. **Nothing flashes more than three times a second** (the project rule). Every pulse in this document is a slow fade of 2 s or more, and every motion has a still version for calm mode.

## Layout

```
+-----------------------------+
| status strip (read only)    |
+-----------------------------+
|          PET STAGE          |
+-----------------------------+
| attention lane (reserved)   |
+-----------------------------+
| CARE PLAY NETRUN STYLE MENU |
+-----------------------------+
```

- **Decided: five dock items, in this order:** CARE, PLAY, NETRUN, STYLE, MENU. MENU is in the dock so the whole interface is thumb reachable.
- CARE, PLAY, STYLE and MENU open over the lower part of the stage and leave the pet visible. NETRUN goes to its own full screen and is drawn differently from the others, because it is a mode change with risk.
- The strip, stage and lane never move. Layout shifts on a phone cause mis-taps at the worst moment.

## Vitals

**Decided:** pips tied to the state thresholds, with no numbers.

- **One pip is 10 points,** ten pips per vital. The state thresholds fall on pip boundaries, and a slightly wider gap in the row marks where a band starts. The mock keeps the gap small (3 px) on purpose; it should be noticeable only to a player who looks.
- **Bands come from `CFG`.** The placeholder gap positions in the mock (Charge and Sync at 2 and 9, Integrity at 3, Heat at 6 and 8) must be generated from the real thresholds in the build, like the field manual, not drawn by hand. A moved threshold then moves the pips.
- **Red danger zones.** The danger end of each bar is drawn red: Heat's hot end (the pips above 80) and the low end of the others (below 20 for Charge and Sync, below 30 for Integrity, from 1.0's alert lines). Heat's other bands are cyan (cool) and yellow (warm). Running cool is fine, so low Heat is never red.
- **Zero or one pip is the danger band for fullness bars, and nothing is labeled DANGER.** The danger pips pulse slowly (2.4 s). Color is never the only cue: the pulse and the position carry it too, and the accessible value says "low" or "too hot" as 1.0's `aria-valuetext` does.
- **A named state replaces the bar's label** (OD for Overdrive, OC for Overclock), as in the care drafts' state clues. The mock **does not recolor the row** for a state, because a recolor is more of a hint than the label (maintainer: orange Heat was too much). The marks beside the sprite (wisps, sparks, dots) stay as the care drafts describe them.
- **Per-egg words.** The labels follow the care drafts: Program CHG, SYN, INT, HEAT; Iron PWR, LOCK, INT, HEAT; Wetware FOOD, BOND, HLTH, TEMP.

**Open: the Cache meter.** 1.0 and the care drafts have a fifth meter (CACHE, ROT or WASTE per egg), shown as pips. The mock shows four. Where Cache goes (a fifth row under the strip, or inside the CARE tray next to PURGE) is not decided.

**Open: pips against the pre-state captions.** The captions in the care drafts ("Pre-state caption") hint that a state is near. Pips tied to the band edges already show the approach. Keep both, or let the pips replace the captions? The care drafts also decided not to print the Charge and Sync entry lines and to show the Iron free band's edge as a tick without a number. Visible band edges are consistent with that tick but go further, so this needs a decision before the build.

## Attention lane

**Decided:** events (including wishes) share one reserved lane between the pet and the dock. Number countdowns are fine for events.

- The lane always keeps its height (72 px in the mock). It holds the event answers (HIDE and COMPLY; DEFEND; PURGE and their egg names), a countdown, and a short title with one line of subtext.
- **Wishes** (play, cool, greet, netrun) use the same lane with a calmer color.
- **Proposal: priority.** Events first, then wishes, then pre-state captions and first-run tips, which queue. Events are never displaced.
- **Proposal: an event closes any open tray** so a live deadline is never hidden.
- **The dock stays intact during events,** so MENU is always reachable.
- When nothing is pending the lane shows one calm line (the readout).
- **Open: long event names.** Iron's FIELD AUDIT with SHUTTER and SIGN OFF is the tightest case at 400 px. The mock shortens the buttons' padding to fit. It has not been checked on a real narrow phone.

## Dock and trays

- **CARE tray, three groups:** Feed, Fix, Rest, using the care drafts' names (Program, Iron, Wetware):
  - Feed: CORP PKT, SCAV DATA / MAINS, SALVAGE / VAT MIX, SCRAPS.
  - Fix: PATCH, COOL, PURGE / ALIGN, VENT, SCRUB / TREAT, CHILL, FLUSH.
  - Rest: NAP, LIGHTS OFF / IDLE, LIGHTS OFF / DOZE, LIGHTS OFF.
- **Decided: items live in the CARE tray.** Below the groups sits a 3 by 2 grid of the six slots (each slot stacks up to three of the same item, so 18 at most). The grid is always six cells, so the tray never changes height. A stack badge shows x2 or x3. Tapping a cell shows its description with USE and SCRAP (1.0's KEEP is dropped; closing the description does the same). Items blocked by sleep stay visible and dim, with the reason on selection. **Decided: keepsakes are ordinary items;** a small mark may show they are not consumed.
- **PLAY tray:** BREACH, DODGE, TUNE, FEAST, each with its win count. **Decided:** there is no other play action, so the tray is the game picker.
- **STYLE** opens the dressing view (next section).
- **MENU** opens a sheet with STATUS, LIBRARY and SYSTEM. **Decided:** the alerts toggle lives in SYSTEM, and a small indicator shows on the MENU button when alerts are off (attention is a survival mechanic; a silent off state is easy to forget).

## Menu

| Entry | Purpose | Contents |
|---|---|---|
| STATUS | This life, now | Standing, game wins, bugs, a log that expands |
| LIBRARY | Records, read only | Lineage, Dex, Codex (Chatter may fold in) |
| SYSTEM | Configuration | Alerts, sound, screen, **field manual (decided)**, transfer, visitor card, storage, hibernate, restart |

- **Decided: Standing is visible in this build,** behind the menu, as the floored integer of each track (corp and street, side by side). Both tracks are fractions underneath. The sketch's open question (a gap or two floors) is answered as two floors.
- **Decided: game wins are counted clearly and reset each life.** They show in the PLAY tray and in STATUS, so LIBRARY has no win rows.
- **Bugs and neglect** show as a glitch on the pet plus one line in STATUS saying what is wrong and that the clinic fixes bugs.
- **STATUS log** shows the last three lines and expands to a scrolling list.
- **Open: Rogue.** The Rogue egg has no Standing; its Standing display is replaced by the trail ([NETLING_2_ROGUE_DRAFTS.md](NETLING_2_ROGUE_DRAFTS.md)). STATUS needs a Rogue variant, and the Rogue skin and its dock names are not designed.
- **Open: LIBRARY structure.** The Dex structure for hints and whether a revealed hidden entry shows a hint line (sketch open item 8) are not settled here.

## STYLE (the wardrobe)

The wardrobe starts about the size of 1.0's and will grow, so it is built to take more without a redesign.

- **Decided: more than accessories change.** Categories follow 1.0's cosmetics (`src/cosmetics.js`) plus the wear slots: HEAD, FACE and BACK (accessories), SHELL, TINT, FX (screen effect), SOUND, CREST and MUSIC. Each tab shows its own count (3/8). Adding a category adds a tab; the tabs wrap to rows and never scroll sideways.
- **Decided: a live preview of the netling is pinned at the top** and changes as you equip. Shell, tint and screen effect apply to the preview and to the device.
- **Decided: an obvious scroll.** The list has a thick, high-contrast scrollbar and a "scroll for more" cue that disappears at the bottom.
- **Decided: every item shows its hint, owned or locked,** and locked items stay listed (dashed and dimmed). This is a change from 1.0, where an owned item replaces its hint with "tap to equip" or "equipped". Tapping a locked item repeats its hint. The hint of a still-hidden or corrupted entry keeps 1.0's rule (`corruptedText`).
- **Decided: shell recolors the UI surfaces** (strip, lane, dock, trays, rows), not only a bezel. Default shell and tint defer to the egg skin.
- **Decided: music and sound can be previewed,** with a visible playing state and a STOP control. If the device is muted, the preview shows a short "Muted: sound is off on this device" note with a button to turn sound on.
- **Decided: NEW markers per item.** A new unlock carries a NEW tag, its category tab shows one, and the STYLE dock button shows a dot until each new item has been equipped (one at a time, not on a visit).
- **Open:** how SHELL and CREST map to a phone UI that has no device bezel, and what the corrupted entries look like in the new rows.

## Egg skins

**Decided:** the eggs differ in looks and names and are otherwise alike. A skin sets the palette and the meter, button and event names (from the care drafts). Layout, positions, trays and screens are identical. The palettes in the mock (cyan for Program, steel for Iron, green for Wetware) and the egg-choice blurbs are placeholders. The hidden Rogue egg needs its own skin and a Standing replacement.

## Full screens

| Screen | Notes |
|---|---|
| Intro, egg choice, tutorial | The egg choice is a card per egg and a HATCH button. The tutorial is not mocked. |
| Home, trays, STYLE, MENU, STATUS, LIBRARY, SYSTEM | See above. |
| Netrun, mini-games | Full screen, reached from NETRUN and PLAY. Not designed here. |
| Flatline | Form name, time lived, cause, game wins, Standing, then COMPILE. **Decided:** the form name is shown. |
| Compile | A short line-by-line sequence, then CONTINUE to the egg choice. **Decided:** it does not need to be skippable. |
| Hibernating | Replaces the home screen; WAKE. The wording is a guess. |
| Transmission (NL-0), another-tab notice | Modals over the home screen. |
| Ending, in-transit lock, update toast | Not designed here. |

## What changes from 1.0

| 1.0 | 2.0 UI |
|---|---|
| Nine flat buttons | Five dock items; actions grouped in the CARE tray |
| Bars with a danger look | Ten pips per vital, red danger zones, no numbers |
| Top bar: SND, ALERTS, ARCHIVE, `?` | Read-only strip; settings under MENU |
| Archive with five tabs and a SYSTEM overlay | STATUS, LIBRARY, SYSTEM; STYLE moved to the dock |
| Style tab hides hints of owned items | Every item keeps its hint |
| Event bar replaces the controls | A reserved lane; the dock stays |
| Inventory as a separate BOX | The item grid inside the CARE tray |

## Open questions

1. Where the Cache meter goes, and whether the pips replace the pre-state captions (see Vitals).
2. The Rogue skin, its Standing replacement and its dock names.
3. How the Dex and Codex present hints (sketch open item 8), and whether Chatter folds into LIBRARY.
4. Whether an egg's long event names fit the lane on a 360 to 400 px phone.
5. Screen reader and keyboard order for the dock, trays and the pip rows (the pips need a text value; the mock sets one but nothing has been tested with a screen reader).
6. The netrun, mini-game, ending and tutorial screens.
7. Desktop and the three-button device mode, after phone portrait.

## The mock

The mock is a single static HTML page published as a private Claude artifact (a link in the maintainer's account, not in the repo). It has fake state and chips for the scenarios (calm, low charge, the three events, a wish, Overclock, alerts off, sound off), the three egg skins and the full screens.

What was and was not checked: the page's script passed a Node syntax check. No browser test, no layout check on real narrow phones, no screen reader test, and the preview sounds (WebAudio) were never heard by the author. The pip counts, band gaps, item names and hints, win numbers, Standing values, sprite and egg blurbs in it are made up. If the mock should be kept with the repo, it can be committed under `docs/netling2-prototypes/`; it is not there yet.
