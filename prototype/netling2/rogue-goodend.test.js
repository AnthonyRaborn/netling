// The Rogue egg in the simulator fork, stage 3 (the lineage side): docs/NETLING_2_ROGUE_DRAFTS.md 6.1, items 11 to 14 and 41 to 43. A clean Source
// exit arms the good end and offers the merge at once (one with a lost fight arms nothing), a mark after the latest arming disarms it, another clean
// exit re-arms it, and an armed elder's death is the good end, never after a capture. After it any egg can be chosen; an NL-0 egg hatches the mixed
// egg, whose parent is the Rogue. Deterministic: maps are built by hand and every roll is a stub.
import test from 'node:test';
import assert from 'node:assert/strict';
process.env.TZ = 'UTC';
const { createScript, tick, mulberry32, addMark, sourceExit, takeMerge, declineMerge, fragmentOf, lifeEnd, CFG, MIN, ROGUE, PERKS, INHERIT } = await import('./sim/sim.js');
const { startRun, moveTo, resolveIce } = await import('./sim/netrun/run.js');
const { NR2 } = await import('./sim/netrun/nr2.js');

const stub = (v) => () => v;
const T0 = Date.UTC(2026, 0, 5, 8, 0);
// A straight map: the entry, the given nodes one a layer, then the exit.
function chain(types, region) {
  const nodes = [{ id: 0, layer: 0, type: 'entry', edges: [1] }];
  types.forEach((t, i) => nodes.push({ id: i + 1, layer: i + 1, edges: [i + 2], ...(typeof t === 'string' ? { type: t } : t) }));
  nodes.push({ id: types.length + 1, layer: types.length + 1, type: 'exit', edges: [] });
  return { region, nodes, layerCount: types.length + 2 };
}
const elder = (egg = 'rogue', form = 'rogueElderBreach') => {
  const s = createScript({ now: T0, rng: mulberry32(3) });
  Object.assign(s, { egg, stage: 'mainframe', form, lastTick: T0, lightsOn: true });
  Object.assign(s.stats, { charge: 90, integrity: 90, heat: 30, sync: 60 });
  return s;
};
// Runs a hand-built map to its exit: types are the middle nodes; lose: lose every ICE fight met.
function runTo(s, region, types, lose = false) {
  const rng = mulberry32(5);
  startRun(s, region, rng, []);
  s.run.map = chain(types, region);
  s.run.pos = 0;
  s.run.visited = [0];
  for (let id = 1; id <= types.length + 1; id++) {
    moveTo(s, id, stub(0.99));
    if (s.run?.phase === 'ice') resolveIce(s, !lose, stub(0.99));
  }
  return s;
}
function withKits(fn) {
  const saved = [NR2.abilities, NR2.rogue.on];
  NR2.abilities = true;
  NR2.rogue.on = true;
  try {
    return fn();
  } finally {
    [NR2.abilities, NR2.rogue.on] = saved;
  }
}
// One minute at the care-mistake limit: a premature death (neglect).
const collapse = (s) => {
  s.careMistakes = CFG.maxMistakes;
  tick(s, s.lastTick + MIN, stub(0.99));
};
// The last minute of its life cycle: a full life.
const oldAge = (s) => {
  s.ageMin = lifeEnd(s) - 1;
  tick(s, s.lastTick + MIN, stub(0.99));
};

test('a clean Source exit arms the good end and offers the merge; one with a lost fight arms nothing', () => withKits(() => {
  const s = runTo(elder(), 'source', ['checkpoint']);
  assert.deepEqual([s.run.phase, s.run.result], ['done', 'jacked'], 'the exit jacked it out');
  assert.deepEqual(s.merge, { armed: true, exits: 1, clean: 1, disarmed: 0, declined: 0 });
  assert.equal(s.mergeOffer, true);
  const r = runTo(elder(), 'source', ['ice'], true);
  assert.equal(r.run.result, 'jacked');
  assert.equal(r.run.tally.iceLost, 1);
  assert.deepEqual(r.merge, { armed: false, exits: 1, clean: 0, disarmed: 0, declined: 0 }, 'only a clean exit arms (6.1, item 41)');
  assert.equal(r.mergeOffer, false);
}));

test('a Source exit with a lost fight leaves an armed good end armed; with armClean off (stage 3) it arms without the offer', () => {
  const s = elder();
  sourceExit(s, T0, true);
  declineMerge(s);
  sourceExit(s, T0, false);
  assert.deepEqual([s.merge.armed, s.mergeOffer, s.merge.exits], [true, false, 2]);
  const saved = ROGUE.armClean;
  ROGUE.armClean = false;
  try {
    const r = elder();
    sourceExit(r, T0, false);
    assert.deepEqual([r.merge.armed, r.mergeOffer], [true, false]);
  } finally {
    ROGUE.armClean = saved;
  }
});

test('only a Rogue at the Source: an NL-0 elder at the Source and a Rogue at the Deep arm nothing', () => withKits(() => {
  assert.equal(runTo(elder('program', 'hiddenElder'), 'source', ['checkpoint']).merge, undefined);
  const d = elder();
  runTo(d, 'deep', ['checkpoint']);
  assert.equal(d.merge, undefined);
  assert.equal(d.mergeOffer, undefined);
}));

test('a mark after the latest arming disarms the good end and withdraws the offer; only another clean exit re-arms it; marks stay', () => {
  const s = elder();
  sourceExit(s, T0, true);
  addMark(s, T0, 'sweep ignored');
  assert.equal(s.merge.armed, false);
  assert.equal(s.merge.disarmed, 1);
  assert.equal(s.mergeOffer, false);
  assert.equal(takeMerge(s, T0), false, 'the withdrawn offer cannot be taken');
  sourceExit(s, T0, false);
  assert.equal(s.merge.armed, false, 'an exit with a lost fight does not re-arm');
  sourceExit(s, T0, true);
  assert.equal(s.merge.armed, true);
  assert.equal(s.mergeOffer, true, 'a clean exit offers the merge again');
  assert.equal(s.marks, 1, 're-arming removes no mark');
  addMark(s, T0, 'trail hunter');
  assert.equal(s.merge.disarmed, 2);
  assert.deepEqual([s.merge.exits, s.merge.clean], [3, 2]);
});

test('taking the offer ends the life as the good end at the exit; Root Access does not reverse it, and the fragment is written', () => {
  const s = elder();
  s.rootAccess = true;
  sourceExit(s, T0, true);
  assert.equal(takeMerge(s, T0), true);
  assert.equal(s.stage, 'dead');
  assert.equal(s.deathCause, 'merged');
  assert.equal(s.goodEnd, 'exit');
  assert.equal(s.rootUsed, false);
  assert.equal(s.fragment.form, 'rogueAdultBreach');
  assert.equal(takeMerge(s, T0), false, 'once only');
});

test('declining keeps the good end armed, and the elder\'s death of old age then plays it; a premature or unarmed death is ordinary', () => {
  const s = elder();
  sourceExit(s, T0, true);
  assert.equal(declineMerge(s), true);
  assert.equal(s.mergeOffer, false);
  assert.deepEqual([s.merge.armed, s.merge.declined], [true, 1]);
  assert.equal(declineMerge(s), false, 'no offer left to decline');
  oldAge(s);
  assert.deepEqual([s.stage, s.deathCause, s.goodEnd], ['dead', 'end of life cycle', 'death']);
  const neglected = elder();
  sourceExit(neglected, T0, true);
  declineMerge(neglected);
  collapse(neglected);
  assert.deepEqual([neglected.deathCause, neglected.goodEnd], ['neglect', null], 'an armed elder\'s neglect death is not the good end (6.1, item 46)');
  const saved = ROGUE.goodEndFullLife;
  ROGUE.goodEndFullLife = false;
  try {
    const old = elder();
    sourceExit(old, T0, true);
    declineMerge(old);
    collapse(old);
    assert.equal(old.goodEnd, 'death', 'stage 3: any death but a capture');
  } finally {
    ROGUE.goodEndFullLife = saved;
  }
  const plain = elder();
  collapse(plain);
  assert.deepEqual([plain.deathCause, plain.goodEnd], ['neglect', null]);
  const disarmed = elder();
  sourceExit(disarmed, T0, true);
  declineMerge(disarmed);
  addMark(disarmed, T0, 'sweep ignored');
  collapse(disarmed);
  assert.equal(disarmed.goodEnd, null, 'disarmed by a later mark');
});

test('never after a capture: the third mark disarms the good end and the capture is an ordinary death', () => {
  const s = elder();
  addMark(s, T0, 'sweep ignored');
  addMark(s, T0, 'sweep ignored');
  sourceExit(s, T0, true);
  declineMerge(s);
  addMark(s, T0, 'trail hunter');
  tick(s, s.lastTick + MIN, stub(0.99));
  assert.deepEqual([s.stage, s.deathCause, s.goodEnd], ['dead', 'captured', null]);
});

test('Root Access still reverses a premature death of an armed elder, which stays armed for its later death', () => {
  const s = elder();
  s.rootAccess = true;
  sourceExit(s, T0, true);
  declineMerge(s);
  collapse(s);
  assert.notEqual(s.stage, 'dead');
  assert.equal(s.rootUsed, true);
  assert.equal(s.merge.armed, true);
  s.careMistakes = 0; // the rescue leaves it one mistake short of the limit
  oldAge(s);
  assert.deepEqual([s.stage, s.deathCause, s.goodEnd], ['dead', 'end of life cycle', 'death']);
});

test('the merge offer: one entry per NL-0 egg with a fragment, in page-completion order; the bot picks the first or the last', async () => {
  const { mergeOffer, pickEntry } = await import('./sim/rogue-line.js');
  const latest = { wetware: { form: 'tuneStreet' }, program: { form: 'hidden' } };
  const offer = mergeOffer(['iron', 'wetware', 'program'], latest);
  assert.deepEqual(offer.map((e) => e.egg), ['wetware', 'program'], 'iron has no adult or elder fragment yet');
  assert.equal(pickEntry(offer, 'first').fragment.form, 'tuneStreet');
  assert.equal(pickEntry(offer, 'last').egg, 'program');
  assert.equal(pickEntry([], 'first'), null);
  assert.throws(() => pickEntry(offer, 'best'));
});

test('what follows a Rogue life: any egg after the good end (an NL-0 one is the mixed egg, the Rogue its parent), Rogue again otherwise (or the first egg after a capture), Rogue after an NL-0 life', async () => {
  const { nextLife } = await import('./sim/rogue-line.js');
  const order = ['program', 'iron', 'wetware'];
  const latest = { program: { form: 'breachCorp' }, iron: { form: 'dodgeStreet' }, wetware: { form: 'feastCorp' } };
  const own = { form: 'rogueAdultTune' };
  assert.deepEqual(nextLife({ egg: 'rogue', goodEnd: 'exit', cause: 'merged', fragment: own }, { order, latest }), { egg: 'program', fragment: own, why: 'merged', mixed: true });
  assert.deepEqual(nextLife({ egg: 'rogue', goodEnd: 'exit', cause: 'merged', fragment: own }, { order, latest, parent: 'fragment' }).fragment, latest.program, 'stage 3\'s assumption, kept as a switch');
  assert.deepEqual(nextLife({ egg: 'rogue', goodEnd: 'death', cause: 'neglect', fragment: own }, { order, latest, pick: 'rogue' }), { egg: 'rogue', fragment: own, why: 'rogue again' }, 'Rogue again: no mixed egg');
  assert.throws(() => nextLife({ egg: 'rogue', goodEnd: 'exit', fragment: own }, { order, latest, parent: 'both' }));
  assert.equal(nextLife({ egg: 'rogue', goodEnd: null, cause: 'captured', fragment: { ...own, trait: 'persistent' } }, { order, latest, line: 'back' }).fragment.trait, null, 'Rogue to an NL-0 egg without a good end: no trait line');
  assert.equal(nextLife({ egg: 'rogue', goodEnd: 'death', cause: 'neglect', fragment: own }, { order, latest, pick: 'last' }).egg, 'wetware');
  assert.deepEqual(nextLife({ egg: 'rogue', goodEnd: null, cause: 'captured', fragment: own }, { order, latest }), { egg: 'rogue', fragment: own, why: 'rogue again' });
  assert.equal(nextLife({ egg: 'rogue', goodEnd: null, cause: 'captured', fragment: own }, { order, latest, line: 'back' }).egg, 'program');
  assert.equal(nextLife({ egg: 'rogue', goodEnd: null, cause: 'neglect', fragment: own }, { order, latest, line: 'back' }).egg, 'rogue', 'back only after a capture');
  assert.deepEqual(nextLife({ egg: 'iron', cause: 'end of life cycle', fragment: latest.iron }, { order, latest, goodEnds: 1 }), { egg: 'rogue', fragment: latest.iron, why: 'rogue again' });
});

test('the mixed egg continues the Rogue\'s trait as any rebirth does: a Rogue Mole\'s trait streaks into an NL-0 Breach adult', () => {
  const saved = PERKS.on;
  PERKS.on = true;
  try {
    const rogue = createScript({ now: T0, rng: mulberry32(3) });
    Object.assign(rogue, { egg: 'rogue', form: 'rogueAdultBreach' });
    const parent = fragmentOf(rogue, 'rogueAdultBreach');
    assert.ok(parent.trait, 'a Rogue adult leaves its role trait');
    const child = createScript({ now: T0, rng: mulberry32(4), fragment: parent });
    assert.equal(child.trait, parent.trait);
    assert.equal(fragmentOf(child, 'breachStreet').level, 2, 'the same trait in the next egg is a streak');
  } finally {
    PERKS.on = saved;
  }
});

test('crossings between Rogue and the NL-0 eggs (6.1, item 47): Rogue to Rogue always; Rogue to NL-0 the trait line only through the good end; nothing NL-0 to Rogue before a first good end, everything after', async () => {
  const { crossFragment } = await import('./sim/rogue-line.js');
  const f = { form: 'breachStreet', trait: 'hardened', level: 2, history: 'evasive', quirk: { a: 1 }, keepsake: 'repairKit', scrip: 4 };
  const none = { ...f, trait: null, level: 1, history: null };
  assert.equal(crossFragment('program', 'rogue', f, { goodEnds: 0 }), null, 'before the first good end nothing crosses into Rogue');
  assert.deepEqual(crossFragment('program', 'rogue', f, { goodEnds: 1 }), f);
  assert.deepEqual(crossFragment('rogue', 'rogue', f), f);
  assert.deepEqual(crossFragment('rogue', 'iron', f, { goodEnd: null, goodEnds: 3 }), none);
  assert.deepEqual(crossFragment('rogue', 'iron', f, { goodEnd: 'death' }), f);
  assert.deepEqual(crossFragment('iron', 'wetware', f), f, 'between NL-0 eggs as before');
  assert.deepEqual(crossFragment('program', 'rogue', f, { cross: 'open' }), f, 'stage 3');
  assert.throws(() => crossFragment('program', 'rogue', f, { cross: 'shut' }));
});

test('only a full life passes the trait line on (any egg): old age and the taken good end do, neglect and capture keep only quirk, keepsake and scrip', () => {
  const saved = PERKS.on;
  PERKS.on = true;
  try {
    const parent = (egg, form) => {
      const s = elder(egg, form);
      Object.assign(s, { trait: 'hardened', traitLevel: 1, history: 'evasive', scrip: 6 });
      return s;
    };
    const old = parent('program', 'breachStreet');
    old.stage = 'adult';
    oldAge(old);
    assert.equal(old.deathCause, 'end of life cycle');
    assert.deepEqual([old.fragment.trait, old.fragment.level, old.fragment.history], ['hardened', 2, 'hardened'], 'a full adult life: the streak goes on');
    const neglected = parent('program', 'breachStreet');
    neglected.stage = 'adult';
    collapse(neglected);
    assert.equal(neglected.deathCause, 'neglect');
    assert.deepEqual([neglected.fragment.trait, neglected.fragment.level, neglected.fragment.history], [null, 1, null]);
    assert.ok(neglected.fragment.quirk && neglected.fragment.keepsake && neglected.fragment.scrip > 0, 'quirk, keepsake and scrip still pass');
    const caught = parent('rogue', 'rogueElderBreach');
    caught.marks = 2;
    addMark(caught, T0, 'trail hunter');
    tick(caught, caught.lastTick + MIN, stub(0.99));
    assert.deepEqual([caught.deathCause, caught.fragment.trait], ['captured', null]);
    const merged = parent('rogue', 'rogueElderBreach');
    sourceExit(merged, T0, true);
    takeMerge(merged, T0);
    assert.equal(merged.fragment.trait, 'hardened', 'the good end at the exit is a full life');
    INHERIT.fullLife = false;
    const before = parent('program', 'breachStreet');
    before.stage = 'adult';
    collapse(before);
    assert.equal(before.fragment.trait, 'hardened', 'INHERIT off: the earlier rule');
  } finally {
    PERKS.on = saved;
    INHERIT.fullLife = true;
  }
});
