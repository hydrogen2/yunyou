# Scene spec — <id>

Scene specs are JSON files validating against `studio/schema/scene.schema.json`.
Filename: `scenes/NN-<id>.scene.json`. Narration script lives inside the scene.
Each claim in the script must cite fact ids in `sources`.
Validate: `python3 studio/tools/validate.py products/<p>/<chapter>/scenes/*.scene.json` — `-` lines are errors (must fix),
`! WARN` lines are advisories (fix before QA; `--strict` turns them into errors).

Checklist before handing to review:
- [ ] duration realistic for the media (don't narrate over 30 s of a 20 s clip)
- [ ] words per second ≤ 2.5 measured over the seconds actually spoken: `duration_s − narration.starts_at_s`
      (default 0), counting `narration.script` **and** `narration.after_script` (validator warns > 2.5, fails > 3.2)
- [ ] if speech does not start at 0 (title card, music-only opening), set `narration.starts_at_s`
- [ ] every interaction that waits for the traveller has a wait state: `interaction.pause_narration: true` **and**
      `interaction.timeout_s` (honest seconds; per tap for tap-to-find) — the validator fails `pause_narration` without `timeout_s`
- [ ] the sentence(s) that answer / follow the interaction go in `narration.after_script`, not in `script`
      (`script` = before/over the media, `after_script` = after the interaction resolves or times out)
- [ ] overlays ≤ 1 every 15 s (don't clutter) — overlays triggered by `at_waypoint` and `kind: "gloss"` chips are exempt from the count
- [ ] period / hard words that a newcomer must not trip on get a glossary chip: `overlays[].kind: "gloss"` with
      `text: "word — plain-English definition"` (em-dash separator; validator warns without it). The player shows a
      tappable 📖 chip and speaks the definition on tap; keep definitions ≤ 12 plain words
- [ ] clear-English track: `narration.variants.clear` = a FULL replacement for `script` (not a diff) in plain words and
      short sentences — the player swaps it in for both TTS and captions when the traveller picks "Clear English" on the
      start screen, and slows TTS to 0.9, so aim ~10 % fewer words than `script` (validator measures each variant against
      the same w/s budget). Scenes without `variants` simply play `script` (old files unaffected)
- [ ] the OTHER spoken keys get the same twin, or the track changes register mid-scene (fact-check A5): `after_script`
      → `narration.after_script_variants.clear` (string), and walk scenes' `waypoint_script`
      → `narration.waypoint_script_variants.clear` (array, one block per route index; `variants.clear` must be the join
      of those blocks, exactly as `script` is the join of `waypoint_script`). Missing twin → the runtime falls back to the
      literary text. Persona-owned lines (R4) are copied verbatim into the twin rather than re-written
- [ ] when a sentence is simplified for the clear track, its qualifier travels with it ("or part of a mile", "since 1982",
      "probably", "they say"). If the qualifier will not fit, cut the claim with it — never keep the claim and drop the hedge
      (standing rule from fact-check A5)
- [ ] walk scenes: overlays and cue captions carry `at_waypoint` (index into `interaction.route`, 0-based, must be < route length)
      **and** `at_s` — `at_s` is the linear / no-Maps-JS fallback and stays required. In the player (v0.4) `at_s` is also the
      *schedule*: the auto-walk times its arrival at waypoint k to the earliest `at_s` of that waypoint's overlays, so a pin at
      45 s means "be standing there at 45 s". Space the waypoints the way you want the walk paced
- [ ] streetview scenes turn to look at what the narration names: give the scene a `camera` track — an array of
      `{at_s, heading | look_at, pitch?, zoom?, hold_s?, ease_s?, at_waypoint?, label?}`. Use the SAME `at_s` as the pin/caption
      that names the thing (the validator warns about a pin with no cue within 3 s, and about a multi-stop walk with no camera
      track at all). Prefer `look_at: "lat,lng"` (from OSM/the fact sheet) over a bare `heading`: the runtime aims from wherever
      the pano actually is, so the framing survives Google moving the nearest pano — a bare heading is the fallback for the
      modes that cannot know their position. `hold_s` stops the walk while we look; `pitch` up for spires and near façades
      (~30 for a cross 15 m away, ~18 for a façade 27 m away); `zoom` tightens for anything far off (fov = 180 / 2^zoom).
      Nothing else is needed to make the scene cinematic: the camera walks the route by itself, paced to `duration_s`
- [ ] **streetview scenes now run on OPEN imagery first (player v0.5, mode `open`).** Nothing extra goes in the scene
      file: `interaction.route` + the `camera` track are the whole input. Before the scene is reviewed, run
      `node studio/tools/panowalk/fetch.mjs --chapter <chapter> --scene <id> --dry-run` and read the coverage table.
      Two things it tells you that change how you write the scene:
      **(a) `no-coverage`** — no freely-licensed photograph of that corner exists. The stop plays as a free Google
      Street View embed and cannot appear in the rendered video at all, so do not hang a video-only beat on it.
      **(b) `off-cue`** — imagery exists but faces the wrong way for a cue that *names* a place. A flat street
      photograph holds about 70°, so a `look_at` more than ~35° off the direction the camera was travelling cannot be
      shown; the whole stop then falls back to the embed rather than putting your pin over the wrong building. A 360°
      sequence has no such limit — if the report says `pano`, every cue at that stop is reachable.
      Cues authored against Google panoramas are not automatically servable from open imagery: re-point the `look_at`
      at something the frames can actually see, or accept the embed for that stop and say so in `production_notes`
- [ ] media that may not load (Street View pano, YouTube clip) names a `fallback` (manifest id M-xx or ref): a still for each stop
- [ ] **one shot may carry two media entries** — the thing the player may embed and the thing the video may include are
      often different works, and the scene records both. `media[].use` says which is which: `"player"` = interactive
      player only (a YouTube embed under the Standard Licence, or a CC-BY video whose *file* we do not lawfully hold —
      embedding is permitted, copying is not, `day-01-london/review/rights-a6.md` §1.2), `"linear"` = rendered MP4 only
      (our self-hosted, licence-clean cut of the same beat), `"both"` (the default when the key is absent) = either.
      The linear renderer skips `use: "player"` entries; a shot with no `linear`/`both` entry falls back to a clip card,
      which is exactly what we are trying not to ship
- [ ] **local, licence-clean video is `kind: "footage"`**, with `ref` = a path relative to the chapter directory
      (`media/files/<file>.mp4`). The Content Preparer normalises it to h264 1280×720 25 fps before it is referenced,
      records the source URL, the licence and the ffmpeg recipe in `media/manifest.md`, and does **not** commit the
      file (`.gitignore`s `products/**/media/files/*`). If the file is absent the renderer degrades to a pending-asset
      card, so a clean checkout still renders
- [ ] **archive and CC-marked footage sets `audio: "mute"` unless QA has listened.** A public-domain film may carry an
      uploader-added soundtrack that is not public domain, and a CC-marked upload may contain music the uploader could
      not sublicense; the bed comes from the chapter's own CC0/PD audio instead (standing rule, `rights-a6.md` §1.1)
- [ ] **you do not have to say how a still is framed.** The player's image treatment layer (v0.7) reads the file's
      real pixel size and the real frame and picks one of three presentations, so a portrait photograph or a 632-px
      engraving fills the screen with something that belongs to the picture instead of black bars:
      `backdrop` (an ambient, heavily blurred, darkened copy of *this same picture* behind it), `plate` (small period
      engravings, elevations and plans mounted on warm paper with a caption line, sized to their real pixels — a
      document, not a floating rectangle) or `fill` (it already fills the frame; nothing added). All three carry a
      very slow drift that starts *below* 100 % and ends *at* 100 %, so the motion can never invent resolution.
      Nothing is ever stretched, upscaled past the file's own pixels, or cropped to fit — that is a studio rule, not
      a setting. **Leave `treatment` out and you get the right answer nearly always.**
- [ ] **`media[].treatment`** (`kind: "image"` only) forces one of `backdrop` | `plate` | `fill` | `none` when the
      automatic choice is wrong for a reason you can name in `note`. Use it when: a *large* modern photograph is
      really an archive document and should be mounted (`plate`); a picture whose edges matter must not be pushed
      into (`fill`); or a scene deliberately wants the bare black frame (`none`, which also stops the drift). Never
      set `fill` on something that cannot fill 16:9 at its own resolution — you are only asking for black bars back.
      The attribution is part of the treatment: on a plate it is the caption line under the picture, elsewhere a chip
      in the corner. It is never optional, and never removable by a `treatment` choice.
- [ ] **anything derived from CC BY-SA material carries `sa: true`** — the strip-list flag from `rights-a6.md` §2.4, so
      that a future change to the studio's own output licence is a generated list rather than an archaeology project
- [ ] quiz has 3–4 options, exactly one correct, feedback on every option
- [ ] dialogue scenes list guardrails, set `interaction.on_llm_unavailable` (`choice` = chips from `options[]`, `skip`, `scripted`)
      and `interaction.max_exchanges`; `timeout_s` is the whole-chat budget; hand-back line lives in `after_script`
- [ ] souvenir / recipe cards use `interaction.kind: "save"` (no answer required; runtime offers keep/download)
- [ ] media entries reference manifest ids
