#!/usr/bin/env python3
"""
G-01 — the 80-day route map (Around the World in Eighty Days, Day 1 London chapter).

Regenerates every SVG under products/around-the-world-80-days/day-01-london/generated/g-01/ from the cached
Natural Earth 1:110m land polygons (public domain) in generated/g-01/src/.

  python3 studio/tools/gen/g01_route_map.py            # SVGs only
  python3 studio/tools/gen/g01_route_map.py --png      # SVGs + PNG exports via studio/tools/svg2png.mjs

No dependencies beyond the standard library. Layer contract: see LAYER_CONTRACT below (also embedded in every SVG).
Facts: F-10 (itinerary and days), F-11 (2 Oct → 21 Dec 1872), F-33 (enablers) in research/fact-sheet.md.
"""
import json, math, os, subprocess, sys, random

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
OUT = os.path.join(ROOT, 'products/around-the-world-80-days/day-01-london/generated/g-01')
SRC = os.path.join(OUT, 'src', 'ne_110m_land.geojson')

# ---------------------------------------------------------------- canvas / projection
W, H = 2176, 1812              # fold-open master
MAP_Y0, MAP_H = 120, 870        # map band (y 120..990); the 16:9 crop is y 0..1224
LON0 = -170.0                   # left edge; window is [-170, 190) so the loop splits mid-Pacific (170 W)
LAT_TOP = 84.0
S = W / 360.0                   # 6.044 px per degree
LAT_BOT = LAT_TOP - MAP_H / S   # ≈ -59.9
CROP_16x9 = (0, 0, W, round(W * 9 / 16))  # 2176×1224

PAPER, INK, SEPIA, ACCENT, LAND = '#efe6d3', '#2a2118', '#5b4a3a', '#b03a2e', '#e7dcc4'
SERIF = "'Playfair Display', Georgia, serif"
SANS = "'Source Sans 3', system-ui, sans-serif"
AHEAD_OPACITY = 0.30

def proj(lon, lat):
    return (lon - LON0) * S, MAP_Y0 + (LAT_TOP - lat) * S

def f(v):
    return ('%.1f' % v).rstrip('0').rstrip('.')

# ---------------------------------------------------------------- content (F-10, F-11, F-33)
PORTS = [  # n, name, lon, lat, date, anchor, dx, dy (px from the port dot)
    (1, 'London', -0.13, 51.51, '2 Oct · 21 Dec', 'end', -20, 30),
    (2, 'Suez', 32.55, 29.97, '9 Oct', 'start', 20, 6),
    (3, 'Bombay', 72.84, 18.94, '20 Oct', 'end', -24, -14),
    (4, 'Calcutta', 88.36, 22.57, '25 Oct', 'start', 20, 4),
    (5, 'Hong Kong', 114.17, 22.32, '6 Nov', 'start', 18, 32),
    (6, 'Yokohama', 139.64, 35.44, '14 Nov', 'start', 18, 30),
    (7, 'San Francisco', -122.42, 37.77, '3 Dec', 'end', -18, 30),
    (8, 'New York', -74.01, 40.71, '11 Dec', 'start', 18, 30),
]
LEGS = [  # k, from, to, mode, days, dates, waypoints (lon unwrapped, lat), label anchor (lon, lat)
    (1, 1, 2, 'rail + steamer', 7, '2 – 9 Oct',
     [(-0.13, 51.51), (1.31, 51.13), (1.86, 50.95), (2.35, 48.86), (6.9, 45.2), (7.69, 45.07), (12.5, 43.5),
      (17.94, 40.63), (19.5, 38.5), (24.5, 34.8), (30.5, 32.2), (32.3, 31.26), (32.55, 29.97)], (13, 30.2)),
    (2, 2, 3, 'steamer', 13, '9 – 20 Oct',
     [(32.55, 29.97), (33.5, 27.5), (37, 22), (40, 16.5), (43.4, 12.6), (45.0, 12.7), (52, 12.7), (60, 13.5),
      (66, 15.5), (72.84, 18.94)], (57, 8.5)),
    (3, 3, 4, 'rail', 3, '20 – 25 Oct',
     [(72.84, 18.94), (75.5, 20.5), (79.9, 23.2), (81.85, 25.44), (85, 24.8), (88.36, 22.57)], (80.5, 17.5)),
    (4, 4, 5, 'steamer', 13, '25 Oct – 6 Nov',
     [(88.36, 22.57), (89.5, 20.5), (91.5, 17), (93, 14), (97, 7), (103.85, 1.29), (106, 3), (110, 8),
      (113, 14), (114.0, 20), (114.17, 22.32)], (81.5, 11.5)),
    (5, 5, 6, 'steamer', 6, '6 – 14 Nov',
     [(114.17, 22.32), (117, 23), (122, 26), (128, 30), (134, 33.5), (139.64, 35.44)], (132, 23)),
    (6, 6, 7, 'steamer', 22, '14 Nov – 3 Dec',
     [(139.64, 35.44), (150, 41), (165, 47), (180, 50), (195, 50.5), (210, 47), (220, 43), (230, 39.5),
      (237.58, 37.77)], (168, 36)),
    (7, 7, 8, 'rail', 7, '3 – 11 Dec',
     [(-122.42, 37.77), (-121.5, 38.58), (-119.8, 39.5), (-111.97, 41.22), (-104.8, 41.14), (-95.94, 41.26),
      (-87.63, 41.88), (-80, 41.4), (-74.01, 40.71)], (-92, 45.5)),
    (8, 8, 1, 'steamer + rail', 9, '11 – 21 Dec',
     [(-74.01, 40.71), (-65, 42.5), (-50, 46), (-30, 50), (-15, 51), (-8.3, 51.85), (-3.0, 53.4), (-0.13, 51.51)],
     (-42, 54.5)),
]
ENABLERS = [  # letter, label, date, lon, lat (drawn), spec lon/lat, label anchor, dx, dy
    ('A', 'Suez Canal', '17 Nov 1869', 32.35, 31.05, (32.5, 30.0), 'start', 16, -14),
    ('B', 'Promontory Summit', '10 May 1869', -112.5, 41.6, (-112.5, 41.6), 'middle', 0, 34),
    ('C', 'Jabalpur', '7 Mar 1870', 79.9, 23.2, (79.9, 23.2), 'middle', 0, -46),
]
PORT_BY_N = {p[0]: p for p in PORTS}

LAYER_CONTRACT = """G-01 layer contract (ids of <g> groups; show cumulatively L0 + L1..Lk):
  L0    base: paper, graticule, Natural Earth coastlines, all ports (dots, names, dates), every leg dashed at 30 % ink,
        port badges at 30 %, leg labels at 30 %, ledger at 30 %, key/legend, title, credits.
  DAY1  Day-1 state: London badge lit (accent) + caption 'Day 1 . London'. Hide when any L1..L9 is shown.
  L1..L8  leg k lit: leg k solid accent + hit path (class 'hit', data-leg=k, 48 px stroke); leg k-1 turned solid ink;
        badge of port k turned ink; badge of port k+1 lit accent; on-map leg label k and ledger row k solid
        (row k-1 ink). Legs: 1 London-Suez 2 Suez-Bombay 3 Bombay-Calcutta 4 Calcutta-Hong Kong 5 Hong Kong-Yokohama
        6 Yokohama-San Francisco (crosses the frame edge at 170 W: two paths + chevrons) 7 San Francisco-New York
        8 New York-London.
  L9    loop closed: leg 8 turned ink, badge 8 ink, London badge lit again + 'Home . 21 Dec . 80 days', ledger total.
  L10   enablers: A Suez Canal 17 Nov 1869, B Promontory Summit 10 May 1869, C Jabalpur 7 Mar 1870 (F-33) — accent
        diamonds with letters + ink labels; independent of the leg layers.
  Colour is never the only signal: current = accent filled, travelled = ink filled solid, ahead = 30 % dashed/outline."""

# ---------------------------------------------------------------- geometry helpers
def land_paths():
    g = json.load(open(SRC))
    parts = []
    for feat in g['features']:
        geom = feat['geometry']
        polys = [geom['coordinates']] if geom['type'] == 'Polygon' else geom['coordinates']
        for poly in polys:
            for ring in poly:
                for off in (0.0, 360.0):
                    xs = [(lon + off - LON0) * S for lon, lat in ring]
                    if max(xs) < -5 or min(xs) > W + 5:
                        continue
                    d = []
                    for (lon, lat), x in zip(ring, xs):
                        y = MAP_Y0 + (LAT_TOP - lat) * S
                        d.append(('M' if not d else 'L') + f(x) + ' ' + f(y))
                    parts.append(''.join(d) + 'Z')
    return ' '.join(parts)

def leg_pieces(k, pts, step=9.0, amp=1.1):
    """Project (unwrapped lon), densify, add deterministic hand-drawn jitter, split at the frame edge x=W."""
    xy = [proj(lon, lat) for lon, lat in pts]
    dense = []
    for (x0, y0), (x1, y1) in zip(xy, xy[1:]):
        n = max(1, int(math.hypot(x1 - x0, y1 - y0) / step))
        for i in range(n):
            t = i / n
            dense.append((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t))
    dense.append(xy[-1])
    rnd = random.Random(1000 + k)
    ph = [rnd.random() * 6.283 for _ in range(3)]
    out = []
    for i, (x, y) in enumerate(dense):
        if i == 0 or i == len(dense) - 1:
            out.append((x, y)); continue
        px, py = dense[i + 1][0] - dense[i - 1][0], dense[i + 1][1] - dense[i - 1][1]
        L = math.hypot(px, py) or 1
        nx, ny = -py / L, px / L
        j = amp * (0.7 * math.sin(i * 0.23 + ph[0]) + 0.5 * math.sin(i * 0.61 + ph[1]) + 0.3 * math.sin(i * 1.7 + ph[2]))
        out.append((x + nx * j, y + ny * j))
    pieces, cur, wrapped = [], [], False
    for (x, y) in out:
        if x > W and not wrapped:
            xa, ya = cur[-1]
            t = (W - xa) / (x - xa)
            yc = ya + (y - ya) * t
            cur.append((W, yc)); pieces.append(cur); cur = [(0, yc)]; wrapped = True
        cur.append((x - W, y) if wrapped else (x, y))
    if cur:
        pieces.append(cur)
    return pieces

def path_d(piece):
    return 'M' + 'L'.join(f(x) + ' ' + f(y) for x, y in piece)

LEG_GEOM = {l[0]: leg_pieces(l[0], l[6]) for l in LEGS}

def edge_marks(pieces):
    """Chevrons where a leg leaves the right edge and re-enters at the left."""
    if len(pieces) < 2:
        return ''
    yc = pieces[0][-1][1]
    return (f'<path d="M{W-16} {f(yc-9)} L{W-3} {f(yc)} L{W-16} {f(yc+9)}"/>'
            f'<path d="M4 {f(yc-9)} L17 {f(yc)} L4 {f(yc+9)}"/>')

# ---------------------------------------------------------------- SVG pieces
def leg_stroke(k, state, hit=False):
    """state: 'ahead' (30 % dashed), 'ink' (travelled), 'accent' (current)."""
    pieces = LEG_GEOM[k]
    if state == 'ahead':
        attrs = f'stroke="{INK}" stroke-opacity="{AHEAD_OPACITY}" stroke-width="3" stroke-dasharray="9 7"'
    elif state == 'ink':
        attrs = f'stroke="{INK}" stroke-width="3.6"'
    else:
        attrs = f'stroke="{ACCENT}" stroke-width="4"'
    s = [f'<g class="leg leg-{state}" data-leg="{k}" fill="none" {attrs} stroke-linecap="round" stroke-linejoin="round">']
    s += [f'<path d="{path_d(p)}"/>' for p in pieces]
    s.append(edge_marks(pieces))
    s.append('</g>')
    if hit:
        s.append(f'<g class="hit-group" data-leg="{k}">')
        for p in pieces:
            s.append(f'<path class="hit" data-leg="{k}" d="{path_d(p)}" fill="none" stroke="transparent" '
                     f'stroke-width="48" stroke-linecap="round" pointer-events="stroke"><title>Leg {k}: '
                     f'{PORT_BY_N[LEGS[k-1][1]][1]} → {PORT_BY_N[LEGS[k-1][2]][1]}, {LEGS[k-1][3]}, {LEGS[k-1][4]} days</title></path>')
        s.append('</g>')
    return '\n'.join(s)

def badge(n, state, r=15):
    _, name, lon, lat, *_ = PORT_BY_N[n]
    x, y = proj(lon, lat)
    if state == 'ahead':
        return (f'<g class="badge badge-ahead" data-port="{n}" opacity="{AHEAD_OPACITY}"><circle cx="{f(x)}" cy="{f(y)}" r="{r}" '
                f'fill="{PAPER}" stroke="{INK}" stroke-width="2"/><text x="{f(x)}" y="{f(y+6.5)}" text-anchor="middle" '
                f'font-family="{SANS}" font-weight="600" font-size="19" fill="{INK}">{n}</text></g>')
    fill = INK if state == 'ink' else ACCENT
    return (f'<g class="badge badge-{state}" data-port="{n}"><circle cx="{f(x)}" cy="{f(y)}" r="{r}" fill="{fill}" '
            f'stroke="{PAPER}" stroke-width="1.5"/><text x="{f(x)}" y="{f(y+6.5)}" text-anchor="middle" '
            f'font-family="{SANS}" font-weight="600" font-size="19" fill="{PAPER}">{n}</text></g>')

def port_labels():
    s = []
    for n, name, lon, lat, date, anchor, dx, dy in PORTS:
        x, y = proj(lon, lat)
        s.append(f'<g class="port-label" data-port="{n}"><text x="{f(x+dx)}" y="{f(y+dy)}" text-anchor="{anchor}" '
                 f'font-family="{SERIF}" font-weight="600" font-size="24" fill="{INK}">{name}</text>'
                 f'<text x="{f(x+dx)}" y="{f(y+dy+19)}" text-anchor="{anchor}" font-family="{SANS}" font-size="16" '
                 f'fill="{SEPIA}">{date}</text></g>')
    return '\n'.join(s)

def leg_label(k, opacity=None):
    l = LEGS[k - 1]
    x, y = proj(*l[7])
    txt = f'{l[3]} · {l[4]} days' + (' — the longest leg' if k == 6 else '')
    op = f' opacity="{opacity}"' if opacity else ''
    return (f'<text class="leg-label" data-leg="{k}" x="{f(x)}" y="{f(y)}" text-anchor="middle" font-family="{SANS}" '
            f'font-weight="600" font-size="16" fill="{INK}"{op}>{txt}</text>')

LEDGER_X = (70, 1130)
LEDGER_Y0 = 1345
LEDGER_DY = 50

def ledger_row(k, state):
    l = LEGS[k - 1]
    col, row = (0, k - 1) if k <= 4 else (1, k - 5)
    x, y = LEDGER_X[col], LEDGER_Y0 + row * LEDGER_DY
    a, b = PORT_BY_N[l[1]][1], PORT_BY_N[l[2]][1]
    if state == 'ahead':
        op, c1, c2 = f' opacity="{AHEAD_OPACITY}"', INK, INK
    elif state == 'ink':
        op, c1, c2 = '', INK, INK
    else:
        op, c1, c2 = '', ACCENT, ACCENT
    return (f'<g class="ledger-row" data-leg="{k}"{op}>'
            f'<text x="{x}" y="{y}" font-family="{SANS}" font-weight="600" font-size="20" fill="{c1}">{k}</text>'
            f'<text x="{x+34}" y="{y}" font-family="{SERIF}" font-size="21" fill="{c1}">{a} → {b}</text>'
            f'<text x="{x+400}" y="{y}" font-family="{SANS}" font-size="19" fill="{c2}">{l[3]}</text>'
            f'<text x="{x+640}" y="{y}" font-family="{SANS}" font-weight="600" font-size="19" fill="{c1}">{l[4]} days</text>'
            f'<text x="{x+760}" y="{y}" font-family="{SANS}" font-size="19" fill="{SEPIA}">{l[5]}</text></g>')

def ledger_total(state):
    y = LEDGER_Y0 + 4 * LEDGER_DY + 18
    c = ACCENT if state == 'accent' else INK
    op = f' opacity="{AHEAD_OPACITY}"' if state == 'ahead' else ''
    return (f'<g class="ledger-total"{op}><text x="{LEDGER_X[0]}" y="{y}" font-family="{SANS}" font-weight="600" '
            f'font-size="22" fill="{c}">7 + 13 + 3 + 13 + 6 + 22 + 7 + 9 = 80 days</text>'
            f'<text x="{LEDGER_X[0]+520}" y="{y}" font-family="{SERIF}" font-style="italic" font-size="21" fill="{INK}">'
            f'Back at the Reform Club, Saturday 21 December 1872, a quarter before nine.</text></g>')

def enabler_pin(letter, label, date, lon, lat, anchor, dx, dy):
    x, y = proj(lon, lat)
    r = 15
    lx, ly = x + dx, y + dy
    return (f'<g class="enabler" data-enabler="{letter}">'
            f'<path d="M{f(x)} {f(y-r)} L{f(x+r)} {f(y)} L{f(x)} {f(y+r)} L{f(x-r)} {f(y)}Z" fill="{ACCENT}" '
            f'stroke="{PAPER}" stroke-width="1.5"/>'
            f'<text x="{f(x)}" y="{f(y+6)}" text-anchor="middle" font-family="{SANS}" font-weight="600" font-size="17" '
            f'fill="{PAPER}">{letter}</text>'
            f'<text x="{f(lx)}" y="{f(ly)}" text-anchor="{anchor}" font-family="{SANS}" font-weight="600" font-size="17" '
            f'fill="{INK}">{letter} · {label}</text>'
            f'<text x="{f(lx)}" y="{f(ly+19)}" text-anchor="{anchor}" font-family="{SANS}" font-size="16" fill="{ACCENT}">'
            f'{date}</text></g>')

def graticule():
    s = [f'<g class="graticule" fill="none" stroke="{SEPIA}" stroke-width="0.5" stroke-opacity="0.35">']
    for lon in range(-150, 190, 30):
        x, _ = proj(lon, 0)
        s.append(f'<path d="M{f(x)} {MAP_Y0} V{MAP_Y0+MAP_H}"/>')
    for lat in range(-60, 90, 30):
        if lat > LAT_TOP or lat < LAT_BOT: continue
        _, y = proj(0, lat)
        s.append(f'<path d="M0 {f(y)} H{W}"/>')
    s.append('</g>')
    return '\n'.join(s)

def key():
    """Legend: line states, badge states, enabler mark. Sits under the map (inside the 16:9 crop)."""
    y = 1030
    x = 70
    s = [f'<g class="key" font-family="{SANS}" font-size="16" fill="{INK}">',
         f'<text x="{x}" y="{y}" font-weight="600" font-size="17">Key</text>']
    items = [
        (f'<path d="M0 0 h56" stroke="{ACCENT}" stroke-width="4" fill="none"/>', 'this leg (lit)'),
        (f'<path d="M0 0 h56" stroke="{INK}" stroke-width="3.6" fill="none"/>', 'travelled'),
        (f'<path d="M0 0 h56" stroke="{INK}" stroke-opacity="{AHEAD_OPACITY}" stroke-width="3" stroke-dasharray="9 7" fill="none"/>', 'ahead (30 % ink, dashed)'),
        (f'<circle cx="28" cy="0" r="12" fill="{ACCENT}"/><text x="28" y="5.5" text-anchor="middle" font-weight="600" font-size="15" fill="{PAPER}">1</text>', 'port lit'),
        (f'<circle cx="28" cy="0" r="12" fill="{INK}"/><text x="28" y="5.5" text-anchor="middle" font-weight="600" font-size="15" fill="{PAPER}">2</text>', 'port called'),
        (f'<g opacity="{AHEAD_OPACITY}"><circle cx="28" cy="0" r="12" fill="{PAPER}" stroke="{INK}" stroke-width="2"/><text x="28" y="5.5" text-anchor="middle" font-weight="600" font-size="15" fill="{INK}">3</text></g>', 'port ahead'),
        (f'<path d="M28 -12 L40 0 L28 12 L16 0Z" fill="{ACCENT}"/><text x="28" y="5.5" text-anchor="middle" font-weight="600" font-size="14" fill="{PAPER}">A</text>', 'A–C  what made it possible, 1869–70'),
    ]
    cx = x + 70
    for glyph, label in items:
        s.append(f'<g transform="translate({cx} {y-6})">{glyph}</g>')
        s.append(f'<text x="{cx+66}" y="{y}">{label}</text>')
        cx += 66 + 12 + int(len(label) * 8.2) + 34
    s.append('</g>')
    return '\n'.join(s)

def title():
    return (f'<g class="title"><text x="70" y="64" font-family="{SERIF}" font-weight="700" font-size="42" fill="{INK}">'
            f'Around the World in Eighty Days</text>'
            f'<text x="70" y="98" font-family="{SANS}" font-size="20" fill="{SEPIA}">The route of Phileas Fogg · '
            f'London, 2 October → 21 December 1872 · eight ports, eight legs, eighty days</text></g>')

def credits():
    return (f'<text x="70" y="1770" font-family="{SANS}" font-size="14" fill="{SEPIA}">Equirectangular, centre 10° E · '
            f'Coastlines: Natural Earth 1:110m (public domain) · Itinerary and dates: Jules Verne, Around the World in '
            f'Eighty Days, ch. III (fact-sheet F-10, F-11, F-33) · Yunyou studio 2026, generated (G-01)</text>')

def ledger_header():
    return (f'<text x="{LEDGER_X[0]}" y="1300" font-family="{SERIF}" font-weight="600" font-size="24" fill="{INK}">'
            f'The itinerary — the Daily Telegraph estimate Fogg wagers on</text>')

def continues_text():
    pieces = LEG_GEOM[6]
    yc = pieces[0][-1][1]
    return (f'<g class="continues" font-family="{SANS}" font-size="14" fill="{SEPIA}">'
            f'<text x="{W-24}" y="{f(yc-14)}" text-anchor="end">leg 6 continues at the left edge →</text>'
            f'<text x="24" y="{f(yc-14)}">→ leg 6, from the right edge</text></g>')

# ---------------------------------------------------------------- layers
def layer_L0():
    s = ['<g id="L0"><title>L0 — base: paper, coastlines, all ports, whole line at 30 % ink, key</title>',
         f'<rect x="0" y="0" width="{W}" height="{H}" fill="{PAPER}"/>',
         f'<rect x="0" y="0" width="{W}" height="{H}" fill="{INK}" filter="url(#fibre)" opacity="0.045"/>',
         f'<g clip-path="url(#mapclip)">',
         graticule(),
         f'<path class="land" d="{land_paths()}" fill="{LAND}" stroke="{SEPIA}" stroke-width="0.65" stroke-linejoin="round" fill-rule="evenodd"/>',
         '</g>',
         f'<rect x="0" y="{MAP_Y0}" width="{W}" height="{MAP_H}" fill="none" stroke="{SEPIA}" stroke-width="1"/>',
         title()]
    for k in range(1, 9):
        s.append(leg_stroke(k, 'ahead'))
    s.append(continues_text())
    for n, name, lon, lat, *_ in PORTS:
        x, y = proj(lon, lat)
        s.append(f'<circle class="port-dot" data-port="{n}" cx="{f(x)}" cy="{f(y)}" r="4" fill="{INK}"/>')
    for n in range(1, 9):
        s.append(badge(n, 'ahead'))
    s.append(port_labels())
    for k in range(1, 9):
        s.append(leg_label(k, AHEAD_OPACITY))
    s.append(key())
    s.append(ledger_header())
    for k in range(1, 9):
        s.append(ledger_row(k, 'ahead'))
    s.append(ledger_total('ahead'))
    s.append(credits())
    s.append('</g>')
    return '\n'.join(s)

def layer_DAY1():
    x, y = proj(-0.13, 51.51)
    return ('<g id="DAY1"><title>DAY1 — Day-1 state: London lit only, the whole route ahead</title>'
            + badge(1, 'accent') +
            f'<text x="{f(x+22)}" y="{f(y-18)}" font-family="{SANS}" font-weight="600" font-size="24" fill="{ACCENT}">Day 1 · London</text>'
            f'<text x="{f(x+22)}" y="{f(y+1)}" font-family="{SANS}" font-size="16" fill="{INK}">2 October 1872 · the whole route ahead</text>'
            '</g>')

def layer_Lk(k):
    l = LEGS[k - 1]
    s = [f'<g id="L{k}"><title>L{k} — leg {k}: {PORT_BY_N[l[1]][1]} → {PORT_BY_N[l[2]][1]}, {l[3]}, {l[4]} days ({l[5]})</title>']
    if k >= 2:
        s.append(leg_stroke(k - 1, 'ink'))
        s.append(ledger_row(k - 1, 'ink'))
    s.append(leg_stroke(k, 'accent', hit=True))
    if k >= 2:
        s.append(badge(k - 1, 'ink'))  # redraw: the ink stroke of leg k-1 just crossed it
    s.append(badge(k, 'ink'))
    if k <= 7:
        s.append(badge(k + 1, 'accent'))
    else:  # leg 8 arrives in London: London badge lit in L9, keep it ink here
        s.append(badge(1, 'ink'))
    s.append(leg_label(k))
    s.append(ledger_row(k, 'accent'))
    s.append('</g>')
    return '\n'.join(s)

def layer_L9():
    x, y = proj(-0.13, 51.51)
    return ('<g id="L9"><title>L9 — loop closed: London, 21 December 1872, 80 days</title>'
            + leg_stroke(8, 'ink') + ledger_row(8, 'ink') + badge(8, 'ink') + badge(1, 'accent') +
            f'<text x="{f(x+22)}" y="{f(y-18)}" font-family="{SANS}" font-weight="600" font-size="24" fill="{ACCENT}">Home · 21 Dec · 80 days</text>'
            + ledger_total('accent') + '</g>')

def layer_L10():
    s = ['<g id="L10"><title>L10 — enablers: A Suez Canal 1869 · B Promontory Summit 1869 · C Jabalpur 1870 (F-33)</title>']
    for letter, label, date, lon, lat, _spec, anchor, dx, dy in ENABLERS:
        s.append(enabler_pin(letter, label, date, lon, lat, anchor, dx, dy))
    s.append('</g>')
    return '\n'.join(s)

# ---------------------------------------------------------------- assembly
DEFS = f'''<defs>
<clipPath id="mapclip"><rect x="0" y="{MAP_Y0}" width="{W}" height="{MAP_H}"/></clipPath>
<filter id="fibre" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" stitchTiles="stitch"/>
  <feColorMatrix type="saturate" values="0"/>
</filter>
</defs>'''

def svg(layers, viewbox=(0, 0, W, H), title_txt='G-01 route map'):
    vx, vy, vw, vh = viewbox
    meta = LAYER_CONTRACT.replace('&', '&amp;').replace('<', '&lt;')
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vx} {vy} {vw} {vh}" preserveAspectRatio="xMidYMid meet" '
            f'role="img" aria-labelledby="g01title" font-family="{SANS}">\n<title id="g01title">{title_txt}</title>\n'
            f'<metadata>{meta}</metadata>\n<!-- generated by studio/tools/gen/g01_route_map.py — do not hand-edit -->\n'
            f'{DEFS}\n' + '\n'.join(layers) + '\n</svg>\n')

def build():
    L0, D1, L10 = layer_L0(), layer_DAY1(), layer_L10()
    Lk = [layer_Lk(k) for k in range(1, 9)] + [layer_L9()]
    files = {
        'route-map_master.svg': ([L0, D1] + Lk + [L10], (0, 0, W, H), 'G-01 master — all layers L0, DAY1, L1–L10'),
        'route-map_day-01-state.svg': ([L0, D1], (0, 0, W, H), 'Around the World in Eighty Days — route map, Day 1: London'),
        'route-map_full-loop_9-layers.svg': ([L0] + Lk, (0, 0, W, H), 'Around the World in Eighty Days — the full 80-day loop, eight legs'),
        'route-map_enablers-layer.svg': ([L0, D1, L10], (0, 0, W, H), 'Around the World in Eighty Days — Day 1 with the three enablers of 1869–70'),
        'route-map_day-01-state_16x9.svg': ([L0, D1], CROP_16x9, 'Route map, Day 1: London (16:9 crop)'),
        'route-map_full-loop_9-layers_16x9.svg': ([L0] + Lk, CROP_16x9, 'The full 80-day loop (16:9 crop)'),
        'route-map_enablers-layer_16x9.svg': ([L0, D1, L10], CROP_16x9, 'Day 1 with the three enablers (16:9 crop)'),
    }
    os.makedirs(OUT, exist_ok=True)
    for name, (layers, vb, t) in files.items():
        p = os.path.join(OUT, name)
        open(p, 'w').write(svg(layers, vb, t))
        print('wrote', os.path.relpath(p, ROOT), os.path.getsize(p) // 1024, 'KB')
    return files

def export_png():
    exporter = os.path.join(ROOT, 'studio/tools/svg2png.mjs')
    jobs = [
        ('route-map_day-01-state.svg', 'route-map_day-01-state@.png', '2176x1812,3840x2160,1920x1080,1080x2160'),
        ('route-map_full-loop_9-layers.svg', 'route-map_full-loop_9-layers@.png', '2176x1812,3840x2160,1920x1080,1080x2160'),
        ('route-map_enablers-layer.svg', 'route-map_enablers-layer@.png', '2176x1812,3840x2160,1920x1080,1080x2160'),
        ('route-map_day-01-state_16x9.svg', 'route-map_day-01-state_16x9@.png', '3840x2160,1920x1080'),
        ('route-map_full-loop_9-layers_16x9.svg', 'route-map_full-loop_9-layers_16x9@.png', '3840x2160,1920x1080'),
        ('route-map_enablers-layer_16x9.svg', 'route-map_enablers-layer_16x9@.png', '3840x2160,1920x1080'),
    ]
    for src, dst, sizes in jobs:
        cmd = ['node', exporter, os.path.join(OUT, src), os.path.join(OUT, dst), sizes, '--bg', PAPER]
        print('$', ' '.join(os.path.relpath(c, ROOT) if c.startswith('/') else c for c in cmd))
        subprocess.run(cmd, check=True, cwd=ROOT)

if __name__ == '__main__':
    build()
    if '--png' in sys.argv:
        export_png()
