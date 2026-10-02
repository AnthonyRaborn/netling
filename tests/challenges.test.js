import './helpers/utc.js';
// Challenge runs: a rule for one run in the Deep or the Source, its reward kept at the exit.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { act, createScript, tick, mulberry32, CFG, MIN } from '../src/sim.js';
import { CHALLENGES, CHALLENGE_IDS, challengeOn, challengesOpen } from '../src/netrun/challenges.js';
import { abortRun, choose, moveTo, refreshMarket, resolveIce, runOptions, startRun, visibleNodeIds, RUN_CFG } from '../src/netrun/run.js';
import { nodeById } from '../src/netrun/map.js';
import { COSMETICS, unlockedIds } from '../src/cosmetics.js';
import { cleanProgress, cleanSave } from '../src/sanitize.js';
import { playRun, RUN_STYLES } from '../tools/netrun-bot.mjs';

const T0 = Date.UTC(2026, 8, 26, 12, 0);
const noRng = () => 0.999;

function adult(form = 'chrome') {
  const s = createScript({ now: T0, rng: mulberry32(1) });
  s.quirk.sleepOffset = 0;
  tick(s, T0 + CFG.bootMinutes * MIN, noRng);
  Object.assign(s, { stage: 'adult', form, teenForm: 'kernel' });
  Object.assign(s.stats, { charge: 100, sync: 90, integrity: 100, heat: 0 });
  return s;
}
// Starts a run under `challenge` and turns the first step into a node of `type`, then moves there.
function stepInto(s, type, challenge, region = 'deep', seed = 3) {
  startRun(s, region, mulberry32(seed), [], [], { challenge });
  const next = runOptions(s.run)[0];
  next.type = type;
  if (type === 'market') next.flavor = 'black';
  moveTo(s, next.id, mulberry32(seed));
  return next;
}
// Walks straight to the exit, picking the first option each step (ICE is won, choices take their first option).
function walkOut(s) {
  for (let i = 0; i < 40 && s.run.phase !== 'done'; i++) {
    if (s.run.phase === 'ice') resolveIce(s, true, noRng);
    else if (s.run.phase === 'choice') choose(s, s.run.pending.kind === 'relay' ? 'continue' : s.run.pending.options.at(-1).id, noRng);
    else {
      s.stats.charge = 100;
      s.stats.integrity = 100;
      s.stats.heat = 0;
      moveTo(s, runOptions(s.run)[0].id, noRng);
    }
  }
}

test('four challenges, kept only in the Deep and the Source, open after a Deep exit', () => {
  assert.deepEqual(CHALLENGE_IDS, ['glass', 'unplugged', 'blackout', 'baremetal']);
  assert.ok(CHALLENGES.every((c) => c.name && c.rule));
  for (const region of ['deep', 'source']) {
    const s = adult();
    startRun(s, region, mulberry32(1), [], [], { challenge: 'glass' });
    assert.equal(s.run.challenge, 'glass', region);
    assert.match(s.run.messages.join(' '), /challenge: GLASS/);
  }
  for (const [region, challenge] of [['public', 'glass'], ['ruins', 'blackout'], ['deep', 'nope'], ['deep', undefined]]) {
    const s = adult();
    startRun(s, region, mulberry32(1), [], [], { challenge });
    assert.equal(s.run.challenge, null, `${region} ${challenge}`);
  }
  assert.ok(!challengesOpen({}));
  assert.ok(!challengesOpen({ deepExits: 0 }));
  assert.ok(challengesOpen({ deepExits: 1 }), 'no Root Access needed');
});

test('Glass: a lost ICE fight cancels the challenge, and the run goes on', () => {
  const s = adult();
  stepInto(s, 'ice', 'glass');
  assert.equal(s.run.phase, 'ice');
  resolveIce(s, false, noRng);
  assert.equal(s.run.phase, 'map', 'the run continues');
  assert.equal(s.run.challengeVoid, true);
  assert.match(s.run.messages.at(-1), /challenge off: GLASS broken, an ICE fight was lost/);
  walkOut(s);
  assert.equal(s.run.result, 'jacked');
  assert.equal(s.run.challengeWon, false, 'broken, so the exit does not count');

  const kept = adult();
  stepInto(kept, 'ice', 'glass');
  resolveIce(kept, true, noRng);
  walkOut(kept);
  assert.equal(kept.run.challengeWon, true);
  assert.ok(kept.run.messages.some((m) => m === 'challenge complete: GLASS.'));
});

test('Unplugged: relays are dark, and jacking out at one does not count', () => {
  const s = adult('chrome');
  s.stats.charge = 50;
  s.stats.heat = 40;
  s.stats.integrity = 50;
  stepInto(s, 'relay', 'unplugged');
  assert.equal(s.run.pending.title, 'DARK RELAY');
  assert.equal(s.stats.charge, 50 - RUN_CFG.moveCharge, 'no charge');
  assert.equal(s.stats.heat, 40 + RUN_CFG.moveHeat, 'no venting');
  assert.equal(s.stats.integrity, 50, 'no corp patch for a Chrome');
  choose(s, 'out', noRng);
  assert.equal(s.run.result, 'jacked');
  assert.equal(s.run.challengeWon, false);

  const plain = adult();
  plain.stats.charge = 50;
  stepInto(plain, 'relay', null);
  assert.equal(plain.stats.charge, 50 - RUN_CFG.moveCharge + RUN_CFG.relayCharge, 'other runs are unchanged');
});

test('Blackout: only where it has been and one step ahead, whatever its form or reveals', () => {
  const s = adult('ghost');
  startRun(s, 'deep', mulberry32(2), [], [], { challenge: 'blackout' });
  const edges = nodeById(s.run.map, s.run.pos).edges;
  s.run.revealed = s.run.map.nodes.map((n) => n.id);
  assert.deepEqual([...visibleNodeIds(s)].sort(), [s.run.pos, ...edges].sort());
  const ghost = adult('ghost');
  startRun(ghost, 'deep', mulberry32(2));
  assert.equal(visibleNodeIds(ghost).size, ghost.run.map.nodes.length, 'a Ghost still sees everything otherwise');
});

test('Bare metal: buying or using an item cancels it, after a warning; accessories and selling are fine', () => {
  const s = adult();
  s.scrip = 500;
  stepInto(s, 'market', 'baremetal');
  const p = s.run.pending;
  const item = p.options.find((o) => o.id === 'buy0');
  assert.match(item.confirm, /ENDS BARE METAL/);
  assert.match(item.hint, /ends bare metal/);
  assert.equal(p.options.find((o) => o.id === 'buyacc')?.confirm, undefined, 'an accessory needs no warning');
  choose(s, 'buy0', noRng);
  assert.equal(s.run.challengeVoid, true);
  assert.match(s.run.messages.at(-1), /BARE METAL broken, an item was bought/);

  const acc = adult();
  acc.scrip = 500;
  for (let seed = 1; seed < 200; seed++) {
    stepInto(acc, 'market', 'baremetal', 'deep', seed);
    if (acc.run.pending.accOffer) break;
  }
  assert.ok(acc.run.pending.accOffer, 'found an accessory offer');
  choose(acc, 'buyacc', noRng);
  assert.equal(acc.run.challengeVoid, false, 'an accessory keeps it');

  // Using an item mid-run (the inventory stays usable) breaks it too.
  const u = adult();
  u.inventory = ['coolant'];
  u.stats.heat = 60;
  startRun(u, 'deep', mulberry32(1), [], [], { challenge: 'baremetal' });
  const res = act(u, 'use', u.lastTick, noRng, { slot: 0 });
  assert.ok(res.ok, res.msg);
  assert.match(res.msg, /bare metal broken/);
  assert.ok(!challengeOn(u.run, 'baremetal'));

  const other = adult();
  other.scrip = 500;
  stepInto(other, 'market', 'glass');
  refreshMarket(other);
  assert.ok(other.run.pending.options.every((o) => !o.confirm), 'no warnings under other challenges');
});

test('a disconnect or an abort never completes a challenge', () => {
  const s = adult('firewall'); // no corp insurance to catch it
  s.stats.integrity = 1;
  stepInto(s, 'ice', 'unplugged');
  resolveIce(s, false, noRng);
  assert.equal(s.run.result, 'disconnected');
  assert.equal(s.run.challengeWon, false);
  const a = adult();
  startRun(a, 'deep', mulberry32(1), [], [], { challenge: 'blackout' });
  abortRun(a);
  assert.equal(a.run.result, 'aborted');
  assert.equal(a.run.challengeWon, false);
});

test('each challenge has its reward, and Exit code 0 needs all four', () => {
  const ctx = (challenges) => ({ dex: [], codex: [], lineage: [], generation: 1, progress: { streaks: {}, acts: {}, challenges } });
  const rewards = { glass: 'crest:cracked', unplugged: 'shell:unplugged', blackout: 'tint:blackout', baremetal: 'effect:baremetal' };
  for (const [id, reward] of Object.entries(rewards)) {
    const got = unlockedIds(ctx([id]));
    assert.ok(got.includes(reward), id);
    assert.ok(!got.includes('music:exitzero'));
  }
  assert.ok(unlockedIds(ctx(CHALLENGE_IDS)).includes('music:exitzero'));
  assert.ok(!unlockedIds(ctx([])).some((id) => Object.values(rewards).includes(id)));
  assert.ok(COSMETICS.crest.find((c) => c.id === 'cracked').pixels.every((r) => r.length === 9));
});

test('stored challenge fields are cleaned', () => {
  const s = adult();
  startRun(s, 'deep', mulberry32(1), [], [], { challenge: 'glass' });
  s.run.challengeVoid = true;
  const kept = cleanSave(JSON.parse(JSON.stringify(s)), T0 + MIN);
  assert.equal(kept.run.challenge, 'glass');
  assert.equal(kept.run.challengeVoid, true);
  const bad = JSON.parse(JSON.stringify(s));
  bad.run.challenge = 'speedrun';
  bad.run.challengeWon = 'yes';
  const cleaned = cleanSave(bad, T0 + MIN);
  assert.equal(cleaned.run.challenge, null);
  assert.equal(cleaned.run.challengeWon, false);
  assert.deepEqual(cleanProgress({ challenges: ['glass', 'nope', 'glass', 'blackout'] }).challenges, ['glass', 'blackout']);
  assert.equal(cleanProgress({}).challenges, undefined);
});

test('the bot plays challenges: it pushes past relays while the challenge holds', () => {
  let won = 0;
  for (let seed = 1; seed <= 40; seed++) {
    const s = adult();
    playRun(s, { ...RUN_STYLES.careful, challenge: 'unplugged' }, 'deep', mulberry32(seed));
    assert.ok(s.run.result !== 'jacked' || s.run.map.nodes.find((n) => n.id === s.run.pos).type === 'exit', 'never banked at a relay');
    if (s.run.challengeWon) won++;
  }
  assert.ok(won > 0);
});
