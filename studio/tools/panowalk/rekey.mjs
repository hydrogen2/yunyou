#!/usr/bin/env node
/**
 * panowalk rekey — re-point a cached pano index at the scenes that actually use it, and re-tag its licence
 * strings, WITHOUT re-downloading a byte.
 *
 *   node studio/tools/panowalk/rekey.mjs <chapter-dir> [--dry]
 *
 * WHY THIS EXISTS. `fetch.mjs` writes `media/files/panos/index.json` with one `scene_id` per stop, because a stop
 * was commissioned by a scene. That was never a key:
 *   · Day 1's scene ids all changed on 2026-09-08 when the chapter was rewritten as a film, and the cache went
 *     blind — `count-the-steps` and `look-up-the-cross` no longer exist.
 *   · One stop now serves several scenes. `count-the-steps-w06` is used by `what-a-club-was` (twice) and
 *     `the-wager`; `count-the-steps-w04` fills four slots of `clothes-then-club`. A single `scene_id` cannot say so.
 * So the renderer addresses a stop by its own `stop_id` (a film slot names it: `"manifest_id": "PANO/<stop_id>"`),
 * and this tool rewrites the index to record `scene_ids: [...]` — every scene that references the stop — plus a
 * `used_by` list of scene/slot pairs. `scene_id` is kept, pointing at the first user, so nothing that still reads
 * the old field breaks.
 *
 * It also re-tags the licence fields for Mapillary, which Rights ruled GREEN on 2026-09-08
 * (`review/rights-mapillary.md` §9: "the 7 cached stops should be re-tagged in place; the bytes need no re-fetch").
 * The hedge "(platform default — NOT stated per image)" is now inaccurate and comes out of the burned credit.
 *
 * RULE 1: no network, no API key, no cost. It reads and rewrites JSON on disk.
 */
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry');
const chapterDir = path.resolve(argv.find(a => !a.startsWith('--')) || '.');
const panoRoot = path.join(chapterDir, 'media', 'files', 'panos');
const idxPath = path.join(panoRoot, 'index.json');
if (!fs.existsSync(idxPath)) { console.error('no pano index at ' + idxPath); process.exit(2); }

// --- who uses which stop, straight from the scene files -------------------------------------------------------
const sceneDir = path.join(chapterDir, 'scenes');
const scenes = fs.readdirSync(sceneDir).filter(f => /\.scene\.json$/.test(f)).sort()
  .map(f => JSON.parse(fs.readFileSync(path.join(sceneDir, f), 'utf8')));
const users = new Map();                       // stop_id -> [{scene, at}]
for (const sc of scenes) for (const [i, m] of (sc.media || []).entries()) {
  const id = String(m.manifest_id || '').match(/^PANO\/(.+)$/);
  if (!id) continue;
  const list = users.get(id[1]) || []; list.push({ scene: sc.id, slot: i + 1, at_s: m.start_s ?? null }); users.set(id[1], list);
}

// --- Mapillary, per review/rights-mapillary.md §8 / §9 ---------------------------------------------------------
const MAPILLARY = {
  licence: 'CC BY-SA 4.0',
  licence_url: 'https://creativecommons.org/licenses/by-sa/4.0/',
  licence_source: 'platform-default (Mapillary Terms §3, eff. 2024-02-15; image-details panel, verified 2026-09-08 — see review/rights-mapillary.md)',
  licence_class: 'permissive',
  attribution: author => `Mapillary / ${author} · CC BY-SA 4.0 · adapted`
};
const KARTAVIEW = {
  licence: 'CC BY-SA 4.0',
  licence_url: 'https://creativecommons.org/licenses/by-sa/4.0/',
  licence_source: 'platform-default (KartaView Terms, "Open Source License", first-hand 2026-09-08 — see review/rights-mapillary.md §6)',
  licence_class: 'permissive',
  attribution: author => `KartaView / ${author} · © Grab and KartaView Contributors · CC BY-SA 4.0 · adapted`
};
const rules = { mapillary: MAPILLARY, kartaview: KARTAVIEW };

function retag(obj) {
  const r = rules[String(obj.source || '').toLowerCase()];
  if (!r) return false;
  let changed = false;
  const set = (k, v) => { if (obj[k] !== v) { obj[k] = v; changed = true; } };
  set('licence', r.licence);
  set('licence_url', r.licence_url);
  set('licence_source', r.licence_source);
  if (obj.attribution !== undefined) set('attribution', r.attribution(obj.author || 'contributor'));
  return changed;
}

const idx = JSON.parse(fs.readFileSync(idxPath, 'utf8'));
const report = [];
for (const stop of idx.stops) {
  const u = users.get(stop.stop_id) || [];
  const before = stop.scene_id;
  const ids = [...new Set(u.map(x => x.scene))];
  stop.scene_ids = ids;
  stop.used_by = u;
  stop.scene_id = ids[0] || null;              // kept for readers that still expect one; null when nothing uses it
  const lic = retag(stop);
  report.push({ stop: stop.stop_id, from: before, to: stop.scene_id, users: u.length, scenes: ids.length, licence: lic });
  // per-frame packs carry the same fields
  const fj = path.join(panoRoot, stop.stop_id, 'frames.json');
  if (fs.existsSync(fj)) {
    const pack = JSON.parse(fs.readFileSync(fj, 'utf8'));
    pack.scene_ids = ids; pack.used_by = u; pack.scene_id = ids[0] || null;
    retag(pack);
    for (const fr of pack.frames || []) { if (rules[String(fr.source || pack.source || '').toLowerCase()]) { fr.licence = rules[String(fr.source || pack.source).toLowerCase()].licence; fr.licence_class = 'permissive'; } }
    if (!DRY) fs.writeFileSync(fj, JSON.stringify(pack, null, 1));
  }
}
idx.keyed_by = 'stop_id';
idx.accept_unknown_licence = false;            // Mapillary is green; nothing here rests on the flag any more
idx.licence_note = 'Every frame carries its own licence in <stop>/frames.json. Mapillary and KartaView are both ' +
  'platform-default CC BY-SA 4.0 and both ruled GREEN (review/rights-mapillary.md, 2026-09-08); nothing NC/ND is ever downloaded.';
idx.rekeyed_at = new Date().toISOString();
idx.rekey_note = 'scene_id is NOT a key: one stop serves several scenes and scene ids change. Address a stop by ' +
  'stop_id (a film slot names it as manifest_id "PANO/<stop_id>"). scene_ids/used_by are derived from scenes/*.scene.json.';
if (!DRY) fs.writeFileSync(idxPath, JSON.stringify(idx, null, 1));

console.log(`${DRY ? '[dry] ' : ''}${idxPath}`);
for (const r of report) console.log(`  ${r.stop.padEnd(24)} scene_id ${String(r.from).padEnd(20)} -> ${String(r.to).padEnd(20)} (${r.scenes} scene(s), ${r.users} slot(s))${r.licence ? '  licence re-tagged' : ''}`);
const orphan = report.filter(r => !r.users);
if (orphan.length) console.log(`  NOTE: ${orphan.length} cached stop(s) are not referenced by any scene: ${orphan.map(r => r.stop).join(', ')}`);
