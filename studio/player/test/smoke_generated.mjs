#!/usr/bin/env node
/**
 * smoke_generated.mjs — headless smoke test for the Day 1 generated-asset wiring in studio/player/index.html.
 *
 * For each scene with `kind: generated` media: open the player, showScene(i), seek the scene clock to where the
 * asset is scheduled, wait for the inline <svg> in #media, collect console errors + failed requests, screenshot,
 * and drive the interactive wiring (G-01 layer reveal + leg tap, G-02 seam drag/keys, G-04 row tap, G-07 bag drag).
 *
 * Run:  node studio/player/test/smoke_generated.mjs [--player https://localhost/player/] [--tour /products/.../tour.json]
 *                                                   [--out studio/player/test/out] [--only 10,13] [--size 1280x720]
 * Needs: studio/tools/render/node_modules (npm i there once: playwright-core) + chromium in ~/.cache/ms-playwright.
 * Exit code 1 if any check fails. Screenshots (1280x720 jpeg q60): out/scene-NN.jpg (first frame) and out/scene-NN-b.jpg (after interaction).
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
const PLAYER = opt('--player', 'https://localhost/player/');
const TOUR = opt('--tour', '/products/around-the-world-80-days/day-01-london/tour.json');
const OUT = path.resolve(opt('--out', path.join(HERE, 'out')));
const ONLY = opt('--only', '') ? opt('--only', '').split(',').map(Number) : null;
const [W, H] = opt('--size', '1280x720').split('x').map(Number);
fs.mkdirSync(OUT, { recursive: true });

// scene index (0-based) → what to check. seek = scene-clock seconds to jump to before waiting for the svg.
const CASES = [
  { i: 0,  id: 'cold-open',          g: 'G-01', seek: 9,  drive: 'g01-static' },
  { i: 2,  id: 'fogg-by-the-clock',  g: 'G-04', seek: 0,  drive: 'g04' },
  { i: 7,  id: 'the-wager',          g: 'G-05', seek: 31, drive: null },
  { i: 8,  id: 'two-real-men',       g: 'G-06', seek: 0,  drive: null },
  { i: 9,  id: 'the-world-shrinks',  g: 'G-01', seek: 31, drive: 'g01-loop' },
  { i: 10, id: 'pack-the-bag',       g: 'G-07', seek: 0,  drive: 'g07' },
  { i: 13, id: 'then-and-now',       g: 'G-02', seek: 0,  drive: 'g02' },
  { i: 18, id: 'souvenir',           g: 'G-08', seek: 0,  drive: 'g08' },
];

const results = [];
const pad = n => String(n).padStart(2, '0');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, ignoreHTTPSErrors: true });
const page = await ctx.newPage();
const consoleErrors = [], failedReqs = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));
page.on('requestfailed', r => failedReqs.push(`${r.url()} — ${r.failure() && r.failure().errorText}`));
page.on('response', r => { if (r.status() >= 400) failedReqs.push(`${r.url()} — HTTP ${r.status()}`); });

await page.goto(`${PLAYER}?tour=${TOUR}`, { waitUntil: 'load' });
await page.waitForSelector('#start', { timeout: 20000 });
await page.click('#start');
await page.evaluate(() => { narrate = false; try { speechSynthesis.cancel(); } catch { } });

// scene-time seek: the player exposes seek(s) (test/render hook); fall back to poking t0 for older builds
async function seek(s) { await page.evaluate(s => { if (typeof seek === 'function') seek(s); else { t0 = performance.now() - s * 1000; tick(); } }, s); }
async function svgReady(timeout = 15000) {
  await page.waitForSelector('#media svg.gen', { timeout });
  await page.waitForFunction(() => { const s = document.querySelector('#media svg.gen'); return s && s.getBoundingClientRect().width > 100; }, null, { timeout });
  // fonts + <image> children: give the network a moment (Commons is not involved; all local)
  await page.evaluate(() => document.fonts.ready.then(() => 0)).catch(() => 0);
  await sleep(500);
}
async function shot(name) { await page.screenshot({ path: path.join(OUT, name), type: 'jpeg', quality: 60 }); } // jpeg q60: review evidence, kept small enough to commit
function check(list, name, ok, detail = '') { list.push({ name, ok: !!ok, detail }); }

for (const c of CASES) {
  if (ONLY && !ONLY.includes(c.i)) continue;
  const checks = [];
  const errStart = consoleErrors.length, failStart = failedReqs.length;
  try {
    await page.evaluate(i => showScene(i), c.i);
    await sleep(300);
    if (c.seek) await seek(c.seek);
    await svgReady();
    check(checks, 'svg inlined in #media', true);
    const info = await page.evaluate(() => { const s = document.querySelector('#media svg.gen'); const r = s.getBoundingClientRect(); return { vb: s.getAttribute('viewBox'), w: Math.round(r.width), h: Math.round(r.height), imgs: [...s.querySelectorAll('image')].map(im => im.getAttribute('href') || im.getAttribute('xlink:href')).map(u => u ? u.slice(0, 80) : '') }; });
    check(checks, `viewBox ${info.vb} rendered ${info.w}x${info.h}`, info.w > 100 && info.h > 100);
    // every <image> that is not data: must have loaded (naturalWidth via a probe Image)
    const imgOk = await page.evaluate(async () => { const s = document.querySelector('#media svg.gen'); const hs = [...s.querySelectorAll('image')].map(im => im.getAttribute('href') || im.getAttribute('xlink:href')).filter(u => u && !/^data:/.test(u)); const rs = await Promise.all(hs.map(u => new Promise(res => { const im = new Image(); im.onload = () => res([u, true]); im.onerror = () => res([u, false]); im.src = u; }))); return rs; });
    imgOk.forEach(([u, ok]) => check(checks, `image loads: ${u.replace(/.*\/generated\//, '')}`, ok));
    await shot(`scene-${pad(c.i + 1)}.jpg`);
    // race guard: a scheduled Commons image (photoCycle/inset) resolving late must not replace the svg
    await sleep(2500);
    check(checks, 'svg still in #media 2.5 s later (no late image clobber)', await page.evaluate(() => !!document.querySelector('#media svg.gen')));

    if (c.drive === 'g01-static') {
      const st = await page.evaluate(() => { const s = document.querySelector('#media svg.gen'); return { L0: !!s.querySelector('#L0'), DAY1: !!s.querySelector('#DAY1'), legs: [...s.querySelectorAll('[id^=L]')].filter(g => /^L\d+$/.test(g.id)).map(g => g.id) }; });
      check(checks, `day-01 state has #L0 + #DAY1 (layers: ${st.legs.join(',')})`, st.L0 && st.DAY1);
    }
    if (c.drive === 'g01-loop') {
      // full-loop map (30–88 s): legs L1..L9 revealed cumulatively; count visible legs at three scene times
      const vis = async () => page.evaluate(() => { const s = document.querySelector('#media svg.gen'); let n = 0; for (let k = 1; k <= 9; k++) { const g = s.querySelector('#L' + k); if (g && g.style.display !== 'none') n++; } return n; });
      const n1 = await vis();
      await seek(60); await sleep(700); const n2 = await vis();
      await seek(87); await sleep(700); const n3 = await vis();
      check(checks, `layer reveal over time: ${n1} → ${n2} → ${n3} legs visible`, n1 >= 1 && n1 < n2 && n2 < n3 && n3 === 9);
      const hits = await page.evaluate(() => document.querySelectorAll('#media svg.gen .hit[data-leg]').length);
      check(checks, `${hits} .hit[data-leg] tap targets wired`, hits >= 8);
      // tap leg 6 (Yokohama → San Francisco, the correct answer) → option 5 picked + row highlighted
      await page.evaluate(() => { const h = document.querySelector('#media svg.gen .hit[data-leg="6"]'); h.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
      await sleep(400);
      const pick = await page.evaluate(() => { const b = document.querySelectorAll('#interaction .opt'); const p = [...b].findIndex(x => x.classList.contains('picked')); const h = document.querySelector('#media svg.gen .hit[data-leg="6"]'); return { picked: p, correct: b[p] && b[p].classList.contains('correct'), stroke: h.getAttribute('stroke'), fb: (document.querySelector('#interaction .fb') || {}).textContent }; });
      check(checks, `tap leg 6 → option ${pick.picked} picked (correct=${pick.correct}), hit stroke=${pick.stroke}`, pick.picked === 5 && pick.correct && pick.stroke === '#b03a2e');
      await shot(`scene-${pad(c.i + 1)}-b.jpg`);
      // 88–100 s: back to the day-01 state
      await seek(89); await page.waitForFunction(() => { const s = document.querySelector('#media svg.gen'); return s && s.querySelector('#DAY1') && !s.querySelector('#L1'); }, null, { timeout: 8000 }).then(() => check(checks, 'at 89 s the map is the day-01 state again', true)).catch(() => check(checks, 'at 89 s the map is the day-01 state again', false));
    }
    if (c.drive === 'g04') {
      await page.click('#media svg.gen #row-3 rect.hit');
      await sleep(400);
      const r = await page.evaluate(() => { const b = [...document.querySelectorAll('#interaction .opt')]; return { picked: b.findIndex(x => x.classList.contains('picked')), hl: !!document.querySelector('#media svg.gen #row-3 .row-hl'), fb: (document.querySelector('#interaction .fb') || {}).textContent || '' }; });
      check(checks, `tap #row-3 → option ${r.picked} picked, highlight in row=${r.hl}`, r.picked === 2 && r.hl);
      check(checks, `feedback shown: "${r.fb.slice(0, 40)}…"`, r.fb.length > 10);
      const cd = await page.evaluate(() => document.querySelector('#countdown').textContent);
      check(checks, `countdown cleared after pick (was pause_narration+timeout_s): "${cd}"`, cd === '');
      await shot(`scene-${pad(c.i + 1)}-b.jpg`);
    }
    if (c.drive === 'g07') {
      const box = async sel => page.evaluate(sel => { const e = document.querySelector('#media svg.gen ' + sel); const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height }; }, sel);
      const drag = async (fromSel, toSel) => { const a = await box(fromSel), b = await box(toSel); await page.mouse.move(a.x, a.y); await page.mouse.down(); for (let k = 1; k <= 12; k++) { await page.mouse.move(a.x + (b.x - a.x) * k / 12, a.y + (b.y - a.y) * k / 12); await sleep(20); } await page.mouse.up(); await sleep(300); };
      const counter = () => page.evaluate(() => document.querySelector('#media svg.gen #counter').textContent.trim());
      check(checks, `counter starts "${await counter()}"`, (await counter()) === '0 of 6');
      const goodSel = await page.evaluate(() => '#' + document.querySelector('#media svg.gen .item[data-correct="true"]').id);
      await drag(goodSel, '#bag-drop');
      const c1 = await counter();
      const s1 = await page.evaluate(sel => { const el = document.querySelector('#media svg.gen ' + sel); const i = +el.dataset.option; const b = document.querySelectorAll('#interaction .opt')[i]; return { inClass: el.classList.contains('in'), inPacked: !!el.closest('#packed'), btn: b && b.textContent.slice(0, 1) }; }, goodSel);
      check(checks, `drag ${goodSel} (correct) into bag → counter "${c1}", .in=${s1.inClass}, in #packed=${s1.inPacked}, checklist ${s1.btn}`, c1 === '1 of 6' && s1.inClass && s1.inPacked && s1.btn === '☑');
      const badSel = await page.evaluate(() => '#' + document.querySelector('#media svg.gen .item[data-correct="false"]').id);
      const home = await page.evaluate(sel => document.querySelector('#media svg.gen ' + sel).dataset.home, badSel);
      await drag(badSel, '#bag-drop');
      const s2 = await page.evaluate(sel => { const el = document.querySelector('#media svg.gen ' + sel); return { tr: el.getAttribute('transform'), wrong: el.classList.contains('wrong'), fb: (document.querySelector('#interaction .fb.tmp') || {}).textContent || '' }; }, badSel);
      const c2 = await counter();
      check(checks, `drag ${badSel} (wrong) → snapped to translate(${home}) [got ${s2.tr}], .wrong=${s2.wrong}, counter "${c2}"`, s2.tr === `translate(${home})` && s2.wrong && c2 === '1 of 6');
      check(checks, `wrong drop feedback: "${s2.fb.slice(0, 40)}…"`, s2.fb.length > 5);
      // tap-to-select path: tap another correct item, then tap the bag
      const good2 = await page.evaluate(() => '#' + [...document.querySelectorAll('#media svg.gen .item[data-correct="true"]')].find(e => !e.classList.contains('in')).id);
      const g2 = await box(good2); await page.mouse.click(g2.x, g2.y); await sleep(200);
      const bd = await box('#bag-drop'); await page.mouse.click(bd.x, bd.y); await sleep(300);
      const c3 = await counter();
      check(checks, `tap ${good2} then tap bag → counter "${c3}"`, c3 === '2 of 6');
      await shot(`scene-${pad(c.i + 1)}-b.jpg`);
      // close the bag from the SVG button → summary + locked
      await page.evaluate(() => { const b = document.querySelector('#media svg.gen #close-btn'); b.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
      await sleep(300);
      const cl = await page.evaluate(() => ({ fb: (document.querySelector('#interaction .fb:not(.tmp)') || {}).textContent || '', locked: document.querySelector('#media svg.gen').style.pointerEvents === 'none' }));
      check(checks, `#close-btn → summary "${cl.fb.slice(0, 50)}…", svg locked=${cl.locked}`, /of 6|Packed/.test(cl.fb) && cl.locked);
    }
    if (c.drive === 'g02') {
      const rx = () => page.evaluate(() => ({ x: +document.querySelector('#media svg.gen #clip-now-rect').getAttribute('x'), w: +document.querySelector('#media svg.gen #clip-now-rect').getAttribute('width'), seam: document.querySelector('#media svg.gen').dataset.seam, tr: document.querySelector('#media svg.gen #seam').getAttribute('transform') }));
      const r0 = await rx();
      // pointer: press at 25 % of the image area and drag to 30 %
      const geo = await page.evaluate(() => { const s = document.querySelector('#media svg.gen'); const m = s.getScreenCTM(); const x0 = +s.dataset.x0, x1 = +s.dataset.x1, y0 = +s.dataset.y0, y1 = +s.dataset.y1; const pt = f => { const p = s.createSVGPoint(); p.x = x0 + f * (x1 - x0); p.y = (y0 + y1) / 2; const q = p.matrixTransform(m); return { x: q.x, y: q.y }; }; return { a: pt(0.25), b: pt(0.30) }; });
      await page.mouse.move(geo.a.x, geo.a.y); await page.mouse.down(); await sleep(50); await page.mouse.move(geo.b.x, geo.b.y, { steps: 5 }); await sleep(50); await page.mouse.up(); await sleep(200);
      const r1 = await rx();
      check(checks, `pointer drag to 30 % → seam ${r0.seam} → ${r1.seam}, clip x ${r0.x} → ${r1.x}`, r1.x !== r0.x && Math.abs(+r1.seam - 0.30) < 0.02);
      // keyboard: focus svg, ArrowRight ×3 → +6 %; must NOT advance the scene
      await page.evaluate(() => document.querySelector('#media svg.gen').focus());
      await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await sleep(200);
      const r2 = await rx(); const still = await page.evaluate(() => idx);
      check(checks, `ArrowRight ×3 → seam ${r1.seam} → ${r2.seam}, clip x ${r1.x} → ${r2.x}, scene still ${still}`, r2.x > r1.x && Math.abs(+r2.seam - (+r1.seam + 0.06)) < 0.005 && still === c.i);
      check(checks, `#seam transform follows: ${r2.tr}`, r2.tr === `translate(${r2.x} 0)`);
      await shot(`scene-${pad(c.i + 1)}-b.jpg`);
    }
    if (c.drive === 'g08') {
      const ui = await page.evaluate(() => ({ save: !!([...document.querySelectorAll('#interaction .btn')].find(b => /Save card/.test(b.textContent))), share: !!([...document.querySelectorAll('#interaction .btn')].find(b => /Share|Copy link/.test(b.textContent))), nextOk: interactionResolved }));
      check(checks, `save UI: Save=${ui.save} Share/Copy=${ui.share}, next enabled=${ui.nextOk}`, ui.save && ui.share && ui.nextOk);
      // PNG export path (svgToPngBlob) must not throw and must yield a non-trivial blob
      const png = await page.evaluate(async () => { try { const b = await svgToPngBlob(document.querySelector('#media svg.gen')); return { ok: true, size: b.size, type: b.type }; } catch (e) { return { ok: false, err: e.message }; } });
      check(checks, `svgToPngBlob → ${png.ok ? png.size + ' bytes ' + png.type : 'ERR ' + png.err}`, png.ok && png.size > 20000);
    }
  } catch (e) {
    check(checks, 'exception: ' + (e.message || e).toString().split('\n')[0], false);
    try { await shot(`scene-${pad(c.i + 1)}-err.jpg`); } catch { }
  }
  const errs = consoleErrors.slice(errStart), fails = failedReqs.slice(failStart).filter(u => !/youtube|googlevideo|doubleclick|google-analytics/.test(u));
  check(checks, `console errors: ${errs.length}${errs.length ? ' — ' + errs[0].slice(0, 120) : ''}`, errs.length === 0);
  check(checks, `failed requests: ${fails.length}${fails.length ? ' — ' + fails[0].slice(0, 120) : ''}`, fails.length === 0);
  results.push({ ...c, checks });
}
await browser.close();

// ---- report
let allOk = true; const lines = [];
lines.push(`| scene | id | asset | result | detail |`); lines.push(`|---|---|---|---|---|`);
for (const r of results) {
  const ok = r.checks.every(c => c.ok); allOk &&= ok;
  lines.push(`| ${pad(r.i + 1)} | ${r.id} | ${r.g} | ${ok ? 'PASS' : 'FAIL'} | ${r.checks.map(c => (c.ok ? '✓ ' : '✗ ') + c.name).join('<br>')} |`);
}
console.log(lines.join('\n'));
console.log('\nScreenshots:', OUT);
console.log(allOk ? '\nALL PASS' : '\nSOME FAILED');
fs.writeFileSync(path.join(OUT, 'RESULTS.md'), `# smoke_generated — ${new Date().toISOString()} · player ${PLAYER}\n\n${lines.join('\n')}\n\n${allOk ? 'ALL PASS' : 'SOME FAILED'}\n`);
process.exit(allOk ? 0 : 1);
