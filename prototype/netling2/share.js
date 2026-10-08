// The 2.0 daily share line: 1.0's three lines (src/netrun/daily.js, shareText) with the harder-ICE count on the second line.
// "ICE 5/6 (2 hard)": the second number counts ICE fought at tier 2 (the fork's run.tally.iceHard). Omitted when it is 0, so a
// run with none, and every line from 1.0, reads as before. The first number and the 6 are 1.0's (passed out of ICE met).
// Decided format: docs/NETLING_2_NETRUN_DRAFTS.md, section 10, item 5. Not wired to a game: there is no 2.0 app yet.
import { shareText } from '../../src/netrun/daily.js';

export function shareText2(args) {
  const hard = args.tally?.iceHard ?? 0;
  const lines = shareText(args).split('\n');
  if (hard > 0) lines[1] = lines[1].replace(/(ICE \d+\/\d+)/, `$1 (${hard} hard)`);
  return lines.join('\n');
}
