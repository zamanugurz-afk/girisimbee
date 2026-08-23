# GİRİŞİMBEE — SUPABASE PRODUCTION RUNBOOK & DEPLOYMENT MANUAL

**Tarih:** 2026-08-24  
**Sürüm:** Engine 13.0 Hardened  
**Kapsam:** Veritabanı Migrasyonu, RLS Doğrulaması, Smoke Testleri, Geri Alma (Rollback) ve Acil Kurtarma Prosedürü  

---

## 1. PRE-FLIGHT CHECKS (ÖN UÇUŞ KONTROLLERİ)

Canlı veritabanına herhangi bir migrasyon uygulamadan önce aşağıdaki kontroller zorunludur:

1. **Uzak Bağlantı Durumu:** Canlı Supabase URL ve Service Role Key erişiminin doğrulanması.
2. **Kilitli Tablo Kontrolü:** `candidate_profiles` ve `marketplace_applications` üzerinde bekleyen uzun süreli kilitlerin (`pg_locks`) bulunmadığının teyidi.
3. **Mevcut Veri Bütünlüğü:** Mevcut `marketplace_profiles` ve `marketplace_applications` kayıt sayısının kaydedilmesi.

---

## 2. ENVIRONMENT VARIABLES (ORTAM DEĞİŞKENLERİ)

Canlı üretim ortamında (Vercel / Supabase) şu değişkenlerin tanımlı olması gerekmektedir:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

---

## 3. BACKUP / ROLLBACK PLAN (YEDEKLEME PLANI)

Migrasyondan hemen önce canlı veritabanının anlık yedeği (snapshot) alınmalıdır:

```bash
# Supabase CLI ile anlık dump alma
supabase db dump --db-url "$DATABASE_URL" -f "backup_pre_migration_20260824.sql"
```

---

## 4. MIGRATION COMMAND (MİGRASYON ÇALIŞTIRMA)

Migrasyon dosyasını canlı kümeye uygulama adımları:

```bash
# Yöntem A: Supabase CLI üzerinden
supabase db push

# Yöntem B: Supabase Dashboard SQL Editor üzerinden
# supabase/migrations/20260824000000_career_profile_provenance_and_applications.sql içeriğini yapıştırıp çalıştırın.
```

---

## 5. SCHEMA VERIFICATION (ŞEMA DOĞRULAMASI)

Migrasyon sonrası yeni kolon ve tabloların varlığını doğrulayan SQL sorgusu:

```sql
-- 1. candidate_profiles kolon kontrolü
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'candidate_profiles' 
  AND column_name IN ('provenance_data', 'intent_projections', 'active_intent_mode', 'cv_document_id', 'last_confirmed_at');

-- 2. cv_extractions tablosunun varlığı
SELECT table_name FROM information_schema.tables WHERE table_name = 'cv_extractions';
```

---

## 6. RLS VERIFICATION (GÜVENLİK POLİTİKALARI KONTROLÜ)

Kullanıcı izolasyonunu doğrulayan RLS sorgusu:

```sql
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'cv_extractions';
```

Beklenen çıktı: `cv_extractions_owner_select`, `cv_extractions_owner_insert`, `cv_extractions_owner_update`, `cv_extractions_owner_delete` politikaları listelenmelidir.

---

## 7. SMOKE TESTS (CANLI DUMAN TESTLERİ)

1. Bir test kullanıcısı ile oturum açıp CV yükleyin (`POST /api/career/cv/analyze`).
2. Çıkarılan profili onaylayın (`POST /api/career/profile/confirm`).
3. Örnek bir ilana başvuru taslağı oluşturun (`POST /api/jobs/:id/application/draft`).
4. Başvuruyu gönderin (`POST /api/jobs/:id/application/submit`).

---

## 8. POST-DEPLOYMENT VERIFICATION (DAĞITIM SONRASI İZLEME)

- İlk 10 dakikada API 500 hata oranının %0 olduğu Vercel / Supabase Logs üzerinden teyit edilir.
- P95 API yanıt süresinin < 200 ms olduğu kontrol edilir.

---

## 9. ROLLBACK PROCEDURE (GERİ ALMA PROSEDÜRÜ)

Herhangi bir beklenmeyen hatada çalıştırılacak geri alma (rollback) SQL betiği:

```sql
-- Geri alma adımları
DROP TABLE IF EXISTS public.cv_extractions CASCADE;

ALTER TABLE public.candidate_profiles
  DROP COLUMN IF EXISTS provenance_data,
  DROP COLUMN IF EXISTS intent_projections,
  DROP COLUMN IF EXISTS active_intent_mode,
  DROP COLUMN IF EXISTS cv_document_id,
  DROP COLUMN IF EXISTS cv_analysis_version,
  DROP COLUMN IF EXISTS last_confirmed_at;

ALTER TABLE public.marketplace_applications
  DROP COLUMN IF EXISTS application_overrides,
  DROP COLUMN IF EXISTS match_score,
  DROP COLUMN IF EXISTS match_breakdown;
```

---

## 10. EMERGENCY RECOVERY (ACİL DURUM KURTARMA)

Kritik veritabanı kilitlenmesi durumunda:
1. `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction';`
2. Gerekirse en son alınan snapshot yedeğine geri dönülür (`supabase db reset` veya Supabase Point-in-Time Recovery).
