# `media/files/` — local, licence-clean footage (NOT committed)

**Written by:** content-preparer · **Date:** 2026-08-19 (queue item A6w / "A8" in the notes)

This directory is in `.gitignore` (`products/**/media/files/`). Nothing here is source of truth: every file is
**regenerable** from `../manifest.md`, which records, per media id, the exact source URL, the licence, the attribution
string and the ffmpeg recipe below. If the directory is empty the linear renderer falls back to a pending-asset card
for that shot (`render_linear.mjs`, `footageSeg`), so a clean checkout still renders.

## Layout

```
files/
  src/                      as-downloaded originals (267 MB) — Commons WebM/Ogg, Prelinger MP4, KartaView JPEGs
  src/kv_savile/            13 KartaView frames, seq 1123901 idx 1767–1779
  src/kv_pallmall/          11 KartaView frames, seq 1124  idx 828–838
  *.mp4                     normalised for the renderer: h264 High, 1280×720, 25 fps, yuv420p, no audio (65 MB)
  panos/                    open street-level frames for the streetview walks (186 MB) — see below
```

## `panos/` — the open-imagery walk (added 2026-08-19, player v0.5 / queue item C1a)

Written by `node studio/tools/panowalk/fetch.mjs --chapter <this chapter> --scene <id>` and read by BOTH the player
(streetview mode `open`) and the linear renderer (visual kind `panowalk`). Also gitignored and also regenerable; the
fetcher reuses whatever is already on disk, so a re-run downloads nothing.

```
panos/index.json                  usable stops + a `missing` list saying why each other stop falls back
panos/<scene-id>-w<NN>/frames.json  sequence, licence, author, and per-frame lat/lng/ref_heading/timestamp/source_url
panos/<scene-id>-w<NN>/f000.jpg     original bytes (360°: 5760×2880) — what ffmpeg cuts into the MP4
panos/<scene-id>-w<NN>/f000.web.jpg 3072 px derivative — what the player streams
```

Day 1: 98 frames over 7 stops, all Mapillary (six of them 360°), 2.7–12.1 m between frames. Full table, the licence
rules and the one open Rights question (Mapillary states no per-image licence) are in
`studio/tools/panowalk/README.md`.

## Hard rules obeyed when fetching

1. **Nothing was downloaded from youtube.com.** `review/rights-a6.md` §1.2 rules that the CC BY grant covers the
   *content* but YouTube's ToS forbids the *means*. Every video file here came from `upload.wikimedia.org`,
   `archive.org` or `cdn.kartaview.org`.
2. **Audio is stripped from every normalised file** (`-an`). `rights-a6.md` §1.1: a CC-marked upload's soundtrack may
   be third-party. `manifest-a7.md` flags M-79 explicitly ("*added in sound for ambiance*"). Beds come from the
   chapter's own CC0/PD audio (M-40…M-61), mixed by the renderer.
3. **4:3 archive film is pillarboxed, never stretched** — scaled to 960×720 and padded to 1280×720 on a dark plate
   (`0x14110D`) with a 2 px warm rule at each seam.
4. **The 1890 Donisthorpe frames stay an inset disc.** The source is 270×270; it is composited at 540×540 (2×) inside
   a circular alpha mask on a dark 1280×720 plate. It is never scaled to full frame (2.7× would be mush).

## Recipes

`FF=studio/tools/render/node_modules/ffmpeg-static/ffmpeg`
`N16="scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,fps=25,format=yuv420p"`
`PB="scale=960:720:flags=lanczos,unsharp=5:5:0.45,pad=1280:720:160:0:color=0x14110D,drawbox=x=158:y=0:w=2:h=720:color=0x8A7A5E@0.7:t=fill,drawbox=x=1120:y=0:w=2:h=720:color=0x8A7A5E@0.7:t=fill,setsar=1,fps=25,format=yuv420p"`

| output | source in `src/` | recipe |
|---|---|---|
| `m66-savile-row-hyperlapse.mp4` (7.3 s, 12.2 MB) | `kv_savile/003…012` (idx 1770–1779) | per frame: `crop=2400:1350:96:150, eq=brightness=0.055:contrast=1.12:saturation=1.05, scale=1600:900, zoompan` (1.0 s hold, slow push), chained with `xfade=fade:duration=0.30`; `unsharp=5:5:0.5` |
| `m67-pall-mall-hyperlapse.mp4` (8.0 s, 16.3 MB) | `kv_pallmall/000…010` (idx 828–838) | as above with `crop=2900:1631:182:132, eq=brightness=0.02:contrast=1.06` |
| `m84-trafalgar-square.mp4` (16 s, 7.8 MB) | `m84_trafalgar_720.webm` | `-ss 96 -t 16 -vf "$N16" -an -crf 21` |
| `m89-piccadilly-circus.mp4` (10 s, 5.5 MB) | `m89_piccadilly_720.webm` | `-ss 8 -t 10 -vf "$N16" -an -crf 21` — **spare, not wired into any scene** |
| `m88-hungerford-bridge-night.mp4` (11.9 s, 7.2 MB) | `m88_hungerford_night.webm` | whole file, `-vf "$N16" -an -crf 21` |
| `m78-strand-1903.mp4` (20 s, 7.7 MB) | `m78_old_london_1903.webm` | `-ss 117 -t 20 -vf "$PB" -an -crf 20` |
| `m78-london-traffic-1903.mp4` (22 s, 10.3 MB) | `m78_old_london_1903.webm` | `-ss 160 -t 22 -vf "$PB" -an -crf 20` — **spare, not wired into any scene** |
| `m81-trafalgar-1890-disc.mp4` (8.8 s, 1.6 MB) | `m81b_traf1890_double.ogv` | `-stream_loop 1` over a `color=0x0E0C0A:1280x720` plate; `scale=540:540, format=rgba, geq(a = circle r 264), overlay` centred |

The hyperlapse builder is `scratchpad/hyper.py` in the A6w session; the two `crop`/`eq` strings above are the only
per-sequence parameters, so it is a five-line script to re-create.

## Downloaded but not normalised (kept in `src/` as period spares)

`m79_trip_streets_1917.webm` (1280×720 native, 6:13, PD — **mute: uploader added a soundtrack**),
`m80` was **not** downloaded (British Pathé; `rights-a7`/`manifest-a7` decision 3 is open),
`m82_year_was_1912.webm` (640×480, 5:32, PD, thin provenance),
`m83_seeing_london_1920.mp4` (Burton Holmes, Prelinger, 13:55, PD),
`m81_traf1890.gif` + `m81b_traf1890.ogv` (the single-speed Donisthorpe fragments).

## Not fetched, and why

- **M-87** POPtravel *Walking in LONDON* (1.90 GB; 1.09 GB as the Commons 720p transcode). Probed by range-seeking
  three frames at 21:00 / 22:00 / 23:00 — the walker is **on Waterloo Bridge**, not on the Strand, through that whole
  window, and the Strand it eventually crosses is the Aldwych end, ~800 m from Charing Cross. Rejected on content, not
  on rights. (`ffmpeg-static` segfaults on `https://` in this sandbox; the probe went through a local plain-HTTP
  range-forwarding proxy. Worth a studio tool if anyone needs to trim a 2 GB Commons file again.)
- **M-91** *London City Tour* (3.36 GB, 4K, 25:41, CC BY 3.0). It is the only lead for a Pall Mall façade pass, but
  scene 05's redesign was approved, so the shot is no longer needed and 3.4 GB of speculative download was not spent.
  If the founder wants scene 05 back at 76 s, this is the one file to check.
- **M-85 / M-86** (Pexels, Mixkit): M-84 already covers Trafalgar Square from a source whose licence we have read in
  full; Mixkit's licence text is still unread (`manifest-a7.md` decision 2).
