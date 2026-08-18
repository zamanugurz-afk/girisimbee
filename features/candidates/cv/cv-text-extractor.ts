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
 * Extracts plain text from DOCX buffer by reading `word/document.xml`
 * from the zip package.
 */
export function extractTextFromDocx(buffer: Buffer): string {
  try {
    // A docx is a zip file. We search for the local file header of word/document.xml
    // Local file header signature: 0x04034b50
    let offset = 0;
    let documentXmlBuffer: Buffer | null = null;

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

        if (fileName === 'word/document.xml') {
          const compressedData = buffer.subarray(dataStart, dataStart + compressedSize);
          if (compressionMethod === 8) {
            // Deflate
            documentXmlBuffer = zlib.inflateRawSync(compressedData);
          } else if (compressionMethod === 0) {
            // Stored (no compression)
            documentXmlBuffer = compressedData;
          }
          break;
        }

        offset = dataStart + compressedSize;
      } else {
        offset++;
      }
    }

    if (!documentXmlBuffer) {
      // Fallback: search for XML fragments in raw buffer
      const rawString = buffer.toString('binary');
      const xmlMatch = rawString.match(/<w:document[\s\S]*?<\/w:document>/);
      if (xmlMatch) {
        documentXmlBuffer = Buffer.from(xmlMatch[0], 'binary');
      }
    }

    if (!documentXmlBuffer) {
      throw new CvExtractionError('DOCX belgesi okunamadı veya bozuk.');
    }

    const xml = documentXmlBuffer.toString('utf8');

    // Parse XML tags: <w:p> (paragraph), <w:tr> (table row), <w:t> (text)
    const cleanedText = xml
      .replace(/<w:p[^>]*>/g, '\n')
      .replace(/<w:tr[^>]*>/g, '\n')
      .replace(/<w:tc[^>]*>/g, ' \t ')
      .replace(/<w:tab[^>]*\/>/g, ' ')
      .replace(/<w:br[^>]*\/>/g, '\n')
      .replace(/<w:t[^>]*>(.*?)<\/w:t>/g, '$1')
      .replace(/<[^>]+>/g, '') // remove all other XML tags
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
 * Extracts plain text from PDF buffer by parsing PDF streams, text blocks, and Tj/TJ operators.
 */
export function extractTextFromPdf(buffer: Buffer): string {
  try {
    const rawBinary = buffer.toString('binary');
    if (!rawBinary.startsWith('%PDF-') && !rawBinary.includes('%PDF-')) {
      throw new CvExtractionError(
        "CV'den yeterli bilgi çıkarılamadı. Lütfen bilgileri manuel olarak tamamlayın.",
      );
    }

    const textPieces: string[] = [];

    // 1. Locate all stream objects
    const streamRegex = /stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g;
    let match: RegExpExecArray | null;

    while ((match = streamRegex.exec(rawBinary)) !== null) {
      const streamContent = match[1];
      const streamBuffer = Buffer.from(streamContent, 'binary');

      let decompressed = '';
      try {
        const unzipped = zlib.inflateSync(streamBuffer);
        decompressed = unzipped.toString('utf8');
      } catch {
        try {
          const unzippedRaw = zlib.inflateRawSync(streamBuffer);
          decompressed = unzippedRaw.toString('utf8');
        } catch {
          decompressed = streamContent;
        }
      }

      // Extract PDF text commands: (...) Tj, [...] TJ, ' (single quote), " (double quote)
      const extractedFromStream = parsePdfStreamText(decompressed);
      if (extractedFromStream) {
        textPieces.push(extractedFromStream);
      }
    }

    let fullText = textPieces.join('\n\n').trim();

    // Fallback: If streams didn't yield enough text, parse text outside streams
    if (fullText.length < 30) {
      const rawExtracted = parsePdfStreamText(rawBinary);
      if (rawExtracted.length > fullText.length) {
        fullText = rawExtracted;
      }
    }

    // Normalize spacing and Turkish characters
    const cleaned = fullText
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!cleaned || cleaned.length < 10) {
      throw new CvExtractionError(
        "CV'den yeterli bilgi çıkarılamadı. Lütfen bilgileri manuel olarak tamamlayın.",
      );
    }

    return cleaned;
  } catch (err: any) {
    if (err instanceof CvExtractionError) throw err;
    throw new CvExtractionError(
      "CV'den yeterli bilgi çıkarılamadı. Lütfen bilgileri manuel olarak tamamlayın.",
    );
  }
}

/**
 * Parses PDF operators like `(Hello) Tj`, `[(H) 10 (ello)] TJ`, `ET`, `BT`, `T*`.
 */
function parsePdfStreamText(stream: string): string {
  const result: string[] = [];

  // Match (Text) Tj or [ (Text1) -10 (Text2) ] TJ
  const tjRegex = /(?:\((?:\\\(|\\\)|[^()])*\)\s*Tj|\[(?:[^\]]*)\]\s*TJ|'(?:[^\r\n]*)'|"(?:[^\r\n]*)")/g;
  let tjMatch: RegExpExecArray | null;

  while ((tjMatch = tjRegex.exec(stream)) !== null) {
    const rawCmd = tjMatch[0];

    // Case 1: Simple (Text) Tj
    const singleTj = rawCmd.match(/^\(((?:\\\(|\\\)|[^()])*)\)\s*Tj$/);
    if (singleTj) {
      result.push(decodePdfString(singleTj[1]));
      continue;
    }

    // Case 2: Array [(Text1) 120 (Text2)] TJ
    if (rawCmd.startsWith('[') && rawCmd.endsWith('TJ')) {
      const strParts = rawCmd.match(/\(((?:\\\(|\\\)|[^()])*)\)/g);
      if (strParts) {
        const decodedLine = strParts
          .map((s) => decodePdfString(s.slice(1, -1)))
          .join('');
        result.push(decodedLine);
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
    text = extractTextFromPdf(fileBuffer);
  } else if (lowerName.endsWith('.txt') || lowerMime.includes('text/plain')) {
    format = 'txt';
    text = fileBuffer.toString('utf8').trim();
  } else {
    // Try detection via buffer header
    if (fileBuffer.subarray(0, 4).toString('utf8') === '%PDF') {
      format = 'pdf';
      text = extractTextFromPdf(fileBuffer);
    } else if (fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4b) {
      format = 'docx';
      text = extractTextFromDocx(fileBuffer);
    } else {
      throw new CvExtractionError(
        'Desteklenmeyen dosya formatı. Lütfen PDF veya DOCX formatında CV yükleyin.',
      );
    }
  }

  if (!text || text.trim().length < 15) {
    throw new CvExtractionError(
      "CV'den yeterli bilgi çıkarılamadı. Lütfen bilgileri manuel olarak tamamlayın.",
    );
  }

  return {
    text,
    format,
    charCount: text.length,
  };
}
