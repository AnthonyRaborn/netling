# Netling 2.0: stage care (drafts)

First draft, started 2026-10-09. Care in 1.0 and in the 2.0 fork is the same at every stage: forms change, care does not. Virtual pets usually do the opposite: young pets eat, sleep and mess more often, older pets eat more at a time, keep a steadier day, and in later games stop messing at all. This file collects what the maintainer and the last session decided about bringing that to Netling 2.0, the numbers it would start from, and how each part would be tested. Handover context and branch state: [NETLING_2_BASELINE_AND_STAGE_CARE.md](NETLING_2_BASELINE_AND_STAGE_CARE.md). Companions: [NETLING_2_CARE_DRAFTS.md](NETLING_2_CARE_DRAFTS.md) (care wording), [NETLING_2_EGG_PRESSURES.md](NETLING_2_EGG_PRESSURES.md) (the states and the break).

**Legend.** Decided: the maintainer chose it. Direction: chosen in outline, numbers open. Proposal: suggested, nobody has chosen. Every number below marked "start" is mine, a starting value to measure, not a rule. Nothing here has been built in the simulator fork (`prototype/netling2/sim/`) except where a section says so, and nothing has been playtested.

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
- It demands more food. Because a feed restores a fixed 25 to 30 Charge, more food means a faster Charge drain; start with a baby multiplier of **2.4 on Charge and Sync drain** (the ratio of 17 hours to 7). That keeps the number of feeds in the stage, and so the Standing earned, near today's. If it makes the teen form too random, a multiplier on the feed's Standing is the second knob; a random teen is acceptable (decided), and it also gives hidden-path play a small push through Standing.
- More mess: baby cache chance **x2** (start), so a feed is followed by more PURGE work.
- The adult age (51 hours, from birth) is not decided. If it stays, the teen stage grows from 34 to 44 hours (51 minus 7); if it moves to 41 hours, the teen keeps its 34 hours and the adult stage grows from 69 to 79 hours of the 120 hour life. Open (question 1).
- The sleep problem: a 7 hour stage overlaps the sleep window for about two thirds of hatch times, so a baby that hatches in the evening is mostly asleep. Accepted (decided), but it means the baby stage's care load, and the rest calls below, are lighter for those players. Wall-clock is simplest; the alternatives (count awake time only, start the clock at the first wake) were rejected.
- Netrun cooldown for babies is already the longest (240 minutes).
- The **hidden teen** keeps its condition of 3 wins in each of the four games plus Standing within 1 point (decided). Nothing in the rules stops a binge except Charge (6 a game, blocked under 10) and Heat (+12 a game), so about 16 games for 12 wins is a 5 to 10 minute session with a feed and a cool or two. The hunter bots never binge, so the old hunter sweep understates what a person can do; a binger bot is to be added and rerun at a 7 hour baby.

### 2.2 Teen and adult (Direction)

- Unchanged against today's care numbers, so every earlier table stays the reference for these stages.
- Adults could have a more regular day: events clustered at predictable times instead of a constant chance an hour, so an older pet's day becomes learnable (Proposal, low priority; no numbers). It would also help a notification budget (section 2.6).
- Adults eat more per feed (Proposal): a larger Charge gain per feed with the same hourly drain, so fewer, bigger feeds. Start: x1.5 for the elder only (section 2.3); not tried for the adult.

### 2.3 Elder: little or no mess (Direction)

- Elders produce **no cache, or far less** (decided direction). A cache file also raises virus and overflow chance, costs Integrity at 3 or more, blocks flow and gives PURGE its use, so removing it removes several things at once and makes PURGE a dead button for elders.
- Ways to tamp the benefit down (not chosen):
  1. **Reduce, do not remove** (recommended): elder cache chance x0.25. The pressure is weak but real, PURGE stays alive, nothing breaks. One number.
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
| Elder | x0.25 or x0 (section 2.3) |

### 2.5 The rest call (Proposal, shaped with the maintainer)

**Why.** Today a nap is only a way to guarantee that nothing happens for up to 2 hours, and sleep is a fixed night. There is no pressure to rest, and the vpet pattern (sleep as a rhythm, more of it when young) is absent. The nap's 2 hour cap and 4 hour cooldown were chosen for convenience, such as late bedtimes or a known busy window, and stay.

**Model.**
- A hidden **sleep demand** from 0 to 100 builds while awake at a rate that depends on stage: start baby 20 an hour (a call about every 3 hours, two in the stage), teen 12, adult 6, elder 4. It rises by 10 for a netrun and 2 for a mini-game, falls by 1 for a feed, falls by 40 for a scheduled nap (in proportion to the nap's length), and resets to 0 after a night's sleep. Form may add a modifier later.
- Past a threshold (start 60) it fires a **rest call**: a notification (the app is an APK, so notifications are expected). Calls do not fire during sleep hours, during a netrun (they wait until the jack-out and its 5 minute grace), or while an event is open.
- Answering starts a **rest of 20 to 30 minutes** (random). During it: the nap drain rate (0.35), events paused, demand reset to 10. Rest ends a state in the pressure design, so the rule is: **a rest that answers a call pauses a held state and does not break it; a voluntary rest while not called still breaks it** (decided).
- **Response window** (open): the call stays open for a window (start 90 minutes). Answering within the first 30 minutes is on time (steady +1 temper, the same shape as a fast PATCH); later in the window is neutral; letting it lapse sets **tired** and leans unsteady (-1 temper).
- **Tired** (0 or 1, like a bug): Charge and Sync drain x1.16 (the size of one bug) and flow is blocked, until the next rest of 20 minutes or more or a night's sleep. It does not stack and it does not kill by itself.
- Constraint: **a work-day gap stays fatal** (decided earlier). The rest call is a chore with a cost, not a safety net: an unanswered call must not make a long absence survivable, so there is no self-rest.
- **Flavor** (wording not drafted): Program "reset", Wetware "rest", Iron undecided (candidates "cool-down" or "power cycle"). Do not use "reboot" (the post-crash recovery) or "defrag" (a proposed bug-clearing name).

### 2.6 Notification budget (Proposal)

On an APK every event can be a notification, which makes volume the real constraint. Today, awake time only (about 15 hours a day):

| Source | Rate | A day |
|---|---|---|
| Events (trace, surge, attack, overflow without cache) | 0.17 an hour | about 2.6 |
| Attention requests (opt-in rewards) | 0.25 an hour | about 3.8, and optional |
| Visits | 0.06 an hour | about 0.9, flavor |
| Stat alerts (Charge or Sync low, Heat high) | not measured | not measured |
| Rest calls (this package) | by stage | baby 2 in the stage, teen about 3, adult about 1.5, elder about 1 |

Start: a budget of **about 6 notification-worthy items a day** for teen and adult, more for the short baby stage, and the soft classes (requests, visits, chatter) off by default and a setting. Everything above that is a decision about what is allowed to buzz.

## 3. How each part would be tested

| Part | Tool and knob | Measure | Bar |
|---|---|---|---|
| Baby length and drain | stage table in the fork (`teenAtMin`, a baby drain multiplier); `balance.mjs` | feeds and Standing at the teen check, teen tie rate (71% casual today), first-day survival, full life per archetype | whole-life full life within noise of the baseline; first day no worse than today |
| Adult age | `adultAtMin` 51 hours against 41 | teen stage length, adult share of the life, evolution rates | the teen form still reachable by a steering player (gap 5 or more) |
| Hidden teen | a binger policy in `hunter-sweep` at a 7 hour baby | share of lives that reach the hidden teen, against the 17 hour baseline (87% at 17 check-ins a day, 51% at 9, 4% at 6) | a little harder than today, not impossible |
| Cache by stage | a stage multiplier on the cache chance | infections, Integrity, flow share, PURGE use per stage | elder without cache gains no more than a small, stated advantage |
| Elder wear | an Integrity drain at the elder stage | Integrity and full life against the no-cache elder | stage totals match today's elder |
| Rest call | a demand model, a response-probability model in the bots, `gap-sweep` and `human-sweep` | calls a day by stage, tired share of time, full life, the longest survivable gap | gap survival unchanged (still fatal at 6 hours); the response probability is an assumption and is labelled one |
| Rest and held states | `sides-sweep` with the pause rule | how often a call lands inside a held state and what the pause costs | no net loss of benefit for answering |
| Notification budget | count calls, events and alerts a day per stage in the fork | items a day against the budget | at or under the budget |

All of it runs on the scripted bots; none of it can say whether a rest call is annoying, only how often it fires and what it costs.

## 4. Open questions for the maintainer

1. The adult age: keep 51 hours (the teen grows to 44 hours) or move it to 41 hours (the teen keeps 34 and the adult stage grows to 79)?
2. Baby drain: is 2.4 the right size, or should the baby's extra food come as a Standing multiplier on a smaller drain increase?
3. Elder cache: reduce (x0.25), remove, or swap in elder wear; and what PURGE does for an elder?
4. Rest call: the response window (start 90 minutes, with the first 30 on time), the threshold, and the names for Iron.
5. Tired: is a 16% drain increase and no flow the right size, or should it be closer to a neglect state?
6. The notification budget and which classes default on.
7. Whether adults get clustered, predictable events at all (section 2.2).

## 5. Constraints and risks

- The care drafts decided care is a reskin of 1.0's four meters and buttons with a fixed button count and flavor-only rhythm. Stage curves make the rhythm mechanical; the button count stays fixed.
- A work-day gap stays fatal. The rest call must not weaken that.
- The baby stage is the first several hours of a new player's first day, and it is now the hardest part of the life. Shortening it limits the cost, but the opening has to teach the care loop at a faster pace. The tutorial wording is per egg (`tutorial-text.js`) and would need a look.
- The teen form is decided on less data. With a 7 hour baby and a 2.4 drain multiplier the expected Standing is about the same, but variance is larger.
- Rest ends the pressure states; the call-rest exemption is the only thing keeping answering a call from costing a held Overdrive or Overlink.
- XP and per-stage power curves were set aside; this package covers most of that goal without a new system.

## 6. Wording (not drafted)

Needed from the care-drafts register: the rest call line per egg (call, on time, late, lapsed), the tired state's meter word, the baby's hungry and messy lines, the elder's "nothing to purge" line, and the notification texts for each class. The warning, discharge, throttle and crash lines for the break are also still to write.
