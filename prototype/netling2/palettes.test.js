// The two new palettes (palettes.js): their contrast and distinctness bars, and that nothing worn blends into them or leaves the screen.
import './ready.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NEW_PALETTES, registerPalettes } from './palettes.js';
import { registerIdeas, WEARABLE_ENTRIES } from './accessory-ideas.js';
import { ACCESSORIES, placeWorn } from '../../src/accessories.js';
import { PALETTES } from '../../src/sim.js';
import { COSMETICS } from '../../src/cosmetics.js';
import { deltaE } from '../../src/colors.js';
import { composeLCD, LCD_W, LCD_H } from './render.js';
import { forms } from './models.js';
import { programForms } from './program-models.js';
import { wetwareForms } from './wetware-models.js';
import { rogueForms } from './rogue-models.js';

registerIdeas();
registerPalettes();
const SETS = { iron: forms('B'), program: programForms(), wetware: wetwareForms(), rogue: rogueForms() };
const ALL = Object.entries(SETS).flatMap(([egg, set]) => Object.values(set).map((form) => ({ egg, form })));
const lum = (c) => {
  const v = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test('the palettes are added before origin, which stays last, once', () => {
  registerPalettes();
  assert.deepEqual(PALETTES.map((p) => p.name), ['ice', 'neon', 'acid', 'toxic', 'ultra', 'ember', 'cobalt', 'mint', 'origin']);
  assert.equal(new Set(PALETTES.map((p) => p.name)).size, PALETTES.length);
});

test('each new palette meets the contrast and distinctness bars 1.0\'s six meet, against every tint', () => {
  const lcds = COSMETICS.tint.map((t) => t.lcd);
  for (const p of NEW_PALETTES) {
    for (const lcd of lcds) {
      assert.ok(ratio(p.main, lcd) >= 4.5, `${p.name} main on ${lcd}: ${ratio(p.main, lcd).toFixed(2)}`);
      assert.ok(ratio(p.accent, lcd) >= 4.4, `${p.name} accent on ${lcd}: ${ratio(p.accent, lcd).toFixed(2)}`);
    }
    assert.ok(ratio(p.main, p.accent) >= 2.1, `${p.name} eyes on the body: ${ratio(p.main, p.accent).toFixed(2)}`);
    assert.ok(ratio(p.mark ?? '#f5f5f5', p.main) >= 2, `${p.name} highlight marks on the body: ${ratio(p.mark ?? '#f5f5f5', p.main).toFixed(2)}`);
    for (const q of PALETTES.filter((x) => x.name !== p.name)) assert.ok(deltaE(p.main, q.main) >= 35, `${p.name} against ${q.name}: ${deltaE(p.main, q.main).toFixed(0)}`);
  }
});

test('nothing worn blends into a new palette, and every form composes inside the screen on it', () => {
  const entries = [...ACCESSORIES.filter((a) => !a.id.includes('.') && a.slot !== 'prop'), ...WEARABLE_ENTRIES.filter((e) => e.slot !== 'prop')];
  const wearables = [...new Map(entries.map((e) => [e.id, e])).values()];
  for (const { egg, form } of ALL) {
    for (const sprite of [form.a, form.b]) {
      const touches = (x, y) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => (sprite[y + dy]?.[x + dx] ?? '.') !== '.');
      for (const pal of PALETTES.filter((p) => NEW_PALETTES.some((n) => n.name === p.name))) {
        for (const e of wearables) {
          for (const p of placeWorn([{ id: e.id }], sprite, { time: 800, pal })[0].pts) {
            if (touches(p.x, p.y)) assert.ok(deltaE(p.color, pal.main) >= 30, `${form.id} ${pal.name} ${e.id} at ${p.x},${p.y}: ${p.color}`);
          }
        }
      }
    }
    for (const palette of [5, 6, 7]) {
      const { box } = composeLCD({ form, egg, palette, idle: 'none', worn: [{ id: 'crown' }] }, 1000);
      assert.ok(box.x >= 0 && box.x + box.w <= LCD_W && box.y >= 0 && box.y + box.h <= LCD_H, `${form.id} on palette ${palette}`);
    }
  }
});

test('palette-colors.js is up to date: regenerate with node prototype/netling2/palette-colors.mjs --write after changing a palette, a sprite or a recolorable wearable', async () => {
  const { computeNewColors, render } = await import('./palette-colors.mjs');
  const { readFileSync } = await import('node:fs');
  assert.equal(readFileSync(new URL('./palette-colors.js', import.meta.url), 'utf8'), render(computeNewColors()));
});
