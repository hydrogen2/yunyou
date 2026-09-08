# Scenes (FILM) — Day 1: London — half a mile, and the year the world closed

**Scene Developer + Narrator:** scene-developer (Claude), acting as both   **Date:** 2026-09-08   **Status:** draft, unrendered
**Authority:** `rundown/rundown-film.md` (rev 2) **including the Chief's rulings appended at its foot** · `studio/strategy/video-first.md` · `DECISIONS.md` D9, D8, RULE 1
**Facts:** `research/places.md` (F-110…F-155, the spine) · `research/fact-sheet.md` (F-01…F-47, the thread)
**Media:** `media/manifest.md` (M-01…M-106) · `media/manifest-motion.md` (M-107…M-119)

**Real total: 1,122 s = 18 min 42 s.** 12 scenes · **162 authored visual slots** · average shot **6.9 s** · longest still or card **12 s** · longest shot **14 s**.
**Narration: 1,585 words (1,601 tokens by the validator's `split()`, which counts free-standing em-dashes) =
10 min 40 s of speech at 150 wpm = 57 % fill**, i.e. 8 min 2 s of the film is picture without words.
The plan's cap was ≤ 1,600 words and ~60 % fill; both are met. **All 26 HOLD markers in the plan's shot tables are honoured**
(L2 counts them as 19 distinct silences), and each scene's `review.notes` names its silent windows by second.

> **This file supersedes `scenes/retired-player-18/README.md`.** The old 18-scene interactive chain has been moved,
> unaltered and still in git history, to `scenes/retired-player-18/`. It is not deleted because the linear cut sheet
> (`studio/tools/render/cuts/day-01-london.json`), the Mandarin locale (`i18n/zh-Hans.json`) and the cached pano
> directories all still address it by scene id. Nothing in this directory reads it.

---

## 1 · The scenes, in order

| # | file | scene id | block | s | slots | words | fill | what carries the block |
|---|------|----------|-------|---|------:|------:|-----:|------------------------|
| 1 | `01-cold-open.scene.json` | `cold-open` | **S0** | 45 | 8 | 65 | 58 % | Three motion shots (Savile Row, Pall Mall, Charing Cross), the telegraph map drawing itself to a date card, Neuville's Fogg, then the title card. |
| 2 | `02-savile-row.scene.json` | `savile-row` | **S1** | 100 | 15 | 146 | 58 % | One unbroken end-to-end move down the street, a 280 m map card, two period street photographs, two walking passes — then 42 s of a 1952 tailoring newsreel for the craft. |
| 3 | `03-the-word.scene.json` | `the-word` | **S2** | 104 | 15 | 152 | 58 % | Pose → 8 s of silent walking → the dated timeline card; then the 2008 tribunal on two quiet type cards, the chain-store door, the 100-yard circle, and 169 → 19 → 22. |
| 4 | `04-no-1-savile-row.scene.json` | `no-1-savile-row` | **S3** | 95 | 11 | 139 | 59 % | The corner façade today, the RGS and Livingstone (both pending stills), a full-frame 1872 card, a pan up the east side, the two Neuville plates, and the 1912 purchase card. |
| 5 | `05-clothes-then-club.scene.json` | `clothes-then-club` | **S4** | 72 | 9 | 104 | 58 % | Four windows of one cached 360 walk down St James's Street, the half-mile route drawing over the 1872 plan, one card, and the turn into Pall Mall under Big Ben (1890). |
| 6 | `06-what-a-club-was.scene.json` | `what-a-club-was` | **S5** | 108 | 15 | 155 | 57 % | A clubland pass, the 1867 wood engraving, three real interiors (library 1886, Soyer's kitchens 1842, the saloon), two ballot cards, the clubland map, the Travellers' façade, the Reform's door. |
| 7 | `07-a-palace-with-a-motive.scene.json` | `a-palace-with-a-motive` | **S6** | 74 | 12 | 118 | 64 % | Barry's elevation, the labelled plan and the section (six floors, three below ground), three political reveals on cards, the kitchen cutaway twice, the library and the saloon. |
| 8 | `08-the-wager.scene.json` | `the-wager` | **S7** | 90 | 13 | 127 | 56 % | The wager plate in two crops, the route map drawing its eight legs to "80", the memorandum in two states, the minutes card, Barings (pending), Pall Mall, the club door. |
| 9 | `09-the-year-the-world-closed.scene.json` | `the-year-the-world-closed` | **S8** | 138 | 19 | 195 | 57 % | The 1872 plan into the docks, **the Strand 1903 captioned "London, 1903"**, the scale card into **Hyde Park 1896**, the Embankment, the twelve termini, the Underground — then 30 s of the telegraph map, 8 of them silent. |
| 10 | `10-charing-cross.scene.json` | `charing-cross` | **S9** | 143 | 22 | 195 | 55 % | Trafalgar Square motion for the statue, two folk-etymology cards, the twelve Eleanor crosses drawing north to south, the demolition, a true side-by-side then/now wipe, Hungerford → Clifton, the forecourt. |
| 11 | `11-a-quarter-to-nine.scene.json` | `a-quarter-to-nine` | **S10** | 118 | 19 | 164 | 56 % | The bag card, Bradshaw (pending), two dated cab plates, **Donisthorpe's Trafalgar Square 1890 held silent for 12 s**, the beggar-woman under rain, the guinea card, the 1905 postcard, the gas lamps, the whistle, the lit bridge. |
| 12 | `12-souvenir.scene.json` | `souvenir` | **S11** | 35 | 4 | 41 | 47 % | The statue, the souvenir card, **8 s of Dover 1896** (real motion, captioned) and the Day 2 plate. |
| | | | **total** | **1122** | **162** | **1601** | **57 %** | **18:42** |

*The `words` column is the validator's `split()` token count, which counts a free-standing em-dash as a token. Real words: **1,585**.*

**YouTube chapter timestamps** (they move by −12 s from S7 onward, because the Chief cut beat S6.6):

```
00:00  Three places, one year
00:45  Savile Row: the whole street is 280 metres
02:25  Who owns the word "bespoke"
04:09  No. 1: where the journeys were planned
05:44  Clothes, then club: the walk through St James's
06:56  What a London club actually was
08:44  A political party built as a palace
09:58  The wager
11:28  1872: the year the world closed into a circuit
13:46  Charing Cross: the point London is measured from
16:09  A quarter to nine
18:07  Souvenir
```

---

## 2 · How to read a scene file (the rules this pass obeys)

1. **Authored slots, scene-clock seconds.** Every media entry carries `start_s` / `end_s` meaning *where the shot sits
   in the scene*, not an in/out point in the source file. Where a source in-point matters it is written in that
   entry's `note` as `source in-point mm:ss`. Slots are contiguous, cover 0 → `duration_s`, and never overlap; only
   audio beds span other slots. **The renderer must honour these, not re-divide the scene.**
2. **No `overlays`. No `interaction`.** Neither key appears in any of the twelve files (D9). Text on screen exists in
   exactly two sanctioned forms: burned captions (the subtitle track), and **full-frame designed cards**, which are
   media entries of `kind: "generated"`.
3. **Dates on archive material live in the picture's own furniture.** Where a post-1872 film or plate stands in for
   1872, the year is the first clause of that entry's `attribution` — the caption line under or beside the picture —
   never a floating overlay. Nine slots carry one: `London, 1903` · `Hyde Park, London, 1896` ·
   `Trafalgar Square, 1890` · `Charing Cross … postcard, 1905` · `A London street, c. 1891–96` · `'London Cabmen', 1877` ·
   `Savile Row, 1955` · `Savile Row, c. 1890` · `Tailors at work · Netherlands, 1952` · `Dover, 1896`.
4. **One narration track.** `narration.script` only; no `variants` (D8).
5. **`review.notes` carries the sentence-to-slot map** for every scene, plus every provisional flag.

---

## 3 · What is provisional, and why

### 3a · Rights: Mapillary — **22 of 162 slots**
`M-108`, `M-109`, `M-115`, `M-116` and all seven cached pano stops rest on Mapillary's *platform-default* CC BY-SA 4.0
with **no per-image licence field**. Every one of those slots is marked `pending: rights-mapillary` in its `note` and
in the scene's `review.notes`. This is the single largest rights exposure in the chapter: **Savile Row walking motion,
the whole St James's walk, the clubland pass and the Charing Cross forecourt all sit on it.** Open since 2026-08-19
(`media/manifest-motion.md` §4.3). If Rights says no, the fallback is KartaView (licence-green, but 12–17 m dashcam
spacing) and the film loses its only pedestrian-pace footage.

### 3b · Motion the plan asked for that does not exist
| ask | slots affected | state |
|---|---|---|
| **N2** tailoring workroom | 7 slots, 42 s of scene 02 | Carried by **M-110**, a 384×288 Dutch newsreel of 1952. Real craft, licence-clean, captioned and dated — and not Savile Row. It must be mounted as a plate or archive window, never full-frame. |
| **N4** Pall Mall clubland pass | scenes 01, 06, 08 | **Unfilled.** Every 2026 candidate was rejected on content (a VIOFO-watermarked dashcam; four Queen's-funeral walks). M-67 (2016 hyperlapse) and one cached 360 stop stand in. |
| **N3a/b/d** the statue with traffic, the datum plaque, the concourse | scenes 10, 11 | **Unfilled.** Scene 10 uses a Trafalgar Square clip and asks QA to pin a window that actually holds the statue; scene 11 has two `pending` motion slots (`N3d`, `N3e`) with still fallbacks. Nothing was invented. |
| **N5** St James's Street shopfronts | scene 05 | Four windows of one cached 360 sequence. QA must confirm Lock & Co and Berry Bros are legible; if not, the beat has no picture. |
| **N8** dusk | scenes 08, 11, 12 | **Unfilled.** Open imagery is daylight. Daylight stands in. |
| a train over Hungerford Bridge | scene 10 | Does not exist in any free source. The slot is a walk across the *footbridge* beside it, and the narration calls it the river, not Fogg's train. |

### 3c · Stills with no source — **26 slots, 19 distinct wants**
`S-mil` · `S-trade` · `S-sargent` · `S-rgs` · `S-liv` ×2 · `S-chur` ×2 · `S-bank` ×2 · `S-docks` · `S-emb` · `S-met` ×2 ·
`S-plaque` · `S-sign` · `S-cross` · `S-civil` · `S-hung` ×2 · `S-brad` ×2 · `S-gas` ×2 — plus `M-103` (Soyer's title page:
the item is in the manifest and is public domain, but `manifest.md` records its Commons URL only as an ellipsis).
Each is authored as `kind: "image"`, `license: "pending"`, `ref: media/files/pending/<id>-<slug>.jpg`, with a `note`
saying exactly what is wanted and a **declared `fallback` to something we hold**, so the film still renders.
**Three of those fallbacks are honest placeholders and not pictures of the subject** and should block a ship:
`S-liv` → M-34 (a Neuville engraving of Fogg standing in for Livingstone), `S-chur` → M-34 (ditto for Churchill),
`S-bank` → M-30 (the 1872 plan standing in for a bank).

### 3d · Generated assets
**Illustrated / map assets (the rundown's own G-series, §5).** Existing and used: **G-01** (needs the L4 rebuild —
bigger type, fewer labels), **G-02** (already a composited side-by-side; used as a hard wipe via its seam25/seam75
files), **G-05** (must lose the six signatories, rev 2), **G-07** (must stop being an interactive packing game).
Do not exist and are used: **G-10, G-10b, G-11, G-12, G-13, G-14, G-15, G-16, G-17, G-18, G-19**. Of these the rundown
marks **G-13, G-12, G-10/G-10b as essential**; G-13 alone carries five slots and is the film's thesis.

**Typeset cards — a NEW `C-` series, 26 of them.** These are the rundown's unnumbered "CARD" beats. They are plain
designed type on a plain ground: no rights, no research, cheap, and they are what the retired overlays became. I gave
them their own series so they do not inflate the illustrated-asset budget the founder is being asked to approve
(rundown Decision 5). Path convention `generated/cards/c-NN-<slug>.svg`. The exact on-screen text of each is in the
`note` of its media entry, after `ON-SCREEN TEXT:`.

| id | on-screen text | scene |
|----|----------------|-------|
| C-01 | 22 August 1872 | 01 |
| C-02 | DAY 1 · LONDON · 2 October 1872 | 01 |
| C-03 | 50 hours by hand · 3 fittings · about 3 months | 02 |
| C-04 | Where does the word 'bespoke' come from? / from Savile Row · from the army · from an older English verb | 03 |
| C-05 | June 2008 · £495 | 03 |
| C-06 | The finding: 'bespoke' and 'made-to-measure' are effectively the same word now. | 03 |
| C-07 | 1872. At No. 1: the headquarters of British exploration. | 04 |
| C-08 | 1912 · £38,000 | 04 |
| C-09 | the Court of St James's | 05 |
| C-10 | You did not apply. / You were proposed, seconded — and balloted. | 06 |
| C-11 | blackballed | 06 |
| C-12 | 104 Pall Mall · Charles Barry · opened 1 March 1841 | 07 |
| C-13 | Reform Act 1832 | 07 |
| C-14 | the Tory Carlton Club, a few doors away | 07 |
| C-15 | 8 February 1836 | 07 |
| C-16 | 80 days · 1,920 hours · 115,200 minutes | 08 |
| C-17 | 800,000 tons (1800) → 8 million (1880) | 09 |
| C-18 | Suez 1869 · Promontory 1869 · Jabalpur 1870 · Darwin 1872 | 09 |
| C-19 | the world had just become a circuit | 09 |
| C-20 | Charing — Old English 'cierring', a bend | 10 |
| C-21 | not French 'chère reine' | 10 |
| C-22 | over £700 — the most expensive of the twelve | 10 |
| C-23 | ordered down 1643 · demolished 1647 · stood 353 years | 10 |
| C-24 | a guinea = 21 shillings / last minted 1813 | 11 |
| C-25 | Stand here. Every LONDON on a British road sign means this spot. | 12 |
| C-26 | Day 2 — Dover and Calais: twenty miles of water, and why both sides are white | 12 |

### 3e · Sound
The **telegraph key (N7)** has no source. It is authored as a `pending` audio entry in scenes 01 and 09 (where it runs
the whole 30-s reveal and is the last thing heard). Everything else is existing manifest audio. `M-110`'s own
soundtrack is muted (Dutch commentary, and the archive-audio rule); the craft beats therefore currently have **no**
cloth-and-shears sound, which the rundown's §6 asks for.

---

## 4 · Two things Engine must do before this renders

1. **The pano cache is keyed by the old scene ids.** `media/files/panos/index.json` maps stops to `scene_id`
   `count-the-steps` and `look-up-the-cross`, which no longer exist. Either re-key the directories or re-run
   `node studio/tools/panowalk/fetch.mjs --chapter day-01-london --scene <new id>` (Mapillary graph API + KartaView,
   both free — nothing billable, RULE 1 intact). Until then those 12 slots fall back to their declared stills.
2. **The cut sheet and the locale still address the old chain.** `studio/tools/render/cuts/day-01-london.json`
   indexes narration by sentence within the retired 18 scenes, and `i18n/zh-Hans.json` overlays them by index. Both
   need rebuilding against these twelve. Neither was touched by this pass.

---

## 5 · Conformance to the plan

- **Every beat in `rundown-film.md` rev 2 is present**, in order, at its planned duration, with its F-ids in `sources`.
- **The Chief's five rulings are applied**: 115,200 minutes kept (and, because overlays are gone, now *spoken* as well
  as carded) · "counting the steps" kept · **S3.6 written but flagged `fact_check: "flag"`, pending F-34** · the
  carpet-bag kept tight at 10 s · **beat S6.6 cut**, which is the whole of the −12 s and why the film is 18:42.
- **All seven folklore stories on the `places.md` watchlist are handled**: #1 bespoke and #2 chère reine are named as
  legend on screen and refuted by date; #3 the black-ball ratio, #4 the Travellers' 500-mile rule and #7 the dinner
  jacket appear nowhere; #5 and #6 are Day 2.
- **No fact outside the two sheets is used.** Nothing was invented for a missing picture.

---

## Digest
- **Did:** turned all 88 beats of the film plan into 12 scene files with 162 authored, contiguous, scene-clock media
  slots (average shot 6.9 s, no still past 12 s, no shot past 14 s), wrote and cut 1,585 words of narration to 57 %
  fill with every HOLD in the plan honoured, retired the 18-scene interactive chain into `scenes/retired-player-18/`, reassembled
  `tour.json`, and got a clean validator run with no warnings.
- **Weak:** 26 slots have no picture yet and 22 more rest on an unresolved Mapillary licence; the craft beat — the
  founder's own reason to care about Savile Row — is 42 seconds of a 384×288 Dutch newsreel; and the film ends in the
  one place we have the least footage of.
- **With more time:** cut a silent animatic from the slots that *do* exist to test the 6.9-second rhythm before a word
  is recorded; write the two D2 permission emails (a Row workroom, a Charing Cross videographer) so the founder only
  has to press send; and design the 26 C-cards as one typographic system rather than 26 decisions.
