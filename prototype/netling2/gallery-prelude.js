// Runs before the gallery's own module (see make-gallery.mjs): puts Iron's 22 forms in the game's tables so the real gallery shows
// them (and 1.0's Chrome and Bitling, its reference bodies) instead of the rest of 1.0's. Module scripts run in document order, so this finishes before accessories.js is first loaded.
import { SPRITES, ANCHOR_ROWS } from '../../src/sprites.js';
import { SPECIES } from '../../src/sim.js';
import { register, protoKey } from './register.js';
import { forms } from './models.js';

register(SPRITES, ANCHOR_ROWS);
// Chrome and Bitling stay: the gallery's wearables and colors sections use them as fixed reference bodies.
for (const key of Object.keys(SPECIES)) if (key !== 'chrome' && key !== 'bitling') delete SPECIES[key];
for (const [id, f] of Object.entries(forms('B'))) {
  SPECIES[protoKey('B', id)] = f.stage === 'elder' ? { name: id, stage: 'mainframe', line: protoKey('B', f.from) } : { name: id, stage: f.stage };
}
// The gallery's default form is Chrome, which is not here: start on Gronk unless the link names a form.
const hash = new URLSearchParams(location.hash.slice(1));
if (!hash.has('form')) {
  hash.set('form', protoKey('B', 'gronk'));
  history.replaceState(null, '', `#${hash}`);
}
