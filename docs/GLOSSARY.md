# Glossary

Terms used in the game, the UI and the code, alphabetical. "Code" means the identifier you will see in the source. Written against commit `ea87757`.

Spoilers: this file names hidden mechanics (the Ghost form, The Deep, NL-0).

| Term | Meaning | Where |
|---|---|---|
| **A / B (buttons)** | Normalized input names. `a` confirms, `left` and `right` move. On a controller B quits | `ui/play.js`, `ui/gamepad.js` |
| **Abort** | Ending a netrun early by pressing ABORT RUN twice. Loot is forfeited, nothing else | `netrun/run.js` `abortRun` |
| **Accessory** | A cosmetic pixel item drawn on the netling (24 of them, some earned, some found). Fits every form by anchors | `accessories.js` |
| **Advance** | The UI function that ticks the simulation, reacts and saves. Runs each second | `ui/life.js` |
| **Age (`ageMin`)** | Simulated minutes the netling has lived. Not wall-clock; excludes hibernation | `sim.js` |
| **Alert** | The single most urgent reason to call the player back (`alertReason`). Drives the chirp and notifications | `sim.js` |
| **Allegiance** | Hidden axis: positive is corp, negative is indie (scavenged data, hiding). Picks Chrome or Firewall | `sim.js` `axes` |
| **Anchors** | Positions (head top, eyes, mouth, body span) computed from a sprite's pixels so accessories fit any form | `accessories.js` `anchorsFor` |
| **Anomaly** | A netrun node with a two-option risk or reward prompt. Five exist | `netrun/anomalies.js` |
| **Antivirus patch** | Item: cures a virus and shields against new ones for 6 hours | `sim.js` |
| **Archive** | The dialog with LINEAGE, DEX, CODEX and STYLE tabs, and the SYSTEM button | `ui/archive.js` |
| **Armed button** | A button that needs a second press within a few seconds to confirm (discard, transfer out, restart) | `ui/app.js` `armed` |
| **Attack / Intrusion** | Timed event: a virus attempt. DEFEND within 60 minutes by winning a mini-game | `sim.js` |
| **Baby** | First life stage, form Bitling. Age 0 to 17 hours (24 for netlings compiled before the 5-day life) | `sim.js` |
| **Bandage** | Earned accessory for surviving a netrun disconnect or an NL-0 rescue | `ui/style.js` |
| **Bazaar** | The Darknet Bazaar netrun region: markets and Black ICE | `netrun/regions.js` |
| **Bitling** | The baby form | `sim.js` `SPECIES` |
| **Black ICE shard** | Item: +40 Sync, +20 Heat, may carry a virus, leans indie and unstable | `sim.js` |
| **Booster (Signal booster)** | Item: the next mini-game win counts double | `sim.js` |
| **Bored** | The state of being awake with the lights off: Sync drains at twice the rate | `sim.js` |
| **Breach Protocol** | Mini-game: pick grid codes, alternating row and column, to land a target sequence | `games/breach.js` |
| **Buff** | A temporary effect on the netling: `shieldUntilAge`, `traceSkip`, `boost` | `sim.js` |
| **Cache (corrupted cache files)** | Junk files written while digesting. Up to 4. 3 or more damage Integrity. PURGE clears them | `sim.js` |
| **Cache node** | A netrun node that may hold an item, a fragment, or an accessory | `netrun/run.js` |
| **Caretaker tab** | The one browser tab allowed to simulate and save. Others show a guard screen | `ui/tabs.js` |
| **CFG** | The exported object of every tunable rule number | `sim.js` |
| **Charge** | Stat: power. Drains 14/hr awake. Fed by packets | `sim.js` |
| **Checkpoint** | A corp scan node: hide, comply, or use a voucher | `netrun/run.js` |
| **Chrome** | Adult form leaning corp. Trait Licensed. Checkpoints wave it through | `sim.js` |
| **Clean clear / clean jack-out** | A netrun that ends by jacking out with no ICE lost. Shortens the next cooldown by 1 hour | `netrun/run.js` |
| **Codex** | The 22 lore fragments collected on netruns. Shared across generations | `netrun/codex.js` |
| **Codex inbox** | `pet.codexInbox`: fragments a run found, waiting for the UI to bank them into the shared codex | `netrun/run.js`, `ui/archive.js` |
| **Compile / script** | A new generation starts as a `script` that compiles for 3 minutes into a baby | `sim.js` |
| **Comply** | Trace answer: accept the scan. Integrity -5, Sync -10, allegiance +1 | `sim.js` |
| **Coolant cell** | Item: vents 50 Heat | `sim.js` |
| **Cooldown (uplink cooldown)** | Time before the next netrun: 240/210/180 minutes by stage, minus bonuses, never under 120 | `sim.js` |
| **Corp Grid** | Netrun region full of checkpoints. Needs a teen | `netrun/regions.js` |
| **Corp packet (CORP PKT)** | Food: +30 Charge, leans corp | `sim.js` |
| **Corp trace** | Timed event: HIDE or COMPLY within 2 hours or lose Integrity and lean corp | `sim.js` |
| **Corp voucher** | Item: full Charge, waves off a trace | `sim.js` |
| **Crash** | What an ignored memory overflow does: -15 Integrity, cache full, 20 minute reboot | `sim.js` |
| **Daemon** | Adult form leaning orderly. Trait Persistent. Charge drains 20% slower. Sees two steps ahead in runs | `sim.js` |
| **Dark** | Lights off. Deep rest when asleep, boredom when awake | `sim.js` |
| **Dead / flatline** | The end of a netling. Leaves a fragment | `sim.js` `flatline` |
| **Deep rest** | Napping, or asleep with the lights off: Integrity regenerates 8/hr | `sim.js` |
| **Deep (The Deep)** | Hidden fifth netrun region. Opens with codex fragment `ruins-4` | `netrun/regions.js` |
| **DEFEND** | The answer to an intrusion: a random mini-game | `ui/play.js` |
| **Dev mode** | `?dev` in the URL. Time-skip and forced-event buttons | `main.js` |
| **Dex** | The list of the 9 forms seen. Undiscovered forms show a silhouette and a hint | `archive.js` |
| **Digesting** | The 240 minutes after a meal, during which cache files can appear | `sim.js` |
| **Disconnect** | A netrun ends in failure (Integrity or Charge hit 0). Loot lost, one care mistake, emergency reboot | `netrun/run.js` |
| **Echo** | 1) An anomaly with a codex fragment. 2) An "unrealized" adult form: a netling that died before adulthood but whose fragment shows the form it was leaning toward | `netrun/anomalies.js`, `archive.js` |
| **Effect** | A screen effect cosmetic (scanlines, clean, interlace, rain, bloom, curve, packets, static) | `cosmetics.js` |
| **Event** | A timed thing that needs a response (trace, intrusion, overflow). One at a time | `sim.js` `EVENTS` |
| **Evolution** | Baby to teen at 17 hours, teen to adult at 51 hours (`s.life`; 24 and 72 for older netlings) | `sim.js` |
| **Exit node** | The last node of a map. Banks everything and gives a bonus | `netrun/run.js` |
| **Field manual** | The in-game help dialog, built from live `CFG` values | `ui/onboarding.js` |
| **Firewall** | Adult form leaning indie. Trait Hardened. ICE deals half damage | `sim.js` |
| **Firewall Dodge** | Mini-game: slide between five lanes to avoid falling blocks for 15 seconds | `games/dodge.js` |
| **Form** | A netling's body. Eight exist: Bitling, Kernel, Stub, Chrome, Firewall, Daemon, Glitch, Ghost | `sim.js` `SPECIES` |
| **Fragment** | Two meanings. 1) **Death fragment**: what a dead netling leaves (form, trait, quirk, keepsake). 2) **Codex fragment**: a lore entry. Context decides | `sim.js`, `netrun/codex.js` |
| **Gate (write gate)** | `canWrite` in `ui/app.js`: decides whether storage may be written | `ui/app.js` |
| **Generation** | The number of the current netling, shown as `v<n>.0` | `sim.js` |
| **Ghost** | Secret adult form. Neutral allegiance, non-negative stability, 1 mistake or fewer, 22+ wins with 4+ in each game. Trait Untraceable | `sim.js` |
| **Glitch** | Adult form leaning chaotic. Trait Volatile. Play gives +10 to +40 Sync. Skips the first ICE | `sim.js` |
| **Grace** | Minutes a need can stay unmet before it counts as a care mistake: 15, or 60 for lights | `sim.js` |
| **Heat** | Stat: rises when active. 85+ hurts Integrity, 100 is a fault | `sim.js` |
| **Hibernate** | Freeze the clock for at least 24 hours. 3 day cooldown after waking | `sim.js` |
| **HIDE** | Trace answer: reroute. Charge -10, Heat +10, leans indie | `sim.js` |
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
| **Lease** | The `localStorage` fallback for the one-tab rule | `lease.js` |
| **Lights** | The LIGHTS OFF/ON toggle. Affects drain, regeneration and screen | `sim.js` |
| **Lineage** | The record of every dead netling, plus inheritance from parent to child | `archive.js` |
| **Lock (transfer lock)** | The screen shown after transferring out. The device stops simulating | `ui/system.js` |
| **Loot** | Items carried in a netrun, banked on jack-out | `netrun/run.js` |
| **Market** | A netrun node where Charge buys items and sometimes an accessory | `netrun/run.js` |
| **Memory overflow** | Timed event: PURGE within 45 minutes or it crashes | `sim.js` |
| **Memory shard** | Item: rewrites one quirk | `sim.js` |
| **Mini device** | Secret prop for owning every shell | `ui/style.js` |
| **Mistake (care mistake)** | A need left unmet past its grace. 10 ends the run | `sim.js` |
| **Nap** | Rest on demand for up to 2 hours at 35% drain | `sim.js` |
| **Netling** | The pet | everywhere |
| **Netrun** | The node-map expedition | `netrun/` |
| **NL-0** | The first netling, the story's hidden benefactor. Grants Root Access | `index.html`, `sim.js` |
| **Node** | A point on a netrun map: entry, cache, ICE, relay, checkpoint, market, anomaly, exit | `netrun/map.js` |
| **Onboarding** | First-run flow: intro, readme (field manual), nudge, tutorial, done | `ui/onboarding.js` |
| **Origin palette** | NL-0's color scheme. Only rolls for netlings compiled with Root Access | `sim.js` |
| **Overclock chip** | Item: cuts 1 hour off the netrun cooldown | `sim.js` |
| **Packet Feast** | Mini-game: eat 15 clean packets in 20 seconds, two bad bites lose | `games/feast.js` |
| **Palette** | The netling's colors, a quirk | `sim.js` |
| **Persistent storage** | The browser's promise not to evict our data. Requested at boot | `ui/system.js` |
| **Pet / state** | The live netling object. `pet` in netrun code, `state` or `s` in `sim.js` | |
| **Pitch** | A quirk: the base frequency of its voice, 440 to 880 Hz | `sim.js` |
| **Props** | Style items drawn on the ground beside the netling: cyberdeck, boom box, mini device, plush | `accessories.js` |
| **Public Net** | The starter netrun region | `netrun/regions.js` |
| **PURGE** | Clear all cache files, or contain an overflow | `sim.js` |
| **Quirk** | One of five inherited traits of appearance and habit: palette, pitch, idle, favorite packet, sleep offset | `sim.js` |
| **Reboot** | 20 minutes unable to act after a crash | `sim.js` |
| **Relay** | A netrun node: recharge, vent, and an optional safe jack-out | `netrun/run.js` |
| **Rescue** | Root Access reversing a flatline. Sets `rootUsed` | `sim.js` |
| **Root Access** | NL-0's rescue from the first premature death. Earned by completing the codex | `sim.js` |
| **SAVE_VERSION** | The save format version. Currently 1. A bump needs a step in `STEPS` | `sim.js`, `migrations.js` |
| **Scavenged data (SCAV DATA)** | Food: +25 Charge, leans indie, 12% infection | `sim.js` |
| **Script** | The compiling stage before baby. Also the name of a fresh netling object | `sim.js` |
| **Session** | The currently running mini-game or netrun view, `app.session` | `ui/app.js` |
| **Shell** | The device body cosmetic | `cosmetics.js` |
| **Shield** | Antivirus effect: blocks new infections and intrusions for 6 hours | `sim.js` |
| **Skew** | Dev-mode time offset added to "now" | `ui/app.js` |
| **Sleep offset** | Quirk: shifts bedtime by -2 to +2 hours | `sim.js` |
| **Stability** | Hidden axis: positive is orderly, negative is chaotic. Picks Daemon or Glitch | `sim.js` |
| **Streak** | Consecutive mini-game wins. 10 in a row unlocks a screen effect | `cosmetics.js` |
| **Strict cleaning** | Sanitizing that drops unknown fields, used for imported codes | `sanitize.js` |
| **Stub** | Teen form after a rough first day (3+ mistakes) | `sim.js` |
| **Style** | The Archive tab for cosmetics: shells, tints, effects, sounds, label, accessories, props | `ui/style.js` |
| **Surge (power surge)** | Instant event: +25 Heat, +10 Charge | `sim.js` |
| **Sync** | Stat: bond with the player. Drains 12/hr. Raised by play | `sim.js` |
| **Teen** | Second stage: Kernel, Stub or Shell. 17 to 51 hours | `sim.js` |
| **Test mode** | A separate netling on a fast clock, in its own storage | `ui/app.js` |
| **Tick** | One simulated minute, or the function that runs many | `sim.js` |
| **Tint** | The screen color cosmetic | `cosmetics.js` |
| **Trait** | The perk inherited from the previous netling's adult form | `sim.js` `TRAITS` |
| **Transfer code** | `NL1.` string holding a full save, movable between devices | `transfer.js` |
| **Transmission** | The NL-0 message shown when the codex completes | `index.html` |
| **Tune (Signal Tune)** | Mini-game: lock a sweeping wave onto a target, 2 of 3 rounds | `games/tune.js` |
| **Unrealized** | A death fragment whose form the netling never became (it died before adulthood) | `archive.js` |
| **Uplink** | The netrun connection. "Uplink cooling down" means the cooldown | `netrun/run.js` |
| **Virus** | Infection that costs 12 Integrity/hr. PATCH cures it | `sim.js` |
| **Visitor** | A stray netling that plays with yours for 5 to 10 minutes | `sim.js` |
| **Wake (wake it)** | Ending a nap early, or ending hibernation | `sim.js` |
| **Wardrobe** | The stored equipped cosmetics | `cosmetics.js` |
| **Web Locks** | Browser API used for the one-tab rule | `ui/tabs.js` |
