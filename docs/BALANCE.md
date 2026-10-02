# Balance

What the balance passes left in the game, and what is still open. Spoiler-heavy, like the rest of `docs/`. Rules and numbers are in [SIMULATION.md](SIMULATION.md) and [NETRUN.md](NETRUN.md); the targets, the current measurements and how to run the tools are in [TESTING.md](TESTING.md#balance-targets). The simulators are scripted players, not people: use their numbers to compare versions of the rules, not as a forecast.

## Design goals

- **Ghost is a secret, deliberate chase.** Nothing should make it reachable by accident.
- **Attentive players can steer every evolution**, teen and adult.
- **Attention earns extras; inattention costs faults, not a life.** See [ATTENTION.md](ATTENTION.md).
- **The codex takes at least 3 lives**, even for a player who runs as often as they can.
- **The Deep is a wall**, even for a player with every form ability, though not for a mainframe (careful mainframes disconnect 10 to 14% there; the floor is 8%).
- **The Source is somewhat harder than The Deep**, for the mainframes that may enter it: 22 to 30% disconnects in careful play, the five forms within about 6 points of each other.
- **The Mainframe stage is earned**: about half of deliberate players who reach it in a life, fewer casual ones, and only once the line has Root Access.
- **Items are scarce or have a use** beyond DISCARD.

## Current rules that came from the passes

**Life and stages.** A life is 5 days, with the teen at 17 hours and the adult at 51 (`CFG.teenAtMin`, `adultAtMin`). Each netling stores the life lengths it was compiled with in `s.life`; saves without it get the older 7 day values.

**Drain.** Base drain is 15.4 Charge and 13.2 Sync an hour, scaled by a curve (`drainCurve`, `empty` 0.39, `full` 2): about 31 an hour when full, 18 at half, 6 near empty. Keeping the bars topped up costs more actions, and a stat left low eases off, so a long gap costs faults rather than a life. Faults are sensitive to `empty`: each 0.01 moves casual faults by about 0.2.

**Forms.**
- Ghost needs 29 wins with at least 4 in each game (boosted wins count double).
- The Shell is a third teen form for netlings on Ghost's path: Ghost's axis rule, at most 1 fault, and every game won at least 3 times.
- Ties (axes within 0.5 of each other, or an axis within 0.5 of zero) are broken at random, weighting forms the player has never raised at 1.2.
- Segfault adds 2 faults (awake only, two presses). It drops from Public Net loot (weight 2), other regions' loot (1), mini-game win and HIDE tables (1), market stock (Public Net and Bazaar), and with a 10% chance after DEFEND, a contained overflow or a power surge.
- Stub is steerable but costs a starved teen stage (`steer-stub` takes about 3.4 faults).

**Mainframe.** A fifth stage on the last ordinary day (96 hours): three Deep exits this life, or two clean ones, and Root Access in the line. It adds a day and passes the trait on at level II or higher. The feat was chosen with a gate test before any game code (one Deep exit let every runner in), and needed the Chrome corp-relay fix to be fair to Chrome. Root Access stays on the original 22 fragments, so the stage first appears in a line's fourth life: in `tools/baseline/lineages.json` 2 to 30% of fourth lives become mainframes by play style (attentive 25%, casual 2%), and about a quarter of attentive fourth lives reach the Source's exit.

**Netruns.**
- Regions open in order: Public Net, Darknet Bazaar, Corp Grid, Old Web Ruins, The Deep, the Source. Only reaching the exit node clears a region; clears belong to each netling. Stage gates stay, The Deep also needs `ruins-4`, and the Source needs a mainframe and `deep-5`.
- The Source has 13 middle layers and ICE weight 11. Mainframe upgrades: Plat's relays repair 40 and its insurance pays twice; Airgap's first lost ICE fight each run deals 30%; Init sees three steps and repairs 8 a move; Panic phases the first two ICE; Whisper is missed by 50% of ICE.
- At most 8 codex fragments per life (`RUN_CFG.codexPerLife`).
- The Deep has 10 middle layers.
- ICE damage: Bazaar 40, Corp Grid 35, Ruins 48.
- Second abilities: Chrome's corp insurance (once a run, a blow that would disconnect it leaves it at 12 Integrity) and corp relays (every relay repairs it 20 Integrity, added after it was found to bank at relays far more than other forms), Daemon repairs 6 Integrity per move, Glitch phases each later ICE 35% of the time, Ghost goes unnoticed by 45% of ICE. Firewall is unchanged.
- Chrome's credentials only matter where there are checkpoints (Public Net and Corp Grid).

**Corpo scrip.** Each netling holds up to 100. Item prices are 15, 25 and 50 by rarity; selling pays half at a market and a quarter anywhere else. A market purchase costs scrip plus the old Charge price (12, or 10 in the Bazaar); accessories cost 25 or 50 scrip plus 20 Charge. Half the scrip (rounded down) passes to the next generation. A find that meets a full inventory is scrapped for a quarter of its price. Loose scrip: 3 at every exit and 3 in 30% of empty caches.

**Lineage.**
- Traits have a strength (`TRAIT_CFG`). Each generation in a row that ends as the same form adds a level (1.0, 1.25, 1.5). The grandparent's trait (its `history`) adds at half strength when it matches, under a per-trait cap (Licensed and Hardened 1.5; Persistent, Volatile and Untraceable 1.25).
- Untraceable means 60% fewer corp traces at strength 1, not immunity. Volatile costs 0.75 Integrity an hour at strength 1.
- The Archive's Lineage tab is a chain from the oldest generation to the running netling. Four legacy goals unlock crests (see [CONTENT_CATALOG.md](CONTENT_CATALOG.md#crests-5)).

## Facts worth knowing

- **Adult forms can be steered.** Each `steer-*` player reaches its form 94% or more of the time. Glitch is steered by keeping it overclocked (Heat 65 to 72) without reaching 85: 94% Glitch at about half a fault a life (it was one heat fault a life before overclocking).
- **Stability moves on choices, not the clock** (balance pass after the overclock change). Plain awake time adds nothing (it added 0.1/hr), a fault costs 1 stability (was 2), and a feed moves allegiance 0.75 (was 1). Attentive players spread out (Chrome 19%, Firewall 31%, Daemon 49%, from 16/29/55); casual and worker players stay close to before (casual 66% allegiance forms, worker 58%). Glitch steering reaches 99%. Ghost chasers keep it cool (the bot cools at 45) to hold stability at 0 or above: 95.6%.
- **Markets come in two kinds.** Black markets lean -0.5 a buy and corp exchanges +0.5, so shopping no longer drifts a neutral player indie: attentive players come out Chrome 27%, Firewall 25% (from 19/31). A player who avoids losses (always HIDE) still ends up Firewall: that lean comes from what COMPLY costs, not from markets. Markets now appear in every region but the Source, so players shop about 50% more (attentive: 11 items a life, from 7).
- **Running hot or cool is the stability choice.** Overclocked awake time leans it unstable (-0.2/hr) and flow leans it stable (+0.2/hr). Attentive players who keep it in the band (`daredevil`) end up Glitch 80% of the time (59% before); cool attentive players lean Daemon a little more (54%, from 49%). Casual and worker bots never choose to run hot, so their split barely moved: the choice is there for players who take it. Flow is also calm (events 0.75x): players who keep it in flow see about 0.7 fewer events a life, with no measurable shift in forms.
- **A caring player who takes risks becomes Firewall more often than Glitch** unless they also play hot: RAID and black-market buys lean indie faster than risks lean chaotic.
- **More play moves the axes.** Playing hot costs stability, so fewer attentive players drift into Daemon.
- **The bots' overclock skill is assumed.** They win a slowed (overclocked) game or ICE fight 8 points more often (`OVERCLOCK_WIN_BONUS` in `tools/netrun-bot.mjs`). Real players may gain more or less from the 15% slowdown; playtesting should check it.
- **Casual codex lines can take many lives.** Later fragments sit in regions casual players rarely reach (0.5% finish within 4 lives).

## Open questions

- **Passive stability gain**: lowering it was raised and never decided.
- **New evolution forms from lineage** (hybrid adults from trait plus leaning, ascended bloodline forms, heritage teens): parked. Any new form needs a permanent id, sprites, DEX entry and hints, a trait, a keepsake, a netrun ability, a check of every "all forms" condition (cosmetics, archive), `CONTENT_CATALOG.md` and `gallery.html`.
- **Mainframe pacing in real play.** The bots run more than people do, so real players will reach the stage less often than the measurements say, casual ones most of all. The feat counts (3, or 2 clean) and `deep-5`'s place are the levers; leave them until playtesting says otherwise. The history of the decisions is in [SOURCE_PLAN.md](SOURCE_PLAN.md).

## Working on balance

Change `CFG` and `RUN_CFG` numbers before adding rules (a number change needs no save work). Measure before and after with the tools' fixed seeds, at 1000 runs per archetype for anything that goes into a doc. Regenerate `tools/baseline/` in the same change and update the prose docs, since only the field manual is generated from `CFG`.
