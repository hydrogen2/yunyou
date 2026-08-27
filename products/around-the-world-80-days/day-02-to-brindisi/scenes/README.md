# Scenes — Day 2: Dover · Calais · Paris · the Alps · Turin · Brindisi

**Scene Developer + Narrator:** scene-developer / narrator (Claude)  **Date:** 2026-08-27  **Status:** first draft — every `review` field is `pending` (fact-check / rights / QA not yet run). **No video rendered** (founder's hold: player only for now).
**Inputs:** ../rundown/rundown.md · ../research/fact-sheet.md (F-48…F-109) · ../media/manifest.md (M-201…M-261, G-201…G-208) · ../brief.md · ../../DECISIONS.md (RULE 1, D1–D6) · ../../shared/style-guide.md (R1–R5, "Assume no prior reading") · ../../shared/world-bible.md · ../../shared/personas/guide.md · studio/strategy/positioning.md · studio/schema/scene.schema.json · ../../day-01-london/scenes/06-the-reform-club.scene.json and 15-look-up-the-cross.scene.json (house shape)

**Validator:** `python3 studio/tools/validate.py products/around-the-world-80-days/day-02-to-brindisi/scenes/*.scene.json products/around-the-world-80-days/day-02-to-brindisi/tour.json` → **16 files, 16 OK, exit 0**, with one advisory WARN (scene 10's deliberate `treatment: "none"`). `jsonschema` 4.10.3 is installed, so this is full schema validation, not the light structural check.

## Conventions used in the JSON

`media[].start_s/end_s` = the on-screen window in **scene seconds** for stills, generated cards, audio and Street View; for `kind: "footage"` the numbers are still scene seconds and the **source** in/out point is stated in the entry's `note`. `media[].use` — `"player"` = interactive player only, `"linear"` = rendered MP4 only, `"both"` (default) = either; scene 02 carries two entries per shot for its sea beat, which is the A8 pattern. `media[].fallback` = manifest id shown if the primary cannot load (both Street View stops name one). `sa: true` on everything derived from CC BY-SA material (rights-a6 §2.4 strip-list). `narration.variants.clear` = the **default** track in player and film (D5); `narration.after_script_variants.clear` is its twin for the post-interaction line. `overlays[].kind: "gloss"` = a tappable 📖 chip, `"word — plain definition"`, ≤ 12 words, **and only ever on a word the guide actually says out loud**. `camera[]` = the look-at cue track for the two Street View stops; `production_notes` and per-entry `note` are reviewer-facing and never shown to the traveller.

## Scenes in order

| # | file | id | type | dur (s) | seg | media (manifest ids) | one line |
|---|------|----|------|--------:|-----|----------------------|----------|
| 01 | 01-the-notebook.scene.json | the-notebook | interstitial | 95 | 1 | G-201 L0+L1, M-250, G-204, G-208a, M-41 | Title 8 s; a 40-word recap for newcomers; the *Telegraph*'s first line; then the notebook — the guide reads lines one and seven, **lines 2–6 appear in silence**. |
| 02 | 02-dover-and-the-sea.scene.json | dover-and-the-sea | photo | 130 | 2 | M-220, M-221, M-223, M-224, M-222 / **M-201**, M-225 / **M-202**, M-253, M-252 | Dickens's night boat and the rails out along the Admiralty Pier; the cliffs and *la Manche*; **12 s of sea holding on the wave bed alone**. |
| 03 | 03-quiz-three-months.scene.json | quiz-three-months | quiz | 50 | 3 | G-206 (reveal only, from 18 s), M-255 | "Before any of this existed, how long did a letter from London take to reach India?" — three months, round the Cape. |
| 04 | 04-calais-the-indian-mail.scene.json | calais-the-indian-mail | photo | 80 | 3 | M-226, **M-227**, M-228, G-201 L2–L4, M-255 | *le quai*, the touts, and *la malle des Indes*: 1865, 1869, 25 October 1870 — the route is the fast lane, and it is two years old. Amiens at the end. |
| 05 | 05-paris-eighty-minutes.scene.json | paris-eighty-minutes | **photo** (rundown said video) | 85 | 4 | M-232, M-231, **M-203** (linear) | 7:20 am, the Gare du Nord; eighty minutes; two stations, neither the one we picture. "Eighty minutes. He does not get out." |
| 06 | 06-what-he-did-not-see.scene.json | what-he-did-not-see | card (tap-to-find) | 125 | 4 | G-205 | Three ungraded taps: Père-Lachaise, the circus, and the Tuileries — the one he does not name. No music, no score. |
| 07 | 07-quiz-over-the-alps.scene.json | quiz-over-the-alps | quiz | 45 | 5 | *(none — see note)* | "Two years before Fogg, how did this train get to the other side of the Alps?" — over the top, on the Fell railway. |
| 08 | 08-the-hole-through-the-mountain.scene.json | the-hole-through-the-mountain | photo | 85 | 5 | M-240, M-233, M-234, M-235, M-237 → M-239 | 1857 from both ends; the drill Sommeiller had to invent; the exhaust was the air the men breathed; open 17 Sept 1871; *il traforo*, then/now. |
| 09 | 09-the-fourth-date.scene.json | the-fourth-date | map | 85 | 5 | G-202 (8 s silent first), G-201 L5–L8, G-203 | The mountain in section, then the fourth dated pin — and the only one of the four Fogg goes *through*. Reopened 31 March 2025. |
| 10 | 10-sommeiller.scene.json | sommeiller | **photo** (rundown said card) | 55 | 6 | M-234, **no audio at all** | Fourteen years, and he died two months before it opened. **Then 15 seconds of nothing.** Nine words. End. |
| 11 | 11-turin-forty-five-minutes.scene.json | turin-forty-five-minutes | streetview | 90 | 7 | M-216 (Embed), M-242, M-243 | **Stop-and-look 1 of 2.** Find the name, the clock, and where the rails stop. Then the pin: the world's oldest Egyptian museum, 900 m away, and he is on his way to Egypt. |
| 12 | 12-thirty-three-hours.scene.json | thirty-three-hours | photo | 45 | 8 | M-246, M-245 | The longest leg in the chapter gets two lines in the notebook — and we say plainly that nobody has told us which stations he passed. |
| 13 | 13-the-end-of-the-appian-way.scene.json | the-end-of-the-appian-way | streetview | 50 | 8 | M-215 (Embed), M-248, M-253 | **Stop-and-look 2 of 2.** Find the base of the column that is gone, then the steps to the water. Rome's road east ends 150 m from Britain's. |
| 14 | 14-the-mongolia.scene.json | the-mongolia | photo | 50 | 8 | M-229, M-248, G-201 L9, M-251 | *la stazione marittima*; the ship, hedged where the record is thin; five o'clock, the horn, and the sea leg draws south-east. |
| 15 | 15-souvenir-the-notebook.scene.json | souvenir-the-notebook | card (save) | 55 | 9 | G-208b, M-41 | "…through the eyes of their domestics." Seven lines, and a blank column headed "what I saw". On the back, a train you can book. **Next: at sea.** |

**Chain (`next`):** 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 → 14 → 15 (end). File number = index in `tour.json`; no gaps.

## Length — the real numbers

**Nominal interactive: 1,125 s = 18 min 45 s** (95+130+50+80+85+125+45+85+85+55+90+45+50+50+55), exactly the rundown's target.
**Honest wait budgets on top:** quiz C 20 s + quiz D 20 s + three taps × 12 s + two free looks × 30 s = **136 s**.
**So: ≈ 20 min typical, 21 min 1 s if every wait is spent to the second.**

**Word counts against the rundown's per-segment ceilings** (`script` + `after_script`; the tap card's three feedback blocks counted separately, as the rundown itself did):

| seg | scenes | ceiling | spoken | |
|-----|--------|--------:|-------:|---|
| 1 the notebook | 01 | 125 | **125** | ✓ |
| 2 Dover and the sea | 02 | 185 | **184** | ✓ |
| 3 Calais | 03 + 04 | 215 | **214** | ✓ (+144 words of quiz feedback) |
| 4 Paris | 05 + 06 | 325 | **340** | **+4.6 %** — 226 of spine plus 114 of tap feedback; see below |
| 5 the Alps | 07 + 08 + 09 | 385 | **371** | ✓ (+63 words of quiz feedback) |
| 6 Sommeiller | 10 | 55 | **55** | ✓ |
| 7 Turin | 11 | 150 | **139** | ✓ |
| 8 Brindisi | 12 + 13 + 14 | 205 | **202** | ✓ |
| 9 souvenir | 15 | 90 | **90** | ✓ |
| **chapter** | | **≈ 1,735** | **1,606** | ✓ **93 % of budget** |

Per scene, words / seconds actually spoken (`duration_s − starts_at_s`), literary track then clear track:
01 125/124 @ 1.44 w/s · 02 184/185 @ 1.42 · 03 69/67 @ 1.38 · 04 145/145 @ 1.81 · 05 139/140 @ 1.64 · 06 87/88 @ 0.70 · 07 57/56 @ 1.27 · 08 151/150 @ 1.78 · 09 163/162 @ 2.12 · 10 55/55 @ 1.08 · 11 139/140 @ 1.54 · 12 44/44 @ 0.98 · 13 86/85 @ 1.72 · 14 72/73 @ 1.44 · 15 90/89 @ 1.64. **Highest is scene 09 at 2.12 w/s** against the 2.5 target and the 3.2 hard limit; the chapter mean is 1.5.

**The one overspend, declared rather than hidden.** Segment 4 is 15 words over its 325 ceiling (4.6 %). All of it is in the three tap feedbacks of scene 06, and the segment's *wall clock* is 210 s plus 36 s of tap pauses = 246 s, so 340 words at 2.4 w/s is 142 s of speech = **58 % fill**, comfortably under the segment's own 65 % target. If the founder wants the number inside the line, the two cuts are named in scene 06's `production_notes`; I would rather lose scene 05's "Two dates while we cross" than either the wall at Père-Lachaise or "A Frenchman wrote this book that year."

## The three load-bearing silences — where they are, and what the player does with them

1. **Scene 01, 60–78 s.** Lines 2–6 of Fogg's notebook are revealed about 3 s apart with no voice over them. The guide reads line one and line seven only.
2. **Scene 02, 70–82 s.** The sea holds for 12 s with the M-253 wave bed and nothing else. (There is a second, smaller authored silence at 62–70 s, after the cliffs.)
3. **Scene 10, after "two months before it opened".** Fifteen seconds. No music, no sting, no bed — scene 10 is the only scene in the chapter with no audio entry at all. Then nine words, and the scene ends.

None of the three is filled: the scripts are written short enough that the seconds exist, and the media and overlay windows put them where they belong. **Engine limit, stated honestly:** the player speaks `script` continuously from `starts_at_s` and has no way to hold a pause *inside* a script, so today those unspoken seconds pool at the tail of the scene instead of falling in the middle. The linear cut sheet must hold them where they are written. **One-line engine request:** `narration.pauses: [{at_s, hold_s}]` honoured by `speak()` would land every authored silence in this chapter exactly where the Narrator put it.

## Linear cut (~14 min 45 s) — the selection, for when the founder lifts the render hold

Caps below total **885 s = 14 min 45 s**, matching the rundown. Nothing here has been rendered.

| scene | in the film | s |
|-------|-------------|--:|
| 01 the-notebook | whole; the seven lines land on the same clock as the player | 75 |
| 02 dover-and-the-sea | **the archive films play here**: M-220/M-221 → M-223/M-224 → **M-201 ×2** → **M-202 0:08–0:43**, with the Méliès caption ("a studio joke about the crossing, filmed 25 years later") and the honesty caption ("Our film is daylight. Fogg crossed in the middle of the night."); drop the "Dover–Calais today" caption and M-225 | 105 |
| 03 quiz-three-months | question + correct feedback + `after_script` in one breath, no choice; G-206 under the reveal | 30 |
| 04 calais-the-indian-mail | whole | 65 |
| 05 paris-eighty-minutes | **M-203** instead of the two stills for the last 35 s (horse cabs at 2:10, Concorde at 2:33), captioned by decade, never "1872" | 60 |
| 06 what-he-did-not-see | the card, and the three taps played in order as narration (Père-Lachaise → circus → Tuileries), then `after_script` | 95 |
| 07 quiz-over-the-alps | question + correct feedback + `after_script`, no choice; **M-240 under the reveal** | 30 |
| 08 the-hole-through-the-mountain | whole, with the M-237 → M-239 cross-fade; M-235 panned left-to-right | 75 |
| 09 the-fourth-date | whole, 8 s of G-202 in silence first | 60 |
| 10 sommeiller | whole, and the fifteen seconds are **in the middle**, where they are written | 55 |
| 11 turin-forty-five-minutes | D6 adaptation: a slow pan following the `camera` cues, words unchanged, then M-243 on "the rails stop here" | 70 |
| 12 thirty-three-hours | whole | 40 |
| 13 the-end-of-the-appian-way | D6 adaptation: M-211 as a slow pan right→left ending on the column (**needs rundown Decision 4**), or M-248 tilt-up if Mapillary's licence stays unresolved | 40 |
| 14 the-mongolia | whole, horn once | 40 |
| 15 souvenir-the-notebook | whole; end frame | 45 |
| **total** | | **885** |

Interactive-only: the two free looks (11, 13), the three taps (06), the two quiz choices (03, 07) and the save (15). Linear-only: M-201, M-202, M-203, M-242, M-243, M-248's tilt-up, M-252, M-211.

## Where I departed from the rundown, and why

1. **Scene 05 is `photo`, not `video`.** Day 2 has no YouTube anywhere — the Content Preparer landed every beat at rungs 1–3 — and in the player a `video` scene with no `youtube` entry falls through to a text card with a small inset. As `photo` the two Gare du Nord plates mount full-frame and M-203 stays in the file as `use: "linear"`.
2. **Scene 10 is `photo`, not `card`.** A `card` scene with an image and no generated asset draws a text card with a corner inset — the opposite of "a still that sits still". `treatment: "none"` stops the drift layer, which is the one advisory WARN the validator raises, and it is deliberate.
3. **The archive films are `use: "linear"`.** The player has no renderer for `kind: "footage"` (M-201, M-202, M-203). Scene 02 therefore carries a player still under each film window (M-222 under M-201, M-225 under M-202) and the narration is written to be true over both. **The Méliès identification is not in any overlay**, because a caption naming a film the player never shows would be a lie on the frame; it lives in the media `note`, the `production_notes` and the cut sheet.
4. **M-240 (the Fell train) opens scene 08 instead of sitting in quiz D's feedback.** Feedback in the player is text; and an image on a quiz scene shows at 0 s, which would have given the answer away. The plate now lands about two seconds after the reveal is spoken.
5. **G-201's legs are re-grouped:** L0+L1 in 01, L2–L4 in 04, L5–L8 in 09, L9 in 14. A generated card inside a `photo` scene drops every still authored at or after it, so the rundown's L2–L3-in-scene-02 and L5-in-scene-05 would have deleted the cliffs, the sea and half of Paris.
6. **Two gloss chips are cut: *la douane*, *le buffet* (scene 04) and *il binario* (scene 11).** A chip may never gloss a word the traveller does not hear, and the guide says "customs officers", "hot coffee" and "the rails stop here" in English. Scene 01's *valet* chip went the same way, for the same reason — the Day-2 recap says "servant". **Seven chips survive and every one glosses a word the guide says out loud:** *la Manche* (02), *le quai* and *la malle des Indes* (04), *la gare* (05), *il traforo* (08), *Torino* (11), *le colonne romane* (13), *la stazione marittima* (14).
7. **The Museo Egizio bearing is recomputed.** The rundown says 060°; F-104 → F-105 is **033° at 865 m**, and from the Street View stop it is **035° at about 710 m**. The cue uses `look_at` (which the runtime aims from wherever the pano really is) and the narration says "about nine hundred metres", splitting the difference honestly against F-87's "about 1 km from Porta Nuova".
8. **The two `look` scenes keep their payoff in `script`, not `after_script`.** The player speaks `after_script` only when a *graded* interaction resolves; a `look` scene has no options, so an `after_script` there would never be heard and the Egypt joke and the Appian Way line — the reasons those stops exist — would be silently lost. Same reason scene 06's closing line is carried both in `after_script` (for the record and the film) and as a caption at 112 s (so the traveller meets it in the right place).
9. **F-108 is nowhere in the narration.** The postcard's printed claim is quoted as a caption of the artefact, and a single go-deeper pin asks the open question ("but can anyone date the card?"). F-109 is a conditional caption in scene 01 and must be **cut, not softened**, if the Fact-Checker cannot confirm it.
10. **Two quiz scenes carry exactly one overlay each, and that is a bug workaround.** The player's `sceneCard()` prints the text of *every* overlay at once, ignoring `at_s` — so on a scene the player has to draw itself (03 before G-206 comes up at 18 s, and 07, which has no media at all) a reveal caption would sit on screen from second zero and hand over the answer. Both reveal captions were therefore folded into G-206's spec and into quiz D's option feedback, and both `title` and `learning_goal` are written spoiler-free, because the card prints those too.
11. **The two corrections the rundown ordered are written into the generated specs:** G-201 now reads "Brindisi — arr 4 pm, **Saturday 5 October** 1872" with Turin on the 4th (the manifest said "4 p.m. 4 Oct"); G-202 must show the length **twice** — "about 12.8 km at opening (1871)" and "13.7 km today" — and the pair is also carried as an on-screen caption in scene 09 so it survives a re-cut of the diagram. Neither asset has been generated; only the spec is written.

## Still open (for the founder / the next roles)

- **Rundown Decisions 4, 5, 6, 7** are unresolved and all four touch this chapter: Mapillary's licence (scene 13's film pan only), M-227's attribution (scene 04, carried as `sa: true` for now), the formal reject of M-206, and approval of the free assets **M-256…M-261 and G-206, G-208**. Scene 06's four reveal plates and scene 10's portrait and scene 11's museum plate are **not media entries**, because they have no refs in the manifest and I will not invent one; each scene is written to work without them and each names exactly where to add them.
- **Both Street View panos are unverified** — the founder's key is referrer-restricted, so the metadata endpoint answers `REQUEST_DENIED` and nobody could check from the studio. QA confirms in the player; both stops carry a still `fallback`. Nothing billable is called: Maps **Embed** only (RULE 1, D3, D6).
- **Engine gaps recorded, none blocking:** authored mid-script silence (above); `after_script` for ungraded tap-to-find and for `look`; and the Day-1 stall where a `look` scene waits for ▶ rather than auto-advancing on its `timeout_s`.

## Digest

- **Did:** wrote all fifteen Day-2 scenes and `tour.json` — both narration tracks in every scene with clear English as the default, authored `start_s`/`end_s` on every still with the sentence each slot is timed against recorded in `review.notes`, two stop-and-look Street View scenes with real tasks and recomputed bearings, two quizzes, one ungraded tap card, five generated-asset specs carrying the rundown's two corrections, and 1,606 spoken words against a 1,735 ceiling. Validator: 16/16 OK.
- **Weak:** segment 4 is 4.6 % over on words; the three authored silences are real in the timeline but the player currently pools them at the tail; scene 06 is thinner than it should be until M-256…M-259 land; and the player cannot show the two archive films at all, so scene 02's best material is in a cut nobody has rendered.
- **With more time:** I would read scenes 08 and 09 aloud with a stopwatch against both tracks, ask Engine for `narration.pauses` and for `after_script` on `look`, and get one Street View pano confirmed in the player before QA, because the Turin stop's three finds all depend on the façade being legible at the authored zoom.
