# Publish Record — Day 1 · London (review animatic v2)

**Rendered:** 2026-08-19 06:29 UTC · **Tool:** `studio/tools/render/render_linear.mjs`
**Output:** `linear/day-01-london_review-animatic.mp4` — **13:49**, 1280×720 h264 25 fps + aac, faststart, 60.4 MB
**Subtitles:** `linear/day-01-london_narration.vtt` · **Chapters:** `linear/watch.json` (16 markers)
**Watch:** https://178-104-53-233.sslip.io/watch/around-the-world-80-days/day-01-london

## What changed since v1 (11:42, 2026-08-18)
- Narration is the **A3n newcomer rewrite**: the cold open now names Verne, Fogg, the bet and tonight's departure before
  anything else; Act I tells who lives on Savile Row before joking about Verne's error.
- **Cut sheet fully re-derived** (`studio/tools/render/cuts/day-01-london.json`). The old sentence indices were stale after the
  rewrite and were cutting payoffs: the Sheridan reveal, every route leg, the carpet-bag beat, the forgotten gas, the recipe;
  scene 16 had lost its narration entirely. Rule applied: keep the spine, drop only interactive-only prompts and connoisseur asides.
- **Generated assets (G-01…G-08) now appear** instead of "pending asset" cards — the route map, then/now split, timetable,
  memorandum, packing and souvenir cards.
- Length grew 11:42 → 13:49 **deliberately**: coherence over the original target, per the north star in `studio/PRODUCTION.md`.

## Tracks
- Rendered with the **standard** narration (Edge neural en-GB Ryan; Passepartout en-GB Thomas).
- The **clear-English** track (`narration.variants.clear`, all 19 scenes) exists but the linear renderer does not yet read it —
  Engine backlog item; a clear-English cut would be a second render target.

## Credits
Full attribution manifest: `review/rights.md` (§ credits page). In-film: attribution burned bottom-right while each
Wikimedia Commons item is shown, and repeated on the closing credits card; YouTube creators are named on their clip cards.

## Still blocking a public upload
1. **Licensed footage.** Five walking segments remain clip cards; YouTube embeds may not be downloaded or re-encoded
   (`review/rights.md`). Creator outreach list is drafted there — that is the gate for a real episode cut.
2. Digest Decision 1 (free vs paid) is unresolved; embeds may not sit behind a charge.
3. A5 (light re-review of the rewritten scripts) has not run.
