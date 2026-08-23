# GİRİŞİMBEE — CV EXTRACTION ENGINE 13.0 END-TO-END PIPELINE MAP

**Tarih:** 2026-08-23  
**Sürüm:** Engine 13.0  
**Amaç:** Girişimbee CV Çıkarım Motorunun tüm veri akışını, bileşenlerini, bağımlılıklarını ve güvenlik izolasyon sınırlarını eksiksiz haritalamak.

---

## 1. END-TO-END PIPELINE AKIŞ DİYAGRAMI

```
[INPUT: Buffer / File / MIME]
             ↓
[1. File Validation] (MIME & Magic Bytes)
             ↓
[2. Binary Parsing] (PDF / DOCX / TXT)
             ↓
[3. Text Extraction] (Spatial & Text Extraction)
             ↓
[4. Encoding Repair] (Mojibake, UTF-8 Normalization, Control Chars)
             ↓
[5. Spatial Layout Reconstruction] (Multi-column, Sidebar, 2D Coords)
             ↓
[6. Document Zoning] (14 Semantic Zones: HEADER, CONTACT, SUMMARY, EXP, EDU, SKILLS...)
             ↓
[7. Candidate Generation] (N-gram & Token Identification)
             ↓
[8. Entity Resolvers]
  ├── Name Resolver        (HEADER, CONTACT zones; Morphology & Verbal Noun Disqualifier)
  ├── Contact Resolver     (Email, Phone, LinkedIn, Website, Address)
  ├── Experience Resolver  (Company + Role + Date 3-Point Anchoring)
  ├── Education Resolver   (University + Degree + Department + Date)
  ├── Skill Resolver       (Strict Zone Evidence; Precision > Recall)
  ├── Language Resolver    (LANGUAGES, CERTIFICATIONS zones)
  ├── Sector Resolver      (SUMMARY, EXPERIENCE zones only; Strict Isolation)
  ├── Role Resolver        (HEADER, SUMMARY, EXPERIENCE zones only)
  └── Location Resolver    (Residence Location only; No Company/Edu bleed)
             ↓
[9. Evidence Graph & DAG Validation] (Node Provenance & Isolation Firewalls)
             ↓
[10. Contradiction Engine] (Cross-Field Conflict & Chronological Sanity)
             ↓
[11. Canonical Taxonomy Mapper] (Ontology Normalization & Role/Sector Mapping)
             ↓
[12. Profile Draft Builder] (CvProfileDraftResult Assembly)
             ↓
[13. AI Boundary & Gating] (Deterministic Priority; $0.00 / 0-token Budget)
             ↓
[14. CV Service Orchestration] (Central Pipeline & Quality Score Calculator)
             ↓
[15. API Layer] (POST /api/career/cv/analyze)
             ↓
[16. React State Hydration] (cv-form-hydrator.ts)
             ↓
[17. Merged customFields] (State preservation & Diğer fallback)
             ↓
[18. DynamicField Schema] (Client-side form field component)
             ↓
[19. DOM Render] (Validated final UI state)
```

---

## 2. ADIM BAZLI DETAYLI MİMARİ MATRİSİ

| No | Pipeline Aşaması | Girdi (Input) | Çıktı (Output) | Kullanılan Helper / Modül | Regex / Dictionaries | İzolasyon & Güvenlik Kuralı | Fallback / Default |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **File Validation** | `Buffer`, `fileName`, `mimeType` | Doğrulanmış `Buffer` ve dosya türü | `cv-text-extractor.ts` | PDF/DOCX binary magic numbers | Geçersiz dosya anında reddedilir | `CvExtractionError` |
| **2** | **Binary Parsing** | Binary `Buffer` | Ham karakter akışı ve sayfa haritası | `pdfjs-dist`, `mammoth` | ZIP / PDF stream regexes | Bozuk font / metinsiz PDF tespiti | Hata / Desteklenmeyen Format |
| **3** | **Text Extraction** | Parse edilmiş sayfa akışı | Ham metin ve satır dizisi | `extractCvText` | Satır başı/sonu ayrıştırıcıları | Sayfa numarası ve tekrarlayan footer izolasyonu | Ham metin |
| **4** | **Encoding Repair** | Ham metin | Temizlenmiş UTF-8 NFC metin | `cv-turkish-encoding.ts` | Mojibake eşleme tablosu, control char regex | Bozuk Türkçe karakter (`Ã¼`, `ÅŸ`, vb.) tamiri | Değiştirilmemiş orijinal metin |
| **5** | **Spatial Layout** | Temiz metin satırları | 2D bloklar, sidebar vs gövde | `cv-spatial-layout.ts` | Multi-column separator regex | Sol panel / Sağ panel okuma sırası hizalama | Standart satır sırası |
| **6** | **Document Zoning** | Satır blokları | 14 Semantik Bölge (`CvDocumentZone[]`) | `cv-document-zoning.ts` | `HEADING_RULES` (TR, EN, DE, FR, ES) | Resolvers yalnızca yetkili bölgelere erişebilir | `OTHER` Bölgesi |
| **7** | **Candidate Gen** | Bölge metinleri | Entity aday tokenları | `cv-candidate-generator.ts` | N-gram tokenizers, title-case filters | Jenerik durak kelimeler elenir | Boş liste |
| **8a**| **Name Resolver** | `HEADER`, `CONTACT` bölgeleri | `fullName` + `Evidence` | `cv-name-extractor.ts`, `scoreCandidateName` | `FORBIDDEN_SECTION_WORD_ROOTS`, fiilimsi ekleri | Bölüm başlıkları, unvanlar, şehirler isme sızamaz | `NOT_FOUND` / `""` |
| **8b**| **Contact Resolver**| `HEADER`, `CONTACT` bölgeleri | Telefon, E-posta, Sosyal | `cv-deterministic-extractor.ts` | Email & E.164 Telefon regexleri | Referans iletişim bilgileri adaya sızamaz | `""` |
| **8c**| **Experience Res.**| `EXPERIENCE` bölgesi | `CareerExperience[]` | `cv-relationship-engine.ts` | Tarih aralığı (YYYY-YYYY), Şirket-Rol regexleri | Madde işaretleri (bullet) yeni iş yaratamaz | `[]` |
| **8d**| **Education Res.** | `EDUCATION` bölgesi | `educationList` | `extractDeterministicEducation` | `UNIVERSITY_NAME_MAP`, derece regexleri | Eğitim sektöre veya unvana sızamaz | `[]` |
| **8e**| **Skill Resolver** | `SKILLS` bölgesi (ve kısıtlı EXP) | `professionalSkills`, `tools` | `extractDeterministicSkillsAndTools` | `KNOWN_SKILL_ALIASES`, `KNOWN_TOOLS_DICTIONARY` | Precision > Recall; tam metin keyword dump yasaktır | `[]` |
| **8f**| **Language Res.**  | `LANGUAGES`, `CERTIFICATIONS` | `languages`, `certificates` | `scanUniversalCertificates` | `CAREER_LANGUAGE_OPTIONS` | Yabancı dil unvan veya sektör olamaz | `""` |
| **8g**| **Sector Resolver**| `SUMMARY`, `EXPERIENCE` bölgeleri | `primarySector` | `scoreCandidateSector`, `inferSectorFromRole` | `KNOWN_SECTOR_KEYWORDS`, `JOB_SECTOR_OPTIONS` | `EDUCATION` ve `SKILLS` bölgelerinden sektör türetilemez | `NOT_FOUND` / `""` |
| **8h**| **Role Resolver**  | `HEADER`, `SUMMARY`, `EXPERIENCE` | `desiredRole` | `scoreCandidateRole`, `matchCanonicalPosition` | `ROLE_ALIASES`, `getAllTaxonomyPositions` | `Uzman`, `Müdür` gibi tekil jenerik unvanlar yasaktır | `desiredRoleOther` |
| **8i**| **Location Res.**  | `CONTACT`, `HEADER` bölgeleri | `residenceCity`, `residenceDistrict` | `extractDeterministicLocations` | `TURKISH_CITY_ALIASES`, `COMMON_TURKISH_DISTRICTS` | Asla `"İstanbul"` varsayılanı atanmaz; ikamet şarttır | `""` |
| **9** | **Evidence Graph** | Çıkarılan entity'ler | DAG Kanıt Grafı | `cv-evidence-graph.ts` | İzolasyon güvenlik duvarı kuralları | Kanıtsız entity graf tarafından budanır (pruned) | Doğrulanmış alt küme |
| **10**| **Contradiction**  | Entity ve taksonomi çıktısı | `ContradictionAuditReport` | `cv-contradiction-engine.ts` | Kronolojik ve unvan çelişki kuralları | Çelişkiler silinmez; `AMBIGUOUS` olarak işaretlenir | Çelişki listesi |
| **11**| **Taxonomy Mapper**| Ham extraction payload | `CanonicalTaxonomyMappingResult` | `cv-taxonomy-mapper.ts` | Girişimbee Canonical Ontology | Kanonik eşleşme bulunamazsa serbest metin korunur | Raw string |
| **12**| **Draft Builder**  | Kanonik sonuç nesnesi | `CvProfileDraftResult` | `cv-profile-builder.ts` | Alan eşleme şablonu | Form değerleri ve meta istatistikler paketlenir | Boş taslak |
| **13**| **AI Boundary**    | Ham metin + Belirsiz alanlar | Gated AI Payload (0/1 çağrı) | `cv-ai-gate.ts`, `cv-ai-extractor.ts` | JSON Schema validation | Deterministik öncelik; halüsinasyon anında elenir | Deterministik çıktı |
| **14**| **CV Service**     | İstek nesnesi | `CvProfileDraftResult` | `cv.service.ts` | Multi-factor kalite skorlama | Tüm aşamalar tek pipeline altında koordine edilir | Hata yanıtı |
| **15**| **API Layer**      | HTTP Multipart / JSON | JSON Response | `analyze/route.ts` | Zod schema validation | KVKK / PII maskeleme ve kimlik doğrulama | HTTP 400 / 500 |
| **16**| **React Hydration**| `CvProfileDraftResult` + Form | `HydratedFormResult` | `cv-form-hydrator.ts` | `resolveEnumOption` | Mevcut `customFields` üzerine güvenli birleştirme | Mevcut form durumu |
| **17**| **customFields**   | Form state | Form values objesi | React Hook Form / Custom State | State proxy | Kullanıcı tarafından girilen alanlar silinmez | Güncellenmiş state |
| **18**| **DynamicField**   | Form schema & State | UI Bileşenleri | `DynamicField.tsx` | UI validation rules | Dropdown 'Diğer' seçilince serbest metin kutusu açılır | Render |
| **19**| **DOM Render**     | React component tree | Tarayıcı DOM'u | Next.js / React DOM | HTML5 / Accessibility | UI üzerinde tüm çıkarılan veriler hatasız görüntülenir | HTML DOM |

---

## 3. ENGINE 13.0 KRİTİK İZOLASYON VE GÜVENLİK SINIRLARI

1. **Precision-First Skill Resolver:** Beceriler bölümü (`SKILLS`) açıkça varsa, tüm belgeden rastgele keyword taraması yapılamaz. Yalnızca bağlamı doğrulanmış gerçek yetkinlikler kabul edilir.
2. **References & Education Firewall:** Referans bilgileri adayın adına veya unvanına; eğitim bilgileri adayın sektörüne hiçbir koşulda sızamaz.
3. **Golden Fixture İzolasyonu:** Uğur Zaman CV fikstürü bağımsız bir test fikstürüdür; kuralları, şirketleri ve unvanları genel çıkarım motoruna referans olamaz.
4. **Zero-Defaulting Prensibi:** Belgede kanıtı bulunmayan şehir, ilçe, unvan veya sektör için hiçbir sistem varsayılanı üretilemez; alan `NOT_FOUND` / `""` döner.
