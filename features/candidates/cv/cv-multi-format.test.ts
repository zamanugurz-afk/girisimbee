import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from '@/features/candidates/cv/cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from '@/features/candidates/cv/cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from '@/features/candidates/cv/cv-profile-builder';
import { extractCvText, CvExtractionError } from '@/features/candidates/cv/cv-text-extractor';

describe('CV Extraction Universal Test Corpus (35+ Multi-Format & Multi-Industry Fixtures)', () => {
  // 1. Türkçe Klasik Bankacılık CV'si
  it('Fixture 1: Türkçe Klasik Bankacılık CV', () => {
    const cv = `
Ahmet Yılmaz
İstanbul / Kadıköy
0532 111 22 33 | ahmetyilmaz@gmail.com

İŞ DENEYİMİ
Akbank A.Ş.
Müşteri İlişkileri Yöneticisi
2020 - 2023
Portföy yönetimi ve müşteri kazanımı sağlandı.

EĞİTİM
İstanbul Üniversitesi - İktisat (Lisans) - 2019

YETKİNLİKLER
Satış Yönetimi, Portföy Yönetimi, MS Excel
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv1.pdf');

    expect(res.experiences.length).toBe(1);
    expect(res.education.length).toBe(1);
    expect(draft.formValues.city).toBe('İstanbul');
    expect(draft.formValues.residenceDistrict).toBe('Kadıköy');
    expect(draft.formValues.sector).toMatch(/Finans|Müşteri/);
  });

  // 2. English Executive CV
  it('Fixture 2: English Operations Executive CV', () => {
    const cv = `
John Doe
Istanbul / Besiktas | john.doe@email.com

WORK EXPERIENCE
Mehrwerk
Call Center Operations Manager
2018 - 2022
Managed customer support operations and call center KPI targets.

EDUCATION
Bogazici University - Business Administration (Bachelor) - 2017

SKILLS
Operations Management, Team Management, Jira, Excel
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv2.pdf');

    expect(res.experiences.length).toBe(1);
    expect(res.education.length).toBe(1);
    expect(draft.formValues.city).toBe('İstanbul');
    expect(draft.formValues.residenceDistrict).toBe('Beşiktaş');
  });

  // 3. Compact 1-Page Summary CV
  it('Fixture 3: Compact 1-Page Summary CV', () => {
    const cv = `
CANSU DEMİR | İSTANBUL
Çağrı Merkezi Operasyon Müdürü

DENEYİM
IGS TURKIYE - Çağrı Merkezi Müdürü (2022 - 2024)

EĞİTİM
Marmara Üniversitesi / İşletme (Lisans) 2020

BECERİLER
Müşteri İlişkileri, Liderlik, CRM
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv3.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.city).toBe('İstanbul');
    expect(draft.formValues.role).toMatch(/Çağrı Merkezi|Operasyon/i);
  });

  // 4. LinkedIn Export with Month Names
  it('Fixture 4: LinkedIn Export CV with Month Names', () => {
    const cv = `
Deneyim
Gedik Yatırım
Alternatif Satış Kanalları Müdürü
Ocak 2021 - Aralık 2023 (3 yıl)
İstanbul, Türkiye

Eğitim
Anadolu Üniversitesi
Kamu Yönetimi (Lisans) - 2016
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv4.pdf');

    expect(res.experiences.length).toBe(1);
    expect(res.education.length).toBe(1);
    expect(draft.formValues.experiences?.[0].startYear).toBe(2021);
    expect(draft.formValues.experiences?.[0].endYear).toBe(2023);
  });

  // 5. Word DOCX Industrial Engineering CV
  it('Fixture 5: Word Document Engineering CV', () => {
    const cv = `
ÖZGEÇMİŞ
Mehmet Kaya - Ankara / Çankaya
İŞ GEÇMİŞİ:
Aselsan A.Ş. - Proje Yöneticisi (2019 - 2024)
EĞİTİM GEÇMİŞİ:
ODTÜ - Endüstri Mühendisliği (Yüksek Lisans) - 2018
YETENEKLER:
Proje Yönetimi, Agile, Jira
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv5.docx');

    expect(res.experiences.length).toBe(1);
    expect(res.education.length).toBe(1);
    expect(draft.formValues.city).toBe('Ankara');
    expect(draft.formValues.residenceDistrict).toBe('Çankaya');
  });

  // 6. Single-column Linear Tech CV
  it('Fixture 6: Single-column Linear Tech CV', () => {
    const cv = `
Ali Can
İzmir / Bornova
2018 - 2022 | Trendyol | Yazılım Geliştirici
Lisans: Ege Üniversitesi - Bilgisayar Mühendisliği (2017)
Yetenekler: TypeScript, React, Docker, Git
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv6.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.city).toBe('İzmir');
    expect(draft.formValues.residenceDistrict).toBe('Bornova');
    expect(draft.formValues.tools).toContain('Docker');
  });

  // 7. Two-column Multi-section CV
  it('Fixture 7: Two-column Multi-section CV', () => {
    const cv = `
SOL SÜTUN:
İletişim: Bursa / Nilüfer
Diller: Türkçe, İngilizce, Almanca
Sertifikalar: SEGEM, PMP

SAĞ SÜTUN:
İŞ DENEYİMİ:
Fibabanka - Şube Müdürü (2017 - 2023)
EĞİTİM:
Uludağ Üniversitesi - Maliye (Lisans) - 2015
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv7.pdf');

    expect(res.experiences.length).toBe(1);
    expect(res.education.length).toBe(1);
    expect(draft.formValues.certificates).toContain('SEGEM');
    expect(draft.formValues.city).toBe('Bursa');
    expect(draft.formValues.residenceDistrict).toBe('Nilüfer');
  });

  // 8. Executive CV with 6 experiences
  it('Fixture 8: Executive CV with 6 experiences', () => {
    const cv = `
Uğur Zaman
İstanbul

İŞ DENEYİMİ
IGS Türkiye - Müdür (2025 - 2026)
Gedik Yatırım - Müdür (2023 - 2025)
Mehrwerk - Müdür (2019 - 2023)
Viennalife - Müdür (2016 - 2019)
Fibabanka - Müdür (2016 - 2016)
Mplus Group - Müdür (2011 - 2016)

EĞİTİM
Marmara Üniversitesi - Sermaye Piyasası (Yüksek Lisans)
Anadolu Üniversitesi - Kamu Yönetimi (Lisans)
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences.length).toBe(6);
    expect(res.education.length).toBe(2);
  });

  // 9. Fresh Graduate CV with Internship
  it('Fixture 9: Fresh Graduate CV', () => {
    const cv = `
Selin Yurt
İstanbul / Kadıköy
EĞİTİM:
Koç Üniversitesi - İşletme (Lisans) - 2024 (GPA: 3.8)
STAJ VE DENEYİM:
PwC - Finansal Denetim Stajyeri (2023 - 2024)
YETKİNLİKLER:
Finansal Analiz, MS Excel, Power BI
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv9.pdf');

    expect(res.experiences.length).toBe(1);
    expect(res.education.length).toBe(1);
    expect(draft.formValues.tools).toMatch(/Excel|Power BI/i);
  });

  // 10. Technical Software Engineer CV
  it('Fixture 10: Technical Software Engineer CV', () => {
    const cv = `
Burak Öz
İstanbul

İŞ DENEYİMİ
Getir - Senior Backend Developer (2021 - 2024)
Go, PostgreSQL, Redis, Docker, Kubernetes, AWS, microservices mimarisi.

EĞİTİM
İTÜ - Bilgisayar Mühendisliği (Lisans) - 2020
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv10.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.tools).toContain('Docker');
    expect(draft.formValues.tools).toContain('Kubernetes');
  });

  // 11. Insurance Specialist CV
  it('Fixture 11: Insurance & Brokerage Specialist CV', () => {
    const cv = `
Zeynep Kaya
İstanbul / Ümraniye | zeynep@sigorta.com
Uzman Sigorta Danışmanı

İŞ DENEYİMİ
Sigortamnet A.Ş. (2022 - 2025)
Uzman Sigorta Danışmanı
Kasko, Trafik, DASK ve Sağlık sigortaları poliçeleştirme süreçleri yönetildi.

EĞİTİM
Marmara Üniversitesi - Sigortacılık (Lisans) - 2021

SERTİFİKALAR
SEGEM Lisans Belgesi (2022)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv11.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.sector).toBe('Sigorta');
    expect(draft.formValues.certificates).toContain('SEGEM');
  });

  // 12. Healthcare Hospital Coordinator CV
  it('Fixture 12: Healthcare Patient Services Coordinator CV', () => {
    const cv = `
Elif Şahin
İstanbul / Ataşehir
Hasta Hizmetleri Yöneticisi

DENEYİM
Acıbadem Sağlık Grubu (2019 - 2024)
Hasta Hizmetleri Yöneticisi
Poliklinik ve yatan hasta süreçlerinin koordinasyonu.

EĞİTİM
İstanbul Üniversitesi - Sağlık Yönetimi (Lisans) - 2018
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv12.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.sector).toBe('Sağlık');
  });

  // 13. Construction & Architecture CV
  it('Fixture 13: Construction Site Manager CV', () => {
    const cv = `
Murat Yıldız
Ankara / Çankaya
Mimar & Şantiye Şefi

İŞ DENEYİMİ
Rönesans Holding (2018 - 2023)
Şantiye Şefi
Büyük ölçekli karma konut ve AVM projelerinin saha yönetimi.

EĞİTİM
ODTÜ - Mimarlık (Lisans) - 2017
YETKİNLİKLER: AutoCAD, Revit, MS Project
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv13.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.sector).toBe('İnşaat / Gayrimenkul');
    expect(draft.formValues.tools).toContain('Autocad');
  });

  // 14. Data Science & AI Engineer CV
  it('Fixture 14: Data Science & AI Engineer CV', () => {
    const cv = `
Mert Çelik
İstanbul
Yapay Zeka Mühendisi

İŞ DENEYİMİ
Baykar Teknoloji (2021 - 2024)
Yapay Zeka Mühendisi
Deep Learning, Computer Vision ve Python modelleri geliştirildi.

EĞİTİM
Boğaziçi Üniversitesi - Bilgisayar Mühendisliği (Yüksek Lisans) - 2021
İTÜ - Bilgisayar Mühendisliği (Lisans) - 2019
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv14.pdf');

    expect(res.experiences.length).toBe(1);
    expect(res.education.length).toBe(2);
    expect(draft.formValues.tools).toContain('Python');
  });

  // 15. Academic & PhD Researcher CV
  it('Fixture 15: Academic PhD Researcher CV', () => {
    const cv = `
Dr. Seda Koç
İstanbul
Araştırma Görevlisi

DENEYİM
İstanbul Teknik Üniversitesi (2018 - 2024)
Araştırma Görevlisi
Yapay zeka ve optimizasyon alanlarında akademik yayınlar ve ders asistanlığı.

EĞİTİM
İTÜ - Bilgisayar Mühendisliği (Doktora) - 2023
İTÜ - Bilgisayar Mühendisliği (Yüksek Lisans) - 2018
ODTÜ - Bilgisayar Mühendisliği (Lisans) - 2016
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv15.pdf');

    expect(res.experiences.length).toBe(1);
    expect(res.education.length).toBeGreaterThanOrEqual(2);
    expect(draft.formValues.educationLevel).toBe('Doktora');
  });

  // 16. Sales Director CV
  it('Fixture 16: Sales Director CV', () => {
    const cv = `
Hakan Aydın
İstanbul / Beşiktaş
Satış Direktörü

İŞ DENEYİMİ
Unilever Türkiye (2017 - 2024)
Ulusal Zincir Mağazalar Satış Müdürü
FMCG sektöründe 50M TL bütçe ve 20 kişilik satış ekibi yönetimi.

EĞİTİM
Bilkent Üniversitesi - İktisat (Lisans) - 2015
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv16.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.sector).toBe('Satış');
  });

  // 17. Corporate Legal Counsel CV
  it('Fixture 17: Legal Counsel CV', () => {
    const cv = `
Av. Deniz Aslan
İstanbul / Kadıköy
Hukuk Müşaviri

DENEYİM
Koç Holding (2019 - 2024)
Avukat & Hukuk Müşaviri
Ticaret hukuku, sözleşmeler ve KVKK uyum süreçleri yönetildi.

EĞİTİM
İstanbul Üniversitesi - Hukuk (Lisans) - 2018
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv17.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.sector).toBe('Hukuk');
  });

  // 18. Logistics & Supply Chain Manager CV
  it('Fixture 18: Supply Chain Manager CV', () => {
    const cv = `
Kemal Demir
Kocaeli / Gebze
Tedarik Zinciri Müdürü

İŞ DENEYİMİ
Ekol Lojistik (2018 - 2023)
Tedarik Zinciri Müdürü
Uluslararası taşımacılık, depo ve filo yönetimi operasyonları.

EĞİTİM
Yıldız Teknik Üniversitesi - Endüstri Mühendisliği (Lisans) - 2017
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv18.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.sector).toBe('Lojistik / Depolama');
  });

  // 19. Full Date Range with DD.MM.YYYY
  it('Fixture 19: Full Date Range CV with DD.MM.YYYY', () => {
    const cv = `
Dorukhan Şengel
İzmir / Karabağlar
Ekonomi & Finans Uzmanı

İŞ DENEYİMİ
Gedik Yatırım 03.10.2024 - 03.04.2025
Manisa Yatırım Operasyonları & Portföy kazanımı
Müşteri hesap açılışları ve portföy geliştirme yapıldı.

EĞİTİM
Manisa Celal Bayar Üniversitesi | Ekonomi ve Finans (Lisans)(2021 - 2025)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv19.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.role).toBe('Finans Uzmanı');
    expect(draft.formValues.sector).toBe('Finans / Bankacılık');
    expect(draft.formValues.city).toBe('İzmir');
    expect(draft.formValues.residenceDistrict).toBe('Karabağlar');
  });

  // 20. Ongoing Present Role with 'Güncel'
  it('Fixture 20: Ongoing Present Role CV with Güncel', () => {
    const cv = `
Ravza Mudak
İstanbul / Ümraniye
Uzman Sigorta Danışmanı & Operasyon Uzmanı

İŞ DENEYİMİ
IGS ASİSTANS HİZMETLERİ Güncel
Asistans ve Operasyon Uzmanı
Operasyonel süreçlerin takibi.

EĞİTİM
İstanbul Medipol Üniversitesi (2020)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv20.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.experiences?.[0].isCurrent).toBe(true);
    expect(draft.formValues.sector).toBe('Sigorta');
  });

  // 21. Multi-role Promotion in Single Company
  it('Fixture 21: Multi-role Promotion in Single Company CV', () => {
    const cv = `
Serkan Vural
İstanbul

İŞ DENEYİMİ
Trendyol - Senior Backend Engineer (2022 - 2024)
Trendyol - Software Engineer (2020 - 2022)

EĞİTİM
Hacettepe Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2020
`;
    const res = extractDeterministicCv(cv);
    expect(res.experiences.length).toBe(2);
  });

  // 22. High School + Associate + Bachelor Multi-degree
  it('Fixture 22: Multi-degree Education Hierarchy CV', () => {
    const cv = `
Ayşe Doğan
Ankara

EĞİTİM
Ankara Üniversitesi - İşletme (Lisans) - 2022
Gazi Üniversitesi - Muhasebe (Ön Lisans) - 2018
Ankara Atatürk Anadolu Lisesi (Lise) - 2016

DENEYİM
Halkbank - Gişe Yetkilisi (2022 - 2024)
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv22.pdf');

    expect(res.education.length).toBeGreaterThanOrEqual(2);
    expect(draft.formValues.educationLevel).toBe('Lisans');
  });

  // 23. English Product Manager CV
  it('Fixture 23: English Product Manager CV', () => {
    const cv = `
Sarah Jenkins
London, UK | sarah.j@tech.io
Senior Product Manager

EXPERIENCE
Amazon (2021 - Present)
Senior Product Manager
Led cross-functional teams for e-commerce conversion optimization.

EDUCATION
University of Oxford - Economics (BSc) - 2020
SKILLS: Agile, Scrum, JIRA, SQL, Product Strategy
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv23.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.experiences?.[0].isCurrent).toBe(true);
    expect(draft.formValues.tools).toMatch(/SQL|Agile|Jira/i);
  });

  // 24. Digital Marketing & SEO Lead CV
  it('Fixture 24: Digital Marketing & SEO Specialist CV', () => {
    const cv = `
Gizem Kurt
İstanbul / Şişli
Dijital Pazarlama Uzmanı

İŞ DENEYİMİ
Hepsiburada (2020 - 2024)
Dijital Pazarlama ve SEO Uzmanı
Google Ads, Meta Ads, SEO analitiği ve ROAS optimizasyonu.

EĞİTİM
Bahçeşehir Üniversitesi - İletişim (Lisans) - 2019
YETKİNLİKLER: Google Analytics, SEMrush, Google Ads
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv24.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.sector).toBe('Pazarlama / Reklam');
  });

  // 25. Financial Analyst CFA Candidate CV
  it('Fixture 25: Financial Analyst CFA Candidate CV', () => {
    const cv = `
Ozan Güler
İstanbul / Levent
Finansal Analist

İŞ DENEYİMİ
Garanti BBVA (2021 - 2024)
Kıdemli Finansal Analist
Mali tablo analizi, nakit akışı modelleme ve bütçe planlama.

EĞİTİM
Sabancı Üniversitesi - Finans (Lisans) - 2021
SERTİFİKALAR: SPL Düzey 3, CFA Level 1
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv25.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.sector).toBe('Finans / Bankacılık');
    expect(draft.formValues.certificates).toContain('SPL');
  });

  // 26. Human Resources & Talent Partner CV
  it('Fixture 26: HR Business Partner CV', () => {
    const cv = `
Merve Aktaş
İstanbul / Maltepe
İnsan Kaynakları İş Ortağı

DENEYİM
LC Waikiki (2019 - 2024)
İnsan Kaynakları Uzmanı
İşe alım, yetenek yönetimi, bordro ve performans değerlendirme.

EĞİTİM
Marmara Üniversitesi - Çalışma Ekonomisi (Lisans) - 2018
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv26.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.sector).toBe('İnsan kaynakları');
  });

  // 27. QA & Test Automation Lead CV
  it('Fixture 27: QA Automation Engineer CV', () => {
    const cv = `
Tolga Saygın
İstanbul
Test Otomasyon Mühendisi

İŞ DENEYİMİ
Softtech (2021 - 2024)
Senior QA Automation Engineer
Selenium, Cypress, JUnit ve Postman ile uçtan uca test otomasyonu.

EĞİTİM
Ege Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2020
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv27.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.sector).toBe('Bilişim / Yazılım');
  });

  // 28. Customer Success Manager CV
  it('Fixture 28: Customer Success Manager CV', () => {
    const cv = `
Büşra Erdem
İstanbul / Beşiktaş
Müşteri Başarı Yöneticisi

İŞ DENEYİMİ
Insider (2021 - 2024)
Customer Success Specialist
B2B SaaS müşterilerinin onboarding ve retention süreçlerinin yürütülmesi.

EĞİTİM
Galatasaray Üniversitesi - Sosyoloji (Lisans) - 2020
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv28.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.sector).toMatch(/Müşteri|Çağrı|Bilişim/);
  });

  // 29. Cyber Security & SOC Analyst CV
  it('Fixture 29: Cyber Security Analyst CV', () => {
    const cv = `
Emre Keskin
Ankara
Siber Güvenlik Uzmanı

DENEYİM
HAVELSAN (2020 - 2024)
Siber Güvenlik Uzmanı
SOC analizi, SIEM, sızma testleri ve güvenlik duvarı konfigürasyonu.

EĞİTİM
TOBB ETÜ - Bilgisayar Mühendisliği (Lisans) - 2020
SERTİFİKALAR: CEH, CompTIA Security+
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv29.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.sector).toBe('Bilişim / Yazılım');
  });

  // 30. Tourism & Front Office Manager CV
  it('Fixture 30: Tourism Front Office Manager CV', () => {
    const cv = `
Barış Çetin
Antalya / Muratpaşa
Ön Büro Müdürü

İŞ DENEYİMİ
Hilton Hotels (2018 - 2023)
Ön Büro Müdürü
Otel operasyonları, misafir karşılama ve rezervasyon yönetimi.

EĞİTİM
Akdeniz Üniversitesi - Turizm İşletmeciliği (Lisans) - 2017
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv30.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.city).toBe('Antalya');
    expect(draft.formValues.residenceDistrict).toBe('Muratpaşa');
    expect(draft.formValues.sector).toBe('Turizm / Otelcilik');
  });

  // 31. Retail Store Manager CV
  it('Fixture 31: Retail Store Manager CV', () => {
    const cv = `
Caner Yurt
Bursa / Osmangazi
Mağaza Müdürü

İŞ DENEYİMİ
Boyner Büyük Mağazacılık (2017 - 2023)
Mağaza Müdürü
Perakende mağaza yönetimi, stok takibi ve 30 kişilik ekip liderliği.

EĞİTİM
Uludağ Üniversitesi - İktisat (Lisans) - 2016
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv31.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.city).toBe('Bursa');
    expect(draft.formValues.residenceDistrict).toBe('Osmangazi');
    expect(draft.formValues.sector).toBe('Perakende / Mağaza');
  });

  // 32. Mobile Developer CV
  it('Fixture 32: Mobile iOS & Android Developer CV', () => {
    const cv = `
Kaan Şen
İstanbul
Mobil Yazılım Geliştirici

İŞ DENEYİMİ
Papara (2021 - 2024)
Mobil Yazılım Geliştirici
Flutter, Swift ve Kotlin ile finansal mobil uygulamalar geliştirildi.

EĞİTİM
Yıldız Teknik Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2021
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv32.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.sector).toBe('Bilişim / Yazılım');
    expect(res.skills.join(' ') + ' ' + (draft.formValues.tools || '') + ' ' + (draft.formValues.technicalSkills || '')).toMatch(/Flutter|Swift|Kotlin/i);
  });

  // 33. Logistics Heavy Vehicle Driver CV
  it('Fixture 33: Heavy Vehicle Driver CV', () => {
    const cv = `
İsmail Kurt
Kocaeli / Gebze
TIR Şoförü / Ağır Vasıta Sürücüsü

DENEYİM
Ekol Lojistik (2016 - 2023)
Ağır Vasıta Şoförü
Uluslararası ve yurt içi taşımacılık.

EĞİTİM
Gebze Endüstri Meslek Lisesi (Lise) - 2014
BELGELER: SRC 3, SRC 4, Psikoteknik, E Sınıfı Ehliyet
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv33.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.role).toMatch(/Şoför|Sürücü/i);
  });

  // 34. Kindergarten Teacher CV
  it('Fixture 34: Kindergarten Teacher CV', () => {
    const cv = `
Duygu Çelik
İstanbul / Kadıköy
Okul Öncesi Öğretmeni

İŞ DENEYİMİ
Özel Neşeli Çocuklar Anaokulu (2020 - 2024)
Okul Öncesi Öğretmeni
Montessori ve Reggio Emilia eğitim modelleri uygulandı.

EĞİTİM
Marmara Üniversitesi - Okul Öncesi Öğretmenliği (Lisans) - 2020
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv34.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.sector).toBe('Eğitim');
  });

  // 35. Social Worker CV
  it('Fixture 35: Social Worker CV', () => {
    const cv = `
Fatma Demir
İstanbul / Üsküdar
Sosyal Hizmetler Uzmanı

İŞ DENEYİMİ
Üsküdar Belediyesi - Sosyal Hizmetler Birimi (2019 - 2024)
Sosyal Hizmetler Uzmanı
İhtiyaç sahibi ailelerin tespiti, saha incelemeleri ve psikososyal destek.

EĞİTİM
İstanbul Medipol Üniversitesi - Sosyal Hizmetler (Lisans) - 2019
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv35.pdf');

    expect(res.experiences.length).toBe(1);
    expect(draft.formValues.city).toBe('İstanbul');
    expect(draft.formValues.residenceDistrict).toBe('Üsküdar');
  });

  // 36. Scanned Image / Empty PDF error handling
  it('Fixture 36: Scanned image PDF friendly notification without hallucination', async () => {
    const emptyBuf = Buffer.from('empty');
    await expect(extractCvText(emptyBuf, 'scanned.pdf', 'application/pdf')).rejects.toThrowError(
      CvExtractionError,
    );
  }, 15000);
});
