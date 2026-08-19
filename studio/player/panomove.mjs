/**
 * panomove — the ONE definition of the open-imagery walk move.
 *
 * Imported by both:
 *   studio/player/index.html          (streetview mode `open`, via a dynamic import)
 *   studio/tools/render/render_linear.mjs  (visual kind `panowalk`, via a relative import)
 * so the interactive walk and the walk in the MP4 are the same move over the same cached frames.
 *
 * Projection model — deliberately simple, and identical on both sides.
 *   Every cached frame covers a known slice of the world: a 360° frame covers 360°x180° (equirectangular), a flat
 *   frame covers about 70° horizontally. Showing a heading means taking a WINDOW out of that slice. We treat the
 *   window as a straight cylindrical crop (crop + scale), not a rectilinear re-projection: vertical lines stay
 *   vertical, horizontals bow a little at wide fields of view. That is one crop in CSS and one crop in ffmpeg,
 *   which is why the two outputs can be identical. (v360 would be more correct and impossible to match in CSS.)
 *
 * `ref_heading` on each frame is the world bearing at the CENTRE of the image; the fetcher works it out per source
 * (camera compass for 360° frames, GPS travel bearing for flat ones) and writes it into frames.json.
 */
export const DEFAULTS = {
  fov_deg: 82,          // horizontal field of the window at zoom 1
  fov_min: 34, fov_max: 104,
  fade_s: 0.55,         // cross-fade between consecutive frames
  drift: 0.055,         // "breathing": how far the window pushes in across one frame's screen time
  flat_hfov: 70,        // assumed horizontal coverage of a flat street-level photo
  max_flat_yaw: 26,     // a flat frame may be turned this far off its own centre; beyond that we clamp
  pitch_max: 34,
  min_frame_s: 0.9      // never flash a frame faster than this; frames are dropped instead
};

export const norm360 = d => ((d % 360) + 360) % 360;
export const deltaDeg = (from, to) => { let d = norm360(to) - norm360(from); if (d > 180) d -= 360; if (d < -180) d += 360; return d; };
export const zoomToFov = (z, o = DEFAULTS) => Math.max(o.fov_min, Math.min(o.fov_max, (z == null ? o.fov_deg : o.fov_deg / Math.pow(1.35, z - 0.85))));

/**
 * Lay the frames of one stop out on the scene timeline.
 * @param {object} stop   frames.json (needs frames[], motion, reverse, waypoint)
 * @param {number} t0,t1  scene seconds this stop owns
 * @returns {{segments:Array, motion:string}} segments in time order, each with the frame it shows
 */
export function planStop(stop, t0, t1, opt = {}) {
  const o = { ...DEFAULTS, ...opt };
  const span = Math.max(0.5, t1 - t0);
  let frames = (stop.frames || []).slice();
  if (!frames.length) return { segments: [], motion: 'none' };
  if (stop.reverse) frames.reverse();

  if (stop.motion === 'look' || frames.length === 1) {
    // not a walk: the imagery does not travel this leg, so hold the frame nearest the waypoint and only breathe
    const wp = stop.waypoint || frames[0];
    let best = frames[0], bd = Infinity;
    for (const f of frames) { const d = (f.lat - wp.lat) ** 2 + (f.lng - wp.lng) ** 2; if (d < bd) { bd = d; best = f; } }
    return { segments: [{ i: 0, frame: best, t0, t1, fade: Math.min(o.fade_s, span / 4), dir: 1 }], motion: 'look' };
  }
  // a walk: share the segment evenly, dropping frames rather than flashing them
  let n = frames.length;
  if (span / n < o.min_frame_s) {
    const keep = Math.max(2, Math.floor(span / o.min_frame_s));
    const stride = n / keep, thinned = [];
    for (let k = 0; k < keep; k++) thinned.push(frames[Math.min(n - 1, Math.round(k * stride))]);
    frames = thinned; n = frames.length;
  }
  const dt = span / n, fade = Math.min(o.fade_s, dt * 0.45);
  return {
    segments: frames.map((frame, i) => ({ i, frame, t0: t0 + i * dt, t1: t0 + (i + 1) * dt, fade, dir: i % 2 ? -1 : 1 })),
    motion: 'move'
  };
}

/** how far through its own screen time this segment is, 0..1 */
export const segProgress = (seg, t) => Math.max(0, Math.min(1, (t - seg.t0) / Math.max(0.001, seg.t1 - seg.t0)));

/**
 * The window to show, as fractions of the source image. `x` may fall outside [0,1] for a 360° frame: the caller
 * wraps (CSS: repeat-x; ffmpeg: the image doubled side by side before the crop).
 * @returns {{x,y,w,h,yaw,clamped}} yaw = the turn actually applied, clamped = a flat frame could not turn far enough
 */
export function windowFor(frame, cam, aspect, opt = {}) {
  const o = { ...DEFAULTS, ...opt };
  const pano = !!frame.is_pano;
  const coverH = pano ? 360 : o.flat_hfov;
  const coverV = pano ? 180 : o.flat_hfov * ((frame.h || 3) / (frame.w || 4));
  const drift = cam.drift || { zoom: 1, dx: 0, dy: 0 };

  let fov = Math.max(o.fov_min, Math.min(o.fov_max, (cam.fov || o.fov_deg) / drift.zoom));
  if (!pano) fov = Math.min(fov, coverH * 0.8);   // leave a few degrees of turning room inside a flat frame
  let yaw = deltaDeg(frame.ref_heading || 0, cam.heading || 0);
  let clamped = false;
  if (!pano) {
    const room = Math.min(o.max_flat_yaw, Math.max(0, (coverH - fov) / 2));
    if (Math.abs(yaw) > room) { yaw = Math.sign(yaw) * room; clamped = true; }
  }
  let pitch = Math.max(-o.pitch_max, Math.min(o.pitch_max, cam.pitch || 0));
  const fovV = fov / aspect;
  if (!pano) pitch = Math.max(-(coverV - fovV) / 2, Math.min((coverV - fovV) / 2, pitch));

  const w = Math.min(1, fov / coverH), h = Math.min(1, fovV / coverV);
  // centre of the window, in image fractions: yaw right = move right; pitch up = move up
  let cx = 0.5 + (yaw + drift.dx * fov) / coverH;
  let cy = 0.5 - (pitch + drift.dy * fovV) / coverV;
  let x = cx - w / 2, y = cy - h / 2;
  if (!pano) { x = Math.max(0, Math.min(1 - w, x)); }
  y = Math.max(0, Math.min(Math.max(0, 1 - h), y));
  return { x, y, w, h, yaw, pitch, fov, clamped, pano };
}

/**
 * When a cue NAMES a place (look_at), the traveller must actually see it, so we cut to the frame with the best
 * vantage point instead of whatever frame the clock is on. "Best" = closest to the target, which is the honest
 * proxy we have: proximity does not guarantee line of sight, and the fetcher's report says so out loud.
 */
export function frameForCue(frames, target) {
  let best = null, bd = Infinity;
  for (const f of frames) {
    const d = (f.lat - target.lat) ** 2 + (f.lng - target.lng) ** 2;
    if (d < bd) { bd = d; best = f; }
  }
  return best;
}

/**
 * A `camera` cue was authored for the stop's own coordinates. The frame we cut to can be 20–80 m further from the
 * target, which would send the cue's pitch into the sky and shrink the landmark. Rescale both so the landmark is
 * framed the way the cue meant: pitch by the tangent ratio, field of view by the angular-size ratio.
 */
export function retarget(cam, dRef, dAct, opt = {}) {
  const o = { ...DEFAULTS, ...opt };
  if (!(dRef > 1) || !(dAct > 1)) return cam;
  // clamped: a frame that ends up 3 m from a façade would otherwise zoom into a doorknob, and one 100 m away
  // would open to a fisheye. 0.7–1.6 keeps the landmark recognisable either way.
  const k = Math.max(0.7, Math.min(1.6, dRef / dAct));
  const pitch = Math.atan(Math.tan((cam.pitch || 0) * Math.PI / 180) * k) * 180 / Math.PI;
  const fov = Math.max(o.fov_min, Math.min(o.fov_max, (cam.fov || o.fov_deg) * k));
  return { ...cam, pitch, fov };
}

/** the slow push that keeps a still frame alive; f = 0..1 through the segment */
export function driftAt(seg, f, opt = {}) {
  const o = { ...DEFAULTS, ...opt };
  const e = f * f * (3 - 2 * f);                       // smoothstep, so consecutive frames do not jerk
  // the pan stays inside the zoom, so the end window is always contained in the start window: that is what lets
  // ffmpeg reproduce the same breathing with one crop plus one zoompan.
  return { zoom: 1 + o.drift * e, dx: seg.dir * 0.04 * (e - 0.5), dy: -0.02 * (e - 0.5) };
}

/**
 * Port of the player's svPlan for consumers that have no player (the linear renderer). Mirrors it exactly: stops
 * from interaction.route (else the streetview media), arrival times from overlays[].at_waypoint so the turn and the
 * pin coincide, camera cues normalised and sorted. smoke_panowalk.mjs asserts the two agree on scene 04.
 */
export function planScene(scene) {
  const parse = ref => { const p = String(ref || '').split(',').map(Number); return (p.length >= 2 && isFinite(p[0]) && isFinite(p[1])) ? { lat: p[0], lng: p[1], heading: isFinite(p[2]) ? p[2] : null, pitch: isFinite(p[3]) ? p[3] : 0, fov: isFinite(p[4]) ? p[4] : null } : null; };
  const route = (((scene.interaction || {}).route) || []).map(parse).filter(Boolean);
  const media = (scene.media || []).filter(m => m.kind === 'streetview').map(m => parse(m.ref)).filter(Boolean);
  const stops = route.length ? route : media;
  if (!stops.length) return null;
  const dur = scene.duration_s || 60;
  const arrive = stops.map(() => null); arrive[0] = 0;
  (scene.overlays || []).forEach(o => { const k = o.at_waypoint; if (Number.isInteger(k) && k > 0 && k < stops.length) { const t = +o.at_s || 0; if (arrive[k] == null || t < arrive[k]) arrive[k] = t; } });
  const span = dur * 0.72;
  for (let k = 1; k < stops.length; k++) if (arrive[k] == null) arrive[k] = span * k / (stops.length - 1);
  for (let k = 1; k < stops.length; k++) arrive[k] = Math.max(arrive[k], arrive[k - 1] + 2);
  stops.forEach((st, k) => st.arrive_s = arrive[k]);
  let cues = (scene.camera || []).map(c => ({
    at_s: Math.max(0, +c.at_s || 0), heading: isFinite(c.heading) ? +c.heading : null, look_at: parse(c.look_at),
    pitch: isFinite(c.pitch) ? +c.pitch : 0, zoom: isFinite(c.zoom) ? +c.zoom : null,
    hold_s: isFinite(c.hold_s) ? +c.hold_s : 0, ease_s: isFinite(c.ease_s) ? +c.ease_s : 1.8, label: c.label || ''
  })).filter(c => c.heading != null || c.look_at).sort((a, b) => a.at_s - b.at_s);
  if (!cues.length) cues = stops.filter(st => st.heading != null).map(st => ({ at_s: st.arrive_s, heading: st.heading, look_at: null, pitch: st.pitch || 0, zoom: null, hold_s: Math.min(4, dur / 8), ease_s: 1.8, label: 'stop heading' }));
  return { stops, cues, dur };
}

export function distM(a, b) {
  const R = Math.PI / 180, la1 = a.lat * R, la2 = b.lat * R, dla = (b.lat - a.lat) * R, dlo = (b.lng - a.lng) * R;
  const h = Math.sin(dla / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dlo / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.min(1, Math.sqrt(h)));
}
export function bearingDeg(a, b) {
  const R = Math.PI / 180, la1 = a.lat * R, la2 = b.lat * R, dlo = (b.lng - a.lng) * R;
  const y = Math.sin(dlo) * Math.cos(la2), x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dlo);
  return norm360(Math.atan2(y, x) * 180 / Math.PI);
}

/**
 * Port of the player's svCameraAt for consumers that have no player (the linear renderer).
 * Same contract as v0.4: stops with arrive_s, `camera` cues that win while they hold, travel bearing in between.
 */
export function cameraTrack(stops, cues, t, baseFov = DEFAULTS.fov_deg) {
  const bearing = bearingDeg;
  let k = 0; for (let i = 0; i < stops.length; i++) if (t >= stops[i].arrive_s) k = i;
  const cur = stops[k], nxt = stops[k + 1];
  let cue = null; for (const c of cues) { if (c.at_s <= t) cue = c; else break; }
  const live = !!(cue && t < cue.at_s + Math.max(cue.hold_s || 0, cue.ease_s || 0));
  const pos = cur;
  const travel = nxt ? bearing(cur, nxt) : (cur.heading != null ? cur.heading : 0);
  let heading = travel, pitch = 0, fov = baseFov;
  if (live) {
    heading = cue.look_at ? bearing(pos, cue.look_at) : cue.heading;
    pitch = cue.pitch || 0;
    if (cue.zoom != null) fov = zoomToFov(cue.zoom);
  } else if (!nxt && cur.heading != null) heading = cur.heading;
  return { heading: norm360(heading), pitch, fov, stop: k, cue: live ? cue : null };
}
