import { describe, expect, it } from 'vitest';
import { scoreCandidateSkill } from './cv-candidate-scorer';
import type { CvZoneType } from './cv-document-zoning';

describe('CV Extraction Engine 13.0 — Skill Evidence Purity & Forensic Classification Suite (300 Tests)', () => {
  // Test Category 1: Explicit Valid Skills in SKILLS zone (Tests 1-50)
  const validExplicitSkills = [
    'React', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Python',
    'Java', 'TypeScript', 'GraphQL', 'Redis', 'Kafka', 'Apache Spark', 'Terraform',
    'Ansible', 'Git', 'CI/CD', 'Figma', 'Jira', 'SAP', 'Excel', 'Tableau',
    'Power BI', 'C++', 'C#', 'Go', 'Rust', 'Swift', 'Kotlin', 'Flutter',
    'MongoDB', 'Elasticsearch', 'REST API', 'Microservices', 'Linux', 'Bash',
    'Spring Boot', 'Next.js', 'Vue.js', 'Angular', 'Django', 'Flask', 'FastAPI',
    'Selenium', 'Cypress', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'Pandas', 'NumPy',
  ];

  validExplicitSkills.forEach((skill, index) => {
    it(`[SKILL_VALID_${index + 1}/300] Valid explicit skill in SKILLS zone: "${skill}" is accepted`, () => {
      const res = scoreCandidateSkill(skill, {
        zone: 'SKILLS',
        isExplicitSkillSection: true,
        rawLine: `• ${skill}`,
      });

      expect(res.isAccepted).toBe(true);
      expect(res.value).toBe(skill);
      expect(res.classification).toBe('EXPLICIT_SKILL');
      expect(res.negativeEvidence.length).toBe(0);
      expect(res.positiveEvidence).toContain('EXPLICIT_SKILL_SECTION_SOURCE');
    });
  });

  // Test Category 2: Disqualification of Job Titles as Skills (Tests 51-100)
  const forbiddenJobTitles = [
    'Müdür', 'Yönetici', 'Uzman', 'Direktör', 'Mühendis', 'Geliştirici',
    'Analist', 'Danışman', 'Başkan', 'Lider', 'Temsilci', 'Sorumlu',
    'Asistan', 'Operatör', 'Teknisyen', 'Tekniker', 'Stajyer', 'Eleman',
    'Koordinatör', 'Memur', 'Denetçi', 'Muhasebeci', 'Doktor', 'Hemşire',
    'Avukat', 'Öğretmen', 'Tasarımcı', 'Mimar', 'Psikolog', 'Cerrah',
    'Developer', 'Engineer', 'Manager', 'Director', 'Lead', 'Consultant',
    'Analyst', 'Specialist', 'Officer', 'Head', 'VP', 'CEO', 'CTO', 'CFO',
    'COO', 'Şef', 'Kaptan', 'Zabit', 'Bölge Müdürü', 'Genel Müdür',
  ];

  forbiddenJobTitles.forEach((title, index) => {
    it(`[SKILL_FORBIDDEN_ROLE_${index + 51}/300] Standalone job title "${title}" is REJECTED as skill`, () => {
      const res = scoreCandidateSkill(title, {
        zone: 'SKILLS',
        isExplicitSkillSection: true,
        rawLine: title,
      });

      expect(res.isAccepted).toBe(false);
      expect(res.classification).toBe('JOB_TITLE_FRAGMENT');
      expect(res.negativeEvidence).toContain('STANDALONE_JOB_TITLE_AS_SKILL_PROHIBITED');
    });
  });

  // Test Category 3: Disqualification of Organization/Company Names as Skills (Tests 101-150)
  const forbiddenCompanies = [
    'Holding', 'Şirketi', 'Anonim Şirketi', 'Limited Şti', 'A.Ş.',
    'Banka A.Ş.', 'İstanbul Üniversitesi', 'Hukuk Fakültesi', 'Belediyesi',
    'Bakanlığı', 'Genel Müdürlüğü', 'Devlet Hastanesi', 'Özel Poliklinik',
    'Spor Kulübü', 'Vakfı', 'Ticaret Odası', 'İhracatçılar Birliği', 'Kalkınma Ajansı',
    'Teknokent A.Ş.', 'Lisesi', 'Koleji', 'Akademisi', 'Meslek Yüksekokulu',
    'Fen Edebiyat Fakültesi', 'Sosyal Bilimler Enstitüsü', 'Lisans Programı',
    'Trendyol A.Ş.', 'Hepsiburada Ltd', 'Getir Perakende', 'Siemens Sanayi',
    'Bosch Fren A.Ş.', 'Koç Holding', 'Sabancı Holding', 'Eczacıbaşı Holding',
    'Aselsan A.Ş.', 'Tusaş Havacılık', 'Roketsan A.Ş.', 'Havelsan Ltd',
    'Garanti Bankası', 'İş Bankası', 'Yapı Kredi', 'Akbank A.Ş.', 'Ziraat Bankası',
    'Vakıfbank A.Ş.', 'Halkbank', 'QNB Finansbank', 'Denizbank A.Ş.',
    'Big Chefs Restoran', 'Midpoint Gıda', 'Defacto Mağazacılık', 'LC Waikiki A.Ş.',
  ];

  forbiddenCompanies.forEach((comp, index) => {
    it(`[SKILL_FORBIDDEN_COMPANY_${index + 101}/300] Corporate entity "${comp}" is REJECTED as skill`, () => {
      const res = scoreCandidateSkill(comp, {
        zone: 'SKILLS',
        isExplicitSkillSection: true,
        rawLine: comp,
      });

      expect(res.isAccepted).toBe(false);
      expect(res.classification).toBe('COMPANY_TERM');
      expect(res.negativeEvidence).toContain('ORGANIZATION_OR_COMPANY_AS_SKILL_PROHIBITED');
    });
  });

  // Test Category 4: Disqualification of Cities & Location Words as Skills (Tests 151-200)
  const forbiddenLocations = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya',
    'Gaziantep', 'Şanlıurfa', 'Kocaeli', 'Mersin', 'Diyarbakır', 'Hatay',
    'Manisa', 'Kayseri', 'Samsun', 'Balıkesir', 'Kahramanmaraş', 'Van',
    'Aydın', 'Tekirdağ', 'Denizli', 'Sakarya', 'Muğla', 'Eskişehir', 'Mardin',
    'Trabzon', 'Malatya', 'Ordu', 'Erzurum', 'Afyonkarahisar', 'Sivas',
    'Maltepe', 'Kadıköy', 'Beşiktaş', 'Üsküdar', 'Şişli', 'Bakırköy',
    'Ataşehir', 'Ümraniye', 'Pendik', 'Kartal', 'Çankaya', 'Yenimahalle',
    'Bornova', 'Karşıyaka', 'Nilüfer', 'Osmangazi', 'Muratpaşa', 'Seyhan',
  ];

  forbiddenLocations.forEach((loc, index) => {
    it(`[SKILL_FORBIDDEN_LOCATION_${index + 151}/300] Location word "${loc}" is REJECTED as skill in contact/header`, () => {
      const res = scoreCandidateSkill(loc, {
        zone: 'CONTACT',
        isExplicitSkillSection: false,
        rawLine: loc,
      });

      expect(res.isAccepted).toBe(false);
      expect(res.classification).toBe('LOCATION_TERM');
      expect(res.negativeEvidence).toContain('LOCATION_WORD_AS_SKILL_PROHIBITED');
    });
  });

  // Test Category 5: Disqualification of Natural Languages as Skills (Tests 201-230)
  const forbiddenLanguages = [
    'İngilizce', 'Almanca', 'Fransızca', 'İspanyolca', 'İtalyanca', 'Rusça',
    'Arapça', 'Çince', 'Türkçe', 'English', 'German', 'French', 'Spanish',
    'Turkish', 'ingilizce', 'almanca', 'fransizca', 'ispanyolca', 'italyanca',
    'rusca', 'arapca', 'cince', 'turkce', 'english', 'german', 'french',
    'spanish', 'turkish', 'İngilizce - İleri', 'Almanca - B2',
  ];

  forbiddenLanguages.forEach((lang, index) => {
    it(`[SKILL_FORBIDDEN_LANG_${index + 201}/300] Spoken language "${lang}" is REJECTED as skill`, () => {
      const res = scoreCandidateSkill(lang, {
        zone: 'SKILLS',
        isExplicitSkillSection: true,
        rawLine: lang,
      });

      expect(res.isAccepted).toBe(false);
      expect(res.classification).toBe('LANGUAGE');
      expect(res.negativeEvidence).toContain('LANGUAGE_AS_SKILL_PROHIBITED');
    });
  });

  // Test Category 6: Disqualification of Verbal Nouns & Responsibility Sentences (Tests 231-270)
  const forbiddenResponsibilities = [
    'Müşteri memnuniyet süreçlerinin takibinin yapılması',
    'Satış bütçesi ve fiili maliyet analizlerinin yürütülmesi',
    'Yıllık denetim planlarının hazırlanması ve uygulanması',
    'Ekip performans hedeflerinin belirlenmesi ve takibi',
    'Sipariş süreçlerinin uçtan uca yönetimi ve raporlanması',
    'Mali tabloların IFRS standartlarına uygun oluşturulması',
    'Şantiye hakediş ve metraj kontrollerinin sağlanması',
    'Gümrük ve mevzuat uygunluk süreçlerinin yürütülmesi',
    'Veri tabanı yedekleme ve felaket kurtarma planlaması',
    'Tedarikçi sözleşmelerinin hazırlanması ve müzakeresi',
    'Kalite yönetim sistemi dokümantasyonunun oluşturulması',
    'Dijital pazarlama kampanyalarının optimizasyonu ve takibi',
    'Müşteri şikayetlerinin çözümü ve raporlanması',
    'Üretim hattı arıza bakım süreçlerinin yürütülmesi',
    'İşe alım ve yetenek kazanımı süreçlerinin takibi',
    'Depo stok ve sevkiyat operasyonlarının yönetimi',
    'Hukuki sözleşmelerin incelenmesi ve risk analizi yapılması',
    'Sosyal medya içerik takviminin hazırlanması',
    'Mağaza görsel düzenleme standartlarının uygulanması',
    'Çağrı merkezi gelen çağrı kalitesinin takibi',
    'Aylık ciro ve kârlılık hedeflerinin takip edilmesi',
    'İç denetim ve uyum raporlarının sunulması',
    'Personel bordro ve özlük işlerinin yürütülmesi',
    'Satın alma onay mekanizmalarının işletilmesi',
    'Yazılım mimarisi güvenlik testlerinin yapılması',
    'Laboratuvar analiz sonuçlarının doğrulanması',
    'Uçak hat bakım kontrollerinin eksiksiz yürütülmesi',
    'Restoran mutfak hijyen standartlarının takibi',
    'Trafik ve filo operasyonlarının koordinasyonu',
    'Öğrenci başarı grafiklerinin analizi ve raporlanması',
    'Bütçe sapma raporlarının yönetime sunulması',
    'ERP geçiş süreçlerinin koordinasyonunun sağlanması',
    'İş güvenliği ve işçi sağlığı önlemlerinin alınması',
    'Müşteri ilişkileri yönetim stratejilerinin geliştirilmesi',
    'Ar-Ge proje dosyalarının hazırlanması ve takibi',
    'Patent ve marka başvuru süreçlerinin yürütülmesi',
    'Lojistik dağıtım rotalarının optimize edilmesi',
    'Hasta kayıt ve taburcu işlemlerinin yürütülmesi',
    'Kredi risk değerlendirme raporlarının oluşturulması',
    'Ürün yaşam döngüsü analizlerinin gerçekleştirilmesi',
  ];

  forbiddenResponsibilities.forEach((resp, index) => {
    it(`[SKILL_FORBIDDEN_RESP_${index + 231}/300] Responsibility clause "${resp.slice(0, 30)}..." is REJECTED as skill`, () => {
      const res = scoreCandidateSkill(resp, {
        zone: 'EXPERIENCE',
        isExplicitSkillSection: false,
        rawLine: resp,
      });

      expect(res.isAccepted).toBe(false);
      expect(res.classification).toBe('JOB_RESPONSIBILITY');
      expect(res.negativeEvidence).toContain('RESPONSIBILITY_CLAUSE_AS_SKILL_PROHIBITED');
    });
  });

  // Test Category 7: Disqualification of Generic Stop Words & Non-Skills (Tests 271-300)
  const forbiddenGenericWords = [
    'iş', 'çalışma', 'deneyim', 'bilgi', 'süreç', 'alan', 'konu', 'tarih',
    'yıl', 'ay', 'gün', 'seviye', 'orta', 'ileri', 'başlangıç', 'temel',
    'derece', 'is', 'calisma', 'deneyim', 'bilgi', 'surec', 'alan', 'konu',
    'tarih', 'yil', 'ay', 'gun', 'seviye', 'orta',
  ];

  forbiddenGenericWords.forEach((word, index) => {
    it(`[SKILL_FORBIDDEN_GENERIC_${index + 271}/300] Generic stop word "${word}" is REJECTED as skill`, () => {
      const res = scoreCandidateSkill(word, {
        zone: 'SKILLS',
        isExplicitSkillSection: true,
        rawLine: word,
      });

      expect(res.isAccepted).toBe(false);
      expect(res.classification).toBe('GENERIC_WORD');
      expect(res.negativeEvidence).toContain('GENERIC_STOP_WORD_AS_SKILL_PROHIBITED');
    });
  });
});
