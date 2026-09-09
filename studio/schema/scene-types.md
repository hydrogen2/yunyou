# Scene types — what actually exists

Written 2026-09-09 while adding `quote`. The schema's enum has always been a wish list; this
file records the difference between what is declared, what the film renderer can draw, and what
the one finished film actually used. Update it whenever a type is added or retired.

## The three columns that matter

| type | in schema | film renderer | used in Day 1's cut | note |
|---|---|---|---|---|
| `video` | ✓ | ✓ | **12 / 12 scenes** | plays the media list in order: images, footage, clip cards |
| `photo` | ✓ | ✓ | — | shared slot logic with the player (`imagelayer.mjs`) |
| `map` | ✓ | ✓ | — | one continuous drawn map (`lib/mapfilm.mjs`), not a slideshow |
| `quote` | ✓ | ✓ | — | **new** — a held page from the book |
| `streetview` | ✓ | ✓ | — | panowalk from cached open imagery, else a stop card |
| `quiz` | ✓ | ✓ | — | ask → hold → reveal; never renders the answer up front |
| `dialogue` | ✓ | ✓ | — | legacy: a chat screenshot. Interactive idea, flattened. |
| `game` | ✓ | ✓ | — | legacy: a checklist screenshot. Same problem. |
| `card` | ✓ | ✗ | — | falls through to a **player screenshot** |
| `interstitial` | ✓ | ✗ | — | falls through to a player screenshot |
| `panorama` | ✓ | ✗ | — | falls through to a player screenshot |
| `window` | ✓ | ✗ | — | research prototype; never a film type |
| `ambience` | ✓ | ✗ | — | falls through to a player screenshot |
| `drone` | ✓ | ✗ | — | falls through to a player screenshot |
| `timeline` | ✓ | ✗ | — | falls through to a player screenshot |

**The fall-through is the danger.** Any type without its own branch ends up at
`playerSeg(showScene(n))` — the renderer screenshots the interactive player and puts that in the
film. That is exactly how Day 1 shipped an unreadable map: the film was photographing a 2176 px
print master displayed at 0.596 scale. A type with no branch is not a type; it is a bug waiting
for someone to use it.

**Seven of the fourteen declared types have never been drawn.** Five are ports of interactive ideas
that D9 retired. They stay in the enum only because `tour.json` files still reference some of them.

## Editorial treatments ≠ scene types
The episode plans use a separate, editorial vocabulary — `Fact`, `Story`, `Explainer`, `Walk`,
`Map`, `Then & Now`, `Object`, `Scene`, `Quote`. That describes *what a segment is doing to the
viewer*. It is not the schema. A `Story` topic is usually built from `video` scenes; a `Quote`
topic is a `quote` scene. Do not conflate them.

## `quote` — added 2026-09-09 (founder's request)

A passage from the book held full-frame on a cream card, in the house serif, with the source under
a rule. No media, no motion, no narration required: **the pause is the beat.** It is the cheapest
scene we have — nothing to source, nothing to licence — and it directly serves two standing
constraints: "silence is content", and the book-reading feel the founder singled out as working.

It is a *designed card*, which D9 permits, not a floating overlay, which D9 bans.

```json
{
  "id": "the-unforeseen",
  "type": "quote",
  "title": "Fogg's motto",
  "duration_s": 9,
  "narration": { "script": "" },
  "media": [],
  "quote": {
    "kicker": "Fogg's motto",
    "text": "The unforeseen does not exist.",
    "attribution": "Phileas Fogg — Jules Verne, Around the World in Eighty Days, ch. III (Towle translation, 1873)"
  }
}
```

**Rules.**
- `text` is **verbatim**. Never stitch separate sentences together with an ellipsis to make a better line.
- `attribution` is **required by the schema**. Chapter and translation included — we use the Towle
  translation of 1873, which is public domain; Verne wrote in French and the English is a choice
  we should own on screen.
- Type size steps down as the quotation lengthens (66 px → 36 px), so a six-word motto and a
  five-line paragraph both fill the frame. CJK counts double, since the glyphs are twice as wide.
- 8–14 seconds. Long enough to read twice; a viewer who has to pause the video has been failed.
- **Translate it.** The Mandarin cut takes `scenes[id].quote` from the locale file. If it is missing
  the renderer emits a warning and the zh cut would show English — treat that warning as a defect,
  not a note.
- Use it sparingly. Two or three per episode. A quote card is punctuation; a run of them is a
  slideshow of text, which is the opposite of what this show is.

Samples rendered at 1080p: `www/plan/quote-samples/` (short, medium, long, zh).
