import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createScript, migrate, tick, mulberry32, CFG, MIN, PALETTES } from '../src/sim.js';
import { startRun, moveTo, resolveIce, choose, runOptions } from '../src/netrun/run.js';
import { REGION_ORDER } from '../src/netrun/regions.js';
import { FRAGMENTS } from '../src/netrun/codex.js';
import { deathRecord, lineageRows } from '../src/archive.js';
import { unlockedIds, resolveWardrobe } from '../src/cosmetics.js';
import {
  cleanSave,
  cleanLineage,
  cleanDex,
  cleanCodex,
  cleanAccessories,
  cleanUnlocked,
  cleanWardrobe,
  cleanProgress,
  cleanPrefs,
  cleanOnboarding,
  cleanLock,
} from '../src/sanitize.js';

const T0 = Date.UTC(2026, 8, 26, 12, 0);
const booted = () => {
  const s = migrate(createScript({ now: T0, rng: mulberry32(3) }));
  tick(s, T0 + CFG.bootMinutes * MIN, () => 0.999);
  return s;
};
const roundTrip = (v) => JSON.parse(JSON.stringify(v));

test('a healthy save comes back unchanged', () => {
  const s = booted();
  act(s, 'corp', T0 + 5 * MIN);
  startRun(s, 'public', mulberry32(9), [], []);
  const stored = roundTrip(s);
  assert.deepEqual(cleanSave(stored, T0 + 10 * MIN), { ...stored, codexInbox: [], accessoryInbox: [] });
});

test('a flatlined save keeps its fragment', () => {
  const s = booted();
  s.careMistakes = CFG.maxMistakes;
  s.stats.integrity = 0;
  tick(s, T0 + 3 * 86_400_000, () => 0.999);
  assert.equal(s.stage, 'dead');
  const clean = cleanSave(roundTrip(s), T0 + 3 * 86_400_000);
  assert.deepEqual(clean.fragment, s.fragment);
});

test('unusable saves are rejected', () => {
  for (const bad of [null, 7, 'x', [], {}, { saveVersion: 99, stage: 'baby' }, { saveVersion: 1, stage: 'zombie' }, { saveVersion: 1, stage: 'baby', form: 'dragon' }]) {
    assert.equal(cleanSave(bad), null, JSON.stringify(bad));
  }
});

test('a save with wrong types everywhere is repaired into something the game can run', () => {
  const junk = {
    saveVersion: 1,
    stage: 'dead',
    form: 'kernel',
    generation: 'two',
    lastTick: 1e20,
    stats: { charge: 'full', sync: -50, integrity: 900, heat: null },
    quirk: 'x',
    trait: '__proto__',
    teenForm: 'toString',
    inventory: ['coolant', 'bogus', 3, 'memory', 'memory', 'voucher', 'antivirus', 'booster', 'blackice'],
    log: 'nope',
    games: [],
    event: { type: 'alien' },
    run: { region: 'nowhere' },
    fragment: { form: 'kernel' },
    codexInbox: ['fake', 3],
    accessoryInbox: { a: 1 },
    buffs: 'x',
    hibernation: { since: 'yesterday' },
  };
  const now = T0;
  const s = cleanSave(junk, now);
  assert.equal(s.generation, 1);
  assert.equal(s.lastTick, now + 86_400_000);
  assert.deepEqual(s.stats, { charge: 70, sync: 0, integrity: 100, heat: 20 });
  assert.ok(s.quirk.palette >= 0 && s.quirk.palette < PALETTES.length && Number.isFinite(s.quirk.pitch));
  assert.equal(s.trait, null);
  assert.equal(s.teenForm, null);
  assert.equal(s.inventory.length, 6);
  assert.ok(!s.inventory.includes('bogus'));
  assert.deepEqual(s.log, []);
  assert.deepEqual(s.games.breach, { played: 0, won: 0 });
  assert.equal(s.event, null);
  assert.equal(s.run, null);
  assert.equal(s.hibernation, null);
  assert.deepEqual(s.codexInbox, []);
  assert.deepEqual(s.accessoryInbox, []);
  assert.equal(s.deathCause, 'unknown');
  // A dead netling always has a usable fragment for the flatline screen and the next generation.
  assert.ok(s.fragment.form && s.fragment.trait);
  // And the repaired save survives the next generation being compiled from it.
  const next = createScript({ now, generation: s.generation + 1, fragment: s.fragment });
  assert.equal(next.generation, 2);
});

test('a run with a broken map is dropped; a good one is kept', () => {
  const s = booted();
  startRun(s, 'public', mulberry32(9), [], []);
  const good = roundTrip(s);
  assert.ok(cleanSave(good, T0).run);
  const broken = roundTrip(s);
  broken.run.pos = 999;
  assert.equal(cleanSave(broken, T0).run, null);
  const badEdge = roundTrip(s);
  badEdge.run.map.nodes[0].edges = [12345];
  assert.equal(cleanSave(badEdge, T0).run, null);
  // An open choice the view couldn't draw is dropped, back to the map.
  const badChoice = roundTrip(s);
  Object.assign(badChoice.run, { phase: 'choice', pending: { kind: 'market', title: 'x', text: 'y', options: 'nope' } });
  assert.equal(cleanSave(badChoice, T0).run.phase, 'map');
  assert.equal(cleanSave(badChoice, T0).run.pending, null);
  const goodChoice = roundTrip(s);
  const pending = { kind: 'relay', title: 'RELAY', text: 'rest?', options: [{ id: 'out', label: 'JACK OUT', hint: 'bank it' }] };
  Object.assign(goodChoice.run, { phase: 'choice', pending });
  assert.deepEqual(cleanSave(goodChoice, T0).run.pending, pending);
  const badIce = roundTrip(s);
  Object.assign(badIce.run, { phase: 'ice', pending: { game: 'chess' } });
  assert.equal(cleanSave(badIce, T0).run.phase, 'map');
});

test('id lists keep only known, unique strings', () => {
  assert.deepEqual(cleanDex(['kernel', 'kernel', 'dragon', 4, null]), ['kernel']);
  assert.deepEqual(cleanDex({ length: 3 }), []);
  assert.deepEqual(cleanCodex({}), []);
  assert.deepEqual(cleanAccessories(['partyhat', 'crown-of-lies']), ['partyhat']);
  assert.deepEqual(cleanUnlocked(['shell:matte', 'label', 'shell:nope', 'all']), ['shell:matte', 'label']);
});

test('lineage records are repaired and still render', () => {
  const s = booted();
  s.careMistakes = CFG.maxMistakes;
  s.stats.integrity = 0;
  tick(s, T0 + 3 * 86_400_000, () => 0.999);
  const real = roundTrip(deathRecord(s));
  const lineage = cleanLineage([real, { form: 'dragon', trait: 'nope', keepsake: 'nope', fragmentTrait: 5 }, 7, null, 'x']);
  assert.equal(lineage.length, 2);
  assert.deepEqual(lineage[0], real);
  assert.deepEqual(lineage[1].form, null);
  assert.equal(lineage[1].realized, undefined, 'old records without the field stay that way');
  assert.equal(lineageRows(lineage, booted()).length, 3);
  assert.deepEqual(cleanLineage({ a: 1 }), []);
});

test('progress, wardrobe, prefs, onboarding and lock fall back to safe shapes', () => {
  const progress = cleanProgress(JSON.parse('{"acts":{"corp":3,"scav":"x","__proto__":5},"streaks":{"breach":{"cur":2,"best":"x"},"fake":{}},"gamesPlayed":-4,"runs":{"jacked":2,"hacked":9}}'));
  assert.deepEqual(progress, { runs: { jacked: 2 }, streaks: { breach: { cur: 2, best: 0 } }, acts: { corp: 3 }, gamesPlayed: 0, cleanJackouts: 0, deepExits: 0 });
  assert.deepEqual(cleanProgress('lots'), { streaks: {}, acts: {}, gamesPlayed: 0, cleanJackouts: 0, deepExits: 0 });
  // Unlock checks run on the cleaned shape.
  unlockedIds({ dex: [], codex: [], lineage: [], generation: 1, progress: cleanProgress(null) });

  const w = cleanWardrobe({ shell: 'matte', tint: 42, accessory: 'partyhat', prop: 'nope', label: { a: 1 }, colors: { partyhat: ['#00ff00', 'red'], nope: ['#000000'] } });
  assert.equal(w.shell, 'matte');
  assert.equal(w.tint, undefined);
  assert.equal(w.prop, undefined);
  assert.equal(w.label, undefined);
  assert.equal(w.colors.partyhat[0], '#00ff00');
  assert.match(w.colors.partyhat[1], /^#[0-9a-f]{6}$/i);
  assert.equal(w.colors.nope, undefined);
  assert.deepEqual(resolveWardrobe(cleanWardrobe([1, 2]), []), resolveWardrobe({}, []));

  assert.deepEqual(cleanPrefs({ volume: 'loud', sound: 'yes', alerts: true }), { sound: true, alerts: true, volume: 0.8 });
  assert.deepEqual(cleanPrefs({ volume: 7 }), { sound: true, alerts: false, volume: 1 });
  assert.equal(cleanOnboarding('nudge'), 'nudge');
  assert.equal(cleanOnboarding(42), null);
  assert.equal(cleanLock({ code: 5 }), null);
  assert.deepEqual(cleanLock({ code: 'NL1.x.y', at: 'x', generation: 3 }), { code: 'NL1.x.y', at: 0, generation: 3 });
});

test('every state a real netrun passes through survives cleaning unchanged', () => {
  let checked = 0;
  for (let seed = 1; seed <= 40; seed++) {
    const rng = mulberry32(seed);
    for (const region of ['tutorial', ...REGION_ORDER]) {
      const pet = booted();
      Object.assign(pet, { stage: 'adult', form: 'daemon' });
      pet.stats.charge = 100;
      startRun(pet, region, rng, FRAGMENTS.map((f) => f.id), []);
      for (let steps = 0; pet.run.phase !== 'done' && steps < 40; steps++) {
        const stored = roundTrip(pet);
        assert.deepEqual(cleanSave(stored, T0).run, stored.run, `${region} seed ${seed} step ${steps}`);
        checked++;
        const run = pet.run;
        if (run.phase === 'ice') resolveIce(pet, rng() < 0.6, rng);
        else if (run.phase === 'choice') {
          const open = run.pending.options.filter((o) => !o.disabled);
          choose(pet, open[Math.floor(rng() * open.length)].id, rng);
        } else {
          const next = runOptions(run);
          moveTo(pet, next[Math.floor(rng() * next.length)].id, rng);
        }
      }
    }
  }
  assert.ok(checked > 1000);
});
