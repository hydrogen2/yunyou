/**
 * walkmap — G-38, the half-mile card, as a FILM graphic.
 *
 * Episode 1 scene 07 exists because the founder found the London topics unmoored: "t7 to t11 seem disconnected
 * from the novel without even a mention of fogg, makes me wonder why are we seeing those here." The answer the
 * scene gives is geographic — three addresses, one corner of London — and this is the picture of it.
 *
 * It is deliberately almost empty. Three pins, one line, a scale bar. The argument is that the dots are close
 * together, and every extra mark makes that harder to see, not easier.
 *
 * Honesty, which matters more here than anywhere else in the episode: the three ADDRESSES are real and sourced
 * (F-01, F-05, F-12). The LINE between two of them is a schematic tracing of the streets the research names, not
 * a survey — so the card carries no street names, and it labels the walk with Verne's step count rather than with
 * the tracing's own length. See generated/g-38/walk.json `_provenance`. A real 1875 base map can be dropped in
 * later via `base_image`; the bbox is recorded for exactly that.
 *
 * Degrades: no walk.json -> load() returns null -> the renderer emits a pending card and a warning.
 */
import fs from 'node:fs';
import path from 'node:path';

export const PAPER = '#efe6d3', INK = '#241c14', SEPIA = '#5b4a3a', ACCENT = '#a8301f';

export function load(chapterDir) {
  const f = path.join(chapterDir, 'generated', 'g-38', 'walk.json');
  if (!fs.existsSync(f)) return null;
  const data = JSON.parse(fs.readFileSync(f, 'utf8'));
  const base = data.base_image ? path.join(chapterDir, data.base_image) : null;
  return { data, base: base && fs.existsSync(base) ? base : null, dir: path.dirname(f) };
}

/** beats: [{show:'pin:savile'|'pin:reform'|'pin:charing'|'route'|'steps', at}] */
export function planTimeline({ dur, data, beats = [], draw = 2.0 }) {
  const at = {};
  for (const b of beats) if (b && b.show != null && isFinite(b.at)) at[b.show] = Math.max(0, Math.min(dur - 0.3, +b.at));
  const keys = data.pins.map(p => `pin:${p.key}`);
  const order = [...keys, 'route', 'steps'];
  const anyGiven = order.some(k => at[k] !== undefined);
  const t0 = 0.8, t1 = Math.max(t0 + order.length, dur * 0.82);
  const plan = {};
  order.forEach((k, i) => {
    plan[k] = at[k] !== undefined ? at[k] : anyGiven ? null : t0 + (t1 - t0) * i / (order.length - 1);
  });
  // anything the cut never speaks lands between its neighbours rather than vanishing
  const vals = order.map(k => plan[k]);
  for (let i = 0; i < order.length; i++) if (vals[i] === null) {
    const prev = vals.slice(0, i).reverse().find(v => v !== null && v !== undefined);
    const next = vals.slice(i + 1).find(v => v !== null && v !== undefined);
    vals[i] = prev != null && next != null ? (prev + next) / 2 : prev != null ? prev + 1.2 : next != null ? Math.max(0.4, next - 1.2) : dur * 0.5;
    plan[order[i]] = vals[i];
  }
  return { dur, draw, show: plan };
}

export function sampleTimes(tl, fps = 25) {
  const win = [];
  for (const [k, t] of Object.entries(tl.show)) {
    const span = k === 'route' ? tl.draw + 0.6 : 0.8;
    win.push([Math.max(0, t - 0.1), Math.min(tl.dur, t + span), 12.5]);
  }
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

// where each pin's label sits, in 1080p px, chosen so no label crosses the walking line
// The Reform's label was anchored to the LEFT of its pin, which put it straight across the walking line arriving
// from the north-west and read as though it named the line. Below-and-right is the only clear quadrant.
const PIN_LABEL = { savile: { anchor: 'start', dx: 34, dy: -6 }, reform: { anchor: 'start', dx: 34, dy: 52 }, charing: { anchor: 'start', dx: 34, dy: 10 } };

export function page({ loaded, W, H, tl, lang = 'en', labels = {}, fontsDir }) {
  const { data, base } = loaded;
  const sc = H / 1080;
  const px = n => (n * sc).toFixed(1);
  const cjk = lang === 'zh';
  const serif = cjk ? `'Noto Serif CJK SC',Georgia,serif` : `'Playfair Display',Georgia,'Liberation Serif',serif`;
  const sans = cjk ? `'Noto Sans CJK SC','Source Sans 3',system-ui,sans-serif` : `'Source Sans 3','Liberation Sans',system-ui,sans-serif`;

  // equirectangular, locally: metres per degree at this latitude, so the scale bar is honest in both axes
  const bb = data.bbox, midLat = (bb.north + bb.south) / 2;
  const mPerLon = 111320 * Math.cos(midLat * Math.PI / 180), mPerLat = 110570;
  const wM = (bb.east - bb.west) * mPerLon, hM = (bb.north - bb.south) * mPerLat;
  const AX = 200 * sc, AY = 150 * sc, AW = W - 400 * sc, AH = H - 250 * sc;
  const k = Math.min(AW / wM, AH / hM);                          // px per metre
  const offX = AX + (AW - wM * k) / 2, offY = AY + (AH - hM * k) / 2;
  const X = lon => offX + (lon - bb.west) * mPerLon * k;
  const Y = lat => offY + (bb.north - lat) * mPerLat * k;

  const pts = data.route.map(([lon, lat]) => [X(lon), Y(lat)]);
  const d = 'M' + pts.map(([x, y]) => f1(x) + ' ' + f1(y)).join('L');
  let routeLen = 0; for (let i = 1; i < pts.length; i++) routeLen += Math.hypot(pts[i][0] - pts[i-1][0], pts[i][1] - pts[i-1][1]);

  const S = [];
  S.push(`<rect width="${W}" height="${H}" fill="${PAPER}"/>`);
  S.push(`<rect width="${W}" height="${H}" fill="${INK}" filter="url(#fibre)" opacity="0.05"/>`);
  if (base) S.push(`<image href="file://${base}" x="${f1(offX)}" y="${f1(offY)}" width="${f1(wM*k)}" height="${f1(hM*k)}" opacity="0.55" preserveAspectRatio="none"/>`);

  // scale bar — the card's only claim about distance, and the reason it needs no street names
  const barPx = data.scale_bar_m * k, bx = AX, by = H - 118 * sc;
  S.push(`<g id="scale" opacity="0"><path d="M${f1(bx)} ${f1(by)}h${f1(barPx)}M${f1(bx)} ${f1(by-13*sc)}v${f1(26*sc)}M${f1(bx+barPx)} ${f1(by-13*sc)}v${f1(26*sc)}" ` +
    `stroke="${INK}" stroke-width="${px(3)}" fill="none"/>` +
    `<text x="${f1(bx + barPx/2)}" y="${f1(by + 46*sc)}" text-anchor="middle" font-family="${sans}" font-size="${px(30)}" fill="${SEPIA}">${data.scale_bar_m} m</text></g>`);

  S.push(`<path id="route" d="${d}" data-len="${routeLen.toFixed(1)}" fill="none" stroke="${ACCENT}" stroke-width="${px(9)}" stroke-linecap="round" stroke-linejoin="round" opacity="0"/>`);

  // the step count rides at the middle of the walk
  const mid = pts[Math.floor(pts.length / 2)];
  // beside the line, on the open side. Anchored left of it, the number floated in empty paper with nothing to
  // attach it to; the walk runs down the frame's left third, so the clear quadrant is to its right.
  S.push(`<text id="steps" x="${f1(mid[0] + 44*sc)}" y="${f1(mid[1] + 8*sc)}" text-anchor="start" font-family="${sans}" font-weight="600" ` +
    `font-size="${px(52)}" fill="${INK}" opacity="0" stroke="${PAPER}" stroke-width="${px(8)}" paint-order="stroke" stroke-linejoin="round">${esc(labels.steps || data.walk.label)}</text>`);

  data.pins.forEach(p => {
    const x = X(p.lon), y = Y(p.lat), L = PIN_LABEL[p.key] || { anchor: 'start', dx: 32, dy: 10 };
    const nm = (labels.pins && labels.pins[p.key]) || p.name, sb = (labels.subs && labels.subs[p.key]) || p.sub;
    S.push(`<g class="pin" data-pin="${p.key}" opacity="0">` +
      `<circle cx="${f1(x)}" cy="${f1(y)}" r="${px(16)}" fill="${ACCENT}" stroke="${PAPER}" stroke-width="${px(4)}"/>` +
      `<text x="${f1(x + L.dx*sc)}" y="${f1(y + L.dy*sc)}" text-anchor="${L.anchor}" font-family="${serif}" font-weight="700" font-size="${px(50)}" ` +
      `fill="${INK}" stroke="${PAPER}" stroke-width="${px(8)}" paint-order="stroke" stroke-linejoin="round">${esc(nm)}</text>` +
      `<text x="${f1(x + L.dx*sc)}" y="${f1(y + (L.dy + 40)*sc)}" text-anchor="${L.anchor}" font-family="${sans}" font-size="${px(31)}" ` +
      `fill="${SEPIA}" stroke="${PAPER}" stroke-width="${px(7)}" paint-order="stroke" stroke-linejoin="round">${esc(sb)}</text></g>`);
  });

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
const TL = ${JSON.stringify({ show: null })}, SHOW = ${JSON.stringify(tl.show)}, DUR = ${tl.dur}, DRAW = ${tl.draw};
const ease = p => p<=0?0 : p>=1?1 : (p<0.5 ? 2*p*p : 1-Math.pow(-2*p+2,2)/2);
const cl = (v,a,b) => Math.max(a,Math.min(b,v));
window.setT = function(t){
  for (const g of document.querySelectorAll('g.pin')){
    const at = SHOW['pin:'+g.dataset.pin];
    g.setAttribute('opacity', at!=null && t>=at ? cl((t-at)/0.4,0,1).toFixed(3) : '0');
  }
  const r = document.getElementById('route'), at = SHOW['route'];
  if (r){
    const L = +r.dataset.len;
    if (at!=null && t>=at){ const p = ease(cl((t-at)/DRAW,0,1));
      r.setAttribute('opacity','1'); r.setAttribute('stroke-dasharray', L+' '+L); r.setAttribute('stroke-dashoffset', (L*(1-p)).toFixed(2)); }
    else r.setAttribute('opacity','0');
  }
  const st = document.getElementById('steps'), sa = SHOW['steps'];
  if (st) st.setAttribute('opacity', sa!=null && t>=sa ? cl((t-sa)/0.4,0,1).toFixed(3) : '0');
  // the scale bar arrives with the first pin and stays: it is what lets the card drop street names
  const first = Math.min(...Object.values(SHOW).filter(v=>v!=null));
  const sb = document.getElementById('scale');
  if (sb) sb.setAttribute('opacity', t>=first ? cl((t-first)/0.5,0,1).toFixed(3) : '0');
};
window.setT(0);
</script></body></html>`;
}
