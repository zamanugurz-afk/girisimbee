import type { AnalyzerResult, AnalyzerContext } from './opportunity-analyzer';

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(Math.max(n, min), max);
}

export class DescriptionAnalyzer {
  analyze(ctx: AnalyzerContext): AnalyzerResult {
    const desc = ctx.listing.description;
    const reasons: string[] = [];

    if (!desc || desc.trim().length === 0) {
      return { score: 20, reasons: ['No description provided — limited info to evaluate.'] };
    }

    let score = 35;
    const length = desc.trim().length;
    const words = desc.trim().split(/\s+/).filter(Boolean);

    if (length >= 200) {
      score += 25;
      reasons.push('Detailed description — seller provides thorough information.');
    } else if (length >= 80) {
      score += 12;
      reasons.push('Reasonable description length.');
    } else if (length < 30) {
      score -= 10;
      reasons.push('Very short description — may indicate low effort or hiding issues.');
    }

    const detailKeywords = ['garanti', 'fatura', 'kutu', 'şarj', 'kablo', 'kontrol', 'temiz', 'sorunsuz', 'az kullanıldı', 'yeni gibi'];
    const matched = detailKeywords.filter((kw) => desc.toLowerCase().includes(kw));
    if (matched.length >= 3) {
      score += 15;
      reasons.push(`Description mentions ${matched.length} key details: ${matched.slice(0, 3).join(', ')}.`);
    } else if (matched.length >= 1) {
      score += 5;
    }

    const redFlags = ['acil', 'telalı', 'morgan', ' TODAY', '!!!', 'PARÇA', 'arızalı'];
    const flagsFound = redFlags.filter((f) => desc.toLowerCase().includes(f.toLowerCase()));
    if (flagsFound.length > 0) {
      score -= 15;
      reasons.push(`Description contains red-flag terms: ${flagsFound.join(', ')}.`);
    }

    if (/^([A-ZÇĞİÖŞÜ\s]{10,})$/.test(desc.trim())) {
      score -= 8;
      reasons.push('All-caps description — unprofessional listing style.');
    }

    return { score: clamp(score), reasons };
  }
}
