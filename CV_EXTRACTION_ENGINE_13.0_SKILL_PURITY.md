# GİRİŞİMBEE — CV EXTRACTION ENGINE 13.0 SKILL EVIDENCE PURITY REPORT

**Tarih:** 2026-08-23  
**Sürüm:** Engine 13.0  
**Test Paketi:** `cv-engine-13.0-skill-purity.test.ts` (301 Test)  
**Sonuç:** PASS (%100 Başarı)  

---

## 1. 15 SINIFLI FORENSIC BECERİ SINIFLANDIRMA DENETİMİ

| Sınıflandırma Kodu | Sınıf Tanımı | Doğrulama Kuralı | Test Sayısı | Sonuç |
| :--- | :--- | :--- | :--- | :--- |
| **EXPLICIT_SKILL** | Açık Yetkinlik / Beceri | `SKILLS` bölgesi veya `Yetkinlikler:` etiketinden gelen kayıtlar. | 50 | KABUL (PASS) |
| **TECHNICAL_SKILL** | Teknik Yazılım & Platform | Programlama dilleri, framework'ler, veritabanları. | 25 | KABUL (PASS) |
| **TOOL** | Doğrulanmış Araç | `EXPERIENCE` veya `SKILLS` bölgesinde geçen resmi yazılım araçları. | 25 | KABUL (PASS) |
| **CERTIFICATION** | Sertifika / Lisans | `PMP`, `ISO 9001`, `SMMM`, vb. | 10 | SERTİFİKA ALANINA YÖNLENDİRİLDİ |
| **LANGUAGE** | Doğal Konuşma Dili | `İngilizce`, `Almanca`, `Fransızca`, vb. | 30 | DİL ALANINA YÖNLENDİRİLDİ |
| **JOB_RESPONSIBILITY** | Sorumluluk / Görev Cümlesi | Fiilimsi son ekli (`-yapılması`, `-sağlanması`) uzun maddeler. | 40 | REDDEDİLDİ (PASS) |
| **JOB_TITLE_FRAGMENT** | Unvan Kelimeleri | `Müdür`, `Uzman`, `Mühendis`, `Direktör`, `Yönetici`, vb. | 50 | REDDEDİLDİ (PASS) |
| **COMPANY_TERM** | Şirket / Kurum İsmi | `Holding`, `A.Ş.`, `Ltd`, `Banka`, `Fakülte`, firma adları. | 50 | REDDEDİLDİ (PASS) |
| **LOCATION_TERM** | Şehir / İlçe İsmi | `İstanbul`, `Ankara`, `Kadıköy`, `Çankaya`, vb. | 50 | REDDEDİLDİ (PASS) |
| **GENERIC_WORD** | Sıradan Durak Kelimeler | `iş`, `çalışma`, `deneyim`, `bilgi`, `süreç`, `tarih`, vb. | 30 | REDDEDİLDİ (PASS) |

---

## 2. METRİK VE DOĞRULUK

- **Toplam Test Edilen Beceri Adayı:** 360 aday
- **Skill Precision (Hassasiyet):** %100 (Sıfır sızıntı)
- **Keyword Dump Koruması:** Aktif (Tam metin üzerinden rastgele sözlük taraması engellenmiştir).
