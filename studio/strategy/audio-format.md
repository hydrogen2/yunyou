# Strategy — Pure-audio format (founder + Chief, 2026-08-19)

**Founder's idea:** a hands-free, audio-only rendering of every tour — where music, sound effects and above all
script/narrative do the work; optionally a storytelling / language-learning product.

## Why this is structurally strong
1. **100 % owned media.** Narration (our TTS/voice), beds (PD/CC0), personas (ours). None of the YouTube-embed or
   Street View constraints apply — the digest's paywall blocker (Decision 1) does not exist in audio. Fully monetizable.
2. **Open distribution.** Podcast RSS: hands-free contexts (commute, walking, chores, falling asleep) with no platform
   algorithm in the way; every episode is also a funnel to the interactive version.
3. **Nearly free technically.** The render pipeline already produces per-scene neural TTS + mixed beds;
   an audio target is `render_linear.mjs` minus Playwright plus a sound-design pass (target: `linear/<chapter>_audio.mp3` + chapters file).
4. **Imagination-first** — same doctrine as rung 3 in `worlds-ladder.md`: under-specified sensory input recruits the
   listener as renderer. Radio drama is the proof genre.

## Craft rules (audio is not video-minus-picture)
- **Script carries the camera.** "Look left — that red door" → description; an audio adaptation pass per chapter
  (Narrator owns it; sound design promoted from bed to co-narrator: footsteps, fire, rain on the station roof are the scenery).
- **Interactions → call-and-response.** Quiz: question, musical beat, answer. Dialogue scenes → scripted two-handers
  (the Passepartout platform scene is radio drama already). Games are cut or become thought experiments.
- **Pacing:** slower than the linear cut; silence and ambience are content. Target 15–20 min/chapter.

## Language-learning variant (Duolingo-podcast model)
Story in the listener's language; key phrases in the local language of each stop, repeated at the souvenir.
80 Days walks through French, Arabic, Hindi, Cantonese, Japanese, English — a phrase per port accumulates into a
phrasebook by Day 80. Slang/phrase cards in the scenes already carry the material. Ship as a separate feed
("80 Days in 80 Phrases") to keep the main feed clean.

## Scene-type mapping (for the catalogue)
video/streetview → described walk over ambience · photo/map → described image ("picture the plate…") · quiz →
call-and-response · dialogue → two-hander · card/souvenir → spoken recipe/phrase, repeated · ambience/binaural →
native. Add `audio_adaptation` (optional per-scene override script) to the schema when Engine implements.

## Sequence when production resumes
- F1 Engine/Tools: audio render target (`--audio`) producing MP3 + chapter marks + RSS item; reuse cuts file.
- F2 Narrator: audio adaptation pass for Day 1 (script overrides where "look at" language appears; sound-design notes).
- F3 Publisher: podcast feed scaffolding (RSS on our server), episode art from G-01.
- F4 (variant) one pilot episode of the language feed (Day 1: French for the boat train — Passepartout teaches).
