// The Rogue egg in the simulator fork, stage 1 (home life): docs/NETLING_2_ROGUE_DRAFTS.md, sections 6, 7 and 9. A per-life egg (s.egg 'rogue'):
// no Standing, one teen, the adult by most wins, the sweep in place of the trace and the intrusion, marks and capture, Rogue's perks, traits and
// keepsakes, and in runs each role's base ability plus the checkpoint part. Deterministic: every test injects the clock and the rng.
import test from 'node:test';
import assert from 'node:assert/strict';
process.env.TZ = 'UTC';
const { createScript, tick, act, mulberry32, ROGUE, isRogue, FORMS, KEEPSAKES, PERKS, MAINFRAME_OF, SPECIES, marketScrip, addMark, CFG, MIN } = await import('./sim/sim.js');
const { startRun, moveTo, runOptions, visibleNodeIds } = await import('./sim/netrun/run.js');
const { NR2 } = await import('./sim/netrun/nr2.js');

const T0 = Date.UTC(2026, 0, 5, 8, 0); // 08:00 UTC, awake
const fresh = (form = 'rogueAdultBreach', extra = {}) => {
  const s = createScript({ now: T0, rng: mulberry32(1) });
  s.egg = 'rogue';
  s.stage = 'adult';
  s.form = form;
  s.quirk.sleepOffset = 0;
  s.quirk.favPacket = 'none';
  s.lightsOn = true;
  s.stats = { charge: 80, sync: 60, integrity: 80, heat: 20 };
  s.lastTick = T0;
  Object.assign(s, extra);
  return s;
};
const perks = (fn) => {
  PERKS.on = true;
  try {
    return fn();
  } finally {
    PERKS.on = false;
  }
};
const stub = (v) => () => v;
const sweep = (s, minutesAgo = 0) => {
  s.event = { type: 'sweep', startedAge: s.ageMin - minutesAgo, window: ROGUE.sweepWindowMin };
};

test('off by default: no netling is Rogue unless its egg says so, and the numbers are the drafted ones', () => {
  assert.equal(ROGUE.on, false);
  assert.equal(isRogue(createScript({ now: T0, rng: mulberry32(1) })), false);
  assert.deepEqual([ROGUE.sweepChance, ROGUE.sweepWindowMin, ROGUE.sweepIntegrity, ROGUE.captureAt], [0.12, 90, 20, 3]);
  assert.equal(CFG.sweepWindowMin, 90);
});

test('the sweep takes the trace slot; an NL-0 netling still meets the trace', () => {
  const rogue = fresh();
  tick(rogue, T0 + MIN, stub(0));
  assert.equal(rogue.event?.type, 'sweep');
  const nl0 = fresh('breachStreet', { egg: 'program' });
  tick(nl0, T0 + MIN, stub(0));
  assert.equal(nl0.event?.type, 'trace');
});

test('Rogue never meets an intrusion', () => {
  const saved = [ROGUE.sweepChance, CFG.traceChancePerHour];
  ROGUE.sweepChance = 0;
  CFG.traceChancePerHour = 0;
  try {
    // 0.0005 a minute: under the intrusion's 0.04 / 60, over the hourly infection roll (an infected netling meets no intrusion).
    const nl0 = fresh('breachStreet', { egg: 'program' });
    tick(nl0, T0 + MIN, stub(0.0005));
    assert.equal(nl0.event?.type, 'attack', 'the same rolls give an NL-0 netling an intrusion');
    const s = fresh();
    tick(s, T0 + MIN, stub(0.0005));
    assert.notEqual(s.event?.type, 'attack');
  } finally {
    [ROGUE.sweepChance, CFG.traceChancePerHour] = saved;
  }
});

test('a sweep left to run out costs Integrity 20 and a mark; Mole loses 10 and still takes the mark', () => {
  const s = fresh('rogueAdultDodge');
  sweep(s, ROGUE.sweepWindowMin - 1);
  tick(s, T0 + MIN, stub(0.99));
  assert.equal(s.event, null);
  assert.equal(s.marks, 1);
  assert.equal(s.markSources['sweep ignored'], 1);
  assert.ok(s.stats.integrity <= 60.5 && s.stats.integrity >= 59, `integrity ${s.stats.integrity}`);
  perks(() => {
    const m = fresh('rogueAdultBreach');
    sweep(m, ROGUE.sweepWindowMin - 1);
    tick(m, T0 + MIN, stub(0.99));
    assert.equal(m.marks, 1);
    assert.ok(m.stats.integrity >= 69 && m.stats.integrity <= 70.5, `integrity ${m.stats.integrity}`);
  });
});

test('answers: HIDE ends a sweep with no mark; COMPLY is refused; DEFEND won ends it, lost costs Integrity and a mark but no virus', () => {
  const h = fresh();
  sweep(h);
  const r = act(h, 'hide', T0, stub(0.99));
  assert.ok(r.ok);
  assert.equal(h.event, null);
  assert.equal(h.marks ?? 0, 0);
  assert.deepEqual([h.stats.charge, h.stats.heat], [70, 30]);
  const c = fresh();
  sweep(c);
  assert.equal(act(c, 'comply', T0, stub(0.99)).ok, false);
  assert.equal(c.event.type, 'sweep');
  const w = fresh();
  sweep(w);
  act(w, 'defend', T0, stub(0.99), { won: true });
  assert.equal(w.event, null);
  assert.equal(w.marks ?? 0, 0);
  const l = fresh('rogueAdultDodge');
  sweep(l);
  act(l, 'defend', T0, stub(0.99), { won: false });
  assert.equal(l.marks, 1);
  assert.equal(l.markSources['defend lost'], 1);
  assert.equal(l.stats.integrity, 60);
  assert.equal(Boolean(l.virus), false);
});

test('a Decoy waves off the open sweep, or the next one', () => {
  const s = fresh();
  s.inventory = ['decoy'];
  sweep(s);
  act(s, 'use', T0, stub(0.99), { slot: 0 });
  assert.equal(s.event, null);
  const n = fresh();
  n.inventory = ['decoy'];
  act(n, 'use', T0, stub(0.99), { slot: 0 });
  tick(n, T0 + MIN, stub(0));
  assert.equal(n.event, null, 'the pre-cleared sweep does not open');
  assert.equal(n.buffs.attackSkip, false);
});

test('three marks: captured, and Root Access does not reverse it', () => {
  const s = fresh('rogueAdultFeast', { rootAccess: true });
  for (let i = 0; i < 3; i++) addMark(s, T0, 'defend lost');
  tick(s, T0 + MIN, stub(0.99));
  assert.equal(s.stage, 'dead');
  assert.equal(s.deathCause, 'captured');
  assert.equal(Boolean(s.rootUsed), false);
});

test('no Standing: whatever an action adds is gone the next minute', () => {
  const s = fresh();
  s.standing = { corp: 0, street: 0 };
  sweep(s);
  act(s, 'hide', T0, stub(0.99));
  tick(s, T0 + MIN, stub(0.99));
  assert.deepEqual(s.standing, { corp: 0, street: 0 });
});

test('forms: one teen, the adult by most wins with no lean, the elder through MAINFRAME_OF', () => {
  const b = fresh('baby', { stage: 'baby' });
  b.ageMin = b.life.teenAt - 1;
  tick(b, T0 + MIN, stub(0.99));
  assert.equal(b.form, 'rogueTeen');
  const t = fresh('rogueTeen', { stage: 'teen' });
  t.ageMin = t.life.adultAt - 1;
  t.games = { breach: { played: 20, won: 2 }, dodge: { played: 20, won: 3 }, tune: { played: 30, won: 15 }, feast: { played: 10, won: 1 } };
  tick(t, T0 + MIN, stub(0.99));
  assert.equal(t.form, 'rogueAdultTune');
  for (const r of ['Breach', 'Dodge', 'Tune', 'Feast']) {
    assert.equal(MAINFRAME_OF[`rogueAdult${r}`], `rogueElder${r}`);
    assert.equal(SPECIES[`rogueElder${r}`].stage, 'mainframe');
  }
  assert.deepEqual(['rogueAdultBreach', 'rogueAdultDodge', 'rogueAdultTune', 'rogueAdultFeast'].map((f) => SPECIES[f].name), ['Mole', 'Skip', 'Spook', 'Drop']);
});

test('traits by role and the keepsakes, with PERKS on', () => {
  perks(() => {
    assert.deepEqual(['rogueAdultBreach', 'rogueAdultDodge', 'rogueAdultTune', 'rogueAdultFeast'].map((f) => FORMS[f].trait), ['hardened', 'evasive', 'persistent', 'foraging']);
    assert.deepEqual(['rogueAdultBreach', 'rogueAdultDodge', 'rogueAdultTune', 'rogueAdultFeast'].map((f) => KEEPSAKES[f]), ['repair', 'decoy', 'booster', 'salvage']);
  });
});

test('perks: Skip meets sweeps 30% less often; Drop pays 30% less scrip at a market; Evasive lengthens the sweep window', () => {
  // A roll of 0.0015 a minute: under the plain sweep chance (0.12 / 60 = 0.002), over Skip's (0.0014).
  perks(() => {
    const mole = fresh('rogueAdultBreach');
    tick(mole, T0 + MIN, stub(0.0015));
    assert.equal(mole.event?.type, 'sweep');
    const skip = fresh('rogueAdultDodge');
    tick(skip, T0 + MIN, stub(0.0015));
    assert.notEqual(skip.event?.type, 'sweep');
    assert.equal(marketScrip(fresh('rogueAdultFeast'), 15), 11);
    assert.equal(marketScrip(fresh('rogueAdultTune'), 15), 15);
    const ev = fresh('rogueAdultDodge', { trait: 'evasive', traitLevel: 1 });
    tick(ev, T0 + MIN, stub(0));
    assert.equal(ev.event.window, Math.round(90 * 1.25));
  });
});

test('Untraceable cuts the sweep for a Rogue', () => {
  // Untraceable at strength 1 removes 60%: 0.002 a minute falls to 0.0008.
  const s = fresh('rogueAdultTune', { trait: 'untraceable', traitLevel: 1 });
  tick(s, T0 + MIN, stub(0.001));
  assert.notEqual(s.event?.type, 'sweep');
  const p = fresh('rogueAdultTune');
  tick(p, T0 + MIN, stub(0.001));
  assert.equal(p.event?.type, 'sweep');
});

test('runs: a Rogue adult is never noticed at checkpoints and runs on its role base ability (stand-in)', () => {
  const saved = NR2.abilities;
  NR2.abilities = true;
  try {
    const setup = (form, type) => {
      const rng = mulberry32(5);
      const s = createScript({ now: 0, rng });
      s.egg = 'rogue';
      s.stage = 'adult';
      s.form = form;
      Object.assign(s.stats, { charge: 90, integrity: 90, heat: 30 });
      startRun(s, 'corp', rng, []);
      const node = runOptions(s.run)[0];
      node.type = type;
      return { s, node };
    };
    for (const f of ['rogueAdultBreach', 'rogueAdultDodge', 'rogueAdultTune', 'rogueAdultFeast']) {
      const { s, node } = setup(f, 'checkpoint');
      assert.equal(moveTo(s, node.id, stub(0.99)).auto, true, f);
    }
    assert.ok(visibleNodeIds(setup('rogueAdultTune', 'cache').s).size > visibleNodeIds(setup('rogueAdultBreach', 'cache').s).size, 'Spook sees further (Lookahead)');
    assert.equal(NR2.rogueBase.rogueAdultDodge, 'dodgeStreet');
  } finally {
    NR2.abilities = saved;
  }
});
