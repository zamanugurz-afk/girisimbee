import { describe, expect, it } from 'vitest';
import { buildInvestorCriteriaContext } from '@/features/investors/lib/investor-criteria';
import { buildInvestorCardData, formatChipLine } from '@/features/investors/lib/investor-card';
import { buildInvestorSummaryDraft } from '@/features/investors/lib/investor-summary';

function card(overrides: Record<string, unknown> = {}, extra?: {
  longDescription?: string;
  storedAnalysis?: unknown;
}) {
  return buildInvestorCardData({
    context: buildInvestorCriteriaContext({
      title: 'Erken Aşama SaaS Yatırımcısı',
      customFields: {
        investorType: 'Melek yatırımcı',
        sectors: ['Yapay zeka', 'Fintech', 'SaaS / Yazılım', 'Marketplace'],
        preferredStages: ['Fikir aşaması', 'MVP aşaması', 'İlk müşteriler'],
        investmentAmount: '500.000 - 1.000.000 TL',
        preferredGeographies: ['İstanbul'],
        preferredBusinessModels: ['SaaS'],
        preferredTargetCustomers: ['B2B'],
        revenueExpectation: 'İlk gelir',
        tractionExpectation: 'Pilot',
        investmentThesis: 'B2B SaaS ekiplerine yatırım yapmak istiyorum.',
        ...overrides,
      },
    }),
    longDescription: extra?.longDescription,
    storedAnalysis: extra?.storedAnalysis,
  });
}

describe('investor card and preview data', () => {
  it('renders the investor hierarchy without empty equity or valuation rows', () => {
    const data = card();
    expect(data.displayName).toBe('Erken Aşama SaaS Yatırımcısı');
    expect(data.investorType).toBe('Melek yatırımcı');
    expect(data.sectors).toContain('SaaS / Yazılım');
    expect(data.stages).toEqual(['Fikir aşaması', 'MVP aşaması', 'İlk müşteriler']);
    expect(data.ticket).toBe('500.000 - 1.000.000 TL');
    expect(data.geographies).toEqual(['İstanbul']);
    expect(data.businessModels).toEqual(['SaaS']);
    expect(data.targetCustomers).toEqual(['B2B']);
    expect(data.revenueExpectation).toBe('İlk gelir');
    expect(data.tractionExpectation).toBe('Pilot');
    expect(data.thesis).toContain('B2B SaaS');
    expect(data).not.toHaveProperty('equity');
    expect(data).not.toHaveProperty('valuation');
  });

  it('collapses extra chips with +N', () => {
    expect(formatChipLine(['A', 'B', 'C', 'D'], 3)).toBe('A, B, C +1');
  });

  it('uses deterministic summary when AI is off or rejected', () => {
    const draft = buildInvestorSummaryDraft(
      buildInvestorCriteriaContext({
        title: 'Erken Aşama SaaS Yatırımcısı',
        customFields: {
          investorType: 'Melek yatırımcı',
          sectors: ['SaaS / Yazılım'],
          preferredStages: ['MVP aşaması'],
          investmentAmount: '500.000 - 1.000.000 TL',
        },
      }),
    );
    const data = card({}, {
      longDescription: draft.longDescription,
      storedAnalysis: {
        accepted: false,
        professionalInvestorSummary: 'AI taslak',
        fingerprint: 'x',
      },
    });
    expect(data.summary.toLocaleLowerCase('tr-TR')).toContain('melek yatırımcı');
    expect(data.summary).not.toContain('AI taslak');
    expect(draft.longDescription.length).toBeGreaterThan(40);
  });

  it('uses accepted AI summary only after Kullan', () => {
    const data = card({}, {
      storedAnalysis: {
        accepted: true,
        fingerprint: 'abc',
        professionalInvestorSummary: 'Kabul edilmiş yatırımcı özeti burada duruyor.',
        shortInvestorSummary: 'Kısa özet',
        investmentThesis: 'Kabul tez',
        investmentHighlights: ['Bilet: 500.000 - 1.000.000 TL'],
      },
    });
    expect(data.summary).toBe('Kabul edilmiş yatırımcı özeti burada duruyor.');
    expect(data.shortSummary).toBe('Kısa özet');
    expect(data.thesis).toBe('Kabul tez');
  });
});
