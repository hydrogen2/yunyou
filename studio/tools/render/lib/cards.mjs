/**
 * cards — the shared generator for the film's typographic and diagram cards.
 *
 * Episode 1 asked for twenty-one "generated assets" that are mostly one date, one number, or two labelled
 * things. Building twenty-one bespoke files would produce twenty-one slightly different type scales, which is
 * how a house look dies. So: one module, one small grammar, one card.json per asset.
 *
 * Six card types, chosen by looking at what the episode actually needs rather than by inventing a system:
 *   lines     a stack of lines, revealed in order            (a date card, a pair of statistics, a quotation)
 *   figure    one enormous number or word, plus a caption    ("80")
 *   timeline  dated points along a horizontal axis           (bespoke 1755 vs tailors 1803; the twelve crosses)
 *   measure   a line with two ends named and a distance      (Savile Row's 280 m; No. 1 to No. 7)
 *   pair      two labelled things side by side               (the ballot's two balls; Carlton vs Reform)
 *   compare   labelled bars against each other               (London against Beijing, Paris, New York)
 *
 * Everything reveals on the narration clock, like the map and the record board: `beats` name a row key and a
 * sentence index, and anything the cut does not speak is spaced evenly instead of vanishing.
 *
 * The type scale lives HERE and nowhere else. If a card wants a size that is not on it, the answer is usually
 * that the card is trying to say too much.
 *
 * Degrades: no card.json -> load() returns null -> the renderer emits a pending card and warns.
 */
import fs from 'node:fs';
import path from 'node:path';

export const PAPER = '#efe6d3', INK = '#241c14', SEPIA = '#5b4a3a', ACCENT = '#a8301f';

/** The house type scale, in 1080p px. Nothing in a card may invent a size. */
const T = { kicker: 34, figure: 300, big: 92, mid: 60, small: 37, tiny: 28 };

export function load(chapterDir, id) {
  const f = path.join(chapterDir, 'generated', String(id).toLowerCase(), 'card.json');
  if (!fs.existsSync(f)) return null;
  return { data: JSON.parse(fs.readFileSync(f, 'utf8')), id };
}

/** Every card type reduces to an ordered list of keys that appear one after another. */
function keysOf(card) {
  switch (card.type) {
    case 'lines':    return (card.lines || []).map(l => l.key);
    case 'figure':   return ['figure'];
    case 'timeline': return (card.points || []).map(p => p.key);
    case 'measure':  return ['line', 'value'];
    case 'pair':     return ['left', 'right', 'note'].filter(k => card[k]);
    case 'compare':  return (card.rows || []).map(r => r.key);
    default:         return [];
  }
}

export function planTimeline({ dur, card, beats = [], draw = 0.7 }) {
  const at = {};
  for (const b of beats) if (b && b.show != null && isFinite(b.at)) at[b.show] = Math.max(0, Math.min(dur - 0.2, +b.at));
  const keys = keysOf(card);
  const anyGiven = keys.some(k => at[k] !== undefined);
  const t0 = 0.4, t1 = Math.max(t0 + keys.length * 0.7, dur * 0.72);
  const vals = keys.map((k, i) => at[k] !== undefined ? at[k]
    : anyGiven ? null : (keys.length === 1 ? t0 : t0 + (t1 - t0) * i / (keys.length - 1)));
  for (let i = 0; i < vals.length; i++) if (vals[i] === null) {
    const prev = vals.slice(0, i).reverse().find(v => v != null);
    const next = vals.slice(i + 1).find(v => v != null);
    vals[i] = prev != null && next != null ? (prev + next) / 2 : prev != null ? prev + 0.9 : next != null ? Math.max(0.3, next - 0.9) : dur * 0.5;
  }
  const show = {}; keys.forEach((k, i) => { show[k] = vals[i]; });
  return { dur, draw, show, keys };
}

export function sampleTimes(tl, fps = 25) {
  const win = Object.values(tl.show).map(t => [Math.max(0, t - 0.1), Math.min(tl.dur, t + tl.draw + 0.5), 12.5]);
  win.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const w of win) {
    const last = merged[merged.length - 1];
    if (last && w[0] <= last[1] + 0.001) { last[1] = Math.max(last[1], w[1]); last[2] = Math.max(last[2], w[2]); }
    else merged.push([...w]);
  }
  const ts = []; let cursor = 0;
  for (const [a, b, r] of merged) {
    if (a > cursor + 0.001) ts.push(cursor);
    for (let t = Math.max(cursor, a); t < b; t += 1 / r) ts.push(t);
    cursor = Math.max(cursor, b);
  }
  if (cursor < tl.dur - 0.001) ts.push(cursor);
  const uniq = ts.sort((a, b) => a - b).filter((t, i, A) => i === 0 || t - A[i - 1] > 1 / (fps * 2));
  return uniq.map((t, i) => ({ t, dur: (i + 1 < uniq.length ? uniq[i + 1] : tl.dur) - t })).filter(x => x.dur > 0.001);
}

const esc = (s = '') => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const f1 = v => (Math.round(v * 10) / 10).toString();

export function page({ loaded, W, H, tl, lang = 'en', labels = {}, fontsDir }) {
  const card = loaded.data;
  const sc = H / 1080;
  const px = n => (n * sc).toFixed(1);
  const cjk = lang === 'zh';
  const serif = cjk ? `'Noto Serif CJK SC','Noto Sans CJK SC',Georgia,serif` : `'Playfair Display',Georgia,'Liberation Serif',serif`;
  const sans = cjk ? `'Noto Sans CJK SC','Source Sans 3',system-ui,sans-serif` : `'Source Sans 3','Liberation Sans',system-ui,sans-serif`;
  // the locale may replace any string by key; anything it does not name stays in the authored language
  const t = (k, fallback) => (labels[k] !== undefined ? labels[k] : fallback);

  const L = 120 * sc, R = W - 120 * sc, MIDX = W / 2;
  const S = [];
  S.push(`<rect width="${W}" height="${H}" fill="${PAPER}"/>`);
  S.push(`<rect width="${W}" height="${H}" fill="${INK}" filter="url(#fibre)" opacity="0.05"/>`);
  if (card.kicker) {
    S.push(`<text x="${f1(L)}" y="${px(108)}" font-family="${sans}" font-weight="600" font-size="${px(T.kicker)}" ` +
      `letter-spacing="${px(4)}" fill="${SEPIA}">${esc(t('kicker', card.kicker).toUpperCase())}</text>`);
    S.push(`<path d="M${f1(L)} ${px(146)}H${f1(R)}" stroke="${SEPIA}" stroke-width="${px(2)}" stroke-opacity="0.45"/>`);
  }
  const g = (key, body) => S.push(`<g class="rev" data-key="${key}" opacity="0">${body}</g>`);
  const txt = (x, y, s, { size = 'mid', font = serif, weight = 700, fill = INK, anchor = 'start', ls = 0 } = {}) =>
    `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" font-family="${font}" font-weight="${weight}" ` +
    `font-size="${px(T[size])}" letter-spacing="${px(ls)}" fill="${fill}">${esc(s)}</text>`;

  const top = card.kicker ? 240 * sc : 170 * sc, bot = H - (card.footnote ? 190 : 130) * sc;

  if (card.type === 'lines') {
    const ls = card.lines || [];
    // Distributed by default, which suits a list. `spread:"tight"` stacks them at a fixed leading around the
    // middle instead — two lines that are one thought (a quotation and who said it) should not sit at opposite
    // ends of the frame, which is what even distribution does to them.
    const tight = card.spread === 'tight';
    const lead = 132 * sc, block = lead * (ls.length - 1);
    const step = (bot - top) / ls.length;
    ls.forEach((l, i) => {
      const y = tight ? (top + bot) / 2 - block / 2 + lead * i : top + step * i + step * 0.52;
      const size = l.size || 'big';
      let b = txt(L, y, t(`${l.key}.text`, l.text), { size, font: l.font === 'sans' ? sans : serif });
      if (l.sub) b += txt(L, y + (T[size] * 0.52 + 16) * sc, t(`${l.key}.sub`, l.sub), { size: 'small', font: sans, weight: 400, fill: SEPIA });
      g(l.key, b);
    });
  }
  else if (card.type === 'figure') {
    g('figure', txt(MIDX, H * 0.545, t('figure', card.figure), { size: 'figure', anchor: 'middle' }) +
      (card.caption ? txt(MIDX, H * 0.545 + 96 * sc, t('caption', card.caption), { size: 'mid', font: sans, weight: 400, fill: SEPIA, anchor: 'middle' }) : ''));
  }
  else if (card.type === 'timeline') {
    const ax = card.axis || {}, min = ax.min, max = ax.max, y = H * 0.54;
    const X = v => L + (R - L) * (v - min) / (max - min || 1);
    S.push(`<path d="M${f1(L)} ${f1(y)}H${f1(R)}" stroke="${SEPIA}" stroke-width="${px(3)}" stroke-opacity="0.55"/>`);
    (card.points || []).forEach((p, i) => {
      const x = X(p.at), up = i % 2 === 0;
      const ly = up ? y - 46 * sc : y + 96 * sc;
      // a centred label on the first or last point hangs half off the frame; anchor those to the inside instead
      const near = (R - L) * 0.10;
      const anch = x < L + near ? 'start' : x > R - near ? 'end' : 'middle';
      // a point with no label is just a dot: the twelve Eleanor crosses want twelve marks and three names.
      g(p.key, `<circle cx="${f1(x)}" cy="${f1(y)}" r="${px(p.label ? 15 : 9)}" fill="${ACCENT}" stroke="${PAPER}" stroke-width="${px(p.label ? 4 : 3)}" ${p.label ? '' : 'fill-opacity="0.55"'}/>` +
        (p.label ? txt(x, ly, t(`${p.key}.label`, p.label), { size: 'mid', anchor: anch }) : '') +
        (p.sub ? txt(x, ly + (up ? -50 : 46) * sc, t(`${p.key}.sub`, p.sub), { size: 'small', font: sans, weight: 400, fill: SEPIA, anchor: anch }) : ''));
    });
  }
  else if (card.type === 'measure') {
    const y = H * 0.52, a = L + 60 * sc, b = R - 60 * sc;
    g('line', `<path d="M${f1(a)} ${f1(y)}H${f1(b)}M${f1(a)} ${f1(y - 26 * sc)}V${f1(y + 26 * sc)}M${f1(b)} ${f1(y - 26 * sc)}V${f1(y + 26 * sc)}" ` +
      `stroke="${ACCENT}" stroke-width="${px(6)}" fill="none"/>` +
      txt(a, y + 84 * sc, t('from', card.from), { size: 'small', font: sans, weight: 600, fill: SEPIA }) +
      txt(b, y + 84 * sc, t('to', card.to), { size: 'small', font: sans, weight: 600, fill: SEPIA, anchor: 'end' }));
    g('value', txt(MIDX, y - 60 * sc, t('value', card.value), { size: 'big', anchor: 'middle' }));
  }
  else if (card.type === 'pair') {
    [['left', W * 0.28], ['right', W * 0.72]].forEach(([k, x]) => {
      const o = card[k]; if (!o) return;
      g(k, txt(x, H * 0.47, t(`${k}.label`, o.label), { size: 'big', anchor: 'middle' }) +
        (o.sub ? txt(x, H * 0.47 + 74 * sc, t(`${k}.sub`, o.sub), { size: 'small', font: sans, weight: 400, fill: SEPIA, anchor: 'middle' }) : ''));
    });
    if (card.note) g('note', txt(MIDX, H * 0.74, t('note', card.note), { size: 'mid', font: sans, weight: 600, anchor: 'middle', fill: ACCENT }));
  }
  else if (card.type === 'compare') {
    const rows = card.rows || [], step = (bot - top) / rows.length;
    const maxN = Math.max(...rows.map(r => r.num));
    const bx = L + 420 * sc, bw = R - bx - 260 * sc;
    rows.forEach((r, i) => {
      const y = top + step * i + step * 0.5, h = Math.min(58 * sc, step * 0.42);
      g(r.key, txt(L, y + 14 * sc, t(`${r.key}.label`, r.label), { size: 'mid' }) +
        `<rect class="bar" data-w="${f1(bw * r.num / maxN)}" x="${f1(bx)}" y="${f1(y - h / 2)}" width="0" height="${f1(h)}" rx="${px(4)}" fill="${r.emphasis ? ACCENT : SEPIA}" fill-opacity="${r.emphasis ? 1 : 0.5}"/>` +
        txt(bx + bw * r.num / maxN + 22 * sc, y + 16 * sc, t(`${r.key}.value`, r.value), { size: 'mid', font: sans, weight: 600 }));
    });
  }

  if (card.footnote)
    S.push(`<text x="${f1(L)}" y="${f1(H - 76 * sc)}" font-family="${sans}" font-size="${px(T.tiny)}" fill="${SEPIA}" opacity="0.85">${esc(t('footnote', card.footnote))}</text>`);

  const fontFace = fontsDir ? `
    @font-face{font-family:'Playfair Display';font-weight:700;src:url('file://${fontsDir}/PlayfairDisplay-700.woff2') format('woff2');}
    @font-face{font-family:'Source Sans 3';font-weight:600;src:url('file://${fontsDir}/SourceSans3-600.woff2') format('woff2');}
    @font-face{font-family:'Source Sans 3';font-weight:400;src:url('file://${fontsDir}/SourceSans3-400.woff2') format('woff2');}` : '';

  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>
${fontFace}
html,body{margin:0;padding:0;width:${W}px;height:${H}px;background:${PAPER};overflow:hidden}
svg{display:block}
</style></head><body>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
<defs><filter id="fibre" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter></defs>
${S.join('\n')}
</svg>
<script>
const SHOW = ${JSON.stringify(tl.show)}, DRAW = ${tl.draw};
const ease = p => p<=0?0 : p>=1?1 : (p<0.5 ? 2*p*p : 1-Math.pow(-2*p+2,2)/2);
const cl = (v,a,b) => Math.max(a,Math.min(b,v));
window.setT = function(t){
  for (const g of document.querySelectorAll('g.rev')){
    const at = SHOW[g.dataset.key];
    const on = at!=null && t>=at;
    g.setAttribute('opacity', on ? cl((t-at)/0.35,0,1).toFixed(3) : '0');
    const bar = g.querySelector('rect.bar');
    if (bar) bar.setAttribute('width', on ? ((+bar.dataset.w)*ease(cl((t-at)/DRAW,0,1))).toFixed(1) : '0');
  }
};
window.setT(0);
</script></body></html>`;
}
