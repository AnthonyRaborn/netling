// Runs the real 1.0 sprite audit (tools/sprite-audit.mjs) on Iron's forms instead of 1.0's. It registers the prototype sprites in
// the game's own tables, replaces SPECIES with Iron's forms (the elders as the 'mainframe' stage, which is the stage the game
// draws for a grown form), and then runs the audit unchanged. Same flags as the audit: `node prototype/netling2/audit.mjs
// --check=forms,combos --json`. Forms show as protoB_<id> (Iron) and protoP_<id> (Program) and protoW_<id> (Wetware). 1.0's own forms are not in this run.
// Which egg: the environment variable EGG, `iron` (the default, so the documented Iron numbers stay comparable), `program`, `wetware`, `all`
// (the three launch eggs) or `rogue` (the hidden egg's ten first drafts, protoR_<id>; on its own, so `all` keeps its documented numbers).
// Same-stage pairs are only read within the forms in the run, so `all` also compares one egg's forms with the other's.
import './ready.js'; // first: the wearable code must see the authored anchors (see ready.js)
import { SPECIES } from '../../src/sim.js';
import { protoKey, programKey, wetwareKey, rogueKey } from './register.js';
import { forms } from './models.js';
import { programForms } from './program-models.js';
import { wetwareForms } from './wetware-models.js';
import { rogueForms } from './rogue-models.js';

const egg = process.env.EGG ?? 'iron';
if (!['iron', 'program', 'wetware', 'all', 'rogue'].includes(egg)) throw new Error(`EGG must be iron, program, wetware, all or rogue, not ${egg}`);
const add = (key, f) => {
  SPECIES[key] = f.stage === 'elder' ? { name: f.id, stage: 'mainframe', line: key.replace(f.id, f.from) } : { name: f.id, stage: f.stage };
};
for (const key of Object.keys(SPECIES)) delete SPECIES[key];
if (egg === 'iron' || egg === 'all') for (const f of Object.values(forms('B'))) add(protoKey('B', f.id), f);
if (egg === 'program' || egg === 'all') for (const f of Object.values(programForms())) add(programKey(f.id), f);
if (egg === 'wetware' || egg === 'all') for (const f of Object.values(wetwareForms())) add(wetwareKey(f.id), f);
if (egg === 'rogue') for (const f of Object.values(rogueForms())) add(rogueKey(f.id), f);
await import('../../tools/sprite-audit.mjs');
