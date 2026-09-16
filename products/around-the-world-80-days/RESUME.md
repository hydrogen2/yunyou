# Where this stands — paused 2026-09-16

Picking up: read this, then `series/episode-01-topics.md` (the approved plan) and
`day-01-london/scenes/README-film.md` (what actually renders).

## Episode 1 · London — the bet
**15 scenes · 20:53 authored · 22:02 rendered · 112 slots, 87 pinned to a sentence · nothing pending.**
Every slot resolves to a real asset; the render log's last line is "nothing fell back". All 47 Commons
references were verified against the API (`studio/tools/verify_refs.py`) — run that before any render.

## ⚠ Three things are out of step, and they matter on day one back

1. **The master on disk is one fix behind the code.** `linear/day-01-london_en.mp4` (v10) has Verne framed
   on his whole face, but NOT the record-board fix committed in `bade1ea`. In that master, topic 2's board
   still reveals Bisland, Huld and the 1993 trophy while the voice is still on Nellie Bly.
2. **What is published is one fix behind that.** `www/review/` and `linear/topics/` were built from v9,
   before the Verne fix. The post-render job for v10 was interrupted.
3. **So: re-render before showing anyone anything.** One full render fixes all of it.

## The next command
```
python3 studio/tools/verify_refs.py products/around-the-world-80-days/day-01-london
python3 studio/tools/assemble_tour.py products/around-the-world-80-days/day-01-london
node studio/tools/render/render_linear.mjs products/around-the-world-80-days/day-01-london/tour.json --xfade-group 2
python3 studio/tools/render/split_topics.py products/around-the-world-80-days/day-01-london/linear www/review/topics/index.html
python3 studio/tools/render/review_page.py
```
**Budget about 50 minutes, not the usual 25.** The render cache and the TTS cache were both deleted to
reclaim disk (the box hit 99 % full), so every shot and all 151 narration lines are rebuilt from nothing.
`--xfade-group 2` is not optional on this machine: it is what keeps the assembly inside 3.8 GB of RAM.

## Open work, in the order I would take it
1. **The Mandarin cut is blocked.** `i18n/zh-Hans.json` still addresses the retired 12-scene structure, so
   `--lang zh` is deliberately refused. It needs rewriting against the 15 scenes, including the `quote`
   card — an untranslated quote silently renders English and only warns.
2. **No title and no thumbnail.** Never made, for any cut. D9 calls them part of the deliverable.
3. **Founder review was in progress, topic by topic.** Topics 1, 2, 3 and 15 have had notes and are fixed.
   Topics 4–14 have not been reviewed.
4. **Episode 2** (the Channel and the Alps) has research and scenes from the old day-based structure; it has
   not been rebuilt into topics and has never rendered.

## Things that cost time to learn, so they are written down
- `tour.json` embeds copies of the scenes. Edit a scene, then run `assemble_tour.py`, or the renderer
  refuses. `scenes/README-film.md`'s table is parsed as `| # | file | scene id | block | seconds | slots | …`
  and must agree with the scene files.
- Slot times are authored in seconds, but the voice's real pace comes from the synthesizer. Pin a picture to
  its sentence with `media[].on_sentence`; unpinned slots ride the warp between pins.
- A tall picture is top-anchored by default. A bust portrait needs `media[].focus_y` (Verne is 0.33) or its
  chin gets cut. A vertical pan only happens if a slot asks with `media[].pan`.
- Graphics that draw themselves (the map, the record board, the half-mile card) have no memory between
  slots. A continuation slot must list what is already on screen as `t: 0`, or it redraws from scratch.
- Captions convert numbers to digits for display only (`lib/numerals.mjs`); the script stays in words
  because the voice cannot tell a year from a quantity. Book titles are protected.

## ⚠ Do not stop the web server
`studio/research/prototypes/window/serve.py` on :443 serves **other projects too** — hilbert, midiman and
the console all live under `www/`. Never restart or kill it to pick up a change here: everything this
project publishes is a static file under `www/`, so writing the file is the whole deployment. The founder,
2026-09-16: "please note to not to stop the web server other projects using it".

## What was deleted to reclaim disk (all regenerable)
`linear/.cache` (4.3 GB), `studio/tools/render/.tts-cache` (267 MB), and two renders of retired content:
the Mandarin cut and the review animatic, both of the old 12-scene structure. The 1080p English master,
the small and tiny review copies and the 15 topic cuts are all still on the box.
