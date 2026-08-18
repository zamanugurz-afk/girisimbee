import { TURKISH_CITIES } from '@/features/shared/constants/turkish-cities';
import {
  CAREER_LANGUAGE_OPTIONS,
  CERTIFICATE_OPTIONS,
} from '@/features/candidates/taxonomy/career-taxonomy';
import { CAREER_EDUCATION_LEVELS } from '@/features/listings/config/listing-field-options';
import type { DeterministicCvSignals } from '@/features/candidates/cv/cv.types';

const YEAR_RANGE_REGEX = /(?:(?:19|20)\d{2})\s*(?:[-–—/]|ila|ile|to)\s*(?:(?:19|20)\d{2}|günümüz|devam|present|current|halen)/gi;

const SINGLE_YEAR_REGEX = /\b(19\d{2}|20[0-3]\d)\b/g;

/**
 * Deterministically extracts signals from CV text without calling any AI service.
 */
export function extractDeterministicCvSignals(text: string): DeterministicCvSignals {
  if (!text) {
    return {
      detectedCities: [],
      dateRanges: [],
      languages: [],
      certificates: [],
      educationDegrees: [],
    };
  }

  const lowerText = text.toLowerCase();

  // 1. Detect Turkish Cities
  const detectedCities: string[] = [];
  for (const city of TURKISH_CITIES) {
    const cityLower = city.toLowerCase();
    // Word boundary check
    const regex = new RegExp(`\\b${cityLower}\\b`, 'i');
    if (regex.test(lowerText)) {
      detectedCities.push(city);
    }
  }

  // 2. Detect Date Ranges
  const dateRanges: Array<{ startYear?: number; endYear?: number; raw: string; isCurrent?: boolean }> = [];
  const rangeMatches = text.match(YEAR_RANGE_REGEX) || [];
  for (const match of rangeMatches) {
    const years = match.match(SINGLE_YEAR_REGEX);
    const isCurrent = /günümüz|devam|present|current|halen/i.test(match);
    if (years && years.length >= 2) {
      dateRanges.push({
        startYear: parseInt(years[0], 10),
        endYear: parseInt(years[1], 10),
        raw: match.trim(),
        isCurrent: false,
      });
    } else if (years && years.length === 1 && isCurrent) {
      dateRanges.push({
        startYear: parseInt(years[0], 10),
        endYear: new Date().getFullYear(),
        raw: match.trim(),
        isCurrent: true,
      });
    }
  }

  // 3. Detect Known Languages
  const languages: string[] = [];
  for (const lang of CAREER_LANGUAGE_OPTIONS) {
    const langLower = lang.toLowerCase();
    const regex = new RegExp(`\\b${langLower}\\b`, 'i');
    if (regex.test(lowerText)) {
      languages.push(lang);
    }
  }

  // 4. Detect Known Certificates
  const certificates: string[] = [];
  for (const cert of CERTIFICATE_OPTIONS) {
    const certLower = cert.toLowerCase();
    if (lowerText.includes(certLower)) {
      certificates.push(cert);
    }
  }

  // 5. Detect Education Levels
  const educationDegrees: string[] = [];
  for (const edu of CAREER_EDUCATION_LEVELS) {
    const eduLower = edu.toLowerCase();
    if (lowerText.includes(eduLower)) {
      educationDegrees.push(edu);
    }
  }

  return {
    detectedCities: [...new Set(detectedCities)],
    dateRanges,
    languages: [...new Set(languages)],
    certificates: [...new Set(certificates)],
    educationDegrees: [...new Set(educationDegrees)],
  };
}
