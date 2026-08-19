#!/usr/bin/env node
/**
 * Yunyou — linear-cut ("variety show") review-animatic renderer.
 *
 *   node studio/tools/render/render_linear.mjs <tour.json> [options]
 *
 * Reads a tour.json + the "Linear cut" table in <chapter>/scenes/README.md, synthesises the narration with
 * Edge neural TTS, renders visuals (Playwright screenshots of the player / our own HTML cards / Commons images
 * with Ken Burns), burns captions, mixes low audio beds and assembles one MP4 with ffmpeg.
 *
 * Rights rules baked in: YouTube is never downloaded or re-encoded (a "clip card" stands in), Street View is never
 * screen-recorded (a stop card stands in), Commons/CC0 media are attributed in-frame and on the credits card.
 *
 * Options (all optional):
 *   --out <dir>          output dir (default <chapter>/linear)
 *   --size 1280x720      frame size          --fps 25
 *   --voice en-GB-RyanNeural   --voice2 en-GB-ThomasNeural (second speaker in dialogue)   --rate -5%
 *   --slack 0.10         a scene may exceed its README seconds by this fraction before the script is cut
 *   --cuts <json>        sidecar with per-scene linear-cut hints (default cuts/<chapter-id>.json next to this script)
 *   --player <url>       player base URL (default https://localhost/player/)
 *   --scenes 1,5,7       only these scene numbers (debug)      --plan   print the plan (sentences, TTS lengths), no video
 *   --no-tts             captions only, no voice (fallback)   --keep   keep the work dir
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import { chromium } from 'playwright-core';
import * as T from './lib/templates.mjs';
import * as PM from '../../player/panomove.mjs';   // ONE definition of the open-imagery walk, shared with the player

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FFMPEG = ffmpegPath, FFPROBE = ffprobeStatic.path;

// ---------------------------------------------------------------- args
const argv = process.argv.slice(2); const args = { _: [] };
for (let i = 0; i < argv.length; i++) { const a = argv[i]; if (a.startsWith('--')) { const k = a.slice(2); const nx = argv[i + 1]; if (nx !== undefined && !nx.startsWith('--')) { args[k] = nx; i++; } else args[k] = true; } else args._.push(a); }
if (!args._[0]) { console.error('usage: node render_linear.mjs <tour.json> [--out dir] [--size 1280x720] [--plan] ...'); process.exit(2); }

const TOUR_PATH = path.resolve(args._[0]);
const CHAPTER_DIR = path.dirname(TOUR_PATH);
const OUT = path.resolve(args.out || path.join(CHAPTER_DIR, 'linear'));
const CACHE = path.join(OUT, '.cache'); const WORK = path.join(OUT, '.work');
const [W, H] = (args.size || '1280x720').split('x').map(Number); const FPS = +(args.fps || 25);
const VOICE = args.voice || 'en-GB-RyanNeural', VOICE2 = args.voice2 || 'en-GB-ThomasNeural', RATE = args.rate || '-5%';
const SLACK = args.slack !== undefined ? +args.slack : 0.10;
const PLAYER = args.player || 'https://localhost/player/';
const NO_TTS = !!args['no-tts']; const PLAN = !!args.plan;
const ONLY = args.scenes ? String(args.scenes).split(',').map(Number) : null;
const NARR_GAIN = 1.6;            // Edge TTS lands near -21 LUFS; +4 dB → about -17 LUFS
const BED_TARGET_LUFS = -35;      // narration (~-17) minus 18 dB
const STING_TARGET_LUFS = -26;    // short effects (≤ 6 s) sit a little higher than beds
const TITLE_S = 4, CREDITS_S_PER_LINE = 1.1;
const DATE = new Date().toISOString().slice(0, 10);

for (const d of [OUT, CACHE, WORK, path.join(CACHE, 'tts'), path.join(CACHE, 'img'), path.join(CACHE, 'audio'), path.join(CACHE, 'shots'), path.join(CACHE, 'seg')]) fs.mkdirSync(d, { recursive: true });

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const sha = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 16);
const mmss = t => { t = Math.max(0, Math.round(t)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
const fmt1 = n => (Math.round(n * 10) / 10).toFixed(1);

function run(cmd, cmdArgs, opts = {}) {
  return new Promise((res, rej) => { const p = spawn(cmd, cmdArgs, { stdio: ['ignore', 'pipe', 'pipe'], ...opts }); let out = '', err = '';
    p.stdout.on('data', d => out += d); p.stderr.on('data', d => err += d);
    p.on('close', c => c === 0 ? res({ out, err }) : rej(new Error(`${path.basename(cmd)} exit ${c}\n${cmdArgs.join(' ').slice(0, 800)}\n${err.slice(-1500)}`))); });
}
const ffmpeg = (a, opts) => run(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...a], opts);
async function probeDuration(f) { const { out } = await run(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]); return parseFloat(out) || 0; }
async function probeStreams(f) { const { out } = await run(FFPROBE, ['-v', 'error', '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels:format=duration,size', '-of', 'json', f]); return JSON.parse(out); }
async function measureLufs(f) { const key = path.join(CACHE, 'audio', sha('lufs' + f) + '.txt'); if (fs.existsSync(key)) return +fs.readFileSync(key, 'utf8');
  const { err } = await run(FFMPEG, ['-hide_banner', '-nostats', '-i', f, '-t', '120', '-af', 'ebur128', '-f', 'null', '-']); const m = err.match(/I:\s+(-?[\d.]+) LUFS/g); const v = m ? parseFloat(m[m.length - 1].match(/-?[\d.]+/)[0]) : -23; fs.writeFileSync(key, String(v)); return v; }

// ---------------------------------------------------------------- fetch helpers (Commons, thumbnails)
async function fetchTo(url, file, headers = {}) {
  if (fs.existsSync(file) && fs.statSync(file).size > 0) return file;
  const r = await fetch(url, { headers: { 'User-Agent': 'YunyouRender/0.1 (studio render pipeline; contact: weizhiwei@gmail.com)', ...headers } });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  fs.writeFileSync(file, Buffer.from(await r.arrayBuffer())); return file;
}
const isCommons = u => /commons\.wikimedia\.org\/wiki\/File:/.test(u || '');
const commonsInfoCache = {};
async function commonsInfo(pageUrl, width = 1920) {
  const m = pageUrl.match(/File:(.+)$/); const title = 'File:' + decodeURIComponent(m[1]); const key = title + '|' + width;
  if (commonsInfoCache[key]) return commonsInfoCache[key];
  const cf = path.join(CACHE, 'img', sha(key) + '.json'); if (fs.existsSync(cf)) return commonsInfoCache[key] = JSON.parse(fs.readFileSync(cf, 'utf8'));
  const api = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=${width}&format=json`;
  const r = await fetch(api, { headers: { 'User-Agent': 'YunyouRender/0.1 (studio render pipeline; contact: weizhiwei@gmail.com)' } }); const j = await r.json();
  const p = Object.values(j.query.pages)[0]; const ii = p.imageinfo && p.imageinfo[0]; if (!ii) throw new Error('Commons: no imageinfo for ' + title);
  const em = ii.extmetadata || {}; const info = { title, mime: ii.mime, url: ii.url, thumburl: ii.thumburl || ii.url, license: (em.LicenseShortName || {}).value || '', artist: ((em.Artist || {}).value || '').replace(/<[^>]+>/g, '').trim() };
  fs.writeFileSync(cf, JSON.stringify(info)); return commonsInfoCache[key] = info;
}
async function commonsImage(pageUrl) { const info = await commonsInfo(pageUrl, 1920); const ext = (info.thumburl.match(/\.(jpe?g|png|gif|svg|webp|tiff?)(\?|$)/i) || [, 'jpg'])[1].toLowerCase(); const f = path.join(CACHE, 'img', sha(info.title) + '.' + (ext === 'svg' || ext === 'tif' || ext === 'tiff' ? 'png' : ext)); await fetchTo(info.thumburl, f); return { file: f, info }; }
async function commonsAudio(pageUrl) { const info = await commonsInfo(pageUrl, 64); const ext = (info.url.match(/\.(ogg|oga|mp3|wav|flac|opus)(\?|$)/i) || [, 'ogg'])[1]; const f = path.join(CACHE, 'audio', sha(info.title) + '.' + ext); await fetchTo(info.url, f); return { file: f, info }; }
async function ytThumb(id) { const f = path.join(CACHE, 'img', 'yt_' + id + '.jpg'); try { await fetchTo(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`, f); return f; } catch { return null; } }

// ---------------------------------------------------------------- sentence splitting
const ABBR = /(?:\bNo|\bMr|\bMrs|\bDr|\bSt|\bvs|\bp\.m|\ba\.m|\bc|\betc|\bcf|\bibid)$/;
export function splitSentences(text) {
  const out = []; let start = 0; const re = /[.!?…]+['"’”)]*(?=\s+[A-Z0-9'"‘“(])/g; let m;
  while ((m = re.exec(text))) { const end = m.index + m[0].length; const before = text.slice(start, m.index).trimEnd(); if (ABBR.test(before)) continue; out.push(text.slice(start, end).trim()); start = end; }
  const rest = text.slice(start).trim(); if (rest) out.push(rest); return out;
}

// ---------------------------------------------------------------- README linear-cut table
function parseLinearCut(readmePath) {
  if (!fs.existsSync(readmePath)) return null; const md = fs.readFileSync(readmePath, 'utf8');
  const sec = md.split(/\n##\s+/).find(s => /^linear cut/i.test(s)); if (!sec) return null;
  const rows = []; for (const line of sec.split('\n')) { const m = line.match(/^\|\s*(\d{2})\s+([a-z0-9-]+)\s*\|\s*(.*?)\s*\|\s*(\d+)\s*\|/i); if (m) rows.push({ num: +m[1], id: m[2], use: m[3], s: +m[4] }); }
  const notes = (sec.match(/Linear-only:[^\n]*|Interactive-only:[^\n]*/g) || []).join(' ');
  return rows.length ? { rows, notes } : null;
}

// ---------------------------------------------------------------- TTS (Edge neural, cached)
let ttsMod = null, ttsFailed = false;
async function tts(text, voice) {
  const key = sha(`${voice}|${RATE}|${text}`); const dir = path.join(CACHE, 'tts', key); const mp3 = path.join(dir, 'audio.mp3'), meta = path.join(dir, 'metadata.json');
  if (fs.existsSync(mp3) && fs.existsSync(meta) && fs.statSync(mp3).size > 1000) return { mp3, meta: JSON.parse(fs.readFileSync(meta, 'utf8')), cached: true };
  if (NO_TTS || ttsFailed) return null;
  try {
    if (!ttsMod) ttsMod = await import('msedge-tts');
    fs.mkdirSync(dir, { recursive: true });
    for (let attempt = 1; attempt <= 3; attempt++) {
      try { const t = new ttsMod.MsEdgeTTS(); await t.setMetadata(voice, ttsMod.OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3, { sentenceBoundaryEnabled: true, wordBoundaryEnabled: true });
        const r = await t.toFile(dir, text, { rate: RATE }); t.close();
        if (r.audioFilePath !== mp3) fs.renameSync(r.audioFilePath, mp3); if (r.metadataFilePath && r.metadataFilePath !== meta) fs.renameSync(r.metadataFilePath, meta);
        if (!fs.existsSync(meta)) fs.writeFileSync(meta, '{"Metadata":[]}');
        return { mp3, meta: JSON.parse(fs.readFileSync(meta, 'utf8')), cached: false };
      } catch (e) { log(`TTS attempt ${attempt} failed: ${e.message.slice(0, 120)}`); await new Promise(r => setTimeout(r, 1500 * attempt)); }
    }
    ttsFailed = true; return null;
  } catch (e) { log('TTS unavailable:', e.message.slice(0, 200)); ttsFailed = true; return null; }
}
/** Word/sentence boundaries → seconds, mapped back onto the original text with punctuation. */
function boundaries(meta, text) {
  const words = [], sents = [];
  for (const m of meta.Metadata || []) { const d = m.Data; const t = d.text.Text; const o = d.Offset / 1e7, du = d.Duration / 1e7; if (m.Type === 'WordBoundary') words.push({ t, s: o, e: o + du }); else if (m.Type === 'SentenceBoundary') sents.push({ t, s: o, e: o + du }); }
  // map words onto the original text
  let cur = 0; for (const w of words) { const i = text.indexOf(w.t, cur); if (i >= 0) { w.i0 = i; w.i1 = i + w.t.length; cur = w.i1; } }
  return { words: words.filter(w => w.i0 !== undefined), sents };
}

// ---------------------------------------------------------------- Playwright (player shots + HTML cards)
let browser = null, playerPage = null;
async function getBrowser() { if (!browser) browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] }); return browser; }
async function shotHtml(html, name) {
  const f = path.join(CACHE, 'shots', `${name}_${sha(html)}.png`); if (fs.existsSync(f)) return f;
  const b = await getBrowser(); const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, ignoreHTTPSErrors: true }); const p = await ctx.newPage();
  const hf = path.join(CACHE, 'shots', `${name}_${sha(html)}.html`); fs.writeFileSync(hf, html);
  await p.goto('file://' + hf, { waitUntil: 'load' }); await p.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; })))); await p.waitForTimeout(150);
  await p.screenshot({ path: f }); await ctx.close(); return f;
}
async function shotPlayer(fnCall, name, waitMs = 3200) {
  const f = path.join(CACHE, 'shots', `${name}_${sha(PLAYER + TOUR_PATH + fnCall + W + H)}.png`); if (fs.existsSync(f)) return f;
  const b = await getBrowser();
  if (!playerPage) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, ignoreHTTPSErrors: true }); playerPage = await ctx.newPage();
    const rel = '/' + path.relative(path.resolve(CHAPTER_DIR, '../../..'), TOUR_PATH).split(path.sep).join('/');
    await playerPage.goto(`${PLAYER}?tour=${rel}`, { waitUntil: 'load' });
    await playerPage.addStyleTag({ content: `header,footer,#right{display:none!important} #media{position:fixed!important;inset:0!important;width:${W}px!important;height:${H}px!important;flex:none!important}` });
    await playerPage.waitForSelector('#start', { timeout: 15000 }); await playerPage.click('#start'); await playerPage.waitForTimeout(500);
  }
  await playerPage.evaluate(c => { try { speechSynthesis.cancel(); } catch { } return eval(c); }, fnCall);
  await playerPage.waitForTimeout(waitMs);
  await playerPage.evaluate(() => { try { speechSynthesis.cancel(); } catch { } });
  await playerPage.screenshot({ path: f }); return f;
}

// ---------------------------------------------------------------- video segment renderers (cached mp4, video only)
async function segStatic(png, dur) {
  const out = path.join(CACHE, 'seg', `st_${sha(png + dur + W + H + FPS)}.mp4`); if (fs.existsSync(out)) return out;
  await ffmpeg(['-loop', '1', '-framerate', String(FPS), '-i', png, '-t', fmt1(dur), '-vf', `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,format=yuv420p,setsar=1`, '-r', String(FPS), '-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'stillimage', '-crf', '20', '-pix_fmt', 'yuv420p', out]); return out;
}
let kbToggle = 0;
async function segKenBurns(img, dur) {
  const dirn = (kbToggle++ % 2); const frames = Math.round(dur * FPS);
  const out = path.join(CACHE, 'seg', `kb_${sha(img + dur + W + H + FPS + dirn)}.mp4`); if (fs.existsSync(out)) return out;
  const z = dirn ? `1.10-0.10*on/${frames}` : `1+0.10*on/${frames}`;
  const vf = `scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black,zoompan=z='${z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${W}x${H}:fps=${FPS},format=yuv420p,setsar=1`;
  await ffmpeg(['-i', img, '-vf', vf, '-frames:v', String(frames), '-r', String(FPS), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-pix_fmt', 'yuv420p', out]); return out;
}

// local, licence-clean footage (kind: "footage") — already normalised to h264/W×H/FPS by the Content Preparer.
// Trimmed / looped to `dur`, video only: any bed or narration is mixed by the scene's audio graph, and every
// footage item carries `audio: "mute"` unless QA has cleared its soundtrack (review/rights-a6.md §1.1).
async function segFootage(file, dur, inS = 0) {
  const out = path.join(CACHE, 'seg', `fo_${sha(file + dur + inS + W + H + FPS)}.mp4`); if (fs.existsSync(out)) return out;
  const src = await probeDuration(file).catch(() => 0);
  const loop = src && dur > (src - inS) + 0.05 ? ['-stream_loop', String(Math.ceil(dur / Math.max(0.5, src - inS)))] : [];
  await ffmpeg([...loop, '-ss', fmt1(inS), '-i', file, '-t', fmt1(dur),
    '-vf', `scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,fps=${FPS},format=yuv420p`,
    '-an', '-r', String(FPS), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', out]);
  return out;
}


// ---------------------------------------------------------------- panowalk: the open-imagery walk, in the video
// The SAME cached frames the player animates in streetview mode `open`, cut with the SAME move (studio/player/
// panomove.mjs is imported by both). Nothing is downloaded here and nothing Google is touched: the frames come from
// <chapter>/media/files/panos/, built by `node studio/tools/panowalk/fetch.mjs`.
// Difference from the player, stated plainly: ffmpeg cannot animate a crop, so the turn is quantised to one value
// per source frame (evaluated at that frame's midpoint) while the player interpolates it continuously. The drift
// inside each frame, the cross-fade and the frame timing are identical.
// Degrades: no cache, no frames, or a stop the fetcher marked unusable → the visual's `fallback` is used instead
// (and if there is none, the ordinary Street View stop card), so a clean checkout still renders.
const panoRoot = path.join(CHAPTER_DIR, 'media', 'files', 'panos');
let panoIndexCache;
function panoIndex() {
  if (panoIndexCache !== undefined) return panoIndexCache;
  const f = path.join(panoRoot, 'index.json');
  panoIndexCache = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
  return panoIndexCache;
}
function panoPacks(sceneId, only) {
  const idx = panoIndex(); if (!idx) return [];
  return idx.stops.filter(s => s.scene_id === sceneId && (!only || only.includes(s.waypoint_index)))
    .map(s => { const f = path.join(panoRoot, s.stop_id, 'frames.json'); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null; })
    .filter(p => p && p.frames && p.frames.length);
}

/** one source frame → one clip: crop the window out of the (doubled, for 360°) image, then breathe */
async function segPanoFrame(pack, frame, win, dur, dir) {
  const src = path.join(panoRoot, pack.stop_id, frame.file);
  const out = path.join(CACHE, 'seg', `pw_${sha(src + JSON.stringify(win) + dur + dir + W + H + FPS)}.mp4`);
  if (fs.existsSync(out)) return out;
  const frames = Math.max(2, Math.round(dur * FPS));
  const iw = frame.w || 5760, ih = frame.h || 2880;
  // margin so the drift's pan/zoom stays inside the crop
  const mw = Math.min(1, win.w * 1.10), mh = Math.min(1, win.h * 1.10);
  const cw = Math.max(16, Math.round(iw * mw)), ch = Math.max(16, Math.round(ih * mh));
  const cy = Math.max(0, Math.min(ih - ch, Math.round(ih * (win.y - (mh - win.h) / 2))));
  let pre, cx;
  if (win.pano) {                                   // wrap: the equirect doubled side by side, then crop anywhere
    pre = 'split[a][b];[a][b]hstack=inputs=2,';
    cx = Math.round(iw * ((win.x - (mw - win.w) / 2) + 1));   // +1 image width keeps x positive across the seam
  } else {
    pre = '';
    cx = Math.max(0, Math.min(iw - cw, Math.round(iw * (win.x - (mw - win.w) / 2))));
  }
  const z = `1+${(0.055).toFixed(3)}*on/${frames}`;
  const px = dir >= 0 ? `iw/2-(iw/zoom/2)+${(0.04 * 0.5).toFixed(3)}*iw*(on/${frames}-0.5)` : `iw/2-(iw/zoom/2)-${(0.04 * 0.5).toFixed(3)}*iw*(on/${frames}-0.5)`;
  const vf = `${pre}crop=${cw}:${ch}:${cx}:${cy},scale=${W * 2}:${H * 2}:flags=lanczos,` +
    `zoompan=z='${z}':x='${px}':y='ih/2-(ih/zoom/2)':d=${frames}:s=${W}x${H}:fps=${FPS},format=yuv420p,setsar=1`;
  await ffmpeg(['-i', src, '-filter_complex', vf, '-frames:v', String(frames), '-r', String(FPS),
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', out]);
  return out;
}

/** chain clips with cross-fades of `fade` seconds; returns one mp4 of the requested total duration */
async function xfadeChain(clips, fade) {
  if (clips.length === 1) return clips[0].file;
  const out = path.join(CACHE, 'seg', `pwx_${sha(JSON.stringify(clips.map(c => c.file + c.dur)) + fade + W + H + FPS)}.mp4`);
  if (fs.existsSync(out)) return out;
  const inputs = clips.flatMap(c => ['-i', c.file]);
  let fc = '', prev = '0:v', at = clips[0].dur;
  for (let i = 1; i < clips.length; i++) {
    const off = Math.max(0.05, at - fade);
    fc += `[${prev}][${i}:v]xfade=transition=fade:duration=${fmt1(fade)}:offset=${fmt1(off)}[x${i}];`;
    prev = `x${i}`; at = off + clips[i].dur;
  }
  fc = fc.replace(/;$/, '');
  await ffmpeg([...inputs, '-filter_complex', fc, '-map', `[${prev}]`, '-r', String(FPS),
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', out]);
  return out;
}

/**
 * Build the walk for `dur` seconds from the cached frames of `sceneId` (optionally only some waypoints).
 * Returns { file, dur, credits:[…] } or null when the cache cannot serve it.
 */
async function buildPanowalk(scene, sceneId, only, dur) {
  const packs = panoPacks(sceneId, only);
  if (!packs.length) return null;
  const plan = PM.planScene(scene);
  if (!plan) return null;
  const byWp = new Map(packs.map(p => [p.waypoint_index, p]));
  const wps = (only && only.length ? only : packs.map(p => p.waypoint_index)).filter(k => byWp.has(k)).sort((a, b) => a - b);
  if (!wps.length) return null;
  const tStart = plan.stops[wps[0]].arrive_s || 0;
  const last = wps[wps.length - 1];
  const tEnd = plan.stops[last + 1] ? plan.stops[last + 1].arrive_s : plan.dur;
  const scale = dur / Math.max(1, tEnd - tStart);
  const aspect = W / H;

  const clips = [], credits = new Map(); let notes = [];
  for (const k of wps) {
    const pack = byWp.get(k);
    const s0 = (plan.stops[k].arrive_s || 0), s1 = plan.stops[k + 1] ? plan.stops[k + 1].arrive_s : plan.dur;
    const l0 = (s0 - tStart) * scale, l1 = Math.min(dur, (s1 - tStart) * scale);
    const laid = PM.planStop(pack, l0, l1);
    for (const seg of laid.segments) {
      const mid = tStart + ((seg.t0 + seg.t1) / 2) / scale;            // the cue track is read in ORIGINAL scene time
      const cam = PM.cameraTrack(plan.stops, plan.cues, mid);
      let frame = seg.frame, aim = cam;
      if (cam.cue && cam.cue.look_at) {
        const pick = PM.frameForCue(laid.segments.map(x => x.frame), cam.cue.look_at);
        if (pick) frame = pick;
        aim = { ...cam, heading: PM.bearingDeg(frame, cam.cue.look_at) };
        aim = PM.retarget(aim, PM.distM(plan.stops[k], cam.cue.look_at), PM.distM(frame, cam.cue.look_at));
      }
      const win = PM.windowFor(frame, { heading: aim.heading, pitch: aim.pitch, fov: aim.fov }, aspect);
      const d = Math.max(0.5, seg.t1 - seg.t0);
      clips.push({ file: await segPanoFrame(pack, frame, win, d + (seg.fade || 0), seg.dir), dur: d + (seg.fade || 0), fade: seg.fade || 0.4 });
      if (win.clamped) notes.push(`${pack.stop_id}: flat frame clamped at ${Math.round(win.yaw)}° — the cue asked for more turn than the photograph holds`);
    }
    credits.set(pack.sequence_key, { attribution: pack.attribution, licence: pack.licence, source: pack.source, author: pack.author, url: (pack.frames[0] || {}).source_url });
  }
  if (!clips.length) return null;
  const file = await xfadeChain(clips, clips[0].fade || 0.4);
  return { file, dur, credits: [...credits.values()], notes, stops: wps, packs };
}

// ---------------------------------------------------------------- ASS captions
const assTime = t => { t = Math.max(0, t); const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = Math.floor(t % 60), cs = Math.floor((t - Math.floor(t)) * 100); return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`; };
const assEsc = s => String(s).replace(/\\/g, '\\\\').replace(/\{/g, '(').replace(/\}/g, ')').replace(/\n/g, '\\N');
function assHeader() {
  const sc = H / 720;
  return `[Script Info]\nScriptType: v4.00+\nPlayResX: ${W}\nPlayResY: ${H}\nWrapStyle: 0\nScaledBorderAndShadow: yes\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n` +
    `Style: Cap,Liberation Serif,${Math.round(30 * sc)},&H00DAE6EC,&H00FFFFFF,&H00000000,&H90000000,0,0,0,0,100,100,0,0,3,${Math.round(3 * sc)},0,2,${Math.round(120 * sc)},${Math.round(120 * sc)},${Math.round(44 * sc)},1\n` +
    `Style: Title,Liberation Sans,${Math.round(24 * sc)},&H0041A4D9,&H00FFFFFF,&H00000000,&HA0000000,1,0,0,0,100,100,1,0,3,${Math.round(4 * sc)},0,1,${Math.round(36 * sc)},${Math.round(36 * sc)},${Math.round(112 * sc)},1\n` +
    `Style: Attr,Liberation Sans,${Math.round(15 * sc)},&H00BCC8CF,&H00FFFFFF,&H00000000,&H90000000,0,0,0,0,100,100,0,0,3,${Math.round(3 * sc)},0,3,${Math.round(24 * sc)},${Math.round(16 * sc)},${Math.round(10 * sc)},1\n` +
    `Style: Pin,Liberation Sans,${Math.round(19 * sc)},&H0041A4D9,&H00FFFFFF,&H00000000,&HA0000000,0,0,0,0,100,100,0,0,3,${Math.round(4 * sc)},0,7,${Math.round(28 * sc)},${Math.round(28 * sc)},${Math.round(22 * sc)},1\n` +
    `\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
}
const assLine = (style, s, e, text) => `Dialogue: 0,${assTime(s)},${assTime(e)},${style},,0,0,0,,${assEsc(text)}\n`;

/** Turn word boundaries into caption chunks of ≤ maxChars, cut at sentence ends. */
function captionChunks(text, words, maxChars = 84) {
  const chunks = []; let cur = null; let lastEnd = 0;
  const flush = (endIdx, endT) => { if (!cur) return; cur.text = text.slice(cur.i0, endIdx).replace(/^[\s'"’”)]+/, '').trim(); cur.e = endT; if (cur.text) chunks.push(cur); cur = null; };
  for (let k = 0; k < words.length; k++) { const w = words[k]; const next = words[k + 1];
    if (!cur) cur = { i0: lastEnd, s: w.s };
    // where would this chunk end if we stop after this word (include trailing punctuation up to the next word)
    const endIdx = next ? next.i0 : text.length; const candidate = text.slice(cur.i0, endIdx).trim();
    const sentenceEnd = /[.!?…]['"’”)]*\s*$/.test(candidate) && !ABBR.test(candidate.replace(/[.!?…'"’”)\s]+$/, ''));
    const tooLong = candidate.length > maxChars && next; if (sentenceEnd || tooLong || !next) { flush(endIdx, next ? Math.min(w.e + 0.9, next.s) : w.e + 0.9); lastEnd = endIdx; } }
  return chunks;
}

// ---------------------------------------------------------------- main
(async () => {
  const t0 = Date.now();
  const tour = JSON.parse(fs.readFileSync(TOUR_PATH, 'utf8')); const chapter = tour.chapters[0]; const scenes = chapter.scenes;
  const readme = parseLinearCut(path.join(CHAPTER_DIR, 'scenes', 'README.md'));
  const cutsPath = args.cuts ? path.resolve(args.cuts) : path.join(__dirname, 'cuts', `${chapter.id}.json`);
  const cuts = fs.existsSync(cutsPath) ? JSON.parse(fs.readFileSync(cutsPath, 'utf8')) : { scenes: {} };
  const manifestMd = fs.existsSync(path.join(CHAPTER_DIR, 'media', 'manifest.md')) ? fs.readFileSync(path.join(CHAPTER_DIR, 'media', 'manifest.md'), 'utf8') : '';
  const manifestRow = id => { const line = manifestMd.split('\n').find(l => l.startsWith(`| ${id} |`)); if (!line) return null; const c = line.split('|').map(x => x.trim()); return { id: c[1], kind: c[2], ref: c[3].replace(/`/g, ''), title: c[4], license: c[5], notes: c[10] || '' }; };
  const logLines = [], warnings = [];
  const note = (s) => { logLines.push(s); };

  // 1. selection
  let selection;
  if (readme) { selection = readme.rows.map(r => { const i = scenes.findIndex(s => s.id === r.id); return i < 0 ? null : { idx: i, scene: scenes[i], cap: r.s, use: r.use }; }).filter(Boolean); note(`Selection: ${selection.length} scenes from scenes/README.md "Linear cut" table (${readme.rows.reduce((a, r) => a + r.s, 0)} s planned).`); }
  else { selection = scenes.map((s, i) => ({ idx: i, scene: s, cap: s.duration_s, use: 'whole' })).filter(x => !/INTERACTIVE CUT ONLY/i.test(x.scene.production_notes || '')); note('Selection: no README table found — all scenes except "INTERACTIVE CUT ONLY", capped at duration_s.'); }
  if (ONLY) selection = selection.filter(x => ONLY.includes(x.idx + 1));

  // 2. per-scene plan: script tokens → utterances
  const plans = [];
  for (const sel of selection) {
    const s = sel.scene; const hint = (cuts.scenes || {})[s.id] || {};
    // --track clear|standard : the clear-English variant (narration.variants.clear) is the DEFAULT (founder decision 2026-08-19,
    // audience report #1: non-native-friendly). Falls back to narration.script wherever a scene has no variant.
    const _track = (args.track || 'clear');
    const _text = (_track === 'clear' && s.narration?.variants?.clear) ? s.narration.variants.clear : (s.narration?.script || '');
    const sents = splitSentences(_text);
    const tokens = hint.script || sents.map((_, i) => `s:${i}`);
    const utts = []; const push = (voice, text, src) => { const last = utts[utts.length - 1]; if (last && last.voice === voice && !last.sealed) { last.text += ' ' + text; last.src.push(src); } else utts.push({ voice, text, src: [src] }); };
    const usedS = new Set();
    for (const tk of tokens) {
      const [kind, a, b] = String(tk).split(':');
      if (kind === 's') { const [x, y] = a.split('-').map(Number); for (let i = x; i <= (isNaN(y) ? x : y); i++) if (sents[i]) { push(VOICE, sents[i], `s:${i}`); usedS.add(i); } }
      else if (kind === 'quiz') { const o = (s.interaction?.options || []).find(o => o.correct); if (o) push(VOICE, `${o.text.trim().replace(/[.]?$/, '.')} ${o.feedback || ''}`.trim(), 'quiz:correct'); }
      else if (kind === 'chat') { const o = (s.interaction?.options || [])[+a]; if (o) { if (b !== 'answer') { push(VOICE, o.text, `chat:${a}:q`); utts[utts.length - 1].sealed = true; } push(VOICE2, o.feedback || o.answer || '', `chat:${a}:a`); utts[utts.length - 1].sealed = true; } }
      else if (kind === 'overlay') { const o = (s.overlays || [])[+a]; if (o) push(VOICE, o.text, `overlay:${a}`); }
      else if (kind === 'game') { const os = (s.interaction?.options || []); if (a === 'list') push(VOICE, os.filter(o => o.correct).map(o => o.text.replace(/\s*[—-]\s*£.*$/, '')).join('; ') + '.', 'game:list'); }
    }
    const dropped = sents.map((x, i) => usedS.has(i) ? null : `[${i}] ${x}`).filter(Boolean);
    plans.push({ sel, s, hint, sents, utts, droppedBySidecar: hint.script ? dropped : [] });
  }

  // 3. TTS + timing
  for (const p of plans) {
    const cap = p.sel.cap * (1 + SLACK); const narrAt = p.hint.narration_at_s ?? 1.0; let t = 0; p.narrAt = narrAt; p.ttsOk = true;
    for (const u of p.utts) {
      const r = await tts(u.text, u.voice); if (!r) { p.ttsOk = false; u.dur = Math.max(2, u.text.split(/\s+/).length / 2.3); u.words = []; u.sents = [{ t: u.text, s: 0, e: u.dur }]; u.mp3 = null; }
      else { u.mp3 = r.mp3; u.dur = await probeDuration(r.mp3); const b = boundaries(r.meta, u.text); u.words = b.words; u.sents = b.sents.length ? b.sents : [{ t: u.text, s: 0, e: u.dur }]; }
      u.at = t; t += u.dur + (u.voice !== VOICE || (p.utts[p.utts.indexOf(u) + 1] || {}).voice !== VOICE ? 0.6 : 0.35);
    }
    let speechEnd = p.utts.length ? p.utts[p.utts.length - 1].at + p.utts[p.utts.length - 1].dur : 0; p.cutLog = [];
    if (narrAt + speechEnd + 1.0 > cap && p.utts.length) {
      // cut at the last sentence boundary that fits
      let keep = null; for (const u of p.utts) for (const se of u.sents) { const abs = u.at + se.e; if (narrAt + abs + 1.0 <= cap) keep = { u, se, abs }; }
      if (!keep) { p.cutLog.push(`script cut: nothing fits ${fmt1(cap)} s — kept first sentence anyway`); const u = p.utts[0]; keep = { u, se: u.sents[0], abs: u.at + u.sents[0].e }; }
      const ki = p.utts.indexOf(keep.u); const removedUtts = p.utts.slice(ki + 1); p.utts = p.utts.slice(0, ki + 1);
      const si = keep.u.sents.indexOf(keep.se); const removedS = keep.u.sents.slice(si + 1); keep.u.trimTo = keep.se.e + 0.25; keep.u.dur = keep.u.trimTo; keep.u.sents = keep.u.sents.slice(0, si + 1); keep.u.words = keep.u.words.filter(w => w.s < keep.se.e + 0.05);
      const dropped = removedS.map(x => x.t).concat(removedUtts.flatMap(u => u.sents.map(x => x.t)));
      p.cutLog.push(`script cut to fit ${p.sel.cap} s (+${Math.round(SLACK * 100)}% slack = ${fmt1(cap)} s): dropped ${dropped.length} sentence(s) at the end — ${dropped.map(x => `"${x.length > 70 ? x.slice(0, 67) + '…' : x}"`).join(' / ')}`);
      speechEnd = keep.u.at + keep.u.dur;
    }
    p.speechEnd = speechEnd; p.len = Math.max(6, Math.min(cap, narrAt + speechEnd + 1.5)); if (!p.utts.length) p.len = Math.max(6, Math.min(p.sel.cap, 8));
    p.len = Math.round(p.len * FPS) / FPS;
  }

  if (PLAN || args.verbose) {
    for (const p of plans) { console.log(`\n== ${String(p.sel.idx + 1).padStart(2, '0')} ${p.s.id} (${p.s.type}) README ${p.sel.cap} s → ${fmt1(p.len)} s; TTS ${p.ttsOk ? 'ok' : 'FALLBACK'}; narration ${fmt1(p.speechEnd)} s from ${p.narrAt} s`); p.sents.forEach((x, i) => console.log(`   [${i}] ${x}`)); p.utts.forEach(u => console.log(`   > ${u.voice.replace('en-GB-', '')} ${fmt1(u.dur)} s ${u.src.join(',')}`)); p.cutLog.forEach(x => console.log('   ! ' + x)); p.droppedBySidecar.forEach(x => console.log('   - sidecar dropped ' + x)); }
    console.log(`\nTotal ≈ ${fmt1(plans.reduce((a, p) => a + p.len, 0) + TITLE_S + 14)} s`); if (PLAN) { if (browser) await browser.close(); process.exit(0); }
  }

  // 4. visuals + audio per scene → scene mp4
  const creditsUsed = new Map(); // manifest_id → {attribution, license, kind}
  let clipCards = 0, footageSegs = 0;   // A8: the point of the exercise is to drive clipCards to zero
  const useCredit = (m) => { if (!m) return; const id = m.manifest_id || m.ref; if (!creditsUsed.has(id)) creditsUsed.set(id, { id, kind: m.kind, attribution: m.attribution || m.ref, license: m.license || '', ref: m.ref }); };
  const vtt = ['WEBVTT', '']; let globalT = TITLE_S; const sceneFiles = [];
  const ytLabel = m => { const row = manifestRow(m.manifest_id) || {}; const tm = (row.title || '').match(/^"(.+?)"\s+—\s+(.+?)\s*\(/); return { channel: tm ? tm[2] : (m.attribution || '').split(',')[0], videoTitle: tm ? tm[1] : (m.attribution || m.ref) }; };

  // title card
  const titlePng = await shotHtml(T.titleCard({ tourTitle: tour.title, chapterTitle: chapter.title, dateStr: DATE }), 'title');
  const titleMp4 = path.join(WORK, '00_title.mp4'); await ffmpeg(['-loop', '1', '-framerate', String(FPS), '-i', titlePng, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-t', String(TITLE_S), '-vf', `format=yuv420p,fade=t=in:st=0:d=0.5,fade=t=out:st=${TITLE_S - 0.5}:d=0.5`, '-r', String(FPS), '-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'stillimage', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-ac', '2', '-shortest', titleMp4]); sceneFiles.push(titleMp4);

  for (const p of plans) {
    const s = p.s, n = p.sel.idx, hint = p.hint, len = p.len; const tag = `${String(n + 1).padStart(2, '0')}_${s.id}`; log(`scene ${tag}: ${fmt1(len)} s`);
    const media = s.media || []; const f = len / (s.duration_s || len);
    // ---- visual segments (list of {kind, dur|null, ...}) ----
    let segs = [];
    const imgSeg = async (m, dur) => { const { file, info } = await commonsImage(m.ref); useCredit(m); return { kind: 'kb', file, dur, attribution: m.attribution || `${info.artist} — ${info.license} (Wikimedia Commons)`, src: `${m.manifest_id} Commons image (Ken Burns)` }; };
    const clipSeg = async (m, dur, inS = m.start_s || 0, outS = m.end_s || 0) => { const { channel, videoTitle } = ytLabel(m); const th = await ytThumb(m.ref); useCredit(m); clipCards++; const html = T.clipCard({ channel, videoTitle, videoId: m.ref, inS, outS, sceneTitle: s.title, thumbUrl: th ? 'file://' + th : '', note: hint.clip_note || '' }); return { kind: 'png', file: await shotHtml(html, `clip_${m.ref}`), dur, src: `${m.manifest_id} clip card (YouTube ${m.ref} ${mmss(inS)}–${mmss(outS)}) — no download` }; };
    const footageSeg = async (m, dur, inS = m.start_s || 0) => { const f = path.join(CHAPTER_DIR, m.ref); if (!fs.existsSync(f)) return await pendingSeg(m, dur); useCredit(m); footageSegs++; return { kind: 'footage', file: f, in_s: inS, dur, attribution: m.attribution || '', src: `${m.manifest_id} local footage ${m.ref}${inS ? ' from ' + mmss(inS) : ''} — self-hosted, licence-clean` }; };
    const pendingSeg = async (m, dur) => ({ kind: 'png', file: await shotHtml(T.pendingCard({ sceneTitle: s.title, assetId: m.manifest_id, spec: (m.note || '').slice(0, 140), overlays: (s.overlays || []).filter(o => /caption|lower-third/.test(o.kind)).slice(0, 4) }), `pending_${m.manifest_id}`), dur, src: `${m.manifest_id} pending-asset card` });
    const playerSeg = async (call, dur, label) => ({ kind: 'png', file: await shotPlayer(call, `player_${label}`), dur, src: `player screenshot ${call}` });
    if (hint.visuals) {
      for (const v of hint.visuals) {
        const m = v.media ? media.find(x => x.manifest_id === v.media) : null; const dur = v.dur ?? null;
        if (v.kind === 'image' && m) segs.push(await imgSeg(m, dur));
        else if (v.kind === 'clip' && m) segs.push(await clipSeg(m, dur, v.in_s ?? m.start_s ?? 0, v.out_s ?? m.end_s ?? 0));
        else if (v.kind === 'footage' && m) segs.push(await footageSeg(m, dur, v.in_s ?? m.start_s ?? 0));
        else if (v.kind === 'player') segs.push(await playerSeg(v.call, dur, `${tag}_${sha(v.call)}`));
        else if (v.kind === 'scenecard') segs.push({ kind: 'png', file: await shotHtml(T.sceneCard({ title: s.title, subtitle: chapter.title, note: v.note || '' }), `scenecard_${tag}`), dur, src: 'scene title card' });
        else if (v.kind === 'pending' && m) segs.push(await pendingSeg(m, dur));
        else if (v.kind === 'quiz') { const img = media.find(x => x.kind === 'image'); const ci = img ? await commonsImage(img.ref) : null; if (img) useCredit(img); const it = s.interaction || {}; const co = (it.options || []).find(o => o.correct) || {}; segs.push({ kind: 'png', file: await shotHtml(T.quizScreen({ sceneTitle: s.title, imageUrl: ci ? 'file://' + ci.file : '', prompt: it.prompt || '', options: it.options || [], feedback: co.feedback || '' }), `quiz_${tag}`), dur, attribution: img?.attribution, src: 'quiz screen (own render)' }); }
        else if (v.kind === 'chat') { const img = media.find(x => x.kind === 'image'); const ci = img ? await commonsImage(img.ref) : null; if (img) useCredit(img); const it = s.interaction || {}; const turns = (v.chips || [0]).flatMap(i => { const o = (it.options || [])[i]; return o ? [{ role: 'q', text: o.text }, { role: 'a', text: o.feedback || o.answer || '' }] : []; }); segs.push({ kind: 'png', file: await shotHtml(T.chatScreen({ sceneTitle: s.title, imageUrl: ci ? 'file://' + ci.file : '', context: it.prompt || '', turns }), `chat_${tag}`), dur, attribution: img?.attribution, src: 'dialogue screen (own render, scripted chips)' }); }
        else if (v.kind === 'checklist') { const it = s.interaction || {}; segs.push({ kind: 'png', file: await shotHtml(T.checklistScreen({ sceneTitle: s.title, prompt: it.prompt || '', options: it.options || [], closing: v.closing_overlay !== undefined ? (s.overlays || [])[v.closing_overlay]?.text : '' }), `check_${tag}`), dur, src: 'checklist screen (own render)' }); }
        else if (v.kind === 'panowalk') {
          const srcScene = v.scene ? scenes.find(x => x.id === v.scene) : s;
          const built = srcScene ? await buildPanowalk(srcScene, srcScene.id, v.stops || null, dur || 8) : null;
          if (built) {
            for (const c of built.credits) if (!creditsUsed.has(c.attribution)) creditsUsed.set(c.attribution, { id: c.attribution, kind: 'panowalk', attribution: c.attribution, license: c.licence || '', ref: c.url || '' });
            built.notes.forEach(n => warnings.push(`${tag}: ${n}`));
            segs.push({ kind: 'mp4', file: built.file, dur, attribution: built.credits.map(c => c.attribution).join(' · '), src: `panowalk — ${built.packs.map(p => p.source + ' ' + p.sequence_id).join(', ')} (stops ${built.stops.join(',')}), cached frames, same move as the player` });
          } else if (v.fallback) {
            warnings.push(`${tag}: panowalk cache missing (run studio/tools/panowalk/fetch.mjs) — using the declared fallback`);
            const fm = v.fallback.media ? media.find(x => x.manifest_id === v.fallback.media) : null;
            if (v.fallback.kind === 'footage' && fm) segs.push(await footageSeg(fm, dur, v.fallback.in_s ?? 0));
            else if (v.fallback.kind === 'image' && fm) segs.push(await imgSeg(fm, dur));
            else if (fm) segs.push(await pendingSeg(fm, dur));
          } else {
            warnings.push(`${tag}: panowalk cache missing and no fallback declared — Street View stop card`);
            const svs = media.filter(x => x.kind === 'streetview');
            segs.push({ kind: 'png', file: await shotHtml(T.streetViewCard({ sceneTitle: s.title, stops: svs.map(x => ({ desc: x.note || x.attribution, coords: x.ref })), note: '' }), `sv_${tag}`), dur, src: 'Street View stop card — panowalk cache absent' });
          }
        }
        else if (v.kind === 'streetview') { const svs = media.filter(x => x.kind === 'streetview'); segs.push({ kind: 'png', file: await shotHtml(T.streetViewCard({ sceneTitle: s.title, stops: svs.map(x => ({ desc: x.note || x.attribution, coords: x.ref })), note: '' }), `sv_${tag}`), dur, src: 'Street View stop card — not recorded' }); }
      }
    } else {
      // defaults by type
      if (s.type === 'video') { for (const m of media) { if (m.use === 'player') continue; if (m.kind === 'image') segs.push(await imgSeg(m, Math.max(4, ((m.end_s ?? 0) - (m.start_s ?? 0)) * f))); else if (m.kind === 'footage') segs.push(await footageSeg(m, Math.max(4, ((m.end_s ?? 0) - (m.start_s ?? 0)) * f))); else if (m.kind === 'youtube') segs.push(await clipSeg(m, null)); } }
      else if (s.type === 'streetview') {
        // v0.5: if panowalk frames are cached for this scene, the walk goes in the film; otherwise the old stop card.
        const built = await buildPanowalk(s, s.id, null, Math.max(6, p.len));
        if (built) {
          for (const c of built.credits) if (!creditsUsed.has(c.attribution)) creditsUsed.set(c.attribution, { id: c.attribution, kind: 'panowalk', attribution: c.attribution, license: c.licence || '', ref: c.url || '' });
          built.notes.forEach(n => warnings.push(`${tag}: ${n}`));
          segs.push({ kind: 'mp4', file: built.file, dur: null, attribution: built.credits.map(c => c.attribution).join(' · '), src: `panowalk — ${built.packs.map(x => x.source + ' ' + x.sequence_id).join(', ')}, cached open imagery` });
        } else {
          const svs = media.filter(x => x.kind === 'streetview');
          segs.push({ kind: 'png', file: await shotHtml(T.streetViewCard({ sceneTitle: s.title, stops: svs.map(x => ({ desc: x.note || x.attribution, coords: x.ref })) }), `sv_${tag}`), dur: null, src: 'Street View stop card — not recorded' });
        }
      }
      else if (s.type === 'photo') { const vis = media.filter(x => x.kind === 'image' || x.kind === 'generated'); for (const m of vis) { const d = Math.max(4, ((m.end_s ?? 0) - (m.start_s ?? s.duration_s)) * f); if (m.kind === 'image') segs.push(await imgSeg(m, d)); else if (fs.existsSync(path.join(CHAPTER_DIR, m.ref))) { if (/\.svg$/i.test(m.ref)) segs.push(await playerSeg(`showScene(${n}).then(()=>seek(${m.start_s ?? 0}))`, d, `${tag}_${sha(m.ref)}`)); /* ffmpeg has no svg decoder: shoot the player at the asset's scene time */ else segs.push({ kind: 'kb', file: path.join(CHAPTER_DIR, m.ref), dur: d, src: `${m.manifest_id} generated asset` }); } else segs.push(await pendingSeg(m, d)); } }
      else if (s.type === 'map') { const gen = media.filter(x => x.kind === 'generated' && /route-map/.test(x.ref)); const vm = media.find(x => x.kind === 'map'); if (gen.length) { for (const g of gen) segs.push(await playerSeg(`showRouteMap(${!/full-loop|enablers/.test(g.ref)})`, Math.max(4, ((g.end_s ?? 0) - (g.start_s ?? 0)) * f), `${tag}_${sha(g.ref)}`)); } else if (vm) { segs.push(await imgSeg(vm, null)); } else segs.push(await playerSeg('showRouteMap(true)', null, tag)); }
      else if (s.type === 'quiz') { const img = media.find(x => x.kind === 'image'); const ci = img ? await commonsImage(img.ref) : null; if (img) useCredit(img); const it = s.interaction || {}; const co = (it.options || []).find(o => o.correct) || {}; segs.push({ kind: 'png', file: await shotHtml(T.quizScreen({ sceneTitle: s.title, imageUrl: ci ? 'file://' + ci.file : '', prompt: it.prompt || '', options: it.options || [], feedback: co.feedback || '' }), `quiz_${tag}`), dur: null, attribution: img?.attribution, src: 'quiz screen (own render)' }); }
      else if (s.type === 'dialogue') { const img = media.find(x => x.kind === 'image'); const ci = img ? await commonsImage(img.ref) : null; if (img) useCredit(img); const it = s.interaction || {}; const o = (it.options || [])[0]; segs.push({ kind: 'png', file: await shotHtml(T.chatScreen({ sceneTitle: s.title, imageUrl: ci ? 'file://' + ci.file : '', context: it.prompt || '', turns: o ? [{ role: 'q', text: o.text }, { role: 'a', text: o.feedback || o.answer || '' }] : [] }), `chat_${tag}`), dur: null, attribution: img?.attribution, src: 'dialogue screen (own render)' }); }
      else if (s.type === 'game') { const it = s.interaction || {}; segs.push({ kind: 'png', file: await shotHtml(T.checklistScreen({ sceneTitle: s.title, prompt: it.prompt || '', options: it.options || [] }), `check_${tag}`), dur: null, src: 'checklist screen (own render)' }); }
      else { segs.push(await playerSeg(`showScene(${n})`, null, `${tag}_scene`)); }
    }
    if (!segs.length) segs.push({ kind: 'png', file: await shotHtml(T.sceneCard({ title: s.title, subtitle: chapter.title }), `scenecard_${tag}`), dur: null, src: 'scene title card (fallback)' });
    // durations: fixed ones as given, null ones share the remainder; if everything is fixed, scale to len
    const fixed = segs.filter(x => x.dur != null).reduce((a, x) => a + x.dur, 0); const free = segs.filter(x => x.dur == null).length;
    if (free) { const rem = Math.max(2 * free, len - fixed); segs.forEach(x => { if (x.dur == null) x.dur = rem / free; }); }
    const tot = segs.reduce((a, x) => a + x.dur, 0); segs.forEach(x => x.dur = Math.max(1, x.dur * len / tot));
    // snap to frames, fix rounding on the last segment
    let acc = 0; segs.forEach((x, i) => { x.dur = Math.round(x.dur * FPS) / FPS; x.at = acc; acc += x.dur; }); segs[segs.length - 1].dur += Math.round((len - acc) * FPS) / FPS; if (segs[segs.length - 1].dur < 1) segs[segs.length - 1].dur = 1;
    const segFiles = []; for (const x of segs) segFiles.push(x.kind === 'kb' ? await segKenBurns(x.file, x.dur) : x.kind === 'footage' ? await segFootage(x.file, x.dur, x.in_s || 0) : x.kind === 'mp4' ? await segFootage(x.file, x.dur, 0) : await segStatic(x.file, x.dur));

    // ---- captions (ASS) + VTT ----
    let ass = assHeader(); ass += assLine('Title', 0, 4, s.title);
    for (const x of segs) if (x.attribution) ass += assLine('Attr', x.at, x.at + x.dur, x.attribution);
    const ovList = (hint.overlays ?? (s.overlays || []).map((_, i) => i)).map(x => typeof x === 'number' ? { i: x } : x);
    for (const ov of ovList) { const o = (s.overlays || [])[ov.i]; if (!o || !/pin|caption|lower-third/.test(o.kind)) continue; let at = ov.at ?? o.at_s; let until = ov.until ?? (o.until_s ?? o.at_s + 8); if (ov.at === undefined && at + 2 > len) { if (ov.i === (s.overlays || []).length - 1 || hint.overlay_times === 'shift-tail') { until = len - 0.5; at = Math.max(4.5, until - 8); } else continue; } until = Math.min(len - 0.5, until); if (o.kind === 'lower-third' && at < 4) continue; if (at < 4.2) at = 4.2; if (until - at < 1.5) continue; ass += assLine('Pin', at, until, (o.kind === 'pin' ? '▸ ' : '') + o.text); }
    for (const u of p.utts) { const chunks = u.words.length ? captionChunks(u.text, u.words) : u.sents.map(x => ({ text: x.t, s: x.s, e: x.e }));
      for (const c of chunks) { const cs = p.narrAt + u.at + c.s, ce = Math.min(len, p.narrAt + u.at + c.e); ass += assLine('Cap', cs, ce, c.text); vtt.push(`${assVtt(globalT + cs)} --> ${assVtt(globalT + ce)}`, (u.voice === VOICE2 ? '<v Passepartout>' : '') + c.text, ''); } }
    const assFile = path.join(WORK, `${tag}.ass`); fs.writeFileSync(assFile, ass);

    // ---- audio: narration utterances + beds ----
    const inputs = []; const fc = []; const amixIn = []; let idx = 0;
    segFiles.forEach(sf => { inputs.push('-i', sf); idx++; }); const nSeg = idx;
    segFiles.forEach((_, i) => fc.push(`[${i}:v]setsar=1,fps=${FPS}[v${i}]`)); fc.push(segFiles.map((_, i) => `[v${i}]`).join('') + `concat=n=${nSeg}:v=1:a=0[vc]`); fc.push(`[vc]subtitles=${path.basename(assFile)}:fontsdir=/usr/share/fonts[v]`);
    inputs.push('-f', 'lavfi', '-t', fmt1(len), '-i', 'anullsrc=r=48000:cl=stereo'); fc.push(`[${idx}:a]atrim=0:${fmt1(len)}[base]`); amixIn.push('[base]'); idx++;
    for (const u of p.utts) { if (!u.mp3) continue; inputs.push('-i', u.mp3); fc.push(`[${idx}:a]${u.trimTo ? `atrim=0:${fmt1(u.trimTo)},afade=t=out:st=${fmt1(Math.max(0, u.trimTo - 0.15))}:d=0.15,` : ''}aresample=48000,aformat=channel_layouts=stereo,volume=${NARR_GAIN},adelay=${Math.round((p.narrAt + u.at) * 1000)}:all=1[n${idx}]`); amixIn.push(`[n${idx}]`); idx++; }
    const bedList = []; const beds = hint.beds ? hint.beds.map(b => { const m = media.find(x => x.manifest_id === b.media); return m ? { m, at: b.at ?? 0, until: b.until ?? len } : null; }).filter(Boolean)
      : media.filter(m => m.kind === 'audio').map(m => ({ m, at: (m.start_s ?? 0) * f, until: Math.min(len, (m.end_s ?? s.duration_s) * f) }));
    for (const b of beds) { if (b.until - b.at < 1.5) continue; if (!isCommons(b.m.ref)) { warnings.push(`${tag}: audio ${b.m.manifest_id} (${b.m.ref}) is not on Commons — skipped (login/download needed).`); continue; }
      let bf; try { bf = (await commonsAudio(b.m.ref)).file; } catch (e) { warnings.push(`${tag}: could not fetch ${b.m.manifest_id}: ${e.message}`); continue; }
      useCredit(b.m); const lufs = await measureLufs(bf); const sting = (b.until - b.at) <= 6; const gain = Math.min(12, (sting ? STING_TARGET_LUFS : BED_TARGET_LUFS) - lufs); const d = b.until - b.at;
      inputs.push('-stream_loop', '-1', '-i', bf); fc.push(`[${idx}:a]atrim=0:${fmt1(d)},aresample=48000,aformat=channel_layouts=stereo,volume=${gain}dB,afade=t=in:st=0:d=1,afade=t=out:st=${fmt1(Math.max(0, d - 1.5))}:d=1.5,adelay=${Math.round(b.at * 1000)}:all=1[b${idx}]`); amixIn.push(`[b${idx}]`); idx++;
      bedList.push(`${b.m.manifest_id} ${mmss(b.at)}–${mmss(b.until)} (${sting ? 'sting' : 'bed'} ${Math.round(gain)} dB → ${sting ? STING_TARGET_LUFS : BED_TARGET_LUFS} LUFS)`); }
    fc.push(`${amixIn.join('')}amix=inputs=${amixIn.length}:duration=first:normalize=0,alimiter=limit=0.95[a]`);
    const outMp4 = path.join(WORK, `${tag}.mp4`);
    await ffmpeg([...inputs, '-filter_complex', fc.join(';'), '-map', '[v]', '-map', '[a]', '-t', fmt1(len), '-r', String(FPS), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-ac', '2', '-movflags', '+faststart', outMp4], { cwd: WORK });
    sceneFiles.push(outMp4);
    p.render = { start: globalT, len, segs: segs.map(x => `${x.src} ${fmt1(x.dur)} s`), beds: bedList }; globalT += len;
  }

  // credits
  const credits = []; for (const c of creditsUsed.values()) { const row = manifestRow(c.id) || {}; const hasLic = /\b(PD|public domain|CC0|CC[- ]BY|youtube|geograph)\b/i.test(c.attribution); credits.push({ head: c.id, text: `${c.attribution}${row.license && !hasLic ? ' — ' + row.license : ''}${c.kind === 'youtube' ? ' — placeholder clip card in this animatic; embedded, not copied, in the player' : ''}` }); }
  credits.push({ head: 'Map', text: 'Route map tiles © OpenStreetMap contributors, © CARTO (light_nolabels) via Leaflet 1.9.4' });
  credits.push({ head: 'Voice', text: NO_TTS || plans.some(p => !p.ttsOk) ? 'Captions only — TTS unavailable in this run' : `Microsoft Edge neural TTS ${VOICE}${plans.some(p => p.utts.some(u => u.voice === VOICE2)) ? ' / ' + VOICE2 : ''} (review animatic only)` });
  credits.push({ head: 'Text', text: 'Jules Verne, Around the World in Eighty Days (1872), Towle translation, Project Gutenberg #103 — PD' });
  const perPage = 16; const pages = Math.ceil(credits.length / perPage);
  for (let pg = 0; pg < pages; pg++) { const lines = credits.slice(pg * perPage, (pg + 1) * perPage); const png = await shotHtml(T.creditsCard({ title: `Credits — ${chapter.title}`, lines, pageNo: pg + 1, pages, footer: `Yunyou 云游 · review animatic ${DATE} · not for publication` }), `credits${pg}`); const d = Math.max(8, Math.round(lines.length * CREDITS_S_PER_LINE)); const mp4 = path.join(WORK, `zz_credits${pg}.mp4`);
    await ffmpeg(['-loop', '1', '-framerate', String(FPS), '-i', png, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-t', String(d), '-vf', `format=yuv420p,fade=t=in:st=0:d=0.5`, '-r', String(FPS), '-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'stillimage', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-ac', '2', '-shortest', mp4]); sceneFiles.push(mp4); globalT += d; }

  // 5. concat
  const listFile = path.join(WORK, 'concat.txt'); fs.writeFileSync(listFile, sceneFiles.map(f => `file '${f.replace(/'/g, "'\\''")}'`).join('\n'));
  const outName = `${chapter.id}_review-animatic.mp4`; const finalMp4 = path.join(OUT, outName);
  await ffmpeg(['-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', '-movflags', '+faststart', finalMp4]);
  fs.writeFileSync(path.join(OUT, `${chapter.id}_narration.vtt`), vtt.join('\n'));
  const probe = await probeStreams(finalMp4); const dur = parseFloat(probe.format.duration); const v = probe.streams.find(x => x.codec_type === 'video'), a = probe.streams.find(x => x.codec_type === 'audio');

  // 6. log
  const L = []; L.push(`# Render log — ${chapter.title} — linear cut (review animatic)`, '', `**Rendered:** ${new Date().toISOString()}   **Tool:** studio/tools/render/render_linear.mjs   **Wall clock:** ${Math.round((Date.now() - t0) / 60000 * 10) / 10} min`, '',
    `**Output:** \`${path.relative(path.resolve(CHAPTER_DIR, '../../..'), finalMp4)}\` — ${fmt1(dur)} s (${mmss(dur)}), ${v.width}×${v.height} ${v.codec_name} ${v.r_frame_rate} fps, ${a.codec_name} ${a.sample_rate} Hz ${a.channels} ch, ${(probe.format.size / 1048576).toFixed(1)} MB, faststart. Subtitles: \`${chapter.id}_narration.vtt\`.`, '',
    `**Voice:** ${NO_TTS ? 'none (captions only)' : `Edge neural TTS ${VOICE} (guide), ${VOICE2} (Passepartout), rate ${RATE}`}${plans.some(p => !p.ttsOk) ? ' — **TTS FAILED for some scenes, see table**' : ''}. **Beds:** Commons audio at ${BED_TARGET_LUFS} LUFS (≈ 18 dB under narration), stings at ${STING_TARGET_LUFS} LUFS. **Slack:** a scene may exceed its README seconds by ${Math.round(SLACK * 100)} % before the script is end-cut at a sentence boundary.`, '',
    ...logLines, `Sidecar cut hints: ${fs.existsSync(cutsPath) ? path.relative(path.resolve(CHAPTER_DIR, '../../..'), cutsPath) : 'none'}.`, '',
    `## Rights compliance`, `- YouTube: not downloaded, not re-encoded. ${clipCards ? `${clipCards} clip card(s) stand in (channel, title, in/out, thumbnail from i.ytimg.com)` : 'no clip cards in this cut'}; ${footageSegs} shot(s) come from self-hosted, licence-clean files under \`media/files/\` (Wikimedia Commons / public-domain film / KartaView), never from youtube.com.`, `- Street View: not screen-recorded — stop cards only.`, `- Commons images resolved through the API (imageinfo, width 1920), attribution burned bottom-right while shown and repeated on the credits card. Freesound refs (login-gated) skipped.`, '',
    `## Scenes`, '', `| # | scene | type | at | s (README) | TTS | visual source | beds | script cuts |`, `|---|-------|------|----|-----------:|-----|---------------|------|-------------|`);
  for (const p of plans) { L.push(`| ${String(p.sel.idx + 1).padStart(2, '0')} | ${p.s.id} | ${p.s.type} | ${mmss(p.render.start)} | ${fmt1(p.render.len)} (${p.sel.cap}) | ${p.ttsOk ? 'ok' : '**fallback**'} ${fmt1(p.speechEnd)} s | ${p.render.segs.join('<br>')} | ${p.render.beds.join('<br>') || '—'} | ${[...p.droppedBySidecar.map(x => 'sidecar: dropped ' + x), ...p.cutLog].join('<br>') || '—'} |`); }
  L.push('', `Title card ${TITLE_S} s at 0:00; credits ${pages} page(s) at the end. Total ${mmss(dur)}.`, '');
  if (warnings.length) { L.push('## Warnings', ...warnings.map(w => '- ' + w), ''); }
  L.push('## Sentence index per scene (for the sidecar / Narrator)', '');
  for (const p of plans) { L.push(`**${String(p.sel.idx + 1).padStart(2, '0')} ${p.s.id}** — ${p.sents.map((x, i) => `[${i}] ${x}`).join(' ')}`, ''); }
  L.push('## Digest', `- Did: rendered ${plans.length} scenes + title + credits into one h264/aac MP4 (${mmss(dur)}) with Edge TTS narration, sentence captions, Commons beds and clip/stop cards where rights forbid copying.`, `- Weak: ${clipCards} clip card(s) still stand in${plans.filter(p => p.s.type === 'streetview').length ? ` and stop cards for ${plans.filter(p => p.s.type === 'streetview').length} Street View scene(s)` : ''} (${fmt1(plans.filter(p => p.s.type === 'video' || p.s.type === 'streetview').reduce((a, p) => a + p.render.len, 0))} s of ${fmt1(dur)}); ${plans.filter(p => p.cutLog.length).length} scene(s) were end-cut mechanically where TTS overran the README seconds (see table) — Narrator should re-trim by hand; generated assets (G-xx) are still pending cards.`, `- Next: swap clip cards for licensed footage once Rights clears direct licences; add per-sentence timed overlays; run loudnorm on the final mix; add a 9:16 variant.`);
  fs.writeFileSync(path.join(OUT, 'render-log.md'), L.join('\n'));
  if (browser) await browser.close();
  if (!args.keep) { try { fs.rmSync(WORK, { recursive: true, force: true }); } catch { } }
  log(`done: ${finalMp4} (${mmss(dur)}), log ${path.join(OUT, 'render-log.md')}`);
})().catch(async e => { console.error(e); if (browser) await browser.close(); process.exit(1); });

function assVtt(t) { const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = (t % 60); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${s.toFixed(3).padStart(6, '0')}`; }
