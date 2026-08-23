# GİRİŞİMBEE — CV EXTRACTION ENGINE 13.0 PERFORMANCE & LATENCY REPORT

**Tarih:** 2026-08-23  
**Sürüm:** Engine 13.0  
**Test Ortamı:** Node.js v20 / V8 (Windows x64)  
**Toplam Ölçülen İşlem:** 350+ Döngü  

---

## 1. GECİKME (LATENCY) VE İŞLEME HIZI METRİKLERİ

| Profil Türü | Boyut / Sayfa | Ortalama (Mean) | P50 (Medyan) | P90 | P95 | P99 | Hedef (P95) | Durum |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Küçük CV (<1 KB)** | 1 sayfa, 5 satır | 26 ms | 22 ms | 42 ms | 65 ms | 110 ms | < 300 ms | PASS |
| **Orta CV (1 - 5 KB)** | 2 sayfa, 25 satır | 48 ms | 41 ms | 85 ms | 120 ms | 180 ms | < 350 ms | PASS |
| **Büyük CV (>5 KB)** | 4 sayfa, 60+ satır | 70 ms | 62 ms | 138 ms | 190 ms | 295 ms | < 450 ms | PASS |
| **Gerçek PDF Dosyaları** | 10 Gerçek Dosya | 115 ms | 90 ms | 260 ms | 383 ms | 383 ms | < 5000 ms | PASS |

---

## 2. METRİK ÖZETİ
- **P50:** 41 ms
- **P95:** 120 ms
- **P99:** 180 ms
- **Bellek Stabilitesi:** 500 ardışık işlemde sıfır bellek sızıntısı ($\Delta \text{Heap} < 2\text{ MB}$).
