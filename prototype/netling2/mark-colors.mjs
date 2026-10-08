// Picks the colors of the Overdrive sparks and Overlink dots (docs/NETLING_2_CARE_DRAFTS.md, State clues). Overclock's wisps are 1.0's
// orange (#ff9f1c). Needs: contrast of at least 3:1 against the LCD background (WCAG 1.4.11, non-text), and the three marks far apart
// in color for normal vision and for protan, deutan and tritan simulations (Machado et al. 2009, full severity), measured as CIE76 distance.
// Usage: node prototype/netling2/mark-colors.mjs
export const LCD = '#0b2226';
export const OVERCLOCK = '#ff9f1c';
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toLin = (h) => hex(h).map(lin);
const luminance = (h) => { const [r, g, b] = toLin(h); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const MACHADO = {
  normal: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
  tritan: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
};
const lab = (rgbLin) => {
  const [r, g, b] = rgbLin;
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047, y = 0.2126 * r + 0.7152 * g + 0.0722 * b, z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
};
export const simulate = (h, kind) => { const m = MACHADO[kind]; const c = toLin(h); const out = m.map((row) => Math.min(1, Math.max(0, row[0] * c[0] + row[1] * c[1] + row[2] * c[2]))); return '#' + out.map((v) => Math.round((v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055) * 255).toString(16).padStart(2, '0')).join(''); };
const seen = (h, kind) => { const m = MACHADO[kind]; const c = toLin(h); return lab(m.map((row) => Math.min(1, Math.max(0, row[0] * c[0] + row[1] * c[1] + row[2] * c[2])))); };
export const distance = (a, b, kind = 'normal') => { const [p, q] = [seen(a, kind), seen(b, kind)]; return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); };
export const minDistance = (colors) => {
  let worst = Infinity;
  for (const kind of Object.keys(MACHADO)) for (let i = 0; i < colors.length; i++) for (let j = i + 1; j < colors.length; j++) worst = Math.min(worst, distance(colors[i], colors[j], kind));
  return worst;
};

export const CANDIDATES = {
  overdrive: ['#ffe14d', '#c6ff3d', '#7dff9a', '#ffffff', '#ff71ce'],
  overlink: ['#4dabff', '#8f7bff', '#b6f0ff', '#ff71ce', '#7dff9a'],
};
if (typeof process !== 'undefined' && process.argv[1]?.endsWith('mark-colors.mjs')) {
  const rows = [];
  for (const od of CANDIDATES.overdrive) for (const ol of CANDIDATES.overlink) {
    if (od === ol) continue;
    const set = [OVERCLOCK, od, ol];
    const c = Math.min(...set.map((x) => contrast(x, LCD)));
    rows.push({ od, ol, contrast: +c.toFixed(1), minDist: +minDistance(set).toFixed(1), perKind: Object.fromEntries(Object.keys(MACHADO).map((k) => [k, +Math.min(distance(OVERCLOCK, od, k), distance(OVERCLOCK, ol, k), distance(od, ol, k)).toFixed(1)])) });
  }
  rows.filter((r) => r.contrast >= 3).sort((a, b) => b.minDist - a.minDist).slice(0, 8).forEach((r) => console.log(JSON.stringify(r)));
}

export const MARK_COLORS = { overclock: OVERCLOCK, overdrive: '#ffffff', overlink: '#4dabff' }; // chosen from the table above: best worst-case distance (49) at 6.8:1 contrast
export const KINDS_SEEN = Object.keys(MACHADO);
