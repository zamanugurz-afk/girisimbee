# GİRİŞİMBEE — EVIDENCE & PROVENANCE MODEL REPORT

**Tarih:** 2026-08-23  
**Sürüm:** Engine 13.0  
**Kapsam:** Alan bazlı köken takibi, DAG grafı ve 4 kaynak türü (`CV`, `USER`, `NORMALIZED`, `TAXONOMY`)  

---

## 1. DÖRT SEVİYELİ PROVENANCE KAYNAK TAKİBİ

```typescript
export type FieldProvenanceSource = 'CV' | 'USER' | 'NORMALIZED' | 'TAXONOMY';

export interface ProvenanceField<T> {
  value: T;
  originalEvidenceValue?: T;
  source: FieldProvenanceSource;
  confidence: number;
  evidenceSnippet?: string;
  evidenceId?: string;
  editedAt?: string;
  isConfirmed: boolean;
  status: 'RESOLVED' | 'AMBIGUOUS' | 'NOT_FOUND' | 'CONFLICT';
}
```

---

## 2. KÖKEN VE DEĞİŞİKLİK YÖNETİMİ

- **CV'den Gelen Alan:** `source = 'CV'`, `isConfirmed = false` (kullanıcı onayı beklenir).
- **Kullanıcının Düzenlediği Alan:** `source = 'USER'`, `isConfirmed = true`, `originalEvidenceValue` korunur.
- **Sistem Normalizasyonu:** `source = 'NORMALIZED'` (ör. telefon, tarih formatlamaları).
- **Taksonomi Eşleşmesi:** `source = 'TAXONOMY'` (ör. 500+ standart rol eşleşmesi).
