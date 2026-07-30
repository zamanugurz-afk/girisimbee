import type { AnalyzerResult, AnalyzerContext } from './opportunity-analyzer';

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(Math.max(n, min), max);
}

export class ImageAnalyzer {
  analyze(ctx: AnalyzerContext): AnalyzerResult {
    const images = ctx.listing.image_urls;
    const reasons: string[] = [];

    if (!images || images.length === 0) {
      return { score: 25, reasons: ['No images provided — cannot verify product condition visually.'] };
    }

    let score = 30;
    const count = images.length;

    if (count >= 5) {
      score += 30;
      reasons.push(`${count} images provided — comprehensive visual coverage.`);
    } else if (count >= 3) {
      score += 18;
      reasons.push(`${count} images — decent visual evidence.`);
    } else if (count >= 1) {
      score += 8;
      reasons.push('Single image — limited visual verification.');
    }

    const hasHighRes = images.some((url) => {
      const lower = url.toLowerCase();
      return lower.includes('1000') || lower.includes('1200') || lower.includes('original') || lower.includes('full');
    });
    if (hasHighRes) {
      score += 5;
    }

    const allSameDomain = images.every((url) => {
      try {
        const host = new URL(url).hostname;
        return host.includes(ctx.listing.id.split('-')[0] ?? '');
      } catch {
        return false;
      }
    });
    if (allSameDomain && count > 1) {
      score += 3;
    }

    return { score: clamp(score), reasons };
  }
}
