# Scenes — Day 1: London — the departure

**Scene Developer:** scene-developer (Claude)   **Date:** 2026-08-18   **Status:** draft — all `review` fields "pending"
**Inputs:** ../rundown/rundown.md (approved plan; founder provisionally accepted: end ON the boat train, modern guide voice, both quizzes, Passepartout dialogue) · ../research/fact-sheet.md (F-01…F-40) · ../media/manifest.md (M-01…M-49, G-01…G-03) · studio/schema/scene.schema.json · studio/style/style-guide.md
**Conventions used in the JSON:** `media[].start_s/end_s` = source in/out for YouTube; on-screen window in scene seconds for images, audio, generated assets and Street View. Extra keys `production_notes` (per scene) and `note` (per media entry) carry cut instructions and backups; the schema allows them. Narration is first-person plural, guide persona, ≤ 2.5 words per second (checked), no exclamation marks, no "Did you know".

## Scenes in order

| # | file | id | type | dur (s) | rundown seg | media (manifest ids) | one line |
|---|------|----|------|--------:|-------------|----------------------|----------|
| 01 | 01-cold-open.scene.json | cold-open | interstitial | 60 | 1 | M-40, G-01 (Day-1 layer), M-34, M-41 | Title card, Big Ben 1890 under the title only, then the hook over the map — date, deadline, stake; only London lit. |
| 02 | 02-savile-row.scene.json | savile-row | video | 100 | 2 | M-05 21:35–23:05, M-32 | Burlington Gardens corner into the Row; Verne's No. 7 / 1814 vs Sheridan's No. 14 / 1816; four pins; c. 1890 photo tail. |
| 03 | 03-fogg-by-the-clock.scene.json | fogg-by-the-clock | card | 60 | 3 | G-04 (requested), M-50 (requested Neuville plate 02; backup M-34) | Tap-to-find timetable: 8:00, 8:23, 9:37 (86 °F ≈ 30 °C), 11:29, 11:30, midnight; Passepartout's CV in one breath. |
| 04 | 04-count-the-steps.scene.json | count-the-steps | streetview | 150 | 4 | M-39, M-37 | Walk with the step counter 0 → 1,151: 7–8 Savile Row (modern block caption), jump caption, Pall Mall gas-lit 1807, Reform / Travellers / Athenaeum. |
| 05 | 05-pall-mall-pass.scene.json | pall-mall-pass | video | 45 | 4 (linear replacement) | M-01 26:19–27:04 | **Linear cut only.** Westbound past the three clubs, 1,151-steps line. |
| 06 | 06-the-reform-club.scene.json | the-reform-club | video | 70 | 5 | M-01 26:19–27:04, M-20, M-22, M-23, M-43 | Arrive at the door; 1836 / Barry 1841 / Soyer; photo trio; Fogg's breakfast; Reading sauce seeded. |
| 07 | 07-quiz-verne-saloon.scene.json | quiz-verne-saloon | quiz | 80 | 5 (Quiz A) | M-23, M-20, M-43 | Which of Verne's club details is real? (nine garden windows) — feedback for all three; Open House tail, date on caption only. |
| 08 | 08-the-wager.scene.json | the-wager | photo | 80 | 6 | M-35, G-05 (requested memorandum card), M-41 | The fictional theft "in the novel", Stuart's £4,000, Fogg's £20,000 at Baring's, six names, 21 December 8:45 pm, motto; Baring's 1995. |
| 09 | 09-two-real-men.scene.json | two-real-men | card | 30 | 6 (optional card) | G-06 (requested), M-41 | **Interactive cut only.** Cook 222 days westward, Train home 21 Dec 1870 — "I'm Phileas Fogg." |
| 10 | 10-the-world-shrinks.scene.json | the-world-shrinks | map | 100 | 6 (map beat) | G-01 (enablers layer requested, full loop, Day-1 layer), M-41 | Suez / Promontory / Jabalpur light up, the loop draws leg by leg (7-13-3-13-6-22-7-9), tap the longest leg, fade to Day-1, the turn line. |
| 11 | 11-pack-the-bag.scene.json | pack-the-bag | game | 90 | 7 | G-07 (requested game UI), M-42 | Drag game: six items in, three distractors with teaching feedback; completion line "two shirts, three pairs of stockings, and half a fortune". |
| 12 | 12-the-dash.scene.json | the-dash | map | 60 | 7 | M-30, M-28, M-46, M-47, M-42 | Route line over the 1872 plan; hansom "most likely", sixpence a mile ≈ a bob, Underground nine years old, three slang captions; 7:25 → 8:20. |
| 13 | 13-charing-cross.scene.json | charing-cross | video | 60 | 8 | M-08 04:45–05:45 | Strand into the forecourt; station 8, Underground 9, Big Ben 13; Hawkshaw roof one line; twenty guineas to the beggar-woman. |
| 14 | 14-then-and-now.scene.json | then-and-now | photo | 35 | 8 | G-02 (requested), M-24, M-26 | Drag-seam split frame, 1872 engraving vs today's cross; six platforms, a train an hour to Dover. |
| 15 | 15-look-up-the-cross.scene.json | look-up-the-cross | streetview | 25 | 8 | M-38 | **Interactive cut only.** Look up: replica of 1865; the 1291 original stood where Charles I rides; distances measured from him. |
| 16 | 16-passepartout-on-the-platform.scene.json | passepartout-on-the-platform | dialogue | 90 | 9 | M-50 (requested; backup M-34), M-44 (+ rain bed to source) | Chat with Passepartout (persona `passepartout`, whitelist + must-nots as guardrails); five chips with pre-written whitelist answers as fallback / linear script. |
| 17 | 17-quiz-the-weather.scene.json | quiz-the-weather | quiz | 45 | 9 (Quiz B) | M-25, M-44 | 8:40 on the platform — what is the weather? Rain, not fog; December 1873 in the feedback. |
| 18 | 18-the-boat-train.scene.json | the-boat-train | video | 85 | 9 | M-27 (10 s), M-13 00:00–01:15, M-44, M-45 | 1905 postcard, whistle at "8:45 p.m.", over Hungerford Bridge, look right (Embankment 1870, clock tower 1859), about two hours to Dover today, Sydenham caption, the forgotten gas — to be continued. |
| 19 | 19-souvenir.scene.json | souvenir | card | 60 | 10 | G-08 (requested), M-23, M-42 | Recipe card: Fogg's last breakfast with a Reading-sauce-style ketchup; cook it on 21 December, be at table by 8:45; "A well-used minimum suffices for everything." Next: Dover, Calais, Paris. |

**Chain (`next`):** 01 → 02 → 03 → 04 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 → 14 → 15 → 16 → 17 → 18 → 19 (end). 05 also points to 06 and is used only in the linear cut.

**Total interactive length:** 01–04, 06–19 = 60+100+60+150+70+80+80+30+100+90+60+60+35+25+90+45+85+60 = **1,280 s ≈ 21 min 20 s** (brief: ~18–22 min).
Rhythm check: no two video scenes adjacent (02 video → 03 card; 06 video → 07 quiz; 13 video → 14 photo; 18 video is preceded by a quiz); no continuous video > 90 s.

## Linear cut (~11 min 40 s passive version)

| scene | use | s |
|-------|-----|---|
| 01 cold-open | whole, drop the M-34 inset, trim the map pause | 45 |
| 02 savile-row | M-05 21:35–22:50, pins (a)(b) only, drop M-32 tail and last four sentences | 75 |
| 03 fogg-by-the-clock | card only, no taps; script to "home at midnight" + one-breath CV | 40 |
| 05 pall-mall-pass | whole (replaces 04) | 45 |
| 06 the-reform-club | from 45 s: photo trio only (M-01 already used by 05) | 25 |
| 07 quiz-verne-saloon | guide asks and answers in one breath (correct option + feedback) + Open House tail | 65 |
| 08 the-wager | whole | 80 |
| 10 the-world-shrinks | enablers + loop reveal + turn line, no tap; skip 09 | 40 |
| 11 pack-the-bag | 20-s packing-list card, no drag | 20 |
| 12 the-dash | 40 s: trim the Underground line and the Offenbach aside | 40 |
| 13 charing-cross | whole | 60 |
| 14 then-and-now | 15 s, seam auto-wipes; skip 15 | 15 |
| 16 passepartout-on-the-platform | scripted three-line exchange (guide → chip 1 or 4 answer → guide) | 30 |
| 17 quiz-the-weather | guide states the answer, no choice | 15 |
| 18 the-boat-train | postcard 10 s + M-13 00:00–00:55; trim the Dover/Suez sentence | 65 |
| 19 souvenir | 40 s, ingredient list stays on the card | 40 |
| **total** | | **700 s ≈ 11 min 40 s** |

Linear-only: 05. Interactive-only: 09, 15 (and the interactions of 03, 04, 10, 11, 14, 16, 17). Narrator trims scripts to the marks in each scene's `production_notes`.

## Requests to Content Preparer (new manifest ids referenced)
- **M-50** — Neuville/Benett plate 02 (Passepartout) from the Commons set named in M-35's note: `File:'Around_the_World_in_Eighty_Days'_by_Neuville_and_Benett_02.jpg` (PD) — used in 03 and 16; backup M-34.
- **G-01** — as specced, plus the "enablers" layer (Suez 17 Nov 1869 · Promontory 10 May 1869 · Jabalpur 7 Mar 1870) and both the full-loop (9-layer) and Day-1 exports (01, 10).
- **G-02** — then/now template filled with M-24 vs M-26 (14).
- **G-04…G-08** — typeset UI cards, no illustration budget: G-04 Fogg timetable card (03), G-05 memorandum card (08), G-06 Cook/Train card (09), G-07 carpet-bag game UI (11), G-08 souvenir recipe card, exportable as image (19). G-03 is not needed.
- A CC0 rain-on-a-station-roof bed for 16–18 (none in the manifest); confirm the time of day of M-13; pin M-05 frames for Nos. 14/15/3, M-08 forecourt frames, and the M-37/M-39 panos for the step-counter (calibration in 04 `production_notes`).

## Decisions I need from the human
- None new. Built on the provisional decisions (Ending B, modern guide, both quizzes, free-chat Passepartout with guardrails). If Decision 3 flips to "scripted only", switch 16's `interaction.kind` to `choice` — the chip answers are already written. If Ending A is chosen after all, cut M-13 at 20 s in 18 and drop the gas clause in 11 (feedback + script) and 18.

## Validator output (final)
```
$ python3 /home/supper-user/yunyou/studio/tools/validate.py /home/supper-user/yunyou/products/around-the-world-80-days/day-01-london/scenes/*.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/01-cold-open.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/02-savile-row.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/03-fogg-by-the-clock.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/04-count-the-steps.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/05-pall-mall-pass.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/06-the-reform-club.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/07-quiz-verne-saloon.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/08-the-wager.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/09-two-real-men.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/10-the-world-shrinks.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/11-pack-the-bag.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/12-the-dash.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/13-charing-cross.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/14-then-and-now.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/15-look-up-the-cross.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/16-passepartout-on-the-platform.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/17-quiz-the-weather.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/18-the-boat-train.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/19-souvenir.scene.json
```
(jsonschema 4.10 was present, so the full Draft 2020-12 check ran, plus the studio rules: one correct quiz option, feedback on every option, dialogue guardrails, overlay density, sources, script length.)

## Digest
- **Did:** turned the 10 approved segments into 19 scene JSONs (interactive 21 min 20 s, linear 11 min 40 s) with full guide scripts, timed overlays, real media refs (YouTube ids with in/out, Commons URLs, Street View lat,lng,heading,pitch,fov), fully specified interactions (2 quizzes, tap-to-find timetable and map, drag game, drag seam, Street View walk with a calibrated 1,151-step counter, Passepartout chat with whitelist/must-not guardrails and five pre-written fallback answers), transitions, `next`, F-id sources, and all reviews pending; validator passes on all 19.
- **Weak:** five video segments are still chapter-derived, not frame-pinned (M-05 door numbers, M-08 forecourt, M-13 daylight); the step-counter jump hides a real ~900 m stretch behind "about 700 steps"; five typeset cards and one Commons plate are referenced by requested ids (G-04…G-08, M-50) that the Content Preparer must add; the linear cut is described by trim marks, not separate scripts.
- **With more time:** watch M-05/M-08/M-13 and pin frames to the second; write the linear-cut scripts as separate `narration` variants; add 3–4 intermediate panos and re-calibrate the counter for a full walk; draft the Passepartout system prompt and 20 red-team questions for the Fact-Checker; test all overlays on a fold-phone at 9:16.
