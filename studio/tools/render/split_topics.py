#!/usr/bin/env python3
"""Cut a rendered episode into one small video per topic, for review one at a time.

Founder, 2026-09-11: "can you split the whole episode video into each topic video so we can do them one by one
easier for me to review." A 20-minute film is reviewed as one long sitting; a 90-second topic is reviewed in a
minute and answered in a sentence. The cuts come from the chapter marks the renderer already writes, so a topic
file always matches what the full cut contains — re-run this after every render.

Each file is re-encoded (not stream-copied), because a stream copy can only cut on a keyframe and would start a
topic a second or two early or late. Small on purpose: 960x540, sized for the founder's line from China.

usage: python3 studio/tools/render/split_topics.py [linear-dir] [page-out]
"""
import json, os, subprocess, sys, html

LINEAR = sys.argv[1] if len(sys.argv) > 1 else 'products/around-the-world-80-days/day-01-london/linear'
PAGE   = sys.argv[2] if len(sys.argv) > 2 else 'www/review/topics/index.html'
FF     = 'studio/tools/render/node_modules/ffmpeg-static/ffmpeg'
FP     = 'studio/tools/render/node_modules/ffprobe-static/bin/linux/x64/ffprobe'

w = json.load(open(os.path.join(LINEAR, 'watch.json')))
stem = os.path.splitext(w['video'])[0]
master = os.path.join(LINEAR, w['video'])
dur = float(subprocess.run([FP, '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', master],
                           capture_output=True, text=True).stdout.strip())
ch = json.load(open(os.path.join(LINEAR, f'{stem}.chapters.json')))
ch = ch if isinstance(ch, list) else ch.get('chapters', [])
topics = [c for c in ch if c.get('scene')]            # the episode title card is not a topic
try:                                                   # scene lengths, to end the last topic before the credits
    tour = json.load(open(os.path.join(os.path.dirname(LINEAR), 'tour.json')))
    scenes = [sc for chp in tour.get('chapters', []) for sc in chp.get('scenes', [])]
except Exception:
    scenes = []
out_dir = os.path.join(LINEAR, 'topics'); os.makedirs(out_dir, exist_ok=True)
for f in os.listdir(out_dir):
    if f.endswith('.mp4'): os.remove(os.path.join(out_dir, f))

rows = []
for i, c in enumerate(topics):
    a = 0.0 if i == 0 else float(c['at_s'])          # topic 1 keeps the title card in front of it
    # The last topic stops where its scene ends, not at the end of the file: after it come the end credits, about a
    # minute of them, and the first split put all of that into "A quarter to nine" (190 s for a 125 s scene).
    if i + 1 < len(topics):
        b = float(topics[i + 1]['at_s'])
    else:
        sd = next((sc.get('duration_s') for sc in scenes if sc.get('id') == c['scene']), None)
        b = min(dur, float(c['at_s']) + float(sd) + 1.5) if sd else dur
    name = f"{i + 1:02d}-{c['scene']}.mp4"
    dst = os.path.join(out_dir, name)
    subprocess.run([FF, '-nostdin', '-v', 'error', '-ss', f'{a:.3f}', '-i', master, '-t', f'{b - a:.3f}',
                    '-vf', 'scale=960:540:flags=lanczos', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '30',
                    '-profile:v', 'main', '-c:a', 'aac', '-b:a', '64k', '-ac', '1', '-movflags', '+faststart', dst, '-y'],
                   check=True)
    mb = os.path.getsize(dst) / 1048576
    rows.append((i + 1, c['title'], name, b - a, mb, a))
    print(f'  {i + 1:02d} {b - a:6.1f}s {mb:5.1f} MB  {c["title"]}')

mm = lambda t: f'{int(t) // 60}:{int(t) % 60:02d}'
items = ''.join(
    f'<li><div class=n>{n:02d}</div><div class=b><a href="/{LINEAR}/topics/{html.escape(f)}">{html.escape(t)}</a>'
    f'<div class=m>{mm(d)} · {mb:.1f} MB · starts at {mm(a)} in the full episode</div></div></li>'
    for n, t, f, d, mb, a in rows)
os.makedirs(os.path.dirname(PAGE), exist_ok=True)
open(PAGE, 'w').write(f'''<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>Episode 1 — topics for review</title>
<style>:root{{color-scheme:light dark}}
body{{margin:0 auto;padding:26px 20px 70px;max-width:760px;font:17px/1.55 -apple-system,"Segoe UI",Roboto,"Noto Sans SC",sans-serif}}
h1{{font-size:23px;margin:0 0 4px}} p{{opacity:.7;margin:.3em 0 1.4em}}
ol{{list-style:none;padding:0;margin:0}} li{{display:flex;gap:14px;padding:12px 0;border-bottom:1px solid rgba(128,128,128,.25)}}
.n{{font-variant-numeric:tabular-nums;opacity:.45;width:26px;padding-top:2px}} .b a{{font-weight:600;color:inherit}}
.m{{font-size:13px;opacity:.6}}</style>
<h1>Episode 1 · London — one topic at a time</h1>
<p>{len(rows)} topics, cut from the full {mm(dur)} render at its chapter marks. 960×540, sized for a slow line.
Tell me which topic and what's wrong; the fix is made in that topic's scene.</p>
<ol>{items}</ol>''')
print(f'{PAGE}: {len(rows)} topics')
