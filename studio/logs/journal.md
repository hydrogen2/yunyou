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

## 2026-08-18 23:00 UTC — scheduled run (in progress)
**Step:** A2 close-out. The 20:00 run produced G-01…G-08 SVGs/PNGs, generators (`studio/tools/gen/`), player wiring (G-01/02/04/07) but was cut
before: G-01 PNG exports + README, player CHANGELOG v0.2 entry, manifest G-row statuses, STATUS/journal. Dispatching 2 Engine agents (G-01 finish;
player smoke test + CHANGELOG), then Editor-in-Chief updates manifest/STATUS. (Completed below when the run finishes.)

## 2026-08-19 01:00 UTC — scheduled run (in progress)
**Step:** A2 close-out, second attempt. The 23:00 run finished the G-01 exports (fold/16:9/9:16 SVG+PNG), the player smoke test
(`studio/player/test/smoke_generated.mjs` → RESULTS.md ALL PASS for G-04/G-01/G-07) and G-02…G-08 manifest rows, but stopped before:
`generated/g-01/README.md`, the player CHANGELOG v0.2 entry, the G-01 manifest row, STATUS and its journal close. Dispatching one Engine agent
(G-01 README + CHANGELOG v0.2), then the Editor-in-Chief updates manifest/STATUS. (Completed below when the run finishes.)
**Step done:** A2 is complete. One `yunyou-engine-tools` agent wrote `generated/g-01/README.md` (files table, layer contract as `wireG01` really
drives it, F-10/F-11/F-33 verified in the SVGs — ledger sums to 80 days, all nine port dates present) and the player CHANGELOG **v0.2** entry
(mkGen/setSchedule inlining + late-image-clobber guard, wireG01/02/04/07, runtime keys now honoured: `starts_at_s`, `pause_narration`/`timeout_s`
countdown, `after_script`, `kind: save`; fallbacks; smoke test how-to; still-not-done list: `on_llm_unavailable`, `max_exchanges`, `at_waypoint`,
`media[].fallback`, walk timeout advance). Editor-in-Chief set the manifest G-01 row to delivered (with weak points), STATUS.md (A2 ✓, A3 next),
PRODUCTION.md A2 ticked. Validate: 19 scenes + tour.json — 20 OK, 0 WARN.
**Files touched:** generated/g-01/README.md (new), studio/player/CHANGELOG.md, media/manifest.md (G-01 row), review/STATUS.md, studio/PRODUCTION.md, this journal.
**Problems / weak points recorded (G-01, from the Engine agent's inspection of the PNGs):** label collisions (leg-4 dashed line through "Hong Kong / 6 Nov",
leg labels sitting on their lines); the 16:9 crop drops the ledger, "= 80 days" and the credits/Natural Earth line, so the linear-cut frames carry
no source line (Rights should say whether a caption suffices); the 9:16 crop half-cuts Calcutta; `.hit[data-leg]` targets are 48 px only at 1:1
fold-open (~17 CSS px in the player — the panel buttons are the real ≥ 44 px targets) and exist only in the L1–L8 windows of scene 10;
Suez enabler is a callout in the desert, not at 30.0 N 32.5 E; "fade back to Day 1" is a hard swap; M-52 style echoed in spirit only.
None of these block A3–A5; a G-01 polish pass (label nudges, 16:9 credits line, 9:16 Calcutta) is queued as a D-item for a spare run.
**Provisional decisions (founder may reverse):** G-01 shipped with the collisions above rather than spending another run on it · G-02 eye-line
compromise accepted · G-08 licence line stays "CC BY-SA 4.0 (provisional, rights Q3)" · G-03 wager card stays on hold.
**Next step:** A3 — Content Preparer reconciles M-50 (Neuville plate 05 vs 02) and pins M-05/M-01/M-08/M-13 frames as far as possible without
downloading (this unblocks the 02 side-language and 18 "Look right" hedges).
## 2026-08-19 — production PAUSED by founder (until further notice). Resume: uncomment the #PAUSED# lines in crontab (crontab -e) or run: crontab -l | sed 's|^#PAUSED#||' | crontab -
