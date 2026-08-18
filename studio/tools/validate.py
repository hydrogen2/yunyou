#!/usr/bin/env python3
"""Validate scene/tour JSON files against the studio schemas. Zero deps beyond stdlib
(uses jsonschema if installed, else a light structural check).
Usage: python3 studio/tools/validate.py products/<p>/<chapter>/scenes/*.scene.json [tour.json]
"""
import json, sys, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parents[2]
SCENE = json.load(open(ROOT/'studio/schema/scene.schema.json'))
TOUR  = json.load(open(ROOT/'studio/schema/tour.schema.json'))

def light_check(obj, schema, path='$'):
    errs=[]
    for k in schema.get('required',[]):
        if k not in obj: errs.append(f'{path}: missing required "{k}"')
    props=schema.get('properties',{})
    for k,v in obj.items():
        if k not in props: continue
        s=props[k]
        if 'enum' in s and v not in s['enum']: errs.append(f'{path}.{k}: "{v}" not in {s["enum"]}')
        if s.get('type')=='integer' and not isinstance(v,int): errs.append(f'{path}.{k}: expected integer')
        if s.get('type')=='string' and not isinstance(v,str): errs.append(f'{path}.{k}: expected string')
        if 'pattern' in s and isinstance(v,str) and not re.match(s['pattern'],v): errs.append(f'{path}.{k}: "{v}" fails pattern')
        if s.get('type')=='object' and isinstance(v,dict): errs+=light_check(v,s,f'{path}.{k}')
        if s.get('type')=='array' and isinstance(v,list) and 'items' in s and s['items'].get('type')=='object':
            for i,it in enumerate(v):
                if isinstance(it,dict): errs+=light_check(it,s['items'],f'{path}.{k}[{i}]')
    return errs

def check(path):
    data=json.load(open(path))
    schema = TOUR if 'chapters' in data else SCENE
    try:
        import jsonschema
        from jsonschema import Draft202012Validator, RefResolver
        store={SCENE['$id']:SCENE, TOUR['$id']:TOUR}
        v=Draft202012Validator(schema, resolver=RefResolver.from_schema(schema, store=store))
        errs=[f'{"/".join(map(str,e.path)) or "$"}: {e.message}' for e in v.iter_errors(data)]
    except ImportError:
        errs=light_check(data,schema)
        if 'chapters' in data:
            for ci,ch in enumerate(data['chapters']):
                for si,sc in enumerate(ch.get('scenes',[])): errs+=light_check(sc,SCENE,f'$.chapters[{ci}].scenes[{si}]')
    # studio rules beyond schema
    scenes = [data] if 'chapters' not in data else [s for c in data['chapters'] for s in c['scenes']]
    for s in scenes:
        if s.get('type')=='quiz':
            opts=(s.get('interaction') or {}).get('options',[])
            if sum(1 for o in opts if o.get('correct'))!=1: errs.append(f'{s.get("id")}: quiz must have exactly one correct option')
            if any(not o.get('feedback') for o in opts): errs.append(f'{s.get("id")}: every quiz option needs feedback')
        if s.get('type')=='dialogue' and not (s.get('interaction') or {}).get('guardrails'): errs.append(f'{s.get("id")}: dialogue scene needs guardrails')
        ov=s.get('overlays',[]); d=s.get('duration_s',0)
        if d and len(ov) > max(1, d//15)+1: errs.append(f'{s.get("id")}: {len(ov)} overlays in {d}s exceeds ~1 per 15 s')
        if not s.get('sources') and s.get('type') not in ('interstitial','map'): errs.append(f'{s.get("id")}: no fact-sheet sources cited')
        words=len((s.get('narration') or {}).get('script','').split()); 
        if d and words > d*3.2: errs.append(f'{s.get("id")}: script {words} words too long for {d}s (~150 wpm)')
    return errs

if __name__=='__main__':
    bad=0
    for p in sys.argv[1:]:
        e=check(p)
        print(('OK   ' if not e else 'FAIL ')+p)
        for x in e: print('     -',x); bad+=1
    sys.exit(1 if bad else 0)
