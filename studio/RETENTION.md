# What must be kept — Yunyou

Borrowed wholesale from `~/hilbert/episodes/RETENTION.md`, whose lesson we are about to need:

> **A cut cannot be regenerated.** When a commit changed the Mandarin prosody, every Chinese duration shifted, the
> length-keyed cache invalidated, and the re-render came out a *different cut* from the one that had been published.

"Regenerate from source" assumes the same model, the same code, the same ffmpeg. Change one and you get *a* video,
not *the* video. That risk is sharper for us than for hilbert, because **our voice comes from hilbert** — we call
`~/hilbert/studio/tts.py`, a repo we do not control and whose own docs record it changing under a caller once.

## Our exposure today (2026-09-08) — nothing published is backed up

| what | size | in git? | recoverable? |
|---|---|---|---|
| `products/**/linear/*.mp4` — **the product** | 1.4 GB | **no** (gitignored) | only by re-render, i.e. not faithfully |
| `products/**/media/files/` — downloaded masters | 518 MB | **no** (gitignored) | no: Commons/Archive URLs rot, and some sources already vanished once |
| `.tts-cache/` | — | no | yes, if hilbert's model and prosody are unchanged |
| scenes, tour.json, manifests, cut sheets, all studio code | 1.5 MB | **yes** | yes |

Losing this machine today costs **every rendered episode and every sourced asset**. It does not cost the studio.

## Rules
1. **Once an episode is published, its exact MP4 is irreplaceable.** Copy it somewhere off this box before publishing.
2. **Keep `media/files/` too.** The manifest records author, licence and page URL — enough to *credit* an asset,
   useless to *recover* one that has been deleted upstream. Day 1 already lost a YouTube CC licence row between passes.
3. Pin what the voice depends on: hilbert's kokoro model files and its prosody revision. A change there changes our cuts.
4. Safe to delete: per-scene work files, screenshots, rejected candidates, the TTS cache.
