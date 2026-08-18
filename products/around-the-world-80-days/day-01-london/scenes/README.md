# Scenes — Day 1: London — the departure

**Scene Developer:** scene-developer (Claude)   **Date:** 2026-08-18 (draft a.m.; fix pass A1 p.m.)   **Status:** fix pass A1 applied — all `review` fields still "pending" (fact-check / rights / QA re-run after the Narrator's phase 2)
**Inputs:** ../rundown/rundown.md · ../review/fix-brief.md (§0 provisional decisions D3–D11, §1 my list) · ../review/fact-check.md · ../review/continuity.md · ../review/qa.md · ../research/fact-sheet.md (F-01…F-45) · ../media/manifest.md (M-01…M-61, G-01…G-08) · ../../shared/personas/passepartout.md §5–6 · ../../shared/personas/guide.md §8 · studio/schema/scene.schema.json (extended this run) · ../../shared/style-guide.md
**Conventions used in the JSON:** `media[].start_s/end_s` = source in/out for YouTube; on-screen window in scene seconds for images, audio, generated assets and Street View. `media[].fallback` = manifest id shown if the primary cannot load. `overlays[].at_waypoint` = index into `interaction.route` (interactive trigger); `at_s` stays as the linear / no-JS fallback. `narration.after_script` = spoken after the interaction resolves; `narration.starts_at_s` = when speech begins; `interaction.pause_narration` + `timeout_s` = the honest wait state. Extra keys `production_notes` (per scene), `note` (per media entry / overlay), `narration.waypoint_script` (04: one cue block per route index; `script` is their join) and `accessibility.sound_captions` (12, 18: caption-track entries for sound-only cues) are allowed by the schema. Narration is first-person plural, guide persona; on-screen time style "8:45 pm" (D10).

## Scenes in order

| # | file | id | type | dur (s) | rundown seg | media (manifest ids) | one line |
|---|------|----|------|--------:|-------------|----------------------|----------|
| 01 | 01-cold-open.scene.json | cold-open | interstitial | 75 | 1 | M-40 (title only, 8 s), G-01 (Day-1 layer, labelled), M-34, M-41 | Title 8 s, narration from 10 s; date, deadline, stake; 1,920-hours caption at 36–46 s; only London lit. |
| 02 | 02-savile-row.scene.json | savile-row | video | 100 | 2 | M-05 21:35–23:05, M-32 | Burlington Gardens corner into the Row; Verne's No. 7 / 1814 vs Sheridan's No. 14 / 1816; Poole on the Row 1846, at No. 15 since 1982; side-neutral until A3 pins frames. |
| 03 | 03-fogg-by-the-clock.scene.json | fogg-by-the-clock | card | 60 | 3 | G-04 (requested), M-50 (plate 05; backup M-34) | Tap-to-find timetable; guide reads only the times and the CV, the taps hold the punchlines (pause per tap, 12 s). |
| 04 | 04-count-the-steps.scene.json | count-the-steps | streetview | 150 (user-paced) | 4 | M-39, M-53, M-54, M-55, M-56, M-57, M-37 (fallbacks M-33, M-20) | Full seven-stop walk, 1,120 m, counter 0.97 m/step lands on 1,151 at the façade; overlays and cues fire per waypoint; Reform / Travellers 1832 / Athenaeum. Needs Maps JavaScript API (D12 open). |
| 05 | 05-pall-mall-pass.scene.json | pall-mall-pass | video | 76 | 4 (linear replacement) | M-01 26:19–27:35 | **Linear cut only.** Westbound past the three clubs, 1,151-steps line; extended so the façade is in frame. |
| 06 | 06-the-reform-club.scene.json | the-reform-club | video | 70 | 5 | M-01 26:50–27:35, M-20 (+ M-22, M-23 as insets), M-43 | Arrive at the door; 1836 / Barry 1841 / Soyer; look-up cue; breakfast over the video's last 20 s with a menu caption; Reading sauce seeded; reads The Times (no paper-knife); photo trio as insets. |
| 07 | 07-quiz-verne-saloon.scene.json | quiz-verne-saloon | quiz | 80 | 5 (Quiz A) | M-23, M-20, M-43 | Which of Verne's club details is real? — pause until answered (30 s), reveal in `after_script`; Open House caption time-bound. |
| 08 | 08-the-wager.scene.json | the-wager | photo | 60 | 6 | M-35 (1873 plate), G-05 (requested memorandum card), M-41 | The fictional theft "in the novel", Stuart's £4,000, Fogg's £20,000 at Baring's, six names on the card ("Stuart first, Fogg last"), 21 December 8:45 pm; "the wager has outlived the bank". |
| 09 | 09-two-real-men.scene.json | two-real-men | card | 30 | 6 (optional card) | G-06 (requested), M-41 | **Interactive cut only.** Cook 222 days westward, Train home 21 Dec 1870 — "I'm Phileas Fogg." |
| 10 | 10-the-world-shrinks.scene.json | the-world-shrinks | map | 100 | 6 (map beat) | G-01 (enablers layer requested, full loop, Day-1 layer), M-41 | Enablers light up, the loop draws leg by leg, "three words: 'It was once.'", tap the longest leg (pause 20 s), reveal + turn line in `after_script`. |
| 11 | 11-pack-the-bag.scene.json | pack-the-bag | game | 90 | 7 | G-07 (requested game UI), M-42 | Drag game: six items in, three distractors; no weather in the mackintosh feedback; Bradshaw "hundreds of pages"; the gas stays. |
| 12 | 12-the-dash.scene.json | the-dash | map | 60 | 7 | M-30, M-29 (hansom, confirmed), M-46, M-47, M-42 | Route line over the 1872 plan; hansom "most likely", sixpence a mile, barely a mile and a half — call it a bob; Underground nine years old; no "wet" before Quiz B. |
| 13 | 13-charing-cross.scene.json | charing-cross | video | 60 | 8 | M-08 04:45–05:25, M-51 (held 40–60 s) | Strand into the forecourt; station 8, Underground 9, Big Ben — the clock tower 13; "you cannot see it from here — Hawkshaw's roof"; twenty guineas over Neuville's "A poor mendicant". |
| 14 | 14-then-and-now.scene.json | then-and-now | photo | 35 | 8 | G-02 (requested), M-24, M-26 | Drag-seam split frame, 1872 engraving vs today's cross; six platforms, a train an hour to Dover. |
| 15 | 15-look-up-the-cross.scene.json | look-up-the-cross | streetview | 25 | 8 | M-38 (fallback M-26) | **Interactive cut only.** Look up: replica of 1865; the 1291 original stood where Charles I rides (plain corner pin). |
| 16 | 16-quiz-the-weather.scene.json | quiz-the-weather | quiz | 45 | 9 (Quiz B — now BEFORE the dialogue, D4) | M-25, M-44, M-58 (rain bed, low) | "Twenty to nine, still under the roof. Look up — what is the weather doing tonight?" — pause 20 s; reveal (Verne's sentence) in `after_script`; rain, not fog. |
| 17 | 17-passepartout-on-the-platform.scene.json | passepartout-on-the-platform | dialogue | 90 (+ up to 180 s chat) | 9 | M-50 (plate 05; backup M-34), M-44, M-58 | Guide-in = persona §6 verbatim; chat with Passepartout (4 exchanges / 180 s; `on_llm_unavailable: choice` → §5 answers 1–5 as chips); guardrails + fog / politics / no-AI / injection; spoken hand-back. |
| 18 | 18-the-boat-train.scene.json | the-boat-train | video | 85 | 9 | M-27 (10 s), M-13 00:00–01:15 (left half), M-44, M-60, M-45, M-59 | 1905 postcard ("just — the old roof"), M-60 departure bed + whistle sting at "8:45 pm" (no speech 12–16 s), over Hungerford Bridge; "we travel in daylight; Fogg had rain and dark"; look right (window side unverified); Sydenham "probably"; the forgotten gas — to be continued. |
| 19 | 19-souvenir.scene.json | souvenir | card | 60 | 10 | G-08 (requested), M-23, M-41 (tail) | Recipe card (`interaction.kind: save`): Fogg's last breakfast; cook it on 21 December, be at table by 8:45 pm; "A well-used minimum suffices for everything." Next: Dover, Calais, Paris. |

**Chain (`next`):** 01 → 02 → 03 → 04 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 → 14 → 15 → **16 quiz-the-weather → 17 passepartout-on-the-platform** → 18 → 19 (end). 05 also points to 06 and is used only in the linear cut.

**Interactive length (D3, honest):** nominal 01–04, 06–19 = 75+100+60+150+70+80+60+30+100+90+60+60+35+25+45+90+85+60 = **1,275 s ≈ 21 min 15 s**; plus wait budgets (03 up to 6 × 12 s, 07 30 s, 10 20 s, 16 20 s, 17 up to 180 s) and the user-paced walk (04: 90–240 s) ⇒ **≈ 24 min typical, 27 min maximum**. The brief's 18–22 min holds only if the traveller skips the chat.
Rhythm check: no two video scenes adjacent (02 video → 03 card; 06 video → 07 quiz; 13 video → 14 photo; 18 video is preceded by the dialogue); no continuous video > 90 s.

## Linear cut (~11 min 50 s passive version)

| scene | use | s |
|-------|-----|---|
| 01 cold-open | title 8 s, narration from 10 s, drop the M-34 inset | 60 |
| 02 savile-row | M-05 21:35–22:50, pins (a)(b) only, drop M-32 tail and last four sentences | 75 |
| 03 fogg-by-the-clock | card only, no taps; script to "home at midnight" + one-breath CV | 40 |
| 05 pall-mall-pass | whole (replaces 04), 26:19–27:35 | 76 |
| 06 the-reform-club | from 45 s: M-20 + insets only (M-01 already used by 05) | 25 |
| 07 quiz-verne-saloon | guide asks and answers in one breath (script + correct option + feedback + after_script) + Open House tail | 65 |
| 08 the-wager | whole | 60 |
| 10 the-world-shrinks | enablers + loop reveal + turn line, no tap; skip 09 | 40 |
| 11 pack-the-bag | 20-s packing-list card, no drag | 20 |
| 12 the-dash | 40 s: trim the Underground line and the Offenbach aside | 40 |
| 13 charing-cross | whole (40 s video + 20 s M-51 still) | 60 |
| 14 then-and-now | 15 s, seam auto-wipes; skip 15 | 15 |
| 16 quiz-the-weather | guide asks and states the answer (script + after_script), no choice | 15 |
| 17 passepartout-on-the-platform | passepartout.md §6 scripted three-line exchange (guide → Passepartout → guide) | 30 |
| 18 the-boat-train | postcard 10 s + M-13 00:00–00:55; trim the Dover/Suez sentence | 65 |
| 19 souvenir | 40 s, ingredient list stays on the card | 40 |
| **total** | | **726 s ≈ 12 min 06 s** |

Linear-only: 05. Interactive-only: 09, 15 (and the interactions of 03, 04, 10, 11, 14, 16, 17). Narrator trims scripts to the marks in each scene's `production_notes`. Note for Engine/Tools: `studio/tools/render/cuts/day-01-london.json` addresses sentences by index — 03, 04, 06, 07, 10, 12, 13, 16, 17, 18 scripts changed in A1, so its `s:N` tokens need a re-check (16/17 swapped order; 07/10/16 now use `after_script`).

## Fix pass A1 (2026-08-18) — what changed per scene
Source lists: review/fix-brief.md §0–§1 (fact-check "wrong/should", continuity #11–#23, QA must-fix 1–6 + scene table). Every touched scene carries an "A1 scene-developer 2026-08-18" line in `review.notes`.

- **01** — 60 → 75 s (linear 60); title 8 s, `narration.starts_at_s` 10; 1,920-hours caption 36–46 s; pin `bl`; M-34 inset 50–62; G-01 Day-1 layer to carry a "Day 1" label. Script left for the Narrator (≤ 100 words).
- **02** — Poole: overlay "on the Row since 1846, here since 1982", script "front door on the Row in 1846… since 1982 at No. 15", dinner jacket as Poole's own story (F-45); "doors on the left" → side-neutral (M-05 frame unverified — A3).
- **03** — M-50 → plate 05; punchlines out of the script into the taps (`pause_narration`, `timeout_s` 12 per tap); tap feedback metric-first; caption attributed "— Passepartout"; ends on the noun.
- **04** — full seven-stop walk M-39 → M-53 → M-54 → M-55 → M-56 → M-57 → M-37 (D5): route with headings, per-stop `fallback` (M-33 / M-20), counter 0.97 m/step (67 · 208 · 405 · 629 · 789 · 1,151), no jump caption; Pall Mall leg starts on M-57's true corner, gas pin geo moved; overlays + `waypoint_script` triggered by waypoint with `at_s` fallback; sticker `tr`; Travellers 1832 (F-44), "106 Pall Mall" style; No. 7 caption softened (D7); production_notes: counter needs Maps JavaScript API (D12 open).
- **05** — M-01 26:19–27:35 (76 s); Reform pin 56–70 s; Travellers pin (1832) added.
- **06** — paper-knife out (F-06); breakfast over the video's last 20 s + menu caption; "look up" cue slot (windows only — coffee-room windows face the garden, F-15); M-22/M-23 insets over M-20; M-01 26:50–27:35 so the door is reached; "The Times"; overlay spacing ≥ 15 s.
- **07** — `pause_narration` + `timeout_s` 30; tail sentences → `after_script`; prompt persists; option-1 feedback "dark Siena marble" scagliola; "dining-room"; Open House caption marked time-bound (D9).
- **08** — 80 → 60 s; names cut to "Stuart first, Fogg last" (G-05 card carries them); caption "The wager at the Reform — de Neuville & Benett, 1873"; "The wager has outlived the bank" caption. Narrator: ≤ 170 words (validator warns 3.0 w/s until then).
- **09** — unchanged.
- **10** — "three words"; `pause_narration` + `timeout_s` 20; reveal + turn line → `after_script`; prompt 76 s, persistent; G-01 "Day 1" label note; feedback text-only.
- **11** — mackintosh feedback de-spoiled; Bradshaw "hundreds of pages"; Times feedback without paper-knife; "so we are too" dropped (stout shoes not on the sheet — add F-id then a seventh item); G-07 bag counter + close button.
- **12** — "barely a mile and a half — call it a bob" (F-28); "hooves on stone", no "wet"; M-29 (confirmed hansom) in for 30–45 s; slang caption 54 s; `accessibility.sound_captions` "[hooves]".
- **13** — "So much of what Fogg passes…"; "You cannot see it from here — Hawkshaw's roof…"; "Big Ben — the clock tower", caption "Clock tower: 13"; M-08 cut at 05:25, M-51 held 40–60 s under the twenty-guineas caption; beggar-woman sentence split.
- **14** — G-02 seam handle ≥ 44 px note only.
- **15** — Charles I pin plain (no geo); `fallback` M-26; `next` → quiz-the-weather.
- **16 quiz-the-weather** (was 17) — moved before the dialogue (D4); script names no weather; reveal in `after_script`; `pause_narration` + `timeout_s` 20; prompt persists; M-58 rain bed low; `next` → passepartout-on-the-platform.
- **17 passepartout-on-the-platform** (was 16) — guide-in persona §6 verbatim; spoken hand-back (`after_script`) + caption; chips = passepartout.md §5 answers 1–5 verbatim (no "won at cards", no "gold"); guardrails + fog / politics-of-any-year / no AI-persona-fiction / injection line / valet's-London limit; `timeout_s` 180, `max_exchanges` 4, `on_llm_unavailable` choice; M-50 plate 05; M-58 rain bed; lower-third "8:40 pm".
- **18** — honest daylight ("We travel in daylight; Fogg had rain and dark"), M-13 left half, no M-16 insert (my call); "just — the old roof, months before it fell"; Sydenham "probably" (script + caption); M-60 departure bed 10–24 s + M-45 sting, no speech 12–16 s; M-59 rain-on-window low under the "Fogg had rain" line; captions −8 s, postcard caption ends 8 s; "8:45 pm"; "Look right" kept, window side unverified (A3); sound caption "[whistle — 8:45 pm]".
- **19** — `interaction.kind: save`; "Be at table by 8:45 pm."; music M-41 tail (D10); G-08 note carries the ingredients.
- **tour.json** — regenerated from the scene files in file order (chapter header unchanged).

Not applied (and why): "Stout shoes" as a seventh in-item (11) — Towle has it but no F-id yet, and the fact sheet is the Fact-Checker's this run; the persona §6 hand-back's "look up at the roof" clause (17) — superseded by D4, Narrator owns the persona sheets; 08/13 pace (validator warnings) — Narrator's phase 2.

## Requests to Content Preparer / Engine
- **G-01** — Day-1 layer must carry a "Day 1" label and a lit/unlit legend (not opacity-only); enablers layer as before.
- **G-05** — the six names on the memorandum card (the guide no longer reads them); "Saturday 21 December 1872, 8:45 pm".
- **G-07** — nine items, bag counter, "Close the bag" button, wrong item snaps back. **G-08** — ingredients on the card, "be at table by 8:45 pm". **G-02** — seam handle ≥ 44 px.
- **A3 (frames)** — M-05 door numbers / walk direction (02); M-01 façade frame (05/06); M-08 forecourt (13); M-13 window side (18); No. 7 Savile Row today (04, D7); pano availability at M-53…M-57 and M-38.
- **Engine/Tools** — runtime must honour `pause_narration`/`timeout_s`, `at_waypoint` + `waypoint_script`, `fallback`, `save`, `on_llm_unavailable`, `max_exchanges`; the step counter needs the Maps JavaScript API (D12: key / billing owner).

## Decisions I need from the human
- D12 — Maps JavaScript API key / billing for the 04 step counter (the walk plays as seven fixed panos until then).
- 16 — the M-58 rain-on-roof bed starts low under the quiz (the traveller may *hear* the answer — a "look/listen" quiz); say if you want it recall-only (bed in at the reveal).
- 18 — I chose no M-16 night insert (continuous shot, honest line); say if you prefer the 10-s insert under "Fogg had rain and dark".

## Validator output (final)
```
$ python3 studio/tools/validate.py products/around-the-world-80-days/day-01-london/scenes/*.scene.json products/around-the-world-80-days/day-01-london/tour.json
OK   products/around-the-world-80-days/day-01-london/scenes/01-cold-open.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/02-savile-row.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/03-fogg-by-the-clock.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/04-count-the-steps.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/05-pall-mall-pass.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/06-the-reform-club.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/07-quiz-verne-saloon.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/08-the-wager.scene.json
     ! WARN the-wager: 180 words in 60s spoken = 3.00 w/s, over the 2.5 w/s (150 wpm) target
OK   products/around-the-world-80-days/day-01-london/scenes/09-two-real-men.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/10-the-world-shrinks.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/11-pack-the-bag.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/12-the-dash.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/13-charing-cross.scene.json
     ! WARN charing-cross: 156 words in 60s spoken = 2.60 w/s, over the 2.5 w/s (150 wpm) target
OK   products/around-the-world-80-days/day-01-london/scenes/14-then-and-now.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/15-look-up-the-cross.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/16-quiz-the-weather.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/17-passepartout-on-the-platform.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/18-the-boat-train.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/19-souvenir.scene.json
OK   products/around-the-world-80-days/day-01-london/tour.json
     ! WARN the-wager: 180 words in 60s spoken = 3.00 w/s, over the 2.5 w/s (150 wpm) target
     ! WARN charing-cross: 156 words in 60s spoken = 2.60 w/s, over the 2.5 w/s (150 wpm) target
```
(jsonschema present, so the full Draft 2020-12 check ran against the schema as extended in this run, plus the studio rules: one correct quiz option, feedback on every option, dialogue guardrails + on_llm_unavailable, pause_narration ⇒ timeout_s, at_waypoint range, overlay density (waypoint overlays exempt), sources, words per second over the spoken window. The two WARN lines are the Narrator's phase-2 trims.)

## Digest
- **Did:** applied the A1 fix lists to all 19 scenes — every fact-check "wrong/should" item, the six QA must-fixes (Quiz B before the dialogue with the 16/17 rename, honest daylight in 18, 01 timings, the full seven-stop walk with an honest counter, wait states with `pause_narration`/`timeout_s`/`after_script`, an honest dialogue budget with `on_llm_unavailable`), the QA scene-table cheap fixes and Continuity's non-script items; new manifest media wired (plate 05, M-51, M-53…M-57, M-58, M-59, M-60, M-29); tour.json regenerated; validator all OK.
- **Weak:** the walk's waypoint triggers use `waypoint_script`, a key the runtime does not yet know; five frames (M-05, M-01, M-08, M-13, No. 7) are still unverified; 08 and 13 still run hot until the Narrator trims; the render sidecar's sentence indices will have drifted.
- **With more time:** open the seven panos and the four videos and pin frames; write the linear-cut scripts as separate narration variants; run the dialogue guardrails through the engine with the 20 probes.
