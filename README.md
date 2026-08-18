# Yunyou 云游 — Studio

An AI-run content studio that produces **guided, multi-modal, place-themed experiences**
("interactive Wikipedia, curated and guided"). Humans brief, review, and approve; agents do the rest.

## Layout

```
studio/
  research/    scene-type catalogue + prototypes (the research track)
  roles/       one prompt per role in the virtual company (the org chart)
  templates/   the documents that flow through the pipeline
  schema/      scene.schema.json — the single primitive everything is built from
  style/       style guide + world bibles (tone, vocabulary, visual rules)
products/
  <product>/
    brief.md                 your "i think it's nice to have…" + links
    shared/                  world bible, persona sheets, style overrides
    day-NN-<place>/
      research/fact-sheet.md          Researcher
      rundown/rundown.md              Rundown Writer
      scenes/*.scene.json             Scene Developer (+ Narrator scripts inside)
      media/manifest.md               Content Preparer
      review/fact-check.md            Fact-Checker
      review/rights.md                Rights & Licensing
      review/qa.md                    QA / Playtester
      review/DIGEST.md                Editor-in-Chief → you
      tour.json                       assembled build (Publisher)
.claude/agents/   Claude Code agent definitions for each role (so the studio runs here)
```

## Pipeline

```
brief ─► Researcher ─► Rundown Writer ─► [Scene Developer ‖ Content Preparer ‖ Narrator]
      ─► [Fact-Checker ‖ Rights ‖ Continuity ‖ QA] ─► Publisher ─► DIGEST ─► you

Platform (not per-chapter):  Engine / Tools (player, schema, generated assets)  ·  Research Engineer (scene-type prototypes)
```

## Your gates (keep them few)
1. **Brief** — write `products/<p>/brief.md`.
2. **Rundown approval** — read `rundown/rundown.md`; edit in place or leave comments.
3. **Script & media approval** — read `review/DIGEST.md`; it links everything and lists decisions needed.
4. **Playtest sign-off** — play `tour.json` once before publish.

## Research track
`studio/research/scene-types.md` — every scene type is a hypothesis about presence on a flat screen; the studio
uses them, the research track measures them. Founder's thesis: careful content + cheap hardware ⇒ good experience.

## Principles
- **Everything is a document.** Agents read/write files; you review diffs. Re-runnable.
- **Researcher ≠ Writer ≠ Fact-Checker.** Facts are gathered before writing and attacked after.
- **Rights before publish.** Nothing ships with a red flag from Rights & Licensing.
- **Every interactive tour has a linear rendering** (the "variety show" cut) for video platforms.

## Scheduled production
`studio/tools/studio_run.sh` is run by cron (see `crontab -l`): weekdays 11:00–02:00 UTC every 3 h, weekends every 3 h.
Each run: `claude -p` reads `studio/PRODUCTION.md`, does one production step, journals to `studio/logs/journal.md`, commits and pushes.
Force a run now: `FORCE=1 studio/tools/studio_run.sh`. Progress: `studio/logs/journal.md`, `studio/logs/cron.log`.
