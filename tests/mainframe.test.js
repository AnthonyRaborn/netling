import './helpers/utc.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createScript, fragmentOf, lifeEnd, lineOf, mainframeAt, mainframeDue, mainframeFeat, migrate, mulberry32, tick, isMainframeForm,
  CFG, FORMS, LEGACY_LIFE, MAINFRAME_OF, MIN, SPECIES, TRAIT_CFG,
} from '../src/sim.js';
import { cleanSave, cleanLineage } from '../src/sanitize.js';
import { chatterPool, chatterProgress, shownChatter } from '../src/chatter.js';
import { deathRecord, dexEntries, formsSeenIn } from '../src/archive.js';
import { moveTo, runOptions, startRun, RUN_CFG } from '../src/netrun/run.js';
import { regionLock } from '../src/netrun/regions.js';
import { SPRITES, ANCHOR_ROWS } from '../src/sprites.js';
import { poseDistance, silhouetteIou } from '../tools/lib/sprite-checks.mjs';

// The Mainframe stage (docs/SOURCE_PLAN.md): the rules, behind CFG.mainframe until its art and UI land.
const T0 = Date.UTC(2026, 8, 26, 12, 0);
const noRng = () => 0.999;
const DAY = 24 * 60;

function adult(form = 'chrome') {
  const s = createScript({ now: T0, rng: mulberry32(1) });
  s.quirk.sleepOffset = 0;
  tick(s, T0 + CFG.bootMinutes * MIN, noRng);
  Object.assign(s, { stage: 'adult', form, teenForm: 'kernel', rootAccess: true }); // the stage needs Root Access
  Object.assign(s.stats, { charge: 90, sync: 90, integrity: 100, heat: 10 });
  return s;
}
// Ticks `minutes` netling minutes from where it is.
const run = (s, minutes) => tick(s, s.lastTick + minutes * MIN, noRng);
// Runs `fn` with the stage switched on, then switches it back off.
function switchedOn(fn) {
  CFG.mainframe = true;
  try {
    return fn();
  } finally {
    CFG.mainframe = false;
  }
}

test('each adult form has one mainframe form, and every mainframe form names its line', () => {
  assert.deepEqual(MAINFRAME_OF, { chrome: 'plat', firewall: 'airgap', daemon: 'init', glitch: 'panic', ghost: 'whisper' });
  for (const [line, form] of Object.entries(MAINFRAME_OF)) {
    assert.equal(SPECIES[form].stage, 'mainframe');
    assert.equal(lineOf(form), line);
    assert.ok(FORMS[line], `${line} is an adult form`);
  }
  assert.equal(lineOf('chrome'), 'chrome');
  assert.equal(lineOf('kernel'), 'kernel');
  assert.equal(CFG.mainframe, false, 'switched off until its art and UI land');
});

test('the gate: an adult, home, into its last ordinary day, with three Deep exits or two clean', () => {
  const s = adult();
  s.deepExits = { all: 3, clean: 0 };
  s.ageMin = mainframeAt(s);
  assert.equal(mainframeAt(s), s.life.lifespan - CFG.mainframeBeforeEndMin);
  assert.equal(mainframeDue(s), true);
  assert.equal(mainframeDue({ ...s, ageMin: s.ageMin - 1 }), false, 'too young');
  assert.equal(mainframeFeat({ deepExits: { all: 2, clean: 1 } }), false, 'two exits, one clean: not yet');
  assert.equal(mainframeFeat({ deepExits: { all: 2, clean: 2 } }), true, 'two clean exits');
  assert.equal(mainframeFeat({}), false, 'no Deep exits');
  assert.equal(mainframeDue({ ...s, run: { region: 'deep' } }), false, 'not mid-run');
  assert.equal(mainframeDue({ ...s, stage: 'teen' }), false, 'adults only');
  assert.equal(mainframeDue({ ...s, stage: 'mainframe', form: 'plat' }), false, 'only once');
  assert.equal(mainframeAt({ life: LEGACY_LIFE }), 6 * DAY, 'a seven-day life: its last day too');
});

test('switched off, an adult that meets the gate stays an adult and dies on time', () => {
  const s = adult();
  s.deepExits = { all: 3, clean: 3 };
  s.ageMin = mainframeAt(s) - 1;
  run(s, 5);
  assert.equal(s.stage, 'adult');
  assert.equal(s.lifeBonus, 0);
  s.ageMin = s.life.lifespan - 1;
  run(s, 3);
  assert.equal(s.deathCause, 'end of life cycle');
});

test('feat first: it recompiles into its line\'s mainframe form at the last ordinary day, and gains a day', () =>
  switchedOn(() => {
    for (const [line, form] of Object.entries(MAINFRAME_OF)) {
      const s = adult(line);
      s.deepExits = { all: 1, clean: 2 };
      s.ageMin = mainframeAt(s) - 3;
      run(s, 2);
      assert.equal(s.stage, 'adult', `${line}: not before the age half`);
      run(s, 2);
      assert.equal(s.stage, 'mainframe');
      assert.equal(s.form, form);
      assert.equal(s.lifeBonus, CFG.mainframeBonusMin);
      assert.equal(lifeEnd(s), s.life.lifespan + CFG.mainframeBonusMin);
      assert.ok(s.log.some((l) => l.msg.includes(`now ${SPECIES[form].name.toUpperCase()}`)));
    }
  }));

test('age first: it waits for the feat, and never recompiles mid-run', () =>
  switchedOn(() => {
    const s = adult('daemon');
    s.deepExits = { all: 2, clean: 1 };
    s.ageMin = mainframeAt(s) + 60;
    run(s, 5);
    assert.equal(s.stage, 'adult', 'no feat yet');
    s.deepExits = { all: 3, clean: 1 };
    s.run = { region: 'deep' };
    run(s, 5);
    assert.equal(s.stage, 'adult', 'still out on a run');
    s.run = null;
    run(s, 2);
    assert.equal(s.form, 'init');
  }));

test('a mainframe lives its extra day, then ends of old age', () =>
  switchedOn(() => {
    const s = adult('ghost');
    s.deepExits = { all: 3, clean: 0 };
    s.ageMin = mainframeAt(s);
    run(s, 2);
    assert.equal(s.form, 'whisper');
    s.ageMin = s.life.lifespan + 10;
    run(s, 5);
    assert.equal(s.stage, 'mainframe', 'past the ordinary lifespan, still running');
    s.ageMin = lifeEnd(s) - 1;
    run(s, 3);
    assert.equal(s.deathCause, 'end of life cycle');
    assert.equal(s.form, 'whisper', 'it dies in its own body');
    assert.equal(s.fragment.form, 'ghost', 'and leaves its line\'s fragment');
  }));

test('the Deep exit counter: exits count, clean ones too; relays and other regions do not', () => {
  const s = adult('firewall');
  const exitStep = (region, iceLost) => {
    startRun(s, region, mulberry32(4));
    s.run.tally.iceLost = iceLost;
    const next = runOptions(s.run)[0];
    next.type = 'exit';
    moveTo(s, next.id, noRng);
    s.stats.charge = 90;
    s.lastRunEndAge = -1e6; // the uplink is ready again
  };
  exitStep('deep', 0);
  assert.deepEqual(s.deepExits, { all: 1, clean: 1 });
  exitStep('deep', 1);
  assert.deepEqual(s.deepExits, { all: 2, clean: 1 });
  exitStep('ruins', 0);
  assert.deepEqual(s.deepExits, { all: 2, clean: 1 }, 'only The Deep');
  startRun(s, 'deep', mulberry32(4));
  const next = runOptions(s.run)[0];
  next.type = 'relay';
  moveTo(s, next.id, noRng);
  assert.equal(s.run.pending.kind, 'relay');
  assert.deepEqual(s.deepExits, { all: 2, clean: 1 }, 'a relay is not an exit');
  assert.deepEqual(createScript({ now: T0, rng: mulberry32(2) }).deepExits, { all: 0, clean: 0 }, 'each life starts at zero');
});

test('a mainframe keeps its line\'s netrun ability and can enter every region an adult can', () => {
  const s = adult('chrome');
  Object.assign(s, { stage: 'mainframe', form: 'plat', cleared: ['public', 'bazaar', 'corp', 'ruins'] });
  s.stats.integrity = 40;
  startRun(s, 'deep', mulberry32(4));
  const next = runOptions(s.run)[0];
  next.type = 'relay';
  moveTo(s, next.id, noRng);
  assert.equal(s.stats.integrity, 40 + RUN_CFG.platRelayRepair, 'corp relays still patch it, more than a Chrome');
  assert.equal(regionLock('ruins', 'mainframe', [], ['public', 'bazaar', 'corp']), null);
});

test('a mainframe passes its trait on at level II or higher', () => {
  const s = adult('daemon');
  Object.assign(s, { stage: 'mainframe', form: 'init', trait: 'licensed', traitLevel: 1 });
  assert.equal(fragmentOf(s, 'daemon').level, Math.min(CFG.mainframeTraitLevel, TRAIT_CFG.maxLevel), 'no streak: still level II');
  s.trait = 'persistent';
  s.traitLevel = 2;
  assert.equal(fragmentOf(s, 'daemon').level, 3, 'a streak still climbs');
  Object.assign(s, { stage: 'adult', form: 'daemon', trait: 'licensed' });
  assert.equal(fragmentOf(s, 'daemon').level, 1, 'an adult without a streak: level I');
});

test('saves: the new stage and fields are cleaned and made to agree', () => {
  const base = () => JSON.parse(JSON.stringify(adult('glitch')));
  const now = T0 + 10 * MIN;
  const m = cleanSave({ ...base(), stage: 'mainframe', form: 'glitch', lifeBonus: CFG.mainframeBonusMin }, now);
  assert.equal(m.form, 'panic', 'a mainframe in an adult body takes its line\'s mainframe form');
  assert.equal(m.lifeBonus, CFG.mainframeBonusMin);
  const a = cleanSave({ ...base(), form: 'panic', lifeBonus: CFG.mainframeBonusMin }, now);
  assert.equal(a.form, 'glitch', 'an adult in a mainframe body goes back to its line');
  assert.equal(a.lifeBonus, 0, 'and has no extra day');
  assert.equal(cleanSave({ ...base(), stage: 'mainframe', form: 'panic', lifeBonus: 99999 }, now).lifeBonus, 0, 'only the real bonus');
  assert.deepEqual(cleanSave({ ...base(), deepExits: { all: 2, clean: 9 } }, now).deepExits, { all: 2, clean: 2 });
  assert.deepEqual(cleanSave({ ...base(), deepExits: 'x' }, now).deepExits, { all: 0, clean: 0 });
  const old = base();
  delete old.deepExits;
  delete old.lifeBonus;
  assert.deepEqual(migrate(old).deepExits, { all: 0, clean: 0 });
  assert.equal(migrate(old).lifeBonus, 0);
});

test('the lineage remembers a mainframe body, and the dex shows mainframe forms only when switched on', () => {
  const s = adult('ghost');
  Object.assign(s, { stage: 'mainframe', form: 'whisper', fragment: fragmentOf({ ...s, form: 'whisper' }, 'ghost') });
  const rec = deathRecord(s);
  assert.equal(rec.form, 'ghost');
  assert.equal(rec.realized, true);
  assert.equal(rec.mainframe, 'whisper');
  assert.equal(cleanLineage([rec])[0].mainframe, 'whisper');
  assert.equal(cleanLineage([{ ...rec, mainframe: 'ghost' }])[0].mainframe, null, 'not a mainframe form');
  assert.ok(formsSeenIn({ stage: 'script' }, [rec]).includes('whisper'));
  assert.ok(!dexEntries([]).some((e) => isMainframeForm(e.id)), 'hidden while off');
  switchedOn(() => {
    const whisper = dexEntries(['whisper']).find((e) => e.id === 'whisper');
    assert.equal(whisper.name, 'Whisper');
    assert.equal(whisper.trait, 'Untraceable', 'its line\'s trait');
    assert.ok(whisper.runAbility);
  });
});

test('mainframe art: its own sprites, no taller than the tallest adult; wider than its line, but Whisper smaller and fading', () => {
  const adultRows = Math.max(...Object.keys(SPECIES).filter((f) => SPECIES[f].stage === 'adult').map((f) => SPRITES[`${f}A`].length));
  for (const form of Object.keys(SPECIES).filter(isMainframeForm)) {
    const line = lineOf(form);
    for (const pose of ['A', 'B', 'Sleep', 'Dead']) {
      const rows = SPRITES[`${form}${pose}`];
      assert.ok(rows && rows !== SPRITES[`${line}${pose}`], `${form}${pose} is its own`);
      assert.ok(rows.every((r) => r.length === (form === 'whisper' ? 14 : 18)), `${form}${pose}: its width`);
      assert.ok(rows.length <= adultRows, `${form}${pose}: room for a hat above it`);
    }
    assert.ok(ANCHOR_ROWS[form] && ANCHOR_ROWS[form] !== ANCHOR_ROWS[line], `${form} has its own anchors`);
    // Closer to its own line than to any other adult. The Glitch line is torn on purpose and its rows shift between
    // frames, so a centred overlap says little about it; Panic is checked by how much it shifts instead. Whisper is a
    // Ghost thinning away, checked by its size and its fading tail below.
    if (line === 'glitch' || line === 'ghost') continue;
    const own = silhouetteIou(SPRITES[`${form}A`], SPRITES[`${line}A`]);
    for (const other of Object.keys(SPECIES).filter((f) => SPECIES[f].stage === 'adult' && f !== line)) {
      assert.ok(own > silhouetteIou(SPRITES[`${form}A`], SPRITES[`${other}A`]), `${form} looks more like ${other} than ${line}`);
    }
  }
  const cells = (key) => SPRITES[key].join('').replace(/\./g, '').length;
  assert.ok(cells('whisperA') < 0.85 * cells('ghostA'), 'Whisper is smaller than a Ghost');
  assert.ok(SPRITES.whisperA.slice(-4).every((r) => r.includes('x')), 'its tail fades into faint wisp cells');
  const shift = (form) => poseDistance(SPRITES[`${form}A`], SPRITES[`${form}B`]);
  for (const form of ['plat', 'airgap', 'init', 'whisper']) assert.ok(shift('panic') > 2 * shift(form), `Panic jumps between frames more than ${form}`);
});

test('visitors come as mainframe forms only once the stage is switched on, and only to a line with root', () => {
  const visitors = (root = true) => {
    const seen = new Set();
    const chance = CFG.visitChancePerHour;
    CFG.visitChancePerHour = 60 * 60; // a visit every minute it can
    try {
      for (let seed = 1; seed <= 300; seed++) {
        const s = adult('chrome');
        Object.assign(s, { rootAccess: root, rootCooling: false });
        s.visit = null;
        tick(s, s.lastTick + 2 * MIN, mulberry32(seed));
        if (s.visit) seen.add(s.visit.form);
      }
    } finally {
      CFG.visitChancePerHour = chance;
    }
    return [...seen];
  };
  const off = visitors();
  assert.ok(off.length >= 5, `visits happened: ${off}`);
  assert.ok(!off.some(isMainframeForm), `no mainframe visitors while off: ${off}`);
  assert.ok(switchedOn(visitors).some(isMainframeForm), 'some once on');
  assert.ok(!switchedOn(() => visitors(false)).some(isMainframeForm), 'none before Root Access: they would give away a corrupted record');
});

test('a mainframe speaks its line\'s chatter, and one line of its own about NL-0', () => {
  const s = adult('daemon');
  const daemonLines = chatterPool(s, 'daemon').map((c) => c.id);
  assert.ok(daemonLines.length > 0 && !daemonLines.includes('lin-quiet'), 'an adult never says it');
  Object.assign(s, { stage: 'mainframe', form: 'init' });
  assert.deepEqual(chatterPool(s, lineOf(s.form)).map((c) => c.id), [...daemonLines, 'lin-quiet']);
  // Switched off, the Archive neither lists nor counts it, so the Speech mark never waits on a line nobody can hear.
  assert.ok(!shownChatter(false).some((c) => c.id === 'lin-quiet') && shownChatter(true).some((c) => c.id === 'lin-quiet'));
  const lineage = shownChatter(false).filter((c) => c.group === 'lineage').map((c) => c.id);
  assert.deepEqual(chatterProgress(lineage, shownChatter(false)).lineage, { heard: lineage.length, total: lineage.length });
});
