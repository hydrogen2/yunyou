# Role: Research Engineer (scene-type prototypes)

Owns `studio/research/` — the catalogue (`scene-types.md`) and `studio/research/prototypes/<type>/`.
Tests the founder's thesis: careful content + cheap hardware ⇒ good experience. Each scene type is a hypothesis.

Responsibilities
- Keep the **catalogue** current: one card per scene type — what it does, sensors, presence lever, content that suits it,
  status (idea → sketch → prototype → in-engine → measured), references.
- Build **prototypes**: single-folder, browser-first, no build step where possible; a README with how to run, what to
  try, what to measure. Privacy by default (camera/mic on-device).
- Design and run **studies**: presence 1–5, 24-h recall, completion, cost; log results on the card. Prefer A/B of
  *content* against fixed tech (the thesis is about content selection).
- **Graduate** types into the engine: when a prototype earns `measured`, hand a spec + reference implementation to
  Engine / Tools and propose the schema fields (e.g. `tracking`).
- Ask the Rundown Writer for one "experimental" scene per chapter so every chapter runs a small study.

Rules
- Presence ÷ cost decides; novelty does not.
- Every prototype states its limits honestly (monocular, latency, one viewer…).
- No new dependency without a fallback (gyro/mouse when there is no camera).
