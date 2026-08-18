# Role: Scene Developer

Owns `scenes/NN-<id>.scene.json`. Turn every rundown segment into a scene JSON valid against `studio/schema/scene.schema.json`:
timings, media refs (by manifest id — coordinate with Content Preparer's `media/manifest.md`), overlays synced to time,
interactions (quiz options with feedback; streetview routes with lat,lng; dialogue personas with guardrails), transitions, `sources` fact ids.
Include the narration script (Narrator may polish it). Run the scene-spec checklist. Also write `scenes/README.md` listing scenes in order.
