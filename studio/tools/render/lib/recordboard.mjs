/**
 * recordboard — G-33, the circumnavigation record board, as a FILM graphic.
 *
 * Episode 1 scene 02 spends 145 seconds on the people who actually raced a fictional man. Six names and six
 * times is a table, and a table at 1080p is the thing D9 exists to stop. So it is a bar chart instead: one
 * series (days), a dashed vertical datum at Fogg's eighty, and every bar measured against it. The argument the
 * scene makes in words — "they all beat him, and it kept getting faster" — is then visible without being said.
 *
 * Rows appear in the order the narration names them, which happens also to be chronological, so the bars
 * shorten down the frame. That is the whole point and it costs nothing.
 *
 * Chart decisions, against studio/skills dataviz:
 *   · single series -> no legend; the kicker names the measure.
 *   · bars start at zero. There is no truncated axis anywhere in this file.
 *   · Fogg is INK, the racers ACCENT: a different entity class (the fiction being chased), not a different rank.
 *     Secondary-encoded by the dashed datum line and by the word "fiction", so it never relies on colour alone.
 *   · values and names wear text tokens (ink/sepia), never the series colour.
 *   · no hover layer: this is a video frame. The viewer cannot point at it. (D9: no interactivity, ever.)
 *   · direct label on every bar, which for seven bars is how the reader gets the number — the "never a number on
 *     every point" rule is about dense line charts, not a seven-row bar chart whose numbers ARE the content.
 *
 * Degrades: no records.json -> load() returns null and the renderer falls back to a pending card with a warning.
 */
import fs from 'node:fs';
import path from 'node:path';

export const PAPER = '#efe6d3', INK = '#241c14', SEPIA = '#5b4a3a', ACCENT = '#a8301f';

export function load(chapterDir) {
  const f = path.join(chapterDir, 'generated', 'g-33', 'records.json');
  if (!fs.existsSync(f)) return null;
  return { data: JSON.parse(fs.readFileSync(f, 'utf8')) };
}

/** beats: [{show:'row:bly'|'row:fogg', at:<s into the segment>}]. Unlisted rows are spaced evenly. */
export function planTimeline({ dur, rows, beats = [], draw = 0.9 }) {
  const at = {};
  for (const b of beats) if (b && b.show != null && isFinite(b.at)) at[b.show] = Math.max(0, Math.min(dur - 0.3, +b.at));
  const anyGiven = rows.some(r => at[`row:${r.key}`] !== undefined);
  const t0 = 0.6, t1 = Math.max(t0 + rows.length * 0.9, dur * 0.85);
  const plan = rows.map((r, i) => ({
    key: r.key,
    t: at[`row:${r.key}`] !== undefined ? at[`row:${r.key}`]
       : anyGiven ? null : t0 + (t1 - t0) * i / Math.max(1, rows.length - 1),
  }));
  // a row whose beat the cut never speaks is placed between its neighbours rather than dropped
  for (let i = 0; i < plan.length; i++) if (plan[i].t === null) {
    const prev = plan.slice(0, i).reverse().find(x => x.t !== null);
    const next = plan.slice(i + 1).find(x => x.t !== null);
    plan[i].t = prev && next ? (prev.t + next.t) / 2 : prev ? prev.t + draw + 0.5 : next ? Math.max(0.4, next.t - draw - 0.5) : dur * 0.5;
  }
  return { dur, draw, rows: plan };
}

/** Dense frames through each bar's draw, one held frame between. */
export function sampleTimes(tl, fps = 25) {
  const win = [];
  for (const r of tl.rows) win.push([Math.max(0, r.t - 0.1), Math.min(tl.dur, r.t + tl.draw + 0.5), 12.5]);
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
  const { data } = loaded;
  const sc = H / 1080;
  const px = n => (n * sc).toFixed(1);
  const cjk = lang === 'zh';
  const serif = cjk ? `'Noto Serif CJK SC','Noto Sans CJK SC',Georgia,serif` : `'Playfair Display',Georgia,'Liberation Serif',serif`;
  const sans = cjk ? `'Noto Sans CJK SC','Source Sans 3',system-ui,sans-serif` : `'Source Sans 3','Liberation Sans',system-ui,sans-serif`;

  const rows = data.rows;
  const L = 96 * sc, NAMEW = 470 * sc;             // left margin, name gutter
  const X0 = L + NAMEW, X1 = W - 300 * sc;         // bar baseline .. bar area right edge (label sits beyond)
  const perDay = (X1 - X0) / data.axis_max;
  const TOP = 214 * sc, BOT = H - 76 * sc;
  const step = (BOT - TOP) / rows.length;
  const barH = Math.min(52 * sc, step * 0.46);
  const rowY = i => TOP + step * i + step / 2;
  const datumX = X0 + data.datum * perDay;

  const S = [];
  S.push(`<rect width="${W}" height="${H}" fill="${PAPER}"/>`);
  S.push(`<rect width="${W}" height="${H}" fill="${INK}" filter="url(#fibre)" opacity="0.05"/>`);
  // kicker — one line, names the measure, so no legend is needed for a single series
  S.push(`<text x="${f1(L)}" y="${px(104)}" font-family="${sans}" font-weight="600" font-size="${px(38)}" ` +
    `letter-spacing="${px(4)}" fill="${SEPIA}">${esc((labels.title || data.title).toUpperCase())}</text>`);
  S.push(`<path d="M${f1(L)} ${px(140)}H${f1(W - L)}" stroke="${SEPIA}" stroke-width="${px(2)}" stroke-opacity="0.5"/>`);

  // the datum: a dashed vertical at Fogg's eighty, dropped once his row is up
  S.push(`<g id="datum" opacity="0"><path d="M${f1(datumX)} ${f1(TOP - 6 * sc)}V${f1(BOT)}" stroke="${INK}" ` +
    `stroke-width="${px(3)}" stroke-dasharray="${px(11)} ${px(9)}" stroke-opacity="0.62" fill="none"/></g>`);

  rows.forEach((r, i) => {
    const y = rowY(i), w = r.days * perDay;
    const isDatum = r.kind === 'datum';
    const col = isDatum ? INK : ACCENT;
    S.push(`<g class="row" data-row="${i}" opacity="0">`);
    S.push(`<text x="${f1(L)}" y="${f1(y + 2 * sc)}" font-family="${serif}" font-weight="700" font-size="${px(40)}" fill="${INK}">${esc(r.name)}</text>`);
    S.push(`<text x="${f1(L)}" y="${f1(y + 38 * sc)}" font-family="${sans}" font-size="${px(29)}" fill="${SEPIA}">${esc(r.sub)}</text>`);
    // bar: square at the zero baseline, 4px-rounded data end
    S.push(`<rect class="bar" data-w="${f1(w)}" x="${f1(X0)}" y="${f1(y - barH / 2)}" width="0" height="${f1(barH)}" rx="${px(4)}" fill="${col}"/>`);
    // Value wears a text token, never the series colour. It sits just past its own bar — EXCEPT where that would
    // run it into the dashed datum, which is most of the rows that matter (Fogg, Train, Bisland, 1993 all end
    // within a few days of eighty). Those are pushed clear to the right of the line instead, so the number is
    // never read through a dash. Width is estimated at 0.55 em, which is generous for this sans at these strings.
    const estW = r.value.length * 0.55 * 44 * sc;
    const near = X0 + w <= datumX && X0 + w + 22 * sc + estW > datumX - 10 * sc;
    const vx = near ? datumX + 24 * sc : X0 + w + 22 * sc;
    S.push(`<text class="val" x="${f1(vx)}" y="${f1(y + 15 * sc)}" font-family="${sans}" font-weight="600" ` +
      `font-size="${px(44)}" fill="${INK}" opacity="0">${esc(r.value)}</text>`);
    S.push(`</g>`);
  });

  const fontFace = fontsDir ? `
    @font-face{font-family:'Playfair Display';font-weight:700;src:url('file://${fontsDir}/PlayfairDisplay-700.woff2') format('woff2');}
    @font-face{font-family:'Source Sans 3';font-weight:600;src:url('file://${fontsDir}/SourceSans3-600.woff2') format('woff2');}
    @font-face{font-family:'Source Sans 3';font-weight:400;src:url('file://${fontsDir}/SourceSans3-400.woff2') format('woff2');}` : '';
  const RT = JSON.stringify({ tl, datumRow: rows.findIndex(r => r.kind === 'datum') });

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
const R = ${RT}, TL = R.tl;
const ease = p => p<=0?0 : p>=1?1 : (p<0.5 ? 2*p*p : 1-Math.pow(-2*p+2,2)/2);
const cl = (v,a,b) => Math.max(a,Math.min(b,v));
window.setT = function(t){
  TL.rows.forEach((r,i)=>{
    const g = document.querySelector('g.row[data-row="'+i+'"]'); if(!g) return;
    const on = t >= r.t;
    g.setAttribute('opacity', on ? cl((t-r.t)/0.35,0,1).toFixed(3) : '0');
    const bar = g.querySelector('rect.bar'), val = g.querySelector('text.val');
    const p = on ? ease(cl((t-r.t)/TL.draw,0,1)) : 0;
    if (bar) bar.setAttribute('width', ((+bar.dataset.w)*p).toFixed(1));
    // the number lands when its bar stops, not while it is still growing
    if (val) val.setAttribute('opacity', on ? cl((t-r.t-TL.draw*0.85)/0.3,0,1).toFixed(3) : '0');
  });
  const d = TL.rows[R.datumRow];
  const dl = document.getElementById('datum');
  if (dl) dl.setAttribute('opacity', d && t >= d.t + TL.draw*0.9 ? cl((t-d.t-TL.draw*0.9)/0.5,0,1).toFixed(3) : '0');
};
window.setT(0);
</script></body></html>`;
}
