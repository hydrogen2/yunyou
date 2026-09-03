// HTML templates for the linear-cut renderer. Every card is a full 16:9 page sized by the caller.
// Nothing here downloads media: images are passed in as file:// or https:// URLs already resolved by the caller.

const esc = (s = '') => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const mmss = (t) => { t = Math.max(0, Math.round(t || 0)); const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60; return (h ? h + ':' + String(m).padStart(2, '0') : String(m)) + ':' + String(s).padStart(2, '0'); };

export const BASE_CSS = `
:root { --ink:#ece6da; --dim:#a9a193; --bg:#0d0c0e; --panel:#17161a; --line:#2b292f; --accent:#d9a441; --ok:#7bc47f; --bad:#e07a6a; }
* { box-sizing:border-box; }
html,body { margin:0; width:100%; height:100%; background:var(--bg); color:var(--ink); font:22px/1.4 Georgia,'Liberation Serif','Times New Roman','Noto Serif CJK SC','Noto Sans CJK SC',serif; overflow:hidden; }
.sans { font-family:'Liberation Sans','Noto Sans CJK SC',system-ui,sans-serif; }
:lang(zh), .zh, .zh * { font-family:'Noto Sans CJK SC','Liberation Sans',system-ui,sans-serif; }
.page { position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center; padding:4vmin; }
.kicker { font-family:'Liberation Sans','Noto Sans CJK SC',system-ui,sans-serif; font-size:16px; letter-spacing:.18em; text-transform:uppercase; color:var(--accent); margin:0 0 .6em; }
.muted { color:var(--dim); }
h1 { font-weight:500; font-size:56px; line-height:1.15; margin:0 0 .3em; letter-spacing:.01em; }
h2 { font-weight:500; font-size:40px; line-height:1.2; margin:0 0 .4em; }
.card { background:linear-gradient(160deg,#f4ecd8,#e7dcc0); color:#2a2118; border-radius:16px; padding:44px 56px; max-width:900px; box-shadow:0 20px 60px rgba(0,0,0,.6); font-size:24px; }
.card h2 { color:#2a2118; font-size:34px; }
.card small { color:#6b5a48; font-family:'Liberation Sans',system-ui,sans-serif; font-size:17px; }
.dark { background:linear-gradient(160deg,#17161a,#0d0c0e); border:1px solid var(--line); border-radius:16px; padding:44px 56px; color:var(--ink); box-shadow:0 20px 60px rgba(0,0,0,.6); }
.tag { display:inline-block; border:1px solid var(--accent); color:var(--accent); border-radius:999px; padding:4px 14px; font-family:'Liberation Sans',system-ui,sans-serif; font-size:16px; letter-spacing:.06em; }
.pill { display:inline-block; border:1px solid var(--line); border-radius:999px; padding:3px 12px; font-family:'Liberation Sans',system-ui,sans-serif; font-size:15px; color:var(--dim); margin-right:8px; }
.thumb { position:absolute; right:40px; bottom:40px; width:200px; height:auto; border-radius:8px; opacity:.85; box-shadow:0 8px 24px rgba(0,0,0,.6); }
.split { display:grid; grid-template-columns: 1fr 1fr; gap:36px; width:100%; height:100%; align-items:center; }
.herobox { position:relative; height:100%; width:100%; border-radius:10px; overflow:hidden; background:#000; display:flex; align-items:center; justify-content:center; }
.herobox img.back { position:absolute; inset:-12%; width:124%; height:124%; object-fit:cover; filter:blur(28px) saturate(1.12) brightness(.44); }
/* NEVER enlarged: max-width/height are the file's OWN pixels, so a 632-px engraving stays 632 px (player v0.7) */
.split img.hero { position:relative; max-width:100%; max-height:calc(100vh - 8vmin); width:auto; height:auto; object-fit:contain; border-radius:6px; }
.herocap { position:absolute; left:0; right:0; bottom:0; padding:6px 10px; font-family:'Liberation Sans','Noto Sans CJK SC',sans-serif; font-size:14px; color:#cfd6dc; background:linear-gradient(transparent,rgba(0,0,0,.72)); }
.opts { list-style:none; margin:0; padding:0; font-family:'Liberation Sans',system-ui,sans-serif; font-size:21px; }
.opts li { margin:10px 0; padding:12px 16px; border:1px solid var(--line); border-radius:12px; background:var(--panel); break-inside:avoid; display:inline-block; width:100%; }
.opts li.correct { border-color:var(--ok); background:#15231a; }
.opts li.wrong { color:var(--dim); }
.opts li.on { border-color:var(--ok); }
.opts li.off { color:var(--dim); text-decoration:line-through; opacity:.7; }
.fb { margin-top:12px; padding:10px 14px; border-left:3px solid var(--accent); font-size:20px; }
.chat { display:flex; flex-direction:column; gap:12px; font-family:'Liberation Sans',system-ui,sans-serif; font-size:21px; }
.chat .q { align-self:flex-end; background:#2a2730; padding:12px 18px; border-radius:16px 16px 4px 16px; max-width:88%; }
.chat .a { align-self:flex-start; background:#1c2a1e; padding:12px 18px; border-radius:16px 16px 16px 4px; max-width:92%; }
.credits { column-count:2; column-gap:48px; font-family:'Liberation Sans',system-ui,sans-serif; font-size:15px; line-height:1.35; }
.credits p { margin:0 0 .5em; break-inside:avoid; }
.credits b { color:var(--accent); font-weight:600; }
.foot { position:absolute; left:40px; right:40px; bottom:28px; font-family:'Liberation Sans',system-ui,sans-serif; font-size:15px; color:var(--dim); display:flex; justify-content:space-between; }
`;

export function page(body, extraCss = '') {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}${extraCss}</style></head><body>${body}</body></html>`;
}

/** A picture panel that obeys the v0.7 rules: never upscaled, bars filled with a blurred copy of itself. */
function hero({ imageUrl, imageW, imageH, attribution }) {
  if (!imageUrl) return '<div class="herobox"></div>';
  const cap = imageW ? ` style="max-width:${Math.round(imageW)}px;max-height:${Math.round(imageH || imageW)}px"` : '';
  return `<div class="herobox"><img class="back" src="${esc(imageUrl)}" alt="" aria-hidden="true">` +
    `<img class="hero" src="${esc(imageUrl)}"${cap}>` +
    `${attribution ? `<div class="herocap">${esc(attribution)}</div>` : ''}</div>`;
}

/** Title card at the start of the film. */
export function titleCard({ tourTitle, chapterTitle, dateStr, label = '', studio = 'Yunyou 云游' }) {
  return page(`<div class="page" style="flex-direction:column;text-align:center">
    <p class="kicker">${esc(tourTitle)}</p>
    <h1>${esc(chapterTitle)}</h1>
    ${label ? `<p class="muted" style="font-size:26px;margin:.2em 0 1.2em">${esc(label)}</p>` : '<div style="height:.8em"></div>'}
    <span class="tag">${esc(studio)} · ${esc(dateStr)}</span>
  </div>`);
}

/** Simple scene title card (used for the cold-open title beat and as a fallback). */
export function sceneCard({ title, subtitle, note }) {
  return page(`<div class="page" style="flex-direction:column;text-align:center">
    ${subtitle ? `<p class="kicker">${esc(subtitle)}</p>` : ''}
    <h1 style="max-width:1000px">${esc(title)}</h1>
    ${note ? `<p class="muted" style="font-size:22px">${esc(note)}</p>` : ''}
  </div>`);
}

/** Clip card for a YouTube scene (rights: no download, no re-encode, no overlay over the player). */
export function clipCard({ channel, videoTitle, videoId, inS, outS, sceneTitle, thumbUrl, note }) {
  return page(`<div class="page">
    <div class="dark" style="width:1120px;min-height:560px;position:relative">
      <p class="kicker">Video · licensed footage goes here — review animatic</p>
      <h2>${esc(sceneTitle)}</h2>
      <p style="font-size:26px;margin:.2em 0 .1em"><b>${esc(channel)}</b></p>
      <p class="muted" style="font-size:22px;margin:0 0 .8em;max-width:780px">${esc(videoTitle)}</p>
      <p><span class="pill">YouTube ${esc(videoId)}</span><span class="pill">in ${mmss(inS)}</span><span class="pill">out ${mmss(outS)}</span><span class="pill">${Math.round(outS - inS)} s</span></p>
      ${note ? `<p class="muted" style="font-size:18px;max-width:780px">${esc(note)}</p>` : ''}
      <img class="thumb" src="${esc(thumbUrl)}" alt="">
      <div class="foot"><span>Embed only in the interactive player · no overlay over the YouTube player · credit: ${esc(channel)}</span><span></span></div>
    </div></div>`);
}

/** Card for a Street View stop (rights: no screen recording / caching of Street View). */
export function streetViewCard({ sceneTitle, stops, note }) {
  const rows = stops.map((s, i) => `<li><b>Stop ${i + 1}</b> · ${esc(s.desc || '')} <span class="muted">— ${esc(s.coords)}</span></li>`).join('');
  return page(`<div class="page">
    <div class="dark" style="width:1120px;min-height:560px;position:relative">
      <p class="kicker">Street View · live panorama goes here — review animatic</p>
      <h2>${esc(sceneTitle)}</h2>
      <ul class="opts" style="font-size:19px">${rows}</ul>
      ${note ? `<p class="muted" style="font-size:18px">${esc(note)}</p>` : ''}
      <div class="foot"><span>Google Street View via Maps Embed API in the interactive player · not recorded here (Google Maps ToS)</span><span></span></div>
    </div></div>`);
}

/** Quiz screen: image left, question and options right; correct option highlighted (linear cut = guide answers). */
export function quizScreen({ sceneTitle, imageUrl, imageW, imageH, attribution, prompt, options, feedback }) {
  const li = options.map(o => `<li class="${o.correct ? 'correct' : 'wrong'}">${o.correct ? '✔ ' : '○ '}${esc(o.text)}</li>`).join('');
  return page(`<div class="page"><div class="split">
    ${hero({ imageUrl, imageW, imageH, attribution })}
    <div>
      <p class="kicker">${esc(sceneTitle)}</p>
      <h2 style="font-size:32px">${esc(prompt)}</h2>
      <ul class="opts">${li}</ul>
      ${feedback ? `<div class="fb sans">${esc(feedback)}</div>` : ''}
    </div></div></div>`);
}

/** Dialogue screen: avatar left, scripted exchange right. */
export function chatScreen({ sceneTitle, imageUrl, imageW, imageH, attribution, context, turns, note = 'Scripted fallback exchange — the interactive player runs free chat with guardrails.' }) {
  const t = turns.map(x => `<div class="${x.role === 'q' ? 'q' : 'a'}">${esc(x.text)}</div>`).join('');
  return page(`<div class="page"><div class="split" style="grid-template-columns: 2fr 3fr">
    ${hero({ imageUrl, imageW, imageH, attribution })}
    <div>
      <p class="kicker">${esc(sceneTitle)}</p>
      ${context ? `<p class="muted sans" style="font-size:17px;margin:0 0 1em">${esc(context)}</p>` : ''}
      <div class="chat">${t}</div>
      ${note ? `<p class="muted sans" style="font-size:15px;margin-top:1em">${esc(note)}</p>` : ''}
    </div></div></div>`);
}

/** Checklist screen for the drag game (linear = packing list, no drag). */
export function checklistScreen({ sceneTitle, prompt, options, closing }) {
  const li = options.map(o => `<li class="${o.correct ? 'on' : 'off'}">${o.correct ? '☑ ' : '☐ '}${esc(o.text)}</li>`).join('');
  return page(`<div class="page"><div class="dark" style="width:1000px">
      <p class="kicker">${esc(sceneTitle)}</p>
      <h2 style="font-size:32px">${esc(prompt)}</h2>
      <ul class="opts" style="columns:2;column-gap:24px">${li}</ul>
      ${closing ? `<p style="margin-top:.8em;font-size:24px">${esc(closing)}</p>` : ''}
    </div></div>`);
}

/** Card standing in for a generated asset that does not exist yet (mirrors the player's fallback). */
export function pendingCard({ sceneTitle, assetId, spec, overlays = [] }) {
  const ov = overlays.map(o => `<div>${o.kind === 'pin' ? '▸ ' : ''}${esc(o.text)}</div>`).join('');
  return page(`<div class="page"><div class="card">
      <h2>${esc(sceneTitle)}</h2>
      ${ov ? `<div class="sans" style="font-size:20px;color:#4a3d2f;margin:.6em 0">${ov}</div>` : ''}
      <p><small>generated asset pending: ${esc(assetId)}${spec ? ' — ' + esc(spec) : ''}</small></p>
    </div></div>`);
}

/** Credits card(s). `lines` is an array of {head, text}. */
export function creditsCard({ title = 'Credits', lines, pageNo, pages, footer }) {
  const ps = lines.map(l => `<p><b>${esc(l.head)}</b> ${esc(l.text)}</p>`).join('');
  return page(`<div class="page" style="align-items:flex-start;padding:48px 64px">
    <div style="width:100%">
      <p class="kicker">${esc(title)}${pages > 1 ? ` · ${pageNo}/${pages}` : ''}</p>
      <div class="credits">${ps}</div>
      ${footer ? `<div class="foot"><span>${esc(footer)}</span></div>` : ''}
    </div></div>`);
}

/**
 * The paper mount for a small archive plate — the film's copy of the player's `.imgplate` (v0.7).
 * Rendered at its OWN size on a transparent page and composited by ffmpeg, so the picture is printed at 1:1
 * (never enlarged) and the credit IS the caption on the paper, not an overlay dropped on the picture.
 */
export function plateCard({ imageUrl, w, h, pad = 20, caption = '', capSize = 18, cjk = false }) {
  const face = cjk ? `'Noto Serif CJK SC','Noto Sans CJK SC',Georgia,serif` : `Georgia,'Liberation Serif','Times New Roman',serif`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;background:transparent}
    .plate{display:inline-flex;flex-direction:column;gap:.55em;padding:${pad}px;width:${w + 2 * pad}px;
      background:linear-gradient(163deg,#f7f0de 0%,#f0e6ce 55%,#e6dabc 100%);color:#3a2f22;
      border:1px solid rgba(58,44,26,.34);border-radius:3px;
      box-shadow:0 26px 72px rgba(0,0,0,.62), 0 1px 0 rgba(255,255,255,.35) inset;}
    .plate img{display:block;width:${w}px;height:${h}px;border:1px solid rgba(58,44,26,.42);}
    .cap{font:italic ${capSize}px/1.35 ${face};color:#5d4c37;text-align:left;max-width:${w}px;}
  </style></head><body><figure class="plate"><img src="${esc(imageUrl)}">${caption ? `<figcaption class="cap">${esc(caption)}</figcaption>` : ''}</figure></body></html>`;
}
