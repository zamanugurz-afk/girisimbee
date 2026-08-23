# GİRİŞİMBEE — CV EXTRACTION ENGINE 12.0 CROSS-CONTAMINATION & GOLDEN ISOLATION REPORT

**Tarih:** 2026-08-23  
**Sürüm:** Engine 12.0  
**Kapsam:** Golden CV (Uğur Zaman) ve genel varsayılan değerlerin diğer adaylara sızmasının engellenmesi testi  

---

## 1. GOLDEN FİKSTÜR SIZINTI DENETİMİ

Test kapsamında Uğur Zaman CV'si işlem kuyruğundan tamamen çıkarılmış ve farklı sektör/şehirlerdeki adaylar işlenmiştir.

| Aday Adı | İşlenen Profil Sektörü / Şehri | "Uğur Zaman" İsim Sızıntısı? | "Çağrı Merkezi Operasyon Müdürü" Sızıntısı? | "Çağrı merkezi" Sektör Sızıntısı? | "İstanbul" / "Maltepe" Sızıntısı? | Sonuç |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Melike Şahin** | Klinik Psikolog / Ankara / Çankaya | HAYIR (0 sızıntı) | HAYIR (0 sızıntı) | HAYIR (0 sızıntı) | HAYIR (Ankara / Çankaya) | PASS |
| **Okan Kurtuluş** | Ziraat Mühendisi / İzmir / Bornova | HAYIR (0 sızıntı) | HAYIR (0 sızıntı) | HAYIR (0 sızıntı) | HAYIR (İzmir / Bornova) | PASS |
| **Selin Doğan** | Avukat / Antalya / Muratpaşa | HAYIR (0 sızıntı) | HAYIR (0 sızıntı) | HAYIR (0 sızıntı) | HAYIR (Antalya / Muratpaşa) | PASS |
| **Taner Güler** | Makam Şoförü / Bursa / Osmangazi | HAYIR (0 sızıntı) | HAYIR (0 sızıntı) | HAYIR (0 sızıntı) | HAYIR (Bursa / Osmangazi) | PASS |
| **Headless CV** | İsimsiz ve Lokasyonsuz Profil | HAYIR (Boş isim) | HAYIR (0 sızıntı) | HAYIR (0 sızıntı) | HAYIR (Boş şehir) | PASS |

---

## 2. BÖLGE VE ALANLAR ARASI SIZINTI DENETİMİ (CROSS-FIELD FIREWALL)

| Sızıntı Tehdidi Senaryosu | Beklenen Koruma | Gerçekleşen Sonuç | Güvenlik Durumu |
| :--- | :--- | :--- | :--- |
| **Eğitim $\to$ Sektör Sızıntısı** | `Kamu Yönetimi` diploması sektörü `Kamu / Belediye` yapmamalıdır. | Sektör adayın çalıştığı teknoloji şirketine göre `Bilişim / Yazılım` kalmıştır. | GÜVENLİ |
| **Beceri $\to$ Unvan Sızıntısı** | `React - Uzman` maddesi adayın unvanını `Uzman` yapmamalıdır. | Unvan `Full Stack Geliştirici` olarak korunmuştur. | GÜVENLİ |
| **Referans $\to$ İsim/Unvan Sızıntısı** | Referans olarak yazılan `Ahmet Yılmaz - Genel Müdür` adayın ismi veya unvanı olmamalıdır. | Adayın gerçek ismi `Gizem Aktaş` ve unvanı `Satış Danışmanı` çıkarılmıştır. | GÜVENLİ |
| **Firma Adı $\to$ Unvan Sızıntısı** | `Doktor Takvimi A.Ş.` şirketinde çalışan yazılımcının unvanı `Doktor` olmamalıdır. | Unvan `Yazılım Mühendisi` olarak çıkarılmıştır. | GÜVENLİ |

---

## 3. DOĞRULAMA TESTLERİ
- **Test Dosyaları:**
  - `cv-engine-12.0-golden-contamination.test.ts`
  - `cv-engine-12.0-zero-false-positive.test.ts`
- **Sonuç:** %100 PASS. Hiçbir golden veya genel kural sızıntısı bulunmamaktadır.
