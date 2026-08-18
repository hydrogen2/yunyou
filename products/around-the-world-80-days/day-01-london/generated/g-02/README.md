# G-02 — "Then vs now" split-frame (template + Charing Cross pair)

Generated 2026-08-18 by engine-tools with `studio/tools/gen/g02_then_now.mjs`. Style: cream paper #efe6d3, ink #2a2622, one accent #b03a2e; no gradients/shadows on paper or UI (the only gradient is the vignette mask on the engraving).

## Files
| file | what |
|------|------|
| `then-now_template.svg` | empty 16:9 template (3840×2160 viewBox), placeholder hrefs `src/THEN.jpg` / `src/NOW.jpg`, full id contract |
| `then-now_charing-cross_M-24_vs_M-26.svg` | **the shipped pair, 16:9** — referenced by `scenes/14-then-and-now.scene.json`; hrefs `src/M-24.jpg`, `src/M-26.jpg` (relative, works served from /products/…) |
| `then-now_charing-cross_M-24_vs_M-26_2176x1812.svg` | fold-open (~6:5) variant, own crops |
| `then-now_charing-cross_M-24_vs_M-26_1080x2160.svg` | 9:16 phone variant, vertical seam kept, tight on the two crosses, captions stacked |
| `then-now_reform_M-22_vs_M-20.svg`, `then-now_savile-row_M-32_vs_M-33.svg` | alternates for swaps only (16:9), see limits |
| `png/…_seam25/50/75_3840x2160.png`, `…_seam50_1920x1080.png`, `…_seam50_2176x1812.png`, `…_seam50_1080x2160.png` | static exports of the Charing Cross pair (linear cut / review); alternates + template at 1920×1080 |
| `charing-cross.json`, `reform.json`, `savile-row.json` | generator specs (crops, captions, source line) |
| `src/` + `src/SOURCE.md` | the six Commons originals, provenance, `api/` raw imageinfo |

## Id contract (player drives the seam)
```
<svg id="g02" viewBox="0 0 W H" data-seam="0.5" data-x0 data-x1 data-y0 data-y1>   image-area bounds in user units
  <g id="then-layer">  <image id="then" …>            full-frame left photo (sepia filter + vignette on the wrapping <g>; a nested <svg viewBox> does the manual crop)
  <g id="now-layer" clip-path="url(#clip-now)">  <image id="now" …>   full-frame right photo
  <clipPath id="clip-now"><rect id="clip-now-rect" x="{seamX}" y="{y0}" width="{x1-seamX}" height="{y1-y0}"/></clipPath>
  <g id="seam" transform="translate({seamX} 0)">  <line id="seam-line"> (accent, 2 px at display size)  <circle id="seam-handle"> (ink)  <rect id="seam-hit"> (transparent tap target ≥ 44 CSS px)
  <g id="captions"> <text id="cap-then"> <text id="cap-now"> <text id="source-line">
```
Drag: for seam fraction `s ∈ [0,1]` compute `seamX = x0 + s*(x1-x0)` (from the root's data attributes), then set `clip-now-rect.x = seamX`, `clip-now-rect.width = x1 - seamX`, `seam.setAttribute('transform', 'translate(seamX 0)')`, `root.dataset.seam = s`. Convert pointer px → user units with `svg.getScreenCTM().inverse()`. Everything is in viewBox units; nothing else moves. Attach pointer events to `#seam-hit` (and, for a big target, the whole svg).

## Regenerate
```
node studio/tools/gen/g02_then_now.mjs products/around-the-world-80-days/day-01-london/generated/g-02/charing-cross.json          # 3 SVGs (16x9, fold, 9x16)
node studio/tools/gen/g02_then_now.mjs --template products/around-the-world-80-days/day-01-london/generated/g-02/then-now_template.svg
node studio/tools/gen/g02_then_now.mjs …/charing-cross.json --seam 0.25 --suffix _seam25 --formats 16x9   # static seam for a PNG, then:
node studio/tools/svg2png.mjs …/then-now_charing-cross_M-24_vs_M-26.svg "…/png/then-now_charing-cross_M-24_vs_M-26_seam50@.png" "3840x2160,1920x1080" --bg "#efe6d3"
```
Spec JSON: `then/now: {href, natural:[w,h], crop:{"16x9":[x,y,w,h], "fold":…, "9x16":…}}` (crop in source pixels; omit → cover-fit), `captions`, `source`, `seam`, `formats`. Fonts: the SVG names `'Playfair Display'` / `'Source Sans 3'`; svg2png injects `studio/player/fonts/fonts.css`, the player must link it.

## Decisions
- **Crops / eye-line.** M-26 is a tight portrait of the upper cross, M-24 a wide forecourt, so a literal scale match is impossible. 16:9: engraving cropped to x 354–1802, y 320–1047 (drops the title lettering and signature; cross at ~43 % of the frame width, tip at ~10 % height); photo band y 2100–3305, x 0–2400 (canopy stage + spire base against the hotel, spire at ~57 %). At seam 0.5 both crosses are fully visible, one each side of the seam; the gothic canopy stages sit in the same middle band (engraving ~35–50 %, photo ~45–70 % of frame height). Fold-open: same idea (cross 41 % / 57 %). 9:16: tight on the crosses — engraving x 763–1369 full height (cross at 35 %), photo x 0–2100, y 60–4045 (whole cross incl. gilt finial, at 65 %); captions stacked on two lines.
- **Sizes.** "8 px" paper margin = 16 user units at 3840 and 2176, 24 at 1080 (≈ 8 CSS px at the size each format is normally shown). Seam line 4 units at 3840/1080 (2 CSS px), 3 at 2176. Handle r 30/26/30 units, hit rect 96/90/132 units (≥ 44 CSS px). Source line 22/20/26 units ≈ 8 pt at display scale.
- **Sepia** = 70 % sepia matrix + 30 % identity with a slight lift, so the plate reads cream-brown rather than yellow; vignette = radial mask fading to 72 % opacity at the corners plus a fine hatch pattern masked to the edges (the "engraved-line" edge). Applied to the "then" side only; `"sepia_then": false` turns it off (e.g. for a period photo).
- Captions from F-21 / F-22 (7 and 9 words). Alternates: Reform captions from F-15 (Barry, opened 1841) / F-14–F-15 (104 Pall Mall, Grade I); Savile Row from F-19 / F-45 (tailors from c. 1803; Poole at No. 15 since 1982).

## Known limits
- Static SVGs are at seam 0.5; the linear cut needs either the seam25/50/75 PNGs or a player render with an animated seam.
- M-22 (709 px), M-32 (695 px) and M-33 (494 px) are small — soft at 4K; the alternates are swap examples, not shipping assets. M-20 is a protest-day photo (EU flag, placards); the top band (club flag + cornice) was used but it is a weak "now" — prefer M-21 or a Street View still if the Reform pair ever ships. Reform/Savile Row pairs are CC BY-SA (share-alike).
- Upscale: the 16:9 engraving crop (1448 px → 3808 units) is ~2.6× at 4K, fine at 1080p; the 9:16 crop (606 px → 1032) is ~1.7×.
- The seam is not draggable in the SVG itself (no script) — the player implements it; `#seam-hit` is the tap target.
- Not tested in the player yet; svg2png (Chromium) render only. Nested `<svg viewBox>` crops + `clip-path` on a `<g>` are standard SVG 1.1 and should behave the same in the player.

Digest — Did: fetched six Commons originals with provenance, wrote a JSON-driven generator, shipped the template, the Charing Cross pair in three formats with PNGs at three seams, and two alternates. Weak: eye-line is a compromise (scale mismatch between a forecourt engraving and a close-up spire); alternates use tiny sources. With more time: a still from M-08 (05:00–05:25) as a wide "now" that truly matches the engraving's viewpoint, and a player-side drag demo page.
