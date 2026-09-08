/**
 * mapfilm — the route map as a FILM graphic.
 *
 * Why this file exists (DECISIONS.md D9, studio/strategy/video-first.md §6, founder 2026-09-08):
 *   "the text in the maps are all very small and low contrast hard to read and too much text"
 *
 * The G-01 plate (studio/tools/gen/g01_route_map.py) is a 2176x1812 PRINT object: an eight-row itinerary ledger
 * with dates, a seven-item key, a two-line credits note, port names at 24 px and leg labels at 16 px — all of it
 * on screen at once. The film used to show that plate by screenshotting the player, which fits 2176x1812 inside
 * 1920x1080: a scale of 0.596, so 16-px type arrives as 9.5 px. On a phone that is unreadable, and the founder is
 * right that it is not a map problem, it is a *medium* problem. A film map is a different object:
 *
 *   few labels · big type · high contrast · revealed over time · nothing that is not needed this second
 *
 * So this module draws its own graphic from the SAME numbers (generated/g-01/route-data.json, written by the same
 * Python generator, F-10 / F-11 / F-33) and animates it on the scene clock. Nothing here invents data: every port,
 * leg, day count and date comes out of that file, and every label the film cannot render honestly in both
 * languages is simply not drawn — the narration says it instead.
 *
 * What was cut from the plate and why:
 *   · the itinerary ledger  — eight rows x five columns cannot be legible at 1080p. Replaced by ONE running total
 *                             in the top strip ("20 / 80 days") plus the current leg's day count on the map, which
 *                             is the same arithmetic revealed a line at a time.
 *   · the key / legend      — in a film the drawing order IS the key: the line draws where Fogg goes.
 *   · the credits line      — moved to the film's credits card (Natural Earth is public domain; the note is ours).
 *   · the title             — the film has a title card.
 *   · every port name but one — at most one port name and one day badge are on screen at any moment.
 *
 * Projection: equirectangular with a standard parallel at ~42 N (latitude stretched 1.35x against longitude).
 * The plate uses the equator, which is the right choice for a plate; for a 16:9 frame it wastes half the height on
 * ocean the route never touches. The stretch is a projection choice, not a data change, and it is true to scale
 * exactly where the route runs.
 *
 * Degrades: no route-data.json, no land geojson -> `load()` returns null and the renderer falls back to its old
 * player screenshot with a warning. Nothing here fetches anything.
 */
import fs from 'node:fs';
import path from 'node:path';

export const PAPER = '#efe6d3', INK = '#241c14', SEPIA = '#5b4a3a', ACCENT = '#a8301f', LAND = '#e3d6b8';

/** Read the generated itinerary + the cached Natural Earth land polygons. Returns null if either is absent. */
export function load(chapterDir) {
  const dir = path.join(chapterDir, 'generated', 'g-01');
  const dataFile = path.join(dir, 'route-data.json');
  if (!fs.existsSync(dataFile)) return null;
  const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const landFile = path.join(dir, data.land_geojson || 'src/ne_110m_land.geojson');
  if (!fs.existsSync(landFile)) return null;
  return { data, land: JSON.parse(fs.readFileSync(landFile, 'utf8')), dir };
}

// ---------------------------------------------------------------- geometry
const LON0 = -170;      // left edge of the frame; the window is [-170, 190) so the loop splits mid-Pacific
const LAT_TOP = 75, LAT_BOT = -35;
const KLAT = 1.35;      // latitude stretch = standard parallel at acos(1/1.35) = 42.2 N

export function geometry(W, H) {
  const S = W / 360;                       // px per degree of longitude
  const SY = S * KLAT;                     // px per degree of latitude
  const mapH = (LAT_TOP - LAT_BOT) * SY;
  const top = Math.round((H - mapH) * 0.52);      // a hair above centre: the burned captions own the bottom strip
  return { S, SY, mapH, top, W, H,
    x: lon => (lon - LON0) * S,
    y: lat => top + (LAT_TOP - lat) * SY };
}

/** Land polygons -> one SVG path string, drawn twice (0 and +360) so the wrap has coastline on both sides. */
function landPath(geo, g) {
  const out = [];
  for (const feat of geo.features) {
    const gm = feat.geometry;
    const polys = gm.type === 'Polygon' ? [gm.coordinates] : gm.coordinates;
    for (const poly of polys) for (const ring of poly) {
      for (const off of [0, 360]) {
        const xs = ring.map(([lon]) => g.x(lon + off));
        if (Math.max(...xs) < -5 || Math.min(...xs) > g.W + 5) continue;
        let d = '';
        ring.forEach(([lon, lat], i) => { d += (i ? 'L' : 'M') + f(g.x(lon + off)) + ' ' + f(g.y(lat)); });
        out.push(d + 'Z');
      }
    }
  }
  return out.join(' ');
}

const f = v => (Math.round(v * 10) / 10).toString();
/** deterministic per-leg wobble, so an ink line looks drawn rather than plotted */
const lcg = seed => { let x = (seed * 1103515245 + 12345) & 0x7fffffff; return () => (x = (x * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; };

/** waypoints -> screen polylines, densified, wobbled, split where the route leaves the right edge. */
function legPieces(k, pts, g, step = 10, amp = 1.6) {
  const xy = pts.map(([lon, lat]) => [g.x(lon), g.y(lat)]);
  const dense = [];
  for (let i = 0; i + 1 < xy.length; i++) {
    const [x0, y0] = xy[i], [x1, y1] = xy[i + 1];
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let j = 0; j < n; j++) { const t = j / n; dense.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]); }
  }
  dense.push(xy[xy.length - 1]);
  const rnd = lcg(1000 + k), ph = [rnd() * 6.283, rnd() * 6.283, rnd() * 6.283];
  const wob = dense.map(([x, y], i) => {
    if (i === 0 || i === dense.length - 1) return [x, y];
    const px = dense[i + 1][0] - dense[i - 1][0], py = dense[i + 1][1] - dense[i - 1][1];
    const L = Math.hypot(px, py) || 1;
    const j = amp * (0.7 * Math.sin(i * 0.23 + ph[0]) + 0.5 * Math.sin(i * 0.61 + ph[1]) + 0.3 * Math.sin(i * 1.7 + ph[2]));
    return [x + (-py / L) * j, y + (px / L) * j];
  });
  const pieces = []; let cur = [], wrapped = false;
  for (const [x, y] of wob) {
    if (x > g.W && !wrapped) {
      const [xa, ya] = cur[cur.length - 1]; const t = (g.W - xa) / (x - xa); const yc = ya + (y - ya) * t;
      cur.push([g.W, yc]); pieces.push(cur); cur = [[0, yc]]; wrapped = true;
    }
    cur.push(wrapped ? [x - g.W, y] : [x, y]);
  }
  if (cur.length) pieces.push(cur);
  return pieces;
}

const pathD = piece => 'M' + piece.map(([x, y]) => f(x) + ' ' + f(y)).join('L');
const polyLen = piece => { let L = 0; for (let i = 1; i < piece.length; i++) L += Math.hypot(piece[i][0] - piece[i - 1][0], piece[i][1] - piece[i - 1][1]); return L; };

// ---------------------------------------------------------------- label placement (film layout, not the plate's)
// dx/dy are in frame pixels at 1080p and scale with the frame. Chosen so a name never sits on its own line or in
// the sea-lane the next leg uses; only one of these is visible at a time, so they never collide with each other.
const LABEL = {
  1: { anchor: 'end', dx: -34, dy: -30 },     // London  — up and left, over the Atlantic
  2: { anchor: 'start', dx: 32, dy: 14 },     // Suez    — right, into Arabia
  3: { anchor: 'end', dx: -34, dy: 16 },      // Bombay  — left, over the Arabian Sea
  4: { anchor: 'start', dx: 30, dy: -22 },    // Calcutta— up and right
  5: { anchor: 'end', dx: -36, dy: 54 },      // Hong Kong — down and LEFT, over the South China Sea
  6: { anchor: 'middle', dx: 0, dy: 66 },     // Yokohama — below; anchored right it runs off the frame
  7: { anchor: 'start', dx: 28, dy: 62 },     // San Francisco — below, clear of leg 7
  8: { anchor: 'start', dx: 28, dy: 56 },     // New York — below, clear of leg 8
};
// Where the current leg's day count sits. The plate's own anchors are laid out for a 2176-px sheet: leg 6's is at
// 166 E, which on a 1920-px frame is 128 px from the right edge and a centred "22 days" runs off it. These are the
// film's, chosen clear of the coastline and of the one port name that can be up at the same time. lon, lat.
const LEG_LABEL = {
  1: [12, 36],      // W Mediterranean, below the Brindisi run
  2: [55, 2],       // Arabian Sea, well below Bombay's own label
  3: [80.8, 32],    // above India
  4: [99, -2],      // South China Sea, below the arc
  5: [133, 8],      // Philippine Sea, below the line and clear of Hong Kong's label
  6: [-145, 31],    // the Pacific, on the LEFT half (the leg re-enters at the frame edge) and BELOW its own line
  7: [-97, 47],     // above the transcontinental line
  8: [-40, 33],     // mid-Atlantic, below the homeward run
};
const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
/** "17 Nov 1869" -> "Nov 1869" / "1869年11月". Month + year only: that is what the beat is about. */
export function monthYear(dateStr, lang) {
  const m = String(dateStr).match(/([A-Z][a-z]{2})\s+(\d{4})/);
  if (!m) return String(dateStr);
  return lang === 'zh' ? `${m[2]}年${MONTHS[m[1]] || ''}月` : `${m[1]} ${m[2]}`;
}
/** "1872-10-02" -> "2 October 1872" / "1872年10月2日" */
export function longDate(iso, lang) {
  const m = String(iso).match(/(\d{4})-(\d{2})-(\d{2})/); if (!m) return String(iso);
  const [, y, mo, d] = m;
  if (lang === 'zh') return `${y}年${+mo}月${+d}日`;
  const names = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${+d} ${names[+mo - 1]} ${y}`;
}

// ---------------------------------------------------------------- the timeline
/**
 * Compose a timeline for one map segment.
 *   state  'day-1'  London lit, the rest of the route traced faint — the cold open
 *          'loop'   the eight legs draw one at a time, with the running day total
 *   beats  [{show:'leg:3'|'enabler:A'|'london'|'total', at:<seconds into the segment>}]  — resolved by the caller
 *          from the narration clock. Anything not given is spaced evenly, so a scene with no beats still works.
 */
export function planTimeline({ state = 'day-1', dur, beats = [], draw = 1.6, labelHold = 2.4 }) {
  const at = {};
  for (const b of beats) if (b && b.show != null && isFinite(b.at)) at[b.show] = Math.max(0, Math.min(dur - 0.5, +b.at));
  const legs = [], enablers = [];
  const nLeg = 8;
  if (state === 'loop') {
    const given = [...Array(nLeg)].map((_, i) => at[`leg:${i + 1}`]);
    const haveAny = given.some(v => v !== undefined);
    const t0 = 1.2, t1 = Math.max(t0 + nLeg * 1.2, dur * 0.86);
    for (let k = 1; k <= nLeg; k++) {
      const t = given[k - 1] !== undefined ? given[k - 1] : (haveAny ? null : t0 + (t1 - t0) * (k - 1) / nLeg);
      if (t !== null) legs.push({ k, t });
    }
    // any leg the beats forgot: slot it between its neighbours rather than dropping it
    for (let k = 1; k <= nLeg; k++) if (!legs.some(l => l.k === k)) {
      const prev = legs.filter(l => l.k < k).pop(), next = legs.find(l => l.k > k);
      legs.push({ k, t: prev && next ? (prev.t + next.t) / 2 : prev ? prev.t + draw + 0.6 : next ? Math.max(0.6, next.t - draw - 0.6) : dur * 0.5 });
    }
    legs.sort((a, b) => a.k - b.k);
  }
  for (const L of ['A', 'B', 'C']) if (at[`enabler:${L}`] !== undefined) enablers.push({ letter: L, t: at[`enabler:${L}`] });
  const tl = {
    state, dur, draw, labelHold,
    london: at['london'] !== undefined ? at['london'] : (state === 'day-1' ? Math.min(3.0, dur * 0.12) : 0),
    ghost: state === 'day-1' ? [Math.min(4.0, dur * 0.14), Math.max(6, Math.min(dur * 0.82, dur - 4))] : null,
    legs, enablers,
    total: at['total'] !== undefined ? at['total'] : (state === 'loop' ? (legs.length ? legs[legs.length - 1].t + draw + 0.4 : dur * 0.9) : null),
  };
  return tl;
}

/** Which instants must actually be screenshot: dense through every move, one frame per hold. */
export function sampleTimes(tl, fps = 25) {
  const win = [];
  const add = (a, b, r) => win.push([Math.max(0, a), Math.min(tl.dur, b), r]);
  if (tl.ghost) add(tl.ghost[0] - 0.1, tl.ghost[1] + 0.4, 10);
  if (tl.london != null) add(tl.london - 0.1, tl.london + 1.0, 12.5);
  for (const l of tl.legs) {
    add(l.t - 0.1, l.t + tl.draw + 0.8, 12.5);
    add(l.t + tl.draw + tl.labelHold - 0.1, l.t + tl.draw + tl.labelHold + 0.8, 10);
  }
  for (const e of tl.enablers) { add(e.t - 0.1, e.t + 0.9, 12.5); add(e.t + 6 - 0.1, e.t + 6.9, 10); }
  if (tl.total != null) add(tl.total - 0.1, tl.total + 1.0, 12.5);
  win.sort((a, b) => a[0] - b[0]);
  // merge overlaps (keep the finer rate)
  const merged = [];
  for (const w of win) {
    const last = merged[merged.length - 1];
    if (last && w[0] <= last[1] + 0.001) { last[1] = Math.max(last[1], w[1]); last[2] = Math.max(last[2], w[2]); }
    else merged.push([...w]);
  }
  const ts = [];
  let cursor = 0;
  for (const [a, b, r] of merged) {
    if (a > cursor + 0.001) ts.push(cursor);           // one held frame covers the gap
    const step = 1 / r;
    for (let t = Math.max(cursor, a); t < b; t += step) ts.push(t);
    cursor = Math.max(cursor, b);
  }
  if (cursor < tl.dur - 0.001) ts.push(cursor);
  ts.sort((a, b) => a - b);
  const uniq = ts.filter((t, i) => i === 0 || t - ts[i - 1] > 1 / (fps * 2));
  return uniq.map((t, i) => ({ t, dur: (i + 1 < uniq.length ? uniq[i + 1] : tl.dur) - t })).filter(x => x.dur > 0.001);
}

// ---------------------------------------------------------------- the page
/**
 * One self-contained HTML page holding the whole graphic plus a `setT(seconds)` that puts it in any state.
 * The renderer opens it once and screenshots it at the instants sampleTimes() asked for.
 *   labels  { ports: {1:'London',...}, days:'days', of:'of' } — port names come from the caller so the Mandarin
 *           cut can use the translator's own names; anything missing falls back to the English in route-data.json.
 */
export function page({ loaded, W, H, tl, lang = 'en', labels = {}, fontsDir }) {
  const { data, land } = loaded;
  const g = geometry(W, H);
  const sc = H / 1080;
  const px = n => (n * sc).toFixed(1);
  const cjk = lang === 'zh';
  const serif = cjk ? `'Noto Serif CJK SC','Noto Sans CJK SC',Georgia,serif` : `'Playfair Display',Georgia,'Liberation Serif',serif`;
  const sans = cjk ? `'Noto Sans CJK SC','Source Sans 3',system-ui,sans-serif` : `'Source Sans 3','Liberation Sans',system-ui,sans-serif`;

  const portName = p => (labels.ports && labels.ports[p.n]) || p.name;
  const legGeom = {}; for (const l of data.legs) legGeom[l.k] = legPieces(l.k, l.waypoints, g);

  // --- static SVG -------------------------------------------------------------------------------------------
  const S = [];
  S.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="${PAPER}"/>`);
  S.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="${INK}" filter="url(#fibre)" opacity="0.05"/>`);
  S.push(`<g clip-path="url(#band)">`);
  // graticule, faint
  const grat = [];
  for (let lon = -150; lon < 190; lon += 30) grat.push(`M${f(g.x(lon))} ${f(g.top)}V${f(g.top + g.mapH)}`);
  for (let lat = -30; lat <= 60; lat += 30) grat.push(`M0 ${f(g.y(lat))}H${W}`);
  S.push(`<path d="${grat.join('')}" stroke="${SEPIA}" stroke-width="${px(1)}" stroke-opacity="0.20" fill="none"/>`);
  S.push(`<path d="${landPath(land, g)}" fill="${LAND}" stroke="${SEPIA}" stroke-width="${px(1.1)}" stroke-opacity="0.75" stroke-linejoin="round" fill-rule="evenodd"/>`);
  S.push(`</g>`);
  S.push(`<path d="M0 ${f(g.top)}H${W}M0 ${f(g.top + g.mapH)}H${W}" stroke="${SEPIA}" stroke-width="${px(1.5)}" stroke-opacity="0.55" fill="none"/>`);

  // routes: ahead (dashed, faint) then the ink/accent draw, one path per piece
  for (const l of data.legs) {
    const ps = legGeom[l.k];
    const dash = `${px(13)} ${px(11)}`;
    S.push(`<g class="ahead" data-leg="${l.k}" fill="none" stroke="${INK}" stroke-opacity="0.34" stroke-width="${px(3.6)}" stroke-linecap="round">` +
      ps.map(p => `<path data-len="${polyLen(p).toFixed(1)}" data-dash="${dash}" d="${pathD(p)}"/>`).join('') + `</g>`);
  }
  for (const l of data.legs) {
    const ps = legGeom[l.k];
    S.push(`<g class="line" data-leg="${l.k}" fill="none" stroke="${ACCENT}" stroke-width="${px(7)}" stroke-linecap="round" stroke-linejoin="round" opacity="0">` +
      ps.map(p => `<path data-len="${polyLen(p).toFixed(1)}" d="${pathD(p)}"/>`).join('') + `</g>`);
  }
  // ports: dot + name (only ever one or two visible)
  for (const p of data.ports) {
    const x = g.x(p.lon), y = g.y(p.lat), lab = LABEL[p.n] || { anchor: 'start', dx: 30, dy: 14 };
    S.push(`<g class="port" data-port="${p.n}" opacity="0">` +
      `<circle cx="${f(x)}" cy="${f(y)}" r="${px(13)}" fill="${ACCENT}" stroke="${PAPER}" stroke-width="${px(3)}"/></g>`);
    S.push(`<g class="pdot" data-port="${p.n}" opacity="0">` +
      `<circle cx="${f(x)}" cy="${f(y)}" r="${px(8)}" fill="${PAPER}" stroke="${INK}" stroke-opacity="0.55" stroke-width="${px(3)}"/></g>`);
    S.push(`<text class="pname" data-port="${p.n}" x="${f(x + lab.dx * sc)}" y="${f(y + lab.dy * sc)}" text-anchor="${lab.anchor}" ` +
      `font-family="${serif}" font-weight="700" font-size="${px(54)}" fill="${INK}" opacity="0" ` +
      `stroke="${PAPER}" stroke-width="${px(7)}" paint-order="stroke" stroke-linejoin="round">${esc(portName(p))}</text>`);
  }
  // the current leg's day count, parked at the leg's own label anchor
  for (const l of data.legs) {
    const [lon, lat] = LEG_LABEL[l.k] || l.label_at;
    S.push(`<text class="ldays" data-leg="${l.k}" x="${f(g.x(lon))}" y="${f(g.y(lat))}" text-anchor="middle" ` +
      `font-family="${sans}" font-weight="600" font-size="${px(50)}" fill="${ACCENT}" opacity="0" ` +
      `stroke="${PAPER}" stroke-width="${px(7)}" paint-order="stroke" stroke-linejoin="round">${l.days} ${esc(labels.days || 'days')}</text>`);
  }
  // enablers: a diamond and a month. The NAME is not drawn — the narration says it, in both languages.
  (data.enablers || []).forEach((e, i) => {
    const x = g.x(e.lon), y = g.y(e.lat), r = 17 * sc;
    S.push(`<g class="enab" data-enab="${i}" opacity="0">` +
      `<path d="M${f(x)} ${f(y - r)}L${f(x + r)} ${f(y)}L${f(x)} ${f(y + r)}L${f(x - r)} ${f(y)}Z" fill="${ACCENT}" stroke="${PAPER}" stroke-width="${px(3)}"/>` +
      `<text class="edate" x="${f(x)}" y="${f(y + 62 * sc)}" text-anchor="middle" font-family="${sans}" font-weight="600" ` +
      `font-size="${px(44)}" fill="${INK}" stroke="${PAPER}" stroke-width="${px(7)}" paint-order="stroke" stroke-linejoin="round">${esc(monthYear(e.date, lang))}</text></g>`);
  });

  // top strip: the running total (loop) or the date (day 1). One line, big, ink on cream, aligned to the frame.
  const stripY = Math.max(46 * sc, g.top - 46 * sc);
  S.push(`<g id="strip" opacity="0">` +
    `<text id="tnum" x="${px(96)}" y="${f(stripY)}" font-family="${sans}" font-weight="600" font-size="${px(80)}" fill="${INK}">0</text>` +
    `<text id="tlab" x="${px(96)}" y="${f(stripY)}" font-family="${sans}" font-size="${px(38)}" fill="${SEPIA}"></text></g>`);
  S.push(`<text id="datestrip" x="${px(96)}" y="${f(stripY)}" font-family="${serif}" font-weight="600" font-size="${px(58)}" fill="${INK}" opacity="0">${esc(longDate(data.start_date, lang))}</text>`);

  const fontFace = fontsDir ? `
    @font-face{font-family:'Playfair Display';font-weight:700;src:url('file://${fontsDir}/PlayfairDisplay-700.woff2') format('woff2');}
    @font-face{font-family:'Playfair Display';font-weight:600;src:url('file://${fontsDir}/PlayfairDisplay-600.woff2') format('woff2');}
    @font-face{font-family:'Playfair Display';font-weight:400;src:url('file://${fontsDir}/PlayfairDisplay-400.woff2') format('woff2');}
    @font-face{font-family:'Source Sans 3';font-weight:600;src:url('file://${fontsDir}/SourceSans3-600.woff2') format('woff2');}
    @font-face{font-family:'Source Sans 3';font-weight:400;src:url('file://${fontsDir}/SourceSans3-400.woff2') format('woff2');}` : '';

  // how far along the whole loop each port sits, by drawn length — the ghost trace lights the unlit discs in order
  const legLen = {}; for (const l of data.legs) legLen[l.k] = legGeom[l.k].reduce((a, pc) => a + polyLen(pc), 0);
  const totLen = Object.values(legLen).reduce((a, b) => a + b, 0) || 1;
  const portFrac = { 1: 0 }; { let c = 0; for (const l of data.legs) { c += legLen[l.k]; portFrac[l.to] = Math.min(1, c / totLen); } }
  const legDays = {}; for (const l of data.legs) legDays[l.k] = l.days;
  const legTo = {}; for (const l of data.legs) legTo[l.k] = l.to;
  const RT = JSON.stringify({ tl, legDays, legTo, portFrac, total: data.total_days, daysWord: labels.days || 'days', ofWord: labels.of || 'of' });

  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><style>
${fontFace}
html,body{margin:0;padding:0;width:${W}px;height:${H}px;background:${PAPER};overflow:hidden}
svg{display:block}
</style></head><body>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
<defs>
<clipPath id="band"><rect x="0" y="${f(g.top)}" width="${W}" height="${f(g.mapH)}"/></clipPath>
<filter id="fibre" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
</defs>
${S.join('\n')}
</svg>
<script>
const R = ${RT};
const TL = R.tl;
const ease = p => p<=0?0 : p>=1?1 : (p<0.5 ? 2*p*p : 1-Math.pow(-2*p+2,2)/2);
const cl = (v,a,b) => Math.max(a,Math.min(b,v));
const q = s => [...document.querySelectorAll(s)];
const groups = k => q('g.line[data-leg="'+k+'"]');
const ahead  = k => q('g.ahead[data-leg="'+k+'"]');

// dash-reveal a group of pieces to progress p (0..1) across their combined length
function reveal(gs, p){
  for (const gr of gs){
    const ps = [...gr.querySelectorAll('path')];
    const lens = ps.map(x => +x.dataset.len);
    const tot = lens.reduce((a,b)=>a+b,0) || 1;
    let want = p*tot;
    ps.forEach((el,i)=>{ const L=lens[i]; const shown = cl(want,0,L); want -= shown;
      // a fully drawn "ahead" path goes back to its authored dash pattern: dasharray is how we reveal AND how the
      // house style says "not yet travelled", and using it for both is what flattened the dashes into a grey line.
      if (el.dataset.dash && shown >= L - 0.01){ el.setAttribute('stroke-dasharray', el.dataset.dash); el.setAttribute('stroke-dashoffset','0'); return; }
      el.setAttribute('stroke-dasharray', L+' '+L);
      el.setAttribute('stroke-dashoffset', (L-shown).toFixed(2)); });
  }
}
function fade(el, o){ if(el) el.setAttribute('opacity', o.toFixed(3)); }

window.setT = function(t){
  const legs = TL.legs || [], enabs = TL.enablers || [];
  const nextT = k => { const n = legs.find(l=>l.k===k+1); return n ? n.t : Infinity; };

  // --- the faint whole route ------------------------------------------------------------------------------
  // day-1: it traces once around the world, so the cold open has motion and the shape of the bet lands before a
  // single port is named. loop: it is simply there from the first frame, because the legs are about to cover it.
  let ghostP = 1;
  if (TL.ghost){
    const p = ghostP = cl((t-TL.ghost[0])/Math.max(0.1,TL.ghost[1]-TL.ghost[0]),0,1);
    const lens = [1,2,3,4,5,6,7,8].map(k => ahead(k).reduce((a,gr)=>a+[...gr.querySelectorAll('path')].reduce((s,x)=>s+ +x.dataset.len,0),0));
    const tot = lens.reduce((a,b)=>a+b,0); let want = p*tot;
    for (let k=1;k<=8;k++){ const share = cl(want/lens[k-1],0,1); want -= lens[k-1]*share; reveal(ahead(k), share); }
  } else {
    for (let k=1;k<=8;k++) reveal(ahead(k), 1);
  }

  // --- the legs -------------------------------------------------------------------------------------------
  let travelled = 0, lit = null;
  for (let k=1;k<=8;k++){
    const l = legs.find(x=>x.k===k);
    const gs = groups(k);
    if (!l || t < l.t){ gs.forEach(gr=>fade(gr,0)); reveal(gs,0); continue; }
    const p = ease(cl((t-l.t)/TL.draw,0,1));
    reveal(gs,p); gs.forEach(gr=>fade(gr,1));
    const done = t >= l.t + TL.draw;
    if (done) travelled += R.legDays[k];
    // the current leg is accent; once the next one starts, this one settles into ink
    const isCurrent = t < nextT(k);
    gs.forEach(gr=>{ gr.setAttribute('stroke', isCurrent ? '${ACCENT}' : '${INK}');
                     gr.setAttribute('stroke-width', isCurrent ? '${px(7)}' : '${px(5.5)}'); });
    if (isCurrent) lit = k;
    // the day badge rides with its leg and leaves with it
    const bo = cl((t-l.t-TL.draw*0.5)/0.5,0,1) * (1-cl((t-Math.min(nextT(k),l.t+TL.draw+TL.labelHold))/0.5,0,1));
    fade(document.querySelector('text.ldays[data-leg="'+k+'"]'), bo);
  }

  // --- ports ----------------------------------------------------------------------------------------------
  const londonOn = TL.london!=null && t >= TL.london;
  for (const p of [1,2,3,4,5,6,7,8]){
    const dot = document.querySelector('g.port[data-port="'+p+'"]');
    const ghost = document.querySelector('g.pdot[data-port="'+p+'"]');
    const name = document.querySelector('text.pname[data-port="'+p+'"]');
    // arrival: leg k lands at port legTo[k]
    let arrive = null; for (let k=1;k<=8;k++){ const l=legs.find(x=>x.k===k); if (l && R.legTo[k]===p) arrive = l.t + TL.draw*0.92; }
    const isLondon = p===1;
    const lit1 = isLondon ? (londonOn?TL.london:null) : arrive;
    const on = lit1!=null && t >= lit1;
    fade(dot, on ? cl((t-lit1)/0.5,0,1) : 0);
    // ports not yet called sit as small paper discs, unlabelled, once the faint route has reached them
    fade(ghost, on ? 0 : (TL.ghost ? (ghostP >= (R.portFrac[p]||0) - 0.001 ? 1 : 0) : 1) * 0.9);
    let no = 0;
    if (on){
      const inP = cl((t-lit1)/0.45,0,1);
      // a port name also leaves when the NEXT leg starts drawing: with beats 2.8 s apart and a 2.4 s hold, two
      // names would otherwise be up at once, which is exactly the "too much text" this map exists to end.
      let nextLegT = Infinity; for (let k=1;k<=8;k++){ const l=legs.find(x=>x.k===k); if (l && R.legTo[k]===p){ const n=legs.find(x=>x.k===k+1); if (n) nextLegT = n.t + 0.35; } }
      const outAt = isLondon ? Infinity : Math.min(lit1 + TL.labelHold, nextLegT);
      no = inP * (1 - cl((t-outAt)/0.5,0,1));
    }
    fade(name, no);
  }

  // --- enablers -------------------------------------------------------------------------------------------
  enabs.forEach((e,i)=>{
    const idx = 'ABC'.indexOf(e.letter);
    const gr = document.querySelector('g.enab[data-enab="'+idx+'"]'); if(!gr) return;
    fade(gr, t>=e.t ? cl((t-e.t)/0.5,0,1) : 0);
    // the diamond stays — the three doors are the point of the beat — but its date leaves after 7 s, or as soon as
    // the legs start drawing, so the map is never carrying three old labels while a fourth thing is happening.
    const d = gr.querySelector('text.edate');
    const legStart = legs.length ? legs[0].t - 0.6 : Infinity;
    const out = Math.min(e.t + 7, legStart);
    if (d) fade(d, t>=e.t ? cl((t-e.t)/0.5,0,1) * (1-cl((t-out)/0.7,0,1)) : 0);
  });

  // --- the top strip: the ledger, one number ---------------------------------------------------------------
  const strip = document.getElementById('strip'), dnum = document.getElementById('tnum'), dlab = document.getElementById('tlab');
  const ds = document.getElementById('datestrip');
  if (TL.state === 'loop'){
    const closed = TL.total!=null && t>=TL.total;
    const n = closed ? R.total : travelled;
    dnum.textContent = n;
    dnum.setAttribute('fill', closed ? '${ACCENT}' : '${INK}');
    const w = dnum.getComputedTextLength ? dnum.getComputedTextLength() : 90;
    dlab.setAttribute('x', (96*${sc} + w + 18*${sc}).toFixed(1));
    dlab.textContent = R.ofWord + ' ' + R.total + ' ' + R.daysWord;
    fade(strip, cl(t/0.8,0,1) * (travelled>0 || closed ? 1 : 0.0));
    fade(ds, 0);
  } else {
    fade(strip, 0);
    fade(ds, TL.london!=null ? cl((t-TL.london)/0.6,0,1) : 1);
  }
};
window.setT(0);
</script></body></html>`;
}

const esc = (s = '') => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
