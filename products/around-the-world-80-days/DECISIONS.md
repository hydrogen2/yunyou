# Founder decisions — Around the World in 80 Days

Standing answers to the studio's open questions. Roles read this before asking again.
Anything here is reversible; say so and the studio changes course.

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
