# GİRİŞİMBEE — DATABASE & SUPABASE MIGRATION AUDIT REPORT

**Tarih:** 2026-08-23  
**Sürüm:** Engine 13.0  
**Kapsam:** Veritabanı şeması, migration dosyaları, RLS politikaları ve indeksleme optimizasyonu  

---

## 1. VERİTABANI TABLOLARI VE ŞEMA ENTEGRASYONU

| Tablo Adı | Eklenen / Denetlenen Kolonlar | Rol / Amaç | RLS Durumu |
| :--- | :--- | :--- | :--- |
| `public.candidate_profiles` | `provenance_data`, `intent_projections`, `active_intent_mode`, `last_confirmed_at` | Master Career Profile verisi | Aktif (Owner-Only) |
| `public.marketplace_applications` | `application_overrides`, `match_score`, `match_breakdown`, `anonymous_snapshot` | Başvuru snapshot'ı ve ilana özel geçersiz kılmalar | Aktif (Applicant & Employer) |
| `public.cv_extractions` | `raw_text_hash`, `quality_score`, `evidence_graph`, `extraction_payload` | Adli çıkarım ve kalite skoru geçmişi | Aktif (Owner-Only) |
| `public.marketplace_listings` | `customFields` JSONB | İlan gereksinimleri (rol, sektör, beceriler) | Aktif (Public read, Owner edit) |

---

## 2. İNDEKSLEME VE SORGULAMA PERFORMANSI
- `cv_extractions_profile_id_idx` ve `cv_extractions_raw_text_hash_idx` ile $O(1)$ önbellek erişimi.
- N+1 sorgusu engellenmiş, ilişkisel veriler tekil JSONB snapshot yapısıyla hızlandırılmıştır.
