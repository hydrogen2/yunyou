# Player changelog
- 2026-08-18 v0 (built by Editor-in-Chief before the Engine role existed): renderers for video/streetview/photo/map/quiz/dialogue/game/card/interstitial;
  Commons URL resolution, YouTube IFrame API with in/out points, browser TTS with caption highlight, Leaflet route map,
  Street View via Maps Embed key or Maps-app link fallback, scripted chat fallback. Known gaps: no generated assets, no LLM,
  no narration-pause on interactions before speech ends, drag game is a checklist, no head-tracked/pano scenes.
- 2026-08-18 v0.1 (Engine): fixed the card-inset image being pinned top-left (`inset:auto` was declared after `right/bottom` and reset them);
  Promontory marker now drawn on the wrapped (+360°) copy of the Americas so it shows next to the route. New: `studio/tools/render/` linear-cut
  renderer (see its README) — screenshots this player headlessly (`showScene(n)`, `showRouteMap(bool)`) for card/map scenes.
- 2026-08-18 v0.1.1 (Engine, fix pass A1 — schema + validator only, player untouched): `scene.schema.json` gained optional keys
  `interaction.pause_narration/timeout_s/on_llm_unavailable/max_exchanges`, `interaction.kind: save`, `narration.after_script/starts_at_s`,
  `overlays[].at_waypoint` (`at_s` stays required as linear fallback), `media[].fallback` (+ documents `media[].note`). `validate.py`: WARN lines
  (`! WARN`, exit 0; `--strict` promotes them), `--no-jsonschema` to force the light checker (now checks number/boolean/minimum/array items),
  w/s rule over `duration_s − starts_at_s` counting `after_script` (fail > 3.2, warn > 2.5), `pause_narration` requires `timeout_s`,
  `at_waypoint` < len(route), dialogue without `on_llm_unavailable` warns, waypoint overlays exempt from density. Template checklist updated.
  The player does NOT honour any of these yet — runtime TODO table in `studio/tools/render/README.md` ("Runtime TODO"); the player still
  speaks the whole script over interactions and ignores timeouts, waypoints, fallbacks and `save`.

## 2026-08-18 — engine-tools: Day 1 typeset cards G-04/G-05/G-06/G-08
- New generator `studio/tools/gen/cards_day01.mjs` (data block at top → SVGs under `products/around-the-world-80-days/day-01-london/generated/g-0{4,5,6,8}/`, then PNGs via `svg2png.mjs`). Run: `node studio/tools/gen/cards_day01.mjs [g-04 g-05 g-06 g-08] [--no-png]`.
- G-04 exposes the tap contract for the card renderer: `g.row#row-N[data-option=i][role=button][tabindex=0]` with a full-width `rect.hit` (172 px tall at 2176×1812). Player wiring is a separate change (not in this commit).
- Look at: the four `*_WxH.png` exports and each `README.md` (F-ids, sizes, limits). No player/manifest/STATUS files touched.

## 2026-08-18 — G-02 "then vs now" generator (engine-tools)
- Added `studio/tools/gen/g02_then_now.mjs`: fills the split-frame template (16:9 3840×2160, fold-open 2176×1812, 9:16 1080×2160) from a JSON spec; id contract for the player's draggable seam (`#clip-now-rect`, `#seam`, `#seam-hit`, root `data-x0…y1`) documented in `products/around-the-world-80-days/day-01-london/generated/g-02/README.md`.
- Run: `node studio/tools/gen/g02_then_now.mjs <spec.json>`; PNGs via `studio/tools/svg2png.mjs`. Look at: `generated/g-02/png/then-now_charing-cross_M-24_vs_M-26_seam50_1920x1080.png`.
- Player not touched (scene 14 renderer / seam drag is a separate change).
