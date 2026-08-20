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
  'call center manager': 'Çağrı Merkezi Operasyon Müdürü',
  'çağrı merkezi operasyon müdürü': 'Çağrı Merkezi Operasyon Müdürü',
  'çağrı merkezi müdürü': 'Çağrı Merkezi Operasyon Müdürü',
  'telemarketing ve ticari destek operasyonları müdürü': 'Çağrı Merkezi Operasyon Müdürü',
  'telemarketing ve çağrı merkezi operasyonları direktörü': 'Çağrı Merkezi Operasyon Müdürü',
  'çağrı merkezi elemanı': 'Çağrı Merkezi Elemanı',
  'çağrı merkezi müşteri temsilcisi': 'Çağrı Merkezi Müşteri Temsilcisi',
  'üretim elemanı': 'Üretim Elemanı',
  'mağaza elemanı': 'Mağaza Elemanı',
  'bilgi işlem elemanı': 'Bilgi İşlem Elemanı',
  'bilgi işlem sorumlusu': 'Bilgi İşlem Sorumlusu',
  'bilgi işlem uzmanı': 'Bilgi İşlem Uzmanı',
  'alternatif satış kanalları müdürü': 'Satış Müdürü',
  'sigorta çağrı merkezi operasyon müdürü': 'Çağrı Merkezi Operasyon Müdürü',
  'sigorta dijital kanal çağrı merkezi satış müdürü': 'Çağrı Merkezi Satış Müdürü',
  'outsource kanal operasyon müdürü': 'Çağrı Merkezi Operasyon Müdürü',
  'çağrı merkezi satış müdürü': 'Çağrı Merkezi Satış Müdürü',
  'çağrı merkezi takım lideri': 'Çağrı Merkezi Takım Lideri',
  'operasyon direktörü': 'Operasyon Müdürü',
  'satış direktörü': 'Satış Müdürü',
  'kanal satış müdürü': 'Satış Müdürü',
  'sales director': 'Satış Müdürü',
  'operations director': 'Operasyon Müdürü',
  'head of sales': 'Satış Müdürü',
  'head of marketing': 'Pazarlama Müdürü',
  'head of operations': 'Operasyon Müdürü',
  'call center operations manager': 'Çağrı Merkezi Yöneticisi',
  'audit specialist': 'Denetim Uzmanı',
  'auditor': 'Denetim Uzmanı',
  'branch manager': 'Şube Müdürü',
  'managing director': 'Genel Müdür',
  'deputy general manager': 'Genel Müdür Yardımcısı',
  'assistant general manager': 'Genel Müdür Yardımcısı',
  'vice president': 'Genel Müdür Yardımcısı',

  // Insurance & Operations & Consulting
  'sigorta danışmanı': 'Sigorta Danışmanı',
  'uzman sigorta danışmanı': 'Sigorta Danışmanı',
  'uzman sigorta danışmanı & operasyon uzmanı': 'Sigorta Danışmanı',
  'sigorta uzmanı': 'Sigorta Danışmanı',
  'sigorta teknik uzmanı': 'Sigorta Danışmanı',
  'asistans ve operasyon uzmanı': 'Operasyon Uzmanı',
  'asistans uzmanı': 'Operasyon Uzmanı',
  'kalite eğitim uzmanı': 'Eğitim Uzmanı',
  'çağrı merkezi müşteri temsilcileri kalite eğitim uzmanı': 'Eğitim Uzmanı',
  'sosyal hizmetler kıdemli stajyeri': 'Sosyal Hizmet Uzmanı',
  'sosyal hizmetler stajyeri': 'Sosyal Hizmet Uzmanı',
  'okul öncesi stajyeri': 'Öğretmen',
  'okul öncesi öğretmeni': 'Okul Öncesi Öğretmeni',
  'öğretmen': 'Öğretmen',
  'sosyal hizmetler uzmanı': 'Sosyal Hizmet Uzmanı',
  'sosyal hizmet uzmanı': 'Sosyal Hizmet Uzmanı',
  'hasta hizmetleri yöneticisi': 'Sağlık Yöneticisi',
  'mimar': 'Mimar',
  'şantiye şefi': 'Şantiye Şefi',
  'mimar & şantiye şefi': 'Şantiye Şefi',
  'avukat': 'Avukat',
  'hukuk müşaviri': 'Hukuk Danışmanı',
  'avukat & hukuk müşaviri': 'Avukat',
  'tedarik zinciri müdürü': 'Tedarik Zinciri Müdürü',
  'yapay zeka mühendisi': 'Yapay Zeka Uzmanı',
  'araştırma görevlisi': 'Araştırma Görevlisi',
  'ağır vasıta şoförü': 'Şoför (Kamyon / TIR)',
  'tır şoförü': 'Şoför (Kamyon / TIR)',
  'tır şoförü / ağır vasıta sürücüsü': 'Şoför (Kamyon / TIR)',
  'ağır vasıta sürücüsü': 'Şoför (Kamyon / TIR)',
  'şoför': 'Makam Şoförü / Şoför',
  'mağaza müdürü': 'Mağaza Müdürü',
  'ön büro müdürü': 'Ön Büro Müdürü',
  'siber güvenlik uzmanı': 'Siber Güvenlik Uzmanı',
  'qa automation engineer': 'Yazılım Test Mühendisi',
  'test otomasyon mühendisi': 'Yazılım Test Mühendisi',
  'senior qa automation engineer': 'Yazılım Test Mühendisi',
  'mobil yazılım geliştirici': 'Mobil Uygulama Geliştirici',
  'dijital pazarlama ve seo uzmanı': 'Dijital Pazarlama Uzmanı',
  'dijital pazarlama uzmanı': 'Dijital Pazarlama Uzmanı',
  'insan kaynakları iş ortağı': 'İnsan Kaynakları Uzmanı',
  'insan kaynakları uzmanı': 'İnsan Kaynakları Uzmanı',
  'kıdemli finansal analist': 'Finansal Analist',
  'ulusal zincir mağazalar satış müdürü': 'Satış Müdürü',
  'finansal denetim stajyeri': 'Denetim Uzmanı',

  // Finance, Economics, Banking & Investment
  'ekonomi & finans uzmanı': 'Finans Uzmanı',
  'ekonomi ve finans uzmanı': 'Finans Uzmanı',
  'ekonomi ve finans': 'Finans Uzmanı',
  'ekonomi & finans': 'Finans Uzmanı',
  'finans uzmanı': 'Finans Uzmanı',
  'finansal analist': 'Finansal Analist',
  'finans analisti': 'Finansal Analist',
  'yatırım uzmanı': 'Yatırım Danışmanı',
  'yatırım danışmanı': 'Yatırım Danışmanı',
  'yatırım operasyonları': 'Finans Uzmanı',
  'yatırım operasyonları & portföy kazanımı': 'Finans Uzmanı',
  'portföy yöneticisi': 'Finans Uzmanı',
  'portföy uzmanı': 'Finans Uzmanı',
  'portföy danışmanı': 'Finans Uzmanı',
  'menkul değerler uzmanı': 'Finans Uzmanı',
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
  'yapay zeka': 'Yapay zeka / Veri',
  'veri bilimi': 'Yapay zeka / Veri',
  'data science': 'Yapay zeka / Veri',
  'siber güvenlik': 'Bilişim / Yazılım',
  'cyber security': 'Bilişim / Yazılım',

  'finance': 'Finans / Bankacılık',
  'banking': 'Finans / Bankacılık',
  'fintech': 'Finans / Bankacılık',
  'bankacılık': 'Finans / Bankacılık',
  'finans': 'Finans / Bankacılık',
  'sermaye piyasası': 'Finans / Bankacılık',
  'ekonomi': 'Finans / Bankacılık',
  'ekonomi ve finans': 'Finans / Bankacılık',
  'yatırım': 'Finans / Bankacılık',
  'menkul değerler': 'Finans / Bankacılık',
  'portföy': 'Finans / Bankacılık',
  'finans / bankacılık': 'Finans / Bankacılık',

  'insurance': 'Sigorta',
  'sigorta': 'Sigorta',
  'sigortacılık': 'Sigorta',
  'asistans': 'Sigorta',
  'asistans hizmetleri': 'Sigorta',

  'call center': 'Çağrı merkezi',
  'çağrı merkezi': 'Çağrı merkezi',
  'cagri merkezi': 'Çağrı merkezi',
  'customer service': 'Müşteri hizmetleri',
  'customer success': 'Müşteri hizmetleri',
  'müşteri hizmetleri': 'Müşteri hizmetleri',

  'sales': 'Satış',
  'satış': 'Satış',

  'hr': 'İnsan kaynakları',
  'human resources': 'İnsan kaynakları',
  'insan kaynakları': 'İnsan kaynakları',
  'personel': 'İnsan kaynakları',

  'sağlık': 'Sağlık',
  'saglik': 'Sağlık',
  'sağlık sektörü': 'Sağlık',
  'health': 'Sağlık',
  'healthcare': 'Sağlık',
  'hospital': 'Sağlık',

  'gıda': 'Gıda / Restoran',
  'gida': 'Gıda / Restoran',
  'gıda sektörü': 'Gıda / Restoran',
  'food': 'Gıda / Restoran',

  'retail': 'Perakende / Mağaza',
  'perakende': 'Perakende / Mağaza',
  'mağaza': 'Perakende / Mağaza',
  'mağazacılık': 'Perakende / Mağaza',
  'e-commerce': 'E-ticaret / Pazaryeri',
  'ecommerce': 'E-ticaret / Pazaryeri',
  'e-ticaret': 'E-ticaret / Pazaryeri',
  'eticaret': 'E-ticaret / Pazaryeri',

  'production': 'Üretim / Sanayi',
  'manufacturing': 'Üretim / Sanayi',
  'üretim': 'Üretim / Sanayi',
  'imalat': 'Üretim / Sanayi',
  'üretim / imalat': 'Üretim / Sanayi',
  'sanayi': 'Üretim / Sanayi',

  'construction': 'İnşaat / Gayrimenkul',
  'real estate': 'İnşaat / Gayrimenkul',
  'inşaat': 'İnşaat / Gayrimenkul',
  'gayrimenkul': 'İnşaat / Gayrimenkul',
  'mimarlık': 'İnşaat / Gayrimenkul',
  'şantiye': 'İnşaat / Gayrimenkul',

  'logistics': 'Lojistik / Depolama',
  'transportation': 'Lojistik / Depolama',
  'lojistik': 'Lojistik / Depolama',
  'tedarik zinciri': 'Lojistik / Depolama',
  'ulaşım': 'Ulaşım / Şoförlük',
  'şoförlük': 'Ulaşım / Şoförlük',

  'marketing': 'Pazarlama / Reklam',
  'advertising': 'Pazarlama / Reklam',
  'pazarlama': 'Pazarlama / Reklam',
  'reklam': 'Pazarlama / Reklam',
  'dijital pazarlama': 'Pazarlama / Reklam',

  'hukuk': 'Hukuk',
  'law': 'Hukuk',
  'avukatlık': 'Hukuk',

  'education': 'Eğitim',
  'eğitim': 'Eğitim',
  'öğretmenlik': 'Eğitim',
  'akademik': 'Eğitim',

  'sosyal hizmet': 'Sosyal hizmet / STK',
  'sosyal hizmetler': 'Sosyal hizmet / STK',
  'stk': 'Sosyal hizmet / STK',

  'energy': 'Enerji',
  'enerji': 'Enerji',
  'automotive': 'Otomotiv',
  'otomotiv': 'Otomotiv',
  'tourism': 'Turizm / Otelcilik',
  'turizm': 'Turizm / Otelcilik',
  'otelcilik': 'Turizm / Otelcilik',
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

  // 1. Direct Canonical Match or Direct Alias Match
  const exactCanonical = allPositions.find((p) => p.toLowerCase() === clean || normalizeTrMatch(p) === norm);
  if (exactCanonical) {
    return { canonical: exactCanonical, isAmbiguous: false, candidates: [exactCanonical] };
  }

  if (ROLE_ALIASES[clean]) {
    return {
      canonical: ROLE_ALIASES[clean],
      isAmbiguous: false,
      candidates: [ROLE_ALIASES[clean]],
    };
  }

  // 2. Exact Normalized Alias Match
  for (const [aliasKey, canonicalVal] of Object.entries(ROLE_ALIASES)) {
    if (normalizeTrMatch(aliasKey) === norm) {
      return {
        canonical: canonicalVal,
        isAmbiguous: false,
        candidates: [canonicalVal],
      };
    }
  }

  // 3. Sorted Substring Alias Match (longest first)
  const sortedAliases = Object.entries(ROLE_ALIASES).sort((a, b) => b[0].length - a[0].length);
  for (const [aliasKey, canonicalVal] of sortedAliases) {
    const aliasNorm = normalizeTrMatch(aliasKey);
    if (aliasNorm.length >= 5 && norm.includes(aliasNorm)) {
      return {
        canonical: canonicalVal,
        isAmbiguous: false,
        candidates: [canonicalVal],
      };
    }
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

    // Require full word match or long substring (>= 5 chars) with word boundary
    if (norm.length >= 5 && pNorm.includes(norm)) return 300 + norm.length;
    if (pNorm.length >= 5 && norm.includes(pNorm)) return 500 + pNorm.length;

    const queryWords = norm.split(' ').filter((w) => w.length >= 3);
    const candWords = pNorm.split(' ').filter((w) => w.length >= 3);
    let common = 0;
    for (const qw of queryWords) {
      if (candWords.some((cw) => cw === qw)) {
        common += 10;
      } else if (qw.length >= 5 && candWords.some((cw) => cw.length >= 5 && (cw.startsWith(qw.slice(0, 4)) || qw.startsWith(cw.slice(0, 4))))) {
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

export function inferSectorFromRole(role: string): string {
  if (!role) return '';
  const r = normalizeTrMatch(role);
  if (/yazilim|gelistirici|developer|software|devops|qa|frontend|backend|full\s*stack|siber/i.test(r)) return 'Bilişim / Yazılım';
  if (/yapay\s*zeka|veri\s*(bilim|muhend|analis)|data/i.test(r)) return 'Yapay zeka / Veri';
  if (/finans|banka|yatirim|portfoy|hisse|borsa|fon|kredi/i.test(r)) return 'Finans / Bankacılık';
  if (/muhasebe|mali\s*musavir|denetim|audit/i.test(r)) return 'Muhasebe / Mali müşavirlik';
  if (/sigorta|hasar|aktuer|underwrit/i.test(r)) return 'Sigorta';
  if (/cagri\s*merkezi|call\s*center/i.test(r)) return 'Çağrı merkezi';
  if (/musteri\s*(hizmet|iliski|basari|temsil)/i.test(r)) return 'Müşteri hizmetleri';
  if (/insan\s*kaynak|hr|recruiter|yetenek|bordro/i.test(r)) return 'İnsan kaynakları';
  if (/mimar|insaat|santiye|gayrimenkul|emlak/i.test(r)) return 'İnşaat / Gayrimenkul';
  if (/tedarik|lojistik|depo|sevkiyat/i.test(r)) return 'Lojistik / Depolama';
  if (/sofor|surucu|kurye|nakliye|kamyon|tir/i.test(r)) return 'Ulaşım / Şoförlük';
  if (/avukat|hukuk|legal/i.test(r)) return 'Hukuk';
  if (/ogretmen|egitim|akademisyen|arastirma\s*gorev/i.test(r)) return 'Eğitim';
  if (/saglik|doktor|hemsire|hasta\s*hizmet|medikal/i.test(r)) return 'Sağlık';
  if (/pazarlama|marketing|seo|sosyal\s*medya/i.test(r)) return 'Pazarlama / Reklam';
  if (/satis|sales|is\s*gelistirme/i.test(r)) return 'Satış';
  if (/magaza|kasiyer|perakende/i.test(r)) return 'Perakende / Mağaza';
  if (/otel|resepsiyon|on\s*buro|turizm/i.test(r)) return 'Turizm / Otelcilik';
  if (/sosyal\s*hizmet|stk|vakif|dernek/i.test(r)) return 'Sosyal hizmet / STK';
  if (/uretim|imalat|sanayi|fabrika|makine\s*muhend/i.test(r)) return 'Üretim / Sanayi';
  return '';
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

  // Helper to infer appropriate sector for an individual experience
  const inferExpSector = (exp: { sector?: string; role?: string; company?: string }): string => {
    if (exp.sector) {
      const match = matchCanonicalSector(exp.sector);
      if (match.canonical) return match.canonical;
    }
    if (exp.role) {
      const fromRole = inferSectorFromRole(exp.role);
      if (fromRole) return fromRole;
    }
    const text = `${exp.company || ''} ${exp.role || ''}`.toLowerCase();
    const fromText = inferSectorFromRole(text);
    if (fromText) return fromText;
    return matchedSectors[0] || 'Bilişim / Yazılım';
  };

  // 3. Map Experiences
  const experiences: CareerExperience[] = (payload.experiences || []).map((exp, idx) => {
    const resolvedSector = inferExpSector(exp);
    const defaultRole =
      matchedRoles[0] ||
      (resolvedSector === 'Finans / Bankacılık'
        ? 'Finans Uzmanı'
        : resolvedSector === 'Sigorta'
          ? 'Sigorta Danışmanı'
          : resolvedSector === 'Çağrı merkezi'
            ? 'Müşteri Temsilcisi'
            : resolvedSector === 'Bilişim / Yazılım'
              ? 'Yazılım Geliştirici'
              : 'Uzman');
    const roleMatch = exp.role ? matchCanonicalPosition(exp.role) : { canonical: defaultRole };

    const startYear = exp.startYear ?? null;
    const endYear = exp.isCurrent ? null : (exp.endYear ?? null);
    const duration = exp.durationYears
      ? `${exp.durationYears} yıl`
      : startYear && endYear
        ? `${Math.max(1, endYear - startYear)} yıl`
        : '1 yıl';

    const selectedResponsibilities = exp.responsibilities
      ? exp.responsibilities
          .split(/[|·•\n]/)
          .map((s) => s.trim())
          .filter((s) => s.length >= 3)
      : [];

    const selectedAchievements = exp.achievements
      ? exp.achievements
          .split(/[|·•\n]/)
          .map((s) => s.trim())
          .filter((s) => s.length >= 3)
      : [];

    return {
      id: `cv-exp-${idx + 1}-${Date.now() + idx}`,
      sector: resolvedSector,
      role: roleMatch.canonical,
      company: exp.company ? suggestTitleCaseTr(exp.company) : undefined,
      startYear,
      endYear,
      isCurrent: exp.isCurrent ?? false,
      duration,
      responsibilities: exp.responsibilities ? exp.responsibilities.trim() : '',
      selectedResponsibilities,
      responsibilitiesOther: exp.responsibilities ? exp.responsibilities.trim() : undefined,
      achievements: exp.achievements ? exp.achievements.trim() : '',
      selectedAchievements,
      achievementsOther: exp.achievements ? exp.achievements.trim() : undefined,
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
      eduFieldParts.push(`${canonicalLvl} - ${suggestTitleCaseTr(edu.school)}`);
    }
  }

  const mappedEducationList: Array<{ level: string; field?: string; school?: string; graduationYear?: number | null }> = eduList.map((edu) => ({
    level: normalizeCanonicalEduLevel(edu.level),
    field: edu.field ? suggestTitleCaseTr(edu.field) : undefined,
    school: edu.school ? suggestTitleCaseTr(edu.school) : undefined,
    graduationYear: edu.graduationYear ?? null,
  }));

  const educationField = eduFieldParts.length > 0
    ? eduFieldParts.join(' / ')
    : (eduList[0]?.field ? suggestTitleCaseTr(eduList[0].field) : '');

  const languages = (payload.languages || []).join(', ');
  const certificates = (payload.certificates || []).join(', ');
  const residenceCity = payload.locations?.[0] ? suggestTitleCaseTr(payload.locations[0]) : '';
  const residenceDistrict = payload.locations?.[1] ? suggestTitleCaseTr(payload.locations[1]) : '';

  const candidateHeadlineRole = payload.roles?.[0] ? matchCanonicalPosition(payload.roles[0]).canonical : '';
  const mostRecentRole = experiences[0]?.role ? matchCanonicalPosition(experiences[0].role).canonical : '';
  const mostRecentSector = experiences[0]?.sector || '';
  const resolvedRole = mostRecentRole || candidateHeadlineRole || matchedRoles[0] || (experiences[0]?.role ?? '');
  const roleInferredSector = inferSectorFromRole(resolvedRole);

  return {
    primaryRole: resolvedRole,
    matchedRoles,
    primarySector: mostRecentSector || roleInferredSector || matchedSectors[0] || '',
    matchedSectors,
    professionalSkills: [...new Set(professionalSkills)],
    technicalSkills: [...new Set(technicalSkills)],
    tools: [...new Set(tools)],
    educationLevel,
    educationField,
    educationList: mappedEducationList,
    languages,
    certificates,
    residenceCity,
    residenceDistrict,
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
    'crm',
    'erp',
    'excel',
    'power bi',
    'tableau',
    'salesforce',
    'hubspot',
    'postman',
    'jira',
    'figma',
    'slack',
    'pacs',
    'his',
    'dijital',
    'lead generation',
    'telemarketing',
    'inbound',
    'outbound',
  ];
  return techKeywords.some((k) => lower.includes(k));
}
