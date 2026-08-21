import type { CvDocumentBlock } from './cv-document-model';
import { CvUnifiedTaxonomy } from './cv-unified-taxonomy';
import { normalizeTrUniversal } from './cv-universal-normalizer';

/**
 * Resolves skills, technical proficiencies, and software tools from spatial blocks or plain text.
 */
export function resolveSkillBlocks(
  blocksOrText: CvDocumentBlock[] | string,
): {
  professionalSkills: string[];
  technicalSkills: string[];
  tools: string[];
  allSkills: string[];
} {
  const lines =
    typeof blocksOrText === 'string'
      ? blocksOrText.split(/\r?\n/)
      : blocksOrText.map((b) => b.text.trim()).filter(Boolean);

  const rawSkillTokens: string[] = [];

  for (const line of lines) {
    const cleanLine = line.replace(/^[•\-\*#|:–—\d\.\)]+/, '').trim();
    if (!cleanLine || cleanLine.length > 80) continue;

    // Check if line is comma, pipe, slash, or bullet separated
    if (cleanLine.includes(',') || cleanLine.includes('•') || cleanLine.includes('|') || cleanLine.includes(' - ')) {
      const parts = cleanLine.split(/[,•|]|\s+-\s+/).map((p) => p.trim()).filter(Boolean);
      for (const p of parts) {
        if (p.length >= 2 && p.length <= 40) {
          rawSkillTokens.push(p);
        }
      }
    } else {
      rawSkillTokens.push(cleanLine);
    }
  }

  const { professionalSkills, technicalSkills, tools } =
    CvUnifiedTaxonomy.resolveSkillsAndTools(rawSkillTokens);

  const allSkills = Array.from(
    new Set([...professionalSkills, ...technicalSkills, ...tools]),
  );

  return {
    professionalSkills,
    technicalSkills,
    tools,
    allSkills,
  };
}
