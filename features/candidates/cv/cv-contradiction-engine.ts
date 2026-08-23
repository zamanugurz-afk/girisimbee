/**
 * GİRİŞİMBEE — CV EXTRACTION ENGINE 9.0
 * CONTRADICTION DETECTION & EVIDENCE RECONCILIATION ENGINE
 * 
 * Inspects multi-source extraction signals to detect and classify cross-field
 * conflicts, chronological impossibilities, domain divergences, and duplicate
 * entries. Contradictions are NEVER silently dropped; they are surfaced as
 * structured conflict objects for ranking, confidence penalization, and human review.
 */

import type {
  AiCvExtractionPayload,
  RawExtractedExperience,
  RawExtractedEducation,
  CanonicalTaxonomyMappingResult,
  CvContradiction,
} from './cv.types';
import { normalizeTrUniversal } from './cv-universal-normalizer';

export interface ContradictionAuditReport {
  contradictions: CvContradiction[];
  hasCriticalContradictions: boolean;
  totalConflicts: number;
  roleCandidates: string[];
  sectorCandidates: string[];
}

export class CvContradictionEngine {
  /**
   * Evaluates the raw extraction payload and canonical taxonomy mapping
   * to uncover structural, chronological, or semantic contradictions.
   */
  public detectContradictions(input: {
    rawPayload: AiCvExtractionPayload;
    canonical: CanonicalTaxonomyMappingResult;
    rawText?: string;
  }): ContradictionAuditReport {
    const { rawPayload, canonical } = input;
    const contradictions: CvContradiction[] = [];
    let idCounter = 0;
    const nextId = (type: string) => `cntr_${type}_${++idCounter}`;

    const currentYear = new Date().getFullYear();

    // 1. HEADER ROLE vs. LATEST EXPERIENCE ROLE MISMATCH
    let headerRole = rawPayload.roles && rawPayload.roles.length > 0 ? rawPayload.roles[0] : '';
    if (!headerRole && input.rawText) {
      const lines = input.rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      for (let i = 0; i < Math.min(lines.length, 8); i++) {
        const l = lines[i];
        const isContactOrLoc =
          l.includes('@') ||
          /\d{3,}/.test(l) ||
          l.includes('/') ||
          l.includes('|') ||
          /^(istanbul|ankara|izmir|bursa|turkiye|turkey|kadikoy|besiktas)/i.test(l);

        if (
          !isContactOrLoc &&
          !/^(deneyim|egitim|is|beceri|kisisel|ozgecmis|iletisim|referans)/i.test(l) &&
          l !== rawPayload.fullName &&
          l.length >= 3 &&
          l.length <= 60
        ) {
          headerRole = l;
          break;
        }
      }
    }

    const latestExpRole =
      rawPayload.experiences && rawPayload.experiences.length > 0
        ? rawPayload.experiences[0].role || ''
        : '';

    const roleCandidates: string[] = [];
    if (headerRole) roleCandidates.push(headerRole);
    (rawPayload.roles || []).forEach((r: string) => {
      if (!roleCandidates.some((rc) => rc.toLowerCase() === r.toLowerCase())) {
        roleCandidates.push(r);
      }
    });
    if (latestExpRole && !roleCandidates.some((r) => r.toLowerCase() === latestExpRole.toLowerCase())) {
      roleCandidates.push(latestExpRole);
    }

    if (headerRole && latestExpRole) {
      const normH = normalizeTrUniversal(headerRole);
      const normE = normalizeTrUniversal(latestExpRole);

      // Check if they are substantially divergent (e.g. "Satış Direktörü" vs "Yazılım Mühendisi")
      if (normH !== normE && !normH.includes(normE) && !normE.includes(normH)) {
        contradictions.push({
          id: nextId('role_mismatch'),
          type: 'HEADER_ROLE_EXPERIENCE_ROLE_MISMATCH',
          severity: 'MEDIUM',
          description: `Başlıkta belirtilen rol ("${headerRole}") ile en son iş deneyimindeki rol ("${latestExpRole}") farklılık gösteriyor.`,
          fields: ['desiredRole', 'experiences[0].role'],
          candidates: [headerRole, latestExpRole],
          resolutionSuggestion: 'Son deneyim rolü birincil kabul edildi; başlık rolü alternatif aday olarak eklendi.',
        });
      }
    }

    // 2. PROFILE SECTOR vs. EMPLOYMENT SECTOR MISMATCH
    const headerSector = rawPayload.sectors && rawPayload.sectors.length > 0 ? rawPayload.sectors[0] : '';
    const expSectors = (rawPayload.experiences || []).map((e: RawExtractedExperience) => e.sector).filter(Boolean) as string[];
    const sectorCandidates: string[] = [];
    if (headerSector) sectorCandidates.push(headerSector);
    expSectors.forEach((s: string) => {
      if (!sectorCandidates.some((sc) => sc.toLowerCase() === s.toLowerCase())) {
        sectorCandidates.push(s);
      }
    });

    if (headerSector && expSectors.length > 0) {
      const normHS = normalizeTrUniversal(headerSector);
      const hasMatchingExpSector = expSectors.some((es) => {
        const normES = normalizeTrUniversal(es);
        return normHS === normES || normHS.includes(normES) || normES.includes(normHS);
      });

      if (!hasMatchingExpSector) {
        contradictions.push({
          id: nextId('sector_mismatch'),
          type: 'PROFILE_SECTOR_EXPERIENCE_SECTOR_MISMATCH',
          severity: 'LOW',
          description: `Özet veya başlıkta belirtilen sektör ("${headerSector}") ile geçmiş iş deneyimlerinin sektörleri (${expSectors.join(', ')}) birebir örtüşmüyor.`,
          fields: ['primarySector', 'experiences.sector'],
          candidates: [headerSector, ...expSectors],
          resolutionSuggestion: 'Adayın son deneyimine ait sektör önceliklendirildi.',
        });
      }
    }

    // 3. EDUCATION vs. PROFESSIONAL SECTOR DIVERGENCE (Informational)
    const eduFields = (rawPayload.education || []).map((e: RawExtractedEducation) => e.field).filter(Boolean) as string[];
    if (canonical.primarySector && eduFields.length > 0) {
      const normSec = normalizeTrUniversal(canonical.primarySector);
      const isEduFieldDifferent = eduFields.every((ef) => {
        const normEf = normalizeTrUniversal(ef);
        return !normSec.includes(normEf) && !normEf.includes(normSec);
      });

      if (isEduFieldDifferent) {
        contradictions.push({
          id: nextId('edu_sector_diff'),
          type: 'EDUCATION_PROFESSIONAL_SECTOR_MISMATCH',
          severity: 'INFO',
          description: `Adayın eğitim alanı (${eduFields.join(', ')}) ile icra ettiği profesyonel sektör ("${canonical.primarySector}") farklı disiplinlere aittir.`,
          fields: ['educationField', 'primarySector'],
          candidates: [canonical.primarySector, ...eduFields],
          resolutionSuggestion: 'Eğitim alanı sektör üzerine ezilmedi; profesyonel iş deneyimi sektörü geçerli kılındı.',
        });
      }
    }

    // 4. MULTIPLE CONCURRENT ACTIVE JOBS
    const activeExperiences = (rawPayload.experiences || []).filter((e: RawExtractedExperience) => e.isCurrent || (!e.endYear && e.startYear));
    if (activeExperiences.length > 1) {
      contradictions.push({
        id: nextId('multi_current_job'),
        type: 'MULTIPLE_CONCURRENT_ACTIVE_JOBS',
        severity: 'MEDIUM',
        description: `CV'de birden fazla (${activeExperiences.length}) devam eden aktif iş kaydı tespit edildi: ${activeExperiences.map((e: RawExtractedExperience) => e.company || 'Bilinmeyen').join(', ')}.`,
        fields: ['experiences.isCurrent'],
        candidates: activeExperiences.map((e: RawExtractedExperience) => `${e.company} (${e.role})`),
        resolutionSuggestion: 'En son başlanan deneyim birincil kabul edildi, diğerleri eş zamanlı görev olarak işaretlendi.',
      });
    }

    // 5. IMPOSSIBLE OR INVERTED DATES & OVERLAPPING PERIODS
    const exps = rawPayload.experiences || [];
    for (let i = 0; i < exps.length; i++) {
      const exp = exps[i];
      const start = exp.startYear;
      const end = exp.endYear;

      // Inverted Date (startYear > endYear)
      if (start && end && start > end) {
        contradictions.push({
          id: nextId('inverted_dates'),
          type: 'IMPOSSIBLE_OR_INVERTED_DATES',
          severity: 'HIGH',
          description: `"${exp.company || 'Deneyim'}" için başlangıç yılı (${start}), bitiş yılından (${end}) büyük.`,
          fields: [`experiences[${i}].startYear`, `experiences[${i}].endYear`],
          resolutionSuggestion: 'Tarihler otomatik olarak kronolojik sıraya [start <= end] getirildi.',
        });
      }

      // Out of bounds / Future impossible dates
      if ((start && (start < 1960 || start > currentYear + 2)) || (end && (end < 1960 || end > currentYear + 2))) {
        contradictions.push({
          id: nextId('out_of_bounds_date'),
          type: 'IMPOSSIBLE_OR_INVERTED_DATES',
          severity: 'HIGH',
          description: `"${exp.company || 'Deneyim'}" için tespit edilen tarihler mantık sınırları dışında (${start}-${end}).`,
          fields: [`experiences[${i}]`],
          resolutionSuggestion: 'Geçersiz tarih aralığı temizlendi.',
        });
      }
    }

    // 6. DUPLICATE EXPERIENCE ENTRIES
    const seenExp = new Set<string>();
    for (let i = 0; i < exps.length; i++) {
      const exp = exps[i];
      const normC = normalizeTrUniversal(exp.company || '');
      const normR = normalizeTrUniversal(exp.role || '');
      if (normC && normR) {
        const key = `${normC}_${normR}_${exp.startYear}_${exp.endYear}`;
        if (seenExp.has(key)) {
          contradictions.push({
            id: nextId('duplicate_exp'),
            type: 'DUPLICATE_EXPERIENCE_ENTRIES',
            severity: 'LOW',
            description: `"${exp.company}" şirketindeki "${exp.role}" görevi mükerrer olarak listelenmiş.`,
            fields: [`experiences[${i}]`],
            resolutionSuggestion: 'Mükerrer deneyim kaydı tekleştirildi.',
          });
        } else {
          seenExp.add(key);
        }
      }
    }

    // 7. DUPLICATE EDUCATION ENTRIES
    const edus = rawPayload.education || [];
    const seenEdu = new Set<string>();
    for (let i = 0; i < edus.length; i++) {
      const edu = edus[i];
      const normS = normalizeTrUniversal(edu.school || '');
      const normF = normalizeTrUniversal(edu.field || '');
      if (normS) {
        const key = `${normS}_${normF}_${edu.graduationYear || ''}`;
        if (seenEdu.has(key)) {
          contradictions.push({
            id: nextId('duplicate_edu'),
            type: 'DUPLICATE_EDUCATION_ENTRIES',
            severity: 'LOW',
            description: `"${edu.school}" okulu eğitim geçmişinde mükerrer tespit edildi.`,
            fields: [`education[${i}]`],
            resolutionSuggestion: 'Mükerrer eğitim kaydı tekleştirildi.',
          });
        } else {
          seenEdu.add(key);
        }
      }
    }

    // 8. DUPLICATE SKILLS OR TOOLS
    const allSkills = rawPayload.skills || [];
    if (Array.isArray(allSkills)) {
      const seenSkills = new Set<string>();
      for (const s of allSkills) {
        const norm = normalizeTrUniversal(s);
        if (seenSkills.has(norm)) {
          contradictions.push({
            id: nextId('duplicate_skill'),
            type: 'DUPLICATE_SKILLS_OR_TOOLS',
            severity: 'INFO',
            description: `"${s}" yetkinliği yetenek listesinde birden fazla kez yer alıyor.`,
            fields: ['skills'],
            resolutionSuggestion: 'Mükerrer yetkinlik tekleştirildi.',
          });
          break; // Flag once
        }
        seenSkills.add(norm);
      }
    }

    const hasCriticalContradictions = contradictions.some(
      (c) => c.severity === 'HIGH' || c.severity === 'MEDIUM',
    );

    return {
      contradictions,
      hasCriticalContradictions,
      totalConflicts: contradictions.length,
      roleCandidates: [...new Set(roleCandidates)],
      sectorCandidates: [...new Set(sectorCandidates)],
    };
  }
}

export const cvContradictionEngine = new CvContradictionEngine();
