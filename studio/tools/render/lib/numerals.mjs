/**
 * numerals — spoken numbers in, written numbers out, for CAPTIONS ONLY.
 *
 * The narration is written with numbers spelled out ("eighteen seventy-two") because the voice cannot tell a year
 * from a quantity: given "1872" it may say "one thousand eight hundred and seventy-two". So the script stays in
 * words and the synthesizer is never touched. But the founder, reading the burned captions: "numbers like year
 * 18xx or spell out as words in caption, better be numbers." Captions are read, not heard, and a reader scans
 * "1872" in a glance where "eighteen seventy-two" costs a sentence.
 *
 * So this converts DISPLAY text only. House style, the usual one for subtitles:
 *   · years always as digits               eighteen seventy-two → 1872 · the seventeen-thirties → the 1730s
 *   · 10 and above as digits               seventy-two days → 72 days · a hundred and eighty miles → 180 miles
 *   · one to nine stay words               one bag · three pairs of stockings  (a caption of "1 bag" reads as a typo)
 *   · but not when a larger number rides with them   forty-four hours and thirty-three minutes → 44 hours and 33 minutes
 *   · dates                                the second of October → 2 October · the twenty-second → the 22nd
 *   · decimals and scale words             three point nine million → 3.9 million · nine and a half million → 9.5 million
 * Anything it cannot parse with confidence it leaves exactly as it was.
 */
const UNITS = { zero: 0, oh: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19 };
const TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const ORD = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10,
  eleventh: 11, twelfth: 12, thirteenth: 13, fourteenth: 14, fifteenth: 15, sixteenth: 16, seventeenth: 17, eighteenth: 18,
  nineteenth: 19, twentieth: 20, thirtieth: 30 };
const MONTHS = 'January|February|March|April|May|June|July|August|September|October|November|December';
const suffix = n => (n % 100 >= 11 && n % 100 <= 13) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th');
const group = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// one word or hyphenated compound under 100: "seventy-two" → 72, "twelve" → 12, "oh-three" handled by caller
function under100(w) {
  const s = w.toLowerCase();
  if (s in UNITS) return UNITS[s];
  if (s in TENS) return TENS[s];
  const m = s.match(/^([a-z]+)-([a-z]+)$/);
  if (m && m[1] in TENS && m[2] in UNITS && UNITS[m[2]] < 10 && UNITS[m[2]] > 0) return TENS[m[1]] + UNITS[m[2]];
  return null;
}

/** A run of number-words → { value, kind:'year'|'num' } or null. Tokens are already lowercased, hyphens intact. */
function parseRun(toks) {
  const t = toks.filter(x => x !== 'and');
  if (!t.length) return null;
  // YEAR, two-part: teens-or-twenty + tens ("eighteen seventy-two", "twelve ninety", "twenty twenty-four",
  // "eighteen-oh-three" arrives pre-split as ["eighteen","oh","three"])
  if (t.length === 3 && t[1] === 'oh' && UNITS[t[0]] >= 10 && UNITS[t[2]] < 10) return { value: UNITS[t[0]] * 100 + UNITS[t[2]], kind: 'year' };
  if (t.length === 2) {
    const a = under100(t[0]), b = under100(t[1]);
    if (a != null && b != null && a >= 10 && a <= 20 && b >= 10 && !toks.includes('and')) return { value: a * 100 + b, kind: 'year' };
  }
  // CARDINAL with hundred / thousand / million
  let total = 0, cur = 0, seen = false;
  for (let i = 0; i < t.length; i++) {
    const w = t[i];
    if (w === 'a' && (t[i + 1] === 'hundred' || t[i + 1] === 'thousand')) { cur = 1; seen = true; continue; }
    const v = under100(w);
    if (v != null) { cur += v; seen = true; continue; }
    if (w === 'hundred') { cur = (cur || 1) * 100; continue; }
    if (w === 'thousand') { total += (cur || 1) * 1000; cur = 0; continue; }
    if (w === 'million') { total += (cur || 1) * 1e6; cur = 0; continue; }
    return null;
  }
  if (!seen) return null;
  const value = total + cur;
  // "two thousand and eight" is a year when it sits in year range
  return { value, kind: value >= 1000 && value <= 2100 && toks.includes('thousand') ? 'year' : 'num' };
}

const NUMWORD = new RegExp('^(?:' + [...Object.keys(UNITS), ...Object.keys(TENS), 'hundred', 'thousand', 'million'].join('|') +
  ')(?:-(?:' + Object.keys(UNITS).join('|') + '))?$', 'i');
const isNumTok = w => NUMWORD.test(w) || w.toLowerCase() === 'and' || w.toLowerCase() === 'a' || w.toLowerCase() === 'oh';

// Book and work titles are names, not quantities: "Around the World in Eighty Days" must never become "80 Days".
const PROTECT = [/Around the World in Eighty Days/g, /Le Tour du monde en quatre-vingts jours/g];
const HOURS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 };

export function displayNumbers(text) {
  let s = String(text);
  // protect titles by swapping them for placeholders that contain no number-words
  const held = [];
  for (const re of PROTECT) s = s.replace(re, m => { held.push(m); return `\u0000${held.length - 1}\u0000`; });
  // times of day: "twenty-five past seven" → "7:25"; "a quarter to nine" is left alone (it is how the novel says it)
  s = s.replace(/\b(five|ten|twenty|twenty-five)\s+past\s+(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/gi,
    (all, mm, hh) => `${HOURS[hh.toLowerCase()]}:${String({ five: 5, ten: 10, twenty: 20, 'twenty-five': 25 }[mm.toLowerCase()]).padStart(2, '0')}`);
  // "the early eighteen hundreds" → "the early 1800s"
  s = s.replace(/\b(eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen)\s+hundreds\b/gi,
    (all, c) => `${UNITS[c.toLowerCase()]}00s`);
  // an address is a name: "number one Savile Row" / "number seven" → "No. 1 Savile Row" / "No. 7"
  s = s.replace(/\bnumber\s+(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fourteen|fifteen)\b/gi,
    (all, n) => `No. ${UNITS[n.toLowerCase()]}`);
  // dates first, while the ordinals are still words: "the second of October" → "2 October"
  s = s.replace(new RegExp(`\\bthe\\s+((?:(?:twenty|thirty)-)?(?:${Object.keys(ORD).join('|')}))\\s+of\\s+(${MONTHS})\\b`, 'gi'),
    (all, ord, mon) => { const n = ordValue(ord); return n ? `${n} ${mon}` : all; });
  // compound ordinals standing alone: "the twenty-first" → "the 21st"
  s = s.replace(/\b(twenty|thirty)-(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth)\b/gi,
    (all) => { const n = ordValue(all); return n ? `${n}${suffix(n)}` : all; });
  // decades: "the seventeen-thirties" → "the 1730s"
  s = s.replace(/\b(eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen)-(twenties|thirties|forties|fifties|sixties|seventies|eighties|nineties)\b/gi,
    (all, c, d) => `${UNITS[c.toLowerCase()]}${{ twenties: 20, thirties: 30, forties: 40, fifties: 50, sixties: 60, seventies: 70, eighties: 80, nineties: 90 }[d.toLowerCase()]}s`);
  // "eighteen-oh-three" → split so the run parser sees three tokens
  s = s.replace(/\b(\w+)-oh-(\w+)\b/gi, '$1 oh $2');
  // "three point nine million" → "3.9 million"
  s = s.replace(/\b(\w+(?:-\w+)?) point (\w+) (million|thousand)\b/gi, (all, a, b, sc) => {
    const x = under100(a), y = UNITS[b.toLowerCase()]; return x != null && y != null ? `${x}.${y} ${sc}` : all; });
  // "nine and a half million" → "9.5 million"
  s = s.replace(/\b(\w+(?:-\w+)?) and a half (million|thousand|days)\b/gi, (all, a, sc) => {
    const x = under100(a); return x != null ? `${x}.5 ${sc}` : all; });

  // everything else: scan for maximal runs of number-words
  const parts = s.split(/(\s+|[,.;:!?—–()"“”])/);
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    const w = parts[i];
    if (!w || !isNumTok(w) || /^(a|and|oh)$/i.test(w)) { out.push(w); continue; }
    // collect the run: number words separated only by single spaces, allowing interior "and" / leading "a"
    const run = [w.toLowerCase()]; let j = i + 1; const sep = [];
    while (j + 1 < parts.length && /^ $/.test(parts[j]) && isNumTok(parts[j + 1])) {
      if (/^(and|a|oh)$/i.test(parts[j + 1]) && !(j + 3 < parts.length && isNumTok(parts[j + 3]) && !/^(and|a|oh)$/i.test(parts[j + 3]))) break;
      sep.push(parts[j]); run.push(parts[j + 1].toLowerCase()); j += 2;
    }
    // a leading "a" belongs to the run ("a hundred and eighty"): it is already in `out`, so reclaim it
    let leadA = false;
    if (out.length >= 2 && /^a$/i.test(out[out.length - 2]) && /^ $/.test(out[out.length - 1]) && /^(hundred|thousand)$/i.test(w)) {
      leadA = true; run.unshift('a');
    }
    const r = parseRun(run);
    const small = r && r.kind === 'num' && r.value < 10;
    // a single word one-to-nine stays a word unless a larger number sits in the same phrase ("44 hours and 33 minutes"
    // is handled because each is its own run and both are >= 10)
    if (!r || small) { out.push(w); continue; }
    if (leadA) { out.pop(); out.pop(); }
    out.push(r.kind === 'year' ? String(r.value) : group(r.value));
    i = j - 1;
  }
  let r = out.join('');
  // "2 October, 1872" → "2 October 1872": the comma is how the voice pauses, not how a date is written
  r = r.replace(new RegExp(`\\b(\\d{1,2}) (${MONTHS}), (\\d{4})\\b`, 'g'), '$1 $2 $3');
  // one-to-nine with a time unit, when a digit numeral is in the same breath: "72 days, six hours and 11 minutes"
  // → "72 days, 6 hours and 11 minutes". Alone ("two days' notice") they stay words.
  r = r.replace(/\b(one|two|three|four|five|six|seven|eight|nine)(\s+(?:hours?|minutes?|seconds?|days?))\b/gi, (all, n, unit, off, str) => {
    const near = str.slice(Math.max(0, off - 22), off + all.length + 22);
    return /\d/.test(near) ? `${UNITS[n.toLowerCase()]}${unit}` : all;
  });
  // put the protected titles back
  r = r.replace(/\u0000(\d+)\u0000/g, (all, i) => held[+i]);
  return r;
}

function ordValue(word) {
  const s = word.toLowerCase();
  if (s in ORD) return ORD[s];
  const m = s.match(/^(twenty|thirty)-(\w+)$/);
  return m && (m[2] in ORD) ? TENS[m[1]] + ORD[m[2]] : null;
}
