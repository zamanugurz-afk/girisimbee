export type SupportedCvFormat = 'pdf' | 'docx' | 'txt' | 'rtf';

export class CvExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CvExtractionError';
  }
}

export interface FormatDetectionResult {
  format: SupportedCvFormat;
  mimeType: string;
  isEncrypted?: boolean;
  isValidSignature: boolean;
  fileSize: number;
}

export const MAX_CV_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Detects CV format by inspecting binary magic byte signatures and content headers.
 */
export function detectCvFormatFromBuffer(
  buffer: Buffer,
  fileName?: string,
  declaredMimeType?: string,
): FormatDetectionResult {
  const fileSize = buffer ? buffer.length : 0;

  if (!buffer || fileSize === 0) {
    throw new CvExtractionError('Yüklenen dosya boş veya okunamıyor.');
  }

  if (fileSize > MAX_CV_FILE_SIZE_BYTES) {
    throw new CvExtractionError(
      `Dosya boyutu çok büyük. Maksimum dosya boyutu 5 MB olmalıdır (Yüklenen: ${(fileSize / 1024 / 1024).toFixed(1)} MB).`,
    );
  }

  // 1. Check PDF Magic Bytes: "%PDF-" (0x25, 0x50, 0x44, 0x46)
  if (
    buffer.length >= 5 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  ) {
    const isEncrypted = buffer.includes('/Encrypt');
    return {
      format: 'pdf',
      mimeType: 'application/pdf',
      isEncrypted,
      isValidSignature: true,
      fileSize,
    };
  }

  // 2. Check DOCX / ZIP Magic Bytes: "PK\x03\x04" (0x50, 0x4b, 0x03, 0x04)
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04
  ) {
    const rawZipString = buffer.toString('latin1', 0, Math.min(buffer.length, 4096));
    const isWordPackage =
      rawZipString.includes('[Content_Types].xml') ||
      rawZipString.includes('word/') ||
      Boolean(fileName && /\.docx$/i.test(fileName));

    return {
      format: 'docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      isValidSignature: Boolean(isWordPackage),
      fileSize,
    };
  }

  // 3. Check RTF Magic Bytes: "{\rtf" (0x7B, 0x5C, 0x72, 0x74, 0x66)
  if (
    buffer.length >= 5 &&
    buffer[0] === 0x7b &&
    buffer[1] === 0x5c &&
    buffer[2] === 0x72 &&
    buffer[3] === 0x74 &&
    buffer[4] === 0x66
  ) {
    return {
      format: 'rtf',
      mimeType: 'application/rtf',
      isValidSignature: true,
      fileSize,
    };
  }

  // 4. Fallback based on fileName or textual content
  const lowerName = (fileName || '').toLowerCase();
  if (lowerName.endsWith('.pdf') || declaredMimeType === 'application/pdf') {
    return {
      format: 'pdf',
      mimeType: 'application/pdf',
      isValidSignature: false,
      fileSize,
    };
  }

  if (lowerName.endsWith('.docx') || declaredMimeType?.includes('word')) {
    return {
      format: 'docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      isValidSignature: false,
      fileSize,
    };
  }

  if (lowerName.endsWith('.rtf') || declaredMimeType === 'application/rtf' || declaredMimeType === 'text/rtf') {
    return {
      format: 'rtf',
      mimeType: 'application/rtf',
      isValidSignature: false,
      fileSize,
    };
  }

  // 5. Default to plain text
  return {
    format: 'txt',
    mimeType: 'text/plain',
    isValidSignature: true,
    fileSize,
  };
}
