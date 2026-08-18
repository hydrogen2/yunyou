#!/usr/bin/env python3
"""G-07 carpet-bag game UI — generates ../carpet-bag-game.svg (viewBox 2176x1812).
Palette: cream #efe6d3, ink #2a2118 / #5b4a3a, accent #b03a2e. Fonts: Playfair Display (title/labels), Source Sans 3 (counter/button).
Option order == scenes/11-pack-the-bag.scene.json interaction.options order (data-option index)."""
import os
CREAM, INK, INK2, ACC = "#efe6d3", "#2a2118", "#5b4a3a", "#b03a2e"
SERIF = "'Playfair Display', Georgia, serif"; SANS = "'Source Sans 3', system-ui, sans-serif"
# (label lines, correct, glyph)
ITEMS = [
 (["Two shirts"], True, "shirt"),
 (["Three pairs", "of stockings"], True, "stockings"),
 (["A mackintosh"], True, "mac"),
 (["A travelling-cloak"], True, "cloak"),
 (["Bradshaw's", "Continental Guide"], True, "bradshaw"),
 (["£20,000 in notes"], True, "notes"),
 (["A book from", "the study"], False, "book"),
 (["The electric clock"], False, "clock"),
 (["This morning's", "Times"], False, "times"),
]
def glyph(kind):
    s = f'stroke="{INK}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"'
    if kind == "shirt":
        return f'<path {s} d="M30 30 L55 18 Q70 34 85 18 L110 30 L122 58 L100 66 L100 118 L40 118 L40 66 L18 58 Z"/><path {s} d="M55 18 Q70 44 85 18"/>'
    if kind == "stockings":
        return (f'<path {s} d="M40 16 L74 16 L74 70 Q74 100 100 100 L112 100 Q120 100 120 110 Q120 122 108 122 L60 122 Q42 122 42 100 Z"/>'
                f'<path {s} d="M40 30 L74 30"/><path {s} d="M22 40 L48 40 L48 80 Q48 96 62 96"/>')
    if kind == "mac":
        return f'<path {s} d="M50 20 L70 34 L90 20 L118 34 L110 122 L30 122 L22 34 Z"/><path {s} d="M70 34 L70 122"/><path {s} d="M22 34 L10 80 M118 34 L130 80"/><path {s} d="M50 62 L62 62 M78 62 L90 62 M50 90 L62 90 M78 90 L90 90"/>'
    if kind == "cloak":
        return f'<path {s} d="M70 14 Q94 14 96 32 L126 122 L14 122 L44 32 Q46 14 70 14 Z"/><path {s} d="M70 32 L70 122"/><path {s} d="M50 24 Q70 46 90 24"/>'
    if kind == "bradshaw":
        return f'<rect x="28" y="18" width="84" height="104" rx="4" {s}/><path {s} d="M40 18 L40 122"/><rect x="48" y="40" width="54" height="30" fill="{ACC}" stroke="none"/><path {s} d="M50 90 L100 90 M50 104 L100 104"/>'
    if kind == "notes":
        return (f'<rect x="20" y="52" width="100" height="56" rx="4" {s}/><rect x="30" y="38" width="100" height="56" rx="4" fill="{CREAM}" {s}/>'
                f'<text x="80" y="82" text-anchor="middle" font-family="{SERIF}" font-size="34" fill="{INK}">£</text><circle cx="45" cy="66" r="6" {s}/><circle cx="115" cy="66" r="6" {s}/>')
    if kind == "book":
        return f'<path {s} d="M26 24 L26 116 L70 108 L114 116 L114 24 L70 32 Z"/><path {s} d="M70 32 L70 108"/><path {s} d="M36 48 L60 44 M36 64 L60 60 M80 44 L104 48 M80 60 L104 64"/>'
    if kind == "clock":
        return f'<circle cx="70" cy="70" r="46" {s}/><circle cx="70" cy="70" r="54" {s}/><path {s} d="M70 70 L70 40 M70 70 L92 82"/><circle cx="70" cy="70" r="4" fill="{INK}"/><path {s} d="M50 124 L90 124"/>'
    if kind == "times":
        return f'<rect x="20" y="24" width="100" height="96" rx="3" {s}/><path {s} d="M30 44 L110 44"/><rect x="30" y="56" width="34" height="34" {s}/><path {s} d="M74 60 L110 60 M74 74 L110 74 M74 88 L110 88 M30 104 L110 104"/>'
    return ""
o = []
o.append(f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="g07" viewBox="0 0 2176 1812" width="2176" height="1812" role="application" aria-labelledby="g07-title g07-desc" data-need="6" data-tile-w="340" data-tile-h="280">')
o.append('<title id="g07-title">Pack the carpet-bag</title><desc id="g07-desc">An open carpet-bag and nine items. Six go in, three stay at Savile Row. Drag or tap an item then tap the bag.</desc>')
o.append(f'''<style>
  #g07 .item{{cursor:grab}} #g07 .item:focus{{outline:none}} #g07 .item:focus .tile,#g07 .item.sel .tile{{stroke:{ACC};stroke-width:8}}
  #g07 .item.wrong .tile{{stroke:{ACC};stroke-dasharray:14 10}} #g07 .item.in .tile{{stroke:{INK}}} #g07 .item.in{{cursor:default}}
  #g07 .item.drag{{cursor:grabbing}} #g07 #close-btn{{cursor:pointer}} #g07 #close-btn:focus{{outline:none}} #g07 #close-btn:focus rect,#g07 #close-btn:hover rect{{fill:{ACC};stroke:{ACC}}} #g07 #close-btn:focus text,#g07 #close-btn:hover text{{fill:{CREAM}}}
  #g07 #bag.over #bag-body{{stroke:{ACC};stroke-width:10}}
</style>''')
o.append(f'<rect width="2176" height="1812" fill="{CREAM}"/>')
o.append(f'<text x="88" y="120" font-family="{SERIF}" font-size="76" font-weight="600" fill="{INK}">Pack the carpet-bag</text>')
o.append(f'<text x="88" y="180" font-family="{SANS}" font-size="38" fill="{INK2}">Ten minutes. Drag in what Fogg takes; leave what stays at Savile Row.</text>')
o.append(f'<line x1="88" y1="214" x2="2088" y2="214" stroke="{INK2}" stroke-width="2"/>')
# item tiles: 3x3 grid, origin (88,260), tile 340x280, gaps 35/40
TW, TH, GX, GY, X0, Y0 = 340, 280, 35, 40, 88, 260
o.append('<g id="items">')
for i, (lines, ok, g) in enumerate(ITEMS):
    c, r = i % 3, i // 3
    x, y = X0 + c * (TW + GX), Y0 + r * (TH + GY)
    label = " ".join(lines)
    o.append(f'<g class="item" id="item-{i}" data-option="{i}" data-correct="{"true" if ok else "false"}" data-home="{x} {y}" transform="translate({x} {y})" tabindex="0" role="button" aria-label="{label}">')
    o.append(f'<rect class="tile" x="0" y="0" width="{TW}" height="{TH}" rx="18" fill="{CREAM}" stroke="{INK2}" stroke-width="4"/>')
    o.append(f'<g class="glyph" transform="translate({TW//2-70} 22)">{glyph(g)}</g>')
    ty = 200 if len(lines) == 1 else 190
    for k, ln in enumerate(lines):
        o.append(f'<text x="{TW//2}" y="{ty + k*46}" text-anchor="middle" font-family="{SERIF}" font-size="36" fill="{INK}">{ln.replace("&","&amp;")}</text>')
    o.append('</g>')
o.append('</g>')
# hint (left, under the tiles)
o.append(f'<text x="88" y="1330" font-family="{SANS}" font-size="34" fill="{INK2}">Drag an item into the bag — or tap it, then tap the bag.</text>')
o.append(f'<text x="88" y="1384" font-family="{SANS}" font-size="34" fill="{INK2}">Wrong things snap back to Savile Row.</text>')
# bag
o.append('<g id="bag" data-need="6" aria-label="the carpet-bag">')
o.append(f'<path id="bag-handle" d="M1500 440 Q1690 250 1880 440" fill="none" stroke="{INK}" stroke-width="14" stroke-linecap="round"/>')
o.append(f'<path d="M1486 466 Q1690 300 1894 466" fill="none" stroke="{INK}" stroke-width="6" stroke-linecap="round"/>')
o.append(f'<rect id="bag-body" x="1300" y="560" width="780" height="620" rx="70" fill="{CREAM}" stroke="{INK}" stroke-width="8"/>')
# pattern hatch: diagonal lines clipped to body
o.append('<clipPath id="g07-bodyclip"><rect x="1300" y="560" width="780" height="620" rx="70"/></clipPath>')
o.append(f'<g clip-path="url(#g07-bodyclip)" stroke="{INK2}" stroke-width="3" fill="none">')
for k in range(-6, 14):
    x = 1300 + k * 90
    o.append(f'<line x1="{x}" y1="1180" x2="{x+620}" y2="560"/>')
o.append(f'<line x1="1300" y1="640" x2="2080" y2="640" stroke="{ACC}" stroke-width="10"/><line x1="1300" y1="1110" x2="2080" y2="1110" stroke="{ACC}" stroke-width="10"/>')
o.append('</g>')
# mouth (open, hinged): rim ellipse + interior fill so packed items look inside
o.append(f'<ellipse id="bag-mouth" cx="1690" cy="560" rx="392" ry="92" fill="{CREAM}" stroke="{INK}" stroke-width="8"/>')
o.append(f'<path d="M1298 560 Q1690 700 2082 560" fill="none" stroke="{INK}" stroke-width="6"/>')
o.append(f'<path d="M1310 540 L1300 470 M2070 540 L2080 470" stroke="{INK}" stroke-width="6" stroke-linecap="round"/>')
o.append(f'<circle cx="1300" cy="466" r="10" fill="{ACC}"/><circle cx="2080" cy="466" r="10" fill="{ACC}"/>')
o.append('<g id="packed"></g>')
o.append(f'<rect id="bag-drop" x="1270" y="330" width="840" height="880" rx="80" fill="{CREAM}" fill-opacity="0.001" stroke="none" pointer-events="all"/>')
o.append('</g>')
# counter + button
o.append(f'<text id="counter" x="1690" y="1330" text-anchor="middle" font-family="{SANS}" font-size="64" font-weight="600" fill="{INK}">0 of 6</text>')
o.append(f'<text x="1690" y="1384" text-anchor="middle" font-family="{SANS}" font-size="32" fill="{INK2}">things in the bag</text>')
o.append(f'<g id="close-btn" role="button" tabindex="0" aria-label="Close the bag">'
         f'<rect x="1400" y="1500" width="580" height="130" rx="20" fill="{CREAM}" stroke="{ACC}" stroke-width="6"/>'
         f'<text x="1690" y="1584" text-anchor="middle" font-family="{SANS}" font-size="52" font-weight="600" fill="{ACC}">Close the bag</text></g>')
o.append(f'<text x="2088" y="1770" text-anchor="end" font-family="{SANS}" font-size="26" fill="{INK2}">Yunyou · Around the World in 80 Days · Day 1 · G-07</text>')
o.append('</svg>')
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "carpet-bag-game.svg")
open(out, "w").write("\n".join(o) + "\n"); print("wrote", os.path.normpath(out))
