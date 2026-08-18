# Running a chapter through the studio

The roles are Claude Code agents (`.claude/agents/yunyou-*.md`, available in a new session) or any general-purpose agent
pointed at `studio/roles/<role>.md`. Order and parallelism:

```
1. Researcher                → research/fact-sheet.md
   Content Preparer (scout)  → media/manifest.md            (can start in parallel from the brief)
2. Rundown Writer            → rundown/rundown.md            ← HUMAN GATE: approve/edit
3. Scene Developer ‖ Content Preparer (finalise) ‖ Narrator → scenes/*.scene.json, media/manifest.md, shared/personas/*
   python3 studio/tools/validate.py products/<p>/<c>/scenes/*.scene.json
4. Fact-Checker ‖ Rights ‖ Continuity ‖ QA → review/*.md
5. Publisher                 → tour.json, review/publish-record.md
6. Editor-in-Chief           → review/DIGEST.md             ← HUMAN GATE: approve, then publish / kick off next chapter
```

Re-runs: change the brief or leave comments in any document, delete downstream files, run from that step.
