import type { CvDocumentBlock, CvDocumentModel, CvSectionType } from './cv-document-model';
import { normalizeTrUniversal } from './cv-universal-normalizer';

export interface ClassifiedSection {
  type: CvSectionType;
  headerText: string;
  headerBlock?: CvDocumentBlock;
  blocks: CvDocumentBlock[];
}

// Multilingual Section Patterns (Turkish + English + Standard International)
const SECTION_HEADER_PATTERNS: Array<{
  type: CvSectionType;
  pattern: RegExp;
  negativePattern?: RegExp;
}> = [
  {
    type: 'experience',
    pattern:
      /^(is\s*deneyimi|is\s*deneyimleri|is\s*tecrubesi|is\s*tecrubeleri|deneyimler?|tecrubeler?|calisma\s*gecmisi|mesleki\s*deneyim|professional\s*experience|work\s*experience|employment\s*history|career\s*history|experiences?|work\s*history)$/i,
    negativePattern: /^(yillik|aylik|toplam\s*deneyim|yil\s*deneyim)$/i,
  },
  {
    type: 'education',
    pattern:
      /^(egitim|egitim\s*bilgileri|egitim\s*durumu|egitim\s*ve\s*nitelikler|ogrenim\s*durumu|ogrenim|akademik\s*gecmis|education|academic\s*background|educational\s*qualifications|education\s*and\s*training|studies)$/i,
  },
  {
    type: 'skills',
    pattern:
      /^(yetkinlikler?|beceriler?|uzmanlik\s*alanlari|teknik\s*beceriler?|teknik\s*yetkinlikler?|mesleki\s*beceriler?|programlama\s*dilleri|kullanilan\s*araclar|araclar|skills|technical\s*skills|core\s*competencies|professional\s*skills|key\s*skills|hard\s*skills|soft\s*skills|tools\s*(&|ve)\s*technologies|technologies)$/i,
  },
  {
    type: 'languages',
    pattern:
      /^(yabanci\s*diller?|diller?|lisan|lisan\s*bilgisi|languages?|foreign\s*languages?|language\s*skills|language\s*proficiency)$/i,
  },
  {
    type: 'certifications',
    pattern:
      /^(sertifikalar?|sertifika\s*ve\s*lisanslar|sertifikalar\s*ve\s*kurslar|kurslar\s*ve\s*sertifikalar|kurslar|egitimler\s*ve\s*sertifikalar|certifications?|certificates?|licenses?|courses\s*(&|ve)\s*certifications?|accreditations?)$/i,
  },
  {
    type: 'summary',
    pattern:
      /^(ozet|hakkimda|profil|profesyonel\s*ozet|kariyer\s*ozeti|kisisel\s*ozet|kariyer\s*hedefi|summary|professional\s*summary|about\s*me|profile|executive\s*summary|career\s*objective|personal\s*statement)$/i,
  },
  {
    type: 'projects',
    pattern:
      /^(projeler?|onemli\s*projeler|kisisel\s*projeler|projects?|key\s*projects|personal\s*projects|portfolio)$/i,
  },
  {
    type: 'references',
    pattern: /^(referanslar?|references?|recommendations?)$/i,
  },
  {
    type: 'contact',
    pattern:
      /^(iletisim|iletisim\s*bilgileri|kisisel\s*bilgiler|contact|contact\s*info|contact\s*details|personal\s*details)$/i,
  },
];

/**
 * Checks if a block represents a clean Section Header.
 */
export function isSectionHeaderBlock(
  block: CvDocumentBlock,
): { isHeader: boolean; type?: CvSectionType } {
  const text = block.text.trim();
  if (!text || text.length > 50) return { isHeader: false };

  // Strip leading punctuation / bullet symbols
  const clean = normalizeTrUniversal(text)
    .replace(/^[\s•\-\*#|:–—\d\.\)]+/, '')
    .replace(/[:\-–—]+$/, '')
    .trim();

  if (!clean || clean.length < 2) return { isHeader: false };

  for (const item of SECTION_HEADER_PATTERNS) {
    if (item.negativePattern && item.negativePattern.test(clean)) continue;
    if (item.pattern.test(clean)) {
      return { isHeader: true, type: item.type };
    }
  }

  return { isHeader: false };
}

/**
 * Classifies document blocks into structured sections with spatial boundary awareness.
 */
export function classifyDocumentSections(docModel: CvDocumentModel): ClassifiedSection[] {
  const sections: ClassifiedSection[] = [];
  let currentSection: ClassifiedSection = {
    type: 'header',
    headerText: 'Başlık / Profil',
    blocks: [],
  };
  sections.push(currentSection);

  for (const page of docModel.pages) {
    for (const block of page.blocks) {
      const headerCheck = isSectionHeaderBlock(block);

      if (headerCheck.isHeader && headerCheck.type) {
        block.type = 'heading';
        block.sectionType = headerCheck.type;

        // Start new section
        currentSection = {
          type: headerCheck.type,
          headerText: block.text,
          headerBlock: block,
          blocks: [block],
        };
        sections.push(currentSection);
      } else {
        block.sectionType = currentSection.type;
        currentSection.blocks.push(block);
      }
    }
  }

  // Filter out completely empty sections
  return sections.filter((s) => s.blocks.length > 0);
}

/**
 * Extracts pure text for a specific section type from classified sections.
 */
export function getSectionText(
  sections: ClassifiedSection[],
  type: CvSectionType,
): string {
  const matching = sections.filter((s) => s.type === type);
  if (matching.length === 0) return '';

  return matching
    .flatMap((s) => s.blocks.map((b) => b.text))
    .join('\n')
    .trim();
}
