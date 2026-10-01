import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createScript, migrate, tick, mulberry32, CFG, MIN, PALETTES, SPECIES } from '../src/sim.js';
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
  assert.equal(s.lastTick, now);
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
  assert.deepEqual(progress, { runs: { jacked: 2 }, streaks: { breach: { cur: 2, best: 0 } }, acts: { corp: 3 }, gamesPlayed: 0, cleanJackouts: 0, deepExits: 0, sourceExits: 0, requestsMet: 0, contractsDone: 0, visitorsGreeted: 0, flowMin: 0, hotMin: 0, chatter: [] });
  const empty = { gamesPlayed: 0, cleanJackouts: 0, deepExits: 0, sourceExits: 0, requestsMet: 0, contractsDone: 0, visitorsGreeted: 0, flowMin: 0, hotMin: 0, chatter: [] };
  assert.deepEqual(cleanProgress('lots'), { streaks: {}, acts: {}, ...empty });
  // Attention counters: numbers are clamped, and only known chatter ids survive (once each).
  const att = cleanProgress({ requestsMet: 7.6, visitorsGreeted: -1, flowMin: 'x', chatter: ['bit-hello', 'nope', 'bit-hello', 3] });
  assert.deepEqual([att.requestsMet, att.visitorsGreeted, att.flowMin, att.chatter], [8, 0, 0, ['bit-hello']]);
  // Unlock checks run on the cleaned shape.
  unlockedIds({ dex: [], codex: [], lineage: [], generation: 1, progress: cleanProgress(null) });

  const w = cleanWardrobe({ shell: 'matte', tint: 42, accessory: 'partyhat', prop: 'nope', label: { a: 1 }, colors: { partyhat: ['#00ff00', 'red'], nope: ['#000000'] } });
  assert.equal(w.shell, 'matte');
  assert.equal(w.tint, undefined);
  assert.equal(w.prop, undefined);
  assert.equal(w.label, undefined);
  assert.equal(w.colors.partyhat[0], '#00ff00');
  assert.equal(w.colors.partyhat[1], null, 'a bad color drops the slot back to automatic');
  assert.deepEqual(cleanWardrobe({ colors: { partyhat: [null, '#112233'] } }).colors.partyhat, [null, '#112233'], 'null stays automatic');
  assert.equal(w.colors.nope, undefined);
  // One accessory per wear slot. A wardrobe from before the slots held one `accessory`: it moves to its own slot.
  assert.equal(w.head, 'partyhat');
  assert.equal(w.accessory, undefined);
  assert.deepEqual(cleanWardrobe({ accessory: 'shades' }), { face: 'shades' });
  assert.deepEqual(cleanWardrobe({ accessory: 'deck' }), {}, 'a prop was never worn');
  assert.deepEqual(cleanWardrobe({ accessory: 'cap', head: 'crown' }), { head: 'crown' }, 'the slot wins over the old field');
  assert.deepEqual(cleanWardrobe({ head: 'shades', face: 'none', body: 'scarf', float: 'drone', prop: 'cap' }), { face: 'none', body: 'scarf', float: 'drone' }, 'an item only fits its own slot');
  assert.deepEqual(resolveWardrobe(cleanWardrobe([1, 2]), []), resolveWardrobe({}, []));

  assert.deepEqual(cleanPrefs({ volume: 'loud', sound: 'yes', alerts: true, awake: 'on' }), { sound: true, alerts: true, volume: 0.8, musicVolume: 0.4, awake: false, motion: 'auto' });
  assert.deepEqual(cleanPrefs({ volume: 7, awake: true, motion: 'reduce' }), { sound: true, alerts: false, volume: 1, musicVolume: 0.4, awake: true, motion: 'reduce' });
  assert.equal(cleanPrefs({ musicVolume: -2 }).musicVolume, 0, 'music can be turned off');
  assert.equal(cleanPrefs({ musicVolume: 'lots' }).musicVolume, 0.4, 'older prefs start at 40%');
  assert.equal(cleanPrefs({ motion: 'slow' }).motion, 'auto');
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
        assert.deepEqual(cleanSave(stored, T0, { strict: true }).run, stored.run, `strict: ${region} seed ${seed} step ${steps}`);
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

// A run parked at a node of the given kind, with its choice open.
function openChoice(type) {
  const s = booted();
  Object.assign(s, { stage: 'adult', form: 'daemon' });
  s.stats.charge = 100;
  startRun(s, 'public', mulberry32(9), [], []);
  const next = runOptions(s.run)[0];
  next.type = type;
  moveTo(s, next.id, mulberry32(5));
  assert.equal(s.run.phase, 'choice');
  return roundTrip(s);
}

test('a stored choice is only kept if run.js could resolve it', () => {
  const market = openChoice('market');
  assert.deepEqual(cleanSave(market, T0).run.pending, market.run.pending);
  for (const tamper of [
    (p) => (p.offers = ['bogus']),
    (p) => (p.price = -50),
    (p) => (p.accOffer = 'crown-of-lies'),
    (p) => p.options.push({ id: 'buy7', label: 'FREE' }),
  ]) {
    const bad = roundTrip(market);
    tamper(bad.run.pending);
    const clean = cleanSave(bad, T0).run;
    assert.equal(clean.phase, 'map', `${tamper}: ${JSON.stringify(bad.run.pending)}`);
    assert.equal(clean.pending, null);
  }
  const anomaly = openChoice('anomaly');
  assert.deepEqual(cleanSave(anomaly, T0).run.pending, anomaly.run.pending);
  anomaly.run.pending.event = 'nope';
  assert.equal(cleanSave(anomaly, T0).run.pending, null);
  const checkpoint = openChoice('checkpoint');
  checkpoint.run.pending.options[0].id = 'bribe';
  assert.equal(cleanSave(checkpoint, T0).run.pending, null);
});

test('a run stuck at a dead end is dropped; a finished run always has a result', () => {
  const s = booted();
  startRun(s, 'public', mulberry32(9), [], []);
  const dead = roundTrip(s);
  dead.run.map.nodes.find((n) => n.id === dead.run.pos).edges = [];
  assert.equal(cleanSave(dead, T0).run, null);
  const done = roundTrip(s);
  Object.assign(done.run, { phase: 'done', result: 'won-somehow' });
  assert.equal(cleanSave(done, T0).run.result, 'aborted');
});

test('strict cleaning (imported codes) keeps only fields the game knows', () => {
  const s = openChoice('market');
  Object.assign(s, { junk: 'x'.repeat(100) });
  s.run.junk = { deep: [1, 2, 3] };
  s.run.map.junk = 1;
  s.run.map.nodes[0].junk = 1;
  s.run.pending.junk = 1;
  s.run.pending.options[0].junk = 1;
  const loose = cleanSave(roundTrip(s), T0);
  assert.equal(loose.junk.length, 100, 'local saves keep unknown fields');
  assert.deepEqual(loose.run.junk, { deep: [1, 2, 3] });
  const strict = cleanSave(roundTrip(s), T0, { strict: true });
  const json = JSON.stringify(strict);
  assert.ok(!json.includes('junk'), json.slice(0, 200));
  assert.equal(strict.run.pending.offers.length, s.run.pending.offers.length);
});

test('repaired defaults match a fresh netling', () => {
  const s = cleanSave({ saveVersion: 1, stage: 'baby', form: 'bitling', cache: 99 }, T0);
  assert.equal(s.sinceFed, CFG.digestMinutes); // not "just fed", so no phantom cache files
  assert.equal(s.cache, CFG.maxCache);
});

test('stage and form are made to agree, and timers cannot start in the future', () => {
  const s = createScript({ now: T0, rng: mulberry32(1) });
  tick(s, T0 + 3 * MIN, () => 0.999);
  const stored = (over) => JSON.parse(JSON.stringify({ ...s, ...over }));
  assert.equal(cleanSave(stored({ stage: 'baby', form: 'daemon' }), T0 + 5 * MIN).form, 'bitling');
  assert.equal(cleanSave(stored({ stage: 'teen', form: 'chrome', teenForm: 'stub' }), T0 + 5 * MIN).form, 'stub');
  assert.equal(cleanSave(stored({ stage: 'teen', form: 'bitling', teenForm: null }), T0 + 5 * MIN).form, 'kernel');
  assert.equal(SPECIES[cleanSave(stored({ stage: 'adult', form: 'bitling' }), T0 + 5 * MIN).form].stage, 'adult');
  const dead = cleanSave(stored({ stage: 'dead', form: 'kernel', deathCause: 'neglect' }), T0 + 5 * MIN);
  assert.equal(dead.form, 'kernel', 'a dead netling keeps whatever body it had');

  const future = cleanSave(
    stored({ ageMin: 100, lastRunEndAge: 1e9, lastNapEndAge: 1e9, nap: { startedAge: 1e9 }, event: { type: 'trace', startedAge: 1e9 }, hibernation: { since: T0 + 1e12 } }),
    T0 + 5 * MIN,
  );
  assert.equal(future.lastRunEndAge, 100);
  assert.equal(future.lastNapEndAge, 100);
  assert.equal(future.nap.startedAge, 100);
  assert.equal(future.event.startedAge, 100);
  assert.equal(future.hibernation.since, T0 + 5 * MIN);
});
