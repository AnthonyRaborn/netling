// Picks each recolorable wearable's default color for each palette (the "auto" colors) and writes src/wearable-colors.js.
// A default has to stand clear of the netling's palette, and no single color does on all six (white fails on `origin`, black
// against the room), so this measures: for each wearable slot and palette it tries the wearable's own signature color first
// and keeps it if it contrasts enough on every form, else takes the candidate that contrasts most.
//
//   node tools/wearable-colors.mjs           print the table and how each pick scores
//   node tools/wearable-colors.mjs --write   rewrite src/wearable-colors.js (do this after changing sprites, palettes or wearables)
//
// tests/accessories.test.js fails when the file is out of date, so a sprite change cannot quietly break the contrast.
import { writeFileSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { ACCESSORIES, anchorsFor } from '../src/accessories.js';
import { SPRITES, paletteColors, formSprite } from '../src/sprites.js';
import { PALETTES, SPECIES } from '../src/sim.js';
import { deltaE, blend, SWAP_COLORS } from '../src/colors.js';

export const ROOM = '#0b2226'; // the default screen tint; every tint is similarly dark
export const CLEAR = 40; // a default should stand at least this far (CIE76) from what it sits on or beside
const STRONG = 60; // and if any candidate stands this far, the nearest of those is preferred, so a pale grey never beats a bright color
const STEEL = ['#c8d0dc', '#8a93a3', '#3a3f49', '#2a2f3a']; // greys, for the wearables whose signature is metal
const AVOID = { visor: ['#ff9f1c', '#f9f002'] }; // an orange or gold band reads as a Star Trek visor, not a futuristic one
const PIN = {}; // hand-picked exceptions: { wearableId: { slot: { paletteName: '#rrggbb' } } }

const forms = Object.keys(SPECIES);
const spritePairs = forms.flatMap((f) => [formSprite(f, 'a'), formSprite(f, 'b')].map((sprite) => ({ f, sprite })));

// How far a candidate color for one slot of a wearable stands from its surroundings, worst form first: the 25th percentile
// over the slot's pixels of the distance to what is under it or beside it (the room, when nothing is).
export function slotClearance(acc, slot, color, pal, others) {
  const marks = paletteColors(pal);
  const worst = [];
  for (const { sprite } of spritePairs) {
    const body = new Map();
    sprite.forEach((row, y) => [...row].forEach((ch, x) => ch !== '.' && body.set(`${x},${y}`, marks[ch] ?? pal.main)));
    for (const frame of [0, 1]) {
      const pts = [];
      const sentinels = acc.colors.map((_, i) => `slot${i}`);
      acc.draw((x, y, c) => pts.push({ x, y, c }), anchorsFor(sprite), frame, 1000, sentinels);
      const mine = pts.filter((p) => p.c === `slot${slot}`);
      if (!mine.length) continue;
      const scores = mine.map((p) => {
        const under = body.get(`${p.x},${p.y}`);
        const refs = [];
        if (under) refs.push(under);
        else refs.push(ROOM);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const near = body.get(`${p.x + dx},${p.y + dy}`);
          if (near && !under) refs.push(near);
        }
        // Other slots of the same wearable stand out from this one too, where they touch.
        return Math.min(...refs.map((r) => deltaE(color, r)));
      });
      scores.sort((a, b) => a - b);
      worst.push(scores[Math.floor((scores.length - 1) * 0.25)]);
    }
  }
  let score = Math.min(...worst);
  for (const [other, oc] of others) if (deltaE(color, oc) < 20 && deltaE(acc.colors[slot][1], acc.colors[other][1]) >= 20) score = Math.min(score, 0);
  return score;
}

export function computeAutoColors() {
  const out = {};
  const detail = [];
  for (const acc of ACCESSORIES.filter((a) => a.colors)) {
    out[acc.id] = acc.colors.map(() => ({}));
    for (const pal of PALETTES) {
      const chosen = [];
      acc.colors.forEach(([label, def], slot) => {
        const pinned = PIN[acc.id]?.[slot]?.[pal.name];
        const others = chosen.map((c, i) => [i, c]);
        const candidates = [def, ...[...SWAP_COLORS, ...STEEL].filter((c) => c !== def)].filter((c) => !(AVOID[acc.id] ?? []).includes(c));
        const scored = candidates.map((c) => ({ c, score: slotClearance(acc, slot, c, pal, others) }));
        // The signature color if it stands clear; else the candidate that stands clearly clear (STRONG, else CLEAR) nearest to it in color; else the clearest.
        const strong = scored.filter((s) => s.score >= STRONG);
        const passing = strong.length ? strong : scored.filter((s) => s.score >= CLEAR);
        const nearest = passing.length ? passing.reduce((b, s) => (deltaE(s.c, def) < deltaE(b.c, def) ? s : b)) : scored.reduce((b, s) => (s.score > b.score ? s : b), scored[0]);
        // A slot whose signature is just a darker shade of the slot before it (the rebreather's filter) stays a shade of it.
        const shade = slot > 0 && deltaE(def, acc.colors[slot - 1][1]) < 20 ? blend(chosen[slot - 1], 0.65, '#000000') : null;
        const pick = pinned ? { c: pinned, score: slotClearance(acc, slot, pinned, pal, others) } : shade ? { c: shade, score: slotClearance(acc, slot, shade, pal, others) } : nearest;
        chosen.push(pick.c);
        out[acc.id][slot][pal.name] = pick.c;
        detail.push({ id: acc.id, slot: label, palette: pal.name, def, pick: pick.c, score: Number(pick.score.toFixed(1)), defScore: Number(scored[0].score.toFixed(1)) });
      });
    }
  }
  return { out, detail };
}

export function renderModule(table) {
  const lines = ['// Generated by tools/wearable-colors.mjs: do not edit by hand. Regenerate after changing sprites, palettes or wearables.',
    '// The default ("auto") color of each slot of each recolorable wearable, per palette name. A player\'s own pick overrides it.',
    'export const AUTO_COLORS = {'];
  for (const [id, slots] of Object.entries(table)) {
    lines.push(`  ${id}: [`);
    for (const slot of slots) lines.push(`    { ${Object.entries(slot).map(([p, c]) => `${p}: '${c}'`).join(', ')} },`);
    lines.push('  ],');
  }
  lines.push('};', '');
  return lines.join('\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { out, detail } = computeAutoColors();
  for (const d of detail) console.log(`${d.id.padEnd(11)} ${d.slot.padEnd(8)} ${d.palette.padEnd(7)} default ${d.def} (${String(d.defScore).padStart(5)}) -> ${d.pick} (${String(d.score).padStart(5)})${d.pick === d.def ? '' : '  changed'}`);
  if (process.argv.includes('--write')) {
    writeFileSync(fileURLToPath(new URL('../src/wearable-colors.js', import.meta.url)), renderModule(out));
    console.log('wrote src/wearable-colors.js');
  }
}
