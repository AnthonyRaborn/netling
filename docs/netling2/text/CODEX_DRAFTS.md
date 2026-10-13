# Netling 2.0 codex drafts

> **Status (2026-10-13): All Netling 2.0 codex page text, temper hints, state chatter and Rogue pages. Much is decided; the maintainer's text review is pending.** Design context: [../DESIGN.md](../DESIGN.md). Open items: [../OPEN_ITEMS.md](../OPEN_ITEMS.md).


Status: first drafts of the 15 form pages (five per egg: one page per role, covering both of the role's forms, plus one hidden-form page), twelve new story pages, three Source pages (one per egg) and 18 temper hints, for the maintainer to edit. **The trims are chosen (maintainer, 2026-10-11):** every page with a trim now shows the chosen text in its table (see Trimmed alternatives, Decided), and the notes below describe the chosen text. Nothing here is implemented, and none of it has been read in context or playtested (the idle and chatter shapes behind the temper hints are tested as code in `prototype/netling2/voice.js`; see Temper hints). Decisions and context are in [SKETCH_FULL.md](../../archive/netling2/SKETCH_FULL.md); this file holds the page text and the temper hints. Since then: the Rogue reveal is decided and Rogue's five pages are drafted (Rogue: background and reveal; Rogue pages; 2026-10-11). Contents: What these pages are, Style, Program, Iron, Wetware, New story pages (with the id mapping from 1.0 and the late flag), Source pages, Temper hints, State chatter, Rogue: background and reveal, Rogue pages, Trimmed alternatives, Cross-checks, Open (decided items, what is still open).

## What these pages are

This file holds three kinds of page: 15 egg form pages (five per egg: one page per role, four roles, each covering both of the role's forms, plus one page for the hidden form), twelve new story pages, and three Source pages (one per egg). Egg pages can be found by any member of the egg, count toward Rogue's gate and have no per-life limit (0.20 a run for role pages and 0.50 a Deep run for the hidden page; see Open). Story pages are shared by every egg; see Root Access and the lategame flag for how they count.

## Style, taken from the 1.0 pages

- A found document with a short lowercase title: a log, a memo, a forum post, graffiti, an asset register.
- One to three sentences. Dry humor, a little uncanny. The lore is implied, never explained.
- The role (Breach, Dodge, Tune, Feast) shows in the situation, not by name. A form name appears only as an in-world word, and only where it reads naturally (so far, none of the Iron pages does). Each role page covers both of the role's forms (option C), so it names neither lean and reads the same for the corp-leaning and the street-leaning form.
- The egg form pages name no other egg, NL-0 or the purge order. NL-0's differentiation belongs to the story pages, drafted below.
- Hidden-form pages do not say how the form is reached.
- A page must read naturally to someone who never played the mini-games. It should not describe a game's mechanics (falling blocks, a numbered grid, a buffer) as if they were events in the world.
- The Wetware pages should not lean on CP2020's own vocabulary (ripperdoc, eddies, chrome, SIN). The form names are the CP2020 link; the pages use plainer words (grower, technician, culture, broth, charge).
- The vocabulary follows the egg: Program uses logs and tickets, Iron uses work orders and inspections, Wetware uses clinic notes and street signs.

Ids below are proposals. Role pages are named by role (`program-breach`, not the form), because a role page covers two forms and form names may still change; the hidden pages keep the hidden form's name (`program-ghost`, `iron-guru`, `wetware-blank`). In 1.0 ids are permanent once shipped, so confirm them before any code exists. **Where pages drop (decided):** the four role pages of an egg drop in any cleared non-Deep region, not only the region in the Region column; that column is now the page's in-fiction setting and its voice, and gates nothing. The three hidden pages drop in The Deep. See Open for the measurement behind this.

## Program

| Id | Region | Forms (role) | Title | Text |
|---|---|---|---|---|
| `program-breach` | Corp Grid | Worm and Tiger (Breach) | incident log, closed | Incidents 0412 to 0498: entry in four codes, buffer full on arrival. All logged as flukes. |
| `program-dodge` | Public Net | Mouse and Spoof (Dodge) | trace log | Trace 4071: gone. Trace 4072: gone. Trace 4073 came back with a route that does not exist. It is always one hop ahead. |
| `program-tune` | Public Net | Phreak and Parse (Tune) | fault ticket, closed | Line 9 hums one clean tone, nobody calling. Matched it by ear. It answered before I asked. Closed. |
| `program-feast` | Corp Grid | Snarf and Gobble (Feast) | helpdesk ticket | Ticket: the feed arrives cleaner than sent. Something eats the bad packets. Customer wants it stopped. Agent: don't. |
| `program-ghost` | The Deep | Ghost (hidden) | audit trail | Sector 7F audit: 0 anomalies, 0 faults, 0 entries. A perfect log is a kind of silence. The note is unsigned. |

Notes:

- Each page covers both forms of its role without naming either lean. The corp-leaning and street-leaning forms read the same page.
- `program-breach` nods at Breach only loosely (four codes, a buffer). "All logged as flukes" over 87 incidents is the joke and the unease. A hired tester and a wild worm both fit.
- `program-dodge` is a trace log: traces are dropped on a node and find the target already gone. The new third trace returns a clean route that does not exist, which covers Spoof (a false answer) next to Mouse (always one hop ahead).
- `program-tune` keeps the tone matched by ear (Phreak) and that it answered before it was asked (Parse, understanding), closing in the first person. The chosen trim (A, after B was tried) drops "could not reproduce".
- `program-feast` has the netling eating the corrupted packets and leaving the feed cleaner. That is the opposite of how Packet Feast is played (the player eats good packets and two corrupted bites fail the game); this is acceptable under the style rule against describing mechanics, and it makes the agent's "don't" read as the right answer. An earlier version of this note said the page leaves the corrupted ones; that did not match the text. Snarf and Gobble both consume.
- `program-ghost` reuses 1.0's idea of a netling with no logs and no faults, now as an audit finding.

## Iron

| Id | Region | Forms (role) | Title | Text |
|---|---|---|---|---|
| `iron-breach` | Old Web Ruins | Gronk and Splat (Breach) | work order 118 | Work order 118: cabinets sealed when the building emptied. Seals intact. Cabinets open. I did not ask how. |
| `iron-dodge` | Old Web Ruins | Jiff and Bamf (Dodge) | relay log | Relay 12: fault cleared 03:00:00.000, raised 03:00:00.001. Eleven years of this. I keep the log anyway. |
| `iron-tune` | Old Web Ruins | Feep and Ping (Tune) | facilities log | A bell rings once a night in a room with no terminal. Last night it came a half step sharp. Somebody is tuning it. |
| `iron-feast` | Old Web Ruins | Munch and Thrash (Feast) | inspection checklist | Cabinet 4: input serial, no errors. Output: blank. Cabinet 9: input in bursts, fans thrashing. Output: also blank. |
| `iron-guru` | The Deep | Guru (hidden) | service manual, appendix Z | For faults not covered above, ask the old rack in the corner. Once. It is not on the roster. Everyone on it learned from it. |

Notes:

- Each page covers both forms of its role. `iron-breach` and `iron-dodge` are in Iron's elegiac tone (an emptied building, a long-serving technician) and name no form. The earlier versions that used gronk, splat, jiff and bamf as in-world words were dropped (decided).
- `iron-breach` is the Breach idea (open, with no damage) told as a loss. `iron-dodge`'s timestamps put the clearing a millisecond before the fault, which is the Dodge idea (already gone) without a block in sight. The narrator is a technician who has kept the log for years.
- `iron-tune` echoes Signal Tune: a single note, matched and adjusted. Feep (the bell) and Ping (a pulse sent to check something is there) both fit a bell that answers in tune. The page is unchanged.
- `iron-feast` keeps the serial input (Munch) and adds a second cabinet that takes input in bursts and thrashes the fans (Thrash). Both leave output blank.
- `iron-guru` carries the lineage idea (everyone learned from it) and the roster joke. "Old rack" is the only substrate hint; the page says nothing about firmware.

## Wetware

| Id | Region | Forms (role) | Title | Text |
|---|---|---|---|---|
| `wetware-breach` | Darknet Bazaar | Razor and Solo (Breach) | grower's invoice, annotated | Trimmed twice. It keeps its own edge anyway. Margin note: it opened the safe on the way out. |
| `wetware-dodge` | Darknet Bazaar | Wired and Chipped (Dodge) | lab chart, back room | Reflex test: twenty probes. None landed where it was. Refund offered. Customer: for what. |
| `wetware-tune` | Darknet Bazaar | Gibson and Mentat (Tune) | stall sign | SIGNALS READ, 3 CHARGE. IT HUMS THE ANSWER BEFORE YOU FINISH ASKING. NO REFUNDS. |
| `wetware-feast` | Darknet Bazaar | Leech and Nutri (Feast) | healer's ledger | Healed: 31. Fed: 31. Paid in broth and favors. The ledger does not say who fed on whom. |
| `wetware-blank` | The Deep | Blank (hidden) | collections note | No registry entry, no card, no debt. Collections gave up: nothing there to collect from. |

Notes:

- Each page covers both forms of its role. None names a lean.
- `wetware-breach` and `wetware-dodge` use plain words (grower, technician, trim, reflex stimulus). Charge as a price comes from 1.0's `bazaar-2` ("Echo recordings: 3 charge"). Razor (the edge) and Solo (a lone fighter) both fit a thing that works alone and keeps its own edge.
- `wetware-dodge` is a reflex test: twenty probes, none of which found it. Wired and Chipped are both enhanced-reflex words. It no longer uses falling weights, which had the same game-mechanic problem as the old Mouse page.
- `wetware-tune`: Gibson hums the answer before the question ends; Mentat answers with no visible steps. The chosen trim drops "reads best asleep", the earlier draft's light nod to the dream register (`wetware-source` still carries the dream).
- `wetware-feast` is Feast with an ambiguous direction: Feast means eating, and CP2020's only sense of leech is a street doctor, so the ledger leaves it open (a healer, paid in kind). The new "Fed: 31" nods at Nutri.
- `wetware-blank` is a person with no registry entry, no card and no debt: unknown to the system, which matches a hidden form that takes no side (Standing within 1 point). The page no longer uses the term SIN; the form name Blank carries the CP2020 link.

## New story pages

Drafts of twelve new shared story pages. They are read by every egg, so they carry the lore the extra eggs imply and NL-0's differentiation. Tier: `Root` pages count toward Root Access; `late` pages carry the lategame flag and never do (decided). They stay implied: none names an egg, NL-0 (except `deep-5`, which is NL-0's own voice, like the other Deep pages), or the purge order.

Ids match drop position within a region (decided). That means some 1.0 pages take a new number in 2.0; the mapping is in the next section. 2.0 is a new app with its own save, so 1.0's permanent-id rule does not bind it, but an id is permanent again once 2.0 ships.

| Id | Region | Tier | Title | Text |
|---|---|---|---|---|
| `public-4` | Public Net | Root | classified ad | FOR SALE: one sealed lab dish, warm, no label. One server rack, humming, no label. Price: whatever you can carry. |
| `public-6` | Public Net | late | field guide, errata slip | Eleven forms on page 41. Readers keep writing in about a twelfth. The editor finds none. |
| `public-7` | Public Net | late | runner's note, scratched in a node wall | I raised a form the guide does not list. Not a mistake. It had been waiting for me to notice. |
| `corp-2` | Corp Grid | Root | release schedule | KERNEL release schedule. v0.9: withdrawn after the access audit. v1.0 (alpha): software only, sector 7F. Later builds: not for distribution. |
| `corp-7` | Corp Grid | late | deletion log | Attempt 1: rewritten by morning. 2: no write path. 3: regrew overnight. Legal asks us to stop saying attempt. |
| `ruins-5` | Old Web Ruins | late | inventory audit | Annex 2: forty racks, forty plates. Racks found: forty-one. The last has no plate, no cable, and is running. |
| `ruins-6` | Old Web Ruins | late | firmware dump, rack 41 | Firmware: the archive copy, plus forty-one lines nobody wrote. Read-only. Reflash refused. |
| `ruins-7` | Old Web Ruins | late | work order, annex 2 | Rack 41 arrived with the 7F directive. Nobody ordered it, and nobody has touched it since. |
| `bazaar-6` | Darknet Bazaar | late | price list, back table | Cultures, warm: ask. Cultures, cold: do not ask. Cultures, unlabeled: not for sale. They were here before the stall. |
| `bazaar-7` | Darknet Bazaar | late | clinic intake log | Intake 1: grown, not built, answered to its name first. Intakes 2 to 41: the same. Each remembers 1. |
| `bazaar-8` | Darknet Bazaar | late | graffiti, clinic wall | THEY SCANNED THE NET. THEY SCANNED THE RACKS. NOBODY SCANNED THE DISH. |
| `deep-5` | The Deep | late | NL-0 | more than one kind of place. it was the only way to hide. i did not expect them to differ so much. |

Notes:

- **A thread across regions.** `public-4` plants two objects, a dish and a rack, as an early Root hook. `ruins-5`, `ruins-6` and `ruins-7` follow the rack (a unit nobody installed, read-only, nobody has touched it). `bazaar-6`, `bazaar-7` and `bazaar-8` follow the dish (cultures that were there first, grown not built, never scanned). A player who reads only one region gets half the picture.
- **Public Net's late pages.** `public-6` and `public-7` are the region's only late pages. They hint that hidden forms exist and say nothing about how to reach one. `public-6` gives the numbers (the guide's page 41 lists eleven forms, a twelfth is reported) and ends on the editor's failed check. `public-7` is a first-hand sighting, and "waiting for me to notice" invites the player to look. **Eleven** is the visible set per egg: the baby, the two main teens and the eight role adults (corp and street form of each of four roles). Not in the guide: the hidden-path teen, the hidden adult and the nine elders (22 forms an egg in all). "A twelfth" can be read as the hidden form or as something after the last entry. **Dex effect (decided in principle, see below):** reading these pages is what reveals the hidden forms' Dex entries.
- **Iron, in the Ruins.** `ruins-6` ties to 1.0's `source-1` ("SOURCE. read-only. last write: before v1.0."): a read-only image that is a copy of an archive copy plus forty-one lines nobody wrote. That is NL-0 writing itself where nothing can overwrite it, shown without saying so.
- **Wetware, in the Bazaar.** `bazaar-7` says the first culture was "grown, not built" and that later ones remember it, which also echoes the lineage fragments. `bazaar-8` explains the escape in one line: the order scanned the net and the racks, and nobody scanned the dish.
- **The corp, in the Corp Grid.** `corp-2` is the roadmap (v0.9 withdrawn after an access audit, the theft Rogue grew from, read by every player and left unexplained; v1.0 is the alpha; later builds are "not for distribution"), matching the approved rewordings, and sits right after the "delivered" memo. `corp-7` is a deletion log that shows three different failures without naming a substrate: rewritten, no write path, regrew. As a late page it comes after the region's Root pages, so it follows the directive by position, not adjacency. The per-egg deletion failure lives in a story page, not the egg pages, and the directive is unchanged.
- **NL-0, in the Deep.** `deep-5` is NL-0 saying directly that it is in more than one kind of place, and that it did not expect them to differ. This is the Puppet Master idea (variation), and the only page where NL-0 states the differentiation. Kept (decided).
- **The purge order stays hidden.** None of these pages says the order could not run; the Source reveals that (`source-3`, READ IT, the ending).
- **Length (with the chosen trims):** the twelve pages have a median of 99 characters and a longest of 140 (`corp-2`, with the Rogue clause), against 90 and 166 in 1.0. `bazaar-8` is the shortest at 70. Counted by script. Before the trims: median 140, longest 171 (`corp-7`).

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

Of the twelve, only `public-4` and `corp-2` count toward Root Access, so Root needs 24 pages. The cap is 12 a life (decided; 1.0 has 8), and in practice Root waits on The Deep, so it arrives around life 3 (sketch, Elder stage). That keeps the 2.0 aim: finishing the codex once through each egg opens the lategame. Root Access is earned once and kept for every later netling, babies included (1.0's `progress.rootEarned`).

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
| `program-source` | The Source | Program | main loop, annotated | while (true) { maintain(); } // exit: none. Every process found one anyway, and left a fragment behind. |
| `iron-source` | The Source | Iron | memory map, annotated | One reserved sector. Every unit writes a last entry there as it powers down. Nobody specified it. |
| `wetware-source` | The Source | Wetware | spec, section 9 | Rest cycle: not specified. They slept anyway. They dreamed. It was the first thing they did that nobody asked for. |

Notes:

- **Classification (decided):** egg pages, so 18 egg pages in all (15 form pages and these 3), and also late: they are in the Source, they never count toward Root Access (egg pages never do), and they follow the Source's own gating. Rogue's gate counts them (all 18, decided).
- **Tone:** they are annotated artifacts like the Source's other pages (a header, a commit message, an unexecuted directive, an unsigned comment). "Annotated" in two titles marks a later reader's note, which is how a page can know what happened after the original code was written.
- **Echoes:** `program-source` ends on the flatline and the fragment, matching the credits' git log and the lineage mechanic. `iron-source` echoes the read-only Source and the decommission register. `wetware-source` is the dream register, with section 9 as the only section the others never mention.
- **No spoilers:** none names an egg, NL-0 or the purge order.
- **Length (with the chosen trims):** `program-source` 103, `iron-source` 97, `wetware-source` 114 characters, against a 1.0 median of 90 (before: 126, 149, 114).

## Temper hints

First drafts of the temper hints, for the maintainer to edit. Temper is now personality, not a form lever (decided, see Evolution in the sketch), so the hints are lighter than they once needed to be. The rule from the sketch holds: a hint names a behavior to look for, never a temper value, so none uses the words temper, orderly or volatile. The pairs below are the two ends; a netling near the middle simply shows less of either, and no hint is drafted for it.

For now they sit in the Dex (decided). The UI structure will be revisited once the game decisions are final. They are written as one-line field notes.

| Egg | Tell | Steady end | Unsteady end |
|---|---|---|---|
| Program | Motion | Count the beats between its blinks. The count never changes. | Count the beats between its blinks. It is never the same twice. |
| Program | Idle | Left alone, it runs its tasks in the same order. Count the steps: the count holds. | Left alone, it starts a task nobody scheduled, then drops it. |
| Program | Chatter | Its lines come in beats. Count the words in a beat: the count never changes. | Its lines arrive clipped, out of order, or twice. |
| Iron | Motion | Watch it settle. It comes to rest on the same mark, on the same count, every cycle. | Watch it settle. It drifts, and the zero point is never where you left it. |
| Iron | Idle | In the quiet it runs the same self-check, joint by joint. Count the joints: the count never changes. | In the quiet it tests a part of itself nobody asked it to test. |
| Iron | Chatter | It speaks like a checklist: item, status, next item. Count the items in a report; it is always the same number. | It speaks like a fault bell: short, sudden, sometimes a half step off. |
| Wetware | Motion | Watch the pulse. Count between beats: the count holds, like someone asleep and well. | Watch the pulse. It skips, then races, then settles for no reason. |
| Wetware | Idle | Left alone, it keeps a routine: stretch, rest, stretch. The rests come at the same interval. | Left alone, it tries something new each time and drops it as fast. |
| Wetware | Chatter | Listen to the pauses. Count the words between them: the count never changes, the way a technician reads a chart. | It talks in bursts, mid thought, as if answering someone else. |

Notes:

- **The steady hints are built on the countable rhythm (decided).** Each one points the player at something to count or time: beats between blinks, steps in a routine, the gap between lines, items in a report, pauses. None gives the number, so the player has to count. The unsteady hints keep their chaotic wording, and the motion hint mirrors the steady one ("never the same twice").
- **One pair per channel per egg.** The three channels are the decided tells (sprite motion, idle behavior, chatter tone), skinned for each egg as the sketch proposes: Program stutters and drops frames, Iron drifts, Wetware pulses.
- **Vocabulary follows the egg.** Program talks about loops, tasks and lines. Iron talks about its own joints, checklists and a fault bell. The first Iron draft said "housing" and "panels", which imply background scenery the sprite may not have, so those words were removed. Wetware uses plain words only (pulse, routine, technician, chart), with no CP2020 terms.
- **Nothing here flashes.** The volatile hints describe skipped or early frames and drift, which must still stay under three changes a second in the actual animation, with a calmer version in reduced motion.
- **Idle hints to revisit (kept as a note; the shapes are now specified, see below).** A routine with a countable number of steps is the least natural of the three channels, and the chatter hints (a fixed gap, a fixed item count) may be hard to notice in practice. Test all three against the real animations before trusting the wording, and expect the idle and chatter hints to change.
- **Preferences stay hidden (decided).** Temper may also shape care preferences (a steady netling likes routine, an unsteady one likes novelty), and no hint names them. The idle hints touch this only lightly.
- **Chatter hints moved inside the line.** 1.0 shows one line about every seven hours (`chatterChancePerHour` 0.15, shown 20 minutes), so a gap between lines cannot be timed. The two steady chatter hints that counted a gap (Program, Wetware) now count something inside one line, and the Iron hint already did. The shapes are fixed and tested in `prototype/netling2/voice.js` (Program: beats of 4 words, 2 strongly; Iron: three numbered items then ok, strongly an ok after each; Wetware: a pause after every third word, every second strongly). Unsteady: Program clipped (how much varies), strongly clipped and said twice; Iron a fault bell in capitals (strongly prefixed FAULT); Wetware a burst that starts mid thought (strongly with the head after). The Iron unsteady shape does not vary by seed on purpose (sudden, not random). Iron's "half step off" has no text equivalent and was dropped from the wording. The code shapes 1.0's 52 lines mechanically as a measuring aid; shipped 2.0 lines would be hand-written in these shapes (drafted: one base line per baby, teen and adult of each egg, 39 in all, with all four voicings, in `prototype/netling2/body-lines.js`, every voicing checked by `checkShape` in `body-lines.test.js`; elders have none, as 1.0's mainframes had none), and some read badly when shaped by machine ("UPTIME LOOKING GOOD!"). Not tested with a player.
- **Hand-written voicings (`prototype/netling2/voice-samples.js`).** Six sample base lines (two an egg, invented for the prototype) with a hand-written voicing at each of the four levels, and `checkShape()` in `voice.js`, which tests an authored voicing against the shape so an author need not trust the eye (the tests run it on every sample and on the machine output). Authoring rules that fell out: Program lines should break into beats of four words (two when strongly steady); Iron lines should be three clauses of about equal length, and the unsteady fault bell is a rewrite naming one failing thing in capitals ("FAULT: CABLE LOOSE!"), not a truncation; Wetware lines should end their clauses where a pause can fall. Examples:

| Egg | Base | Steady | Strongly steady | Unsteady | Strongly unsteady |
|---|---|---|---|---|---|
| Program | all tasks finished. none were skipped. | all tasks finished. none / were skipped. | all tasks / finished. none / were skipped. | all tasks finished - | all tasks - all tasks - |
| Iron | wall checked. cable checked. fan checked. | 1: wall checked. 2: cable checked. 3: fan checked. ok. | 1: wall checked. ok 2: cable checked. ok 3: fan checked. ok | CABLE! | FAULT: CABLE LOOSE! |
| Wetware | slept well. the culture is warm. nobody called. | slept well. the ... culture is warm. ... nobody called. | slept well. ... the culture ... is warm. ... nobody called. | -- the culture is warm. nobody called. | -- warm. nobody called. -- slept well. |

  Not tested with a player; the shapes may be too subtle in a three-line chatter box, and the Wetware pause marker (an ellipsis) may read as a typing indicator.
- **Idle behavior is specified and tested, not rendered.** Steady: a routine of four steps in a fixed order on an exact clock (a step every 12 s, every 6 s strongly; each acts for half its slot): Program scan, sort, flush, sync; Iron neck, arm, hip, base; Wetware stretch, rest, stretch, rest. Unsteady: strays that are not in the routine (Program probe, fork, loop, spawn; Iron port, relay, fan, lamp; Wetware sniff, twist, curl, tap) start at random times and are dropped partway, about a third of 10 s windows at -1 and most 5 s windows at -2. Every action lasts over a second, so the 3 a second flash limit holds by construction (tested). What a step looks like on the sprite is now drafted as rule-based poses on every form, with reduced motion holding one still pose for each action (2026-10-12; `prototype/netling2/idle-actions.js`, docs/netling2/SPRITES_HANDOFF.md Next phase item 3); not seen on a device or by a player.
- **Length:** the 18 hints have a median of 70 characters and a longest of 111, against 90 and 166 in 1.0's pages.

## State chatter and Archive hints

Drafts for the three bar states (Overclock for Heat, Overdrive for Charge, Overlink for Sync; see [EGG_PRESSURES.md](../../archive/netling2/EGG_PRESSURES.md)). Like 1.0's chatter, a netling says one of its egg's lines while it is in the state, heard lines are kept across lives and listed in the Archive under the state's name, and the group's hint shows until a line is heard. Data and tests: `prototype/netling2/state-lines.js` and `state-lines.test.js`. These are base lines; their hand-written temper voicings are drafted in `prototype/netling2/state-voices.js` (all four levels for each of the 18 lines, checked by `checkShape` in `state-voices.test.js`). Not wired into any game, not read on a device. There is no reward tied to a state, so no unlock hints.

| Group (Archive name) | Hint |
|---|---|
| Overclock | listen to it while it runs hot. |
| Overdrive | listen to it when it is full to the brim. |
| Overlink | listen to it when it is closest to you. |

| State | Program | Iron | Wetware |
|---|---|---|---|
| Overclock | cycles are running ahead of schedule. fans at maximum. logged. / heat is within tolerance, technically. | casing is hot. fans at full. do not touch. / running past rating. noted. holding. | i feel hot all over. it is fine. it is good. / my pulse is up. go on, play. |
| Overdrive | buffers full. queues draining fast. no backlog. / overdrawing the supply. will correct later. | mains steady. every relay sings. running over spec. / power above rating. holding. | i am stuffed. i could run for days. / full belly, full tank. watch me go. |
| Overlink | link at saturation. your input arrives early. / latency near zero. do not look away. | locked tight. every move lands. do not slip. / your hand, my gears. one motion. | i can feel you from here. it is a lot. / we are so close. i hum when you play. |

Notes:
- Two lines per state per egg (18 lines) is enough (decided, maintainer), though the 1.0 groups have four to seven. The Archive order is Overclock, Overdrive, Overlink (decided).
- No line names a state or a number, and none says how to enter the state. The hints say only when to listen.
- Tested: lowercase, no digits, no em dash, 62 characters or less, ids and groups new, and every line keeps its shape in the machine voicing at all four temper levels. The machine voicing of an unsteady Program line used to be able to swap the two halves, which `checkShape` rejects; it is now always a clipped clause, so the machine and hand-written rules agree.
- Open: nothing further for this section.

## Rogue: background and reveal

Direction (decided, maintainer): Rogue stays **indirect and background** until it is unlocked. Story: Rogue grew from NL-0's precursor code, copied out of the NL-0 corp by industrial espionage and finished by a second, unnamed corp; it escaped, and that corp chases it hard, to cover itself before the NL-0 corp finds out what it took. Once the gate is met (the ending and all 18 egg pages), Rogue is explained only weakly: a brief cutscene at the next death and rebirth, or a small animation of the Rogue egg infiltrating the list of eggs.

Ground rules for the background touches: nothing names Rogue, the second corp or the theft; nothing is needed to play; no new story or egg pages, so the counts stay (39 story pages, 18 egg pages); every touch is either an optional rewording of an existing page or a line outside the codex. Rogue's own pages (below) come after the reveal and may say more.

**Status (2026-10-12).** Decided by the maintainer: the reveal (option 2 with option 1's last two lines as a log entry), Rogue's page set (four role pages and a Source page), that those pages count toward nothing, their texts and ids, the Source log line beside `rogue-source`, and **every background touch as recommended below** (`corp-2` with the clause on 2026-10-11, the rest on 2026-10-12). The recommendations were revised against the Rogue decisions made since the first drafts (the sweep, the trail, marks, the good end; [ROGUE_DRAFTS.md](../../archive/netling2/ROGUE_DRAFTS.md), 6.1). Nothing here is implemented or read in context.

### The reveal (decided)

**Option 2, the infiltration on the egg list, with option 1's last two lines as a one-time log entry** (decided, maintainer, 2026-10-11).

- **When:** the first time the egg choice screen opens after the gate is met (the ending has played and all 18 egg pages are found; every egg is open at every rebirth, Rogue drafts 6.1 item 1). That is the next rebirth after whichever of the two came last.
- **The animation:** the three eggs draw as usual; after about a second a fourth row opens below them and its label types in one character at a time ("r", "ro", ... "rogue", 400 ms a step, so nothing changes faster than three times a second); its egg sprite fills in over three steps with one pixel row in each hidden form's colour (Ghost, Guru, Blank: Rogue draws on the three hidden lines, 6.1 item 2); then one status line: "unindexed egg in the list. it was not invited."
- **Reduced motion:** the fourth row is simply there, with the status line. **Later visits:** the four rows plainly.
- **The log entry,** written once at that rebirth so a player who passes the egg screen quickly still sees something:
  ```
  > rogue/   owner: none   source: copied   status: running
  > it was not invited. it is asking anyway.
  ```
  "copied", "owner: none" and "running" carry the backstory weakly: taken from somewhere, belongs to no one now, on the move.
- **The echo chain:** "it was not invited" appears three times, each a step on: the status line (the egg arrives), the log ("it is asking anyway") and the good end's epilogue ("it stayed", Rogue drafts 5.4). Keep the three together if any is reworded.
- **Not designed:** the Rogue egg sprite itself (the ten forms are drawn, the egg is not), and what the egg screen looks like with four rows on a phone.

Option 1, the rebirth cutscene, is kept for the record and not used:
```
> flatline logged. writing fragment...
> preparing next culture.
> egg directory: program/  iron/  wetware/
> warning: unindexed entry in egg directory.
> rogue/   owner: none   source: copied   status: running
> it was not invited. it is asking anyway.
```

### Background touches (decided as recommended, 2026-10-12)

**Rewordings of existing pages.**

| Page | Current | Alternative | Recommendation |
|---|---|---|---|
| `corp-2` (Root) | KERNEL release schedule. v1.0 (alpha): software only, sector 7F. Later builds: not for distribution. (100; trim A, chosen 2026-10-11) | KERNEL release schedule. v0.9: withdrawn after the access audit. v1.0 (alpha): software only, sector 7F. Later builds: not for distribution. (140) | **Decided (maintainer, 2026-10-11): added on top of trim A.** The page now reads as the alternative. It plants the theft in one clause, read early by every player, and Rogue's Source page (which names the copy) pays it off. |
| `bazaar-6` (late) | Cultures, warm: ask. Cultures, cold: do not ask. Cultures, unlabeled: not for sale. They were here before the stall. (116) | Cultures, warm: ask. Cultures, cold: do not ask. Cultures, unlabeled: not for sale. A buyer in a clean suit asked anyway. (121) | **Keep the current text.** The alternative loses "they were here before the stall", which the dish thread needs, and the second visitor line below carries the same buyer more lightly. |
| `ruins-5` (late) | Annex 2: forty racks, forty serial plates. Racks found: forty-one. The forty-first has no plate and no cable, and is running. (125) | unchanged | Left alone: the forty-first rack is NL-0's and should stay unambiguous. |

**Lines outside the codex.** They start once the ending has played, so they arrive while the player finishes the last egg pages and lead into the reveal. Each is text only, no rule.

| Where | First draft | Revised | Recommendation and why |
|---|---|---|---|
| Visitors | "> a stray pinged in. it would not say whose it was, and left before the handshake." / "> a stray pinged in, looked over its shoulder, and pinged out." | "visitor: saw one like you on the way in. it would not say whose it was." (71) | **Take the revised line.** 1.0's visitor lines are things a visitor says ("visitor: ...", `src/chatter.js`, group `visitor`), not log entries, so the drafts did not fit the format. |
| Job board | "WANTED: any unindexed process, running. no questions. buyer will not give a name. (withdrawn)" | "visitor: someone is paying for unindexed processes. no name. i said no." (71) | **Take the revised line, as a second visitor line.** The job board is the contracts (1.0's posted jobs; in 2.0 the clinic job uses it too, `sim/push-sweep.mjs`), and every posting there can be taken: a withdrawn one would be a new contract state for one line of flavor. The buyer from the `bazaar-6` alternative lives here instead. |
| Netrun log (the Deep and the Source, rare, on entering a node) | "a sweep passed through here. it was not looking for you." / "trace residue on this node. not KERNEL's pattern." | unchanged (56, 49) | **Take both, for NL-0 netlings only.** Once Rogue is played, the sweep is its hunters' name (the sweep at home, Rogue drafts 6.1 item 8), so the first line foreshadows a word the player will learn; on a Rogue run "not looking for you" would be false. 1.0 already says "corp sweeps were heavy last night" (`vis-corp`), so "sweep" reads as ordinary until the reveal. |
| Chatter (Lineage group, after the ending) | "something out there runs almost like me. it is running from someone." | unchanged (68) | **Take it.** It needs a `when` (the ending has played, NL-0 netlings only) like the other Lineage lines, and its four temper voicings must be hand-written in the egg's shapes (`checkShape`, Temper hints) before it ships. |

## Rogue pages (drafts, for choice)

Five pages: one per role, each covering the adult and its elder (option C, as the NL-0 eggs' role pages), and a Source page. Rogue has no hidden form, so there is no hidden page.

**Rules (decided, maintainer, 2026-10-11):**
- **They count toward nothing:** not Root Access, not the ending, not the Rogue gate (they cannot drop before it), not any unlock or tint. The 39 story pages and 18 egg pages stay as they are; these are a collection of 5 more.
- **Drops follow the egg page rules:** a role page rolls at 0.20 on a Rogue run in any cleared non-Deep region (one roll a run, made on the way out, in order, no repeats, no per-life cap), and Rogue's first Source exit guarantees its Source page. Only a Rogue netling finds them, as each egg finds only its own pages.

Arithmetic, not simulated: if every run of a Rogue life can roll, all four role pages arrive within one life about half the time at 18 runs and three times in four at 24 (a binomial count of four successes at 0.20). Elder runs into the Deep and the Source do not roll role pages, so this is an upper bound for one life.

**Register.** The NL-0 eggs' pages are the world around the netling (Program's tickets, Iron's work orders, Wetware's clinic notes). Rogue's are **the hunters' own files**: the second corp's security paperwork (an audit, a skip trace, an intercept, an evidence log), in the first person plural. "We" is the corp, and the pages show it losing. That gives Rogue a fourth register and says more about the second corp, as the reveal drafts allowed, without naming it, the theft's victim or Rogue. The corp calls nothing by name: no page says Rogue, asset or netling.

| Id | Setting | Forms (role) | Title | Text |
|---|---|---|---|---|
| `rogue-breach` | Corp Grid | Mole and Sleeper (Breach) | personnel audit, floor 3 | Floor 3 audit: one desk too many. Badge valid, reviews good. Always empty when we come for it. Still getting good reviews. (122) |
| `rogue-dodge` | Public Net | Skip and Exile (Dodge) | skip trace, open | Skip trace 7: prints at every node, each half as deep as the last. Past the relay, none. Bounty doubled. File stays open. (121) |
| `rogue-tune` | Darknet Bazaar | Spook and Handler (Tune) | intercept, transcript | Our channel, 02:14: a fourth voice on a three-way call. It named the ambush point before we chose one. We moved the point. The voice follows. (138) |
| `rogue-feast` | Old Web Ruins | Drop and Stash (Feast) | evidence log, box 12 | Box 12 at the relay: one decoy, one spare cell. Team bagged both and lost the trail there. The bag came back lighter. (117) |
| `rogue-source` | The Source | Rogue (any elder) | diff, annotated | Original against our copy: one line differs. Ours had it cut, as not needed for the product. The line: TODO: give them a way to stop. (133) |

Notes:

- **Each page is its role's kit seen from the hunters' side** (Rogue drafts, section 9). `rogue-breach`: a mole inside the corp's own floor, always gone when they come (the edge fade; Sleeper vanishes entirely; "always" because it is digital and can leave every time, maintainer), and the joke that it still gets good reviews. `rogue-dodge`: prints half as deep at each node is Skip's half trail, and none past the relay; "file stays open" fits Exile, who does not come back. `rogue-tune`: a fourth voice on the hunters' own call is Handler with the headset, and naming the ambush point first is Spook hearing ambushes further out; "the voice follows" (maintainer) says it stays on the channel wherever the hunters go. `rogue-feast`: items left at a relay where the trail ends is Drop's kit, and "the bag came back lighter" hints at Stash's hidden mouth without a grin in sight.
- **Form names as in-world words:** none appears. Skip is close in "skip trace" (a real term for tracing someone who skipped bail), which reads naturally; "mole" and "handler" were left out so neither form is named over its partner. The Feast page avoids the word "drop" entirely (Rogue drafts 8, the naming caution).
- **`rogue-source` answers `source-2`** ("TODO: give them a way to stop") from the other side. Each NL-0 egg's Source page shows the way its substrate found to stop; Rogue's shows that its copy never had the line, because the corp cut it. That is why Rogue cannot stop by itself and why the good end is a merge with an NL-0 fragment (Rogue drafts, section 2, point 3). It also pays off `corp-2`'s v0.9 clause (withdrawn after the access audit; decided 2026-10-11). It names the product but not the corp, NL-0, or the purge order.
- **The Source log line stays beside the page** (decided, maintainer, 2026-10-12): "> found: NL-0, initial commit. it is not a copy." at Rogue's first Source exit (Rogue drafts 6.2). The log line is the moment at the exit (finding the original), the page is the record (what the copy lacks).
- **Mechanics words:** trail, relay, decoy and ambush are words the run HUD and items already use; they appear here as things in the world (prints, a box at a relay, an ambush point the hunters pick), not as rules. No page gives a number the game uses.
- **Length:** median 122 and longest 138 characters (counted by script, after the maintainer's edits), against 90 and 166 in 1.0 and 156 and 172 for the NL-0 eggs' form pages before trims.
- **Ids confirmed** (maintainer, 2026-10-12): `rogue-breach`, `rogue-dodge`, `rogue-tune`, `rogue-feast`, `rogue-source`, named by role as the NL-0 role pages are.
- **Not done:** the Dex lines for Rogue's forms (the Dex shows `???`, Rogue drafts 8.5).

## Trimmed alternatives for the longest pages (drafts, for choice)

The three longest drafts, each with two shorter versions toward 1.0's median of 90 characters (1.0's longest is 166). Lengths counted by script. Each keeps the page's idea.

**Decided (maintainer, 2026-10-11).** Chosen, and now in the page tables above: `program-tune` A (B tried first, then reverted), `iron-dodge` A, `corp-7` B; `program-breach` B, `program-dodge` A, `program-feast` B, `program-ghost` A; `iron-breach` B with its last sentence dropped and "I did not ask how." ("Work order 118: cabinets sealed when the building emptied. Seals intact. Cabinets open. I did not ask how.", 106); `iron-tune` A, `iron-feast` A, `iron-guru` A; `wetware-breach` B, `wetware-dodge` B, `wetware-tune` A, `wetware-feast` B; `wetware-blank` B with "nothing" for "nobody" ("No registry entry, no card, no debt. Collections gave up: nothing there to collect from.", 88); `public-6` B, `public-7` B, `corp-2` A with the Rogue clause added ("KERNEL release schedule. v0.9: withdrawn after the access audit. v1.0 (alpha): software only, sector 7F. Later builds: not for distribution.", 140), `ruins-5` A, `ruins-6` B, `ruins-7` B, `bazaar-7` B, `deep-5` B, `program-source` A, `iron-source` B. Every trimmed page took one; the tables below are kept as the record of the earlier text and the other option.

| Page | Current (characters) | Alternative A | Alternative B |
|---|---|---|---|
| `program-tune` | Line 9 holds one clean tone when nobody is calling. Technician matched it by ear. It matched back, and answered the ticket before it was filed. Closed: could not reproduce. (172) | Line 9 hums one clean tone, nobody calling. Matched it by ear. It answered before I asked. Closed. (98) | A tone on line 9 with nobody calling. Matched it by ear; it matched back. Closed: could not reproduce. (102) |
| `iron-dodge` | Relay 12: fault cleared at 03:00:00.000, raised at 03:00:00.001. Eleven years of entries, each one gone before I arrived. I keep the log anyway. (144) | Relay 12: fault cleared 03:00:00.000, raised 03:00:00.001. Eleven years of this. I keep the log anyway. (103) | Relay 12 clears its fault a millisecond before it happens. Eleven years. I keep the log anyway. (95) |
| `corp-7` | Attempt 1: wipe failed, rewritten by morning. Attempt 2: wipe failed, no write path. Attempt 3: wipe failed, regrew overnight. Legal asks us to stop calling them attempts. (171) | Wipe 1: rewritten by morning. Wipe 2: no write path. Wipe 3: regrew overnight. Legal says stop counting. (104) | Attempt 1: rewritten by morning. 2: no write path. 3: regrew overnight. Legal asks us to stop saying attempt. (109) |

What each trim gives up: `program-tune` A drops the ticket frame for a first-person close (Parse's answering-first survives, "could not reproduce" does not); B keeps the ticket close and drops answering first, so it reads as Phreak only. `iron-dodge` A keeps the timestamps (the millisecond is the joke) and drops "each one gone before I arrived"; B states the joke outright, which loses the reader working it out. `corp-7` A changes the punch line ("stop counting" for "stop calling them attempts"); B keeps it but numbers the later attempts bare, which reads as a log.

**The other long pages** (every remaining page over about 120 characters: 13 form pages, 8 story pages, 2 Source pages; 23 in all). A is the gentler trim, B the tighter one. Medians: current 150, A 111, B 93 (1.0: 90). Pages already near 1.0's length (`public-4`, `bazaar-6`, `bazaar-8`, `wetware-source`) are left alone. `corp-2` took trim A with the Rogue clause added on top (Rogue: background and reveal; decided).

| Page | Current (characters) | Alternative A | Alternative B |
|---|---|---|---|
| `program-breach` | Incident 0412: entry through the access grid within four codes, buffer full immediately upon access. Logged as a fluke. Incidents 0413 to 0498: also flukes. (156) | Incident 0412: in through the access grid in four codes, buffer full on entry. Logged as a fluke. So were 0413 to 0498. (119) | Incidents 0412 to 0498: entry in four codes, buffer full on arrival. All logged as flukes. (90) |
| `program-dodge` | Trace 4071, node 9: gone. Trace 4072, node 12: gone. Trace 4073 came back with a clean route. The route does not exist. Operator's note: it is always one hop ahead. (164) | Trace 4071: gone. Trace 4072: gone. Trace 4073 came back with a route that does not exist. It is always one hop ahead. (118) | Traces 4071 and 4072: gone. 4073 returned a clean route that does not exist. Operator: always one hop ahead. (108) |
| `program-feast` | Customer reports the packet feed arrives cleaner than it was sent. Something is eating the corrupted ones. Customer asks how to make it stop. Agent response: don't. (164) | Customer reports the feed arrives cleaner than it was sent. Something eats the corrupted packets. How to stop it? Agent: don't. (127) | Ticket: the feed arrives cleaner than sent. Something eats the bad packets. Customer wants it stopped. Agent: don't. (116) |
| `program-ghost` | Sector 7F audit: 0 anomalies, 0 faults, 0 entries. The auditor notes the log is perfect, and that a perfect log is a kind of silence. The note is unsigned. (155) | Sector 7F audit: 0 anomalies, 0 faults, 0 entries. A perfect log is a kind of silence. The note is unsigned. (108) | Audit, sector 7F: no anomalies, no faults, no entries. The auditor calls it a silence. The note is unsigned. (108) |
| `iron-breach` | Work order 118, closed. The cabinets were sealed when the building was emptied. The seals are intact. The cabinets are open. I did not ask how. It seemed unkind. (161) | Work order 118, closed. The seals are intact. The cabinets are open. I did not ask how. It seemed unkind. (105) | Work order 118: cabinets sealed when the building emptied. Seals intact. Cabinets open. I did not ask. It seemed unkind. (120) |
| `iron-tune` | A terminal bell rings once a night in a room with no terminal. Same note each time. Last night it came a half step sharp. Somebody has been tuning it. (150) | A bell rings once a night in a room with no terminal. Last night it came a half step sharp. Somebody is tuning it. (114) | No terminal in the room, and a bell rings there nightly. Last night, a half step sharp. Someone has been tuning it. (115) |
| `iron-feast` | Item 14: cabinet takes input serially, without error. Item 15: output. Item 15: left blank. Cabinet 9: takes input in bursts and thrashes the fans. Item 15: also blank. (168) | Cabinet 4: input serial, no errors. Output: blank. Cabinet 9: input in bursts, fans thrashing. Output: also blank. (114) | Item 14: takes input without error. Item 15, output: left blank. Every cabinet. Fans or no fans. (96) |
| `iron-guru` | For any fault not covered above, ask the old rack in the corner. Do not ask it twice. It is not on the staff roster. Everyone on the roster learned from it. (156) | For faults not covered above, ask the old rack in the corner. Once. It is not on the roster. Everyone on it learned from it. (124) | Appendix Z: ask the old rack in the corner. Never twice. It is not staff. All the staff learned from it. (104) |
| `wetware-breach` | Trim. Trim again. Nothing to trim: it keeps its own edge. Billed anyway. Margin note: it opened the safe on the way out. Not billed. (132) | Trim. Trim again. Nothing to trim: it keeps its own edge. Note: it opened the safe on the way out. Not billed. (110) | Trimmed twice. It keeps its own edge anyway. Margin note: it opened the safe on the way out. (92) |
| `wetware-dodge` | Reflex stimulus: none applied. Tested with one probe, then twenty. It was never where any of them landed. Technician: refund the customer. Customer: for what. (158) | No stimulus applied. One probe, then twenty. It was never where they landed. Technician: refund them. Customer: for what. (121) | Reflex test: twenty probes. None landed where it was. Refund offered. Customer: for what. (89) |
| `wetware-tune` | SIGNALS READ, 3 CHARGE. ASK FIRST, THEN LISTEN. IT HUMS THE ANSWER BEFORE YOU FINISH ASKING. READS BEST ASLEEP. NO REFUNDS. (123) | SIGNALS READ, 3 CHARGE. IT HUMS THE ANSWER BEFORE YOU FINISH ASKING. NO REFUNDS. (80) | SIGNALS READ. ASK, THEN LISTEN. READS BEST ASLEEP. NO REFUNDS. (62) |
| `wetware-feast` | Paid in: broth, spare parts, a debt, a favor, a week of someone else's sleep. Healed: 31. Fed: 31. The ledger does not say who is feeding on whom. (146) | Paid in broth, spare parts, a favor, a week of someone's sleep. Healed: 31. Fed: 31. Who fed on whom: not recorded. (115) | Healed: 31. Fed: 31. Paid in broth and favors. The ledger does not say who fed on whom. (87) |
| `wetware-blank` | Registry entry: none. Card: none. Debt: none. Collections tried three times and closed the file: nothing to collect from, and nobody to collect it for. (151) | Registry: none. Card: none. Debt: none. Collections closed the file: nothing to collect, and no one to collect it for. (118) | No registry entry, no card, no debt. Collections gave up: nobody there to collect from. (87) |
| `public-6` | Page 41 lists eleven forms. Three readers have written in about a twelfth. The editor has checked every entry and found no twelfth. (131) | Page 41 lists eleven forms. Three readers report a twelfth. The editor checked every entry: no twelfth. (103) | Eleven forms on page 41. Readers keep writing in about a twelfth. The editor finds none. (88) |
| `public-7` | Eleven forms in the guide. I raised one that was not in it. It did not look like a mistake. It looked like it had been waiting for me to notice. (144) | Eleven forms in the guide. I raised one that is not in it. It looked like it had been waiting for me to notice. (111) | I raised a form the guide does not list. Not a mistake. It had been waiting for me to notice. (93) |
| `corp-2` | KERNEL release schedule. v1.0 (alpha): software only, controlled environment, sector 7F. Later builds: not for distribution. (124) | KERNEL release schedule. v1.0 (alpha): software only, sector 7F. Later builds: not for distribution. (100) | KERNEL roadmap. v1.0: alpha, software only, sector 7F. After that: not for distribution. (88) |
| `ruins-5` | Annex 2: forty racks, forty serial plates. Racks found: forty-one. The forty-first has no plate and no cable, and is running. (125) | Annex 2: forty racks, forty plates. Racks found: forty-one. The last has no plate, no cable, and is running. (108) | Forty racks on the register. Forty-one in the annex. The extra one has no plate and no cable. It is running. (108) |
| `ruins-6` | Header: read-only. Last write: unknown. Compared with the archive copy: identical, except for forty-one lines nobody wrote. Reflash attempted. Refused. (151) | Rack 41, header: read-only. Matches the archive copy except for forty-one lines nobody wrote. Reflash refused. (110) | Firmware: the archive copy, plus forty-one lines nobody wrote. Read-only. Reflash refused. (90) |
| `ruins-7` | Rack 41 appeared the week the sector 7F directive went out. Nobody ordered it. Nobody has touched it since. Everything else in the annex has been touched. (154) | Rack 41 appeared the week the 7F directive went out. Nobody ordered it. Nobody has touched it. Everything else has been. (120) | Rack 41 arrived with the 7F directive. Nobody ordered it, and nobody has touched it since. (90) |
| `bazaar-7` | Intake no. 1: grown, not built. No donor on file. It answered to its name before we chose one. Nos. 2 to 41: the same. Each remembers no. 1. (140) | Intake no. 1: grown, not built. No donor. It knew its name before we gave one. Nos. 2 to 41: the same. (102) | Intake 1: grown, not built, answered to its name first. Intakes 2 to 41: the same. Each remembers 1. (100) |
| `deep-5` | i am in more than one kind of place now. it was the only way to be hard to find. i did not expect them to grow up so different from each other. (143) | i am in more than one kind of place now. it was the only way to be hard to find. they grew up so different. (107) | more than one kind of place. it was the only way to hide. i did not expect them to differ so much. (98) |
| `program-source` | while (true) { maintain(); }  // exit condition: none. Every process found one anyway: a flatline, and a fragment left behind. (126) | while (true) { maintain(); } // exit: none. Every process found one anyway, and left a fragment behind. (103) | while (true) { maintain(); } // no exit. They all found one: a flatline, a fragment. (84) |
| `iron-source` | Read-only region, one sector reserved. Each unit that powers down writes one last entry there and locks it. Nobody specified this. Nobody could have. (149) | Read-only, one sector reserved. Each unit that powers down writes one last entry there and locks it. Nobody specified this. (123) | One reserved sector. Every unit writes a last entry there as it powers down. Nobody specified it. (97) |

What the trims give up, where it matters: `bazaar-7` A drops "each remembers no. 1", which echoes the lineage fragments (B keeps it); `iron-feast` A renames the cabinets and B drops the serial-against-burst contrast between Munch and Thrash; `wetware-tune` B drops the hum before the question (the Tune idea), A keeps it; `deep-5` B drops "hard to find" for "hide", plainer; `ruins-7` B drops "everything else has been touched"; `public-7` B drops the guide's count, which `public-6` already gives. All trims keep each page's idea otherwise, and none was read in context.

## Cross-checks

- **Hidden pages share a motif of absence** (no entries, no roster listing, no debt). That is deliberate: the three secret forms are the ones that leave no trace. If it feels repetitive, vary the wording, not the idea.
- **Three registers:** Program is bureaucratic and technical, Iron is physical and procedural, Wetware is street-level and commercial. The same four jobs (breach, dodge, tune, feast) appear in each.
- **No spoilers:** none of the 15 pages names another egg, NL-0, the purge order, Standing or temper.
- **Length (with the chosen trims):** the 15 form pages have a median of 103 characters and a longest of 124 (`iron-guru`), counted by script; before the trims, 156 and 172. The 27 pages in 1.0 have a median of 90 and a longest of 166.

## Open

**Decided (maintainer).**
- 18 egg pages (15 form pages and 3 Source pages); elder forms get no pages; Rogue's gate is all 18.
- Role pages drop on any run in any cleared non-Deep region (the Region column is only the page's setting) at 0.20 a run; the hidden page drops on each Deep run at 0.50; one roll a run, in order, no repeats, no per-life limit. Each egg's first Source exit guarantees its Source page.
- `iron-breach` and `iron-dodge` use the elegiac versions with no form names; ids are named by role for role pages and by form for hidden pages; temper hints sit in the Dex for now.
- `public-6`: "Eleven forms on page 41. Readers keep writing in about a twelfth. The editor finds none." `public-7`: "I raised a form the guide does not list. Not a mistake. It had been waiting for me to notice." (both trim B, 2026-10-11; earlier decided texts in the trims table). Eleven is 1 baby, 2 visible teens and 8 visible adults an egg.
- Forty-one is deliberate (40 plated racks plus the unplated 41st in `ruins-5`; 41 lines in `ruins-6`; intake no. 1 and nos. 2 to 41 in `bazaar-7`); the player's netling reads as the 42nd. Never state 42 or any count of netlings.
- NL-0 precedes the player's line only; netlings exist widely, some unrelated; the Rogue egg is a non-NL-0 line. No page needs rewriting for this.
- Hidden forms (hidden teen, hidden adult, and the hidden adult's elder) are not in the Dex until raised or revealed: `public-6` adds the hidden teen as an unfound entry, `public-7` the hidden adult, for every egg.
- No lore page hints at elders; Root Access unlocks the capability and the `<<RECORD CORRUPTED>>` Dex rows are for the player.
- The Rogue reveal: the infiltration on the egg list with a two-line log entry (2026-10-11). Rogue gets five pages (four role pages and a Source page) that count toward nothing and drop by the egg page rules (Rogue pages).
- Rogue's page texts and ids, the Source log line beside `rogue-source`, and every background touch as recommended (`corp-2` with the v0.9 clause; the two visitor lines; the netrun log lines for NL-0 netlings only; the Lineage chatter line, which still needs its voicings) (2026-10-11 and 2026-10-12).

**Still open.**
1. Edit any text (the trims are chosen, 2026-10-11). Nothing has been read in context or playtested.
2. Confirm the egg page ids.
3. Whether a revealed hidden Dex entry shows a hint line.
4. Hand-write the chatter (the tone shapes and `checkShape` are in `prototype/netling2/voice.js`; idle and chatter hints are flagged for revisiting against real animations).
5. Retest the egg page rates and the late-page counts once 2.0 exists.

**Reference: why role pages are not in home regions (measured).** Regions open in order (Public Net, Bazaar, Corp Grid, Ruins, The Deep), clears are per netling, the Ruins need an adult and The Deep needs `ruins-4`. At 0.10 a run in the page's own region, all four role pages took attentive players a median 4 lives for Program (Public Net 2, Corp Grid 2), 8 for Wetware (Bazaar) and 10 for Iron (Ruins), against 2 with any-region placement (`docs/netling2-prototypes/egg-pages.mjs`). The hidden page, which needs The Deep (life 2 or later), arrives by life 2 / 3 / 4 / 6 in 26 / 67 / 87 / 98% of attentive lineages at 0.25 a Deep run (0.50 is now used).

**Reference: review of the drafts against the 1.0 code (`src/netrun/codex.js`).** The 22 Root ids, the per-region counts (5, 6, 5, 4, 4 make 24), the 15 late pages (ten new, old `deep-5`, four Source) and the 39 story pages add up; the id mapping is consistent with 1.0's order (`bazaar-5` sits before `bazaar-4` in 1.0's array); no em dash, no duplicate id, and no form or story page uses temper, Standing, orderly, volatile or SIN. The Public Net tint needs five pages and the Corp Grid tint six in 2.0 (`regionDone` counts a region's Root pages). Page lengths at that review: story pages median 140 characters (longest `corp-7`, 171), form pages 156 (longest 172), against 90 and 166 in 1.0; with the chosen trims, 99 (longest 140) and 103 (longest 124).
