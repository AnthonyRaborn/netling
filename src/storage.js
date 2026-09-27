// localStorage access for every piece of Netling data. No DOM: the backend is passed in.
//
// Every write goes through one gate (canWrite), so a tab that isn't looking after the
// netling, or a page that is about to reload after an import or restart, can't overwrite
// newer data. Failed writes are reported (onError) instead of silently dropped, and
// setAll() is all-or-nothing, so a full disk can't leave half of an import behind.

export const PREFIX = 'netling.';

export const KEYS = {
  save: 'netling.save',
  lineage: 'netling.lineage',
  dex: 'netling.dex',
  codex: 'netling.codex',
  wardrobe: 'netling.wardrobe',
  progress: 'netling.progress',
  unlocked: 'netling.unlocked',
  accessories: 'netling.accessories',
  prefs: 'netling.prefs',
  onboarding: 'netling.onboarding',
  helpSeen: 'netling.helpSeen',
  lock: 'netling.lock',
  skew: 'netling.devSkew',
  iosHint: 'netling.iosHintSeen',
  corruptSave: 'netling.corruptSave',
  tabLease: 'netling.tabLease', // written by lease.js directly: it decides who may write
};

// getBackend: returns a Storage-like object (getItem/setItem/removeItem/key/length). It may throw,
// as reading window.localStorage does when the browser blocks storage.
// canWrite(key): false refuses a write; key is null for setAll() and clearAll().
// onError(err, key): called when the backend refuses a write.
export function createStore(getBackend, { canWrite = () => true, onError = () => {} } = {}) {
  const backend = () => {
    try {
      return getBackend() ?? null;
    } catch {
      return null;
    }
  };
  const unavailable = () => new Error('storage unavailable');

  // Raw string (or null) without JSON parsing.
  function getRaw(key) {
    try {
      return backend()?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  // Parsed value, or null if missing, unreadable or not JSON.
  function get(key) {
    const raw = getRaw(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function write(b, key, raw) {
    if (raw === null) b.removeItem(key);
    else b.setItem(key, raw);
  }

  // true when the value was stored.
  function set(key, value) {
    return setRaw(key, value === undefined ? null : JSON.stringify(value));
  }

  function setRaw(key, raw) {
    if (!canWrite(key)) return false;
    const b = backend();
    if (!b) {
      onError(unavailable(), key);
      return false;
    }
    try {
      write(b, key, raw);
      return true;
    } catch (err) {
      onError(err, key);
      return false;
    }
  }

  const remove = (key) => setRaw(key, null);

  // entries: { key: value }, where undefined removes the key. Either every entry is written,
  // or the old values are put back and it returns false.
  function setAll(entries) {
    if (!canWrite(null)) return false;
    const b = backend();
    if (!b) {
      onError(unavailable(), null);
      return false;
    }
    const keys = Object.keys(entries);
    const before = new Map();
    try {
      for (const key of keys) before.set(key, b.getItem(key));
      for (const key of keys) write(b, key, entries[key] === undefined ? null : JSON.stringify(entries[key]));
      return true;
    } catch (err) {
      for (const [key, raw] of before) {
        try {
          write(b, key, raw);
        } catch {} // best effort: old values fit before, so they almost always fit again
      }
      onError(err, null);
      return false;
    }
  }

  // Removes every key under PREFIX. true when they're all gone.
  function clearAll() {
    if (!canWrite(null)) return false;
    const b = backend();
    if (!b) {
      onError(unavailable(), null);
      return false;
    }
    try {
      const keys = [];
      for (let i = 0; i < b.length; i++) {
        const k = b.key(i);
        if (k?.startsWith(PREFIX)) keys.push(k);
      }
      for (const k of keys) b.removeItem(k);
      return true;
    } catch (err) {
      onError(err, null);
      return false;
    }
  }

  return { get, getRaw, set, setRaw, remove, setAll, clearAll };
}
