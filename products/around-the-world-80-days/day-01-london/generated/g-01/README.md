# G-01 — the 80-day route map (Day-1 state, per-leg reveal, enablers layer)

Generated 2026-08-18 by engine-tools with `studio/tools/gen/g01_route_map.py` (stdlib Python; PNGs via `studio/tools/svg2png.mjs`). Style: cream paper #efe6d3 (fibre noise ≤ 4.5 %), ink #2a2118, sepia #5b4a3a (coastlines 0.65 px, graticule, dates, credits), one accent #b03a2e (lit leg / lit port / enabler diamonds); land fill #e7dcc4; Playfair Display for title, port names and ledger, Source Sans 3 for everything else; no gradients, no shadows. Equirectangular, window 170 W → 190 E so the loop splits mid-Pacific (leg 6 leaves the right edge and re-enters at the left, with chevrons + "leg 6 continues" notes).

## Files
| file | viewBox / size | what |
|------|----------------|------|
| `route-map_master.svg` | 0 0 2176 1812 · 132 KB | all 12 layers `#L0 #DAY1 #L1…#L9 #L10` in one file (reference / future chapters) |
| `route-map_day-01-state.svg` | 2176×1812 · 96 KB | L0 + DAY1 — **scenes 01 and 10 (88–100 s)** |
| `route-map_full-loop_9-layers.svg` | 2176×1812 · 132 KB | L0 + L1…L9 — **scene 10 (30–88 s)**, the player reveals L1…L9 over time |
| `route-map_enablers-layer.svg` | 2176×1812 · 96 KB | L0 + DAY1 + L10 — **scene 10 (0–30 s)** |
| `route-map_{day-01-state,full-loop_9-layers,enablers-layer}_16x9.svg` | 0 0 2176 1224 · 96/132/96 KB | 16:9 crop of the same layers (title, map, key; ledger + credits sit below the crop) |
| `route-map_{…}_9x16.svg` | 487 0 1080 2160 · 96/128/96 KB | phone / fold-front: map crop x 487–1567 (≈ 89 W → 89 E), key on two rows, ledger in one column, credits on two lines |
| `route-map_{…}_2176x1812.png` | 2176×1812 · 2.0–2.1 MB | fold-open exports (three states) |
| `route-map_{…}_16x9_3840x2160.png` / `_1920x1080.png` | 3840×2160 · 5.2 MB / 1920×1080 · 1.5 MB | 16:9 exports for the linear cut (three states each) |
| `route-map_{…}_9x16_1080x2160.png` | 1080×2160 · 1.5 MB | phone exports (three states) |
| `src/ne_110m_land.geojson` | 136 KB, 127 features | Natural Earth 1:110m land polygons — **public domain** (naturalearthdata.com; no attribution required, credited anyway in the SVG credits line) |

## Layer contract (ids of `<g>`; also embedded in every SVG's `<metadata>`)
- `L0` base: paper, graticule, coastlines, all eight ports as numbered badges at 30 % (paper disc + 30 % outline/number), names + dates, all eight legs dashed at 30 % ink, leg labels at 30 %, ledger at 30 %, key, title, credits.
- `DAY1`: London badge lit (accent) + "Day 1 · London" (accent, 24 px) + "2 October 1872 · the whole route ahead" (ink, 16 px). Hidden by design whenever any L1…L9 is on.
- `L1…L8` (leg k): leg k solid accent + hit paths `path.hit[data-leg=k]` (transparent, 48-unit stroke, `<title>` "Leg k: A → B, mode, n days"); leg k-1 redrawn solid ink; badge k ink, badge k+1 accent; on-map label k + ledger row k solid (row k-1 ink). Leg 6 is two paths (frame-edge split) so there are 9 hit paths in all.
- `L9` loop closed: leg 8 ink, badge 8 ink, London lit again + "Home · 21 Dec · 80 days", ledger total in accent.
- `L10` enablers (F-33): accent diamonds A Suez Canal 17 Nov 1869 (drawn SW of Suez in the desert with a sepia leader to the badge — the canal is 8 px from the port at this scale), B Promontory Summit 10 May 1869, C Jabalpur 7 Mar 1870, each with letter + ink label + accent date; independent of the leg layers.
- Colour is never the only signal: current = accent filled, travelled = ink solid, ahead = 30 % dashed / outline; the key spells all six states out in words.

## How the player drives it (`studio/player/index.html` v0.2: `mkGen` → `wireG01`, lines ~156–163 and ~317)
- Map scenes with `kind: generated` media get a scene-time schedule; at each item's `start_s` the SVG is fetched and inlined into `#media` (`svg.gen`, fills the box, `xMidYMid meet`). Switching files is a **hard swap**, not a fade — scene 10's "fade back to Day 1" at 88 s is a cut to `route-map_day-01-state.svg`.
- If the file name matches `full-loop`: legs `#L1…#L9` are revealed cumulatively across the media window (`start_s`…`end_s`, i.e. 30–88 s in scene 10 → one layer every ≈ 6.4 s; L1 is on at 30 s, all nine by 88 s) by toggling `display` — no per-leg draw-on animation.
- Every `.hit[data-leg]` gets `cursor:pointer` and a click → `pickOption(k-1)` (the k-th option button in the panel, `London → Suez` = 0 … `New York → London` = 7). After a pick, that leg's hit path is tinted accent at 35 % (`genHooks.onPick`). Hits exist only inside `L1…L8`, so a leg becomes tappable when it is revealed, and there are **no map hit targets on the day-01-state / enablers files** — only the panel buttons.
- Fallback: fetch error or non-SVG → `leafletRouteMap(dayState)` (Leaflet + CARTO tiles, dashed route, Promontory/Suez/Jabalpur pins); other generated refs → `sceneCard`. `showRouteMap(dayState)` (used by `render_linear.mjs`) prefers the SVG and falls back the same way.

## Facts used
- F-10 itinerary and days: London → Suez rail + steamer 7 · Suez → Bombay steamer 13 · Bombay → Calcutta rail 3 · Calcutta → Hong Kong steamer 13 · Hong Kong → Yokohama steamer 6 · Yokohama → San Francisco steamer 22 · San Francisco → New York rail 7 · New York → London steamer + rail 9. Verified in the SVGs: ledger total reads `7 + 13 + 3 + 13 + 6 + 22 + 7 + 9 = 80 days`; port dates 2 Oct · 9 Oct · 20 Oct · 25 Oct · 6 Nov · 14 Nov · 3 Dec · 11 Dec · 21 Dec all present.
- F-11: 2 Oct → Saturday 21 Dec 1872, "a quarter before nine" (ledger footnote, title line, DAY1/L9 captions).
- F-33: the three enablers and dates (L10 + key row "A–C what made it possible, 1869–70").
- Ports/enablers use present-day coordinates; the intermediate waypoints (Mont Cenis, Brindisi, Aden, Singapore, Ogden, Chicago …) are hand-placed for shape, not from a source.

## Which scenes reference which files
- `scenes/01-cold-open.scene.json`: `generated/g-01/route-map_day-01-state.svg` (8–75 s; M-34 inset over it at 50–62 s).
- `scenes/10-the-world-shrinks.scene.json`: `route-map_enablers-layer.svg` (0–30 s) → `route-map_full-loop_9-layers.svg` (30–88 s, timed reveal + tap-to-find) → `route-map_day-01-state.svg` (88–100 s).
- Manifest row G-01 also lists 16:9 3840×2160 / 1920×1080 and 1080×2160 for the linear cut and phone; the linear renderer shoots the player instead of using the PNGs.

## Regenerate
```
python3 studio/tools/gen/g01_route_map.py          # 10 SVGs (master, 3 states × fold / 16x9 / 9x16)
python3 studio/tools/gen/g01_route_map.py --png    # + 12 PNGs via studio/tools/svg2png.mjs (needs studio/tools/render/node_modules + Chromium)
node studio/player/test/smoke_generated.mjs --only 0,9   # player wiring check (scenes 01, 10) → studio/player/test/out/RESULTS.md
```
Content lives in the `PORTS` / `LEGS` / `ENABLERS` tables at the top of the script; layouts in `LAYOUTS` (`fold`, `9x16`); the 16:9 file is a viewBox crop of the fold layout.

## Limits / known weak points (looked at `_full-loop_9-layers_16x9_1920x1080.png`, `_day-01-state_9x16_1080x2160.png`, `_enablers-layer_2176x1812.png`)
- **Label collisions**: the leg-4 dashed line (Calcutta → Hong Kong) runs through the "Hong Kong / 6 Nov" label; "rail + steamer · 7 days" (leg 1) sits on the leg-1 line over the Mediterranean; "steamer · 13 days" (leg 4) and "steamer · 6 days" (leg 5) sit on or touch their lines. Readable at 1080p, ugly at 4K. Fix = nudge `dx, dy` in `PORTS` / label anchors in `LEGS`.
- **"Day 1" label + lit/unlit legend (scenes 01/10 accessibility ask): present** — DAY1 carries "Day 1 · London" + "2 October 1872 · the whole route ahead" in words, and the key names "this leg (lit) / travelled / ahead (30 % ink, dashed) / port lit / port called / port ahead" on all three formats. Not present: a "Day 1" mark on the full-loop file (by design), and no ARIA text per layer beyond the `<title>` elements.
- **Tap targets**: hit stroke is 48 user units = 48 px on the 2176×1812 fold-open export at 1:1 (≥ 44 px, met on paper). In the player the SVG is scaled to `#media`: at the smoke test's 768×620 box it is ≈ 17 CSS px, on a phone in 16:9 ≈ 9 CSS px — well under 44. The whole leg length is tappable, so it is forgiving along the line but not across it; the panel buttons remain the reliable target. Also, where a later layer's ink stroke lies exactly over an earlier hit path, the thin ink line (not the hit) is topmost — a tap dead-centre on a travelled leg can miss (±22 units either side works).
- **16:9 crop drops the ledger, the "= 80 days" total and the credits line** (they sit at y ≥ 1300 of the fold layout; the crop is y 0–1224). The scene-10 caption at 60–72 s carries the sum in the linear cut, but the 16:9 frames carry no Natural Earth / source line — Rights should decide whether the linear cut's credits page is enough. Empty band of ≈ 120 px under the key at 1920×1080, ≈ 215 units between key and ledger on the fold-open, ≈ 400 units between ledger and credits on 9:16.
- **9:16 crop**: Calcutta's badge is half-cut at the right edge (x 1562 in a 487–1567 window) and its name/date are dropped; leg labels that would cross the frame are suppressed rather than re-placed.
- **M-52 (Hetzel's 1872 plate) style**: echoed in spirit — ink line on cream paper, numbered ports, no colour beyond one accent, hand-jittered route stroke — but the generator was written from the manifest description, not against the plate; no side-by-side, no attempt at its lettering, hatching or projection.
- Suez Canal pin A is a callout (diamond in the Egyptian desert + leader), not at the canal's coordinates; the map stops at 60 S (no Antarctica); coastlines are 1:110m so Suez/Aden/Singapore geometry is coarse; no Ken-Burns/zoom on the map in the player.
- Fonts are not embedded: the player links `studio/player/fonts/fonts.css`; `svg2png.mjs` injects it. Opened raw in a browser without those fonts the SVG falls back to Georgia / system sans.

Digest — Did: documented every file in g-01, the layer contract as the player actually drives it, facts, scene refs, regen commands and honest limits. Weak: label collisions and sub-44-px hit strokes at player scale are real defects, not doc issues; 16:9 frames carry no credits line. Next: nudge the four colliding labels, widen the hit stroke to ~90 units on the fold layout, add a credits strip inside the 16:9 crop, and a true fade in the player.
