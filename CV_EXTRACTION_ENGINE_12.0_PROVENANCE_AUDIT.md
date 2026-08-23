# GİRİŞİMBEE — CV EXTRACTION ENGINE 12.0 PROVENANCE AUDIT REPORT

**Tarih:** 2026-08-23  
**Sürüm:** Engine 12.0  
**Kapsam:** Çıkarılan her alanın kaynak kanıtı, güven puanı, pozitif/negatif gerekçeleri ve veri sözleşmesi denetimi  

---

## 1. ALAN BAZLI PROVENANCE SÖZLEŞMESİ DENETİMİ

| Çıkarılan Alan (Field) | Yetkili Bölge (Zone) | Yetkili Çözümleyici (Resolver) | Kanıt Parçası (Snippet) | Pozitif Kanıt Faktörleri | Negatif Kanıt Faktörleri | Çözümleme Statüsü |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `fullName` | `HEADER`, `CONTACT` | `NameResolver` | Belgedeki tam isim metni | Üst satır konumu, 2-4 kelime, e-posta kullanıcı adı örtüşmesi | Fiilimsi son ekleri, şehir/kurum kelimeleri, bölüm başlığı | `RESOLVED` / `NOT_FOUND` |
| `primaryRole` | `HEADER`, `SUMMARY`, `EXPERIENCE` | `RoleResolver` | Başlık veya son deneyim rolü | Deneyim çapasında yer alma, güncel iş olma, standart unvan kökü | `SKILLS` veya `EDUCATION` bölgesinden gelme, tekil jenerik kelime | `RESOLVED` / `NOT_FOUND` / `AMBIGUOUS` |
| `primarySector` | `SUMMARY`, `EXPERIENCE` | `SectorResolver` | Deneyim şirketi veya rol konteksti | Deneyim şirketinin tescilli sektörü, yetkili sektör bölgesi | `EDUCATION` veya `SKILLS` bölgesinden sektör türetme girişimi | `RESOLVED` / `NOT_FOUND` / `AMBIGUOUS` |
| `residenceCity` | `CONTACT`, `HEADER` | `LocationResolver` | İkametgah satırı | İletişim bölgesinde yer alma, `/` veya `|` ile ayrılmış açık adres | Şirket veya üniversite lokasyonu ile karışma | `RESOLVED` / `NOT_FOUND` |
| `residenceDistrict` | `CONTACT`, `HEADER` | `LocationResolver` | İlçe satırı | Şehirle eşleşen resmi ilçe veritabanı kaydı | Şehirle uyuşmayan ilçe adı | `RESOLVED` / `NOT_FOUND` |
| `experiences` | `EXPERIENCE` | `ExperienceResolver` | Şirket, rol, tarih aralığı, sorumluluklar | Tarih aralığı (YYYY - YYYY), şirket adı ve unvan birlikteliği | Eğitim satırı veya referans satırı olma | `RESOLVED` / `NOT_FOUND` |
| `educationList` | `EDUCATION` | `EducationResolver` | Üniversite, bölüm, derece, mezuniyet yılı | Üniversite veritabanı eşleşmesi, lisans/yüksek lisans derecesi | Şirket adı veya sertifika başlığı ile karışma | `RESOLVED` / `NOT_FOUND` |
| `skills` | `SKILLS`, `EXPERIENCE` | `SkillResolver` | Beceri listesi ve araçlar | Yetkinlik başlığı altındaki teknik terimler ve araç isimleri | Sorumluluk metni içinde geçen sıradan fiiller | `RESOLVED` / `NOT_FOUND` |

---

## 2. EMPTY / NULL SEMANTİĞİ VE STATÜ HARİTASI

Engine 12.0 kapsamında alanların boşluk ve belirsizlik durumları açıkça sınıflandırılmıştır:

- **`RESOLVED`**: Alan için pozitif kanıt yeterli, negatif kanıt bulunmamakta ve değer kanonik ontolojiye başarıyla eşlenmiştir.
- **`NOT_FOUND`**: Belgede bu alana dair hiçbir kanıt parçası bulunmamaktadır. Varsayılan uydurma değer üretilmez.
- **`AMBIGUOUS`**: Birden fazla çelişkili veya eşit ağırlıklı aday mevcuttur (örn. farklı bölgelerde iki farklı unvan).
- **`CONTRADICTORY`**: Alanlar arasında mantıksal veya kronolojik çelişki tespit edilmiştir (örn. 1995 doğumlu adayın 2000 yılında mezun görünmesi).
- **`LOW_CONFIDENCE`**: Kanıt skoru eşik değerin ($<60$) altında kalmıştır; kullanıcı onayına sunulur.

---

## 3. PROVENANCE BÜTÜNLÜĞÜ DOĞRULAMASI
- **Test Dosyası:** `cv-engine-12.0-provenance.test.ts`
- **Sonuç:** %100 PASS. Tüm alanlar denetlenebilir ve kaynak kanıtına bağlanabilir durumdadır.
