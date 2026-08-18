# G-08 — Souvenir recipe card "Fogg's last breakfast" (scene 19-souvenir; exportable/shareable image)

Files: `souvenir-breakfast-card_1080x1920.svg` + `.png` (portrait, phone/story), `souvenir-breakfast-card_1920x1080.svg` + `.png` (landscape), `souvenir-breakfast-card.svg` = byte-identical copy of the landscape SVG (the ref used by the scene). `src/M-23.jpg` + `src/SOURCE.md` = the vignette source (Commons, PD), embedded in the SVGs as a base64 data URI (grey-scaled with an SVG saturate filter, 85 % opacity) so the exported image is self-contained.
Rebuild (SVG + PNG, from repo root): `node studio/tools/gen/cards_day01.mjs g-08` — all text lives in the DATA block at the top of `studio/tools/gen/cards_day01.mjs`; the SVGs here are build output, do not hand-edit. PNG export uses `studio/tools/svg2png.mjs` (playwright-core chromium, house fonts from `studio/player/fonts/fonts.css`, `--bg #efe6d3`).

Facts on the card: menu quotation ("a broiled fish with Reading sauce … for which the Reform is famous.") and "chapter III", the meal on Wednesday 2 October 1872 at the Reform Club — F-06 (Towle 1873, PD); Reading sauce: James Cocks, fishmonger, Reading, from 1802, ingredients walnut and mushroom ketchup, soy, anchovies, chillies, garlic, gone since the 1960s — F-27; last line "Cook it on the evening of 21 December, and be at table by 8:45 pm." — scene media note / F-11 (Saturday 21 December, a quarter before nine p.m.); motto "A well-used minimum suffices for everything." — F-11; "the meal before the wager" — F-06/F-11 (ch. III, same day). Title per rights note: "Fogg's last breakfast" (not "Phileas Fogg" as a brand). Method sentence ("Simmer everything together until glossy; broil the fish and spoon the sauce over.") is our own prose — one sentence, no lifted recipe text.

Left off the card (not in the fact sheet): "spices" from the media note — F-27 does not list spices, so the ingredient list stops at garlic. No quantities are given (F-27 has none).

Credits are ON the card (it circulates as an image): "Yunyou · Around the World in 80 Days · Day 1 London · vignette: London Interiors (1841), PD" and "Text © Yunyou 2026 — CC BY-SA 4.0 (provisional)" (rights.md Q3 open; Editor-in-Chief's provisional choice — change `G08.footer2` in the generator when decided).

Style: cream/ink, one accent rule (header) + one accent rule before the last line; Playfair for title/menu/dish, Source Sans 3 for dates, ingredients, footer.

Known limits: the SVGs are ~95 KB each because of the embedded vignette; portrait leaves ~120 px of paper above the footer by design (safe area for story UIs). No QR/URL on the card yet (no public URL decided).
