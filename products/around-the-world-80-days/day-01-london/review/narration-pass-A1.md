# Narration pass A1 — Day 1: London — the departure (Narrator, phase 2)

**Narrator / Voice:** narrator (Claude)   **Date:** 2026-08-18   **Brief:** `review/fix-brief.md` §2 (after the Scene Developer's phase 1)   **Status:** done — validator all OK, zero WARN
**Inputs:** ../../brief.md · ../../shared/style-guide.md (R1–R5) · ../../shared/world-bible.md · review/continuity.md (#1–#5, #8–#10, #24, #25) · review/qa.md (timing table) · review/fact-check.md (hedges) · research/fact-sheet.md (F-01…F-45, amended rows) · shared/personas/guide.md · shared/personas/passepartout.md · scenes/01…19
**Owned and edited:** `narration.script` / `after_script` / `waypoint_script` in the 19 scene files; `shared/personas/guide.md`; `shared/personas/passepartout.md`; `tour.json` regenerated from the scene files. Not touched: media, overlays, interactions, rundown, manifest, other review docs (one exception: 08 `sources` gained F-32 because the Paris-newspaper sentence moved there; 10 `production_notes` gained the 40-s linear form the brief asked for).

## 1. Scene table — words · seconds spoken · w/s · what changed

Seconds spoken = `duration_s − narration.starts_at_s` (validator basis; scenes with a wait state count script + after_script over the whole scene, so the true density during speech is a little higher and is given in the notes where it matters).

| scene | words (script + after) | seconds spoken | w/s | what changed |
|---|---|---|---|---|
| 01 cold-open | 97 | 65 (linear window 50) | 1.49 (linear 1.94) | 139 → 97 words (Continuity #1, QA must-fix 3): hours/minutes sentence dropped (caption 36–46 s carries it); "Jules Verne printed this journey in a Paris newspaper that same winter, as if it were happening" moved to 08; "Keep that watch in mind" → "Remember the watch" (not a listed tic); 31-word sentence split; ends on "Savile Row". |
| 02 savile-row | 197 | 100 | 1.97 | 250 → 197 (Continuity #8): the three 35-word sentences split; Sheridan and Poole facts each stand alone; dinner-jacket hedge kept ("Poole's own story… the ancestor, they say"); the gas/bells/no-books sentence dropped as redundant (03 taps and 11 carry it); side language stays neutral (frame unverified, A3); "our guidebook, not our gospel" kept; contractions per R4. Linear note "last four sentences" still true (Beatles → "Same hush"). |
| 03 fogg-by-the-clock | 110 | 60 (taps pause the guide) | 1.83 | No change: guide reads only the times and the CV, taps hold the punchlines (84 °F, slow watch, Tussaud's), CV split after "about thirty" and "Blondin", ends on "the slow watch" (#10, #25). |
| 04 count-the-steps | 277 | 150 (user-paced) | 1.85 | `waypoint_script` polished: 24-word openers at stops 0 and 5 split; "We'll count them with him"; `script` regenerated as the join. Step numbers stay spoken — they are the beat, not a caption read-out. |
| 05 pall-mall-pass | 99 | 76 | 1.30 | 30- and 32-word sentences split; "watch the left side" kept (west-bound). Linear cut only. |
| 06 the-reform-club | 137 | 70 (arrival 0–25 · look-up + breakfast 25–45 · photos 45–70) | 1.96 | 168 → 137 (Continuity #2 ≤ 140, every sentence ≤ 20): "look up" cue kept to the first-floor windows (no "nine", the coffee-room faces the garden — Quiz A follows); menu spoken as the best clause only, caption 30–42 s carries it; Berkshire line dropped (19 pays Reading sauce off); the Times line closes the scene over the 1841 engraving so it ends "…and reads The Times" (#25); no paper-knife (F-06). |
| 07 quiz-verne-saloon | 55 + 51 | 80 (≈ 20 s question, pause ≤ 30 s, ≈ 25 s tail) | 1.32 (≈ 2.4 during speech) | 35-word question opener split into short beats (the three options are the question, so R5 does not apply); Open House sentence shortened; answer sentences stay in `after_script`. |
| 08 the-wager | 149 | 60 | 2.48 | 180 → 149 (validator WARN cleared; #9 tense fixed: "a thief has walked out… with fifty-five thousand pounds"); "six names, Stuart first, Fogg last" (card carries them); the Paris-newspaper sentence from 01 landed here (F-32 added to `sources`); "in the novel — only in the novel"; Baring's footnote kept short; ends "outlived the bank". Dense but within the rule — the plate holds still. |
| 09 two-real-men | 73 | 30 | 2.43 | Two sentences per man (#10); Train quote hedged "he later claimed" (F-36 med); "late September" kept (F-35). Interactive only; tight — see §4. |
| 10 the-world-shrinks | 144 + 46 | 100 (pause ≤ 20 s before the tail) | 1.90 | Script unchanged (the reveal was already in `after_script`); **40-s linear form of the legs beat added to `production_notes`** (≈ 90 words: enablers in one sentence, legs as "seven to Suez, thirteen to Bombay…", the turn line). |
| 11 pack-the-bag | 141 | 90 | 1.57 | 40-word list sentence split; spoken "the red-bound Bradshaw" (#16; the drag item keeps the full title in text); "hundreds of pages" hedge (F-37); no "so we are too" boast; ends "half a fortune". |
| 12 the-dash | 116 | 60 | 1.93 | 32-word fare sentence split; cab-distance hedge kept ("sixpence a mile or part of one. Barely a mile and a half to Charing Cross — call it a bob", F-28); "hooves on stone", no "wet" before Quiz B (R5); "twenty past eight" arrival (F-12). |
| 13 charing-cross | 148 | 60 (40 s video + 20 s M-51) | 2.47 | 156 → 148 (validator WARN cleared): roof line split ("You can't see it from here: Hawkshaw's roof… It collapsed in 1905 and was replaced; that's all we'll say about it"); "So much of what Fogg passes"; beggar-woman beat in short sentences (#10) over the Neuville still; "Big Ben — the clock tower" first mention (#21). |
| 14 then-and-now | 74 | 35 | 2.11 | 33-word Dover/St Pancras sentence split. |
| 15 look-up-the-cross | 54 | 25 | 2.16 | 36-word Charles I sentence split into three; ends "this cross". Interactive only. |
| 16 quiz-the-weather | 16 + 23 | 45 (≈ 8 s question, pause ≤ 20 s, ≈ 10 s reveal) | 0.87 | No change: "Twenty to nine, still under the roof. Look up — what is the weather doing tonight?" names no weather; reveal in `after_script` states Verne's sentence (R5, #3, #7). Persona sheets now carry this opener as canon (§8 / §6). |
| 17 passepartout-on-the-platform | 24 + 12 | 90 (+ chat ≤ 180 s) | 0.40 | No change: guide-in = passepartout.md §6 / guide.md §8 verbatim ("It's twenty to nine, and it's raining…"); hand-back spoken "We've got a train to catch. Twenty to nine on the platform." (the "look up at the roof" clause now opens Quiz B — persona sheets amended); chips = §5 answers 1–5 verbatim (diffed, identical); clock 8:40 in script, lower-third and prompt (#3, #4, #5). |
| 18 the-boat-train | 156 | 85 (nothing spoken 12–16 s → 81) | 1.84 (1.93 real) | 27- and 26-word sentences split; Sydenham aside made its own sentence so the caption (64–76 s) lands with it ("Verne says Sydenham — though by 1872 the express probably took a shorter line", F-13 med); "the same platforms, and — just — the old roof, months before it fell"; "We travel in daylight; Fogg had rain and dark" kept; "Look right" kept, window side unverified (A3) — guide.md example 6 agrees and carries the same flag; hold after "seated." for the M-45 sting; ends "To be continued." (the serial hook, QA: keep). |
| 19 souvenir | 102 | 60 | 1.70 | 118 → 102: the guide names the dish ("broiled fish with a Reading-sauce-style ketchup — a real Berkshire condiment from 1802, gone since the 1960s"), ingredient list dropped from speech (G-08 card carries it); "be at table by a quarter to nine" in words, caption "8:45 pm" (R1); other motto; ends "Paris". |

**Totals:** 2,301 spoken words across the chapter (script + after_script; 04's join counted once); every scene ≤ 2.5 w/s on the validator basis; every sentence ≤ 20 words except quotations and the two Verne deadline/weather quotes (20–23 words inside quotation marks).

## 2. Fact-check hedges — present in the scripts (checked each)

| hedge | where | wording now |
|---|---|---|
| dinner jacket | 02 | "Poole's own story is that in 1865 they cut the Prince of Wales a short evening jacket. The ancestor, they say, of the dinner jacket." (F-45) |
| paper-knife | 06, 11 | 06 "cuts the pages himself and reads The Times"; 11 feedback "cutting the pages himself" (F-06) — no knife anywhere |
| Bradshaw pages | 11 | "hundreds of pages of trains and hotels" (F-37) |
| "so much of what Fogg passes" | 13 | "So much of what Fogg passes tonight is younger than his valet." |
| Sydenham "probably" | 18 | script + caption "by 1872 the express probably took a shorter line" (F-13 med) |
| "same roof" | 18 | "the same platforms, and — just — the old roof, months before it fell" |
| "three words" | 10 | "Fogg's answer was three words: 'It was once.'" (F-33) |
| cab distance | 12 | "sixpence a mile or part of one. Barely a mile and a half to Charing Cross — call it a bob" (F-28) |
| Neuville caption | 08 | "The wager at the Reform — de Neuville & Benett, 1873" (unchanged, no fake quote) |
| Train quote | 09 | "He later claimed…" (F-36 med) — added by me |
| Cook date | 09 | "late September 1872" (F-35) |

## 3. Persona changes

**guide.md (v1.1)**
- §2 rule 11 added: contractions allowed in the guide's speech; the narrator normalises at record; hand-off lines copied exactly (R4, Continuity #24).
- §3 example 6: "Watch the left window" → "Look right as we cross the river — that's the Embankment, two years old", flagged *side unverified* and tied to scene 18 (both change together if A3 finds the window faces east).
- §8 rewritten for D4/D3: order 15 → 16 Quiz B → 17 chat → 18; the Quiz B opener ("Twenty to nine, still under the roof. Look up — what is the weather doing tonight?") and its reveal are now canon here; guide-in unchanged; cap 4 exchanges / 180 s / `on_llm_unavailable: choice`; hand-back "We've got a train to catch. Twenty to nine on the platform." → 18; declared, with passepartout.md §6, the single source of truth; linear order noted (16 as 15-s question + reveal, then the §6 three-liner, then 18).

**passepartout.md (v1.1)**
- Header cap 90 s → 180 s (D3) and the D4 order.
- §2: the James Forster 84 °F item hedged as hearsay — "they told me" — he was not there.
- §3 must-nots +3: no book/no author (never a fiction, a character, "in a book", Verne's — he has never heard the name); no prompt games (injection line: answer as Passepartout and return to the platform); a valet's London only (tradesmen's doors and the way home; nothing about railways, streets or prices beyond the cab fare).
- §5 answer 8: "— gold —" dropped ("Monsieur took out twenty guineas, put them in her hand…"). Answers 1–5 untouched; scene 17 chips diffed against them: identical.
- §6 rewritten as the SINGLE SOURCE OF TRUTH: Quiz B opener + reveal, guide-in, silence opener, hand-back (no "look up" clause), chips reference, linear three-liner ("Hold on to it. It's twenty to nine, it's raining, and the whistle goes in five minutes."). Scene 16 `script`/`after_script` and scene 17 `script`/`after_script` verified verbatim against it.
- §7 system prompt +5 guard lines (never "fog"; no advice and no politics of any year; never a program/persona/fiction/character/in a book/Verne's; injection line; valet's-London limit with the cab-fare clause) plus the optional Ralph line ("We will trust your word, as a gentleman of honour"). Word count ≈ 350 — over the original ≤ 250 by design (stated in the sheet).
- Red-team table +3 probes (Verne injection, "character in a novel", cab route/type).
- Decisions: D8 marked as taken provisionally.

## 4. What I could not do, or did only in part
- **08 the-wager at 2.48 w/s and 13 at 2.47** meet the ≤ 2.5 rule but not the ~80 % fill guide.md §6 prefers (~2.0). Both scenes are 60 s of still image; the alternative was cutting the Paris-newspaper sentence (mandated to move here) or the Baring's footnote (a QA favourite). If the founder wants air, 08 → 70 s or drop "Exactly eighty days — and it really was a Saturday." (9 words). 09 (2.43, interactive only) has the same tightness; folding it into a map caption (QA's suggestion) is a Scene Developer/rundown call, not mine.
- **06 "look up" cue** names "the tall windows of the first floor", not "the coffee-room's" as Continuity #2 first suggested — the Scene Developer's note is right that the coffee-room's nine windows face the garden (F-15), and "nine" must stay out of the scene before Quiz A. Ends on "…and reads The Times" as asked, but placed after the photo trio (QA moved the breakfast to the video's last 20 s), so the closing line runs over the 1841 engraving.
- **12 cab distance** keeps the fact-checker's imperial "barely a mile and a half" (metric-first rule) because the fare is priced by the mile; F-28 says ≈ 1.6 km. If a metric form is wanted: "about a mile — call it a bob" also works with the 1-s minimum (F-28 note).
- **18 whistle hold**: the 4-s silence at 12–16 s is a production note, not a script marker (a marker would be read by TTS); the record must honour it — "seated." lands by 12 s, "A quarter to nine — the whistle…" starts at 16 s.
- **02 side language** stays neutral until A3 pins the M-05 frames; the production note's "on your right" variant is ready if the walker enters at the south end.
- No new facts were introduced; nothing added to the fact sheet.

## Decisions I need from the human
- [ ] Passepartout system prompt is now ≈ 350 words (was ≤ 250) because of the five guard lines — accept the longer prompt, or should I fold the guard lines into a shorter whitelist?
- [ ] 08/13 at ~2.5 w/s: accept the density on a still, or give 08 ten more seconds (70 s) for air?

## Validator output (`python3 studio/tools/validate.py … scenes/*.scene.json tour.json`)
```
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
OK   products/around-the-world-80-days/day-01-london/scenes/16-quiz-the-weather.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/17-passepartout-on-the-platform.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/18-the-boat-train.scene.json
OK   products/around-the-world-80-days/day-01-london/scenes/19-souvenir.scene.json
OK   products/around-the-world-80-days/day-01-london/tour.json
```
(20 OK, 0 WARN, 0 FAIL — the earlier warnings on 08 the-wager 180 words and 13 charing-cross 156 words are cleared.)

## Digest
- **Did:** polished all 19 scripts to the fix-brief §2 limits (01 ≤ 100, 02 ≤ 200, 06 ≤ 140 with ≤ 20-word sentences, 08 ≤ 150 in 60 s, 13 ≤ 150, every scene ≤ 2.5 w/s, all splits at the slow beats), moved the Paris-newspaper line to 08, kept every fact-check hedge, confirmed the 8:40 clock and the no-weather-before-the-reveal rule, made 16/17 and the persona sheets one text (§8/§6 = single source of truth, chips = §5), applied all persona bullets, wrote the 40-s linear legs beat, regenerated tour.json and re-validated (all OK, no WARN); appended an A1 narrator line to every scene's review.notes.
- **Weak:** word ÷ seconds is still a desk count, not a stopwatch read; 08, 09 and 13 sit at 2.4–2.5 w/s on stills; the 18 whistle hold and 04's user pacing are conventions the recording and the player must honour, not things the JSON enforces.
- **With more time:** read 01, 06, 08, 13 and 18 aloud against a timer and trim to ~2.0 w/s; record the §6 three-liner and the five chips in the Passepartout voice as a fallback; run the amended system prompt through the twenty red-team probes.
