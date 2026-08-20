# Scenes — Day 1: London — the departure

**Scene Developer:** scene-developer (Claude)   **Date:** 2026-08-18 (draft a.m.; fix pass A1 p.m.) · **2026-08-19 D6 restructure** (scene 04 and 15)   **Status:** A1 → A3n → A5 → **D6** applied — all `review` fields still "pending" (fact-check / rights / QA re-run after the Narrator's phase 2)
**Inputs:** ../rundown/rundown.md · ../review/fix-brief.md (§0 provisional decisions D3–D11, §1 my list) · ../review/fact-check.md · ../review/continuity.md · ../review/qa.md · ../research/fact-sheet.md (F-01…F-45) · ../media/manifest.md (M-01…M-61, G-01…G-08) · ../../shared/personas/passepartout.md §5–6 · ../../shared/personas/guide.md §8 · studio/schema/scene.schema.json (extended this run) · ../../shared/style-guide.md
**Conventions used in the JSON:** `media[].start_s/end_s` = source in/out for YouTube; on-screen window in scene seconds for images, audio, generated assets and Street View. `media[].fallback` = manifest id shown if the primary cannot load. `overlays[].at_waypoint` = index into `interaction.route` (interactive trigger); `at_s` stays as the linear / no-JS fallback. `narration.after_script` = spoken after the interaction resolves; `narration.starts_at_s` = when speech begins; `interaction.pause_narration` + `timeout_s` = the honest wait state. Extra keys `production_notes` (per scene), `note` (per media entry / overlay), `narration.waypoint_script` (no scene uses it since D6 — 04 was its only owner) and `accessibility.sound_captions` (12, 18: caption-track entries for sound-only cues) are allowed by the schema. `narration.variants.<id>` = a full parallel track for `script` (`clear` = plain English, the player's default); its twins `narration.after_script_variants.<id>` (string) and `narration.waypoint_script_variants.<id>` (array, one block per route index, joined = `variants.<id>` — unused since D6) carry the same track through the post-interaction and walk lines, so a chosen track never changes register mid-scene (added A5; schema + `studio/templates/scene-spec.md`). Narration is first-person plural, guide persona; on-screen time style "8:45 pm" (D10).

## Scenes in order

| # | file | id | type | dur (s) | rundown seg | media (manifest ids) | one line |
|---|------|----|------|--------:|-------------|----------------------|----------|
| 01 | 01-cold-open.scene.json | cold-open | interstitial | 75 | 1 | M-40 (title only, 8 s), G-01 (Day-1 layer, labelled), M-34, M-41 | Title 8 s, narration from 10 s; date, deadline, stake; 1,920-hours caption at 36–46 s; only London lit. |
| 02 | 02-savile-row.scene.json | savile-row | video | 100 | 2 | M-05 21:35–23:05 (`use: player`), M-32; linear: **M-66** + M-77a / M-77c / M-77b | Burlington Gardens corner into the Row; Verne's No. 7 / 1814 vs Sheridan's No. 14 / 1816; Poole on the Row 1846, at No. 15 since 1982; side-neutral until A3 pins frames. |
| 03 | 03-fogg-by-the-clock.scene.json | fogg-by-the-clock | card | 60 | 3 | G-04 (requested), M-50 (plate 05; backup M-34) | Tap-to-find timetable; guide reads only the times and the CV, the taps hold the punchlines (pause per tap, 12 s). |
| 04 | 04-count-the-steps.scene.json | count-the-steps | **video** | **94** | 4 | M-30 (1872 plan) · geometry stops M-39, M-53, M-54, M-55, M-56, M-57, M-37 · M-01 `use: player` · linear: **panowalk stops 5–6** + M-69b / M-69a (fallbacks M-67, M-20) | **D6 restructure: transport, not Street View.** The counting plays over the 1872 plan — 1,151 steps, 1,120 m, 0.97 m a step, 'he never hurries' — then the street plays plainly while the guide names clubland and the three clubs. No walk, no route, no tap. |
| ~~05~~ | *(retired 2026-08-19, D6)* | pall-mall-pass | — | — | — | — | **Cut.** It existed only as the linear stand-in for 04's Street View walk; with 04 restructured it said the same words over the same pictures. Its media (M-01, M-67, M-20, M-69a, M-69b) moved into 04. The 05 file slot stays empty — later files keep their numbers. |
| 06 | 06-the-reform-club.scene.json | the-reform-club | video | 70 | 5 | M-01 26:50–27:35 (`use: player`), M-20 (+ **M-69c**, M-22, M-23 as insets), M-43 | Arrive at the door; 1836 / Barry 1841 / Soyer; look-up cue; breakfast over the video's last 20 s with a menu caption; Reading sauce seeded; reads The Times (no paper-knife); photo trio as insets. |
| 07 | 07-quiz-verne-saloon.scene.json | quiz-verne-saloon | quiz | 80 | 5 (Quiz A) | M-23, M-20, M-43 | Which of Verne's club details is real? — pause until answered (30 s), reveal in `after_script`; Open House caption time-bound. |
| 08 | 08-the-wager.scene.json | the-wager | photo | 70 | 6 | M-35 (1873 plate), G-05 (requested memorandum card), M-41 | The fictional theft "in the novel", Stuart's £4,000, Fogg's £20,000 at Baring's, six names on the card ("Stuart first, Fogg last"), 21 December 8:45 pm; "the wager has outlived the bank". |
| 09 | 09-two-real-men.scene.json | two-real-men | card | 30 | 6 (optional card) | G-06 (requested), M-41 | **Interactive cut only.** Cook 222 days westward, Train home 21 Dec 1870 — "I'm Phileas Fogg." |
| 10 | 10-the-world-shrinks.scene.json | the-world-shrinks | map | 100 | 6 (map beat) | G-01 (enablers layer requested, full loop, Day-1 layer), M-41 | Enablers light up, the loop draws leg by leg, "three words: 'It was once.'", tap the longest leg (pause 20 s), reveal + turn line in `after_script`. |
| 11 | 11-pack-the-bag.scene.json | pack-the-bag | game | 90 | 7 | G-07 (requested game UI), M-42 | Drag game: six items in, three distractors; no weather in the mackintosh feedback; Bradshaw "hundreds of pages"; the gas stays. |
| 12 | 12-the-dash.scene.json | the-dash | map | 60 | 7 | M-30, M-29 (hansom, confirmed), M-46, M-47, M-42 | Route line over the 1872 plan; hansom "most likely", sixpence a mile, barely a mile and a half — call it a bob; Underground nine years old; no "wet" before Quiz B. |
| 13 | 13-charing-cross.scene.json | charing-cross | video | 60 | 8 | M-08 04:45–05:25 (`use: player`), M-51 (held 40–60 s); linear: **M-84 → M-81 → M-78 → M-74** | Strand into the forecourt; station 8, Underground 9, Big Ben — the clock tower 13; "you cannot see it from here — Hawkshaw's roof"; twenty guineas over Neuville's "A poor mendicant". |
| 14 | 14-then-and-now.scene.json | then-and-now | photo | 35 | 8 | G-02 (requested), M-24, M-26 | Drag-seam split frame, 1872 engraving vs today's cross; six platforms, a train an hour to Dover. |
| 15 | 15-look-up-the-cross.scene.json | look-up-the-cross | streetview | **47** | 8 | M-38, M-26; linear: **panowalk stop 0** | **The chapter's one Street View stop (D6), now a real stop-and-look:** two things to FIND, both said out loud — the top of the 1865 replica cross overhead, then the direction of Charles I, 200 m off, from whom London's distances are measured. `interaction.kind: look`. In the film: a slow pan over the same imagery. |
| 16 | 16-quiz-the-weather.scene.json | quiz-the-weather | quiz | 45 | 9 (Quiz B — now BEFORE the dialogue, D4) | M-25, M-44, M-58 (rain bed, low) | "Twenty to nine, still under the roof. Look up — what is the weather doing tonight?" — pause 20 s; reveal (Verne's sentence) in `after_script`; rain, not fog. |
| 17 | 17-passepartout-on-the-platform.scene.json | passepartout-on-the-platform | dialogue | 90 (+ up to 180 s chat) | 9 | M-50 (plate 05; backup M-34), M-44, M-58 | Guide-in = persona §6 verbatim; chat with Passepartout (4 exchanges / 180 s; `on_llm_unavailable: choice` → §5 answers 1–5 as chips); guardrails + fog / politics / no-AI / injection; spoken hand-back. |
| 18 | 18-the-boat-train.scene.json | the-boat-train | video | 85 | 9 | M-27 (10 s), M-13 00:00–01:15 left half (`use: player` — CC BY, but no lawful copy of the file yet), M-44, M-60, M-45, M-59; linear: **M-88 + M-76** | 1905 postcard ("just — the old roof"), M-60 departure bed + whistle sting at "8:45 pm" (no speech 12–16 s), over Hungerford Bridge; "we travel in daylight; Fogg had rain and dark"; look right (window side unverified); Sydenham "probably"; the forgotten gas — to be continued. |
| 19 | 19-souvenir.scene.json | souvenir | card | 60 | 10 | G-08 (requested), M-23, M-41 (tail) | Recipe card (`interaction.kind: save`): Fogg's last breakfast; cook it on 21 December, be at table by 8:45 pm; "A well-used minimum suffices for everything." Next: Dover, Calais, Paris. |

**Chain (`next`):** 01 → 02 → 03 → 04 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 → 14 → 15 → **16 quiz-the-weather → 17 passepartout-on-the-platform** → 18 → 19 (end). Unchanged by D6: 04 still hands to 06, and 05 no longer exists. **File numbers now skip 05**, so from 06 on, a scene's file number is one higher than its index in `tour.json` (18 scenes) — the render log counts tour indices.

**Interactive length (D3, honest):** nominal 01–04, 06–19 = 75+100+60+**94**+70+80+70+30+100+90+60+60+35+**47**+45+90+85+60 = **1,251 s ≈ 20 min 51 s** (D6: 04 150 → 94 and fixed rather than user-paced, 15 25 → 47); plus wait budgets (03 up to 6 × 12 s, 07 30 s, 10 20 s, 15 up to 30 s of free looking, 16 20 s, 17 up to 180 s) ⇒ **≈ 22 min typical, 26 min maximum**. D6 also removed the 90–240 s of user-paced walking, which is where most of the old variance lived.
Rhythm check: no two video scenes adjacent (02 video → 03 card; **04 video → 06 video is now the one exception, and it is deliberate: 04 arrives at the club door and 06 opens on it** — 04's own first 40 s are a map beat, so the traveller does not see 90 s of unbroken street; 06 video → 07 quiz; 13 video → 14 photo; 18 video is preceded by the dialogue); no continuous video > 90 s (04's street half is ≈ 50 s).

## Linear cut (~16 min passive version — D6: the transport is now in the film)

**A5 2026-08-19 (Narrator):** the `use` column is now current again, but `studio/tools/render/cuts/day-01-london.json` remains the
authority. Its `s:N` tokens are indexed against the **clear** track only (the rendered default, `--track clear`); the standard
track splits into different sentences (181 vs 192) and the same tokens are approximate there — a per-track cut sheet stays an
Engine backlog item. Re-derive with `cd studio/tools/render && node render_linear.mjs <tour.json> --plan --track clear` after ANY
script edit. The cut keeps the narrative spine whole (Poole named before 'The firm says…', the club named before 'It is real…',
Passepartout's CV, the carpet-bag, the shilling, the recipe card, the Sheridan reveal) and drops only interactive-only
instructions — coherence over the original 11:42 target.

**A8 2026-08-19 (Content Preparer, queue item A6w) — the cut has no clip cards left.** Every shot that used to be a
YouTube clip card now plays a real file from `<chapter>/media/files/` (not committed; `.gitignore`d and regenerable from
`media/manifest.md`). Two sources are recorded per shot: the YouTube id keeps `use: "player"` — legal to embed, not to
copy (`review/rights-a6.md` §1.2) — and the local file carries `use: "linear"`. Scene **05 was re-cut 76 → 42 s** because
no freely-licensed source carries 76 s of continuous Pall Mall façade; the words are unchanged, only the seconds moved.

| scene | use | s |
|-------|-----|---|
| 01 cold-open | title 8 s, narration from 10 s, drop the M-34 inset | 60 |
| 02 savile-row | **M-66 hyperlapse 8 s + M-77a 32 s + M-77c 16 s + M-77b (1955) 28 s** (M-05 is player-only), pins Savile Row / No. 15 / No. 14, drop the M-32 tail and its three sentences | 84 |
| 03 fogg-by-the-clock | card only, no taps; whole script minus the tap prompt and "Look at his face" | 50 |
| 04 count-the-steps | **D6 transport scene**: the counting over the 1872 plan (M-30, 46 s) → **open-imagery walk, stop 5 (14 s) then stop 6 (37 s)**, the camera turning onto each club as it is named; whole script | 97 |
| 06 the-reform-club | from the door: M-20 + **M-69c** + M-22/M-23 insets (M-01 is player-only); drops the Soyer and Times asides | 62 |
| 07 quiz-verne-saloon | guide asks and answers in one breath (script + correct option + feedback + after_script) + Open House tail | 50 |
| 08 the-wager | whole | 75 |
| 10 the-world-shrinks | enablers + loop reveal + turn line, no tap; skip 09 | 92 |
| 11 pack-the-bag | 20-s packing-list card, no drag; whole script minus the drag instruction | 88 |
| 12 the-dash | whole (the shilling sentence makes 'sixpence a mile' add up) | 58 |
| 13 charing-cross | whole: **M-84 Trafalgar today 16 s → M-81 Donisthorpe 1890 disc 8 s → M-78 the 1903 Strand 18 s → M-74 14 s → M-51** | 70 |
| 14 then-and-now | 15 s, seam auto-wipes | 26 |
| 15 look-up-the-cross | **D6 stop-and-look, adapted**: a slow pan over the same open imagery (stop 0, 44 m at walking pace); whole script — the guide names both finds | 50 |
| 16 quiz-the-weather | guide asks and states the answer (script + after_script), no choice | 28 |
| 17 passepartout-on-the-platform | passepartout.md §6 scripted three-line exchange (guide names him → Passepartout → guide) | 46 |
| 18 the-boat-train | postcard 10 s + **M-88 lit bridge at night 12 s + M-76 the view from Hungerford Bridge 36 s** + postcard tail; trim the Dover/Suez sentence | 82 |
| 19 souvenir | ingredient list stays on the card; "Save the card." dropped, the recipe-card sentence kept | 54 |
| **total** | | **1,072 s ≈ 17 min 52 s** of caps (D6: −42 for the retired 05, +97 for the restructured 04, +50 for 15 in the film; 967 → 1,072). `--plan --track clear` renders **≈ 962 s ≈ 16 min 2 s** — what the caps actually produce once every scene is trimmed to `narration + pad`. Re-derive with `cd studio/tools/render && node render_linear.mjs <tour.json> --plan --track clear` after ANY script edit |

Linear-only: none (05 pall-mall-pass is retired — see the D6 pass). Interactive-only: 09 (and the interactions of 03, 10, 11, 14, 16, 17, and the free look in 15). **Both cuts now carry the transport (04) and the Street View stop (15).** Narrator trims scripts to the marks in each scene's `production_notes`. Note for Engine/Tools: the renderer speaks `script` (or `variants.clear`) only — it has no token for `after_script`, so 07's "Half invented, half exact…", 10's "The train leaves for Dover at a quarter before nine." and 16's Verne rain quote are missing from the film; `after:N` is the missing token.

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

## A3n pass (2026-08-19) — newcomer rewrite (Narrator + Scene Developer)

Per Audience Report #1 and the style guide's "Assume no prior reading" rule. Every scene now carries a
`narration.variants.clear` track (full simplified parallel script, same facts, same w/s budget) and gloss chips
(`overlays[].kind: "gloss"`) on first use of period terms: valet (01), clubland (04 and its linear stand-in 05), whist +
wager (08), Bradshaw (11), hansom / swell / bob (12), guinea (13), pea-souper (16), boat train (18). (A5: the 12 "Hook it!" chip was removed as an orphan and the 13 "guinea" chip corrected per F-46.)

- **Heavy:** 01 cold-open (spine retold: 1872 novel by Jules Verne → Fogg bets half his fortune he can circle the world
  in eighty days → tonight at a quarter to nine he leaves → we travel his route today); 02 savile-row (plain telling
  first — Fogg's street, his door, why we start here — the Verne-got-the-address-wrong beat moved AFTER it; two-Ls
  spelling aside → "go deeper" caption; title → "Savile Row — Fogg's front door"); 08 the-wager (whist and wager
  introduced before use; Paris-serialisation aside → "go deeper" caption).
- **Light:** 03, 04 ("leaves for his club"), 05, 06 (opener says whose club and what it is to Fogg), 07, 09,
  10 ("one of the card players"), 11 (Dover/Calais located), 12 (slang captions → gloss chips; Offenbach aside plain),
  13 (Hawkshaw's name out of the spine), 14, 15, 16, 17 (clear = persona lines verbatim, R4), 18 (Sydenham mis-route
  aside out of the spine — the 64–76 s caption was its only carrier, and A5 deleted that too), 19.
- **tour.json** reassembled from the scene files in this order; chapter object gains `recap` (newcomer-safe cover text).
- **Stale for A4:** the linear cut-sheet's s:N sentence tokens for 01, 02, 08, 13, 18; 02's "last four sentences" trim
  now removes the Sheridan reveal — re-pick the marks in the Narrator cut-sheet.

## A5 fix pass (2026-08-19) — Narrator + Scene Developer, from review/fact-check-a5.md

Scope: the clear track's dropped qualifiers, two spine defects in 08, three gloss problems, one orphan caption, the
`after_script`/`waypoint_script` register break, and the cut sheet that caused the dangling references in the rendered film.
**No render** — the founder's hold stands until A6 lands (review/STATUS.md).

- **02** — clear track: "His shop is still here, at No. 15" → "The shop is still here — at No. 15 since 1982" (F-45; it had
  reinstated the exact A1 error and contradicted the pin on the same frame); "for a prince — the first dinner jacket" →
  "for the Prince of Wales — the grandfather, they say, of the dinner jacket" (F-19 is med and attributed to the firm).
- **06** — clear track: "Its founders wanted political reform" → "Its founders had backed the Reform Act of 1832 — that is
  where the name comes from" (F-14); "the architect's drawing" → "the architect's plan of the front" (M-22 is an engraving
  of Barry's elevation, not a drawing by his hand).
- **08** — **both tracks**, 60 → 70 s (media windows and overlay times re-spread; the two spine fixes do not fit 60 s at
  ≤ 2.5 w/s). (a) Whist: "Fogg and five friends sit down to whist" → "Fogg sits down to whist with five fellow members —
  four hands at the table, the same five every night", so the narration and the "whist — a quiet card game for four
  players" chip stop contradicting each other (F-08: five usual partners, four hands play). (b) The £55,000 robbery now
  has a reason to be in the scene: "The talk turns to where such a man could hide now. And the Daily Telegraph has done
  the sums…" (F-09 → F-10, ch. III) — a newcomer can no longer conclude the wager is about catching the thief. Clear
  track also: "Baring's closed" → "failed" (F-23: collapsed), and the word "wager" is spoken once so the wager chip is
  no longer an orphan.
- **09** — both tracks: "Two real men were doing it as Verne wrote" → "Two real men: one travelling as Verne wrote, the
  other already home" (only Cook was travelling, F-35; Train had finished in 1870, F-36). The Times-letters clause went
  to pay for the words.
- **10** — clear track: the months are back ("November 1869 … May 1869 … March 1870"), which is what makes "within ten
  months" true (F-33).
- **12** — clear track: "sixpence a mile" → "sixpence a mile — or part of a mile … so call it one shilling: a 'bob'"
  (F-28 — without it the arithmetic says ninepence); "a rich, well-dressed man" → "a gentleman in good clothes" (F-31,
  and it no longer contradicts its own "swell" chip). The orphan **"Hook it!" chip is removed** — the phrase is spoken
  nowhere in the chapter (founder's call still open: give the cabby the line, or move it to a slang souvenir card).
- **13** — clear track: the age list stops going elliptical ("The Embankment along the river: two years old. And the clock
  tower we call Big Ben: thirteen years old"). **Gloss corrected per F-46**: "guinea — twenty-one shillings: a price, not
  a coin, by 1872" (last struck 1813, demonetised 1816).
- **18** — clear track: "the old roof, months before it fell" → "the old roof, probably in its last months before it fell"
  (M-27's *publication* year is 1905; the photo's date is unknown). The orphan **"Verne says Sydenham" caption is deleted**
  — its spine sentence was removed in A3n, so a newcomer met the word once, on screen, with nothing to attach it to.
- **04, 07, 10, 16, 17** — the register break: `narration.after_script_variants.clear` (07, 10, 16, 17) and
  `narration.waypoint_script_variants.clear` (04, seven blocks whose join is `variants.clear`) added, so the default track
  no longer switches to the literary voice after the interaction. 17's hand-back is persona-owned (R4) and is copied
  verbatim; 16's reveal keeps "pea-souper" so its chip still glosses a word the traveller hears.
- **Schema / template** — `narration.after_script_variants` added to `studio/schema/scene.schema.json`;
  both twins and the new standing rule ("when a sentence is simplified, its qualifier travels with it — if the qualifier
  will not fit, cut the claim with it") documented in `studio/templates/scene-spec.md`.
- **Cut sheet** — `studio/tools/render/cuts/day-01-london.json` re-derived **against the clear track** (it had been indexed
  against the standard one), fixing all eight dangling references in fact-check-a5 §4: Poole is named before "The firm
  says…", 06 opens on "This is the door of Fogg's club" and explains the name, Passepartout's CV survives, the carpet-bag
  is introduced and the drag instruction dropped, the shilling sentence is back beside "sixpence a mile", "Save the card."
  is replaced by "The recipe is on the card.", 17 names Passepartout before the chips (spoken + lower-third), and the
  Sydenham caption is gone. Caps raised where the spine needed the seconds: 03 45 → 50, 08 70 → 75, 12 52 → 58,
  17 36 → 46. `--plan --track clear`: **no scene is end-cut**, total ≈ 854 s (14 min 14 s).

**Not fixed in A5, and why:** the missing `after:N` renderer token (07/10/16 lose their reveal in the film — Engine);
`studio/player/index.html` and `studio/tools/render/render_linear.mjs` still read only `after_script`/`waypoint_script`
(one line each — Engine backlog, deliberately not edited here); gloss chip *timings* against 0.9× TTS (QA on device);
the s13 "420 shillings" spoken line (caption [2] carries it; adding it would push the clear track over 2.5 w/s);
the s18 "boat train — … a ferry" chip (accurate enough as a plain-English aid; "Channel steamer" is the harder word);
and the report's proposed "the hotel, eight years old too" for s13 — the hotel opened in May 1865 and was **seven**, not
eight, years old that night (F-21), so the years stay as years.

## D6 pass (2026-08-19) — Street View is a stop-and-look device, never transport

Founder's instruction, from `products/around-the-world-80-days/DECISIONS.md` **D6**. Two scenes changed, one was retired,
and the transport finally went into the film. **No render in this pass** — the founder renders.

**04 count-the-steps — was the walk, is now transport.**
`streetview` → `video`; `interaction.kind: walk`, the seven route waypoints and the "Tap ahead to step" prompt are gone;
150 s (user-paced 90–240) → 94 s fixed. Two beats:
- **The counting, over the map (0–~43 s in the film).** M-30, the 1872 *Plan of London*. Everything the walk used to
  carry survives here — 575 / 576, the 1,151 steps, the turns (Savile Row · Burlington Gardens · Old Bond Street ·
  Piccadilly · St James's Street · Pall Mall), 1,120 m ≈ a kilometre, 0.97 m a step, "he never hurries".
- **The street, playing plainly (~43–90 s).** Film: the cached open imagery (`panowalk`) — stop 5 turns east into
  Pall Mall, stop 6 walks the last 158 m and **stops in front of 104**, held on the frame C1a verified as the "104"
  doorway, while the guide names the Reform; the Travellers and the Athenaeum then get their own façades (M-69b,
  M-69a). Player: the M-01 embed (`use: player`), which simply plays. Neither cut asks for a tap, a drag or a turn.
- **Scene 12 also uses M-30 — what makes them different beats.** *Extent:* 04 asks for the West End quarter only
  (Regent Street → Green Park, Oxford Street → Pall Mall) so the street names read; 12 keeps the whole plate.
  *Line:* 04 draws in five short strokes that stop at each turn with the running step number stamped beside it
  (67 · 208 · 405 · 629 · 789 · 1,151); 12 draws one continuous line at cab speed. *Furniture:* 04 carries the step
  sticker and the two route captions, 12 carries none over the map and cuts to a hansom photograph instead.
  *Share of scene:* 04 leaves the map after 43 s for the street; in 12 the map is the scene. The crop is a request to
  the Content Preparer (**M-30a**, a free PD derivative); until it exists both scenes show the same plate under a Ken
  Burns move and the difference is carried by the furniture, the words and the fact that 04 leaves the map.
- Kept for the film only: the seven `streetview` refs, as **geometry** (the survey points the pano cache is indexed
  against and the anchors of the drawn route). They must stay seven and in order or `panomove.planScene` re-indexes.
- Dropped with the walk: the "Today No. 7 is not the house Verne imagined" beat (D7's softened caption). It only
  worked if the traveller aimed at 7–8 Savile Row, which is also the one stop the fetcher could not serve
  (verdict `off-cue`). The Sheridan / No. 14 reveal already lives in scene 02, so nothing factual is lost.

**05 pall-mall-pass — CUT.** It was created as the linear stand-in for 04's walk, so with 04 restructured the two
scenes said the same sentences over the same pictures, ninety seconds apart. Merging beat 04's words and 05's media
into one scene is what the founder's instruction describes, so 05 is deleted rather than shortened: a 20-second
"clubland" remnant would have been the same redundancy, smaller. Its media went with it — M-01, M-67, M-20, M-69b,
M-69a are all wired in 04 now. The file slot 05 stays empty (renumbering 06–19 would break every review document).

**15 look-up-the-cross — stays Street View, and earns it.** D6 keeps it because there is something to *find*, so the
finds are now stated: (1) follow the cross straight above you to its top — 21 m / 70 ft, a replica of 1865; (2) turn
right and look 200 m towards Trafalgar Square, where Charles I rides and from whom London's distances are measured.
`interaction.kind` walk (one waypoint — transport grammar) → **look**, with a 30-second budget; 25 → 47 s, because
25 s had no room for a task. The `camera` cues are kept and re-timed, and the holds now butt against each other so
nothing drifts between finds. Honest limit kept in the words: the statue is 205 m away and behind buildings, so the
script says "you cannot quite see him from here" — the find is the direction and the fact, not a promise of bronze.
**In the film it is a slow pan over the same open imagery** (stop 0: 14 Mapillary 360° frames over 44 m, the only
stop in the chapter whose pace reads as a walk), and the guide names what the player-traveller would have found.
Per D6 that is an adaptation, not a downgrade.

**The film now contains the transport.** `studio/tools/render/cuts/day-01-london.json`: the `pall-mall-pass` entry is
deleted, `count-the-steps` and `look-up-the-cross` are added, every `s:N` re-derived against the clear track.
`--plan --track clear`: **no dangling reference, no end-cut, no mid-thought drop** — the only sentences the sidecar
drops anywhere are the interactive-only instructions it always dropped. Total **≈ 940.6 s of scenes ≈ 15 min 41 s**,
so the finished MP4 should land at **≈ 16 min 10 s** with the title card and credits (was 14:42).

| what | before | after |
|------|-------:|------:|
| 04 count-the-steps | not in the film | 90.2 s |
| 05 pall-mall-pass | 45.5 s | — |
| 15 look-up-the-cross | not in the film | 44.4 s |
| whole cut (scenes only) | 854.0 s | **940.6 s** |
| finished MP4 | 14:42 | **≈ 16:10** |

**Left alone on purpose:** `studio/player/index.html` (out of scope this pass), `validate.py`, `linear/watch.json`
(the render regenerates it — its chapter markers still name `pall-mall-pass` until then), and the render itself.

## Requests to Content Preparer / Engine
- **G-01** — Day-1 layer must carry a "Day 1" label and a lit/unlit legend (not opacity-only); enablers layer as before.
- **G-05** — the six names on the memorandum card (the guide no longer reads them); "Saturday 21 December 1872, 8:45 pm".
- **G-07** — nine items, bag counter, "Close the bag" button, wrong item snaps back. **G-08** — ingredients on the card, "be at table by 8:45 pm". **G-02** — seam handle ≥ 44 px.
- **A3 (frames)** — M-05 door numbers / walk direction (02); M-01 façade frame (04 player / 06); M-08 forecourt (13); M-13 window side (18); pano availability at M-53…M-57 and M-38 (**confirmed** by the panowalk fetcher for w01–w06 and the Charing Cross stop; w00 Savile Row is off-cue). The No. 7 Savile Row frame is no longer needed — D6 dropped that beat with the walk.
- **Manifest rows still pointing at the retired scene 05 (D6)** — M-01, M-20, M-67, M-69a, M-69b name "scene 05" in their `use` / notes
  columns; they are all wired in **scene 04** now. M-22 keeps its scene-06 use. Nothing needs re-fetching, only re-labelling.
- **M-30a (new, D6)** — a cropped derivative of M-30 for scene 04: the West End quarter only (Regent Street → Green Park, Oxford Street →
  Pall Mall), so the plan reads at phone size and does not look like scene 12's beat. Free: M-30 is public domain, it is a crop of a file we
  already fetch. Ideally with the route drawn in five strokes and the step numbers stamped at the turns (67 · 208 · 405 · 629 · 789 · 1,151).
- **Engine/Tools** — runtime must honour `pause_narration`/`timeout_s`, `fallback`, `save`, `on_llm_unavailable`, `max_exchanges`
  (`at_waypoint` + `waypoint_script` are dead keys since D6 — no scene uses them). Three one-liners opened by the D6 pass:
  (a) the player should honour media windows in a `video` scene, so scene 04's map beat plays before the embed instead of the embed only;
  (b) `tick()`'s `needsInput` test exempts only `walk` on a streetview scene, so scene 15's `look` interaction waits for ▶ instead of
  resolving on `timeout_s`; (c) `validate.py` warns that a `camera` track on a non-streetview scene "will be ignored", which stopped being
  true when the linear renderer's `panowalk` started reading it — scene 04 carries that warning today. The step counter no longer needs the
  Maps JavaScript API at all: **D12 is closed by D6** (there is no counter to drive, and Street View here is the free Embed).

## Decisions I need from the human
- ~~D12 — Maps JavaScript API key / billing for the 04 step counter~~ — **closed by D6**: the counter went with the walk, and the one Street
  View stop left (15) runs on the free Maps Embed. Nothing in this chapter needs a billable SKU.
- **04's player half.** Until Engine gives a `video` scene its media windows, the player shows the M-01 embed for the whole of scene 04 and
  the map beat is film-only. Say if you would rather the player show the *map* for the whole scene (a one-word change, `type: map`) and lose
  the street footage there instead — I chose the street, because D6 says transport is video and the film carries the map either way.
- **The Mapillary licence question is now load-bearing for the film**, not just for a retired player mode: scene 04's street and scene 15's
  pan are both open-imagery frames whose per-image licence the API will not state (`--accept-unknown-licence`). Rights must rule before this
  cut is published.
- 16 — the M-58 rain-on-roof bed starts low under the quiz (the traveller may *hear* the answer — a "look/listen" quiz); say if you want it recall-only (bed in at the reveal).
- 18 — I chose no M-16 night insert (continuous shot, honest line); say if you prefer the 10-s insert under "Fogg had rain and dark".

## Validator output (final — after the D6 pass, 2026-08-19)
```
$ python3 studio/tools/validate.py products/around-the-world-80-days/day-01-london/scenes/*.scene.json products/around-the-world-80-days/day-01-london/tour.json
OK   products/around-the-world-80-days/day-01-london/scenes/01-cold-open.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/02-savile-row.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/03-fogg-by-the-clock.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/04-count-the-steps.scene.json
     ! WARN count-the-steps: camera track on a "video" scene — only streetview scenes walk and turn; it will be ignored
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
OK   products/around-the-world-80-days/day-01-london/scenes/16-quiz-the-weather.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/17-passepartout-on-the-platform.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/18-the-boat-train.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/19-souvenir.scene.json
OK   products/around-the-world-80-days/day-01-london/tour.json
     ! WARN count-the-steps: camera track on a "video" scene — only streetview scenes walk and turn; it will be ignored
```
18 scenes + tour.json, **all OK, zero errors**. The A5 pace warnings on 08 and 13 no longer fire (08 went to 70 s in A5 and both scripts have been trimmed since).
The one remaining WARN is **stale, not a defect**: since C1a the linear renderer's `panowalk` reads a scene's `camera` track whatever its
type (`render_linear.mjs` → `buildPanowalk` → `panomove.planScene`), and scene 04 needs its two cues to stop the walk in front of 104 Pall
Mall. `validate.py`'s rule predates that — Engine backlog item (c) above.

## Linear plan (final — `node render_linear.mjs <tour.json> --plan --track clear`)
```
== 04 count-the-steps (video)      README 97 s → 90.2 s; TTS ok; narration 87.6 s from 1 s   (19/19 sentences, nothing dropped)
== 14 look-up-the-cross (streetview) README 50 s → 44.4 s; TTS ok; narration 42.0 s from 1 s (9/9 sentences, nothing dropped)
Total ≈ 940.6 s
```
No scene is end-cut; the only sentences the sidecar drops are the interactive-only instructions ("Tap any line", "Drag the line.",
"Ask him something.", "Save the card.", "Now tap the longest leg", "Take your time…", and 02's three M-32 tail lines, which have no picture
in this cut). Finished MP4 should be **≈ 16 min 10 s** once the 4-second title card and the credits pages are added.

## Digest
- **Did (D6, 2026-08-19):** rebuilt scene 04 as a transport scene — the counting over the 1872 plan, then the street playing plainly
  (open-imagery walk in the film, the M-01 embed in the player), with no walk, no route and nothing to tap; retired scene 05, whose only job
  was to stand in for that walk, and moved its media into 04; turned scene 15 into a real stop-and-look with two named finds and put it in the
  film as a slow pan over the same imagery; put both transport scenes into the linear cut sheet and re-derived every token against the clear
  track (no dangling reference, no end-cut); reassembled tour.json; 18 scenes + tour all validate.
- **Weak:** the map beat is film-only until the player honours media windows in a video scene, and scene 15's `look` interaction waits for ▶
  instead of its own 30-second budget — two one-line Engine items I did not write, because the player is out of scope this pass. The M-30 crop
  that makes 04 and 12 look like different beats does not exist yet, so today the difference is furniture and words, not picture. And the
  Mapillary per-image licence question now sits under the film's two best shots.
- **With more time:** ask the fetcher for a second Pall Mall sequence so the Travellers and the Athenaeum could be turned onto without the walk
  reversing (that is why they are stills); write 04's clear track a second time against the finished crop, where the numbers could be read off
  the map instead of spoken; and shoot the whole chapter's pace with a stopwatch rather than a word count.
