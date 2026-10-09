// Temper voicings for the state chatter lines (state-lines.js), keyed by line id: the four levels in the shapes voice.js tests (checkShape).
// DRAFTS for the maintainer to edit; not wired into any game. Like body-lines.js: the Program and Wetware steady voicings only add the
// separators to the base line; Iron's steady voicings number three clauses, and where a base line has fewer than three even clauses
// (running past rating, power above rating, your hand) the items are a light rewording of it. The unsteady voicings are rewrites: Program
// clips, Iron names one failing thing in capitals, Wetware starts mid thought. level keys: 2, 1, -1, -2.
export const STATE_VOICES = {
  'oc-program-clock': {
    2: 'cycles are / running ahead / of schedule. / fans at / maximum. logged.',
    1: 'cycles are running ahead / of schedule. fans at / maximum. logged.',
    '-1': 'cycles are running ahead -', '-2': 'cycles are - cycles are -' },
  'oc-program-tolerance': {
    2: 'heat is / within tolerance, / technically.',
    1: 'heat is within tolerance, / technically.',
    '-1': 'heat is within -', '-2': 'heat is - heat is -' },
  'oc-iron-casing': {
    2: '1: casing is hot. ok 2: fans at full. ok 3: do not touch. ok',
    1: '1: casing is hot. 2: fans at full. 3: do not touch. ok.',
    '-1': 'CASING HOT!', '-2': 'FAULT: CASING HOT!' },
  'oc-iron-rating': {
    2: '1: past rating. ok 2: noted, logged. ok 3: holding steady. ok',
    1: '1: past rating. 2: noted, logged. 3: holding steady. ok.',
    '-1': 'PAST RATING!', '-2': 'FAULT: OVER RATING!' },
  'oc-wetware-hot': {
    2: 'i feel ... hot all ... over. it ... is fine. ... it is ... good.',
    1: 'i feel hot ... all over. it ... is fine. it ... is good.',
    '-1': '-- all over. it is fine. it is good.', '-2': '-- it is good. -- i feel' },
  'oc-wetware-pulse': {
    2: 'my pulse ... is up. ... go on, ... play.',
    1: 'my pulse is ... up. go on, ... play.',
    '-1': '-- is up. go on, play.', '-2': '-- go on, play. -- my pulse' },
  'od-program-buffers': {
    2: 'buffers full. / queues draining / fast. no / backlog.',
    1: 'buffers full. queues draining / fast. no backlog.',
    '-1': 'buffers full. queues -', '-2': 'buffers full - buffers full -' },
  'od-program-supply': {
    2: 'overdrawing the / supply. will / correct later.',
    1: 'overdrawing the supply. will / correct later.',
    '-1': 'overdrawing the supply -', '-2': 'overdrawing - overdrawing -' },
  'od-iron-mains': {
    2: '1: mains steady. ok 2: every relay sings. ok 3: running over spec. ok',
    1: '1: mains steady. 2: every relay sings. 3: running over spec. ok.',
    '-1': 'OVER SPEC!', '-2': 'FAULT: MAINS SURGE!' },
  'od-iron-above': {
    2: '1: power above rating. ok 2: relays holding. ok 3: load steady. ok',
    1: '1: power above rating. 2: relays holding. 3: load steady. ok.',
    '-1': 'POWER HIGH!', '-2': 'FAULT: POWER HIGH!' },
  'od-wetware-stuffed': {
    2: 'i am ... stuffed. i ... could run ... for days.',
    1: 'i am stuffed. ... i could run ... for days.',
    '-1': '-- stuffed. i could run for days.', '-2': '-- for days. -- i am' },
  'od-wetware-tank': {
    2: 'full belly, ... full tank. ... watch me ... go.',
    1: 'full belly, full ... tank. watch me ... go.',
    '-1': '-- full tank. watch me go.', '-2': '-- watch me go. -- full belly' },
  'ol-program-link': {
    2: 'link at / saturation. your / input arrives / early.',
    1: 'link at saturation. your / input arrives early.',
    '-1': 'link at saturation -', '-2': 'link at - link at -' },
  'ol-program-latency': {
    2: 'latency near / zero. do / not look / away.',
    1: 'latency near zero. do / not look away.',
    '-1': 'latency near zero -', '-2': 'latency - latency -' },
  'ol-iron-locked': {
    2: '1: locked tight. ok 2: every move lands. ok 3: do not slip. ok',
    1: '1: locked tight. 2: every move lands. 3: do not slip. ok.',
    '-1': 'SLIPPING!', '-2': 'FAULT: LOCK SLIPPING!' },
  'ol-iron-hand': {
    2: '1: your hand. ok 2: my gears. ok 3: one motion. ok',
    1: '1: your hand. 2: my gears. 3: one motion. ok.',
    '-1': 'GEARS!', '-2': 'FAULT: GEARS!' },
  'ol-wetware-feel': {
    2: 'i can ... feel you ... from here. ... it is ... a lot.',
    1: 'i can feel ... you from here. ... it is a ... lot.',
    '-1': '-- from here. it is a lot.', '-2': '-- a lot. -- i can' },
  'ol-wetware-hum': {
    2: 'we are ... so close. ... i hum ... when you ... play.',
    1: 'we are so ... close. i hum ... when you play.',
    '-1': '-- close. i hum when you play.', '-2': '-- when you play. -- we are' },
};
