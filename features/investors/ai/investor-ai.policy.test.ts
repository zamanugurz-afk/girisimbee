import { beforeEach, describe, expect, it } from 'vitest';
import { parseInvestorAiAnalysis } from '@/features/investors/ai/investor-ai-parse';
import {
  acceptedInvestorAiAnalysisOrNull,
  shouldReuseInvestorAiFingerprint,
} from '@/features/investors/ai/investor-ai-persist';
import {
  compactInvestorAiContext,
  investorAiFingerprint,
  toInvestorAiSafeContext,
} from '@/features/investors/ai/investor-ai-context';
import {
  getInvestorAiCache,
  resetInvestorAiCacheForTests,
  setInvestorAiCache,
} from '@/features/investors/ai/investor-ai-cache';
import { hasUngroundedInvestorCriteria } from '@/features/investors/ai/investor-ai-grounding';
import { buildInvestorCriteriaContext } from '@/features/investors/lib/investor-criteria';
import { buildInvestorCardData } from '@/features/investors/lib/investor-card';
import { buildInvestorSummaryDraft } from '@/features/investors/lib/investor-summary';

const baseContext = compactInvestorAiContext(
  toInvestorAiSafeContext(
    buildInvestorCriteriaContext({
      title: 'SaaS Melek',
      customFields: {
        investorType: 'Melek yatırımcı',
        sectors: ['SaaS / Yazılım'],
        preferredStages: ['MVP aşaması'],
        investmentAmount: '1.000.000 - 2.500.000 TL',
        revenueExpectation: 'İlk gelir',
        tractionExpectation: 'Pilot',
        preferredGeographies: ['İstanbul'],
        equityPreference: 'Azınlık payı',
        valuationApproach: 'Görüşmeye açık',
        investmentThesis: 'B2B SaaS ekiplerine yatırım yapmak istiyorum.',
      },
    }),
  ),
);

describe('investor AI policy', () => {
  beforeEach(() => {
    resetInvestorAiCacheForTests();
  });

  it('accepts grounded analysis that repeats input criteria', () => {
    const evidence = JSON.stringify(baseContext);
    const parsed = parseInvestorAiAnalysis(
      {
        professionalInvestorSummary:
          'SaaS Melek bir Melek yatırımcı. SaaS / Yazılım ve MVP aşaması girişimlere 1.000.000 - 2.500.000 TL bilet ile bakıyor.',
        shortInvestorSummary: 'SaaS / Yazılım odaklı melek, MVP aşaması.',
        investmentThesis: 'B2B SaaS ekiplerine yatırım yapmak istiyorum.',
        investmentHighlights: ['SaaS / Yazılım', '1.000.000 - 2.500.000 TL'],
        profileGaps: ['İş modeli seçilmedi'],
        improvementSuggestions: ['Hedef müşteri ekleyin'],
      },
      evidence,
    );
    expect(parsed?.professionalInvestorSummary).toContain('SaaS / Yazılım');
    expect(parsed?.professionalInvestorSummary).toContain('1.000.000 - 2.500.000 TL');
  });

  it('rejects invented sector, stage, amount or geography without a second AI call', () => {
    const evidence = JSON.stringify(baseContext);
    const parsed = parseInvestorAiAnalysis(
      {
        professionalInvestorSummary:
          'Fintech ve Sağlık teknolojisi odaklı, Büyüme aşaması ve 10.000.000 TL ve üzeri bilet; Ankara.',
        shortInvestorSummary: 'Fintech',
        investmentThesis: '',
        investmentHighlights: [],
        profileGaps: [],
        improvementSuggestions: [],
      },
      evidence,
    );
    expect(parsed).toBeNull();
    expect(hasUngroundedInvestorCriteria('Fintech ve Ankara', evidence)).toBe(true);
  });

  it('rejects invented numbers', () => {
    const evidence = JSON.stringify(baseContext);
    const parsed = parseInvestorAiAnalysis(
      {
        professionalInvestorSummary: 'Her turda 40 girişim ve %25 getiri hedefliyor.',
        shortInvestorSummary: '',
        investmentThesis: '',
        investmentHighlights: [],
        profileGaps: [],
        improvementSuggestions: [],
      },
      evidence,
    );
    expect(parsed).toBeNull();
  });

  it('does not persist unaccepted analysis', () => {
    expect(
      acceptedInvestorAiAnalysisOrNull({
        fingerprint: 'abc',
        professionalInvestorSummary: 'Taslak',
        accepted: false,
      }),
    ).toBeNull();
    expect(
      acceptedInvestorAiAnalysisOrNull({
        fingerprint: 'abc',
        professionalInvestorSummary: 'Taslak',
        accepted: true,
      })?.accepted,
    ).toBe(true);
  });

  it('reuses the same fingerprint from cache — 0 new OpenAI calls', () => {
    const fingerprint = investorAiFingerprint(baseContext);
    setInvestorAiCache(fingerprint, { action: 'analyze', source: 'ai', fingerprint });
    expect(getInvestorAiCache(fingerprint)).toMatchObject({ source: 'ai', fingerprint });
    expect(shouldReuseInvestorAiFingerprint(fingerprint, fingerprint)).toBe(true);
    expect(investorAiFingerprint(baseContext)).toBe(fingerprint);
  });

  it('changes fingerprint when ticket or sectors change', () => {
    const next = compactInvestorAiContext({
      ...baseContext,
      ticket: '5.000.000 - 10.000.000 TL',
      ticketMin: '5000000',
      ticketMax: '10000000',
    });
    expect(investorAiFingerprint(next)).not.toBe(investorAiFingerprint(baseContext));
  });

  it('keeps the form usable when AI is closed — deterministic draft only', () => {
    const ctx = buildInvestorCriteriaContext({
      title: 'SaaS Melek',
      customFields: {
        investorType: 'Melek yatırımcı',
        sectors: ['SaaS / Yazılım'],
        preferredStages: ['MVP aşaması'],
        investmentAmount: '1.000.000 - 2.500.000 TL',
      },
    });
    const draft = buildInvestorSummaryDraft(ctx);
    const card = buildInvestorCardData({
      context: ctx,
      longDescription: draft.longDescription,
      storedAnalysis: null,
    });
    expect(card.summary.toLocaleLowerCase('tr-TR')).toContain('melek yatırımcı');
    expect(card.ticket).toBe('1.000.000 - 2.500.000 TL');
  });
});
