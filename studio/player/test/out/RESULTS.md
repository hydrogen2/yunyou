# smoke_generated — 2026-08-18T23:11:33.854Z · player https://localhost/player/

| scene | id | asset | result | detail |
|---|---|---|---|---|
| 03 | fogg-by-the-clock | G-04 | PASS | ✓ svg inlined in #media<br>✓ viewBox 0 0 2176 1812 rendered 768x620<br>✓ svg still in #media 2.5 s later (no late image clobber)<br>✓ tap #row-3 → option 2 picked, highlight in row=true<br>✓ feedback shown: "About 30 °C — Verne says 86 °F. This mor…"<br>✓ countdown cleared after pick (was pause_narration+timeout_s): ""<br>✓ console errors: 0<br>✓ failed requests: 0 |
| 10 | the-world-shrinks | G-01 | PASS | ✓ svg inlined in #media<br>✓ viewBox 0 0 2176 1812 rendered 768x620<br>✓ svg still in #media 2.5 s later (no late image clobber)<br>✓ layer reveal over time: 1 → 5 → 9 legs visible<br>✓ 9 .hit[data-leg] tap targets wired<br>✓ tap leg 6 → option 5 picked (correct=true), hit stroke=#b03a2e<br>✓ at 89 s the map is the day-01 state again<br>✓ console errors: 0<br>✓ failed requests: 0 |
| 11 | pack-the-bag | G-07 | PASS | ✓ svg inlined in #media<br>✓ viewBox 0 0 2176 1812 rendered 768x620<br>✓ svg still in #media 2.5 s later (no late image clobber)<br>✓ counter starts "0 of 6"<br>✓ drag #item-0 (correct) into bag → counter "1 of 6", .in=true, in #packed=true, checklist ☑<br>✓ drag #item-6 (wrong) → snapped to translate(88 900) [got translate(88 900)], .wrong=true, counter "1 of 6"<br>✓ wrong drop feedback: "There is no study and no books at Savile…"<br>✓ tap #item-1 then tap bag → counter "2 of 6"<br>✓ #close-btn → summary "2 of 6 right, 1 thing Fogg would have left behind.…", svg locked=true<br>✓ console errors: 0<br>✓ failed requests: 0 |

ALL PASS
