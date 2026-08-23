# GİRİŞİMBEE — CV EXTRACTION ENGINE 13.0 NAME, ROLE & SECTOR AUDIT REPORT

**Tarih:** 2026-08-23  
**Sürüm:** Engine 13.0  
**Test Paketi:** `cv-engine-13.0-name-role-sector.test.ts` (13 Test)  
**Sonuç:** PASS (%100 Başarı)  

---

## 1. ALAN BAZLI DOĞRULUK VE ADVERSARIAL TEST TABLOSU

| Test Alanı | Test Edilen Senaryo | Beklenen Güvenlik Davranışı | Gerçekleşen Sonuç | Durum |
| :--- | :--- | :--- | :--- | :--- |
| **Name** | Referanslar bölümü en başta yer alan CV | Referans kişisi (`Ahmet Yılmaz`) atlanır, gerçek aday (`Gizem Aksoy`) seçilir | Gizem Aksoy | PASS |
| **Name** | Harf arası boşluklu OCR formatı (`T A R I K   B I L G I N`) | Harfler birleştirilir ve doğru Türkçe büyük/küçük harfe çevrilir | Tarık Bilgin | PASS |
| **Name** | Başında ikon/emoji olan isim (`👤 UĞUR ZAMAN`) | Emoji soyulur, aday adı saf metin olarak elde edilir | Uğur Zaman | PASS |
| **Name** | Boru ayracı ile unvan birleşik isim (`Murat Çelik \| Yazılım Mimarı`) | Ayracın sol tarafı isim, sağ tarafı unvan olarak ayrıştırılır | Murat Çelik | PASS |
| **Name** | İsimsiz / Headless CV | Halüsinasyon yapılmaz, boş döner | `""` (NOT_FOUND) | PASS |
| **Role** | Taksonomide olmayan niş unvan (`Agile Release Train Engineer`) | `desiredRoleOther` ile serbest metin korunur | Korundu | PASS |
| **Role** | Deneyimsiz/unvansız biyoloji mezunu CV | Asla `Uzman` veya `Yönetici` varsayılanı atanmaz | `""` (NOT_FOUND) | PASS |
| **Sector** | `Kamu Yönetimi` lisans diploması | `Kamu / Belediye` sektörü üretilmez; adayın çalıştığı teknoloji şirketi sektörü belirler | Bilişim / Yazılım | PASS |
| **Sector** | `Turizm İşletmeciliği` lisans diploması | `Turizm / Otelcilik` sektörü üretilmez | Bilişim / Yazılım | PASS |
| **Sector** | `Sağlık Yönetimi` lisans diploması | `Sağlık` sektörü üretilmez | Bilişim / Yazılım | PASS |

---

## 2. METRİKLER

- **Name Precision:** %100
- **Role Precision:** %100
- **Sector Precision:** %100
