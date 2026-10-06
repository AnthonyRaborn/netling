// Runs the real 1.0 sprite audit (tools/sprite-audit.mjs) on Iron's forms instead of 1.0's. It registers the prototype sprites in
// the game's own tables, replaces SPECIES with Iron's forms (the elders as the 'mainframe' stage, which is the stage the game
// draws for a grown form), and then runs the audit unchanged. Same flags as the audit: `node prototype/netling2/audit.mjs
// --check=forms,combos --json`. Forms show as protoB_<id>. 1.0's own forms are not in this run.
import { SPRITES, ANCHOR_ROWS } from '../../src/sprites.js';
import { SPECIES } from '../../src/sim.js';
import { register, protoKey } from './register.js';
import { forms } from './models.js';

register(SPRITES, ANCHOR_ROWS); // before accessories.js loads (the audit imports it through render.js)
for (const key of Object.keys(SPECIES)) delete SPECIES[key];
for (const [id, f] of Object.entries(forms('B'))) {
  SPECIES[protoKey('B', id)] = f.stage === 'elder' ? { name: id, stage: 'mainframe', line: protoKey('B', f.from) } : { name: id, stage: f.stage };
}
await import('../../tools/sprite-audit.mjs');
