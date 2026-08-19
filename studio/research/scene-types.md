# Research track — Scene Types: how much presence can a flat screen give?

**Thesis (founder):** with careful selection of content, plain/cheap hardware (a phone, a tablet, a TV, front camera,
gyroscope, headphones) can deliver a genuinely good travelling experience. Each scene type below is a *hypothesis*
about one way of presenting a place on an ordinary screen. The studio uses them; this track studies them.

Each scene type gets a card: what it does · sensors/hardware · where presence comes from · content that suits it ·
prototype status · references. Status: `idea` → `sketch` → `prototype` → `in-engine` → `measured`.

Metric we care about (per scene): **presence** (self-report 1–5 "I felt I was there"), **learning** (recall of 1 fact
after 24 h), **completion**, and **cost** (authoring minutes + media licensing). A scene type earns its place by
presence÷cost, not by novelty.

---

## Catalogue (v0)

| id | scene type | one-line | sensors | presence lever | status |
|----|-----------|----------|---------|----------------|--------|
| video | curated video + narration + synced pins | the workhorse | none | motion, sound, guided attention | in-engine |
| streetview | Street View walk with waypoints | you steer, we narrate | touch/gyro | agency, "I chose to look there" | in-engine (spec) |
| photo | photo + Ken Burns + stickers + music | album mode | none | emotion via music sync | sketch |
| map | route/interstitial map | orientation | none | knowing where you are | in-engine (spec) |
| quiz | 3–4 options, teaching feedback | retention | touch | attention, "why should I care" | in-engine (spec) |
| dialogue | AI persona, text-bound, guardrails | talk to a local / a character | touch/mic | social presence | in-engine (spec) |
| game | small hands-on interaction (pack the bag, spot the door) | play | touch | agency | sketch |
| card | souvenir / recipe / phrase card | takeaway | none | continuity into real life | in-engine (spec) |
| interstitial | title/time/place beats | rhythm | none | pacing | in-engine (spec) |
| **panorama** | 360°/photo-sphere with gyro "magic window" | turn the phone, the view turns | gyro | body-coupled view | idea |
| **window** | **head-tracked parallax room** (fishtank VR) | user photos → enclosure; front camera tracks head; off-axis projection | front camera (+gyro) | motion parallax, "a window into a room" | idea → sketch |
| ambience | multi-layer soundscape you can mix (rain, cab, station) | ears first | headphones | audio presence, cheapest lever of all | idea |
| audio-episode | pure-audio rendering of a whole chapter (see studio/strategy/audio-format.md) | script+sound carry everything | headphones | imagination as renderer; 100% owned media | idea |
| drone | flyover video, gyro-nudged framing | scale and awe | gyro | vertical motion | idea |
| timeline | scrub then↔now on the same view | time as a dimension | touch | insight | idea |
| binaural walk | video + head-locked binaural audio | sound follows head | headphones + camera/gyro | audio localisation | idea |

Bold = the founder's "fancy" set — where the research value is.

---

## Card: `window` — head-tracked parallax room ("cheap VR")

**What it does.** The traveller uploads (or we supply) 4–6 photos of an environment — a room, a courtyard, a train
compartment. We build an enclosure (cube map / cylinder / stitched sphere) and render it with an *off-axis
perspective* driven by where the traveller's head is, measured by the front camera. Lean left, you see more of the right
wall. Move closer, the window "opens". Optionally the gyroscope handles large rotations while the head handles parallax.

**Lineage.** Fishtank VR / head-coupled perspective (Ware, Arthur & Booth 1993); Johnny Lee's Wii-remote head
tracking (2007); "i3D" iPad demo (Francone & Nigay 2011); Apple's Spatial-ish photo effects; Looking Glass. Nothing
here is new — the novelty is *photo-as-texture + browser + curated content*.

**Build sketch (browser, no app store).**
- Tracking: MediaPipe Face Landmarker (WASM/WebGL) → nose/eye-midpoint x,y + apparent inter-ocular distance → z.
  ~30 fps on a modern phone. Smooth with a One-Euro filter. Fallback: DeviceOrientation (gyro) only.
- Render: Three.js. Camera = asymmetric frustum computed from head position relative to the physical screen
  (needs screen size in mm — ask once, or infer from device model). Enclosure = cube map from 6 photos, or
  equirect sphere from a phone panorama, or a *box room* (floor/ceiling/3 walls, backwall photo) for user snapshots.
- Content prep: agent stitches / inpaints user photos into a coherent enclosure (seam fill, exposure match); we can
  also *generate* the missing faces. Vignette + a "window frame" or "porthole" mask hides geometry that isn't there.
- Audio: pan/attenuate 2–3 ambience stems with head position (Web Audio PannerNode). Cheap, big win.

**Where presence comes from (ranked).**
1. Content with depth cues near the viewer — door frames, furniture, pillars, a train-window edge. Distant vistas give
   parallax nothing to work with. (This is the "careful selection" part of the thesis.)
2. Latency < ~50 ms photon-to-photon and stable tracking; jitter kills it faster than low resolution.
3. Head-coupled audio.
4. Only then: resolution, HDR, stitching quality.

**Best hardware case.** Fold open in Flex mode on a table (device stationary → head tracking is pure parallax), or a
tablet on a stand, ~40–60 cm from the face. Also works on a laptop. Weak on TV-at-3-m (parallax too small).

**Known limits.** Monocular (no stereo, no vergence). One viewer at a time. Effect breaks if the viewer moves beyond the
photographed geometry. Front camera on = privacy: on-device only, never uploaded, visible indicator.

**Study plan.** Prototype (1 week): static box room from 5 photos + face tracking + gyro fallback + 2 audio stems.
Test 3 contents against the same tech: (a) a Kyoto machiya interior, (b) a train compartment, (c) a wide landscape.
Prediction: (a),(b) score ≥1 point higher on presence than (c). Then: does adding head-coupled audio add another
half-point? Then: user-uploaded photos of *their own* room vs a curated room (the "gallery/album" product hook).

**Status:** idea → sketch. Owner: studio research. Next artefact: `studio/research/prototypes/window/` (Three.js + MediaPipe demo).

---

## Card: `panorama` — gyro "magic window"
360° photo/video sphere; DeviceOrientation drives the camera; touch-drag fallback. Already proven by YouTube 360 / Street
View; our contribution is *narrated* panoramas with timed pins. Cheapest "look around" primitive. Status: idea.

## Card: `ambience` — mixable soundscape
2–4 CC0 stems (rain, station, cab wheels, distant band) with sliders and a preset per scene. Presence per dollar is
unbeatable; also the layer that makes `video`, `photo` and `window` feel inhabited. Status: idea.

## Card: `timeline` — then ↔ now scrub
Same viewpoint, two (or more) eras, one slider (G-02 in Day 1 London is the static version). Status: idea.

---

## How the research feeds the studio
- New scene type → card here → schema enum → Scene Developer may use it → QA scores it → card gets a `measured` status.
- Rundown Writers should read this catalogue when choosing scene types; the Editor-in-Chief may ask for one
  "experimental" scene per chapter so every chapter also runs one small study.
