// A canvas that records what is drawn on it, so rendering code can run under Node with no browser.
// Not a test file (the test glob is tests/*.test.js).

export function fakeCtx() {
  const calls = [];
  const props = {};
  return new Proxy(props, {
    get(target, key) {
      if (key === 'calls') return calls;
      if (key === 'measureText') return (s) => ({ width: String(s).length * 8 });
      if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => ({ addColorStop() {} });
      if (key in target) return target[key];
      return (...args) => {
        calls.push([String(key), args]);
      };
    },
    set(target, key, value) {
      target[key] = value;
      return true;
    },
  });
}

export function fakeCanvas(width = 400, height = 280) {
  const ctx = fakeCtx();
  return { width, height, ctx, dataset: {}, getContext: () => ctx, toDataURL: () => '' };
}

// Draw calls whose numeric arguments include NaN or Infinity: the classic sign of a broken layout calculation.
export const badArgs = (ctx) => ctx.calls.filter(([, args]) => args.some((a) => typeof a === 'number' && !Number.isFinite(a)));
