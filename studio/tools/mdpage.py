#!/usr/bin/env python3
"""Render a review markdown file as a readable page on the founder's own host.

He reviews from China where claude.ai is unreliable, so plan documents are served from
this box alongside the video review copies. Deliberately tiny: no dependencies, and it
only supports the subset of markdown the studio's review docs actually use.

usage: python3 studio/tools/mdpage.py <in.md> <out.html> "<title>"
"""
import html, re, sys

src, out = sys.argv[1], sys.argv[2]
title = sys.argv[3] if len(sys.argv) > 3 else 'Review'

def inline(t):
    t = html.escape(t)
    t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    t = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<![*\w])\*([^*]+)\*(?!\w)', r'<em>\1</em>', t)
    return t

lines, body, i = open(src).read().split('\n'), [], 0
while i < len(lines):
    l = lines[i]
    if l.startswith('> '):                       # blockquote = the narration itself
        q = []
        while i < len(lines) and lines[i].startswith('>'):
            q.append(inline(lines[i][2:] if lines[i].startswith('> ') else ''))
            i += 1
        body.append('<blockquote>' + '<br>'.join(q) + '</blockquote>'); continue
    if re.match(r'^#{1,4} ', l):
        n = len(l) - len(l.lstrip('#'))
        body.append(f'<h{n}>{inline(l[n+1:])}</h{n}>')
    elif l.strip() == '---':
        body.append('<hr>')
    elif re.match(r'^\s*[-*] ', l):
        item = inline(re.sub(r'^\s*[-*] ', '', l))
        if not body or not body[-1].startswith('<ul'): body.append('<ul>')
        body.append(f'<li>{item}</li>')
        if i + 1 >= len(lines) or not re.match(r'^\s*[-*] ', lines[i+1]): body.append('</ul>')
    elif re.match(r'^\d+\. ', l):
        item = inline(re.sub(r'^\d+\. ', '', l))
        if not body or not body[-1].startswith('<ol'): body.append('<ol>')
        body.append(f'<li>{item}</li>')
        if i + 1 >= len(lines) or not re.match(r'^\d+\. ', lines[i+1]): body.append('</ol>')
    elif l.startswith('|'):
        rows = []
        while i < len(lines) and lines[i].startswith('|'):
            rows.append(lines[i]); i += 1
        cells = [[c.strip() for c in r.strip('|').split('|')] for r in rows
                 if not re.match(r'^\|[\s:|-]+\|$', r)]
        t = ['<table><thead><tr>'] + [f'<th>{inline(c)}</th>' for c in cells[0]] + ['</tr></thead><tbody>']
        for r in cells[1:]:
            t += ['<tr>'] + [f'<td>{inline(c)}</td>' for c in r] + ['</tr>']
        body.append(''.join(t + ['</tbody></table>'])); continue
    elif l.strip():
        body.append(f'<p>{inline(l)}</p>')
    i += 1

open(out, 'w').write(f'''<!doctype html><meta charset=utf-8>
<meta name=viewport content="width=device-width,initial-scale=1"><title>{html.escape(title)}</title>
<style>
:root{{color-scheme:light dark}}
body{{margin:0 auto;padding:28px 22px 80px;max-width:760px;
 font:17px/1.65 -apple-system,"Segoe UI",Roboto,"Noto Sans SC",sans-serif}}
h1{{font-size:26px;margin:0 0 6px;line-height:1.25}}
h2{{font-size:15px;margin:44px 0 12px;text-transform:uppercase;letter-spacing:.09em;opacity:.55}}
h3{{font-size:20px;margin:34px 0 4px;line-height:1.3}}
h4{{font-size:15px;margin:20px 0 4px;opacity:.8}}
p{{margin:.55em 0}}
blockquote{{margin:14px 0;padding:14px 18px;border-left:3px solid currentColor;
 background:rgba(128,128,128,.09);border-radius:0 6px 6px 0;font-size:17.5px;line-height:1.7}}
code{{font-size:.86em;padding:1px 5px;border-radius:4px;background:rgba(128,128,128,.18)}}
hr{{border:0;border-top:1px solid rgba(128,128,128,.3);margin:38px 0}}
table{{width:100%;border-collapse:collapse;margin:14px 0;font-size:15px}}
th,td{{padding:7px 8px;border-bottom:1px solid rgba(128,128,128,.25);text-align:left;vertical-align:top}}
th{{opacity:.6;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:.05em}}
li{{margin:.3em 0}} ul,ol{{padding-left:1.3em}}
</style>
{''.join(body)}
''')
print(out)
