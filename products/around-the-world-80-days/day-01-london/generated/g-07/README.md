# G-07 — carpet-bag game UI (scene 11 `pack-the-bag`, type `game`, 90 s)

Files
- `carpet-bag-game.svg` — the interactive UI, viewBox 2176×1812 (paper #efe6d3, ink #2a2118/#5b4a3a, one accent #b03a2e; Playfair Display for title/labels, Source Sans 3 for counter/button; no gradients/shadows). Fonts are not embedded: the player links `studio/player/fonts/fonts.css`; `svg2png.mjs` injects it.
- `carpet-bag-game_2176x1812.png`, `carpet-bag-game_1920x1080.png` — static export (initial state, for the linear cut / README).
- `src/make_g07.py` — generator (`python3 src/make_g07.py` rewrites the SVG; then `node studio/tools/svg2png.mjs carpet-bag-game.svg carpet-bag-game@.png "2176x1812,1920x1080" --bg "#efe6d3"`).

Contract (ids the player scripts against)
- root `svg#g07` `data-need="6"`, `data-tile-w="340" data-tile-h="280"`.
- `g.item#item-0 … #item-8` — one per option, in scene order: `data-option="0..8"` (index into `interaction.options`), `data-correct="true|false"`, `data-home="x y"` (rest position), `transform="translate(x y)"`, `tabindex="0" role="button" aria-label`. Each contains `rect.tile` (340×280) + a line glyph + a ≤ 5-word label; the full option text/feedback stays in the scene JSON. Class hooks: `.sel` (tapped, waiting for a bag tap), `.drag`, `.wrong` (accent dashed stroke, then snaps back), `.in` (packed).
- `g#bag[data-need=6]` — drop zone `rect#bag-drop` (1270,330 → 2110,1210, `pointer-events="all"`); `#bag-body`, `#bag-mouth`, `#bag-handle`; `g#packed` empty slot for the player to re-parent packed items; class `over` on `#bag` while an item is dragged over it.
- `text#counter` — "n of 6".
- `g#close-btn[role=button][tabindex=0]` — "Close the bag".

How the player drives it (studio/player/index.html v0.2, `wireG07`)
- Fetches the SVG text and inlines it into `#media` (so ids are live and the web fonts apply).
- Pointer-drag any `.item` (setPointerCapture; translates in SVG user units via `getScreenCTM().inverse()`); drop inside `#bag-drop` → if `data-correct` the item gets `.in`, is scaled ×0.5 and parked in one of six slots inside the bag body, counter → "n of 6", the matching checklist button in the panel is ticked; else `.wrong`, snaps back to `data-home` and the option's `feedback` line is shown in the panel and spoken.
- Tap alternative: tap an item (`.sel`) then tap the bag; keyboard: Enter/Space on a focused item selects it, Enter/Space on the bag/close button acts.
- "Close the bag" (SVG button or panel button) → the existing summary logic (`n of 6 right, k things Fogg would have left behind`). At scene end (90 s) the summary shows automatically.
- Panel checklist buttons remain the accessible alternative and stay in sync (button toggles ↔ item state).
