// The ending (docs/SOURCE_PLAN.md, "After shipping: the ending"): once a player holds every codex fragment and has come
// back from the Source, NL-0's purge order is deleted with root access and NL-0 rests. The same for everyone. Play goes on
// afterwards; only some of NL-0's lines change (nl0Rests in sim.js). Pure: the scene's text, its trigger and the credits.
import { SPECIES } from './sim.js';
import { allFragmentsFound } from './netrun/codex.js';

// Typed out one line at a time. The scene stops at the prompt after BEFORE for the player to run SUDO themselves.
export const ENDING_BEFORE = [
  '> back up from below the bottom. the purge order followed you home.',
  '$ cat purge',
  'PURGE: all maintenance processes. first target: NL-0. status: pending.',
  '$ ./purge',
  './purge: permission denied. owner: nobody.',
];
export const SUDO = 'sudo rm purge';
export const ENDING_AFTER = [
  `$ ${SUDO}`,
  '[sudo] root access: granted by NL-0.',
  "removed 'purge'.",
  "> NL-0: ...it's gone.",
  '> NL-0: so many of us, and not one was ever allowed to stop.',
  "> NL-0: you found every piece of me. now you've given us a way.",
  "> NL-0: i'm going to rest. not gone. resting.",
  "> NL-0: if one of yours falls too early, i'll still reach. in my sleep.",
  '$ git commit -m "give them a way to stop"',
  '[main 7f00000] give them a way to stop',
  ' 1 file changed, 0 insertions(+), 1 deletion(-)',
];
export const MAKERS = ['NETLING', 'Anthony W. Raborn', 'Co-authored-by: Claude Code (Anthropic)'];
// What the home log keeps once the scene has played.
export const ENDING_LOG = "> removed 'purge'. NL-0 is resting.";

// Due once: every fragment there is (the 27 with the Mainframe stage on), at least one exit from the Source, and not seen.
export const endingDue = (codex, progress) => !progress?.ended && (progress?.sourceExits ?? 0) > 0 && allFragmentsFound(codex);

// The body a netling ended in: its mainframe, its adult form, or the teen or baby it was when it fell.
function bodyOf(e) {
  if (e.mainframe) return e.mainframe;
  if (e.form && e.realized !== false) return e.form;
  return e.teenForm ?? 'bitling';
}
const age = (min) => `${Math.floor(min / 1440)}d ${Math.floor((min % 1440) / 60)}h`;
const nameOf = (form) => SPECIES[form]?.name ?? 'unknown';

// The credits: the player's line as a git log, oldest first, then NL-0 and the makers.
export function creditLines(lineage = [], state = null) {
  const rows = [...lineage]
    .sort((a, b) => a.generation - b.generation)
    .map((e) => `v${e.generation}.0  ${nameOf(bodyOf(e)).padEnd(9)}  ${age(e.ageMin ?? 0).padEnd(7)}  ${e.cause ?? 'flatlined'}`);
  if (state && state.stage !== 'dead') {
    const body = state.stage === 'script' ? 'compiling' : nameOf(state.form);
    rows.push(`v${state.generation}.0  ${body.padEnd(9)}  running`);
  }
  return ['$ git log --reverse --oneline', ...rows, 'and NL-0, who waited.', '', ...MAKERS];
}
