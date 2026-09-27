import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, KEYS } from '../src/storage.js';

// A Storage-like backend. failOn(key) makes setItem throw for matching keys, like a full disk.
function memory(initial = {}, failOn = () => false) {
  const m = new Map(Object.entries(initial));
  return {
    map: m,
    get length() {
      return m.size;
    },
    key: (i) => [...m.keys()][i] ?? null,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem(k, v) {
      if (failOn(k)) throw new Error('QuotaExceededError');
      m.set(k, String(v));
    },
    removeItem: (k) => m.delete(k),
  };
}

test('get parses JSON and returns null for missing or broken values', () => {
  const b = memory({ a: '{"x":1}', broken: '{nope' });
  const store = createStore(() => b);
  assert.deepEqual(store.get('a'), { x: 1 });
  assert.equal(store.get('broken'), null);
  assert.equal(store.get('missing'), null);
  assert.equal(store.getRaw('broken'), '{nope');
});

test('set reports success, and the gate can refuse writes', () => {
  const b = memory();
  let open = true;
  const store = createStore(() => b, { canWrite: () => open });
  assert.equal(store.set('k', [1]), true);
  open = false;
  assert.equal(store.set('k', [2]), false);
  assert.equal(store.remove('k'), false);
  assert.equal(store.setAll({ k: 3 }), false);
  assert.equal(store.clearAll(), false);
  assert.equal(b.getItem('k'), '[1]');
});

test('the gate sees each key, and null for bulk writes', () => {
  const seen = [];
  const store = createStore(() => memory(), { canWrite: (k) => (seen.push(k), true) });
  store.set('a', 1);
  store.setAll({ b: 2 });
  store.clearAll();
  assert.deepEqual(seen, ['a', null, null]);
});

test('failed writes are reported, not thrown', () => {
  const errors = [];
  const store = createStore(() => memory({}, () => true), { onError: (err, key) => errors.push(key) });
  assert.equal(store.set('k', 1), false);
  assert.deepEqual(errors, ['k']);
});

test('a backend that throws on access reads as empty and reports writes', () => {
  const errors = [];
  const store = createStore(
    () => {
      throw new Error('SecurityError');
    },
    { onError: () => errors.push(1) },
  );
  assert.equal(store.get('k'), null);
  assert.equal(store.set('k', 1), false);
  assert.equal(store.setAll({ k: 1 }), false);
  assert.equal(errors.length, 2);
});

test('setAll writes everything, removing undefined entries', () => {
  const b = memory({ gone: '1', keep: '"old"' });
  const store = createStore(() => b);
  assert.equal(store.setAll({ keep: 'new', gone: undefined, added: { a: 1 } }), true);
  assert.equal(b.getItem('keep'), '"new"');
  assert.equal(b.getItem('gone'), null);
  assert.equal(b.getItem('added'), '{"a":1}');
});

test('setAll is all-or-nothing when the disk fills part way', () => {
  const b = memory({ first: '"old1"', second: '"old2"', third: '"old3"' }, (k) => k === 'third');
  const errors = [];
  const store = createStore(() => b, { onError: () => errors.push(1) });
  // "first" and "second" land, "third" throws: the first two must be put back.
  assert.equal(store.setAll({ first: 'new1', second: undefined, third: 'new3' }), false);
  assert.equal(b.getItem('first'), '"old1"');
  assert.equal(b.getItem('second'), '"old2"');
  assert.equal(b.getItem('third'), '"old3"');
  assert.equal(errors.length, 1);
});

test('clearAll removes only netling keys', () => {
  const b = memory({ [KEYS.save]: '{}', [KEYS.lock]: '{}', 'other.app': '1' });
  const store = createStore(() => b);
  assert.equal(store.clearAll(), true);
  assert.deepEqual([...b.map.keys()], ['other.app']);
});
