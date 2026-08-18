# G-04 — Fogg's timetable card (scene 03-fogg-by-the-clock)

Files: `fogg-timetable-card.svg` (viewBox 2176×1812, fold-open), `fogg-timetable-card_2176x1812.png`, `fogg-timetable-card_1920x1080.png` (letterboxed on cream).
Rebuild (SVG + PNG, from repo root): `node studio/tools/gen/cards_day01.mjs g-04` — all text lives in the DATA block at the top of `studio/tools/gen/cards_day01.mjs`; the SVGs here are build output, do not hand-edit. PNG export uses `studio/tools/svg2png.mjs` (playwright-core chromium, house fonts from `studio/player/fonts/fonts.css`, `--bg #efe6d3`).

**Contract for the player (tap-to-find):** six groups `<g class="row" id="row-1"…"row-6" data-option="0"…"5" role="button" tabindex="0" aria-label="…">`, each with a full-width transparent hit rect `rect.hit` (x 132–2044, height 172 px at 2176×1812 — ≥ 44 px at any sensible scale). `data-option` = index into `interaction.options[]` of the scene. The card shows only the time (Source Sans 3, numerals) + am/pm/midnight tag + the short label (Playfair) — **no feedback text**; the guide reads `options[i].feedback` after the tap. Inline `<style>` gives a 7 % ink hover/focus tint on the hit rect when the SVG is inlined (inert inside `<img>`). Order of rows = order of options.

Facts on the card: times and labels — F-02 (rises 8:00, tea and toast 8:23, shaving-water 9:37, Passepartout engaged 11:29, leaves for the Reform 11:30, home at midnight; Wednesday 2 October 1872); header address "No. 7 Savile Row, Burlington Gardens" — F-01 (Verne spells it "Saville"; modern spelling used outside quotes). Labels are the scene's option text after the dash. Footer "The same, every day — chapters I–II" (F-02).

Style: cream #efe6d3 / ink #2a2118 / secondary #5b4a3a; the single accent #b03a2e is the rule under the header. Playfair Display (title, labels), Source Sans 3 (times, header line, column heads).

Known limits: am/pm tags are an addition for clarity (F-02 gives the times as clock times; "midnight" is F-02's own word). No Passepartout art on this card — M-50 is a separate media item in the scene. Hover tint needs the SVG inlined, not `<img>`.
