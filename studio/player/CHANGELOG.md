# Player changelog
- 2026-08-18 v0 (built by Editor-in-Chief before the Engine role existed): renderers for video/streetview/photo/map/quiz/dialogue/game/card/interstitial;
  Commons URL resolution, YouTube IFrame API with in/out points, browser TTS with caption highlight, Leaflet route map,
  Street View via Maps Embed key or Maps-app link fallback, scripted chat fallback. Known gaps: no generated assets, no LLM,
  no narration-pause on interactions before speech ends, drag game is a checklist, no head-tracked/pano scenes.
- 2026-08-18 v0.1 (Engine): fixed the card-inset image being pinned top-left (`inset:auto` was declared after `right/bottom` and reset them);
  Promontory marker now drawn on the wrapped (+360°) copy of the Americas so it shows next to the route. New: `studio/tools/render/` linear-cut
  renderer (see its README) — screenshots this player headlessly (`showScene(n)`, `showRouteMap(bool)`) for card/map scenes.
