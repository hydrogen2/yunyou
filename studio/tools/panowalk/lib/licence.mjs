/**
 * Licence gate — PER FRAME, not per platform.
 *
 * Our own outputs are CC BY-SA 4.0 (DECISIONS.md D4). A NonCommercial or NoDerivatives frame cannot be mixed into
 * them: it would contaminate the whole chapter. So this module classifies every frame and the fetcher refuses to
 * download anything that is not clearly permissive.
 *
 *   permissive  CC0 / PD / CC BY / CC BY-SA           → download, record licence + author
 *   restricted  anything carrying NC or ND            → HARD STOP: the whole sequence is dropped
 *   unknown     no licence in the API response        → dropped by default (see acceptUnknown below)
 *
 * KartaView publishes one licence for all imagery (CC BY-SA 4.0, verified in review/rights-a6.md as "green"), and its
 * API has no per-image licence field, so its frames are tagged `platform-default` — that counts as permissive but the
 * provenance is recorded honestly in frames.json.
 *
 * Mapillary's terms say user content is CC BY-SA *by default* but that some content is served under CC BY-NC-SA. Its
 * Graph API documents no licence field. If a licence field turns up we read it; if it does not, the frame is
 * `unknown` and is NOT downloaded unless a human passes --accept-unknown-licence (Rights decision, not an engineer's).
 */
const NC_ND = /\b(nc|non[-\s]?commercial|nd|no[-\s]?deriv\w*)\b/i;
const OK = /\b(cc0|public\s?domain|pdm|cc[-\s]?by(?:[-\s]?sa)?(?:[-\s]?\d(?:\.\d)?)?)\b/i;

export function classify(raw) {
  const s = String(raw == null ? '' : raw).trim();
  if (!s) return { class: 'unknown', licence: null, why: 'no licence field in the API response' };
  if (NC_ND.test(s)) return { class: 'restricted', licence: s, why: 'NonCommercial / NoDerivatives — incompatible with our CC BY-SA 4.0 output (D4)' };
  if (OK.test(s)) return { class: 'permissive', licence: s, why: 'permissive CC' };
  return { class: 'unknown', licence: s, why: 'licence string not recognised as permissive CC' };
}

/** first non-empty of the fields a provider might plausibly use */
export function readLicence(obj, keys = ['license', 'licence', 'license_type', 'licence_type', 'image_license', 'copyright_license']) {
  for (const k of keys) { const v = obj && obj[k]; if (v != null && String(v).trim() !== '') return String(v); }
  return null;
}

/** Gate a whole candidate sequence. One restricted frame poisons the sequence. */
export function gateSequence(frames, { acceptUnknown = false } = {}) {
  const bad = frames.find(f => f.licence_class === 'restricted');
  if (bad) return { ok: false, reason: `frame ${bad.id} is ${bad.licence} — ${bad.licence_why}` };
  const unknown = frames.filter(f => f.licence_class === 'unknown');
  if (unknown.length && !acceptUnknown) return { ok: false, reason: `${unknown.length}/${frames.length} frames have no readable licence (${unknown[0].licence_why}); rerun with --accept-unknown-licence only after Rights has ruled` };
  return { ok: true, reason: unknown.length ? `${unknown.length} frames accepted with an unverified licence (--accept-unknown-licence)` : 'all frames permissive' };
}
