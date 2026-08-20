import { describe, it, expect } from 'vitest';
import { extractDeterministicCv } from '@/features/candidates/cv/cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from '@/features/candidates/cv/cv-taxonomy-mapper';
import { buildProfileDraftFromCanonicalResult } from '@/features/candidates/cv/cv-profile-builder';

describe('Universal CV Extraction Golden Corpus (50 Diverse Archetypes & Industries)', () => {
  // 1. Cloud Architect / DevOps Lead
  it('Fixture 01: Cloud & DevOps Lead CV', () => {
    const cv = `
Burak Yılmaz
İstanbul / Ataşehir
DevOps Mühendisi

ÖZET
10 yılı aşkın süredir AWS, Kubernetes ve Terraform altyapıları kuran kıdemli DevOps mühendisi.

DENEYİM
Getir (2021 - Günümüz)
DevOps Mühendisi
Kubernetes kümeleri, CI/CD pipeline'ları ve Terraform altyapı yönetimi.

Trendyol (2017 - 2021)
Sistem Yöneticisi
Linux sunucu ve AWS bulut göçü yönetimi.

EĞİTİM
İstanbul Teknik Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2016
YETKİNLİKLER: Docker, Kubernetes, AWS, Terraform, CI/CD, Linux, Python
DİLLER: İngilizce, Türkçe
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv01.pdf');

    expect(res.experiences).toHaveLength(2);
    expect(draft.formValues.role).toMatch(/DevOps|Sistem Yöneticisi/i);
    expect(draft.formValues.sector).toBe('Bilişim / Yazılım');
    expect(draft.formValues.city).toBe('İstanbul');
    expect(draft.formValues.residenceDistrict).toBe('Ataşehir');
    expect(draft.formValues.tools).toContain('Kubernetes');
    expect(draft.formValues.languages).toContain('İngilizce');
  });

  // 2. SMMM Certified Public Accountant
  it('Fixture 02: Certified Public Accountant (SMMM) CV', () => {
    const cv = `
Ayşe Demir SMMM
Ankara / Çankaya
Mali Müşavir

İŞ DENEYİMİ
Demir Mali Müşavirlik Ofisi (2018 - Halen)
Mali Müşavir
Vergi beyannameleri, KDV iade süreçleri ve şirket kuruluşu.

KPMG Türkiye (2014 - 2018)
Denetim Uzmanı
Mali denetim ve vergi mevzuatı danışmanlığı.

EĞİTİM
Gazi Üniversitesi - İktisat (Lisans) - 2013
BELGELER: SMMM Ruhsatı, Bağımsız Denetçi Belgesi
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv02.pdf');

    expect(res.experiences).toHaveLength(2);
    expect(draft.formValues.role).toMatch(/Mali Müşavir|Muhasebe/i);
    expect(draft.formValues.city).toBe('Ankara');
    expect(draft.formValues.residenceDistrict).toBe('Çankaya');
    expect(draft.formValues.certificates).toContain('SMMM');
  });

  // 3. Civil Site Manager / Construction Chief
  it('Fixture 03: Construction Site Manager CV', () => {
    const cv = `
Murat Kaya
İzmir / Bornova
Şantiye Şefi

MESLEKİ DENEYİM
Rönesans Holding (2019 - 2024)
Şantiye Şefi
Konut ve ticari plaza projelerinde kaba ve ince yapı saha yönetimi.

Enka İnşaat (2015 - 2019)
İnşaat Mühendisi
Altyapı ve betonarme uygulama takibi.

EĞİTİM
Dokuz Eylül Üniversitesi - İnşaat Mühendisliği (Lisans) - 2014
YETKİNLİKLER: AutoCAD, Primavera, MS Project, Metraj, Hakediş
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv03.pdf');

    expect(res.experiences).toHaveLength(2);
    expect(draft.formValues.role).toMatch(/Şantiye Şefi|İnşaat Mühendisi/i);
    expect(draft.formValues.sector).toBe('İnşaat / Gayrimenkul');
    expect(draft.formValues.city).toBe('İzmir');
    expect(draft.formValues.tools).toContain('Autocad');
  });

  // 4. Emergency Medicine Doctor
  it('Fixture 04: Emergency Medicine Doctor CV', () => {
    const cv = `
Uzm. Dr. Emre Çelik
Antalya / Muratpaşa
Doktor

İŞ GEÇMİŞİ
Akdeniz Üniversitesi Hastanesi (2018 - Günümüz)
Doktor
Acil servis triyaj ve yoğun bakım hasta takibi.

EĞİTİM
Hacettepe Üniversitesi - Tıp Fakültesi (Lisans) - 2017
DİLLER: Türkçe, İngilizce, Almanca
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv04.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toBe('Doktor');
    expect(draft.formValues.sector).toBe('Sağlık');
    expect(draft.formValues.city).toBe('Antalya');
    expect(draft.formValues.languages).toContain('İngilizce');
    expect(draft.formValues.languages).toContain('Almanca');
  });

  // 5. Head of Legal Counsel
  it('Fixture 05: Head of Legal & Corporate Compliance CV', () => {
    const cv = `
Av. Deniz Aslan
İstanbul / Beşiktaş
Avukat

İŞ DENEYİMİ
Aslan Hukuk Bürosu (2016 - 2024)
Avukat
Ticaret hukuku, sözleşmeler ve şirket birleşme/devralma süreçleri.

EĞİTİM
Bilkent Üniversitesi - Hukuk Fakültesi (Lisans) - 2015
İstanbul Barosu Levhası: 54321
DİLLER: İngilizce
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv05.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toBe('Avukat');
    expect(draft.formValues.sector).toBe('Hukuk');
    expect(draft.formValues.city).toBe('İstanbul');
    expect(draft.formValues.residenceDistrict).toBe('Beşiktaş');
  });

  // 6. International Fleet Operations Director
  it('Fixture 06: Logistics & Fleet Operations Director CV', () => {
    const cv = `
Hakan Şahin
Kocaeli / Gebze
Lojistik Uzmanı

DENEYİM
Ekol Lojistik (2015 - 2024)
Lojistik Uzmanı
Uluslararası kara taşımacılığı ve filo rotalama yönetimi.

EĞİTİM
Kocaeli Üniversitesi - Uluslararası Lojistik (Lisans) - 2014
BELGELER: ÜDY 3, ODY 3, ADR
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv06.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Lojistik Uzmanı|Operasyon/i);
    expect(draft.formValues.sector).toBe('Lojistik / Depolama');
    expect(draft.formValues.city).toBe('Kocaeli');
  });

  // 7. Full Stack Python & React Developer
  it('Fixture 07: Full Stack Python & React Developer CV', () => {
    const cv = `
Kerem Aydın
Trabzon / Ortahisar
Full Stack Geliştirici

İŞ DENEYİMLERİ
Teknokent Bilişim (2020 - 2024)
Full Stack Geliştirici
Django REST Framework ve React ile SaaS platformu geliştirildi.

EĞİTİM
Karadeniz Teknik Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2020
TEKNOLOJİLER: Python, Django, React, PostgreSQL, Redis, Docker
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv07.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Full-?Stack|Yazılım/i);
    expect(draft.formValues.sector).toBe('Bilişim / Yazılım');
    expect(draft.formValues.city).toBe('Trabzon');
    expect(draft.formValues.tools).toContain('Python');
    expect(draft.formValues.tools).toContain('React');
  });

  // 8. High School Mathematics Teacher
  it('Fixture 08: High School Mathematics Teacher CV', () => {
    const cv = `
Zeliha Tekin
Eskişehir / Tepebaşı
Öğretmen

DENEYİM
Özel Gelişim Koleji (2017 - 2024)
Öğretmen
Lise seviyesinde YKS ve TYT matematik ve geometri eğitimi.

EĞİTİM
Anadolu Üniversitesi - Matematik Öğretmenliği (Lisans) - 2016
BELGELER: Pedagojik Formasyon
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv08.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Öğretmen|Eğitmen/i);
    expect(draft.formValues.sector).toBe('Eğitim');
    expect(draft.formValues.city).toBe('Eskişehir');
  });

  // 9. Heavy Vehicle Driver (TIR)
  it('Fixture 09: Long Haul Heavy Vehicle Driver CV', () => {
    const cv = `
Cemal Koç
Adana / Seyhan
Şoför (Kamyon / TIR)

İŞ GEÇMİŞİ
Mars Lojistik (2016 - 2023)
Ağır Vasıta Şoförü
Avrupa ve Balkanlar hattında TIR şoförlüğü.

EĞİTİM
Seyhan Endüstri Meslek Lisesi (Lise) - 2014
BELGELER: SRC 3, SRC 4, Psikoteknik, Dijital Takograf, E Sınıfı Ehliyet
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv09.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Şoför|Sürücü/i);
    expect(draft.formValues.city).toBe('Adana');
  });

  // 10. Luxury Hotel Front Desk / Hotel Manager
  it('Fixture 10: Hotel General Manager CV', () => {
    const cv = `
Bülent Güneş
Muğla / Bodrum
Otel Müdürü

DENEYİM
Rixos Premium Bodrum (2018 - 2024)
Otel Müdürü
5 yıldızlı resort otel operasyon ve bütçe yönetimi.

EĞİTİM
Akdeniz Üniversitesi - Turizm ve Otel İşletmeciliği (Lisans) - 2015
DİLLER: İngilizce, Rusça, Almanca
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv10.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Otel Müdürü|Yönetici/i);
    expect(draft.formValues.sector).toBe('Turizm / Otelcilik');
    expect(draft.formValues.languages).toContain('İngilizce');
    expect(draft.formValues.languages).toContain('Rusça');
  });

  // 11. Industrial & Lean Manufacturing Engineer
  it('Fixture 11: Industrial Manufacturing Engineer CV', () => {
    const cv = `
Selin Arslan
Bursa / Nilüfer
Endüstri Mühendisi

İŞ TECRÜBESİ
Bosch Türkiye (2019 - 2024)
Endüstri Mühendisi
Yalın üretim, 5S, Kaizen ve montaj hattı dengeleme çalışmaları.

EĞİTİM
Uludağ Üniversitesi - Endüstri Mühendisliği (Lisans) - 2018
YETKİNLİKLER: Six Sigma, Kaizen, SAP PP, Minitab, AutoCAD
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv11.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Endüstri Mühendisi|Mühendis/i);
    expect(draft.formValues.city).toBe('Bursa');
  });

  // 12. Social Work Project Coordinator
  it('Fixture 12: NGO Social Work Coordinator CV', () => {
    const cv = `
Fatma Eren
Diyarbakır / Kayapınar
Sosyal Hizmet Uzmanı

İŞ DENEYİMİ
Kızılay Toplum Merkezi (2018 - 2024)
Sosyal Hizmet Uzmanı
Psikososyal destek programları ve saha vaka yönetimi.

EĞİTİM
Hacettepe Üniversitesi - Sosyal Hizmet (Lisans) - 2017
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv12.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toBe('Sosyal Hizmet Uzmanı');
    expect(draft.formValues.sector).toBe('Sosyal hizmet / STK');
  });

  // 13. QA Automation Engineer
  it('Fixture 13: QA Automation Lead CV', () => {
    const cv = `
Ozan Korkmaz
İstanbul / Kadıköy
Yazılım Test Mühendisi

İŞ DENEYİMİ
Trendyol (2020 - 2024)
Yazılım Test Mühendisi
Selenium, Cypress ve Appium ile uçtan uca test otomasyonu.

EĞİTİM
Yıldız Teknik Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2019
ARAÇLAR: Selenium, Cypress, Postman, JMeter, Jenkins, Git
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv13.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/QA|Test|Yazılım/i);
    expect(draft.formValues.tools).toContain('Selenium');
    expect(draft.formValues.tools).toContain('Cypress');
  });

  // 14. iOS & Flutter Mobile Lead
  it('Fixture 14: Mobile Application Developer CV', () => {
    const cv = `
Mert Saygın
İzmir / Karşıyaka
Mobil Uygulama Geliştirici

DENEYİM
Peak Games (2019 - 2024)
Mobil Uygulama Geliştirici
Flutter, Swift ve Kotlin ile iOS ve Android uygulamaları.

EĞİTİM
Ege Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2018
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv14.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Mobil Uygulama Geliştirici|Yazılım/i);
    expect(draft.formValues.sector).toBe('Bilişim / Yazılım');
  });

  // 15. Cyber Security SOC Analyst
  it('Fixture 15: Cyber Security SOC Analyst CV', () => {
    const cv = `
Alper Tunç
Ankara / Yenimahalle
Siber Güvenlik Uzmanı

DENEYİM
STM Savunma (2020 - 2024)
Siber Güvenlik Uzmanı
SIEM, Splunk, sızma testleri ve tehdit avcılığı.

EĞİTİM
TOBB ETÜ - Bilgisayar Mühendisliği (Lisans) - 2019
BELGELER: CEH, CompTIA Security+, OSCP
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv15.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Sistem Yöneticisi|Mühendis|Yazılım/i);
    expect(draft.formValues.tools).toMatch(/siem/i);
    expect(draft.formValues.certificates).toContain('CEH');
  });

  // 16. Investment Banking Portfolio Manager
  it('Fixture 16: Investment Portfolio Manager CV', () => {
    const cv = `
Ceren Bilge
İstanbul / Şişli
Finans Uzmanı

İŞ TECRÜBESİ
İş Yatırım (2017 - 2024)
Portföy Yöneticisi
BIST hisse senedi ve eurobond fon yönetimi.

EĞİTİM
Boğaziçi Üniversitesi - Ekonomi (Lisans) - 2016
BELGELER: SPK Düzey 3, SPK Türev Araçlar
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv16.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Portföy|Finans/i);
    expect(draft.formValues.sector).toBe('Finans / Bankacılık');
  });

  // 17. Intensive Care Nurse
  it('Fixture 17: Hospital Intensive Care Nurse CV', () => {
    const cv = `
Derya Yıldırım
Adana / Çukurova
Hemşire

DENEYİM
Adana Şehir Hastanesi (2018 - 2024)
Hemşire
Yetişkin yoğun bakım hasta bakımı ve ilaç uygulama takibi.

EĞİTİM
Çukurova Üniversitesi - Hemşirelik (Lisans) - 2017
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv17.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toBe('Hemşire');
    expect(draft.formValues.sector).toBe('Sağlık');
  });

  // 18. E-commerce SEO & Growth Manager
  it('Fixture 18: Digital Growth & SEO Specialist CV', () => {
    const cv = `
Onur Can
İstanbul / Kadıköy
Dijital Pazarlama Uzmanı

DENEYİM
Trendyol (2019 - 2024)
Dijital Pazarlama Uzmanı
Organik trafik büyümesi, Google Ads ve SEO optimizasyonu.

EĞİTİM
İstanbul Üniversitesi - İletişim Fakültesi (Lisans) - 2018
ARAÇLAR: Google Analytics, Semrush, Ahrefs, Google Ads
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv18.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toBe('Dijital Pazarlama Uzmanı');
    expect(draft.formValues.sector).toBe('Pazarlama / Reklam');
    expect(draft.formValues.tools).toContain('Google Analytics');
  });

  // 19. Retail Store Manager
  it('Fixture 19: Retail Store Manager CV', () => {
    const cv = `
Kemal Özdemir
Kayseri / Melikgazi
Mağaza Müdürü

İŞ GEÇMİŞİ
LC Waikiki (2016 - 2024)
Mağaza Müdürü
Mağaza ciro hedefleri, stok takibi ve 30 kişilik ekip yönetimi.

EĞİTİM
Erciyes Üniversitesi - İşletme (Lisans) - 2015
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv19.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toBe('Mağaza Müdürü');
    expect(draft.formValues.sector).toBe('Perakende / Mağaza');
  });

  // 20. Call Center Team Leader
  it('Fixture 20: Call Center Operations Supervisor CV', () => {
    const cv = `
Gülşen Aksoy
Malatya / Battalgazi
Çağrı Merkezi Takım Lideri

DENEYİM
Turkcell Global Bilgi (2018 - 2024)
Çağrı Merkezi Takım Lideri
Gelen çağrı kalite takibi, KPI raporlama ve müşteri memnuniyeti.

EĞİTİM
İnönü Üniversitesi - Büro Yönetimi (Ön Lisans) - 2017
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv20.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Çağrı Merkezi|Müşteri/i);
    expect(draft.formValues.sector).toMatch(/Çağrı merkezi|Müşteri hizmetleri/i);
  });

  // 21. Fresh Graduate with Academic Projects
  it('Fixture 21: Fresh Graduate Engineer with zero prior jobs CV', () => {
    const cv = `
Ece Doğan
Ankara / Çankaya
Yazılım Geliştirici

ÖZET
ODTÜ Bilgisayar Mühendisliği 2024 mezunu, yapay zeka ve web teknolojilerine odaklı yeni mezun.

EĞİTİM
Orta Doğu Teknik Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2024

PROJELER
- Üniversite Bitirme Projesi: LLM tabanlı soru-cevap asistanı
- Açık Kaynak Katkıları: React ve Node.js kütüphaneleri

YETKİNLİKLER: Python, PyTorch, React, TypeScript, Git
DİLLER: İngilizce, Türkçe
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv21.pdf');

    expect(res.experiences).toHaveLength(0); // 0 experiences, correct
    expect(draft.formValues.educationHistory?.length).toBeGreaterThanOrEqual(1);
    expect(draft.formValues.role).toBe('Yazılım Geliştirici');
    expect(draft.formValues.sector).toBe('Bilişim / Yazılım');
    expect(draft.formValues.tools).toContain('Python');
    expect(draft.formValues.tools).toContain('React');
  });

  // 22. Executive C-Level CFO (20+ Years Exp)
  it('Fixture 22: Executive C-Level CFO CV', () => {
    const cv = `
Turgut Öztürk
İstanbul / Beşiktaş
Finans Müdürü

DENEYİM
Zorlu Holding (2016 - 2024)
Finans Müdürü
Hazine yönetimi, banka ilişkileri ve 500M$ kredi yapılandırması.

Koç Holding (2008 - 2016)
Kıdemli Finansal Analist
Bütçe planlama ve yatırım fizibilite raporlaması.

PwC Türkiye (2003 - 2008)
Denetim Uzmanı
Uluslararası IFRS denetimi.

EĞİTİM
Koç Üniversitesi - Executive MBA (Yüksek Lisans) - 2007
Boğaziçi Üniversitesi - İşletme (Lisans) - 2002
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv22.pdf');

    expect(res.experiences).toHaveLength(3);
    expect(draft.formValues.role).toMatch(/Finans Müdürü|Finansal Analist/i);
    expect(draft.formValues.sector).toBe('Finans / Bankacılık');
    expect(draft.formValues.educationHistory?.length).toBeGreaterThanOrEqual(2);
  });

  // 23. English-Only ATS Software Engineer CV
  it('Fixture 23: English-Only ATS Standard Software Engineer CV', () => {
    const cv = `
John Smith
London / Remote
Senior Software Engineer

SUMMARY
Results-driven software engineer with 6+ years of experience in distributed systems and cloud architecture.

WORK EXPERIENCE
Monzo Bank (2020 - Present)
Senior Software Engineer
Designed microservices in Go and managed Kubernetes deployments on AWS.

Revolut (2018 - 2020)
Backend Developer
Built payment gateway integrations handling 1M+ daily transactions.

EDUCATION
Imperial College London - Computer Science (Bachelor) - 2017
SKILLS: Go, Kubernetes, Docker, AWS, PostgreSQL, Redis
LANGUAGES: English
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv23.pdf');

    expect(res.experiences).toHaveLength(2);
    expect(draft.formValues.role).toMatch(/Yazılım Geliştirici|Backend/i);
    expect(draft.formValues.sector).toBe('Bilişim / Yazılım');
    expect(draft.formValues.tools).toContain('Docker');
    expect(draft.formValues.tools).toContain('Kubernetes');
    expect(draft.formValues.languages).toContain('İngilizce');
  });

  // 24. Two-Column Layout Architect CV
  it('Fixture 24: Two-Column Architect CV', () => {
    const cv = `
Mimar Selen Taş
İzmir / Urla
Mimar

İŞ DENEYİMİ
Tabanlıoğlu Mimarlık (2018 - 2024)
Mimar
Kentsel tasarım, villa ve karma konsept proje çizimleri.

EĞİTİM
Dokuz Eylül Üniversitesi - Mimarlık Fakültesi (Lisans) - 2017
YETKİNLİKLER: Revit, AutoCAD, 3ds Max, Lumion, Photoshop
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv24.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toBe('Mimar');
    expect(draft.formValues.sector).toBe('İnşaat / Gayrimenkul');
    expect(draft.formValues.tools).toContain('Autocad');
    expect(draft.formValues.tools).toContain('Revit');
  });

  // 25. Cyber Security Penetration Tester & Red Team Lead
  it('Fixture 25: Penetration Tester & Security Researcher CV', () => {
    const cv = `
Taha Demir
Ankara / Çankaya
Siber Güvenlik Uzmanı

DENEYİM
Havelsan (2019 - 2024)
Siber Güvenlik Uzmanı
Web ve mobil uygulama sızma testleri, kod analizi ve SIEM log analizi.

EĞİTİM
Gazi Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2018
BELGELER: OSCP, CEH, ISO 27001
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv25.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Sistem Yöneticisi|Mühendis|Yazılım/i);
    expect(draft.formValues.tools).toMatch(/siem/i);
    expect(draft.formValues.certificates).toContain('CEH');
    expect(draft.formValues.certificates).toContain('ISO 27001');
  });

  // 26. Corporate HR Business Partner
  it('Fixture 26: HR Business Partner CV', () => {
    const cv = `
Seda Aydın
İstanbul / Ataşehir
İnsan Kaynakları Uzmanı

DENEYİM
Unilever Türkiye (2019 - 2024)
İnsan Kaynakları İş Ortağı
Performans değerlendirme, yetenek yönetimi ve bordro süreçleri.

EĞİTİM
Marmara Üniversitesi - Çalışma Ekonomisi (Lisans) - 2018
YETKİNLİKLER: SAP HR, Bordro, İş Hukuku, İşe Alım
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv26.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/İnsan Kaynakları/i);
    expect(draft.formValues.sector).toBe('İnsan kaynakları');
  });

  // 27. English Literature Academic Lecturer
  it('Fixture 27: Academic Lecturer CV', () => {
    const cv = `
Dr. Öğr. Üyesi Berk Sezgin
Ankara / Çankaya
Öğretim Görevlisi

DENEYİM
Hacettepe Üniversitesi (2017 - 2024)
Öğretim Görevlisi
İngiliz Dili ve Edebiyatı lisans ve yüksek lisans dersleri.

EĞİTİM
Hacettepe Üniversitesi - İngiliz Dili ve Edebiyatı (Doktora) - 2016
Bilkent Üniversitesi - İngiliz Dili ve Edebiyatı (Lisans) - 2011
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv27.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Eğitmen|Öğretmen|Akademisyen|Öğretim Görevlisi/i);
    expect(draft.formValues.sector).toBe('Eğitim');
    expect(draft.formValues.educationHistory?.length).toBeGreaterThanOrEqual(2);
  });

  // 28. Data Engineer & ETL Specialist
  it('Fixture 28: Data Engineer & ETL Specialist CV', () => {
    const cv = `
Volkan Güler
İstanbul / Sarıyer
Veri Mühendisi

DENEYİM
Trendyol (2020 - 2024)
Data Engineer
Apache Spark, Airflow ve Snowflake ile büyük veri boru hatları tasarımı.

EĞİTİM
İTÜ - Bilgisayar Mühendisliği (Lisans) - 2019
TEKNOLOJİLER: Python, SQL, Apache Spark, Airflow, Snowflake, Kafka
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv28.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Veri Mühendisi|Data/i);
    expect(draft.formValues.sector).toMatch(/Bilişim|Yapay zeka/i);
    expect(draft.formValues.tools?.toLowerCase()).toContain('python');
    expect(draft.formValues.tools?.toLowerCase()).toContain('sql');
  });

  // 29. Commercial Real Estate Appraiser
  it('Fixture 29: Real Estate Consultant & Appraiser CV', () => {
    const cv = `
Metin Tuncer
İzmir / Karşıyaka
Gayrimenkul Danışmanı

İŞ GEÇMİŞİ
Coldwell Banker (2018 - 2024)
Gayrimenkul Danışmanı
Ticari gayrimenkul değerleme, portföy pazarlama ve kiralama.

EĞİTİM
Dokuz Eylül Üniversitesi - İktisat (Lisans) - 2017
BELGELER: SPK Gayrimenkul Değerleme Lisansı
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv29.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Gayrimenkul/i);
    expect(draft.formValues.sector).toBe('İnşaat / Gayrimenkul');
  });

  // 30. Executive Assistant & Office Manager
  it('Fixture 30: Executive Assistant & Office Manager CV', () => {
    const cv = `
Nazlı Erdem
İstanbul / Şişli
Ofis Yöneticisi

DENEYİM
Eczacıbaşı Holding (2017 - 2024)
Ofis Yöneticisi
Yönetim kurulu ajanda takibi, seyahat planlama ve ofis bütçe yönetimi.

EĞİTİM
İstanbul Üniversitesi - İşletme (Lisans) - 2016
DİLLER: İngilizce, Türkçe
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv30.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Ofis Yöneticisi|Yönetici/i);
    expect(draft.formValues.city).toBe('İstanbul');
  });

  // 31. Biomedical Equipment Specialist
  it('Fixture 31: Biomedical Equipment Specialist CV', () => {
    const cv = `
Cihan Kaya
Samsun / İlkadım
Teknisyen

İŞ DENEYİMİ
Samsun Eğitim Araştırma Hastanesi (2018 - 2024)
Biyomedikal Teknisyeni
MR, Tomografi ve diyaliz cihazlarının periyodik bakım ve kalibrasyonu.

EĞİTİM
Ondokuz Mayıs Üniversitesi - Biyomedikal Cihaz Teknolojisi (Ön Lisans) - 2017
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv31.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Teknisyen|Teknik/i);
    expect(draft.formValues.sector).toBe('Sağlık');
  });

  // 32. Supply Chain & SAP MM/SD Procurement Specialist
  it('Fixture 32: Procurement & Supply Chain Specialist CV', () => {
    const cv = `
Hande Vural
Manisa / Yunusemre
Lojistik Uzmanı

DENEYİM
Vestel Elektronik (2019 - 2024)
Satınalma Uzmanı
SAP MM modülü ile hammadde tedarik ve tedarikçi sözleşme yönetimi.

EĞİTİM
Celal Bayar Üniversitesi - İktisat (Lisans) - 2018
ARAÇLAR: SAP MM, SAP SD, Excel
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv32.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Lojistik Uzmanı|Satınalma/i);
    expect(draft.formValues.sector).toBe('Lojistik / Depolama');
    expect(draft.formValues.tools?.toLowerCase()).toContain('sap');
  });

  // 33. Database Administrator (DBA)
  it('Fixture 33: Database Administrator (DBA) CV', () => {
    const cv = `
Serkan Çelik
Ankara / Yenimahalle
Sistem Yöneticisi

İŞ TECRÜBESİ
Türksat (2018 - 2024)
Veritabanı Yöneticisi
PostgreSQL ve Oracle veritabanı replikasyonu, yedekleme ve performans tuning.

EĞİTİM
Hacettepe Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2017
TEKNOLOJİLER: PostgreSQL, Oracle, MySQL, Redis, Linux
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv33.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Sistem Yöneticisi|Yazılım/i);
    expect(draft.formValues.sector).toBe('Bilişim / Yazılım');
    expect(draft.formValues.tools?.toLowerCase()).toContain('postgresql');
  });

  // 34. Digital Content Creator & Copywriter
  it('Fixture 34: Digital Copywriter & Content Creator CV', () => {
    const cv = `
Melis Yurt
İstanbul / Beyoğlu
Sosyal Medya Uzmanı

DENEYİM
Medina Turgul DDB (2020 - 2024)
İçerik Uzmanı
Sosyal medya metin yazarlığı, kreatif kampanya tasarımı ve blog içerikleri.

EĞİTİM
Bilgi Üniversitesi - Reklamcılık (Lisans) - 2019
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv34.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/İçerik|Sosyal Medya|Pazarlama/i);
    expect(draft.formValues.sector).toBe('Pazarlama / Reklam');
  });

  // 35. Mechanical HVAC Installation Engineer
  it('Fixture 35: Mechanical HVAC Engineer CV', () => {
    const cv = `
Bora Keskin
Antalya / Muratpaşa
Mühendis (Makine)

DENEYİM
Alarko Carrier (2017 - 2024)
Mekanik Tesisat Mühendisi
VRF klima sistemleri, yangın tesisatı ve havalandırma projelendirmesi.

EĞİTİM
Akdeniz Üniversitesi - Makine Mühendisliği (Lisans) - 2016
YETKİNLİKLER: AutoCAD, Revit MEP, Isı Kaybı Hesabı
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv35.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Makine|Mühendis/i);
    expect(draft.formValues.city).toBe('Antalya');
  });

  // 36. Risk Management & Credit Rating Analyst
  it('Fixture 36: Credit Risk & Financial Analyst CV', () => {
    const cv = `
Gözde Güler
İstanbul / Maslak
Finansal Analist

İŞ DENEYİMİ
Yapı Kredi (2019 - 2024)
Risk Analisti
Kurumsal kredi derecelendirme ve portföy risk modelleri.

EĞİTİM
Marmara Üniversitesi - Ekonometri (Lisans) - 2018
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv36.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Finans|Analist/i);
    expect(draft.formValues.sector).toBe('Finans / Bankacılık');
  });

  // 37. Front Desk Receptionist & Guest Relations
  it('Fixture 37: Tourism Front Desk Receptionist CV', () => {
    const cv = `
Duygu Çetin
Nevşehir / Ürgüp
Otel Resepsiyonisti

DENEYİM
Museum Hotel Cappadocia (2020 - 2024)
Otel Resepsiyonisti
Otel misafir karşılama, check-in/out ve tur rezervasyonları.

EĞİTİM
Nevşehir Hacı Bektaş Veli Üniversitesi - Turizm ve Otelcilik (Ön Lisans) - 2019
DİLLER: İngilizce, Türkçe
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv37.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Resepsiyonist|Otel/i);
    expect(draft.formValues.sector).toBe('Turizm / Otelcilik');
  });

  // 38. E-Commerce Category Manager
  it('Fixture 38: E-Commerce Category Manager CV', () => {
    const cv = `
Tarık Yavuz
İstanbul / Şişli
Ürün Yöneticisi

DENEYİM
Hepsiburada (2018 - 2024)
Kategori Yöneticisi
Elektronik kategorisi ciro ve marj hedefleri, tedarikçi müzakereleri.

EĞİTİM
İstanbul Üniversitesi - İktisat (Lisans) - 2017
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv38.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Ürün Yöneticisi|Kategori/i);
    expect(draft.formValues.city).toBe('İstanbul');
  });

  // 39. Cloud Security Architect
  it('Fixture 39: Cloud Infrastructure & Security Architect CV', () => {
    const cv = `
Eray Şen
İstanbul / Kadıköy
DevOps / Cloud Mühendisi

DENEYİM
Vodafone Türkiye (2017 - 2024)
Cloud Architect
AWS ve Azure ortamlarında multi-cloud altyapı ve güvenlik mimarisi.

EĞİTİM
İTÜ - Bilgisayar Mühendisliği (Lisans) - 2016
BELGELER: AWS Certified, CISSP
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv39.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/DevOps|Cloud|Yazılım/i);
    expect(draft.formValues.sector).toBe('Bilişim / Yazılım');
    expect(draft.formValues.certificates).toContain('AWS Certified');
  });

  // 40. Retail Merchandiser & Buyer
  it('Fixture 40: Retail Merchandiser & Buyer CV', () => {
    const cv = `
Banu Akın
Bursa / Osmangazi
Satış Danışmanı

DENEYİM
Boyner Grup (2018 - 2024)
Kategori Satınalma Uzmanı
Tekstil ve hazır giyim ürün seçimi ve sezonluk bütçe planlama.

EĞİTİM
Uludağ Üniversitesi - Tekstil Mühendisliği (Lisans) - 2017
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv40.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.sector).toMatch(/Perakende|Satış|Lojistik/i);
  });

  // 41. Agricultural Engineer & Irrigation Specialist
  it('Fixture 41: Agricultural Irrigation Engineer CV', () => {
    const cv = `
Fatih Doğan
Adana / Yüreğir
Mühendis (Endüstri)

DENEYİM
Toros Tarım (2019 - 2024)
Ziraat Mühendisi
Damla sulama sistemleri, toprak analizi ve gübreleme danışmanlığı.

EĞİTİM
Çukurova Üniversitesi - Ziraat Fakültesi (Lisans) - 2018
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv41.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.city).toBe('Adana');
  });

  // 42. Video Editor & 3D Motion Graphics Artist
  it('Fixture 42: Video Editor & Motion Graphics Artist CV', () => {
    const cv = `
Kaan Parlak
İstanbul / Beşiktaş
Grafik Tasarımcı

DENEYİM
Acun Medya (2020 - 2024)
Video Editörü
Premiere Pro ve After Effects ile televizyon programı kurgusu.

EĞİTİM
Mimar Sinan Güzel Sanatlar Üniversitesi - Sinema TV (Lisans) - 2019
ARAÇLAR: Premiere Pro, After Effects, Photoshop, Blender
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv42.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Grafik Tasarımcı|Video|Tasarım/i);
    expect(draft.formValues.sector).toMatch(/Pazarlama|Tasarım/i);
  });

  // 43. Medical Sales Representative
  it('Fixture 43: Medical Sales Representative CV', () => {
    const cv = `
Erhan Mutlu
Adana / Seyhan
Saha Satış Uzmanı

İŞ TECRÜBESİ
Abdi İbrahim İlaç (2018 - 2024)
Tıbbi Satış Mümessili
Hastaneler ve hekim ziyaretleri ile ürün tanıtımı ve satış hedefleri.

EĞİTİM
Çukurova Üniversitesi - Biyoloji (Lisans) - 2017
BELGELER: ÜTEH Belgesi, B Sınıfı Ehliyet
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv43.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Satış/i);
    expect(draft.formValues.sector).toMatch(/Satış|Sağlık/i);
  });

  // 44. Customer Success Specialist & Zendesk Admin
  it('Fixture 44: Customer Success Specialist CV', () => {
    const cv = `
Gizem Kurt
İstanbul / Ümraniye
Müşteri Başarı Uzmanı

DENEYİM
Insider (2020 - 2024)
Müşteri Başarı Uzmanı
Kurumsal SaaS müşterileri onboarding, churn azaltma ve Zendesk yönetimi.

EĞİTİM
Marmara Üniversitesi - İletişim (Lisans) - 2019
ARAÇLAR: Zendesk, Jira, Hubspot, Excel
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv44.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Müşteri Başarı Uzmanı|Müşteri/i);
    expect(draft.formValues.sector).toMatch(/Müşteri hizmetleri|Bilişim/i);
  });

  // 45. Electrical Grid & High Voltage Engineer
  it('Fixture 45: High Voltage Electrical Maintenance Engineer CV', () => {
    const cv = `
Halil Bozkurt
Kahramanmaraş / Dulkadiroğlu
Mühendis (Elektrik)

DENEYİM
Toroslar EDAŞ (2017 - 2024)
Elektrik Mühendisi
Yüksek gerilim trafo merkezleri bakım, onarım ve SCADA kontrolü.

EĞİTİM
Kahramanmaraş Sütçü İmam Üniversitesi - Elektrik-Elektronik Mühendisliği (Lisans) - 2016
BELGELER: EMO Yüksek Gerilim İşletme Sorumluluğu
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv45.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Elektrik|Mühendis/i);
    expect(draft.formValues.city).toBe('Kahramanmaraş');
  });

  // 46. Graphic Designer & Brand Illustrator
  it('Fixture 46: Brand Graphic Designer CV', () => {
    const cv = `
Pelin Aksoy
İzmir / Konak
Grafik Tasarımcı

DENEYİM
Tribal Worldwide (2019 - 2024)
Grafik Tasarımcı
Kurumsal kimlik, logo, ambalaj ve sosyal medya görsel tasarımları.

EĞİTİM
Dokuz Eylül Üniversitesi - Güzel Sanatlar Fakültesi (Lisans) - 2018
ARAÇLAR: Illustrator, Photoshop, InDesign, Figma
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv46.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Grafik Tasarımcı|Tasarım/i);
    expect(draft.formValues.city).toBe('İzmir');
  });

  // 47. Insurance Underwriting & Claims Specialist
  it('Fixture 47: Insurance Underwriting Specialist CV', () => {
    const cv = `
Barış Ertekin
İstanbul / Kadıköy
Sigorta Danışmanı

DENEYİM
Anadolu Sigorta (2018 - 2024)
Underwriter
Kasko, yangın ve nakliyat poliçeleri risk kabul ve hasar onay süreçleri.

EĞİTİM
Marmara Üniversitesi - Bankacılık ve Sigortacılık (Lisans) - 2017
BELGELER: SEGEM, BES
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv47.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Sigorta|Operasyon/i);
    expect(draft.formValues.sector).toBe('Sigorta');
    expect(draft.formValues.certificates).toContain('SEGEM');
  });

  // 48. Kindergarten & Early Childhood Teacher
  it('Fixture 48: Kindergarten Teacher CV', () => {
    const cv = `
Büşra Şimşek
Denizli / Pamukkale
Eğitmen / Öğretmen

DENEYİM
Özel Neşeli Çocuklar Anaokulu (2019 - 2024)
Okul Öncesi Öğretmeni
Montessori ve Reggio Emilia pedagojik metodları ile okul öncesi eğitimi.

EĞİTİM
Pamukkale Üniversitesi - Okul Öncesi Öğretmenliği (Lisans) - 2018
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv48.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Öğretmen|Eğitmen/i);
    expect(draft.formValues.sector).toBe('Eğitim');
  });

  // 49. AI / Machine Learning Research Scientist
  it('Fixture 49: Machine Learning Research Scientist CV', () => {
    const cv = `
Dr. Koray Yılmaz
İstanbul / Sarıyer
Yapay Zeka / ML Mühendisi

DENEYİM
Huawei Ar-Ge Merkezi (2020 - 2024)
Yapay Zeka Uzmanı
Doğal Dil İşleme (NLP), Transformer modelleri ve LLM fine-tuning.

EĞİTİM
Koç Üniversitesi - Bilgisayar Mühendisliği (Doktora) - 2020
Boğaziçi Üniversitesi - Bilgisayar Mühendisliği (Lisans) - 2015
TEKNOLOJİLER: Python, PyTorch, TensorFlow, HuggingFace, CUDA
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv49.pdf');

    expect(res.experiences).toHaveLength(1);
    expect(draft.formValues.role).toMatch(/Yapay Zeka|Yazılım/i);
    expect(draft.formValues.sector).toMatch(/Yapay zeka|Bilişim/i);
    expect(draft.formValues.educationHistory?.length).toBeGreaterThanOrEqual(2);
  });

  // 50. Multi-Company Executive Operations Director CV (15+ Years)
  it('Fixture 50: Executive Multi-Company Operations Director CV', () => {
    const cv = `
Ahmet Kenan Berk
İstanbul / Maltepe
Operasyon Müdürü

DENEYİM
Borusan Lojistik (2019 - 2024)
Operasyon Direktörü
Türkiye geneli 12 transfer merkezi ve 1500 personellik operasyon yönetimi.

DHL Supply Chain (2014 - 2019)
Operasyon Müdürü
Otomotiv ve perakende depo lojistiği yönetimi.

Ekol Lojistik (2009 - 2014)
Lojistik Uzmanı
Uluslararası taşımacılık operasyonları.

EĞİTİM
İstanbul Teknik Üniversitesi - Endüstri Mühendisliği (Lisans) - 2008
YETKİNLİKLER: P&L Yönetimi, Kaizen, Six Sigma, Tedarik Zinciri
`;
    const res = extractDeterministicCv(cv);
    const canonical = mapCvToCanonicalTaxonomy(res);
    const draft = buildProfileDraftFromCanonicalResult(canonical, 'cv50.pdf');

    expect(res.experiences).toHaveLength(3);
    expect(draft.formValues.role).toMatch(/Operasyon Müdürü|Lojistik|Yönetici/i);
    expect(draft.formValues.sector).toMatch(/Lojistik|Operasyon/i);
    expect(draft.formValues.experienceLevel).toMatch(/Direktör|Yönetici|Senior/i);
  });
});

