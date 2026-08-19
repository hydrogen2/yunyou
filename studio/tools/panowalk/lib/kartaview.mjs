/**
 * KartaView adapter — FREE, no token, no account, nothing billable.
 *
 * Endpoints (verified working 2026-08-19, see media/manifest-a6.md "Rung 2 in detail"):
 *   POST https://api.openstreetcam.org/1.0/list/nearby-photos/   lat,lng,radius → photos near a point (+ username)
 *   POST https://api.openstreetcam.org/1.0/sequence/photo-list/  sequenceId     → every frame of a sequence
 *   image bytes: https://cdn.kartaview.org/pr:sharp/<base64url("https://<storage>.openstreetcam.org/<name>")>
 *   The legacy storage hosts answer 502 today; the imgproxy CDN above answers 200 with the full-size JPEG.
 *
 * Licence: CC BY-SA 4.0 for all imagery (platform-wide; rights-a6.md = green). No per-image licence field exists,
 * so frames are tagged licence_source:'platform-default' — see lib/licence.mjs.
 */
import { dist } from './geo.mjs';

const API = 'https://api.openstreetcam.org';
export const NAME = 'kartaview';
export const LICENCE = 'CC BY-SA 4.0';
export const LICENCE_URL = 'https://creativecommons.org/licenses/by-sa/4.0/';
const UA = 'YunyouPanowalk/0.5 (studio media pipeline; contact: weizhiwei@gmail.com)';

async function post(pathname, body, { timeout = 60000 } = {}) {
  const ctl = new AbortController(); const to = setTimeout(() => ctl.abort(), timeout);
  try {
    const r = await fetch(API + pathname, {
      method: 'POST', signal: ctl.signal,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': UA },
      body: new URLSearchParams(body).toString()
    });
    if (!r.ok) throw new Error(`kartaview HTTP ${r.status} ${pathname}`);
    return await r.json();
  } finally { clearTimeout(to); }
}

/** storage path ("storage7/files/photo/…jpg") → the imgproxy URL that actually serves bytes */
export function cdnUrl(name, storage) {
  const parts = String(name).split('/');
  const host = storage || parts[0];
  const rest = parts[0] === host ? parts.slice(1).join('/') : parts.join('/');
  const origin = `https://${host}.openstreetcam.org/${rest}`;
  const b64 = Buffer.from(origin, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `https://cdn.kartaview.org/pr:sharp/${b64}`;
}

export const pageUrl = (seq, idx) => `https://kartaview.org/details/${seq}/${idx}`;

/** sequences with at least one photo within `radius` m of (lat,lng) */
export async function nearby(lat, lng, radius) {
  const j = await post('/1.0/list/nearby-photos/', { lat, lng, radius });
  const items = j.currentPageItems || [];
  const seqs = new Map();
  for (const p of items) {
    const s = seqs.get(p.sequence_id) || { sequence_id: p.sequence_id, username: p.username || '', hits: 0 };
    s.hits++; s.username = s.username || p.username || ''; seqs.set(p.sequence_id, s);
  }
  return [...seqs.values()];
}

const seqCache = new Map();
/** every frame of a sequence, normalised */
export async function sequence(id, cache) {
  if (seqCache.has(id)) return seqCache.get(id);
  const cached = cache && cache.read(`kv_seq_${id}.json`);
  const j = cached || await post('/1.0/sequence/photo-list/', { sequenceId: id });
  if (!cached && cache) cache.write(`kv_seq_${id}.json`, j);
  const photos = ((j.osv || {}).photos || []).map(p => ({
    id: p.id,
    seq_index: +p.sequence_index,
    lat: +p.lat, lng: +p.lng,
    heading: +p.heading,
    timestamp: (p.shot_date || '').replace(' ', 'T').replace(/\.\d+$/, 'Z'),
    epoch: Date.parse((p.shot_date || '').replace(' ', 'T') + 'Z') / 1000 || +p.timestamp || 0,
    w: +p.width || null, h: +p.height || null,
    projection: p.projection || 'PLANE',
    image_url: cdnUrl(p.name, p.storage),
    page_url: pageUrl(id, p.sequence_index),
    licence_raw: null                      // KartaView has no per-image licence field; see lib/licence.mjs
  })).sort((a, b) => a.seq_index - b.seq_index);
  seqCache.set(id, photos);
  return photos;
}

/** candidate sequences near a waypoint, each with the frames that fall inside the radius */
export async function candidates(wp, radius, cache) {
  const seqs = await nearby(wp.lat, wp.lng, radius);
  const out = [];
  for (const s of seqs) {
    const all = await sequence(s.sequence_id, cache);
    const inside = all.filter(p => dist(p, wp) <= radius);
    if (!inside.length) continue;
    out.push({
      source: NAME, sequence_id: s.sequence_id, author: s.username || 'KartaView contributor',
      licence: LICENCE, licence_url: LICENCE_URL, licence_source: 'platform-default',
      attribution: `KartaView / ${s.username || 'contributor'} — CC BY-SA 4.0`,
      requires_logo: false,
      all, inside
    });
  }
  return out;
}
