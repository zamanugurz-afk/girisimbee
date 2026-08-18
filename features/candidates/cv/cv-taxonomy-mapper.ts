import { getAllTaxonomyPositions } from '@/features/candidates/taxonomy/career-taxonomy';
import { suggestTitleCaseTr } from '@/features/candidates/lib/career-text-quality';
import { JOB_SECTOR_OPTIONS } from '@/features/listings/config/listing-field-options';
import type {
  AiCvExtractionPayload,
  CanonicalTaxonomyMappingResult,
  RawAmbiguousCvItem,
} from '@/features/candidates/cv/cv.types';
import type { CareerExperience } from '@/features/candidates/config/career-profile-fields';

// Canonical Alias Dictionary for Roles (lower-case raw -> canonical Turkish Title Case)
const ROLE_ALIASES: Record<string, string> = {
  // Software / Tech
  'software engineer': 'Yazılım Geliştirici',
  'software developer': 'Yazılım Geliştirici',
  'senior software developer': 'Yazılım Geliştirici',
  'senior software engineer': 'Yazılım Geliştirici',
  'senior developer': 'Yazılım Geliştirici',
  'frontend developer': 'Frontend Geliştirici',
  'front-end developer': 'Frontend Geliştirici',
  'backend developer': 'Backend Geliştirici',
  'back-end developer': 'Backend Geliştirici',
  'full stack developer': 'Full Stack Geliştirici',
  'full-stack developer': 'Full Stack Geliştirici',
  'fullstack developer': 'Full Stack Geliştirici',
  'mobile developer': 'Mobil Uygulama Geliştirici',
  'ios developer': 'Mobil Uygulama Geliştirici',
  'android developer': 'Mobil Uygulama Geliştirici',
  'devops engineer': 'DevOps Mühendisi',
  'qa engineer': 'Yazılım Test Mühendisi',
  'test engineer': 'Yazılım Test Mühendisi',
  'data scientist': 'Veri Bilimci',
  'data analyst': 'Veri Analisti',
  'data engineer': 'Veri Mühendisi',
  'system admin': 'Sistem Yöneticisi',
  'system administrator': 'Sistem Yöneticisi',
  'cyber security specialist': 'Siber Güvenlik Uzmanı',

  // Sales & Marketing
  'sales specialist': 'Satış Uzmanı',
  'sales executive': 'Satış Uzmanı',
  'sales representative': 'Satış Temsilcisi',
  'sales consultant': 'Satış Danışmanı',
  'account executive': 'Müşteri Yöneticisi',
  'account manager': 'Müşteri Yöneticisi',
  'sales manager': 'Satış Müdürü',
  'business development specialist': 'İş Geliştirme Uzmanı',
  'business development manager': 'İş Geliştirme Müdürü',
  'marketing specialist': 'Pazarlama Uzmanı',
  'digital marketing specialist': 'Dijital Pazarlama Uzmanı',
  'growth marketing specialist': 'Dijital Pazarlama Uzmanı',
  'seo specialist': 'SEO Uzmanı',
  'content specialist': 'İçerik Uzmanı',
  'social media specialist': 'Sosyal Medya Uzmanı',
  'brand manager': 'Marka Yöneticisi',

  // Product & Project Management
  'product manager': 'Ürün Yöneticisi',
  'product owner': 'Ürün Sahibi',
  'project manager': 'Proje Yöneticisi',
  'scrum master': 'Scrum Master',
  'agile coach': 'Agile Koç',

  // HR & Operations
  'hr specialist': 'İnsan Kaynakları Uzmanı',
  'human resources specialist': 'İnsan Kaynakları Uzmanı',
  'recruiter': 'İşe Alım Uzmanı',
  'talent acquisition specialist': 'İşe Alım Uzmanı',
  'hr manager': 'İnsan Kaynakları Müdürü',
  'operations specialist': 'Operasyon Uzmanı',
  'operations manager': 'Operasyon Müdürü',

  // Finance & Accounting
  'accountant': 'Muhasebe Uzmanı',
  'accounting specialist': 'Muhasebe Uzmanı',
  'financial analyst': 'Finansal Analist',
  'finance specialist': 'Finans Uzmanı',
  'finance manager': 'Finans Müdürü',
  'mali müşavir': 'Mali Müşavir',

  'yönetici': 'Operasyon Müdürü',
  'müdür': 'Operasyon Müdürü',
  'direktör': 'Operasyon Müdürü',
  'genel müdür': 'Genel Müdür',
  'operasyon yöneticisi': 'Operasyon Müdürü',
  'satış yöneticisi': 'Satış Müdürü',
  'çağrı merkezi yöneticisi': 'Çağrı Merkezi Operasyon Müdürü',

  // Design
  'ui/ux designer': 'UI/UX Tasarımcı',
  'ux designer': 'UI/UX Tasarımcı',
  'ui designer': 'UI/UX Tasarımcı',
  'graphic designer': 'Grafik Tasarımcı',
  'product designer': 'Ürün Tasarımcısı',

  // Customer Service & Operations & Sales Management
  'customer success specialist': 'Müşteri Başarı Uzmanı',
  'customer support specialist': 'Müşteri Temsilcisi',
  'call center agent': 'Çağrı Merkezi Temsilcisi',
  'call center manager': 'Çağrı Merkezi Müdürü',
  'telemarketing ve çağrı merkezi operasyonları direktörü': 'Çağrı Merkezi Operasyon Müdürü',
  'telemarketing ve ticari destek operasyonları müdürü': 'Çağrı Merkezi Operasyon Müdürü',
  'alternatif satış kanalları müdürü': 'Satış Müdürü',
  'sigorta çağrı merkezi operasyon müdürü': 'Çağrı Merkezi Operasyon Müdürü',
  'sigorta dijital kanal çağrı merkezi satış müdürü': 'Çağrı Merkezi Satış Müdürü',
  'outsource kanal operasyon müdürü': 'Operasyon Müdürü',
  'çağrı merkezi operasyon müdürü': 'Çağrı Merkezi Operasyon Müdürü',
  'çağrı merkezi müdürü': 'Çağrı Merkezi Müdürü',
  'çağrı merkezi satış müdürü': 'Çağrı Merkezi Satış Müdürü',
  'çağrı merkezi takım lideri': 'Çağrı Merkezi Takım Lideri',
  'operasyon direktörü': 'Operasyon Müdürü',
  'satış direktörü': 'Satış Müdürü',
  'kanal satış müdürü': 'Satış Müdürü',
};

// Canonical Alias Dictionary for Sectors
const SECTOR_ALIASES: Record<string, string> = {
  'it': 'Bilişim / Yazılım',
  'software': 'Bilişim / Yazılım',
  'tech': 'Bilişim / Yazılım',
  'technology': 'Bilişim / Yazılım',
  'bilişim': 'Bilişim / Yazılım',
  'yazılım': 'Bilişim / Yazılım',
  'bilgi teknolojileri': 'Bilişim / Yazılım',

  'finance': 'Finans / Bankacılık',
  'banking': 'Finans / Bankacılık',
  'fintech': 'Finans / Bankacılık',
  'bankacılık': 'Finans / Bankacılık',
  'finans': 'Finans / Bankacılık',
  'sermaye piyasası': 'Finans / Bankacılık',
  'sigorta': 'Sigortacılık',
  'sigortacılık': 'Sigortacılık',
  'insurance': 'Sigortacılık',
  'çağrı merkezi': 'Müşteri Hizmetleri / Çağrı Merkezi',
  'müşteri hizmetleri': 'Müşteri Hizmetleri / Çağrı Merkezi',
  'telemarketing': 'Müşteri Hizmetleri / Çağrı Merkezi',
  'outsource': 'Hizmet / Danışmanlık',
  'danışmanlık': 'Hizmet / Danışmanlık',
  'consulting': 'Hizmet / Danışmanlık',

  'e-commerce': 'E-Ticaret / Perakende',
  'ecommerce': 'E-Ticaret / Perakende',
  'retail': 'E-Ticaret / Perakende',
  'e-ticaret': 'E-Ticaret / Perakende',
  'perakende': 'E-Ticaret / Perakende',

  'health': 'Sağlık / Medikal',
  'healthcare': 'Sağlık / Medikal',
  'sağlık': 'Sağlık / Medikal',
  'medikal': 'Sağlık / Medikal',
  'pharma': 'İlaç / Eczacılık',

  'education': 'Eğitim / EdTech',
  'edtech': 'Eğitim / EdTech',
  'eğitim': 'Eğitim / EdTech',

  'manufacturing': 'Üretim / Endüstri',
  'industry': 'Üretim / Endüstri',
  'üretim': 'Üretim / Endüstri',
  'sanayi': 'Üretim / Endüstri',

  'construction': 'İnşaat / Gayrimenkul',
  'real estate': 'İnşaat / Gayrimenkul',
  'inşaat': 'İnşaat / Gayrimenkul',
  'gayrimenkul': 'İnşaat / Gayrimenkul',

  'logistics': 'Lojistik / Taşımacılık',
  'transportation': 'Lojistik / Taşımacılık',
  'lojistik': 'Lojistik / Taşımacılık',

  'marketing': 'Pazarlama / Reklam',
  'advertising': 'Pazarlama / Reklam',
  'pazarlama': 'Pazarlama / Reklam',
  'reklam': 'Pazarlama / Reklam',

  'energy': 'Enerji',
  'enerji': 'Enerji',
  'automotive': 'Otomotiv',
  'otomotiv': 'Otomotiv',
  'tourism': 'Turizm / Otelcilik',
  'turizm': 'Turizm / Otelcilik',
};

function normalizeTrMatch(s: string): string {
  return s
    .toLocaleLowerCase('tr-TR')
    .replace(/i̇/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Finds the closest canonical taxonomy position.
 */
export function matchCanonicalPosition(rawRole: string): {
  canonical: string;
  isAmbiguous: boolean;
  candidates: string[];
} {
  const clean = rawRole.trim().toLowerCase();
  const norm = normalizeTrMatch(rawRole);
  const allPositions = getAllTaxonomyPositions();

  // 1. Direct Alias Match
  if (ROLE_ALIASES[clean]) {
    return {
      canonical: ROLE_ALIASES[clean],
      isAmbiguous: false,
      candidates: [ROLE_ALIASES[clean]],
    };
  }

  // Check normalized alias key
  for (const [aliasKey, canonicalVal] of Object.entries(ROLE_ALIASES)) {
    const aliasNorm = normalizeTrMatch(aliasKey);
    if (norm === aliasNorm || norm.includes(aliasNorm)) {
      return {
        canonical: canonicalVal,
        isAmbiguous: false,
        candidates: [canonicalVal],
      };
    }
  }

  // 2. Exact match in taxonomy (normalized)
  const exact = allPositions.find((p) => normalizeTrMatch(p) === norm);
  if (exact) {
    return { canonical: exact, isAmbiguous: false, candidates: [exact] };
  }

  // 3. Relevance-scored candidate match
  const scoreMatch = (candidate: string): number => {
    const pNorm = normalizeTrMatch(candidate);
    if (pNorm === norm) return 1000;

    // Strictly block false domain mappings (e.g. general 'yönetici' matching 'hastane yöneticisi')
    const isHealthcareRole = pNorm.includes('hastane') || pNorm.includes('hemsire') || pNorm.includes('doktor') || pNorm.includes('saglik') || pNorm.includes('klinik');
    const isHealthcareQuery = norm.includes('hastane') || norm.includes('hemsire') || norm.includes('doktor') || norm.includes('saglik') || norm.includes('klinik');
    if (isHealthcareRole && !isHealthcareQuery) {
      return 0;
    }

    if (norm.includes(pNorm)) return 500 + pNorm.length;
    if (pNorm.includes(norm)) return 300 + norm.length;
    const queryWords = norm.split(' ').filter((w) => w.length >= 3);
    const candWords = pNorm.split(' ').filter((w) => w.length >= 3);
    let common = 0;
    for (const qw of queryWords) {
      if (candWords.some((cw) => cw === qw)) {
        common += 10;
      } else if (candWords.some((cw) => cw.includes(qw) || qw.includes(cw))) {
        common += 5;
      }
    }
    return common;
  };

  const matches = allPositions
    .map((p) => ({ position: p, score: scoreMatch(p) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((m) => m.position);

  if (matches.length >= 1 && scoreMatch(matches[0]) >= 300) {
    return { canonical: matches[0], isAmbiguous: false, candidates: matches.slice(0, 3) };
  }

  if (matches.length >= 1) {
    return {
      canonical: matches[0],
      isAmbiguous: true,
      candidates: matches.slice(0, 3),
    };
  }

  // 4. Default: Proper Title Case
  const titleCased = suggestTitleCaseTr(rawRole);
  return {
    canonical: titleCased,
    isAmbiguous: true,
    candidates: allPositions.slice(0, 3),
  };
}

/**
 * Finds the closest canonical taxonomy sector.
 */
export function matchCanonicalSector(rawSector: string): {
  canonical: string;
  isAmbiguous: boolean;
  candidates: string[];
} {
  const clean = rawSector.trim().toLowerCase();
  const norm = normalizeTrMatch(rawSector);

  // 1. Direct Alias
  if (SECTOR_ALIASES[clean]) {
    return {
      canonical: SECTOR_ALIASES[clean],
      isAmbiguous: false,
      candidates: [SECTOR_ALIASES[clean]],
    };
  }

  for (const [aliasKey, canonicalVal] of Object.entries(SECTOR_ALIASES)) {
    const aliasNorm = normalizeTrMatch(aliasKey);
    if (norm === aliasNorm || norm.includes(aliasNorm)) {
      return {
        canonical: canonicalVal,
        isAmbiguous: false,
        candidates: [canonicalVal],
      };
    }
  }

  // 2. Exact in options
  const exact = JOB_SECTOR_OPTIONS.find((s) => normalizeTrMatch(s) === norm);
  // 3. Relevance-scored candidate match
  const scoreSector = (candidate: string): number => {
    const sNorm = normalizeTrMatch(candidate);
    if (sNorm === norm) return 1000;
    if (norm.includes(sNorm)) return 500 + sNorm.length;
    if (sNorm.includes(norm)) return 300 + norm.length;
    const queryWords = norm.split(' ').filter((w) => w.length >= 3);
    const candWords = sNorm.split(' ').filter((w) => w.length >= 3);
    let common = 0;
    for (const qw of queryWords) {
      if (candWords.some((cw) => cw === qw)) {
        common += 10;
      } else if (candWords.some((cw) => cw.includes(qw) || qw.includes(cw))) {
        common += 5;
      }
    }
    return common;
  };

  const matches = [...JOB_SECTOR_OPTIONS]
    .map((s) => ({ sector: s, score: scoreSector(s) }))
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((m) => m.sector);

  if (matches.length >= 1 && scoreSector(matches[0]) >= 300) {
    return {
      canonical: matches[0],
      isAmbiguous: false,
      candidates: matches.slice(0, 3),
    };
  }

  if (matches.length >= 1) {
    return {
      canonical: matches[0],
      isAmbiguous: true,
      candidates: matches.slice(0, 3),
    };
  }

  return {
    canonical: suggestTitleCaseTr(rawSector),
    isAmbiguous: true,
    candidates: [...JOB_SECTOR_OPTIONS].slice(0, 3),
  };
}

/**
 * Maps raw extraction payload into Girişimbee canonical taxonomy.
 */
export function mapCvToCanonicalTaxonomy(
  payload: AiCvExtractionPayload,
): CanonicalTaxonomyMappingResult {
  const ambiguousItems: RawAmbiguousCvItem[] = [...(payload.ambiguousItems || [])];

  // 1. Map Roles
  const matchedRoles: string[] = [];
  for (const r of payload.roles || []) {
    const res = matchCanonicalPosition(r);
    if (!matchedRoles.includes(res.canonical)) {
      matchedRoles.push(res.canonical);
    }
    if (res.isAmbiguous && !ambiguousItems.some((a) => a.raw === r)) {
      ambiguousItems.push({
        raw: r,
        kind: 'role',
        candidates: res.candidates,
        suggestedCanonical: res.canonical,
      });
    }
  }

  // 2. Map Sectors
  const matchedSectors: string[] = [];
  for (const s of payload.sectors || []) {
    const res = matchCanonicalSector(s);
    if (!matchedSectors.includes(res.canonical)) {
      matchedSectors.push(res.canonical);
    }
    if (res.isAmbiguous && !ambiguousItems.some((a) => a.raw === s)) {
      ambiguousItems.push({
        raw: s,
        kind: 'sector',
        candidates: res.candidates,
        suggestedCanonical: res.canonical,
      });
    }
  }

  // 3. Map Experiences
  const experiences: CareerExperience[] = (payload.experiences || []).map((exp, idx) => {
    const roleMatch = exp.role ? matchCanonicalPosition(exp.role) : { canonical: 'Yazılım Geliştirici' };
    const sectorMatch = exp.sector ? matchCanonicalSector(exp.sector) : { canonical: 'Bilişim / Yazılım' };

    const startYear = exp.startYear ?? null;
    const endYear = exp.isCurrent ? null : (exp.endYear ?? null);
    const duration = exp.durationYears
      ? `${exp.durationYears} yıl`
      : startYear && endYear
        ? `${Math.max(1, endYear - startYear)} yıl`
        : '1 yıl';

    return {
      id: `cv-exp-${idx + 1}-${Date.now()}`,
      sector: sectorMatch.canonical,
      role: roleMatch.canonical,
      company: exp.company ? suggestTitleCaseTr(exp.company) : undefined,
      startYear,
      endYear,
      isCurrent: exp.isCurrent ?? false,
      duration,
      responsibilities: exp.responsibilities ? exp.responsibilities.trim() : '',
      achievements: exp.achievements ? exp.achievements.trim() : '',
    };
  });

  // 4. Skills & Tools
  const professionalSkills = (payload.skills || [])
    .filter((s) => !isTechnicalSkill(s))
    .map((s) => suggestTitleCaseTr(s));

  const technicalSkills = (payload.skills || [])
    .filter((s) => isTechnicalSkill(s))
    .map((s) => suggestTitleCaseTr(s));

  const tools = (payload.tools || []).map((t) => suggestTitleCaseTr(t));

  // 5. Education & Languages
  let educationLevel = 'Lisans';
  const eduFieldParts: string[] = [];

  const eduRank: Record<string, number> = {
    'Doktora': 5,
    'Yüksek lisans': 4,
    'Yüksek Lisans': 4,
    'Lisans': 3,
    'Ön lisans': 2,
    'Ön Lisans': 2,
    'Meslek yüksekokulu': 2,
    'Lise': 1,
    'İlköğretim': 0,
    'Diğer': 0,
  };

  const normalizeCanonicalEduLevel = (raw?: string): string => {
    const norm = (raw || '').toLowerCase();
    if (norm.includes('doktora') || norm.includes('phd')) return 'Doktora';
    if (norm.includes('yüksek') || norm.includes('master') || norm.includes('tezli') || norm.includes('tezsiz')) {
      return 'Yüksek lisans';
    }
    if (norm.includes('ön lisans') || norm.includes('myo') || norm.includes('meslek yüksek')) {
      return 'Ön lisans';
    }
    if (norm.includes('lisans') || norm.includes('bachelor') || norm.includes('fakülte')) {
      return 'Lisans';
    }
    if (norm.includes('lise')) return 'Lise';
    return 'Lisans';
  };

  let maxRank = -1;
  const eduList = Array.isArray(payload.education) && payload.education.length > 0 ? payload.education : [];

  for (const edu of eduList) {
    const canonicalLvl = normalizeCanonicalEduLevel(edu.level);
    const rank = eduRank[canonicalLvl] ?? 3;
    if (rank > maxRank) {
      maxRank = rank;
      educationLevel = canonicalLvl;
    }
    const schoolPart = edu.school ? ` - ${suggestTitleCaseTr(edu.school)}` : '';
    const fieldPart = edu.field ? suggestTitleCaseTr(edu.field) : '';
    if (fieldPart) {
      eduFieldParts.push(`${fieldPart} (${canonicalLvl}${schoolPart})`);
    } else if (edu.school) {
      eduFieldParts.push(suggestTitleCaseTr(edu.school));
    }
  }

  const educationField = eduFieldParts.length > 0
    ? eduFieldParts.join(', ')
    : (eduList[0]?.field ? suggestTitleCaseTr(eduList[0].field) : '');

  const languages = (payload.languages || []).join(', ');
  const certificates = (payload.certificates || []).join(', ');
  const residenceCity = payload.locations?.[0] ? suggestTitleCaseTr(payload.locations[0]) : '';

  return {
    primaryRole: matchedRoles[0] || (experiences[0]?.role ?? ''),
    matchedRoles,
    primarySector: matchedSectors[0] || (experiences[0]?.sector ?? ''),
    matchedSectors,
    professionalSkills: [...new Set(professionalSkills)],
    technicalSkills: [...new Set(technicalSkills)],
    tools: [...new Set(tools)],
    educationLevel,
    educationField,
    languages,
    certificates,
    residenceCity,
    experiences,
    summary: payload.summary || '',
    ambiguousItems,
    canonicalConfidence: ambiguousItems.length === 0 ? 1.0 : 0.8,
  };
}

function isTechnicalSkill(skill: string): boolean {
  const lower = skill.toLowerCase();
  const techKeywords = [
    'sql',
    'python',
    'java',
    'react',
    'node',
    'docker',
    'aws',
    'cloud',
    'api',
    'git',
    'html',
    'css',
    'c#',
    'c++',
    'linux',
    'kubernetes',
    'ci/cd',
    'typescript',
    'javascript',
    'angular',
    'vue',
    'php',
    'go',
    'rust',
    'kotlin',
    'swift',
    'mongodb',
    'postgresql',
    'redis',
    'graphql',
    'rest',
    'microservices',
    'cad',
    'sap',
    'excel',
    'power bi',
    'tableau',
  ];
  return techKeywords.some((k) => lower.includes(k));
}
