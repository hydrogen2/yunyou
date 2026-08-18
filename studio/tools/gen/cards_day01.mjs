#!/usr/bin/env node
/**
 * cards_day01.mjs — builds the four typeset cards for Day 1 London (G-04, G-05, G-06, G-08) from the DATA block below,
 * then (unless --no-png) exports PNGs with studio/tools/svg2png.mjs.
 *
 *   node studio/tools/gen/cards_day01.mjs            # SVGs + PNGs for all four
 *   node studio/tools/gen/cards_day01.mjs g-04 g-08  # only some
 *   node studio/tools/cards_day01.mjs --no-png       # SVGs only
 *
 * House style: cream #efe6d3, ink #2a2118, secondary ink #5b4a3a, ONE accent #b03a2e; Playfair Display (titles/names),
 * Source Sans 3 (dates/numbers/body); no gradients, no shadows. Every string on a card is quoted or paraphrased from
 * research/fact-sheet.md (F-ids in each card's README) or the scene JSON — fix text HERE, not in the SVGs.
 */
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url'; import { spawnSync } from 'node:child_process';

const HERE = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const CHAPTER = path.join(ROOT, 'products/around-the-world-80-days/day-01-london');
const GEN = path.join(CHAPTER, 'generated');
const SVG2PNG = path.join(ROOT, 'studio/tools/svg2png.mjs');

// ───────────────────────────── DATA (edit text here) ─────────────────────────────
const C = { paper: '#efe6d3', ink: '#2a2118', ink2: '#5b4a3a', accent: '#b03a2e' };
const SERIF = "'Playfair Display', Georgia, serif";
const SANS = "'Source Sans 3', system-ui, sans-serif";

const G04 = { // scene 03-fogg-by-the-clock — F-01 (house), F-02 (times)
  kicker: 'DAILY TIME TABLE',
  title: 'Mr Phileas Fogg',
  sub: 'No. 7 Savile Row, Burlington Gardens — Wednesday 2 October 1872',
  colTime: 'Time', colLabel: 'Occupation',
  rows: [ // {time, ampm, label} — label = scene option text after the dash; NO feedback text on the card
    { time: '8:00', ampm: 'am', label: 'rises' },
    { time: '8:23', ampm: 'am', label: 'tea and toast' },
    { time: '9:37', ampm: 'am', label: 'shaving-water' },
    { time: '11:29', ampm: 'am', label: 'a new valet' },
    { time: '11:30', ampm: 'am', label: 'out to the club' },
    { time: '12:00', ampm: 'midnight', label: 'home' },
  ],
  footer: 'The same, every day — chapters I–II',
};

const G05 = { // scene 08-the-wager — F-08 (names), F-11 (stake, term, return), F-01 (Fogg's address), F-23 (Baring's)
  kicker: 'MEMORANDUM',
  title: 'The Wager',
  sub: 'Reform Club, Pall Mall — Wednesday 2 October 1872',
  body: [
    'That Mr Phileas Fogg shall go round the world',
    'in “eighty days or less”;',
    'that he stakes “twenty thousand at Baring’s” —',
    '“half of his fortune” — against the five undersigned;',
    'and that he shall be back “in this very room',
    'of the Reform Club” on',
  ],
  deadline: 'Saturday 21 December 1872 · 8:45 pm',
  stake: '£20,000',
  stakeNote: 'at Baring’s',
  signedHead: 'Signed — Stuart first, Fogg last',
  signatories: [
    { name: 'Andrew Stuart', role: 'engineer' },
    { name: 'John Sullivan', role: 'banker' },
    { name: 'Samuel Fallentin', role: 'banker' },
    { name: 'Thomas Flanagan', role: 'brewer' },
    { name: 'Gauthier Ralph', role: 'Bank of England' },
    { name: 'Phileas Fogg', role: 'No. 7 Savile Row' },
  ],
  seal: { big: '80', small: 'DAYS' },
  footer: 'Eighty days: 1,920 hours, or 115,200 minutes.',
};

const G06 = { // scene 09-two-real-men — F-35 (Cook), F-36 (Train), F-11 (Fogg's 80 days / 21 Dec)
  kicker: 'TWO REAL MEN WERE DOING IT',
  title: 'Cook · Train',
  sub: 'Round the world as Verne wrote — both going west',
  left: {
    name: 'Thomas Cook',
    tag: 'the first commercial round-the-world tour',
    rows: [
      ['26 September 1872', 'sails from Liverpool'],
      ['2 October 1872', 'mid-Atlantic — the day Fogg leaves London'],
      ['', 'New York → across America → Yokohama → Asia → home'],
      ['', 'letters home to The Times'],
      ['222 days', 'nearly 48,000 km (30,000 miles)'],
    ],
  },
  right: {
    name: 'George Francis Train',
    tag: 'American — and, he said, the real Fogg',
    rows: [
      ['10 July 1870', 'leaves New York'],
      ['1 August 1870', 'sails from San Francisco'],
      ['26 August 1870', 'Yokohama'],
      ['22 October 1870', 'Marseille — then jailed in Lyon'],
      ['21 December 1870', 'home — Fogg’s date, two years early'],
      ['164 days', 'he claimed 80 “travelling” days'],
    ],
    quote: 'He later claimed: “Verne stole my thunder. I’m Phileas Fogg.”',
    later: 'Later rounds: 67½ days (1890), 60 days (1892)',
  },
  tally: 'Cook 222 · Train 164 · Fogg 80',
  tallyNote: 'days round the world',
};

const G08 = { // scene 19-souvenir — F-06 (menu), F-27 (Reading sauce), F-11 (deadline, motto)
  kicker: 'SOUVENIR · DAY 1 LONDON',
  title: 'Fogg’s last breakfast',
  sub: 'Reform Club, Wednesday 2 October 1872 — the meal before the wager',
  menuHead: 'The menu, from chapter III',
  menu: [
    '“a broiled fish with Reading sauce,',
    'a scarlet slice of roast beef garnished with mushrooms,',
    'a rhubarb and gooseberry tart,',
    'and a morsel of Cheshire cheese, the whole being washed down',
    'with several cups of tea, for which the Reform is famous.”',
  ],
  dishHead: 'The dish',
  dish: ['Broiled fish with', 'a Reading-sauce-style ketchup'],
  sauceNote: 'Reading sauce — James Cocks, fishmonger, Reading, from 1802; gone since the 1960s',
  ingHead: 'For the sauce',
  ingredients: [['walnut ketchup', 'mushroom ketchup', 'soy'], ['anchovies', 'chillies', 'garlic']],
  method: ['Simmer everything together until glossy;', 'broil the fish and spoon the sauce over.'],
  lastLine: 'Cook it on the evening of 21 December, and be at table by 8:45 pm.',
  motto: '“A well-used minimum suffices for everything.”',
  vignette: { file: path.join(GEN, 'g-08/src/M-23.jpg'), credit: 'Reform Club saloon, London Interiors (1841)' },
  footer1: 'Yunyou · Around the World in 80 Days · Day 1 London · vignette: London Interiors (1841), PD',
  footer2: 'Text © Yunyou 2026 — CC BY-SA 4.0 (provisional)',
};
// ─────────────────────────────────────────────────────────────────────────────────

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const T = (x, y, s, o = {}) => {
  const f = o.sans ? SANS : SERIF;
  const a = [`x="${x}"`, `y="${y}"`, `font-family="${f}"`, `font-size="${o.size || 40}"`, `fill="${o.fill || C.ink}"`];
  if (o.weight) a.push(`font-weight="${o.weight}"`); if (o.italic) a.push('font-style="italic"');
  if (o.anchor) a.push(`text-anchor="${o.anchor}"`); if (o.ls) a.push(`letter-spacing="${o.ls}"`);
  if (o.cls) a.push(`class="${o.cls}"`); if (o.op) a.push(`opacity="${o.op}"`);
  return `<text ${a.join(' ')}>${esc(s)}</text>`;
};
const rule = (x1, y, x2, o = {}) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${o.stroke || C.ink}" stroke-width="${o.w || 2}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.op ? ` opacity="${o.op}"` : ''}/>`;
const vrule = (x, y1, y2, o = {}) => `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${o.stroke || C.ink}" stroke-width="${o.w || 2}"/>`;
const frame = (W, H, m, o = {}) => `<rect x="${m}" y="${m}" width="${W - 2 * m}" height="${H - 2 * m}" fill="none" stroke="${C.ink}" stroke-width="${o.w || 3}"/>` +
  (o.inner ? `<rect x="${m + o.inner}" y="${m + o.inner}" width="${W - 2 * (m + o.inner)}" height="${H - 2 * (m + o.inner)}" fill="none" stroke="${C.ink}" stroke-width="1"/>` : '');
const svgOpen = (W, H, title, extra = '') => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<style>text{font-kerning:normal} .row rect.hit{fill:${C.ink};fill-opacity:0;cursor:pointer} .row:hover rect.hit,.row:focus rect.hit{fill-opacity:.07} .row:focus{outline:none}</style>
${extra}<rect width="${W}" height="${H}" fill="${C.paper}"/>
`;
const svgClose = `</svg>\n`;

// ── G-04 timetable ───────────────────────────────────────────────────────────────
function g04() {
  const W = 2176, H = 1812, m = 72;
  let s = svgOpen(W, H, `${G04.title} — daily timetable, ${G04.sub}`);
  s += frame(W, H, m, { w: 4, inner: 12 });
  const cx = W / 2;
  s += T(cx, 210, G04.kicker, { sans: true, size: 34, weight: 600, fill: C.ink2, anchor: 'middle', ls: 10 });
  s += T(cx, 330, G04.title, { size: 112, weight: 700, anchor: 'middle' });
  s += T(cx, 400, G04.sub, { sans: true, size: 42, fill: C.ink2, anchor: 'middle' });
  s += rule(m + 96, 450, W - m - 96, { stroke: C.accent, w: 5 });
  // columns
  const x0 = m + 60, x1 = W - m - 60, xTime = 760, xLabel = 900;
  const yHead = 540;
  s += T(xTime, yHead, G04.colTime, { sans: true, size: 32, weight: 600, fill: C.ink2, anchor: 'end', ls: 6 });
  s += T(xLabel + 60, yHead, G04.colLabel, { sans: true, size: 32, weight: 600, fill: C.ink2, ls: 6 });
  s += rule(x0, yHead + 24, x1, { w: 2 });
  const rowH = 172, yTop = yHead + 26;
  G04.rows.forEach((r, i) => {
    const y = yTop + i * rowH, base = y + rowH / 2 + 26;
    s += `<g class="row" id="row-${i + 1}" data-option="${i}" role="button" tabindex="0" aria-label="${esc(`${r.time} ${r.ampm} — ${r.label}`)}">`;
    s += `<rect class="hit" x="${x0}" y="${y}" width="${x1 - x0}" height="${rowH}"/>`;
    s += T(xTime, base, r.time, { sans: true, size: 88, weight: 600, anchor: 'end' });
    s += T(xTime + 14, base, r.ampm, { sans: true, size: 30, fill: C.ink2 });
    s += T(xLabel + 60, base - 4, r.label, { size: 66 });
    if (i < G04.rows.length - 1) s += rule(x0, y + rowH, x1, { w: 1.5, dash: '2 8', op: 0.7 });
    s += `</g>`;
  });
  s += rule(x0, yTop + G04.rows.length * rowH, x1, { w: 2 });
  s += T(cx, H - m - 60, G04.footer, { sans: true, size: 30, fill: C.ink2, anchor: 'middle', ls: 4 });
  return s + svgClose;
}

// ── G-05 memorandum ──────────────────────────────────────────────────────────────
function g05() {
  const W = 1920, H = 1080, m = 48;
  let s = svgOpen(W, H, `Memorandum of the wager — ${G05.sub}`);
  s += frame(W, H, m, { w: 3, inner: 8 });
  const cx = W / 2;
  s += T(cx, 130, G05.kicker, { sans: true, size: 26, weight: 600, fill: C.ink2, anchor: 'middle', ls: 10 });
  s += T(cx, 215, G05.title, { size: 84, weight: 700, anchor: 'middle' });
  s += T(cx, 268, G05.sub, { sans: true, size: 32, fill: C.ink2, anchor: 'middle' });
  s += rule(cx - 560, 300, cx + 560, { stroke: C.accent, w: 4 });
  // left: body text
  const lx = 128; let y = 380;
  G05.body.forEach(line => { s += T(lx, y, line, { size: 36 }); y += 54; });
  y += 34;
  s += T(lx, y, G05.deadline, { sans: true, size: 50, weight: 600 }); y += 60;
  // stake box
  const by = y + 26;
  s += rule(lx, by, lx + 640, { w: 2 });
  s += T(lx, by + 92, G05.stake, { sans: true, size: 96, weight: 600 });
  s += T(lx + 400, by + 92, G05.stakeNote, { size: 36, italic: true, fill: C.ink2 });
  s += rule(lx, by + 122, lx + 640, { w: 2 });
  // seal (the one accent object besides the rule)
  const sx = 990, sy = 848;
  s += `<circle cx="${sx}" cy="${sy}" r="96" fill="none" stroke="${C.accent}" stroke-width="5"/><circle cx="${sx}" cy="${sy}" r="84" fill="none" stroke="${C.accent}" stroke-width="1.5"/>`;
  s += T(sx, sy + 22, G05.seal.big, { size: 84, weight: 700, fill: C.accent, anchor: 'middle' });
  s += T(sx, sy + 58, G05.seal.small, { sans: true, size: 24, weight: 600, fill: C.accent, anchor: 'middle', ls: 6 });
  // right: signatories
  const rx = 1220, rw = 580; let ry = 372;
  s += vrule(1150, 350, 960, { w: 1.5 });
  s += T(rx, ry, G05.signedHead, { sans: true, size: 26, weight: 600, fill: C.ink2, ls: 4 }); ry += 44;
  G05.signatories.forEach(p => {
    ry += 46;
    s += T(rx, ry, p.name, { size: 40, italic: true });
    s += T(rx + rw, ry, p.role, { sans: true, size: 22, fill: C.ink2, anchor: 'end' });
    s += rule(rx, ry + 16, rx + rw, { w: 1, op: 0.55 });
    ry += 42;
  });
  s += T(cx, H - m - 32, G05.footer, { sans: true, size: 26, fill: C.ink2, anchor: 'middle' });
  return s + svgClose;
}

// ── G-06 Cook · Train ────────────────────────────────────────────────────────────
function g06() {
  const W = 2176, H = 1812, m = 72;
  let s = svgOpen(W, H, `${G06.title} — ${G06.kicker}`);
  s += frame(W, H, m, { w: 4, inner: 12 });
  const cx = W / 2;
  s += T(cx, 200, G06.kicker, { sans: true, size: 32, weight: 600, fill: C.ink2, anchor: 'middle', ls: 10 });
  s += T(cx, 320, G06.title, { size: 112, weight: 700, anchor: 'middle' });
  s += T(cx, 388, G06.sub, { sans: true, size: 40, fill: C.ink2, anchor: 'middle' });
  s += rule(m + 96, 436, W - m - 96, { stroke: C.accent, w: 5 });
  const top = 520, bottom = 1500;
  s += vrule(cx, top, bottom + 30, { w: 2 });
  const col = (x, w, d) => {
    let y = top + 40;
    s += T(x, y, d.name, { size: 68, weight: 700 }); y += 50;
    s += T(x, y, d.tag, { sans: true, size: 32, italic: true, fill: C.ink2 }); y += 70;
    d.rows.forEach(([date, label]) => {
      if (date) { s += T(x, y, date, { sans: true, size: 40, weight: 600 }); y += 48; s += T(x, y, label, { size: 34 }); }
      else { s += T(x, y + 6, label, { size: 34, fill: C.ink2 }); y += 6; }
      y += 22; s += rule(x, y, x + w, { w: 1, dash: '2 8', op: 0.6 }); y += 62;
    });
    if (d.quote) { y += 4; s += T(x, y, d.quote, { size: 34, italic: true }); y += 60; }
    if (d.later) s += T(x, y, d.later, { sans: true, size: 30, fill: C.ink2 });
  };
  col(m + 80, cx - m - 160, G06.left);
  col(cx + 80, cx - m - 160, G06.right);
  s += rule(m + 96, 1560, W - m - 96, { w: 2 });
  s += T(cx, 1650, G06.tally, { sans: true, size: 64, weight: 600, anchor: 'middle' });
  s += T(cx, 1700, G06.tallyNote, { sans: true, size: 30, fill: C.ink2, anchor: 'middle', ls: 4 });
  return s + svgClose;
}

// ── G-08 souvenir (portrait + landscape) ─────────────────────────────────────────
function vignetteData() {
  try { const b = fs.readFileSync(G08.vignette.file); return `data:image/jpeg;base64,${b.toString('base64')}`; }
  catch { return null; }
}
const GREY = `<defs><filter id="grey"><feColorMatrix type="saturate" values="0"/></filter></defs>`;
function g08(orient) {
  const P = orient === 'portrait';
  const W = P ? 1080 : 1920, H = P ? 1920 : 1080, m = P ? 40 : 40;
  const vig = vignetteData();
  let s = svgOpen(W, H, `${G08.title} — souvenir recipe card`, GREY);
  s += frame(W, H, m, { w: 3, inner: 8 });
  const cx = W / 2;
  if (P) {
    s += T(cx, 130, G08.kicker, { sans: true, size: 24, weight: 600, fill: C.ink2, anchor: 'middle', ls: 8 });
    s += T(cx, 215, G08.title, { size: 76, weight: 700, anchor: 'middle' });
    s += T(cx, 262, G08.sub, { sans: true, size: 26, fill: C.ink2, anchor: 'middle' });
    s += rule(140, 296, W - 140, { stroke: C.accent, w: 4 });
    // vignette
    let y = 330;
    if (vig) { const vw = 520, vh = Math.round(vw * 521 / 632); s += `<image href="${vig}" x="${cx - vw / 2}" y="${y}" width="${vw}" height="${vh}" filter="url(#grey)" opacity="0.85"/>`; y += vh + 40; s += T(cx, y - 8, G08.vignette.credit, { sans: true, size: 20, fill: C.ink2, anchor: 'middle' }); y += 60; }
    const lx = 110, wcol = W - 220;
    s += T(lx, y, G08.menuHead, { sans: true, size: 22, weight: 600, fill: C.ink2, ls: 4 }); y += 44;
    G08.menu.forEach(l => { s += T(lx, y, l, { size: 27, italic: true }); y += 40; });
    y += 30; s += rule(lx, y, lx + wcol, { w: 1.5 }); y += 60;
    s += T(lx, y, G08.dishHead, { sans: true, size: 22, weight: 600, fill: C.ink2, ls: 4 }); y += 46;
    s += T(lx, y, G08.dish.join(' '), { size: 38, weight: 700 }); y += 42;
    s += T(lx, y, G08.sauceNote, { sans: true, size: 22, fill: C.ink2 }); y += 64;
    s += T(lx, y, G08.ingHead, { sans: true, size: 22, weight: 600, fill: C.ink2, ls: 4 }); y += 46;
    G08.ingredients.forEach(r => { s += T(lx, y, r.join(' · '), { sans: true, size: 32 }); y += 46; }); y += 8;
    G08.method.forEach(l => { s += T(lx, y, l, { size: 26 }); y += 38; }); y += 40;
    s += rule(lx, y, lx + wcol, { stroke: C.accent, w: 3 }); y += 64;
    s += T(cx, y, G08.lastLine, { size: 30, italic: true, weight: 700, anchor: 'middle' }); y += 52;
    s += T(cx, y, G08.motto, { size: 24, italic: true, fill: C.ink2, anchor: 'middle' });
    s += T(cx, H - m - 62, G08.footer1, { sans: true, size: 19, fill: C.ink2, anchor: 'middle' });
    s += T(cx, H - m - 34, G08.footer2, { sans: true, size: 19, fill: C.ink2, anchor: 'middle' });
  } else {
    s += T(cx, 112, G08.kicker, { sans: true, size: 24, weight: 600, fill: C.ink2, anchor: 'middle', ls: 8 });
    s += T(cx, 190, G08.title, { size: 76, weight: 700, anchor: 'middle' });
    s += T(cx, 236, G08.sub, { sans: true, size: 26, fill: C.ink2, anchor: 'middle' });
    s += rule(cx - 520, 268, cx + 520, { stroke: C.accent, w: 4 });
    // left column: menu + vignette; right column: recipe
    const lx = 110, lw = 780; let y = 340;
    s += T(lx, y, G08.menuHead, { sans: true, size: 22, weight: 600, fill: C.ink2, ls: 4 }); y += 44;
    G08.menu.forEach(l => { s += T(lx, y, l, { size: 25, italic: true }); y += 38; });
    y += 30;
    if (vig) { const vw = 300, vh = Math.round(vw * 521 / 632); s += `<image href="${vig}" x="${lx}" y="${y}" width="${vw}" height="${vh}" filter="url(#grey)" opacity="0.85"/>`; s += T(lx + vw + 24, y + 30, G08.vignette.credit, { sans: true, size: 20, fill: C.ink2 }); }
    s += vrule(960, 320, 900, { w: 1.5 });
    const rx = 1010, rw = 820; y = 340;
    s += T(rx, y, G08.dishHead, { sans: true, size: 22, weight: 600, fill: C.ink2, ls: 4 }); y += 46;
    G08.dish.forEach(l => { s += T(rx, y, l, { size: 38, weight: 700 }); y += 46; }); y -= 4;
    s += T(rx, y, G08.sauceNote, { sans: true, size: 21, fill: C.ink2 }); y += 64;
    s += T(rx, y, G08.ingHead, { sans: true, size: 22, weight: 600, fill: C.ink2, ls: 4 }); y += 46;
    G08.ingredients.forEach(r => { s += T(rx, y, r.join(' · '), { sans: true, size: 32 }); y += 44; }); y += 6;
    G08.method.forEach(l => { s += T(rx, y, l, { size: 24 }); y += 34; }); y += 40;
    s += rule(rx, y, rx + rw, { stroke: C.accent, w: 3 }); y += 60;
    s += T(rx, y, G08.lastLine, { size: 28, italic: true, weight: 700 }); y += 50;
    s += T(rx, y, G08.motto, { size: 24, italic: true, fill: C.ink2 });
    s += T(cx, H - m - 56, G08.footer1, { sans: true, size: 19, fill: C.ink2, anchor: 'middle' });
    s += T(cx, H - m - 30, G08.footer2, { sans: true, size: 19, fill: C.ink2, anchor: 'middle' });
  }
  return s + svgClose;
}

// ── build ────────────────────────────────────────────────────────────────────────
const JOBS = {
  'g-04': [{ file: 'g-04/fogg-timetable-card.svg', make: g04, sizes: '2176x1812,1920x1080' }],
  'g-05': [{ file: 'g-05/memorandum-card.svg', make: g05, sizes: '1920x1080,3840x2160,2176x1812' }],
  'g-06': [{ file: 'g-06/two-real-men-card.svg', make: g06, sizes: '2176x1812,1920x1080' }],
  'g-08': [
    { file: 'g-08/souvenir-breakfast-card_1080x1920.svg', make: () => g08('portrait'), sizes: '1080x1920' },
    { file: 'g-08/souvenir-breakfast-card_1920x1080.svg', make: () => g08('landscape'), sizes: '1920x1080' },
    { file: 'g-08/souvenir-breakfast-card.svg', make: () => g08('landscape'), sizes: '' }, // scene ref = copy of landscape
  ],
};
const argv = process.argv.slice(2); const noPng = argv.includes('--no-png');
const want = argv.filter(a => !a.startsWith('--')); const ids = want.length ? want : Object.keys(JOBS);
for (const id of ids) {
  for (const j of JOBS[id] || []) {
    const out = path.join(GEN, j.file); fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, j.make()); console.log('wrote', path.relative(ROOT, out));
    if (!noPng && j.sizes) {
      const png = out.replace(/\.svg$/, j.sizes.includes(',') ? '@.png' : '.png');
      const r = spawnSync('node', [SVG2PNG, out, png, j.sizes, '--bg', C.paper], { stdio: 'inherit' });
      if (r.status !== 0) console.error('svg2png failed for', j.file);
    }
  }
}
