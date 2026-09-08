# Retired cut sheets

A **cut sheet** exists to select and trim a *linear cut* out of an *interactive* chapter: which narration sentences
to speak, which visuals to show, how long to hold each one, which overlays to re-time. It is a second, parallel
description of the film, and it can disagree with the scenes.

**Under D9 (`studio/strategy/video-first.md`) that job does not exist.** A film chapter's scene files *are* the film:
every sentence is spoken, every picture carries its own `start_s`/`end_s`, and the scene's `duration_s` is the
scene's length. There is nothing left to select, so a cut sheet can only be a second place that disagrees.

`render_linear.mjs` therefore **refuses to run** when a chapter has `scenes/README-film.md` *and* a cut sheet at
`cuts/<chapter-id>.json`. Retiring one is the fix; there is no flag to run both.

## Files here

| file | was | retired |
|---|---|---|
| `day-01-london.player18.json` | `cuts/day-01-london.json` — the sheet for the **18-scene interactive chain**, now at `products/around-the-world-80-days/day-01-london/scenes/retired-player-18/` | 2026-09-08, when Day 1 was rewritten as a 12-scene film |

### Why Day 1's sheet was not rebuilt

Only 5 of its 17 keys (`cold-open`, `savile-row`, `the-wager`, `charing-cross`, `souvenir`) even name a scene that
still exists, and every one of those five describes a different scene from the one that now bears the name — a
different length, a different picture list, sentence indices into a script that has been rewritten end to end.
Rebuilding it would have meant re-deriving 12 scenes' worth of tokens against text that already says exactly what it
wants, and then maintaining both copies for ever.

**What it uniquely provided, and where that lives now — nothing was dropped:**

| cut-sheet key | now |
|---|---|
| `script: ["s:0-15"]` — which sentences to speak | gone. A film speaks all of them (D9); the renderer never end-cuts a film scene, it stretches the scene and says so. |
| `visuals: [...]` — what is on screen and for how long | `scene.media[].kind` + `start_s`/`end_s`, authored per shot (162 slots in Day 1). |
| `narration_at_s` | `scene.narration.starts_at_s` (already authored: 3 s in `cold-open` and `savile-row`). |
| `beds: [{media, at, until}]` | `scene.media[]` entries of `kind: "audio"` with their own `start_s`/`end_s` — the renderer's long-standing default when no sheet says otherwise. |
| `overlays: [...]` re-timing | gone with overlays themselves (D9: nothing hovers over the picture). |
| `clip_note`, `_readme`, `_a*_note` | prose; the scene files carry their own `note` and `review.notes`. |

Keep these files: they are the only machine-readable record of how the interactive cut was assembled, and
`scenes/retired-player-18/` still addresses the same scene ids. **Do not put one back in `cuts/` for a film
chapter.**
