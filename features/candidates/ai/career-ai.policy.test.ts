import { describe, expect, it, beforeEach } from 'vitest';
import {
  buildCareerAiSafeContext,
  careerAiPolishFingerprint,
  fingerprintCanonical,
} from './career-ai-context';
import { acceptedCareerAiAnalysisOrNull, shouldReuseCareerAiFingerprint } from './career-ai-persist';
import { containsCareerFreeTextPii, prepareTextForCareerAi, redactCareerFreeTextPii } from './career-ai-pii';
import { hasUngroundedNumbers } from './career-ai-grounding';
import { parseCareerAiAnalysis } from './career-ai-parse';
import { decideCareerAiAutoAnalyze } from './career-ai-auto';
import {
  needsSemanticCareerPolish,
  polishCareerManualDeterministic,
} from './career-ai-deterministic-polish';
import { getCareerAiCache, markCareerAiAutoAnalyzeRequested, resetCareerAiCacheForTests, setCareerAiCache } from './career-ai-cache';
import { matchTaxonomyOptions } from './match-taxonomy';
import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';

function exp(partial: Partial<CareerExperience>): CareerExperience {
  return {
    id: partial.id ?? '1',
    sector: partial.sector ?? 'Satış',
    role: partial.role ?? 'Satış Uzmanı',
    duration: partial.duration ?? '',
    responsibilities: partial.responsibilities ?? 'Müşteri ilişkileri',
    achievements: partial.achievements ?? '',
    company: partial.company,
    roleOther: partial.roleOther,
    startMonth: partial.startMonth ?? 1,
    startYear: partial.startYear ?? 2020,
    endMonth: partial.endMonth ?? 1,
    endYear: partial.endYear ?? 2022,
    isCurrent: partial.isCurrent,
    selectedResponsibilities: partial.selectedResponsibilities,
    responsibilitiesOther: partial.responsibilitiesOther,
    selectedAchievements: partial.selectedAchievements,
    achievementsOther: partial.achievementsOther,
    achievementMetric: partial.achievementMetric,
  };
}

describe('career AI policy', () => {
  beforeEach(() => {
    resetCareerAiCacheForTests();
  });

  it('produces a six-field career summary analysis from a single JSON payload', () => {
    const evidence = JSON.stringify({ totalExperienceYears: 5, role: 'Satış Uzmanı' });
    const parsed = parseCareerAiAnalysis(
      {
        professionalSummary: '5 yıldır satış alanında çalışıyorum.',
        shortSummary: 'Satış uzmanıyım.',
        strengths: ['Müşteri ilişkileri'],
        highlightedAchievements: [],
        profileGaps: ['Sertifika ekleyebilirsiniz'],
        improvementSuggestions: ['Başarı örneği ekleyin'],
      },
      evidence,
    );
    expect(parsed).toMatchObject({
      professionalSummary: '5 yıldır satış alanında çalışıyorum.',
      shortSummary: 'Satış uzmanıyım.',
      strengths: ['Müşteri ilişkileri'],
      profileGaps: ['Sertifika ekleyebilirsiniz'],
    });
  });

  it('does not treat unaccepted analysis as persistable longDescription sidecar', () => {
    expect(
      acceptedCareerAiAnalysisOrNull({
        fingerprint: 'abc',
        professionalSummary: 'Taslak',
        accepted: false,
      }),
    ).toBeNull();
    expect(
      acceptedCareerAiAnalysisOrNull({
        fingerprint: 'abc',
        professionalSummary: 'Taslak',
        accepted: true,
      })?.accepted,
    ).toBe(true);
  });

  it('clears rejected analysis from persistable customFields', () => {
    expect(acceptedCareerAiAnalysisOrNull(null)).toBeNull();
  });

  it('reuses the same analyze fingerprint without a new cache miss', () => {
    const ctx = buildCareerAiSafeContext({
      desiredRole: 'Satış Uzmanı',
      primarySector: 'Satış',
      experiences: [exp({})],
      totalExperienceYears: 3,
    });
    const fingerprint = fingerprintCanonical(ctx);
    setCareerAiCache(fingerprint, {
      action: 'analyze',
      source: 'ai',
      fingerprint,
      professionalSummary: 'Özet',
      shortSummary: '',
      strengths: [],
      highlightedAchievements: [],
      profileGaps: [],
      improvementSuggestions: [],
    });
    expect(shouldReuseCareerAiFingerprint(fingerprint, fingerprint)).toBe(true);
    expect(getCareerAiCache(fingerprint)).toBeTruthy();
    expect(getCareerAiCache(fingerprintCanonical(ctx))).toBeTruthy();
  });

  it('reuses the same manual summary polish fingerprint', () => {
    const first = careerAiPolishFingerprint({
      kind: 'summary',
      text: '5 yıldır satış sektöründe çalışıyorum müşterilerle iletişimim iyi',
      role: 'Satış Uzmanı',
      sector: 'Satış',
      experienceLevel: 'Mid',
      totalExperienceYears: 5,
    });
    const second = careerAiPolishFingerprint({
      kind: 'summary',
      text: '5 yıldır satış sektöründe çalışıyorum müşterilerle iletişimim iyi',
      role: 'Satış Uzmanı',
      sector: 'Satış',
      experienceLevel: 'Mid',
      totalExperienceYears: 5,
    });
    expect(first).toBe(second);
    setCareerAiCache(first, { action: 'polish', source: 'ai', polished: 'Düzeltildi.', fingerprint: first });
    expect(getCareerAiCache(second)).toBeTruthy();
  });

  it('redacts email and phone in free text before OpenAI context', () => {
    expect(containsCareerFreeTextPii('Bana ali@example.com yazın')).toBe(true);
    expect(containsCareerFreeTextPii('Telefonum 0532 111 22 33')).toBe(true);
    expect(redactCareerFreeTextPii('Bana ali@example.com yazın')).not.toContain('ali@example.com');
    expect(prepareTextForCareerAi('05321112233').blocked).toBe(true);
    const ctx = buildCareerAiSafeContext({
      desiredRole: 'Satış Uzmanı',
      experiences: [
        exp({
          responsibilities: 'Müşteri görüşmeleri. İletişim: ali@example.com',
        }),
      ],
    });
    expect(JSON.stringify(ctx)).not.toContain('ali@example.com');
    expect(JSON.stringify(ctx)).not.toContain('@');
  });

  it('rejects invented percentages that are not in the input', () => {
    const evidence = JSON.stringify({ role: 'Hemşire', totalExperienceYears: 4 });
    expect(hasUngroundedNumbers('%40 hasta memnuniyeti', evidence)).toBe(true);
    expect(
      parseCareerAiAnalysis(
        {
          professionalSummary: 'Hasta memnuniyetini %40 artırdım.',
          shortSummary: '',
          strengths: [],
          highlightedAchievements: [],
          profileGaps: [],
          improvementSuggestions: [],
        },
        evidence,
      ),
    ).toBeNull();
    expect(
      parseCareerAiAnalysis(
        {
          professionalSummary: '4 yıllık hemşirelik deneyimim var.',
          shortSummary: '',
          strengths: [],
          highlightedAchievements: [],
          profileGaps: [],
          improvementSuggestions: [],
        },
        evidence,
      )?.professionalSummary,
    ).toBe('4 yıllık hemşirelik deneyimim var.');
  });

  it('matches catalog options without inventing labels', () => {
    const catalog = ['CRM kullanımı', 'Satış Operasyonları', 'Müşteri Yönetimi'];
    const hits = matchTaxonomyOptions('CRM süreçlerini yönettim.', catalog);
    expect(hits.every((item) => catalog.includes(item))).toBe(true);
  });

  it('auto-analyzes only the first time a ready fingerprint appears', () => {
    const fingerprint = 'abc123';
    expect(
      decideCareerAiAutoAnalyze({
        profileReady: false,
        fingerprint,
        hasCachedResult: false,
        alreadyRequested: false,
      }),
    ).toBe('skip');
    expect(
      decideCareerAiAutoAnalyze({
        profileReady: true,
        fingerprint,
        hasCachedResult: false,
        alreadyRequested: false,
      }),
    ).toBe('request');
    expect(
      decideCareerAiAutoAnalyze({
        profileReady: true,
        fingerprint,
        hasCachedResult: false,
        alreadyRequested: true,
      }),
    ).toBe('skip');
    expect(
      decideCareerAiAutoAnalyze({
        profileReady: true,
        fingerprint,
        hasCachedResult: true,
        alreadyRequested: true,
      }),
    ).toBe('show-cached');
    expect(
      decideCareerAiAutoAnalyze({
        profileReady: true,
        fingerprint,
        dismissedFingerprint: fingerprint,
        hasCachedResult: true,
        alreadyRequested: false,
      }),
    ).toBe('skip');
    expect(markCareerAiAutoAnalyzeRequested(fingerprint)).toBe(true);
    expect(markCareerAiAutoAnalyzeRequested(fingerprint)).toBe(false);
  });

  it('polishes short responsibility/achievement text without needing OpenAI', () => {
    expect(needsSemanticCareerPolish('hasta bakımı yaptım', 'responsibility')).toBe(false);
    expect(needsSemanticCareerPolish('Hasta memnuniyetini artırdım', 'achievement')).toBe(false);
    expect(polishCareerManualDeterministic('achievement', 'hasta memnuniyetini artırdım', '%18')).toBe(
      'Hasta memnuniyetini artırdım (%18).',
    );
    expect(polishCareerManualDeterministic('responsibility', '  müşteri görüşmeleri yaptım  ')).toBe(
      'Müşteri görüşmeleri yaptım.',
    );
    expect(
      needsSemanticCareerPolish(
        '5 yıldır satış sektöründe çalışıyorum müşterilerle iletişimim iyi ekip yönetimi konusunda deneyimliyim ve süreçleri uçtan uca takip ediyorum',
        'summary',
      ),
    ).toBe(true);
  });

  it('caches polish fingerprints so the same text is not sent twice', () => {
    const fingerprint = careerAiPolishFingerprint({
      kind: 'responsibility',
      text: 'Müşteri görüşmeleri yaptım.',
    });
    setCareerAiCache(fingerprint, {
      action: 'polish',
      source: 'deterministic',
      polished: 'Müşteri görüşmeleri yaptım.',
      fingerprint,
    });
    expect(getCareerAiCache(fingerprint)).toBeTruthy();
    expect(
      careerAiPolishFingerprint({
        kind: 'responsibility',
        text: 'Müşteri görüşmeleri yaptım.',
      }),
    ).toBe(fingerprint);
  });
});
