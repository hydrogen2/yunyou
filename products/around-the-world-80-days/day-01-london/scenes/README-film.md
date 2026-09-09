# Scenes (EPISODE 1) — London: the bet

**Scene Developer + Narrator:** scene-developer (Claude), acting as both   **Date:** 2026-09-09   **Status:** draft, unsourced, unrendered
**Authority:** `series/episode-01-topics.md` (the founder-approved topic plan) · `studio/strategy/video-first.md` · `DECISIONS.md`
**Supersedes:** `scenes/retired-film-v1/` — the 12-scene cut the founder watched and rejected: *"i dont get the openning, is it about bespoke suit making or tailor shops?"*

**1170 s = 19 min 30 s** · **14 scenes** · **105 authored visual slots** (87 pinned to a sentence) · **2,054 narration words**
· fill **70 %** — the rest is picture, now spread BETWEEN sentences rather than dumped at the end of each scene.

**Founder's runtime ruling, 2026-09-09: keep the quote card, cut Thomas Cook.** Scene 04 (the `quote` type,
Verne's 115,200 minutes, held silent) stays. `thomas-cook` moved to `cut-but-kept/` — not deleted, because a
cut topic is the right shape for a Short.

## 1 · The scenes, in order

Slot times are authored in seconds, but the narration's real pace comes from the synthesizer, so seconds alone
drift — on the first full cut the pictures ran a whole slot ahead of the words. Slots whose subject the script
names now carry `on_sentence`, and the renderer warps the slot timeline so those land exactly; unanchored slots
ride the warp. The **pin** column counts the anchors in each scene.

The renderer parses this table as `| # | file | scene id | block | seconds | slots | …` and refuses to render if
it and the scene files disagree.

| # | file | scene id | block | s | slots | pin | words | fill |
|---|------|----------|-------|--:|------:|----:|------:|-----:|
| 1 | `01-how-long.scene.json` | `how-long` | **T1** | 63 | 8 | 7 | 111 | 70 % |
| 2 | `02-the-racers.scene.json` | `the-racers` | **T2** | 119 | 14 | 12 | 210 | 71 % |
| 3 | `03-the-book.scene.json` | `the-book` | **T3** | 70 | 5 | 5 | 124 | 71 % |
| 4 | `04-the-bet.scene.json` | `the-bet` | **T3** | 75 | 9 | 6 | 133 | 71 % |
| 5 | `05-a-hundred-and-fifteen-thousand.scene.json` | `a-hundred-and-fifteen-thousand` | **T3b** | 10 | 0 | 0 | 0 | 0 % |
| 6 | `06-the-year-the-world-closed.scene.json` | `the-year-the-world-closed` | **T4** | 109 | 7 | 7 | 193 | 71 % |
| 7 | `07-biggest-city.scene.json` | `biggest-city` | **T6** | 66 | 8 | 7 | 116 | 70 % |
| 8 | `08-half-a-mile.scene.json` | `half-a-mile` | **T7** | 66 | 4 | 4 | 117 | 71 % |
| 9 | `09-what-a-club-was.scene.json` | `what-a-club-was` | **T8** | 78 | 9 | 5 | 139 | 71 % |
| 10 | `10-the-reform.scene.json` | `the-reform` | **T9** | 74 | 7 | 6 | 131 | 71 % |
| 11 | `11-savile-row.scene.json` | `savile-row` | **T10** | 122 | 10 | 8 | 216 | 71 % |
| 12 | `12-no-1-savile-row.scene.json` | `no-1-savile-row` | **T11** | 80 | 7 | 6 | 142 | 71 % |
| 13 | `13-charing-cross.scene.json` | `charing-cross` | **T12** | 113 | 9 | 8 | 200 | 71 % |
| 14 | `14-a-quarter-to-nine.scene.json` | `a-quarter-to-nine` | **T13** | 125 | 8 | 6 | 222 | 71 % |

## 2 · What does not exist yet

Nothing is sourced. **22 new media items** and **24 new generated assets** are needed before
this can render; everything else reuses `media/manifest.md`.

### New media to find (Content Preparer)
| id | kind | what | for |
|----|------|------|-----|
| M-200 | image | Earth's limb from orbit, night side with city lights. Opens cold, no title. Must read with sound off. NOT YET SOURCED — Content Preparer. | `how-long` |
| M-201 | footage | wing and cloud from a cabin window, or a departure board rolling. Modern, banal, deliberately. NOT YET SOURCED — Content Preparer. | `how-long` |
| M-202 | image | orbital sunrise. HOLD 34–40, no words: the sixteen-sunrises line lands and then we look at one. NOT YET SOURCED — Content Preparer. | `how-long` |
| M-203 | image | Train, portrait. NOT YET SOURCED — Content Preparer. | `the-racers` |
| M-204 | image | Bly in her travelling coat and cap. The famous one. NOT YET SOURCED — Content Preparer. | `the-racers` |
| M-205 | image | the World's own coverage: the board game, the guessing contest, a headline. NOT YET SOURCED — Content Preparer. | `the-racers` |
| M-206 | image | Verne, photographed. HOLD 46–52: she stopped, on the clock, to meet him. NOT YET SOURCED — Content Preparer. | `the-racers` |
| M-207 | image | Bisland. Held as long as Bly was; the race had two people in it. NOT YET SOURCED — Content Preparer. | `the-racers` |
| M-208 | image | the two directions on one small globe or period map: Bly east, Bisland west. NOT YET SOURCED — Content Preparer. | `the-racers` |
| M-209 | image | Huld, 1928, aged 15. ⚠ RIGHTS: Danish press photo, may still be in copyright. If not clearable, use the record board and a Politiken masthead instead. | `the-racers` |
| M-210 | image | the crowd at Copenhagen station. Same rights question. NOT YET SOURCED — Content Preparer. | `the-racers` |
| M-211 | footage | a modern ocean-racing trimaran at speed. The one genuinely fast-moving shot in the topic; it should feel like a different century, because it is. NOT  | `the-racers` |
| M-212 | image | the golden spike photograph. Held. NOT YET SOURCED — Content Preparer. | `the-year-the-world-closed` |
| M-213 | image | the opening ceremony, engraved. NOT YET SOURCED — Content Preparer. | `the-year-the-world-closed` |
| M-214 | image | a pole party in the desert. This is the beat the whole episode turns on; give it a real photograph. NOT YET SOURCED — Content Preparer. | `the-year-the-world-closed` |
| M-217 | image | the world's first underground, packed, in a cutting. The best single image of 'new'. NOT YET SOURCED — Content Preparer. | `biggest-city` |
| M-218 | image | the library. 'Read, write letters' wants a room, not a façade. NOT YET SOURCED — Content Preparer. | `what-a-club-was` |
| M-219 | image | the Reform's own library, 85,000 volumes. ⚠ The club controls interior photography; if it cannot be cleared, hold on M-23 and let the number sit on a  | `the-reform` |
| M-220 | image | uniform, not fashion. A cap, a frogged coat, a naval sleeve. NOT YET SOURCED — Content Preparer. | `savile-row` |
| M-221 | image | the room itself: maps, men, argument. The whole topic depends on this image existing. NOT YET SOURCED — Content Preparer. | `no-1-savile-row` |
| M-222 | image | Livingstone. Held, plainly, no music sting. NOT YET SOURCED — Content Preparer. | `no-1-savile-row` |
| M-223 | image | the equestrian bronze itself, close. The topic is about this object; it must be on screen. NOT YET SOURCED — Content Preparer. | `charing-cross` |

### New generated assets to draw
| id | what | for |
|----|------|-----|
| G-30 | the comparison card, built one line at a time: 90 MINUTES / 44 HOURS 33 MINUTES / 80 DAYS. Three lines, nothing else. Type large enough to read on a p | `how-long` |
| G-31 | one numeral, '80', on the house cream card. Held. DOES NOT EXIST YET. | `how-long` |
| G-32 | his line set as type on the cream card: 'Verne stole my thunder. I'm Phileas Fogg.' DOES NOT EXIST YET. | `the-racers` |
| G-33 | THE RECORD BOARD. Builds a line at a time as each name is spoken and stays for the rest of the topic: Fogg (fiction) 80 · Bly 1890 72d 6h · Bisland 18 | `the-racers` |
| G-34 | the sum, twice: £20,000 in 1872 / about £2 million today. Two lines. The card carries the conversion so the guide does not have to labour it. Cite the | `the-bet` |
| G-13 | THE FILM MAP, drawn by lib/mapfilm.mjs, not screenshotted from the player. One line at a time, on the voice: Promontory 1869 → Suez 1869 → India 1870  | `the-year-the-world-closed` |
| G-35 | 36,000 POLES / 11 REPEATER STATIONS. Two lines. DOES NOT EXIST YET. | `the-year-the-world-closed` |
| G-37 | the comparison card as bars, not text: LONDON 3.9m / BEIJING / PARIS / NEW YORK. Four bars, four labels. The guide says the ratios; the card shows the | `biggest-city` |
| G-38 | THE ANCHOR CARD. The 1872 street plan, three pins dropped in order as they are named — 7 Savile Row, 104 Pall Mall, Charing Cross — then the walking l | `half-a-mile` |
| G-39 | 575 + 576 = 1,151 STEPS · ~900 m. The card holds the arithmetic so the voice does not have to repeat it. DOES NOT EXIST YET. | `half-a-mile` |
| G-40 | the ballot box: white ball / black ball, and the word BLACKBALLED. One idea, one card. DOES NOT EXIST YET. | `what-a-club-was` |
| G-41 | clubland as dots on the St James's / Pall Mall streets. Few labels. DOES NOT EXIST YET. | `what-a-club-was` |
| G-42 | two doors on one street: CARLTON 1832 (Conservative) / REFORM 1836 (Reformers), and the few doors between them drawn to scale. The whole topic in one  | `the-reform` |
| G-10 | the measure card: Conduit Street to Vigo Street, one line, '280 m' large, two labels only. The guide does not read the number the card shows. STILL DO | `savile-row` |
| G-43 | one dated line: BESPOKE, adj. 1755 · TAILORS ON SAVILE ROW c.1803. The myth dies on a date card, not in an argument. DOES NOT EXIST YET. | `savile-row` |
| G-44 | the 2008 ruling, quiet type: £495, machine-sewn, still 'bespoke'. DOES NOT EXIST YET. | `savile-row` |
| G-45 | the 100-yard circle drawn on the street plan, with the standard's three numbers: 50 hours · 3 fittings · 1 pattern. DOES NOT EXIST YET. | `savile-row` |
| G-46 | one line on the cream card: APRIL 1874 · No. 1 SAVILE ROW. Nothing else. DOES NOT EXIST YET. | `no-1-savile-row` |
| G-47 | the street drawn with both ends labelled: No. 1 THE ROYAL GEOGRAPHICAL SOCIETY / No. 7 (Verne's Fogg). 280 m between them. DOES NOT EXIST YET. | `no-1-savile-row` |
| G-48 | a British road sign reading LONDON 400, then a line drawn from it to this one point. DOES NOT EXIST YET. | `charing-cross` |
| G-49 | the twelve crosses drawn as twelve stops down England, Harby to Westminster, revealed one at a time. Charing lights last. Few labels. DOES NOT EXIST Y | `charing-cross` |
| G-50 | the packing list as an inventory card: 2 shirts · 3 pairs of stockings · mackintosh · cloak · Bradshaw. For three months. DOES NOT EXIST YET. | `a-quarter-to-nine` |
| G-51 | a watch face, four minutes slow, LONDON under it. This is the seed of Episode 8's ending; plant it plainly and never mention it again this episode. DO | `a-quarter-to-nine` |
| G-52 | a single gas lamp burning in a dark window. DOES NOT EXIST YET. | `a-quarter-to-nine` |

**G-13 is the one that matters.** The enabler map carries the episode's argument *and* the series
introduction, holds the screen for 55 s of scene 05 and returns in scene 13, and has been outstanding since
the first film cut. If one asset gets made, it is this one.

## 3 · Facts not yet on a fact sheet

Scenes 01, 02 and 03 cite **F-N01…F-N08, F-N12** — placeholders, not fact-sheet ids. They cover the 2024
flight record, the ISS orbital period, Train, Bly, Bisland, Huld, the Jules Verne Trophy and the £20,000
conversion. Sources are at the foot of `series/episode-01-topics.md`. **Researcher owes real F- numbers and
Fact-Check owes a pass before any of this is recorded.** The Huld/Tintin link is "reportedly" even at source,
so the script says "is said to have".

## 4 · Rights still open
- **M-209 / M-210** — Palle Huld, 1928 Danish press photographs; may still be in copyright. Fallback: the record board.
- **M-219** — the Reform Club library interior; the club controls interior photography. Fallback: hold on M-23.
- **M-84** — mis-briefed in the first cut: it does **not** contain the Charles I statue that scene 12 is about. Replace, do not repeat.

## 5 · Before rendering
`tour.json` still assembles the **retired** 12-scene cut and must be rebuilt against this directory; the
renderer's rendered-vs-intended check fails loudly until it is. `i18n/zh-Hans.json` addresses retired scene
ids and needs rewriting from scratch — including the `quote` card, since an untranslated quote renders
English in the Mandarin cut and only warns.
