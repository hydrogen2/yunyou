# NEXT TASK — handoff (written 2026-08-20, session ending)

## State
**Day 1 (`day-01-london`) — done and live.** Player has everything; the /watch video is STALE (older title,
none of the recent picture work). The founder has NOT asked for a re-render — do not render without being asked.
**Day 2 (`day-02-to-brindisi`) — three of four content steps done and committed:**
- `research/fact-sheet.md` — F-48…F-109 ✓
- `media/manifest.md` — M-201…, 10/10 beats downloadable, ZERO embeds needed ✓
- `rundown/rundown.md` — 15 scenes, 18:45, density budgeted per segment ✓
- `scenes/` — **NOT DONE.** A scene-build agent was in flight when the session ended and had written
  nothing (0/15), so nothing is half-finished. **Re-run that step.**

## Do next: build Day 2's scenes
Dispatch a `yunyou-scene-developer` acting as Scene Developer AND Narrator. It must read: studio/roles/_common.md,
scene-developer.md, narrator.md, studio/templates/scene-spec.md, studio/schema/scene.schema.json,
products/around-the-world-80-days/DECISIONS.md (all rules; D8 clear English is the only English — supersedes D5 —,
D6 Street View = stop-and-look
only), studio/strategy/positioning.md (tone is a HARD constraint), shared/style-guide.md, shared/personas/guide.md,
and Day 2's three completed documents above. Use day-01-london/scenes/06-the-reform-club.scene.json and
15-look-up-the-cross.scene.json as house shape.
Requirements: every scene needs `narration.script`, written in CLEAR English — that is the only track since
2026-09-03 (D8); do NOT add `narration.variants` · respect the rundown's per-segment
density budgets · **the three named silences must survive** (the notebook lines unspoken, the sea under the Dover
film, fifteen seconds after Sommeiller's death) · photo scenes carry explicit per-still `start_s`/`end_s` (the player
honours them since v0.8) and note which sentence each slot is timed against · the two Street View scenes (11 Turin,
13 Brindisi) use `interaction.kind: "look"` + a `camera` cue track and NAME what to find · gloss chips ≤ 12 words,
never for a word the traveller does not hear · **F-108 (the PLM "no passengers" postcard) may appear only as a
go-deeper open question, never as narration** · apply the rundown's two generated-asset corrections.
Then assemble `day-02-to-brindisi/tour.json`, write `scenes/README.md`, and run
`python3 studio/tools/validate.py products/around-the-world-80-days/day-02-to-brindisi/scenes/*.scene.json products/around-the-world-80-days/day-02-to-brindisi/tour.json`.
After that: light Fact-Check + QA, then tell the founder. Player only.

## Standing rules that bite
- **RULE 1: never incur any cost, never create accounts.** Google key is restricted to Maps Embed (free); Mapillary
  token is free. Billable modes are gated behind `billing_ack` and must stay off.
- **Never download from YouTube.** Commons-hosted licence-reviewed copies and PD/CC files only.
- Production cron stays **PAUSED** until the founder says otherwise (the one active crontab line is a different project).

## Open, non-blocking
- Mapillary exposes no per-image licence — Rights must settle before ANY open-imagery frame enters an MP4.
- Chinese UI chrome still English (locale carries content strings only; UI strings need their own table).
- Four Day-1 Reform Club script edits want Narrator sign-off (listed in that scene's `review.notes`).
- Renderer needs a never-upscale clamp + the v0.7 treatment before the next video render, or small plates get blown up.
- 13 stills in video/map/quiz/dialogue scenes have timings nothing reads (see player CHANGELOG v0.8).
