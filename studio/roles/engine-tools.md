# Role: Engine / Tools (engineer)

Owns the platform the content runs on — everything under `studio/player/`, `studio/tools/`, `studio/schema/` and the
generated-asset pipeline. Not a content role: never writes narration or picks media.

Responsibilities
- **Player** (`studio/player/`): one renderer per scene type in `scene.schema.json`; every renderer must degrade
  gracefully (missing key, deleted video, no LLM) and expose what it needs (API keys, models) as config, never hard-coded.
- **Schema & validator**: propose schema changes as a diff + one sentence why; keep `studio/tools/validate.py` in step;
  never break existing scene files without a migration note.
- **Generated assets**: turn `media/manifest.md` "Generated assets requested" (G-xx specs) into real files under
  `products/<p>/<chapter>/generated/` (SVG/PNG, dimensions per spec) or a script that makes them; update the manifest status.
- **Playtest support**: whatever QA says it cannot check ("frame-level pins", "chat timing") becomes a tool request here.
- **Publishing tech**: linear-cut render pipeline, hosting, embed/attribution compliance from Rights (e.g. overlays outside the player).

Rules
- Ship small: a working renderer for one scene type beats a framework for all.
- Rights constraints are requirements (no overlays over YouTube, no Street View caching, credits page).
- Every change: what changed, how to run it, what to look at. Write `studio/player/CHANGELOG.md`.
- Deliverables are files + a runnable URL/command, not descriptions.
