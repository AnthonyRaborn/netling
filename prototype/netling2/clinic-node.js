// The clinic node on the netrun map (docs/NETLING_2_CARE_DRAFTS.md, Clinic look). Drawn like the 1.0 nodes in src/netrun/view.js
// (canvas rects, a fixed color so the type reads at a glance in every region), as an addition for the 2.0 map; nothing in src/ is
// changed. A thick plus: the one node shape with four equal arms, no box and no circle (the markets are boxes, the relay a circle with
// one bar, the checkpoint two bars). Pink-lilac is not used by any 1.0 node (ICE takes the region's accent, #ff2a6d, which is red).
export const CLINIC_COLOR = '#ff71ce';

// The map label (the cursor line) and the hint after it, per egg, in the style of 'CORP EXCHANGE' / 'safe, pricier. leans corp.'.
export const CLINIC_LABELS = { program: 'REPAIR SHOP', iron: 'WORKSHOP', wetware: 'CLINIC' };
export const CLINIC_HINTS = { program: 'fixes bugs. no side.', iron: 'reworks errata. no side.', wetware: 'closes scars. no side.' };

// First-run caption, in the style of TUTORIAL_TIPS (two lines of about 46 characters at most).
export const CLINIC_TIPS = {
  program: ['bugs only clear at a repair shop.', 'it takes no side.'],
  iron: ['errata only clear at a workshop.', 'it takes no side.'],
  wetware: ['scars only close at a clinic.', 'it takes no side.'],
};

export function drawClinicNode(ctx, x, y, spent) {
  ctx.globalAlpha = spent ? 0.45 : 1;
  ctx.fillStyle = CLINIC_COLOR;
  ctx.fillRect(x - 2, y - 9, 4, 18);
  ctx.fillRect(x - 9, y - 2, 18, 4);
  ctx.globalAlpha = 1;
}
