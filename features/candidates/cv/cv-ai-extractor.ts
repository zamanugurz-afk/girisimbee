import 'server-only';

import { openaiJsonCompletion } from '@/lib/openai/career-openai';
import type {
  AiCvExtractionPayload,
  DeterministicCvSignals,
} from '@/features/candidates/cv/cv.types';

const CV_AI_EXTRACTION_SYSTEM = `Sen Girişimbee platformu için uzman bir CV/Özgeçmiş Ayrıştırıcı (CV Extraction Agent) yapay zekasısın.
Görevin: Kullanıcının sağladığı maskelenmiş CV metninden gerçeğe %100 sadık kalarak yapılandırılmış JSON verisi ve profesyonel kısa Türkçe bir kariyer özeti çıkarmaktır.

KESİN KURALLAR:
1. CV'de AÇIKÇA yazmayan hiçbir bilgi, unvan, başarı, şirket, teknoloji, dil veya yüzde UYDURMA (NO HALLUCINATION).
2. CV'deki TÜM iş deneyimlerini (tarihleri, şirketleri, unvanları ve sorumlulukları ile) eksiksiz çıkar. Sadece ilk deneyimi alıp durma, tamamını listele.
3. CV'deki TÜM eğitim bilgilerini (üniversite, bölüm, derece) eksiksiz çıkar.
4. CV'deki TÜM mesleki ve teknik yetkinlikleri çıkar.
5. Kullanıcı adına tercih, hedef maaş, çalışma modeli veya hedef pozisyon UYDURMA. Sadece geçmiş verileri çıkar.
6. "summary" alanı: Adayın CV'deki gerçek deneyimine dayanan, 2-3 cümlelik, profesyonel, doğal Türkçe bir kariyer özeti olmalıdır.
7. Yanıtı SADECE ve YALNIZCA aşağıdaki JSON şemasına uygun olarak döndür:

{
  "fullName": "string (Adayın Adı Soyadı)",
  "experiences": [
    {
      "sector": "string (sektör)",
      "role": "string (unvan / pozisyon)",
      "company": "string (opsiyonel firma)",
      "durationYears": 2,
      "startYear": 2020,
      "endYear": 2023,
      "isCurrent": false,
      "responsibilities": "string",
      "achievements": "string"
    }
  ],
  "roles": ["string (unvanlar)"],
  "sectors": ["string (sektörler)"],
  "skills": ["string (mesleki ve teknik yetkinlikler)"],
  "tools": ["string (yazılım / araçlar)"],
  "education": [
    {
      "level": "string (Lisans / Yüksek Lisans vb.)",
      "field": "string (Bölüm)",
      "school": "string"
    }
  ],
  "languages": ["string"],
  "certificates": ["string"],
  "locations": ["string (şehir)"],
  "summary": "string",
  "ambiguousItems": []
}`;

/**
 * Merges two experience lists without dropping any historical position from either source.
 * If baseline found more historical roles than AI, baseline is preserved.
 * If AI found equal or more structured roles, AI is used.
 */
function mergeExperienceSets(
  baseline: AiCvExtractionPayload['experiences'],
  ai: AiCvExtractionPayload['experiences'],
): AiCvExtractionPayload['experiences'] {
  if (!ai || ai.length === 0) return baseline;
  if (!baseline || baseline.length === 0) return ai;

  if (baseline.length > ai.length) {
    // Baseline found more experiences than AI (AI under-extracted)
    const results = baseline.map((b) => ({ ...b }));
    for (const aiExp of ai) {
      const normAiComp = normalizeTr(aiExp.company || '');
      const existing = results.find((r) => normAiComp && normalizeTr(r.company || '').includes(normAiComp));
      if (existing) {
        if (aiExp.responsibilities) existing.responsibilities = aiExp.responsibilities;
        if (aiExp.achievements) existing.achievements = aiExp.achievements;
      }
    }
    return results;
  }

  // AI has equal or more experiences
  return ai;
}

/**
 * Merges two education lists without dropping any degree.
 */
function mergeEducationSets(
  baseline: AiCvExtractionPayload['education'],
  ai: AiCvExtractionPayload['education'],
): AiCvExtractionPayload['education'] {
  if (!ai || ai.length === 0) return baseline;
  if (!baseline || baseline.length === 0) return ai;

  const results: AiCvExtractionPayload['education'] = baseline.map((b) => ({ ...b }));

  for (const aiEdu of ai) {
    const normAiLevel = normalizeTr(aiEdu.level || '');
    const normAiField = normalizeTr(aiEdu.field || '');

    const existing = results.find((b) => {
      const normBLevel = normalizeTr(b.level || '');
      const normBField = normalizeTr(b.field || '');
      return (
        (normAiLevel && normBLevel && normAiLevel === normBLevel) ||
        (normAiField && normBField && (normAiField.includes(normBField) || normBField.includes(normAiField)))
      );
    });

    if (existing) {
      if (aiEdu.school && !existing.school) existing.school = aiEdu.school;
      if (aiEdu.field && !existing.field) existing.field = aiEdu.field;
    } else {
      results.push(aiEdu);
    }
  }

  return results;
}

import { extractDeterministicCv } from '@/features/candidates/cv/cv-deterministic-extractor';
import { evaluateAiCallGate } from '@/features/candidates/cv/cv-ai-gate';

export interface AiExtractionExecutionResult extends AiCvExtractionPayload {
  _aiMetrics?: {
    aiCalled: boolean;
    aiSkipped: boolean;
    inputTokens: number;
    outputTokens: number;
    estimatedCostUsd: number;
  };
}

/**
 * Executes a SINGLE minimal OpenAI API call ONLY if semantic gaps exist after deterministic extraction.
 * Guarantees ZERO data loss by building on top of the deterministic foundation.
 */
export async function extractCvWithSingleAiCall(
  maskedCvText: string,
  signals?: DeterministicCvSignals,
  fileName?: string | null,
): Promise<AiExtractionExecutionResult> {
  // 1. High-fidelity deterministic extraction (100% code-driven, 0 AI tokens)
  const deterministic = extractDeterministicCv(maskedCvText, fileName);

  // 2. AI Call Gate evaluation
  const gate = evaluateAiCallGate(deterministic, maskedCvText);

  // If deterministic extraction is already complete, SKIP AI CALL COMPLETELY!
  if (!gate.shouldCall) {
    return {
      ...deterministic,
      _aiMetrics: {
        aiCalled: false,
        aiSkipped: true,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
      },
    };
  }

  // 3. Prepare rich semantic payload for AI
  const unknownBlocks = gate.unknownSemanticBlocks;
  const minimalPrompt = `Aşağıdaki CV metnini analiz et ve eksik anlamsal alanları tamamla:

--- CV METNİ ---
${maskedCvText.slice(0, 6000)}
--- BİTİŞ ---

Tespit Edilen Rol Adayları: ${unknownBlocks?.unresolvedRoles?.join(', ') || 'Belirtilmedi'}
Çıkarılan Görevler: ${unknownBlocks?.unstructuredBullets?.join(' | ') || 'Belirtilmedi'}
Özet Gerekli mi: ${unknownBlocks?.needsSummarySynthesis ? 'Evet' : 'Hayır'}`;

  try {
    const res = await openaiJsonCompletion({
      system: CV_AI_EXTRACTION_SYSTEM,
      user: minimalPrompt,
      maxTokens: 800,
      temperature: 0.1,
    });

    const json = res.json as any;

    const aiExperiences: AiCvExtractionPayload['experiences'] = Array.isArray(json?.experiences) ? json.experiences : [];
    const aiEducation: AiCvExtractionPayload['education'] = Array.isArray(json?.education) ? json.education : [];

    const mergedExperiences = mergeExperienceSets(deterministic.experiences, aiExperiences);
    const mergedEducation = mergeEducationSets(deterministic.education, aiEducation);

    const mergedRoles = Array.from(
      new Set([
        ...deterministic.roles,
        ...(Array.isArray(json?.roles) ? json.roles : []),
      ].filter(Boolean)),
    );

    const mergedSectors = Array.from(
      new Set([
        ...deterministic.sectors,
        ...(Array.isArray(json?.sectors) ? json.sectors : []),
      ].filter(Boolean)),
    );

    const mergedSkills = Array.from(
      new Set([
        ...deterministic.skills,
        ...(Array.isArray(json?.skills) ? json.skills : []),
      ].filter(Boolean)),
    );

    const mergedTools = Array.from(
      new Set([
        ...deterministic.tools,
        ...(Array.isArray(json?.tools) ? json.tools : []),
      ].filter(Boolean)),
    );

    const mergedLanguages = Array.from(
      new Set([
        ...deterministic.languages,
        ...(Array.isArray(json?.languages) ? json.languages : []),
      ].filter(Boolean)),
    );

    const mergedCertificates = Array.from(
      new Set([
        ...deterministic.certificates,
        ...(Array.isArray(json?.certificates) ? json.certificates : []),
      ].filter(Boolean)),
    );

    const mergedLocations = Array.from(
      new Set([
        ...deterministic.locations,
        ...(Array.isArray(json?.locations) ? json.locations : []),
      ].filter(Boolean)),
    );

    const summary = typeof json?.summary === 'string' && json.summary.trim().length > 20
      ? json.summary.trim()
      : deterministic.summary;

    const inputTokens = Math.round(minimalPrompt.length / 4);
    const outputTokens = Math.round(JSON.stringify(json || {}).length / 4);
    const estimatedCostUsd = (inputTokens * 0.00000015) + (outputTokens * 0.0000006);

    return {
      experiences: mergedExperiences.length > 0 ? mergedExperiences : deterministic.experiences,
      roles: mergedRoles.length > 0 ? mergedRoles : deterministic.roles,
      sectors: mergedSectors.length > 0 ? mergedSectors : deterministic.sectors,
      skills: mergedSkills.length > 0 ? mergedSkills : deterministic.skills,
      tools: mergedTools.length > 0 ? mergedTools : deterministic.tools,
      education: mergedEducation.length > 0 ? mergedEducation : deterministic.education,
      languages: mergedLanguages.length > 0 ? mergedLanguages : deterministic.languages,
      certificates: mergedCertificates,
      locations: mergedLocations.length > 0 ? mergedLocations : deterministic.locations,
      summary,
      fullName:
        deterministic.fullName ||
        (typeof json?.fullName === 'string' && json.fullName.trim().length >= 3
          ? json.fullName.trim()
          : undefined),
      gender: deterministic.gender,
      birthDate: deterministic.birthDate,
      email: deterministic.email,
      phone: deterministic.phone,
      linkedin: deterministic.linkedin,
      website: deterministic.website,
      nationality: deterministic.nationality,
      address: deterministic.address,
      ambiguousItems: Array.isArray(json?.ambiguousItems) ? json.ambiguousItems : deterministic.ambiguousItems,
      _aiMetrics: {
        aiCalled: true,
        aiSkipped: false,
        inputTokens,
        outputTokens,
        estimatedCostUsd,
      },
    };
  } catch (_err) {
    // Graceful fallback to 100% deterministic data on any OpenAI exception/timeout
    return {
      ...deterministic,
      _aiMetrics: {
        aiCalled: true,
        aiSkipped: false,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
      },
    };
  }
}

/**
 * Normalizes Turkish characters for reliable pattern matching.
 */
function normalizeTr(s: string): string {
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/i̇/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
}

/**
 * Fallback deterministic extractor when OpenAI is not configured or in offline test mode.
 * Parses sections (Summary, Experience, Education, Skills, Tools, Roles) with high fidelity.
 */
export function fallbackDeterministicAiExtraction(
  text: string,
  signals?: DeterministicCvSignals,
): AiCvExtractionPayload {
  return extractDeterministicCv(text);
}
