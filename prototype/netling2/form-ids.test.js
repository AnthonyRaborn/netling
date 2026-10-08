// Form ids (form-ids.js): eggLevelRoleLean, unique, every one named, and no old authoring key left in the pages that look forms up by id.
import './ready.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { FORM_NAMES, nameOf } from './form-ids.js';
import { forms } from './models.js';
import { programForms } from './program-models.js';
import { wetwareForms } from './wetware-models.js';

const dir = fileURLToPath(new URL('.', import.meta.url));
const ROLE = '(Breach|Dodge|Tune|Feast)(Corp|Street)';
const ID = new RegExp(`^(iron|program|wetware)(Baby|Teen(Corp|Street|Hidden)|(Adult|Elder)(${ROLE}|Hidden))$`);
const sets = { iron: forms('B'), program: programForms(), wetware: wetwareForms() };

test('66 ids in the eggLevelRoleLean shape, one per form, each with a name and the old authoring key', () => {
  const all = Object.entries(sets).flatMap(([egg, set]) => Object.values(set).map((f) => ({ egg, f })));
  assert.equal(all.length, 66);
  assert.equal(new Set(all.map(({ f }) => f.id)).size, 66);
  for (const { egg, f } of all) {
    assert.match(f.id, ID, f.id);
    assert.ok(f.id.startsWith(egg), f.id);
    assert.equal(f.name, nameOf(f.id));
    assert.ok(FORM_NAMES[f.id], `${f.id} has a display name`);
    assert.equal(typeof f.art, 'string');
  }
  assert.deepEqual(Object.keys(FORM_NAMES).sort(), all.map(({ f }) => f.id).sort(), 'the names table has exactly the forms');
});

test('the shape follows the stage, role and lean: no role on a baby or a teen, a hidden line spelled Hidden, an elder named for its adult', () => {
  for (const set of Object.values(sets)) {
    for (const f of Object.values(set)) {
      if (f.stage === 'baby') assert.match(f.id, /Baby$/);
      if (f.stage === 'teen') assert.match(f.id, new RegExp(`Teen${f.lean === 'hidden' ? 'Hidden' : f.lean === 'corp' ? 'Corp' : 'Street'}$`));
      if (f.stage === 'elder') assert.equal(f.id, f.from.replace('Adult', 'Elder'), 'an elder is its adult with Elder for Adult');
    }
  }
  assert.ok(sets.iron.ironAdultHidden && sets.iron.ironElderHidden && sets.program.programElderHidden && sets.wetware.wetwareElderHidden);
});

test('the review page and the gallery preludes use no old authoring key for a form', () => {
  const old = 'baby|teenCorp|teenStreet|teenHidden|gronk|guru|splat|jiff|bamf|ping|feep|munch|thrash|tiger|worm|mouse|spoof|parse|phreak|gobble|snarf|ghost|razor|solo|wired|chipped|mentat|gibson|nutri|leech|blank';
  const stale = new RegExp(`\\b(?:A|B|P|Wt|set|forms)\\.(?:${old})(?:Elder)?\\b|[(\\[,]\\s*['"](?:${old})(?:Elder)?['"]`);
  for (const file of ['index.html', 'gallery-prelude.js', 'gallery-prelude-program.js', 'gallery-prelude-wetware.js', 'ready.js']) {
    const text = readFileSync(`${dir}${file}`, 'utf8');
    const hit = text.split('\n').map((line, i) => ({ line, n: i + 1 })).find(({ line }) => stale.test(line) && !/stage|1\.0|Bitling|Kernel/.test(line));
    assert.equal(hit, undefined, `${file}:${hit?.n}: ${hit?.line.trim().slice(0, 90)}`);
  }
});
