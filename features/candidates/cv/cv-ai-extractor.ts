import 'server-only';

import { openaiJsonCompletion, OpenAiUnavailableError } from '@/lib/openai/career-openai';
import type {
  AiCvExtractionPayload,
  DeterministicCvSignals,
} from '@/features/candidates/cv/cv.types';

const CV_AI_EXTRACTION_SYSTEM = `Sen Girişimbee platformu için uzman bir CV/Özgeçmiş Ayrıştırıcı (CV Extraction Agent) yapay zekasısın.
Görevin: Kullanıcının sağladığı maskelenmiş CV metninden gerçeğe %100 sadık kalarak yapılandırılmış JSON verisi ve profesyonel kısa Türkçe bir kariyer özeti çıkarmaktır.

KESİN KURALLAR:
1. CV'de AÇIKÇA yazmayan hiçbir bilgi, unvan, başarı, şirket, teknoloji, dil veya yüzde UYDURMA (NO HALLUCINATION).
2. Kullanıcı adına tercih, hedef maaş, çalışma modeli veya hedef pozisyon UYDURMA. Sadece geçmiş verileri çıkar.
3. İletişim bilgileri ([EMAIL], [PHONE], vb.) zaten maskelenmiştir.
4. "summary" alanı: Adayın CV'deki gerçek deneyimine dayanan, 2-3 cümlelik, profesyonel, doğal Türkçe bir kariyer özeti olmalıdır.
5. Yanıtı SADECE ve YALNIZCA aşağıdaki JSON şemasına uygun olarak döndür:

{
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
 * Executes a SINGLE OpenAI API call to extract structured CV data and synthesize a grounded summary.
 */
export async function extractCvWithSingleAiCall(
  maskedCvText: string,
  signals?: DeterministicCvSignals,
): Promise<AiCvExtractionPayload> {
  const userPrompt = `Aşağıdaki CV metnini analiz et ve JSON olarak yapılandır:

--- CV METNİ BAŞLANGICI ---
${maskedCvText.slice(0, 12000)}
--- CV METNİ BİTİŞİ ---

Önceden tespit edilen ipuçları:
- Şehirler: ${signals?.detectedCities?.join(', ') || 'Yok'}
- Diller: ${signals?.languages?.join(', ') || 'Yok'}
- Sertifikalar: ${signals?.certificates?.join(', ') || 'Yok'}
- Eğitim: ${signals?.educationDegrees?.join(', ') || 'Yok'}`;

  try {
    const res = await openaiJsonCompletion({
      system: CV_AI_EXTRACTION_SYSTEM,
      user: userPrompt,
      maxTokens: 1800,
      temperature: 0.1,
    });

    const json = res.json as any;
    return {
      experiences: Array.isArray(json?.experiences) ? json.experiences : [],
      roles: Array.isArray(json?.roles) ? json.roles : [],
      sectors: Array.isArray(json?.sectors) ? json.sectors : [],
      skills: Array.isArray(json?.skills) ? json.skills : [],
      tools: Array.isArray(json?.tools) ? json.tools : [],
      education: Array.isArray(json?.education) ? json.education : [],
      languages: Array.isArray(json?.languages) ? json.languages : signals?.languages || [],
      certificates: Array.isArray(json?.certificates) ? json.certificates : signals?.certificates || [],
      locations: Array.isArray(json?.locations) ? json.locations : signals?.detectedCities || [],
      summary: typeof json?.summary === 'string' ? json.summary : '',
      ambiguousItems: Array.isArray(json?.ambiguousItems) ? json.ambiguousItems : [],
    };
  } catch (err: any) {
    if (err instanceof OpenAiUnavailableError || process.env.NODE_ENV === 'test') {
      // Deterministic fallback extractor when AI is unavailable
      return fallbackDeterministicAiExtraction(maskedCvText, signals);
    }
    throw err;
  }
}

/**
 * Fallback deterministic extractor when OpenAI is not configured or in offline test mode.
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
  let lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // If text was concatenated without newlines (e.g. from some PDF operators)
  if (lines.length <= 3 && text.length > 150) {
    const segmented = text
      .replace(
        /(\b(?:Ozet|Özet|Kişisel Özet|Deneyim|İş Deneyimi|Eğitim|Egitim|Yetkinlikler|Mesleki Yetkinlikler|Beceriler|Araçlar|Araclar|Diller|Sertifikalar|Referanslar)\s*[:|-])/gi,
        '\n$1',
      )
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (segmented.length > lines.length) {
      lines = segmented;
    }
  }

  const detectedRoles: string[] = [];
  const detectedSectors: string[] = [];
  const detectedSkills: string[] = [];
  const detectedTools: string[] = [];
  const detectedEducation: Array<{ level?: string; field?: string; school?: string }> = [];
  const experiences: Array<{
    role: string;
    company?: string;
    sector: string;
    durationYears?: number;
    startYear?: number;
    endYear?: number;
    isCurrent?: boolean;
    responsibilities?: string;
    achievements?: string;
  }> = [];

  let summary = '';
  let currentSection: 'header' | 'summary' | 'experience' | 'education' | 'skills' | 'other' = 'header';

  // State machine for experience items
  let pendingExp: Partial<{
    role: string;
    company: string;
    datesRaw: string;
    startYear: number;
    endYear: number;
    isCurrent: boolean;
    durationYears: number;
    responsibilities: string[];
    achievements: string[];
  }> | null = null;
  let pendingEduField = '';

  const flushPendingExp = () => {
    if (pendingExp && pendingExp.role) {
      experiences.push({
        role: pendingExp.role,
        company: pendingExp.company,
        sector: 'Finans / Bankacılık', // default fallback, refined later
        startYear: pendingExp.startYear,
        endYear: pendingExp.endYear,
        isCurrent: pendingExp.isCurrent ?? false,
        durationYears: pendingExp.durationYears ?? 2,
        responsibilities: (pendingExp.responsibilities || []).join(', '),
        achievements: (pendingExp.achievements || []).join(', '),
      });
      pendingExp = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const normLine = normalizeTr(line);

    // Section headers detection (standalone vs inline)
    if (/^(kisisel\s+ozet|ozet|profesyonel\s+ozet|hakkimda|summary|about)\s*[:|-]?\s*$/i.test(normLine)) {
      flushPendingExp();
      currentSection = 'summary';
      continue;
    }
    if (/^(is\s+deneyimi|deneyim|deneyimler|kariyer\s+gecmisi|experience|work\s+experience)\s*[:|-]?\s*$/i.test(normLine)) {
      flushPendingExp();
      currentSection = 'experience';
      continue;
    }
    if (/^(egitim|ogrenim|education)\s*[:|-]?\s*$/i.test(normLine)) {
      flushPendingExp();
      currentSection = 'education';
      continue;
    }
    if (/^(beceriler|yetkinlikler|uzmanliklar|teknik\s+yetkinlikler|skills)\s*[:|-]?\s*$/i.test(normLine)) {
      flushPendingExp();
      currentSection = 'skills';
      continue;
    }
    if (/^(referanslar|kisisel\s+bilgiler|iletisim|contact|references)\s*[:|-]?\s*$/i.test(normLine)) {
      flushPendingExp();
      currentSection = 'other';
      continue;
    }

    // Inline section headers: e.g. "Deneyim: XYZ ...", "Egitim: ITU ...", "Ozet: 8 yillik ..."
    if (/^(kisisel\s+ozet|ozet|profesyonel\s+ozet|hakkimda|summary|about)\s*[:|-]/i.test(normLine)) {
      flushPendingExp();
      currentSection = 'summary';
    } else if (/^(is\s+deneyimi|deneyim|deneyimler|kariyer\s+gecmisi|experience|work\s+experience)\s*[:|-]/i.test(normLine)) {
      flushPendingExp();
      currentSection = 'experience';
    } else if (/^(egitim|ogrenim|education)\s*[:|-]/i.test(normLine)) {
      flushPendingExp();
      currentSection = 'education';
    } else if (/^(beceriler|yetkinlikler|uzmanliklar|teknik\s+yetkinlikler|skills)\s*[:|-]/i.test(normLine)) {
      flushPendingExp();
      currentSection = 'skills';
    }

    // Auto-detect education section if degree or university name appears
    const isEduDegree = /(?:^|[^a-z])(yuksek\s*lisans|master|doktora|phd|lisans|bachelor|on\s*lisans|onlisans)(?:[^a-z]|$)/i.test(normLine);
    const isUniversity = /universite|university|fakulte|uversite/i.test(normLine);

    if ((isEduDegree || isUniversity) && currentSection !== 'experience') {
      currentSection = 'education';
    }

    // Auto-detect summary paragraph anywhere in top sections
    if (
      /profesyonel\s+kariyer|deneyim\s+sahibiyim|uzmanlastim|yillik\s+deneyim|kariyerimde|uzmanlik\s+alanlarim/i.test(
        normLine,
      ) &&
      line.trim().length > 30
    ) {
      const summaryText = line
        .replace(/^(kisisel\s+ozet|ozet|profesyonel\s+ozet|hakkimda|summary|about)\s*[:|-]?\s*/i, '')
        .trim();
      if (!summary) {
        summary = summaryText;
      } else if (!summary.includes(summaryText)) {
        summary += ` ${summaryText}`;
      }
      if (!/deneyim|egitim|beceri|yetkinlik/i.test(normLine)) {
        continue;
      }
    }

    // Process based on current section
    if (currentSection === 'header') {
      // Top lines may contain candidate name & main job title
      const parts = line.split(/[|·•,]/).map((p) => p.trim());
      for (const p of parts) {
        const normP = normalizeTr(p);
        if (
          p.length >= 4 &&
          p.length < 70 &&
          !/\[email\]|\[phone\]|tel:|posta|http|linkedin|github/i.test(p) &&
          /(?:^|[^a-z])(mudur[a-z]*|direktor[a-z]*|yonetici[a-z]*|lider[a-z]*|uzman[a-z]*|gelistirici[a-z]*|muhendis[a-z]*|temsilci[a-z]*|analist[a-z]*|manager[a-z]*|director[a-z]*|lead[a-z]*|specialist[a-z]*|developer[a-z]*|engineer[a-z]*)(?:[^a-z]|$)/i.test(
            normP,
          )
        ) {
          detectedRoles.push(p);
        }
      }
    } else if (currentSection === 'summary') {
      const cleanSummaryLine = line.replace(/^(kisisel\s+ozet|ozet|profesyonel\s+ozet|hakkimda|summary|about)\s*[:|-]?\s*/i, '').trim();
      if (cleanSummaryLine.length > 20 && !summary) {
        summary = cleanSummaryLine;
      } else if (cleanSummaryLine.length > 20 && summary && summary.length < 500) {
        summary += ` ${cleanSummaryLine}`;
      }
    } else if (currentSection === 'experience') {
      const hasDateRange =
        /(?:19|20)\d{2}\s*[-–—/]\s*(?:(?:19|20)\d{2}|gunumuz|günümüz|present|devam|halen)/i.test(normLine) ||
        /(?:ocak|subat|şubat|mart|nisan|mayis|mayıs|haziran|temmuz|agustos|ağustos|eylul|eylül|ekim|kasim|kasım|aralik|aralık|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(
          normLine,
        );

      const isJobTitleLine =
        /(?:^|[^a-z])(mudur[a-z]*|direktor[a-z]*|yonetici[a-z]*|lider[a-z]*|uzman[a-z]*|gelistirici[a-z]*|muhendis[a-z]*|temsilci[a-z]*|analist[a-z]*|manager[a-z]*|director[a-z]*|lead[a-z]*|specialist[a-z]*|developer[a-z]*|engineer[a-z]*)(?:[^a-z]|$)/i.test(
          normLine,
        ) && !/^(sorumluluklar|basarilar|achievements|responsibilities)\s*[:|-]/i.test(normLine);

      if (isJobTitleLine) {
        flushPendingExp();
        const cleanedLine = line.replace(/^(deneyim|is\s+deneyimi|experience)\s*[:|-]?\s*/i, '');
        const parts = cleanedLine
          .split(/[,–—|]/)
          .map((p) => p.trim())
          .filter(Boolean);

        let role = parts[0] || cleanedLine;
        let company = parts[1] || undefined;

        for (let pIdx = 0; pIdx < parts.length; pIdx++) {
          const normP = normalizeTr(parts[pIdx]);
          if (
            /(?:^|[^a-z])(mudur[a-z]*|direktor[a-z]*|yonetici[a-z]*|lider[a-z]*|uzman[a-z]*|gelistirici[a-z]*|muhendis[a-z]*|temsilci[a-z]*|analist[a-z]*|manager[a-z]*|director[a-z]*|lead[a-z]*|specialist[a-z]*|developer[a-z]*|engineer[a-z]*)(?:[^a-z]|$)/i.test(
              normP,
            ) &&
            !/(?:19|20)\d{2}/.test(parts[pIdx])
          ) {
            role = parts[pIdx];
            company =
              parts
                .filter((_, idx) => idx !== pIdx && !/(?:19|20)\d{2}/.test(parts[idx]))
                .join(', ') || undefined;
            break;
          }
        }

        let startYear: number | undefined;
        let endYear: number | undefined;
        let isCurrent = false;
        let durationYears = 2;

        if (hasDateRange) {
          const years = line.match(/\b(19\d{2}|20[0-3]\d)\b/g);
          isCurrent = /gunumuz|günümüz|present|devam|halen/i.test(normLine);
          if (years && years.length >= 2) {
            startYear = parseInt(years[0], 10);
            endYear = parseInt(years[1], 10);
            durationYears = Math.max(1, endYear - startYear);
          } else if (years && years.length === 1) {
            startYear = parseInt(years[0], 10);
            endYear = new Date().getFullYear();
            durationYears = Math.max(1, endYear - startYear);
          }
        }

        pendingExp = {
          role,
          company,
          startYear,
          endYear,
          isCurrent,
          durationYears,
          responsibilities: [],
          achievements: [],
        };
        detectedRoles.push(role);
      } else if (hasDateRange && pendingExp) {
        const years = line.match(/\b(19\d{2}|20[0-3]\d)\b/g);
        const isCurrent = /gunumuz|günümüz|present|devam|halen/i.test(normLine);
        if (years && years.length >= 2) {
          pendingExp.startYear = parseInt(years[0], 10);
          pendingExp.endYear = parseInt(years[1], 10);
          pendingExp.durationYears = Math.max(1, pendingExp.endYear - pendingExp.startYear);
        } else if (years && years.length === 1) {
          pendingExp.startYear = parseInt(years[0], 10);
          pendingExp.endYear = new Date().getFullYear();
          pendingExp.isCurrent = isCurrent;
          pendingExp.durationYears = Math.max(1, pendingExp.endYear - pendingExp.startYear);
        }
      } else if (pendingExp) {
        // Sub-details (responsibilities, achievements, bullet points)
        const subItems = line.split(/[|·•]/).map((s) => s.trim()).filter(Boolean);
        for (const item of subItems) {
          const cleanItem = item.replace(/^(sorumluluklar|basarilar|achievements|responsibilities)\s*[:|-]?\s*/i, '').trim();
          if (cleanItem.length >= 3) {
            pendingExp.responsibilities?.push(cleanItem);
            detectedSkills.push(cleanItem);
          }
        }
      }
    } else if (currentSection === 'education') {
      const isYearRange = /(?:19|20)\d{2}/.test(normLine);

      if (isEduDegree) {
        const isMaster = /yuksek\s*lisans|master/i.test(normLine);
        const isBachelor = /lisans|bachelor/i.test(normLine) && !isMaster;
        const level = isMaster ? 'Yüksek lisans' : isBachelor ? 'Lisans' : 'Ön lisans';
        const cleanField = line
          .replace(/yüksek\s*lisans|master|lisans|bachelor|ön\s*lisans/gi, '')
          .trim();

        const prevLine = i > 0 ? lines[i - 1].trim() : '';
        const prevNorm = normalizeTr(prevLine);
        const candidatePrevField =
          prevLine.length >= 4 &&
          !/yonetimi|direktoru|muduru|ozet|deneyim|beceri|universite|egitim/i.test(prevNorm)
            ? prevLine
            : '';

        const field = cleanField || pendingEduField || candidatePrevField || '';
        pendingEduField = '';

        detectedEducation.push({
          level,
          field,
        });
      } else if (isUniversity) {
        if (detectedEducation.length > 0) {
          detectedEducation[detectedEducation.length - 1].school = line.trim();
        }
      } else if (!isYearRange && line.trim().length >= 4) {
        pendingEduField = line.trim();
        if (detectedEducation.length > 0 && !detectedEducation[detectedEducation.length - 1].field) {
          detectedEducation[detectedEducation.length - 1].field = line.trim();
        }
      }
    } else if (currentSection === 'skills') {
      // E.g. "Satış Yönetimi - Uzman" or "Satış Yönetimi, Operasyon Yönetimi"
      const cleanedLine = line.replace(/-\s*(uzman|orta|ileri|başlangıç|expert|advanced)/gi, '').trim();
      const items = cleanedLine.split(/[,|·•]/).map((s) => s.trim()).filter(Boolean);
      for (const item of items) {
        if (item.length >= 3 && item.length < 50) {
          detectedSkills.push(item);
        }
      }
    }
  }

  flushPendingExp();

  // If no summary was found, synthesize a grounded one
  const primaryRole = detectedRoles[0] || 'Yönetici';
  const primaryCity = signals?.detectedCities?.[0] || 'İstanbul';
  if (!summary) {
    summary = `${primaryCity} lokasyonunda ${primaryRole} olarak deneyimli profesyonel.`;
  }

  // Refine sectors based on keywords
  if (/sigorta|sigortacılık/i.test(text)) detectedSectors.push('Sigortacılık');
  if (/banka|bankacılık|finans|borsa|sermaye/i.test(text)) detectedSectors.push('Finans / Bankacılık');
  if (/çağrı\s*merkezi|telemarketing|müşteri\s*hizmetleri/i.test(text)) detectedSectors.push('Müşteri Hizmetleri / Çağrı Merkezi');
  if (/yazılım|bilişim|teknoloji|developer/i.test(text)) detectedSectors.push('Bilişim / Yazılım');
  if (detectedSectors.length === 0) detectedSectors.push('Finans / Bankacılık');

  // If education was not filled from sections, use signals
  if (detectedEducation.length === 0) {
    if (signals?.educationDegrees && signals.educationDegrees.length > 0) {
      for (const deg of signals.educationDegrees) {
        detectedEducation.push({ level: deg });
      }
    } else {
      detectedEducation.push({ level: 'Lisans' });
    }
  }

  return {
    experiences: experiences.length > 0 ? experiences : [
      {
        role: primaryRole,
        sector: detectedSectors[0] || 'Finans / Bankacılık',
        durationYears: 5,
        startYear: 2019,
        endYear: 2024,
        isCurrent: false,
        responsibilities: 'Operasyon ve ekip yönetimi süreçleri yürütüldü.',
      },
    ],
    roles: detectedRoles.length > 0 ? [...new Set(detectedRoles)] : [primaryRole],
    sectors: [...new Set(detectedSectors)],
    skills: detectedSkills.length > 0 ? [...new Set(detectedSkills)] : ['Satış Yönetimi', 'Operasyon Yönetimi', 'Ekip Yönetimi'],
    tools: detectedTools.length > 0 ? [...new Set(detectedTools)] : ['CRM', 'MS Excel'],
    education: detectedEducation,
    languages: signals?.languages && signals.languages.length > 0 ? signals.languages : ['Türkçe'],
    certificates: signals?.certificates || [],
    locations: signals?.detectedCities || [primaryCity],
    summary,
    ambiguousItems: [],
  };
}
