// Save transfer codes: every piece of Netling's local data, compressed into one pasteable string.
// Format: NL1.<base64url(deflate(json))>.<crc32 hex>
import { SAVE_VERSION, SPECIES } from './sim.js';

const PREFIX = 'NL1';
// Everything a player would expect to move with them. Dev-only keys stay behind.
export const TRANSFER_KEYS = [
  'save',
  'lineage',
  'dex',
  'codex',
  'wardrobe',
  'progress',
  'unlocked',
  'accessories',
  'prefs',
  'onboarding',
  'helpSeen',
];

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(bytes) {
  let c = 0xffffffff;
  for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return ((c ^ 0xffffffff) >>> 0).toString(16).padStart(8, '0');
}

async function pipe(bytes, stream) {
  const out = new Blob([bytes]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

function toBase64Url(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text) {
  const b64 = text.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

// data: { key: parsedValue } for TRANSFER_KEYS.
export async function encodeSave(data, exportedAt = Date.now()) {
  const payload = { v: 1, exportedAt, data: Object.fromEntries(TRANSFER_KEYS.filter((k) => data[k] !== undefined).map((k) => [k, data[k]])) };
  const json = new TextEncoder().encode(JSON.stringify(payload));
  const packed = await pipe(json, new CompressionStream('deflate-raw'));
  return `${PREFIX}.${toBase64Url(packed)}.${crc32(json)}`;
}

export class TransferError extends Error {}

// Returns { exportedAt, data } or throws TransferError with a player-facing message.
export async function decodeSave(code) {
  const clean = String(code ?? '').replace(/\s+/g, '');
  const parts = clean.split('.');
  if (parts.length !== 3 || parts[0] !== PREFIX) throw new TransferError("that doesn't look like a netling code.");
  let json;
  try {
    json = await pipe(fromBase64Url(parts[1]), new DecompressionStream('deflate-raw'));
  } catch {
    throw new TransferError('the code is damaged. copy all of it and try again.');
  }
  if (crc32(json) !== parts[2]) throw new TransferError('the code is damaged. copy all of it and try again.');
  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(json));
  } catch {
    throw new TransferError('the code is damaged. copy all of it and try again.');
  }
  if (payload?.v !== 1 || typeof payload.data !== 'object' || payload.data === null) {
    throw new TransferError('this code is from a different version.');
  }
  const save = payload.data.save;
  if (!save || typeof save !== 'object' || save.saveVersion !== SAVE_VERSION || !SPECIES[save.form ?? 'bitling']) {
    throw new TransferError('this code has no netling in it.');
  }
  const data = Object.fromEntries(Object.entries(payload.data).filter(([k]) => TRANSFER_KEYS.includes(k)));
  return { exportedAt: payload.exportedAt, data };
}

// A short summary for the confirm step.
export function describeSave({ data, exportedAt }) {
  const s = data.save;
  const name = s.stage === 'script' ? 'compiling' : s.stage === 'dead' ? 'flatlined' : SPECIES[s.form]?.name ?? 'unknown';
  return {
    netling: `v${s.generation}.0 ${name}`,
    generations: (data.lineage?.length ?? 0) + 1,
    dex: data.dex?.length ?? 0,
    codex: data.codex?.length ?? 0,
    style: (data.unlocked?.length ?? 0) + (data.accessories?.length ?? 0),
    exportedAt,
  };
}
