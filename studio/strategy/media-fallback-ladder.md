# Policy — Media Fallback Ladder (founder decision, 2026-08-19)

**Problem this solves.** Per-creator permission emails do not scale: 80 chapters × 4–6 clips means hundreds of
negotiations, each with a 14-day wait and a likely "no". Licensing must be an *optional upgrade*, never the thing a
chapter waits on.

**Rule.** The Content Preparer walks this ladder for every shot and stops at the first rung that yields usable,
licence-clean media. Only rung 5 involves a human. A chapter is never blocked: some rung always produces something.

| rung | source | licence basis | usable in player | usable in our MP4 |
|------|--------|---------------|------------------|-------------------|
| 1 | **Freely-licensed video** — YouTube filtered to Creative Commons, Wikimedia Commons video, Pexels / Pixabay / Videvo / Coverr, Internet Archive (PD), national archives | CC BY / CC0 / PD / permissive stock | yes | **yes** |
| 2 | **Open street-level imagery** — Mapillary, KartaView (crowd-sourced pano sequences; verify current terms per use) | CC BY-SA (confirm) | yes | **yes**, with attribution |
| 3 | **Stills + motion** — PD/CC photographs and archive plates with Ken Burns, parallax, then/now wipes, `window`-style parallax rooms | PD / CC | yes | **yes** |
| 4 | **Generated** — our own illustration, maps, diagrams (G-assets) in the world's style bible | ours (CC BY-SA 4.0) | yes | **yes** |
| 5 | **Licensed from a creator** — the outreach flow in `creator-outreach.md` | per agreement | yes | only after written permission + a file from them |
| — | *fallback* | **embed-only clip card** (creator credited, exact in/out shown) | embed | card stands in for the clip |

## Street View — important limit
Google Street View may be **embedded** (Maps Embed API, key + attribution) in the interactive player, and that is how
the `streetview` scene type works. It may **not** be screen-recorded, cached or pre-fetched into our rendered video —
Google Maps Platform terms forbid it (see `day-01-london/review/rights.md`). So for the linear cut, a "walk down the
street" shot resolves at **rung 2** (Mapillary/KartaView sequences, which we may render into video) or rung 3, not by
recording Street View.

## Consequences for the roles
- **Content Preparer:** search rungs 1–2 *first*, before proposing any embed-only YouTube clip. Every manifest row gets a
  `rung` column. Embed-only clips are marked "player-only" so the Publisher knows the video needs a substitute.
- **Rights:** verifies the rung, not just the item; confirms Mapillary/KartaView terms per campaign; owns the attribution manifest.
- **Publisher:** a chapter may render with rung-3/4 substitutes and be re-rendered later if a rung-5 licence arrives.
- **Engine:** needs a Mapillary sequence → video renderer (backlog) so rung 2 is actually executable.

## Status
Adopted 2026-08-19. Day 1 London was built before this policy: its five walking segments are embed-only (rung 6),
which is exactly the case the ladder exists to avoid. Re-sourcing Day 1's walks at rungs 1–3 is queued (A6).
