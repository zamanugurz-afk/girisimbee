# GİRİŞİMBEE — DATA OWNERSHIP & INVARIANTS MODEL

**Tarih:** 2026-08-23  
**Sürüm:** Engine 13.0  
**Kapsam:** Veri mülkiyeti, kullanıcı önceliği ve 10 temel invariyant kuralı  

---

## 1. TEMEL DEĞİŞMEZLER (INVARIANTS 1 - 10)

| No | Invariant Kuralı | Doğrulama Mekanizması | Durum |
| :--- | :--- | :--- | :--- |
| **INVARIANT 1** | CV evidence hiçbir zaman USER override'ı sessizce ezemez. | `mergeCvExtractionWithExistingProfile` çakışma bayrakları | PASS |
| **INVARIANT 2** | Application override Master Career Profile'ı değiştiremez. | `applyApplicationOverride` sadece başvuru nesnesini günceller | PASS |
| **INVARIANT 3** | Yeni CV extraction geçmiş başvuruları değiştiremez. | `JobApplicationDraft` kilitli snapshot saklar | PASS |
| **INVARIANT 4** | Bir kullanıcının verisi ve evidence'ı başka kullanıcıya görünemez. | `userId` ayrıştırması ve Supabase RLS | PASS |
| **INVARIANT 5** | Kanıtsız alan canonical profile'a confirmed olarak yazılamaz. | `isConfirmed = false` ve `status = NOT_FOUND` | PASS |
| **INVARIANT 6** | Golden fixture (Uğur Zaman) üretim profillerine sızamaz. | 100 Senaryolu Golden İzolasyon Testi | PASS |
| **INVARIANT 7** | Job matching hesaplaması Career Profile'ı değiştiremez. | Saf fonksiyonel hesaplama (`calculateJobMatch`) | PASS |
| **INVARIANT 8** | User edit orijinal evidence'ı silemez; `originalEvidenceValue` saklanır. | `ProvenanceField` veri modeli | PASS |
| **INVARIANT 9** | Extraction tekrar çalıştırıldığında deterministik sonuç üretir. | Deterministik Regex & Sözlük Akışı | PASS |
| **INVARIANT 10** | Başvuru snapshot'ı gönderildikten sonra dondurulur (immutable). | `status = SUBMITTED` ve kilitli kayıt | PASS |
