// The Rogue egg in the simulator fork, stage 3 (the lineage side): docs/NETLING_2_ROGUE_DRAFTS.md 6.1, items 11 to 14. A Source exit arms the good
// end, a clean one offers the merge at once, a mark after the latest Source exit disarms it, another exit re-arms it, and an armed elder's death is
// the good end, never after a capture. Deterministic: maps are built by hand and every roll is a stub.
import test from 'node:test';
import assert from 'node:assert/strict';
process.env.TZ = 'UTC';
const { createScript, tick, mulberry32, addMark, sourceExit, takeMerge, declineMerge, CFG, MIN } = await import('./sim/sim.js');
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

test('a clean Source exit arms the good end and offers the merge; one with a lost fight arms it without the offer', () => withKits(() => {
  const s = runTo(elder(), 'source', ['checkpoint']);
  assert.deepEqual([s.run.phase, s.run.result], ['done', 'jacked'], 'the exit jacked it out');
  assert.deepEqual(s.merge, { armed: true, exits: 1, clean: 1, disarmed: 0, declined: 0 });
  assert.equal(s.mergeOffer, true);
  const r = runTo(elder(), 'source', ['ice'], true);
  assert.equal(r.run.result, 'jacked');
  assert.equal(r.run.tally.iceLost, 1);
  assert.equal(r.merge.armed, true);
  assert.equal(r.merge.clean, 0);
  assert.equal(r.mergeOffer, false, 'a regular exit unlocks the good end but does not offer it');
}));

test('only a Rogue at the Source: an NL-0 elder at the Source and a Rogue at the Deep arm nothing', () => withKits(() => {
  assert.equal(runTo(elder('program', 'hiddenElder'), 'source', ['checkpoint']).merge, undefined);
  const d = elder();
  runTo(d, 'deep', ['checkpoint']);
  assert.equal(d.merge, undefined);
  assert.equal(d.mergeOffer, undefined);
}));

test('a mark after the latest Source exit disarms the good end and withdraws the offer; another exit re-arms it; marks stay', () => {
  const s = elder();
  sourceExit(s, T0, true);
  addMark(s, T0, 'sweep ignored');
  assert.equal(s.merge.armed, false);
  assert.equal(s.merge.disarmed, 1);
  assert.equal(s.mergeOffer, false);
  assert.equal(takeMerge(s, T0), false, 'the withdrawn offer cannot be taken');
  sourceExit(s, T0, false);
  assert.equal(s.merge.armed, true);
  assert.equal(s.marks, 1, 're-arming removes no mark');
  addMark(s, T0, 'trail hunter');
  assert.equal(s.merge.disarmed, 2);
  sourceExit(s, T0, true);
  assert.equal(s.mergeOffer, true, 'a clean exit offers the merge again');
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

test('declining keeps the good end armed, and the elder\'s death then plays it; an unarmed death is ordinary', () => {
  const s = elder();
  sourceExit(s, T0, true);
  assert.equal(declineMerge(s), true);
  assert.equal(s.mergeOffer, false);
  assert.deepEqual([s.merge.armed, s.merge.declined], [true, 1]);
  assert.equal(declineMerge(s), false, 'no offer left to decline');
  collapse(s);
  assert.deepEqual([s.stage, s.deathCause, s.goodEnd], ['dead', 'neglect', 'death']);
  const plain = elder();
  collapse(plain);
  assert.deepEqual([plain.deathCause, plain.goodEnd], ['neglect', null]);
  const disarmed = elder();
  sourceExit(disarmed, T0, false);
  addMark(disarmed, T0, 'sweep ignored');
  collapse(disarmed);
  assert.equal(disarmed.goodEnd, null, 'disarmed by a later mark');
});

test('never after a capture: the third mark disarms the good end and the capture is an ordinary death', () => {
  const s = elder();
  addMark(s, T0, 'sweep ignored');
  addMark(s, T0, 'sweep ignored');
  sourceExit(s, T0, false);
  addMark(s, T0, 'trail hunter');
  tick(s, s.lastTick + MIN, stub(0.99));
  assert.deepEqual([s.stage, s.deathCause, s.goodEnd], ['dead', 'captured', null]);
});

test('Root Access still reverses a premature death of an armed elder, which stays armed for its later death', () => {
  const s = elder();
  s.rootAccess = true;
  sourceExit(s, T0, false);
  collapse(s);
  assert.notEqual(s.stage, 'dead');
  assert.equal(s.rootUsed, true);
  assert.equal(s.merge.armed, true);
  collapse(s);
  assert.deepEqual([s.stage, s.goodEnd], ['dead', 'death']);
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

test('what follows a Rogue life: the chosen egg after the good end, Rogue again otherwise (or the first egg after a capture), Rogue after an NL-0 life', async () => {
  const { nextLife } = await import('./sim/rogue-line.js');
  const order = ['program', 'iron', 'wetware'];
  const latest = { program: { form: 'breachCorp' }, iron: { form: 'dodgeStreet' }, wetware: { form: 'feastCorp' } };
  const own = { form: 'rogueAdultTune' };
  assert.deepEqual(nextLife({ egg: 'rogue', goodEnd: 'exit', cause: 'merged', fragment: own }, { order, latest }), { egg: 'program', fragment: latest.program, why: 'merged' });
  assert.equal(nextLife({ egg: 'rogue', goodEnd: 'death', cause: 'neglect', fragment: own }, { order, latest, pick: 'last' }).egg, 'wetware');
  assert.deepEqual(nextLife({ egg: 'rogue', goodEnd: null, cause: 'captured', fragment: own }, { order, latest }), { egg: 'rogue', fragment: own, why: 'rogue again' });
  assert.equal(nextLife({ egg: 'rogue', goodEnd: null, cause: 'captured', fragment: own }, { order, latest, line: 'back' }).egg, 'program');
  assert.equal(nextLife({ egg: 'rogue', goodEnd: null, cause: 'neglect', fragment: own }, { order, latest, line: 'back' }).egg, 'rogue', 'back only after a capture');
  assert.deepEqual(nextLife({ egg: 'iron', cause: 'end of life cycle', fragment: latest.iron }, { order, latest }), { egg: 'rogue', fragment: latest.iron, why: 'rogue again' });
});
