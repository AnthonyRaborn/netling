// The gallery maker (make-gallery.mjs) patches the real gallery.html; if 1.0's gallery changes shape the patch must fail loudly,
// and the layers section must cover every form of the egg. Runs the maker (its output files are generated and gitignored).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import './ready.js'; // first: see ready.js
import { forms } from './models.js';
import { programForms } from './program-models.js';
import { wetwareForms } from './wetware-models.js';
import { MAX_BUGS } from './glitch.js';

const dir = fileURLToPath(new URL('.', import.meta.url));

test('the maker writes three galleries, each with the layers section wired in for its own egg', () => {
  execFileSync('node', [`${dir}make-gallery.mjs`], { stdio: 'pipe' });
  for (const egg of ['iron', 'program', 'wetware']) {
    const html = readFileSync(`${dir}gallery-${egg}.html`, 'utf8');
    assert.match(html, /import \{ layersSection \} from '\.\.\/\.\.\/prototype\/netling2\/gallery-layers\.js'/);
    assert.match(html, /'crests', 'colors', 'layers'\]/);
    assert.ok(html.includes(`}, "${egg}");`), `${egg}: wrong egg in the builder`);
    assert.ok(html.includes('22 forms'), `${egg}: heading`);
    assert.ok(html.includes("['1', '2', '3', '4', '5', '6', '8']") && !html.includes('Math.max(3, scale()'), `${egg}: the 1x and 2x scales`);
  }
});

test('the layers section has a row per form of the egg and the columns the review page offers (clean, neglect 1 and 2, bugs 1 to 5, two combinations)', async () => {
  // Counted from the source: 3 + MAX_BUGS + 2 still columns and 5 temper levels.
  const src = readFileSync(`${dir}gallery-layers.js`, 'utf8');
  assert.match(src, /LEVELS = \[\[-2,.*\[2, 'strongly steady'\]\]/);
  assert.equal(MAX_BUGS, 5);
  for (const set of [forms('B'), programForms(), wetwareForms()]) assert.equal(Object.keys(set).length, 22);
});
