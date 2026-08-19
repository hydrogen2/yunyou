/**
 * Mapillary adapter — free tier, token required, NOBODY here may create one.
 *
 * RULE 0 / RULE 1: the studio never signs up for anything on the founder's behalf and never accepts terms for them.
 * This adapter is inert unless `www/config.json` already carries a `mapillary_token` (the founder supplied one on
 * 2026-08-19). It calls `graph.mapillary.com` only — free at our volume (documented limits: 60,000 entity req/min,
 * 10,000 search req/min, 50,000 tile req/day). No billable SKU is ever touched.
 *
 * LICENCE — read this before trusting anything below.
 *   Mapillary's Terms (15 Feb 2024) say other users' content is CC BY-SA *by default*, and that Mapillary "may
 *   provide access to certain User Content … under a separate set of license terms (such as … CC BY-NC-SA)".
 *   The Graph API states NO per-image licence. Verified 2026-08-19, both endpoints:
 *     /images?fields=id,license      → 200, but every object comes back as {"id": …} with no licence key
 *     /<image_id>?fields=…,license   → 500 {"message":"Tried accessing nonexisting field (license)"}
 *   `organization_id` is likewise absent on every image in central London, so there is no org-vs-user proxy either.
 *   Therefore: this adapter reports licence_class 'unknown' for every frame, and the fetcher REFUSES to download
 *   unknown-licence frames unless a human passes --accept-unknown-licence. That flag is a Rights decision (does the
 *   platform default cover us?), not an engineering one. See studio/tools/panowalk/README.md §Licence.
 *
 * ATTRIBUTION is contractual on top of CC: when we serve the bytes ourselves Mapillary requires the Mapillary mark
 * displayed and a link back to the image page. Every frame carries requires_logo:true and source_url.
 *
 * GEOMETRY: `compass_angle` is the phone/camera compass and is frequently ~180° out; `computed_compass_angle` is the
 * SfM estimate. Neither is trusted for framing — the fetcher derives the view direction from the travel bearing
 * between consecutive frames of the same sequence (see fetch.mjs → viewDirections).
 */
import { bbox, dist } from './geo.mjs';
import { readLicence, classify } from './licence.mjs';

export const NAME = 'mapillary';
const GRAPH = 'https://graph.mapillary.com';
const UA = 'YunyouPanowalk/0.5 (studio media pipeline; contact: weizhiwei@gmail.com)';
const FIELDS = ['id', 'is_pano', 'captured_at', 'compass_angle', 'computed_compass_angle', 'computed_geometry',
  'geometry', 'sequence', 'camera_type', 'width', 'height', 'creator', 'quality_score',
  'thumb_2048_url', 'thumb_original_url'].join(',');
// The bbox search samples: the same call returns a different ~1,200-item subset each time and never a `paging`
// cursor. Merging a few passes converges (4 passes ≈ 1,850 unique of ~1,900 in a 130 m box). Free, so we just do it.
const PASSES = 3;

export function tokenFrom(cfg) { return (cfg && (cfg.mapillary_token || (cfg.panowalk || {}).mapillary_token)) || process.env.MAPILLARY_TOKEN || ''; }

async function searchOnce(token, box, limit = 2000) {
  const [w, s, e, n] = box;
  const r = await fetch(`${GRAPH}/images?access_token=${encodeURIComponent(token)}&fields=${encodeURIComponent(FIELDS)}&bbox=${w},${s},${e},${n}&limit=${limit}`, { headers: { 'User-Agent': UA } });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message || JSON.stringify(j.error));
  return j.data || [];
}

/** Dense areas (the Strand: ~300 images in 60 m) answer "Please reduce the amount of data you're asking for".
 *  Back off the limit first, then quarter the box — the results merge into the same set. */
async function searchBox(token, box, notes, depth = 0) {
  let lastErr = null;
  for (const limit of [2000, 800, 300]) {
    try { return await searchOnce(token, box, limit); }
    catch (e) { lastErr = e; if (!/reduce the amount of data/i.test(e.message)) break; }
  }
  if (!/reduce the amount of data/i.test(lastErr.message) || depth >= 2) { notes.push('mapillary: ' + lastErr.message); return []; }
  const [w, s, e, n] = box, mx = (w + e) / 2, my = (s + n) / 2;
  const out = new Map();
  for (const q of [[w, s, mx, my], [mx, s, e, my], [w, my, mx, n], [mx, my, e, n]])
    for (const im of await searchBox(token, q, notes, depth + 1)) out.set(im.id, im);
  return [...out.values()];
}

/** Signed thumb URLs expire, and the bbox search sometimes omits them entirely. Resolve fresh at download time. */
export async function resolveImageUrl(id, token, wantPano) {
  const r = await fetch(`${GRAPH}/${id}?access_token=${encodeURIComponent(token)}&fields=thumb_original_url,thumb_2048_url`, { headers: { 'User-Agent': UA } });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message || 'entity lookup failed');
  return (wantPano && j.thumb_original_url) || j.thumb_2048_url || j.thumb_original_url || '';
}

const norm = im => {
  const g = (im.computed_geometry || im.geometry || {}).coordinates;
  if (!g) return null;
  // Some uploads have no thumbnail of any size (verified per image on the entity endpoint: id/width/creator come
  // back but every thumb_*_url is absent). They cannot be fetched, so they must not inflate a sequence's score.
  if (!im.thumb_2048_url && !im.thumb_original_url) return null;
  const lic = classify(readLicence(im));                 // always 'unknown' today — the API has no licence field
  return {
    id: String(im.id),
    seq_index: +im.captured_at || 0,                      // Mapillary has no index; capture time orders the sequence
    lat: g[1], lng: g[0],
    heading_stated: im.computed_compass_angle != null ? +im.computed_compass_angle : (+im.compass_angle || 0),
    heading: im.computed_compass_angle != null ? +im.computed_compass_angle : (+im.compass_angle || 0),
    timestamp: im.captured_at ? new Date(+im.captured_at).toISOString() : '',
    epoch: im.captured_at ? Math.round(+im.captured_at / 1000) : 0,
    w: +im.width || null, h: +im.height || null,
    projection: im.is_pano ? 'SPHERE' : 'PLANE',
    is_pano: !!im.is_pano,
    camera_type: im.camera_type || '',
    quality: im.quality_score ?? null,
    // signed CDN URLs: they expire, so the bytes must be downloaded now and the URL kept only as provenance
    image_url: (im.is_pano && im.thumb_original_url) || im.thumb_2048_url || im.thumb_original_url || '',
    page_url: `https://www.mapillary.com/app/?pKey=${im.id}&focus=photo`,
    licence_raw: readLicence(im),
    licence_class: lic.class, licence: lic.licence, licence_why: lic.why
  };
};

/** candidate sequences whose frames fall within `radius` of the waypoint (searched at radius*reach for extension) */
export async function candidates(wp, radius, cache, { token = '', notes = [], reach = 2.2 } = {}) {
  if (!token) { notes.push('mapillary: not configured (no mapillary_token in www/config.json) — skipped; nothing was signed up for'); return []; }
  const box = bbox(wp.lat, wp.lng, radius * reach);
  const key = `mly_${wp.lat.toFixed(5)}_${wp.lng.toFixed(5)}_${Math.round(radius * reach)}.json`;
  let data = cache && cache.read(key);
  if (!data) {
    const seen = new Map();
    for (let i = 0; i < PASSES; i++) for (const im of await searchBox(token, box, notes)) seen.set(im.id, im);
    data = [...seen.values()];
    if (cache) cache.write(key, data);
  }
  const bySeq = new Map();
  for (const im of data) {
    const f = norm(im); if (!f) continue;
    const sid = String(im.sequence || 'unknown');
    const s = bySeq.get(sid) || { source: NAME, sequence_id: sid, author: (im.creator && (im.creator.username || im.creator.id)) || 'Mapillary contributor', all: [] };
    s.all.push(f); bySeq.set(sid, s);
  }
  const out = [];
  for (const s of bySeq.values()) {
    s.all.sort((a, b) => a.seq_index - b.seq_index);
    const inside = s.all.filter(f => dist(f, wp) <= radius);
    if (!inside.length) continue;
    const panos = s.all.filter(f => f.is_pano).length;
    out.push(Object.assign(s, {
      inside,
      licence: null,                                   // unknown until Rights rules; see the header comment
      licence_url: 'https://www.mapillary.com/terms',
      licence_source: 'not stated by the API (platform default is CC BY-SA; some content is CC BY-NC-SA)',
      attribution: `Mapillary / ${s.author} — CC BY-SA 4.0 (Mapillary platform default; per-image licence not stated by the API)`,
      requires_logo: true, panos,
      is_pano_sequence: panos > 0 && panos >= s.all.length * 0.5
    }));
  }
  return out;
}
