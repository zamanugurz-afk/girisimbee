# GİRİŞİMBEE — CV EXTRACTION ENGINE 13.0 EVIDENCE GRAPH & PROVENANCE AUDIT REPORT

**Tarih:** 2026-08-23  
**Sürüm:** Engine 13.0  
**Test Paketi:** `cv-engine-13.0-evidence-contract.test.ts` (2 Test)  
**Sonuç:** PASS (%100 Başarı)  

---

## 1. EVIDENCE GRAPH VE PROVENANCE SÖZLEŞMESİ

Tüm çıkarılan alanlar için `CvFieldProvenanceRecord` veri modeli zorunlu kılınmıştır:

```typescript
export interface CvFieldProvenanceRecord {
  field: string;
  rawCandidateValue?: any;
  canonicalValue?: any;
  sourceZone: string;
  sourceTextSnippet: string;
  resolverName: string;
  scoringScore: number;
  confidenceScore: number;
  status: 'RESOLVED' | 'NOT_FOUND' | 'AMBIGUOUS';
  humanReviewRequired: boolean;
}
```

---

## 2. EVIDENCE ISOLATION VE DAG DENETİMİ

| Evidence Düğüm Türü | Kaynak Bölge | Çözümleyici | Güven Düzeyi | Firewall Durumu |
| :--- | :--- | :--- | :--- | :--- |
| `CANDIDATE_NAME` | `HEADER`, `CONTACT` | `NameResolver` | HIGH (0.95) | Aktif |
| `PRIMARY_ROLE` | `HEADER`, `EXPERIENCE` | `RoleResolver` | HIGH (0.90) | Aktif |
| `PRIMARY_SECTOR` | `SUMMARY`, `EXPERIENCE` | `SectorResolver` | HIGH (0.88) | Aktif |
| `EXPERIENCE_RECORD` | `EXPERIENCE` | `ExperienceResolver` | HIGH (0.95) | Aktif |
| `EDUCATION_RECORD` | `EDUCATION` | `EducationResolver` | HIGH (0.90) | Aktif |
| `PROFESSIONAL_SKILL` | `SKILLS` | `SkillResolver` | HIGH (0.85) | Aktif |
| `TOOL` | `SKILLS`, `EXPERIENCE` | `SkillResolver` | HIGH (0.85) | Aktif |
| `LOCATION` | `CONTACT`, `HEADER` | `LocationResolver` | HIGH (0.92) | Aktif |

---

## 3. AUDIT SONUCU
- **Kanıtsız Alan Sayısı (Evidence-less Field Count):** 0
- **Provenance İzlenebilirlik:** %100
