# GİRİŞİMBEE — CV EXTRACTION ENGINE 13.0 PRODUCTION INTEGRATION MAP

**Tarih:** 2026-08-23  
**Sürüm:** Engine 13.0  
**Kapsam:** CV Extraction $\to$ Career Profile $\to$ Job Posting $\to$ Job Matching $\to$ Job Application $\to$ Supabase Persistence End-to-End Mimari Haritası  

---

## 1. END-TO-END VERİ VE DURUM AKIŞ ŞEMASI

```
[Kullanıcı CV Yükler] (PDF/DOCX/TXT)
         │
         ▼
[1. Binary & MIME Validation] ───> [2. Text Extraction & Encoding Repair]
                                                    │
                                                    ▼
                                    [3. Spatial Layout & 14-Zone Segmentation]
                                                    │
                                                    ▼
                                    [4. Deterministic Multi-Entity Extraction]
                                                    │
                                                    ▼
                                    [5. Evidence Graph & DAG Validation]
                                                    │
                                                    ▼
                                    [6. Canonical Taxonomy Mapping & Draft]
                                                    │
                                                    ▼
                                    [7. Multi-Factor Quality Scoring]
                                                    │
                                                    ▼
[8. CV Review & Confirmation Screen] <──────────────┘
  (Field-level Provenance: Extracted Value, Confidence, Source, User Action)
         │
         ├── [Kullanıcı Düzenler / Onaylar]
         ▼
[9. Canonical Master Career Profile] (Source Tagging: CV, USER, NORMALIZED, TAXONOMY)
         │
         ├───────────────────────────────┬───────────────────────────────┐
         ▼                               ▼                               ▼
[İş Arayan Projeksiyonu]        [İşe Alan Projeksiyonu]        [Ortak Arayan Projeksiyonu]
(seek: desiredRole, salary,     (hire: hiring roles,           (partner: equity, stage,
 experienceLevel, location)      company info, requiredSkills)  investment, businessModel)
         │
         ▼
[10. Deterministic Job Matching Engine] (Role, Sector, Skills, Exp, Loc, Lang - Explainable)
         │
         ▼
[11. Job Application Auto-Fill] (İlana Özel Application Draft & Overrides - Master Profile Korunur)
         │
         ▼
[12. Immutable Application Snapshot Submission] (Supabase `ecosystem_applications` & Overrides)
```

---

## 2. 16 AŞAMALI DETAYLI ENTEGRASYON MATRİSİ

| No | Pipeline Aşaması | Girdi (Input) | Çıktı (Output) | İlgili Dosya / Modül | İlgili Fonksiyon / API | Veritabanı Tablosu | Durum / State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **CV Upload** | `File` / `FormData` | `Buffer`, `mimeType`, `fileName` | `app/api/career/cv/analyze/route.ts` | `POST /api/career/cv/analyze` | `cv_documents` / Storage | `UPLOADING` |
| **2** | **Binary Validation** | `Buffer`, `mimeType` | Doğrulanmış `Buffer` | `cv-text-extractor.ts` | `extractCvText` | `cv_documents` | `VALIDATING` |
| **3** | **Text Extraction** | `Buffer` | UTF-8 NFC Metin | `cv-text-extractor.ts`, `cv-turkish-encoding.ts` | `normalizeCvText` | `cv_extractions` | `EXTRACTING` |
| **4** | **Document Zoning** | Ham metin satırları | 14 Semantik Bölge (`CvDocumentZone[]`) | `cv-document-zoning.ts` | `segmentCvIntoDocumentZones` | Geçici Bellek / Graph | `ZONING` |
| **5** | **Deterministic Extraction** | 14 Bölge Metinleri | Ham entity listesi (İsim, Rol, Sektör, Exp, Edu, Skill) | `cv-deterministic-extractor.ts` | `extractDeterministicCv` | `cv_extractions` | `PARSED` |
| **6** | **Evidence Graph** | Ham entity'ler | DAG Kanıt Grafı (`CvEvidenceGraph`) | `cv-evidence-graph.ts` | `buildCvEvidenceGraph`, `enforceEvidenceGraphFirewall` | `cv_evidence` | `GRAPH_VALIDATED` |
| **7** | **Canonical Draft** | Ham entity'ler + Graf | `CanonicalTaxonomyMappingResult` | `cv-taxonomy-mapper.ts`, `cv-profile-builder.ts` | `mapCvToCanonicalTaxonomy`, `buildProfileDraftFromCanonicalResult` | `career_profile_drafts` | `DRAFT_READY` |
| **8** | **Taxonomy Mapping** | Serbest metinler | 500+ Rol & 50+ Sektör Girişimbee Eşleşmesi | `cv-taxonomy-mapper.ts` | `inferSectorFromRole`, `matchCanonicalPosition` | `taxonomy_roles`, `taxonomy_sectors` | `TAXONOMY_MAPPED` |
| **9** | **Quality Score** | Kanonik sonuç | Çok boyutlu kalite skoru (0.0 - 1.0) | `cv.service.ts`, `cv-evidence-graph.ts` | `calculateExtractionQualityScore` | `cv_extractions.quality_score` | `SCORED` |
| **10**| **React Hydration** | `CvProfileDraftResult` + Form | `HydratedFormResult` (`nextCustomFields`) | `cv-form-hydrator.ts` | `buildHydratedCustomFieldsFromCvDraft` | React Hook Form State | `HYDRATED` |
| **11**| **Career Profile Review**| Form state | Alan bazlı onay/düzenleme nesnesi | `features/career-profile/components/` | `CareerProfilePreview.tsx`, `CareerAiAnalyzePanel.tsx` | UI State | `REVIEWING` |
| **12**| **Master Profile Persistence** | Onaylanmış form | `CareerProfileRecord` (Master + Projeksiyonlar) | `features/career-profile/career-profile.service.ts` | `POST /api/career/profile/confirm` | `career_profiles`, `profiles`, `ecosystem_listings` | `CONFIRMED` |
| **13**| **Job Matching Engine** | Master Profile + İlan | Eşleşme Skoru (0-100) + Açıklamalar | `features/matching-engine/career-match.service.ts` | `GET /api/jobs/:id/match` | `ecosystem_matches` | `MATCHED` |
| **14**| **Job Application Auto-Fill**| Master Profile + İlan | İlana Özel Başvuru Taslağı | `features/career-profile/` | `POST /api/jobs/:id/application/draft` | `ecosystem_applications` | `DRAFT_APPLICATION` |
| **15**| **Application Override** | Kullanıcı düzenlemeleri | İlana özel alan geçersiz kılmaları | `features/career-profile/` | `PATCH /api/jobs/:id/application/draft` | `application_field_overrides` | `APPLICATION_CUSTOMIZED` |
| **16**| **Immutable Submission**| Başvuru nesnesi | Kilitli başvuru kaydı | `features/career-profile/` | `POST /api/jobs/:id/application/submit` | `ecosystem_applications` (status: submitted) | `SUBMITTED` |

---

## 3. MASTER CAREER PROFILE & PROJECTION YAPISI

```typescript
export interface MasterCareerProfile {
  id: string;
  userId: string;
  fullName: ProvenanceField<string>;
  email: ProvenanceField<string>;
  phone: ProvenanceField<string>;
  residenceCity: ProvenanceField<string>;
  residenceDistrict?: ProvenanceField<string>;
  primaryRole: ProvenanceField<string>;
  primarySector: ProvenanceField<string>;
  experienceLevel: ProvenanceField<string>;
  experiences: CareerExperience[];
  educationList: CareerEducationItem[];
  skills: ProvenanceField<string[]>;
  tools: ProvenanceField<string[]>;
  languages: ProvenanceField<string[]>;
  certificates: ProvenanceField<string[]>;
  preferences: CareerPreferences;
  cvDocumentId?: string;
  lastConfirmedAt?: string;
}
```

Bu yapı, kullanıcının CV'sinden gelen kanıtları (`source: 'CV'`), kullanıcının yaptığı değişiklikleri (`source: 'USER'`) ve sistem normalizasyonlarını (`source: 'NORMALIZED'`) kesin olarak birbirinden ayırır.
