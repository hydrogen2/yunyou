/**
 * imagelayer — the ONE definition of how a still is presented.
 *
 * Imported by both:
 *   studio/player/index.html               (v0.7 treatment layer / v0.8 photo schedule, via a boot-time import)
 *   studio/tools/render/render_linear.mjs  (v0.9 renderer: the same treatment, the same slots, in the MP4)
 * so a picture is mounted the same way in the interactive chapter and in the film. Two implementations of
 * pickTreatment() drifting apart within one chapter is the failure mode this file exists to prevent
 * (v0.7 CHANGELOG, "What the RENDERER would need", item 5).
 *
 * Everything here is PURE arithmetic: no DOM, no ffmpeg, no fetch. Each side does its own drawing —
 * CSS `filter: blur()` in the player, `gblur` in ffmpeg — but the decisions come from here.
 *
 * The three rules that are not settings:
 *   never stretch · never upscale past the file's own pixels · never crop the subject away.
 */

export const IMG_DEFAULTS = {
  plate_max_px: 760,        // long side at or under this = small archive material → the paper mount
  plate_min_area: 0.22,     // …but only if the mount still leaves the picture this much of the frame
  fill_coverage: 0.90,      // a contained fit covering this much of the frame needs no help
  blur_px: 36,              // backdrop blur at a 620-px-tall frame; both sides scale it with the frame
  backdrop_brightness: 0.44,// player: brightness(.44). ffmpeg equivalent is eq=brightness=-0.18
  backdrop_saturate: 1.12,
  drift: true, drift_s: 36, drift_from: 0.94, drift_from_plate: 0.97,
  drift_dx: 0.9, drift_dy: 0.7,   // per-cent of the picture, direction seeded from the ref
  fallback_after_s: 6       // v0.8: a still with media[].fallback swaps to it after this long without loading
};

/** FNV-1a. Stable across the player and the renderer: the same picture drifts the same way in both. */
export const hash32 = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

/**
 * Which treatment? Aspect ratio and pixel size decide, so existing scenes improve with no content edit.
 * `m.treatment` (schema: backdrop|plate|fill|none) always wins.
 *   nw,nh = the file's REAL pixels (Commons will report a 1600-px thumb for a 632-px file — ask commonsInfo)
 *   W,H   = the real frame
 */
export function pickTreatment(m, nw, nh, W, H, cfg = IMG_DEFAULTS) {
  const forced = String((m && m.treatment) || '').toLowerCase();
  if (forced === 'backdrop' || forced === 'plate' || forced === 'fill' || forced === 'none') return forced;
  if (!(nw > 0 && nh > 0 && W > 0 && H > 0)) return 'backdrop';   // unknown size: the backdrop is never wrong
  const ia = nw / nh, ca = W / H;
  const coverage = Math.min(ia / ca, ca / ia);                    // share of the frame a contained fit would cover
  const fit = Math.min(W / nw, H / nh);                           // > 1 means it would have to be upscaled to fill
  if (coverage >= cfg.fill_coverage && fit <= 1.02) return 'fill';
  if (Math.max(nw, nh) <= cfg.plate_max_px) return 'plate';       // it can never fill a modern frame honestly
  return 'backdrop';
}

/**
 * The honest size of a picture inside a frame: contained, and NEVER enlarged past its own pixels.
 * `reserve` is a band kept clear at the bottom for the credit line (the player centres the picture in what
 * is left rather than printing the credit across the subject).
 * Returns integers, and `upscaled:false` always — if it ever says true, something else clamped wrong.
 */
export function fitSize(nw, nh, W, H, reserve = 0) {
  const availH = Math.max(16, H - Math.max(0, reserve));
  const k = Math.min(W / nw, availH / nh, 1);
  return { w: Math.max(2, Math.round(nw * k)), h: Math.max(2, Math.round(nh * k)), k, upscaled: k > 1 };
}

/**
 * The drift, seeded. 0.94 → 1.00 of the honest size, so the motion can never invent resolution, with a
 * ±0.9 % / ±0.7 % translate whose direction is a stable hash of the media ref: the same still drifts the
 * same way in the player, in a screenshot and in the film.
 * `drift:false` on the medium holds one beat still without giving up the backdrop (schema, v0.9).
 */
export function driftFor(m, treat, cfg = IMG_DEFAULTS, ref) {
  const on = cfg.drift !== false && !(m && m.drift === false) && treat !== 'none';
  const from = treat === 'plate' ? cfg.drift_from_plate : cfg.drift_from;
  const h = hash32(String((m && m.ref) || ref || ''));
  return {
    on, from, to: 1, secs: cfg.drift_s,
    dx: ((h & 1) ? 1 : -1) * cfg.drift_dx / 100,
    dy: (((h >> 1) & 1) ? 1 : -1) * cfg.drift_dy / 100
  };
}

/** The backdrop's blur radius for a frame of this size, in the frame's own pixels (player CSS px, ffmpeg px). */
export const blurRadius = (W, H, cfg = IMG_DEFAULTS) => Math.max(14, cfg.blur_px * Math.min(W, H) / 620);

/**
 * v0.8: media[] → {start, end, m} slots on the SCENE clock.
 *   · authored — any entry carrying start_s/end_s: each picture starts at its own second; a missing start_s
 *                inherits the previous entry's end_s; several entries authored over the SAME window share it
 *                evenly. The earliest slot is pulled back to 0 so a photo scene is never black at second 0.
 *   · fallback — no entry carries any timing: the v0.7 even division, max(8 s, duration/n), wrap included.
 * `until` (the first generated asset's start) bounds the list: pictures at or after it belong to the card.
 * end_s bounds a slot but never blanks the frame — the last picture holds rather than cutting to black.
 */
export function imageSlots(imgs, duration, until) {
  const n = imgs.length; if (!n) return [];
  const num = v => { const x = +v; return Number.isFinite(x) ? x : null; };
  const lim = (until != null && isFinite(until)) ? until : duration;
  const timed = imgs.some(m => num(m.start_s) !== null || num(m.end_s) !== null);
  let seq = [];
  if (!timed) {
    const step = Math.max(8, duration / n);
    for (let i = 0; i === 0 || i * step < Math.max(duration, step) - 0.001; i++) seq.push({ start: i * step, end: null, m: imgs[i % n] });
  } else {
    let prev = 0;
    const raw = imgs.map((m, i) => {
      const st = num(m.start_s), en = num(m.end_s); const start = st !== null ? st : prev;
      prev = en !== null ? en : start; return { start: Math.max(0, start), end: en, m, i };
    });
    raw.sort((a, b) => a.start - b.start || a.i - b.i);
    for (let i = 0; i < raw.length;) {
      let j = i; while (j + 1 < raw.length && Math.abs(raw[j + 1].start - raw[i].start) < 0.001) j++;
      const grp = raw.slice(i, j + 1);
      if (grp.length === 1) seq.push(grp[0]);
      else {
        const nextStart = (j + 1 < raw.length) ? raw[j + 1].start : null;
        const ends = grp.map(g => g.end).filter(e => e !== null);
        const gEnd = nextStart !== null ? nextStart : (ends.length ? Math.max.apply(null, ends) : duration);
        const step = Math.max(0.5, (gEnd - grp[0].start) / grp.length);
        grp.forEach((g, k) => seq.push({ start: grp[0].start + k * step, end: g.end, m: g.m }));
      }
      i = j + 1;
    }
    if (seq.length && seq[0].start > 0) seq[0].start = 0;
  }
  return seq.filter(x => x.start < lim - 0.001).sort((a, b) => a.start - b.start);
}

/**
 * The linear cut's extra step: slots → shot lengths. The player holds the last picture until the scene ends;
 * a film has to say how many seconds each shot is. `scale` maps scene time onto the (usually shorter) linear
 * scene, `min_s` is the shortest shot we will cut (below that the picture is a flash, not a look).
 */
export function slotsToShots(slots, duration, len, minS = 3) {
  if (!slots.length) return [];
  const scale = len / Math.max(0.001, duration);
  const out = slots.map((sl, i) => {
    const start = sl.start * scale;
    const next = slots[i + 1] ? slots[i + 1].start * scale : len;
    const end = sl.end != null ? Math.min(next, sl.end * scale) : next;
    return { m: sl.m, at: start, dur: Math.max(0, end - start) };
  }).filter(x => x.dur > 0.05);
  // a shot under min_s is not a shot: give it to its neighbour rather than flashing the picture
  const kept = [];
  for (const s of out) {
    if (s.dur < minS && kept.length) kept[kept.length - 1].dur += s.dur;
    else kept.push(s);
  }
  if (kept.length > 1 && kept[kept.length - 1].dur < minS) { const t = kept.pop(); kept[kept.length - 1].dur += t.dur; }
  return kept;
}
