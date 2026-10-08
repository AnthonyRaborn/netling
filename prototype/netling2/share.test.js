// The 2.0 daily share line (share.js): the harder-ICE count, and that the stored string survives 1.0's cleaner.
import test from 'node:test';
import assert from 'node:assert/strict';
process.env.TZ = 'UTC';
import { shareText2 } from './share.js';
import { shareText, dayKey } from '../../src/netrun/daily.js';
import { cleanProgress } from '../../src/sanitize.js';

const DAY = '2026-10-02';
const base = { key: DAY, trail: ['>', '#', '$', 'x', '+', '~', '>'], exit: true, result: 'jacked', layers: 9, reached: 9, who: 'Ghost' };

test('the count follows the ICE figure and is left out when there is none', () => {
  const tally = { iceWon: 1, iceLost: 1, icePhased: 1 };
  assert.equal(shareText2({ ...base, tally: { ...tally, iceHard: 2 } }), 'NETLING daily #2 (2026-10-02) r1\nEXIT 9/9  ICE 2/3 (2 hard)  Ghost\n>#$x+~>');
  assert.equal(shareText2({ ...base, tally }), shareText({ ...base, tally }), 'no hard ICE: 1.0 line, unchanged');
  assert.equal(shareText2({ ...base, tally: { ...tally, iceHard: 0 } }), shareText({ ...base, tally }));
  assert.match(shareText2({ ...base, exit: false, result: 'disconnected', reached: 3, trail: ['>', 'x'], tally: { iceLost: 1, iceHard: 1 } }), /\nDISCONNECTED 3\/9  ICE 0\/1 \(1 hard\)  Ghost\n>x!$/);
  assert.ok(!shareText2({ ...base, tally: { ...tally, iceHard: 2 } }).includes('—'));
});

test('the stored line is cleaned as before: kept whole when short, cut at 300 characters', () => {
  assert.equal(dayKey(Date.UTC(2026, 9, 2, 12)), DAY);
  const longest = shareText2({ ...base, trail: Array(40).fill('#'), tally: { iceWon: 40, iceHard: 40 } });
  assert.ok(longest.length < 300, `${longest.length} characters`);
  assert.equal(cleanProgress({ daily: { day: DAY, share: longest, exit: true } }).daily.share, longest);
  // A 1.0 line already stored (no count) still passes, and a hostile one is only cut, never interpreted.
  const old = shareText({ ...base, tally: { iceWon: 2 } });
  assert.equal(cleanProgress({ daily: { day: DAY, share: old } }).daily.share, old);
  assert.equal(cleanProgress({ daily: { day: DAY, share: '<img src=x>'.repeat(40) } }).daily.share.length, 300);
});
