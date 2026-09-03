# studio/tools/render — linear-cut ("variety show") renderer

Turns a chapter's `tour.json` + the **Linear cut** table in `scenes/README.md` into **one publishable MP4 per
language** (h264 + aac, 1920×1080 @ 25 fps, faststart), plus a render log and a WebVTT of the narration.

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
  beds, every script cut; warnings (including Mandarin density); sentence index for the sidecar
- `.cache/` — Commons files, screenshots, encoded segments (safe to delete; re-runs are much faster with it)
- `.tts-cache/` next to this script — the synthesized WAVs, keyed on (provider, voice, speed, lang, text).
  Editing one line re-synthesizes one line. **Not** `~/hilbert/.tts-cache`, which we never write to.

Useful flags: `--plan` (print sentences, TTS lengths and cuts, render nothing) · `--scenes 1,7,16` (subset) ·
`--size 1280x720` (fast look) · `--slack 0.10` · `--voice af_heart --speed 0.85` · `--gap 0.28` (silence between
sentences) · `--no-tts` (captions only) · `--no-drift` (hold every still still, the player's `?drift=0`) ·
`--cuts path.json` · `--player https://localhost/player/` · `--keep` (keep `.work/`) · `--track clear|standard` ·
`--zh-align proportional|whole` · `--plate-strict` · `--plate-min-area 0.10` · `--xfade-group 4` ·
`--python ~/hilbert/.venv/bin/python`.

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

`--lang zh` overlays `products/<p>/<chapter>/i18n/<locale>.json` the way the player does: index-addressed
(`overlays[].i`, `interaction.options[].i`), anything omitted falls back to English, a partial locale is valid.
It localises the narration, the burned captions and the VTT, the scene lower-third, pins and captions, the title
and credits cards, and the quiz / chat / checklist screens.

**The one thing that does not transfer: the sidecar's `s:N` tokens.** They index the *English clear* sentences,
and the locale translates the whole clear script, so the two sentence lists are not the same length (Day 1: 8 of
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

1. **Selection** — parses the `## Linear cut` table (`| 05 pall-mall-pass | whole … | 45 |`) → ordered scenes with a seconds cap.
   No table → all scenes except `INTERACTIVE CUT ONLY`, capped at `duration_s`.
2. **Script** — the scene's `narration.script`, split into sentences. An optional sidecar `cuts/<chapter-id>.json` re-selects
   sentences with tokens (`s:3-6`, `quiz:correct`, `chat:0`, `overlay:1`) — every token points at text that already exists in the
   scene JSON; nothing is authored here. Guide = `--voice`, chat answers = `--voice2`.
3. **TTS** — local Kokoro, one WAV per sentence (cached by provider+voice+speed+lang+text). Scene length =
   `max(6 s, narration_at + speech + 1.5 s)` capped at README seconds × (1 + slack). If speech overruns, the script is
   **end-cut at the last sentence boundary that fits** and the dropped sentences are logged. If TTS fails the run continues
   with captions only and says so in the log/credits (durations then come from 2.7 words/s EN, 4.77 characters/s ZH).
4. **Visuals** at `--size` (**1920×1080 @ 25 fps default**), each scene = one or more segments:
   - `video` → **clip card** (channel, title, YouTube id, in/out mm:ss, i.ytimg thumbnail, "licensed footage goes here — review animatic"). Never downloads or re-encodes YouTube.
   - `streetview` → **stop card** with descriptions + coordinates. Never screen-records Street View.
   - Commons `image`/`map` → downloaded through the Commons API (`iiprop=url|size|…`, so a 632-px file is not
     believed to be a 1920-px one), then through the **shared treatment layer** — see "Stills" below. Photo scenes
     use the player's own `imageSlots()`, so the film and the chapter change picture on the same beat.
   - `card`/`interstitial` → headless screenshot of the real player (`showScene(n)`, header/footer/right panel hidden, `#media` = full frame).
   - `map` with a route-map asset → player `showRouteMap(true|false)` (Leaflet + CARTO tiles).
   - `quiz`/`dialogue`/`game` → our own quiz / chat / checklist screens (HTML → Playwright PNG); missing generated assets → "pending" card like the player's.
5. **Captions** (libass): scene title lower-third for 4 s, spoken sentence bottom-centre (≤ 84 chars EN in
   Liberation Serif, ≤ 24 characters ZH in Noto Sans CJK SC, timed by character share inside the sentence),
   selected scene overlays (pins/captions) top-left, attribution bottom-right — except on a `plate`, where the
   credit is printed on the paper instead and the corner label is suppressed.
6. **Audio** — narration measured with `ebur128` over the run's own clips and gained to −17 LUFS (Kokoro lands
   near −16.5, so the gain is usually under a dB — it is measured, not assumed); Commons beds measured (ebur128) and set to −35 LUFS (18 dB under), stings ≤ 6 s to −26;
   fades; `amix` + limiter. Freesound refs are skipped (login-gated) and listed under Warnings.
7. **Assembly** — per-scene MP4 (concat of segments + subtitles + mix), then concat demuxer `-c copy`, `+faststart`;
   4-s title card first, credits card(s) last (every Commons file / creator / licence used, YouTube creators of
   placeholder clips, map tiles, the Kokoro voice and its licence).

## Stills — the shared treatment layer

`studio/player/imagelayer.mjs` is imported by BOTH the player and this renderer (like `panomove.mjs`), so
`pickTreatment()` and `imageSlots()` have exactly one definition. Three rules are not settings: **never stretch,
never upscale past the file's own pixels, never crop the subject away.**

| treatment | chosen when | in the film |
|---|---|---|
| `fill` | a contained fit already covers ≥ 90 % of the frame and the file has the pixels | plain contain |
| `backdrop` | anything else big enough to carry the frame | bars filled with a blurred, darkened copy of the same file (`gblur` at 1/10 scale, then scaled back up — the player's trick), credit bottom-right |
| `plate` | long side ≤ 760 px | a warm paper mount typeset in the browser, picture at 1:1, credit printed on the paper |
| `none` | opt-out only (`media[].treatment`) | bare frame, no backdrop, no motion |

The **drift** is `zoompan` from 0.94 to 1.00 of the honest size, seeded from `hash32(ref)` so a picture drifts the
same way in the film and in the player. It is built by making the canvas 1/0.94 larger and zooming *in* to 1:1, so
the most magnified frame is the honest size and every other frame is a downscale — it cannot invent resolution.
`media[].drift: false` holds one beat still; `--no-drift` holds the whole film still.

**One deliberate divergence from the player, and its reason.** v0.7 degrades a `plate` to `backdrop` when the
mount would leave the picture under `plate_min_area` (22 %) of the frame — written for a 280-px Fold cover, where
the margin, paper and caption genuinely shrink the picture. On a 1920×1080 frame that same test also rejects
mounts whose paper costs nothing: a 709×431 elevation is 14 % of the frame, so the bare rule sends it to a grey
backdrop wash, which is the "reads as a gap" the treatment layer exists to end. The film therefore adds the
condition the rationale implies — the paper only costs more than it gives when it actually **shrinks** the picture
(`k < 1`). `--plate-strict` restores the player's arithmetic exactly; `--plate-min-area N` sets the threshold.

## Sidecar format (`cuts/<chapter-id>.json`)

```json
{ "scenes": { "<scene-id>": {
    "script": ["s:0-2", "quiz:correct", "s:4-6"],                 // ordered tokens; omit = whole script
    "narration_at_s": 1,                                            // when speech starts
    "visuals": [ {"kind":"image","media":"M-27","dur":10}, {"kind":"clip","media":"M-13","in_s":0,"out_s":55} ],
    "beds": [ {"media":"M-44","at":0,"until":10} ],                 // omit = scene audio media, windows scaled
    "overlays": [ 0, {"i":1,"at":12,"until":18} ]                   // indices into scene.overlays, optionally re-timed
} } }
```
`visuals.kind`: `image | clip | player (call) | scenecard | pending | quiz | chat (chips) | checklist (closing_overlay) | streetview`; `dur` omitted = share the remainder.

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

## Scene length: the README seconds are a FLOOR as well as a cap

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
