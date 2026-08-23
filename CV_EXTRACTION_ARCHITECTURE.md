# Girisimbee CV Extraction Engine 4.0 Architecture & Specification

## 1. Overview & Core Philosophy

The **CV Extraction Engine 4.0** is an evidence-first, zero-hallucination document intelligence engine designed to extract, normalize, reconcile, and hydrate structured career profiles from diverse resume formats (PDF, DOCX, TXT, RTF).

### Core Principle: Evidence First
$$\text{EVIDENCE} \succ \text{INFERENCE} \succ \text{TAXONOMY} \succ \text{AI}$$

> **The Zero-Hallucination Invariant:**
> - If an entity (full name, role, sector, experience, skill, education) does not have explicit textual proof in the candidate's CV, the engine **MUST leave it empty/unresolved**.
> - The engine **NEVER** guesses, defaults to the first taxonomy child node (e.g. defaulting to `"Uzman"` or `"Kamu / Belediye"`), or dumps dictionary keywords when evidence is absent.
> - **Precision is prioritized over Recall** for all critical candidate fields.

---

## 2. Pipeline Stages

```
1. DOCUMENT INGESTION (cv-format-detector.ts)
   ├── Binary Magic Byte Inspection (%PDF-, PK\x03\x04, {\rtf, UTF-8)
   ├── Size & Encryption Checks (5 MB limit, /Encrypt detection)
   └── Quality & Signature Scoring

2. SPATIAL & ENCODING RECONSTRUCTION (cv-text-extractor.ts)
   ├── Mozilla pdf.js engine / Deterministic CMap / DOCX XML / RTF decoders
   ├── Hybrid Turkish CP1254/UTF-8 Mojibake Repair
   ├── Multi-Column & Sidebar Reading Order Sorting
   └── Header / Footer / Page Number Noise Filtering

3. PRIVACY & PII ANONYMIZATION (cv-pii-masker.ts)
   ├── KVKK / GDPR-Compliant Deterministic Tokenization
   └── Isolation of Candidate vs. Reference Contact Information

4. MODULAR RESOLVERS (cv-deterministic-extractor.ts & cv-name-extractor.ts)
   ├── NameResolver: Positive candidate scoring + Forbidden section heading guard
   ├── HeadlineRoleResolver: Real job titles from verbatim professional headline
   ├── SectorResolver: Derived strictly from headline, work experience, and company domain
   ├── ExperienceResolver: Consolidated employment blocks (anti-fragmentation)
   ├── EducationResolver: Isolated degree and school entries
   ├── SkillResolver: Dedicated section prioritization + proficiency suffix normalization
   └── ReferenceResolver: Strict non-contamination guard

5. TAXONOMY NORMALIZATION (cv-taxonomy-mapper.ts)
   ├── Canonical mapping of proven entities (Normalization ONLY, NO invention)
   └── Unresolved preservation for low-confidence entities

6. ZERO-HALLUCINATION FIREWALL & AI GATING (cv-cross-validator.ts, cv-ai-gate.ts)
   ├── Gated minimal AI call (0 calls for structured CVs, max 1 for semantic gaps)
   └── AI output validation against original source evidence

7. CANONICAL PROFILE DRAFT (cv-profile-builder.ts)
   ├── Safe typing, deduplication, and quality scoring
   └── Generation of unique analysisId

8. FORM HYDRATION & CLIENT STATE (cv-form-hydrator.ts)
   ├── Pure mapping to listing form customFields
   ├── User override preservation
   └── Race condition protection (latest analysis wins)
```

---

## 3. Resolver Decision Matrix

| Field | Primary Source | Secondary Source | Fallback | Forbidden Sources |
|---|---|---|---|---|
| **fullName** | Header / Document Top | Contact / Identity block | Grounded AI (if ambiguous) | Section headings (e.g. `"EĞİTİM"`), Companies, Universities |
| **primarySector** | Professional Headline | Current / Past Experiences | Company Domain | Education degrees (e.g. `"Kamu Yönetimi"`), References, Generic words |
| **desiredRole** | Professional Headline | Latest Job Title | Career Summary | Taxonomy default child node (e.g. `"Uzman"`), Non-evidence keywords |
| **experiences** | Work Experience Section | Chronological Date Blocks | Grounded AI | Bullets, responsibilities, projects fragmented into separate jobs |
| **skills** | Explicit Skills / Beceriler | Competency Blocks | Experience inference | Generic word-frequency dictionary dump across the entire CV |
| **education** | Education Section | Degree Keywords | Grounded AI | Work experience section, Reference section |
| **languages** | Languages Section | Inline Language Badges | None | Technical skill lists |
| **references** | References Section | None | None | Candidate personal contact or employment history |

---

## 4. Key Rules & Invariants

1. **Non-Contamination Invariant:**
   - `EducationResolver` never sets `primarySector`.
   - `ReferenceResolver` never sets candidate `phone` or `fullName`.
   - `SkillsResolver` never creates fake `experiences`.
2. **Skill Normalization Invariant:**
   - Suffixes such as `- Uzman`, `- İleri Düzey`, `- Orta`, `- Başlangıç` are stripped from skill names and stored as proficiency metadata.
   - When a dedicated skills section exists, general word-frequency scraping is disabled.
3. **Experience Consolidation Invariant:**
   - A single job position with multiple bullet points is consolidated into a single `CareerExperience` record with full responsibilities.
4. **Session & Race Condition Invariant:**
   - Every CV analysis carries an `analysisId`. Responses from outdated requests or stale storage cannot overwrite newer uploads or manual user edits.

---

## 5. Testing & Quality Assurance

- **Unit & Property Tests:** Covered in `features/candidates/cv/cv-extraction-engine-4.0-adversarial.test.ts`.
- **Golden Regression Suite:** Regression against real and synthetic multi-column, table, and adversarial layouts (`cv-unstructured-corpus-100.test.ts`, `cv-comprehensive-audit.test.ts`, `cv-real-world-ugur-zaman.test.ts`).
- **Endpoint Integration:** Verified in `features/candidates/cv/cv-analyze-server-endpoint.test.ts`.
