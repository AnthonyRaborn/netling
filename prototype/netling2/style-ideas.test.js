// The shells, tints, screen effects and device labels (style-ideas.js, style-ideas.css, ghosting.js; docs/archive/netling2/ACCESSORY_IDEAS.md):
// every one in the doc is built, the HUD text reads on every shell, nothing moves faster than CLAUDE.md rule 7 allows, no overlay
// darkens the screen past what a netling can be read through, every tint holds every palette at 1.0's contrast, Ghosting fades and never
// blinks, and the labels read on every shell.
import './ready.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { IDEA_SHELLS, IDEA_TINTS, IDEA_EFFECTS, IDEA_LABELS, STERILE, SHELLS_1_0, LIGHT_SHELLS_1_0, infraredMap, luminance, PAPER, PAPER_BODIES, paperPalette, paperMap } from './style-ideas.js';
import { registerIdeas } from './accessory-ideas.js';
import { composeLCD, paintLCD } from './render.js';
import { forms } from './models.js';
import { ACCESSORIES, PROPS } from '../../src/accessories.js';
import { createGhosting, GHOST_MS, mixHex } from './ghosting.js';
import { registerPalettes } from './palettes.js';
import { PALETTES } from '../../src/sim.js';
import { COSMETICS } from '../../src/cosmetics.js';
import { deltaE } from '../../src/colors.js';
import { FLASH_TOGGLE_MS } from '../../src/games/common.js';

registerPalettes();
registerIdeas();
const doc = readFileSync(new URL('../../docs/archive/netling2/ACCESSORY_IDEAS.md', import.meta.url), 'utf8');
const css = readFileSync(new URL('./style-ideas.css', import.meta.url), 'utf8');
const base = readFileSync(new URL('../../style.css', import.meta.url), 'utf8');
const idsOf = (heading) => [...doc.split(`## ${heading}`)[1].split('\n## ')[0].matchAll(/^\|[^|]*\(`(\w+)`\)/gm)].map((m) => m[1]);
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
// The CSS split into its plain rules ([selector, body]) and keyframes (name -> body text).
const keyframes = new Map([...css.matchAll(/@keyframes ([\w-]+) \{((?:[^{}]*\{[^{}]*\})*)\s*\}/g)].map((m) => [m[1], m[2]]));
const rules = [...css.replace(/@keyframes [\w-]+ \{(?:[^{}]*\{[^{}]*\})*\s*\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => [m[1].trim(), m[2]]);
const ruleFor = (selector) => rules.filter(([s]) => s.split(',').map((x) => x.trim()).includes(selector));
const TEXT = '#c7f9ff';
const DIM = '#809fa6';

test('every shell, tint, effect and label in the doc is built, with the Three of a kind shell and the Hazard orange tint dropped', () => {
  assert.deepEqual(IDEA_SHELLS.map((x) => x.id), idsOf('Shells ('));
  assert.deepEqual(IDEA_TINTS.map((x) => x.id), idsOf('Tints ('));
  assert.deepEqual(IDEA_EFFECTS.map((x) => x.id), idsOf('Screen effects ('));
  assert.deepEqual(IDEA_LABELS.map((x) => x.id), idsOf('Device label (').map((id) => id.replace('label', '')).map((id) => (id === 'tape' ? 'tape' : id)));
  assert.ok(!doc.includes('`tricolor`') && !doc.includes('`hazard`'), 'the dropped duplicates are out of the doc\'s tables');
  // No id clashes with 1.0's.
  for (const [slot, list] of [['shell', IDEA_SHELLS], ['tint', IDEA_TINTS], ['effect', IDEA_EFFECTS]]) for (const x of list) assert.ok(!COSMETICS[slot].some((c) => c.id === x.id), `${slot} ${x.id} clashes`);
});

test('every shell, effect and label has its CSS rule, and a light shell darkens the dim colour and the logo as 1.0\'s do', () => {
  for (const s of IDEA_SHELLS) {
    const rule = ruleFor(`.device.shell-${s.id}`);
    assert.equal(rule.length, 1, `${s.id} has a rule`);
    const dim = rule[0][1].match(/--dim:\s*(#[0-9a-f]{6})/i)?.[1];
    if (s.light) {
      assert.equal(dim, s.dim, `${s.id}: --dim`);
      assert.equal(ruleFor(`.device.shell-${s.id} .logo`)[0]?.[1].match(/color:\s*(#[0-9a-f]{6})/i)?.[1], s.logo, `${s.id}: logo`);
    } else assert.equal(dim, undefined, `${s.id} is a dark shell`);
  }
  for (const e of IDEA_EFFECTS.filter((x) => x.css)) assert.ok(rules.some(([s]) => s.startsWith(`.screen.fx-${e.id} `)), `${e.id} has a rule`);
  for (const e of IDEA_EFFECTS.filter((x) => !x.css)) assert.ok(!rules.some(([s]) => s.includes(`fx-${e.id}`)), `${e.id} is a pixel effect, not CSS`);
  for (const l of IDEA_LABELS) assert.ok(ruleFor(`.device.label-${l.id} .logo`).length === 1, `${l.id} has a rule`);
});

test('the HUD text reads on every new shell: 4.5:1 for the text and the dim colour (a light shell\'s dim colour and logo are dark)', () => {
  for (const s of IDEA_SHELLS) {
    for (const under of s.base) {
      if (s.light) {
        assert.ok(ratio(s.dim, under) >= 4.5, `${s.id} dim ${s.dim} on ${under}: ${ratio(s.dim, under).toFixed(2)}`);
        assert.ok(ratio(s.logo, under) >= 4.5, `${s.id} logo on ${under}`);
      } else {
        assert.ok(ratio(TEXT, under) >= 4.5, `${s.id} text on ${under}: ${ratio(TEXT, under).toFixed(2)}`);
        assert.ok(ratio(DIM, under) >= 4.5, `${s.id} dim on ${under}: ${ratio(DIM, under).toFixed(2)}`);
      }
    }
  }
});

test('nothing in the CSS moves faster than a cycle a second, with no stepped animation, and the effects\' stated cycles are the CSS\'s', () => {
  const used = [...css.matchAll(/animation:\s*([\w-]+)\s+([\d.]+)(m?s)\s+([^;]*);/g)];
  assert.ok(used.length >= 2);
  for (const [, name, n, unit, rest] of used) {
    const seconds = unit === 'ms' ? Number(n) / 1000 : Number(n);
    assert.ok(seconds >= 1, `${name}: ${seconds}s`);
    assert.ok(!/steps\(/.test(rest), `${name} is stepped`);
    assert.ok(keyframes.has(name), `${name} has keyframes`);
  }
  for (const e of IDEA_EFFECTS.filter((x) => x.moves)) assert.ok(used.some(([, name, n]) => name === e.moves.name && Number(n) === e.moves.seconds), `${e.id}: ${e.moves.name} ${e.moves.seconds}s`);
  // A fade in or out inside a keyframe set takes at least FLASH_TOGGLE_MS of the cycle: the shortest opacity step in condensation-run.
  const run = [...keyframes.get('condensation-run').matchAll(/(\d+)%\s*\{[^}]*opacity:\s*([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
  for (let i = 1; i < run.length; i++) if (run[i][1] !== run[i - 1][1]) assert.ok(((run[i][0] - run[i - 1][0]) / 100) * 30_000 >= FLASH_TOGGLE_MS, 'a fade shorter than the flash floor');
  // Calm: 1.0's global rule stops every animation (style.css), and Interference is switched off with motion calmed.
  assert.match(base, /body\.calm \*,[\s\S]*animation: none/);
  assert.ok(ruleFor('body.calm .screen.fx-interference .fx-layer::before')[0][1].includes('display: none'));
});

test('no overlay darkens or tints the screen past a readable amount', () => {
  for (const e of IDEA_EFFECTS.filter((x) => x.css)) {
    const body = rules.filter(([s]) => s.startsWith(`.screen.fx-${e.id} `)).map(([, b]) => b).join('\n');
    for (const m of body.matchAll(/rgba\([^)]*,\s*([\d.]+)\)/g)) assert.ok(Number(m[1]) <= 0.45, `${e.id}: alpha ${m[1]}`);
  }
  // The vignette, which dims the most, reaches 0.42 only at the very corners, and the centre 58% of the screen is untouched.
  assert.match(ruleFor('.screen.fx-vignette .fx-layer')[0][1], /transparent 58%, rgba\(0, 0, 0, 0\.42\) 100%/);
});

test('the tints hold every palette at 1.0\'s contrast on the screen colour, and none repeats a 1.0 tint', () => {
  for (const t of IDEA_TINTS) {
    assert.match(t.lcd, /^#[0-9a-f]{6}$/);
    assert.ok(luminance(t.dark) < luminance(t.lcd), `${t.id}: lights off is darker`);
    for (const p of t.light ? PALETTES.map(t.repalette) : PALETTES) { // a light screen is read in its own palette colours (the Paper test)
      assert.ok(ratio(p.main, t.lcd) >= 4.5, `${t.id} / ${p.name} main: ${ratio(p.main, t.lcd).toFixed(2)}`);
      assert.ok(ratio(p.ink ?? p.accent, t.lcd) >= 4.4, `${t.id} / ${p.name} on-screen colour: ${ratio(p.ink ?? p.accent, t.lcd).toFixed(2)}`);
    }
    for (const old of COSMETICS.tint) assert.ok(deltaE(t.lcd, old.lcd) >= 6, `${t.id} is too near ${old.id}`);
  }
});

test('Infrared recolours by brightness: the brightest goes orange, dim goes deep red, and every palette still reads on it', () => {
  const t = IDEA_TINTS.find((x) => x.id === 'infrared');
  assert.equal(t.remap, infraredMap);
  assert.ok(luminance(infraredMap('#ffffff')) > luminance(infraredMap('#808080')) && luminance(infraredMap('#808080')) > luminance(infraredMap('#101010')), 'monotonic');
  for (const p of PALETTES) {
    const [main, accent] = [infraredMap(p.main), infraredMap(p.accent)];
    assert.ok(ratio(main, t.lcd) >= 4.5, `${p.name} body ${main} on the screen: ${ratio(main, t.lcd).toFixed(2)}`);
    assert.ok(ratio(infraredMap(p.ink ?? p.accent), t.lcd) >= 3, `${p.name} on-screen colour`);
    assert.ok(ratio(main, accent) >= 1.5, `${p.name} eyes on the body: ${ratio(main, accent).toFixed(2)} (${main} ${accent})`);
  }
});

test('Ghosting fades a cell that turns off over 200 ms, one way, and a still screen is untouched', () => {
  assert.ok(GHOST_MS >= FLASH_TOGGLE_MS);
  const bg = '#0b2226';
  const grid = (c) => [[c, bg], [bg, bg]];
  const g = createGhosting(bg);
  assert.deepEqual(g.step(grid('#05d9e8'), 0), grid('#05d9e8'), 'the first frame as it is');
  assert.deepEqual(g.step(grid('#05d9e8'), 1000), grid('#05d9e8'), 'a steady cell is unchanged');
  // The cell turns off at 2000: it fades from cyan to the screen colour over 200 ms, brightness only falling.
  let last = Infinity;
  const seen = [];
  for (let t = 2000; t <= 2300; t += 20) {
    const shown = g.step(grid(bg), t)[0][0];
    const l = luminance(shown);
    assert.ok(l <= last + 1e-9, `${t}: brightness rose`);
    last = l;
    seen.push(shown);
    if (t === 2000) assert.equal(shown, '#05d9e8', 'it begins at the old colour');
    if (t >= 2000 + GHOST_MS) assert.equal(shown, bg, 'and ends at the new');
  }
  assert.ok(new Set(seen).size >= 8, 'a fade, not a snap');
  // Other cells never change.
  assert.deepEqual(g.step(grid(bg), 2400)[1], [bg, bg]);
  // Turning on is the same fade the other way (a cell does not jump the moment it lights).
  const h = createGhosting(bg);
  h.step(grid(bg), 0);
  assert.notEqual(h.step(grid('#05d9e8'), 100)[0][0], '#05d9e8');
  assert.equal(h.step(grid('#05d9e8'), 100 + GHOST_MS)[0][0], '#05d9e8');
  // Changing again mid-fade starts from where the cell is, and never reverses a flash: three flips in 600 ms change direction no faster than
  // the fades allow (each is at least 200 ms from the last turn).
  const k = createGhosting(bg);
  k.step(grid('#05d9e8'), 0);
  const levels = [];
  for (let t = 0; t < 1000; t += 25) levels.push(luminance(k.step(grid(t >= 100 && t < 500 ? bg : '#05d9e8'), t)[0][0]));
  let turns = 0;
  for (let i = 2; i < levels.length; i++) if (Math.sign(levels[i] - levels[i - 1]) * Math.sign(levels[i - 1] - levels[i - 2]) < 0) turns++;
  assert.ok(turns <= 2, `${turns} direction changes`);
  // Reduced motion: no lag at all.
  const r = createGhosting(bg);
  r.step(grid('#05d9e8'), 0, { reduced: true });
  assert.deepEqual(r.step(grid(bg), 10, { reduced: true }), grid(bg));
  assert.equal(mixHex('#000000', '#ffffff', 0.5), '#808080');
});

test('the labels read on every shell: the tape and the sticker bring their own field, the etched lettering is light on dark shells and dark on light ones', () => {
  const tape = IDEA_LABELS.find((l) => l.id === 'tape');
  assert.ok(ratio(tape.ink, tape.field) >= 7);
  const sticker = IDEA_LABELS.find((l) => l.id === 'sticker');
  for (const p of PALETTES) assert.ok(ratio(sticker.ink, p.main) >= 4.5, `sticker on ${p.name}: ${ratio(sticker.ink, p.main).toFixed(2)}`);
  // Etched: --shell-edge (#2a2240 by default) mixed 35% toward white over the shell, 3:1 on every dark shell; on the light shells a dark rule wins.
  const edge = '#2a2240';
  const etched = mixHex('#ffffff', edge, IDEA_LABELS.find((l) => l.id === 'etched').edgeMix);
  const dark = [...Object.entries(SHELLS_1_0).filter(([id]) => !LIGHT_SHELLS_1_0.includes(id)), ...IDEA_SHELLS.filter((s) => !s.light).flatMap((s) => s.base.map((b) => [s.id, b]))];
  for (const [id, under] of dark) assert.ok(ratio(etched, under) >= 3, `etched ${etched} on ${id} ${under}: ${ratio(etched, under).toFixed(2)}`);
  const lightIds = [...LIGHT_SHELLS_1_0, ...IDEA_SHELLS.filter((s) => s.light).map((s) => s.id)];
  const darkRule = rules.find(([s]) => lightIds.every((id) => s.includes(`.device.label-etched.shell-${id} .logo`)));
  assert.ok(darkRule, 'etched on a light shell keeps its dark lettering');
  assert.match(css, /color-mix\(in srgb, var\(--shell-edge\) 35%, #ffffff\)/);
});

test('Sterile keeps every palette readable once the wash is laid over both the body and the screen, on every tint', () => {
  const wash = (c, [r, g, b] = STERILE.rgb, a = STERILE.alpha) => `#${[r, g, b].map((v, i) => Math.round(parseInt(c.slice(1 + i * 2, 3 + i * 2), 16) * (1 - a) + v * a).toString(16).padStart(2, '0')).join('')}`;
  assert.match(css, /\.screen\.fx-sterile \.fx-layer \{[^}]*rgba\(225, 240, 255, 0\.12\)/);
  const worst = Math.max(...[...css.match(/\.screen\.fx-sterile \.fx-layer \{[^}]*\}/)[0].matchAll(/rgba\([^)]*,\s*([\d.]+)\)/g)].map((m) => Number(m[1])));
  assert.equal(worst, STERILE.alpha, 'the CSS never exceeds the alpha the test uses');
  for (const t of [...COSMETICS.tint, ...IDEA_TINTS]) {
    for (const p of t.light ? PALETTES.map(t.repalette) : PALETTES) {
      // 3:1, the bar graphics are asked for; the wash costs about a third of the margin, so the body (4.5:1 before) still clears it.
      assert.ok(ratio(wash(p.main), wash(t.lcd)) >= 3, `${p.name} body on ${t.id} under Sterile: ${ratio(wash(p.main), wash(t.lcd)).toFixed(2)}`);
      assert.ok(ratio(wash(p.ink ?? p.accent), wash(t.lcd)) >= 3, `${p.name} on-screen colour on ${t.id} under Sterile`);
    }
  }
});

test('every new shell has an effect paired with it, and the pairs are one to one', () => {
  const pairs = IDEA_EFFECTS.filter((e) => e.shell);
  assert.deepEqual(pairs.map((e) => e.shell).sort(), IDEA_SHELLS.map((s) => s.id).sort());
  assert.equal(new Set(pairs.map((e) => e.shell)).size, pairs.length);
});

test('the dead cells are one LCD cell each, still on the grid, and the split tone is two quiet halves', () => {
  const body = ruleFor('.screen.fx-deadcells .fx-layer')[0][1];
  const cells = [...body.matchAll(/(\d+\.?\d*)% (\d+\.?\d*)% \/ calc\(100% \/ var\(--lcd-cols\)\) calc\(100% \/ var\(--lcd-rows\)\)/g)];
  assert.equal(cells.length, 5);
  // A cell lands on the grid when its position is col/(cols-1) of the width (the percentage rule for a background smaller than its box).
  for (const [, x, y] of cells) {
    assert.ok(Math.abs(Number(x) / 100 * 39 - Math.round(Number(x) / 100 * 39)) < 0.1, `column at ${x}%`);
    assert.ok(Math.abs(Number(y) / 100 * 29 - Math.round(Number(y) / 100 * 29)) < 0.1, `row at ${y}%`);
  }
  for (const m of ruleFor('.screen.fx-splittone .fx-layer')[0][1].matchAll(/rgba\(\d+, \d+, \d+, ([\d.]+)\)/g)) assert.ok(Number(m[1]) <= 0.12, 'quiet halves');
});

// A fake 2D context that records the last colour drawn into each cell (alpha draws, the glows, are left out), for the Paper tests.
const recorder = () => {
  const cells = new Map();
  const ctx = { globalAlpha: 1, fillStyle: '#000000', save() {}, restore() {}, translate() {}, scale() {}, fillRect(x, y, w, h) { if (this.globalAlpha < 1) return; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) cells.set(`${x + i},${y + j}`, this.fillStyle); } };
  return { ctx, cells };
};

test('Paper, the light screen: every palette is darkened by role and clears the bars a dark screen is held to, with its eyes pale on a dark body', () => {
  const paper = IDEA_TINTS.find((t) => t.id === 'paper');
  assert.ok(paper.light && paper.repalette === paperPalette && paper.remap === paperMap);
  assert.equal(paper.lcd, PAPER.lcd);
  assert.ok(luminance(PAPER.lcd) > 0.5, 'a light screen');
  assert.ok(ratio(PAPER.dark, PAPER.lcd) > 10 && luminance(PAPER.dark) < 0.02, 'lights off is a dark screen');
  const bodies = [];
  for (const p of PALETTES) {
    const q = paperPalette(p);
    assert.ok(PAPER_BODIES[p.name], `${p.name} has a hand-picked paper body`);
    assert.ok(ratio(q.main, PAPER.lcd) >= 4.5, `${p.name} body on paper: ${ratio(q.main, PAPER.lcd).toFixed(2)}`);
    assert.ok(ratio(q.ink, PAPER.lcd) >= 4.4, `${p.name} on-screen colour on paper: ${ratio(q.ink, PAPER.lcd).toFixed(2)}`);
    assert.ok(ratio(q.accent, q.main) >= 3, `${p.name} eyes on the body: ${ratio(q.accent, q.main).toFixed(2)}`);
    assert.ok(ratio(q.mark, q.main) >= 3, `${p.name} marks on the body`);
    bodies.push([p.name, q.main]);
  }
  for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) assert.ok(deltaE(bodies[i][1], bodies[j][1]) >= 25, `${bodies[i][0]} and ${bodies[j][0]} look alike on paper`);
  // The map darkens: a brighter input never comes out brighter than a darker one, and white lands near black.
  const lum = (c) => luminance(paperMap(c));
  assert.ok(lum('#ffffff') < lum('#808080') && lum('#808080') < lum('#101010'), 'inverts brightness');
  assert.ok(ratio(paperMap('#101010'), PAPER.lcd) >= 3 && ratio(paperMap('#ffffff'), PAPER.lcd) >= 3, 'both ends read on paper');
});

test('Paper is applied by the renderer with the lights on only, and in the dark the palette\'s own colours return', () => {
  const paper = IDEA_TINTS.find((t) => t.id === 'paper');
  const form = forms('B').ironAdultBreachStreet;
  const lit = composeLCD({ form, egg: 'iron', idle: 'none', palette: 1 }, 800, { tint: paper });
  assert.equal(lit.bg, PAPER.lcd);
  assert.ok(lit.recolor);
  assert.equal(lit.ops.find((o) => o.op === 'rows').colors['#'], PAPER_BODIES[PALETTES[1].name], 'the body is the paper body');
  const dark = composeLCD({ form, egg: 'iron', idle: 'none', palette: 1, lightsOn: false }, 800, { tint: paper });
  assert.equal(dark.bg, PAPER.dark);
  assert.equal(dark.recolor, null);
  assert.equal(dark.ops.find((o) => o.op === 'rows').colors['#'], PALETTES[1].main, 'the palette\'s own body in the dark');
  assert.equal(composeLCD({ form, egg: 'iron', idle: 'none', palette: 1 }, 800, { tint: IDEA_TINTS.find((t) => t.id === 'sepia') }).recolor, null, 'a dark tint changes nothing');
  assert.equal(composeLCD({ form, egg: 'iron', idle: 'none', palette: 1, pose: 'dead' }, 800, { tint: paper }).ops.find((o) => o.op === 'rect').color, paperPalette(PALETTES[1]).ink, 'the flatline is the dark ink');
});

test('on Paper no worn item blends into the body and no prop falls under 2.5:1 on the screen', () => {
  const paper = IDEA_TINTS.find((t) => t.id === 'paper');
  const form = forms('B').ironAdultBreachStreet;
  const scene = (pet) => { const { ctx, cells } = recorder(); paintLCD(ctx, composeLCD({ form, egg: 'iron', idle: 'none', ...pet }, 800, { tint: paper })); return cells; };
  for (const [pi, pal] of PALETTES.entries()) {
    const main = paperPalette(pal).main;
    const base = scene({ palette: pi });
    const body = composeLCD({ form, egg: 'iron', idle: 'none', palette: pi }, 800, { tint: paper }).recolor.body;
    const touches = (k) => { const [x, y] = k.split(',').map(Number); return [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => body.has(`${x + dx},${y + dy}`)); };
    for (const a of ACCESSORIES.filter((x) => x.slot)) {
      for (const [k, c] of scene({ palette: pi, worn: [{ id: a.id }] })) {
        if (base.get(k) !== c && touches(k)) assert.ok(deltaE(c, main) >= 20 || (!body.has(k) && deltaE(c, PAPER.lcd) >= 20), `${pal.name} ${a.id} at ${k}: ${c} on ${main}`);
      }
    }
  }
  const base = scene({ palette: 0 });
  for (const pr of PROPS) for (const [k, c] of scene({ palette: 0, prop: pr.id })) if (base.get(k) !== c) assert.ok(ratio(c, PAPER.lcd) >= 2.5, `${pr.id} at ${k}: ${c} is ${ratio(c, PAPER.lcd).toFixed(2)}:1 on paper`);
});
