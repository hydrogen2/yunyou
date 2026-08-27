#!/usr/bin/env node
/**
 * smoke_images.mjs — headless checks for the v0.7 IMAGE TREATMENT LAYER.
 *
 * Founder, 2026-08-27, from a rendered frame: "several of our images are portrait-orientation photographs or small
 * archive plates (many under 750 px wide) … they sit in the middle with wide black bars and occupy maybe a third of
 * the screen. It reads as a gap rather than a choice."
 *
 * Proves, in a real browser, on the real scenes:
 *   pass 1  every still that cannot fill the frame gets a treatment (backdrop or plate), never bare black bars, and
 *           the treatment chosen matches the file's real pixels (632-px engraving → plate; big portrait → backdrop).
 *   pass 2  NO IMAGE IS EVER UPSCALED: the rendered CSS box of every <img> under #media — transform included — is
 *           within a pixel of its own naturalWidth/naturalHeight or smaller. This is the honesty rule.
 *   pass 3  the attribution stays visible and legible for every treated still (plate caption or corner chip),
 *           at all three widths.
 *   pass 4  the backdrop really is derived from the picture (same src as the main image, blurred and darkened) and
 *           it is not a second network fetch.
 *   pass 5  degradation: an image whose file 404s leaves a named card, not an empty black frame; and the layer
 *           survives a Commons API that refuses to answer.
 *   pass 6  `media[].treatment` overrides: 'none' opts out (no backdrop, no drift), 'plate' forces the mount.
 *   pass 7  the drift never crosses 100 % of the honest size, and pausing the day stops it.
 *   pass 8  screenshots at three widths (280 Fold cover / 717 Fold open / 1280 desktop) into test/out/.
 *   pass 9  (v0.8) a photo scene's stills run on the SCENE clock: the picture on screen at an authored second is
 *           the picture the scene file authored for it; pausing freezes it (the old wall-clock interval kept
 *           changing pictures while the day was stopped); a mid-scene restore lands on the right one; a scene
 *           whose stills carry no timings still divides them evenly (the v0.7 fallback, unchanged).
 *   pass 10 (v0.8) media[].fallback for stills: a still whose file dies swaps to its declared fallback, and so
 *           does one that is merely too slow (scene 06's IIIF plate has ten seconds on screen and archive.org's
 *           renderer is intermittently slow) — never a dead frame inside its own slot.
 *
 * NO VIDEO IS RENDERED and NO BILLABLE CALL IS MADE (founder RULE 1 + the "player only, do not render any video"
 * instruction for this task): every YouTube request is aborted at the network layer and the run asserts that no
 * request reached the Maps JavaScript API or the Street View Static API. The scenes driven are photo / quiz /
 * dialogue / card scenes only.
 *
 * Run:  node studio/player/test/smoke_images.mjs [--player https://178-104-53-233.sslip.io/player/]
 *                                                [--tour /products/.../tour.json] [--only 7,13]
 * Needs: studio/tools/render/node_modules (playwright-core) + chromium in ~/.cache/ms-playwright.
 * Exit 1 on any failed check or uncaught page error.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../../..');
const require = createRequire(path.join(REPO, 'studio/tools/render/package.json'));
const { chromium } = require('playwright-core');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const PLAYER = opt('--player', 'https://178-104-53-233.sslip.io/player/');
const TOUR = opt('--tour', '/products/around-the-world-80-days/day-01-london/tour.json');
const OUT = path.join(HERE, 'out');
fs.mkdirSync(OUT, { recursive: true });

let fails = 0, checks = 0;
const ok = (cond, name, extra = '') => { checks++; console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra ? ' — ' + extra : '')); if (!cond) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// The scenes that carry the small / portrait stills the founder named. All of them are photo / quiz / dialogue /
// card scenes: none of them loads a video. (Scene 5 "at the door of the Reform" is a `video` scene, so the player
// never shows its M-22/M-23 plates at all — scene 7 shows the same Reform interior engraving, and does.)
const CASES = [                                              // `i` is the 0-based index into scenes[]
  { i: 5,  id: 'quiz-verne-saloon',            what: 'M-23, the 1841 Reform saloon engraving, 632×521',      want: 'plate' },
  { i: 6,  id: 'the-wager',                    what: 'M-35, the Hetzel wager plate, 2262×3270 portrait',     want: 'backdrop' },
  { i: 7,  id: 'two-real-men',                 what: 'generated card G-06, no still — must not regress',     want: null },
  { i: 12, id: 'then-and-now',                 what: 'G-02 then/now card (M-24 + M-26 live inside the SVG)', want: null },
  { i: 14, id: 'quiz-the-weather',             what: 'M-25, albumen photo 2000×1360 landscape',              want: 'backdrop' },
  { i: 15, id: 'passepartout-on-the-platform', what: 'M-50, plate 05, 474×700 portrait',                     want: 'plate' },
];

const FAKE_TTS = `(() => {
  const fake = { __chars: 0, speaking: false, pending: false, paused: false, getVoices(){ return []; },
    speak(u){ this.speaking = true; setTimeout(() => { this.speaking = false; u.onend && u.onend({}); }, 400); },
    pause(){ this.paused = true; }, resume(){ this.paused = false; }, cancel(){ this.speaking = false; },
    addEventListener(){}, removeEventListener(){}, onvoiceschanged: null };
  Object.defineProperty(window, 'speechSynthesis', { value: fake, configurable: true, writable: true });
})();`;

const BILLABLE = /maps\.googleapis\.com\/maps\/api\/(js|streetview)(\?|$)/;
const VIDEO = /(youtube\.com|youtube-nocookie\.com|ytimg\.com|googlevideo\.com)/;
const billableHits = [], videoHits = [];

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--mute-audio'] });

async function newCtx(viewport) {
  const ctx = await browser.newContext({ viewport, ignoreHTTPSErrors: true, deviceScaleFactor: 1 });
  await ctx.addInitScript(FAKE_TTS);
  // founder instruction for this task: PLAYER ONLY, do not render any video. Nothing YouTube is allowed to load.
  await ctx.route(u => VIDEO.test(u.href ?? String(u)), r => { videoHits.push(r.request().url()); r.abort(); });
  return ctx;
}
async function open(ctx, { drift = true } = {}) {
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', e => page.errors.push(String(e.message)));
  page.on('request', r => { if (new RegExp(BILLABLE.source).test(r.url())) billableHits.push(r.url()); });
  await page.goto(`${PLAYER}?tour=${TOUR}${drift ? '' : '&drift=0'}`, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof scenes !== 'undefined' && scenes.length > 0, null, { timeout: 25000 });
  await page.click('#start');
  await page.waitForFunction(() => started === true);
  return page;
}
// Everything the checks need about what is on screen, measured from the live DOM.
const shot = page => page.evaluate(() => {
  const box = document.querySelector('#media');
  const b = box.getBoundingClientRect();
  const stage = box.querySelector('.imgstage');
  const back = box.querySelector('.imgback');
  const imgs = [...box.querySelectorAll('img')].map(im => {
    const r = im.getBoundingClientRect();
    const cs = getComputedStyle(im);
    return { cls: im.className, src: im.currentSrc || im.src, nw: im.naturalWidth, nh: im.naturalHeight,
      w: r.width, h: r.height, complete: im.complete, fit: cs.objectFit, drift: im.classList.contains('drift') };
  });
  const main = box.querySelector('.imgmain');
  const mr = main ? main.getBoundingClientRect() : null;
  const creds = [...box.querySelectorAll('.imgcredit')].map(c => {
    const r = c.getBoundingClientRect(); const cs = getComputedStyle(c);
    // how much of the credit sits ON TOP OF the picture (0 = it is beside/below it, on the backdrop)
    const ov = mr ? Math.max(0, Math.min(r.right, mr.right) - Math.max(r.left, mr.left)) *
                    Math.max(0, Math.min(r.bottom, mr.bottom) - Math.max(r.top, mr.top)) : 0;
    return { text: c.textContent.trim(), w: r.width, h: r.height, px: parseFloat(cs.fontSize),
      onPicture: r.width * r.height > 0 ? ov / (r.width * r.height) : 0,
      vis: cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.5 && r.width > 20 && r.height > 6,
      inside: r.left >= b.left - 1 && r.right <= b.right + 1 && r.top >= b.top - 1 && r.bottom <= b.bottom + 1 };
  });
  const plate = box.querySelector('.imgplate');
  return { box: { w: b.width, h: b.height },
    treatment: stage ? stage.dataset.treatment : null,
    nw: stage ? +stage.dataset.nw : 0, nh: stage ? +stage.dataset.nh : 0,
    hasStage: !!stage, hasCard: !!box.querySelector('.card'), hasSvg: !!box.querySelector('svg.gen'),
    back: back ? { src: back.currentSrc || back.src, filter: getComputedStyle(back).filter,
                   // the ambient layer is rasterised small and scaled up, so the blur radius that matters is the
                   // LOCAL radius times the transform scale
                   scale: +(/matrix\(([-\d.]+)/.exec(getComputedStyle(back).transform) || [0, 1])[1] || 1,
                   on: back.classList.contains('on'), w: back.getBoundingClientRect().width } : null,
    plate: plate ? { w: plate.getBoundingClientRect().width, h: plate.getBoundingClientRect().height,
                     drift: plate.classList.contains('drift'), bg: getComputedStyle(plate).backgroundImage.slice(0, 40) } : null,
    imgs, creds, last: window.__lastImage || null };
});
const goScene = async (page, i, ms = 2000) => { await page.evaluate(n => showScene(n), i); await sleep(ms); };

// ============ pass 1 + 2 + 3 — treatment, no upscaling, attribution ============================================
{
  const ctx = await newCtx({ width: 1280, height: 720 });
  const page = await open(ctx);
  for (const c of CASES) {
    await goScene(page, c.i);
    const s = await shot(page);
    const tag = `scene ${c.i + 1} ${c.id}`;
    if (c.want) {
      ok(s.hasStage, `${tag}: a still is mounted (${c.what})`);
      ok(s.treatment === c.want, `${tag}: treatment = ${c.want}`, 'got ' + s.treatment + ` (${s.nw}×${s.nh} in ${Math.round(s.box.w)}×${Math.round(s.box.h)})`);
      ok(s.treatment !== 'none' && s.treatment !== 'pending', `${tag}: the frame is not left as black bars`, String(s.treatment));
    } else {
      ok(s.hasStage || s.hasSvg || s.hasCard, `${tag}: still renders something (${c.what})`);
    }
    // the honesty rule, on every image in the frame — main picture, plate, backdrop, inset
    const up = s.imgs.filter(im => im.complete && im.nw > 0 && (im.w > im.nw + 1 || im.h > im.nh + 1) && !/imgback/.test(im.cls));
    ok(up.length === 0, `${tag}: no image is upscaled beyond its natural size`,
      up.map(u => `${u.cls} ${Math.round(u.w)}×${Math.round(u.h)} > ${u.nw}×${u.nh}`).join('; ') ||
      s.imgs.filter(i2 => !/imgback/.test(i2.cls)).map(i2 => `${i2.cls || 'img'} ${Math.round(i2.w)}×${Math.round(i2.h)} of ${i2.nw}×${i2.nh}`).join('; '));
    // no stretching either: the rendered aspect ratio must match the file's
    const squashed = s.imgs.filter(im => im.complete && im.nw > 0 && im.w > 4 && !/imgback/.test(im.cls) &&
      Math.abs((im.w / im.h) / (im.nw / im.nh) - 1) > 0.02 && im.fit !== 'contain');
    ok(squashed.length === 0, `${tag}: nothing is stretched`, squashed.map(u => u.cls).join('; '));
    if (c.want) {
      const cr = s.creds.filter(x => x.vis && x.text.length > 4);
      ok(cr.length >= 1, `${tag}: the attribution is on screen`, JSON.stringify(s.creds.map(x => x.text.slice(0, 40))));
      ok(cr.every(x => x.px >= 10.4), `${tag}: the attribution is legible (>= 10.5 px)`, cr.map(x => x.px + 'px').join('/'));
      ok(cr.every(x => x.inside), `${tag}: the attribution is inside the media frame`);
      if (s.treatment !== 'plate')                       // on a plate the credit IS the caption, printed on the paper
        ok(cr.every(x => x.onPicture < 0.15), `${tag}: the credit sits on the backdrop, not across the subject`,
          cr.map(x => (x.onPicture * 100).toFixed(0) + '% over the picture').join('/'));
    }
  }

  // ---- pass 4: the backdrop is derived from the picture, and costs no second fetch -----------------------------
  await goScene(page, 6);                                   // the-wager: 2262×3270 portrait plate on a wide frame
  const w = await shot(page);
  ok(w.back && w.back.src === w.imgs.find(i2 => /imgmain/.test(i2.cls)).src,
    'backdrop: the ambient layer is the SAME picture (same URL → same cached file, no second download)');
  ok(w.back && /blur\((\d+(\.\d+)?)px\)/.test(w.back.filter) && /brightness/.test(w.back.filter),
    'backdrop: it is heavily blurred and darkened', w.back && w.back.filter);
  const blurPx = (w.back && +(/blur\((\d+(?:\.\d+)?)px\)/.exec(w.back.filter) || [])[1]) * (w.back ? w.back.scale : 1);
  ok(blurPx >= 14, 'backdrop: the blur is ambient, not decorative', blurPx.toFixed(1) + 'px on screen');
  ok(w.back && w.back.w >= w.box.w - 1, 'backdrop: it fills the frame', Math.round(w.back.w) + '/' + Math.round(w.box.w) + 'px');
  const mainW = w.imgs.find(i2 => /imgmain/.test(i2.cls)).w;
  ok(mainW / w.box.w > 0.25, 'backdrop: the picture itself is still the subject, not shrunk away',
    Math.round(mainW) + 'px of ' + Math.round(w.box.w) + 'px');

  // ---- pass 7: the drift stays under 100 % and stops when the day stops ----------------------------------------
  await goScene(page, 15, 1800);                            // M-50, 474×700 — mounted, at its own pixels
  const d0 = await shot(page);
  ok(d0.plate && d0.plate.drift, 'drift: the mounted plate breathes');
  const growth = await page.evaluate(async () => {
    const el = document.querySelector('#media .imgplate') || document.querySelector('#media .imgmain');
    const seen = []; for (let k = 0; k < 6; k++) { seen.push(el.getBoundingClientRect().width); await new Promise(r => setTimeout(r, 300)); }
    const base = el.offsetWidth; return { max: Math.max(...seen), base };
  });
  ok(growth.max <= growth.base + 1, 'drift: it never crosses 100 % of the honest size (no upscaling by animation)',
    `peak ${growth.max.toFixed(1)}px vs layout ${growth.base}px`);
  await page.click('#btnPause');
  await sleep(600);
  const p1 = await page.evaluate(() => (document.querySelector('#media .imgplate') || document.querySelector('#media .imgmain')).getBoundingClientRect().width);
  await sleep(900);
  const p2 = await page.evaluate(() => (document.querySelector('#media .imgplate') || document.querySelector('#media .imgmain')).getBoundingClientRect().width);
  ok(Math.abs(p1 - p2) < 0.6, 'drift: pausing the day stops the motion too', `${p1.toFixed(2)} → ${p2.toFixed(2)}`);
  await page.click('#btnPause');

  ok(page.errors.length === 0, 'no uncaught page errors in passes 1–4/7', page.errors.join(' | '));
  await ctx.close();
}

// ============ pass 5 — degradation ============================================================================
{
  // (a) the file itself 404s
  const ctx = await newCtx({ width: 1280, height: 720 });
  await ctx.route(u => /upload\.wikimedia\.org/.test(u.href ?? String(u)), r => r.abort());
  const page = await open(ctx);
  await goScene(page, 5, 2600);
  const s = await shot(page);
  ok(s.hasCard, 'a picture that cannot be loaded leaves a NAMED CARD, not an empty black frame');
  const txt = await page.evaluate(() => document.querySelector('#media').textContent);
  ok(/could not be loaded/i.test(txt), 'the card says what happened', JSON.stringify(txt.slice(0, 90)));
  ok(page.errors.length === 0, 'a dead image throws nothing', page.errors.join(' | '));
  await ctx.close();
}
{
  // (b) the Commons API refuses: no size is known up front, the picture must still appear and be treated
  const ctx = await newCtx({ width: 1280, height: 720 });
  await ctx.route(u => /commons\.wikimedia\.org\/w\/api\.php/.test(u.href ?? String(u)), r => r.abort());
  const page = await open(ctx);
  await goScene(page, 15, 2800);
  const s = await shot(page);
  ok(s.hasStage || s.hasCard, 'no Commons API: the scene still renders something');
  ok(page.errors.length === 0, 'no Commons API: nothing throws', page.errors.join(' | '));
  await ctx.close();
}

// ============ pass 6 — the per-scene override ==================================================================
{
  const ctx = await newCtx({ width: 1280, height: 720 });
  const page = await open(ctx);
  const forced = async (t, i) => {
    await page.evaluate(([tt, n]) => { scenes[n].media.filter(m => m.kind === 'image').forEach(m => m.treatment = tt); }, [t, i]);
    await goScene(page, i, 2600);
    return shot(page);
  };
  const none = await forced('none', 6);
  ok(none.treatment === 'none', "treatment 'none' opts out", String(none.treatment));
  ok(!none.back, "treatment 'none': no backdrop is drawn");
  ok(!none.imgs.some(x => x.drift), "treatment 'none': the still is held completely still");
  const pl = await forced('plate', 14);                    // M-25 is 2000×1360 — big, but forced onto the mount
  ok(pl.treatment === 'plate', "treatment 'plate' forces the paper mount on a large picture", String(pl.treatment));
  ok(pl.plate && /gradient/.test(pl.plate.bg), 'the forced plate really is the warm paper mount', pl.plate && pl.plate.bg);
  const upl = pl.imgs.filter(im => im.complete && im.nw > 0 && im.w > im.nw + 1 && !/imgback/.test(im.cls));
  ok(upl.length === 0, 'a forced plate is still never upscaled');
  const fi = await forced('fill', 6);
  ok(fi.treatment === 'fill', "treatment 'fill' is honoured", String(fi.treatment));
  ok(!fi.back, "treatment 'fill': no backdrop");
  ok(page.errors.length === 0, 'no uncaught page errors in pass 6', page.errors.join(' | '));
  await ctx.close();
}

// ============ pass 8 — three widths, screenshots, and the same rules at each ===================================
const WIDTHS = [
  { w: 280,  h: 653, tag: 'fold-cover' },     // Galaxy Fold, closed
  { w: 717,  h: 512, tag: 'fold-open' },      // Galaxy Fold, open (landscape-ish, wide layout kicks in)
  { w: 1280, h: 720, tag: 'desktop' },
];
for (const v of WIDTHS) {
  const ctx = await newCtx({ width: v.w, height: v.h });
  const page = await open(ctx, { drift: false });            // ?drift=0 → deterministic frames for the founder to look at
  for (const c of CASES.filter(x => x.want)) {
    await goScene(page, c.i, 2200);
    const s = await shot(page);
    const tag = `${v.tag} ${v.w}px · scene ${c.i + 1} ${c.id}`;
    ok(s.hasStage && s.treatment !== 'pending', `${tag}: treated (${s.treatment})`);
    const up = s.imgs.filter(im => im.complete && im.nw > 0 && (im.w > im.nw + 1 || im.h > im.nh + 1) && !/imgback/.test(im.cls));
    ok(up.length === 0, `${tag}: nothing upscaled`, up.map(u => `${u.cls} ${Math.round(u.w)}×${Math.round(u.h)} > ${u.nw}×${u.nh}`).join('; '));
    const cr = s.creds.filter(x => x.vis && x.text.length > 4);
    ok(cr.length >= 1 && cr.every(x => x.inside && x.px >= 10.4), `${tag}: attribution visible and inside the frame`,
      cr.map(x => Math.round(x.w) + 'px@' + x.px).join('/'));
    ok(s.treatment === 'plate' || cr.every(x => x.onPicture < 0.15), `${tag}: the credit is not across the subject`,
      cr.map(x => (x.onPicture * 100).toFixed(0) + '%').join('/'));
    const fill = s.imgs.filter(im => /imgmain/.test(im.cls)).map(im => (im.w * im.h) / (s.box.w * s.box.h))[0] || 0;
    ok(fill > 0.16, `${tag}: the picture is not a small floating rectangle`, (fill * 100).toFixed(0) + '% of the frame');
    await page.screenshot({ path: path.join(OUT, `v07-${v.tag}-${c.id}.jpg`), quality: 82, type: 'jpeg' });
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  ok(overflow <= 1, `${v.tag} ${v.w}px: the page does not scroll sideways`, overflow + 'px');
  ok(page.errors.length === 0, `${v.tag}: no uncaught page errors`, page.errors.join(' | '));
  await ctx.close();
}

// ============ pass 9 — v0.8: the stills of a photo scene run on the SCENE clock ================================
// Scene 06 "Inside the Reform" was rebuilt around seven authored ten-second slots, each chosen to land on a named
// sentence (the 1887 saloon over "a saloon two storeys high", Soyer's kitchens over the kitchens line). Until v0.8
// the player cycled stills on a wall-clock setInterval that divided duration_s evenly and ignored start_s/end_s,
// never re-synced after a pause or a jump, and kept changing pictures while the day was stopped.
{
  const ctx = await newCtx({ width: 1280, height: 720 });
  const page = await open(ctx);
  const i = await page.evaluate(() => scenes.findIndex(s => s.id === 'the-reform-club'));
  ok(i >= 0, 'v0.8: the seven-slot photo scene (the-reform-club) is in the tour', 'index ' + i);
  const slots = await page.evaluate(n => scenes[n].media.filter(m => m.kind === 'image')
    .map(m => ({ s: m.start_s, e: m.end_s, ref: m.ref, id: m.manifest_id || m.ref.slice(-24) })), i);
  ok(slots.length >= 2 && slots.every(x => Number.isFinite(x.s)),
    'v0.8: its stills carry authored start_s (this test reads the scene file, not a copy of it)',
    slots.map(x => `${x.id}@${x.s}`).join(' '));

  await goScene(page, i, 1500);
  for (const sl of slots) {
    const end = Number.isFinite(sl.e) ? sl.e : sl.s + 10;
    const at = sl.s + Math.max(1, Math.min(4, (end - sl.s) / 2));      // a second that is unambiguously inside the slot
    await page.evaluate(t => seek(t), at);
    await sleep(1600);
    const cur = await page.evaluate(() => ({ ref: (window.__lastImage || {}).ref || '', el: elapsed }));
    ok(cur.ref === sl.ref, `authored slot ${sl.id} (${sl.s}–${end} s) is the picture on screen at ${at} s`,
      'got ' + String(cur.ref).slice(-46));
  }

  // pausing freezes the picture. The wait is deliberately longer than the old interval period (70 s / 7 = 10 s):
  // on v0.7 the wall-clock timer fired twice inside this pause and the paused day changed picture twice.
  await goScene(page, i, 1600);
  await page.click('#btnPause');
  await sleep(400);
  const b4 = await page.evaluate(() => ({ ref: (window.__lastImage || {}).ref || '', el: elapsed, paused }));
  ok(b4.paused === true, 'pause: the day is stopped', String(b4.paused));
  await sleep(11500);
  const af = await page.evaluate(() => ({ ref: (window.__lastImage || {}).ref || '', el: elapsed }));
  ok(af.ref === b4.ref, 'a paused day does not change its picture (11.5 s, past two old interval ticks)',
    String(b4.ref).slice(-40) + ' → ' + String(af.ref).slice(-40));
  ok(Math.abs(af.el - b4.el) < 0.6, 'and the scene clock stayed where it was', `${b4.el.toFixed(1)} → ${af.el.toFixed(1)} s`);
  await page.click('#btnPause');
  await sleep(300);
  ok(await page.evaluate(() => paused === false), 'and it goes on again when asked');

  // a mid-scene restore (v0.6 showScene(i,{at})) lands on the picture authored for that second, not on the first one
  const target = slots[Math.min(4, slots.length - 1)];
  const restoreAt = target.s + 2;
  await page.evaluate(([n, at]) => showScene(n, { at }), [i, restoreAt]);
  await sleep(1800);
  const rr = await page.evaluate(() => ({ ref: (window.__lastImage || {}).ref || '', el: elapsed }));
  ok(rr.ref === target.ref, `a mid-scene restore at ${restoreAt} s lands on ${target.id}, not on slot 1`,
    'got ' + String(rr.ref).slice(-46));
  ok(rr.el >= restoreAt - 0.5, 'the restore really did start mid-scene', rr.el.toFixed(1) + ' s');

  // the v0.7 fallback must not regress: a photo scene whose stills carry NO timings still divides them evenly
  await page.evaluate(n => { scenes[n].media.filter(m => m.kind === 'image').forEach(m => { delete m.start_s; delete m.end_s; }); }, i);
  await goScene(page, i, 1500);
  const even = [];
  for (const [k, at] of [[0, 4], [1, 14], [2, 24]]) {
    await page.evaluate(t => seek(t), at);
    await sleep(1500);
    even.push(await page.evaluate(() => (window.__lastImage || {}).ref || ''));
  }
  ok(even[0] === slots[0].ref && even[1] === slots[1].ref && even[2] === slots[2].ref,
    'no authored timings: the even division (duration/n, 8 s floor) is unchanged',
    even.map(x => String(x).slice(-22)).join(' → '));

  ok(page.errors.length === 0, 'no uncaught page errors in pass 9', page.errors.join(' | '));
  await ctx.close();
}
{
  // the same seven slots, photographed for the content roles: one frame per authored second
  const ctx = await newCtx({ width: 1280, height: 720 });
  const page = await open(ctx, { drift: false });
  const i = await page.evaluate(() => scenes.findIndex(s => s.id === 'the-reform-club'));
  const slots = await page.evaluate(n => scenes[n].media.filter(m => m.kind === 'image').map(m => m.start_s), i);
  await goScene(page, i, 1500);
  for (const [k, st] of slots.entries()) {
    await page.evaluate(t => seek(t), st + 4);
    await sleep(1700);
    await page.screenshot({ path: path.join(OUT, `v08-reform-slot${k + 1}-at${st + 4}s.jpg`), quality: 82, type: 'jpeg' });
  }
  await ctx.close();
}

// ============ pass 10 — v0.8: media[].fallback for stills =====================================================
// Scene 06's saloon plate is an IIIF crop rendered on demand by archive.org. It has a declared fallback (the full
// page scan). v0.7 ignored media[].fallback for images entirely: a dead or slow file left a card or a blank slot.
for (const mode of ['dead', 'slow']) {
  const ctx = await newCtx({ width: 1280, height: 720 });
  if (mode === 'dead') await ctx.route(u => /iiif\.archive\.org/.test(u.href ?? String(u)), r => r.abort());
  else await ctx.route(u => /iiif\.archive\.org/.test(u.href ?? String(u)), async r => { await sleep(30000); r.abort(); });
  const page = await open(ctx);
  const i = await page.evaluate(() => scenes.findIndex(s => s.id === 'the-reform-club'));
  const m = await page.evaluate(n => { const x = scenes[n].media.find(y => y.kind === 'image' && /iiif/.test(y.ref)); return x ? { ref: x.ref, fb: x.fallback } : null; }, i);
  ok(!!(m && m.fb), 'the IIIF plate declares a media[].fallback', m && String(m.fb).slice(0, 60));
  await page.evaluate(([n, at]) => showScene(n, { at }), [i, m ? 21 : 0]);
  await page.click('#btnPause');                            // stop the day: the slot must not move on while we wait,
  await sleep(mode === 'slow' ? 10000 : 3500);              // and the watchdog is on the wall clock, so it still fires
  const s = await shot(page);
  const main = s.imgs.find(x => /imgmain/.test(x.cls));
  ok(!!main && main.complete && main.nw > 0, `a ${mode} still shows its fallback picture, not a dead frame`,
    main ? `${main.nw}×${main.nh} ${String(main.src).slice(0, 54)}` : 'no image mounted');
  ok(!!main && /archive\.org\/download/.test(main.src), `the fallback URL is the one the scene declared (${mode})`,
    main && String(main.src).slice(0, 70));
  ok(!s.hasCard, `a ${mode} still does not fall all the way to the "could not be loaded" card`);
  ok(page.errors.length === 0, `nothing throws on the ${mode} fallback`, page.errors.join(' | '));
  await ctx.close();
}

ok(billableHits.length === 0, 'RULE 1: no billable Google API was called', billableHits.join(' | '));
ok(videoHits.length === 0, 'founder instruction: no video was loaded or rendered', videoHits.slice(0, 3).join(' | '));
await browser.close();
console.log(`\nscreenshots → ${path.relative(REPO, OUT)}/v07-*.jpg`);
console.log(`${checks - fails}/${checks} checks passed`);
process.exit(fails ? 1 : 0);
