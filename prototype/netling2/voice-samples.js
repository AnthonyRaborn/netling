// Hand-written voicings of sample base lines, to show the shapes in voice.js on real sentences and to give authors a pattern. Not
// content for the game: the base lines are invented for this prototype (1.0's body-bound lines are rewritten per egg in 2.0).
// Authoring notes that fell out of writing these:
//   program   write the base line so it breaks into beats of four words (two when strongly steady); the steady voicing only adds " / ".
//   iron      write the base line as three clauses of about equal length; the fault bell (unsteady) is a rewrite that names ONE failing
//             thing in capitals, not a truncation of the line.
//   wetware   write the base line in clauses that end where a pause can fall (every third word, every second when strongly steady).
// level keys: 2 strongly steady, 1 steady, -1 unsteady, -2 strongly unsteady.
export const SAMPLES = [
  { egg: 'program', id: 'tasks', base: 'all tasks finished. none were skipped.', voices: {
    2: 'all tasks / finished. none / were skipped.', 1: 'all tasks finished. none / were skipped.',
    '-1': 'all tasks finished -', '-2': 'all tasks - all tasks -' } },
  { egg: 'program', id: 'queue', base: 'queue empty. nothing waits. nothing is late.', voices: {
    2: 'queue empty. / nothing waits. / nothing is / late.', 1: 'queue empty. nothing waits. / nothing is late.',
    '-1': 'queue empty. nothing -', '-2': 'queue empty - queue empty -' } },
  { egg: 'iron', id: 'checks', base: 'wall checked. cable checked. fan checked.', voices: {
    2: '1: wall checked. ok 2: cable checked. ok 3: fan checked. ok', 1: '1: wall checked. 2: cable checked. 3: fan checked. ok.',
    '-1': 'CABLE!', '-2': 'FAULT: CABLE LOOSE!' } },
  { egg: 'iron', id: 'warm', base: 'north wall warm. south wall warm. all calm.', voices: {
    2: '1: north wall warm. ok 2: south wall warm. ok 3: all calm. ok', 1: '1: north wall warm. 2: south wall warm. 3: all calm. ok.',
    '-1': 'SOUTH WALL HOT!', '-2': 'FAULT: SOUTH WALL!' } },
  { egg: 'wetware', id: 'slept', base: 'slept well. the culture is warm. nobody called.', voices: {
    2: 'slept well. ... the culture ... is warm. ... nobody called.', 1: 'slept well. the ... culture is warm. ... nobody called.',
    '-1': '-- the culture is warm. nobody called.', '-2': '-- warm. nobody called. -- slept well.' } },
  { egg: 'wetware', id: 'broth', base: 'broth is hot. you came back. good.', voices: {
    2: 'broth is ... hot. you ... came back. ... good.', 1: 'broth is hot. ... you came back. ... good.',
    '-1': '-- hot. you came back. good.', '-2': '-- you came back. good. -- broth is.' } },
];
