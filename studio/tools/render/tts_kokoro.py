#!/usr/bin/env python3
"""Yunyou side of the Kokoro voice — a CALLER of ~/hilbert, never an editor of it.

WHY THIS FILE EXISTS
--------------------
The linear renderer used to speak through `msedge-tts`, an unlicensed community wrapper around a Microsoft
endpoint that is not offered for third-party use. That is fine for a private review animatic and NOT fine for
something published to YouTube. Hilbert (~/hilbert) already runs Kokoro locally: Apache-2.0, 82M params,
CPU-only, commercial use allowed, and — the part no cloud English voice does well — a Mandarin path that
goes through misaki g2p and third-tone sandhi instead of espeak, so the tones survive.

    ~/hilbert/docs/REUSE.md: "Call them, do not edit them."
    A sibling project once edited hilbert's TTS and invalidated the Mandarin durations of two finished episodes.

So: this script imports hilbert's `studio.tts` and calls exactly one public function, `synth_kokoro(text, lang,
cfg, raw)`. It writes NOTHING inside ~/hilbert — not the model dir, not `.tts-cache`, not config.yaml. Our cache
lives under `studio/tools/render/.tts-cache/` in THIS repo, keyed on (provider, voice, speed, lang, text), so
editing one line re-synthesizes one line and hilbert's own cache is untouched and unpolluted.

RULE 0 / RULE 1 (no spending): the only provider this script will ever run is `kokoro`, which is local and free.
`elevenlabs` is present in hilbert's config as an upgrade path and is billed per character; if the config says
elevenlabs we override it back to kokoro and say so. There is no flag to make this file spend money.

RUN IT WITH HILBERT'S INTERPRETER (it has kokoro-onnx, misaki, soundfile):

    ~/hilbert/.venv/bin/python studio/tools/render/tts_kokoro.py --jobs jobs.json --out durations.json

`jobs.json` is a list of {"id": "...", "text": "...", "lang": "en"|"zh"} (lang may also be "zh-Hans"/"zh-CN").
`durations.json` comes back as {"provider", "voices", "items":[{id, file, dur, lang, voice, speed, cached}]},
one 48 kHz mono WAV per job. The model is loaded once per process, so hand it ALL the lines of a render in one
call: on this box loading Kokoro costs ~7 s and synthesis runs at roughly 0.8x real time in both languages.

Other flags:
    --voice-en af_heart --voice-zh zf_xiaoxiao   override hilbert's config voices
    --speed-en 0.85     --speed-zh 1.0           override hilbert's config speeds
    --voice / --speed                            apply to whichever language the run uses
    --cache-dir DIR     default studio/tools/render/.tts-cache
    --ffmpeg PATH       ffmpeg used ONLY to convert 24 kHz -> 48 kHz mono wav (default: ffmpeg on PATH;
                        the renderer passes its bundled ffmpeg-static so no system install is required)
    --hilbert PATH      default ~/hilbert
    --probe             print the resolved config and exit without synthesizing anything
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
import time
import wave
from pathlib import Path

HERE = Path(__file__).resolve().parent
DEFAULT_CACHE = HERE / ".tts-cache"
DEFAULT_HILBERT = Path(os.environ.get("HILBERT_ROOT", Path.home() / "hilbert"))
SR = 48000


def _norm_lang(lang: str) -> str:
    """Everything Chinese collapses to 'zh'; everything else to 'en'. hilbert's synth_kokoro only
    asks `lang.startswith('zh')`, but the cache key should not treat zh-CN and zh-Hans as two voices."""
    return "zh" if str(lang or "").lower().startswith("zh") else "en"


def load_hilbert(root: Path):
    """Import hilbert's tts module and its config WITHOUT importing hilbert as a package we own."""
    if not (root / "studio" / "tts.py").exists():
        raise SystemExit(f"hilbert not found at {root} (expected {root}/studio/tts.py). Use --hilbert PATH.")
    sys.path.insert(0, str(root))
    import yaml  # hilbert's venv has it

    from studio import tts  # noqa:  the one thing we call

    cfg = yaml.safe_load((root / "config.yaml").read_text())
    return tts, cfg


def resolve_cfg(cfg: dict, args) -> dict:
    """A COPY of hilbert's config with our overrides. hilbert's own file is never written."""
    cfg = json.loads(json.dumps(cfg))  # deep copy of the plain-data parts; nothing here is exotic
    provider = cfg.get("voice", {}).get("provider")
    if provider != "kokoro":
        print(f"[tts] config provider is {provider!r}; forcing 'kokoro' (RULE 1: this script never spends).",
              file=sys.stderr)
    cfg["voice"]["provider"] = "kokoro"
    k = cfg["voice"]["kokoro"]
    if args.voice_en:
        k["voice_en"] = args.voice_en
    if args.voice_zh:
        k["voice_zh"] = args.voice_zh
    if args.speed_en is not None:
        k["speed_en"] = float(args.speed_en)
    if args.speed_zh is not None:
        k["speed_zh"] = float(args.speed_zh)
    return cfg


def voice_of(cfg: dict, lang: str):
    k = cfg["voice"]["kokoro"]
    return (k["voice_zh"], float(k["speed_zh"])) if lang == "zh" else (k["voice_en"], float(k["speed_en"]))


def cache_key(text: str, lang: str, voice: str, speed: float, extra: dict) -> str:
    """(provider, voice, speed, lang, text) — plus hilbert's Mandarin prosody revision when it exposes one.

    The prosody revision is not decoration: the Mandarin phoneme pipeline lives inside hilbert's tts.py, so a
    change there must invalidate our Mandarin clips too, exactly as it invalidates hilbert's own.
    """
    blob = json.dumps({"provider": "kokoro", "voice": voice, "speed": round(float(speed), 4),
                       "lang": lang, "text": text, **extra},
                      sort_keys=True, ensure_ascii=False)
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()[:16]


def wav_duration(p: Path) -> float:
    """Duration from the WAV header — no ffprobe needed. Falls back to hilbert's _probe for anything odd."""
    try:
        with wave.open(str(p), "rb") as w:
            return round(w.getnframes() / float(w.getframerate()), 3)
    except Exception:
        return 0.0


def to_48k_mono(ffmpeg: str, raw: Path, out: Path) -> bool:
    """Kokoro writes 24 kHz mono; the render mixes at 48 kHz. One conversion, cached forever after."""
    out.parent.mkdir(parents=True, exist_ok=True)
    r = subprocess.run([ffmpeg, "-v", "error", "-y", "-i", str(raw), "-ac", "1", "-ar", str(SR), str(out)],
                       capture_output=True)
    if r.returncode != 0:
        print(f"[tts] resample failed ({r.stderr.decode()[-200:]}) — keeping the 24 kHz file", file=sys.stderr)
        shutil.copyfile(raw, out)
        return False
    return True


def main() -> int:
    ap = argparse.ArgumentParser(description="Kokoro TTS for the Yunyou renderer (calls ~/hilbert, never edits it)")
    ap.add_argument("--jobs", help="JSON file: [{id, text, lang}] (or '-' for stdin)")
    ap.add_argument("--text", help="one-off: synthesize this text instead of --jobs")
    ap.add_argument("--lang", default="en")
    ap.add_argument("--out", help="write the durations JSON here (default: stdout)")
    ap.add_argument("--cache-dir", default=str(DEFAULT_CACHE))
    ap.add_argument("--hilbert", default=str(DEFAULT_HILBERT))
    ap.add_argument("--ffmpeg", default="ffmpeg")
    ap.add_argument("--voice", help="voice for the language this run uses")
    ap.add_argument("--speed", type=float, help="speed for the language this run uses")
    ap.add_argument("--voice-en"), ap.add_argument("--voice-zh")
    ap.add_argument("--speed-en", type=float), ap.add_argument("--speed-zh", type=float)
    ap.add_argument("--probe", action="store_true", help="resolve config, print it, synthesize nothing")
    args = ap.parse_args()

    if args.voice:
        if _norm_lang(args.lang) == "zh":
            args.voice_zh = args.voice_zh or args.voice
        else:
            args.voice_en = args.voice_en or args.voice
    if args.speed is not None:
        if _norm_lang(args.lang) == "zh":
            args.speed_zh = args.speed_zh if args.speed_zh is not None else args.speed
        else:
            args.speed_en = args.speed_en if args.speed_en is not None else args.speed

    tts, raw_cfg = load_hilbert(Path(args.hilbert).expanduser())
    cfg = resolve_cfg(raw_cfg, args)
    k = cfg["voice"]["kokoro"]
    prosody = {}
    rev = getattr(tts, "_ZH_PROSODY_REV", None)
    if rev is not None:
        prosody["zh_prosody_rev"] = rev

    if args.probe:
        print(json.dumps({"hilbert": str(args.hilbert), "provider": cfg["voice"]["provider"],
                          "voice_en": k["voice_en"], "voice_zh": k["voice_zh"],
                          "speed_en": k["speed_en"], "speed_zh": k["speed_zh"],
                          "zh_g2p": k.get("zh_g2p"), "zh_prosody_rev": prosody.get("zh_prosody_rev"),
                          "model_dir": str(Path(args.hilbert).expanduser() / k["model_dir"]),
                          "cache_dir": args.cache_dir}, ensure_ascii=False, indent=2))
        return 0

    if args.text:
        jobs = [{"id": "one", "text": args.text, "lang": args.lang}]
    elif args.jobs:
        src = sys.stdin.read() if args.jobs == "-" else Path(args.jobs).read_text(encoding="utf-8")
        jobs = json.loads(src)
    else:
        ap.error("need --jobs or --text")

    cache = Path(args.cache_dir).expanduser()
    (cache / "wav").mkdir(parents=True, exist_ok=True)
    (cache / "raw").mkdir(parents=True, exist_ok=True)

    items, hits, made, spoken_s = [], 0, 0, 0.0
    t0 = time.time()
    for j in jobs:
        text = (j.get("text") or "").strip()
        lang = _norm_lang(j.get("lang") or "en")
        voice, speed = voice_of(cfg, lang)
        if not text:
            items.append({"id": j.get("id"), "file": None, "dur": 0.0, "lang": lang,
                          "voice": voice, "speed": speed, "cached": False, "error": "empty text"})
            continue
        key = cache_key(text, lang, voice, speed, prosody)
        wav = cache / "wav" / f"{key}.wav"
        if wav.exists() and wav.stat().st_size > 1000:
            hits += 1
            dur = wav_duration(wav) or tts._probe(wav)
            items.append({"id": j.get("id"), "file": str(wav), "dur": dur, "lang": lang,
                          "voice": voice, "speed": speed, "cached": True})
            spoken_s += dur
            continue
        raw = cache / "raw" / f"{key}.raw.wav"
        try:
            tts.synth_kokoro(text, "zh-CN" if lang == "zh" else "en-us", cfg, raw)   # the ONE call into hilbert
            to_48k_mono(args.ffmpeg, raw, wav)
            try:
                raw.unlink()
            except OSError:
                pass
            dur = wav_duration(wav) or tts._probe(wav)
            made += 1
            spoken_s += dur
            items.append({"id": j.get("id"), "file": str(wav), "dur": dur, "lang": lang,
                          "voice": voice, "speed": speed, "cached": False})
            print(f"[tts] {j.get('id')} {lang} {dur:6.2f}s  {text[:48]}", file=sys.stderr)
        except Exception as e:                      # one bad line must not lose a whole render
            print(f"[tts] FAILED {j.get('id')}: {type(e).__name__}: {e}", file=sys.stderr)
            items.append({"id": j.get("id"), "file": None, "dur": 0.0, "lang": lang,
                          "voice": voice, "speed": speed, "cached": False, "error": str(e)[:300]})

    wall = time.time() - t0
    out = {"provider": "kokoro", "cost": 0,
           "voices": {"en": [k["voice_en"], k["speed_en"]], "zh": [k["voice_zh"], k["speed_zh"]]},
           "cache_dir": str(cache), "hilbert": str(args.hilbert),
           "stats": {"jobs": len(jobs), "cached": hits, "synthesized": made,
                     "audio_s": round(spoken_s, 2), "wall_s": round(wall, 2),
                     "x_realtime": round(wall / spoken_s, 3) if spoken_s else None},
           "items": items}
    text_out = json.dumps(out, ensure_ascii=False, indent=1)
    if args.out:
        Path(args.out).write_text(text_out, encoding="utf-8")
    else:
        print(text_out)
    print(f"[tts] {made} synthesized, {hits} cached, {spoken_s:.1f}s audio in {wall:.1f}s wall "
          f"({(wall/spoken_s if spoken_s else 0):.2f}x real time), cost 0 (local kokoro)", file=sys.stderr)
    return 0 if all(i.get("file") for i in items) else 3


if __name__ == "__main__":
    sys.exit(main())
