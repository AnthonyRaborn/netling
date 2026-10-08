// The Wetware counterpart of gallery-prelude.js: puts Wetware's forms (so far the baby) in the game's tables so the real gallery shows
// them (and 1.0's Chrome and Bitling, its reference bodies) instead of the rest of 1.0's. Module scripts run in document order, so this
// finishes before accessories.js is first loaded.
import './ready.js'; // first: the wearable code must see the authored anchors (see ready.js)
import { SPECIES } from '../../src/sim.js';
import { wetwareKey } from './register.js';
import { wetwareForms } from './wetware-models.js';

// Chrome and Bitling stay: the gallery's wearables and colors sections use them as fixed reference bodies.
for (const key of Object.keys(SPECIES)) if (key !== 'chrome' && key !== 'bitling') delete SPECIES[key];
for (const [id, f] of Object.entries(wetwareForms())) {
  SPECIES[wetwareKey(id)] = f.stage === 'elder' ? { name: id, stage: 'mainframe', line: wetwareKey(f.from) } : { name: id, stage: f.stage };
}
// The gallery's default form is Chrome, which is not here: start on the baby unless the link names a form.
const hash = new URLSearchParams(location.hash.slice(1));
if (!hash.has('form')) {
  hash.set('form', wetwareKey('wetwareBaby'));
  history.replaceState(null, '', `#${hash}`);
}
