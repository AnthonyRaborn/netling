import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeSave, decodeSave, describeSave, TransferError, TRANSFER_KEYS, MAX_CODE_CHARS, MAX_JSON_BYTES } from '../src/transfer.js';
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

test('fractional numbers are rounded to two places in transit', async () => {
  const data = sample();
  data.save.stats.charge = 40.799999999999685;
  const back = await decodeSave(await encodeSave(data));
  assert.equal(back.data.save.stats.charge, 40.8);
  assert.equal(back.data.save.bornAt, data.save.bornAt, 'integers untouched');
});

test('every key in an imported code is checked and repaired before it can be stored', async () => {
  const save = createScript({ now: 1_000_000 });
  save.quirk = 'x';
  save.inventory = ['coolant', 'bogus'];
  const back = await decodeSave(
    await encodeSave({
      save,
      lineage: [7, { form: 'dragon' }],
      dex: 'kernel',
      codex: {},
      wardrobe: [1, 2],
      progress: 'lots',
      unlocked: ['shell:matte', 'everything'],
      accessories: { 0: 'partyhat' },
      prefs: { volume: 'loud' },
      onboarding: 42,
    }),
    1_000_000,
  );
  const d = back.data;
  assert.equal(typeof d.save.quirk.pitch, 'number');
  assert.deepEqual(d.save.inventory, ['coolant']);
  assert.equal(d.lineage.length, 1);
  assert.equal(d.lineage[0].form, null);
  assert.deepEqual(d.dex, []);
  assert.deepEqual(d.codex, []);
  assert.deepEqual(d.wardrobe, {});
  assert.equal(d.progress.gamesPlayed, 0);
  assert.deepEqual(d.unlocked, ['shell:matte']);
  assert.deepEqual(d.accessories, []);
  assert.equal(d.prefs.volume, 0.8);
  assert.equal('onboarding' in d, false, 'an unusable onboarding step is left out');
});

test('oversized codes are rejected before they can hang the page', async () => {
  const { deflateRawSync } = await import('node:zlib');
  // A tiny code that inflates past the cap (a "zip bomb").
  const json = `{"v":1,"data":{"save":"${'a'.repeat(MAX_JSON_BYTES + 10)}"}}`;
  const packed = deflateRawSync(Buffer.from(json)).toString('base64url');
  assert.ok(packed.length < 20_000);
  await assert.rejects(decodeSave(`NL1.${packed}.00000000`), TransferError);
  await assert.rejects(decodeSave(`NL1.${'A'.repeat(MAX_CODE_CHARS)}.00000000`), /too long/);
});
