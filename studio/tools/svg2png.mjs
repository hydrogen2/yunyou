#!/usr/bin/env node
/**
 * svg2png — export an SVG (or an HTML file) to PNG at an exact pixel size, with the studio web fonts loaded.
 *   node studio/tools/svg2png.mjs in.svg out.png 1920x1080 [--bg "#efe6d3"] [--scale 1] [--wait 800]
 *   node studio/tools/svg2png.mjs in.svg out@.png "2176x1812,3840x2160,1080x2160"   # '@' → '_WxH' per size
 * The SVG is inlined into an HTML page that links studio/player/fonts/fonts.css (Playfair Display, Source Sans 3), so
 * text renders with the house fonts even though they are not installed system-wide. Uses playwright-core's chromium
 * from studio/tools/render/node_modules (npm i there first). Relative hrefs (images) resolve against the SVG's directory.
 */
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('./render/node_modules/playwright-core');
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const args = process.argv.slice(2); const opt = {};
for (let i = args.length - 1; i >= 0; i--) if (args[i].startsWith('--')) { opt[args[i].slice(2)] = args[i + 1] ?? true; args.splice(i, 2); }
const [inFile, outFile, sizes = '1920x1080'] = args;
if (!inFile || !outFile) { console.error('usage: svg2png in.svg out.png WxH[,WxH…] [--bg #hex] [--scale n] [--wait ms]'); process.exit(2); }
const here = path.dirname(url.fileURLToPath(import.meta.url));
const fontsCss = url.pathToFileURL(path.resolve(here, '../player/fonts/fonts.css')).href;
const abs = path.resolve(inFile); const isHtml = /\.html?$/i.test(abs);
const body = fs.readFileSync(abs, 'utf8');
const bg = opt.bg || 'transparent';
const html = isHtml ? body : `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${fontsCss}">
<style>html,body{margin:0;padding:0;background:${bg};width:100%;height:100%;overflow:hidden}svg{display:block;width:100vw;height:100vh}</style></head><body>${body}</body></html>`;
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--allow-file-access-from-files'] });
try {
  for (const s of sizes.split(',')) {
    const [w, h] = s.split('x').map(Number);
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: Number(opt.scale || 1) });
    const page = await ctx.newPage();
    const tmp = path.join(path.dirname(abs), `.svg2png_${process.pid}_${w}x${h}.html`);
    fs.writeFileSync(tmp, html);
    try {
      await page.goto(url.pathToFileURL(tmp).href, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts ? document.fonts.ready : null);
      await page.waitForTimeout(Number(opt.wait || 600));
      const dest = outFile.includes('@') ? outFile.replace('@', `_${w}x${h}`) : (sizes.includes(',') ? outFile.replace(/\.png$/i, `_${w}x${h}.png`) : outFile);
      await page.screenshot({ path: dest, omitBackground: bg === 'transparent' });
      console.log(dest, `${w}x${h}`);
    } finally { fs.unlinkSync(tmp); await ctx.close(); }
  }
} finally { await browser.close(); }
