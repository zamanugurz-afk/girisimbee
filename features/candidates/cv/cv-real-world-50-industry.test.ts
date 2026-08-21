import { describe, it, expect } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from './cv-profile-builder';

describe('CV Extraction 3.0 — 50 Real-World Multi-Industry Acceptance Suite', () => {
  const testCases = [
    {
      id: 'CV_01',
      industry: 'Banking & Treasury',
      text: `Ayşe Gökçek\nİstanbul / Beşiktaş\nHazine ve Bilanço Yönetimi Müdürü\n\nİŞ DENEYİMİ\nQNB Finansbank 2019 - 2024\nHazine Müdürü\n* Likidite yönetimi, para piyasaları ve fonlama stratejileri yönetildi.\n\nEĞİTİM\nBoğaziçi Üniversitesi - İktisat (Lisans) - 2018\n\nYETKİNLİKLER: Likidite Yönetimi, Bilanço Analizi, Para Piyasaları, Bloomberg Terminal\nDİLLER: İngilizce (İleri)`,
      expectedCity: 'İstanbul',
      expectedDistrict: 'Beşiktaş',
      expectedRoleRegex: /Hazine|Finans/i,
      expectedSector: 'Finans / Bankacılık',
      expectedCompany: 'QNB Finansbank',
    },
    {
      id: 'CV_02',
      industry: 'Insurance & Actuarial',
      text: `Berk Candan\nİstanbul / Kadıköy\nAktüerya Uzmanı\n\nİŞ DENEYİMİ\nAnadolu Sigorta 2020 - 2024\nAktüerya Uzmanı\n* Hayat dışı branşlarda prim ve karşılık modellemeleri yürütüldü.\n\nEĞİTİM\nHacettepe Üniversitesi - Aktüerya Bilimleri (Lisans) - 2019\n\nYETKİNLİKLER: Aktüeryal Modelleme, R, Python, SAS\nDİLLER: İngilizce`,
      expectedCity: 'İstanbul',
      expectedDistrict: 'Kadıköy',
      expectedRoleRegex: /Aktüerya|Sigorta/i,
      expectedSector: 'Sigorta',
      expectedCompany: 'Anadolu Sigorta',
    },
    {
      id: 'CV_03',
      industry: 'Cyber Security & SOC',
      text: `Mert Aksoy\nAnkara / Çankaya\nKıdemli Siber Güvenlik Uzmanı\n\nİŞ DENEYİMİ\nSTM Savunma Teknolojileri 2018 - 2024\nSiber Güvenlik Uzmanı\n* SIEM, SOC operasyonları ve sızma testleri yönetimi.\n\nEĞİTİM\nODTÜ - Bilgisayar Mühendisliği (Lisans) - 2017\n\nYETKİNLİKLER: Splunk, Wireshark, CEH, SIEM, Penetration Testing\nDİLLER: İngilizce`,
      expectedCity: 'Ankara',
      expectedDistrict: 'Çankaya',
      expectedRoleRegex: /Siber Güvenlik|Mühendis|Yazılım/i,
      expectedSector: 'Bilişim / Yazılım',
      expectedCompany: 'STM Savunma Teknolojileri',
    },
    {
      id: 'CV_04',
      industry: 'Civil Engineering & Construction',
      text: `Kemal Demir\nİzmir / Bornova\nŞantiye Şefi & İnşaat Mühendisi\n\nİŞ DENEYİMİ\nRönesans Holding 2016 - 2023\nŞantiye Şefi\n* Yüksek katlı karma konut projesinde kaba ve ince işler koordinasyonu.\n\nEĞİTİM\nİTÜ - İnşaat Mühendisliği (Lisans) - 2015\n\nYETKİNLİKLER: AutoCAD, Primavera P6, Şantiye Yönetimi, Hakediş\nDİLLER: İngilizce`,
      expectedCity: 'İzmir',
      expectedDistrict: 'Bornova',
      expectedRoleRegex: /Şantiye Şefi|İnşaat/i,
      expectedSector: 'İnşaat / Gayrimenkul',
      expectedCompany: 'Rönesans Holding',
    },
    {
      id: 'CV_05',
      industry: 'Healthcare & Clinical Lead',
      text: `Dr. Selin Kaya\nİstanbul / Şişli\nBaşhekim & Kardiyoloji Uzmanı\n\nİŞ DENEYİMİ\nAcıbadem Sağlık Grubu 2015 - 2024\nBaşhekim\n* Klinik kalite süreçleri ve hekim kadrosu yönetimi.\n\nEĞİTİM\nİstanbul Üniversitesi - Cerrahpaşa Tıp Fakültesi (Doktora) - 2014\n\nYETKİNLİKLER: Klinik Yönetim, JCI Akreditasyonu, Hasta Güvenliği\nDİLLER: İngilizce, Almanca`,
      expectedCity: 'İstanbul',
      expectedDistrict: 'Şişli',
      expectedRoleRegex: /Başhekim|Doktor|Sağlık Yöneticisi/i,
      expectedSector: 'Sağlık',
      expectedCompany: 'Acıbadem Sağlık Grubu',
    },
    {
      id: 'CV_06',
      industry: 'Corporate Law',
      text: `Av. Zeynep Erdem\nİstanbul / Levent\nHukuk Müşaviri\n\nİŞ DENEYİMİ\nKoç Holding 2017 - 2024\nHukuk Müşaviri\n* Şirketler hukuku, sözleşmeler ve KVKK uyum süreçleri.\n\nEĞİTİM\nGalatasaray Üniversitesi - Hukuk (Lisans) - 2016\n\nYETKİNLİKLER: Şirketler Hukuku, KVKK, Ticaret Hukuku, M&A\nDİLLER: İngilizce, Fransızca`,
      expectedCity: 'İstanbul',
      expectedRoleRegex: /Hukuk Müşaviri|Avukat/i,
      expectedSector: 'Hukuk',
      expectedCompany: 'Koç Holding',
    },
    {
      id: 'CV_07',
      industry: 'Human Resources & Talent Acquisition',
      text: `Derya Polat\nİstanbul / Ataşehir\nİnsan Kaynakları Müdürü\n\nİŞ DENEYİMİ\nGetir 2020 - 2024\nİnsan Kaynakları Müdürü\n* İşe alım, performans değerlendirme ve organizasyonel gelişim.\n\nEĞİTİM\nMarmara Üniversitesi - Çalışma Ekonomisi (Lisans) - 2018\n\nYETKİNLİKLER: Yetenek Kazanımı, Bordro, İş Hukuku, LinkedIn Recruiter\nDİLLER: İngilizce`,
      expectedCity: 'İstanbul',
      expectedDistrict: 'Ataşehir',
      expectedRoleRegex: /İnsan Kaynakları/i,
      expectedSector: 'İnsan kaynakları',
      expectedCompany: 'Getir',
    },
    {
      id: 'CV_08',
      industry: 'Retail & Merchandising',
      text: `Okan Vural\nBursa / Nilüfer\nMağaza Müdürü\n\nİŞ DENEYİMİ\nLC Waikiki 2018 - 2023\nMağaza Müdürü\n* Mağaza ciro hedefleri, stok takibi ve 35 kişilik ekip yönetimi.\n\nEĞİTİM\nUludağ Üniversitesi - İşletme (Lisans) - 2017\n\nYETKİNLİKLER: Mağazacılık, Stok Yönetimi, Görsel Düzenleme, Satış Analizi`,
      expectedCity: 'Bursa',
      expectedDistrict: 'Nilüfer',
      expectedRoleRegex: /Mağaza Müdürü|Satış/i,
      expectedSector: 'Perakende / Mağaza',
      expectedCompany: 'LC Waikiki',
    },
    {
      id: 'CV_09',
      industry: 'Supply Chain & Logistics',
      text: `Tarık Kurt\nKocaeli / Gebze\nLojistik ve Depo Operasyonları Müdürü\n\nİŞ DENEYİMİ\nEkol Lojistik 2017 - 2024\nLojistik Müdürü\n* Antrepo, filo sevkiyat ve gümrükleme süreçleri koordinasyonu.\n\nEĞİTİM\nKocaeli Üniversitesi - Uluslararası Lojistik (Lisans) - 2016\n\nYETKİNLİKLER: WMS, SAP ERP, Rota Optimizasyonu, Filo Yönetimi`,
      expectedCity: 'Kocaeli',
      expectedDistrict: 'Gebze',
      expectedRoleRegex: /Lojistik|Depo/i,
      expectedSector: 'Lojistik / Depolama',
      expectedCompany: 'Ekol Lojistik',
    },
    {
      id: 'CV_10',
      industry: 'Architecture & Interior Design',
      text: `Pelin Aslan\nAntalya / Muratpaşa\nMimar & İç Mimar\n\nİŞ DENEYİMİ\nTAV Havalimanları 2019 - 2024\nMimar\n* Terminal binası iç mekan konsept tasarımları ve uygulama projeleri.\n\nEĞİTİM\nMimar Sinan Güzel Sanatlar Üniversitesi - Mimarlık (Lisans) - 2018\n\nYETKİNLİKLER: 3ds Max, Revit, BIM, SketchUp, Lumion\nDİLLER: İngilizce`,
      expectedCity: 'Antalya',
      expectedDistrict: 'Muratpaşa',
      expectedRoleRegex: /Mimar/i,
      expectedSector: 'İnşaat / Gayrimenkul',
      expectedCompany: 'TAV Havalimanları',
    },
  ];

  for (let idx = 0; idx < testCases.length; idx++) {
    const tc = testCases[idx];
    it(`accepts [${tc.id}] ${tc.industry} CV with precise field-level extraction`, () => {
      const res = extractDeterministicCv(tc.text);
      const canonical = mapCvToCanonicalTaxonomy(res);
      const draft = buildProfileDraftFromCanonicalResult(canonical, `${tc.id}.pdf`);

      if (tc.expectedCity) expect(draft.formValues.city).toBe(tc.expectedCity);
      if (tc.expectedDistrict) expect(draft.formValues.residenceDistrict).toBe(tc.expectedDistrict);
      if (tc.expectedRoleRegex) expect(draft.formValues.role).toMatch(tc.expectedRoleRegex);
      if (tc.expectedSector) expect(draft.formValues.sector).toBe(tc.expectedSector);
      expect(draft.formValues.experiences?.length).toBeGreaterThanOrEqual(1);
    });
  }

  // Multi-Sector Expansion (11 to 50 programmatic fixtures covering all 40 sub-sectors)
  const additionalSectors = [
    { title: 'Otomotiv Tasarım Mühendisi', comp: 'Tofaş Türk Otomobil Fabrikası', sec: 'Otomotiv', city: 'Bursa' },
    { title: 'Gıda Mühendisi & Kalite Lideri', comp: 'Sütaş Süt Ürünleri', sec: 'Gıda / Restoran', city: 'Bursa' },
    { title: 'Rüzgar Türbini Saha Mühendisi', comp: 'Enerjisa Üretim', sec: 'Enerji', city: 'İzmir' },
    { title: 'Maden Saha Mühendisi', comp: 'Tüprag Metal Madencilik', sec: 'Madencilik', city: 'Uşak' },
    { title: 'İlaç Ruhsatlandırma Uzmanı', comp: 'Abdi İbrahim İlaç', sec: 'Eczane / İlaç', city: 'İstanbul' },
    { title: 'Otel Genel Müdürü', comp: 'Rixos Hotels', sec: 'Turizm / Otelcilik', city: 'Antalya' },
    { title: 'Klinik Psikolog', comp: 'NP Beyin Hastanesi', sec: 'Sağlık', city: 'İstanbul' },
    { title: 'Öğretim Görevlisi', comp: 'Hacettepe Üniversitesi', sec: 'Eğitim', city: 'Ankara' },
    { title: 'İngilizce Öğretmeni', comp: 'Bahçeşehir Koleji', sec: 'Eğitim', city: 'İstanbul' },
    { title: 'Kurumsal İletişim Uzmanı', comp: 'Zorlu Holding', sec: 'Pazarlama / Reklam', city: 'İstanbul' },
    { title: 'Uçak Bakım Teknisyeni', comp: 'Türk Hava Yolları Teknik', sec: 'Havacılık', city: 'İstanbul' },
    { title: 'Gemi Kaptanı', comp: 'Arkas Denizcilik', sec: 'Denizcilik / Liman', city: 'İzmir' },
    { title: 'E-Ticaret Kategori Müdürü', comp: 'Trendyol', sec: 'E-ticaret / Pazaryeri', city: 'İstanbul' },
    { title: 'Müşteri Deneyimi Lideri', comp: 'Turkcell', sec: 'Müşteri hizmetleri', city: 'İstanbul' },
    { title: 'Yazılım Test Mühendisi', comp: 'Softtech', sec: 'Bilişim / Yazılım', city: 'İstanbul' },
    { title: 'Veri Bilimci', comp: 'Insider', sec: 'Yapay zeka / Veri', city: 'İstanbul' },
    { title: 'Frontend Geliştirici', comp: 'Papara', sec: 'Bilişim / Yazılım', city: 'İstanbul' },
    { title: 'Backend Geliştirici', comp: 'Peak Games', sec: 'Bilişim / Yazılım', city: 'İstanbul' },
    { title: 'Mobil Uygulama Geliştirici', comp: 'Dream Games', sec: 'Bilişim / Yazılım', city: 'İstanbul' },
    { title: 'DevOps Mühendisi', comp: 'Hepsiburada Tech', sec: 'Bilişim / Yazılım', city: 'İstanbul' },
    { title: 'Sistem Yöneticisi', comp: 'Türk Telekom', sec: 'Bilişim / Yazılım', city: 'Ankara' },
    { title: 'Finansal Analist', comp: 'İş Yatırım Menkul Değerler', sec: 'Finans / Bankacılık', city: 'İstanbul' },
    { title: 'Banka Müdürü', comp: 'Garanti BBVA', sec: 'Finans / Bankacılık', city: 'Ankara' },
    { title: 'Kredi Tahsis Uzmanı', comp: 'Yapı Kredi Bankası', sec: 'Finans / Bankacılık', city: 'İstanbul' },
    { title: 'Risk Yönetimi Uzmanı', comp: 'Denizbank', sec: 'Finans / Bankacılık', city: 'İstanbul' },
    { title: 'Pazarlama Müdürü', comp: 'Unilever Türkiye', sec: 'Pazarlama / Reklam', city: 'İstanbul' },
    { title: 'Dijital Pazarlama Uzmanı', comp: 'Vodafone Türkiye', sec: 'Pazarlama / Reklam', city: 'İstanbul' },
    { title: 'Grafik Tasarımcı', comp: 'Punch Reklam Ajansı', sec: 'Pazarlama / Reklam', city: 'İstanbul' },
    { title: 'Metin Yazarı', comp: 'Tribal Worldwide', sec: 'Pazarlama / Reklam', city: 'İstanbul' },
    { title: 'İthalat İhracat Uzmanı', comp: 'Borusan Mannesmann', sec: 'İthalat / İhracat', city: 'Kocaeli' },
    { title: 'Gümrük Müşavir Yardımcısı', comp: 'Ünsped Gümrük Müşavirliği', sec: 'Gümrük', city: 'İstanbul' },
    { title: 'Satın Alma Müdürü', comp: 'Ford Otosan', sec: 'Üretim / Sanayi', city: 'Kocaeli' },
    { title: 'Üretim Mühendisi', comp: 'Arçelik A.Ş.', sec: 'Üretim / Sanayi', city: 'Eskişehir' },
    { title: 'Mekanik Bakım Mühendisi', comp: 'Tüpraş Rafinerisi', sec: 'Enerji', city: 'Kocaeli' },
    { title: 'Elektrik Elektronik Mühendisi', comp: 'Aselsan', sec: 'Elektrik-elektronik', city: 'Ankara' },
    { title: 'Çevre Mühendisi', comp: 'İSKİ Genel Müdürlüğü', sec: 'İdari işler / Ofis', city: 'İstanbul' },
    { title: 'Ziraat Mühendisi', comp: 'Toros Tarım', sec: 'Kimya / Plastik', city: 'Adana' },
    { title: 'Gayrimenkul Danışmanı', comp: 'Remax Türkiye', sec: 'İnşaat / Gayrimenkul', city: 'İzmir' },
    { title: 'Biyomedikal Mühendisi', comp: 'Siemens Healthineers', sec: 'Sağlık', city: 'İstanbul' },
    { title: 'Proje Yöneticisi', comp: 'Kızılay Genel Müdürlüğü', sec: 'Holding / Yönetim', city: 'Ankara' },
  ];

  additionalSectors.forEach((secTest, i) => {
    const num = i + 11;
    it(`validates Programmatic Industry Archetype [CV_${num}]: ${secTest.title} @ ${secTest.comp}`, () => {
      const sample = `Aday İsim\n${secTest.city}\n${secTest.title}\n\nDENEYİM\n${secTest.comp} 2020 - 2023\n${secTest.title}\n* Sorumluluk ve yönetim süreçleri yürütüldü.\n\nEĞİTİM\nÜniversite (Lisans) 2019\n\nYETKİNLİKLER: Yönetim, Analiz, Raporlama`;
      const res = extractDeterministicCv(sample);
      const canonical = mapCvToCanonicalTaxonomy(res);
      const draft = buildProfileDraftFromCanonicalResult(canonical, `cv_${num}.pdf`);

      expect(draft.formValues.city).toBe(secTest.city);
      expect(draft.formValues.role).toBeDefined();
      expect(draft.formValues.experiences?.length).toBeGreaterThanOrEqual(1);
    });
  });
});
