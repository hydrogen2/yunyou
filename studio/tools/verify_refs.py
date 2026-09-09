#!/usr/bin/env python3
"""Check that every Commons file a chapter's scenes reference actually exists.

Written 2026-09-09 after a 36-minute render came back with ten slots showing "named card in its place".
The cause was not a licensing problem or a network problem: five Commons filenames had been written from
memory during scene authoring instead of copied from media/manifest.md, and a plausible-looking filename
that does not exist fails silently at render time, one shot at a time. This is thirty seconds of API calls
and it catches that class of mistake before the renderer spends half an hour discovering it.

Local refs are checked on disk. Anything not on Commons is reported, not guessed at.

usage: python3 studio/tools/verify_refs.py <chapter-dir>
exit 1 if anything is missing.
"""
import json, glob, os, sys, urllib.parse, urllib.request

UA = 'yunyou-studio/1.0 (https://github.com/hydrogen2/yunyou; ref checker) python-urllib'
chapter = sys.argv[1] if len(sys.argv) > 1 else '.'

refs = {}   # ref -> [(scene, manifest_id), ...]
for f in sorted(glob.glob(os.path.join(chapter, 'scenes', '*.scene.json'))):
    o = json.load(open(f))
    for m in o.get('media', []):
        refs.setdefault(str(m.get('ref', '')), []).append((o['id'], m.get('manifest_id', '?')))

commons, local, bad = {}, [], []
for ref, users in refs.items():
    if ref.startswith('http'):
        if '/wiki/' in ref:
            commons[urllib.parse.unquote(ref.split('/wiki/')[-1])] = users
        else:
            bad.append((ref, users, 'http ref that is not a Commons /wiki/ URL'))
    else:
        (local if os.path.exists(os.path.join(chapter, ref)) else bad).append(
            (ref, users, 'not on disk') if not os.path.exists(os.path.join(chapter, ref)) else ref)

titles = sorted(commons)
found = {}
for i in range(0, len(titles), 25):
    q = urllib.parse.urlencode({'action': 'query', 'titles': '|'.join(titles[i:i + 25]),
                                'prop': 'imageinfo', 'iiprop': 'size', 'format': 'json'})
    req = urllib.request.Request('https://commons.wikimedia.org/w/api.php?' + q, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=60) as fh:
        data = json.load(fh)
    for pid, p in data['query']['pages'].items():
        found[p['title']] = None if int(pid) < 0 or 'imageinfo' not in p else p['imageinfo'][0]
    for norm in data['query'].get('normalized', []):
        found.setdefault(norm['from'], found.get(norm['to']))

missing = []
for t in titles:
    info = found.get(t, found.get(t.replace('_', ' ')))
    if info is None:
        missing.append((t, commons[t]))

print(f'{len(titles)} Commons refs, {len(titles) - len(missing)} OK, {len(missing)} MISSING')
print(f'{len(local)} local files OK, {len(bad)} local refs missing')
for t, users in missing:
    print(f'  MISSING on Commons: {t}')
    for sc, mid in users:
        print(f'      used by {mid} in {sc}')
for ref, users, why in bad:
    print(f'  {why}: {ref}')
    for sc, mid in users:
        print(f'      used by {mid} in {sc}')
sys.exit(1 if (missing or bad) else 0)
