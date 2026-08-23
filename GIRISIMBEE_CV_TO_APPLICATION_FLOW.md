# GİRİŞİMBEE — CV TO APPLICATION FLOW SPECIFICATION

**Tarih:** 2026-08-23  
**Sürüm:** Engine 13.0  
**Kapsam:** CV Yükleme $\to$ Career Profile $\to$ Job Posting $\to$ Başvuru Akışı  

---

## 1. END-TO-END AKIŞ VE İZOLASYON PRENSİPLERİ

```
1. CV Yükleme (PDF/DOCX)
   ↓
2. Evidence Graph Doğrulaması (Deterministic)
   ↓
3. "CV'nizi Analiz Ettik" İnceleme Ekranı
   ↓
4. Kullanıcı Alan Bazlı Onaylar / Düzenler (Provenance: USER / CV)
   ↓
5. Master Career Profile Kaydedilir
   ↓
6. İlan Görüntüleme & Canlı Eşleşme Skoru (GET /api/jobs/:id/match)
   ↓
7. Otomatik Doldurulan Başvuru Taslağı (POST /api/jobs/:id/application/draft)
   [CV TEKRAR PARSE EDİLMEZ — MASTER PROFİL KULLANILIR]
   ↓
8. İlana Özel Düzenlemeler (PATCH /api/jobs/:id/application/draft)
   [MASTER PROFİL ASLA DEĞİŞMEZ]
   ↓
9. Dondurulmuş Başvuru Snapshot'ı Gönderilir (POST /api/jobs/:id/application/submit)
```

---

## 2. GÜVENLİK VE PERFORMANS AVANTAJLARI
- Başvuru anında dosya ayrıştırma maliyeti sıfırdır (0 ms / 0 token).
- Master profil ve geçmiş başvurular birbirinden tamamen izoledir.
