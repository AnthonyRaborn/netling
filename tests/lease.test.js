import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createLease, LEASE_MS } from '../src/lease.js';

function memory() {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}

test('one tab holds the lease; another waits until it is released', () => {
  const store = memory();
  let t = 1000;
  const now = () => t;
  const a = createLease(() => store, 'a', { now });
  const b = createLease(() => store, 'b', { now });
  assert.ok(a.free() && a.take() && a.mine());
  assert.equal(b.free(), false);
  t += LEASE_MS - 1;
  assert.equal(b.free(), false, 'still within the lease');
  a.take(); // heartbeat
  t += LEASE_MS - 1;
  assert.equal(b.free(), false);
  b.release(); // not b's to release
  assert.ok(a.mine());
  a.release();
  assert.ok(b.free());
});

test('a stale or far-future lease counts as free', () => {
  const store = memory();
  let t = 1_000_000;
  const now = () => t;
  const a = createLease(() => store, 'a', { now });
  const b = createLease(() => store, 'b', { now });
  a.take();
  t += LEASE_MS + 1;
  assert.ok(b.free(), 'the holder stopped refreshing');
  store.setItem('netling.tabLease', JSON.stringify({ id: 'a', at: t + LEASE_MS * 10 }));
  assert.ok(b.free(), 'a clock far ahead cannot block forever');
  store.setItem('netling.tabLease', '{broken');
  assert.ok(b.free());
});

test('the last writer wins when two tabs take it together, and clear hands it over', () => {
  const store = memory();
  const a = createLease(() => store, 'a');
  const b = createLease(() => store, 'b');
  a.take();
  b.take();
  assert.equal(a.mine(), false);
  assert.ok(b.mine());
  a.clear();
  assert.equal(b.mine(), false, 'the holder sees the takeover at its next heartbeat');
  assert.ok(a.free());
});

test('storage that throws never throws out of the lease', () => {
  const broken = () => {
    throw new Error('SecurityError');
  };
  const a = createLease(broken, 'a');
  assert.equal(a.take(), false);
  assert.equal(a.mine(), false);
  assert.ok(a.free());
  a.release();
  a.clear();
});
