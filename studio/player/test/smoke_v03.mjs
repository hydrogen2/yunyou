#!/usr/bin/env node
/**
 * smoke_v03.mjs — headless checks for the v0.3 player features (audience fix pass A3p):
 *   gloss overlay chips (📖, tap speaks), who's-who card (shared/whos-who.json, degrades to hidden button),
 *   chapter recap on the cover, narration speed control, and the post-start voice-picker crash fix.
 *
 * v0.10 (2026-09-03, DECISIONS.md D8): the clear/literary register toggle is GONE — there is one English track and
 * narration.script IS it — so the toggle checks are replaced by "the caption speaks narration.script, full stop",
 * and the house TTS default is 0.9 unconditionally.
 *
 * The tour is fetched live and mutated in flight (page.route): a recap and a gloss overlay are injected into
 * chapter 1 / scene 1 so no content files are touched.
 *
 * Run:  node studio/player/test/smoke_v03.mjs [--player https://localhost/player/] [--tour /products/.../tour.json]
 * Needs: studio/tools/render/node_modules (playwright-core) + chromium in ~/.cache/ms-playwright.
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
const PLAYER = opt('--player', 'https://localhost/player/');
const TOUR = opt('--tour', '/products/around-the-world-80-days/day-01-london/tour.json');

const GLOSS = 'whist — a four-player card game, the ancestor of bridge';
const RECAP = 'A rich Londoner bet twenty thousand pounds he can circle the world in eighty days.';

let fails = 0;
const ok = (cond, name, extra = '') => { console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra ? ' — ' + extra : '')); if (!cond) fails++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] });

async function newPage({ blockWho = false } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();
  page.errors = []; page.consoleErrors = [];
  page.on('pageerror', e => page.errors.push(String(e.message)));
  page.on('console', m => { if (m.type() === 'error') page.consoleErrors.push(m.text()); });
  await page.route(u => new URL(u).pathname.endsWith('/tour.json'), async route => {   // inject recap + gloss, content files untouched (predicate: the player page URL carries tour.json in its query string)
    const r = await route.fetch(); const j = await r.json();
    const ch = j.chapters[0]; ch.recap = RECAP;
    const s0 = ch.scenes[0];
    s0.overlays = (s0.overlays || []).concat([{ at_s: 0, kind: 'gloss', text: GLOSS }]);
    await route.fulfill({ response: r, json: j });
  });
  if (blockWho) await page.route(u => new URL(u).pathname.endsWith('/whos-who.json'), route => route.fulfill({ status: 404, body: 'gone' }));
  await page.goto(`${PLAYER}?tour=${TOUR}`, { waitUntil: 'load' });
  await page.waitForSelector('#start', { timeout: 20000 });
  await page.waitForFunction(() => typeof scenes !== 'undefined' && scenes.length > 0, null, { timeout: 20000 }); // boot fetch done: cover populated, #start wired
  return page;
}

// ---- pass 1: everything present ----
{
  const page = await newPage();
  ok(await page.locator('#clearEn').count() === 0, 'cover: the clear/literary toggle is gone (D8, one English track)');
  ok(await page.locator('#rate option').count() === 4, 'cover: speed control has 4 steps');
  ok((await page.locator('#coverTitle').innerText()).includes(RECAP), 'cover: chapter recap shown under the hook');
  await page.waitForFunction(() => !document.querySelector('#btnWho').hidden, null, { timeout: 10000 }).catch(() => {});
  ok(!(await page.evaluate(() => document.querySelector('#btnWho').hidden)), "header: who's-who button revealed after whos-who.json loads");

  ok(await page.evaluate(() => ttsRate()) === 0.9, 'no explicit speed: TTS rate is the house default 0.9');
  await page.selectOption('#rate', '1.1');
  ok(await page.evaluate(() => ttsRate()) === 1.1, 'explicit speed choice (1.1) wins over the default');
  await page.evaluate(() => localStorage.removeItem('yy-rate'));       // back to the default for the rest of the pass

  await page.click('#start');
  await page.waitForSelector('#script');
  const s0script = await page.evaluate(() => scenes[0].narration.script);
  ok((await page.locator('#script').innerText()).trim() === s0script.trim(), 'scene 1: caption script = narration.script');
  const chip = page.locator('#overlays button.gloss');
  ok(await chip.count() === 1 && (await chip.innerText()).includes('📖'), 'scene 1: gloss overlay renders as a 📖 chip');
  await chip.click(); await sleep(300);                                 // tap speaks the definition (silent headless) — must not throw

  // who's who card
  await page.click('#btnWho');
  ok(!(await page.evaluate(() => document.querySelector('#who').hidden)), "who's-who card opens");
  ok(await page.locator('#whoBody p').count() === 7, "who's-who card lists 7 entries");
  const whoTxt = await page.locator('#whoBody').innerText();
  ok(!/F-\d\d/.test(whoTxt), 'no F-ids leak into the card');
  ok(await page.evaluate(() => paused) === true, 'scene clock pauses while the card is open');
  await page.keyboard.press('Escape');
  ok(await page.evaluate(() => document.querySelector('#who').hidden), 'Escape closes the card');
  ok(await page.evaluate(() => paused) === false, 'scene clock resumes on close');

  // one track everywhere: the next scene's caption is its narration.script too
  const orig = await page.evaluate(() => scenes[1].narration.script);
  await page.evaluate(() => showScene(1)); await sleep(400);
  ok((await page.locator('#script').innerText()).trim() === orig.trim(), 'scene 2: caption script = narration.script');

  // regression: speak() must not touch the removed cover's #voice select (pre-v0.3 crash when voices exist)
  const before = page.errors.length;
  await page.evaluate(() => { voices = [{ name: 'NotSelected', lang: 'en-GB' }]; speak('post-start voice lookup check'); });
  await sleep(400);
  ok(page.errors.length === before, 'speak() after cover removal with voices present does not throw');

  ok(page.errors.length === 0, 'no uncaught page errors in pass 1', page.errors.join(' | '));
  if (page.consoleErrors.length) console.log('  (console errors, informational: ' + page.consoleErrors.slice(0, 5).join(' | ') + ')');
  await page.context().close();
}

// ---- pass 2: degradation — no whos-who.json, and a stale yy-clear left over from before D8 ----
{
  const page = await newPage({ blockWho: true });
  await page.evaluate(() => { localStorage.setItem('yy-clear', '0'); localStorage.removeItem('yy-rate'); });
  await sleep(600);
  ok(await page.evaluate(() => document.querySelector('#btnWho').hidden), "missing whos-who.json: button stays hidden");
  await page.reload(); await page.waitForSelector('#start');
  await page.waitForFunction(() => typeof scenes !== 'undefined' && scenes.length > 0, null, { timeout: 20000 });
  ok(await page.evaluate(() => localStorage.getItem('yy-clear')) === null, 'a stale yy-clear from an older build is dropped on boot');
  ok(await page.evaluate(() => ttsRate()) === 0.9, 'defaults: TTS rate 0.9, whatever the old flag said');
  await page.click('#start');
  await page.waitForSelector('#script');
  const orig = await page.evaluate(() => scenes[0].narration.script);
  ok((await page.locator('#script').innerText()).trim() === orig.trim(), 'stale flag ignored: narration.script plays');
  ok(page.errors.length === 0, 'no uncaught page errors in pass 2', page.errors.join(' | '));
  await page.context().close();
}

await browser.close();
console.log(fails ? `\n${fails} CHECK(S) FAILED` : '\nALL PASS');
process.exit(fails ? 1 : 0);
