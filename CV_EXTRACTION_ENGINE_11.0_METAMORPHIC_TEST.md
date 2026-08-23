# GİRİŞİMBEE — CV EXTRACTION ENGINE 11.0
## METAMORPHIC & INVARIANT TESTING REPORT

---

### 1. Metamorphic Testing Concept

Metamorphic testing validates that semantics-preserving surface modifications to a document produce **identical canonical extractions** (Positive Metamorphic Invariance), while adversarial injections into unrelated sections produce **zero cross-contamination** in target fields (Negative Metamorphic Invariance).

---

### 2. Positive Metamorphic Invariant Suite

| Metamorphic Transformation | Original Input | Mutated Input | Canonical Equivalence Result |
| :--- | :--- | :--- | :--- |
| **M1: Header Typography & Spacing** | `İŞ DENEYİMİ` | `İ S   D E N E Y İ M İ` | **PASS (100% Identical Output)** |
| **M2: Delimiter Mutation** | Pipe `\|` delimiters | Bullet `•` & En-dash `–` | **PASS (100% Identical Output)** |
| **M3: Emoji / Icon Decorators** | `Selim Çetin` | `👤 Selim Çetin` `📍 İstanbul` | **PASS (100% Identical Output)** |
| **M4: Table Border ASCII Art** | Plain text layout | `+---+---+---+` ASCII box | **PASS (100% Identical Output)** |
| **M5: Section Reordering** | Experience before Education | Education before Experience | **PASS (100% Identical Output)** |

---

### 3. Negative Metamorphic Invariant Suite (Firewall Verification)

| Adversarial Perturbation | Injected Content | Targeted Field | Engine 11.0 Invariant Behavior | Status |
| :--- | :--- | :--- | :--- | :--- |
| **N1: Degree Sector Contamination** | Add *"Kamu Yönetimi"* to software engineer education | `primarySector` | `primarySector` remains strictly `"Bilişim / Yazılım"`. Zero municipal leakage. | **PASS** |
| **N2: Skill Title Promotion** | Add *"React - Uzman"* to skill list | `desiredRole` | `desiredRole` remains `"Yazılım Mühendisi"`. Generic `"Uzman"` is rejected. | **PASS** |
| **N3: Reference Person Leakage** | Add *"Prof. Dr. Ahmet Yılmaz (Genel Müdür)"* to references | `fullName` & `desiredRole` | Candidate name remains `"Selim Çetin"`; role does not become `"Genel Müdür"`. | **PASS** |
| **N4: Company Address Overwrite** | Add *"İstanbul Bilişim A.Ş. (İstanbul / Maslak)"* to job | `residenceCity` | Candidate residence remains `"Ankara"` / `"Çankaya"`. | **PASS** |

---

### 4. Metamorphic Audit Conclusion

The metamorphic test suite proves that Engine 11.0 is invariant to layout noise, typography, and visual delimiters, while maintaining an impenetrable firewall against cross-section data contamination.
