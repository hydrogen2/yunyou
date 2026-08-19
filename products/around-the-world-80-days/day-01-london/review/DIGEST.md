# DIGEST — Day 1 · London — the departure   (Editor-in-Chief → you)

**Status:** ready for your review — **do not publish yet** (6 must-fixes, 3 decisions that change the build)   **Date:** 2026-08-18
**Read time:** ~3 min. Everything links to the full documents.

## What we made
A 19-scene, ~22-minute interactive chapter (11½-min linear cut) that starts at the Savile Row corner Verne named,
counts Fogg's 1,151 steps to the Reform Club in Street View, shows what Verne got right about the club, stages the
wager and the "world had just shrunk" map beat, packs the carpet-bag as a drag game, dashes to Charing Cross, pairs an
1872 engraving with today's forecourt, lets you chat with Passepartout on the platform at 8:40 pm, and ends on the
boat train crossing Hungerford Bridge with the forgotten gas — souvenir: Fogg's last London breakfast as a recipe card.
Built on 45 sourced facts, 61 verified media items (28 used), a guide persona and a text-bound Passepartout persona.
`tour.json` assembles and validates.

Four reviewers all say **pass-with-flags** / **amber**; nothing red, nothing structural — but the flags are real.

## Decisions — ANSWERED 2026-08-19 (see ../../DECISIONS.md)
Free until further notice (D1) · creator permission requested by the founder, clip cards until then (D2) ·
Maps key to be obtained by the founder (D3) · our outputs CC BY-SA 4.0 (D4) · clear English is the default
track in player and video, one video only (D5). The list below is kept for the record.

## Decisions I need from you (answer inline)
The three that change the build:
1. [ ] **Free or paid?** YouTube's developer policy (III.F.3.a) forbids charging users to watch embedded videos.
   A *free* Day 1 (or a subscription that gates the guide/quizzes/chat but never the embeds themselves — needs a lawyer's nod) is fine;
   a paywalled chapter built on embeds is not. Alternative: license footage from 2–4 walkers (Rights lists who). **Recommend:** free launch on embeds + creator partnerships, licence footage before charging.
2. [ ] **Overlays outside the player.** YouTube's embed rules bar drawing pins/captions *over* the iframe. Our design puts them beside/below it (Fold open makes this natural). Confirm the player layout: video top ~65 %, pins/captions in a strip below.
3. [ ] **Real length.** With the free chat, interactive runs 24–26 min not 22. Accept, or cap Passepartout at two exchanges.

Content choices (I've provisionally taken the recommendation; say if you disagree):
4. [ ] End **on the boat train** (yes) · **modern guide** voice (yes) · **both quizzes** — but Quiz B moves *before* the dialogue (it was being spoiled by earlier scenes).
5. [ ] Street View walk: **full seven-stop walk** (~150 s, honest 0.97 m/step counter) vs two parts with a jump. Recommend full walk if we accept the Maps JS API cost.
6. [ ] Watched Walker (M-05, Savile Row primary) writes "I do not license my content" though embedding is on. Recommend: **outreach, 14 days, else swap to Sanpo Stroll M-06.**
7. [ ] Show today's modern block at 7–8 Savile Row with the caption "Today: a modern block. Verne's No. 7, not Sheridan's" — yes (it's Act I's joke).
8. [ ] Passepartout may repeat the 21 December return date he overhears (yes; text supports it) · free chat with guardrails, scripted fallback if LLM unavailable (yes).
9. [ ] Souvenir: **breakfast recipe card** (evergreen) — or the Open House booking (12–13 Sep 2026, bookings open **tomorrow, 19 Aug**; strong but expires).
10. [ ] Adopt Continuity's 5 style-guide rules and world-bible canon list · on-screen time style "8:45 pm" · scene 19 music: Sullivan bookend.
11. [ ] Thames coda in the linear cut only: none (recommended) / sunset M-11 / night M-16.
12. [ ] Who owns the Google Maps Platform key + billing (needed for the Street View scenes)?

## Things I'm not sure about
- **Nobody has actually watched the footage.** Segments are chapter-derived; "does the frame show No. 14 at 0:25" is unverified for M-05/M-01/M-08/M-13. Scene 18 narrates "rain… in the dark" over M-13, which the manifest confirms is *daylight* — script or media must change. Needs a human (or a player) before record.
- Fact-check found 5 wrong/misleading lines (Travellers Club "1823" → 1832; Poole "at No. 15 since 1846" → on the Row 1846, at 15 since 1982; "two and a half km" → ~1.6 km; an invented "paper-knife"; "Neuville, 1872" → 1873) and ~10 hedges. All small, all fixable in an hour.
- The Passepartout system prompt has 5 guardrail gaps (fog, politics-as-fact, prompt injection, meta-fiction, "valet's London" scope). Fixed in the persona sheet's suggested prompt; not yet run against a real engine.
- The 8:45 pm Dover boat train and the weather on 2 Oct 1872 are Verne's, unverified against period records — fine for a novel-as-guidebook, but we say so on the fact sheet.

## Review summary
| Fact-check | Rights | Continuity | QA |
|---|---|---|---|
| pass-with-flags · 5 wrong, ~10 hedges, 20-probe red-team run on paper | amber · 0 red · 2 conditional blockers (paywall, overlays) + Maps key | pass-with-flags · 3 high (cold-open pace, scene 06 sentence length, 8:20/8:40 clock slip), 7 med, 15 low | pass-with-flags · 6 must-fix (Quiz B spoiled, daylight vs "dark", 174 wpm cold open, wrong start pano, no narration-pause on interactions, chat can't fit 48 s) · presence 3 · learning 4 · pacing 3 · clarity 4 · delight 4 · technical 2 |

## Files
- brief → `../../brief.md` · rundown → `../rundown/rundown.md` · facts → `../research/fact-sheet.md` (F-01…F-45)
- scenes → `../scenes/` (19 JSON + README with linear-cut selection) · media → `../media/manifest.md` (M-01…M-61, G-01…G-03)
- personas → `../../shared/personas/guide.md`, `passepartout.md`
- reviews → `fact-check.md` · `rights.md` · `continuity.md` · `qa.md`
- build → `../tour.json` (validates against `studio/schema/tour.schema.json`)

## If you approve
1. Scene Developer + Narrator apply the fix list (fact-check 5+10, continuity 3 high, QA 6) — ~1 session; re-validate.
2. Content Preparer/human watches the four primaries and pins frames to the second; swaps M-13 or rewrites 18.
3. Publisher: credits page from Rights' attribution manifest; linear-cut render plan; thumbnails/titles.
4. Kick off Day 2 (Dover → Calais → Paris → Turin → Brindisi, or straight to Suez per the itinerary) with the world-bible canon from Continuity.

## Notes on the studio itself (dry-run lessons)
- The pipeline works end to end; the review panel caught the same issues independently (Quiz B spoiler, cold-open pace) — reviewers are pulling their weight.
- Biggest gap: **frame-level media verification** needs eyes or a player. Next tool: a scene player that shows manifest segments so QA can *watch*.
- YouTube-embed economics (Decision 1) is a product-level constraint the studio surfaced on Day 1 — good that it did.
