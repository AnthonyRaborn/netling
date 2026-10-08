// Writes prototype/netling2/gallery-iron.html, gallery-program.html and gallery-wetware.html: the unchanged gallery.html with its paths pointed
// back at the repository root and an egg prelude added, so the real gallery (every wearable, state, palette, tint, scene and matrix)
// runs on that egg's forms.
// Each also gets a "layers" section (gallery-layers.js): the prototype's neglect, bugs and temper tell on every form of the egg.
// Run `npm run proto:gallery`, then `npm run serve` and open http://localhost:5174/prototype/netling2/gallery-iron.html or gallery-program.html
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const source = readFileSync(join(root, 'gallery.html'), 'utf8');
const EGGS = [
  { file: 'gallery-iron.html', egg: 'iron', prelude: 'gallery-prelude.js', name: 'Iron', heading: 'SPRITE GALLERY, IRON (22 forms, prototype; plus 1.0 Chrome and Bitling as reference bodies)' },
  { file: 'gallery-program.html', egg: 'program', prelude: 'gallery-prelude-program.js', name: 'Program', heading: 'SPRITE GALLERY, PROGRAM (22 forms, prototype; plus 1.0 Chrome and Bitling as reference bodies)' },
  { file: 'gallery-wetware.html', egg: 'wetware', prelude: 'gallery-prelude-wetware.js', name: 'Wetware', heading: 'SPRITE GALLERY, WETWARE (22 forms, prototype; plus 1.0 Chrome and Bitling as reference bodies)' },
];
for (const egg of EGGS) {
  const html = source
    .replaceAll("from './", "from '../../")
    .replaceAll("import('./", "import('../../")
    .replace('url(fonts/', 'url(../../fonts/')
    .replace('<title>Netling Sprites</title>', `<title>Netling Sprites (${egg.name})</title>`)
    .replace('<h1>SPRITE GALLERY</h1>', `<h1>${egg.heading}</h1>`)
    .replace('<script type="module">', `<script type="module" src="./${egg.prelude}"></script>\n    <script type="module">`);
  // The layers section: a new SECTIONS entry and its builder, using the gallery's own helpers (el, section, grid, palettes, tint,
  // scale, worn, P) and its live loop (addCell).
  const LAYERS_IMPORT = "      import { layersSection } from '../../prototype/netling2/gallery-layers.js';\n";
  const BUILDER = `      build.layers = () => layersSection({ el, section, grid, palettes, tint, scale, worn, P, addCell: (c) => cells.push(c) }, ${JSON.stringify(egg.egg)});\n\n      // --- page`;
  let patched = html;
  // 1x and 2x for the prototype galleries (1.0's lowest is 3x, and several sections clamp their sub-scales to 3): every form at its real
  // size, many to a screen. 1.0's own gallery.html is left alone.
  // The clinic (a 2.0 node kind, clinic-node.js) joins the netrun node markers: one more column, drawn by the prototype's own drawClinicNode.
  const CLINIC = [
    ["const types = ['entry', 'cache', 'ice', 'relay', 'checkpoint', 'market', 'exchange', 'anomaly', 'exit'];", "const types = ['entry', 'cache', 'ice', 'relay', 'checkpoint', 'market', 'exchange', 'clinic', 'anomaly', 'exit'];"],
    ['drawNode(ctx, type, 20, 20, REGIONS[region].palette, spent);', "type === 'clinic' ? drawClinicNode(ctx, 20, 20, spent) : drawNode(ctx, type, 20, 20, REGIONS[region].palette, spent);"],
    ['The nine map markers (a market draws as a black market or a corp exchange)', "The ten map markers (a market draws as a black market or a corp exchange; the clinic is the 2.0 prototype\\'s third kind, a plus, from prototype/netling2/clinic-node.js)"],
    ["      import { renderLCD,", "      import { drawClinicNode } from '../../prototype/netling2/clinic-node.js';\n      import { renderLCD,"],
  ];
  for (const [from, to] of CLINIC) {
    if (!patched.includes(from)) throw new Error(`gallery.html changed: could not find ${from}`);
    patched = patched.replace(from, () => to);
  }
  for (const need of ["['3', '4', '5', '6', '8']", 'Math.max(3, scale()']) if (!patched.includes(need)) throw new Error(`gallery.html changed: could not find ${need}`);
  patched = patched.replace("['3', '4', '5', '6', '8']", "['1', '2', '3', '4', '5', '6', '8']").replaceAll('Math.max(3, scale()', 'Math.max(1, scale()');
  for (const [from, to] of [
    ["      import { renderLCD,", LAYERS_IMPORT + "      import { renderLCD,"],
    ["'crests', 'colors'];", "'crests', 'colors', 'layers'];"],
    ["      // --- page", BUILDER],
  ]) {
    if (!patched.includes(from)) throw new Error(`gallery.html changed: could not find ${from}`);
    patched = patched.replace(from, () => to);
  }
  if (!html.includes(egg.prelude)) throw new Error('could not find the gallery script tag to insert the prelude before');
  writeFileSync(join(root, 'prototype', 'netling2', egg.file), patched);
  console.log(`wrote prototype/netling2/${egg.file} (generated, not committed)`);
}
