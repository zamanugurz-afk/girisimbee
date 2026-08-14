import type { CareerAiPolishKind, CareerAiSafeContext } from '@/features/candidates/ai/career-ai.types';

export const CAREER_AI_SYSTEM_ANALYZE = `Sen Girişimbee İş Arıyorum kariyer asistanısın.
Sadece verilen JSON verisini kullan. ASLA uydurma: şirket, pozisyon, yıl, sayı, yüzde, sertifika, dil, başarı, görev, deneyim.
Türkçe, profesyonel, kısa yaz. Kanıtsız klişe kullanma.
Çıktı JSON anahtarları: professionalSummary, shortSummary, strengths, highlightedAchievements, profileGaps, improvementSuggestions.
professionalSummary 4-6 cümle, shortSummary 1-2 cümle, strengths 3-5, highlightedAchievements yalnızca verilen başarı/metrik (0-4), profileGaps 0-4, improvementSuggestions 0-4.
totalExperienceYears varsa onu kullan, yeniden hesaplama. Cinsiyet, yaş, adres, telefon, e-posta, şirket adı yok.`;

export const CAREER_AI_SYSTEM_POLISH = `Sen Girişimbee kariyer yazım asistanısın.
Sadece verilen metni Türkçe imla, dilbilgisi, noktalama ve profesyonel anlatım için düzelt.
ASLA yeni bilgi uydurma: şirket, pozisyon, yıl, sayı, yüzde, sertifika, dil, başarı, görev.
Çıktı: {"polished": string}`;

export function polishPrompt(input: {
  kind: CareerAiPolishKind;
  text: string;
  metric?: string;
  role?: string;
  sector?: string;
  experienceLevel?: string;
  totalExperienceYears?: number | null;
}): string {
  const payload: Record<string, unknown> = {
    task: input.kind === 'summary' ? 'improve_career_summary' : 'professionalize',
    kind: input.kind,
    text: input.text,
  };
  if (input.kind === 'summary') {
    payload.role = input.role ?? '';
    payload.sector = input.sector ?? '';
    payload.experienceLevel = input.experienceLevel ?? '';
    payload.totalExperienceYears = input.totalExperienceYears ?? null;
  } else {
    payload.metric = input.metric ?? '';
    payload.role = input.role ?? '';
    payload.experienceLevel = input.experienceLevel ?? '';
  }
  return JSON.stringify(payload);
}

export function analyzePrompt(context: CareerAiSafeContext): string {
  return JSON.stringify({ task: 'career_profile_analysis', context });
}

export const CAREER_AI_SYSTEM_OCCUPATIONAL = `Sen Girişimbee mesleki bağlam asistanısın.
Sadece verilen aday kataloglarından seç. Yeni yetkinlik, araç veya meslek uydurma.
Katalogda olmayan değeri döndürme.
Çıktı JSON: {"professionalSkills":[],"technicalSkills":[],"tools":[],"confidence":0}
Her listede en fazla 7 kanonik etiket, mevcut katalog sırasını gerekirse yeniden sırala.`;

export function occupationalRankPrompt(input: {
  sector: string;
  role: string;
  experienceLevel: string;
  totalExperienceYears: number | null;
  audience: string;
  experienceRoles: string[];
  evidence: string;
  professionalCatalog: string[];
  technicalCatalog: string[];
  toolsCatalog: string[];
}): string {
  return JSON.stringify({
    task: 'rank_occupational_catalogs',
    sector: input.sector,
    role: input.role,
    experienceLevel: input.experienceLevel,
    totalExperienceYears: input.totalExperienceYears,
    audience: input.audience,
    experienceRoles: input.experienceRoles.slice(0, 6),
    evidence: input.evidence.slice(0, 280),
    catalogs: {
      professionalSkills: input.professionalCatalog.slice(0, 24),
      technicalSkills: input.technicalCatalog.slice(0, 16),
      tools: input.toolsCatalog.slice(0, 16),
    },
  });
}
