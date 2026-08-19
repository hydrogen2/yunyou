/**
 * Pick ONE sequence per stop. Never blend sources inside a continuous move: a stop's frames all come from a single
 * sequence of a single provider, and the fetcher records the sequence key so consecutive stops that share it are
 * treated as one uninterrupted leg (and their frames are partitioned, never repeated).
 *
 * What "good" means for a walking shot, in order of weight:
 *   coverage   more frames inside the radius = more move
 *   spacing    a walk is 3–8 m between frames; a dashcam is 20–30 m and reads as a hyperlapse. The curve peaks at
 *              6 m and decays, so a 25 m dashcam scores ~4/25 and `verdict` says "hyperlapse" out loud.
 *   direction  the imagery must TRAVEL the way the traveller walks, or the move plays backwards
 *   pano       a 360° frame can be looked around in, so the scene's `camera` cues become real turns: worth a lot
 *   pedestrian derived from the implied speed between frames (KartaView has no flag; Mapillary has camera_type)
 *   recency    a 2016 frame is a different London from a 2026 one
 *
 * VIEW DIRECTION is derived from the travel bearing between consecutive frames, not from the provider's heading
 * field. Both providers lie: KartaView seq 1124 reports heading ~160° while the dashcam demonstrably looks along
 * its 240° travel direction (frame 831 checked by eye), and Mapillary's `compass_angle` is often ~180° out from its
 * own `computed_compass_angle`. Position deltas come from GPS and are the only self-consistent signal.
 */
import { dist, bearing, delta, median, norm } from './geo.mjs';

const gauss = (x, mu, sigma) => Math.exp(-(((x - mu) / sigma) ** 2));

/** annotate every frame of a sequence with the direction the camera is really pointing */
export function viewDirections(all) {
  for (let i = 0; i < all.length; i++) {
    const prev = all[i - 1], next = all[i + 1], f = all[i];
    let v = null;
    if (next && dist(f, next) > 1) v = bearing(f, next);
    else if (prev && dist(prev, f) > 1) v = bearing(prev, f);
    f.view = v == null ? norm(f.heading || 0) : norm(v);
    f.heading_offset = Math.round(delta(f.view, f.heading || 0));
  }
  return all;
}

export function describe(cand, wp, want, radius, targets = []) {
  viewDirections(cand.all);
  const runIdx = cand.all.map((f, i) => ({ f, i })).filter(x => dist(x.f, wp) <= radius).map(x => x.i);
  const inside = runIdx.map(i => cand.all[i]);
  const gaps = [];
  for (let i = 1; i < inside.length; i++) gaps.push(dist(inside[i - 1], inside[i]));
  const dts = [];
  for (let i = 1; i < inside.length; i++) { const dt = inside[i].epoch - inside[i - 1].epoch; if (dt > 0 && dt < 120) dts.push(dist(inside[i - 1], inside[i]) / dt); }
  const spacing = gaps.length ? median(gaps) : null;
  const speed = dts.length ? median(dts) : null;                       // m/s
  const travel = inside.length > 1 ? bearing(inside[0], inside[inside.length - 1]) : (inside[0] ? inside[0].view : 0);
  const view = median(inside.map(f => f.view));
  const dirOff = Math.abs(delta(travel, want));                        // 0 = the imagery travels the way we walk
  const panos = inside.filter(f => f.is_pano).length;
  const allPano = panos === inside.length && panos > 0;
  const camType = (inside[0] || {}).camera_type || '';
  let mode = 'unknown';
  if (speed != null && speed <= 2.5) mode = 'pedestrian';
  else if (speed != null && speed >= 5) mode = 'vehicle';
  else if (speed != null) mode = 'slow-vehicle';
  if (mode === 'unknown' && /fisheye|spherical|equirectangular/i.test(camType)) mode = 'unknown-handheld';
  const years = inside[0] && inside[0].epoch ? (Date.now() / 1000 - inside[0].epoch) / (365.25 * 86400) : 20;
  const first = inside[0] ? inside[0].timestamp.slice(0, 10) : '';

  const span = inside.length > 1 ? dist(inside[0], inside[inside.length - 1]) : 0;   // a standing burst is not a walk
  const parts = {
    coverage: Math.min(inside.length, 10) * 4,                                   // 0–40
    spacing: spacing == null ? 0 : 25 * gauss(spacing, 6, 7),                     // 0–25, peaks at a walking stride
    span: 15 * Math.max(0, Math.min(1, span / 60)),                               // 0–15, rewards ground covered
    direction: 15 * Math.max(0, Math.cos(dirOff * Math.PI / 180)),                // 0–15
    pano: allPano ? 20 : panos ? 8 : 0,                                           // a sphere can honour every camera cue
    pedestrian: mode === 'pedestrian' ? 15 : mode === 'slow-vehicle' ? 8 : mode.startsWith('unknown') ? 5 : 0,
    recency: 20 * Math.exp(-years / 6),                                           // 0–20
    continuity: cand.continuity_bonus || 0,                                       // same sequence as the stop before
    // a cue that names a place has to be SEEN: reward sequences that actually get near the thing being named
    target: !targets.length ? 0 : 14 * median(targets.map(tg => {
      let best = Infinity; for (const f of inside) best = Math.min(best, dist(f, tg));
      return Math.exp(-best / 45);
    })),
    penalty: (dirOff > 120 && !allPano) ? -25 : 0                                 // the imagery runs against the walk
  };
  const score = Object.values(parts).reduce((a, b) => a + b, 0);
  // A 360° sequence can be turned to any heading, so it can honour the walk direction even when the capture ran the
  // other way: we play its frames in reverse. A flat sequence cannot, so a >60° mismatch degrades to a held look.
  const canMove = inside.length >= 3 && span >= 15 && (allPano || dirOff <= 60);
  return {
    ...cand, frames_in_radius: inside.length, inside, runIdx, spacing_m: spacing, speed_ms: speed, span_m: span,
    travel_bearing: travel, view_bearing: view, dir_off: dirOff, mode, date: first, panos, all_pano: allPano,
    target_m: targets.length ? Math.round(Math.min(...targets.map(tg => Math.min(...inside.map(f => dist(f, tg)))))) : null,
    motion: canMove ? 'move' : 'look', reverse: !!(allPano && dirOff > 120),
    parts, score
  };
}

/** Extend the in-radius run along the sequence so the stop has some approach, capped at maxFrames. */
export function selectFrames(cand, wp, radius, maxFrames, extendFactor = 2.2) {
  const idx = new Set(cand.runIdx);
  const far = radius * extendFactor;
  let lo = Math.min(...cand.runIdx), hi = Math.max(...cand.runIdx);
  while (idx.size < maxFrames) {
    const before = lo - 1, after = hi + 1;
    const canB = before >= 0 && dist(cand.all[before], wp) <= far;
    const canA = after < cand.all.length && dist(cand.all[after], wp) <= far;
    if (!canB && !canA) break;
    if (canB) { idx.add(before); lo = before; if (idx.size >= maxFrames) break; }   // approach side first
    if (canA) { idx.add(after); hi = after; }
  }
  const out = [...idx].sort((a, b) => a - b).map(i => cand.all[i]);
  if (out.length > maxFrames) {                                        // thin evenly if we overshot
    const stride = out.length / maxFrames, keep = [];
    for (let k = 0; k < maxFrames; k++) keep.push(out[Math.round(k * stride)]);
    return keep.filter(Boolean);
  }
  return out;
}

export const spacingOf = frames => {
  const g = []; for (let i = 1; i < frames.length; i++) g.push(dist(frames[i - 1], frames[i]));
  return g.length ? median(g) : null;
};

export const verdict = (spacing, allPano, motion, span) =>
  spacing == null ? 'single frame — a still, not a move'
    : motion === 'look' ? `held look${allPano ? ' (360° — the camera can still turn)' : ''} — too little travel, or the imagery runs against this leg`
      : spacing <= 8 ? `walking pace${allPano ? ', 360°' : ''}${span ? ` over ${Math.round(span)} m` : ''}`
        : spacing <= 15 ? `brisk — reads as a fast walk${allPano ? ', 360°' : ''}${span ? ` over ${Math.round(span)} m` : ''}`
          : `hyperlapse (frames ${Math.round(spacing)} m apart — a vehicle, not a walk)`;
