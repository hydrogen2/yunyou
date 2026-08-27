#!/usr/bin/env node
/**
 * smoke_playback.mjs — headless checks for the v0.6 playback controls (founder playtest 2026-08-20:
 * "it seems i cannot pause … and save my progress .. also no way to jump to scenes").
 *
 * Proves, in a real browser:
 *   pass 1  the pause control stops the CLOCK and the NARRATION together, and resuming continues from the same
 *           second (not from the scene start); the spacebar does the same; the paused state is visible.
 *   pass 2  leaving the page (visibilitychange → hidden) auto-pauses, and coming back is still paused.
 *   pass 3  progress survives a reload: the cover offers "Continue — scene N: <title>" and restores MID-scene;
 *           "Start the day again" clears the save.
 *   pass 4  the scene list panel lists every scene with its LOCALISED title, marks the current one, jumps on tap,
 *           is keyboard-navigable, and dismisses; the header/footer do not overflow a 280 px screen.
 *   pass 5  ?lang=zh-Hans — the list and the Continue button carry the locale's titles, not the English ones.
 *   pass 6  localStorage that throws (private mode) does not break the player; progress is simply not offered.
 *   pass 7  (v0.8) the PICTURES obey the same clock: a photo scene restored mid-scene through the real
 *           save/reload/Continue path shows the still authored for that second (not the first one), a jump
 *           from the scene list re-arms the schedule, and a paused photo scene keeps its picture.
 *
 * Narration is proved with a fake speechSynthesis installed before the page loads (headless Chromium has no
 * voices, so the real one can prove nothing). Everything else is the real player.
 *
 * NO BILLABLE CALL IS MADE (founder RULE 1): the run asserts that no request reached the Maps JavaScript API or the
 * Street View Static API. The scenes it drives are card/photo/map scenes — no YouTube is loaded either.
 *
 * Run:  node studio/player/test/smoke_playback.mjs [--player https://178-104-53-233.sslip.io/player/]
 *                                                  [--tour /products/.../tour.json] [--keep]
 * Needs: studio/tools/render/node_modules (playwright-core) + chromium in ~/.cache/ms-playwright.
 * The player host must be the deployed one (the Maps key is referrer-restricted; localhost is denied).
 * Exit 1 on any failed check or uncaught page error.
 */
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

let fails = 0, checks = 0;
const ok = (cond, name, extra = '') => { checks++; console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra ? ' — ' + extra : '')); if (!cond) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// ---- a speech synthesiser we can watch: charIndex only advances while it is really speaking ----------------
const FAKE_TTS = `(() => {
  const fake = {
    __log: [], __chars: 0, speaking: false, pending: false, paused: false, _u: null, _t: null,
    getVoices(){ return []; },
    _run(){ if (this._t) return; this._t = setInterval(() => {
        if (!this._u) return;
        this.__chars += 8;
        try { this._u.onboundary && this._u.onboundary({ charIndex: this.__chars }); } catch (e) {}
        if (this.__chars >= String(this._u.text || '').length) {
          const u = this._u; this._u = null; this.speaking = false;
          clearInterval(this._t); this._t = null; u.onend && u.onend({});
        }
      }, 120); },
    speak(u){ this.__log.push('speak'); this._u = u; this.__chars = 0; this.speaking = true; this.paused = false; this._run(); },
    pause(){ this.__log.push('pause'); this.paused = true; if (this._t) { clearInterval(this._t); this._t = null; } },
    resume(){ this.__log.push('resume'); this.paused = false; if (this._u) this._run(); },
    cancel(){ this.__log.push('cancel'); if (this._t) { clearInterval(this._t); this._t = null; }
      this._u = null; this.speaking = false; this.paused = false; this.__chars = 0; },
    addEventListener(){}, removeEventListener(){}, onvoiceschanged: null
  };
  Object.defineProperty(window, 'speechSynthesis', { value: fake, configurable: true, writable: true });
  window.__tts = fake;
})();`;

const BILLABLE = /maps\.googleapis\.com\/maps\/api\/(js|streetview)(\?|$)/;
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
const billableHits = [];

async function newCtx({ viewport = { width: 1280, height: 720 }, breakStorage = false } = {}) {
  const ctx = await browser.newContext({ viewport, ignoreHTTPSErrors: true });
  await ctx.addInitScript(FAKE_TTS);
  if (breakStorage) await ctx.addInitScript(`(() => {
      const boom = () => { throw new DOMException('storage disabled', 'SecurityError'); };
      Object.defineProperty(window, 'localStorage', { configurable: true, get(){ return { getItem: boom, setItem: boom, removeItem: boom, key: boom, clear: boom, length: 0 }; } });
    })();`);
  return ctx;
}
async function open(ctx, { lang = '' } = {}) {
  const page = await ctx.newPage();
  page.errors = [];
  page.on('pageerror', e => page.errors.push(String(e.message)));
  page.on('request', r => { if (new RegExp(BILLABLE.source).test(r.url())) billableHits.push(r.url()); });
  await page.goto(`${PLAYER}?tour=${TOUR}${lang ? '&lang=' + lang : ''}`, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof scenes !== 'undefined' && scenes.length > 0, null, { timeout: 25000 });
  return page;
}
// scene 7 (photo, 70 s, narration from 0 s, no interaction, no YouTube) is the bench for the clock/narration checks
const BENCH = 6;
const waitSpeaking = page => page.waitForFunction(() => window.__tts && window.__tts.__log.includes('speak') && window.__tts.__chars > 0, null, { timeout: 25000 });
const state = page => page.evaluate(() => ({
  idx, elapsed, paused, reasons: [...pauseReasons], chars: window.__tts ? window.__tts.__chars : -1,
  log: window.__tts ? window.__tts.__log.slice() : [], bar: !document.querySelector('#pausebar').hidden,
  barText: document.querySelector('#pauseText').textContent, clock: document.querySelector('#clock').textContent
}));

// ============ pass 1 — pause stops the clock AND the narration; resume continues from the same second ==========
{
  const ctx = await newCtx(); const page = await open(ctx);
  ok(await page.locator('#continue').isHidden(), 'cover: no Continue button on a first visit');
  ok(await page.locator('#btnPause').count() === 1, 'footer: a pause control exists');
  await page.click('#start');
  await page.waitForFunction(() => started === true);
  await page.evaluate(b => showScene(b), BENCH);
  await waitSpeaking(page);
  await sleep(1500);
  const running = await state(page);
  const spokeBefore = running.log.filter(x => x === 'speak').length;
  ok(running.elapsed > 1.5, 'the scene is running', `elapsed=${running.elapsed.toFixed(1)}s`);
  ok(running.chars > 0, 'narration is under way', `charIndex=${running.chars}`);

  await page.click('#btnPause');
  const p0 = await state(page);
  await sleep(1600);
  const p1 = await state(page);
  ok(p0.paused === true, 'pause: the master flag is set');
  ok(near(p1.elapsed, p0.elapsed, 0.15), 'pause STOPS THE CLOCK', `${p0.elapsed.toFixed(2)}s → ${p1.elapsed.toFixed(2)}s`);
  ok(p1.chars === p0.chars, 'pause STOPS THE NARRATION', `charIndex frozen at ${p1.chars}`);
  ok(p1.log.includes('pause'), 'pause: speechSynthesis.pause() was called');
  ok(p1.bar && /paused/i.test(p1.barText), 'pause: the paused state is visible outside the media box', JSON.stringify(p1.barText));
  ok(/^⏸/.test(p1.clock), 'pause: the footer clock shows the stop');
  ok(await page.getAttribute('#btnPause', 'aria-pressed') === 'true', 'pause: the button reports aria-pressed=true');
  const bedsPlaying = await page.evaluate(() => !!(bed && !bed.paused));
  ok(!bedsPlaying, 'pause: the audio bed is not playing');

  await page.click('#btnPause');            // resume
  await sleep(1200);
  const r1 = await state(page);
  ok(r1.paused === false, 'resume: running again');
  ok(r1.elapsed > p1.elapsed + 0.5 && r1.elapsed < p1.elapsed + 3, 'resume CONTINUES FROM THE SAME SECOND',
    `paused at ${p1.elapsed.toFixed(1)}s, now ${r1.elapsed.toFixed(1)}s`);
  ok(r1.chars > p1.chars, 'resume: the narration picks up', `${p1.chars} → ${r1.chars}`);
  ok(r1.log.includes('resume') && r1.log.filter(x => x === 'speak').length === spokeBefore,
    'resume: the same utterance continues (speechSynthesis.resume, not a re-speak)');

  // the spacebar does the same, and does not fire the button under the finger
  await page.evaluate(() => document.body.focus());
  await page.keyboard.press('Space');
  ok((await state(page)).paused === true, 'spacebar pauses');
  await page.keyboard.press('Space');
  ok((await state(page)).paused === false, 'spacebar resumes');

  ok(page.errors.length === 0, 'no uncaught page errors in pass 1', page.errors.join(' | '));
  await ctx.close();
}

// ============ pass 2 — the traveller walks away =================================================================
{
  const ctx = await newCtx(); const page = await open(ctx);
  await page.click('#start');
  await page.waitForFunction(() => started === true);
  await page.evaluate(b => showScene(b), BENCH);
  await waitSpeaking(page);
  await sleep(1200);
  const before = await state(page);
  await page.evaluate(() => {                       // the browser tab goes to the background / the phone locks
    Object.defineProperty(document, 'hidden', { value: true, configurable: true });
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await sleep(1500);
  const away = await state(page);
  ok(away.paused === true && away.reasons.includes('away'), 'leaving the page auto-pauses');
  ok(near(away.elapsed, before.elapsed, 0.35), 'the clock did NOT keep ticking while away',
    `${before.elapsed.toFixed(1)}s → ${away.elapsed.toFixed(1)}s`);
  ok(away.chars === before.chars, 'the narration did not keep talking while away');

  await page.evaluate(() => {                       // they come back
    Object.defineProperty(document, 'hidden', { value: false, configurable: true });
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await sleep(900);
  const back = await state(page);
  ok(back.paused === true, 'coming back does NOT silently resume');
  ok(/stepped away/i.test(back.barText), 'coming back explains itself', JSON.stringify(back.barText));
  await page.click('#pauseGo');
  await sleep(900);
  ok((await state(page)).paused === false, 'the "Go on" button resumes the day');

  // focus moves INTO an embed (YouTube / Street View): the traveller is still here, the day must not stop
  await page.evaluate(() => {
    document.hasFocus = () => false;
    const f = document.createElement('iframe'); f.id = 'fakeEmbed'; f.src = 'about:blank';
    document.querySelector('#media').appendChild(f); f.focus();
    Object.defineProperty(document, 'activeElement', { configurable: true, get: () => f });
    window.dispatchEvent(new Event('blur'));
  });
  await sleep(700);
  ok((await state(page)).paused === false, 'clicking inside an embed does NOT pause (iframe guard)');

  // focus leaves for another window/app entirely
  await page.evaluate(() => {
    Object.defineProperty(document, 'activeElement', { configurable: true, get: () => document.body });
    window.dispatchEvent(new Event('blur'));
  });
  await sleep(700);
  const blurred = await state(page);
  ok(blurred.paused === true && blurred.reasons.includes('away'), 'losing the window focus pauses the day');
  ok(page.errors.length === 0, 'no uncaught page errors in pass 2', page.errors.join(' | '));
  await ctx.close();
}

// ============ pass 3 — save and restore, mid-scene ==============================================================
{
  const ctx = await newCtx(); const page = await open(ctx);
  await page.click('#start');
  await page.waitForFunction(() => started === true);
  await page.evaluate(b => showScene(b), BENCH);     // scene 7 · the wager (photo, 70 s) — no video, no key needed
  await sleep(4200);                                 // > the 2 s save throttle
  const saved = await state(page);
  ok(saved.idx === 6 && saved.elapsed > 2.5, 'scene 7 running before the reload', `elapsed=${saved.elapsed.toFixed(1)}s`);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('yy-progress:' + TOUR_URL)));
  ok(stored && stored.sceneId === 'the-wager', 'progress is written under a tour-scoped key', JSON.stringify(stored && stored.sceneId));
  ok(stored && stored.tourUrl && 'clearEnglish' in stored && 'rate' in stored && 'lang' in stored,
    'the save carries {tourUrl, sceneId, elapsed, lang, clearEnglish, rate}');
  const writes = await page.evaluate(() => { let n = 0; const raw = localStorage.setItem.bind(localStorage);
    localStorage.setItem = (k, v) => { if (String(k).startsWith('yy-progress')) n++; return raw(k, v); };
    return new Promise(r => setTimeout(() => r(n), 5000)); });
  ok(writes <= 4, 'progress writes are throttled (~1 per 2 s)', writes + ' writes in 5 s');

  const stored2 = await page.evaluate(() => JSON.parse(localStorage.getItem('yy-progress:' + TOUR_URL)));
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => typeof scenes !== 'undefined' && scenes.length > 0);
  const cont = page.locator('#continue');
  ok(await cont.isVisible(), 'after a reload the cover offers Continue');
  const label = await cont.innerText();
  ok(/scene 7/i.test(label) && label.includes('The wager'), 'Continue names the scene and its title', JSON.stringify(label));
  ok(/into that scene/.test(await page.locator('#continueNote').innerText()), 'Continue says how far in it was');
  ok(await page.locator('#start').isVisible(), '"Start the day" is still offered alongside');
  await cont.click();
  await page.waitForFunction(() => started === true);
  await sleep(700);
  const back = await state(page);
  ok(back.idx === 6, 'Continue restores the right scene');
  ok(back.elapsed > 2 && near(back.elapsed, stored2.elapsed, 4), 'Continue restores into the MIDDLE of the scene',
    `saved ${stored2.elapsed}s → restored ${back.elapsed.toFixed(1)}s`);
  const capt = await page.evaluate(() => document.querySelector('#script').innerHTML);
  ok(/class="said"/.test(capt) || /class="unsaid"/.test(capt), 'the caption is repositioned for the restored moment');

  // starting fresh clears the save
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => typeof scenes !== 'undefined' && scenes.length > 0);
  await page.click('#start');
  await page.waitForFunction(() => started === true);
  ok((await state(page)).idx === 0, '"Start the day again" starts at scene 1');
  await page.evaluate(() => showScene(0));
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => typeof scenes !== 'undefined' && scenes.length > 0);
  const st2 = await page.evaluate(() => JSON.parse(localStorage.getItem('yy-progress:' + TOUR_URL) || 'null'));
  ok(st2 && st2.sceneId === 'cold-open', 'the save follows the traveller (now scene 1)', JSON.stringify(st2 && st2.sceneId));
  const otherKey = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('yy-progress')).length);
  ok(otherKey === 1, 'exactly one progress key per tour URL (no collisions between chapters)');
  ok(page.errors.length === 0, 'no uncaught page errors in pass 3', page.errors.join(' | '));
  await ctx.close();
}

// ============ pass 4 — the scene list ==========================================================================
{
  const ctx = await newCtx({ viewport: { width: 280, height: 653 } });   // Fold cover width
  const page = await open(ctx);
  await page.click('#start');
  await page.waitForFunction(() => started === true);
  await page.evaluate(b => showScene(b), BENCH);
  await sleep(600);

  const overflow = await page.evaluate(() => {
    const h = document.querySelector('header'), f = document.querySelector('footer');
    return { h: h.scrollWidth - h.clientWidth, f: f.scrollWidth - f.clientWidth, doc: document.documentElement.scrollWidth - window.innerWidth };
  });
  ok(overflow.h <= 1, 'header does not overflow a 280 px screen', 'overflow ' + overflow.h + 'px');
  ok(overflow.f <= 1, 'footer does not overflow a 280 px screen', 'overflow ' + overflow.f + 'px');
  ok(overflow.doc <= 1, 'the page does not scroll sideways', 'overflow ' + overflow.doc + 'px');

  await page.click('#btnList');
  await page.waitForSelector('#list:not([hidden])');
  const rows = page.locator('#listBody .scn');
  const n = await rows.count();
  ok(n === await page.evaluate(() => scenes.length), 'the list shows every scene', n + ' rows');
  ok((await state(page)).paused === true, 'opening the list stops the day');
  const titles = await page.evaluate(() => [...document.querySelectorAll('#listBody .scn .t b')].map(b => b.textContent));
  const want = await page.evaluate(() => scenes.map(s => s.title));
  ok(JSON.stringify(titles) === JSON.stringify(want), 'every row carries the scene title as the player has it');
  const meta = await page.evaluate(() => document.querySelector('#listBody .scn .t small').textContent);
  ok(/·/.test(meta) && /\d/.test(meta), 'each row shows type and duration', JSON.stringify(meta));
  const cur = await page.evaluate(() => { const b = document.querySelector('#listBody .scn[aria-current="true"]'); return b && +b.dataset.i; });
  ok(cur === BENCH, 'the current scene is marked');
  const focused = await page.evaluate(() => document.activeElement && document.activeElement.dataset && +document.activeElement.dataset.i);
  ok(focused === BENCH, 'focus lands on the current scene (keyboard users start where they are)');
  const sheetW = await page.evaluate(() => document.querySelector('#list .sheet').getBoundingClientRect().width);
  ok(sheetW >= 270, 'on a narrow screen the list is a full-width sheet', Math.round(sheetW) + 'px');

  await page.keyboard.press('ArrowDown');
  ok(await page.evaluate(() => +document.activeElement.dataset.i) === BENCH + 1, 'ArrowDown moves down the list');
  await page.keyboard.press('Escape');
  ok(await page.locator('#list').isHidden(), 'Escape dismisses the list');
  ok((await state(page)).paused === false, 'dismissing the list lets the day go on');

  await page.click('#btnList');
  await page.waitForSelector('#list:not([hidden])');
  await rows.nth(8).click();                                        // scene 9 · the world shrinks (map)
  await sleep(500);
  const jumped = await state(page);
  ok(await page.locator('#list').isHidden(), 'tapping a scene closes the list');
  ok(jumped.idx === 8, 'tapping a scene jumps there', 'idx=' + jumped.idx);
  ok(jumped.elapsed < 3 && jumped.paused === false, 'the jumped-to scene starts playing from its beginning');
  ok(page.errors.length === 0, 'no uncaught page errors in pass 4', page.errors.join(' | '));
  await ctx.close();
}

// ============ pass 5 — the same, in 简体中文 ====================================================================
{
  const ctx = await newCtx({ viewport: { width: 390, height: 780 } });
  const page = await open(ctx, { lang: 'zh-Hans' });
  ok(await page.evaluate(() => !!LOCALE), 'zh-Hans locale loaded');
  await page.click('#start');
  await page.waitForFunction(() => started === true);
  await page.evaluate(b => showScene(b), BENCH);
  await sleep(3000);
  await page.click('#btnList');
  await page.waitForSelector('#list:not([hidden])');
  const rows = await page.evaluate(() => [...document.querySelectorAll('#listBody .scn .t b')].map(b => b.textContent));
  const want = await page.evaluate(() => scenes.map(s => s.title));
  ok(JSON.stringify(rows) === JSON.stringify(want), 'the list uses the localised titles already applied to the tour');
  const cjk = rows.filter(t => /[㐀-鿿]/.test(t)).length;
  ok(cjk >= rows.length - 2, 'those titles really are Chinese', cjk + '/' + rows.length + ' rows with CJK');
  await page.keyboard.press('Escape');
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => typeof scenes !== 'undefined' && scenes.length > 0);
  const label = await page.locator('#continue').innerText();
  ok(/[㐀-鿿]/.test(label), 'the Continue button carries the localised title too', JSON.stringify(label));
  const savedLang = await page.evaluate(() => (window.__progress || {}).lang);
  ok(savedLang === 'zh-Hans', 'the save records the language', String(savedLang));
  ok(page.errors.length === 0, 'no uncaught page errors in pass 5', page.errors.join(' | '));
  await ctx.close();
}

// ============ pass 6 — localStorage throws (private mode) =======================================================
{
  const ctx = await newCtx({ breakStorage: true }); const page = await open(ctx);
  ok(await page.locator('#start').isVisible(), 'private mode: the player still boots');
  ok(await page.locator('#continue').isHidden(), 'private mode: no Continue is offered (nothing was saved)');
  await page.click('#start');
  await page.waitForFunction(() => started === true);
  await sleep(1500);
  await page.click('#btnPause');
  await sleep(900);
  const p = await state(page);
  ok(p.paused === true, 'private mode: pause still works');
  await page.click('#btnList');
  await page.waitForSelector('#list:not([hidden])');
  ok(await page.evaluate(() => document.querySelectorAll('#listBody .scn').length) > 0, 'private mode: the scene list still works');
  ok(page.errors.length === 0, 'private mode: no uncaught page errors', page.errors.join(' | '));
  await ctx.close();
}

// ============ pass 7 — v0.8: the pictures are on the scene clock too ==========================================
// Until v0.8 a photo scene cycled its stills on a wall-clock setInterval: a restore or a jump started the cycle
// over from picture 1 whatever the clock said, and a paused day went on changing pictures.
{
  const ctx = await newCtx(); const page = await open(ctx);
  const PHOTO = await page.evaluate(() => scenes.findIndex(s => s.type === 'photo' && (s.media || []).filter(m => m.kind === 'image' && Number.isFinite(+m.start_s)).length >= 3));
  ok(PHOTO >= 0, 'v0.8: the tour has a photo scene with authored per-picture timings', 'scene ' + (PHOTO + 1));
  const slots = await page.evaluate(n => scenes[n].media.filter(m => m.kind === 'image').map(m => ({ s: +m.start_s, ref: m.ref, id: m.manifest_id || '' })), PHOTO);
  const want = at => slots.filter(x => x.s <= at).slice(-1)[0];
  const lastImage = page => page.evaluate(() => ({ ref: (window.__lastImage || {}).ref || '', el: elapsed }));

  await page.click('#start');
  await page.waitForFunction(() => started === true);
  // …deep into the scene, then let the throttled save catch up, then reload and take the real Continue path
  const AT = slots[Math.min(4, slots.length - 1)].s + 1;
  await page.evaluate(([n, at]) => showScene(n, { at }), [PHOTO, AT]);
  await sleep(4200);
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction(() => typeof scenes !== 'undefined' && scenes.length > 0);
  ok(await page.locator('#continue').isVisible(), 'the photo scene was saved mid-scene');
  await page.locator('#continue').click();
  await page.waitForFunction(() => started === true);
  await sleep(2200);
  const back = await lastImage(page);
  const w = want(back.el), wPrev = want(back.el - 2);       // tolerance: a boundary crossed while we were measuring
  ok(back.el > AT - 3, 'Continue restored into the middle of the photo scene', back.el.toFixed(1) + 's');
  ok(back.ref === w.ref || back.ref === wPrev.ref, `a restored photo scene shows the still authored for ${Math.round(back.el)} s (${w.id})`,
    'got ' + String(back.ref).slice(-46));
  ok(back.ref !== slots[0].ref, 'and NOT the first picture of the scene (the v0.7 bug)');

  // a jump from the scene list re-arms the schedule from second 0
  await page.click('#btnList');
  await page.waitForSelector('#list:not([hidden])');
  await page.click(`#listBody .scn[data-i="${PHOTO}"]`);
  await sleep(2200);
  const j = await lastImage(page);
  ok(j.el < 4, 'the jump starts the scene at the top', j.el.toFixed(1) + 's');
  ok(j.ref === slots[0].ref, 'a scene-list jump shows the FIRST authored still', 'got ' + String(j.ref).slice(-46));
  await page.evaluate(t => seek(t), slots[2].s + 3);
  await sleep(1800);
  const k = await lastImage(page);
  ok(k.ref === slots[2].ref, 'and the schedule still runs after the jump (slot 3 at its own second)',
    'got ' + String(k.ref).slice(-46));

  // a paused photo scene keeps its picture (the old interval kept firing on the wall clock)
  await page.click('#btnPause');
  await sleep(400);
  const b4 = await lastImage(page);
  await sleep(11500);
  const af = await lastImage(page);
  ok(af.ref === b4.ref && Math.abs(af.el - b4.el) < 0.6, 'a paused photo scene changes nothing at all',
    `${String(b4.ref).slice(-24)} @${b4.el.toFixed(1)}s → ${String(af.ref).slice(-24)} @${af.el.toFixed(1)}s`);
  await page.click('#btnPause');
  await sleep(2000);
  const on = await lastImage(page);
  ok(on.el > af.el + 0.5, 'and it goes on from the same second when asked', `${af.el.toFixed(1)} → ${on.el.toFixed(1)}s`);
  ok(page.errors.length === 0, 'no uncaught page errors in pass 7', page.errors.join(' | '));
  await ctx.close();
}

ok(billableHits.length === 0, 'RULE 1: no billable Google API was called', billableHits.join(' | '));
await browser.close();
console.log(`\n${checks - fails}/${checks} checks passed`);
process.exit(fails ? 1 : 0);
