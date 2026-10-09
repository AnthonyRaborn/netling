# The strain trigger for the break (BRAKE.strainBreak), 2026-10-09

The owner's state also breaks when the owner's strain (Iron wear, Program overfeed strain, Wetware overplay strain) reaches the line while the state is active. Design and the reading of these results: `docs/NETLING_2_EGG_PRESSURES.md`, "The strain trigger".

Files: `<egg>-<bot>-<line>.jsonl`, line `off` (Integrity only) or 60, 70, 80, 90. Each is one run of `sim/overuse-sweep.mjs` at 200 lives, all 37 archetypes, decided settings with `OVERUSE='{"on":true}'`; the last line is the mean. Bots: `default`, `over1` (`FEEDBOT=over1`), `feedgreedy` (`FEEDBOT=greedy`), `syncgreedy` (`SYNCBOT=greedy`). Fields added for this sweep: `strainBreaks` (breaks the strain trigger fired with Integrity still at 40 or over), `ownBreaks` (breaks of the owner's state).

Command for one cell (here Iron, line 80):

    node prototype/netling2/sim/overuse-sweep.mjs iron 200 all '{"on":true}' '{"BRAKE":"{\"on\":true,\"strainBreak\":80}"}'

Add `,"FEEDBOT":"greedy"` (or another bot) inside the last JSON for the bot cells.

Confirmation (`confirm/`): the same cells at 1000 lives for line 80 (now `BRAKE.strainBreak`'s default) and off (pass `"strainBreak":null` in the BRAKE json, since the default is no longer off).
