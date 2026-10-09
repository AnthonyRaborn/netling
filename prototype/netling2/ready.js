// Import this FIRST in anything that draws wearables on the prototype forms (tests, the audit, the gallery prelude, the review
// page). src/accessories.js builds its table of authored anchor rows once, when it first loads, from SPRITES and ANCHOR_ROWS; and
// src/sim.js imports accessories.js. So if anything imports sim.js (directly or through needs.js) before the prototype forms are
// registered, the wearable code never sees them and silently guesses every anchor from pixels: on the hidden forms it picks the
// third eye as the eye row, and on Gronk the horn row as the head. Static imports run in order, so this module being first fixes it.
//
// It also checks the result and throws if the guess is what the wearable code is using, so a wrong import order cannot go unnoticed.
import { SPRITES, ANCHOR_ROWS } from '../../src/sprites.js';
import { register, protoKey, wetwareKey } from './register.js';
import { ANCHORS } from './art.js';

register(SPRITES, ANCHOR_ROWS);
const { anchorsFor } = await import('../../src/accessories.js');
const probe = anchorsFor(SPRITES[`${protoKey('B', 'ironAdultHidden')}A`]);
if (probe.eyeRow !== ANCHORS.guru.a.eyeRow) {
  throw new Error(`the wearable code is guessing the prototype anchors (Guru eye row ${probe.eyeRow}, authored ${ANCHORS.guru.a.eyeRow}): import prototype/netling2/ready.js before src/sim.js or src/accessories.js`);
}

// Chipped's right eye is a cyber lens in the highlight colour ('+'), and the wearable code counts only accent ('o') cells as eyes, so
// eyewear found one eye. anchorsFor caches and returns one object per sprite, so the lens columns are added to it here, once, for
// Chipped and its elder in every pose that shows the lens (the dead pose draws both eyes as accent X's already).
for (const id of ['wetwareAdultDodgeStreet', 'wetwareElderDodgeStreet']) {
  for (const pose of ['A', 'B', 'Sleep']) {
    const sprite = SPRITES[`${wetwareKey(id)}${pose}`];
    const a = anchorsFor(sprite);
    const lens = [a.eyeRow, a.eyeRow + 1].flatMap((y) => [...sprite[y]].map((c, x) => (c === '+' ? x : -1)).filter((x) => x >= 0));
    a.eyeCols = [...new Set([...a.eyeCols, ...lens])].sort((x, y) => x - y);
    a.eyeLeft = a.eyeCols[0];
    a.eyeRight = a.eyeCols[a.eyeCols.length - 1];
  }
}
