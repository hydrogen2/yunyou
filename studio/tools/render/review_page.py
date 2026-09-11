#!/usr/bin/env python3
"""Low-bandwidth review page for a rendered chapter.

The founder reviews from China on ~100 kbps with no YouTube: a 350 MB master is
unusable there, so every cut we render also gets small/tiny/audio/stills copies and
this page, which lists them with honest download times. Regenerate after any of
those files change -- sizes are read from disk, not remembered.

usage: python3 studio/tools/render/review_page.py <chapter-linear-dir> [out.html]
"""
import json, os, subprocess, sys

LINEAR = sys.argv[1] if len(sys.argv) > 1 else 'products/around-the-world-80-days/day-01-london/linear'
OUT    = sys.argv[2] if len(sys.argv) > 2 else 'www/review/index.html'
KBPS   = 100                     # the line we are sizing for

w = json.load(open(os.path.join(LINEAR, 'watch.json')))
stem = os.path.splitext(w['video'])[0]

def still_points():
    """Chapter opening + chapter midpoint, in order -- 2 frames per chapter."""
    ch, dur, pts = w['chapters'], w['duration_s'], []
    for i, c in enumerate(ch):
        nxt = ch[i + 1]['at_s'] if i + 1 < len(ch) else dur
        pts.append((c['at_s'] + 8, c['title']))
        pts.append(((c['at_s'] + nxt) // 2, c['title'] + ' (mid)'))
    return pts

def make_stills(points):
    d = os.path.join(LINEAR, 'review-stills')
    os.makedirs(d, exist_ok=True)
    src = os.path.join(LINEAR, w['video'])
    for i, (t, _lab) in enumerate(points, 1):
        dst = os.path.join(d, f'{i:02d}.jpg')
        if os.path.exists(dst):
            continue
        label = f"{i:02d}  {t // 60}\\:{t % 60:02d}"
        subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-ss', str(t), '-i', src, '-frames:v', '1',
                        '-vf', f"scale=640:-2,drawtext=text='{label}':x=10:y=h-28:fontsize=18:"
                               "fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=5",
                        '-q:v', '5', dst, '-y'], check=True)

FILES = [(f'{stem}_review-tiny.mp4',  'Tiny cut — 640×360',       'lowest bandwidth, still watchable'),
         (f'{stem}_review-small.mp4', 'Small cut — 960×540',      'the one to watch if you can wait'),
         (f'{stem}_narration.m4a',    'Narration only — audio',   'the whole film as sound'),
         ('review-contact-sheet.jpg', 'Contact sheet — 24 frames','one image, the whole look'),
         (f'{stem}.vtt',              'Captions / transcript',    'plain text, seconds to download'),
         (f'{stem}.mp4',              'Full master — 1920×1080',  'only over a good line')]

def rows():
    out = []
    for f, title, note in FILES:
        p = os.path.join(LINEAR, f)
        if not os.path.exists(p):
            continue
        mb = os.path.getsize(p) / 1048576
        mins = int(mb * 8 * 1024 / KBPS // 60)
        out.append(f'<tr><td><a href="/{LINEAR}/{f}">{title}</a><div class=note>{note}</div></td>'
                   f'<td class=num>{mb:.1f} MB</td>'
                   f'<td class=num>{"~" + str(mins) + " min" if mins else "&lt;1 min"}</td></tr>')
    return ''.join(out)

points = still_points()
make_stills(points)
stills = ''.join(
    f'<figure><img loading="lazy" src="/{LINEAR}/review-stills/{i:02d}.jpg" alt="{lab}">'
    f'<figcaption>{i:02d} · {t // 60}:{t % 60:02d} · {lab}</figcaption></figure>'
    for i, (t, lab) in enumerate(points, 1))
chaps = ''.join(f'<li><span class=t>{c["at_s"] // 60}:{c["at_s"] % 60:02d}</span> {c["title"]}</li>'
                for c in w['chapters'])

# Per-topic cuts (split_topics.py writes them into linear/topics/). Founder, 2026-09-11: review one topic at a
# time, not the whole film in one sitting. Listed first on the page, because that is now how the film is reviewed.
def topic_rows():
    tdir = os.path.join(LINEAR, 'topics')
    if not os.path.isdir(tdir):
        return ''
    titles = {c.get('scene'): c['title'] for c in w['chapters'] if c.get('scene')}
    out = []
    for f in sorted(x for x in os.listdir(tdir) if x.endswith('.mp4')):
        n, scene = f[:-4].split('-', 1)
        mb = os.path.getsize(os.path.join(tdir, f)) / 1048576
        secs = mb * 8 * 1024 / KBPS
        out.append(f'<tr><td class=num>{int(n)}</td><td><a href="/{LINEAR}/topics/{f}">{titles.get(scene, scene)}</a></td>'
                   f'<td class=num>{mb:.1f} MB</td><td class=num>{"~" + str(int(secs // 60)) + " min" if secs >= 60 else "&lt;1 min"}</td></tr>')
    return ''.join(out)
topics = topic_rows()
dur = f'{w["duration_s"] // 60}:{w["duration_s"] % 60:02d}'
title = os.path.basename(os.path.dirname(LINEAR)).replace('-', ' ')

html = f'''<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1">
<title>{title} — review copies</title>
<style>
:root{{color-scheme:light dark}}
body{{margin:0 auto;padding:24px;max-width:1100px;font:16px/1.55 -apple-system,"Segoe UI",Roboto,"Noto Sans SC",sans-serif}}
h1{{font-size:22px;margin:0 0 4px}} h2{{font-size:16px;margin:32px 0 10px;text-transform:uppercase;letter-spacing:.08em;opacity:.6}}
.sub{{opacity:.65;margin:0 0 24px}}
table{{width:100%;border-collapse:collapse}} td{{padding:10px 6px;border-bottom:1px solid rgba(128,128,128,.25);vertical-align:top}}
.num{{text-align:right;white-space:nowrap;opacity:.75}} .note{{font-size:13px;opacity:.6}}
a{{color:inherit}}
ol{{padding-left:0;list-style:none}} li{{padding:3px 0;border-bottom:1px solid rgba(128,128,128,.15)}}
.t{{display:inline-block;width:56px;opacity:.55;font-variant-numeric:tabular-nums}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}}
figure{{margin:0}} img{{width:100%;border-radius:6px;display:block;background:#222}}
figcaption{{font-size:12px;opacity:.6;padding-top:4px}}
</style>
<h1>Day 1 · London — the departure</h1>
<p class=sub>{dur} · {w.get("lang", "en")} cut · review copies sized for a slow line. Estimates assume {KBPS} kbps; downloads resume if they break
(<code>curl -C - -O &lt;url&gt;</code>, or just re-click — browsers resume too).</p>
{('<h2>One topic at a time</h2><table>' + topics + '</table>') if topics else ''}
<h2>The whole episode</h2>
<table>{rows()}</table>
<h2>{len(points)} frames — the whole film for under a megabyte</h2>
<div class=grid>{stills}</div>
<h2>Chapters</h2><ol>{chaps}</ol>
'''
os.makedirs(os.path.dirname(OUT), exist_ok=True)
open(OUT, 'w').write(html)
print(f'{OUT}: {len(html)} bytes, {len(points)} stills')
