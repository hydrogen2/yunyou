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
