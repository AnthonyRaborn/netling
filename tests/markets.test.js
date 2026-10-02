// Netrun markets come in two kinds: black markets (indie, cheaper, risky stock) and corp exchanges (corp, pricier, safe
// stock), each with a few accessories the other never sells.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createScript, tick, mulberry32, CFG, MIN, SCRIP } from '../src/sim.js';
import { startRun, moveTo, choose, runOptions, RUN_CFG } from '../src/netrun/run.js';
import { generateMap } from '../src/netrun/map.js';
import { REGIONS } from '../src/netrun/regions.js';
import { STYLE_ITEMS, accessoryById, rollAccessory } from '../src/accessories.js';
import { cleanSave } from '../src/sanitize.js';

const T0 = Date.UTC(2026, 8, 26, 12, 0);
const noRng = () => 0.999;

function pet(stage = 'teen') {
  const s = createScript({ now: T0, rng: mulberry32(1) });
  s.quirk.sleepOffset = 0;
  tick(s, T0 + CFG.bootMinutes * MIN, noRng);
  s.stage = stage;
  s.stats.charge = 90;
  s.scrip = 100;
  return s;
}

// The next node, turned into a market of the given kind.
function marketAhead(flavor, form = 'kernel') {
  const s = pet(form === 'chrome' ? 'adult' : 'teen'); // a form's run perks are the adult's
  s.form = form;
  startRun(s, 'public', mulberry32(4));
  const next = runOptions(s.run)[0];
  Object.assign(next, { type: 'market', flavor });
  return { s, next };
}

test('every market on a map is one kind or the other, by the region\'s share; the Source has none', () => {
  const share = (region) => {
    let corp = 0;
    let all = 0;
    for (let seed = 1; seed <= 400; seed++) {
      for (const n of generateMap(region, mulberry32(seed)).nodes) {
        if (n.type !== 'market') continue;
        assert.ok(n.flavor === 'corp' || n.flavor === 'black', `${region}: a market without a kind`);
        all++;
        if (n.flavor === 'corp') corp++;
      }
    }
    return { all, frac: corp / all };
  };
  for (const region of ['public', 'corp', 'bazaar', 'ruins', 'deep']) {
    const { all, frac } = share(region);
    assert.ok(all > 50, `${region} has markets`);
    assert.ok(Math.abs(frac - (REGIONS[region].exchangeShare ?? 0.5)) < 0.08, `${region}: ${frac.toFixed(2)} exchanges`);
  }
  assert.ok(share('corp').frac > 0.7 && share('bazaar').frac < 0.3, 'the grid leans exchange, the bazaar black');
  assert.ok(!REGIONS.source.nodes.market, 'nothing for sale in the Source');
});

test('a black market leans indie and is cheaper; a corp exchange leans corp, costs more, and less for Chrome', () => {
  const buy = (flavor, form) => {
    const { s, next } = marketAhead(flavor, form);
    moveTo(s, next.id, noRng);
    const p = s.run.pending;
    assert.equal(p.flavor, flavor);
    assert.equal(p.title, flavor === 'corp' ? 'CORP EXCHANGE' : 'BLACK MARKET');
    const charge = s.stats.charge;
    const scrip = s.scrip;
    choose(s, 'buy0', noRng);
    return { s, p, paid: charge - s.stats.charge, scrip: scrip - s.scrip };
  };
  const black = buy('black');
  assert.equal(black.s.axes.allegiance, RUN_CFG.blackLean);
  assert.equal(black.paid, RUN_CFG.marketPrice);
  assert.ok(Object.keys(RUN_CFG.blackStock).includes(black.p.offers[0]));
  const corp = buy('corp');
  assert.equal(corp.s.axes.allegiance, RUN_CFG.exchangeLean);
  assert.equal(corp.paid, RUN_CFG.exchangePrice);
  assert.ok(Object.keys(RUN_CFG.exchangeStock).includes(corp.p.offers[0]));
  assert.equal(corp.scrip, SCRIP.price[corp.p.offers[0]], 'scrip prices are the same at both');
  assert.equal(buy('corp', 'chrome').paid, RUN_CFG.exchangeChromePrice, 'corp credentials');
  assert.ok(RUN_CFG.exchangePrice > RUN_CFG.marketPrice && RUN_CFG.exchangeChromePrice < RUN_CFG.exchangePrice);
});

test('each kind of market sells its own exclusive accessories and the shared ones, never the other\'s', () => {
  const rng = mulberry32(11);
  for (const shop of ['exchange', 'black']) {
    const seen = new Set();
    for (let i = 0; i < 4000; i++) seen.add(rollAccessory([], rng, 'public', shop));
    for (const id of seen) {
      const x = accessoryById(id);
      assert.ok(!x.shop || x.shop === shop, `${id} (${x.shop}) offered at a ${shop}`);
    }
    assert.ok([...seen].some((id) => accessoryById(id).shop === shop), `${shop} sells its own`);
    assert.ok([...seen].some((id) => !accessoryById(id).shop), `${shop} sells shared ones too`);
  }
  const exclusive = (shop) => STYLE_ITEMS.filter((x) => x.shop === shop).map((x) => x.id);
  for (const id of ['lanyard', 'necktie', 'holologo', 'mug', 'briefcase']) assert.ok(exclusive('exchange').includes(id));
  for (const id of ['spikedcollar', 'bandolier', 'glitchmoth', 'burner', 'spraycan']) assert.ok(exclusive('black').includes(id));
  // Drops (no shop) can be anything sold in the region.
  const drops = new Set();
  for (let i = 0; i < 4000; i++) drops.add(rollAccessory([], rng, 'public'));
  assert.ok(drops.has('lanyard') && drops.has('burner'));
});

test('an accessory offer at a market comes from that kind\'s stock', () => {
  for (const flavor of ['corp', 'black']) {
    for (let seed = 1; seed <= 40; seed++) {
      const { s, next } = marketAhead(flavor);
      moveTo(s, next.id, mulberry32(seed));
      const acc = s.run.pending.accOffer;
      if (!acc) continue;
      const shop = accessoryById(acc).shop;
      assert.ok(!shop || shop === (flavor === 'corp' ? 'exchange' : 'black'), `${acc} at a ${flavor} market`);
    }
  }
});

test('a market\'s kind survives a save round trip, on the map and in the open choice; older saves read as black', () => {
  const { s, next } = marketAhead('corp');
  moveTo(s, next.id, noRng);
  const back = cleanSave(JSON.parse(JSON.stringify(s)), s.lastTick);
  assert.equal(back.run.map.nodes.find((n) => n.id === next.id).flavor, 'corp');
  assert.equal(back.run.pending.flavor, 'corp');
  const old = JSON.parse(JSON.stringify(s));
  delete old.run.pending.flavor;
  for (const n of old.run.map.nodes) delete n.flavor;
  const cleaned = cleanSave(old, s.lastTick);
  assert.equal(cleaned.run.pending.flavor, 'black');
  assert.notEqual(cleaned.run.map.nodes.find((n) => n.id === next.id).flavor, 'corp', 'a market with no kind is a black one');
});
