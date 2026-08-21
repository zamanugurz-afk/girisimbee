import { describe, it, expect } from 'vitest';
import { reconstructDocumentLayout, type RawSpatialToken } from './cv-spatial-layout-engine';
import { classifyDocumentSections, isSectionHeaderBlock } from './cv-section-classifier';
import { CvConfidenceEngine } from './cv-confidence-engine';
import { CvUnifiedTaxonomy } from './cv-unified-taxonomy';
import { resolveExperienceBlocks } from './cv-experience-resolver';
import { resolveEducationBlocks } from './cv-education-resolver';
import { resolveSkillBlocks } from './cv-skill-resolver';

describe('CV Extraction 3.0 — Spatial Layout & Reading Order Suite', () => {
  it('detects two-column sidebar layout and reconstructs correct reading order', () => {
    // Simulated Canva-style two-column CV:
    // Left column (x: 50..180): Skills, Languages, Contact
    // Right column (x: 240..500): Experience timeline, Education
    const tokens: RawSpatialToken[] = [
      // Top header (spans across)
      { text: 'Ahmet Arda Yılmaz', page: 1, x: 50, y: 50, width: 400, height: 20, fontSize: 18, isBold: true },
      { text: 'Senior Software Engineer', page: 1, x: 50, y: 75, width: 300, height: 14, fontSize: 12 },

      // Left column: Skills
      { text: 'YETKİNLİKLER', page: 1, x: 50, y: 120, width: 120, height: 14, fontSize: 12, isBold: true },
      { text: 'React, Node.js, TypeScript', page: 1, x: 50, y: 140, width: 130, height: 10, fontSize: 10 },
      { text: 'Docker, Kubernetes, AWS', page: 1, x: 50, y: 160, width: 130, height: 10, fontSize: 10 },

      // Left column: Languages
      { text: 'DİLLER', page: 1, x: 50, y: 200, width: 80, height: 14, fontSize: 12, isBold: true },
      { text: 'İngilizce (C1 - İleri)', page: 1, x: 50, y: 220, width: 120, height: 10, fontSize: 10 },

      // Right column: Experience
      { text: 'İŞ DENEYİMİ', page: 1, x: 260, y: 120, width: 150, height: 14, fontSize: 12, isBold: true },
      { text: 'Trendyol Tech - Senior Developer', page: 1, x: 260, y: 140, width: 220, height: 12, fontSize: 11 },
      { text: '2021 - Günümüz', page: 1, x: 260, y: 155, width: 100, height: 10, fontSize: 10 },
      { text: 'Mikroservis mimarisi ve yüksek trafikli sistemlerin geliştirilmesi.', page: 1, x: 260, y: 175, width: 230, height: 10, fontSize: 10 },

      // Right column: Previous job
      { text: 'Hepsiburada - Software Developer', page: 1, x: 260, y: 210, width: 220, height: 12, fontSize: 11 },
      { text: '2018 - 2021', page: 1, x: 260, y: 225, width: 90, height: 10, fontSize: 10 },
      { text: 'Ödeme sistemleri ve sipariş yönetim servislerinin entegrasyonu.', page: 1, x: 260, y: 245, width: 230, height: 10, fontSize: 10 },
    ];

    const docModel = reconstructDocumentLayout(tokens, 'pdf');

    expect(docModel.isMultiColumn).toBe(true);
    expect(docModel.pages[0].columns.length).toBe(2);

    // Verify sections
    const sections = classifyDocumentSections(docModel);
    expect(sections.some((s) => s.type === 'skills')).toBe(true);
    expect(sections.some((s) => s.type === 'experience')).toBe(true);
    expect(sections.some((s) => s.type === 'languages')).toBe(true);

    // Verify skills did not pollute the experience section
    const expBlocks = sections.find((s) => s.type === 'experience')?.blocks || [];
    const expText = expBlocks.map((b) => b.text).join(' ');
    expect(expText).not.toContain('React, Node.js');
    expect(expText).toContain('Trendyol Tech');
    expect(expText).toContain('Hepsiburada');
  });

  it('filters recurring header/footer noise across multi-page documents', () => {
    const tokens: RawSpatialToken[] = [
      // Page 1
      { text: 'Gizem Şahin CV - Sayfa 1', page: 1, x: 50, y: 20, width: 200, height: 10, fontSize: 8 },
      { text: 'Girişim Teknoloji A.Ş. Gizli Belge', page: 1, x: 50, y: 800, width: 200, height: 10, fontSize: 8 },
      { text: 'DENEYİM', page: 1, x: 50, y: 100, width: 100, height: 14, fontSize: 12, isBold: true },
      { text: 'Garanti BBVA - Yazılım Uzmanı (2020 - 2024)', page: 1, x: 50, y: 120, width: 300, height: 10 },

      // Page 2
      { text: 'Gizem Şahin CV - Sayfa 2', page: 2, x: 50, y: 20, width: 200, height: 10, fontSize: 8 },
      { text: 'Girişim Teknoloji A.Ş. Gizli Belge', page: 2, x: 50, y: 800, width: 200, height: 10, fontSize: 8 },
      { text: 'EĞİTİM', page: 2, x: 50, y: 100, width: 100, height: 14, fontSize: 12, isBold: true },
      { text: 'İTÜ - Bilgisayar Mühendisliği (2016 - 2020)', page: 2, x: 50, y: 120, width: 300, height: 10 },
    ];

    const docModel = reconstructDocumentLayout(tokens, 'pdf');
    expect(docModel.totalPages).toBe(2);

    // Ensure footer noise was filtered out
    expect(docModel.readingOrderText).not.toContain('Gizli Belge');
    expect(docModel.readingOrderText).toContain('Garanti BBVA');
    expect(docModel.readingOrderText).toContain('İTÜ');
  });

  it('calculates multi-factor confidence and attaches field provenance records', () => {
    const prov = CvConfidenceEngine.evaluateField(
      'experiences',
      [{ company: 'Akbank', role: 'Mühendis' }],
      'experience',
      'Akbank 2020 - 2023 Yazılım Mühendisi',
      'spatial_deterministic',
      { isDictionaryMatch: true, hasDateProximity: true },
    );

    expect(prov.confidence).toBeGreaterThanOrEqual(0.95);
    expect(prov.method).toBe('spatial_deterministic');
    expect(prov.sourceSection).toBe('experience');
  });

  it('resolves unified taxonomy, roles, sectors, skills, and languages with zero ambiguity', () => {
    const roleRes = CvUnifiedTaxonomy.resolveRole('Senior Software Engineering Manager');
    expect(roleRes.canonicalRole).toBe('Yazılım Geliştirme Yöneticisi');

    const compoundRole = CvUnifiedTaxonomy.resolveRole('Mimar & Şantiye Şefi');
    expect(compoundRole.canonicalRole).toBe('Şantiye Şefi');

    const sectorRes = CvUnifiedTaxonomy.resolveSector('Finans', 'Banka Müdürü');
    expect(sectorRes.canonicalSector).toBe('Finans / Bankacılık');

    const skills = CvUnifiedTaxonomy.resolveSkillsAndTools(['React', 'Kubernetes', 'Ekip Yönetimi', 'Excel']);
    expect(skills.technicalSkills).toContain('React');
    expect(skills.tools).toContain('Kubernetes');
    expect(skills.professionalSkills).toContain('Ekip Yönetimi');

    const lang = CvUnifiedTaxonomy.resolveLanguages(['İngilizce C1', 'Almanca Başlangıç']);
    expect(lang).toContain('İngilizce (C1 / Akıcı)');
    expect(lang).toContain('Almanca (A2 / Başlangıç)');
  });
});
