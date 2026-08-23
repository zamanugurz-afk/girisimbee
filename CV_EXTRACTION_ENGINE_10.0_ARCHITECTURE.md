# GİRİŞİMBEE — CV EXTRACTION ENGINE 10.0: ARCHITECTURAL SPECIFICATION

```
========================================================================================
           GİRİŞİMBEE MULTI-TIER RECURSIVE EVIDENCE EXTRACTION PIPELINE 10.0
========================================================================================
[1. BINARY INGESTION]  --> PDF / DOCX / RTF / TXT / Images via Spatial Layout Engine
        |
[2. MOJIBAKE REPAIR]   --> OCR Spacing, Latin-5, UTF-8, XML Entity Normalizer
        |
[3. EVIDENCE GRAPH DAG]--> Entity Provenance Nodes (Candidate Name, Role, Sector, Exp, Edu)
        |
[4. 16-RULE FIREWALL]  --> Cross-Contamination Mathematical Boundary Isolation
        |
[5. CANONICAL TAXONOMY]--> Turkish Career Ontology (Sectors, Roles, Levels, Districts)
        |
[6. CONTRADICTION ENG] --> Discrepancy & Multi-Candidate Probabilistic Scoring
        |
[7. ZERO DATA LOSS]    --> Token Tracking & Diacritic Preservation Verification Gate
        |
[8. DRAFT HYDRATOR]    --> Reactive Client DOM State Merging & Form Hydration
========================================================================================
```

---

## 1. Pipeline Architecture Overview

The Girişimbee CV Extraction Engine 10.0 is architected as an 8-stage directed acyclic pipeline that decouples raw text signal recovery from high-level semantic reasoning:

1. **Spatial Text Recovery (`cv-text-extractor.ts` & `cv-document-model.ts`):**
   - Ingests binary buffers across PDF, DOCX, RTF, TXT, and images.
   - Computes 2D bounding boxes and column streams, identifying multi-column boundaries, sidebars, and ASCII tables.
2. **Universal Normalization (`cv-turkish-encoding.ts` & `cv-universal-normalizer.ts`):**
   - Corrects Turkish mojibake (`Ã§`, `Ä°`, `ÅŸ`, `Ã¼`, `Ã¶`, `ÄŸ`), HTML/XML entities (`&amp;`, `&#x20;`), and OCR spaced character artifacts (`👤 M ü n i r   Ö z k u l` $\to$ `👤 Münir Özkul`).
3. **Evidence Graph & Provenance DAG (`cv-evidence-graph.ts`):**
   - Every candidate attribute is bound to an `EvidenceNode` containing its source section, confidence score, and raw document line snippet.
4. **Cross-Contamination Firewall Matrix (`enforceEvidenceGraphFirewall`):**
   - Applies 16 mathematical firewall rules that prevent cross-field data leaks across 30 source sections and 30 target fields.
5. **Deterministic Canonical Taxonomy Mapping (`cv-taxonomy-mapper.ts`):**
   - Maps raw company, title, education, and skill strings into Girişimbee's standardized career ontology (`JOB_SECTOR_OPTIONS`, `allPositions`, `TURKISH_CITIES`).
6. **Contradiction Engine (`cv-contradiction-engine.ts`):**
   - Evaluates inter-field coherence, detecting cross-domain inconsistencies (e.g. software engineer with legal sector assignment) and ranking viable alternative interpretations.
7. **Zero Data Loss Guard (`cv-data-loss-guard.ts`):**
   - Asserts 100% token coverage on vital candidate attributes and validates diacritic integrity.
8. **Client Form Hydrator (`cv-form-hydrator.ts`):**
   - Bridges the server-side extraction draft with the React/DOM form state, executing non-destructive state merges.

---

## 2. 16 Invariant Firewall Rules

1. **Education $\to$ Sector Isolation:** Degrees (e.g. *Kamu Yönetimi*, *İktisat*) cannot dictate primary employment sector.
2. **Skill Suffix $\to$ Role Isolation:** Suffix modifiers (e.g. `- Uzman`, `- Müdür`, `- Junior`) cannot set candidate primary role.
3. **Company Suffix $\to$ Role Isolation:** Corporate identifiers (e.g. *Mühendislik Ltd.*, *Danışmanlık A.Ş.*) cannot set candidate role.
4. **Referee $\to$ Identity Isolation:** Reference persons and their contact details are strictly decoupled from candidate identity.
5. **Language $\to$ Sector/Role Isolation:** Language proficiency entries cannot be categorized as primary sector or role.
6. **Driving License $\to$ Role Isolation:** License codes (*B, A2, E*) cannot override professional title.
7. **Certification $\to$ Sector Isolation:** Professional certifications (*PMP, AWS, CISSP*) are isolated from career sector.
8. **Hobbies $\to$ Professional Skills Isolation:** Non-professional interests (*Yüzme, Satranç*) are excluded from technical skill vectors.
9. **Publication $\to$ Employment Experience Isolation:** Research papers and academic theses cannot create fictitious employment records.
10. **Entity Location $\to$ Residence Isolation:** Corporate branch locations cannot overwrite candidate residence city.
11. **Section Header $\to$ Full Name Isolation:** Section headers (*Eğitim*, *Kişisel Bilgiler*) cannot become candidate full name.
12. **Missing Location Isolation:** Absence of location cannot result in default city assignment (*İstanbul*).
13. **Military Status $\to$ Role Isolation:** Service details (*Muaf, Yapıldı*) cannot contaminate role attributes.
14. **Marital Status $\to$ Role Isolation:** Personal status details are isolated from candidate career fields.
15. **Coursework $\to$ Degree Level Isolation:** Short courses or bootcamps cannot elevate formal academic degree level.
16. **Document Noise $\to$ Profile Isolation:** Page headers, footers, and pagination watermarks are pruned from profile drafts.
