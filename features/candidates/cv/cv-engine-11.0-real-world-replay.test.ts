import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { cvService } from './cv.service';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildHydratedCustomFieldsFromCvDraft } from './cv-form-hydrator';
import { segmentCvIntoDocumentZones } from './cv-document-zoning';
import { scoreCandidateName, scoreCandidateRole, scoreCandidateSector } from './cv-candidate-scorer';

describe('CV Extraction Engine 11.0 — Real-World Document Replay & Golden Standard Suite', () => {
  const dir = 'c:/Users/ugurz/Downloads/test_cvs';
  const ugurPdfPath = 'c:/Users/ugurz/Downloads/CV - UĞUR ZAMAN (4).pdf';

  // --------------------------------------------------------------------------
  // 1. UĞUR ZAMAN GOLDEN REPLAY (Zero Contamination & Exact Canonical Grounding)
  // --------------------------------------------------------------------------
  it('Golden Replay [1/3]: Real Uğur Zaman PDF Replay with Strict Section Zoning', async () => {
    if (!fs.existsSync(ugurPdfPath)) return;

    const buf = fs.readFileSync(ugurPdfPath);
    const draft = await cvService.processCvBuffer({
      buffer: buf,
      fileName: 'CV - UĞUR ZAMAN (4).pdf',
      mimeType: 'application/pdf',
    });

    // 1. Identity & Name
    expect(draft.formValues.fullName).toBe('Uğur Zaman');
    expect(draft.formValues.fullName).not.toMatch(/Eğitim|Beceriler|Müdür|Uzman/i);

    // 2. Primary Role & Sector
    expect(draft.formValues.role).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(draft.formValues.desiredRole).toBe('Çağrı Merkezi Operasyon Müdürü');
    expect(draft.formValues.sector).toBe('Çağrı merkezi');
    expect(draft.formValues.primarySector).toBe('Çağrı merkezi');
    expect(draft.formValues.experienceLevel).toBe('Yönetici');

    // 3. Location
    expect(draft.formValues.city).toBe('İstanbul');
    expect(draft.formValues.residenceCity).toBe('İstanbul');
    expect(draft.formValues.residenceDistrict).toBe('Maltepe');

    // 4. Experiences (Exact 6)
    expect(draft.formValues.experiences?.length).toBe(6);
    expect(draft.categoriesFound.experiences).toBe(6);

    // 5. Education (Exact 2)
    expect(draft.formValues.educationHistory?.length).toBe(2);
    expect(draft.formValues.educationLevel).toBe('Yüksek lisans');

    // 6. Zero Hallucination
    expect(draft.formValues.salaryMin).toBeNull();
    expect(draft.formValues.salaryMax).toBeNull();
    expect(draft.formValues.availability).toBe('');
    expect(draft.formValues.workType).toBe('');
    expect(draft.metrics.aiCallCount).toBe(0);

    // 7. Client Hydration Integrity
    const hydrated = buildHydratedCustomFieldsFromCvDraft(draft);
    expect(hydrated.nextCustomFields.fullName).toBe('Uğur Zaman');
    expect(hydrated.nextCustomFields.primarySector).toBe('Çağrı merkezi');
    expect(hydrated.nextCustomFields.residenceCity).toBe('İstanbul');
    expect(hydrated.nextCustomFields.residenceDistrict).toBe('Maltepe');
  });

  // --------------------------------------------------------------------------
  // 2. REAL CORPUS PDF REPLAY (10 Real PDFs in test_cvs)
  // --------------------------------------------------------------------------
  it('Golden Replay [2/3]: Processes all 10 Real PDFs in test_cvs with 100% Grounding', async () => {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.pdf'));
    expect(files.length).toBeGreaterThanOrEqual(10);

    for (const f of files) {
      const fullPath = path.join(dir, f);
      const buf = fs.readFileSync(fullPath);

      const draft = await cvService.processCvBuffer({
        buffer: buf,
        fileName: f,
        mimeType: 'application/pdf',
      });

      // Name must be populated and non-generic
      expect(draft.formValues.fullName).toBeTruthy();
      expect(draft.formValues.fullName).not.toMatch(/Eğitim|Deneyim|Profil|Beceriler|Kişisel/i);

      // Role must be non-generic
      expect(draft.formValues.desiredRole).toBeTruthy();
      expect(draft.formValues.desiredRole).not.toBe('Eğitim');

      // Sector must be populated
      expect(draft.formValues.primarySector).toBeTruthy();

      // Experiences and Education must be reconstructed entities
      expect(draft.formValues.experiences).toBeDefined();
      expect(draft.formValues.experiences!.length).toBeGreaterThanOrEqual(1);
      expect(draft.formValues.educationHistory).toBeDefined();
      expect(draft.formValues.educationHistory!.length).toBeGreaterThanOrEqual(1);

      // Hydration must preserve state
      const hydrated = buildHydratedCustomFieldsFromCvDraft(draft);
      expect(hydrated.nextCustomFields.fullName).toBe(draft.formValues.fullName);
      expect(hydrated.nextCustomFields.desiredRole).toBe('');
    }
  });

  // --------------------------------------------------------------------------
  // 3. BURAK BATIL ÖZDEMİR REAL CV REPLAY
  // --------------------------------------------------------------------------
  it('Golden Replay [3/3]: Burak Batıl Özdemir Real CV Replay with District Isolation', async () => {
    const burakText = `
KİŞİSEL
İsim: BURAK BATIL ÖZDEMİR
Adres: İnönü mahallesi 352. sokak 34000 İstanbul/Esenyurt
Telefon numarası: 5395102167
E-posta: burakbatilozdemir@gmail.com
Doğum tarihi: 13-06-1996
Sürücü ehliyeti: A, B
Diller: İngilizce A2

BURAK BATIL ÖZDEMİR
İletişim becerileri güçlü, insan ilişkilerinde başarılı ve satış süreçlerinde deneyim sahibi biriyim.

İş deneyimi
Finansal Güvence Danışmanı
Viennalife Genel Müdürlük, İstanbul
Mar 2026 - May 2026

Vardiya Müdürü
Caffe Nero, İstanbul
Mar 2023 - Ağu 2025

Eğitim ve Nitelikler
Turizm ve Otel İşletmesi
Muğla Sıtkı Koçman Üniversitesi, Muğla
Eyl 2019 - Tem 2022
`;
    const det = extractDeterministicCv(burakText);
    const canonical = mapCvToCanonicalTaxonomy(det);

    expect(canonical.fullName).toBe('Burak Batıl Özdemir');
    expect(canonical.residenceCity).toBe('İstanbul');
    expect(canonical.residenceDistrict).toBe('Esenyurt');
    expect(canonical.experiences.length).toBe(2);
    expect(canonical.educationList.length).toBe(1);
  });
});
