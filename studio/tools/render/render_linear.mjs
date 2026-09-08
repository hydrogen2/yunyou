#!/usr/bin/env node
/**
 * Yunyou — linear-cut ("variety show") renderer. v0.9: publishable cuts, two languages.
 *
 *   node studio/tools/render/render_linear.mjs <tour.json> [options]
 *
 * Reads a tour.json + the "Linear cut" table in <chapter>/scenes/README.md, synthesises the narration with the
 * LOCAL Kokoro voice (Apache-2.0, CPU-only, free — called through ~/hilbert, see tts_kokoro.py), renders visuals
 * (Playwright screenshots of the player / our own HTML cards / Commons stills through the shared image-treatment
 * layer / local licence-clean footage / the open-imagery panowalk), burns captions, mixes low audio beds and
 * assembles one MP4 with ffmpeg. Default output is 1920x1080 @ 25 fps — a file that can be published.
 *
 * Rights rules baked in: YouTube is never downloaded or re-encoded (a "clip card" stands in), Street View is never
 * screen-recorded (a stop card stands in), Commons/CC0 media are attributed in-frame and on the credits card, and
 * the voice is a local model we are licensed to use commercially (msedge-tts, an unlicensed community endpoint,
 * is gone — it was never publishable).
 *
 * Options (all optional):
 *   --out <dir>          output dir (default <chapter>/linear)
 *   --lang en|zh         which cut. `zh` reads <chapter>/i18n/zh-Hans.json exactly as the player does
 *                        (index-addressed; anything missing falls back to English) → <chapter-id>_zh.mp4
 *   --locale zh-Hans     locale file id for --lang zh (default zh-Hans)
 *   --size 1920x1080     frame size          --fps 25
 *   --voice af_heart     Kokoro voice for this run   --speed 0.85   (defaults come from ~/hilbert/config.yaml)
 *   --slack 0.10         a scene may exceed its README seconds by this fraction before the script is cut
 *   --cuts <json>        sidecar with per-scene linear-cut hints (default cuts/<chapter-id>.json next to this script)
 *                        for --lang zh a cuts/<chapter-id>.<locale>.json is used when it exists (see README)
 *   --player <url>       player base URL (default https://localhost/player/)
 *   --scenes 1,5,7       only these scene numbers (debug)      --plan   print the plan (sentences, TTS lengths), no video
 *   --no-tts             captions only, no voice (fallback)   --keep   keep the work dir
 *   --python <path>      interpreter for the TTS adapter (default ~/hilbert/.venv/bin/python)
 *   --no-drift           hold every still dead still (the player's ?drift=0)
 *   --max-upscale <k>    override the per-picture enlargement ceiling (default: 3.0 generated/map, 2.6 plates, 2.0 photos)
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
import * as IL from '../../player/imagelayer.mjs'; // ONE definition of the image treatment + photo slots, ditto
import * as MF from './lib/mapfilm.mjs';           // the route map as a FILM graphic (D9) — not the print plate

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
const [W, H] = (args.size || '1920x1080').split('x').map(Number); const FPS = +(args.fps || 25);
// v0.9: the voice is Kokoro, run locally through ~/hilbert (tts_kokoro.py). VOICE/VOICE2 are speaker LABELS now —
// the model has one voice per language, so the second speaker is marked in the captions, not by a second voice.
const LANG = /^zh/i.test(String(args.lang || 'en')) ? 'zh' : 'en';
const LOCALE_ID = args.locale || (LANG === 'zh' ? 'zh-Hans' : null);
const VOICE = 'guide', VOICE2 = 'passepartout';
const TTS_VOICE = args.voice || null, TTS_SPEED = args.speed !== undefined ? +args.speed : null;
const PYTHON = args.python || path.join(process.env.HOME || '/home/supper-user', 'hilbert', '.venv', 'bin', 'python');
const HILBERT = args.hilbert || path.join(process.env.HOME || '/home/supper-user', 'hilbert');
const TTS_CACHE = path.resolve(args['tts-cache'] || path.join(__dirname, '.tts-cache'));
const SLACK = args.slack !== undefined ? +args.slack : 0.10;
const PLAYER = args.player || 'https://localhost/player/';
const NO_TTS = !!args['no-tts']; const PLAN = !!args.plan;
const DRIFT = !args['no-drift'];
const ONLY = args.scenes ? String(args.scenes).split(',').map(Number) : null;
const NARR_TARGET_LUFS = -17;     // measured per run from the Kokoro clips themselves, not assumed
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
/** like run(), but stdout is a Buffer — for decoding a frame to raw pixels (image statistics). */
function runBuf(cmd, cmdArgs) {
  return new Promise((res, rej) => { const p = spawn(cmd, cmdArgs, { stdio: ['ignore', 'pipe', 'ignore'] }); const b = [];
    p.stdout.on('data', d => b.push(d)); p.on('error', rej);
    p.on('close', c => c === 0 ? res(Buffer.concat(b)) : rej(new Error(`${path.basename(cmd)} exit ${c}`))); });
}
/** like run(), but the child's stderr goes straight to ours — for long jobs that must not look hung (TTS). */
function runLive(cmd, cmdArgs) {
  return new Promise((res, rej) => { const p = spawn(cmd, cmdArgs, { stdio: ['ignore', 'ignore', 'inherit'] });
    p.on('error', rej); p.on('close', c => c === 0 ? res() : rej(new Error(`${path.basename(cmd)} exit ${c}`))); });
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
// v0.9 (mirrors player v0.7 `commonsInfo`): ask for `size` as well as `url`, because Commons will happily answer
// `iiurlwidth=1920` for a 632-px file — it reports thumbwidth 1920 and hands back the ORIGINAL. Believing that
// number is how a small engraving ends up blown to 1080 in the MP4. When thumbwidth > width, the FILE's own
// width/height is the truth and we take the original URL.
async function commonsInfo(pageUrl, width = 1920) {
  const m = String(pageUrl || '').match(/File:(.+)$/);
  if (!m) throw new Error('not a Commons File: page — ' + pageUrl);
  const title = 'File:' + decodeURIComponent(m[1]); const key = title + '|' + width + '|v2';
  if (commonsInfoCache[key]) return commonsInfoCache[key];
  const cf = path.join(CACHE, 'img', sha(key) + '.json'); if (fs.existsSync(cf)) return commonsInfoCache[key] = JSON.parse(fs.readFileSync(cf, 'utf8'));
  const api = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=${width}&format=json`;
  const r = await fetch(api, { headers: { 'User-Agent': 'YunyouRender/0.1 (studio render pipeline; contact: weizhiwei@gmail.com)' } }); const j = await r.json();
  const p = Object.values(j.query.pages)[0]; const ii = p.imageinfo && p.imageinfo[0]; if (!ii) throw new Error('Commons: no imageinfo for ' + title);
  const em = ii.extmetadata || {};
  const vector = /svg/i.test(ii.mime || '');                                    // a vector has no honest maximum
  const upscaled = !vector && !!(ii.thumbwidth && ii.width && ii.thumbwidth > ii.width);
  const info = { title, mime: ii.mime, vector, url: ii.url,
    thumburl: (upscaled || !ii.thumburl) ? ii.url : ii.thumburl,
    w: upscaled ? ii.width : (ii.thumbwidth || ii.width || 0),
    h: upscaled ? ii.height : (ii.thumbheight || ii.height || 0),
    natw: ii.width || 0, nath: ii.height || 0, upscaled,
    license: (em.LicenseShortName || {}).value || '', artist: ((em.Artist || {}).value || '').replace(/<[^>]+>/g, '').trim() };
  fs.writeFileSync(cf, JSON.stringify(info)); return commonsInfoCache[key] = info;
}
/** the downloaded file's REAL pixels, from the file itself — the last word over anything an API says. */
async function realPixels(file) {
  const k = path.join(CACHE, 'img', sha('px' + file) + '.txt'); if (fs.existsSync(k)) { const [w, h] = fs.readFileSync(k, 'utf8').split('x').map(Number); return { w, h }; }
  try { const { out } = await run(FFPROBE, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file]);
    const [w, h] = out.trim().split(',').map(Number); if (w > 0) { fs.writeFileSync(k, `${w}x${h}`); return { w, h }; } } catch { }
  return { w: 0, h: 0 };
}
async function commonsImage(pageUrl, width = Math.max(W, 1920)) {
  const info = await commonsInfo(pageUrl, width);
  const ext = (info.thumburl.match(/\.(jpe?g|png|gif|svg|webp|tiff?)(\?|$)/i) || [, 'jpg'])[1].toLowerCase();
  const f = path.join(CACHE, 'img', sha(info.title + '|' + width) + '.' + (ext === 'svg' || ext === 'tif' || ext === 'tiff' ? 'png' : ext));
  await fetchTo(info.thumburl, f);
  const px = await realPixels(f);
  return { file: f, info: { ...info, w: px.w || info.w, h: px.h || info.h } };
}
async function commonsAudio(pageUrl) { const info = await commonsInfo(pageUrl, 64); const ext = (info.url.match(/\.(ogg|oga|mp3|wav|flac|opus)(\?|$)/i) || [, 'ogg'])[1]; const f = path.join(CACHE, 'audio', sha(info.title) + '.' + ext); await fetchTo(info.url, f); return { file: f, info }; }
/**
 * v0.9: not every still is on Commons. Day 1's saloon plate (M-96) is an IIIF crop rendered on demand by
 * archive.org, and the sidecar used to hide that by naming only the Commons ones. This resolves ANY still —
 * Commons through the API, anything else by straight download — and honours `media[].fallback` on failure, which
 * is what the player has done since v0.8. A still that cannot be fetched at all raises, and the caller degrades.
 */
async function resolveStill(m, width = Math.max(W, 1920)) {
  const one = async (ref) => {
    if (isCommons(ref)) { const { file, info } = await commonsImage(ref, width);
      return { file, w: info.w, h: info.h, credit: m.attribution || `${info.artist} — ${info.license} (Wikimedia Commons)` }; }
    const ext = (String(ref).match(/\.(jpe?g|png|gif|webp|tiff?)(\?|$)/i) || [, 'jpg'])[1].toLowerCase();
    const f = path.join(CACHE, 'img', sha(ref) + '.' + (ext === 'tif' || ext === 'tiff' ? 'png' : ext));
    await fetchTo(ref, f); const px = await realPixels(f);
    if (!px.w) throw new Error('not an image: ' + ref);
    return { file: f, w: px.w, h: px.h, credit: m.attribution || '' };
  };
  try { return await one(m.ref); }
  catch (e) {
    if (!m.fallback) throw e;
    const fb = /^M-/.test(m.fallback) ? m.fallback : m.fallback;      // a bare M-xx is resolved by the caller's media list
    const r = await one(fb);
    r.fellBack = `${m.manifest_id || m.ref} could not be fetched (${String(e.message).slice(0, 80)}) — used media[].fallback`;
    return r;
  }
}
async function ytThumb(id) { const f = path.join(CACHE, 'img', 'yt_' + id + '.jpg'); try { await fetchTo(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`, f); return f; } catch { return null; } }

// ---------------------------------------------------------------- sentence splitting
const ABBR = /(?:\bNo|\bMr|\bMrs|\bDr|\bSt|\bvs|\bp\.m|\ba\.m|\bc|\betc|\bcf|\bibid)$/;
export function splitSentences(text) {
  const out = []; let start = 0; const re = /[.!?…]+['"’”)]*(?=\s+[A-Z0-9'"‘“(])/g; let m;
  while ((m = re.exec(text))) { const end = m.index + m[0].length; const before = text.slice(start, m.index).trimEnd(); if (ABBR.test(before)) continue; out.push(text.slice(start, end).trim()); start = end; }
  const rest = text.slice(start).trim(); if (rest) out.push(rest); return out;
}
/** Mandarin sentences: split AFTER 。！？…； (and their half-width twins), keeping the mark. */
export function splitSentencesZh(text) {
  // a closing quote or bracket belongs to the sentence it closes — kinsoku, and the reason
  // 「福克的座右铭：“意外不存在。”」 must not split into 「…不存在。」 + 「”他的银行…」
  return String(text || '').split(/(?<=[。！？…；!?][」』”’）】》]*)(?![」』”’）】》])/).map(s => s.trim()).filter(Boolean);
}
export const splitText = (text, lang) => (lang === 'zh' ? splitSentencesZh(text) : splitSentences(text));

// ---------------------------------------------------------------- speech normalisation (TTS input ONLY)
// The caption must read "No. 14" (style guide) and the voice must not say the word "no". Kokoro phonemizes
// English through espeak, and espeak was asked directly — this is measured, not assumed:
//     'He lived at No. 7.'  -> hiː lˈɪvd æt nˈoʊ. sˈɛvən.                        ← the word "no"
//     'The year was 1872.'  -> ... wˈʌn θˈaʊzənd ˈeɪthˈʌndɹɪd sˈɛvənti tˈuː.      ← a cardinal, not a year
// So the text is rewritten on its way to the synthesizer and NOWHERE else: captions, the VTT, the render log and
// the scene files all keep the authored wording. Every rewrite is logged so a human can check it.
// Mandarin needs none of this and gets none: hilbert's misaki/pypinyin g2p already reads 1872年 digit-by-digit
// (i→pa→ ʨʰi→ɚ↘njɛ↗n), 8点45分 as bā diǎn sì shí wǔ fēn and 104号 as yī bǎi líng sì hào. Verified the same way.
const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
function numWords(n) {
  n = Math.round(n);
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : '');
  if (n < 1000) return ONES[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' and ' + numWords(n % 100) : '');
  for (const [v, name] of [[1e9, 'billion'], [1e6, 'million'], [1e3, 'thousand']]) {
    if (n >= v) { const hi = Math.floor(n / v), lo = n % v; return numWords(hi) + ' ' + name + (lo ? (lo < 100 ? ' and ' : ' ') + numWords(lo) : ''); }
  }
  return String(n);
}
/** 1872 → "eighteen seventy-two", 1905 → "nineteen oh five", 1900 → "nineteen hundred", 2013 → "twenty thirteen" */
function yearWords(y) {
  if (y >= 2000 && y < 2010) return y === 2000 ? 'two thousand' : 'two thousand and ' + ONES[y - 2000];
  const hi = Math.floor(y / 100), lo = y % 100;
  const hiW = hi === 20 ? 'twenty' : numWords(hi);
  if (lo === 0) return hiW + ' hundred';
  if (lo < 10) return hiW + ' oh ' + ONES[lo];
  return hiW + ' ' + numWords(lo);
}
export function speechText(text, lang, notes) {
  if (lang === 'zh') return text;
  let out = String(text || '');
  const hit = (from, to) => { if (notes && from !== to) notes.push(`${from} → ${to}`); };
  out = out.replace(/\bNo\.\s*(\d+)/g, (m, d, off, whole) => {
    const sentenceStart = off === 0 || /[.!?…]['"’”)]?\s+$/.test(whole.slice(0, off));
    let r = 'number ' + numWords(+d); if (sentenceStart) r = r[0].toUpperCase() + r.slice(1);
    hit(m, r); return r; });
  out = out.replace(/£\s?([\d,]+)(?:\s*(million|billion))?/gi, (m, d, big) => {
    const r = numWords(+d.replace(/,/g, '')) + (big ? ' ' + big.toLowerCase() : '') + ' pounds'; hit(m, r); return r; });
  // a bare four-digit number in 1100–2099 is a year in this product; anything else stays as written
  out = out.replace(/(?<![\d£.,])(1[1-9]\d{2}|20\d{2})(?!\d|[.,]\d)/g, (m, y) => { const r = yearWords(+y); hit(m, r); return r; });
  return out;
}
const isCJK = s => /[㐀-鿿豈-﫿＀-￯]/.test(s || '');

// ---------------------------------------------------------------- README linear-cut table
function parseLinearCut(readmePath) {
  if (!fs.existsSync(readmePath)) return null; const md = fs.readFileSync(readmePath, 'utf8');
  const sec = md.split(/\n##\s+/).find(s => /^linear cut/i.test(s)); if (!sec) return null;
  // The seconds column may be emphasised (`| **75** |`) — the Narrator bolds a number they have just changed, and
  // on 2026-09-03 that silently dropped `13 charing-cross` out of the film because the row no longer matched.
  // Accept the emphasis, and SAY SO when a line that looks like a cut row still fails to parse.
  const rows = [], skipped = [];
  for (const line of sec.split('\n')) {
    const m = line.match(/^\|\s*(\d{2})\s+([a-z0-9-]+)\s*\|\s*(.*?)\s*\|\s*[*_`]*\s*(\d+)\s*[*_`]*\s*\|/i);
    if (m) { rows.push({ num: +m[1], id: m[2], use: m[3], s: +m[4] }); continue; }
    if (/^\|\s*\d{2}\s+[a-z0-9-]+\s*\|/i.test(line)) skipped.push(line.trim().slice(0, 80));
  }
  const notes = (sec.match(/Linear-only:[^\n]*|Interactive-only:[^\n]*/g) || []).join(' ');
  return rows.length ? { rows, notes, skipped } : null;
}

// ---------------------------------------------------------------- TTS (local Kokoro, through ~/hilbert)
// msedge-tts is GONE. It wrapped an undocumented Microsoft endpoint with no licence for third-party use — fine
// for a private animatic, not fine for a file we publish. Kokoro is Apache-2.0, 82M params, CPU-only and local,
// and hilbert's Mandarin path (misaki g2p + third-tone sandhi, not espeak) is the only one on this box that keeps
// the tones. `studio/tools/render/tts_kokoro.py` is the adapter: it CALLS hilbert and writes only into our repo.
//
// One process for the whole render: the model costs ~7 s to load and then runs at ~0.85x real time, so every
// line of a cut goes in one batch. The cache is keyed on (provider, voice, speed, lang, text) INSIDE yunyou —
// editing one line re-synthesizes that line and nothing else, and ~/hilbert/.tts-cache is never touched.
//
// What we lose against Edge: word boundaries. Kokoro returns audio, not timings. So an utterance is now ONE
// SENTENCE (which is also the right cache grain), and captions inside a sentence are timed by character share.
// It is an approximation and it is stated in the log; the sentence in/out points are exact.
let ttsFailed = false, ttsStats = null, ttsVoices = null;
async function ttsBatch(jobs) {
  if (!jobs.length) return new Map();
  const jf = path.join(CACHE, 'tts', `jobs_${sha(JSON.stringify(jobs) + LANG + TTS_VOICE + TTS_SPEED)}.json`);
  const df = jf.replace(/\.json$/, '.dur.json');
  fs.writeFileSync(jf, JSON.stringify(jobs));
  const a = ['--jobs', jf, '--out', df, '--cache-dir', TTS_CACHE, '--hilbert', HILBERT, '--ffmpeg', FFMPEG, '--lang', LANG];
  if (TTS_VOICE) a.push('--voice', TTS_VOICE);
  if (TTS_SPEED !== null) a.push('--speed', String(TTS_SPEED));
  log(`TTS: ${jobs.length} line(s) → kokoro (${PYTHON})`);
  try {
    await runLive(PYTHON, [path.join(__dirname, 'tts_kokoro.py'), ...a]);
  } catch (e) {
    if (!fs.existsSync(df)) { ttsFailed = true; log('TTS unavailable:', String(e.message).slice(0, 300)); return new Map(); }
    log('TTS: some lines failed (see above); continuing with the ones that worked');
  }
  const out = JSON.parse(fs.readFileSync(df, 'utf8'));
  ttsStats = out.stats; ttsVoices = out.voices;
  return new Map(out.items.filter(i => i.file).map(i => [i.id, i]));
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
/** screenshot at an arbitrary size, optionally on a transparent page (the paper mount) */
async function shotHtmlSize(html, name, w, h, transparent = false) {
  const f = path.join(CACHE, 'shots', `${name}_${sha(html + w + h)}.png`); if (fs.existsSync(f)) return f;
  const b = await getBrowser(); const ctx = await b.newContext({ viewport: { width: Math.max(2, Math.ceil(w)), height: Math.max(2, Math.ceil(h)) }, deviceScaleFactor: 1, ignoreHTTPSErrors: true }); const p = await ctx.newPage();
  const hf = path.join(CACHE, 'shots', `${name}_${sha(html + w + h)}.html`); fs.writeFileSync(hf, html);
  await p.goto('file://' + hf, { waitUntil: 'load' });
  await p.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; }))));
  await p.waitForTimeout(120);
  const el = await p.$('.plate');
  await (el || p).screenshot({ path: f, omitBackground: transparent });
  await ctx.close(); return f;
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
/**
 * A segment that CHANGES STATE part-way through, on the scene clock. `states` carry absolute scene-seconds, so
 * the switch lands where the narration put it and survives the duration rescaling every segment goes through.
 * Used by the quiz (ask -> reveal). The dissolve is centred on the beat: xfade eats `fade` seconds per join, so
 * the first and last clips are lengthened by fade/2 and the middles by fade, which makes the total exactly `dur`.
 */
async function segStates(states, dur, segAt, fade = 0.5) {
  const rel = states.map(x => ({ file: x.file, s: Math.max(0, Math.min(dur, x.at - segAt)) })).sort((a, b) => a.s - b.s);
  if (!rel.length) throw new Error('segStates: no states');
  rel[0].s = 0;
  const spans = rel.map((x, i) => ({ file: x.file, dur: (i + 1 < rel.length ? rel[i + 1].s : dur) - x.s })).filter(x => x.dur > 0.12);
  if (spans.length < 2) return await segStatic(spans[0] ? spans[0].file : rel[0].file, dur);
  const fd = Math.max(0.15, Math.min(fade, ...spans.map(x => x.dur * 0.8)));
  const clips = [];
  for (let i = 0; i < spans.length; i++) {
    const grow = (i === 0 || i === spans.length - 1) ? fd / 2 : fd;
    clips.push({ file: await segStatic(spans[i].file, spans[i].dur + grow), dur: spans[i].dur + grow });
  }
  return await xfadeChain(clips, fd);
}

/**
 * A segment built from an HTML page that answers `setT(seconds)` — the film map. The page is opened once and
 * screenshot at exactly the instants the timeline asks for (dense through a move, one frame per hold), then the
 * frames are concatenated with their own durations. A 95 s map costs ~230 screenshots instead of 2 375.
 */
async function segFrames(html, samples, dur, name) {
  const key = sha([html, JSON.stringify(samples.map(x => [x.t.toFixed(3), x.dur.toFixed(3)])), W, H, FPS, dur].join('|'));
  const out = path.join(CACHE, 'seg', `fr_${key}.mp4`);
  if (fs.existsSync(out)) return out;
  const dir = path.join(CACHE, 'shots', `frames_${key}`); fs.mkdirSync(dir, { recursive: true });
  const hf = path.join(dir, 'page.html'); fs.writeFileSync(hf, html);
  const b = await getBrowser();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, ignoreHTTPSErrors: true });
  const pg = await ctx.newPage();
  await pg.goto('file://' + hf, { waitUntil: 'load' });
  await pg.evaluate(() => document.fonts ? document.fonts.ready : null).catch(() => { });
  await pg.waitForTimeout(200);
  const list = [];
  for (let i = 0; i < samples.length; i++) {
    const jf = path.join(dir, `f${String(i).padStart(5, '0')}.jpg`);
    if (!fs.existsSync(jf)) { await pg.evaluate(t => window.setT(t), samples[i].t); await pg.screenshot({ path: jf, type: 'jpeg', quality: 94 }); }
    list.push(`file '${jf.replace(/'/g, "'\\''")}'`, `duration ${samples[i].dur.toFixed(4)}`);
  }
  await ctx.close();
  list.push(list[list.length - 2]);   // ffconcat needs the last file repeated for its duration to apply
  const cf = path.join(dir, 'concat.txt'); fs.writeFileSync(cf, list.join('\n') + '\n');
  await ffmpeg(['-f', 'concat', '-safe', '0', '-i', cf, '-vf', `scale=${W}:${H}:flags=lanczos,format=yuv420p,setsar=1,fps=${FPS}`,
    '-t', fmt1(dur), '-r', String(FPS), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', out]);
  log(`  map: ${samples.length} frames -> ${path.basename(out)} (${name})`);
  return out;
}

// ---------------------------------------------------------------- v0.9: the image treatment layer, in ffmpeg
// The player's v0.7 rules, mirrored shot for shot (studio/player/imagelayer.mjs decides; this only draws):
//   never stretch · never upscale past the file's own pixels · never crop the subject away.
// The old Ken Burns did all three: `scale=1920:1080` blew a 632-px engraving to 1080 and `zoompan z=1→1.10`
// then cropped the subject away to fill. Both are gone.
//   backdrop — the bars are filled with a heavily blurred, darkened copy OF THE SAME FILE (blurred small and
//              scaled back up, exactly as the player does: a heavy blur throws that detail away anyway).
//   plate    — long side ≤ 760 px: a warm paper mount with a thin border and the credit printed on the paper,
//              the picture at its own pixels (k ≤ 1), on the ambient backdrop.
//   fill     — a contained fit already covers ≥ 90 % of the frame: plain contain, nothing added.
//   none     — opt-out: bare frame, no backdrop, no motion.
// The drift runs 0.94 → 1.00 of the honest size and is seeded from hash32(ref), so a picture drifts the same way
// in the film and in the player. It is built by making the canvas 1/0.94 larger and zooming IN to 1:1 — so the
// most magnified frame is the honest size and every other frame is a downscale. It can never invent resolution.
let FONTS = null;
async function fonts() {
  if (FONTS) return FONTS;
  const one = async (q, fallback) => { try { const { out } = await run('fc-match', ['-f', '%{file}', q]); return out.trim() || fallback; } catch { return fallback; } };
  FONTS = { sans: await one('Liberation Sans', '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'),
            cjk: await one('Noto Sans CJK SC', '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc') };
  return FONTS;
}
const wrapChars = (s, n) => { const words = String(s).split(/\s+/); const out = []; let line = '';
  for (const w of words) { if (line && (line + ' ' + w).length > n) { out.push(line); line = w; } else line = line ? line + ' ' + w : w; }
  if (line) out.push(line); return out; };

/**
 * One still → one shot. `m` is the media entry (treatment / drift / ref), nw×nh its REAL pixels.
 * Returns { file, plate:bool } — plate shots print their own credit, so the caller must not also burn one.
 */
const IMGCFG = { ...IL.IMG_DEFAULTS, drift: DRIFT };
if (args['plate-min-area'] !== undefined) IMGCFG.plate_min_area = +args['plate-min-area'];

// ---------------------------------------------------------------- how large may a still be shown? (2026-09-08)
// The founder, after watching Day 1: "when the scene type is a still image, can you enlarge it to fit the screen,
// now all too small". `imagelayer` used to pin every picture at k <= 1 so a 960x540 photograph sat as a 960-px
// window in the middle of a blurred wash. That rule is retired (see the header of studio/player/imagelayer.mjs):
// showing a picture large is not a claim about its resolution. What replaces it is a per-picture CEILING.
//
// How the ceiling is chosen — and what I tried first, so nobody re-litigates it. I built a measured line-art
// classifier (paper/ink/midtone histogram at native resolution + saturation + local flatness) and ran it over
// the 22 stills of Day 1. It does not separate: the Neuville wood engravings score 0.000 saturation and so does
// the Ben-Brooksbank black-and-white photograph of Savile Row; scan noise destroys the flatness signal for the
// 1841 elevation. A classifier that cannot tell an engraving from a monochrome photograph must not decide how
// far we enlarge either. So the ceiling uses the signal that is actually reliable AND happens to correlate with
// material in this house style:
//   · media entry says so            -> m.upscale_max wins, always (the one place a human can be explicit)
//   · kind generated / map           -> 3.0  (our own vector output, and printed plans: line art by construction)
//   · long side <= plate_max_px      -> 2.6  (small archive material — plates and engravings; they upscale
//                                             almost for free, and they are the ones that looked broken)
//   · everything else                -> 2.0  (photographs; softness shows, and a 1920-px file needs 1.0-1.6x
//                                             to fill 1080p anyway, so this cap almost never binds)
// NEVER STRETCH is untouched: one scale factor, aspect exact. --max-upscale scales all four numbers for a test.
const UPSCALE_TUNE = args['max-upscale'] !== undefined ? +args['max-upscale'] : null;
function upscaleCap(m, nw, nh) {
  if (m && m.upscale_max !== undefined && +m.upscale_max > 0) return +m.upscale_max;
  if (UPSCALE_TUNE) return UPSCALE_TUNE;
  const kind = String((m && m.kind) || '');
  if (kind === 'generated' || kind === 'map') return 3.0;
  if (Math.max(nw || 0, nh || 0) <= IMGCFG.plate_max_px) return 2.6;
  return 2.0;
}
const cfgFor = (m, nw, nh) => ({ ...IMGCFG, max_scale: upscaleCap(m, nw, nh) });
/** enlarge a file to exactly w x h with lanczos, cached — a good filter, once, instead of the browser's default. */
async function scaleTo(img, w, h) {
  const out = path.join(CACHE, 'img', `up_${sha(img + '|' + w + 'x' + h)}.png`);
  if (fs.existsSync(out)) return out;
  await ffmpeg(['-i', img, '-vf', `scale=${w}:${h}:flags=lanczos`, '-frames:v', '1', out]);
  return out;
}
async function segStill(img, dur, m, nw, nh, attribution) {
  const CFG = cfgFor(m, nw, nh), maxK = CFG.max_scale;
  let treat = IL.pickTreatment(m, nw, nh, W, H, CFG);
  const plateGeom = () => {                                 // the player's sizePlate(), same arithmetic
    const pad = Math.max(9, Math.round(Math.min(W, H) * 0.028));
    const margin = Math.max(7, Math.round(Math.min(W, H) * 0.036));
    const capSize = Math.max(13, Math.round(H * 0.0165));
    const capLines = attribution ? Math.max(1, Math.ceil(attribution.length / Math.max(18, (W - 2 * margin - 2 * pad) / (capSize * 0.5)))) : 0;
    const capH = capLines ? Math.round(capLines * capSize * 1.35) + Math.round(capSize * 0.55) : 0;
    const f = IL.fitSize(nw, nh, Math.max(40, W - 2 * margin - 2 * pad - 2), Math.max(40, H - 2 * margin - 2 * pad - 2), capH, maxK);
    return { pad, margin, capSize, capH, f };
  };
  // v0.7's measured give-up: "a mount that would leave the picture under plate_min_area of the frame — which is
  // what happens to a 474x700 plate on a 280-px Fold cover — degrades to backdrop, because there the paper costs
  // more than it gives." ONE DELIBERATE DIVERGENCE, and it is here: on a 1920x1080 frame that test also rejects
  // mounts whose paper costs nothing at all. A 709x431 elevation is 14 % of a 1080p frame, so the bare rule sends
  // it to a grey backdrop wash — the exact "reads as a gap" the treatment layer exists to end — while the mount
  // shows the same picture at the same pixels and turns it into a document (compare the two proof frames in the
  // CHANGELOG). So the film adds the condition the rationale implies: the paper only "costs more than it gives"
  // when it actually SHRINKS the picture (k < 1). `--plate-strict` restores the player's arithmetic exactly.
  if (treat === 'plate' && !(m && m.treatment)) {
    const g = plateGeom(); const area = (g.f.w * g.f.h) / (W * H);
    if (area < CFG.plate_min_area && (args['plate-strict'] || g.f.k < 0.999)) treat = 'backdrop';
  }
  const band = (attribution && treat !== 'plate' && treat !== 'none') ? Math.round(H * 0.041) : 0;
  const dr = IL.driftFor(m, treat, CFG, img);
  const frames = Math.max(2, Math.round(dur * FPS));
  const key = sha(['v10', img, dur, W, H, FPS, treat, nw, nh, band, maxK, JSON.stringify(dr), attribution || ''].join('|'));
  const out = path.join(CACHE, 'seg', `im_${key}.mp4`);
  const meta = { treat, nw, nh, maxK };
  if (fs.existsSync(out)) return { file: out, ...meta };

  const from = dr.on ? dr.from : 1;                        // canvas is 1/from larger so the zoom ENDS at 1:1
  const BW = Math.round(W / from) + (Math.round(W / from) % 2), BH = Math.round(H / from) + (Math.round(H / from) % 2);
  const fit = treat === 'plate' ? plateGeom().f : IL.fitSize(nw, nh, W, H, band, maxK);   // k <= maxK, aspect exact
  const fw = fit.w + (fit.w % 2), fh = fit.h + (fit.h % 2);
  meta.k = fit.k;
  const oy = Math.round((BH - band * BH / H - fh) / 2);
  const wantBack = (treat === 'backdrop' || treat === 'plate');

  const fc = []; let extraIn = null;
  // background
  if (wantBack) {
    const sigma = IL.blurRadius(W, H) / 10;                // blur small, scale back up — the player's trick, 40 ms not 212
    const sw = Math.max(16, Math.round(BW / 10)), sh = Math.max(16, Math.round(BH / 10));
    fc.push('[0:v]split=2[src][bk]');
    fc.push(`[bk]scale=${sw}:${sh}:force_original_aspect_ratio=increase,crop=${sw}:${sh},gblur=sigma=${sigma.toFixed(2)},eq=brightness=-0.18:saturation=1.12,scale=${BW}:${BH}:flags=bilinear,setsar=1[bg]`);
  } else {
    fc.push('[0:v]null[src]');
    fc.push(`color=c=black:s=${BW}x${BH}:r=${FPS}[bg]`);                                     // plain black frame
  }
  if (treat === 'plate') {
    // The mount is typeset in the browser we already depend on, then composited: ffmpeg-static is built without
    // libfreetype (no `drawtext`), and even with it a one-line drawtext is not the player's caption. The picture
    // inside the mount is at 1:1 — `fw x fh` is already clamped to the file's own pixels.
    const g = plateGeom(); const pad = g.pad, capSize = g.capSize;
    // the picture inside the mount may now be larger than the file: do that enlargement in ffmpeg with lanczos
    // and hand the browser a 1:1 image, rather than letting the browser's default filter do it.
    const plateImg = fit.k > 1.001 ? await scaleTo(img, fw, fh) : img;
    const html = T.plateCard({ imageUrl: 'file://' + path.resolve(plateImg), w: fw, h: fh, pad, caption: attribution || '', capSize, cjk: isCJK(attribution) });
    // measure: the caption wraps, so the mount's height is whatever the browser makes it (capped by the frame)
    const png = await shotHtmlSize(html, `plate_${key}`, fw + 2 * pad + 6, fh + 2 * pad + g.capH + 10, true);
    const pp = await realPixels(png);
    fc.push(`[src]nullsink`);
    fc.push(`[1:v]scale=${pp.w}:${pp.h},setsar=1[fg]`);
    fc.push(`[bg][fg]overlay=x=(W-w)/2:y=${Math.round((BH - pp.h) / 2)}[cv]`);
    extraIn = png;
  } else {
    fc.push(`[src]scale=${fw}:${fh}:flags=lanczos,setsar=1[fg]`);
    fc.push(`[bg][fg]overlay=x=(W-w)/2:y=${oy}[cv]`);
  }
  // ---- the drift: zoom 1 → 1/from over the shot (0.94 → 1.00 of the honest size) + the seeded ±0.9 % pan.
  // v1.0 (2026-09-08): done with `perspective`, NOT `zoompan`. The founder: "they jitter, not sure why but that
  // needs to be fixed". zoompan crops an INTEGER pixel region out of its input every frame, so a slow push —
  // 0.94 → 1.00 over 30 s is 0.16 px per frame — stands perfectly still for five or six frames and then jumps a
  // whole pixel. Measured on a 300-frame 1920x1080 test, mean absolute frame-to-frame difference in an off-centre
  // window: zoompan moved on 9 of 30 consecutive frames (21 exact zeroes, spikes to 0.43); `perspective` with
  // float corner expressions moved on 30 of 30, by a constant 0.03–0.05. It samples sub-pixel (1/256 px), so it
  // needs none of the 4–8x supersampling the same fix would otherwise cost, which this 3 GB box cannot afford.
  // `perspective` keeps the input size, so the BW x BH canvas is resampled and then scaled down to the frame.
  if (dr.on) {
    const zEnd = 1 / from; const ax = (dr.dx * fw).toFixed(3), ay = (dr.dy * fh).toFixed(3);
    const pr = `(on/${Math.max(1, frames - 1)})`;
    const z = `(1+${(zEnd - 1).toFixed(6)}*${pr})`;
    const hw = `(${BW}/(2*${z}))`, hh = `(${BH}/(2*${z}))`;
    const cx = `(${BW}/2+${ax}*(1-${pr}))`, cy = `(${BH}/2+${ay}*(1-${pr}))`;
    fc.push(`[cv]perspective=eval=frame:interpolation=cubic:sense=source:` +
      `x0='${cx}-${hw}':y0='${cy}-${hh}':x1='${cx}+${hw}':y1='${cy}-${hh}':` +
      `x2='${cx}-${hw}':y2='${cy}+${hh}':x3='${cx}+${hw}':y3='${cy}+${hh}',` +
      `scale=${W}:${H}:flags=lanczos,format=yuv420p,setsar=1,fps=${FPS}[v]`);
  } else {
    fc.push(`[cv]scale=${W}:${H}:flags=lanczos,format=yuv420p,setsar=1,fps=${FPS}[v]`);
  }
  await ffmpeg(['-loop', '1', '-framerate', String(FPS), '-i', img, ...(extraIn ? ['-loop', '1', '-framerate', String(FPS), '-i', extraIn] : []),
    '-filter_complex', fc.join(';'), '-map', '[v]',
    '-frames:v', String(frames), '-r', String(FPS), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', out]);
  return { file: out, ...meta };
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
  // v0.9: the intermediate was W*2 x H*2, i.e. 3840x2160 at 1080p, to give `zoompan` headroom for a 1.055 push.
  // 1.15x is all that push needs and it is four times less pixel work per frame on a two-core box.
  const vf = `${pre}crop=${cw}:${ch}:${cx}:${cy},scale=${Math.round(W * 1.15 / 2) * 2}:${Math.round(H * 1.15 / 2) * 2}:flags=lanczos,` +
    `zoompan=z='${z}':x='${px}':y='ih/2-(ih/zoom/2)':d=${frames}:s=${W}x${H}:fps=${FPS},format=yuv420p,setsar=1`;
  await ffmpeg(['-i', src, '-filter_complex', vf, '-frames:v', String(frames), '-r', String(FPS),
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', out]);
  return out;
}

/**
 * Chain clips with cross-fades of `fade` seconds; returns one mp4 of the requested total duration.
 * v0.9: FOLDED IN GROUPS. At 1280x720 a single filter_complex with fifteen inputs fitted; at 1920x1080 it does
 * not — on this 3 GB box ffmpeg was killed after 46 minutes of thrashing (`ffmpeg exit null`, sys time > user
 * time, the signature of swapping). Folding in groups of `--xfade-group` (default 4) keeps the number of live
 * decoders constant at any frame size. It costs one extra generation of h264 on a walk longer than the group,
 * which is the right trade against not rendering at all.
 */
const XFADE_GROUP = Math.max(2, +(args['xfade-group'] || 4));
async function xfadeChain(clips, fade) {
  if (clips.length === 1) return clips[0].file;
  if (clips.length > XFADE_GROUP) {
    const parts = [];
    for (let i = 0; i < clips.length; i += XFADE_GROUP) {
      const g = clips.slice(i, i + XFADE_GROUP);
      const file = await xfadeChain(g, fade);
      parts.push({ file, dur: g.reduce((a, c) => a + c.dur, 0) - fade * (g.length - 1), fade });
    }
    return xfadeChain(parts, fade);
  }
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
// v0.9: the Mandarin cut needs a CJK face or every caption is a row of tofu, and CJK glyphs are full-width so
// the same point size runs far wider — Mandarin gets its own (smaller) size and a shorter card, exactly the
// reason hilbert's config carries `size_zh`. Latin styles are unchanged, only rescaled to the 1080p frame.
const CAP_FONT = LANG === 'zh' ? 'Noto Sans CJK SC' : 'Liberation Serif';
const UI_FONT = LANG === 'zh' ? 'Noto Sans CJK SC' : 'Liberation Sans';
const CAP_MAX_CHARS = LANG === 'zh' ? 24 : 84;
function assHeader() {
  const sc = H / 720;
  const capSize = Math.round((LANG === 'zh' ? 26 : 30) * sc);
  return `[Script Info]\nScriptType: v4.00+\nPlayResX: ${W}\nPlayResY: ${H}\nWrapStyle: 0\nScaledBorderAndShadow: yes\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n` +
    `Style: Cap,${CAP_FONT},${capSize},&H00DAE6EC,&H00FFFFFF,&H00000000,&H90000000,0,0,0,0,100,100,0,0,3,${Math.round(3 * sc)},0,2,${Math.round(120 * sc)},${Math.round(120 * sc)},${Math.round(44 * sc)},1\n` +
    // v1.0: the `Title` (scene name, bottom-left, 0–4 s) and `Pin` (overlays, top-left) styles are GONE — see the
    // caption block in the scene loop. Only two styles are left: the narration caption and the licence credit.
    `Style: Attr,Liberation Sans,${Math.round(15 * sc)},&H00BCC8CF,&H00FFFFFF,&H00000000,&H90000000,0,0,0,0,100,100,0,0,3,${Math.round(3 * sc)},0,3,${Math.round(24 * sc)},${Math.round(16 * sc)},${Math.round(10 * sc)},1\n` +
    `\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;
}
const assLine = (style, s, e, text) => `Dialogue: 0,${assTime(s)},${assTime(e)},${style},,0,0,0,,${assEsc(text)}\n`;

/**
 * v0.9 — captions without word timings. Kokoro gives us a sentence and its length, not a word track, so a
 * sentence longer than one caption card is split at the best punctuation/word break and each piece gets the
 * share of the sentence's seconds that matches its share of the characters. Constant speaking rate inside a
 * sentence is an approximation; the sentence's own in and out points are exact, and a card is never orphaned
 * across a sentence boundary. CJK has no spaces, so it breaks after punctuation or simply on the character
 * count, following the kinsoku rule that a closing mark never opens a line.
 */
const CJK_CLOSE = '。，、：；！？）」』】》”’…·';
const CJK_OPEN = '（「『【《“‘';
function splitForCaption(text, maxChars) {
  const t = String(text || '').trim(); if (!t) return [];
  if (t.length <= maxChars) return [t];
  const out = []; let rest = t;
  while (rest.length > maxChars) {
    let cut = -1;
    if (isCJK(rest)) {
      for (let i = Math.min(maxChars, rest.length - 1); i > maxChars * 0.45; i--) {
        if (CJK_CLOSE.includes(rest[i - 1]) && !CJK_CLOSE.includes(rest[i])) { cut = i; break; }
      }
      if (cut < 0) { cut = maxChars; while (cut < rest.length && CJK_CLOSE.includes(rest[cut])) cut++;   // never open a line with a closing mark
                     while (cut > 1 && CJK_OPEN.includes(rest[cut - 1])) cut--; }                        // never end one with an opening bracket
    } else {
      const win = rest.slice(0, maxChars + 1);
      cut = Math.max(win.lastIndexOf(', '), win.lastIndexOf('; '), win.lastIndexOf(' — '), win.lastIndexOf(': '));
      if (cut > maxChars * 0.45) cut += 1; else cut = win.lastIndexOf(' ');
      if (cut <= 0) cut = maxChars;
    }
    out.push(rest.slice(0, cut).trim()); rest = rest.slice(cut).trim();
  }
  if (rest) out.push(rest);
  return out;
}
/** one utterance (= one sentence) → caption cards with times, proportional to characters. */
function captionCards(text, dur, maxChars) {
  const parts = splitForCaption(text, maxChars); if (!parts.length) return [];
  const total = parts.reduce((a, p) => a + p.length, 0) || 1; let t = 0;
  return parts.map(p => { const d = dur * p.length / total; const c = { text: p, s: t, e: t + d }; t += d; return c; });
}
/** Turn word boundaries into caption chunks of ≤ maxChars, cut at sentence ends. (kept: --plan/regression paths) */
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
  // the sidecar: a per-locale one wins when it exists (its s:N tokens index the LOCALE's sentences, not English)
  const localeCuts = LOCALE_ID ? path.join(__dirname, 'cuts', `${chapter.id}.${LOCALE_ID}.json`) : null;
  const cutsPath = args.cuts ? path.resolve(args.cuts)
    : (localeCuts && fs.existsSync(localeCuts)) ? localeCuts : path.join(__dirname, 'cuts', `${chapter.id}.json`);
  const cuts = fs.existsSync(cutsPath) ? JSON.parse(fs.readFileSync(cutsPath, 'utf8')) : { scenes: {} };
  const cutsAreLocalised = !!(localeCuts && cutsPath === localeCuts);

  const manifestMd = fs.existsSync(path.join(CHAPTER_DIR, 'media', 'manifest.md')) ? fs.readFileSync(path.join(CHAPTER_DIR, 'media', 'manifest.md'), 'utf8') : '';
  const manifestRow = id => { const line = manifestMd.split('\n').find(l => l.startsWith(`| ${id} |`)); if (!line) return null; const c = line.split('|').map(x => x.trim()); return { id: c[1], kind: c[2], ref: c[3].replace(/`/g, ''), title: c[4], license: c[5], notes: c[10] || '' }; };
  const logLines = [], warnings = [], droppedOverlays = [];
  const note = (s) => { logLines.push(s); };
  // Is an overlay's information already in the narration this cut speaks? Compare the "content tokens" — numbers,
  // years and words of 4+ letters/2+ CJK characters — because that is what an overlay actually carries ("No. 15 —
  // Henry Poole, on the Row since 1846"). >= 70 % of them present in the spoken text = covered. Deliberately
  // crude and deliberately generous to the *reporting* side: a false "not covered" costs a human ten seconds,
  // a false "covered" hides a real loss.
  const contentTokens = t => (String(t).toLowerCase().match(/[a-z']{4,}|\d[\d,.:]*|[\u4e00-\u9fff]{2,}/g) || []);
  function overlayCovered(text, spoken) {
    const sp = String(spoken).toLowerCase(); const toks = contentTokens(text);
    if (!toks.length) return true;
    const hit = toks.filter(t => sp.includes(t)).length;
    return hit / toks.length >= 0.7;
  }

  // ---- the locale layer, read EXACTLY as the player reads it -------------------------------------------------
  // products/<p>/<chapter>/i18n/<locale>.json, index-addressed: overlays[].i and interaction.options[].i point at
  // the English arrays. Anything omitted falls back to English; a partial locale is valid and must not break us.
  const localePath = LOCALE_ID ? path.join(CHAPTER_DIR, 'i18n', `${LOCALE_ID}.json`) : null;
  let LOC = null;
  if (localePath) {
    if (!fs.existsSync(localePath)) throw new Error(`--lang ${LANG} needs ${localePath} (see studio/templates/i18n-locale.md)`);
    LOC = JSON.parse(fs.readFileSync(localePath, 'utf8'));
    note(`Locale: ${localePath} (${LOC.name || LOC.locale}) — ${Object.keys(LOC.scenes || {}).length} scenes translated; anything missing falls back to English.`);
  }
  const LT = {
    scene: id => (LOC && LOC.scenes && LOC.scenes[id]) || null,
    title: s => (LT.scene(s.id) || {}).title || s.title,
    chapterTitle: () => ((LOC || {}).chapter || {}).title || chapter.title,
    tourTitle: () => ((LOC || {}).chapter || {}).tour_title || tour.title,
    script: s => { const t = LT.scene(s.id); return (t && t.script) || null; },
    afterScript: s => { const t = LT.scene(s.id); return (t && t.after_script) || null; },
    overlay: (s, i) => { const t = LT.scene(s.id); const o = t && (t.overlays || []).find(x => x.i === i); return (o && o.text) || ((s.overlays || [])[i] || {}).text || ''; },
    prompt: s => { const t = LT.scene(s.id); return (t && t.interaction && t.interaction.prompt) || (s.interaction || {}).prompt || ''; },
    option: (s, i) => { const t = LT.scene(s.id); const src = (s.interaction || {}).options || []; const o = t && t.interaction && (t.interaction.options || []).find(x => x.i === i);
      return { ...(src[i] || {}), text: (o && o.text) || (src[i] || {}).text || '', feedback: (o && o.feedback) || (src[i] || {}).feedback || '' }; },
    options: s => ((s.interaction || {}).options || []).map((_, i) => LT.option(s, i))
  };

  // 1. selection
  let selection;
  if (readme) { selection = readme.rows.map(r => { const i = scenes.findIndex(s => s.id === r.id); return i < 0 ? null : { idx: i, scene: scenes[i], cap: r.s, use: r.use }; }).filter(Boolean); note(`Selection: ${selection.length} scenes from scenes/README.md "Linear cut" table (${readme.rows.reduce((a, r) => a + r.s, 0)} s planned).`);
    for (const bad of readme.skipped || []) warnings.push(`scenes/README.md "Linear cut": this row has no readable seconds column and is NOT in the film — \`${bad}\``);
    for (const r of readme.rows) if (!scenes.some(s2 => s2.id === r.id)) warnings.push(`scenes/README.md "Linear cut" row "${r.num} ${r.id}" names a scene that is not in tour.json — dropped`); }
  else { selection = scenes.map((s, i) => ({ idx: i, scene: s, cap: s.duration_s, use: 'whole' })).filter(x => !/INTERACTIVE CUT ONLY/i.test(x.scene.production_notes || '')); note('Selection: no README table found — all scenes except "INTERACTIVE CUT ONLY", capped at duration_s.'); }
  if (ONLY) selection = selection.filter(x => ONLY.includes(x.idx + 1));

  // 2. per-scene plan: script tokens → utterances
  //
  // English stays canonical: the sidecar's `s:N` tokens are indexed against narration.script, the one English track
  // (D8). The locale file translates that whole script, so for --lang zh those indices do not
  // transfer (Day 1: 8 of 18 scenes split into a different number of Mandarin sentences — 19 English sentences
  // become 13 Chinese ones in `count-the-steps`). Three ways out, in order of authority:
  //   1. cuts/<chapter-id>.<locale>.json — a real per-locale cut sheet, tokens indexed into the LOCALE's sentences.
  //      That is the right answer and it is a Narrator/Translator deliverable, not something a tool may invent.
  //   2. --zh-align proportional (default) — mechanical alignment: each kept English sentence is a span of the
  //      script's characters; a locale sentence is kept when the majority of its own span lies inside a kept span.
  //      Sound when the translation is parallel (it is, sentence by sentence, with occasional merges); it is
  //      logged per scene in render-log.md so a human can check it, and it is NOT a substitute for (1).
  //   3. --zh-align whole — speak the whole translated script and let the end-cut trim it.
  const ZH_ALIGN = args['zh-align'] || 'proportional';
  const spansOf = (arr) => { const tot = arr.reduce((a, x) => a + x.length, 0) || 1; let c = 0;
    return arr.map(x => { const a = c / tot; c += x.length; return [a, c / tot]; }); };
  function alignKept(enSents, zhSents, kept) {
    const es = spansOf(enSents), zs = spansOf(zhSents);
    const out = [];
    zs.forEach(([a, b], j) => {
      let inside = 0; for (const i of kept) { const [x, y] = es[i]; inside += Math.max(0, Math.min(b, y) - Math.max(a, x)); }
      if (inside > (b - a) * 0.5) out.push(j);
    });
    return out;
  }
  const plans = [];
  for (const sel of selection) {
    const s = sel.scene; const hint = (cuts.scenes || {})[s.id] || {};
    // One English narration track: narration.script IS the clear-English track (founder decision 2026-09-03,
    // DECISIONS.md D8 — the literary register is retired, "I need to be able to judge"). No --track, no variant lookup.
    const _en = s.narration?.script || '';
    const enSents = splitSentences(_en);
    const locScript = LT.script(s);
    const localised = LANG === 'zh' && !!locScript;
    const sents = localised ? splitSentencesZh(locScript) : enSents;
    if (LANG === 'zh' && !locScript && (s.narration?.script || '').trim())
      warnings.push(`${sel.idx + 1} ${s.id}: no Mandarin script in the locale file — this scene speaks ENGLISH in the zh cut`);
    const tokens = hint.script || enSents.map((_, i) => `s:${i}`);
    // one sentence = one utterance = one cache entry (Kokoro has no word track, and "edit one line, re-synthesize
    // one line" is the whole point of the cache key). Nothing is merged any more.
    const utts = []; const push = (voice, text, src) => { const t = String(text || '').trim(); if (t) utts.push({ voice, text: t, src: [src] }); };
    const usedS = new Set(); let alignNote = '';
    for (const tk of tokens) {
      const [kind, a, b] = String(tk).split(':');
      if (kind === 's') { const [x, y] = a.split('-').map(Number); for (let i = x; i <= (isNaN(y) ? x : y); i++) if (enSents[i]) usedS.add(i); }
      else if (kind === 'quiz') { const o = LT.options(s).find((_, i) => ((s.interaction?.options || [])[i] || {}).correct); if (o) push(VOICE, `${o.text.trim().replace(/[.]?$/, LANG === 'zh' ? '' : '.')} ${o.feedback || ''}`.trim(), 'quiz:correct'); }
      else if (kind === 'chat') { const o = LT.option(s, +a); if (o && (o.text || o.feedback)) { if (b !== 'answer') push(VOICE, o.text, `chat:${a}:q`); push(VOICE2, o.feedback || o.answer || '', `chat:${a}:a`); } }
      else if (kind === 'overlay') { push(VOICE, LT.overlay(s, +a), `overlay:${a}`); }
      else if (kind === 'game') { const os = (s.interaction?.options || []); if (a === 'list') push(VOICE, LT.options(s).filter((_, i) => os[i] && os[i].correct).map(o => o.text.replace(/\s*[—-]\s*£.*$/, '')).join(LANG === 'zh' ? '、' : '; ') + (LANG === 'zh' ? '。' : '.'), 'game:list'); }
    }
    // the narration sentences, in order, in whichever language this cut speaks
    let keep = [...usedS].sort((a, b) => a - b);
    if (localised && !cutsAreLocalised) {
      if (ZH_ALIGN === 'whole' || !hint.script) { const all = sents.map((_, i) => i); alignNote = hint.script ? `zh: --zh-align whole — the whole translated script (${sents.length} sentences), the English cut kept ${keep.length}/${enSents.length}` : ''; keep = all; }
      else { const mapped = alignKept(enSents, sents, keep);
        alignNote = `zh: sentence tokens re-aligned proportionally — English kept ${keep.length}/${enSents.length} → Mandarin ${mapped.length}/${sents.length} (no zh cut sheet; see README "Two cuts")`;
        keep = mapped; }
    }
    const sentUtts = keep.map(i => ({ i, text: sents[i] })).filter(x => x.text);
    // narration first, then whatever the tokens added after it (quiz/chat/overlay/game keep their order)
    const extra = utts.splice(0, utts.length);
    const ordered = [];
    let placed = false;
    for (const tk of tokens) { const kind = String(tk).split(':')[0];
      if (kind === 's') { if (!placed) { placed = true; for (const x of sentUtts) ordered.push({ voice: VOICE, text: x.text, src: [`s:${x.i}`] }); } }
      else { const e = extra.shift(); if (e) ordered.push(e); if (kind === 'chat') { const e2 = extra.shift(); if (e2) ordered.push(e2); } }
    }
    if (!placed) for (const x of sentUtts) ordered.unshift({ voice: VOICE, text: x.text, src: [`s:${x.i}`] });
    while (extra.length) ordered.push(extra.shift());
    const dropped = sents.map((x, i) => keep.includes(i) ? null : `[${i}] ${x}`).filter(Boolean);
    plans.push({ sel, s, hint, sents, enSents, localised, utts: ordered, alignNote, droppedBySidecar: hint.script ? dropped : [] });
  }

  // 3. TTS (one local Kokoro process for the whole cut) + timing
  const GAP = args.gap !== undefined ? +args.gap : 0.28;   // silence between sentences; "silence is content" (positioning.md)
  const jobs = []; const spokenAs = [];
  plans.forEach((p, pi) => p.utts.forEach((u, ui) => {
    u.jobId = `p${pi}u${ui}`;
    const notes = []; u.say = speechText(u.text, LANG, notes);          // TTS input only — the caption keeps the authored wording
    if (notes.length) spokenAs.push(`${p.s.id}: ${notes.join(' · ')}`);
    jobs.push({ id: u.jobId, text: u.say, lang: LANG });
  }));
  if (spokenAs.length) note(`Speech normalisation (TTS input only; captions, VTT and scene files keep the authored wording): ${spokenAs.length} rewrite(s) — ${spokenAs.join('; ')}.`);
  const spoken = NO_TTS ? new Map() : await ttsBatch(jobs);
  if (!NO_TTS && !spoken.size) warnings.push('TTS produced nothing — this cut is captions only. Check ' + PYTHON + ' and ' + path.join(__dirname, 'tts_kokoro.py'));
  // one narration gain for the whole film, measured from the clips themselves (Kokoro's level is consistent, but
  // it is not Edge's, and guessing a gain is how a film ends up 6 dB quiet on YouTube). Median of the clips long
  // enough for ebur128 to mean anything.
  let NARR_GAIN_DB = 0;
  if (spoken.size) {
    const longs = [...spoken.values()].filter(i => i.dur >= 3).slice(0, 12);
    const ls = []; for (const i of longs) ls.push(await measureLufs(i.file));
    if (ls.length) { ls.sort((a, b) => a - b); const med = ls[Math.floor(ls.length / 2)];
      NARR_GAIN_DB = Math.max(-6, Math.min(18, NARR_TARGET_LUFS - med));
      note(`Narration level: measured ${fmt1(med)} LUFS over ${ls.length} clip(s) → ${fmt1(NARR_GAIN_DB)} dB to reach ${NARR_TARGET_LUFS} LUFS.`); }
  }
  for (const p of plans) {
    const cap = p.sel.cap * (1 + SLACK); const narrAt = p.hint.narration_at_s ?? 1.0; let t = 0; p.narrAt = narrAt; p.ttsOk = true;
    for (const u of p.utts) {
      const r = spoken.get(u.jobId);
      if (!r) { p.ttsOk = false; u.wav = null;
        u.dur = LANG === 'zh' ? Math.max(1.5, u.text.length / 4.77) : Math.max(1.5, u.text.split(/\s+/).length / 2.7); }
      else { u.wav = r.file; u.dur = r.dur; }
      u.words = []; u.sents = [{ t: u.text, s: 0, e: u.dur }];
      u.at = t; t += u.dur + (u.voice === VOICE2 ? 0.6 : GAP);
    }
    let speechEnd = p.utts.length ? p.utts[p.utts.length - 1].at + p.utts[p.utts.length - 1].dur : 0; p.cutLog = [];
    if (narrAt + speechEnd + 1.0 > cap && p.utts.length) {
      // cut at the last sentence boundary that fits
      let keep = null; for (const u of p.utts) for (const se of u.sents) { const abs = u.at + se.e; if (narrAt + abs + 1.0 <= cap) keep = { u, se, abs }; }
      if (!keep) { p.cutLog.push(`script cut: nothing fits ${fmt1(cap)} s — kept first sentence anyway`); const u = p.utts[0]; keep = { u, se: u.sents[0], abs: u.at + u.sents[0].e }; }
      const ki = p.utts.indexOf(keep.u); const removedUtts = p.utts.slice(ki + 1); p.utts = p.utts.slice(0, ki + 1);
      const si = keep.u.sents.indexOf(keep.se); const removedS = keep.u.sents.slice(si + 1); keep.u.trimTo = keep.se.e + 0.25; keep.u.dur = keep.u.trimTo; keep.u.sents = keep.u.sents.slice(0, si + 1);
      const dropped = removedS.map(x => x.t).concat(removedUtts.flatMap(u => u.sents.map(x => x.t)));
      p.cutLog.push(`script cut to fit ${p.sel.cap} s (+${Math.round(SLACK * 100)}% slack = ${fmt1(cap)} s): dropped ${dropped.length} sentence(s) at the end — ${dropped.map(x => `"${x.length > 70 ? x.slice(0, 67) + '…' : x}"`).join(' / ')}`);
      speechEnd = keep.u.at + keep.u.dur;
    }
    // v0.9: the README seconds are a FLOOR as well as a cap.
    //   len = clamp(narration + pad, readme_s, readme_s x (1 + slack))
    // Before this, `len` was narration + 2.5 s capped by the README seconds and never floored by them, so every
    // scene ended within a couple of seconds of the last word (the 20 Aug animatic: 46.7 s of scene over 44.2 s
    // of speech, 63.3 over 61.3, seventeen times over). The consequence was that trimming words bought the film
    // no air at all — it just made scenes shorter and left the voice wall-to-wall, which defeats the density work
    // AND positioning.md's "silence is content". The authored seconds now mean what they say; the extra time is a
    // held shot at the end of the scene. `--no-floor` restores the old behaviour.
    p.speechEnd = speechEnd;
    const want = p.utts.length ? narrAt + speechEnd + 1.5 : 8;
    p.len = args['no-floor'] ? Math.max(6, Math.min(cap, want)) : Math.max(6, Math.min(cap, Math.max(p.sel.cap, want)));
    p.len = Math.round(p.len * FPS) / FPS;
    if (!args['no-floor'] && p.len - (narrAt + speechEnd) > 6) p.tail = p.len - (narrAt + speechEnd);
    if (p.alignNote) warnings.push(`${p.sel.idx + 1} ${p.s.id}: ${p.alignNote}`);
    // Mandarin density, measured against the voice we actually use (hilbert: zf_xiaoxiao ≈ 286 char/min = 4.77 char/s).
    // A translation that needs more than ~92 % of the slot leaves no silence, and silence is content (positioning.md).
    if (p.localised) { const chars = p.utts.reduce((a, u) => a + u.text.length, 0); const need = chars / 4.77; const room = p.sel.cap - p.narrAt - 1.5;
      if (need > room * 0.92) warnings.push(`${p.sel.idx + 1} ${p.s.id}: **too dense in Mandarin** — ${chars} characters ≈ ${fmt1(need)} s of speech in ${p.sel.cap} s (${fmt1(room)} s of room). Either the locale line is shortened or the scene gets more seconds; the renderer will end-cut it.`); }
  }

  if (PLAN || args.verbose) {
    for (const p of plans) {
      console.log(`\n== ${String(p.sel.idx + 1).padStart(2, '0')} ${p.s.id} (${p.s.type}) README ${p.sel.cap} s → ${fmt1(p.len)} s; TTS ${p.ttsOk ? 'ok' : 'FALLBACK'}; narration ${fmt1(p.speechEnd)} s from ${p.narrAt} s${p.localised ? ' [zh]' : ''}`);
      p.sents.forEach((x, i) => console.log(`   [${i}] ${x}`));
      p.utts.forEach(u => console.log(`   > ${u.voice} ${fmt1(u.dur)} s ${u.src.join(',')}`));
      if (p.alignNote) console.log('   ~ ' + p.alignNote);
      p.cutLog.forEach(x => console.log('   ! ' + x));
      p.droppedBySidecar.forEach(x => console.log('   - dropped ' + x));
      // Mandarin density: hilbert measures zf_xiaoxiao at 286 characters/minute (4.77 char/s). A scene whose
      // translation needs more than ~92 % of that has no room to breathe, and "unhurried" is a hard constraint.
      if (p.localised) { const chars = p.utts.reduce((a, u) => a + u.text.length, 0);
        const need = chars / 4.77, room = p.sel.cap - p.narrAt - 1.5;
        if (need > room * 0.92) console.log(`   ! DENSE: ${chars} characters need ${fmt1(need)} s of speech in a ${p.sel.cap} s slot (${fmt1(room)} s of room) — the translation is too dense for this cut`); }
    }
    console.log(`\nTotal ≈ ${fmt1(plans.reduce((a, p) => a + p.len, 0) + TITLE_S + 14)} s`);
    if (ttsStats) console.log(`TTS: ${ttsStats.synthesized} synthesized, ${ttsStats.cached} cached, ${ttsStats.audio_s} s of audio in ${ttsStats.wall_s} s (${ttsStats.x_realtime}x real time), cost 0`);
    if (PLAN) { if (browser) await browser.close(); process.exit(0); }
  }

  // 4. visuals + audio per scene → scene mp4
  const creditsUsed = new Map(); // manifest_id → {attribution, license, kind}
  let clipCards = 0, footageSegs = 0;   // A8: the point of the exercise is to drive clipCards to zero
  const useCredit = (m) => { if (!m) return; const id = m.manifest_id || m.ref; if (!creditsUsed.has(id)) creditsUsed.set(id, { id, kind: m.kind, attribution: m.attribution || m.ref, license: m.license || '', ref: m.ref }); };
  const vtt = ['WEBVTT', '']; let globalT = TITLE_S; const sceneFiles = [];

  // ---- the FILM map (D9) ------------------------------------------------------------------------------------
  // Not a screenshot of the print plate. studio/tools/render/lib/mapfilm.mjs draws its own graphic from
  // generated/g-01/route-data.json — same facts, film-legible type, revealed on the narration clock. If the data
  // file or the cached Natural Earth land is missing, mapLoaded is null and the map beats fall back to the old
  // player screenshot with a warning, so a clean checkout still renders.
  const mapLoaded = MF.load(CHAPTER_DIR);
  let mapUsed = false;
  if (!mapLoaded) warnings.push('film map: generated/g-01/route-data.json (or its land geojson) is missing — run `python3 studio/tools/gen/g01_route_map.py`. Map beats fall back to a screenshot of the print plate, which is the thing D9 says is unreadable.');
  else note(`Film map: own 1920x1080 graphic from generated/g-01/route-data.json (${mapLoaded.data.ports.length} ports, ${mapLoaded.data.legs.length} legs, ${mapLoaded.data.total_days} days) — the G-01 print plate is NOT screenshotted any more (D9: too small, too much text).`);
  // Mandarin port names come from the Translator's own words, never from this tool: a tap-to-find map scene
  // authors its options as "London → Suez" / "伦敦 → 苏伊士", one per leg in leg order. Used only if all eight
  // parse AND chain (option i's destination is option i+1's origin, and the last closes the loop).
  let MAPNAMES = null;
  if (mapLoaded && LANG === 'zh') {
    for (const sc of scenes) {
      const os = (sc.interaction || {}).options || [];
      if (os.length !== mapLoaded.data.legs.length) continue;
      const pairs = os.map((_, i) => String(LT.option(sc, i).text || '').split(/\s*(?:→|->)\s*/));
      if (!pairs.every(x => x.length === 2 && x[0].trim() && x[1].trim())) continue;
      const chained = pairs.every((x, i) => i === 0 || x[0].trim() === pairs[i - 1][1].trim()) &&
        pairs[pairs.length - 1][1].trim() === pairs[0][0].trim();
      if (!chained) continue;
      MAPNAMES = {}; mapLoaded.data.legs.forEach((l, i) => { MAPNAMES[l.from] = pairs[i][0].trim(); MAPNAMES[l.to] = pairs[i][1].trim(); });
      note(`Film map, Mandarin port names: taken from scene \`${sc.id}\`'s translated options (${Object.values(MAPNAMES).join('、')}) — this tool never translates a place name itself.`);
      break;
    }
    if (!MAPNAMES) warnings.push('film map: no scene in this chapter carries a translated leg list that parses as "A → B" for all eight legs, so the Mandarin map shows the ENGLISH port names. Fix by keeping the map scene\'s tap-to-find options in leg order in i18n/<locale>.json.');
  }
  const mapLabels = () => ({ ports: MAPNAMES || {}, days: LANG === 'zh' ? '天' : 'days', of: LANG === 'zh' ? '/' : 'of' });
  const FONTS_DIR = path.resolve(__dirname, '..', '..', 'player', 'fonts');
  const ytLabel = m => { const row = manifestRow(m.manifest_id) || {}; const tm = (row.title || '').match(/^"(.+?)"\s+—\s+(.+?)\s*\(/); return { channel: tm ? tm[2] : (m.attribution || '').split(',')[0], videoTitle: tm ? tm[1] : (m.attribution || m.ref) }; };

  // title card
  const titlePng = await shotHtml(T.titleCard({ tourTitle: LT.tourTitle(), chapterTitle: LT.chapterTitle(), dateStr: DATE, lang: LANG }), 'title');
  const titleMp4 = path.join(WORK, '00_title.mp4'); await ffmpeg(['-loop', '1', '-framerate', String(FPS), '-i', titlePng, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-t', String(TITLE_S), '-vf', `format=yuv420p,fade=t=in:st=0:d=0.5,fade=t=out:st=${TITLE_S - 0.5}:d=0.5`, '-r', String(FPS), '-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'stillimage', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-ac', '2', '-shortest', titleMp4]); sceneFiles.push(titleMp4);

  for (const p of plans) {
    const s = p.s, n = p.sel.idx, hint = p.hint, len = p.len; const tag = `${String(n + 1).padStart(2, '0')}_${s.id}`; log(`scene ${tag}: ${fmt1(len)} s`);
    const media = s.media || []; const f = len / (s.duration_s || len);
    // ---- visual segments (list of {kind, dur|null, ...}) ----
    let segs = [];
    // v0.9: a still goes through the SHARED treatment layer (studio/player/imagelayer.mjs) with the file's REAL
    // pixels, so the film and the player mount the same picture the same way and nothing is ever upscaled.
    const imgSeg = async (m, dur) => { let r; try { r = await resolveStill(m); } catch (e) {
        // the player's v0.7 degradation: a named card, never an empty black frame
        warnings.push(`${tag}: ${m.manifest_id || m.ref} could not be loaded (${String(e.message).slice(0, 90)}) — named card in its place`);
        return { kind: 'png', file: await shotHtml(T.sceneCard({ title: LT.title(s), subtitle: LT.chapterTitle(), note: (LANG === 'zh' ? '这张图未能载入 — ' : 'This picture could not be loaded — ') + (m.attribution || m.manifest_id || '') }), `noimg_${tag}_${m.manifest_id}`), dur, src: `${m.manifest_id} MISSING — named card` }; }
      useCredit(m);
      if (r.fellBack) warnings.push(`${tag}: ${r.fellBack}`);
      const att = r.credit;
      const treat = IL.pickTreatment(m, r.w, r.h, W, H, cfgFor(m, r.w, r.h));
      const src = isCommons(m.ref) ? 'Commons still' : 'still';
      return { kind: 'still', file: r.file, dur, m, nw: r.w, nh: r.h, treat, attribution: att,
        label: `${m.manifest_id} ${src} ${r.w}x${r.h}`, src: `${m.manifest_id} ${src} ${r.w}x${r.h} → ${treat}` }; };
    const clipSeg = async (m, dur, inS = m.start_s || 0, outS = m.end_s || 0) => { const { channel, videoTitle } = ytLabel(m); const th = await ytThumb(m.ref); useCredit(m); clipCards++; const html = T.clipCard({ channel, videoTitle, videoId: m.ref, inS, outS, sceneTitle: s.title, thumbUrl: th ? 'file://' + th : '', note: hint.clip_note || '' }); return { kind: 'png', file: await shotHtml(html, `clip_${m.ref}`), dur, src: `${m.manifest_id} clip card (YouTube ${m.ref} ${mmss(inS)}–${mmss(outS)}) — no download` }; };
    const footageSeg = async (m, dur, inS = m.start_s || 0) => { const f = path.join(CHAPTER_DIR, m.ref); if (!fs.existsSync(f)) return await pendingSeg(m, dur); useCredit(m); footageSegs++; return { kind: 'footage', file: f, in_s: inS, dur, attribution: m.attribution || '', src: `${m.manifest_id} local footage ${m.ref}${inS ? ' from ' + mmss(inS) : ''} — self-hosted, licence-clean` }; };
    const pendingSeg = async (m, dur) => ({ kind: 'png', file: await shotHtml(T.pendingCard({ sceneTitle: LT.title(s), assetId: m.manifest_id, spec: (m.note || '').slice(0, 140) }), `pending_${m.manifest_id}`), dur, src: `${m.manifest_id} pending-asset card` });
    const playerSeg = async (call, dur, label) => ({ kind: 'png', file: await shotPlayer(call, `player_${label}`), dur, src: `player screenshot ${call}` });
    // when did the narration say this? `s:N` = narration sentence N, `quiz:correct` = the answer utterance.
    const uttAt = (src) => { const u = p.utts.find(u => (u.src || []).includes(src)); return u ? p.narrAt + u.at : null; };
    /**
     * QUIZ, as a film device (D9). Two frames, one cut: the question with the options set plainly, then the
     * reveal. The cut lands 0.45 s before the utterance the cut sheet built from `quiz:correct` — i.e. on the
     * narration beat, the way the photo slots are driven — so the answer appears exactly as the guide starts to
     * give it, and never before. With no such utterance (a scene with no `quiz:correct` token, or a locale whose
     * alignment dropped it) it falls back to 62 % of the beat, which still holds the question first.
     */
    const quizSeg = async (dur) => {
      const img = media.find(x => x.kind === 'image'); const ci = img ? await commonsImage(img.ref) : null; if (img) useCredit(img);
      const it = s.interaction || {}; const opts = LT.options(s);
      const fb = opts.find((_, i) => ((it.options || [])[i] || {}).correct)?.feedback || '';
      const base = { sceneTitle: LT.title(s), imageUrl: ci ? 'file://' + ci.file : '', imageW: ci ? ci.info.w : 0, imageH: ci ? ci.info.h : 0,
        attribution: img ? (img.attribution || '') : '', prompt: LT.prompt(s), options: opts, feedback: fb };
      const ask = await shotHtml(T.quizScreen({ ...base, phase: 'ask' }), `quizask_${tag}_${LANG}`);
      const rev = await shotHtml(T.quizScreen({ ...base, phase: 'reveal' }), `quizrev_${tag}_${LANG}`);
      const beat = uttAt('quiz:correct');
      // the credit is printed on the card itself (hero caption), so the burned bottom-right line is suppressed —
      // one credit, not two. attrInFrame is the same flag a paper plate sets.
      return { kind: 'states', ask, rev, revealAt: beat != null ? beat - 0.45 : null, dur,
        attribution: img?.attribution, attrInFrame: true, src: 'quiz — question held, then the reveal' };
    };
    /** ROUTE MAP, as a film device (D9). beats: [{show:'leg:1'|'enabler:A'|'london'|'total', s:<sentence>|t:<sec>}] */
    const mapSeg = async (state, beats, dur, why) => {
      if (!mapLoaded) return await playerSeg(`showRouteMap(${state === 'day-1'})`, dur, `${tag}_${state}`);
      mapUsed = true;
      const resolved = (beats || []).map(b => {
        const t = b.t !== undefined ? +b.t : (b.s !== undefined ? uttAt(`s:${b.s}`) : null);
        return t == null ? null : { show: b.show, at: t - (b.lead !== undefined ? +b.lead : 0.25), from: b.s !== undefined ? `s:${b.s}` : `t=${b.t}` };
      }).filter(Boolean);
      const missed = (beats || []).length - resolved.length;
      if (missed) warnings.push(`${tag}: ${missed} map beat(s) point at a narration sentence this cut does not speak — those reveals are spaced evenly instead. (zh: the sentence indices are English; see README "Two cuts".)`);
      return { kind: 'mapfilm', state, beats: resolved, dur, src: `film route map (${state}${why ? ', ' + why : ''}) — own graphic from route-data.json` };
    };
    if (hint.visuals) {
      for (const v of hint.visuals) {
        const m = v.media ? media.find(x => x.manifest_id === v.media) : null; const dur = v.dur ?? null;
        if (v.kind === 'routemap') segs.push(await mapSeg(v.state || 'day-1', v.beats, dur));
        // a cut sheet written before D9 asks for a player screenshot of the G-01 plate; route it to the film map.
        else if (v.kind === 'player' && /showRouteMap\s*\(/.test(String(v.call || '')))
          segs.push(await mapSeg(/showRouteMap\s*\(\s*false/.test(v.call) ? 'loop' : 'day-1', v.beats, dur, `was ${v.call}`));
        else if (v.kind === 'image' && m) segs.push(await imgSeg(m, dur));
        else if (v.kind === 'clip' && m) segs.push(await clipSeg(m, dur, v.in_s ?? m.start_s ?? 0, v.out_s ?? m.end_s ?? 0));
        else if (v.kind === 'footage' && m) segs.push(await footageSeg(m, dur, v.in_s ?? m.start_s ?? 0));
        else if (v.kind === 'player') segs.push(await playerSeg(v.call, dur, `${tag}_${sha(v.call)}`));
        else if (v.kind === 'scenecard') segs.push({ kind: 'png', file: await shotHtml(T.sceneCard({ title: LT.title(s), subtitle: LT.chapterTitle(), note: v.note || '' }), `scenecard_${tag}`), dur, src: 'scene title card' });
        else if (v.kind === 'pending' && m) segs.push(await pendingSeg(m, dur));
        else if (v.kind === 'quiz') segs.push(await quizSeg(dur));
        else if (v.kind === 'chat') { const img = media.find(x => x.kind === 'image'); const ci = img ? await commonsImage(img.ref) : null; if (img) useCredit(img); const it = s.interaction || {}; const turns = (v.chips || [0]).flatMap(i => { const o = (it.options || [])[i] ? LT.option(s, i) : null; return o ? [{ role: 'q', text: o.text }, { role: 'a', text: o.feedback || o.answer || '' }] : []; }); segs.push({ kind: 'png', file: await shotHtml(T.chatScreen({ sceneTitle: LT.title(s), imageUrl: ci ? 'file://' + ci.file : '', imageW: ci ? ci.info.w : 0, imageH: ci ? ci.info.h : 0, attribution: img ? (img.attribution || '') : '', context: LT.prompt(s), turns }), `chat_${tag}`), dur, attribution: img?.attribution, src: 'dialogue screen (own render, scripted chips)' }); }
        else if (v.kind === 'checklist') { const it = s.interaction || {}; segs.push({ kind: 'png', file: await shotHtml(T.checklistScreen({ sceneTitle: LT.title(s), prompt: LT.prompt(s), options: LT.options(s), closing: v.closing_overlay !== undefined ? (s.overlays || [])[v.closing_overlay]?.text : '' }), `check_${tag}`), dur, src: 'checklist screen (own render)' }); }
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
            segs.push({ kind: 'png', file: await shotHtml(T.streetViewCard({ sceneTitle: LT.title(s), stops: svs.map(x => ({ desc: x.note || x.attribution, coords: x.ref })), note: '' }), `sv_${tag}`), dur, src: 'Street View stop card — panowalk cache absent' });
          }
        }
        else if (v.kind === 'streetview') { const svs = media.filter(x => x.kind === 'streetview'); segs.push({ kind: 'png', file: await shotHtml(T.streetViewCard({ sceneTitle: LT.title(s), stops: svs.map(x => ({ desc: x.note || x.attribution, coords: x.ref })), note: '' }), `sv_${tag}`), dur, src: 'Street View stop card — not recorded' }); }
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
          segs.push({ kind: 'png', file: await shotHtml(T.streetViewCard({ sceneTitle: LT.title(s), stops: svs.map(x => ({ desc: x.note || x.attribution, coords: x.ref })) }), `sv_${tag}`), dur: null, src: 'Street View stop card — not recorded' });
        }
      }
      else if (s.type === 'photo') {
        // v0.9: the SAME slots the player runs (imagelayer.imageSlots), scaled onto the linear scene, so the
        // film and the chapter change picture at the same beat. Before this the renderer divided the scene its
        // own way and the two disagreed inside one chapter (v0.8 "found but not fixed").
        const imgs = media.filter(x => x.kind === 'image');
        const gens = media.filter(x => x.kind === 'generated');
        const until = gens.length ? Math.min(...gens.map(g => g.start_s ?? s.duration_s)) : null;
        const shots = IL.slotsToShots(IL.imageSlots(imgs, s.duration_s || len, until), s.duration_s || len, len * (until != null ? Math.min(1, until / (s.duration_s || len)) : 1), 3);
        for (const sh of shots) segs.push(await imgSeg(sh.m, sh.dur));
        for (const m of gens) {
          const d = Math.max(4, ((m.end_s ?? s.duration_s) - (m.start_s ?? 0)) * f);
          if (!fs.existsSync(path.join(CHAPTER_DIR, m.ref))) { segs.push(await pendingSeg(m, d)); continue; }
          if (/\.svg$/i.test(m.ref)) segs.push(await playerSeg(`showScene(${n}).then(()=>seek(${m.start_s ?? 0}))`, d, `${tag}_${sha(m.ref)}`));   // ffmpeg has no svg decoder: shoot the player at the asset's scene time
          else { const gf = path.join(CHAPTER_DIR, m.ref); const gp = await realPixels(gf); segs.push({ kind: 'still', file: gf, dur: d, m, nw: gp.w, nh: gp.h, src: `${m.manifest_id} generated asset ${gp.w}x${gp.h}` }); }
        }
        if (!segs.length && imgs.length) segs.push(await imgSeg(imgs[0], null));
      }
      else if (s.type === 'map') {
        // D9: ONE continuous film map for the whole scene rather than a slideshow of plate screenshots. Without
        // beats from the cut sheet the reveals are spaced evenly, which is watchable but not on the voice.
        const gen = media.filter(x => x.kind === 'generated' && /route-map/.test(x.ref)); const vm = media.find(x => x.kind === 'map');
        if (gen.length) segs.push(await mapSeg(gen.some(g => /full-loop|enablers/.test(g.ref)) ? 'loop' : 'day-1', null, null, 'no beats in the cut sheet'));
        else if (vm) segs.push(await imgSeg(vm, null));
        else segs.push(await mapSeg('day-1', null, null));
      }
      else if (s.type === 'quiz') segs.push(await quizSeg(null));
      else if (s.type === 'dialogue') { const img = media.find(x => x.kind === 'image'); const ci = img ? await commonsImage(img.ref) : null; if (img) useCredit(img); const it = s.interaction || {}; const o = (it.options || []).length ? LT.option(s, 0) : null; segs.push({ kind: 'png', file: await shotHtml(T.chatScreen({ sceneTitle: LT.title(s), imageUrl: ci ? 'file://' + ci.file : '', imageW: ci ? ci.info.w : 0, imageH: ci ? ci.info.h : 0, attribution: img ? (img.attribution || '') : '', context: LT.prompt(s), turns: o ? [{ role: 'q', text: o.text }, { role: 'a', text: o.feedback || o.answer || '' }] : [] }), `chat_${tag}`), dur: null, attribution: img?.attribution, src: 'dialogue screen (own render)' }); }
      else if (s.type === 'game') { const it = s.interaction || {}; segs.push({ kind: 'png', file: await shotHtml(T.checklistScreen({ sceneTitle: LT.title(s), prompt: LT.prompt(s), options: LT.options(s) }), `check_${tag}`), dur: null, src: 'checklist screen (own render)' }); }
      else { segs.push(await playerSeg(`showScene(${n})`, null, `${tag}_scene`)); }
    }
    if (!segs.length) segs.push({ kind: 'png', file: await shotHtml(T.sceneCard({ title: LT.title(s), subtitle: LT.chapterTitle() }), `scenecard_${tag}`), dur: null, src: 'scene title card (fallback)' });
    // durations: fixed ones as given, null ones share the remainder; if everything is fixed, scale to len
    const fixed = segs.filter(x => x.dur != null).reduce((a, x) => a + x.dur, 0); const free = segs.filter(x => x.dur == null).length;
    if (free) { const rem = Math.max(2 * free, len - fixed); segs.forEach(x => { if (x.dur == null) x.dur = rem / free; }); }
    const tot = segs.reduce((a, x) => a + x.dur, 0); segs.forEach(x => x.dur = Math.max(1, x.dur * len / tot));
    // snap to frames, fix rounding on the last segment
    let acc = 0; segs.forEach((x, i) => { x.dur = Math.round(x.dur * FPS) / FPS; x.at = acc; acc += x.dur; }); segs[segs.length - 1].dur += Math.round((len - acc) * FPS) / FPS; if (segs[segs.length - 1].dur < 1) segs[segs.length - 1].dur = 1;
    const segFiles = [];
    for (const x of segs) {
      if (x.kind === 'still') { const r = await segStill(x.file, x.dur, x.m || {}, x.nw || 0, x.nh || 0, x.attribution || '');
        if (x.label) x.src = `${x.label} → ${r.treat} at ${(r.k || 1).toFixed(2)}x (cap ${(r.maxK || 1).toFixed(1)}x)${r.treat === 'plate' ? ', credit printed on the mount' : ''}`;
        x.treat = r.treat; if (r.treat === 'plate') x.attrInFrame = true;   // the paper mount prints its own credit
        segFiles.push(r.file); }
      else if (x.kind === 'states') {
        const rv = Math.max(x.at + 1.5, Math.min(x.at + x.dur - 1.5, x.revealAt != null ? x.revealAt : x.at + x.dur * 0.62));
        segFiles.push(await segStates([{ file: x.ask, at: x.at }, { file: x.rev, at: rv }], x.dur, x.at));
        x.src += ` — question ${fmt1(rv - x.at)} s, then the reveal (${x.revealAt != null ? 'on the narration beat' : 'no quiz:correct token — 62 % of the beat'})`;
      }
      else if (x.kind === 'mapfilm') {
        const tl = MF.planTimeline({ state: x.state, dur: x.dur, beats: (x.beats || []).map(b => ({ show: b.show, at: b.at - x.at })) });
        const html = MF.page({ loaded: mapLoaded, W, H, tl, lang: LANG, labels: mapLabels(), fontsDir: FONTS_DIR });
        const samples = MF.sampleTimes(tl, FPS);
        segFiles.push(await segFrames(html, samples, x.dur, `${tag} ${x.state}`));
        x.src += ` — ${samples.length} rendered frames; ` + ((x.beats || []).length ? (x.beats).map(b => `${b.show}@${fmt1(b.at - x.at)}s ${b.from}`).join(' · ') : 'beats spaced evenly (no cut-sheet beats)');
      }
      else segFiles.push(x.kind === 'footage' ? await segFootage(x.file, x.dur, x.in_s || 0) : x.kind === 'mp4' ? await segFootage(x.file, x.dur, 0) : await segStatic(x.file, x.dur));
    }

    // ---- captions (ASS) + VTT ----
    // v1.0 (2026-09-08, DECISIONS.md D9): NOTHING HOVERS OVER THE PICTURE. The film used to draw the scene title
    // bottom-left for four seconds (style `Title`) and every pin / caption / lower-third overlay top-left (style
    // `Pin`). The founder: "i dont want any floating text overlays like the one on the topleft, distracting also
    // hard to read, we already have captions for that." Both are gone. What is still burned in:
    //   · Cap  — the narration captions. They are the film's only running text and they carry the same words the
    //            voice says, which is what the overlays were mostly duplicating.
    //   · Attr — the credit line, bottom-right, while a credited picture is on screen. This one stays because it
    //            is a LICENCE OBLIGATION (CC BY / CC BY-SA attribution at the point of use), not editorial text;
    //            a plate prints its credit on the paper mount instead and sets attrInFrame.
    // scene.overlays[] is untouched in the schema and in the scene files — the film simply stops drawing it. Every
    // undrawn overlay is listed in render-log.md, flagged when its wording is NOT already in the spoken narration,
    // so a real loss of information becomes a rundown/script task instead of disappearing quietly.
    let ass = assHeader();
    for (const x of segs) if (x.attribution && !x.attrInFrame) ass += assLine('Attr', x.at, x.at + x.dur, x.attribution);
    { const ovList = (hint.overlays ?? (s.overlays || []).map((_, i) => i)).map(x => typeof x === 'number' ? { i: x } : x);
      const spokenNow = p.utts.map(u => u.text).join(' ');
      for (const ov of ovList) { const o = (s.overlays || [])[ov.i]; if (!o) continue;
        const txt = LT.overlay(s, ov.i); if (!txt) continue;
        const covered = overlayCovered(txt, spokenNow);
        droppedOverlays.push({ scene: s.id, n: p.sel.idx + 1, i: ov.i, kind: o.kind, text: txt, covered, drawnBefore: /pin|caption|lower-third/.test(o.kind) }); } }
    for (const u of p.utts) { const chunks = captionCards(u.text, u.trimTo || u.dur, CAP_MAX_CHARS);
      for (const c of chunks) { const cs = p.narrAt + u.at + c.s, ce = Math.min(len, p.narrAt + u.at + c.e); ass += assLine('Cap', cs, ce, c.text); vtt.push(`${assVtt(globalT + cs)} --> ${assVtt(globalT + ce)}`, (u.voice === VOICE2 ? '<v Passepartout>' : '') + c.text, ''); } }
    const assFile = path.join(WORK, `${tag}.ass`); fs.writeFileSync(assFile, ass);

    // ---- audio: narration utterances + beds ----
    const inputs = []; const fc = []; const amixIn = []; let idx = 0;
    segFiles.forEach(sf => { inputs.push('-i', sf); idx++; }); const nSeg = idx;
    segFiles.forEach((_, i) => fc.push(`[${i}:v]setsar=1,fps=${FPS}[v${i}]`)); fc.push(segFiles.map((_, i) => `[v${i}]`).join('') + `concat=n=${nSeg}:v=1:a=0[vc]`); fc.push(`[vc]subtitles=${path.basename(assFile)}:fontsdir=/usr/share/fonts[v]`);
    inputs.push('-f', 'lavfi', '-t', fmt1(len), '-i', 'anullsrc=r=48000:cl=stereo'); fc.push(`[${idx}:a]atrim=0:${fmt1(len)}[base]`); amixIn.push('[base]'); idx++;
    for (const u of p.utts) { if (!u.wav) continue; inputs.push('-i', u.wav); fc.push(`[${idx}:a]${u.trimTo ? `atrim=0:${fmt1(u.trimTo)},afade=t=out:st=${fmt1(Math.max(0, u.trimTo - 0.15))}:d=0.15,` : ''}aresample=48000,aformat=channel_layouts=stereo,volume=${fmt1(NARR_GAIN_DB)}dB,adelay=${Math.round((p.narrAt + u.at) * 1000)}:all=1[n${idx}]`); amixIn.push(`[n${idx}]`); idx++; }
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
    p.render = { start: globalT, len, segs: segs.map(x => `${x.src} ${fmt1(x.dur)} s`), beds: bedList,
      shots: segs.map(x => ({ at: globalT + x.at, dur: x.dur, kind: x.kind, src: x.src })) }; globalT += len;
  }

  // credits
  const credits = []; for (const c of creditsUsed.values()) { const row = manifestRow(c.id) || {}; const hasLic = /\b(PD|public domain|CC0|CC[- ]BY|youtube|geograph)\b/i.test(c.attribution); credits.push({ head: c.id, text: `${c.attribution}${row.license && !hasLic ? ' — ' + row.license : ''}${c.kind === 'youtube' ? ' — placeholder clip card in this animatic; embedded, not copied, in the player' : ''}` }); }
  credits.push(mapUsed
    ? { head: 'Map', text: 'Route map drawn by Yunyou (G-01) — coastlines from Natural Earth 1:110m, public domain; equirectangular, standard parallel 42° N. Itinerary, dates and day counts: Verne, ch. III (F-10, F-11, F-33)' }
    : { head: 'Map', text: 'Route map tiles © OpenStreetMap contributors, © CARTO (light_nolabels) via Leaflet 1.9.4' });
  credits.push({ head: LANG === 'zh' ? '配音' : 'Voice', text: NO_TTS || !ttsVoices ? 'Captions only — no voice in this run'
    : `Kokoro v1.0 (Apache-2.0), voice ${ttsVoices[LANG][0]} at ${ttsVoices[LANG][1]}x — run locally, no cloud service` });
  credits.push({ head: 'Text', text: 'Jules Verne, Around the World in Eighty Days (1872), Towle translation, Project Gutenberg #103 — PD' });
  const perPage = 16; const pages = Math.ceil(credits.length / perPage);
  for (let pg = 0; pg < pages; pg++) { const lines = credits.slice(pg * perPage, (pg + 1) * perPage); const png = await shotHtml(T.creditsCard({ title: `${LANG === 'zh' ? '鸣谢 · ' : 'Credits — '}${LT.chapterTitle()}`, lines, pageNo: pg + 1, pages, footer: args.footer || `Yunyou 云游 · ${DATE} · text & cards CC BY-SA 4.0 (D4) · media credited above` }), `credits${pg}`); const d = Math.max(8, Math.round(lines.length * CREDITS_S_PER_LINE)); const mp4 = path.join(WORK, `zz_credits${pg}.mp4`);
    await ffmpeg(['-loop', '1', '-framerate', String(FPS), '-i', png, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-t', String(d), '-vf', `format=yuv420p,fade=t=in:st=0:d=0.5`, '-r', String(FPS), '-c:v', 'libx264', '-preset', 'veryfast', '-tune', 'stillimage', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-ac', '2', '-shortest', mp4]); sceneFiles.push(mp4); globalT += d; }

  // 5. concat
  const listFile = path.join(WORK, 'concat.txt'); fs.writeFileSync(listFile, sceneFiles.map(f => `file '${f.replace(/'/g, "'\\''")}'`).join('\n'));
  // v0.9: one file per language, named so the two cuts can never be confused for each other.
  const outName = `${chapter.id}_${LANG}.mp4`; const finalMp4 = path.join(OUT, outName);
  await ffmpeg(['-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', '-movflags', '+faststart', finalMp4]);
  fs.writeFileSync(path.join(OUT, `${chapter.id}_${LANG}.vtt`), vtt.join('\n'));
  const probe = await probeStreams(finalMp4); const dur = parseFloat(probe.format.duration); const v = probe.streams.find(x => x.codec_type === 'video'), a = probe.streams.find(x => x.codec_type === 'audio');
  // Chapter markers, in step with the film by construction. `linear/watch.json` is hand-maintained by another role
  // and its at_s values do NOT survive a re-render (the v0.9 length floor moves every one of them), so this writes
  // its own, per language, plus the timestamp block YouTube wants pasted into a description.
  const marks = plans.map(p => ({ scene: p.s.id, type: p.s.type, at_s: Math.round(p.render.start), title: LT.title(p.s) }));
  fs.writeFileSync(path.join(OUT, `${chapter.id}_${LANG}.chapters.json`), JSON.stringify({
    video: outName, subtitles: `${chapter.id}_${LANG}.vtt`, lang: LANG, locale: LOCALE_ID || 'en',
    duration_s: Math.round(dur), chapters: marks }, null, 1));
  fs.writeFileSync(path.join(OUT, `${chapter.id}_${LANG}.chapters.txt`),
    ['0:00 ' + LT.chapterTitle(), ...marks.map(m => `${mmss(m.at_s)} ${m.title}`)].join('\n') + '\n');

  // 6. log
  const L = []; L.push(`# Render log — ${chapter.title} — linear cut (review animatic)`, '', `**Rendered:** ${new Date().toISOString()}   **Tool:** studio/tools/render/render_linear.mjs   **Wall clock:** ${Math.round((Date.now() - t0) / 60000 * 10) / 10} min`, '',
    `**Output:** \`${path.relative(path.resolve(CHAPTER_DIR, '../../..'), finalMp4)}\` — ${fmt1(dur)} s (${mmss(dur)}), ${v.width}×${v.height} ${v.codec_name} ${v.r_frame_rate} fps, ${a.codec_name} ${a.sample_rate} Hz ${a.channels} ch, ${(probe.format.size / 1048576).toFixed(1)} MB, faststart. Subtitles: \`${chapter.id}_${LANG}.vtt\` (burned in AND sidecar).`, '',
    `**Language:** ${LANG === 'zh' ? `Mandarin (${LOCALE_ID}) — text from \`i18n/${LOCALE_ID}.json\`, index-addressed, English where the locale is silent` : 'English'}. **Voice:** ${NO_TTS || !ttsVoices ? 'none (captions only)' : `local Kokoro ${ttsVoices[LANG][0]} @ ${ttsVoices[LANG][1]}x via ~/hilbert (Apache-2.0, free, no account)`}${plans.some(p => !p.ttsOk) ? ' — **TTS FAILED for some lines, see table**' : ''}. **Narration gain:** ${fmt1(NARR_GAIN_DB)} dB (measured). **Beds:** Commons audio at ${BED_TARGET_LUFS} LUFS (≈ 18 dB under narration), stings at ${STING_TARGET_LUFS} LUFS. **Slack:** a scene may exceed its README seconds by ${Math.round(SLACK * 100)} % before the script is end-cut at a sentence boundary. **Scene length:** ${args['no-floor'] ? 'narration + pad, capped by the README seconds (--no-floor: the authored seconds are NOT honoured as a floor)' : 'clamp(narration + pad, README seconds, README seconds x ' + (1 + SLACK).toFixed(2) + ') — the authored seconds are a floor as well as a cap, so silence the rundown asked for actually exists ("air" column below)'}.`, '',
    ...logLines, `Sidecar cut hints: ${fs.existsSync(cutsPath) ? path.relative(path.resolve(CHAPTER_DIR, '../../..'), cutsPath) : 'none'}.`, '',
    `## Rights compliance`, `- YouTube: not downloaded, not re-encoded. ${clipCards ? `${clipCards} clip card(s) stand in (channel, title, in/out, thumbnail from i.ytimg.com)` : 'no clip cards in this cut'}; ${footageSegs} shot(s) come from self-hosted, licence-clean files under \`media/files/\` (Wikimedia Commons / public-domain film / KartaView), never from youtube.com.`, `- Street View: not screen-recorded — stop cards only.`, `- Commons images resolved through the API (imageinfo, width 1920), attribution burned bottom-right while shown and repeated on the credits card. Freesound refs (login-gated) skipped.`, '',
    `## Scenes`, '', `| # | scene | type | at | s (README) | TTS | air | visual source | beds | script cuts |`, `|---|-------|------|----|-----------:|-----|----:|---------------|------|-------------|`);
  for (const p of plans) { L.push(`| ${String(p.sel.idx + 1).padStart(2, '0')} | ${p.s.id} | ${p.s.type} | ${mmss(p.render.start)} | ${fmt1(p.render.len)} (${p.sel.cap}) | ${p.ttsOk ? 'ok' : '**fallback**'} ${fmt1(p.speechEnd)} s | ${fmt1(p.render.len - (p.narrAt + p.speechEnd))} s | ${p.render.segs.join('<br>')} | ${p.render.beds.join('<br>') || '—'} | ${[...p.droppedBySidecar.map(x => 'sidecar: dropped ' + x), ...p.cutLog].join('<br>') || '—'} |`); }
  L.push('', `Title card ${TITLE_S} s at 0:00; credits ${pages} page(s) at the end. Total ${mmss(dur)}.`, '');
  if (warnings.length) { L.push('## Warnings', ...warnings.map(w => '- ' + w), ''); }
  // --- overlays: retired from the film (D9). Report, do not draw.
  { const drawn = droppedOverlays.filter(o => o.drawnBefore);
    const lost = drawn.filter(o => !o.covered);
    L.push('## Overlays — not drawn (D9: nothing hovers over the picture)', '',
      `${droppedOverlays.length} overlay(s) exist on the scenes in this cut; ${drawn.length} of them used to be burned` +
      ` in as floating text and none is now. \`scene.overlays[]\` is untouched — the FILM stops drawing it.`, '',
      `**${lost.length} carry wording the narration does not say**, listed first: each is either already redundant on`,
      `screen (a credit, a date the picture shows), or a real loss that belongs in the script or on a designed card.`, '',
      '| # | scene | i | kind | in narration? | text |', '|---|-------|---|------|---------------|------|');
    const order = [...droppedOverlays].sort((a, b) => (a.covered === b.covered ? 0 : a.covered ? 1 : -1) || a.n - b.n || a.i - b.i);
    for (const o of order) L.push(`| ${String(o.n).padStart(2, '0')} | ${o.scene} | ${o.i} | ${o.kind}${o.drawnBefore ? '' : ' *(never drawn)*'} | ${o.covered ? 'yes' : '**NO**'} | ${o.text.replace(/\|/g, '\\|')} |`);
    L.push(''); }
  // --- where the film holds ONE picture for a long narration run (founder: "not enough visuals; it plays as
  // heavily narrated, which gets tiring"). A shot that does not move is measured; footage, the panowalk and the
  // film map are exempt because they are moving pictures. This is a RUNDOWN input, not a renderer setting: the
  // fix is more shots, which means more media, which is the Rundown Writer's and Content Preparer's call.
  {
    const MOVING = new Set(['footage', 'mp4', 'mapfilm']);
    const LONG = +(args['long-shot'] || 20);
    const rows = [];
    let stillS = 0, movingS = 0;
    for (const p of plans) for (const sh of (p.render.shots || [])) {
      const moving = MOVING.has(sh.kind);
      if (moving) movingS += sh.dur; else stillS += sh.dur;
      if (!moving && sh.dur >= LONG) rows.push({ p, sh });
    }
    rows.sort((a, b) => b.sh.dur - a.sh.dur);
    const held = rows.reduce((a, r) => a + r.sh.dur, 0);
    L.push('## Shots — where the film holds one picture', '',
      `Still or card time: **${mmss(stillS)}**. Moving time (footage, panowalk, film map): **${mmss(movingS)}**.`,
      `**${rows.length} shot(s) hold a single unmoving picture for ${LONG} s or more — ${mmss(held)} in total, ${Math.round(held / Math.max(1, dur) * 100)} % of the film.**`,
      `The renderer cannot fix this: it cuts when the cut sheet gives it something to cut to. Each row below is a`,
      `request to the rundown for another shot, not a bug. (\`--long-shot N\` changes the threshold.)`, '',
      '| shot | scene | at | seconds | what is on screen |', '|---|-------|----|--------:|-------------------|');
    rows.forEach((r, i) => L.push(`| ${i + 1} | ${String(r.p.sel.idx + 1).padStart(2, '0')} ${r.p.s.id} | ${mmss(r.sh.at)} | **${fmt1(r.sh.dur)}** | ${r.sh.src} |`));
    L.push('');
  }
  L.push('## Sentence index per scene (for the sidecar / Narrator)', '');
  for (const p of plans) { L.push(`**${String(p.sel.idx + 1).padStart(2, '0')} ${p.s.id}** — ${p.sents.map((x, i) => `[${i}] ${x}`).join(' ')}`, ''); }
  L.push('## Digest', `- Did: rendered ${plans.length} scenes + title + credits into one h264/aac MP4 (${mmss(dur)}) with Edge TTS narration, sentence captions, Commons beds and clip/stop cards where rights forbid copying.`, `- Weak: ${clipCards} clip card(s) still stand in${plans.filter(p => p.s.type === 'streetview').length ? ` and stop cards for ${plans.filter(p => p.s.type === 'streetview').length} Street View scene(s)` : ''} (${fmt1(plans.filter(p => p.s.type === 'video' || p.s.type === 'streetview').reduce((a, p) => a + p.render.len, 0))} s of ${fmt1(dur)}); ${plans.filter(p => p.cutLog.length).length} scene(s) were end-cut mechanically where TTS overran the README seconds (see table) — Narrator should re-trim by hand; generated assets (G-xx) are still pending cards.`, `- Next: swap clip cards for licensed footage once Rights clears direct licences; add per-sentence timed overlays; run loudnorm on the final mix; add a 9:16 variant.`);
  fs.writeFileSync(path.join(OUT, 'render-log.md'), L.join('\n'));
  if (browser) await browser.close();
  if (!args.keep) { try { fs.rmSync(WORK, { recursive: true, force: true }); } catch { } }
  log(`done: ${finalMp4} (${mmss(dur)}), log ${path.join(OUT, 'render-log.md')}`);
})().catch(async e => { console.error(e); if (browser) await browser.close(); process.exit(1); });

function assVtt(t) { const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = (t % 60); return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${s.toFixed(3).padStart(6, '0')}`; }
