import { test } from 'node:test';
import assert from 'node:assert/strict';

// Fakes for the browser's notification and service worker APIs, replaced per test.
const set = (name, value) => Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
const remove = (name) => Object.defineProperty(globalThis, name, { value: undefined, configurable: true, writable: true });

const shown = [];
function install({ permission = 'granted', registration = null, requestResult = permission, swRegister } = {}) {
  shown.length = 0;
  set('window', { Notification: true });
  class FakeNotification {
    constructor(title, opts) {
      shown.push({ via: 'page', title, opts });
    }
    static get permission() {
      return FakeNotification._permission;
    }
    static async requestPermission() {
      FakeNotification.asked = (FakeNotification.asked ?? 0) + 1;
      FakeNotification._permission = requestResult;
      return requestResult;
    }
  }
  FakeNotification._permission = permission;
  set('Notification', FakeNotification);
  set('navigator', {
    serviceWorker: {
      getRegistration: async () => registration,
      register: swRegister ?? (async () => ({})),
    },
  });
  return FakeNotification;
}

const { notifySupported, notifyGranted, requestNotify, notify, registerServiceWorker } = await import('../src/notify.js');

test('support and permission are read from the browser', () => {
  install({ permission: 'granted' });
  assert.equal(notifySupported(), true);
  assert.equal(notifyGranted(), true);
  install({ permission: 'denied' });
  assert.equal(notifyGranted(), false);
  set('window', {});
  assert.equal(notifySupported(), false);
  assert.equal(notifyGranted(), false);
});

test('asking only prompts when the browser has not been asked yet', async () => {
  const N = install({ permission: 'default', requestResult: 'granted' });
  assert.equal(await requestNotify(), true);
  assert.equal(N.asked, 1);
  const denied = install({ permission: 'denied' });
  assert.equal(await requestNotify(), false);
  assert.equal(denied.asked, undefined, 'a denial is not asked about again');
  const blocked = install({ permission: 'default', requestResult: 'denied' });
  assert.equal(await requestNotify(), false);
  assert.equal(blocked.asked, 1);
  set('window', {});
  assert.equal(await requestNotify(), false, 'unsupported browsers just say no');
});

test('a notification goes through the service worker when there is one', async () => {
  const fromWorker = [];
  install({ registration: { showNotification: async (title, opts) => fromWorker.push({ title, opts }) } });
  await notify('Netling needs you', 'Charge is running low.');
  assert.equal(fromWorker.length, 1);
  assert.equal(fromWorker[0].title, 'Netling needs you');
  assert.equal(fromWorker[0].opts.body, 'Charge is running low.');
  assert.equal(fromWorker[0].opts.tag, 'netling', 'one notification is replaced by the next instead of piling up');
  assert.equal(fromWorker[0].opts.renotify, true);
  assert.equal(shown.length, 0);
});

test('without a service worker it falls back to a page notification', async () => {
  install({ registration: null });
  await notify('FLATLINE', 'gone');
  assert.equal(shown.length, 1);
  assert.equal(shown[0].via, 'page');
});

test('nothing is shown without permission, and a refusal never throws', async () => {
  install({ permission: 'denied', registration: { showNotification: async () => assert.fail('should not show') } });
  await notify('x', 'y');
  assert.equal(shown.length, 0);
  install({ registration: { showNotification: async () => { throw new TypeError('illegal constructor'); } } });
  await assert.doesNotReject(notify('x', 'y'));
});

test('registering the service worker is quiet when it fails or is unavailable', async () => {
  let registered = null;
  install({ swRegister: async (url) => (registered = url) });
  registerServiceWorker();
  assert.equal(registered, 'sw.js');
  install({ swRegister: () => Promise.reject(new Error('blocked')) });
  assert.doesNotThrow(() => registerServiceWorker());
  await new Promise((r) => setTimeout(r, 0)); // an unhandled rejection would fail the run here
  set('navigator', {});
  assert.doesNotThrow(() => registerServiceWorker());
});
