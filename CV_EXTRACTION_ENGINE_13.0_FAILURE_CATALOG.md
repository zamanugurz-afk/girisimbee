# GİRİŞİMBEE — CV EXTRACTION ENGINE 13.0 FAILURE CATALOG & RESOLUTION MATRIX

**Tarih:** 2026-08-23  
**Sürüm:** Engine 13.0  
**Kapsam:** Kontrollü çözümlenemeyen durumlar (Controlled Unresolved States) ve sıfır-tahmin hata yönetimi  

---

## 1. KONTROLLÜ ÇÖZÜMLENEMEYEN DURUMLAR (CONTROLLED UNRESOLVED STATES)

| Hata Kodu | Hata / Belirsizlik Tanımı | Motorun Güvenli Davranışı | Varsayılan Üretimi? | Durum |
| :--- | :--- | :--- | :--- | :--- |
| **ERR-NAME-HEADLESS** | CV metninde ad-soyad bulunmaması (yalnızca iletişim/deneyim listesi). | `fullName = ""` ve `fieldResolutionStatus = NOT_FOUND`. | ASLA | ÇÖZÜLDÜ |
| **ERR-ROLE-NICHE** | Taksonomide bulunmayan niş unvan (`Agile Release Train Engineer`). | `desiredRole = 'Diğer'`, `desiredRoleOther = 'Agile Release Train Engineer'`. | ASLA (Uydurma yok) | ÇÖZÜLDÜ |
| **ERR-SECTOR-ISOLATED** | Yalnızca eğitim diplomasında sektör kelimesi geçmesi (`Kamu Yönetimi`). | Sektör atanmaz (`""` / `NOT_FOUND`). Deneyimdeki şirket sektörü aranır. | ASLA | ÇÖZÜLDÜ |
| **ERR-SKILL-NO-ZONE** | Beceriler bölümü olmayan CV'de düz metin geçişi. | Yalnızca doğrulanmış teknik araçlar (`Python`, `Docker`) alınır, jenerik kelimeler elenir. | ASLA | ÇÖZÜLDÜ |
| **ERR-LOC-NO-RESIDENCE** | CV'de açık ikamet adresi bulunmaması (yalnızca eski şirket adresi). | `residenceCity = ""` ve `residenceDistrict = ""`. | ASLA (`İstanbul` yok) | ÇÖZÜLDÜ |
| **ERR-DATE-NO-ANCHOR** | Tarihsiz ve unvansız rastgele sorumluluk maddeleri. | Yeni deneyim kaydı açılmaz; mevcut deneyimin maddesi olarak kalır. | ASLA | ÇÖZÜLDÜ |

---

## 2. KALİTE İLKESİ
Motorun bilmediği veya kanıtlayamadığı bir alanda "boş bırakması" bir hata değil, veri bütünlüğünü koruyan bilinçli bir güvenlik mekanizmasıdır.
