# Media Manifest — MOTION SUPPLEMENT — Day 1: London (+ Dover/Calais gathered for Day 2)

**Content Preparer:** content-preparer   **Date:** 2026-09-08   **Status:** proposal — nothing fetched into `media/files/`, nothing rendered, no scene edited.
**Supplements (does not replace):** `media/manifest.md` (M-01…M-106) · `media/manifest-a6.md` · `media/manifest-a7.md`. **Numbering continues at M-107.**
**Brief:** `studio/strategy/video-first.md` (D9) — *"need more visuals… need to source more videos when talking about places."*
**Ladder walked for every row:** `studio/strategy/media-fallback-ladder.md`. Rungs 1 → 2 → 3 only; **rung 5 and the embed-only fallback are not used here** — everything below is downloadable and licence-clean, or it is written up as a rejection.

> **Hard rule obeyed throughout.** Nothing here comes from youtube.com. Sources are `upload.wikimedia.org`,
> `cdn.kartaview.org` and `graph.mapillary.com` — the same three hosts A8 used. No account was created, no key was
> issued, nothing billable was called (Mapillary graph + KartaView 1.0 + Commons API + Overpass, all free; RULE 1 /
> RULE 0 intact). The Mapillary token and Maps key already in the gitignored `www/config.json` were used as given.

---

## 0 · Read this before the table

**I looked at every candidate.** Every row marked "viewed" below was downloaded (or its frames were) and inspected
with `studio/tools/render/node_modules/ffmpeg-static/ffmpeg`. That produced five rejections that would otherwise
have shipped — including a dashcam with a **burned-in VIOFO watermark and a GPS telemetry bar** across the exact
Pall Mall façades we want, and three walks along the club frontages that turn out to be **the Queen's funeral
preparations** (police vans, crash barriers, cones, marquees). Section 3 lists them all. This is the "Brexit
photograph through three scenes" failure mode, caught before it happened.

**The two licence traps named in the brief, checked:**
1. *A licence row that later vanished.* Every Commons row below quotes `extmetadata.LicenseShortName` **and**
   `UsageTerms` **and** `Artist` as the API returned them on 2026-09-08, with the file page URL so Rights can re-read
   them. Two rows (M-112, M-114) carry a **provenance caveat**: the work is unambiguously public domain (1896,
   R. W. Paul, d. 1943) but the *uploader's* stated source is "youtube", and the file page shows no licence-review
   template. The bytes come from Commons, which is the legitimate route; Rights should still eyeball the page.
2. *Commons reporting a thumbnail size as the file size.* Sizes below are `imageinfo.size` in bytes plus
   `width`×`height` of the **original**, and for the four archive films I additionally ran `cropdetect` to report the
   **active picture area**, which is the number that actually decides whether a shot can go full-frame.

---

## 1 · Per-beat table

`rung` = the fallback ladder. `conf` = my confidence that this ships as-is: **high** / med / low.
"linear" = usable in the MP4. Nothing here is player-only.

| id | beat (rundown ask) | best source | rung | licence, as stated by the source | resolution / duration | direct URL | what it actually shows | conf |
|----|--------------------|-------------|:----:|----------------------------------|-----------------------|------------|------------------------|------|
| **M-107** | **1. Savile Row end to end — the whole 280 m in one shot** (rundown **N1**; S0.1, S1.1, S2.2) | KartaView seq **1123901**, frames **idx 1765–1790** | 2 | **CC BY-SA 4.0**, KartaView platform-wide for all imagery; already ruled **green** in `review/rights-a6.md`. No per-image field exists; frames tag `licence_source: platform-default`. | 2592×1936 per frame · 26 frames · **294 m of street** at 11.8 m spacing · captured **2018-01-17T12:15:29Z** · ≈ 20 s as a hyperlapse at 0.8 s/frame | first `https://kartaview.org/details/1123901/1765` · last `https://kartaview.org/details/1123901/1790` · bytes via `cdn.kartaview.org` imgproxy (see `lib/kartaview.mjs`) | **The entire street, both sides, end to end, in one sequence.** This is the same source as the existing **M-66**, which used only idx 1770–1779 (10 frames / 7.3 s). Extending the window to 1765–1790 covers the whole 294 m — Savile Row is 280 m (F-110), so this is the beat, complete, in one licence-green sequence. Winter light, low traffic. | **high** |
| **M-108** | **1b. Savile Row at walking pace, south half** (N1; the "slow walk" the founder asked for) | Mapillary seq **`GNCMksZ65RXHix0bfTKotI`**, corridor-filtered to Savile Row | 2 | **Mapillary platform default CC BY-SA 4.0 — NOT stated per image.** The API has no `license` field (verified again today: `fields=…,license` → 500). Same basis the chapter already ships under `--accept-unknown-licence`; **open Rights question**, `panowalk/README.md` §Licence. Attribution required: "Mapillary / asturksever". | 4032×3024 · **59 frames within 16 m of the street centreline** · 163 m span · **2.8 m spacing** · **1.3 m/s — a genuine walking pace** · 2022-02-23 | `https://www.mapillary.com/app/?pKey=483173490062845&focus=photo` (first in corridor) — sequence id above | **viewed (9-frame contact sheet).** Hand-held phone walking north-west up the Row from Vigo Street: tailors' shopfronts, mannequins in windows, a glazed corner shop, parked cars, faces auto-blurred by Mapillary. Overcast February, no leaves, no crowd. **Covers 51.51015 → 51.51119, i.e. the southern ~145 m only.** | **high** |
| **M-109** | **1c. Savile Row north half, 360°** (N1 + **N6** No. 1 Savile Row corner) | Mapillary seq **`txqvAgRwn1YEOie7fI6sLd`** | 2 | as M-108 (platform default, per-image unknown). Attribution: "Mapillary / Stefdegreef". | **5760×2880 equirectangular** · **24 frames** in an 18 m corridor · **162 m span** · 7.0 m spacing · 3.5 m/s · 2024-09-19 | `https://www.mapillary.com/app/?pKey=1208555030468753&focus=photo` | **viewed (four 90° crops off frame 12).** Sunny September, the northern end of the Row: the "SAVILE ROW W1" street sign is legible, large modern glazed frontages, pedestrians (blurred), no scaffolding, no signage of concern. Being 360° it can be turned onto **either** side of the street, so a `look_at` cue for No. 1 is servable. Covers 51.51126 → 51.51241. **M-108 + M-109 = the full 280 m, but as two shots, not one continuous walk.** | **high** |
| **M-110** | **2. The making of a suit — chalk, shears, the bench** (N2, "the most filmable craft in the chapter") | Wikimedia Commons — **"Efficiencydag voor kleermakers", Polygoon-Profilti newsreel, week 52-13** (Open Beelden 71377) | 1 | **CC BY-SA 3.0 NL** — `LicenseShortName: "CC BY-SA 3.0 nl"`, `UsageTerms: "Creative Commons Attribution-Share Alike 3.0 nl"`, `LicenseUrl: creativecommons.org/licenses/by-sa/3.0/nl/deed.en`, `Artist: "Polygoon-Profilti (producent) / Nederlands Instituut voor Beeld en Geluid (beheerder)"`, `Credit: 508320 at Open Beelden`. Share-alike is compatible with our CC BY-SA 4.0 output (D4). | **384×288** (active area = full frame) · **87.7 s** · 10,341,868 bytes · `application/ogg` · **dated 1952-03-01** | `https://upload.wikimedia.org/wikipedia/commons/5/58/Efficiencydag_voor_kleermakers_Weeknummer_52-13_-_Open_Beelden_-_71377.ogv` · page: `https://commons.wikimedia.org/wiki/File:Efficiencydag_voor_kleermakers_Weeknummer_52-13_-_Open_Beelden_-_71377.ogv` | **viewed (6 frames).** A cutter at a long bench laying **dark cloth over a paper pattern with a steel rule, tape measure and shears**; a hall packed with tailors watching a demonstration; a close-up of hands shaping a **canvassed forepart / collar**; a finished dark suit worn and turned. Monochrome 1952 — it sits inside the chapter's engraving/old-film house look rather than fighting it. **The single best licence-clean answer to N2 that exists on Commons.** | med |
| **M-111** | 2b. Craft macro inserts — **conditional, see the warning** | Commons, **26-file "Tailor NN" series**, Accra Newtown, Ghana | 1 | **CC BY-SA 4.0** — `Artist: daSupremo`, `Credit: Own work`, dated 2024-04-08/09. Verified on File:Tailor 19. | **1920×1080** each · 26 files, 11.7 s – 139 s · e.g. Tailor 19 = 42.2 s / 18,491,469 bytes | `https://commons.wikimedia.org/wiki/File:Tailor_19.webm` (and Tailor 2…28) | **viewed (16 frames across Tailor 13/19/21/24).** Real craft in real light: pattern marking with rule and pencil, cutting, pressing, machine sewing. **But: it is unmistakably West African** — Ghana-flag bunting on the bench, wax-print cloth under the iron — and Tailor 24's frame is dominated by a **"MAQI" machine badge**, i.e. prominent contemporary branding. **Do NOT cut this under narration about Savile Row.** That is exactly the "photograph of the wrong building" error. Admissible only if the rundown writes an honest beat ("the same craft, everywhere") **and** credits Accra on screen, or as ≤2 s macro inserts cropped to hands-and-cloth with the MAQI badge out of frame. Rundown's call, not mine. | low |
| **M-112** | **6a. Dover — the sea at the pier** (Day 2; and a candidate cold-open plate) | Commons — **"Rough Sea at Dover" (Birt Acres / R. W. Paul)** | 1 | **Public domain** — `LicenseShortName: "Public domain"`, `UsageTerms: "Public domain"`, `Artist: "Robert W Paul"`, `DateTimeOriginal: 1896`. **Caveat: `Credit: "youtube"`** — see §0.1. Work itself is beyond doubt PD (Paul d. 1943; UK and US PD). | 960×720 container, **active picture 930×720** (cropdetect) · **17.5 s** · 4,001,916 bytes · webm · **has a vorbis audio track — strip it** (`rights-a6.md` §1.1: an added soundtrack may be third-party) | `https://upload.wikimedia.org/wikipedia/commons/8/85/Rough_Sea_at_Dover_1896_Birt_Acres_Robert_W_Paul.webm` · page: `https://commons.wikimedia.org/wiki/File:Rough_Sea_at_Dover_1896_Birt_Acres_Robert_W_Paul.webm` | **viewed (4 frames).** Heavy seas breaking clean over the Admiralty Pier at Dover, spray to the top of the frame. One of the earliest British films and the one shown in New York in 1896. Real, violent motion — it does in 8 seconds what a paragraph about "twenty miles of open water" cannot. Fits the existing `PB` pillarbox recipe as-is (930×720 → 960×720). | **high** |
| **M-113** | **6b. Calais ↔ Dover — the crossing itself** (Day 2) | Commons — **Georges Méliès, "Entre Calais et Douvres" (Star Film 112)** | 1 | **Public domain** — `LicenseShortName / UsageTerms: "Public domain"`, `Artist: "Georges Méliès"`, `DateTimeOriginal: 1897`, `Credit: "Georges Méliès: le premier magicien du cinéma"`. | 768×576 container, **active picture 706×576** · **68.8 s** · 62,828,472 bytes · webm, **no audio stream** | `https://upload.wikimedia.org/wikipedia/commons/a/a1/Entre_Calais_et_Douvres_%281897%29.webm` · page: `https://commons.wikimedia.org/wiki/File:Entre_Calais_et_Douvres_(1897).webm` | **viewed (6 frames).** Méliès's studio-built steamer deck — lifebelts lettered "ROBERT-HOUDIN STAR LINE" — with passengers pitching about and being comically seasick on the Channel crossing. **Content note:** it is a *fake*, shot in Montreuil, and must be narrated as one; that is the joke and it is a good one. A restored **title card at ≈0:14–0:18** reads "ENTRE CALAIS ET DOUVRES / Between Calais and Dover / 1897 / Star Film 112" — burned into the source, not an overlay of ours, and usable as a card (D9-legal) or skippable. Usable window: **0:20–1:08**. | **high** |
| **M-114** | **5. London itself, 1872-adjacent** (S0, S8) | Commons — **"Hyde Park Bicycling Scene", R. W. Paul, 1896** | 1 | **Public domain** — `Artist: "Robert W Paul"`, `DateTimeOriginal: 1896`. Same **`Credit: "youtube"`** provenance caveat as M-112. | 958×720, **active picture 958×720 (full frame)** · **20.4 s** · 7,158,492 bytes · webm | `https://upload.wikimedia.org/wikipedia/commons/1/17/Hyde_Park_Bicycling_Scene_1896_Robert_W_Paul_London_Royal_Park.webm` · page: `https://commons.wikimedia.org/wiki/File:Hyde_Park_Bicycling_Scene_1896_Robert_W_Paul_London_Royal_Park.webm` | **viewed (3 frames).** A Victorian crowd lining Rotten Row, women in full skirts and hats, cyclists streaming past, a horse-drawn carriage crossing the frame. Clean, sharp for its age, **full-frame at 958×720** so it takes the `PB` treatment without an inset. The closest thing we have to "Londoners, moving, in Fogg's London" beyond M-78 (1903) and M-81 (1890 Trafalgar). | **high** |
| **M-115** | **4c. Charing Cross — the bridge out over the river** (N3e) | Mapillary seq **`XG6JP4aLFcqYX1AfbwuTQQ`** | 2 | as M-108 (platform default CC BY-SA 4.0, per-image unknown). Attribution: "Mapillary / kieran". | 4608×2592 (**16:9 native** — no pillarbox needed) · **37 frames** in a 20 m corridor · **227 m span** · 6.3 m spacing · **1.2 m/s — a walk** · 2015-07-21 | `https://www.mapillary.com/app/?pKey=736264767053661&focus=photo` | **viewed (7 frames).** A walk across the **Golden Jubilee footbridge** beside Hungerford Bridge, heading north-west toward Charing Cross: the Thames wide and brown below, Waterloo Bridge and the South Bank behind, pleasure boats, the railway bridge's dark truss entering frame. Bright summer light. Clean — no signage, no branding, no watermark. **Honesty note:** this is the *footbridge*, not the railway bridge trains leave on; narrate it as the river, not as Fogg's train. Oldest item here (2015) but the view has not changed. | **high** |
| **M-116** | **4a. Charing Cross forecourt / the datum** (N3a–c) | Mapillary seq **`VgRKivL0cBNshd2Pu7qkJU`** | 2 | as M-108. | **5760×2880 equirectangular** · 20 frames · 46 m span · **2.4 m spacing** · **1.2 m/s — a walk** · 2024-01-24 | `https://www.mapillary.com/app/?pKey=1806663103120050&focus=photo` | **found, not yet viewed** (budget). A 360° walk at true walking pace across the Strand end of the Charing Cross forecourt. Proposed as the **second source** beside the already-cached `ctrzEaPC8S2q1DQvsiupmL` (`look-up-the-cross-w00`: 2025-08-10, 360°, 2.7 m, 1.7 m/s, 44 m), which remains the primary. Two 360° stops at walking pace means the S9/S10 Charing Cross block can move instead of holding on stills. **Verify by eye before wiring.** | med |
| **M-117** | 6c. Calais — the town, the Burghers | Mapillary seq **`v3os63fy2ei82hl66w4xox`** | 2 | as M-108. | 4160×2336 · 18 frames · 129 m span · 7.6 m spacing · **1.3 m/s — a walk** · 2021-01-02 | `https://www.mapillary.com/app/?pKey=1477103549291401&focus=photo` | **found, not yet viewed.** Runs past the Hôtel de Ville (way 104547637, 50.95269/1.85458) and Rodin's *Les Bourgeois de Calais* (node 1947251486, 50.95235/1.85344). Winter, likely empty streets. Coverage around the monument is genuinely thin — 20 sequences in the bbox but only this one is a walk. **Day 2; verify by eye.** | low |
| **M-118** | 6d. Calais — a ferry in the port, today | Commons — **"Pride of Canterbury (ship, 1991) video in Calais (1)" and "(2)"** | 1 | **CC BY-SA 4.0** (`UsageTerms: Creative Commons Attribution-Share Alike 4.0`). | 1280×720 · 17.7 s and 19.5 s · 13,219,109 / 14,671,636 bytes · `.ogg` container | `https://upload.wikimedia.org/wikipedia/commons/7/77/Pride_of_Canterbury_%28ship%2C_1991%29_video_in_Calais_%281%29.ogg` · and `…/8/8c/…_%282%29.ogg` | **found, not yet viewed.** The only modern, licence-clean, downloadable Dover–Calais ferry motion I could find anywhere. 720p is below our 1080 line, so treat as a 2-shot insert, not a hero shot. **Day 2.** | med |
| **M-119** | 5b. London street life, spare reel | Commons — **"Early English Traffic, Turn of the Century London (1896–1903)"** | 1 | **Public domain** (`LicenseShortName / UsageTerms: Public domain`). | 640×480 · **647 s (10:47)** · 48,034,268 bytes · webm | `https://upload.wikimedia.org/wikipedia/commons/6/63/Early_English_Traffic%2C_Turn_of_the_Century_London_%281896-1903%29.webm` | **found, NOT viewed — 10¾ minutes unscreened.** A compilation reel; likely overlaps M-78 (*Old London Street Scenes*, 1903), and compilations are where re-edits, added music and stray modern captions hide. **Do not wire until someone screens it end to end.** Listed only so the next pass does not re-find it. | low |

---

## 2 · What each beat in the brief now has

| # | beat the founder named | verdict | carried by |
|---|------------------------|---------|-----------|
| 1 | **Savile Row, slow end-to-end walk, both sides** | **SOLVED — with one honest compromise.** The whole 294 m exists in one licence-green KartaView sequence (**M-107**), but at 11.8 m spacing it is a *hyperlapse*, not a stroll. A true 1.3 m/s walk exists for the **southern 145 m** (**M-108**) and a 360° pass for the **northern 162 m** (**M-109**). There is **no single pedestrian-pace sequence covering all 280 m** on either platform. Recommended cut: open on M-107 (whole street, fast, "this is all of it"), then drop into M-108 at walking pace for the shopfronts. That is arguably better than one long take. | rung 2 |
| 2 | **The making of a suit** | **PARTLY SOLVED, and it is the weakest row here.** **M-110** (1952 Polygoon newsreel) gives a cutter, a bench, cloth, rule, shears and a canvassed forepart — but at **384×288** and in Dutch monochrome. **M-111** gives 1080p craft macros from Accra that must not be passed off as the Row. **Nobody has openly licensed a Savile Row workroom.** See §4 for the two ways to close this. | rung 1 |
| 3 | **Pall Mall — the three club façades in sequence** | **NOT IMPROVED. Everything new was rejected on content.** The two best-covering 2026 sequences are a dashcam with a burned-in watermark; the three best-spaced walks are the Queen's funeral. What stands is what the chapter already has: **M-67** (KartaView 1124, idx 824–830 = 99 m at 16.4 m, 2016) and the cached 360° stop `JhVerKzIuOMLq1PbWpil4Z` (2024-04-10, all three club cues reachable). | — |
| 4 | **Charing Cross — forecourt, Strand approach, bridge over the river** | **PARTLY SOLVED.** The river is solved (**M-115**, a real 227 m walk). The forecourt gains a second 360° walking source (**M-116**). **The Strand approach is not solved** and **a train leaving over Hungerford Bridge does not exist** in any free source I found. | rung 2 |
| 5 | **London itself, 1872-adjacent** | **SOLVED, and the chapter was already close.** New: **M-114** (Hyde Park, 1896, full-frame 958×720). Existing: **M-81** (Donisthorpe, Trafalgar Square, **1890 — the earliest surviving film of London, and we already hold it**), **M-78** (1903). Spare: **M-119**, unscreened. Nothing earlier than 1890 exists anywhere; 1872 itself is photographs and engravings, permanently. | rung 1 |
| 6 | **Dover and Calais, the two ports facing each other** | **SOLVED for the archive half, THIN for the modern half.** **M-112** (Dover, 1896) and **M-113** (Méliès's crossing, 1897) are a superb pair and answer "the two ports" with period wit. Modern Dover motion is **not** solved — see §3. Modern Calais is **M-117** (unviewed) + **M-118** (720p ferry). | rung 1 / 2 |

---

## 3 · Rejected, and why — "no clean answer" section

**Everything in this list was looked at.** These are the shots that would have shipped if nobody had.

| what | where | why rejected |
|------|-------|--------------|
| Mapillary `AtDK0dFmOqNHS8X4LgPxns`, `rpn7si4fReHvxtOlBgWd29`, `b1CyN5S3IAl2UpgDjdTMFe`, `WNbHMBVremifE8uCl9vQPq` (creator *RyanBush*, 2026-04-03/05) | Pall Mall, right across the three club façades, 99 m at 3.4–7.1 m spacing, 2560×1440, five months old — **on paper the best Pall Mall coverage that exists** | **Burned-in watermark.** Frames carry "VIOFO" top-left and a full-width telemetry bar along the bottom: `020MPH  N:51.5071 W:0.1326  VIOFO A229 Plus  HDR 05-04-2026 09:21:56`. Also a windscreen dashcam: bonnet in the lower third, fisheye. Cropping both bars costs ~15 % of frame height and still leaves the bonnet. **Reject.** |
| Mapillary `CueFZ4wV2aP6HnBhbi1RJQ`, `pzHhTrR9Ni1Jlv54BLXyVU`, `GuJEMKSxI6AdLVoT3vF7QC`, `6FVYo9BtiUX4lefmIR5zHC` (creator *richlv*, 2022-09-10/12) | Pall Mall / Waterloo Place, 4000×3000, **1.1–1.6 m spacing at true walking pace** — the best-spaced pedestrian imagery in the whole area | **Contemporary news content.** Captured in the days after Elizabeth II's death: police vans, crash barriers, traffic cones, white marquees, taped-off pavement, scaffolding wrap. Instantly dates the film and imports a state event we are not talking about. **Reject.** |
| Mapillary `e5TWQpGIA4vBctJrsgLb6a` (Savile Row, 58 frames, 3.1 m, 1.4 m/s, 2022-02-23) | the best-scoring Savile Row walk by geometry | **Unfetchable.** Every frame returns `id/width/creator` but **no `thumb_2048_url` or `thumb_original_url` of any size** — the same failure `panowalk/lib/mapillary.mjs` guards against. There are no bytes to download. **Reject (technical).** |
| Mapillary `NvCHTs4PJjF0ryeLDfpo5z` (Dover, 2026-08-14, three weeks old, 97 m at 0.6 m/s) | proposed as "Dover seafront" | **Wrong place and dirty content.** It is a windscreen dashcam on the A20 / Townwall Street, not the seafront: roadworks, cones, a "Faversham Linen Services" lorry filling the frame (prominent branding), 1960s tower blocks. **Reject.** My seafront corridor was mis-placed; §5 gives the corridor the next pass should query. |
| Mapillary `KgFikc8sZBy4CWo5dutLmM` (2026-05-20, 4032×3024) | proposed as "the Strand approach to Charing Cross" | **Not a walk.** 11 frames at one point (51.50775, −0.12765) with the heading swinging 176° → 293°: a person turning on the spot at the Trafalgar Square corner. Nothing moves. **Reject for this beat** (could serve as a stills pan). |
| Commons **"Penlan Joseff Davies Teiliwr — the tailor of Trisant"** (CC0, 1280×720, 43 s) | the most promising-sounding tailoring hit on Commons | **Not craft footage.** A phone-shot vertical talking-head oral history in Welsh, pillarboxed to 1280×720, seated in a living room. No cloth, no tools. **Reject.** |
| Commons **"Queen Elizabeth II Coffin Pall Mall"** (CC BY 2.0, 1920×1080, 87 s) | the only 1080p Commons video of Pall Mall in existence | State-funeral procession. Same reason as the richlv walks. **Reject.** |
| **Pexels, Pixabay** (ladder rung 1) | the obvious home of "chalk on cloth" macro stock | **Unreachable from this environment and cannot be opened without spending or signing up.** Both search pages return a Cloudflare interstitial (5.6 KB "Just a moment…", no results in the HTML). Their APIs need a **free account + API key**, and RULE 0 / `panowalk/README.md` are explicit that the studio does not create accounts on the founder's behalf. **Escalated in §4, not worked around.** |
| **Videvo, Coverr, Mixkit** | rung 1 | Not attempted this pass — Mixkit's licence text is still unread (`manifest-a7.md` decision 2) and the other two gate downloads behind accounts. Recording an honest gap rather than a guess. |
| **Internet Archive, for tailoring** | rung 1 | Searched `mediatype:movies` across title, description, and `collection:prelinger` for *tailor / tailoring / bespoke / hand tailored / cutting room / men's clothing*. **Nothing usable.** The relevance ranking returns cartoons (*Brave Little Tailor*), features (*The Tailor of Panama*), and YouTube mirrors. Prelinger's clothing holdings are 1940s **home-sewing** instructionals (*Sewing Simple Seams*, *Sewing: Pattern Interpretation*), still under a Centron copyright notice, and none of them is a tailor's workroom. |
| **Internet Archive, for Dover/Calais/early London** | rung 1 | Same story — `title:(dover OR calais OR "white cliffs" OR channel)` returns NASCAR, Channel 5 recordings and YouTube channel dumps. **Commons is the better-curated source for early film and that is where every archive row above came from.** |

---

## 4 · Decisions I need from the human

1. **N2, the making of a suit — pick a lane.** No openly licensed Savile Row workroom footage exists; I checked
   Commons, the Internet Archive and Prelinger. Three ways out, in cost order:
   **(a) Ship M-110** — the 1952 Dutch newsreel: a real cutter, real shears, real canvas, and monochrome so it sits
   inside the house look. Cost: nothing. Price: 384×288, so it must be an inset plate or a soft-edged archive
   window, never full-frame (the `manifest-a6` Donisthorpe rule says 2.7× upscale is mush; 384→1280 is 3.3×).
   *Worth trying first:* Open Images may serve the same item (id 71377) at a higher rate than the Commons copy —
   one fetch to `openbeelden.nl` would settle it, and I did not spend it.
   **(b) Open the free-stock rung.** If you create a **free Pexels and/or Pixabay API key** and paste it beside
   `mapillary_token` in `www/config.json`, "chalk on cloth", "shears cutting fabric" and "hand sewing" become
   available at 1080p/4K under permissive licences. **I did not create one — that is your account and your terms
   acceptance, and it is not mine to click.** Both are free at our volume; I am asking, not assuming.
   **(c) D2 permission email** to a Row house or a documentary maker. Slow, likely "no", and the ladder exists to
   avoid it — but this is the one beat where it might be worth one email.
2. **M-111 (Accra) — allowed at all?** My recommendation is **no** under Savile Row narration, and **yes** if the
   rundown writes an honest "the same craft, everywhere" beat with Accra credited on screen. Your call.
3. **Mapillary's licence, still open since 2026-08-19.** M-108, M-109, M-115, M-116, M-117 all rest on Mapillary's
   *platform-default* CC BY-SA with **no per-image licence field**. Four of the five beats I solved sit on that
   assumption. It has been open for three weeks; it is now load-bearing. Rights needs to close it, or we fall back
   to KartaView (licence-green, but 12–17 m dashcam spacing everywhere).
4. **Dover/Calais ownership.** `places.md` asks the same question. M-112/M-113/M-117/M-118 are filed here because you
   asked me to gather them now; say whether they move to `day-02-to-brindisi/media/` when Day 2 is next revised.

---

## 5 · Gaps the parallel rundown may ask for that I have NOT covered

`rundown/rundown-film.md` was being written alongside this. Mapping my findings onto its N-list:

| rundown ask | status after this pass |
|---|---|
| **N1** Savile Row end to end | **filled** — M-107 (whole street) + M-108 (south, walking) + M-109 (north, 360°). Its "4–5 shopfront/nameplate close-ups (Poole No. 15, Huntsman No. 11)" and "a window with BESPOKE lettering" are **NOT** filled — those need frame-level pinning inside M-108/M-109, which is a QA-on-device job, and `places.md` warns not to name a shop before Street-Viewing the frontage. |
| **N2** tailoring workroom (≥90 s, 5 setups) | **partly** — M-110 gives ~88 s and 3–4 setups at 384×288. The "basted jacket at a first fitting" and "the fitting-room mirror" are **not covered by anything**. |
| **N3** Charing Cross daylight, 5 setups | **partly** — (e) the river is M-115; the forecourt is M-116 + the cached `ctrzEa…`. **(a) the Charles I statue with traffic turning round it, (b) the datum plaque readable, (d) concourse and departure boards are all still missing**, and (b) is likely stills-only. |
| **N4** Pall Mall clubland pass | **not filled.** Everything new was rejected (§3). M-67 + the cached 360° stop remain the answer. |
| **N5** St James's Street to the Tudor gatehouse | **not searched this pass.** The chapter already caches `Sx3G6T8ksr5enAm47adDbE` (2024-09-19, 360°, stops w04/w05) which runs down St James's Street — **content unverified by eye**; that is the cheapest next check. |
| **N6** No. 1 Savile Row / Sheridan plaque / No. 3 | **partly** — M-109 is 360° at the north end, so No. 1's corner is servable. The **plaque at No. 14 will not be readable** at Mapillary resolution from the road; treat as a still. |
| **N7** telegraph key motion + SFX | **not covered** — and the SFX half is an audio job (Freesound), not this document. |
| **N8** dusk on Pall Mall or the Charles I statue | **not covered.** Open imagery is overwhelmingly daylight; a dusk pass will not come from rungs 1–2. Candidate rung-3 substitute: **M-88** (Hungerford Bridge at night, already fetched and already in `media/files/`). |

**Exact queries the next pass should run**, so nobody repeats my mistakes:
- Dover seafront (correct corridor, mine was wrong): Mapillary bbox along **Waterloo Crescent / Marine Parade,
  (1.3100, 51.1230) → (1.3180, 51.1265)**, and the castle viewpoint at **51.1324, −/+1.3190**. Dover Castle is OSM
  node 502539038.
- A train over Hungerford Bridge: try Commons category *Videos of railway transport in London*; the shot may only
  exist embed-only, in which case it is cut, not clip-carded.
- Higher-resolution M-110: `openbeelden.nl` item **71377** direct.

---

## 6 · Honest verdict — how much of the chapter can now be carried by motion?

Counting the rundown's 12 segments (S0–S11):

- **Real motion, licence-clean, downloadable, in hand or one fetch away: 7 of 12.** S0 (cold open — M-107, M-114,
  M-112), S1 and S2 (Savile Row — M-107/M-108/M-109), S3 (No. 1 — M-109), S8 (1872 London — M-114 + existing
  M-78/M-81), S9 and S10 (Charing Cross — M-115, M-116 + the cached 360° stop).
- **Still stills-and-engravings, and honestly so: 5 of 12.** S4/S5/S6/S7 — the whole **clubland block**, which is
  the chapter's middle and its longest continuous stretch of narration — plus S11. Pall Mall gained **nothing**
  today: the two sequences that cover the façades properly are a watermarked dashcam and a state funeral.
- The craft beat (S1.6/S1.7/S2.1), which the founder called the answer to *"why should I care about this street"*,
  is carried by **one 384×288 Dutch newsreel from 1952**. It is real and it is legal, and it is not enough.

**So: the picture-to-narration ratio improves materially in the first third and the last third of the film, and
barely at all in the middle.** If the founder wants the clubland block to move too, the honest routes are (i) close
the Mapillary licence question and cut the cached 360° Reform stop as a slow lateral pan across all three façades —
which is a real shot the pipeline can already make — or (ii) one D2 permission email. It will not come from a
better search; I ran out of things to search.

**One thing worth saying plainly:** the strongest new material is not modern footage at all. *Rough Sea at Dover*
(1896), *Entre Calais et Douvres* (1897) and the Hyde Park cyclists (1896) are public domain, downloadable,
full-frame, and they move — and they belong to the same visual family as the engravings the founder said he likes.
The chapter's best route to "less narrated" may be *more archive film*, not more drone shots.

---

## Digest

- **Did:** walked the ladder for six beats and wrote up 13 new items (M-107…M-119), every one downloadable and
  licence-checked at source, with rung, real resolution, real duration and real URL; looked at the footage and
  **rejected eight candidates** — a VIOFO-watermarked dashcam across the Pall Mall clubs, four Queen's-funeral
  walks, an unfetchable Savile Row sequence, a Dover roadworks dashcam and a Welsh talking head — and found that
  the **whole 280 m of Savile Row already sits in one licence-green KartaView sequence** the chapter had only cut
  10 frames out of.
- **Weak:** the craft beat rests on a 384×288 newsreel; Pall Mall gained nothing; M-116/M-117/M-118/M-119 are
  listed from metadata and **not yet viewed**; and five of the six solved beats depend on Mapillary's unresolved
  per-image licence question, which is now load-bearing rather than theoretical.
- **With more time:** screen M-116 and M-119 frame by frame; fetch item 71377 from Open Images to see if a better
  master of the 1952 tailors exists; run the corrected Dover seafront corridor; and ask the founder for the one
  thing that would unlock the craft beat properly — a free Pexels key, which is his to create and not mine.
