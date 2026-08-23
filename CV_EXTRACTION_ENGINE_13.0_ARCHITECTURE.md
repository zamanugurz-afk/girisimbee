# GİRİŞİMBEE — CV EXTRACTION ENGINE 13.0 ARCHITECTURE SPECIFICATION

**Tarih:** 2026-08-23  
**Sürüm:** Engine 13.0  
**Kapsam:** Çıkarım motorunun katmanlı mimarisi, ontolojik bağımlılıkları ve güvenlik izolasyon duvarları  

---

## 1. MİMARİ KATMANLAR VE VERİ AKIŞI

```
[İkili Dosya (PDF/DOCX)] ──> [Spatial & Zoning Engine] ──> [Candidate Generator]
                                                                  │
┌─────────────────────────────── Entity Resolvers ────────────────┴────────────────────────┐
│  NameResolver   RoleResolver   SectorResolver   LocationResolver   SkillResolver   Edu/Exp │
└───────────────────────────────┬──────────────────────────────────────────────────────────┘
                                │
                     [Evidence Graph & DAG] (Firewall Enforcement)
                                │
                   [Contradiction Engine] (Structured Conflicts)
                                │
                 [Canonical Taxonomy Mapper] (Ontology Alignment)
                                │
                   [Profile Draft Builder] (Form Draft Assembly)
                                │
                    [React Form Hydrator] (customFields & State Merge)
                                │
                     [DynamicField DOM] (Browser UI Rendering)
```

---

## 2. TEMEL TASARIM PRENSİPLERİ

1. **Precision > Recall in Skills:** Beceriler bölümü açıkça mevcutsa, genel metin üzerinden rastgele anahtar kelime eşleştirmesi yapılmaz. Şirket adları, sorumluluk cümleleri, yabancı diller ve unvanlar asla beceri listesine alınmaz.
2. **Deterministic Priority ($0.00 / 0-Token):** Çıkarım akışı yerel deterministik çözümleyiciler ile yürütülür; AI yalnızca doğrulanabilir durumlarda denetimli olarak çağrılır.
3. **Multi-Factor Candidate Scoring:** Her entity (İsim, Rol, Sektör, Lokasyon, Beceri) pozitif ve negatif kanıtların ağırlıklı toplamı ($\text{Score} \ge 60$) ile onaylanır. Negatif kanıt içeren adaylar doğrudan diskalifiye edilir.
4. **Isolated Taxonomy Boundaries:** Girişimbee taksonomisinde birebir karşılığı olmayan niş roller `'Diğer'` enum değeri ve `desiredRoleOther` serbest metin alanı ile korunur.
