# `panowalk` — open street-level imagery for the player AND the video

**Owner:** Engine / Tools · **Added:** 2026-08-19 (queue item C1a, "Path A") · **Player:** v0.5

One fetcher, one cache, two outputs. `fetch.mjs` pulls freely-licensed street-level frames for a chapter's
`streetview` walks and writes them under `<chapter>/media/files/panos/`. The player animates those frames in
streetview mode **`open`**; the linear renderer cuts the **same** frames with the **same** move via the visual kind
**`panowalk`**. The move itself lives in one file, `studio/player/panomove.mjs`, imported by both.

Google Street View may be embedded but never stored or put in our MP4. Open imagery may be — which is the whole
point of this tool.

---

## Cost

**Nothing here is billable.**

| provider | token | cost | notes |
|---|---|---|---|
| **KartaView** | none | free | `api.openstreetcam.org` 1.0 endpoints; image bytes via the imgproxy CDN |
| **Mapillary** | free token, **which this tool never creates** | free at our volume | used only if `www/config.json` already contains `mapillary_token` |
| Google | — | — | never contacted by this tool, at all |

RULE 0 / `DECISIONS.md` RULE 1: the studio does not sign up for services, accept terms, or create keys on the
founder's behalf. Without a token the fetcher prints `mapillary: not configured` and carries on with KartaView.

**To enable Mapillary yourself:** sign in at <https://www.mapillary.com/dashboard/developers>, "Register
application" (or use the client token it offers), copy the `MLY|…` token into `www/config.json`:

```json
{ "mapillary_token": "MLY|…" }
```

`www/config.json` is gitignored. Nothing else changes; re-run the fetcher and Mapillary sequences join the scoring.

---

## Run

```bash
# what is out there, and how good is it — downloads nothing
node studio/tools/panowalk/fetch.mjs \
  --chapter products/around-the-world-80-days/day-01-london \
  --scene count-the-steps --scene look-up-the-cross --dry-run

# fetch (see §Licence about the flag)
node studio/tools/panowalk/fetch.mjs \
  --chapter products/around-the-world-80-days/day-01-london \
  --scene count-the-steps --scene look-up-the-cross --accept-unknown-licence
```

Re-running is cheap: API answers are cached in `studio/tools/panowalk/.cache/` (gitignored) and any frame already
on disk is reused, so a second run downloads nothing.

| flag | default | meaning |
|---|---|---|
| `--chapter <dir>` | — | required |
| `--scene <id\|file>` | every `streetview` scene | repeatable / comma-separated |
| `--source kartaview\|mapillary\|both` | `both` | force one provider (useful to compare) |
| `--radius <m>` | 60 | search radius around each waypoint |
| `--max-frames <n>` | 14 | frames kept per stop |
| `--min-frames <n>` | 3 | fewer than this ⇒ the stop is unusable and must fall back |
| `--max-yaw <deg>` | 35 | how far a **flat** frame may be turned before a *named* look-at counts as unservable |
| `--web-width <px>` | 3072 | width of the web derivative made for the player (needs ffmpeg) |
| `--dry-run` | off | query, score, report; download nothing |
| `--accept-unknown-licence` | off | see §Licence |
| `--report <file>` | — | write the full report (all candidates, all scores) as JSON |

## Cache layout

```
<chapter>/media/files/panos/            # gitignored (products/**/media/files/*), regenerable, ~190 MB for Day 1
  index.json                           # what the player and the renderer read first
  <scene-id>-w<NN>/frames.json          # the stop's manifest: sequence, licence, author, per-frame geometry
  <scene-id>-w<NN>/f000.jpg             # original bytes — what ffmpeg cuts into the MP4 (360°: 5760x2880, ~1.5 MB)
  <scene-id>-w<NN>/f000.web.jpg         # 3072 px derivative — what the player streams (~0.4 MB)
```

`index.json` has two lists: `stops` (usable) and `missing` (with `status` and `why`). A stop that is not in `stops`
is a stop the player will serve from the free Maps Embed instead — no imagery is ever invented.

Per frame, `frames.json` records: `lat`, `lng`, `ref_heading` (the world bearing at the centre of the image),
`heading_stated`, `timestamp`, `w`/`h`, `projection`, `is_pano`, `licence`, `licence_class`, `author`, `source`,
`source_url` (the provider's page for that image) and `image_url` (provenance only — Mapillary's URLs are signed and
expire).

`ref_heading` is the number everything downstream turns on. It is **not** taken on trust from the provider:

* 360° frames → the camera compass (`computed_compass_angle`). Verified by rendering `count-the-steps-w06/f006` at
  `yaw = 168° − 245.8°` and getting the Reform Club's "104" doorway.
* flat frames → the **travel bearing** between consecutive frames of the same sequence. Provider headings lie:
  KartaView seq 1124 reports ~160° while the dashcam demonstrably looks along its 240° travel (frame 831, checked by
  eye), and Mapillary's `compass_angle` is often ~180° from its own `computed_compass_angle`.

---

## Licence rules

Our outputs are CC BY-SA 4.0 (`DECISIONS.md` D4). A NonCommercial or NoDerivatives frame would contaminate them, so
the gate is **per frame, not per platform** (`lib/licence.mjs`):

| class | what it is | what happens |
|---|---|---|
| `permissive` | CC0 / PD / CC BY / CC BY-SA | downloaded; licence + author recorded per frame |
| `restricted` | anything carrying NC or ND | **hard stop** — the whole sequence is dropped, not just the frame |
| `unknown` | the API states no licence | dropped, unless a human passes `--accept-unknown-licence` |

**KartaView** publishes one licence for all imagery, CC BY-SA 4.0 (`review/rights-a6.md` rules it green). Its API has
no per-image field, so its frames are tagged `licence_source: "platform-default"` and count as permissive.

**Mapillary has no per-image licence field at all.** Verified 2026-08-19 against the live API:

```
GET /images?fields=id,license&bbox=…   → 200, and every object comes back as {"id": …}: no licence key
GET /<image_id>?fields=…,license       → 500 {"message":"Tried accessing nonexisting field (license)"}
GET /images?fields=id,organization_id  → 200, organization_id absent on every image in central London
```

So there is no filter to apply and no org-vs-user proxy. Mapillary's Terms (15 Feb 2024) say other users' content is
CC BY-SA **by default** and that some content is served under CC BY-NC-SA — but the API will not tell you which.
Every Mapillary frame therefore comes back `unknown`, and only `--accept-unknown-licence` lets it through. When it
does, `frames.json` and the on-screen credit both say so in full:
`"CC BY-SA 4.0 (platform default — NOT stated per image)"`.

**Open for Rights:** does Mapillary's platform default cover us for a CC BY-SA output, given that the API cannot
confirm it per image? Until that is answered, Day 1's `open` walk is built on an unverified assumption, visibly
labelled. Mapillary also requires (contractually, on top of CC) that self-hosted images show the Mapillary mark and
link back to the image page: the player shows the word "Mapillary" as a link to the exact image page, because we do
not ship their logo file. Rights should confirm that a wordmark link is enough.

---

## How a sequence is chosen

Per waypoint: query both providers, group the frames by `sequence_id`, score, and take the best **single** sequence.
A stop's frames never mix providers or sequences — mixing sources inside one continuous move looks like a mistake.
When consecutive stops pick the same sequence, their frames are partitioned by nearest waypoint so no stretch of
street is walked twice, and the stops read as one leg.

Score (`lib/score.mjs`, all components printed by `--dry-run`):

| component | max | what it rewards |
|---|---|---|
| coverage | 40 | frames inside the radius |
| spacing | 25 | peaks at 6 m between frames; a 25 m dashcam scores ≈ 0 |
| span | 15 | ground actually covered (a standing burst is not a walk) |
| direction | 15 | the imagery travels the way the traveller walks |
| pano | 20 | a 360° frame can honour *any* `camera` cue |
| pedestrian | 15 | implied speed between frames ≤ 2.5 m/s |
| recency | 20 | decays over ~6 years |
| target | 14 | how close the sequence gets to a place a cue **names** |
| continuity | 12 | same sequence as the previous stop |
| penalty | −25 | imagery running against the walk (not applied to 360°, which can be reversed) |

A stop is rejected — and must fall back — when:

* **no coverage** (`no-coverage`), or fewer than `--min-frames` frames;
* **off-cue** (`off-cue`): a `camera` cue *names* a place (`look_at`) that no candidate's frames can be turned onto.
  A flat photograph holds about 70°, so a 57° turn is not available. Faking it would put the pin "Reform Club" over
  a picture of something else, so the stop goes to `embed` instead.

## Day 1 result (2026-08-19)

| stop | source | sequence | frames | spacing | span / screen time | pace | date | 
|---|---|---|---:|---:|---|---|---|
| `count-the-steps-w00` Savile Row | — | — | — | — | — | — | **off-cue → embed**: no frame turns 57–70° onto 7–8 Savile Row |
| `count-the-steps-w01` Burlington Gdns | mapillary | `GNCMksZ65RXHix0bfTKotI` | 14 | 8.9 m | 91 m / 15 s | 6.1 m/s — hyperlapse | 2022-02-23 |
| `count-the-steps-w02` Old Bond St | mapillary | `txqvAgRwn1YEOie7fI6sLd` | 14 | 8.3 m | 108 m / 15 s | 7.2 m/s — hyperlapse | 2024-09-19 **360°** |
| `count-the-steps-w03` Piccadilly | mapillary | `oywbMWXgNan8U1kPLq2Qpv` | 14 | 7.9 m | 111 m / 15 s | 7.4 m/s — hyperlapse | 2026-06-16 **360°** |
| `count-the-steps-w04` St James's St | mapillary | `Sx3G6T8ksr5enAm47adDbE` | 14 | 8.7 m | 112 m / 15 s | 7.4 m/s — hyperlapse | 2024-09-19 **360°** |
| `count-the-steps-w05` Pall Mall corner | mapillary | `Sx3G6T8ksr5enAm47adDbE` | 14 | 10.1 m | 107 m / 15 s | 7.2 m/s — hyperlapse | 2024-09-19 **360°**, same leg as w04 |
| `count-the-steps-w06` the Reform | mapillary | `JhVerKzIuOMLq1PbWpil4Z` | 14 | 12.1 m | 158 m / 45 s | 3.5 m/s — brisk walk | 2024-04-10 **360°**, all three club cues reachable |
| `look-up-the-cross-w00` Charing Cross | mapillary | `ctrzEaPC8S2q1DQvsiupmL` | 14 | 2.7 m | 44 m / 25 s | **1.7 m/s — a walk** | 2025-08-10 **360°** |

98 frames, 186 MB of cache (+23 MB of API cache). KartaView alone would have covered 6 of 8 stops at 11–22 m dashcam
spacing, with none of the named cues reachable and **zero** coverage on the Strand. Mapillary won every stop.

### Does it read as a walk? Honestly: mostly not, and that is the scene's fault, not the imagery's

The frames are walking-grade — 2.7 to 12.1 m apart, most of them 360°, most captured 2024–2026. But scene 04 asks
for 91–112 m of street in each 15-second beat, which is **6–7 m/s: a bicycle**. No source on earth makes that read as
a man who never hurries. Where the beat is long enough the same pipeline does read as a walk: the Reform Club stop
(45 s) at 3.5 m/s, and scene 15 (25 s over 44 m) at 1.7 m/s, which is a walking pace exactly.

So the fetcher now prints `pace` per stop and `frames.json` carries `pace_ms` / `pace_reads_as`. The cure is a
content decision, not an engineering one: give the leg more seconds, or shorten the leg.
Cross-fades (~0.5 s) and the drift inside each frame soften the jumps a lot — at 1.07 s per frame it reads as a
smooth time-lapse rather than a slideshow — but it is not a walk.

## Using the frames in the video

`studio/tools/render/render_linear.mjs` gained the visual kind `panowalk`:

```json
{ "kind": "panowalk", "scene": "count-the-steps", "stops": [5, 6], "dur": 8,
  "fallback": { "kind": "footage", "media": "M-67" } }
```

`scene` defaults to the scene being cut; `stops` defaults to every cached stop of that scene. With no cache the
`fallback` visual is used (and a warning goes in `render-log.md`), so a clean checkout still renders. A `streetview`
scene with no cut-sheet hint now renders the walk automatically when frames are cached, and the old "Street View stop
card" only when they are not.

ffmpeg cannot animate a crop, so the turn is quantised to one value per source frame (evaluated at its midpoint)
while the player interpolates continuously. Frame timing, the cross-fade and the drift are identical.

## Files

```
studio/tools/panowalk/fetch.mjs          the CLI
studio/tools/panowalk/lib/kartaview.mjs  no-token adapter (1.0 endpoints + the imgproxy CDN URL form)
studio/tools/panowalk/lib/mapillary.mjs  token adapter, inert without one; 360° aware
studio/tools/panowalk/lib/licence.mjs    the per-frame gate
studio/tools/panowalk/lib/score.mjs      sequence scoring, frame selection, honest verdict strings
studio/tools/panowalk/lib/geo.mjs        haversine, bearings, bbox, a 30-line JPEG header reader
studio/player/panomove.mjs               THE move: frame timing, window geometry, drift, cue retargeting
studio/player/test/smoke_panowalk.mjs    headless proof, including "zero billable Google calls"
```
