# Pipeline status — Day 1 London (updated 2026-08-19, run 01:00 UTC)

DRY RUN COMPLETE through the digest (2026-08-18 interactive). **Fix pass A1 applied** (14:00 + 17:00 runs). **A2 generated assets delivered** (20:00, 23:00, 01:00 runs).

DONE:
- fact-sheet F-01…F-45 (fact-checker amendments applied 14:00) · manifest M-01…M-61 · G-01/02/04/05/06/07/08 **delivered** in `generated/` (G-03 on hold) · rundown · personas v1.1
- generators `studio/tools/gen/` (g01_route_map.py, g02_then_now.mjs, cards_day01.mjs, g-07/src/make_g07.py), exporter `studio/tools/svg2png.mjs`, house fonts `studio/player/fonts/`
- player v0.2 (`studio/player/index.html`, CHANGELOG): inlines generated SVGs, wires G-01 leg reveal/taps, G-02 seam, G-04 rows, G-07 game; smoke test `studio/player/test/smoke_generated.mjs` ALL PASS
- 19 scenes, A1 fix lists applied (Scene Developer phase 1 + Narrator phase 2), Quiz B now scene 16 before the dialogue (17)
- schema/validator extended (pause_narration, timeout_s, after_script, at_waypoint, fallback, save, starts_at_s, on_llm_unavailable)
- style-guide R1–R5 + world-bible canon (provisional, D10) · scenes/README "Fix pass A1" · tour.json regenerated
- validate: 19 scenes + tour.json all OK, 0 WARN
- reviews from the dry run: fact-check / rights / continuity / qa · fix-brief.md · narration-pass-A1.md · DIGEST.md (dry-run version, not yet updated)

QUEUE (studio/PRODUCTION.md):
- [x] A1 apply fix lists (14:00 + 17:00 runs)
- [x] A2 Engine/Tools: G-01…G-08 generated + player wired (20:00 / 23:00 / 01:00 runs) — weak points per `generated/g-0*/README.md` and manifest G rows
- [ ] A3 Content Preparer: M-50 reconcile, pin M-05/M-01/M-08/M-13 frames (02 side language, 18 "Look right" wait on this)  ← NEXT
- [ ] A4 Narrator cut-sheet + Publisher linear re-render + publish-record.md
- [ ] A5 light Fact-Checker + QA re-pass, DIGEST → "ready to publish (free tier)"

OPEN FOR THE FOUNDER (see journal "Provisional decisions"): D3–D11 as recommended; D12 Maps JS API key/billing owner (scene 04 counter);
Passepartout system prompt ≈ 350 words; 08/13 at ~2.5 w/s on stills.
A2 items for the founder/Rights: G-01 16:9 exports carry no source/credits line (linear cut) · G-08 licence line "CC BY-SA 4.0 (provisional, rights Q3)" · G-02 eye-line compromise accepted.
