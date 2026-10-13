# Netling 2.0: Rogue text (drafts, decided and under review)

Status: text for the Rogue egg. Most of it is decided (section 10.7 onward lists what); the maintainer's text review is still pending. Extracted unchanged from section 10 of the archived [Rogue drafts](../../archive/netling2/ROGUE_DRAFTS.md), which keeps the design discussion around it. Section numbers below are that file's, so cross-references still resolve there. Rogue's codex pages and background are in [CODEX_DRAFTS.md](CODEX_DRAFTS.md) (Rogue: background and reveal; Rogue pages).

## 10. The rest of the text (drafts for choice, 2026-10-12)

The text section 10 listed as not done: the abilities' flavor, the sweep's and the hunter's wording, Rogue's meter words and its death register. Nothing here is implemented, read in context, read on a device or played; every line is a first draft for the maintainer to choose and edit. Lengths are in characters, counted by script; 1.0's ability lines run 32 to 121 (`src/netrun/run.js`, `FORM_ABILITIES`).

### 10.1 Rogue's own register

The pages already have a register (the hunters' files, codex drafts). The netling's side needs one too, for the log, the HUD and the death screen. **Proposal: a fugitive's tradecraft, terse, in the status-line voice the reveal set** ("rogue/ owner: none source: copied status: running", "it was not invited. it is asking anyway.", "found: NL-0, initial commit. it is not a copy."). Under the egg's own rules (care drafts' Frame): log lines lowercase with `> `, run messages with no prefix, `!!` on the penalty lines, button labels in capitals at 9 characters or fewer, no number the player is not already shown, and the netling as "it". The hunters are "they" and are never named, as on the pages.

The base vocabulary stays software (Rogue is a copy of the precursor code, so its virus is a virus and its bug a bug); only the hunt and a few meters take tradecraft words. Words kept out: the form names (Mole, Skip, Spook, Drop, Sleeper, Exile, Handler, Stash, Alias, Foundling) as common words, "drop" anywhere (8.3's caution), "slip" outside a run (Wetware's fault word), "fever", "drift", "worn", "reboot", and the anomaly button LEAVE IT (1.0, "do nothing").

### 10.2 The abilities' flavor

Format as the netrun drafts' 3.5: a name, a one-line description in the Dex and the run's ability line (1.0's `FORM_ABILITIES` style: "Name: what it does."), and the log line the run prints when the part acts. The elder line says what it adds, as 1.0's `MAINFRAME_ABILITIES` do. The placeholders of 9.2 are kept where they read well and changed where they collide.

**The egg's own part (every Rogue form that jacks in):**

| Name | Description | Log line |
|---|---|---|
| **Tradecraft** | Every node reads as danger or quiet from the start. Checkpoints never notice it. (80) | at the run's start: `danger and quiet, every node. no names yet.`; at a checkpoint: `the checkpoint never looked up.` |

**The four lines:**

| Form | Name | Description | Log line |
|---|---|---|---|
| Mole | **Inside man** | ICE hits it for less, and a hunter hits it no harder than plain ICE. (68) | on a hunter fight: `it has worked for them. it knows how they hit.` |
| Sleeper | **Deep cover** | ICE hits it for less still. Once a run, a lost hunter fight costs no mark and no link. (86) | `lost to the hunter. kept its cover.` |
| Skip | **On the lam** | ICE often never notices it, and it leaves half the trail on the move. (69) | on a slip: `gone before the ICE turned on.` (maintainer; it reads both ways: before the ICE switched on, and before it turned on it) |
| Exile | **Over the wall** (maintainer, for Long gone) | Unnoticed more often, and it can slip past an ambush. (53) | `the ambush closed on an empty node.` |
| Spook | **Wiretap** (maintainer, for Listening post) | Sees node types two steps ahead, and hears an ambush a step further. (68) | when it tells an ambush apart: `ambush ahead. it heard them set up.` |
| Handler | **Agents out** | Three steps ahead, ambushes at four. Once a run it sends an agent the other way. (80) | `an agent went the other way. the trail followed it.` |
| Drop | **Foldering** (decided, maintainer; was Dead letter) | Finds more in caches and on beaten ICE, mends on a win. It can plant an item at a relay. (88) | `saved to drafts at the relay. the trail ends there.` |
| Stash | **Hoard** | Finds more, mends more. What it plants at a relay is still there when it gets out. (82) | at the run's end: `the drafts were still there. all of them.` |

Notes:
- **Two new buttons.** Handler's agent and Drop's relay item are the player's to use (the bot chooses them in the fork), so each needs a label: **SEND OUT** (Handler, any node, once a run) and **PLANT** (Drop and Stash, at a relay). PLANT replaces "leave", which would collide with the anomaly button LEAVE IT. Their hints, numberless: SEND OUT `throws them off for a while`; PLANT `one item, and the trail goes cold here`.
- **Renamed from 9.2:** Drop's *Dead drop* is **Dead letter** (a dead letter box is the British name for the same thing), for 8.3's caution; Handler's *Runs agents* is **Agents out**, a name rather than a phrase. *Hoard* stays (Stash and hoard are near, but one is a form and one a part, as Hardened and Firewall were in 1.0); the alternate is **Nest egg**.
- **Inside man's line** echoes `rogue-breach` (a desk on the hunters' own floor). **Hoard's line** echoes `rogue-feast` ("the bag came back lighter"). **Agents out** is Handler's split shadow in play (8.4i).
- **The Source rules (6.1, item 49) stay out of the descriptions** (the Dex would then carry four Source clauses the player meets late), and each gets a log line when it acts, so it is learned in play:

| Line | Source rule | Log line |
|---|---|---|
| Mole, Sleeper | one lost ordinary fight forgiven, at a roll | `that one did not count. no one saw it.` |
| Skip, Exile | the slip works half as often | none (a reduction has no moment) |
| Spook, Handler | one lost ordinary fight replayed | `it heard that one coming the second time.` |
| Drop, Stash | the exit counts as clean at Integrity 80 or more | at the exit: `out with enough left. clean.` |

- **Alternates:** *Tradecraft* as **Gut feeling** (plainer, and it names the shut third eye's sense rather than a skill). *Wiretap* and *Over the wall* were alternates here and are now the names (maintainer, 2026-10-12); Over the wall is a prison break, which suits the elder that does not come back (`rogue-dodge`, "file stays open").
- **Foldering (decided, maintainer, 2026-10-12, with PLANT).** Foldering is the digital dead drop: two people share one mail account and leave messages as unsent drafts, so nothing is ever sent and nothing crosses the wire to be read. *For:* it is the digital form of Dead letter on Rogue's software base, it avoids the word "drop", and a drafts folder is something that fills up, which leads into the elder's **Hoard** (the folder became a hoard; the hoard line above now says so). *Against:* few players know the term, and on its own it reads as filing. Proposal: take it, and let the log lines teach it ("saved to drafts at the relay", "the drafts were still there"), the way "skip trace" carries itself on its page. The button can stay **PLANT**, or become **DRAFT** (5) to match; DRAFT ties the button to the name, PLANT says what happens to the item. Dead letter stays the alternate.

### 10.3 The sweep (at home)

The sweep takes the trace's and the intrusion's slot (6.2), so it needs the event bar, the alert line, a notification and its log lines.

**Event bar and answers.**

| 1.0 | Rogue | Note |
|---|---|---|
| Corp trace and Intrusion | **SWEEP** | the fork's label already |
| HIDE | **LIE LOW** | HIDE means street Standing on the NL-0 eggs; Rogue has none, so the word is free to be its own |
| DEFEND | **COUNTER** | countersurveillance; it plays the intrusion's mini-game as DEFEND does |
| Decoy (item) | Decoy | unchanged; the item name is the same in every egg |

**Alert line** (key `sweep`; it replaces `trace` and `attack` for Rogue):
- `Sweep inbound. LIE LOW or COUNTER within Nm.` (45 with two digits)
- In the HIDE lockout: `Sweep inbound and no cover. COUNTER within Nm.` (47)

**Notification:** class Events, title **Netling: sweep inbound**, body the alert line (care drafts, Notification texts).

**Log lines.**

| Moment | Line |
|---|---|
| A sweep starts | `> !! sweep inbound. 90m to get clear.` |
| LIE LOW | `> it lay low. the sweep went past.` |
| The lockout starts (with LIE LOW) | `> that route is burned. no cover for 4h.` (the fork's "route burned. no cover for Nm.", in the log's voice) |
| LIE LOW refused in the lockout (the button's hint) | `no cover yet. COUNTER, or a Decoy.` |
| Decoy | `> the sweep followed the decoy instead.` (the fork's line, kept) |
| COUNTER won | `> sweep countered. they lost the signal.` |
| The quiet after a won COUNTER | `> quiet on every channel. for now.` |
| COUNTER lost | `> !! countered too late. they have a mark on it.` |
| Ignored | `> !! the sweep found it. they have a mark on it.` |
| The second mark (home or run) | `> !! two marks. one more and it burns itself.` |
| The quiet ends (optional, no notification) | `> the channels are busy again.` |

Notes: no line gives the Integrity cost (the HUD shows it; the care drafts' rule). "Mark" is the one word for both home and run, so the player learns that a mark is the same thing wherever it came from. The quiet's end line is optional: it tells an attentive player the 8 hours are over, at no notification cost, but it also turns an unseen timer into a seen one.

### 10.4 The hunter (in runs)

**The HUD.** Two Rogue-only readouts beside the egg's meters (10.5):

| Readout | Label | Hover |
|---|---|---|
| The trail (`run.hunt`) | **TRAIL** | "What it leaves behind. Full, and the hunter comes." |
| Marks (three pips, home and run) | **MARKS** | "Marks they have on it. At three, it burns itself before they can take it." |

**Node marks.** Danger sense draws a mark, not a word, on every node; the screen reader and the hint read **danger** and **quiet**. Once a node is within sight it shows its real label, as on every egg. An ambush Spook or Handler has told apart is labelled **AMBUSH** (6; ICE stays ICE for the rest). The hunter's fight screen is titled **HUNTER**.

**Run messages** (no prefix, `!!` on the penalty lines; the home log adds `> netrun (region): ` before the last one, as on every egg):

| Moment | Message |
|---|---|
| The trail passes half | `something is on the trail now.` (maintainer: moved here from near full) |
| The trail is near full | `hunters are circling closer now.` (maintainer) |
| At a relay, with the trail past half (a hint, the relay question) | `out here, or one more layer?` |
| A cordon on the map (the Deep and the Source, at the start) | `a cordon past the relay. no quiet way through.` |
| The hunter arrives | `the hunter caught up.` |
| The hunter beaten | `hunter shaken. the trail goes cold.` |
| The hunter wins | `!! the hunter got a mark on it. link cut.` |
| An ambush entered | `ambush. they were waiting.` |
| An ambush beaten (its trail still rises) | `ambush broken. they know where it went.` |
| An ambush lost | `!! ambush. a mark, and the link cut.` |
| The third mark, anywhere | `!! third mark. it burned itself before they could.` (see 10.6, capture) |

Notes: the trail lines are numberless, like the egg anomalies' hints; the meter shows the count. The cordon line says "past the relay" because a cordon always sits after one (9.7), which holds in the Source's second cordon only loosely; a plainer alternative is `a cordon ahead. no quiet way through.` The relay hint is the one line that asks the player something; it shows only when the trail is past half, so it does not nag a quiet run.

### 10.5 Rogue's meter words

Rogue has all four meters and the cache, with no main bar (6.1, item 3). Two sets:

| 1.0 meter | R1, Program's words | R2, two tradecraft words (recommended) | R2 hover text |
|---|---|---|---|
| Charge | CHG | CHG | "Charge. Feed it." |
| Sync | SYN | **TRUST** | "Its trust in you. Play with it." |
| Integrity | INT | INT | "Its soundness. At zero too long, it goes dark." |
| Heat | HEAT | HEAT | "Running hot hurts it. Cool it." |
| Cache (pips) | CACHE | **BURN** | "What it must not leave behind. Shred it." |

- **R1** says the copy outright: Rogue reads like Program because it was cut from the same code, and the hunt (TRAIL, MARKS) carries all its difference. Cheapest; no new word to learn.
- **R2 (recommended)** gives Rogue a screen of its own with two words that fit a fugitive and collide with nothing: TRUST (the player is the one contact it has; Sync's "play with it" reads true) and BURN (a burn bag, the waste a spy has to destroy). With BURN, the purge button is **SHRED** and the overflow event **BAG FULL**, answered by SHRED; every other label stays Program's. The alert lines follow: `Trust is fading. It wants to play.`; `The burn bag is filling up.`
- **Not proposed:** COVER for Integrity (strong, but a blown cover reads as capture, and capture is the marks, not Integrity); a tradecraft word for Heat ("heat" already means pursuit in the slang, and LIE LOW raises the meter, which would read backwards). Heat stays HEAT and is plainly the temperature.
- The run HUD follows the meter words, as on every egg (care drafts, decided).

### 10.6 The death register

The other three each end in their own way (Program a flatline, Iron a decommission, Wetware a waking), which answers the Source's TODO three times. Rogue's copy had that line cut (`rogue-source`), so its register should be **one that does not stop**: it is not over, only out of reach. The one real stop is the good end, "it stayed" (5.4).

**D1, gone dark (recommended).** A fugitive who goes dark drops off every channel and is not heard from again. Nothing says it ended.

| Where | 1.0 | Rogue (D1) |
|---|---|---|
| Death screen header | FLATLINE | **GONE DARK** (9) |
| Death screen line | `netling.vN.0 is gone: CAUSE.` | `netling.vN.0 has gone dark: CAUSE.` |
| Log | `> FLATLINE: CAUSE. fragment recovered: TRAIT.` | `> GONE DARK: CAUSE. left for pickup: WHAT.` (WHAT is what crosses: the trait on a full life, else the keepsake) |
| Cause, old age | end of life cycle | **end of the line** (the lineage and the run, both) |
| Cause, collapse | integrity collapse | integrity collapse (unchanged; a plain fact reads well beside "gone dark") |
| Capture | (none) | header **TAKEN**; line `netling.vN.0 was taken: three marks. it burned itself first.`; log `> !! TAKEN. it burned itself first. nothing left for them to open.` then the pickup line (see below) |
| The good end | (none) | **STAYED** when the next egg is Rogue, **MERGED** when it is an NL-0 egg (the mixed egg); decided (maintainer, 2026-10-12). Lines and the order of screens below |

**Capture as a self-destruct (maintainer, 2026-10-12).** At the third mark the hunters do not get it: Rogue would rather delete itself than be taken, so the life ends by its own hand an instant before capture. Text only; the rule is unchanged (three marks end the life, block the good end and pass no trait line; the quirk key, keepsake and scrip still cross, 6.1 item 46; the fork's cause stays `captured`). It fits what is already there: the pages show the corp losing, the hunters' file closes empty, the fragment still goes to the player ("left for pickup"), and BURN (10.5) is already the meter for what must not be left behind, so the last thing in the burn bag is itself. TAKEN stays the header (maintainer): the hunt took it from the player, even though the hunters got nothing.

Drafts for the third-mark line (run message and home log; the death screen line above follows the chosen one):

| | Line | Note |
|---|---|---|
| a (decided) | `!! third mark. it burned itself before they could.` | plain; says who acted and that the corp lost |
| b (maintainer's) | `!! third mark. burn notice in effect.` | ties to BURN and reads well, but a burn notice is, in the real term, issued by an agency to disown its own agent; a player who knows it may read the corp as the actor. It works if read as Rogue disowning itself, which no one else would do for it |
| c | `!! third mark. into the burn bag, last of all itself.` | the BURN tie made explicit; longer |
| d | `!! third mark. self-destruct.` then `> it left them nothing.` | the maintainer's word; two lines |

Death screen alternates to the recommended line: `netling.vN.0 was taken: three marks. self-destruct.`; or a header **BURNED** in place of TAKEN (closer to what happened, and D2's one good fit; not recommended, since TAKEN was the maintainer's call). Art note: a self-destruct invites a death animation or mark of its own; not drawn, and it must keep to the flash rule (nothing faster than three times a second).

**The good end's two headers (decided, maintainer, 2026-10-12).** A good end is recorded by what the player does next. If the next egg is **Rogue**, the line goes on as any Rogue rebirth does and the generation is **STAYED**; if it is **Program, Iron or Wetware**, the next netling is the mixed egg (6.1, item 42) and the generation is **MERGED**. Drafts:

| | STAYED (next egg Rogue) | MERGED (next egg NL-0) |
|---|---|---|
| Death screen line | `netling.vN.0 stayed.` | `netling.vN.0 merged into iron/.` (the chosen egg's name) |
| Log | `> STAYED. left for pickup: TRAIT.` | `> MERGED: rogue/ into iron/. left for pickup: TRAIT.` |
| Epilogue (5.4) | none; the log adds `> it was not invited. it stayed.` so the reveal's echo chain still closes | the epilogue (the full one the first time, its last two lines later, 6.2) |

**The screen order (decided, maintainer, 2026-10-12: the egg prompt first).** Today the death screen comes first and the egg prompt after it (COMPILE; docs/netling2/UI.md), so at the death screen the next egg is not known yet. Decided: on a good end only, **the egg prompt comes first** (it is the merge choice in all but name, and the epilogue already needs the chosen egg), then the epilogue for MERGED, then the death screen with its header. The choice not taken was to keep the order, show a neutral line on the death screen, and write STAYED or MERGED only into the log, the Lineage tab and the credits' git log once the egg is picked; that keeps one flow for every death but leaves the moment without its word. Either way the record (Lineage, credits) carries the header.

**NL-0's rescue.** The fork lets Root Access pull a Rogue back from integrity collapse (never from capture, old age or the good end; `sim.js`, `rootRescue`). NL-0 reaching a line that is not its own deserves a line of its own: `> NL-0: not mine. not yet. (integrity collapse reversed. root access spent for this generation.)` Optional, on a capture with Root unspent: `> NL-0: i cannot reach them.` Both name NL-0, which Rogue's player already knows (the gate is the ending).

**Alternates.** **D2, burned** (an agent whose cover is blown): strong for capture, wrong for old age, and close to the lockout's "route burned". **D3, signal lost**: plain and safe, but it sits next to Program's flatline and says nothing of Rogue.

**Not drafted here:** Rogue's dead and asleep sprite marks (art; the other eggs have a chest mark each, docs/netling2/SPRITES_HANDOFF.md), and its failure words (virus, cache, fault, bug, the clearing button), proposed to stay Program's under either meter set, with BURN replacing the cache word under R2.

### 10.7 For the maintainer

1. The register (10.1): tradecraft on a software base, the netling as "it", the hunters as "they".
2. The ability names and lines (10.2), the two buttons SEND OUT and PLANT, and whether the Source rules show only as log lines.
3. The sweep's labels LIE LOW and COUNTER, the alert lines and the log lines (10.3), and whether the quiet's end gets a line.
4. The hunter's HUD words TRAIL and MARKS and the run messages (10.4).
5. Meter words: R1 or R2 (10.5).
6. Death register: D1, D2 or D3 (10.6), the capture header TAKEN, the good end's STAYED, and NL-0's rescue line.

**First review (maintainer, 2026-10-12).**
- **Decided:** Skip's line `gone before the ICE turned on.`; **Wiretap** (Spook) and **Over the wall** (Exile); the sweep's lines as drafted (10.3); the trail's half line `something is on the trail now.` and near-full line `hunters are circling closer now.`; **R2** for the meter words (TRUST, BURN; SHRED and BAG FULL with it); **D1, gone dark**, with every row but capture as drafted; both NL-0 lines; the third mark as a **self-destruct**, under the header **TAKEN** (10.6).
- **Second review (maintainer, 2026-10-12), all decided:** **Foldering** for Drop with **PLANT** (Dead letter dropped; DRAFT not used); the third-mark line **(a)**, `!! third mark. it burned itself before they could.`, with the death screen line `netling.vN.0 was taken: three marks. it burned itself first.`; the rest of 10.2 as drafted (Tradecraft, Inside man, Deep cover, On the lam, Agents out, SEND OUT, the Source log lines); the rest of 10.4 as drafted (TRAIL, MARKS, danger and quiet, AMBUSH, HUNTER, the run messages); the good end **STAYED** for a Rogue next egg and **MERGED** for an NL-0 one.
- **Third review (maintainer, 2026-10-12):** the good end's screen order as proposed (the egg prompt first, then the epilogue for MERGED, then the death screen with its header), and the STAYED log lines as drafted. **Section 10 is fully decided**; what is left is in section 11.

### 10.8 One feed: SCAVENGE (decided, maintainer, 2026-10-12)

**Decided (maintainer):** Rogue has no Standing, so it has **one feed button, SCAVENGE** (8 characters), not the corp and street pair. The other two eggs' two feeds differ by Standing (and Program's corp packet gives a little more Charge, the scavenged one rolls an infection), so with no Standing the second button has no reason to exist. The control bar keeps its place: the empty slot can stay dim or the row can close up (a layout question for the 2.0 UI pass, docs/netling2/UI.md). Rogue's packet is the scavenged one: 25 Charge, no Standing, no trail at home (6.1 item 5: feeding never adds trail).

**What one packet breaks, and the answers (proposed, then decided by the maintainer, 2026-10-12; the fork's default now, `ROGUE.oneFeed` with `oneFeedVirus` 0.5; `ROGUE_FEED=0` gives the two feeds back and pins the earlier saved runs; tested in `rogue-sim.test.js`):**
- **The temper packet preference** (a steady netling likes the same packet again, an unsteady one a change) has nothing to choose between: a steady Rogue would match on every feed and an unsteady one never. **Proposal: off for Rogue's feeds.** Temper still shows in the games' preference and in the three tells (10.9).
- **The favorite-packet quirk** (+8 Sync on its favorite) would fire on every feed for half of Rogues and never for the others. **Proposal: it does nothing on a Rogue;** the quirk key still crosses lives, so a later NL-0 netling keeps it.
- **Licensed** (corp packets give more Charge) can reach a Rogue as an inherited trait after the first good end (a Feast corp parent). **Proposal: it acts on SCAVENGE,** so an inherited trait is never dead weight.
- **The infection roll.** Every Rogue feed would now roll it (12% a feed). The open choice below.

**Measured** (fork, 300 lives of each of the 37 archetypes, the decided Rogue settings, `MERGEBOT=refuse`; measured while the switch was off by default, so the two-feed row now needs `ROGUE_FEED=0`, and the F2 row is the fork's default; outputs `baseline/results/followup/rogue-onefeed-*.json`; Program's line is the same settings with Program as owner, for scale):

| | full life | infections a life (all / attentive 25) | captured | collapse |
|---|---|---|---|---|
| Rogue, two feeds (today's fork) | 77.9% | 6.05 / 6.8 | 16.6% | 5.5% |
| **F1: SCAVENGE, the full infection roll** | 77.6% | 11.08 / 13.0 | 16.0% | 6.4% |
| **F2: SCAVENGE, the roll at half** | 77.8% | 7.14 / 8.3 | 16.3% | 5.9% |
| Program, for scale | 89.6% | 7.05 | | 10.4% |

1. **Survival does not move** in either case (within 0.3 points, under the 1.5 points of noise at 300 lives; the attentive group is 98.5 to 98.7% in all three). A cure is a button press, and the bots press it.
2. **The workload does.** F1 nearly doubles infections (6 to 11 a life; 13 for attentive players), so an attentive Rogue patches about twice as often as a Program player. F2 puts Rogue at about Program's count (7.1 against 7.05), which is where Rogue's missing intrusion (6.2) had left it a little under.
3. **Decided: F2** (`oneFeedVirus` 0.5; maintainer: "Rogue has it hard enough"). The reason it was recommended: Rogue is meant to be harder through the hunt, not through more chores, and the notification budget (4.4) is the scarce thing for an attentive player; F1 is kept as the harder option (`ROGUE='{"oneFeedVirus":1}'`). The log keeps the infected-payload line: `> scavenged. charge up.`, and on an infection `> scavenged. charge up. !! payload was infected.`

### 10.9 Rogue's chatter and temper tell (decided, maintainer, 2026-10-12)

Rogue's netling speaks in chatter like every egg (first person, lowercase, one line every few hours), so it needs its own lines and its own temper shape for them. Data and tests: `prototype/netling2/rogue-lines.js`, `rogue-lines.test.js`; the shape is in `voice.js` (`chatterTone`, `checkShape`, `ROUTINE`, `STRAYS` for `rogue`; Rogue stays out of `EGGS`, as in `tell.js`, so the launch eggs' tests are unchanged).

**The shape, from the glance.** Rogue's motion tell is a glance over its shoulder (8.1; `tell.js`), so its lines stop to look:
- **Steady:** a check after a fixed count of words, `(clear)` every fifth word (every third strongly). The glance on the beat, finding nothing. Countable, as the other eggs' steady shapes are.
- **Unsteady:** it breaks off to look behind it, `(behind?)`, once somewhere inside the line, then picks the line up again; strongly, it looks back twice and never finishes (the line ends on the look).
- **Idle (the third channel):** steady, a four-step watch on the clock: left, right, behind, still. Unsteady, strays that are never in the watch: flinch, freeze, duck, bolt. Names only; nothing is drawn.

Example (Mole): `i sat at their desk all day. nobody looked up.`

| Steady | Strongly steady | Unsteady | Strongly unsteady |
|---|---|---|---|
| i sat at their desk (clear) all day. nobody looked up. | i sat at (clear) their desk all (clear) day. nobody looked (clear) up. | i sat at their desk all day. (behind?) nobody looked up. | i sat at their desk (behind?) all day. (behind?) |

**Body lines** (one each for the baby, the teen and the four adults; elders have none, as on every egg):

| Form | Line |
|---|---|
| Foundling | nobody sent for me. i came anyway. |
| Alias | new name today. it fits better than the last. |
| Mole | i sat at their desk all day. nobody looked up. |
| Skip | i was gone before they finished the sentence. |
| Spook | they talk on an open channel. i just listen. |
| Drop | i left something for you. same place as before. |

**State lines** (two a state, in the existing Overclock, Overdrive and Overlink groups and hints):

| State | Lines |
|---|---|
| Overclock | running hot. heat shows up on their scans. / too warm to hide well. worth it, for now. |
| Overdrive | full up. i could run for days if i had to. / packed and ready. say the word and we go. |
| Overlink | you are the only one i talk to. keep it that way. / when you play, i forget to look behind me. |

Notes:
- **Echoes:** Foundling's line is the reveal's "it was not invited. it is asking anyway." from the inside; Mole's is `rogue-breach`; Spook's is `rogue-tune` from the other end of the call; Drop's is the dead letter left for the player. The last Overlink line is the glance turned off: closest to the player, it stops checking behind it (its unsteady voicings still look, right after "when you play,").
- **Tested** (`rogue-lines.test.js`): one line per non-elder form; two per state; lowercase, no digits, no em dash; body lines 50 characters or less and state lines 62 (the other eggs' limits); no state name; no Rogue form name as a word and never "drop"; no repeat of any egg's line or 1.0's; every hand-written voicing passes `checkShape`; the steady voicings only add the checks; the machine voicing keeps the shape on any line at every level and seed; and the idle watch and strays.
- **The NL-0 Lineage line** "something out there runs almost like me. it is running from someone." (decided as a background touch, codex drafts) now has its four voicings in each launch egg's shape, as that decision required before it ships (`LINEAGE_ROGUE_LINE`, id `lin-almost-like-me`, tested). Program: `something out there runs / almost like me. it / is running from someone.`, clipped `something out there runs almost -`; Iron: `1: something out there. 2: runs almost like me. 3: running from someone. ok.`, bell `UNKNOWN UNIT RUNNING!`; Wetware: `something out there ... runs almost like ... me. it is ... running from someone.`, mid thought `-- there runs almost like me. it is running from someone.`. The strong voicings are in the file.

**Temper hints for Rogue: none (decided, maintainer, 2026-10-12),** with the Dex hints (10.12). The drafts are kept for the record. The other eggs show one pair of hints per tell channel in the Dex (codex drafts, Temper hints). Rogue's forms show `???` and get no Dex hints (decided, 10.12), so the question is whether the egg's temper hints go too. Drafts, in case they stay:

| Tell | Steady end | Unsteady end |
|---|---|---|
| Motion | Watch where it looks. It checks over its shoulder on the same count, every time. | Watch where it looks. It checks behind it whenever it likes, either way. |
| Idle | Left alone, it keeps watch: each way in turn, then still. Count the checks: the count holds. | Left alone, it flinches at nothing and stops halfway. |
| Chatter | It stops to make sure it is clear. Count the words between checks: the count never changes. | It breaks off mid line to look behind it. |

Dropped with the Dex hints, as recommended, for the reason the maintainer gave for the forms: a Rogue player has read every other egg's hints by then, and the glance, the watch and the checks are the same three tells in a new skin.

### 10.10 The good end's offer (decided, maintainer, 2026-10-12)

At a clean Source exit (no fight lost on the run, hunter fights included; 6.1 item 41) a Rogue elder is offered the good end at once; declining keeps it armed for the elder's death at the end of its life cycle, unless a later mark disarms it (item 13), and another clean exit re-arms it and offers it again.

**The offer** (on the run's end screen, after the Source's results and, on the first exit, after `> found: NL-0, initial commit. it is not a copy.`):

```
the Source is behind it. it found the line its copy was missing.
it can stay.
```

| Button | Label | Hint |
|---|---|---|
| Accept | **STAY** | `this life ends here, by choice.` (31) |
| Decline | **NOT YET** | `it can stay later, if not marked.` (33) |

**Log lines around it:**

| Moment | Line |
|---|---|
| STAY | the good end flow (10.6: the egg prompt, the epilogue for MERGED, the death screen) |
| NOT YET | `> not yet. it can still stay when its time comes.` |
| A later mark disarms it | `> !! they marked it. staying is off until it comes out clean again.` |
| Another clean exit re-arms it | the offer again (STAY, NOT YET) |
| An armed elder reaches the end of its life cycle | the good end flow, no prompt (it was already chosen by declining) |

Notes: STAY carries the echo chain ("it was not invited. it stayed.") into the button itself; NOT YET is NL-0's own "not yet" from the Root rescue line, which a Rogue player has seen. No line says "good end", "merge" or "armed". Hints are kept to 35 characters, the length of 1.0's longest anomaly hint and the tutorial's hint limit. The hint for NOT YET is the one place the player is told that a mark matters after the Source; it is a rule they need to make the choice, and it gives no number. Alternate labels: **STAY HERE** (9) and **KEEP GOING** (10, one over the limit, so not used); **GO ON** for NOT YET (shorter, but "go on" also reads as "continue to the good end").

### 10.11 The Rogue trait's name and description (decided, maintainer, 2026-10-12: Unsigned, with both descriptions)

The trait (6.1 item 48; 9.4a, C1 with E1): innate on every Rogue and on the mixed egg for its one life, never inherited. On a Rogue, every region's hunter threshold +2; on the mixed egg, a quarter of its corp traces arrive as visitors. Trait descriptions follow `sim.js` `TRAITS` (a name and a short plain sentence, no number: "Corp traces find it less often").

| Name | On a Rogue | On the mixed egg | Note |
|---|---|---|---|
| **Unsigned** (decided) | `The hunters take longer to pick up its trail.` | `Some corp traces turn out to be friendly visitors.` | unsigned code carries no signature, and the hunt hunts a signature (section 2; the epilogue's "sweep: signature not found") |
| No signature | as above | as above | says the same plainly; longer, and close to the epilogue's line |
| Off the books | as above | as above | tradecraft; it was E3's name for a different effect, which may confuse the record |

Two descriptions, one per rule set, since the trait does different things on the two; the Lineage tab and the Dex show the one for the netling's egg. "Friendly" is there because a corp trace that becomes a visitor would otherwise read as a corp visit.

### 10.12 The Dex (decided, maintainer, 2026-10-12)

**No Dex hints for Rogue's forms; each shows `???` until found.** A Rogue player has played every NL-0 egg; with four adults, one per game, and no Standing, evolution by wins is intuited from the other eggs. This closes 8.5's open item.

