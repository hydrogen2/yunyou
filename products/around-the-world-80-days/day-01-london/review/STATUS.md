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
- [x] A5 light Fact-Checker + QA re-pass (2026-08-19): report `review/fact-check-a5.md` (pass-with-flags) **and its fixes applied**
      by Narrator + Scene Developer — see scenes/README.md "A5 fix pass". DIGEST → "ready to publish (free tier)" still pending A6.

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

## 2026-08-19 (A5 fixes applied — Narrator + Scene Developer) — RENDER STILL ON HOLD
`review/fact-check-a5.md` proposed; this pass **applied**. No render: the founder's hold stands until A6's footage lands.

Applied in `scenes/*.scene.json` (full per-scene list in `scenes/README.md` → "A5 fix pass"):
- **Clear-track qualifiers restored** — 02 Poole ("still here, at No. 15" → "at No. 15 since 1982", F-45; it had reinstated the A1 error and
  contradicted the pin on the same frame) and the dinner jacket (attributed to the firm, "the Prince of Wales", "the grandfather, they say", F-19);
  12 "sixpence a mile **— or part of a mile** … so call it one shilling: a 'bob'" (F-28) and "swell: a gentleman in good clothes" (F-31, was "rich");
  18 "the old roof, **probably in its last months** before it fell" (M-27's 1905 is a publication year); 10 the months that prove "within ten months"
  (November 1869 / May 1869 / March 1870, F-33); 08 Baring's "closed" → "failed" (F-23); 06 the Reform Act of 1832 (F-14) and "the architect's plan";
  09 "one travelling as Verne wrote, the other already home" (F-35/F-36); 13 the age list said in full.
- **08 the wager, both tracks, 60 → 70 s** — whist now reads "five fellow members — four hands at the table" (F-08: five usual partners, four hands
  play), so narration and the "card game for four players" chip agree; and the £55,000 robbery has a reason to be in the scene ("The talk turns to
  where such a man could hide now. And the Daily Telegraph has done the sums…", F-09 → F-10) so a newcomer cannot think the wager is about the thief.
  Media windows and overlay times re-spread; interactive chapter 1,275 → 1,285 s.
- **Glosses** — guinea corrected per **F-46** ("twenty-one shillings: a price, not a coin, by 1872"); orphan "Hook it!" chip removed (12);
  orphan "wager" chip kept but un-orphaned (the clear track now says the word once).
- **18's orphan "Verne says Sydenham" caption deleted** (its spine sentence went in A3n).
- **Register break closed** — `narration.after_script_variants.clear` (07, 10, 16, 17) and `narration.waypoint_script_variants.clear` (04);
  17's is a verbatim copy (persona-owned, R4); guide.md §8 carries the clear form of 16's reveal. Schema + `studio/templates/scene-spec.md` updated.
- **Cut sheet re-derived against the CLEAR track** (`studio/tools/render/cuts/day-01-london.json`) — the A4 tokens had been derived from the standard
  track, which is what produced the eight dangling references in fact-check-a5 §4. All eight are gone; caps raised 03 45→50, 08 70→75, 12 52→58,
  17 36→46; `--plan --track clear` shows **no end-cut**, total ≈ 854 s (14 min 14 s, was 13 min 13 s).
- validate: 19 scenes + tour.json **OK, 0 WARN**; tour.json reassembled from the scene files.

**Engine backlog opened by this pass (do not hand to Content/Narrator):**
1. `studio/player/index.html` — `pickScript()` must also swap `after_script` / `waypoint_script` via
   `narration.after_script_variants.<track>` / `waypoint_script_variants.<track>` (one line).
2. `studio/tools/render/render_linear.mjs` — same fallback when `--track clear`, plus the missing `after:N` cut-sheet token
   (07's "Half invented, half exact…", 10's "The train leaves for Dover at a quarter before nine.", 16's Verne rain quote are still absent from the film).
3. A per-track cut sheet (the tokens are correct for clear, approximate for standard).

**Open for the founder (one editorial call, from fact-check-a5):** the "Hook it!" line — give it to the cabby as a 4-word sound caption at 12 · 54 s
(F-31, the 1874 *All the Year Round* list, the only Cockney in the chapter), or let it live on a slang souvenir card. The chip is out until you say.

**Next: A6** (media re-sourcing) → A6w/A6e → then ONE render carrying both A5 and A6.


## 2026-08-19 — C1a landed; re-render in flight
Player: streetview mode `open` LIVE (Mapillary frames, 6x 360° pano, free; ladder open→embed→link; zero billable calls).
/watch: re-render started 10:04 UTC (scene 05 now uses `panowalk` frames). When it finishes: regenerate
`linear/watch.json` from the render log (16 chapters, `track: clear`) and tell the founder.

OPEN — needs Rights before anything ships publicly:
- **Mapillary licence is unresolvable from the API.** `fields=id,license` returns bare id; the entity endpoint 500s on
  `license`; `organization_id` absent on central-London images. Their terms say CC BY-SA by default but SOME content is
  CC BY-NC-SA, and NC is a hard stop for us (D4 puts our output under CC BY-SA). Every frame is currently classed
  `unknown` and only ships because a human passed `--accept-unknown-licence`; the burned credit says so honestly.
  Rights must rule: accept the platform default, or contact Mapillary, or drop to KartaView-only (which loses the Strand).

OPEN — content, not engineering:
- Scene 04 asks 91–112 m of street per 15 s beat (~7 m/s, bicycle). Walking pace needs longer beats or shorter legs —
  a Scene Developer/Rundown decision. Evidence: the same pipeline reads as a walk at the Reform stop (45 s, 3.5 m/s)
  and scene 15 (1.7 m/s). Fetcher now reports `pace` per stop; `frames.json` carries `pace_reads_as`.
- Stop w00 (Savile Row) falls back to `embed`: the cue names 7–8 Savile Row, 57–70° off every camera's heading there,
  and a flat photo holds ~70°. Correctly refused rather than pinning a label over the wrong building.


## 2026-08-19 — D6 applied to Day 1 (Scene Developer). RENDER IS THE FOUNDER'S.
Founder's instruction: scene 04 is transport, so it stops being a Street View walk — the step-counting moves onto the map and the street
footage just plays; the traveller is never asked to walk or to click. `DECISIONS.md` **D6**.

Done:
- **04 count-the-steps: `streetview` → `video`, 150 s (user-paced) → 94 s.** Beat A = the counting over M-30, the 1872 plan (575/576, 1,151
  steps, the six turns, 1,120 m ≈ a kilometre, 0.97 m a step, "he never hurries"). Beat B = the street playing plainly while the guide talks
  clubland — in the film the cached open imagery (`panowalk` stop 5, then stop 6, which stops in front of 104 Pall Mall on the frame C1a
  verified) plus the Travellers and Athenaeum façades; in the player the M-01 embed. `interaction.kind: walk`, the seven route waypoints, the
  "Tap ahead to step" prompt, `waypoint_script` and `waypoint_script_variants` are all gone. The seven `streetview` refs stay as **geometry**
  (the pano cache is indexed to them; they must stay seven and in order).
- **05 pall-mall-pass: RETIRED and deleted.** It was only ever the linear stand-in for that walk; once 04 works in both cuts the two scenes
  said the same words over the same pictures. Its media (M-01, M-67, M-20, M-69b, M-69a) moved into 04. File numbers 06–19 are unchanged, so
  they are now one ahead of the tour index.
- **15 look-up-the-cross: stays Street View, and is now a real stop-and-look.** Two finds stated out loud (the top of the 1865 replica cross
  overhead; the direction of Charles I, 200 m off, from whom London's distances are measured), `interaction.kind` walk → **look** with a 30 s
  budget, 25 → 47 s, `camera` cues kept and re-timed with butting holds. In the film it is a slow pan over the same imagery (the one stop in
  the chapter whose pace reads as a walk) — an adaptation, per D6, not a downgrade.
- **The film now carries the transport.** `studio/tools/render/cuts/day-01-london.json`: `pall-mall-pass` deleted, `count-the-steps` and
  `look-up-the-cross` added, tokens re-derived against the clear track. `--plan --track clear`: no dangling reference, no end-cut, no
  mid-thought drop. **Total ≈ 940.6 s of scenes (15:41) ⇒ finished MP4 ≈ 16:10, was 14:42.**
- tour.json reassembled (18 scenes); `validate.py` on 18 scenes + tour: **all OK**. One WARN survives and is stale, not a defect —
  "camera track on a video scene … will be ignored" predates C1a, where the renderer's `panowalk` started reading `camera` on any scene type.

NOT done, deliberately: **no render** (the founder's); `studio/player/index.html` untouched; `linear/watch.json` still names `pall-mall-pass`
in its chapter markers and must be regenerated from the new render log; `validate.py` untouched.

Engine backlog opened by this pass (one line each):
1. player — honour media windows in a `video` scene, so 04's map beat plays before the embed (today the player shows only the embed).
2. player — `tick()`'s `needsInput` exempts only `walk` on a streetview scene, so 15's `look` waits for ▶ instead of resolving on `timeout_s`.
3. `validate.py` — stop warning about `camera` on non-streetview scenes.

Closed by D6: **D12** (Maps JavaScript API key / billing for the step counter) — there is no counter any more, and the chapter's one Street View
stop runs on the free Maps Embed. Nothing in Day 1 needs a billable SKU.

Still open for Rights, and now load-bearing for the FILM rather than a retired player mode: the Mapillary per-image licence
(`--accept-unknown-licence`) under scene 04's street and scene 15's pan.
