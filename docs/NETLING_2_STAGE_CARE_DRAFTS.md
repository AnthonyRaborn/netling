# Netling 2.0: stage care (drafts)

First draft, started 2026-10-09. Care in 1.0 and in the 2.0 fork is the same at every stage: forms change, care does not. Virtual pets usually do the opposite: young pets eat, sleep and mess more often, older pets eat more at a time, keep a steadier day, and in later games stop messing at all. This file collects what the maintainer and the last session decided about bringing that to Netling 2.0, the numbers it would start from, and how each part would be tested. Handover context and branch state: [NETLING_2_BASELINE_AND_STAGE_CARE.md](NETLING_2_BASELINE_AND_STAGE_CARE.md). Companions: [NETLING_2_CARE_DRAFTS.md](NETLING_2_CARE_DRAFTS.md) (care wording), [NETLING_2_EGG_PRESSURES.md](NETLING_2_EGG_PRESSURES.md) (the states and the break).

**Legend.** Decided: the maintainer chose it. Direction: chosen in outline, numbers open. Proposal: suggested, nobody has chosen. Every number below marked "start" is mine, a starting value to measure, not a rule. Nothing here has been built in the simulator fork (`prototype/netling2/sim/`) except where a section says so, and nothing has been playtested.

## Decisions so far (maintainer, 2026-10-09)

1. **Adult age: split the difference** between keeping 51 hours and moving to 41: **46 hours**. With a 7 hour baby the teen stage is 39 hours and the adult stage 74 hours of the 120 hour life.
2. **Baby drain x2.4 works for now** (kept as a starting value, to be measured).
3. **Elder cache: reduce it** (x0.25), do not remove it.
4. **Rest call response window: try 60 minutes** (not 90). Names for Iron: options in section 2.5, not yet chosen.
5. **Tired: the size is a good start** (drain x1.16, flow blocked).
6. **Notification budget: see what 6 a day looks like**, not counting care alerts, evolution notices or netrun calls (all three excluded from the count, at least for now). The first measurement is in section 2.6.
7. **Clustered, predictable adult events: not yet.**

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
  3. Give PURGE an elder job so the button stays alive without a new button.
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
- **Response window: 60 minutes** (decided to try; was proposed at 90). Answering within the first 30 minutes is on time (steady +1 temper, the same shape as a fast PATCH; the 30 is not confirmed against the shorter window); later in the window is neutral; letting it lapse sets **tired** and leans unsteady (-1 temper).
- **Tired** (0 or 1, like a bug): Charge and Sync drain x1.16 (the size of one bug) and flow is blocked, until the next rest of 20 minutes or more or a night's sleep. It does not stack and it does not kill by itself. The size is a good start (decided).
- Constraint: **a work-day gap stays fatal** (decided earlier). The rest call is a chore with a cost, not a safety net: an unanswered call must not make a long absence survivable, so there is no self-rest.
- **Flavor** (wording not drafted): Program "reset" and Wetware "rest" are the working names; Iron is open. Iron's decided wording draws on machine sounds and timings, drift corrected by calibration, and batch rhythm ([SECOND_EGG_IDEAS.md](SECOND_EGG_IDEAS.md)). Options for the action and the call:

  | Option | Action / call | For | Against |
  |---|---|---|---|
  | calibrate | "recalibrating" / "calibration due" | the egg's decided idea (drift corrected by calibration); reads as upkeep, not sleep | none found; check it does not collide with a Tune role name |
  | maintenance window | "in maintenance" / "maintenance due" | batch rhythm; real operations language; says why events pause | long for a meter word |
  | idle | "idling" / "needs idle" | plain, accurate for a machine at rest | flat, no Iron flavor |
  | standby | "standby" / "standby due" | hardware term for low power with the state held | sounds optional, not urgent |
  | quiesce | "quiescing" / "quiesce due" | a precise machine term for settling to rest | hard word; the plain-words rule is only for Wetware, so it is allowed |
  | power cycle | "power cycling" / "cycle due" | familiar | too close to "reboot" (the post-crash recovery) and to hibernation |

  Words not to use: "reboot" (the post-crash recovery), "defrag" (a proposed bug-clearing name) and "cool" or "cool-down" (COOL is a care button). My pick: **calibrate**, with **maintenance window** as the call's longer form; the maintainer chooses.

### 2.6 Notification budget (Direction: 6 a day, to be seen)

On an APK every event can be a notification, so volume is the real constraint. Decided: look at a budget of **6 a day**, not counting care alerts, evolution notices or netrun calls (those three are excluded from the count and were not measured).

**What reaches the player today and under the draft's rest call** (`sim/notification-count.mjs`, 200 lives each, results in `prototype/netling2/baseline/results/followup/notification-count.txt`). Counts are per 15 awake hours, stages by age as proposed (baby under 7 hours, teen to 46, adult after), the rest call is a shadow of section 2.5 that changes nothing and assumes every call is answered:

| Player | Stage | Events | Visits | Requests | Rest calls | Events + calls | + visits | + requests |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| attentive | baby | 2.1 | 0.8 | 3.0 | 3.9 | 5.9 | 6.7 | 9.7 |
| attentive | teen | 1.7 | 0.9 | 2.9 | 2.2 | 3.9 | 4.7 | 7.6 |
| attentive | adult | 1.6 | 1.0 | 3.0 | 1.0 | 2.6 | 3.6 | 6.5 |
| casual | baby | 1.9 | 0.8 | 3.2 | 3.6 | 5.5 | 6.3 | 9.4 |
| casual | teen | 2.0 | 0.7 | 2.4 | 2.2 | 4.2 | 5.0 | 7.4 |
| casual | adult | 1.8 | 0.8 | 2.5 | 1.0 | 2.8 | 3.6 | 6.0 |
| daredevil | adult | 2.0 | 0.9 | 3.0 | 1.0 | 3.0 | 3.9 | 6.9 |
| sysadmin | adult | 1.7 | 0.9 | 3.0 | 1.0 | 2.7 | 3.7 | 6.6 |
| human-regular | adult | 1.9 | 0.7 | 1.9 | 1.0 | 2.9 | 3.5 | 5.4 |

The other rows are in the results file. What it says:
- **Events plus rest calls fit in 6 at every stage**: 2.6 to 3.0 for an adult, 3.9 to 4.2 for a teen, 5.5 to 6.1 for a baby (the baby stage is only about 7 awake hours, so that is about 2.6 items in the whole stage).
- **Adding visits fits from the teen stage on** (3.5 to 5.0) and goes over in the baby stage (6.3 to 7.2).
- **Adding attention requests breaks the budget** for the baby and the teen (7.0 to 10.3) and is borderline for an adult (5.4 to 6.9). Requests are opt-in rewards, so they would need to be off by default, a player setting, or capped to the headroom (about 1 a day for a teen, 2 to 3 for an adult).
- The events are fewer than the 2.6 a day the rates suggest (1.6 to 2.2 per 15 hours), because an open event blocks new ones and rest suppresses them.
- The baby's rest calls are the largest single item (3.6 to 3.9 per 15 hours), which fits a short, needy stage; the teen gets 2.2 and the adult 1.0. The elder was not simulated.

Not counted or not measured: stat alerts (those are care), evolution, netrun calls, unanswered-call reminders, the elder, and anything a person does that the bots do not.

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
| Notification budget | count calls, events and alerts a day per stage in the fork | items a day against the budget | at or under the budget |

All of it runs on the scripted bots; none of it can say whether a rest call is annoying, only how often it fires and what it costs.

## 4. Open questions for the maintainer

Answered on 2026-10-09: adult age (46 hours), baby drain (x2.4 for now), elder cache (x0.25), response window (60 minutes), tired (good start), clustered adult events (not yet). Still open:

1. Iron's name for the rest and the call (section 2.5 has six options; my pick is "calibrate").
2. Whether the 30 minute "on time" part of the response window stays now that the window is 60.
3. Which notification classes default on, and whether attention requests are capped, a setting, or both (section 2.6: they do not fit a 6 a day budget at the baby and teen stages).
4. What PURGE does for an elder now that the cache is reduced and not removed (it still works; the question is only whether it needs any new use).

## 5. Constraints and risks

- The care drafts decided care is a reskin of 1.0's four meters and buttons with a fixed button count and flavor-only rhythm. Stage curves make the rhythm mechanical; the button count stays fixed.
- A work-day gap stays fatal. The rest call must not weaken that.
- The baby stage is the first several hours of a new player's first day, and it is now the hardest part of the life. Shortening it limits the cost, but the opening has to teach the care loop at a faster pace. The tutorial wording is per egg (`tutorial-text.js`) and would need a look.
- The teen form is decided on less data. With a 7 hour baby and a 2.4 drain multiplier the expected Standing is about the same, but variance is larger.
- Rest ends the pressure states; the call-rest exemption is the only thing keeping answering a call from costing a held Overdrive or Overlink.
- XP and per-stage power curves were set aside; this package covers most of that goal without a new system.

## 6. Wording (not drafted)

Needed from the care-drafts register: the rest call line per egg (call, on time, late, lapsed), the tired state's meter word, the baby's hungry and messy lines, the elder's "nothing to purge" line, and the notification texts for each class. The warning, discharge, throttle and crash lines for the break are also still to write.
