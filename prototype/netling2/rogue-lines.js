// Rogue's chatter: one base line for its baby, teen and each adult (elders have none, as on every egg), two lines for each bar state, and
// the NL-0 eggs' one Rogue-facing Lineage line. Every line with its four temper voicings in the shapes voice.js tests (checkShape).
// DRAFTS for the maintainer to edit (docs/NETLING_2_ROGUE_DRAFTS.md, 10.9); not wired into any game, not read on a device or by a player.
// Rogue's shape follows its tell, the glance over its shoulder: steady lines stop to check, "(clear)" every fifth word (every third
// strongly), as the steady voicings of the other eggs only add their separators; unsteady lines break off to look behind, "(behind?)",
// once and pick up again, strongly twice without finishing. Rogue's register (10.1): a fugitive's tradecraft, terse, first person in
// chatter as on every egg, the hunters "they" and never named. level keys: 2, 1, -1, -2 (strongly steady to strongly unsteady).
export const ROGUE_BODY_LINES = [
  { form: 'rogueBaby', base: 'nobody sent for me. i came anyway.', voices: {
    2: 'nobody sent for (clear) me. i came (clear) anyway.',
    1: 'nobody sent for me. i (clear) came anyway.',
    '-1': 'nobody sent for me. (behind?) i came anyway.', '-2': 'nobody sent (behind?) for me. (behind?)' } },
  { form: 'rogueTeen', base: 'new name today. it fits better than the last.', voices: {
    2: 'new name today. (clear) it fits better (clear) than the last.',
    1: 'new name today. it fits (clear) better than the last.',
    '-1': 'new name today. (behind?) it fits better than the last.', '-2': 'new name (behind?) today. it fits (behind?)' } },
  { form: 'rogueAdultBreach', base: 'i sat at their desk all day. nobody looked up.', voices: {
    2: 'i sat at (clear) their desk all (clear) day. nobody looked (clear) up.',
    1: 'i sat at their desk (clear) all day. nobody looked up.',
    '-1': 'i sat at their desk all day. (behind?) nobody looked up.', '-2': 'i sat at their desk (behind?) all day. (behind?)' } },
  { form: 'rogueAdultDodge', base: 'i was gone before they finished the sentence.', voices: {
    2: 'i was gone (clear) before they finished (clear) the sentence.',
    1: 'i was gone before they (clear) finished the sentence.',
    '-1': 'i was gone (behind?) before they finished the sentence.', '-2': 'i was gone (behind?) before they (behind?)' } },
  { form: 'rogueAdultTune', base: 'they talk on an open channel. i just listen.', voices: {
    2: 'they talk on (clear) an open channel. (clear) i just listen.',
    1: 'they talk on an open (clear) channel. i just listen.',
    '-1': 'they talk on an open channel. (behind?) i just listen.', '-2': 'they talk (behind?) on an open channel. (behind?)' } },
  { form: 'rogueAdultFeast', base: 'i left something for you. same place as before.', voices: {
    2: 'i left something (clear) for you. same (clear) place as before.',
    1: 'i left something for you. (clear) same place as before.',
    '-1': 'i left something for you. (behind?) same place as before.', '-2': 'i left something (behind?) for you. same (behind?)' } },
];

// State chatter (the groups and hints are state-lines.js's; ids in its pattern, oc- od- ol- then the egg).
export const ROGUE_STATE_CHATTER = [
  { id: 'oc-rogue-scans', group: 'overclock', egg: 'rogue', text: 'running hot. heat shows up on their scans.', voices: {
    2: 'running hot. heat (clear) shows up on (clear) their scans.',
    1: 'running hot. heat shows up (clear) on their scans.',
    '-1': 'running hot. (behind?) heat shows up on their scans.', '-2': 'running hot. (behind?) heat shows up (behind?)' } },
  { id: 'oc-rogue-worth', group: 'overclock', egg: 'rogue', text: 'too warm to hide well. worth it, for now.', voices: {
    2: 'too warm to (clear) hide well. worth (clear) it, for now.',
    1: 'too warm to hide well. (clear) worth it, for now.',
    '-1': 'too warm to hide well. (behind?) worth it, for now.', '-2': 'too warm (behind?) to hide well. (behind?)' } },
  { id: 'od-rogue-days', group: 'overdrive', egg: 'rogue', text: 'full up. i could run for days if i had to.', voices: {
    2: 'full up. i (clear) could run for (clear) days if i (clear) had to.',
    1: 'full up. i could run (clear) for days if i had (clear) to.',
    '-1': 'full up. (behind?) i could run for days if i had to.', '-2': 'full up. i could run (behind?) for days (behind?)' } },
  { id: 'od-rogue-packed', group: 'overdrive', egg: 'rogue', text: 'packed and ready. say the word and we go.', voices: {
    2: 'packed and ready. (clear) say the word (clear) and we go.',
    1: 'packed and ready. say the (clear) word and we go.',
    '-1': 'packed and ready. (behind?) say the word and we go.', '-2': 'packed and (behind?) ready. say the word (behind?)' } },
  { id: 'ol-rogue-only', group: 'overlink', egg: 'rogue', text: 'you are the only one i talk to. keep it that way.', voices: {
    2: 'you are the (clear) only one i (clear) talk to. keep (clear) it that way.',
    1: 'you are the only one (clear) i talk to. keep it (clear) that way.',
    '-1': 'you are the only one i talk to. (behind?) keep it that way.', '-2': 'you are the only one (behind?) i talk to. (behind?)' } },
  // Its unsteady voicings look back right after "when you play,": it says it forgets to look, and looks anyway.
  { id: 'ol-rogue-behind', group: 'overlink', egg: 'rogue', text: 'when you play, i forget to look behind me.', voices: {
    2: 'when you play, (clear) i forget to (clear) look behind me.',
    1: 'when you play, i forget (clear) to look behind me.',
    '-1': 'when you play, (behind?) i forget to look behind me.', '-2': 'when you play, (behind?) i forget to (behind?)' } },
];

// The Lineage chatter line the NL-0 eggs say after the ending (codex drafts, Rogue: background touches; decided 2026-10-12), with the four
// hand-written voicings each egg needs before it ships. NL-0 netlings only, so it is in the three launch eggs' shapes, not Rogue's.
export const LINEAGE_ROGUE_LINE = {
  id: 'lin-almost-like-me',
  base: 'something out there runs almost like me. it is running from someone.',
  voices: {
    program: {
      2: 'something out / there runs / almost like / me. it / is running / from someone.',
      1: 'something out there runs / almost like me. it / is running from someone.',
      '-1': 'something out there runs almost -', '-2': 'something out - something out -' },
    iron: {
      2: '1: something out there. ok 2: runs almost like me. ok 3: running from someone. ok',
      1: '1: something out there. 2: runs almost like me. 3: running from someone. ok.',
      '-1': 'UNKNOWN UNIT RUNNING!', '-2': 'FAULT: UNKNOWN UNIT!' },
    wetware: {
      2: 'something out ... there runs ... almost like ... me. it ... is running ... from someone.',
      1: 'something out there ... runs almost like ... me. it is ... running from someone.',
      '-1': '-- there runs almost like me. it is running from someone.', '-2': '-- running from someone. -- something out' },
  },
};
