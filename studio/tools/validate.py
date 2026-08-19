#!/usr/bin/env python3
"""Validate scene/tour JSON files against the studio schemas. Zero deps beyond stdlib
(uses jsonschema if installed, else a light structural check).
Usage: python3 studio/tools/validate.py [--strict] [--no-jsonschema] products/<p>/<chapter>/scenes/*.scene.json [tour.json]

Output per file: "OK   <path>" or "FAIL <path>", then one line per finding:
    "     - <error>"   schema or studio-rule violation -> exit 1
    "     ! WARN <..>" advisory (old scenes still pass)   -> exit 0, unless --strict
"""
import json, sys, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parents[2]
SCENE = json.load(open(ROOT/'studio/schema/scene.schema.json'))
TOUR  = json.load(open(ROOT/'studio/schema/tour.schema.json'))

WPS_ERROR = 3.2   # words per second that is physically too fast (~190 wpm)
WPS_WARN  = 2.5   # the studio target (150 wpm) — Narrator's budget

def _type_ok(v, t):
    if t=='integer': return isinstance(v,int) and not isinstance(v,bool)
    if t=='number':  return isinstance(v,(int,float)) and not isinstance(v,bool)
    if t=='string':  return isinstance(v,str)
    if t=='boolean': return isinstance(v,bool)
    if t=='object':  return isinstance(v,dict)
    if t=='array':   return isinstance(v,list)
    return True

def light_check(obj, schema, path='$'):
    """Structural check used when jsonschema is not installed: required, type, enum, pattern, minimum, nested objects/arrays."""
    errs=[]
    for k in schema.get('required',[]):
        if k not in obj: errs.append(f'{path}: missing required "{k}"')
    props=schema.get('properties',{})
    for k,v in obj.items():
        if k not in props: continue
        s=props[k]; errs+=_check_value(v,s,f'{path}.{k}')
    return errs

def _check_value(v, s, path):
    errs=[]
    t=s.get('type')
    if t and not _type_ok(v,t): errs.append(f'{path}: expected {t}'); return errs
    if 'enum' in s and v not in s['enum']: errs.append(f'{path}: "{v}" not in {s["enum"]}')
    if 'pattern' in s and isinstance(v,str) and not re.match(s['pattern'],v): errs.append(f'{path}: "{v}" fails pattern')
    if 'minimum' in s and isinstance(v,(int,float)) and v < s['minimum']: errs.append(f'{path}: {v} < minimum {s["minimum"]}')
    if t=='object' and isinstance(v,dict): errs+=light_check(v,s,path)
    if t=='array' and isinstance(v,list) and 'items' in s:
        for i,it in enumerate(v): errs+=_check_value(it,s['items'],f'{path}[{i}]')
    return errs

def studio_rules(s):
    """Rules beyond the schema. Returns (errors, warnings)."""
    errs=[]; warns=[]
    sid=s.get('id'); typ=s.get('type'); it=s.get('interaction') or {}; n=s.get('narration') or {}
    d=s.get('duration_s',0); ov=s.get('overlays',[]); route=it.get('route')
    if typ=='quiz':
        opts=it.get('options',[])
        if sum(1 for o in opts if o.get('correct'))!=1: errs.append(f'{sid}: quiz must have exactly one correct option')
        if any(not o.get('feedback') for o in opts): errs.append(f'{sid}: every quiz option needs feedback')
    if typ=='dialogue':
        if not it.get('guardrails'): errs.append(f'{sid}: dialogue scene needs guardrails')
        if not it.get('on_llm_unavailable'): warns.append(f'{sid}: dialogue scene has no interaction.on_llm_unavailable (choice|skip|scripted) — runtime will fall back to "choice"')
    if it.get('on_llm_unavailable') in ('choice','scripted') and not it.get('options'):
        warns.append(f'{sid}: on_llm_unavailable "{it["on_llm_unavailable"]}" needs interaction.options (the chips / canned exchange)')
    # wait states
    if it.get('pause_narration') and not it.get('timeout_s'):
        errs.append(f'{sid}: interaction.pause_narration:true requires interaction.timeout_s (honest wait budget)')
    if it.get('timeout_s') and it.get('kind') in (None,'none'):
        warns.append(f'{sid}: timeout_s set but interaction.kind is none')
    # overlays: waypoint triggers + density (+ gloss shape)
    for i,o in enumerate(ov):
        if o.get('kind')=='gloss' and '—' not in o.get('text',''):
            warns.append(f'{sid}: overlays[{i}] gloss text has no em-dash — expected "word — plain-English definition"')
        if 'at_waypoint' in o:
            if route is None: warns.append(f'{sid}: overlays[{i}].at_waypoint={o["at_waypoint"]} but no interaction.route — will fire on at_s only')
            elif not (isinstance(o['at_waypoint'],int) and 0 <= o['at_waypoint'] < len(route)):
                errs.append(f'{sid}: overlays[{i}].at_waypoint={o["at_waypoint"]} out of range (route has {len(route)} waypoints, 0..{len(route)-1})')
    # camera track (streetview auto-walk): cues must be aimable, inside the scene, in order, and matched to the pins
    cam=s.get('camera') or []
    if cam and typ!='streetview':
        warns.append(f'{sid}: camera track on a "{typ}" scene — only streetview scenes walk and turn; it will be ignored')
    for i,c in enumerate(cam):
        at=c.get('at_s')
        if not isinstance(at,(int,float)): errs.append(f'{sid}: camera[{i}] needs a numeric at_s'); continue
        if 'heading' not in c and 'look_at' not in c:
            errs.append(f'{sid}: camera[{i}] needs heading or look_at — the runtime has nothing to turn to')
        la=c.get('look_at')
        if la is not None:
            parts=str(la).split(',')
            try:
                ok = len(parts)==2 and -90<=float(parts[0])<=90 and -180<=float(parts[1])<=180
            except ValueError:
                ok=False
            if not ok: errs.append(f'{sid}: camera[{i}].look_at "{la}" is not "lat,lng"')
        if d and at >= d: errs.append(f'{sid}: camera[{i}].at_s {at} is at or past duration_s {d} — the cue never fires')
        if i and isinstance(cam[i-1].get('at_s'),(int,float)) and at < cam[i-1]['at_s']:
            warns.append(f'{sid}: camera[{i}].at_s {at} comes before camera[{i-1}].at_s — keep cues in time order')
        if i and isinstance(cam[i-1].get('at_s'),(int,float)):
            prev_end=cam[i-1]['at_s']+(cam[i-1].get('hold_s') or 0)
            if at < prev_end - 0.01:
                warns.append(f'{sid}: camera[{i-1}] holds until {prev_end:g}s but camera[{i}] starts at {at}s — the earlier look is cut short')
        wp=c.get('at_waypoint')
        if wp is not None:
            if route is None: warns.append(f'{sid}: camera[{i}].at_waypoint={wp} but no interaction.route')
            elif not (isinstance(wp,int) and 0 <= wp < len(route)):
                errs.append(f'{sid}: camera[{i}].at_waypoint={wp} out of range (route has {len(route)} waypoints)')
    if typ=='streetview':
        if route and len(route)>1 and not cam:
            warns.append(f'{sid}: streetview walk with {len(route)} waypoints and no camera track — the auto-walk will only use the stop headings, and nothing turns to the landmarks the pins name')
        for i,o in enumerate(ov):                      # every pin should have a turn within 3 s of it
            if o.get('kind') in ('pin','caption') and isinstance(o.get('at_s'),(int,float)) and cam:
                if not any(isinstance(c.get('at_s'),(int,float)) and abs(c['at_s']-o['at_s'])<=3 for c in cam):
                    warns.append(f'{sid}: overlays[{i}] ({o.get("kind")} at {o["at_s"]}s) has no camera cue within 3 s — the pin names something the camera never turns to')
    timed=[o for o in ov if 'at_waypoint' not in o and o.get('kind')!='gloss']  # gloss chips are reference, not pacing
    if d and len(timed) > max(1, d//15)+1: errs.append(f'{sid}: {len(timed)} timed overlays in {d}s exceeds ~1 per 15 s (waypoint-triggered overlays exempt)')
    if not s.get('sources') and typ not in ('interstitial','map'): errs.append(f'{sid}: no fact-sheet sources cited')
    # words per second: (script + after_script) over (duration_s - starts_at_s); each narration.variants track measured the same way
    tracks=[('', n.get('script',''))] + [(f' [variants.{k}]', v) for k,v in (n.get('variants') or {}).items() if isinstance(v,str)]
    start=n.get('starts_at_s',0) or 0
    if d and isinstance(start,(int,float)):
        secs=d-start
        if secs<=0: errs.append(f'{sid}: narration.starts_at_s {start} leaves no time in {d}s')
        else:
            for label,txt in tracks:
                words=len(txt.split()) + len(n.get('after_script','').split())
                wps=words/secs
                if words > secs*WPS_ERROR: errs.append(f'{sid}{label}: {words} words in {secs:g}s spoken = {wps:.2f} w/s, too fast (limit {WPS_ERROR})')
                elif wps > WPS_WARN: warns.append(f'{sid}{label}: {words} words in {secs:g}s spoken = {wps:.2f} w/s, over the {WPS_WARN} w/s (150 wpm) target')
    return errs, warns

def check(path, use_jsonschema=True):
    data=json.load(open(path))
    schema = TOUR if 'chapters' in data else SCENE
    errs=[]
    if use_jsonschema:
        try:
            import jsonschema
            from jsonschema import Draft202012Validator, RefResolver
            store={SCENE['$id']:SCENE, TOUR['$id']:TOUR}
            v=Draft202012Validator(schema, resolver=RefResolver.from_schema(schema, store=store))
            errs=[f'{"/".join(map(str,e.path)) or "$"}: {e.message}' for e in v.iter_errors(data)]
        except ImportError:
            use_jsonschema=False
    if not use_jsonschema:
        errs=light_check(data,schema)
        if 'chapters' in data:
            for ci,ch in enumerate(data['chapters']):
                for si,sc in enumerate(ch.get('scenes',[])): errs+=light_check(sc,SCENE,f'$.chapters[{ci}].scenes[{si}]')
    warns=[]
    scenes = [data] if 'chapters' not in data else [s for c in data['chapters'] for s in c['scenes']]
    for s in scenes:
        e,w=studio_rules(s); errs+=e; warns+=w
    return errs, warns

if __name__=='__main__':
    args=[a for a in sys.argv[1:] if not a.startswith('--')]
    strict='--strict' in sys.argv; use_js='--no-jsonschema' not in sys.argv
    bad=0
    for p in args:
        e,w=check(p, use_js)
        if strict: e=e+w; w=[]
        print(('OK   ' if not e else 'FAIL ')+p)
        for x in e: print('     -',x); bad+=1
        for x in w: print('     ! WARN',x)
    sys.exit(1 if bad else 0)
