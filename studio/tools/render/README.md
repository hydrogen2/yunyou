# studio/tools/render — linear-cut ("variety show") renderer

Turns a chapter's `tour.json` + the **Linear cut** table in `scenes/README.md` into one passive MP4 the founder can watch
in a browser (h264 + aac, faststart), plus a render log and a WebVTT of the narration.

## Run

```bash
cd /home/supper-user/yunyou/studio/tools/render && npm i          # once: ffmpeg-static, ffprobe-static, msedge-tts, playwright-core
node studio/tools/render/render_linear.mjs products/around-the-world-80-days/day-01-london/tour.json
```

Outputs (default `--out <chapter>/linear/`):

- `<chapter-id>_review-animatic.mp4` — the film (title card · scenes · credits)
- `render-log.md` — per scene: seconds, TTS ok?, visual source, beds, every script cut; warnings; sentence index for the sidecar
- `<chapter-id>_narration.vtt` — narration captions with absolute times
- `.cache/` — TTS mp3+metadata, Commons files, screenshots, encoded segments (safe to delete; re-runs are much faster with it)

Useful flags: `--plan` (print sentences, TTS lengths and cuts, render nothing) · `--scenes 1,7,16` (subset) ·
`--size 960x540` (if a machine is slow) · `--slack 0.10` · `--voice en-GB-RyanNeural --voice2 en-GB-ThomasNeural --rate -5%` ·
`--no-tts` (captions only) · `--cuts path.json` · `--player https://localhost/player/` · `--keep` (keep `.work/`).

Requirements: Node 22, the Playwright chromium in `~/.cache/ms-playwright` (playwright-core 1.62 ↔ chromium-1234), the player
served over HTTPS (default `https://localhost/player/`, cert errors ignored), internet for Commons + the Edge TTS endpoint.
No system ffmpeg / pip / PIL needed.

## What it does

1. **Selection** — parses the `## Linear cut` table (`| 05 pall-mall-pass | whole … | 45 |`) → ordered scenes with a seconds cap.
   No table → all scenes except `INTERACTIVE CUT ONLY`, capped at `duration_s`.
2. **Script** — the scene's `narration.script`, split into sentences. An optional sidecar `cuts/<chapter-id>.json` re-selects
   sentences with tokens (`s:3-6`, `quiz:correct`, `chat:0`, `overlay:1`) — every token points at text that already exists in the
   scene JSON; nothing is authored here. Guide = `--voice`, chat answers = `--voice2`.
3. **TTS** — Edge neural TTS per utterance (cached by text+voice+rate) with word/sentence boundaries. Scene length =
   `max(6 s, narration_at + speech + 1.5 s)` capped at README seconds × (1 + slack). If speech overruns, the script is
   **end-cut at the last sentence boundary that fits** and the dropped sentences are logged. If TTS fails the run continues
   with captions only and says so in the log/credits.
4. **Visuals** at `--size` (1280×720 @ 25 fps default), each scene = one or more segments:
   - `video` → **clip card** (channel, title, YouTube id, in/out mm:ss, i.ytimg thumbnail, "licensed footage goes here — review animatic"). Never downloads or re-encodes YouTube.
   - `streetview` → **stop card** with descriptions + coordinates. Never screen-records Street View.
   - Commons `image`/`map` → downloaded through the Commons API (imageinfo, width 1920), Ken Burns via ffmpeg `zoompan`, attribution burned bottom-right.
   - `card`/`interstitial` → headless screenshot of the real player (`showScene(n)`, header/footer/right panel hidden, `#media` = full frame).
   - `map` with a route-map asset → player `showRouteMap(true|false)` (Leaflet + CARTO tiles).
   - `quiz`/`dialogue`/`game` → our own quiz / chat / checklist screens (HTML → Playwright PNG); missing generated assets → "pending" card like the player's.
5. **Captions** (libass): scene title lower-third for 4 s, spoken sentence bottom-centre (chunks ≤ 84 chars, word-timed),
   selected scene overlays (pins/captions) top-left, attribution bottom-right.
6. **Audio** — narration at ≈ −17 LUFS; Commons beds measured (ebur128) and set to −35 LUFS (18 dB under), stings ≤ 6 s to −26;
   fades; `amix` + limiter. Freesound refs are skipped (login-gated) and listed under Warnings.
7. **Assembly** — per-scene MP4 (concat of segments + subtitles + mix), then concat demuxer `-c copy`, `+faststart`;
   4-s title card first, credits card(s) last (every Commons file / creator / licence used, YouTube creators of placeholder clips, map tiles, voice).

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

## Known limits

- Clip/stop cards are placeholders: the film has no real footage until Rights clears direct licences.
- Script cuts are mechanical (end-cut). The Narrator should read `render-log.md` and adjust the sidecar or the scripts.
- Overlays keep their interactive-scene timings unless re-timed in the sidecar.
- Two encodes per scene (segments, then mix); ~10–13 min of 720p renders in ~15–20 min on 2 CPUs with a warm TTS cache.
