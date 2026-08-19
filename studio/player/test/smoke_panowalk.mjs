#!/usr/bin/env node
/**
 * smoke_panowalk.mjs — headless checks for streetview mode `open` (player v0.5).
 *
 * Proves, without a human clicking anything and WITHOUT SPENDING A PENNY:
 *   1. the walk runs on our own cached open imagery (products/**\/media/files/panos/), not on Google
 *   2. it advances along the scene timeline by itself, cross-fading between frames, and turns onto the `camera` cues
 *   3. the CC BY-SA credit (source, author, licence, date) is visible while those frames are on screen
 *   4. ZERO requests to a billable Google endpoint — maps/api/js (Dynamic Street View) or maps/api/streetview
 *      (Street View Static). The free Maps Embed API is allowed, and only for stops with no open imagery.
 *   5. the fallback ladder still works: no pano cache → embed → (no key) → the stop card
 *   6. panomove.mjs — the module the linear renderer shares — plans scene 04 exactly as the player's svPlan does
 *
 * Run (localhost is fine; nothing here needs a referrer-restricted key):
 *   node studio/player/test/smoke_panowalk.mjs [--player https://localhost/player/]
 *                                              [--tour /products/around-the-world-80-days/day-01-london/tour.json]
 * Needs: studio/tools/render/node_modules (playwright-core) + chromium in ~/.cache/ms-playwright.
 * Exit 1 on any failed check.
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
const PLAYER = opt('--player', 'https://localhost/player/');
const TOUR = opt('--tour', '/products/around-the-world-80-days/day-01-london/tour.json');
const SV_SCENE = 3;    // scenes[3] = 04 count-the-steps (the seven-stop walk)
const CX_SCENE = 14;   // scenes[14] = 15 look-up-the-cross
const BILLABLE = /maps\.googleapis\.com\/maps\/api\/(js|streetview)/;

let fails = 0;
const ok = (cond, name, extra = '') => { console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra ? ' — ' + extra : '')); if (!cond) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] });

async function newPage({ blockPanos = false, blockConfig = false, noKey = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();
  page.errors = []; page.consoleErrors = []; page.billed = []; page.googleAny = [];
  page.on('pageerror', e => page.errors.push(String(e.message)));
  page.on('console', m => { if (m.type() === 'error') page.consoleErrors.push(m.text() + ' @ ' + ((m.location() || {}).url || '')); });
  page.on('request', r => { const u = r.url(); if (/google/.test(u)) page.googleAny.push(u); if (BILLABLE.test(u)) page.billed.push(u); });
  await page.route(u => BILLABLE.test(String(u)), r => r.abort());     // belt and braces: a billed call cannot leave this test
  if (blockPanos) await page.route(u => /\/media\/files\/panos\//.test(String(u)), r => r.abort());
  if (blockConfig) await page.route(u => new URL(u).pathname === '/config.json', r => r.fulfill({ status: 404, body: 'no config' }));
  await page.goto(`${PLAYER}?tour=${TOUR}`, { waitUntil: 'load' });
  await page.waitForSelector('#start', { timeout: 20000 });
  await page.waitForFunction(() => typeof scenes !== 'undefined' && scenes.length > 0, null, { timeout: 20000 });
  if (noKey) await page.evaluate(() => localStorage.removeItem('yy-gkey'));
  return page;
}
const startAt = async (page, n) => { await page.click('#start'); await page.evaluate(i => showScene(i), n); };
const mode = page => page.evaluate(() => window.__sv && window.__sv.mode);
const waitMode = (page, m, ms = 25000) => page.waitForFunction(x => window.__sv && window.__sv.mode === x, m, { timeout: ms });

// ---------------- pass 1: the open walk on scene 04 ----------------
{
  const page = await newPage();
  await startAt(page, SV_SCENE);
  const up = await waitMode(page, 'open').then(() => true).catch(() => false);
  ok(up, 'mode `open` comes up first on the free ladder', up ? '' : 'mode=' + await mode(page));
  if (up) {
    const cov = await page.evaluate(() => window.__sv.coverage);
    ok(cov.open.length >= 4, 'most of the seven walk stops have cached open imagery', `open=[${cov.open}] gap=[${cov.gap}]`);
    ok(cov.gap.length > 0 || cov.open.length === 7, 'stops without imagery are declared, not faked', `gap=[${cov.gap}]`);
    ok(await page.locator('#media .svopen').count() === 2, 'two cross-fading frame layers are mounted');

    await page.evaluate(() => seek(34)); await sleep(2000);
    const a = await page.evaluate(() => ({ d: window.__sv.debug, bg: [...document.querySelectorAll('#media .svopen')].map(e => e.style.backgroundImage).join(' ') }));
    ok(a.d.src === 'open', 'a walk stop plays from the cache, not from Google', JSON.stringify(a.d.source || ''));
    ok(/media\/files\/panos\//.test(a.bg), 'the layer really shows a cached frame file', (a.bg.match(/panos\/[^/]+\/[^"']+/) || [''])[0]);

    // it advances on the timeline with no clicks
    await page.evaluate(() => seek(46)); await sleep(2500);
    const b = await page.evaluate(() => window.__sv.debug);
    await page.evaluate(() => seek(56)); await sleep(2500);
    const c = await page.evaluate(() => window.__sv.debug);
    ok(c.stop > b.stop || c.frame !== b.frame, 'the walk advances by itself along the scene timeline',
      `stop ${b.stop}/frame ${b.frame} → stop ${c.stop}/frame ${c.frame}`);

    // the camera cue: the Reform Club at 105 s
    await page.evaluate(() => seek(108)); await sleep(2000);
    const cue = await page.evaluate(() => window.__sv.debug);
    ok(/Reform/.test(cue.cue || ''), 'at 108 s the camera track has the Reform Club cue live', cue.cue || '(none)');
    ok(cue.pano === true || Math.abs(cue.yaw) > 0, 'and the frame is turned onto it', `yaw ${cue.yaw}°${cue.pano ? ' inside a 360° frame' : ''}`);

    // attribution burned over our own imagery
    const cr = await page.evaluate(() => { const e = document.querySelector('#media .svcredit'); const r = e.getBoundingClientRect(); return { text: e.innerText, vis: getComputedStyle(e).display !== 'none' && r.width > 40, href: (e.querySelector('a') || {}).href || '' }; });
    ok(cr.vis && /CC BY-SA/i.test(cr.text), 'the CC BY-SA credit is burned on screen while those frames play', cr.text.slice(0, 90));
    ok(/Mapillary|KartaView/.test(cr.text) && /^https?:/.test(cr.href), 'it names the source and links back to the image page', cr.href.slice(0, 60));

    // drag pauses the walk; it resumes on its own
    const box = await page.locator('#media').boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 - 140, box.y + box.height / 2, { steps: 6 });
    ok(await page.evaluate(() => window.__sv.userActive === true), 'dragging takes the camera off the auto-walk');
    ok(await page.evaluate(() => Math.abs(window.__sv.userYaw) > 1), 'and the drag actually turns the view', `${(await page.evaluate(() => window.__sv.userYaw)).toFixed(1)}°`);
    await page.mouse.up();
    ok(await page.evaluate(() => window.__sv.userUntil > elapsed), 'after the drag it waits before taking over again');
    await page.evaluate(() => { elapsed += 6; t0 = performance.now() - elapsed * 1000; });
    await sleep(1500);
    ok(await page.evaluate(() => window.__sv.userUntil <= elapsed && Math.abs(window.__sv.userYaw) < 6), 'the auto-walk resumes and the manual turn eases back to zero');

    // controls still work
    await page.click('#svPause'); ok(await page.evaluate(() => paused === true), 'the ⏸ control pauses the walk');
    await page.click('#svPause'); ok(await page.evaluate(() => paused === false), 'and resumes it');
  }
  ok(page.billed.length === 0, 'RULE 1: zero requests to a billable Google endpoint in the whole pass', page.billed.slice(0, 2).join(' '));
  ok(page.errors.length === 0, 'no uncaught page errors', page.errors.slice(0, 2).join(' | '));
  await page.context().close();
}

// ---------------- pass 2: scene 15, and the free Maps Embed only where imagery is missing ----------------
{
  const page = await newPage();
  await startAt(page, CX_SCENE);
  const up = await waitMode(page, 'open').then(() => true).catch(() => false);
  ok(up, 'scene 15 (the Eleanor Cross) also runs on open imagery', up ? '' : 'mode=' + await mode(page));
  if (up) {
    await page.evaluate(() => seek(4)); await sleep(1800);
    const d = await page.evaluate(() => window.__sv.debug);
    ok(d.src === 'open' && /cross|Portland/i.test(d.cue || ''), 'the "look up" cue is live on a cached frame', d.cue || '');
  }
  // the gap stop of scene 04 may use the FREE Maps Embed API — never a billable SKU
  await page.evaluate(() => showScene(3)); await sleep(1500);
  await page.evaluate(() => seek(3)); await sleep(2500);
  const g = await page.evaluate(() => window.__sv.debug);
  ok(g.src === 'embed', 'a stop with no open imagery falls back to the free Maps Embed, not to a fake walk', JSON.stringify(g));
  ok(page.billed.length === 0, 'still zero billable Google calls', page.billed.slice(0, 2).join(' '));
  ok(page.googleAny.every(u => /maps\/embed\/v1/.test(u)), 'the only Google request of any kind is the free Embed API',
    page.googleAny.filter(u => !/maps\/embed\/v1/.test(u)).slice(0, 2).join(' '));
  await page.context().close();
}

// ---------------- pass 3: no cached frames → embed; no key either → the card ----------------
{
  const page = await newPage({ blockPanos: true });
  await startAt(page, SV_SCENE);
  const fell = await waitMode(page, 'embed', 20000).then(() => true).catch(() => false);
  ok(fell, 'no pano cache → the ladder drops silently to `embed`', 'mode=' + await mode(page));
  ok(page.billed.length === 0, 'and still nothing billable', page.billed.slice(0, 2).join(' '));
  await page.context().close();
}
{
  const page = await newPage({ blockPanos: true, blockConfig: true, noKey: true });
  await startAt(page, SV_SCENE);
  const fell = await waitMode(page, 'link', 20000).then(() => true).catch(() => false);
  ok(fell, 'no cache and no key → the auto-advancing stop card', 'mode=' + await mode(page));
  if (fell) ok(/Street View stop 1 of 7/.test(await page.locator('#media .card').innerText()), 'the card still names the stop');
  ok(page.billed.length === 0, 'the card mode calls nothing billable', page.billed.slice(0, 2).join(' '));
  await page.context().close();
}

// ---------------- pass 4: the shared module plans the scene the same way the player does ----------------
{
  const page = await newPage({ blockConfig: true });
  const same = await page.evaluate(async () => {
    const PM = await import('./panomove.mjs');
    const a = svPlan(scenes[3]), b = PM.planScene(scenes[3]);
    return {
      stops: a.stops.length === b.stops.length,
      arrive: JSON.stringify(a.stops.map(s => s.arrive_s)) === JSON.stringify(b.stops.map(s => s.arrive_s)),
      cues: a.cues.length === b.cues.length,
      cueHeads: JSON.stringify(a.cues.map(c => c.at_s)) === JSON.stringify(b.cues.map(c => c.at_s)),
      camMatch: [0, 31, 91, 107].every(t => {
        const x = svCameraAt(a, t), y = PM.cameraTrack(b.stops, b.cues, t);
        return Math.abs(((x.heading - y.heading + 540) % 360) - 180) < 1.5;
      })
    };
  });
  ok(same.stops && same.arrive, 'panomove.planScene gives the linear renderer the same stops and arrival times as svPlan', JSON.stringify(same));
  ok(same.cues && same.cueHeads, 'and the same camera cues on the same seconds');
  ok(same.camMatch, 'and the same camera heading at 0 / 31 / 91 / 107 s — the video move follows the player move');
  await page.context().close();
}

await browser.close();
console.log(fails ? `\n${fails} check(s) FAILED` : '\nall checks passed');
process.exit(fails ? 1 : 0);
