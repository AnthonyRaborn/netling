import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeSave, decodeSave, describeSave, TransferError, TRANSFER_KEYS } from '../src/transfer.js';
import { createScript } from '../src/sim.js';

const sample = () => ({
  save: createScript({ now: 1_000_000 }),
  lineage: [{ generation: 1, cause: 'neglect' }],
  dex: ['bitling', 'kernel'],
  codex: ['public-1'],
  wardrobe: { shell: 'matte', accessory: 'partyhat', colors: { partyhat: ['#00ff00', '#123456'] } },
  accessories: ['partyhat'],
  devSkew: 12345, // must not travel
});

test('a save round-trips through a transfer code', async () => {
  const code = await encodeSave(sample(), 42);
  assert.match(code, /^NL1\.[A-Za-z0-9_-]+\.[0-9a-f]{8}$/);
  const back = await decodeSave(code);
  assert.equal(back.exportedAt, 42);
  assert.deepEqual(back.data.dex, ['bitling', 'kernel']);
  assert.deepEqual(back.data.wardrobe.colors.partyhat, ['#00ff00', '#123456']);
  assert.equal(back.data.devSkew, undefined, 'dev keys stay behind');
  assert.ok(Object.keys(back.data).every((k) => TRANSFER_KEYS.includes(k)));
});

test('whitespace and line breaks from copy/paste are tolerated', async () => {
  const code = await encodeSave(sample());
  const mangled = `  ${code.slice(0, 20)}\n${code.slice(20, 50)} \n${code.slice(50)}  `;
  const back = await decodeSave(mangled);
  assert.equal(back.data.save.generation, 1);
});

test('damaged, foreign and empty codes are rejected with friendly errors', async () => {
  const code = await encodeSave(sample());
  const flipped = code.slice(0, 10) + (code[10] === 'A' ? 'B' : 'A') + code.slice(11);
  await assert.rejects(decodeSave(flipped), TransferError);
  await assert.rejects(decodeSave(code.slice(0, -3)), TransferError);
  await assert.rejects(decodeSave('hello world'), /doesn't look like/);
  await assert.rejects(decodeSave(''), TransferError);
  const noPet = await encodeSave({ dex: ['bitling'] });
  await assert.rejects(decodeSave(noPet), /no netling/);
});

test('describeSave summarizes what an import would bring', async () => {
  const info = describeSave(await decodeSave(await encodeSave(sample(), 7)));
  assert.equal(info.netling, 'v1.0 compiling');
  assert.equal(info.generations, 2);
  assert.equal(info.codex, 1);
});
