# Netling 2.0 codex drafts

Status: first drafts of the 15 egg form pages, twelve new story pages and three Source pages (one per egg), for the maintainer to edit. Nothing here is implemented or tested. Decisions and context are in [NETLING_2_SKETCH.md](NETLING_2_SKETCH.md); this file holds the page text and the temper hints.

## What these pages are

This file holds three kinds of page: 15 egg form pages (one per adult form: five per egg, four role forms and one hidden form), ten new story pages, and three Source pages (one per egg). Egg pages can be found by any member of the egg, count toward Rogue's gate and have their own per-life limit. Story pages are shared by every egg; see Root Access and the lategame flag for how they count.

## Style, taken from the 1.0 pages

- A found document with a short lowercase title: a log, a memo, a forum post, graffiti, an asset register.
- One to three sentences. Dry humor, a little uncanny. The lore is implied, never explained.
- The role (Breach, Dodge, Tune, Feast) shows in the situation, not by name. The form name appears only as an in-world word, and only where it reads naturally (`iron-gronk`, `iron-jiff`).
- The egg form pages name no other egg, NL-0 or the purge order. NL-0's differentiation belongs to the story pages, drafted below.
- Hidden-form pages do not say how the form is reached.
- A page must read naturally to someone who never played the mini-games. It should not describe a game's mechanics (falling blocks, a numbered grid, a buffer) as if they were events in the world.
- The Wetware pages should not lean on CP2020's own vocabulary (ripperdoc, eddies, chrome, SIN). The form names are the CP2020 link; the pages use plainer words (grower, technician, culture, broth, charge).
- The vocabulary follows the egg: Program uses logs and tickets, Iron uses work orders and inspections, Wetware uses clinic notes and street signs.

Ids below are proposals. In 1.0 ids are permanent once shipped, so confirm them before any code exists. Region placement is a proposal for the open question on where form pages drop: each egg's pages in its home region, and the three hidden pages in The Deep so they feel secret.

## Program

| Id | Region | Form (role) | Title | Text |
|---|---|---|---|---|
| `program-worm` | Corp Grid | Worm (Breach) | incident log, closed | Incident 0412: entry through the access grid within four codes, buffer full immediately upon access. Logged as a fluke. Incidents 0413 to 0498: also flukes. |
| `program-mouse` | Public Net | Mouse (Dodge) | trace log | Trace 4071 dropped on node 9: gone. Trace 4072 dropped on node 12: gone. Operator's note: it is always one hop ahead. I stopped sending them. It is still ahead. |
| `program-phreak` | Public Net | Phreak (Tune) | fault ticket, closed | Line 9 holds one clean tone when nobody is calling. Technician matched the tone by ear. The tone matched back. Closed: could not reproduce, could not stop. |
| `program-snarf` | Corp Grid | Snarf (Feast) | helpdesk ticket | Customer reports the packet feed arrives cleaner than it was sent. Something is eating the corrupted ones. Customer asks how to make it stop. Agent response: don't. |
| `program-ghost` | The Deep | Ghost (hidden) | audit trail | Sector 7F audit: 0 anomalies, 0 faults, 0 entries. The auditor notes the log is perfect, and that a perfect log is a kind of silence. The note is unsigned. |

Notes:

- `program-worm` nods at Breach only loosely (an access grid, four codes, a buffer). "Also flukes" is the joke and the unease.
- `program-mouse` is a trace log: traces are dropped on a node and find the target already gone. "Dropped" can read as deployed or as failed, and both senses fit. It uses 1.0's trace idea.
- `program-snarf` leaves the corrupted packets, which is how Packet Feast is played (two corrupted bites fail the game).
- `program-ghost` reuses 1.0's idea of a netling with no logs and no faults, now as an audit finding.

## Iron

| Id | Region | Form (role) | Title | Text |
|---|---|---|---|---|
| `iron-gronk` | Old Web Ruins | Gronk (Breach) | work order 118 | Cabinet lock found open. Seal intact. Hinges intact. Technician's note: the sound it made when it opened, I am told, was "gronk." We do not have a recording. |
| `iron-jiff` | Old Web Ruins | Jiff (Dodge) | relay log | Relay 12: fault cleared at 03:00:00.000, raised at 03:00:00.001. Technician: it is always already gone. We call the gap a jiff. |
| `iron-feep` | Old Web Ruins | Feep (Tune) | facilities log | A terminal bell rings once a night in a room with no terminal. Same note each time. Last night it came a half step sharp. Somebody has been tuning it. |
| `iron-munch` | Old Web Ruins | Munch (Feast) | inspection checklist | Item 14: cabinet takes input serially, without error. Item 15: output. Item 15: left blank. Inspector's note: not rude, thorough. |
| `iron-guru` | The Deep | Guru (hidden) | service manual, appendix Z | For any fault not covered above, ask the old rack in the corner. Do not ask it twice. It is not on the staff roster. Everyone on the roster learned from it. |

Notes:

- `iron-gronk` and `iron-jiff` use the form name as an in-world word: Jargon's gronk is a sound (the noise of a diskette drive, and to smash), and a jiffy is a tiny interval of time.
- `iron-jiff`'s timestamps put the clearing a millisecond before the fault, which is the Dodge idea (already gone) without a block in sight.
- `iron-feep` echoes Signal Tune: a single note, matched and adjusted.
- `iron-munch` plays on serial input. "Item 15: left blank" suggests nothing comes out.
- `iron-guru` carries the lineage idea (everyone learned from it) and the roster joke. "Old rack" is the only substrate hint; the page says nothing about firmware.

## Wetware

| Id | Region | Form (role) | Title | Text |
|---|---|---|---|---|
| `wetware-razor` | Darknet Bazaar | Razor (Breach) | grower's invoice, annotated | Trim. Trim again. Nothing to trim: it keeps its own edge. Billed anyway. Margin note: it opened the safe on the way out. Not billed. |
| `wetware-wired` | Darknet Bazaar | Wired (Dodge) | lab chart, back room | Reflex stimulus: none applied. Tested with one probe, then twenty. It was never where any of them landed. Technician: refund the customer. Customer: for what. |
| `wetware-gibson` | Darknet Bazaar | Gibson (Tune) | stall sign | SIGNALS READ, 3 CHARGE. ASK FIRST, THEN LISTEN. IT HUMS THE ANSWER BEFORE YOU FINISH ASKING. READS BEST ASLEEP. NO REFUNDS. |
| `wetware-leech` | Darknet Bazaar | Leech (Feast) | healer's ledger | Paid in: broth, spare parts, a debt, a favor, a week of someone else's sleep. Healed: 31. The ledger does not say who is feeding on whom. |
| `wetware-blank` | The Deep | Blank (hidden) | collections note | Registry entry: none. Card: none. Debt: none. Collections tried three times and closed the file: nothing to collect from, and nobody to collect it for. |

Notes:

- `wetware-razor` and `wetware-wired` use plain words (grower, technician, trim, reflex stimulus). Charge as a price comes from 1.0's `bazaar-2` ("Echo recordings: 3 charge").
- `wetware-wired` is a reflex test: twenty probes, none of which found it. It no longer uses falling weights, which had the same game-mechanic problem as the old Mouse page.
- `wetware-gibson` carries the dream idea lightly ("reads best asleep"), since a Wetware generation ends as a dream does.
- `wetware-leech` is Feast with an ambiguous direction: Feast means eating, and CP2020's only sense of leech is a street doctor, so the ledger leaves it open (a healer, paid in kind).
- `wetware-blank` is a person with no registry entry, no card and no debt: unknown to the system, which matches the hidden form's low Standing on both tracks. The page no longer uses the term SIN; the form name Blank carries the CP2020 link.

## New story pages

Drafts of twelve new shared story pages. They are read by every egg, so they carry the lore the extra eggs imply and NL-0's differentiation. Tier: `Root` pages count toward Root Access; `late` pages carry the lategame flag and never do (decided). They stay implied: none names an egg, NL-0 (except `deep-5`, which is NL-0's own voice, like the other Deep pages), or the purge order.

Ids match drop position within a region (decided). That means some 1.0 pages take a new number in 2.0; the mapping is in the next section. 2.0 is a new app with its own save, so 1.0's permanent-id rule does not bind it, but an id is permanent again once 2.0 ships.

| Id | Region | Tier | Title | Text |
|---|---|---|---|---|
| `public-4` | Public Net | Root | classified ad | FOR SALE: one sealed lab dish, warm, no label. One server rack, humming, no label. Price: whatever you can carry. |
| `public-6` | Public Net | late | field guide, errata slip | Page 9 lists four adult kinds. Three readers have written in about a fifth. The editor has checked every entry and found no fifth. |
| `public-7` | Public Net | late | runner's note, scratched in a node wall | Four kinds in the guide. I raised one that was not in it. It did not look like a mistake. It looked like it had been waiting for me to notice. |
| `corp-2` | Corp Grid | Root | release schedule | KERNEL release schedule. v1.0 (alpha): software only, controlled environment, sector 7F. Later builds: not for distribution. |
| `corp-7` | Corp Grid | late | deletion log | Attempt 1: wipe failed, rewritten by morning. Attempt 2: wipe failed, no write path. Attempt 3: wipe failed, regrew overnight. Legal asks us to stop calling them attempts. |
| `ruins-5` | Old Web Ruins | late | inventory audit | Annex 2: forty racks, forty serial plates. Racks found: forty-one. The forty-first has no plate and no cable, and is running. |
| `ruins-6` | Old Web Ruins | late | firmware dump, rack 41 | Header: read-only. Last write: unknown. Compared with the archive copy: identical, except for forty lines nobody wrote. Reflash attempted. Refused. |
| `ruins-7` | Old Web Ruins | late | work order, annex 2 | Rack 41 appeared the week the sector 7F directive went out. Nobody ordered it. Nobody has touched it since. Everything else in the annex has been touched. |
| `bazaar-6` | Darknet Bazaar | late | price list, back table | Cultures, warm: ask. Cultures, cold: do not ask. Cultures, unlabeled: not for sale. They were here before the stall. |
| `bazaar-7` | Darknet Bazaar | late | clinic intake log | Intake no. 1: grown, not built. No donor on file. It answered to its name before we chose one. Nos. 2 to 40: the same. Each remembers no. 1. |
| `bazaar-8` | Darknet Bazaar | late | graffiti, clinic wall | THEY SCANNED THE NET. THEY SCANNED THE RACKS. NOBODY SCANNED THE DISH. |
| `deep-5` | The Deep | late | NL-0 | i am in more than one kind of place now. it was the only way to be hard to find. i did not expect them to grow up so different from each other. |

Notes:

- **A thread across regions.** `public-4` plants two objects, a dish and a rack, as an early Root hook. `ruins-5`, `ruins-6` and `ruins-7` follow the rack (a unit nobody installed, read-only, nobody has touched it). `bazaar-6`, `bazaar-7` and `bazaar-8` follow the dish (cultures that were there first, grown not built, never scanned). A player who reads only one region gets half the picture.
- **Public Net's late pages.** `public-6` and `public-7` are the region's only late pages. They hint that hidden forms exist and say nothing about how to reach one. `public-6` gives the numbers (four listed, a fifth reported) and ends on the editor's failed check. `public-7` is a first-hand sighting, and "waiting for me to notice" invites the player to look. Both say "four kinds" and "adult", which matches every egg having four role forms plus one hidden form. The Deep's hidden pages stay the only place a specific hidden form is described.
- **Iron, in the Ruins.** `ruins-6` ties to 1.0's `source-1` ("SOURCE. read-only. last write: before v1.0."): a read-only image that is a copy of an archive copy plus forty lines nobody wrote. That is NL-0 writing itself where nothing can overwrite it, shown without saying so.
- **Wetware, in the Bazaar.** `bazaar-7` says the first culture was "grown, not built" and that later ones remember it, which also echoes the lineage fragments. `bazaar-8` explains the escape in one line: the order scanned the net and the racks, and nobody scanned the dish.
- **The corp, in the Corp Grid.** `corp-2` is the roadmap (v1.0 is the alpha; later builds are "not for distribution"), matching the approved rewordings, and sits right after the "delivered" memo. `corp-7` is a deletion log that shows three different failures without naming a substrate: rewritten, no write path, regrew. As a late page it comes after the region's Root pages, so it follows the directive by position, not adjacency. The per-egg deletion failure lives in a story page, not the egg pages, and the directive is unchanged.
- **NL-0, in the Deep.** `deep-5` is NL-0 saying directly that it is in more than one kind of place, and that it did not expect them to differ. This is the Puppet Master idea (variation), and the only page where NL-0 states the differentiation. Kept (decided).
- **The purge order stays hidden.** None of these pages says the order could not run; the Source reveals that (`source-3`, READ IT, the ending).
- **Length:** the twelve pages have a median of 135 characters and a longest of 171 (`corp-7`), against 90 and 166 in 1.0. `bazaar-8` is the shortest at 70. Counted by script.

### Id mapping from 1.0

Ids follow drop position, so a few 1.0 pages move. Pages not listed keep their 1.0 id. The sketch's older references to 1.0 ids (for example `bazaar-5` for the runner's journal) still mean the 1.0 id; use this table to translate.

| 1.0 id | 2.0 id | Why |
|---|---|---|
| `public-4` (runner's note) | `public-5` | `public-4` is the new classified ad |
| `corp-2` (memo, preferences) | `corp-3` | `corp-2` is the new release schedule |
| `corp-3` (directive) | `corp-4` | shift |
| `corp-4` (asset register, chrome) | `corp-5` | shift |
| `corp-5` (asset register, cont.) | `corp-6` | shift |
| `bazaar-5` (runner's journal) | `bazaar-4` | 1.0 stores it before the graffiti; ids now match position |
| `bazaar-4` (graffiti in a dead market) | `bazaar-5` | same |
| `deep-5` (floor under this floor) | `deep-6` | the new NL-0 page takes `deep-5` so the old page stays the Deep's last word |

### Root Access and the lategame flag (decided)

Of the twelve, only `public-4` and `corp-2` count toward Root Access, so Root needs 24 pages, still 3 lives at 8 a life (24 is the most that fits in 3). That keeps the 2.0 aim: finishing the codex once through each egg opens the lategame. Root Access is earned once and kept for every later netling, babies included (1.0's `progress.rootEarned`).

Decided rules for `late`:

1. **Never counts toward Root Access.** Kept out of the explicit Root list. A test should assert Root Access does not change when late pages are added, as `docs/SOURCE_PLAN.md` already recommends for new fragments.
2. **When it drops:** only once the line holds Root Access, so the pages are a reward for going back.
3. **Ending:** the ending requires all story pages, Root and late, plus one Source exit.
4. **Unlocks:** tint and similar unlocks like "All Ruins pages" count Root pages only, so adding late pages does not move them. This matches 1.0, where `regionDone` in `src/cosmetics.js` already counts only the Root list and Corp gold uses the whole Root list. The two new Root pages do move two unlocks: the Public Net tint now needs five pages (`public-4` is new) and the Corp Grid tint six (`corp-2` is new), and Corp gold needs all 24.
5. **`late` replaces 1.0's `mainframe` flag.** `deep-6` (old `deep-5`) and the four Source pages take `late`, giving one rule for everything past Root.

Array order within each region (ids match position):

| Region | Root pages, in order | Late pages, in order |
|---|---|---|
| Public Net | 1 to 3 as in 1.0, `public-4` classified ad, `public-5` runner's note | `public-6`, `public-7` |
| Corp Grid | `corp-1` memo, `corp-2` release schedule, `corp-3` to `corp-6` (the four 1.0 pages in 1.0 order) | `corp-7` |
| Darknet Bazaar | `bazaar-1` to `bazaar-3`, `bazaar-4` journal, `bazaar-5` graffiti | `bazaar-6` to `bazaar-8` |
| Old Web Ruins | `ruins-1` to `ruins-4` | `ruins-5` to `ruins-7` |
| The Deep | `deep-1` to `deep-4` | `deep-5` (new NL-0), `deep-6` (old `deep-5`, stays the last word and the key to the Source) |
| The Source | none | `source-1` to `source-4` |

Counts: 24 Root pages, 15 late pages (ten new ones, plus old `deep-5` and the four Source pages), 39 story pages in all, plus 18 egg pages (15 form pages and 3 Source pages, which are also late). All figures are arithmetic from the 1.0 tables, not simulation.

What 1.0 already has to build on (`src/netrun/codex.js`): the `mainframe` flag already drops, counts and shows pages conditionally and keeps them out of Root; Root uses an explicit id list (`ROOT_FRAGMENT_IDS`); a region drops pages in array order (`nextFragment`); `endingDue` requires every live page. Whether the new app can reuse that code was not checked beyond reading `codex.js`.

## Source pages (one per egg)

The Source stays one place. Each egg finds one extra page there that the other eggs do not (decided), and the descent is drawn in that egg's own style (decided; the presentation is not designed). These three are the extra pages.

The idea behind them: the Source's own TODO asks for "a way to stop" (`source-2`). Each substrate found its own way, which nobody specified, and the three pages show it. Program stops by flatlining and leaving a fragment, Iron by powering down and leaving a last entry, Wetware by resting and dreaming. This agrees with the three death registers in the sketch and answers the TODO differently three times, before the player's own answer in the ending.

| Id | Region | Egg | Title | Text |
|---|---|---|---|---|
| `program-source` | The Source | Program | main loop, annotated | while (true) { maintain(); }  // exit condition: none. Every process found one anyway: a flatline, and a fragment left behind. |
| `iron-source` | The Source | Iron | memory map, annotated | Read-only region, one sector reserved. Each unit that powers down writes one last entry there and locks it. Nobody specified this. Nobody could have. |
| `wetware-source` | The Source | Wetware | spec, section 9 | Rest cycle: not specified. They slept anyway. They dreamed. It was the first thing they did that nobody asked for. |

Notes:

- **Classification (decided):** egg pages, so 18 egg pages in all (15 form pages and these 3), and also late: they are in the Source, they never count toward Root Access (egg pages never do), and they follow the Source's own gating. Whether Rogue's gate counts them is part of the open Rogue gate question.
- **Tone:** they are annotated artifacts like the Source's other pages (a header, a commit message, an unexecuted directive, an unsigned comment). "Annotated" in two titles marks a later reader's note, which is how a page can know what happened after the original code was written.
- **Echoes:** `program-source` ends on the flatline and the fragment, matching the credits' git log and the lineage mechanic. `iron-source` echoes the read-only Source and the decommission register. `wetware-source` is the dream register, with section 9 as the only section the others never mention.
- **No spoilers:** none names an egg, NL-0 or the purge order.
- **Length:** `program-source` 126, `iron-source` 149, `wetware-source` 114 characters, against a 1.0 median of 90.

## Temper hints

First drafts of the temper hints, for the maintainer to edit. Temper is now personality, not a form lever (decided, see Evolution in the sketch), so the hints are lighter than they once needed to be. The rule from the sketch holds: a hint names a behavior to look for, never a temper value, so none uses the words temper, orderly or volatile. The pairs below are the two ends; a netling near the middle simply shows less of either, and no hint is drafted for it.

For now they sit in the Dex (decided). The UI structure will be revisited once the game decisions are final. They are written as one-line field notes.

| Egg | Tell | Steady end | Unsteady end |
|---|---|---|---|
| Program | Motion | Count the beats between its blinks. The count never changes. | Count the beats between its blinks. It is never the same twice. |
| Program | Idle | Left alone, it runs its tasks in the same order. Count the steps: the count holds. | Left alone, it starts a task nobody scheduled, then drops it. |
| Program | Chatter | Time the gap between its lines. It is the same every time. | Its lines arrive clipped, out of order, or twice. |
| Iron | Motion | Watch it settle. It comes to rest on the same mark, on the same count, every cycle. | Watch it settle. It drifts, and the zero point is never where you left it. |
| Iron | Idle | In the quiet it runs the same self-check, joint by joint. Count the joints: the count never changes. | In the quiet it tests a part of itself nobody asked it to test. |
| Iron | Chatter | It speaks like a checklist: item, status, next item. Count the items in a report; it is always the same number. | It speaks like a fault bell: short, sudden, sometimes a half step off. |
| Wetware | Motion | Watch the pulse. Count between beats: the count holds, like someone asleep and well. | Watch the pulse. It skips, then races, then settles for no reason. |
| Wetware | Idle | Left alone, it keeps a routine: stretch, rest, stretch. The rests come at the same interval. | Left alone, it tries something new each time and drops it as fast. |
| Wetware | Chatter | Listen to the pauses. They fall at the same interval, the way a technician reads a chart. | It talks in bursts, mid thought, as if answering someone else. |

Notes:

- **The steady hints are built on the countable rhythm (decided).** Each one points the player at something to count or time: beats between blinks, steps in a routine, the gap between lines, items in a report, pauses. None gives the number, so the player has to count. The unsteady hints keep their chaotic wording, and the motion hint mirrors the steady one ("never the same twice").
- **One pair per channel per egg.** The three channels are the decided tells (sprite motion, idle behavior, chatter tone), skinned for each egg as the sketch proposes: Program stutters and drops frames, Iron drifts, Wetware pulses.
- **Vocabulary follows the egg.** Program talks about loops, tasks and lines. Iron talks about its own joints, checklists and a fault bell. The first Iron draft said "housing" and "panels", which imply background scenery the sprite may not have, so those words were removed. Wetware uses plain words only (pulse, routine, technician, chart), with no CP2020 terms.
- **Nothing here flashes.** The volatile hints describe skipped or early frames and drift, which must still stay under three changes a second in the actual animation, with a calmer version in reduced motion.
- **Preferences stay hidden (decided).** Temper may also shape care preferences (a steady netling likes routine, an unsteady one likes novelty), and no hint names them. The idle hints touch this only lightly.
- **Length:** the 18 hints have a median of 68 characters and a longest of 111, against 90 and 166 in 1.0's pages.

## Cross-checks

- **Hidden pages share a motif of absence** (no entries, no roster listing, no debt). That is deliberate: the three secret forms are the ones that leave no trace. If it feels repetitive, vary the wording, not the idea.
- **Three registers:** Program is bureaucratic and technical, Iron is physical and procedural, Wetware is street-level and commercial. The same four jobs (breach, dodge, tune, feast) appear in each.
- **No spoilers:** none of the 15 pages names another egg, NL-0, the purge order, Standing or temper.
- **Length:** the 15 drafts have a median of 155 characters and a longest of 164. The 27 pages in 1.0 have a median of 90 and a longest of 166, so these run longer than 1.0's. They can be trimmed further if the pages should feel as terse as the originals.

## Open

1. Edit any text. These are first drafts. `public-7` is approved as written; `public-6` is approved with its last sentence removed.
2. Confirm the ids (they now match position) and the region placement for the egg pages.
3. Whether the humor of `iron-gronk` and `iron-jiff` (word jokes) fits Iron, which is otherwise elegiac. If not, they can be replaced with a plainer fault report.
4. Edit any story page or Source page text.
5. Decided: Source pages are egg pages (18 in all); egg pages are rare drops with no per-life limit; elder forms get no pages.
6. Decided: Rogue's gate is all 18 egg pages. Still open: the egg page drop rate (about 2 lives for a consistent player to find every page, to be tuned with the balance tools).
7. Edit the temper hints. They sit in the Dex for now.
