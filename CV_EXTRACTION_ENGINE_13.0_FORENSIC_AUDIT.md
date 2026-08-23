# GİRİŞİMBEE — CV EXTRACTION ENGINE 13.0 FORENSIC AUDIT REPORT

**Tarih:** 2026-08-23  
**Sürüm:** Engine 13.0  
**Durum:** DOĞRULANDI (VERIFIED)  
**Toplam Test Dosyası:** 275  
**Toplam Test Sayısı:** 5.377  
**Genel Başarı Oranı:** %100 PASS (5.377 / 5.377)  

---

## 1. YÜRÜTME ÖZETİ VE MİMARİ DENETİM

Engine 13.0 çalışması kapsamında CV çıkarım motorunun beceri saflığı (Skill Evidence Purity), isim/rol/sektör izolasyonu, 3 noktalı deneyim sabitlemesi (3-Point Anchoring), sıfır varsayılan (Zero-Defaulting) ve gerçek binary disk replay dayanıklılığı bağımsız testlerle denetlenmiştir.

| Bileşen / Katman | Metrik / Kural | Sonuç | Durum |
| :--- | :--- | :--- | :--- |
| **Skill Evidence Purity** | 15 Sınıflı forensic sınıflandırma (Explicit, Tool, Corp, Role, Resp, vb.) | 301/301 Purity Testi | PASS |
| **Name Resolver** | Morphology, icon/emoji temizleme, referans blok izolasyonu | Sıfır Yanlış İsim | PASS |
| **Role Resolver** | Raw title koruma, `desiredRoleOther` fallback, sıfır jenerik tahmin | Sıfır Jenerik Rol | PASS |
| **Sector Resolver** | `EXPERIENCE` ve `SUMMARY` dışındaki bölgelerin reddi | Sıfır Sızıntı | PASS |
| **Experience Resolver** | `Şirket + (Rol \| Tarih)` 3-noktalı çapa; sorumluluk bullet ayrımı | Sıfır Hayalet Deneyim | PASS |
| **Education Isolation** | Üniversite, bölüm, derece tespiti; sektöre/unvana sızmama | Sıfır Sektör Bulaşması | PASS |
| **Location Purity** | Kanıtsız lokasyona boşluk (`""`) atanması; İstanbul varsayılanı yok | %0.0 Yanlış Lokasyon | PASS |
| **Golden İzolasyonu** | Uğur Zaman fikstürünün 100 bağımsız senaryoya sızmaması | Sıfır Çapraz Sızıntı | PASS |
| **React Hydration & DOM** | Canonical draft $\to$ `customFields` $\to$ `DynamicField` render bütünlüğü | %100 Uyum | PASS |

---

## 2. DİSK ÜZERİNDEKİ GERÇEK DOSYALARIN FORENSIC REPLAY TABLOSU

Yerel diskte bulunan fiziksel PDF dosyaları (`test_cvs/*.pdf`) deterministik çıkarım motoru üzerinden yürütülmüş ve aşağıdaki adli metrikler kaydedilmiştir:

| Dosya Adı | Boyut | Karakter | Bölge Sayısı | Aday Adı | Çıkarılan Rol | Çıkarılan Sektör | İkamet Şehri | Deneyim | Eğitim | Doğrulanmış Beceri | Çelişki | Süre (ms) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `CV_01_Ayşe_Demir.pdf` | 45.4 KB | 1.008 | 6 | Ayşe Demir | İnsan Kaynakları Uzmanı | İnsan kaynakları | İstanbul / Kadıköy | 2 | 1 | 17 | 1 | 383 ms |
| `CV_02_Mehmet_Kaya.pdf` | 45.4 KB | 995 | 6 | Mehmet Kaya | Finans Müdürü | Finans / Bankacılık | Ankara / Çankaya | 2 | 2 | 85 | 0 | 88 ms |
| `CV_03_Elif_Yıldız.pdf` | 45.3 KB | 977 | 6 | Elif Yıldız | Yazılım Geliştirme Uzmanı | Bilişim / Yazılım | İzmir | 2 | 1 | 72 | 1 | 96 ms |
| `CV_04_Burak_Yılmaz.pdf` | 45.5 KB | 962 | 6 | Burak Yılmaz | Üretim Müdürü | Üretim / Sanayi | Bursa / Nilüfer | 2 | 1 | 92 | 1 | 91 ms |
| `CV_05_Zeynep_Çelik.pdf` | 45.5 KB | 1.003 | 6 | Zeynep Çelik | Operasyon Müdürü | Turizm / Otelcilik | Antalya | 2 | 1 | 13 | 1 | 89 ms |
| `CV_06_Can_Arslan.pdf` | 45.3 KB | 1.004 | 6 | Can Arslan | Operasyon Müdürü | Lojistik / Depolama | İstanbul / Bakırköy | 2 | 1 | 96 | 0 | 80 ms |
| `CV_07_Seda_Koç.pdf` | 45.4 KB | 974 | 6 | Seda Koç | Pazarlama Uzmanı | Pazarlama / Reklam | Adana / Seyhan | 2 | 1 | 99 | 1 | 78 ms |
| `CV_08_Emre_Şahin.pdf` | 45.5 KB | 982 | 6 | Emre Şahin | Kalite Güvence Müdürü | Üretim / Sanayi | Kocaeli / Gebze | 2 | 1 | 84 | 1 | 104 ms |
| `CV_09_Derya_Acar.pdf` | 45.2 KB | 982 | 6 | Derya Acar | Grafik Tasarımcı | Pazarlama / Reklam | Eskişehir | 2 | 1 | 41 | 1 | 68 ms |
| `CV_10_Hakan_Özdemir.pdf` | 45.5 KB | 1.042 | 6 | Hakan Özdemir | Elektrik Bakım Şefi | Elektrik-elektronik | Trabzon / Ortahisar | 2 | 1 | 0 | 0 | 119 ms |
