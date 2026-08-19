import zlib from 'zlib';

export const MAX_CV_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export class CvExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CvExtractionError';
  }
}

export interface ExtractedCvTextResult {
  text: string;
  pageCount?: number;
  format: 'pdf' | 'docx' | 'txt';
  charCount: number;
}

/**
 * Extracts plain text from DOCX buffer by scanning all XML parts
 * (document.xml, header*.xml, footer*.xml, footnotes.xml) from the zip package.
 */
export function extractTextFromDocx(buffer: Buffer): string {
  try {
    let offset = 0;
    const xmlFragments: string[] = [];

    // Scan ZIP local file headers (Signature: 0x04034b50)
    while (offset < buffer.length - 30) {
      if (
        buffer[offset] === 0x50 &&
        buffer[offset + 1] === 0x4b &&
        buffer[offset + 2] === 0x03 &&
        buffer[offset + 3] === 0x04
      ) {
        const compressionMethod = buffer.readUInt16LE(offset + 8);
        const compressedSize = buffer.readUInt32LE(offset + 18);
        const fileNameLength = buffer.readUInt16LE(offset + 26);
        const extraFieldLength = buffer.readUInt16LE(offset + 28);
        const fileName = buffer
          .subarray(offset + 30, offset + 30 + fileNameLength)
          .toString('utf8');

        const dataStart = offset + 30 + fileNameLength + extraFieldLength;

        if (
          fileName === 'word/document.xml' ||
          fileName.startsWith('word/header') ||
          fileName.startsWith('word/footer') ||
          fileName === 'word/footnotes.xml'
        ) {
          const compressedData = buffer.subarray(dataStart, dataStart + compressedSize);
          let decompressed: Buffer | null = null;

          if (compressionMethod === 8) {
            try {
              decompressed = zlib.inflateRawSync(compressedData);
            } catch {
              try {
                decompressed = zlib.inflateSync(compressedData);
              } catch {
                // ignore part decompression error
              }
            }
          } else if (compressionMethod === 0) {
            decompressed = compressedData;
          }

          if (decompressed) {
            xmlFragments.push(decompressed.toString('utf8'));
          }
        }

        offset = dataStart + compressedSize;
      } else {
        offset++;
      }
    }

    // Fallback: If local file headers missed, search for raw XML tags
    if (xmlFragments.length === 0) {
      const rawString = buffer.toString('binary');
      const xmlMatch = rawString.match(/<w:document[\s\S]*?<\/w:document>/);
      if (xmlMatch) {
        xmlFragments.push(Buffer.from(xmlMatch[0], 'binary').toString('utf8'));
      }
    }

    if (xmlFragments.length === 0) {
      throw new CvExtractionError('DOCX belgesi okunamadı veya bozuk.');
    }

    const combinedXml = xmlFragments.join('\n');

    // Parse XML tags into clean structured text
    const cleanedText = combinedXml
      .replace(/<w:p[^>]*>/g, '\n')
      .replace(/<w:tr[^>]*>/g, '\n')
      .replace(/<w:tc[^>]*>/g, ' \t ')
      .replace(/<w:tab[^>]*\/>/g, ' ')
      .replace(/<w:br[^>]*\/>/g, '\n')
      .replace(/<w:t[^>]*>(.*?)<\/w:t>/g, '$1')
      .replace(/<[^>]+>/g, '') // remove remaining XML tags
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    return cleanedText;
  } catch (err: any) {
    if (err instanceof CvExtractionError) throw err;
    throw new CvExtractionError(`DOCX metni çıkarılırken hata oluştu: ${err.message}`);
  }
}

/**
 * Extracts plain text from PDF buffer using Mozilla pdf.js engine via PDFParse,
 * with fallback to deep binary stream & hex-string decompression.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // Strategy 1: PDFParse (pdf.js) — handles CID fonts, ToUnicode CMaps, multi-column layouts
  try {
    let PDFParseClass: any;
    try {
      const mod = require('pdf-parse');
      PDFParseClass = mod.PDFParse || mod.default?.PDFParse || mod;
    } catch {
      try {
        const { createRequire } = require('module');
        const customRequire = createRequire(__filename);
        const mod = customRequire('pdf-parse');
        PDFParseClass = mod.PDFParse || mod.default?.PDFParse || mod;
      } catch (loadErr: any) {
        console.error('PDFParse load error:', loadErr?.message);
      }
    }

    const parser = new PDFParseClass({ data: buffer });
    try {
      const res = await parser.getText();
      const rawText = (res?.text || '')
        .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, '')
        .replace(/\r\n/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      if (rawText && rawText.length >= 10) {
        return rawText;
      }
    } finally {
      if (typeof parser?.destroy === 'function') {
        try {
          await parser.destroy();
        } catch {
          // ignore cleanup errors
        }
      }
    }
  } catch (err: any) {
    console.error('Strategy 1 PDFParse error in Next.js:', err?.message || err);
  }

  // Strategy 2: Deep binary stream and hex/Tj/TJ decoder
  try {
    const fallbackText = extractTextFromPdfStreams(buffer);
    if (fallbackText && fallbackText.length >= 10) {
      return fallbackText;
    }
  } catch {
    // Strategy 2 failed
  }

  // Strategy 3: Search for ASCII/UTF-8 text chunks embedded in the raw buffer
  const rawTextChunks = extractRawReadableTextFromBuffer(buffer);
  if (rawTextChunks && rawTextChunks.length >= 25) {
    return rawTextChunks;
  }

  throw new CvExtractionError(
    "CV'den yeterli bilgi çıkarılamadı. Lütfen bilgileri manuel olarak tamamlayın.",
  );
}

/**
 * Fallback binary stream parser for PDF files. Handles compressed streams,
 * ToUnicode CMaps, hex strings `<0048...>`, and standard PDF text operators (`Tj`, `TJ`).
 */
function extractTextFromPdfStreams(buffer: Buffer): string {
  const rawBinary = buffer.toString('binary');
  if (!rawBinary.startsWith('%PDF-') && !rawBinary.includes('%PDF-')) {
    return '';
  }

  const decompressedStreams: string[] = [];

  // Locate all stream objects in the PDF
  const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
  let match: RegExpExecArray | null;

  while ((match = streamRegex.exec(rawBinary)) !== null) {
    const streamContent = match[1];
    const streamBuffer = Buffer.from(streamContent, 'binary');

    let decompressed = '';
    try {
      const unzipped = zlib.inflateSync(streamBuffer);
      decompressed = unzipped.toString('latin1');
    } catch {
      try {
        const unzippedRaw = zlib.inflateRawSync(streamBuffer);
        decompressed = unzippedRaw.toString('latin1');
      } catch {
        decompressed = streamContent;
      }
    }

    decompressedStreams.push(decompressed);
  }

  // Build combined ToUnicode CMap across all streams
  const cmap = new Map<string, string>();
  for (const s of decompressedStreams) {
    if (s.includes('beginbfchar') || s.includes('beginbfrange')) {
      parseCMapIntoMap(s, cmap);
    }
  }

  const textPieces: string[] = [];
  for (const s of decompressedStreams) {
    const extracted = parsePdfStreamTextWithCMap(s, cmap);
    if (extracted) {
      textPieces.push(extracted);
    }
  }

  let fullText = textPieces.join('\n\n').trim();

  // If streams didn't yield enough text, parse text outside streams
  if (fullText.length < 30) {
    const rawExtracted = parsePdfStreamTextWithCMap(rawBinary, cmap);
    if (rawExtracted.length > fullText.length) {
      fullText = rawExtracted;
    }
  }

  return fullText
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Parses ToUnicode CMap beginbfchar / beginbfrange sections into a glyph mapping dictionary.
 */
function parseCMapIntoMap(cmapStr: string, map: Map<string, string>): void {
  // Parse beginbfchar
  const bfcharRegex = /(\d+)\s+beginbfchar([\s\S]*?)endbfchar/g;
  let m: RegExpExecArray | null;
  while ((m = bfcharRegex.exec(cmapStr)) !== null) {
    const lines = m[2].trim().split(/\r?\n/);
    for (const line of lines) {
      const parts = line.trim().match(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/);
      if (parts) {
        const src = parts[1].toLowerCase().padStart(4, '0');
        const dstCode = parseInt(parts[2], 16);
        if (dstCode > 0) {
          map.set(src, String.fromCharCode(dstCode));
        }
      }
    }
  }

  // Parse beginbfrange
  const bfrangeRegex = /(\d+)\s+beginbfrange([\s\S]*?)endbfrange/g;
  while ((m = bfrangeRegex.exec(cmapStr)) !== null) {
    const lines = m[2].trim().split(/\r?\n/);
    for (const line of lines) {
      const parts = line.trim().match(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/);
      if (parts) {
        const start = parseInt(parts[1], 16);
        const end = parseInt(parts[2], 16);
        let dst = parseInt(parts[3], 16);
        for (let code = start; code <= end; code++) {
          const hexKey = code.toString(16).toLowerCase().padStart(4, '0');
          if (dst > 0) {
            map.set(hexKey, String.fromCharCode(dst));
          }
          dst++;
        }
      }
    }
  }
}

/**
 * Parses PDF text commands: `(Text) Tj`, `<Hex> Tj`, `[...] TJ` using CMap.
 */
function parsePdfStreamTextWithCMap(stream: string, cmap: Map<string, string>): string {
  const result: string[] = [];

  const tjRegex = /(?:\((?:\\\(|\\\)|[^()])*\)\s*Tj|<[0-9a-fA-F\s]+>\s*Tj|\[([\s\S]*?)\]\s*TJ|'(?:[^\r\n]*)'|"(?:[^\r\n]*)")/g;
  let tjMatch: RegExpExecArray | null;

  while ((tjMatch = tjRegex.exec(stream)) !== null) {
    const rawCmd = tjMatch[0];

    // Case 1: Simple (Text) Tj
    const singleTj = rawCmd.match(/^\(((?:\\\(|\\\)|[^()])*)\)\s*Tj$/);
    if (singleTj) {
      result.push(decodePdfString(singleTj[1]));
      continue;
    }

    // Case 2: Hex <00480065> Tj
    const hexTj = rawCmd.match(/^<([0-9a-fA-F\s]+)>\s*Tj$/);
    if (hexTj) {
      result.push(decodePdfHexWithCMap(hexTj[1], cmap));
      continue;
    }

    // Case 3: Array [(Text1) 120 <0048>] TJ
    if (rawCmd.startsWith('[') && rawCmd.endsWith('TJ')) {
      const parts = rawCmd.match(/\(((?:\\\(|\\\)|[^()])*)\)|<([0-9a-fA-F\s]+)>/g);
      if (parts) {
        const decodedLine = parts
          .map((part) => {
            if (part.startsWith('(') && part.endsWith(')')) {
              return decodePdfString(part.slice(1, -1));
            }
            if (part.startsWith('<') && part.endsWith('>')) {
              return decodePdfHexWithCMap(part.slice(1, -1), cmap);
            }
            return '';
          })
          .join('');
        if (decodedLine.trim()) {
          result.push(decodedLine);
        }
      }
      continue;
    }
  }

  return result.join(' ');
}

/**
 * Decodes PDF string escape sequences (e.g. \n, \r, \t, \(, \), \\, \ooo octal)
 */
function decodePdfString(str: string): string {
  return str
    .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)))
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\');
}

/**
 * Decodes PDF Hex strings using CMap or fallback UTF-16BE / ASCII
 */
function decodePdfHexWithCMap(hex: string, cmap: Map<string, string>): string {
  const cleanHex = hex.replace(/\s+/g, '');
  if (cleanHex.length === 0) return '';

  // If CMap is present and has mappings
  if (cmap.size > 0) {
    let text = '';
    let hasValidMatch = false;
    for (let i = 0; i < cleanHex.length; i += 4) {
      const chunk = cleanHex.slice(i, i + 4).toLowerCase().padStart(4, '0');
      if (cmap.has(chunk)) {
        text += cmap.get(chunk);
        hasValidMatch = true;
      } else {
        const code = parseInt(chunk, 16);
        if (code > 0 && code < 65535) {
          text += String.fromCharCode(code);
        }
      }
    }
    if (hasValidMatch && text.trim().length > 0) {
      return text;
    }
  }

  // Check UTF-16BE with 0x00 interleaved
  const bytes = Buffer.from(cleanHex, 'hex');
  if (bytes.length >= 2 && bytes[0] === 0x00) {
    let text = '';
    for (let i = 0; i < bytes.length; i += 2) {
      const code = bytes.readUInt16BE(i);
      if (code > 0 && code < 65535) {
        text += String.fromCharCode(code);
      }
    }
    return text;
  }

  return bytes.toString('utf8');
}

/**
 * Extracts printable ASCII/UTF-8 words from a raw binary buffer as a last-resort fallback.
 */
function extractRawReadableTextFromBuffer(buffer: Buffer): string {
  const str = buffer.toString('utf8');
  // Match sequences of alphanumeric and Turkish characters of length >= 3
  const words = str.match(/[a-zA-ZğüşıöçĞÜŞİÖÇ0-9@.-]{3,}/g);
  if (!words || words.length < 10) return '';
  return words.join(' ');
}

/**
 * Universal CV Text Extractor. Handles PDF, DOCX, and TXT files with strict validation.
 */
export async function extractCvText(
  fileBuffer: Buffer,
  fileName: string,
  mimeType?: string,
): Promise<ExtractedCvTextResult> {
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new CvExtractionError('Yüklenen dosya boş veya okunamıyor.');
  }

  if (fileBuffer.length > MAX_CV_FILE_SIZE_BYTES) {
    throw new CvExtractionError(
      `Dosya boyutu çok büyük. Maksimum dosya boyutu 5 MB olmalıdır (Yüklenen: ${(fileBuffer.length / 1024 / 1024).toFixed(1)} MB).`,
    );
  }

  const lowerName = fileName.toLowerCase();
  const lowerMime = (mimeType || '').toLowerCase();

  let text = '';
  let format: 'pdf' | 'docx' | 'txt' = 'pdf';

  if (lowerName.endsWith('.docx') || lowerMime.includes('wordprocessingml')) {
    format = 'docx';
    text = extractTextFromDocx(fileBuffer);
  } else if (lowerName.endsWith('.pdf') || lowerMime.includes('pdf')) {
    format = 'pdf';
    text = await extractTextFromPdf(fileBuffer);
  } else if (lowerName.endsWith('.txt') || lowerMime.includes('text/plain')) {
    format = 'txt';
    text = fileBuffer.toString('utf8').trim();
  } else {
    // Try detection via buffer magic numbers
    if (fileBuffer.subarray(0, 4).toString('utf8') === '%PDF') {
      format = 'pdf';
      text = await extractTextFromPdf(fileBuffer);
    } else if (fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4b) {
      format = 'docx';
      text = extractTextFromDocx(fileBuffer);
    } else {
      throw new CvExtractionError(
        'Desteklenmeyen dosya formatı. Lütfen PDF veya DOCX formatında CV yükleyin.',
      );
    }
  }

  if (!text || text.trim().length < 10) {
    throw new CvExtractionError(
      'Bu PDF görüntü tabanlı olduğu için metin okunamadı. Lütfen metin içeren bir PDF veya DOCX yükleyin veya bilgileri manuel olarak tamamlayın.',
    );
  }

  return {
    text,
    format,
    charCount: text.length,
  };
}
