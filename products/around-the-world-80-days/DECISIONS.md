# Founder decisions — Around the World in 80 Days

Standing answers to the studio's open questions. Roles read this before asking again.
Anything here is reversible; say so and the studio changes course.

## RULE 1 — NO SPENDING WITHOUT ASKING (founder, 2026-08-19, overrides everything below)

**Never incur a cost on any account of the founder's — cloud APIs, paid services, subscriptions, per-call billing —
without checking first.** This outranks every other instruction, including "finish the task" and any queue item.

- Free-tier allowances are NOT permission: an API that is free for N calls still *bills* at N+1, so it counts as a cost.
- Billable paths must be **opt-in**, never a default and never a fallback. Default configs, tests and CI must call nothing billable.
- If work can only proceed by spending, STOP and ask, giving the amount, the per-unit rate and the cheapest alternative.
- Applies to agents too: every role inherits this via `studio/roles/_common.md`.
- Known billable surface today: Google Maps Platform (Dynamic Street View $14/1,000 after 5,000/mo; Street View Static
  $7/1,000 after 10,000/mo). Free and unlimited: Maps **Embed** API, Street View **metadata**. Everything else the studio
  uses (Wikimedia, Internet Archive, KartaView, Edge TTS, ffmpeg) is free.
- **Breach on record:** on 2026-08-19 the studio tested Dynamic Street View live against the founder's key and shipped a
  config whose default mode was billable, before asking. Almost certainly inside the free allowance, but it was the wrong
  order. Guardrails added the same day: `www/config.json` pinned to a non-billing mode, the smoke test's billed pass made
  opt-in (`--allow-billing`), and the player will refuse billable modes unless the config explicitly acknowledges billing.

## D6 · Street View is a STOP-AND-LOOK device, never transport (founder, 2026-08-19, after playtesting)

Auto-walking Street View was built, played, and rejected. It is dominated by both alternatives: it discards the
**agency** that is Street View's only unique offer (the traveller aims their own gaze), while failing to match video
for **smoothness**, because it is fundamentally photographs taken metres apart.

**The rule:** use `streetview` only where there is something for the traveller to *find* — a task, a reason to look.
Never to move someone from A to B. Transport is video or hyperlapse, always. Expect one or two Street View stops in a
whole chapter, not a spine; each should feel like a change of gear.

**Consequences**
- **Player:** Maps **Embed** API (drag to look). No programmatic camera control is needed, so the billable SKUs are
  never required — the cost problem disappears along with the auto-walk. Ladder is `embed → link`.
- **Player mode `open` (open-imagery walk) is RETIRED.** Its fetcher, cache and `panomove.mjs` live on for the video.
- **/watch:** Street View cannot be recorded anyway. Transport scenes become open-imagery hyperlapse; a stop-and-look
  scene becomes a slow pan over the same view, with the guide naming what the player-traveller would have found
  themselves. That is an adaptation, not a downgrade — a film cannot offer a task.
- **Day 1:** scene 04 (the 1,151 steps) is transport → restructured, street footage plays while the counting moves to
  the map. Scene 15 (the Eleanor Cross) is a genuine stop-and-look → stays Street View in the player.
- The Mapillary licence question now matters for **video use only**, since the player is on Google.

## 2026-08-19

**D1 · Business model — FREE until further notice.**
No paywall, no charge to watch. YouTube embeds are therefore fine in the interactive player (III.F.3.a only forbids
charging for embedded playback). Revisit monetization only when the founder says so; content maturity comes first.
→ Unblocks: publish of the free tier; rights.md decision 1 closed.

**D2 · Creator licensing — ASK PERMISSION, founder sends.**
Embedding needs no permission (player). Putting footage inside our MP4 does — that requires the creator's own
permission AND a file from them (we never download from YouTube). Studio drafts the emails
(`day-01-london/review/creator-outreach.md`); the founder sends them from their own address. Default if a creator
declines or is silent after 14 days: keep the clip card in the video, keep the embed in the player, swap primaries
where a friendlier creator covers the same ground (e.g. Sanpo Stroll M-06 for Savile Row).

**D3 · Google Maps API key — founder to obtain.**
console.cloud.google.com → new project `yunyou` → enable **Maps Embed API** + **Street View Static API** →
Credentials → API key → restrict to those APIs and to `178-104-53-233.sslip.io`. Billing must be on; Maps Embed API
is free and the $200/month credit is never touched at our volume. Paste it on the player's start screen.
→ Until then the Street View scenes fall back to "open this view in Google Maps" buttons (working, just not inline).

**D4 · Licence for our own outputs — CC BY-SA 4.0.**
Applies to studio-written text, cards (G-01…G-08) and the linear cuts. Chosen for goodwill and because share-alike
protects the work; not a considered commercial choice — revisit with D1 when monetization comes up.

**D5 · Clear English is the DEFAULT everywhere.**
The founder is the target audience: armchair traveller, knows only the title, non-native English speaker.
`narration.variants.clear` is now the default track in BOTH the player and the rendered video; the literary track is
the opt-out toggle in the player. One video, not two. (Audience report #1; north star in `studio/PRODUCTION.md`.)
