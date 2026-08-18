import { describe, expect, it, vi } from 'vitest';
import * as openAiModule from '@/lib/openai/career-openai';
import { evaluateAiCallGate } from '@/features/candidates/cv/cv-ai-gate';
import { extractCvWithSingleAiCall } from '@/features/candidates/cv/cv-ai-extractor';
import type { AiCvExtractionPayload } from '@/features/candidates/cv/cv.types';

describe('CV Extraction 2.0 - AI Call Gating Tests', () => {
  it('skips AI call completely when deterministic extraction has sufficient fields (AI = 0 calls)', async () => {
    const aiSpy = vi.spyOn(openAiModule, 'openaiJsonCompletion');

    const completeDeterministicCv = `
Uğur Zaman
İstanbul

ÖZET
19 yıllık profesyonel kariyerimde bankacılık ve sigortacılık sektörlerinde satış ve operasyon yönetimi alanlarında uzmanlaştım.

İŞ DENEYİMİ
IGS Türkiye
Telemarketing ve Ticari Destek Operasyonları Müdürü
2025 - 2026
Çağrı Merkezi Satış Yönetimi, Yeni Müşteri Kazanımı.

EĞİTİM
Marmara Üniversitesi - Sermaye Piyasası ve Borsa (Yüksek Lisans) - 2022

YETKİNLİKLER
Satış Yönetimi, Operasyon Yönetimi, Ekip Yönetimi, Bütçe Yönetimi, MS Excel
`;

    const result = await extractCvWithSingleAiCall(completeDeterministicCv);

    // AI Call must be SKIPPED!
    expect(result._aiMetrics?.aiCalled).toBe(false);
    expect(result._aiMetrics?.aiSkipped).toBe(true);
    expect(result._aiMetrics?.inputTokens).toBe(0);
    expect(result._aiMetrics?.outputTokens).toBe(0);
    expect(aiSpy).not.toHaveBeenCalled();
  });

  it('evaluates AI call gate to true only when semantic gaps exist', () => {
    const incompletePayload: AiCvExtractionPayload = {
      experiences: [],
      roles: [],
      sectors: [],
      skills: [],
      tools: [],
      education: [],
      languages: [],
      certificates: [],
      locations: [],
      summary: '',
      ambiguousItems: [],
    };

    const decision = evaluateAiCallGate(incompletePayload, 'Bazı belirsiz CV metni');
    expect(decision.shouldCall).toBe(true);
    expect(decision.reason).toContain('Semantic enrichment needed');
  });

  it('guarantees maximum 1 AI call even for complex incomplete CVs', async () => {
    const aiSpy = vi.spyOn(openAiModule, 'openaiJsonCompletion').mockResolvedValueOnce({
      model: 'gpt-4o-mini',
      json: {
        roles: ['Yazılım Geliştirici'],
        skills: ['JavaScript', 'React'],
        summary: 'Deneyimli yazılım geliştirici.',
      },
    });

    const unstructuredCv = 'Karmaşık ve başlıksız metin: 5 yıldır web projeleri geliştiriyorum.';
    const result = await extractCvWithSingleAiCall(unstructuredCv);

    expect(result._aiMetrics?.aiCalled).toBe(true);
    expect(aiSpy).toHaveBeenCalledTimes(1); // STRICT RULE: Never > 1
  });
});
