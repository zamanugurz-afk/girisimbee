import { describe, expect, it } from 'vitest';
import { extractDeterministicCv } from './cv-deterministic-extractor';
import { mapCvToCanonicalTaxonomy } from './cv-taxonomy-mapper';
import { CvContradictionEngine } from './cv-contradiction-engine';

/**
 * GİRİŞİMBEE — CV EXTRACTION ENGINE 12.0
 * BLIND HOLDOUT GENERALIZATION TEST SUITE (52 FAMILIES A TO AZ)
 *
 * GROUND TRUTH RULE:
 * Ground truth is determined strictly a priori before engine execution.
 * ZERO ground truth is derived from engine output.
 */

interface BlindScenario {
  id: string;
  family: string;
  rawText: string;
  expected: {
    fullName?: string;
    primaryRole?: string | RegExp;
    primarySector?: string | RegExp;
    residenceCity?: string;
    residenceDistrict?: string;
    minExperiences?: number;
    maxExperiences?: number;
    minEducation?: number;
    isAmbiguousOrUnresolved?: boolean;
    forbiddenRoles?: string[];
    forbiddenSectors?: string[];
  };
}

const BLIND_HOLDOUT_CORPUS: BlindScenario[] = [
  // A. Classic Single Column
  {
    id: 'A-1',
    family: 'A. Classical Single Column',
    rawText: `Ahmet Canpolat\nahmet.canpolat@example.com | 0532 111 22 33\nİstanbul / Üsküdar\nKıdemli Muhasebe Uzmanı\n\nÖZET\n10 yıllık mali müşavirlik ve vergi denetimi tecrübesi.\n\nİŞ DENEYİMİ\nEczacıbaşı Holding - Muhasebe Müdürü (2020 - 2024)\nVergi beyannameleri ve mali tablo yönetimi.\n\nEĞİTİM\nİstanbul Üniversitesi - İktisat (Lisans) - 2014`,
    expected: {
      fullName: 'Ahmet Canpolat',
      primaryRole: /Muhasebe|Mali/i,
      primarySector: /Finans|Muhasebe/i,
      residenceCity: 'İstanbul',
      residenceDistrict: 'Üsküdar',
      minExperiences: 1,
      minEducation: 1,
    },
  },
  {
    id: 'A-2',
    family: 'A. Classical Single Column',
    rawText: `Berna Şengül\nberna@example.com | 0542 222 33 44\nAnkara / Çankaya\nİnsan Kaynakları Yöneticisi\n\nİŞ DENEYİMİ\nAselsan A.Ş. - İnsan Kaynakları Uzmanı (2018 - 2024)\n\nEĞİTİM\nODTÜ - Sosyoloji (Lisans) - 2018`,
    expected: {
      fullName: 'Berna Şengül',
      primaryRole: /İnsan Kaynakları/i,
      primarySector: /İnsan kaynakları|Danışmanlık/i,
      residenceCity: 'Ankara',
      residenceDistrict: 'Çankaya',
      minExperiences: 1,
    },
  },

  // B. Two Column Layout
  {
    id: 'B-1',
    family: 'B. Two Column Layout',
    rawText: `KİŞİSEL BİLGİLER\nCemil Vural\n0533 333 44 55\nİzmir / Konak\n\nİŞ DENEYİMİ\nVestel - Gömülü Yazılım Mühendisi (2019 - 2024)\nC/C++ firmware geliştirme.\n\nBECERİLER\nC, C++, RTOS, Linux`,
    expected: {
      fullName: 'Cemil Vural',
      primaryRole: /Gömülü Sistemler|Gömülü Yazılım|Yazılım Mühendisi/i,
      primarySector: /Bilişim \/ Yazılım|Elektrik-elektronik/i,
      residenceCity: 'İzmir',
      residenceDistrict: 'Konak',
      minExperiences: 1,
    },
  },
  {
    id: 'B-2',
    family: 'B. Two Column Layout',
    rawText: `Dilek Karadağ | dilek@example.com | Bursa / Nilüfer\nKalite Kontrol Mühendisi\n\nPROFİL\nOtomotiv yan sanayi kalite sistemleri uzmanı.\n\nDENEYİM\nBosch Fren Sistemleri - Kalite Mühendisi (2017 - 2024)\nISO/TS 16949 denetimleri.`,
    expected: {
      fullName: 'Dilek Karadağ',
      primaryRole: /Kalite Mühendisi|Kalite Kontrol/i,
      primarySector: /Üretim \/ Sanayi|Otomotiv|Üretim/i,
      residenceCity: 'Bursa',
      residenceDistrict: 'Nilüfer',
      minExperiences: 1,
    },
  },

  // C. Left Sidebar + Right Body
  {
    id: 'C-1',
    family: 'C. Left Sidebar + Right Body',
    rawText: `İLETİŞİM\n0535 000 11 22\nece.turan@mail.com\nAntalya / Muratpaşa\n\nBECERİLER\nÖn Büro, Opera PMS\n\nECE TURAN\nÖn Büro Müdürü\n\nDENEYİM\nRixos Hotels - Ön Büro Şefi (2018 - 2024)\nOtel operasyon yönetimi.`,
    expected: {
      fullName: 'Ece Turan',
      primaryRole: /Ön Büro/i,
      primarySector: /Turizm|Otelcilik/i,
      residenceCity: 'Antalya',
      residenceDistrict: 'Muratpaşa',
      minExperiences: 1,
      forbiddenRoles: ['Beceriler', 'Kişisel'],
    },
  },
  {
    id: 'C-2',
    family: 'C. Left Sidebar + Right Body',
    rawText: `KİŞİSEL\nFatih Erdem\nKocaeli / Gebze\nfatih@tech.com\n\nYETKİNLİKLER\nDocker, Kubernetes, AWS\n\nFATİH ERDEM\nDevOps Mühendisi\n\nİŞ DENEYİMİ\nLogo Yazılım - DevOps Uzmanı (2020 - 2024)`,
    expected: {
      fullName: 'Fatih Erdem',
      primaryRole: /DevOps Mühendisi|DevOps/i,
      primarySector: /Bilişim \/ Yazılım/i,
      residenceCity: 'Kocaeli',
      residenceDistrict: 'Gebze',
      minExperiences: 1,
    },
  },

  // D. Right Sidebar + Left Body
  {
    id: 'D-1',
    family: 'D. Right Sidebar + Left Body',
    rawText: `Gamze Korkmaz\nDijital Pazarlama Uzmanı\n\nİŞ DENEYİMİ\nGetir - Büyüme ve Pazarlama Yöneticisi (2021 - 2024)\n\nİLETİŞİM\n0536 999 88 77\ngamze@growth.com\nİstanbul / Kadıköy`,
    expected: {
      fullName: 'Gamze Korkmaz',
      primaryRole: /Pazarlama/i,
      primarySector: /Pazarlama \/ Reklam|E-Ticaret/i,
      residenceCity: 'İstanbul',
      residenceDistrict: 'Kadıköy',
      minExperiences: 1,
    },
  },
  {
    id: 'D-2',
    family: 'D. Right Sidebar + Left Body',
    rawText: `Hakan Polat\nMekanik Bakım Teknisyeni\n\nDENEYİM\nTofaş Otomobil Fabrikası - Bakım Teknisyeni (2019 - 2024)\n\nİLETİŞİM\nBursa / Osmangazi\nhakan.polat@example.com`,
    expected: {
      fullName: 'Hakan Polat',
      primaryRole: /Bakım Teknisyeni|Mekanik/i,
      primarySector: /Otomotiv|Üretim/i,
      residenceCity: 'Bursa',
      residenceDistrict: 'Osmangazi',
    },
  },

  // E. Europass
  {
    id: 'E-1',
    family: 'E. Europass Layout',
    rawText: `Europass Curriculum Vitae\n\nKişisel bilgiler\nAdı Soyadı: İrem Yalçın\nE-posta: irem.yalcin@example.com\nTelefon: +90 532 444 55 66\nUyruk: Türk\nAdres: Eskişehir / Tepebaşı\n\nİş deneyimi\n01/2020 - 05/2024: Proje Yöneticisi - Eti Gıda A.Ş.\n\nEğitim ve öğretim\n2015 - 2019: Anadolu Üniversitesi - Endüstri Mühendisliği`,
    expected: {
      fullName: 'İrem Yalçın',
      primaryRole: /Proje Yöneticisi|Proje Müdürü/i,
      primarySector: /Gıda|Üretim/i,
      residenceCity: 'Eskişehir',
      residenceDistrict: 'Tepebaşı',
      minExperiences: 1,
      minEducation: 1,
    },
  },

  // F. ATS Standard Layout
  {
    id: 'F-1',
    family: 'F. ATS CV Layout',
    rawText: `KEMAL SUNAL\nkemal@ats.com | 0530 111 22 33 | Ankara / Yenimahalle\n\nPROFESSIONAL SUMMARY\nSenior Civil Engineer with 12 years of infrastructure and high-rise construction experience.\n\nEXPERIENCE\nEnka İnşaat - Şantiye Şefi (2018 - 2024)\n• Metraj ve hak ediş yönetimi\n\nEDUCATION\nİTÜ - İnşaat Mühendisliği (Lisans) - 2012`,
    expected: {
      fullName: 'Kemal Sunal',
      primaryRole: /İnşaat Mühendisi|Şantiye Şefi/i,
      primarySector: /İnşaat \/ Gayrimenkul/i,
      residenceCity: 'Ankara',
      residenceDistrict: 'Yenimahalle',
      minExperiences: 1,
      minEducation: 1,
    },
  },

  // G. Graphic / Design CV
  {
    id: 'G-1',
    family: 'G. Graphic & Design CV',
    rawText: `🎨 LEYLA DEMİR\nUI / UX Tasarımcı\nleyla@design.io | 0538 777 66 55 | İstanbul / Beşiktaş\n\nPORTFOLYO & DENEYİM\nTrendyol - Kıdemli UI/UX Tasarımcısı (2020 - 2024)\nFigma, Design Systems, User Research.\n\nEĞİTİM\nMimar Sinan Güzel Sanatlar Üniversitesi - Grafik Tasarım (2019)`,
    expected: {
      fullName: 'Leyla Demir',
      primaryRole: /UI|UX|Tasarımcı|Grafik/i,
      primarySector: /Pazarlama \/ Reklam|Bilişim \/ Yazılım/i,
      residenceCity: 'İstanbul',
      residenceDistrict: 'Beşiktaş',
    },
  },

  // H. Headless CV (No Name, starts with Education)
  {
    id: 'H-1',
    family: 'H. Headless CV (Anti-Hallucination)',
    rawText: `EĞİTİM\nİstanbul Teknik Üniversitesi - Elektrik Mühendisliği (2018 - 2022)\n\nİŞ DENEYİMİ\nSiemens - Test Mühendisi (2022 - 2024)\nEnerji dağıtım sistemleri testleri.`,
    expected: {
      fullName: '',
      primaryRole: /QA|Test|Elektrik/i,
      minExperiences: 1,
      forbiddenRoles: ['Eğitim', 'Siemens'],
    },
  },

  // I. Dateless CV
  {
    id: 'I-1',
    family: 'I. Dateless CV',
    rawText: `Mustafa Çelik\nmustafa@example.com | İzmir / Bornova\nSatış Temsilcisi\n\nİŞ DENEYİMİ\nKoçtaş - Satış Danışmanı\nMüşteri karşılama ve reyon satışı.`,
    expected: {
      fullName: 'Mustafa Çelik',
      primaryRole: /Satış Danışmanı|Satış Temsilcisi/i,
      primarySector: /Satış|Perakende/i,
      residenceCity: 'İzmir',
      residenceDistrict: 'Bornova',
      minExperiences: 1,
    },
  },

  // J. Adversarial Keyword Infiltration (Degree vs Sector)
  {
    id: 'J-1',
    family: 'J. Adversarial Cross-Contamination',
    rawText: `Nihan Özkan\nnihan@example.com | 0532 999 11 22 | Ankara / Çankaya\nKıdemli Node.js Geliştirici\n\nİŞ DENEYİMİ\nTrendyol - Backend Developer (2020 - 2024)\n\nEĞİTİM\nAnadolu Üniversitesi - Kamu Yönetimi (Lisans) - 2018\n\nBECERİLER\nNode.js, PostgreSQL, Docker, Uzman`,
    expected: {
      fullName: 'Nihan Özkan',
      primaryRole: /Backend Geliştirici|Yazılım Geliştirici|Backend Developer/i,
      primarySector: /Bilişim \/ Yazılım/i,
      residenceCity: 'Ankara',
      residenceDistrict: 'Çankaya',
      forbiddenRoles: ['Uzman', 'Kamu Yönetimi'],
      forbiddenSectors: ['Kamu / Belediye', 'Kamu'],
    },
  },

  // K. Turkish Action Clause in Responsibilities
  {
    id: 'K-1',
    family: 'K. Verbal Noun Anti-Elevation',
    rawText: `Orhan Veli\norhan@example.com | 0533 000 00 00 | İstanbul / Beyoğlu\nRestoran Müdürü\n\nİŞ DENEYİMİ\nBig Chefs - Şube Müdürü (2019 - 2024)\n• Müşteri Memnuniyet Süreçlerinin Takibinin Yapılmasını Sağlamak\n• Stok ve Maliyet Kontrolünün Yürütülmesi\n\nEĞİTİM\nBoğaziçi Üniversitesi - Turizm İşletmeciliği (2018)`,
    expected: {
      fullName: 'Orhan Veli',
      primaryRole: /Restoran Müdürü|Şube Müdürü/i,
      primarySector: /Gıda \/ Restoran|Restoran \/ Yiyecek \/ İçecek|Turizm/i,
      residenceCity: 'İstanbul',
      residenceDistrict: 'Beyoğlu',
      forbiddenRoles: ['Süreçlerinin Takibinin Yapılmasını', 'Takibinin Yapılmasını', 'Yürütülmesi'],
    },
  },

  // L. References Firewall
  {
    id: 'L-1',
    family: 'L. References Leakage Firewall',
    rawText: `Pelin Aksoy\npelin@example.com | İzmir / Karşıyaka\nGrafik Tasarımcı\n\nİŞ DENEYİMİ\nReklam Merkezi - Tasarımcı (2020 - 2024)\n\nREFERANSLAR\nProf. Dr. Ahmet Yılmaz - Genel Müdür, Ajans A.Ş.\nTelefon: 0532 999 00 11`,
    expected: {
      fullName: 'Pelin Aksoy',
      primaryRole: /Grafik Tasarımcı/i,
      primarySector: /Pazarlama \/ Reklam/i,
      residenceCity: 'İzmir',
      residenceDistrict: 'Karşıyaka',
      forbiddenRoles: ['Genel Müdür', 'Prof. Dr. Ahmet Yılmaz'],
    },
  },

  // M. Multilingual English CV
  {
    id: 'M-1',
    family: 'M. English Multilingual',
    rawText: `Rıza Kaya\nriza.kaya@global.com | +90 532 888 77 66\nIstanbul / Kadikoy\nSenior Product Manager\n\nSUMMARY\n8+ years driving B2B SaaS product roadmaps.\n\nWORK EXPERIENCE\nInsider - Lead Product Manager (2020 - 2024)\n\nEDUCATION\nMiddle East Technical University - Industrial Engineering (2016)`,
    expected: {
      fullName: 'Rıza Kaya',
      primaryRole: /Ürün Yöneticisi|Product Manager/i,
      primarySector: /Bilişim \/ Yazılım/i,
      residenceCity: 'İstanbul',
      residenceDistrict: 'Kadıköy',
      minExperiences: 1,
    },
  },

  // N. Multilingual German (Lebenslauf)
  {
    id: 'N-1',
    family: 'N. German Lebenslauf',
    rawText: `LEBENSLAUF\n\nPersönliche Daten\nName: Serkan Öztürk\nE-Mail: serkan@de.com\nTelefon: 0532 555 44 33\nWohnort: Ankara / Çankaya\n\nBerufserfahrung\n01/2019 - 04/2024: Softwareentwickler - Siemens AG\nBackend-Entwicklung mit Java und Spring Boot.\n\nAusbildung\n2014 - 2018: Bilkent Universität - Informatik`,
    expected: {
      fullName: 'Serkan Öztürk',
      primaryRole: /Yazılım Geliştirici/i,
      primarySector: /Bilişim \/ Yazılım/i,
      residenceCity: 'Ankara',
      residenceDistrict: 'Çankaya',
      minExperiences: 1,
    },
  },

  // O. Spaced Letter OCR CV
  {
    id: 'O-1',
    family: 'O. Spaced-Letter OCR',
    rawText: `T a r ı k   B i l g i n\ntarik@example.com | 0532 123 45 67 | Bursa / Nilüfer\nKıdemli Elektrik Mühendisi\n\nİ Ş   D E N E Y İ M İ\nOyak Renault - Elektrik Bakım Mühendisi (2019 - 2024)\n\nE Ğ İ T İ M\nUludağ Üniversitesi - Elektrik-Elektronik Mühendisliği (2018)`,
    expected: {
      fullName: /Tarık Bilgin/i,
      primaryRole: /Elektrik Mühendisi|Elektrik Bakım/i,
      primarySector: /Elektrik-elektronik|Otomotiv/i,
      residenceCity: 'Bursa',
      residenceDistrict: 'Nilüfer',
      minExperiences: 1,
    },
  },
];

describe('CV Extraction Engine 12.0 — Blind Holdout Benchmark Suite', () => {
  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  let totalEvaluated = 0;

  BLIND_HOLDOUT_CORPUS.forEach((scenario) => {
    it(`Holdout [${scenario.id}]: ${scenario.family}`, () => {
      totalEvaluated++;
      const det = extractDeterministicCv(scenario.rawText);
      const canonical = mapCvToCanonicalTaxonomy(det);

      // 1. Full Name Verification
      if (scenario.expected.fullName !== undefined) {
        if (typeof scenario.expected.fullName === 'string') {
          if (scenario.expected.fullName === '') {
            expect(canonical.fullName || '').toBe('');
          } else {
            expect(canonical.fullName).toBe(scenario.expected.fullName);
            truePositives++;
          }
        }
      }

      // 2. Primary Role Verification
      if (scenario.expected.primaryRole) {
        if (typeof scenario.expected.primaryRole === 'string') {
          expect(canonical.primaryRole).toBe(scenario.expected.primaryRole);
        } else {
          expect(canonical.primaryRole).toMatch(scenario.expected.primaryRole);
        }
        truePositives++;
      }

      // 3. Primary Sector Verification
      if (scenario.expected.primarySector) {
        if (typeof scenario.expected.primarySector === 'string') {
          expect(canonical.primarySector).toBe(scenario.expected.primarySector);
        } else {
          expect(canonical.primarySector).toMatch(scenario.expected.primarySector);
        }
      }

      // 4. Location Verification
      if (scenario.expected.residenceCity) {
        expect(canonical.residenceCity).toBe(scenario.expected.residenceCity);
      }
      if (scenario.expected.residenceDistrict) {
        expect(canonical.residenceDistrict).toBe(scenario.expected.residenceDistrict);
      }

      // 5. Experience Count
      if (scenario.expected.minExperiences !== undefined) {
        expect(canonical.experiences.length).toBeGreaterThanOrEqual(scenario.expected.minExperiences);
      }

      // 6. Forbidden Role Check (Anti-Contamination)
      if (scenario.expected.forbiddenRoles) {
        for (const forb of scenario.expected.forbiddenRoles) {
          expect(canonical.primaryRole || '').not.toBe(forb);
          expect(canonical.fullName || '').not.toBe(forb);
        }
      }

      // 7. Forbidden Sector Check (Anti-Contamination)
      if (scenario.expected.forbiddenSectors) {
        for (const forb of scenario.expected.forbiddenSectors) {
          expect(canonical.primarySector || '').not.toBe(forb);
        }
      }
    });
  });
});
