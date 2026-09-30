// Color maths shared by the game (wearable contrast) and the sprite review tools. Pure: hex strings in, numbers out.

export function hexToRgb(hex) {
  const h = String(hex).replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

export const rgbToHex = (rgb) => `#${rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`;

// Alpha blend `hex` over `bg`.
export function blend(hex, alpha, bg) {
  if (alpha >= 1) return hex;
  const a = hexToRgb(hex);
  const b = hexToRgb(bg);
  return rgbToHex(a.map((v, i) => v * alpha + b[i] * (1 - alpha)));
}

function rgbToLab([r, g, b]) {
  const lin = (v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
  const Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  const Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);
  const [fx, fy, fz] = [f(X), f(Y), f(Z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

// CIE76 color difference between two #rrggbb colors: 0 is identical, 100 is black against white.
export function deltaE(a, b) {
  const [l1, a1, b1] = rgbToLab(hexToRgb(a));
  const [l2, a2, b2] = rgbToLab(hexToRgb(b));
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

// The colors a wearable may be swapped to when its own color would blend into the pet, best first is decided by the caller.
export const SWAP_COLORS = ['#f5f5f5', '#f9f002', '#ff9f1c', '#05d9e8', '#ff2a6d', '#39ff14', '#b967ff', '#050508'];

// A wearable pixel of `color` on a pet whose body is `body`: the color itself unless it would blend in (closer than
// `blendBelow` to the body), else the swap color nearest to the original that stands clear of the body by `clear`,
// else the one furthest from the body.
export function contrastColor(color, body, { blendBelow = 30, clear = 45 } = {}) {
  if (deltaE(color, body) >= blendBelow) return color;
  const ok = SWAP_COLORS.filter((c) => deltaE(c, body) >= clear);
  if (ok.length) return ok.reduce((best, c) => (deltaE(c, color) < deltaE(best, color) ? c : best));
  return SWAP_COLORS.reduce((best, c) => (deltaE(c, body) > deltaE(best, body) ? c : best));
}
