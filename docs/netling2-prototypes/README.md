# Netling 2.0 rule prototypes

## The 2.0 simulator (current)

`prototype/netling2/sim/` is a fork of 1.0's simulator carrying the 2.0 core life rules as real rules, replacing the scratch patch described further down for everything it covers. `src/` and `tools/` are untouched, and the fork reproduced 1.0's `npm run balance` output exactly before any 2.0 change (casual, 100 lives), so its diffs show only the 2.0 rules. It is a prototype: not shipped, not in `sw.js`.

| File | What it is |
|---|---|
| `sim/sim.js` | Fork of `src/sim.js`. Standing as two tracks, temper with a 24 hour half-life and the five levels (the flicker guard is `tell.js`'s), bugs, no fault cap, teen and adult evolution with the tie-break weights, care preferences, 22 generic forms per egg |
| `sim/netrun/run.js` | Fork of `src/netrun/run.js`: ICE games enter the preference history; a disconnect fault owes a bug roll |
| `sim/netrun-bot.mjs`, `sim/balance.mjs` | Forks of the scripted netrun player and `tools/balance.mjs` (same archetypes, same settings, new report lines) |
| `sim.test.js` | 38 tests, one or more per rule and one for the role steerers (`npm run proto:test`) |
| `sim/role-sweep.mjs` | How committed to one game a player must be for the role to be certain (see Role steerers) |
| `sim/push-sweep.mjs` | Whether the soft push gets a bugged player to a clinic (see Soft push to run) |
| `sim/clinic-sweep.mjs` | The clinic against no clearing and home clearing, by share of market nodes (see The clinic) |
| `sim/gap-sweep.mjs`, `sim/human-sweep.mjs` | Survival against the longest gap between check-ins, and against irregular schedules (see Noisy players) |
| `sim/bug-sweep.mjs` | How a player should handle bugs and what each way costs (see Bug policies) |
| `sim/temper-sweep.mjs` | How much play the Metronome's 12 hour hold takes (see Temper seekers) |
| `sim/hunter-sweep.mjs` | How much play the hidden forms take (see Hidden-path hunters) |

**Netrun rules (added after the tables below; see `prototype/netling2/notes/netrun-sim-notes.md`).** The fork also carries the decided 2.0 netrun rules as switches in `sim/netrun/nr2.js`, off by default so the tables below reproduce: one ability per role and lean at two levels, a harder tier of ICE, the forced filled cache, the 5 minute grace window and light egg run costs (`NR2=all` switches them on). The codex cap is now 12, Root Access arrives mid-life, and the elder feat can follow the account (`CFG.featFor`). New commands: `npm run proto:netrun` (`sim/netrun-sweep.mjs`, per-form netrun outcomes and a parity read-out), `npm run proto:lineage` (`sim/lineage-sweep.mjs`, lives to finish the 18 egg pages, replacing `lines`, `lines2`, `rogue` and `rogue2` on the fork) and `sim/grace-sweep.mjs`. **Every table below was measured without run abilities, with one kind of ICE, with cap 8 and with Root for the next life only; the netrun-dependent ones (clinic, push, bug policies at clinics, noisy players, role and hunter tables) are stale until rerun with `NR2=all`.** The notes file lists what is stale and which sweep tests which open balance question.

Run: `npm run proto:balance [runs] [archetype]` (`DETAIL=1` for the full report, `JSON=1` for JSON, whose level keys are the numbers -2 to 2). Settings beyond 1.0's: `CLEAR=scrip|both|none` (how bots clear bugs unless the archetype sets its own `fix`: scrip at check-ins, or also 2 Standing, one from each track; default `scrip`), `PREF='{"on":false}'` (preferences off), `PREFBOT=follow` (bots follow their netling's preference), `BUGS='{"chance":0.5,"max":8}'`. 300 lives of all 36 archetypes take about 3.5 minutes.

**The clinic (maintainer's design, first pass).** Bugs cannot be cleared away from a netrun; the only way is a **clinic**, a third kind of market node (`flavor: 'clinic'`, rolled once per market node at `clinicShare` 0.25, so black and corp markets keep three quarters between them). A clinic is unaligned (no Standing lean), fixes one bug for the market Charge fee (12) plus 15 scrip, or 2 Standing in a split the player picks (2 corp, 1 and 1, or 2 street), and stays open after a fix, so several can be bought in a visit; a purchase or leaving ends it. It is also the only market that sells the healing items, Coolant cell, Repair kit and Antivirus patch (`HEALING`; the black market's and the corp exchange's stock no longer contain them; the corp exchange sells voucher 3, booster 2, bypass chip 1 and memory 1 instead, a proposal: `sim/exchange-stock.mjs` shows that without it every exchange visit offered the same voucher and memory pair, and that the bots move within noise under any of the four stocks tried), 12 Charge plus the item's scrip price, with no accessory offer. Healing items are still found as loot and dropped by wins and events. Bots with bugs prefer a clinic when one is in sight (`seekClinic`) and pay by their `fix` policy (default scrip first, then Standing). `CLINIC='{"clinicShare":0.5,"healingOnlyAtClinic":false}'` overrides the settings; `BUGS='{"homeClear":true}'` allows clearing at a check-in as before. What the maintainer did not specify and I chose: the share, the fee, the stock weights (coolant 3, repair 3, antivirus 2), one fix at a time with the visit staying open, and clinic nodes in daily traces (none).

`clinic-sweep.mjs [lives] [bases]` compares ways of handling bugs. 300 lives, full-life rate, bugs carried on average, bugs at the end, lives that reached the ceiling, clinic visits and bugs cleared a life:

| Base | Case | Full life | Bugs average / end | Ceiling | Visits / cleared |
|---|---|---|---|---|---|
| casual | no way to clear | 87% | 0.92 / 2.25 | 14% | 0.0 / 0.0 |
| casual | home clearing (earlier rules) | 94% | 0.11 / 0.13 | 0% | 0.0 / 1.8 |
| casual | clinic 10% | 92% | 0.48 / 1.05 | 7% | 1.6 / 1.1 |
| casual | **clinic 25%** | 95% | 0.28 / 0.53 | 2% | 3.5 / 1.6 |
| casual | clinic 50% | 95% | 0.15 / 0.30 | 0% | 6.8 / 1.5 |
| casual | clinic 25%, healing also in markets | 93% | 0.27 / 0.55 | 2% | 3.5 / 1.3 |
| worker | no way to clear | 78% | 1.02 / 2.46 | 25% | 0.0 / 0.0 |
| worker | home clearing (earlier rules) | 81% | 0.82 / 1.85 | 20% | 0.0 / 0.6 |
| worker | **clinic 25%** | 83% | 0.83 / 2.01 | 20% | 0.6 / 0.4 |
| worker | clinic 50% | 85% | 0.73 / 1.74 | 17% | 1.2 / 0.7 |
| attentive | **clinic 25%** | 100% | 0.02 / 0.03 | 0% | 6.0 / 0.1 |
| overclocker | **clinic 25%** | 95% | 0.23 / 0.54 | 2% | 0.0 / 0.0 |
| human-regular | no way to clear | 25% | 0.51 / 1.48 | 4% | 0.0 / 0.0 |
| human-regular | **clinic 25%** | 27% | 0.39 / 1.14 | 2% | 0.8 / 0.4 |

Reading it (bug effects as chosen below). A player who netruns often (casual makes 17 runs a life) meets a clinic 3.5 times and ends with 0.3 bugs on average: 95% full life, as good as clearing at home (94%) and well above having no way to clear (87%). **A player who rarely or never netruns cannot clear bugs at all**: the careful worker (2 runs a life, only when healthy and soon back) meets 0.6 clinics, ends at 83% against 78% with no way to clear, and reaches the bug ceiling in 20% of lives; the overclocker (no runs) and the noisy players (3 runs) are no better off. That removes the Standing price's use for exactly the players the sketch said it was for ("the Standing price helps those who do not run"): the Standing payment now needs a netrun too. Removing the healing items from the other markets changes little at this scale (casual ends alive 95% of the time against 93% when the markets still stock them, within noise). Limits: bots detour to a clinic only when it is one step ahead or within three steps and visible; the clinic's share, fee and stock are guesses; bugs do not carry between lives.

**The clinic against the final pressure design (re-measured).** `sim/clinic-final.mjs [lives] [bases]`: each egg with its own pressure (Iron wear and Overclock x3, Program Overdrive, Wetware Overlink with its brake, owner x3, tripled benefits, doubled costs), the default bots, 150 lives a cell, share of market nodes 10% / 25% (now) / 40% and a scrip fee of 10 / 15 (now) / 25 at the 25% share. Simulator output only, not unit-tested.
- **Share.** 25% stays the best. Casual: full-life 0.947 to 0.953 at 25% (0.920 to 0.947 at 10%, 0.927 to 0.933 at 40%), bugs carried 0.24 to 0.26 on average (0.41 to 0.46 at 10%, 0.16 to 0.19 at 40%), bug ceiling in 0.7% of lives (2% to 5% at 10%, none at 40%). A larger share clears a little more but takes market nodes away and costs about two points of full-life. Attentive players visit 5.5 to 5.9 times a life at 25% and clear 0.1 to 0.2 bugs: they rarely have any.
- **Fee.** 10, 15 and 25 scrip give the same outcomes within noise (scrip spent 1 to 19 a life, never binding): the fee is not a lever; keep 15.
- **Eggs.** The three eggs behave the same at the clinic (casual faults 6.7 to 7.0, bugs carried 0.24 to 0.26); the final pressure design does not change what the clinic needs to do.
- **Workers still hit the bug ceiling.** Worker full-life 0.847 to 0.853, bugs carried 0.75 to 0.77, 17% to 19% of lives at the ceiling at any share (20% to 21% at 10%): a worker makes 0.5 clinic visits a life, so the share barely matters; the soft push (statements and the clinic job) is the lever, and it was not on in this run (its earlier measurement took the worker's ceiling from 20% to 4%).
- **Overclocker and sysadmin-like players never run,** so they never visit and clear nothing (bugs carried 0.17 to 0.34); the clinic is irrelevant to them.
- **Not measured:** the stock weights (coolant 3, repair 3, antivirus 2); the bots' item use is simple, so a measurement would say little about a human.
- **Decision (kept):** share 25% and fee 15 scrip or 2 Standing; stock weights unchanged.

**Soft push to run (maintainer's request).** A bugged netling should be nudged to a clinic without being forced. Two nudges are modeled; neither is a penalty.
- **The netling says so.** It logs a line when a bug settles in (a different one at 3 or more bugs) and now and then while it is idle and bugged (`bugNagPerHour` 0.15, the chatter rate), each pointing at the clinics out on the net. Text only: no rule depends on it. The bots cannot read it, so `pushRuns` stands for how likely a player is to act on it.
- **A clinic job.** A new contract kind, `clinic` ("get a bug fixed at a clinic"): posted only while the netling has bugs (70% of the jobs it is offered, `clinicContractChance`), at twice the usual rate (`contractBuggedMult`), pays 15 scrip (a fix's price) and nothing else, and when it is taken along every market early enough in the map is a clinic, so every route passes one. It lapses after 6 hours as any job does. Bots read the board at each check-in only if they set `contracts`; a posted job takes the bot to its region. `pushRuns` is the chance a bugged (or job-holding) player goes for a netrun despite their usual reluctance (a player who does not run goes carefully; a player who does ignores `runChance` and the 'back soon' rule).

`push-sweep.mjs [lives] [bases]` compares: no push; the statements alone (the player goes 50% of the time when bugged); statements and the job board (goes 50%); the job board alone; and a player who always goes. 300 lives; bugs on average, lives at the bug ceiling, clinic visits and runs a life, full-life rate:

| Base | Case | Bugs average | Ceiling | Visits | Runs | Full life |
|---|---|---|---|---|---|---|
| worker | no push | 0.83 | 20% | 0.6 | 2.1 | 83% |
| worker | statements, goes 50% | 0.48 | 10% | 1.1 | 3.6 | 82% |
| worker | statements + job board, 50% | 0.29 | 4% | 2.2 | 4.6 | 89% |
| worker | job board only | 0.63 | 18% | 1.0 | 2.0 | 85% |
| worker | statements + job board, always | 0.16 | 2% | 3.0 | 6.9 | 90% |
| human-regular | no push | 0.39 | 2% | 0.8 | 3.0 | 27% |
| human-regular | statements + job board, 50% | 0.22 | 0% | 1.7 | 5.0 | 34% |
| human-casual | no push | 0.43 | 3% | 0.4 | 2.1 | 5% |
| human-casual | statements + job board, always | 0.32 | 1% | 0.9 | 2.6 | 6% |
| overclocker (no runs) | no push | 0.23 | 2% | 0.0 | 0.0 | 95% |
| overclocker | statements, goes 50% | 0.08 | 0% | 0.3 | 0.8 | 95% |
| overclocker | statements + job board, 50% | 0.08 | 0% | 2.3 | 7.4 | 96% |

Reading it. The nudges work for players who can run: the worker's bugs fall from 0.83 to 0.29 on average and the bug ceiling from 20% to 4% of lives, with survival up from 83% to 89%, when both nudges act half the time; the overclocker, who never ran, clears its bugs once it is nudged (0.23 to 0.08). The statements alone move a worker less (0.48 bugs, 10% at the ceiling) and do not help survival (82%): a nudged run ignores the 'be back soon' rule and costs some disconnects. The job board alone helps a little (0.63, 85%). A noisy player who is rarely around (`human-casual`, 5% full life) gains little because they do not live to see a clinic. **Side effects to know:** bots that read the board accept every kind of job, not only the clinic one, so their scrip rises (a worker ends with about 46 against 20), which is an economy effect of using contracts at all (1.0's bots never did) and not part of the push. The statements consume random numbers, so runs with bugs differ slightly from before they existed.

**Do bugs kill? (decided: yes, moderately).** The maintainer's thought: neglect or inconsistent care leads to bugs, bugs push toward death, not necessarily a spiral. With the first effects (Charge and Sync drain +8% a bug, Heat gain +10%, Integrity damage +4%) they **hardly did**: holding five bugs from birth cost a casual netling a point and a worker 5 points, and bugs on against bugs off cost -3 to 1 points of full life (noise) for casual, worker, human-regular and human-keen. Candidates measured, in points of full life lost to bugs (30% a fault / 50%; casual, worker, human-regular, human-keen): a flat Integrity loss of 0.75 an hour a bug: -1, 4, 1, 2 / -1, 7, 3, 1; doubling every multiplier: 1, 1, 3, 0 / 3, 10, 5, 5; doubling and a flat 0.5: 1, 8, 6, 4 / 3, 22, 5, 8; tripling: 1, 14, 6, 3 / 5, 31, 10, 7 with the careful worker at the ceiling in 27% to 56% of lives (the spiral). **The maintainer chose doubling plus a flat 0.5 an hour a bug**, now the default (`BUG_CFG`: Charge and Sync +16%, Heat +20%, damage +8%, `integrityFlat` 0.5). With it, 400 lives each, points of full life lost to bugs at 30% a fault / 50%: casual 1 / 2, worker 6 / 22, attentive 0 / 0, human-regular 5 / 8, human-keen 3 / 5; the careful worker, who cannot reach clinics, carries 0.84 bugs on average and is at the ceiling in 21% of lives (52% at 50% a fault); and holding bugs from birth (no new ones) a casual netling lives 95%, 95%, 93%, 74% with 0, 2, 3, 5 bugs, a worker 90%, 81%, 65%, 19%, an attentive one 100%, 100%, 100%, 99%. So neglect now costs lives where it did not, mostly for players who cannot clear (the worker's ceiling rate is the spiral to watch), and a clinic recovers most of it (casual with no way to clear 87%, with clinics 95%; worker 78% and 83%, 85% with half the markets clinics). The tables in Bug policies (home clearing), the noisy-player and temper-seeker tables and the earlier role and hunter tables were measured before the change, with the weaker bugs; the clinic and push tables were re-run. Knobs: `BUGS='{"integrityFlat":0.75,"regenCut":0.15,"charge":0.16,"sync":0.16,"heat":0.2,"integrity":0.08}'` (`regenCut` cuts Integrity regeneration by that share a bug); `startBugs` starts a life with that many (experiments only).

**Rules modeled** (sketch sections in brackets): Standing sources, 0.25 a packet, 1 for COMPLY, HIDE, an ignored trace, a voucher, a Black ICE shard, checkpoint and anomaly choices, 0.5 for market purchases, nothing for care or games (Standing; netrun leans pass through an adapter, `attachAxes`); temper sources and decay, items +1, Segfault -4, shown level with guard 1.0 (Temper); bugs 30% a fault, ceiling 5, drains +8%, +8%, +10% Heat, +4% Integrity damage, cleared at a clinic node for 15 scrip or 2 Standing plus Charge (Bugs, and The clinic above); faults uncapped, integrity collapse and the end of the cycle the only deaths (Risks); teen and adult forms by fractional Standing against whole-number cutpoints (the gap's whole part sets the weight; decided by the maintainer) and wins, hidden teen at 3 wins each, hidden adult at 4 each and 29, tracks within a point (Evolution); care preferences with the Sync bonus, the request bias and ICE in the history (Care preferences). It also records, per life, awake time at each temper level, the longest unbroken 12 hour hold at a strong level with neglect level 2 paused (the Metronome's test), and awake hours at neglect level 2.

**Not modeled:** the sketch's debug station anomaly (the clinic replaces it for now), the clinic's look on the map, and the value of the exchange's new stock to a human (the bots buy the first wanted offer); 2.0 perks, traits, keepsakes and netrun abilities (undesigned, so the 22 forms differ only in how they are reached and the three eggs behave the same); Root Access granted at once and the elder tiers (progression layer, use the drivers below); egg pages and the Rogue gate; neglect's look; the sprite. The 1.0 archetypes cycle games in a fixed order, so for them the role is never certain (the top two games stay within 5 wins); the role steerers below are the only ones that choose a game. No bot reacts to a glitching sprite; the Standing display (floors) is not modeled.

**Fidelity checks** (300 lives, share of lives ending at each shown temper level, strongly unsteady / unsteady / middle / steady / strongly steady; the sketch's figures came from the scratch patch):

| Archetype | Sketch | This simulator |
|---|---|---|
| Casual | 0/20/76/4/0 | 0/21/74/4/0 (clinic only: 0/31/67/2/0) |
| Worker | 2/37/60/0/0 | 3/40/56/1/0 (3/43/54/0/0) |
| Attentive | 0/0/10/46/43 | 0/0/14/38/48 (0/0/10/49/41) |
| Steer-daemon | 0/0/1/25/74 | 0/0/2/22/76 (0/0/2/22/77) |
| Steer-glitch | 6/49/45/0/0 | 4/50/46/0/0 (6/52/42/0/0) |
| Daredevil | 24/53/22/0/0 | 32/55/12/0/0 (38/51/11/0/0) |
| Overclocker | 72/27/0/0/0 | 83/17/0/0/0 (84/16/0/0/0) |
| Neglectful | 18/56/25/0/0 | 14/43/43/0/0 (14/43/43/0/0) |

Also in line: casual Standing by adulthood about 9.4 and 8.9 (the sketch: about 10 and 8); a worker without clearing 7.7 faults and 14% at the bug ceiling (the sketch: 7.7 and 17%); the 12 hour hold reach with neglect level 2 paused: attentive 48% (52%), steer-daemon 80% (87%), daredevil 35% (34%), steer-glitch 5% (5%), overclocker 80% (90%). Casual full-life rate 94% (the sketch: 95.7% without the cap). **The hot end does not reproduce** (daredevil and overclocker end more unsteady), and the gap is not explained: it does not come from bugs (switching them off changes nothing), and switching care preferences off widens it (overclocker 91% strongly unsteady, daredevil 35%), so preferences narrow it without closing it.

**Role steerers.** Nine archetypes added: `steer-<role>-corp` and `steer-<role>-street` for breach, dodge, tune and feast (attentive, steering the lean as `steer-chrome` and `steer-firewall` do, and giving 80% of their plays to one game, the rest rotating; they decline requests for other games), and `nudge-breach` (50% of plays in one game, packets and traces leaning corp). 300 lives each: every steerer ends as exactly its role and lean (100%), with the role certain (a lead of 5 or more wins) and the lean certain at adulthood in 100% of lives; at the teen check the lean is certain in 85% to 99% (corp 85% to 94%, street 95% to 99%), which matches the sketch's 92% to 98% measured on 1.0's allegiance. The half-committed `nudge-breach` still ends as a breach form 98% of the time (breachCorp 95%) with the role certain in 95%. `role-sweep.mjs [lives] [shares]` varies the share of plays given to one game with no lean steering (300 lives; the rest rotate, so a share of 0 is the plain rotation):

| Share of plays in one game | Role certain at adulthood | Adult is a role of that game (a quarter by chance) |
|---|---|---|
| 0 | 0% | 28% |
| 0.1 | 8% | 50% |
| 0.2 | 32% | 68% |
| 0.3 | 59% | 83% |
| 0.5 | 93% | 97% |
| 0.8 | 100% | 100% |

So role is cheap to steer: a player who gives one game twice the plays of each other game (a share of 0.2 is 40% of plays against 20% each) already ends in that role two times in three, and a share of 0.5 is nearly certain. This is the middle the sketch said it had not measured. It is one bot design (the focus game is chosen at random each play, wins are at the archetype's win rate for every game, and the play count is fixed by Sync need), and it ignores care preferences (`PREFBOT` unset), which pull a steady netling toward its last two games and an unsteady one away from them.

**Hidden-path hunters.** Four archetypes added to the hunter `ghosthunter` (1.0's, which balances packets and trace answers and rotates the games): `hunter-exact` also plays whichever game it has won least and answers requests only for games that are not ahead; `hunter-shown` is the same but sees only the HUD's floors of Standing (`shown`, the `leanSeen` helper; on a shown tie it alternates packets); `hunter-shown-rotation` keeps the plain rotation to isolate the display; `hunter-casual` is `hunter-shown` on a casual schedule and skill. 300 lives each:

| Archetype | Hidden teen | Hidden adult | Wins 3 in each game by the teen check | Gap at most 1 at the teen check |
|---|---|---|---|---|
| `ghosthunter` (rotation, true fractions) | 36% | 96% | 36% | 100% |
| `hunter-exact` | 82% | 95% | 82% | 100% |
| `hunter-shown` | 85% | 98% | 86% | 99% |
| `hunter-shown-rotation` | 39% | 97% | n/a | n/a |
| `hunter-casual` | 0% | 0% | 0% | 96% |

So the Standing condition is not the hurdle even when the player sees only floors: the tracks stay within 1 of each other in 96% to 100% of lives, because a player who balances keeps the gap small and fractions only add a quarter point either way. The hurdle is wins: 3 in every game by 17 hours (plain rotation reaches it in 36%, aiming at the least-won game in 82% to 86%) and, for the adult, 29 wins in all by 51 hours (96% to 98% for these gamers). `hunter-sweep.mjs [lives] [gaps] [winRates]` varies play: with `hunter-shown`, hourly check-ins (17 a day) give a hidden teen in 85% and a hidden adult in 97%; every two hours (9 a day) 45% and 44%; every three (6 a day) 5% and 1%; fewer, nothing. Win rate matters at nine check-ins a day (60%: 24% and 10%; 75%: 45% and 44%; 90%: 71% and 82%). These bots are gamers (they play toward a Sync of 90 and up to four games a check-in), so they play far more than the other archetypes (about 75 wins a life against 50 for `attentive`). Read it as: the hidden forms need an attentive, game-focused player who also balances packets; the sketch's aim that they be hard to reach by accident holds, and the wins requirement, not the Standing one, is what makes it hard. Limits: bots that decide perfectly from the floors; no real player counts wins per game without a tally, and the sketch's wins-per-game tally per life is what would make this possible.

**Noisy players.** Four `human-*` archetypes with schedules and habits that vary: `perDay` check-ins a day (scaled 0.7 to 1.3 each day, at random times that cluster in the morning, around midday and in the evening, 15 minutes apart at least), a share of busy days (1 or 2 check-ins) and off days (0 or 1), chores skipped one time in `lapse` (curing, purging, cooling, trace and intrusion answers, the lights), a mood that moves the win rate each check-in, a favorite game for a share of plays and any other game otherwise, netruns only some of the time, and topping up Charge and Sync before a gap of 4 hours or more (`prepare`). `human-casual` (6 a day, busy 25%, off 10%, lapse 20%), `human-regular` (9 a day), `human-keen` (14 a day) and `human-bursty` (14, 1, 10, 0, 12 check-ins on days 1 to 5). There is no steering: packets and trace answers are random. 300 lives:

| Archetype | Teen | Adult | Full life | Median days | Deaths by integrity collapse |
|---|---|---|---|---|---|
| `human-casual` | 79% | 35% | 8% | 1.6 | 92% |
| `human-regular` | 93% | 65% | 30% | 3.2 | 70% |
| `human-keen` | 97% | 86% | 72% | 5.0 | 28% |
| `human-bursty` | 100% | 21% | 1% | 1.6 | 99% |

**This is the main finding: survival depends on the longest awake gap, not on how often the player checks in.** `gap-sweep.mjs` runs the casual archetype with check-ins evenly spaced every N hours from 07:00 to 23:00 (300 lives; `SIM=1.0` runs 1.0's simulator for the same table):

| Gap | Check-ins a day | Full life, 2.0 | Full life, 1.0 |
|---|---|---|---|
| 2 h | 9 | 99% | 99% |
| 3 h | 6 | 95% | 95% |
| 4 h | 5 | 93% | 84% |
| 5 h | 4 | 73% | 35% |
| 6 h | 3 | 24% | 27% |
| 8 h | 3 | 5% | 0% |

Gaps of 4 hours or less are survivable, 5 hours costs a quarter of lives, and 6 hours or more (a work day away) kills most netlings, in 1.0 as well as in this simulator. Six check-ins a day at random times survive in only 40% of lives (`human-sweep.mjs`: 4 a day 11%, 6 40%, 8 68%, 10 82%, 12 87%, 16 95%), against 95% when they are evenly spaced; adding lapses lowers each by 3 to 20 points; adding busy and off days (a quarter of days with 1 or 2 check-ins, a tenth with 0 or 1) caps survival near 25% however many check-ins the other days have (6 a day: 6%, 16 a day: 22%), because one day with at most two check-ins is usually fatal. Topping up before a long gap made no consistent difference (runs with and without `prepare` were within about 10 points of each other, in both directions). For the deaths, at 8-hour gaps a life takes about 3.9 Charge faults and 3.4 Sync faults and dies by integrity collapse at a median of day 1.3; the exact drain that kills it was not traced. **This contradicts the comment on `drainCurve` in `src/sim.js` ("long gaps (a work day, the night) still cost faults without being fatal") and `docs/BALANCE.md`'s picture of a casual player.** It is a 1.0 property carried into 2.0 (the fault cap's removal helps a little: 1.0's neglect deaths became collapses or survivals), so it is a question for the maintainer, not a simulator fault: whether a work-day gap should be survivable (a gentler drain when it is far from full, a floor on Integrity loss while Charge is at 0, or the sketch's hibernation made easier to reach). Limits: bots top up to 85 or 94, not 100; a real player may cool, patch and play more cleverly before leaving; the bots do not carry items for a long gap beyond an Antivirus patch; 200 to 300 lives a cell.

**Bug policies (home clearing; the rules no longer allow it, so these tables used `BUGS='{"homeClear":true}'`, which `bug-sweep.mjs` sets).** An archetype's `fix` sets how it handles bugs (at a clinic only `mode` and `split` apply): `mode` (`scrip`, `standing`, `both` or `none`), `at` (clear once it carries this many) and `split` (how a Standing payment is taken: `even`, 1 from each track; `leader`, 2 from the larger; `trailer`, 2 from the smaller). The report now gives the average bugs carried, the share of time at the ceiling and what clearing cost in scrip and Standing. `bug-sweep.mjs [lives] [bases] [policies]` runs a base archetype under eight policies. 300 lives, the default rule (30% a fault, ceiling 5), faults by the end of life, average bugs carried, lives that reached the ceiling, adult Standing gap:

| Policy | casual: full life, faults, bugs, ceiling, gap | worker: full life, faults, bugs, ceiling, gap |
|---|---|---|
| ignore | 91%, 7.3, 0.86, 11%, 2.86 | 89%, 7.7, 0.91, 14%, 1.87 |
| scrip, at once | 94%, 6.1, 0.11, 0%, 2.75 | 89%, 7.1, 0.65, 7%, 1.87 |
| scrip, from 2 bugs | 92%, 6.6, 0.42, 0%, 2.82 | 88%, 7.2, 0.74, 7%, 1.88 |
| scrip, at the ceiling | 91%, 7.3, 0.83, 11%, 2.86 | 89%, 7.6, 0.89, 14%, 1.87 |
| Standing, even split | 94%, 6.0, 0.05, 0%, 2.80 | 91%, 5.6, 0.03, 0%, 1.68 |
| Standing, from the leader | 94%, 6.0, 0.05, 0%, 2.57 | 90%, 5.6, 0.04, 0%, 1.70 |
| Standing, from the trailer | 94%, 6.0, 0.06, 0%, 3.73 | 91%, 6.0, 0.15, 1%, 2.62 |
| scrip, then Standing | 94%, 5.9, 0.04, 0%, 2.74 | 91%, 5.6, 0.03, 0%, 1.68 |

A worker ends a life with about 11 scrip after spending 12 on bugs, so clearing with scrip alone leaves it carrying 0.65 bugs on average and 7% of lives at the ceiling, while paying 3.5 Standing (about 15% of the 23 it ends with) clears nearly everything. Clearing is worth doing at once: waiting for 2 bugs costs a casual netling a point or two of survival and 0.3 bugs carried, and waiting for the ceiling is no better than ignoring them. Ignoring costs a casual netling about 3 points of full life and 1.2 faults, and a worker about 0 points (its deaths come from elsewhere). A Standing payment moves the lean by the split: from the trailer widens the adult gap by about 1 (casual 2.8 to 3.7), from the leader narrows it by about 0.2 (0.4 at the harsh rule), and an even split leaves it. A payment from the trailer also fails whenever that track is under 2, so a steerer (whose trailing track stays near 1) cannot use it, which is what the sketch called the hidden retooling effect and also a limit on it. With the harsh rule (50% a fault, ceiling 8, `BUGS` set) a worker ignoring bugs reaches the ceiling in 26% of lives and carries 1.8 on average; scrip at once leaves 17% and 1.45; Standing leaves none and 0.06. Casual at the harsh rule: ignoring 90% full life and 1.6 bugs, scrip at once 92% and 0.23 (42 scrip), Standing 94% and 0.07 (5.9 Standing). A steerer (`corpo`) rarely has bugs even then (0.1 on average, 0.5 Standing a life when it pays). Limits: bots clear only at check-ins; the netrun debug station is not modeled; bugs do not carry across lives (a proposal in the sketch); the policies are single rules, not a player who weighs the lean.

**Hidden-path hunters following their netling's preference** (`PREFBOT=follow`, 300 lives; as for the steerers, following replaces the bot's game and packet choices with the preference's):

| Archetype | Hidden teen, ignoring | Following | Hidden adult, ignoring | Following |
|---|---|---|---|---|
| `ghosthunter` | 36% | 24% | 96% | 19% |
| `hunter-exact` | 82% | 62% | 95% | 22% |
| `hunter-shown` | 85% | 66% | 98% | 22% |
| `hunter-shown-rotation` | 39% | 24% | 97% | 19% |

Following costs the hidden adult almost entirely, for two reasons seen in `hunter-shown`: the tracks end within 1 point in only 24% of lives (the mean gap is 3.4, against 0.25) because a steady netling repeats its last packet and the balancing is gone, and 4 wins in every game falls from 100% to 63%. The hidden teen suffers less (24% to 66% reach it) because it asks for less. That agrees with the sketch's earlier finding that a balance seeker that followed would fall from 100% to 3% within a point. So a steady netling's pull toward routine works against the hidden path, and the player has to ignore it, as the sketch noted; a hunter's temper is mostly steady (`ghosthunter` ends steady or strongly steady in 97% of lives), so the pull is nearly always on.

**Temper seekers.** Three archetypes aim at a strong temper level for the Metronome's 12 hour hold (neglect level 2 paused): `seek-steady` (cools early, balances, orderly anomaly choices), `seek-unsteady` (plays warm, up to Heat 80, risky anomaly choices) and `seek-unsteady-segfault` (the same, and uses every Segfault it finds: temper -4, two faults, bugs). The report now gives the median day of the first 12 hour hold and the share that held 24 hours (`holdDay`, `hold24h`). 300 lives, hourly check-ins:

| Archetype | Held 12 hours | Median day | Held 24 hours | Faults a life | Bugs at the ceiling |
|---|---|---|---|---|---|
| `seek-steady` | 87% | 2.4 | 67% | 0.2 | 0% |
| `seek-unsteady` | 32% | 3.4 | 9% | 1.6 | 0% |
| `seek-unsteady-segfault` | 90% | 2 | 71% | 12.6 | 5% |

`temper-sweep.mjs [lives] [gaps] [archetypes]` varies check-ins (200 lives; run it with `PREF='{"on":false}'` for the same without care preferences). Share that held 12 hours, preferences on (off in brackets):

| Check-ins a day | `seek-steady` | `seek-unsteady` | `seek-unsteady-segfault` |
|---|---|---|---|
| 17 | 88% (85%) | 32% (43%) | 90% (97%) |
| 9 | 24% (37%) | 29% (33%) | 82% (88%) |
| 6 | 1% (0%) | 25% (32%) | 50% (55%) |
| 3 | 0% (0%) | 6% (7%) | 11% (8%) |

Reading it: the steady end takes near hourly attention (an unattended netling does not reach flow); the unsteady end is open to a player who checks in 6 to 9 times a day, and a Segfault is what makes it cheap, because warm play alone only reaches 25% to 32% of lives. The Segfault route costs a lot: 11 to 13 faults a life, a bug ceiling reached by 5% to 8% of lives and a worse full-life rate at 6 check-ins a day (92% to 96% against 99% to 100%). So the two ends are not symmetric in effort, which the sketch said it wanted ("neither end is the good one"): steady is the high-attention reward, unsteady the cheaper and riskier one. Preferences matter less here than in the earlier archetypes (the unsteady warm-play seeker loses 1 to 11 points to them, as the overclocker did); the steady seeker's 13 point loss at 9 check-ins is unexplained and may be partly noise (200 lives, about 3 points a share). Limits: bots that use every Segfault they find (a real player may keep them), one fixed heat policy for the warm seekers, and no tuning of the 12 hour length or the neglect rule, which the sketch measured separately on 1.0's simulator.

**Role steerers following their netling's preference** (`PREFBOT=follow`, 300 lives). The follow bot replaces whatever game it would play with the preference's (a steady netling repeats its last game, an unsteady one plays the least-played game not among its last two), so for a steerer it is a conflict between the steering and the preference, not a combination. The steerers are steady most of the time (the 29% to 70% shares in their level lines), so mostly the routine wins:

| Archetype | Role and lean ignoring the preference | Following it |
|---|---|---|
| `steer-breach-corp` | breachCorp 100%, role certain 100% | breachCorp 76%, role certain 59% |
| `steer-breach-street` | breachStreet 100%, 100% | breachStreet 85%, 73% |
| `steer-tune-corp` | tuneCorp 100%, 100% | tuneCorp 77%, 60% |
| `steer-tune-street` | tuneStreet 100%, 100% | tuneStreet 84%, 69% |
| `nudge-breach` | a breach form 98%, role certain 95% | breachCorp 71% (a breach form 76%), role certain 55% |
| No focus (share 0) | role certain 0%, in the role 28% | role certain 17%, in the role 30% |
| Share 0.2 / 0.5 | certain 32% / 93%, in the role 68% / 97% | certain 25% / 59%, in the role 50% / 77% |

Following costs a steerer its role (a lead of 5 wins is no longer reached in 27% to 41% of lives) and the Standing lean stays certain. With no steering at all it locks a steady netling into whichever game came last, so the role is certain in 17% of lives against 0%. That agrees with the sketch's earlier finding that following the routine makes a role likely (59% to 71% certain) where ignoring it leaves it near 5% to 8%, and it adds that the lock-in is on the game played last, not on the one the player prefers. Limits: one bot, the steady lock-in is on the last game only (the rule allows either of the last two), and no real player is this consistent.

**New findings:** care preferences pull the unsteady end back. A matched action gives Sync, so a hot player plays less. With preferences off the overclocker's 12 hour unsteady hold reaches 89% of lives against 80% with them, the daredevil's 45% against 35%, and overclockers ending strongly unsteady 91% against 83%. The sketch measured the preference and the Metronome separately, so their interaction was not seen. Clearing bugs with Standing as a fallback (`CLEAR=both`) cuts a worker's final bugs from 1.24 to 0.04 and the bug ceiling from 7% to 0 at the cost of a few Standing points; with no clearing a worker ends with 2.1 bugs and 14% at the ceiling.

Not verified: `npm run smoke`, any device check, and the temper-level differences above beyond the sample noise (about 1.5 points a share at 300 lives).

## The scratch patch (earlier figures)


Scratch prototypes that test Netling 2.0 rule ideas on 1.0's headless simulator (`tools/balance.mjs`, `src/sim.js`). They are not part of the game and are not shipped, tested or wired into `sw.js`. They exist so the numbers in [NETLING_2_SKETCH.md](../NETLING_2_SKETCH.md) can be reproduced and re-run, and so a later session knows exactly what was and was not modeled.

Everything here stands in for rules that do not exist yet. 1.0's single signed allegiance stands in for Standing, and 1.0's stability axis stands in for temper. Treat every figure as a rough guide. Retest the numbers when 2.0 is built.

## What the patch changes

`netling2-prototype.patch` is a unified diff against 1.0 (`src/sim.js`, `src/netrun/run.js`, `tools/balance.mjs`). Apply it only to a scratch copy, never to the repository's game code. It adds, all switched by environment variables or off by default where noted:

- **Bugs** (`BUG_CFG`, env `BUGS`): a fault rolls a bug (chance 0.3, ceiling 5), each bug adds to Charge and Sync drain (8% each), Heat drift (10%) and Integrity drain (4%), Segfault rolls 25% none, 60% one, 15% two, and bots clear bugs at check-ins for 15 scrip when `clear` is true. `on: false` turns bugs off. The temper decay (`tdecay`) is also set through `BUGS`.
- **Temper stand-in:** `s.axes.stability` multiplied by `tdecay` each minute (24-hour half-life is 0.999519). `ITEMTEMPER=1` makes a Coolant cell and an Antivirus patch add 1 to it.
- **Standing stand-in:** `s.standing` accumulates the positive and negative changes to 1.0's allegiance as two track totals.
- **Care preferences** (`PREF`, `PREFBOT`): temper level decides a Sync bonus for routine or novelty, game requests can be biased (`reqbias`, `steadyMode: "last2"`), `distinct` keeps the last two plays distinct, `ice` adds netrun ICE games to the history. `PREFBOT=follow` makes the bot follow the preference; anything else ignores it.
- **Counters:** per-action counts (`s.actCount`), anomaly nodes met (`s.anomalies`), games won, bug and preference totals in the result of `simulate()`.

## Reproducing a run

```bash
mkdir /tmp/n2 && cp -r src tools package.json /tmp/n2/ && cd /tmp/n2
patch -p1 < <repo>/docs/netling2-prototypes/netling2-prototype.patch
cp <repo>/docs/netling2-prototypes/*.mjs .
```

`guard.mjs` and `hold.mjs` read each minute's temper through a hook that is not in the patch; add it to the scratch copy with `sed -i 's|^    tick(s, t0 + minute \* MIN, rng);|&\n    globalThis.__sample?.(s, minute);|' tools/balance.mjs`.

Run from the scratch copy with Node 22. Each driver takes an archetype name from `tools/balance.mjs` and a number of lives.

| Measurement | Command (example) | Settings used for the sketch |
|---|---|---|
| Standing gap and tie-break leader chance | `BUGS='{"on":false}' node gap.mjs casual 0.25 300` | packets at 0.25 (the second argument), decisions at 1.0's values |
| Standing track totals, anomaly nodes, runs | `BUGS='{"on":false}' node standing.mjs casual 200` | packets 0.25, no fault cap |
| Bugs, death rates, clearing | `BUGS='{"clear":true}' NOCAP=1 node bugs.mjs casual 300 S2` | `NOCAP=1` removes the fault cap; scenarios B1 (1.0 as is, `BUGS='{"on":false}'` and no `NOCAP`), B2 (`on:false` with `NOCAP`), S1 (`{}`), S2 (`clear`), S3 (`clear`, `chance` 0.5), S4 (`chance` 0.5, `max` 8) |
| Temper levels | `ITEMTEMPER=1 FLOW=0.5 S1=3 S2=6 U1=2 U2=6 BUGS='{"clear":true,"tdecay":0.999519}' node temper.mjs attentive 300` | flow +0.5 an hour, 24-hour decay, items +1, thresholds -6, -2, +3, +6 |
| Care preferences | `ITEMTEMPER=1 PREF='{"on":true,"reqbias":true,"steadyMode":"last2","distinct":true,"ice":true}' PREFBOT=follow BUGS='{"clear":true,"tdecay":0.999519}' node pref.mjs attentive 300 FOLB3I` | follow bot; `PREFBOT=ignore` for the ignore bot; `PREF='{"on":false}'` for off |
| Temper level flips, flow against overclocked time, decay timing | `VARIANT=minute ITEMTEMPER=1 BUGS='{"clear":true,"tdecay":1}' node guard.mjs attentive 200` | needs the sampler hook (below); `VARIANT=minute\|hour\|sixh` is when the 24-hour decay is applied (`tdecay` must be 1 so the driver applies it), `GUARDS=0,0.25,0.5,1,1.5` |
| Time at each temper level, longest holds | `ITEMTEMPER=1 BUGS='{"clear":true,"tdecay":1}' node hold.mjs attentive 200` | flow +0.5 an hour, guard 1.0, thresholds -6, -2, +3, +6; `NEG=2` (or 1) makes awake minutes at that neglect level not count toward a hold, `NEGMODE=pause\|reset` |
| Long lineages per life (runs by region, elder, Source exit) | `TAG=_s2 CAP=12 EXITS=2 CLEAN=1 ROOT=nodeep node lines.mjs attentive 300 10` | run in a scratch copy of the UNPATCHED repo (`cp -r src tools package.json`); writes `lines-<archetype><TAG>.json`; `CAP` is codex fragments a life, `EXITS` and `CLEAN` the elder feat, `BEFORE` the hours before the end of life that the elder gate opens, `ROOT=nodeep\|sixteen` shrinks the Root list (the sim always uses the 22 of 1.0) |
| Lives to finish the 18 egg pages under Source page rules | `TAG=_s2 ROLE=0.2 HID=0.5 node rogue.mjs attentive` | needs `lines-<archetype><TAG>.json`; `ROLE` and `HID` set the role and hidden page rates (defaults 0.10 and 0.25), `ONLY='guaranteed first Source exit'` runs one rule; role pages 0.10 a non-Deep run, hidden page 0.25 a Deep run, three eggs one after another, eggs 2 and 3 drawn from post-Root lives |
| Lives to finish the 18 egg pages with a lighter elder feat after the first | `MODE=e1 TAG=_ease node lines2.mjs attentive 300 10` (also `MODE=later`, `MODE=laterEasy`, `EXITS=3 CLEAN=2` for the hard feat, `CAP`), then `ROLE=0.2 HID=0.5 node rogue2.mjs name l2-attentive-e1_ease.json l2-attentive-later_ease.json` | scratch copy of the unpatched repo; egg 1 from an empty codex, eggs 2 and 3 start with Root held and the codex full. `MID=1` makes Root arrive the moment the codex completes, as in the game (`drainCodexInbox`); the balance tool only grants it to the next netling, so without `MID=1` egg 1 runs about a life too long. `MID=1` needs one line in `tools/balance.mjs` after `tick(s, t0 + minute * MIN, rng);`: `if (globalThis.__rootMid && !s.rootAccess && ROOT_FRAGMENT_IDS.every((id) => ctx.codex.includes(id))) s.rootAccess = true;` |
| Iron's wear (egg pressure) widened with a Sync effect and lower thresholds | `node prototype/netling2/sim/iron-sweep.mjs 400 daredevil,overclocker,attentive` | runs in the repository (the fork in `prototype/netling2/sim/`); `IRON.lock` is the extra Sync drain at wear 100, `IRONBOT=avoid` the cooling bot; results in `prototype/netling2/notes/egg-pressure-notes.md`, Result 6 |
| State mark colors and placement (Overclock orange, Overdrive white sparks, Overlink sky-blue dots, four vision modes) | `node prototype/netling2/mark-colors.mjs` (candidate table); open `prototype/netling2/marks-preview.html` over `npm run serve` (or see `docs/netling2-prototypes/state-mark-colors.png`) | `prototype/netling2/marks.js` and `mark-colors.mjs`, tests in `marks.test.js`; wording in `docs/NETLING_2_CARE_DRAFTS.md`, State clues |
| The one-time pre-state caption (how often it shows, when, against the state it teaches) | `node prototype/netling2/sim/hint-sweep.mjs 150`; `HINT_MIN=60|120|150` sets the build time | `SIDES.<bar>.hintMin` (120), `hintAt` and `heldAt` on the netling; captions in `prototype/netling2/state-hints.js`; wording in `docs/NETLING_2_CARE_DRAFTS.md`, Pre-state caption |
| The one-time Overclock and Iron wear captions (how many netlings see each, and how early) | `node prototype/netling2/sim/heat-hint-sweep.mjs 150` | `ocAt` and `wearAt` on the netling; captions in `prototype/netling2/state-hints.js` (`OVERCLOCK_HINTS`, `IRON_WEAR_HINT`); wording in `docs/NETLING_2_CARE_DRAFTS.md`, Pre-state caption |
| The clinic node's look (a pink plus beside the 1.0 nodes in every region palette) | open `prototype/netling2/clinic-preview.html` over `npm run serve` (or see `docs/netling2-prototypes/clinic-node.png`) | `prototype/netling2/clinic-node.js` (`drawClinicNode`), tests in `clinic-node.test.js`; wording in `docs/NETLING_2_CARE_DRAFTS.md`, Clinic look |
| Two-sided Charge and Sync, special states (Surge, Wired), play penalty and burnout | `node prototype/netling2/sim/sides-sweep.mjs 200 attentive '<overrides json>'`; `SYNCBOT=greedy|sip|budget` sets the Sync play habit | `SIDES` in `sim.js` (off by default); config and results in `prototype/netling2/notes/egg-pressure-notes.md`, Results 10 to 21; summary in `docs/NETLING_2_EGG_PRESSURES.md` |
| Iron pushed from both ends (cold line and nap and sleep cooling floor) | `node prototype/netling2/sim/iron-cold-sweep.mjs 400 attentive,casual,worker,daredevil` and `node prototype/netling2/sim/stat-profile.mjs 150` | `IRON.cold` and `IRON.restFloor` (both default 0, off); `IRONBOT=chill` is a player who cools at 30; results in `prototype/netling2/notes/egg-pressure-notes.md`, Result 7 |
| A band on Charge (Wetware) or Sync (Program) | `node prototype/netling2/sim/band-sweep.mjs charge 400` (or `sync`) and `STAT=charge node prototype/netling2/sim/stat-profile.mjs 150` | `BANDS` in `sim.js` (off by default); the finding is that a level band taxes check-in cadence for these two meters; results in `prototype/netling2/notes/egg-pressure-notes.md`, Result 8 |
| Egg page pace by placement | `node egg-pages.mjs` | needs only `tools/baseline/lineages.json`; compares home-region placement with any-region at 0.10 a run, and the hidden page's Deep rate |
| Actions per life | `BUGS='{"on":false}' node acts.mjs casual` | counts feeds, plays, cooling and so on over 100 lives |

**Which copy each driver needs.** Patched copy (the patch above): `gap`, `standing`, `bugs`, `temper`, `pref`, `acts`, `guard`, `hold`. Unpatched copy (`cp -r src tools package.json`): `lines`, `lines2`. No simulator: `egg-pages` (reads `tools/baseline/lineages.json`), `rogue` and `rogue2` (read the `lines` and `lines2` output).

Results are printed as one JSON line each. The sketch quotes them with their limits.

## Known limits

- The bots are 1.0's archetypes. They cycle mini-games in a fixed order and choose packets at random, so they cannot stand in for a player with habits. The preference-following bot sees temper directly, which a real player has to infer.
- Bugs from netrun-disconnect faults are not rolled, Heat from actions is not scaled by bugs, and clearing by Standing or by a netrun anomaly is not modeled (only the scrip route, at scheduled check-ins).
- Standing is 1.0's one signed number, so a netling with both tracks high looks balanced. Hidden-path "low on both" was replaced by "within 1 point" for that reason.
- Sample sizes are 150 to 300 lives per cell, so differences under about 3 points on a rate near 93% are noise. Bug rolls change the random stream, so scenarios do not share exact lives.
- `tools/balance.mjs` grants Root Access to the next netling after the codex completes; the game grants it at once. `lines2.mjs` with `MID=1` (plus the one-line hook in its row) models the game; `lines.mjs` and the first Rogue-gate tables in the sketch do not, and run egg 1 about a life long.
- The patch was built against 1.0 at the time of writing; if `src/sim.js` changes, re-apply by hand.
