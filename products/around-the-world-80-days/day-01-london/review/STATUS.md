# Pipeline status — Day 1 London (updated 2026-08-19, A3n newcomer rewrite)

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
- [x] A3 Content Preparer (2026-08-19): M-50 reconciled — Commons images viewed: plate 05 IS Passepartout (plate 02 = title balloon); manifest row + scenes 03/17 already agree (the _02.jpg refs were pre-A1), no ref change needed. M-05/M-01/M-08/M-13 re-verified on live watch pages (chapters, descriptions, dates) + M-05's pinned sights-timestamps comment (No. 3 Savile Row ≈ 22:05, northbound entry confirmed) + M-08's timeline corroborated by all three auto stills (forecourt 05:00–~05:55) + M-13 first-leg chapters/split-frame/daylight confirmed. No scene timings changed (no evidence against them); validator all OK. Storyboards unreachable (player API LOGIN_REQUIRED), so five frame pins stay QA ON DEVICE: M-05 Nos. 14/15 legibility, M-01 No. 104 façade second (least certain — walker lingers 10:41 over ~450 m after 26:19), M-08 cross-fills-shot frame, M-13 window side (02 side-neutral language and 18 "Look right" therefore still wait on device QA, not on A3). See manifest third-pass notes + digest.
- [x] A3n newcomer rewrite (2026-08-19, Narrator + Scene Developer, per Audience Report #1 / "Assume no prior reading"): spine retold for a first-time reader — 01 cold-open now opens with the novel/Verne/Fogg's bet/tonight-he-leaves/we-travel-today in that order; 02 recast (plain telling first, Sheridan reveal after, title de-jokified); 06/08/10/11/12/13 light spine touches (names, stakes and period terms introduced before use); connoisseur asides (two-Ls spelling, Paris serialisation, Sydenham mis-route) moved to "go deeper" captions; `narration.variants.clear` added to all 19 scenes (16/17 copy persona lines verbatim, R4); 13 gloss chips (valet, clubland ×2, whist, wager, Bradshaw, hansom, swell, bob, Hook it, guinea, pea-souper, boat train); chapter `recap` written into tour.json; tour.json reassembled from scene files; validate 19+1 all OK, 0 WARN. Heavy: 01, 02, 08. Light: rest. Cut-sheet s:N tokens for 01/02/08/13/18 now stale → A4.
- [ ] A3-QA (on device, anyone with a signed-in browser): pin the five frames above  ← NEXT with A4
- [ ] A4 Narrator cut-sheet + Publisher linear re-render + publish-record.md
- [ ] A5 light Fact-Checker + QA re-pass, DIGEST → "ready to publish (free tier)"

OPEN FOR THE FOUNDER (see journal "Provisional decisions"): D3–D11 as recommended; D12 Maps JS API key/billing owner (scene 04 counter);
Passepartout system prompt ≈ 350 words; 08/13 at ~2.5 w/s on stills.
A2 items for the founder/Rights: G-01 16:9 exports carry no source/credits line (linear cut) · G-08 licence line "CC BY-SA 4.0 (provisional, rights Q3)" · G-02 eye-line compromise accepted.


## 2026-08-19 (interactive session)
A3 ✓ (media pins verified, M-50 confirmed) · A3p ✓ (player v0.3 newcomer aids) · A3n ✓ (newcomer rewrite, clear track, glosses, recap) · A4 ✓ (cut sheet re-derived, re-rendered 13:49, publish-record written).
**Next: A5** — light Fact-Check + QA pass on the rewritten scripts, then DIGEST update. Backlog: linear renderer ignores clear track/gloss; A3-QA on-device frame checks.

## 2026-08-19 (founder instruction) — RENDER HOLD
Founder wants ONE updated video containing BOTH the A5 language fixes AND the A6 footage replacement.
**Do not re-render /watch until both are applied.** Current live video (13:13, clear track, 07:05) stays up meanwhile;
the player is live-reading and already shows the newcomer rewrite + clear default.

Chain to complete before the next render:
1. A5 (running) — clear-track fact/QA review → apply its fixes to scenes/*.scene.json, re-validate.
2. A6 (running) — media re-sourcing proposal (manifest-a6.md) → then:
   a. A6w: wire rung-1 (freely-licensed video, downloadable) into scenes 02/05/06/13/18, replacing embed-only primaries;
      update manifest rows with rung + licence + attribution; Rights spot-check.
   b. A6e: Engine — Mapillary/KartaView sequence → video renderer for any shot with no rung-1 answer
      (confirm licence/API terms first; Street View may be embedded but NEVER recorded).
   c. Any shot still unresolved keeps its clip card; say so in the render log.
3. Re-render (clear track), refresh linear/watch.json, update publish-record.md, THEN notify the founder.
