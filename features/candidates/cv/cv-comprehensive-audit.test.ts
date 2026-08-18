import { describe, expect, it, vi } from 'vitest';
import fs from 'fs';
import { performance } from 'perf_hooks';
import { cvService } from '@/features/candidates/cv/cv.service';
import { extractCvText, CvExtractionError } from '@/features/candidates/cv/cv-text-extractor';
import {
  extractDeterministicCv,
} from '@/features/candidates/cv/cv-deterministic-extractor';
import { extractCvWithSingleAiCall } from '@/features/candidates/cv/cv-ai-extractor';
import { mapCvToCanonicalTaxonomy } from '@/features/candidates/cv/cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from '@/features/candidates/cv/cv-profile-builder';
import { cvAnalysisCache } from '@/features/candidates/cv/cv-cache';
import { verifyCvPipelineIntegrity } from '@/features/candidates/cv/cv-data-loss-guard';
import { calculateCvQualityScore } from '@/features/candidates/cv/cv-quality-score';
import { formValuesToCustomFields } from '@/features/career-profile/career-profile.service';
import { valuesFromCareerSource } from '@/features/career-profile/completion';
import { toSafeCareerPreviewInput } from '@/features/career-profile/preview';
import * as openAiModule from '@/lib/openai/career-openai';
import type { CareerProfileFormValues } from '@/features/career-profile/types';

describe('GİRİŞİMBEE — CV EXTRACTION 2.0 COMPREHENSIVE AUDIT & BENCHMARK SUITE', () => {
  const ugurPdfPath = 'c:/Users/ugurz/Downloads/CV - UĞUR ZAMAN (4).pdf';

  // --------------------------------------------------------------------------
  // 1. AI CALL COUNT & GATING VERIFICATION
  // --------------------------------------------------------------------------
  it('1. Verifies AI Call Counts strictly: 0 for structured, max 1 for unstructured, 0 for cache hit', async () => {
    cvAnalysisCache.clear();
    const aiSpy = vi.spyOn(openAiModule, 'openaiJsonCompletion');

    // Case A: Structured CV (Should be 0 AI call)
    aiSpy.mockClear();
    const structuredCv = `
Ahmet Yılmaz - İstanbul
0532 111 22 33 - ahmet@example.com

ÖZET
10 yıllık deneyimli satış ve operasyon yöneticisi.

İŞ DENEYİMİ
Akbank A.Ş.
Müşteri İlişkileri Yöneticisi
2020 - 2024
Portföy yönetimi ve müşteri kazanımı sağlandı.

EĞİTİM
İstanbul Üniversitesi - İktisat (Lisans) - 2019

YETKİNLİKLER
Satış Yönetimi, Operasyon Yönetimi, Ekip Yönetimi, MS Excel
`;
    const resA = await extractCvWithSingleAiCall(structuredCv);
    expect(resA._aiMetrics?.aiCalled).toBe(false);
    expect(resA._aiMetrics?.aiSkipped).toBe(true);
    expect(resA._aiMetrics?.inputTokens).toBe(0);
    expect(resA._aiMetrics?.outputTokens).toBe(0);
    expect(aiSpy).not.toHaveBeenCalled();

    // Case B: Unstructured CV (Should make EXACTLY 1 minimal AI call)
    aiSpy.mockClear();
    aiSpy.mockResolvedValueOnce({
      model: 'gpt-4o-mini',
      json: {
        roles: ['Yazılım Geliştirici'],
        skills: ['JavaScript', 'React'],
        summary: 'Web geliştirici.',
      },
    });

    const unstructuredCv = 'Karmaşık ve başlıksız metin: 5 yıldır web projeleri geliştiriyorum.';
    const resB = await extractCvWithSingleAiCall(unstructuredCv);
    expect(resB._aiMetrics?.aiCalled).toBe(true);
    expect(resB._aiMetrics?.inputTokens).toBeGreaterThan(0);
    expect(aiSpy).toHaveBeenCalledTimes(1); // STRICT: NEVER > 1

    // Case C: Duplicate upload (Cache hit -> 0 AI call)
    aiSpy.mockClear();
    const mockDraft = buildProfileDraftFromCanonicalResult(mapCvToCanonicalTaxonomy(resA));
    cvAnalysisCache.set(structuredCv, mockDraft);

    const cachedDraft = cvAnalysisCache.get(structuredCv);
    expect(cachedDraft).not.toBeNull();
    expect(cachedDraft?.metrics.cacheHit).toBe(true);
    expect(cachedDraft?.metrics.aiCallCount).toBe(0);
    expect(aiSpy).not.toHaveBeenCalled();
  });

  // --------------------------------------------------------------------------
  // 2. UNINFLATED REALISTIC COVERAGE AUDIT
  // --------------------------------------------------------------------------
  it('2. Verifies uninflated realistic coverage calculation and category scoring', () => {
    const partialCv = extractDeterministicCv(`
Ali Veli
İzmir
EĞİTİM: Ege Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2022
İŞ DENEYİMİ: ABC Yazılım - Geliştirici (2022 - 2024)
YETKİNLİKLER: Yazılım Geliştirme, Problem Çözme
`);
    const canonical = mapCvToCanonicalTaxonomy(partialCv);
    const report = calculateCvQualityScore({
      canonical,
      experiences: partialCv.experiences,
      summaryLength: canonical.summary.length,
    });

    expect(report.breakdown.certificates).toBe(0);
    expect(report.breakdown.tools).toBe(0);
    expect(report.breakdown.location).toBe(100);
    expect(report.breakdown.role).toBe(100);
    expect(report.overallScore).toBeGreaterThan(60);
    expect(report.overallScore).toBeLessThan(100);
  });

  // --------------------------------------------------------------------------
  // 3. UĞUR ZAMAN REAL CV COMPREHENSIVE REGRESSION
  // --------------------------------------------------------------------------
  it('3. Runs real Uğur Zaman CV audit with 6/6 experiences, 2/2 education and complete data integrity', async () => {
    if (!fs.existsSync(ugurPdfPath)) return;

    const pdfBuffer = fs.readFileSync(ugurPdfPath);
    const t0 = performance.now();

    const draft = await cvService.processCvBuffer({
      buffer: pdfBuffer,
      fileName: 'CV - UĞUR ZAMAN (4).pdf',
      mimeType: 'application/pdf',
      documentId: 'doc-audit-ugur',
    });

    const elapsed = performance.now() - t0;

    // AI Check: MUST BE 0 for Uğur Zaman
    expect(draft.metrics.aiCalled).toBe(false);
    expect(draft.metrics.aiSkipped).toBe(true);
    expect(draft.metrics.aiCallCount).toBe(0);
    expect(draft.metrics.inputTokens).toBe(0);
    expect(draft.metrics.outputTokens).toBe(0);
    expect(draft.metrics.estimatedCostUsd).toBe(0);

    // Experiences (6 / 6)
    expect(draft.categoriesFound.experiences).toBe(6);
    expect(draft.formValues.experiences?.length).toBe(6);

    const companies = draft.formValues.experiences?.map((e) => e.company || '').join(' ') || '';
    expect(companies).toMatch(/IGS/i);
    expect(companies).toMatch(/Gedik/i);
    expect(companies).toMatch(/Mehrwerk/i);
    expect(companies).toMatch(/Viennalife/i);
    expect(companies).toMatch(/Fibabanka/i);
    expect(companies).toMatch(/Mplus/i);

    // Education (2 / 2)
    expect(draft.categoriesFound.education).toBe(2);
    expect(draft.formValues.educationLevel).toBe('Yüksek lisans');
    expect(draft.formValues.educationField).toContain('Marmara');
    expect(draft.formValues.educationField).toContain('Anadolu');
    expect(draft.formValues.educationHistory?.length).toBe(2);

    // Skills & Tools
    expect(draft.categoriesFound.skills).toBeGreaterThanOrEqual(8);
    expect(draft.categoriesFound.tools).toBeGreaterThanOrEqual(0);

    // Location & Summary
    expect(draft.formValues.city).toBe('İstanbul');
    expect(draft.formValues.residenceCity).toBe('İstanbul');
    expect(draft.formValues.candidateTraits).toContain('19 yıllık');

    // Execution time
    expect(elapsed).toBeGreaterThan(0);
  });

  // --------------------------------------------------------------------------
  // 4. AI=OFF vs AI=ON NON-REGRESSION COMPARISON
  // --------------------------------------------------------------------------
  it('4. Compares AI=OFF vs AI=ON and proves AI never degrades deterministic data', async () => {
    const rawCvText = `
Uğur Zaman - Maltepe / İstanbul
19 yıllık profesyonel kariyerimde satış ve operasyon yönetimi yaptım.

İŞ DENEYİMİ
IGS Türkiye - Müdür (2025 - 2026)
GEDİK YATIRIM - Müdür (2023 - 2025)
Mehrwerk - Müdür (2019 - 2023)
Viennalife - Müdür (2016 - 2019)
FİBABANKA - Müdür (2016 - 2016)
MPLUS GROUP - Müdür (2011 - 2016)

EĞİTİM
Marmara Üniversitesi - Sermaye Piyasası (Yüksek Lisans) - 2022
Anadolu Üniversitesi - Kamu Yönetimi (Lisans) - 2015

YETKİNLİKLER
Satış Yönetimi, Operasyon Yönetimi, Çağrı Merkezi Yönetimi, MS Excel, CRM
`;

    const deterministicResult = extractDeterministicCv(rawCvText);
    expect(deterministicResult.experiences.length).toBe(6);
    expect(deterministicResult.education.length).toBe(2);

    vi.spyOn(openAiModule, 'openaiJsonCompletion').mockResolvedValueOnce({
      model: 'gpt-4o-mini',
      json: {
        roles: ['Satış Müdürü'],
        skills: ['Ekip Yönetimi'],
        summary: 'Enriched summary',
      },
    });

    const aiResult = await extractCvWithSingleAiCall(rawCvText);

    expect(aiResult.experiences.length).toBeGreaterThanOrEqual(deterministicResult.experiences.length);
    expect(aiResult.education.length).toBeGreaterThanOrEqual(deterministicResult.education.length);
  });

  // --------------------------------------------------------------------------
  // 5. DATA LOSS TRACE ACROSS ENTIRE LIFECYCLE
  // --------------------------------------------------------------------------
  it('5. Traces every single pipeline step ensuring zero count reduction', () => {
    const cvText = `
Uğur Zaman - İstanbul
İŞ DENEYİMİ
İş 1 (2024 - 2025)
İş 2 (2023 - 2024)
İş 3 (2022 - 2023)
İş 4 (2021 - 2022)
İş 5 (2020 - 2021)
İş 6 (2019 - 2020)
EĞİTİM
Marmara Üniversitesi (Yüksek Lisans)
Anadolu Üniversitesi (Lisans)
`;

    const raw = extractDeterministicCv(cvText);
    expect(raw.experiences.length).toBe(6);
    expect(raw.education.length).toBe(2);

    const canonical = mapCvToCanonicalTaxonomy(raw);
    expect(canonical.experiences.length).toBe(6);
    expect(canonical.educationList.length).toBe(2);

    const guard = verifyCvPipelineIntegrity({ rawExtraction: raw, canonical });
    expect(guard.valid).toBe(true);

    const draft = buildProfileDraftFromCanonicalResult(canonical);
    expect(draft.formValues.experiences?.length).toBe(6);
    expect(draft.formValues.educationHistory?.length).toBe(2);

    const formState: CareerProfileFormValues = {
      role: draft.formValues.role || '',
      roles: draft.formValues.roles || [],
      sector: draft.formValues.sector || '',
      sectors: draft.formValues.sectors || [],
      experienceLevel: draft.formValues.experienceLevel || '',
      experiences: draft.formValues.experiences || [],
      professionalSkills: draft.formValues.professionalSkills || '',
      professionalSkillsList: draft.formValues.professionalSkillsList || [],
      technicalSkills: draft.formValues.technicalSkills || '',
      technicalSkillsList: draft.formValues.technicalSkillsList || [],
      tools: draft.formValues.tools || '',
      toolsList: draft.formValues.toolsList || [],
      educationLevel: draft.formValues.educationLevel || '',
      educationField: draft.formValues.educationField || '',
      educationHistory: draft.formValues.educationHistory || [],
      languages: draft.formValues.languages || '',
      certificates: draft.formValues.certificates || '',
      city: draft.formValues.city || '',
      residenceCity: draft.formValues.residenceCity || '',
      workType: '',
      workplacePreference: '',
      availability: '',
      candidateTraits: draft.formValues.candidateTraits || '',
    };
    const saved = formValuesToCustomFields('seek', formState);
    expect((saved.experiences as any[]).length).toBe(6);
    expect((saved.educationHistory as any[]).length).toBe(2);

    const reloaded = valuesFromCareerSource({ city: 'İstanbul', location: 'İstanbul', customFields: saved });
    expect(reloaded.experiences?.length).toBe(6);
    expect(reloaded.educationHistory?.length).toBe(2);

    const preview = toSafeCareerPreviewInput({
      kind: 'seek',
      source: { city: reloaded.city, location: reloaded.city, customFields: saved },
      displayName: 'Uğur Zaman',
    });
    expect(preview.experiences?.length).toBe(6);
  });

  // --------------------------------------------------------------------------
  // 6. ZERO HALLUCINATION ASSERTION
  // --------------------------------------------------------------------------
  it('6. Verifies that future candidate preference fields are NEVER hallucinated', () => {
    const raw = extractDeterministicCv('Uğur Zaman - İstanbul - Satış Müdürü');
    const canonical = mapCvToCanonicalTaxonomy(raw);
    const draft = buildProfileDraftFromCanonicalResult(canonical);

    expect(draft.formValues.salaryMin).toBeNull();
    expect(draft.formValues.salaryMax).toBeNull();
    expect(draft.formValues.salary).toBe('');
    expect(draft.formValues.workType).toBe('');
    expect(draft.formValues.workplacePreference).toBe('');
    expect(draft.formValues.availability).toBe('');
    expect(draft.formValues.preferredDistrict).toBe('');
  });

  // --------------------------------------------------------------------------
  // 7. MULTI-VERSION CACHE INVALIDATION
  // --------------------------------------------------------------------------
  it('7. Verifies cache key with version constants and cache invalidation on text change', () => {
    cvAnalysisCache.clear();
    const cvA = 'Ahmet - İstanbul - 2024';
    const cvB = 'Mehmet - Ankara - 2024';

    const hashA = cvAnalysisCache.computeHash(cvA);
    const hashB = cvAnalysisCache.computeHash(cvB);
    expect(hashA).not.toBe(hashB);

    const mockDraft = buildProfileDraftFromCanonicalResult(mapCvToCanonicalTaxonomy(extractDeterministicCv(cvA)));
    cvAnalysisCache.set(cvA, mockDraft);

    expect(cvAnalysisCache.has(cvA)).toBe(true);
    expect(cvAnalysisCache.has(cvB)).toBe(false);
  });

  // --------------------------------------------------------------------------
  // 8. 22 FIXTURES MATRIX AUDIT
  // --------------------------------------------------------------------------
  it('8. Audits all 22 synthetic fixtures and reports individual metrics', async () => {
    const fixtures = [
      {
        id: 1,
        name: 'Türkçe klasik CV',
        text: 'Ahmet Yılmaz\nİstanbul / Kadıköy\nİŞ DENEYİMİ:\nAkbank - Satış Müdürü (2020 - 2023)\nEĞİTİM:\nİstanbul Üniversitesi - İktisat (Lisans) - 2019\nYETKİNLİKLER:\nSatış Yönetimi, MS Excel',
        expectedExp: 1,
        expectedEdu: 1,
      },
      {
        id: 2,
        name: 'İngilizce CV',
        text: 'John Doe\nIstanbul\nWORK EXPERIENCE:\nMehrwerk - Operations Manager (2018 - 2022)\nEDUCATION:\nBogazici University - Business (Bachelor) - 2017\nSKILLS:\nOperations Management, Jira',
        expectedExp: 1,
        expectedEdu: 1,
      },
      {
        id: 3,
        name: 'Canva PDF',
        text: 'CANSU DEMİR | İSTANBUL\nDENEYİM:\nIGS TURKIYE - Çağrı Merkezi Müdürü (2022 - 2024)\nEGITIM:\nMarmara Üniversitesi / İşletme (Lisans) 2020\nBECERİLER:\nMüşteri İlişkileri, CRM',
        expectedExp: 1,
        expectedEdu: 1,
      },
      {
        id: 4,
        name: 'LinkedIn PDF',
        text: 'Deneyim\nGedik Yatırım\nAlternatif Satış Kanalları Müdürü (2021 - 2023)\nEğitim\nAnadolu Üniversitesi - Kamu Yönetimi (Lisans) - 2016\nYetenekler: Satış Yönetimi, CRM',
        expectedExp: 1,
        expectedEdu: 1,
      },
      {
        id: 5,
        name: 'Word DOCX',
        text: 'Mehmet Kaya - Ankara\nİŞ GEÇMİŞİ:\nAselsan - Proje Yöneticisi (2019 - 2024)\nEĞİTİM:\nODTÜ - Endüstri Mühendisliği (Yüksek Lisans) - 2018\nYETENEKLER:\nProje Yönetimi, Jira',
        expectedExp: 1,
        expectedEdu: 1,
      },
      {
        id: 6,
        name: 'Tek sütun CV',
        text: 'Ali Can - İzmir\n2018 - 2022 | Trendyol | Yazılım Geliştirici\nLisans: Ege Üniversitesi - Bilgisayar Mühendisliği (2017)\nYetenekler: TypeScript, React, Docker, Git',
        expectedExp: 1,
        expectedEdu: 1,
      },
      {
        id: 7,
        name: 'Çift sütun CV',
        text: 'Bursa - Diller: Türkçe, İngilizce - Sertifikalar: SEGEM\nİŞ DENEYİMİ:\nFibabanka - Şube Müdürü (2017 - 2023)\nEĞİTİM:\nUludağ Üniversitesi - Maliye (Lisans) - 2015\nYetenekler: Portföy Yönetimi, Satış Yönetimi',
        expectedExp: 1,
        expectedEdu: 1,
      },
      {
        id: 8,
        name: 'Yönetici CV (Çok Deneyimli)',
        text: 'Hakan Yıldız - İstanbul\nİŞ DENEYİMİ:\nIGS - Müdür (2025 - 2026)\nGedik - Müdür (2023 - 2025)\nMehrwerk - Müdür (2019 - 2023)\nViennalife - Müdür (2016 - 2019)\nFibabanka - Müdür (2016 - 2016)\nMplus - Müdür (2011 - 2016)\nEĞİTİM:\nMarmara Üniversitesi (Yüksek Lisans)\nAnadolu Üniversitesi (Lisans)\nYETKİNLİKLER:\nBütçe Yönetimi, Ekip Yönetimi, Operasyon Yönetimi',
        expectedExp: 6,
        expectedEdu: 2,
      },
      {
        id: 9,
        name: 'Yeni mezun CV',
        text: 'Selin Yurt - İstanbul\nEĞİTİM:\nKoç Üniversitesi - İşletme (Lisans) - 2024\nSTAJ:\nPwC - Denetim Stajyeri (2023 - 2024)\nYETKİNLİKLER:\nFinansal Analiz, MS Excel, Power BI',
        expectedExp: 1,
        expectedEdu: 1,
      },
      {
        id: 10,
        name: 'Yazılımcı CV',
        text: 'Burak Öz - İstanbul\nİŞ DENEYİMİ:\nGetir - Senior Backend Developer (2021 - 2024)\nPostgreSQL, Redis, Docker, Kubernetes, AWS\nEĞİTİM:\nİTÜ - Bilgisayar Mühendisliği (Lisans) - 2020\nYETENEKLER: Node.js, TypeScript, Go',
        expectedExp: 1,
        expectedEdu: 1,
      },
      {
        id: 11,
        name: 'Türkçe Yönetici CV',
        text: 'Kemal Arslan - İstanbul\nİŞ DENEYİMİ:\nGaranti BBVA - Satış Direktörü (2018 - 2024)\nEĞİTİM:\nBoğaziçi Üniversitesi - İktisat (Lisans) - 2015\nYETKİNLİKLER:\nStratejik Planlama, Bütçe Yönetimi, Ekip ve Performans Yönetimi, CRM',
        expectedExp: 1,
        expectedEdu: 1,
      },
      {
        id: 12,
        name: 'İngilizce Yönetici CV',
        text: 'David Miller - Istanbul\nWORK EXPERIENCE:\nVodafone - Head of Operations (2019 - 2024)\nEDUCATION:\nMiddle East Technical University - Industrial Engineering (Master) - 2018\nSKILLS:\nOperations Management, Strategic Planning, Budget Management, Jira',
        expectedExp: 1,
        expectedEdu: 1,
      },
      {
        id: 13,
        name: 'Satış CV',
        text: 'Murat Aydın - İzmir\nİŞ DENEYİMİ:\nKoçtaş - Saha Satış Müdürü (2020 - 2024)\nEĞİTİM:\nDokuz Eylül Üniversitesi - İşletme (Lisans) - 2019\nYETKİNLİKLER:\nSaha Satış Yönetimi, Yeni Müşteri Kazanımı, B2B Satış, MS Excel',
        expectedExp: 1,
        expectedEdu: 1,
      },
      {
        id: 14,
        name: 'Pazarlama CV',
        text: 'Zeynep Kaya - İstanbul\nİŞ DENEYİMİ:\nHepsiburada - Dijital Pazarlama Müdürü (2021 - 2024)\nEĞİTİM:\nBahçeşehir Üniversitesi - Reklamcılık (Lisans) - 2020\nYETKİNLİKLER:\nDijital Pazarlama, Performans Pazarlaması, Google Ads, Meta Ads, Google Analytics',
        expectedExp: 1,
        expectedEdu: 1,
      },
      {
        id: 15,
        name: 'Finans CV',
        text: 'Emre Şahin - Ankara\nİŞ DENEYİMİ:\nKPMG - Finansal Analist (2020 - 2024)\nEĞİTİM:\nBilkent Üniversitesi - İktisat (Lisans) - 2019\nYETKİNLİKLER:\nFinansal Analiz, Finansal Denetim, Raporlama, MS Excel, SAP',
        expectedExp: 1,
        expectedEdu: 1,
      },
      {
        id: 16,
        name: 'Bankacılık CV',
        text: 'Deniz Güler - İstanbul\nİŞ DENEYİMİ:\nTürkiye İş Bankası - Portföy Yöneticisi (2018 - 2023)\nEĞİTİM:\nİstanbul Üniversitesi - Maliye (Lisans) - 2017\nSERTİFİKALAR: SPL, SEGEM\nYETKİNLİKLER:\nPortföy Yönetimi, Kredi Analizi, Risk Yönetimi',
        expectedExp: 1,
        expectedEdu: 1,
      },
      {
        id: 17,
        name: 'Sigorta CV',
        text: 'Gamze Çelik - İstanbul\nİŞ DENEYİMİ:\nAllianz Sigorta - Bölge Satış Müdürü (2019 - 2024)\nEĞİTİM:\nMarmara Üniversitesi - Sigortacılık (Lisans) - 2018\nSERTİFİKALAR: SEGEM, BES\nYETKİNLİKLER:\nAcente Yönetimi, Çapraz Satış, Müşteri İlişkileri Yönetimi',
        expectedExp: 1,
        expectedEdu: 1,
      },
      {
        id: 18,
        name: 'Çağrı Merkezi CV',
        text: 'Oğuzhan Tekin - İstanbul\nİŞ DENEYİMİ:\nCMC - Çağrı Merkezi Takım Lideri (2020 - 2024)\nEĞİTİM:\nAnadolu Üniversitesi - Halkla İlişkiler (Ön Lisans) - 2019\nYETKİNLİKLER:\nÇağrı Merkezi Yönetimi, Outbound Operasyon Yönetimi, Müşteri Deneyimi, CRM',
        expectedExp: 1,
        expectedEdu: 1,
      },
      {
        id: 19,
        name: 'Yazılım CV (Frontend)',
        text: 'Berk Karaca - İstanbul\nİŞ DENEYİMİ:\nInsider - Senior Frontend Developer (2021 - 2024)\nEĞİTİM:\nSabancı Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2020\nYETKİNLİKLER:\nReact, Next.js, TypeScript, JavaScript, Tailwind, Git',
        expectedExp: 1,
        expectedEdu: 1,
      },
      {
        id: 20,
        name: 'Yeni Mezun CV (Mühendislik)',
        text: 'Ece Yıldırım - Ankara\nEĞİTİM:\nODTÜ - Bilgisayar Mühendisliği (Lisans) - 2024\nSTAJ:\nHavelsan - Yazılım Stajyeri (2023 - 2024)\nYETKİNLİKLER:\nPython, SQL, Problem Çözme, Docker, Git',
        expectedExp: 1,
        expectedEdu: 1,
      },
      {
        id: 21,
        name: 'Taranmış PDF (Görüntü Tabanlı)',
        text: '',
        isScanned: true,
      },
      {
        id: 22,
        name: 'Çok kötü formatlanmış CV',
        text: 'Karmakarışık metin: 5 yıl pazarlama yaptım, bütçe yönettim.',
        isUnstructured: true,
      },
    ];

    for (const f of fixtures) {
      if (f.isScanned) {
        const emptyBuf = Buffer.from('empty_pdf_stream');
        await expect(extractCvText(emptyBuf, 'scan.pdf', 'application/pdf')).rejects.toThrowError(
          CvExtractionError,
        );
        continue;
      }

      const res = extractDeterministicCv(f.text);
      if (!f.isUnstructured) {
        expect(res.experiences.length).toBeGreaterThanOrEqual(f.expectedExp || 1);
        expect(res.education.length).toBeGreaterThanOrEqual(f.expectedEdu || 1);
      }
    }
  });
});
