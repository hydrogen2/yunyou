# studio/tools/render — film renderer (was: linear-cut "variety show" renderer)

Turns a chapter's `tour.json` into **one publishable MP4 per language** (h264 + aac, 1920×1080 @ 25 fps,
faststart), plus a render log, a WebVTT of the narration, chapter markers and a **gap manifest**.

---

## v1.1 (2026-09-08) — FILM MODE. Read this first; it changes where the film comes from.

**A chapter is now one of two shapes, and the renderer decides by looking for `scenes/README-film.md`.**

| | **FILM** (`scenes/README-film.md` exists) | **LEGACY** (a "Linear cut" table in `scenes/README.md`) |
|---|---|---|
| what renders | every scene, in order | the scenes the table selects |
| scene length | the scene's own `duration_s` | the table's seconds, floor **and** cap, ± `--slack` |
| narration | **every sentence is spoken**; if the voice overruns, the scene stretches and says so | sentence tokens select; overruns are end-cut at a sentence boundary |
| visuals | the authored `media[].start_s`/`end_s` slots, in order, never re-divided | the sidecar's `visuals`, or defaults by scene type |
| cut sheet | **refused** — having one is a hard error | `cuts/<chapter-id>.json`, optional |

Day 1 is a film (12 scenes, 162 authored slots, 18:42). Day 2 is still legacy. Both paths are live.

**Why the cut sheet went.** A cut sheet exists to select and trim a linear cut out of an *interactive* chapter.
Under D9 (`studio/strategy/video-first.md`) the scene files *are* the film, so there is nothing left to select and
a sheet can only be a second place that disagrees with them. `cuts/day-01-london.json` is retired to
`cuts/retired/day-01-london.player18.json`; that directory's README records what the sheet uniquely provided and
where each of those things lives now (short answer: `narration.starts_at_s`, `media[]` audio entries, and the
slots themselves). **If a film chapter has a cut sheet, the renderer stops with an error rather than half-apply it.**

**Nothing is parsed leniently any more.** A row in either README that looks like a scene row and does not parse is
now a **fatal error**, not a warning: on 2026-09-03 a bolded number (`| **75** |`) stopped matching, `charing-cross`
silently left the film, and two full renders shipped without it. In film mode there are three further checks, all
fatal — the scene files on disk vs `tour.json`, vs `README-film.md`'s table (ids **and** seconds), and, after
assembly, the list of scenes that actually came out and the chapter markers in the finished file.

**The gap manifest.** The film is honestly incomplete, so every slot that does not get its own source falls back as
the scene declares and is **listed in a table at the end of the run** — on the console, in `render-log.md`, and in
`<chapter-id>_<lang>.gaps.json`. `--plan` prints the same table from a filesystem-only pre-flight, with no network
calls and no TTS, so "how thin is this film today?" is a one-second question.

**Also in v1.1:** vector assets are rasterised by the browser with the house fonts loaded (no more "screenshot the
player to see an SVG"); a pano stop is addressed by its **stop id**, not by a scene id; and burned credits are
corrected to the form `review/rights-mapillary.md` §8 requires (Mapillary's retired "platform default" hedge out,
KartaView's "© Grab and KartaView Contributors" in), with every rewrite logged.

---

**v0.9 (2026-09-03) — what changed and why it matters if you have run this before**
- The voice is the **local Kokoro model in `~/hilbert`**, not `msedge-tts`. msedge-tts wrapped an undocumented
  Microsoft endpoint with no licence for third-party use: acceptable for a private animatic, not for anything we
  publish. Kokoro is Apache-2.0, CPU-only, free, and its Mandarin goes through misaki g2p (tones survive).
- **1920×1080 is the default** (`--size 1280x720` for a quick look).
- **Stills go through the shared image-treatment layer** (`studio/player/imagelayer.mjs`, imported by the player
  *and* by this renderer): backdrop / plate / fill / none, drift 0.94 → 1.00, and **nothing is ever enlarged past
  its own pixels**. The Ken Burns that blew a 632-px engraving to 1080 and cropped the subject away is gone.
- **Two cuts:** `--lang en` and `--lang zh`. The Mandarin cut reads `i18n/zh-Hans.json` exactly as the player does.
- Output names changed: `<chapter-id>_en.mp4` / `_zh.mp4` (was `<chapter-id>_review-animatic.mp4`), and the
  sidecar captions are `<chapter-id>_<lang>.vtt` (was `_narration.vtt`). Nothing reads the old names but
  `linear/watch.json` and any bookmark of the old file — check before deleting the old MP4.

## Run

```bash
cd /home/supper-user/yunyou/studio/tools/render && npm i     # once: ffmpeg-static, ffprobe-static, playwright-core

# the two full cuts of Day 1 (run them one after the other, not in parallel — two cores)
node studio/tools/render/render_linear.mjs products/around-the-world-80-days/day-01-london/tour.json --lang en
node studio/tools/render/render_linear.mjs products/around-the-world-80-days/day-01-london/tour.json --lang zh
```

Outputs (default `--out <chapter>/linear/`):

- `<chapter-id>_en.mp4` / `<chapter-id>_zh.mp4` — the film (title card · scenes · credits)
- `<chapter-id>_en.vtt` / `<chapter-id>_zh.vtt` — the same captions as a sidecar (captions are ALSO burned in)
- `render-log.md` — per scene: seconds, TTS ok?, visual source **and the treatment each still actually got**,
  beds, every script cut; the **fallback table**; warnings (including Mandarin density); sentence index
- `<chapter-id>_<lang>.gaps.json` — the same fallback table, machine-readable: every slot that did not get its own
  source, why, what played instead, and the distinct assets that are missing
- `<chapter-id>_<lang>.chapters.json` / `.chapters.txt` — chapter markers, and the timestamp block for YouTube
- `.cache/` — Commons files, screenshots, encoded segments (safe to delete; re-runs are much faster with it)
- `.tts-cache/` next to this script — the synthesized WAVs, keyed on (provider, voice, speed, lang, text).
  Editing one line re-synthesizes one line. **Not** `~/hilbert/.tts-cache`, which we never write to.

Useful flags: `--plan` (print sentences, TTS lengths, cuts **and the pre-flight gap table**, render nothing) ·
`--strict-length` (film mode: a scene whose narration overruns its authored seconds is an error, not a stretch) ·
`--allow-partial-locale` (film mode: render `--lang zh` even though the locale does not cover every scene — by
default that is a hard error, because a Mandarin cut that speaks English in seven scenes looks finished and is not) ·
`--scenes 1,7,16` (subset) ·
`--size 1280x720` (fast look) · `--slack 0.10` · `--voice af_heart --speed 0.85` · `--gap 0.28` (silence between
sentences) · `--no-tts` (captions only) · `--no-drift` (hold every still still, the player's `?drift=0`) ·
`--cuts path.json` · `--player https://localhost/player/` · `--keep` (keep `.work/`) ·
`--zh-align proportional|whole` · `--plate-strict` · `--plate-min-area 0.10` · `--xfade-group 4` ·
`--python ~/hilbert/.venv/bin/python` ·
`--crop-preview <scene-id | Commons File: URL | image path>` with `--crop x,y,w,h`, `--crop-slot n`,
`--preview-out <dir>` (before/after frames for a `media[].crop` box; renders no film — see "Stills" below).

Requirements: Node 22, the Playwright chromium in `~/.cache/ms-playwright`, the player served over HTTPS (default
`https://localhost/player/`, cert errors ignored), internet for Commons, `~/hilbert` with its venv for the voice,
and a CJK font on the box for the Mandarin cut (`Noto Sans CJK SC` — `fc-list | grep CJK` to check).
No system ffmpeg / pip / PIL needed; the TTS adapter is handed our bundled ffmpeg.

## The voice (`tts_kokoro.py`)

`studio/tools/render/tts_kokoro.py` is a **caller** of `~/hilbert`, per `~/hilbert/docs/REUSE.md`: *"Call them, do
not edit them."* It `sys.path.insert`s hilbert, imports `from studio import tts`, loads `~/hilbert/config.yaml`
and calls `tts.synth_kokoro(text, lang, cfg, out)` — one public function, nothing else, and it writes only inside
yunyou. A sibling project once edited hilbert's TTS and invalidated the Mandarin durations of two finished
episodes; a caller that only passes arguments cannot do that.

```bash
# it also runs standalone
~/hilbert/.venv/bin/python studio/tools/render/tts_kokoro.py --probe
~/hilbert/.venv/bin/python studio/tools/render/tts_kokoro.py --text "你好，世界" --lang zh --ffmpeg /usr/bin/ffmpeg
```

Voices and speeds come from hilbert's config (`af_heart` @ 0.85 for English — deliberately slowed, this is
non-native-friendly narration; `zf_xiaoxiao` @ 1.0 for Mandarin). `--voice` / `--speed` override for one run.
`elevenlabs` is in hilbert's config as a paid upgrade path and **this adapter will not call it**: it forces
`provider: kokoro` and says so (RULE 1 — nothing here can spend).

Measured on this box: **~0.8× real time** including a ~7 s model load, both languages, ~750 MB RSS. The renderer
batches every line of a cut into ONE python process, so the model loads once per render.

**What we lost with Edge:** word boundaries. Kokoro returns audio, not timings. So an utterance is now one
*sentence* (which is also the right cache grain), and caption cards inside a long sentence are timed by character
share. Sentence in/out points are exact; word-level highlight is gone and is not coming back with this engine.

## Two cuts, one film

> **Film chapters: the locale must be complete.** `--lang zh` on a chapter with `scenes/README-film.md` fails
> unless every scene has a translated `script`. And a surviving scene *id* is not a surviving *script*: after the
> 2026-09-08 rewrite, five of Day 1's twelve ids still match `i18n/zh-Hans.json` while the text behind them is
> gone. The renderer also warns when the translated script needs more than ~70 % of the film's seconds, which is
> the usual signature of a locale that is translating an older script.


`--lang zh` overlays `products/<p>/<chapter>/i18n/<locale>.json` the way the player does: index-addressed
(`overlays[].i`, `interaction.options[].i`), anything omitted falls back to English, a partial locale is valid.
It localises the narration, the burned captions and the VTT, the scene lower-third, pins and captions, the title
and credits cards, and the quiz / chat / checklist screens.

**The one thing that does not transfer: the sidecar's `s:N` tokens.** They index the English sentences of
`narration.script`, and the locale translates that whole script, so the two lists are not the same length (Day 1: 8 of
18 scenes differ; `count-the-steps` is 19 English sentences and 13 Chinese ones). Three ways out, in order:

1. **`cuts/<chapter-id>.<locale>.json`** — a real per-locale cut sheet, same token format, indexed into the
   locale's sentences. Used automatically when it exists. This is a Narrator/Translator deliverable; get the
   index with `--plan --lang zh --no-tts`, which prints the Mandarin sentences numbered.
2. **`--zh-align proportional`** (default) — mechanical: each kept English sentence is a span of the script's
   characters; a locale sentence is kept when most of its own span lies inside a kept span. It is logged per
   scene in `render-log.md` ("re-aligned proportionally — English kept 16/19 → Mandarin 14/16") so a human can
   check it. It is not a substitute for (1).
3. **`--zh-align whole`** — speak the whole translated script and let the end-cut trim it.

**Mandarin density is checked, not assumed.** `zf_xiaoxiao` runs ≈ 286 characters/minute (4.77 char/s, hilbert's
measured figure, confirmed here). A scene whose translation needs more than 92 % of its slot has no room to
breathe — "silence is content" is a hard constraint (`studio/strategy/positioning.md`) — and it is written into
`render-log.md` as **"too dense in Mandarin"** with the numbers. The renderer will still render it: it end-cuts
at a sentence boundary and logs what it dropped. The fix belongs in the locale file or in the scene's seconds.

## What it does

0. **Mode** — `scenes/README-film.md` present → FILM; else the `## Linear cut` table in `scenes/README.md` → LEGACY;
   else all scenes except `INTERACTIVE CUT ONLY`. Any row in either table that looks like a scene row and does not
   parse is a fatal error. In FILM mode the disk / tour.json / README-film lists must agree on ids, order and
   seconds before anything renders.
1. **Selection** — FILM: all scenes, in order, at their own `duration_s`, no cut sheet.
   LEGACY: the `## Linear cut` table (`| 05 pall-mall-pass | whole … | 45 |`) → ordered scenes with a seconds cap.
2. **Script** — the scene's `narration.script`, split into sentences. An optional sidecar `cuts/<chapter-id>.json` re-selects
   sentences with tokens (`s:3-6`, `quiz:correct`, `chat:0`, `overlay:1`) — every token points at text that already exists in the
   scene JSON; nothing is authored here. Guide = `--voice`, chat answers = `--voice2`.
3. **TTS** — local Kokoro, one WAV per sentence (cached by provider+voice+speed+lang+text). Scene length =
   `max(6 s, narration_at + speech + 1.5 s)` capped at README seconds × (1 + slack). If speech overruns, the script is
   **end-cut at the last sentence boundary that fits** and the dropped sentences are logged. If TTS fails the run continues
   with captions only and says so in the log/credits (durations then come from 2.7 words/s EN, 4.77 characters/s ZH).
4. **Visuals** at `--size` (**1920×1080 @ 25 fps default**).
   **FILM:** one authored slot = one shot. `media[].start_s`/`end_s` are scene-clock seconds and are honoured to the
   frame; slots must tile 0 → `duration_s` and a gap or an overlap is reported. `image` → the treatment layer ·
   `generated` → the file (an `.svg` is rasterised at 1920×1080 in the browser, with `studio/player/fonts` loaded) ·
   `footage` → the local file (a `source in-point mm:ss` in the entry's `note` is obeyed) · `streetview` → a
   panowalk over the cached stop named by `manifest_id: "PANO/<stop_id>"`, aimed at the heading in the entry's
   `ref`. Anything absent falls back to the entry's own `fallback: "M-xx"` (resolved against the other scenes and
   `media/*.md`) and is recorded in the gap manifest; with no fallback, a pending card. It never crashes and never
   silently drops a shot.
   **LEGACY**, each scene = one or more segments:
   - `video` → **clip card** (channel, title, YouTube id, in/out mm:ss, i.ytimg thumbnail, "licensed footage goes here — review animatic"). Never downloads or re-encodes YouTube.
   - `streetview` → **stop card** with descriptions + coordinates. Never screen-records Street View.
   - Commons `image`/`map` → downloaded through the Commons API (`iiprop=url|size|…`, so a 632-px file is not
     believed to be a 1920-px one), then through the **shared treatment layer** — see "Stills" below. Photo scenes
     use the player's own `imageSlots()`, so the film and the chapter change picture on the same beat.
   - `card`/`interstitial` → headless screenshot of the real player (`showScene(n)`, header/footer/right panel hidden, `#media` = full frame).
   - `map` → the **film route map** (`lib/mapfilm.mjs`), not a screenshot of the G-01 print plate. See "The map".
   - `quiz` → the **two-state quiz** (question held, then reveal). See "The quiz".
   - `dialogue`/`game` → our own chat / checklist screens (HTML → Playwright PNG); missing generated assets → "pending" card like the player's.
5. **Captions** (libass) — **two styles only, since v1.0**: the spoken sentence bottom-centre (≤ 84 chars EN in
   Liberation Serif, ≤ 24 characters ZH in Noto Sans CJK SC, timed by character share inside the sentence) and the
   licence credit bottom-right — except on a `plate`, where the credit is printed on the paper instead and the
   corner label is suppressed. **Nothing else hovers over the picture.** See "No floating text".
6. **Audio** — narration measured with `ebur128` over the run's own clips and gained to −17 LUFS (Kokoro lands
   near −16.5, so the gain is usually under a dB — it is measured, not assumed); Commons beds measured (ebur128) and set to −35 LUFS (18 dB under), stings ≤ 6 s to −26;
   fades; `amix` + limiter. Freesound refs are skipped (login-gated) and listed under Warnings.
7. **Assembly** — per-scene MP4 (concat of segments + subtitles + mix); the rendered scene list is then checked
   against the intended one (ids and order) and again against the finished file's chapter markers, both fatal on a
   mismatch; then concat demuxer `-c copy`, `+faststart`;
   4-s title card first, credits card(s) last (every Commons file / creator / licence used, YouTube creators of
   placeholder clips, map tiles, the Kokoro voice and its licence).

## No floating text (v1.0, DECISIONS.md D9)

> *"i dont wan any floating text overlays like the one on the topleft, distracting also hard to read, we already
> have captions for that."* — the founder, after watching Day 1

Retired from the film, in this tool:

| was | where | now |
|---|---|---|
| scene title, ASS style `Title` | bottom-left, 0–4 s of every scene | **gone** — the chapter markers carry it (`*_<lang>.chapters.txt`) |
| `pin` / `caption` / `lower-third` overlays, ASS style `Pin` | top-left, timed from `scene.overlays[]` or the sidecar | **gone** — not drawn, in either language |
| overlay text reprinted on the pending-asset card | stand-in card for a missing G-xx | **gone** |
| licence credit, ASS style `Attr` | bottom-right while a credited picture is up | **KEPT** — a CC BY / CC BY-SA obligation at the point of use, not editorial text |

`scene.overlays[]` is untouched in `scene.schema.json` and in every scene file; the **film** simply stops drawing
it. There is no flag to bring it back: if a beat needs text it belongs in the narration or on a designed card.

Because dropping text silently is how information disappears, every run writes an **"Overlays — not drawn"** table
into `render-log.md`: scene, index, kind, the text, and whether the narration this cut speaks already carries it
(content-token overlap ≥ 70 %). The ones marked **NO** are the rundown's problem, not the renderer's — read that
table after any script edit.

## The quiz — question, hold, reveal (v1.0, D9)

> *"the quiz also give away the answer from the start."*

It did: one frame, every option drawn at once, the correct one ticked and green, the feedback printed underneath.
`quizScreen()` now takes a `phase`:

* **`ask`** — picture, question, options set identically. No tick, no colour, no feedback.
* **`reveal`** — the correct option lights (accent border, filled mark), the others drop to 42 % opacity, the
  feedback appears.

The cut between them is **on the scene clock, not at a fixed offset**: the renderer looks up the utterance the cut
sheet built from the `quiz:correct` token and cuts 0.45 s before it, so the answer arrives exactly as the guide
starts to say it (a 0.5 s dissolve centred on the beat). A scene with no `quiz:correct` token falls back to 62 % of
the beat and says so in `render-log.md`. Both languages, same mechanism — the token is language-independent.

Mechanically this is `segStates()`: a segment carrying several stills with **absolute scene seconds**, which
survive the duration rescaling every segment goes through.

Type is sized in `vh` (question ≈ 4.6 % of frame height = 50 px at 1080p, options 3.3 % = 36 px, feedback 2.9 %),
and the bottom 15 % of the frame is left empty because the burned captions live there.

## The map — a film graphic, not the print plate (v1.0, D9)

> *"the text in the maps are all very small and low contrast hard to read and too much text."*

**The diagnosis.** The film used to screenshot the player showing `route-map_day-01-state.svg`, which is the
**fold-open print master: 2176 × 1812**. Fitted into a 1920 × 1080 frame that is a scale of **0.596**, so the plate's
16-px leg labels and 19-px ledger figures arrive as **9.5 and 11 px**. Add an eight-row ledger, a seven-item key
and a two-line credits note, all on screen from the first frame, and it is unreadable on a phone. The plate is not
badly made; it is a *plate*, and a film is a different medium.

**What replaced it.** `lib/mapfilm.mjs` draws the film's own 1920 × 1080 graphic from the **same numbers** — the
generator now also writes `generated/g-01/route-data.json` (ports, legs, days, dates, waypoints, enablers;
F-10 / F-11 / F-33), so there is still one source of truth and nothing is re-keyed.

| the plate | the film map |
|---|---|
| 8-row × 5-column itinerary ledger, 19–21 px | **one** running total in the top strip, 80 px numeral (`20 of 80 days`), plus the current leg's day count on the map at 50 px |
| 8 port names + 8 dates + 8 leg labels, always on | **at most one port name at a time**, 54 px, with a paper halo; it fades when the next leg lands. London stays, as the anchor |
| 7-item key | none — in a film the drawing order *is* the key |
| credits line, 14 px | none — moved to the film's credits card |
| title, 42 px | none — the film has a title card |
| everything visible at t = 0 | **revealed over time**, on the narration clock |
| equirectangular on the equator (right for a plate) | equirectangular with a **standard parallel at 42° N** (latitude stretched 1.35×) so the frame is map, not empty ocean; true to scale where the route actually runs |
| enabler pins carry name + full date | accent diamond + **month and year only** (`Nov 1869`), because the narration names the place — and a place name we cannot honestly localise must not be burned into the picture |

Two states:

* **`day-1`** — the faint whole loop **traces once around the world**, then London lights with the date. Seven
  unlit ports, no ledger. This is the cold open, and it has to work with the sound off.
* **`loop`** — the eight legs draw one at a time (1.6 s each), current leg in accent, travelled legs in ink, the
  arriving port named for 3.4 s, the running day total stepping in the top strip, and the total closing at the end.

**Beats.** In the sidecar, a map visual binds each reveal to a **narration sentence**:

```json
{"kind":"routemap","state":"loop","beats":[
  {"show":"enabler:A","s":4}, {"show":"leg:1","s":9}, {"show":"leg:2","s":10}, {"show":"total","s":17}]}
```

`s` is the sentence index (the same indices the `script` tokens use), `t` is raw seconds, `lead` is how far ahead
of the word the graphic moves (default 0.25 s). `show` is `london | total | leg:1..8 | enabler:A..C`. Anything not
given is spaced evenly, so a scene with no beats still renders. A beat pointing at a sentence this cut does not
speak is logged as a warning and spaced evenly instead.

Old sidecars keep working: `{"kind":"player","call":"showRouteMap(true)"}` is routed to the film map
(`true` → `day-1`, `false` → `loop`) rather than screenshotting the plate.

**How it is rendered.** The page answers `setT(seconds)`; `sampleTimes()` asks for dense frames through a move
(12.5/s) and exactly **one** frame per hold, and `segFrames()` screenshots those instants and concatenates them
with their own durations. A 92-second map costs ~230 screenshots instead of 2 300.

**Mandarin.** Port names come from the Translator's own words: a `tap-to-find` map scene authors its options as
`London → Suez` / `伦敦 → 苏伊士`, one per leg in leg order. They are used only if all of them parse **and chain**
(option *i*'s destination is option *i+1*'s origin, and the last closes the loop). Otherwise the map shows English
names and the run warns. This tool never translates a place name itself.

**Degrades.** No `route-data.json` or no cached `src/ne_110m_land.geojson` → `MF.load()` returns null, the map beats
fall back to the old player screenshot, and the run warns that the film is showing the unreadable plate. Regenerate
with `python3 studio/tools/gen/g01_route_map.py`.

## Stills — the shared treatment layer

`studio/player/imagelayer.mjs` is imported by BOTH the player and this renderer (like `panomove.mjs`), so
`pickTreatment()` and `imageSlots()` have exactly one definition. Two rules are not settings: **never stretch,
and the layer never crops a picture to fit the frame.** (An authored `media[].crop` is a different thing — a
content decision, taken once, in the scene file. See the next section.)

### `media[].crop` — a rectangle of the source, in fractions (v1.2, 2026-09-08)

A picture is often right but has something unusable at an edge. The case that forced this: the only correctly
dated, public-domain, high-resolution Winston Churchill we can find (Agence Rol, London, 25 June 1913,
**6122 × 8488**) is a full-length ceremonial shot carrying the archive's **negative number down the right edge and
the archivist's handwritten annotation along the bottom**, where the beat wants head-and-shoulders. Earlier, an
"abercrombie KIDS" shopfront sat beside the doorway we wanted. Neither was expressible, so the slot was stuck.

```json
{ "kind": "image", "manifest_id": "M-xx", "ref": "https://commons.wikimedia.org/wiki/File:…",
  "crop": { "x": 0.24, "y": 0.10, "w": 0.40, "h": 0.30,
            "why": "head-and-shoulders; drops the plate edges carrying the negative number and the annotation" } }
```

**Fractions of the source, not pixels** (`x`,`y` = top-left, all four 0–1). Fractions survive swapping the file for
a higher-resolution scan of the same image — pixel coordinates would then point at somebody's ear. The validator
rejects out-of-range, zero-area and off-the-edge boxes with a message that says which; the layer additionally
clamps at runtime so a bad box never produces a black frame.

**Order of operations — this is the whole design:**

```
crop  →  treatment  →  fit / upscale ceiling  →  drift
```

The crop is **materialised first** (`cropStill()` writes a cropped file to the cache; the player does the same with
a canvas), so everything downstream sees *only* the cropped picture: `pickTreatment()` classifies the crop, the
paper mount **mounts the crop**, the ambient backdrop is a blurred copy **of the crop** — the negative number must
not come back, softly, behind the picture — and the drift moves within the crop.

**The ceiling therefore measures the POST-CROP pixels**, because those are the only pixels that still exist. Both
directions are real and both are correct:

| source | box | post-crop | on a 1920×1080 frame |
|---|---|---|---|
| Churchill plate 6122 × 8488 | `0.24, 0.10, 0.40 × 0.30` | **2449 × 2546** | `backdrop`, k = **0.41×** — a downscale; nothing is invented |
| Savile Row c. 1890, 695 × 478 | `0.30, 0.10, 0.30 × 0.55` | **209 × 263** | `plate`, k = **2.60×** — the 2.6× ceiling binds and holds it to a small paper mount instead of blowing 209 px to 1080p |

So a hard crop can demote a picture that filled the frame to a paper plate. That is the ceiling doing its job.
A crop **changes the aspect ratio on purpose** — that is what a crop is; **never stretch** is untouched (one `k`,
aspect exact, after the crop).

Two more things the renderer does for a cropped still:
- **it fetches more source.** We normally ask Commons for a frame-width (1920) thumbnail; if 40 % of the width
  survives the crop that leaves ~770 px. `resolveStill()` asks for `width / crop.w`, and once that is more than
  half the file's own width it takes the **original** — Commons does not always render the large thumbnail you ask
  for (a 4800-px request for the Churchill plate came back at 3840), and for a crop that silently costs resolution.
- **it never crops a fallback.** If the picture cannot be fetched and `media[].fallback` is used, the box describes
  a picture that is not on screen, so it is dropped and the substitution is logged.

`kind: generated` PNGs are cropped like any still; an **SVG** is not — it is rasterised to the frame, so change the
artboard instead. The renderer warns rather than silently ignoring the key.

**The honesty boundary.** Reframing to the subject, and removing burned-in archive marks, watermarks or modern
signage at an edge, are legitimate. Cropping away context that changes what the picture *means* — a date stamp, a
caption identifying the subject, the evidence that the scene is somewhere else — is not. `crop.why` is where you
say which; Rights and QA read it. Same wording in `studio/templates/scene-spec.md`.

### `--crop-preview` — see the box before the film (v1.2)

```bash
# every still in a scene, with a box you have not authored yet
node studio/tools/render/render_linear.mjs products/around-the-world-80-days/day-01-london/tour.json \
     --crop-preview savile-row --crop 0.30,0.10,0.30,0.55 --crop-slot 4 --preview-out /tmp/crop

# a picture that is not in any scene yet — no tour.json at all
node studio/tools/render/render_linear.mjs \
     --crop-preview 'https://commons.wikimedia.org/wiki/File:25-6-13, Londres, Mr Winston Churchill - btv1b53114849w.jpg' \
     --crop 0.24,0.10,0.40,0.30 --out /tmp/crop-out --preview-out /tmp/crop
```

Writes `<label>_before.png`, `<label>_after.png` and a side-by-side `<label>_compare.png` (plus
`crop-preview.json`), and prints what the box actually yields:

```
  preview_620b6c26  CROP-PREVIEW
    before     1920x2662 (what plays today) → backdrop, shown at 1.00x (cap 2.0x)
    fetched    6122x8488 for the crop (a crop needs more source than a frame-width thumbnail)
    crop 0.240,0.100 0.400x0.300 -> 2449x2546 of 6122x8488 (12 % of the area)
    cropped    2449x2546 → backdrop, shown at 0.41x (cap 2.0x, measured on the POST-CROP pixels)
    the crop is NOT upscaled: 2449x2546 pixels shown at 0.41x
```

Each frame goes through the **same** path as a real shot (`resolveStill → cropStill → pickTreatment → fitSize →
segStill`) with the drift switched off, so it is the composition the film will cut, not an approximation. No TTS,
no scene plan, no film is rendered, and nothing is billable — one Commons API call and one image download, cached.
It takes about six seconds. A `--crop-slot` that names something that is not a still, and a still that is not on
disk yet, are reported by name instead of failing.

### "Never upscale" is retired — read this before reinstating it (v1.0, 2026-09-08)

The third rule used to be *never upscale past the file's own pixels*. The founder retired it after watching Day 1:
*"when the scene type is a still image, can you enlarge it to fit the screen, now all too small"*. The rule existed
to stop us **claiming** detail we do not have — but showing a picture large is not a claim about its resolution,
and a 960 × 540 photograph pinned at 960 px inside a 1920-px frame just reads as a mistake.

What replaced it is a **per-picture ceiling**, `cfg.max_scale`, threaded through `pickTreatment()` and `fitSize()`:

| picture | ceiling | why |
|---|---|---|
| `media[].upscale_max` set | that | the one place a human can be explicit; wins over everything |
| `kind: generated` or `kind: map` | **3.0×** | our own vector output and printed plans — line art by construction |
| long side ≤ `plate_max_px` (760) | **2.6×** | small archive material: plates and engravings. They upscale almost for free, and they were the ones that looked broken |
| everything else | **2.0×** | photographs; softness shows. A 1920-px file needs 1.0–1.6× to fill 1080p anyway, so this rarely binds |

`--max-upscale <k>` overrides all four for a test. The enlargement itself is `scale=…:flags=lanczos`; inside a
`plate` the picture is pre-scaled with lanczos in ffmpeg and handed to the browser at 1:1, rather than letting the
browser's default filter do it. The player still defaults to `max_scale: 1` — its layout has not been re-tuned.

**What I tried first, so nobody re-litigates it.** I built a measured line-art classifier (paper / ink / midtone
histogram at native resolution, mean saturation, local flatness) and ran it over Day 1's 22 stills. It does not
separate: the Neuville wood engravings score **0.000** saturation and so does the Ben-Brooksbank black-and-white
photograph of Savile Row; scan noise flattens the flatness signal for the 1841 elevation; downscaling before
measuring turns cross-hatching into midtones. A classifier that cannot tell an engraving from a monochrome
photograph must not decide how far we enlarge either. The size-based ceiling above is generous to exactly the same
material a working classifier would have been generous to, and it is predictable.

| treatment | chosen when (in this order) | in the film |
|---|---|---|
| `plate` | long side ≤ 760 px | a warm paper mount typeset in the browser, credit printed on the paper. **Tested first**: once `max_scale` > 1 the fill test would otherwise claim a 709×431 elevation (0.93 coverage) and bleed a line drawing to the frame edge. At `max_scale: 1` the order is immaterial |
| `fill` | a contained fit already covers ≥ 90 % of the frame and it fits within the enlargement ceiling | plain contain |
| `backdrop` | anything else | bars filled with a blurred, darkened copy of the same file (`gblur` at 1/10 scale, then scaled back up — the player's trick), credit bottom-right |
| `none` | opt-out only (`media[].treatment`) | bare frame, no backdrop, no motion |

### The drift, and why it stopped juddering (v1.0)

> *"also they jitters, not sure why but that needs to be fixed"*

The drift is a push from 0.94 to 1.00 of the honest size plus a ±0.9 %/±0.7 % pan, seeded from `hash32(ref)` so a
picture drifts the same way in the film and in the player. It is built by making the canvas 1/0.94 larger and
moving *in* to 1:1, so the most magnified frame is the honest size.

It used to be driven by **`zoompan`**, and that was the bug. `zoompan` crops an **integer** pixel region out of its
input every frame. 0.94 → 1.00 over a 30-second shot is 0.16 px per frame, so the picture stands perfectly still
for five or six frames and then jumps a whole pixel — a visible stutter about four times a second.

Measured, 300 frames at 1920 × 1080, mean absolute frame-to-frame difference in an off-centre window, same zoom and
pan both times:

```
zoompan      0.00 0.00 0.03 0.04 0.00 0.00 0.00 0.00 0.00 0.05 0.00 0.00 0.38 0.43 0.00 …   21 of 30 frames frozen
perspective  0.04 0.03 0.03 0.04 0.03 0.04 0.04 0.03 0.05 0.03 0.03 0.04 0.04 0.04 0.03 …    0 of 30 frames frozen
```

So the move is now `perspective=eval=frame:interpolation=cubic:sense=source` with float corner expressions in
`on`, which samples sub-pixel (1/256 px) and needs **none** of the 4–8× supersampling the same fix would otherwise
cost — supersampling to 8× would be ~113 MB per frame buffer, which this 3 GB box cannot afford. Reproduce the
measurement with:

```bash
ffmpeg -i shot.mp4 -vf "select='between(n,100,140)',crop=500:350:120:80,format=gray,tblend=all_mode=difference" -f rawvideo - | …
```

`media[].drift: false` holds one beat still; `--no-drift` holds the whole film still.

**One deliberate divergence from the player, and its reason.** v0.7 degrades a `plate` to `backdrop` when the
mount would leave the picture under `plate_min_area` (22 %) of the frame — written for a 280-px Fold cover, where
the margin, paper and caption genuinely shrink the picture. On a 1920×1080 frame that same test also rejects
mounts whose paper costs nothing: a 709×431 elevation is 14 % of the frame, so the bare rule sends it to a grey
backdrop wash, which is the "reads as a gap" the treatment layer exists to end. The film therefore adds the
condition the rationale implies — the paper only costs more than it gives when it actually **shrinks** the picture
(`k < 1`). `--plate-strict` restores the player's arithmetic exactly; `--plate-min-area N` sets the threshold.

## Sidecar format (`cuts/<chapter-id>.json`) — LEGACY CHAPTERS ONLY

> **A film chapter must not have one.** See "v1.1 — FILM MODE" above and `cuts/retired/README.md`.


```json
{ "scenes": { "<scene-id>": {
    "script": ["s:0-2", "quiz:correct", "s:4-6"],                 // ordered tokens; omit = whole script
    "narration_at_s": 1,                                            // when speech starts
    "visuals": [ {"kind":"image","media":"M-27","dur":10}, {"kind":"clip","media":"M-13","in_s":0,"out_s":55} ],
    "beds": [ {"media":"M-44","at":0,"until":10} ],                 // omit = scene audio media, windows scaled
    "overlays": [ 0, {"i":1,"at":12,"until":18} ]                   // indices into scene.overlays, optionally re-timed
} } }
```
`visuals.kind`: `image | clip | footage | routemap (state, beats) | player (call) | scenecard | pending | quiz |
chat (chips) | checklist (closing_overlay) | panowalk (scene, stops, fallback) | streetview`; `dur` omitted = share
the remainder.

`overlays` is **read but never drawn** (v1.0, D9) — it survives in the file so the report in `render-log.md` can
list what the film is choosing not to say. A `player` visual whose call is `showRouteMap(…)` is routed to the film
map. See "The map" for `routemap`.

## Shots — the long-hold report

Every run writes a **"Shots — where the film holds one picture"** table into `render-log.md`: the still/card vs
moving split for the whole film, and every unmoving shot of `--long-shot N` seconds or more (default 20). Footage,
the panowalk and the film map are exempt — they are moving pictures.

This is a **rundown input, not a renderer setting.** The renderer cuts when the cut sheet gives it something to cut
to; a card that holds for 88 seconds holds because nothing else was authored for those 88 seconds. Measured on the
shipped 18:46 Day 1 cut: 15:33 still or card, 2:24 moving, and 18 shots ≥ 20 s totalling 12:59 — 69 % of the film.

## Rights guardrails (from review/rights.md)

No YouTube download/re-encode; no overlays over a YouTube player (there is none — cards only); no Street View recording or
caching; Commons/CC attribution in-frame while shown and on the credits card; PD/CC0 credited anyway (studio policy).

## Runtime TODO — schema keys added in fix pass A1 (2026-08-18, Engine/Tools)

`studio/schema/scene.schema.json` gained optional keys this run (validator `studio/tools/validate.py` enforces the rules).
Neither the interactive player (`studio/player/index.html`) nor this renderer honours them yet. Owner: Engine/Tools, next run.
Do not touch scene JSON to work around these; the scenes are authored against the keys as specified here.

| key | interactive player must | linear renderer (this tool) must | status |
|---|---|---|---|
| `interaction.pause_narration` (bool) | stop the scene clock and TTS at the interaction; hold overlays; resume on resolve or `timeout_s` | ignore (no interaction in a linear cut) — but never play `after_script` before the interaction beat has been shown | TODO |
| `interaction.timeout_s` (int ≥ 1) | wait budget: auto-resolve (quiz → reveal correct + feedback; tap-to-find → per-tap countdown; walk → advance to next stop; chat → hand back) and show a discreet countdown; use it in the chapter length estimate (`duration_s` + timeouts) | budget the beat: quiz/chat screens hold for min(`timeout_s`, seconds cap from README table) before the reveal | TODO |
| `interaction.on_llm_unavailable` (`choice`/`skip`/`scripted`) | dialogue with no API key/model: `choice` = render `options[]` as chips, chip → its `feedback` spoken by `--voice2`; `skip` = narration only then `next`; `scripted` = play `options[]` in order as canned Q/A. Default when absent: `choice` | always the no-LLM path: `choice` → chips screen with `sidecar chat:N` tokens; `skip` → guide narration only; `scripted` → all Q/A in order | TODO |
| `interaction.max_exchanges` (int ≥ 1) | free-chat turn cap; after N answers the persona says `narration.after_script` (hand-back) and the scene ends | number of `chat:N` tokens rendered ≤ `max_exchanges` | TODO |
| `interaction.kind: "save"` | card scenes: show a "Keep this card" button → download the generated asset (PNG) / add to the traveller's souvenirs; no answer required; `next` enabled immediately | show the card as `player` screenshot; caption "Saved to your souvenirs" not needed | TODO |
| `narration.after_script` (string) | speak after the interaction resolves (answer chosen, walk finished, chat handed back, timeout) — never before; captions likewise | speak after the interaction beat (quiz reveal / chips / stop card) as the last utterance of the scene; sentence index continues from `script`; sidecar token `after:0-2` selects sentences of it | TODO |
| `narration.starts_at_s` (number ≥ 0) | delay TTS start by this many seconds (title, music-only opening); scene clock still starts at 0 | equals sidecar `narration_at_s` when the sidecar does not override it | TODO |
| `overlays[].at_waypoint` (int, index into `interaction.route`) | walk scenes: fire the overlay when the walk reaches that waypoint (Maps JavaScript API pano `position_changed`/nearest stop) instead of `at_s`; if no Maps JS key → fall back to `at_s` | use `at_s` (linear fallback) — but if the scene's stop cards are rendered per waypoint, attach the overlay to its stop card | **DONE (player, v0.4, inverted)** — the auto-walk reads `at_waypoint`+`at_s` as the *schedule*: waypoint k is timed to arrive at the earliest `at_s` of its overlays, so the pin and the arrival coincide in every mode and there is nothing left to re-fire. Linear renderer unchanged (`at_s`). |
| `media[].fallback` (string: M-xx or ref) | show this instead when the media cannot load: no Maps key/JS, deleted or region-blocked YouTube id, offline; for streetview stops the still image of that stop | prefer `fallback` (a Commons still) over the clip/stop placeholder card when it resolves to an image | TODO |

Also pending from the same brief: the step counter in walk scenes needs the Maps JavaScript API (Street View Service, not the
Embed API). D12 is now answered — the founder's key has the Maps JavaScript API enabled and the player's `js` mode holds a live
`StreetViewPanorama` with `position_changed` (v0.4), so a real distance-driven counter is buildable; it is NOT built yet
(`window.__sv.debug.pos` is the hook). `media[].fallback` for a missing pano is still unimplemented: v0.4 skips forward to the
next reachable pano instead of showing the stop still.

## Scene length

**FILM: `len = duration_s`, and the script is never cut.** The scene file is the film, so every sentence the
Narrator wrote is spoken. If the synthesized voice needs more than the authored seconds the scene *stretches* to
fit and every slot in it scales by the same factor — the shot order and the proportions survive, the words survive,
and the overrun is a warning naming the scene and the seconds. `--strict-length` makes it a hard failure instead,
for a render that has to hit a stated running time.

**LEGACY: the README seconds are a FLOOR as well as a cap.**
`len = clamp(narration + pad, readme_s, readme_s × (1 + slack))`.

Until v0.9 the seconds in `scenes/README.md` were only a cap: a scene ended about 2.5 s after the last word, so a
scene written for 62 s with 41 s of speech was rendered as 44 s. Seventeen scenes of the 20 Aug animatic did that.
The consequence was that **trimming words bought the film no air at all** — it made scenes shorter and the voice
stayed wall-to-wall, which defeats both the density work and `studio/strategy/positioning.md`'s "silence is
content". The authored seconds now mean what they say; the spare time is a held shot at the end of the scene, and
`render-log.md` has an **air** column per scene so you can see how much silence each one got. `--no-floor` reverts.

A side effect worth knowing: with the floor, **both cuts are the same length to the frame** (Day 1: 1,090 s =
18:10 in English and in Mandarin), because every scene lands on its README seconds. The picture is identical
between the two cuts, so the second cut you render reuses the first one's cached video segments.

## Speech normalisation — TTS input only

Kokoro phonemizes English through espeak, and espeak was asked directly rather than guessed at:

```
'He lived at No. 7.'  ->  hiː lˈɪvd æt nˈoʊ. sˈɛvən.                     ← the word "no"
'The year was 1872.'  ->  ... wˈʌn θˈaʊzənd ˈeɪthˈʌndɹɪd sˈɛvənti tˈuː.   ← a cardinal, not a year
```

Day 1 has nine `No. N` and nineteen bare years. The caption must read "No. 14" (style guide) and the caption IS
the script, so the fix cannot live in the text: `speechText()` rewrites on the way to the synthesizer and nowhere
else — captions, VTT, render log and scene files keep the authored wording. Rules: `No. N` → "number N" (capital
if it starts a sentence), `£N` → "N pounds", a bare four-digit 1100–2099 → year words ("eighteen seventy-two",
"nineteen oh five", "nineteen hundred", "twenty thirteen"). A number with a comma or a decimal point is left
alone, so "1,151 steps" stays a count. Every rewrite is listed in `render-log.md`.

**Mandarin needs none of this and gets none.** hilbert's misaki/pypinyin g2p was checked the same way and is
already right: `1872年` → `i→pa→ ʨʰi→ɚ↘ njɛ↗n` (digit-by-digit, the Chinese convention for a year), `8点45分` →
bā diǎn sì shí wǔ fēn, `104号` → yī bǎi líng sì hào, `12月21日` → shí èr yuè èr shí yī rì.

## Known limits

- Clip/stop cards are placeholders where a scene has no licence-clean file yet.
- Script cuts are mechanical (end-cut). The Narrator should read `render-log.md` and adjust the sidecar or the scripts.
- Overlays keep their interactive-scene timings unless re-timed in the sidecar.
- **Footage is upscaled.** `media/files/*.mp4` are 1280×720 masters, so a 1080p frame enlarges them 1.5×, and three
  of them were already enlarged from 640×480 / 270×270 with black bars baked in. The stills obey the never-upscale
  rule; the motion does not, because a 4:3 archive master with baked bars cannot be treated after the fact.
- The panowalk crop is an upscale too: an 82° window of a 5760-px equirect is 1312 px, shown at 1920.
- Caption cards inside one sentence are timed by character share, not by speech (Kokoro has no word track).
- **Timings on this box (2 cores, 3 GB).** Measured per piece, not end to end: TTS ≈ 0.8× real time of the audio it
  makes (≈ 12 min for an English chapter, ≈ 9 min for Mandarin, once — then it is cached); video ≈ 2.0–2.5× real
  time of the film (scene 05, seven stills + bed + burn-in: 62 s of film in 2 min 10 s; scene 04, the panowalk:
  88 s of film in 3 min 35 s). So expect **≈ 60–75 min for the first cut on a cold cache** and **≈ 30–35 min for
  the second**, which re-uses the first cut's video segments and only redoes the audio mix and the caption burn.
  Run them one after the other: two cores do not make two renders twice as fast.
- 1080p is at the edge of this box's memory. `--xfade-group` exists because it went over that edge once.
