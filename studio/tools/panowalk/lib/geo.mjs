// Shared spherical geometry + tiny JPEG header reader. No dependencies, no network.
export const D2R = Math.PI / 180, R2D = 180 / Math.PI, EARTH_M = 6371000;
export function dist(a, b) {
  const la1 = a.lat * D2R, la2 = b.lat * D2R, dla = (b.lat - a.lat) * D2R, dlo = (b.lng - a.lng) * D2R;
  const h = Math.sin(dla / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dlo / 2) ** 2;
  return 2 * EARTH_M * Math.asin(Math.min(1, Math.sqrt(h)));
}
export function bearing(a, b) {
  const la1 = a.lat * D2R, la2 = b.lat * D2R, dlo = (b.lng - a.lng) * D2R;
  const y = Math.sin(dlo) * Math.cos(la2), x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dlo);
  return (Math.atan2(y, x) * R2D + 360) % 360;
}
export const norm = d => ((d % 360) + 360) % 360;
export function delta(from, to) { let d = norm(to) - norm(from); if (d > 180) d -= 360; if (d < -180) d += 360; return d; }
export const median = xs => { if (!xs.length) return 0; const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

/** bbox [w,s,e,n] around a point, in degrees, for a metre radius. */
export function bbox(lat, lng, radius_m) {
  const dLat = radius_m / 111320, dLng = radius_m / (111320 * Math.max(0.2, Math.cos(lat * D2R)));
  return [lng - dLng, lat - dLat, lng + dLng, lat + dLat];
}

/** width/height straight out of a JPEG's SOF marker — avoids pulling in an image library. */
export function jpegSize(buf) {
  if (buf.length < 4 || buf[0] !== 0xFF || buf[1] !== 0xD8) return null;
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xFF) { i++; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC)
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}
