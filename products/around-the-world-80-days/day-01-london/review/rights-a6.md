# Rights & Licensing — A6 adjudication · Day 1: London

**Reviewer:** rights-licensing   **Date:** 2026-08-19   **Scope:** the three questions raised by
`media/manifest-a6.md` (its "what still has no clean answer" items 5–7 and its decisions 1–2), plus the licence
error it found in `review/rights.md`.
**Overall:** **amber, and nothing here blocks the video cut.** Two of the three questions resolve cleanly; the third
(downloading CC-BY video from YouTube) resolves as "don't, and you don't need to".

**Inputs read:** `studio/roles/_common.md` · `studio/roles/rights-licensing.md` ·
`studio/strategy/media-fallback-ladder.md` · `products/around-the-world-80-days/DECISIONS.md` (D1, D2, D4) ·
`day-01-london/media/manifest-a6.md` · `day-01-london/review/rights.md` · `day-01-london/review/creator-outreach.md`.

**Primary sources fetched today (2026-08-19), not recalled:**

| # | source | what was read |
|---|---|---|
| S-1 | `https://www.youtube.com/t/terms?gl=US&hl=en` — YouTube Terms of Service, "Permissions and Restrictions" | the download prohibition and its two exceptions |
| S-2 | `https://support.google.com/youtube/answer/2797468?hl=en` — YouTube Help, "Creative Commons" | which CC licence YouTube applies, what it grants, what may be marked CC |
| S-3 | `https://creativecommons.org/licenses/by/4.0/legalcode.en` + `…/legalcode.txt` | §1 definitions, §2(a)(1), §2(a)(4), §2(a)(5)(A)(B), §2(b), §3(a) |
| S-4 | `https://creativecommons.org/licenses/by-sa/4.0/legalcode.en` + `…/legalcode.txt` | §1(a) Adapted Material, §1(b) Adapter's Licence, §3(b) ShareAlike |
| S-5 | `https://creativecommons.org/licenses/by-sa/4.0/` — the deed | "You are free to", "Under the following terms", Notices |
| S-6 | `https://creativecommons.org/faq/` (the wiki FAQ 302-redirects here) — "Combining and adapting CC material" | adaptation vs collection; ShareAlike scope |
| S-7 | `https://support.google.com/youtube/answer/11977233` (via search) — "Watch videos offline with YouTube Premium" | what a YouTube-provided download actually is |
| S-8 | `https://wiki.openstreetmap.org/wiki/KartaView` | KartaView imagery licence (see the caveat in §2.5) |

---

# 1 · May we download a CC-BY YouTube video to put a clip inside our MP4?

**Ruling: no — do not download from youtube.com. You do not need to, and the clean routes cost days, not licences.**
Risk rating of downloading anyway: **amber (copyright: none; platform contract: clear breach; consequence: account-level, and our whole free tier depends on that account).**

The mistake to avoid is treating this as one question. It is two instruments, two counterparties, two different
failure modes. A6 saw this correctly and was right to escalate rather than decide.

## 1.1 (a) What the CC BY grant itself permits — the *content* question

The grant runs **from the uploader directly to us**, not through YouTube. CC BY 4.0 §2(a)(5)(A):

> "Every recipient of the Licensed Material automatically receives an offer from the Licensor to exercise the
> Licensed Rights under the terms and conditions of this Public License."

What that offer contains, per §2(a)(1), is the right to *"reproduce and Share the Licensed Material, in whole or in
part"* and to *"produce, reproduce, and Share Adapted Material"* — for any purpose, including commercially. §2(a)(4)
adds that the Licensor authorises us *"to exercise the Licensed Rights in all media and formats whether now known or
hereafter created, and to make technical modifications necessary to do so."*

So, as against **Ian Payne Urban Transport** (`ME-x2yWqoiw`, `BJ3KDkHUCXg`) and **Urban Pigeon**
(`3g41GwCnW80`, `tProPV0SOSs`, `omcY89kce2A`), all of the following are **permitted**:

- copying the video and hosting it on our own server;
- trimming it to 00:00–01:15;
- **cropping M-13 to the left half** — this is exactly the "adaptation" the licence grants and the reason the old
  rights.md row is wrong (see §3);
- re-encoding, colour-grading, muting, speed-ramping;
- putting it inside our episode and, later, selling that episode.

Conditions, per §3(a): keep any creator identification / copyright notice / licence notice supplied, give the title,
a link to the source, a link to the licence, and **"indicate if You modified the Licensed Material."** §3(a)(2) lets
us satisfy this *"in any reasonable manner based on the medium, means, and context"* — which is why a burned-in
short form plus a full credits tail is compliant for a video (§2.6 gives the exact strings).

Two things the CC grant does **not** do, and we must not pretend otherwise:

- **It does not license anything the uploader did not own.** If a "CC BY" walking video contains a licensed music
  bed, the CC mark is void as to that bed. YouTube's own help page (S-2) is explicit that only *"Your originally
  created content," "Content released under a CC BY license," and "Content in the public domain"* may be marked CC —
  which is a rule uploaders break routinely. **Standing rule from this pass: any CC-marked YouTube video baked into
  our MP4 ships muted, with our own bed underneath, unless QA has verified the audio's provenance.** That single rule
  deletes the entire class of risk for M-62/M-63/M-64/M-65/M-68/M-73 at zero cost. M-13/M-75 (train cab, no music,
  no voice) and Urban Pigeon (ambient) may keep their audio once QA has actually listened.
- **It does not license personality, privacy or publicity rights.** §2(b) and the deed's Notices are explicit:
  *"you may not have all of the permissions necessary for your intended use. For example, other rights such as
  publicity, privacy, or moral rights may limit how you use the material."* See §3.5.

**Licence version.** YouTube Help (S-2) today links **CC BY 4.0** and says *"If you add a Creative Commons Attribution
license to your video, it means other creators can reuse your work subject to the terms of the CC BY license."*
YouTube's CC option was historically CC BY 3.0; the outcome is identical either way, because 3.0 also grants
derivatives and commercial use. We attribute as "CC BY 4.0" per YouTube's current statement, and we record evidence
rather than relying on it staying true (§1.5).

## 1.2 (b) What YouTube's ToS says about the *means* of getting the file

YouTube ToS, "Permissions and Restrictions" (S-1) — the operative clause:

> You are not allowed to "access, reproduce, download, distribute, transmit, broadcast, display, sell, license, alter,
> modify or otherwise use any part of the Service or any Content except: (a) as expressly authorized by the Service;
> or (b) with prior written permission from YouTube and, if applicable, the respective rights holders."

Note the structure of exception (b): **"from YouTube *and*, if applicable, the respective rights holders."**
Conjunctive. A CC BY licence is precisely and only the *rights holder's* permission. It satisfies half of limb (b)
and none of limb (a). YouTube's permission is the half we do not have.

The same section confirms the rest of the ToS grants are *"only as enabled by a feature of the Service"* and do not
let a user *"make use of … Content independent of the Service."*

**Does the CC licence override the platform contract? No — and the question is malformed.** They are not in the same
hierarchy:

- The **CC licence** is a copyright licence between the *uploader* and *us*. It answers: may we copy and adapt this
  footage without infringing the uploader's copyright? Answer: yes.
- **YouTube's ToS** is a **contract between Google and us**, about our use of *the Service*. It answers: may we pull
  bytes off youtube.com by means the Service does not offer? Answer: no.

Downloading a CC-BY video with `yt-dlp` therefore produces a copy that is **lawful as against the creator** and
**obtained in breach of our contract with Google**. Google's remedies are contractual and access-level: termination
of the account, termination of API access, blocking — plus, in some jurisdictions, arguments under computer-misuse
statutes if any circumvention is involved.

Two CC clauses look like they might help and do not:

- §2(a)(5)(B) *"You may not offer or impose any additional or different terms or conditions on … the Licensed
  Material if doing so restricts exercise of the Licensed Rights by any recipient"* — this binds **the Licensor**.
  Google is not the Licensor and is not a party to the CC licence.
- §2(a)(4)'s waiver of the right to forbid *"technical modifications necessary to … circumvent Effective
  Technological Measures"* — again, that is the **Licensor** waiving, and it runs only against the Licensor.

So the creator cannot object to how we got the file. Google can. Nothing in Creative Commons touches that.

## 1.3 Why the consequence matters more than the probability

The probability that Google notices a handful of `yt-dlp` pulls is very low. That is not the argument. The argument
is **blast radius**: under D1 the entire free tier is built on YouTube embeds (M-01, M-05, M-08 and every backup) and
under D3 the Street View scenes hang off a Google Cloud project we are about to create on the founder's account. An
account-level action against that Google identity does not cost us a clip — it costs us scenes 02, 04, 05, 06, 13,
15 and 18 simultaneously, in the player, for every chapter, forever. We would be trading a two-day wait for a
single-point-of-failure on the product's spine. That is a bad trade at any enforcement probability.

## 1.4 (c) The clean routes, ranked

| # | route | legal position | lead time | verdict |
|---|---|---|---|---|
| **R1** | **Ask the creator to send the file** | Zero conflict: the copy never came from the Service, and the reuse right already exists. This is a **delivery request, not a negotiation** | 1–14 days, and a "no" costs us nothing we had | **recommended — green** |
| **R2** | **A mirror the creator publishes elsewhere** — Vimeo (with download enabled by the uploader), Internet Archive, Patreon, Odysee, their own site, a Drive link in the description | Green if the host permits the download (creator's own site, IA, or Vimeo-with-download-on). **Check the host's terms too** — Vimeo has its own anti-download clause when the uploader has not enabled it | hours | **do this first, it is free** |
| **R3** | **The same footage from a downloadable source** — some walkers also sell/post on stock platforms | Green | hours | worth one search per creator |
| **R4** | **Substitute at rung 2/3** — KartaView + PD/CC stills | Green, no third party involved at all | now | **the reason none of this blocks us** (§3.6) |
| **R5** | **YouTube-provided download** | The only YouTube-provided download is Premium offline (S-7): it plays *"offline for up to 29 days"*, renews only by going online *"at least once every 30 days"*, and lives inside the YouTube app. It is a DRM-bound cache, not a file. It cannot enter a render pipeline | — | **dead end — strike it from A6's option list** |
| **R6** | **Download anyway and accept the ToS breach** | Copyright-clean, contract-breaching. Blast radius as §1.3 | now | **not recommended; founder's call, decision 1** |

A6 listed R5 as option (a) and it is worth killing explicitly: there is **no YouTube feature that yields a usable
file to a third party**. The old YouTube Video Editor's CC-remix function, which was the in-product answer to this
exact question, was retired years ago. YouTube Studio's download button only serves your *own* uploads.

## 1.5 If we go the R1/R2 route — evidence hygiene (mandatory, cheap)

The CC grant is irrevocable for copies we hold ("The licensor cannot revoke these freedoms as long as you follow the
license terms" — S-5), but only if we can show the licence existed when we took the copy. Creators flip the licence
switch and delete videos routinely (M-62 has 28 views). So, per asset, **before** it enters the pipeline:

1. `videos.list?part=status&id=<id>` from the YouTube Data API and store the JSON — the field reads
   `"license": "creativeCommon"`. This is machine-readable, timestamped evidence and is the strongest single artefact.
2. A full-page screenshot of the watch page showing the licence row, plus a `web.archive.org/save` snapshot URL.
3. The creator's email (R1) or the mirror URL (R2), stored beside the media record.
4. Fields on the media record: `licence`, `licence_evidence`, `acquired_from`, `acquired_on`, `attribution_string`,
   `audio_verified` (bool), `sa` (bool).

## 1.6 Template — the "please send me the file you already CC-licensed" message

Deliberately **not** the D2 permission email. It asks for nothing that isn't already granted, so it must not sound
like a request for permission — that only invites a "no" to a question we didn't need to ask. Short, specific,
flattering by accuracy, and it tells them why we're asking instead of just downloading.

> **Subject:** You've CC-licensed "[TITLE]" — could I get the file from you directly?
>
> Hello [NAME] —
>
> I'm Zhiwei. I make **Yunyou**, a free guided armchair-travel series; the first episode retraces Phileas Fogg's 1872
> departure from London in *Around the World in Eighty Days*, from Savile Row to the boat train at Charing Cross.
>
> Your **"[TITLE]"** ([URL]) is published under the **Creative Commons Attribution licence**, so I already have your
> permission to use and re-cut it — thank you for that, it's genuinely rare and it's why your video is in the episode
> at all. I'm not writing to ask for rights.
>
> I'm writing because I'd rather not rip it off YouTube: YouTube's own terms don't allow downloading, and I'd like
> the clip to come from you, at your quality rather than YouTube's compression. **Could you send me
> [MM:SS–MM:SS, about NN seconds] — or the whole file if that's easier?** A Drive/WeTransfer link, an existing Vimeo
> or Internet Archive copy, or anywhere else you already host it all work equally well.
>
> How you'll be credited, either way: **"[EXACT ATTRIBUTION STRING]"** on screen while the clip plays and again in
> the credits, with a link to your channel and to the CC BY licence, and a note that I trimmed [and cropped] it.
> The episode is free, no paywall, no ads.
>
> If it's a hassle, no problem at all — just say so and I'll leave it. And if you'd rather I didn't use it despite the
> licence, tell me and I won't; I'd rather have you pleased than be technically entitled.
>
> Thanks either way — the [Hungerford Bridge crossing / Villiers Street arrival] is a lovely piece of footage.
>
> — Zhiwei, Yunyou

**Who to send to, in priority order** (founder sends, per D2):

| creator | ids | segment wanted | why first |
|---|---|---|---|
| **Ian Payne Urban Transport** | M-13 `ME-x2yWqoiw` (+ backup M-75 `BJ3KDkHUCXg`) | 00:00–01:15, and the 360°/wide master if one exists | Scene 18's exact shot; the same file also serves Day 2's Dover arrival and the whole SE corridor. Highest value per email in the product |
| **Urban Pigeon** | M-71 `3g41GwCnW80` (12:30–13:39) and/or M-70 `tProPV0SOSs` (00:00–00:52) | the forecourt arrival | Scene 13 has **no rung-2 fallback** (0 KartaView photos on the Strand frontage) — this is the only clip that fixes it |
| **Offbeat Destination** | M-62 `hZsfxBonTHg` | the Savile Row minute | Two birds: the file *and* the timecode we can't otherwise pin. Ask "which minute is Savile Row?" in the same mail |

Note for the founder: this does **not** contradict the Media Fallback Ladder's "no permission emails" principle.
The ladder forbids *blocking a chapter on a negotiation*. These mails block nothing — §3.6 ships the video cut
without any of them. They are an upgrade path.

---

# 2 · Do we accept CC BY-SA 4.0 material (KartaView) in our video?

**Ruling: yes. Green, and D4 makes the share-alike question moot — say so plainly.** The only real work is tagging,
so that a future licence change is a strip-list rather than an archaeology project.

## 2.1 Is our KartaView hyperlapse "Adapted Material"? — yes, unambiguously

CC BY-SA 4.0 §1(a):

> "Adapted Material means material subject to Copyright and Similar Rights that is derived from or based upon the
> Licensed Material and in which the Licensed Material is translated, altered, arranged, transformed, or otherwise
> modified in a manner requiring permission under the Copyright and Similar Rights held by the Licensor."

What the Engine will do to M-66/M-67 — crop the dashboard out, stabilise, optical-flow interpolate 11–13 frames into
5–8 seconds of motion, re-time, grade — is "altered, arranged, transformed" several times over. There is no arguing
this is a mere reproduction. **The hyperlapse is Adapted Material and §3(b) ShareAlike attaches to it.**

§3(b)(1) then requires that the Adapter's Licence be *"a Creative Commons license with the same License Elements,
this version or later, or a BY-SA Compatible License"* — i.e. CC BY-SA 4.0 for the clip.

## 2.2 Does it reach the whole episode? — the adaptation / collection line

The obligation is defined on *"Your contributions to Adapted Material"* (§1(b), Adapter's Licence). The Adapted
Material here is the hyperlapse clip. The rest of the episode — our narration, the Verne text (PD), the score, G-01…
G-08, the PD plates, the other clips — is **not** "derived from or based upon" KartaView imagery in any sense the
definition reaches. Assembling separable works into a larger sequenced whole is the classic **collection /
compilation** case, and CC's own guidance on combining and adapting material (S-6) treats a collection as leaving the
component works under their own licences without pulling the other, independent components into ShareAlike.

**Our use is: an adaptation of the KartaView frames, included as one clip in a collection.** ShareAlike reaches the
clip. It does not, on CC's own framing, reach the narration or the maps.

**The honest caveat, which I will not paper over.** The collection analysis is cleanest for *unmodified* inclusion.
Here we include *our own adaptation* inside a film, and a maximalist reading — the episode as one integrated
audiovisual work into which the imagery is woven — would call the whole film a derivative. That reading is a
minority one and I do not think it is right, but it is not frivolous, and it is precisely why documentary
film-makers avoid SA footage. **This is exactly the ambiguity D4 makes irrelevant to us**, which is the next point
and the reason I am comfortable ruling green.

## 2.3 D4 makes it moot — yes, genuinely moot, and here is the proof

D4 already puts the studio's text, cards and **linear cuts** under CC BY-SA 4.0. So:

- under the narrow reading (SA reaches the clip): the clip is BY-SA 4.0 ✓ and the episode is BY-SA 4.0 anyway;
- under the maximalist reading (SA reaches the whole film): the film is BY-SA 4.0 ✓ by D4.

**There is no state of the world in which KartaView's share-alike costs us anything while D4 stands.** The question
A6 escalated as decision 2 — "share-alike appetite" — is already answered by a decision the founder made on the same
day. It does not need re-deciding. Scene 05 keeps its only moving-picture option.

## 2.4 Three consequences that *do* need writing down

1. **BY-SA is now a dependency of D4, not a free choice.** If D1/D4 is ever revisited toward a proprietary or
   all-rights-reserved cut, every BY-SA-derived asset must be stripped and re-sourced. **Rule: every media record
   derived from BY-SA material carries `sa: true`.** On Day 1 that is M-66, M-67, M-69a–d, M-76, M-77a, M-77b and
   the already-shipped M-20, M-21, M-33. That is the strip-list, generated, not remembered.
2. **NC is a hard stop, and D4 is why.** Mapillary's terms (quoted in A6) warn that some sequences are
   CC BY-**NC**-SA. We cannot put NC material into a BY-SA 4.0 episode **even though D1 says we are free today** —
   because BY-SA 4.0 promises every downstream recipient the right to use our episode *"for any purpose, even
   commercially"* (S-5), and an NC component makes that promise impossible to keep. Per-sequence licence check before
   any Mapillary frame is used; NC = reject, no exceptions, not "fine while we're free".
3. **ND is a hard stop for the same structural reason** and does not appear on Day 1. Keep the existing policy line.

## 2.5 KartaView's licence — verified as far as it can be, with a caveat I am not hiding

A6 asked Rights to quote KartaView's own wording. **I could not.** `https://kartaview.org/terms` is a client-rendered
app and returns only a loading shell to a fetcher — same result A6 got. The best citable statement remains the OSM
wiki (S-8), retrieved today, which states in its License section:

> "The images on KartaView can be used under the Creative Commons Attribution-ShareAlike 4.0 International License
> (CC-BY-SA-4.0)."

…citing KartaView's own terms at `kartaview.org/terms#terms3`. **Verdict: amber-verified — good enough to build and
render with, not good enough to leave unchecked before publish.** Action: one human with a browser opens
`kartaview.org/terms`, reads section 3, and pastes the exact wording into this file. Two minutes. Until then the
attribution string below is written to be correct under CC BY-SA 4.0, which is the licence every secondary source
agrees on, and which is also the safest assumption (it imposes the most obligation on us, so if the real terms are
looser we have over-complied rather than under-complied).

## 2.6 Attribution wording we would actually burn on screen

§3(a) requires creator, title, source, licence link and an indication of modification; §3(a)(2) allows this
*"in any reasonable manner based on the medium, means, and context"* and permits satisfying it by hyperlink where the
medium supports one. A burned-in video frame supports no hyperlink, so the reasonable-manner combination is
**short form on screen + full form in the credits tail**, and both must ship.

**On screen, lower-left, for the full duration of the clip**, 22 px Source Sans 3, white on a 55 % black scrim
(readable at 1080p and at phone size; must clear the safe area):

- M-66, scene 02 (Savile Row hyperlapse):
  `KartaView / telenavdrives (2018) · CC BY-SA 4.0 · adapted`
- M-67, scene 05 (Pall Mall hyperlapse):
  `KartaView / telenavdrives (2016) · CC BY-SA 4.0 · adapted`
- M-76, scene 18 (Hungerford Bridge still, if used with a push):
  `Wikimedia Commons · CC BY-SA 4.0 · cropped`
- M-69a–d / M-20 / M-21 / M-33 (geograph stills under a Ken Burns move):
  `[Photographer] / geograph.org.uk · CC BY-SA 2.0 · adapted`
  — e.g. `Philip Cornwall / geograph.org.uk · CC BY-SA 2.0 · adapted`

**Credits tail, verbatim lines:**

> Street-level imagery: KartaView contributor **telenavdrives**, sequence 1123901 (Savile Row, 17 Jan 2018) and
> sequence 1124 (Pall Mall, 25 Mar 2016) — kartaview.org — licensed **CC BY-SA 4.0**
> (creativecommons.org/licenses/by-sa/4.0/). Adapted by Yunyou: cropped, stabilised, frame-interpolated and re-timed.

> This episode, and the adapted clips within it, are released under **Creative Commons Attribution-ShareAlike 4.0
> International** — creativecommons.org/licenses/by-sa/4.0/

That second line is not decoration: §3(b)(2) requires us to *"include the text of, or the URI or hyperlink to,"* the
Adapter's Licence. It is what turns D4 from a policy into compliance. **It must appear on every rendered cut that
contains any BY-SA-derived asset**, and it belongs on the exportable G-08 souvenir card too (that card circulates
detached from the credits).

**For the CC BY YouTube clips**, when they arrive by R1/R2:

- On screen: `Urban Pigeon (2025) · CC BY 4.0 · trimmed` / `Ian Payne Urban Transport (2026) · CC BY 4.0 · trimmed, cropped`
- Credits: `"Charing Cross to Westminster: Tourists, Power and Horses (Station to Station)" — Urban Pigeon, 2025, youtube.com/watch?v=tProPV0SOSs — CC BY 4.0, trimmed.`
  `"Southeastern – London Charing Cross to Dover Priory" — Ian Payne Urban Transport, 2026, youtube.com/watch?v=ME-x2yWqoiw — CC BY 4.0, trimmed and cropped to the left of frame.`

If Mapillary is ever used, add its **contractual** extra on top of CC: a visible Mapillary logo and a link back
whenever we serve frames from our own servers (quoted in A6 from mapillary.com/terms). That is a term of the
Mapillary contract, not of CC, so "we attributed under CC" does not discharge it.

---

# 3 · Corrections to `review/rights.md`

A6 found one error. Checking its licence work against the existing review turned up **three more rows/rules that are
wrong or now superseded**, plus two that are right but were being read too broadly.

## 3.1 M-13 — the correction (this row is now replaced in `rights.md`)

**Was** (2026-08-18):

> | M-13 `ME-x2yWqoiw` Ian Payne Urban Transport | 18 | YouTube embed, enabled (oEmbed 200). No music/voice, no restrictive statement. | low | green | Embed only; credit channel; **do not crop the *player* to the left half** … or ask the creator for the 360° master under licence (outreach #3). |

**Now:**

> | M-13 `ME-x2yWqoiw` Ian Payne Urban Transport | 18 | **CC BY (4.0 per YouTube Help)** — licence row read on the watch page 2026-08-19 by the Content Preparer. Two layers: the **CC grant** permits self-hosting, trimming, cropping and commercial use with attribution; the **acquisition of the file** must not be a download from youtube.com (ToS "Permissions and Restrictions"). | copyright: none · acquisition: amber · content: low (train cab, no music, no voice) | **green (player embed) · green-on-arrival (MP4, once the file comes via R1/R2)** | Player: embed as before, no overlays on the iframe, no player cropping — *that RMF rule binds the embedded player only*. MP4: self-host the file the creator sends, trim 00:00–01:15, **the left-half crop is permitted**, attribute `Ian Payne Urban Transport (2026) · CC BY 4.0 · trimmed, cropped`. Capture licence evidence per §1.5 first. Same for backup **M-75** `BJ3KDkHUCXg`. |

**Why the old row was wrong.** It conflated two separate rules. The RMF "no overlays / no modifying the player"
prohibition is about the **embedded YouTube iframe** — you may not put chrome over it, resize it below 200×200, or
crop the player element. It says nothing about a **file we lawfully hold under a CC licence and serve ourselves**;
at that point there is no YouTube player in the frame at all. A6's reasoning on this is correct and I adopt it.
The old row also proposed asking Ian Payne for a licence — we don't need one; we need a *file* (§1.6).

## 3.2 Other rows and rules A6's licence checks contradict

| where in `rights.md` | what it says | ruling |
|---|---|---|
| **Blocking items #2** — "no player cropping for M-13" | Correct as to the iframe, wrong if read as a ban on cropping the *content* | **Split it.** Rewrite as: "no overlays on, and no cropping of, the **embedded player**, in scenes 02, 05, 06, 13, 18; this does not restrict a self-hosted CC-licensed copy." Done in `rights.md`. |
| **Standing rule** — "BY-SA images ship only unmodified and stay out of generated composites" (Platform-terms section + M-20/M-21/M-33 rows) | Was the right call on 2026-08-18, when the studio's own output licence was an *open question* (old decision 3) — an adaptation would have forced a licence we hadn't chosen | **Superseded by D4.** We have chosen BY-SA 4.0. Adapting BY-SA material now costs nothing. **New rule: BY-SA material may be cropped, tinted, Ken-Burnsed and composited, provided the output ships under CC BY-SA 4.0 with attribution and the SA notice.** Note CC BY-SA 2.0 §4(b) permits licensing a derivative under "a later version of this License with the same License Elements", so a BY-SA **2.0** still (M-20, M-21, M-33, M-69, M-77a/b) may be adapted and released under BY-SA **4.0** — one licence for the whole episode. **This unblocks A6's Engine item 3**: the renderer does not need a `motion_allowed` flag or a letterbox-only pan-and-scan mode. |
| **G-02 row** — "Never fill the template with M-20 (BY-SA)" | Same reason; same supersession | **Relaxed**, with one carry-over: G-02 is exported as a souvenir image and circulates detached, so if it contains BY-SA material the exported PNG must carry the SA notice line in its footer, not just the credits screen. |
| **M-01 / M-05 / M-08 rows** (Wanderizm, Watched Walker, Virtual Walks) | Standard YouTube Licence, embed-only | **Unchanged and confirmed.** A6's control check is good evidence: these three watch pages show **no licence row**, which is how a Standard-licence video presents. Embed-only, outreach as per D2. |
| **Creator-outreach #4 (Ian Payne)** | Framed as a permission ask with a suggested £150–300/used-minute fee | **Reframe, don't send as written.** He has already licensed it to the world; offering money for rights he has given away reads as either ignorance or an attempt to buy exclusivity we aren't asking for. Replace with the §1.6 file-request template. Outreach #1/#2/#3 (Watched Walker, Wanderizm, Virtual Walks) stay as genuine permission asks. |
| **Attribution manifest** | Lists the four YouTube channels as embeds only | **Add** CC BY lines for Ian Payne and Urban Pigeon once their files land, plus the KartaView and SA-notice lines from §2.6. |

## 3.3 New A6 ids — verdicts

| id | basis | risk | verdict | action |
|---|---|---|---|---|
| **M-62** `hZsfxBonTHg` Offbeat Destination | CC BY (licence row read) | licence low · **content unverified** · 28 views ⇒ deletion risk · burned-in channel logo · **audio unchecked** | **amber** | Not usable until: file via R1/R2 + QA pins the Savile Row minute + audio muted or verified. Licence evidence per §1.5 **today**, before it disappears. |
| **M-63** `GLH_sL4iNzA`, **M-64** `bg7FqWkJG0Y`, **M-65** `cC1xSQlVp1U` | CC BY (licence row read) | content unverified | **amber** | Same gate. Spares only. |
| **M-66** KartaView seq 1123901 idx 1767–1779 | CC BY-SA 4.0 (S-8; kartaview.org/terms unread — §2.5) | low; faces/plates auto-blurred | **green** | Build. Attribute per §2.6. `sa: true`. |
| **M-67** KartaView seq 1124 idx 828–838 | as M-66 | low | **green** | Build. `sa: true`. |
| **M-68** `4Fx_LD4HOYI` LONDON WALKS 4K | CC BY (licence row read) | route probably misses the clubs; audio unchecked (ASMR channel — likely no music bed, but unverified) | **amber** | Verify route before any effort. |
| **M-69a–d** geograph via Commons | CC BY-SA 2.0 | low | **green** | Ken Burns now permitted (§3.2). `sa: true`. |
| **M-70** `tProPV0SOSs`, **M-71** `3g41GwCnW80`, **M-72** `omcY89kce2A` Urban Pigeon | CC BY (licence rows read) | licence low · acquisition amber · identifiable passers-by (§3.5) | **green-on-arrival** | Licence evidence today; file via R1/R2; then green for the MP4. Embed is green now regardless. |
| **M-73** `ZXiaTHtVqlo` Urban Pigeon | **CC BY asserted from the CC-filtered search page only; watch page not opened** | unknown licence | **red until verified** | The CC search filter is not evidence — A6 says so itself. Open the watch page, read the licence row, then re-rate. Do not put it in a cut. |
| **M-74** Commons, Eleanor Cross from the station yard, c.1903 | Public domain | none | **green** | Use freely. Better viewpoint match than M-24 for G-02. |
| **M-75** `BJ3KDkHUCXg` Ian Payne | CC BY | as M-13 | **green-on-arrival** | As M-13. |
| **M-76** Commons, View from Hungerford Bridge (2025) | CC BY-SA 4.0 | low | **green** | Adaptable under D4. `sa: true`. See §3.6 — this is scene 18's card-killer today. |
| **M-77a/b** geograph Savile Row | CC BY-SA 2.0 | low | **green** | Adaptable. `sa: true`. |
| **M-77c** `No 3, Savile Row door and sign.jpg` | **CC0** | none | **green** | The only Savile Row still with no obligation at all — prefer it wherever a free hand is wanted. |

## 3.4 Internet Archive — adopt A6's warning as a studio rule

A6's finding that archive.org results are *"dominated by mis-dated modern BBC News off-air uploads carrying an
uploader-applied PD mark"* is important and generalises. **Rule: `licenseurl` on an Internet Archive item is
uploader-asserted metadata and is not evidence of public-domain status.** IA is rung 1 only for items with an
independent provenance chain (a named pre-1930 production, a known archive's collection, a government release).
Add to `studio/strategy/media-fallback-ladder.md` when it is next edited.

## 3.5 Identifiable people — the answer A6 asked Rights for

All the rung-1 clips are busy pavements. Three things are true at once:

1. **CC does not help.** §2(b) and the deed's Notices are explicit that publicity, privacy and personality rights are
   *not* licensed and *"may limit how you use the material."* The creator could not grant them and did not.
2. **The exposure moves to us when we self-host.** Embedding leaves YouTube and the uploader as the publishers of
   that footage. Baking it into our MP4 makes **Yunyou** the publisher. Same footage, different defendant.
3. **The actual risk is low, in the UK/EU, for this content.** Filming in a public street is lawful; passers-by are
   incidentally captured, not the subject; the use is editorial/documentary; nothing identifies anyone by name; no
   biometric processing; the UK GDPR special-purposes regime (DPA 2018 Sch 2 Pt 5) covers journalistic/artistic
   publication of this kind.

**Ruling: amber, manageable, with four cheap conditions** — (i) no single identifiable face held in shot for more
than ~2 seconds; (ii) no zoom, punch-in or freeze on an individual; (iii) no caption, narration or chapter title that
identifies or characterises anyone visible; (iv) a takedown route on the credits page and a 7-day response
commitment. And a point in rung 2's favour that should influence the shot list: **KartaView and Mapillary frames are
auto-blurred at source** (faces and plates), so the hyperlapse route carries essentially none of this risk.

## 3.6 The five walking shots — what can and cannot be in the video, plainly

Under this ruling, **the video cut can go card-free today, without downloading anything from YouTube.**

| scene | shot | in the rendered MP4 **today**? | on what | upgrade later |
|---|---|---|---|---|
| **02 · Savile Row / Burlington Gardens** | | **YES** | **M-66** KartaView hyperlapse (rung 2, CC BY-SA 4.0, green now) + **M-77b** (1955) / **M-32** (c.1890) then-now + **M-77a** hold. No permission, no download, no wait | M-62 replaces the hyperlapse if the file arrives *and* QA pins the minute *and* the audio is cleared |
| **05 · Pall Mall past the Athenaeum / Travellers / Reform** | | **YES, with A6's redesign** | **M-67** 8 s hyperlapse (green now) → Ken Burns triptych over **M-69a/b/c** (now permitted, §3.2) → hold into scene 06. ~40 s instead of 76 s | none needed; a rung-1 clip would only shorten the stills |
| **06 · the Reform Club door / façade** | | **YES** | **M-20 / M-22 / M-23 / M-69c**, and the slow push is **now allowed on the BY-SA stills** — this beat was never a walk | none needed |
| **13 · Trafalgar → Strand → forecourt + Eleanor Cross** | | **PARTLY — this is the one real gap** | Licence on M-70/M-71 is green; only the *file* is missing, and there is **no rung-2 fallback** (0 KartaView photos at the station frontage). Today: **M-74** (PD, 1903, from the station yard) + **M-26/M-24** in G-02 then/now + **M-28** carry the beat as stills — no clip card needed, but no motion either | **Urban Pigeon's file (R1) is the single highest-value email in the product.** M-71 is direction-correct (arrives into the forecourt); M-70 is the reverse walk |
| **18 · departure over Hungerford Bridge** | | **YES** | **M-76** — Commons, CC BY-SA 4.0, *literally the shot scene 18 describes*, as a still with a slow push (adaptation now permitted). Plus **M-27** (1905 postcard, PD) and the steam-whistle bed | **M-13's file (R1)**, then the moving version with the left-half crop the old row wrongly forbade |

**Cannot be in the video under any circumstance as things stand:** any frame downloaded from youtube.com; any Street
View recording (unchanged, `rights.md` and the ladder); **M-73** until its licence is actually read; any NC-licensed
Mapillary sequence; any CC-marked YouTube clip whose audio has not been cleared (mute and re-bed instead).

**Net effect on A6's headline.** A6 wrote that "if Rights says no to downloading CC-BY YouTube video… only 05's
redesign pattern saves the cut". That is too pessimistic: rung 2/3 also saves 02, 06 and 18, and 13 survives as
stills. The correct framing is the ladder's own — **the chapter is never blocked; the CC-BY files are an upgrade from
"good stills and a hyperlapse" to "real motion", and they are worth three emails, not a ToS breach.**

---

## Blocking items

- **Red:** **M-73** `ZXiaTHtVqlo` — licence asserted from a search page, never verified. Blocks only itself.
- **Amber, before publish, cheap:** read `kartaview.org/terms` §3 in a browser and paste the exact wording into
  §2.5 of this file (two minutes, one human).
- **Amber, before any CC-YouTube clip is baked in:** licence evidence captured (§1.5); file obtained via R1/R2;
  audio cleared or muted.
- **Carried forward, unchanged:** the Google Maps key (D3), no Street View recording, no overlays on embedded
  players, M-36 never ships.
- **Not blocking:** everything else. Scenes 02, 05, 06 and 18 can render card-free now.

## Decisions I need from the human

Only two of A6's four decisions were actually rights questions, and one of those is already answered.

1. **Do we ever download from YouTube?** My ruling is no, and §3.6 shows we don't need to. But it is your risk
   appetite, not my legal reading, that decides whether "very unlikely enforcement" beats "the free tier's Google
   account is the single point of failure". **Recommendation: no, permanently, as a studio rule — it is a cheap
   promise to keep and it is a good sentence to have in the creator emails** ("I'd rather not rip it off YouTube"
   only lands if it is true). If you disagree, say so and I will write the mitigation section instead.
2. **Three file-request emails — will you send them?** D2 has you sending outreach personally. These are shorter and
   lower-stakes (no rights are being asked for), and none of them blocks the render. Priority order in §1.6:
   Ian Payne, Urban Pigeon, Offbeat Destination. If you'd rather send only one, send **Urban Pigeon** — scene 13 is
   the only shot with no fallback.

**Already answered, not re-asking:** A6's decision 2 ("share-alike appetite") is closed by **D4** — see §2.3; using
KartaView costs us nothing. A6's decisions 3 (Mapillary token) and 4 (scene 05's shape) are not rights questions and
stay with A6; the only rights input is that a Mapillary sequence marked **BY-NC-SA is unusable** and must be filtered
out per sequence, not per provider (§2.4).

**One thing you should know without being asked to decide it:** D4's CC BY-SA 4.0 is doing more work than it looks.
It is now what makes KartaView safe, what makes Ken Burns on the geograph stills safe, and what makes NC material
impossible. If monetization ever revisits D4, the strip-list is the `sa: true` flag from §2.4 — which is why that
flag needs to exist before the renderer is built, not after.

## Digest

- **Did:** ruled on all three A6 escalations from primary sources fetched today — downloading CC-BY video from
  YouTube is copyright-clean but a plain breach of the ToS's "Permissions and Restrictions" clause whose exception
  (b) requires YouTube's permission *and* the rights holder's, so the answer is "get the file from the creator, who
  has already granted the right" (template in §1.6, and the Premium-offline route killed as a DRM cache); found that
  **D4 already moots the share-alike question** so KartaView is green with the burn-in strings in §2.6; corrected the
  M-13 row and three further rules in `rights.md`, including the now-obsolete "BY-SA only unmodified" ban that D4
  superseded — which also deletes an Engine backlog item; and showed that four of the five walking shots can be
  card-free **today** with no download and no email.
- **Weak:** KartaView's own terms page still could not be read (JS shell) so the CC BY-SA 4.0 quote is second-hand
  from the OSM wiki; the adaptation-vs-collection line is settled enough for us only *because* D4 makes both readings
  identical, and I have said so rather than claiming more certainty than exists; the CC FAQ pages returned paraphrase
  rather than verbatim text, so §2.2's citation of them is weaker than the legal-code quotes around it; and this is a
  rights reading, not legal advice from a qualified solicitor in England & Wales.
- **With more time:** open `kartaview.org/terms` in a real browser and quote §3; run the §1.5 evidence capture on all
  nine CC-marked ids *today*, before any of them is deleted or flipped; check the three creators' About tabs and
  descriptions for existing Vimeo/Internet Archive mirrors, which would make route R2 land in an hour instead of
  R1 in a fortnight; listen to M-62/M-68 for music beds; and draft the one-page inbound-file receipt (what the
  creator sends, what we promise) so an arriving master doesn't sit un-ingested for want of a form.
