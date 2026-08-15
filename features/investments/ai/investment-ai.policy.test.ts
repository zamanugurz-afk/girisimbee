import { beforeEach, describe, expect, it } from 'vitest';
import { hasUngroundedNumbers } from '@/features/candidates/ai/career-ai-grounding';
import { parseInvestmentAiAnalysis } from '@/features/investments/ai/investment-ai-parse';
import {
  acceptedInvestmentAiAnalysisOrNull,
  shouldReuseInvestmentAiFingerprint,
} from '@/features/investments/ai/investment-ai-persist';
import {
  compactInvestmentAiContext,
  investmentAiFingerprint,
} from '@/features/investments/ai/investment-ai-context';
import {
  getInvestmentAiCache,
  resetInvestmentAiCacheForTests,
  setInvestmentAiCache,
} from '@/features/investments/ai/investment-ai-cache';
import { buildInvestmentContext } from '@/features/investments/lib/investment-context';
import { toInvestmentAiSafeContext } from '@/features/investments/ai/investment-ai-context';
import { buildInvestmentCardData } from '@/features/investments/lib/investment-card';

const baseContext = compactInvestmentAiContext(
  toInvestmentAiSafeContext(
    buildInvestmentContext({
      title: 'RevSaaS',
      city: 'İstanbul',
      customFields: {
        sector: 'SaaS / Yazılım',
        stage: 'MVP aşaması',
        productStatus: 'MVP',
        businessModel: ['SaaS'],
        targetCustomer: ['B2B'],
        problem: 'Raporlama yavaş',
        solution: 'Otomatik rapor',
        differentiation: 'Hazır şablon',
        revenueStatus: 'İlk gelir',
        tractionStatus: 'İlk müşteriler',
        mrr: '120000',
        activeCustomers: '14',
        investmentAmount: '2.500.000 - 5.000.000 TL',
        equityOffered: 10,
        useOfFunds: ['Ürün geliştirme', 'Satış'],
      },
    }),
  ),
);

describe('investment AI policy', () => {
  beforeEach(() => {
    resetInvestmentAiCacheForTests();
  });

  it('accepts grounded analysis that repeats input numbers', () => {
    const evidence = JSON.stringify(baseContext);
    const parsed = parseInvestmentAiAnalysis(
      {
        professionalInvestmentSummary:
          'RevSaaS MVP aşamasında 14 müşteri ve 120000 MRR ile 2.500.000 - 5.000.000 TL arıyor; 10% hisse teklif ediyor.',
        shortInvestmentSummary: '14 müşterili SaaS, 120000 MRR.',
        investmentHighlights: ['14 müşteri', '120000 MRR'],
        businessModelSummary: 'SaaS',
        fundingUseSummary: 'Ürün geliştirme ve Satış',
        strengths: ['İlk gelir'],
        profileGaps: ['Değerleme yok'],
        improvementSuggestions: ['Ekip bilgisi ekleyin'],
      },
      evidence,
    );
    expect(parsed?.professionalInvestmentSummary).toContain('120000');
    expect(parsed?.professionalInvestmentSummary).toContain('14');
  });

  it('treats 10%, 10 and yüzde 10 as the same grounded equity claim', () => {
    const evidence = JSON.stringify(baseContext);
    expect(hasUngroundedNumbers('10 hisse teklif ediyor', evidence)).toBe(false);
    expect(hasUngroundedNumbers('yüzde 10 hisse teklif ediyor', evidence)).toBe(false);
    const parsed = parseInvestmentAiAnalysis(
      {
        professionalInvestmentSummary:
          'RevSaaS 14 müşteri ve 120000 MRR ile yatırım arıyor; 10 hisse teklif ediyor.',
        shortInvestmentSummary: '14 müşterili SaaS.',
        investmentHighlights: [],
        businessModelSummary: 'SaaS',
        fundingUseSummary: 'Ürün geliştirme',
        strengths: [],
        profileGaps: [],
        improvementSuggestions: [],
      },
      evidence,
    );
    expect(parsed?.professionalInvestmentSummary).toContain('10 hisse');
  });

  it('rejects invented numbers without a second AI call', () => {
    const evidence = JSON.stringify(baseContext);
    const parsed = parseInvestmentAiAnalysis(
      {
        professionalInvestmentSummary: '100 müşteri ve 500000 MRR ile %40 büyüyor.',
        shortInvestmentSummary: '10 kişilik ekip',
        investmentHighlights: [],
        businessModelSummary: '',
        fundingUseSummary: '',
        strengths: [],
        profileGaps: [],
        improvementSuggestions: [],
      },
      evidence,
    );
    expect(parsed).toBeNull();
    expect(hasUngroundedNumbers('100 müşteri', evidence)).toBe(true);
  });

  it('does not persist unaccepted analysis', () => {
    expect(
      acceptedInvestmentAiAnalysisOrNull({
        fingerprint: 'abc',
        professionalInvestmentSummary: 'Taslak',
        accepted: false,
      }),
    ).toBeNull();
    expect(
      acceptedInvestmentAiAnalysisOrNull({
        fingerprint: 'abc',
        professionalInvestmentSummary: 'Taslak',
        accepted: true,
      })?.accepted,
    ).toBe(true);
  });

  it('reuses the same fingerprint from cache', () => {
    const fingerprint = investmentAiFingerprint(baseContext);
    setInvestmentAiCache(fingerprint, { action: 'analyze', source: 'ai', fingerprint });
    expect(getInvestmentAiCache(fingerprint)).toMatchObject({ source: 'ai', fingerprint });
    expect(shouldReuseInvestmentAiFingerprint(fingerprint, fingerprint)).toBe(true);
    const again = investmentAiFingerprint(baseContext);
    expect(again).toBe(fingerprint);
  });

  it('changes fingerprint when funding changes', () => {
    const next = compactInvestmentAiContext({
      ...baseContext,
      fundingAmount: '10.000.000 TL ve üzeri',
    });
    expect(investmentAiFingerprint(next)).not.toBe(investmentAiFingerprint(baseContext));
  });

  it('falls back to manual/deterministic summary when AI is not accepted', () => {
    const card = buildInvestmentCardData({
      context: buildInvestmentContext({
        title: 'RevSaaS',
        city: 'İstanbul',
        customFields: {
          sector: 'SaaS / Yazılım',
          stage: 'MVP aşaması',
          productStatus: 'MVP',
          businessModel: ['SaaS'],
          targetCustomer: ['B2B'],
          problem: 'Raporlama yavaş',
          solution: 'Otomatik rapor',
          differentiation: 'Hazır şablon',
          revenueStatus: 'İlk gelir',
          tractionStatus: 'İlk müşteriler',
          mrr: '120000',
          investmentAmount: '2.500.000 - 5.000.000 TL',
          equityOffered: 10,
          useOfFunds: ['Ürün geliştirme'],
        },
      }),
      longDescription: 'Manuel yatırımcı özeti burada duruyor ve en az yüz karakter olacak şekilde yazıldı.',
      storedAnalysis: { accepted: false, professionalInvestmentSummary: 'AI taslak', fingerprint: 'x' },
    });
    expect(card.summary).toContain('Manuel yatırımcı özeti');
    expect(card.fundingAmount).toBe('2.500.000 - 5.000.000 TL');
    expect(card.equityOffered).toBe('10%');
    expect(card.sector).toBe('SaaS / Yazılım');
    expect(card.stage).toBe('MVP aşaması');
    expect(card.businessModel).toBe('SaaS');
    expect(card.useOfFunds).toBe('Ürün geliştirme');
    expect(card.tractionMetrics.some((row) => row.value === '120000')).toBe(true);
  });
});

describe('investment AI fallback without OpenAI', () => {
  it('still builds a complete card from structured fields', () => {
    const draft = buildInvestmentCardData({
      context: buildInvestmentContext({
        title: 'RevSaaS',
        customFields: {
          sector: 'SaaS / Yazılım',
          stage: 'MVP aşaması',
          productStatus: 'MVP',
          businessModel: ['SaaS'],
          targetCustomer: ['B2B'],
          problem: 'Raporlama yavaş',
          solution: 'Otomatik rapor',
          differentiation: 'Hazır şablon',
          revenueStatus: 'İlk gelir',
          tractionStatus: 'Pilot',
          investmentAmount: '1.000.000 - 2.500.000 TL',
          equityOffered: 10,
          useOfFunds: ['Ürün geliştirme'],
        },
      }),
    });
    expect(draft.summary.length).toBeGreaterThan(40);
    expect(draft.startupName).toBe('RevSaaS');
  });
});
