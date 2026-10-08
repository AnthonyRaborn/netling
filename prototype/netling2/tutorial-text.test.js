// The tutorial wording drafts (tutorial-text.js): shape rules, and that each egg is its own voice, not a copy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TUTORIAL_TEXT, TUTORIAL_EGGS, TIP_KEYS, HINT_KEYS, LOG_KEYS, checkTutorialText, tutorialLog, TIP_WIDTH, HINT_WIDTH } from './tutorial-text.js';

test('the drafts pass every rule: widths, case, no digits or dashes, each tip teaches its point, the gift points to the Archive', () => {
  assert.deepEqual(checkTutorialText(), []);
});

test('the check catches what it should', () => {
  const bad = JSON.parse(JSON.stringify(TUTORIAL_TEXT));
  bad.iron.tips.ice[0] = 'ICE IS A LOCKOUT. clear the mini-game, or it hammers integrity more than anything.';
  bad.program.hints.cache = 'holds 1 item — maybe, if you are lucky with the roll.';
  bad.wetware.tips.relayChoice = ['CONTINUE to reach the exit.', 'stop here to end the run.'];
  bad.wetware.gift = 'a gift: party hat.';
  delete bad.program.log.exit;
  const problems = checkTutorialText(bad);
  for (const re of [/iron.tips.ice\[0\]: \d+ characters/, /iron.tips.ice\[0\]: capitals/, /program.hints.cache: a digit/, /program.hints.cache: a dash/, /wetware.tips.relayChoice: missing/, /wetware.gift: must point/, /program.log.exit: empty/]) {
    assert.ok(problems.some((p) => re.test(p)), `not caught: ${re}`);
  }
});

test('three voices: no tip, hint, log line or nudge is the same in two eggs, except the shared control and button lines', () => {
  const shared = new Set(['CONTINUE to reach the exit.']);
  const seen = new Map();
  const add = (egg, s) => {
    if (shared.has(s)) return;
    assert.ok(!seen.has(s) || seen.get(s) === egg, `"${s}" is in ${seen.get(s)} and ${egg}`);
    seen.set(s, egg);
  };
  for (const egg of TUTORIAL_EGGS) {
    const t = TUTORIAL_TEXT[egg];
    add(egg, t.nudge);
    for (const k of TIP_KEYS) t.tips[k].forEach((l) => add(egg, l));
    for (const k of HINT_KEYS) add(egg, t.hints[k]);
    for (const k of LOG_KEYS) add(egg, t.log[k]);
    add(egg, t.gift);
  }
});

test('Wetware uses its own meter words (food, health) and no Program or Iron word; Iron says power; Program says charge', () => {
  const all = (egg) => JSON.stringify(TUTORIAL_TEXT[egg]).toLowerCase();
  assert.match(all('wetware'), /food/);
  assert.match(all('wetware'), /health/);
  assert.doesNotMatch(all('wetware'), /charge|power|integrity|process|queue|firmware/);
  assert.match(all('iron'), /power/);
  assert.doesNotMatch(all('iron'), /charge|food|health/);
  assert.match(all('program'), /charge/);
  assert.doesNotMatch(all('program'), /power|food|health/);
});

test('log lines fill their values and keep any unknown placeholder visible', () => {
  assert.equal(tutorialLog('program', 'iceLost', { dmg: 10 }), 'ICE retaliated. -10 integrity.');
  assert.equal(tutorialLog('wetware', 'iceLost', { dmg: 10 }), 'the guard hurt you. -10 health.');
  assert.equal(tutorialLog('iron', 'exit', { bonus: 'Coolant cell', scrip: 3 }), 'exit node. hauled out: Coolant cell, 3 scrip.');
  assert.equal(tutorialLog('iron', 'iceWon', {}), 'ICE shut down. pulled {item}.');
});

test('the width limits are the longest 1.0 lines', async () => {
  const src = (await import('node:fs')).readFileSync(new URL('../../src/netrun/view.js', import.meta.url), 'utf8');
  const tips = [...src.matchAll(/'([^']+)'/g)].map((m) => m[1]);
  const block = src.slice(src.indexOf('const TUTORIAL_TIPS'), src.indexOf('const TYPE_HINT'));
  const hints = src.slice(src.indexOf('const TYPE_HINT'), src.indexOf('export class RunView'));
  const longest = (s) => Math.max(...[...s.matchAll(/'([^']+)'/g)].map((m) => [...m[1]].length));
  assert.equal(TIP_WIDTH, longest(block));
  assert.ok(HINT_WIDTH >= longest(hints.replace(/'[a-z]+'\s*:/g, '')), 'a hint is longer than the limit');
  assert.ok(tips.length > 0);
});
