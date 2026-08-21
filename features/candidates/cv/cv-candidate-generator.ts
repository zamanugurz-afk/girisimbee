/**
 * Universal Candidate Token Generator & In-line Deconstructor (CV Extraction 4.0)
 * Breaks down unstructured lines into typed candidate tokens using context-aware splitting.
 */

import { extractDateAnchor } from './cv-date-anchor-engine';
import { classifyEntityToken, normalizeTrForEntity } from './cv-entity-classifier';
import type { CandidateToken, CandidateTokenType } from './cv-unstructured-types';

export interface InLineDeconstructedToken {
  type: CandidateTokenType;
  rawText: string;
  normalized: string;
  metadata?: Record<string, any>;
  confidence: number;
}

/**
 * Smartly splits a composite line into segments without breaking words like TCP/IP, Node.js, R&D.
 */
export function splitCompositeLine(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed) return [];

  // Don't split sentences that are descriptions or bullet responsibilities
  if (trimmed.length > 120 || /^[\s•\-\*]\s+[A-ZÇĞİÖŞÜ].{60,}/.test(trimmed)) {
    return [trimmed];
  }

  // Check common explicit delimiters: '|', ' - ', ' – ', ' — ', ' @ ', ' / '
  if (trimmed.includes('|')) {
    return trimmed.split('|').map((s) => s.trim()).filter(Boolean);
  }

  if (trimmed.includes(' @ ')) {
    return trimmed.split(' @ ').map((s) => s.trim()).filter(Boolean);
  }

  if (trimmed.includes(' – ') || trimmed.includes(' — ')) {
    return trimmed.split(/\s+[–—]\s+/).map((s) => s.trim()).filter(Boolean);
  }

  // Dash separator: Only split when surrounded by spaces or between words (avoid phone numbers and date ranges like 2020-2024)
  if (/\s+-\s+/.test(trimmed)) {
    const parts = trimmed.split(/\s+-\s+/).map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) return parts;
  }

  // Slash separator: Avoid URLs (http://) and dates (01/2020)
  if (/\s+\/\s+/.test(trimmed) && !trimmed.includes('http')) {
    return trimmed.split(/\s+\/\s+/).map((s) => s.trim()).filter(Boolean);
  }

  return [trimmed];
}

/**
 * Generates all candidate tokens from an unstructured CV text document.
 */
export function generateCandidateTokens(text: string): CandidateToken[] {
  if (!text || text.trim().length === 0) return [];

  const rawLines = text.split(/\r?\n/);
  const candidateTokens: CandidateToken[] = [];
  let tokenIdCounter = 1;

  for (let lineIdx = 0; lineIdx < rawLines.length; lineIdx++) {
    const rawLine = rawLines[lineIdx].trim();
    if (!rawLine) continue;

    // Check if line contains a date range anchor
    const dateAnchor = extractDateAnchor(rawLine);

    // Split line into constituent segments
    const segments = splitCompositeLine(rawLine);

    for (const seg of segments) {
      // 1. Check if the segment itself is a pure date anchor
      const segDate = extractDateAnchor(seg);
      if (segDate && segDate.startYear) {
        candidateTokens.push({
          id: `tok_${tokenIdCounter++}`,
          type: 'DATE_RANGE',
          text: seg,
          normalized: normalizeTrForEntity(seg),
          lineIndex: lineIdx,
          confidence: segDate.confidence,
          metadata: { dateAnchor: segDate },
        });
        continue;
      }

      // 2. Classify entity
      const classified = classifyEntityToken(seg, lineIdx);
      classified.id = `tok_${tokenIdCounter++}`;

      // If segment is not date, but line had a date anchor, attach date info as metadata
      if (dateAnchor && dateAnchor.startYear && classified.type !== 'DATE_RANGE') {
        classified.metadata = {
          ...classified.metadata,
          attachedDateAnchor: dateAnchor,
        };
      }

      candidateTokens.push(classified);
    }
  }

  return candidateTokens;
}
