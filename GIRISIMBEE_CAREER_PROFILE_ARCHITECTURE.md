# GİRİŞİMBEE — CAREER PROFILE ARCHITECTURE SPECIFICATION

**Tarih:** 2026-08-23  
**Sürüm:** Engine 13.0  
**Kapsam:** Tekil Master Profil ve 3 Ana Kullanıcı Niyeti İzdüşüm (Intent Projections) Mimarisi  

---

## 1. MASTER PROFILE VE NİYET İZDÜŞÜMLERİ (INTENT PROJECTIONS)

Girişimbee Career Profile mimarisinde kullanıcı bilgileri 3 ayrı profile bölünmez. Tek bir **Master Career Profile** üzerinde 3 niyet projeksiyonu bulunur:

```
                      ┌───────────────────────────┐
                      │   Master Career Profile   │
                      │  (Core Verified Evidence) │
                      └─────────────┬─────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
[Job Seeking Projection]   [Hiring Projection]    [Partnership Projection]
- desiredRole              - hiringRoles          - founderName
- targetSector             - targetSectors        - expertiseAreas
- experienceLevel          - requiredSeniority    - startupStage
- salaryExpectation        - requiredSkills       - capitalContribution
- availability             - companyName          - equityOffered
```

---

## 2. VERİ MODELİ TANIMI

```typescript
export interface MasterCareerProfile {
  id: string;
  userId: string;
  fullName: ProvenanceField<string>;
  email: ProvenanceField<string>;
  phone: ProvenanceField<string>;
  residenceCity: ProvenanceField<string>;
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
  activeIntentMode: 'seek' | 'hire' | 'partner';
  version: number;
}
```
