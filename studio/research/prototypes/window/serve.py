#!/usr/bin/env python3
"""Serve the prototype over HTTPS on the LAN so a phone's camera/gyro APIs work.
Usage: python3 serve.py [port] [webroot]   → open https://<this-machine-ip>:8443/ on the phone, accept the self-signed cert.
Needs `openssl` for the one-time cert. Localhost also works over plain http://localhost:8000 (python3 -m http.server).
"""
import http.server, ssl, os, subprocess, sys, socket
port=int(sys.argv[1]) if len(sys.argv)>1 else 8443
here=os.path.dirname(os.path.abspath(__file__))
root=sys.argv[2] if len(sys.argv)>2 else here   # optional web root (e.g. ../../../../www)
certdir=here
crt,key=os.environ.get('CERT') or os.path.join(certdir,'dev.crt'), os.environ.get('KEY') or os.path.join(certdir,'dev.key')
if not (os.path.exists(crt) and os.path.exists(key)):
    subprocess.check_call(['openssl','req','-x509','-newkey','rsa:2048','-nodes','-keyout',key,'-out',crt,'-days','365','-subj','/CN=yunyou-window-dev'],stderr=subprocess.DEVNULL)
ip=socket.gethostbyname(socket.gethostname())
try:
    s=socket.socket(socket.AF_INET,socket.SOCK_DGRAM); s.connect(('8.8.8.8',80)); ip=s.getsockname()[0]; s.close()
except Exception: pass
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self,*a,**k): super().__init__(*a,directory=os.path.abspath(root),**k)
    def end_headers(self):
        self.send_header('Cache-Control','no-store'); self.send_header('Accept-Ranges','bytes'); super().end_headers()
    def handle_one_request(self):
        # BUG FIX 2026-08-19: with HTTP/1.1 keep-alive one handler instance serves many requests
        # on the same connection, so _range_left leaked from a Range request into the next plain
        # request, truncating its body -> the client waited forever -> the whole server looked hung.
        self._range_left = None
        return super().handle_one_request()

    def do_GET(self):
        if self.path.split('?')[0]=='/watch/index.json':   # directory of every chapter that has a rendered cut
            import json,glob
            out=[]
            for wj in sorted(glob.glob(os.path.join(os.path.abspath(root),'products','*','*','linear','watch.json'))):
                chap=os.path.dirname(os.path.dirname(wj)); prod=os.path.dirname(chap)
                try: w=json.load(open(wj))
                except Exception: continue
                title=os.path.basename(chap); hook=''; ttitle=os.path.basename(prod)
                try:
                    tj=json.load(open(os.path.join(chap,'tour.json'))); ttitle=tj.get('title',ttitle)
                    ch=next((c for c in tj['chapters'] if c['id']==os.path.basename(chap)),tj['chapters'][0]); title=ch.get('title',title); hook=ch.get('hook','')
                except Exception: pass
                out.append({'product':os.path.basename(prod),'chapter':os.path.basename(chap),'tour_title':ttitle,'title':title,'hook':hook,
                            'duration_s':w.get('duration_s'),'mtime':int(os.path.getmtime(wj)),'chapters':len(w.get('chapters',[]))})
            body=json.dumps(out).encode(); self.send_response(200); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(body))); self.end_headers(); self.wfile.write(body); return
        if self.path.startswith('/watch/') and not self.path.startswith('/watch/index.html') and '.' not in self.path.rsplit('/',1)[-1]:
            self.path='/watch/index.html'
        return super().do_GET()
    def send_head(self):
        # HTTP Range support so <video> can seek (and iOS/Safari will play at all)
        rng=self.headers.get('Range'); path=self.translate_path(self.path)
        if not rng or os.path.isdir(path) or not os.path.exists(path): return super().send_head()
        try:
            unit,_,spec=rng.partition('='); start,_,end=spec.partition('-'); size=os.path.getsize(path)
            start=int(start) if start else max(0,size-int(end)); end=int(end) if end else size-1
            end=min(end,size-1)
            if unit!='bytes' or start>end or start>=size: raise ValueError
        except ValueError:
            self.send_error(416,'Requested Range Not Satisfiable'); return None
        f=open(path,'rb'); f.seek(start)
        self.send_response(206); self.send_header('Content-Type',self.guess_type(path))
        self.send_header('Content-Range',f'bytes {start}-{end}/{size}'); self.send_header('Content-Length',str(end-start+1)); self.end_headers()
        self._range_left=end-start+1; return f
    def copyfile(self,src,dst):
        left=getattr(self,'_range_left',None)
        if left is None: return super().copyfile(src,dst)
        while left>0:
            buf=src.read(min(65536,left)); 
            if not buf: break
            dst.write(buf); left-=len(buf)
httpd=http.server.ThreadingHTTPServer(('0.0.0.0',port),H)
ctx=ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER); ctx.load_cert_chain(crt,key)
httpd.socket=ctx.wrap_socket(httpd.socket,server_side=True)
print(f"Serving https://{ip}:{port}/  (accept the self-signed certificate on the phone)")
httpd.serve_forever()
