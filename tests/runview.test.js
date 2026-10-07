// The netrun screen (RunView) around ICE that a form slips past. moveTo reports { kind: 'ice', phased: true } and leaves no
// fight pending, so the view must not start one: it once did, threw, and the pad's safety net aborted the run (loot lost).
import './helpers/utc.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { createScript, mulberry32 } from '../src/sim.js';
import { startRun } from '../src/netrun/run.js';
import { RunView } from '../src/netrun/view.js';

const NOW = Date.UTC(2026, 0, 5, 8, 0);

// The map is rolled with a fixed seed; `rng` drives the moves (so a test can force a slip).
function viewOn(form, rng) {
  const s = createScript({ now: NOW, rng: mulberry32(3) });
  s.stage = 'adult';
  s.form = form;
  s.ageMin = 5000;
  assert.ok(startRun(s, 'public', mulberry32(3), []).ok !== false);
  const sounds = [];
  return { s, sounds, view: new RunView(s, { rng, sound: (n) => sounds.push(n) }) };
}

// Presses A on the first ICE node the map offers.
function enterIce(view) {
  const k = view.options().findIndex((n) => n.type === 'ice');
  assert.ok(k >= 0, 'the first layer offers an ICE node');
  view.cursor = k;
  view.input('a');
}

test('a Glitch phases through its first ICE without the screen throwing or starting a fight', () => {
  const rng = mulberry32(3);
  const { s, view, sounds } = viewOn('glitch', rng);
  assert.doesNotThrow(() => enterIce(view));
  assert.equal(view.game, null, 'no mini-game starts');
  assert.equal(s.run.phase, 'map', 'the run goes on');
  assert.equal(s.run.tally.icePhased, 1);
  assert.ok(view.toast?.msg.includes('glitched'), 'the message shows');
  assert.ok(!sounds.includes('alert'), 'no alert for a fight that is not happening');
});

test('a Ghost that slips past ICE does not crash the screen either', () => {
  const { s, view } = viewOn('ghost', () => 0); // 0 is under the slip chance
  assert.doesNotThrow(() => enterIce(view));
  assert.equal(view.game, null);
  assert.equal(s.run.phase, 'map');
  assert.equal(s.run.tally.icePhased, 1);
});

test('ICE that is not phased still starts its fight', () => {
  const { s, view } = viewOn('chrome', mulberry32(3));
  enterIce(view);
  assert.equal(s.run.phase, 'ice');
  assert.ok(view.game, 'the mini-game starts');
});
