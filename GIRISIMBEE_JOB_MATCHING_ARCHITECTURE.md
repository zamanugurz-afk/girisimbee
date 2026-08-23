# GİRİŞİMBEE — DETERMINISTIC JOB MATCHING ARCHITECTURE

**Tarih:** 2026-08-23  
**Sürüm:** Engine 13.0  
**Kapsam:** 6 Boyutlu Ağırlıklı Deterministik Eşleşme ve Gerekçeli Açıklama Motoru  

---

## 1. EŞLEŞME BOYUTLARI VE AĞIRLIKLARI

| Boyut | Ağırlık | Eşleşme Mantığı | Gerekçe Üretimi |
| :--- | :--- | :--- | :--- |
| **Pozisyon / Rol** | %25 | Kanonik unvan eşleşmesi, yakın unvan benzerliği | "Pozisyonunuz aranan rolle tam uyumlu" |
| **Beceriler & Araçlar** | %25 | Aranan zorunlu ve tercih edilen yetkinliklerin adayın becerileri ile kesişimi | "5 temel yetkinlikten 4'üne sahipsiniz: React, TypeScript..." |
| **Sektör** | %15 | Deneyimdeki şirket sektörü ile ilan sektörünün uyumu | "Sektör deneyiminiz (Bilişim / Yazılım) ilanın odağını karşılıyor" |
| **Kıdem / Deneyim** | %15 | Stajyer, Junior, Mid, Senior, Lead, Yönetici seviye kontrolü | "Kıdem seviyeniz (Senior) beklentiyi karşılıyor" |
| **Eğitim** | %10 | Lise, Ön Lisans, Lisans, Yüksek Lisans asgari derece uyumu | "Lisans mezuniyeti gereksinimi karşılanıyor" |
| **Konum & Model** | %10 | Şehir/İlçe uyumu veya Uzaktan (Remote) çalışma modeli | "İlan uzaktan çalışmayı destekliyor" |

---

## 2. GEREKÇELİ EŞLEŞME (EXPLAINABLE MATCHING)
Kullanıcıya yalnızca soyut bir sayı (ör. %92) gösterilmez:
- **Neden Güçlü Eşleşiyorsun:** Karşılanan tüm kriterlerin maddeler halinde özeti.
- **Eksik Kalan Noktalar:** İlanda istenen ancak profilde bulunmayan gereksinimlerin şeffaf listesi (ör. "GraphQL yetkinliği profilinizde bulunmuyor").
