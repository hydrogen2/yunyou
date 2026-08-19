#!/usr/bin/env node
/**
 * panowalk — fetch open street-level imagery for a chapter's streetview walks, once, for BOTH outputs.
 * The frames it caches are what the player animates in mode `open` AND what the linear renderer cuts into the MP4.
 *
 *   node studio/tools/panowalk/fetch.mjs --chapter products/around-the-world-80-days/day-01-london \
 *        --scene count-the-steps --scene look-up-the-cross [--radius 60] [--max-frames 14] [--dry-run]
 *
 * COST: nothing here is billable. KartaView needs no token and no account. Mapillary is used ONLY if
 * www/config.json already contains a `mapillary_token` — this tool never creates one, never signs up and never
 * accepts terms on anyone's behalf (RULE 0 / DECISIONS.md RULE 1). No Google endpoint is ever contacted.
 *
 * Output (gitignored, regenerable, reused on re-run):
 *   <chapter>/media/files/panos/index.json          what the player and the renderer read
 *   <chapter>/media/files/panos/<stop-id>/frames.json   per-frame lat/lng/heading/timestamp/licence/author/source
 *   <chapter>/media/files/panos/<stop-id>/f000.jpg …
 *
 * Options
 *   --chapter <dir>            chapter directory (required)
 *   --scene <id|file>          repeatable / comma-separated; default: every scene of type "streetview"
 *   --source kartaview|mapillary|both   default both (mapillary only if a token is already configured)
 *   --radius <m>               search radius per waypoint (default 60)
 *   --max-frames <n>           frames kept per stop (default 14)
 *   --min-frames <n>           below this a stop is "no usable imagery" and must fall back (default 3)
 *   --max-yaw <deg>            how far a flat frame may be turned from its own view direction before a named
 *                              look-at cue counts as unservable (default 35; 360° frames ignore this)
 *   --dry-run                  query + score + report, download nothing
 *   --accept-unknown-licence   download frames whose licence the API does not state (a RIGHTS decision, not ours)
 *   --config <file>            default www/config.json (read-only; the founder's Mapillary token lives there)
 *   --report <file>            also write the full report as JSON
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dist, bearing, delta, median, jpegSize } from './lib/geo.mjs';
import * as kartaview from './lib/kartaview.mjs';
import * as mapillary from './lib/mapillary.mjs';
import { classify, gateSequence } from './lib/licence.mjs';
import { describe, selectFrames, spacingOf, verdict } from './lib/score.mjs';
import { planScene } from '../../player/panomove.mjs';   // the same stop timing the player and the renderer use

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../../..');

const argv = process.argv.slice(2); const args = { scene: [] };
for (let i = 0; i < argv.length; i++) {
  const a = argv[i]; if (!a.startsWith('--')) continue;
  const k = a.slice(2), nx = argv[i + 1];
  const v = (nx !== undefined && !nx.startsWith('--')) ? (i++, nx) : true;
  if (k === 'scene') args.scene.push(...String(v).split(',')); else args[k] = v;
}
if (!args.chapter) { console.error('usage: node fetch.mjs --chapter <dir> [--scene id] [--dry-run]'); process.exit(2); }

const CHAPTER = path.resolve(REPO, args.chapter);
const RADIUS = +(args.radius || 60);
const MAXF = +(args['max-frames'] || 14);
const MINF = +(args['min-frames'] || 3);
const MAXYAW = +(args['max-yaw'] || 35);
const DRY = !!args['dry-run'];
const ACCEPT_UNKNOWN = !!args['accept-unknown-licence'];
const SOURCE = String(args.source || 'both');
const OUT = path.join(CHAPTER, 'media', 'files', 'panos');
const CACHE_DIR = path.join(HERE, '.cache');
fs.mkdirSync(CACHE_DIR, { recursive: true });
const cache = {
  read: n => { const f = path.join(CACHE_DIR, n); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null; },
  write: (n, j) => fs.writeFileSync(path.join(CACHE_DIR, n), JSON.stringify(j))
};

let cfg = {};
const cfgPath = path.resolve(REPO, args.config || 'www/config.json');
try { cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8')); } catch { /* no config, no Mapillary — fine */ }
const MLY_TOKEN = SOURCE === 'kartaview' ? '' : mapillary.tokenFrom(cfg);

// ---------------------------------------------------------------- scenes → stops
const parseRef = ref => { const p = String(ref || '').split(',').map(Number); return (p.length >= 2 && isFinite(p[0]) && isFinite(p[1])) ? { lat: p[0], lng: p[1], heading: isFinite(p[2]) ? p[2] : null } : null; };
const sceneDir = path.join(CHAPTER, 'scenes');
let scenes = fs.readdirSync(sceneDir).filter(f => f.endsWith('.scene.json'))
  .map(f => ({ file: path.join(sceneDir, f), json: JSON.parse(fs.readFileSync(path.join(sceneDir, f), 'utf8')) }));
scenes = args.scene.length
  ? scenes.filter(s => args.scene.some(w => s.json.id === w || path.basename(s.file).startsWith(w) || path.basename(s.file) === w))
  : scenes.filter(s => s.json.type === 'streetview');
if (!scenes.length) { console.error('no matching scenes'); process.exit(2); }

const stops = [];
for (const { json: s } of scenes) {
  const route = ((s.interaction || {}).route || []).map(parseRef).filter(Boolean);
  const mediaStops = (s.media || []).filter(m => m.kind === 'streetview').map(m => parseRef(m.ref)).filter(Boolean);
  const wps = route.length ? route : mediaStops;
  const timing = planScene(s);                       // arrival times → how many seconds each stop is on screen
  wps.forEach((wp, k) => {
    const next = wps[k + 1];
    const t0 = timing ? (timing.stops[k].arrive_s || 0) : 0;
    const t1 = timing ? (timing.stops[k + 1] ? timing.stops[k + 1].arrive_s : timing.dur) : 0;
    // cues that belong to this waypoint: explicit at_waypoint, else every cue when the scene has a single stop
    const cues = (s.camera || []).filter(c => (c.at_waypoint != null ? c.at_waypoint === k : wps.length === 1));
    stops.push({
      stop_id: `${s.id}-w${String(k).padStart(2, '0')}`, scene_id: s.id, waypoint_index: k,
      lat: wp.lat, lng: wp.lng, view_heading: wp.heading,
      want_heading: next ? bearing(wp, next) : (wp.heading == null ? 0 : wp.heading),
      leg_to_next_m: next ? Math.round(dist(wp, next)) : null,
      screen_s: +(t1 - t0).toFixed(1),
      cues: cues.map(c => ({ at_s: c.at_s, label: c.label || '', heading: c.heading ?? null, look_at: parseRef(c.look_at), pitch: c.pitch || 0, zoom: c.zoom ?? null }))
    });
  });
}

// ---------------------------------------------------------------- per stop: candidates → one sequence
const report = {
  tool: 'panowalk 0.5', generated_at: new Date().toISOString(), chapter: path.relative(REPO, CHAPTER),
  radius_m: RADIUS, max_frames: MAXF, max_yaw_deg: MAXYAW, dry_run: DRY, source: SOURCE,
  accept_unknown_licence: ACCEPT_UNKNOWN,
  mapillary: MLY_TOKEN ? 'configured (token read from ' + path.relative(REPO, cfgPath) + ')' : 'not configured',
  stops: []
};

// A 360° original is 5,760 x 2,880 / ~1.8 MB — right for the MP4, far too heavy for the player to stream frame by
// frame. So we keep the original for ffmpeg and write a web derivative next to it. ffmpeg comes from the render
// pipeline's node_modules; if it is missing we simply skip the derivative and the player loads the original.
const FFMPEG = path.join(REPO, 'studio/tools/render/node_modules/ffmpeg-static/ffmpeg');
const HAS_FFMPEG = fs.existsSync(FFMPEG);
const WEB_W = +(args['web-width'] || 3072);
function webDerivative(file, w) {
  if (!HAS_FFMPEG || !w || w <= WEB_W * 1.15) return null;
  const out = file.replace(/\.jpg$/, '.web.jpg');
  if (fs.existsSync(out) && fs.statSync(out).size > 2048) return path.basename(out);
  try {
    execFileSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-i', file, '-vf', `scale=${WEB_W}:-2:flags=lanczos`, '-q:v', '4', out], { stdio: 'ignore' });
    return fs.existsSync(out) ? path.basename(out) : null;
  } catch { return null; }
}

async function fetchImage(url, file) {
  if (fs.existsSync(file) && fs.statSync(file).size > 2048) return { file, bytes: fs.statSync(file).size, cached: true, ...(jpegSize(fs.readFileSync(file)) || {}) };
  const r = await fetch(url, { headers: { 'User-Agent': 'YunyouPanowalk/0.5 (studio media pipeline; contact: weizhiwei@gmail.com)' } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 2048) throw new Error('suspiciously small image (' + buf.length + ' B)');
  fs.writeFileSync(file, buf);
  return { file, bytes: buf.length, cached: false, ...(jpegSize(buf) || {}) };
}

/** can a flat frame looking `view` be turned onto every named look-at of this stop? 360° frames always can. */
function cueFit(st, frames, allPano) {
  const pos = { lat: median(frames.map(f => f.lat)), lng: median(frames.map(f => f.lng)) };
  const view = median(frames.map(f => f.view));
  const out = [];
  for (const c of st.cues) {
    const target = c.look_at ? bearing(pos, c.look_at) : c.heading;
    if (target == null) continue;
    const yaw = Math.round(delta(view, target));
    out.push({ at_s: c.at_s, label: c.label, named: !!c.look_at, target: Math.round(target), yaw, ok: allPano || Math.abs(yaw) <= MAXYAW });
  }
  return { view: Math.round(view), cues: out, off: out.filter(c => c.named && !c.ok) };
}

let prevPick = null, prevScene = null;      // continuity: prefer the sequence the previous stop already uses
for (const st of stops) {
  if (st.scene_id !== prevScene) { prevPick = null; prevScene = st.scene_id; }
  const row = { ...st, status: 'no-coverage', candidates: [], notes: [] };
  let cands = [];
  if (SOURCE !== 'mapillary') {
    try { cands = cands.concat(await kartaview.candidates(st, RADIUS, cache)); }
    catch (e) { row.notes.push('kartaview: ' + e.message); }
  }
  if (SOURCE !== 'kartaview') {
    try { cands = cands.concat(await mapillary.candidates(st, RADIUS, cache, { token: MLY_TOKEN, notes: row.notes })); }
    catch (e) { row.notes.push('mapillary: ' + e.message); }
  }

  for (const c of cands) c.continuity_bonus = (prevPick && `${c.source}:${c.sequence_id}` === prevPick) ? 12 : 0;
  const targets = st.cues.filter(c => c.look_at).map(c => c.look_at);
  const scored = cands.map(c => describe(c, st, st.want_heading, RADIUS, targets)).sort((a, b) => b.score - a.score);
  row.candidates = scored.slice(0, 8).map(d => ({
    source: d.source, sequence_id: d.sequence_id, author: d.author, frames: d.frames_in_radius,
    spacing_m: d.spacing_m == null ? null : +d.spacing_m.toFixed(1), date: d.date, mode: d.mode,
    dir_off: Math.round(d.dir_off), pano: d.panos, motion: d.motion, target_m: d.target_m, score: +d.score.toFixed(1),
    parts: Object.fromEntries(Object.entries(d.parts).map(([k, v]) => [k, +v.toFixed(1)]))
  }));

  let picked = null;
  for (const d of scored) {
    if (d.frames_in_radius < MINF) continue;
    const frames = selectFrames(d, st, RADIUS, MAXF).map(f => {
      const lic = f.licence_class ? { class: f.licence_class, licence: f.licence, why: f.licence_why }
        : d.licence_source === 'platform-default' ? { class: 'permissive', licence: d.licence, why: 'KartaView platform licence (review/rights-a6.md: green)' }
          : classify(f.licence_raw);
      return { ...f, licence_class: lic.class, licence: lic.licence, licence_why: lic.why };
    });
    const gate = gateSequence(frames, { acceptUnknown: ACCEPT_UNKNOWN });
    if (!gate.ok) { row.notes.push(`${d.source}/${d.sequence_id}: LICENCE REJECT — ${gate.reason}`); continue; }
    const fit = cueFit(st, frames, d.all_pano);
    if (fit.off.length) {
      row.notes.push(`${d.source}/${d.sequence_id}: view ${fit.view}° cannot reach ${fit.off.map(c => `"${c.label.split('(')[0].trim()}" (${c.yaw > 0 ? '+' : ''}${c.yaw}°)`).join(', ')}`);
      if (!row.off_cue_best) row.off_cue_best = { d, frames, fit, gate };
      continue;
    }
    picked = { d, frames, fit, gate }; break;
  }
  if (picked) prevPick = `${picked.d.source}:${picked.d.sequence_id}`;

  if (!picked) {
    row.status = row.off_cue_best ? 'off-cue' : scored.length ? 'too-few-frames' : 'no-coverage';
    if (row.off_cue_best) { const b = row.off_cue_best; Object.assign(row, { source: b.d.source, sequence_id: b.d.sequence_id, frames: b.frames.length, spacing_m: b.d.spacing_m == null ? null : +b.d.spacing_m.toFixed(1), date: b.d.date, view: b.fit.view, off_cue: b.fit.off }); delete row.off_cue_best; }
    report.stops.push(row); continue;
  }

  const { d, frames, fit } = picked;
  row.status = DRY ? 'would-fetch' : 'ok';
  Object.assign(row, {
    source: d.source, sequence_id: d.sequence_id, sequence_key: `${d.source}:${d.sequence_id}`,
    author: d.author, licence: d.licence || (d.source === 'mapillary' ? 'CC BY-SA 4.0 (platform default — NOT stated per image)' : null),
    licence_url: d.licence_url, licence_source: d.licence_source, attribution: d.attribution,
    requires_logo: !!d.requires_logo, all_pano: d.all_pano, panos: d.panos, reverse: !!d.reverse, span_m: Math.round(d.span_m || 0),
    frames: frames.length, _frames: frames, _d: d, _fit: fit,
    spacing_m: d.spacing_m == null ? null : +d.spacing_m.toFixed(1),
    date: d.date, mode: d.mode, motion: d.motion, dir_off: Math.round(d.dir_off), view: fit.view,
    score: +d.score.toFixed(1), licence_gate: picked.gate.reason
  });
  report.stops.push(row);
}

// ------------------------------------------- one sequence, many stops: partition the frames, never repeat a stretch
const byKey = new Map();
for (const r of report.stops) if (r._frames && r.sequence_key) { const a = byKey.get(r.scene_id + '|' + r.sequence_key) || []; a.push(r); byKey.set(r.scene_id + '|' + r.sequence_key, a); }
for (const group of byKey.values()) {
  if (group.length < 2) continue;
  const pool = new Map();
  for (const r of group) for (const f of r._frames) pool.set(f.id, f);
  for (const r of group) r._frames = [];
  for (const f of pool.values()) {
    let best = group[0], bd = Infinity;
    for (const r of group) { const dd = dist(f, r); if (dd < bd) { bd = dd; best = r; } }
    best._frames.push(f);
  }
  for (const r of group) {
    r._frames.sort((a, b) => a.seq_index - b.seq_index);
    r.frames = r._frames.length;
    r.shared_sequence = group.map(g => g.stop_id).join(' + ');
    if (r.frames < MINF) { r.status = 'too-few-frames'; r.notes.push(`after splitting ${r.sequence_key} between ${r.shared_sequence}, only ${r.frames} frame(s) left`); }
  }
}
for (const r of report.stops) {
  if (!r._frames) continue;
  r.spacing_m = (x => x == null ? null : +x.toFixed(1))(spacingOf(r._frames));
  const spanSel = r._frames.length > 1 ? dist(r._frames[0], r._frames[r._frames.length - 1]) : 0;
  r.span_m = Math.round(spanSel);
  // HOW FAST THE WALK WILL LOOK. The scene, not the imagery, sets this: 100 m of street in a 15 s beat is 7 m/s
  // however good the frames are. Below ~2 m/s it reads as a walk; above ~4 m/s it is a hyperlapse, and the only
  // cures are a longer beat or a shorter leg — both content decisions.
  r.pace_ms = r.screen_s > 0 ? +(spanSel / r.screen_s).toFixed(1) : null;
  r.pace_reads_as = r.pace_ms == null ? 'unknown' : r.pace_ms <= 2 ? 'a walk' : r.pace_ms <= 4 ? 'a brisk walk' : 'a hyperlapse';
  r.verdict = verdict(r.spacing_m, r.all_pano, r.motion, r.span_m) + (r.pace_ms == null ? '' : ` — on this scene's clock ${r.span_m} m in ${r.screen_s} s = ${r.pace_ms} m/s, which reads as ${r.pace_reads_as}`);
}

// ---------------------------------------------------------------- download + manifests
if (!DRY) {
  for (const r of report.stops) {
    if (r.status !== 'ok' || !r._frames) continue;
    const d = r._d, frames = r._frames;
    const dir = path.join(OUT, r.stop_id);
    fs.mkdirSync(dir, { recursive: true });
    const out = []; let bytes = 0, reused = 0;
    for (let i = 0; i < frames.length; i++) {
      const f = frames[i], name = `f${String(i).padStart(3, '0')}.jpg`;
      let got;
      try {
        // Mapillary's signed URLs expire and the bbox search sometimes omits them: re-resolve per frame at
        // download time (entity endpoint, free) and retry once if the CDN rejects a stale signature.
        if (d.source === 'mapillary' && !fs.existsSync(path.join(dir, name)))
          f.image_url = await mapillary.resolveImageUrl(f.id, MLY_TOKEN, f.is_pano) || f.image_url;
        got = await fetchImage(f.image_url, path.join(dir, name));
      }
      catch (e) { r.notes.push(`frame ${f.id}: ${e.message} — skipped`); continue; }
      bytes += got.bytes; if (got.cached) reused++;
      const web = webDerivative(path.join(dir, name), got.w || f.w);
      if (web) bytes += fs.statSync(path.join(dir, web)).size;
      out.push({
        file: name, web: web || null, id: f.id, seq_index: f.seq_index, lat: f.lat, lng: f.lng,
        // ref_heading = the world bearing at the CENTRE of this image. Everything downstream (player yaw, ffmpeg
        // v360 yaw) is measured from it. For a 360° frame that is the camera compass — verified by rendering
        // count-the-steps-w06/f006 at yaw = 168° - 245.8° and getting the Reform Club's "104" doorway. For a flat
        // frame the compass is unreliable (KartaView seq 1124 states 160° while the dashcam looks along its 240°
        // travel; Mapillary's compass_angle is often 180° out from computed_compass_angle), so we use the travel
        // bearing between consecutive frames, which comes from GPS and is self-consistent.
        ref_heading: +(f.is_pano ? (f.heading_stated ?? f.view) : f.view).toFixed(1),
        view: +f.view.toFixed(1), heading_stated: +(f.heading_stated ?? f.heading ?? 0).toFixed(1),
        timestamp: f.timestamp, w: got.w || f.w, h: got.h || f.h,
        projection: f.projection, is_pano: !!f.is_pano, bytes: got.bytes,
        licence: f.licence || r.licence, licence_class: f.licence_class, author: d.author, source: d.source,
        source_url: f.page_url, image_url: f.image_url
      });
    }
    r.frames = out.length; r.bytes = bytes; r.reused = reused;
    if (out.length < MINF) { r.status = 'too-few-frames'; r.notes.push(`only ${out.length} frame(s) downloaded`); continue; }
    fs.writeFileSync(path.join(dir, 'frames.json'), JSON.stringify({
      stop_id: r.stop_id, scene_id: r.scene_id, waypoint_index: r.waypoint_index,
      waypoint: { lat: r.lat, lng: r.lng, view_heading: r.view_heading, want_heading: +r.want_heading.toFixed(1) },
      source: d.source, sequence_id: d.sequence_id, sequence_key: r.sequence_key, shared_sequence: r.shared_sequence || null,
      author: d.author, licence: r.licence, licence_url: d.licence_url, licence_source: d.licence_source,
      attribution: d.attribution, requires_logo: !!d.requires_logo,
      projection: r.all_pano ? 'SPHERE' : 'PLANE', all_pano: !!r.all_pano, reverse: !!r.reverse,
      spacing_m: r.spacing_m, span_m: r.span_m, screen_s: r.screen_s, pace_ms: r.pace_ms, pace_reads_as: r.pace_reads_as,
      view_bearing: r.view, motion: r.motion, mode: r.mode, date: r.date,
      nearest_named_target_m: r.target_m,
      verdict: r.verdict, cue_fit: r._fit.cues, radius_m: RADIUS,
      fetched_at: new Date().toISOString(), frames: out
    }, null, 1));
  }
  fs.mkdirSync(OUT, { recursive: true });
  const keep = r => ({
    stop_id: r.stop_id, scene_id: r.scene_id, waypoint_index: r.waypoint_index, lat: r.lat, lng: r.lng,
    want_heading: +r.want_heading.toFixed(1), source: r.source, sequence_id: r.sequence_id, sequence_key: r.sequence_key,
    shared_sequence: r.shared_sequence || null, author: r.author, licence: r.licence, licence_url: r.licence_url,
    attribution: r.attribution, requires_logo: r.requires_logo, frames: r.frames, spacing_m: r.spacing_m,
    span_m: r.span_m, screen_s: r.screen_s, pace_ms: r.pace_ms, pace_reads_as: r.pace_reads_as,
    date: r.date, mode: r.mode, motion: r.motion, all_pano: !!r.all_pano, reverse: !!r.reverse,
    view: r.view, verdict: r.verdict
  });
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify({
    tool: report.tool, generated_at: report.generated_at, radius_m: RADIUS,
    licence_note: 'Every frame carries its own licence in <stop>/frames.json. Nothing NC/ND is ever downloaded; frames whose licence the API does not state are only present when a human passed --accept-unknown-licence.',
    accept_unknown_licence: ACCEPT_UNKNOWN,
    stops: report.stops.filter(r => r.status === 'ok').map(keep),
    missing: report.stops.filter(r => r.status !== 'ok').map(r => ({
      stop_id: r.stop_id, scene_id: r.scene_id, waypoint_index: r.waypoint_index, lat: r.lat, lng: r.lng,
      status: r.status, off_cue: r.off_cue || null, why: r.notes.slice(0, 3)
    }))
  }, null, 1));
}
for (const r of report.stops) { delete r._frames; delete r._d; delete r._fit; }
if (args.report) fs.writeFileSync(path.resolve(REPO, args.report), JSON.stringify(report, null, 1));

// ---------------------------------------------------------------- console report
const pad = (s, n) => String(s ?? '').padEnd(n).slice(0, n);
console.log(`\npanowalk ${DRY ? '(dry run — nothing downloaded)' : ''}  chapter ${report.chapter}  radius ${RADIUS} m  max ${MAXF} frames/stop  max yaw ${MAXYAW}°`);
console.log(`sources: ${SOURCE}   mapillary: ${report.mapillary}   unknown-licence frames: ${ACCEPT_UNKNOWN ? 'ACCEPTED (--accept-unknown-licence)' : 'rejected'}`);
console.log('\n' + pad('stop', 22) + pad('status', 14) + pad('source', 11) + pad('seq', 24) + pad('n', 4) + pad('space', 8) + pad('pace', 22) + pad('date', 12) + 'verdict');
console.log('-'.repeat(150));
for (const r of report.stops) {
  console.log(pad(r.stop_id, 22) + pad(r.status, 14) + pad(r.source || '—', 11) + pad(r.sequence_id || '—', 24) +
    pad(r.frames ?? 0, 4) + pad(r.spacing_m == null ? '—' : r.spacing_m + 'm', 8) +
    pad(r.pace_ms == null ? '—' : `${r.pace_ms} m/s = ${r.pace_reads_as}`, 22) + pad(r.date || '—', 12) +
    (r.verdict || (r.status === 'no-coverage' ? 'NO open imagery here — this stop must fall back to embed' : r.status === 'off-cue' ? 'imagery exists but faces away from the named look-at — falls back to embed' : '')));
  for (const n of r.notes) console.log('    · ' + n);
  if (DRY) for (const c of r.candidates) console.log(`    ~ ${c.source}/${c.sequence_id} ${c.frames}f ${c.spacing_m ?? '—'}m ${c.date} dir${c.dir_off}° pano${c.pano} ${c.motion} score ${c.score} ${JSON.stringify(c.parts)}`);
}
const ok = report.stops.filter(r => r.status === 'ok' || r.status === 'would-fetch').length;
console.log(`\n${ok}/${report.stops.length} stops have usable open imagery.` + (DRY ? '  (dry run)' : `  cache: ${path.relative(REPO, OUT)}`));
if (!DRY) {
  let tot = 0; for (const r of report.stops) tot += r.bytes || 0;
  console.log(`bytes written/reused: ${(tot / 1e6).toFixed(1)} MB`);
}
