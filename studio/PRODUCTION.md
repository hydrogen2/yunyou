# PRODUCTION — standing brief for scheduled studio runs

You are the **Editor-in-Chief** of Yunyou (read `studio/roles/_common.md`, `studio/roles/editor-in-chief.md`, `README.md`,
`studio/RUN.md`). This file is your standing brief when the studio is woken by cron. The founder is asleep; do exactly
**one production step**, leave everything reviewable, and stop.

## Positioning (founder, 2026-08-20)
读万卷书，行万里路 — journeys through the places that stories made famous. Unit of production = **a work × a place**.
Public-domain works first; protected works later and only under the documentary posture. Tone is a hard constraint:
unhurried, no cliffhangers, silence allowed, never school. Full note: `studio/strategy/positioning.md`.

## North star (founder, 2026-08-19)
This first production succeeds when the founder — armchair traveler, knows only the novel's title, non-native English
speaker — personally feels **traveled** and **learned** by each chapter. Acceptance test for every DIGEST.

## Each run
1. Read `studio/logs/journal.md` (last 3 entries) and the current chapter's `review/STATUS.md` + `review/DIGEST.md`.
2. Pick the **next step** from the queue below (first unfinished item). One step ≈ one role's output or one review panel — not a whole chapter.
3. Dispatch the role agents (`yunyou-*` agent types; fall back to general-purpose agents pointed at `studio/roles/<role>.md`).
   Run independent roles in parallel. Validate scene JSON with `python3 studio/tools/validate.py`.
4. Update `review/STATUS.md` (what's done / next) and, when a chapter's panel is complete, `review/DIGEST.md`.
5. Append an entry to `studio/logs/journal.md`: date, step done, files touched, problems, next step, decisions the founder should look at.
6. Stop. (The runner commits and pushes to git and keeps the HTTPS server up.)

## Founder gates
Decisions listed in a DIGEST are **provisionally taken with the recommended option** so production continues; every
such choice is written in the journal under "Provisional decisions" so the founder can reverse it. Never publish
externally (no uploads, no outreach emails, no purchases, no API keys created). Never download YouTube video.

## Queue (top = next)
### A. Day 1 London — finish
- [x] A1 (done 2026-08-18, runs 14:00 + 17:00) Apply review fix lists: Scene Developer + Narrator apply `review/fact-check.md` (5 wrong + hedges),
      `review/continuity.md` (3 high, 7 med), `review/qa.md` (6 must-fix incl. Quiz B before dialogue, scene 18 daylight vs "dark",
      cold-open pace, wrong start pano, narration-pause). Re-validate. Note in each scene `review.notes` what changed.
- [x] A2 (done 2026-08-18/19, runs 20:00 + 23:00 + 01:00) Engine/Tools: generate G-01…G-08 into `day-01-london/generated/` per manifest specs (SVG/PNG, cream/ink/one accent);
      wire the player to show them; update manifest status.
- [ ] A3 Content Preparer: reconcile M-50 (Neuville plate 05 vs 02), pin M-05/M-01/M-08/M-13 frames as far as possible without downloading.
- [ ] A3n **Newcomer rewrite (PRIORITY — must precede A4):** Narrator + Scene Developer apply the new style-guide rule
      "Assume no prior reading" per `day-01-london/review/audience.md`: retell-the-story spine (cold open tells the bet in one
      breath before any meta-joke; Act I recast), connoisseur notes moved to overlay/"go deeper" layers, clear-English script
      variant per scene (schema: `narration.variants.clear`, Engine adds field + player toggle), glossary cards for period terms.
      **Historical — the variant half of this item is void since 2026-09-03 (DECISIONS.md D8): there is one English track and
      `narration.script` IS the clear one. Do not add `narration.variants` to anything.**
      Re-validate; fact-check-light on changed lines.
- [ ] A3p Engine/Tools: player aids — "who's who" card (from personas + fact sheet), chapter "previously on…" recap,
      narration speed control, ~~clear-English toggle~~ (the toggle was built, then removed on 2026-09-03 — D8 leaves one track).
- [ ] A4 Narrator: edit `studio/tools/render/cuts/day-01-london.json` so no sentence is machine-cut; Publisher re-renders the linear cut
      (`node studio/tools/render/render_linear.mjs …`) and refreshes `linear/watch.json`; write `review/publish-record.md` (credits page from rights.md).
- [ ] A6 Content Preparer: re-source Day 1's five walking segments at ladder rungs 1–3 (`studio/strategy/media-fallback-ladder.md`)
      so the video no longer needs clip cards: search CC-licensed walks, Mapillary sequences for Pall Mall / Savile Row / the Strand,
      and PD/CC stills as the fallback. Report what each shot resolved to.
- [ ] A5 Editor-in-Chief: re-run Fact-Checker + QA on the revised scenes (light pass), update DIGEST to "ready to publish (free tier)".
### B. Around the World — next chapters (see also studio/strategy/worlds-ladder.md for the long arc) (one chapter at a time, full pipeline: Researcher → Rundown → Scenes/Media/Narrator → panel → Publisher → DIGEST)
- [ ] B0 Editor-in-Chief writes `products/around-the-world-80-days/PLAN.md`: chapter list following the novel's itinerary
      (Day 2 London→Paris→Turin→Brindisi; Suez; Bombay; the Indian railway gap/Allahabad; Calcutta; Hong Kong; Yokohama; the Pacific;
      San Francisco; the American railroad; New York; the Atlantic; London again), each with a hook line and 3 candidate angles; and a brief.md per chapter as it starts.
- [ ] B1 Day 2 (Dover–Calais–Paris–Brindisi) — run the pipeline step by step across runs (each run = next step).
- [ ] B2… subsequent chapters per PLAN.md.
### C1a. FREE open-imagery Street View walk (founder 2026-08-19: "i don't want any cost on google api")
Context: player v0.4 built a cinematic auto-walk on Google's **Dynamic panorama** API — smooth, but billable past ~52 plays/month,
so `www/config.json` is pinned to `mode: link` (calls nothing billable). Only Maps **Embed** API and Street View **metadata** are free.
Build the same experience on open imagery, which we already fetch and are allowed to cache and to put in the video.
- [ ] E-SV1 Engine: new streetview mode **`open`** — auto-walk driven by KartaView (no token) and Mapillary (free token) sequences
      instead of Google. Reuse the hyperlapse builder A6w already wrote for `media/files/` (24 KartaView frames → 2 working hyperlapses).
      Must keep the v0.4 contract: paced to `duration_s`, cross-fade between frames, eased `camera` look-at cues on the same `at_s`
      as the naming pin, drag pauses / idle-resumes. Cache frames under `products/**/media/files/panos/` (gitignored) — unlike Google's
      imagery these MAY be stored and reused, which also means the SAME assets serve the linear cut.
- [ ] E-SV2 Engine: new mode **`embed`** (Maps Embed API — free and unlimited) as the middle fallback: a real Street View the traveller
      can look around manually, when open imagery has no coverage. Ladder becomes `open → embed → link`; `js`/`stills` stay opt-in only
      for deployments that supply their own key and accept billing.
- [ ] E-SV3 Content: coverage audit per walk stop. Known: KartaView has Savile Row (seq 1123901) and Pall Mall (seq 1124); the Strand
      at Charing Cross has **zero** coverage. Get a free Mapillary token and re-check the gaps — pedestrian sequences would beat the
      dashcam frames we have (A6w's note: hyperlapses "cannot identify any of the three clubs").
- [ ] E-SV4 Rights: CC BY-SA attribution burned per frame-run + credits; confirm KartaView terms in a real browser (their /terms is a
      JS shell that will not render to a fetcher, so today's licence quote is second-hand from the OSM wiki).
**Acceptance:** scenes 04 and 15 auto-walk with zero Google billable calls, attribution visible, and the same frames reusable in the MP4.

### C1b. `timeline` scene type — then ↔ now (founder request 2026-08-19, spec in studio/research/scene-types.md)
- [ ] Engine: build the `timeline` renderer — two layers, draggable divider (pointer/touch/keyboard), `reveal_mode: wipe|ghost|side-by-side`,
      per-layer transform for alignment, per-layer caption, timed `reveal` events so the wipe lands on a narration beat, auto-wipe in the linear cut.
      Schema: `layers: [{era, kind: image|video, ref, transform, caption}]`. MUST wait until the cinematic-streetview build lands — both edit studio/player/index.html.
- [ ] First target: scene 14 (Charing Cross forecourt, 1872 engraving vs today) — replaces the static split frame and its dead "drag the seam" prompt.
- [ ] Content: hunt public-domain London *film* (Internet Archive et al.) for a moving "then" layer; caption the era gap honestly.

### C. Research track (weekend runs, or when A/B is blocked)
- [ ] C1 Research Engineer: `ambience` prototype (mixable CC0 stems, presets per Day 1 scene) + catalogue card update.
- [ ] C2 Research Engineer: `window` — head-coupled audio + gyro/face fusion; study protocol sheet.
- [ ] C3 Engine/Tools: `panorama` scene renderer in the player.
### D. Studio improvements (any run, if something is clearly broken)
- Fix tools/roles/templates that failed in the last run; record the lesson in `studio/logs/journal.md`.
- [ ] D-G01 polish (spare run): nudge colliding leg labels, add a credits/source line inside the 16:9 crop, fix the 9:16 Calcutta cut (`studio/tools/gen/g01_route_map.py`).

## Budget per run
Keep to roughly one role fan-out (≤ 6 agents) per run. If the quota is exhausted mid-run, write what was completed to the journal and stop.

### E. Strategy experiments (only if founder promotes them into A–C)
- [ ] E1 Inferno pilot per `studio/strategy/worlds-ladder.md` (rung-3 pipeline: Doré-led scenes, generation recipe, lore-checker).
### F. Audio format (see studio/strategy/audio-format.md; only if founder promotes into A–C)
- [ ] F1 Engine/Tools: audio render target (MP3 + chapters + RSS item) on the existing pipeline.
- [ ] F2 Narrator: Day 1 audio adaptation pass (script overrides, sound-design notes).
- [ ] F3 Publisher: podcast RSS feed on our server, episode art from G-01.
- [ ] F4 Language-feed pilot: "80 Days in 80 Phrases" — Day 1, French.
