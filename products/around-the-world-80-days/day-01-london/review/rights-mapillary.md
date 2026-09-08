# Rights & Licensing — MAPILLARY IMAGERY: the standing ruling

**Reviewer:** rights-licensing   **Date:** 2026-09-08   **Overall: GREEN, with four conditions.**
**Scope:** studio-wide, not Day-1-only. Filed here because this is where the question was raised
(`review/rights-a6.md` §2.4.2, `review/STATUS.md` "OPEN — needs Rights") and where it is currently load-bearing.
**Supersedes:** the "per-sequence licence check before any Mapillary frame is used" instruction in `rights-a6.md`
§2.4.2 (that check is impossible, and this document explains why it is also unnecessary), and the `unknown`
classification of Mapillary frames in `studio/tools/panowalk/lib/licence.mjs`.

> **RULING IN ONE SENTENCE.** Mapillary imagery obtained through the Graph API may be adapted into our published
> CC BY-SA 4.0 films, because Mapillary states — in its Terms, in its Help Centre, and in the per-image panel of its
> own web application — that **all** images are shared under CC BY-SA (4.0), the NonCommercial carve-out in the Terms
> is scoped to separately-distributed *data sets* and appears nowhere in the product, and there is **no per-image
> licence anywhere** because there is no per-image variation to express; the conditions are contributor credit, the
> Mapillary logo and link-back required by Terms §11, the BY-SA 4.0 adapter's-licence notice, and retention of the
> evidence in §1 below.

**Inputs read:** `studio/roles/_common.md` (RULE 0) · `studio/roles/rights-licensing.md` ·
`products/around-the-world-80-days/DECISIONS.md` (RULE 1, D1, D2, D4, D6, D9) ·
`day-01-london/review/rights-a6.md` · `day-01-london/review/rights.md` · `day-01-london/review/STATUS.md` ·
`day-01-london/media/manifest-a6.md` · `day-01-london/media/manifest-motion.md` ·
`studio/strategy/media-fallback-ladder.md` · `studio/tools/panowalk/README.md` + `lib/licence.mjs` ·
the 7 cached `frames.json` files under `day-01-london/media/files/panos/`.

**RULE 0 / RULE 1 compliance.** Nothing was bought, no account was created, no terms were accepted on the founder's
behalf. The Mapillary calls below used the free `mapillary_token` already present in the gitignored
`www/config.json`; Mapillary's Graph API is free at any volume we can reach (rate-limited, not metered). Everything
else was an anonymous HTTP GET. Total spend: zero.

---

## 1 · Primary sources fetched today (2026-09-08), not recalled

| # | source | how retrieved | what it gave |
|---|---|---|---|
| S-1 | **Mapillary Terms of Use**, `https://www.mapillary.com/terms`, "Effective date: February 15, 2024" | direct GET, 200, full server-rendered text (110 KB) | §3 Licenses, §4 User Content, §5 Prohibited Conduct, §11 Developers, §12 Commercial Purposes — all quoted below |
| S-2 | **Mapillary Help Centre, "CC-BY-SA license for open data"**, `https://help.mapillary.com/hc/en-us/articles/115001770409-CC-BY-SA-license-for-open-data`, article footer "May 12, 2025 11:34 Updated" | help.mapillary.com is behind Cloudflare and returns **403** to every non-browser client (tried twice, with browser headers); read from the **Wayback snapshot `20260724100858`** (6 weeks old) | "All images on Mapillary are shared under a CC-BY-SA license"; the attribution example; support address |
| S-3 | **Mapillary web application bundle**, `https://www.mapillary.com/app/main.aa495ceea241c165.js` (5.70 MB), referenced by `https://www.mapillary.com/app/?pKey=483173490062845&focus=photo` | direct GET, 200; the app is client-rendered, so the UI strings were read out of the bundle itself | the **per-image "Image details" panel template**, and the fact that the 5.7 MB bundle contains **no** NonCommercial string |
| S-4 | **Mapillary Graph API, live**, `https://graph.mapillary.com/…` with the existing free token | 8 calls | no `license` field, no `organization_id`, on either the entity or the search endpoint |
| S-5 | **Mapillary blog, "Mapillary Goes Creative Commons"**, `https://blog.mapillary.com/update/2014/03/17/mapillary-goes-creative-commons.html` | direct GET, 200 | the 2014 NC episode and its end date |
| S-6 | **Mapillary blog, "Expanding Access to Public Street-Level Imagery in the US"**, `…/2024/07/08/expanding-public-street-level-imagery-access.html` | direct GET, 200 | government/agency contributors are pointed at the same Terms; no separate licence |
| S-7 | **Mapillary Datasets index**, `https://www.mapillary.com/datasets` | direct GET, 200 | the six *research data sets* that the Terms' NC sentence is about (their individual pages are client-rendered; not verified — see §3.3) |
| S-8 | **KartaView Terms & Conditions**, first-hand at last: `https://kartaview.org/main.37500d86f90dd0a752a5.js` (4.50 MB), the bundle `https://kartaview.org/terms` loads | direct GET, 200; terms text extracted from the app's own content array | the **"Open Source License"** clause verbatim, the required credit string, and the absence of any NC term |
| S-9 | **CC BY-SA 4.0 legal code**, `https://creativecommons.org/licenses/by-sa/4.0/legalcode.txt` | direct GET, 200 | §1(a) Adapted Material, §1(b) Adapter's License, §3(a) Attribution, §3(b) ShareAlike |
| S-10 | **CC BY-SA 3.0 legal code**, `https://creativecommons.org/licenses/by-sa/3.0/legalcode.txt` | direct GET, 200 | §4(b)(ii) — an adaptation may be released under *a later version* with the same elements |
| S-11 | **Wikimedia Commons**, `File:Photo from Mapillary 2025-11-20 (886997037093146).jpg` | direct GET, 200 | how the strictest-licensing large reuser treats Mapillary imagery today |
| S-12 | **Mapillary Community Forum**, `forum.mapillary.com/t/…/3821` | direct GET, 200 | community practice on attribution; no staff statement, no NC discussion |

Per the precedent of `rights-a6.md`, licence findings are numbered S-n here rather than added to
`research/fact-sheet.md`, which holds *content* facts (F-xx) for narration. Nothing in this document is narrated.

---

## 2 · Question 1 — what the current Terms actually say

**`https://www.mapillary.com/terms`, effective 15 February 2024, accessed 2026-09-08** (S-1). The Terms are issued by
**Meta Platforms Ireland Limited**, trading as Mapillary.

**§3 "Licenses"**, third and fourth sentences — the operative clause for third-party reuse:

> "Your use of any User Content provided by other users is subject to the Creative Commons Share Alike (CC BY-SA)
> license, unless we indicate otherwise. For instance, we may provide access to certain User Content (alone or in
> combination with other data sets) under a separate set of license terms (such as the Creative Commons Attribution
> NonCommercial Share Alike (CC BY-NC-SA license). You agree to comply with the license terms that apply to any of
> the data sets we make available via the Mapillary Services, including User Content provided by other users. Those
> license terms will apply to the extent of any conflict between those license terms and these Terms."

Two things in that paragraph decide the whole question, and both were read too pessimistically in `rights-a6.md`:

1. **The default is not a hint, it is the rule.** BY-SA applies *"unless we indicate otherwise"*. The exception is
   conditioned on an **act of indication by Mapillary**. Absent an indication, there is nothing to check: the licence
   is BY-SA by the terms' own operation. Our previous position — "some content is NC, and we cannot tell which, so
   everything is unknown" — inverts the clause. It treats a conditional exception as an unconditional ambiguity.
2. **The exception is about data sets, not about individual contributors.** Every noun in the exception sentence is
   plural and curated: *"certain User Content (alone or in combination with other data sets) under a separate set of
   license terms"*, and the following sentence is entirely about *"the data sets we make available"*. It is not a
   statement that user A's photograph might be NC while user B's is not. §3.3 below identifies what it is about.

**§4 "User Content"** — where the contributor's grant comes from. The uploader keeps ownership, and grants Mapillary
a *"nonexclusive, royalty-free, irrevocable, worldwide, fully paid, transferable and sublicensable license to use,
reproduce, publish, create derivative works from, distribute, publicly perform and display your User Content."*
So Mapillary holds a sublicensable right wide enough to make the §3 CC BY-SA grant to us, and the contributor has
warranted in §5 that our use *"will not violate any rights of or cause injury to any person or entity."*

**§11 "Additional Terms for Developers"** — a contractual obligation on us, on top of CC:

> "You must adhere to the attribution requirements set forth below and as applicable to any User Content provided by
> others that you obtain. If you are downloading individual images and serving them from your own servers, you must
> attribute the image(s) by visibly displaying the Mapillary logo and linking back to the Mapillary homepage or
> corresponding Mapillary image page."

We download individual images and serve them (inside an MP4, from our own host). §11 therefore applies to us in full.
§11 also requires that a developer application be registered for a `client_id` — already done; the token exists.

**§5 "Prohibited Conduct"** — three that touch us, none of which we breach: no attempt to *"re-identify or unblur any
aspect of any Content, including any individual or license plate"* (our frames arrive pre-blurred and we do not
sharpen faces); no *"data mining, robots or similar data gathering or extraction methods not approved by Mapillary"*
(we use the documented Graph API with a registered token, which is the approved interface); and no use *"in
connection with real-time navigation or route guidance"* (a film is not navigation).

**§12 "Use of the Mapillary Services for Commercial Purposes"** — dormant today under **D1 (free)**, live the day D1
is revisited. It permits commercial use of the *Services* only for *"(i) improvement, training, and development of
products, services, maps, studies, platforms, websites, applications, software, algorithms, datasets, solutions, or
technologies; and (ii) in the provision of services for or on behalf of one or more of your clients"*, and requires
safeguards against re-identification. See §7.3 for how far this actually reaches.

---

## 3 · Question 2 — is the NC case real, and can a given image's licence be determined?

### 3.1 The historical NC is genuinely historical, and it lasted six weeks

Mapillary's own announcement of 17 March 2014 (S-5) launched CC BY-**NC**, and carries this update at the foot of the
same post:

> "Update: We are revising the license and going from CC-BY-NC to CC-BY-SA on April 29, 2014."

That change was platform-wide, not opt-in, and it is the only NC period in Mapillary's history. **Every frame the
studio holds or has proposed was captured between 2015-07-21 and 2026-06-16** — a decade after it ended. (Capture
date is not itself the test; the licence that matters is the one under which Mapillary distributes to us today. But
it disposes of the "maybe this old image is NC" worry entirely.)

### 3.2 There is no per-image licence anywhere. Verified four ways today.

**(a) The Graph API — re-verified live, 2026-09-08** (S-4), against image `483173490062845` (contributor
`asturksever`, the Savile Row walk behind M-108):

```
GET /483173490062845?fields=id,license        → {"error":{"message":"Tried accessing nonexisting field (license)","code":100}}
GET /483173490062845?fields=id,licence        → nonexisting field (licence)
GET /483173490062845?fields=id,license_type   → nonexisting field (license_type)
GET /483173490062845?fields=id,organization_id→ nonexisting field (organization_id)   ← this now ERRORS on the entity
GET /images?fields=id,organization_id&bbox=-0.1425,51.5100,-0.1405,51.5115 → 200, every object is {"id": …} only
GET /483173490062845?fields=id,creator,captured_at,is_pano
        → {"id":"483173490062845","creator":{"username":"asturksever","id":"100649835516699"},…}
```

There is no licence field under any spelling, and no organisation attached to central-London imagery on either
endpoint, so there is no org-versus-individual proxy either. This is unchanged since 2026-08-19 except that
`organization_id` has gone from *silently absent* to *rejected as a nonexistent field* on the entity endpoint.

**(b) The web page — and this is the find that closes the question.** `mapillary.com/app` is an Angular shell, so
the licence text a human sees was read out of the application's own bundle (S-3). The **per-image "Image details"
panel** — the panel that opens for a single image, containing "Captured by / Captured on / Captured with / Image
resolution" and the **"Download image"** button — ends with this, verbatim from the template:

```html
<div class="center mb2 gray h5">
  All images are shared under a <a href="https://creativecommons.org/licenses/by-sa/4.0"
  … >CC BY-SA</a> license
</div>
```

Three consequences, and they are decisive:

- Mapillary's own product answers the licence question **at the point of download, per image**, and the answer is
  **CC BY-SA 4.0** — the version, which the Terms and the Help Centre both omit, is pinned by that href.
- The string is **static**. It is not bound to any `node?.license` property; the template has no conditional and no
  interpolation for licence. The UI has **no mechanism** to say anything else about any image.
- Searching the entire 5.70 MB bundle for `NC-SA`, `NonCommercial` and `non-commercial` returns **two** hits, and
  both are the IANA time-zone string `America/Blanc-Sablon`. **The word "NonCommercial" does not occur anywhere in
  Mapillary's application.**

So the place where a reuser would look for Mapillary to *"indicate otherwise"* — the image's own page, next to its
own download button — indicates BY-SA 4.0, for every image, unconditionally.

**(c) The Help Centre** (S-2), article "CC-BY-SA license for open data", updated 12 May 2025:

> "When you contribute imagery to Mapillary, you submit it under Mapillary's terms. All images on Mapillary are
> shared under a CC-BY-SA license, which in short means that anyone can look at and distribute your images, and even
> modify them a bit, as long as they give attribution."

No carve-out, no per-contributor option, no mention of NC. (The article footer notes the Help Centre itself is
CC BY-SA.) **Caveat, stated plainly:** help.mapillary.com serves 403 to every non-browser client, so this quote is
from the Internet Archive's snapshot of 24 July 2026 — six weeks old, and of an article Mapillary last edited in
May 2025. It is a faithful copy, not a live read; a human with a browser can confirm it in fifteen seconds.

**(d) Contributor profile / sequence metadata / bulk export.** The profile page (`/app/user/<username>`) is the same
Angular shell and carries no licence element; there is no per-user licence setting exposed in the app; the sequence
is only an id (`GNCMksZ65RXHix0bfTKotI`) with no attributes of its own; and there is no bulk export of imagery
metadata other than the same Graph API and the vector tiles, which carry the same fields.

**Finding, stated plainly as the brief invites: there is no way, by any route, to read a per-image licence from
Mapillary — because there is no per-image licence to read.** The licence is a platform-level fact, stated three
times in three places, and the absence of an API field is a consequence of that uniformity, not evidence of
ambiguity. This is exactly the position we already accept for KartaView, whose API has no licence field either and
whose frames we class `platform-default` and ship as green.

### 3.3 So what is the NC sentence for?

The Terms' example — *"certain User Content (alone or in combination with other data sets) under a separate set of
license terms"* — matches a real and separate distribution channel: Mapillary's **research data sets**, listed at
`mapillary.com/datasets` (S-7): Vistas, Metropolis, Planet-Scale Depth, Street-level Sequences, Traffic Sign,
CrowdDriven. These are annotated corpora built *from* user imagery, distributed under their own click-through
research terms, and they are a different product from the Graph API image stream. **I could not verify their
individual licence text within budget** — each dataset page is client-rendered and the Wayback fallback rate-limited
me — so I assert only what I checked: they exist, they are distributed separately, and they are the only thing on
Mapillary that answers to the phrase "in combination with other data sets". **We use none of them**, and nothing in
this ruling depends on what their licences say.

Two supporting observations, neither load-bearing: government and agency contributors are pointed at the same Terms
of Use with no separate licence (S-6, July 2024); and **Wikimedia Commons**, which forbids NC and ND material
absolutely, hosts Mapillary imagery under `{{cc-by-sa-4.0}}` crediting the individual contributor — including a
photograph by `asturksever`, the same contributor as our Savile Row walk (S-11).

---

## 4 · Question 3 — what attribution is actually required, and in what form

Two obligations stack. They are not alternatives.

**(a) CC BY-SA 4.0 §3(a)** (S-9), because we are sharing modified Licensed Material: identify the creator(s)
*"in any reasonable manner requested by the Licensor"*; keep any copyright notice; give *"a URI or hyperlink to the
Licensed Material to the extent reasonably practicable"*; *"indicate if You modified the Licensed Material"*; and
*"indicate the Licensed Material is licensed under this Public License, and include the text of, or the URI or
hyperlink to, this Public License."* §3(a)(2) then allows all of it *"in any reasonable manner based on the medium,
means, and context"*, expressly including *"providing a URI or hyperlink to a resource that includes the required
information."*

The manner **requested by the licensor** is given in the Help Centre (S-2), and we should follow its shape:

> "This is an example of a perfect attribution when you use Mapillary imagery on your website, blog etc:
> "Title" \<Link to Mapillary image\> by "username" \<Link to user profile\>, licensed under CC-BY-SA."

**(b) Terms §11**, contractual and additional to CC: because we download individual images and serve them ourselves,
we must **visibly display the Mapillary logo** and **link back** to the Mapillary homepage or the corresponding image
page. Attributing correctly under CC does **not** discharge §11, and §11 is the reason a Mapillary shot cannot carry
the same bare text credit a KartaView shot carries.

**A wrinkle worth naming, because it constrains the wording.** CC BY-SA 4.0 §3(b)(3) forbids us to *"offer or impose
any additional or different terms or conditions on … Adapted Material that restrict exercise of the rights granted
under the Adapter's License."* §11 binds **us**, as a Mapillary developer. We satisfy it by displaying the logo and
the link ourselves. We must **not** phrase it as a condition on people who reuse our film — no "you must display the
Mapillary logo" in our licence notice. If a downstream reuser goes to Mapillary for frames, §11 becomes their
contract; that is theirs, not a term of ours.

---

## 5 · Question 4 — does transformation into a hyperlapse or a rendered walk change anything?

**It changes the obligations, not the permission.** A hyperlapse of 59 frames is squarely *Adapted Material* under
CC BY-SA 4.0 §1(a): material *"derived from or based upon the Licensed Material and in which the Licensed Material is
translated, altered, arranged, transformed, or otherwise modified in a manner requiring permission"* (S-9). Our
panowalk pipeline reprojects, crops, stabilises, re-times and frame-interpolates — every verb in that list. So:

1. **§2(a)(1)(B) grants the right to adapt**, so making the shot is permitted; nothing about a moving picture is
   outside the grant. (The "synched in timed relation with a moving image" sentence in §1(a) is about *musical works
   and sound recordings*; it does not apply to photographs. Our narration over the shot does not, by itself, create
   Adapted Material — the reprojection and re-timing already do.)
2. **§3(b) ShareAlike bites**: the Adapter's Licence must be a CC licence with the same elements, *"this version or
   later"*, and we must *"include the text of, or the URI or hyperlink to, the Adapter's License."* **D4** already
   puts our cuts under CC BY-SA 4.0, so this costs us nothing we had not already decided; but the credits tail must
   carry the BY-SA 4.0 URI on **every** cut containing a Mapillary or KartaView shot. That line is compliance, not
   decoration.
3. **§3(a)(1)(B) requires indicating the modification.** Hence `· adapted` in the burned credit, and an explicit
   verb list in the credits tail. Passing off a reprojected 360° pan as an untouched photograph would be the actual
   breach.
4. **The version ambiguity is harmless.** Mapillary's Terms say "CC BY-SA" with no version; the app says 4.0. If some
   image were in fact under BY-SA 2.0 or 3.0, CC BY-SA 3.0 §4(b)(ii) (S-10) permits distributing an adaptation under
   *"a later version of this License with the same License Elements"*. Our BY-SA 4.0 film is therefore compliant on
   any version reading. Nothing turns on the missing number.
5. **§11's logo duty follows the frames into the film.** Serving them "from our own servers" includes serving them
   inside our MP4.

---

## 6 · Question 5 — KartaView, on the same five points, and no longer second-hand

`rights-a6.md` §2.5 could only cite the OSM wiki, because `kartaview.org/terms` renders client-side. **It is now
first-hand.** KartaView's application bundle, served by kartaview.org itself, carries the terms as a content array;
the clause titled **"Open Source License"** (the `#terms3` anchor the OSM wiki cites) reads, verbatim (S-8):

> "KartaView is developed by Grab with the aim of creating the biggest possible repository of street level
> photography imagery, and thus Grab would like to open source KartaView's codes, under the terms of the MIT License
> ("MIT License"), and by licensing the street images made available on KartaView and 3D spatial data under
> **Creative Commons Attribution-ShareAlike 4.0 International** ("CC-By-SA License"), with the license terms
> available at https://creativecommons.org/licenses/by-sa/4.0/legalcode. The content which you submit, post,
> display, upload on or via KartaView is therefore subject to the rules of the afore-mentioned MIT License and
> CC-By-SA License, a fact which is hereby acknowledged and confirmed by you. […] **You are free to copy,
> distribute, transmit and adapt data on KartaView, as long as you comply with the applicable open source license
> and credit Grab and the KartaView contributors. We require that you use the credit "© Grab and KartaView
> Contributors".**"

And the site's own FAQ entry, from the same bundle: *"What is the license of the data?" — "Images you are uploading
are available under the Creative Commons Attributions-ShareAlike 4.0."*

| | **Mapillary** | **KartaView** |
|---|---|---|
| operator | Meta Platforms Ireland Ltd | Grab (Singapore) |
| stated licence | CC BY-SA (Terms §3, no version) → **4.0** per the app's image panel and the Help Centre | **CC BY-SA 4.0**, versioned in the terms themselves, with a link to the legal code |
| NC anywhere? | one sentence in the Terms, scoped to *data sets*; **zero occurrences in the product** | **none at all** — the word does not appear in the terms or the bundle |
| per-image licence field | none, and no UI that could express one | none (single platform licence) |
| explicit permission to adapt | via CC | **also in the terms**: *"free to copy, distribute, transmit and adapt"* |
| extra contractual attribution | **yes** — visible **Mapillary logo** + link back (§11) | credit line **"© Grab and KartaView Contributors"**; no logo requirement |
| individual photographer named | required by CC §3(a); API gives `creator.username` | terms ask only for the collective credit; CC §3(a) still requires the contributor where supplied, so credit both |
| date on the terms | effective 15 Feb 2024 | none shown; MIT notice reads "Copyright 2020" |
| our verdict | **green, conditional** (this document) | **green** — the a6 caveat is discharged; the quote is now first-party |

**Caveat, honestly:** this text came from a JavaScript bundle served by kartaview.org, not from a rendered page. It
is first-party content from the site's own origin, and the wording matches the OSM wiki's second-hand quote, so I am
treating it as first-hand. A human with a browser can still confirm the rendered page in a minute, and should before
the first publish.

**Practical consequence:** where a shot exists on both platforms at comparable quality, **prefer KartaView** — one
fewer contractual duty, no third-party logo on our frame, a versioned licence. That is a preference, not a rule; the
motion manifest shows KartaView simply does not cover several beats at walking pace.

---

## 7 · The ruling

### 7.1 Verdict table

| media id | what it is | basis for use | risk | verdict | action |
|---|---|---|---|---|---|
| **Cached panowalk stops** `count-the-steps-w01…w06`, `look-up-the-cross-w00` — 98 frames, contributors `asturksever`, `Stefdegreef` ×3, `cernbyln`, `milhouse`, `NatchaponJ`, captured 2022-02-23 → 2026-06-16 | the frames scene 04 and scene 15 already render from | Mapillary **CC BY-SA 4.0**, platform-stated (S-1 §3, S-2, S-3) | low | **green** | re-tag `licence_class` from `unknown` to `platform-default`; burn credit per §8; §11 logo + link |
| **M-108** Savile Row walking pace, seq `GNCMksZ65RXHix0bfTKotI`, `asturksever`, 2022-02-23 | 59 frames, 2.8 m, 1.3 m/s | as above | low | **green** | credit `Mapillary / asturksever` |
| **M-109** Savile Row north, 360°, seq `txqvAgRwn1YEOie7fI6sLd`, `Stefdegreef`, 2024-09-19 | 24 frames, 5760×2880 | as above | low | **green** | credit `Mapillary / Stefdegreef` |
| **M-115** Golden Jubilee footbridge, seq `XG6JP4aLFcqYX1AfbwuTQQ`, `kieran`, 2015-07-21 | 37 frames, 16:9 native | as above | low | **green** | credit `Mapillary / kieran`; narrate as the river, not Fogg's train (a fact-check point, not a rights one) |
| **M-116** Charing Cross forecourt 360°, seq `VgRKivL0cBNshd2Pu7qkJU`, **`peterleth`**, 2024-01-24 | 20 frames | as above | low | **green on rights** | contributor confirmed live today; still **unviewed** — content clearance (branding, people, dated events) is Content Preparer's, not settled here |
| **M-117** Calais, seq `v3os63fy2ei82hl66w4xox`, **`kritic`**, 2021-01-02 | 18 frames | as above | low | **green on rights** | as M-116; Day 2 |
| Any **Mapillary research data set** (Vistas, Metropolis, MSLS, Planet-Scale Depth, Traffic Sign, CrowdDriven) | annotated corpora | separate click-through terms; the Terms §3 example points here | — | **red — do not use** | not needed; if ever wanted, Rights must read that dataset's own licence first |
| Any Mapillary imagery where Mapillary **does** indicate a different licence on the image page or in a labelled dataset | — | §3 "unless we indicate otherwise" | — | **red until Rights re-rules** | none known to exist in the product today |
| **M-107**, **M-66**, **M-67** and other KartaView frames | seq 1123901, 1124 | KartaView **CC BY-SA 4.0**, now first-hand (S-8) | low | **green** | add the required credit `© Grab and KartaView Contributors` — see §8; a6's attribution strings omitted it |

### 7.2 The four conditions

1. **Attribute per §8** — contributor username on screen for the duration of every Mapillary shot, Mapillary logo and
   link-back per §11, full credits tail, and the BY-SA 4.0 adapter's-licence line on every cut.
2. **Keep the evidence.** This document, with its dated quotes, *is* the licence record. Re-verify before any
   materially new campaign or if Mapillary's Terms change date (currently 15 Feb 2024); the app bundle filename is
   hash-versioned and will move, which is why the string is quoted here in full.
3. **No dataset material, and stop if Mapillary ever indicates otherwise** on an image we want. Nothing in the
   product does so today; if that changes, that image is red until re-ruled.
4. **Do not breach §5** — no unblurring, no re-identification, no scraping outside the Graph API, no navigation use.
   This binds the pipeline as well as the film.

### 7.3 Residual risk, named honestly

| risk | severity | assessment |
|---|---|---|
| Mapillary's licence statement is **global, not per image**, so our record is a platform statement plus a screenshot-grade quote, not a per-asset certificate | **low, and irreducible** | the same basis we already accept for KartaView; three independent first-party statements agree; Commons relies on it at scale (S-11); and CC 4.0 §2(a)(1) makes the grant *irrevocable*, so a frame lawfully obtained today stays BY-SA to us even if Mapillary changes its terms tomorrow |
| A **contributor uploaded imagery they did not own** | low | the ordinary crowd-sourced risk, identical on KartaView, Commons and geograph; §5 puts the warranty on the uploader; mitigate by preferring contributors with real upload histories (all six of ours have multi-sequence histories) |
| **§12 commercial-purpose list** if D1 is ever revisited toward monetisation | low today, **must be re-read then** | §12 governs our use of the *Services* (the API), while the CC BY-SA grant on the *content* expressly permits commercial use and is irrevocable. Worst case is a contract question with Meta about how we accessed the frames, not a copyright question about the film. Flagged as a decision below, not resolved here |
| **Version silence** in the Terms | negligible | resolved by S-3's `by-sa/4.0` href, and immunised by S-10's later-version clause |
| **Burning Meta's logo** into our frames | not a legal risk; a brand one | §11 *requires* it, so the trademark use is authorised for this purpose. Do not restyle it, do not imply endorsement. See decision 2 |

---

## 8 · The attribution we would actually burn

Format follows `rights-a6.md` §2.6 (short form on screen + full form in the credits tail, because a burned frame
supports no hyperlink and §3(a)(2) allows a reasonable-manner split), with §11's logo and link added for Mapillary.

**On screen — lower-left, for the full duration of the shot**, 22 px Source Sans 3, white on a 55 % black scrim,
inside the safe area, with the **Mapillary logo mark at cap height immediately before the text**:

- M-108 / `count-the-steps-w01`: `[M] Mapillary / asturksever · CC BY-SA 4.0 · adapted`
- M-109 / `count-the-steps-w02, w04, w05`: `[M] Mapillary / Stefdegreef · CC BY-SA 4.0 · adapted`
- `count-the-steps-w06` (the Reform Club 360° stop): `[M] Mapillary / milhouse · CC BY-SA 4.0 · adapted`
- `count-the-steps-w03`: `[M] Mapillary / cernbyln · CC BY-SA 4.0 · adapted`
- `look-up-the-cross-w00` (the Eleanor Cross pan): `[M] Mapillary / NatchaponJ · CC BY-SA 4.0 · adapted`
- M-115: `[M] Mapillary / kieran · CC BY-SA 4.0 · adapted`
- M-116: `[M] Mapillary / peterleth · CC BY-SA 4.0 · adapted`
- M-117: `[M] Mapillary / kritic · CC BY-SA 4.0 · adapted`
- KartaView shots (M-66, M-67, M-107) — **corrected**, a6's version omitted Grab's required credit:
  `KartaView / telenavdrives · © Grab and KartaView Contributors · CC BY-SA 4.0 · adapted`

`[M]` is the Mapillary logo asset, which Engine must add to `studio/tools/render/assets/` (free download from
mapillary.com; do not redraw it). **Until that asset exists, the wordmark "Mapillary" in our caption face is a
good-faith but not literal reading of "visibly displaying the Mapillary logo"** — ship the wordmark if we must ship
before the asset lands, and treat the logo as a pre-publish to-do, not a blocker.

**Credits tail — verbatim, on every cut containing a Mapillary shot:**

> Street-level imagery from **Mapillary** (www.mapillary.com), by its contributors: **asturksever** (Savile Row,
> 23 Feb 2022), **Stefdegreef** (Savile Row and St James's Street, 19 Sep 2024), **milhouse** (Pall Mall,
> 10 Apr 2024), **cernbyln** (16 Jun 2026), **NatchaponJ** (Charing Cross, 10 Aug 2025), **kieran** (Golden Jubilee
> Bridge, 21 Jul 2015), **peterleth** (Charing Cross, 24 Jan 2024). Licensed **CC BY-SA 4.0** —
> creativecommons.org/licenses/by-sa/4.0/. Adapted by Yunyou: reprojected from 360°, cropped, stabilised, re-timed
> and interpolated into moving shots. Individual image pages: yunyou.example/credits/day-01 [replace with the real
> credits URL]

> Street-level imagery from **KartaView** (kartaview.org) — © Grab and KartaView Contributors, contributor
> **telenavdrives** — licensed **CC BY-SA 4.0**. Adapted by Yunyou: cropped, stabilised, re-timed.

> This film, and the adapted shots within it, are released under **Creative Commons Attribution-ShareAlike 4.0
> International** — creativecommons.org/licenses/by-sa/4.0/

**Off-frame, where links exist — required, not optional.** §11 wants a link back and §3(a)(1)(A)(v) wants a URI to
the licensed material; a burned frame has neither. So the video description and a `credits/` page must list, per
shot, `Image <pKey> by <username> (https://www.mapillary.com/app/?pKey=<pKey>), licensed under CC BY-SA 4.0` plus a
link to `https://www.mapillary.com`. This mirrors the licensor's own requested form (S-2) and is what §3(a)(2)'s
"URI to a resource that includes the required information" is for. **Engine can generate it from `frames.json`** —
every field needed is already recorded per frame.

---

## 9 · What changes in the pipeline (Engine/Tools, small)

1. `studio/tools/panowalk/lib/licence.mjs` — give Mapillary the same `platform-default` treatment as KartaView:
   `licence: "CC BY-SA 4.0"`, `licence_class: "permissive"`, `licence_source: "platform-default (Mapillary Terms
   §3, eff. 2024-02-15; image-details panel, verified 2026-09-08 — see review/rights-mapillary.md)"`. Keep
   `--accept-unknown-licence` for genuinely unknown providers; **Mapillary no longer needs it**, and no future
   render should depend on a human remembering to pass it.
2. The burned credit string loses `(platform default — NOT stated per image)`. That hedge is now inaccurate: the
   licence **is** stated, platform-wide and at the point of download; it is simply not a per-image field. Replace
   with the §8 strings.
3. Add the Mapillary logo asset and emit the credits tail + per-shot link list from `frames.json`.
4. `studio/tools/panowalk/README.md` §Licence rules and `review/STATUS.md` "OPEN — needs Rights" — rewrite to point
   here. The 7 cached stops should be re-tagged in place; the bytes need no re-fetch.
5. `rights-a6.md` §2.6's KartaView credit lines need `© Grab and KartaView Contributors` added (§8 above).

---

## 10 · If the founder overrules this and says no

Stated so the cost is visible, per the brief. Dropping Mapillary costs, per `media/manifest-motion.md`:

- **M-108, M-109, M-115, M-116, M-117 all die** — four of the five newly solved motion beats, and the whole of the
  Day 2 Calais material gathered so far.
- **Savile Row loses walking pace.** M-107 (KartaView 1123901) still covers all 280 m, but at 11.8 m spacing it is a
  hyperlapse, not the "slow walk" the founder asked for in D9. There is no KartaView walk on the Row.
- **Charing Cross loses its motion entirely** — the forecourt (M-116 + the cached `look-up-the-cross-w00`) and the
  river crossing (M-115) are both Mapillary. Scene 15's Eleanor Cross pan, already rendered, would have to come out.
- **Scene 04's street footage comes out**, and the clubland block's only moving shot — the cached Reform Club 360°
  stop (`count-the-steps-w06`) — goes with it, leaving the chapter's longest narration stretch on stills.
- Net: the film returns to roughly the pre-A8 picture-to-narration ratio in its first and last thirds. The archive
  film (M-112, M-113, M-114, M-81) is unaffected and remains the strongest non-Mapillary motion we have.

---

## 11 · Routes to certainty we have not taken

1. **Email `support@mapillary.com`** — the Help Centre invites exactly this: *"Feel free to contact us at
   support@mapillary.com if you're unsure about licenses and attribution and we'll be happy to guide you."* Free,
   and the founder sends it per the **D2** pattern. It is **not** needed to publish under this ruling; it converts
   low residual risk into a written answer, and it is the right first move if D1 is ever revisited. Draft:

   > Subject: Licence confirmation for reuse of Mapillary imagery in a Creative Commons film
   >
   > Hello — we are making a short documentary film about London, released free of charge under CC BY-SA 4.0. We
   > would like to use a small number of images from Mapillary (contributors asturksever, Stefdegreef, milhouse,
   > cernbyln, NatchaponJ, kieran, peterleth; central London and Calais), downloaded with a registered developer
   > token, reprojected and re-timed into short moving shots. We will credit each contributor on screen, display the
   > Mapillary logo, link back to each image page, and licence the film under CC BY-SA 4.0.
   >
   > Two questions. (1) Terms §3 says imagery is CC BY-SA "unless we indicate otherwise", and gives CC BY-NC-SA as
   > an example for certain content combined with data sets. Is there any way for a reuser to tell whether a given
   > image is covered by such an indication? The Graph API exposes no licence field and the image-details panel in
   > your web app states CC BY-SA 4.0 for all images. (2) Which CC BY-SA version applies — your app links 4.0, the
   > Terms give no version. Thank you.

2. **Contributor-level permission.** Not required — the CC grant already exists — and asking implies it does not.
   Better used as **goodwill outreach**: seven named Londoners and travellers whose photographs will be in a film
   they can watch. Recommend a short "your imagery is in this, thank you, here it is" note **after** publish, via
   the Mapillary forum. Not a rights action; a relationship one.
3. **Restrict ourselves to contributors who have separately stated a licence.** Considered and rejected: no
   contributor states one, because the platform states it for them. The filter would select for nothing and exclude
   everything.
4. **Prefer KartaView where coverage allows.** Adopted as a preference (§6), and it is why M-107 stays the primary
   for the full-street Savile Row shot even though M-108 walks better.
5. **A human with a browser** should, before first publish, open `help.mapillary.com/hc/en-us/articles/115001770409`
   and `kartaview.org/terms` and confirm the two quotes that came to me via an archive snapshot and a JS bundle.
   Two minutes, and it upgrades both citations to live first-hand reads.

---

## Decisions I need from the human

Only genuine risk-appetite questions; everything readable from the licences is settled above.

1. **Do you accept a platform-level licence statement as sufficient basis to publish?** My ruling says yes: three
   first-party statements (Terms §3, Help Centre, and the app's own per-image download panel), no NC anywhere in the
   product, an irrevocable CC grant, and Wikimedia Commons relying on the same basis. But it will never be a
   per-image certificate, because none exists. If your appetite is "no publish without per-asset proof", then
   Mapillary is permanently out and §10 is the bill. **Recommendation: accept.**
2. **Are you content to burn Meta's Mapillary logo into the film** — visible for the whole duration of every
   Mapillary shot, on roughly a third of Day 1's motion? Terms §11 requires it of us as a downloader. The
   alternatives are: text wordmark only (small non-compliance risk), or prefer KartaView and lose the walking pace.
   **Recommendation: display the logo; it is small, it is honest, and it is the deal.**
3. **Monetisation (D1/D4 revisit): do you want written confirmation from Mapillary before any paid release?** The
   CC BY-SA grant permits commercial use and cannot be revoked, but Terms §12 enumerates the commercial purposes for
   which the *Services* may be used and a documentary is not obviously on that list. **Recommendation: publish free
   now under this ruling; send the §11 email before the first paid use.** Free, one email, your address.
4. **Day 2 ownership** (already asked by the Content Preparer, repeated only because it now has a rights edge):
   M-117 Calais is green here, but if Day 2's material moves to `day-02-to-brindisi/`, this ruling and its
   attribution strings must travel with it. Say where the canonical copy lives.

---

## Digest

- **Did:** fetched Mapillary's current Terms (eff. 15 Feb 2024), the Help Centre licence article, both licensing
  blog posts, the CC BY-SA 4.0 and 3.0 legal codes and KartaView's actual terms; re-probed the Graph API live with
  the existing free token; and — the find that closes it — read the licence string out of Mapillary's own web
  application, where the per-image "Image details" panel states "All images are shared under a CC BY-SA license"
  linked to **4.0**, with no per-image variable and **no occurrence of "NonCommercial" anywhere in the 5.7 MB
  bundle**. Ruled **green with four conditions**, wrote the burn-ready attribution, and unblocked M-108, M-109,
  M-115, M-116, M-117 and the seven cached stops.
- **Weak:** the Help Centre quote is from a six-week-old Wayback snapshot because Cloudflare 403s every non-browser
  client, and the KartaView quote came from a JS bundle rather than a rendered page — both first-party, neither a
  live rendered read; Mapillary's research-dataset licences are asserted to exist but not read; and the Terms' NC
  sentence, though scoped to data sets, is Meta's to reinterpret at any time.
- **With more time:** send the support@mapillary.com email and paste the reply in here; have a human confirm the two
  quotes in a browser; and get the Mapillary logo asset into the renderer so the on-screen credit is literally, not
  just substantially, compliant with Terms §11.
