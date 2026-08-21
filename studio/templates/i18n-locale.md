# Locale files — one JSON per language per chapter

English stays canonical in the scene files. A locale NEVER edits `scenes/*.scene.json`; it overlays text at runtime.
Path: `products/<product>/<chapter>/i18n/<locale>.json` (e.g. `zh-Hans.json`). Player: `?lang=zh-Hans` or the picker.

```json
{
  "locale": "zh-Hans",
  "name": "简体中文",
  "tts": { "voice_hint": "zh-CN", "rate": 1.0 },
  "chapter": { "title": "...", "hook": "...", "recap": "..." },
  "scenes": {
    "<scene-id>": {
      "title": "...",
      "script": "...",                       // replaces narration (translate the CLEAR track — it is the default)
      "learning_goal": "...",
      "after_script": "...",
      "overlays": [ { "i": 0, "text": "..." } ],          // i = index into the scene's overlays array
      "interaction": {
        "prompt": "...",
        "answer": "...",
        "options": [ { "i": 0, "text": "...", "feedback": "..." } ]
      }
    }
  }
}
```

Rules
- Index-addressed (`i`), never text-matched — English wording changes must not silently orphan a translation.
- Anything omitted falls back to English. A partial locale is valid and must not break the player.
- Translate the **clear** track, not the literary one: clear English is the default register (D5).
- Do not translate proper nouns into invented forms; give the established local name where one exists and keep the
  original in brackets on FIRST use only (e.g. 改良俱乐部（Reform Club）). Never re-translate it thereafter.
- Numbers, dates and money keep their meaning, not their English phrasing — use the local convention.
- Report density per scene: characters ÷ duration_s. Chinese carries far more meaning per character than English,
  so a literal translation reads as a wall of text. Aim for natural spoken register, not a gloss of the English.
