// The Rogue counterpart of gallery-prelude.js: puts the hidden Rogue egg's ten forms in the game's tables so the real gallery shows
// them (and 1.0's Chrome and Bitling, its reference bodies) instead of the rest of 1.0's. Module scripts run in document order, so this
// finishes before accessories.js is first loaded.
import './ready.js'; // first: the wearable code must see the authored anchors (see ready.js)
import { SPECIES } from '../../src/sim.js';
import { rogueKey } from './register.js';
import { rogueForms } from './rogue-models.js';

// Chrome and Bitling stay: the gallery's wearables and colors sections use them as fixed reference bodies.
for (const key of Object.keys(SPECIES)) if (key !== 'chrome' && key !== 'bitling') delete SPECIES[key];
for (const [id, f] of Object.entries(rogueForms())) {
  SPECIES[rogueKey(id)] = f.stage === 'elder' ? { name: id, stage: 'mainframe', line: rogueKey(f.from) } : { name: id, stage: f.stage };
}
// The gallery's default form is Chrome, which is not here: start on the baby unless the link names a form.
const hash = new URLSearchParams(location.hash.slice(1));
if (!hash.has('form')) {
  hash.set('form', rogueKey('rogueBaby'));
  history.replaceState(null, '', `#${hash}`);
}
