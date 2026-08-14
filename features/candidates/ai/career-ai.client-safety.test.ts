import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(__dirname, '../../..');

function read(rel: string): string {
  return readFileSync(path.join(ROOT, rel), 'utf8');
}

describe('career AI client safety', () => {
  it('does not embed OPENAI_API_KEY in client career AI files', () => {
    const files = [
      'features/candidates/hooks/use-career-ai.ts',
      'features/candidates/components/CareerManualAssist.tsx',
      'features/candidates/components/CareerAiAnalyzePanel.tsx',
      'features/candidates/components/CareerExperienceEditor.tsx',
      'features/listings/form/category-listing-form.tsx',
      'features/candidates/ai/career-ai-pii.ts',
      'features/candidates/ai/career-ai-persist.ts',
      'features/candidates/ai/career-ai-context.ts',
      'features/candidates/ai/career-ai-auto.ts',
      'features/candidates/ai/career-ai-deterministic-polish.ts',
      'features/candidates/taxonomy/occupational-context.ts',
      'features/candidates/taxonomy/occupational-suggestions.ts',
      'features/candidates/hooks/use-occupational-suggestions.ts',
      'features/candidates/components/CareerSkillsEditor.tsx',
    ];
    for (const file of files) {
      expect(read(file), file).not.toMatch(/OPENAI_API_KEY|NEXT_PUBLIC_OPENAI/);
    }
  });

  it('keeps the OpenAI client on the server module only', () => {
    expect(read('lib/openai/career-openai.ts')).toContain("import 'server-only'");
    expect(read('features/candidates/ai/career-ai.service.ts')).toContain("import 'server-only'");
    expect(read('features/candidates/ai/occupational-ai-rank.ts')).toContain("import 'server-only'");
    expect(read('lib/openai/career-openai.ts')).toContain('process.env.OPENAI_API_KEY');
    expect(read('features/candidates/hooks/use-career-ai.ts')).not.toContain('process.env.OPENAI_API_KEY');
    expect(read('features/candidates/hooks/use-occupational-suggestions.ts')).not.toContain('openaiJsonCompletion');
  });

  it('does not call OpenAI for taxonomy suggest', () => {
    const service = read('features/candidates/ai/career-ai.service.ts');
    const suggest = service.slice(
      service.indexOf('runCareerAiSuggest'),
      service.indexOf('export async function runCareerAiPolish'),
    );
    expect(suggest).toContain('matchTaxonomyOptions');
    expect(suggest).not.toContain('openaiJsonCompletion');
    expect(read('features/candidates/components/CareerManualAssist.tsx')).toContain('matchTaxonomyOptions');
    expect(read('features/candidates/components/CareerManualAssist.tsx')).not.toMatch(/action:\s*'suggest'/);
  });

  it('gates occupational AI behind deterministic confidence', () => {
    const rank = read('features/candidates/ai/occupational-ai-rank.ts');
    const fn = rank.slice(rank.indexOf('export async function runCareerAiOccupationalRank'));
    expect(fn.indexOf('needsAi')).toBeLessThan(fn.indexOf('openaiJsonCompletion'));
    expect(fn).toContain("source: 'taxonomy'");
  });

  it('does not write AI drafts until accept and keeps hire ungated from the seeker panel', () => {
    const panel = read('features/candidates/components/CareerAiAnalyzePanel.tsx');
    expect(panel).toContain('onAcceptSummary(text)');
    expect(panel).toContain('accepted: true');
    expect(panel).toContain("onStore(null)");
    expect(panel).not.toMatch(/onStore\(next\)/);
    expect(panel).toContain('decideCareerAiAutoAnalyze');
    expect(panel).not.toContain('AI ile kariyer özeti oluştur');
    const form = read('features/listings/form/category-listing-form.tsx');
    expect(form).toContain('categoryId === CATEGORY_IDS.isBul');
    expect(form).toContain('CareerAiAnalyzePanel');
    expect(form).toContain('acceptedCareerAiAnalysisOrNull');
  });

  it('skips OpenAI for short deterministic polish before the model call', () => {
    const service = read('features/candidates/ai/career-ai.service.ts');
    const polish = service.slice(
      service.indexOf('runCareerAiPolish'),
      service.indexOf('export async function runCareerAiAnalyze'),
    );
    expect(polish.indexOf('needsSemanticCareerPolish')).toBeLessThan(polish.indexOf('openaiJsonCompletion'));
    expect(read('features/candidates/components/CareerManualAssist.tsx')).toContain(
      'needsSemanticCareerPolish',
    );
  });
});
