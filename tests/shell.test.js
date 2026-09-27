import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, normalize, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Every module main.js loads, found by following static imports.
function moduleGraph(entry) {
  const seen = new Set();
  const visit = (file) => {
    if (seen.has(file)) return;
    seen.add(file);
    const src = readFileSync(join(root, file), 'utf8');
    for (const [, spec] of src.matchAll(/^\s*(?:import|export)\b[^;]*?\bfrom\s+'(\.{1,2}\/[^']+)'/gms)) {
      visit(relative(root, normalize(join(root, dirname(file), spec))));
    }
  };
  visit(entry);
  return seen;
}

test('the service worker caches every module, so the app boots offline', () => {
  const sw = readFileSync(join(root, 'sw.js'), 'utf8');
  const shell = new Set([...sw.match(/const SHELL = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]));
  const missing = [...moduleGraph('src/main.js')].filter((f) => !shell.has(f));
  assert.deepEqual(missing, []);
});
