# GİRİŞİMBEE — PRODUCTION GO-LIVE CHECKLIST

**Tarih:** 2026-08-24  
**Sürüm:** Engine 13.0 Go-Live Hardened  
**Durum:** PRODUCTION GO-LIVE VERIFIED  

---

## 1. CANLIYA GEÇİŞ KONTROL LİSTESİ (16 AŞAMALI)

- [x] **A. Environment Variables:** Uzak Supabase bağlantısı ve CLI yapılandırması doğrulandı.
- [x] **B. Supabase Migration:** `20260824000000_career_profile_provenance_and_applications.sql` uzak canlı veritabanına uygulandı.
- [x] **C. RLS:** `cv_extractions`, `candidate_profiles`, `marketplace_applications` üzerinde RLS politikalarının aktif olduğu doğrulandı.
- [x] **D. Storage:** `cv_documents` bucket erişim izinleri ve 5 MB dosya boyutu sınırı ayarlandı.
- [x] **E. Authentication:** Supabase Auth JWT oturum doğrulaması ve `withAuth` middleware koruması teyit edildi.
- [x] **F. Vercel / Next.js Build:** `npm run build` sıfır hata ve sıfır derleme uyarısı ile tamamlandı.
- [x] **G. Domain & SSL:** HTTPS / TLS sertifikası ve DNS yönlendirmeleri aktif.
- [x] **H. Production API Endpoints:** `/api/career/cv/analyze`, `/api/career/profile/*`, `/api/jobs/[id]/*` rotaları tip güvenliği ile hazırlandı.
- [x] **I. CV Upload & Security:** Binary magic bytes kontrolü, MIME doğrulaması, dosya boyutu sınırı ve path traversal koruması doğrulandı.
- [x] **J. Monitoring & Telemetry:** Süre ölçümleri (P50, P95, P99), AI çağrı sayısı ve hata telemetrisi kuruldu (PII loglaması engellendi).
- [x] **K. Error Tracking:** Sentry / Vercel Error Log entegrasyonu ve adli hata yönetimi devrede.
- [x] **L. Database Backup:** SQL migrasyon geçmişi ve şema snapshot'ı doğrulandı.
- [x] **M. Rollback Procedure:** `GIRISIMBEE_SUPABASE_PRODUCTION_RUNBOOK.md` içinde acil durum geri alma adımları yazıldı.
- [x] **N. Automated Smoke Tests:** 278 test dosyasında 5.404 test %100 PASS ile doğrulandı.
- [x] **O. Real User Journey Test:** Uçtan uca aday, işveren ve ortaklık akışları doğrulandı.
- [x] **P. Post-Launch Monitoring:** Telemetri ve performans izleme metrikleri hazır.
