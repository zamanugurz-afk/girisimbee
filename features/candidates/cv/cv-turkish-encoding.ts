/**
 * Universal Turkish Character Encoding & Mojibake Repair Engine
 *
 * Handles:
 * 1. UTF-8 Mojibake (e.g. "MÃ¼ÅŸteri" -> "Müşteri", "YÃ¶netim" -> "Yönetim")
 * 2. Windows-1254 vs Latin-1 misdecoding (e.g. "Müþteri" -> "Müşteri", "Çalıþan" -> "Çalışan", "Öðrenci" -> "Öğrenci", "Ýstanbul" -> "İstanbul")
 * 3. Single-byte CP1254 / ISO-8859-9 binary stream decoding
 * 4. PDF ligatures (fi, fl, ff, ffi, ffl)
 * 5. DOCX / XML numeric and named HTML entities (&#351;, &#287;, &#305;, &#x015f;, etc.)
 * 6. Non-breaking spaces, zero-width chars, and box-drawing artifacts (│, ┌, etc.)
 */

/**
 * Windows-1254 single-byte to Unicode character mapping for Turkish specific bytes:
 */
export const CP1254_BYTE_MAP: Record<number, string> = {
  0x80: '€',
  0x82: '‚',
  0x83: 'ƒ',
  0x84: '„',
  0x85: '…',
  0x86: '†',
  0x87: '‡',
  0x88: 'ˆ',
  0x89: '‰',
  0x8a: 'Š',
  0x8b: '‹',
  0x8c: 'Œ',
  0x91: '‘',
  0x92: '’',
  0x93: '“',
  0x94: '”',
  0x95: '•',
  0x96: '–',
  0x97: '—',
  0x98: '˜',
  0x99: '™',
  0x9a: 'š',
  0x9b: '›',
  0x9c: 'œ',
  0x9f: 'Ÿ',
  0xa0: ' ',
  0xc0: 'À',
  0xc1: 'Á',
  0xc2: 'Â',
  0xc3: 'Ã',
  0xc4: 'Ä',
  0xc5: 'Å',
  0xc6: 'Æ',
  0xc7: 'Ç',
  0xc8: 'È',
  0xc9: 'É',
  0xca: 'Ê',
  0xcb: 'Ë',
  0xcc: 'Ì',
  0xcd: 'Í',
  0xce: 'Î',
  0xcf: 'Ï',
  0xd0: 'Ğ', // CP1254 Turkish
  0xd1: 'Ñ',
  0xd2: 'Ò',
  0xd3: 'Ó',
  0xd4: 'Ô',
  0xd5: 'Õ',
  0xd6: 'Ö',
  0xd7: '×',
  0xd8: 'Ø',
  0xd9: 'Ù',
  0xda: 'Ú',
  0xdb: 'Û',
  0xdc: 'Ü',
  0xdd: 'İ', // CP1254 Turkish
  0xde: 'Ş', // CP1254 Turkish
  0xdf: 'ß',
  0xe0: 'à',
  0xe1: 'á',
  0xe2: 'â',
  0xe3: 'ã',
  0xe4: 'ä',
  0xe5: 'å',
  0xe6: 'æ',
  0xe7: 'ç',
  0xe8: 'è',
  0xe9: 'é',
  0xea: 'ê',
  0xeb: 'ë',
  0xec: 'ì',
  0xed: 'í',
  0xee: 'î',
  0xef: 'ï',
  0xf0: 'ğ', // CP1254 Turkish
  0xf1: 'ñ',
  0xf2: 'ò',
  0xf3: 'ó',
  0xf4: 'ô',
  0xf5: 'õ',
  0xf6: 'ö',
  0xf7: '÷',
  0xf8: 'ø',
  0xf9: 'ù',
  0xfa: 'ú',
  0xfb: 'û',
  0xfc: 'ü',
  0xfd: 'ı', // CP1254 Turkish
  0xfe: 'ş', // CP1254 Turkish
  0xff: 'ÿ',
};

/**
 * Decodes a single byte according to CP1254 / ISO-8859-9 (Turkish).
 */
export function decodeCp1254Byte(byte: number): string {
  if (byte < 0x80) {
    return String.fromCharCode(byte);
  }
  return CP1254_BYTE_MAP[byte] ?? String.fromCharCode(byte);
}

/**
 * Decodes a buffer attempting UTF-8 first. If invalid UTF-8 bytes are found (e.g. \uFFFD replacement characters),
 * decodes as CP1254 / ISO-8859-9.
 */
export function decodeCp1254OrUtf8(buffer: Buffer): string {
  if (!buffer || buffer.length === 0) return '';

  try {
    const utf8 = buffer.toString('utf8');
    // If UTF-8 contains no replacement character (\uFFFD), check if it looks valid
    if (!utf8.includes('\uFFFD')) {
      return repairTurkishEncodingAndMojibake(utf8);
    }
  } catch {
    // UTF-8 failed
  }

  // Fallback to CP1254 byte-by-byte decode
  let decoded = '';
  for (let i = 0; i < buffer.length; i++) {
    decoded += decodeCp1254Byte(buffer[i]!);
  }

  return repairTurkishEncodingAndMojibake(decoded);
}

/**
 * Common double-encoded UTF-8 sequences in Turkish texts.
 */
const MOJIBAKE_MAP: Array<[RegExp, string]> = [
  // Turkish lowercase
  [/Ã§/g, 'ç'],
  [/ÄŸ/g, 'ğ'],
  [/Ä±/g, 'ı'],
  [/Ã¶/g, 'ö'],
  [/ÅŸ/g, 'ş'],
  [/Ã¼/g, 'ü'],

  // Turkish uppercase
  [/Ã‡/g, 'Ç'],
  [/Äž/g, 'Ğ'],
  [/Ä°/g, 'İ'],
  [/Ã–/g, 'Ö'],
  [/Åž/g, 'Ş'],
  [/Ãœ/g, 'Ü'],

  // Circumflex letters
  [/Ã¢/g, 'â'],
  [/Ã®/g, 'î'],
  [/Ã»/g, 'û'],
  [/Ã‚/g, 'Â'],
  [/ÃŽ/g, 'Î'],
  [/Ã›/g, 'Û'],

  // Punctuation & Quotes
  [/â€™/g, "'"],
  [/â€˜/g, "'"],
  [/â€œ/g, '"'],
  [/â€ /g, '"'],
  [/â€\x9d/g, '"'],
  [/â€\x9c/g, '"'],
  [/â€“/g, '–'],
  [/â€”/g, '—'],
  [/â€¦/g, '…'],
  [/â€¢/g, '•'],
  [/â€/g, ''],
  [/Â\xa0/g, ' '],
  [/Â /g, ' '],
  [/Â/g, ''],
];

/**
 * Windows-1254 misdecoded as ISO-8859-1 (Latin-1) mappings:
 * When Turkish Windows-1254 text is read as Latin-1:
 * - 0xFE ('ş') -> 'þ' (thorn)
 * - 0xDE ('Ş') -> 'Þ' (capital thorn)
 * - 0xF0 ('ğ') -> 'ð' (eth)
 * - 0xD0 ('Ğ') -> 'Ð' (capital eth)
 * - 0xFD ('ı') -> 'ý' (y acute)
 * - 0xDD ('İ') -> 'Ý' (capital Y acute)
 */
const LATIN1_MISMATCH_MAP: Array<[RegExp, string]> = [
  [/þ/g, 'ş'],
  [/Þ/g, 'Ş'],
  [/ð/g, 'ğ'],
  [/Ð/g, 'Ğ'],
  [/ý/g, 'ı'],
  [/Ý/g, 'İ'],
];

/**
 * Standardizes and repairs Turkish text from any CV document.
 */
export function repairTurkishEncodingAndMojibake(input: string, preserveWhitespace = false): string {
  if (!input) return '';

  const hasLeadingSpace = preserveWhitespace && /^\s/.test(input);
  const hasTrailingSpace = preserveWhitespace && /\s$/.test(input);

  let text = input;

  // 1. Decode numeric XML entities (e.g. &#351; -> ş, &#287; -> ğ, &#x015f; -> ş)
  text = text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const code = parseInt(hex, 16);
      return code > 0 ? String.fromCharCode(code) : '';
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = parseInt(dec, 10);
      return code > 0 ? String.fromCharCode(code) : '';
    });

  // 2. Decode standard named XML entities
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');

  // 3. Fix UTF-8 Mojibake
  for (const [pattern, replacement] of MOJIBAKE_MAP) {
    text = text.replace(pattern, replacement);
  }

  // 4. Fix Windows-1254 read as Latin-1 (e.g. þ -> ş, ð -> ğ, ý -> ı)
  for (const [pattern, replacement] of LATIN1_MISMATCH_MAP) {
    text = text.replace(pattern, replacement);
  }

  // 5. Replace PDF ligatures
  text = text
    .replace(/\uFB00/g, 'ff')
    .replace(/\uFB01/g, 'fi')
    .replace(/\uFB02/g, 'fl')
    .replace(/\uFB03/g, 'ffi')
    .replace(/\uFB04/g, 'ffl');

  // 6. Clean box-drawing characters used as table column dividers (│, ┃, ┆)
  // Convert them into a clean pipe separator with spaces
  text = text
    .replace(/[\u2502\u2503\u2506\u2507\u254e\u254f]/g, ' | ')
    .replace(/[\u2500\u2501\u254c\u254d]/g, '-')
    .replace(/[\u250c\u250d\u250e\u250f\u2510\u2511\u2512\u2513\u2514\u2515\u2516\u2517\u2518\u2519\u251a\u251b\u251c\u251d\u251e\u251f\u2520\u2521\u2522\u2523\u2524\u2525\u2526\u2527\u2528\u2529\u252a\u252b\u252c\u252d\u252e\u252f\u2530\u2531\u2532\u2533\u2534\u2535\u2536\u2537\u2538\u2539\u253a\u253b\u253c\u253d\u253e\u253f]/g, ' ');

  // 7. Strip zero-width spaces and control artifacts
  text = text
    .replace(/[\u200B-\u200D\uFEFF\u0000]/g, '')
    .replace(/\u00A0/g, ' ');

  // 8. Normalize Unicode to NFC
  text = text.normalize('NFC');

  // 9. Clean excessive spaces around pipes and punctuation
  text = text
    .replace(/[ \t]*\|[ \t]*/g, ' | ')
    .replace(/[ \t]+/g, ' ');

  if (!preserveWhitespace) {
    text = text.trim();
  } else {
    if (hasLeadingSpace && !text.startsWith(' ')) text = ' ' + text;
    if (hasTrailingSpace && !text.endsWith(' ')) text = text + ' ';
  }

  return text;
}
