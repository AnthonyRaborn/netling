// Writes prototype/netling2/gallery-iron.html, gallery-program.html and gallery-wetware.html: the unchanged gallery.html with its paths pointed
// back at the repository root and an egg prelude added, so the real gallery (every wearable, state, palette, tint, scene and matrix)
// runs on that egg's forms.
// Run `npm run proto:gallery`, then `npm run serve` and open http://localhost:5174/prototype/netling2/gallery-iron.html or gallery-program.html
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const source = readFileSync(join(root, 'gallery.html'), 'utf8');
const EGGS = [
  { file: 'gallery-iron.html', prelude: 'gallery-prelude.js', name: 'Iron', heading: 'SPRITE GALLERY, IRON (22 forms, prototype; plus 1.0 Chrome and Bitling as reference bodies)' },
  { file: 'gallery-program.html', prelude: 'gallery-prelude-program.js', name: 'Program', heading: 'SPRITE GALLERY, PROGRAM (22 forms, prototype; plus 1.0 Chrome and Bitling as reference bodies)' },
  { file: 'gallery-wetware.html', prelude: 'gallery-prelude-wetware.js', name: 'Wetware', heading: 'SPRITE GALLERY, WETWARE (baby only so far, prototype; plus 1.0 Chrome and Bitling as reference bodies)' },
];
for (const egg of EGGS) {
  const html = source
    .replaceAll("from './", "from '../../")
    .replaceAll("import('./", "import('../../")
    .replace('url(fonts/', 'url(../../fonts/')
    .replace('<title>Netling Sprites</title>', `<title>Netling Sprites (${egg.name})</title>`)
    .replace('<h1>SPRITE GALLERY</h1>', `<h1>${egg.heading}</h1>`)
    .replace('<script type="module">', `<script type="module" src="./${egg.prelude}"></script>\n    <script type="module">`);
  if (!html.includes(egg.prelude)) throw new Error('could not find the gallery script tag to insert the prelude before');
  writeFileSync(join(root, 'prototype', 'netling2', egg.file), html);
  console.log(`wrote prototype/netling2/${egg.file} (generated, not committed)`);
}
