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
