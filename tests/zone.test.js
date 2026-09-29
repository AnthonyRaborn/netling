import './helpers/utc.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bedtimeOnDevice, createScript, migrate, mulberry32, tick, CFG, MIN } from '../src/sim.js';
import { cleanSave } from '../src/sanitize.js';

// KI-12: sleep follows the zone stored on the netling, refreshed only when it wakes. The device here
// is always UTC (offset 0), so a netling "from" another zone is one whose stored zone differs.
const HOUR = 60 * MIN;
const noRng = () => 0.999;
const day = (h) => Date.UTC(2026, 8, 26, h, 0);

function netling(zone) {
  const s = createScript({ now: day(12) - 30 * MIN, rng: mulberry32(1) });
  s.quirk.sleepOffset = 0;
  tick(s, day(12), noRng); // booted and awake at noon UTC
  s.zone = zone;
  return s;
}

// Advance to `t` an hour at a time, kept fed and healthy so only the clock matters.
function run(s, t) {
  while (s.lastTick < t) {
    Object.assign(s.stats, { charge: 90, sync: 90, integrity: 100, heat: 20 });
    tick(s, Math.min(s.lastTick + HOUR, t), noRng);
  }
  assert.notEqual(s.stage, 'dead');
}

test('a new netling takes the device zone', () => {
  assert.equal(createScript({ now: day(12) }).zone, 0);
});

test('an awake netling keeps its zone through the day: bedtime by the old zone', () => {
  const s = netling(-180); // from UTC+3: its 22:00 is 19:00 here
  assert.equal(bedtimeOnDevice(s, day(12)), (CFG.sleepStart - 3) * 60, 'the readout shows 19:00 on this clock');
  run(s, day(CFG.sleepStart - 3) - MIN);
  assert.equal(s.asleep, false);
  run(s, day(CFG.sleepStart - 3) + MIN);
  assert.equal(s.asleep, true, 'sleeps at its own 22:00');
  assert.equal(s.zone, -180, 'unchanged while it sleeps');
});

test('at its waking hour it rechecks the zone, and keeps sleeping if it is still night here', () => {
  const s = netling(-180);
  run(s, day(CFG.sleepStart - 3) + MIN);
  const oldWake = day(24 + CFG.sleepEnd - 3); // its 07:00 is 04:00 here
  run(s, oldWake + MIN);
  assert.equal(s.zone, 0, 'the new day takes the device zone');
  assert.equal(s.asleep, true, '04:00 here is still night');
  run(s, day(24 + CFG.sleepEnd) + MIN);
  assert.equal(s.asleep, false, 'wakes at 07:00 here');
  assert.equal(bedtimeOnDevice(s, s.lastTick), CFG.sleepStart * 60, 'and goes to bed by this clock from now on');
});

test('from a zone behind this one it sleeps late once, then follows this clock', () => {
  const s = netling(300); // from UTC-5: its 22:00 is 03:00 here
  run(s, day(24 + 3) + MIN);
  assert.equal(s.asleep, true);
  run(s, day(24 + CFG.sleepEnd) + MIN);
  assert.equal(s.asleep, true, 'its own night is not over at 07:00 here');
  run(s, day(24 + CFG.sleepEnd + 5) + MIN);
  assert.equal(s.asleep, false, 'wakes at its own 07:00');
  assert.equal(s.zone, 0);
});

test('saves from before get the device zone; stored zones are cleaned', () => {
  const s = netling(0);
  delete s.zone;
  migrate(s);
  assert.equal(s.zone, 0);
  const base = JSON.parse(JSON.stringify(s));
  const clean = (zone) => cleanSave({ ...base, zone }, s.lastTick + HOUR).zone;
  assert.equal(clean(-330), -330, 'half-hour zones are kept');
  assert.equal(clean(5000), 14 * 60);
  assert.equal(clean('x'), 0, 'junk falls back to the device zone');
  assert.equal(clean(undefined), 0);
});
