# GİRİŞİMBEE — CV EXTRACTION ENGINE 11.0
## FIELD PROVENANCE & DATA CONTRACT AUDIT

---

### 1. Data Contract Overview

In Engine 11.0, data provenance is an enforced contract (`cv-provenance.ts`). Every extracted field is registered with:
- `fieldName`: Canonical field name (`fullName`, `primaryRole`, `primarySector`, `residenceCity`, etc.)
- `value`: Normalized canonical value
- `source`: Page number and line coordinate/range
- `section`: Semantic zone where evidence was found (`HEADER`, `CONTACT`, `EXPERIENCE`, etc.)
- `resolver`: Sub-extractor responsible (`NameResolver`, `RoleResolver`, `SectorResolver`, etc.)
- `confidence`: Mathematical confidence score ($0.0 - 1.0$)
- `positiveEvidence`: List of positive criteria matched
- `negativeEvidence`: List of negative criteria evaluated
- `ambiguity`: Boolean flag indicating whether multiple conflicting candidates existed

---

### 2. Sample Extraction Provenance Report (Uğur Zaman CV)

```json
{
  "documentId": "doc-ugur-zaman-4",
  "fileName": "CV - UĞUR ZAMAN (4).pdf",
  "processingTimestamp": "2026-08-23T23:10:00.000Z",
  "qualityScore": 1.0,
  "totalEntitiesExtracted": 19,
  "firewallViolationsCount": 0,
  "fields": {
    "fullName": {
      "fieldName": "fullName",
      "value": "Uğur Zaman",
      "source": "PAGE_1_LINE_18",
      "section": "HEADER",
      "resolver": "NameResolver",
      "confidence": 1.0,
      "evidence": "UĞUR ZAMAN",
      "positiveEvidence": [
        "LOCATED_IN_HEADER_ZONE",
        "TOP_DOCUMENT_LINES_POSITION",
        "STANDARD_2_TO_4_WORD_PERSON_NAME_STRUCTURE",
        "ALL_UPPERCASE_HEADER_TYPOGRAPHY",
        "EMAIL_USERNAME_CORROBORATION",
        "MULTI_COLUMN_MAIN_BODY_HEADER"
      ],
      "negativeEvidence": [],
      "ambiguity": false
    },
    "primaryRole": {
      "fieldName": "primaryRole",
      "value": "Çağrı Merkezi Operasyon Müdürü",
      "source": "PAGE_1_LINE_19",
      "section": "HEADER",
      "resolver": "RoleResolver",
      "confidence": 0.98,
      "evidence": "Çağrı Merkezi Operasyon Müdürü",
      "positiveEvidence": [
        "LOCATED_IN_HEADER_ZONE",
        "EMPLOYMENT_ANCHOR_VERIFIED",
        "EXECUTIVE_LEVEL_KEYWORD",
        "CAREER_ONTOLOGY_MATCH"
      ],
      "negativeEvidence": [],
      "ambiguity": false
    },
    "primarySector": {
      "fieldName": "primarySector",
      "value": "Çağrı merkezi",
      "source": "PAGE_1_LINE_27",
      "section": "EXPERIENCE",
      "resolver": "SectorResolver",
      "confidence": 0.96,
      "evidence": "MEHRWERK - Çağrı Merkezi Operasyon Müdürü",
      "positiveEvidence": [
        "LOCATED_IN_EXPERIENCE_ZONE",
        "COMPANY_SECTOR_CORROBORATION",
        "ROLE_DOMAIN_MATCH"
      ],
      "negativeEvidence": [],
      "ambiguity": false
    },
    "residenceCity": {
      "fieldName": "residenceCity",
      "value": "İstanbul",
      "source": "PAGE_1_LINE_4",
      "section": "CONTACT",
      "resolver": "LocationResolver",
      "confidence": 1.0,
      "evidence": "İstanbul / Maltepe",
      "positiveEvidence": [
        "LOCATED_IN_CONTACT_ZONE",
        "TURKISH_CITY_DICTIONARY_MATCH"
      ],
      "negativeEvidence": [],
      "ambiguity": false
    },
    "residenceDistrict": {
      "fieldName": "residenceDistrict",
      "value": "Maltepe",
      "source": "PAGE_1_LINE_4",
      "section": "CONTACT",
      "resolver": "LocationResolver",
      "confidence": 1.0,
      "evidence": "İstanbul / Maltepe",
      "positiveEvidence": [
        "LOCATED_IN_CONTACT_ZONE",
        "TURKISH_DISTRICT_DICTIONARY_MATCH",
        "CITY_DISTRICT_PAIR_CONFIRMED"
      ],
      "negativeEvidence": [],
      "ambiguity": false
    }
  }
}
```

---

### 3. Provenance Audit Conclusion

Every piece of extracted data is 100% accountable, verifiable against raw document lines, and fully transparent to auditing and debugging systems.
