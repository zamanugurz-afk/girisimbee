# GİRİŞİMBEE — CV EXTRACTION ENGINE 12.0 FAILURE CATALOG & RESOLUTION MATRIX

**Tarih:** 2026-08-23  
**Sürüm:** Engine 12.0  
**Kapsam:** Çıkarım motorunda karşılaşılabilecek sınır durumlar, olası hata modları ve deterministik çözüm mekanizmaları  

---

## 1. TESPİT EDİLEN SINIR DURUMLAR VE ÇÖZÜM TABLOSU

| Hata / Sınır Durumu Kodu | Açıklama | Risk Seviyesi | Engine 12.0 Deterministik Çözümü | Durum |
| :--- | :--- | :--- | :--- | :--- |
| **FAIL-01: Headless Document** | CV belgesinde ad-soyad bulunmaması (yalnızca deneyim veya eğitim listesi). | Yüksek (Halüsinasyon riski) | `NameResolver` aday puanı $<60$ kalır, isim boş (`""` / `NOT_FOUND`) döner. Şehir veya unvan isme sızamaz. | ÇÖZÜLDÜ |
| **FAIL-02: Verbal Noun Responsibilities** | Sorumluluk cümlelerinin (`-yapılması`, `-sağlanması`, `-yürütülmesi`) unvan sanılması. | Yüksek (Yanlış unvan riski) | Fiilimsi son ekleri ve eylem kökleri `isRoleTitle` ve `scoreCandidateRole` tarafından $-100$ puanla diskalifiye edilir. | ÇÖZÜLDÜ |
| **FAIL-03: Degree vs. Sector Conflict** | Adayın `Kamu Yönetimi` veya `Turizm` okuyup `Yazılım Geliştirici` olarak çalışması. | Orta (Yanlış sektör riski) | `EducationResolver` sektör alanına veri yazamaz; sektör yalnızca `EXPERIENCE` ve `SUMMARY` bölgelerinden türetilir. | ÇÖZÜLDÜ |
| **FAIL-04: Skill Bullet Elevation** | Beceriler bölümünde geçen `Python - Uzman` veya `React - İleri Düzey` satırları. | Orta (Jenerik unvan riski) | `SKILLS` bölgesi `RoleResolver` yetki alanından tamamen çıkarılmıştır. | ÇÖZÜLDÜ |
| **FAIL-05: Reference Infiltration** | Referanslar bölümündeki `Prof. Dr. Ahmet Yılmaz - Genel Müdür` bilgisi. | Yüksek (Kişi/Unvan sızıntısı) | `REFERENCES` bölgesi `NameResolver` ve `RoleResolver` tarafından izole edilmiştir. | ÇÖZÜLDÜ |
| **FAIL-06: Corporate Name False Match** | Firma adının unvan kelimesi içermesi (`Doktor Takvimi`, `Big Chefs`, `Lider Otomotiv`). | Yüksek (Firma/Rol karışması) | Deneyim satır ayrıştırmasında `[Şirket] - [Rol]` şablonu ve kurumsal varlık doğrulayıcı (`isCorporateEntity`) işletilir. | ÇÖZÜLDÜ |
| **FAIL-07: Default Value Leakage** | Konumsuz veya unvansız adaylara sistem varsayılanı (`İstanbul`, `Uzman`) atanması. | Kritik (Veri kirliliği) | Kanıt bulunmayan alanlar için varsayılan atama kesinlikle yasaklanmış, `NOT_FOUND` statüsü verilmiştir. | ÇÖZÜLDÜ |
| **FAIL-08: Spaced OCR Letters** | OCR taramasında harflerin ayrık gelmesi (`T a r ı k   B i l g i n`). | Orta (Okunamama riski) | `cv-universal-normalizer` harf arası boşlukları birleştirir, kelime sınırlarını onarır. | ÇÖZÜLDÜ |

---

## 2. KALİTE GÜVENCE PRENSİPLERİ

1. **Kanıtsız Veri Üretilmez:** Bir alan için belgede doğrudan kanıt (provenance snippet) yoksa, tahmin veya varsayım yapılmaz.
2. **Çelişkiler Gizlenmez:** Çelişkili veriler (`ContradictionAuditReport`) structured conflict nesneleri olarak saklanır ve güven skoru düşürülür.
3. **Deterministik Tutarlılık:** Aynı CV girdisi her zaman aynı kanonik çıktıyı üretir.
