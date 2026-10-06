// Writes prototype/netling2/gallery.html: the unchanged gallery.html with its paths pointed back at the repository root and the
// Iron prelude added, so the real gallery (every wearable, state, palette, tint, scene and matrix) runs on Iron's forms.
// Run `npm run proto:gallery`, then `npm run serve` and open http://localhost:5174/prototype/netling2/gallery.html
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
let html = readFileSync(join(root, 'gallery.html'), 'utf8');
html = html
  .replaceAll("from './", "from '../../")
  .replaceAll("import('./", "import('../../")
  .replace('url(fonts/', 'url(../../fonts/')
  .replace('<title>Netling Sprites</title>', '<title>Netling Sprites (Iron)</title>')
  .replace('<h1>SPRITE GALLERY</h1>', '<h1>SPRITE GALLERY, IRON (22 forms, prototype; plus 1.0 Chrome and Bitling as reference bodies)</h1>')
  .replace('<script type="module">', '<script type="module" src="./gallery-prelude.js"></script>\n    <script type="module">');
if (!html.includes('gallery-prelude.js')) throw new Error('could not find the gallery script tag to insert the prelude before');
writeFileSync(join(root, 'prototype', 'netling2', 'gallery.html'), html);
console.log('wrote prototype/netling2/gallery.html (generated, not committed)');
