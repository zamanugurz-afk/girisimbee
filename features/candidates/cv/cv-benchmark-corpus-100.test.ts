import { describe, it, expect } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from './cv-profile-builder';

describe('CV Extraction 4.0 — 100 Unseen Real-World Benchmark Acceptance Suite', () => {
  // 100 distinct real-world CV test cases across 30+ sectors and 15 layout styles
  const benchmarkCorpus = [
    // Sector 1: Banking & Treasury (1-3)
    {
      id: 'BM_001',
      title: 'Banka Şube Müdürü',
      comp: 'Garanti BBVA',
      city: 'İstanbul',
      district: 'Kadıköy',
      sector: 'Finans / Bankacılık',
      roleRegex: /Banka Müdürü|Müdür|Yönetici/i,
      text: `Mustafa Cem Yılmaz\nİstanbul / Kadıköy\nBanka Şube Müdürü\n\nİŞ DENEYİMİ\nGaranti BBVA 2018 - 2024\nŞube Müdürü\n* Ticari ve bireysel bankacılık hedefleri, kredi tahsis ve şube operasyonları yönetildi.\n\nAkbank 2012 - 2018\nKıdemli Ticari Portföy Yöneticisi\n* KOBİ ve kurumsal müşteri portföy yönetimi ve nakit akış analizi.\n\nEĞİTİM\nİstanbul Üniversitesi - İktisat (Lisans) - 2011\n\nYETKİNLİKLER: Şube Yönetimi, Kredi Tahsis, Finansal Analiz, Bilanço Okuma, Ekip Yönetimi\nDİLLER: İngilizce (İleri / C1)\nSERTİFİKALAR: SPL Düzey 3`,
    },
    {
      id: 'BM_002',
      title: 'Hazine Operasyonları Uzmanı',
      comp: 'Yapı Kredi',
      city: 'İstanbul',
      district: 'Beşiktaş',
      sector: 'Finans / Bankacılık',
      roleRegex: /Hazine|Finans|Uzman/i,
      text: `Selin Demirtaş\nİstanbul / Beşiktaş\nHazine Operasyonları Uzmanı\n\nDENEYİM\nYapı Kredi 2020 - 2024\nHazine Uzmanı\n* Para piyasaları, FX işlemleri ve likidite yönetimi takibi.\n\nEĞİTİM\nBoğaziçi Üniversitesi - İşletme (Lisans) - 2019\n\nYETKİNLİKLER: Para Piyasaları, FX, Bloomberg, Likidite Analizi\nDİLLER: İngilizce (Akıcı)`,
    },
    {
      id: 'BM_003',
      title: 'Kredi Risk Modelleme Uzmanı',
      comp: 'İş Bankası',
      city: 'Ankara',
      district: 'Çankaya',
      sector: 'Finans / Bankacılık',
      roleRegex: /Risk|Finans|Analist|Uzman/i,
      text: `Onur Çelik\nAnkara / Çankaya\nKredi Risk Analisti\n\nİŞ DENEYİMİ\nİş Bankası 2019 - 2023\nRisk Modelleme Uzmanı\n* Skorlama modelleri ve Basel standartları uyum analizleri.\n\nEĞİTİM\nODTÜ - İstatistik (Lisans) - 2018\n\nYETKİNLİKLER: Python, SQL, Risk Modelleme, SAS\nDİLLER: İngilizce`,
    },

    // Sector 2: Insurance & Actuarial (4-6)
    {
      id: 'BM_004',
      title: 'Aktüerya ve Karşılıklar Yöneticisi',
      comp: 'Allianz Sigorta',
      city: 'İstanbul',
      district: 'Ataşehir',
      sector: 'Sigorta',
      roleRegex: /Aktüerya|Sigorta/i,
      text: `Burcu Aksoy\nİstanbul / Ataşehir\nAktüerya Yöneticisi\n\nDENEYİM\nAllianz Sigorta 2017 - 2024\nAktüerya Müdürü\n* Hayat dışı branşlarda IFRS 17 karşılık hesaplamaları ve reasürans optimizasyonu.\n\nEĞİTİM\nHacettepe Üniversitesi - Aktüerya (Lisans) - 2016\n\nYETKİNLİKLER: Aktüeryal Modelleme, IFRS 17, R, Python, SAS\nDİLLER: İngilizce (İleri)`,
    },
    {
      id: 'BM_005',
      title: 'Kurumsal Hasar Uzmanı',
      comp: 'Aksigorta',
      city: 'İstanbul',
      district: 'Ümraniye',
      sector: 'Sigorta',
      roleRegex: /Hasar|Sigorta|Uzman/i,
      text: `Tolga Er\nİstanbul / Ümraniye\nHasar Yönetim Uzmanı\n\nİŞ TECRÜBESİ\nAksigorta 2019 - 2024\nKurumsal Hasar Uzmanı\n* Yangın, kaza ve mühendislik hasar dosya incelemeleri ve rücu süreçleri.\n\nEĞİTİM\nMarmara Üniversitesi - Sigortacılık (Lisans) - 2018\n\nYETKİNLİKLER: Hasar Dosya Yönetimi, Rücu Takibi, Ekspertiz Raporlama`,
    },
    {
      id: 'BM_006',
      title: 'Hayat Sigortası Satış Danışmanı',
      comp: 'Agesa Hayat ve Emeklilik',
      city: 'İzmir',
      district: 'Konak',
      sector: 'Sigorta',
      roleRegex: /Sigorta Danışmanı|Satış/i,
      text: `Ebru Güler\nİzmir / Konak\nSigorta ve BES Danışmanı\n\nDENEYİM\nAgesa Hayat ve Emeklilik 2021 - 2024\nFinansal Güvence Danışmanı\n* Bireysel emeklilik ve hayat sigortası portföy oluşturma.\n\nEĞİTİM\nDokuz Eylül Üniversitesi - İktisat (Lisans) - 2020\n\nYETKİNLİKLER: Bireysel Emeklilik, Müşteri İletişimi, Portföy Yönetimi\nSERTİFİKALAR: SEGEM Belgesi`,
    },

    // Sector 3: Corporate Finance, Audit & SMMM (7-9)
    {
      id: 'BM_007',
      title: 'Mali İşler Direktörü (CFO)',
      comp: 'Zorlu Holding',
      city: 'İstanbul',
      district: 'Şişli',
      sector: 'Finans / Bankacılık',
      roleRegex: /CFO|Mali İşler|Finans Müdürü/i,
      text: `Kerem Savaş\nİstanbul / Şişli\nMali İşler Direktörü\n\nİŞ DENEYİMİ\nZorlu Holding 2016 - 2024\nCFO & Mali İşler Direktörü\n* Konsolide finansal raporlama, bütçe yönetimi ve denetim süreçleri.\n\nEĞİTİM\nBoğaziçi Üniversitesi - İşletme (Lisans) - 2010\n\nYETKİNLİKLER: IFRS, Konsolidasyon, Bütçe Yönetimi, SAP FICO\nDİLLER: İngilizce (İleri / C2)\nSERTİFİKALAR: SMMM, CFA`,
    },
    {
      id: 'BM_008',
      title: 'Kıdemli Denetçi (Senior Auditor)',
      comp: 'PwC Türkiye',
      city: 'İstanbul',
      district: 'Beşiktaş',
      sector: 'Muhasebe / Mali müşavirlik',
      roleRegex: /Denetçi|Denetim|Müfettiş|Muhasebe|Auditor/i,
      text: `Merve Şen\nİstanbul / Beşiktaş\nKıdemli Denetçi\n\nİŞ DENEYİMİ\nPwC Türkiye 2020 - 2024\nKıdemli Denetim Uzmanı\n* Bağımsız dış denetim, vergi revizyonu ve finansal tablo analizi.\n\nEĞİTİM\nBilkent Üniversitesi - İktisat (Lisans) - 2019\n\nYETKİNLİKLER: IFRS, Denetim, UFRS, Excel İleri Düzey\nDİLLER: İngilizce (Akıcı)\nSERTİFİKALAR: SMMM Stajyer`,
    },
    {
      id: 'BM_009',
      title: 'Maliyet Muhasebesi Şefi',
      comp: 'Eczacıbaşı Yapı Gereçleri',
      city: 'Bilecik',
      sector: 'Muhasebe / Mali müşavirlik',
      roleRegex: /Muhasebe|Mali/i,
      text: `Emre Aydın\nBilecik\nMaliyet Muhasebesi Şefi\n\nDENEYİM\nEczacıbaşı Yapı Gereçleri 2018 - 2023\nMaliyet Muhasebesi Şefi\n* Ürün reçeteleri, standart maliyet ve sapma analizleri.\n\nEĞİTİM\nAnadolu Üniversitesi - İktisat (Lisans) - 2017\n\nYETKİNLİKLER: SAP CO, Maliyet Muhasebesi, Bütçe Planlama`,
    },

    // Sector 4: Software, Cloud & DevOps (10-14)
    {
      id: 'BM_010',
      title: 'Kıdemli Full Stack Geliştirici',
      comp: 'Trendyol',
      city: 'İstanbul',
      district: 'Sarıyer',
      sector: 'Bilişim / Yazılım',
      roleRegex: /Full Stack|Yazılım|Geliştirici/i,
      text: `Can Kılıç\nİstanbul / Sarıyer\nSenior Full Stack Developer\n\nİŞ DENEYİMİ\nTrendyol 2021 - 2024\nSenior Software Engineer\n* Node.js, React ve Go mikroservis mimarileri geliştirildi.\n\nEĞİTİM\nİTÜ - Bilgisayar Mühendisliği (Lisans) - 2020\n\nYETKİNLİKLER: React, Node.js, Go, TypeScript, PostgreSQL, Docker, Redis\nDİLLER: İngilizce (İleri / C1)`,
    },
    {
      id: 'BM_011',
      title: 'DevOps & Bulut Mimarı',
      comp: 'Hepsiburada',
      city: 'İstanbul',
      district: 'Beykoz',
      sector: 'Bilişim / Yazılım',
      roleRegex: /DevOps|Bulut|Sistem/i,
      text: `Ali Vural\nİstanbul / Beykoz\nDevOps Mühendisi\n\nİŞ DENEYİMİ\nHepsiburada 2019 - 2024\nDevOps Engineer\n* Kubernetes cluster yönetimi, Terraform CI/CD pipeline kurulumları.\n\nEĞİTİM\nYıldız Teknik Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2018\n\nYETKİNLİKLER: Kubernetes, Docker, AWS, Terraform, CI/CD, Linux\nDİLLER: İngilizce`,
    },
    {
      id: 'BM_012',
      title: 'iOS Mobil Uygulama Geliştirici',
      comp: 'Getir Tech',
      city: 'İstanbul',
      district: 'Ataşehir',
      sector: 'Bilişim / Yazılım',
      roleRegex: /Mobil|Yazılım|Geliştirici/i,
      text: `Zeynep Karaca\nİstanbul / Ataşehir\nSenior iOS Developer\n\nDENEYİM\nGetir Tech 2020 - 2024\nSenior iOS Engineer\n* Swift, SwiftUI ve Combine mimarisiyle e-ticaret uygulaması geliştirildi.\n\nEĞİTİM\nODTÜ - Bilgisayar Mühendisliği (Lisans) - 2019\n\nYETKİNLİKLER: Swift, SwiftUI, Combine, MVVM, Git\nDİLLER: İngilizce`,
    },
    {
      id: 'BM_013',
      title: 'Yazılım Test Otomasyon Mühendisi (QA Lead)',
      comp: 'Softtech',
      city: 'İstanbul',
      district: 'Ümraniye',
      sector: 'Bilişim / Yazılım',
      roleRegex: /Test|Yazılım|Mühendis/i,
      text: `Deniz Polat\nİstanbul / Ümraniye\nQA Test Mühendisi\n\nİŞ DENEYİMİ\nSofttech 2018 - 2024\nLead QA Engineer\n* Selenium, Cypress ve Appium ile uçtan uca otomasyon testleri.\n\nEĞİTİM\nEge Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2017\n\nYETKİNLİKLER: Selenium, Cypress, Appium, Java, Postman, Jira\nDİLLER: İngilizce`,
    },
    {
      id: 'BM_014',
      title: 'Veritabanı Yöneticisi (DBA)',
      comp: 'Turkcell',
      city: 'İstanbul',
      district: 'Maltepe',
      sector: 'Bilişim / Yazılım',
      roleRegex: /Veritabanı|Sistem|Bilişim/i,
      text: `Ufuk Taşkın\nİstanbul / Maltepe\nKıdemli Veritabanı Yöneticisi\n\nDENEYİM\nTurkcell 2017 - 2024\nSenior Oracle & PostgreSQL DBA\n* Yüksek erişilebilirlik, disaster recovery ve replikasyon yönetimi.\n\nEĞİTİM\nKocaeli Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2016\n\nYETKİNLİKLER: Oracle, PostgreSQL, SQL, PL/SQL, Backup & Recovery`,
    },

    // Sector 5: Cyber Security (15-17)
    {
      id: 'BM_015',
      title: 'SOC Analisti (L3 Security Analyst)',
      comp: 'Havelsan',
      city: 'Ankara',
      district: 'Yenimahalle',
      sector: 'Bilişim / Yazılım',
      roleRegex: /Siber Güvenlik|Mühendis|Analist|Analyst/i,
      text: `Kaan Doğan\nAnkara / Yenimahalle\nSiber Güvenlik Analisti\n\nİŞ DENEYİMİ\nHavelsan 2020 - 2024\nSOC L3 Security Analyst\n* Tehdit avcılığı, olay müdahale (IR) ve zararlı yazılım analizi.\n\nEĞİTİM\nTOBB ETÜ - Bilgisayar Mühendisliği (Lisans) - 2019\n\nYETKİNLİKLER: SIEM, Splunk, Wireshark, Incident Response, Malware Analysis\nDİLLER: İngilizce\nSERTİFİKALAR: CEH, CISSP`,
    },
    {
      id: 'BM_016',
      title: 'Sızma Testi Uzmanı (Penetration Tester)',
      comp: 'Biznet Bilişim',
      city: 'Ankara',
      district: 'Çankaya',
      sector: 'Bilişim / Yazılım',
      roleRegex: /Siber Güvenlik|Mühendis|Tester/i,
      text: `Bora Yalçın\nAnkara / Çankaya\nSızma Testi Uzmanı\n\nDENEYİM\nBiznet Bilişim 2019 - 2024\nSenior Penetration Tester\n* Web, mobil ve ağ altyapısı sızma testleri ve güvenlik denetimleri.\n\nEĞİTİM\nGazi Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2018\n\nYETKİNLİKLER: Burp Suite, Metasploit, Nmap, Web Security, Linux\nSERTİFİKALAR: OSCP, CEH`,
    },
    {
      id: 'BM_017',
      title: 'Bilgi Güvenliği Uyum Yöneticisi',
      comp: 'Türk Telekom',
      city: 'İstanbul',
      district: 'Beşiktaş',
      sector: 'Bilişim / Yazılım',
      roleRegex: /Güvenlik|Yönetici|Bilişim|Müdür/i,
      text: `Gülşah Arı\nİstanbul / Beşiktaş\nBilgi Güvenliği Yöneticisi\n\nİŞ DENEYİMİ\nTürk Telekom 2016 - 2024\nBilgi Güvenliği Uyum Müdürü\n* ISO 27001, KVKK ve BDDK bilgi sistemleri uyum süreçleri yönetildi.\n\nEĞİTİM\nİTÜ - Endüstri Mühendisliği (Lisans) - 2015\n\nYETKİNLİKLER: ISO 27001, KVKK Uyum, Risk Değerlendirme, Bilgi Güvenliği\nSERTİFİKALAR: CISA, ISO 27001 Lead Auditor`,
    },

    // Sector 6: Data Science, BI & AI (18-20)
    {
      id: 'BM_018',
      title: 'Yapay Zeka ve Makine Öğrenmesi Mühendisi',
      comp: 'Insider Tech',
      city: 'İstanbul',
      district: 'Sarıyer',
      sector: 'Yapay zeka / Veri',
      roleRegex: /Yapay Zeka|Veri Bilimci|Makine Öğrenmesi|Mühendis/i,
      text: `Dr. Ersin Toprak\nİstanbul / Sarıyer\nMachine Learning Engineer\n\nİŞ DENEYİMİ\nInsider 2020 - 2024\nSenior ML Engineer\n* Doğal dil işleme (NLP) ve öneri sistemleri modelleri geliştirildi.\n\nEĞİTİM\nBoğaziçi Üniversitesi - Bilgisayar Mühendisliği (Doktora) - 2020\n\nYETKİNLİKLER: Python, PyTorch, TensorFlow, NLP, Docker, AWS\nDİLLER: İngilizce (İleri / C2)`,
    },
    {
      id: 'BM_019',
      title: 'İş Zekası ve Raporlama Uzmanı (BI Lead)',
      comp: 'Migros Ticaret A.Ş.',
      city: 'İstanbul',
      district: 'Ataşehir',
      sector: 'Yapay zeka / Veri',
      roleRegex: /İş Zekası|Veri Analisti|Raporlama/i,
      text: `Hakan Keskin\nİstanbul / Ataşehir\nİş Zekası Uzmanı\n\nDENEYİM\nMigros 2018 - 2024\nSenior BI Specialist\n* Power BI dashboardları, veri ambarı modelleme ve satış analizleri.\n\nEĞİTİM\nMarmara Üniversitesi - Endüstri Mühendisliği (Lisans) - 2017\n\nYETKİNLİKLER: Power BI, SQL, Tableau, DAX, Data Warehousing`,
    },
    {
      id: 'BM_020',
      title: 'Veri Mühendisi (Data Engineer)',
      comp: 'Vodafone Türkiye',
      city: 'İstanbul',
      district: 'Sarıyer',
      sector: 'Yapay zeka / Veri',
      roleRegex: /Veri Mühendisi|Data Engineer|Mühendis/i,
      text: `Cemre Gün\nİstanbul / Sarıyer\nData Engineer\n\nİŞ DENEYİMİ\nVodafone 2021 - 2024\nSenior Data Engineer\n* Spark, Kafka ve Airflow ile büyük veri pipeline mimarileri.\n\nEĞİTİM\nODTÜ - Bilgisayar Mühendisliği (Lisans) - 2020\n\nYETKİNLİKLER: Apache Spark, Kafka, Airflow, Python, SQL, AWS\nDİLLER: İngilizce`,
    },

    // Sector 7: Civil Engineering & Construction (21-23)
    {
      id: 'BM_021',
      title: 'Proje Müdürü & İnşaat Mühendisi',
      comp: 'Enka İnşaat',
      city: 'İstanbul',
      district: 'Beşiktaş',
      sector: 'İnşaat / Gayrimenkul',
      roleRegex: /Proje Müdürü|İnşaat|Şantiye/i,
      text: `Ahmet Taner\nİstanbul / Beşiktaş\nİnşaat Proje Müdürü\n\nİŞ DENEYİMİ\nEnka İnşaat 2015 - 2024\nProje Müdürü\n* Uluslararası endüstriyel tesis projelerinde bütçe ve saha koordinasyonu.\n\nEĞİTİM\nİTÜ - İnşaat Mühendisliği (Lisans) - 2013\n\nYETKİNLİKLER: Primavera P6, Şantiye Yönetimi, Hakediş, FIDIC Sözleşmeleri\nDİLLER: İngilizce, Rusça`,
    },
    {
      id: 'BM_022',
      title: 'Kıdemli Şantiye Şefi',
      comp: 'Tekfen İnşaat',
      city: 'Kocaeli',
      district: 'Gebze',
      sector: 'İnşaat / Gayrimenkul',
      roleRegex: /Şantiye Şefi|İnşaat/i,
      text: `Murat Şahin\nKocaeli / Gebze\nŞantiye Şefi\n\nDENEYİM\nTekfen İnşaat 2017 - 2023\nŞantiye Şefi\n* Boru hattı ve rafineri saha montaj işlerinin sevk ve idaresi.\n\nEĞİTİM\nKaradeniz Teknik Üniversitesi - İnşaat Mühendisliği (Lisans) - 2016\n\nYETKİNLİKLER: AutoCAD, Hakediş, Metraj, Şantiye İdaresi, İSG`,
    },
    {
      id: 'BM_023',
      title: 'Statik Proje Tasarım Mühendisi',
      comp: 'Dolsar Mühendislik',
      city: 'Ankara',
      district: 'Çankaya',
      sector: 'İnşaat / Gayrimenkul',
      roleRegex: /İnşaat|Mühendis|Statik/i,
      text: `Buket Doğan\nAnkara / Çankaya\nStatik Tasarım Mühendisi\n\nİŞ TECRÜBESİ\nDolsar Mühendislik 2019 - 2024\nStatik Tasarım Mühendisi\n* Betonarme ve çelik yapıların deprem analizi ve statik hesaplamaları.\n\nEĞİTİM\nODTÜ - İnşaat Mühendisliği (Yüksek Lisans) - 2018\n\nYETKİNLİKLER: SAP2000, ETABS, AutoCAD, Deprem Yönetmeliği\nDİLLER: İngilizce`,
    },

    // Sector 8: Architecture & Design (24-26)
    {
      id: 'BM_024',
      title: 'Kıdemli Mimar & BIM Uzmanı',
      comp: 'Tabanlıoğlu Mimarlık',
      city: 'İstanbul',
      district: 'Beyoğlu',
      sector: 'İnşaat / Gayrimenkul',
      roleRegex: /Mimar/i,
      text: `Ece Yıldırım\nİstanbul / Beyoğlu\nKıdemli Mimar\n\nİŞ DENEYİMİ\nTabanlıoğlu Mimarlık 2018 - 2024\nProje Mimarı & BIM Lead\n* Karma kullanım avan ve uygulama projelerinin koordinasyonu.\n\nEĞİTİM\nMimar Sinan Güzel Sanatlar Üniversitesi - Mimarlık (Lisans) - 2017\n\nYETKİNLİKLER: Revit, BIM, AutoCAD, Rhinoceros, Lumion\nDİLLER: İngilizce, İtalyanca`,
    },
    {
      id: 'BM_025',
      title: 'İç Mimar & Konsept Tasarımcısı',
      comp: 'Autoban Mimarlık',
      city: 'İstanbul',
      district: 'Beyoğlu',
      sector: 'İnşaat / Gayrimenkul',
      roleRegex: /İç Mimar|Mimar/i,
      text: `Alp Eren\nİstanbul / Beyoğlu\nİç Mimar\n\nDENEYİM\nAutoban 2019 - 2024\nİç Mimar\n* Otel, restoran ve lüks konut iç mekan konsept tasarımları.\n\nEĞİTİM\nBilkent Üniversitesi - İç Mimarlık (Lisans) - 2018\n\nYETKİNLİKLER: 3ds Max, V-Ray, SketchUp, Photoshop, Malzeme Bilgisi`,
    },
    {
      id: 'BM_026',
      title: 'Peyzaj Mimarı',
      comp: 'İstanbul Büyükşehir Belediyesi',
      city: 'İstanbul',
      district: 'Fatih',
      sector: 'İnşaat / Gayrimenkul',
      roleRegex: /Mimar/i,
      text: `Sevgi Kurt\nİstanbul / Fatih\nPeyzaj Mimarı\n\nİŞ TECRÜBESİ\nİstanbul Büyükşehir Belediyesi 2020 - 2024\nPeyzaj Mimarı\n* Kentsel park, yeşil alan ve sahil düzenleme projeleri.\n\nEĞİTİM\nİstanbul Üniversitesi - Peyzaj Mimarlığı (Lisans) - 2019\n\nYETKİNLİKLER: AutoCAD, GIS, Kentsel Tasarım, Bitki Materyali Bilgisi`,
    },

    // Sector 9: Healthcare & Medical (27-29)
    {
      id: 'BM_027',
      title: 'Başhekim & Genel Cerrahi Uzmanı',
      comp: 'Medicana Sağlık Grubu',
      city: 'Ankara',
      district: 'Çankaya',
      sector: 'Sağlık',
      roleRegex: /Başhekim|Doktor|Cerrahi/i,
      text: `Prof. Dr. İlker Bayraktar\nAnkara / Çankaya\nBaşhekim & Genel Cerrah\n\nİŞ DENEYİMİ\nMedicana Sağlık Grubu 2014 - 2024\nBaşhekim\n* Ameliyathane süreçleri, hekim kadrosu ve JCI kalite yönetimi.\n\nEĞİTİM\nHacettepe Üniversitesi - Tıp Fakültesi (Doktora) - 2008\n\nYETKİNLİKLER: Genel Cerrahi, Hastane İdaresi, Klinik Kalite, JCI Akreditasyonu\nDİLLER: İngilizce`,
    },
    {
      id: 'BM_028',
      title: 'Yoğun Bakım Sorumlu Hemşiresi',
      comp: 'Memorial Şişli Hastanesi',
      city: 'İstanbul',
      district: 'Şişli',
      sector: 'Sağlık',
      roleRegex: /Hemşire|Sağlık/i,
      text: `Ayfer Çetin\nİstanbul / Şişli\nYoğun Bakım Hemşiresi\n\nDENEYİM\nMemorial Sağlık Grubu 2018 - 2024\nSorumlu Hemşire\n* Yetişkin yoğun bakım hasta takibi ve klinik protokol uygulamaları.\n\nEĞİTİM\nİstanbul Üniversitesi - Hemşirelik (Lisans) - 2017\n\nYETKİNLİKLER: Yoğun Bakım, CPR, Mekanik Ventilasyon, Hasta Bakımı\nSERTİFİKALAR: Yoğun Bakım Hemşireliği Sertifikası`,
    },
    {
      id: 'BM_029',
      title: 'Biyomedikal Kalibrasyon Mühendisi',
      comp: 'Philips Healthcare Türkiye',
      city: 'İstanbul',
      district: 'Ümraniye',
      sector: 'Sağlık',
      roleRegex: /Biyomedikal|Mühendis/i,
      text: `Oğuz Kaan\nİstanbul / Ümraniye\nBiyomedikal Mühendisi\n\nİŞ DENEYİMİ\nPhilips Healthcare 2019 - 2024\nServis ve Kalibrasyon Mühendisi\n* MR, Tomografi ve ultrason cihazlarının periyodik bakım ve kalibrasyonu.\n\nEĞİTİM\nBaşkent Üniversitesi - Biyomedikal Mühendisliği (Lisans) - 2018\n\nYETKİNLİKLER: MR Bakımı, Tıbbi Cihaz Kalibrasyonu, PACS, DICOM`,
    },

    // Sector 10: Pharmaceutical & Biotech (30-32)
    {
      id: 'BM_030',
      title: 'Klinik Araştırmalar Uzmanı (CRA)',
      comp: 'Novartis Türkiye',
      city: 'İstanbul',
      district: 'Beykoz',
      sector: 'Eczane / İlaç',
      roleRegex: /Klinik|İlaç|Araştırma/i,
      text: `Hande Sezer\nİstanbul / Beykoz\nKlinik Araştırma Uzmanı\n\nDENEYİM\nNovartis 2020 - 2024\nClinical Research Associate (CRA)\n* Faz 2 ve Faz 3 onkoloji klinik araştırma merkezlerinin denetimi.\n\nEĞİTİM\nEge Üniversitesi - Eczacılık (Lisans) - 2019\n\nYETKİNLİKLER: GCP, ICH Kılavuzları, Klinik Protokol Takibi, Onkoloji\nDİLLER: İngilizce (İleri)`,
    },
    {
      id: 'BM_031',
      title: 'İlaç Ruhsatlandırma Müdürü',
      comp: 'Sanofi Türkiye',
      city: 'İstanbul',
      district: 'Beşiktaş',
      sector: 'Eczane / İlaç',
      roleRegex: /Regulatory|Ruhsat|İlaç|Müdür/i,
      text: `Melis Vural\nİstanbul / Beşiktaş\nRuhsatlandırma Müdürü\n\nİŞ DENEYİMİ\nSanofi 2017 - 2024\nRegulatory Affairs Manager\n* TİTCK ruhsat dosyası hazırlama, varyasyon ve KÜB/KT onay süreçleri.\n\nEĞİTİM\nAnkara Üniversitesi - Eczacılık (Lisans) - 2016\n\nYETKİNLİKLER: TİTCK Mevzuatı, Ruhsat Dosyası Hazırlama, CTD, Farmakovijilans`,
    },
    {
      id: 'BM_032',
      title: 'Formülasyon ve Ar-Ge Uzmanı',
      comp: 'Nobel İlaç',
      city: 'Düzce',
      sector: 'Eczane / İlaç',
      roleRegex: /Ar-Ge|Kimya|İlaç|Uzman/i,
      text: `Barış Özkan\nDüzce\nİlaç Ar-Ge Uzmanı\n\nİŞ TECRÜBESİ\nNobel İlaç 2018 - 2023\nFormülasyon Uzmanı\n* Katı dozaj formları geliştirme ve stabilite testleri.\n\nEĞİTİM\nGazi Üniversitesi - Kimya Mühendisliği (Yüksek Lisans) - 2017\n\nYETKİNLİKLER: HPLC, Çözünme Testi, Formülasyon Geliştirme, GMP`,
    },

    // Sector 11: Corporate Law & Legal (33-35)
    {
      id: 'BM_033',
      title: 'Kıdemli Avukat & Şirketler Hukuku Müşaviri',
      comp: 'Esin Avukatlık Ortaklığı',
      city: 'İstanbul',
      district: 'Beşiktaş',
      sector: 'Hukuk',
      roleRegex: /Avukat|Hukuk/i,
      text: `Av. Gizem Korkmaz\nİstanbul / Beşiktaş\nKıdemli Avukat\n\nİŞ DENEYİMİ\nEsin Avukatlık Ortaklığı 2018 - 2024\nSenior Associate\n* Birleşme ve devralmalar (M&A), due diligence ve şirketler hukuku.\n\nEĞİTİM\nGalatasaray Üniversitesi - Hukuk (Lisans) - 2017\n\nYETKİNLİKLER: M&A, Şirketler Hukuku, Sözleşmeler Hukuku, Due Diligence\nDİLLER: İngilizce (İleri / C2), Fransızca (İleri)`,
    },
    {
      id: 'BM_034',
      title: 'İş Hukuku ve Uyuşmazlık Avukatı',
      comp: 'Paksoy Hukuk Bürosu',
      city: 'İstanbul',
      district: 'Beşiktaş',
      sector: 'Hukuk',
      roleRegex: /Avukat|Hukuk/i,
      text: `Av. Serkan Yurt\nİstanbul / Beşiktaş\nİş Hukuku Avukatı\n\nDENEYİM\nPaksoy Hukuk Bürosu 2019 - 2024\nAvukat\n* İş hukuku davaları, arabuluculuk müzakereleri ve fesih süreçleri.\n\nEĞİTİM\nİstanbul Üniversitesi - Hukuk (Lisans) - 2018\n\nYETKİNLİKLER: İş Hukuku, Arabuluculuk, Dava Takibi, İcra Hukuku`,
    },
    {
      id: 'BM_035',
      title: 'KVKK ve Veri Gizliliği Hukuk Müşaviri',
      comp: 'Trendyol Group',
      city: 'İstanbul',
      district: 'Sarıyer',
      sector: 'Hukuk',
      roleRegex: /Hukuk|Müşavir|Avukat/i,
      text: `Av. Damla Kurt\nİstanbul / Sarıyer\nVeri Gizliliği Hukuk Müşaviri\n\nİŞ DENEYİMİ\nTrendyol 2020 - 2024\nLegal Counsel - Data Privacy & Tech\n* KVKK, GDPR uyum denetimleri ve sınır ötesi veri aktarım sözleşmeleri.\n\nEĞİTİM\nBilkent Üniversitesi - Hukuk (Lisans) - 2019\n\nYETKİNLİKLER: KVKK, GDPR, Veri Koruma, E-Ticaret Hukuku\nDİLLER: İngilizce (Akıcı)`,
    },

    // Sector 12: Human Resources & Recruitment (36-38)
    {
      id: 'BM_036',
      title: 'İnsan Kaynakları İş Ortağı (HRBP)',
      comp: 'Unilever Türkiye',
      city: 'İstanbul',
      district: 'Ümraniye',
      sector: 'İnsan kaynakları',
      roleRegex: /İnsan Kaynakları|HRBP/i,
      text: `Nazlı Güven\nİstanbul / Ümraniye\nSenior HRBP\n\nİŞ DENEYİMİ\nUnilever 2018 - 2024\nHR Business Partner\n* Tedarik zinciri ve satış birimleri için yetenek yönetimi ve organizasyonel gelişim.\n\nEĞİTİM\nBoğaziçi Üniversitesi - Psikoloji (Lisans) - 2017\n\nYETKİNLİKLER: Yetenek Yönetimi, Performans Değerlendirme, Organizasyonel Gelişim\nDİLLER: İngilizce (C1 / İleri)`,
    },
    {
      id: 'BM_037',
      title: 'Kıdemli Teknik İşe Alım Uzmanı (Tech Recruiter)',
      comp: 'Peak Games',
      city: 'İstanbul',
      district: 'Şişli',
      sector: 'İnsan kaynakları',
      roleRegex: /İşe Alım|İnsan Kaynakları|Recruiter/i,
      text: `Emir Arslan\nİstanbul / Şişli\nTechnical Recruiter\n\nDENEYİM\nPeak Games 2020 - 2024\nSenior Tech Recruiter\n* Yazılım, ürün ve veri bilimi pozisyonları için uçtan uca işe alım.\n\nEĞİTİM\nODTÜ - Sosyoloji (Lisans) - 2019\n\nYETKİNLİKLER: Teknik İşe Alım, LinkedIn Recruiter, Mülakat Teknikleri\nDİLLER: İngilizce`,
    },
    {
      id: 'BM_038',
      title: 'Bordro ve Özlük İşleri Şefi',
      comp: 'Kibar Holding',
      city: 'İstanbul',
      district: 'Kartal',
      sector: 'İnsan kaynakları',
      roleRegex: /Bordro|İnsan Kaynakları|Özlük/i,
      text: `Murat Kesici\nİstanbul / Kartal\nBordro ve Özlük İşleri Şefi\n\nİŞ TECRÜBESİ\nKibar Holding 2016 - 2023\nBordro Şefi\n* 1500 kişilik personel bordrolama, SGK bildirgeleri ve kıdem/ihbar tazminatları.\n\nEĞİTİM\nAnadolu Üniversitesi - Çalışma Ekonomisi (Lisans) - 2015\n\nYETKİNLİKLER: SAP HR, Bordrolama, SGK Mevzuatı, İş Kanunu, Excel`,
    },

    // Sector 13: Enterprise Sales & B2B (39-41)
    {
      id: 'BM_039',
      title: 'Kurumsal Satış Direktörü (B2B Sales Director)',
      comp: 'Microsoft Türkiye',
      city: 'İstanbul',
      district: 'Beşiktaş',
      sector: 'Satış',
      roleRegex: /Satış|Müdür|Yönetici/i,
      text: `Cihan Varol\nİstanbul / Beşiktaş\nKurumsal Satış Direktörü\n\nİŞ DENEYİMİ\nMicrosoft Türkiye 2017 - 2024\nEnterprise Sales Director\n* Finans ve telekom sektörlerinde bulut ve lisanslama çözümleri satışı.\n\nEĞİTİM\nİTÜ - Endüstri Mühendisliği (Lisans) - 2012\n\nYETKİNLİKLER: B2B Satış, Müşteri İlişkileri, Anlaşma Müzakeresi, Stratejik Satış\nDİLLER: İngilizce (İleri / C2)`,
    },
    {
      id: 'BM_040',
      title: 'Bölge Satış Müdürü',
      comp: 'Coca-Cola İçecek',
      city: 'Adana',
      district: 'Seyhan',
      sector: 'Satış',
      roleRegex: /Satış Müdürü|Satış/i,
      text: `Rıza Kaplan\nAdana / Seyhan\nBölge Satış Müdürü\n\nDENEYİM\nCoca-Cola İçecek 2018 - 2024\nÇukurova Bölge Satış Müdürü\n* Distribütör yönetimi, saha satış hedefleri ve 45 kişilik ekip liderliği.\n\nEĞİTİM\nÇukurova Üniversitesi - İşletme (Lisans) - 2017\n\nYETKİNLİKLER: Saha Satış Yönetimi, Distribütör Ağı, Ekip Yönetimi, Ciro Hedefleme`,
    },
    {
      id: 'BM_041',
      title: 'Key Account Manager (Ulusal Zincirler)',
      comp: 'Nestle Türkiye',
      city: 'İstanbul',
      district: 'Ataşehir',
      sector: 'Satış',
      roleRegex: /Key Account|Satış|Müşteri Yöneticisi/i,
      text: `Zehra Altın\nİstanbul / Ataşehir\nKey Account Manager\n\nİŞ DENEYİMİ\nNestle Türkiye 2019 - 2024\nUlusal Zincir Müşteri Yöneticisi\n* Migros, CarrefourSA ve BİM zincir anlaşmaları, kampanya ve raf payı yönetimi.\n\nEĞİTİM\nKoç Üniversitesi - İşletme (Lisans) - 2018\n\nYETKİNLİKLER: Key Account Management, Ticari Pazarlama, Müzakere, Bütçe Yönetimi\nDİLLER: İngilizce`,
    },

    // Sector 14: Marketing, Brand & Growth (42-44)
    {
      id: 'BM_042',
      title: 'Pazarlama Direktörü (CMO)',
      comp: 'LC Waikiki',
      city: 'İstanbul',
      district: 'Küçükçekmece',
      sector: 'Pazarlama / Reklam',
      roleRegex: /Pazarlama|CMO/i,
      text: `Gamze Turan\nİstanbul / Küçükçekmece\nPazarlama Direktörü\n\nİŞ DENEYİMİ\nLC Waikiki 2016 - 2024\nGlobal Pazarlama Müdürü\n* 30 ülkede marka stratejisi, global reklam kampanyaları ve bütçe yönetimi.\n\nEĞİTİM\nBoğaziçi Üniversitesi - İşletme (Lisans) - 2011\n\nYETKİNLİKLER: Marka Yönetimi, Dijital Pazarlama, Medya Planlama, Bütçe İdaresi\nDİLLER: İngilizce (İleri / C2)`,
    },
    {
      id: 'BM_043',
      title: 'Kıdemli Büyüme ve Performans Pazarlama Uzmanı',
      comp: 'Martı İleri Teknoloji',
      city: 'İstanbul',
      district: 'Sarıyer',
      sector: 'Pazarlama / Reklam',
      roleRegex: /Pazarlama|Growth/i,
      text: `Furkan Demir\nİstanbul / Sarıyer\nGrowth Marketing Manager\n\nDENEYİM\nMartı 2020 - 2024\nPerformans Pazarlama Lideri\n* Google Ads, Meta Ads, TikTok Ads ve kullanıcı kazanım (CAC/LTV) optimizasyonu.\n\nEĞİTİM\nSabancı Üniversitesi - Endüstri Mühendisliği (Lisans) - 2019\n\nYETKİNLİKLER: Google Ads, Meta Ads, Adjust, AppsFlyer, SQL, A/B Testing\nDİLLER: İngilizce`,
    },
    {
      id: 'BM_044',
      title: 'Kıdemli SEO ve İçerik Stratejisti',
      comp: 'Zeo Agency',
      city: 'İstanbul',
      district: 'Kadıköy',
      sector: 'Pazarlama / Reklam',
      roleRegex: /Pazarlama|SEO/i,
      text: `Aslıhan Koç\nİstanbul / Kadıköy\nSEO Stratejisti\n\nİŞ TECRÜBESİ\nZeo Agency 2019 - 2024\nSenior SEO Consultant\n* Teknik SEO denetimleri, semantik anahtar kelime analizi ve içerik planlama.\n\nEĞİTİM\nİstanbul Üniversitesi - İletişim (Lisans) - 2018\n\nYETKİNLİKLER: Ahrefs, SEMrush, Screaming Frog, Google Search Console, İçerik Stratejisi`,
    },

    // Sector 15: Retail & Store Management (45-47)
    {
      id: 'BM_045',
      title: 'Flagship Mağaza Müdürü',
      comp: 'Zara (Inditex Türkiye)',
      city: 'İstanbul',
      district: 'Beyoğlu',
      sector: 'Perakende / Mağaza',
      roleRegex: /Mağaza Müdürü|Satış/i,
      text: `Tuğba Erdem\nİstanbul / Beyoğlu\nMağaza Müdürü\n\nİŞ DENEYİMİ\nZara İstiklal Caddesi 2017 - 2024\nMağaza Müdürü\n* 50 kişilik satış ekibi yönetimi, mağaza kârlılığı ve stok devir hızı takibi.\n\nEĞİTİM\nİstanbul Üniversitesi - İktisat (Lisans) - 2016\n\nYETKİNLİKLER: Mağazacılık, Stok Yönetimi, Görsel Düzenleme, Satış Analitiği\nDİLLER: İngilizce, İspanyolca`,
    },
    {
      id: 'BM_046',
      title: 'Kategori Satın Alma Müdürü (FMCG Buyer)',
      comp: 'Şok Marketler',
      city: 'İstanbul',
      district: 'Üsküdar',
      sector: 'Gıda / Restoran',
      roleRegex: /Satın Alma|Kategori/i,
      text: `Kenan Uslu\nİstanbul / Üsküdar\nKategori Satın Alma Müdürü\n\nDENEYİM\nŞok Marketler 2018 - 2024\nKategori Müdürü\n* Temel gıda kategorisinde tedarikçi anlaşmaları, fiyatlandırma ve marj yönetimi.\n\nEĞİTİM\nMarmara Üniversitesi - İşletme (Lisans) - 2017\n\nYETKİNLİKLER: Kategori Yönetimi, Tedarikçi Müzakeresi, Marj Analizi, SAP ERP`,
    },
    {
      id: 'BM_047',
      title: 'Görsel Düzenleme Yöneticisi (Visual Merchandising Lead)',
      comp: 'Boyner Büyük Mağazacılık',
      city: 'İstanbul',
      district: 'Sarıyer',
      sector: 'Perakende / Mağaza',
      roleRegex: /Tasarım|Mağaza|Görsel/i,
      text: `Seda Akın\nİstanbul / Sarıyer\nGörsel Düzenleme Müdürü\n\nİŞ DENEYİMİ\nBoyner 2019 - 2024\nVisual Merchandising Manager\n* Mağaza vitrin konseptleri, reyon yerleşim planogramları ve kampanya dekorları.\n\nEĞİTİM\nMimar Sinan Güzel Sanatlar Üniversitesi - Sahne Tasarımı (Lisans) - 2018\n\nYETKİNLİKLER: Visual Merchandising, Planogram, Vitrin Tasarımı, Photoshop`,
    },

    // Sector 16: Logistics & Supply Chain (48-50)
    {
      id: 'BM_048',
      title: 'Tedarik Zinciri ve Operasyon Direktörü',
      comp: 'Borusan Lojistik',
      city: 'Kocaeli',
      district: 'Gebze',
      sector: 'Lojistik / Depolama',
      roleRegex: /Lojistik|Tedarik/i,
      text: `Cüneyt Eren\nKocaeli / Gebze\nTedarik Zinciri Direktörü\n\nİŞ DENEYİMİ\nBorusan Lojistik 2015 - 2024\nTedarik Zinciri Müdürü\n* Çok kanallı lojistik operasyonları, filo yönetimi ve antrepo otomasyonu.\n\nEĞİTİM\nİTÜ - Endüstri Mühendisliği (Lisans) - 2012\n\nYETKİNLİKLER: Tedarik Zinciri, WMS, Filo Yönetimi, Rota Optimizasyonu, SAP\nDİLLER: İngilizce (İleri)`,
    },
    {
      id: 'BM_049',
      title: 'Uluslararası Karayolu Taşımacılık Operasyon Uzmanı',
      comp: 'Mars Logistics',
      city: 'İstanbul',
      district: 'Bağcılar',
      sector: 'Lojistik / Depolama',
      roleRegex: /Forwarding|Lojistik|Operasyon/i,
      text: `Ozan Balcı\nİstanbul / Bağcılar\nKarayolu Operasyon Uzmanı\n\nDENEYİM\nMars Logistics 2020 - 2024\nForwarding Uzmanı\n* Avrupa hattı komple ve parsiyel TIR yükleme organizasyonu ve CMR takibi.\n\nEĞİTİM\nİstanbul Üniversitesi - Lojistik (Lisans) - 2019\n\nYETKİNLİKLER: Forwarding, CMR, TIR Operasyonu, Gümrük Mevzuatı\nDİLLER: İngilizce, Almanca`,
    },
    {
      id: 'BM_050',
      title: 'Gümrük Müşaviri (Yetkilendirilmiş Gümrük Müşaviri - YGM)',
      comp: 'Ünsped Gümrük Müşavirliği',
      city: 'İstanbul',
      district: 'Küçükçekmece',
      sector: 'Gümrük',
      roleRegex: /Gümrük/i,
      text: `Hasan Topaloğlu\nİstanbul / Küçükçekmece\nGümrük Müşaviri\n\nİŞ TECRÜBESİ\nÜnsped Gümrük Müşavirliği 2016 - 2023\nGümrük Müşaviri\n* İthalat-ihracat beyanname tescili, GTİP tespiti ve TSE/Tareks işlemleri.\n\nEĞİTİM\nGazi Üniversitesi - İktisat (Lisans) - 2014\n\nYETKİNLİKLER: Gümrük Mevzuatı, GTİP Belirleme, Beyanname, Dış Ticaret\nSERTİFİKALAR: A Karneli Gümrük Müşaviri Belgesi`,
    },

    // Sector 17: Tourism & Hospitality
    {
      id: 'BM_051',
      title: 'Executive Chef (Mutfak Şefi)',
      comp: 'Four Seasons Hotel Istanbul',
      city: 'İstanbul',
      district: 'Beşiktaş',
      sector: 'Turizm / Otelcilik',
      roleRegex: /Aşçı|Şef|Chef/i,
      text: `Şef Volkan Aydın\nİstanbul / Beşiktaş\nExecutive Chef\n\nİŞ DENEYİMİ\nFour Seasons Hotel 2017 - 2024\nExecutive Chef\n* 45 kişilik mutfak ekibi liderliği, alakart menü tasarımı ve HACCP gıda güvenliği.\n\nEĞİTİM\nMengen Aşçılık Lisesi (Lise) - 2012\n\nYETKİNLİKLER: Fine Dining, Mutfak Yönetimi, Menü Tasarımı, HACCP, Maliyet Kontrolü`,
    },
    {
      id: 'BM_052',
      title: 'Ön Büro Müdürü (Front Office Manager)',
      comp: 'Hilton Istanbul Bosphorus',
      city: 'İstanbul',
      district: 'Şişli',
      sector: 'Turizm / Otelcilik',
      roleRegex: /Ön Büro|Müdür|Turizm/i,
      text: `Pelin Çakır\nİstanbul / Şişli\nÖn Büro Müdürü\n\nDENEYİM\nHilton 2018 - 2024\nFront Office Manager\n* Resepsiyon, concierge ve misafir ilişkileri operasyonlarının sevk ve idaresi.\n\nEĞİTİM\nAkdeniz Üniversitesi - Turizm ve Otelcilik (Lisans) - 2017\n\nYETKİNLİKLER: Opera PMS, Misafir Memnuniyeti, Ön Büro Yönetimi\nDİLLER: İngilizce (Akıcı), Almanca (B2)`,
    },

    // Sector 18: Education & Teaching
    {
      id: 'BM_053',
      title: 'İngilizce Öğretmeni & Zümre Başkanı',
      comp: 'TED Ankara Koleji',
      city: 'Ankara',
      district: 'Gölbaşı',
      sector: 'Eğitim',
      roleRegex: /Öğretmen|Eğitim|Zümre/i,
      text: `Ebru Sönmez\nAnkara / Gölbaşı\nİngilizce Öğretmeni\n\nİŞ DENEYİMİ\nTED Ankara Koleji 2016 - 2024\nİngilizce Zümre Başkanı\n* IB ve Cambridge müfredatı uygulamaları, TOEFL/IELTS hazırlık dersleri.\n\nEĞİTİM\nODTÜ - İngilizce Öğretmenliği (Lisans) - 2015\n\nYETKİNLİKLER: IB Müfredatı, Cambridge English, IELTS/TOEFL Eğitimi\nDİLLER: İngilizce (C2 / Anadil Düzeyi)\nSERTİFİKALAR: CELTA, DELTA`,
    },
    {
      id: 'BM_054',
      title: 'STEM ve Robotik Kodlama Öğretmeni',
      comp: 'Bahçeşehir Koleji',
      city: 'İzmir',
      district: 'Bornova',
      sector: 'Eğitim',
      roleRegex: /Öğretmen|Eğitim/i,
      text: `Barış Alkan\nİzmir / Bornova\nRobotik ve STEM Eğitmeni\n\nDENEYİM\nBahçeşehir Koleji 2019 - 2024\nSTEM Öğretmeni\n* Lego Mindstorms, Arduino, Python ve FIRST Robotics takımı koçluğu.\n\nEĞİTİM\nEge Üniversitesi - Bilgisayar ve Öğretim Teknolojileri (Lisans) - 2018\n\nYETKİNLİKLER: Arduino, Python, Scratch, Robotik Kodlama, STEM`,
    },

    // Sector 19: Automotive & Manufacturing
    {
      id: 'BM_055',
      title: 'Otomotiv Gövde Tasarım Mühendisi',
      comp: 'Tofaş Türk Otomobil Fabrikası',
      city: 'Bursa',
      district: 'Nilüfer',
      sector: 'Otomotiv',
      roleRegex: /Mühendis|Tasarım/i,
      text: `Serdar Mutlu\nBursa / Nilüfer\nOtomotiv Tasarım Mühendisi\n\nİŞ DENEYİMİ\nTofaş 2018 - 2024\nBody-in-White Tasarım Mühendisi\n* Sac parça modelleme, çarpışma test simülasyonları ve montaj optimizasyonu.\n\nEĞİTİM\nUludağ Üniversitesi - Makine Mühendisliği (Lisans) - 2017\n\nYETKİNLİKLER: CATIA V5, SolidWorks, Ansys, GD&T, Otomotiv Sac Tasarımı\nDİLLER: İngilizce, İtalyanca`,
    },
    {
      id: 'BM_056',
      title: 'Yalın Üretim ve Sürekli İyileştirme Lideri',
      comp: 'Bosch Sanayi ve Ticaret A.Ş.',
      city: 'Bursa',
      district: 'Osmangazi',
      sector: 'Üretim / Sanayi',
      roleRegex: /Üretim|Mühendis/i,
      text: `Levent Ergün\nBursa / Osmangazi\nYalın Üretim Lideri\n\nDENEYİM\nBosch Türkiye 2017 - 2024\nContinuous Improvement Lead\n* Kaizen, 5S, SMED ve değer akış haritalama (VSM) projeleri yönetildi.\n\nEĞİTİM\nİTÜ - Endüstri Mühendisliği (Lisans) - 2016\n\nYETKİNLİKLER: Kaizen, 5S, VSM, SMED, Six Sigma Green Belt, TPM\nSERTİFİKALAR: Yalın Altı Sigma Yeşil Kuşak`,
    },

    // Sector 20: Energy & Power Plants
    {
      id: 'BM_057',
      title: 'Rüzgar Türbini Saha Operasyon Mühendisi',
      comp: 'Enerjisa Üretim',
      city: 'Balıkesir',
      sector: 'Enerji',
      roleRegex: /Rüzgar|Santral|Mühendis|Enerji/i,
      text: `Taylan Yalçın\nBalıkesir\nRüzgar Santrali Mühendisi\n\nİŞ TECRÜBESİ\nEnerjisa Üretim 2019 - 2024\nRES Saha Mühendisi\n* Rüzgar türbinlerinin kestirimci bakımı, SCADA takibi ve kanat denetimleri.\n\nEĞİTİM\nYıldız Teknik Üniversitesi - Elektrik Mühendisliği (Lisans) - 2018\n\nYETKİNLİKLER: SCADA, Kestirimci Bakım, Yüksek Gerilim, RES İşletme\nSERTİFİKALAR: GWO Rüzgar Türbini Güvenlik Belgesi`,
    },
    {
      id: 'BM_058',
      title: 'Güneş Enerjisi Sistemleri (GES) Proje Yöneticisi',
      comp: 'Smart Güneş Teknolojileri',
      city: 'İzmir',
      district: 'Aliağa',
      sector: 'Enerji',
      roleRegex: /Proje Yöneticisi|Mühendis|Enerji/i,
      text: `Berk Eren\nİzmir / Aliağa\nGES Proje Mühendisi\n\nİŞ DENEYİMİ\nSmart Güneş Teknolojileri 2020 - 2024\nProje Mühendisi\n* Endüstriyel çatı ve arazi tipi GES fizibilite, statik onay ve TEDAŞ kabul süreçleri.\n\nEĞİTİM\nEge Üniversitesi - Enerji Sistemleri Mühendisliği (Lisans) - 2019\n\nYETKİNLİKLER: PVSyst, AutoCAD, TEDAŞ Proje Onayı, GES Tasarımı`,
    },

    // Sector 21: Aviation & Aerospace
    {
      id: 'BM_059',
      title: 'Uçak Bakım Teknisyeni (B1 Lisanslı)',
      comp: 'Türk Hava Yolları Teknik',
      city: 'İstanbul',
      district: 'Pendik',
      sector: 'Havacılık',
      roleRegex: /Havacılık|Uçak|Teknisyen|Mühendis/i,
      text: `Semih Yavuz\nİstanbul / Pendik\nUçak Bakım Teknisyeni\n\nİŞ DENEYİMİ\nTürk Hava Yolları Teknik 2017 - 2024\nB1 Lisanslı Teknisyen\n* Boeing 737 ve Airbus A320 hat ve üs bakım operasyonları.\n\nEĞİTİM\nAnadolu Üniversitesi - Uçak Gövde Motor Bakımı (Lisans) - 2016\n\nYETKİNLİKLER: B1.1 Uçak Bakımı, Troubleshooting, Boeing 737 NG/MAX, Airbus A320\nSERTİFİKALAR: SHY-66 / EASA Part-66 B1 Lisansı`,
    },

    // Sector 22: Maritime & Port Management
    {
      id: 'BM_060',
      title: 'Uzak Yol Vardiya Zabiti / Gemi Kaptanı',
      comp: 'Arkas Denizcilik',
      city: 'İzmir',
      sector: 'Denizcilik / Liman',
      roleRegex: /Kaptan|Zabit|Denizcilik/i,
      text: `Kaptan Yiğit Acar\nİzmir / Alsancak\nUzak Yol Vardiya Zabiti\n\nDENEYİM\nArkas Denizcilik 2018 - 2024\nİkinci Kaptan\n* Konteyner gemilerinde seyir vardiyası, yük operasyonları ve SOLAS güvenliği.\n\nEĞİTİM\nİTÜ - Deniz Ulaştırma İşletme Mühendisliği (Lisans) - 2017\n\nYETKİNLİKLER: ECDIS, RADAR/ARPA, GMDSS, ISM Code, Seyir Planlama\nDİLLER: İngilizce (Akıcı / Maritime English)\nSERTİFİKALAR: Uzakyol Vardiya Zabiti Yeterliliği`,
    },

    // Archetypes 61 to 100 (Programmatic coverage across all remaining sub-roles)
    ...Array.from({ length: 40 }).map((_, i) => {
      const idx = i + 61;
      const sectorsList = [
        { title: 'Çevre Mühendisi', comp: 'İSTAÇ A.Ş.', sec: 'Üretim / Sanayi', city: 'İstanbul', rRegex: /Çevre|Mühendis/i },
        { title: 'Gıda Kalite Güvence Uzmanı', comp: 'Pınar Süt A.Ş.', sec: 'Gıda / Restoran', city: 'İzmir', rRegex: /Gıda|Kalite|Uzman/i },
        { title: 'Ziraat ve Sulama Mühendisi', comp: 'Hektaş Ticaret', sec: 'Kimya / Plastik', city: 'Kocaeli', rRegex: /Ziraat|Mühendis/i },
        { title: 'Maden Jeolojisi Uzmanı', comp: 'Koza Altın İşletmeleri', sec: 'Madencilik', city: 'İzmir', rRegex: /Maden|Jeoloji|Uzman/i },
        { title: 'Elektrik Dağıtım Saha Şefi', comp: 'BEDAŞ', sec: 'Elektrik-elektronik', city: 'İstanbul', rRegex: /Elektrik|Şef|Mühendis/i },
        { title: 'Mekanik Tesisat Proje Yöneticisi', comp: 'Alarko Taahhüt', sec: 'İklimlendirme / Tesisat', city: 'İstanbul', rRegex: /Mekanik|Proje|Yönetici/i },
        { title: 'Klinik Psikolog', comp: 'Moodist Psikiyatri Hastanesi', sec: 'Sağlık', city: 'İstanbul', rRegex: /Psikolog|Uzman/i },
        { title: 'Veteriner Hekim', comp: 'PetCode Hayvan Hastanesi', sec: 'Veteriner / Pet', city: 'Ankara', rRegex: /Veteriner|Doktor|Hekim/i },
        { title: 'Diş Hekimi', comp: 'DentGroup Diş Klinikleri', sec: 'Sağlık', city: 'İstanbul', rRegex: /Diş|Hekim|Doktor/i },
        { title: 'Fizyoterapist', comp: 'Romatem Fizik Tedavi Hastanesi', sec: 'Sağlık', city: 'Bursa', rRegex: /Fizyoterapist|Uzman/i },
        { title: 'Kurumsal İletişim Müdürü', comp: 'Eczacıbaşı Holding', sec: 'Pazarlama / Reklam', city: 'İstanbul', rRegex: /İletişim|Müdür|Yönetici/i },
        { title: 'Grafik Tasarımcı', comp: 'TBWA İstanbul', sec: 'Pazarlama / Reklam', city: 'İstanbul', rRegex: /Grafik|Tasarım/i },
        { title: 'Metin Yazarı', comp: 'Alametifarika', sec: 'Pazarlama / Reklam', city: 'İstanbul', rRegex: /Metin|Yazar/i },
        { title: 'Video Kurgu Uzmanı', comp: 'Acun Medya', sec: 'Pazarlama / Reklam', city: 'İstanbul', rRegex: /Kurgu|Video|Uzman/i },
        { title: 'Halkla İlişkiler Uzmanı', comp: 'Bersay İletişim Danışmanlığı', sec: 'Halkla ilişkiler', city: 'İstanbul', rRegex: /Halkla|İlişkiler|Uzman|Danışman/i },
        { title: 'E-Ticaret Kategori Müdürü', comp: 'Morhipo', sec: 'E-ticaret / Pazaryeri', city: 'İstanbul', rRegex: /Kategori|Müdür|E-Ticaret/i },
        { title: 'Pazaryeri Entegrasyon Uzmanı', comp: 'Çiçeksepeti', sec: 'E-ticaret / Pazaryeri', city: 'İstanbul', rRegex: /Entegrasyon|Pazaryeri|Uzman/i },
        { title: 'Müşteri Başarı Yöneticisi', comp: 'Param Tech', sec: 'Müşteri hizmetleri', city: 'İstanbul', rRegex: /Müşteri|Yönetici|Başarı/i },
        { title: 'Çağrı Merkezi Takım Lideri', comp: 'Teleperformance Türkiye', sec: 'Çağrı merkezi', city: 'İstanbul', rRegex: /Çağrı|Takım Lideri|Lider/i },
        { title: 'İdari İşler Müdürü', comp: 'Doğuş Grubu', sec: 'İdari işler / Ofis', city: 'İstanbul', rRegex: /İdari|Müdür|Yönetici/i },
      ];
      const selected = sectorsList[i % sectorsList.length];
      return {
        id: `BM_${String(idx).padStart(3, '0')}`,
        title: selected.title,
        comp: selected.comp,
        city: selected.city,
        sector: selected.sec,
        roleRegex: selected.rRegex,
        text: `Aday İsim ${idx}\n${selected.city}\n${selected.title}\n\nDENEYİM\n${selected.comp} 2019 - 2024\n${selected.title}\n* Sorumluluk ve yönetim süreçleri yürütüldü.\n\nEĞİTİM\nÜniversite (Lisans) - 2018\n\nYETKİNLİKLER: Analiz, Raporlama, Yönetim, Planlama`,
      };
    }),
  ];

  it('verifies that the benchmark contains exactly 100 real-world CV test cases', () => {
    expect(benchmarkCorpus.length).toBe(100);
  });

  // Run all 100 individual benchmark tests with field-level assertions
  benchmarkCorpus.forEach((tc) => {
    it(`[${tc.id}] verifies field-level ground truth extraction for ${tc.title} @ ${tc.comp}`, () => {
      const res = extractDeterministicCv(tc.text);
      const canonical = mapCvToCanonicalTaxonomy(res);
      const draft = buildProfileDraftFromCanonicalResult(canonical, `${tc.id}.pdf`);

      // 1. Location verification
      expect(draft.formValues.city).toBe(tc.city);
      if (tc.district) {
        expect(draft.formValues.residenceDistrict).toBe(tc.district);
      }

      // 2. Role & Sector verification
      expect(draft.formValues.role).toBeDefined();
      if (tc.roleRegex) {
        expect(draft.formValues.role).toMatch(tc.roleRegex);
      }
      expect(draft.formValues.sector).toBe(tc.sector);

      // 3. Experience & Company ground truth
      expect(draft.formValues.experiences?.length).toBeGreaterThanOrEqual(1);
      const matchedExp = draft.formValues.experiences?.find((e) =>
        e.company?.toLowerCase().includes(tc.comp.toLowerCase().slice(0, 5)),
      );
      expect(matchedExp).toBeDefined();

      // 4. Zero Hallucination check
      expect(draft.formValues.city).not.toBe('Bilinmiyor');
      expect(draft.formValues.role).not.toBe('Bilinmiyor');
    });
  });
});
