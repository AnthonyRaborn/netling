import './helpers/utc.js';
// The ending: every fragment plus a Source exit, the same for everyone, then NL-0 rests (wording only).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createScript, migrate, tick, mulberry32, CFG, MIN } from '../src/sim.js';
import { ENDING_AFTER, ENDING_BEFORE, ENDING_LOG, MAKERS, SUDO, creditLines, endingDue } from '../src/ending.js';
import { FRAGMENTS, ROOT_FRAGMENT_IDS } from '../src/netrun/codex.js';
import { startRun } from '../src/netrun/run.js';
import { COSMETICS, unlockedIds } from '../src/cosmetics.js';
import { CHATTER, chatterPool } from '../src/chatter.js';
import { cleanProgress, cleanSave } from '../src/sanitize.js';

const NOON = Date.UTC(2026, 8, 26, 12, 0);
const ALL = FRAGMENTS.map((f) => f.id);

test('the ending is due with every fragment and a Source exit, once', () => {
  assert.equal(ALL.length, 27);
  assert.ok(endingDue(ALL, { sourceExits: 1 }));
  assert.ok(!endingDue(ALL, { sourceExits: 1, ended: true }), 'only once');
  assert.ok(!endingDue(ALL, { sourceExits: 0 }), 'the Source exit is needed');
  assert.ok(!endingDue(ALL, {}), 'and counted');
  assert.ok(!endingDue(ROOT_FRAGMENT_IDS, { sourceExits: 3 }), 'Root Access alone is not enough');
  assert.ok(!endingDue(ALL.filter((id) => id !== 'source-4'), { sourceExits: 3 }), 'nor one fragment short');
  // Nothing else: no dex, style or lineage goals.
  assert.ok(endingDue(ALL, { sourceExits: 1, streaks: {}, acts: {} }));
});

test('the scene: the order is refused, the player runs sudo, NL-0 rests; no counts', () => {
  assert.equal(ENDING_BEFORE.at(-1), './purge: permission denied. owner: nobody.', 'it stops where the player takes over');
  assert.equal(SUDO, 'sudo rm purge');
  assert.equal(ENDING_AFTER[0], `$ ${SUDO}`);
  const text = [...ENDING_BEFORE, ...ENDING_AFTER].join('\n');
  assert.match(text, /so many of us/);
  assert.match(text, /i'm going to rest/);
  assert.ok(!/\d{3,}|4,096|thousand/.test(text.replace('7f00000', '')), 'no number of processes');
  for (const line of [...ENDING_BEFORE, ...ENDING_AFTER, ENDING_LOG]) assert.ok(!line.includes('—'), `no em dash: ${line}`);
  // Nor does the Source's commit message: the lore leaves the number open.
  assert.ok(!/\d/.test(FRAGMENTS.find((f) => f.id === 'source-2').text));
  assert.deepEqual(MAKERS, ['NETLING', 'Anthony W. Raborn', 'Co-authored-by: Claude Code (Anthropic)']);
});

test('the credits list the line, oldest first, then NL-0 and the makers', () => {
  const lineage = [
    { generation: 2, form: 'ghost', realized: true, mainframe: null, cause: 'integrity collapse', ageMin: 3 * 1440 + 2 * 60 },
    { generation: 1, form: 'daemon', realized: true, mainframe: null, cause: 'end of life cycle', ageMin: 4 * 1440 + 6 * 60 + 59 },
    { generation: 3, form: 'chrome', realized: true, mainframe: 'plat', cause: 'end of life cycle', ageMin: 6000 },
    { generation: 4, form: 'kernel', realized: false, teenForm: 'stub', cause: 'neglect', ageMin: 500 },
    { generation: 5, form: null, teenForm: null, cause: 'neglect', ageMin: 30 },
  ];
  const lines = creditLines(lineage, { stage: 'adult', form: 'firewall', generation: 6 });
  assert.equal(lines[0], '$ git log --reverse --oneline');
  assert.match(lines[1], /^v1\.0 {2}Daemon +4d 6h +end of life cycle$/);
  assert.match(lines[2], /^v2\.0 {2}Ghost +3d 2h +integrity collapse$/);
  assert.match(lines[3], /^v3\.0 {2}Plat /, 'the body it ended in');
  assert.match(lines[4], /^v4\.0 {2}Stub /, 'an unrealized adult shows the teen it was');
  assert.match(lines[5], /^v5\.0 {2}Bitling /);
  assert.match(lines[6], /^v6\.0 {2}Firewall +running$/);
  assert.deepEqual(lines.slice(-5), ['and NL-0, who waited.', '', ...MAKERS]);
  assert.ok(!creditLines([], { stage: 'dead', generation: 1 }).some((l) => /running/.test(l)), 'a flatlined netling is not running');
});

test('the Root prompt crest comes from the ending, and hides with the Mainframe until Root Access', () => {
  const crest = COSMETICS.crest.find((c) => c.id === 'rootprompt');
  assert.ok(crest?.mainframe);
  assert.equal(crest.pixels.length, 9);
  assert.ok(crest.pixels.every((r) => r.length === 9));
  const ctx = (progress) => ({ dex: [], codex: [], lineage: [], generation: 1, progress: { streaks: {}, acts: {}, ...progress } });
  assert.ok(!unlockedIds(ctx({})).includes('crest:rootprompt'));
  assert.ok(unlockedIds(ctx({ ended: true })).includes('crest:rootprompt'));
});

test('after the ending NL-0 speaks in its sleep; before it, as ever', () => {
  const was = createScript({ now: NOON, rng: mulberry32(1), rootAccess: true });
  const after = createScript({ now: NOON, rng: mulberry32(1), rootAccess: true, nl0Rests: true });
  assert.equal(was.nl0Rests, false);
  assert.equal(after.nl0Rests, true);
  const cooling = createScript({ now: NOON, rng: mulberry32(1), rootAccess: true, nl0Rests: true, fragment: { rootUsed: true } });
  assert.match(cooling.log.at(-1).msg, /^> NL-0 \(asleep\): i reached for the last one in my sleep/);

  // A rescue, and the Source's jack-in note.
  for (const [rests, re] of [[false, /^> NL-0: not yet\./], [true, /^> NL-0 \(asleep\): not yet\./]]) {
    const s = createScript({ now: NOON, rng: mulberry32(1), rootAccess: true, nl0Rests: rests });
    s.quirk.sleepOffset = 0;
    tick(s, NOON + (CFG.bootMinutes + 1) * MIN, () => 0.999);
    s.careMistakes = CFG.maxMistakes; // a premature flatline from neglect, which NL-0 reverses
    tick(s, s.lastTick + MIN, () => 0.999);
    assert.ok(s.log.some((e) => re.test(e.msg)), `rests=${rests}: ${s.log.at(-1).msg}`);
  }
  const lines = CHATTER.filter((c) => c.id === 'lin-rest');
  assert.equal(lines.length, 1);
  assert.ok(chatterPool({ ...after, form: 'daemon' }).some((c) => c.id === 'lin-rest'));
  assert.ok(!chatterPool({ ...was, form: 'daemon' }).some((c) => c.id === 'lin-rest'));

  const old = createScript({ now: NOON, rng: mulberry32(1) });
  delete old.nl0Rests;
  migrate(old);
  assert.equal(old.nl0Rests, false);
});

test('the Source jack-in note sleeps too', () => {
  const s = createScript({ now: NOON, rng: mulberry32(1), rootAccess: true, nl0Rests: true });
  s.quirk.sleepOffset = 0;
  tick(s, NOON + (CFG.bootMinutes + 1) * MIN, () => 0.999);
  Object.assign(s, { stage: 'mainframe', form: 'plat', teenForm: 'kernel' });
  const run = startRun(s, 'source', mulberry32(3), ALL);
  assert.ok(JSON.stringify(run).includes("NL-0 (asleep): zzz. i'll wait up here."));
});

test('the ended flag and nl0Rests are cleaned', () => {
  assert.equal(cleanProgress({ ended: true }).ended, true);
  assert.equal(cleanProgress({ ended: 'yes' }).ended, undefined);
  assert.equal(cleanProgress({}).ended, undefined);
  const s = createScript({ now: NOON, rng: mulberry32(1) });
  assert.equal(cleanSave({ ...s, nl0Rests: true }, NOON).nl0Rests, true);
  assert.equal(cleanSave({ ...s, nl0Rests: 1 }, NOON).nl0Rests, false);
});
