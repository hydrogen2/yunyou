#!/usr/bin/env node
/**
 * smoke_streetview.mjs — headless checks for the v0.4 cinematic Street View scene type.
 *
 * Proves, without a human clicking anything:
 *   1. the walk PLAN builds from the scene content (stops, arrival times from overlays[].at_waypoint, camera cues)
 *   2. the camera FUNCTION turns where the cues say, when the pins fire, and looks along the street in between
 *   3. the FALLBACK LADDER picks the right mode: js (Maps JavaScript API) → stills (Street View Static) → link (card)
 *      — tested with the JS API available, with it blocked, and with no key at all, plus a live gm_authFailure
 *   4. the walk advances with zero clicks, dragging pauses it and it resumes by itself
 *   5. Google's attribution is never covered (cross-fade stops short of the ©-line) and no console errors appear
 *
 * Run (MUST be the referrer-restricted host, not localhost, or Google denies the key and every mode looks broken):
 *   node studio/player/test/smoke_streetview.mjs [--player https://178-104-53-233.sslip.io/player/]
 *                                               [--tour /products/around-the-world-80-days/day-01-london/tour.json]
 *                                               [--no-js] (skip the billed pass)
 * Needs: studio/tools/render/node_modules (playwright-core) + chromium in ~/.cache/ms-playwright.
 * Costs: pass 2 loads real panoramas (Dynamic Street View SKU, ~15-30 panorama loads per run) and pass 3 loads
 * ~10 Street View Static frames. No key is read or written here — the player gets it from /config.json.
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
const PLAYER = opt('--player', 'https://178-104-53-233.sslip.io/player/');
const TOUR = opt('--tour', '/products/around-the-world-80-days/day-01-london/tour.json');
const SKIP_JS = args.includes('--no-js');
const SV_SCENE = 3;   // scenes[3] = 04 count-the-steps (the seven-stop walk)
const CX_SCENE = 14;  // scenes[14] = 15 look-up-the-cross

let fails = 0;
const ok = (cond, name, extra = '') => { console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra ? ' — ' + extra : '')); if (!cond) fails++; };
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] });

async function newPage({ blockJs = false, blockConfig = false, blockStatic = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();
  page.errors = []; page.consoleErrors = []; page.svRequests = [];
  page.on('pageerror', e => page.errors.push(String(e.message)));
  page.on('console', m => { if (m.type() === 'error') page.consoleErrors.push(m.text() + ' @ ' + ((m.location() || {}).url || '')); });
  page.on('request', r => { if (/maps\.googleapis\.com/.test(r.url())) page.svRequests.push(r.url()); });
  if (blockJs) await page.route(u => /maps\.googleapis\.com\/maps\/api\/js/.test(String(u)), r => r.abort());
  if (blockStatic) await page.route(u => /maps\.googleapis\.com\/maps\/api\/streetview/.test(String(u)), r => r.abort());
  if (blockConfig) await page.route(u => new URL(u).pathname === '/config.json', r => r.fulfill({ status: 404, body: 'no config' }));
  await page.goto(`${PLAYER}?tour=${TOUR}`, { waitUntil: 'load' });
  await page.waitForSelector('#start', { timeout: 20000 });
  await page.waitForFunction(() => typeof scenes !== 'undefined' && scenes.length > 0, null, { timeout: 20000 });
  return page;
}
const startAt = async (page, n) => { await page.click('#start'); await page.evaluate(i => showScene(i), n); };
const mode = page => page.evaluate(() => window.__sv && window.__sv.mode);
const waitMode = (page, m, ms = 25000) => page.waitForFunction(x => window.__sv && window.__sv.mode === x, m, { timeout: ms });

// ---------------- pass 1: the plan and the camera function (no network) ----------------
{
  const page = await newPage({ blockConfig: true, blockJs: true, blockStatic: true });
  const p = await page.evaluate(i => {
    const pl = svPlan(scenes[i]);
    const at = t => { const c = svCameraAt(pl, t); return { h: c.heading, p: c.pitch, z: c.zoom, hold: c.holding, stop: c.stop, moving: c.moving, cue: c.cue ? c.cue.label : '' }; };
    return { stops: pl.stops.length, arrive: pl.stops.map(s => s.arrive_s), total: Math.round(pl.total), cues: pl.cues.length,
      legBearing: svBearing(pl.stops[2], pl.stops[3]),
      t: { 0: at(0), 16: at(16), 31: at(31), 50: at(50), 91: at(91), 107: at(107), 122: at(122), 137: at(137) } };
  }, SV_SCENE);
  ok(p.stops === 7, 'scene 04: plan has the seven walk stops', `got ${p.stops}`);
  ok(JSON.stringify(p.arrive) === JSON.stringify([0, 30, 45, 60, 75, 90, 105]),
    'arrival times come from overlays[].at_waypoint (pin and stop coincide)', p.arrive.join(','));
  ok(p.total >= 1050 && p.total <= 1160, 'route length ≈ 1.1 km (F-43 measures 1,120 m between the exact OSM nodes; the route strings are rounded to ~11 m)', p.total + ' m');
  ok(p.cues === 10, 'camera track: 10 cues', String(p.cues));
  ok(near(p.t[0].h, 350, 3), 'at 0 s the camera looks north up Savile Row', String(p.t[0].h));
  ok(near(p.t[16].h, 82, 8) && p.t[16].hold, 'at 16 s it has turned to 7–8 Savile Row and is holding (caption at 15 s)', `${p.t[16].h.toFixed(1)}°`);
  ok(near(p.t[31].h, 240, 6) && p.t[31].stop === 1, "at 31 s it faces WSW along Burlington Gardens at Verne's corner", `${p.t[31].h.toFixed(1)}°`);
  ok(p.t[50].moving && near(p.t[50].h, p.legBearing, 25), 'mid-leg it looks along the direction of travel', `${p.t[50].h.toFixed(1)}° vs leg ${p.legBearing.toFixed(1)}°`);
  ok(near(p.t[91].h, 65, 6), 'at 91 s it turns east into Pall Mall (gas-lamp pin at 90 s)', `${p.t[91].h.toFixed(1)}°`);
  ok(near(p.t[107].h, 168, 6) && p.t[107].p > 10, 'at 107 s it is on the Reform Club façade, tilted up (pin at 105 s)', `${p.t[107].h.toFixed(1)}° / pitch ${p.t[107].p}`);
  ok(near(p.t[122].h, 109, 6), 'at 122 s it has turned left to the Travellers, 106 (pin at 120 s)', `${p.t[122].h.toFixed(1)}°`);
  ok(near(p.t[137].h, 89, 6), 'at 137 s it is on the Athenaeum, 107 (pin at 135 s)', `${p.t[137].h.toFixed(1)}°`);
  ok(p.t[107].z < p.t[137].z, 'the framing tightens as the landmarks get further away (zoom rises)', `${p.t[107].z} → ${p.t[137].z}`);

  const c = await page.evaluate(i => {
    const pl = svPlan(scenes[i]);
    const at = t => { const x = svCameraAt(pl, t); return { h: x.heading, p: x.pitch }; };
    return { stops: pl.stops.length, cues: pl.cues.length, t3: at(3), t15: at(15), t23: at(23) };
  }, CX_SCENE);
  ok(c.stops === 1 && c.cues === 4, 'scene 15: one stop, four cues', `${c.stops}/${c.cues}`);
  ok(near(c.t3.h, 142, 6) && c.t3.p > 25, 'scene 15 at 3 s: looking UP the Eleanor Cross', `${c.t3.h.toFixed(1)}° pitch ${c.t3.p}`);
  ok(near(c.t15.h, 229, 8) && Math.abs(c.t15.p) < 5, 'scene 15 at 15 s: turned right, across to Charles I', `${c.t15.h.toFixed(1)}°`);
  ok(near(c.t23.h, 142, 6), 'scene 15 at 23 s: settled back on the cross', `${c.t23.h.toFixed(1)}°`);
  ok(page.errors.length === 0, 'no uncaught page errors in pass 1', page.errors.join(' | '));
  await page.context().close();
}

// ---------------- pass 2: mode js — the real panorama walk (billed) ----------------
if (!SKIP_JS) {
  const page = await newPage();
  await startAt(page, SV_SCENE);
  let up = true;
  await waitMode(page, 'js').catch(() => { up = false; });
  ok(up, 'ladder: with the Maps JavaScript API enabled the walk runs in "js" mode', up ? '' : 'mode=' + await mode(page));
  if (up) {
    ok(await page.locator('#media .svpano').count() === 1, 'a StreetViewPanorama is mounted in the media box');
    await page.waitForFunction(() => document.querySelectorAll('#media .svpano canvas, #media .svpano img').length > 0, null, { timeout: 20000 }).catch(() => {});
    ok(await page.evaluate(() => document.querySelectorAll('#media .svpano canvas, #media .svpano img').length > 0), 'the panorama actually painted tiles (not a grey box)');
    ok(await page.evaluate(() => !!(window.__sv.pano && window.__sv.pano.getPano && window.__sv.pano.getPano())), 'the panorama has a pano id');

    // eased turn: seek to the Reform cue and watch the heading converge without a jump
    await page.evaluate(() => seek(105)); await sleep(500);
    const track = await page.evaluate(async () => {
      const out = []; for (let i = 0; i < 30; i++) { out.push(window.__sv.pano.getPov().heading); await new Promise(r => setTimeout(r, 150)); }
      return out;
    });
    const steps = track.slice(1).map((h, i) => Math.abs(((h - track[i] + 540) % 360) - 180));
    ok(Math.max(...steps) < 25, 'the turn is eased, never a snap (largest frame step < 25°)', Math.max(...steps).toFixed(1) + '°');
    const end = await page.evaluate(() => window.__sv.pano.getPov().heading);
    ok(near(((end - 168 + 540) % 360) - 180, 0, 12), 'after the cue the camera has arrived on the Reform façade bearing', end.toFixed(1) + '°');

    // it walks by itself: no click anywhere, position changes across a leg
    const before = await page.evaluate(() => ({ loads: window.__sv.debug.loads, pano: window.__sv.pano.getPano() }));
    await page.evaluate(() => seek(46));
    await sleep(6000);
    const after = await page.evaluate(() => ({ loads: window.__sv.debug.loads, pano: window.__sv.pano.getPano(), stop: window.__sv.debug.stop }));
    ok(after.loads > before.loads && after.pano !== before.pano, 'the walk advances panos on its own — zero clicks', `${before.loads}→${after.loads} loads`);

    // drag pauses it, and it resumes on its own
    const box = await page.locator('#media .svpano').boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 - 120, box.y + box.height / 2, { steps: 6 });
    ok(await page.evaluate(() => window.__sv.userActive === true), 'dragging takes the camera off auto-walk');
    await page.mouse.up();
    ok(await page.evaluate(() => window.__sv.userUntil > elapsed), 'after the drag it waits ~4 s before taking over again');
    await page.evaluate(() => { elapsed += 6; t0 = performance.now() - elapsed * 1000; });
    await sleep(1200);
    ok(await page.evaluate(() => window.__sv.userUntil <= elapsed && window.__sv.debug.holding !== undefined), 'the auto-walk resumes by itself after the idle window');

    // controls
    await page.click('#svPause'); ok(await page.evaluate(() => paused === true), 'the ⏸ control pauses the scene');
    await page.click('#svPause'); ok(await page.evaluate(() => paused === false), 'and resumes it');
    await page.click('#svReplay'); await sleep(1500);
    ok(await page.evaluate(() => elapsed < 5 && scenes[idx].id === 'count-the-steps'), 'the ↻ control replays the walk from the first stop');

    // attribution is never covered
    const fade = await page.evaluate(() => { const f = document.querySelector('#media .svfade'); const cs = getComputedStyle(f); return { bottom: cs.bottom, z: cs.zIndex }; });
    ok(parseFloat(fade.bottom) >= 24, "the cross-fade stops short of the bottom edge, so Google's logo/©-line stays clear", fade.bottom);
    ok(await page.locator('#media .svattr').count() === 1 && /Google Street View/.test(await page.locator('#media .svattr').innerText()), 'our Google Street View attribution chip is visible');
    ok(await page.evaluate(() => { const b = document.querySelector('#media .svbar').getBoundingClientRect(), m = document.querySelector('#media').getBoundingClientRect(); return b.bottom < m.top + m.height * 0.35; }),
      'the walk controls sit in the top of the frame, not over the attribution corner');

    // auto-hand-on: a streetview walk no longer waits for input
    ok(await page.evaluate(() => { const s = scenes[3]; return !(s.interaction && s.interaction.kind !== 'none' && !(s.interaction.kind === 'walk' && s.type === 'streetview')); }),
      'a streetview walk counts as "no input needed" — the scene hands on like a video');
  }
  const noise = page.consoleErrors.filter(t => !/favicon|ERR_ABORTED/.test(t));
  ok(noise.length === 0, 'no console errors in the js mode', noise.slice(0, 3).join(' | '));
  ok(page.errors.length === 0, 'no uncaught page errors in pass 2', page.errors.join(' | '));
  await page.context().close();
}

// ---------------- pass 3: JS API unavailable → Street View Static hyperlapse ----------------
{
  const page = await newPage({ blockJs: true });
  await startAt(page, SV_SCENE);
  let up = true;
  await waitMode(page, 'stills', 30000).catch(() => { up = false; });
  ok(up, 'ladder: no Maps JavaScript API → falls back to the Static hyperlapse, silently', up ? '' : 'mode=' + await mode(page));
  if (up) {
    ok(await page.locator('#media img.svstill').count() === 2, 'two cross-fading still layers are mounted');
    await page.waitForFunction(() => [...document.querySelectorAll('#media img.svstill')].some(i => i.naturalWidth > 0), null, { timeout: 25000 }).catch(() => {});
    ok(await page.evaluate(() => [...document.querySelectorAll('#media img.svstill')].some(i => i.naturalWidth > 0)), 'a real Street View Static frame loaded');
    const st = await page.evaluate(() => ({ n: window.__sv.debug.frames, i: window.__sv.debug.frame }));
    ok(st.n > 20 && st.n <= 60, 'the hyperlapse has a sane frame count inside the cost cap', `${st.n} frames`);
    const f0 = await page.evaluate(() => window.__sv.debug.frame);
    await page.evaluate(() => seek(100)); await sleep(1500);
    const f1 = await page.evaluate(() => window.__sv.debug.frame);
    ok(f1 > f0, 'the hyperlapse advances along the same timeline with no clicks', `${f0} → ${f1}`);
    ok(await page.evaluate(() => /streetview\?/.test([...document.querySelectorAll('#media img.svstill')].map(i => i.src).join(' '))), 'frames come from the Street View Static API');
    ok(page.svRequests.some(u => /streetview\/metadata/.test(u)), 'availability was probed with the free metadata endpoint first');
    ok(await page.locator('#media .svattr').count() === 1, 'attribution chip present in stills mode');
  }
  const noise = page.consoleErrors.filter(t => !/favicon|maps\/api\/js/.test(t));   // the test itself aborts the JS API request
  ok(noise.length === 0, 'no console errors in the stills mode', noise.slice(0, 3).join(' | '));
  await page.context().close();
}

// ---------------- pass 4: no key at all → the auto-advancing card ----------------
{
  const page = await newPage({ blockConfig: true, blockJs: true, blockStatic: true });
  await page.evaluate(() => localStorage.removeItem('yy-gkey'));
  await startAt(page, SV_SCENE);
  let up = true;
  await waitMode(page, 'link', 20000).catch(() => { up = false; });
  ok(up, 'ladder: no key, nothing enabled → the "open in Google Maps" card', up ? '' : 'mode=' + await mode(page));
  if (up) {
    ok(/Street View stop 1 of 7/.test(await page.locator('#media .card').innerText()), 'the card names the stop');
    ok(await page.locator('#media .card a[href*="map_action=pano"]').count() === 1, 'and offers the Google Maps link');
    await page.evaluate(() => seek(92)); await sleep(1200);
    ok(await page.evaluate(() => window.__sv.debug.stop === 5), 'even the card walks itself along the timeline', 'stop ' + await page.evaluate(() => window.__sv.debug.stop));
    ok(/Google Street View/.test(await page.locator('#media .svattr').innerText()), 'attribution stays visible in the card mode');
  }
  ok(page.errors.length === 0, 'no uncaught page errors in pass 4', page.errors.join(' | '));
  await page.context().close();
}

// ---------------- pass 5: gm_authFailure mid-scene degrades without a broken pano ----------------
if (!SKIP_JS) {
  const page = await newPage();
  await startAt(page, CX_SCENE);
  const got = await waitMode(page, 'js', 25000).then(() => true).catch(() => false);
  ok(got, 'scene 15 also runs in js mode');
  if (got) {
    await page.evaluate(() => window.gm_authFailure());
    const fell = await waitMode(page, 'stills', 25000).then(() => true).catch(() => false);
    ok(fell, 'a live gm_authFailure drops silently to the stills mode', 'mode=' + await mode(page));
    ok(await page.locator('#media .svpano').count() === 0, 'the dead panorama is torn down — the traveller never sees a broken view');
    ok(await page.locator('#media .fill .card').count() === 0, 'and no error card is shown');
  }
  await page.context().close();
}

await browser.close();
console.log(fails ? `\n${fails} CHECK(S) FAILED` : '\nALL PASS');
process.exit(fails ? 1 : 0);
