// Chatter and Archive hints for the three bar states (Overclock for Heat, Overdrive for Charge, Overlink for Sync). A netling says
// one of these while it is in the state, from its own egg's lines only. Drafts for the maintainer to edit; not wired into any game.
// Shaped like src/chatter.js (id, group, text) plus the egg whose register the line is in. Base lines only: the temper shapes are
// applied by voice.js's chatterTone (a measuring aid) and the shipped voicings would be hand-written (see voice-samples.js).
// Rules the tests check: lowercase, no digits, no em dash, short, no state name and no number in a line, hints in 1.0's
// "listen to ..." style.
export const STATE_GROUPS = [
  { id: 'overclock', name: 'Overclock', hint: 'listen to it while it runs hot.' },
  { id: 'overdrive', name: 'Overdrive', hint: 'listen to it when it is full to the brim.' },
  { id: 'overlink', name: 'Overlink', hint: 'listen to it when it is closest to you.' },
];

export const STATE_CHATTER = [
  { id: 'oc-program-clock', group: 'overclock', egg: 'program', text: 'cycles are running ahead of schedule. fans at maximum. logged.' },
  { id: 'oc-program-tolerance', group: 'overclock', egg: 'program', text: 'heat is within tolerance, technically.' },
  { id: 'oc-iron-casing', group: 'overclock', egg: 'iron', text: 'casing is hot. fans at full. do not touch.' },
  { id: 'oc-iron-rating', group: 'overclock', egg: 'iron', text: 'running past rating. noted. holding.' },
  { id: 'oc-wetware-hot', group: 'overclock', egg: 'wetware', text: 'i feel hot all over. it is fine. it is good.' },
  { id: 'oc-wetware-pulse', group: 'overclock', egg: 'wetware', text: 'my pulse is up. go on, play.' },

  { id: 'od-program-buffers', group: 'overdrive', egg: 'program', text: 'buffers full. queues draining fast. no backlog.' },
  { id: 'od-program-supply', group: 'overdrive', egg: 'program', text: 'overdrawing the supply. will correct later.' },
  { id: 'od-iron-mains', group: 'overdrive', egg: 'iron', text: 'mains steady. every relay sings. running over spec.' },
  { id: 'od-iron-above', group: 'overdrive', egg: 'iron', text: 'power above rating. holding.' },
  { id: 'od-wetware-stuffed', group: 'overdrive', egg: 'wetware', text: 'i am stuffed. i could run for days.' },
  { id: 'od-wetware-tank', group: 'overdrive', egg: 'wetware', text: 'full belly, full tank. watch me go.' },

  { id: 'ol-program-link', group: 'overlink', egg: 'program', text: 'link at saturation. your input arrives early.' },
  { id: 'ol-program-latency', group: 'overlink', egg: 'program', text: 'latency near zero. do not look away.' },
  { id: 'ol-iron-locked', group: 'overlink', egg: 'iron', text: 'locked tight. every move lands. do not slip.' },
  { id: 'ol-iron-hand', group: 'overlink', egg: 'iron', text: 'your hand, my gears. one motion.' },
  { id: 'ol-wetware-feel', group: 'overlink', egg: 'wetware', text: 'i can feel you from here. it is a lot.' },
  { id: 'ol-wetware-hum', group: 'overlink', egg: 'wetware', text: 'we are so close. i hum when you play.' },
];

// The lines a netling of this egg could say in this state.
export const stateLines = (egg, group) => STATE_CHATTER.filter((c) => c.egg === egg && c.group === group);
