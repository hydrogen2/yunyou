# Scene spec — <id>

Scene specs are JSON files validating against `studio/schema/scene.schema.json`.
Filename: `scenes/NN-<id>.scene.json`. Narration script lives inside the scene.
Each claim in the script must cite fact ids in `sources`.

Checklist before handing to review:
- [ ] duration realistic for the media (don't narrate over 30 s of a 20 s clip)
- [ ] overlays ≤ 1 every 15 s (don't clutter)
- [ ] quiz has 3–4 options, exactly one correct, feedback on every option
- [ ] dialogue scenes list guardrails
- [ ] media entries reference manifest ids
