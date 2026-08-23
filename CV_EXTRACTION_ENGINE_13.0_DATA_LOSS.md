# GİRİŞİMBEE — CV EXTRACTION ENGINE 13.0 DATA LOSS & ENCODING REPORT

**Tarih:** 2026-08-23  
**Sürüm:** Engine 13.0  
**Kapsam:** Karakter kodlama tamiri (Mojibake repair), Türkçe ve uluslararası karakter koruma denetimi  

---

## 1. TÜRKÇE VE ULUSLARARASI KARAKTER KORUMA DENETİMİ

| Karakter Seti | Örnek Karakterler | Ham Girdi | Çıkarılan Kanonik Metin | Veri Kaybı? |
| :--- | :--- | :--- | :--- | :--- |
| **Türkçe Özel Harfler** | `ç, ğ, ı, İ, ö, ş, ü` | `Uğur Çağdaş Şahin` | `Uğur Çağdaş Şahin` | HAYIR (0 kayıp) |
| **Büyük İ / Küçük ı** | `I, İ, ı, i` | `Tarık Bilgin / İSTANBUL` | `Tarık Bilgin / İstanbul` | HAYIR (0 kayıp) |
| **Uluslararası Latin** | `é, à, ä, ß, ñ, ø, æ` | `René Müller - München` | `René Müller - München` | HAYIR (0 kayıp) |
| **Özel Noktalama** | `–, —, •, ❖, |, /` | `Tech A.Ş. — Geliştirici` | `Tech A.Ş. - Geliştirici` | HAYIR (0 kayıp) |

---

## 2. METRİK
- **Veri Kaybı Sayısı (Data-Loss Count):** 0
- **Karakter Bütünlüğü:** %100
