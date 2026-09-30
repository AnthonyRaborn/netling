import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SPECIES, FORMS, TRAITS, FORM_MODS, KEEPSAKES, ITEMS, GAME_IDS, PALETTES, EVENTS, CFG } from '../src/sim.js';
import { SPRITES, ITEM_SPRITES, ITEM_COLORS, formSprite } from '../src/sprites.js';
import { REGIONS, REGION_ORDER, STAGE_ORDER } from '../src/netrun/regions.js';
import { FRAGMENTS } from '../src/netrun/codex.js';
import { ANOMALIES } from '../src/netrun/anomalies.js';
import { FORM_ABILITIES } from '../src/netrun/run.js';
import { DEX_ORDER, DEX_HINTS, DEX_LORE } from '../src/archive.js';
import { COSMETICS, SLOTS, DEFAULT_WARDROBE, LABEL } from '../src/cosmetics.js';
import { ACCESSORIES, PROPS, STYLE_ITEMS, RARITY } from '../src/accessories.js';
import { GAMES } from '../src/games/session.js';
import { CHATTER } from '../src/chatter.js';

// Cross-checks between the game's content tables. Each of these is a typo or a forgotten entry waiting to
// happen when someone adds a form, item, region or cosmetic (see docs/CONTRIBUTING.md).

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const unique = (list) => new Set(list).size === list.length;
const PIXELS = /^[#o+x.]+$/;

test('every body has a sprite, and every sprite is a clean rectangle of known pixels', () => {
  for (const form of Object.keys(SPECIES)) {
    assert.ok(SPRITES[`${form}A`], `${form} has no A pose`);
    for (const pose of ['a', 'b', 'sleep', 'dead']) {
      const rows = formSprite(form, pose);
      assert.ok(Array.isArray(rows) && rows.length > 0, `${form}/${pose}`);
      for (const row of rows) {
        assert.match(row, PIXELS, `${form}/${pose}: unknown pixel in "${row}"`);
        assert.equal(row.length, rows[0].length, `${form}/${pose}: ragged rows`);
      }
    }
  }
  for (const [name, rows] of Object.entries(SPRITES)) {
    assert.ok(rows.every((r) => PIXELS.test(r) && r.length === rows[0].length), `sprite ${name} is malformed`);
  }
});

test('every item has art and a color, and no art is left over', () => {
  assert.deepEqual(Object.keys(ITEM_SPRITES).sort(), Object.keys(ITEMS).sort());
  assert.deepEqual(Object.keys(ITEM_COLORS).sort(), Object.keys(ITEMS).sort());
  for (const [id, rows] of Object.entries(ITEM_SPRITES)) {
    assert.equal(rows.length, 7, `${id} height`);
    assert.ok(rows.every((r) => r.length === 7 && PIXELS.test(r)), `${id} shape`);
  }
  for (const [id, item] of Object.entries(ITEMS)) assert.ok(item.name && item.desc, `${id} needs a name and description`);
});

test('forms, traits, perks, keepsakes and run abilities line up', () => {
  const adults = Object.keys(SPECIES).filter((f) => SPECIES[f].stage === 'adult');
  assert.deepEqual(Object.keys(FORMS).sort(), adults.sort());
  assert.deepEqual(Object.keys(KEEPSAKES).sort(), adults.sort());
  assert.deepEqual(Object.keys(FORM_ABILITIES).sort(), adults.sort());
  for (const form of adults) {
    assert.ok(TRAITS[FORMS[form].trait], `${form}: trait ${FORMS[form].trait} is not defined`);
    assert.ok(ITEMS[KEEPSAKES[form]], `${form}: keepsake ${KEEPSAKES[form]} is not an item`);
    assert.ok(FORM_MODS[form]?.desc, `${form} has no perk description`);
  }
  assert.ok(unique(Object.values(FORMS).map((f) => f.trait)), 'two forms share a trait');
  for (const [id, t] of Object.entries(TRAITS)) assert.ok(t.name && t.desc, `trait ${id}`);
  for (const stage of Object.values(SPECIES).map((s) => s.stage)) assert.ok(['baby', 'teen', 'adult'].includes(stage));
});

test('the dex covers every body, with a hint and a line of lore for each', () => {
  assert.deepEqual([...DEX_ORDER].sort(), Object.keys(SPECIES).sort());
  for (const form of DEX_ORDER) {
    assert.ok(DEX_HINTS[form], `${form} has no hint`);
    assert.ok(DEX_LORE[form], `${form} has no lore`);
  }
});

test('regions only mention items, node types, stages and fragments that exist', () => {
  const nodeTypes = ['cache', 'ice', 'relay', 'checkpoint', 'market', 'anomaly'];
  const ids = new Set(FRAGMENTS.map((f) => f.id));
  for (const [id, r] of Object.entries(REGIONS)) {
    assert.ok(STAGE_ORDER.includes(r.minStage), `${id}: stage ${r.minStage}`);
    for (const type of Object.keys(r.nodes)) assert.ok(nodeTypes.includes(type), `${id}: node type ${type}`);
    for (const table of [r.loot, r.market].filter(Boolean)) {
      for (const [item, weight] of Object.entries(table)) {
        assert.ok(ITEMS[item], `${id}: ${item} is not an item`);
        assert.ok(weight > 0, `${id}: ${item} has no weight`);
      }
    }
    if (r.nodes.market) assert.ok(r.market || r.loot, `${id} has markets but nothing to sell`);
    if (r.requires) assert.ok(ids.has(r.requires), `${id} requires unknown fragment ${r.requires}`);
    assert.ok(r.layers >= 1 && r.width[0] >= 1 && r.width[1] >= r.width[0], `${id} map size`);
    assert.ok(r.iceDamage > 0 && r.palette?.main && r.palette?.bg && r.sound?.wave, `${id} is missing fields`);
  }
  assert.deepEqual([...REGION_ORDER].sort(), Object.keys(REGIONS).filter((r) => r !== 'tutorial').sort());
});

test('codex fragments: unique ids, real regions, titles and text, and a story for every region', () => {
  assert.ok(unique(FRAGMENTS.map((f) => f.id)), 'duplicate fragment id');
  for (const f of FRAGMENTS) {
    assert.ok(REGION_ORDER.includes(f.region), `${f.id}: unknown region ${f.region}`);
    assert.ok(f.title && f.text, `${f.id} is empty`);
    assert.ok(f.id.startsWith(`${f.region}-`), `${f.id} should be named for its region`);
  }
  for (const region of REGION_ORDER) assert.ok(FRAGMENTS.some((f) => f.region === region), `${region} has no fragments`);
});

test('anomalies: unique ids, at least two options each, and every option can run', () => {
  assert.ok(unique(ANOMALIES.map((a) => a.id)));
  for (const a of ANOMALIES) {
    assert.ok(a.title && a.text, a.id);
    assert.ok(a.options.length >= 2, `${a.id} needs a choice`);
    assert.ok(unique(a.options.map((o) => o.id)), `${a.id}: duplicate option id`);
    for (const o of a.options) assert.ok(o.label && o.hint && typeof o.apply === 'function', `${a.id}/${o.id}`);
  }
});

test('mini-games declare what the session needs, and match GAME_IDS', () => {
  assert.deepEqual(Object.keys(GAMES).sort(), [...GAME_IDS].sort());
  for (const [id, Game] of Object.entries(GAMES)) {
    assert.equal(Game.id, id);
    for (const field of ['title', 'hint', 'winText', 'loseText']) assert.ok(Game[field], `${id}.${field}`);
  }
});

test('events name their windows in CFG', () => {
  for (const [type, e] of Object.entries(EVENTS)) {
    assert.ok(e.label, type);
    assert.ok(CFG[e.window] > 0, `${type}: CFG.${e.window} is missing`);
  }
});

test('cosmetics: unique ids, hints for locked items, working checks, real defaults', () => {
  const empty = { dex: [], codex: [], lineage: [], generation: 1, progress: { streaks: {}, acts: {} } };
  const full = {
    dex: Object.keys(SPECIES),
    codex: FRAGMENTS.map((f) => f.id),
    // A line that raised every adult form, each passing its trait on, with a level III streak at the end.
    lineage: [...Object.keys(FORMS), 'daemon', 'daemon'].map((form, i, all) => ({
      cause: 'end of life cycle',
      form,
      realized: true,
      trait: i ? FORMS[all[i - 1]].trait : null,
      fragmentLevel: i === all.length - 1 ? 3 : 1,
    })),
    generation: 9,
    progress: { streaks: Object.fromEntries(GAME_IDS.map((g) => [g, { cur: 10, best: 10 }])), acts: { corp: 200, scav: 200, patch: 50, comply: 20, hide: 20 }, gamesPlayed: 150, cleanJackouts: 20, deepExits: 3, requestsMet: 30, visitorsGreeted: 12, chatter: CHATTER.map((c) => c.id) },
    flowMin: 25 * 60,
  };
  for (const slot of SLOTS) {
    const list = COSMETICS[slot];
    assert.ok(unique(list.map((c) => c.id)), `${slot}: duplicate id`);
    assert.ok(list.some((c) => c.free), `${slot} has nothing free`);
    assert.ok(list.some((c) => c.id === DEFAULT_WARDROBE[slot] && c.free), `${slot}: the default must be a free item`);
    for (const c of list) {
      assert.ok(c.name, `${slot}/${c.id}`);
      if (c.free) continue;
      assert.ok(c.hint, `${slot}/${c.id} needs a hint`);
      assert.equal(typeof c.check, 'function', `${slot}/${c.id} needs a check`);
      assert.equal(c.check(empty), false, `${slot}/${c.id} is unlocked from nothing`);
      assert.equal(c.check(full), true, `${slot}/${c.id} can never be unlocked`);
    }
  }
  for (const c of COSMETICS.tint) assert.ok(c.lcd && c.dark, `tint ${c.id} needs both colors`);
  for (const c of COSMETICS.sound) assert.ok(c.wave && c.mult > 0, `sound ${c.id}`);
  assert.equal(LABEL.check(empty), false);
  assert.equal(LABEL.check(full), true);
});

test('style items: unique ids, known rarity and regions, art that can draw', () => {
  assert.ok(unique(STYLE_ITEMS.map((x) => x.id)), 'duplicate style id');
  for (const x of STYLE_ITEMS) {
    assert.ok(RARITY[x.rarity], `${x.id}: rarity`);
    assert.ok(x.name && typeof x.draw === 'function', x.id);
    for (const r of x.regions ?? []) assert.ok(REGION_ORDER.includes(r), `${x.id}: region ${r}`);
    if (x.source) assert.equal(x.source, 'earned');
    if (x.colors) for (const [label, def] of x.colors) assert.match(def, /^#[0-9a-f]{6}$/i, `${x.id}/${label}`);
  }
  assert.ok(ACCESSORIES.length > 0 && PROPS.length > 0);
  for (const p of PALETTES) assert.match(p.main, /^#[0-9a-f]{6}$/i);
});

test('every file the service worker lists exists, and the font is among them', () => {
  const sw = readFileSync(join(root, 'sw.js'), 'utf8');
  const shell = [...sw.match(/const SHELL = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  assert.ok(unique(shell), 'a file is listed twice');
  for (const file of shell) {
    if (file === './') continue;
    assert.ok(existsSync(join(root, file)), `${file} is in SHELL but not on disk`);
  }
  assert.ok(shell.includes('fonts/VT323-latin.woff2'));
});

test('the pages deploy publishes every top-level thing the game loads', () => {
  const workflow = readFileSync(join(root, '.github/workflows/pages.yml'), 'utf8');
  const copied = workflow.match(/cp -r ([^\n]+) _site\//)[1].split(/\s+/);
  const html = readFileSync(join(root, 'index.html'), 'utf8');
  const css = readFileSync(join(root, 'style.css'), 'utf8');
  const manifest = JSON.parse(readFileSync(join(root, 'manifest.webmanifest'), 'utf8'));
  const refs = [...html.matchAll(/(?:href|src)="([^"#?]+)"/g)]
    .map((m) => m[1])
    .concat([...css.matchAll(/url\(([^)]+)\)/g)].map((m) => m[1].replace(/['"]/g, '')))
    .concat([...manifest.icons, ...manifest.screenshots].map((entry) => entry.src));
  for (const ref of refs.filter((r) => !/^(https?:|data:)/.test(r))) {
    const top = ref.split('/')[0];
    assert.ok(copied.includes(top), `${ref} is loaded by the game but ${top} is not copied by pages.yml`);
    assert.ok(existsSync(join(root, ref)), `${ref} is referenced but missing`);
  }
  for (const name of copied) assert.ok(existsSync(join(root, name)) && (statSync(join(root, name)).isFile() || readdirSync(join(root, name)).length > 0), `${name} is copied by pages.yml but empty or missing`);
});

// Browsers skip a manifest screenshot whose real size differs from the one it states.
test('the install screenshots are the sizes the manifest says', () => {
  const manifest = JSON.parse(readFileSync(join(root, 'manifest.webmanifest'), 'utf8'));
  assert.deepEqual(manifest.screenshots.map((s) => s.form_factor).sort(), ['narrow', 'wide']);
  for (const { src, sizes } of manifest.screenshots) {
    const png = readFileSync(join(root, src));
    assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, sizes, `${src}: rerun node tools/make-screenshots.mjs`);
  }
});
