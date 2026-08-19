# Fact-Check Report A5 (light pass) — Day 1: London — the **clear-English track**, the rewritten spine, the 13 glosses

**Fact-Checker:** fact-checker (Claude)   **Date:** 2026-08-19   **Verdict: pass-with-flags**
**Scope (as briefed):** (1) all 19 `narration.variants.clear` against `narration.script` and the cited F-ids; (2) the A3n-rewritten spine
(01, 02, 08 heavily; 06, 12, 13, 18 moderately) in **both** tracks for newcomer correctness; (3) the 13 `gloss` overlays.
**Not re-done:** everything settled in `review/fact-check.md` (2026-08-18) — the novel quotations, sums, calendar dates, both quizzes,
the persona red-team, the real-world claims already confirmed. Where an A1 fix has been *undone* by the clear track, I say so.

**Method:** internal diff of the two tracks per scene (word-by-word, hunting dropped qualifiers, numbers, names and hedges);
re-read of Verne ch. I–IV in a freshly downloaded Gutenberg #103 for the four new spine claims; 2 web fetches only (guinea, hansom);
plus what the traveller actually gets today — `studio/player/index.html` (`pickScript`, default `yy-clear='1'`),
`studio/tools/render/cuts/day-01-london.json` and the rendered `linear/day-01-london_narration.vtt` (13:13 animatic, clear track).
Validator: 19 scenes + tour.json OK, 0 warnings, **both** tracks inside the R3 word budget.

**Headline.** The clear track is faithful — no invented facts, no wrong dates, no lost names. Its failure mode is uniform and
predictable: **it drops the qualifier and keeps the claim.** Four of those drops cross the line (Poole "still here, at No. 15";
"the first dinner jacket"; "sixpence a mile" without "or part of a mile"; the 1905 roof without "— just —"), one drops the evidence
for a number it still states ("within ten months" after the months are gone), and one contradicts the corrected pin printed on the
same frame. Two problems belong to **both** tracks and are new since A1: six men at a four-handed whist table, and a bank robbery
introduced with no reason given. The glosses are accurate except **guinea** (wrong for 1872) and two orphans (**wager**, **Hook it!**)
that define words the traveller never hears. Separately — and this is the biggest real-world defect — the **rendered default video**
inherits stale-feeling sentence cuts that leave five dangling references ("The firm says…", "It is real, and still here…", "Save the card.").

Verdict key: **wrong** = contradicted by the sheet or the source · **flag** = weaker/stronger/vaguer than the citation supports, or
newcomer-unsafe · **note** = accepted loss, recorded so nobody re-litigates it.

---

## 1. Claim table — clear track vs script vs fact sheet

| scene | track | claim | issue | fix |
|---|---|---|---|---|
| s02 | **clear** | "The tailor Henry Poole opened his door on the Row in 1846. **His shop is still here, at No. 15.**" | **wrong** — reinstates the exact A1 error. F-45: on the Row (back door) 1828, front door at **36–39** in 1846, **at No. 15 only since 1982**. It also contradicts the corrected pin on the same frame, overlay [1] "No. 15 — Henry Poole, on the Row since 1846, here since 1982". | "Henry Poole opened his door on the Row in 1846. The shop is still here — at No. 15 since 1982." |
| s02 | **clear** | "in 1865 they made a short evening jacket for **a prince** — **the first dinner jacket**, they say" | **flag** — stronger than the script ("the ancestor, they say, of the dinner jacket") and than F-19/F-45, which are **med** and attributed to the firm; the tuxedo origin is contested. "A prince" also loses the Prince of Wales. | "The firm says that in 1865 they made a short evening jacket for the Prince of Wales — the grandfather of the dinner jacket, they say." |
| s08 | **both** | "Fogg and five friends **play whist**" + gloss "whist — a quiet card game **for four players**" | **flag** — self-contradiction inside one scene. F-08 / ch. III: five *usual partners* join him, and four hands play (Fogg + Fallentin vs Stuart + Flanagan). ("Friends" itself is fine: Towle writes "he bowed to his friends" ch. III and "taken leave of his friends" ch. IV, even though ch. I denies him "near friends".) | "Fogg sits down to whist with five fellow members — four hands at the table, the same five every night." Gloss unchanged. |
| s08 | **both** | "In the story — only in the story — a thief has stolen fifty-five thousand pounds from the Bank of England. And a newspaper… has counted: you can now go around the world in eighty days." | **flag** (newcomer) — the robbery is asserted and then abandoned; nothing says *why* it is in the scene. A first-time listener can reasonably conclude the bet is about catching the thief, or that Fogg is a suspect. In ch. III the link is explicit: where could a thief hide? "The world is big enough." "It was once." | Add one clause after the theft (F-09 → F-10): "The talk turns to where such a man could hide now — and to a newspaper table that says the whole world can be crossed in eighty days." |
| s08 | **clear** | "Fogg's bank, Baring's, **closed** in 1995." | **flag** — F-23 says **collapsed** (Leeson's £827 m; sold to ING for £1, the name traded on for years). "Closed" is a different, stronger factual event. | "Fogg's bank, Baring's, **collapsed** in 1995." (script's "fell" is fine) |
| s10 | **clear** | "The Suez Canal opened **in 1869**. The American railroad… joined **in 1869**. The last rail link across India closed the gap **in 1870**. Three doors, all opened **within ten months**…" | **flag** — the months are exactly what makes "within ten months" true (May 1869 → March 1870 = 10 months, F-33). With bare years the claim is unsupported by anything the traveller has heard, and looks wrong (1869→1870 could be 24 months). | Restore the months, they cost 4 words: "…opened in November 1869… joined in May 1869… closed the gap in March 1870." Or drop "within ten months". |
| s12 | **clear** | "The fare is **sixpence a mile**. Charing Cross is about a mile and a half away — call it one shilling, a 'bob'." | **flag** — the script's "or part of one" is the reason 1½ miles costs a shilling. As written the arithmetic says ninepence, and the scene is titled "A shilling's cab". (F-28 + [51]: 6d per mile *or part of a mile*, 1871 tariff 1s minimum for the first two miles.) | "The fare is sixpence a mile — or part of a mile. Charing Cross is about a mile and a half away, so call it one shilling: a 'bob'." |
| s12 | **clear** | "To the driver, Fogg is a 'swell': **a rich**, well-dressed man." | **flag** — "rich" is not in F-31 ("a stylishly dressed gentleman", med) and contradicts the scene's own gloss "swell — a well-dressed gentleman". A swell is dressed like money, which is the joke. | "To the driver, Fogg is a 'swell': a gentleman in good clothes." |
| s18 | **clear** | "The same platforms, and **the old roof, months before it fell**." | **flag** — drops the A1 hedge "— just —". M-27's *publication* year is 1905; the photo date is unknown, and s13 has already told the traveller the roof fell in 1905. Stated flat, it is an unverifiable claim about a specific photograph. | "The same platforms — and, just, the old roof, months before it fell." |
| s13 | **clear** | "The hotel behind the stone cross: **1865**. The cross itself: **1865**. The Underground railway: **nine years old**. The Embankment by the river: **two**. Big Ben, the clock tower: **thirteen**." | **flag** (comprehension, not fact — all five are right per F-21/F-25/F-26) — the list switches from calendar years to ages mid-way and then goes elliptical. In the track written for non-native listeners, "the Embankment by the river: two" is close to meaningless heard once. | "…the hotel, eight years old too. The Underground: nine years old. The Embankment along the river: two years old. The clock tower we call Big Ben: thirteen." |
| s13 | **clear** | "Fogg gives her the twenty guineas he has just won at cards." | **note** — the script's humanising ("four hundred and twenty shillings — about eight hundred and forty cab-miles") is dropped; caption [2] still carries it, which satisfies R3 but leaves the *default, spoken* track with an unquantified period sum. | Optional spoken line, arithmetic from F-28 + this scene: "Four hundred and twenty shillings — four hundred cab rides like the one they just took." |
| s09 | **both** | "Two real men **were doing** the same thing as Verne wrote." then "George Francis Train had reached home… **1870**." | **flag** — only Cook was travelling while Verne wrote (F-35); Train had finished two years earlier (F-36). The clear track makes it worse by dropping "also westward" and flattening the tense. | "One man was doing it while Verne wrote; another had just done it." |
| s06 | **clear** | "Its founders **wanted political reform**; that is the name." | **flag** (vaguer than the sheet, and slightly off) — F-14: founded 1836 by Radicals and Whigs **who had backed the Great Reform Act of 1832**. As simplified, the club sounds like a campaign group founded to seek a reform that was already law. | "Its founders had backed the Reform Act of 1832 — that is where the name comes from." |
| s06 | **clear** | "Now three pictures: the front today, **the architect's drawing**, and the great hall, drawn in 1841." | **note** — M-22 is an engraving of Barry's north elevation from *Life and Works of Sir Charles Barry*, not a drawing by Barry's hand. Harmless, but "the architect's plan of the front" is both simpler and truer. | "the architect's plan of the front" |
| s19 | **clear** | "Reading sauce was **a real English sauce** from 1802" | **note** — F-27 is Berkshire-specific (James Cocks of Reading); for a place-themed studio the place is the point, and "Reading sauce… from Reading" is easier, not harder. | "Reading sauce was real: it came from the town of Reading, from 1802." |
| s01 | **both** | "In 1872… Verne published a famous novel" | **note** (pre-existing, A1 accepted it) — the serial ran 6 Nov–22 Dec 1872, the book came 30 Jan 1873 (F-32); "published in 1872" is defensible for the serial. The clear track drops the "Paris newspaper that same winter" sentence, so nothing now explains the date. | Leave. If ever touched: "…published his novel that same autumn." |
| s03, s05, s07, s10, s11, s14, s15, s17 | clear | Léotard/Blondin, "575 right / 576 left", Mont Cenis & Brindisi, "Portland stone", "eleven hundred metres", "the world's timetable", "two hundred metres to your right", the Offenbach name | **note — accepted losses.** Every one is colour, not evidence; the load-bearing number (1,151 · 80 · 1,920 · 20,000 · 21 December · nine windows) survives in every case. This is the clear track working as designed. | none |

**No clear-track sentence asserts anything absent from the fact sheet** except the three flagged wordings above ("first dinner jacket",
"rich" swell, "closed" for Baring's) and the hansom's "fast", which I have now made citable — see §5.

## 2. Newcomer correctness of the rewritten spine (both tracks)

Checked against the style-guide rule "names, stakes and dates are introduced before they are used".

- **s01** — clean. Novel → author → hero → bet → tonight → we travel → map → the one name we must remember. Nothing asserted before introduction; "valet" is glossed 2 s before it is spoken.
- **s02** — clean in the interactive: Fogg's street and door first, the Sheridan correction after the plain telling (satisfies the "meta-joke only after the plain version" rule), the two-Ls joke correctly demoted to a "Go deeper" caption. In the **video** it breaks — see §4.
- **s08** — two spine defects, both above: the whist arithmetic and the unexplained robbery. Otherwise the order is right (game → the news → the sums → the bet → the card → the date → the motto).
- **s06** — "This is the door of Fogg's club" is a good newcomer opening; the club's *name* is explained only in the standard track's "Its founders backed the great Reform Act of 1832 — hence the name". Fix the clear line (§1) and it is clean.
- **s12** — clean; hansom, swell and bob are each glossed at the moment of use, and the cab is hedged ("probably a hansom") — though the clear track drops *why* ("Verne never says"), which is the actual justification of the hedge. Low: consider "the book never says which kind — probably a hansom".
- **s13** — clean apart from the age list (§1). "Younger than his valet" now works because s03 has established the valet is about thirty.
- **s18** — clean in speech; the **caption** is not: overlay [4] "Verne says Sydenham. By 1872 the express probably took a shorter line." is the last survivor of a connoisseur aside whose spine sentence was removed in A3n. A newcomer meets "Sydenham" for the first and only time, on screen, with no idea what it is. **Fix:** move it to a "Go deeper" pin (same layer as s02's spelling joke), or restore one spine clause ("Verne has them pass Sydenham; by 1872 the express probably took a shorter line").
- **Register break, structural:** `narration.after_script` (s07, s10, s16, s17) and `waypoint_script` (s04) have **no `clear` variant**, and `pickScript()` only swaps `narration.script`. So a traveller in clear mode gets the simplified scene and then, after the interaction, the literary sentence — e.g. s10's "Because Fogg, still at the table, says the sentence that turns the evening." No fact is lost (I checked all five), but the default track visibly changes voice four times. **Fix:** add `variants.clear` for the four `after_script`s; s04's `waypoint_script` is currently dead text in both player and renderer — mark it or give it a clear twin before the Maps walk is wired.

## 3. The 13 gloss chips

| # | scene | gloss | verdict | fix |
|---|---|---|---|---|
| 1 | s01 | valet — a gentleman's personal manservant | **flag** — accurate, but "manservant" is a rarer English word than the one being explained; this chip exists for non-native speakers. | "valet — a gentleman's personal servant: clothes, packing, travel" |
| 2–3 | s04, s05 | clubland — a district of private members' clubs | ok (F-18) | — |
| 4 | s08 | whist — a quiet card game for four players | ok — and "quiet" is well chosen (ch. I: Fogg liked whist "as a silent one"). The contradiction is in the narration, not here. | fix the narration (§1) |
| 5 | s08 | wager — a bet, with money staked on it | **flag — orphan.** Definition is right, but the clear track never says "wager" (it says "bet"), so in the default track the chip defines a word the traveller never hears. | keep the chip and restore one "wager" in the clear line ("At the table this becomes a wager — a bet with money on it"), or scope the chip to the standard track |
| 6 | s11 | Bradshaw — a fat book of railway timetables | ok (F-37) | optional: "Bradshaw — the railway timetable book, first printed 1839" |
| 7 | s12 | hansom — a fast two-wheeled, one-horse cab | ok as of today — "fast" and "one-horse" were not on the sheet; I have added them to F-28 from [23] (light enough for a single horse, low centre of gravity, designed for London traffic; two passengers, driver behind and above). | — |
| 8 | s12 | swell — a well-dressed gentleman | ok (F-31) — the clear narration is what drifts ("rich"). | fix the narration (§1) |
| 9 | s12 | bob — a shilling; the fare | ok (F-31, F-28) in the interactive. In the **video** the sentence that says "call it one shilling" is cut and this chip survives beside a spoken "sixpence a mile" — see §4. | — |
| 10 | s12 | Hook it! — be off | **flag — orphan.** Correct (F-31, *All the Year Round*, 17 Oct 1874), but "Hook it" appears nowhere in either narration track, in any caption, or in the interaction. The chip glosses a word the chapter never uses. | give the cabby the line as a sound-caption at 54 s ("[cabby] 'Hook it!'" — slang stays inside the 1874 list), or drop the chip and move it to the souvenir slang card |
| 11 | s13 | guinea — an old coin: one pound and one shilling | **wrong for 1872** — the value is right (21s), but the guinea coin was last struck 1813 and demonetised in the Great Recoinage of 1816; by 1872 it survived only as a unit of account (fees, horses, art and — usefully for this chapter — **bespoke tailoring**). Fogg hands the woman sovereigns or notes to the value of 420 shillings, not guinea coins. Added as **F-46** (source [52]). Same error the A1 pass caught in the persona's "twenty guineas — gold". | "guinea — twenty-one shillings: a price, not a coin, by 1872" |
| 12 | s16 | pea-souper — a thick yellow London fog | ok (F-30: brown/reddish-yellow, coal-smoke, winter). It fires at 34 s, i.e. after the reveal, so it is not an R5 leak. | — |
| 13 | s18 | boat train — a train timed to meet a ferry | **flag (small)** — the concept is right, but "ferry" is a modern car-ferry word; Fogg's 8:45 met the Channel **steamer/packet** at Dover (F-12). | "boat train — a train timed to meet the Channel steamer" |

**Timing caveat for all 13:** every `at_s` was authored against the literary script. The clear text is 10–20 % shorter *and* plays at
0.9× rate by default (`ttsRate()`), so a chip's window no longer coincides with its word. This is a QA-on-device item, not a fact item,
but it is the difference between a gloss and a distraction.

## 4. What the **rendered default video** actually says (13:13 animatic, clear track)

The cut sheet's `s:N` tokens do index the clear text correctly (A4 did re-derive them), but several cuts remove the sentence that
*introduces* the one kept after it. From `linear/day-01-london_narration.vtt`:

| # | at | the video says | why it is wrong | fix (in `studio/tools/render/cuts/day-01-london.json`) |
|---|---|---|---|---|
| 1 | 1:23 | "**The firm says** that in 1865 they made a short evening jacket for a prince — the first dinner jacket, they say." | savile-row drops [7]–[8]; **Henry Poole is never named in the video**. An attributed claim with no attribution left. | keep `s:7-9` (Poole named) or drop `s:9` with them |
| 2 | 3:17 | "**It is real, and still here** — 104 Pall Mall, since 1836." (scene opening) | the-reform-club drops [0] and [2]: no antecedent for "It", and the club's *name* is never explained in the video. | restore `s:0`; restore `s:2` with the §1 wording |
| 3 | 2:14–2:20 | "…Passepartout walked into this house. **Then ten English houses in five years.**" | fogg-by-the-clock drops [7]–[8] (the CV) — the survivor is a non sequitur, and the video never says who Passepartout is. | restore `s:7` at least |
| 4 | 7:19 | "Now help him pack. **Drag in what goes; leave what stays.**" | pack-the-bag drops [9]; the video keeps a drag instruction no viewer can obey, and "carpet-bag" is never explained. | drop `s:10` (the instruction) and restore `s:9` (the bag) |
| 5 | 8:11 | "The fare is sixpence a mile." (then straight to the map) | the-dash drops [3] — no distance, no shilling, while gloss chip "bob — a shilling; the fare" is still burned on screen. Scene title: "A shilling's cab to Charing Cross". | restore `s:3` with the §1 wording |
| 6 | 12:28 | "**Save the card.**" | souvenir drops [3] ("The recipe is on the card") — nothing has mentioned a card. | restore `s:3` |
| 7 | 10:27 | dialogue chips start; overlay list for `passepartout-on-the-platform` is `[]` and `s:1-2` are dropped | the video's only named speaker cue is the VTT `<v Passepartout>` tag; on screen nobody says who is talking. | restore the lower-third overlay [0], or `s:1` |
| 8 | 11:02+ | caption "Verne says Sydenham. By 1872 the express probably took a shorter line." | orphan connoisseur caption (see §2). | move to a "go deeper" layer, or restore the spine clause |

None of these are fact errors in the scene files — they are cut-sheet errors that only appear in the artefact the founder watches.

## 5. Fact-sheet changes made in this pass

- **F-46 added** (high, source **[52]** Guinea (coin), Wikipedia): guinea = 21 shillings from 1717; coin last struck 1813, demonetised 1816;
  thereafter a unit of account (fees, horses, art, **bespoke tailoring**) — so Fogg's twenty guineas in 1872 is a sum, not coins. `added-by:fact-checker`.
- **F-28 note extended** from the existing source [23]: the hansom was one-horse, two-passenger, low centre of gravity, "light enough to be
  pulled by a single horse", driver behind and above — this is what now licenses the gloss's "fast". `amended-by:fact-checker 2026-08-19`.
- Changelog line appended. **No scene file was edited in this pass** — every fix above is a proposal.

## 6. What QA should re-watch / re-test

1. **The video, 1:23 · 2:14 · 3:17 · 7:19 · 8:11 · 10:27 · 12:28** — the seven dangling references in §4. Watch cold, as a newcomer.
2. **Clear mode in the player, scenes 07 · 10 · 16 · 17** — listen for the voice changing register at the `after_script` (post-interaction) line.
3. **Gloss timing in clear mode at 0.9×**, scenes 01 (valet, 50 s), 08 (whist 5 s / wager 24 s), 12 (four chips in 60 s), 13 (guinea 45 s),
   18 (boat train 7 s): does the chip still land on the word? Scene 12 is the stress case — four chips, shortest track.
4. **Scene 08 read aloud to someone who has not read the novel**: ask them afterwards *why* there is a robbery in the scene, and *how many
   people are playing whist*. Both should be answerable.
5. **Scene 02 pin vs speech in clear mode** — the pin says "here since 1982", the voice says "still here, at No. 15". They are on screen together.
6. **Scene 12 in the video** — the "bob — a shilling; the fare" chip against the spoken "sixpence a mile" with the shilling line cut.
7. Still open from A1/A3 and unaffected by this pass: the five on-device frame pins (M-05 Nos. 14/15, M-01 façade, M-08 forecourt,
   M-13 window side for s18's "Look right"), and the Southeastern 1 tph / 2 h figures (F-22, F-40).

## Is the clear track good enough to be the default?

**Yes — with the four "wrong/flag" fixes in §1 (Poole, dinner jacket, sixpence-a-mile, 1905 roof) and the guinea gloss.**
It is a genuinely good simplification: the register is consistent, sentences average well under the standard track's length, the
load-bearing numbers all survive, it introduces nothing that is not on the fact sheet, and in three places (carpet-bag glossed inline,
"clubland — a street of private clubs", "Dover is on the English coast; Calais is across the sea") it is *clearer than the literary track*
without being less true. Its systematic weakness is that simplification eats hedges: "or part of a mile", "— just —", "the ancestor of",
"since 1982", "probably", "within ten months" are exactly the words a rewrite drops first, and they are exactly the words that make the
claims defensible. A standing rule would help: **when a sentence is simplified, its qualifier is not optional — if the qualifier will not
fit, the claim must be cut with it.** Second weakness, one level up: the clear track is only 80 % of the default experience —
`after_script`, `waypoint_script`, captions and pins are still literary-only, and the linear cut sheet was tuned sentence-by-sentence
against a shorter text. Until those are aligned, "clear English is the default" is true of the narration and not quite true of the chapter.

## Decisions I need from the human

- None blocking. One editorial call worth making explicitly: **the "Hook it!" chip** — either the cabby gets the line (a 4-word sound
  caption, in period, from the 1874 list) or the chip goes to the souvenir slang card. I would give him the line; it is the only Cockney
  in the chapter and the brief asked for some.

## Digest

- **Did:** diffed all 19 clear scripts against the literary track and the F-ids; re-read ch. I–IV for the four new spine claims; audited the
  13 glosses; and checked what the traveller actually receives — the player's `pickScript`, the cut sheet, and the rendered VTT — finding
  4 must-fix wordings, 9 flags, 2 orphan glosses, 1 wrong gloss (guinea, now F-46) and 8 dangling references in the default video.
- **Weak:** I trusted the A1 pass on everything it already cleared (quotations, sums, dates, quizzes, persona) and spent only 2 fetches;
  gloss *timing* against 0.9× TTS is asserted from arithmetic, not watched; and I did not re-check the standard track's overlays outside
  the seven scenes in scope.
- **With more time:** write the clear variants for the four `after_script`s and re-derive the cut sheet against them; watch the animatic
  end-to-end with a non-native listener and time every gloss chip; and pull an October 1872 Bradshaw so scene 18's Sydenham caption can be
  either promoted to fact or retired for good.
