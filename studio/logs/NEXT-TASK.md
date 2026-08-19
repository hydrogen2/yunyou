# NEXT TASK (founder instruction, 2026-08-19 ~10:15 UTC)

**Goal: a full `/watch` cut that CONTAINS the street walking.** Today's video has no walk at all — scenes 04
(`count-the-steps`, Savile Row → the Reform Club) and 15 (`look-up-the-cross`) are marked interactive-only, and
scene 05 is a substitute. C1a now makes the walk renderable into video (`panowalk` visual kind, cached Mapillary
frames under `products/**/media/files/panos/`, shared move module `studio/player/panomove.mjs`).

## Do, in order
1. **Re-pace scene 04 before putting it in the film.** It currently asks 91–112 m of street per 15 s beat (~7 m/s,
   a bicycle) — the frames are walking-grade, the scene timing is not. Fix by lengthening the beats or shortening the
   legs so each stop plays at ~1.5–3.5 m/s. Evidence it works: the Reform stop (45 s → 3.5 m/s) and scene 15
   (1.7 m/s) already read as a walk. `studio/tools/panowalk/fetch.mjs` prints `pace` per stop; `frames.json` carries
   `pace_reads_as`. This is a Scene Developer / Rundown decision — keep the words, change the timing.
   Note stop w00 (Savile Row) legitimately falls back to `embed` (the named building is 57–70° off every camera
   heading there); decide whether the linear cut skips that leg or uses a still.
2. **Add scenes 04 and 15 to the linear cut**: `scenes/README.md` linear table + `studio/tools/render/cuts/day-01-london.json`
   (visual kind `panowalk`). Scene 05 may become redundant once 04 is in the film — check for duplication with
   the Pall Mall material and cut or shorten it.
3. **Re-render** `cd studio/tools/render && node render_linear.mjs <tour.json> --track clear`, then regenerate
   `linear/watch.json` from the render log (chapters = the `at` column; set `track: clear`), and update
   `review/publish-record.md`.
4. Tell the founder the new duration and what the walk looks like — honestly: walk or hyperlapse, per stop.

## Constraints
- **RULE 1: never incur cost.** Player/renderer must stay on free paths (`open` → `embed` → `link`); billable Google
  SKUs are gated behind `billing_ack` and the founder's key no longer permits them. Never create accounts.
- Do not screen-record or cache Google Street View; open imagery only in the MP4.
- Server must be up for renders (it screenshots the player): if 443 is dead, restart with the letsencrypt cert
  (see `studio/tools/studio_run.sh`).

## Still open (do NOT block on these)
- **Rights: Mapillary licence.** Their API exposes NO per-image licence field (verified). Terms say CC BY-SA by
  default, some CC BY-NC-SA; NC is a hard stop under D4. Frames are classed `unknown` and ship only behind
  `--accept-unknown-licence`, with an honest burned credit. Must be settled before any PUBLIC release.
- Founder feedback on the writing/pacing of the current cut is still the highest-value input.
