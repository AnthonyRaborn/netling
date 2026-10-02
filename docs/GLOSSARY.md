# Glossary

Terms used in the game, the UI and the code, alphabetical. "Code" means the identifier you will see in the source.

Spoilers: this file names hidden mechanics (the Ghost form, The Deep, NL-0).

| Term | Meaning | Where |
|---|---|---|
| **A / B (buttons)** | Normalized input names. `a` confirms, `left` and `right` move. On a controller B quits | `ui/play.js`, `ui/gamepad.js` |
| **Abort** | Ending a netrun early: tap ABORT RUN, then CONFIRM ABORT at the top of the screen (Esc or B: press twice). Loot is forfeited, nothing else | `netrun/run.js` `abortRun` |
| **Accessory** | A cosmetic pixel item drawn on the netling (24 of them, some earned, some found). Fits every form by anchors. One per wear slot is worn at once | `accessories.js` |
| **Advance** | The UI function that ticks the simulation, reacts and saves. Runs each second | `ui/life.js` |
| **Age (`ageMin`)** | Simulated minutes the netling has lived. Not wall-clock; excludes hibernation | `sim.js` |
| **Alert** | The single most urgent reason to call the player back (`alertReason`). Drives the chirp and notifications | `sim.js` |
| **Allegiance** | Hidden axis: positive is corp, negative is indie (scavenged data, hiding). Picks Chrome or Firewall | `sim.js` `axes` |
| **Anchors** | Positions (head top, eyes, mouth, body span) computed from a sprite's pixels so accessories fit any form | `accessories.js` `anchorsFor` |
| **Anomaly** | A netrun node with a two-option risk or reward prompt. Six exist; the purge order turns up only in the Source | `netrun/anomalies.js` |
| **Antivirus patch** | Item: cures a virus and shields against new ones for 6 hours | `sim.js` |
| **Archive** | The dialog with LINEAGE, DEX, CODEX and STYLE tabs, and the SYSTEM button | `ui/archive.js` |
| **Armed button** | A button that needs a second press within a few seconds to confirm (scrap or sell, transfer out, restart) | `ui/app.js` `armed` |
| **Attack / Intrusion** | Timed event: a virus attempt. DEFEND within 60 minutes by winning a mini-game | `sim.js` |
| **Baby** | First life stage, form Bitling. Age 0 to 17 hours (24 for netlings compiled before the 5-day life) | `sim.js` |
| **Bandage** | Earned accessory for surviving a netrun disconnect or an NL-0 rescue | `ui/style.js` |
| **Bazaar** | The Darknet Bazaar netrun region: markets and Black ICE. Second on the way down: needs a teen that has cleared the Public Net | `netrun/regions.js` |
| **Bitling** | The baby form | `sim.js` `SPECIES` |
| **Black ICE shard** | Item: +40 Sync, +20 Heat, may carry a virus, leans indie and unstable | `sim.js` |
| **Black market** | A netrun market that leans indie (-0.5 a buy): cheaper, risky stock, its own accessories. Most of the Bazaar's | `netrun/run.js` |
| **Booster (Signal booster)** | Item: the next mini-game win counts double | `sim.js` |
| **Bored** | The state of being awake with the lights off: Sync drains at twice the rate | `sim.js` |
| **Breach Protocol** | Mini-game: pick grid codes, alternating row and column, to land a target sequence | `games/breach.js` |
| **Buff** | A temporary effect on the netling: `shieldUntilAge`, `traceSkip`, `boost` | `sim.js` |
| **Bypass chip** | Item: cuts 1 hour off the netrun cooldown. Its id is `overclock` (named before the Overclocked state) | `sim.js` |
| **Cache (corrupted cache files)** | Junk files written while digesting. Up to 4. 3 or more damage Integrity. PURGE clears them | `sim.js` |
| **Cache node** | A netrun node that may hold an item, a fragment, or an accessory | `netrun/run.js` |
| **Caretaker tab** | The one browser tab allowed to simulate and save. Others show a guard screen | `ui/tabs.js` |
| **CFG** | The exported object of every tunable rule number | `sim.js` |
| **Charge** | Stat: power. Drains 15.4/hr awake, scaled by the drain curve. Fed by packets | `sim.js` |
| **Chatter** | A line it mutters while awake and idle; lines seen are kept in the Archive's CHATTER tab | `chatter.js` |
| **Check-in** | The daily reward for opening the app once after the netling wakes: a seven-day ladder that pauses, never resets | `checkin.js` |
| **Checkpoint** | A corp scan node: hide, comply, or use a voucher | `netrun/run.js` |
| **Chrome** | Adult form leaning corp. Trait Licensed. Checkpoints wave it through; relays repair it; corp insurance once a run | `sim.js` |
| **Clean clear / clean jack-out** | A netrun that ends by jacking out with no ICE lost. Shortens the next cooldown by 1 hour | `netrun/run.js` |
| **Clear (region clear)** | Reaching a region's exit node. Opens the next region down for that netling (`pet.cleared`) | `netrun/run.js` |
| **Codex** | The 27 lore fragments collected on netruns (22 count toward Root Access). Shared across generations. Each netling can recover at most 8 new ones | `netrun/codex.js` |
| **Codex inbox** | `pet.codexInbox`: fragments a run found, waiting for the UI to bank them into the shared codex | `netrun/run.js`, `ui/archive.js` |
| **Compile / script** | A new generation starts as a `script` that compiles for 3 minutes into a baby | `sim.js` |
| **Comply** | Trace answer: accept the scan. Sync -10, allegiance +1 (no Integrity cost since the corp-choice pass). At a netrun checkpoint: a 5 scrip fee | `sim.js`, `netrun/run.js` |
| **Contract** | A netrun job for one region (reach the exit, get past ICE, crack caches, buy, bring back a fragment), posted while the uplink is ready; every route through that run can meet it | `netrun/run.js` `updateContract` |
| **Coolant cell** | Item: vents 50 Heat | `sim.js` |
| **Cooldown (uplink cooldown)** | Time before the next netrun: 240/210/180 minutes by stage, minus bonuses, never under 120 | `sim.js` |
| **Corp exchange** | A netrun market that leans corp (+0.5 a buy): pricier (less for Chrome), safe stock and the only Corp vouchers for sale, its own accessories. Most of the Corp Grid's | `netrun/run.js` |
| **Corp Grid** | Netrun region full of checkpoints. Needs a teen that has cleared the Bazaar | `netrun/regions.js` |
| **Corp packet (CORP PKT)** | Food: +30 Charge, leans corp | `sim.js` |
| **Corp trace** | Timed event: HIDE or COMPLY within 2 hours or lose Integrity and lean corp | `sim.js` |
| **Corp voucher** | Item: full Charge, waves off a trace | `sim.js` |
| **Crash** | What an ignored memory overflow does: -15 Integrity, cache full, 20 minute reboot | `sim.js` |
| **Crest** | Wardrobe slot: a pixel emblem beside the device label, earned by a legacy goal | `cosmetics.js` |
| **Daemon** | Adult form leaning orderly. Trait Persistent. Charge drains 20% slower. Sees two steps ahead and repairs as it moves in runs | `sim.js` |
| **Drain curve** | Charge and Sync drain faster the fuller they are: 0.39x the base rate near empty, 2x when full (`drainCurve`) | `sim.js` |
| **Dark** | Lights off. Deep rest when asleep, boredom when awake | `sim.js` |
| **Dead / flatline** | The end of a netling. Leaves a fragment | `sim.js` `flatline` |
| **Deep rest** | Napping, or asleep with the lights off: Integrity regenerates 8/hr | `sim.js` |
| **Deep (The Deep)** | Hidden fifth netrun region. Opens for an adult that has cleared the Ruins, once codex fragment `ruins-4` is known | `netrun/regions.js` |
| **DEFEND** | The answer to an intrusion: a random mini-game | `ui/play.js` |
| **Dev mode** | `?dev` in the URL. Time-skip and forced-event buttons | `main.js` |
| **Dex** | The list of the 9 forms seen. Undiscovered forms show a silhouette and a hint | `archive.js` |
| **Digesting** | The 240 minutes after a meal, during which cache files can appear | `sim.js` |
| **Disconnect** | A netrun ends in failure (Integrity or Charge hit 0). Loot lost, one care mistake, emergency reboot | `netrun/run.js` |
| **Echo** | 1) An anomaly with a codex fragment. 2) An "unrealized" adult form: a netling that died before adulthood but whose fragment shows the form it was leaning toward. | `netrun/anomalies.js`, `archive.js` |
| **Effect** | A screen effect cosmetic (scanlines, clean, interlace, rain, bloom, curve, packets, static) | `cosmetics.js` |
| **Event** | A timed thing that needs a response (trace, intrusion, overflow). One at a time | `sim.js` `EVENTS` |
| **Evolution** | Baby to teen at 17 hours, teen to adult at 51 hours (`s.life`; 24 and 72 for older netlings) | `sim.js` |
| **Exit node** | The last node of a map. Banks everything and gives a bonus | `netrun/run.js` |
| **Family tree** | The Lineage tab: every generation oldest first, linked by what each passed down | `archive.js` `lineageChain` |
| **Field manual** | The in-game help dialog, built from live `CFG` values | `ui/onboarding.js` |
| **Firewall** | Adult form leaning indie. Trait Hardened. ICE deals half damage | `sim.js` |
| **Firewall Dodge** | Mini-game: slide between five lanes to avoid falling blocks for 15 seconds | `games/dodge.js` |
| **Flow** | Three good hours in a row, awake: it glows, events are 25% rarer (calm), visitors 25% likelier, and stability builds (+0.2/hr; plain awake time adds none) | `sim.js` `inFlow` |
| **Form** | A netling's body. Eight exist: Bitling, Kernel, Stub, Chrome, Firewall, Daemon, Glitch, Ghost | `sim.js` `SPECIES` |
| **Fragment** | Two meanings. 1) **Death fragment**: what a dead netling leaves (form, trait and its level, history, quirk, keepsake, scrip). 2) **Codex fragment**: a lore entry. Context decides | `sim.js`, `netrun/codex.js` |
| **Gate (write gate)** | `canWrite` in `ui/app.js`: decides whether storage may be written | `ui/app.js` |
| **Generation** | The number of the current netling, shown as `v<n>.0` | `sim.js` |
| **Ghost** | Secret adult form. Neutral allegiance, non-negative stability, 1 mistake or fewer, 29+ wins with 4+ in each game. Trait Untraceable. In runs: sees every node, checkpoints and 45% of ICE miss it | `sim.js` |
| **Glitch** | Adult form leaning chaotic. Trait Volatile. Play gives +10 to +40 Sync. Skips the first ICE, and often later ones | `sim.js` |
| **Grace** | Minutes a need can stay unmet before it counts as a care mistake: 15, or 60 for lights | `sim.js` |
| **GREET** | Optional hello to a visitor, once per visit | `sim.js` |
| **Guestbook** | Friends' netlings greeted from visitor cards, the last 20, under CHATTER as a channel log | `progress.guestbook` |
| **Handle** | A friend's name, built from its card: form and generation (`daemon_g3`), or `???_g5` for a corrupted record | `sim.js` `friendHandle` |
| **Heat** | Stat: rises when active. 65+ is overclocked, 85+ hurts Integrity, 100 is a fault | `sim.js` |
| **Heatwave** | Screen effect: 40 hours overclocked while awake, across lives. The hot-side twin of Aurora | `cosmetics.js` |
| **Hibernate** | Freeze the clock for at least 24 hours. 3 day cooldown after waking | `sim.js` |
| **HIDE** | Trace answer: reroute. Charge -10, Heat +10, leans indie | `sim.js` |
| **History (trait history)** | The grandparent's trait, carried on at half strength beside the parent's (`history`). Adds to the trait when they match, under its cap | `sim.js` `traitStrength` |
| **ICE** | A netrun node guarded by a mini-game. Losing costs Integrity | `netrun/run.js` |
| **Idle** | A quirk: bounce, sway or hover. All idles also wander across the screen | `sim.js` |
| **Integrity** | Stat: health. 0 for 2 hours ends the netling | `sim.js` |
| **Inventory** | 6 item slots | `sim.js` |
| **Jack in / jack out** | Start a netrun / end it safely and bank loot | `netrun/run.js` |
| **Keepsake** | An item an adult form leaves for the next generation | `sim.js` `KEEPSAKES` |
| **Kernel** | Teen form for a well-cared-for first day (2 or fewer mistakes) | `sim.js` |
| **KERNEL (project)** | The in-world corp project that made netlings. Not the same as the Kernel form | `netrun/codex.js` |
| **Label (device label)** | A name for the line, earned when the first netling dies | `cosmetics.js` |
| **Leaning** | Which adult form the axes currently point to (`leaningForm`) | `sim.js` |
| **Legacy goal** | A goal for the whole line (every trait held, a level III trait, five unbroken lives, every adult form raised). Each unlocks a crest | `cosmetics.js` `LEGACY` |
| **Lease** | The `localStorage` fallback for the one-tab rule | `lease.js` |
| **Lights** | The LIGHTS OFF/ON toggle. Affects drain, regeneration and screen | `sim.js` |
| **Lineage** | The record of every dead netling, plus inheritance from parent to child | `archive.js` |
| **Line (`lineOf`)** | The adult form a mainframe grew from: Plat's line is Chrome. A mainframe uses its line's perk, trait, keepsake, chatter and netrun ability | `sim.js` |
| **Lock (transfer lock)** | The screen shown after transferring out. The device stops simulating | `ui/system.js` |
| **Loot** | Items carried in a netrun, banked on jack-out | `netrun/run.js` |
| **Mainframe** | Fourth life stage, after adult: Plat, Airgap, Init, Panic or Whisper. Reached on the last ordinary day with 3 Deep exits this life (or 2 clean) and Root Access in the line. Adds a day of life | `sim.js` |
| **Market** | A netrun node where scrip and Charge buy items and sometimes an accessory, and the inventory sells for half price. Either a black market (leans indie, cheaper, risky stock) or a corp exchange (leans corp, pricier, safe stock); each sells a few accessories the other doesn't | `netrun/run.js`, `netrun/map.js` |
| **Memory overflow** | Timed event: PURGE within 45 minutes or it crashes | `sim.js` |
| **Memory shard** | Item: rewrites one quirk | `sim.js` |
| **Mini device** | Secret prop for owning the nine original shells (`ORIGINAL_SHELLS`) | `ui/style.js` |
| **Mistake (care mistake)** | A need left unmet past its grace. 10 ends the run | `sim.js` |
| **Nap** | Rest on demand for up to 2 hours at 35% drain | `sim.js` |
| **Netling** | The pet | everywhere |
| **Netrun** | The node-map expedition | `netrun/` |
| **Daily trace** | One seeded map a day, the same for everyone on the same date, run once with nothing at stake; it ends in a share line, and ten exits earn the Uptime crest | `netrun/daily.js` |
| **Challenge** | A rule for one run in the Deep or the Source (Glass, Unplugged, Blackout, Bare metal), open after a Deep exit; each earns a cosmetic | `netrun/challenges.js` |
| **Ending** | Every fragment plus a Source exit: the player runs `sudo rm purge`, NL-0 rests, and the credits list the line. Once, with a replay | `ending.js` |
| **NL-0** | The first netling, the story's hidden benefactor. Grants Root Access, and rests after the ending | `index.html`, `sim.js` |
| **Node** | A point on a netrun map: entry, cache, ICE, relay, checkpoint, market, anomaly, exit | `netrun/map.js` |
| **Onboarding** | First-run flow: intro, readme (field manual), nudge, tutorial, done | `ui/onboarding.js` |
| **Origin palette** | NL-0's color scheme. Only rolls for netlings compiled with Root Access | `sim.js` |
| **Overclocked (OC)** | Heat 65+: mini-games and ICE (if jacked in overclocked) run 15% slower and wins drop items 1.5x as often, but a lost game costs Sync and Integrity, lost ICE bites 1.5x, events are 25% likelier, visitors too, and awake time leans stability down | `sim.js` `overclocked`, `netrun/run.js` `run.hot` |
| **Packet Feast** | Mini-game: eat 15 clean packets in 20 seconds, two bad bites lose | `games/feast.js` |
| **Palette** | The netling's colors, a quirk | `sim.js` |
| **Persistent storage** | The browser's promise not to evict our data. Requested at boot | `ui/system.js` |
| **Pet / state** | The live netling object. `pet` in netrun code, `state` or `s` in `sim.js` | |
| **Pitch** | A quirk: the base frequency of its voice, 440 to 880 Hz | `sim.js` |
| **Props** | Style items drawn on the ground beside the netling: cyberdeck, boom box, mini device, plush | `accessories.js` |
| **Public Net** | The starter netrun region, and the first on the way down | `netrun/regions.js` |
| **PURGE** | Clear all cache files, or contain an overflow | `sim.js` |
| **Quirk** | One of five inherited traits of appearance and habit: palette, pitch, idle, favorite packet, sleep offset | `sim.js` |
| **Reboot** | 20 minutes unable to act after a crash | `sim.js` |
| **Relay** | A netrun node: recharge, vent, and an optional safe jack-out | `netrun/run.js` |
| **Request** | It asks for one game, or a COOL when warm, and waits 45 minutes. Missing one costs nothing | `sim.js` `stepRequest` |
| **Rescue** | Root Access reversing a flatline. Sets `rootUsed` | `sim.js` |
| **Reward box** | Where check-in rewards wait until taken (BOX beside the scrip count); per device, moves with a transfer code | `checkin.js`, `ui/rewards.js` |
| **Root Access** | NL-0's rescue from the first premature death. Earned by completing the original 22 fragments of the codex. Also opens the Mainframe stage, and until then mainframe forms read as corrupted records | `sim.js` |
| **SAVE_VERSION** | The save format version. Currently 2. A bump needs a step in `STEPS` | `sim.js`, `migrations.js` |
| **Scavenged data (SCAV DATA)** | Food: +25 Charge, leans indie, 12% infection | `sim.js` |
| **SCRAP** | The inventory button at home: sells an item for a quarter of its price. At an open market it reads SELL and pays half | `ui/hud.js`, `sim.js` |
| **Scrip (corpo scrip)** | The netling's money, 0 to 100. Earned by selling items and found on runs; spent with Charge at markets. Half passes to the next generation | `sim.js` `SCRIP` |
| **Source (The Source)** | Last netrun region, below The Deep. Mainframes only, once The Deep is cleared and `deep-5` is known; `<<SECTOR CORRUPTED>>` while locked | `netrun/regions.js` |
| **Script** | The compiling stage before baby. Also the name of a fresh netling object | `sim.js` |
| **Session** | The currently running mini-game or netrun view, `app.session` | `ui/app.js` |
| **Shell** | The device body cosmetic | `cosmetics.js` |
| **Shield** | Antivirus effect: blocks new infections and intrusions for 6 hours | `sim.js` |
| **Skew** | Dev-mode time offset added to "now" | `ui/app.js` |
| **Sleep offset** | Quirk: shifts bedtime by -2 to +2 hours | `sim.js` |
| **Sleep zone** | `s.zone`: the time zone a netling sleeps by. Taken from the device at compile and at each wake-up, so a day keeps one zone | `sim.js` `deviceZone` |
| **Stability** | Hidden axis: positive is orderly, negative is chaotic. Picks Daemon or Glitch | `sim.js` |
| **Streak** | Consecutive mini-game wins. 10 in a row unlocks a screen effect | `cosmetics.js` |
| **Strict cleaning** | Sanitizing that drops unknown fields, used for imported codes | `sanitize.js` |
| **Stub** | Teen form after a rough first day (3+ mistakes) | `sim.js` |
| **Style** | The Archive tab for cosmetics: shells, tints, effects, sounds, label, accessories, props | `ui/style.js` |
| **Surge (power surge)** | Instant event: +25 Heat, +10 Charge | `sim.js` |
| **Sync** | Stat: bond with the player. Drains 13.2/hr, scaled by the drain curve. Raised by play | `sim.js` |
| **Teen** | Second stage: Kernel, Stub or Shell. 17 to 51 hours | `sim.js` |
| **Test mode** | A separate netling on a fast clock, in its own storage | `ui/app.js` |
| **Tick** | One simulated minute, or the function that runs many | `sim.js` |
| **Tint** | The screen color cosmetic | `cosmetics.js` |
| **Trait** | The perk inherited from the previous netling's adult form. Its strength grows with a streak of the same form (levels, shown as II and III) and with a matching history, up to a cap | `sim.js` `TRAITS`, `TRAIT_CFG` |
| **Trait level** | How many generations in a row ended as the form behind a trait (1 to 3, `traitLevel`); each level adds 0.25 strength | `sim.js` `levelStrength` |
| **Transfer code** | `NL1.` string holding a full save, movable between devices | `transfer.js` |
| **Transmission** | The NL-0 message shown when the codex completes | `index.html` |
| **Tune (Signal Tune)** | Mini-game: lock a sweeping wave onto a target, 2 of 3 rounds | `games/tune.js` |
| **Unrealized** | A death fragment whose form the netling never became (it died before adulthood) | `archive.js` |
| **Uplink** | The netrun connection. "Uplink cooling down" means the cooldown | `netrun/run.js` |
| **Virus** | Infection that costs 12 Integrity/hr. PATCH cures it | `sim.js` |
| **Visitor** | A stray netling that plays with yours for 10 to 20 minutes. GREET it for a line and better gift odds | `sim.js` |
| **Visitor card** | A link or QR of a netling's look and one feat; a friend who opens it gets a visit within the hour | `visitcard.js` |
| **Wake (wake it)** | Ending a nap early, or ending hibernation | `sim.js` |
| **Wardrobe** | The stored equipped cosmetics | `cosmetics.js` |
| **Wear slot** | Where an accessory sits: `head`, `face`, `body` or `float`. The wardrobe holds one per slot, and a visitor wears up to two | `accessories.js` `WEAR_SLOTS` |
| **Way down** | The order regions open in, each by clearing the one before: Public Net, Bazaar, Corp Grid, Ruins, The Deep | `netrun/regions.js` `REGION_ORDER` |
| **Web Locks** | Browser API used for the one-tab rule | `ui/tabs.js` |
