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

## 2026-08-18 — v0.2 (engine-tools, A2: generated assets wired)
Spans the 20:00 and 23:00 runs (`git diff 5214e8b~1..HEAD -- studio/player/index.html studio/tools/render/render_linear.mjs`; the 20:00 run's player changes were not logged then).
- **Generated SVGs are inlined, not `<img>`'d.** `fetchGen(ref)` resolves `media[].ref` against the tour dir (cached; anything that is not `<svg` or a 2xx → `null`), `inlineSvg` drops `width/height`, forces `viewBox` + `xMidYMid meet`, rewrites relative `<image href>`s to the asset's folder and mounts the root as `#media .genwrap svg.gen` (fills the media box, `touch-action:none`, `focus-visible` ring only). `fonts/fonts.css` (Playfair Display + Source Sans 3, self-hosted woff2) is linked so the SVGs' named fonts resolve.
- **Scene-time media schedule.** `setSchedule(items)` / `schedTick()` — items `{start, fn, onTick?}` sorted by `start_s`; every 500 ms `tick()` runs the item whose window `elapsed` is in (once) and its `onTick`. `mkGen(m, s, {ok, fail})` builds one item per `kind: generated` medium: fetch → inline → `ok(svg, item)`, or `fail()`. Guards: `sceneSerial` bumps on every `showScene`, and `showImage` / `photoCycle` / `insetImage` all re-check `sched.active` after their async Commons lookup, so a slow image can no longer clobber a card that was scheduled later ("late-image-clobber guard"). `seek(sec)` jumps the scene clock (media schedule + overlays follow) — hook for the smoke test and the linear renderer.
- **`wireG01`** (map scenes, `route-map`/`g-01` refs): on `full-loop` files the `#L1…#L9` groups are revealed cumulatively across the medium's `start_s…end_s` window (`display` toggle, one layer per `(end-start)/9` s); `.hit[data-leg=k]` click → `pickOption(k-1)` (the k-th panel option button); after a pick that leg's hit stroke is tinted accent 35 % (`genHooks.onPick`). The scene-10 "fade back to Day 1" is the schedule swapping to `route-map_day-01-state.svg` at 88 s — a hard cut, no fade. Fallback if the SVG is missing/not SVG: `leafletRouteMap(dayState)` (the v0 Leaflet map, now a named function); `showRouteMap(dayState[, ref])` (used by `render_linear.mjs`) prefers the SVG and falls back the same way.
- **`wireG02`** (photo scenes, `then-now`/`g-02` refs or `svg#g02`): seam drag anywhere on the svg (pointer capture; px → user units via `getScreenCTM().inverse()`), sets `#clip-now-rect` x/width and `#seam` translate from root `data-x0/x1/seam`; auto-detects whether "now" is the left or right side; `←`/`→` move 2 %; `aria-label` on the svg. Photo scenes with `kind: image` before the first generated start still `photoCycle`; a failed G-02 falls back to `photoCycle` (or `sceneCard` if no images).
- **`wireG04`** (card/quiz scenes with `choice`/`tap-to-find` + generated asset): `g.row[data-option]` gets `role=button tabindex=0`; click / Enter / Space → `pickOption(i)`; on pick a `.row-hl` accent rect is drawn round the row; the panel's feedback line shows and the `pause_narration` countdown is cleared. Fallback: `sceneCard(s, [G-id])` ("generated asset pending: G-04").
- **`wireG07`** (game scenes): drag `.item[data-option]` into `#bag-drop` (or tap item then tap bag; keyboard: Enter/Space selects an item, Enter/Space on the bag/close button acts). Correct → `.in`, scaled ×0.5 into one of six slots inside `#bag-body`, `#counter` "n of 6", the panel checklist button ticks; wrong → `.wrong`, snaps to `data-home`, the option's `feedback` line is shown and spoken (`gameApi.feedback`). `#close-btn` or the panel "Close the bag" → the shared summary ("n of 6 right, k things Fogg would have left behind"), svg locked; `tick()` closes the bag automatically at `duration_s`. Panel buttons stay the accessible alternative and stay in sync (`gameApi.setBtn` / `gameApi.svg.setIn|snap|lock|count`).
- **Interaction runtime (schema keys from A1, now honoured):** `narration.starts_at_s` (TTS delayed, clock from 0); `pause_narration` + `timeout_s` — after the script ends the clock pauses (schedule + overlays hold), `#countdown` in the footer counts down, on timeout `box.autoResolve` (choice/tap-to-find → correct option; drag → close the bag; chat/walk → just resume); `narration.after_script` spoken after the feedback of a graded pick or after the bag closes (once); `interaction.kind: save` — "Save card (PNG)" (inline SVG → canvas with fonts inlined as data: URLs, falls back to opening the SVG) + "Share" (Web Share with the PNG file, else copy link). Info taps (options without `correct`) stay open for more taps; graded picks disable the others. `speak(text, onBoundary, onEnd)` now has an `onEnd`, with a 1.5 s "no voice / TTS refused" guard so headless and voiceless devices still reach the countdown. Non-generated card/interstitial scenes render `sceneCard` + Commons inset as before.
- **`render_linear.mjs` (one line):** photo scenes whose generated asset is an `.svg` are shot from the player at the asset's scene time (`showScene(n).then(()=>seek(start_s))`) instead of being fed to ffmpeg (no SVG decoder); PNG/JPG generated assets still go the Ken-Burns route.
- **Smoke test** `studio/player/test/smoke_generated.mjs`: headless Chromium (playwright-core from `studio/tools/render/node_modules`) opens the player, `showScene(i)`, `seek`s to where each asset is scheduled, asserts the svg is inlined and still there 2.5 s later, drives G-01 (reveal 1→5→9, tap leg 6 → option 5, day-01 state at 89 s), G-02 (seam), G-04 (row tap, feedback, countdown cleared), G-07 (drag right/wrong, tap-then-tap, close), G-08 (save button), collects console errors + failed requests, screenshots `test/out/scene-NN[-b].jpg` (1280×720 jpeg q60). Run: `node studio/player/test/smoke_generated.mjs [--player https://localhost/player/] [--tour /products/…/tour.json] [--only 2,9,10] [--size 1280x720]`; exit 1 on any failure; writes `test/out/RESULTS.md`. Committed result: **ALL PASS 2026-08-18 23:11 UTC** (that file is a `--only 2,9,10` re-run: scenes 03 G-04, 10 G-01, 11 G-07; the 23:10 screenshots of scenes 01/08/09/14/19 are from the full run just before).
- Look at: `test/out/scene-10.jpg` / `scene-10-b.jpg` (loop reveal + tapped leg), `scene-11-b.jpg` (bag with two packed), `scene-14-b.jpg` (seam moved), `scene-03-b.jpg` (row highlight).
- **Still NOT done** (Runtime TODO table in `studio/tools/render/README.md`, re-checked against the code): `interaction.on_llm_unavailable` (dialogue always renders the chips path, the value is not read; `skip`/`scripted` unimplemented), `interaction.max_exchanges` (ignored), `overlays[].at_waypoint` (walk overlays fire on `at_s` only), `media[].fallback` (ignored — a dead YouTube id / missing Maps key still shows the v0 placeholder), walk `timeout_s` → "advance to next stop" (timeout only unpauses), chapter-length estimate including timeouts. Also unchanged: no LLM, no head-tracked/pano scenes, no true cross-fade between scheduled media, no draw-on animation for the route legs, G-01 hit strokes are 48 user units (≈ 17 CSS px at the smoke test's 768-px-wide map — the panel buttons remain the ≥ 44 px target). The linear renderer still ignores `pause_narration`/`after_script` ordering rules and `on_llm_unavailable` (its side of that table is unchanged this run).

## 2026-08-19 — v0.3 (engine-tools, A3p: newcomer aids from the Audience Report #1 decisions)
Schema + validator + player + one content-adjacent data file (compiled, not narrated). All old scene files unaffected; every new feature degrades to v0.2 behaviour when its input is absent.
- **Schema:** `narration.variants` (object of parallel full-replacement scripts keyed by variant id; first id: `clear` = plain-English track — why: the founder-playtest decision to add a clear-English narration layer) and overlay `kind: gloss` (glossary chip; `text` = "word — plain-English definition" — why: tap-a-word glossary cards for period terms). `tour.schema.json`: chapter `recap` ("previously on…", cover-only) and tour-level `whos_who` (path override). `validate.py`: gloss chips exempt from the 1-per-15-s density rule, warn when a gloss text has no em-dash, and each `variants.*` track is measured against the same w/s budget as `script` (err > 3.2, warn > 2.5). Template checklist documents variants + gloss.
- **Player — Clear English:** start-screen toggle (persists `yy-clear`); when on, `narration.variants.clear` replaces `script` for BOTH TTS and the caption panel (per scene; scenes without a variant fall back silently) and the default TTS rate drops to 0.9.
- **Player — speed control:** `#rate` select (0.8/0.9/1.0/1.1×) next to the voice picker, persists `yy-rate`; an explicit choice wins over the clear-mode 0.9 default. `speak()` now reads `ttsRate()` per utterance (was hard-coded 0.98).
- **Player — gloss chips:** `gloss` overlays render in `#overlays` as tappable `button.gloss` chips (📖 prefix, dashed accent border); tap speaks the definition. `pendingNarrEnd` hand-off keeps the scene's wait-state chain (countdown → auto-resolve → `after_script`) alive when a gloss tap interrupts the narration mid-script.
- **Player — who's who:** header button (hidden until `products/<p>/shared/whos-who.json` — or `tour.whos_who` — loads; missing/invalid file = no button, one console warn). Opens a modal card (`#who`, role=dialog): name + one plain sentence per entry; F-ids stay in the JSON for reviewers and are never rendered. Scene clock + speech pause while open (Esc / Close / backdrop click to resume). NOTE: a running interaction countdown does NOT pause — open-during-countdown can auto-resolve behind the card.
- **New file** `products/around-the-world-80-days/shared/whos-who.json`: 7 entries (Fogg, Passepartout, Verne, Sheridan, the five whist partners as one, Thomas Cook, G. F. Train), each cited to fact-sheet ids; Train's "I'm Phileas Fogg" paraphrased per F-36's med-confidence note.
- **Player — chapter recap:** cover shows `chapter.recap` under the hook with a "PREVIOUSLY" label; absent recap renders nothing (chapter 1 unchanged).
- **Bug found & fixed:** `speak()` looked up the voice via `$('#voice').value`, but the `#voice` select lives on the cover, which `#start` removes — on any browser WITH voices installed every post-start utterance threw `TypeError` inside `voices.find` (headless/voiceless runs never executed the callback, so v0.2's smoke test missed it). Voice name is now cached in `voiceName` (+ localStorage); `loadVoices()` tolerates the missing select.
- **Test** `studio/player/test/smoke_v03.mjs` (playwright-core from `studio/tools/render/node_modules`): 22 checks in 2 passes — cover controls, recap, variant swap + fallback, rate precedence, gloss chip render/tap, who's-who open/pause/close/no-F-ids, missing-whos-who degradation, and a regression check for the voice crash (injects a fake `voices[]` post-start). Injects recap/variant/gloss into the tour via `page.route` — content files untouched; route matching uses `URL.pathname` predicates because the player URL carries `tour.json` in its query string. Run: `node studio/player/test/smoke_v03.mjs [--player https://localhost/player/] [--tour /products/…/tour.json]`. Result 2026-08-19: **ALL PASS (22/22)**; `smoke_generated.mjs --only 2,10,13` re-run after the edits: **ALL PASS** (no v0.2 regression).
- Look at: the cover (toggle + speed dial + recap), scene 1 with `?` — inject a `gloss` overlay or use the smoke test; the who's-who card from the 👥 header button.
- Still NOT done: `after_script`/interaction feedback lines have no clear variant (they play as written); gloss taps rewind nothing (narration resumes at the next line, not where it left off — the interrupted remainder is skipped, only the wait-state chain survives); who's-who is one flat card (no per-scene "who is on screen now" filter); localization variants (zh) are schema-ready but the player only knows `clear`; the linear renderer ignores variants/gloss entirely (linear cut = main track).

## 2026-08-19 — v0.4 (engine-tools, A4: the `streetview` scene type walks itself)
Founder brief: *"if i need to click on the streetview to walk it's too much work; I want it like watching a video."* The manual
stop-by-stop stepper is gone. A streetview scene is now a shot: the camera walks the route by itself, paced to `duration_s`,
and turns to look at what the narration names. **No click is required to progress, ever** — and a streetview walk no longer
counts as "needs input", so the scene hands on to the next one like a video.
- **Schema:** new top-level `camera` array — `{at_s, heading | look_at, pitch?, zoom?, hold_s?, ease_s?, at_waypoint?, label?}`
  (why: the view has to turn to the Reform Club *as the guide names it*, and a heading alone cannot survive Google moving the
  nearest pano). `look_at: "lat,lng"` is aimed from wherever the camera actually is; `heading` is the fallback for modes that
  cannot know their position. Old scene files are unaffected — with no `camera` track the runtime synthesises one cue per stop
  from the stop's own heading, i.e. exactly the v0.3 framings, walked instead of stepped. No migration needed.
- **Pacing comes from the content, not from a new field.** Waypoint *k* is timed to arrive at the earliest `at_s` of the
  overlays carrying `at_waypoint: k`; scenes without waypoint overlays spread their stops over the first 72 % of the scene.
  So the pin, the sentence and the arrival coincide by construction (this is `overlays[].at_waypoint`, finally honoured —
  inverted: it schedules the walk instead of re-firing the overlay).
- **Fallback ladder, silent and automatic** (`window.__sv.mode`):
  1. `js` — Maps JavaScript API `StreetViewPanorama`. `StreetViewService.getPanorama` finds the stop pano
     (`StreetViewSource.GOOGLE`, so no third-party photosphere attribution), then the walk hops pano-to-pano along each
     pano's `links` (nearest link heading within 62° of the bearing to the target; no link down that street → one
     `getPanorama` hop). POV is eased every frame with a critically damped spring (`svSmooth`, rAF) — ease-in *and* out,
     tracks a moving target, never snaps. Each position change cross-fades. Rate limit is on the **wall clock**, so a `seek`
     cannot freeze the walk.
  2. `stills` — Street View Static hyperlapse on the same timeline: frames every `step_m` metres (and one per look-at),
     capped at `max_stills`, cross-faded between two `<img>` layers, requested at playback time with a ≤ 2-frame lookahead.
     Availability is probed with the free *metadata* endpoint (which answers HTTP 200 even when the key is denied, so the
     probe cannot print a console error); if the key's referrer restrictions deny our origin the probe retries with
     `referrer-policy: no-referrer` and the images follow that policy.
  3. `link` — no key / nothing enabled: the v0.3 "open in Google Maps" card, except it now advances through the stops on the
     timeline by itself.
  A `gm_authFailure` **mid-scene** (key restricted, billing off, API disabled) tears the dead panorama down and slides to
  `stills` without an error card and without a broken pano on screen. Verified live in the smoke test.
- **Viewer control without chores:** dragging takes the camera off auto-walk instantly (`pointerdown`/`wheel`) and it takes
  over again ~4 s after the last touch, easing from wherever the traveller left it. Controls: `⏸` pause/resume (scene clock +
  speech) and `↻` replay the walk. That is the whole UI.
- **Rights compliance is in the code, not in a note:** controls top-left, our attribution chip top-right, and the cross-fade
  element is `bottom: 30px` so Google's logo and ©-line inside the pano/frame are never covered (the old stop stepper sat
  bottom-left, right on top of the logo). Nothing is recorded, cached or pre-bundled; the linear renderer still draws stop
  cards and never screen-records Street View.
- **Config** (`www/config.json`, gitignored — see the new committed `www/config.example.json`): `streetview.mode`
  (`auto|js|stills|link`, per-browser override `localStorage['yy-sv-mode']`), `step_m` (metres of drift before the walk hops —
  this is the **cost dial**: 12 ≈ every pano, 25 ≈ every other one), `max_stills`, `fade_ms`, `resume_after_s`, `smooth_s`,
  `base_zoom`. No key or model id is hard-coded anywhere.
- **Content wired (technical fields only; no narration or overlay text touched):** scene 04 gets ten cues — up the Row, the
  turn to 7–8 Savile Row at 15 s, the five street turns, then the Reform (168°, pitch 18), the Travellers (109°) and the
  Athenaeum (89°) at 105/120/135 s, each `look_at` an OSM centroid. Scene 15 gets four — the cross, the look **up** the spire
  (pitch 32), the 87° turn right to Charles I at 13 s as the narration names him, and back.
- **Two content bugs found by pointing a camera at the coordinates.** (a) Scene 15 / M-38's stop `51.5083,-0.1247` returns a
  pano **inside the station concourse** (train shed, WHSmith) — moved to the verified forecourt pano `51.50855,-0.12543`
  (2025-07), 16 m from the cross; from there "to your right" for Charles I is geometrically true. (b) Scene 04's façade stop
  was rounded to 4 decimals, which at 27 m swings the bearing to the Travellers by 15° — refined to the returned pano
  `51.50678,-0.13354`. Both are noted in the scene `review.notes` and in the manifest rows for the Content Preparer to confirm.
  Also verified live: **all seven walk stops have panoramas** (six 2025-10, M-56 is 2012-05) — the manifest's "expected" is now
  "confirmed".
- **Validator:** `camera` cues must be aimable (`heading` or a well-formed `look_at`), inside `duration_s`, in time order,
  non-overlapping holds, `at_waypoint` in range; warns when a streetview walk has no camera track, and when a `pin`/`caption`
  names something the camera never turns to (no cue within 3 s). Template checklist updated with how to author a cue.
- **Test** `studio/player/test/smoke_streetview.mjs` — 56 checks, **ALL PASS 2026-08-19** against
  `https://178-104-53-233.sslip.io/player/` (must be that host: the key is referrer-restricted, localhost is denied).
  Pass 1 = plan + camera maths with the network blocked; pass 2 = the real panorama walk (eased turn < 25°/frame, panos
  advance with zero clicks, drag/idle/resume, ⏸/↻, fade clears the ©-line); pass 3 = JS API blocked → static hyperlapse
  (53 frames, metadata probed first); pass 4 = no key → auto-advancing card; pass 5 = live `gm_authFailure` → stills.
  Run: `node studio/player/test/smoke_streetview.mjs [--player …] [--no-js]` (`--no-js` skips the two billed passes).
- **Cost, so the dial is not a surprise:** the `js` mode bills one *Dynamic Street View* panorama load per hop
  ($14/1,000, 5,000 free/month) — scene 04 at `step_m: 12` is ≈ 90 hops ≈ $1.26 a play (≈ 55 free plays a month, or double
  that at `step_m: 25`). The `stills` mode bills *Street View Static* ($7/1,000, 10,000 free/month) — ≈ 53 frames ≈ $0.37 a
  play. Metadata and the Embed API are free. Figures from Google's pricing page 2026-08-19; confirm on the SKU page.
- **Still NOT done:** the 1,151-step counter (the `js` mode now has live position — `window.__sv.debug.pos` — but nothing
  draws it); `media[].fallback` for a missing pano (v0.4 skips forward to the next reachable pano instead of showing the
  still); the `stills` mode cannot be dragged (it is a hyperlapse, there is nothing to pan); no counter/attribution work in
  the linear renderer, which still draws stop cards and must keep doing so; scene 04's `interaction.prompt` still says
  "Tap ahead to step" — a Scene Developer fix, not an engine one.

## 2026-08-19 — v0.5 (engine-tools, C1a "Path A"): streetview mode `open` — a FREE walk on open imagery, shared with the video

**What changed.** The player's street walk no longer needs Google at all. A new fetcher caches freely-licensed
street-level frames per walk stop; the player animates them (mode **`open`**, now first on the ladder
`open → embed → link`); the linear renderer cuts the **same** frames with the **same** move (visual kind
**`panowalk`**). One geometry module, `studio/player/panomove.mjs`, is imported by both, so the walk in the MP4 is
the walk in the player. **Zero billable calls anywhere in the default path** — asserted by the smoke test.

### New: `studio/tools/panowalk/` (fetcher)
- `fetch.mjs --chapter <dir> [--scene id]… [--dry-run] [--source both|kartaview|mapillary] [--radius 60]
  [--max-frames 14] [--max-yaw 35] [--accept-unknown-licence] [--report f.json]`.
- KartaView (no token, no account) + Mapillary (**only** if `www/config.json` already has `mapillary_token`; the tool
  never creates one, never signs up, never accepts terms — RULE 0). No Google endpoint is contacted.
- Scores candidate sequences per waypoint (coverage · spacing · span · direction · 360° · pedestrian · recency ·
  proximity to places the cues *name* · continuity) and takes **one** sequence per stop — never mixes sources inside a
  move. Stops that share a sequence have its frames partitioned by nearest waypoint, so no stretch is walked twice.
- **Licence gate per frame, not per platform** (`lib/licence.mjs`): NC/ND is a hard stop that drops the whole
  sequence; `unknown` is dropped unless a human passes `--accept-unknown-licence`. KartaView = CC BY-SA 4.0
  platform-wide (rights-a6 green). **Mapillary's Graph API states no per-image licence at all** — verified live:
  `fields=id,license` returns `{"id":…}` with no licence key, and the entity endpoint answers
  `500 "Tried accessing nonexisting field (license)"`; `organization_id` is absent too. Open question for Rights,
  recorded in `studio/tools/panowalk/README.md` §Licence and visible in the burned-in credit.
- Cache: `<chapter>/media/files/panos/{index.json, <stop-id>/frames.json, f000.jpg, f000.web.jpg}` — gitignored,
  reused on re-run (a second run downloads nothing). API answers cached in `studio/tools/panowalk/.cache/`.
- `ref_heading` per frame — the world bearing at the image centre — is *derived*, not trusted: camera compass for
  360° frames (verified by rendering the Reform Club's "104" doorway at `yaw = 168° − 245.8°`), GPS travel bearing
  for flat ones (KartaView seq 1124 states 160° while its dashcam looks along 240°; Mapillary's `compass_angle` is
  routinely 180° from its own `computed_compass_angle`).

### New: `studio/player/panomove.mjs` (the move, defined once)
Frame timing on the scene clock, cross-fade windows, the slow drift ("breathing"), the window geometry (a cylindrical
crop out of the 360°×180° sphere or the ~70° flat photo), cue **retargeting** (a cue authored at the stop is rescaled
in pitch and field of view for the frame we actually cut to, clamped 0.7–1.6× so a façade never becomes a doorknob),
`frameForCue` (a cue that *names* a place cuts to the frame nearest it), and ports of `svPlan`/`svCameraAt` for the
renderer. The smoke test asserts the port and the player agree on scene 04's stops, arrival times, cues and headings.

### Player
- **Mode `open`**: two cross-fading layers, a per-frame drift, turn-to-cue on the same `at_s` as the pin, drag to look
  (pauses the walk, eases back to zero after the idle window) — the v0.4 contract, unchanged.
- **Per-stop honesty**: stops with no usable imagery do not get a faked walk. They fall back inside the same scene to
  the free Maps **Embed** (or the stop card with no key), and `window.__sv.coverage` lists `{open:[…], gap:[…]}`.
- **Burned attribution** bottom-left while those frames are on screen: source (linked to the exact image page),
  author, licence and capture date. Legal because these are open-licensed frames we host — unlike Google's, which the
  player still never covers.
- Ladder is now `open → embed → link`; `auto` starts at `open`, and `svModeAllowed` no longer treats `auto` as
  billable. `www/config.example.json` documents `mode: "open"` and the optional `mapillary_token`.

### Linear renderer (`studio/tools/render/render_linear.mjs`)
- Visual kind **`panowalk`**: `{ "kind":"panowalk", "scene":"count-the-steps", "stops":[5,6], "dur":8,
  "fallback":{"kind":"footage","media":"M-67"} }`. Builds the move with ffmpeg from the same cached frames
  (`crop` out of the doubled equirect for wrap → `scale` → `zoompan` drift → `xfade`), credits each sequence.
- A `streetview` scene with no cut-sheet hint now renders the walk automatically when frames are cached.
- **Degrades**: no cache → the declared `fallback`, else the old stop card, with a warning in `render-log.md`. A clean
  checkout still renders (verified by removing `panos/index.json` and re-rendering scene 05).
- Honest difference: ffmpeg cannot animate a crop, so the turn is quantised to one value per source frame (its
  midpoint) while the player interpolates. Timing, cross-fade and drift are identical.
- `cuts/day-01-london.json` scene 05 `pall-mall-pass`: visual 0 changed from the M-67 KartaView dashcam hyperlapse to
  `panowalk` over `count-the-steps` stops 5–6. Same 8 s, same words; M-67 stays as the declared fallback.

### Day 1 coverage (real numbers, `--report`)
7 of 8 stops got open imagery, all from Mapillary, 98 frames, **186 MB** of cache (+23 MB of API cache):
w01 flat 8.9 m spacing (2022) · w02 **360°** 8.3 m (2024) · w03 **360°** 7.9 m (2026) · w04 **360°** 8.7 m (2024) ·
w05 **360°** 10.1 m (2024, same sequence as w04, one continuous leg) · w06 **360°** 12.1 m (2024) ·
`look-up-the-cross` **360°** 2.7 m (2025). **w00 Savile Row falls back to `embed`**: the scene's cue *names*
7–8 Savile Row, which needs a 57–70° turn, and no flat photograph there holds it. The Strand — zero on KartaView —
is fully covered by Mapillary.

**Does it read as a walk? Mostly not, and the imagery is not why.** The fetcher now measures `pace` per stop (metres
of selected span ÷ the seconds the scene gives that stop) and prints it. Scene 04 asks for 91–112 m in each 15 s
beat = **6–7 m/s, a bicycle**; nothing can make that a man who never hurries. Where the beat is long enough the same
frames do read as a walk: the Reform stop (45 s) at 3.5 m/s, and scene 15 (25 s / 44 m) at **1.7 m/s — walking pace
exactly**. The cure is a content decision (more seconds, or a shorter leg), so `frames.json` carries `pace_ms` and
`pace_reads_as` for the Scene Developer to act on.

### How to run / what to look at
```bash
node studio/tools/panowalk/fetch.mjs --chapter products/around-the-world-80-days/day-01-london \
     --scene count-the-steps --scene look-up-the-cross --dry-run            # coverage report, no downloads
node studio/player/test/smoke_panowalk.mjs                                   # 32 checks, incl. zero billable calls
node studio/player/test/smoke_streetview.mjs                                 # v0.4 ladder, updated for v0.5
cd studio/tools/render && node render_linear.mjs ../../../products/around-the-world-80-days/day-01-london/tour.json \
     --scenes 5 --out /tmp/lin05 --no-tts                                    # the walk, in the film
```
Look at: the player's scene 04 at 34 s (walking Burlington Gardens) and 108 s (the Reform Club façade, turned to
inside a 360° frame), scene 15 at 4 s (the Eleanor Cross centre-frame against the hotel), and `/tmp/lin05` around
5–9 s. `studio/tools/panowalk/README.md` has the cache layout, the scoring table and the licence rules.

### Still not done
- Mapillary's per-image licence cannot be verified through the API — **Rights must rule** before this ships publicly.
- Mapillary's contractual attribution asks for their mark; we show a linked "Mapillary" wordmark, not their logo file.
- The cylindrical crop bows horizontals at wide fields of view (a true rectilinear re-projection is not expressible
  in CSS, so matching the video would be impossible).
- Scene 04's cue list was authored for Google panoramas; w00's named look-at is unreachable from open imagery. That is
  a content decision (re-point the cue, or keep the embed) — Engine does not touch cues.
- `--max-frames 14` per stop is a cost-free but disk-heavy default (360° originals are ~1.5 MB each).

## 2026-08-20 — v0.6 (engine-tools): pause, "the day waits", saved progress, and a scene list you can actually use

Founder playtest, verbatim: *"it seems i cannot pause (i go away from the browser and come back the clock still
ticking) and save my progress.. also no way to jump to scenes."* Read against `studio/strategy/positioning.md`
("no urgency… the traveller may stop at any time… silence is content"), these are not media-player features — they
are the tone made real. Stopping is the normal state of a day out, not an interruption to recover from.
(Unlogged before this entry: the i18n locale layer of 2026-08-19/20 — `?lang=`, the cover picker, locale-aware voice
selection. v0.6 builds the scene list on top of it.)

### 1. One master pause, and it stops everything at once
`pauseReasons` (a Set of `user` | `away` | `sheet` | `wait`) drives the single `paused` flag every loop already
watches. Reasons stack, so an interaction countdown or an open card can never un-pause a stop the traveller asked
for. On the way in: `speechSynthesis.pause()` (mid-word, not mid-scene), the Commons audio bed, YouTube
(`pauseVideo`), and `body.yy-paused` freezes the Ken-Burns `animation-play-state` and the cross-fade transitions.
The rAF loops (`svLive`, `svStills`, `svOpen`) already checked `paused`; **`svEmbed`'s mark timeline did not** and
now does. On the way out the scene clock is rebased (`t0 = now − elapsed`), so **resuming continues at the same
second, never at the scene start**. A half-paused scene — voice stopped, clock running — is no longer reachable.
- **Controls:** a footer `⏸ Pause / ▶ Go on` button (`aria-pressed`), the **spacebar** (and `k`), the Street View
  chrome's own `⏸`, and the strip's "Go on". Space no longer double-fires when a button has focus, and never
  steals a keystroke from an input or from the scene list.
- **Where the paused state is shown:** a strip *above the footer*, never over the media — rights, not taste: we may
  not overlay a YouTube player, and Google's Street View logo and ©-line must stay clear (M-37/38/39).
- **Interaction waits are a pause reason now**, so `pause_narration` + `timeout_s` behaves as before while playing,
  but the countdown *holds* while the traveller has stopped the day. That also fixes the v0.3 bug in the changelog
  ("a running interaction countdown does NOT pause" behind the who's-who card).
- **The YouTube player's own ⏸ pauses the whole day** (and its ▶ resumes it), guarded against echoing our own
  commands. A video that stops while the guide keeps talking is exactly the incoherence this release is about.

### 2. Leaving the page pauses it — the actual bug they hit
`visibilitychange → hidden` pauses with reason `away` and writes progress; **coming back does not resume**. The
strip explains itself ("Paused — you stepped away, so the day waited for you") and waits for a deliberate tap: they
may have been gone an hour. `blur` pauses too, but only after a 250 ms re-check that focus did **not** go into an
`<iframe>` — clicking inside the YouTube or Street View embed blurs the window, and pausing there would be maddening.

### 3. Saved progress, keyed by tour
`{tourUrl, sceneId, sceneNo, sceneTitle, elapsed, lang, clearEnglish, rate, savedAt}` under
`yy-progress:<TOUR_URL>` — per tour URL, so chapters and products never collide. Written at most once per 2 s from
`tick()`, plus forced on every pause, scene change, `visibilitychange` and `pagehide`. On the cover, a saved day
offers **"▶ Continue — scene 7: The wager — twenty thousand at Baring's"** (localised title, straight from the tour
in memory) with "saved 20 minutes ago · 1:04 into that scene"; "Start the day again from the beginning" stays and
clears the save. A save whose `sceneId` no longer exists is dropped silently.
- **Restore lands mid-scene, not at its start:** `showScene(i, {at})` seeds `elapsed`, so the media schedule, the
  overlays, the walk and the YouTube in-point (`start = start_s + at`) all arrive at the same moment. The narration
  cannot literally resume mid-utterance after a reload, so `speechSplit()` estimates where the voice had got to
  (words/s, or CJK characters/s, at the current rate), snaps **back** to a sentence start, marks the earlier text as
  already said in the caption panel and reads the rest. If the estimate says the guide had finished, it stays quiet.
- Free bonus from the same plumbing: toggling **CC** no longer rewinds the scene.
- **All localStorage access goes through `LS.get/set/del`**, which swallow the exception private mode throws — the
  player boots, plays, pauses and lists scenes with storage disabled; it just cannot offer Continue.

### 4. A real scene list (the `prompt()` is gone)
`#btnList` opens an in-page sheet — side panel on a wide screen, bottom sheet under 560 px: number, **localised**
title, `type · m:ss`, the current scene marked (`aria-current`, accent, "here now"). Tap to jump; opening it stops
the day; Escape / Close / a tap on the dim dismisses it; focus opens **on the current scene**, ArrowUp/Down/Home/End
move, and no key leaks out to the scene shortcuts. Titles are read from `scenes[i].title`, which the locale overlay
has already rewritten — the list is localised for free and nothing is translated twice.

### 5. Narrow-screen chrome
The header cannot overflow any more: the chapter title ellipsises, the spacer can shrink, buttons never shrink, and
under 520 px the labels collapse to their glyph and `#hScene` (which the list now carries) hides. Measured at
**280 px** (Fold cover): header, footer and document all overflow by 0 px.

### How to run / what to look at
```bash
node studio/player/test/smoke_playback.mjs      # 72 checks, ALL PASS 2026-08-20 (must run against the deployed host)
node studio/player/test/smoke_v03.mjs           # v0.3 features — unchanged by this release (4 pre-existing failures, see below)
```
Look at `studio/player/test/out/v06-*.jpg`: the scene list at 1280 px and at 280 px, the list in 简体中文, the cover
with Continue, and a paused Street View scene (the strip is below the media; Google's logo and ©-line are clear).

### The test (`studio/player/test/smoke_playback.mjs`, 72 checks)
Six passes against `https://178-104-53-233.sslip.io/player/`. Narration is proved with a **fake `speechSynthesis`**
installed before the page loads (headless Chromium has no voices, so the real one can prove nothing): its
`charIndex` only advances while it is really speaking. Proves the clock **and** the narration freeze together and
resume from the same second (not a re-`speak`); `visibilitychange` auto-pauses and returning stays paused; progress
survives a reload and restores mid-scene; the list jumps, marks, dismisses and is keyboard-navigable; `?lang=zh-Hans`
gives localised rows and a localised Continue button; a throwing `localStorage` breaks nothing; and a `blur`
that lands inside an `<iframe>` is ignored while a real loss of window focus pauses. It also asserts
**no billable Google API was called** (RULE 1) and drives only card/photo/map scenes — no video is loaded anywhere.

### Still NOT done / found but not fixed
- **The scene-list chrome is English** ("The scenes", "18 scenes · about 21 minutes", "Close") and so are the scene
  **type** words (`video`, `photo`…), even in zh-Hans: the locale format carries content strings only. Adding UI
  strings is a spec change plus a translation, i.e. not an Engine decision — flagged for the founder.
- Narration on a **restored** scene is an estimate, not a real offset — a scene whose script deliberately stops
  early (silence is content) will be judged "already finished" and stay quiet on resume. Honest, but approximate.
- Progress is **one save per tour**, not a history: no "you have travelled these days" shelf yet (the positioning
  note asks for one eventually).
- The pause is **not** in the URL, so a shared link still starts at the top of the chapter.
- `smoke_v03.mjs` fails 4 of 22 checks, and `smoke_generated.mjs --only 3,10,11` fails on `pack-the-bag` —
  **both fail identically on the pre-change baseline** (`git show HEAD:studio/player/index.html`), so they are not
  v0.6 regressions: the v0.3 assertions predate the "clear English is the default" flip (D5) and the numbering in
  those tests predates the D6 scene restructure. Worth a pass by whoever owns those suites.
- The Street View `svChrome` ⏸ is now wired to the master pause, but with the D6 ladder (`embed → link`) no scene
  renders that chrome any more; it survives for the retired `js`/`stills`/`open` modes only.

## 2026-08-27 — v0.7 (Engine): the image treatment layer — no more black bars
**Brief (founder, from a rendered frame):** *"several of our images are portrait-orientation photographs or small
archive plates (many under 750 px wide) … they sit in the middle with wide black bars and occupy maybe a third of
the screen. It reads as a gap rather than a choice — and it is about to get worse, the Reform Club interior
material now being added is 700–730 px wide."* Player only; no video was rendered and the renderer's output is
unchanged (see "What the renderer would need" below).

### What changed
Every full-frame still now goes through **one entry point, `mountImage()`**, which reads the file's *real* pixels
and the *real* frame and picks a treatment. `media[].treatment` overrides it; absent, existing scenes improve with
no content edit. Three rules are not settings: **never stretch, never upscale past the file's own pixels, never
crop the subject away.**

| treatment | when it is chosen automatically | what you see |
|---|---|---|
| `fill` | a contained fit already covers ≥ 90 % of the frame **and** the file has the pixels for it | plain contain, nothing added |
| `backdrop` | anything else that is big enough to carry the frame (portrait photographs, wide plates) | the bars are filled with an ambient, heavily blurred, darkened copy **of this same picture**, plus a soft vignette |
| `plate` | long side ≤ 760 px — small period engravings, elevations, plans | a warm paper mount with a thin border and a printed caption line, sized to the picture's real pixels, on the ambient backdrop |
| `none` | never automatic — opt-out only | bare frame, no backdrop, no motion |

- **The backdrop is the same file**, drawn a second time with `filter: blur() saturate(1.12) brightness(.44)`.
  Same URL ⇒ the browser's cache serves it ⇒ **no second download**, no canvas, no CORS, no dependency. If it fails
  to load it simply removes itself and the dark frame stays.
  It is rasterised at **a tenth of the frame and scaled back up 12.5×** (with a 25 % overscale so the blurred edge
  never shows). Measured, headless, software rasteriser: a full-size 36-px blur cost a **212 ms one-off hitch** the
  first time a still appeared; small-and-scaled it is **40 ms**, and the steady state is unchanged at 60 fps
  (median frame 16.9 ms with the backdrop vs 16.7 ms without — a blurred layer is composited, not re-drawn). A
  heavy blur throws that detail away anyway, so nothing is lost. `--yy-blur` is therefore the *local* radius; the
  on-screen radius is 36 px at a 620-px-tall frame, floor 14 px, scaled with the frame.
- **The plate** is the answer to "632 px will never fill a screen": it stops pretending to be a photograph and
  becomes a document. `sizePlate()` computes the mount from the frame minus margin, paper padding and the measured
  caption, and caps the scale at **1.0** — the picture is shown at its own pixels or smaller, never larger.
  A mount that would leave the picture under `plate_min_area` (22 %) of the frame — which is what happens to a
  474×700 plate on a 280-px Fold cover — **degrades to `backdrop`**, measured not guessed, because there the paper
  costs more than it gives. An explicit `treatment: "plate"` is never overridden.
- **Gentle motion, honestly.** The old Ken Burns was `object-fit: cover` + `scale(1.12)`: it *cropped the subject
  away* to fill the frame, which is exactly what a chapter about looking at real things must not do. It is gone.
  The new drift runs **0.94 → 1.00** of the honest size over 36 s, `ease-in-out infinite alternate`, with a ±0.9 %
  translate whose direction is a stable hash of the media `ref` (the same still drifts the same way every run —
  screenshots and, later, the renderer can match it). Because it *ends* at 100 % it can never invent resolution.
  It honours `prefers-reduced-motion`, stops with `body.yy-paused`, and `?drift=0` holds everything dead still.
- **Attribution is layout, not an overlay.** On a plate the credit *is* the caption line printed on the paper.
  Elsewhere it is a label at the bottom of the frame, and the picture is **centred in what is left** rather than
  being covered: a 100-character CC BY-SA line is four lines on a 280-px cover and it was landing across
  Passepartout's legs. Under 420 px the label spans the full width instead of a 68 %-wide right-hand column.
- **A real honesty bug, found and fixed.** `commonsUrl(ref, 1600)` asked Commons for a 1600-px thumbnail of a
  632-px engraving, and Commons answers `thumbwidth: 1600` while handing back the original (`thumbnail_unscaled`).
  The new `commonsInfo()` requests `iiprop=url|size|mime` and, when `thumbwidth > width`, takes the **file's own**
  width/height as the truth. `commonsUrl()` survives as a one-line wrapper, so every old caller still works.
- **Insets are clamped too.** An inset and its credit are now **one box** (`figure.imginsetwrap`), so the credit
  cannot drift onto the picture as the frame changes: it is printed under the inset instead of hiding in `alt`.
  Width is `min(46%, <the file's own pixels>)` with a 120-px floor — 22 % of a 2560-px window is 563 px and M-50 is
  474 px wide (upscaling), while 22 % of a 280-px Fold is 62 px (invisible, and far too narrow for a credit line).
- **Degradation:** a picture whose file cannot be fetched leaves a **named card** ("This picture could not be
  loaded — <credit>"), not an empty black frame; a Commons API that refuses to answer costs the up-front size hint
  and nothing else (the treatment is re-picked from `naturalWidth` on load); a `ResizeObserver` re-lays the mount
  when the frame changes and disconnects itself when the stage leaves the DOM.

### Schema / spec
`scene.schema.json` → `media[].treatment: "backdrop" | "plate" | "fill" | "none"` (optional, `kind: "image"` only).
`validate.py` errors on `treatment` set on a non-image entry and **warns** on `fill`/`none`, which are a promise
about pixels that only a human can make. Documented in `studio/templates/scene-spec.md`. **No scene file, tour.json,
manifest or locale was touched** — this is a migration-free change: every existing scene improves as it stands.
Thresholds are config, not constants: `www/config.json` → `images: { plate_max_px, plate_min_area, fill_coverage,
blur_px, drift, drift_s, drift_from, drift_from_plate }`, documented in `www/config.example.json`.

### How to run / what to look at
```bash
node studio/player/test/smoke_images.mjs        # 131 checks, ALL PASS 2026-08-27
```
Screenshots land in `studio/player/test/out/v07-<width>-<scene>.jpg` at **280 px** (Fold cover), **717 px** (Fold
open) and **1280 px** (desktop). Start with `v07-desktop-quiz-verne-saloon.jpg` — the 632-px 1841 saloon engraving,
the exact picture the founder was looking at — then `v07-desktop-the-wager.jpg` (portrait, backdrop) and
`v07-fold-cover-passepartout-on-the-platform.jpg` (the plate that correctly gives up and becomes a backdrop).
Live: `https://178-104-53-233.sslip.io/player/?tour=/products/around-the-world-80-days/day-01-london/tour.json`
then ☰ → scene 6, 7, 16.

### Regression: nothing else moved
`smoke_generated.mjs` was run against **v0.7 and against `git show HEAD:studio/player/index.html`** (served side by
side) and gives the *identical* 5 PASS / 3 FAIL: `the-world-shrinks`, `pack-the-bag` and `then-and-now` fail the
same way before and after, on the scene-numbering drift already recorded in the v0.6 entry. `smoke_playback.mjs`
(v0.6, 72 checks) passes; it is timing-sensitive and flaked twice on a loaded machine (once on the away-detection
clock tolerance, once on a `#btnPause` actionability timeout), each time in a *different* pass and each time
passing on the next run, so neither is a v0.7 behaviour change — but it is worth knowing that suite is not stable
under CPU contention.

### The test (`studio/player/test/smoke_images.mjs`)
Eight passes on the real scenes the founder named (`quiz-verne-saloon` carries the same Reform interior engraving
that "at the door of the Reform" lists — scene 5 is a `video` scene, so the player never shows its M-22/M-23 plates
at all). It asserts the treatment chosen matches the real pixels; that **no `<img>` under `#media` renders larger
than its own `naturalWidth`/`naturalHeight` — transform included** — at every width; that nothing is stretched;
that the attribution is visible, ≥ 10.5 px, inside the frame and **not across the subject**; that the backdrop is
the same URL as the picture; that a dead file leaves a named card; that the overrides work; and that the drift
never crosses 100 % and stops when the day stops. **Every YouTube request is aborted at the network layer** and the
run asserts no billable Google API was called (RULE 1) — nothing was rendered and nothing was spent.

### What the RENDERER would need to match this (NOT done — do not assume it is)
`studio/tools/render/` still pillarboxes the same stills into 1920×1080 with black bars; this release deliberately
did not touch its output. To match, it needs, in rough order of value:
1. **The same backdrop**, which ffmpeg can do natively with no new dependency:
   `[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,gblur=sigma=40,eq=brightness=-0.18[bg];[0:v]scale=…:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2`.
   `sigma≈40` and `brightness=-0.18` are the ffmpeg equivalents of the player's `blur(36px) … brightness(.44)`.
2. **A "never upscale" clamp** on the foreground: `scale='min(iw,1920)':'min(ih,1080)':force_original_aspect_ratio=decrease`
   plus the same `commonsInfo` truth about the file's real size, or a 632-px plate will be blown up to 1080 in the MP4.
3. **The plate as a real asset**, not a CSS effect: the honest route is an SVG mount generated by
   `studio/tools/gen/` (paper gradient + border + caption typeset in the studio faces) with the plate `<image>`
   dropped in at 1:1, exported by `svg2png.mjs` — the renderer already inlines that kind of asset.
4. **The drift as a `zoompan`** running 0.94 → 1.00 over the shot, seeded from the same `hash32(ref)` so a shot
   drifts the same way in the film and in the player. The player exposes `?drift=0` so the renderer can take the
   motion over completely rather than fighting it.
5. **A treatment decision shared, not duplicated.** `pickTreatment()` is 8 lines of pure arithmetic; it should move
   to a tiny shared module both the player and `render_linear.mjs` import, or the two will drift apart within a
   chapter. That is a refactor with a real risk of breaking the render, so it is proposed, not done.

### Still NOT done / known weak
- **The backdrop is weakest on monochrome engravings** (`v07-desktop-the-wager.jpg`): a blurred copy of a grey
  plate is a grey wash. It is better than black — the frame stops reading as a hole — but it is not the win that
  the same treatment is on a colour photograph. A warm paper-toned tint under the blur, or simply using the plate
  mount for the big Hetzel plates too, is worth a founder look.
- **`treatment` is not in the locale layer**, so a translated chapter cannot re-caption a plate. The caption is the
  attribution string from the scene, which is deliberately not translated (author names and licence codes are not
  translatable), but the surrounding words one day will be.
- **`then-and-now` (G-02) and the other generated cards are untouched** — they are inlined SVGs, not `<img>`s, so
  the treatment layer never sees them. A 3840×2160 card is fine; a small one would still letterbox.
- **Scene 5, "at the door of the Reform", shows none of this**: it is a `video` scene, and the player's video branch
  ignores `media[].kind: image` entirely, so M-22 (709 px) and M-23 (632 px) are linear-cut material only. QA asked
  for them as insets over the façade on a Fold (`review/qa.md`, scene 06). Wiring stills into a video scene is a
  renderer/content decision and it would put our chrome over a YouTube embed, which rights forbids — flagged, not
  taken.
- The plate's paper is one fixed gradient. Period material varies (an 1841 aquatint and an 1872 line engraving want
  different mounts) and there is no way for a scene to ask for a different one.
- `deviceScaleFactor` is not considered: a 632-px plate shown at 632 CSS px on a 2× screen is still 2× in device
  pixels. That is unavoidable and universal, but the honesty claim is about CSS pixels, not physical ones.

## 2026-08-27 — v0.8 (Engine): a photo scene's pictures run on the SCENE clock, and `media[].fallback` for stills
**Brief:** the v0.7 agent found `photoCycle()` cycling stills on a wall-clock `setInterval` that divided `duration_s`
evenly across the images and ignored each entry's authored `start_s`/`end_s`. Three consequences, one of them a tone
bug: the pictures did not land where the scene wrote them to land; the interval never re-synced after a pause, a
scene-list jump or a v0.6 mid-scene restore; and **it was not stopped by the pause state**, so a paused day went on
changing pictures — the opposite of v0.6's "one coherent pause" and of `DECISIONS.md`'s unhurried tone.
Player only. No video was rendered; the linear renderer is untouched.

### What changed
- **`photoCycle()` is gone.** A photo scene's stills are now items on the same scene-clock schedule
  (`setSchedule()` / `schedTick()`) that every other scene type already uses. No timer of its own exists any more,
  so pause, resume, `seek()`, a scene-list jump and `showScene(i,{at})` all carry the pictures with them for free.
- **`imageSlots(imgs, duration, until)`** (new, 30 lines, pure) turns `media[]` into `{start, m}` slots:
  - **authored** — any entry carrying `start_s`/`end_s`: each picture starts at its own second. A missing `start_s`
    inherits the previous entry's `end_s`; several entries authored over the *same* window share that window evenly
    (that is how a scene says "these two pictures, over this stretch", and it is what the old even division did).
    The earliest slot is pulled back to 0 so a photo scene is never a black frame at second 0.
  - **fallback** — no entry carries any timing: the v0.7 even division, `max(8 s, duration/n)`, wrap-around
    included. Nothing authored without timings changes at all.
  - `until` = the first generated asset's `start_s`. Stills at or after it are the card's ingredients, not the
    cycle's (this preserves `then-and-now`, where both photographs live *inside* the G-02 SVG).
  - `end_s` bounds a slot but never blanks the frame: the last picture holds rather than cutting to black.
- **`media[].fallback` is honoured for images** (it was on the "still NOT done" list since v0.1.1). `mountImage()`
  swaps to the declared fallback on a load error **and** on a watchdog — `images.fallback_after_s` (default 6 s),
  because a picture that arrives after its ten-second slot has passed is as absent as one that 404s, and scene 06's
  saloon plate is an IIIF crop rendered on demand by archive.org, whose renderer is intermittently slow. One
  attempt, one console line, then the v0.7 named card if the fallback fails too. The ambient backdrop and the
  treatment are re-picked from the fallback's own pixels, so the honesty rules still hold.
- **Validator** (`studio/tools/validate.py`, in step, no schema change — `start_s`/`end_s`/`fallback` already
  exist): `end_s` must be after `start_s`; a still whose `start_s` is at or past `duration_s` warns ("that picture
  never comes up"); a **photo** scene that times only *some* of its stills warns (the fill-from-previous-end rule is
  an interpretation, and authors should choose); a photo scene whose earliest still starts after 0 s warns that the
  player pulls it back to 0. All 18 Day 1 scenes still validate clean (the one pre-existing WARN on
  `count-the-steps` is the v0.4 camera-track note, unrelated).

### What visibly changed, per scene (Day 1) — read this if you own the content
- **06 `the-reform-club`** (the only multi-picture photo scene): the seven authored ten-second slots are now what
  the player actually runs. Played straight through from 0 s **nothing moves** — 70 s ÷ 7 pictures happens to be
  exactly the 10 s the slots were authored at, which is why this bug was invisible in a clean play-through. What
  changed is everything else: **pause at 25 s and the 1887 saloon stays on screen** (v0.7 marched on to Soyer's
  kitchens ten seconds later, while the day was stopped); jumping in from the scene list starts on M-20, not on
  whatever the old interval had reached; **a mid-scene restore at 42 s comes back on M-94, the 2013 interior**, not
  on the façade; and M-96 now falls back to the archive.org page scan if the IIIF renderer is slow, instead of
  leaving its slot empty. The authored intent (`production_notes`: "adding or removing one image re-times the whole
  scene — keep it at seven") **is no longer fragile**: the slots are read, not inferred, so an eighth picture will
  not shift the other seven.
- **08 `the-wager`**: unchanged on screen (one still 0–35 s, then the G-05 card). It is now the *schedule* that
  ends the still at 35 s rather than the card happening to overwrite it.
- **14 `then-and-now`**: unchanged (the G-02 card owns the whole 35 s; both photographs are inside the SVG). Its
  degraded path — when the generated SVG is missing — is now on the scene clock too: M-24 at 0 s, M-26 at 17.5 s.
- **Nothing else moved**, and nothing else *could*: `photoCycle` only ever ran on `type: "photo"` scenes, and Day 1
  has exactly three. Scenes **02, 04, 13, 18** (`video`) and **12** (`map`) carry seven stills between them with
  authored `start_s` windows that the player has never shown and still does not — the video branch ignores
  `media[].kind: image` entirely (rights: we may not put our chrome over a YouTube embed) and the map branch draws
  the route. Scenes **07, 16** (`quiz`) and **17** (`dialogue`) do show a still, but always `img[0]` for the whole
  duration, timings unread. Both are real gaps — see "found, not fixed" — and neither is a `photoCycle` bug.

### How to run / what to look at
```bash
node studio/player/test/smoke_images.mjs        # 158 checks (v0.7's 131 + pass 9 slots/pause/restore + pass 10 fallback)
node studio/player/test/smoke_playback.mjs      # 83 checks (v0.6's 72 + pass 7 "the pictures obey the same clock")
python3 studio/tools/validate.py products/around-the-world-80-days/day-01-london/scenes/*.scene.json
```
`studio/player/test/out/v08-reform-slot{1..7}-at<N>s.jpg` — one frame per authored second of scene 06, in order:
the front today · Barry's ground plan · the 1887 saloon · Soyer's kitchens · inside today · the north elevation ·
the 1841 corridors. Live: `https://178-104-53-233.sslip.io/player/?tour=/products/around-the-world-80-days/day-01-london/tour.json`
→ ☰ → *Inside the Reform*, then press **space** at 25 s and watch the saloon stay put.

### The tests
- `smoke_images.mjs` **pass 9** reads the slots out of the scene file in the page (not a copy of them), seeks to a
  second inside each one and asserts the authored picture is the one on screen; pauses and waits **11.5 s** — past
  two of the old interval's ticks — to prove the picture and the clock both stand still; restores mid-scene with
  `showScene(i,{at})` and asserts it lands on slot 5, not slot 1; then **deletes the timings in memory** and
  asserts the even division still behaves exactly as v0.7 did. **Pass 10** kills `iiif.archive.org` (a) outright
  and (b) by holding the response for 30 s, and asserts both end on the declared `archive.org/download` fallback
  with no "could not be loaded" card.
- `smoke_playback.mjs` **pass 7** does the same through the *real* v0.6 machinery: play into the photo scene, let
  the throttled save land, reload, click **Continue**, assert the restored picture is the authored one; jump from
  the scene list and assert it re-arms from slot 1 and still runs; pause 11.5 s and assert nothing at all changes.
- Both suites keep the RULE 1 assertion (no billable Google API was called) and load no video.

### Regression against baseline (v0.7 = `git show HEAD:studio/player/index.html`, served side by side at `/player-v07/`)
| suite | baseline (v0.7) | v0.8 | delta |
|---|---|---|---|
| `smoke_images.mjs` | 131/131 PASS | **158/158 PASS** | +27 new checks, none broken |
| `smoke_playback.mjs` | 72/72 PASS | **83/83 PASS** | +11 new checks, none broken |
| `smoke_v03.mjs` | 18/22 (4 FAIL) | 18/22 (same 4 FAIL) | none — pre-existing since v0.6 (D5 flip) |
| `smoke_generated.mjs` | 5 PASS / 3 FAIL | 5 PASS / 3 FAIL (same three) | none — pre-existing scene-numbering drift |

`smoke_generated`'s `then-and-now` row differs in one detail *inside* an already-failing row: on the v0.8 run the
free **Maps Embed** iframe answered 403 (verified by hand: that endpoint returns 200 with our referrer and 403
without it, so it is a referrer/throttle artefact of running many headless sessions in an hour, not a code change).
The row fails for the same real reason on both: the suite's index 14 is now the `streetview` scene, so it waits for
an inlined SVG that scene never had. Nothing billable was called in any run.
The v0.7 baseline snapshot lives at `www/player-v07/` (gitignored copy of the HEAD player) so any future release can
be diffed the same way.

### Found but NOT fixed
- **Stills authored into `video`, `map` and `dialogue` scenes are still dead weight in the player.** Day 1 has
  thirteen such stills — 02 Savile Row ×4, 04 count-the-steps ×4, 12 the-dash ×1, 13 Charing Cross ×2, 18 the boat
  train ×2 — **seven of them with an explicit `start_s` window that nothing reads**. For video scenes this is a rights constraint, not an oversight — our chrome may not sit over a
  YouTube embed — so the fix is a content/renderer decision (they are linear-cut material). For **map** scenes
  (12 `the-dash`, M-29 authored 30–45 s) nothing forbids an inset and the schedule is already built; for
  `quiz`/`dialogue` the player shows `img[0]` for the whole scene, which would change scene 07 the moment a
  schedule is applied (its two stills are both authored 0–80 s, so the façade would replace the saloon halfway
  through a quiz about the saloon). Both are one-line changes here and a content call there — flagged, not taken.
- **No cross-fade between stills.** A slot change is a hard cut. On a chapter whose tone note says "unhurried", a
  400 ms dissolve is probably right, but it interacts with the v0.7 backdrop layer (two blurred copies at once) and
  wants a founder look before it ships.
- **The linear renderer still cuts photo scenes its own way** (`studio/tools/render/`), so the film and the player
  can disagree about when a picture changes. `imageSlots()` is 30 lines of pure arithmetic and is the obvious thing
  to share, exactly like `pickTreatment()` in the v0.7 note — same proposal, same risk, still not done.
- **The fallback watchdog runs on the wall clock, not the scene clock** (a download does not pause when the day
  does). Correct, but it means a still can swap to its fallback while the traveller is away.
- **Resolution is the schedule's 500 ms tick**, plus however long the file takes to arrive: a slot authored at
  20 s lands at 20.0–20.5 s and then paints. That is the same granularity every other scheduled medium has had
  since v0.2, and it is well inside a ten-second slot, but it is not frame-accurate and the linear cut will be.
- **`window.__lastImage`** is now the only way a test can see which picture is up. It is a test hook, not an API.

## 2026-09-03 — v0.9 (Engine): the renderer can publish — local Kokoro voice, no upscaling, the treatment layer, 1080p, EN + ZH
**Brief (founder):** the focus moves to the VIDEO (`/watch`) to test the audience on YouTube; the player is now
secondary. Five things: replace `msedge-tts` with hilbert's local Kokoro; never upscale a still; mirror the v0.7
treatment layer in ffmpeg; 1080p by default; two cuts per chapter (English and Mandarin) with captions in both.
Everything below is in `studio/tools/render/` and `studio/player/imagelayer.mjs`. **No video was published and
nothing was spent** — the voice is a local model, the only network calls are Wikimedia's free API.

### 1. The voice: `studio/tools/render/tts_kokoro.py` (new), msedge-tts deleted
`msedge-tts` wrapped an undocumented Microsoft endpoint with no licence for third-party use. Fine for a private
animatic; not fine for a file we publish. It is gone from the code and from `package.json`.

The replacement is hilbert's Kokoro (Apache-2.0, 82M params, CPU-only, commercial use allowed) called through a
**yunyou-side adapter**, because `~/hilbert/docs/REUSE.md` says *"Call them, do not edit them"* — a sibling project
once edited hilbert's TTS and invalidated the Mandarin durations of two finished episodes. The adapter runs under
`~/hilbert/.venv/bin/python`, `sys.path.insert`s hilbert, imports `from studio import tts`, loads
`~/hilbert/config.yaml` and calls exactly one public function, `tts.synth_kokoro(text, lang, cfg, raw)`. It writes
nothing inside `~/hilbert` — verified after every run with `git status` in that repo and a `find -newermt`; both
clean, and `~/hilbert/.tts-cache` is still empty.
- **Our cache**, `studio/tools/render/.tts-cache/`, keyed on sha256 of (provider, voice, speed, lang, text) plus
  hilbert's `_ZH_PROSODY_REV` when it exposes one — because the Mandarin phoneme pipeline lives in hilbert's file,
  so a change there has to invalidate our Mandarin clips too. Editing one line re-synthesizes one line.
- **RULE 1 is structural, not a promise:** the adapter forces `provider: kokoro` even if the config says
  `elevenlabs` (billed per character) and prints that it did. There is no flag that makes this file spend money.
- **Measured, not quoted:** 0.85× real time for a cold English batch, 0.78× for Mandarin, ~750 MB RSS, ~7 s model
  load. The renderer batches every line of a cut into ONE python process so the model loads once.
- **What Edge gave us and Kokoro does not: word boundaries.** An utterance is therefore one *sentence* now (also
  the right cache grain), and caption cards inside a long sentence are timed by character share. Sentence in/out
  points are exact; word-level caption timing is gone.
- Narration level is **measured** (`ebur128` over the run's own clips, median) and gained to −17 LUFS. Kokoro
  lands at −16.5, so the gain is −0.5 dB; the old code applied a fixed +4 dB tuned for Edge, which would have been
  4.5 dB hot on every published cut.

### 2. Never upscale (the honesty bug, in the film this time)
- `commonsInfo()` now asks for `iiprop=url|size|…` and, when Commons answers `thumbwidth 1920` for a 632-px file
  (it does, and hands back the original), takes the **file's own** width/height — the player's v0.7 fix, mirrored.
  The downloaded file is then probed with ffprobe, which is the last word.
- Every still is fitted with `min(W/nw, H/nh, 1)`: **k is capped at 1**. The old `scale=1920:1080` +
  `zoompan z=1→1.10` did the two things a chapter about looking at real things must not do — it enlarged a 632-px
  engraving to 1080 and then cropped the subject away to fill the frame.
- The quiz/dialogue **card** path was the worst offender and the founder's own example lives there: scene 06
  `quiz-verne-saloon` shows the 632-px 1841 saloon engraving through `quizScreen`, whose `img.hero` was
  `width:100%;object-fit:contain`. It now carries `max-width`/`max-height` in the file's own pixels and sits on an
  ambient blurred copy of itself with the credit under it.
- Not fixed, stated plainly: **footage is still scaled to the frame.** `media/files/*.mp4` are 1280×720 masters,
  so the film upscales them 1.5×, and three of them (m78 640×480, m81 270×270, m83 640×480) were already upscaled
  into those masters with black bars baked in. Re-normalising from `media/files/src/` is a Content Preparer task
  and it will not make 640×480 into 1080p — the honest answer for that material is a treatment, not a scaler.
  The panowalk crop is also an upscale (a 82° window of a 5760-px equirect is 1312 px → 1920).

### 3. The treatment layer, in ffmpeg — and `pickTreatment()`/`imageSlots()` are now SHARED CODE
New **`studio/player/imagelayer.mjs`**: `IMG_DEFAULTS`, `hash32`, `pickTreatment`, `fitSize`, `driftFor`,
`blurRadius`, `imageSlots`, `slotsToShots`. Pure arithmetic, no DOM and no ffmpeg. Imported by
`render_linear.mjs` (static) and by `index.html` (a boot-time `import()`, exactly like `panomove.mjs`). This is
the refactor v0.7 and v0.8 both proposed and both declined to do; it is done, and the two suites that cover it
pass unchanged (below).
- The player keeps a **degraded path** if the module 404s: `backdrop` for everything and the v0.7 even division
  for photo scenes, with one console error. It does not break.
- `/config.json`'s `images` overrides are merged *under* nothing — the module's defaults are merged **under**
  whatever is already in `IMGCFG`, because the config fetch is a floating promise and may land first.
- In the film: `backdrop` = the bars filled with a blurred, darkened copy of the same file (`gblur` at 1/10 scale
  then scaled back up — the player's own trick, and here it is also four times less pixel work); `plate` = a warm
  paper mount **typeset in the browser** and composited (ffmpeg-static has no `drawtext`: it is built without
  libfreetype, which this run discovered the hard way); `fill`/`none` = plain contain.
- **Drift 0.94 → 1.00**, seeded from `hash32(ref)`, honouring `media[].drift:false` and `--no-drift`. Built by
  making the canvas 1/0.94 larger and zooming *in* to 1:1, so the most magnified frame is the honest size and
  every other frame is a downscale. `zoompan` cannot zoom out below 1; this is how you get the player's motion out
  of it without inventing a pixel.
- **Photo scenes now use the player's `imageSlots()`**, so the film and the chapter change picture on the same
  beat (v0.8 listed this as "found but not fixed").
- **One deliberate divergence, argued not hidden.** v0.7 degrades a plate to a backdrop when the mount leaves the
  picture under 22 % of the frame — written for a 280-px Fold cover where margin, paper and caption genuinely
  shrink the picture. On a 1920×1080 frame the same test also rejects mounts whose paper costs nothing: a 709×431
  elevation is 14 % of the frame. The film adds the condition the rationale implies — the paper only costs more
  than it gives when it actually **shrinks** the picture (`k < 1`). `--plate-strict` restores the player's
  arithmetic exactly. Compare `scratchpad/proof-en/f32.png` (bare rule: grey wash) with
  `proof-plate/p32.png` (mount): the mount is plainly the better frame, and it is the founder's brief.

### 4. 1080p — and the two things that broke at 1080p
`--size` defaults to `1920x1080` @ 25 fps. Two real failures came out of raising it, both fixed:
- **The panowalk cross-fade was OOM-killed.** Fifteen 1080p inputs in one `filter_complex` on a 3 GB box: ffmpeg
  died after **46 minutes** with `exit null` and `sys` time (5m43) exceeding `user` time (2m42) — the signature of
  swapping. `xfadeChain()` now folds in groups of `--xfade-group` (default 4), which keeps the number of live
  decoders constant at any frame size, at the cost of one extra h264 generation on a long walk.
- **The panowalk intermediate was 3840×2160** (`scale=W*2:H*2`) to give `zoompan` headroom for a 1.055 push.
  1.15× is all that push needs; the intermediate is now 2208×1242.

### 5. Two cuts, both captioned
`--lang en` (default) and `--lang zh` → `<chapter-id>_en.mp4` / `_zh.mp4` and a matching `.vtt` for each (captions
are burned in **and** shipped as a sidecar). The Mandarin cut reads `i18n/zh-Hans.json` the way the player does —
index-addressed, partial locales valid, English wherever the locale is silent — and localises narration, burned
captions, VTT, scene lower-third, pins/captions, title and credits cards and the quiz/chat/checklist screens.
Mandarin uses `Noto Sans CJK SC` at a smaller size and ≤ 24 characters a card (Latin faces tofu every CJK glyph;
full-width glyphs need their own size — hilbert's `captions.size_zh` learned the same lesson), with a kinsoku rule
so a closing mark never opens a line. The CJK sentence splitter keeps a closing quote with the sentence it closes.
- **The sidecar's `s:N` tokens do not transfer.** They index the English *clear* sentences; the locale translates
  the whole clear script and splits differently (8 of 18 Day-1 scenes; `count-the-steps` is 19 English sentences
  and 13 Chinese ones). Default is `--zh-align proportional` — each kept English sentence is a span of characters,
  a locale sentence is kept when most of its own span lies inside a kept span — **logged per scene** so a human
  can check it ("English kept 16/19 → Mandarin 14/16"). The right answer is a real
  `cuts/<chapter-id>.<locale>.json`, which is used automatically when it exists and is a Narrator/Translator
  deliverable, not something a tool may invent.
- **Mandarin density is measured**: `zf_xiaoxiao` runs 4.77 char/s (hilbert's 286 char/min, confirmed here), and a
  scene needing more than 92 % of its slot is written into `render-log.md` as "too dense in Mandarin" with the
  numbers. "Silence is content" is a hard constraint, not a preference.

### How to run / what to look at
```bash
# the two full cuts (sequentially — two cores)
node studio/tools/render/render_linear.mjs products/around-the-world-80-days/day-01-london/tour.json --lang en
node studio/tools/render/render_linear.mjs products/around-the-world-80-days/day-01-london/tour.json --lang zh
# what it will do, without rendering
node studio/tools/render/render_linear.mjs .../tour.json --plan --lang zh --no-tts
# the voice on its own
~/hilbert/.venv/bin/python studio/tools/render/tts_kokoro.py --probe
```
Proof renders (scenes 5 + 7, 1080p, both languages) are in the scratchpad, not committed: `proof-en/f10.png` is a
1920×2560 portrait on its own blurred backdrop, `proof-zh/z30.png` is the paper mount with a Mandarin pin and
Mandarin captions, `proof-plate/p32.png` is the plate/backdrop comparison.

### Regression
| suite | before | after |
|---|---|---|
| `studio/player/test/smoke_images.mjs` | 158/158 | **158/158 PASS** |
| `studio/player/test/smoke_playback.mjs` | 83/83 | **83/83 PASS** |
Both were run against the refactored player (shared module) on the live host. No billable API was called in either.

### Still NOT done / known weak
- **Nothing is published.** No account was created, no upload was made; `~/hilbert/studio/publish/youtube.py` is
  the tool for that when the founder says so, and it needs their credentials, not ours.
- The Mandarin cut has **no per-locale cut sheet**, so seven scenes are cut by proportional alignment. It reads
  correctly in the two scenes rendered here, and it is still arithmetic standing in for an editor.
- `narration.after_script` is still not a sidecar token in either language (`after:N`), so 07/10/16 lose their
  payoff lines in the film. Unchanged from v0.8, and it is now a *bilingual* gap.
- Footage upscaling (above), and the 4:3 black bars baked into three of the normalised masters.
- The title card's kicker stays English in the zh cut: the locale has no `chapter.tour_title`.
- Caption timing inside a long sentence is proportional to characters, not to speech. On a sentence with a long
  pause in it the second card comes up early.
- The `plate` mount is one fixed paper; period material varies (v0.7 said the same and it is still true).

### v0.9 addendum — three things the density pass asked for, all done and all verified
The coordinator landed a density pass on Day 1 (commit `d570e04`) while this was being built and raised three
items. All three are in `render_linear.mjs`; none of them touched a content file.

1. **The README seconds are now a FLOOR as well as a cap.** `len = clamp(narration + pad, readme_s,
   readme_s × (1 + slack))`. The old rule ended a scene ~2.5 s after the last word regardless of what the rundown
   authored, so trimming words bought the film no air — it just made scenes shorter and left the voice
   wall-to-wall. Day 1 now renders **1,090 s (18:10) in both languages**, every scene on its authored seconds,
   with an **air** column in `render-log.md` (scene 05: 62.0 s of scene over 41.2 s of speech, 19.8 s of air).
   The spare time is a held shot at the end of the scene. `--no-floor` reverts. Side effect worth having: the two
   cuts are now the same length to the frame, so the picture is identical and the second render re-uses the
   first's cached segments.
2. **Speech normalisation, TTS input only** (`speechText()`). The hazard is real and was checked at the phoneme
   level, not guessed: espeak (which is Kokoro's English front end) turns `No. 7` into `nˈoʊ. sˈɛvən` — the word
   *no* — and `1872` into `wˈʌn θˈaʊzənd ˈeɪthˈʌndɹɪd sˈɛvənti tˈuː`, a cardinal rather than a year. Day 1 has
   nine `No. N` and nineteen bare years. The rewrite happens on the way to the synthesizer and nowhere else, so
   the caption still reads "No. 14" as the style guide requires: `No. N` → "number N" (capitalised if it starts a
   sentence), `£N` → "N pounds", four-digit 1100–2099 → year words. A number carrying a comma or a decimal point
   is left alone, so "1,151 steps" stays a count. Every rewrite is listed in `render-log.md`. **Mandarin needs
   none and gets none** — hilbert's misaki/pypinyin was checked the same way and already reads 1872年 digit by
   digit, 8点45分 as bā diǎn sì shí wǔ fēn and 104号 as yī bǎi líng sì hào.
3. **The two Mandarin token mismatches are handled, and no zh sidecar is needed.** Confirmed by reading the code
   path, not by assertion: `s:N` tokens are resolved against the **English** sentence list first (`if (enSents[i])
   usedS.add(i)`, so `the-dash`'s `s:0-9` over-reach is simply ignored), and only then mapped onto the locale's
   sentences by `alignKept()`. `savile-row`'s `s:0-15` therefore keeps 16 of 19 English sentences and yields
   **14 of 16** Mandarin ones — not all 16. The Narrator's decision to skip `cuts/day-01-london.zh-Hans.json`
   holds. The mapping is printed per scene in `render-log.md` so it stays reviewable.

Also fixed while re-testing the change: **`06-the-reform-club` lost its sidecar `visuals`**, which took the photo
branch for the first time and immediately found two bugs. `commonsInfo()` crashed on M-96 (an archive.org IIIF
crop, not a Commons `File:` page) — stills now resolve through `resolveStill()`, which handles any http(s) file,
honours `media[].fallback` exactly as the player has since v0.8 (M-96's IIIF endpoint answered **HTTP 504** during
this run and the declared archive.org fallback was used automatically, logged), and degrades to a named card
instead of throwing. The scene now renders all **seven authored slots** through the shared `imageSlots()`, in the
player's order, with three different treatments: 1920×2560 → backdrop, 1920×1056 → fill, 709×431 and 632×521 →
plate. That is the whole point of the shared module, and it only came out because a sidecar stopped hiding it.

**Also in v0.9, and worth a founder look:** the renderer now writes `<chapter-id>_<lang>.chapters.json` and
`.chapters.txt` (the `0:00 Title` block YouTube wants pasted into a description) beside the MP4.
`products/.../linear/watch.json` is hand-maintained by another role and **is now stale** — the filenames changed
and the length floor moved every `at_s` (971 s → 1,090 s); the generated file is the one that stays in step.

And the one thing the floor makes visible: **Mandarin says the same content in less time**, so the air lands
unevenly between the cuts. `the-wager` at its authored 75 s is 41.7 s of Mandarin speech and **32.3 s of silence**;
in English the same scene is ~10 s of air. On a photo scene that is fine — the pictures keep changing on their own
slots and the silence is over moving material, which is what "silence is content" means. On a **card** scene
(07/08/18) it is a frozen frame held for half a minute. Options, none of them Engine's to choose: give the zh cut
`--no-floor`, let the translator add material to those scenes, or author a shorter `s` for them in a zh cut sheet.

## 2026-09-03 — v0.10 (engine-tools, founder D8): the literary English track is retired

> *"drop the literal english one and stick to the clear english, per the 'I need to be able to judge' principle."*
> — the founder, 2026-09-03. Recorded as **D8** in `products/around-the-world-80-days/DECISIONS.md`, superseding D5.

The reason is not tidiness. The founder is a non-native English speaker, the target reader **and** the only
reviewer; a register they cannot evaluate is prose nobody reviews. So there is now **one English narration track**,
and `narration.script` IS the clear one.

**What changed**

- **Content (33 scenes, both chapters).** `narration.variants.clear` → `narration.script`, `after_script_variants.clear`
  → `after_script`, variants objects deleted; every other field preserved. Both `tour.json` files reassembled from
  the scene files — they embed their own copies, so a scene edit reaches nothing until the tour is rebuilt — and each
  tour scene is now JSON-equal to its `scenes/*.scene.json`. Script: `promote.py` pattern is in D8; it detects each
  file's own indent + trailing-newline so the diffs are the narration keys and nothing else.
- **Player** (`studio/player/index.html`): the "Clear English" checkbox, `pickScript()`, the `yy-clear` storage key
  and the register→rate coupling are gone. TTS default rate is simply **0.9**; an explicit `yy-rate` still wins. A
  stale `yy-clear` from an older build is deleted on boot. `applyLocale()` no longer mirrors the locale into a
  variants object — it just replaces `script` / `after_script`. **`?lang=` is untouched**: language is a different
  axis from register, and `i18n/zh-Hans.json` now overlays the only English there is.
- **Renderer** (`render_linear.mjs`): `--track` and the variant lookup are gone; `_en` is `narration.script`. The
  `track` field is out of `*.chapters.json`. `--lang en|zh` and `--zh-align` are unchanged.
- **Contracts**: `scene.schema.json` drops `narration.variants` + `after_script_variants` and records the removal and
  the migration in `narration.description` (a leftover object is ignored, not rejected); `validate.py` measures the
  w/s budget on one track and WARNs if a retired variants object reappears; `templates/scene-spec.md`,
  `templates/i18n-locale.md`, `style/style-guide.md`, `render/README.md`, `PRODUCTION.md` follow.
- **Cut sheet**: **no token needed fixing.** `cuts/day-01-london.json` was already derived against the clear track
  (A5), so all 17 `s:N` tokens still resolve; re-checked scene by scene with the renderer's own splitter and again
  through `--plan --no-tts`. The dropped sentences are exactly A5's interactive-only instructions plus its declared
  editorial drops. A dated note recording the re-check is appended to the sidecar's `_comment`.

**Bug found on the way (pre-existing, NOT caused by D8) — a scene was silently missing from the film.**
`parseLinearCut()` required a bare integer in the seconds column, so when the A11 pass bolded charing-cross's new
length (`| **75** |`) earlier on 2026-09-03 the row stopped matching and **scene 12 charing-cross dropped out of the
linear cut** — the 06:35 zh render says "Selection: 16 scenes" where the 20 Aug one said 17, and nothing warned.
The parser now accepts `**`/`_`/`` ` `` around the number, and any line that looks like a cut row but yields no
seconds, or names an id that is not in the tour, is pushed to `warnings` instead of vanishing. `--plan` now selects
17 scenes again and charing-cross is back.

**How to run / what to look at**

```
python3 studio/tools/validate.py products/around-the-world-80-days/day-0{1,2}-*/scenes/*.scene.json \
                                 products/around-the-world-80-days/day-0{1,2}-*/tour.json
node studio/player/test/smoke_playback.mjs     # 83/83
node studio/player/test/smoke_images.mjs       # 158/158
node studio/player/test/smoke_v03.mjs          # ALL PASS (its toggle checks are now "the toggle is gone")
node studio/tools/render/render_linear.mjs products/around-the-world-80-days/day-01-london/tour.json \
     --plan --no-tts --out /tmp/plan          # 17 scenes, no video, no TTS, no billable call
```

Look at: the cover (no register checkbox, speed still there), any scene's caption (it is the clear wording), and
the `--plan` output for scene 12.

**Still failing, and it was failing before this change** (verified by re-running them against `HEAD`):
`smoke_panowalk.mjs` and `smoke_streetview.mjs` still test the auto-walk that **D6 retired** (`mode=undefined`,
scene 04 no longer has seven waypoints), and `smoke_generated.mjs` fails the same three scenes (10, 11, 14 — G-01
leg reveal, G-07 timeout, G-02 timeout + a 403 from the Street View embed). Those are stale-test / key problems, not
narration ones, and they are somebody's next task, not this one.
