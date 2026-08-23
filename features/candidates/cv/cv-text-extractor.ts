import zlib from 'zlib';
import {
  detectCvFormatFromBuffer,
  CvExtractionError,
  MAX_CV_FILE_SIZE_BYTES,
} from './cv-format-detector';
import {
  repairTurkishEncodingAndMojibake,
  decodeCp1254OrUtf8,
} from './cv-turkish-encoding';
import {
  reconstructDocumentLayout,
  type RawSpatialToken,
} from './cv-spatial-layout-engine';
import type { CvDocumentModel } from './cv-document-model';

export { CvExtractionError, MAX_CV_FILE_SIZE_BYTES };

export interface ExtractedCvTextResult {
  text: string;
  pageCount?: number;
  format: 'pdf' | 'docx' | 'txt' | 'rtf';
  charCount: number;
  documentModel?: CvDocumentModel;
}

/**
 * Extracts plain text from DOCX buffer by scanning XML parts
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
    const cleanedFullText = combinedXml
      .replace(/<w:p[^>]*>/gs, '\n')
      .replace(/<w:tr[^>]*>/gs, '\n')
      .replace(/<w:tc[^>]*>/gs, ' \t ')
      .replace(/<w:tab[^>]*\/>/g, ' ')
      .replace(/<w:br[^>]*\/>/g, '\n')
      .replace(/<w:t[^>]*>(.*?)<\/w:t>/gs, '$1')
      .replace(/<[^>]+>/g, '')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    return repairTurkishEncodingAndMojibake(cleanedFullText);
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
  // Strategy 1: PDFParse (pdf.js)
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
      } catch {
        // ignore load error
      }
    }

    if (PDFParseClass) {
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
    }
  } catch {
    // Strategy 1 fallback
  }

  // Strategy 2: Pure Deterministic CMap + Text Matrix PDF Parser
  try {
    const perfectText = parsePdfObjectsAndStreams(buffer);
    if (perfectText && perfectText.length >= 10) {
      return perfectText;
    }
  } catch (err: any) {
    console.error('Deterministic parsePdfObjectsAndStreams error:', err?.message || err);
  }

  // Strategy 3: Deep binary stream and hex/Tj/TJ decoder
  try {
    const fallbackText = extractTextFromPdfStreams(buffer);
    if (fallbackText && fallbackText.length >= 10) {
      return fallbackText;
    }
  } catch {
    // Strategy 3 failed
  }

  // Strategy 4: Search for ASCII/UTF-8 text chunks embedded in the raw buffer
  const rawTextChunks = extractRawReadableTextFromBuffer(buffer);
  if (rawTextChunks && rawTextChunks.length >= 25) {
    return rawTextChunks;
  }

  throw new CvExtractionError(
    "CV'den yeterli bilgi çıkarılamadı. Lütfen bilgileri manuel olarak tamamlayın.",
  );
}

/**
 * Deterministic PDF stream & layout parser. Handles font CMaps, text matrix positioning,
 * character spacing, and Turkish characters with 0 external dependencies.
 */
function parsePdfObjectsAndStreams(buffer: Buffer): string {
  const raw = buffer.toString('latin1');
  if (!raw.includes('%PDF-')) return '';

  const objMap = new Map<number, string>();
  const objRegex = /(\d+)\s+0\s+obj([\s\S]*?)endobj/g;
  let objMatch: RegExpExecArray | null;
  while ((objMatch = objRegex.exec(raw)) !== null) {
    const id = parseInt(objMatch[1], 10);
    const body = objMatch[2];
    objMap.set(id, body);
  }

  function getDecompressedStream(objBody: string): string {
    const streamIdx = objBody.indexOf('stream');
    if (streamIdx === -1) return '';
    let startIdx = streamIdx + 6;
    if (objBody.charCodeAt(startIdx) === 0x0D) startIdx++;
    if (objBody.charCodeAt(startIdx) === 0x0A) startIdx++;

    let endIdx = objBody.lastIndexOf('endstream');
    const lenMatch = objBody.match(/\/Length\s+(\d+)/);
    if (lenMatch) {
      const declaredLen = parseInt(lenMatch[1], 10);
      if (declaredLen > 0 && startIdx + declaredLen <= objBody.length) {
        endIdx = startIdx + declaredLen;
      }
    }
    if (endIdx <= startIdx) return '';

    const sbuf = Buffer.from(objBody.slice(startIdx, endIdx), 'latin1');
    let uncompressedBuf: Buffer;
    try {
      uncompressedBuf = zlib.inflateSync(sbuf);
    } catch {
      try {
        uncompressedBuf = zlib.inflateRawSync(sbuf);
      } catch {
        uncompressedBuf = sbuf;
      }
    }

    try {
      const utf8Str = uncompressedBuf.toString('utf8');
      if (!utf8Str.includes('\uFFFD')) {
        return utf8Str;
      }
      return uncompressedBuf.toString('latin1');
    } catch {
      return uncompressedBuf.toString('latin1');
    }
  }

  function parseCMap(str: string): Map<string, string> {
    const map = new Map<string, string>();
    const bfcharRegex = /(\d+)\s+beginbfchar([\s\S]*?)endbfchar/g;
    let m: RegExpExecArray | null;
    while ((m = bfcharRegex.exec(str)) !== null) {
      const section = m[2];
      const pairs = section.matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g);
      for (const p of pairs) {
        const src = p[1].toLowerCase().padStart(4, '0');
        const dstHex = p[2];
        let dstStr = '';
        for (let i = 0; i < dstHex.length; i += 4) {
          const code = parseInt(dstHex.slice(i, i + 4), 16);
          if (code > 0) dstStr += String.fromCharCode(code);
        }
        if (dstStr) map.set(src, dstStr);
      }
    }

    const bfrangeRegex = /(\d+)\s+beginbfrange([\s\S]*?)endbfrange/g;
    while ((m = bfrangeRegex.exec(str)) !== null) {
      const section = m[2];
      const lines = section.trim().split(/\r?\n/);
      for (const line of lines) {
        const rangeMatch = line.match(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/);
        if (rangeMatch) {
          const start = parseInt(rangeMatch[1], 16);
          const end = parseInt(rangeMatch[2], 16);
          let dst = parseInt(rangeMatch[3], 16);
          for (let code = start; code <= end; code++) {
            const hexKey = code.toString(16).toLowerCase().padStart(4, '0');
            map.set(hexKey, String.fromCharCode(dst));
            dst++;
          }
        } else {
          const arrMatch = line.match(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*\[([\s\S]*?)\]/);
          if (arrMatch) {
            const start = parseInt(arrMatch[1], 16);
            const end = parseInt(arrMatch[2], 16);
            const dsts = arrMatch[3].match(/<([0-9a-fA-F]+)>/g) || [];
            let idx = 0;
            for (let code = start; code <= end && idx < dsts.length; code++, idx++) {
              const hexKey = code.toString(16).toLowerCase().padStart(4, '0');
              const dstHex = dsts[idx].slice(1, -1);
              let dstStr = '';
              for (let i = 0; i < dstHex.length; i += 4) {
                const c = parseInt(dstHex.slice(i, i + 4), 16);
                if (c > 0) dstStr += String.fromCharCode(c);
              }
              if (dstStr) map.set(hexKey, dstStr);
            }
          }
        }
      }
    }
    return map;
  }

  const fontToCMap = new Map<number, Map<string, string>>();
  for (const [id, body] of objMap.entries()) {
    if (body.includes('/Type/Font') || body.includes('/Type /Font')) {
      const tuMatch = body.match(/\/ToUnicode\s+(\d+)\s+0\s+R/);
      if (tuMatch) {
        const cmapObjId = parseInt(tuMatch[1], 10);
        const cmapStream = getDecompressedStream(objMap.get(cmapObjId) || '');
        fontToCMap.set(id, parseCMap(cmapStream));
      }
    }
  }

  interface PageInfo {
    fontMap: Map<string, Map<string, string>>;
    contentIds: number[];
  }
  const pages: PageInfo[] = [];

  for (const [, body] of objMap.entries()) {
    if (body.includes('/Type/Page') || body.includes('/Type /Page')) {
      const fontMap = new Map<string, Map<string, string>>();
      const fontDictMatch = body.match(/\/Font\s*<<([^>]+)>>/);
      if (fontDictMatch) {
        const entries = fontDictMatch[1].match(/\/([a-zA-Z0-9]+)\s+(\d+)\s+0\s+R/g);
        for (const e of entries || []) {
          const em = e.match(/\/([a-zA-Z0-9]+)\s+(\d+)\s+0\s+R/);
          if (em) {
            const fontName = em[1];
            const fontObjId = parseInt(em[2], 10);
            const cmap = fontToCMap.get(fontObjId);
            if (cmap) fontMap.set(fontName, cmap);
          }
        }
      }

      const contentsMatch = body.match(/\/Contents\s+(\d+)\s+0\s+R/);
      const contentsArrayMatch = body.match(/\/Contents\s*\[([^\]]+)\]/);
      let contentIds: number[] = [];
      if (contentsMatch) {
        contentIds.push(parseInt(contentsMatch[1], 10));
      } else if (contentsArrayMatch) {
        const cMatches = contentsArrayMatch[1].match(/(\d+)\s+0\s+R/g);
        if (cMatches) {
          contentIds = cMatches.map((c) => parseInt(c.match(/\d+/)![0], 10));
        }
      }

      pages.push({ fontMap, contentIds });
    }
  }

  if (pages.length === 0) {
    const globalFontMap = new Map<string, Map<string, string>>();
    for (const [, body] of objMap.entries()) {
      const fontDictMatch = body.match(/\/Font\s*<<([^>]+)>>/);
      if (fontDictMatch) {
        const entries = fontDictMatch[1].match(/\/([a-zA-Z0-9]+)\s+(\d+)\s+0\s+R/g);
        for (const e of entries || []) {
          const em = e.match(/\/([a-zA-Z0-9]+)\s+(\d+)\s+0\s+R/);
          if (em) {
            const fontName = em[1];
            const fontObjId = parseInt(em[2], 10);
            const cmap = fontToCMap.get(fontObjId);
            if (cmap) globalFontMap.set(fontName, cmap);
          }
        }
      }
    }
    pages.push({ fontMap: globalFontMap, contentIds: Array.from(objMap.keys()) });
  }

  let fullText = '';

  for (const page of pages) {
    let pageText = '';
    let curY = 0;
    let lastY = -9999;

    for (const cId of page.contentIds) {
      const stream = getDecompressedStream(objMap.get(cId) || '');
      if (!stream || (!stream.includes('BT') && !stream.includes('Tj') && !stream.includes('TJ')))
        continue;

      const btRegex = /(?:^|\s)BT\s([\s\S]*?)\sET(?:\s|$)/g;
      let btm: RegExpExecArray | null;
      while ((btm = btRegex.exec(stream)) !== null) {
        const block = btm[1];
        let currentFont = page.fontMap.values().next().value || new Map<string, string>();

        const streamTokens = block.match(
          /\/[a-zA-Z0-9]+\s+[0-9.]+\s+Tf|[0-9.\-]+\s+[0-9.\-]+\s+[0-9.\-]+\s+[0-9.\-]+\s+[0-9.\-]+\s+[0-9.\-]+\s+Tm|[0-9.\-]+\s+[0-9.\-]+\s+Td|<[0-9a-fA-F\s]+>\s*Tj|\((?:\\.|[^()\\])*\)\s*Tj|\[([\s\S]*?)\]\s*TJ|T\*/g,
        );

        for (const tok of streamTokens || []) {
          if (tok === 'T*') {
            pageText = pageText.trimEnd() + '\n';
            curY -= 14;
            lastY = curY;
          } else if (tok.endsWith('Tf')) {
            const parts = tok.split(/\s+/);
            const fn = parts[0].slice(1);
            if (page.fontMap.has(fn)) currentFont = page.fontMap.get(fn)!;
          } else if (tok.endsWith('Tm')) {
            const nums = tok.split(/\s+/).map(Number);
            curY = Math.abs(nums[5] || 0);
            if (lastY !== -9999 && Math.abs(curY - lastY) > 8) {
              pageText = pageText.trimEnd() + '\n';
            }
            lastY = curY;
          } else if (tok.endsWith('Td')) {
            const nums = tok.split(/\s+/).map(Number);
            const dx = nums[0] || 0;
            const dy = nums[1] || 0;
            curY += dy;
            if (Math.abs(dy) > 8) {
              pageText = pageText.trimEnd() + '\n';
            } else if (dx > 18 && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
              pageText += ' ';
            }
            lastY = curY;
          } else if (tok.endsWith('Tj')) {
            const hexM = tok.match(/^<([0-9a-fA-F\s]+)>\s*Tj$/);
            if (hexM) {
              pageText += decodePdfHexWithCMap(hexM[1], currentFont);
            } else {
              const singleM = tok.match(/^\(((?:\\.|[^()\\])*)\)\s*Tj$/);
              if (singleM) {
                pageText += decodePdfString(singleM[1]);
              }
            }
          } else if (tok.startsWith('[') && tok.endsWith('TJ')) {
            const parts = tok.match(/\(((?:\\.|[^()\\])*)\)|<([0-9a-fA-F\s]+)>|([0-9.\-]+)/g);
            if (parts) {
              for (const part of parts) {
                if (part.startsWith('(') && part.endsWith(')')) {
                  pageText += decodePdfString(part.slice(1, -1), true);
                } else if (part.startsWith('<') && part.endsWith('>')) {
                  pageText += decodePdfHexWithCMap(part.slice(1, -1), currentFont, true);
                } else {
                  const num = Number(part);
                  if (num < -150 && !pageText.endsWith(' ') && !pageText.endsWith('\n')) {
                    pageText += ' ';
                  }
                }
              }
            }
          }
        }
      }
    }

    if (pageText.trim()) {
      fullText += pageText.trim() + '\n\n';
    }
  }

  const cleaned = fullText
    .replace(/([|–—,\/:])([a-zA-ZçğıöşüÇĞİÖŞÜ0-9])/g, '$1 $2')
    .replace(/([a-zA-ZçğıöşüÇĞİÖŞÜ0-9])([|–—,\/:])/g, '$1 $2')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return repairTurkishEncodingAndMojibake(cleaned);
}

/**
 * Fallback binary stream parser for PDF files.
 */
function extractTextFromPdfStreams(buffer: Buffer): string {
  const rawBinary = buffer.toString('binary');
  if (!rawBinary.startsWith('%PDF-') && !rawBinary.includes('%PDF-')) {
    return '';
  }

  const decompressedStreams: string[] = [];
  const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
  let match: RegExpExecArray | null;

  while ((match = streamRegex.exec(rawBinary)) !== null) {
    const streamContent = match[1];
    const streamBuffer = Buffer.from(streamContent, 'binary');

    let decompressed = '';
    try {
      const unzipped = zlib.inflateSync(streamBuffer);
      decompressed = decodeCp1254OrUtf8(unzipped);
    } catch {
      try {
        const unzippedRaw = zlib.inflateRawSync(streamBuffer);
        decompressed = decodeCp1254OrUtf8(unzippedRaw);
      } catch {
        decompressed = streamContent;
      }
    }

    decompressedStreams.push(decompressed);
  }

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

  if (fullText.length < 30) {
    const rawExtracted = parsePdfStreamTextWithCMap(rawBinary, cmap);
    if (rawExtracted.length > fullText.length) {
      fullText = rawExtracted;
    }
  }

  const cleaned = fullText
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return repairTurkishEncodingAndMojibake(cleaned);
}

function parseCMapIntoMap(cmapStr: string, map: Map<string, string>): void {
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

  const bfrangeRegex = /(\d+)\s+beginbfrange([\s\S]*?)endbfrange/g;
  while ((m = bfrangeRegex.exec(cmapStr)) !== null) {
    const lines = m[2].trim().split(/\r?\n/);
    for (const line of lines) {
      const parts = line.trim().match(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/);
      if (parts) {
        const start = parseInt(parts[1], 16);
        const end = parseInt(parts[2], 16);
        let dst = parseInt(parts[3] || '0', 16);
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

function parsePdfStreamTextWithCMap(stream: string, cmap: Map<string, string>): string {
  const result: string[] = [];
  const tjRegex = /(?:\((?:\\\(|\\\)|[^()])*\)\s*Tj|<[0-9a-fA-F\s]+>\s*Tj|\[([\s\S]*?)\]\s*TJ|'(?:[^\r\n]*)'|"(?:[^\r\n]*)")/g;
  let tjMatch: RegExpExecArray | null;

  while ((tjMatch = tjRegex.exec(stream)) !== null) {
    const rawCmd = tjMatch[0];

    const singleTj = rawCmd.match(/^\(((?:\\\(|\\\)|[^()])*)\)\s*Tj$/);
    if (singleTj) {
      result.push(decodePdfString(singleTj[1]));
      continue;
    }

    const hexTj = rawCmd.match(/^<([0-9a-fA-F\s]+)>\s*Tj$/);
    if (hexTj) {
      result.push(decodePdfHexWithCMap(hexTj[1], cmap));
      continue;
    }

    if (rawCmd.startsWith('[') && rawCmd.endsWith('TJ')) {
      const parts = rawCmd.match(/\(((?:\\.|[^()\\])*)\)|<([0-9a-fA-F\s]+)>/g);
      if (parts) {
        const decodedLine = parts
          .map((part) => {
            if (part.startsWith('(') && part.endsWith(')')) {
              return decodePdfString(part.slice(1, -1), true);
            }
            if (part.startsWith('<') && part.endsWith('>')) {
              return decodePdfHexWithCMap(part.slice(1, -1), cmap, true);
            }
            return '';
          })
          .join('');
        if (decodedLine.trim()) {
          result.push(decodedLine);
        }
      }
    }
  }

  return result.join(' ');
}

function decodePdfString(str: string, preserveWhitespace = false): string {
  const decoded = str
    .replace(/\\([0-7]{1,3})/g, (_, oct) => {
      const code = parseInt(oct, 8);
      if (code === 0o376 || code === 254) return 'ş';
      if (code === 0o336 || code === 222) return 'Ş';
      if (code === 0o360 || code === 240) return 'ğ';
      if (code === 0o320 || code === 208) return 'Ğ';
      if (code === 0o375 || code === 253) return 'ı';
      if (code === 0o335 || code === 221) return 'İ';
      if (code === 0o347 || code === 231) return 'ç';
      if (code === 0o307 || code === 199) return 'Ç';
      if (code === 0o366 || code === 246) return 'ö';
      if (code === 0o326 || code === 214) return 'Ö';
      if (code === 0o374 || code === 252) return 'ü';
      if (code === 0o334 || code === 220) return 'Ü';
      return String.fromCharCode(code);
    })
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\b/g, '\b')
    .replace(/\\f/g, '\f')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\');

  return repairTurkishEncodingAndMojibake(decoded, preserveWhitespace);
}

function decodePdfHexWithCMap(hex: string, cmap: Map<string, string>, preserveWhitespace = false): string {
  const cleanHex = hex.replace(/\s+/g, '');
  if (cleanHex.length === 0) return '';

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
      return repairTurkishEncodingAndMojibake(text, preserveWhitespace);
    }
  }

  const bytes = Buffer.from(cleanHex, 'hex');
  if (bytes.length >= 2 && bytes[0] === 0x00) {
    let text = '';
    for (let i = 0; i < bytes.length; i += 2) {
      const code = bytes.readUInt16BE(i);
      if (code > 0 && code < 65535) {
        text += String.fromCharCode(code);
      }
    }
    return repairTurkishEncodingAndMojibake(text, preserveWhitespace);
  }

  // Use CP1254/UTF-8 hybrid decoder to avoid \uFFFD replacement characters
  return decodeCp1254OrUtf8(bytes);
}

function extractRawReadableTextFromBuffer(buffer: Buffer): string {
  const str = decodeCp1254OrUtf8(buffer);
  if (str.includes('\n') && str.length >= 80) {
    return str.trim();
  }
  const words = str.match(/[a-zA-ZğüşıöçĞÜŞİÖÇ0-9@.-]{3,}/g);
  if (!words || words.length < 10) return '';
  return words.join(' ');
}

function extractTextFromRtf(buffer: Buffer): string {
  const raw = decodeCp1254OrUtf8(buffer);
  return raw
    .replace(/\\par[d]?\b/gi, '\n')
    .replace(/\\line\b/gi, '\n')
    .replace(/\\tab\b/gi, '\t')
    .replace(/\\'[0-9a-fA-F]{2}/g, (match) => {
      const code = parseInt(match.slice(2), 16);
      return String.fromCharCode(code);
    })
    .replace(/\\[a-zA-Z]+-?\d*\s?/g, '')
    .replace(/[{}]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Universal CV Text Extractor. Handles PDF, DOCX, RTF, and TXT files with strict validation.
 */
export async function extractCvText(
  fileBuffer: Buffer,
  fileName: string,
  mimeType?: string,
): Promise<ExtractedCvTextResult> {
  const detection = detectCvFormatFromBuffer(fileBuffer, fileName, mimeType);

  let text = '';
  if (detection.format === 'docx') {
    text = extractTextFromDocx(fileBuffer);
  } else if (detection.format === 'pdf') {
    text = await extractTextFromPdf(fileBuffer);
  } else if (detection.format === 'rtf') {
    text = extractTextFromRtf(fileBuffer);
  } else {
    text = decodeCp1254OrUtf8(fileBuffer).trim();
  }

  // Universal Turkish text repair & normalization
  text = repairTurkishEncodingAndMojibake(text);

  if (!text || text.trim().length < 30) {
    throw new CvExtractionError(
      "CV'den yeterli bilgi çıkarılamadı. Lütfen bilgileri manuel olarak tamamlayın veya farklı bir format yükleyin.",
    );
  }

  return {
    text,
    format: detection.format,
    charCount: text.length,
  };
}
