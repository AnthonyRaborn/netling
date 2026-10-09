# Netling 2.0: stage care (drafts)

First draft, started 2026-10-09. Care in 1.0 and in the 2.0 fork is the same at every stage: forms change, care does not. Virtual pets usually do the opposite: young pets eat, sleep and mess more often, older pets eat more at a time, keep a steadier day, and in later games stop messing at all. This file collects what the maintainer and the last session decided about bringing that to Netling 2.0, the numbers it would start from, and how each part would be tested. Handover context and branch state: [NETLING_2_BASELINE_AND_STAGE_CARE.md](NETLING_2_BASELINE_AND_STAGE_CARE.md). Companions: [NETLING_2_CARE_DRAFTS.md](NETLING_2_CARE_DRAFTS.md) (care wording), [NETLING_2_EGG_PRESSURES.md](NETLING_2_EGG_PRESSURES.md) (the states and the break).

**Legend.** Decided: the maintainer chose it. Direction: chosen in outline, numbers open. Proposal: suggested, nobody has chosen. Every number below marked "start" is mine, a starting value to measure, not a rule. Nothing here has been built in the simulator fork (`prototype/netling2/sim/`) except where a section says so, and nothing has been playtested.

## Decisions so far (maintainer, 2026-10-09)

1. **Adult age: split the difference** between keeping 51 hours and moving to 41: **46 hours**. With a 7 hour baby the teen stage is 39 hours and the adult stage 74 hours of the 120 hour life.
2. **Baby drain x2.4 works for now** (kept as a starting value, to be measured).
3. **Elder cache: reduce it** (x0.25), do not remove it.
4. **Rest call response window: try 60 minutes** (not 90), and **the first 30 minutes still count as on time** (decided 2026-10-09). The rest is answered with the relabelled nap button (decided). Iron's word is **calibration** (decided); the button label has to fit 9 characters, and CALIBRATION is 11, so the working label is CALIBRATE (9), awaiting confirmation (section 2.5).
5. **Tired: the size is a good start** (drain x1.16, flow blocked).
6. **Notifications (decided 2026-10-09):** visitors never notify (they exist to encourage keeping the game open). Timed events (trace, surge, attack, overflow) do notify and are the class the budget of 6 a day counts. Care events, rest calls included, do not count against it. That gives three classes with their own toggles: **Events, Care, Cooldowns** (a netrun being ready is the cooldown example). Evolution notices were left out of the count and are not yet placed in a class. Counts per class are in section 2.6.
7. **Clustered, predictable adult events: not yet.**
8. **Elder cache is less often, not zero, so PURGE is unchanged** (decided 2026-10-09).
9. **Iron's button label: CALIBRATE** (decided 2026-10-09; 9 characters).

## 1. What care is today

| Part | Today (from `CFG` in `sim.js`, the same in 1.0 and the fork) |
|---|---|
| Stages | baby 0 to 17 hours, teen 17 to 51 hours, adult from 51 hours to the end of a 5 day life (7200 minutes); the elder is a feat-gated later stage, not an age |
| Meters | Charge drains 15.4 an hour and Sync 13.2, each scaled by a curve from 0.39 at empty to 2.0 at full; Heat drifts up 3 an hour and cools 10 an hour asleep |
| Rest | asleep with the lights on 0.5, asleep in the dark 0.33, a nap 0.35 of the drain; a nap is at most 2 hours with a 4 hour cooldown; sleep is 22:00 to 07:00 by the netling's stored zone |
| Feeding | a corp packet gives 30 Charge, scavenged data 25; each adds 0.25 Standing to its track |
| Cache (the mess) | a file is written with chance 1/150 a minute while awake and digesting (240 minutes after a feed), at most 4; each file adds 0.03 to the hourly virus chance; at 3 or more it costs 5 Integrity an hour, blocks flow, and adds 0.02 an hour to the overflow chance; PURGE clears it (+0.5 temper, +4 Integrity) |
| Events (an hour awake) | trace 0.08, surge 0.03, attack 0.04, overflow 0.02 plus 0.02 a cache file; response windows trace 120 minutes, attack 60, overflow 45; visits 0.06; attention requests 0.25; chatter 0.15 |
| Stage-keyed rules | only the netrun cooldown: baby 240 minutes, teen 210, adult and later 180 |
| Teen decision | decided on Standing at the 17 hour check: a casual life has 3.15 and 2.77 on the two tracks and a gap of 1.44, so 71% of casual lives are a tie (baseline, 1000 lives) |

## 2. The package

### 2.1 Baby: shorter and harder (Direction)

- Needs more care than later stages, and the stage is **shortened to about 6 to 8 hours** in **wall-clock time**. Sleeping through it is fine, as in other virtual pets (decided). Start: 7 hours.
- It demands more food. Because a feed restores a fixed 25 to 30 Charge, more food means a faster Charge drain; start with a baby multiplier of **2.4 on Charge and Sync drain** (the ratio of 17 hours to 7; decided to keep for now). That keeps the number of feeds in the stage, and so the Standing earned, near today's. If it makes the teen form too random, a multiplier on the feed's Standing is the second knob; a random teen is acceptable (decided), and it also gives hidden-path play a small push through Standing.
- More mess: baby cache chance **x2** (start), so a feed is followed by more PURGE work.
- **Adult age: 46 hours** (decided: halfway between keeping 51, which would stretch the teen from 34 to 44 hours, and 41, which would keep the teen at 34 and grow the adult stage from 69 to 79). With a 7 hour baby the teen is 39 hours and the adult stage 74 hours.
- The sleep problem: a 7 hour stage overlaps the sleep window for about two thirds of hatch times, so a baby that hatches in the evening is mostly asleep. Accepted (decided), but it means the baby stage's care load, and the rest calls below, are lighter for those players. Wall-clock is simplest; the alternatives (count awake time only, start the clock at the first wake) were rejected.
- Netrun cooldown for babies is already the longest (240 minutes).
- The **hidden teen** keeps its condition of 3 wins in each of the four games plus Standing within 1 point (decided). Nothing in the rules stops a binge except Charge (6 a game, blocked under 10) and Heat (+12 a game), so about 16 games for 12 wins is a 5 to 10 minute session with a feed and a cool or two. The hunter bots never binge, so the old hunter sweep understates what a person can do; a binger bot is to be added and rerun at a 7 hour baby.

### 2.2 Teen and adult (Direction)

- Unchanged against today's care numbers, so every earlier table stays the reference for these stages.
- Adults with a more regular day (events clustered at predictable times instead of a constant chance an hour): **not yet** (decided). The idea is kept here for later.
- Adults eat more per feed (Proposal): a larger Charge gain per feed with the same hourly drain, so fewer, bigger feeds. Start: x1.5 for the elder only (section 2.3); not tried for the adult.

### 2.3 Elder: little or no mess (Direction)

- Elders produce **far less cache: x0.25** (decided). The first option below is the one chosen. A cache file also raises virus and overflow chance, costs Integrity at 3 or more, blocks flow and gives PURGE its use, so removing it removes several things at once and makes PURGE a dead button for elders.
- Ways to tamp the benefit down (not chosen):
  1. **Reduce, do not remove** (chosen): elder cache chance x0.25. The pressure is weak but real, PURGE stays alive, nothing breaks. One number.
  2. **Swap in a matching burden**: an elder wear, an Integrity drain of the same size as the cache's (Integrity for Integrity; bugs already cost 0.5 an hour each as a precedent).
  3. Give PURGE an elder job so the button stays alive without a new button. Not needed: the cache is reduced, not removed, so PURGE works as it does now (decided).
- Program's Overdrive overflow multiplier needs a look: overflow chance depends on cache, so an elder with no cache would pay no Overdrive overflow cost (the 8 an hour Integrity bleed remains).
- Elders eat bigger meals (Proposal, start x1.5 Charge per feed), which lowers their feeds per hour.

### 2.4 Cache by stage (Proposal, start)

| Stage | Cache chance (today 1/150 a minute) |
|---|---|
| Baby | x2 |
| Teen | x1 |
| Adult | x1 |
| Elder | x0.25 (decided) |

### 2.5 The rest call (Proposal, shaped with the maintainer)

**Why.** Today a nap is only a way to guarantee that nothing happens for up to 2 hours, and sleep is a fixed night. There is no pressure to rest, and the vpet pattern (sleep as a rhythm, more of it when young) is absent. The nap's 2 hour cap and 4 hour cooldown were chosen for convenience, such as late bedtimes or a known busy window, and stay.

**Model.**
- A hidden **sleep demand** from 0 to 100 builds while awake at a rate that depends on stage: start baby 20 an hour (a call about every 3 hours, two in the stage), teen 12, adult 6, elder 4. It rises by 10 for a netrun and 2 for a mini-game, falls by 1 for a feed, falls by 40 for a scheduled nap (in proportion to the nap's length), and resets to 0 after a night's sleep. Form may add a modifier later.
- Past a threshold (start 60) it fires a **rest call**: a notification (the app is an APK, so notifications are expected). Calls do not fire during sleep hours, during a netrun (they wait until the jack-out and its 5 minute grace), or while an event is open.
- Answering starts a **rest of 20 to 30 minutes** (random). During it: the nap drain rate (0.35), events paused, demand reset to 10. Rest ends a state in the pressure design, so the rule is: **a rest that answers a call pauses a held state and does not break it; a voluntary rest while not called still breaks it** (decided).
- **How it is answered (Proposal; nothing here changes the fixed button count).** The call is answered with the **nap button**, which already changes its label (NAP to WAKE UP in 1.0). While a call is open the button shows the egg's rest verb, and pressing it starts the 20 to 30 minute call-rest, not a full nap. With no call open it is the ordinary nap (2 hour cap, 4 hour cooldown). A call-rest does not use the nap cooldown. Labels stay at 9 characters or fewer (the care drafts' rule); the longer words ("calibrating", "calibration due") belong to the call line, the log and the status text, not the button.

  | | Ordinary nap button (care drafts) | During a call | While resting | Call line (not limited to 9) |
  |---|---|---|---|---|
  | Program | NAP | RESET | WAKE UP | "> reset due." |
  | Iron | IDLE | CALIBRATE (9 characters; decided) | WAKE UP | "> calibration due." / "> calibrating. back in 25m." |
  | Wetware | DOZE | REST | WAKE UP | "> it needs rest." |

  Shorter Iron labels, if CALIBRATE is too wide on a phone: CALIB (5), TRIM (4, trimming out drift), ZERO (4, zeroing a gauge); not TUNE (a role name). CALIBRATING (11) does not fit and would only ever be the status text.
- **Response window: 60 minutes** (decided to try; was proposed at 90). Answering within the first 30 minutes is on time (steady +1 temper, the same shape as a fast PATCH); later in the window is neutral; letting it lapse sets **tired** and leans unsteady (-1 temper).
- **Tired** (0 or 1, like a bug): Charge and Sync drain x1.16 (the size of one bug) and flow is blocked, until the next rest of 20 minutes or more or a night's sleep. It does not stack and it does not kill by itself. The size is a good start (decided).
- Constraint: **a work-day gap stays fatal** (decided earlier). The rest call is a chore with a cost, not a safety net: an unanswered call must not make a long absence survivable, so there is no self-rest.
- **Flavor** (wording not drafted): Program "reset" and Wetware "rest" are the working names; Iron's theme is calibration (decided). The options below were the shortlist. Iron's decided wording draws on machine sounds and timings, drift corrected by calibration, and batch rhythm ([SECOND_EGG_IDEAS.md](SECOND_EGG_IDEAS.md)). Options for the action and the call:

  | Option | Action / call | For | Against |
  |---|---|---|---|
  | calibrate | "recalibrating" / "calibration due" | the egg's decided idea (drift corrected by calibration); reads as upkeep, not sleep | none found; check it does not collide with a Tune role name |
  | maintenance window | "in maintenance" / "maintenance due" | batch rhythm; real operations language; says why events pause | long for a meter word |
  | idle | "idling" / "needs idle" | plain, accurate for a machine at rest | flat, no Iron flavor |
  | standby | "standby" / "standby due" | hardware term for low power with the state held | sounds optional, not urgent |
  | quiesce | "quiescing" / "quiesce due" | a precise machine term for settling to rest | hard word; the plain-words rule is only for Wetware, so it is allowed |
  | power cycle | "power cycling" / "cycle due" | familiar | too close to "reboot" (the post-crash recovery) and to hibernation |

  Words not to use: "reboot" (the post-crash recovery), "defrag" (a proposed bug-clearing name) and "cool" or "cool-down" (COOL is a care button). The theme is calibrate; the open part is only the button label (above).

### 2.6 Notifications: three classes and a budget of 6 a day for events (Decided, counts measured)

On an APK every event can be a notification, so volume is the constraint. Decided (2026-10-09):

- **Visitors never notify.** They exist to encourage keeping the game open.
- **Events** (timed events: trace, surge, attack, overflow, **and attention requests**) **notify and count against the budget of 6 a day.** Attention requests were placed here by the maintainer: they are games or COOL only, never food, and an unanswered one costs nothing ([ATTENTION.md](ATTENTION.md)).
- **Care** events do **not** count against it. Care includes the rest call, stat alerts and **evolution notices** (decided).
- **Cooldowns** are a third class (a netrun being ready is the example).
- Each class has its own toggle. **Defaults: Events on, Care on** (decided); Cooldowns not decided (off is my suggestion for a convenience ping).
- This changes 1.0's attention rule 4 ("a request or visitor arriving in the background notifies once"): in 2.0 visitors never notify, and requests notify as part of Events.

**What each class would send today and under the draft's rest call** (`sim/notification-count.mjs`, 200 lives each, `prototype/netling2/baseline/results/followup/notification-count.txt`). Per 15 awake hours, stages by age as proposed (baby under 7 hours, teen to 46, adult after); the rest call is a shadow of section 2.5 that changes nothing and assumes every call is answered:

| Player | Stage | Events (counted) | Attention requests (counted) | Events + requests | Rest calls (Care) | Visitors (silent) |
|---|---|---:|---:|---:|---:|---:|
| attentive | baby | 2.1 | 3.0 | 5.1 | 3.9 | 0.8 |
| attentive | teen | 1.7 | 2.9 | 4.6 | 2.2 | 0.9 |
| attentive | adult | 1.6 | 3.0 | 4.6 | 1.0 | 1.0 |
| casual | baby | 1.9 | 3.2 | 5.1 | 3.6 | 0.8 |
| casual | teen | 2.0 | 2.4 | 4.4 | 2.2 | 0.7 |
| casual | adult | 1.8 | 2.5 | 4.3 | 1.0 | 0.8 |
| daredevil | baby | 2.2 | 3.2 | 5.4 | 3.9 | 1.1 |
| daredevil | adult | 2.0 | 3.0 | 5.0 | 1.0 | 0.9 |
| sysadmin | adult | 1.7 | 3.0 | 4.7 | 1.0 | 0.9 |
| human-regular | adult | 1.9 | 1.9 | 3.8 | 1.0 | 0.7 |

How often attention requests come: the chance is 0.25 an hour (about 3.75 per 15 awake hours); measured, **1.9 to 3.2 per 15 awake hours**, below the rate because a request is not posted while the netling rests, runs, reboots or has an event open.

What it says:
- **Events plus requests come to 3.8 to 5.4 per 15 awake hours, under the budget of 6 at every stage and player measured**, with 0.6 to 2.2 of headroom (the baby and a daredevil are the tightest). Counting requests as events fits, as the maintainer expected. It leaves room for about one more timed event a day for the busiest players, and for two or three for the sparse ones.
- **Events alone are 1.6 to 2.2** (lower than the 2.6 the rates suggest, because an open event blocks new ones and rest suppresses them); requests are the larger half.
- **The Care class** (rest calls, evolution, stat alerts) is 3.6 to 3.9 rest calls per 15 hours in the baby stage, 2.2 in the teen stage and 1.0 for an adult, plus stat alerts and evolution notices that were not measured. It is on by default and has its own toggle.
- **Cooldowns** were not simulated. The most one can send is one per netrun cooldown (240 minutes for a baby, 210 teen, 180 adult), so up to about 4 to 5 per 15 awake hours for a player who runs every time; the bots make 3 to 5 runs a day.
- The elder was not simulated.

Not counted or not measured: stat alerts, evolution notices, the cooldown class, unanswered-call reminders, the elder, and anything a person does that the bots do not.

## 3. How each part would be tested

| Part | Tool and knob | Measure | Bar |
|---|---|---|---|
| Baby length and drain | stage table in the fork (`teenAtMin`, a baby drain multiplier); `balance.mjs` | feeds and Standing at the teen check, teen tie rate (71% casual today), first-day survival, full life per archetype | whole-life full life within noise of the baseline; first day no worse than today |
| Adult age | `adultAtMin` 46 hours (decided) against 51 | teen stage length, adult share of the life, evolution rates | the teen form still reachable by a steering player (gap 5 or more) |
| Hidden teen | a binger policy in `hunter-sweep` at a 7 hour baby | share of lives that reach the hidden teen, against the 17 hour baseline (87% at 17 check-ins a day, 51% at 9, 4% at 6) | a little harder than today, not impossible |
| Cache by stage | a stage multiplier on the cache chance | infections, Integrity, flow share, PURGE use per stage | elder without cache gains no more than a small, stated advantage |
| Elder wear | an Integrity drain at the elder stage | Integrity and full life against the no-cache elder | stage totals match today's elder |
| Rest call | a demand model, a response-probability model in the bots, `gap-sweep` and `human-sweep` | calls a day by stage, tired share of time, full life, the longest survivable gap | gap survival unchanged (still fatal at 6 hours); the response probability is an assumption and is labelled one |
| Rest and held states | `sides-sweep` with the pause rule | how often a call lands inside a held state and what the pause costs | no net loss of benefit for answering |
| Notifications | `sim/notification-count.mjs` (shadow rest call; add stat alerts, evolution, cooldown readiness and the elder) | items a day per class and stage | Events plus requests at or under 6 a day; Care and Cooldowns reported, not budgeted |

All of it runs on the scripted bots; none of it can say whether a rest call is annoying, only how often it fires and what it costs.

## 4. Open questions for the maintainer

Answered on 2026-10-09: adult age (46 hours), baby drain (x2.4 for now), elder cache (x0.25, PURGE unchanged), response window (60 minutes, 30 on time), tired (good start), clustered adult events (not yet), visitors (no notification), the three notification classes, the rest answered by the relabelled nap button, Care on by default, evolution notices in Care, attention requests in Events. Still open:

1. Cooldowns default (on or off; off is my suggestion).
2. The baby: drain, bug rule and Standing (section 7 has the numbers and three options).

## 5. Constraints and risks

- The care drafts decided care is a reskin of 1.0's four meters and buttons with a fixed button count and flavor-only rhythm. Stage curves make the rhythm mechanical; the button count stays fixed.
- A work-day gap stays fatal. The rest call must not weaken that.
- The baby stage is the first several hours of a new player's first day, and it is now the hardest part of the life. Shortening it limits the cost, but the opening has to teach the care loop at a faster pace. The tutorial wording is per egg (`tutorial-text.js`) and would need a look.
- The teen form is decided on less data. With a 7 hour baby and a 2.4 drain multiplier the expected Standing is about the same, but variance is larger.
- Rest ends the pressure states; the call-rest exemption is the only thing keeping answering a call from costing a held Overdrive or Overlink.
- XP and per-stage power curves were set aside; this package covers most of that goal without a new system.

## 6. Wording (not drafted)

Needed from the care-drafts register: the rest call line per egg (call, on time, late, lapsed), the tired state's meter word, the baby's hungry and messy lines, the elder's "nothing to purge" line, and the notification texts for each class. The warning, discharge, throttle and crash lines for the break are also still to write.

## 7. The first build and what the simulator says (2026-10-09)

**Built in the fork** (`prototype/netling2/sim/sim.js`, `STAGE`; off by default so every older table is unchanged; tests in `stage.test.js`): `STAGE='{"on":true}'` switches on the stage tables (a 7 hour baby, adult age 46 hours, baby drain, cache by stage, a meal-size table left at 1); `STAGE='{"rest":{"on":true}}'` switches on the rest call, the nap-button answer, the call-rest (no nap cooldown, held states paused) and tired; `babyBugs` (default 1) sets how often a baby's faults roll a bug. The bots answer a call with probability `CALLANSWER` (default 0.7, an assumption) at a random minute of the window, and wake a netling found in a call-rest. Measured with the wider maps on, `NR2=all PERKS=1`, 1000 lives, no egg pressure; files `prototype/netling2/baseline/results/followup/stage-*`.

**The rest call is harmless in the simulator and a little helpful.**
- Alone, mean full life is 90.6% against 90.5% with no stage care; the sparse archetypes gain (worker 82.4 to 84.5, human-regular 28.8 to 31.7).
- Long awake gaps are unchanged (casual, full life at 4, 5 and 6 hour gaps: 91.0, 64.3, 22.8 against 90.8, 61.8, 23.0), so a work-day gap stays fatal as decided. How often the player answers hardly matters (5 hour gap: 53 to 57% whether 50% or 100% answer; measured before the bot fix below, so the level is lower than now but the small spread across answer rates is the point).
- Real calls are more frequent than the shadow model: 4.3 to 4.7 per 15 awake hours in the baby stage, 3.2 to 3.4 as a teen, 1.3 as an adult, about 10 a life. With the assumed 70% answer rate and a random response time, about 35% are on time, 31% late and 27% lapse, and the netling is tired for 12 to 15% of its life. Tired may be more than intended for "a good start"; the response model is the assumption behind it.
- Fixed on the way: the bots never napped, so a check-in inside a call-rest could not feed. That made the first run look as if the rest call cost 6 to 10 points at long gaps; with the bots waking a call-rest the cost is gone.

**The stage tables cost the sparse players, and the cost is the baby drain.**
- Lengths and cache by stage cost nothing (baby drain 1: a 5 hour gap survives 63.0% against 61.8%).
- With the baby drain at 2.4, mean full life falls from 90.5% to 89.5%, but the worker falls from 82.4% to 63.7% and the casual archetype from 95.5% to 93.5%. At a 5 hour gap, 61.8% falls to 51.3%. The deaths show up in the teen stage (9.8% to 27.8%), not the baby stage: a baby that starves for hours racks up faults, bugs and Integrity damage, and dies after it has grown.
- A baby's faults rolling no bugs (`babyBugs` 0) recovers part: the worker 71.8%, the 4 hour gap back to 90.5% (today 90.8%), the 5 hour gap 58.5% (61.8%).
- The baby drain sweep (candidate with `babyBugs` 0 and the rest call on): worker full life 82.0 / 81.8 / 73.5 at drain 1 / 1.6 / 2.0 (and 75.9 at 2.4); casual 92.1 / 93.9 / 94.8 (and 93.7); human-regular 28.5 / 30.2 / 29.3 (and 29.4); attentive 100 at every setting. Faults rise with drain (worker 8.4 / 12.2 / 13.7).

**Standing at the teen check is not preserved, and the teen form gets more random.**
- I estimated that a 2.4 drain would keep the teen-check Standing level. The bots do not show it: casual 3.1 and 2.8 (17 hour baby) become 1.6 and 1.7 at 7 hours, attentive 3.9 and 3.5 become 2.9 and 2.8. The bots can only feed when they check in, so a faster drain does not make them feed more. Higher drain does raise it (attentive 1.9 / 2.4 / 2.6 at drain 1 / 1.6 / 2.0) but never back to today's level.
- The teen tie rate rises from 53% to 58% on average (casual 73% to 84%, worker 82% to 98%). A person who feeds more often would do better than the bots; that is not measured.
- Hidden-path hunters that do not binge reach the hidden teen in 58 to 61% of lives against 87% today (the binger test is not built).

**Options for the baby (the maintainer chooses).**
1. **Baby drain 1.6 with `babyBugs` 0.** Keeps the worker where it is today (81.8% against 82.4%), keeps long-gap survival near today's, recovers about half of the lost teen-check Standing. The baby is still needier than a teen, by 60%.
2. **Keep 2.4 and `babyBugs` 0.** The baby is much needier, and sparse players pay (worker about 75%, casual about 2 points).
3. Either of the above plus a **Standing multiplier on a baby's feeds** (for example x1.5 or x2) to restore the teen check, if the teen form should stay as steerable as today. Not built.

**Not measured:** the hidden-teen binger test; the three eggs with their pressures and the break on top of the stage care (only the unpressured rules were run); the elder (no archetype reaches the elder stage in these runs); meal size by stage; and any real player.

## 8. Stage care on top of each egg's pressure and the break (2026-10-09)

Six whole-life runs, 1000 lives for each of 37 archetypes, with NR2=all, PERKS=1, the egg's final pressure design and the break on (the "brake" runs are the comparison). A is the decided tables (baby drain 2.4, a baby's faults roll bugs as today) plus the rest call. B is option 1 above (baby drain 1.6, `babyBugs` 0) plus the rest call. Files `prototype/netling2/baseline/results/balance-stage{A,B}-{iron,program,wetware}.json`; the configurations are in `baseline/run-all.mjs`.

| egg | mean full life, break only | A | B | teen tie %, break only | A | B |
|---|---:|---:|---:|---:|---:|---:|
| Iron | 87.6 | 86.7 | 87.5 | 53.7 | 59.7 | 60.9 |
| Program | 87.4 | 86.4 | 87.1 | 53.8 | 59.7 | 60.9 |
| Wetware | 87.7 | 86.8 | 87.6 | 53.5 | 59.6 | 60.8 |

Archetypes that move by 3 points or more (full life, points):

| archetype | Iron A / B | Program A / B | Wetware A / B |
|---|---:|---:|---:|
| worker | -20.3 / -3.8 | -16.6 / -0.4 | -18.7 / -2.6 |
| hunter-casual | -5.4 / -0.4 | -6.0 / -2.0 | -5.8 / -2.0 |
| human-regular | within 3 | -4.8 / +0.6 | -4.2 / -1.7 |
| human-keen | within 3 | within 3 | -4.5 / +0.7 |

- The egg pressures and the break do not change the stage-care result: it matches the unpressured run in section 7. The baby drain is the cost; the cost lands on sparse players.
- Option B removes nearly all of it. Only Iron's worker stays more than 3 points down (-3.8, close to noise at this sample size), and no archetype is down 3 or more under Program or Wetware.
- Teen ties rise by about 6 points under A and 7 under B on every egg, so the teen form gets less steerable either way (a bot can only feed at check-ins; a person who feeds more would do better). This is the open Standing question; option 3 (a feed multiplier) is the lever and is not built.
- Rest calls are the same on every egg: about 9.9 a life, 3.5 on time, 3.1 late, 2.7 lapsed; tired for 13.3 to 13.6% of a life under A. Mean of 37 archetypes; the response model (`CALLANSWER`, 0.7) is still an assumption.
- Still not measured: the elder, the hidden-teen binger, meal size by stage, a person.

**Recommendation (not a decision):** option 1. It needs the maintainer to approve the new bug rule, that a baby's faults roll no bugs. If the teen form should stay as steerable as today, add option 3 on top.

## 9. Standing gain (maintainer idea, 2026-10-09): raise every source, flat

Idea: Standing gain is too low to steer, so multiply all of it. Target set by the maintainer: about 50% teen ties for relatively unguided play, close to 0% for strict guided play. Built as `STANDINGGAIN` in the fork (`GAIN` in `sim/sim.js`; 1 by default, so every older table is unchanged): feeds, games, events, trace and netrun Standing are all multiplied; bug-clearing costs (2 Standing), the tie weights and the hidden-path band (1) stay in absolute points, so a gain of 2 is the same as every cutpoint being half as far. Tested on Program with the break and option 1 (baby drain 1.6, no baby bugs, rest call), 300 lives per archetype for the gains and the 1000 life option B run for gain 1; `results/balance-gain{1.5,2,3,4}-program.json`. Simulator only; no test file covers `GAIN` (the default path is covered by the existing 320 prototype tests).

Teen tie rate (gap under 2) / adult lean certain (gap 5 or more):

| archetype | gain 1 | 1.5 | 2 | 3 | 4 |
|---|---:|---:|---:|---:|---:|
| attentive | 80 / 14 | 68 / 33 | 44 / 50 | 33 / 64 | 18 / 71 |
| casual | 86 / 12 | 73 / 28 | 55 / 42 | 41 / 58 | 24 / 71 |
| human-keen | 89 / 7 | 79 / 19 | 59 / 34 | 48 / 53 | 33 / 68 |
| human-regular | 94 / 4 | 81 / 13 | 65 / 27 | 53 / 47 | 37 / 62 |
| worker | 98 / 3 | 92 / 12 | 77 / 26 | 66 / 43 | 40 / 57 |
| daredevil | 71 / 38 | 57 / 53 | 38 / 66 | 27 / 73 | 17 / 81 |
| corpo (strict guided) | 16 / 100 | 2 / 100 | 1 / 100 | 0 / 100 | 0 / 100 |
| runner (strict guided) | 5 / 100 | 1 / 100 | 0 / 100 | 0 / 100 | 0 / 100 |
| steer-tune-corp/street | 0 / 100 | 0 / 100 | 0 / 100 | 0 / 100 | 0 / 100 |

- **Gain 2 meets the target** for the regular players (attentive 44, casual 55, human-keen 59) and takes the strict guided archetypes to about 0. Gain 1.5 is not enough (68 to 81 for regular play); gain 3 and 4 make the teen close to deterministic for anyone who plays at all.
- Sparse players (worker, hunter-casual) stay mostly tied at gain 2 (77, 98): they feed too rarely for any flat gain to steer them. That is acceptable if the maintainer wants sparse play to stay a gamble; a stage curve or a bigger baby weight would be the lever.
- The strict guided archetypes were already at or near 0 ties under option B; the problem was the regular players, and gain 2 fixes that.
- Whole life does not move (mean full life 87% at every gain; the worker 81 to 78 at 300 lives, inside the noise of that sample).
- Side effects to decide on: a bug cleared for Standing costs 2 points, so at gain 2 it is half the price in effect. The maintainer's lean: keep it cheap, but payable only when the netling lacks the scrip. That rule is not built (the bots pay scrip first by default, `CLEAR`). The hidden-path band stays at 1 absolute point, so a hidden-path player has half the room; the hunter archetypes' tie rate is unchanged at 98 to 100%, but the hidden-path rate was not measured here.
- Not run: Iron and Wetware (config entries exist: `gain<g>-iron`, `gain<g>-wetware` in `baseline/run-all.mjs`), the clinic cost rule, any real player.
