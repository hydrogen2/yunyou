#!/usr/bin/env python3
"""Rebuild a chapter's tour.json from its scene files.

tour.json EMBEDS copies of every scene. Editing a scene therefore leaves the tour stale, and the linear
renderer's rendered-vs-intended check then fails loudly (which is the good outcome) or, before that check
existed, quietly rendered the wrong thing. This was hand-maintained until now; that is why it kept drifting.

Scene order is filename order, which is why the files are numbered.

usage: python3 studio/tools/assemble_tour.py <chapter-dir> [--title "…"] [--hook "…"]
"""
import json, sys, glob, os, argparse

ap = argparse.ArgumentParser()
ap.add_argument('chapter')
ap.add_argument('--title'); ap.add_argument('--hook')
a = ap.parse_args()

tour_path = os.path.join(a.chapter, 'tour.json')
tour = json.load(open(tour_path))
scenes = [json.load(open(f)) for f in sorted(glob.glob(os.path.join(a.chapter, 'scenes', '*.scene.json')))]
if not scenes:
    sys.exit(f'no scenes in {a.chapter}/scenes')

cid = os.path.basename(os.path.abspath(a.chapter))
ch = next((c for c in tour['chapters'] if c['id'] == cid), tour['chapters'][0])
was = [s['id'] for s in ch.get('scenes', [])]
ch['scenes'] = scenes
if a.title: ch['title'] = a.title
if a.hook:  ch['hook'] = a.hook

# the linear cut sheet was retired (D9): the film is the scene list, in order.
tour.pop('linear_cut', None)

json.dump(tour, open(tour_path, 'w'), indent=2, ensure_ascii=False)
now = [s['id'] for s in scenes]
total = sum(s['duration_s'] for s in scenes)
print(f'{tour_path}: {len(now)} scenes, {total} s = {total//60}:{total%60:02d}')
added, gone = [x for x in now if x not in was], [x for x in was if x not in now]
if gone:  print('  removed:', ' '.join(gone))
if added: print('  added:  ', ' '.join(added))
