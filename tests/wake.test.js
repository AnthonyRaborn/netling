import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createWakeLock, wakeLockSupported, RETRY_MS } from '../src/wake.js';

const settle = () => new Promise((r) => setImmediate(r));

// A stand-in for navigator.wakeLock: records requests and hands out sentinels the test can
// release as the browser would when the page is hidden.
function fakeNav({ refuse = false } = {}) {
  const nav = { requests: 0, released: 0, sentinels: [] };
  nav.wakeLock = {
    request: async (type) => {
      assert.equal(type, 'screen');
      nav.requests++;
      if (refuse) throw new DOMException('battery saver', 'NotAllowedError');
      const s = new EventTarget();
      s.release = async () => {
        nav.released++;
        s.dispatchEvent(new Event('release'));
      };
      nav.sentinels.push(s);
      return s;
    },
  };
  return nav;
}

test('support is read from the browser', () => {
  assert.equal(wakeLockSupported(fakeNav()), true);
  assert.equal(wakeLockSupported({}), false);
  assert.equal(wakeLockSupported(undefined), false);
});

test('the lock is taken once while wanted and let go when not', async () => {
  const nav = fakeNav();
  const lock = createWakeLock({ nav, visible: () => true, clock: () => 0 });
  lock.sync(true);
  lock.sync(true); // a second call while the first request is pending asks nothing more
  await settle();
  lock.sync(true);
  assert.equal(nav.requests, 1);
  assert.equal(lock.held, true);
  lock.sync(false);
  await settle();
  assert.equal(nav.released, 1);
  assert.equal(lock.held, false);
  lock.sync(false);
  await settle();
  assert.equal(nav.released, 1, 'nothing more to release');
});

test('a hidden page asks nothing, and a lock the browser dropped is taken again once visible', async () => {
  const nav = fakeNav();
  let visible = false;
  const lock = createWakeLock({ nav, visible: () => visible, clock: () => 0 });
  lock.sync(true);
  await settle();
  assert.equal(nav.requests, 0);
  visible = true;
  lock.sync(true);
  await settle();
  assert.equal(lock.held, true);
  nav.sentinels[0].dispatchEvent(new Event('release')); // the page was hidden
  assert.equal(lock.held, false);
  lock.sync(true);
  await settle();
  assert.equal(nav.requests, 2);
  assert.equal(lock.held, true);
});

test('a refusal waits before asking again', async () => {
  const nav = fakeNav({ refuse: true });
  let t = 0;
  const lock = createWakeLock({ nav, visible: () => true, clock: () => t });
  lock.sync(true);
  await settle();
  lock.sync(true);
  await settle();
  assert.equal(nav.requests, 1);
  assert.equal(lock.held, false);
  t += RETRY_MS;
  lock.sync(true);
  await settle();
  assert.equal(nav.requests, 2);
});

test('without support, or with a request that throws, nothing breaks', async () => {
  assert.doesNotThrow(() => createWakeLock({ nav: {}, visible: () => true }).sync(true));
  const nav = { wakeLock: { request: () => { throw new TypeError('nope'); } } };
  const lock = createWakeLock({ nav, visible: () => true, clock: () => 0 });
  assert.doesNotThrow(() => lock.sync(true));
  assert.equal(lock.held, false);
});
