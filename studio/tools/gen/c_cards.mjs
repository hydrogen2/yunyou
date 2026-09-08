#!/usr/bin/env node
/**
 * c_cards.mjs — the C-series typeset cards, generated from the scene files themselves.
 *
 *   node studio/tools/gen/c_cards.mjs <chapter-dir> [--png] [--dry]
 *
 * WHAT THESE ARE. D9 retired every floating overlay from the film; the wording that used to hover over a picture
 * became a **full-frame designed card** — "text on screen = burned captions + type that is part of a designed card
 * or map. Nothing hovering." The Scene Developer authored 26 of them for Day 1 as media entries of
 * `kind: "generated"`, path `generated/cards/c-NN-<slug>.svg`, with the exact words in the entry's `note` after
 * `ON-SCREEN TEXT:`. This tool reads that note and sets the type. It is the single source of truth for the words:
 * fix a card by fixing the scene file, never by editing an SVG.
 *
 * HOUSE STYLE (same as studio/tools/gen/cards_day01.mjs, which made G-04/05/06/08):
 * cream #efe6d3, ink #2a2118, secondary #5b4a3a, ONE accent #b03a2e; Playfair Display for words, Source Sans 3 for
 * dates and numbers; no gradients, no shadows. D9's legibility rule binds hardest here — "legible at arm's length
 * on a 6-inch screen" — so type is auto-fitted as LARGE as the frame allows and never falls below ~54 px at 1080p.
 *
 * MARK-UP IN THE AUTHORED STRING
 *   ` / `  a new block: the first block is the headline, the rest are the answer / the list under it.
 *   ` · `  separate items: each gets its own line, and the interpunct is dropped (the line break is the separator).
 *   ` → `  kept inline — it is an arrow between two values, not a separator.
 *
 * RULE 1: no network, no service, no cost. Pure string → SVG. `--png` additionally calls studio/tools/svg2png.mjs
 * (local headless chromium) to write a 1920x1080 sibling; the renderer does not need it — it rasterises the SVG
 * itself with the house fonts loaded.
 */
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url'; import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry'), PNG = argv.includes('--png');
const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const CHAPTER = path.resolve(argv.find(a => !a.startsWith('--')) || path.join(ROOT, 'products/around-the-world-80-days/day-01-london'));

const W = 1920, H = 1080;
const C = { paper: '#efe6d3', ink: '#2a2118', ink2: '#5b4a3a', accent: '#b03a2e' };
const SERIF = "'Playfair Display', Georgia, serif";
const SANS = "'Source Sans 3', system-ui, sans-serif";
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Average advance width as a fraction of the em, measured off the two faces at 100 px in chromium and rounded up.
// Used only to CHOOSE a size; the browser does the real setting, so a small error costs a little margin, not a clip.
const EM = { serif: 0.515, sans: 0.495 };
const isNumeric = s => {
  const digits = (s.match(/[\d£$€]/g) || []).length;
  return digits >= 3 && digits / s.replace(/\s/g, '').length >= 0.30;
};

/** greedy wrap to `cols` characters, never mid-word */
function wrap(text, cols) {
  const words = String(text).split(/\s+/); const out = []; let line = '';
  for (const w of words) { if (line && (line + ' ' + w).length > cols) { out.push(line); line = w; } else line = line ? line + ' ' + w : w; }
  if (line) out.push(line); return out;
}

/** the authored string → [{text, font, weight, role}] display lines */
function layout(text) {
  const blocks = String(text).split(/\s+\/\s+/).map(b => b.trim()).filter(Boolean);
  const lines = [];
  blocks.forEach((b, bi) => {
    const items = b.split(/\s+·\s+/).map(x => x.trim()).filter(Boolean);
    const listy = items.length > 1;
    // ONE face per block: a list whose first line is a number and whose second is a phrase must not change
    // typeface half way down. If any item in the block reads as numeric, the whole block is set in the sans.
    const numeric = items.some(isNumeric);
    for (const it of items) {
      lines.push({ text: it, role: bi === 0 ? (listy ? 'item' : 'head') : 'sub', numeric });
    }
    if (bi < blocks.length - 1) lines.push({ rule: true });
  });
  return lines;
}

function card(text) {
  const M = 124;                                  // safe margin: type never sits nearer than this to the edge
  const usableW = W - 2 * M, usableH = H - 2 * M;
  const rows = layout(text);
  const textRows = rows.filter(r => !r.rule);
  // one size for the headline family, one for the rest; both auto-fitted
  const bigCount = textRows.filter(r => r.role !== 'sub').length;
  let size = bigCount === 1 && textRows.length === 1 ? 172 : 132;   // a single line may go very large
  const subScale = 0.66;
  for (; size >= 46; size -= 2) {
    const laid = [];
    for (const r of rows) {
      if (r.rule) { laid.push({ rule: true, h: size * 0.9 }); continue; }
      const px = r.role === 'sub' ? size * subScale : size;
      const em = (r.numeric ? EM.sans : EM.serif) * px;
      const cols = Math.max(8, Math.floor(usableW / em));
      for (const l of wrap(r.text, cols)) laid.push({ text: l, px, numeric: r.numeric, role: r.role, h: px * 1.24 });
    }
    const total = laid.reduce((a, x) => a + x.h, 0);
    if (total <= usableH) return { size, laid, total };
  }
  return null;
}

function svg(text, title) {
  const c = card(text);
  if (!c) throw new Error('cannot fit: ' + text);
  const { laid, total } = c;
  let y = (H - total) / 2;
  const parts = [];
  for (const l of laid) {
    if (l.rule) {
      const yy = Math.round(y + l.h / 2);
      parts.push(`<line x1="${W / 2 - 70}" y1="${yy}" x2="${W / 2 + 70}" y2="${yy}" stroke="${C.accent}" stroke-width="5"/>`);
      y += l.h; continue;
    }
    const base = Math.round(y + l.px * 0.94);
    const font = l.numeric ? SANS : SERIF;
    const weight = l.role === 'sub' ? 400 : (l.numeric ? 600 : 600);
    const fill = l.role === 'sub' ? C.ink2 : C.ink;
    parts.push(`<text x="${W / 2}" y="${base}" text-anchor="middle" font-family="${font}" font-size="${Math.round(l.px)}" font-weight="${weight}" fill="${fill}">${esc(l.text)}</text>`);
    y += l.h;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(text)}">
<title>${esc(title)}</title>
<rect width="${W}" height="${H}" fill="${C.paper}"/>
<rect x="56" y="56" width="${W - 112}" height="${H - 112}" fill="none" stroke="${C.ink}" stroke-width="4"/>
<rect x="68" y="68" width="${W - 136}" height="${H - 136}" fill="none" stroke="${C.ink}" stroke-width="1"/>
${parts.join('\n')}
</svg>
`;
}

// ── collect the cards the scenes ask for ───────────────────────────────────────────────────────────────────────
const sceneDir = path.join(CHAPTER, 'scenes');
const wanted = new Map();   // ref -> {id, text, scene}
for (const f of fs.readdirSync(sceneDir).filter(x => /\.scene\.json$/.test(x)).sort()) {
  const sc = JSON.parse(fs.readFileSync(path.join(sceneDir, f), 'utf8'));
  for (const m of sc.media || []) {
    if (m.kind !== 'generated' || !/\/cards\//.test(String(m.ref || ''))) continue;
    const mm = String(m.note || '').match(/ON-SCREEN TEXT:\s*([\s\S]*?)(?:\s+\|\s|$)/);
    if (!mm) { console.error(`! ${m.manifest_id} (${m.ref}) has no "ON-SCREEN TEXT:" in its note — skipped, nothing is invented here`); continue; }
    if (!wanted.has(m.ref)) wanted.set(m.ref, { id: m.manifest_id, text: mm[1].trim().replace(/\s+/g, ' '), scene: sc.id });
  }
}

let made = 0;
for (const [ref, w] of wanted) {
  const out = path.join(CHAPTER, ref);
  const body = svg(w.text, `${w.id} — ${w.text}`);
  console.log(`${DRY ? '[dry] ' : ''}${ref}  ${w.id}  "${w.text.slice(0, 70)}${w.text.length > 70 ? '…' : ''}"`);
  if (DRY) continue;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, body); made++;
  if (PNG) {
    const r = spawnSync('node', [path.join(ROOT, 'studio/tools/svg2png.mjs'), out, out.replace(/\.svg$/, '_1920x1080.png'), '1920x1080', '--bg', C.paper], { stdio: 'inherit' });
    if (r.status !== 0) console.error('  png export failed (svg is still valid)');
  }
}
if (!DRY) {
  const readme = path.join(CHAPTER, 'generated', 'cards', 'README.md');
  fs.writeFileSync(readme, `# C-series cards — Day 1\n\n` +
    `Generated by \`studio/tools/gen/c_cards.mjs\` on ${new Date().toISOString().slice(0, 10)}. **Do not edit these SVGs.**\n` +
    `The words come from each scene's own media entry, after \`ON-SCREEN TEXT:\` in its \`note\` — fix a card by fixing\n` +
    `the scene file and re-running the tool. ${wanted.size} cards, 1920x1080, house style (cream #efe6d3 / ink #2a2118 /\n` +
    `accent #b03a2e; Playfair Display + Source Sans 3), no overlays, no hovering type (D9).\n\n` +
    `| id | file | scene | on-screen text |\n|---|---|---|---|\n` +
    [...wanted.entries()].map(([ref, w]) => `| ${w.id} | \`${path.basename(ref)}\` | ${w.scene} | ${w.text.replace(/\|/g, '\\|')} |`).join('\n') + '\n');
}
console.log(`${made} card(s) written under ${path.join(CHAPTER, 'generated/cards')}`);
