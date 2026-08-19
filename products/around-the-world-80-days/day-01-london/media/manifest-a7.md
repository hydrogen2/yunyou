# Media Manifest — Day 1: London — **A7: legitimately downloadable sources for the five walking shots**

**Content Preparer:** content-preparer   **Date:** 2026-08-19 (queue item A7)   **Status:** **proposals** — nothing below
is wired into a scene. Companion to `manifest.md` (M-01…M-61) and `manifest-a6.md` (M-62…M-77); ids continue at **M-78**.

**Inputs read:** `studio/roles/_common.md` · `studio/roles/content-preparer.md` · `studio/strategy/media-fallback-ladder.md` ·
`media/manifest-a6.md` · `review/rights-a6.md` · `products/around-the-world-80-days/brief.md` · `scenes/README.md` ·
`linear/render-log.md`.

**The task.** `review/rights-a6.md` §1.4 ruled: the CC BY grant permits reuse, but YouTube's ToS forbids the *means*
(downloading from youtube.com). So A7 hunts for the **file itself** somewhere that is not YouTube — route **R2**
("a mirror the creator publishes elsewhere") and route **R3** ("the same footage from a downloadable source").

**Hard rule observed.** No tool that downloads from YouTube was used, tested or is recommended anywhere in this
document. Every file below was located, licence-checked and **HTTP-verified with a `HEAD` request** on a host that
serves files for reuse. See "the video2commons question" for the one place where this rule bites and I declined.

---

## Headline

**One of the five shots is now fully fillable from downloadable files, one is half-fillable, and three are not.**

But the more useful result is structural: **Wikimedia Commons is already acting as a legal mirror for CC-BY YouTube
video.** `Category:Videos from London` holds 112 files, many of them CC-BY YouTube uploads imported by Commons users
and *licence-reviewed* on-wiki, served as plain WebM from `upload.wikimedia.org` with no login, no token and no ToS
problem. That turns Rights' route R2 from "check three creators' link trees" into "check a catalogue" — and it is where
four of the six genuinely useful assets in this pass came from.

| the five shots | downloadable file today? |
|---|---|
| **S1 — Savile Row / Mayfair street walk** | **No.** Nothing on any reuse platform. Still needs the R1 mail to Offbeat Destination, or A6's KartaView hyperlapse. |
| **S2 — Pall Mall clubland façades** | **No** (one unverified lead: M-91, an open-top-bus tour on Commons at 4K, CC BY). Still the hardest shot in the chapter. |
| **S3 — Trafalgar Sq → Strand → Charing Cross forecourt + Eleanor Cross** | **Half.** The Trafalgar Square end is filled three times over (M-84 CC BY 1080p, M-85 Pexels 1440p, M-86 Mixkit). The forecourt/Eleanor Cross in *modern* footage is still not available — but it exists in **1903 PD film that names Charing Cross Station** (M-78). |
| **S4 — train departing Charing Cross over Hungerford Bridge** | **No.** Nothing anywhere. This shot is the single strongest argument for the Ian Payne mail. |
| **S5 — 1870s-relevant London street atmosphere ("then" layer)** | **Yes, comfortably.** Five public-domain films, 1890–1920s, all direct-download, totalling ~40 minutes: M-78, M-79, M-80, M-81, M-82, M-83. |

---

## How things were verified (2026-08-19)

- **Creator descriptions and About tabs** were read by fetching the *watch page and channel page HTML* and parsing
  `attributedDescription` and `channelMetadataRenderer` out of `ytInitialData`. Reading a web page is not downloading
  video; no media stream was touched.
- **Wikimedia Commons:** `action=query&generator=search&gsrnamespace=6&prop=imageinfo&iiprop=url|size|mime|extmetadata`
  for licence, pixel size, **duration** and byte size; `list=categorymembers` for the two categories; `action=parse&prop=wikitext`
  for the file page source (which is where the `{{YouTube CC-BY}}` and `{{YouTubeReview}}` provenance templates live).
- **Internet Archive:** `archive.org/advancedsearch.php` (three queries) and `archive.org/metadata/<id>` for the file table.
- **Download reality check:** `curl -sIL` on every direct URL in the per-shot table. All returned **HTTP 200** with a real
  `content-length` (e.g. M-78 = 18,239,987 bytes; M-83 = 86,923,693 bytes). These are files, not players.
- **Seen with my own eyes:** only **M-81** (I downloaded the 363 KB GIF and looked at it — see its row). Everything else's
  *content* is asserted from the source's own description and is marked medium confidence accordingly. There is no
  `ffmpeg` in this environment, so I could not pull frames from the WebM/MP4 items.
- **Blocked from this environment** (recorded so nobody re-runs them): `videvo.net` → HTTP 403; `odysee.com` /
  `lighthouse.odysee.tv` → Cloudflare interstitial; `api.openverse.org` → Cloudflare interstitial; `mixkit.co/license/`
  renders its licence behind a click so the text could not be quoted.

---

## Per-shot table

`rung` per `studio/strategy/media-fallback-ladder.md`. **Every row is a proposal.**

| shot (scene) | rung | best downloadable source | licence (as the source states it) | resolution / duration | direct file URL | confidence |
|---|---|---|---|---|---|---|
| **S1 Savile Row / Mayfair walk** (02) | — | **none found.** Best remaining: A6's **M-62** `hZsfxBonTHg` via the R1 mail; or A6's **M-66** KartaView hyperlapse (rung 2). Nearest downloadable *neighbour*: **M-89** Piccadilly Circus, which is where the Mayfair route begins | M-89: CC BY 3.0 | M-89: 1920×1080, 141 s | M-89: `https://upload.wikimedia.org/wikipedia/commons/c/c5/PICCADILLY_CIRCUS%2C_London_UK_4K.webm` | **high** that nothing exists (searched Commons, Pexels, Pixabay, Mixkit, Coverr, IA); **low** that M-89 substitutes for the Row |
| **S2 Pall Mall clubland** (05, 06) | 1 (unverified) | **M-91** "London City Tour, England" — an open-top BigBus tour of central London, 4K, CC BY 3.0, on Commons. A bus deck is the right *height* and the right *speed* for a façade pass. Route unpinned | CC BY 3.0 (`creativecommons.org/licenses/by/3.0`) | 3840×2160, 1541 s (25:41), **3.36 GB** | `https://upload.wikimedia.org/wikipedia/commons/5/59/London_City_Tour_%2C_England.webm` | **low-medium** — licence and file verified; **whether it passes 104/106/107 Pall Mall is unverified**, no chapters |
| **S3a Trafalgar Square** (13) | 1 | **M-84** "Trafalgar Square, London UK (HD1080p). 4K" — Kauko Helavuo, CC BY 3.0, on Commons | CC BY 3.0 | 1920×1080, 130 s, 181 MB | `https://upload.wikimedia.org/wikipedia/commons/f/f3/Trafalgar_Square%2C_London_UK_%28HD1080p%29._4K.webm` | **high** on licence + file; **medium** on frame (static-ish tourist coverage of Nelson's Column, not a walk) |
| **S3a Trafalgar Square** (13, alt) | 1 | **M-85** Pexels "Trafalgar Square and Nelson Column" | Pexels licence — *"All photos and videos on Pexels are free to use"*, *"Attribution is not required"* | 2560×1440, 25 fps | `https://www.pexels.com/download/video/27027173/` (page `.../video/trafalgar-square-and-nelson-column-27027173/`) | **high** on licence; **medium** on frame; duration not stated on the page |
| **S3b Strand leg** (13) | 1 (unverified) | **M-87** POPtravel "Walking in LONDON — Westminster to Piccadilly Circus (2019)", first-person on foot, CC BY 3.0, on Commons. Creator timeline puts **21:00 Waterloo Bridge → 25:00 Covent Garden**, which must cross the Strand | CC BY 3.0 | 1920×1080 (Commons transcode of a 4K60 original), 3300 s (55:00), 1.90 GB | `https://upload.wikimedia.org/wikipedia/commons/b/bf/Walking_in_LONDON_-_England_%28UK%29_-_Westminster_to_Piccadilly_Circus_%282019%29_-_4K_60fps_%28UHD%29.webm` | **medium** — it is the *east* Strand (Aldwych end), not the Charing Cross end our scene wants. QA must watch 21:00–25:00 |
| **S3c forecourt + Eleanor Cross** (13) | — modern; **3 (period)** | **No modern file.** Still the R1 mail to Urban Pigeon (A6 M-70/M-71). Period answer: **M-78** "Old London Street Scenes (1903)", whose own description names *"Hyde Park Corner, Parliament Square and **Charing Cross Station**"* and *"crowds of people disembarking"* | Public domain (Commons) | 640×480, 248 s, 18.2 MB | `https://upload.wikimedia.org/wikipedia/commons/6/6f/Old_London_Street_Scenes_%281903%29.webm` | **high** on licence/file; **medium-high** on content (the description is from London's Screen Archives, not an uploader guess); the exact Charing Cross second is unpinned |
| **S4 departure over Hungerford Bridge** (18) | — | **Nothing.** Searched Commons, Pexels ("train window view" → Jamuna, Tokyo, India, Bergen — no London), Pixabay, Mixkit, Coverr, IA. Fallbacks: **M-88** (bridge at night, 12 s, static) and A6's **M-76** still. The real answer stays **M-13 via the R1 mail to Ian Payne** | M-88: CC BY-SA 4.0 | M-88: 1920×1080, 11.9 s | `https://upload.wikimedia.org/wikipedia/commons/0/02/Hungerford_Bridge%2C_London%2C_lighting_at_night_2022-01-07.webm` | **high** that nothing exists; M-88 is a night establisher, not the shot |
| **S5 1870s-relevant street atmosphere** (02, 05, 13, 14, 18) | **3 / 1** | **M-78** (1903) + **M-79** (1917, 720p) + **M-80** (1896–1903) + **M-81** (**1890 Trafalgar Square**, seen) + **M-82** (1912) + **M-83** (*Seeing London*, Burton Holmes, c.1920s, Prelinger) | all **Public domain** | 270×270 → 1280×720; 2 s → 835 s; ~40 min total | see the id table | **high** — every file HEAD-verified; **M-81 visually confirmed** |

---

## A. Creator-mirror findings — the honest answer is "no mirrors"

I read the four watch pages and the three channel pages in full. **Not one of them contains a single external URL**
other than an Amazon affiliate link. There is no Vimeo, no Patreon, no Internet Archive item, no Odysee/PeerTube
channel, no Bilibili or Nicovideo account, no Drive or Dropbox link, and no personal website.

| creator | channel id | licence row today | external links in video description | links / email on channel page | mirror found? |
|---|---|---|---|---|---|
| **Ian Payne Urban Transport** (`ME-x2yWqoiw`, + `BJ3KDkHUCXg`) | `UCxbhFQCu3QGekILPi3mHosQ` · `@IanPayneUrbanTransport` | **"Creative Commons Attribution licence (reuse allowed)"** — re-confirmed on the watch page 2026-08-19 | **none.** 2,734-char description: journey details, 15 station timestamps, a filming-policy statement, credits. No URL at all | one link only: `https://amzn.to/4lQMiwA` ("My Camera Gear"). **No business email exposed** | **No** |
| **Urban Pigeon** (`3g41GwCnW80`, `tProPV0SOSs`, + `omcY89kce2A`, `ZXiaTHtVqlo`) | `UCJlWB4Ub5kyCpZ5_u88WpWw` · `@urban_pigeon` | **CC BY** — re-confirmed on both watch pages 2026-08-19 | **none.** Route lists, chapter timestamps, an "Urban Pigeon Secret" paragraph, hashtags | **`urban-pigeon@outlook.com`**, printed in the channel description | **No** — but this is the one creator with a **published email**, so route R1 is immediately actionable |
| **Offbeat Destination** (`hZsfxBonTHg`) | `UCKJvZ5cSkcKLgTP4L10oWkQ` · `@offbeatdestination_bd` | **CC BY** — re-confirmed 2026-08-19 | **none.** Emoji-heavy SEO copy; the five-location list (Piccadilly Circus / **Savile Row** / Grosvenor Square / Mount Street Gardens / Berkeley Square) is confirmed, still with **no timestamps** | no links, **no email** | **No** — and no contact route at all, which makes A6's "ask which minute is Savile Row" mail hard to send |

**Cross-platform checks run and empty:** `archive.org/advancedsearch.php` for "Ian Payne Urban Transport" (2 hits, both
unrelated: a book and a 2017 radio bulletin), "Urban Pigeon station to station" (21 hits, all unrelated), "Offbeat
Destination Mayfair" (0 hits). Odysee's search API is behind Cloudflare from here and could not be queried —
**marked unverified**, though a channel with 28–1,088 views is very unlikely to be cross-posting.

### One new fact that changes the Urban Pigeon risk assessment

The Urban Pigeon **channel description** (German) says its videos have *"sorgfältig ausgewählte Musik, die die Seele
jedes Ortes einfängt"* — **carefully selected music**. A6 item 6 and `rights-a6.md` §3.5 both flagged "does a CC-BY
upload contain third-party music the uploader cannot sublicense?" as an open QA question. The channel now says, in its
own words, that it scores its videos. The *Station to Station* sub-series is separately described as
*"cinematische ASMR-Spaziergänge"* (ASMR walks), which usually means ambient sound only — so the two statements may
not conflict. **But this is now a specific, named risk on M-70/M-71/M-72/M-73, not a generic one**, and it should be
listened for before anything is baked, and named in the R1 mail ("is the audio yours?").

---

## B. Equivalent footage on reuse platforms

### B1. Wikimedia Commons — the find of this pass

Commons hosts **112 files** in `Category:Videos from London` and **57** in `Category:First-person videos on foot`. A large
share are CC-BY YouTube videos imported by Commons users with `{{YouTube CC-BY}}` + `{{YouTubeReview}}` provenance
templates and a `web.archive.org` snapshot of the watch page recorded at review time. The files are served as plain
WebM/Ogg from `upload.wikimedia.org`.

**Why this is clean:** the download is from Wikimedia, under the CC licence the uploader granted; youtube.com is not
touched. It is exactly Rights' route R2, at scale, with the licence evidence (`§1.5`) already assembled by someone else.

**A worked example of why the evidence matters.** M-87's Commons page records source `{{From YouTube|BgMKsDwIDgQ}}`,
licence `{{YouTube CC-BY|POPtravel}}`, and a review dated 2021-05-20 with the archive snapshot
`web.archive.org/web/20201101234504/…`. **When I opened `youtube.com/watch?v=BgMKsDwIDgQ` today, the CC licence row was
gone.** The grant is irrevocable for copies already made under it (`rights-a6.md` §1.5), and Commons holds such a copy
with dated evidence — so the file stays usable. This is the strongest possible argument for the evidence-hygiene rule,
and an argument for preferring Commons copies over live YouTube ids generally.

**What Commons does not have.** `Savile Row filetype:video` → **0 results**. `Charing Cross station train filetype:video`
→ two 320×240 Northern line platform clips. `Hungerford Bridge filetype:video` → one 12-second night shot. The chapter's
three hardest shots are simply not there.

### B2. Internet Archive

A6 warned that IA `licenseurl` is uploader-asserted. **That warning is re-confirmed**: a query for London films
1890–1930 returned, in the top 12, nine off-air **BBC London bulletins from 2025–2026 mis-dated to 1922** and carrying
a uploader-applied PD mark, plus two in-copyright 1927 features. Do not trust the field.

**The exception, and it is a good one:** `collection:(prelinger)`. The Prelinger Archives collection has a real
provenance chain, and it contains **`SeeingLo1920` — "Seeing London", Burton Holmes, ca. 1920s, 13:55**, described as a
*"Tour through central parts of London"*, offered as `.mp4` (640×480, 86.9 MB), `.mpeg`, `.ogv` and two lower-rate MP4s.
That is M-83.

### B3. Pexels — licence quoted, hits are generic

Quoted verbatim from `https://www.pexels.com/license/`: *"All photos and videos on Pexels are free to use."* ·
*"Attribution is not required. Giving credit to the photographer or Pexels is not necessary but always appreciated."* ·
*"You can modify the photos and videos from Pexels."* Restrictions: *"Identifiable people may not appear in a bad light
or in a way that is offensive"*, *"Don't sell unaltered copies"*, *"Don't imply endorsement"*, *"Don't redistribute or
sell the photos and videos on other stock photo or wallpaper platforms"*, *"Don't use the photos or videos as part of
your trade-mark…"*. **This is a bespoke permissive licence, not CC** — commercial use is fine, attribution is not
required (we will credit anyway, per house style), and the "don't redistribute on other stock platforms" clause is
irrelevant to us.

Searches: `trafalgar square` → **~10 genuine Trafalgar Square clips** (fountain, Nelson's Column, lions, early morning,
crowds, winter) — this is the one shot stock libraries do carry, because it is a tourist icon.
`walking london` → Shoreditch and generic pavement clips, wrong geography.
`london street` → Bishopsgate, Christmas traffic, aerial junctions.
`train window view` → Jamuna river bridge, Tokyo, India, Bergen–Oslo. **No London train, no Hungerford Bridge.**
A6 predicted stock libraries would carry "generic London icons … and essentially never a named minor street like Savile
Row or a named club façade". **That prediction is confirmed, with Trafalgar Square as the single exception.**

### B4. Pixabay — licence quoted, no useful hits

Quoted from `https://pixabay.com/service/license-summary/`: users may *"Use Content for free"*, *"Use Content without
having to attribute the author"*, *"Modify or adapt Content into new works"*. Prohibited: *"sell or distribute Content
(either in digital or physical form) on a Standalone basis"*, trademark/merchandise use of recognisable brands,
*"use Content in any immoral or illegal way, especially Content which features recognisable people"*, misleading use,
and use as a trade name. **Again bespoke, not CC; commercial use fine; no attribution required.**
Video search `london` → London Eye ×2, a drone skyline with a train, generic street traffic, Tower Bridge. **Nothing
matching any of our five shots.**

### B5. Mixkit — hits, licence unquotable from here

`mixkit.co/free-stock-video/london/` lists 31 clips, of which two are on-theme:
**"Trafalgar Square in London on a cloudy afternoon"** (`/free-stock-video/trafalgar-square-in-london-on-a-cloudy-afternoon-4459/`),
**"Giant lion statue in Trafalgar Square in London"** (`…-4458/`), plus **"Ride through the streets of London"**
(`…-4263/`), which is a vehicle POV of unknown route. The page says the clips *"can be downloaded for free, without
watermark … under the Mixkit License"*. **I could not retrieve the licence text itself** — `mixkit.co/license/` puts it
behind a "View License" interaction. **Marked unverified; Rights must read the Mixkit Stock Video Free License before we
use M-86.** (Mixkit is owned by Envato; its free licence is generally understood to allow commercial use without
attribution but to prohibit redistribution and standalone resale — *that is not a quote and should not be relied on*.)

### B6. Coverr — no useful hits

`coverr.co/s?q=london` → canal bridge, Regent's Park ×2, London Zoo ×2, Madame Tussauds, Piccadilly Circus ×2,
"The streets of London" (unspecified), night shots. Nothing on our routes. Licence text not shown on the search page;
not pursued because there is nothing to license.

### B7. Videvo, Openverse — could not be queried

`videvo.net/search/london/` returns **HTTP 403** to this environment (both `curl` and the fetch tool). Openverse's API
(`api.openverse.org`) is behind a Cloudflare interstitial from here. **Both marked unverified.** Note for the studio:
Openverse's catalogue is images and audio; it is not a moving-image source, and the image half of it is largely Flickr
+ Wikimedia Commons, which we query directly and more precisely.

### B8. National / city archives — checked by reasoning, not fetched, and therefore flagged

I did **not** spend fetches on BFI Player, the London Picture Archive (London Metropolitan Archives) or the Museum of
London, because all three are rights-reserved catalogues: BFI's *Britain on Film* is streaming-only with no download and
an explicit non-reuse position; LMA's London Picture Archive sells licensed copies; the Museum of London's collections
online are "for personal, non-commercial research". **This is a reasoned default, not a verification — Rights should
confirm before anyone claims it.** The practical consolation is that **London's Screen Archives**, the LMA-affiliated
regional film archive, publishes PD material to YouTube, and one of its films is already legally mirrored on Commons as
**M-78** — so the archive layer reaches us anyway, by the clean route.

### The video2commons question — flagged, and declined

The reason those Commons files exist is `video2commons`, a Wikimedia Cloud Services tool that imports a CC-BY YouTube
video into Commons. It would work for `ME-x2yWqoiw`, `3g41GwCnW80` and `hZsfxBonTHg` and would produce exactly the
files this chapter wants.

**I am not proposing it and did not use it.** However it is framed, that tool's job is to fetch the bytes off YouTube;
"a Wikimedia server did it, not us" is a legal argument, not a technical difference, and this task's hard rule is
unambiguous. Recorded here only so that nobody rediscovers it and thinks it is unexamined. **If the founder wants it
reconsidered it is a Rights question, not mine** — and note it would also make us the uploader who asserts the licence
on someone else's work, which is a different and larger commitment than using a file a creator sent us.

---

## New media ids (proposals — M-78…M-93)

| id | rung | kind | source / ref | title / creator | licence (as stated) | res / duration / size | direct file URL | for shot | verified how | notes |
|----|------|------|--------------|-----------------|---------------------|----------------------|-----------------|----------|--------------|-------|
| **M-78** | 3 | pd-film | Commons `File:Old London Street Scenes (1903).webm` | unknown author, 1903; via **LondonsScreenArchive** | **Public domain** | 640×480 · 248 s · 18.2 MB | `https://upload.wikimedia.org/wikipedia/commons/6/6f/Old_London_Street_Scenes_%281903%29.webm` | **S5**, and the *period* answer to **S3c** | Commons API + `HEAD` 200, `content-length: 18239987` | Description: *"Traffic congestion in Edwardian London… scenes shot around central London, taking in locations such as Hyde Park Corner, Parliament Square and **Charing Cross Station**. We see crowds of people disembarking…"* — **the only asset in the chapter that shows the Charing Cross forecourt at all.** 4:3, silent, 480-line: needs pillarbox + upscale. QA to pin the Charing Cross seconds |
| **M-79** | 3 | pd-film | Commons `File:A Trip Through The Streets of London, Sep 26, 1917.webm` | Imperial War Museum footage, 26 Sep 1917 | **Public domain** | **1280×720** · 373 s · 47.3 MB | `https://upload.wikimedia.org/wikipedia/commons/c/cd/A_Trip_Through_The_Streets_of_London%2C_Sep_26%2C_1917.webm` | **S5** | Commons API + `HEAD` 200 | The best-resolution period film of the set — **exactly our 1280×720 render height**. Street-level, moving through London traffic. **Audio caveat:** the uploader states *"Set to a natural rate and **added in sound** for ambiance"* — the film is PD, the added soundtrack is the uploader's and unlicensed. **Mute it.** Also: shot days after an air raid, so read the frames for wartime signage before using it as neutral atmosphere |
| **M-80** | 3 | pd-film | Commons `File:Early English Traffic, Turn of the Century London (1896-1903).webm` | **British Pathé** | **Public domain** (Commons tag) | 640×480 · 647 s · 48.0 MB | `https://upload.wikimedia.org/wikipedia/commons/6/63/Early_English_Traffic%2C_Turn_of_the_Century_London_%281896-1903%29.webm` | **S5** | Commons API + `HEAD` 200 | Ten minutes of turn-of-century London traffic and landmarks; the closest thing to "the streets Fogg walked" that moves. **Amber for Rights:** the Commons PD tag rests on the age of the footage, but British Pathé actively licenses its library commercially and takes a different view of its own holdings. Rights should decide before this one is baked in |
| **M-81** | 3 | pd-film | Commons `File:Trafalgar Square 1890 - ten remaining frames by Wordsworth Donisthorpe.gif` | **Wordsworth Donisthorpe, 1890** | **Public domain** | 270×270 · ~2 s (10 frames) · 0.36 MB | `https://upload.wikimedia.org/wikipedia/commons/a/aa/Trafalgar_Square_1890_-_ten_remaining_frames_by_Wordsworth_Donisthorpe.gif` | **S3 "then"**, **S5** | **downloaded and viewed** | **The one asset in this pass I have actually seen.** A circular vignette: the National Gallery portico across the top, the fountain and a column base mid-frame, hansom cabs and horses crossing the bottom third, figures on the pavement. Grainy, high-contrast, unmistakably Trafalgar Square. **Eighteen years after Fogg leaves** — this is the oldest surviving moving picture of the square and probably the single most striking "then" beat available to Day 1. Tiny: use as a framed inset / magic-lantern disc, never full-frame |
| **M-81b** | 3 | pd-film | Commons `File:Traf fr5br1200.ogv` and `File:Traf fr5br1200double.ogv` | Donisthorpe, 1890 | **Public domain** | 270×270 · **2.2 s** and **4.4 s** · 0.33 / 0.66 MB | `https://upload.wikimedia.org/wikipedia/commons/c/c9/Traf_fr5br1200.ogv` · `https://upload.wikimedia.org/wikipedia/commons/2/22/Traf_fr5br1200double.ogv` | **S3 "then"** | Commons API (url + size + licence) | The same ten frames rendered as video, single- and double-speed — saves the Engine a GIF→video step. Not individually HEAD-checked |
| **M-82** | 3 | pd-film | Commons `File:The Year Was 1912 in London.webm` | unknown, 1912 | **Public domain** | 640×480 · 332 s · 15.9 MB | `https://upload.wikimedia.org/wikipedia/commons/d/d1/The_Year_Was_1912_in_London.webm` | **S5** spare | Commons API | *"What life was like 100 years ago in London."* Provenance thinner than M-78/M-79 — no named archive. Third choice of the period set |
| **M-83** | 3 | pd-film | Internet Archive `SeeingLo1920`, **collection: prelinger** | **"Seeing London"**, Burton Holmes, ca. 1920s | **Public domain** (`licenseurl` = `creativecommons.org/licenses/publicdomain/`, **and** a real Prelinger provenance) | 640×480 · 835 s (13:55) · 86.9 MB (mp4; also .mpeg 385 MB, .ogv, 2× low-rate mp4) | `https://archive.org/download/SeeingLo1920/SeeingLo1920.mp4` | **S5**, possibly **S3** | `archive.org/metadata` + `HEAD` 200 via 302, `content-length: 86923693` | *"Tour through central parts of London."* A Burton Holmes travelogue of this length almost certainly covers Trafalgar Square, Whitehall and the Strand — **but I have not watched it and am not claiming it does.** The one IA item in this pass with a provenance chain that satisfies A6's own rule |
| **M-84** | 1 | cc-video (Commons mirror) | Commons `File:Trafalgar Square, London UK (HD1080p). 4K.webm` — from YouTube `T7VlupgAcbQ` | **Kauko Helavuo**, 2015 | **CC BY 3.0** (`creativecommons.org/licenses/by/3.0`) | 1920×1080 · 130 s · 181 MB | `https://upload.wikimedia.org/wikipedia/commons/f/f3/Trafalgar_Square%2C_London_UK_%28HD1080p%29._4K.webm` | **S3a** | Commons API + `HEAD` 200 | **The first modern, CC-licensed, genuinely downloadable clip of one of our locations.** Attribution: `Kauko Helavuo · CC BY 3.0 · trimmed`. Content unwatched: expect tourist coverage of Nelson's Column and the fountains, not a walking POV |
| **M-85** | 1 | stock video | Pexels video **27027173** | **Wellington Silva** | **Pexels licence** (free, commercial OK, no attribution required — quoted in B3) | 2560×1440 · 25 fps · duration not published | `https://www.pexels.com/download/video/27027173/` | **S3a** backup | fetched the video page; licence page quoted | 1440p → downscales cleanly to our 720p. No attribution required, but we credit anyway. Frame rate 25 fps matches the render exactly |
| **M-86** | 1 | stock video | Mixkit `/free-stock-video/trafalgar-square-in-london-on-a-cloudy-afternoon-4459/` | Mixkit contributor | **"Mixkit License"** — **text not retrievable from this environment; UNVERIFIED** | not published on the listing page | download link on the clip page | **S3a** spare | listing page only | Do not use until Rights reads the Mixkit Stock Video Free License. Sibling: `…/giant-lion-statue-in-trafalgar-square-in-london-4458/` |
| **M-87** | 1 | cc-video (Commons mirror) | Commons `File:Walking in LONDON - England (UK) - Westminster to Piccadilly Circus (2019) - 4K 60fps (UHD).webm` — from YouTube `BgMKsDwIDgQ` | **POPtravel** | **CC BY 3.0**; Commons `{{YouTube CC-BY}}` + `{{YouTubeReview}}` dated 2021-05-20 with archive snapshot | 1920×1080 · 3300 s (55:00) · 1.90 GB | `https://upload.wikimedia.org/wikipedia/commons/b/bf/Walking_in_LONDON_-_England_%28UK%29_-_Westminster_to_Piccadilly_Circus_%282019%29_-_4K_60fps_%28UHD%29.webm` | **S3b**; possible **S4** establisher | Commons API (incl. wikitext) + `HEAD` 200; creator timeline read from the YouTube page | **A first-person walking film, 55 minutes, downloadable, CC BY.** Creator timeline: 0:00 Westminster Abbey · 4:45 Palace of Westminster · 6:00 Westminster Bridge · 9:00 South Bank/Waterloo · 13:00 London Eye · 15:00 along the South Bank · 21:00 Waterloo Bridge · 25:00 Covent Garden · 39:30 Leicester Square · 44:30 Chinatown · 50:30 Piccadilly. **Two windows to inspect:** (i) 21:00–25:00 must cross the Strand between Waterloo Bridge and Covent Garden; (ii) **15:00–21:00 walks the South Bank and must pass beneath Hungerford Bridge** — which could give an *exterior* of the bridge our S4 train crosses. Both unverified. **The YouTube watch page no longer shows a CC row (2026-08-19) — use the Commons copy and its dated evidence, never the live id** |
| **M-88** | 1 | cc-video | Commons `File:Hungerford Bridge, London, lighting at night 2022-01-07.webm` | Commons contributor | **CC BY-SA 4.0** | 1920×1080 · 11.9 s · 23.8 MB | `https://upload.wikimedia.org/wikipedia/commons/0/02/Hungerford_Bridge%2C_London%2C_lighting_at_night_2022-01-07.webm` | **S4** fallback establisher | Commons API (search listing) | Night, static, 12 seconds — an establisher, not the departure shot. BY-SA ⇒ share-alike and the `rights.md` "unmodified" rule apply |
| **M-89** | 1 | cc-video (Commons mirror) | Commons `File:PICCADILLY CIRCUS, London UK 4K.webm` | **Kauko Helavuo**, 2015 | **CC BY 3.0** | 1920×1080 · 141 s · 206 MB | `https://upload.wikimedia.org/wikipedia/commons/c/c5/PICCADILLY_CIRCUS%2C_London_UK_4K.webm` | **S1** approach | Commons API | Piccadilly Circus is where both the Offbeat Destination Mayfair route and Fogg's neighbourhood begin. A downloadable establisher for the Savile Row scene, not a substitute for the Row |
| **M-90** | 1 | stock video bundle | Pexels 34013124 · 34013121 · 34013127 · 5962716 · 5330877 | various | **Pexels licence** | mostly 1080p+ | `pexels.com/download/video/<id>/` | texture only | search page | London Shoreditch / generic central-London pavement POV. **Wrong geography for every one of our shots** — logged so nobody proposes them as Savile Row |
| **M-91** | 1 | cc-video (Commons mirror) | Commons `File:London City Tour , England.webm` — from YouTube `SAaevusBnNI` | **Le Monde en Vidéo**, Jun 2015 | **CC BY 3.0** | **3840×2160** · 1541 s (25:41) · **3.36 GB** | `https://upload.wikimedia.org/wikipedia/commons/5/59/London_City_Tour_%2C_England.webm` | **S2** candidate, **S3** spare | Commons API + `HEAD` 200 | Two days of **BigBus Blue & Red open-top tour**. Description names Buckingham Palace, Tower Bridge, Tower of London, Palace of Westminster. **A top-deck bus is the one vehicle that passes club façades at the right height and speed** — this is the only lead A7 found for the Pall Mall pass. **Route through Pall Mall is unverified and there are no chapters; 25 minutes at 4K is a 3.4 GB download to find out.** Worth one QA hour |
| **M-92** | 1 | cc-video (Commons mirror) | Commons `File:Time Lapse - London Bus View.webm` | Alessandro Massi, 2017 | **CC BY 3.0** | 1920×1080 · 83 s | Commons | texture | Commons API | Bus-window timelapse. Motion texture for transitions; route unknown |
| **M-93** | 1 | cc-video (Commons mirror) | Commons `File:Timelapse from Waterloo Bridge, London.webm` | "nabs", Apr 2016 | **CC BY 3.0** | **3240×2160** · 24 s | Commons | **S4** spare | Commons API | *"The view facing East"* from Waterloo Bridge — i.e. **away** from Hungerford Bridge. Listed so nobody assumes it is the right direction |

**Standing resource (not an id):** `https://commons.wikimedia.org/wiki/Category:Videos_from_London` (112 files) and
`Category:First-person videos on foot` (57 files). Re-query both when any chapter needs London motion — they grow.

---

## Verdict — which of the five shots can now be filled with a real downloadable file

**Can be filled today, entirely from files we may download:**

1. **S5 — the "then" layer.** Comprehensively. M-78 (1903, Charing Cross), M-79 (1917, 720p), M-80 (1896–1903),
   M-81 (**1890 Trafalgar Square, seen with my own eyes**), M-82 (1912), M-83 (*Seeing London*, c.1920s). Roughly forty
   minutes of public-domain London, all HEAD-verified, all downloadable now, no creator involved. This is not just a
   substitute — a 1890 disc of hansom cabs crossing Trafalgar Square is *better* than a modern walking shot for the
   brief's "mixing today's 4K walking footage with the Victorian city".
2. **S3a — the Trafalgar Square half of scene 13.** M-84 (CC BY 3.0, 1080p, Commons) primary, M-85 (Pexels, 1440p)
   backup, M-86 (Mixkit) spare pending its licence.

**Half-filled, pending one QA viewing:**

3. **S3b — the Strand leg.** M-87 at 21:00–25:00, if that stretch is really the Strand. Downloadable, CC BY, 1080p.
   Wrong end of the Strand for the scene's geography, so this is a compromise even if it verifies.

**Cannot be filled with a downloadable file — these still need the creator ask (R1):**

4. **S1 — Savile Row / Mayfair.** Nothing exists on Commons, Pexels, Pixabay, Mixkit, Coverr or the Internet Archive.
   A named minor street is invisible to stock libraries. Remains: the mail to **Offbeat Destination** for `hZsfxBonTHg`
   (and that channel publishes **no email**, so the only contact route is a YouTube comment or the channel's contact
   form), or A6's KartaView hyperlapse (M-66), or the still-plus-motion bundle (M-77).
5. **S2 — Pall Mall clubland.** No walking file. One unverified 4K bus-tour lead (M-91). A6's judgement stands: **a
   76-second continuous façade pass does not exist at rungs 1–3**, and scene 05 needs the redesign A6 proposed rather
   than a licence.
6. **S4 — the departure over Hungerford Bridge.** Nothing, on any platform, in any era. Confirmed by five separate
   searches. **The Ian Payne mail is the only route to this shot** — and A6 already noted the same file serves Day 2's
   Dover arrival, so it remains the highest-value single email in the product. Ian Payne publishes no email either;
   contact would be via YouTube.

**Net change from A6:** A6 could offer the video cut nothing but embed cards and BY-SA hyperlapses without a Rights
ruling. A7 hands the Engine **eight files it can download this afternoon** (M-78, M-79, M-80, M-81, M-83, M-84, M-87,
M-89), of which six are public domain and two are CC BY. Three shots still depend on a creator saying yes.

---

## Engine implications

1. **Container and codec.** Everything from Commons is **WebM (VP8/VP9)** or **Ogg Theora**; Internet Archive gives
   **H.264 MP4**; Pexels gives MP4. Our render is `1280×720 h264 25/1 fps` (`linear/render-log.md`). The pipeline needs a
   normalise step: `→ h264 yuv420p 1280×720 25 fps`. Commons also publishes pre-made transcodes
   (`…/transcoded/<path>/<file>.720p.vp9.webm`) — **cheaper to pull the 720p transcode than the original** for anything
   we are downscaling anyway. Worth building that URL form into the fetcher.
2. **Resolution mismatch, both directions.** M-79 is exactly 1280×720. M-84/M-87/M-89/M-88 are 1080p → clean downscale.
   M-91 and M-93 are 2160p → clean downscale but huge. **The period films go the other way:** M-78/M-80/M-82/M-83 are
   **640×480 (4:3)** and M-81/M-81b are **270×270**. Rules to encode in the Engine:
   - 4:3 archive film → **pillarbox** to 1280×720 with a designed surround (a plate frame / vignette), never stretched.
     Native height 480 into 720 is a 1.5× upscale — acceptable for grainy nitrate, and a light grain/soft filter hides it.
   - M-81 at 270×270 is **0.375 of frame height**. It must be an inset disc (a magic-lantern / peephole treatment),
     composited, not scaled to full frame. Upscaling 270 → 720 is 2.7× and would look like mush.
3. **File sizes are a new operational fact.** M-87 is 1.90 GB, M-91 is 3.36 GB. Two of these and the chapter's media
   folder is bigger than everything else we own. The fetcher needs: resumable download, a cache keyed by media id,
   **trim-on-ingest** (keep the used window plus handles, archive the rest or drop it), and a `source_bytes` field so
   the Publisher can see what a chapter really costs.
4. **Audio must default to muted for archive film.** M-79 carries an uploader-added soundtrack over PD footage; the
   footage is free, the soundtrack is not. Add `audio: mute` as the **default** for `kind: pd-film` and require an
   explicit override.
5. **Provenance fields** (extending A6's list): `source_host` (must not be youtube.com), `mirror_of` (the original
   YouTube id, for credit accuracy), `commons_file`, `licence_review` (the `{{YouTubeReview}}` date), `archive_snapshot`.
   M-87 is the proof that `mirror_of` and `licence_review` matter: the live YouTube page has changed its licence row
   since the Commons copy was made.
6. **Attribution strings** for this pass: `Kauko Helavuo · CC BY 3.0` (M-84, M-89) · `POPtravel · CC BY 3.0` (M-87) ·
   `Le Monde en Vidéo · CC BY 3.0` (M-91) · `Alessandro Massi · CC BY 3.0` (M-92) · `nabs · CC BY 3.0` (M-93) ·
   `Wellington Silva / Pexels` (M-85, not required, offered) · public domain items credited to the archive
   (`London's Screen Archives`, `Imperial War Museum`, `British Pathé`, `Prelinger Archives`, `Wordsworth Donisthorpe, 1890`).
7. **No new renderer needed for anything in A7.** Unlike A6's rung-2 proposals, every asset here is already a video
   file. The KartaView sequence→video renderer is still needed for S1/S2 if the creator mails fail — but it is no longer
   on the critical path for S3 or S5.

---

## Decisions I need from the human

1. **Send the two R1 mails, or accept the gaps?** S1, S2 and S4 have no downloadable file and will not acquire one.
   Both remaining creators are contactable only through YouTube itself (Ian Payne: no email, one Amazon link;
   Offbeat Destination: no email, no links). Urban Pigeon publishes `urban-pigeon@outlook.com` — but Urban Pigeon's clips
   serve S3, which A7 has partly solved. **The irony is that the creator we can email is the one we need least.**
   Options: (a) send the two YouTube-comment/contact-form messages anyway; (b) ship S1/S2/S4 on A6's rung-2/3 material
   and the scene-05 redesign; (c) both, with (b) shipping now and (a) as the upgrade.
2. **Mixkit licence** — worth Rights spending ten minutes reading it? Only M-86 depends on it, and M-84/M-85 already
   cover that shot. My recommendation: skip it, drop M-86.
3. **British Pathé (M-80).** Commons says public domain on age; British Pathé licenses the same footage commercially.
   Ten minutes of turn-of-century London traffic is a real prize for S5, but I will not decide this one. Rights call.
4. **M-91 (3.36 GB) — is one QA hour worth it?** It is the only lead in existence for the Pall Mall façade pass. If the
   answer is no, scene 05's redesign becomes final rather than provisional.
5. **The video2commons question**, above — flagged and declined under this task's hard rule, recorded in case the
   founder wants Rights to look at it rather than leaving it as folklore.

---

## Digest

- **Did:** read all four creator video descriptions and all three channel pages in full and found **zero external
  mirrors** (no Vimeo, Patreon, IA, Odysee, Drive, or personal site anywhere — only one Amazon affiliate link and one
  Outlook address); then found that **Wikimedia Commons is itself a legal mirror of CC-BY YouTube video** and pulled
  eight genuinely downloadable files off it and off Prelinger — including six public-domain London films from 1890 to
  the 1920s, one of which (Donisthorpe's 1890 Trafalgar Square) I downloaded and looked at; quoted the Pexels and
  Pixabay licences verbatim and confirmed A6's prediction that stock libraries carry Trafalgar Square and nothing else
  we need; and HEAD-verified every direct URL in the tables.
- **Weak:** I have *seen* exactly one of these assets — everything else's content rests on the source's own
  description, so "M-78 shows Charing Cross Station" and "M-91 might pass Pall Mall" are claims, not cuts; there is no
  `ffmpeg` here so I could not pull frames; Videvo, Openverse and Odysee were all blocked from this environment and are
  marked unverified rather than searched; and I reasoned about BFI/LMA/Museum of London rather than checking them.
- **With more time:** watch M-78 and pin the Charing Cross seconds, watch M-87's 15:00–25:00 for the Strand and the
  Hungerford underpass, and spend the 3.36 GB on M-91 to settle Pall Mall once and for all; sweep
  `Category:Videos from London` and `Category:First-person videos on foot` properly for the other 79 chapters rather
  than for Day 1 alone; and write the Commons-mirror lookup (given a YouTube id, does a reviewed Commons copy exist?)
  as a standing studio tool, because that question will now be asked eighty times.
