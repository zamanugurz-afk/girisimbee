import { JOB_SECTOR_OPTIONS } from '@/features/listings/config/listing-field-options';
import { suggestTitleCaseTr } from '@/features/candidates/lib/career-text-quality';
import { normalizeTrUniversal } from './cv-universal-normalizer';
import { UNIVERSAL_ROLE_ALIASES } from './cv-universal-dictionary';

export const UNIVERSAL_SECTOR_KEYWORDS: Record<string, string[]> = {
  'Bilişim / Yazılım': ['yazılım', 'software', 'developer', 'devops', 'frontend', 'backend', 'full stack', 'siber güvenlik', 'cloud', 'sistem yöneticisi', 'network'],
  'Yapay zeka / Veri': ['yapay zeka', 'veri bilimi', 'machine learning', 'data scientist', 'data analyst', 'veri analisti', 'derin öğrenme'],
  'Sigorta': ['sigorta', 'aktüerya', 'hasar', 'underwriting', 'sigortacılık', 'acente', 'finansal güvence'],
  'Finans / Bankacılık': ['banka', 'finans', 'hazine', 'kredi', 'yatırım', 'portföy', 'fon', 'likidite', 'bankacılık', 'cfo', 'mali işler'],
  'Muhasebe / Mali müşavirlik': ['muhasebe', 'mali müşavir', 'smmm', 'vergi', 'audit', 'denetim', 'bordro'],
  'İnsan kaynakları': ['insan kaynakları', 'hr', 'ik', 'recruitment', 'işe alım', 'yetenek yönetimi', 'özlük'],
  'İnşaat / Gayrimenkul': ['inşaat', 'şantiye', 'mimar', 'mimarlık', 'gayrimenkul', 'emlak', 'hakediş', 'yapı denetim'],
  'Lojistik / Depolama': ['lojistik', 'depo', 'sevkiyat', 'tedarik zinciri', 'wms', 'antrepo', 'nakliye', 'filo'],
  'Ulaşım / Şoförlük': ['ulaşım', 'şoför', 'sürücü', 'kurye', 'kargo', 'teslimat'],
  'Hukuk': ['hukuk', 'avukat', 'müşavir', 'dava', 'arabulucu', 'sözleşme', 'legal'],
  'Eğitim': ['öğretmen', 'eğitmen', 'okul', 'akademisyen', 'öğretim görevlisi', 'kolej', 'üniversite'],
  'Sağlık': ['sağlık', 'doktor', 'başhekim', 'hemşire', 'hastane', 'klinik', 'tıp', 'medikal', 'biyomedikal'],
  'Eczane / İlaç': ['eczane', 'ilaç', 'ruhsatlandırma', 'farmasötik', 'eczacı', 'klinik araştırma'],
  'Pazarlama / Reklam': ['pazarlama', 'marketing', 'dijital pazarlama', 'seo', 'sosyal medya', 'reklam', 'brand', 'içerik'],
  'Satış': ['satış', 'sales', 'müşteri temsilcisi', 'hesap yöneticisi', 'saha satış', 'iş geliştirme', 'b2b'],
  'Perakende / Mağaza': ['perakende', 'mağaza', 'kasiyer', 'reyon', 'merchandising', 'mağazacılık'],
  'Turizm / Otelcilik': ['turizm', 'otel', 'otelcilik', 'resepsiyon', 'aşçı', 'şef', 'executive chef', 'kat hizmetleri'],
  'Üretim / Sanayi': ['üretim', 'imalat', 'fabrika', 'sanayi', 'bakım onarım', 'endüstriyel', 'kalite kontrol'],
  'Otomotiv': ['otomotiv', 'araç', 'yedek parça', 'motor', 'oto servis', 'montaj'],
  'Gıda / Restoran': ['gıda', 'restoran', 'kafe', 'fırın', 'mutfak', 'catering', 'gıda mühendisi'],
  'Havacılık': ['havacılık', 'uçak', 'uçuş', 'kabin memuru', 'pilot', 'yer hizmetleri', 'teknik bakım'],
  'Denizcilik / Liman': ['denizcilik', 'gemi', 'liman', 'kaptan', 'çarkçı', 'deniz taşımacılığı'],
  'Gümrük': ['gümrük', 'gümrük müşaviri', 'gümrükleme', 'antrepo'],
  'İthalat / İhracat': ['ithalat', 'ihracat', 'dış ticaret', 'ihracat operasyon', 'uluslararası ticaret'],
  'Enerji': ['enerji', 'santral', 'rüzgar', 'güneş', 'petrol', 'doğalgaz', 'rafineri', 'elektrik santrali'],
  'Madencilik': ['maden', 'madencilik', 'ocak', 'jeoloji', 'cevher', 'sondaj'],
};

export const UNIVERSAL_LANGUAGE_MAP: Record<string, string> = {
  ingilizce: 'İngilizce',
  english: 'İngilizce',
  almanca: 'Almanca',
  german: 'Almanca',
  fransizca: 'Fransızca',
  french: 'Fransızca',
  ispanyolca: 'İspanyolca',
  spanish: 'İspanyolca',
  italyanca: 'İtalyanca',
  italian: 'İtalyanca',
  rusca: 'Rusça',
  russian: 'Rusça',
  arapca: 'Arapça',
  arabic: 'Arapça',
  cince: 'Çince',
  chinese: 'Çince',
  japonca: 'Japonca',
  japanese: 'Japonca',
};

export const UNIVERSAL_CERTIFICATE_MAP: Record<string, string> = {
  smmm: 'SMMM',
  cfa: 'CFA',
  pmp: 'PMP',
  ceh: 'CEH',
  cissp: 'CISSP',
  ccna: 'CCNA',
  aws: 'AWS Certified',
  azure: 'Microsoft Azure Certified',
  jci: 'JCI Akreditasyonu',
  iso: 'ISO Kalite Yönetimi',
};

export const UNIVERSAL_TECH_SKILLS_MAP: Record<string, string> = {
  react: 'React',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  'node.js': 'Node.js',
  node: 'Node.js',
  python: 'Python',
  java: 'Java',
  'c#': 'C#',
  sql: 'SQL',
  postgresql: 'PostgreSQL',
  mongodb: 'MongoDB',
  autocad: 'AutoCAD',
  revit: 'Revit',
  'primavera p6': 'Primavera P6',
  splunk: 'Splunk',
  wireshark: 'Wireshark',
};

export const UNIVERSAL_TOOLS_MAP: Record<string, string> = {
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  git: 'Git',
  jira: 'Jira',
  figma: 'Figma',
  excel: 'MS Excel',
  'bloomberg terminal': 'Bloomberg Terminal',
  sap: 'SAP ERP',
};

export const UNIVERSAL_PROF_SKILLS_MAP: Record<string, string> = {
  'ekip yonetimi': 'Ekip Yönetimi',
  'proje yonetimi': 'Proje Yönetimi',
  'zaman yonetimi': 'Zaman Yönetimi',
  'kriz yonetimi': 'Kriz Yönetimi',
  'iletisim': 'İletişim Becerileri',
  'sunum teknikleri': 'Sunum Becerileri',
  'butce yonetimi': 'Bütçe Yönetimi',
  'musteri iliskileri': 'Müşteri İlişkileri',
};

/**
 * Unified Canonical Taxonomy & Ontology Graph
 * Single source of truth for Role, Sector, Skill, Language, and Certificate resolution.
 */
export class CvUnifiedTaxonomy {
  private static roleMap: Map<string, string> = new Map();
  private static sectorMap: Map<string, string> = new Map();

  static {
    // Populate Role Aliases
    for (const [raw, canonical] of Object.entries(UNIVERSAL_ROLE_ALIASES || {})) {
      this.roleMap.set(normalizeTrUniversal(raw), canonical);
    }

    // Role Aliases with compound precedence
    const additionalAliases: Record<string, string> = {
      'senior software engineering manager': 'Yazılım Geliştirme Yöneticisi',
      'software engineering manager': 'Yazılım Geliştirme Yöneticisi',
      'engineering manager': 'Mühendislik Yöneticisi',
      'mimar & santiye sefi': 'Şantiye Şefi',
      'mimar ve santiye sefi': 'Şantiye Şefi',
      'santiye sefi & mimar': 'Şantiye Şefi',
      'cagri merkezi operasyon muduru': 'Operasyon Müdürü',
      'cagri merkezi takim lideri': 'Takım Lideri',
      'finansal guvence danismani': 'Sigorta Danışmanı',
      'vardiya muduru': 'Vardiya Amiri / Müdürü',
      'satis pazarlama uzman yardimcisi': 'Satış Uzmanı',
      'yatirim uzman yardimcisi': 'Yatırım Danışmanı',
      'bulut ve guvenlik mimari': 'DevOps Mühendisi',
      'cloud infrastructure & security architect': 'DevOps Mühendisi',
      'siber guvenlik uzmani': 'Siber Güvenlik Uzmanı',
      'kidemli siber guvenlik uzmani': 'Siber Güvenlik Uzmanı',
    };

    for (const [raw, canonical] of Object.entries(additionalAliases)) {
      this.roleMap.set(normalizeTrUniversal(raw), canonical);
    }

    // Populate Sector Mapping
    for (const sector of JOB_SECTOR_OPTIONS) {
      this.sectorMap.set(normalizeTrUniversal(sector), sector);
    }
  }

  /**
   * Resolves a free-text or raw role string to its canonical platform position.
   */
  static resolveRole(rawRole?: string): { canonicalRole: string; confidence: number } {
    if (!rawRole) return { canonicalRole: '', confidence: 0 };

    const norm = normalizeTrUniversal(rawRole).trim();
    if (!norm) return { canonicalRole: '', confidence: 0 };

    // 1. Direct exact alias match
    if (this.roleMap.has(norm)) {
      return { canonicalRole: this.roleMap.get(norm)!, confidence: 0.98 };
    }

    // 2. Substring / compound match
    for (const [alias, canonical] of this.roleMap.entries()) {
      if (alias.length >= 4 && (norm === alias || norm.includes(alias) || alias.includes(norm))) {
        return { canonicalRole: canonical, confidence: 0.9 };
      }
    }

    // 3. Fallback to title-cased clean Turkish string
    const cleaned = rawRole
      .replace(/^[\s•\-\*#|:–—\d\.\)]+/, '')
      .replace(/[\(].*?[\)]/g, '')
      .trim();

    return {
      canonicalRole: suggestTitleCaseTr(cleaned || rawRole),
      confidence: 0.65,
    };
  }

  /**
   * Resolves the primary industry sector based on role and sector hints.
   */
  static resolveSector(rawSector?: string, roleHint?: string): { canonicalSector: string; confidence: number } {
    const combinedNorm = normalizeTrUniversal(`${rawSector || ''} ${roleHint || ''}`);

    // Check keyword map
    for (const [sector, keywords] of Object.entries(UNIVERSAL_SECTOR_KEYWORDS)) {
      for (const kw of keywords) {
        const normKw = normalizeTrUniversal(kw);
        if (combinedNorm.includes(normKw)) {
          return { canonicalSector: sector, confidence: 0.95 };
        }
      }
    }

    // Direct sector option matching
    if (rawSector) {
      const normRaw = normalizeTrUniversal(rawSector);
      for (const opt of JOB_SECTOR_OPTIONS) {
        if (normRaw.includes(normalizeTrUniversal(opt))) {
          return { canonicalSector: opt, confidence: 0.9 };
        }
      }
    }

    return { canonicalSector: 'Diğer', confidence: 0.5 };
  }

  /**
   * Resolves skills and software tools into categorized canonical sets.
   */
  static resolveSkillsAndTools(rawSkills: string[]): {
    professionalSkills: string[];
    technicalSkills: string[];
    tools: string[];
  } {
    const profSet = new Set<string>();
    const techSet = new Set<string>();
    const toolSet = new Set<string>();

    for (const raw of rawSkills) {
      const norm = normalizeTrUniversal(raw).trim();
      if (!norm || norm.length < 2) continue;

      let matched = false;

      // Check Tools Map
      for (const [kw, canonical] of Object.entries(UNIVERSAL_TOOLS_MAP)) {
        if (norm === normalizeTrUniversal(kw) || norm.includes(normalizeTrUniversal(kw))) {
          toolSet.add(canonical);
          matched = true;
          break;
        }
      }

      // Check Tech Skills Map
      for (const [kw, canonical] of Object.entries(UNIVERSAL_TECH_SKILLS_MAP)) {
        if (norm === normalizeTrUniversal(kw) || norm.includes(normalizeTrUniversal(kw))) {
          techSet.add(canonical);
          matched = true;
          break;
        }
      }

      // Check Professional Skills Map
      for (const [kw, canonical] of Object.entries(UNIVERSAL_PROF_SKILLS_MAP)) {
        if (norm === normalizeTrUniversal(kw) || norm.includes(normalizeTrUniversal(kw))) {
          profSet.add(canonical);
          matched = true;
          break;
        }
      }

      if (!matched && raw.length <= 40) {
        const clean = suggestTitleCaseTr(raw.trim());
        if (clean) profSet.add(clean);
      }
    }

    return {
      professionalSkills: Array.from(profSet),
      technicalSkills: Array.from(techSet),
      tools: Array.from(toolSet),
    };
  }

  /**
   * Resolves foreign languages with proficiency levels.
   */
  static resolveLanguages(rawLanguages: string[]): string {
    const detected = new Set<string>();

    for (const raw of rawLanguages) {
      const norm = normalizeTrUniversal(raw);
      for (const [kw, canonical] of Object.entries(UNIVERSAL_LANGUAGE_MAP)) {
        if (norm.includes(normalizeTrUniversal(kw))) {
          let levelHint = '';
          if (/c2|native|anadil|ileri\s*duzey|advanced/i.test(norm)) levelHint = ' (İleri / C2)';
          else if (/c1|fluent|akici|proficient/i.test(norm)) levelHint = ' (C1 / Akıcı)';
          else if (/b2|upper\s*intermediate|orta\s*ustu/i.test(norm)) levelHint = ' (B2)';
          else if (/b1|intermediate|orta/i.test(norm)) levelHint = ' (B1)';
          else if (/a2|a1|elementary|baslangic/i.test(norm)) levelHint = ' (A2 / Başlangıç)';

          detected.add(`${canonical}${levelHint}`);
          break;
        }
      }
    }

    return Array.from(detected).join(', ');
  }

  /**
   * Resolves certificates and professional accreditations.
   */
  static resolveCertificates(rawCerts: string[]): string {
    const detected = new Set<string>();

    for (const raw of rawCerts) {
      const norm = normalizeTrUniversal(raw);
      for (const [kw, canonical] of Object.entries(UNIVERSAL_CERTIFICATE_MAP)) {
        if (norm.includes(normalizeTrUniversal(kw))) {
          detected.add(canonical);
          break;
        }
      }
      if (raw.length <= 60 && !raw.includes('\n')) {
        detected.add(raw.trim());
      }
    }

    return Array.from(detected).join(', ');
  }
}
