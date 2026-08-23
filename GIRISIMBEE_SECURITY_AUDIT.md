# GİRİŞİMBEE — SECURITY & AUTHORIZATION AUDIT REPORT

**Tarih:** 2026-08-23  
**Sürüm:** Engine 13.0  
**Kapsam:** Kimlik doğrulama, yetkilendirme, RLS politikaları, dosya güvenliği ve KVKK uyumu  

---

## 1. GÜVENLİK KONTROL MATRİSİ

| Güvenlik Kriteri | Denetim Mekanizması | Test Durumu |
| :--- | :--- | :--- |
| **User ID Isolation** | Her kullanıcı yalnızca kendi profilini ve başvurularını görür/düzenler | DOĞRULANDI |
| **Supabase RLS** | `candidate_profiles`, `marketplace_applications`, `cv_extractions` üzerinde RLS devrede | DOĞRULANDI |
| **MIME & Binary Validation** | Yalnızca gerçek PDF, DOCX ve TXT dosyaları işlenir; sahte uzantılar engellenir | DOĞRULANDI |
| **Dosya Boyutu Sınırı** | Maksimum 5 MB sınırı (`MAX_CV_FILE_SIZE_BYTES`) aşan dosyalar 400 ile reddedilir | DOĞRULANDI |
| **Path Traversal Koruması** | Dosya adları sanitize edilir, dosya sistemi yolları sınırlandırılır | DOĞRULANDI |
| **KVKK / PII Koruması** | TC Kimlik No, IBAN ve hassas PII verileri loglara yazılmaz ve maskelenir | DOĞRULANDI |
| **Rate Limiting** | `/api/career/cv/analyze` ve `/api/career/profile/*` rotalarında IP/Kullanıcı sınırlandırması | DOĞRULANDI |
