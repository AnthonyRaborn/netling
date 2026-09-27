// Renders the Bitling sprite into PNG app icons with no dependencies.
// Usage: node tools/make-icons.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { SPRITES } from '../src/sprites.js';

const BG = [0x0b, 0x22, 0x26];
const COLORS = { '#': [0x05, 0xd9, 0xe8], o: [0xff, 0x2a, 0x6d], '+': [0xf5, 0xf5, 0xf5] };

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, pixel) {
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixel(x, y);
      const i = y * (size * 3 + 1) + 1 + x * 3;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// `fill` is the fraction of the icon the sprite spans (maskable icons need a safe zone).
function icon(size, fill) {
  const sprite = SPRITES.bitlingA;
  const cells = 12;
  const scale = Math.floor((size * fill) / cells);
  const off = Math.floor((size - cells * scale) / 2);
  return png(size, (x, y) => {
    const c = Math.floor((x - off) / scale);
    const r = Math.floor((y - off) / scale);
    const ch = sprite[r]?.[c];
    const color = COLORS[ch] ?? BG;
    // faint scanlines
    return (y % Math.max(2, Math.floor(scale / 3))) === 0 ? color.map((v) => Math.floor(v * 0.8)) : color;
  });
}

mkdirSync(new URL('../icons/', import.meta.url), { recursive: true });
const out = (name, buf) => writeFileSync(new URL(`../icons/${name}`, import.meta.url), buf);
out('icon-192.png', icon(192, 0.75));
out('icon-512.png', icon(512, 0.75));
out('maskable-512.png', icon(512, 0.55));
out('apple-touch-icon.png', icon(180, 0.7));
console.log('icons written');
