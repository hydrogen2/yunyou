# Studio journal (scheduled runs)

## 2026-08-18 — bootstrap (interactive session with founder)
Studio scaffolded; Day 1 London dry run complete through DIGEST; player, linear-cut renderer, /watch page, window prototype built;
repo pushed to github.com/hydrogen2/yunyou. Scheduled runs start from queue item A1 in `studio/PRODUCTION.md`.

## 2026-08-18 14:00 UTC — scheduled run (retro entry, written by the 17:00 run)
**Step:** A1 phase 1 — Editor-in-Chief wrote `review/fix-brief.md`; Scene Developer applied fact-check/continuity/QA fixes to all 19 scenes
(Quiz B → scene 16 before the dialogue, honest scene-18 daylight, full seven-stop walk in 04, wait states, dialogue budget), Engine/Tools extended
`scene.schema.json` + `validate.py` (+ scene-spec template, render README TODOs, player CHANGELOG), Continuity Editor appended R1–R5 / canon to
style-guide + world-bible, Fact-Checker amended the fact-sheet rows, README + tour.json regenerated. Committed as `038c3c7`.
**Problem:** the run hit the Claude session limit ("resets 5pm UTC") after ~22 min, before the Narrator phase, STATUS.md and this journal entry —
so the commit says rc=1 with no journal. Lesson (D): when a run is at risk of the quota, write STATUS/journal *first* with "in progress",
then dispatch; the 17:00 run picked up cleanly because every scene carried its `review.notes` line. The 11:00 run did nothing (limit hit at start).

## 2026-08-18 17:00 UTC — scheduled run
**Step done:** A1 phase 2 — Narrator pass (`yunyou-narrator`, one agent). All 19 `narration.script`/`after_script`/`waypoint_script` polished to
the fix-brief §2 limits (01 → 97 words from 10 s; 02 → 197; 06 → 137, sentences ≤ 20 words, ends "…and reads The Times"; 08 → 149/60 s;
13 → 148/60 s; all ≤ 2.5 w/s), Paris-newspaper line moved 01 → 08 (F-32), 10 got a 40-s linear legs beat in production_notes, quiz-the-weather
names no weather before its reveal, 17 guide-in/hand-back = passepartout.md §6 verbatim, chips = §5 verbatim; personas → guide.md v1.1,
passepartout.md v1.1 (+5 guard lines, Ralph line, cab-fare clause, no "gold", 84 °F hedged, 180-s cap, red-team probes). tour.json regenerated.
**Validate:** 19 scenes + tour.json — 20 OK, 0 WARN (the 08/13 wpm warnings are gone). **A1 is complete.**
**Files touched:** scenes/*.scene.json (19), tour.json, shared/personas/guide.md, shared/personas/passepartout.md,
review/narration-pass-A1.md (new), review/STATUS.md, this journal.
**Problems:** none in this run. Narrator notes 08/13/09 sit at ~2.5 w/s on stills (rule met, but little air) and 02/18 side-language stays
"unverified" until A3 pins frames.
**Provisional decisions (founder may reverse):** D3 ~24 min real length · D4 boat-train ending, modern guide, both quizzes, Quiz B before the
dialogue · D5 full seven-stop walk at 0.97 m/step (needs Maps JS API — D12 open) · D7 No. 7 caption softened · D8 Passepartout free chat with
guardrails, chips fallback · D9 recipe-card souvenir · D10 R1–R5 + "8:45 pm" style, scene 19 music M-41 · D11 no Thames coda ·
scene 18: honest daylight lines, no M-16 insert · Passepartout system prompt accepted at ≈ 350 words · 08/13 density accepted (08 stays 60 s).
**Next step:** A2 — Engine/Tools generates G-01…G-08 into `day-01-london/generated/` per manifest specs and wires the player; update manifest status.

## 2026-08-18 20:00 UTC — scheduled run (in progress)
**Step:** A2 — Engine/Tools generates G-01…G-08 into `day-01-london/generated/` and wires the player. Prep by the Editor-in-Chief before dispatch:
house fonts fetched (`studio/player/fonts/` Playfair Display + Source Sans 3, OFL, + `fonts.css`), shared exporter `studio/tools/svg2png.mjs`
(inline SVG → PNG via playwright chromium, exact WxH, house fonts). Four `yunyou-engine-tools` agents dispatched in parallel: G-01 map · G-02 split-frame ·
G-04/05/06/08 cards · G-07 game + player wiring. (Entry completed below when the run finishes; if not, the run hit the quota.)
