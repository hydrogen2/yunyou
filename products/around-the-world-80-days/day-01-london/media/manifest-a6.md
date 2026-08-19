# Media Manifest — Day 1: London — **A6 re-source of the five embed-only walking shots**

**Content Preparer:** content-preparer   **Date:** 2026-08-19 (queue item A6)   **Status:** proposals — none of the
new ids below is wired into a scene yet. Companion to `manifest.md` (M-01…M-61); ids continue at **M-62**.

**Inputs read:** `studio/roles/_common.md` · `studio/roles/content-preparer.md` (Media Fallback Ladder paragraph) ·
`studio/strategy/media-fallback-ladder.md` · `media/manifest.md` · `scenes/README.md` · `review/rights.md`.

**The problem A6 exists to fix.** Scenes 02, 05, 06, 13 and 18 all resolve to YouTube videos under the Standard
YouTube Licence, so the rendered MP4 substitutes a clip card for each. This pass walked rungs 1 → 2 → 3 for each shot.

---

## Headline

**The single biggest result is not a new video: `ME-x2yWqoiw` (M-13, Ian Payne Urban Transport) is published under
"Creative Commons Attribution licence (reuse allowed)".** Verified today on the live watch page — the licence row is
present in `videoSecondaryInfoRenderer.metadataRowContainer`. Scene 18 therefore resolves at **rung 1 with the shot we
already chose**, and the Rights-blocked "crop to the left half" becomes legal on a self-hosted copy.

The Charing Cross walk (scene 13) also resolves at rung 1: the **Urban Pigeon** channel publishes its 4K
"Station to Station" London walks under CC BY, and four of them cover the Strand / forecourt / Eleanor Cross.

Pall Mall (scenes 05/06) is the one that does not resolve cleanly. See "what still has no clean answer".

---

## How things were verified (2026-08-19)

- **YouTube CC filter.** `https://www.youtube.com/results?search_query=<q>&sp=EgIwAQ%3D%3D` (the "Creative Commons"
  filter). The filter is *not* trusted on its own: every id below was opened at `https://www.youtube.com/watch?v=<id>`
  and the **licence row read from the page**. A CC video shows a metadata row `Licence → "Creative Commons Attribution
  licence (reuse allowed)"`; a Standard-licence video shows **no licence row at all**. Control check:
  `WQCsxb2dMgQ` (M-01), `tFaUD2llMJg` (M-05), `VIjDXClopyE` (M-08) → **no licence row = Standard YouTube Licence**,
  confirming they are correctly marked player-only. `ME-x2yWqoiw` (M-13) and `BJ3KDkHUCXg` → CC BY.
- **KartaView.** `POST https://api.openstreetcam.org/1.0/list/nearby-photos/` (no token) at seven coordinates, then
  `POST .../1.0/sequence/photo-list/` for full sequences, then `GET https://api.openstreetcam.org/2.0/photo/?sequenceId=…`
  for image URLs. Frames were **downloaded and looked at** (Savile Row idx 1774, Pall Mall idx 831) — this is the only
  rung where I have actually seen the pictures rather than metadata.
- **Mapillary.** Terms read at `https://www.mapillary.com/terms` (effective 15 Feb 2024) and the developer docs at
  `https://www.mapillary.com/developer/api-documentation`. `graph.mapillary.com` without a token returns
  `{"error":{"message":"Invalid OAuth 2.0 Access Token","code":190}}` — **coverage could not be verified from this
  environment.** Marked unverified, not assumed.
- **Wikimedia Commons.** `action=query&generator=search&gsrnamespace=6&prop=imageinfo&iiprop=extmetadata` — licence
  strings and pixel sizes are as the API returned them.
- **Internet Archive.** `advancedsearch.php` twice (London + movies, 1895–1945). Nothing usable found — see below.

---

## Per-shot result

| shot (scene) | rung reached | source | licence (exact string, as stated by the source) | confidence | what the Engine needs to use it |
|---|---|---|---|---|---|
| **02 Savile Row / Burlington Gardens corner** (was M-05, player-only) | **1 (probable) / 2 (certain)** | **M-62** `hZsfxBonTHg` Offbeat Destination, "🇬🇧 London Mayfair Walking Tour \| Most Expensive Street \| 4k", 35:50, 24 Oct 2024 — description route: *Piccadilly Circus / **Savile Row** / Grosvenor Square / Mount Street Gardens / Berkeley Square* — **plus** **M-66** KartaView seq **1123901**, frames idx **1767–1779** | YouTube: "Creative Commons Attribution licence (reuse allowed)" (read on the watch page) — i.e. CC BY 3.0 per YouTube's implementation · KartaView: **CC BY-SA 4.0** | **medium** for M-62 (no chapters — the Savile Row minute is not pinned; burned-in channel logo top-left; 28 views ⇒ deletion risk). **high** for M-66 (I viewed the frames: it *is* Savile Row) | M-62: self-hosted trim, in/out to be pinned by QA, logo crop or accept it, attribution "Offbeat Destination, CC BY". M-66: sequence→video renderer, crop dashboard (keep top ~72 % → 16:9), stabilise, interpolate 13 frames → 5–8 s, burn "© KartaView contributors, CC BY-SA 4.0" |
| **05 Pall Mall westbound past Athenaeum / Travellers / Reform** (was M-01, player-only) | **2 (short insert only) + 3** | **M-67** KartaView seq **1124**, frames idx **828–838**, shot 2016-03-25 — westbound past the club fronts, 3264×2448, sunny; **M-69** geograph club façades (rung 3); **M-68** `4Fx_LD4HOYI` is a *possible* rung-1 answer but its route may join Pall Mall west of the clubs | KartaView: **CC BY-SA 4.0** · geograph via Commons: **CC BY-SA 2.0** · M-68 YouTube: "Creative Commons Attribution licence (reuse allowed)" | **high** that M-67 exists and shows Pall Mall clubland (frame viewed); **low** that any rung 1–3 source can carry a **76-second** continuous façade pass | Same sequence→video renderer. 11 frames over ~270 m ≈ 25 m spacing → **5–8 s of screen time, not 76 s**. Rest of the beat needs Ken Burns over M-69 / the existing G-02 Reform alternate |
| **06 the Reform Club door / façade** (was M-01, player-only) | **3** | Already-owned **M-20** (geograph façade), **M-22** (Barry north elevation, PD), **M-23** (1841 saloon, PD) + **M-69c** `File:The Reform Club, Pall Mall - geograph.org.uk - 2317843.jpg` | M-20/M-69c **CC BY-SA 2.0**; M-22/M-23 **Public domain** | **high** | Nothing new: this beat was never a walk. Slow push / Ken Burns on a still, with the BY-SA images shown **unmodified** (Rights rule) — so the push must be a letterboxed pan-and-scan on an unmodified frame, or use the PD engraving for anything cropped |
| **13 Trafalgar Sq → Strand → Charing Cross forecourt + Eleanor Cross** (was M-08, player-only) | **1** | **M-70** `tProPV0SOSs` Urban Pigeon, "Charing Cross to Westminster: Tourists, Power and Horses (Station to Station)", 25:37, 14 Sep 2025, 4K/24 fps — creator chapters **00:00 Charing Cross Station · 00:52 Strand · 02:52 Trafalgar Square**; and **M-71** `3g41GwCnW80` "Embankment to Charing Cross", 13:39, 10 Jun 2025 — chapters **10:14 Villiers Street · 12:30 Charing Cross Station** (arrives *into* the forecourt, 12:30–13:39) | Both: "Creative Commons Attribution licence (reuse allowed)" (read on the watch pages) | **high** on licence and route; **medium** on frame (which second the Eleanor Cross fills the shot is still QA) | Self-host, trim. **Direction note:** M-70 walks forecourt → Strand → Trafalgar, i.e. the reverse of the scene's geography; M-71 walks *into* the forecourt and is the direction-correct one for "the Strand into the forecourt". Scene Dev picks |
| **18 departure over Hungerford Bridge toward Dover** (M-13) | **1** | **M-13 itself** — `ME-x2yWqoiw`, Ian Payne Urban Transport, 2:02:10, 18 Apr 2026, chapters 00:00 Charing Cross → 02:44 Waterloo East. Backup **M-75** `BJ3KDkHUCXg` "Dover Priory to London Charing Cross", 2:04:59 (the reverse run, arrives over Hungerford Bridge) | Both: "Creative Commons Attribution licence (reuse allowed)" (read on the watch pages, 2026-08-19) | **high** | Self-host, trim 00:00–01:15, and **the left-half crop that `review/rights.md` forbade is now fine** — the RMF "do not modify the player" rule binds the *embedded player*, not a CC-BY copy we host. Attribution "Ian Payne Urban Transport, CC BY" must be on screen or in credits |

---

## New media ids (proposals — not wired into scenes)

| id | rung | kind | ref | title / creator | licence / basis | for scene | segment | verified how | notes |
|----|------|------|-----|-----------------|-----------------|-----------|---------|--------------|-------|
| M-62 | 1 | youtube-cc | `hZsfxBonTHg` | "🇬🇧 London Mayfair Walking Tour \| Most Expensive Street \| 4k" — Offbeat Destination, 35:50, 24 Oct 2024, 28 views | CC BY ("Creative Commons Attribution licence (reuse allowed)") | 02 primary candidate | **unpinned** — no chapters; description lists Savile Row as the 2nd of five locations after Piccadilly Circus, so expect it in the first third | watch page (licence row + description); auto-still hq2 viewed = genuine walking POV in Mayfair (Masons Arms, Maddox St) | Burned-in channel logo top-left; slight letterbox. 28 views ⇒ high deletion risk — keep M-63/M-64 warm |
| M-63 | 1 | youtube-cc | `GLH_sL4iNzA` | "Luxury London Walk 4K 🇬🇧 \| Mayfair, Bond Street & Royal Arcades \| ASMR HDR" — LONDON WALKS 4K, 21:43, ~Jul 2026 | CC BY (licence row read) | 02 backup | unverified | watch page | Description not read; content unverified — QA must confirm Savile Row is on the route |
| M-64 | 1 | youtube-cc | `bg7FqWkJG0Y` | "West End London Walking Tour, United Kingdom \| Winter 2025 \| 4K \| With Captions" — Sit and Wander Tours, 1:28:46 | CC BY (licence row read) | 02 spare | unverified | watch page | 89 min of West End: statistically likely to include the Row, but unverified |
| M-65 | 1 | youtube-cc | `cC1xSQlVp1U` | "EPA Film 006 008 23 Savile Row HD" — ericparryarchitects, 4:12, 1 Nov 2013, 133 views | CC BY (licence row read) | 02 spare | unverified | watch page | Architect's film about the building at 23 Savile Row — may be interior/CGI rather than street. Low expectation |
| M-66 | 2 | kartaview | seq `1123901`, idx **1767–1779** | KartaView / user `telenavdrives`, shot **2018-01-17 12:15:35–12:16:04**, 2592×1936, projection PLANE, faces/plates auto-blurred | **CC BY-SA 4.0** | 02 | 13 frames, Conduit St end → Burlington Gardens corner (51.51221,-0.14165 → 51.51106,-0.14051), heading 116–156° | frames idx 1770/1774/1778 downloaded and **viewed** — tailors' bay windows, awnings and flags on the east side confirm Savile Row | Southbound (M-05 walks north). Dashcam through a windscreen: dashboard in the bottom ~20 %, blown sky, a lorry blocks the right in idx 1774. ~11 m spacing ⇒ jumpy without interpolation |
| M-67 | 2 | kartaview | seq `1124`, idx **828–838** | KartaView / `telenavdrives`, shot **2016-03-25 10:32:13–10:32:33**, 3264×2448, PLANE | **CC BY-SA 4.0** | 05, and one approach frame for 06 | 11 frames westbound Pall Mall, 51.50664,-0.13394 → 51.50576,-0.13637 (brackets Reform 104 at idx 831/832 and the Athenaeum/Waterloo Place corner at idx 833/834) | frame idx 831 downloaded and **viewed** — Pall Mall clubland, south side in sun, clean windscreen, good exposure | Best-looking rung-2 asset of the set. But 10 years old, ~25 m spacing, clubs pass obliquely at the frame edge because it is a road-centre view, not a pavement view |
| M-68 | 1 | youtube-cc | `4Fx_LD4HOYI` | "Sunset LONDON Walk 🇬🇧 \| Piccadilly Circus to St James's Sunset Walk \| 4K ASMR" — LONDON WALKS 4K, 42:44, premiered 24 Jan 2026 | CC BY (licence row read) | 05 candidate | unverified — description names "historic Pall Mall, the majestic Duke of York Column, The Mall" | watch page (licence + description) | **Route risk:** it reaches Pall Mall from Regent Street St James's, i.e. at Waterloo Place, then goes to The Mall — that path joins Pall Mall *west* of the clubs and may never pass 104/106/107. QA before relying on it |
| M-69 | 3 | image bundle | Commons | **a** `File:The Athenæum Club, Pall Mall, London WC1 - geograph.org.uk - 894173.jpg` (640×501) · **b** `File:Travellers Club, Pall Mall - geograph.org.uk - 5323789.jpg` (3240×5270) · **c** `File:The Reform Club, Pall Mall - geograph.org.uk - 2317843.jpg` (1024×768) · **d** `File:The Royal Automobile Club, Pall Mall - geograph.org.uk - 4309531.jpg` (640×430) | all **CC BY-SA 2.0** | 05, 06 | stills | Commons API (licence + size) | BY-SA ⇒ show unmodified per the Rights rule; a Ken Burns pan **is** an adaptation — see "decisions" |
| M-70 | 1 | youtube-cc | `tProPV0SOSs` | "Charing Cross to Westminster: Tourists, Power and Horses (Station to Station)" — Urban Pigeon, 25:37, 14 Sep 2025, 4K 24 fps, 203 views | CC BY (licence row read) | 13 primary candidate | **00:00–00:52** forecourt/Eleanor Cross · **00:52–02:52** Strand (creator's own timestamps in the description) | watch page (licence, chapters, description); auto-still hq1 viewed = chest-height walking POV | Walks the scene's route **backwards** (forecourt → Strand → Trafalgar). Crowded; passers-by clearly identifiable |
| M-71 | 1 | youtube-cc | `3g41GwCnW80` | "Embankment to Charing Cross: Beautiful Riverside Gardens (Station to Station)" — Urban Pigeon, 13:39, 10 Jun 2025, 4K 24 fps | CC BY (licence row read) | 13 primary candidate (direction-correct) | **10:14 Villiers Street → 12:30 Charing Cross Station**; the forecourt/Eleanor Cross arrival is **12:30–13:39** | watch page (licence, description timestamps) | The only verified CC clip that *arrives in* the forecourt. Arrives from Villiers Street, not from the Strand — geography differs from the scene, but the beat ("into the forecourt, the cross in front of us") lands |
| M-72 | 1 | youtube-cc | `omcY89kce2A` | "London Walk: Leicester Square to Charing Cross in Under 5 Minutes!" — Urban Pigeon, 4:46, 1 Sep 2025, 451 views | CC BY (licence row read) | 13 backup | ends at Charing Cross; last ~40 s unverified | watch page | Short and cheap to host |
| M-73 | 1 | youtube-cc | `ZXiaTHtVqlo` | "Charing Cross to Leicester Square: Art and Music in the Rain (Station to Station)" — Urban Pigeon, 26:05 | CC BY **per the CC-filtered search result; watch page not re-opened** | 13 spare / 16 rain | 00:00–~01:00 leaving the forecourt, **in the rain** | search page only — **verify before use** | Verne's rain, on a CC licence. Worth a look for scenes 16/18 as well as 13 |
| M-74 | 3 | image | Commons | `File:The Eleanor Cross, From Charing-Cross Station-yard, London. (NBY 438623).jpg`, 2352×3600, c.1903 (sibling: NBY 438117, 2336×3600) | **Public domain** | 13, 14 | still | Commons API | A period photograph *from the station yard* — better matched to the scene's viewpoint than M-24's 1872 engraving; a strong second "then" plate for G-02 |
| M-75 | 1 | youtube-cc | `BJ3KDkHUCXg` | "Southeastern – Dover Priory to London Charing Cross \| 2h03m" — Ian Payne Urban Transport, 2:04:59, 17 Apr 2026, 1,088 views | CC BY (licence row read) | 18 backup | Hungerford Bridge crossing in the last ~3 min | watch page | The reverse run — arrival over the bridge if the departure frame disappoints |
| M-76 | 3 | image | Commons | `File:View from Hungerford Bridge, from the train 2025-09-06.jpg`, 3456×2592 | **CC BY-SA 4.0** | 18 | still | Commons API | Literally the shot scene 18 describes, as a still. Useful if the M-13 window turns out to face the wrong way |
| M-77 | 3 | image bundle | Commons | **a** `File:View up Savile Row - geograph.org.uk - 2929073.jpg` (3456×2592, 2012, CC BY-SA 2.0) · **b** `File:London Savile Row geograph-3066994-by-Ben-Brooksbank.jpg` (2338×1447, **1955**, CC BY-SA 2.0) · **c** `File:No 3, Savile Row door and sign.jpg` (960×540, **CC0**) | as listed | 02 | stills | Commons API | (b) is a 1955 street view — a genuine "then" plate that pairs with (a) for a then/now wipe; (c) is CC0, so it is the only one that may be freely cropped/tinted. Existing M-32 (PD c.1890) and M-33 still stand |

**Licence correction to `manifest.md` (not a new id):** M-13 `ME-x2yWqoiw` is **CC BY**, not "embed only". Its row and
`review/rights.md`'s M-13 verdict both need updating. So does M-13's backup M-75/`BJ3KDkHUCXg`.

---

## Rung 2 in detail — what Mapillary and KartaView actually give us

### KartaView — verified, no token, works today

- **Licence.** OSM wiki (`https://wiki.openstreetmap.org/wiki/KartaView`, retrieved 2026-08-19): *"The images on
  KartaView can be used under the Creative Commons Attribution-ShareAlike 4.0 International License (CC-BY-SA-4.0)"*,
  citing the "Open Source License" section of KartaView's own Terms. **Caveat:** `kartaview.org/terms` is a JavaScript
  app and returned no readable text from this environment, so I could not quote KartaView's own wording. Rights should
  open it in a browser and quote it before we ship anything derived from it.
- **Fetching.** No token, no registration.
  1. `POST https://api.openstreetcam.org/1.0/list/nearby-photos/` with `lat`, `lng`, `radius` → sequences near a point.
  2. `POST https://api.openstreetcam.org/1.0/sequence/photo-list/` with `sequenceId` → every frame with
     `sequence_index`, `lat`, `lng`, `heading`, `shot_date`, `name` (storage path).
  3. `GET https://api.openstreetcam.org/2.0/photo/?sequenceId=…` → `width`/`height`/`projection` and the CDN URLs.
  4. **Image bytes:** the legacy hosts (`storage7.openstreetcam.org`) currently return **502**. The working route is the
     imgproxy CDN: `https://cdn.kartaview.org/pr:sharp/<base64url(storage-url)>` → HTTP 200, full-size JPEG
     (verified: 0.5–1.0 MB per frame). The Engine must build that base64 URL itself; do not depend on the legacy host.
  - The `2.0` bbox endpoint (`/2.0/photo/?lat=…&radius=…`) times out on central-London radii — use the 1.0 endpoints.
- **Coverage verified at our seven points** (radius 60 m):

  | point | photos | sequences | date | who |
  |---|---|---|---|---|
  | Savile Row south / Burlington Gardens corner (51.51090, −0.14107) | 3 | seq 1123901 | 2018-01-17 | telenavdrives |
  | Savile Row mid, Nos. 7–15 (51.51180, −0.14122) | 8 | seq 1123901 | 2018-01-17 | telenavdrives |
  | Savile Row north, Conduit St (51.51255, −0.14140) | 11 | seq 1123901 | 2018-01-17 | telenavdrives |
  | Pall Mall @ Reform Club 104 (51.50607, −0.13455) | 3 | seq 1124 | 2016-03-25 | telenavdrives |
  | Pall Mall @ Athenaeum 107 / Waterloo Pl (51.50628, −0.13530) | 5 | seq 1124 | 2016-03-25 | telenavdrives |
  | **Strand @ Charing Cross station front (51.50830, −0.12490)** | **0** | **none** | — | — |
  | Charing Cross forecourt / Eleanor Cross (51.50745, −0.12475) | 3 | seq 47871 (2017-01-16), seq 2765226 (2020-06-20) | 2017 / 2020 | telenavdrives, wasd42 |

  Map URLs to inspect: `https://kartaview.org/details/1123901/1774` (Savile Row), `https://kartaview.org/details/1124/831`
  (Pall Mall), `https://kartaview.org/details/2765226/185` (Charing Cross).
- **Honest quality verdict** (I downloaded and looked at the frames):
  - *Savile Row idx 1774* — unmistakably Savile Row, tailors' bay windows and flags on the east side. But: dashboard
    across the bottom fifth, windscreen grime, blown sky, a red lorry parked in the right lane. Crop-and-stabilise
    territory, not hero footage.
  - *Pall Mall idx 831* — much better: bright March sun, clean glass, 3264×2448, the club fronts stepping away on the
    left. Still a road-centre car view; the façades pass obliquely.
  - **Density is the killer.** 13 frames over ~145 m (Savile Row) and 11 over ~270 m (Pall Mall). Even at a slow 2 fps
    that is 6.5 s and 5.5 s of screen time. Optical-flow interpolation can stretch it to ~8–12 s, and it will read as a
    hyperlapse, not a walk.

### Mapillary — licence confirmed, coverage NOT confirmed

- **Licence, quoted from `https://www.mapillary.com/terms` (effective 15 February 2024):**
  *"Your use of any User Content provided by other users is subject to the Creative Commons Share Alike (CC BY-SA)
  license"*, with the caveat that Mapillary *"may provide access to certain User Content … under a separate set of
  license terms (such as the Creative Commons Attribution NonCommercial Share Alike (CC BY-NC-SA) license)"*.
  So: **CC BY-SA is the default, but a per-sequence check is required** — an NC sequence would be unusable for us.
  Attribution is **contractual on top of CC**: *"If you are downloading individual images and serving them from your own
  servers, you must attribute the image(s) by visibly displaying the Mapillary logo and linking back to the Mapillary
  homepage or corresponding Mapillary image page."* And a hard prohibition: no attempt to *"re-identify or unblur any
  aspect of any Content, including any individual or license plate"*, with commercial users required to keep safeguards.
- **Fetching** (`https://www.mapillary.com/developer/api-documentation`): client token from
  `https://mapillary.com/dashboard/developers` (free); base `https://graph.mapillary.com`; example
  `GET https://graph.mapillary.com/images?access_token=$TOKEN&fields=id&bbox=12.967,55.597,13.008,55.607`. Useful
  fields: `thumb_2048_url`, `thumb_original_url`, `compass_angle`, `captured_at`, `sequence`, `is_pano`, `camera_type`,
  `on_foot`, `quality_score`, `geometry`. Rate limits as documented: 60,000/min entity, 10,000/min search, 50,000/day tiles.
  The docs make **no statement about imagery licence** — that lives only in the Terms above.
- **Coverage: unverified.** `graph.mapillary.com` with no token returns
  `{"error":{"message":"Invalid OAuth 2.0 Access Token","type":"MLYApiException","code":190}}`; there is no
  unauthenticated read path, and the web app is client-rendered. **I am not asserting Mapillary coverage on these three
  streets.** It is very likely denser than KartaView's (Mapillary has many `on_foot` and 360° sequences in central
  London), and `is_pano`/`on_foot` filtering would give a *pedestrian* view rather than a dashcam view — which is
  exactly what these shots want. But that is a hypothesis. **Ask: a free Mapillary token (5 minutes of work) turns this
  from "probably" into "verified" and is the single highest-value follow-up in A6.**

---

## Rung 1 — the full search record

Searches run with `&sp=EgIwAQ%3D%3D` on `youtube.com/results`: `savile row london walk`, `Savile Row`,
`Pall Mall London walk`, `Reform Club Pall Mall`, `St James's London walk Waterloo Place`,
`Pall Mall St James's walk 4K clubs`, `Trafalgar Square Strand walk London`, `Charing Cross station walk`,
`Charing Cross to Dover train`.

**Rejected after verification** (worth recording so nobody re-finds them):

| id | why rejected |
|----|--------------|
| `B7mLqvtPJHE` "walk down pall mall to buckingham palace total ghost town", wowwowwow, 8:52, CC BY | Licence is genuinely CC BY and the route is exactly right (westbound Pall Mall, lockdown-empty, June 2020). **But the auto-still at 25 % is a hand-held selfie talking-head in a park** — it is a phone vlog, ~480p, letterboxed, with the creator in frame. Not a façade pass. |
| `WPNRe_8fBBQ`, `JB4skbsgLoE` (wowwowwow) | Same channel, same format. |
| `nYtnklCckxA`, `r1WgUXk4yEM` (UHD Walks, Mayfair) | Appeared under the CC filter but not licence-checked and the routes are Mayfair-generic; superseded by M-62/M-63. |
| Internet Archive | Two `advancedsearch.php` passes (London + `mediatype:movies`, 1895–1945 and 1900–1945). Results are dominated by **mis-dated modern BBC News off-air uploads carrying an uploader-applied PD mark**, plus in-copyright features (*Werewolf of London*, *London After Midnight*). **No PD newsreel showing Savile Row, Pall Mall clubland, the Charing Cross forecourt or Hungerford Bridge was found.** Note for the studio: archive.org `licenseurl` is uploader-asserted and is **not** evidence of PD status. |
| Pexels / Pixabay / Videvo / Coverr | Not searched item-by-item this pass, and I do not expect a result: these libraries carry generic London icons (Tower Bridge, Big Ben, red buses, Trafalgar Square crowds) and essentially never carry a named minor street like Savile Row or a named club façade. Flagged as a residual, low-probability avenue rather than claimed as searched. |

---

## What still has no clean answer

1. **Scene 05 — 76 seconds of Pall Mall façade pass.** This is the real gap. No rung-1 source is *verified* to walk
   past 104/106/107 Pall Mall; M-68 is a maybe with a route that probably misses the clubs. Rung 2 gives 11 dashcam
   frames = 5–8 s. Rung 3 gives four good façade stills. **A 76-second continuous walking shot does not exist at rungs
   1–3.** Either the scene changes shape (see recommendation) or scene 05 keeps a card.
2. **Scene 02's rung-1 in/out.** M-62 has no chapters and 28 views. I can say Savile Row is on its route; I cannot say
   at which minute, and I could not watch it. Until QA pins it, scene 02's rung-1 answer is a claim, not a cut.
3. **The Strand itself has no KartaView coverage** at the station frontage (0 photos at 51.50830, −0.12490) — so the
   Strand leg of scene 13 has no rung-2 fallback at all if the Urban Pigeon clips vanish.
4. **Mapillary coverage** — unverified, token needed (above).
5. **Acquisition route for CC-BY YouTube video.** This one is load-bearing and I am escalating it rather than deciding:
   the CC BY grant runs from the uploader to the world and permits copying, adaptation and commercial use with
   attribution. YouTube's own Terms (and Developer Policy III.E.1.a, quoted in `review/rights.md`) separately forbid
   downloading content except through YouTube-provided features. These are two different instruments — a licence and a
   platform contract — and the second does not cancel the first, but it does constrain *how we obtain the file*.
   **Rights must rule on the acquisition route before the Engine downloads anything.** Cleanest options: (a) YouTube's
   own download/offline features where available; (b) one short mail to each of the three CC creators asking for the
   master, which is not a permission negotiation because the licence is already granted — it is a file request; (c) accept
   the CC grant as sufficient. This is the only thing standing between A6 and a card-free video cut for scenes 13 and 18.
6. **Third-party content inside CC-BY uploads.** An uploader can mark a video CC BY that contains music or footage they
   cannot sublicense. M-13/M-75 are safe (no music, no voice — already noted in `manifest.md`). Urban Pigeon's walks are
   ambient-sound; M-62 and M-68 are unchecked. QA: listen for a music bed before any of these is baked into the MP4.
7. **Identifiable people.** All five rung-1 clips are busy pavements with faces in frame. Embedding someone else's
   YouTube video and self-hosting a cut of it are different risk postures for a commercial product in the UK/EU. Rights
   to advise; KartaView/Mapillary frames are auto-blurred, which is a point in rung 2's favour.

---

## Recommendation: can the video cut lose its clip cards?

**Four of the five, yes, now. The fifth needs a scene redesign, not a licence.**

| scene | clip card can go? | on what |
|---|---|---|
| **18 the-boat-train** | **Yes, immediately** | M-13 is CC BY. Same shot, same 00:00–01:15, plus the left-half crop that was previously forbidden. Zero re-sourcing. |
| **13 charing-cross** | **Yes** | M-71 (direction-correct arrival into the forecourt) or M-70 (forecourt → Strand → Trafalgar), both CC BY, both 4K. Pick one, pin the Eleanor Cross frame at QA. |
| **06 the-reform-club** | **Yes** | It was never a walking shot. M-20 / M-22 / M-23 / M-69c with a slow push carry the door beat better than 45 s of somebody else's gimbal, and the linear cut already drops M-01 here ("from 45 s: M-20 + insets only"). |
| **02 savile-row** | **Yes, probably** | Best case M-62 (rung 1, QA to pin the minute). Worst case M-66's 6–8 s hyperlapse opening the scene + M-77b/M-32 then-now + M-77a hold. Either way, no card. |
| **05 pall-mall-pass** | **Only with a redesign** | Proposal: rebuild scene 05 as **8 s M-67 hyperlapse (westbound, the clubs stepping past) → 20 s Ken-Burns triptych over M-69a/b/c with the three club names and 1832 → 12 s hold on the Reform façade into scene 06**, ~40 s instead of 76 s. The linear cut loses 20 s and gains real motion. Alternatively keep the card only here. |

**So: the video cut can go card-free**, at the cost of one scene (05) being re-cut from a continuous walk into a
hyperlapse-plus-stills sequence, and at the cost of Rights ruling on item 5 above. If Rights says no to downloading
CC-BY YouTube video, then 13 and 18 fall back to rung 2/3 as well, and only 05's redesign pattern saves the cut — which
is an argument for getting that ruling first.

---

## Engine work implied

1. **Self-hosted CC video pipeline** (new). Store an MP4 per media id with `licence`, `attribution_string`,
   `source_url`, `acquired_on`, `in_s`, `out_s`, `crop` (M-13 needs `left-half`), `audio: mute|duck`. The renderer must
   emit the attribution automatically into the credits tail and, for CC BY, on-screen or in an accessible credit —
   nothing ships uncredited. This also unblocks the Publisher's paywall problem: a self-hosted CC-BY cut is not an
   embedded YouTube player, so Developer Policy III.F.3.a stops applying to those scenes.
2. **Street-level sequence → video renderer** (the backlog item the ladder already names). Input: provider
   (`kartaview` | `mapillary`), sequence id, index range or bbox + heading filter. Steps: fetch frames in
   `sequence_index` order → EXIF-free crop (KartaView: drop the bottom ~20 % of dashboard; keep a 16:9 window) →
   align on `heading`/feature match → optical-flow interpolate to 24–30 fps → output clip + a sidecar attribution
   record. Constraints it must respect:
   - **KartaView:** CC BY-SA 4.0; image bytes only via `https://cdn.kartaview.org/pr:sharp/<base64url(storage-url)>`
     (legacy storage hosts 502); no token; be polite about request rate (undocumented).
   - **Mapillary:** client token required (`mapillary.com/dashboard/developers`); 10,000 search req/min, 50,000 tile
     req/day; **visible Mapillary logo + link back** whenever we serve frames from our own servers; **never** attempt to
     unblur or re-identify anything; check per-sequence licence because some content is CC BY-**NC**-SA and unusable.
   - **Both:** the output clip is an **adaptation** of BY-SA source, so the clip itself must be offered under CC BY-SA
     4.0 with attribution. Whether that obligation stops at the clip (a "collection" inside our film) or reaches the
     whole MP4 is a Rights call — see decisions.
3. **Ken Burns on BY-SA stills.** `review/rights.md`'s standing rule is "BY-SA images ship only unmodified". A Ken Burns
   push/pan is arguably an adaptation. The renderer needs a per-asset `motion_allowed` flag driven by licence, and a
   "letterbox pan-and-scan on an unmodified frame" mode for BY-SA assets, so scenes 05/06 do not quietly break the rule.
4. **Not needed:** any Street View recording path. Rungs 1–3 cover every shot; Street View stays interactive-only, as
   `review/rights.md` and the ladder require.

---

## Decisions I need from the human

1. **Acquisition route for CC-BY YouTube video** (the gating question — item 5 above). Accept the CC grant and download;
   or send three one-line "you've licensed this CC BY, may we have the master?" mails to Ian Payne, Urban Pigeon and
   Offbeat Destination (not a permission negotiation — the licence already exists — so it does not violate the ladder's
   "no permission emails" principle, but it is a wait); or restrict rung 1 to whatever we can obtain within YouTube's
   own features.
2. **Share-alike appetite.** Using M-66/M-67 (KartaView, CC BY-SA 4.0) means at least the derived hyperlapse clip is
   CC BY-SA 4.0. Are we content to publish those clips as BY-SA (and say so in the credits), or do we want the linear
   cut to be entirely PD / CC BY / ours — in which case scene 05 loses its only moving-picture option and rung 2 is off
   the table for Day 1?
3. **A free Mapillary token.** Ten minutes of founder time at `mapillary.com/dashboard/developers` converts rung 2 from
   "a 2016 dashcam at 25 m spacing" into (probably) recent pedestrian and 360° sequences on all three streets. I
   recommend it before anyone builds the sequence renderer, because the renderer's design depends on which provider wins.
4. **Scene 05's shape.** Approve the 40-second hyperlapse-plus-stills redesign, or keep the clip card there alone.

---

## Digest

- **Did:** walked rungs 1–3 for all five embed-only shots; found that **M-13 was already CC BY** (so scene 18 needs no
  re-sourcing and gains its left-half crop) and that **Urban Pigeon's 4K "Station to Station" walks are CC BY**, which
  resolves scene 13; verified KartaView coverage and image delivery hands-on for Savile Row and Pall Mall (frames
  downloaded and viewed) and quoted Mapillary's and KartaView's current licence terms; proposed M-62…M-77 and named the
  one shot (scene 05's 76-second façade pass) that rungs 1–3 genuinely cannot fill.
- **Weak:** Mapillary coverage is unverified (no token from this environment) — the rung-2 answer I can *prove* is a
  2016/2018 dashcam at 11–25 m frame spacing, which is a hyperlapse, not a walk; M-62's Savile Row minute, M-68's route
  and M-73's licence are all unwatched claims; and the whole rung-1 plan rests on a Rights ruling about downloading
  CC-BY video from YouTube that I deliberately did not make myself.
- **With more time:** get a Mapillary token and re-run every point in the coverage table with `is_pano`/`on_foot`
  filters; watch M-62, M-68 and M-71 and pin real in/out seconds; check the three CC-BY uploads for third-party music;
  and prototype the sequence→video renderer on M-67 to find out honestly whether an 11-frame hyperlapse reads as
  "walking down Pall Mall" or as a slideshow.
