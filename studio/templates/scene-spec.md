# Scene spec — <id>

Scene specs are JSON files validating against `studio/schema/scene.schema.json`.
Filename: `scenes/NN-<id>.scene.json`. Narration script lives inside the scene.
Each claim in the script must cite fact ids in `sources`.
Validate: `python3 studio/tools/validate.py products/<p>/<chapter>/scenes/*.scene.json` — `-` lines are errors (must fix),
`! WARN` lines are advisories (fix before QA; `--strict` turns them into errors).

Checklist before handing to review:
- [ ] duration realistic for the media (don't narrate over 30 s of a 20 s clip)
- [ ] words per second ≤ 2.5 measured over the seconds actually spoken: `duration_s − narration.starts_at_s`
      (default 0), counting `narration.script` **and** `narration.after_script` (validator warns > 2.5, fails > 3.2)
- [ ] if speech does not start at 0 (title card, music-only opening), set `narration.starts_at_s`
- [ ] every interaction that waits for the traveller has a wait state: `interaction.pause_narration: true` **and**
      `interaction.timeout_s` (honest seconds; per tap for tap-to-find) — the validator fails `pause_narration` without `timeout_s`
- [ ] the sentence(s) that answer / follow the interaction go in `narration.after_script`, not in `script`
      (`script` = before/over the media, `after_script` = after the interaction resolves or times out)
- [ ] overlays ≤ 1 every 15 s (don't clutter) — overlays triggered by `at_waypoint` are exempt from the count
- [ ] walk scenes: overlays and cue captions carry `at_waypoint` (index into `interaction.route`, 0-based, must be < route length)
      **and** `at_s` — `at_s` is the linear / no-Maps-JS fallback and stays required
- [ ] media that may not load (Street View pano, YouTube clip) names a `fallback` (manifest id M-xx or ref): a still for each stop
- [ ] quiz has 3–4 options, exactly one correct, feedback on every option
- [ ] dialogue scenes list guardrails, set `interaction.on_llm_unavailable` (`choice` = chips from `options[]`, `skip`, `scripted`)
      and `interaction.max_exchanges`; `timeout_s` is the whole-chat budget; hand-back line lives in `after_script`
- [ ] souvenir / recipe cards use `interaction.kind: "save"` (no answer required; runtime offers keep/download)
- [ ] media entries reference manifest ids
