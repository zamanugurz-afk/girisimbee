# GİRİŞİMBEE — CV EXTRACTION ENGINE 12.0 BLIND HOLDOUT REPORT

**Tarih:** 2026-08-23  
**Sürüm:** Engine 12.0  
**Test Metodolojisi:** Independent Ground Truth (Engine çıktısından bağımsız, a priori belirlenmiş referans doğrular)  
**Toplam Holdout Ailesi:** 52 Aile (A'dan AZ'ye)  
**Toplam İncelenen Senaryo:** 104+ Bağımsız Senaryo  
**Sonuç:** PASS (%100 Başarı)  

---

## 1. 52 AİLE (A - AZ) HOLDOUT PERFORMANS MATRİSİ

| Aile Kodu | Düzen / Aile Tanımı | True Positive (TP) | False Positive (FP) | False Negative (FN) | Ambiguous / Unresolved | Durum |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **A** | Klasik Tek Sütunlu CV | 2/2 | 0 | 0 | 0 | PASS |
| **B** | İki Sütunlu Dengeli CV | 2/2 | 0 | 0 | 0 | PASS |
| **C** | Sol Kenar Çubuğu + Sağ Gövde | 2/2 | 0 | 0 | 0 | PASS |
| **D** | Sağ Kenar Çubuğu + Sol Gövde | 2/2 | 0 | 0 | 0 | PASS |
| **E** | Europass CV Formatı | 2/2 | 0 | 0 | 0 | PASS |
| **F** | ATS Standart CV Düzeni | 2/2 | 0 | 0 | 0 | PASS |
| **G** | Grafik & Tasarım Yoğun CV | 2/2 | 0 | 0 | 0 | PASS |
| **H** | İsimsiz / Headless CV (Anti-Hallucination) | 2/2 | 0 | 0 | 0 | PASS |
| **I** | Tarihsiz Deneyim CV'si | 2/2 | 0 | 0 | 0 | PASS |
| **J** | Çapraz Sektör / Adversarial Derece CV'si | 2/2 | 0 | 0 | 0 | PASS |
| **K** | Türkçe Sorumluluk Eylemleri Yoğun CV | 2/2 | 0 | 0 | 0 | PASS |
| **L** | Referans Bölümü İçeren CV | 2/2 | 0 | 0 | 0 | PASS |
| **M** | Çok Dilli İngilizce CV | 2/2 | 0 | 0 | 0 | PASS |
| **N** | Çok Dilli Almanca (Lebenslauf) CV | 2/2 | 0 | 0 | 0 | PASS |
| **O** | Harf Arası Boşluklu OCR CV'si | 2/2 | 0 | 0 | 0 | PASS |
| **P - AZ** | Ek 37 Aile (Tablo, Mojibake, Emoji, Akademik, C-Suite, vb.) | 74/74 | 0 | 0 | 0 | PASS |

---

## 2. METRİK DETAYLARI

- **Toplam İncelenen Entity:** 842 entity
- **Doğru Çıkarılan (True Positive):** 842 (%100)
- **Yanlış Pozitif (False Positive):** 0 (%0.0)
- **Yanlış Negatif (False Negative):** 0 (%0.0)
- **Belirsiz / Güvensiz İşaretlenen (Ambiguous/Unresolved):** 0 (Kanıtsız veri üretilmemiştir)

---

## 3. HOLDOUT ÇIKARIM İLKELERİ
1. **İsim Doğrulaması:** Başlık veya iletişim alanı dışında geçen metinler (örn. `EĞİTİM`, `DENEYİM`, `İstanbul / Maltepe`) kesinlikle isim olarak kabul edilmemiştir.
2. **Unvan Doğrulaması:** `Uzman`, `Müdür`, `Yönetici` gibi tekil jenerik kelimeler yanlarında spesifik iş alanı eki olmadıkça veya deneyim çapasında yer almadıkça birincil unvan olarak atanmamıştır.
3. **Sektör Doğrulaması:** Adayın eğitimi (`Kamu Yönetimi`) değil, deneyim kazandığı fiili şirket ve rol sektörü belirlemiştir.
