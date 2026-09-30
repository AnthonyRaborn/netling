import { test } from 'node:test';
import assert from 'node:assert/strict';
import { watchForUpdates, RECHECK_MS } from '../src/update.js';
import { VERSION } from '../src/version.js';

// A stand-in for navigator.serviceWorker: events can be fired at it, and the controller records
// what the page asks it.
function fakeWorker() {
  const sw = new EventTarget();
  sw.asked = [];
  sw.updates = 0;
  sw.controller = { postMessage: (msg) => sw.asked.push(msg) };
  sw.getRegistration = async () => ({ update: async () => void sw.updates++ });
  sw.reply = (data) => sw.dispatchEvent(Object.assign(new Event('message'), { data }));
  return sw;
}

test('a worker from another release offers the update', () => {
  const sw = fakeWorker();
  const ready = [];
  watchForUpdates((v) => ready.push(v), { sw });
  sw.dispatchEvent(new Event('controllerchange'));
  assert.deepEqual(sw.asked, [{ type: 'version?' }], 'a new controller is asked which release it caches');
  sw.reply({ type: 'version', version: 'netling-v999' });
  assert.deepEqual(ready, ['netling-v999']);
});

test('the first install, or a reload that already runs the new code, stays quiet', () => {
  const sw = fakeWorker();
  let ready = 0;
  watchForUpdates(() => ready++, { sw });
  sw.dispatchEvent(new Event('controllerchange'));
  sw.reply({ type: 'version', version: VERSION });
  assert.equal(ready, 0);
});

test('other messages and malformed replies are ignored', () => {
  const sw = fakeWorker();
  let ready = 0;
  watchForUpdates(() => ready++, { sw });
  for (const data of [null, undefined, 'netling-v999', { type: 'other', version: 'x' }, { type: 'version', version: 99 }, { type: 'version' }]) sw.reply(data);
  assert.equal(ready, 0);
});

test('losing the controller asks nobody', () => {
  const sw = fakeWorker();
  sw.controller = null;
  watchForUpdates(() => {}, { sw });
  assert.doesNotThrow(() => sw.dispatchEvent(new Event('controllerchange')));
});

test('looking for a new release is throttled', async () => {
  const sw = fakeWorker();
  let t = 1000;
  const check = watchForUpdates(() => {}, { sw, clock: () => t });
  check();
  check();
  await new Promise((r) => setImmediate(r));
  assert.equal(sw.updates, 1, 'a second look straight away is skipped');
  t += RECHECK_MS;
  check();
  await new Promise((r) => setImmediate(r));
  assert.equal(sw.updates, 2);
});

test('failures and missing support are quiet', async () => {
  const sw = fakeWorker();
  sw.getRegistration = async () => {
    throw new Error('offline');
  };
  watchForUpdates(() => {}, { sw })();
  const none = fakeWorker();
  none.getRegistration = async () => undefined;
  watchForUpdates(() => {}, { sw: none })();
  await new Promise((r) => setImmediate(r));
  assert.doesNotThrow(() => watchForUpdates(() => {}, { sw: null })());
});
