# `window` prototype — head-tracked parallax room ("cheap VR")

Research artefact #1 for `studio/research/scene-types.md` (card: `window`).
One HTML file, no build step. Three.js + MediaPipe Face Landmarker from CDN.

## Run
```
python3 serve.py            # HTTPS on LAN → open https://<ip>:8443/ on the Fold, accept the cert
# or, desktop only:  python3 -m http.server 8000  → http://localhost:8000/
```
Camera/gyro APIs require HTTPS or localhost.

## Try it (Fold open, Flex mode on a table, ~40–60 cm from your face)
1. **▶ Face tracking** → allow camera. Move your head left/right/up/down and closer/farther. The room's walls, the
   columns and the floating pin should slide against each other — that's the effect. Set **screen mm** to your real
   panel width (Fold open ≈ 150). **gain** 1 = physically correct; 1.5–2 reads better on small screens.
2. **Gyro** — tilt the phone instead (magic-window fallback; also works combined with a stationary head).
3. **Mouse** — desktop testing.
4. **Photos** — load `back / left / right / floor / ceiling` snapshots of a real room (stand in the middle, shoot each
   direction), or one equirect **pano** (phone panorama / 360 photo). Then pick a **frame mask** (window / porthole /
   vignette) — masking the edges hides missing geometry and *increases* the window illusion.
5. Toggle **props** off to feel how much of the presence came from near-field depth cues vs the photos alone.

## What to measure (see study plan in scene-types.md)
- Presence self-report 1–5 for three contents on the same tech: (a) an interior with near objects, (b) a train
  compartment, (c) a wide landscape. Prediction: (a),(b) ≥ 1 point above (c).
- Latency: `fps` in the HUD; target ≥ 30 tracking fps and no visible lag. Reduce camera resolution if needed.
- Does the frame mask raise presence? Does gain > 1 raise presence or cause nausea?

## How it works
- **Tracking:** iris landmarks 468/473 → eye midpoint (x,y) and inter-ocular pixel distance → distance z
  (assumes IPD 63 mm, front-cam HFOV 65°). One-Euro filter on x/y/z.
- **Projection:** off-axis (asymmetric-frustum) perspective with the eye at (x,y,z) and the screen as the z=0 window
  (Kooima, *Generalized Perspective Projection*, 2008). Room and props live behind the window (z<0).
- **Enclosure:** 5-plane box room exactly as wide as the screen (so the screen *is* the missing 6th wall), or an inverted sphere for equirect.
- **Privacy:** frames never leave the device; no network after model load.

## Known gaps / next
- No stitching or exposure matching of user photos yet (agent job: "Content Preparer builds the enclosure").
- No head-coupled audio yet (Web Audio PannerNode driven by head x — planned).
- Front-camera FOV and position are assumed; a 5-second calibration ("look at the four corners") would fix scale.
- Combine gyro + face (rotation from gyro, translation from face) for hand-held use.
